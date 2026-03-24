#!/usr/bin/env python3
"""Benchmark MetaSprint vs 4 recent high-quality published cardiology meta-analyses.

Runs 4 matched author personas through Selenium and compares manuscript quality
to a benchmark checklist derived from published paper abstracts/journal standards.
"""

from __future__ import annotations

import json
import os
import statistics
import time
from dataclasses import asdict
from datetime import datetime, timezone

from selenium_12_user_advanced_journal_review import (
    AuthorPersona,
    compute_subscores,
    create_driver,
    load_app,
    review_with_panel,
    run_author_persona,
)


PROJECT_ROOT = os.path.normpath(os.path.join(os.path.dirname(__file__), ".."))
REPORT_DIR = os.path.join(PROJECT_ROOT, "validation", "reports", "benchmark_4_recent_high_quality")
REPORT_JSON = os.path.join(REPORT_DIR, "benchmark_4_recent_high_quality_report.json")
REPORT_MD = os.path.join(REPORT_DIR, "benchmark_4_recent_high_quality_report.md")


BENCHMARKS = [
    {
        "id": "jacc_af_stable_cad_2025",
        "title": "Anticoagulation and Antiplatelet Therapy for Atrial Fibrillation and Stable Coronary Disease: Meta-Analysis of Randomized Trials",
        "journal": "J Am Coll Cardiol",
        "year": 2025,
        "pmid": "39918465",
        "url": "https://pubmed.ncbi.nlm.nih.gov/39918465/",
        "expected": {
            "methods_reporting_min": 85,
            "stats_reporting_min": 90,
            "robustness_min": 75,
            "gate_integrity_min": 80,
        },
        "persona": AuthorPersona(
            "AF-CAD Benchmark Author",
            "af",
            "adults with atrial fibrillation and stable coronary artery disease",
            "oral anticoagulation monotherapy",
            "oral anticoagulation plus antiplatelet therapy",
            "major bleeding and ischemic events",
            30,
            70,
            22,
            16,
        ),
    },
    {
        "id": "jacc_hf_mra_post_mi_2025",
        "title": "Mineralocorticoid Receptor Antagonists in Myocardial Infarction Patients: A Systematic Review and Meta-Analysis of Randomized Trials",
        "journal": "JACC Heart Fail",
        "year": 2025,
        "pmid": "40616942",
        "url": "https://pubmed.ncbi.nlm.nih.gov/40616942/",
        "expected": {
            "methods_reporting_min": 85,
            "stats_reporting_min": 90,
            "robustness_min": 70,
            "gate_integrity_min": 80,
        },
        "persona": AuthorPersona(
            "MRA-PostMI Benchmark Author",
            "acs",
            "adults after myocardial infarction",
            "mineralocorticoid receptor antagonists",
            "no mineralocorticoid receptor antagonist",
            "death or new/worsening heart failure",
            28,
            68,
            20,
            15,
        ),
    },
    {
        "id": "jacc_hf_stroke_hfref_2025",
        "title": "Stroke in Heart Failure With Reduced Ejection Fraction: Systematic Review and Meta-Analysis of Randomized Trials",
        "journal": "JACC Heart Fail",
        "year": 2025,
        "pmid": "40088236",
        "url": "https://pubmed.ncbi.nlm.nih.gov/40088236/",
        "expected": {
            "methods_reporting_min": 85,
            "stats_reporting_min": 85,
            "robustness_min": 70,
            "gate_integrity_min": 80,
        },
        "persona": AuthorPersona(
            "HFrEF-Stroke Benchmark Author",
            "hf",
            "adults with heart failure with reduced ejection fraction",
            "SGLT2 inhibitors",
            "placebo",
            "stroke",
            30,
            72,
            24,
            16,
        ),
    },
    {
        "id": "dom_glp1_meta_reg_2025",
        "title": "Cardiovascular risk reduction with glucagon-like peptide-1 receptor agonists is proportional to HbA1c lowering in type 2 diabetes",
        "journal": "Diabetes Obes Metab",
        "year": 2025,
        "pmid": "40926380",
        "url": "https://pubmed.ncbi.nlm.nih.gov/40926380/",
        "expected": {
            "methods_reporting_min": 85,
            "stats_reporting_min": 90,
            "robustness_min": 80,
            "gate_integrity_min": 80,
        },
        "persona": AuthorPersona(
            "GLP1-MACE Benchmark Author",
            "general",
            "adults with type 2 diabetes at cardiovascular risk",
            "GLP-1 receptor agonists",
            "placebo",
            "major adverse cardiovascular events",
            32,
            76,
            24,
            17,
        ),
    },
]


def evaluate_match(subscores: dict, expected: dict) -> dict:
    checks = {
        "methods_reporting": float(subscores.get("methods_reporting", 0.0)) >= float(expected.get("methods_reporting_min", 0.0)),
        "stats_reporting": float(subscores.get("stats_reporting", 0.0)) >= float(expected.get("stats_reporting_min", 0.0)),
        "robustness": float(subscores.get("robustness", 0.0)) >= float(expected.get("robustness_min", 0.0)),
        "gate_integrity": float(subscores.get("gate_integrity", 0.0)) >= float(expected.get("gate_integrity_min", 0.0)),
    }
    return {
        "checks": checks,
        "matched": sum(1 for v in checks.values() if v),
        "total": len(checks),
        "match_rate": sum(1 for v in checks.values() if v) / len(checks),
    }


def write_markdown(report: dict) -> str:
    summary = report["summary"]
    lines = [
        "# 4 Recent High-Quality Meta-Analysis Benchmark",
        "",
        "## Summary",
        f"- Benchmarks tested: {summary['benchmarks_tested']}",
        f"- Selenium runs successful: {summary['runs_ok']}/{summary['benchmarks_tested']}",
        f"- Mean benchmark quality-match rate: {summary['mean_match_rate']*100:.1f}%",
        f"- Panel acceptance across runs: {summary['mean_panel_accept_rate']*100:.1f}%",
        f"- Advanced-gate ready runs: {summary['advanced_gate_ready_count']}/{summary['runs_ok']}",
        f"- Mean total runtime: {summary['mean_total_sec']:.1f}s",
        "",
        "## Per Benchmark",
    ]

    for row in report["results"]:
        if not row.get("ok"):
            lines.append(f"- {row.get('benchmark_id')}: ERROR - {row.get('error', 'unknown')}")
            continue
        m = row.get("benchmark_match", {})
        lines.append(
            f"- {row['benchmark_id']}: match={m.get('matched', 0)}/{m.get('total', 0)} "
            f"({m.get('match_rate', 0)*100:.0f}%), panel={row.get('panel_accept_count', 0)}/12, "
            f"gate_ready={row.get('advanced_gate_ready')}, methods={row.get('subscores',{}).get('methods_reporting',0):.0f}, "
            f"stats={row.get('subscores',{}).get('stats_reporting',0):.0f}, robustness={row.get('subscores',{}).get('robustness',0):.0f}"
        )
        lines.append(f"  - Source: {row.get('benchmark_url')}")

    return "\n".join(lines) + "\n"


def main() -> int:
    started = time.time()
    os.makedirs(REPORT_DIR, exist_ok=True)

    pace_scale_env = os.environ.get("HUMAN_PACE_SCALE", "1.0").strip()
    try:
        pace_scale = float(pace_scale_env)
    except ValueError:
        pace_scale = 1.0

    driver = create_driver()
    results = []
    try:
        load_app(driver)
        for idx, b in enumerate(BENCHMARKS, start=1):
            row = run_author_persona(driver, b["persona"], pace_scale)
            row["benchmark_id"] = b["id"]
            row["benchmark_title"] = b["title"]
            row["benchmark_journal"] = b["journal"]
            row["benchmark_year"] = b["year"]
            row["benchmark_pmid"] = b["pmid"]
            row["benchmark_url"] = b["url"]

            if row.get("ok"):
                row = review_with_panel(row)
                subs = compute_subscores(row)
                row["subscores"] = {k: round(v, 1) for k, v in subs.items()}
                row["benchmark_match"] = evaluate_match(subs, b["expected"])
                print(
                    f"OK {idx}/4 {b['id']}: match={row['benchmark_match']['matched']}/{row['benchmark_match']['total']}, "
                    f"panel={row.get('panel_accept_count',0)}/12, gate={row.get('advanced_gate_score',0)}%"
                )
            else:
                print(f"ERROR {idx}/4 {b['id']}: {row.get('error','unknown')}")
            results.append(row)
    finally:
        driver.quit()

    ok_rows = [r for r in results if r.get("ok")]
    summary = {
        "timestamp_utc": datetime.now(timezone.utc).isoformat(),
        "benchmarks_tested": len(BENCHMARKS),
        "runs_ok": len(ok_rows),
        "advanced_gate_ready_count": sum(1 for r in ok_rows if r.get("advanced_gate_ready")),
        "mean_match_rate": statistics.mean([r.get("benchmark_match", {}).get("match_rate", 0.0) for r in ok_rows]) if ok_rows else 0.0,
        "mean_panel_accept_rate": statistics.mean([r.get("panel_accept_rate", 0.0) for r in ok_rows]) if ok_rows else 0.0,
        "mean_total_sec": statistics.mean([r.get("timings", {}).get("total_sec", 0.0) for r in ok_rows]) if ok_rows else 0.0,
        "elapsed_wall_sec": round(time.time() - started, 2),
    }

    out = {
        "summary": summary,
        "benchmarks": [{k: v for k, v in b.items() if k != "persona"} for b in BENCHMARKS],
        "personas": [asdict(b["persona"]) for b in BENCHMARKS],
        "results": results,
    }

    with open(REPORT_JSON, "w", encoding="utf-8") as f:
        json.dump(out, f, indent=2)
    with open(REPORT_MD, "w", encoding="utf-8") as f:
        f.write(write_markdown(out))

    print(
        f"SUMMARY ok={summary['runs_ok']}/{summary['benchmarks_tested']} "
        f"mean_match={summary['mean_match_rate']*100:.1f}% "
        f"panel={summary['mean_panel_accept_rate']*100:.1f}% "
        f"gate_ready={summary['advanced_gate_ready_count']}/{summary['runs_ok']}"
    )
    print(f"Report written: {REPORT_JSON}")

    if summary["runs_ok"] < len(BENCHMARKS):
        return 1
    if summary["mean_match_rate"] < 0.75:
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
