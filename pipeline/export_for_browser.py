"""
NUR (Light) -- Export Pipeline for Browser Visualization
Packages clustered evidence data for the Ayat Universe visualization.
"Allah is the Light of the heavens and the earth" -- Quran 24:35
"""
from __future__ import annotations

import datetime
import hashlib
import json
import os
from typing import Any

from auto_cluster import build_clusters, get_poolable_clusters, summarize_clusters

# shahid_validate is a future module -- import gracefully
try:
    from shahid_validate import load_pairwise70, validate_clusters
    _HAS_SHAHID = True
except ImportError:
    _HAS_SHAHID = False

# pool_dl for Python-side DL meta-analysis
try:
    from pool_dl import pool_cluster
    _HAS_POOL = True
except ImportError:
    _HAS_POOL = False


PIPELINE_VERSION = '1.0.0'


# ---------------------------------------------------------------------------
# 1) compute_isnad -- provenance chain
# ---------------------------------------------------------------------------

def compute_isnad(data: Any, source: str = 'CT.gov API v2') -> dict[str, str]:
    """Create a provenance chain dict for traceability.

    Parameters
    ----------
    data : any JSON-serializable object
        The data to hash for content integrity.
    source : str
        Data source identifier.

    Returns
    -------
    dict
        Provenance chain with source, harvest_date, content_hash, pipeline_version.
    """
    raw = json.dumps(data, sort_keys=True)
    content_hash = hashlib.sha256(raw.encode('utf-8')).hexdigest()
    return {
        'source': source,
        'harvest_date': datetime.date.today().isoformat(),
        'content_hash': content_hash,
        'pipeline_version': PIPELINE_VERSION,
    }


# ---------------------------------------------------------------------------
# 2) build_browser_json -- assemble final structure
# ---------------------------------------------------------------------------

def build_browser_json(clusters: dict[str, dict], harvest_meta: dict | None = None) -> dict:
    """Build the final JSON structure for browser consumption.

    Parameters
    ----------
    clusters : dict
        Mapping of cluster_key -> cluster_dict (from build_clusters or
        with validation/furqan annotations already applied).
    harvest_meta : dict or None
        Optional metadata from the harvest step (e.g., harvest_date).

    Returns
    -------
    dict
        Complete browser-ready JSON structure with clusters, summaries,
        and provenance.
    """
    today_iso = datetime.date.today().isoformat()
    harvest_date = today_iso
    if harvest_meta is not None and 'harvest_date' in harvest_meta:
        harvest_date = harvest_meta['harvest_date']

    # Collect unique NCT IDs and total effects across all clusters
    all_nct_ids = set()
    total_effects = 0
    poolable_count = 0

    cluster_list = []
    by_subcategory = {}
    by_furqan = {}
    by_outcome_category = {}

    for cluster_key, cluster in clusters.items():
        k = cluster.get('k', 0)
        total_effects += k
        if k >= 2:
            poolable_count += 1

        # Collect unique NCT IDs
        for study in cluster.get('studies', []):
            nct_id = study.get('nct_id')
            if nct_id:
                all_nct_ids.add(nct_id)

        # Build cluster entry for output
        cluster_entry = {
            'id': cluster.get('id', cluster_key),
            'subcategory': cluster.get('subcategory', ''),
            'drug_class': cluster.get('drug_class', ''),
            'outcome': cluster.get('outcome_normalized', ''),
            'outcome_category': cluster.get('outcome_category', 'other'),
            'effect_type': cluster.get('effect_type', ''),
            'is_ratio': cluster.get('is_ratio', False),
            'k': k,
            'total_enrollment': cluster.get('total_enrollment', 0),
            'studies': cluster.get('studies', []),
            'phase_distribution': cluster.get('phase_distribution', {}),
            'year_range': cluster.get('year_range', [None, None]),
            'interventions': cluster.get('interventions', []),
        }

        # Pooled results from DL meta-analysis (if present)
        if cluster.get('pooled_effect') is not None:
            cluster_entry['pooled'] = {
                'effect': cluster['pooled_effect'],
                'ci_lo': cluster.get('pooled_ci_lo'),
                'ci_hi': cluster.get('pooled_ci_hi'),
                'se': cluster.get('pooled_se'),
                'tau2': cluster.get('tau2'),
                'I2': cluster.get('I2'),
                'Q': cluster.get('Q'),
            }

        # Shahid validation results (if present)
        if 'shahid' in cluster:
            cluster_entry['shahid'] = cluster['shahid']

        # Furqan classification
        furqan = cluster.get('furqan', 'novel')
        cluster_entry['furqan'] = furqan

        # Per-cluster isnad (provenance for this specific cluster)
        cluster_entry['isnad'] = compute_isnad(cluster_entry)

        cluster_list.append(cluster_entry)

        # Summaries
        subcat = cluster_entry['subcategory']
        by_subcategory[subcat] = by_subcategory.get(subcat, 0) + 1

        by_furqan[furqan] = by_furqan.get(furqan, 0) + 1

        oc = cluster_entry['outcome_category']
        by_outcome_category[oc] = by_outcome_category.get(oc, 0) + 1

    # Overall provenance
    overall_isnad = compute_isnad({
        'total_clusters': len(clusters),
        'total_trials': len(all_nct_ids),
        'harvest_date': harvest_date,
    })

    return {
        'al_burhan_version': PIPELINE_VERSION,
        'harvest_date': harvest_date,
        'total_trials': len(all_nct_ids),
        'total_effects': total_effects,
        'total_clusters': len(clusters),
        'poolable_clusters': poolable_count,
        'clusters': cluster_list,
        'summary': {
            'by_subcategory': by_subcategory,
            'by_furqan': by_furqan,
            'by_outcome_category': by_outcome_category,
        },
        'isnad': overall_isnad,
    }


# ---------------------------------------------------------------------------
# 3) export_json -- write to file
# ---------------------------------------------------------------------------

def export_json(browser_data: dict, output_path: str) -> None:
    """Write the browser JSON to a file with UTF-8 encoding.

    Parameters
    ----------
    browser_data : dict
        The complete browser-ready JSON structure.
    output_path : str
        File path to write.
    """
    # Ensure parent directory exists
    parent = os.path.dirname(output_path)
    if parent and not os.path.exists(parent):
        os.makedirs(parent, exist_ok=True)

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(browser_data, f, indent=2, ensure_ascii=False)


# ---------------------------------------------------------------------------
# 4) run_full_pipeline -- end-to-end orchestrator
# ---------------------------------------------------------------------------

def run_full_pipeline(
    harvest_json_path: str,
    pairwise_csv_path: str,
    output_path: str,
    ghost_csv_path: str | None = None,
) -> dict:
    """End-to-end pipeline: harvest -> cluster -> validate -> export.

    Parameters
    ----------
    harvest_json_path : str
        Path to JSON file containing harvested effects (list of effect dicts).
    pairwise_csv_path : str
        Path to Pairwise70 CSV for validation.
    output_path : str
        Path for the output browser JSON.
    ghost_csv_path : str or None
        Reserved for future ghost trials integration (currently unused).

    Returns
    -------
    dict
        The exported browser JSON data.
    """
    # 1) Load harvested effects
    with open(harvest_json_path, 'r', encoding='utf-8') as f:
        harvest_data = json.load(f)

    # Support both a bare list and a dict with 'effects' key
    if isinstance(harvest_data, list):
        effects = harvest_data
        harvest_meta = None
    elif isinstance(harvest_data, dict):
        effects = harvest_data.get('effects', [])
        harvest_meta = harvest_data.get('meta', None)
    else:
        raise ValueError(f"Unexpected harvest data format: {type(harvest_data)}")

    # 2) Build clusters
    clusters = build_clusters(effects)

    # 2.5) Pool each cluster using DerSimonian-Laird (enables SHAHID comparison)
    pooled_count = 0
    if _HAS_POOL:
        for key, cluster in clusters.items():
            if cluster.get('k', 0) >= 2:
                pool_cluster(cluster)
                if cluster.get('pooled_effect') is not None:
                    pooled_count += 1

    # 3) Validate against Pairwise70 (if shahid_validate is available)
    if _HAS_SHAHID and pairwise_csv_path and os.path.isfile(pairwise_csv_path):
        clusters = validate_clusters(clusters, pairwise_csv_path)

    # 4) Build browser JSON
    browser_data = build_browser_json(clusters, harvest_meta=harvest_meta)

    # 5) Export
    export_json(browser_data, output_path)

    return browser_data


# ---------------------------------------------------------------------------
# CLI entry point
# ---------------------------------------------------------------------------

if __name__ == '__main__':
    import argparse

    parser = argparse.ArgumentParser(description='Export pipeline for browser visualization')
    parser.add_argument('harvest_json', help='Path to harvested effects JSON')
    parser.add_argument('pairwise_csv', help='Path to Pairwise70 CSV')
    parser.add_argument('-o', '--output', default='browser_data.json', help='Output JSON path')
    parser.add_argument('--ghost-csv', default=None, help='Path to ghost trials CSV')
    args = parser.parse_args()

    result = run_full_pipeline(args.harvest_json, args.pairwise_csv, args.output, args.ghost_csv)
    print(f"Exported {result['total_clusters']} clusters "
          f"({result['poolable_clusters']} poolable) -> {args.output}")
