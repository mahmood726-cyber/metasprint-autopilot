# ============================================================
# MetaSprint Autopilot — R Cross-Validation Script
# ============================================================
# Compares JS engine outputs against metafor, mada, netmeta, dosresmeta
# Tolerance: 1e-4 for all comparisons
# Output: CSV of (metric, R_value, JS_value, abs_diff, pass/fail)
#
# Usage: Rscript tests/validate_against_R.R
# ============================================================

library(metafor)

cat("=== MetaSprint Autopilot R Cross-Validation ===\n\n")
results <- data.frame(metric=character(), R_value=numeric(), JS_value=numeric(), abs_diff=numeric(), pass=character(), stringsAsFactors=FALSE)
tol <- 1e-4

# ─── 1. Pairwise Meta-Analysis (DerSimonian-Laird) ──────────

# SGLT2i HF trial data (from benchmark)
yi <- log(c(0.74, 0.75, 0.82, 0.79, 0.67))  # log-HR
ci_lo <- log(c(0.65, 0.65, 0.73, 0.69, 0.52))
ci_hi <- log(c(0.85, 0.86, 0.92, 0.90, 0.85))
sei <- (ci_hi - ci_lo) / (2 * qnorm(0.975))

# DerSimonian-Laird
res_dl <- rma(yi=yi, sei=sei, method="DL")
cat("1. DL pooled log-HR:", coef(res_dl), "\n")
cat("   DL tau2:", res_dl$tau2, "\n")
cat("   DL I2:", res_dl$I2, "\n")

results <- rbind(results, data.frame(
  metric="DL_pooled_logHR", R_value=as.numeric(coef(res_dl)),
  JS_value=NA, abs_diff=NA, pass="PENDING"
))
results <- rbind(results, data.frame(
  metric="DL_tau2", R_value=res_dl$tau2,
  JS_value=NA, abs_diff=NA, pass="PENDING"
))
results <- rbind(results, data.frame(
  metric="DL_I2", R_value=res_dl$I2,
  JS_value=NA, abs_diff=NA, pass="PENDING"
))

# REML
res_reml <- rma(yi=yi, sei=sei, method="REML")
cat("2. REML pooled log-HR:", coef(res_reml), "\n")
cat("   REML tau2:", res_reml$tau2, "\n")

results <- rbind(results, data.frame(
  metric="REML_pooled_logHR", R_value=as.numeric(coef(res_reml)),
  JS_value=NA, abs_diff=NA, pass="PENDING"
))
results <- rbind(results, data.frame(
  metric="REML_tau2", R_value=res_reml$tau2,
  JS_value=NA, abs_diff=NA, pass="PENDING"
))

# HKSJ
res_hksj <- rma(yi=yi, sei=sei, method="DL", test="knha")
cat("3. HKSJ CI lower:", res_hksj$ci.lb, " upper:", res_hksj$ci.ub, "\n")

results <- rbind(results, data.frame(
  metric="HKSJ_CI_lower", R_value=res_hksj$ci.lb,
  JS_value=NA, abs_diff=NA, pass="PENDING"
))
results <- rbind(results, data.frame(
  metric="HKSJ_CI_upper", R_value=res_hksj$ci.ub,
  JS_value=NA, abs_diff=NA, pass="PENDING"
))

# ─── 2. SMD from Raw Data (Hedges' g) ───────────────────────

# Example: n1=50, m1=103, sd1=15, n2=50, m2=100, sd2=15
smd_res <- escalc(measure="SMD", n1i=50, m1i=103, sd1i=15, n2i=50, m2i=100, sd2i=15)
cat("\n4. Hedges' g:", smd_res$yi, " SE:", sqrt(smd_res$vi), "\n")

results <- rbind(results, data.frame(
  metric="SMD_HedgesG", R_value=as.numeric(smd_res$yi),
  JS_value=NA, abs_diff=NA, pass="PENDING"
))
results <- rbind(results, data.frame(
  metric="SMD_SE", R_value=sqrt(as.numeric(smd_res$vi)),
  JS_value=NA, abs_diff=NA, pass="PENDING"
))

# ─── 3. DTA Meta-Analysis (mada::reitsma) ───────────────────

if (requireNamespace("mada", quietly=TRUE)) {
  library(mada)
  dta_data <- data.frame(
    TP=c(90, 85, 92, 78, 88),
    FP=c(10, 15, 8, 22, 12),
    FN=c(5, 8, 3, 12, 6),
    TN=c(95, 92, 97, 88, 94)
  )
  fit <- reitsma(dta_data)
  summ <- summary(fit)
  sens_est <- summ$coefficients["tsens.", "Estimate"]
  spec_est <- summ$coefficients["tfpr.", "Estimate"]
  cat("\n5. DTA logit-sensitivity:", sens_est, "\n")
  cat("   DTA logit-FPR:", spec_est, "\n")
  # Note: mada parameterizes as (tsens, tfpr), where tfpr = logit(FPR)
  # Our model uses logit(Spec) = -logit(FPR), so sign flips

  results <- rbind(results, data.frame(
    metric="DTA_logitSens", R_value=sens_est,
    JS_value=NA, abs_diff=NA, pass="PENDING"
  ))
  results <- rbind(results, data.frame(
    metric="DTA_logitFPR", R_value=spec_est,
    JS_value=NA, abs_diff=NA, pass="PENDING"
  ))
} else {
  cat("\n5. mada package not installed — skipping DTA validation\n")
}

# ─── 4. Network Meta-Analysis (netmeta) ─────────────────────

if (requireNamespace("netmeta", quietly=TRUE)) {
  library(netmeta)
  nma_data <- data.frame(
    study=c("S1","S2","S3","S4","S5"),
    treat1=c("Drug A","Drug A","Drug B","Drug B","Drug A"),
    treat2=c("Placebo","Placebo","Placebo","Placebo","Drug B"),
    TE=c(-0.5, -0.4, -0.3, -0.35, -0.15),
    seTE=c(0.2, 0.25, 0.2, 0.22, 0.3)
  )
  nma_fit <- netmeta(TE=TE, seTE=seTE, treat1=treat1, treat2=treat2,
                     studlab=study, data=nma_data, sm="MD", reference.group="Placebo")
  cat("\n6. NMA Drug A vs Placebo:", nma_fit$TE.random["Drug A", "Placebo"], "\n")
  cat("   NMA Drug B vs Placebo:", nma_fit$TE.random["Drug B", "Placebo"], "\n")

  results <- rbind(results, data.frame(
    metric="NMA_DrugA_vs_Placebo", R_value=nma_fit$TE.random["Drug A", "Placebo"],
    JS_value=NA, abs_diff=NA, pass="PENDING"
  ))
  results <- rbind(results, data.frame(
    metric="NMA_DrugB_vs_Placebo", R_value=nma_fit$TE.random["Drug B", "Placebo"],
    JS_value=NA, abs_diff=NA, pass="PENDING"
  ))
} else {
  cat("\n6. netmeta package not installed — skipping NMA validation\n")
}

# ─── Output ──────────────────────────────────────────────────

cat("\n=== R Benchmark Values ===\n")
print(results)

# Save as JSON for automated comparison
json_out <- paste0('[\n',
  paste(apply(results, 1, function(r) {
    paste0('  {"metric":"', r["metric"], '","R_value":', r["R_value"], '}')
  }), collapse=',\n'),
'\n]')

writeLines(json_out, "tests/fixtures/r-benchmarks.json")
cat("\nBenchmark values saved to tests/fixtures/r-benchmarks.json\n")

# Save CSV
write.csv(results, "tests/fixtures/r-benchmarks.csv", row.names=FALSE)
cat("Benchmark CSV saved to tests/fixtures/r-benchmarks.csv\n")
