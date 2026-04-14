"""
BLINDED INPUT PREPARATION: Extracts study-level data only.
Output contains NO pooled effects, NO expected I2/tau2, NO reference values.
The extractor reads ONLY from blinded_inputs/.
"""
import json, os, sys, math, io

if not isinstance(sys.stdout, io.TextIOWrapper) or sys.stdout.encoding != 'utf-8':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from oracle_seal import (parse_cochrane_csv, find_csv_for_review,
                          compute_study_or, compute_study_md, _normal_quantile)


def prepare_blinded_inputs(oracle_path, csv_dir, output_dir):
    """
    Read the oracle results to know WHICH reviews to prepare,
    then extract study-level data ONLY (no pooled results).
    """
    os.makedirs(output_dir, exist_ok=True)

    with open(oracle_path, 'r', encoding='utf-8') as fh:
        oracle = json.load(fh)

    z_crit = _normal_quantile(0.975)

    prepared = 0
    for ds_name, oracle_info in oracle.items():
        cd_number = oracle_info['cd_number']
        data_type = oracle_info.get('data_type', 'binary')
        effect_type = oracle_info.get('effect_type', 'OR')
        is_ratio = oracle_info.get('is_ratio', data_type == 'binary')

        csvs = find_csv_for_review(csv_dir, cd_number)
        if not csvs:
            continue

        raw_studies, dtype = parse_cochrane_csv(csvs[0], analysis_number='1')

        blinded_studies = []
        for s in raw_studies:
            if dtype == 'binary':
                result = compute_study_or(s['ee'], s['en'], s['ce'], s['cn'])
                if result is None:
                    continue
                log_val, se, cc_applied = result
                eff = math.exp(log_val)
                lo = math.exp(log_val - z_crit * se)
                hi = math.exp(log_val + z_crit * se)
                blinded_studies.append({
                    'study': s['study'],
                    'year': s['year'],
                    'ee': s['ee'], 'en': s['en'],
                    'ce': s['ce'], 'cn': s['cn'],
                    'effect_estimate': round(eff, 6),
                    'lower_ci': round(lo, 6),
                    'upper_ci': round(hi, 6),
                    'effect_type': 'OR',
                    'cc_applied': cc_applied,
                })
            elif dtype == 'continuous':
                result = compute_study_md(s['e_mean'], s['e_sd'], s['en'],
                                          s['c_mean'], s['c_sd'], s['cn'])
                if result is None:
                    continue
                md, se = result
                lo = md - z_crit * se
                hi = md + z_crit * se
                blinded_studies.append({
                    'study': s['study'],
                    'year': s['year'],
                    'en': s['en'], 'cn': s['cn'],
                    'effect_estimate': round(md, 6),
                    'lower_ci': round(lo, 6),
                    'upper_ci': round(hi, 6),
                    'effect_type': 'MD',
                })
            elif dtype == 'giv':
                eff = s['effect']
                se = s['se']
                lo = eff - z_crit * se
                hi = eff + z_crit * se
                blinded_studies.append({
                    'study': s['study'],
                    'year': s['year'],
                    'effect_estimate': round(eff, 6),
                    'lower_ci': round(lo, 6),
                    'upper_ci': round(hi, 6),
                    'effect_type': 'MD',
                })

        if len(blinded_studies) < 2:
            continue

        blinded_output = {
            'dataset_name': ds_name,
            'cd_number': cd_number,
            'analysis_name': raw_studies[0].get('analysis_name', ''),
            'effect_type': effect_type,
            'k': len(blinded_studies),
            'studies': blinded_studies,
        }

        out_path = os.path.join(output_dir, f'{ds_name}.json')
        with open(out_path, 'w', encoding='utf-8') as fh:
            json.dump(blinded_output, fh, indent=2)

        prepared += 1

    print(f'Prepared {prepared} blinded input files in {output_dir}')
    return prepared


if __name__ == '__main__':
    BASE = os.path.dirname(os.path.abspath(__file__))
    ORACLE_PATH = os.path.join(BASE, 'sealed_oracle', 'oracle_results.json')
    from _paths import CSV_DIR
    OUTPUT_DIR = os.path.join(BASE, 'blinded_inputs')

    n = prepare_blinded_inputs(ORACLE_PATH, CSV_DIR, OUTPUT_DIR)
    print(f'Done. {n} files ready for blinded extraction.')
