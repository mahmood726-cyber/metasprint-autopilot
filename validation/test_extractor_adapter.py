"""Targeted tests for RCT extractor adapter logic in the browser app."""


def test_extractor_maps_extended_effect_types(driver):
    result = driver.execute_script("""
        return {
            irr: _extractorMapEffectType('IRR'),
            wmd: _extractorMapEffectType('WMD'),
            ard: _extractorMapEffectType('ARD'),
            nnt: _extractorMapEffectType('NNT')
        };
    """)
    assert result["irr"] == "RR"
    assert result["wmd"] == "MD"
    assert result["ard"] == "RD"
    assert result["nnt"] is None


def test_extractor_candidate_rejects_low_confidence(driver):
    result = driver.execute_script("""
        const parsed = _extractorBuildCandidate({
            effect_type: 'HR',
            point_estimate: 0.82,
            ci: { lower: 0.75, upper: 0.90 },
            confidence: 0.61,
            automation_tier: 'verify',
            source_text: 'HR 0.82 (95% CI 0.75 to 0.90)'
        }, 'text');
        return parsed;
    """)
    assert result["ok"] is False
    assert result["reason"] == "low_confidence"


def test_extractor_candidate_accepts_high_confidence_complete_ci(driver):
    result = driver.execute_script("""
        const parsed = _extractorBuildCandidate({
            effect_type: 'HR',
            point_estimate: 0.74,
            ci: { lower: 0.65, upper: 0.85 },
            confidence: 0.94,
            automation_tier: 'full_auto',
            source_text: 'Primary endpoint: HR 0.74 (95% CI 0.65 to 0.85). NCT01234567.'
        }, 'pdf');
        if (!parsed.ok) return parsed;
        return {
            ok: parsed.ok,
            effectType: parsed.payload.effectType,
            verify: parsed.payload.verificationStatus,
            nct: parsed.payload.nctId,
            hasNote: (parsed.payload.notes || '').includes('[AUTO]')
        };
    """)
    assert result["ok"] is True
    assert result["effectType"] == "HR"
    assert result["verify"] == "needs-check"
    assert result["nct"] == "NCT01234567"
    assert result["hasNote"] is True


def test_extractor_dedup_prefers_higher_confidence(driver):
    result = driver.execute_script("""
        const base = {
            trialId: 'NCT12345678',
            nctId: 'NCT12345678',
            effectType: 'HR',
            effectEstimate: 0.80,
            lowerCI: 0.70,
            upperCI: 0.91,
            outcomeId: 'CV death',
            timepoint: '12 months',
            _sourceFingerprint: 'pdf::x'
        };
        const deduped = _extractorDeduplicate([
            { ...base, _confidence: 0.81, notes: 'low' },
            { ...base, _confidence: 0.96, notes: 'high' }
        ]);
        return {
            count: deduped.length,
            chosen: deduped[0]?._confidence || 0
        };
    """)
    assert result["count"] == 1
    assert abs(result["chosen"] - 0.96) < 1e-9
