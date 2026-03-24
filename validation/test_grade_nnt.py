"""GRADE Certainty + NNT Integration Tests.

Validates that GRADE certainty assessment and NNT computation are
correctly rendered in the Analyze tab after running meta-analysis.
"""
import sys, io, time, json, os
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
print("=== Test 1: GRADE + NNT for binary OR (k=5, significant) ===")
inject_and_run('''[
    {studyId:'A', effectEstimate:0.75, lowerCI:0.60, upperCI:0.94, effectType:'OR', sampleSize:500},
    {studyId:'B', effectEstimate:0.82, lowerCI:0.68, upperCI:0.99, effectType:'OR', sampleSize:600},
    {studyId:'C', effectEstimate:0.70, lowerCI:0.55, upperCI:0.89, effectType:'OR', sampleSize:400},
    {studyId:'D', effectEstimate:0.88, lowerCI:0.72, upperCI:1.08, effectType:'OR', sampleSize:350},
    {studyId:'E', effectEstimate:0.65, lowerCI:0.50, upperCI:0.85, effectType:'OR', sampleSize:450}
]''')

grade_html = driver.execute_script('return document.getElementById("gradeContainer").innerHTML;')
nnt_html = driver.execute_script('return document.getElementById("nntContainer").innerHTML;')
row_display = driver.execute_script('return document.getElementById("gradeNntRow").style.display;')

check("GRADE container rendered", len(grade_html) > 100)
check("GRADE title present", "GRADE Certainty" in grade_html)
check("Certainty badge present", any(x in grade_html for x in ['HIGH', 'MODERATE', 'LOW', 'VERY LOW']))
check("Risk of Bias domain", "Risk of Bias" in grade_html)
check("Inconsistency domain", "Inconsistency" in grade_html)
check("Indirectness domain", "Indirectness" in grade_html)
check("Imprecision domain", "Imprecision" in grade_html)
check("Publication Bias domain", "Publication Bias" in grade_html)
check("RoB 'Not assessed' flag", "Not assessed" in grade_html or "not assessed" in grade_html)
check("NNT container rendered", len(nnt_html) > 50)
check("NNT label present", "NNT" in nnt_html)
check("Baseline slider present", "baselineRiskSlider" in nnt_html)
check("Sackett formula noted", "Sackett" in nnt_html)
check("Grade+NNT row visible", row_display == 'flex')

# Get the actual GRADE result programmatically
grade_result = driver.execute_script('''
    var result = lastAnalysisResult;
    if (!result) return null;
    var sValue = null;
    if (result.k >= 3 && result.studyResults) {
        var pbResult = pubBiasSensitivity(result.studyResults, result.tau2);
        if (pbResult) sValue = pbResult.sValue;
    }
    var g = computeGRADE(Object.assign({}, result, {sValue: sValue}), extractedStudies);
    return g;
''')
check("GRADE result not null", grade_result is not None)
if grade_result:
    check("Certainty is integer 1-4", grade_result['certainty'] in [1,2,3,4])
    check("Has label string", grade_result['label'] in ['HIGH', 'MODERATE', 'LOW', 'VERY LOW'])
    check("Domains object exists", 'domains' in grade_result)

# ============================================================
print("\n=== Test 2: NNT slider interaction ===")
driver.execute_script('updateNNTDisplay(25);')
time.sleep(0.3)
nnt_val = driver.execute_script('return document.getElementById("nntValue")?.textContent;')
risk_label = driver.execute_script('return document.getElementById("riskLabel")?.textContent;')
check("Risk label updated to 25%", risk_label == '25%')
check("NNT value is numeric", nnt_val and nnt_val.isdigit())

driver.execute_script('updateNNTDisplay(5);')
time.sleep(0.3)
nnt_val_5 = driver.execute_script('return document.getElementById("nntValue")?.textContent;')
risk_label_5 = driver.execute_script('return document.getElementById("riskLabel")?.textContent;')
check("Risk label updated to 5%", risk_label_5 == '5%')
check("NNT at 5% is larger than at 25%", nnt_val_5 and nnt_val and int(nnt_val_5) > int(nnt_val),
      f"NNT@5%={nnt_val_5}, NNT@25%={nnt_val}")

# ============================================================
print("\n=== Test 3: GRADE for continuous outcome (MD) ===")
inject_and_run('''[
    {studyId:'X1', effectEstimate:-2.5, lowerCI:-4.0, upperCI:-1.0, effectType:'MD', sampleSize:100},
    {studyId:'X2', effectEstimate:-1.8, lowerCI:-3.5, upperCI:-0.1, effectType:'MD', sampleSize:80},
    {studyId:'X3', effectEstimate:-3.2, lowerCI:-5.0, upperCI:-1.4, effectType:'MD', sampleSize:120}
]''')

grade_html_md = driver.execute_script('return document.getElementById("gradeContainer").innerHTML;')
nnt_html_md = driver.execute_script('return document.getElementById("nntContainer").innerHTML;')
check("GRADE rendered for MD", "GRADE Certainty" in grade_html_md)
check("NNT says not applicable for MD", "not applicable" in nnt_html_md.lower() or len(nnt_html_md) < 20,
      f"NNT HTML length={len(nnt_html_md)}")

# ============================================================
print("\n=== Test 4: GRADE with high heterogeneity (I2 > 75%) ===")
inject_and_run('''[
    {studyId:'H1', effectEstimate:0.50, lowerCI:0.30, upperCI:0.83, effectType:'OR', sampleSize:200},
    {studyId:'H2', effectEstimate:1.50, lowerCI:1.10, upperCI:2.05, effectType:'OR', sampleSize:150},
    {studyId:'H3', effectEstimate:0.40, lowerCI:0.25, upperCI:0.64, effectType:'OR', sampleSize:180},
    {studyId:'H4', effectEstimate:1.80, lowerCI:1.20, upperCI:2.70, effectType:'OR', sampleSize:120}
]''')

grade_hetero = driver.execute_script('''
    var result = lastAnalysisResult;
    if (!result) return null;
    var sValue = null;
    if (result.k >= 3 && result.studyResults) {
        var pbResult = pubBiasSensitivity(result.studyResults, result.tau2);
        if (pbResult) sValue = pbResult.sValue;
    }
    return computeGRADE(Object.assign({}, result, {sValue: sValue}), extractedStudies);
''')
check("High-heterogeneity GRADE computed", grade_hetero is not None)
if grade_hetero:
    check("Inconsistency downgraded", grade_hetero['domains']['inconsistency'] < 0,
          f"inconsistency={grade_hetero['domains']['inconsistency']}")

# ============================================================
print("\n=== Test 5: NNT for HR effect type ===")
inject_and_run('''[
    {studyId:'HR1', effectEstimate:0.80, lowerCI:0.70, upperCI:0.91, effectType:'HR', sampleSize:1000},
    {studyId:'HR2', effectEstimate:0.75, lowerCI:0.65, upperCI:0.87, effectType:'HR', sampleSize:800},
    {studyId:'HR3', effectEstimate:0.85, lowerCI:0.74, upperCI:0.97, effectType:'HR', sampleSize:900}
]''')

nnt_hr = driver.execute_script('''
    var result = lastAnalysisResult;
    if (!result) return null;
    return computeNNT(result.pooled, true, 0.15, 'HR');
''')
check("NNT computed for HR", nnt_hr is not None and nnt_hr > 0, f"nnt={nnt_hr}")
nnt_html_hr = driver.execute_script('return document.getElementById("nntContainer").innerHTML;')
check("NNT displayed for HR", "NNT" in nnt_html_hr or "NNH" in nnt_html_hr)
check("RR approximation noted", "RR approximation" in nnt_html_hr)

# ============================================================
print("\n=== Test 6: GRADE for k=2 (minimal) ===")
inject_and_run('''[
    {studyId:'K1', effectEstimate:0.85, lowerCI:0.70, upperCI:1.03, effectType:'RR', sampleSize:200},
    {studyId:'K2', effectEstimate:0.78, lowerCI:0.62, upperCI:0.98, effectType:'RR', sampleSize:180}
]''')

grade_k2 = driver.execute_script('''
    var result = lastAnalysisResult;
    if (!result) return null;
    return computeGRADE(result, extractedStudies);
''')
check("GRADE computed for k=2", grade_k2 is not None)
if grade_k2:
    check("Certainty 1-4 for k=2", grade_k2['certainty'] in [1,2,3,4])

# ============================================================
print("\n=== Test 7: NNT for harmful effect (OR > 1) ===")
inject_and_run('''[
    {studyId:'Harm1', effectEstimate:1.35, lowerCI:1.10, upperCI:1.65, effectType:'OR', sampleSize:500},
    {studyId:'Harm2', effectEstimate:1.42, lowerCI:1.15, upperCI:1.75, effectType:'OR', sampleSize:400},
    {studyId:'Harm3', effectEstimate:1.28, lowerCI:1.05, upperCI:1.56, effectType:'OR', sampleSize:450}
]''')

nnt_harm = driver.execute_script('return document.getElementById("nntContainer").innerHTML;')
check("NNH label shown for harmful effect", "NNH" in nnt_harm, "Expected NNH label")

# JS errors check
logs = driver.get_log('browser')
errors = [l for l in logs if l['level'] == 'SEVERE'
          and 'Access to fetch' not in l.get('message', '')
          and 'Failed to load resource' not in l.get('message', '')]
check("No severe JS errors", len(errors) == 0, f"Found {len(errors)} errors")

driver.quit()

# ============================================================
print(f"\n{'='*60}")
print(f"GRADE + NNT VALIDATION: {pass_count} pass, {fail_count} fail / {pass_count + fail_count} total")
print(f"{'='*60}")
sys.exit(0 if fail_count == 0 else 1)
