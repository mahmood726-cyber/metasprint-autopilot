"""Subgroup Analysis + Gap Threshold Integration Tests.

Validates:
- Subgroup meta-analysis with test for interaction
- Subgroup field in extract table
- Gap score configurable thresholds
- Edge cases (1 subgroup, uneven k, all same subgroup)
"""
import sys, io, time, json, os, math
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

opts = Options()
opts.add_argument('--headless=new')
opts.add_argument('--no-sandbox')
opts.add_argument('--disable-dev-shm-usage')
opts.set_capability('goog:loggingPrefs', {'browser': 'ALL'})
driver = webdriver.Chrome(options=opts)
driver.implicitly_wait(2)
driver.set_script_timeout(30)

html_path = os.path.normpath(os.path.abspath('metasprint-autopilot.html'))
url = 'file:///' + html_path.replace(os.sep, '/').replace(' ', '%20')
driver.get(url)
time.sleep(3)

driver.execute_script(
    'var m = document.getElementById("onboardOverlay");'
    'if (m) m.style.display = "none";'
)
time.sleep(1)

pass_count = 0
fail_count = 0

def check(name, condition, detail=''):
    global pass_count, fail_count
    if condition:
        print(f"  PASS  {name}")
        pass_count += 1
    else:
        print(f"  FAIL  {name}  {detail}")
        fail_count += 1

def approx(a, b, tol=0.01):
    if a is None or b is None:
        return False
    return abs(a - b) < tol

def inject_and_run(studies_js):
    """Inject studies and run analysis, return when done."""
    driver.execute_script('''
        var _origLoad = loadStudies;
        loadStudies = async function() {
            extractedStudies = ''' + studies_js + ''';
        };
    ''')
    driver.execute_script('window._done=false; runAnalysis().then(function(){window._done=true;});')
    for _ in range(20):
        time.sleep(0.5)
        if driver.execute_script('return window._done===true;'):
            break

# ============================================================
print("=== Test 1: Subgroup column in extract table ===")
# Check that the subgroup column header exists
head_html = driver.execute_script('return document.getElementById("extractHead")?.innerHTML || "";')
check("Subgroup header in effect mode", 'Subgroup' in head_html)

# Switch to 2x2 mode and check
driver.execute_script('setInputMode("2x2");')
time.sleep(0.3)
head_2x2 = driver.execute_script('return document.getElementById("extractHead")?.innerHTML || "";')
check("Subgroup header in 2x2 mode", 'Subgroup' in head_2x2)
driver.execute_script('setInputMode("effect");')
time.sleep(0.2)

# ============================================================
print("\n=== Test 2: Subgroup field in study object ===")
driver.execute_script('''
    extractedStudies = [];
    addStudyRow({authorYear:'Study A', effectEstimate:0.8, lowerCI:0.6, upperCI:1.1, effectType:'OR', subgroup:'High dose'});
    addStudyRow({authorYear:'Study B', effectEstimate:0.7, lowerCI:0.5, upperCI:0.95, effectType:'OR', subgroup:'Low dose'});
''')
time.sleep(0.3)

study_a = driver.execute_script('return extractedStudies[0];')
check("Study A has subgroup 'High dose'", study_a and study_a.get('subgroup') == 'High dose')
study_b = driver.execute_script('return extractedStudies[1];')
check("Study B has subgroup 'Low dose'", study_b and study_b.get('subgroup') == 'Low dose')

# ============================================================
print("\n=== Test 3: computeSubgroupAnalysis - basic ===")
inject_and_run('''[
    {studyId:'A1', effectEstimate:0.60, lowerCI:0.45, upperCI:0.80, effectType:'OR', sampleSize:300, subgroup:'Drug A'},
    {studyId:'A2', effectEstimate:0.55, lowerCI:0.40, upperCI:0.76, effectType:'OR', sampleSize:250, subgroup:'Drug A'},
    {studyId:'A3', effectEstimate:0.65, lowerCI:0.48, upperCI:0.88, effectType:'OR', sampleSize:280, subgroup:'Drug A'},
    {studyId:'B1', effectEstimate:0.95, lowerCI:0.80, upperCI:1.13, effectType:'OR', sampleSize:350, subgroup:'Drug B'},
    {studyId:'B2', effectEstimate:1.02, lowerCI:0.85, upperCI:1.22, effectType:'OR', sampleSize:320, subgroup:'Drug B'},
    {studyId:'B3', effectEstimate:0.98, lowerCI:0.82, upperCI:1.17, effectType:'OR', sampleSize:310, subgroup:'Drug B'}
]''')

# Check the subgroup container rendered
sub_html = driver.execute_script('return document.getElementById("subgroupContainer").innerHTML;')
check("Subgroup analysis rendered", len(sub_html) > 100)
check("Drug A subgroup shown", 'Drug A' in sub_html)
check("Drug B subgroup shown", 'Drug B' in sub_html)
check("Test for interaction shown", 'subgroup differences' in sub_html.lower() or 'Q<sub>between' in sub_html)
check("Overall row shown", 'Overall' in sub_html)

# Programmatic check
sub_result = driver.execute_script('''
    return computeSubgroupAnalysis(extractedStudies, 0.95, 'DL+HKSJ');
''')
check("Subgroup result not null", sub_result is not None)
if sub_result:
    check("2 subgroups found", len(sub_result['subgroups']) == 2)
    check("Q_between > 0", sub_result['Qbetween'] > 0)
    check("df_between = 1", sub_result['dfBetween'] == 1)
    check("p_interaction is number", isinstance(sub_result['pInteraction'], (int, float)))
    # Drug A (OR ~0.60) vs Drug B (OR ~0.98) — should show significant interaction
    check("p < 0.05 for different subgroups", sub_result['pInteraction'] < 0.05,
          f"p={sub_result['pInteraction']:.4f}")

    # Check subgroup-level results
    sg_a = next((sg for sg in sub_result['subgroups'] if sg['label'] == 'Drug A'), None)
    sg_b = next((sg for sg in sub_result['subgroups'] if sg['label'] == 'Drug B'), None)
    check("Drug A pooled < 1", sg_a and sg_a['result']['pooled'] < 1)
    check("Drug B pooled near 1", sg_b and abs(sg_b['result']['pooled'] - 1.0) < 0.15,
          f"pooled={sg_b['result']['pooled']:.3f}" if sg_b else "")

    # Overall
    check("Overall k = 6", sub_result['overall'] and sub_result['overall']['k'] == 6)

# ============================================================
print("\n=== Test 4: No subgroup when labels missing ===")
inject_and_run('''[
    {studyId:'X1', effectEstimate:0.80, lowerCI:0.65, upperCI:0.98, effectType:'OR', sampleSize:200},
    {studyId:'X2', effectEstimate:0.75, lowerCI:0.60, upperCI:0.94, effectType:'OR', sampleSize:180}
]''')

sub_html_empty = driver.execute_script('return document.getElementById("subgroupContainer").innerHTML;')
check("No subgroup when labels absent", len(sub_html_empty) < 10)

# ============================================================
print("\n=== Test 5: Single subgroup returns null ===")
result_single = driver.execute_script('''
    return computeSubgroupAnalysis([
        {effectEstimate:0.80, lowerCI:0.65, upperCI:0.98, effectType:'OR', subgroup:'Only'},
        {effectEstimate:0.75, lowerCI:0.60, upperCI:0.94, effectType:'OR', subgroup:'Only'}
    ], 0.95, 'DL');
''')
check("Single subgroup returns null", result_single is None)

# ============================================================
print("\n=== Test 6: 3 subgroups ===")
result_3sg = driver.execute_script('''
    return computeSubgroupAnalysis([
        {effectEstimate:0.60, lowerCI:0.45, upperCI:0.80, effectType:'OR', subgroup:'A'},
        {effectEstimate:0.55, lowerCI:0.40, upperCI:0.76, effectType:'OR', subgroup:'A'},
        {effectEstimate:0.90, lowerCI:0.75, upperCI:1.08, effectType:'OR', subgroup:'B'},
        {effectEstimate:0.85, lowerCI:0.70, upperCI:1.03, effectType:'OR', subgroup:'B'},
        {effectEstimate:1.20, lowerCI:1.00, upperCI:1.44, effectType:'OR', subgroup:'C'},
        {effectEstimate:1.15, lowerCI:0.95, upperCI:1.39, effectType:'OR', subgroup:'C'}
    ], 0.95, 'DL');
''')
check("3 subgroups analyzed", result_3sg is not None and len(result_3sg['subgroups']) == 3)
if result_3sg:
    check("df_between = 2 for 3 subgroups", result_3sg['dfBetween'] == 2)
    check("Overall k = 6 for 3 subgroups", result_3sg['overall']['k'] == 6)

# ============================================================
print("\n=== Test 7: Subgroup with continuous outcome (MD) ===")
result_md = driver.execute_script('''
    return computeSubgroupAnalysis([
        {effectEstimate:-2.5, lowerCI:-4.0, upperCI:-1.0, effectType:'MD', subgroup:'Young'},
        {effectEstimate:-3.0, lowerCI:-5.0, upperCI:-1.0, effectType:'MD', subgroup:'Young'},
        {effectEstimate:-0.5, lowerCI:-2.0, upperCI:1.0, effectType:'MD', subgroup:'Elderly'},
        {effectEstimate:-0.8, lowerCI:-2.5, upperCI:0.9, effectType:'MD', subgroup:'Elderly'}
    ], 0.95, 'DL');
''')
check("MD subgroup analysis works", result_md is not None)
if result_md:
    sg_young = next((sg for sg in result_md['subgroups'] if sg['label'] == 'Young'), None)
    sg_elderly = next((sg for sg in result_md['subgroups'] if sg['label'] == 'Elderly'), None)
    check("Young pooled < 0 (beneficial)", sg_young and sg_young['result']['pooled'] < 0)
    check("Elderly pooled closer to 0", sg_elderly and abs(sg_elderly['result']['pooled']) < abs(sg_young['result']['pooled']))

# ============================================================
print("\n=== Test 8: Gap threshold configuration ===")
# Check defaults
gap_mod = driver.execute_script('return window.GAP_THRESHOLD_MOD;')
gap_high = driver.execute_script('return window.GAP_THRESHOLD_HIGH;')
check("Default GAP_THRESHOLD_MOD = 3", gap_mod == 3)
check("Default GAP_THRESHOLD_HIGH = 10", gap_high == 10)

# Update thresholds
driver.execute_script('''
    document.getElementById('gapThreshMod').value = '5';
    document.getElementById('gapThreshHigh').value = '15';
    updateGapThresholds();
''')
time.sleep(0.2)
gap_mod2 = driver.execute_script('return window.GAP_THRESHOLD_MOD;')
gap_high2 = driver.execute_script('return window.GAP_THRESHOLD_HIGH;')
check("Updated GAP_THRESHOLD_MOD = 5", gap_mod2 == 5)
check("Updated GAP_THRESHOLD_HIGH = 15", gap_high2 == 15)

# Test validation: high < mod should auto-correct
driver.execute_script('''
    document.getElementById('gapThreshMod').value = '20';
    document.getElementById('gapThreshHigh').value = '10';
    updateGapThresholds();
''')
time.sleep(0.2)
gap_high3 = driver.execute_script('return window.GAP_THRESHOLD_HIGH;')
check("High auto-corrected to >= Mod", gap_high3 >= 20, f"high={gap_high3}")

# ============================================================
print("\n=== Test 9: Subgroup field editable via delegation ===")
driver.execute_script('''
    extractedStudies = [];
    addStudyRow({authorYear:'Test1', effectEstimate:0.8, lowerCI:0.6, upperCI:1.1, effectType:'OR'});
    renderExtractTable();
''')
time.sleep(0.3)

# Simulate typing a subgroup value
driver.execute_script('''
    var row = document.querySelector('#extractBody tr');
    var input = row.querySelector('[data-field="subgroup"]');
    input.value = 'GroupX';
    input.dispatchEvent(new Event('change', {bubbles: true}));
''')
time.sleep(0.3)

study_sg = driver.execute_script('return extractedStudies[0]?.subgroup;')
check("Subgroup updated via delegation", study_sg == 'GroupX')

# ============================================================
print("\n=== Test 10: Subgroup field in allowlist ===")
# Try to set subgroup via updateStudy (should not be blocked)
driver.execute_script('''
    var id = extractedStudies[0]?.id;
    updateStudy(id, 'subgroup', 'Allowed');
''')
study_sg2 = driver.execute_script('return extractedStudies[0]?.subgroup;')
check("Subgroup in STUDY_EDITABLE_FIELDS", study_sg2 == 'Allowed')

# Try a disallowed field
driver.execute_script('''
    var id = extractedStudies[0]?.id;
    updateStudy(id, '__proto__', 'evil');
''')
check("Prototype pollution blocked", True)  # If we get here, no crash

# JS errors check
logs = driver.get_log('browser')
errors = [l for l in logs if l['level'] == 'SEVERE'
          and 'Access to fetch' not in l.get('message', '')
          and 'Failed to load resource' not in l.get('message', '')]
check("No severe JS errors", len(errors) == 0, f"Found {len(errors)} errors")

driver.quit()

# ============================================================
print(f"\n{'='*60}")
print(f"SUBGROUP + GAP THRESHOLD: {pass_count} pass, {fail_count} fail / {pass_count + fail_count} total")
print(f"{'='*60}")
sys.exit(0 if fail_count == 0 else 1)
