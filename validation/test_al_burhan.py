"""Selenium tests for Al-Burhan browser integration."""
import os, sys, time, json
import pytest
from selenium.webdriver.common.by import By


def test_al_burhan_tab_exists(driver):
    """Al-Burhan tab appears in universe view tabs."""
    # Navigate to Discover phase
    try:
        driver.find_element(By.CSS_SELECTOR, '.tab[data-phase="discover"]').click()
        time.sleep(0.5)
    except Exception:
        pass  # May already be on discover

    # Check Al-Burhan tab exists (use textContent for headless compatibility)
    tabs = driver.find_elements(By.CSS_SELECTOR, '.view-tab')
    tab_labels = [t.get_attribute('textContent').strip() for t in tabs]
    assert 'Al-Burhan' in tab_labels, f"Al-Burhan tab not found. Tabs: {tab_labels}"


def test_al_burhan_canvas_exists(driver):
    """Al-Burhan canvas element exists in DOM."""
    canvas = driver.find_elements(By.ID, 'alBurhanCanvas')
    assert len(canvas) == 1, "alBurhanCanvas not found"


def test_al_burhan_functions_exist(driver):
    """Al-Burhan JS functions are defined."""
    functions = [
        'loadAlBurhanData',
        'autoPoolAlBurhan',
        'alBurhanToAyatNodes',
        'renderAlBurhanUniverse',
        'computeTSA',
        'crossConditionBorrowing',
        'computeNMA',
        'ghostProtocolSensitivity',
        'computeTransportability',
        'computeEvidenceVelocity',
    ]
    for fn in functions:
        result = driver.execute_script(f"return typeof {fn} === 'function'")
        assert result, f"Function {fn} not found"


def test_al_burhan_auto_pool_with_mock_data(driver):
    """Load mock Al-Burhan data and verify auto-pooling works."""
    mock_data = {
        "al_burhan_version": "1.0.0",
        "harvest_date": "2026-02-24",
        "total_trials": 3,
        "total_effects": 3,
        "total_clusters": 1,
        "poolable_clusters": 1,
        "clusters": [{
            "id": "hf|SGLT2 inhibitor|CV death or HF hosp|HR",
            "subcategory": "hf",
            "drug_class": "SGLT2 inhibitor",
            "outcome": "CV death or HF hosp",
            "outcome_category": "hard",
            "effect_type": "HR",
            "is_ratio": True,
            "k": 3,
            "total_enrollment": 14737,
            "studies": [
                {"nct_id": "NCT03036124", "effect_estimate": 0.74, "lower_ci": 0.65, "upper_ci": 0.85,
                 "ci_level": 0.95, "enrollment": 4744, "phase": 3, "title": "DAPA-HF", "start_date": "2017"},
                {"nct_id": "NCT03057977", "effect_estimate": 0.75, "lower_ci": 0.65, "upper_ci": 0.86,
                 "ci_level": 0.95, "enrollment": 3730, "phase": 3, "title": "EMPEROR-R", "start_date": "2017"},
                {"nct_id": "NCT03619213", "effect_estimate": 0.82, "lower_ci": 0.73, "upper_ci": 0.92,
                 "ci_level": 0.95, "enrollment": 6263, "phase": 3, "title": "DELIVER", "start_date": "2018"},
            ],
            "phase_distribution": {"3": 3},
            "year_range": [2017, 2018],
            "interventions": ["Dapagliflozin", "Empagliflozin"],
            "furqan": "novel",
            "isnad": {"source": "test", "harvest_date": "2026-02-24", "content_hash": "abc123", "pipeline_version": "1.0.0"},
        }]
    }

    # Inject mock data and auto-pool
    result = driver.execute_script("""
        const data = arguments[0];
        loadAlBurhanData(data);
        const results = autoPoolAlBurhan(data);
        if (!results || results.length === 0) return {error: 'no results'};
        const r = results[0];
        if (!r.pooled) return {error: 'pooling failed'};
        return {
            k: r.pooled.k,
            effect: r.pooled.effect,
            ci_lo: r.pooled.ci_lo,
            ci_hi: r.pooled.ci_hi,
            tau2: r.pooled.tau2,
            I2: r.pooled.I2,
            method: r.pooled.method,
        };
    """, mock_data)

    assert 'error' not in result, f"Auto-pooling failed: {result.get('error')}"
    assert result['k'] == 3
    assert 0.70 < result['effect'] < 0.85  # Pooled HR should be ~0.76
    assert result['ci_lo'] < result['effect'] < result['ci_hi']
    assert result['method'] in ('DL', 'DL+HKSJ')  # HKSJ auto-enabled for k<=4


def test_tsa_computation(driver):
    """TSA computes correctly on mock data."""
    result = driver.execute_script("""
        const studies = [
            {effect_estimate: 0.74, lower_ci: 0.65, upper_ci: 0.85, start_date: '2017'},
            {effect_estimate: 0.75, lower_ci: 0.65, upper_ci: 0.86, start_date: '2017'},
            {effect_estimate: 0.82, lower_ci: 0.73, upper_ci: 0.92, start_date: '2018'},
        ];
        const pooled = {pooled: 0.77, pooledLo: 0.71, pooledHi: 0.83, k: 3, isRatio: true};
        const tsa = computeTSA(studies, pooled);
        if (!tsa) return {error: 'TSA returned null'};
        return {
            conclusion: tsa.conclusion,
            ris: tsa.ris,
            info_fraction: tsa.info_fraction,
            n_points: tsa.cumulative_z.length,
        };
    """)

    assert 'error' not in result, f"TSA failed: {result.get('error')}"
    assert result['n_points'] == 3
    assert result['conclusion'] in ('firm', 'insufficient', 'futile')
    assert result['ris'] > 0


def test_evidence_velocity(driver):
    """Evidence velocity computes correctly."""
    result = driver.execute_script("""
        const studies = [
            {nct_id: 'A', effect_estimate: 0.74, lower_ci: 0.65, upper_ci: 0.85, start_date: '2015'},
            {nct_id: 'B', effect_estimate: 0.80, lower_ci: 0.70, upper_ci: 0.92, start_date: '2017'},
            {nct_id: 'C', effect_estimate: 0.77, lower_ci: 0.71, upper_ci: 0.83, start_date: '2019'},
            {nct_id: 'D', effect_estimate: 0.76, lower_ci: 0.70, upper_ci: 0.82, start_date: '2021'},
        ];
        const pooled = {pooled: 0.77, isRatio: true};
        const ev = computeEvidenceVelocity(studies, pooled);
        if (!ev) return {error: 'velocity returned null'};
        return {
            velocity: ev.velocity,
            stability: ev.stability,
            total_k: ev.total_k,
            direction_flips: ev.direction_flips,
        };
    """)

    assert 'error' not in result, f"Velocity failed: {result.get('error')}"
    assert result['total_k'] == 4
    assert result['stability'] in ('STABLE', 'CONVERGING', 'EVOLVING', 'VOLATILE')
    assert result['direction_flips'] >= 0
