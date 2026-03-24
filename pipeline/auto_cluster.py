"""
FURQAN (The Criterion) -- Auto-Clustering Engine
Groups trial effects into poolable clusters by drug class, outcome, and effect type.
"Blessed is He who sent down the Criterion upon His Servant" -- Quran 25:1
"""
from __future__ import annotations

import re

from drug_normalize import classify_drug
from outcome_normalize import normalize_outcome, get_outcome_category


# ---------------------------------------------------------------------------
# 1) build_clusters
# ---------------------------------------------------------------------------

def _extract_year(start_date: str | None) -> int | None:
    """Extract a 4-digit year from a start_date string like '2017-02' or '2017'."""
    if not start_date or not isinstance(start_date, str):
        return None
    match = re.search(r'(\d{4})', start_date)
    if match:
        return int(match.group(1))
    return None


def build_clusters(effects: list[dict]) -> dict[str, dict]:
    """Group a list of effect dicts into poolable clusters.

    For each effect:
    - Classify the drug intervention -> (atc_code, drug_class, subcategory)
    - Normalize the outcome title -> standardized name
    - Categorize the outcome -> hard/surrogate/safety/other
    - Build a cluster key: {subcategory}|{drug_class}|{outcome_normalized}|{effect_type}
    - Skip effects where the drug is unrecognized (classify_drug returns None)

    Deduplicates by NCT ID within each cluster (keeps first occurrence).

    Parameters
    ----------
    effects : list of dict
        Effect dicts as produced by extract_trial_effects or hand-crafted
        with the same schema (nct_id, intervention, outcome_title, effect_type,
        effect_estimate, lower_ci, upper_ci, ci_level, is_ratio, enrollment,
        phase, title/brief_title, start_date, conditions).

    Returns
    -------
    dict
        Mapping of cluster_key -> cluster_dict.
    """
    clusters = {}

    for effect in effects:
        # --- Classify drug ---
        intervention = effect.get("intervention", "")
        drug_result = classify_drug(intervention)
        if drug_result is None:
            continue
        atc_code, drug_class, subcategory = drug_result

        # --- Normalize outcome ---
        outcome_title = effect.get("outcome_title", "")
        outcome_normalized = normalize_outcome(outcome_title)
        outcome_category = get_outcome_category(outcome_normalized)

        # --- Effect type ---
        effect_type = effect.get("effect_type", "")
        is_ratio = effect.get("is_ratio", False)

        # --- Build cluster key ---
        cluster_key = f"{subcategory}|{drug_class}|{outcome_normalized}|{effect_type}"

        # --- Initialize cluster if new ---
        if cluster_key not in clusters:
            clusters[cluster_key] = {
                "id": cluster_key,
                "subcategory": subcategory,
                "drug_class": drug_class,
                "outcome_normalized": outcome_normalized,
                "outcome_category": outcome_category,
                "effect_type": effect_type,
                "is_ratio": is_ratio,
                "k": 0,
                "total_enrollment": 0,
                "studies": [],
                "phase_distribution": {1: 0, 2: 0, 3: 0, 4: 0},
                "year_range": [None, None],
                "interventions": [],
                "_seen_nct_ids": set(),
            }

        cluster = clusters[cluster_key]

        # --- Deduplicate by NCT ID ---
        nct_id = effect.get("nct_id", "")
        if nct_id in cluster["_seen_nct_ids"]:
            continue
        cluster["_seen_nct_ids"].add(nct_id)

        # --- Build study entry ---
        # Accept both 'title' and 'brief_title' for flexibility
        title = effect.get("title", effect.get("brief_title", ""))

        enrollment = effect.get("enrollment")
        if enrollment is not None:
            try:
                enrollment = int(enrollment)
            except (ValueError, TypeError):
                enrollment = None

        phase = effect.get("phase")
        if phase is not None:
            try:
                phase = int(phase)
            except (ValueError, TypeError):
                phase = None

        study_entry = {
            "nct_id": nct_id,
            "effect_estimate": effect.get("effect_estimate"),
            "lower_ci": effect.get("lower_ci"),
            "upper_ci": effect.get("upper_ci"),
            "ci_level": effect.get("ci_level", 0.95),
            "enrollment": enrollment,
            "phase": phase,
            "title": title,
            "start_date": effect.get("start_date", ""),
        }
        cluster["studies"].append(study_entry)
        cluster["k"] += 1

        # --- Update total enrollment ---
        if enrollment is not None:
            cluster["total_enrollment"] += enrollment

        # --- Update phase distribution ---
        if phase is not None and phase in cluster["phase_distribution"]:
            cluster["phase_distribution"][phase] += 1

        # --- Update year range ---
        year = _extract_year(effect.get("start_date", ""))
        if year is not None:
            min_year, max_year = cluster["year_range"]
            if min_year is None or year < min_year:
                cluster["year_range"][0] = year
            if max_year is None or year > max_year:
                cluster["year_range"][1] = year

        # --- Update interventions list (unique drug names) ---
        drug_name = intervention.strip()
        if drug_name and drug_name not in cluster["interventions"]:
            cluster["interventions"].append(drug_name)

    # --- Clean up internal tracking sets ---
    for cluster in clusters.values():
        del cluster["_seen_nct_ids"]

    return clusters


# ---------------------------------------------------------------------------
# 2) get_poolable_clusters
# ---------------------------------------------------------------------------

def get_poolable_clusters(effects: list[dict], min_k: int = 2) -> dict[str, dict]:
    """Build clusters and filter to those with k >= min_k.

    Parameters
    ----------
    effects : list of dict
        Effect dicts (same format as build_clusters input).
    min_k : int
        Minimum number of unique trials required for a cluster to be
        considered poolable. Default: 2.

    Returns
    -------
    dict
        Mapping of cluster_key -> cluster_dict for poolable clusters only.
    """
    all_clusters = build_clusters(effects)
    return {
        key: cluster
        for key, cluster in all_clusters.items()
        if cluster["k"] >= min_k
    }


# ---------------------------------------------------------------------------
# 3) summarize_clusters
# ---------------------------------------------------------------------------

def summarize_clusters(clusters: dict[str, dict]) -> dict:
    """Produce a summary dict describing a set of clusters.

    Parameters
    ----------
    clusters : dict
        Mapping of cluster_key -> cluster_dict (from build_clusters or
        get_poolable_clusters).

    Returns
    -------
    dict
        Summary with total counts, breakdowns by subcategory/drug_class/
        outcome_category/effect_type, and the top 10 largest clusters.
    """
    by_subcategory = {}
    by_drug_class = {}
    by_outcome_category = {}
    by_effect_type = {}
    total_studies = 0
    total_enrollment = 0
    poolable_count = 0

    cluster_list = []

    for key, cluster in clusters.items():
        k = cluster["k"]
        total_studies += k
        total_enrollment += cluster.get("total_enrollment", 0)

        if k >= 2:
            poolable_count += 1

        subcat = cluster.get("subcategory", "unknown")
        by_subcategory[subcat] = by_subcategory.get(subcat, 0) + 1

        dc = cluster.get("drug_class", "unknown")
        by_drug_class[dc] = by_drug_class.get(dc, 0) + 1

        oc = cluster.get("outcome_category", "other")
        by_outcome_category[oc] = by_outcome_category.get(oc, 0) + 1

        et = cluster.get("effect_type", "unknown")
        by_effect_type[et] = by_effect_type.get(et, 0) + 1

        cluster_list.append(cluster)

    # Sort by k descending to get largest clusters
    cluster_list.sort(key=lambda c: c["k"], reverse=True)
    largest_clusters = cluster_list[:10]

    return {
        "total_clusters": len(clusters),
        "poolable_clusters": poolable_count,
        "total_studies": total_studies,
        "total_enrollment": total_enrollment,
        "by_subcategory": by_subcategory,
        "by_drug_class": by_drug_class,
        "by_outcome_category": by_outcome_category,
        "by_effect_type": by_effect_type,
        "largest_clusters": largest_clusters,
    }
