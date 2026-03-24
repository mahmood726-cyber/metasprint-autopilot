"""Landscape Analytics Integration Tests.

Validates the population-level analytical features:
- Cross-Disease Drug Class Heatmap
- Temporal Effect Trajectories with evidence velocity
- Evidence Maturity Index (composite scoring)
- Population Drift Detection (early vs late comparison)
- parseYearFromStartDate helper
- computeLandscapeVelocity math
- computeEvidenceMaturity scoring
- computePopulationDrift z-test
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

# ============================================================
print("=== Test 1: Landscape analytics functions exist ===")
# ============================================================
for fn in ['renderLandscapeAnalytics', 'renderDrugDiseaseHeatmap', 'renderTemporalTrajectories',
           'renderEvidenceMaturity', 'renderPopulationDrift', 'computeTemporalTrajectory',
           'computeLandscapeVelocity', 'computeEvidenceMaturity', 'computePopulationDrift',
           'parseYearFromStartDate', 'showLandscapeTab', 'sortedMedian']:
    exists = driver.execute_script(f'return typeof {fn} === "function";')
    check(f"{fn} defined", exists)

# ============================================================
print("\n=== Test 2: parseYearFromStartDate ===")
# ============================================================
yr1 = driver.execute_script('return parseYearFromStartDate("2018-03-15");')
check("Parse ISO date '2018-03-15' -> 2018", yr1 == 2018, f"got {yr1}")

yr2 = driver.execute_script('return parseYearFromStartDate("2014-01");')
check("Parse partial date '2014-01' -> 2014", yr2 == 2014, f"got {yr2}")

yr3 = driver.execute_script('return parseYearFromStartDate("2020");')
check("Parse year-only '2020' -> 2020", yr3 == 2020, f"got {yr3}")

yr4 = driver.execute_script('return parseYearFromStartDate(null);')
check("Parse null -> null", yr4 is None)

yr5 = driver.execute_script('return parseYearFromStartDate("");')
check("Parse empty -> null", yr5 is None)

# ============================================================
print("\n=== Test 3: sortedMedian ===")
# ============================================================
med1 = driver.execute_script('return sortedMedian([1, 3, 5, 7, 9]);')
check("Median of [1,3,5,7,9] = 5", med1 == 5, f"got {med1}")

med2 = driver.execute_script('return sortedMedian([1, 3, 5, 7]);')
check("Median of [1,3,5,7] = 4", med2 == 4, f"got {med2}")

med3 = driver.execute_script('return sortedMedian([42]);')
check("Median of [42] = 42", med3 == 42, f"got {med3}")

# ============================================================
print("\n=== Test 4: computeLandscapeVelocity ===")
# ============================================================
vel = driver.execute_script('''
    var traj = [
        {year: 2010, effect: 0.80, ci_lo: 0.60, ci_hi: 1.00},
        {year: 2015, effect: 0.70, ci_lo: 0.58, ci_hi: 0.85},
        {year: 2020, effect: 0.65, ci_lo: 0.55, ci_hi: 0.77}
    ];
    return computeLandscapeVelocity(traj);
''')
check("Velocity result not null", vel is not None)
if vel:
    check("Velocity > 0", vel.get('velocity', 0) > 0, f"v={vel.get('velocity')}")
    check("Year span = 10", vel.get('yearSpan') == 10, f"span={vel.get('yearSpan')}")
    check("Convergence rate > 0 (CI narrowing)", vel.get('convergenceRate', 0) > 0,
          f"conv={vel.get('convergenceRate')}")
    check("Delta effect > 0", vel.get('deltaEffect', 0) > 0, f"delta={vel.get('deltaEffect')}")

vel_null = driver.execute_script('return computeLandscapeVelocity(null);')
check("Velocity null for null input", vel_null is None)

vel_short = driver.execute_script('return computeLandscapeVelocity([{year:2020, effect:0.7}]);')
check("Velocity null for single point", vel_short is None)

# ============================================================
print("\n=== Test 5: computeEvidenceMaturity ===")
# ============================================================
mat = driver.execute_script('''
    return computeEvidenceMaturity({
        pooled: {k: 10, I2: 20},
        total_enrollment: 5000,
        year_range: [2010, 2022],
        studies: []
    });
''')
check("Maturity result not null", mat is not None)
if mat:
    check("Total score in [0,100]", 0 <= mat['total'] <= 100, f"score={mat['total']}")
    check("Has label", mat.get('label') in ['Nascent', 'Emerging', 'Moderate', 'Mature'])
    check("Has color", mat.get('color') is not None)
    check("kScore in [0,25]", 0 <= mat.get('kScore', -1) <= 25)
    check("enrollScore in [0,25]", 0 <= mat.get('enrollScore', -1) <= 25)
    check("consistScore in [0,25]", 0 <= mat.get('consistScore', -1) <= 25)
    check("tempScore in [0,25]", 0 <= mat.get('tempScore', -1) <= 25)

# High maturity case (k=20, low I², high enrollment, wide span)
mat_high = driver.execute_script('''
    return computeEvidenceMaturity({
        pooled: {k: 20, I2: 5},
        total_enrollment: 50000,
        year_range: [2005, 2023],
        studies: []
    });
''')
check("High-evidence cluster labeled Mature", mat_high and mat_high.get('label') == 'Mature',
      f"label={mat_high.get('label') if mat_high else 'null'}")

# Low maturity case (k=2, high I², low enrollment, narrow span)
mat_low = driver.execute_script('''
    return computeEvidenceMaturity({
        pooled: {k: 2, I2: 85},
        total_enrollment: 100,
        year_range: [2020, 2021],
        studies: []
    });
''')
check("Low-evidence cluster labeled Nascent or Emerging",
      mat_low and mat_low.get('label') in ['Nascent', 'Emerging'],
      f"label={mat_low.get('label') if mat_low else 'null'}")

# Null for unpoolable
mat_null = driver.execute_script('return computeEvidenceMaturity({pooled: null});')
check("Maturity null for unpoolable cluster", mat_null is None)

# ============================================================
print("\n=== Test 6: computePopulationDrift ===")
# ============================================================
drift = driver.execute_script('''
    return computePopulationDrift({
        is_ratio: true,
        effect_type: 'OR',
        studies: [
            {effect_estimate: 0.50, lower_ci: 0.30, upper_ci: 0.83, start_date: '2008'},
            {effect_estimate: 0.55, lower_ci: 0.35, upper_ci: 0.86, start_date: '2010'},
            {effect_estimate: 0.75, lower_ci: 0.60, upper_ci: 0.94, start_date: '2016'},
            {effect_estimate: 0.80, lower_ci: 0.65, upper_ci: 0.98, start_date: '2018'},
            {effect_estimate: 0.82, lower_ci: 0.68, upper_ci: 0.99, start_date: '2020'},
            {effect_estimate: 0.78, lower_ci: 0.63, upper_ci: 0.97, start_date: '2022'}
        ]
    });
''')
check("Drift result not null", drift is not None)
if drift:
    check("Has earlyEffect", drift.get('earlyEffect') is not None)
    check("Has lateEffect", drift.get('lateEffect') is not None)
    check("Has shift", drift.get('shift') is not None)
    check("Has pDrift", drift.get('pDrift') is not None)
    check("pDrift in [0,1]", 0 <= drift.get('pDrift', -1) <= 1, f"p={drift.get('pDrift')}")
    check("Early effect < late effect (attenuation toward null for OR<1)",
          drift.get('earlyEffect', 0) < drift.get('lateEffect', 1),
          f"early={drift.get('earlyEffect')}, late={drift.get('lateEffect')}")
    check("Has earlyYearRange", drift.get('earlyYearRange') is not None)
    check("Has lateYearRange", drift.get('lateYearRange') is not None)

drift_null = driver.execute_script('''
    return computePopulationDrift({
        is_ratio: true, effect_type: 'OR',
        studies: [{effect_estimate: 0.70, lower_ci: 0.50, upper_ci: 0.98, start_date: '2020'}]
    });
''')
check("Drift null for k<4", drift_null is None)

# ============================================================
print("\n=== Test 7: computeTemporalTrajectory ===")
# ============================================================
traj = driver.execute_script('''
    return computeTemporalTrajectory({
        is_ratio: true,
        effect_type: 'OR',
        studies: [
            {effect_estimate: 0.60, lower_ci: 0.40, upper_ci: 0.90, start_date: '2010'},
            {effect_estimate: 0.65, lower_ci: 0.45, upper_ci: 0.94, start_date: '2012'},
            {effect_estimate: 0.70, lower_ci: 0.55, upper_ci: 0.89, start_date: '2015'},
            {effect_estimate: 0.72, lower_ci: 0.58, upper_ci: 0.89, start_date: '2018'}
        ]
    });
''')
check("Trajectory not null", traj is not None)
if traj:
    check("Trajectory has >= 2 points", len(traj) >= 2, f"points={len(traj)}")
    check("First point has year", traj[0].get('year') is not None)
    check("First point has effect", traj[0].get('effect') is not None)
    check("First point has CI", traj[0].get('ci_lo') is not None and traj[0].get('ci_hi') is not None)
    check("Years are ascending", all(traj[i]['year'] <= traj[i+1]['year'] for i in range(len(traj)-1)))
    check("k increases along trajectory", all(traj[i]['k'] <= traj[i+1]['k'] for i in range(len(traj)-1)))

traj_null = driver.execute_script('''
    return computeTemporalTrajectory({
        is_ratio: true, effect_type: 'OR',
        studies: [{effect_estimate: 0.70, lower_ci: 0.50, upper_ci: 0.98, start_date: '2020'}]
    });
''')
check("Trajectory null for k<2", traj_null is None)

# ============================================================
print("\n=== Test 8: Landscape analytics HTML containers exist ===")
# ============================================================
for cid in ['landscapeAnalytics', 'landscapeHeatmap', 'landscapeTemporal', 'landscapeMaturity', 'landscapeDrift']:
    exists = driver.execute_script(f'return document.getElementById("{cid}") !== null;')
    check(f"Container #{cid} exists", exists)

# ============================================================
print("\n=== Test 9: showLandscapeTab switching ===")
# ============================================================
# Make analytics visible first
driver.execute_script('document.getElementById("landscapeAnalytics").style.display = "block";')
time.sleep(0.3)

driver.execute_script('showLandscapeTab("temporal", null);')
time.sleep(0.2)
temporal_vis = driver.execute_script('return document.getElementById("landscapeTemporal").style.display;')
heatmap_vis = driver.execute_script('return document.getElementById("landscapeHeatmap").style.display;')
check("Temporal tab shown", temporal_vis == 'block', f"display={temporal_vis}")
check("Heatmap tab hidden", heatmap_vis == 'none', f"display={heatmap_vis}")

driver.execute_script('showLandscapeTab("heatmap", null);')
time.sleep(0.2)
heatmap_vis2 = driver.execute_script('return document.getElementById("landscapeHeatmap").style.display;')
check("Heatmap tab shown after switch", heatmap_vis2 == 'block', f"display={heatmap_vis2}")

# ============================================================
print("\n=== Test 10: Landscape with mock Al-Burhan data ===")
# ============================================================
# Inject mock Al-Burhan data and trigger rendering
driver.execute_script('''
    _alBurhanResults = [
        {
            id: 'af|DOAC|stroke|HR', drug_class: 'DOAC', subcategory: 'af',
            outcome: 'stroke', effect_type: 'HR', is_ratio: true,
            total_enrollment: 20000, year_range: [2009, 2020],
            studies: [
                {nct_id:'NCT001', effect_estimate:0.65, lower_ci:0.52, upper_ci:0.81, enrollment:5000, start_date:'2009-03'},
                {nct_id:'NCT002', effect_estimate:0.70, lower_ci:0.58, upper_ci:0.85, enrollment:6000, start_date:'2012-06'},
                {nct_id:'NCT003', effect_estimate:0.72, lower_ci:0.62, upper_ci:0.84, enrollment:4500, start_date:'2015-01'},
                {nct_id:'NCT004', effect_estimate:0.78, lower_ci:0.68, upper_ci:0.89, enrollment:4500, start_date:'2018-09'}
            ],
            pooled: {effect:0.71, ci_lo:0.63, ci_hi:0.80, tau2:0.001, I2:15, Q:3.5, p:0.001, k:4,
                     pi_lo:0.50, pi_hi:1.01, method:'DL+HKSJ', ci_level:0.95, muRE:-0.34, seRE:0.06, isRatio:true}
        },
        {
            id: 'hf|SGLT2|hosp|HR', drug_class: 'SGLT2 inhibitor', subcategory: 'hf',
            outcome: 'HF hospitalization', effect_type: 'HR', is_ratio: true,
            total_enrollment: 15000, year_range: [2015, 2022],
            studies: [
                {nct_id:'NCT010', effect_estimate:0.70, lower_ci:0.55, upper_ci:0.89, enrollment:3500, start_date:'2015-06'},
                {nct_id:'NCT011', effect_estimate:0.65, lower_ci:0.52, upper_ci:0.81, enrollment:5000, start_date:'2017-01'},
                {nct_id:'NCT012', effect_estimate:0.62, lower_ci:0.50, upper_ci:0.77, enrollment:3000, start_date:'2019-08'},
                {nct_id:'NCT013', effect_estimate:0.68, lower_ci:0.57, upper_ci:0.81, enrollment:3500, start_date:'2021-03'}
            ],
            pooled: {effect:0.66, ci_lo:0.58, ci_hi:0.75, tau2:0.002, I2:10, Q:3.3, p:0.0001, k:4,
                     pi_lo:0.45, pi_hi:0.97, method:'DL+HKSJ', ci_level:0.95, muRE:-0.42, seRE:0.065, isRatio:true}
        },
        {
            id: 'htn|ARB|sbp|MD', drug_class: 'ARB', subcategory: 'htn',
            outcome: 'SBP reduction', effect_type: 'MD', is_ratio: false,
            total_enrollment: 8000, year_range: [2006, 2019],
            studies: [
                {nct_id:'NCT020', effect_estimate:-12.5, lower_ci:-16.0, upper_ci:-9.0, enrollment:2000, start_date:'2006'},
                {nct_id:'NCT021', effect_estimate:-10.2, lower_ci:-13.5, upper_ci:-6.9, enrollment:3000, start_date:'2012'},
                {nct_id:'NCT022', effect_estimate:-11.8, lower_ci:-14.1, upper_ci:-9.5, enrollment:3000, start_date:'2019'}
            ],
            pooled: {effect:-11.5, ci_lo:-13.2, ci_hi:-9.8, tau2:1.2, I2:30, Q:4.3, p:0.0001, k:3,
                     pi_lo:-18.0, pi_hi:-5.0, method:'DL+HKSJ', ci_level:0.95, muRE:-11.5, seRE:0.87, isRatio:false}
        },
        {
            id: 'af|DOAC|bleed|HR', drug_class: 'DOAC', subcategory: 'af',
            outcome: 'major bleeding', effect_type: 'HR', is_ratio: true,
            total_enrollment: 18000, year_range: [2009, 2020],
            studies: [
                {nct_id:'NCT001', effect_estimate:0.80, lower_ci:0.65, upper_ci:0.98, enrollment:5000, start_date:'2009'},
                {nct_id:'NCT002', effect_estimate:0.85, lower_ci:0.72, upper_ci:1.00, enrollment:6000, start_date:'2012'},
                {nct_id:'NCT003', effect_estimate:0.82, lower_ci:0.70, upper_ci:0.96, enrollment:4000, start_date:'2016'},
                {nct_id:'NCT004', effect_estimate:0.88, lower_ci:0.76, upper_ci:1.02, enrollment:3000, start_date:'2019'}
            ],
            pooled: {effect:0.84, ci_lo:0.76, ci_hi:0.93, tau2:0.001, I2:8, Q:3.2, p:0.002, k:4,
                     pi_lo:0.60, pi_hi:1.17, method:'DL+HKSJ', ci_level:0.95, muRE:-0.17, seRE:0.05, isRatio:true}
        }
    ];
    renderLandscapeAnalytics();
''')
time.sleep(1)

# Check analytics panel is visible
panel_vis = driver.execute_script('return document.getElementById("landscapeAnalytics").style.display;')
check("Landscape analytics panel visible", panel_vis != 'none', f"display={panel_vis}")

# Check heatmap rendered
heatmap = driver.execute_script('return document.getElementById("landscapeHeatmap")?.innerHTML || "";')
check("Heatmap has content", len(heatmap) > 200, f"len={len(heatmap)}")
check("Heatmap contains DOAC", 'DOAC' in heatmap)
check("Heatmap contains SGLT2", 'SGLT2' in heatmap)
check("Heatmap contains ARB", 'ARB' in heatmap)

# ============================================================
print("\n=== Test 11: Temporal trajectories with mock data ===")
# ============================================================
driver.execute_script('showLandscapeTab("temporal", null);')
time.sleep(0.3)
temporal = driver.execute_script('return document.getElementById("landscapeTemporal")?.innerHTML || "";')
check("Temporal panel has content", len(temporal) > 100, f"len={len(temporal)}")
check("Contains SVG trajectory chart", '<svg' in temporal)
check("Contains 'Temporal Effect Trajectories'", 'Temporal' in temporal)

# ============================================================
print("\n=== Test 12: Evidence maturity with mock data ===")
# ============================================================
driver.execute_script('showLandscapeTab("maturity", null);')
time.sleep(0.3)
maturity = driver.execute_script('return document.getElementById("landscapeMaturity")?.innerHTML || "";')
check("Maturity panel has content", len(maturity) > 200, f"len={len(maturity)}")
check("Contains 'Evidence Maturity'", 'Evidence Maturity' in maturity)
check("Contains maturity labels", any(l in maturity for l in ['Nascent', 'Emerging', 'Moderate', 'Mature']))

# ============================================================
print("\n=== Test 13: Population drift with mock data ===")
# ============================================================
driver.execute_script('showLandscapeTab("drift", null);')
time.sleep(0.3)
drift_html = driver.execute_script('return document.getElementById("landscapeDrift")?.innerHTML || "";')
check("Drift panel has content", len(drift_html) > 200, f"len={len(drift_html)}")
check("Contains 'Population Drift'", 'Population Drift' in drift_html)
check("Contains pattern labels", any(p in drift_html for p in ['Attenuating', 'Amplifying', 'Stable']))

# ============================================================
print("\n=== Test 14: Heatmap cell clickability (drill-down) ===")
# ============================================================
driver.execute_script('showLandscapeTab("heatmap", null);')
time.sleep(0.3)
has_onclick = driver.execute_script('''
    var cells = document.querySelectorAll("#landscapeHeatmap td[onclick]");
    return cells.length;
''')
check("Heatmap cells have onclick for drill-down", has_onclick > 0, f"clickable cells={has_onclick}")

# ============================================================
print("\n=== Test 15: Evidence maturity scoring validation ===")
# ============================================================
# Perfect cluster (k=10, N=50K, I2=0, 18yr span) should be Mature
perfect = driver.execute_script('''
    return computeEvidenceMaturity({
        pooled: {k: 10, I2: 0},
        total_enrollment: 50000,
        year_range: [2005, 2023],
        studies: []
    });
''')
check("Perfect cluster is Mature", perfect and perfect.get('label') == 'Mature',
      f"label={perfect.get('label') if perfect else 'null'}, score={perfect.get('total') if perfect else 'null'}")
check("Perfect cluster kScore = 25 (max)", perfect and perfect.get('kScore') == 25,
      f"kScore={perfect.get('kScore') if perfect else 'null'}")
check("Perfect cluster consistScore = 25 (I2=0)", perfect and perfect.get('consistScore') == 25,
      f"consistScore={perfect.get('consistScore') if perfect else 'null'}")

# ============================================================
print("\n=== Test 16: Temporal trajectory with MD (continuous) ===")
# ============================================================
traj_md = driver.execute_script('''
    return computeTemporalTrajectory({
        is_ratio: false,
        effect_type: 'MD',
        studies: [
            {effect_estimate: -10.0, lower_ci: -15.0, upper_ci: -5.0, start_date: '2010'},
            {effect_estimate: -8.5, lower_ci: -12.0, upper_ci: -5.0, start_date: '2013'},
            {effect_estimate: -9.2, lower_ci: -11.5, upper_ci: -6.9, start_date: '2017'}
        ]
    });
''')
check("MD trajectory not null", traj_md is not None)
if traj_md:
    check("MD trajectory has >= 2 points", len(traj_md) >= 2)
    check("MD effects are negative", all(t['effect'] < 0 for t in traj_md))

# ============================================================
print("\n=== Test 17: Population drift direction for attenuating effects ===")
# ============================================================
# Early studies show stronger effect (lower OR), late studies show weaker (closer to 1)
drift_atten = driver.execute_script('''
    return computePopulationDrift({
        is_ratio: true, effect_type: 'OR',
        studies: [
            {effect_estimate: 0.40, lower_ci: 0.25, upper_ci: 0.64, start_date: '2005'},
            {effect_estimate: 0.45, lower_ci: 0.30, upper_ci: 0.67, start_date: '2008'},
            {effect_estimate: 0.75, lower_ci: 0.60, upper_ci: 0.94, start_date: '2018'},
            {effect_estimate: 0.80, lower_ci: 0.65, upper_ci: 0.98, start_date: '2020'}
        ]
    });
''')
check("Attenuating drift detected", drift_atten is not None)
if drift_atten:
    check("Late effect closer to null (higher OR)",
          drift_atten.get('lateEffect', 0) > drift_atten.get('earlyEffect', 1),
          f"early={drift_atten.get('earlyEffect')}, late={drift_atten.get('lateEffect')}")

# ============================================================
print("\n=== Test 18: Cross-disease same drug appears in heatmap ===")
# ============================================================
# DOAC appears in 'af' with two different outcomes — heatmap should show it
doac_cells = driver.execute_script('''
    var cells = document.querySelectorAll("#landscapeHeatmap td");
    var count = 0;
    cells.forEach(function(c) {
        if (c.textContent.includes("DOAC") || c.closest("tr")?.querySelector("td")?.textContent?.includes("DOAC")) count++;
    });
    // Count rows containing DOAC
    var rows = document.querySelectorAll("#landscapeHeatmap tr");
    var doac_row = 0;
    rows.forEach(function(r) {
        if (r.querySelector("td") && r.querySelector("td").textContent.includes("DOAC")) doac_row++;
    });
    return doac_row;
''')
check("DOAC appears in heatmap rows", doac_cells >= 1, f"doac_rows={doac_cells}")

# ============================================================
print("\n=== Test 19: Velocity computation for constant effects ===")
# ============================================================
vel_const = driver.execute_script('''
    var traj = [
        {year: 2010, effect: 0.70, ci_lo: 0.55, ci_hi: 0.89},
        {year: 2020, effect: 0.70, ci_lo: 0.60, ci_hi: 0.82}
    ];
    return computeLandscapeVelocity(traj);
''')
check("Zero velocity for constant effect", vel_const is not None and vel_const.get('velocity') == 0,
      f"velocity={vel_const.get('velocity') if vel_const else 'null'}")
check("Positive convergence for narrowing CI", vel_const and vel_const.get('convergenceRate', 0) > 0,
      f"conv={vel_const.get('convergenceRate') if vel_const else 'null'}")

# ============================================================
print("\n=== Test 20: No JS console errors ===")
# ============================================================
logs = driver.get_log('browser')
severe_errors = [l for l in logs if l.get('level') == 'SEVERE'
                 and 'favicon' not in l.get('message', '')
                 and 'Access to fetch' not in l.get('message', '')
                 and 'eutils.ncbi' not in l.get('message', '')]
check("No severe JS errors", len(severe_errors) == 0,
      f"errors: {[e['message'][:100] for e in severe_errors[:3]]}")

# ============================================================
# Cleanup
# ============================================================
driver.quit()

print(f"\n{'='*60}")
print(f"LANDSCAPE ANALYTICS: {pass_count} pass, {fail_count} fail / {pass_count + fail_count} total")
print(f"{'='*60}")
sys.exit(1 if fail_count > 0 else 0)
