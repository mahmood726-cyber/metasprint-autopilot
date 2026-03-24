"""Test SHAHID validation -- published MA oracle comparison."""
import os, sys, math
sys.path.insert(0, os.path.dirname(__file__))

def test_load_pairwise70():
    from shahid_validate import load_pairwise70
    # Use a small inline CSV for testing
    import tempfile
    csv_content = '''"review_id","analysis_number","analysis_name","doi","k","effect_type","theta","sigma","tau","R","tau_estimator","R_status"
"CD000028_pub4","1","All-cause mortality","10.1002/14651858.CD000028.pub4",13,"logRR",-0.0802,0.0360,0.0255,0.76,"REML","ok"
"CD000028_pub4","2","CV mortality","10.1002/14651858.CD000028.pub4",12,"logRR",-0.3538,0.0975,0.0000,0.77,"REML","ok"
'''
    with tempfile.NamedTemporaryFile(mode='w', suffix='.csv', delete=False, encoding='utf-8') as f:
        f.write(csv_content)
        tmp_path = f.name
    try:
        data = load_pairwise70(tmp_path)
        assert len(data) == 2
        assert data[0]['review_id'] == 'CD000028_pub4'
        assert data[0]['analysis_name'] == 'All-cause mortality'
        assert abs(data[0]['theta'] - (-0.0802)) < 1e-4
        assert data[0]['k'] == 13
        assert data[0]['effect_type'] == 'logRR'
    finally:
        os.unlink(tmp_path)

def test_classify_agreement_confirmed():
    from shahid_validate import classify_agreement
    # Same direction, overlapping CIs (log scale, both negative = benefit)
    result = classify_agreement(
        our_effect=-0.30, our_ci_lo=-0.39, our_ci_hi=-0.21,  # log(0.74)
        pw_theta=-0.33, pw_sigma=0.05  # pw CI: -0.43 to -0.23
    )
    assert result == 'confirmed'

def test_classify_agreement_contradicted():
    from shahid_validate import classify_agreement
    # Opposite directions (our: benefit, published: harm)
    result = classify_agreement(
        our_effect=-0.30, our_ci_lo=-0.39, our_ci_hi=-0.21,
        pw_theta=0.14, pw_sigma=0.08
    )
    assert result == 'contradicted'

def test_classify_agreement_updated():
    from shahid_validate import classify_agreement
    # Same direction but our estimate is outside published CI
    result = classify_agreement(
        our_effect=-0.60, our_ci_lo=-0.70, our_ci_hi=-0.50,
        pw_theta=-0.30, pw_sigma=0.05  # pw CI: -0.40 to -0.20
    )
    assert result == 'updated'

def test_classify_discovery_novel():
    from shahid_validate import classify_discovery
    assert classify_discovery(has_match=False, has_ghost=False) == 'novel'

def test_classify_discovery_ghost():
    from shahid_validate import classify_discovery
    assert classify_discovery(has_match=False, has_ghost=True) == 'ghost'

def test_match_to_pairwise():
    from shahid_validate import match_to_pairwise
    cluster = {
        'drug_class': 'SGLT2 inhibitor',
        'subcategory': 'hf',
        'outcome_normalized': 'Mortality',
        'effect_type': 'HR',
    }
    pw_data = [
        {'review_id': 'CD001', 'analysis_name': 'All-cause mortality',
         'effect_type': 'logRR', 'theta': -0.08, 'sigma': 0.04, 'k': 13},
        {'review_id': 'CD002', 'analysis_name': 'Blood pressure change',
         'effect_type': 'MD', 'theta': -5.2, 'sigma': 1.1, 'k': 8},
    ]
    matches = match_to_pairwise(cluster, pw_data)
    assert isinstance(matches, list)
    # Should match mortality entry with higher score than BP entry
    if len(matches) > 0:
        assert 'mortality' in matches[0]['analysis_name'].lower()

def test_effect_type_compatibility():
    from shahid_validate import _effect_type_compatible
    assert _effect_type_compatible('HR', 'logRR') is True
    assert _effect_type_compatible('RR', 'logRR') is True
    assert _effect_type_compatible('OR', 'logOR') is True
    assert _effect_type_compatible('MD', 'MD') is True
    assert _effect_type_compatible('HR', 'MD') is False
    assert _effect_type_compatible('HR', 'GIV') is True  # GIV is wild
