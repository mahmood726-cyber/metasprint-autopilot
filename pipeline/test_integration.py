"""Integration test -- full Al-Burhan pipeline end-to-end."""
import json, os, sys, tempfile
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))


def _make_mock_trial(nct_id, intervention, condition, outcome_title,
                     param_type, param_value, ci_lo, ci_hi, phase='PHASE3', enrollment=1000):
    """Build a mock CT.gov trial JSON structure."""
    return {
        "protocolSection": {
            "identificationModule": {"nctId": nct_id, "briefTitle": f"Trial {nct_id}"},
            "conditionsModule": {"conditions": [condition]},
            "armsInterventionsModule": {
                "interventions": [
                    {"type": "DRUG", "name": intervention},
                    {"type": "DRUG", "name": "Placebo"}
                ]
            },
            "designModule": {
                "phases": [phase],
                "enrollmentInfo": {"count": enrollment}
            },
            "statusModule": {"startDateStruct": {"date": "2020-01"}}
        },
        "resultsSection": {
            "outcomeMeasuresModule": {
                "outcomeMeasures": [{
                    "type": "PRIMARY",
                    "title": outcome_title,
                    "analyses": [{
                        "groupIds": ["OG000", "OG001"],
                        "paramType": param_type,
                        "paramValue": str(param_value),
                        "ciPctValue": "95",
                        "ciNumSides": "TWO_SIDED",
                        "ciLowerLimit": str(ci_lo),
                        "ciUpperLimit": str(ci_hi),
                        "pValue": "0.001",
                        "statisticalMethod": "Cox Proportional Hazards"
                    }]
                }]
            }
        }
    }


# --- Synthetic cardiology trial data ---
MOCK_TRIALS = [
    # SGLT2i HF trials (should cluster together)
    _make_mock_trial("NCT03036124", "Dapagliflozin 10mg", "Heart Failure",
                     "CV death or HF hospitalization", "Hazard Ratio", 0.74, 0.65, 0.85, enrollment=4744),
    _make_mock_trial("NCT03057977", "Empagliflozin 10mg", "Heart Failure",
                     "CV death or HF hospitalization", "Hazard Ratio", 0.75, 0.65, 0.86, enrollment=3730),
    _make_mock_trial("NCT03619213", "Dapagliflozin 10mg", "Heart Failure",
                     "CV death or HF hospitalization", "Hazard Ratio", 0.82, 0.73, 0.92, enrollment=6263),

    # SGLT2i mortality (separate cluster, same drug class)
    _make_mock_trial("NCT03036124", "Dapagliflozin 10mg", "Heart Failure",
                     "All-cause mortality", "Hazard Ratio", 0.83, 0.71, 0.97, enrollment=4744),
    _make_mock_trial("NCT03057977", "Empagliflozin 10mg", "Heart Failure",
                     "All-cause mortality", "Hazard Ratio", 0.92, 0.77, 1.10, enrollment=3730),

    # Statins LDL (different subcategory, different effect type)
    _make_mock_trial("NCT00000001", "Atorvastatin 80mg", "Hypercholesterolemia",
                     "Percent change in LDL-C", "Mean Difference", -40.5, -45.2, -35.8, enrollment=800),
    _make_mock_trial("NCT00000002", "Rosuvastatin 20mg", "Hypercholesterolemia",
                     "Percent change in LDL-C", "Mean Difference", -45.1, -50.3, -39.9, enrollment=1200),

    # DOACs in AF (another subcategory)
    _make_mock_trial("NCT00412984", "Apixaban 5mg", "Atrial Fibrillation",
                     "Stroke or systemic embolism", "Hazard Ratio", 0.79, 0.66, 0.95, enrollment=18201),
    _make_mock_trial("NCT00403767", "Rivaroxaban 20mg", "Atrial Fibrillation",
                     "Stroke or systemic embolism", "Hazard Ratio", 0.88, 0.75, 1.03, enrollment=14264),

    # Unknown drug (should be skipped)
    _make_mock_trial("NCT99999999", "ExperimentalAgentXYZ", "Heart Failure",
                     "Quality of life", "Mean Difference", 2.5, 0.5, 4.5, enrollment=200),
]


def test_extract_effects():
    """Harvest module extracts poolable effects from mock trials."""
    from harvest_ctgov_results import extract_trial_effects
    all_effects = []
    for trial in MOCK_TRIALS:
        effects = extract_trial_effects(trial)
        all_effects.extend(effects)
    assert len(all_effects) >= 9  # At least one per trial with known param type

    # Verify SGLT2i trial extraction
    dapa = [e for e in all_effects if e['nct_id'] == 'NCT03036124']
    assert len(dapa) >= 1
    assert dapa[0]['intervention'] == 'Dapagliflozin'
    assert dapa[0]['effect_type'] == 'HR'


def test_cluster_formation():
    """Clusters form correctly from extracted effects."""
    from harvest_ctgov_results import extract_trial_effects
    from auto_cluster import build_clusters, get_poolable_clusters

    all_effects = []
    for trial in MOCK_TRIALS:
        all_effects.extend(extract_trial_effects(trial))

    clusters = build_clusters(all_effects)
    assert len(clusters) >= 3  # At least: SGLT2i HF hosp, SGLT2i mortality, Statin LDL

    # Check SGLT2i CV death/HF hosp cluster
    sglt2_clusters = {k: v for k, v in clusters.items() if 'SGLT2' in k and 'HF hosp' in k}
    assert len(sglt2_clusters) == 1
    key = list(sglt2_clusters.keys())[0]
    assert sglt2_clusters[key]['k'] == 3  # 3 unique trials
    assert sglt2_clusters[key]['drug_class'] == 'SGLT2 inhibitor'
    assert sglt2_clusters[key]['subcategory'] == 'hf'

    # Check poolable (k >= 2)
    poolable = get_poolable_clusters(all_effects, min_k=2)
    assert len(poolable) >= 3

    # Unknown drug should NOT create any clusters
    unknown = {k: v for k, v in clusters.items() if 'Experimental' in k or 'Unknown' in k}
    assert len(unknown) == 0


def test_shahid_validation():
    """SHAHID validates against Pairwise70 (using mock data)."""
    from shahid_validate import classify_agreement, classify_discovery

    # Confirmed: same direction, overlapping CIs
    assert classify_agreement(-0.30, -0.39, -0.21, -0.33, 0.05) == 'confirmed'

    # Contradicted: opposite directions
    assert classify_agreement(-0.30, -0.39, -0.21, 0.14, 0.08) == 'contradicted'

    # Novel discovery
    assert classify_discovery(has_match=False, has_ghost=False) == 'novel'
    assert classify_discovery(has_match=False, has_ghost=True) == 'ghost'


def test_export_round_trip():
    """Full pipeline: effects -> clusters -> export -> reload."""
    from harvest_ctgov_results import extract_trial_effects
    from auto_cluster import build_clusters
    from export_for_browser import build_browser_json, export_json

    all_effects = []
    for trial in MOCK_TRIALS:
        all_effects.extend(extract_trial_effects(trial))

    clusters = build_clusters(all_effects)

    # Add furqan classification
    for key, cluster in clusters.items():
        cluster['furqan'] = 'novel'  # Mock: no Pairwise70 match

    # Build browser JSON
    browser_json = build_browser_json(clusters)

    assert browser_json['al_burhan_version'] == '1.0.0'
    assert browser_json['total_clusters'] >= 3
    assert browser_json['poolable_clusters'] >= 3  # k >= 2
    assert len(browser_json['clusters']) >= 3

    # Export and reload
    with tempfile.NamedTemporaryFile(suffix='.json', delete=False, mode='w', encoding='utf-8') as f:
        tmp_path = f.name
        export_json(browser_json, tmp_path)

    try:
        with open(tmp_path, 'r', encoding='utf-8') as f:
            reloaded = json.load(f)
        assert reloaded['total_clusters'] == browser_json['total_clusters']
        assert len(reloaded['clusters']) == len(browser_json['clusters'])

        # Verify isnad provenance
        for c in reloaded['clusters']:
            assert 'isnad' in c
            assert len(c['isnad']['content_hash']) == 64  # SHA-256
    finally:
        os.unlink(tmp_path)


def test_drug_outcome_coverage():
    """Drug and outcome normalization covers all test trial drugs/outcomes."""
    from drug_normalize import classify_drug
    from outcome_normalize import normalize_outcome

    drugs_to_test = [
        ('Dapagliflozin', 'SGLT2 inhibitor'),
        ('Empagliflozin', 'SGLT2 inhibitor'),
        ('Atorvastatin', 'Statin'),
        ('Rosuvastatin', 'Statin'),
        ('Apixaban', 'DOAC'),
        ('Rivaroxaban', 'DOAC'),
    ]
    for drug, expected_class in drugs_to_test:
        result = classify_drug(drug)
        assert result is not None, f"Drug '{drug}' not recognized"
        assert result[1] == expected_class, f"Drug '{drug}': expected {expected_class}, got {result[1]}"

    outcomes_to_test = [
        ('CV death or HF hospitalization', 'CV death or HF hosp'),
        ('All-cause mortality', 'Mortality'),
        ('Percent change in LDL-C', 'LDL-C change'),
        ('Stroke or systemic embolism', 'Stroke'),
    ]
    for raw, expected in outcomes_to_test:
        result = normalize_outcome(raw)
        assert result == expected, f"Outcome '{raw}': expected '{expected}', got '{result}'"
