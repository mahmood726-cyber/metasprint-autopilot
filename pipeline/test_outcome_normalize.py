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

def test_composite_hf():
    from outcome_normalize import normalize_outcome
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
    assert get_outcome_category('Quality of life') == 'other'
