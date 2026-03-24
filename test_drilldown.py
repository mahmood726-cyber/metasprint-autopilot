"""Test drill-down provenance system: all universe views should be clickable."""
import sys, io, time, json, os
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

opts = Options()
opts.add_argument('--headless=new')
opts.add_argument('--no-sandbox')
opts.add_argument('--disable-dev-shm-usage')
opts.add_argument('--window-size=1920,1080')
opts.set_capability('goog:loggingPrefs', {'browser': 'ALL'})
driver = webdriver.Chrome(options=opts)
driver.implicitly_wait(2)

html_path = os.path.normpath(os.path.abspath('metasprint-autopilot.html'))
url = 'file:///' + html_path.replace(os.sep, '/').replace(' ', '%20')
driver.get(url)
time.sleep(4)

# Dismiss onboarding
driver.execute_script(
    'var m = document.getElementById("onboardOverlay");'
    'if (m) m.style.display = "none";'
    'try { localStorage.setItem("msa-onboarded", "1"); } catch(e) {}'
)
time.sleep(1)

passes = 0
fails = 0

def check(name, condition, detail=''):
    global passes, fails
    if condition:
        passes += 1
        print(f"  PASS  {name}" + (f" ({detail})" if detail else ''))
    else:
        fails += 1
        print(f"  FAIL  {name}" + (f" ({detail})" if detail else ''))

# === TEST 1: Drill-down functions exist ===
print("=== DRILL-DOWN FUNCTIONS ===")
fns = driver.execute_script("""
    return {
        showDrillDownPanel: typeof showDrillDownPanel === 'function',
        drillDownAlBurhanCluster: typeof drillDownAlBurhanCluster === 'function',
        drillDownAyatNode: typeof drillDownAyatNode === 'function',
        drillDownNetworkEdge: typeof drillDownNetworkEdge === 'function',
        drillDownNetworkNode: typeof drillDownNetworkNode === 'function',
        drillDownMatrixCell: typeof drillDownMatrixCell === 'function',
        drillDownTimelineYear: typeof drillDownTimelineYear === 'function',
        drillDownPipelinePhase: typeof drillDownPipelinePhase === 'function'
    };
""")
for name, exists in fns.items():
    check(name, exists)

# === TEST 2: Drill-down panel HTML element exists ===
print("\n=== DRILL-DOWN PANEL ===")
panel = driver.execute_script("""
    return {
        panelExists: !!document.getElementById('drillDownPanel'),
        titleExists: !!document.getElementById('drillDownTitle'),
        bodyExists: !!document.getElementById('drillDownBody'),
        panelHidden: document.getElementById('drillDownPanel')?.style.display === 'none'
    };
""")
for name, val in panel.items():
    check(name, val)

# === TEST 3: showDrillDownPanel opens and populates ===
print("\n=== PANEL OPEN/CLOSE ===")
result = driver.execute_script("""
    showDrillDownPanel('Test Title', '<p>Test Body Content</p>');
    var panel = document.getElementById('drillDownPanel');
    var title = document.getElementById('drillDownTitle').textContent;
    var body = document.getElementById('drillDownBody').innerHTML;
    var visible = panel.style.display !== 'none';
    // Close it
    panel.style.display = 'none';
    return { visible: visible, title: title, bodyContains: body.includes('Test Body Content') };
""")
check('Panel opens', result['visible'])
check('Title set', result['title'] == 'Test Title')
check('Body populated', result['bodyContains'])

# === TEST 4: Network node click triggers drill-down ===
print("\n=== NETWORK NODE DRILL-DOWN ===")
driver.execute_script('switchPhase("discover")')
time.sleep(2)
driver.execute_script('switchUniverseView("network")')
time.sleep(1)

net_result = driver.execute_script("""
    // Close any open panel
    document.getElementById('drillDownPanel').style.display = 'none';
    // Call drillDownNetworkNode directly if nodes exist
    if (networkNodes && networkNodes.length > 0) {
        drillDownNetworkNode(0);
        var panel = document.getElementById('drillDownPanel');
        var title = document.getElementById('drillDownTitle').textContent;
        var body = document.getElementById('drillDownBody').innerHTML;
        return {
            opened: panel.style.display !== 'none',
            hasTitle: title.length > 0,
            hasNCTLinks: body.includes('clinicaltrials.gov'),
            hasTrialTable: body.includes('<table'),
            hasGuidelines: body.includes('Guideline') || body.includes('guideline'),
            bodyLength: body.length
        };
    }
    return { opened: false, error: 'No network nodes' };
""")
check('Network drill-down opens', net_result.get('opened', False))
check('Has title', net_result.get('hasTitle', False))
check('Has NCT links', net_result.get('hasNCTLinks', False))
check('Has trial table', net_result.get('hasTrialTable', False))
if net_result.get('bodyLength', 0) > 0:
    check('Body content length', net_result['bodyLength'] > 100, f"{net_result['bodyLength']} chars")

# === TEST 5: Network edge drill-down ===
print("\n=== NETWORK EDGE DRILL-DOWN ===")
edge_result = driver.execute_script("""
    document.getElementById('drillDownPanel').style.display = 'none';
    if (networkEdges && networkEdges.length > 0) {
        var e = networkEdges[0];
        drillDownNetworkEdge(e.source, e.target);
        var panel = document.getElementById('drillDownPanel');
        var title = document.getElementById('drillDownTitle').textContent;
        var body = document.getElementById('drillDownBody').innerHTML;
        return {
            opened: panel.style.display !== 'none',
            hasShared: title.includes('Shared') || body.includes('shared'),
            hasTwoNodes: body.includes(networkNodes[e.source].label) && body.includes(networkNodes[e.target].label),
            bodyLength: body.length
        };
    }
    // No edges (data-dependent — not a bug if subcategories have no shared interventions)
    return { noEdges: true, edgeCount: networkEdges ? networkEdges.length : -1 };
""")
if edge_result.get('noEdges'):
    print(f"  SKIP  Edge drill-down (0 edges in dataset — data-dependent, not a bug)")
else:
    check('Edge drill-down opens', edge_result.get('opened', False))
    check('Shows shared interventions', edge_result.get('hasShared', False))
    check('Shows both node names', edge_result.get('hasTwoNodes', False))

# === TEST 6: Edge SVG attributes ===
print("\n=== EDGE SVG ATTRIBUTES ===")
edge_attrs = driver.execute_script("""
    var edgeCount = typeof networkEdges !== 'undefined' ? networkEdges.length : 0;
    var lines = document.querySelectorAll('#networkSvg line[data-edge]');
    if (edgeCount === 0) return { noEdges: true };
    if (lines.length === 0) return { count: 0, edgeCount: edgeCount };
    var first = lines[0];
    return {
        count: lines.length,
        edgeCount: edgeCount,
        hasSource: first.hasAttribute('data-edge-source'),
        hasTarget: first.hasAttribute('data-edge-target'),
        cursor: first.style.cursor
    };
""")
if edge_attrs.get('noEdges'):
    print("  SKIP  Edge SVG attributes (0 edges in dataset)")
else:
    check('Edge lines have data-edge', edge_attrs.get('count', 0) > 0, f"{edge_attrs.get('count', 0)} edges")
    check('Edges have source attr', edge_attrs.get('hasSource', False))
    check('Edges have target attr', edge_attrs.get('hasTarget', False))
    check('Edges have pointer cursor', edge_attrs.get('cursor', '') == 'pointer')

# === TEST 7: Al-Burhan drill-down ===
print("\n=== AL-BURHAN DRILL-DOWN ===")
alb_result = driver.execute_script("""
    document.getElementById('drillDownPanel').style.display = 'none';
    if (!_alBurhanResults || _alBurhanResults.length === 0) return { skipped: true };
    var pooled = _alBurhanResults.filter(function(r) { return r.pooled && r.studies && r.studies.length > 0; });
    if (pooled.length === 0) return { skipped: true, reason: 'no pooled' };
    drillDownAlBurhanCluster(pooled[0].id);
    var panel = document.getElementById('drillDownPanel');
    var body = document.getElementById('drillDownBody').innerHTML;
    return {
        opened: panel.style.display !== 'none',
        hasNCTLinks: body.includes('clinicaltrials.gov'),
        hasEffect: body.includes('Effect') || body.includes('HR') || body.includes('OR'),
        hasCI: body.includes('95% CI'),
        hasGRADE: body.includes('GRADE'),
        hasCochrane: body.includes('cochranelibrary') || body.includes('Validated'),
        hasMethod: body.includes('Method:') || body.includes('DL'),
        bodyLength: body.length
    };
""")
if alb_result.get('skipped'):
    print(f"  SKIP  Al-Burhan drill-down (no data loaded: {alb_result.get('reason', 'no results')})")
else:
    check('Al-Burhan drill-down opens', alb_result.get('opened', False))
    check('Has NCT links to ClinicalTrials.gov', alb_result.get('hasNCTLinks', False))
    check('Shows effect estimates', alb_result.get('hasEffect', False))
    check('Shows 95% CI', alb_result.get('hasCI', False))
    check('Shows GRADE certainty', alb_result.get('hasGRADE', False))
    check('Shows statistical method', alb_result.get('hasMethod', False))
    if alb_result.get('bodyLength', 0) > 0:
        check('Rich provenance content', alb_result['bodyLength'] > 500, f"{alb_result['bodyLength']} chars")

# === TEST 8: Timeline drill-down ===
print("\n=== TIMELINE DRILL-DOWN ===")
tl_result = driver.execute_script("""
    document.getElementById('drillDownPanel').style.display = 'none';
    if (!universeTrialsCache || universeTrialsCache.length === 0) return { skipped: true };
    drillDownTimelineYear(2020, universeTrialsCache);
    var panel = document.getElementById('drillDownPanel');
    var title = document.getElementById('drillDownTitle').textContent;
    var body = document.getElementById('drillDownBody').innerHTML;
    return {
        opened: panel.style.display !== 'none',
        has2020: title.includes('2020'),
        hasNCTLinks: body.includes('clinicaltrials.gov'),
        hasTable: body.includes('<table'),
        bodyLength: body.length
    };
""")
if tl_result.get('skipped'):
    print("  SKIP  Timeline drill-down (no trial data)")
else:
    check('Timeline drill-down opens', tl_result.get('opened', False))
    check('Title mentions year', tl_result.get('has2020', False))
    check('Has NCT links', tl_result.get('hasNCTLinks', False))

# === TEST 9: Pipeline drill-down ===
print("\n=== PIPELINE DRILL-DOWN ===")
pl_result = driver.execute_script("""
    document.getElementById('drillDownPanel').style.display = 'none';
    if (!universeTrialsCache || universeTrialsCache.length === 0) return { skipped: true };
    drillDownPipelinePhase('Phase 3', null, universeTrialsCache);
    var panel = document.getElementById('drillDownPanel');
    var title = document.getElementById('drillDownTitle').textContent;
    var body = document.getElementById('drillDownBody').innerHTML;
    return {
        opened: panel.style.display !== 'none',
        hasPhase: title.includes('Phase 3'),
        hasNCTLinks: body.includes('clinicaltrials.gov'),
        hasTable: body.includes('<table'),
        bodyLength: body.length
    };
""")
if pl_result.get('skipped'):
    print("  SKIP  Pipeline drill-down (no trial data)")
else:
    check('Pipeline drill-down opens', pl_result.get('opened', False))
    check('Title mentions phase', pl_result.get('hasPhase', False))
    check('Has NCT links', pl_result.get('hasNCTLinks', False))

# === TEST 10: Matrix cell drill-down ===
print("\n=== MATRIX CELL DRILL-DOWN ===")
mx_result = driver.execute_script("""
    document.getElementById('drillDownPanel').style.display = 'none';
    if (!universeTrialsCache || universeTrialsCache.length === 0) return { skipped: true };
    // Find a real intervention name
    var ivName = '';
    for (var i = 0; i < universeTrialsCache.length; i++) {
        var ivs = universeTrialsCache[i].interventions || [];
        if (ivs.length > 0 && ivs[0].name) { ivName = ivs[0].name.slice(0, 25); break; }
    }
    if (!ivName) return { skipped: true, reason: 'no interventions' };
    drillDownMatrixCell(ivName, 'mortality', universeTrialsCache);
    var panel = document.getElementById('drillDownPanel');
    var title = document.getElementById('drillDownTitle').textContent;
    return {
        opened: panel.style.display !== 'none',
        hasIntervention: title.includes(ivName.slice(0, 10)),
        bodyLength: document.getElementById('drillDownBody').innerHTML.length
    };
""")
if mx_result.get('skipped'):
    print("  SKIP  Matrix drill-down (no trial data)")
else:
    check('Matrix drill-down opens', mx_result.get('opened', False))

# JS errors check
logs = driver.get_log('browser')
errors = [l for l in logs if l['level'] == 'SEVERE'
          and 'Access to fetch' not in l.get('message', '')
          and 'Failed to load resource' not in l.get('message', '')]
for e in errors[:3]:
    print(f"\nJS ERROR: {e['message'][:300]}")
    fails += 1

print(f"\n{'='*60}")
print(f"DRILL-DOWN TEST: {passes} pass, {fails} fail")
print(f"{'='*60}")
driver.quit()
sys.exit(0 if fails == 0 else 1)
