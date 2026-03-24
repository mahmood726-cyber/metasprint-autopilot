"""Meta-Regression + NMA League Table Integration Tests.

Validates:
- Meta-regression with year moderator
- Meta-regression with sample size moderator
- Bubble plot SVG rendering
- Regression statistics (slope, R²τ, p-value)
- Moderator dropdown switching
- NMA league table from subgroups (Bucher indirect comparisons)
- P-score ranking
- Edge cases (k<3, no year data, single subgroup)
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
# Study datasets for testing
# ============================================================

# 6 studies with year data, sample sizes, and varied effects
STUDIES_WITH_YEARS = """[
    {id:'s1', projectId:'test', authorYear:'Smith 2015', nTotal:200, effectEstimate:0.72, lowerCI:0.55, upperCI:0.94, effectType:'OR', subgroup:'Drug A'},
    {id:'s2', projectId:'test', authorYear:'Jones 2016', nTotal:350, effectEstimate:0.65, lowerCI:0.50, upperCI:0.84, effectType:'OR', subgroup:'Drug A'},
    {id:'s3', projectId:'test', authorYear:'Lee 2018', nTotal:500, effectEstimate:0.80, lowerCI:0.68, upperCI:0.94, effectType:'OR', subgroup:'Drug A'},
    {id:'s4', projectId:'test', authorYear:'Chen 2019', nTotal:180, effectEstimate:0.55, lowerCI:0.38, upperCI:0.80, effectType:'OR', subgroup:'Drug B'},
    {id:'s5', projectId:'test', authorYear:'Wilson 2020', nTotal:420, effectEstimate:0.60, lowerCI:0.47, upperCI:0.77, effectType:'OR', subgroup:'Drug B'},
    {id:'s6', projectId:'test', authorYear:'Kim 2021', nTotal:600, effectEstimate:0.70, lowerCI:0.59, upperCI:0.83, effectType:'OR', subgroup:'Drug B'}
]"""

# 3 studies without subgroups (meta-regression only)
STUDIES_NO_SUBGROUP = """[
    {id:'s1', projectId:'test', authorYear:'Alpha 2010', nTotal:100, effectEstimate:0.50, lowerCI:0.30, upperCI:0.83, effectType:'OR', subgroup:''},
    {id:'s2', projectId:'test', authorYear:'Beta 2015', nTotal:250, effectEstimate:0.70, lowerCI:0.55, upperCI:0.89, effectType:'OR', subgroup:''},
    {id:'s3', projectId:'test', authorYear:'Gamma 2020', nTotal:400, effectEstimate:0.85, lowerCI:0.72, upperCI:1.00, effectType:'OR', subgroup:''}
]"""

# 2 studies only (k<3 — insufficient for regression)
STUDIES_K2 = """[
    {id:'s1', projectId:'test', authorYear:'Study A 2018', nTotal:200, effectEstimate:0.70, lowerCI:0.50, upperCI:0.98, effectType:'OR', subgroup:''},
    {id:'s2', projectId:'test', authorYear:'Study B 2020', nTotal:300, effectEstimate:0.65, lowerCI:0.48, upperCI:0.88, effectType:'OR', subgroup:''}
]"""

# Studies without year in authorYear (no parseable year)
STUDIES_NO_YEAR = """[
    {id:'s1', projectId:'test', authorYear:'Alpha', nTotal:100, effectEstimate:0.50, lowerCI:0.30, upperCI:0.83, effectType:'OR', subgroup:''},
    {id:'s2', projectId:'test', authorYear:'Beta', nTotal:250, effectEstimate:0.70, lowerCI:0.55, upperCI:0.89, effectType:'OR', subgroup:''},
    {id:'s3', projectId:'test', authorYear:'Gamma', nTotal:400, effectEstimate:0.85, lowerCI:0.72, upperCI:1.00, effectType:'OR', subgroup:''}
]"""

# 3 subgroups (A, B, C) for NMA testing
STUDIES_3_SUBGROUPS = """[
    {id:'s1', projectId:'test', authorYear:'A1 2018', nTotal:200, effectEstimate:0.72, lowerCI:0.55, upperCI:0.94, effectType:'OR', subgroup:'DrugA'},
    {id:'s2', projectId:'test', authorYear:'A2 2019', nTotal:300, effectEstimate:0.68, lowerCI:0.54, upperCI:0.86, effectType:'OR', subgroup:'DrugA'},
    {id:'s3', projectId:'test', authorYear:'B1 2018', nTotal:250, effectEstimate:0.55, lowerCI:0.40, upperCI:0.76, effectType:'OR', subgroup:'DrugB'},
    {id:'s4', projectId:'test', authorYear:'B2 2020', nTotal:400, effectEstimate:0.50, lowerCI:0.38, upperCI:0.66, effectType:'OR', subgroup:'DrugB'},
    {id:'s5', projectId:'test', authorYear:'C1 2019', nTotal:180, effectEstimate:0.85, lowerCI:0.65, upperCI:1.11, effectType:'OR', subgroup:'DrugC'},
    {id:'s6', projectId:'test', authorYear:'C2 2021', nTotal:350, effectEstimate:0.78, lowerCI:0.62, upperCI:0.98, effectType:'OR', subgroup:'DrugC'}
]"""

# MD (continuous outcome) studies for testing non-ratio regression
STUDIES_MD = """[
    {id:'s1', projectId:'test', authorYear:'Ref 2015', nTotal:80, effectEstimate:-5.2, lowerCI:-8.1, upperCI:-2.3, effectType:'MD', subgroup:'Low Dose'},
    {id:'s2', projectId:'test', authorYear:'Ref 2017', nTotal:120, effectEstimate:-3.8, lowerCI:-6.0, upperCI:-1.6, effectType:'MD', subgroup:'Low Dose'},
    {id:'s3', projectId:'test', authorYear:'Ref 2019', nTotal:200, effectEstimate:-4.5, lowerCI:-6.2, upperCI:-2.8, effectType:'MD', subgroup:'High Dose'},
    {id:'s4', projectId:'test', authorYear:'Ref 2021', nTotal:300, effectEstimate:-6.1, lowerCI:-7.8, upperCI:-4.4, effectType:'MD', subgroup:'High Dose'}
]"""

# ============================================================
print("=== Test 1: Meta-regression functions exist ===")
# ============================================================
fn_exists = driver.execute_script('return typeof metaRegression === "function";')
check("metaRegression function defined", fn_exists)

fn_render = driver.execute_script('return typeof renderMetaRegression === "function";')
check("renderMetaRegression function defined", fn_render)

fn_parse = driver.execute_script('return typeof parseYearFromAuthorYear === "function";')
check("parseYearFromAuthorYear function defined", fn_parse)

fn_nma = driver.execute_script('return typeof computeSubgroupNMA === "function";')
check("computeSubgroupNMA function defined", fn_nma)

fn_league = driver.execute_script('return typeof renderNMALeagueTable === "function";')
check("renderNMALeagueTable function defined", fn_league)

# ============================================================
print("\n=== Test 2: Year parsing from authorYear ===")
# ============================================================
yr1 = driver.execute_script('return parseYearFromAuthorYear("Smith 2020");')
check("Parse 'Smith 2020' -> 2020", yr1 == 2020, f"got {yr1}")

yr2 = driver.execute_script('return parseYearFromAuthorYear("Jones et al. 2018");')
check("Parse 'Jones et al. 2018' -> 2018", yr2 == 2018, f"got {yr2}")

yr3 = driver.execute_script('return parseYearFromAuthorYear("Alpha");')
check("Parse 'Alpha' (no year) -> null", yr3 is None, f"got {yr3}")

yr4 = driver.execute_script('return parseYearFromAuthorYear("Trial-1999a");')
check("Parse 'Trial-1999a' -> 1999", yr4 == 1999, f"got {yr4}")

yr5 = driver.execute_script('return parseYearFromAuthorYear("");')
check("Parse empty string -> null", yr5 is None, f"got {yr5}")

yr6 = driver.execute_script('return parseYearFromAuthorYear(null);')
check("Parse null -> null", yr6 is None, f"got {yr6}")

# ============================================================
print("\n=== Test 3: Meta-regression unit test (direct JS call) ===")
# ============================================================
reg_result = driver.execute_script('''
    var sd = [
        {yi: Math.log(0.72), vi: 0.01, sei: 0.1, wi_re: 100},
        {yi: Math.log(0.65), vi: 0.008, sei: 0.09, wi_re: 125},
        {yi: Math.log(0.80), vi: 0.006, sei: 0.077, wi_re: 167},
        {yi: Math.log(0.55), vi: 0.015, sei: 0.122, wi_re: 67}
    ];
    var mods = [2015, 2016, 2018, 2019];
    var result = metaRegression(sd, mods, 0.01);
    return result;
''')
check("metaRegression returns non-null for k=4", reg_result is not None)
if reg_result:
    check("Has slope", 'slope' in reg_result)
    check("Has intercept", 'intercept' in reg_result)
    check("Has R2tau", 'R2tau' in reg_result)
    check("Has pValue", 'pValue' in reg_result)
    check("Has k=4", reg_result.get('k') == 4, f"got k={reg_result.get('k')}")
    check("R2tau in [0,1]", 0 <= reg_result.get('R2tau', -1) <= 1,
          f"R2tau={reg_result.get('R2tau')}")
    check("pValue in [0,1]", 0 <= reg_result.get('pValue', -1) <= 1,
          f"p={reg_result.get('pValue')}")

# ============================================================
print("\n=== Test 4: Meta-regression returns null for k<3 ===")
# ============================================================
reg_k2 = driver.execute_script('''
    var sd = [{yi: -0.3, vi: 0.01, sei: 0.1}, {yi: -0.5, vi: 0.02, sei: 0.14}];
    return metaRegression(sd, [2018, 2020], 0.01);
''')
check("metaRegression null for k=2", reg_k2 is None)

reg_null_mod = driver.execute_script('''
    var sd = [{yi: -0.3, vi: 0.01, sei: 0.1}, {yi: -0.5, vi: 0.02, sei: 0.14}, {yi: -0.2, vi: 0.015, sei: 0.12}];
    return metaRegression(sd, [null, null, null], 0.01);
''')
check("metaRegression null for all-null moderators", reg_null_mod is None)

# ============================================================
print("\n=== Test 5: Meta-regression rendering with year data ===")
# ============================================================
inject_and_run(STUDIES_WITH_YEARS)
time.sleep(1)

container = driver.execute_script('return document.getElementById("metaRegressionContainer")?.innerHTML || "";')
check("Meta-regression container has content", len(container) > 100, f"len={len(container)}")
check("Contains 'Meta-Regression' heading", 'Meta-Regression' in container)
check("Contains SVG bubble plot", '<svg' in container)
check("Contains moderator dropdown", 'metaRegModSelect' in container)

# Check SVG has bubbles
bubble_count = driver.execute_script('''
    var svg = document.querySelector("#metaRegPlot svg");
    return svg ? svg.querySelectorAll("circle").length : 0;
''')
check("Bubble plot has circles", bubble_count >= 3, f"circles={bubble_count}")

# Check regression line exists
has_regline = driver.execute_script('''
    var svg = document.querySelector("#metaRegPlot svg");
    if (!svg) return false;
    var lines = svg.querySelectorAll("line");
    for (var i = 0; i < lines.length; i++) {
        if (lines[i].getAttribute("stroke-width") === "2") return true;
    }
    return false;
''')
check("Regression line rendered (stroke-width=2)", has_regline)

# Check stats table
stats = driver.execute_script('return document.getElementById("metaRegStats")?.innerText || "";')
check("Stats table contains Slope", 'Slope' in stats)
check("Stats table contains R\u00B2", 'R' in stats and '%' in stats)
check("Stats table contains p-value", 'p-value' in stats or 'p=' in stats)

# ============================================================
print("\n=== Test 6: Moderator switching ===")
# ============================================================
# Check available moderator options
options = driver.execute_script('''
    var sel = document.getElementById("metaRegModSelect");
    if (!sel) return [];
    return Array.from(sel.options).map(function(o) { return o.value; });
''')
check("Year moderator available", 'year' in options, f"options={options}")
check("Sample size moderator available", 'sampleSize' in options, f"options={options}")

# Switch to sample size and verify plot updates
if 'sampleSize' in options:
    driver.execute_script('updateMetaRegPlot("sampleSize");')
    time.sleep(0.5)
    svg_after = driver.execute_script('return document.getElementById("metaRegPlot")?.innerHTML || "";')
    check("Plot updates after moderator switch", 'Sample Size' in svg_after, f"svg contains: {svg_after[:100]}")

# Switch back to year
driver.execute_script('updateMetaRegPlot("year");')
time.sleep(0.3)

# ============================================================
print("\n=== Test 7: Meta-regression with no year data ===")
# ============================================================
inject_and_run(STUDIES_NO_YEAR)
time.sleep(1)

container_noyear = driver.execute_script('return document.getElementById("metaRegressionContainer")?.innerHTML || "";')
# Should still render with sample size moderator (nTotal is available)
check("Renders with sampleSize when no year", len(container_noyear) > 100 or 'Sample' in container_noyear,
      f"len={len(container_noyear)}")

opts_noyear = driver.execute_script('''
    var sel = document.getElementById("metaRegModSelect");
    if (!sel) return [];
    return Array.from(sel.options).map(function(o) { return o.value; });
''')
check("Year NOT in options when no year data", 'year' not in opts_noyear, f"options={opts_noyear}")
check("sampleSize in options", 'sampleSize' in opts_noyear, f"options={opts_noyear}")

# ============================================================
print("\n=== Test 8: Meta-regression with k<3 (should be empty) ===")
# ============================================================
inject_and_run(STUDIES_K2)
time.sleep(1)

container_k2 = driver.execute_script('return document.getElementById("metaRegressionContainer")?.innerHTML || "";')
check("Empty container for k=2", container_k2.strip() == '', f"got: {container_k2[:80]}")

# ============================================================
print("\n=== Test 9: NMA league table with 2 subgroups ===")
# ============================================================
inject_and_run(STUDIES_WITH_YEARS)
time.sleep(1)

nma_html = driver.execute_script('return document.getElementById("nmaLeagueContainer")?.innerHTML || "";')
check("NMA container has content", len(nma_html) > 100, f"len={len(nma_html)}")
check("Contains 'Network Meta-Analysis' heading", 'Network Meta-Analysis' in nma_html)
check("Contains 'Bucher' method note", 'Bucher' in nma_html)
check("Contains Drug A", 'Drug A' in nma_html)
check("Contains Drug B", 'Drug B' in nma_html)
check("Contains P-Score", 'P-Score' in nma_html)

# Check league table structure
cells = driver.execute_script('''
    var tbl = document.querySelector("#nmaLeagueContainer table");
    if (!tbl) return 0;
    return tbl.querySelectorAll("td").length;
''')
check("League table has cells", cells >= 4, f"cells={cells}")

# ============================================================
print("\n=== Test 10: NMA league table with 3 subgroups ===")
# ============================================================
inject_and_run(STUDIES_3_SUBGROUPS)
time.sleep(1)

nma3 = driver.execute_script('return document.getElementById("nmaLeagueContainer")?.innerHTML || "";')
check("3-subgroup NMA has content", len(nma3) > 200, f"len={len(nma3)}")
check("Contains DrugA", 'DrugA' in nma3)
check("Contains DrugB", 'DrugB' in nma3)
check("Contains DrugC", 'DrugC' in nma3)

# Count indirect comparisons (3 choose 2 = 3)
comp_count = driver.execute_script('''
    var tbl = document.querySelectorAll("#nmaLeagueContainer table")[0];
    if (!tbl) return 0;
    var cells = tbl.querySelectorAll("td");
    var count = 0;
    cells.forEach(function(c) { if (c.querySelector("strong")) count++; });
    return count;
''')
check("3x3 league table has 6 effect cells (off-diagonal)", comp_count == 6, f"count={comp_count}")

# Check P-score ranking (3 drugs)
pscore_rows = driver.execute_script('''
    var tables = document.querySelectorAll("#nmaLeagueContainer table");
    if (tables.length < 2) return 0;
    return tables[1].querySelectorAll("tr").length;
''')
check("P-score table has 3 rows", pscore_rows == 3, f"rows={pscore_rows}")

# ============================================================
print("\n=== Test 11: NMA empty when no subgroups ===")
# ============================================================
inject_and_run(STUDIES_NO_SUBGROUP)
time.sleep(1)

nma_empty = driver.execute_script('return document.getElementById("nmaLeagueContainer")?.innerHTML || "";')
check("NMA empty when no subgroups", nma_empty.strip() == '', f"got: {nma_empty[:80]}")

# ============================================================
print("\n=== Test 12: computeSubgroupNMA direct JS test ===")
# ============================================================
nma_direct = driver.execute_script('''
    var subResult = {
        groups: {
            DrugA: {pooled: 0.70, pooledLo: 0.55, pooledHi: 0.89, k: 3},
            DrugB: {pooled: 0.55, pooledLo: 0.42, pooledHi: 0.72, k: 2}
        }
    };
    return computeSubgroupNMA(subResult, true, 0.95);
''')
check("computeSubgroupNMA returns result", nma_direct is not None)
if nma_direct:
    check("Has comparisons array", 'comparisons' in nma_direct)
    comps = nma_direct.get('comparisons', [])
    check("Has 1 comparison (2 drugs)", len(comps) == 1, f"got {len(comps)}")
    if len(comps) > 0:
        c = comps[0]
        check("Comparison has effect", 'effect' in c)
        check("Comparison has CI", 'ci_lo' in c and 'ci_hi' in c)
        check("Comparison has p-value", 'p' in c)
        check("Effect is ratio (>0)", c.get('effect', 0) > 0, f"effect={c.get('effect')}")
    check("Has pScores", 'pScores' in nma_direct)
    check("Has names", 'names' in nma_direct)

# ============================================================
print("\n=== Test 13: computeSubgroupNMA null for single subgroup ===")
# ============================================================
nma_single = driver.execute_script('''
    var subResult = {
        groups: {
            OnlyDrug: {pooled: 0.70, pooledLo: 0.55, pooledHi: 0.89, k: 5}
        }
    };
    return computeSubgroupNMA(subResult, true, 0.95);
''')
check("Null for single subgroup", nma_single is None)

# ============================================================
print("\n=== Test 14: Meta-regression with MD (continuous) ===")
# ============================================================
inject_and_run(STUDIES_MD)
time.sleep(1)

md_container = driver.execute_script('return document.getElementById("metaRegressionContainer")?.innerHTML || "";')
check("MD meta-regression renders", len(md_container) > 100, f"len={len(md_container)}")

md_svg = driver.execute_script('''
    var svg = document.querySelector("#metaRegPlot svg");
    return svg ? svg.outerHTML : "";
''')
check("MD bubble plot has SVG", '<svg' in md_svg)
check("Y-axis NOT labeled 'log' for MD", '(log)' not in md_svg, f"label issue")

# ============================================================
print("\n=== Test 15: NMA league table with MD subgroups ===")
# ============================================================
nma_md = driver.execute_script('return document.getElementById("nmaLeagueContainer")?.innerHTML || "";')
check("MD NMA league table renders", len(nma_md) > 100, f"len={len(nma_md)}")
check("Contains 'mean difference'", 'mean difference' in nma_md)

# ============================================================
print("\n=== Test 16: Meta-regression container IDs ===")
# ============================================================
has_reg_container = driver.execute_script('return document.getElementById("metaRegressionContainer") !== null;')
check("metaRegressionContainer exists", has_reg_container)

has_nma_container = driver.execute_script('return document.getElementById("nmaLeagueContainer") !== null;')
check("nmaLeagueContainer exists", has_nma_container)

# ============================================================
print("\n=== Test 17: Bubble plot accessibility ===")
# ============================================================
inject_and_run(STUDIES_WITH_YEARS)
time.sleep(1)

svg_aria = driver.execute_script('''
    var svg = document.querySelector("#metaRegPlot svg");
    if (!svg) return {};
    return {
        role: svg.getAttribute("role"),
        label: svg.getAttribute("aria-label")
    };
''')
check("SVG has role='img'", svg_aria.get('role') == 'img', f"role={svg_aria.get('role')}")
check("SVG has aria-label", svg_aria.get('label') is not None and len(svg_aria.get('label', '')) > 10,
      f"label={svg_aria.get('label')}")

# ============================================================
print("\n=== Test 18: Confidence band rendering ===")
# ============================================================
has_band = driver.execute_script('''
    var svg = document.querySelector("#metaRegPlot svg");
    if (!svg) return false;
    var polys = svg.querySelectorAll("polygon");
    for (var i = 0; i < polys.length; i++) {
        if (polys[i].getAttribute("opacity") === "0.08") return true;
    }
    return false;
''')
check("Confidence band polygon rendered", has_band)

# ============================================================
print("\n=== Test 19: Regression line direction ===")
# ============================================================
# With years 2015-2021 and effects trending toward null (0.72 -> 0.70),
# slope should be positive (effects moving toward 0 in log scale = less negative)
reg_slope = driver.execute_script('''
    var state = window._metaRegState;
    if (!state) return null;
    var reg = metaRegression(state.studyData, state.moderators.year, state.tau2);
    return reg ? reg.slope : null;
''')
check("Regression slope is numeric", reg_slope is not None and isinstance(reg_slope, (int, float)),
      f"slope={reg_slope}")

# ============================================================
print("\n=== Test 20: NMA Bucher indirect comparison math ===")
# ============================================================
bucher_test = driver.execute_script('''
    // Drug A: OR=0.70, Drug B: OR=0.55 vs placebo
    // A vs B indirect = log(0.70) - log(0.55) = -0.357 - (-0.598) = 0.241
    // Effect = exp(0.241) = 1.272 (A is 27% worse than B)
    var subResult = {
        groups: {
            DrugA: {pooled: 0.70, pooledLo: 0.55, pooledHi: 0.89, k: 3},
            DrugB: {pooled: 0.55, pooledLo: 0.42, pooledHi: 0.72, k: 3}
        }
    };
    var nma = computeSubgroupNMA(subResult, true, 0.95);
    if (!nma || !nma.comparisons || nma.comparisons.length === 0) return null;
    var c = nma.comparisons[0];
    return {effect: c.effect, lo: c.ci_lo, hi: c.ci_hi, p: c.p};
''')
check("Bucher result exists", bucher_test is not None)
if bucher_test:
    expected_effect = math.exp(math.log(0.70) - math.log(0.55))  # ~1.273
    check("Indirect effect ~1.27 (A/B)", approx(bucher_test['effect'], expected_effect, 0.05),
          f"expected ~{expected_effect:.3f}, got {bucher_test['effect']:.3f}")
    check("CI lower < effect", bucher_test['lo'] < bucher_test['effect'])
    check("CI upper > effect", bucher_test['hi'] > bucher_test['effect'])
    check("p-value in [0,1]", 0 <= bucher_test['p'] <= 1, f"p={bucher_test['p']}")

# ============================================================
print("\n=== Test 21: No JS console errors ===")
# ============================================================
logs = driver.get_log('browser')
# Filter out CORS/network errors (expected from file:// protocol in headless)
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
print(f"META-REGRESSION + NMA: {pass_count} pass, {fail_count} fail / {pass_count + fail_count} total")
print(f"{'='*60}")
sys.exit(1 if fail_count > 0 else 0)
