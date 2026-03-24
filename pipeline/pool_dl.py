"""
AL-JAM' (The Gatherer) -- DerSimonian-Laird Random-Effects Meta-Analysis
Pools individual study effects into a single summary estimate with heterogeneity.
"He is Allah, the Creator, the Originator, the Fashioner" -- Quran 59:24
"""
from __future__ import annotations

import logging
import math
from statistics import NormalDist

_log = logging.getLogger(__name__)
_normal = NormalDist()


def _z_crit(ci_level: float) -> float:
    """Return the two-tailed z critical value for a given CI level.

    For ci_level=0.95, returns ~1.95996 (the exact normal quantile).
    """
    return _normal.inv_cdf((1.0 + ci_level) / 2.0)


# ---------------------------------------------------------------------------
# 1) pool_dl -- core DerSimonian-Laird estimator
# ---------------------------------------------------------------------------

def pool_dl(
    effects: list[float] | None,
    variances: list[float] | None,
    ci_level: float = 0.95,
) -> dict[str, float | int] | None:
    """DerSimonian-Laird random-effects meta-analysis.

    Parameters
    ----------
    effects : list of float
        Individual study effect estimates (log scale for ratios).
    variances : list of float
        Individual study variances.
    ci_level : float
        Confidence interval level (default 0.95 for 95% CI).

    Returns
    -------
    dict with keys:
        theta: pooled estimate
        se: standard error of pooled estimate
        ci_lo: CI lower bound
        ci_hi: CI upper bound
        tau2: between-study variance
        I2: I-squared heterogeneity (0-100)
        k: number of studies
        Q: Cochran's Q statistic
    Returns None if k < 1 or all variances are zero/invalid.
    """
    if not effects or not variances:
        return None
    if len(effects) != len(variances):
        return None

    # Filter out studies with non-positive variance
    valid: list[tuple[float, float]] = [
        (y, v) for y, v in zip(effects, variances)
        if v is not None and math.isfinite(v) and v > 0
        and y is not None and math.isfinite(y)
    ]

    k = len(valid)
    if k < 1:
        return None

    ys: list[float] = [pair[0] for pair in valid]
    vs: list[float] = [pair[1] for pair in valid]

    z_crit = _z_crit(ci_level)

    # --- k=1: return the single study directly ---
    if k == 1:
        se = math.sqrt(vs[0])
        return {
            'theta': ys[0],
            'se': se,
            'ci_lo': ys[0] - z_crit * se,
            'ci_hi': ys[0] + z_crit * se,
            'tau2': 0.0,
            'I2': 0.0,
            'k': 1,
            'Q': 0.0,
        }

    # --- Fixed-effect weights: wi = 1/vi ---
    ws: list[float] = [1.0 / v for v in vs]
    sum_w: float = sum(ws)

    # --- Fixed-effect pooled estimate ---
    mu_fe: float = sum(w * y for w, y in zip(ws, ys)) / sum_w

    # --- Cochran's Q ---
    Q: float = sum(w * (y - mu_fe) ** 2 for w, y in zip(ws, ys))

    # --- Degrees of freedom ---
    df: int = k - 1

    # --- DL tau-squared ---
    # C = sum(wi) - sum(wi^2) / sum(wi)
    sum_w2: float = sum(w * w for w in ws)
    C: float = sum_w - sum_w2 / sum_w

    if C > 0:
        tau2: float = max(0.0, (Q - df) / C)
    else:
        tau2 = 0.0

    # --- Random-effects weights: wi_star = 1/(vi + tau2) ---
    ws_star: list[float] = [1.0 / (v + tau2) for v in vs]
    sum_w_star: float = sum(ws_star)

    # --- Random-effects pooled estimate ---
    theta: float = sum(w * y for w, y in zip(ws_star, ys)) / sum_w_star

    # --- Standard error ---
    se: float = math.sqrt(1.0 / sum_w_star)

    # --- CI ---
    ci_lo: float = theta - z_crit * se
    ci_hi: float = theta + z_crit * se

    # --- I-squared ---
    if Q > 0 and df > 0:
        I2: float = max(0.0, (Q - df) / Q * 100.0)
    else:
        I2 = 0.0

    return {
        'theta': theta,
        'se': se,
        'ci_lo': ci_lo,
        'ci_hi': ci_hi,
        'tau2': tau2,
        'I2': I2,
        'k': k,
        'Q': Q,
    }


# ---------------------------------------------------------------------------
# 2) pool_cluster -- pool a cluster dict using DL
# ---------------------------------------------------------------------------

def pool_cluster(cluster: dict) -> dict:
    """Pool a cluster of effects using DerSimonian-Laird.

    The cluster dict must have:
    - studies: list of dicts with 'effect_estimate' and either 'variance' or
      ('lower_ci', 'upper_ci') to compute variance from CI width.
    - is_ratio: bool -- if True, effects are log-transformed before pooling
      and back-transformed after.

    For ratio measures (HR, OR, RR), effects are transformed to log scale
    before pooling and back-transformed after.

    Variance from CI: if 'lower_ci' and 'upper_ci' are present but 'variance'
    is not, variance is computed using the z critical value corresponding to the
    study's ci_level (default 0.95):
        ratio:      ((log(upper_ci) - log(lower_ci)) / (2 * z_crit))^2
        difference: ((upper_ci - lower_ci) / (2 * z_crit))^2

    Parameters
    ----------
    cluster : dict
        A cluster dict as produced by auto_cluster.build_clusters, with at
        least 'studies' and 'is_ratio' keys.

    Returns
    -------
    dict
        The same cluster dict enriched with pooled_effect, pooled_ci_lo,
        pooled_ci_hi, pooled_se, tau2, I2, Q fields. If pooling fails,
        these fields are set to None.
    """
    studies: list[dict] = cluster.get('studies', [])
    is_ratio: bool = cluster.get('is_ratio', False)
    original_count: int = len(studies)

    effects: list[float] = []
    variances: list[float] = []

    for study in studies:
        est: float | None = study.get('effect_estimate')
        if est is None:
            continue

        # --- Get or compute variance ---
        var: float | None = study.get('variance')

        if var is None:
            # Try to derive from CI
            lo: float | None = study.get('lower_ci')
            hi: float | None = study.get('upper_ci')
            if lo is not None and hi is not None:
                # Use the study's ci_level to get the correct z_crit
                study_ci_level: float = study.get('ci_level', 0.95)
                z_ci: float = _z_crit(study_ci_level)
                try:
                    if is_ratio:
                        # Ratio measure: work on log scale
                        if lo > 0 and hi > 0:
                            log_lo: float = math.log(lo)
                            log_hi: float = math.log(hi)
                            se_log: float = (log_hi - log_lo) / (2.0 * z_ci)
                            var = se_log ** 2
                        else:
                            continue  # Cannot log non-positive CI bounds
                    else:
                        # Difference measure
                        se_diff: float = (hi - lo) / (2.0 * z_ci)
                        var = se_diff ** 2
                except (ValueError, ZeroDivisionError):
                    continue

        if var is None or not math.isfinite(var) or var <= 0:
            continue

        # --- Transform effect to log scale for ratio measures ---
        if is_ratio:
            if est <= 0:
                continue  # Cannot log non-positive effect estimate
            effect_val: float = math.log(est)
        else:
            effect_val = est

        effects.append(effect_val)
        variances.append(var)

    # Warn if significant study loss during filtering
    valid_count: int = len(effects)
    if original_count > 0 and valid_count < original_count:
        dropped: int = original_count - valid_count
        pct_dropped: float = 100.0 * dropped / original_count
        if pct_dropped > 50.0:
            _log.warning(
                "pool_cluster: %d/%d studies (%.0f%%) filtered out due to "
                "missing or invalid effect/variance data",
                dropped, original_count, pct_dropped,
            )

    # --- Pool ---
    result: dict | None = pool_dl(effects, variances)

    if result is None:
        cluster['pooled_effect'] = None
        cluster['pooled_ci_lo'] = None
        cluster['pooled_ci_hi'] = None
        cluster['pooled_se'] = None
        cluster['tau2'] = None
        cluster['I2'] = None
        cluster['Q'] = None
        return cluster

    # --- Back-transform for ratio measures ---
    if is_ratio:
        cluster['pooled_effect'] = math.exp(result['theta'])
        cluster['pooled_ci_lo'] = math.exp(result['ci_lo'])
        cluster['pooled_ci_hi'] = math.exp(result['ci_hi'])
        # SE on log scale (the natural scale for inference)
        cluster['pooled_se'] = result['se']
    else:
        cluster['pooled_effect'] = result['theta']
        cluster['pooled_ci_lo'] = result['ci_lo']
        cluster['pooled_ci_hi'] = result['ci_hi']
        cluster['pooled_se'] = result['se']

    cluster['tau2'] = result['tau2']
    cluster['I2'] = result['I2']
    cluster['Q'] = result['Q']

    return cluster
