# Al-Burhan Phase 1: Living Meta-Analysis of All Cardiology

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a Python harvester that extracts ALL structured outcome data from ~7,742 cardiovascular CT.gov trials, normalizes drugs/outcomes, auto-clusters into poolable groups, auto-pools via DL, validates against Pairwise70 published MAs, classifies discoveries, and feeds into the Ayat Universe visualization.

**Architecture:** Python data pipeline (harvest + normalize + cluster + export JSON) feeds a browser-side engine (load JSON + auto-pool + validate + visualize). The DL meta-analysis engine already validated to CCC=1.0 runs in-browser. Pairwise70 (4,424 comparisons) serves as SHAHID validation oracle. GWAM ghost data (501 reviews) provides publication bias weights.

**Tech Stack:** Python 3.13 (requests, json), CT.gov API v2, existing JS DL engine, IndexedDB, Canvas 2D (Ayat Universe)

**Quranic Architecture:**
- AL-KITAB (Layer 1): CT.gov structured data harvest
- SHAHID (Layer 2): Pairwise70 validation oracle
- AL-MIZAN (Layer 4): Auto-pooling engine
- FURQAN (Layer 5): Discovery classification
- NUR (Layer 6): Ayat Universe visualization
- GHAYB (Layer 7): Ghost protocol overlay

---

## Task 1: CT.gov Cardiovascular Results Harvester

**Files:**
- Create: `pipeline/harvest_ctgov_results.py`
- Create: `pipeline/__init__.py` (empty)
- Test: `pipeline/test_harvest.py`

**Context:** CT.gov API v2 returns structured results in `resultsSection.outcomeMeasuresModule.outcomeMeasures[].analyses[]` with `paramValue`, `ciLowerLimit`, `ciUpperLimit`, `pValue`, `statisticalMethod`, `paramType`. Rate limit ~50 req/min, pageSize up to 1000. ~7,742 CV trials with results.

**Step 1: Write the failing test**

```python
"""Test CT.gov cardiovascular results harvester."""
import json, os, sys
sys.path.insert(0, os.path.dirname(__file__))
import pytest

def test_parse_analysis_entry():
    """Parse a single CT.gov analysis entry into poolable effect size."""
    from harvest_ctgov_results import parse_analysis
    raw = {
        "groupIds": ["OG000", "OG001"],
        "paramType": "Hazard Ratio",
        "paramValue": "0.67",
        "ciPctValue": "95",
        "ciNumSides": "TWO_SIDED",
        "ciLowerLimit": "0.55",
        "ciUpperLimit": "0.82",
        "pValue": "0.0001",
        "statisticalMethod": "Cox Proportional Hazards"
    }
    result = parse_analysis(raw)
    assert result is not None
    assert result['effect_type'] == 'HR'
    assert abs(result['effect_estimate'] - 0.67) < 1e-6
    assert abs(result['lower_ci'] - 0.55) < 1e-6
    assert abs(result['upper_ci'] - 0.82) < 1e-6
    assert result['ci_level'] == 0.95
    assert result['is_ratio'] is True

def test_parse_analysis_odds_ratio():
    raw = {
        "paramType": "Odds Ratio (OR)",
        "paramValue": "1.25",
        "ciPctValue": "95",
        "ciNumSides": "TWO_SIDED",
        "ciLowerLimit": "0.80",
        "ciUpperLimit": "1.95"
    }
    result = parse_analysis(raw)
    assert result['effect_type'] == 'OR'
    assert result['is_ratio'] is True

def test_parse_analysis_mean_difference():
    raw = {
        "paramType": "Mean Difference (Final Values)",
        "paramValue": "-3.5",
        "ciPctValue": "95",
        "ciNumSides": "TWO_SIDED",
        "ciLowerLimit": "-5.2",
        "ciUpperLimit": "-1.8"
    }
    result = parse_analysis(raw)
    assert result['effect_type'] == 'MD'
    assert result['is_ratio'] is False

def test_parse_analysis_missing_ci_returns_none():
    raw = {"paramType": "Hazard Ratio", "paramValue": "0.8"}
    result = parse_analysis(raw)
    assert result is None  # No CI = not poolable

def test_parse_analysis_non_numeric_returns_none():
    raw = {
        "paramType": "Hazard Ratio",
        "paramValue": "NA",
        "ciLowerLimit": "0.5",
        "ciUpperLimit": "1.5"
    }
    result = parse_analysis(raw)
    assert result is None

def test_extract_trial_effects():
    """Extract all poolable effects from a single trial's results section."""
    from harvest_ctgov_results import extract_trial_effects
    trial = {
        "protocolSection": {
            "identificationModule": {"nctId": "NCT00000001", "briefTitle": "Test Trial"},
            "conditionsModule": {"conditions": ["Heart Failure"]},
            "armsInterventionsModule": {
                "interventions": [
                    {"type": "DRUG", "name": "Dapagliflozin 10mg"},
                    {"type": "DRUG", "name": "Placebo"}
                ]
            },
            "designModule": {
                "phases": ["PHASE3"],
                "enrollmentInfo": {"count": 4744}
            },
            "statusModule": {"startDateStruct": {"date": "2017-02"}}
        },
        "resultsSection": {
            "outcomeMeasuresModule": {
                "outcomeMeasures": [{
                    "type": "PRIMARY",
                    "title": "CV death or HF hospitalization",
                    "classes": [{"categories": [{"measurements": [
                        {"groupId": "OG000", "value": "386"},
                        {"groupId": "OG001", "value": "502"}
                    ]}]}],
                    "analyses": [{
                        "groupIds": ["OG000", "OG001"],
                        "paramType": "Hazard Ratio",
                        "paramValue": "0.74",
                        "ciPctValue": "95",
                        "ciNumSides": "TWO_SIDED",
                        "ciLowerLimit": "0.65",
                        "ciUpperLimit": "0.85",
                        "pValue": "0.00001",
                        "statisticalMethod": "Cox Proportional Hazards"
                    }]
                }]
            }
        }
    }
    effects = extract_trial_effects(trial)
    assert len(effects) >= 1
    e = effects[0]
    assert e['nct_id'] == 'NCT00000001'
    assert e['intervention'] == 'Dapagliflozin'
    assert e['outcome_title'] == 'CV death or HF hospitalization'
    assert e['outcome_type'] == 'PRIMARY'
    assert e['effect_type'] == 'HR'
    assert abs(e['effect_estimate'] - 0.74) < 1e-6
    assert e['enrollment'] == 4744
    assert e['phase'] == 3

def test_normalize_param_type():
    from harvest_ctgov_results import normalize_param_type
    assert normalize_param_type("Hazard Ratio") == ('HR', True)
    assert normalize_param_type("hazard ratio, log") == ('HR', True)
    assert normalize_param_type("Odds Ratio (OR)") == ('OR', True)
    assert normalize_param_type("Risk Ratio (RR)") == ('RR', True)
    assert normalize_param_type("Mean Difference (Final Values)") == ('MD', False)
    assert normalize_param_type("risk difference") == ('RD', False)
    assert normalize_param_type("Difference in event rate") is None  # ambiguous
```

**Step 2: Run test to verify it fails**

Run: `python -m pytest pipeline/test_harvest.py -v`
Expected: FAIL (module not found)

**Step 3: Write minimal implementation**

```python
"""
AL-KITAB (The Book) — CT.gov Cardiovascular Results Harvester
Fetches ALL structured outcome data from ~7,742 CV trials with results.
Extracts poolable effect sizes (HR, OR, RR, MD, SMD, RD) with CIs.

"Nothing have We omitted from the Book" — Quran 6:38
"""
import json, os, re, time, sys
import requests

# --- Effect type normalization ---
PARAM_TYPE_MAP = [
    (re.compile(r'hazard\s*ratio', re.I), 'HR', True),
    (re.compile(r'odds\s*ratio', re.I), 'OR', True),
    (re.compile(r'risk\s*ratio|relative\s*risk', re.I), 'RR', True),
    (re.compile(r'risk\s*difference', re.I), 'RD', False),
    (re.compile(r'mean\s*difference', re.I), 'MD', False),
    (re.compile(r'std\.?\s*mean\s*diff|standardized\s*mean', re.I), 'SMD', False),
    (re.compile(r'rate\s*ratio', re.I), 'RR', True),
    (re.compile(r'incidence\s*rate\s*ratio', re.I), 'RR', True),
]

def normalize_param_type(param_type_str):
    """Map CT.gov paramType string to (effect_type, is_ratio) or None."""
    if not param_type_str:
        return None
    for pattern, etype, is_ratio in PARAM_TYPE_MAP:
        if pattern.search(param_type_str):
            return (etype, is_ratio)
    return None


def parse_analysis(raw):
    """Parse a single CT.gov analysis entry into a poolable effect dict."""
    param_type = raw.get('paramType', '')
    mapping = normalize_param_type(param_type)
    if mapping is None:
        return None
    effect_type, is_ratio = mapping

    try:
        effect = float(raw.get('paramValue', ''))
    except (ValueError, TypeError):
        return None
    if effect == 0 and is_ratio:
        return None  # HR/OR/RR of 0 is invalid

    ci_lo_str = raw.get('ciLowerLimit')
    ci_hi_str = raw.get('ciUpperLimit')
    if ci_lo_str is None or ci_hi_str is None:
        return None  # No CI = not poolable
    try:
        ci_lo = float(ci_lo_str)
        ci_hi = float(ci_hi_str)
    except (ValueError, TypeError):
        return None

    ci_pct = 0.95
    try:
        ci_pct = float(raw.get('ciPctValue', '95')) / 100.0
    except (ValueError, TypeError):
        pass

    p_value = None
    p_str = raw.get('pValue', '')
    if p_str:
        p_clean = re.sub(r'[<>=\s]', '', str(p_str))
        try:
            p_value = float(p_clean)
        except (ValueError, TypeError):
            pass

    return {
        'effect_type': effect_type,
        'effect_estimate': effect,
        'lower_ci': ci_lo,
        'upper_ci': ci_hi,
        'ci_level': ci_pct,
        'is_ratio': is_ratio,
        'p_value': p_value,
        'statistical_method': raw.get('statisticalMethod', ''),
        'param_type_raw': param_type,
    }


def _normalize_intervention_name(name):
    """Strip dosage, type prefix, collapse whitespace."""
    if not name:
        return name
    name = re.sub(r'^(Drug|Biological|Device|Procedure|Dietary Supplement|Other|Radiation|Behavioral|Diagnostic Test|Genetic|Combination Product):\s*', '', name, flags=re.I)
    name = re.sub(r'\d+[\.,]?\d*\s*(mg|g|ml|mcg|ug|units|iu|mmol|%)\b', '', name, flags=re.I)
    name = re.sub(r'\s+', ' ', name).strip()
    # Title case
    if name:
        name = name[0].upper() + name[1:] if len(name) > 1 else name.upper()
    return name


def _extract_phase(phases):
    """Extract max numeric phase from phases list."""
    if not phases:
        return None
    max_p = 0
    for p in phases:
        m = re.search(r'(\d)', str(p))
        if m:
            max_p = max(max_p, int(m.group(1)))
    return max_p if max_p > 0 else None


def extract_trial_effects(trial):
    """Extract all poolable effects from a single trial JSON."""
    proto = trial.get('protocolSection', {})
    results = trial.get('resultsSection', {})
    if not results:
        return []

    nct_id = proto.get('identificationModule', {}).get('nctId', '')
    title = proto.get('identificationModule', {}).get('briefTitle', '')
    conditions = proto.get('conditionsModule', {}).get('conditions', [])
    interventions_raw = proto.get('armsInterventionsModule', {}).get('interventions', [])
    interventions = [_normalize_intervention_name(i.get('name', '')) for i in interventions_raw
                     if i.get('type', '').upper() not in ('PLACEBO', 'OTHER')]
    # Fallback: if all filtered out, use first non-empty
    if not interventions:
        interventions = [_normalize_intervention_name(i.get('name', '')) for i in interventions_raw]
    intervention = interventions[0] if interventions else 'Unknown'

    phases = proto.get('designModule', {}).get('phases', [])
    phase = _extract_phase(phases)
    enrollment = proto.get('designModule', {}).get('enrollmentInfo', {}).get('count')
    if enrollment is not None:
        try:
            enrollment = int(enrollment)
        except (ValueError, TypeError):
            enrollment = None
    start_date = proto.get('statusModule', {}).get('startDateStruct', {}).get('date', '')

    outcome_measures = results.get('outcomeMeasuresModule', {}).get('outcomeMeasures', [])
    effects = []
    for om in outcome_measures:
        om_title = om.get('title', '')
        om_type = om.get('type', '')  # PRIMARY, SECONDARY, etc.
        analyses = om.get('analyses', [])
        for a in analyses:
            parsed = parse_analysis(a)
            if parsed is None:
                continue
            parsed.update({
                'nct_id': nct_id,
                'title': title,
                'conditions': conditions,
                'intervention': intervention,
                'outcome_title': om_title,
                'outcome_type': om_type,
                'enrollment': enrollment,
                'phase': phase,
                'start_date': start_date,
            })
            effects.append(parsed)
    return effects


# --- CT.gov API v2 pagination ---
CTGOV_API = 'https://clinicaltrials.gov/api/v2/studies'

CV_CONDITION_TERMS = [
    'heart failure', 'myocardial infarction', 'acute coronary syndrome',
    'atrial fibrillation', 'hypertension', 'aortic stenosis',
    'peripheral artery disease', 'hypercholesterolemia', 'pulmonary hypertension',
    'coronary artery disease', 'cardiomyopathy', 'heart valve disease',
    'ventricular tachycardia', 'cardiac arrest', 'angina',
    'cardiovascular disease',
]

def fetch_cv_trials_with_results(output_dir, max_pages=100, page_size=200):
    """Fetch all CV trials with structured results from CT.gov API v2."""
    os.makedirs(output_dir, exist_ok=True)
    all_trials = []
    seen_ncts = set()

    for cond in CV_CONDITION_TERMS:
        print(f'  Harvesting: {cond}...')
        params = {
            'format': 'json',
            'query.cond': cond,
            'query.term': 'AREA[HasResults]true',
            'filter.overallStatus': 'COMPLETED',
            'pageSize': page_size,
            'countTotal': 'true',
        }
        page = 0
        while page < max_pages:
            try:
                resp = requests.get(CTGOV_API, params=params, timeout=30)
                resp.raise_for_status()
                data = resp.json()
            except Exception as e:
                print(f'    Error page {page}: {e}')
                break

            studies = data.get('studies', [])
            for s in studies:
                nct = s.get('protocolSection', {}).get('identificationModule', {}).get('nctId', '')
                if nct and nct not in seen_ncts:
                    seen_ncts.add(nct)
                    all_trials.append(s)

            token = data.get('nextPageToken')
            if not token:
                break
            params['pageToken'] = token
            page += 1
            time.sleep(1.3)  # Rate limit: ~50 req/min

        # Reset pageToken for next condition
        params.pop('pageToken', None)
        print(f'    Cumulative unique trials: {len(all_trials)}')

    # Save raw
    raw_path = os.path.join(output_dir, 'ctgov_cv_raw.json')
    with open(raw_path, 'w', encoding='utf-8') as f:
        json.dump(all_trials, f)
    print(f'Saved {len(all_trials)} unique CV trials to {raw_path}')
    return all_trials


def extract_all_effects(trials, output_path):
    """Extract poolable effects from all trials, save as JSON."""
    all_effects = []
    for t in trials:
        effects = extract_trial_effects(t)
        all_effects.extend(effects)
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(all_effects, f, indent=2)
    print(f'Extracted {len(all_effects)} poolable effects from {len(trials)} trials')
    return all_effects


if __name__ == '__main__':
    out_dir = os.path.join(os.path.dirname(__file__), '..', 'data', 'harvest')
    trials = fetch_cv_trials_with_results(out_dir)
    effects = extract_all_effects(trials, os.path.join(out_dir, 'cv_effects.json'))
```

**Step 4: Run tests**

Run: `python -m pytest pipeline/test_harvest.py -v`
Expected: 7/7 PASS

**Step 5: Commit**

```bash
git add pipeline/
git commit -m "feat(al-kitab): CT.gov cardiovascular results harvester with effect extraction"
```

---

## Task 2: Drug Normalization — ATC Classification Engine

**Files:**
- Create: `pipeline/drug_normalize.py`
- Test: `pipeline/test_drug_normalize.py`

**Context:** Map intervention names from CT.gov to ATC drug classes aligned with our 10 CV subcategories. Use a curated map of ~100 top cardiovascular drugs. RxNorm API is optional (future enhancement); start with deterministic regex mapping.

**Step 1: Write the failing test**

```python
"""Test drug normalization to ATC classes."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
import pytest

def test_sglt2i_mapping():
    from drug_normalize import classify_drug
    assert classify_drug('Dapagliflozin') == ('A10BK01', 'SGLT2 inhibitor', 'hf')
    assert classify_drug('Empagliflozin') == ('A10BK03', 'SGLT2 inhibitor', 'hf')
    assert classify_drug('Canagliflozin') == ('A10BK04', 'SGLT2 inhibitor', 'hf')

def test_arni_mapping():
    from drug_normalize import classify_drug
    assert classify_drug('Sacubitril/Valsartan')[1] == 'ARNI'
    assert classify_drug('Entresto')[1] == 'ARNI'

def test_statin_mapping():
    from drug_normalize import classify_drug
    result = classify_drug('Atorvastatin')
    assert result[1] == 'Statin'
    assert result[2] == 'lipids'

def test_doac_mapping():
    from drug_normalize import classify_drug
    assert classify_drug('Apixaban')[1] == 'DOAC'
    assert classify_drug('Rivaroxaban')[2] == 'af'

def test_beta_blocker():
    from drug_normalize import classify_drug
    assert classify_drug('Metoprolol')[1] == 'Beta blocker'
    assert classify_drug('Carvedilol')[1] == 'Beta blocker'

def test_unknown_drug():
    from drug_normalize import classify_drug
    result = classify_drug('SomeExperimentalDrug123')
    assert result is None or result[1] == 'Unknown'

def test_normalize_batch():
    from drug_normalize import classify_drug
    # Fuzzy matching: extra whitespace, case variants
    assert classify_drug('dapagliflozin')[1] == 'SGLT2 inhibitor'
    assert classify_drug('ATORVASTATIN')[1] == 'Statin'
    assert classify_drug('  Metoprolol Succinate  ')[1] == 'Beta blocker'

def test_get_drug_class_for_subcategory():
    from drug_normalize import get_classes_for_subcategory
    hf_classes = get_classes_for_subcategory('hf')
    assert 'SGLT2 inhibitor' in hf_classes
    assert 'ARNI' in hf_classes
    assert 'Beta blocker' in hf_classes
```

**Step 2: Run tests to verify they fail**

Run: `python -m pytest pipeline/test_drug_normalize.py -v`

**Step 3: Implement drug normalization**

```python
"""
HUDA (Guidance) — Drug Normalization Engine
Maps intervention names to ATC classes and CV subcategories.

"This is the Book about which there is no doubt, a guidance for those conscious of Allah" — 2:2
"""
import re

# (regex_pattern, atc_code, drug_class_name, primary_subcategory)
DRUG_MAP = [
    # SGLT2 inhibitors (A10BK)
    (r'dapagliflozin', 'A10BK01', 'SGLT2 inhibitor', 'hf'),
    (r'canagliflozin', 'A10BK04', 'SGLT2 inhibitor', 'hf'),
    (r'empagliflozin', 'A10BK03', 'SGLT2 inhibitor', 'hf'),
    (r'ertugliflozin', 'A10BK05', 'SGLT2 inhibitor', 'hf'),
    (r'sotagliflozin', 'A10BK06', 'SGLT2 inhibitor', 'hf'),
    # ARNI
    (r'sacubitril|entresto|lcz\s*697', 'C09DX04', 'ARNI', 'hf'),
    # ACE inhibitors (C09A)
    (r'enalapril', 'C09AA02', 'ACE inhibitor', 'htn'),
    (r'ramipril', 'C09AA05', 'ACE inhibitor', 'htn'),
    (r'lisinopril', 'C09AA03', 'ACE inhibitor', 'htn'),
    (r'captopril', 'C09AA01', 'ACE inhibitor', 'htn'),
    (r'perindopril', 'C09AA04', 'ACE inhibitor', 'htn'),
    # ARBs (C09C)
    (r'valsartan', 'C09CA03', 'ARB', 'htn'),
    (r'losartan', 'C09CA01', 'ARB', 'htn'),
    (r'candesartan', 'C09CA06', 'ARB', 'htn'),
    (r'irbesartan', 'C09CA04', 'ARB', 'htn'),
    (r'telmisartan', 'C09CA07', 'ARB', 'htn'),
    (r'olmesartan', 'C09CA08', 'ARB', 'htn'),
    # Beta blockers (C07)
    (r'metoprolol', 'C07AB02', 'Beta blocker', 'hf'),
    (r'carvedilol', 'C07AG02', 'Beta blocker', 'hf'),
    (r'bisoprolol', 'C07AB07', 'Beta blocker', 'hf'),
    (r'atenolol', 'C07AB03', 'Beta blocker', 'htn'),
    (r'nebivolol', 'C07AB12', 'Beta blocker', 'hf'),
    (r'propranolol', 'C07AA05', 'Beta blocker', 'rhythm'),
    # MRAs (C03D)
    (r'spironolactone', 'C03DA01', 'MRA', 'hf'),
    (r'eplerenone', 'C03DA04', 'MRA', 'hf'),
    (r'finerenone', 'C03DA05', 'MRA', 'hf'),
    # DOACs (B01AF/B01AE)
    (r'apixaban', 'B01AF02', 'DOAC', 'af'),
    (r'rivaroxaban', 'B01AF01', 'DOAC', 'af'),
    (r'dabigatran', 'B01AE07', 'DOAC', 'af'),
    (r'edoxaban', 'B01AF03', 'DOAC', 'af'),
    # Antiplatelets (B01AC)
    (r'aspirin|acetylsalicylic', 'B01AC06', 'Antiplatelet', 'acs'),
    (r'clopidogrel', 'B01AC04', 'Antiplatelet', 'acs'),
    (r'ticagrelor', 'B01AC24', 'Antiplatelet', 'acs'),
    (r'prasugrel', 'B01AC22', 'Antiplatelet', 'acs'),
    # Statins (C10AA)
    (r'atorvastatin', 'C10AA05', 'Statin', 'lipids'),
    (r'rosuvastatin', 'C10AA07', 'Statin', 'lipids'),
    (r'simvastatin', 'C10AA01', 'Statin', 'lipids'),
    (r'pravastatin', 'C10AA03', 'Statin', 'lipids'),
    (r'pitavastatin', 'C10AA08', 'Statin', 'lipids'),
    (r'fluvastatin', 'C10AA04', 'Statin', 'lipids'),
    # PCSK9 inhibitors (C10AX)
    (r'evolocumab', 'C10AX13', 'PCSK9 inhibitor', 'lipids'),
    (r'alirocumab', 'C10AX14', 'PCSK9 inhibitor', 'lipids'),
    (r'inclisiran', 'C10AX16', 'PCSK9 inhibitor', 'lipids'),
    # Other lipid-lowering
    (r'ezetimibe', 'C10AX09', 'Ezetimibe', 'lipids'),
    (r'bempedoic', 'C10AX15', 'ACL inhibitor', 'lipids'),
    (r'icosapent\s*ethyl|vascepa', 'C10AX06', 'Omega-3', 'lipids'),
    # CCBs (C08)
    (r'amlodipine', 'C08CA01', 'CCB', 'htn'),
    (r'nifedipine', 'C08CA05', 'CCB', 'htn'),
    (r'diltiazem', 'C08DB01', 'CCB', 'htn'),
    (r'verapamil', 'C08DA01', 'CCB', 'rhythm'),
    # Diuretics (C03)
    (r'furosemide', 'C03CA01', 'Loop diuretic', 'hf'),
    (r'hydrochlorothiazide|hctz', 'C03AA03', 'Thiazide', 'htn'),
    (r'chlorthalidone', 'C03BA04', 'Thiazide', 'htn'),
    (r'indapamide', 'C03BA11', 'Thiazide-like', 'htn'),
    # Antiarrhythmics
    (r'amiodarone', 'C01BD01', 'Antiarrhythmic', 'rhythm'),
    (r'dronedarone', 'C01BD07', 'Antiarrhythmic', 'af'),
    (r'flecainide', 'C01BC04', 'Antiarrhythmic', 'af'),
    (r'sotalol', 'C07AA07', 'Antiarrhythmic', 'af'),
    # PAH drugs
    (r'bosentan', 'C02KX01', 'ERA', 'ph'),
    (r'ambrisentan', 'C02KX02', 'ERA', 'ph'),
    (r'macitentan', 'C02KX04', 'ERA', 'ph'),
    (r'sildenafil', 'G04BE03', 'PDE5 inhibitor', 'ph'),
    (r'tadalafil', 'G04BE08', 'PDE5 inhibitor', 'ph'),
    (r'riociguat', 'C02KX05', 'sGC stimulator', 'ph'),
    (r'selexipag', 'B01AC27', 'IP receptor agonist', 'ph'),
    (r'epoprostenol|treprostinil|iloprost', 'B01AC', 'Prostacyclin', 'ph'),
    # Devices / Procedures
    (r'\btavr\b|\btavi\b', 'DEVICE', 'TAVR', 'valve'),
    (r'\bsavr\b', 'DEVICE', 'SAVR', 'valve'),
    (r'mitraclip|transcatheter\s*mitral', 'DEVICE', 'TMVr', 'valve'),
    (r'\bpci\b|percutaneous\s*coronary', 'PROCEDURE', 'PCI', 'acs'),
    (r'\bcabg\b|coronary\s*artery\s*bypass', 'PROCEDURE', 'CABG', 'acs'),
    (r'\bicd\b|implantable\s*cardioverter', 'DEVICE', 'ICD', 'rhythm'),
    (r'\bcrt\b|cardiac\s*resynchroni', 'DEVICE', 'CRT', 'rhythm'),
    (r'ablation', 'PROCEDURE', 'Ablation', 'af'),
    (r'renal\s*denervation', 'PROCEDURE', 'Renal denervation', 'htn'),
    # GLP-1 RAs (also CV benefit)
    (r'semaglutide', 'A10BJ06', 'GLP-1 RA', 'general'),
    (r'liraglutide', 'A10BJ02', 'GLP-1 RA', 'general'),
    (r'dulaglutide', 'A10BJ05', 'GLP-1 RA', 'general'),
    # Warfarin
    (r'warfarin', 'B01AA03', 'VKA', 'af'),
    # Ivabradine
    (r'ivabradine', 'C01EB17', 'If channel blocker', 'hf'),
    # Nitrates
    (r'nitroglycerin|isosorbide', 'C01DA', 'Nitrate', 'acs'),
    # Digoxin
    (r'digoxin', 'C01AA05', 'Cardiac glycoside', 'hf'),
    # Vericiguat
    (r'vericiguat', 'C01DX', 'sGC stimulator', 'hf'),
    # Omecamtiv
    (r'omecamtiv', 'C01CX', 'Myosin activator', 'hf'),
]

# Compile regexes
_DRUG_MAP_COMPILED = [(re.compile(pat, re.I), atc, cls, subcat)
                       for pat, atc, cls, subcat in DRUG_MAP]


def classify_drug(name):
    """Classify drug name -> (atc_code, class_name, subcategory) or None."""
    if not name:
        return None
    name = name.strip()
    for pattern, atc, cls, subcat in _DRUG_MAP_COMPILED:
        if pattern.search(name):
            return (atc, cls, subcat)
    return None


def get_classes_for_subcategory(subcat_id):
    """Get all drug class names associated with a subcategory."""
    classes = set()
    for _, _, cls, sc in DRUG_MAP:
        if sc == subcat_id:
            classes.add(cls)
    return classes
```

**Step 4: Run tests**

Run: `python -m pytest pipeline/test_drug_normalize.py -v`

**Step 5: Commit**

```bash
git add pipeline/drug_normalize.py pipeline/test_drug_normalize.py
git commit -m "feat(huda): drug normalization engine — 80+ CV drugs to ATC classes"
```

---

## Task 3: Outcome Normalization Engine

**Files:**
- Create: `pipeline/outcome_normalize.py`
- Test: `pipeline/test_outcome_normalize.py`

**Context:** Map CT.gov outcome titles to standardized categories for clustering. Extend the existing browser-side `normalizeOutcome()` with richer cardiology-specific patterns.

**Step 1: Write tests**

```python
"""Test outcome normalization."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))

def test_mortality_variants():
    from outcome_normalize import normalize_outcome
    assert normalize_outcome('All-cause mortality') == 'Mortality'
    assert normalize_outcome('Cardiovascular death') == 'CV mortality'
    assert normalize_outcome('Death from any cause') == 'Mortality'
    assert normalize_outcome('Time to cardiovascular death') == 'CV mortality'

def test_composite_mace():
    from outcome_normalize import normalize_outcome
    assert normalize_outcome('Major Adverse Cardiovascular Events') == 'MACE'
    assert normalize_outcome('CV death, MI, or stroke') == 'MACE'
    assert normalize_outcome('Composite of CV death or HF hospitalization') == 'CV death or HF hosp'

def test_hospitalization():
    from outcome_normalize import normalize_outcome
    assert normalize_outcome('Heart failure hospitalization') == 'HF hospitalization'
    assert normalize_outcome('Time to first hospitalization for HF') == 'HF hospitalization'
    assert normalize_outcome('All-cause hospitalization') == 'Hospitalization'

def test_ef():
    from outcome_normalize import normalize_outcome
    assert normalize_outcome('Change in LVEF from baseline') == 'LVEF change'
    assert normalize_outcome('Left ventricular ejection fraction') == 'LVEF'

def test_bp():
    from outcome_normalize import normalize_outcome
    assert normalize_outcome('Change in systolic blood pressure') == 'SBP change'
    assert normalize_outcome('24-hour ambulatory BP') == 'Blood pressure'

def test_lipids():
    from outcome_normalize import normalize_outcome
    assert normalize_outcome('Percent change in LDL-C') == 'LDL-C change'
    assert normalize_outcome('LDL cholesterol at 12 weeks') == 'LDL-C'

def test_renal():
    from outcome_normalize import normalize_outcome
    assert normalize_outcome('eGFR slope') == 'Renal function'
    assert normalize_outcome('Time to kidney failure') == 'Renal endpoint'

def test_safety():
    from outcome_normalize import normalize_outcome
    assert normalize_outcome('Incidence of serious adverse events') == 'Safety'
    assert normalize_outcome('Treatment-emergent adverse events') == 'Safety'

def test_get_outcome_category():
    from outcome_normalize import get_outcome_category
    assert get_outcome_category('Mortality') == 'hard'
    assert get_outcome_category('MACE') == 'hard'
    assert get_outcome_category('Safety') == 'safety'
    assert get_outcome_category('SBP change') == 'surrogate'
```

**Step 2-5: Implement, test, commit**

Implementation: Pattern-based regex classifier with ~40 outcome patterns mapping to ~20 standardized categories, each tagged as 'hard' (mortality, MACE, hospitalization), 'surrogate' (BP, LDL, LVEF), or 'safety'.

---

## Task 4: Auto-Clustering Engine

**Files:**
- Create: `pipeline/auto_cluster.py`
- Test: `pipeline/test_auto_cluster.py`

**Context:** Group extracted effects into poolable clusters: (subcategory x drug_class x outcome_category x effect_type). Each cluster with k >= 2 can be auto-pooled.

**Step 1: Write tests**

```python
"""Test auto-clustering of effects into poolable groups."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))

def test_cluster_basic():
    from auto_cluster import build_clusters
    effects = [
        {'nct_id': 'NCT001', 'intervention': 'Dapagliflozin', 'outcome_title': 'CV death or HF hosp',
         'effect_type': 'HR', 'effect_estimate': 0.74, 'lower_ci': 0.65, 'upper_ci': 0.85,
         'ci_level': 0.95, 'is_ratio': True, 'enrollment': 4744, 'phase': 3},
        {'nct_id': 'NCT002', 'intervention': 'Empagliflozin', 'outcome_title': 'CV death or HF hosp',
         'effect_type': 'HR', 'effect_estimate': 0.75, 'lower_ci': 0.65, 'upper_ci': 0.86,
         'ci_level': 0.95, 'is_ratio': True, 'enrollment': 3730, 'phase': 3},
    ]
    clusters = build_clusters(effects)
    # Both are SGLT2i + CV death/HF hosp + HR -> same cluster
    assert len(clusters) >= 1
    key = next(k for k in clusters if 'SGLT2' in k)
    assert clusters[key]['k'] == 2

def test_cluster_separates_effect_types():
    from auto_cluster import build_clusters
    effects = [
        {'nct_id': 'NCT001', 'intervention': 'Atorvastatin', 'outcome_title': 'LDL change',
         'effect_type': 'MD', 'effect_estimate': -40, 'lower_ci': -45, 'upper_ci': -35,
         'ci_level': 0.95, 'is_ratio': False, 'enrollment': 1000, 'phase': 3},
        {'nct_id': 'NCT002', 'intervention': 'Rosuvastatin', 'outcome_title': 'LDL change',
         'effect_type': 'MD', 'effect_estimate': -45, 'lower_ci': -50, 'upper_ci': -40,
         'ci_level': 0.95, 'is_ratio': False, 'enrollment': 800, 'phase': 3},
        {'nct_id': 'NCT003', 'intervention': 'Atorvastatin', 'outcome_title': 'All-cause mortality',
         'effect_type': 'HR', 'effect_estimate': 0.87, 'lower_ci': 0.78, 'upper_ci': 0.97,
         'ci_level': 0.95, 'is_ratio': True, 'enrollment': 10000, 'phase': 3},
    ]
    clusters = build_clusters(effects)
    # LDL (MD) and mortality (HR) should be separate clusters
    assert len(clusters) >= 2

def test_cluster_excludes_singletons():
    from auto_cluster import get_poolable_clusters
    effects = [
        {'nct_id': 'NCT001', 'intervention': 'Dapagliflozin', 'outcome_title': 'HbA1c',
         'effect_type': 'MD', 'effect_estimate': -0.4, 'lower_ci': -0.6, 'upper_ci': -0.2,
         'ci_level': 0.95, 'is_ratio': False, 'enrollment': 500, 'phase': 3},
    ]
    poolable = get_poolable_clusters(effects, min_k=2)
    assert len(poolable) == 0  # k=1 -> not poolable

def test_cluster_output_format():
    from auto_cluster import build_clusters
    effects = [
        {'nct_id': f'NCT{i:05d}', 'intervention': 'Metoprolol', 'outcome_title': 'All-cause mortality',
         'effect_type': 'HR', 'effect_estimate': 0.8 + i*0.01, 'lower_ci': 0.7, 'upper_ci': 0.95,
         'ci_level': 0.95, 'is_ratio': True, 'enrollment': 1000, 'phase': 3,
         'conditions': ['Heart Failure'], 'title': f'Trial {i}', 'start_date': '2020'}
        for i in range(5)
    ]
    clusters = build_clusters(effects)
    for key, cluster in clusters.items():
        assert 'k' in cluster
        assert 'studies' in cluster
        assert 'drug_class' in cluster
        assert 'outcome_normalized' in cluster
        assert 'subcategory' in cluster
        assert 'effect_type' in cluster
```

**Step 2-5: Implement, test, commit**

Implementation: Cluster key = `{subcategory}|{drug_class}|{outcome_normalized}|{effect_type}`. Enrich each cluster with metadata (total enrollment, phase distribution, year range). Export as JSON array.

---

## Task 5: SHAHID Validation — Compare Against Pairwise70

**Files:**
- Create: `pipeline/shahid_validate.py`
- Test: `pipeline/test_shahid.py`
- Read: `C:\Models\Pairwise70\analysis\ma4_results_pairwise70.csv`

**Context:** Load Pairwise70 (4,424 comparisons), match against our auto-pooled clusters, classify agreement/discrepancy. This is the core validation that proves the system works.

**Step 1: Write tests**

```python
"""Test SHAHID validation — published MA oracle comparison."""
import os, sys, math
sys.path.insert(0, os.path.dirname(__file__))

def test_match_cluster_to_pairwise():
    from shahid_validate import match_to_pairwise
    # Simulated auto-pooled cluster
    cluster = {
        'drug_class': 'SGLT2 inhibitor',
        'subcategory': 'hf',
        'outcome_normalized': 'CV death or HF hosp',
        'effect_type': 'HR',
        'pooled_effect': 0.74,
        'pooled_ci_lo': 0.68,
        'pooled_ci_hi': 0.81,
    }
    # Simulated Pairwise70 entry
    pw70 = [
        {'review_id': 'CD012345', 'analysis_name': 'Composite CV death or HF hospitalization',
         'effect_type': 'logRR', 'theta': -0.30, 'sigma': 0.05, 'k': 8}
    ]
    matches = match_to_pairwise(cluster, pw70)
    # Should find a candidate match (fuzzy outcome matching)
    assert isinstance(matches, list)

def test_classify_agreement():
    from shahid_validate import classify_agreement
    # Confirmed: same direction, overlapping CIs
    assert classify_agreement(0.74, 0.68, 0.81, 0.72, 0.065) == 'confirmed'
    # Contradicted: opposite directions
    assert classify_agreement(0.74, 0.68, 0.81, 1.15, 0.08) == 'contradicted'
    # Updated: same direction but shifted estimate
    assert classify_agreement(0.74, 0.68, 0.81, 0.55, 0.04) == 'updated'

def test_furqan_discovery_types():
    from shahid_validate import classify_discovery
    # Novel: no matching published MA
    assert classify_discovery(has_match=False, has_ghost=False) == 'novel'
    # Ghost: registered but never published
    assert classify_discovery(has_match=False, has_ghost=True) == 'ghost'
```

**Step 2-5: Implement, test, commit**

---

## Task 6: Export Pipeline — JSON for Browser Consumption

**Files:**
- Create: `pipeline/export_for_browser.py`
- Test: `pipeline/test_export.py`

**Context:** Combine clusters, pooled results, SHAHID validation, and discovery classifications into a single JSON that the browser app can load and display in the Ayat Universe.

**Output JSON structure:**
```json
{
  "harvest_date": "2026-02-24",
  "total_trials": 7742,
  "total_effects": 15000,
  "total_clusters": 850,
  "poolable_clusters": 420,
  "clusters": [
    {
      "id": "hf|SGLT2_inhibitor|CV_death_or_HF_hosp|HR",
      "subcategory": "hf",
      "drug_class": "SGLT2 inhibitor",
      "outcome": "CV death or HF hosp",
      "effect_type": "HR",
      "k": 5,
      "total_enrollment": 25000,
      "pooled": { "effect": 0.74, "ci_lo": 0.68, "ci_hi": 0.81, "tau2": 0.001, "I2": 12, "p": 0.00001 },
      "shahid": { "match": "CD012345", "published_effect": 0.72, "agreement": "confirmed" },
      "furqan": "confirmed",
      "studies": [ { "nct_id": "NCT...", "effect": 0.74, "ci_lo": 0.65, "ci_hi": 0.85, "weight": 0.23 } ],
      "ghost_count": 2,
      "ghost_weight": 0.15,
      "isnad": { "source": "CT.gov API v2", "harvest_date": "2026-02-24", "hash": "sha256:..." }
    }
  ]
}
```

---

## Task 7: Browser Integration — Load Harvest Data + Auto-Pool

**Files:**
- Modify: `metasprint-autopilot.html` (add new IndexedDB store, loader, auto-pool trigger)

**Context:** Add an `alBurhan` IndexedDB store. Load the exported JSON. Auto-pool each cluster using the existing `computeMetaAnalysis()`. Display results in Ayat Universe with discovery-type coloring.

**Step 1: Add IndexedDB store for Al-Burhan data**

In the DB upgrade handler (around line 2010), add:
```javascript
if (!db.objectStoreNames.contains('alBurhan')) {
  const store = db.createObjectStore('alBurhan', { keyPath: 'id' });
  store.createIndex('subcategory', 'subcategory', { unique: false });
  store.createIndex('furqan', 'furqan', { unique: false });
}
```

**Step 2: Add harvest data loader**

```javascript
async function loadAlBurhanData(jsonUrl) {
  const resp = await fetch(jsonUrl);
  const data = await resp.json();
  const db = await ensureDB();
  const tx = db.transaction('alBurhan', 'readwrite');
  for (const cluster of data.clusters) {
    tx.objectStore('alBurhan').put(cluster);
  }
  await tx.done;
  return data;
}
```

**Step 3: Auto-pool each cluster using existing DL engine**

```javascript
async function autoPoolAlBurhan() {
  const clusters = await idbGetAll('alBurhan');
  const results = [];
  for (const c of clusters) {
    if (c.k < 2) continue;
    const studies = c.studies.map(s => ({
      effectEstimate: s.effect,
      lowerCI: s.ci_lo,
      upperCI: s.ci_hi,
    }));
    const isRatio = c.effect_type === 'HR' || c.effect_type === 'OR' || c.effect_type === 'RR';
    // Use existing computeMetaAnalysis
    const result = computeMetaAnalysis(studies, 0.95);
    if (result && result.k >= 2) {
      c.pooled = {
        effect: result.pooled,
        ci_lo: result.pooledLo,
        ci_hi: result.pooledHi,
        tau2: result.tau2,
        I2: result.I2,
        p: result.pValue,
        k: result.k,
        method: 'DL',
      };
      results.push(c);
    }
  }
  return results;
}
```

**Step 4: Integrate with Ayat Universe — discovery-type coloring**

Modify `renderAyatGlyph()` to use FURQAN discovery types:
- Confirmed = green glow
- Updated = blue glow
- Contradicted = red pulsing border
- Novel = gold star badge
- Ghost = semi-transparent with dashed outline

---

## Task 8: Advanced Analysis — Trial Sequential Analysis (TSA)

**Files:**
- Modify: `metasprint-autopilot.html` (add TSA computation + overlay)

**Context:** TSA determines whether enough evidence exists to draw a firm conclusion. It creates monitoring boundaries (like interim analysis in a single trial) that account for repeated testing as new trials arrive.

**Implementation:** After auto-pooling each cluster:
1. Calculate Required Information Size (RIS) based on desired power/alpha
2. Compute cumulative Z-curve as studies are added chronologically
3. Draw O'Brien-Fleming-like boundaries
4. Classify: "firm evidence" (crossed boundary), "insufficient" (within boundaries), "futile" (crossed futility)

---

## Task 9: Advanced Analysis — Cross-Condition Borrowing

**Files:**
- Modify: `metasprint-autopilot.html`

**Context:** When SGLT2i has strong evidence in HF (k=20) but sparse in ACS (k=2), we can borrow strength via hierarchical modeling. This is genuinely novel at this scale.

**Implementation:** Bayesian hierarchical model:
```
theta_ij ~ N(mu_j, tau_j^2)        # Trial i in condition j
mu_j ~ N(mu_class, sigma_class^2)  # Condition-level mean from class-level
```

Use empirical Bayes (moment matching) since full MCMC is too slow for browser.

---

## Task 10: Advanced Analysis — Ghost Protocol Sensitivity (GWAM Integration)

**Files:**
- Modify: `metasprint-autopilot.html`
- Read: GWAM ghost data

**Context:** Integrate GWAM-style sensitivity analysis. For each pooled result, show "what would the estimate be if ghost protocols had null results?"

---

## Task 11: Advanced Analysis — Transportability Score

**Files:**
- Modify: `metasprint-autopilot.html`

**Context:** Score each trial's population representativeness by comparing eligibility criteria (age range, sex, comorbidities from CT.gov) against real-world epidemiology. Flag clusters where trial populations are narrow.

---

## Task 12: Advanced Analysis — Network Meta-Analysis

**Files:**
- Modify: `metasprint-autopilot.html`

**Context:** For each outcome within a subcategory, if we have A-vs-placebo AND B-vs-placebo, compute indirect A-vs-B comparison. This is Qiyas — analogical reasoning when direct evidence is absent.

**Implementation:** Bucher method for simple indirect comparisons:
```
theta_AB = theta_AC - theta_BC
SE_AB = sqrt(SE_AC^2 + SE_BC^2)
```

For full NMA with multiple comparisons, use graph-theoretical approach (Rucker's netmeta algorithm adapted to JS).

---

## Task 13: Temporal Evidence Velocity + Prediction

**Files:**
- Modify: `metasprint-autopilot.html`

**Context:** For each cluster, track how the pooled estimate changes over time as trials are added. Compute evidence velocity (rate of information accrual) and predict when the evidence will stabilize (TSA + accumulation curve).

---

## Task 14: Integration Test Suite

**Files:**
- Create: `pipeline/test_integration.py`
- Create: `validation/test_al_burhan.py`

**Context:** End-to-end test: harvest sample data -> normalize -> cluster -> export -> browser load -> auto-pool -> validate against Pairwise70.

---

## Execution Order

**Phase 1 (Foundation): Tasks 1-6** — Python pipeline
**Phase 2 (Browser): Task 7** — Load + auto-pool + visualize
**Phase 3 (Advanced): Tasks 8-13** — Novel analyses
**Phase 4 (Validation): Task 14** — Integration tests

Tasks 1-6 are sequential (each depends on previous output).
Tasks 8-13 are independent (can be parallelized after Task 7).
Task 14 runs last.

---

*"O mankind, there has come to you a conclusive proof (burhan) from your Lord"* — Surah An-Nisa 4:174
