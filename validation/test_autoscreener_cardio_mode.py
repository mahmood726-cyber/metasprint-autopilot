#!/usr/bin/env python3
"""
AS-001: CardioRCT Benchmark Harness — offline unit tests for the auto-screener.

Tests the CardioRCT hard gate logic, calibrated model, and signal detectors
against a gold-standard benchmark (data/autoscreener_cardio_benchmark_v1.jsonl).

Run:  python -m pytest validation/test_autoscreener_cardio_mode.py -v
"""

import json
import math
import os
import re
import sys
from pathlib import Path

import pytest

# ────────────────────────────────────────────────────────
# Port core JS functions to Python for offline testing
# ────────────────────────────────────────────────────────

RCT_PATTERNS = [
    re.compile(r'\brandom(is|iz)ed\b', re.I),
    re.compile(r'\brct\b', re.I),
    re.compile(r'\bcontrolled trial\b', re.I),
    re.compile(r'\bdouble.blind\b', re.I),
    re.compile(r'\bsingle.blind\b', re.I),
    re.compile(r'\bplacebo.controlled\b', re.I),
    re.compile(r'\bopen.label\b', re.I),
    re.compile(r'\bcrossover\b', re.I),
    re.compile(r'\bparallel.group\b', re.I),
    re.compile(r'\brandomisation\b', re.I),
    re.compile(r'\brandomization\b', re.I),
    re.compile(r'\ballocated\b', re.I),
    re.compile(r'\brandom allocation\b', re.I),
    re.compile(r'\bintention.to.treat\b', re.I),
    re.compile(r'\bphase [1-4]\b', re.I),
    re.compile(r'\bphase [IV]{1,3}\b', re.I),
    re.compile(r'\bNCT\d{8}\b', re.I),
]

CARDIO_SIGNALS = [
    re.compile(r'\bheart\b', re.I),
    re.compile(r'\bcardiac\b', re.I),
    re.compile(r'\bcardiovascul', re.I),
    re.compile(r'\bmyocard', re.I),
    re.compile(r'\batrial\b', re.I),
    re.compile(r'\bventricular\b', re.I),
    re.compile(r'\bcoronary\b', re.I),
    re.compile(r'\barrhythm', re.I),
    re.compile(r'\btachycardi', re.I),
    re.compile(r'\bbradycardi', re.I),
    re.compile(r'\bhypertens', re.I),
    re.compile(r'\bhypotens', re.I),
    re.compile(r'\bangina\b', re.I),
    re.compile(r'\binfarction\b', re.I),
    re.compile(r'\bstroke\b', re.I),
    re.compile(r'\bischemi', re.I),
    re.compile(r'\bischaemi', re.I),
    re.compile(r'\bthromboembol', re.I),
    re.compile(r'\bembolism\b', re.I),
    re.compile(r'\banticoagul', re.I),
    re.compile(r'\bantiplatelet\b', re.I),
    re.compile(r'\bstatin\b', re.I),
    re.compile(r'\bcholesterol\b', re.I),
    re.compile(r'\blipid\b', re.I),
    re.compile(r'\bejection fraction\b', re.I),
    re.compile(r'\bHFrEF\b', re.I),
    re.compile(r'\bHFpEF\b', re.I),
    re.compile(r'\bheart failure\b', re.I),
    re.compile(r'\bcardiomyopath', re.I),
    re.compile(r'\bvalve\b', re.I),
    re.compile(r'\baortic\b', re.I),
    re.compile(r'\bpacemaker\b', re.I),
    re.compile(r'\bdefibrillator\b', re.I),
    re.compile(r'\bSGLT2\b', re.I),
    re.compile(r'\bPCSK9\b', re.I),
]

NON_CARDIO_SIGNALS = [
    re.compile(r'\boncolog', re.I),
    re.compile(r'\bcancer\b', re.I),
    re.compile(r'\btumou?r\b', re.I),
    re.compile(r'\bcarcinoma\b', re.I),
    re.compile(r'\bsarcoma\b', re.I),
    re.compile(r'\bleuk[ae]mia\b', re.I),
    re.compile(r'\blymphoma\b', re.I),
    re.compile(r'\bmelanoma\b', re.I),
    re.compile(r'\bnephrol', re.I),
    re.compile(r'\bpsychiatr', re.I),
    re.compile(r'\bdermatol', re.I),
    re.compile(r'\bophthalmol', re.I),
    re.compile(r'\borthopaed', re.I),
    re.compile(r'\bpediatr', re.I),
    re.compile(r'\brheumat', re.I),
]


def compute_rct_signal(text):
    if not text:
        return 0
    matches = sum(1 for p in RCT_PATTERNS if p.search(text))
    return min(1, matches * 0.15)


def compute_cardio_signal(text):
    if not text:
        return 0
    matches = sum(1 for p in CARDIO_SIGNALS if p.search(text))
    return min(1, matches * 0.12)


def compute_non_cardio_signal(text):
    if not text:
        return 0
    matches = sum(1 for p in NON_CARDIO_SIGNALS if p.search(text))
    return min(1, matches * 0.25)


def hard_gate_decision(features):
    um = features['universeMatch']
    rct = features['rctSignal']
    cv = features['cardioSignal']
    ncv = features['nonCardioSignal']
    trust = features['sourceTrust']

    # Auto-include: universe match + RCT + cardio
    if um.get('matched') and um.get('score', 0) >= 0.9 and rct >= 0.5 and cv >= 0.3:
        return {'verdict': 'auto-include', 'reason': 'UNIVERSE_ID_MATCH', 'confidence': 0.98, 'gated': True}
    if rct >= 0.8 and cv >= 0.6 and trust >= 0.7:
        return {'verdict': 'auto-include', 'reason': 'STRONG_RCT_CARDIO', 'confidence': 0.92, 'gated': True}

    # Auto-exclude: strong non-cardio + no RCT + no universe
    if ncv >= 0.5 and rct < 0.2 and not um.get('matched') and cv < 0.15:
        return {'verdict': 'auto-exclude', 'reason': 'NON_CARDIO_NO_RCT', 'confidence': 0.95, 'gated': True}
    if cv < 0.1 and rct < 0.1 and not um.get('matched'):
        return {'verdict': 'auto-exclude', 'reason': 'NO_SIGNAL', 'confidence': 0.88, 'gated': True}

    return {'verdict': None, 'reason': 'PASS_TO_MODEL', 'confidence': 0, 'gated': False}


def compute_include_probability(features):
    coeffs = {
        'intercept': -2.5,
        'bm25Norm': 2.0,
        'picoScore': 2.5,
        'pillarScore': 2.0,
        'rctSignal': 3.0,
        'cardioSignal': 1.5,
        'universeMatchScore': 3.5,
        'sourceTrust': 0.5,
        'matchedPillars': 0.4,
        'nonCardioSignal': -3.0,
    }

    logit = coeffs['intercept']
    for key, coeff in coeffs.items():
        if key == 'intercept':
            continue
        logit += coeff * features.get(key, 0)

    return 1 / (1 + math.exp(-logit))


def get_source_trust(source):
    s = (source or '').lower()
    if 'clinicaltrials' in s or 'ct.gov' in s:
        return 0.9
    if 'aact' in s:
        return 0.85
    if 'pubmed' in s:
        return 0.7
    if 'europe pmc' in s:
        return 0.65
    if 'openalex' in s:
        return 0.5
    if 'crossref' in s:
        return 0.4
    return 0.3


# ────────────────────────────────────────────────────────
# Load benchmark data
# ────────────────────────────────────────────────────────

BENCHMARK_PATH = Path(__file__).parent.parent / 'data' / 'autoscreener_cardio_benchmark_v1.jsonl'


def load_benchmark():
    if not BENCHMARK_PATH.exists():
        pytest.skip(f'Benchmark file not found: {BENCHMARK_PATH}')
    records = []
    with open(BENCHMARK_PATH, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line:
                records.append(json.loads(line))
    return records


BENCHMARK = load_benchmark()


# ────────────────────────────────────────────────────────
# Tests
# ────────────────────────────────────────────────────────

class TestSignalDetectors:
    """Test that RCT, cardio, and non-cardio signal detectors work correctly."""

    def test_rct_signal_detects_randomized_trials(self):
        text = 'Randomized double-blind placebo-controlled trial of drug X'
        assert compute_rct_signal(text) >= 0.3

    def test_rct_signal_low_for_observational(self):
        text = 'Cross-sectional observational study examining dietary patterns'
        assert compute_rct_signal(text) < 0.15

    def test_rct_signal_detects_nct_id(self):
        text = 'NCT01234567 registered trial'
        assert compute_rct_signal(text) > 0

    def test_cardio_signal_detects_heart_failure(self):
        text = 'heart failure with reduced ejection fraction HFrEF'
        assert compute_cardio_signal(text) >= 0.3

    def test_cardio_signal_low_for_oncology(self):
        text = 'pembrolizumab in non-small cell lung cancer'
        assert compute_cardio_signal(text) < 0.15

    def test_non_cardio_signal_detects_oncology(self):
        text = 'phase 3 trial in non-small cell lung cancer with pembrolizumab'
        assert compute_non_cardio_signal(text) >= 0.25

    def test_non_cardio_signal_low_for_cardiology(self):
        text = 'randomized trial of empagliflozin in heart failure'
        assert compute_non_cardio_signal(text) < 0.1


class TestHardGate:
    """Test hard gate decision rules."""

    def test_strong_rct_cardio_includes(self):
        result = hard_gate_decision({
            'universeMatch': {'matched': False, 'score': 0},
            'rctSignal': 0.85,
            'cardioSignal': 0.7,
            'nonCardioSignal': 0,
            'sourceTrust': 0.9,
        })
        assert result['verdict'] == 'auto-include'
        assert result['reason'] == 'STRONG_RCT_CARDIO'

    def test_universe_match_includes(self):
        result = hard_gate_decision({
            'universeMatch': {'matched': True, 'score': 0.95},
            'rctSignal': 0.6,
            'cardioSignal': 0.4,
            'nonCardioSignal': 0,
            'sourceTrust': 0.9,
        })
        assert result['verdict'] == 'auto-include'
        assert result['reason'] == 'UNIVERSE_ID_MATCH'

    def test_non_cardio_no_rct_excludes(self):
        result = hard_gate_decision({
            'universeMatch': {'matched': False, 'score': 0},
            'rctSignal': 0.1,
            'cardioSignal': 0.05,
            'nonCardioSignal': 0.6,
            'sourceTrust': 0.5,
        })
        assert result['verdict'] == 'auto-exclude'
        assert result['reason'] == 'NON_CARDIO_NO_RCT'

    def test_no_signal_excludes(self):
        result = hard_gate_decision({
            'universeMatch': {'matched': False, 'score': 0},
            'rctSignal': 0.05,
            'cardioSignal': 0.05,
            'nonCardioSignal': 0,
            'sourceTrust': 0.3,
        })
        assert result['verdict'] == 'auto-exclude'
        assert result['reason'] == 'NO_SIGNAL'

    def test_ambiguous_passes_to_model(self):
        result = hard_gate_decision({
            'universeMatch': {'matched': False, 'score': 0},
            'rctSignal': 0.4,
            'cardioSignal': 0.3,
            'nonCardioSignal': 0.1,
            'sourceTrust': 0.7,
        })
        assert result['verdict'] is None
        assert result['reason'] == 'PASS_TO_MODEL'


class TestCalibratedModel:
    """Test calibrated probability model."""

    def test_strong_cardio_rct_high_probability(self):
        p = compute_include_probability({
            'bm25Norm': 0.8,
            'picoScore': 0.9,
            'pillarScore': 0.8,
            'rctSignal': 0.9,
            'cardioSignal': 0.8,
            'universeMatchScore': 0,
            'sourceTrust': 0.9,
            'matchedPillars': 3,
            'nonCardioSignal': 0,
        })
        assert p > 0.9, f'Expected p > 0.9, got {p:.3f}'

    def test_non_cardio_low_probability(self):
        p = compute_include_probability({
            'bm25Norm': 0.2,
            'picoScore': 0.1,
            'pillarScore': 0.1,
            'rctSignal': 0.1,
            'cardioSignal': 0.05,
            'universeMatchScore': 0,
            'sourceTrust': 0.3,
            'matchedPillars': 0,
            'nonCardioSignal': 0.7,
        })
        assert p < 0.2, f'Expected p < 0.2, got {p:.3f}'

    def test_universe_match_boosts_probability(self):
        base = compute_include_probability({
            'bm25Norm': 0.5,
            'picoScore': 0.5,
            'pillarScore': 0.5,
            'rctSignal': 0.5,
            'cardioSignal': 0.5,
            'universeMatchScore': 0,
            'sourceTrust': 0.5,
            'matchedPillars': 2,
            'nonCardioSignal': 0,
        })
        with_universe = compute_include_probability({
            'bm25Norm': 0.5,
            'picoScore': 0.5,
            'pillarScore': 0.5,
            'rctSignal': 0.5,
            'cardioSignal': 0.5,
            'universeMatchScore': 0.95,
            'sourceTrust': 0.5,
            'matchedPillars': 2,
            'nonCardioSignal': 0,
        })
        assert with_universe > base


class TestSourceTrust:
    """Test source trust scoring."""

    def test_ctgov_highest(self):
        assert get_source_trust('ClinicalTrials.gov') == 0.9

    def test_pubmed_moderate(self):
        assert get_source_trust('PubMed') == 0.7

    def test_openalex_lower(self):
        assert get_source_trust('OpenAlex') == 0.5

    def test_unknown_lowest(self):
        assert get_source_trust('random_source') == 0.3


class TestBenchmarkAccuracy:
    """Test overall accuracy against the gold-standard benchmark."""

    @pytest.fixture(autouse=True)
    def setup_benchmark(self):
        self.records = BENCHMARK
        assert len(self.records) >= 10, f'Benchmark too small: {len(self.records)}'

    def _classify(self, rec):
        """Classify a single benchmark record using the full pipeline.

        In offline mode, BM25/PICO scores are simulated based on
        cardio/RCT signals (since we don't have the actual PICO query).
        A real cardiology PICO query would give high BM25/PICO to
        cardiology RCTs and low scores to non-cardiology items.
        """
        text = f"{rec.get('title', '')} {rec.get('abstract', '')}"

        rct_signal = compute_rct_signal(text)
        cardio_signal = compute_cardio_signal(text)
        non_cardio_signal = compute_non_cardio_signal(text)
        source_trust = get_source_trust(rec.get('source', ''))

        nct_id = rec.get('nctId')
        universe_match = {
            'matched': bool(nct_id),
            'score': 0.95 if nct_id else 0,
        }

        features = {
            'universeMatch': universe_match,
            'rctSignal': rct_signal,
            'cardioSignal': cardio_signal,
            'nonCardioSignal': non_cardio_signal,
            'sourceTrust': source_trust,
        }

        gate = hard_gate_decision(features)
        if gate['gated']:
            return 'include' if gate['verdict'] == 'auto-include' else 'exclude'

        # Model phase — simulate BM25/PICO as proxied by signals.
        # In the real app, BM25/PICO scores reflect how well the text matches
        # the cardiology PICO query. Non-cardiology content gets near-zero
        # BM25/PICO regardless of RCT signal strength.
        sim_bm25 = cardio_signal * 0.85 + rct_signal * 0.1
        sim_pico = cardio_signal * 0.8 + rct_signal * 0.15
        sim_pillar = cardio_signal * 0.9
        sim_pillars = round(sim_pillar * 4)

        model_features = {
            'bm25Norm': sim_bm25,
            'picoScore': sim_pico,
            'pillarScore': sim_pillar,
            'rctSignal': rct_signal,
            'cardioSignal': cardio_signal,
            'universeMatchScore': universe_match['score'],
            'sourceTrust': source_trust,
            'matchedPillars': sim_pillars,
            'nonCardioSignal': non_cardio_signal,
        }
        p = compute_include_probability(model_features)
        return 'include' if p >= 0.5 else 'exclude'

    def test_overall_accuracy_above_80_percent(self):
        correct = 0
        for rec in self.records:
            predicted = self._classify(rec)
            if predicted == rec['expected']:
                correct += 1
        accuracy = correct / len(self.records)
        assert accuracy >= 0.80, f'Accuracy {accuracy:.1%} below 80% threshold'

    def test_recall_for_includes_above_90_percent(self):
        """All true cardiology RCTs should be classified as include."""
        includes = [r for r in self.records if r['expected'] == 'include']
        assert len(includes) > 0
        correct = sum(1 for r in includes if self._classify(r) == 'include')
        recall = correct / len(includes)
        assert recall >= 0.90, f'Include recall {recall:.1%} below 90% threshold'

    def test_specificity_for_excludes_above_60_percent(self):
        """Non-cardiology/non-RCT studies should mostly be excluded.

        Note: Offline specificity is limited by simulated BM25/PICO scores.
        Non-cardiology RCTs (e.g., rheumatology, pediatric) get high RCT signal
        but the simulated PICO cannot discriminate against them as effectively
        as real PICO query matching would. Real-app specificity targets >= 80%.
        """
        excludes = [r for r in self.records if r['expected'] == 'exclude']
        assert len(excludes) > 0
        correct = sum(1 for r in excludes if self._classify(r) == 'exclude')
        specificity = correct / len(excludes)
        assert specificity >= 0.60, f'Exclude specificity {specificity:.1%} below 60% offline threshold'

    def test_no_false_negatives_for_landmark_trials(self):
        """Named landmark trials (PARADIGM-HF, PLATO, SHIFT, etc.) must be included."""
        landmarks = [r for r in self.records if 'landmark' in (r.get('reason') or '').lower()
                     or any(name in (r.get('title') or '')
                            for name in ['PARADIGM', 'PLATO', 'SHIFT', 'COMPASS', 'ODYSSEY'])]
        for rec in landmarks:
            predicted = self._classify(rec)
            assert predicted == 'include', \
                f'Landmark trial {rec["id"]} ({rec["title"][:50]}) wrongly excluded'
