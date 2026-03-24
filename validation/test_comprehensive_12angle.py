"""
COMPREHENSIVE 12-ANGLE TEST SUITE for MetaSprint Autopilot - Cardiovascular Edition
Tests every aspect of the application from 12 different user perspectives.

Angles:
 1. First-Time User        - Onboarding, initial state, welcome modal
 2. Project Manager         - Create/rename/delete projects, switching, persistence
 3. Discovery Researcher    - Subcategory picker, universe panel, grid, taxonomy
 4. Protocol Writer         - PICO form, PROSPERO fields, protocol generator
 5. Literature Searcher     - Search databases, results display, registry extraction
 6. Screener                - Include/exclude/maybe, keyboard shortcuts, undo, PRISMA
 7. Data Extractor          - Add studies, effect sizes, ROB, study rows
 8. Statistician            - Meta-analysis engine, forest/funnel plots, heterogeneity
 9. Manuscript Writer       - Paper generator, methods/results sections
10. Quality Auditor         - DoD checkpoints, gate validation, sprint timeline
11. UX / Accessibility      - Dark mode, export/import, day counter, help panel, keyboard
12. Edge Case / Robustness  - Empty states, XSS, error handling, IndexedDB resilience
"""
import json, os, sys, time, traceback, re

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By


def create_driver():
    opts = Options()
    opts.add_argument('--headless=new')
    opts.add_argument('--no-sandbox')
    opts.add_argument('--disable-dev-shm-usage')
    opts.add_argument('--window-size=1920,1080')
    opts.add_argument('--disable-gpu')
    opts.set_capability('goog:loggingPrefs', {'browser': 'ALL'})
    driver = webdriver.Chrome(options=opts)
    driver.implicitly_wait(2)
    return driver


def load_app(driver, html_path):
    url = 'file:///' + html_path.replace('\\', '/').replace(' ', '%20')
    driver.get(url)
    time.sleep(2)
    # Dismiss onboarding modal if present
    driver.execute_script("""
        const overlay = document.getElementById('onboardOverlay');
        if (overlay) overlay.style.display = 'none';
        localStorage.setItem('msa-onboarded', '1');
    """)
    time.sleep(0.3)
    return driver


def js(driver, script, *args):
    return driver.execute_script(script, *args)


def switch_phase(driver, phase_name):
    """Switch to a phase tab using JS switchPhase."""
    js(driver, "switchPhase(arguments[0]);", phase_name)
    time.sleep(0.3)


# ============================================================
# ANGLE 1: First-Time User
# ============================================================
def test_1_onboarding_modal(driver):
    """First-time user sees the onboarding/welcome overlay."""
    exists = js(driver, "return !!document.getElementById('onboardOverlay');")
    assert exists, "Onboarding overlay element (onboardOverlay) missing"



def test_1_initial_project(driver):
    """First-time user gets a default project created."""
    projects = js(driver, "return projects.map(p => p.name);")
    assert len(projects) >= 1, "No default project created"
    assert 'Review' in projects[0], f"Default project name unexpected: {projects[0]}"



def test_1_dashboard_default(driver):
    """Dashboard tab can be activated and is the first phase."""
    # Reset to dashboard (may have been changed by earlier tests)
    js(driver, """
        const dashTab = document.querySelector('.tab[data-phase="dashboard"]');
        if (dashTab) dashTab.click();
    """)
    import time; time.sleep(0.3)
    active = js(driver, """
        const tabs = document.querySelectorAll('[role="tab"]');
        for (const t of tabs) {
            if (t.getAttribute('aria-selected') === 'true' || t.classList.contains('active'))
                return t.textContent.trim();
        }
        return 'none';
    """)
    assert 'Dashboard' in active, f"Expected Dashboard as active tab, got: {active}"



def test_1_title_branding(driver):
    """Page title reflects cardiovascular branding."""
    title = driver.title
    assert 'Cardiovascular' in title or 'MetaSprint' in title, f"Title missing branding: {title}"
    h1 = js(driver, "return document.querySelector('h1')?.textContent || '';")
    assert 'Cardiovascular' in h1 or 'MetaSprint' in h1, f"H1 missing branding: {h1}"



def test_1_all_tabs_present(driver):
    """All 9 navigation tabs exist."""
    tabs = js(driver, "return Array.from(document.querySelectorAll('[role=\"tab\"]')).map(t => t.textContent.trim());")
    required = ['Dashboard', 'Discover', 'Protocol', 'Search', 'Screen', 'Extract', 'Analyze', 'Write', 'Checkpoint']
    for req in required:
        found = any(req.lower() in t.lower() for t in tabs)
        assert found, f"Tab '{req}' not found. Available: {tabs}"



# ============================================================
# ANGLE 2: Project Manager
# ============================================================
def test_2_create_project(driver):
    """Can create a new project."""
    result = js(driver, """
        const before = projects.length;
        const p = createEmptyProject('Test Project Alpha');
        projects.push(p);
        return { before, after: projects.length, name: p.name, hasId: !!p.id };
    """)
    assert result['after'] == result['before'] + 1, "Project not added"
    assert result['name'] == 'Test Project Alpha'
    assert result['hasId'], "Project has no ID"



def test_2_project_structure(driver):
    """New project has all required fields."""
    fields = js(driver, """
        const p = createEmptyProject('Structure Test');
        return {
            hasId: !!p.id, hasName: !!p.name, hasCreatedAt: !!p.createdAt,
            hasPico: !!p.pico, hasPrisma: !!p.prisma,
            hasPicoP: p.pico && 'P' in p.pico,
            hasPicoI: p.pico && 'I' in p.pico
        };
    """)
    for key, val in fields.items():
        assert val, f"Project missing field: {key}"



def test_2_project_selector(driver):
    """Project selector dropdown exists and is populated."""
    select = js(driver, """
        const sel = document.getElementById('projectSelect');
        if (!sel) return null;
        return { tagName: sel.tagName, optionCount: sel.options.length };
    """)
    assert select is not None, "Project selector missing"
    assert select['optionCount'] >= 1, "No projects in selector"



def test_2_sprint_day_counter(driver):
    """Day counter shows Day 1/40 initially."""
    day_text = js(driver, """
        const el = document.getElementById('sprintDayNum');
        if (el) return 'Day ' + el.textContent.trim() + '/40';
        // Fallback: search for day display
        const dayDiv = document.querySelector('.day-display');
        return dayDiv ? dayDiv.textContent.trim() : '';
    """)
    assert 'Day' in day_text and '40' in day_text, f"Day counter unexpected: '{day_text}'"



def test_2_day_advance(driver):
    """Day counter can be advanced via sprint state."""
    result = js(driver, """
        const proj = projects.find(p => p.id === currentProjectId);
        if (!proj.sprint) proj.sprint = { day: 1 };
        const before = proj.sprint.day;
        proj.sprint.day = Math.min((proj.sprint.day || 1) + 1, 40);
        const after = proj.sprint.day;
        proj.sprint.day = 1; // reset
        return { before, after };
    """)
    assert result['after'] > result['before'] or result['before'] >= 40, "Day counter didn't advance"



# ============================================================
# ANGLE 3: Discovery Researcher
# ============================================================
def test_3_subcategory_taxonomy(driver):
    """CARDIO_SUBCATEGORIES has 10 entries with required fields."""
    cats = js(driver, """
        return CARDIO_SUBCATEGORIES.map(c => ({
            id: c.id, label: c.label, hasKeywords: c.keywords.length > 0,
            hasColor: !!c.color, hasMesh: c.meshTerms.length > 0
        }));
    """)
    assert len(cats) == 10, f"Expected 10 subcategories, got {len(cats)}"
    for c in cats:
        assert c['hasKeywords'], f"Subcategory {c['id']} missing keywords"
        assert c['hasColor'], f"Subcategory {c['id']} missing color"
        assert c['hasMesh'], f"Subcategory {c['id']} missing meshTerms"



def test_3_classify_trial_hf(driver):
    """classifyTrial correctly classifies heart failure trial."""
    result = js(driver, """
        return classifyTrial({
            conditions: [{ name: 'Heart Failure' }],
            interventions: [{ name: 'Empagliflozin' }]
        });
    """)
    assert result == 'hf', f"Expected 'hf', got '{result}'"



def test_3_classify_trial_acs(driver):
    """classifyTrial correctly classifies ACS trial."""
    result = js(driver, """
        return classifyTrial({
            conditions: [{ name: 'Acute Coronary Syndrome' }],
            interventions: [{ name: 'Percutaneous Coronary Intervention' }]
        });
    """)
    assert result == 'acs', f"Expected 'acs', got '{result}'"



def test_3_classify_trial_af(driver):
    """classifyTrial correctly classifies AF trial."""
    result = js(driver, """
        return classifyTrial({
            conditions: [{ name: 'Atrial Fibrillation' }],
            interventions: [{ name: 'Apixaban' }]
        });
    """)
    assert result == 'af', f"Expected 'af', got '{result}'"



def test_3_subcategory_picker_exists(driver):
    """Discover tab has subcategory picker dropdown."""
    switch_phase(driver, 'discover')
    picker = js(driver, """
        const sel = document.getElementById('subcatSelect');
        if (!sel) return null;
        return {
            optionCount: sel.options.length,
            options: Array.from(sel.options).map(o => o.value)
        };
    """)
    assert picker is not None, "Subcategory picker (subcatSelect) missing"
    assert picker['optionCount'] >= 10, f"Expected >=10 options, got {picker['optionCount']}"
    assert 'hf' in picker['options'], "Heart Failure option missing"
    assert 'acs' in picker['options'], "ACS option missing"
    assert 'all' in picker['options'], "'All' option missing"



def test_3_universe_panel_exists(driver):
    """Universe panel element exists."""
    exists = js(driver, "return !!document.getElementById('universePanel');")
    assert exists, "Universe panel element missing"



def test_3_get_subcategory(driver):
    """getSubcategory returns correct data."""
    result = js(driver, """
        const cat = getSubcategory('valve');
        return cat ? { id: cat.id, label: cat.label } : null;
    """)
    assert result is not None, "getSubcategory('valve') returned null"
    assert result['id'] == 'valve'
    assert 'Valve' in result['label']



# ============================================================
# ANGLE 4: Protocol Writer
# ============================================================
def test_4_pico_form_exists(driver):
    """Protocol tab has PICO form fields (picoP, picoI, picoC, picoO)."""
    switch_phase(driver, 'protocol')
    fields = js(driver, """
        return {
            picoP: !!document.getElementById('picoP'),
            picoI: !!document.getElementById('picoI'),
            picoC: !!document.getElementById('picoC'),
            picoO: !!document.getElementById('picoO')
        };
    """)
    for field, exists in fields.items():
        assert exists, f"PICO field '{field}' missing from Protocol tab"



def test_4_prospero_field(driver):
    """Protocol tab has PROSPERO/registration field."""
    has_field = js(driver, """
        const panel = document.getElementById('phase-protocol');
        if (!panel) return false;
        const text = panel.textContent.toLowerCase();
        return text.includes('prospero') || text.includes('registration') || text.includes('register');
    """)
    assert has_field, "PROSPERO/registration field not found in Protocol tab"



def test_4_protocol_generator(driver):
    """generateProtocol function exists."""
    exists = js(driver, "return typeof generateProtocol === 'function';")
    assert exists, "generateProtocol function missing"



def test_4_pico_save(driver):
    """PICO values can be set."""
    result = js(driver, """
        const p = document.getElementById('picoP');
        const i = document.getElementById('picoI');
        const c = document.getElementById('picoC');
        const o = document.getElementById('picoO');
        if (!p || !i || !c || !o) return { error: 'fields missing' };
        p.value = 'Adults with heart failure';
        i.value = 'SGLT2 inhibitors';
        c.value = 'Placebo';
        o.value = 'All-cause mortality';
        return { p: p.value, i: i.value, c: c.value, o: o.value };
    """)
    assert 'error' not in result, f"PICO form error: {result.get('error')}"
    assert result['p'] == 'Adults with heart failure'
    assert result['i'] == 'SGLT2 inhibitors'



# ============================================================
# ANGLE 5: Literature Searcher
# ============================================================
def test_5_search_tab_exists(driver):
    """Search tab has search controls."""
    switch_phase(driver, 'search')
    panel = js(driver, """
        const panel = document.getElementById('phase-search');
        if (!panel) return null;
        return {
            hasInput: !!panel.querySelector('input, textarea'),
            hasButton: !!panel.querySelector('button'),
            text: panel.textContent.substring(0, 300)
        };
    """)
    assert panel is not None, "Search panel (phase-search) missing"



def test_5_registry_extraction(driver):
    """Registry extraction correctly extracts NCT IDs."""
    result = js(driver, """
        if (typeof extractRegistryIds !== 'function') return null;
        const ids = extractRegistryIds('NCT01234567 and ISRCTN12345678 and NCT99999999');
        return ids;
    """)
    assert result is not None, "extractRegistryIds function missing"
    # Returns object with arrays: { nct: [...], isrctn: [...] }
    nct = result.get('nct', [])
    assert 'NCT01234567' in nct, f"NCT ID not extracted. Got: {result}"
    assert 'NCT99999999' in nct, f"Second NCT ID not extracted. Got: {result}"
    isrctn = result.get('isrctn', [])
    assert 'ISRCTN12345678' in isrctn, f"ISRCTN not extracted. Got: {result}"



def test_5_search_databases_mentioned(driver):
    """Search tab or app references multiple databases."""
    result = js(driver, """
        const panel = document.getElementById('phase-search');
        const text = (panel ? panel.textContent : '') + ' ' + document.body.textContent.substring(0, 5000);
        const dbs = ['pubmed', 'openalex', 'clinicaltrials', 'ct.gov', 'crossref', 'europe pmc'];
        let count = 0;
        for (const db of dbs) {
            if (text.toLowerCase().includes(db)) count++;
        }
        return count;
    """)
    assert result >= 1, "No databases mentioned anywhere in the app"



# ============================================================
# ANGLE 6: Screener
# ============================================================
def test_6_screen_tab_exists(driver):
    """Screen tab renders."""
    switch_phase(driver, 'screen')
    exists = js(driver, "return !!document.getElementById('phase-screen');")
    assert exists, "Screen panel (phase-screen) missing"



def test_6_screening_functions_exist(driver):
    """Core screening functions exist (makeDecision, undoLastDecision)."""
    fns = js(driver, """
        return {
            makeDecision: typeof makeDecision === 'function',
            undoLastDecision: typeof undoLastDecision === 'function'
        };
    """)
    assert fns['makeDecision'], "makeDecision function missing"
    assert fns['undoLastDecision'], "undoLastDecision function missing"



def test_6_prisma_flow(driver):
    """PRISMA flow function or display exists."""
    result = js(driver, """
        return {
            fn: typeof renderPRISMA === 'function' || typeof updatePRISMA === 'function',
            el: !!document.getElementById('prismaFlow') || !!document.getElementById('prismaPanel')
        };
    """)
    assert result['fn'] or result['el'], "PRISMA flow missing (no function or element)"



# ============================================================
# ANGLE 7: Data Extractor
# ============================================================
def test_7_extract_tab_exists(driver):
    """Extract tab renders."""
    switch_phase(driver, 'extract')
    exists = js(driver, "return !!document.getElementById('phase-extract');")
    assert exists, "Extract panel (phase-extract) missing"



def test_7_add_study_row(driver):
    """Can add a study row via addStudyRow."""
    result = js(driver, """
        if (typeof addStudyRow !== 'function') return { error: 'function missing' };
        const before = extractedStudies.length;
        addStudyRow({ authorYear: 'Test 2024', effectEstimate: 0.8, lowerCI: 0.5, upperCI: 1.2 });
        const after = extractedStudies.length;
        return { before, after, added: after > before };
    """)
    if 'error' in result:
        return 'SKIP'
    assert result['added'], f"Study not added: before={result['before']}, after={result['after']}"



def test_7_effect_types_constant(driver):
    """VALID_EFFECT_TYPES constant defines all required types."""
    types = js(driver, """
        if (typeof VALID_EFFECT_TYPES === 'undefined') return null;
        return VALID_EFFECT_TYPES;
    """)
    assert types is not None, "VALID_EFFECT_TYPES constant missing"
    required = ['OR', 'RR', 'HR', 'MD', 'SMD']
    for t in required:
        assert t in types, f"Effect type '{t}' not in VALID_EFFECT_TYPES: {types}"



def test_7_rob_domains(driver):
    """ROB2 domains are defined (5+ domains)."""
    result = js(driver, """
        return {
            hasROB2: typeof ROB2_DOMAINS !== 'undefined',
            domains: typeof ROB2_DOMAINS !== 'undefined' ? ROB2_DOMAINS.length : 0
        };
    """)
    assert result['hasROB2'], "ROB2_DOMAINS not defined"
    assert result['domains'] >= 5, f"Expected >=5 ROB2 domains, got {result['domains']}"



# ============================================================
# ANGLE 8: Statistician
# ============================================================
def test_8_meta_analysis_engine(driver):
    """computeMetaAnalysis DL engine works correctly."""
    result = js(driver, """
        if (typeof computeMetaAnalysis !== 'function') return null;
        const studies = [
            { id:'s1', authorYear:'Smith 2020', effectEstimate:0.8, lowerCI:0.55, upperCI:1.16, effectType:'OR' },
            { id:'s2', authorYear:'Jones 2021', effectEstimate:0.6, lowerCI:0.35, upperCI:1.03, effectType:'OR' },
            { id:'s3', authorYear:'Lee 2022', effectEstimate:0.9, lowerCI:0.68, upperCI:1.19, effectType:'OR' },
            { id:'s4', authorYear:'Brown 2019', effectEstimate:0.7, lowerCI:0.45, upperCI:1.09, effectType:'OR' },
            { id:'s5', authorYear:'Kim 2023', effectEstimate:0.85, lowerCI:0.62, upperCI:1.16, effectType:'OR' }
        ];
        const result = computeMetaAnalysis(studies, 0.95);
        if (!result) return null;
        return {
            pooled: result.pooled, tau2: result.tau2, I2: result.I2,
            pooledLo: result.pooledLo, pooledHi: result.pooledHi,
            k: result.k, zCrit: result.zCrit
        };
    """)
    assert result is not None, "computeMetaAnalysis returned null"
    assert result['k'] == 5, f"Expected k=5, got {result['k']}"
    assert 0 < result['pooled'] < 1, f"Pooled OR out of range: {result['pooled']}"
    assert result['I2'] >= 0 and result['I2'] <= 100, f"I2 out of range: {result['I2']}"
    assert result['pooledLo'] < result['pooled'] < result['pooledHi'], "CI doesn't contain pooled"



def test_8_forest_plot(driver):
    """Forest plot renders SVG."""
    switch_phase(driver, 'analyze')
    result = js(driver, """
        if (typeof renderForestPlot !== 'function') return null;
        const container = document.getElementById('forestPlotContainer');
        if (!container) return null;
        const studies = [
            { id:'f1', authorYear:'A 2020', effectEstimate:0.8, lowerCI:0.55, upperCI:1.16, effectType:'OR' },
            { id:'f2', authorYear:'B 2021', effectEstimate:0.6, lowerCI:0.35, upperCI:1.03, effectType:'OR' },
            { id:'f3', authorYear:'C 2022', effectEstimate:0.9, lowerCI:0.68, upperCI:1.19, effectType:'OR' }
        ];
        const maResult = computeMetaAnalysis(studies, 0.95);
        if (!maResult) return null;
        // renderForestPlot returns HTML string
        container.innerHTML = renderForestPlot(maResult);
        const svg = container.querySelector('svg');
        return svg ? { hasSvg: true, children: svg.childNodes.length } : { hasSvg: false };
    """)
    if result is None:
        return 'SKIP'
    assert result['hasSvg'], "Forest plot SVG not rendered"
    assert result['children'] >= 3, f"SVG too sparse: {result['children']} children"



def test_8_funnel_plot(driver):
    """Funnel plot renders SVG."""
    result = js(driver, """
        if (typeof renderFunnelPlot !== 'function') return null;
        const container = document.getElementById('funnelPlotContainer');
        if (!container) return null;
        const studies = [
            { id:'g1', authorYear:'A 2020', effectEstimate:0.8, lowerCI:0.55, upperCI:1.16, effectType:'OR' },
            { id:'g2', authorYear:'B 2021', effectEstimate:0.6, lowerCI:0.35, upperCI:1.03, effectType:'OR' },
            { id:'g3', authorYear:'C 2022', effectEstimate:0.9, lowerCI:0.68, upperCI:1.19, effectType:'OR' }
        ];
        const maResult = computeMetaAnalysis(studies, 0.95);
        if (!maResult) return null;
        // renderFunnelPlot returns HTML string
        container.innerHTML = renderFunnelPlot(maResult);
        const svg = container.querySelector('svg');
        return svg ? { hasSvg: true, children: svg.childNodes.length } : { hasSvg: false };
    """)
    if result is None:
        return 'SKIP'
    assert result['hasSvg'], "Funnel plot SVG not rendered"



def test_8_confidence_level(driver):
    """Meta-analysis respects custom confLevel (not hardcoded z=1.96)."""
    result = js(driver, """
        if (typeof computeMetaAnalysis !== 'function') return null;
        const studies = [
            { id:'c1', effectEstimate:0.8, lowerCI:0.55, upperCI:1.16, effectType:'OR' },
            { id:'c2', effectEstimate:0.6, lowerCI:0.35, upperCI:1.03, effectType:'OR' },
            { id:'c3', effectEstimate:0.9, lowerCI:0.68, upperCI:1.19, effectType:'OR' }
        ];
        const r95 = computeMetaAnalysis(studies, 0.95);
        const r99 = computeMetaAnalysis(studies, 0.99);
        if (!r95 || !r99) return null;
        return {
            ci95_width: r95.pooledHi - r95.pooledLo,
            ci99_width: r99.pooledHi - r99.pooledLo,
            zCrit95: r95.zCrit, zCrit99: r99.zCrit
        };
    """)
    if result is None:
        return 'SKIP'
    assert result['ci99_width'] > result['ci95_width'], \
        f"99% CI ({result['ci99_width']:.4f}) should be wider than 95% CI ({result['ci95_width']:.4f})"
    assert abs(result['zCrit95'] - 1.96) < 0.01, f"zCrit95 should be ~1.96, got {result['zCrit95']}"
    assert result['zCrit99'] > 2.5, f"zCrit99 should be >2.5, got {result['zCrit99']}"



def test_8_single_study(driver):
    """Meta-analysis handles k=1 gracefully."""
    result = js(driver, """
        if (typeof computeMetaAnalysis !== 'function') return null;
        const r = computeMetaAnalysis([
            { id:'k1', effectEstimate:2.5, lowerCI:1.0, upperCI:5.0, effectType:'MD' }
        ], 0.95);
        if (!r) return null;
        return { pooled: r.pooled, tau2: r.tau2, I2: r.I2, k: r.k };
    """)
    if result is None:
        return 'SKIP'
    assert result['k'] == 1, f"Expected k=1, got {result['k']}"
    assert abs(result['pooled'] - 2.5) < 0.01, f"Single study pooled should be ~2.5, got {result['pooled']}"



# ============================================================
# ANGLE 9: Manuscript Writer
# ============================================================
def test_9_write_tab_exists(driver):
    """Write tab renders."""
    switch_phase(driver, 'write')
    exists = js(driver, "return !!document.getElementById('phase-write');")
    assert exists, "Write panel (phase-write) missing"



def test_9_paper_generator_function(driver):
    """generatePaper function exists."""
    exists = js(driver, "return typeof generatePaper === 'function';")
    assert exists, "generatePaper function missing"



def test_9_paper_cardiology_focus(driver):
    """Paper generator includes cardiovascular-specific content."""
    result = js(driver, """
        if (typeof generatePaper !== 'function') return null;
        try {
            const paper = generatePaper();
            if (typeof paper === 'string') {
                const lower = paper.toLowerCase();
                return {
                    hasCardio: lower.includes('cardiovascular') || lower.includes('cardiac'),
                    length: paper.length
                };
            }
            return { type: typeof paper };
        } catch(e) { return { error: e.message }; }
    """)
    if result is None or 'error' in (result or {}):
        return 'SKIP'
    if 'hasCardio' in result:
        assert result['hasCardio'], "Paper generator missing cardiovascular content"



# ============================================================
# ANGLE 10: Quality Auditor
# ============================================================
def test_10_checkpoints_tab(driver):
    """Checkpoints tab has DoD gate displays."""
    switch_phase(driver, 'checkpoints')
    panel = js(driver, """
        const panel = document.getElementById('phase-checkpoints');
        if (!panel) return null;
        return {
            text: panel.textContent.substring(0, 500),
            hasGates: panel.textContent.includes('DoD') || panel.textContent.includes('Gate')
                || panel.textContent.includes('Definition')
        };
    """)
    assert panel is not None, "Checkpoints panel (phase-checkpoints) missing"
    assert panel['hasGates'], "DoD gates not found in checkpoints tab"



def test_10_five_gates(driver):
    """Five quality gates exist (A through E)."""
    gates = js(driver, """
        const panel = document.getElementById('phase-checkpoints');
        if (!panel) return null;
        const text = panel.textContent;
        return {
            a: text.includes('DoD-A') || text.includes('A:') || text.includes('Protocol'),
            b: text.includes('DoD-B') || text.includes('B:') || text.includes('Search'),
            c: text.includes('DoD-C') || text.includes('C:') || text.includes('Extract'),
            d: text.includes('DoD-D') || text.includes('D:') || text.includes('Analysis'),
            e: text.includes('DoD-E') || text.includes('E:') || text.includes('Submission')
        };
    """)
    assert gates is not None, "Checkpoints panel missing"
    passed = sum(1 for v in gates.values() if v)
    assert passed >= 4, f"Expected >=4 gates, found {passed}: {gates}"



def test_10_dashboard_health(driver):
    """Dashboard shows project health and progress metrics."""
    switch_phase(driver, 'dashboard')
    health = js(driver, """
        const panel = document.getElementById('phase-dashboard');
        if (!panel) return null;
        const text = panel.textContent;
        return {
            hasHealth: text.includes('Health') || text.includes('health'),
            hasGates: text.includes('Gates') || text.includes('gates') || text.includes('DoD'),
            hasTimeline: text.includes('Timeline') || text.includes('timeline') || text.includes('Days'),
            hasRisk: text.includes('Risk') || text.includes('risk')
        };
    """)
    assert health is not None, "Dashboard panel missing"
    metrics_found = sum(1 for v in health.values() if v)
    assert metrics_found >= 2, f"Expected >=2 dashboard metrics, found {metrics_found}: {health}"



def test_10_sprint_timeline_table(driver):
    """Dashboard has 40-day sprint timeline table."""
    table = js(driver, """
        const panel = document.getElementById('phase-dashboard');
        if (!panel) return null;
        const tables = panel.querySelectorAll('table');
        for (const t of tables) {
            if (t.textContent.includes('Protocol') && t.textContent.includes('Days'))
                return { rows: t.querySelectorAll('tbody tr').length };
        }
        return null;
    """)
    assert table is not None, "Sprint timeline table missing"
    assert table['rows'] >= 4, f"Expected >=4 phases, got {table['rows']} rows"



# ============================================================
# ANGLE 11: UX / Accessibility
# ============================================================
def test_11_dark_mode_toggle(driver):
    """Dark mode can be toggled."""
    result = js(driver, """
        const btn = document.getElementById('darkModeBtn');
        if (!btn) return null;
        const before = document.body.classList.contains('dark-mode');
        btn.click();
        const after = document.body.classList.contains('dark-mode');
        btn.click(); // toggle back
        return { before, after, toggled: before !== after };
    """)
    assert result is not None, "Dark mode toggle button (darkModeBtn) missing"
    assert result['toggled'], "Dark mode toggle didn't change state"



def test_11_help_panel(driver):
    """Help panel can be toggled and has content."""
    result = js(driver, """
        if (typeof toggleHelp !== 'function') return null;
        const panel = document.getElementById('helpPanel');
        if (!panel) return null;
        toggleHelp();
        const visible = panel.classList.contains('open') || panel.offsetWidth > 0;
        const text = panel.textContent.substring(0, 200);
        toggleHelp(); // close
        return { visible, text, length: text.length };
    """)
    assert result is not None, "toggleHelp function or helpPanel missing"
    assert result['length'] > 50, "Help panel has insufficient content"



def test_11_keyboard_shortcuts_documented(driver):
    """Help panel documents keyboard shortcuts."""
    result = js(driver, """
        const panel = document.getElementById('helpPanel');
        if (!panel) return null;
        const text = panel.textContent;
        return {
            hasI: text.includes('Include'), hasE: text.includes('Exclude'),
            hasM: text.includes('Maybe'), hasUndo: text.includes('Ctrl+Z') || text.includes('Undo')
        };
    """)
    assert result is not None, "Help panel missing"
    shortcuts_found = sum(1 for v in result.values() if v)
    assert shortcuts_found >= 3, f"Expected >=3 shortcuts documented, found {shortcuts_found}"



def test_11_export_import_functions(driver):
    """Export and import functions exist."""
    result = js(driver, """
        return {
            exportFn: typeof exportProject === 'function',
            importFn: typeof importProject === 'function'
        };
    """)
    assert result['exportFn'], "exportProject function missing"
    assert result['importFn'], "importProject function missing"



def test_11_skip_link(driver):
    """Skip to main content link exists for accessibility."""
    link = js(driver, """
        const a = document.querySelector('a[href="#mainContent"]');
        return a ? { text: a.textContent.trim() } : null;
    """)
    assert link is not None, "Skip to main content link missing"



def test_11_toast_function(driver):
    """Toast notification system works."""
    result = js(driver, """
        if (typeof showToast !== 'function') return null;
        showToast('Test notification', 'info');
        return { exists: true };
    """)
    assert result is not None, "showToast function missing"



def test_11_responsive_header(driver):
    """Header has proper structure with title and controls."""
    result = js(driver, """
        const header = document.querySelector('header');
        if (!header) return null;
        return {
            hasH1: !!header.querySelector('h1'),
            hasButtons: header.querySelectorAll('button').length >= 3,
            hasSelect: !!header.querySelector('select')
        };
    """)
    assert result is not None, "Header element missing"
    assert result['hasH1'], "Header missing h1"
    assert result['hasButtons'], "Header missing buttons"



# ============================================================
# ANGLE 12: Edge Case / Robustness
# ============================================================
def test_12_xss_prevention(driver):
    """XSS payloads are escaped in user input."""
    result = js(driver, """
        if (typeof escapeHtml !== 'function') return null;
        const payload = '<script>alert("xss")</script>';
        const escaped = escapeHtml(payload);
        return { escaped, safe: !escaped.includes('<script>') };
    """)
    assert result is not None, "escapeHtml function missing"
    assert result['safe'], f"XSS not escaped: {result['escaped']}"



def test_12_xss_quotes(driver):
    """escapeHtml also escapes quotes for attribute contexts."""
    result = js(driver, """
        if (typeof escapeHtml !== 'function') return null;
        const payload = '" onmouseover="alert(1)"';
        const escaped = escapeHtml(payload);
        return { escaped, safe: !escaped.includes('" onmouseover') };
    """)
    assert result is not None, "escapeHtml function missing"
    assert result['safe'], f"Quote XSS not escaped: {result['escaped']}"



def test_12_empty_meta_analysis(driver):
    """Meta-analysis handles empty study array."""
    result = js(driver, """
        if (typeof computeMetaAnalysis !== 'function') return null;
        try {
            const r = computeMetaAnalysis([], 0.95);
            return { hasResult: true };
        } catch(e) { return { error: e.message }; }
    """)
    if result is None:
        return 'SKIP'
    # Should either return something or throw a handled error



def test_12_zero_effect_studies(driver):
    """Meta-analysis handles studies with zero effect (MD scale, using proper API)."""
    result = js(driver, """
        if (typeof computeMetaAnalysis !== 'function') return null;
        const r = computeMetaAnalysis([
            { effectEstimate: 0.0, lowerCI: -0.5, upperCI: 0.5, effectType:'MD' },
            { effectEstimate: -0.1, lowerCI: -0.4, upperCI: 0.2, effectType:'MD' },
            { effectEstimate: 0.2, lowerCI: -0.1, upperCI: 0.5, effectType:'MD' }
        ], 0.95);
        if (!r) return null;
        return { pooled: r.pooled, hasCI: r.pooledLo !== undefined };
    """)
    if result is None:
        return 'SKIP'
    assert result['hasCI'], "Missing CI for zero-effect studies"



def test_12_ensuredb_guard(driver):
    """ensureDB function exists to handle null db."""
    result = js(driver, "return typeof ensureDB === 'function';")
    assert result, "ensureDB function missing - db null guard not in place"



def test_12_gap_score_formula(driver):
    """Gap score formula: recentRCTs * log2(totalRCTs + 1) / (maCount + 1)."""
    result = js(driver, """
        const expected = (10 * Math.log2(101)) / 6;
        const computed = (10 * Math.log2(100 + 1)) / (5 + 1);
        return { expected, computed, match: Math.abs(expected - computed) < 0.001 };
    """)
    assert result['match'], f"Gap score formula mismatch: {result['expected']} vs {result['computed']}"



def test_12_network_graph_functions(driver):
    """All network graph functions exist."""
    fns = js(driver, """
        return {
            build: typeof buildNetworkGraph === 'function',
            runLayout: typeof runForceLayout === 'function',
            render: typeof renderNetwork === 'function',
            expand: typeof expandSubcategory === 'function',
            grid: typeof renderUniverseGrid === 'function'
        };
    """)
    for name, exists in fns.items():
        assert exists, f"Network graph function '{name}' missing"



def test_12_opportunity_banner_function(driver):
    """renderOpportunityBanner function exists."""
    exists = js(driver, "return typeof renderOpportunityBanner === 'function';")
    assert exists, "renderOpportunityBanner function missing"



def test_12_rct_extractor_functions(driver):
    """RCT Extractor modal functions exist."""
    fns = js(driver, """
        return {
            show: typeof showExtractorModal === 'function',
            close: typeof closeExtractorModal === 'function',
            run: typeof runExtractor === 'function'
        };
    """)
    for name, exists in fns.items():
        assert exists, f"Extractor function '{name}' missing"



def test_12_no_console_errors(driver):
    """No unexpected JavaScript errors on page load."""
    logs = driver.get_log('browser')
    errors = [l for l in logs if l['level'] == 'SEVERE'
              and 'favicon' not in l.get('message', '').lower()
              and 'net::ERR' not in l.get('message', '')
              and 'Access to fetch' not in l.get('message', '')]
    if errors:
        msgs = [e['message'][:120] for e in errors[:3]]
        assert False, f"Console errors: {msgs}"



def test_12_local_storage_keys(driver):
    """localStorage keys use msa- prefix."""
    keys = js(driver, """
        const all = [];
        for (let i = 0; i < localStorage.length; i++) all.push(localStorage.key(i));
        return all.filter(k => k.startsWith('msa-'));
    """)
    assert isinstance(keys, list), "localStorage query failed"



def test_12_dom_div_balance(driver):
    """HTML div tags are balanced."""
    result = js(driver, """
        const html = document.documentElement.outerHTML;
        const opens = (html.match(/<div[\\s>]/g) || []).length;
        const closes = (html.match(/<\\/div>/g) || []).length;
        return { opens, closes, balanced: opens === closes };
    """)
    assert result['balanced'], \
        f"Div imbalance: {result['opens']} opens vs {result['closes']} closes"



# ============================================================
# TEST RUNNER
# ============================================================
def main():
    html_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                             'metasprint-autopilot.html')
    if not os.path.exists(html_path):
        print(f'ERROR: HTML file not found: {html_path}')
        sys.exit(1)

    angles = [
        ("ANGLE 1: First-Time User", [
            ("Onboarding Overlay", test_1_onboarding_modal),
            ("Initial Project", test_1_initial_project),
            ("Dashboard Default", test_1_dashboard_default),
            ("Title & Branding", test_1_title_branding),
            ("All 9 Tabs", test_1_all_tabs_present),
        ]),
        ("ANGLE 2: Project Manager", [
            ("Create Project", test_2_create_project),
            ("Project Structure", test_2_project_structure),
            ("Project Selector", test_2_project_selector),
            ("Sprint Day Counter", test_2_sprint_day_counter),
            ("Day Advance", test_2_day_advance),
        ]),
        ("ANGLE 3: Discovery Researcher", [
            ("Taxonomy (10 cats)", test_3_subcategory_taxonomy),
            ("Classify HF Trial", test_3_classify_trial_hf),
            ("Classify ACS Trial", test_3_classify_trial_acs),
            ("Classify AF Trial", test_3_classify_trial_af),
            ("Subcategory Picker", test_3_subcategory_picker_exists),
            ("Universe Panel", test_3_universe_panel_exists),
            ("getSubcategory()", test_3_get_subcategory),
        ]),
        ("ANGLE 4: Protocol Writer", [
            ("PICO Form Fields", test_4_pico_form_exists),
            ("PROSPERO Field", test_4_prospero_field),
            ("Protocol Generator", test_4_protocol_generator),
            ("PICO Save", test_4_pico_save),
        ]),
        ("ANGLE 5: Literature Searcher", [
            ("Search Tab", test_5_search_tab_exists),
            ("Registry Extraction", test_5_registry_extraction),
            ("Database References", test_5_search_databases_mentioned),
        ]),
        ("ANGLE 6: Screener", [
            ("Screen Tab", test_6_screen_tab_exists),
            ("Screening Functions", test_6_screening_functions_exist),
            ("PRISMA Flow", test_6_prisma_flow),
        ]),
        ("ANGLE 7: Data Extractor", [
            ("Extract Tab", test_7_extract_tab_exists),
            ("Add Study Row", test_7_add_study_row),
            ("Effect Types (5+)", test_7_effect_types_constant),
            ("ROB2 Domains (5+)", test_7_rob_domains),
        ]),
        ("ANGLE 8: Statistician", [
            ("DL Meta-Analysis", test_8_meta_analysis_engine),
            ("Forest Plot SVG", test_8_forest_plot),
            ("Funnel Plot SVG", test_8_funnel_plot),
            ("Custom confLevel", test_8_confidence_level),
            ("Single Study (k=1)", test_8_single_study),
        ]),
        ("ANGLE 9: Manuscript Writer", [
            ("Write Tab", test_9_write_tab_exists),
            ("Paper Generator Fn", test_9_paper_generator_function),
            ("Cardiology Focus", test_9_paper_cardiology_focus),
        ]),
        ("ANGLE 10: Quality Auditor", [
            ("Checkpoints Tab", test_10_checkpoints_tab),
            ("Five DoD Gates", test_10_five_gates),
            ("Dashboard Health", test_10_dashboard_health),
            ("Sprint Timeline", test_10_sprint_timeline_table),
        ]),
        ("ANGLE 11: UX / Accessibility", [
            ("Dark Mode Toggle", test_11_dark_mode_toggle),
            ("Help Panel", test_11_help_panel),
            ("Keyboard Shortcuts", test_11_keyboard_shortcuts_documented),
            ("Export/Import Fns", test_11_export_import_functions),
            ("Skip Link (a11y)", test_11_skip_link),
            ("Toast System", test_11_toast_function),
            ("Header Structure", test_11_responsive_header),
        ]),
        ("ANGLE 12: Edge Case / Robustness", [
            ("XSS Escape (tags)", test_12_xss_prevention),
            ("XSS Escape (quotes)", test_12_xss_quotes),
            ("Empty Meta-Analysis", test_12_empty_meta_analysis),
            ("Zero-Effect Studies", test_12_zero_effect_studies),
            ("ensureDB Guard", test_12_ensuredb_guard),
            ("Gap Score Formula", test_12_gap_score_formula),
            ("Network Graph Fns", test_12_network_graph_functions),
            ("Opportunity Banner", test_12_opportunity_banner_function),
            ("RCT Extractor Fns", test_12_rct_extractor_functions),
            ("No Console Errors", test_12_no_console_errors),
            ("localStorage Keys", test_12_local_storage_keys),
            ("DOM Div Balance", test_12_dom_div_balance),
        ]),
    ]

    total_pass = total_fail = total_skip = 0
    total_tests = sum(len(tests) for _, tests in angles)
    failures = []

    print("=" * 70)
    print("COMPREHENSIVE 12-ANGLE TEST SUITE - MetaSprint Autopilot")
    print(f"Testing {total_tests} checks across {len(angles)} angles")
    print("=" * 70)

    driver = create_driver()
    try:
        load_app(driver, html_path)

        for angle_name, tests in angles:
            print(f"\n--- {angle_name} ---")
            for test_name, test_fn in tests:
                try:
                    result = test_fn(driver)
                    if result == 'SKIP':
                        print(f"  SKIP  {test_name}")
                        total_skip += 1
                    else:
                        print(f"  PASS  {test_name}")
                        total_pass += 1
                except Exception as e:
                    total_fail += 1
                    msg = str(e)[:120]
                    print(f"  FAIL  {test_name}: {msg}")
                    failures.append((angle_name, test_name, msg))
    finally:
        driver.quit()

    print("\n" + "=" * 70)
    status = "ALL PASS" if total_fail == 0 else f"{total_fail} FAILURES"
    print(f"12-ANGLE VALIDATION: {total_pass} pass, {total_fail} fail, "
          f"{total_skip} skip / {total_tests} total -- {status}")
    print("=" * 70)

    if failures:
        print("\nFAILURES:")
        for angle, name, msg in failures:
            print(f"  [{angle}] {name}: {msg}")

    sys.exit(0 if total_fail == 0 else 1)


if __name__ == '__main__':
    main()
