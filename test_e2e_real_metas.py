#!/usr/bin/env python
"""
End-to-End Selenium Test: MetaSprint Autopilot
===============================================
Validates the FULL workflow (Protocol → Search → Screen → Extract → Analyze)
against 3 published meta-analyses using real trial data.

Gold Standards:
  1. SGLT2i & 3P-MACE (4 CVOTs) — Zelniker et al. Lancet 2019
  2. GLP-1 RA & 3P-MACE (7 CVOTs) — Sattar et al. Lancet Diabetes Endocrinol 2021
  3. Colchicine & CV Events (3 RCTs) — Deftereos et al. Eur Heart J 2022

Each test: Protocol → Search CT.gov → Screen → Extract (auto-fill curated) → Analyze → Compare
"""

import io, sys, os, time, json, math, traceback, threading, http.server, socketserver
from pathlib import Path

# UTF-8 stdout for Windows
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import (
    TimeoutException, NoSuchElementException, ElementNotInteractableException,
    JavascriptException, StaleElementReferenceException
)

# ─── Configuration ─────────────────────────────────────────
APP_DIR = Path(__file__).resolve().parent
APP_FILE = "metasprint-autopilot.html"
PORT = 9877
BASE_URL = f"http://127.0.0.1:{PORT}/{APP_FILE}"
HEADLESS = True
TIMEOUT = 15  # seconds for waits
EFFECT_TOL = 0.06  # tolerance for pooled effect comparison (6%)
CI_TOL = 0.08       # tolerance for CI bounds
I2_TOL = 15.0       # tolerance for I-squared (percentage points)

# ─── Gold Standard Meta-Analyses ───────────────────────────
# Each entry: trials with known effect sizes, plus expected pooled result
GOLD_STANDARDS = {
    "sglt2i_mace": {
        "name": "SGLT2 Inhibitors & 3P-MACE",
        "protocol": {
            "title": "SGLT2 inhibitors and major adverse cardiovascular events: a systematic review and meta-analysis",
            "population": "Adults with type 2 diabetes at high cardiovascular risk",
            "intervention": "SGLT2 inhibitors (empagliflozin, canagliflozin, dapagliflozin, ertugliflozin)",
            "comparator": "Placebo",
            "outcome": "3-point MACE (cardiovascular death, non-fatal MI, non-fatal stroke)",
            "studyType": "RCT",
        },
        "search_terms": "SGLT2 inhibitor cardiovascular",
        "trials": [
            {"name": "EMPA-REG OUTCOME", "nct": "NCT01131676", "effectType": "HR", "effect": 0.86, "lo": 0.74, "hi": 0.99, "year": 2015},
            {"name": "CANVAS Program",   "nct": "NCT01032629", "effectType": "HR", "effect": 0.86, "lo": 0.75, "hi": 0.97, "year": 2017},
            {"name": "DECLARE-TIMI 58",  "nct": "NCT01730534", "effectType": "HR", "effect": 0.93, "lo": 0.84, "hi": 1.03, "year": 2019},
            {"name": "VERTIS CV",        "nct": "NCT01986881", "effectType": "HR", "effect": 0.97, "lo": 0.85, "hi": 1.11, "year": 2020},
        ],
        "expected": {
            "pooled_lo": 0.80, "pooled_hi": 1.01,  # DL-HKSJ widened CI
            "pooled_min": 0.86, "pooled_max": 0.94,  # acceptable range
            "I2_max": 30.0,  # expect low heterogeneity
            "direction": "benefit",  # HR < 1
            "reference": "Zelniker et al. Lancet 2019; McGuire et al. JAMA Cardiol 2021",
        },
    },
    "glp1ra_mace": {
        "name": "GLP-1 Receptor Agonists & 3P-MACE",
        "protocol": {
            "title": "GLP-1 receptor agonists and cardiovascular outcomes: a meta-analysis of cardiovascular outcome trials",
            "population": "Adults with type 2 diabetes",
            "intervention": "GLP-1 receptor agonists (liraglutide, semaglutide, exenatide, dulaglutide, albiglutide, lixisenatide)",
            "comparator": "Placebo",
            "outcome": "3-point MACE (cardiovascular death, non-fatal MI, non-fatal stroke)",
            "studyType": "RCT",
        },
        "search_terms": "GLP-1 receptor agonist cardiovascular outcome",
        "trials": [
            {"name": "ELIXA",     "nct": "NCT01147250", "effectType": "HR", "effect": 1.02, "lo": 0.89, "hi": 1.17, "year": 2015},
            {"name": "LEADER",    "nct": "NCT01179048", "effectType": "HR", "effect": 0.87, "lo": 0.78, "hi": 0.97, "year": 2016},
            {"name": "SUSTAIN-6", "nct": "NCT01720446", "effectType": "HR", "effect": 0.74, "lo": 0.58, "hi": 0.95, "year": 2016},
            {"name": "EXSCEL",    "nct": "NCT01144338", "effectType": "HR", "effect": 0.91, "lo": 0.83, "hi": 1.00, "year": 2017},
            {"name": "HARMONY",   "nct": "NCT02465515", "effectType": "HR", "effect": 0.78, "lo": 0.68, "hi": 0.90, "year": 2018},
            {"name": "PIONEER 6", "nct": "NCT02692716", "effectType": "HR", "effect": 0.79, "lo": 0.57, "hi": 1.11, "year": 2019},
            {"name": "REWIND",    "nct": "NCT01394952", "effectType": "HR", "effect": 0.88, "lo": 0.79, "hi": 0.99, "year": 2019},
        ],
        "expected": {
            "pooled_lo": 0.80, "pooled_hi": 0.94,  # DL pooled ~0.86-0.88
            "pooled_min": 0.83, "pooled_max": 0.91,
            "I2_max": 55.0,  # moderate heterogeneity expected
            "direction": "benefit",
            "reference": "Sattar et al. Lancet Diabetes Endocrinol 2021; Kristensen et al. Lancet Diabetes Endocrinol 2019",
        },
    },
    "colchicine_cv": {
        "name": "Colchicine & Cardiovascular Events",
        "protocol": {
            "title": "Colchicine for secondary prevention of cardiovascular events: a meta-analysis",
            "population": "Adults with established coronary artery disease or recent ACS",
            "intervention": "Colchicine (0.5 mg daily)",
            "comparator": "Placebo",
            "outcome": "Major adverse cardiovascular events (composite endpoint)",
            "studyType": "RCT",
        },
        "search_terms": "colchicine cardiovascular prevention",
        "trials": [
            {"name": "COLCOT",  "nct": "NCT02551094", "effectType": "HR", "effect": 0.77, "lo": 0.61, "hi": 0.96, "year": 2019},
            {"name": "LoDoCo2", "nct": "NCT03198000", "effectType": "HR", "effect": 0.69, "lo": 0.57, "hi": 0.83, "year": 2020},
            {"name": "COPS",    "nct": "NCT03048825", "effectType": "HR", "effect": 0.65, "lo": 0.38, "hi": 1.09, "year": 2020},
        ],
        "expected": {
            # DL-HKSJ with k=3 gives wider CI than standard DL (t-dist df=2)
            "pooled_lo": 0.50, "pooled_hi": 1.02,  # HKSJ-adjusted CI bounds
            "pooled_min": 0.67, "pooled_max": 0.79,
            "I2_max": 30.0,
            "direction": "benefit",
            "reference": "Deftereos et al. Eur Heart J 2022; Samuel et al. JAHA 2021",
        },
    },
}


# ─── HTTP Server ───────────────────────────────────────────
class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(APP_DIR), **kwargs)
    def log_message(self, *a):
        pass  # suppress request logs

_server = None
_server_thread = None

def start_server():
    global _server, _server_thread
    _server = socketserver.TCPServer(("127.0.0.1", PORT), QuietHandler)
    _server_thread = threading.Thread(target=_server.serve_forever, daemon=True)
    _server_thread.start()
    time.sleep(0.5)

def stop_server():
    global _server
    if _server:
        _server.shutdown()
        _server = None


# ─── Driver Setup ──────────────────────────────────────────
def create_driver():
    opts = Options()
    if HEADLESS:
        opts.add_argument("--headless=new")
    opts.add_argument("--no-sandbox")
    opts.add_argument("--disable-gpu")
    opts.add_argument("--window-size=1920,1080")
    opts.add_argument("--disable-dev-shm-usage")
    opts.add_argument("--disable-web-security")  # for local file access
    opts.set_capability("goog:loggingPrefs", {"browser": "ALL"})
    driver = webdriver.Chrome(options=opts)
    driver.implicitly_wait(3)
    return driver


# ─── Helper Functions ──────────────────────────────────────
def js(driver, script, *args):
    """Execute JS and return result."""
    return driver.execute_script(script, *args)

def wait_for(driver, condition, timeout=TIMEOUT):
    """WebDriverWait wrapper."""
    return WebDriverWait(driver, timeout).until(condition)

def switch_phase(driver, phase_name):
    """Switch to a tab/phase."""
    js(driver, f"switchPhase('{phase_name}')")
    time.sleep(0.3)

def dismiss_banner(driver):
    """Dismiss onboarding overlay and research tool warning if visible."""
    # First close onboarding overlay if present
    try:
        js(driver, """
            const onboard = document.getElementById('onboardOverlay');
            if (onboard && onboard.style.display !== 'none') {
                onboard.style.display = 'none';
            }
        """)
        time.sleep(0.3)
    except Exception:
        pass
    # Then dismiss research warning banner
    try:
        js(driver, """
            const banners = document.querySelectorAll('[onclick*="parentElement"]');
            banners.forEach(b => { try { b.click(); } catch(e) {} });
        """)
        time.sleep(0.2)
    except Exception:
        pass

def clear_project(driver):
    """Clear localStorage and reload for a fresh start."""
    js(driver, "localStorage.clear()")
    # Delete entire IndexedDB so loadStudies() finds nothing
    js(driver, """
        try { indexedDB.deleteDatabase('metasprint-autopilot'); } catch(e) {}
    """)
    driver.refresh()
    time.sleep(3)
    dismiss_banner(driver)


def clear_studies_idb(driver):
    """Clear all studies from IDB and in-memory array (without full page reload)."""
    js(driver, """
        (async () => {
            // Clear in-memory array
            if (typeof extractedStudies !== 'undefined') extractedStudies.length = 0;
            // Clear IDB studies store
            if (typeof db !== 'undefined' && db) {
                try {
                    const tx = db.transaction('studies', 'readwrite');
                    tx.objectStore('studies').clear();
                    await new Promise((res, rej) => { tx.oncomplete = res; tx.onerror = rej; });
                } catch(e) {}
            }
            // Also clear in-memory fallback
            if (typeof _memStore !== 'undefined' && _memStore.studies) {
                _memStore.studies = {};
            }
            // Re-render empty table
            if (typeof renderExtractTable === 'function') renderExtractTable();
        })();
    """)
    time.sleep(0.5)

def get_console_errors(driver):
    """Get browser console errors."""
    try:
        logs = driver.get_log("browser")
        return [l for l in logs if l.get("level") == "SEVERE"]
    except Exception:
        return []


# ─── Test Steps ────────────────────────────────────────────

def step_protocol(driver, meta):
    """Fill in the PICO protocol form."""
    prot = meta["protocol"]
    switch_phase(driver, "protocol")
    time.sleep(0.5)

    fields = {
        "protTitle": prot["title"],
        "protP": prot["population"],
        "protI": prot["intervention"],
        "protC": prot["comparator"],
        "protO": prot["outcome"],
    }
    for field_id, value in fields.items():
        el = driver.find_element(By.ID, field_id)
        el.clear()
        el.send_keys(value)
        time.sleep(0.1)

    # Set study type
    try:
        sel = Select(driver.find_element(By.ID, "protStudyType"))
        sel.select_by_visible_text(prot["studyType"])
    except Exception:
        pass  # Some versions may not have this select

    # Trigger save
    js(driver, "if(typeof savePICO==='function') savePICO()")
    time.sleep(0.3)

    # Verify protocol was saved
    title_val = js(driver, "return document.getElementById('protTitle').value")
    assert title_val == prot["title"], f"Protocol title not saved: {title_val}"
    return True


def step_search_ctgov(driver, meta):
    """Run a CT.gov search to demonstrate the search workflow."""
    switch_phase(driver, "search")
    time.sleep(0.5)

    # Fill PICO search fields
    prot = meta["protocol"]
    pico_map = {
        "picoP": prot["population"],
        "picoI": prot["intervention"],
        "picoC": prot["comparator"],
        "picoO": prot["outcome"],
    }
    for field_id, value in pico_map.items():
        try:
            el = driver.find_element(By.ID, field_id)
            el.clear()
            el.send_keys(value)
            time.sleep(0.1)
        except (NoSuchElementException, ElementNotInteractableException):
            pass

    # Try CT.gov search (may timeout if API is slow)
    search_done = False
    try:
        js(driver, """
            (async () => {
                if (typeof searchCTGov === 'function') {
                    try { await searchCTGov(); } catch(e) { console.warn('CT.gov search failed:', e.message); }
                }
            })()
        """)
        # Wait up to 15s for results
        time.sleep(3)
        results_count = js(driver, """
            const el = document.getElementById('searchResults');
            if (!el) return 0;
            return el.querySelectorAll('.search-result-card, .ref-item, tr').length;
        """)
        search_done = (results_count or 0) > 0
    except Exception as e:
        print(f"    CT.gov search attempt: {e}")

    return search_done


def step_screen_trials(driver, meta):
    """Screen trials: import known NCT IDs and include them."""
    switch_phase(driver, "screen")
    time.sleep(0.5)

    # Import trials by NCT ID list
    nct_ids = [t["nct"] for t in meta["trials"]]
    nct_list = "\n".join(nct_ids)

    # Use the PMID/NCT import if available, or add references directly
    imported = js(driver, f"""
        const ncts = {json.dumps(nct_ids)};
        let imported = 0;
        for (const nct of ncts) {{
            const ref = {{
                id: 'ref_' + nct,
                title: nct + ' (auto-imported for validation)',
                nctId: nct,
                source: 'ctgov',
                status: 'include',
                decision: 'include',
            }};
            if (typeof references !== 'undefined') {{
                references.push(ref);
                imported++;
            }}
        }}
        if (typeof renderRefList === 'function') renderRefList();
        return imported;
    """)

    if not imported or imported == 0:
        # Fallback: try importFromPMIDList
        try:
            textarea = driver.find_element(By.ID, "pmidListInput")
            if textarea:
                textarea.clear()
                textarea.send_keys(nct_list)
                time.sleep(0.2)
                js(driver, "if(typeof importFromPMIDList==='function') importFromPMIDList()")
                time.sleep(1)
        except (NoSuchElementException, ElementNotInteractableException):
            pass

    # Include all references
    included = js(driver, """
        if (typeof references === 'undefined') return 0;
        let count = 0;
        for (const ref of references) {
            if (ref.status !== 'include') {
                ref.status = 'include';
                ref.decision = 'include';
            }
            count++;
        }
        if (typeof renderRefList === 'function') renderRefList();
        return count;
    """)

    return included or 0


def step_extract_data(driver, meta):
    """Add trial data to the extraction table."""
    switch_phase(driver, "extract")
    time.sleep(0.5)

    # Clear existing studies from both IDB and memory
    clear_studies_idb(driver)

    # Add each trial as a study row
    added = 0
    for trial in meta["trials"]:
        result = js(driver, f"""
            if (typeof addStudyRow !== 'function') return false;
            addStudyRow({{
                authorYear: '{trial["name"]} ({trial["year"]})',
                trialId: '{trial["name"]}',
                nctId: '{trial["nct"]}',
                effectType: '{trial["effectType"]}',
                effectEstimate: {trial["effect"]},
                lowerCI: {trial["lo"]},
                upperCI: {trial["hi"]},
                verificationStatus: 'verified',
                notes: 'Gold standard trial data',
            }});
            return true;
        """)
        if result:
            added += 1
        time.sleep(0.1)

    # Verify table has the right number of rows
    row_count = js(driver, """
        return document.querySelectorAll('#extractBody tr').length;
    """)

    assert row_count == len(meta["trials"]), \
        f"Expected {len(meta['trials'])} rows, got {row_count}"

    return added


def step_extract_via_autofill(driver, meta):
    """Test the batch auto-fill from curated data."""
    switch_phase(driver, "extract")
    time.sleep(0.5)

    # Clear existing studies from both IDB and memory
    clear_studies_idb(driver)

    # Add study stubs (name + NCT only, no effect data) to test auto-fill
    for trial in meta["trials"]:
        js(driver, f"""
            addStudyRow({{
                authorYear: '{trial["name"]} ({trial["year"]})',
                trialId: '{trial["name"]}',
                nctId: '{trial["nct"]}',
                effectType: '',
                effectEstimate: null,
                lowerCI: null,
                upperCI: null,
                verificationStatus: 'unverified',
                notes: 'Stub for auto-fill test',
            }});
        """)
        time.sleep(0.05)

    # Run batch auto-fill
    result = js(driver, """
        if (typeof batchAutoFillFromCurated !== 'function') return 'no_function';
        batchAutoFillFromCurated();
        // Check how many now have data
        let filled = 0;
        for (const s of extractedStudies) {
            if (s.effectEstimate != null && s.lowerCI != null && s.upperCI != null) filled++;
        }
        return filled;
    """)

    return result


def step_analyze(driver, meta):
    """Run the meta-analysis and collect results."""
    switch_phase(driver, "analyze")
    time.sleep(0.5)

    # Ensure DL-HKSJ method is selected and strict gates are off
    try:
        method_sel = Select(driver.find_element(By.ID, "methodSelect"))
        method_sel.select_by_value("DL-HKSJ")
    except Exception:
        pass
    # Disable strict publishability gates (they block on missing timepoint/outcome)
    js(driver, """
        const gate = document.getElementById('publishableGateToggle');
        if (gate && gate.checked) gate.click();
    """)
    time.sleep(0.2)

    # Run analysis (async function — await it)
    js(driver, """
        (async () => {
            try { await runAnalysis(); } catch(e) { console.error('runAnalysis error:', e); }
        })();
    """)
    time.sleep(2)

    # runAnalysis doesn't return a value; read results from DOM stat-cards
    time.sleep(1.5)  # let rendering complete
    result = js(driver, """
        const el = document.getElementById('analysisSummary');
        if (!el) return null;
        const cards = el.querySelectorAll('.stat-card');
        if (!cards.length) return null;
        const parsed = {};
        cards.forEach(card => {
            const label = card.querySelector('.stat-label')?.textContent?.trim() || '';
            const value = card.querySelector('.stat-value')?.textContent?.trim() || '';
            if (label === 'Studies (k)') parsed.k = parseInt(value);
            else if (label === 'Pooled Effect') parsed.pooled = parseFloat(value);
            else if (label.indexOf('% CI') !== -1) {
                const m = value.match(/([0-9.]+)[^0-9.]+([0-9.]+)/);
                if (m) { parsed.pooledLo = parseFloat(m[1]); parsed.pooledHi = parseFloat(m[2]); }
            }
            else if (label === 'I\u00B2' || label === 'I2' || (label.indexOf('I') === 0 && label.length <= 3)) parsed.I2 = parseFloat(value);
            else if (label.indexOf('\u03C4') === 0 || label.indexOf('tau') === 0 || label === '\u03C4\u00B2') parsed.tau2 = parseFloat(value);
        });
        return parsed;
    """)

    return result


def step_verify_results(meta, result):
    """Compare analysis results against gold standard."""
    expected = meta["expected"]
    issues = []

    if not result:
        return ["Analysis returned no results"]

    pooled = result.get("pooled")
    lo = result.get("pooledLo")
    hi = result.get("pooledHi")
    i2 = result.get("I2")
    k = result.get("k")

    # Check study count
    expected_k = len(meta["trials"])
    if k is not None and k != expected_k:
        issues.append(f"Study count: got k={k}, expected {expected_k}")

    # Check pooled effect is in acceptable range
    if pooled is not None:
        if pooled < expected["pooled_min"] or pooled > expected["pooled_max"]:
            issues.append(
                f"Pooled effect {pooled:.4f} outside expected range "
                f"[{expected['pooled_min']}, {expected['pooled_max']}]"
            )
        # Check direction
        if expected["direction"] == "benefit" and pooled >= 1.0:
            issues.append(f"Expected benefit (HR<1) but got pooled={pooled:.4f}")
    else:
        issues.append("Pooled effect not found in results")

    # Check CI
    if lo is not None and hi is not None:
        if lo > expected["pooled_lo"] * (1 + CI_TOL) or lo < expected["pooled_lo"] * (1 - CI_TOL):
            issues.append(f"Lower CI {lo:.4f} differs from expected ~{expected['pooled_lo']}")
        if hi > expected["pooled_hi"] * (1 + CI_TOL) or hi < expected["pooled_hi"] * (1 - CI_TOL):
            issues.append(f"Upper CI {hi:.4f} differs from expected ~{expected['pooled_hi']}")

    # Check I-squared
    if i2 is not None:
        if i2 > expected["I2_max"]:
            issues.append(f"I² = {i2:.1f}% exceeds expected max {expected['I2_max']}%")

    return issues


def step_check_forest_plot(driver):
    """Verify forest plot was rendered."""
    has_plot = js(driver, """
        const container = document.getElementById('forestPlotContainer');
        if (!container) return {exists: false, reason: 'no container'};
        const svg = container.querySelector('svg');
        if (!svg) return {exists: false, reason: 'no SVG'};
        const rects = svg.querySelectorAll('rect');
        const lines = svg.querySelectorAll('line');
        const texts = svg.querySelectorAll('text');
        return {
            exists: true,
            rects: rects.length,
            lines: lines.length,
            texts: texts.length,
            width: svg.getAttribute('width'),
            height: svg.getAttribute('height'),
        };
    """)
    return has_plot


def step_check_funnel_plot(driver):
    """Verify funnel plot was rendered (requires k >= 3)."""
    has_plot = js(driver, """
        const container = document.getElementById('funnelPlotContainer');
        if (!container) return {exists: false, reason: 'no container'};
        const svg = container.querySelector('svg');
        if (!svg) return {exists: false, reason: 'no SVG'};
        return {
            exists: true,
            circles: svg.querySelectorAll('circle').length,
        };
    """)
    return has_plot


# ─── Full Test Runner ──────────────────────────────────────

def run_single_meta(driver, key, meta, test_num):
    """Run a complete end-to-end test for one meta-analysis."""
    results = {
        "name": meta["name"],
        "steps": {},
        "issues": [],
        "pass": False,
    }

    print(f"\n{'='*70}")
    print(f"  TEST {test_num}: {meta['name']}")
    print(f"  Trials: {len(meta['trials'])} | Expected pooled: {meta['expected']['pooled_min']}-{meta['expected']['pooled_max']}")
    print(f"  Reference: {meta['expected']['reference']}")
    print(f"{'='*70}")

    # Fresh start
    clear_project(driver)

    # Step 1: Protocol
    print("\n  [1/6] Protocol...", end=" ", flush=True)
    try:
        step_protocol(driver, meta)
        results["steps"]["protocol"] = "PASS"
        print("PASS")
    except Exception as e:
        results["steps"]["protocol"] = f"FAIL: {e}"
        results["issues"].append(f"Protocol: {e}")
        print(f"FAIL: {e}")

    # Step 2: Search CT.gov
    print("  [2/6] Search CT.gov...", end=" ", flush=True)
    try:
        found = step_search_ctgov(driver, meta)
        results["steps"]["search"] = f"PASS (found={found})"
        print(f"{'PASS' if found else 'PARTIAL'} (results={'yes' if found else 'none/timeout'})")
    except Exception as e:
        results["steps"]["search"] = f"WARN: {e}"
        results["issues"].append(f"Search: {e}")
        print(f"WARN: {e}")

    # Step 3: Screen (import known trials)
    print("  [3/6] Screen (import trials)...", end=" ", flush=True)
    try:
        included = step_screen_trials(driver, meta)
        results["steps"]["screen"] = f"PASS (included={included})"
        print(f"PASS ({included} included)")
    except Exception as e:
        results["steps"]["screen"] = f"FAIL: {e}"
        results["issues"].append(f"Screen: {e}")
        print(f"FAIL: {e}")

    # Step 4a: Extract — direct data entry
    print("  [4/6] Extract (direct entry)...", end=" ", flush=True)
    try:
        added = step_extract_data(driver, meta)
        results["steps"]["extract_direct"] = f"PASS (added={added})"
        print(f"PASS ({added} studies)")
    except Exception as e:
        results["steps"]["extract_direct"] = f"FAIL: {e}"
        results["issues"].append(f"Extract direct: {e}")
        print(f"FAIL: {e}")

    # Step 4b: Test auto-fill separately (reset + refill)
    print("  [4b]  Extract (auto-fill test)...", end=" ", flush=True)
    try:
        filled = step_extract_via_autofill(driver, meta)
        if filled == "no_function":
            results["steps"]["extract_autofill"] = "SKIP (function not found)"
            print("SKIP (batchAutoFillFromCurated not found)")
        else:
            autofill_ok = (filled or 0) >= len(meta["trials"]) * 0.5  # at least 50% auto-filled
            results["steps"]["extract_autofill"] = f"{'PASS' if autofill_ok else 'PARTIAL'} (filled={filled}/{len(meta['trials'])})"
            print(f"{'PASS' if autofill_ok else 'PARTIAL'} ({filled}/{len(meta['trials'])} filled)")
    except Exception as e:
        results["steps"]["extract_autofill"] = f"WARN: {e}"
        print(f"WARN: {e}")

    # Re-enter data for analysis (clear IDB + memory, then re-add)
    try:
        clear_studies_idb(driver)
        step_extract_data(driver, meta)
    except Exception:
        pass

    # Step 5: Analyze
    print("  [5/6] Analyze...", end=" ", flush=True)
    try:
        analysis = step_analyze(driver, meta)
        if analysis:
            results["steps"]["analyze"] = f"PASS"
            results["analysis"] = analysis

            pooled = analysis.get("pooled", "?")
            lo = analysis.get("pooledLo", "?")
            hi = analysis.get("pooledHi", "?")
            i2 = analysis.get("I2", "?")
            k = analysis.get("k", "?")
            print(f"PASS (pooled={pooled}, CI=[{lo}, {hi}], I2={i2}%, k={k})")
        else:
            results["steps"]["analyze"] = "FAIL: no result"
            results["issues"].append("Analyze: no result returned")
            print("FAIL: no result")
    except Exception as e:
        results["steps"]["analyze"] = f"FAIL: {e}"
        results["issues"].append(f"Analyze: {e}")
        print(f"FAIL: {e}")

    # Step 6: Verify against gold standard
    print("  [6/6] Verify vs published...", end=" ", flush=True)
    if results.get("analysis"):
        verification_issues = step_verify_results(meta, results["analysis"])
        if verification_issues:
            results["steps"]["verify"] = f"ISSUES: {verification_issues}"
            results["issues"].extend(verification_issues)
            print(f"ISSUES ({len(verification_issues)})")
            for vi in verification_issues:
                print(f"         - {vi}")
        else:
            results["steps"]["verify"] = "PASS"
            print("PASS - matches published meta-analysis!")
    else:
        results["steps"]["verify"] = "SKIP (no analysis)"
        print("SKIP (no analysis results)")

    # Check plots
    forest = step_check_forest_plot(driver)
    funnel = step_check_funnel_plot(driver)
    results["forest_plot"] = forest
    results["funnel_plot"] = funnel

    # Console errors
    errors = get_console_errors(driver)
    if errors:
        results["console_errors"] = [e.get("message", "")[:120] for e in errors[:5]]

    # Overall pass/fail
    critical_steps = ["protocol", "extract_direct", "analyze"]
    critical_pass = all(
        results["steps"].get(s, "").startswith("PASS")
        for s in critical_steps
    )
    verify_pass = results["steps"].get("verify", "").startswith("PASS")
    results["pass"] = critical_pass and verify_pass

    return results


def run_all_tests():
    """Run all meta-analysis validation tests."""
    print("\n" + "=" * 70)
    print("  METASPRINT AUTOPILOT — END-TO-END VALIDATION")
    print("  Testing against 3 published cardiology meta-analyses")
    print("  Protocol -> Search -> Screen -> Extract -> Analyze -> Verify")
    print("=" * 70)

    start_server()
    driver = None
    all_results = {}

    try:
        driver = create_driver()
        driver.get(BASE_URL)
        time.sleep(3)
        dismiss_banner(driver)

        # Verify app loaded
        title = driver.title
        assert "MetaSprint" in title, f"App didn't load. Title: {title}"
        print(f"\n  App loaded: {title}")

        # Run each meta-analysis test
        for i, (key, meta) in enumerate(GOLD_STANDARDS.items(), 1):
            all_results[key] = run_single_meta(driver, key, meta, i)

    except Exception as e:
        print(f"\n  FATAL ERROR: {e}")
        traceback.print_exc()
    finally:
        if driver:
            driver.quit()
        stop_server()

    # ─── Summary ───────────────────────────────────────────
    print("\n" + "=" * 70)
    print("  FINAL SUMMARY")
    print("=" * 70)

    total = len(all_results)
    passed = sum(1 for r in all_results.values() if r.get("pass"))
    failed = total - passed

    for key, res in all_results.items():
        status = "PASS" if res["pass"] else "FAIL"
        print(f"\n  [{status}] {res['name']}")

        for step_name, step_result in res["steps"].items():
            icon = "+" if step_result.startswith("PASS") else ("-" if "FAIL" in step_result else "~")
            print(f"    {icon} {step_name}: {step_result}")

        if res.get("analysis"):
            a = res["analysis"]
            print(f"    Results: pooled={a.get('pooled','?')}, "
                  f"CI=[{a.get('pooledLo','?')}, {a.get('pooledHi','?')}], "
                  f"I2={a.get('I2','?')}%, k={a.get('k','?')}")

        if res.get("forest_plot", {}).get("exists"):
            fp = res["forest_plot"]
            print(f"    Forest plot: {fp.get('rects',0)} rects, {fp.get('texts',0)} texts")
        else:
            print(f"    Forest plot: NOT RENDERED")

        if res.get("issues"):
            print(f"    Issues ({len(res['issues'])}):")
            for issue in res["issues"]:
                print(f"      ! {issue}")

        if res.get("console_errors"):
            print(f"    Console errors: {len(res['console_errors'])}")
            for err in res["console_errors"][:3]:
                print(f"      ! {err}")

    print(f"\n  {'='*40}")
    print(f"  TOTAL: {passed}/{total} PASS, {failed}/{total} FAIL")
    print(f"  {'='*40}\n")

    return passed == total, all_results


if __name__ == "__main__":
    success, results = run_all_tests()
    sys.exit(0 if success else 1)
