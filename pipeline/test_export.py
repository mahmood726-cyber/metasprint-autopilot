"""Test export pipeline for browser consumption."""
import os, sys, json, tempfile
sys.path.insert(0, os.path.dirname(__file__))


def test_compute_isnad():
    from export_for_browser import compute_isnad
    data = {'test': 'data'}
    isnad = compute_isnad(data)
    assert isnad['source'] == 'CT.gov API v2'
    assert 'harvest_date' in isnad
    assert len(isnad['content_hash']) == 64  # SHA-256 hex
    assert isnad['pipeline_version'] == '1.0.0'


def test_compute_isnad_deterministic():
    from export_for_browser import compute_isnad
    data = {'a': 1, 'b': 2}
    h1 = compute_isnad(data)['content_hash']
    h2 = compute_isnad(data)['content_hash']
    assert h1 == h2  # Same data = same hash


def test_build_browser_json_structure():
    from export_for_browser import build_browser_json
    clusters = {
        'hf|SGLT2 inhibitor|Mortality|HR': {
            'id': 'hf|SGLT2 inhibitor|Mortality|HR',
            'subcategory': 'hf',
            'drug_class': 'SGLT2 inhibitor',
            'outcome_normalized': 'Mortality',
            'outcome_category': 'hard',
            'effect_type': 'HR',
            'is_ratio': True,
            'k': 3,
            'total_enrollment': 15000,
            'studies': [
                {'nct_id': 'NCT001', 'effect_estimate': 0.83, 'lower_ci': 0.71, 'upper_ci': 0.97,
                 'ci_level': 0.95, 'enrollment': 4744, 'phase': 3, 'title': 'DAPA-HF', 'start_date': '2017'},
                {'nct_id': 'NCT002', 'effect_estimate': 0.92, 'lower_ci': 0.75, 'upper_ci': 1.12,
                 'ci_level': 0.95, 'enrollment': 3730, 'phase': 3, 'title': 'EMPEROR', 'start_date': '2017'},
                {'nct_id': 'NCT003', 'effect_estimate': 0.87, 'lower_ci': 0.72, 'upper_ci': 1.06,
                 'ci_level': 0.95, 'enrollment': 6526, 'phase': 3, 'title': 'DELIVER', 'start_date': '2018'},
            ],
            'phase_distribution': {3: 3},
            'year_range': [2017, 2018],
            'interventions': ['Dapagliflozin', 'Empagliflozin'],
            'furqan': 'novel',
        }
    }
    result = build_browser_json(clusters)
    assert result['al_burhan_version'] == '1.0.0'
    assert result['total_clusters'] == 1
    assert result['poolable_clusters'] == 1
    assert len(result['clusters']) == 1
    c = result['clusters'][0]
    assert c['id'] == 'hf|SGLT2 inhibitor|Mortality|HR'
    assert c['k'] == 3
    assert c['furqan'] == 'novel'
    assert 'isnad' in c
    assert 'summary' in result


def test_build_browser_json_counts_unique_ncts():
    from export_for_browser import build_browser_json
    clusters = {
        'c1': {
            'id': 'c1', 'subcategory': 'hf', 'drug_class': 'X', 'outcome_normalized': 'Y',
            'outcome_category': 'hard', 'effect_type': 'HR', 'is_ratio': True,
            'k': 2, 'total_enrollment': 5000,
            'studies': [
                {'nct_id': 'NCT001', 'effect_estimate': 0.8, 'lower_ci': 0.6, 'upper_ci': 1.0,
                 'ci_level': 0.95, 'enrollment': 2500, 'phase': 3, 'title': 'A', 'start_date': '2020'},
                {'nct_id': 'NCT002', 'effect_estimate': 0.9, 'lower_ci': 0.7, 'upper_ci': 1.1,
                 'ci_level': 0.95, 'enrollment': 2500, 'phase': 3, 'title': 'B', 'start_date': '2020'},
            ],
            'phase_distribution': {3: 2}, 'year_range': [2020, 2020],
            'interventions': ['X'], 'furqan': 'novel',
        },
        'c2': {
            'id': 'c2', 'subcategory': 'hf', 'drug_class': 'X', 'outcome_normalized': 'Z',
            'outcome_category': 'hard', 'effect_type': 'HR', 'is_ratio': True,
            'k': 1, 'total_enrollment': 2500,
            'studies': [
                {'nct_id': 'NCT001', 'effect_estimate': 0.85, 'lower_ci': 0.65, 'upper_ci': 1.05,
                 'ci_level': 0.95, 'enrollment': 2500, 'phase': 3, 'title': 'A', 'start_date': '2020'},
            ],
            'phase_distribution': {3: 1}, 'year_range': [2020, 2020],
            'interventions': ['X'], 'furqan': 'novel',
        },
    }
    result = build_browser_json(clusters)
    assert result['total_trials'] == 2  # NCT001 appears in both but counted once


def test_export_json_creates_file():
    from export_for_browser import export_json
    data = {'test': True, 'clusters': []}
    with tempfile.NamedTemporaryFile(suffix='.json', delete=False) as f:
        tmp_path = f.name
    try:
        export_json(data, tmp_path)
        with open(tmp_path, 'r', encoding='utf-8') as f:
            loaded = json.load(f)
        assert loaded['test'] is True
    finally:
        os.unlink(tmp_path)
