#!/usr/bin/env python3
"""Generate locked reproducibility report artifacts from a validation run folder."""

from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import json
import re
from pathlib import Path
from typing import Any

SUMMARY_PATTERNS = {
    "passed": re.compile(r"PASSED:\s*(\d+)", re.IGNORECASE),
    "failed": re.compile(r"FAILED:\s*(\d+)", re.IGNORECASE),
    "warnings": re.compile(r"WARNINGS:\s*(\d+)", re.IGNORECASE),
}


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def read_text_any(path: Path) -> str:
    raw = path.read_bytes()
    for enc in ("utf-8", "utf-16", "utf-16-le", "utf-16-be", "cp1252"):
        try:
            txt = raw.decode(enc)
            return txt.replace("\x00", "")
        except Exception:
            continue
    return raw.decode("utf-8", errors="ignore").replace("\x00", "")


def parse_test_summary(path: Path) -> dict[str, int | None]:
    out: dict[str, int | None] = {"passed": None, "failed": None, "warnings": None}
    if not path.is_file():
        return out
    text = read_text_any(path)
    for key, pattern in SUMMARY_PATTERNS.items():
        m = pattern.search(text)
        if m:
            out[key] = int(m.group(1))
    return out


def load_json(path: Path) -> Any:
    if not path.is_file():
        return None
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return None


def yes_no(value: bool) -> str:
    return "yes" if value else "no"


def main() -> int:
    p = argparse.ArgumentParser()
    p.add_argument("--project-root", required=True)
    p.add_argument("--run-dir", required=True)
    p.add_argument("--v2-log", required=True)
    p.add_argument("--comprehensive-log", required=True)
    p.add_argument("--oracle-json", required=True)
    p.add_argument("--glmm-log", required=False, default="")
    p.add_argument("--prefix", default="LOCKED_REPRODUCIBILITY_REPORT")
    args = p.parse_args()

    project_root = Path(args.project_root).resolve()
    run_dir = Path(args.run_dir).resolve()
    run_dir.mkdir(parents=True, exist_ok=True)

    v2_log = Path(args.v2_log)
    comprehensive_log = Path(args.comprehensive_log)
    oracle_json = Path(args.oracle_json)
    glmm_log = Path(args.glmm_log) if args.glmm_log else None

    v2_summary = parse_test_summary(v2_log)
    comp_summary = parse_test_summary(comprehensive_log)

    oracle_payload = load_json(oracle_json)
    oracle_dataset_count = 0
    oracle_dataset_names: list[str] = []
    oracle_glmm_dataset_names: list[str] = []
    if isinstance(oracle_payload, dict):
        datasets = oracle_payload.get("datasets")
        if isinstance(datasets, list):
            oracle_dataset_count = len(datasets)
            for ds in datasets:
                if isinstance(ds, dict):
                    ds_name = str(ds.get("name", "unknown"))
                    oracle_dataset_names.append(ds_name)
                    if ds.get("glmm") is not None:
                        oracle_glmm_dataset_names.append(ds_name)

    glmm_crosscheck_files = sorted(
        [
            f.name
            for f in run_dir.glob("truthcert_glmm_metafor_crosscheck_*.csv")
        ]
    )
    glmm_comparison_files = sorted(
        [
            f.name
            for f in run_dir.glob("truthcert_glmm_metafor_comparison_*.csv")
        ]
    )

    key_files = [
        "TruthCert-PairwisePro-v1.0.html",
        "app.js",
        "expert_upgrade_additions.js",
        "run_oracle_benchmark.ps1",
        "R_oracle_pairwise_benchmark.R",
        "run_latest_glmm_metafor_crosscheck.ps1",
        "run_nightly_quality_gate.ps1",
    ]
    file_hashes: list[dict[str, str]] = []
    for rel in key_files:
        pth = project_root / rel
        if pth.is_file():
            file_hashes.append(
                {
                    "file": rel,
                    "sha256": sha256_file(pth),
                }
            )

    glmm_evidence_present = (
        bool(glmm_crosscheck_files)
        or bool(glmm_comparison_files)
        or bool(oracle_glmm_dataset_names)
    )

    gate_conditions = {
        "test_v2_failed_zero": (v2_summary.get("failed") == 0),
        "test_comprehensive_failed_zero": (comp_summary.get("failed") == 0),
        "oracle_output_present": oracle_json.is_file(),
        "glmm_crosscheck_artifact_present": glmm_evidence_present,
    }
    all_pass = all(gate_conditions.values())

    now = dt.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    payload = {
        "generated_at": now,
        "project_root": str(project_root),
        "run_dir": str(run_dir),
        "gate": {
            "all_pass": all_pass,
            "conditions": gate_conditions,
        },
        "test_summaries": {
            "v2": v2_summary,
            "comprehensive": comp_summary,
        },
        "oracle": {
            "path": str(oracle_json),
            "dataset_count": oracle_dataset_count,
            "dataset_names": oracle_dataset_names,
            "datasets_with_glmm": oracle_glmm_dataset_names,
        },
        "glmm_crosscheck": {
            "log_path": str(glmm_log) if glmm_log else "",
            "crosscheck_csv": glmm_crosscheck_files,
            "comparison_csv": glmm_comparison_files,
            "oracle_glmm_dataset_count": len(oracle_glmm_dataset_names),
            "oracle_glmm_dataset_names": oracle_glmm_dataset_names,
        },
        "file_hashes": file_hashes,
    }

    stamp = dt.datetime.now().strftime("%Y%m%d_%H%M%S")
    json_path = run_dir / f"{args.prefix}_{stamp}.json"
    md_path = run_dir / f"{args.prefix}_{stamp}.md"
    json_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")

    lines: list[str] = []
    lines.append("# Locked Reproducibility Report")
    lines.append("")
    lines.append(f"Generated: {now}")
    lines.append(f"Run folder: `{run_dir}`")
    lines.append("")
    lines.append("## Gate Verdict")
    lines.append(f"Overall pass: **{yes_no(all_pass)}**")
    lines.append("")
    lines.append("## Gate Checks")
    for k, v in gate_conditions.items():
        lines.append(f"- {k}: {yes_no(v)}")
    lines.append("")
    lines.append("## Test Summaries")
    lines.append(
        f"- v2: passed={v2_summary.get('passed')} failed={v2_summary.get('failed')} warnings={v2_summary.get('warnings')}"
    )
    lines.append(
        f"- comprehensive: passed={comp_summary.get('passed')} failed={comp_summary.get('failed')} warnings={comp_summary.get('warnings')}"
    )
    lines.append("")
    lines.append("## Oracle Output")
    lines.append(f"- file: `{oracle_json}`")
    lines.append(f"- dataset_count: {oracle_dataset_count}")
    if oracle_dataset_names:
        lines.append("- datasets: " + ", ".join(oracle_dataset_names))
    lines.append("")
    lines.append("## GLMM Cross-check Artifacts")
    lines.append(f"- crosscheck_csv_count: {len(glmm_crosscheck_files)}")
    lines.append(f"- comparison_csv_count: {len(glmm_comparison_files)}")
    lines.append(f"- oracle_glmm_dataset_count: {len(oracle_glmm_dataset_names)}")
    if oracle_glmm_dataset_names:
        lines.append("- oracle_glmm_datasets: " + ", ".join(oracle_glmm_dataset_names))
    lines.append("")
    lines.append("## Build File Hashes (SHA256)")
    if file_hashes:
        for item in file_hashes:
            lines.append(f"- `{item['file']}`: `{item['sha256']}`")
    else:
        lines.append("- none collected")

    md_path.write_text("\n".join(lines) + "\n", encoding="utf-8")

    print(str(json_path))
    print(str(md_path))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
