"""Tests for DerSimonian-Laird random-effects meta-analysis (pool_dl)."""
import math
import os
import sys
from statistics import NormalDist

sys.path.insert(0, os.path.dirname(__file__))

from pool_dl import pool_dl, pool_cluster

# z critical value for 95% CI (matches pool_dl default)
_Z95 = NormalDist().inv_cdf(0.975)


# ---------------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------------

def _approx(a, b, tol=1e-6):
    """Check approximate equality for floats."""
    if a is None and b is None:
        return True
    if a is None or b is None:
        return False
    return abs(a - b) < tol


# ---------------------------------------------------------------------------
# 1) Test DL on known values -- 3 HR studies
# ---------------------------------------------------------------------------

def test_dl_known_values_k3():
    """Hand-verified 3-study HR example on the log scale.

    Studies (ratio scale):
        Study 1: HR=0.74, 95% CI 0.65-0.85  (DAPA-HF like)
        Study 2: HR=0.75, 95% CI 0.65-0.86  (EMPEROR-Reduced like)
        Study 3: HR=0.87, 95% CI 0.79-0.95  (DELIVER like)
    """
    # Convert to log scale
    log_effects = [math.log(0.74), math.log(0.75), math.log(0.87)]

    # Variances from CI width on log scale: se = (log(hi) - log(lo)) / (2*1.96)
    vars_ = [
        ((math.log(0.85) - math.log(0.65)) / (2 * 1.96)) ** 2,
        ((math.log(0.86) - math.log(0.65)) / (2 * 1.96)) ** 2,
        ((math.log(0.95) - math.log(0.79)) / (2 * 1.96)) ** 2,
    ]

    result = pool_dl(log_effects, vars_)

    assert result is not None
    assert result['k'] == 3

    # --- Manually verify step by step ---
    # Fixed-effect weights
    ws = [1.0 / v for v in vars_]
    sum_w = sum(ws)

    # Fixed-effect estimate
    mu_fe = sum(w * y for w, y in zip(ws, log_effects)) / sum_w

    # Cochran's Q
    Q_manual = sum(w * (y - mu_fe) ** 2 for w, y in zip(ws, log_effects))

    # C
    sum_w2 = sum(w ** 2 for w in ws)
    C_manual = sum_w - sum_w2 / sum_w

    # tau2
    tau2_manual = max(0.0, (Q_manual - 2) / C_manual)

    # RE weights
    ws_star = [1.0 / (v + tau2_manual) for v in vars_]
    sum_w_star = sum(ws_star)
    theta_manual = sum(w * y for w, y in zip(ws_star, log_effects)) / sum_w_star
    se_manual = math.sqrt(1.0 / sum_w_star)

    # I2
    I2_manual = max(0.0, (Q_manual - 2) / Q_manual * 100.0) if Q_manual > 0 else 0.0

    assert _approx(result['theta'], theta_manual), f"{result['theta']} != {theta_manual}"
    assert _approx(result['se'], se_manual), f"{result['se']} != {se_manual}"
    assert _approx(result['tau2'], tau2_manual), f"{result['tau2']} != {tau2_manual}"
    assert _approx(result['Q'], Q_manual), f"{result['Q']} != {Q_manual}"
    assert _approx(result['I2'], I2_manual), f"{result['I2']} != {I2_manual}"
    assert _approx(result['ci_lo'], theta_manual - _Z95 * se_manual)
    assert _approx(result['ci_hi'], theta_manual + _Z95 * se_manual)

    # Sanity: pooled log-HR should be negative (protective)
    assert result['theta'] < 0
    # Pooled HR on original scale should be between ~0.7 and ~0.9
    pooled_hr = math.exp(result['theta'])
    assert 0.65 < pooled_hr < 0.90, f"Pooled HR={pooled_hr:.4f} out of expected range"


# ---------------------------------------------------------------------------
# 2) Test k=1 case
# ---------------------------------------------------------------------------

def test_dl_single_study():
    """With k=1, should return the single study with tau2=0, I2=0."""
    y = [math.log(0.80)]
    v = [0.01]

    result = pool_dl(y, v)

    assert result is not None
    assert result['k'] == 1
    assert result['theta'] == y[0]
    assert _approx(result['se'], math.sqrt(0.01))
    assert result['tau2'] == 0.0
    assert result['I2'] == 0.0
    assert result['Q'] == 0.0
    assert _approx(result['ci_lo'], y[0] - _Z95 * math.sqrt(0.01))
    assert _approx(result['ci_hi'], y[0] + _Z95 * math.sqrt(0.01))


# ---------------------------------------------------------------------------
# 3) Test ratio back-transformation via pool_cluster
# ---------------------------------------------------------------------------

def test_pool_cluster_ratio_backtransform():
    """pool_cluster with is_ratio=True should log-transform, pool, then exp."""
    cluster = {
        'is_ratio': True,
        'studies': [
            {'effect_estimate': 0.74, 'lower_ci': 0.65, 'upper_ci': 0.85},
            {'effect_estimate': 0.75, 'lower_ci': 0.65, 'upper_ci': 0.86},
            {'effect_estimate': 0.87, 'lower_ci': 0.79, 'upper_ci': 0.95},
        ],
    }

    result = pool_cluster(cluster)

    assert result['pooled_effect'] is not None
    # Pooled HR should be between 0.65 and 0.90 (protective)
    assert 0.65 < result['pooled_effect'] < 0.90, \
        f"Pooled HR={result['pooled_effect']:.4f}"
    # CI should bracket the pooled estimate
    assert result['pooled_ci_lo'] < result['pooled_effect'] < result['pooled_ci_hi']
    # CI bounds should be positive (ratio scale)
    assert result['pooled_ci_lo'] > 0
    assert result['pooled_ci_hi'] > 0
    # Heterogeneity stats should be present
    assert result['tau2'] is not None
    assert result['I2'] is not None
    assert result['Q'] is not None

    # Verify back-transformation matches manual computation
    log_effects = [math.log(0.74), math.log(0.75), math.log(0.87)]
    vars_ = [
        ((math.log(0.85) - math.log(0.65)) / (2 * _Z95)) ** 2,
        ((math.log(0.86) - math.log(0.65)) / (2 * _Z95)) ** 2,
        ((math.log(0.95) - math.log(0.79)) / (2 * _Z95)) ** 2,
    ]
    dl_result = pool_dl(log_effects, vars_)
    assert _approx(result['pooled_effect'], math.exp(dl_result['theta']), tol=1e-8)
    assert _approx(result['pooled_ci_lo'], math.exp(dl_result['ci_lo']), tol=1e-8)
    assert _approx(result['pooled_ci_hi'], math.exp(dl_result['ci_hi']), tol=1e-8)


# ---------------------------------------------------------------------------
# 4) Test pool_cluster integration -- difference measure
# ---------------------------------------------------------------------------

def test_pool_cluster_difference_measure():
    """pool_cluster with is_ratio=False should pool on the original scale."""
    cluster = {
        'is_ratio': False,
        'studies': [
            {'effect_estimate': -5.0, 'lower_ci': -8.0, 'upper_ci': -2.0},
            {'effect_estimate': -4.5, 'lower_ci': -7.5, 'upper_ci': -1.5},
            {'effect_estimate': -6.0, 'lower_ci': -9.0, 'upper_ci': -3.0},
        ],
    }

    result = pool_cluster(cluster)

    assert result['pooled_effect'] is not None
    # Pooled MD should be negative (around -5)
    assert -8.0 < result['pooled_effect'] < -2.0
    assert result['pooled_ci_lo'] < result['pooled_effect'] < result['pooled_ci_hi']
    assert result['I2'] is not None
    assert 0 <= result['I2'] <= 100


# ---------------------------------------------------------------------------
# 5) Edge cases
# ---------------------------------------------------------------------------

def test_dl_empty_input():
    """Empty inputs should return None."""
    assert pool_dl([], []) is None
    assert pool_dl(None, None) is None


def test_dl_mismatched_lengths():
    """Mismatched lengths should return None."""
    assert pool_dl([1.0, 2.0], [0.1]) is None


def test_dl_all_zero_variance():
    """All zero-variance studies should be skipped -> None."""
    assert pool_dl([1.0, 2.0], [0.0, 0.0]) is None


def test_dl_negative_variance_skipped():
    """Negative variance studies should be skipped."""
    result = pool_dl([1.0, 2.0, 3.0], [0.1, -0.5, 0.2])
    assert result is not None
    assert result['k'] == 2  # Only 2 valid studies


def test_dl_nan_inf_skipped():
    """NaN/Inf effects or variances should be skipped."""
    result = pool_dl(
        [1.0, float('nan'), 3.0, float('inf')],
        [0.1, 0.2, float('nan'), 0.3],
    )
    assert result is not None
    assert result['k'] == 1  # Only first study is fully valid


def test_pool_cluster_missing_ci_and_variance():
    """Studies with no variance and no CI should be skipped."""
    cluster = {
        'is_ratio': False,
        'studies': [
            {'effect_estimate': 1.0},  # No variance, no CI
            {'effect_estimate': 2.0, 'variance': 0.1},
        ],
    }
    result = pool_cluster(cluster)
    # Should still pool the one valid study
    assert result['pooled_effect'] is not None


def test_pool_cluster_ratio_nonpositive_estimate():
    """Ratio-scale study with non-positive estimate should be skipped."""
    cluster = {
        'is_ratio': True,
        'studies': [
            {'effect_estimate': -0.5, 'variance': 0.1},  # Invalid for ratio
            {'effect_estimate': 0.80, 'lower_ci': 0.60, 'upper_ci': 1.05},
        ],
    }
    result = pool_cluster(cluster)
    assert result['pooled_effect'] is not None
    # Only the second study should be pooled (k=1)


def test_pool_cluster_empty_studies():
    """Cluster with no studies should set pooled fields to None."""
    cluster = {
        'is_ratio': False,
        'studies': [],
    }
    result = pool_cluster(cluster)
    assert result['pooled_effect'] is None
    assert result['tau2'] is None


def test_pool_cluster_with_explicit_variance():
    """Studies with explicit 'variance' field should use it directly."""
    cluster = {
        'is_ratio': False,
        'studies': [
            {'effect_estimate': 10.0, 'variance': 1.0},
            {'effect_estimate': 12.0, 'variance': 1.5},
            {'effect_estimate': 11.0, 'variance': 2.0},
        ],
    }
    result = pool_cluster(cluster)

    # Verify against direct pool_dl call
    dl = pool_dl([10.0, 12.0, 11.0], [1.0, 1.5, 2.0])
    assert _approx(result['pooled_effect'], dl['theta'])
    assert _approx(result['pooled_se'], dl['se'])
    assert _approx(result['pooled_ci_lo'], dl['ci_lo'])
    assert _approx(result['pooled_ci_hi'], dl['ci_hi'])


# ---------------------------------------------------------------------------
# 6) Homogeneous studies -- tau2 should be 0
# ---------------------------------------------------------------------------

def test_dl_homogeneous():
    """Identical effects with same variance: tau2 should be 0, I2 should be 0."""
    y = [1.0, 1.0, 1.0, 1.0]
    v = [0.1, 0.1, 0.1, 0.1]

    result = pool_dl(y, v)

    assert result is not None
    assert result['k'] == 4
    assert result['tau2'] == 0.0
    assert result['I2'] == 0.0
    assert result['Q'] == 0.0
    assert _approx(result['theta'], 1.0)


# ---------------------------------------------------------------------------
# 7) Two-study case -- verify I2 formula
# ---------------------------------------------------------------------------

def test_dl_two_studies():
    """Two studies: k=2, df=1."""
    y = [0.5, 1.5]
    v = [0.2, 0.3]

    result = pool_dl(y, v)

    assert result is not None
    assert result['k'] == 2

    # Manual verification
    w1, w2 = 1.0 / 0.2, 1.0 / 0.3
    sum_w = w1 + w2
    mu_fe = (w1 * 0.5 + w2 * 1.5) / sum_w
    Q = w1 * (0.5 - mu_fe) ** 2 + w2 * (1.5 - mu_fe) ** 2
    C = sum_w - (w1 ** 2 + w2 ** 2) / sum_w
    tau2 = max(0.0, (Q - 1) / C)
    I2 = max(0.0, (Q - 1) / Q * 100.0) if Q > 0 else 0.0

    assert _approx(result['Q'], Q)
    assert _approx(result['tau2'], tau2)
    assert _approx(result['I2'], I2)
