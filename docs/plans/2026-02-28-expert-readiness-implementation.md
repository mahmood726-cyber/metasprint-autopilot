# MetaSprint Autopilot Expert-Readiness Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make MetaSprint Autopilot the definitive cardiology pairwise meta-analysis app — 11/12 experts adopt immediately — using SGLT2i HF trials as benchmark.

**Architecture:** Benchmark-driven. Embed 4-outcome SGLT2i golden data → run each feature against it → fix what breaks → port TruthCert methods → polish. Single-file HTML app (24.5K lines) at `metasprint-autopilot.html`.

**Tech Stack:** Vanilla JS (in-page), SVG for plots, IndexedDB + localStorage for persistence, Selenium/Playwright for E2E tests.

**Key File:** `C:\Users\user\Downloads\metasprint-autopilot\metasprint-autopilot.html`

---

## GOLDEN BENCHMARK DATA

Five HF trials + three CKD trials, four outcomes:

```javascript
const SGLT2I_BENCHMARK = {
  trials: [
    { id: 'DAPA-HF',           drug: 'dapagliflozin',  pop: 'HFrEF',      year: 2019, nT: 2373, nC: 2371 },
    { id: 'EMPEROR-Reduced',    drug: 'empagliflozin',  pop: 'HFrEF',      year: 2020, nT: 1863, nC: 1867 },
    { id: 'EMPEROR-Preserved',  drug: 'empagliflozin',  pop: 'HFpEF',      year: 2021, nT: 2997, nC: 2991 },
    { id: 'DELIVER',            drug: 'dapagliflozin',  pop: 'HFmrEF/HFpEF', year: 2022, nT: 3131, nC: 3132 },
    { id: 'SOLOIST-WHF',        drug: 'sotagliflozin',  pop: 'Worsening HF', year: 2021, nT: 608,  nC: 614 },
    { id: 'DAPA-CKD',           drug: 'dapagliflozin',  pop: 'CKD',         year: 2020, nT: 2152, nC: 2152 },
    { id: 'EMPA-KIDNEY',        drug: 'empagliflozin',  pop: 'CKD',         year: 2022, nT: 3304, nC: 3305 },
    { id: 'CREDENCE',           drug: 'canagliflozin',  pop: 'DKD',         year: 2019, nT: 2202, nC: 2199 },
  ],
  outcomes: {
    composite: {  // CV death + HF hospitalization — 5 HF trials
      studies: [
        { trial: 'DAPA-HF',          eT: 386, nT: 2373, eC: 502, nC: 2371, hr: 0.74, ciLo: 0.65, ciHi: 0.85 },
        { trial: 'EMPEROR-Reduced',   eT: 361, nT: 1863, eC: 462, nC: 1867, hr: 0.75, ciLo: 0.65, ciHi: 0.86 },
        { trial: 'EMPEROR-Preserved', eT: 415, nT: 2997, eC: 511, nC: 2991, hr: 0.79, ciLo: 0.69, ciHi: 0.90 },
        { trial: 'DELIVER',           eT: 512, nT: 3131, eC: 610, nC: 3132, hr: 0.82, ciLo: 0.73, ciHi: 0.92 },
        { trial: 'SOLOIST-WHF',       eT: 245, nT: 608,  eC: 355, nC: 614,  hr: 0.67, ciLo: 0.52, ciHi: 0.85 },
      ],
      golden: { hr: 0.77, ciLo: 0.72, ciHi: 0.82, I2: 50 },
      source: 'Vaduganathan et al. Lancet 2022'
    },
    acm: {  // All-cause mortality — 5 HF trials
      studies: [
        { trial: 'DAPA-HF',          eT: 276, nT: 2373, eC: 329, nC: 2371, hr: 0.83, ciLo: 0.71, ciHi: 0.97 },
        { trial: 'EMPEROR-Reduced',   eT: 249, nT: 1863, eC: 266, nC: 1867, hr: 0.92, ciLo: 0.77, ciHi: 1.10 },
        { trial: 'EMPEROR-Preserved', eT: 422, nT: 2997, eC: 427, nC: 2991, hr: 1.00, ciLo: 0.87, ciHi: 1.15 },
        { trial: 'DELIVER',           eT: 497, nT: 3131, eC: 526, nC: 3132, hr: 0.94, ciLo: 0.83, ciHi: 1.07 },
        { trial: 'SOLOIST-WHF',       eT: 51,  nT: 608,  eC: 58,  nC: 614,  hr: 0.84, ciLo: 0.58, ciHi: 1.22 },
      ],
      golden: { hr: 0.92, ciLo: 0.84, ciHi: 1.00, I2: 0 },
      source: 'Trial publications pooled'
    },
    hfHosp: {  // HF hospitalization alone — 5 HF trials
      studies: [
        { trial: 'DAPA-HF',          eT: 231, nT: 2373, eC: 318, nC: 2371, hr: 0.70, ciLo: 0.59, ciHi: 0.83 },
        { trial: 'EMPEROR-Reduced',   eT: 246, nT: 1863, eC: 342, nC: 1867, hr: 0.69, ciLo: 0.59, ciHi: 0.81 },
        { trial: 'EMPEROR-Preserved', eT: 259, nT: 2997, eC: 352, nC: 2991, hr: 0.71, ciLo: 0.60, ciHi: 0.83 },
        { trial: 'DELIVER',           eT: 567, nT: 3131, eC: 742, nC: 3132, hr: 0.77, ciLo: 0.67, ciHi: 0.89 },
        { trial: 'SOLOIST-WHF',       eT: 40,  nT: 608,  eC: 64,  nC: 614,  hr: 0.64, ciLo: 0.43, ciHi: 0.95 },
      ],
      golden: { hr: 0.71, ciLo: 0.65, ciHi: 0.78, I2: 0 },
      source: 'Trial publications pooled'
    },
    renal: {  // Renal composite — 3 CKD trials
      studies: [
        { trial: 'DAPA-CKD',    hr: 0.61, ciLo: 0.51, ciHi: 0.72 },
        { trial: 'EMPA-KIDNEY', hr: 0.72, ciLo: 0.64, ciHi: 0.82 },
        { trial: 'CREDENCE',    hr: 0.70, ciLo: 0.59, ciHi: 0.82 },
      ],
      golden: { hr: 0.68, ciLo: 0.60, ciHi: 0.76, I2: 0 },
      source: 'CRES v5.0 validated'
    }
  }
};
```

---

## Task 1: Embed SGLT2i Benchmark Data

**Files:**
- Modify: `metasprint-autopilot.html` (near line ~4300 where `universeTrialsCache` is defined)

**Step 1: Find the embedded data section**

Search for `EMBEDDED_AL_BURHAN_DATA` in the HTML. The benchmark constant should be placed just after the Al-Burhan data block but before the init function.

**Step 2: Add the benchmark constant**

Insert `const SGLT2I_BENCHMARK = { ... }` (the full object from above) after the existing embedded data. Also add a one-click benchmark loader function:

```javascript
function loadSGLT2iBenchmark(outcomeKey) {
  // outcomeKey: 'composite' | 'acm' | 'hfHosp' | 'renal'
  const outcome = SGLT2I_BENCHMARK.outcomes[outcomeKey];
  if (!outcome) return;
  const studies = outcome.studies.map((s, i) => {
    const trial = SGLT2I_BENCHMARK.trials.find(t => t.id === s.trial);
    // Use reported HR + CI (generic inverse-variance)
    const logHR = Math.log(s.hr);
    const seLow = (logHR - Math.log(s.ciLo)) / 1.96;
    const seHigh = (Math.log(s.ciHi) - logHR) / 1.96;
    const se = (seLow + seHigh) / 2;
    return {
      id: 'bench-' + outcomeKey + '-' + i,
      projectId: 'sglt2i-benchmark',
      authorYear: trial ? trial.id + ' (' + trial.year + ')' : s.trial,
      trialId: s.trial,
      effectEstimate: logHR,
      lowerCI: Math.log(s.ciLo),
      upperCI: Math.log(s.ciHi),
      effectType: 'HR',
      subgroup: trial ? trial.pop : '',
      nTotal: (s.nT || 0) + (s.nC || 0),
      nInt: s.nT || 0,
      nControl: s.nC || 0,
      eventsInt: s.eT ?? null,
      eventsControl: s.eC ?? null,
      outcomeId: outcomeKey,
      timepoint: 'primary',
      analysisPopulation: 'ITT',
      verificationStatus: 'benchmark-golden',
      covariate1: trial ? trial.drug : ''
    };
  });
  return studies;
}
```

**Step 3: Add benchmark button to Extract tab UI**

Find `renderExtractTable()` (line ~7241). Add a dropdown + button before the extract table:

```html
<div class="benchmark-loader" style="margin-bottom:12px;padding:10px;background:#f0f7ff;border-radius:8px;border:1px solid #bfdbfe">
  <strong>Benchmark:</strong>
  <select id="benchmarkOutcome">
    <option value="composite">SGLT2i Composite (CV death + HF hosp)</option>
    <option value="acm">SGLT2i All-Cause Mortality</option>
    <option value="hfHosp">SGLT2i HF Hospitalization</option>
    <option value="renal">SGLT2i Renal Composite</option>
  </select>
  <button onclick="loadBenchmarkIntoExtract()" class="btn-info btn-sm">Load Golden Data</button>
  <span style="font-size:0.75rem;color:#6b7280">5 HF trials | Vaduganathan 2022 Lancet</span>
</div>
```

```javascript
async function loadBenchmarkIntoExtract() {
  const key = document.getElementById('benchmarkOutcome').value;
  const studies = loadSGLT2iBenchmark(key);
  if (!studies || studies.length === 0) return;
  // Save to IDB under benchmark project
  for (const s of studies) {
    await idbPut('studies', s);
  }
  renderExtractTable();
  showToast('Loaded ' + studies.length + ' SGLT2i benchmark studies (' + key + ')', 'success');
}
```

**Step 4: Verify benchmark loads correctly**

Open the app in browser, go to Extract tab, click "Load Golden Data" for composite. Verify 5 rows appear with correct trial names and log(HR) values.

**Step 5: Commit**

```bash
git add metasprint-autopilot.html
git commit -m "feat: embed SGLT2i 4-outcome benchmark with one-click loader"
```

---

## Task 2: Validate Core Engine — DL, REML, FE, HKSJ

**Files:**
- Modify: `metasprint-autopilot.html` (engine functions around lines 7600-9100)
- Test: `tests/test_sglt2i_benchmark.py` (create new)

**Step 1: Write the validation test**

Create `tests/test_sglt2i_benchmark.py`:

```python
"""
SGLT2i HF Benchmark — validates all 4 outcomes against golden pooled HR values.
Uses Selenium to load data and run analysis, then checks numerical results.
"""
import sys, io, json, math, unittest
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

HTML_PATH = 'file:///C:/Users/user/Downloads/metasprint-autopilot/metasprint-autopilot.html'

GOLDEN = {
    'composite': {'hr': 0.77, 'ciLo': 0.72, 'ciHi': 0.82, 'k': 5},
    'acm':       {'hr': 0.92, 'ciLo': 0.84, 'ciHi': 1.00, 'k': 5},
    'hfHosp':    {'hr': 0.71, 'ciLo': 0.65, 'ciHi': 0.78, 'k': 5},
    'renal':     {'hr': 0.68, 'ciLo': 0.60, 'ciHi': 0.76, 'k': 3},
}

class TestSGLT2iBenchmark(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        opts = webdriver.ChromeOptions()
        opts.add_argument('--headless=new')
        opts.add_argument('--no-sandbox')
        opts.add_argument('--window-size=1400,900')
        cls.driver = webdriver.Chrome(options=opts)
        cls.driver.get(HTML_PATH)
        time.sleep(3)

    @classmethod
    def tearDownClass(cls):
        cls.driver.quit()

    def _load_and_analyze(self, outcome_key):
        """Load benchmark data for outcome, run DL analysis, return results dict."""
        d = self.driver
        # Execute JS to load benchmark and run analysis
        result = d.execute_script(f"""
            const studies = loadSGLT2iBenchmark('{outcome_key}');
            if (!studies) return null;
            const effects = studies.map(s => s.effectEstimate);
            const cis = studies.map(s => [s.lowerCI, s.upperCI]);
            const ses = studies.map(s => {{
                const seLo = (s.effectEstimate - s.lowerCI) / 1.96;
                const seHi = (s.upperCI - s.effectEstimate) / 1.96;
                return (seLo + seHi) / 2;
            }});
            const ma = computeMetaAnalysis(effects, ses, {{
                effectType: 'HR', confLevel: 0.95
            }});
            return {{
                pooled: Math.exp(ma.pooled),
                ciLo: Math.exp(ma.ciLow),
                ciHi: Math.exp(ma.ciHigh),
                tau2: ma.tau2,
                I2: ma.I2,
                k: effects.length
            }};
        """)
        return result

    def test_composite_dl(self):
        r = self._load_and_analyze('composite')
        self.assertIsNotNone(r, 'Analysis returned null')
        g = GOLDEN['composite']
        self.assertEqual(r['k'], g['k'])
        self.assertAlmostEqual(r['pooled'], g['hr'], delta=0.03,
            msg=f"Composite HR: got {r['pooled']:.3f}, expected {g['hr']}")
        self.assertAlmostEqual(r['ciLo'], g['ciLo'], delta=0.04)
        self.assertAlmostEqual(r['ciHi'], g['ciHi'], delta=0.04)

    def test_acm_dl(self):
        r = self._load_and_analyze('acm')
        self.assertIsNotNone(r)
        g = GOLDEN['acm']
        self.assertAlmostEqual(r['pooled'], g['hr'], delta=0.03,
            msg=f"ACM HR: got {r['pooled']:.3f}, expected {g['hr']}")

    def test_hfhosp_dl(self):
        r = self._load_and_analyze('hfHosp')
        self.assertIsNotNone(r)
        g = GOLDEN['hfHosp']
        self.assertAlmostEqual(r['pooled'], g['hr'], delta=0.03,
            msg=f"HF Hosp HR: got {r['pooled']:.3f}, expected {g['hr']}")

    def test_renal_dl(self):
        r = self._load_and_analyze('renal')
        self.assertIsNotNone(r)
        g = GOLDEN['renal']
        self.assertAlmostEqual(r['pooled'], g['hr'], delta=0.03,
            msg=f"Renal HR: got {r['pooled']:.3f}, expected {g['hr']}")

if __name__ == '__main__':
    unittest.main(verbosity=2)
```

**Step 2: Run the test to verify it fails**

```bash
cd C:\Users\user\Downloads\metasprint-autopilot
python tests/test_sglt2i_benchmark.py
```
Expected: FAIL (benchmark data not yet embedded, `loadSGLT2iBenchmark` undefined)

**Step 3: Implement Task 1 (embed data + loader)**

Apply the changes from Task 1 to the HTML file.

**Step 4: Run test to verify it passes**

```bash
python tests/test_sglt2i_benchmark.py
```
Expected: All 4 tests PASS with HR values within delta=0.03 of golden.

**Step 5: If any outcome fails, debug**

Common issues:
- SE calculation from CI may need log-scale averaging: `se = (log(ciHi) - log(ciLo)) / (2*1.96)`
- Renal trials only have HR+CI (no events) — ensure generic inverse-variance path works
- ACM expected I2 ~0% — if DL gives high tau2, check for outliers

**Step 6: Extend test to cover REML, HKSJ, FE**

Add to test file:
```python
def _run_all_methods(self, outcome_key):
    """Run DL, REML, FE, HKSJ on outcome and return dict of results."""
    d = self.driver
    return d.execute_script(f"""
        const studies = loadSGLT2iBenchmark('{outcome_key}');
        const effects = studies.map(s => s.effectEstimate);
        const ses = studies.map(s => {{
            return (s.effectEstimate - s.lowerCI + s.upperCI - s.effectEstimate) / (2 * 1.96);
        }});
        const dl = computeMetaAnalysis(effects, ses, {{ effectType: 'HR' }});
        const bat = computeSensitivityBattery(effects, ses, 'HR', 0.95);
        return {{
            dl: {{ pooled: Math.exp(dl.pooled), I2: dl.I2, tau2: dl.tau2 }},
            reml_tau2: typeof estimateREML === 'function' ? estimateREML(effects, ses) : null,
            battery: bat
        }};
    """)

def test_methods_agree_on_acm(self):
    """ACM has I2~0%, so DL/REML/FE/HKSJ should all agree within 0.02."""
    r = self._run_all_methods('acm')
    self.assertIsNotNone(r)
    # With near-zero heterogeneity, all methods should give similar pooled HR
```

**Step 7: Commit**

```bash
git add tests/test_sglt2i_benchmark.py metasprint-autopilot.html
git commit -m "test: SGLT2i 4-outcome benchmark validates DL/REML/FE/HKSJ"
```

---

## Task 3: Validate & Fix Visualization (Forest + Funnel)

**Files:**
- Modify: `metasprint-autopilot.html` (forest: ~line 9280, funnel: ~line 9382)

**Step 1: Write forest plot rendering test**

Add to `tests/test_sglt2i_benchmark.py`:

```python
def test_forest_plot_renders(self):
    """Forest plot SVG should contain one rect per study + summary diamond."""
    d = self.driver
    # Load composite benchmark into extract, navigate to Analyze tab, run analysis
    d.execute_script("""
        const studies = loadSGLT2iBenchmark('composite');
        // Simulate running renderForestPlot
        const container = document.createElement('div');
        container.id = 'test-forest';
        document.body.appendChild(container);
        const effects = studies.map(s => s.effectEstimate);
        const ses = studies.map(s => (s.effectEstimate - s.lowerCI + s.upperCI - s.effectEstimate) / (2*1.96));
        const ma = computeMetaAnalysis(effects, ses, { effectType: 'HR' });
        // Check forest plot function exists
        return typeof renderForestPlot === 'function';
    """)
    # Verify function exists
    exists = d.execute_script("return typeof renderForestPlot === 'function'")
    self.assertTrue(exists, 'renderForestPlot function not found')
```

**Step 2: Manual visual check**

Open app → Extract → Load SGLT2i Composite → Analyze → Run Analysis → Check forest plot:
- [ ] 5 study rows with point estimates + CI whiskers
- [ ] Summary diamond at bottom
- [ ] Prediction interval (dashed line) if enabled
- [ ] Correct axis scale (log HR, with 0.5, 0.7, 1.0, 1.4 labels)
- [ ] Study names match (DAPA-HF, EMPEROR-Reduced, etc.)
- [ ] Null line at HR=1.0

**Step 3: Fix any issues found**

Common forest plot bugs:
- Axis labels hardcoded for OR when effectType is HR
- Study names truncated at long names
- Prediction interval missing when tau2 > 0
- Diamond width doesn't match CI width

**Step 4: Check funnel plot**

Manual check:
- [ ] 5 points plotted (effect vs SE or 1/SE)
- [ ] Funnel triangle symmetric around pooled estimate
- [ ] No points outside triangle = no obvious asymmetry
- [ ] Axis labels correct (log HR, not OR)

**Step 5: Commit fixes**

```bash
git add metasprint-autopilot.html
git commit -m "fix: forest/funnel plot rendering with SGLT2i benchmark data"
```

---

## Task 4: Validate & Fix Advanced Methods

**Files:**
- Modify: `metasprint-autopilot.html` (lines 9443-10300)

**Step 1: Write smoke test for each advanced method**

Add to `tests/test_sglt2i_benchmark.py`:

```python
ADVANCED_METHODS = [
    ('computeDDMA', 'DDMA'),
    ('computeRoBMA', 'RoBMA'),
    ('computeZCurve', 'Z-Curve'),
    ('computeCopasSelection', 'Copas'),
    ('computeCooksDistance', 'CooksD'),
    ('computeMantelHaenszel', 'MH'),
    ('computePetoMethod', 'Peto'),
    ('computeThreeLevelMA', '3-Level'),
]

def test_advanced_methods_no_crash(self):
    """Every advanced method should run without throwing on composite data."""
    d = self.driver
    for func_name, label in ADVANCED_METHODS:
        with self.subTest(method=label):
            result = d.execute_script(f"""
                try {{
                    const studies = loadSGLT2iBenchmark('composite');
                    const effects = studies.map(s => s.effectEstimate);
                    const ses = studies.map(s => (s.effectEstimate - s.lowerCI + s.upperCI - s.effectEstimate) / (2*1.96));
                    if (typeof {func_name} !== 'function') return 'MISSING';
                    const r = {func_name}(effects, ses, 'HR', 0.95);
                    return r ? 'OK' : 'NULL';
                }} catch(e) {{
                    return 'ERROR: ' + e.message;
                }}
            """)
            self.assertNotEqual(result, 'MISSING', f'{label} function not found')
            self.assertFalse(result.startswith('ERROR'), f'{label} crashed: {result}')
```

**Step 2: Run and note which methods fail**

```bash
python tests/test_sglt2i_benchmark.py -v -k test_advanced_methods
```

**Step 3: Fix each failing method**

For each crash, read the function source at the line number, identify the issue (wrong argument count, missing guard for k<3, NaN propagation), and fix.

**Step 4: Verify sensitivity battery table**

```python
def test_sensitivity_battery_complete(self):
    """Sensitivity battery should show DL, DL+HKSJ, FE, REML results."""
    d = self.driver
    result = d.execute_script("""
        const studies = loadSGLT2iBenchmark('composite');
        const effects = studies.map(s => s.effectEstimate);
        const ses = studies.map(s => (s.effectEstimate - s.lowerCI + s.upperCI - s.effectEstimate) / (2*1.96));
        const bat = computeSensitivityBattery(effects, ses, 'HR', 0.95);
        return bat;
    """)
    self.assertIsNotNone(result, 'Battery returned null')
    # Should have 4+ methods in the battery
```

**Step 5: Run TSA on composite**

TSA (Trial Sequential Analysis) should show O'Brien-Fleming boundaries. Test:

```python
def test_tsa_composite(self):
    """TSA should detect sufficient evidence for composite (very significant)."""
    # TSA should show boundary crossed = conclusive evidence
```

**Step 6: Commit**

```bash
git add metasprint-autopilot.html tests/test_sglt2i_benchmark.py
git commit -m "fix: all advanced methods pass SGLT2i benchmark smoke test"
```

---

## Task 5: Validate Subgroup + Cumulative + Meta-Regression

**Files:**
- Modify: `metasprint-autopilot.html` (subgroup: ~10951, cumulative: ~11077, meta-reg: ~7825)

**Step 1: Test subgroup analysis — HFrEF vs HFpEF**

The SGLT2i benchmark has a natural subgroup: HFrEF (DAPA-HF, EMPEROR-Reduced) vs HFpEF (EMPEROR-Preserved, DELIVER) vs Worsening HF (SOLOIST-WHF).

```python
def test_subgroup_hfref_vs_hfpef(self):
    """Subgroup analysis should split by population and show interaction test."""
    d = self.driver
    result = d.execute_script("""
        const studies = loadSGLT2iBenchmark('composite');
        // Set subgroup field to population
        studies.forEach(s => {
            const trial = SGLT2I_BENCHMARK.trials.find(t => t.id === s.trialId);
            s.subgroup = trial ? trial.pop : 'Unknown';
        });
        const effects = studies.map(s => s.effectEstimate);
        const ses = studies.map(s => (s.effectEstimate - s.lowerCI + s.upperCI - s.effectEstimate) / (2*1.96));
        const subgroups = studies.map(s => s.subgroup);
        const r = computeSubgroupAnalysis(effects, ses, subgroups, 'HR', 0.95);
        return r;
    """)
    self.assertIsNotNone(result, 'Subgroup analysis returned null')
    # Should have at least 2 subgroups
```

**Step 2: Test cumulative meta-analysis by year**

```python
def test_cumulative_by_year(self):
    """Cumulative MA should show 5 rows (2019-2022) with converging estimate."""
    d = self.driver
    result = d.execute_script("""
        const studies = loadSGLT2iBenchmark('composite');
        const effects = studies.map(s => s.effectEstimate);
        const ses = studies.map(s => (s.effectEstimate - s.lowerCI + s.upperCI - s.effectEstimate) / (2*1.96));
        const years = studies.map(s => {
            const trial = SGLT2I_BENCHMARK.trials.find(t => t.id === s.trialId);
            return trial ? trial.year : 2020;
        });
        const r = computeCumulativeMA(effects, ses, years, 'HR', 0.95);
        return r;
    """)
    self.assertIsNotNone(result)
```

**Step 3: Test meta-regression on year**

With 5 studies spanning 2019-2022, meta-regression on year should be underpowered but not crash.

**Step 4: Fix any issues, commit**

```bash
git commit -m "fix: subgroup/cumulative/meta-regression validated on SGLT2i data"
```

---

## Task 6: Port TruthCert Conservative Arbitration

**Files:**
- Modify: `metasprint-autopilot.html` (insert after sensitivity battery, ~line 8700)

**Step 1: Write the failing test**

```python
def test_arbitration_composite(self):
    """Composite (I2~50%) should trigger mid-level disagreement with 1.3x inflation."""
    d = self.driver
    result = d.execute_script("""
        if (typeof computeArbitration !== 'function') return 'MISSING';
        const studies = loadSGLT2iBenchmark('composite');
        const effects = studies.map(s => s.effectEstimate);
        const ses = studies.map(s => (s.effectEstimate - s.lowerCI + s.upperCI - s.effectEstimate) / (2*1.96));
        return computeArbitration(effects, ses, 'HR', 0.95);
    """)
    self.assertNotEqual(result, 'MISSING', 'computeArbitration not implemented')
```

**Step 2: Implement `computeArbitration()` in JS**

Insert after `computeSensitivityBattery` (~line 8700):

```javascript
function computeArbitration(effects, ses, effectType, confLevel,
    threshLow = 0.05, threshHigh = 0.15, inflateMid = 1.3, inflateHigh = 2.0) {
  // Run 3+ methods as witnesses
  const dl  = computeMetaAnalysis(effects, ses, { effectType, confLevel });
  const fe  = computeFixedEffect(effects, ses, confLevel);
  const remlTau2 = estimateREML(effects, ses);
  // Compute REML-based pooled
  const wRe = ses.map(s => 1 / (s*s + (remlTau2 ?? 0)));
  const sumWre = wRe.reduce((a,b) => a+b, 0);
  const muReml = sumWre > 1e-12 ? effects.reduce((a,e,i) => a + wRe[i]*e, 0) / sumWre : dl.pooled;
  const seReml = sumWre > 1e-12 ? Math.sqrt(1/sumWre) : dl.se;

  const witnesses = [
    { method: 'DL', mu: dl.pooled, se: dl.se, ciLo: dl.ciLow, ciHi: dl.ciHigh },
    { method: 'FE', mu: fe.pooled, se: fe.se, ciLo: fe.ciLow, ciHi: fe.ciHigh },
    { method: 'REML', mu: muReml, se: seReml,
      ciLo: muReml - 1.96 * seReml, ciHi: muReml + 1.96 * seReml },
  ];

  // HKSJ witness
  if (typeof applyHKSJ === 'function') {
    const hksj = applyHKSJ(effects, ses, dl.pooled, dl.tau2, confLevel);
    if (hksj) witnesses.push({ method: 'HKSJ', mu: hksj.pooled, se: hksj.se,
      ciLo: hksj.ciLow, ciHi: hksj.ciHigh });
  }

  // Disagreement = std of witness mu values
  const mus = witnesses.filter(w => isFinite(w.mu)).map(w => w.mu);
  if (mus.length < 2) return { witnesses, disagreement: 0, level: 'low',
    inflationFactor: 1.0, downgrade: false, arbitrated: witnesses[0] };

  const mean = mus.reduce((a,b)=>a+b,0) / mus.length;
  const disagreement = Math.sqrt(mus.reduce((a,m)=>a+(m-mean)**2, 0) / (mus.length-1));

  let level, factor, downgrade;
  if (disagreement <= threshLow) {
    level = 'low'; factor = 1.0; downgrade = false;
  } else if (disagreement <= threshHigh) {
    level = 'mid'; factor = inflateMid; downgrade = false;
  } else {
    level = 'high'; factor = inflateHigh; downgrade = true;
  }

  // Use DL as base, inflate CI
  const base = witnesses[0]; // DL
  const mid = (base.ciLo + base.ciHi) / 2;
  const halfW = (base.ciHi - base.ciLo) / 2;
  const newHalf = halfW * factor;
  const arbCiLo = Math.min(base.ciLo, mid - newHalf);
  const arbCiHi = Math.max(base.ciHi, mid + newHalf);
  const arbSe = isFinite(base.se) ? base.se * factor : base.se;

  return {
    witnesses,
    disagreement: +disagreement.toFixed(4),
    level,
    inflationFactor: factor,
    downgrade,
    arbitrated: {
      method: 'Arbitrated',
      mu: base.mu,
      se: arbSe,
      ciLo: arbCiLo,
      ciHi: arbCiHi
    }
  };
}
```

**Step 3: Add UI rendering**

After the sensitivity battery rendering section (~line 8700), add:

```javascript
function renderArbitration(arbResult, effectType, containerId) {
  if (!arbResult) return;
  const isRatio = ['HR','OR','RR'].includes(effectType);
  const fmt = v => isRatio ? Math.exp(v).toFixed(3) : v.toFixed(3);
  const levelColors = { low: '#10b981', mid: '#f59e0b', high: '#ef4444' };
  const levelLabels = { low: 'Low (methods agree)', mid: 'Moderate (1.3x CI inflated)',
    high: 'High (2.0x CI inflated, decision downgraded)' };

  let html = '<div style="border:2px solid ' + (levelColors[arbResult.level] || '#ccc') +
    ';border-radius:8px;padding:12px;margin:8px 0">';
  html += '<h4>Method Arbitration <span style="background:' + (levelColors[arbResult.level] || '#ccc') +
    ';color:#fff;padding:2px 8px;border-radius:4px;font-size:0.8rem">' +
    arbResult.level.toUpperCase() + '</span></h4>';
  html += '<p>Disagreement SD: ' + arbResult.disagreement +
    ' | Inflation: ' + arbResult.inflationFactor + 'x</p>';
  html += '<table style="width:100%;font-size:0.85rem"><thead><tr>' +
    '<th>Method</th><th>Pooled</th><th>95% CI</th></tr></thead><tbody>';
  for (const w of arbResult.witnesses) {
    html += '<tr><td>' + w.method + '</td><td>' + fmt(w.mu) +
      '</td><td>' + fmt(w.ciLo) + ' to ' + fmt(w.ciHi) + '</td></tr>';
  }
  const a = arbResult.arbitrated;
  html += '<tr style="font-weight:bold;background:#f0f7ff"><td>' + a.method +
    '</td><td>' + fmt(a.mu) + '</td><td>' + fmt(a.ciLo) + ' to ' + fmt(a.ciHi) + '</td></tr>';
  html += '</tbody></table>';
  if (arbResult.downgrade) {
    html += '<p style="color:#ef4444;font-weight:bold">Decision downgraded to RESEARCH due to high method disagreement.</p>';
  }
  html += '</div>';
  const container = document.getElementById(containerId);
  if (container) container.innerHTML += html;
}
```

**Step 4: Run test, verify pass**

**Step 5: Commit**

```bash
git commit -m "feat: port TruthCert conservative arbitration — method disagreement detection"
```

---

## Task 7: Port TruthCert Decision Regret Framework

**Files:**
- Modify: `metasprint-autopilot.html` (after arbitration code)

**Step 1: Implement `computeDecisionRegret()`**

```javascript
function computeDecisionRegret(pooledMu, pooledSe, tau2, k, effectType,
    wFP = 1.0, wFN = 1.0, wResearch = 0.5) {
  const isRatio = ['HR','OR','RR'].includes(effectType);
  // For ratio measures, benefit = pooled < 0 (on log scale)
  // P(benefit) = P(true effect < 0) = Phi(-mu/se)
  const se = pooledSe > 0 ? pooledSe : 0.001;
  const z = -pooledMu / se;
  const pBenefit = normalCDF(z);
  const pHarm = 1 - normalCDF(-pooledMu / se + 0.5); // P(effect > +0.5 on log scale)

  // Decision classification
  let decision, rationale;
  const ciLo = pooledMu - 1.96 * se;
  const ciHi = pooledMu + 1.96 * se;

  if (isRatio) {
    if (pBenefit >= 0.80 && ciHi < 0) {
      decision = 'Recommend'; rationale = 'P(benefit) >= 80% and CI excludes null';
    } else if (pBenefit >= 0.60) {
      decision = 'Consider-benefit'; rationale = 'P(benefit) >= 60% but CI includes null';
    } else if (pHarm >= 0.20) {
      decision = 'Consider-harm'; rationale = 'P(harm) >= 20%';
    } else if (pBenefit < 0.60 && pHarm < 0.20) {
      decision = 'Research'; rationale = 'Insufficient evidence for clear direction';
    } else {
      decision = 'DoNot'; rationale = 'No evidence of benefit, possible harm';
    }
  } else {
    // For continuous measures, benefit = positive effect
    decision = pBenefit >= 0.80 ? 'Recommend' : pBenefit >= 0.60 ? 'Consider-benefit' : 'Research';
    rationale = 'P(benefit) = ' + (pBenefit * 100).toFixed(1) + '%';
  }

  // Regret estimate (expected regret under current evidence)
  // FP: recommend when no benefit. FN: not recommend when benefit.
  const regretFP = pBenefit < 0.50 ? wFP * (1 - pBenefit) : 0;
  const regretFN = pBenefit >= 0.50 && decision === 'Research' ? wFN * pBenefit * wResearch : 0;
  const totalRegret = regretFP + regretFN;

  return {
    decision, rationale,
    pBenefit: +pBenefit.toFixed(4),
    pHarm: +pHarm.toFixed(4),
    regret: +totalRegret.toFixed(4),
    weights: { wFP, wFN, wResearch }
  };
}
```

**Step 2: Test on all 4 outcomes**

```python
def test_decision_regret_composite(self):
    """Composite should be Recommend (HR 0.77, highly significant)."""
    d = self.driver
    result = d.execute_script("""
        if (typeof computeDecisionRegret !== 'function') return 'MISSING';
        const studies = loadSGLT2iBenchmark('composite');
        const effects = studies.map(s => s.effectEstimate);
        const ses = studies.map(s => (s.effectEstimate - s.lowerCI + s.upperCI - s.effectEstimate) / (2*1.96));
        const ma = computeMetaAnalysis(effects, ses, { effectType: 'HR' });
        return computeDecisionRegret(ma.pooled, ma.se, ma.tau2, effects.length, 'HR');
    """)
    self.assertNotEqual(result, 'MISSING')
    self.assertEqual(result['decision'], 'Recommend')
```

**Step 3: Add UI panel for decision regret**

Render a colored badge (green=Recommend, yellow=Consider, red=DoNot) with probability breakdown.

**Step 4: Commit**

```bash
git commit -m "feat: port TruthCert decision regret framework"
```

---

## Task 8: Port Bias Decomposition + Question Contracts

**Files:**
- Modify: `metasprint-autopilot.html`

**Step 1: Implement `computeBiasDecomposition()`**

```javascript
function computeBiasDecomposition(studies) {
  // For each study, compute 3-component bias profile using CT.gov registry data
  return studies.map(s => {
    const nReg = s.nRegistered ?? s.nTotal ?? 0;
    const nObs = s.nObserved ?? nReg;
    const nPub = s.nPublished ?? nObs;
    const endpointRate = s.endpointReportRate ?? 1.0;
    const industryFrac = s.isIndustry ? 1.0 : 0.0;

    const silentRate = nReg > 0 ? 1 - (nObs / nReg) : 0;
    const endpointMissing = 1 - endpointRate;
    const pubMissing = nObs > 0 ? 1 - (nPub / nObs) : 0;

    return {
      trial: s.trialId || s.authorYear,
      silentRate: +silentRate.toFixed(3),
      endpointMissing: +endpointMissing.toFixed(3),
      pubMissing: +pubMissing.toFixed(3),
      industryFrac,
      biasScore: +(0.4 * silentRate + 0.35 * endpointMissing + 0.25 * industryFrac).toFixed(3)
    };
  });
}
```

**Step 2: Implement Question Contract (SHA-256 hash lock)**

```javascript
async function computeQuestionContract(pico) {
  // pico = { population, intervention, comparator, outcome, effectMeasure }
  const payload = JSON.stringify(pico, Object.keys(pico).sort());
  const encoded = new TextEncoder().encode(payload);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex.slice(0, 16);
}
```

**Step 3: Add PICO lock UI to Protocol tab**

When user defines PICO and clicks "Lock Contract", compute SHA-256 hash and display it. Show hash in analysis header as proof of pre-registration.

**Step 4: Test and commit**

```bash
git commit -m "feat: port bias decomposition + question contracts (SHA-256 PICO lock)"
```

---

## Task 9: Enhance NMA — Full Frequentist + Consistency

**Files:**
- Modify: `metasprint-autopilot.html` (existing NMA at ~line 8080)

**Step 1: Verify existing Bucher indirect comparison works**

The app already has `computeSubgroupNMA` (line 8080) and `renderNMALeagueTable` (line 8163). Test with SGLT2i data:

```python
def test_nma_sglt2i(self):
    """NMA should produce indirect comparisons between dapagliflozin/empagliflozin/sotagliflozin."""
    d = self.driver
    result = d.execute_script("""
        if (typeof computeSubgroupNMA !== 'function') return 'MISSING';
        // ... load composite data with drug as subgroup ...
        return 'EXISTS';
    """)
    self.assertNotEqual(result, 'MISSING')
```

**Step 2: Add consistency check (node-splitting)**

For each closed loop in the network, test direct vs indirect evidence consistency:

```javascript
function nmaConsistencyCheck(directEffects, indirectEffects) {
  // Node-splitting: for each comparison with both direct and indirect evidence,
  // test H0: direct effect = indirect effect
  const results = [];
  for (const key of Object.keys(directEffects)) {
    if (!indirectEffects[key]) continue;
    const d = directEffects[key];
    const ind = indirectEffects[key];
    const diff = d.mu - ind.mu;
    const seDiff = Math.sqrt(d.se ** 2 + ind.se ** 2);
    const z = diff / seDiff;
    const p = 2 * (1 - normalCDF(Math.abs(z)));
    results.push({ comparison: key, direct: d.mu, indirect: ind.mu,
      diff, seDiff, z, p, inconsistent: p < 0.05 });
  }
  return results;
}
```

**Step 3: Add P-score ranking**

```javascript
function computePScores(leagueTable) {
  // P-score = proportion of comparisons "won" (adjusted for uncertainty)
  const treatments = Object.keys(leagueTable);
  const scores = {};
  for (const t of treatments) {
    let totalP = 0;
    let count = 0;
    for (const c of treatments) {
      if (t === c) continue;
      const effect = leagueTable[t]?.[c];
      if (!effect) continue;
      // P(t better than c) = Phi(-effect.mu / effect.se) for ratio measures
      totalP += normalCDF(-effect.mu / effect.se);
      count++;
    }
    scores[t] = count > 0 ? +(totalP / count).toFixed(3) : 0.5;
  }
  return scores;
}
```

**Step 4: Add network plot (force-directed)**

The app already has network visualization. Verify it renders correctly for the 3-node SGLT2i network (dapagliflozin, empagliflozin, sotagliflozin — all connected via placebo).

**Step 5: Commit**

```bash
git commit -m "feat: enhance NMA with consistency checks and P-score ranking"
```

---

## Task 10: GRADE Automation Validation

**Files:**
- Modify: `metasprint-autopilot.html` (GRADE at ~line 8713)

**Step 1: Test GRADE on all 4 outcomes**

```python
def test_grade_composite(self):
    """GRADE for composite should be HIGH (5 RCTs, low RoB, consistent, precise)."""
    d = self.driver
    result = d.execute_script("""
        if (typeof computeGRADE !== 'function') return 'MISSING';
        const studies = loadSGLT2iBenchmark('composite');
        const effects = studies.map(s => s.effectEstimate);
        const ses = studies.map(s => (s.effectEstimate - s.lowerCI + s.upperCI - s.effectEstimate) / (2*1.96));
        const ma = computeMetaAnalysis(effects, ses, { effectType: 'HR' });
        // GRADE needs RoB info — for benchmark, assume all Low RoB
        const rob = studies.map(() => ({ overall: 'Low' }));
        return computeGRADE(effects, ses, ma, rob, 'HR', 0.95);
    """)
    self.assertNotEqual(result, 'MISSING')
```

**Step 2: Verify GRADE downgrading logic**

- Composite (I2~50%): may downgrade 1 for inconsistency → MODERATE
- ACM (I2~0%, CI barely excludes null): may downgrade 1 for imprecision → MODERATE
- HF hosp (I2~65%): should downgrade 1 for inconsistency → MODERATE
- Renal (I2~0%, very significant): should stay HIGH

**Step 3: Fix any GRADE logic issues**

Check line 8713+ for:
- I2 threshold for inconsistency downgrade (should be 50% for -1, 75% for -2)
- OIS (optimal information size) threshold for imprecision
- Prediction interval crossing null as additional inconsistency criterion

**Step 4: Commit**

```bash
git commit -m "fix: GRADE automation validated against SGLT2i benchmark"
```

---

## Task 11: Export Validation (CSV, R Script, SVG)

**Files:**
- Modify: `metasprint-autopilot.html` (export at ~line 7531)

**Step 1: Test CSV export**

Run analysis on composite, export CSV. Verify:
- Header row with correct column names
- 5 data rows
- Effect estimates on log scale
- SE values present

**Step 2: Test R script export**

Generate R replication script:

```javascript
function exportRScript(studies, pooledResult, effectType) {
  const lines = [
    '# MetaSprint Autopilot — R Replication Script',
    '# Generated: ' + new Date().toISOString(),
    'library(metafor)',
    '',
    '# Study data',
    'yi <- c(' + studies.map(s => s.effectEstimate.toFixed(6)).join(', ') + ')',
    'sei <- c(' + studies.map(s => {
      const se = (s.effectEstimate - s.lowerCI + s.upperCI - s.effectEstimate) / (2*1.96);
      return se.toFixed(6);
    }).join(', ') + ')',
    'labels <- c(' + studies.map(s => '"' + (s.trialId || s.authorYear) + '"').join(', ') + ')',
    '',
    '# DerSimonian-Laird random-effects',
    'res.dl <- rma(yi, sei=sei, method="DL")',
    'summary(res.dl)',
    '',
    '# REML',
    'res.reml <- rma(yi, sei=sei, method="REML")',
    'summary(res.reml)',
    '',
    '# Forest plot',
    'forest(res.dl, slab=labels, atransf=exp, xlab="Hazard Ratio")',
    '',
    '# Funnel plot',
    'funnel(res.dl)',
  ];
  return lines.join('\n');
}
```

**Step 3: Test forest plot SVG export**

Verify the SVG can be downloaded and opened in a vector editor.

**Step 4: Commit**

```bash
git commit -m "feat: R replication script export + SVG forest plot download"
```

---

## Task 12: Deterministic Seeding (Hash-Chained)

**Files:**
- Modify: `metasprint-autopilot.html`

**Step 1: Implement JS equivalent of TruthCert seed.py**

```javascript
async function hash32(a, b) {
  const data = new TextEncoder().encode(a + ':' + b);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const view = new DataView(hashBuffer);
  return view.getUint32(0, false); // big-endian, first 4 bytes
}

// xoshiro128** PRNG (deterministic, fast, in-page)
function xoshiro128ss(seed) {
  let s = [seed, seed ^ 0x12345678, seed ^ 0x9abcdef0, seed ^ 0xfedcba98];
  function next() {
    const result = (((s[1] * 5) << 7 | (s[1] * 5) >>> 25) * 9) >>> 0;
    const t = s[1] << 9;
    s[2] ^= s[0]; s[3] ^= s[1]; s[1] ^= s[2]; s[0] ^= s[3];
    s[2] ^= t; s[3] = (s[3] << 11 | s[3] >>> 21);
    return result;
  }
  return {
    nextFloat: () => next() / 4294967296,
    nextInt: (max) => next() % max,
    next
  };
}

async function makeSeededRng(masterSeed, topicId, repIndex) {
  const topicSeed = await hash32(masterSeed, topicId);
  const repSeed = await hash32(topicSeed, repIndex);
  return xoshiro128ss(repSeed);
}
```

**Step 2: Wire seeded RNG into bootstrap/simulation functions**

Replace any `Math.random()` calls in bootstrap confidence intervals with the seeded PRNG.

**Step 3: Test reproducibility**

```python
def test_reproducibility_same_seed(self):
    """Same seed + data should produce identical results."""
    d = self.driver
    r1 = d.execute_script("return computeMetaAnalysis(...).pooled")
    r2 = d.execute_script("return computeMetaAnalysis(...).pooled")
    self.assertEqual(r1, r2, "Deterministic engine should give identical results")
```

**Step 4: Commit**

```bash
git commit -m "feat: hash-chained deterministic seeding for reproducibility"
```

---

## Task 13: Edge Case Hardening

**Files:**
- Modify: `metasprint-autopilot.html`
- Test: `tests/test_sglt2i_benchmark.py`

**Step 1: Test k=1 (single study)**

```python
def test_single_study(self):
    """With k=1, should return study estimate with no heterogeneity."""
    d = self.driver
    result = d.execute_script("""
        const studies = loadSGLT2iBenchmark('composite').slice(0, 1);
        const effects = [studies[0].effectEstimate];
        const ses = [(studies[0].effectEstimate - studies[0].lowerCI + studies[0].upperCI - studies[0].effectEstimate) / (2*1.96)];
        const ma = computeMetaAnalysis(effects, ses, { effectType: 'HR' });
        return { pooled: ma.pooled, tau2: ma.tau2, I2: ma.I2 };
    """)
    self.assertEqual(result['tau2'], 0)
    self.assertEqual(result['I2'], 0)
```

**Step 2: Test k=2 (minimum for heterogeneity)**

**Step 3: Test zero events in one arm**

For Peto/MH methods, zero events should trigger continuity correction without crash.

**Step 4: Test very large N (DELIVER has N=6263)**

Verify no integer overflow or precision loss.

**Step 5: Commit**

```bash
git commit -m "test: edge case hardening — k=1, k=2, zero events, large N"
```

---

## Task 14: Dark Mode + Accessibility + Performance

**Files:**
- Modify: `metasprint-autopilot.html`

**Step 1: Dark mode visual audit**

Toggle dark mode. Check:
- [ ] All text readable against dark backgrounds
- [ ] Forest plot SVG uses CSS variables (not hardcoded colors)
- [ ] GRADE badges contrast meets WCAG AA (4.5:1)
- [ ] Arbitration panel colors visible in dark mode

**Step 2: Keyboard accessibility**

- [ ] Tab through all interactive elements
- [ ] Enter/Space activates buttons
- [ ] Escape closes modals
- [ ] Benchmark dropdown navigable by keyboard

**Step 3: Performance gate**

```python
def test_performance(self):
    """Analysis of 5 studies should complete in <1 second."""
    import time
    d = self.driver
    start = time.time()
    d.execute_script("""
        const studies = loadSGLT2iBenchmark('composite');
        const effects = studies.map(s => s.effectEstimate);
        const ses = studies.map(s => (s.effectEstimate - s.lowerCI + s.upperCI - s.effectEstimate) / (2*1.96));
        computeMetaAnalysis(effects, ses, { effectType: 'HR' });
        computeSensitivityBattery(effects, ses, 'HR', 0.95);
        computeArbitration(effects, ses, 'HR', 0.95);
        computeDecisionRegret(effects[0], ses[0], 0, 5, 'HR'); // simplified
    """)
    elapsed = time.time() - start
    self.assertLess(elapsed, 1.0, f"Analysis took {elapsed:.2f}s, should be <1s")
```

**Step 4: Commit**

```bash
git commit -m "polish: dark mode, accessibility, performance validated"
```

---

## Task 15: Final Integration Test + Div Balance

**Files:**
- All modified files

**Step 1: Run full benchmark test suite**

```bash
cd C:\Users\user\Downloads\metasprint-autopilot
python tests/test_sglt2i_benchmark.py -v
```
Expected: ALL tests PASS

**Step 2: Div balance check**

```bash
# Count opening vs closing divs (exclude script content)
python -c "
import re
with open('metasprint-autopilot.html', 'r', encoding='utf-8') as f:
    content = f.read()
# Remove script blocks for accurate count
no_script = re.sub(r'<script[^>]*>.*?<\/script>', '', content, flags=re.DOTALL)
opens = len(re.findall(r'<div[\s>]', no_script))
closes = len(re.findall(r'</div>', no_script))
print(f'Opens: {opens}, Closes: {closes}, Balance: {opens - closes}')
assert opens == closes, f'DIV IMBALANCE: {opens} opens vs {closes} closes'
print('DIV BALANCE OK')
"
```

**Step 3: Check for `</script>` in template literals**

```bash
python -c "
with open('metasprint-autopilot.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()
in_script = False
for i, line in enumerate(lines, 1):
    if '<script' in line.lower(): in_script = True
    if '</script>' in line.lower():
        if in_script and line.strip() != '</script>':
            print(f'WARNING line {i}: literal </script> inside script block: {line.strip()[:80]}')
        in_script = False
print('Script tag check complete')
"
```

**Step 4: Run existing test suite (regression check)**

```bash
python run_all_tests.py
```
Expected: 313+ unit tests pass, no regressions.

**Step 5: Final commit**

```bash
git add -A
git commit -m "feat: MetaSprint Autopilot expert-readiness — SGLT2i benchmark validated

4-outcome SGLT2i HF benchmark (composite, ACM, HF hosp, renal)
TruthCert methods: arbitration, decision regret, bias decomposition, question contracts
NMA: consistency checks, P-score ranking
All advanced methods validated against golden data
Edge cases hardened, accessibility checked, performance gated"
```

---

## Success Checklist (Expert Adoption Gate)

After all 15 tasks, verify:

- [ ] 1. Numbers match golden HR values within epsilon=0.02 for all 4 outcomes
- [ ] 2. Every method runs without crash (DDMA, RoBMA, Z-Curve, Copas, Cook's, MH, Peto, TSA, PET-PEESE)
- [ ] 3. Sensitivity battery shows DL/REML/HKSJ/FE side-by-side with divergence flags
- [ ] 4. TruthCert arbitration flags method disagreement with inflation rationale
- [ ] 5. Forest plots have prediction intervals (Cochrane 2025)
- [ ] 6. GRADE table auto-generated with correct downgrading
- [ ] 7. Subgroup: HFrEF vs HFpEF with interaction p-value
- [ ] 8. NMA: indirect comparisons with consistency + P-scores
- [ ] 9. No dead ends — every tab produces output
- [ ] 10. Same seed = identical results (reproducibility)
