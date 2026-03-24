# Blinded 300-Review Validation Harness

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Validate MetaSprint Autopilot against 300 real Cochrane meta-analyses using a blinded 3-agent architecture where the extraction agent never sees expected results.

**Architecture:** Three isolated scripts — Oracle (seals reference answers from raw Cochrane CSV data), Extractor (drives MetaSprint HTML via Selenium using only study-level inputs, blind to expected outputs), Judge (compares sealed oracle to blinded extractor outputs, produces accuracy report). The Extractor cannot import or read Oracle files.

**Tech Stack:** Python 3, Selenium WebDriver (Chrome headless), Cochrane raw CSV data (2,587 files from CochraneDataExtractor), diagnostics reference (analysis_diagnostics_results.csv from Pairwise70).

---

## Data Sources

| Source | Location | Records |
|--------|----------|---------|
| Raw Cochrane CSVs | `C:/Users/user/OneDrive - NHS/Documents/CochraneDataExtractor/data/pairwise/` | 2,587 files, 501 reviews |
| Reference diagnostics | `C:/Models/Pairwise70/analysis/output/analysis_diagnostics_results.csv` | 422 binary Analysis 1 overall |
| MetaSprint app | `C:/Users/user/Downloads/metasprint-autopilot/metasprint-autopilot.html` | Single HTML file |

## Key Technical Decisions

1. **Effect measure: OR (log-odds ratio)** with 0.5 continuity correction for zero cells — matches diagnostics reference which used OR_cc uniformly
2. **Overall pooling:** Use rows where `Subgroup number` is empty (the Cochrane "overall" rows), deduplicating by study name
3. **MetaSprint input format:** The app takes `effectEstimate + lowerCI + upperCI + effectType` per study. The Oracle computes per-study OR+CI from 2x2 data; the Extractor enters these into the app.
4. **Blinding enforcement:** Extractor script imports ONLY from `validation/blinded_inputs/` (study-level data). Oracle outputs go to `validation/sealed_oracle/`. Neither directory is readable by the other script.
5. **Stratified sampling:** 300 reviews sampled proportionally across k-strata: k=2-3 (51), k=4-5 (32), k=6-10 (65), k=11-20 (58), k=21+ (93)

## File Structure

```
metasprint-autopilot/
  validation/
    oracle_seal.py          # Task 1: Reads raw CSVs, computes reference, seals
    prepare_inputs.py       # Task 2: Prepares blinded inputs (study-level only)
    blinded_extractor.py    # Task 3: Drives MetaSprint HTML via Selenium
    judge_compare.py        # Task 4: Compares oracle vs extractor, reports
    run_validation.py       # Task 5: Orchestrator (runs all 4 in sequence)
    sealed_oracle/          # Oracle outputs (hashed JSON, never read by extractor)
      oracle_results.json
      oracle_manifest.sha256
    blinded_inputs/         # Study-level data only (no pooled results)
      CD000028_pub4.json
      CD000143_pub2.json
      ... (300 files)
    extractor_outputs/      # Raw MetaSprint outputs (read only by judge)
      CD000028_pub4.json
      ...
    reports/                # Final validation reports
      validation_report.json
      validation_summary.csv
      failures/             # Per-review failure details
```

---

### Task 1: Oracle — Seal Reference Answers

**Files:**
- Create: `validation/oracle_seal.py`
- Create: `validation/sealed_oracle/` (directory)

**Step 1: Write the oracle computation test**

Create a self-test at the bottom of oracle_seal.py that validates against 3 known reviews:
- CD000028_pub4 (k=13, logOR=-0.1153, I2=0)
- CD000143_pub2 (k=47, logOR=-0.7197, I2=65.6%)
- A third review with tau2 > 0

```python
# oracle_seal.py
"""
ORACLE: Computes reference meta-analysis results from raw Cochrane CSV data.
Outputs sealed JSON with SHA-256 content hash.
This script must NEVER be imported by the extractor.
"""
import csv, math, json, hashlib, os, glob, sys, random

# ─── DerSimonian-Laird engine (OR, log scale) ───

def compute_study_or(ee, en, ce, cn):
    """Compute log-OR and SE from 2x2 table. Returns (logOR, SE) or None."""
    a, b, c, d = ee, en - ee, ce, cn - ce
    needs_cc = (a == 0 or b == 0 or c == 0 or d == 0)
    if needs_cc:
        a += 0.5; b += 0.5; c += 0.5; d += 0.5
    if a <= 0 or b <= 0 or c <= 0 or d <= 0:
        return None
    log_or = math.log((a * d) / (b * c))
    se = math.sqrt(1/a + 1/b + 1/c + 1/d)
    return (log_or, se, needs_cc)


def dl_meta_analysis(studies, conf_level=0.95):
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

    # Back-transform (OR is ratio measure)
    pooled = math.exp(mu_re)
    pooled_lo = math.exp(mu_re - z_crit * se_re)
    pooled_hi = math.exp(mu_re + z_crit * se_re)

    # Per-study weights
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
    d = 0.3989422804014327  # 1/sqrt(2*pi)
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


# ─── CSV parsing ───

def parse_cochrane_csv(csv_path, analysis_number='1'):
    """
    Parse a Cochrane pairwise CSV and extract overall binary studies for given analysis.
    Returns list of dicts with study, ee, en, ce, cn, year.
    """
    with open(csv_path, 'r', encoding='utf-8', errors='replace') as fh:
        reader = csv.DictReader(fh)
        rows = list(reader)

    # Filter to target analysis, overall rows (empty Subgroup number)
    target = [r for r in rows
              if r.get('Analysis number', '').strip() == str(analysis_number)
              and not r.get('Subgroup number', '').strip()]

    studies = []
    seen = set()
    for r in target:
        study = r.get('Study', '').strip()
        if not study or study in seen:
            continue
        seen.add(study)

        ee = r.get('Experimental cases', '').strip()
        en = r.get('Experimental N', '').strip()
        ce = r.get('Control cases', '').strip()
        cn = r.get('Control N', '').strip()

        if not all([ee, en, ce, cn]):
            continue

        try:
            studies.append({
                'study': study,
                'year': r.get('Study year', '').strip(),
                'ee': float(ee), 'en': float(en),
                'ce': float(ce), 'cn': float(cn),
                'analysis_name': r.get('Analysis name', '').strip(),
            })
        except ValueError:
            continue

    return studies


# ─── Oracle main: process all reviews, seal results ───

def find_csv_for_review(csv_dir, cd_number):
    """Find the CSV file(s) for a given CD review number."""
    pattern = f'*{cd_number}*data-rows.csv'
    matches = glob.glob(os.path.join(csv_dir, pattern))
    return matches


def seal_oracle(csv_dir, diagnostics_path, output_dir, n_sample=300, seed=42):
    """
    Main oracle function:
    1. Load diagnostics reference to identify usable reviews
    2. Sample 300 stratified by k
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
                diag[ds] = {
                    'k': int(row['k']),
                    'pooled_effect': pe,
                    'pooled_se': float(row.get('pooled_se', 0) or 0),
                    'i2': float(row.get('i2', 0) or 0),
                    'tau2': float(row.get('tau2', 0) or 0),
                    'q_stat': float(row.get('q_stat', 0) or 0),
                }

    # Filter k >= 2
    usable = {k: v for k, v in diag.items() if v['k'] >= 2}

    # Stratified sampling
    random.seed(seed)
    strata = {'2-3': [], '4-5': [], '6-10': [], '11-20': [], '21+': []}
    for ds, info in usable.items():
        k = info['k']
        if k <= 3: strata['2-3'].append(ds)
        elif k <= 5: strata['4-5'].append(ds)
        elif k <= 10: strata['6-10'].append(ds)
        elif k <= 20: strata['11-20'].append(ds)
        else: strata['21+'].append(ds)

    total_available = sum(len(v) for v in strata.values())
    selected = []
    for stratum, ds_list in strata.items():
        target = round(n_sample * len(ds_list) / total_available)
        n = min(target, len(ds_list))
        selected.extend(random.sample(ds_list, n))

    # Process each selected review
    results = {}
    cross_val_pass = 0
    cross_val_fail = 0
    skipped = 0

    for ds_name in selected:
        # Extract CD number from dataset name (e.g., CD000028_pub4_data -> CD000028)
        parts = ds_name.replace('_data', '').split('_')
        cd_number = parts[0]  # CD000028
        pub = parts[1] if len(parts) > 1 else ''  # pub4

        # Find CSV
        csvs = find_csv_for_review(csv_dir, cd_number)
        if not csvs:
            skipped += 1
            continue

        # Parse studies from CSV
        raw_studies = parse_cochrane_csv(csvs[0], analysis_number='1')
        if len(raw_studies) < 2:
            skipped += 1
            continue

        # Compute per-study OR + SE
        meta_input = []
        double_zero = 0
        for s in raw_studies:
            # Check for double-zero (both arms have 0 events)
            if s['ee'] == 0 and s['ce'] == 0:
                double_zero += 1
                continue  # Exclude double-zero studies from OR analysis
            result = compute_study_or(s['ee'], s['en'], s['ce'], s['cn'])
            if result:
                log_or, se, cc = result
                meta_input.append((s['study'], log_or, se))

        if len(meta_input) < 2:
            skipped += 1
            continue

        # DL meta-analysis
        ma = dl_meta_analysis(meta_input)
        if ma is None:
            skipped += 1
            continue

        # Cross-validate against diagnostics reference
        ref = diag[ds_name]
        log_or_diff = abs(ma['pooled_log'] - ref['pooled_effect'])
        k_match = ma['k'] == ref['k']

        if log_or_diff < 0.01 and k_match:
            cross_val_pass += 1
        else:
            cross_val_fail += 1

        results[ds_name] = {
            'cd_number': cd_number,
            'k': ma['k'],
            'pooled_log': ma['pooled_log'],
            'pooled_se': ma['pooled_se'],
            'pooled_or': ma['pooled'],
            'pooled_lo': ma['pooled_lo'],
            'pooled_hi': ma['pooled_hi'],
            'tau2': ma['tau2'],
            'I2': ma['I2'],
            'Q': ma['Q'],
            'p_value': ma['p_value'],
            'double_zero': double_zero,
            'cross_val': {
                'ref_log_effect': ref['pooled_effect'],
                'ref_k': ref['k'],
                'log_diff': log_or_diff,
                'k_match': k_match,
                'pass': log_or_diff < 0.01 and k_match,
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
        'n_skipped': skipped,
        'cross_val_pass': cross_val_pass,
        'cross_val_fail': cross_val_fail,
        'content_hash': content_hash,
        'seed': seed,
        'strata_sampled': {s: len([d for d in selected if d in results and _k_stratum(results[d]['k']) == s])
                          for s in strata},
    }

    manifest_path = os.path.join(output_dir, 'oracle_manifest.json')
    with open(manifest_path, 'w', encoding='utf-8') as fh:
        json.dump(manifest, fh, indent=2)

    print(f'Oracle sealed: {len(results)} reviews')
    print(f'Cross-validation: {cross_val_pass} pass, {cross_val_fail} fail, {skipped} skipped')
    print(f'Content hash: {content_hash[:16]}...')

    return results, manifest


def _k_stratum(k):
    if k <= 3: return '2-3'
    if k <= 5: return '4-5'
    if k <= 10: return '6-10'
    if k <= 20: return '11-20'
    return '21+'


# ─── Self-test ───

if __name__ == '__main__':
    CSV_DIR = r'C:\Users\user\OneDrive - NHS\Documents\CochraneDataExtractor\data\pairwise'
    DIAG_PATH = r'C:\Models\Pairwise70\analysis\output\analysis_diagnostics_results.csv'
    OUTPUT_DIR = os.path.join(os.path.dirname(__file__), 'sealed_oracle')

    if '--test' in sys.argv:
        # Self-test against known reviews
        print('=== Oracle Self-Test ===')

        # Test 1: CD000028 (k=13, logOR=-0.1153, I2=0)
        csvs = find_csv_for_review(CSV_DIR, 'CD000028')
        studies = parse_cochrane_csv(csvs[0])
        meta_input = []
        for s in studies:
            if s['ee'] == 0 and s['ce'] == 0:
                continue
            r = compute_study_or(s['ee'], s['en'], s['ce'], s['cn'])
            if r:
                meta_input.append((s['study'], r[0], r[1]))
        ma = dl_meta_analysis(meta_input)
        assert abs(ma['pooled_log'] - (-0.1153)) < 0.001, f'CD000028 logOR: {ma["pooled_log"]}'
        assert ma['k'] == 13, f'CD000028 k: {ma["k"]}'
        assert ma['I2'] < 1.0, f'CD000028 I2: {ma["I2"]}'
        print(f'  CD000028: PASS (logOR={ma["pooled_log"]:.4f}, k={ma["k"]}, I2={ma["I2"]:.1f}%)')

        print('All self-tests passed.')
    else:
        # Full oracle seal
        results, manifest = seal_oracle(CSV_DIR, DIAG_PATH, OUTPUT_DIR, n_sample=300)
```

**Step 2: Run self-test**

Run: `python validation/oracle_seal.py --test`
Expected: "All self-tests passed."

**Step 3: Run full oracle seal**

Run: `python validation/oracle_seal.py`
Expected: "Oracle sealed: ~295 reviews" (some may be skipped due to missing CSVs)
Expected: Cross-validation pass rate > 95%

**Step 4: Verify sealed output**

Check: `validation/sealed_oracle/oracle_results.json` exists with ~295 entries
Check: `validation/sealed_oracle/oracle_manifest.json` has content hash

**Step 5: Commit**

```bash
git add validation/oracle_seal.py
git commit -m "feat: add oracle seal script for blinded 300-review validation"
```

---

### Task 2: Prepare Blinded Inputs

**Files:**
- Create: `validation/prepare_inputs.py`
- Create: `validation/blinded_inputs/` (directory, populated by script)

This script reads the SAME raw Cochrane CSVs but outputs ONLY study-level data (author, year, ee, en, ce, cn). It does NOT include any pooled results. The extractor will read from this directory.

**Step 1: Write prepare_inputs.py**

```python
# prepare_inputs.py
"""
BLINDED INPUT PREPARATION: Extracts study-level data only.
Output contains NO pooled effects, NO expected I2/tau2, NO reference values.
The extractor reads ONLY from blinded_inputs/.
"""
import json, os, sys, math

# Import ONLY the CSV parser and study-level OR computation from oracle
# (NOT the DL engine or reference data)
sys.path.insert(0, os.path.dirname(__file__))
from oracle_seal import parse_cochrane_csv, find_csv_for_review, compute_study_or, _normal_quantile


def prepare_blinded_inputs(oracle_manifest_path, csv_dir, output_dir):
    """
    Read the oracle manifest to know WHICH reviews to prepare,
    then extract study-level data ONLY (no pooled results).
    """
    os.makedirs(output_dir, exist_ok=True)

    # Read oracle results to get the list of reviews (but NOT their pooled values)
    oracle_path = oracle_manifest_path.replace('oracle_manifest.json', 'oracle_results.json')
    with open(oracle_path, 'r', encoding='utf-8') as fh:
        oracle = json.load(fh)

    z_crit = _normal_quantile(0.975)  # 1.96 for 95% CI

    prepared = 0
    for ds_name, oracle_info in oracle.items():
        cd_number = oracle_info['cd_number']
        csvs = find_csv_for_review(csv_dir, cd_number)
        if not csvs:
            continue

        raw_studies = parse_cochrane_csv(csvs[0], analysis_number='1')

        # Compute per-study OR + CI (this is what the extractor will enter)
        blinded_studies = []
        for s in raw_studies:
            if s['ee'] == 0 and s['ce'] == 0:
                continue  # Double-zero excluded
            result = compute_study_or(s['ee'], s['en'], s['ce'], s['cn'])
            if result is None:
                continue
            log_or, se, cc_applied = result
            # Back-transform to OR scale with CI
            or_val = math.exp(log_or)
            or_lo = math.exp(log_or - z_crit * se)
            or_hi = math.exp(log_or + z_crit * se)

            blinded_studies.append({
                'study': s['study'],
                'year': s['year'],
                'ee': s['ee'], 'en': s['en'],
                'ce': s['ce'], 'cn': s['cn'],
                'effect_estimate': round(or_val, 6),
                'lower_ci': round(or_lo, 6),
                'upper_ci': round(or_hi, 6),
                'effect_type': 'OR',
                'cc_applied': cc_applied,
            })

        if len(blinded_studies) < 2:
            continue

        # Output: study-level data ONLY — no pooled results
        blinded_output = {
            'dataset_name': ds_name,
            'cd_number': cd_number,
            'analysis_name': raw_studies[0].get('analysis_name', ''),
            'k': len(blinded_studies),
            'studies': blinded_studies,
            # EXPLICITLY NO: pooled_effect, pooled_ci, I2, tau2, Q
        }

        out_path = os.path.join(output_dir, f'{ds_name}.json')
        with open(out_path, 'w', encoding='utf-8') as fh:
            json.dump(blinded_output, fh, indent=2)

        prepared += 1

    print(f'Prepared {prepared} blinded input files in {output_dir}')
    return prepared


if __name__ == '__main__':
    ORACLE_MANIFEST = os.path.join(os.path.dirname(__file__), 'sealed_oracle', 'oracle_manifest.json')
    CSV_DIR = r'C:\Users\user\OneDrive - NHS\Documents\CochraneDataExtractor\data\pairwise'
    OUTPUT_DIR = os.path.join(os.path.dirname(__file__), 'blinded_inputs')

    n = prepare_blinded_inputs(ORACLE_MANIFEST, CSV_DIR, OUTPUT_DIR)
    print(f'Done. {n} files ready for blinded extraction.')
```

**Step 2: Run after oracle is sealed**

Run: `python validation/prepare_inputs.py`
Expected: "Prepared ~295 blinded input files"

**Step 3: Verify blinding**

```bash
# Verify no file in blinded_inputs/ contains pooled results
python -c "
import json, glob
for f in glob.glob('validation/blinded_inputs/*.json'):
    d = json.load(open(f))
    assert 'pooled' not in str(d).lower(), f'BLINDING VIOLATION: {f}'
print('Blinding verified: no pooled results in any input file')
"
```

**Step 4: Commit**

```bash
git add validation/prepare_inputs.py
git commit -m "feat: add blinded input preparation for 300-review validation"
```

---

### Task 3: Blinded Extractor (Selenium)

**Files:**
- Create: `validation/blinded_extractor.py`
- Create: `validation/extractor_outputs/` (directory)

This is the core test: it drives MetaSprint Autopilot HTML via Selenium, entering study data and reading back analysis results. It reads ONLY from `blinded_inputs/` and writes to `extractor_outputs/`.

**Step 1: Write blinded_extractor.py**

```python
# blinded_extractor.py
"""
BLINDED EXTRACTOR: Drives MetaSprint Autopilot via Selenium.
Reads ONLY from blinded_inputs/ — never touches sealed_oracle/.
Outputs raw MetaSprint analysis results to extractor_outputs/.
"""
import json, os, sys, time, glob, io

# BLINDING ENFORCEMENT: Assert we never import oracle
assert 'oracle_results' not in str(sys.modules), 'BLINDING VIOLATION'

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# UTF-8 for Windows console
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')


def create_driver():
    """Create headless Chrome driver."""
    opts = Options()
    opts.add_argument('--headless=new')
    opts.add_argument('--no-sandbox')
    opts.add_argument('--disable-dev-shm-usage')
    opts.add_argument('--window-size=1920,1080')
    opts.set_capability('goog:loggingPrefs', {'browser': 'ALL'})
    driver = webdriver.Chrome(options=opts)
    return driver


def load_app(driver, html_path):
    """Load MetaSprint Autopilot HTML app."""
    url = 'file:///' + html_path.replace('\\', '/')
    driver.get(url)
    time.sleep(2)
    # Wait for app initialization
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'extractBody'))
    )


def enter_studies(driver, studies):
    """Enter study data into extraction table."""
    for i, s in enumerate(studies):
        # Click "Add Study" button
        driver.execute_script("addStudyRow()")
        time.sleep(0.1)

        # Find the last row in the extraction table
        rows = driver.find_elements(By.CSS_SELECTOR, '#extractBody tr')
        row = rows[-1]
        inputs = row.find_elements(By.TAG_NAME, 'input')
        selects = row.find_elements(By.TAG_NAME, 'select')

        # Fill fields: Study ID, N Total, N Intervention, N Control,
        #              Effect, Lower CI, Upper CI
        study_id = f"{s['study']} {s['year']}".strip()
        n_total = int(s['en'] + s['cn'])

        field_values = [
            study_id,                           # Study ID
            str(n_total),                       # N Total
            str(int(s['en'])),                  # N Intervention
            str(int(s['cn'])),                  # N Control
            str(s['effect_estimate']),          # Effect
            str(s['lower_ci']),                 # Lower CI
            str(s['upper_ci']),                 # Upper CI
        ]

        for j, val in enumerate(field_values):
            if j < len(inputs):
                inputs[j].clear()
                inputs[j].send_keys(val)

        # Set effect type to OR
        if selects:
            driver.execute_script(
                "arguments[0].value = 'OR'; arguments[0].dispatchEvent(new Event('change'))",
                selects[0]
            )

        time.sleep(0.05)


def run_analysis(driver):
    """Click Run Analysis and extract results."""
    # Switch to Analysis phase
    driver.execute_script("switchPhase('analysis')")
    time.sleep(0.5)

    # Click Run Analysis
    run_btn = driver.find_element(By.XPATH, "//button[contains(text(), 'Run Analysis')]")
    run_btn.click()
    time.sleep(1)

    # Extract results from stat cards
    results = {}

    # Read stat card values
    stat_cards = driver.find_elements(By.CSS_SELECTOR, '.stat-card .stat-value')
    stat_labels = driver.find_elements(By.CSS_SELECTOR, '.stat-card .stat-label')

    for label_el, value_el in zip(stat_labels, stat_cards):
        label = label_el.text.strip().lower()
        value = value_el.text.strip()

        if 'studies' in label:
            results['k'] = int(value) if value.isdigit() else value
        elif 'pooled' in label or 'effect' in label:
            results['pooled_effect'] = _parse_float(value)
        elif '95%' in label or 'ci' in label:
            # Parse "0.82 [0.72, 0.93]" format
            results['ci_text'] = value
            parts = value.replace('[', '').replace(']', '').replace(',', ' ').split()
            if len(parts) >= 2:
                results['ci_lo'] = _parse_float(parts[-2] if len(parts) > 2 else parts[0])
                results['ci_hi'] = _parse_float(parts[-1])
        elif 'i' in label and '2' in label:  # I-squared
            results['I2'] = _parse_float(value.replace('%', ''))
        elif 'tau' in label:  # tau-squared
            results['tau2'] = _parse_float(value)
        elif 'p-val' in label or 'p val' in label:
            results['p_value'] = _parse_float(value)

    # Also try to extract from JavaScript state
    try:
        js_results = driver.execute_script("""
            if (typeof lastMetaResult !== 'undefined' && lastMetaResult) {
                return {
                    k: lastMetaResult.k,
                    pooled: lastMetaResult.pooled,
                    pooled_lo: lastMetaResult.pooledLo,
                    pooled_hi: lastMetaResult.pooledHi,
                    tau2: lastMetaResult.tau2,
                    I2: lastMetaResult.I2,
                    Q: lastMetaResult.Q,
                    p_value: lastMetaResult.pValue,
                    pooled_log: lastMetaResult.muRE,
                    pooled_se: lastMetaResult.seRE,
                };
            }
            return null;
        """)
        if js_results:
            results['js'] = js_results
    except Exception:
        pass

    # Check forest plot rendered
    forest_svg = driver.find_elements(By.CSS_SELECTOR, '#forestPlot svg')
    results['forest_plot_rendered'] = len(forest_svg) > 0

    # Check funnel plot rendered
    funnel_svg = driver.find_elements(By.CSS_SELECTOR, '#funnelPlot svg')
    results['funnel_plot_rendered'] = len(funnel_svg) > 0

    return results


def _parse_float(s):
    """Safely parse a float from string."""
    try:
        return float(str(s).strip())
    except (ValueError, TypeError):
        return None


def clear_studies(driver):
    """Clear all studies from extraction table for next review."""
    driver.execute_script("""
        document.getElementById('extractBody').innerHTML = '';
        if (typeof lastMetaResult !== 'undefined') lastMetaResult = null;
    """)
    time.sleep(0.2)


def run_blinded_extraction(input_dir, output_dir, html_path, batch_size=50):
    """
    Main extraction loop: for each blinded input, drive MetaSprint and capture results.
    Uses batch_size to periodically restart the browser (memory management).
    """
    os.makedirs(output_dir, exist_ok=True)

    input_files = sorted(glob.glob(os.path.join(input_dir, '*.json')))
    print(f'Found {len(input_files)} blinded input files')

    driver = None
    processed = 0
    errors = 0

    for i, input_file in enumerate(input_files):
        ds_name = os.path.basename(input_file).replace('.json', '')
        output_path = os.path.join(output_dir, f'{ds_name}.json')

        # Skip if already extracted
        if os.path.exists(output_path):
            processed += 1
            continue

        # Restart browser every batch_size reviews
        if driver is None or i % batch_size == 0:
            if driver:
                driver.quit()
            driver = create_driver()
            load_app(driver, html_path)

        try:
            # Load blinded input
            with open(input_file, 'r', encoding='utf-8') as fh:
                blinded = json.load(fh)

            # BLINDING CHECK: verify no pooled results in input
            input_str = json.dumps(blinded).lower()
            assert 'pooled' not in input_str, f'BLINDING VIOLATION in {input_file}'

            # Switch to extraction phase and clear
            driver.execute_script("switchPhase('extraction')")
            time.sleep(0.3)
            clear_studies(driver)

            # Enter studies
            enter_studies(driver, blinded['studies'])

            # Run analysis
            results = run_analysis(driver)

            # Save output (extractor results only, no reference)
            output = {
                'dataset_name': ds_name,
                'cd_number': blinded['cd_number'],
                'analysis_name': blinded.get('analysis_name', ''),
                'k_input': blinded['k'],
                'results': results,
                # EXPLICITLY NO reference values
            }

            with open(output_path, 'w', encoding='utf-8') as fh:
                json.dump(output, fh, indent=2)

            processed += 1
            if processed % 10 == 0:
                print(f'  Processed {processed}/{len(input_files)}...')

        except Exception as e:
            errors += 1
            print(f'  ERROR {ds_name}: {e}')
            # Save error record
            error_output = {
                'dataset_name': ds_name,
                'error': str(e),
                'results': None,
            }
            with open(output_path, 'w', encoding='utf-8') as fh:
                json.dump(error_output, fh, indent=2)

    if driver:
        driver.quit()

    print(f'\nExtraction complete: {processed} processed, {errors} errors')
    return processed, errors


if __name__ == '__main__':
    BASE = os.path.dirname(__file__)
    INPUT_DIR = os.path.join(BASE, 'blinded_inputs')
    OUTPUT_DIR = os.path.join(BASE, 'extractor_outputs')
    HTML_PATH = os.path.join(os.path.dirname(BASE), 'metasprint-autopilot.html')

    # BLINDING: verify sealed_oracle is not accidentally imported
    assert not any('oracle_results' in str(m) for m in sys.modules.values()), 'BLINDING VIOLATION'

    run_blinded_extraction(INPUT_DIR, OUTPUT_DIR, HTML_PATH)
```

**Step 2: Test with 3 reviews first**

Run: `python -c "...subset test with 3 inputs only..."`
Expected: 3 extractor_outputs JSON files created

**Step 3: Run full extraction (300 reviews)**

Run: `python validation/blinded_extractor.py`
Expected: ~295 outputs, < 5% error rate
Time estimate: ~30-60 minutes (0.1s per study * ~15 studies avg * 300 reviews + overhead)

**Step 4: Commit**

```bash
git add validation/blinded_extractor.py
git commit -m "feat: add blinded Selenium extractor for 300-review validation"
```

---

### Task 4: Judge — Compare Oracle vs Extractor

**Files:**
- Create: `validation/judge_compare.py`
- Create: `validation/reports/` (directory)

The judge is the ONLY script that reads both sealed oracle and extractor outputs.

**Step 1: Write judge_compare.py**

```python
# judge_compare.py
"""
JUDGE: Compares sealed oracle results against blinded extractor outputs.
This is the ONLY script that reads both oracle and extractor files.
Produces accuracy report with per-review details.
"""
import json, os, sys, csv, math, io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# Tolerances
TOL_EFFECT = 0.01       # ±0.01 on OR scale
TOL_LOG_EFFECT = 0.005  # ±0.005 on logOR scale
TOL_CI = 0.02           # ±0.02 on OR scale
TOL_I2 = 2.0            # ±2 percentage points
TOL_TAU2 = 0.01         # ±0.01
TOL_K = 0               # Exact match


def compare_results(oracle, extractor):
    """
    Compare a single oracle result against extractor output.
    Returns dict with match status per metric.
    """
    ext = extractor.get('results', {})
    if ext is None:
        return {'status': 'extractor_error', 'metrics': {}}

    # Prefer JS-level results (more precise) over DOM-scraped
    js = ext.get('js', {})

    metrics = {}

    # k (study count)
    ext_k = js.get('k', ext.get('k'))
    if ext_k is not None:
        metrics['k'] = {
            'oracle': oracle['k'],
            'extractor': ext_k,
            'diff': abs(oracle['k'] - ext_k),
            'pass': oracle['k'] == ext_k,
        }

    # Pooled effect (OR scale)
    ext_pooled = js.get('pooled', ext.get('pooled_effect'))
    if ext_pooled is not None:
        diff = abs(oracle['pooled_or'] - ext_pooled)
        metrics['pooled_or'] = {
            'oracle': oracle['pooled_or'],
            'extractor': ext_pooled,
            'diff': diff,
            'pass': diff < TOL_EFFECT,
        }

    # Pooled log-effect (more precise comparison)
    ext_log = js.get('pooled_log')
    if ext_log is not None:
        diff = abs(oracle['pooled_log'] - ext_log)
        metrics['pooled_log'] = {
            'oracle': oracle['pooled_log'],
            'extractor': ext_log,
            'diff': diff,
            'pass': diff < TOL_LOG_EFFECT,
        }

    # CI bounds
    ext_lo = js.get('pooled_lo', ext.get('ci_lo'))
    ext_hi = js.get('pooled_hi', ext.get('ci_hi'))
    if ext_lo is not None:
        diff_lo = abs(oracle['pooled_lo'] - ext_lo)
        metrics['ci_lo'] = {
            'oracle': oracle['pooled_lo'],
            'extractor': ext_lo,
            'diff': diff_lo,
            'pass': diff_lo < TOL_CI,
        }
    if ext_hi is not None:
        diff_hi = abs(oracle['pooled_hi'] - ext_hi)
        metrics['ci_hi'] = {
            'oracle': oracle['pooled_hi'],
            'extractor': ext_hi,
            'diff': diff_hi,
            'pass': diff_hi < TOL_CI,
        }

    # I-squared
    ext_i2 = js.get('I2', ext.get('I2'))
    if ext_i2 is not None:
        diff = abs(oracle['I2'] - ext_i2)
        metrics['I2'] = {
            'oracle': oracle['I2'],
            'extractor': ext_i2,
            'diff': diff,
            'pass': diff < TOL_I2,
        }

    # tau-squared
    ext_tau2 = js.get('tau2', ext.get('tau2'))
    if ext_tau2 is not None:
        diff = abs(oracle['tau2'] - ext_tau2)
        metrics['tau2'] = {
            'oracle': oracle['tau2'],
            'extractor': ext_tau2,
            'diff': diff,
            'pass': diff < TOL_TAU2,
        }

    # Forest plot rendered
    metrics['forest_plot'] = {
        'rendered': ext.get('forest_plot_rendered', False),
        'pass': ext.get('forest_plot_rendered', False),
    }

    # Funnel plot rendered
    metrics['funnel_plot'] = {
        'rendered': ext.get('funnel_plot_rendered', False),
        'pass': ext.get('funnel_plot_rendered', False),
    }

    # Overall status
    all_pass = all(m.get('pass', False) for m in metrics.values())

    return {
        'status': 'pass' if all_pass else 'fail',
        'metrics': metrics,
    }


def run_judge(oracle_path, extractor_dir, report_dir):
    """
    Main judge function: compare all oracle entries against extractor outputs.
    """
    os.makedirs(report_dir, exist_ok=True)
    os.makedirs(os.path.join(report_dir, 'failures'), exist_ok=True)

    # Load sealed oracle
    with open(oracle_path, 'r', encoding='utf-8') as fh:
        oracle = json.load(fh)

    print(f'Oracle: {len(oracle)} reviews')

    # Compare each
    results = {}
    total_pass = 0
    total_fail = 0
    total_error = 0
    metric_pass_counts = {}
    metric_total_counts = {}

    for ds_name, oracle_entry in oracle.items():
        ext_path = os.path.join(extractor_dir, f'{ds_name}.json')

        if not os.path.exists(ext_path):
            results[ds_name] = {'status': 'missing', 'metrics': {}}
            total_error += 1
            continue

        with open(ext_path, 'r', encoding='utf-8') as fh:
            extractor_entry = json.load(fh)

        if extractor_entry.get('error'):
            results[ds_name] = {'status': 'extractor_error', 'error': extractor_entry['error'], 'metrics': {}}
            total_error += 1
            continue

        comparison = compare_results(oracle_entry, extractor_entry)
        results[ds_name] = comparison

        if comparison['status'] == 'pass':
            total_pass += 1
        else:
            total_fail += 1
            # Save failure detail
            failure = {
                'ds_name': ds_name,
                'oracle': oracle_entry,
                'extractor': extractor_entry.get('results', {}),
                'comparison': comparison,
            }
            fail_path = os.path.join(report_dir, 'failures', f'{ds_name}.json')
            with open(fail_path, 'w', encoding='utf-8') as fh:
                json.dump(failure, fh, indent=2)

        # Track per-metric pass rates
        for metric_name, metric_data in comparison['metrics'].items():
            metric_total_counts[metric_name] = metric_total_counts.get(metric_name, 0) + 1
            if metric_data.get('pass', False):
                metric_pass_counts[metric_name] = metric_pass_counts.get(metric_name, 0) + 1

    # Summary
    total = total_pass + total_fail + total_error

    summary = {
        'total_reviews': total,
        'pass': total_pass,
        'fail': total_fail,
        'error': total_error,
        'pass_rate': total_pass / max(1, total_pass + total_fail) * 100,
        'metric_pass_rates': {
            m: metric_pass_counts.get(m, 0) / max(1, metric_total_counts[m]) * 100
            for m in metric_total_counts
        },
        'tolerances': {
            'effect': TOL_EFFECT,
            'log_effect': TOL_LOG_EFFECT,
            'ci': TOL_CI,
            'I2': TOL_I2,
            'tau2': TOL_TAU2,
        },
    }

    # Print summary
    print(f'\n{"="*60}')
    print(f'VALIDATION REPORT: {total} reviews')
    print(f'{"="*60}')
    print(f'  PASS:  {total_pass} ({summary["pass_rate"]:.1f}%)')
    print(f'  FAIL:  {total_fail}')
    print(f'  ERROR: {total_error}')
    print(f'\nPer-metric pass rates:')
    for m, rate in sorted(summary['metric_pass_rates'].items()):
        print(f'  {m:15s}: {rate:.1f}% ({metric_pass_counts.get(m,0)}/{metric_total_counts[m]})')

    # Save reports
    report_path = os.path.join(report_dir, 'validation_report.json')
    with open(report_path, 'w', encoding='utf-8') as fh:
        json.dump({'summary': summary, 'details': results}, fh, indent=2)

    # CSV summary
    csv_path = os.path.join(report_dir, 'validation_summary.csv')
    with open(csv_path, 'w', newline='', encoding='utf-8') as fh:
        writer = csv.writer(fh)
        writer.writerow(['dataset', 'status', 'k_match', 'effect_diff', 'ci_lo_diff',
                         'ci_hi_diff', 'I2_diff', 'tau2_diff', 'forest', 'funnel'])
        for ds_name, comp in results.items():
            m = comp.get('metrics', {})
            writer.writerow([
                ds_name,
                comp['status'],
                m.get('k', {}).get('pass', ''),
                f"{m.get('pooled_or', {}).get('diff', ''):.6f}" if 'pooled_or' in m else '',
                f"{m.get('ci_lo', {}).get('diff', ''):.6f}" if 'ci_lo' in m else '',
                f"{m.get('ci_hi', {}).get('diff', ''):.6f}" if 'ci_hi' in m else '',
                f"{m.get('I2', {}).get('diff', ''):.1f}" if 'I2' in m else '',
                f"{m.get('tau2', {}).get('diff', ''):.6f}" if 'tau2' in m else '',
                m.get('forest_plot', {}).get('pass', ''),
                m.get('funnel_plot', {}).get('pass', ''),
            ])

    print(f'\nReports saved to {report_dir}')
    return summary


if __name__ == '__main__':
    BASE = os.path.dirname(__file__)
    ORACLE_PATH = os.path.join(BASE, 'sealed_oracle', 'oracle_results.json')
    EXTRACTOR_DIR = os.path.join(BASE, 'extractor_outputs')
    REPORT_DIR = os.path.join(BASE, 'reports')

    summary = run_judge(ORACLE_PATH, EXTRACTOR_DIR, REPORT_DIR)
```

**Step 2: Run judge after extraction completes**

Run: `python validation/judge_compare.py`
Expected: Accuracy report with per-metric pass rates

**Step 3: Commit**

```bash
git add validation/judge_compare.py
git commit -m "feat: add judge comparison script for blinded validation"
```

---

### Task 5: Orchestrator

**Files:**
- Create: `validation/run_validation.py`

Single script that runs the entire pipeline in order with timing.

**Step 1: Write run_validation.py**

```python
# run_validation.py
"""
ORCHESTRATOR: Runs the complete blinded validation pipeline.
  1. Oracle seals reference answers
  2. Prepare blinded inputs (study-level only)
  3. Blinded extractor drives MetaSprint via Selenium
  4. Judge compares and produces report
"""
import os, sys, time, io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

BASE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE)

CSV_DIR = r'C:\Users\user\OneDrive - NHS\Documents\CochraneDataExtractor\data\pairwise'
DIAG_PATH = r'C:\Models\Pairwise70\analysis\output\analysis_diagnostics_results.csv'
HTML_PATH = os.path.join(os.path.dirname(BASE), 'metasprint-autopilot.html')

ORACLE_DIR = os.path.join(BASE, 'sealed_oracle')
INPUT_DIR = os.path.join(BASE, 'blinded_inputs')
OUTPUT_DIR = os.path.join(BASE, 'extractor_outputs')
REPORT_DIR = os.path.join(BASE, 'reports')

N_REVIEWS = 300  # Target sample size


def main():
    t0 = time.time()

    # ─── Phase 1: Oracle ───
    print('=' * 60)
    print('PHASE 1: ORACLE — Sealing reference answers')
    print('=' * 60)
    t1 = time.time()

    from oracle_seal import seal_oracle
    results, manifest = seal_oracle(CSV_DIR, DIAG_PATH, ORACLE_DIR, n_sample=N_REVIEWS)

    print(f'  Time: {time.time()-t1:.1f}s')
    print()

    # ─── Phase 2: Prepare blinded inputs ───
    print('=' * 60)
    print('PHASE 2: PREPARING BLINDED INPUTS')
    print('=' * 60)
    t2 = time.time()

    from prepare_inputs import prepare_blinded_inputs
    oracle_manifest = os.path.join(ORACLE_DIR, 'oracle_manifest.json')
    n_prepared = prepare_blinded_inputs(oracle_manifest, CSV_DIR, INPUT_DIR)

    print(f'  Time: {time.time()-t2:.1f}s')
    print()

    # ─── Phase 3: Blinded extraction ───
    print('=' * 60)
    print('PHASE 3: BLINDED EXTRACTION (Selenium)')
    print('=' * 60)
    t3 = time.time()

    from blinded_extractor import run_blinded_extraction
    n_extracted, n_errors = run_blinded_extraction(INPUT_DIR, OUTPUT_DIR, HTML_PATH)

    print(f'  Time: {time.time()-t3:.1f}s')
    print()

    # ─── Phase 4: Judge ───
    print('=' * 60)
    print('PHASE 4: JUDGE — Comparing oracle vs extractor')
    print('=' * 60)
    t4 = time.time()

    from judge_compare import run_judge
    oracle_path = os.path.join(ORACLE_DIR, 'oracle_results.json')
    summary = run_judge(oracle_path, OUTPUT_DIR, REPORT_DIR)

    print(f'  Time: {time.time()-t4:.1f}s')

    # ─── Final summary ───
    total_time = time.time() - t0
    print()
    print('=' * 60)
    print(f'COMPLETE in {total_time:.0f}s ({total_time/60:.1f} min)')
    print(f'Oracle: {len(results)} reviews sealed')
    print(f'Extracted: {n_extracted} ({n_errors} errors)')
    print(f'Pass rate: {summary["pass_rate"]:.1f}%')
    print('=' * 60)


if __name__ == '__main__':
    main()
```

**Step 2: Create validation/__init__.py (empty)**

```python
# Empty init for package imports
```

**Step 3: Run full pipeline**

Run: `python validation/run_validation.py`
Expected: Complete pipeline with final pass rate report

**Step 4: Commit**

```bash
git add validation/
git commit -m "feat: complete blinded 300-review validation harness"
```

---

### Task 6: MetaSprint HTML App Fixes (if needed)

Based on validation failures, fix any issues found in the MetaSprint analysis engine.

**Files:**
- Modify: `metasprint-autopilot.html` (analysis engine section)

**Step 1: Analyze failure patterns**

Read: `validation/reports/validation_report.json`
Categorize failures by metric (effect, CI, I2, tau2, plots)

**Step 2: Fix issues**

Common expected issues:
- Continuity correction handling (0.5 for zero cells)
- Double-zero study exclusion
- Rounding differences in display vs computation
- Effect type detection (OR vs RR)

**Step 3: Re-run validation**

Run: `python validation/run_validation.py`
Expected: Improved pass rate

**Step 4: Commit**

```bash
git add metasprint-autopilot.html
git commit -m "fix: address validation failures in meta-analysis engine"
```

---

### Task 7: Add CT.gov and PubMed Validation Phases (Phase B/C)

**Files:**
- Create: `validation/ctgov_validator.py`
- Create: `validation/pubmed_validator.py`

These are ADDITIONAL validation layers that test the search/discovery features.

**Step 1: CT.gov validator (subset of ~100 reviews)**

For reviews where studies have known NCT IDs, verify MetaSprint's CT.gov search can find them from PICO terms.

**Step 2: PubMed validator (subset of ~50 reviews)**

For reviews with known PMIDs, verify PubMed E-utilities search returns relevant studies.

**Step 3: Integration into orchestrator**

Add Phase 5 and Phase 6 to `run_validation.py`.

---

## Success Criteria

| Metric | Target | Minimum Acceptable |
|--------|--------|--------------------|
| Reviews processed | 300 | 280 |
| Pooled OR match (±0.01) | > 98% | > 95% |
| CI bounds match (±0.02) | > 98% | > 95% |
| I2 match (±2%) | > 95% | > 90% |
| tau2 match (±0.01) | > 95% | > 90% |
| k exact match | 100% | > 98% |
| Forest plot rendered | 100% | > 98% |
| Funnel plot rendered | 100% | > 98% |
| Oracle cross-validation | > 95% | > 90% |
| CT.gov NCT discovery (Phase B) | > 70% | > 50% |
| PubMed PMID discovery (Phase C) | > 80% | > 60% |

## Blinding Verification Checklist

- [ ] `blinded_extractor.py` never imports from `sealed_oracle/`
- [ ] `blinded_inputs/*.json` contain NO pooled results
- [ ] Only `judge_compare.py` reads both oracle and extractor files
- [ ] Oracle is sealed with SHA-256 hash BEFORE extraction begins
- [ ] Extractor outputs contain NO reference values
