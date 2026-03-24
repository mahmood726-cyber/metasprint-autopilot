#!/usr/bin/env python3
"""Human-rate 12-user Selenium benchmark for MetaSprint cardio workflow.

Simulates 12 cardiology personas end-to-end:
  discover -> protocol -> search -> screen -> extract -> analyze -> write

Uses noisy mixed-source records (relevant + irrelevant + duplicates) and reports:
  - per-phase timing
  - conflict queue burden
  - registry verification burden
  - readiness and manuscript quality checks
  - bottleneck issue frequencies
"""

from __future__ import annotations

import json
import os
import statistics
import time
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any, Dict, List

from selenium import webdriver
from selenium.webdriver.chrome.options import Options

from browser_runtime import ensure_local_browser_libs


PROJECT_ROOT = os.path.normpath(os.path.join(os.path.dirname(__file__), ".."))
HTML_PATH = os.path.join(PROJECT_ROOT, "metasprint-autopilot.html")
REPORT_DIR = os.path.join(PROJECT_ROOT, "validation", "reports", "human_rate_12_user")
REPORT_JSON = os.path.join(REPORT_DIR, "human_rate_12_user_report.json")
REPORT_MD = os.path.join(REPORT_DIR, "human_rate_12_user_report.md")


@dataclass
class Persona:
    name: str
    subcategory: str
    p: str
    i: str
    c: str
    o: str
    relevant: int
    irrelevant: int
    duplicates: int
    manual_cap: int


PERSONAS: List[Persona] = [
    Persona("Interventional Fellow", "acs", "adults with acute coronary syndrome", "ticagrelor", "clopidogrel", "major adverse cardiovascular events", 34, 80, 28, 18),
    Persona("Heart Failure Consultant", "hf", "adults with HFrEF", "empagliflozin", "placebo", "CV death or HF hospitalization", 30, 72, 24, 16),
    Persona("EP Registrar", "af", "adults with atrial fibrillation", "apixaban", "warfarin", "stroke or systemic embolism", 28, 70, 22, 15),
    Persona("Hypertension Nurse", "htn", "adults with resistant hypertension", "renal denervation", "sham", "24-hour systolic blood pressure", 26, 68, 20, 14),
    Persona("Lipid Pharmacist", "lipids", "adults with ASCVD", "inclisiran", "standard care", "LDL-C change", 27, 75, 24, 16),
    Persona("Pulmonary HTN Lead", "ph", "adults with pulmonary arterial hypertension", "selexipag", "placebo", "clinical worsening", 24, 66, 19, 14),
    Persona("Stroke Prevention Fellow", "af", "adults with non-valvular AF", "edoxaban", "warfarin", "ischemic stroke", 30, 78, 26, 18),
    Persona("General Cardiology Registrar", "general", "adults with chronic coronary syndrome", "rivaroxaban", "aspirin alone", "composite cardiovascular events", 25, 74, 21, 15),
    Persona("Valve Investigator", "af", "adults after TAVI", "direct oral anticoagulants", "vitamin K antagonists", "major bleeding", 22, 64, 18, 13),
    Persona("Preventive Fellow", "lipids", "adults at high cardiovascular risk", "high-intensity statin", "moderate-intensity statin", "myocardial infarction", 26, 72, 23, 16),
    Persona("Academic Meta-Analyst", "hf", "adults with heart failure", "SGLT2 inhibitors", "placebo", "all-cause mortality", 32, 84, 30, 20),
    Persona("Methods Reviewer", "acs", "adults with cardiovascular disease", "antiplatelet therapy", "standard care", "major bleeding and ischemic events", 29, 76, 25, 17),
]


def create_driver() -> webdriver.Chrome:
    runtime = ensure_local_browser_libs(auto_download=True)
    if not runtime.get("ok"):
        raise RuntimeError(f"Chrome runtime unavailable: {runtime.get('reason')}")

    opts = Options()
    opts.add_argument("--headless=new")
    opts.add_argument("--no-sandbox")
    opts.add_argument("--disable-dev-shm-usage")
    opts.add_argument("--disable-gpu")
    opts.add_argument("--window-size=1920,1080")
    driver = webdriver.Chrome(options=opts)
    driver.set_script_timeout(180)
    return driver


def load_app(driver: webdriver.Chrome) -> None:
    url = "file:///" + HTML_PATH.replace("\\", "/").replace(" ", "%20")
    driver.get(url)
    time.sleep(2.0)
    driver.execute_script(
        """
        const overlay = document.getElementById('onboardOverlay');
        if (overlay) overlay.style.display = 'none';
        try { localStorage.setItem('msa-onboarded', '1'); } catch(e) {}
        """
    )


def run_persona(driver: webdriver.Chrome, persona: Persona, pace_scale: float) -> Dict[str, Any]:
    payload = {
        "name": persona.name,
        "subcategory": persona.subcategory,
        "P": persona.p,
        "I": persona.i,
        "C": persona.c,
        "O": persona.o,
        "relevant": persona.relevant,
        "irrelevant": persona.irrelevant,
        "duplicates": persona.duplicates,
        "manualCap": persona.manual_cap,
    }

    script = r"""
    const persona = arguments[0];
    const paceScale = Math.max(0.2, Number(arguments[1] || 1));
    const done = arguments[arguments.length - 1];

    const sleep = (ms) => new Promise(r => setTimeout(r, Math.max(1, Math.round(ms * paceScale))));
    const humanPause = async (minMs, maxMs) => {
      const span = Math.max(0, maxMs - minMs);
      await sleep(minMs + Math.random() * span);
    };
    const now = () => performance.now();

    (async () => {
      try {
        const t = {};
        const mark = (k) => { t[k] = now(); };
        const sec = (a, b) => Math.max(0, ((t[b] - t[a]) / 1000));

        // Isolated project per persona
        mark('start_total');
        const p = createEmptyProject('HumanRate ' + persona.name + ' ' + Date.now());
        projects.push(p);
        await idbPut('projects', p);
        currentProjectId = p.id;
        await loadProjects();
        renderProjectSelect();

        // Clean references + studies for safety
        const oldRefs = await idbGetAll('references', 'projectId', currentProjectId);
        for (const r of oldRefs) await idbDelete('references', r.id);
        const oldStudies = await idbGetAll('studies', 'projectId', currentProjectId);
        for (const s of oldStudies) await idbDelete('studies', s.id);
        allReferences = [];
        extractedStudies = [];

        // 1) Discover
        mark('start_discover');
        switchPhase('discover');
        await humanPause(500, 1100);
        // Avoid remote fetch latency in benchmark mode: seed universe from embedded payload.
        if (!Array.isArray(universeTrialsCache) || universeTrialsCache.length === 0) {
          if (typeof EMBEDDED_AL_BURHAN_DATA !== 'undefined' &&
              EMBEDDED_AL_BURHAN_DATA &&
              Array.isArray(EMBEDDED_AL_BURHAN_DATA.clusters)) {
            const seeded = [];
            const seen = new Set();
            for (const c of EMBEDDED_AL_BURHAN_DATA.clusters) {
              for (const st of (c.studies || [])) {
                const nct = String(st.nct_id || '').toUpperCase();
                if (!nct || seen.has(nct)) continue;
                seen.add(nct);
                seeded.push({
                  nctId: nct,
                  title: st.title || '',
                  enrollment: st.enrollment || 0,
                  phase: st.phase || null,
                  startYear: st.start_date ? parseInt(String(st.start_date).slice(0, 4), 10) : null,
                  source: 'embedded',
                  subcategory: c.subcategory || 'general',
                  interventions: (c.interventions || []).slice(0, 3),
                  primaryOutcomes: [c.outcome || 'cardiovascular outcome']
                });
                if (seeded.length >= 280) break;
              }
              if (seeded.length >= 280) break;
            }
            universeTrialsCache = seeded;
          }
        }
        const subSel = document.getElementById('subcatSelect');
        if (subSel) subSel.value = persona.subcategory;
        await humanPause(600, 1400);
        mark('end_discover');

        // 2) Protocol
        mark('start_protocol');
        switchPhase('protocol');
        await humanPause(350, 800);
        const title = persona.I + ' versus ' + persona.C + ' in ' + persona.P;
        document.getElementById('protTitle').value = title;
        document.getElementById('protP').value = persona.P;
        document.getElementById('protI').value = persona.I;
        document.getElementById('protC').value = persona.C;
        document.getElementById('protO').value = persona.O;
        document.getElementById('protStudyType').value = 'RCTs only';
        document.getElementById('picoP').value = persona.P;
        document.getElementById('picoI').value = persona.I;
        document.getElementById('picoC').value = persona.C;
        document.getElementById('picoO').value = persona.O;
        savePICO();
        await humanPause(300, 700);
        generateProtocol();
        await humanPause(450, 900);
        const protText = document.getElementById('protocolOutput')?.textContent || '';
        const readinessMatch = protText.match(/Readiness:\s*(\d+)%/i);
        const protocolReadiness = readinessMatch ? parseInt(readinessMatch[1], 10) : 0;
        mark('end_protocol');

        // 3) Search + Screen setup (realistic noisy pool)
        mark('start_search_screen');
        switchPhase('search');
        await humanPause(250, 500);
        const refs = [];
        const rel = Math.max(10, Number(persona.relevant || 25));
        const irr = Math.max(20, Number(persona.irrelevant || 60));
        const dup = Math.max(0, Number(persona.duplicates || 15));
        const baseNct = 24000000 + Math.floor(Math.random() * 100000);

        const relAbs = 'Randomized double-blind placebo-controlled cardiovascular trial with registered NCT identifier and adjudicated outcomes.';
        const irrAbs = 'Observational oncology cohort with no randomization and no cardiology endpoint.';
        const sources = ['PubMed', 'ClinicalTrials.gov', 'OpenAlex', 'AACT'];

        for (let i = 0; i < rel; i++) {
          const nct = 'NCT' + String(baseNct + i);
          const source = sources[i % sources.length];
          refs.push({
            id: generateId(),
            projectId: currentProjectId,
            source,
            title: persona.I + ' randomized trial ' + i + ' in ' + persona.P + ' ' + nct,
            abstract: relAbs + ' Outcome: ' + persona.O,
            keywords: ['cardiology', 'randomized', 'trial', 'nct'],
            nctId: nct,
            decision: null
          });
        }

        for (let i = 0; i < irr; i++) {
          refs.push({
            id: generateId(),
            projectId: currentProjectId,
            source: (i % 2 === 0 ? 'OpenAlex' : 'PubMed'),
            title: 'Oncology registry cohort ' + i,
            abstract: irrAbs,
            keywords: ['oncology', 'cohort'],
            decision: null
          });
        }

        for (let i = 0; i < dup; i++) {
          const src = refs[i % rel];
          refs.push({
            id: generateId(),
            projectId: currentProjectId,
            source: (src.source === 'OpenAlex' ? 'PubMed' : 'OpenAlex'),
            title: src.title,
            abstract: src.abstract,
            keywords: src.keywords,
            nctId: src.nctId,
            decision: null
          });
        }

        // One pass of cross-source dedup before import to mimic real user workflow
        allReferences = dedupSearchResults(refs);
        for (const r of allReferences) {
          if (_cardioRCTMode) enrichReferenceForCardioScreen(r);
          await idbPut('references', r);
        }
        renderSearchResultsList();
        await humanPause(450, 900);

        switchPhase('screen');
        document.getElementById('cardioRCTToggle').checked = true;
        _cardioRCTMode = true;
        document.getElementById('strictRecallToggle').checked = true;
        document.getElementById('clusterFirstToggle').checked = true;
        document.getElementById('clusterPropagateToggle').checked = true;
        document.getElementById('targetReviewRate').value = '15';
        await humanPause(250, 600);

        await runAutoScreen();
        await humanPause(300, 650);
        const asInc = parseInt(document.getElementById('asIncCount')?.textContent || '0', 10);
        const asExc = parseInt(document.getElementById('asExcCount')?.textContent || '0', 10);
        const asRev = parseInt(document.getElementById('asRevCount')?.textContent || '0', 10);
        const queueStats = (typeof _lastQueueCompression === 'object' && _lastQueueCompression) ? _lastQueueCompression : estimateNeedsReviewCompression(allReferences);
        acceptAutoDecisions();

        // Manual triage simulation on representatives only
        await humanPause(220, 400);
        showRankedReviewQueue();
        const pending = allReferences.filter(r => !r.decision);
        const manualCap = Math.min(Math.max(6, Number(persona.manualCap || 14)), pending.length);
        let manualReviewed = 0;
        for (const ref of pending.slice(0, manualCap)) {
          const score = autoScreenScores[ref.id];
          const pInc = score ? (score.pInclude ?? 0.5) : 0.5;
          const decision = pInc >= 0.55 ? 'include' : 'exclude';
          await applyDecisionToCluster(ref.id, decision, {
            asAutoScreened: false,
            reason: 'human simulated adjudication',
            silent: true,
            skipRerender: true,
            forceOverride: true
          });
          manualReviewed++;
          await humanPause(120, 260);
        }
        await renderReferenceList();
        mark('end_search_screen');

        // 4) Extract + Verify
        mark('start_extract_verify');
        switchPhase('extract');
        await humanPause(250, 520);

        // Seed from universe where possible for realistic CT.gov verification
        const universe = (Array.isArray(universeTrialsCache) ? universeTrialsCache : [])
          .filter(t => t && t.nctId && (!persona.subcategory || persona.subcategory === 'general' || t.subcategory === persona.subcategory));

        const kTarget = Math.max(6, Math.min(14, Math.round(rel / 3)));
        for (let i = 0; i < kTarget; i++) {
          const tRow = universe[i] || {};
          const nct = tRow.nctId || ('NCT' + String(baseNct + 500 + i));
          const nTotal = tRow.enrollment || (360 + i * 22);
          const eff = 0.78 + (i * 0.015);
          addStudyRow({
            authorYear: 'Trial ' + (i + 1) + ' 20' + (14 + (i % 8)),
            trialId: nct,
            nctId: nct,
            outcomeId: persona.O,
            timepoint: '12 months',
            analysisPopulation: 'ITT',
            nTotal,
            nIntervention: Math.floor(nTotal / 2),
            nControl: Math.ceil(nTotal / 2),
            effectEstimate: eff,
            lowerCI: Math.max(0.2, eff - 0.09),
            upperCI: eff + 0.09,
            effectType: 'OR',
            verificationStatus: 'needs-check'
          });
          await humanPause(60, 140);
        }

        autoVerifyRegistryMatches();
        await humanPause(250, 500);
        const verificationCounts = (extractedStudies || []).reduce((acc, s) => {
          const v = s.verificationStatus || 'unverified';
          acc[v] = (acc[v] || 0) + 1;
          return acc;
        }, { verified: 0, 'needs-check': 0, unverified: 0 });
        mark('end_extract_verify');

        // 5) Analyze
        mark('start_analyze');
        switchPhase('analyze');
        const methodEl = document.getElementById('methodSelect');
        if (methodEl) methodEl.value = 'DL-HKSJ';
        const confEl = document.getElementById('confLevelSelect');
        if (confEl) confEl.value = '0.95';
        await humanPause(180, 360);
        await runAnalysis();
        await humanPause(180, 360);
        const analysis = lastAnalysisResult || null;
        mark('end_analyze');

        // 6) Write
        mark('start_write');
        switchPhase('write');
        await humanPause(120, 260);
        await generatePaper();
        await humanPause(100, 220);
        const paperText = window._lastFullText || '';
        const methodsResultsOnly = /## Methods/.test(paperText) && /## Results/.test(paperText) && !/## Introduction/.test(paperText) && !/## Discussion/.test(paperText);
        mark('end_write');
        mark('end_total');

        const totalRefs = allReferences.length;
        const decided = allReferences.filter(r => !!r.decision).length;
        const autoDecisionRate = totalRefs > 0 ? (asInc + asExc) / totalRefs : 0;
        const includeCount = allReferences.filter(r => r.decision === 'include').length;
        const verifyTotal = extractedStudies.length;
        const verifiedRatio = verifyTotal > 0 ? ((verificationCounts.verified || 0) / verifyTotal) : 0;

        const issues = [];
        const reps = Number(queueStats?.representatives || asRev || 0);
        if (reps > 22) {
          issues.push({ code: 'high_conflict_queue', severity: 'high', detail: reps + ' representative conflicts remain after auto-screen' });
        } else if (reps > 14) {
          issues.push({ code: 'moderate_conflict_queue', severity: 'medium', detail: reps + ' representative conflicts remain after auto-screen' });
        }
        if (autoDecisionRate < 0.70) {
          issues.push({ code: 'low_auto_decision_rate', severity: 'high', detail: 'Auto-decision rate ' + (autoDecisionRate * 100).toFixed(1) + '%' });
        }
        if (protocolReadiness < 85) {
          issues.push({ code: 'protocol_not_registration_ready', severity: 'high', detail: 'Protocol readiness ' + protocolReadiness + '%' });
        }
        if (verifiedRatio < 0.75) {
          issues.push({ code: 'verification_burden_high', severity: 'medium', detail: 'Verified ratio ' + (verifiedRatio * 100).toFixed(1) + '%' });
        }
        if ((analysis?.k || 0) < 5) {
          issues.push({ code: 'insufficient_meta_volume', severity: 'medium', detail: 'k=' + (analysis?.k || 0) });
        }
        if (!methodsResultsOnly) {
          issues.push({ code: 'paper_scope_drift', severity: 'medium', detail: 'Generated draft includes out-of-scope sections' });
        }

        done({
          ok: true,
          persona: persona.name,
          timings: {
            discover_sec: sec('start_discover', 'end_discover'),
            protocol_sec: sec('start_protocol', 'end_protocol'),
            search_screen_sec: sec('start_search_screen', 'end_search_screen'),
            extract_verify_sec: sec('start_extract_verify', 'end_extract_verify'),
            analyze_sec: sec('start_analyze', 'end_analyze'),
            write_sec: sec('start_write', 'end_write'),
            total_sec: sec('start_total', 'end_total')
          },
          protocol_readiness_pct: protocolReadiness,
          references_total: totalRefs,
          references_decided: decided,
          included_after_screening: includeCount,
          auto_include: asInc,
          auto_exclude: asExc,
          needs_review: asRev,
          auto_decision_rate: autoDecisionRate,
          queue: {
            representatives: Number(queueStats?.representatives || 0),
            clusters: Number(queueStats?.clusters || 0),
            multi_clusters: Number(queueStats?.multiClusters || 0),
            saved_checks: Number(queueStats?.saved || 0),
            saved_pct: Number(queueStats?.savedPct || 0)
          },
          manual_reviewed: manualReviewed,
          extraction_k: verifyTotal,
          verification: verificationCounts,
          verified_ratio: verifiedRatio,
          analysis_k: Number(analysis?.k || 0),
          methods_results_only: methodsResultsOnly,
          issues
        });
      } catch (e) {
        done({ ok: false, persona: persona.name, error: String(e && e.message || e) });
      }
    })();
    """

    return driver.execute_async_script(script, payload, pace_scale)


def percentile(values: List[float], q: float) -> float:
    if not values:
        return 0.0
    xs = sorted(values)
    idx = max(0, min(len(xs) - 1, int(round((len(xs) - 1) * q))))
    return xs[idx]


def summarize(results: List[Dict[str, Any]], started: float) -> Dict[str, Any]:
    ok_rows = [r for r in results if r.get("ok")]
    failed = [r for r in results if not r.get("ok")]

    totals = [r["timings"]["total_sec"] for r in ok_rows]
    auto_rates = [r.get("auto_decision_rate", 0.0) for r in ok_rows]
    reps = [r.get("queue", {}).get("representatives", 0) for r in ok_rows]
    verified = [r.get("verified_ratio", 0.0) for r in ok_rows]
    readiness = [r.get("protocol_readiness_pct", 0) for r in ok_rows]

    issue_freq: Dict[str, int] = {}
    for r in ok_rows:
        for issue in (r.get("issues") or []):
            code = issue.get("code", "unknown")
            issue_freq[code] = issue_freq.get(code, 0) + 1

    publication_ready_count = 0
    for r in ok_rows:
        no_high = all(i.get("severity") != "high" for i in (r.get("issues") or []))
        fast_enough = r.get("timings", {}).get("total_sec", 99999) <= 3600
        if no_high and fast_enough and (r.get("analysis_k", 0) >= 5) and r.get("methods_results_only"):
            publication_ready_count += 1

    return {
        "timestamp_utc": datetime.now(timezone.utc).isoformat(),
        "personas_total": len(results),
        "personas_ok": len(ok_rows),
        "personas_failed": len(failed),
        "publication_ready_count": publication_ready_count,
        "publication_ready_rate": (publication_ready_count / len(ok_rows)) if ok_rows else 0.0,
        "timing": {
            "mean_total_sec": statistics.mean(totals) if totals else 0.0,
            "median_total_sec": statistics.median(totals) if totals else 0.0,
            "p90_total_sec": percentile(totals, 0.9),
            "max_total_sec": max(totals) if totals else 0.0,
        },
        "screening": {
            "mean_auto_decision_rate": statistics.mean(auto_rates) if auto_rates else 0.0,
            "mean_queue_representatives": statistics.mean(reps) if reps else 0.0,
            "p90_queue_representatives": percentile([float(x) for x in reps], 0.9),
        },
        "quality": {
            "mean_protocol_readiness_pct": statistics.mean(readiness) if readiness else 0.0,
            "mean_verified_ratio": statistics.mean(verified) if verified else 0.0,
        },
        "issue_frequency": dict(sorted(issue_freq.items(), key=lambda kv: kv[1], reverse=True)),
        "elapsed_wall_sec": round(time.time() - started, 2),
    }


def write_markdown(summary: Dict[str, Any], results: List[Dict[str, Any]]) -> str:
    lines = [
        "# Human-Rate 12-User Selenium Benchmark",
        "",
        "## Summary",
        f"- Personas simulated: {summary['personas_ok']}/{summary['personas_total']} successful",
        f"- Publication-ready runs (<= 60 min, no high-severity blockers): {summary['publication_ready_count']} ({summary['publication_ready_rate']*100:.1f}%)",
        f"- Mean total time: {summary['timing']['mean_total_sec']:.1f}s",
        f"- Median total time: {summary['timing']['median_total_sec']:.1f}s",
        f"- P90 total time: {summary['timing']['p90_total_sec']:.1f}s",
        f"- Mean auto-decision rate: {summary['screening']['mean_auto_decision_rate']*100:.1f}%",
        f"- Mean conflict representatives: {summary['screening']['mean_queue_representatives']:.1f}",
        f"- Mean protocol readiness: {summary['quality']['mean_protocol_readiness_pct']:.1f}%",
        f"- Mean verified ratio: {summary['quality']['mean_verified_ratio']*100:.1f}%",
        "",
        "## Most Frequent Issues",
    ]

    if summary["issue_frequency"]:
        for code, count in summary["issue_frequency"].items():
            lines.append(f"- `{code}`: {count}")
    else:
        lines.append("- None")

    lines.extend(["", "## Persona Results"])
    for row in results:
        if not row.get("ok"):
            lines.append(f"- {row.get('persona')}: ERROR - {row.get('error', 'unknown')}" )
            continue
        t = row.get("timings", {})
        issues = row.get("issues") or []
        issue_text = "; ".join(i.get("code", "unknown") for i in issues) if issues else "none"
        lines.append(
            "- "
            + row.get("persona", "unknown")
            + f": total={t.get('total_sec', 0):.1f}s, auto={row.get('auto_decision_rate', 0)*100:.1f}%, "
            + f"queue_reps={row.get('queue', {}).get('representatives', 0)}, verified={row.get('verified_ratio', 0)*100:.1f}%, "
            + f"readiness={row.get('protocol_readiness_pct', 0)}%, issues={issue_text}"
        )

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
    results: List[Dict[str, Any]] = []
    try:
        load_app(driver)
        for idx, persona in enumerate(PERSONAS, start=1):
            row = run_persona(driver, persona, pace_scale)
            results.append(row)
            if not row.get("ok"):
                print(f"ERROR {idx:02d}/12 {persona.name}: {row.get('error', 'unknown')}")
                continue
            timing = row.get("timings", {})
            print(
                f"OK {idx:02d}/12 {persona.name}: "
                f"total={timing.get('total_sec', 0):.1f}s, "
                f"auto={row.get('auto_decision_rate', 0)*100:.1f}%, "
                f"queue={row.get('queue', {}).get('representatives', 0)}, "
                f"verified={row.get('verified_ratio', 0)*100:.1f}%, "
                f"issues={len(row.get('issues') or [])}"
            )
    finally:
        driver.quit()

    summary = summarize(results, started)
    report = {
        "summary": summary,
        "personas": [p.__dict__ for p in PERSONAS],
        "results": results,
    }

    with open(REPORT_JSON, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)
    md = write_markdown(summary, results)
    with open(REPORT_MD, "w", encoding="utf-8") as f:
        f.write(md)

    print(
        f"SUMMARY ok={summary['personas_ok']}/{summary['personas_total']} "
        f"pub_ready={summary['publication_ready_count']} "
        f"mean_total={summary['timing']['mean_total_sec']:.1f}s "
        f"mean_auto={summary['screening']['mean_auto_decision_rate']*100:.1f}% "
        f"mean_queue={summary['screening']['mean_queue_representatives']:.1f}"
    )
    print(f"Report written: {REPORT_JSON}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
