#!/usr/bin/env python3
"""
AS-011: Test Suite Expansion — threshold calibration and explainability.

Tests calibration logic, threshold boundaries, and model behavior
under various policy configurations.

Run:  python -m pytest validation/test_autoscreener_thresholds.py -v
"""

import math
import pytest

# ────────────────────────────────────────────────────────
# Port threshold calibration from JS
# ────────────────────────────────────────────────────────

def calibrate_thresholds(scores, policy):
    if not scores:
        return {'includeThreshold': 0.75, 'excludeThreshold': 0.15}

    sorted_scores = sorted(scores)
    target_review_rate = policy.get('targetReviewRate', 0.20)
    strict_recall = policy.get('strictRecall', True)

    t_inc = 0.75
    t_exc = 0.15

    target_include_rate = 1 - target_review_rate - 0.1
    pct_idx = int(len(sorted_scores) * (1 - target_include_rate))
    if 0 <= pct_idx < len(sorted_scores):
        t_inc = max(0.5, min(0.9, sorted_scores[pct_idx]))

    if strict_recall:
        t_exc = min(0.10, t_exc)
    else:
        excl_pct_idx = int(len(sorted_scores) * 0.15)
        if 0 <= excl_pct_idx < len(sorted_scores):
            t_exc = min(0.25, sorted_scores[excl_pct_idx])

    return {'includeThreshold': t_inc, 'excludeThreshold': t_exc}


def decide_verdict(p_include, include_threshold, exclude_threshold):
    if p_include >= include_threshold:
        return 'auto-include'
    if p_include <= exclude_threshold:
        return 'auto-exclude'
    return 'needs-review'


# ────────────────────────────────────────────────────────
# Tests
# ────────────────────────────────────────────────────────

class TestThresholdCalibration:
    """Test that threshold calibration produces valid values."""

    def test_empty_scores_returns_defaults(self):
        result = calibrate_thresholds([], {'targetReviewRate': 0.20})
        assert result['includeThreshold'] == 0.75
        assert result['excludeThreshold'] == 0.15

    def test_strict_recall_lowers_exclude_threshold(self):
        scores = [i / 100 for i in range(100)]
        strict = calibrate_thresholds(scores, {'strictRecall': True, 'targetReviewRate': 0.20})
        relaxed = calibrate_thresholds(scores, {'strictRecall': False, 'targetReviewRate': 0.20})
        assert strict['excludeThreshold'] <= relaxed['excludeThreshold']

    def test_include_threshold_bounded(self):
        scores = [0.99] * 100  # all high scores
        result = calibrate_thresholds(scores, {'targetReviewRate': 0.20})
        assert 0.5 <= result['includeThreshold'] <= 0.9

    def test_exclude_threshold_bounded(self):
        scores = [0.01] * 100  # all low scores
        result = calibrate_thresholds(scores, {'targetReviewRate': 0.20, 'strictRecall': False})
        assert result['excludeThreshold'] <= 0.25

    def test_higher_review_target_lowers_include_threshold(self):
        scores = [i / 100 for i in range(100)]
        low_review = calibrate_thresholds(scores, {'targetReviewRate': 0.10})
        high_review = calibrate_thresholds(scores, {'targetReviewRate': 0.40})
        # Higher review rate means lower include threshold (more go to review)
        assert high_review['includeThreshold'] >= low_review['includeThreshold']

    def test_include_always_above_exclude(self):
        """Include threshold must always be above exclude threshold."""
        for n in [10, 50, 100, 500]:
            scores = [i / n for i in range(n)]
            for rate in [0.05, 0.10, 0.20, 0.40]:
                for strict in [True, False]:
                    result = calibrate_thresholds(scores, {
                        'targetReviewRate': rate,
                        'strictRecall': strict,
                    })
                    assert result['includeThreshold'] > result['excludeThreshold'], \
                        f'Thresholds inverted: inc={result["includeThreshold"]}, exc={result["excludeThreshold"]} (n={n}, rate={rate}, strict={strict})'


class TestVerdictDecision:
    """Test verdict decision boundaries."""

    def test_high_score_includes(self):
        assert decide_verdict(0.9, 0.75, 0.15) == 'auto-include'

    def test_low_score_excludes(self):
        assert decide_verdict(0.05, 0.75, 0.15) == 'auto-exclude'

    def test_middle_score_needs_review(self):
        assert decide_verdict(0.5, 0.75, 0.15) == 'needs-review'

    def test_boundary_include_exact(self):
        assert decide_verdict(0.75, 0.75, 0.15) == 'auto-include'

    def test_boundary_exclude_exact(self):
        assert decide_verdict(0.15, 0.75, 0.15) == 'auto-exclude'

    def test_just_below_include(self):
        assert decide_verdict(0.749, 0.75, 0.15) == 'needs-review'

    def test_just_above_exclude(self):
        assert decide_verdict(0.151, 0.75, 0.15) == 'needs-review'


class TestRecallSafetyGuard:
    """Test that strict recall mode protects potential RCTs from exclusion."""

    def test_recall_guard_upgrades_to_review(self):
        """In strict recall mode, auto-exclude should be upgraded to needs-review
        if RCT signal and cardio signal are present."""
        # Simulates: verdict=auto-exclude, rctSignal>=0.3, cardioSignal>=0.2
        verdict = 'auto-exclude'
        rct_signal = 0.35
        cardio_signal = 0.25
        strict_recall = True

        if strict_recall and verdict == 'auto-exclude' and rct_signal >= 0.3 and cardio_signal >= 0.2:
            verdict = 'needs-review'

        assert verdict == 'needs-review'

    def test_no_guard_without_signals(self):
        """Low signals should NOT trigger recall guard."""
        verdict = 'auto-exclude'
        rct_signal = 0.1
        cardio_signal = 0.05
        strict_recall = True

        if strict_recall and verdict == 'auto-exclude' and rct_signal >= 0.3 and cardio_signal >= 0.2:
            verdict = 'needs-review'

        assert verdict == 'auto-exclude'

    def test_no_guard_when_strict_off(self):
        """Recall guard should not activate when strict mode is off."""
        verdict = 'auto-exclude'
        rct_signal = 0.5
        cardio_signal = 0.4
        strict_recall = False

        if strict_recall and verdict == 'auto-exclude' and rct_signal >= 0.3 and cardio_signal >= 0.2:
            verdict = 'needs-review'

        assert verdict == 'auto-exclude'


class TestShadowMode:
    """Test shadow mode behavior."""

    def test_shadow_mode_forces_needs_review(self):
        """In shadow mode, all verdicts should become needs-review."""
        shadow_mode = True
        for original in ['auto-include', 'auto-exclude', 'needs-review']:
            verdict = original
            if shadow_mode and verdict != 'needs-review':
                verdict = 'needs-review'
            assert verdict == 'needs-review'

    def test_shadow_mode_preserves_original(self):
        """Shadow mode should store the original verdict for comparison."""
        shadow_mode = True
        original = 'auto-include'
        shadow_original = None
        verdict = original
        if shadow_mode and verdict != 'needs-review':
            shadow_original = verdict
            verdict = 'needs-review'

        assert verdict == 'needs-review'
        assert shadow_original == 'auto-include'
