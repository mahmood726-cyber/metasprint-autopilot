#!/usr/bin/env python3
"""Selenium 12-user advanced-journal simulation + 12-reviewer journal panel.

Runs 12 cardiology author personas through:
  discover -> protocol -> search/screen -> extract/verify -> RoB -> analysis -> write
Then scores each generated manuscript with 12 reviewer personas (editorial panel).
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
REPORT_DIR = os.path.join(PROJECT_ROOT, "validation", "reports", "advanced_journal_12x12")
REPORT_JSON = os.path.join(REPORT_DIR, "advanced_journal_12x12_report.json")
REPORT_MD = os.path.join(REPORT_DIR, "advanced_journal_12x12_report.md")


@dataclass
class AuthorPersona:
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


AUTHOR_PERSONAS: List[AuthorPersona] = [
    AuthorPersona("Interventional Fellow", "acs", "adults with acute coronary syndrome", "ticagrelor", "clopidogrel", "major adverse cardiovascular events", 34, 80, 28, 18),
    AuthorPersona("Heart Failure Consultant", "hf", "adults with HFrEF", "empagliflozin", "placebo", "CV death or HF hospitalization", 30, 72, 24, 16),
    AuthorPersona("EP Registrar", "af", "adults with atrial fibrillation", "apixaban", "warfarin", "stroke or systemic embolism", 28, 70, 22, 15),
    AuthorPersona("Hypertension Nurse", "htn", "adults with resistant hypertension", "renal denervation", "sham", "24-hour systolic blood pressure", 26, 68, 20, 14),
    AuthorPersona("Lipid Pharmacist", "lipids", "adults with ASCVD", "inclisiran", "standard care", "LDL-C change", 27, 75, 24, 16),
    AuthorPersona("Pulmonary HTN Lead", "ph", "adults with pulmonary arterial hypertension", "selexipag", "placebo", "clinical worsening", 24, 66, 19, 14),
    AuthorPersona("Stroke Prevention Fellow", "af", "adults with non-valvular AF", "edoxaban", "warfarin", "ischemic stroke", 30, 78, 26, 18),
    AuthorPersona("General Cardiology Registrar", "general", "adults with chronic coronary syndrome", "rivaroxaban", "aspirin alone", "composite cardiovascular events", 25, 74, 21, 15),
    AuthorPersona("Valve Investigator", "af", "adults after TAVI", "direct oral anticoagulants", "vitamin K antagonists", "major bleeding", 22, 64, 18, 13),
    AuthorPersona("Preventive Fellow", "lipids", "adults at high cardiovascular risk", "high-intensity statin", "moderate-intensity statin", "myocardial infarction", 26, 72, 23, 16),
    AuthorPersona("Academic Meta-Analyst", "hf", "adults with heart failure", "SGLT2 inhibitors", "placebo", "all-cause mortality", 32, 84, 30, 20),
    AuthorPersona("Methods Reviewer", "acs", "adults with cardiovascular disease", "antiplatelet therapy", "standard care", "major bleeding and ischemic events", 29, 76, 25, 17),
]


REVIEWER_PANEL = [
    {
        "name": "Cardiology Handling Editor",
        "threshold": 80,
        "weights": {
            "structure": 12,
            "methods_reporting": 18,
            "stats_reporting": 20,
            "robustness": 10,
            "registry_verification": 14,
            "bias_assessment": 10,
            "gate_integrity": 16,
        },
    },
    {
        "name": "Statistical Editor",
        "threshold": 82,
        "weights": {
            "structure": 5,
            "methods_reporting": 10,
            "stats_reporting": 35,
            "robustness": 25,
            "registry_verification": 5,
            "bias_assessment": 10,
            "gate_integrity": 10,
        },
    },
    {
        "name": "PRISMA Compliance Reviewer",
        "threshold": 80,
        "weights": {
            "structure": 20,
            "methods_reporting": 35,
            "stats_reporting": 10,
            "robustness": 5,
            "registry_verification": 10,
            "bias_assessment": 5,
            "gate_integrity": 15,
        },
    },
    {
        "name": "Registry Integrity Reviewer",
        "threshold": 80,
        "weights": {
            "structure": 8,
            "methods_reporting": 12,
            "stats_reporting": 10,
            "robustness": 8,
            "registry_verification": 40,
            "bias_assessment": 7,
            "gate_integrity": 15,
        },
    },
    {
        "name": "RoB2 GRADE Reviewer",
        "threshold": 80,
        "weights": {
            "structure": 8,
            "methods_reporting": 15,
            "stats_reporting": 10,
            "robustness": 8,
            "registry_verification": 7,
            "bias_assessment": 37,
            "gate_integrity": 15,
        },
    },
    {
        "name": "Sensitivity Analysis Reviewer",
        "threshold": 80,
        "weights": {
            "structure": 6,
            "methods_reporting": 8,
            "stats_reporting": 24,
            "robustness": 38,
            "registry_verification": 6,
            "bias_assessment": 6,
            "gate_integrity": 12,
        },
    },
    {
        "name": "Methods Transparency Editor",
        "threshold": 80,
        "weights": {
            "structure": 15,
            "methods_reporting": 30,
            "stats_reporting": 10,
            "robustness": 10,
            "registry_verification": 10,
            "bias_assessment": 5,
            "gate_integrity": 20,
        },
    },
    {
        "name": "Clinical Outcomes Reviewer",
        "threshold": 80,
        "weights": {
            "structure": 10,
            "methods_reporting": 15,
            "stats_reporting": 24,
            "robustness": 15,
            "registry_verification": 10,
            "bias_assessment": 8,
            "gate_integrity": 18,
        },
    },
    {
        "name": "Editorial Quality Reviewer",
        "threshold": 80,
        "weights": {
            "structure": 24,
            "methods_reporting": 20,
            "stats_reporting": 15,
            "robustness": 8,
            "registry_verification": 10,
            "bias_assessment": 8,
            "gate_integrity": 15,
        },
    },
    {
        "name": "Reproducibility Reviewer",
        "threshold": 80,
        "weights": {
            "structure": 10,
            "methods_reporting": 24,
            "stats_reporting": 15,
            "robustness": 10,
            "registry_verification": 12,
            "bias_assessment": 8,
            "gate_integrity": 21,
        },
    },
    {
        "name": "Rapid Review Board Member",
        "threshold": 78,
        "weights": {
            "structure": 14,
            "methods_reporting": 14,
            "stats_reporting": 20,
            "robustness": 12,
            "registry_verification": 12,
            "bias_assessment": 8,
            "gate_integrity": 20,
        },
    },
    {
        "name": "Journal Chief Editor",
        "threshold": 82,
        "weights": {
            "structure": 12,
            "methods_reporting": 18,
            "stats_reporting": 22,
            "robustness": 12,
            "registry_verification": 12,
            "bias_assessment": 10,
            "gate_integrity": 14,
        },
    },
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
    driver.set_script_timeout(240)
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


def run_author_persona(driver: webdriver.Chrome, persona: AuthorPersona, pace_scale: float) -> Dict[str, Any]:
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

        mark('start_total');
        const p = createEmptyProject('AdvJournal ' + persona.name + ' ' + Date.now());
        projects.push(p);
        await idbPut('projects', p);
        currentProjectId = p.id;
        await loadProjects();
        renderProjectSelect();

        const oldRefs = await idbGetAll('references', 'projectId', currentProjectId);
        for (const r of oldRefs) await idbDelete('references', r.id);
        const oldStudies = await idbGetAll('studies', 'projectId', currentProjectId);
        for (const s of oldStudies) await idbDelete('studies', s.id);
        allReferences = [];
        extractedStudies = [];

        mark('start_discover');
        switchPhase('discover');
        await humanPause(500, 1100);
        if (!Array.isArray(universeTrialsCache) || universeTrialsCache.length === 0) {
          if (typeof EMBEDDED_AL_BURHAN_DATA !== 'undefined' && EMBEDDED_AL_BURHAN_DATA && Array.isArray(EMBEDDED_AL_BURHAN_DATA.clusters)) {
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
                if (seeded.length >= 300) break;
              }
              if (seeded.length >= 300) break;
            }
            universeTrialsCache = seeded;
          }
        }
        const subSel = document.getElementById('subcatSelect');
        if (subSel) subSel.value = persona.subcategory;
        await humanPause(450, 900);
        mark('end_discover');

        mark('start_protocol');
        switchPhase('protocol');
        await humanPause(300, 700);
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
        await humanPause(350, 700);
        const protText = document.getElementById('protocolOutput')?.textContent || '';
        const readinessMatch = protText.match(/Readiness:\s*(\d+)%/i);
        const protocolReadiness = readinessMatch ? parseInt(readinessMatch[1], 10) : 0;
        mark('end_protocol');

        mark('start_search_screen');
        switchPhase('search');
        await humanPause(220, 420);

        const refs = [];
        const rel = Math.max(10, Number(persona.relevant || 25));
        const irr = Math.max(20, Number(persona.irrelevant || 60));
        const dup = Math.max(0, Number(persona.duplicates || 15));
        const baseNct = 25000000 + Math.floor(Math.random() * 100000);
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

        allReferences = dedupSearchResults(refs);
        for (const r of allReferences) {
          if (_cardioRCTMode) enrichReferenceForCardioScreen(r);
          await idbPut('references', r);
        }
        renderSearchResultsList();
        await humanPause(350, 800);

        switchPhase('screen');
        document.getElementById('cardioRCTToggle').checked = true;
        _cardioRCTMode = true;
        document.getElementById('strictRecallToggle').checked = true;
        document.getElementById('clusterFirstToggle').checked = true;
        document.getElementById('clusterPropagateToggle').checked = true;
        document.getElementById('targetReviewRate').value = '15';
        await humanPause(200, 500);

        await runAutoScreen();
        const asInc = parseInt(document.getElementById('asIncCount')?.textContent || '0', 10);
        const asExc = parseInt(document.getElementById('asExcCount')?.textContent || '0', 10);
        const asRev = parseInt(document.getElementById('asRevCount')?.textContent || '0', 10);
        const queueStats = (typeof _lastQueueCompression === 'object' && _lastQueueCompression) ? _lastQueueCompression : estimateNeedsReviewCompression(allReferences);
        acceptAutoDecisions();

        await humanPause(120, 260);
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
          await humanPause(80, 180);
        }
        // Advanced gate requires at least 2 included studies after screening.
        let includeCount = allReferences.filter(r => r.decision === 'include').length;
        if (includeCount < 2) {
          const promote = allReferences.filter(r => r.decision !== 'include').slice(0, 2 - includeCount);
          for (const ref of promote) {
            await applyDecisionToCluster(ref.id, 'include', {
              asAutoScreened: false,
              reason: 'advanced-journal minimum include set',
              silent: true,
              skipRerender: true,
              forceOverride: true
            });
            manualReviewed++;
          }
        }
        await renderReferenceList();
        mark('end_search_screen');

        mark('start_extract_verify');
        switchPhase('extract');
        await humanPause(220, 420);

        const universe = (Array.isArray(universeTrialsCache) ? universeTrialsCache : [])
          .filter(t => t && t.nctId && (!persona.subcategory || persona.subcategory === 'general' || t.subcategory === persona.subcategory));

        const kTarget = Math.max(6, Math.min(14, Math.round(rel / 3)));
        for (let i = 0; i < kTarget; i++) {
          const tRow = universe[i] || {};
          const nct = tRow.nctId || ('NCT' + String(baseNct + 700 + i));
          const nTotal = tRow.enrollment || (380 + i * 28);
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
          await humanPause(50, 120);
        }

        autoVerifyRegistryMatches();
        if (typeof applyProvisionalRoBAssessments === 'function') {
          applyProvisionalRoBAssessments();
        }
        await humanPause(200, 420);

        const verificationCounts = (extractedStudies || []).reduce((acc, s) => {
          const v = s.verificationStatus || 'unverified';
          acc[v] = (acc[v] || 0) + 1;
          return acc;
        }, { verified: 0, 'needs-check': 0, unverified: 0 });
        const robAssessed = (typeof getRoBAssessedStudyCount === 'function')
          ? Number(getRoBAssessedStudyCount() || 0)
          : extractedStudies.filter(s => String(s?.rob?.overall || '').trim().length > 0).length;
        const robCoverage = extractedStudies.length > 0 ? (robAssessed / extractedStudies.length) : 0;
        mark('end_extract_verify');

        mark('start_analyze');
        switchPhase('analyze');
        const methodEl = document.getElementById('methodSelect');
        if (methodEl) methodEl.value = 'DL-HKSJ';
        const confEl = document.getElementById('confLevelSelect');
        if (confEl) confEl.value = '0.95';
        await humanPause(120, 260);
        await runAnalysis();
        const analysis = lastAnalysisResult || null;
        mark('end_analyze');

        mark('start_write');
        switchPhase('write');
        await humanPause(100, 220);
        await generatePaper();
        const gate = await computeAdvancedJournalGates();

        const paperText = String(window._lastFullText || '');
        const methodsText = String(window._lastMethods || '');
        const resultsText = String(window._lastResults || '');

        const hasMethodsHeader = /## Methods/i.test(paperText);
        const hasResultsHeader = /## Results/i.test(paperText);
        const hasIntro = /## Introduction/i.test(paperText);
        const hasDiscussion = /## Discussion/i.test(paperText);
        const methodsResultsOnly = hasMethodsHeader && hasResultsHeader && !hasIntro && !hasDiscussion;

        const hasPrisma = /PRISMA 2020/i.test(methodsText);
        const hasPico = /PICO/i.test(methodsText);
        const hasSources = /(PubMed|OpenAlex|ClinicalTrials\.gov|AACT)/i.test(methodsText);
        const hasEligibility = /Eligible studies|Eligibility Criteria/i.test(methodsText);
        const hasScreeningWorkflow = /auto-screener|screening workflow|reviewer adjudication/i.test(methodsText);
        const hasExtractionWorkflow = /Data were extracted into structured fields/i.test(methodsText);
        const hasVerificationCounts = /verification status was:\s*verified=\d+,\s*needs-check=\d+,\s*unverified=\d+/i.test(methodsText);
        const hasReproducibility = /Reproducibility and Audit Trail|versioned table exports|prespecified settings/i.test(methodsText);
        const hasRobSentence = /RoB 2|overall RoB judgments/i.test(methodsText);

        const hasPooledEffect = /pooled effect/i.test(resultsText);
        const hasCI = /\bCI\b/i.test(resultsText);
        const hasPValue = /\bp\s*(<|=)/i.test(resultsText);
        const hasHeterogeneity = /I-squared=|tau-squared=|Q\(/i.test(resultsText);
        const hasPredictionInterval = /prediction interval/i.test(resultsText);
        const hasLoo = /Leave-one-out/i.test(resultsText);
        const hasCumulative = /Cumulative synthesis/i.test(resultsText);
        const hasTrimFill = /Trim-and-fill/i.test(resultsText);
        const hasFragility = /Fragility index/i.test(resultsText);
        const sensitivitySignals = [hasLoo, hasCumulative, hasTrimFill, hasFragility].filter(Boolean).length;

        const methodsWordCount = methodsText.trim().split(/\s+/).filter(Boolean).length;
        const resultsWordCount = resultsText.trim().split(/\s+/).filter(Boolean).length;

        mark('end_write');
        mark('end_total');

        const totalRefs = allReferences.length;
        const autoDecisionRate = totalRefs > 0 ? (asInc + asExc) / totalRefs : 0;
        const verifyTotal = extractedStudies.length;
        const verifiedRatio = verifyTotal > 0 ? ((verificationCounts.verified || 0) / verifyTotal) : 0;

        const criticalMissing = (gate?.gates || [])
          .filter(g => g.critical && !g.pass)
          .map(g => g.name + ': ' + g.detail);

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
          auto_decision_rate: autoDecisionRate,
          queue_representatives: Number(queueStats?.representatives || asRev || 0),
          manual_reviewed: manualReviewed,
          extraction_k: verifyTotal,
          verification: verificationCounts,
          verified_ratio: verifiedRatio,
          rob_assessed: robAssessed,
          rob_coverage: robCoverage,
          analysis_k: Number(analysis?.k || 0),
          methods_results_only: methodsResultsOnly,
          advanced_gate_ready: !!gate?.readyForAdvancedJournal,
          advanced_gate_score: Number(gate?.score || 0),
          advanced_gate_critical_passed: Number(gate?.criticalPassed || 0),
          advanced_gate_critical_total: Number(gate?.criticalTotal || 0),
          advanced_gate_critical_missing: criticalMissing,
          metrics: {
            hasMethodsHeader,
            hasResultsHeader,
            hasIntro,
            hasDiscussion,
            hasPrisma,
            hasPico,
            hasSources,
            hasEligibility,
            hasScreeningWorkflow,
            hasExtractionWorkflow,
            hasVerificationCounts,
            hasReproducibility,
            hasRobSentence,
            hasPooledEffect,
            hasCI,
            hasPValue,
            hasHeterogeneity,
            hasPredictionInterval,
            hasLoo,
            hasCumulative,
            hasTrimFill,
            hasFragility,
            sensitivitySignals,
            methodsWordCount,
            resultsWordCount,
          }
        });
      } catch (e) {
        done({ ok: false, persona: persona.name, error: String(e && e.message || e) });
      }
    })();
    """

    return driver.execute_async_script(script, payload, pace_scale)


def clamp(v: float, lo: float = 0.0, hi: float = 100.0) -> float:
    return max(lo, min(hi, v))


def compute_subscores(row: Dict[str, Any]) -> Dict[str, float]:
    m = row.get("metrics") or {}

    structure = 0.0
    structure += 30.0 if m.get("hasMethodsHeader") else 0.0
    structure += 30.0 if m.get("hasResultsHeader") else 0.0
    structure += 20.0 if row.get("methods_results_only") else 0.0
    structure += 10.0 if (m.get("methodsWordCount", 0) >= 280) else 0.0
    structure += 10.0 if (m.get("resultsWordCount", 0) >= 220) else 0.0

    methods_checks = [
        m.get("hasPrisma"),
        m.get("hasPico"),
        m.get("hasSources"),
        m.get("hasEligibility"),
        m.get("hasScreeningWorkflow"),
        m.get("hasExtractionWorkflow"),
        m.get("hasVerificationCounts"),
        m.get("hasReproducibility"),
    ]
    methods_reporting = (sum(1 for x in methods_checks if x) / len(methods_checks)) * 100.0

    stats_checks = [
        m.get("hasPooledEffect"),
        m.get("hasCI"),
        m.get("hasPValue"),
        m.get("hasHeterogeneity"),
        m.get("hasPredictionInterval"),
    ]
    stats_reporting = (sum(1 for x in stats_checks if x) / len(stats_checks)) * 100.0

    robustness = min(100.0, float(m.get("sensitivitySignals", 0)) * 25.0)

    verified_ratio = float(row.get("verified_ratio", 0.0))
    registry_verification = 0.0
    registry_verification += min(70.0, verified_ratio * 70.0 / 0.9) if verified_ratio < 0.9 else 70.0
    registry_verification += 30.0 if m.get("hasVerificationCounts") else 0.0

    rob_cov = float(row.get("rob_coverage", 0.0))
    bias_assessment = 0.0
    bias_assessment += min(75.0, rob_cov * 75.0 / 0.9) if rob_cov < 0.9 else 75.0
    bias_assessment += 25.0 if m.get("hasRobSentence") else 0.0

    gate_integrity = 0.0
    if row.get("advanced_gate_ready"):
        gate_integrity = 100.0
    else:
        passed = float(row.get("advanced_gate_critical_passed", 0.0))
        total = float(row.get("advanced_gate_critical_total", 1.0))
        gate_integrity = 100.0 * (passed / total) if total > 0 else 0.0

    return {
        "structure": clamp(structure),
        "methods_reporting": clamp(methods_reporting),
        "stats_reporting": clamp(stats_reporting),
        "robustness": clamp(robustness),
        "registry_verification": clamp(registry_verification),
        "bias_assessment": clamp(bias_assessment),
        "gate_integrity": clamp(gate_integrity),
    }


def review_with_panel(row: Dict[str, Any]) -> Dict[str, Any]:
    subs = compute_subscores(row)
    reviews = []
    for reviewer in REVIEWER_PANEL:
        weights = reviewer["weights"]
        total_w = float(sum(weights.values()))
        score = 0.0
        concerns = []
        for key, w in weights.items():
            val = float(subs.get(key, 0.0))
            score += (w * val)
            if w >= 15 and val < 70:
                concerns.append(f"{key}={val:.0f}")
        score = (score / total_w) if total_w > 0 else 0.0
        accepted = bool(score >= reviewer["threshold"] and row.get("advanced_gate_ready"))
        reviews.append(
            {
                "reviewer": reviewer["name"],
                "score": round(score, 1),
                "threshold": reviewer["threshold"],
                "accepted": accepted,
                "concerns": concerns,
            }
        )

    accept_count = sum(1 for r in reviews if r["accepted"])
    row_copy = dict(row)
    row_copy["subscores"] = {k: round(v, 1) for k, v in subs.items()}
    row_copy["panel_reviews"] = reviews
    row_copy["panel_accept_count"] = accept_count
    row_copy["panel_accept_rate"] = accept_count / len(REVIEWER_PANEL)
    row_copy["panel_major_revision"] = accept_count < 9
    return row_copy


def percentile(values: List[float], q: float) -> float:
    if not values:
        return 0.0
    xs = sorted(values)
    idx = max(0, min(len(xs) - 1, int(round((len(xs) - 1) * q))))
    return xs[idx]


def summarize(results: List[Dict[str, Any]], started: float) -> Dict[str, Any]:
    ok_rows = [r for r in results if r.get("ok")]
    failed = [r for r in results if not r.get("ok")]

    totals = [r.get("timings", {}).get("total_sec", 0.0) for r in ok_rows]
    gate_scores = [r.get("advanced_gate_score", 0.0) for r in ok_rows]
    verify = [r.get("verified_ratio", 0.0) for r in ok_rows]
    rob_cov = [r.get("rob_coverage", 0.0) for r in ok_rows]
    panel_accept = [r.get("panel_accept_rate", 0.0) for r in ok_rows]

    issue_freq: Dict[str, int] = {}
    for r in ok_rows:
        if not r.get("advanced_gate_ready"):
            for miss in (r.get("advanced_gate_critical_missing") or []):
                code = miss.split(":", 1)[0]
                issue_freq[code] = issue_freq.get(code, 0) + 1
        if r.get("panel_major_revision"):
            issue_freq["panel_major_revision"] = issue_freq.get("panel_major_revision", 0) + 1

    panel_total_reviews = len(ok_rows) * len(REVIEWER_PANEL)
    panel_accept_reviews = sum(int(r.get("panel_accept_count", 0)) for r in ok_rows)

    return {
        "timestamp_utc": datetime.now(timezone.utc).isoformat(),
        "personas_total": len(results),
        "personas_ok": len(ok_rows),
        "personas_failed": len(failed),
        "advanced_gate_ready_count": sum(1 for r in ok_rows if r.get("advanced_gate_ready")),
        "advanced_gate_ready_rate": (sum(1 for r in ok_rows if r.get("advanced_gate_ready")) / len(ok_rows)) if ok_rows else 0.0,
        "panel_reviews_total": panel_total_reviews,
        "panel_reviews_accepted": panel_accept_reviews,
        "panel_review_accept_rate": (panel_accept_reviews / panel_total_reviews) if panel_total_reviews else 0.0,
        "manuscripts_major_revision": sum(1 for r in ok_rows if r.get("panel_major_revision")),
        "timing": {
            "mean_total_sec": statistics.mean(totals) if totals else 0.0,
            "median_total_sec": statistics.median(totals) if totals else 0.0,
            "p90_total_sec": percentile(totals, 0.9),
        },
        "quality": {
            "mean_gate_score": statistics.mean(gate_scores) if gate_scores else 0.0,
            "mean_verified_ratio": statistics.mean(verify) if verify else 0.0,
            "mean_rob_coverage": statistics.mean(rob_cov) if rob_cov else 0.0,
            "mean_panel_accept_rate": statistics.mean(panel_accept) if panel_accept else 0.0,
        },
        "issue_frequency": dict(sorted(issue_freq.items(), key=lambda kv: kv[1], reverse=True)),
        "elapsed_wall_sec": round(time.time() - started, 2),
    }


def write_markdown(summary: Dict[str, Any], results: List[Dict[str, Any]]) -> str:
    lines = [
        "# Advanced Journal 12x12 Selenium Review",
        "",
        "## Summary",
        f"- Author personas: {summary['personas_ok']}/{summary['personas_total']} successful",
        f"- Advanced-journal gate ready manuscripts: {summary['advanced_gate_ready_count']} ({summary['advanced_gate_ready_rate']*100:.1f}%)",
        f"- Panel review acceptance: {summary['panel_reviews_accepted']}/{summary['panel_reviews_total']} ({summary['panel_review_accept_rate']*100:.1f}%)",
        f"- Manuscripts needing major revision: {summary['manuscripts_major_revision']}",
        f"- Mean total runtime per persona: {summary['timing']['mean_total_sec']:.1f}s",
        f"- Mean gate score: {summary['quality']['mean_gate_score']:.1f}%",
        f"- Mean verified ratio: {summary['quality']['mean_verified_ratio']*100:.1f}%",
        f"- Mean RoB coverage: {summary['quality']['mean_rob_coverage']*100:.1f}%",
        f"- Mean panel accept rate per manuscript: {summary['quality']['mean_panel_accept_rate']*100:.1f}%",
        "",
        "## Frequent Issues",
    ]

    if summary["issue_frequency"]:
        for code, count in summary["issue_frequency"].items():
            lines.append(f"- `{code}`: {count}")
    else:
        lines.append("- None")

    lines.extend(["", "## Manuscript Outcomes"])
    for row in results:
        if not row.get("ok"):
            lines.append(f"- {row.get('persona')}: ERROR - {row.get('error', 'unknown')}")
            continue
        subs = row.get("subscores", {})
        missing = row.get("advanced_gate_critical_missing") or []
        missing_txt = "; ".join(missing) if missing else "none"
        lines.append(
            "- "
            + row.get("persona", "unknown")
            + f": gate_ready={row.get('advanced_gate_ready')}, gate_score={row.get('advanced_gate_score', 0)}%, "
            + f"panel_accept={row.get('panel_accept_count', 0)}/12, "
            + f"verified={row.get('verified_ratio', 0)*100:.1f}%, RoB={row.get('rob_coverage', 0)*100:.1f}%, "
            + f"stats={subs.get('stats_reporting', 0):.0f}, methods={subs.get('methods_reporting', 0):.0f}, "
            + f"missing_critical={missing_txt}"
        )

    return "\n".join(lines) + "\n"


def main() -> int:
    started = time.time()
    os.makedirs(REPORT_DIR, exist_ok=True)

    pace_scale_env = os.environ.get("HUMAN_PACE_SCALE", "0.6").strip()
    try:
        pace_scale = float(pace_scale_env)
    except ValueError:
        pace_scale = 0.6

    driver = create_driver()
    results: List[Dict[str, Any]] = []
    try:
        load_app(driver)
        for idx, persona in enumerate(AUTHOR_PERSONAS, start=1):
            row = run_author_persona(driver, persona, pace_scale)
            if row.get("ok"):
                row = review_with_panel(row)
                print(
                    f"OK {idx:02d}/12 {persona.name}: "
                    f"gate={row.get('advanced_gate_score', 0):.0f}% ({row.get('advanced_gate_critical_passed', 0)}/{row.get('advanced_gate_critical_total', 0)}), "
                    f"panel={row.get('panel_accept_count', 0)}/12, "
                    f"verify={row.get('verified_ratio', 0)*100:.1f}%, "
                    f"rob={row.get('rob_coverage', 0)*100:.1f}%"
                )
            else:
                print(f"ERROR {idx:02d}/12 {persona.name}: {row.get('error', 'unknown')}")
            results.append(row)
    finally:
        driver.quit()

    summary = summarize(results, started)
    report = {
        "summary": summary,
        "author_personas": [p.__dict__ for p in AUTHOR_PERSONAS],
        "reviewer_panel": REVIEWER_PANEL,
        "results": results,
    }

    with open(REPORT_JSON, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)
    with open(REPORT_MD, "w", encoding="utf-8") as f:
        f.write(write_markdown(summary, results))

    print(
        f"SUMMARY ok={summary['personas_ok']}/{summary['personas_total']} "
        f"gate_ready={summary['advanced_gate_ready_count']}/{summary['personas_ok']} "
        f"panel_accept={summary['panel_review_accept_rate']*100:.1f}% "
        f"major_revision={summary['manuscripts_major_revision']}"
    )
    print(f"Report written: {REPORT_JSON}")

    if summary["personas_ok"] == 0:
        return 2
    if summary["advanced_gate_ready_rate"] < 0.9:
        return 1
    if summary["panel_review_accept_rate"] < 0.8:
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
