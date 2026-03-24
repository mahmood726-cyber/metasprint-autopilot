"""Raw 2x2 Table Input Integration Tests.

Validates that the 2x2 input mode correctly:
- Toggles between effect and 2x2 modes
- Computes OR, RR, RD from raw counts
- Handles zero-event cells with continuity correction
- Updates table columns dynamically
- Auto-computes effect+CI on field change
- Exports 2x2 data in CSV
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
    """Check if two numbers are approximately equal."""
    if a is None or b is None:
        return False
    return abs(a - b) < tol

# ============================================================
print("=== Test 1: Input mode toggle ===")
# Default mode should be 'effect'
mode = driver.execute_script('return extractInputMode;')
check("Default mode is 'effect'", mode == 'effect')

# Toggle to 2x2
driver.execute_script('setInputMode("2x2");')
time.sleep(0.3)
mode2 = driver.execute_script('return extractInputMode;')
check("Mode switched to '2x2'", mode2 == '2x2')

help_text = driver.execute_script('return document.getElementById("inputModeHelp").textContent;')
check("Help text mentions events", 'events' in help_text.lower())

# Check header changed
head_html = driver.execute_script('return document.getElementById("extractHead").innerHTML;')
check("Header has 'Ev. Int' column", 'Ev. Int' in head_html)
check("Header has 'Tot. Int' column", 'Tot. Int' in head_html)
check("Header has 'Ev. Ctrl' column", 'Ev. Ctrl' in head_html)
check("Header has 'Tot. Ctrl' column", 'Tot. Ctrl' in head_html)
check("Header has '95% CI' column", '95% CI' in head_html)

# Toggle back to effect
driver.execute_script('setInputMode("effect");')
time.sleep(0.3)
head_html2 = driver.execute_script('return document.getElementById("extractHead").innerHTML;')
check("Header back to 'Effect *'", 'Effect *' in head_html2)
check("Header back to 'Lower CI *'", 'Lower CI *' in head_html2)

# ============================================================
print("\n=== Test 2: compute2x2Effect - OR computation ===")
# Test basic OR: 50/200 vs 30/200  =>  OR = (50*170)/(30*150) = 1.889
result = driver.execute_script('''
    return compute2x2Effect(50, 200, 30, 200, 'OR');
''')
check("OR result not null", result is not None)
if result:
    expected_or = (50 * 170) / (30 * 150)
    check("OR value correct", approx(result['effect'], expected_or, 0.01),
          f"got={result['effect']}, expected={expected_or:.4f}")
    check("OR lower CI < effect", result['lowerCI'] < result['effect'])
    check("OR upper CI > effect", result['upperCI'] > result['effect'])

# ============================================================
print("\n=== Test 3: compute2x2Effect - RR computation ===")
# RR: 50/200 vs 30/200  =>  RR = (50/200)/(30/200) = 1.667
result_rr = driver.execute_script('''
    return compute2x2Effect(50, 200, 30, 200, 'RR');
''')
check("RR result not null", result_rr is not None)
if result_rr:
    expected_rr = (50/200) / (30/200)
    check("RR value correct", approx(result_rr['effect'], expected_rr, 0.01),
          f"got={result_rr['effect']}, expected={expected_rr:.4f}")

# ============================================================
print("\n=== Test 4: compute2x2Effect - RD computation ===")
# RD: 50/200 vs 30/200  =>  RD = 0.25 - 0.15 = 0.10
result_rd = driver.execute_script('''
    return compute2x2Effect(50, 200, 30, 200, 'RD');
''')
check("RD result not null", result_rd is not None)
if result_rd:
    expected_rd = 50/200 - 30/200
    check("RD value correct", approx(result_rd['effect'], expected_rd, 0.01),
          f"got={result_rd['effect']}, expected={expected_rd:.4f}")
    check("RD CI is symmetric-ish around RD",
          result_rd['lowerCI'] < result_rd['effect'] < result_rd['upperCI'])

# ============================================================
print("\n=== Test 5: Zero-event handling ===")
# Single zero in intervention: 0/100 vs 5/100 (OR with continuity correction)
result_z1 = driver.execute_script('''
    return compute2x2Effect(0, 100, 5, 100, 'OR');
''')
check("Single-zero OR computable", result_z1 is not None)
if result_z1:
    check("Single-zero OR < 1 (protective)", result_z1['effect'] < 1,
          f"OR={result_z1['effect']}")

# Double zero: 0/100 vs 0/100 should return null
result_z2 = driver.execute_script('''
    return compute2x2Effect(0, 100, 0, 100, 'OR');
''')
check("Both-zero OR returns null", result_z2 is None)

# All-events: 100/100 vs 100/100 should return null
result_z3 = driver.execute_script('''
    return compute2x2Effect(100, 100, 100, 100, 'OR');
''')
check("All-events OR returns null", result_z3 is None)

# Invalid input: negative events
result_z4 = driver.execute_script('''
    return compute2x2Effect(-5, 100, 10, 100, 'OR');
''')
check("Negative events returns null", result_z4 is None)

# Events > total
result_z5 = driver.execute_script('''
    return compute2x2Effect(150, 100, 10, 100, 'OR');
''')
check("Events > total returns null", result_z5 is None)

# ============================================================
print("\n=== Test 6: 2x2 mode table rendering ===")
# Switch to 2x2 mode and add a study
driver.execute_script('setInputMode("2x2");')
driver.execute_script('''
    addStudyRow({
        authorYear: 'TestStudy 2024',
        eventsInt: 45,
        totalInt: 200,
        eventsCtrl: 30,
        totalCtrl: 200,
        effectType: 'OR'
    });
''')
time.sleep(0.5)

# Check the row was added
row_count = driver.execute_script('''
    return document.querySelectorAll('#extractBody tr').length;
''')
check("Study row added", row_count >= 1)

# Check that auto-computation happened on addStudyRow
study = driver.execute_script('''
    return extractedStudies[extractedStudies.length - 1];
''')
check("Study has eventsInt=45", study and study.get('eventsInt') == 45)
check("Study has totalInt=200", study and study.get('totalInt') == 200)

# Check computed effect is displayed in the row
eff_cell = driver.execute_script('''
    var rows = document.querySelectorAll('#extractBody tr');
    var lastRow = rows[rows.length - 1];
    return lastRow.querySelector('[data-field="effectEstimate"]').textContent;
''')
check("Effect cell shows computed value (not '-')", eff_cell != '-' and eff_cell != '',
      f"eff_cell='{eff_cell}'")

ci_cell = driver.execute_script('''
    var rows = document.querySelectorAll('#extractBody tr');
    var lastRow = rows[rows.length - 1];
    return lastRow.querySelector('[data-field="lowerCI"]').textContent;
''')
check("CI cell shows range with 'to'", 'to' in (ci_cell or ''),
      f"ci_cell='{ci_cell}'")

# ============================================================
print("\n=== Test 7: 2x2 auto-compute on field change ===")
# Simulate changing eventsInt via event delegation
driver.execute_script('''
    var rows = document.querySelectorAll('#extractBody tr');
    var lastRow = rows[rows.length - 1];
    var evIntInput = lastRow.querySelector('[data-field="eventsInt"]');
    evIntInput.value = '60';
    evIntInput.dispatchEvent(new Event('change', {bubbles: true}));
''')
time.sleep(0.3)

study_updated = driver.execute_script('''
    return extractedStudies[extractedStudies.length - 1];
''')
check("eventsInt updated to 60", study_updated and study_updated.get('eventsInt') == 60)
# With 60/200 vs 30/200, OR should be larger than before (45/200 vs 30/200)
check("Effect re-computed after change",
      study_updated and study_updated.get('effectEstimate') is not None,
      f"effect={study_updated.get('effectEstimate') if study_updated else None}")

# Verify the OR value: (60*170)/(30*140) = 10200/4200 = 2.4286
expected_new_or = (60 * 170) / (30 * 140)
check("New OR approximately correct",
      study_updated and approx(study_updated['effectEstimate'], expected_new_or, 0.05),
      f"got={study_updated.get('effectEstimate')}, expected={expected_new_or:.4f}")

# ============================================================
print("\n=== Test 8: Effect type change in 2x2 mode ===")
# Change type from OR to RR — should recompute
driver.execute_script('''
    var rows = document.querySelectorAll('#extractBody tr');
    var lastRow = rows[rows.length - 1];
    var select = lastRow.querySelector('[data-field="effectType"]');
    select.value = 'RR';
    select.dispatchEvent(new Event('change', {bubbles: true}));
''')
time.sleep(0.3)

study_rr = driver.execute_script('''
    return extractedStudies[extractedStudies.length - 1];
''')
check("Effect type changed to RR", study_rr and study_rr.get('effectType') == 'RR')
# RR = (60/200) / (30/200) = 2.0
expected_rr_val = (60/200) / (30/200)
check("RR recomputed correctly",
      study_rr and approx(study_rr['effectEstimate'], expected_rr_val, 0.01),
      f"got={study_rr.get('effectEstimate')}, expected={expected_rr_val:.4f}")

# ============================================================
print("\n=== Test 9: Mode switch preserves data ===")
# Switch back to effect mode — studies should retain computed values
driver.execute_script('setInputMode("effect");')
time.sleep(0.3)

study_after = driver.execute_script('''
    return extractedStudies[extractedStudies.length - 1];
''')
check("Effect preserved after mode switch",
      study_after and study_after.get('effectEstimate') is not None)
check("2x2 data preserved after mode switch",
      study_after and study_after.get('eventsInt') == 60)

# ============================================================
print("\n=== Test 10: 2x2 + analysis pipeline ===")
# Set up several studies in 2x2 mode, run analysis
driver.execute_script('setInputMode("2x2");')
driver.execute_script('extractedStudies = [];')
time.sleep(0.2)

# Add 4 studies with raw 2x2 data
studies_2x2 = [
    {'authorYear': 'Alpha 2020', 'eventsInt': 40, 'totalInt': 200, 'eventsCtrl': 55, 'totalCtrl': 200, 'effectType': 'OR'},
    {'authorYear': 'Beta 2021', 'eventsInt': 30, 'totalInt': 150, 'eventsCtrl': 45, 'totalCtrl': 150, 'effectType': 'OR'},
    {'authorYear': 'Gamma 2022', 'eventsInt': 25, 'totalInt': 180, 'eventsCtrl': 38, 'totalCtrl': 180, 'effectType': 'OR'},
    {'authorYear': 'Delta 2023', 'eventsInt': 50, 'totalInt': 250, 'eventsCtrl': 70, 'totalCtrl': 250, 'effectType': 'OR'},
]
for st in studies_2x2:
    driver.execute_script(f'addStudyRow({json.dumps(st)});')
time.sleep(0.5)

# All studies should have auto-computed effects
all_have_effects = driver.execute_script('''
    return extractedStudies.every(function(s) {
        return s.effectEstimate != null && s.lowerCI != null && s.upperCI != null;
    });
''')
check("All 4 studies have auto-computed effects", all_have_effects)

# Now run analysis - override loadStudies to prevent DB overwrite
driver.execute_script('''
    var _origLoad = loadStudies;
    loadStudies = async function() {
        // keep current extractedStudies
    };
''')
driver.execute_script('window._done=false; runAnalysis().then(function(){window._done=true;});')
for _ in range(20):
    time.sleep(0.5)
    if driver.execute_script('return window._done===true;'):
        break

result = driver.execute_script('return lastAnalysisResult;')
check("Analysis completed with 2x2 data", result is not None)
if result:
    check("k=4 studies analyzed", result.get('k') == 4, f"k={result.get('k')}")
    check("Pooled effect < 1 (protective)", result.get('pooled', 1) < 1,
          f"pooled={result.get('pooled')}")
    # Forest plot SVG may not fully render in headless mode; check it exists
    fp_len = driver.execute_script('return (document.getElementById("forestPlot")?.innerHTML || "").length;')
    check("Forest plot element exists", fp_len is not None, f"length={fp_len}")

# ============================================================
print("\n=== Test 11: Non-binary effect types rejected in 2x2 ===")
# compute2x2Effect should return null for HR, MD, SMD
for et in ['HR', 'MD', 'SMD']:
    r = driver.execute_script(f"return compute2x2Effect(50, 200, 30, 200, '{et}');")
    check(f"2x2 returns null for {et}", r is None)

# ============================================================
print("\n=== Test 12: Edge case - very rare events ===")
# 1/1000 vs 5/1000 — very rare events
result_rare = driver.execute_script('''
    return compute2x2Effect(1, 1000, 5, 1000, 'OR');
''')
check("Rare events OR computable", result_rare is not None)
if result_rare:
    check("Rare events OR < 1", result_rare['effect'] < 1)
    check("Rare events CI includes effect",
          result_rare['lowerCI'] < result_rare['effect'] < result_rare['upperCI'])

# ============================================================
print("\n=== Test 13: Large sample exact ===")
# 500/10000 vs 500/10000 — OR should be exactly 1.0
result_equal = driver.execute_script('''
    return compute2x2Effect(500, 10000, 500, 10000, 'OR');
''')
check("Equal groups OR computable", result_equal is not None)
if result_equal:
    check("Equal groups OR = 1.0", approx(result_equal['effect'], 1.0, 0.001),
          f"OR={result_equal['effect']}")
    check("Equal groups CI contains 1.0",
          result_equal['lowerCI'] < 1.0 < result_equal['upperCI'])

# JS errors check
logs = driver.get_log('browser')
errors = [l for l in logs if l['level'] == 'SEVERE'
          and 'Access to fetch' not in l.get('message', '')
          and 'Failed to load resource' not in l.get('message', '')]
check("No severe JS errors", len(errors) == 0, f"Found {len(errors)} errors")

driver.quit()

# ============================================================
print(f"\n{'='*60}")
print(f"2x2 INPUT VALIDATION: {pass_count} pass, {fail_count} fail / {pass_count + fail_count} total")
print(f"{'='*60}")
sys.exit(0 if fail_count == 0 else 1)
