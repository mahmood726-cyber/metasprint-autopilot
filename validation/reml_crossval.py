"""
REML Cross-Validation: Compares DerSimonian-Laird tau2 against REML tau2
on the same Cochrane study-level data used by the oracle.

Outputs agreement statistics (CCC, ICC, Bland-Altman, MAD) to
validation/reports/reml_crossval.json.
"""
import sys, os, io, json, math

# Windows UTF-8 safety
if hasattr(sys.stdout, 'buffer') and not isinstance(sys.stdout, io.TextIOWrapper):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# scipy imports — guard against WMI deadlock on Python 3.13 + Windows
import platform as _platform
if not hasattr(_platform, '_wmi_query_patched'):
    def _safe_wmi(*a, **kw):
        # Returns (version, product_type, ptype, spmajor, spminor)
        return ('10.0.26100', '1', 'Multiprocessor Free', '0', '0')
    _platform._wmi_query = _safe_wmi
    _platform._wmi_query_patched = True

from scipy.optimize import minimize_scalar

# Import oracle helpers (same directory)
_this_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, _this_dir)
from oracle_seal import (
    parse_cochrane_csv,
    compute_study_or,
    compute_study_md,
    dl_meta_analysis,
    find_csv_for_review,
)

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
from _paths import CSV_DIR
ORACLE_PATH = os.path.join(_this_dir, 'sealed_oracle', 'oracle_results.json')
REPORT_DIR = os.path.join(_this_dir, 'reports')

# ---------------------------------------------------------------------------
# REML estimation
# ---------------------------------------------------------------------------

def _reml_neg_log_likelihood(tau2, yi, vi):
    """
    Negative REML log-likelihood for random-effects model.

    REML_ll(tau2) = -0.5 * [ sum(log(vi + tau2))
                             + log(sum(1/(vi + tau2)))     -- determinant of X'WX
                             + sum(wi * (yi - mu_hat)^2) ]

    where wi = 1/(vi + tau2), mu_hat = sum(wi*yi) / sum(wi).

    We return the NEGATIVE so scipy can minimize it.
    """
    k = len(yi)
    total_vi = [v + tau2 for v in vi]

    # Guard: if any total variance is non-positive, return large penalty
    if any(tv <= 0 for tv in total_vi):
        return 1e30

    wi = [1.0 / tv for tv in total_vi]
    sum_wi = sum(wi)

    if sum_wi <= 0:
        return 1e30

    mu_hat = sum(w * y for w, y in zip(wi, yi)) / sum_wi

    # Term 1: sum of log(vi + tau2)
    term1 = sum(math.log(tv) for tv in total_vi)

    # Term 2: log(sum(1/(vi + tau2)))  =  log(sum_wi)
    term2 = math.log(sum_wi)

    # Term 3: weighted sum of squared residuals
    term3 = sum(w * (y - mu_hat) ** 2 for w, y in zip(wi, yi))

    # REML log-likelihood (we negate for minimization)
    neg_ll = 0.5 * (term1 + term2 + term3)
    return neg_ll


def reml_meta_analysis(studies, conf_level=0.95, is_ratio=False):
    """
    REML random-effects meta-analysis.

    studies: list of (label, yi, sei)
    Returns dict with pooled effect, CI, I2, tau2, Q, k.
    """
    k = len(studies)
    if k == 0:
        return None

    labels = [s[0] for s in studies]
    yi = [s[1] for s in studies]
    vi = [s[2] ** 2 for s in studies]

    # --- Fixed-effect Q statistic (needed for I2 and DL comparison) ---
    wi_fe = [1.0 / v for v in vi]
    sum_w_fe = sum(wi_fe)
    mu_fe = sum(w * y for w, y in zip(wi_fe, yi)) / sum_w_fe
    Q = sum(w * (y - mu_fe) ** 2 for w, y in zip(wi_fe, yi))
    df = k - 1

    # --- REML tau2 estimation ---
    if k < 2:
        tau2 = 0.0
    else:
        # Use DL estimate as initial bracket hint
        C = sum_w_fe - sum(w ** 2 for w in wi_fe) / sum_w_fe
        tau2_dl = max(0.0, (Q - df) / C) if C > 0 and df > 0 else 0.0

        # Upper bound for search: generous multiple of DL or variance-based
        tau2_upper = max(tau2_dl * 10.0, max(vi) * 10.0, 100.0)

        result = minimize_scalar(
            _reml_neg_log_likelihood,
            bounds=(0.0, tau2_upper),
            args=(yi, vi),
            method='bounded',
            options={'xatol': 1e-12, 'maxiter': 1000},
        )
        tau2 = max(0.0, result.x) if result.success else 0.0

        # If the minimum is at the boundary, check if the likelihood is
        # actually decreasing at zero (meaning tau2=0 is the MLE)
        ll_at_zero = _reml_neg_log_likelihood(0.0, yi, vi)
        ll_at_opt = _reml_neg_log_likelihood(tau2, yi, vi)
        if ll_at_zero <= ll_at_opt:
            tau2 = 0.0

    # --- Pooled estimate and CI using REML tau2 ---
    wi_re = [1.0 / (v + tau2) for v in vi]
    sum_w_re = sum(wi_re)
    mu_re = sum(w * y for w, y in zip(wi_re, yi)) / sum_w_re
    se_re = math.sqrt(1.0 / sum_w_re)

    # I2 from Q (same definition as DL)
    I2 = max(0.0, (Q - df) / Q * 100) if Q > df else 0.0

    # z-based CI
    alpha = 1 - conf_level
    z_crit = _normal_quantile(1 - alpha / 2)

    z_val = mu_re / se_re if se_re > 0 else 0
    p_value = 2 * (1 - _normal_cdf(abs(z_val)))

    if is_ratio:
        pooled = math.exp(mu_re)
        pooled_lo = math.exp(mu_re - z_crit * se_re)
        pooled_hi = math.exp(mu_re + z_crit * se_re)
    else:
        pooled = mu_re
        pooled_lo = mu_re - z_crit * se_re
        pooled_hi = mu_re + z_crit * se_re

    return {
        'k': k,
        'pooled_log': mu_re,
        'pooled_se': se_re,
        'pooled': pooled,
        'pooled_lo': pooled_lo,
        'pooled_hi': pooled_hi,
        'tau2': tau2,
        'I2': I2,
        'Q': Q,
        'df': df,
        'p_value': p_value,
        'study_labels': labels,
    }


# ---------------------------------------------------------------------------
# Normal CDF / quantile (re-use oracle_seal implementations)
# ---------------------------------------------------------------------------

def _normal_cdf(x):
    """Standard normal CDF (Abramowitz & Stegun approximation)."""
    if x < -8:
        return 0.0
    if x > 8:
        return 1.0
    t = 1 / (1 + 0.2316419 * abs(x))
    d = 0.3989422804014327
    p = d * math.exp(-x * x / 2) * (
        t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 +
        t * (-1.821255978 + t * 1.330274429))))
    )
    return 1 - p if x > 0 else p


def _normal_quantile(p):
    """Inverse normal CDF (Rational approximation, Abramowitz & Stegun 26.2.23)."""
    if p <= 0:
        return -8
    if p >= 1:
        return 8
    if p < 0.5:
        return -_normal_quantile(1 - p)
    t = math.sqrt(-2 * math.log(1 - p))
    c0, c1, c2 = 2.515517, 0.802853, 0.010328
    d1, d2, d3 = 1.432788, 0.189269, 0.001308
    return t - (c0 + c1 * t + c2 * t * t) / (1 + d1 * t + d2 * t * t + d3 * t * t * t)


# ---------------------------------------------------------------------------
# Agreement statistics
# ---------------------------------------------------------------------------

def lins_ccc(x, y):
    """
    Lin's Concordance Correlation Coefficient.
    CCC = 2 * rho * sx * sy / (sx^2 + sy^2 + (mx - my)^2)
    where rho = Pearson r, sx/sy = standard deviations, mx/my = means.
    """
    n = len(x)
    if n < 3:
        return None
    mx = sum(x) / n
    my = sum(y) / n
    sx2 = sum((xi - mx) ** 2 for xi in x) / (n - 1)
    sy2 = sum((yi - my) ** 2 for yi in y) / (n - 1)
    sxy = sum((xi - mx) * (yi - my) for xi, yi in zip(x, y)) / (n - 1)

    denom = sx2 + sy2 + (mx - my) ** 2
    if denom <= 0:
        return None
    ccc = 2 * sxy / denom
    return ccc


def icc_two_way_absolute(x, y):
    """
    ICC(2,1) two-way random, absolute agreement, single measures.
    Computed from paired measurements (each review measured by DL and REML).

    Uses the formulation:
        ICC = (MSR - MSE) / (MSR + MSC + (MSC - MSE) * k / n)
    where MSR = mean squares rows, MSC = mean squares columns, MSE = residual.

    For two raters (k=2):
        MSR = n * var(row_means) adjusted
        MSC = n * var(col_means) adjusted
        MSE = residual
    """
    n = len(x)
    if n < 3:
        return None

    k = 2  # two raters: DL and REML
    # Organize as n x k matrix
    grand_mean = (sum(x) + sum(y)) / (2 * n)

    # Row means (per review)
    row_means = [(xi + yi) / 2.0 for xi, yi in zip(x, y)]
    # Column means (per method)
    col_mean_x = sum(x) / n
    col_mean_y = sum(y) / n

    # SS between rows
    SSR = k * sum((rm - grand_mean) ** 2 for rm in row_means)
    # SS between columns
    SSC = n * sum((cm - grand_mean) ** 2 for cm in [col_mean_x, col_mean_y])
    # SS total
    SST = sum((xi - grand_mean) ** 2 for xi in x) + sum((yi - grand_mean) ** 2 for yi in y)
    # SS error (residual)
    SSE = SST - SSR - SSC

    df_r = n - 1
    df_c = k - 1
    df_e = df_r * df_c

    MSR = SSR / df_r if df_r > 0 else 0
    MSC = SSC / df_c if df_c > 0 else 0
    MSE = SSE / df_e if df_e > 0 else 0

    # ICC(2,1) absolute agreement
    denom = MSR + (k - 1) * MSE + k * (MSC - MSE) / n
    if denom <= 0:
        return None
    icc = (MSR - MSE) / denom
    return icc


def bland_altman(x, y):
    """
    Bland-Altman analysis for method agreement.
    Returns dict with mean_diff, sd_diff, loa_lower, loa_upper, pct_outside_loa.
    """
    n = len(x)
    if n < 2:
        return None

    diffs = [xi - yi for xi, yi in zip(x, y)]
    mean_diff = sum(diffs) / n
    sd_diff = math.sqrt(sum((d - mean_diff) ** 2 for d in diffs) / (n - 1)) if n > 1 else 0

    loa_lower = mean_diff - 1.96 * sd_diff
    loa_upper = mean_diff + 1.96 * sd_diff

    outside = sum(1 for d in diffs if d < loa_lower or d > loa_upper)
    pct_outside = outside / n * 100

    return {
        'mean_diff': mean_diff,
        'sd_diff': sd_diff,
        'loa_lower': loa_lower,
        'loa_upper': loa_upper,
        'n_outside_loa': outside,
        'pct_outside_loa': pct_outside,
    }


def compute_agreement(x, y, label=''):
    """Compute all agreement statistics between two paired vectors."""
    n = len(x)
    if n < 3:
        return {'n': n, 'error': 'insufficient data (n < 3)'}

    abs_diffs = [abs(xi - yi) for xi, yi in zip(x, y)]
    mad = sum(abs_diffs) / n
    max_ad = max(abs_diffs)

    # Pearson r
    mx = sum(x) / n
    my = sum(y) / n
    sxy = sum((xi - mx) * (yi - my) for xi, yi in zip(x, y))
    sx = math.sqrt(sum((xi - mx) ** 2 for xi in x))
    sy = math.sqrt(sum((yi - my) ** 2 for yi in y))
    pearson_r = sxy / (sx * sy) if sx > 0 and sy > 0 else None

    result = {
        'n': n,
        'label': label,
        'pearson_r': _round_safe(pearson_r, 6),
        'lins_ccc': _round_safe(lins_ccc(x, y), 6),
        'icc_2_1_absolute': _round_safe(icc_two_way_absolute(x, y), 6),
        'mean_absolute_diff': _round_safe(mad, 6),
        'max_absolute_diff': _round_safe(max_ad, 6),
    }

    ba = bland_altman(x, y)
    if ba is not None:
        result['bland_altman'] = {k: _round_safe(v, 6) for k, v in ba.items()}

    return result


def _round_safe(val, digits):
    """Round a value safely, returning None if input is None."""
    if val is None:
        return None
    return round(val, digits)


# ---------------------------------------------------------------------------
# Study-level data extraction (re-parse CSVs like oracle_seal does)
# ---------------------------------------------------------------------------

def extract_study_data(oracle_entry, csv_dir):
    """
    Re-parse the raw Cochrane CSV for a given oracle entry to obtain
    study-level yi and sei values.

    Returns list of (label, yi, sei) or None on failure.
    """
    cd_number = oracle_entry['cd_number']
    data_type = oracle_entry['data_type']
    is_ratio = oracle_entry.get('is_ratio', False)

    csvs = find_csv_for_review(csv_dir, cd_number)
    if not csvs:
        return None

    raw_studies, detected_type = parse_cochrane_csv(csvs[0], analysis_number='1')
    if len(raw_studies) < 2:
        return None

    meta_input = []

    if detected_type == 'binary':
        for s in raw_studies:
            result = compute_study_or(s['ee'], s['en'], s['ce'], s['cn'])
            if result:
                log_or, se, cc = result
                meta_input.append((s['study'], log_or, se))
    elif detected_type == 'continuous':
        for s in raw_studies:
            result = compute_study_md(
                s['e_mean'], s['e_sd'], s['en'],
                s['c_mean'], s['c_sd'], s['cn']
            )
            if result:
                md, se = result
                meta_input.append((s['study'], md, se))
    elif detected_type == 'giv':
        for s in raw_studies:
            meta_input.append((s['study'], s['effect'], s['se']))

    if len(meta_input) < 2:
        return None

    return meta_input


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    print('=' * 70)
    print('REML Cross-Validation: DL vs REML on Cochrane Oracle Data')
    print('=' * 70)

    # --- Load oracle ---
    if not os.path.isfile(ORACLE_PATH):
        print(f'ERROR: oracle_results.json not found at {ORACLE_PATH}')
        sys.exit(1)

    with open(ORACLE_PATH, 'r', encoding='utf-8') as fh:
        oracle = json.load(fh)

    print(f'Oracle loaded: {len(oracle)} reviews')

    if not os.path.isdir(CSV_DIR):
        print(f'ERROR: CSV directory not found at {CSV_DIR}')
        sys.exit(1)

    # --- Process each review ---
    per_review = {}
    skipped = 0
    errors = []

    # Collectors for agreement stats
    dl_pooled_all = []
    reml_pooled_all = []
    dl_tau2_all = []
    reml_tau2_all = []
    dl_i2_all = []
    reml_i2_all = []

    # Subset where oracle k matches Cochrane reference k
    dl_pooled_kmatch = []
    reml_pooled_kmatch = []
    cochrane_ref_kmatch = []
    dl_tau2_kmatch = []
    reml_tau2_kmatch = []
    k_mismatch_reasons = []

    n_total = len(oracle)
    for idx, (ds_name, entry) in enumerate(sorted(oracle.items()), 1):
        if idx % 50 == 0:
            print(f'  Processing {idx}/{n_total}...')

        # Re-parse study-level data from CSV
        study_data = extract_study_data(entry, CSV_DIR)
        if study_data is None:
            skipped += 1
            errors.append({'ds': ds_name, 'reason': 'CSV parse failed or < 2 studies'})
            continue

        is_ratio = entry.get('is_ratio', False)

        # DL analysis
        dl_result = dl_meta_analysis(study_data, is_ratio=is_ratio)
        if dl_result is None:
            skipped += 1
            errors.append({'ds': ds_name, 'reason': 'DL meta-analysis returned None'})
            continue

        # REML analysis
        reml_result = reml_meta_analysis(study_data, is_ratio=is_ratio)
        if reml_result is None:
            skipped += 1
            errors.append({'ds': ds_name, 'reason': 'REML meta-analysis returned None'})
            continue

        # Verify DL matches oracle (sanity check)
        dl_oracle_diff = abs(dl_result['pooled_log'] - entry['pooled_log'])
        if dl_oracle_diff > 1e-6:
            errors.append({
                'ds': ds_name,
                'reason': f'DL sanity mismatch: recomputed={dl_result["pooled_log"]:.8f} '
                          f'vs oracle={entry["pooled_log"]:.8f} (diff={dl_oracle_diff:.2e})'
            })
            # Still include it, but flag

        review_result = {
            'cd_number': entry['cd_number'],
            'data_type': entry['data_type'],
            'effect_type': entry['effect_type'],
            'is_ratio': is_ratio,
            'k': dl_result['k'],
            'dl_pooled_log': dl_result['pooled_log'],
            'reml_pooled_log': reml_result['pooled_log'],
            'dl_tau2': dl_result['tau2'],
            'reml_tau2': reml_result['tau2'],
            'dl_I2': dl_result['I2'],
            'reml_I2': reml_result['I2'],
            'dl_se': dl_result['pooled_se'],
            'reml_se': reml_result['pooled_se'],
            'dl_Q': dl_result['Q'],
            'pooled_diff_log': reml_result['pooled_log'] - dl_result['pooled_log'],
            'tau2_diff': reml_result['tau2'] - dl_result['tau2'],
        }

        # Cochrane reference cross-val (from oracle's cross_val block)
        cv = entry.get('cross_val', {})
        if cv:
            review_result['cochrane_ref_log'] = cv.get('ref_log_effect')
            review_result['cochrane_ref_k'] = cv.get('ref_k')
            review_result['oracle_k_matches_ref'] = cv.get('k_match', False)

        per_review[ds_name] = review_result

        # Accumulate for agreement
        dl_pooled_all.append(dl_result['pooled_log'])
        reml_pooled_all.append(reml_result['pooled_log'])
        dl_tau2_all.append(dl_result['tau2'])
        reml_tau2_all.append(reml_result['tau2'])
        dl_i2_all.append(dl_result['I2'])
        reml_i2_all.append(reml_result['I2'])

        # k-match subset (where our oracle k matches Cochrane diagnostics k)
        if cv.get('k_match', False):
            dl_pooled_kmatch.append(dl_result['pooled_log'])
            reml_pooled_kmatch.append(reml_result['pooled_log'])
            cochrane_ref_kmatch.append(cv.get('ref_log_effect', 0))
            dl_tau2_kmatch.append(dl_result['tau2'])
            reml_tau2_kmatch.append(reml_result['tau2'])
        else:
            oracle_k = dl_result['k']
            ref_k = cv.get('ref_k', '?')
            k_mismatch_reasons.append({
                'ds': ds_name,
                'oracle_k': oracle_k,
                'ref_k': ref_k,
                'reason': (
                    'Cochrane reference includes subgroups or different analysis filtering. '
                    f'Oracle parsed k={oracle_k} from Analysis 1 overall rows; '
                    f'Cochrane diagnostics reports k={ref_k} (likely includes subgroup rows '
                    'or uses a different analysis number).'
                ),
            })

    n_processed = len(per_review)
    print(f'\nProcessed: {n_processed}, Skipped: {skipped}')

    # --- Compute agreement: DL vs REML (all reviews) ---
    print('\n--- DL vs REML Agreement (all reviews) ---')
    agree_pooled = compute_agreement(dl_pooled_all, reml_pooled_all, label='pooled_log: DL vs REML')
    agree_tau2 = compute_agreement(dl_tau2_all, reml_tau2_all, label='tau2: DL vs REML')
    agree_i2 = compute_agreement(dl_i2_all, reml_i2_all, label='I2: DL vs REML')

    _print_agreement('Pooled log-effect (DL vs REML)', agree_pooled)
    _print_agreement('Tau-squared (DL vs REML)', agree_tau2)
    _print_agreement('I-squared (DL vs REML)', agree_i2)

    # --- K-match subset: DL vs Cochrane REML reference ---
    print(f'\n--- K-match subset: DL vs Cochrane REML reference ---')
    print(f'Reviews with k-match: {len(dl_pooled_kmatch)}/{n_processed}')

    agree_dl_cochrane = None
    agree_reml_cochrane = None
    if len(dl_pooled_kmatch) >= 3:
        agree_dl_cochrane = compute_agreement(
            dl_pooled_kmatch, cochrane_ref_kmatch,
            label='pooled_log: DL vs Cochrane REML (k-match subset)'
        )
        agree_reml_cochrane = compute_agreement(
            reml_pooled_kmatch, cochrane_ref_kmatch,
            label='pooled_log: Our REML vs Cochrane REML (k-match subset)'
        )
        _print_agreement('DL vs Cochrane REML (k-match)', agree_dl_cochrane)
        _print_agreement('Our REML vs Cochrane REML (k-match)', agree_reml_cochrane)

    # --- K-mismatch documentation ---
    n_mismatch = len(k_mismatch_reasons)
    print(f'\nK-mismatch reviews: {n_mismatch}')
    if n_mismatch > 0:
        print(f'  Common reason: Cochrane diagnostics often counts subgroup-level rows')
        print(f'  or uses different filtering; our oracle strictly parses Analysis 1 overall.')
        # Show a few examples
        for item in k_mismatch_reasons[:3]:
            print(f'  {item["ds"]}: oracle k={item["oracle_k"]}, ref k={item["ref_k"]}')

    # --- Assemble output ---
    output = {
        'summary': {
            'n_oracle_reviews': len(oracle),
            'n_processed': n_processed,
            'n_skipped': skipped,
            'n_k_match': len(dl_pooled_kmatch),
            'n_k_mismatch': n_mismatch,
        },
        'dl_vs_reml_all': {
            'pooled_log': agree_pooled,
            'tau2': agree_tau2,
            'I2': agree_i2,
        },
        'k_match_subset': {
            'n': len(dl_pooled_kmatch),
            'dl_vs_cochrane_reml': agree_dl_cochrane,
            'our_reml_vs_cochrane_reml': agree_reml_cochrane,
        },
        'k_mismatch_documentation': {
            'n_mismatch': n_mismatch,
            'general_reason': (
                'Cochrane diagnostics reference counts may include subgroup-level rows '
                'or use different analysis filtering. Our oracle strictly parses only '
                'Analysis 1 overall (non-subgroup) rows, leading to different k values.'
            ),
            'examples': k_mismatch_reasons[:10],
        },
        'per_review': per_review,
    }

    if errors:
        output['errors'] = errors[:50]  # Cap at 50 for readability

    # --- Save report ---
    os.makedirs(REPORT_DIR, exist_ok=True)
    report_path = os.path.join(REPORT_DIR, 'reml_crossval.json')
    with open(report_path, 'w', encoding='utf-8') as fh:
        json.dump(output, fh, indent=2)

    print(f'\nReport saved to: {report_path}')
    print('Done.')


def _print_agreement(title, stats):
    """Pretty-print agreement statistics."""
    if stats is None or stats.get('error'):
        print(f'  {title}: insufficient data')
        return
    print(f'\n  {title} (n={stats["n"]}):')
    print(f'    Pearson r:  {stats["pearson_r"]}')
    print(f'    Lin CCC:    {stats["lins_ccc"]}')
    print(f'    ICC(2,1):   {stats["icc_2_1_absolute"]}')
    print(f'    MAD:        {stats["mean_absolute_diff"]}')
    print(f'    Max AD:     {stats["max_absolute_diff"]}')
    ba = stats.get('bland_altman')
    if ba:
        print(f'    Bland-Altman: mean_diff={ba["mean_diff"]}, '
              f'LOA=[{ba["loa_lower"]}, {ba["loa_upper"]}], '
              f'outside={ba["pct_outside_loa"]}%')


if __name__ == '__main__':
    main()
