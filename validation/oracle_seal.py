"""
ORACLE: Computes reference meta-analysis results from raw Cochrane CSV data.
Outputs sealed JSON with SHA-256 content hash.
This script must NEVER be imported by the extractor.
"""
import csv, math, json, hashlib, os, glob, sys, random, io

if hasattr(sys.stdout, 'buffer') and not isinstance(sys.stdout, io.TextIOWrapper):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')


# --- DerSimonian-Laird engine (OR, log scale) ---

def compute_study_or(ee, en, ce, cn):
    """Compute log-OR and SE from 2x2 table. Returns (logOR, SE, cc_applied) or None."""
    a, b, c, d = ee, en - ee, ce, cn - ce
    needs_cc = (a == 0 or b == 0 or c == 0 or d == 0)
    if needs_cc:
        a += 0.5; b += 0.5; c += 0.5; d += 0.5
    if a <= 0 or b <= 0 or c <= 0 or d <= 0:
        return None
    log_or = math.log((a * d) / (b * c))
    se = math.sqrt(1/a + 1/b + 1/c + 1/d)
    return (log_or, se, needs_cc)


def compute_study_md(e_mean, e_sd, e_n, c_mean, c_sd, c_n):
    """Compute mean difference and SE from continuous data. Returns (MD, SE) or None."""
    if e_n <= 0 or c_n <= 0 or e_sd < 0 or c_sd < 0:
        return None
    md = e_mean - c_mean
    se = math.sqrt(e_sd**2 / e_n + c_sd**2 / c_n)
    if se <= 0:
        return None
    return (md, se)


def compute_study_from_ci(mean_val, ci_lo, ci_hi, z_crit=1.959964):
    """Compute effect and SE from reported mean and CI. Returns (effect, SE) or None."""
    if ci_hi <= ci_lo:
        return None
    se = (ci_hi - ci_lo) / (2 * z_crit)
    if se <= 0:
        return None
    return (mean_val, se)


def dl_meta_analysis(studies, conf_level=0.95, is_ratio=False):
    """
    DerSimonian-Laird random-effects meta-analysis on log scale.
    studies: list of (label, yi, sei)
    Returns dict with pooled effect, CI, I2, tau2, Q, k, per-study weights.
    """
    k = len(studies)
    if k == 0:
        return None

    alpha = 1 - conf_level
    z_crit = _normal_quantile(1 - alpha / 2)

    labels = [s[0] for s in studies]
    yi = [s[1] for s in studies]
    vi = [s[2] ** 2 for s in studies]
    wi = [1 / v for v in vi]

    sum_w = sum(wi)
    mu_fe = sum(w * y for w, y in zip(wi, yi)) / sum_w

    Q = sum(w * (y - mu_fe) ** 2 for w, y in zip(wi, yi))
    df = k - 1
    C = sum_w - sum(w ** 2 for w in wi) / sum_w
    tau2 = max(0.0, (Q - df) / C) if C > 0 and df > 0 else 0.0

    wi_re = [1 / (v + tau2) for v in vi]
    sum_w_re = sum(wi_re)
    mu_re = sum(w * y for w, y in zip(wi_re, yi)) / sum_w_re
    se_re = math.sqrt(1 / sum_w_re)

    I2 = max(0.0, (Q - df) / Q * 100) if Q > df else 0.0

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

    weights = [w / sum_w_re * 100 for w in wi_re]

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
        'study_weights': weights,
    }


def _normal_cdf(x):
    """Standard normal CDF (Abramowitz & Stegun approximation)."""
    if x < -8: return 0.0
    if x > 8: return 1.0
    t = 1 / (1 + 0.2316419 * abs(x))
    d = 0.3989422804014327
    p = d * math.exp(-x * x / 2) * (
        t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 +
        t * (-1.821255978 + t * 1.330274429))))
    )
    return 1 - p if x > 0 else p


def _normal_quantile(p):
    """Inverse normal CDF (Rational approximation, Abramowitz & Stegun 26.2.23)."""
    if p <= 0: return -8
    if p >= 1: return 8
    if p < 0.5:
        return -_normal_quantile(1 - p)
    t = math.sqrt(-2 * math.log(1 - p))
    c0, c1, c2 = 2.515517, 0.802853, 0.010328
    d1, d2, d3 = 1.432788, 0.189269, 0.001308
    return t - (c0 + c1 * t + c2 * t * t) / (1 + d1 * t + d2 * t * t + d3 * t * t * t)


# --- CSV parsing ---

def parse_cochrane_csv(csv_path, analysis_number='1'):
    """
    Parse a Cochrane pairwise CSV and extract overall studies for given analysis.
    Auto-detects data type: binary (cases/N), continuous (mean/SD/N), or GIV (Mean/CI).
    Returns (studies_list, data_type) where data_type is 'binary', 'continuous', or 'giv'.
    """
    with open(csv_path, 'r', encoding='utf-8', errors='replace') as fh:
        reader = csv.DictReader(fh)
        rows = list(reader)

    cols = reader.fieldnames or []
    has_subgroup_number = 'Subgroup number' in cols

    # Filter to target analysis number
    a_rows = [r for r in rows
              if r.get('Analysis number', '').strip() == str(analysis_number)]

    if has_subgroup_number:
        target = [r for r in a_rows if not r.get('Subgroup number', '').strip()]
    else:
        target = a_rows

    # Try binary first, then continuous, then GIV
    studies_bin = _parse_binary(target)
    if len(studies_bin) >= 2:
        return studies_bin, 'binary'

    studies_cont = _parse_continuous(target)
    if len(studies_cont) >= 2:
        return studies_cont, 'continuous'

    studies_giv = _parse_giv(target)
    if len(studies_giv) >= 2:
        return studies_giv, 'giv'

    # Fallback: return whatever has most entries
    best = max([studies_bin, studies_cont, studies_giv], key=len)
    dtype = 'binary' if best is studies_bin else ('continuous' if best is studies_cont else 'giv')
    return best, dtype


def _parse_binary(target):
    """Extract binary studies (cases + N)."""
    studies = []
    seen = set()
    for r in target:
        study = r.get('Study', '').strip()
        if not study or study in seen:
            continue

        ee = r.get('Experimental cases', '').strip()
        en = r.get('Experimental N', '').strip()
        ce = r.get('Control cases', '').strip()
        cn = r.get('Control N', '').strip()

        if not all([ee, en, ce, cn]):
            continue
        try:
            ee_f, en_f = float(ee), float(en)
            ce_f, cn_f = float(ce), float(cn)
            if en_f <= 0 or cn_f <= 0:
                continue
            # Require actual binary data (cases > 0 for at least some studies)
            if ee_f == 0 and ce_f == 0:
                continue  # Double-zero excluded
            seen.add(study)
            studies.append({
                'study': study,
                'year': r.get('Study year', '').strip(),
                'ee': ee_f, 'en': en_f,
                'ce': ce_f, 'cn': cn_f,
                'data_type': 'binary',
                'analysis_name': r.get('Analysis name', '').strip(),
            })
        except ValueError:
            continue
    return studies


def _parse_continuous(target):
    """Extract continuous studies (mean + SD + N)."""
    studies = []
    seen = set()
    for r in target:
        study = r.get('Study', '').strip()
        if not study or study in seen:
            continue

        e_mean = r.get('Experimental mean', '').strip()
        e_sd = r.get('Experimental SD', '').strip()
        e_n = r.get('Experimental N', '').strip()
        c_mean = r.get('Control mean', '').strip()
        c_sd = r.get('Control SD', '').strip()
        c_n = r.get('Control N', '').strip()

        if not all([e_mean, e_sd, e_n, c_mean, c_sd, c_n]):
            continue
        try:
            em, esd, en = float(e_mean), float(e_sd), float(e_n)
            cm, csd, cn = float(c_mean), float(c_sd), float(c_n)
            if en <= 0 or cn <= 0 or esd <= 0 or csd <= 0:
                continue
            seen.add(study)
            studies.append({
                'study': study,
                'year': r.get('Study year', '').strip(),
                'e_mean': em, 'e_sd': esd, 'en': en,
                'c_mean': cm, 'c_sd': csd, 'cn': cn,
                'data_type': 'continuous',
                'analysis_name': r.get('Analysis name', '').strip(),
            })
        except ValueError:
            continue
    return studies


def _parse_giv(target):
    """Extract GIV or Mean+CI studies."""
    studies = []
    seen = set()
    for r in target:
        study = r.get('Study', '').strip()
        if not study or study in seen:
            continue

        # Try GIV first
        giv_mean = r.get('GIV Mean', '').strip()
        giv_se = r.get('GIV SE', '').strip()

        if giv_mean and giv_se:
            try:
                gm, gs = float(giv_mean), float(giv_se)
                if gs > 0:
                    seen.add(study)
                    studies.append({
                        'study': study,
                        'year': r.get('Study year', '').strip(),
                        'effect': gm, 'se': gs,
                        'data_type': 'giv',
                        'analysis_name': r.get('Analysis name', '').strip(),
                    })
                    continue
            except ValueError:
                pass

        # Fall back to Mean + CI
        mean_val = r.get('Mean', '').strip()
        ci_lo = r.get('CI start', '').strip()
        ci_hi = r.get('CI end', '').strip()

        if mean_val and ci_lo and ci_hi:
            try:
                mv, cl, ch = float(mean_val), float(ci_lo), float(ci_hi)
                if ch > cl:
                    se = (ch - cl) / (2 * 1.959964)
                    if se > 0:
                        seen.add(study)
                        studies.append({
                            'study': study,
                            'year': r.get('Study year', '').strip(),
                            'effect': mv, 'se': se,
                            'data_type': 'giv',
                            'analysis_name': r.get('Analysis name', '').strip(),
                        })
            except ValueError:
                continue
    return studies


# --- Oracle main ---

def find_csv_for_review(csv_dir, cd_number):
    """Find the CSV file(s) for a given CD review number. Returns data-rows CSV preferring shortest name."""
    pattern = f'*{cd_number}*data-rows.csv'
    matches = glob.glob(os.path.join(csv_dir, pattern))
    if not matches:
        pattern2 = f'*{cd_number}*.csv'
        matches = glob.glob(os.path.join(csv_dir, pattern2))
    # Prefer shortest filename (most likely the main data file)
    return sorted(matches, key=lambda x: len(os.path.basename(x))) if matches else []


def _k_stratum(k):
    if k <= 3: return '2-3'
    if k <= 5: return '4-5'
    if k <= 10: return '6-10'
    if k <= 20: return '11-20'
    return '21+'


def seal_oracle(csv_dir, diagnostics_path, output_dir, n_sample=300, seed=42):
    """
    Main oracle function:
    1. Load diagnostics reference to identify usable reviews
    2. Sample n_sample stratified by k
    3. Compute DL from raw CSVs
    4. Cross-validate against diagnostics
    5. Seal with SHA-256
    """
    os.makedirs(output_dir, exist_ok=True)

    # Load diagnostics reference
    diag = {}
    with open(diagnostics_path, 'r', encoding='utf-8') as fh:
        reader = csv.DictReader(fh)
        for row in reader:
            if (row.get('outcome_type') == 'binary'
                    and row.get('analysis_number') == '1'
                    and 'overall' in row.get('analysis_key', '')):
                ds = row['dataset_name']
                try:
                    pe = float(row['pooled_effect'])
                except (ValueError, TypeError):
                    continue
                try:
                    se_val = float(row.get('pooled_se', '0') or '0')
                    i2_val = float(row.get('i2', '0') or '0')
                    tau2_val = float(row.get('tau2', '0') or '0')
                    q_val = float(row.get('q_stat', '0') or '0')
                except (ValueError, TypeError):
                    se_val = i2_val = tau2_val = q_val = 0
                diag[ds] = {
                    'k': int(row['k']),
                    'pooled_effect': pe,
                    'pooled_se': se_val,
                    'i2': i2_val,
                    'tau2': tau2_val,
                    'q_stat': q_val,
                }

    usable = {k: v for k, v in diag.items() if v['k'] >= 2}
    print(f'Diagnostics: {len(diag)} binary Analysis 1 overall, {len(usable)} with k>=2')

    # Stratified sampling
    random.seed(seed)
    strata = {'2-3': [], '4-5': [], '6-10': [], '11-20': [], '21+': []}
    for ds, info in usable.items():
        strata[_k_stratum(info['k'])].append(ds)

    total_available = sum(len(v) for v in strata.values())
    selected = []
    for stratum, ds_list in strata.items():
        target = round(n_sample * len(ds_list) / total_available)
        n = min(target, len(ds_list))
        sampled = random.sample(ds_list, n)
        selected.extend(sampled)
        print(f'  Stratum k={stratum}: {len(ds_list)} available, sampled {len(sampled)}')

    print(f'Total selected: {len(selected)}')

    # Process each selected review
    results = {}
    cross_val_pass = 0
    cross_val_fail = 0
    cross_val_details = []
    skipped = 0

    for ds_name in selected:
        parts = ds_name.replace('_data', '').split('_')
        cd_number = parts[0]

        csvs = find_csv_for_review(csv_dir, cd_number)
        if not csvs:
            skipped += 1
            continue

        raw_studies, data_type = parse_cochrane_csv(csvs[0], analysis_number='1')
        if len(raw_studies) < 2:
            skipped += 1
            continue

        meta_input = []
        double_zero = 0
        is_ratio = False

        if data_type == 'binary':
            is_ratio = True  # OR is a ratio measure
            for s in raw_studies:
                result = compute_study_or(s['ee'], s['en'], s['ce'], s['cn'])
                if result:
                    log_or, se, cc = result
                    meta_input.append((s['study'], log_or, se))
        elif data_type == 'continuous':
            is_ratio = False  # MD is a difference measure
            for s in raw_studies:
                result = compute_study_md(s['e_mean'], s['e_sd'], s['en'],
                                          s['c_mean'], s['c_sd'], s['cn'])
                if result:
                    md, se = result
                    meta_input.append((s['study'], md, se))
        elif data_type == 'giv':
            is_ratio = False  # GIV assumed difference scale
            for s in raw_studies:
                meta_input.append((s['study'], s['effect'], s['se']))

        if len(meta_input) < 2:
            skipped += 1
            continue

        ma = dl_meta_analysis(meta_input, is_ratio=is_ratio)
        if ma is None:
            skipped += 1
            continue

        # Cross-validate against diagnostics (informational — diagnostics used REML
        # and may have different row filtering, so exact match is not expected)
        ref = diag[ds_name]
        log_or_diff = abs(ma['pooled_log'] - ref['pooled_effect'])
        k_match = ma['k'] == ref['k']

        # Use relaxed tolerance: k match OR close effect (within 0.1 logOR)
        cv_pass = k_match or log_or_diff < 0.1
        if cv_pass:
            cross_val_pass += 1
        else:
            cross_val_fail += 1
            cross_val_details.append({
                'ds': ds_name,
                'oracle_log': ma['pooled_log'],
                'ref_log': ref['pooled_effect'],
                'diff': log_or_diff,
                'oracle_k': ma['k'],
                'ref_k': ref['k'],
            })

        # Determine effect type for MetaSprint
        if data_type == 'binary':
            effect_type = 'OR'
        elif data_type == 'continuous':
            effect_type = 'MD'
        else:
            effect_type = 'MD'  # GIV treated as difference scale

        results[ds_name] = {
            'cd_number': cd_number,
            'data_type': data_type,
            'effect_type': effect_type,
            'is_ratio': is_ratio,
            'k': ma['k'],
            'pooled_log': ma['pooled_log'],
            'pooled_se': ma['pooled_se'],
            'pooled': ma['pooled'],
            'pooled_lo': ma['pooled_lo'],
            'pooled_hi': ma['pooled_hi'],
            'tau2': ma['tau2'],
            'I2': ma['I2'],
            'Q': ma['Q'],
            'p_value': ma['p_value'],
            'double_zero': double_zero,
            'study_labels': ma['study_labels'],
            'cross_val': {
                'ref_log_effect': ref['pooled_effect'],
                'ref_k': ref['k'],
                'log_diff': log_or_diff,
                'k_match': k_match,
                'pass': cv_pass,
            }
        }

    # Seal with hash
    oracle_json = json.dumps(results, indent=2, sort_keys=True)
    content_hash = hashlib.sha256(oracle_json.encode('utf-8')).hexdigest()

    oracle_path = os.path.join(output_dir, 'oracle_results.json')
    with open(oracle_path, 'w', encoding='utf-8') as fh:
        fh.write(oracle_json)

    manifest = {
        'n_reviews': len(results),
        'n_selected': len(selected),
        'n_skipped': skipped,
        'cross_val_pass': cross_val_pass,
        'cross_val_fail': cross_val_fail,
        'cross_val_rate': cross_val_pass / max(1, cross_val_pass + cross_val_fail) * 100,
        'content_hash': content_hash,
        'seed': seed,
        'strata_sampled': {s: len([d for d in selected if d in results and _k_stratum(results[d]['k']) == s])
                           for s in strata},
    }
    if cross_val_details:
        manifest['cross_val_failures'] = cross_val_details[:20]  # First 20 for debugging

    manifest_path = os.path.join(output_dir, 'oracle_manifest.json')
    with open(manifest_path, 'w', encoding='utf-8') as fh:
        json.dump(manifest, fh, indent=2)

    print(f'\nOracle sealed: {len(results)} reviews')
    print(f'Cross-validation: {cross_val_pass} pass, {cross_val_fail} fail, {skipped} skipped')
    print(f'Cross-val rate: {manifest["cross_val_rate"]:.1f}%')
    print(f'Content hash: {content_hash[:16]}...')

    if cross_val_details:
        print(f'\nFirst 5 cross-val failures:')
        for d in cross_val_details[:5]:
            print(f'  {d["ds"]}: oracle={d["oracle_log"]:.4f} ref={d["ref_log"]:.4f} diff={d["diff"]:.4f} k={d["oracle_k"]}/{d["ref_k"]}')

    return results, manifest


# --- Self-test ---

if __name__ == '__main__':
    from _paths import CSV_DIR
    DIAG_PATH = r'C:\Models\Pairwise70\analysis\output\analysis_diagnostics_results.csv'
    OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'sealed_oracle')

    if '--test' in sys.argv:
        print('=== Oracle Self-Test ===')

        # Test 1: CD000028 — binary, k=13, logOR=-0.1153, I2=0
        csvs = find_csv_for_review(CSV_DIR, 'CD000028')
        assert csvs, 'CD000028 CSV not found'
        studies, dtype = parse_cochrane_csv(csvs[0])
        assert dtype == 'binary', f'CD000028 should be binary, got {dtype}'
        meta_input = []
        for s in studies:
            r = compute_study_or(s['ee'], s['en'], s['ce'], s['cn'])
            if r:
                meta_input.append((s['study'], r[0], r[1]))
        ma = dl_meta_analysis(meta_input, is_ratio=True)
        assert abs(ma['pooled_log'] - (-0.1153)) < 0.001, f'CD000028 logOR: {ma["pooled_log"]}'
        assert ma['k'] == 13, f'CD000028 k: {ma["k"]}'
        assert ma['I2'] < 1.0, f'CD000028 I2: {ma["I2"]}'
        print(f'  CD000028: PASS (binary, logOR={ma["pooled_log"]:.6f}, k={ma["k"]}, I2={ma["I2"]:.1f}%)')

        # Test 2: CD000547 — continuous (mean/SD/N), should auto-detect
        csvs = find_csv_for_review(CSV_DIR, 'CD000547')
        if csvs:
            studies, dtype = parse_cochrane_csv(csvs[0])
            assert dtype in ('continuous', 'giv'), f'CD000547 should be continuous/giv, got {dtype}'
            assert len(studies) >= 2, f'CD000547 k={len(studies)} (expected >=2)'
            meta_input = []
            for s in studies:
                if dtype == 'continuous':
                    r = compute_study_md(s['e_mean'], s['e_sd'], s['en'],
                                         s['c_mean'], s['c_sd'], s['cn'])
                    if r:
                        meta_input.append((s['study'], r[0], r[1]))
                else:
                    meta_input.append((s['study'], s['effect'], s['se']))
            ma = dl_meta_analysis(meta_input, is_ratio=False)
            print(f'  CD000547: PASS ({dtype}, MD={ma["pooled"]:.2f}, k={ma["k"]}, I2={ma["I2"]:.1f}%)')
        else:
            print('  CD000547: SKIPPED (CSV not found)')

        # Test 3: normal_cdf and normal_quantile
        assert abs(_normal_cdf(0) - 0.5) < 0.0001, 'CDF(0) should be 0.5'
        assert abs(_normal_cdf(1.96) - 0.975) < 0.001, 'CDF(1.96) should be ~0.975'
        assert abs(_normal_quantile(0.975) - 1.96) < 0.01, 'Q(0.975) should be ~1.96'
        print(f'  Normal CDF/Quantile: PASS')

        print('\nAll self-tests passed.')
    else:
        results, manifest = seal_oracle(CSV_DIR, DIAG_PATH, OUTPUT_DIR, n_sample=300)
