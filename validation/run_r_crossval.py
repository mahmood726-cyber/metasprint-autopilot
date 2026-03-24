"""
Python wrapper for R metafor cross-validation.

1. Calls Rscript to run r_metafor_crossval.R
2. Reads the output JSON
3. Computes additional agreement statistics (Bland-Altman, ICC) in Python
4. Merges into the existing reports
5. Prints summary
"""
import sys
import os
import io
import json
import math
import subprocess

# Windows UTF-8 safety
if hasattr(sys.stdout, 'buffer') and not isinstance(sys.stdout, io.TextIOWrapper):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# WMI deadlock workaround for scipy on Python 3.13 + Windows
import platform as _platform
if not hasattr(_platform, '_wmi_query_patched'):
    def _safe_wmi(*a, **kw):
        return ('10.0.26100', '1', 'Multiprocessor Free', '0', '0')
    _platform._wmi_query = _safe_wmi
    _platform._wmi_query_patched = True

from scipy import stats as sp_stats

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
R_SCRIPT = os.path.join(SCRIPT_DIR, 'r_metafor_crossval.R')
RSCRIPT_EXE = r'C:\Program Files\R\R-4.5.2\bin\Rscript.exe'
REPORT_DIR = os.path.join(SCRIPT_DIR, 'reports')
R_REPORT_PATH = os.path.join(REPORT_DIR, 'r_metafor_crossval.json')
ORACLE_PATH = os.path.join(SCRIPT_DIR, 'sealed_oracle', 'oracle_results.json')


# ---------------------------------------------------------------------------
# Agreement statistics (Python implementations)
# ---------------------------------------------------------------------------

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
        'mean_diff': round(mean_diff, 8),
        'sd_diff': round(sd_diff, 8),
        'loa_lower': round(loa_lower, 8),
        'loa_upper': round(loa_upper, 8),
        'n_outside_loa': outside,
        'pct_outside_loa': round(pct_outside, 2),
    }


def icc_two_way_absolute(x, y):
    """
    ICC(2,1) two-way random, absolute agreement, single measures.
    Computed from paired measurements.
    """
    n = len(x)
    if n < 3:
        return None

    k = 2  # two raters
    grand_mean = (sum(x) + sum(y)) / (2 * n)

    row_means = [(xi + yi) / 2.0 for xi, yi in zip(x, y)]
    col_mean_x = sum(x) / n
    col_mean_y = sum(y) / n

    SSR = k * sum((rm - grand_mean) ** 2 for rm in row_means)
    SSC = n * sum((cm - grand_mean) ** 2 for cm in [col_mean_x, col_mean_y])
    SST = sum((xi - grand_mean) ** 2 for xi in x) + \
          sum((yi - grand_mean) ** 2 for yi in y)
    SSE = SST - SSR - SSC

    df_r = n - 1
    df_c = k - 1
    df_e = df_r * df_c

    MSR = SSR / df_r if df_r > 0 else 0
    MSC = SSC / df_c if df_c > 0 else 0
    MSE = SSE / df_e if df_e > 0 else 0

    denom = MSR + (k - 1) * MSE + k * (MSC - MSE) / n
    if denom <= 0:
        return None
    icc = (MSR - MSE) / denom
    return round(icc, 8)


def lins_ccc(x, y):
    """Lin's Concordance Correlation Coefficient."""
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
    return round(2 * sxy / denom, 8)


def pearson_r(x, y):
    """Pearson correlation coefficient."""
    n = len(x)
    if n < 3:
        return None
    mx = sum(x) / n
    my = sum(y) / n
    sxy = sum((xi - mx) * (yi - my) for xi, yi in zip(x, y))
    sx = math.sqrt(sum((xi - mx) ** 2 for xi in x))
    sy = math.sqrt(sum((yi - my) ** 2 for yi in y))
    if sx <= 0 or sy <= 0:
        return None
    return round(sxy / (sx * sy), 8)


def compute_python_agreement(x, y, label=''):
    """Compute full agreement statistics using Python."""
    n = len(x)
    if n < 3:
        return {'n': n, 'label': label, 'error': 'insufficient data'}

    abs_diffs = [abs(xi - yi) for xi, yi in zip(x, y)]

    result = {
        'n': n,
        'label': label,
        'pearson_r': pearson_r(x, y),
        'lins_ccc': lins_ccc(x, y),
        'icc_2_1_absolute': icc_two_way_absolute(x, y),
        'mean_absolute_diff': round(sum(abs_diffs) / n, 8),
        'max_absolute_diff': round(max(abs_diffs), 8),
        'median_absolute_diff': round(sorted(abs_diffs)[n // 2], 8),
    }

    ba = bland_altman(x, y)
    if ba is not None:
        result['bland_altman'] = ba

    return result


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    print('=' * 70)
    print('MetaSprint R metafor Cross-Validation (Python Wrapper)')
    print('=' * 70)
    print()

    # ---- Step 1: Run R script ----
    print('Step 1: Running R metafor cross-validation...')
    print(f'  Rscript: {RSCRIPT_EXE}')
    print(f'  Script:  {R_SCRIPT}')
    print()

    if not os.path.isfile(RSCRIPT_EXE):
        print(f'ERROR: Rscript not found at {RSCRIPT_EXE}')
        sys.exit(1)
    if not os.path.isfile(R_SCRIPT):
        print(f'ERROR: R script not found at {R_SCRIPT}')
        sys.exit(1)

    try:
        proc = subprocess.run(
            [RSCRIPT_EXE, R_SCRIPT],
            capture_output=True, text=True, timeout=600,
            cwd=SCRIPT_DIR,
            encoding='utf-8', errors='replace',
        )
        print('--- R stdout ---')
        print(proc.stdout)
        if proc.stderr:
            print('--- R stderr ---')
            print(proc.stderr)
        if proc.returncode != 0:
            print(f'ERROR: R script exited with code {proc.returncode}')
            sys.exit(1)
    except subprocess.TimeoutExpired:
        print('ERROR: R script timed out after 600 seconds')
        sys.exit(1)
    except Exception as e:
        print(f'ERROR running R script: {e}')
        sys.exit(1)

    # ---- Step 2: Read R output JSON ----
    print('\nStep 2: Reading R output...')
    if not os.path.isfile(R_REPORT_PATH):
        print(f'ERROR: R output not found at {R_REPORT_PATH}')
        sys.exit(1)

    with open(R_REPORT_PATH, 'r', encoding='utf-8') as fh:
        r_report = json.load(fh)

    summary = r_report.get('summary', {})
    per_review = r_report.get('per_review', {})
    n_processed = summary.get('n_processed', 0)

    print(f'  Reviews processed by R: {n_processed}')
    print(f'  Reviews skipped:        {summary.get("n_skipped", 0)}')
    print(f'  k exact match:          {summary.get("n_k_match", 0)}')
    print(f'  pooled_log < 0.001:     {summary.get("n_exact_match_pooled_001", 0)}')

    if n_processed < 2:
        print('ERROR: Too few reviews processed to compute agreement.')
        sys.exit(1)

    # ---- Step 3: Compute additional Python agreement statistics ----
    print('\nStep 3: Computing additional Python agreement statistics...')

    # Extract paired vectors from per_review
    oracle_pooled = []
    r_dl_pooled = []
    r_reml_pooled = []
    oracle_tau2 = []
    r_dl_tau2 = []
    r_reml_tau2 = []
    oracle_I2 = []
    r_dl_I2 = []
    r_reml_I2 = []
    data_types = []
    review_names = []

    for rv_name, rv_data in per_review.items():
        if rv_data is None:
            continue
        try:
            oracle_pooled.append(rv_data['oracle_pooled_log'])
            r_dl_pooled.append(rv_data['r_dl_pooled_log'])
            r_reml_pooled.append(rv_data['r_reml_pooled_log'])
            oracle_tau2.append(rv_data['oracle_tau2'])
            r_dl_tau2.append(rv_data['r_dl_tau2'])
            r_reml_tau2.append(rv_data['r_reml_tau2'])
            oracle_I2.append(rv_data['oracle_I2'])
            r_dl_I2.append(rv_data['r_dl_I2'])
            r_reml_I2.append(rv_data['r_reml_I2'])
            data_types.append(rv_data.get('data_type', 'unknown'))
            review_names.append(rv_name)
        except (KeyError, TypeError):
            continue

    n = len(oracle_pooled)
    print(f'  Paired reviews extracted: {n}')

    # Oracle DL vs R DL: full agreement
    py_agree_pooled = compute_python_agreement(
        oracle_pooled, r_dl_pooled, 'pooled_log: Oracle DL vs R DL')
    py_agree_tau2 = compute_python_agreement(
        oracle_tau2, r_dl_tau2, 'tau2: Oracle DL vs R DL')
    py_agree_I2 = compute_python_agreement(
        oracle_I2, r_dl_I2, 'I2: Oracle DL vs R DL')

    # Oracle DL vs R REML: Bland-Altman + ICC
    py_agree_dl_reml_pooled = compute_python_agreement(
        oracle_pooled, r_reml_pooled, 'pooled_log: Oracle DL vs R REML')
    py_agree_dl_reml_tau2 = compute_python_agreement(
        oracle_tau2, r_reml_tau2, 'tau2: Oracle DL vs R REML')

    # R DL vs R REML
    py_agree_r_dl_vs_reml = compute_python_agreement(
        r_dl_pooled, r_reml_pooled, 'pooled_log: R DL vs R REML')

    # Stratified by data_type
    stratified_python = {}
    for dtype in ['binary', 'continuous', 'giv']:
        idx = [i for i, dt in enumerate(data_types) if dt == dtype]
        if len(idx) < 3:
            stratified_python[dtype] = {'n': len(idx), 'error': 'insufficient data'}
            continue
        op = [oracle_pooled[i] for i in idx]
        rp = [r_dl_pooled[i] for i in idx]
        stratified_python[dtype] = compute_python_agreement(
            op, rp, f'pooled_log: Oracle DL vs R DL ({dtype})')

    # ---- Print Python agreement summary ----
    print('\n--- Python Agreement: Oracle DL vs R DL ---')
    _print_agreement('Pooled log-effect', py_agree_pooled)
    _print_agreement('Tau-squared', py_agree_tau2)
    _print_agreement('I-squared', py_agree_I2)

    print('\n--- Python Agreement: Oracle DL vs R REML ---')
    _print_agreement('Pooled log-effect', py_agree_dl_reml_pooled)
    _print_agreement('Tau-squared', py_agree_dl_reml_tau2)

    print('\n--- Python Agreement: R DL vs R REML ---')
    _print_agreement('Pooled log-effect', py_agree_r_dl_vs_reml)

    print('\n--- Stratified by data_type (Oracle DL vs R DL) ---')
    for dtype, ag in stratified_python.items():
        if 'error' in ag:
            print(f'  {dtype}: n={ag["n"]} (insufficient)')
        else:
            print(f'  {dtype} (n={ag["n"]}): '
                  f'r={ag["pearson_r"]}, CCC={ag["lins_ccc"]}, '
                  f'MAD={ag["mean_absolute_diff"]}')

    # ---- Step 4: Merge into the R report ----
    print('\nStep 4: Merging Python statistics into report...')

    r_report['python_agreement'] = {
        'oracle_dl_vs_r_dl': {
            'pooled_log': py_agree_pooled,
            'tau2': py_agree_tau2,
            'I2': py_agree_I2,
        },
        'oracle_dl_vs_r_reml': {
            'pooled_log': py_agree_dl_reml_pooled,
            'tau2': py_agree_dl_reml_tau2,
        },
        'r_dl_vs_r_reml': {
            'pooled_log': py_agree_r_dl_vs_reml,
        },
        'stratified_by_data_type': stratified_python,
    }

    # Save merged report
    merged_path = os.path.join(REPORT_DIR, 'r_metafor_crossval.json')
    with open(merged_path, 'w', encoding='utf-8') as fh:
        json.dump(r_report, fh, indent=2)

    print(f'  Merged report saved to: {merged_path}')

    # ---- Step 5: Final summary ----
    print('\n' + '=' * 70)
    print('FINAL SUMMARY')
    print('=' * 70)
    print(f'  Oracle reviews:       {summary.get("n_oracle_reviews", "?")}')
    print(f'  R processed:          {n_processed}')
    print(f'  R skipped:            {summary.get("n_skipped", "?")}')
    print(f'  k exact match:        {summary.get("n_k_match", "?")} / {n_processed} '
          f'({summary.get("pct_k_match", "?")}%)')
    print(f'  pooled_log < 0.001:   {summary.get("n_exact_match_pooled_001", "?")} / {n_processed} '
          f'({summary.get("pct_exact_pooled_001", "?")}%)')
    print()
    print('  Oracle DL vs R DL (pooled_log):')
    print(f'    Pearson r:  {py_agree_pooled.get("pearson_r", "?")}')
    print(f'    Lin CCC:    {py_agree_pooled.get("lins_ccc", "?")}')
    print(f'    ICC(2,1):   {py_agree_pooled.get("icc_2_1_absolute", "?")}')
    print(f'    MAD:        {py_agree_pooled.get("mean_absolute_diff", "?")}')
    print(f'    Max AD:     {py_agree_pooled.get("max_absolute_diff", "?")}')
    ba = py_agree_pooled.get('bland_altman')
    if ba:
        print(f'    Bland-Altman: mean_diff={ba["mean_diff"]}, '
              f'LOA=[{ba["loa_lower"]}, {ba["loa_upper"]}], '
              f'outside={ba["pct_outside_loa"]}%')
    print()
    print('  Oracle DL vs R REML (pooled_log):')
    print(f'    Pearson r:  {py_agree_dl_reml_pooled.get("pearson_r", "?")}')
    print(f'    Lin CCC:    {py_agree_dl_reml_pooled.get("lins_ccc", "?")}')
    print(f'    MAD:        {py_agree_dl_reml_pooled.get("mean_absolute_diff", "?")}')

    print('\nDone.')


def _print_agreement(title, stats):
    """Pretty-print agreement statistics."""
    if stats is None or stats.get('error'):
        print(f'  {title}: insufficient data')
        return
    print(f'\n  {title} (n={stats["n"]}):')
    print(f'    Pearson r:  {stats.get("pearson_r", "?")}')
    print(f'    Lin CCC:    {stats.get("lins_ccc", "?")}')
    print(f'    ICC(2,1):   {stats.get("icc_2_1_absolute", "?")}')
    print(f'    MAD:        {stats.get("mean_absolute_diff", "?")}')
    print(f'    Max AD:     {stats.get("max_absolute_diff", "?")}')
    ba = stats.get('bland_altman')
    if ba:
        print(f'    Bland-Altman: mean_diff={ba["mean_diff"]}, '
              f'LOA=[{ba["loa_lower"]}, {ba["loa_upper"]}], '
              f'outside={ba["pct_outside_loa"]}%')


if __name__ == '__main__':
    main()
