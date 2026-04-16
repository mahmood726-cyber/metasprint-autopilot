##############################################################################
# R metafor Cross-Validation of MetaSprint Autopilot Oracle (291 Reviews)
#
# Reads the oracle results from sealed_oracle/oracle_results.json,
# re-parses the raw Cochrane CSVs, computes DL + REML via metafor::rma(),
# and outputs per-review + summary agreement statistics.
#
# Output: reports/r_metafor_crossval.json
##############################################################################

suppressMessages(library(metafor))
suppressMessages(library(jsonlite))

# ---- Paths ----
# Robust script directory detection for Rscript
.get_script_dir <- function() {
  # Method 1: commandArgs (works with Rscript)
  args <- commandArgs(trailingOnly = FALSE)
  file_arg <- grep("^--file=", args, value = TRUE)
  if (length(file_arg) > 0) {
    return(normalizePath(dirname(sub("^--file=", "", file_arg[1])), winslash = "/"))
  }
  # Method 2: sys.frame (works in source())
  for (i in seq_len(sys.nframe())) {
    ofile <- tryCatch(sys.frame(i)$ofile, error = function(e) NULL)
    if (!is.null(ofile)) {
      return(normalizePath(dirname(ofile), winslash = "/"))
    }
  }
  # Fallback: working directory
  return(normalizePath(".", winslash = "/"))
}
SCRIPT_DIR <- .get_script_dir()
ORACLE_PATH <- file.path(SCRIPT_DIR, "sealed_oracle", "oracle_results.json")
CSV_DIR <- Sys.getenv("COCHRANE_PAIRWISE_DIR",
                       unset = "C:/CochraneData/pairwise")
REPORT_DIR <- file.path(SCRIPT_DIR, "reports")
dir.create(REPORT_DIR, showWarnings = FALSE, recursive = TRUE)

# ---- Helpers ----

#' Find the data-rows CSV file for a given CD number
find_csv <- function(csv_dir, cd_number) {
  pattern <- paste0("*", cd_number, "*data-rows.csv")
  matches <- Sys.glob(file.path(csv_dir, pattern))
  if (length(matches) == 0) {
    pattern2 <- paste0("*", cd_number, "*.csv")
    matches <- Sys.glob(file.path(csv_dir, pattern2))
  }
  # Prefer shortest filename (most likely the main data file)
  if (length(matches) > 0) {
    matches <- matches[order(nchar(basename(matches)))]
    return(matches[1])
  }
  return(NULL)
}


#' Parse binary studies: compute log(OR) and SE from 2x2 table
#' with 0.5 continuity correction for zero cells
compute_binary_studies <- function(rows) {
  studies <- data.frame(study = character(), yi = numeric(), sei = numeric(),
                        stringsAsFactors = FALSE)
  seen <- character()

  for (i in seq_len(nrow(rows))) {
    study_name <- trimws(as.character(rows$Study[i]))
    if (study_name == "" || study_name %in% seen) next

    ee <- suppressWarnings(as.numeric(rows$`Experimental cases`[i]))
    en <- suppressWarnings(as.numeric(rows$`Experimental N`[i]))
    ce <- suppressWarnings(as.numeric(rows$`Control cases`[i]))
    cn <- suppressWarnings(as.numeric(rows$`Control N`[i]))

    if (any(is.na(c(ee, en, ce, cn)))) next
    if (en <= 0 || cn <= 0) next
    # Exclude double-zero
    if (ee == 0 && ce == 0) next

    a <- ee; b <- en - ee; c_val <- ce; d <- cn - ce
    needs_cc <- (a == 0 || b == 0 || c_val == 0 || d == 0)
    if (needs_cc) {
      a <- a + 0.5; b <- b + 0.5; c_val <- c_val + 0.5; d <- d + 0.5
    }
    if (a <= 0 || b <= 0 || c_val <= 0 || d <= 0) next

    log_or <- log((a * d) / (b * c_val))
    se <- sqrt(1/a + 1/b + 1/c_val + 1/d)

    seen <- c(seen, study_name)
    studies <- rbind(studies, data.frame(study = study_name, yi = log_or,
                                         sei = se, stringsAsFactors = FALSE))
  }
  return(studies)
}


#' Parse continuous studies: compute MD and SE from mean/SD/N
compute_continuous_studies <- function(rows) {
  studies <- data.frame(study = character(), yi = numeric(), sei = numeric(),
                        stringsAsFactors = FALSE)
  seen <- character()

  for (i in seq_len(nrow(rows))) {
    study_name <- trimws(as.character(rows$Study[i]))
    if (study_name == "" || study_name %in% seen) next

    e_mean <- suppressWarnings(as.numeric(rows$`Experimental mean`[i]))
    e_sd   <- suppressWarnings(as.numeric(rows$`Experimental SD`[i]))
    e_n    <- suppressWarnings(as.numeric(rows$`Experimental N`[i]))
    c_mean <- suppressWarnings(as.numeric(rows$`Control mean`[i]))
    c_sd   <- suppressWarnings(as.numeric(rows$`Control SD`[i]))
    c_n    <- suppressWarnings(as.numeric(rows$`Control N`[i]))

    if (any(is.na(c(e_mean, e_sd, e_n, c_mean, c_sd, c_n)))) next
    if (e_n <= 0 || c_n <= 0 || e_sd <= 0 || c_sd <= 0) next

    md <- e_mean - c_mean
    se <- sqrt(e_sd^2 / e_n + c_sd^2 / c_n)
    if (se <= 0) next

    seen <- c(seen, study_name)
    studies <- rbind(studies, data.frame(study = study_name, yi = md,
                                         sei = se, stringsAsFactors = FALSE))
  }
  return(studies)
}


#' Parse GIV studies: use GIV Mean + GIV SE, fallback to Mean + CI
compute_giv_studies <- function(rows) {
  studies <- data.frame(study = character(), yi = numeric(), sei = numeric(),
                        stringsAsFactors = FALSE)
  seen <- character()

  for (i in seq_len(nrow(rows))) {
    study_name <- trimws(as.character(rows$Study[i]))
    if (study_name == "" || study_name %in% seen) next

    # Try GIV Mean + GIV SE first
    giv_mean <- suppressWarnings(as.numeric(rows$`GIV Mean`[i]))
    giv_se   <- suppressWarnings(as.numeric(rows$`GIV SE`[i]))

    if (!is.na(giv_mean) && !is.na(giv_se) && giv_se > 0) {
      seen <- c(seen, study_name)
      studies <- rbind(studies, data.frame(study = study_name, yi = giv_mean,
                                           sei = giv_se, stringsAsFactors = FALSE))
      next
    }

    # Fallback: Mean + CI start + CI end
    mean_val <- suppressWarnings(as.numeric(rows$Mean[i]))
    ci_lo    <- suppressWarnings(as.numeric(rows$`CI start`[i]))
    ci_hi    <- suppressWarnings(as.numeric(rows$`CI end`[i]))

    if (!is.na(mean_val) && !is.na(ci_lo) && !is.na(ci_hi) && ci_hi > ci_lo) {
      se <- (ci_hi - ci_lo) / (2 * 1.959964)
      if (se > 0) {
        seen <- c(seen, study_name)
        studies <- rbind(studies, data.frame(study = study_name, yi = mean_val,
                                             sei = se, stringsAsFactors = FALSE))
      }
    }
  }
  return(studies)
}


#' Parse a Cochrane CSV: filter to Analysis 1, no subgroup rows, auto-detect type
parse_cochrane_csv <- function(csv_path) {
  df <- tryCatch(
    read.csv(csv_path, stringsAsFactors = FALSE, fileEncoding = "UTF-8",
             check.names = FALSE),
    error = function(e) {
      # Retry with latin1
      tryCatch(
        read.csv(csv_path, stringsAsFactors = FALSE, fileEncoding = "latin1",
                 check.names = FALSE),
        error = function(e2) NULL
      )
    }
  )
  if (is.null(df) || nrow(df) == 0) return(NULL)

  # Filter to Analysis number == "1"
  if ("Analysis number" %in% names(df)) {
    df <- df[trimws(as.character(df$`Analysis number`)) == "1", ]
  }
  if (nrow(df) == 0) return(NULL)

  # Exclude subgroup rows (rows WITH a Subgroup number)
  if ("Subgroup number" %in% names(df)) {
    subg <- trimws(as.character(df$`Subgroup number`))
    df <- df[is.na(subg) | subg == "", ]
  }
  if (nrow(df) == 0) return(NULL)

  # Auto-detect type: binary > continuous > giv
  bin <- compute_binary_studies(df)
  if (nrow(bin) >= 2) return(list(studies = bin, data_type = "binary"))

  cont <- compute_continuous_studies(df)
  if (nrow(cont) >= 2) return(list(studies = cont, data_type = "continuous"))

  giv <- compute_giv_studies(df)
  if (nrow(giv) >= 2) return(list(studies = giv, data_type = "giv"))

  # Fallback: return whichever has most entries
  best <- list(bin, cont, giv)
  best_idx <- which.max(sapply(best, nrow))
  dtypes <- c("binary", "continuous", "giv")
  return(list(studies = best[[best_idx]], data_type = dtypes[best_idx]))
}


#' Compute Pearson r
pearson_r <- function(x, y) {
  n <- length(x)
  if (n < 3) return(NA_real_)
  cor(x, y, use = "complete.obs")
}


#' Lin's Concordance Correlation Coefficient
lins_ccc <- function(x, y) {
  n <- length(x)
  if (n < 3) return(NA_real_)
  mx <- mean(x); my <- mean(y)
  sx2 <- var(x); sy2 <- var(y)
  sxy <- cov(x, y)
  denom <- sx2 + sy2 + (mx - my)^2
  if (denom <= 0) return(NA_real_)
  2 * sxy / denom
}


#' Compute agreement statistics between two vectors
compute_agreement <- function(x, y, label = "") {
  n <- length(x)
  if (n < 3) return(list(n = n, label = label, error = "insufficient data"))

  abs_diffs <- abs(x - y)
  list(
    n = n,
    label = label,
    pearson_r = round(pearson_r(x, y), 8),
    lins_ccc = round(lins_ccc(x, y), 8),
    mean_absolute_diff = round(mean(abs_diffs), 8),
    max_absolute_diff = round(max(abs_diffs), 8),
    median_absolute_diff = round(median(abs_diffs), 8)
  )
}


# ===========================================================================
#  MAIN
# ===========================================================================

cat("======================================================================\n")
cat("R metafor Cross-Validation of MetaSprint Oracle (291 Reviews)\n")
cat("======================================================================\n\n")

# ---- Load oracle ----
if (!file.exists(ORACLE_PATH)) {
  stop(paste("Oracle not found:", ORACLE_PATH))
}
oracle <- fromJSON(ORACLE_PATH, simplifyVector = FALSE)
n_reviews <- length(oracle)
cat(sprintf("Oracle loaded: %d reviews\n", n_reviews))

if (!dir.exists(CSV_DIR)) {
  stop(paste("CSV directory not found:", CSV_DIR))
}

# ---- Process each review ----
per_review <- list()
n_processed <- 0
n_skipped <- 0
skip_reasons <- list()

# Collectors for agreement vectors
all_oracle_pooled <- numeric()
all_r_dl_pooled   <- numeric()
all_r_reml_pooled <- numeric()
all_oracle_tau2   <- numeric()
all_r_dl_tau2     <- numeric()
all_r_reml_tau2   <- numeric()
all_oracle_I2     <- numeric()
all_r_dl_I2       <- numeric()
all_r_reml_I2     <- numeric()
all_data_types    <- character()
all_review_names  <- character()

review_names <- names(oracle)
cat(sprintf("Processing %d reviews...\n\n", n_reviews))

for (idx in seq_along(review_names)) {
  rv_name <- review_names[idx]
  entry <- oracle[[rv_name]]

  if (idx %% 50 == 0) {
    cat(sprintf("  Progress: %d / %d\n", idx, n_reviews))
  }

  result <- tryCatch({
    cd_number <- entry$cd_number
    data_type <- entry$data_type
    is_ratio  <- isTRUE(entry$is_ratio)

    # Find CSV
    csv_path <- find_csv(CSV_DIR, cd_number)
    if (is.null(csv_path)) {
      n_skipped <<- n_skipped + 1
      skip_reasons[[length(skip_reasons) + 1]] <<- list(
        ds = rv_name, reason = "CSV not found"
      )
      return(NULL)
    }

    # Parse CSV
    parsed <- parse_cochrane_csv(csv_path)
    if (is.null(parsed) || nrow(parsed$studies) < 2) {
      n_skipped <<- n_skipped + 1
      skip_reasons[[length(skip_reasons) + 1]] <<- list(
        ds = rv_name, reason = "Parse failed or < 2 studies"
      )
      return(NULL)
    }

    studies <- parsed$studies
    k <- nrow(studies)

    # ---- Run metafor::rma DL ----
    dl_fit <- tryCatch(
      rma(yi = studies$yi, sei = studies$sei, method = "DL"),
      error = function(e) NULL,
      warning = function(w) {
        suppressWarnings(rma(yi = studies$yi, sei = studies$sei, method = "DL"))
      }
    )
    if (is.null(dl_fit)) {
      n_skipped <<- n_skipped + 1
      skip_reasons[[length(skip_reasons) + 1]] <<- list(
        ds = rv_name, reason = "metafor DL failed"
      )
      return(NULL)
    }

    # ---- Run metafor::rma REML ----
    reml_fit <- tryCatch(
      rma(yi = studies$yi, sei = studies$sei, method = "REML"),
      error = function(e) NULL,
      warning = function(w) {
        suppressWarnings(rma(yi = studies$yi, sei = studies$sei, method = "REML"))
      }
    )
    if (is.null(reml_fit)) {
      n_skipped <<- n_skipped + 1
      skip_reasons[[length(skip_reasons) + 1]] <<- list(
        ds = rv_name, reason = "metafor REML failed"
      )
      return(NULL)
    }

    # Extract R results
    r_dl_pooled  <- as.numeric(dl_fit$beta)
    r_dl_tau2    <- as.numeric(dl_fit$tau2)
    r_dl_I2      <- as.numeric(dl_fit$I2)
    r_dl_k       <- as.integer(dl_fit$k)

    r_reml_pooled <- as.numeric(reml_fit$beta)
    r_reml_tau2   <- as.numeric(reml_fit$tau2)
    r_reml_I2     <- as.numeric(reml_fit$I2)

    # Oracle values
    oracle_pooled <- entry$pooled_log
    oracle_tau2   <- entry$tau2
    oracle_I2     <- entry$I2
    oracle_k      <- entry$k

    # Differences (R DL vs Oracle DL)
    pooled_log_diff <- abs(r_dl_pooled - oracle_pooled)
    tau2_diff       <- abs(r_dl_tau2 - oracle_tau2)
    I2_diff         <- abs(r_dl_I2 - oracle_I2)
    k_match         <- (r_dl_k == oracle_k)

    # Accumulate for summary
    all_oracle_pooled <<- c(all_oracle_pooled, oracle_pooled)
    all_r_dl_pooled   <<- c(all_r_dl_pooled, r_dl_pooled)
    all_r_reml_pooled <<- c(all_r_reml_pooled, r_reml_pooled)
    all_oracle_tau2   <<- c(all_oracle_tau2, oracle_tau2)
    all_r_dl_tau2     <<- c(all_r_dl_tau2, r_dl_tau2)
    all_r_reml_tau2   <<- c(all_r_reml_tau2, r_reml_tau2)
    all_oracle_I2     <<- c(all_oracle_I2, oracle_I2)
    all_r_dl_I2       <<- c(all_r_dl_I2, r_dl_I2)
    all_r_reml_I2     <<- c(all_r_reml_I2, r_reml_I2)
    all_data_types    <<- c(all_data_types, data_type)
    all_review_names  <<- c(all_review_names, rv_name)
    n_processed       <<- n_processed + 1

    list(
      oracle_pooled_log = oracle_pooled,
      r_dl_pooled_log   = r_dl_pooled,
      r_reml_pooled_log = r_reml_pooled,
      oracle_tau2       = oracle_tau2,
      r_dl_tau2         = r_dl_tau2,
      r_reml_tau2       = r_reml_tau2,
      oracle_I2         = oracle_I2,
      r_dl_I2           = r_dl_I2,
      r_reml_I2         = r_reml_I2,
      oracle_k          = oracle_k,
      r_k               = r_dl_k,
      data_type         = data_type,
      cd_number         = cd_number,
      pooled_log_diff   = pooled_log_diff,
      tau2_diff         = tau2_diff,
      I2_diff           = I2_diff,
      k_match           = k_match,
      status            = ifelse(pooled_log_diff < 0.001 & k_match,
                                 "exact_match", "processed")
    )

  }, error = function(e) {
    n_skipped <<- n_skipped + 1
    skip_reasons[[length(skip_reasons) + 1]] <<- list(
      ds = rv_name, reason = paste("Error:", conditionMessage(e))
    )
    NULL
  })

  if (!is.null(result)) {
    per_review[[rv_name]] <- result
  }
}

cat(sprintf("\nProcessed: %d, Skipped: %d\n", n_processed, n_skipped))

# ---- Summary statistics ----
n_k_match <- sum(sapply(per_review, function(x) isTRUE(x$k_match)))
n_exact_pooled <- sum(sapply(per_review, function(x) x$pooled_log_diff < 0.001))
n_close_pooled <- sum(sapply(per_review, function(x) x$pooled_log_diff < 0.01))

cat(sprintf("\nk exact match:        %d / %d (%.1f%%)\n",
            n_k_match, n_processed, 100 * n_k_match / max(1, n_processed)))
cat(sprintf("pooled_log < 0.001:   %d / %d (%.1f%%)\n",
            n_exact_pooled, n_processed, 100 * n_exact_pooled / max(1, n_processed)))
cat(sprintf("pooled_log < 0.01:    %d / %d (%.1f%%)\n",
            n_close_pooled, n_processed, 100 * n_close_pooled / max(1, n_processed)))

# ---- Agreement: Oracle DL vs R DL ----
cat("\n--- Agreement: Oracle DL vs R metafor DL (all reviews) ---\n")
agree_pooled_dl <- compute_agreement(all_oracle_pooled, all_r_dl_pooled,
                                      "pooled_log: Oracle DL vs R DL")
agree_tau2_dl <- compute_agreement(all_oracle_tau2, all_r_dl_tau2,
                                    "tau2: Oracle DL vs R DL")
agree_I2_dl <- compute_agreement(all_oracle_I2, all_r_dl_I2,
                                  "I2: Oracle DL vs R DL")

cat(sprintf("  Pooled log: Pearson r = %.8f, CCC = %.8f, MAD = %.8f, MaxAD = %.8f\n",
            agree_pooled_dl$pearson_r, agree_pooled_dl$lins_ccc,
            agree_pooled_dl$mean_absolute_diff, agree_pooled_dl$max_absolute_diff))
cat(sprintf("  Tau2:       Pearson r = %.8f, CCC = %.8f, MAD = %.8f, MaxAD = %.8f\n",
            agree_tau2_dl$pearson_r, agree_tau2_dl$lins_ccc,
            agree_tau2_dl$mean_absolute_diff, agree_tau2_dl$max_absolute_diff))
cat(sprintf("  I2:         Pearson r = %.8f, CCC = %.8f, MAD = %.8f, MaxAD = %.8f\n",
            agree_I2_dl$pearson_r, agree_I2_dl$lins_ccc,
            agree_I2_dl$mean_absolute_diff, agree_I2_dl$max_absolute_diff))

# ---- Agreement: Oracle DL vs R REML ----
cat("\n--- Agreement: Oracle DL vs R metafor REML (all reviews) ---\n")
agree_pooled_reml <- compute_agreement(all_oracle_pooled, all_r_reml_pooled,
                                        "pooled_log: Oracle DL vs R REML")
agree_tau2_reml <- compute_agreement(all_oracle_tau2, all_r_reml_tau2,
                                      "tau2: Oracle DL vs R REML")
cat(sprintf("  Pooled log: Pearson r = %.8f, CCC = %.8f, MAD = %.8f\n",
            agree_pooled_reml$pearson_r, agree_pooled_reml$lins_ccc,
            agree_pooled_reml$mean_absolute_diff))
cat(sprintf("  Tau2:       Pearson r = %.8f, CCC = %.8f, MAD = %.8f\n",
            agree_tau2_reml$pearson_r, agree_tau2_reml$lins_ccc,
            agree_tau2_reml$mean_absolute_diff))

# ---- Stratified by data_type ----
cat("\n--- Stratified by data_type ---\n")
stratified <- list()
for (dtype in c("binary", "continuous", "giv")) {
  idx <- which(all_data_types == dtype)
  if (length(idx) < 3) {
    cat(sprintf("  %s: n=%d (too few for agreement stats)\n", dtype, length(idx)))
    stratified[[dtype]] <- list(n = length(idx), error = "insufficient data")
    next
  }
  ag <- compute_agreement(all_oracle_pooled[idx], all_r_dl_pooled[idx],
                           paste0("pooled_log: Oracle DL vs R DL (", dtype, ")"))
  cat(sprintf("  %s (n=%d): Pearson r = %.8f, CCC = %.8f, MAD = %.8f\n",
              dtype, length(idx), ag$pearson_r, ag$lins_ccc, ag$mean_absolute_diff))
  stratified[[dtype]] <- ag
}

# ---- Lin's CCC for pooled_log (already computed, repeat for emphasis) ----
cat(sprintf("\nLin's CCC (pooled_log, Oracle DL vs R DL): %.8f\n",
            agree_pooled_dl$lins_ccc))

# ---- Assemble output ----
output <- list(
  summary = list(
    n_oracle_reviews = n_reviews,
    n_processed = n_processed,
    n_skipped = n_skipped,
    n_k_match = n_k_match,
    n_exact_match_pooled_001 = n_exact_pooled,
    n_close_match_pooled_01 = n_close_pooled,
    pct_k_match = round(100 * n_k_match / max(1, n_processed), 2),
    pct_exact_pooled_001 = round(100 * n_exact_pooled / max(1, n_processed), 2)
  ),
  oracle_dl_vs_r_dl = list(
    pooled_log = agree_pooled_dl,
    tau2 = agree_tau2_dl,
    I2 = agree_I2_dl
  ),
  oracle_dl_vs_r_reml = list(
    pooled_log = agree_pooled_reml,
    tau2 = agree_tau2_reml
  ),
  stratified_by_data_type = stratified,
  per_review = per_review
)

if (length(skip_reasons) > 0) {
  output$skip_reasons <- skip_reasons[seq_len(min(50, length(skip_reasons)))]
}

# ---- Write output ----
report_path <- file.path(REPORT_DIR, "r_metafor_crossval.json")
write_json(output, report_path, pretty = TRUE, auto_unbox = TRUE, na = "null")

cat(sprintf("\nReport saved to: %s\n", report_path))
cat("Done.\n")
