"""
SHAHID (The Witness) -- Published MA Validation Oracle
Compares auto-pooled results against published meta-analyses.
"And thus We have made you a just community that you will be witnesses" -- Quran 2:143
"""
from __future__ import annotations

import csv
import math
import re


# ---------------------------------------------------------------------------
# 1) Load Pairwise70
# ---------------------------------------------------------------------------

def load_pairwise70(csv_path: str) -> list[dict]:
    """Load the Pairwise70 CSV file of published MA results.

    The CSV has columns: review_id, analysis_number, analysis_name, doi, k,
    effect_type, theta, sigma, tau, R, tau_estimator, R_status.

    theta is on LOG SCALE for ratio measures (logRR, logOR).
    For GIV/MD/SMD it is on the raw scale.

    Parameters
    ----------
    csv_path : str
        Path to the Pairwise70 CSV file.

    Returns
    -------
    list of dict
        One dict per row with typed values (k as int, theta/sigma/tau/R as float).
    """
    rows = []
    with open(csv_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            entry = {}
            entry["review_id"] = row.get("review_id", "").strip()
            entry["analysis_number"] = row.get("analysis_number", "").strip()
            entry["analysis_name"] = row.get("analysis_name", "").strip()
            entry["doi"] = row.get("doi", "").strip()

            # k as int
            k_raw = row.get("k", "").strip()
            try:
                entry["k"] = int(k_raw)
            except (ValueError, TypeError):
                entry["k"] = None

            entry["effect_type"] = row.get("effect_type", "").strip()

            # Numeric fields: theta, sigma, tau, R
            for field in ("theta", "sigma", "tau", "R"):
                raw = row.get(field, "").strip()
                try:
                    val = float(raw)
                    entry[field] = val if math.isfinite(val) else None
                except (ValueError, TypeError):
                    entry[field] = None

            entry["tau_estimator"] = row.get("tau_estimator", "").strip()
            entry["R_status"] = row.get("R_status", "").strip()

            rows.append(entry)

    return rows


# ---------------------------------------------------------------------------
# 2) Effect type compatibility
# ---------------------------------------------------------------------------

# Mapping from our cluster effect types to compatible Pairwise70 effect types
_COMPAT_MAP = {
    "HR":  {"logRR", "GIV"},
    "RR":  {"logRR", "GIV"},
    "OR":  {"logOR", "GIV"},
    "MD":  {"MD", "GIV"},
    "SMD": {"SMD", "GIV"},
    "GIV": {"logRR", "logOR", "MD", "SMD", "GIV"},
}


def _effect_type_compatible(our_type: str, pw_type: str) -> bool:
    """Check if our cluster's effect type is compatible with a Pairwise70 entry.

    Parameters
    ----------
    our_type : str
        Effect type from the cluster (HR, RR, OR, MD, SMD, GIV).
    pw_type : str
        Effect type from Pairwise70 (logRR, logOR, MD, SMD, GIV).

    Returns
    -------
    bool
        True if compatible, False otherwise.
    """
    if not our_type or not pw_type:
        return False
    our_upper = our_type.strip().upper()
    pw_upper = pw_type.strip().upper()

    # Normalize: Pairwise70 uses logRR/logOR with mixed case
    pw_normalized = pw_type.strip()
    compatible_set = _COMPAT_MAP.get(our_upper)
    if compatible_set is None:
        # Unknown type -- only match if GIV on the pw side
        return pw_normalized == "GIV"

    return pw_normalized in compatible_set


# ---------------------------------------------------------------------------
# 3) Fuzzy matching: cluster -> Pairwise70 entries
# ---------------------------------------------------------------------------

# Synonym expansion map: abbreviation/short form -> set of alternative tokens
# When any key token set is found in the input, all associated expansions are
# added so that Jaccard/containment can bridge vocabulary gaps.
_SYNONYM_MAP = [
    # Myocardial infarction
    ({"mi"}, {"myocardial", "infarction"}),
    ({"myocardial", "infarction"}, {"mi"}),
    # Cardiovascular death / mortality
    ({"cv", "death"}, {"cardiovascular", "death"}),
    ({"cv", "mortality"}, {"cardiovascular", "mortality"}),
    ({"cardiovascular", "death"}, {"cv", "death"}),
    ({"cardiovascular", "mortality"}, {"cv", "mortality"}),
    # Heart failure hospitalization (American / British spelling)
    ({"hf", "hosp"}, {"heart", "failure", "hospitalization", "hospitalisation"}),
    ({"heart", "failure", "hospitalization"}, {"hf", "hosp", "hospitalisation"}),
    ({"heart", "failure", "hospitalisation"}, {"hf", "hosp", "hospitalization"}),
    ({"hospitalization"}, {"hospitalisation"}),
    ({"hospitalisation"}, {"hospitalization"}),
    # MACE
    ({"mace"}, {"major", "adverse", "cardiovascular", "3", "point", "4"}),
    ({"major", "adverse", "cardiovascular"}, {"mace"}),
    # Bleeding / haemorrhage / hemorrhage
    ({"bleeding"}, {"haemorrhage", "hemorrhage"}),
    ({"haemorrhage"}, {"bleeding", "hemorrhage"}),
    ({"hemorrhage"}, {"bleeding", "haemorrhage"}),
    # Blood pressure abbreviations
    ({"sbp"}, {"systolic", "blood", "pressure"}),
    ({"systolic", "blood", "pressure"}, {"sbp"}),
    ({"dbp"}, {"diastolic", "blood", "pressure"}),
    ({"diastolic", "blood", "pressure"}, {"dbp"}),
    # LDL cholesterol
    ({"ldl"}, {"low", "density", "lipoprotein", "cholesterol"}),
    ({"ldl", "c"}, {"low", "density", "lipoprotein", "ldl", "cholesterol"}),
    ({"low", "density", "lipoprotein"}, {"ldl", "cholesterol"}),
    ({"ldl", "cholesterol"}, {"ldl", "c", "low", "density", "lipoprotein"}),
]


def _expand_synonyms(tokens: set[str]) -> set[str]:
    """Expand a token set with synonyms from _SYNONYM_MAP.

    For each synonym rule, if all trigger tokens are present in *tokens*,
    the expansion tokens are added.  Runs a single pass (no chaining).

    Parameters
    ----------
    tokens : set
        Original lowercase word tokens.

    Returns
    -------
    set
        Expanded token set (superset of input).
    """
    expanded = set(tokens)
    for trigger, additions in _SYNONYM_MAP:
        if trigger <= tokens:  # trigger is a subset of tokens
            expanded |= additions
    return expanded


def _tokenize(text: str | None) -> set[str]:
    """Split text into lowercase word tokens, stripping punctuation,
    then expand with synonym alternatives."""
    if not text or not isinstance(text, str):
        return set()
    raw_tokens = set(re.findall(r"[a-z0-9]+", text.lower()))
    return _expand_synonyms(raw_tokens)


def _jaccard(set_a: set[str], set_b: set[str]) -> float:
    """Jaccard similarity between two sets."""
    if not set_a or not set_b:
        return 0.0
    intersection = len(set_a & set_b)
    union = len(set_a | set_b)
    if union == 0:
        return 0.0
    return intersection / union


def _containment(smaller: set[str], larger: set[str]) -> float:
    """Containment score: fraction of *smaller* tokens found in *larger*.

    This captures the signal that a short outcome name like "Mortality" is
    fully contained in a longer Pairwise70 name like "28-day all-cause
    mortality".

    Parameters
    ----------
    smaller : set
        Token set of the shorter text.
    larger : set
        Token set of the longer text.

    Returns
    -------
    float
        Value in [0, 1].  Returns 0.0 if *smaller* is empty.
    """
    if not smaller:
        return 0.0
    return len(smaller & larger) / len(smaller)


def match_to_pairwise(cluster: dict, pairwise_data: list[dict]) -> list[dict]:
    """Fuzzy-match an auto-pooled cluster against Pairwise70 entries.

    Matching strategy (score-based, return top matches above threshold):
    - Outcome name similarity: weighted combination of Jaccard similarity
      and containment score (fraction of our tokens found in the PW name).
      ``score = 0.5 * jaccard + 0.5 * containment``
      This ensures short normalized names (e.g. "Mortality") that are fully
      contained in longer Pairwise70 names (e.g. "28-day all-cause mortality")
      receive a reasonable match score.
    - Synonym expansion: common abbreviations/spellings are expanded before
      token comparison (handled inside ``_tokenize``).
    - Effect type compatibility: logRR maps to HR/RR, logOR maps to OR,
      MD stays MD, SMD stays SMD, GIV is wild (matches anything).
    - A match score > 0.2 is considered a candidate.

    Parameters
    ----------
    cluster : dict
        Auto-pooled cluster dict with keys: outcome_normalized, effect_type.
    pairwise_data : list of dict
        Loaded Pairwise70 entries.

    Returns
    -------
    list of dict
        Each dict has keys from the pairwise entry plus 'match_score'.
        Sorted by match_score descending.
    """
    our_outcome = cluster.get("outcome_normalized", "")
    our_type = cluster.get("effect_type", "")
    our_tokens = _tokenize(our_outcome)

    matches = []

    for pw_entry in pairwise_data:
        pw_name = pw_entry.get("analysis_name", "")
        pw_type = pw_entry.get("effect_type", "")

        # Effect type compatibility check
        if not _effect_type_compatible(our_type, pw_type):
            continue

        # Outcome name similarity: Jaccard + containment
        pw_tokens = _tokenize(pw_name)
        jaccard = _jaccard(our_tokens, pw_tokens)
        contain = _containment(our_tokens, pw_tokens)

        # Weighted composite score
        score = 0.5 * jaccard + 0.5 * contain

        if score > 0.2:
            result = dict(pw_entry)
            result["match_score"] = round(score, 4)
            matches.append(result)

    # Sort by score descending
    matches.sort(key=lambda m: m["match_score"], reverse=True)

    return matches


# ---------------------------------------------------------------------------
# 4) Agreement classification
# ---------------------------------------------------------------------------

def classify_agreement(
    our_effect: float,
    our_ci_lo: float,
    our_ci_hi: float,
    pw_theta: float,
    pw_sigma: float,
) -> str:
    """Classify agreement between our pooled estimate and a published MA.

    For ratio measures, compare on LOG scale (caller must log-transform
    our_effect if needed).

    Rules:
    - confirmed: Same direction AND our CI overlaps with published CI
      (pw_theta +/- 1.96*pw_sigma).
    - updated: Same direction BUT significant shift (our estimate outside
      published CI OR published estimate outside our CI).
    - contradicted: Opposite directions (one positive, one negative
      relative to null=0 for log scale).

    Parameters
    ----------
    our_effect : float
        Our pooled estimate (log scale for ratios).
    our_ci_lo : float
        Lower bound of our CI.
    our_ci_hi : float
        Upper bound of our CI.
    pw_theta : float
        Published MA point estimate (log scale for ratios).
    pw_sigma : float
        Published MA standard error.

    Returns
    -------
    str
        'confirmed', 'updated', or 'contradicted'.
    """
    # Null is 0 on log scale (or for MD/SMD)
    # Direction: negative = benefit for most CV outcomes, but we just check
    # whether both are on the same side of zero.
    our_dir = 1 if our_effect >= 0 else -1
    pw_dir = 1 if pw_theta >= 0 else -1

    if our_dir != pw_dir:
        return "contradicted"

    # Published CI
    pw_ci_lo = pw_theta - 1.96 * pw_sigma
    pw_ci_hi = pw_theta + 1.96 * pw_sigma

    # Check if our estimate is inside published CI
    our_in_pw = (pw_ci_lo <= our_effect <= pw_ci_hi)

    # Check if published estimate is inside our CI
    pw_in_ours = (our_ci_lo <= pw_theta <= our_ci_hi)

    if our_in_pw or pw_in_ours:
        return "confirmed"
    else:
        return "updated"


# ---------------------------------------------------------------------------
# 5) Discovery classification
# ---------------------------------------------------------------------------

def classify_discovery(has_match: bool, has_ghost: bool = False) -> str:
    """Classify a cluster's discovery type.

    Parameters
    ----------
    has_match : bool
        True if the cluster matched a Pairwise70 entry.
    has_ghost : bool
        True if the cluster has ghost-trial evidence (registry but no results).

    Returns
    -------
    str
        'ghost' if no match but ghost evidence,
        'novel' if no match and no ghost evidence.
        If has_match is True, return value is not used (agreement classification
        is handled by classify_agreement).
    """
    if has_match:
        # Caller should use classify_agreement instead
        return "matched"
    if has_ghost:
        return "ghost"
    return "novel"


# ---------------------------------------------------------------------------
# 6) Main entry point: validate_clusters
# ---------------------------------------------------------------------------

def validate_clusters(
    clusters: dict[str, dict],
    pairwise_path: str,
    ghost_data: dict[str, bool] | None = None,
) -> dict[str, dict]:
    """Validate auto-pooled clusters against Pairwise70 published MA data.

    For each cluster:
    - Try to match against Pairwise70.
    - If matched: classify agreement (confirmed/updated/contradicted).
    - If not matched: classify as novel or ghost.
    - Enriches each cluster with 'shahid' and 'furqan' fields.

    Parameters
    ----------
    clusters : dict
        Mapping of cluster_key -> cluster_dict (from build_clusters or
        get_poolable_clusters).
    pairwise_path : str
        Path to the Pairwise70 CSV file.
    ghost_data : dict or None
        Optional mapping of cluster_key -> bool indicating ghost-trial evidence.

    Returns
    -------
    dict
        The same clusters dict, enriched with:
        - 'shahid': dict with 'status', 'match_score', 'pw_entry', 'agreement'
        - 'furqan': str classification ('confirmed', 'updated', 'contradicted',
          'novel', 'ghost')
    """
    pairwise_data = load_pairwise70(pairwise_path)
    if ghost_data is None:
        ghost_data = {}

    for key, cluster in clusters.items():
        matches = match_to_pairwise(cluster, pairwise_data)

        if matches:
            top_match = matches[0]
            pw_theta = top_match.get("theta")
            pw_sigma = top_match.get("sigma")

            # Get our pooled estimate -- look for pre-computed pooled results
            our_effect = cluster.get("pooled_effect")
            our_ci_lo = cluster.get("pooled_ci_lo")
            our_ci_hi = cluster.get("pooled_ci_hi")

            # For ratio measures, convert to log scale if needed
            is_ratio = cluster.get("is_ratio", False)
            if is_ratio and our_effect is not None and our_effect > 0:
                our_effect = math.log(our_effect)
                if our_ci_lo is not None and our_ci_lo > 0:
                    our_ci_lo = math.log(our_ci_lo)
                if our_ci_hi is not None and our_ci_hi > 0:
                    our_ci_hi = math.log(our_ci_hi)

            # Classify agreement if we have the necessary data
            if (our_effect is not None and our_ci_lo is not None and
                    our_ci_hi is not None and pw_theta is not None and
                    pw_sigma is not None):
                agreement = classify_agreement(
                    our_effect, our_ci_lo, our_ci_hi,
                    pw_theta, pw_sigma,
                )
            else:
                agreement = "unverifiable"

            cluster["shahid"] = {
                "status": "matched",
                "match_score": top_match.get("match_score", 0),
                "pw_entry": {
                    "review_id": top_match.get("review_id", ""),
                    "analysis_name": top_match.get("analysis_name", ""),
                    "theta": pw_theta,
                    "sigma": pw_sigma,
                    "k": top_match.get("k"),
                    "effect_type": top_match.get("effect_type", ""),
                },
                "agreement": agreement,
                "n_candidates": len(matches),
            }
            cluster["furqan"] = agreement

        else:
            has_ghost = ghost_data.get(key, False)
            discovery = classify_discovery(has_match=False, has_ghost=has_ghost)

            cluster["shahid"] = {
                "status": "unmatched",
                "match_score": 0,
                "pw_entry": None,
                "agreement": None,
                "n_candidates": 0,
            }
            cluster["furqan"] = discovery

    return clusters
