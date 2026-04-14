"""
DEEP ANALYSIS: Comprehensive statistical analysis of 291 validated Cochrane reviews.

Reads oracle results, extractor outputs, and raw CSVs to produce:
1. Subgroup analysis by data type
2. Subgroup analysis by k-stratum
3. Subgroup by I2 level
4. Sensitivity analysis: leave-one-out
5. Prediction intervals
6. Egger's regression test
7. Cross-validation investigation
8. Effect size distribution

Output: validation/reports/deep_analysis.json + printed summary.
"""

import sys
import os
import io
import json
import math
import statistics

# Windows UTF-8 safety
if hasattr(sys.stdout, 'buffer') and not isinstance(sys.stdout, io.TextIOWrapper):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# Import study-level functions from oracle_seal.py
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from oracle_seal import (
    parse_cochrane_csv,
    compute_study_or,
    compute_study_md,
    dl_meta_analysis,
    find_csv_for_review,
    _normal_cdf,
    _normal_quantile,
)

# --- Paths ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ORACLE_PATH = os.path.join(BASE_DIR, 'sealed_oracle', 'oracle_results.json')
EXTRACTOR_DIR = os.path.join(BASE_DIR, 'extractor_outputs')
REPORT_DIR = os.path.join(BASE_DIR, 'reports')
from _paths import CSV_DIR


# --- Utility helpers ---

def safe_median(vals):
    """Median that handles empty lists."""
    if not vals:
        return None
    return statistics.median(vals)


def safe_mean(vals):
    """Mean that handles empty lists."""
    if not vals:
        return None
    return statistics.mean(vals)


def safe_stdev(vals):
    """Standard deviation that handles lists with <2 elements."""
    if len(vals) < 2:
        return None
    return statistics.stdev(vals)


def k_stratum_label(k):
    """Map k to stratum label."""
    if k <= 3:
        return '2-3'
    if k <= 5:
        return '4-5'
    if k <= 10:
        return '6-10'
    if k <= 20:
        return '11-20'
    return '21+'


def i2_stratum_label(i2):
    """Map I2 percentage to stratum label."""
    if i2 == 0:
        return 'I2=0%'
    if i2 <= 25:
        return '0<I2<=25%'
    if i2 <= 50:
        return '25<I2<=50%'
    if i2 <= 75:
        return '50<I2<=75%'
    return 'I2>75%'


def t_quantile(df, p):
    """
    Approximate t-distribution quantile using the Wilson-Hilferty cube-root
    transformation: t_p,df ~ df^(1/2) * ((1 - 2/(9*df) + z_p*sqrt(2/(9*df)))^3 - 1)
    / sqrt(1 - 2/(9*df) + z_p*sqrt(2/(9*df)))^3)
    For simplicity use the Cornish-Fisher expansion for moderate df,
    and fall back to normal for large df.
    """
    if df <= 0:
        return _normal_quantile(p)
    z = _normal_quantile(p)
    if df >= 120:
        return z
    # Cornish-Fisher 3-term expansion
    g1 = (z ** 3 + z) / (4 * df)
    g2 = (5 * z ** 5 + 16 * z ** 3 + 3 * z) / (96 * df ** 2)
    return z + g1 + g2


def _get_study_level_data(oracle_entry):
    """
    Re-parse raw CSV to obtain study-level (label, yi, sei) tuples.
    Returns list of (label, yi, sei) or empty list on failure.
    """
    cd_number = oracle_entry.get('cd_number', '')
    data_type = oracle_entry.get('data_type', 'binary')
    is_ratio = oracle_entry.get('is_ratio', False)

    csvs = find_csv_for_review(CSV_DIR, cd_number)
    if not csvs:
        return []

    try:
        raw_studies, dtype = parse_cochrane_csv(csvs[0], analysis_number='1')
    except Exception:
        return []

    if len(raw_studies) < 2:
        return []

    meta_input = []
    if dtype == 'binary':
        for s in raw_studies:
            result = compute_study_or(s['ee'], s['en'], s['ce'], s['cn'])
            if result:
                log_or, se, _ = result
                meta_input.append((s['study'], log_or, se))
    elif dtype == 'continuous':
        for s in raw_studies:
            result = compute_study_md(
                s['e_mean'], s['e_sd'], s['en'],
                s['c_mean'], s['c_sd'], s['cn'],
            )
            if result:
                md, se = result
                meta_input.append((s['study'], md, se))
    elif dtype == 'giv':
        for s in raw_studies:
            meta_input.append((s['study'], s['effect'], s['se']))

    return meta_input


# --- Analysis 1: Subgroup by Data Type ---

def analysis_by_data_type(oracle, extractor_map):
    """Subgroup analysis by data_type (binary, continuous, giv)."""
    print('\n' + '=' * 70)
    print('ANALYSIS 1: Subgroup by Data Type')
    print('=' * 70)

    groups = {}
    for ds_name, entry in oracle.items():
        dt = entry.get('data_type', 'unknown')
        if dt not in groups:
            groups[dt] = []
        groups[dt].append((ds_name, entry))

    results = {}
    for dt in sorted(groups.keys()):
        items = groups[dt]
        n = len(items)
        k_vals = [e['k'] for _, e in items]
        pooled_vals = [e['pooled_log'] for _, e in items]
        i2_vals = [e['I2'] for _, e in items]
        tau2_vals = [e['tau2'] for _, e in items]

        # Oracle-Extractor agreement
        diffs_pooled_log = []
        diffs_i2 = []
        diffs_tau2 = []
        for ds_name, entry in items:
            ext = extractor_map.get(ds_name)
            if ext is None:
                continue
            ext_r = ext.get('results', {})
            ext_log = ext_r.get('pooled_log')
            if ext_log is not None:
                diffs_pooled_log.append(abs(entry['pooled_log'] - ext_log))
            ext_i2 = ext_r.get('I2')
            if ext_i2 is not None:
                diffs_i2.append(abs(entry['I2'] - ext_i2))
            ext_tau2 = ext_r.get('tau2')
            if ext_tau2 is not None:
                diffs_tau2.append(abs(entry['tau2'] - ext_tau2))

        group_result = {
            'n_reviews': n,
            'median_k': safe_median(k_vals),
            'mean_pooled_log': safe_mean(pooled_vals),
            'mean_I2': safe_mean(i2_vals),
            'mean_tau2': safe_mean(tau2_vals),
            'agreement': {
                'pooled_log': {
                    'n_compared': len(diffs_pooled_log),
                    'mean_abs_diff': safe_mean(diffs_pooled_log),
                    'max_abs_diff': max(diffs_pooled_log) if diffs_pooled_log else None,
                },
                'I2': {
                    'n_compared': len(diffs_i2),
                    'mean_abs_diff': safe_mean(diffs_i2),
                    'max_abs_diff': max(diffs_i2) if diffs_i2 else None,
                },
                'tau2': {
                    'n_compared': len(diffs_tau2),
                    'mean_abs_diff': safe_mean(diffs_tau2),
                    'max_abs_diff': max(diffs_tau2) if diffs_tau2 else None,
                },
            },
        }
        results[dt] = group_result

        print(f'\n  {dt}: N={n}, median k={safe_median(k_vals)}, '
              f'mean effect={safe_mean(pooled_vals):.4f}, '
              f'mean I2={safe_mean(i2_vals):.1f}%, '
              f'mean tau2={safe_mean(tau2_vals):.4f}')
        if diffs_pooled_log:
            print(f'    Agreement pooled_log: mean diff={safe_mean(diffs_pooled_log):.6f}, '
                  f'max diff={max(diffs_pooled_log):.6f}')

    return results


# --- Analysis 2: Subgroup by k-Stratum ---

def analysis_by_k_stratum(oracle, extractor_map):
    """Subgroup analysis by k ranges."""
    print('\n' + '=' * 70)
    print('ANALYSIS 2: Subgroup by k-Stratum')
    print('=' * 70)

    strata_order = ['2-3', '4-5', '6-10', '11-20', '21+']
    groups = {s: [] for s in strata_order}

    for ds_name, entry in oracle.items():
        stratum = k_stratum_label(entry['k'])
        groups[stratum].append((ds_name, entry))

    results = {}
    for stratum in strata_order:
        items = groups[stratum]
        n = len(items)
        if n == 0:
            results[stratum] = {'n_reviews': 0}
            continue

        i2_vals = [e['I2'] for _, e in items]
        n_i2_gt50 = sum(1 for v in i2_vals if v > 50)
        n_i2_gt75 = sum(1 for v in i2_vals if v > 75)

        diffs_pooled_log = []
        for ds_name, entry in items:
            ext = extractor_map.get(ds_name)
            if ext is None:
                continue
            ext_r = ext.get('results', {})
            ext_log = ext_r.get('pooled_log')
            if ext_log is not None:
                diffs_pooled_log.append(abs(entry['pooled_log'] - ext_log))

        stratum_result = {
            'n_reviews': n,
            'mean_I2': safe_mean(i2_vals),
            'prop_I2_gt50': n_i2_gt50 / n if n > 0 else 0,
            'prop_I2_gt75': n_i2_gt75 / n if n > 0 else 0,
            'agreement_pooled_log': {
                'n_compared': len(diffs_pooled_log),
                'mean_abs_diff': safe_mean(diffs_pooled_log),
            },
        }
        results[stratum] = stratum_result

        print(f'\n  k={stratum}: N={n}, mean I2={safe_mean(i2_vals):.1f}%, '
              f'I2>50%: {n_i2_gt50}/{n} ({n_i2_gt50/n*100:.0f}%), '
              f'I2>75%: {n_i2_gt75}/{n} ({n_i2_gt75/n*100:.0f}%)')
        if diffs_pooled_log:
            print(f'    Mean |diff| pooled_log vs extractor: {safe_mean(diffs_pooled_log):.6f}')

    return results


# --- Analysis 3: Subgroup by I2 Level ---

def analysis_by_i2_level(oracle, extractor_map):
    """Stratify reviews by I2 level."""
    print('\n' + '=' * 70)
    print('ANALYSIS 3: Subgroup by I2 Level')
    print('=' * 70)

    strata_order = ['I2=0%', '0<I2<=25%', '25<I2<=50%', '50<I2<=75%', 'I2>75%']
    groups = {s: [] for s in strata_order}

    for ds_name, entry in oracle.items():
        stratum = i2_stratum_label(entry['I2'])
        groups[stratum].append((ds_name, entry))

    results = {}
    for stratum in strata_order:
        items = groups[stratum]
        n = len(items)
        if n == 0:
            results[stratum] = {'n_reviews': 0}
            continue

        pooled_vals = [e['pooled_log'] for _, e in items]
        tau2_vals = [e['tau2'] for _, e in items]

        diffs_pooled_log = []
        diffs_i2 = []
        for ds_name, entry in items:
            ext = extractor_map.get(ds_name)
            if ext is None:
                continue
            ext_r = ext.get('results', {})
            ext_log = ext_r.get('pooled_log')
            if ext_log is not None:
                diffs_pooled_log.append(abs(entry['pooled_log'] - ext_log))
            ext_i2 = ext_r.get('I2')
            if ext_i2 is not None:
                diffs_i2.append(abs(entry['I2'] - ext_i2))

        stratum_result = {
            'n_reviews': n,
            'mean_pooled_log': safe_mean(pooled_vals),
            'mean_tau2': safe_mean(tau2_vals),
            'agreement': {
                'pooled_log': {
                    'n_compared': len(diffs_pooled_log),
                    'mean_abs_diff': safe_mean(diffs_pooled_log),
                    'max_abs_diff': max(diffs_pooled_log) if diffs_pooled_log else None,
                },
                'I2': {
                    'n_compared': len(diffs_i2),
                    'mean_abs_diff': safe_mean(diffs_i2),
                    'max_abs_diff': max(diffs_i2) if diffs_i2 else None,
                },
            },
        }
        results[stratum] = stratum_result

        print(f'\n  {stratum}: N={n}, mean effect={safe_mean(pooled_vals):.4f}, '
              f'mean tau2={safe_mean(tau2_vals):.4f}')
        if diffs_pooled_log:
            print(f'    Agreement pooled_log: mean diff={safe_mean(diffs_pooled_log):.6f}')

    return results


# --- Analysis 4: Leave-One-Out Sensitivity ---

def analysis_leave_one_out(oracle):
    """Leave-one-out sensitivity analysis for each review."""
    print('\n' + '=' * 70)
    print('ANALYSIS 4: Leave-One-Out Sensitivity Analysis')
    print('=' * 70)

    loo_results = {}
    n_processed = 0
    n_skipped = 0
    n_direction_change = 0
    n_significance_change = 0

    for ds_name, entry in oracle.items():
        is_ratio = entry.get('is_ratio', False)
        studies = _get_study_level_data(entry)

        if len(studies) < 3:
            n_skipped += 1
            continue

        full_ma = dl_meta_analysis(studies, is_ratio=is_ratio)
        if full_ma is None:
            n_skipped += 1
            continue

        full_pooled = full_ma['pooled_log']
        full_sig = full_ma['p_value'] < 0.05

        loo_pooled = []
        loo_p_values = []
        direction_changes = []
        significance_changes = []

        for i in range(len(studies)):
            subset = studies[:i] + studies[i + 1:]
            if len(subset) < 2:
                continue
            loo_ma = dl_meta_analysis(subset, is_ratio=is_ratio)
            if loo_ma is None:
                continue

            loo_pooled.append(loo_ma['pooled_log'])
            loo_p_values.append(loo_ma['p_value'])

            # Direction change: sign of pooled_log flips
            if (full_pooled > 0 and loo_ma['pooled_log'] < 0) or \
               (full_pooled < 0 and loo_ma['pooled_log'] > 0):
                direction_changes.append(studies[i][0])

            # Significance change: p crosses 0.05
            loo_sig = loo_ma['p_value'] < 0.05
            if full_sig != loo_sig:
                significance_changes.append(studies[i][0])

        if not loo_pooled:
            n_skipped += 1
            continue

        effect_range = max(loo_pooled) - min(loo_pooled)
        has_direction_change = len(direction_changes) > 0
        has_significance_change = len(significance_changes) > 0

        if has_direction_change:
            n_direction_change += 1
        if has_significance_change:
            n_significance_change += 1

        loo_results[ds_name] = {
            'k': len(studies),
            'full_pooled_log': full_pooled,
            'full_p_value': full_ma['p_value'],
            'loo_min_effect': min(loo_pooled),
            'loo_max_effect': max(loo_pooled),
            'loo_range': effect_range,
            'direction_change_studies': direction_changes,
            'significance_change_studies': significance_changes,
            'has_direction_change': has_direction_change,
            'has_significance_change': has_significance_change,
        }
        n_processed += 1

    summary = {
        'n_processed': n_processed,
        'n_skipped': n_skipped,
        'n_direction_change': n_direction_change,
        'n_significance_change': n_significance_change,
        'prop_direction_change': n_direction_change / max(1, n_processed),
        'prop_significance_change': n_significance_change / max(1, n_processed),
    }

    if loo_results:
        ranges = [v['loo_range'] for v in loo_results.values()]
        summary['mean_loo_range'] = safe_mean(ranges)
        summary['median_loo_range'] = safe_median(ranges)
        summary['max_loo_range'] = max(ranges)

    print(f'\n  Processed: {n_processed}, Skipped: {n_skipped}')
    print(f'  Direction changes: {n_direction_change}/{n_processed} '
          f'({n_direction_change/max(1,n_processed)*100:.1f}%)')
    print(f'  Significance changes: {n_significance_change}/{n_processed} '
          f'({n_significance_change/max(1,n_processed)*100:.1f}%)')
    if loo_results:
        print(f'  LOO effect range: mean={safe_mean(ranges):.4f}, '
              f'median={safe_median(ranges):.4f}, max={max(ranges):.4f}')

    return {'summary': summary, 'per_review': loo_results}


# --- Analysis 5: Prediction Intervals ---

def analysis_prediction_intervals(oracle):
    """Compute prediction intervals for reviews with k>=3."""
    print('\n' + '=' * 70)
    print('ANALYSIS 5: Prediction Intervals')
    print('=' * 70)

    pi_results = {}
    n_computed = 0
    n_crosses_null = 0
    pi_widths = []

    for ds_name, entry in oracle.items():
        k = entry['k']
        if k < 3:
            continue

        tau2 = entry['tau2']
        se = entry['pooled_se']
        mu = entry['pooled_log']
        is_ratio = entry.get('is_ratio', False)

        # Prediction interval: mu +/- t_{k-2, alpha/2} * sqrt(tau2 + se^2)
        df_pi = k - 2
        t_crit = t_quantile(df_pi, 0.975)  # two-sided 95% PI
        pi_se = math.sqrt(tau2 + se ** 2)
        pi_lo = mu - t_crit * pi_se
        pi_hi = mu + t_crit * pi_se
        pi_width = pi_hi - pi_lo

        # Null is 0 on log scale for both ratio and difference measures
        null_val = 0.0
        crosses_null = (pi_lo <= null_val <= pi_hi)

        if crosses_null:
            n_crosses_null += 1

        pi_widths.append(pi_width)
        n_computed += 1

        pi_results[ds_name] = {
            'k': k,
            'pooled_log': mu,
            'tau2': tau2,
            'pooled_se': se,
            'pi_lo': pi_lo,
            'pi_hi': pi_hi,
            'pi_width': pi_width,
            'crosses_null': crosses_null,
            'is_ratio': is_ratio,
        }

    summary = {
        'n_computed': n_computed,
        'n_crosses_null': n_crosses_null,
        'prop_crosses_null': n_crosses_null / max(1, n_computed),
        'mean_pi_width': safe_mean(pi_widths),
        'median_pi_width': safe_median(pi_widths),
    }

    print(f'\n  Computed: {n_computed} reviews (k>=3)')
    print(f'  PI crosses null: {n_crosses_null}/{n_computed} '
          f'({n_crosses_null/max(1,n_computed)*100:.1f}%)')
    if pi_widths:
        print(f'  PI width: mean={safe_mean(pi_widths):.4f}, '
              f'median={safe_median(pi_widths):.4f}')

    return {'summary': summary, 'per_review': pi_results}


# --- Analysis 6: Egger's Regression Test ---

def analysis_egger_test(oracle):
    """Egger's regression test for funnel plot asymmetry (k>=10)."""
    print('\n' + '=' * 70)
    print("ANALYSIS 6: Egger's Regression Test (k>=10)")
    print('=' * 70)

    egger_results = {}
    n_tested = 0
    n_significant_010 = 0
    n_significant_005 = 0

    for ds_name, entry in oracle.items():
        k = entry['k']
        if k < 10:
            continue

        studies = _get_study_level_data(entry)
        if len(studies) < 10:
            continue

        # Egger's test: regress (yi/sei) on (1/sei)
        # Model: yi/sei = a + b*(1/sei) + error
        # Test H0: a=0 (intercept = 0 implies no asymmetry)
        n = len(studies)
        x = [1.0 / s[2] for s in studies]  # precision = 1/SE
        y = [s[1] / s[2] for s in studies]  # standardized effect = yi/SE

        # Simple OLS regression
        x_bar = sum(x) / n
        y_bar = sum(y) / n
        ss_xx = sum((xi - x_bar) ** 2 for xi in x)
        ss_xy = sum((xi - x_bar) * (yi - y_bar) for xi, yi in zip(x, y))

        if ss_xx == 0:
            continue

        b_slope = ss_xy / ss_xx
        a_intercept = y_bar - b_slope * x_bar

        # Residuals and SE of intercept
        y_pred = [a_intercept + b_slope * xi for xi in x]
        ss_res = sum((yi - yp) ** 2 for yi, yp in zip(y, y_pred))
        df_res = n - 2

        if df_res <= 0:
            continue

        mse = ss_res / df_res
        se_intercept = math.sqrt(mse * (1.0 / n + x_bar ** 2 / ss_xx))

        if se_intercept <= 0:
            continue

        t_stat = a_intercept / se_intercept
        # Two-sided p-value using normal approximation (conservative for df>=8)
        p_value = 2 * (1 - _normal_cdf(abs(t_stat)))

        sig_010 = p_value < 0.10
        sig_005 = p_value < 0.05
        if sig_010:
            n_significant_010 += 1
        if sig_005:
            n_significant_005 += 1
        n_tested += 1

        egger_results[ds_name] = {
            'k': k,
            'n_studies': n,
            'intercept': a_intercept,
            'slope': b_slope,
            'se_intercept': se_intercept,
            't_stat': t_stat,
            'p_value': p_value,
            'significant_010': sig_010,
            'significant_005': sig_005,
        }

    summary = {
        'n_tested': n_tested,
        'n_significant_010': n_significant_010,
        'n_significant_005': n_significant_005,
        'prop_significant_010': n_significant_010 / max(1, n_tested),
        'prop_significant_005': n_significant_005 / max(1, n_tested),
    }

    if egger_results:
        intercepts = [v['intercept'] for v in egger_results.values()]
        summary['mean_intercept'] = safe_mean(intercepts)
        summary['median_intercept'] = safe_median(intercepts)

    print(f'\n  Tested: {n_tested} reviews (k>=10)')
    print(f'  Significant asymmetry (p<0.10): {n_significant_010}/{n_tested} '
          f'({n_significant_010/max(1,n_tested)*100:.1f}%)')
    print(f'  Significant asymmetry (p<0.05): {n_significant_005}/{n_tested} '
          f'({n_significant_005/max(1,n_tested)*100:.1f}%)')
    if egger_results:
        print(f'  Intercept: mean={safe_mean(intercepts):.4f}, '
              f'median={safe_median(intercepts):.4f}')

    return {'summary': summary, 'per_review': egger_results}


# --- Analysis 7: Cross-Validation Investigation ---

def analysis_cross_validation(oracle):
    """Investigate the cross-validation failures."""
    print('\n' + '=' * 70)
    print('ANALYSIS 7: Cross-Validation Investigation')
    print('=' * 70)

    failures = []
    passes = []
    all_entries = []

    for ds_name, entry in oracle.items():
        cv = entry.get('cross_val', {})
        record = {
            'ds_name': ds_name,
            'oracle_k': entry['k'],
            'ref_k': cv.get('ref_k'),
            'k_match': cv.get('k_match', False),
            'oracle_log': entry['pooled_log'],
            'ref_log': cv.get('ref_log_effect'),
            'log_diff': cv.get('log_diff'),
            'cv_pass': cv.get('pass', True),
            'data_type': entry.get('data_type', 'unknown'),
        }
        all_entries.append(record)

        if not record['cv_pass']:
            failures.append(record)
        else:
            passes.append(record)

    n_total = len(all_entries)
    n_fail = len(failures)
    n_pass = len(passes)

    # k-mismatch pattern among failures
    k_mismatch_count = sum(1 for f in failures if not f['k_match'])
    k_match_count = sum(1 for f in failures if f['k_match'])

    # k difference distribution among failures
    k_diffs_fail = []
    for f in failures:
        if f['ref_k'] is not None:
            k_diffs_fail.append(f['ref_k'] - f['oracle_k'])

    # Effect size difference conditional on k-match vs k-mismatch (across ALL reviews)
    diffs_k_match = [r['log_diff'] for r in all_entries
                     if r['k_match'] and r['log_diff'] is not None]
    diffs_k_mismatch = [r['log_diff'] for r in all_entries
                        if not r['k_match'] and r['log_diff'] is not None]

    # Root cause classification for failures
    root_causes = {
        'k_mismatch_small': 0,   # k differs by 1-2 (likely subgroup filtering)
        'k_mismatch_large': 0,   # k differs by 3+ (likely multi-analysis or different scope)
        'k_match_effect_diff': 0,  # k matches but effect differs (double-zero handling etc.)
        'direction_reversal': 0,  # oracle and ref have opposite signs
    }

    for f in failures:
        k_diff = abs(f['ref_k'] - f['oracle_k']) if f['ref_k'] is not None else 0
        if not f['k_match']:
            if k_diff <= 2:
                root_causes['k_mismatch_small'] += 1
            else:
                root_causes['k_mismatch_large'] += 1
        else:
            root_causes['k_match_effect_diff'] += 1

        # Direction reversal
        if f['oracle_log'] is not None and f['ref_log'] is not None:
            if (f['oracle_log'] > 0 and f['ref_log'] < 0) or \
               (f['oracle_log'] < 0 and f['ref_log'] > 0):
                root_causes['direction_reversal'] += 1

    results = {
        'n_total': n_total,
        'n_pass': n_pass,
        'n_fail': n_fail,
        'failure_rate': n_fail / max(1, n_total),
        'k_mismatch_among_failures': {
            'n_k_mismatch': k_mismatch_count,
            'n_k_match': k_match_count,
            'prop_k_mismatch': k_mismatch_count / max(1, n_fail),
        },
        'k_diff_distribution': {
            'mean_k_diff': safe_mean(k_diffs_fail),
            'median_k_diff': safe_median(k_diffs_fail),
            'max_k_diff': max(k_diffs_fail) if k_diffs_fail else None,
            'min_k_diff': min(k_diffs_fail) if k_diffs_fail else None,
        },
        'effect_diff_by_k_status': {
            'k_match': {
                'n': len(diffs_k_match),
                'mean_abs_diff': safe_mean(diffs_k_match),
                'median_abs_diff': safe_median(diffs_k_match),
            },
            'k_mismatch': {
                'n': len(diffs_k_mismatch),
                'mean_abs_diff': safe_mean(diffs_k_mismatch),
                'median_abs_diff': safe_median(diffs_k_mismatch),
            },
        },
        'root_cause_classification': root_causes,
        'failure_details': [
            {
                'ds_name': f['ds_name'],
                'data_type': f['data_type'],
                'oracle_k': f['oracle_k'],
                'ref_k': f['ref_k'],
                'oracle_log': f['oracle_log'],
                'ref_log': f['ref_log'],
                'log_diff': f['log_diff'],
            }
            for f in failures
        ],
    }

    print(f'\n  Total: {n_total}, Pass: {n_pass}, Fail: {n_fail} '
          f'({n_fail/max(1,n_total)*100:.1f}%)')
    print(f'\n  Among {n_fail} failures:')
    print(f'    k-mismatch: {k_mismatch_count} ({k_mismatch_count/max(1,n_fail)*100:.0f}%)')
    print(f'    k-match but effect differs: {k_match_count}')
    if k_diffs_fail:
        print(f'    k difference (ref-oracle): mean={safe_mean(k_diffs_fail):.1f}, '
              f'median={safe_median(k_diffs_fail):.0f}, '
              f'range=[{min(k_diffs_fail)}, {max(k_diffs_fail)}]')
    print(f'\n  Root cause classification:')
    for cause, count in root_causes.items():
        print(f'    {cause}: {count}')
    print(f'\n  Effect diff (all reviews) conditional on k status:')
    if diffs_k_match:
        print(f'    k-match: mean |diff|={safe_mean(diffs_k_match):.6f} (N={len(diffs_k_match)})')
    if diffs_k_mismatch:
        print(f'    k-mismatch: mean |diff|={safe_mean(diffs_k_mismatch):.6f} (N={len(diffs_k_mismatch)})')

    return results


# --- Analysis 8: Effect Size Distribution ---

def analysis_effect_distribution(oracle):
    """Analyze the distribution of pooled log-effects."""
    print('\n' + '=' * 70)
    print('ANALYSIS 8: Effect Size Distribution')
    print('=' * 70)

    pooled_logs = []
    p_values = []
    is_ratio_flags = []

    for ds_name, entry in oracle.items():
        pooled_logs.append(entry['pooled_log'])
        p_values.append(entry['p_value'])
        is_ratio_flags.append(entry.get('is_ratio', False))

    n_total = len(pooled_logs)

    # Null is 0 on log scale: negative pooled_log means favors treatment
    # for OR (ratio < 1), and favors treatment for MD (negative difference).
    # Convention: pooled_log < 0 => favors experimental/treatment
    n_favors_treatment = sum(1 for v in pooled_logs if v < 0)
    n_favors_control = sum(1 for v in pooled_logs if v > 0)
    n_exactly_null = sum(1 for v in pooled_logs if v == 0)

    n_significant = sum(1 for p in p_values if p < 0.05)
    n_significant_001 = sum(1 for p in p_values if p < 0.01)

    # Histogram bins for pooled log-effects
    bin_edges = [-float('inf'), -2.0, -1.5, -1.0, -0.5, -0.25, 0.0,
                 0.25, 0.5, 1.0, 1.5, 2.0, float('inf')]
    bin_labels = [
        '<-2.0', '-2.0 to -1.5', '-1.5 to -1.0', '-1.0 to -0.5',
        '-0.5 to -0.25', '-0.25 to 0.0', '0.0 to 0.25', '0.25 to 0.5',
        '0.5 to 1.0', '1.0 to 1.5', '1.5 to 2.0', '>2.0',
    ]
    histogram = {label: 0 for label in bin_labels}
    for v in pooled_logs:
        for i in range(len(bin_edges) - 1):
            if bin_edges[i] <= v < bin_edges[i + 1]:
                histogram[bin_labels[i]] += 1
                break
        else:
            # Catch exactly equal to last edge
            histogram[bin_labels[-1]] += 1

    results = {
        'n_total': n_total,
        'mean_pooled_log': safe_mean(pooled_logs),
        'median_pooled_log': safe_median(pooled_logs),
        'sd_pooled_log': safe_stdev(pooled_logs),
        'min_pooled_log': min(pooled_logs) if pooled_logs else None,
        'max_pooled_log': max(pooled_logs) if pooled_logs else None,
        'n_favors_treatment': n_favors_treatment,
        'n_favors_control': n_favors_control,
        'n_exactly_null': n_exactly_null,
        'prop_favors_treatment': n_favors_treatment / max(1, n_total),
        'prop_favors_control': n_favors_control / max(1, n_total),
        'n_significant_005': n_significant,
        'n_significant_001': n_significant_001,
        'prop_significant_005': n_significant / max(1, n_total),
        'prop_significant_001': n_significant_001 / max(1, n_total),
        'histogram': histogram,
        'histogram_bin_edges': [e for e in bin_edges if math.isfinite(e)],
    }

    print(f'\n  N={n_total} reviews')
    print(f'  Pooled log-effect: mean={safe_mean(pooled_logs):.4f}, '
          f'median={safe_median(pooled_logs):.4f}, '
          f'SD={safe_stdev(pooled_logs):.4f}')
    print(f'  Range: [{min(pooled_logs):.4f}, {max(pooled_logs):.4f}]')
    print(f'\n  Direction:')
    print(f'    Favors treatment (effect<0): {n_favors_treatment}/{n_total} '
          f'({n_favors_treatment/max(1,n_total)*100:.1f}%)')
    print(f'    Favors control (effect>0):   {n_favors_control}/{n_total} '
          f'({n_favors_control/max(1,n_total)*100:.1f}%)')
    print(f'    Exactly null:                {n_exactly_null}')
    print(f'\n  Significance:')
    print(f'    p<0.05: {n_significant}/{n_total} ({n_significant/max(1,n_total)*100:.1f}%)')
    print(f'    p<0.01: {n_significant_001}/{n_total} ({n_significant_001/max(1,n_total)*100:.1f}%)')
    print(f'\n  Histogram (pooled log-effect):')
    for label in bin_labels:
        count = histogram[label]
        bar = '#' * count
        print(f'    {label:>18s}: {count:3d} {bar}')

    return results


# --- Main ---

def main():
    print('=' * 70)
    print('DEEP ANALYSIS: 291 Validated Cochrane Reviews')
    print('=' * 70)

    # Load oracle results
    print(f'\nLoading oracle from: {ORACLE_PATH}')
    with open(ORACLE_PATH, 'r', encoding='utf-8') as fh:
        oracle = json.load(fh)
    print(f'  Oracle: {len(oracle)} reviews')

    # Load extractor outputs
    extractor_map = {}
    ext_files = [f for f in os.listdir(EXTRACTOR_DIR) if f.endswith('.json')]
    for fname in ext_files:
        ds_name = fname.replace('.json', '')
        fpath = os.path.join(EXTRACTOR_DIR, fname)
        try:
            with open(fpath, 'r', encoding='utf-8') as fh:
                extractor_map[ds_name] = json.load(fh)
        except Exception as e:
            print(f'  WARNING: Could not load {fname}: {e}')
    print(f'  Extractor outputs: {len(extractor_map)} files')

    # Run all analyses
    all_results = {}

    # 1. Subgroup by data type
    all_results['by_data_type'] = analysis_by_data_type(oracle, extractor_map)

    # 2. Subgroup by k-stratum
    all_results['by_k_stratum'] = analysis_by_k_stratum(oracle, extractor_map)

    # 3. Subgroup by I2 level
    all_results['by_i2_level'] = analysis_by_i2_level(oracle, extractor_map)

    # 4. Leave-one-out sensitivity
    print('\n  (LOO analysis reads raw CSVs -- this may take a few minutes...)')
    all_results['leave_one_out'] = analysis_leave_one_out(oracle)

    # 5. Prediction intervals
    all_results['prediction_intervals'] = analysis_prediction_intervals(oracle)

    # 6. Egger's test
    print('\n  (Egger test reads raw CSVs -- this may take a moment...)')
    all_results['egger_test'] = analysis_egger_test(oracle)

    # 7. Cross-validation investigation
    all_results['cross_validation'] = analysis_cross_validation(oracle)

    # 8. Effect size distribution
    all_results['effect_distribution'] = analysis_effect_distribution(oracle)

    # Save all results
    os.makedirs(REPORT_DIR, exist_ok=True)
    output_path = os.path.join(REPORT_DIR, 'deep_analysis.json')
    with open(output_path, 'w', encoding='utf-8') as fh:
        json.dump(all_results, fh, indent=2, default=str)

    print('\n' + '=' * 70)
    print(f'DEEP ANALYSIS COMPLETE')
    print(f'  Results saved to: {output_path}')
    print(f'  Total reviews analyzed: {len(oracle)}')
    print('=' * 70)

    return all_results


if __name__ == '__main__':
    main()
