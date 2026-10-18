"""Numeric parser fixtures, not clinical effect estimates."""
import pytest

from pipeline.harvest_ctgov_results import parse_analysis


def analysis(**changes):
    record = {"paramType": "Hazard Ratio", "paramValue": "1.2",
              "ciLowerLimit": "0.8", "ciUpperLimit": "1.8",
              "ciPctValue": "95", "ciNumSides": "TWO_SIDED"}
    record.update(changes)
    return record


@pytest.mark.parametrize("field", ["paramValue", "ciLowerLimit", "ciUpperLimit", "ciPctValue"])
@pytest.mark.parametrize("value", ["NaN", "Infinity", "-Infinity"])
def test_nonfinite_numbers_are_not_poolable(field, value):
    assert parse_analysis(analysis(**{field: value})) is None


@pytest.mark.parametrize("changes", [
    {"paramValue": "-1"}, {"ciLowerLimit": "0"}, {"ciUpperLimit": "-1"},
    {"ciLowerLimit": "2"}, {"ciLowerLimit": "1.8"},
    {"ciPctValue": "0"}, {"ciPctValue": "100"}, {"ciPctValue": None},
    {"ciPctValue": "unreported"}, {"ciNumSides": "ONE_SIDED"},
    {"ciNumSides": None}, {"paramType": 7}, {"paramValue": True},
])
def test_invalid_domains_or_unknown_interval_metadata_are_rejected(changes):
    assert parse_analysis(analysis(**changes)) is None


def test_signed_mean_difference_and_nondefault_confidence_remain_valid():
    result = parse_analysis(analysis(paramType="Mean Difference", paramValue="-2",
                                    ciLowerLimit="-3", ciUpperLimit="-1", ciPctValue="90"))
    assert result["effect_estimate"] == -2
    assert result["ci_level"] == .9
    assert result["is_ratio"] is False


@pytest.mark.parametrize("value", ["NaN", "Infinity", "-0.1", "1.1", "<NaN"])
def test_invalid_optional_p_values_are_not_exported(value):
    assert parse_analysis(analysis(pValue=value))["p_value"] is None
