"""
AL-BURHAN Pipeline Runner — End-to-end cardiovascular evidence harvest.

Usage:
    python pipeline/run_pipeline.py --quick       # Fast test run (3 pages/term)
    python pipeline/run_pipeline.py --full        # Full harvest (50 pages/term)
    python pipeline/run_pipeline.py --export-only # Re-export from existing harvest

Environment variables for external data paths:
    PAIRWISE70_PATH  -- Path to Pairwise70 CSV (default: data/pairwise70.csv
                        relative to project root)
    GHOST_PATH       -- Path to GWAM registry candidate summary CSV
                        (default: data/registry_candidate_summary.csv
                        relative to project root)
"""
from __future__ import annotations

import argparse
import io
import json
import os
import sys
import time

# Fix Windows cp1252 encoding for Unicode output
if sys.platform == 'win32' and hasattr(sys.stdout, 'buffer'):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# Ensure pipeline package is importable
sys.path.insert(0, os.path.dirname(__file__))

from harvest_ctgov_results import (
    fetch_cv_trials_with_results,
    extract_all_effects,
)
from drug_normalize import classify_drug
from outcome_normalize import normalize_outcome, get_outcome_category
from auto_cluster import build_clusters, get_poolable_clusters, summarize_clusters
from export_for_browser import run_full_pipeline


PIPELINE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(PIPELINE_DIR)
DATA_DIR = os.path.join(PROJECT_DIR, "data")
PAIRWISE70_PATH = os.environ.get(
    "PAIRWISE70_PATH",
    os.path.join(DATA_DIR, "pairwise70.csv"),
)
GHOST_PATH = os.environ.get(
    "GHOST_PATH",
    os.path.join(DATA_DIR, "registry_candidate_summary.csv"),
)


def print_section(title: str) -> None:
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}\n")


def run_harvest(max_pages: int = 50, page_size: int = 100) -> list[dict]:
    """Step 1: Harvest raw CV trials from CT.gov."""
    print_section("AL-KITAB: Harvesting CT.gov Cardiovascular Trials")
    t0 = time.time()
    trials = fetch_cv_trials_with_results(DATA_DIR, max_pages=max_pages, page_size=page_size)
    elapsed = time.time() - t0
    print(f"\nHarvest complete: {len(trials)} unique trials in {elapsed:.1f}s")
    return trials


def run_extraction(trials: list[dict] | None = None) -> list[dict]:
    """Step 2: Extract poolable effects from trials."""
    print_section("Extracting Poolable Effects")

    if trials is None:
        raw_path = os.path.join(DATA_DIR, "ctgov_cv_raw.json")
        if not os.path.isfile(raw_path):
            print(f"ERROR: No harvest data found at {raw_path}")
            print("Run with --quick or --full first.")
            sys.exit(1)
        with open(raw_path, 'r', encoding='utf-8') as f:
            trials = json.load(f)
        print(f"Loaded {len(trials)} trials from {raw_path}")

    effects_path = os.path.join(DATA_DIR, "ctgov_cv_effects.json")
    effects = extract_all_effects(trials, effects_path)
    return effects


def run_analysis(effects: list[dict] | None = None) -> tuple[list[dict], dict]:
    """Step 3: Drug/Outcome normalization + clustering + stats."""
    print_section("HUDA + AL-MIZAN: Normalizing & Clustering")

    if effects is None:
        effects_path = os.path.join(DATA_DIR, "ctgov_cv_effects.json")
        if not os.path.isfile(effects_path):
            print(f"ERROR: No effects data found at {effects_path}")
            sys.exit(1)
        with open(effects_path, 'r', encoding='utf-8') as f:
            effects = json.load(f)
        print(f"Loaded {len(effects)} effects from {effects_path}")

    # Drug classification stats
    drug_classified = 0
    drug_classes = {}
    for e in effects:
        result = classify_drug(e.get('intervention', ''))
        if result is not None:
            drug_classified += 1
            cls = result[1]
            drug_classes[cls] = drug_classes.get(cls, 0) + 1

    print(f"Drug classification: {drug_classified}/{len(effects)} "
          f"({100*drug_classified/max(len(effects),1):.1f}%)")
    print(f"  Classes found: {len(drug_classes)}")
    for cls, cnt in sorted(drug_classes.items(), key=lambda x: -x[1])[:15]:
        print(f"    {cls}: {cnt}")

    # Outcome normalization stats
    outcome_normalized = 0
    outcome_categories = {}
    for e in effects:
        norm = normalize_outcome(e.get('outcome_title', ''))
        if norm != e.get('outcome_title', ''):
            outcome_normalized += 1
        cat = get_outcome_category(norm)
        outcome_categories[cat] = outcome_categories.get(cat, 0) + 1

    print(f"\nOutcome normalization: {outcome_normalized}/{len(effects)} mapped")
    for cat, cnt in sorted(outcome_categories.items(), key=lambda x: -x[1]):
        print(f"  {cat}: {cnt}")

    # Clustering
    clusters = build_clusters(effects)
    poolable = get_poolable_clusters(effects, min_k=2)
    summary = summarize_clusters(clusters)

    largest_k = summary['largest_clusters'][0]['k'] if summary['largest_clusters'] else 0
    print(f"\nClustering:")
    print(f"  Total clusters: {summary['total_clusters']}")
    print(f"  Poolable (k>=2): {summary['poolable_clusters']}")
    print(f"  Total studies across clusters: {summary['total_studies']}")
    print(f"  Total enrollment: {summary['total_enrollment']:,}")
    print(f"  Largest cluster: k={largest_k}")

    # Effect type distribution
    type_dist = {}
    for c in clusters.values():
        et = c['effect_type']
        type_dist[et] = type_dist.get(et, 0) + 1
    print(f"\n  Effect type distribution:")
    for et, cnt in sorted(type_dist.items(), key=lambda x: -x[1]):
        print(f"    {et}: {cnt} clusters")

    # Top poolable clusters
    if poolable:
        print(f"\n  Top 20 poolable clusters by k:")
        sorted_clusters = sorted(poolable.items(), key=lambda x: -x[1]['k'])
        for key, c in sorted_clusters[:20]:
            print(f"    k={c['k']:3d} | {c['subcategory']:4s} | {c['drug_class']:25s} | "
                  f"{c['outcome_normalized']:35s} | {c['effect_type']}")

    return effects, clusters


def run_export(effects_path: str | None = None) -> dict:
    """Step 4: SHAHID validation + browser export."""
    print_section("SHAHID + NUR: Validation & Browser Export")

    if effects_path is None:
        effects_path = os.path.join(DATA_DIR, "ctgov_cv_effects.json")

    output_path = os.path.join(DATA_DIR, "al_burhan_export.json")

    pairwise_path = PAIRWISE70_PATH if os.path.isfile(PAIRWISE70_PATH) else None
    ghost_path = GHOST_PATH if os.path.isfile(GHOST_PATH) else None

    if pairwise_path:
        print(f"Pairwise70 validation: {pairwise_path}")
    else:
        print("WARNING: Pairwise70 CSV not found, skipping validation")

    result = run_full_pipeline(
        effects_path,
        pairwise_path or "",
        output_path,
        ghost_csv_path=ghost_path,
    )

    print(f"\nExported to {output_path}")
    print(f"  Total clusters: {result.get('total_clusters', 0)}")
    print(f"  Poolable clusters: {result.get('poolable_clusters', 0)}")
    print(f"  Total effects: {result.get('total_effects', 0)}")

    # FURQAN distribution
    clusters_data = result.get('clusters', [])
    furqan_dist = {}
    for c in clusters_data:
        ftype = c.get('furqan', 'unknown')
        furqan_dist[ftype] = furqan_dist.get(ftype, 0) + 1
    if furqan_dist:
        print(f"\n  FURQAN discovery classification:")
        for ftype, cnt in sorted(furqan_dist.items(), key=lambda x: -x[1]):
            print(f"    {ftype}: {cnt}")

    # File size
    file_size = os.path.getsize(output_path)
    print(f"\n  Output file size: {file_size/1024:.1f} KB")

    return result


def main() -> None:
    parser = argparse.ArgumentParser(
        description="AL-BURHAN Pipeline: Living Meta-Analysis of All Cardiology"
    )
    parser.add_argument('--quick', action='store_true',
                        help='Quick test run (3 pages per term)')
    parser.add_argument('--full', action='store_true',
                        help='Full harvest (50 pages per term, same as default)')
    parser.add_argument('--export-only', action='store_true',
                        help='Re-export from existing harvest data')
    parser.add_argument('--max-pages', type=int, default=None,
                        help='Override max pages per term')
    parser.add_argument('--page-size', type=int, default=100,
                        help='Studies per API page (default: 100)')
    args = parser.parse_args()

    print("+==================================================+")
    print("|  AL-BURHAN: Living Meta-Analysis of Cardiology  |")
    print("|  'And those firmly rooted in knowledge' (3:7)   |")
    print("+==================================================+")

    t0 = time.time()

    if args.export_only:
        run_export()
    else:
        max_pages = args.max_pages
        if max_pages is None:
            max_pages = 3 if args.quick else 50

        # Step 1: Harvest
        trials = run_harvest(max_pages=max_pages, page_size=args.page_size)

        # Step 2: Extract
        effects = run_extraction(trials)

        # Step 3: Analyze
        run_analysis(effects)

        # Step 4: Export
        run_export()

    elapsed = time.time() - t0
    print(f"\n{'='*60}")
    print(f"  Pipeline complete in {elapsed:.1f}s")
    print(f"{'='*60}")


if __name__ == '__main__':
    main()
