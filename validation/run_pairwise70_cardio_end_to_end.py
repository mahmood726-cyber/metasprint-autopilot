#!/usr/bin/env python3
"""Run cardio-only Pairwise70 end-to-end Selenium benchmark for MetaSprint."""

import glob
import json
import math
import os
import re
import time
from typing import Any, Dict, List, Optional, Tuple

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

from browser_runtime import ensure_local_browser_libs
from judge_compare import compare_results
from oracle_seal import (
    _normal_quantile,
    compute_study_from_ci,
    compute_study_md,
    compute_study_or,
    dl_meta_analysis,
)


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
APP_HTML = os.path.join(os.path.dirname(BASE_DIR), "metasprint-autopilot.html")

PAIRWISE70_ROOT = "/mnt/c/Users/user/OneDrive - NHS/Documents/Pairwise70"
DOMAIN_MAP_CSV = os.path.join(
    PAIRWISE70_ROOT, "analysis", "transportability", "transportability_domain_assignments.csv"
)
COCHRANE_JSON_DIR = os.path.join(
    PAIRWISE70_ROOT, "open_api_rct_benchmark", "data", "cochrane_501"
)

OUTPUT_DIR = os.path.join(BASE_DIR, "reports", "pairwise70_cardio_benchmark")
OUTPUT_JSON = os.path.join(OUTPUT_DIR, "pairwise70_cardio_end_to_end_report.json")
OUTPUT_MD = os.path.join(OUTPUT_DIR, "pairwise70_cardio_end_to_end_report.md")

BROWSER_LIB_STATUS = ensure_local_browser_libs(auto_download=True)


def _to_float(v: Any) -> Optional[float]:
    if v is None:
        return None
    if isinstance(v, str):
        vv = v.strip()
        if vv == "":
            return None
        try:
            return float(vv)
        except ValueError:
            return None
    try:
        return float(v)
    except Exception:
        return None


def _to_int(v: Any) -> Optional[int]:
    f = _to_float(v)
    if f is None:
        return None
    try:
        return int(round(f))
    except Exception:
        return None


def _is_empty(v: Any) -> bool:
    if v is None:
        return True
    if isinstance(v, str):
        return v.strip() == "" or v.strip().lower() == "na"
    return False


def load_cardio_review_ids() -> List[str]:
    import csv

    review_ids: List[str] = []
    with open(DOMAIN_MAP_CSV, "r", encoding="utf-8", errors="replace") as fh:
        reader = csv.DictReader(fh)
        for row in reader:
            primary = (row.get("domain_primary") or "").strip().lower()
            secondary = (row.get("domain_secondary") or "").strip().lower()
            domain_list = (row.get("domain_list") or "").strip().lower()
            if primary == "cardiovascular" or secondary == "cardiovascular" or "cardiovascular" in domain_list:
                rid = (row.get("review_id") or "").strip()
                if rid:
                    review_ids.append(rid)
    return sorted(set(review_ids))


def find_cardio_dataset_files(cardio_review_ids: List[str]) -> List[str]:
    files = sorted(glob.glob(os.path.join(COCHRANE_JSON_DIR, "*.json")))
    out: List[str] = []
    for path in files:
        name = os.path.basename(path)
        m = re.match(r"(CD\d+)", name)
        if not m:
            continue
        if m.group(1) in cardio_review_ids:
            out.append(path)
    return out


def parse_pairwise70_rows(json_path: str) -> List[Dict[str, Any]]:
    with open(json_path, "r", encoding="utf-8", errors="replace") as fh:
        rows = json.load(fh)
    if not isinstance(rows, list):
        return []
    return rows


def extract_analysis_rows(rows: List[Dict[str, Any]], analysis_number: int = 1) -> List[Dict[str, Any]]:
    target = []
    for r in rows:
        a = _to_int(r.get("Analysis.number"))
        if a != analysis_number:
            continue
        target.append(r)
    # Prefer overall rows (empty subgroup number) as Cochrane "overall"
    overall = [r for r in target if _is_empty(r.get("Subgroup.number"))]
    return overall if overall else target


def parse_binary_studies(rows: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    studies: List[Dict[str, Any]] = []
    seen = set()
    for r in rows:
        study = str(r.get("Study") or "").strip()
        if not study or study in seen:
            continue
        ee = _to_float(r.get("Experimental.cases"))
        en = _to_float(r.get("Experimental.N"))
        ce = _to_float(r.get("Control.cases"))
        cn = _to_float(r.get("Control.N"))
        if None in (ee, en, ce, cn):
            continue
        if en <= 0 or cn <= 0:
            continue
        if ee == 0 and ce == 0:
            continue
        seen.add(study)
        studies.append(
            {
                "study": study,
                "year": _to_int(r.get("Study.year")) or 0,
                "ee": ee,
                "en": en,
                "ce": ce,
                "cn": cn,
                "analysis_name": str(r.get("Analysis.name") or "").strip(),
                "review_doi": str(r.get("review_doi") or "").strip(),
            }
        )
    return studies


def parse_continuous_studies(rows: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    studies: List[Dict[str, Any]] = []
    seen = set()
    for r in rows:
        study = str(r.get("Study") or "").strip()
        if not study or study in seen:
            continue
        em = _to_float(r.get("Experimental.mean"))
        esd = _to_float(r.get("Experimental.SD"))
        en = _to_float(r.get("Experimental.N"))
        cm = _to_float(r.get("Control.mean"))
        csd = _to_float(r.get("Control.SD"))
        cn = _to_float(r.get("Control.N"))
        if None in (em, esd, en, cm, csd, cn):
            continue
        if en <= 0 or cn <= 0 or esd <= 0 or csd <= 0:
            continue
        seen.add(study)
        studies.append(
            {
                "study": study,
                "year": _to_int(r.get("Study.year")) or 0,
                "e_mean": em,
                "e_sd": esd,
                "en": en,
                "c_mean": cm,
                "c_sd": csd,
                "cn": cn,
                "analysis_name": str(r.get("Analysis.name") or "").strip(),
                "review_doi": str(r.get("review_doi") or "").strip(),
            }
        )
    return studies


def parse_giv_studies(rows: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    studies: List[Dict[str, Any]] = []
    seen = set()
    for r in rows:
        study = str(r.get("Study") or "").strip()
        if not study or study in seen:
            continue
        gm = _to_float(r.get("GIV.Mean"))
        gs = _to_float(r.get("GIV.SE"))
        if gm is not None and gs is not None and gs > 0:
            seen.add(study)
            studies.append(
                {
                    "study": study,
                    "year": _to_int(r.get("Study.year")) or 0,
                    "effect": gm,
                    "se": gs,
                    "analysis_name": str(r.get("Analysis.name") or "").strip(),
                    "review_doi": str(r.get("review_doi") or "").strip(),
                }
            )
            continue

        mv = _to_float(r.get("Mean"))
        ci_lo = _to_float(r.get("CI.start"))
        ci_hi = _to_float(r.get("CI.end"))
        if None in (mv, ci_lo, ci_hi):
            continue
        conv = compute_study_from_ci(mv, ci_lo, ci_hi)
        if conv is None:
            continue
        effect, se = conv
        seen.add(study)
        studies.append(
            {
                "study": study,
                "year": _to_int(r.get("Study.year")) or 0,
                "effect": effect,
                "se": se,
                "analysis_name": str(r.get("Analysis.name") or "").strip(),
                "review_doi": str(r.get("review_doi") or "").strip(),
            }
        )
    return studies


def build_oracle_and_studies(dataset_name: str, rows: List[Dict[str, Any]]) -> Optional[Tuple[Dict[str, Any], List[Dict[str, Any]]]]:
    a_rows = extract_analysis_rows(rows, analysis_number=1)
    if not a_rows:
        return None

    dtype = "unknown"
    parsed = parse_binary_studies(a_rows)
    if len(parsed) >= 2:
        dtype = "binary"
    else:
        parsed = parse_continuous_studies(a_rows)
        if len(parsed) >= 2:
            dtype = "continuous"
        else:
            parsed = parse_giv_studies(a_rows)
            if len(parsed) >= 2:
                dtype = "giv"

    if len(parsed) < 2:
        return None

    studies_for_oracle: List[Tuple[str, float, float]] = []
    blinded_studies: List[Dict[str, Any]] = []
    z = _normal_quantile(0.975)

    for s in parsed:
        if dtype == "binary":
            comp = compute_study_or(s["ee"], s["en"], s["ce"], s["cn"])
            if comp is None:
                continue
            yi, sei, _cc = comp
            studies_for_oracle.append((s["study"], yi, sei))
            lo = math.exp(yi - z * sei)
            hi = math.exp(yi + z * sei)
            blinded_studies.append(
                {
                    "study": s["study"],
                    "year": s.get("year", 0),
                    "en": s["en"],
                    "cn": s["cn"],
                    "effect_estimate": round(math.exp(yi), 6),
                    "lower_ci": round(lo, 6),
                    "upper_ci": round(hi, 6),
                    "effect_type": "OR",
                    "analysis_name": s.get("analysis_name", ""),
                }
            )
        elif dtype == "continuous":
            comp = compute_study_md(s["e_mean"], s["e_sd"], s["en"], s["c_mean"], s["c_sd"], s["cn"])
            if comp is None:
                continue
            yi, sei = comp
            studies_for_oracle.append((s["study"], yi, sei))
            lo = yi - z * sei
            hi = yi + z * sei
            blinded_studies.append(
                {
                    "study": s["study"],
                    "year": s.get("year", 0),
                    "en": s["en"],
                    "cn": s["cn"],
                    "effect_estimate": round(yi, 6),
                    "lower_ci": round(lo, 6),
                    "upper_ci": round(hi, 6),
                    "effect_type": "MD",
                    "analysis_name": s.get("analysis_name", ""),
                }
            )
        else:  # giv
            yi, sei = s["effect"], s["se"]
            studies_for_oracle.append((s["study"], yi, sei))
            lo = yi - z * sei
            hi = yi + z * sei
            blinded_studies.append(
                {
                    "study": s["study"],
                    "year": s.get("year", 0),
                    "effect_estimate": round(yi, 6),
                    "lower_ci": round(lo, 6),
                    "upper_ci": round(hi, 6),
                    "effect_type": "MD",
                    "analysis_name": s.get("analysis_name", ""),
                }
            )

    if len(studies_for_oracle) < 2:
        return None

    is_ratio = dtype == "binary"
    ma = dl_meta_analysis(studies_for_oracle, conf_level=0.95, is_ratio=is_ratio)
    if not ma:
        return None

    cd_match = re.match(r"(CD\d+)", dataset_name)
    cd_number = cd_match.group(1) if cd_match else dataset_name
    analysis_name = blinded_studies[0].get("analysis_name", "")

    oracle = {
        "dataset_name": dataset_name,
        "cd_number": cd_number,
        "analysis_name": analysis_name,
        "k": ma["k"],
        "pooled_log": ma["pooled_log"],
        "pooled_se": ma["pooled_se"],
        "pooled": ma["pooled"],
        "pooled_lo": ma["pooled_lo"],
        "pooled_hi": ma["pooled_hi"],
        "tau2": ma["tau2"],
        "I2": ma["I2"],
        "Q": ma["Q"],
        "p_value": ma["p_value"],
        "effect_type": "OR" if is_ratio else "MD",
        "data_type": dtype,
        "is_ratio": is_ratio,
    }
    return oracle, blinded_studies


def create_driver() -> webdriver.Chrome:
    if not BROWSER_LIB_STATUS.get("ok"):
        raise RuntimeError(f"Chrome runtime libs unavailable: {BROWSER_LIB_STATUS.get('reason')}")

    opts = Options()
    opts.add_argument("--headless=new")
    opts.add_argument("--no-sandbox")
    opts.add_argument("--disable-dev-shm-usage")
    opts.add_argument("--window-size=1920,1080")
    opts.add_argument("--disable-gpu")
    opts.set_capability("goog:loggingPrefs", {"browser": "ALL"})
    driver = webdriver.Chrome(options=opts)
    driver.implicitly_wait(2)
    return driver


def load_app(driver: webdriver.Chrome, html_path: str) -> None:
    url = "file:///" + html_path.replace("\\", "/").replace(" ", "%20")
    driver.get(url)
    time.sleep(2)
    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.ID, "extractBody")))
    # First-time modal off
    driver.execute_script(
        """
        const o = document.getElementById('onboardOverlay');
        if (o) o.style.display = 'none';
        try { localStorage.setItem('msa-onboarded', '1'); } catch (e) {}
        """
    )


def run_end_to_end_for_dataset(
    driver: webdriver.Chrome,
    dataset_name: str,
    cd_number: str,
    analysis_name: str,
    effect_type: str,
    studies: List[Dict[str, Any]],
) -> Dict[str, Any]:
    # Simulate source-scoped pipeline setup (cardio-only, no PDF path used)
    setup_out = driver.execute_async_script(
        """
        const done = arguments[arguments.length - 1];
        const dsName = arguments[0];
        const cd = arguments[1];
        const analysisName = arguments[2];
        const effType = arguments[3];
        const rows = arguments[4];
        (async () => {
          try {
            // Per-dataset isolated project to avoid carry-over from IndexedDB.
            const p = createEmptyProject('CardioBench ' + dsName + ' ' + Date.now());
            projects.push(p);
            await idbPut('projects', p);
            currentProjectId = p.id;
            await loadProjects();
            renderProjectSelect();

            // 1) Dashboard/Discover
            switchPhase('dashboard');
            switchPhase('discover');

            // 2) Protocol
            switchPhase('protocol');
            const pEl = document.getElementById('picoP'); if (pEl) pEl.value = 'Adults with cardiovascular disease';
            const iEl = document.getElementById('picoI'); if (iEl) iEl.value = 'Intervention from included RCTs';
            const cEl = document.getElementById('picoC'); if (cEl) cEl.value = 'Control/placebo/standard care';
            const oEl = document.getElementById('picoO'); if (oEl) oEl.value = analysisName || 'Primary cardiovascular endpoint';
            if (typeof saveProjectData === 'function') saveProjectData();

            // 3) Search + Screen (trusted-source simulation)
            switchPhase('search');
            allReferences = [
              { id: 'pm-' + dsName, projectId: currentProjectId, source: 'PubMed', title: analysisName + ' (PubMed)', abstract: 'Cardiovascular RCT meta-analysis', year: '', authors: '', keywords: ['cardio','rct'], decision: null },
              { id: 'oa-' + dsName, projectId: currentProjectId, source: 'OpenAlex', title: analysisName + ' (OpenAlex)', abstract: 'Cardiovascular RCT meta-analysis', year: '', authors: '', keywords: ['cardio','rct'], decision: null },
              { id: 'ct-' + dsName, projectId: currentProjectId, source: 'ClinicalTrials.gov', title: analysisName + ' (CT.gov)', abstract: 'Cardiovascular randomized trial registry', year: '', authors: '', keywords: ['cardio','rct'], decision: null },
              { id: 'aa-' + dsName, projectId: currentProjectId, source: 'AACT', title: analysisName + ' (AACT)', abstract: 'Cardiovascular randomized trial mirror', year: '', authors: '', keywords: ['cardio','rct'], decision: null }
            ];
            if (typeof dedupSearchResults === 'function') allReferences = dedupSearchResults(allReferences);
            switchPhase('screen');
            if (allReferences[0]) allReferences[0].decision = 'include';
            if (typeof renderReferenceList === 'function') renderReferenceList();

            // 4) Extract
            switchPhase('extract');
            extractedStudies = [];
            if (typeof renderExtractTable === 'function') renderExtractTable();

            const baseOutcome = analysisName || 'Primary cardiovascular endpoint';
            const baseTp = 'longest follow-up';
            for (let idx = 0; idx < rows.length; idx++) {
              const s = rows[idx];
              const studyName = (s.study || 'Study') + (s.year ? (' ' + s.year) : '');
              const trialId = 'PAIRWISE70:' + cd + ':' + (idx + 1);
              addStudyRow({
                authorYear: studyName.slice(0, 180),
                trialId,
                outcomeId: baseOutcome,
                timepoint: baseTp,
                analysisPopulation: 'ITT',
                verificationStatus: 'needs-check',
                nTotal: (s.en || 0) + (s.cn || 0),
                nIntervention: s.en || null,
                nControl: s.cn || null,
                effectEstimate: s.effect_estimate,
                lowerCI: s.lower_ci,
                upperCI: s.upper_ci,
                effectType: s.effect_type || effType || 'OR',
                notes: 'Source=Pairwise70 Cochrane JSON; scope=cardio-RCT; non-PDF pipeline'
              });
            }

            // 5) Analyze via app pipeline
            switchPhase('analyze');
            const gate = document.getElementById('publishableGateToggle');
            if (gate) gate.checked = true;
            const conf = document.getElementById('confLevelSelect'); if (conf) conf.value = '0.95';
            const method = document.getElementById('methodSelect'); if (method) method.value = 'DL';
            done({ ok: true });
          } catch (e) {
            done({ ok: false, error: String(e) });
          }
        })();
        """
        ,
        dataset_name,
        cd_number,
        analysis_name,
        effect_type,
        studies,
    )
    if not setup_out or not setup_out.get("ok"):
        return {"error": setup_out.get("error", "dataset setup failed"), "results": None}

    # runAnalysis is async; await in browser context
    run_out = driver.execute_async_script(
        """
        const done = arguments[0];
        (async () => {
          try {
            await runAnalysis();
            const r = (typeof lastAnalysisResult !== 'undefined') ? lastAnalysisResult : null;
            const warn = document.getElementById('analysisWarnings')?.textContent || '';
            // 6) Write
            switchPhase('write');
            if (typeof generatePaper === 'function') await generatePaper();
            const methodsLen = (document.getElementById('methodsText')?.textContent || '').length;
            const resultsLen = (document.getElementById('resultsText')?.textContent || '').length;
            done({ ok: true, result: r, analysisWarnings: warn, methodsLen, resultsLen });
          } catch (e) {
            done({ ok: false, error: String(e) });
          }
        })();
        """
    )

    if not run_out or not run_out.get("ok"):
        return {"error": run_out.get("error", "runAnalysis failed"), "results": None}

    r = run_out.get("result") or {}
    ext = {
        "k": r.get("k"),
        "pooled": r.get("pooled"),
        "pooled_lo": r.get("pooledLo"),
        "pooled_hi": r.get("pooledHi"),
        "tau2": r.get("tau2"),
        "I2": r.get("I2"),
        "Q": r.get("Q"),
        "p_value": r.get("pValue"),
        "pooled_log": r.get("muRE"),
        "pooled_se": r.get("seRE"),
        "is_ratio": r.get("isRatio"),
        "forest_plot_rendered": bool(driver.execute_script("return !!document.querySelector('#forestPlotContainer svg');")),
        "funnel_plot_rendered": bool(driver.execute_script("return !!document.querySelector('#funnelPlotContainer svg');")),
        "conf_level": 0.95,
    }
    return {
        "results": ext,
        "analysisWarnings": run_out.get("analysisWarnings", ""),
        "methodsLen": int(run_out.get("methodsLen") or 0),
        "resultsLen": int(run_out.get("resultsLen") or 0),
    }


def main() -> int:
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    started = time.time()

    cardio_review_ids = load_cardio_review_ids()
    cardio_files = find_cardio_dataset_files(cardio_review_ids)

    max_datasets_env = os.environ.get("PAIRWISE70_CARDIO_MAX", "").strip()
    max_datasets = int(max_datasets_env) if max_datasets_env.isdigit() and int(max_datasets_env) > 0 else None

    oracle_map: Dict[str, Dict[str, Any]] = {}
    inputs_map: Dict[str, Dict[str, Any]] = {}
    skipped: List[Dict[str, Any]] = []

    for path in cardio_files:
        dataset_name = os.path.basename(path).replace(".json", "")
        rows = parse_pairwise70_rows(path)
        built = build_oracle_and_studies(dataset_name, rows)
        if not built:
            skipped.append({"dataset": dataset_name, "reason": "insufficient_studies"})
            continue
        oracle, blinded_studies = built
        oracle_map[dataset_name] = oracle
        inputs_map[dataset_name] = {
            "dataset_name": dataset_name,
            "cd_number": oracle["cd_number"],
            "analysis_name": oracle["analysis_name"],
            "effect_type": oracle["effect_type"],
            "k": len(blinded_studies),
            "studies": blinded_studies,
        }

    results: Dict[str, Any] = {}
    total_pass = 0
    total_fail = 0
    total_error = 0

    driver = create_driver()
    try:
        load_app(driver, APP_HTML)
        dataset_names = sorted(inputs_map.keys())
        if max_datasets is not None:
            dataset_names = dataset_names[:max_datasets]
        for idx, ds_name in enumerate(dataset_names, start=1):
            inp = inputs_map[ds_name]
            oracle = oracle_map[ds_name]
            try:
                run = run_end_to_end_for_dataset(
                    driver=driver,
                    dataset_name=ds_name,
                    cd_number=inp["cd_number"],
                    analysis_name=inp["analysis_name"],
                    effect_type=inp["effect_type"],
                    studies=inp["studies"],
                )
                if run.get("error"):
                    results[ds_name] = {"status": "extractor_error", "error": run["error"], "metrics": {}}
                    total_error += 1
                else:
                    comp = compare_results(oracle, run["results"])
                    comp["analysisWarnings"] = run.get("analysisWarnings", "")
                    comp["methodsLen"] = run.get("methodsLen", 0)
                    comp["resultsLen"] = run.get("resultsLen", 0)
                    results[ds_name] = comp
                    if comp["status"] == "pass":
                        total_pass += 1
                    else:
                        total_fail += 1
            except Exception as exc:
                results[ds_name] = {"status": "extractor_error", "error": str(exc), "metrics": {}}
                total_error += 1

            if idx % 10 == 0 or idx == len(dataset_names):
                elapsed = time.time() - started
                rate = idx / elapsed if elapsed > 0 else 0
                print(
                    f"[{idx}/{len(dataset_names)}] pass={total_pass} fail={total_fail} err={total_error} "
                    f"rate={rate:.2f}/s elapsed={elapsed:.1f}s"
                )
    finally:
        driver.quit()

    total_compared = total_pass + total_fail
    pass_rate = (total_pass / total_compared * 100.0) if total_compared else 0.0

    summary = {
        "scope": {
            "domain": "cardiovascular",
            "design": "RCT-focused Pairwise70 Cochrane study-level",
            "sources": ["ClinicalTrials.gov", "AACT", "PubMed", "OpenAlex"],
            "pdf_pipeline_used": False,
        },
        "counts": {
            "cardio_review_ids": len(cardio_review_ids),
            "cardio_dataset_files": len(cardio_files),
            "prepared_datasets": len(inputs_map),
            "skipped_datasets": len(skipped),
            "pass": total_pass,
            "fail": total_fail,
            "error": total_error,
            "pass_rate": pass_rate,
        },
        "elapsed_seconds": round(time.time() - started, 2),
    }

    payload = {
        "summary": summary,
        "skipped": skipped,
        "oracle": oracle_map,
        "results": results,
    }
    with open(OUTPUT_JSON, "w", encoding="utf-8") as fh:
        json.dump(payload, fh, indent=2)

    fail_rows = []
    for ds_name, comp in results.items():
        if comp.get("status") != "pass":
            fail_rows.append((ds_name, comp.get("status"), comp.get("error", "")))

    lines = [
        "# Pairwise70 Cardio End-to-End Selenium Benchmark",
        "",
        "## Scope",
        "- Domain: cardiovascular only",
        "- Pipeline mode: cardio RCT synthesis",
        "- Allowed discovery sources: CT.gov, AACT, PubMed, OpenAlex",
        "- PDF extraction path used: no",
        "",
        "## Summary",
        f"- Cardio review IDs: {summary['counts']['cardio_review_ids']}",
        f"- Cardio dataset files: {summary['counts']['cardio_dataset_files']}",
        f"- Prepared datasets: {summary['counts']['prepared_datasets']}",
        f"- Skipped datasets: {summary['counts']['skipped_datasets']}",
        f"- Pass: {summary['counts']['pass']}",
        f"- Fail: {summary['counts']['fail']}",
        f"- Error: {summary['counts']['error']}",
        f"- Pass rate: {summary['counts']['pass_rate']:.2f}%",
        f"- Elapsed: {summary['elapsed_seconds']} s",
        "",
    ]

    if skipped:
        lines += ["## Skipped", ""]
        lines += [f"- {s['dataset']}: {s['reason']}" for s in skipped[:40]]
        lines += [""]

    if fail_rows:
        lines += ["## Failures/Errors", ""]
        for ds_name, status, err in fail_rows[:80]:
            if err:
                lines.append(f"- `{ds_name}` [{status}]: {err[:180]}")
            else:
                lines.append(f"- `{ds_name}` [{status}]")
        lines += [""]

    with open(OUTPUT_MD, "w", encoding="utf-8") as fh:
        fh.write("\n".join(lines))

    print(f"Report JSON: {OUTPUT_JSON}")
    print(f"Report MD:   {OUTPUT_MD}")
    print(
        f"Final: prepared={summary['counts']['prepared_datasets']} pass={total_pass} "
        f"fail={total_fail} error={total_error} pass_rate={pass_rate:.2f}%"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
