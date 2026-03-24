"""
JUDGE: Compares sealed oracle results against blinded extractor outputs.
This is the ONLY script that reads both oracle and extractor files.
Produces accuracy report with per-review details.
"""
import json, os, sys, csv, math, io

if hasattr(sys.stdout, 'buffer') and not isinstance(sys.stdout, io.TextIOWrapper):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# Tolerances
TOL_LOG_EFFECT = 0.005   # +/-0.005 on log scale (primary)
TOL_EFFECT_REL = 0.01    # +/-1% relative for back-transformed
TOL_CI_REL = 0.02        # +/-2% relative for CI bounds
TOL_I2 = 2.0             # +/-2 percentage points
TOL_TAU2_ABS = 0.005     # Absolute tolerance for tau2
TOL_TAU2_REL = 0.05      # 5% relative tolerance for tau2


def compare_results(oracle, extractor_results):
    """Compare a single oracle result against extractor output."""
    ext = extractor_results
    if ext is None:
        return {'status': 'extractor_error', 'metrics': {}}

    is_ratio = oracle.get('is_ratio', oracle.get('effect_type') == 'OR')
    metrics = {}

    # k (study count) - must match exactly
    ext_k = ext.get('k')
    if ext_k is not None:
        metrics['k'] = {
            'oracle': oracle['k'], 'extractor': ext_k,
            'diff': abs(oracle['k'] - ext_k),
            'pass': oracle['k'] == ext_k,
        }

    # Pooled effect on log/original scale
    ext_log = ext.get('pooled_log')
    if ext_log is not None and oracle.get('pooled_log') is not None:
        diff = abs(oracle['pooled_log'] - ext_log)
        metrics['pooled_log'] = {
            'oracle': oracle['pooled_log'], 'extractor': ext_log,
            'diff': diff,
            'pass': diff < TOL_LOG_EFFECT,
        }

    ext_pooled = ext.get('pooled')
    if ext_pooled is not None:
        oracle_pooled = oracle.get('pooled', oracle.get('pooled_or'))
        if oracle_pooled is not None:
            diff = abs(oracle_pooled - ext_pooled)
            # Use relative tolerance for large effects
            rel_diff = diff / max(abs(oracle_pooled), 0.001)
            metrics['pooled'] = {
                'oracle': oracle_pooled, 'extractor': ext_pooled,
                'diff': diff, 'rel_diff': rel_diff,
                'pass': diff < 0.01 or rel_diff < TOL_EFFECT_REL,
            }

    # CI bounds
    for ci_name in ['pooled_lo', 'pooled_hi']:
        ext_ci = ext.get(ci_name)
        oracle_ci = oracle.get(ci_name)
        if ext_ci is not None and oracle_ci is not None:
            diff = abs(oracle_ci - ext_ci)
            rel_diff = diff / max(abs(oracle_ci), 0.001)
            metrics[ci_name] = {
                'oracle': oracle_ci, 'extractor': ext_ci,
                'diff': diff, 'rel_diff': rel_diff,
                'pass': diff < 0.02 or rel_diff < TOL_CI_REL,
            }

    # I-squared
    ext_i2 = ext.get('I2')
    if ext_i2 is not None:
        diff = abs(oracle['I2'] - ext_i2)
        metrics['I2'] = {
            'oracle': oracle['I2'], 'extractor': ext_i2,
            'diff': diff,
            'pass': diff < TOL_I2,
        }

    # tau-squared
    ext_tau2 = ext.get('tau2')
    if ext_tau2 is not None:
        diff = abs(oracle['tau2'] - ext_tau2)
        rel_diff = diff / max(oracle['tau2'], 0.0001)
        metrics['tau2'] = {
            'oracle': oracle['tau2'], 'extractor': ext_tau2,
            'diff': diff,
            'pass': diff < TOL_TAU2_ABS or rel_diff < TOL_TAU2_REL,
        }

    # Forest plot
    metrics['forest_plot'] = {
        'rendered': ext.get('forest_plot_rendered', False),
        'pass': ext.get('forest_plot_rendered', False),
    }

    # Funnel plot
    metrics['funnel_plot'] = {
        'rendered': ext.get('funnel_plot_rendered', False),
        'pass': ext.get('funnel_plot_rendered', False),
    }

    # Core metrics (engine accuracy) vs informational metrics (plots)
    core_metrics = {k: v for k, v in metrics.items() if k not in ('forest_plot', 'funnel_plot')}
    all_core_pass = all(m.get('pass', False) for m in core_metrics.values())
    return {'status': 'pass' if all_core_pass else 'fail', 'metrics': metrics}


def run_judge(oracle_path, extractor_dir, report_dir):
    """Main judge: compare all oracle entries against extractor outputs."""
    os.makedirs(report_dir, exist_ok=True)
    os.makedirs(os.path.join(report_dir, 'failures'), exist_ok=True)

    with open(oracle_path, 'r', encoding='utf-8') as fh:
        oracle = json.load(fh)

    print(f'Oracle: {len(oracle)} reviews')

    results = {}
    total_pass = 0
    total_fail = 0
    total_error = 0
    metric_pass = {}
    metric_total = {}

    for ds_name, oracle_entry in oracle.items():
        ext_path = os.path.join(extractor_dir, f'{ds_name}.json')

        if not os.path.exists(ext_path):
            results[ds_name] = {'status': 'missing', 'metrics': {}}
            total_error += 1
            continue

        with open(ext_path, 'r', encoding='utf-8') as fh:
            ext_data = json.load(fh)

        if ext_data.get('error'):
            results[ds_name] = {'status': 'extractor_error', 'error': ext_data['error'], 'metrics': {}}
            total_error += 1
            continue

        ext_results = ext_data.get('results', {})
        comparison = compare_results(oracle_entry, ext_results)
        results[ds_name] = comparison

        if comparison['status'] == 'pass':
            total_pass += 1
        else:
            total_fail += 1
            failure = {
                'ds_name': ds_name,
                'data_type': oracle_entry.get('data_type', 'unknown'),
                'oracle': {k: v for k, v in oracle_entry.items() if k != 'study_labels'},
                'extractor': ext_results,
                'comparison': comparison,
            }
            fail_path = os.path.join(report_dir, 'failures', f'{ds_name}.json')
            with open(fail_path, 'w', encoding='utf-8') as fh:
                json.dump(failure, fh, indent=2)

        for metric_name, metric_data in comparison['metrics'].items():
            metric_total[metric_name] = metric_total.get(metric_name, 0) + 1
            if metric_data.get('pass', False):
                metric_pass[metric_name] = metric_pass.get(metric_name, 0) + 1

    total_compared = total_pass + total_fail
    summary = {
        'total_reviews': total_pass + total_fail + total_error,
        'pass': total_pass,
        'fail': total_fail,
        'error': total_error,
        'pass_rate': total_pass / max(1, total_compared) * 100,
        'metric_pass_rates': {
            m: metric_pass.get(m, 0) / max(1, metric_total[m]) * 100
            for m in sorted(metric_total)
        },
    }

    # Print summary
    print(f'\n{"="*60}')
    print(f'BLINDED VALIDATION REPORT: {summary["total_reviews"]} reviews')
    print(f'{"="*60}')
    print(f'  PASS:  {total_pass:4d} ({summary["pass_rate"]:.1f}%)')
    print(f'  FAIL:  {total_fail:4d}')
    print(f'  ERROR: {total_error:4d}')
    print(f'\nPer-metric pass rates:')
    for m in sorted(summary['metric_pass_rates'], key=lambda x: summary['metric_pass_rates'][x]):
        rate = summary['metric_pass_rates'][m]
        n_pass = metric_pass.get(m, 0)
        n_total = metric_total.get(m, 0)
        status = 'OK' if rate >= 95 else ('WARN' if rate >= 90 else 'FAIL')
        print(f'  {m:15s}: {rate:6.1f}% ({n_pass}/{n_total}) [{status}]')

    # By data type
    type_stats = {}
    for ds_name, comp in results.items():
        if ds_name in oracle:
            dt = oracle[ds_name].get('data_type', 'unknown')
            if dt not in type_stats:
                type_stats[dt] = {'pass': 0, 'fail': 0, 'error': 0}
            if comp['status'] == 'pass':
                type_stats[dt]['pass'] += 1
            elif comp['status'] == 'fail':
                type_stats[dt]['fail'] += 1
            else:
                type_stats[dt]['error'] += 1
    print(f'\nBy data type:')
    for dt, stats in sorted(type_stats.items()):
        total_dt = stats['pass'] + stats['fail']
        rate_dt = stats['pass'] / max(1, total_dt) * 100
        print(f'  {dt:12s}: {stats["pass"]}/{total_dt} ({rate_dt:.1f}%) + {stats["error"]} errors')

    # Save reports
    report_path = os.path.join(report_dir, 'validation_report.json')
    with open(report_path, 'w', encoding='utf-8') as fh:
        json.dump({'summary': summary, 'details': results}, fh, indent=2)

    csv_path = os.path.join(report_dir, 'validation_summary.csv')
    with open(csv_path, 'w', newline='', encoding='utf-8') as fh:
        writer = csv.writer(fh)
        writer.writerow(['dataset', 'status', 'data_type', 'k_pass', 'pooled_log_diff',
                         'I2_diff', 'tau2_diff', 'forest', 'funnel'])
        for ds_name, comp in results.items():
            m = comp.get('metrics', {})
            dt = oracle.get(ds_name, {}).get('data_type', '')
            writer.writerow([
                ds_name,
                comp['status'],
                dt,
                m.get('k', {}).get('pass', ''),
                f"{m.get('pooled_log', {}).get('diff', '')}" if 'pooled_log' in m and isinstance(m['pooled_log'].get('diff'), (int, float)) else '',
                f"{m.get('I2', {}).get('diff', '')}" if 'I2' in m and isinstance(m['I2'].get('diff'), (int, float)) else '',
                f"{m.get('tau2', {}).get('diff', '')}" if 'tau2' in m and isinstance(m['tau2'].get('diff'), (int, float)) else '',
                m.get('forest_plot', {}).get('pass', ''),
                m.get('funnel_plot', {}).get('pass', ''),
            ])

    print(f'\nReports saved to {report_dir}/')
    return summary


if __name__ == '__main__':
    BASE = os.path.dirname(os.path.abspath(__file__))
    ORACLE_PATH = os.path.join(BASE, 'sealed_oracle', 'oracle_results.json')
    EXTRACTOR_DIR = os.path.join(BASE, 'extractor_outputs')
    REPORT_DIR = os.path.join(BASE, 'reports')

    summary = run_judge(ORACLE_PATH, EXTRACTOR_DIR, REPORT_DIR)
