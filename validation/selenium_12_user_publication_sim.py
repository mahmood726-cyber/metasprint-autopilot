#!/usr/bin/env python3
"""12-user Selenium simulation for publication-readiness workflow.

Runs 12 cardiology user personas through:
protocol -> screening -> extraction/verification -> analysis -> write.
Outputs a readiness report JSON in validation/reports/.
"""

from __future__ import annotations

import json
import os
import statistics
import time
from datetime import datetime, timezone

from selenium import webdriver
from selenium.webdriver.chrome.options import Options

from browser_runtime import ensure_local_browser_libs


PROJECT_ROOT = os.path.normpath(os.path.join(os.path.dirname(__file__), ".."))
HTML_PATH = os.path.join(PROJECT_ROOT, "metasprint-autopilot.html")
REPORT_DIR = os.path.join(PROJECT_ROOT, "validation", "reports")
REPORT_PATH = os.path.join(REPORT_DIR, "selenium_12_user_publication_sim_report.json")


PERSONAS = [
    {"name": "Interventional Cardiology Fellow", "P": "Adults with acute coronary syndrome", "I": "ticagrelor", "C": "clopidogrel", "O": "major adverse cardiovascular events"},
    {"name": "Heart Failure Consultant", "P": "Adults with heart failure with reduced ejection fraction", "I": "empagliflozin", "C": "placebo", "O": "cardiovascular death or heart failure hospitalization"},
    {"name": "EP Registrar", "P": "Adults with atrial fibrillation", "I": "apixaban", "C": "warfarin", "O": "stroke or systemic embolism"},
    {"name": "Hypertension Research Nurse", "P": "Adults with resistant hypertension", "I": "renal denervation", "C": "sham procedure", "O": "24-hour systolic blood pressure"},
    {"name": "Lipid Clinic Pharmacist", "P": "Adults with atherosclerotic cardiovascular disease", "I": "inclisiran", "C": "standard care", "O": "LDL cholesterol reduction"},
    {"name": "Pulmonary Hypertension Lead", "P": "Adults with pulmonary arterial hypertension", "I": "selexipag", "C": "placebo", "O": "clinical worsening"},
    {"name": "Stroke Prevention Fellow", "P": "Adults with non-valvular atrial fibrillation", "I": "edoxaban", "C": "warfarin", "O": "ischemic stroke"},
    {"name": "General Cardiology Registrar", "P": "Adults with chronic coronary syndrome", "I": "rivaroxaban", "C": "aspirin alone", "O": "composite cardiovascular events"},
    {"name": "Valve Disease Investigator", "P": "Adults after transcatheter aortic valve implantation", "I": "direct oral anticoagulants", "C": "vitamin K antagonists", "O": "major bleeding"},
    {"name": "Preventive Cardiology Fellow", "P": "Adults at high cardiovascular risk", "I": "high-intensity statin", "C": "moderate-intensity statin", "O": "myocardial infarction"},
    {"name": "Academic Meta-Analyst", "P": "Adults with heart failure", "I": "SGLT2 inhibitors", "C": "placebo", "O": "all-cause mortality"},
    {"name": "Journal Methods Reviewer", "P": "Adults with cardiovascular disease", "I": "antiplatelet therapy", "C": "standard care", "O": "major bleeding and ischemic events"},
]


def create_driver() -> webdriver.Chrome:
    opts = Options()
    opts.add_argument("--headless=new")
    opts.add_argument("--no-sandbox")
    opts.add_argument("--disable-dev-shm-usage")
    opts.add_argument("--disable-gpu")
    opts.add_argument("--window-size=1920,1080")
    return webdriver.Chrome(options=opts)


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


def run_persona(driver: webdriver.Chrome, persona: dict) -> dict:
    script = """
    const persona = arguments[0];
    const done = arguments[arguments.length - 1];
    (async () => {
      try {
        await new Promise(r => setTimeout(r, 400));
        if (!currentProjectId || !projects || projects.length === 0) {
          await new Promise(r => setTimeout(r, 1200));
        }
        const project = projects.find(p => p.id === currentProjectId) || projects[0];
        if (!project) throw new Error('No active project');
        currentProjectId = project.id;

        const oldRefs = await idbGetAll('references', 'projectId', currentProjectId);
        for (const r of oldRefs) await idbDelete('references', r.id);
        const oldStudies = await idbGetAll('studies', 'projectId', currentProjectId);
        for (const s of oldStudies) await idbDelete('studies', s.id);
        allReferences = [];
        extractedStudies = [];

        switchPhase('protocol');
        document.getElementById('protTitle').value = persona.I + ' versus ' + persona.C + ' in ' + persona.P;
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
        generateProtocol();

        const refs = [];
        const cardioText = 'Randomized double-blind trial in cardiology with placebo control and NCT registration.';
        const nonCardioText = 'Observational oncology cohort study with no randomized design.';
        for (let i = 0; i < 18; i++) {
          refs.push({
            id: generateId(),
            projectId: currentProjectId,
            source: i % 2 === 0 ? 'PubMed' : 'ClinicalTrials.gov',
            title: persona.I + ' trial ' + i + ' in ' + persona.P + ' NCT20' + String(100000 + i),
            abstract: cardioText + ' Outcome: ' + persona.O,
            keywords: ['cardiology', 'randomized', 'trial'],
            nctId: 'NCT' + String(21000000 + i),
          });
        }
        for (let i = 0; i < 8; i++) {
          refs.push({
            id: generateId(),
            projectId: currentProjectId,
            source: 'OpenAlex',
            title: 'Duplicate ' + persona.I + ' trial ' + i + ' in ' + persona.P,
            abstract: cardioText + ' Outcome: ' + persona.O,
            keywords: ['cardiology', 'randomized', 'trial']
          });
        }
        for (let i = 0; i < 12; i++) {
          refs.push({
            id: generateId(),
            projectId: currentProjectId,
            source: 'CrossRef',
            title: 'Cancer registry cohort ' + i,
            abstract: nonCardioText,
            keywords: ['oncology']
          });
        }
        allReferences = refs;
        for (const r of refs) await idbPut('references', r);
        await renderReferenceList();

        switchPhase('screen');
        document.getElementById('cardioRCTToggle').checked = true;
        _cardioRCTMode = true;
        document.getElementById('strictRecallToggle').checked = true;
        document.getElementById('clusterFirstToggle').checked = true;
        document.getElementById('clusterPropagateToggle').checked = true;
        await runAutoScreen();
        const inc = parseInt(document.getElementById('asIncCount').textContent || '0', 10);
        const exc = parseInt(document.getElementById('asExcCount').textContent || '0', 10);
        const rev = parseInt(document.getElementById('asRevCount').textContent || '0', 10);
        const queueText = document.getElementById('asQueueStats')?.textContent || '';
        acceptAutoDecisions();

        switchPhase('extract');
        if ((!Array.isArray(universeTrialsCache) || universeTrialsCache.length === 0) &&
            typeof EMBEDDED_AL_BURHAN_DATA !== 'undefined' && EMBEDDED_AL_BURHAN_DATA && Array.isArray(EMBEDDED_AL_BURHAN_DATA.clusters)) {
          const seeded = [];
          const seen = new Set();
          for (const c of EMBEDDED_AL_BURHAN_DATA.clusters.slice(0, 60)) {
            for (const st of (c.studies || [])) {
              if (st.nct_id && !seen.has(st.nct_id)) {
                seen.add(st.nct_id);
                seeded.push({
                  nctId: st.nct_id,
                  title: st.title || '',
                  enrollment: st.enrollment || 0,
                  subcategory: c.subcategory || 'general',
                  primaryOutcomes: [c.outcome || '']
                });
              }
              if (seeded.length >= 20) break;
            }
            if (seeded.length >= 20) break;
          }
          if (seeded.length > 0) universeTrialsCache = seeded;
        }
        const universe = (Array.isArray(universeTrialsCache) ? universeTrialsCache : []).filter(t => t && t.nctId).slice(0, 9);
        for (let i = 0; i < 8; i++) {
          const t = universe[i] || {};
          const effect = 0.82 + i * 0.02;
          const trialOutcome = Array.isArray(t.primaryOutcomes) && t.primaryOutcomes.length > 0
            ? String(t.primaryOutcomes[0]).slice(0, 160)
            : persona.O;
          addStudyRow({
            authorYear: 'Trial ' + (i + 1) + ' 20' + (12 + i),
            trialId: t.nctId || ('NCT' + String(30000000 + i)),
            nctId: t.nctId || ('NCT' + String(30000000 + i)),
            outcomeId: trialOutcome,
            timepoint: '12 months',
            analysisPopulation: 'ITT',
            nTotal: t.enrollment || (420 + i * 25),
            nIntervention: Math.floor((t.enrollment || (420 + i * 25)) / 2),
            nControl: Math.ceil((t.enrollment || (420 + i * 25)) / 2),
            effectEstimate: effect,
            lowerCI: effect - 0.09,
            upperCI: effect + 0.09,
            effectType: 'OR',
            verificationStatus: 'needs-check'
          });
        }
        autoVerifyRegistryMatches();
        for (const s of extractedStudies) {
          s.outcomeId = persona.O;
          s.timepoint = '12 months';
          saveStudy(s);
        }
        renderExtractTable();
        await runAnalysis();
        await generatePaper();

        const readinessMatch = (document.getElementById('protocolOutput')?.textContent || '').match(/Readiness:\\s*(\\d+)%/i);
        const readiness = readinessMatch ? parseInt(readinessMatch[1], 10) : 0;
        const reductionMatch = queueText.match(/(\\d+)% reduction/i);
        const reductionPct = reductionMatch ? parseInt(reductionMatch[1], 10) : 0;
        const verified = extractedStudies.filter(s => (s.verificationStatus || '') === 'verified').length;
        const totalStudies = extractedStudies.length;
        const verifiedRatio = totalStudies > 0 ? (verified / totalStudies) : 0;
        const paperText = window._lastFullText || '';
        const hasMethods = /## Methods/.test(paperText);
        const hasResults = /## Results/.test(paperText);
        const hasIntro = /## Introduction/.test(paperText);
        const hasDiscussion = /## Discussion/.test(paperText);
        const methodsResultsOnly = hasMethods && hasResults && !hasIntro && !hasDiscussion;
        const analysisK = lastAnalysisResult ? (lastAnalysisResult.k || 0) : 0;
        const autoDecisionRate = refs.length > 0 ? ((inc + exc) / refs.length) : 0;
        done({
          ok: true,
          persona: persona.name,
          protocol_readiness_pct: readiness,
          auto_include: inc,
          auto_exclude: exc,
          needs_review: rev,
          auto_decision_rate: autoDecisionRate,
          conflict_reduction_pct: reductionPct,
          verified_studies: verified,
          total_studies: totalStudies,
          verified_ratio: verifiedRatio,
          analysis_k: analysisK,
          methods_results_only: methodsResultsOnly
        });
      } catch (e) {
        done({ ok: false, persona: persona.name, error: String(e && e.message || e) });
      }
    })();
    """
    return driver.execute_async_script(script, persona)


def score_result(res: dict) -> dict:
    checks = {
        "protocol_readiness": res.get("protocol_readiness_pct", 0) >= 80,
        "auto_decisions": res.get("auto_decision_rate", 0) >= 0.55,
        "reduced_conflicts": (res.get("conflict_reduction_pct", 0) >= 15) or (res.get("needs_review", 999) <= 8),
        "verification_ratio": res.get("verified_ratio", 0) >= 0.70,
        "analysis_volume": res.get("analysis_k", 0) >= 5,
        "methods_results_only": bool(res.get("methods_results_only")),
    }
    passed = sum(1 for v in checks.values() if v)
    res["criteria"] = checks
    res["criteria_passed"] = passed
    res["pass"] = passed >= 5
    return res


def main() -> int:
    runtime = ensure_local_browser_libs(auto_download=True)
    if not runtime.get("ok"):
        print(f"ERROR: browser runtime unavailable: {runtime.get('reason')}")
        return 2

    os.makedirs(REPORT_DIR, exist_ok=True)
    driver = create_driver()
    try:
        load_app(driver)
        results = []
        for idx, persona in enumerate(PERSONAS, 1):
            res = score_result(run_persona(driver, persona))
            results.append(res)
            status = "PASS" if res.get("pass") else "FAIL"
            print(
                f"{status} {idx:02d}/12 {persona['name']}: "
                f"readiness={res.get('protocol_readiness_pct', 0)}%, "
                f"auto={res.get('auto_decision_rate', 0)*100:.1f}%, "
                f"verify={res.get('verified_ratio', 0)*100:.1f}%, "
                f"k={res.get('analysis_k', 0)}, "
                f"criteria={res.get('criteria_passed', 0)}/6"
            )

        pass_count = sum(1 for r in results if r.get("pass"))
        readiness_vals = [r.get("protocol_readiness_pct", 0) for r in results if r.get("ok")]
        auto_vals = [r.get("auto_decision_rate", 0) for r in results if r.get("ok")]
        verify_vals = [r.get("verified_ratio", 0) for r in results if r.get("ok")]

        summary = {
            "timestamp_utc": datetime.now(timezone.utc).isoformat(),
            "personas_total": len(PERSONAS),
            "personas_passed": pass_count,
            "pass_rate": (pass_count / len(PERSONAS)) if PERSONAS else 0.0,
            "mean_protocol_readiness_pct": statistics.mean(readiness_vals) if readiness_vals else 0.0,
            "mean_auto_decision_rate": statistics.mean(auto_vals) if auto_vals else 0.0,
            "mean_verified_ratio": statistics.mean(verify_vals) if verify_vals else 0.0,
            "moderate_journal_ready": pass_count >= 10,
        }
        report = {"summary": summary, "results": results}
        with open(REPORT_PATH, "w", encoding="utf-8") as f:
            json.dump(report, f, indent=2)

        print(
            f"SUMMARY pass={summary['personas_passed']}/{summary['personas_total']} "
            f"({summary['pass_rate']*100:.1f}%), "
            f"mean_readiness={summary['mean_protocol_readiness_pct']:.1f}%, "
            f"mean_auto={summary['mean_auto_decision_rate']*100:.1f}%, "
            f"mean_verify={summary['mean_verified_ratio']*100:.1f}%"
        )
        print(f"Report written: {REPORT_PATH}")
        return 0 if summary["moderate_journal_ready"] else 1
    finally:
        driver.quit()


if __name__ == "__main__":
    raise SystemExit(main())
