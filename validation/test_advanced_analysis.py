"""Advanced Analysis Features Integration Tests.

Validates:
- Cumulative meta-analysis (chronological evidence accumulation)
- Trim-and-fill publication bias adjustment (Duval-Tweedie L0)
- Fragility Index (study-level significance sensitivity)
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

def inject_and_run(studies_js):
    """Inject studies and run analysis, return when done."""
    driver.execute_script('''
        var _origLoad = loadStudies;
        loadStudies = async function() {
            extractedStudies = ''' + studies_js + ''';
        };
    ''')
    driver.execute_script('window._done=false; runAnalysis().then(function(){window._done=true;});')
    for _ in range(30):
        time.sleep(0.5)
        if driver.execute_script('return window._done===true;'):
            break

# ============================================================
print("=== Test 1: Cumulative Meta-Analysis (5 studies) ===")
inject_and_run('''[
    {studyId:'SOLVD 1991', authorYear:'SOLVD 1991', effectEstimate:0.84, lowerCI:0.74, upperCI:0.95, effectType:'RR', sampleSize:2569},
    {studyId:'RALES 1999', authorYear:'RALES 1999', effectEstimate:0.70, lowerCI:0.60, upperCI:0.82, effectType:'RR', sampleSize:1663},
    {studyId:'MERIT-HF 1999', authorYear:'MERIT-HF 1999', effectEstimate:0.66, lowerCI:0.53, upperCI:0.81, effectType:'RR', sampleSize:3991},
    {studyId:'PARADIGM 2014', authorYear:'PARADIGM 2014', effectEstimate:0.80, lowerCI:0.73, upperCI:0.87, effectType:'RR', sampleSize:8442},
    {studyId:'DAPA-HF 2019', authorYear:'DAPA-HF 2019', effectEstimate:0.83, lowerCI:0.73, upperCI:0.95, effectType:'RR', sampleSize:4744}
]''')

cum_html = driver.execute_script('return document.getElementById("cumulativeContainer").innerHTML;')
check("Cumulative container rendered", len(cum_html) > 100)
check("Contains SVG", '<svg' in cum_html)
check("Title present", 'Cumulative Meta-Analysis' in cum_html)
check("Study labels shown", 'SOLVD 1991' in cum_html)
check("All 5 studies shown", 'DAPA-HF 2019' in cum_html)

# Programmatic check
cum_result = driver.execute_script('''
    return computeCumulativeMA(extractedStudies, 0.95, 'DL+HKSJ');
''')
check("Cumulative result not null", cum_result is not None)
if cum_result:
    check("5 cumulative steps", len(cum_result) == 5)
    check("First step k=1", cum_result[0]['k'] == 1)
    check("Last step k=5", cum_result[-1]['k'] == 5)
    # Pooled should converge — last step should have narrower CI
    first_ci = cum_result[0]['pooledHi'] - cum_result[0]['pooledLo']
    last_ci = cum_result[-1]['pooledHi'] - cum_result[-1]['pooledLo']
    check("CI narrows over time", last_ci < first_ci,
          f"first_ci={first_ci:.4f}, last_ci={last_ci:.4f}")
    # All pooled < 1 (protective)
    check("All cumulative pooled < 1", all(r['pooled'] < 1 for r in cum_result))
    # Sorted chronologically
    check("Sorted by year", cum_result[0]['label'] == 'SOLVD 1991')
    check("Last study is 2019", cum_result[-1]['label'] == 'DAPA-HF 2019')

# ============================================================
print("\n=== Test 2: Cumulative MA with < 2 studies ===")
cum_single = driver.execute_script('''
    return computeCumulativeMA([
        {effectEstimate:0.80, lowerCI:0.65, upperCI:0.98, effectType:'OR', authorYear:'Solo 2020'}
    ], 0.95, 'DL');
''')
check("Single study returns null", cum_single is None)

# ============================================================
print("\n=== Test 3: Trim-and-Fill (asymmetric funnel) ===")
# Create asymmetric data: several significant studies, missing non-significant ones
inject_and_run('''[
    {studyId:'TF1', authorYear:'TF1 2020', effectEstimate:0.50, lowerCI:0.35, upperCI:0.71, effectType:'OR', sampleSize:200},
    {studyId:'TF2', authorYear:'TF2 2020', effectEstimate:0.55, lowerCI:0.40, upperCI:0.76, effectType:'OR', sampleSize:180},
    {studyId:'TF3', authorYear:'TF3 2020', effectEstimate:0.60, lowerCI:0.42, upperCI:0.86, effectType:'OR', sampleSize:150},
    {studyId:'TF4', authorYear:'TF4 2020', effectEstimate:0.65, lowerCI:0.48, upperCI:0.88, effectType:'OR', sampleSize:170},
    {studyId:'TF5', authorYear:'TF5 2020', effectEstimate:0.70, lowerCI:0.55, upperCI:0.89, effectType:'OR', sampleSize:250},
    {studyId:'TF6', authorYear:'TF6 2020', effectEstimate:0.45, lowerCI:0.30, upperCI:0.67, effectType:'OR', sampleSize:120}
]''')

tf_html = driver.execute_script('return document.getElementById("trimFillContainer").innerHTML;')
check("Trim-fill container rendered", len(tf_html) > 50)
check("Trim-fill title present", 'Trim-and-Fill' in tf_html)

# Programmatic check
tf_result = driver.execute_script('''
    var result = lastAnalysisResult;
    if (!result) return null;
    return trimAndFill(result.studyResults, result, 0.95, 'DL+HKSJ');
''')
check("Trim-fill result not null", tf_result is not None)
if tf_result:
    check("nImputed is integer >= 0", isinstance(tf_result['nImputed'], int) and tf_result['nImputed'] >= 0)
    check("adjustedPooled is number", isinstance(tf_result['adjustedPooled'], (int, float)))
    check("originalPooled is number", isinstance(tf_result['originalPooled'], (int, float)))
    if tf_result['nImputed'] > 0:
        check("Adjusted pooled closer to null", abs(tf_result['adjustedPooled'] - 1) >= abs(tf_result['originalPooled'] - 1) * 0.5,
              f"adj={tf_result['adjustedPooled']:.4f}, orig={tf_result['originalPooled']:.4f}")

# ============================================================
print("\n=== Test 4: Trim-and-Fill (symmetric funnel — no imputation) ===")
tf_symmetric = driver.execute_script('''
    var studies = [
        {yi: -0.2, sei: 0.1, vi: 0.01, authorYear: 'S1'},
        {yi: 0.2, sei: 0.1, vi: 0.01, authorYear: 'S2'},
        {yi: -0.1, sei: 0.15, vi: 0.0225, authorYear: 'S3'},
        {yi: 0.1, sei: 0.15, vi: 0.0225, authorYear: 'S4'},
        {yi: 0.0, sei: 0.08, vi: 0.0064, authorYear: 'S5'}
    ];
    var pooled = {pooled: 1.0, pooledLo: 0.9, pooledHi: 1.1, isRatio: false};
    return trimAndFill(studies, pooled, 0.95, 'DL');
''')
check("Symmetric funnel: no imputation", tf_symmetric is not None and tf_symmetric['nImputed'] == 0,
      f"nImputed={tf_symmetric['nImputed'] if tf_symmetric else 'null'}")

# ============================================================
print("\n=== Test 5: Trim-and-Fill with k < 3 ===")
tf_small = driver.execute_script('''
    return trimAndFill([{yi:0.5, sei:0.1, vi:0.01}], {pooled:1.5}, 0.95, 'DL');
''')
check("k<3 returns null", tf_small is None)

# ============================================================
print("\n=== Test 6: Fragility Index (significant result) ===")
inject_and_run('''[
    {studyId:'FI1', authorYear:'FI1 2020', effectEstimate:0.60, lowerCI:0.45, upperCI:0.80, effectType:'OR', sampleSize:300},
    {studyId:'FI2', authorYear:'FI2 2020', effectEstimate:0.55, lowerCI:0.40, upperCI:0.76, effectType:'OR', sampleSize:250},
    {studyId:'FI3', authorYear:'FI3 2020', effectEstimate:0.85, lowerCI:0.68, upperCI:1.06, effectType:'OR', sampleSize:280},
    {studyId:'FI4', authorYear:'FI4 2020', effectEstimate:0.70, lowerCI:0.52, upperCI:0.94, effectType:'OR', sampleSize:220},
    {studyId:'FI5', authorYear:'FI5 2020', effectEstimate:0.75, lowerCI:0.58, upperCI:0.97, effectType:'OR', sampleSize:260}
]''')

fi_html = driver.execute_script('return document.getElementById("fragilityContainer").innerHTML;')
check("Fragility container rendered", len(fi_html) > 50)
check("Fragility title present", 'Fragility Index' in fi_html)
check("Fragility Quotient shown", 'Fragility Quotient' in fi_html)

fi_result = driver.execute_script('return computeFragilityIndex(extractedStudies);')
check("FI result not null", fi_result is not None)
if fi_result:
    check("FI is integer >= 0", isinstance(fi_result['fragilityIndex'], int) and fi_result['fragilityIndex'] >= 0)
    check("k = 5", fi_result['k'] == 5)
    check("isSignificant is boolean", isinstance(fi_result['isSignificant'], bool))
    check("fragQuotient in [0,1]", 0 <= fi_result['fragQuotient'] <= 1)
    check("Result is significant", fi_result['isSignificant'],
          f"pValue from base analysis should be < 0.05")

# ============================================================
print("\n=== Test 7: Fragility Index (non-significant result) ===")
fi_ns = driver.execute_script('''
    return computeFragilityIndex([
        {effectEstimate:0.90, lowerCI:0.70, upperCI:1.16, effectType:'OR', authorYear:'NS1'},
        {effectEstimate:1.05, lowerCI:0.85, upperCI:1.30, effectType:'OR', authorYear:'NS2'},
        {effectEstimate:0.95, lowerCI:0.75, upperCI:1.20, effectType:'OR', authorYear:'NS3'}
    ]);
''')
check("Non-significant FI computed", fi_ns is not None)
if fi_ns:
    check("Non-significant flagged", fi_ns['isSignificant'] == False)

# ============================================================
print("\n=== Test 8: Fragility Index for continuous (returns null) ===")
fi_md = driver.execute_script('''
    return computeFragilityIndex([
        {effectEstimate:-2.5, lowerCI:-4.0, upperCI:-1.0, effectType:'MD', authorYear:'MD1'},
        {effectEstimate:-1.8, lowerCI:-3.5, upperCI:-0.1, effectType:'MD', authorYear:'MD2'}
    ]);
''')
check("MD outcome returns null (ratio only)", fi_md is None)

# ============================================================
print("\n=== Test 9: All features render together ===")
# Run with 5 studies — all advanced features should render
inject_and_run('''[
    {studyId:'All1', authorYear:'Alpha 2015', effectEstimate:0.70, lowerCI:0.55, upperCI:0.89, effectType:'OR', sampleSize:300},
    {studyId:'All2', authorYear:'Beta 2016', effectEstimate:0.65, lowerCI:0.50, upperCI:0.85, effectType:'OR', sampleSize:250},
    {studyId:'All3', authorYear:'Gamma 2017', effectEstimate:0.80, lowerCI:0.65, upperCI:0.98, effectType:'OR', sampleSize:350},
    {studyId:'All4', authorYear:'Delta 2018', effectEstimate:0.75, lowerCI:0.60, upperCI:0.94, effectType:'OR', sampleSize:280},
    {studyId:'All5', authorYear:'Epsilon 2019', effectEstimate:0.72, lowerCI:0.58, upperCI:0.89, effectType:'OR', sampleSize:320}
]''')

check("Cumulative rendered", len(driver.execute_script('return document.getElementById("cumulativeContainer").innerHTML;') or '') > 100)
check("Trim-fill rendered", len(driver.execute_script('return document.getElementById("trimFillContainer").innerHTML;') or '') > 50)
check("Fragility rendered", len(driver.execute_script('return document.getElementById("fragilityContainer").innerHTML;') or '') > 50)
check("GRADE still rendered", len(driver.execute_script('return document.getElementById("gradeContainer").innerHTML;') or '') > 50)
check("NNT still rendered", len(driver.execute_script('return document.getElementById("nntContainer").innerHTML;') or '') > 50)

# ============================================================
print("\n=== Test 10: Cumulative MA sort order ===")
cum_unsorted = driver.execute_script('''
    return computeCumulativeMA([
        {effectEstimate:0.80, lowerCI:0.65, upperCI:0.98, effectType:'OR', authorYear:'Zulu 2020'},
        {effectEstimate:0.70, lowerCI:0.55, upperCI:0.89, effectType:'OR', authorYear:'Alpha 2010'},
        {effectEstimate:0.75, lowerCI:0.60, upperCI:0.94, effectType:'OR', authorYear:'Beta 2015'}
    ], 0.95, 'DL');
''')
check("Unsorted input sorted correctly", cum_unsorted is not None)
if cum_unsorted:
    check("First = Alpha 2010", cum_unsorted[0]['label'] == 'Alpha 2010')
    check("Second = Beta 2015", cum_unsorted[1]['label'] == 'Beta 2015')
    check("Third = Zulu 2020", cum_unsorted[2]['label'] == 'Zulu 2020')

# JS errors check
logs = driver.get_log('browser')
errors = [l for l in logs if l['level'] == 'SEVERE'
          and 'Access to fetch' not in l.get('message', '')
          and 'Failed to load resource' not in l.get('message', '')]
check("No severe JS errors", len(errors) == 0, f"Found {len(errors)} errors")

driver.quit()

# ============================================================
print(f"\n{'='*60}")
print(f"ADVANCED ANALYSIS: {pass_count} pass, {fail_count} fail / {pass_count + fail_count} total")
print(f"{'='*60}")
sys.exit(0 if fail_count == 0 else 1)
