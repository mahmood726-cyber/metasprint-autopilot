"""Test advanced statistical functions and guideline integration."""
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

# === TEST 1: New statistical functions ===
print("=== STATISTICAL FUNCTIONS ===")
result = driver.execute_script("""
    var out = {};
    var data = [
        {yi: 0.5, vi: 0.04, sei: 0.2},
        {yi: 0.3, vi: 0.09, sei: 0.3},
        {yi: 0.7, vi: 0.01, sei: 0.1},
        {yi: 0.4, vi: 0.0625, sei: 0.25},
        {yi: 0.6, vi: 0.0225, sei: 0.15}
    ];
    out.qProfileCI = typeof qProfileCI === 'function' ? qProfileCI(data, 0.95) : 'MISSING';
    out.proportionBenefit = typeof proportionBenefit === 'function' ? proportionBenefit(-0.3, 0.05, 0.1, true) : 'MISSING';
    out.petPeese = typeof petPeese === 'function' ? (petPeese(data, 0.01) || 'NULL_RESULT') : 'MISSING';
    out.computeGRADE = typeof computeGRADE === 'function' ? computeGRADE({
        pooled: 0.8, pooledLo: 0.65, pooledHi: 0.98, I2: 30, isRatio: true,
        piLo: 0.5, piHi: 1.3, k: 5, sValue: 5.2
    }, []) : 'MISSING';
    out.computeNNT = typeof computeNNT === 'function' ? computeNNT(0.75, true, 0.20) : 'MISSING';
    out.bucherIndirect = typeof bucherIndirect === 'function' ? bucherIndirect(0.8, 0.1, 0.9, 0.12, true) : 'MISSING';
    out.metaRegression = typeof metaRegression === 'function' ? metaRegression(data, [100, 200, 300, 400, 500], 0.01) : 'MISSING';
    out.chi2Quantile = typeof chi2Quantile === 'function' ? chi2Quantile(0.975, 10) : 'MISSING';
    out.guidelinesExist = typeof CV_GUIDELINES !== 'undefined';
    out.hfDrugCount = typeof CV_GUIDELINES !== 'undefined' && CV_GUIDELINES.hf ? CV_GUIDELINES.hf.keyDrugs.length : 0;
    return out;
""")

passes = 0
fails = 0
for k, v in result.items():
    status = "PASS" if v != 'MISSING' and v is not None else "FAIL"
    if status == "PASS":
        passes += 1
    else:
        fails += 1
    detail = json.dumps(v)[:120] if isinstance(v, dict) else str(v)
    print(f"  {status}: {k} = {detail}")

# === TEST 2: Al-Burhan pooled fields ===
print("\n=== AL-BURHAN POOLED FIELDS ===")
alb = driver.execute_script("""
    if (!_alBurhanResults || _alBurhanResults.length === 0) return 'NO_DATA';
    var pooled = _alBurhanResults.filter(function(r) { return r.pooled; });
    if (pooled.length === 0) return 'NO_POOLED';
    var sample = pooled[0].pooled;
    return {
        hasGrade: sample.grade !== null && sample.grade !== undefined,
        gradeLabel: sample.grade ? sample.grade.label : null,
        hasTau2CI: sample.tau2CI !== null && sample.tau2CI !== undefined,
        hasPetPeese: sample.petPeese !== null && sample.petPeese !== undefined,
        pBenefit: sample.pBenefit,
        nnt: sample.nnt,
        sValue: sample.sValue,
        piLo: sample.pi_lo,
        piHi: sample.pi_hi,
        totalPooled: pooled.length
    };
""")
if isinstance(alb, dict):
    for k, v in alb.items():
        status = "PASS" if v is not None else "INFO"
        if status == "PASS":
            passes += 1
        print(f"  {status}: {k} = {v}")
else:
    print(f"  INFO: {alb}")

# === TEST 3: Network + Guidelines ===
print("\n=== NETWORK + GUIDELINES ===")
driver.execute_script('switchPhase("discover")')
time.sleep(2)
net = driver.execute_script("""
    switchUniverseView("network");
    return {
        svgChildren: document.getElementById("networkSvg").children.length,
        guidelinesObj: typeof CV_GUIDELINES !== "undefined",
        hfGuidelines: CV_GUIDELINES.hf.guidelines,
        recSymbols: typeof REC_SYMBOLS !== "undefined",
        recColors: typeof REC_COLORS !== "undefined"
    };
""")
for k, v in net.items():
    status = "PASS" if v else "FAIL"
    if status == "PASS":
        passes += 1
    else:
        fails += 1
    print(f"  {status}: {k} = {v}")

# JS errors (excluding CORS)
logs = driver.get_log('browser')
errors = [l for l in logs if l['level'] == 'SEVERE'
          and 'Access to fetch' not in l.get('message', '')
          and 'Failed to load resource' not in l.get('message', '')]
for e in errors[:5]:
    print(f"JS ERROR: {e['message'][:300]}")
    fails += 1

print(f"\n=== SUMMARY: {passes} pass, {fails} fail ===")
driver.quit()
