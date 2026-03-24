"""Test CT.gov cardiovascular results harvester."""
import json, os, sys
sys.path.insert(0, os.path.dirname(__file__))
import pytest


def test_parse_analysis_entry():
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
    from harvest_ctgov_results import parse_analysis
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
    from harvest_ctgov_results import parse_analysis
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
    from harvest_ctgov_results import parse_analysis
    raw = {"paramType": "Hazard Ratio", "paramValue": "0.8"}
    result = parse_analysis(raw)
    assert result is None


def test_parse_analysis_non_numeric_returns_none():
    from harvest_ctgov_results import parse_analysis
    raw = {
        "paramType": "Hazard Ratio",
        "paramValue": "NA",
        "ciLowerLimit": "0.5",
        "ciUpperLimit": "1.5"
    }
    result = parse_analysis(raw)
    assert result is None


def test_extract_trial_effects():
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
    assert normalize_param_type("Difference in event rate") is None
