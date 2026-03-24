"""Test auto-clustering of effects into poolable groups."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))

def test_cluster_basic():
    from auto_cluster import build_clusters
    effects = [
        {'nct_id': 'NCT001', 'intervention': 'Dapagliflozin', 'outcome_title': 'CV death or HF hosp',
         'effect_type': 'HR', 'effect_estimate': 0.74, 'lower_ci': 0.65, 'upper_ci': 0.85,
         'ci_level': 0.95, 'is_ratio': True, 'enrollment': 4744, 'phase': 3,
         'conditions': ['Heart Failure'], 'title': 'DAPA-HF', 'start_date': '2017-02'},
        {'nct_id': 'NCT002', 'intervention': 'Empagliflozin', 'outcome_title': 'CV death or HF hosp',
         'effect_type': 'HR', 'effect_estimate': 0.75, 'lower_ci': 0.65, 'upper_ci': 0.86,
         'ci_level': 0.95, 'is_ratio': True, 'enrollment': 3730, 'phase': 3,
         'conditions': ['Heart Failure'], 'title': 'EMPEROR-Reduced', 'start_date': '2017-06'},
    ]
    clusters = build_clusters(effects)
    # Both are SGLT2i + CV death or HF hosp + HR -> same cluster
    matching = [k for k in clusters if 'SGLT2' in k]
    assert len(matching) == 1
    key = matching[0]
    assert clusters[key]['k'] == 2
    assert clusters[key]['drug_class'] == 'SGLT2 inhibitor'
    assert clusters[key]['subcategory'] == 'hf'

def test_cluster_separates_effect_types():
    from auto_cluster import build_clusters
    effects = [
        {'nct_id': 'NCT001', 'intervention': 'Atorvastatin', 'outcome_title': 'LDL change',
         'effect_type': 'MD', 'effect_estimate': -40, 'lower_ci': -45, 'upper_ci': -35,
         'ci_level': 0.95, 'is_ratio': False, 'enrollment': 1000, 'phase': 3,
         'conditions': [], 'title': 'Trial A', 'start_date': '2015'},
        {'nct_id': 'NCT002', 'intervention': 'Rosuvastatin', 'outcome_title': 'LDL change',
         'effect_type': 'MD', 'effect_estimate': -45, 'lower_ci': -50, 'upper_ci': -40,
         'ci_level': 0.95, 'is_ratio': False, 'enrollment': 800, 'phase': 3,
         'conditions': [], 'title': 'Trial B', 'start_date': '2016'},
        {'nct_id': 'NCT003', 'intervention': 'Atorvastatin', 'outcome_title': 'All-cause mortality',
         'effect_type': 'HR', 'effect_estimate': 0.87, 'lower_ci': 0.78, 'upper_ci': 0.97,
         'ci_level': 0.95, 'is_ratio': True, 'enrollment': 10000, 'phase': 3,
         'conditions': [], 'title': 'Trial C', 'start_date': '2010'},
    ]
    clusters = build_clusters(effects)
    # LDL (MD) and mortality (HR) should be separate clusters
    assert len(clusters) >= 2

def test_cluster_excludes_singletons():
    from auto_cluster import get_poolable_clusters
    effects = [
        {'nct_id': 'NCT001', 'intervention': 'Dapagliflozin', 'outcome_title': 'HbA1c',
         'effect_type': 'MD', 'effect_estimate': -0.4, 'lower_ci': -0.6, 'upper_ci': -0.2,
         'ci_level': 0.95, 'is_ratio': False, 'enrollment': 500, 'phase': 3,
         'conditions': [], 'title': 'Trial X', 'start_date': '2018'},
    ]
    poolable = get_poolable_clusters(effects, min_k=2)
    assert len(poolable) == 0  # k=1 -> not poolable

def test_cluster_deduplicates_nct():
    from auto_cluster import build_clusters
    # Same NCT ID, same cluster key -> should count as k=1
    effects = [
        {'nct_id': 'NCT001', 'intervention': 'Dapagliflozin', 'outcome_title': 'All-cause mortality',
         'effect_type': 'HR', 'effect_estimate': 0.83, 'lower_ci': 0.71, 'upper_ci': 0.97,
         'ci_level': 0.95, 'is_ratio': True, 'enrollment': 4744, 'phase': 3,
         'conditions': ['HF'], 'title': 'DAPA-HF', 'start_date': '2017'},
        {'nct_id': 'NCT001', 'intervention': 'Dapagliflozin', 'outcome_title': 'Mortality',
         'effect_type': 'HR', 'effect_estimate': 0.83, 'lower_ci': 0.71, 'upper_ci': 0.97,
         'ci_level': 0.95, 'is_ratio': True, 'enrollment': 4744, 'phase': 3,
         'conditions': ['HF'], 'title': 'DAPA-HF', 'start_date': '2017'},
    ]
    clusters = build_clusters(effects)
    for key, cluster in clusters.items():
        if 'Mortality' in key:
            assert cluster['k'] == 1  # Deduplicated

def test_cluster_output_format():
    from auto_cluster import build_clusters
    effects = [
        {'nct_id': f'NCT{i:05d}', 'intervention': 'Metoprolol', 'outcome_title': 'All-cause mortality',
         'effect_type': 'HR', 'effect_estimate': 0.8 + i*0.01, 'lower_ci': 0.7, 'upper_ci': 0.95,
         'ci_level': 0.95, 'is_ratio': True, 'enrollment': 1000, 'phase': 3,
         'conditions': ['Heart Failure'], 'title': f'Trial {i}', 'start_date': f'{2015+i}'}
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
        assert 'total_enrollment' in cluster
        assert 'phase_distribution' in cluster
        assert 'year_range' in cluster
        assert 'interventions' in cluster
        assert cluster['k'] == len(cluster['studies'])

def test_cluster_skips_unknown_drugs():
    from auto_cluster import build_clusters
    effects = [
        {'nct_id': 'NCT001', 'intervention': 'ExperimentalDrug999', 'outcome_title': 'Mortality',
         'effect_type': 'HR', 'effect_estimate': 0.9, 'lower_ci': 0.7, 'upper_ci': 1.15,
         'ci_level': 0.95, 'is_ratio': True, 'enrollment': 500, 'phase': 2,
         'conditions': [], 'title': 'Trial Unknown', 'start_date': '2020'},
    ]
    clusters = build_clusters(effects)
    assert len(clusters) == 0  # Unknown drug -> skipped

def test_summarize_clusters():
    from auto_cluster import build_clusters, summarize_clusters
    effects = [
        {'nct_id': f'NCT{i:05d}', 'intervention': 'Metoprolol', 'outcome_title': 'All-cause mortality',
         'effect_type': 'HR', 'effect_estimate': 0.8, 'lower_ci': 0.7, 'upper_ci': 0.95,
         'ci_level': 0.95, 'is_ratio': True, 'enrollment': 1000, 'phase': 3,
         'conditions': ['HF'], 'title': f'Trial {i}', 'start_date': '2020'}
        for i in range(3)
    ]
    clusters = build_clusters(effects)
    summary = summarize_clusters(clusters)
    assert summary['total_clusters'] >= 1
    assert summary['total_studies'] == 3
    assert 'by_subcategory' in summary
    assert 'by_drug_class' in summary
    assert 'largest_clusters' in summary
