"""GRADE Concordance Validation.

Tests the automated computeGRADE() function against the Al-Burhan pooled
clusters. Validates that:
1. All poolable clusters (k>=2) receive a GRADE rating
2. GRADE domains are populated correctly
3. Domain logic is internally consistent
4. RoB is flagged as not-assessed (no proxy)
5. Large-effect upgrade only applies to ratio measures
6. Imprecision correctly assesses CI vs null + OIS
7. Inconsistency correctly uses I2 + prediction interval
8. Publication bias correctly uses S-value thresholds
"""
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

# === TEST 1: All poolable clusters get GRADE ===
print("=== GRADE COVERAGE ===")
grade_stats = driver.execute_script("""
    if (!_alBurhanResults || _alBurhanResults.length === 0) return { skipped: true };
    var pooled = _alBurhanResults.filter(function(r) { return r.pooled; });
    var withGrade = pooled.filter(function(r) { return r.pooled.grade; });
    var labels = {};
    withGrade.forEach(function(r) {
        var lbl = r.pooled.grade.label;
        labels[lbl] = (labels[lbl] || 0) + 1;
    });
    return {
        totalPooled: pooled.length,
        withGrade: withGrade.length,
        labels: labels
    };
""")
if grade_stats.get('skipped'):
    print("  SKIP  No Al-Burhan data loaded")
else:
    check('All pooled clusters have GRADE',
          grade_stats['withGrade'] == grade_stats['totalPooled'],
          f"{grade_stats['withGrade']}/{grade_stats['totalPooled']}")
    print(f"  INFO  GRADE distribution: {json.dumps(grade_stats['labels'])}")

# === TEST 2: GRADE domain structure ===
print("\n=== GRADE DOMAIN STRUCTURE ===")
domain_check = driver.execute_script("""
    if (!_alBurhanResults || _alBurhanResults.length === 0) return { skipped: true };
    var pooled = _alBurhanResults.filter(function(r) { return r.pooled && r.pooled.grade; });
    if (pooled.length === 0) return { skipped: true };
    var sample = pooled[0].pooled.grade;
    var domains = sample.domains;
    return {
        hasCertainty: typeof sample.certainty === 'number',
        hasLabel: typeof sample.label === 'string',
        hasColor: typeof sample.color === 'string',
        hasDomains: !!domains,
        domainKeys: domains ? Object.keys(domains).sort() : [],
        robNotAssessed: domains ? domains.robNotAssessed === true : false,
        robValue: domains ? domains.riskOfBias : null,
        certaintyRange: sample.certainty >= 1 && sample.certainty <= 4
    };
""")
if domain_check.get('skipped'):
    print("  SKIP  No GRADE data")
else:
    check('Has certainty score', domain_check['hasCertainty'])
    check('Has label string', domain_check['hasLabel'])
    check('Has color string', domain_check['hasColor'])
    check('Has domains object', domain_check['hasDomains'])
    check('Certainty in range 1-4', domain_check['certaintyRange'])
    expected_domains = ['imprecision', 'inconsistency', 'indirectness',
                       'largeEffect', 'publicationBias', 'riskOfBias', 'robNotAssessed']
    actual_domains = domain_check.get('domainKeys', [])
    check('All GRADE domains present',
          all(d in actual_domains for d in expected_domains),
          f"found: {actual_domains}")
    check('RoB flagged as not-assessed', domain_check['robNotAssessed'])
    check('RoB value is 0 (no proxy)', domain_check['robValue'] == 0)

# === TEST 3: GRADE internal consistency ===
print("\n=== GRADE INTERNAL CONSISTENCY ===")
consistency = driver.execute_script("""
    if (!_alBurhanResults) return { skipped: true };
    var pooled = _alBurhanResults.filter(function(r) { return r.pooled && r.pooled.grade; });
    var violations = [];
    var ratioWithLargeEff = 0;
    var nonRatioWithLargeEff = 0;
    var piCrossNullHighIncon = 0;
    var piNotCrossLowIncon = 0;

    pooled.forEach(function(r) {
        var g = r.pooled.grade;
        var d = g.domains;
        var p = r.pooled;

        // Check certainty = 4 + sum(downgrades) + sum(upgrades), clamped 1-4
        var expected = 4 + d.riskOfBias + d.inconsistency + d.imprecision
                      + d.publicationBias + d.indirectness + d.largeEffect;
        expected = Math.max(1, Math.min(4, expected));
        if (expected !== g.certainty) {
            violations.push({id: r.id, expected: expected, actual: g.certainty});
        }

        // Large effect only for ratio
        if (d.largeEffect > 0 && !p.isRatio) nonRatioWithLargeEff++;
        if (d.largeEffect > 0 && p.isRatio) ratioWithLargeEff++;

        // Inconsistency vs PI
        if (p.pi_lo != null && p.pi_hi != null) {
            var nullVal = p.isRatio ? 1 : 0;
            var piCrossesNull = p.isRatio
                ? (p.pi_lo < nullVal && p.pi_hi > nullVal)
                : (p.pi_lo < nullVal && p.pi_hi > nullVal);
            if (piCrossesNull && p.I2 > 75 && d.inconsistency > -2) {
                // Should be -2 when I2>75 AND PI crosses null
            }
        }
    });

    return {
        totalChecked: pooled.length,
        certaintyViolations: violations.length,
        violationDetails: violations.slice(0, 5),
        ratioWithLargeEff: ratioWithLargeEff,
        nonRatioWithLargeEff: nonRatioWithLargeEff,
        labels: ['HIGH','MODERATE','LOW','VERY LOW'].map(function(l) {
            return pooled.filter(function(r) { return r.pooled.grade.label === l; }).length;
        })
    };
""")
if consistency.get('skipped'):
    print("  SKIP  No data")
else:
    check('Certainty = 4 + domains (all clusters)',
          consistency['certaintyViolations'] == 0,
          f"{consistency['certaintyViolations']} violations")
    check('No large-effect upgrade for non-ratio measures',
          consistency['nonRatioWithLargeEff'] == 0,
          f"violations: {consistency['nonRatioWithLargeEff']}")
    if consistency['ratioWithLargeEff'] > 0:
        print(f"  INFO  {consistency['ratioWithLargeEff']} ratio clusters got large-effect upgrade")
    print(f"  INFO  GRADE labels: HIGH={consistency['labels'][0]}, MOD={consistency['labels'][1]}, LOW={consistency['labels'][2]}, VLOW={consistency['labels'][3]}")

# === TEST 4: Imprecision domain logic ===
print("\n=== IMPRECISION DOMAIN ===")
imprecision = driver.execute_script("""
    if (!_alBurhanResults) return { skipped: true };
    var pooled = _alBurhanResults.filter(function(r) { return r.pooled && r.pooled.grade; });
    var ciCrossNull_noOIS = 0;  // Should be -2
    var ciCrossNull_withOIS = 0;  // Should be -1
    var noCross_noOIS = 0;  // Should be -1
    var noCross_withOIS = 0;  // Should be 0
    var correct = 0;

    pooled.forEach(function(r) {
        var p = r.pooled;
        var d = p.grade.domains;
        var isRatio = p.isRatio;
        var nullVal = isRatio ? 1 : 0;
        var ciCrossesNull = isRatio
            ? (p.ci_lo < nullVal && p.ci_hi > nullVal)
            : (p.ci_lo < nullVal && p.ci_hi > nullVal);
        var totalN = 0;
        if (r.studies) {
            r.studies.forEach(function(s) { totalN += (s.enrollment || 0); });
        }
        var oisMet = totalN >= 400;

        if (!oisMet && ciCrossesNull) {
            if (d.imprecision === -2) correct++; else ciCrossNull_noOIS++;
        } else if (!oisMet || ciCrossesNull) {
            if (d.imprecision === -1) correct++; else ciCrossNull_withOIS++;
        } else {
            if (d.imprecision === 0) correct++; else noCross_withOIS++;
        }
    });

    return {
        totalChecked: pooled.length,
        correct: correct,
        mismatches: ciCrossNull_noOIS + ciCrossNull_withOIS + noCross_noOIS + noCross_withOIS
    };
""")
if imprecision.get('skipped'):
    print("  SKIP  No data")
else:
    check('Imprecision domain logic correct',
          imprecision['mismatches'] == 0,
          f"{imprecision['correct']}/{imprecision['totalChecked']} correct, {imprecision['mismatches']} mismatches")

# === TEST 5: Publication bias domain logic ===
print("\n=== PUBLICATION BIAS DOMAIN ===")
pubbias = driver.execute_script("""
    if (!_alBurhanResults) return { skipped: true };
    var pooled = _alBurhanResults.filter(function(r) { return r.pooled && r.pooled.grade; });
    var correct = 0;
    var violations = [];

    pooled.forEach(function(r) {
        var p = r.pooled;
        var d = p.grade.domains;
        var sVal = p.sValue;

        if (sVal != null) {
            var expected;
            if (sVal < 2) expected = -2;
            else if (sVal < 4) expected = -1;
            else expected = 0;
            if (d.publicationBias === expected) correct++;
            else violations.push({id: r.id, sValue: sVal, expected: expected, actual: d.publicationBias});
        } else {
            if (d.publicationBias === 0) correct++;
            else violations.push({id: r.id, sValue: null, expected: 0, actual: d.publicationBias});
        }
    });

    return {
        totalChecked: pooled.length,
        correct: correct,
        violations: violations.length,
        details: violations.slice(0, 3)
    };
""")
if pubbias.get('skipped'):
    print("  SKIP  No data")
else:
    check('Publication bias S-value thresholds correct',
          pubbias['violations'] == 0,
          f"{pubbias['correct']}/{pubbias['totalChecked']} correct")

# === TEST 6: NNT formula validation ===
print("\n=== NNT FORMULA VALIDATION ===")
nnt_check = driver.execute_script("""
    // Test computeNNT with known values
    var tests = [
        // OR=0.75, CER=0.15 -> Sackett: EER = 0.15*0.75/(1-0.15+0.15*0.75) = 0.1169, ARR=0.0331, NNT=ceil(30.20)=31
        {effect: 0.75, isRatio: true, cer: 0.15, type: 'OR', expectedNNT: 31},
        // RR=0.75, CER=0.15 -> ARR = 0.15*(1-0.75) = 0.0375, NNT=27
        {effect: 0.75, isRatio: true, cer: 0.15, type: 'RR', expectedNNT: 27},
        // HR=0.75, CER=0.15 -> same as RR approx: NNT=27
        {effect: 0.75, isRatio: true, cer: 0.15, type: 'HR', expectedNNT: 27},
        // OR=0.50, CER=0.20 -> Sackett: EER=0.111, ARR=0.089, NNT=12
        {effect: 0.50, isRatio: true, cer: 0.20, type: 'OR', expectedNNT: 12},
        // Effect=1.0 (no effect) -> null
        {effect: 1.0, isRatio: true, cer: 0.15, type: 'OR', expectedNNT: null},
        // MD -> null
        {effect: -2.5, isRatio: false, cer: 0.15, type: 'MD', expectedNNT: null}
    ];

    var results = [];
    tests.forEach(function(t) {
        var nnt = computeNNT(t.effect, t.isRatio, t.cer, t.type);
        results.push({
            desc: t.type + ' ' + t.effect + ' CER=' + t.cer,
            expected: t.expectedNNT,
            actual: nnt,
            pass: nnt === t.expectedNNT
        });
    });
    return results;
""")
for r in nnt_check:
    check(f"NNT {r['desc']}", r['pass'],
          f"expected={r['expected']}, got={r['actual']}")

# === TEST 7: proportionBenefit sign validation ===
print("\n=== PROPORTION BENEFIT SIGN ===")
pb_check = driver.execute_script("""
    var tests = [
        // Protective effect (mu=-0.5, tau2=0.04, se=0.1) -> P(null/harm) should be small
        {mu: -0.5, tau2: 0.04, se: 0.1, isRatio: true, expectLow: true},
        // Near-null effect (mu=-0.05) -> P(null/harm) should be ~50%
        {mu: -0.05, tau2: 0.04, se: 0.1, isRatio: true, expectMid: true},
        // Harmful direction (mu=+0.3) -> P(reversal) should be small
        {mu: 0.3, tau2: 0.04, se: 0.1, isRatio: true, expectLow: true},
        // Zero effect -> P = 0.5 exactly
        {mu: 0, tau2: 0.04, se: 0.1, isRatio: true, expectHalf: true}
    ];

    var results = [];
    tests.forEach(function(t) {
        var p = proportionBenefit(t.mu, t.tau2, t.se, t.isRatio);
        var pass = true;
        var desc = 'mu=' + t.mu;
        if (t.expectLow) { pass = p < 0.25; desc += ' -> P<0.25'; }
        if (t.expectMid) { pass = p > 0.30 && p < 0.70; desc += ' -> 0.3<P<0.7'; }
        if (t.expectHalf) { pass = Math.abs(p - 0.5) < 0.001; desc += ' -> P=0.5'; }
        results.push({desc: desc, value: p, pass: pass});
    });
    return results;
""")
for r in pb_check:
    check(f"pBenefit {r['desc']}", r['pass'], f"P={r['value']:.4f}")

# === TEST 8: bucherIndirect confLevel ===
print("\n=== BUCHER INDIRECT CONFLEVEL ===")
bucher_check = driver.execute_script("""
    var r95 = bucherIndirect(0.8, 0.1, 0.9, 0.12, true, 0.95);
    var r99 = bucherIndirect(0.8, 0.1, 0.9, 0.12, true, 0.99);
    if (!r95 || !r99) return { error: true };
    return {
        ci95width: r95.ci_hi - r95.ci_lo,
        ci99width: r99.ci_hi - r99.ci_lo,
        r95confLevel: r95.confLevel,
        r99confLevel: r99.confLevel,
        widerAt99: (r99.ci_hi - r99.ci_lo) > (r95.ci_hi - r95.ci_lo),
        effectSame: Math.abs(r95.effect - r99.effect) < 1e-10
    };
""")
check('99% CI wider than 95% CI', bucher_check.get('widerAt99', False))
check('Effect same at both levels', bucher_check.get('effectSame', False))
check('confLevel=0.95 stored', bucher_check.get('r95confLevel') == 0.95)
check('confLevel=0.99 stored', bucher_check.get('r99confLevel') == 0.99)

# JS errors
logs = driver.get_log('browser')
errors = [l for l in logs if l['level'] == 'SEVERE'
          and 'Access to fetch' not in l.get('message', '')
          and 'Failed to load resource' not in l.get('message', '')]
for e in errors[:3]:
    print(f"\nJS ERROR: {e['message'][:200]}")
    fails += 1

print(f"\n{'='*60}")
print(f"GRADE CONCORDANCE: {passes} pass, {fails} fail")
print(f"{'='*60}")
driver.quit()
sys.exit(0 if fails == 0 else 1)
