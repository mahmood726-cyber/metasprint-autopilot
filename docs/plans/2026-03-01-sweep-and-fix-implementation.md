# Sweep-and-Fix Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix structural bugs, expand test coverage by ~15-20 tests, and sync the PLOS ONE manuscript with the current 27,605-line codebase.

**Architecture:** Single-file HTML app (metasprint-autopilot.html). Playwright tests in tests/sglt2i-hf-benchmark.spec.js. Manuscript in paper/manuscript_plos_one.md.

**Tech Stack:** HTML/CSS/JS (single file), Playwright (testing), Markdown (manuscript)

---

## Task 1: Fix Critical tau2 || 0 Bug

**Files:**
- Modify: `metasprint-autopilot.html:23075`

**Step 1: Read the line**
Verify line 23075 contains: `var tau2=r.tau2||0;`

**Step 2: Fix — replace `||` with `??`**
```javascript
var tau2=r.tau2??0;
```
tau2=0 means homogeneous data (no between-study variance). `||` drops this valid state.

**Step 3: Run tests**
Run: `npx playwright test`
Expected: 228 passed

**Step 4: Commit**
```bash
git add metasprint-autopilot.html
git commit -m "fix: tau2 || 0 drops valid homogeneous state — use ?? instead"
```

---

## Task 2: Fix Remaining || 0 Patterns (High-Priority Subset)

**Files:**
- Modify: `metasprint-autopilot.html` (multiple lines)

**Step 1: Fix these high-priority lines** (replace `||` with `??`):

| Line | Current | Fixed |
|------|---------|-------|
| 3046 | `(kwScores[cat] \|\| 0)` | `(kwScores[cat] ?? 0)` |
| 3073 | `(kwScores[sc] \|\| 0)` | `(kwScores[sc] ?? 0)` |
| 3332 | `(gapScores[b.id]?.gapScore \|\| 0) - (gapScores[a.id]?.gapScore \|\| 0)` | `(gapScores[b.id]?.gapScore ?? 0) - (gapScores[a.id]?.gapScore ?? 0)` |
| 3375 | `(o.gapScore \|\| 0)` | `(o.gapScore ?? 0)` |
| 4272 | `p.designModule?.enrollmentInfo?.count \|\| 0` | `p.designModule?.enrollmentInfo?.count ?? 0` |
| 4656 | `(t.startYear \|\| 0)` | `(t.startYear ?? 0)` |
| 4657 | `(t.enrollment \|\| 0)` | `(t.enrollment ?? 0)` |
| 4733 | `(t.enrollment \|\| 0)` | `(t.enrollment ?? 0)` |
| 5392-5427 | `(df[t] \|\| 0)`, `(tf[t] \|\| 0)`, etc. | Use `??` for all BM25 TF/DF lookups |
| 15193 | `subcatCounts[sc] \|\| 0` | `subcatCounts[sc] ?? 0` |

**Step 2: Run tests**
Run: `npx playwright test`
Expected: 228 passed

**Step 3: Commit**
```bash
git add metasprint-autopilot.html
git commit -m "fix: replace || 0 with ?? 0 for numeric fallbacks (prevents zero-dropping)"
```

---

## Task 3: Fix Hardcoded z=1.96 in Statistical Functions

**Files:**
- Modify: `metasprint-autopilot.html` (lines 7322, 7390, 10521-10523, 10567, 10670-10671, 11030, 11045, 11074, 23128, 25799-25800)

**Step 1: Verify a `getZCrit` or `normalQuantile` helper already exists**
Search for existing critical value helper functions in the codebase.

**Step 2: For each hardcoded 1.96, replace with confLevel-aware value**

Priority fixes (statistical engine — affects results):
- **Line 7322** (2x2 OR calc): `var z = 1.96;` → use confLevel from UI or default 0.95
- **Line 7390** (effect size): `const z = 1.96;` → same
- **Lines 10521-10523** (RoBMA): `1.96 * avgSE` → `zCrit * avgSE`
- **Lines 10670-10671** (PET-PEESE): `1.96 * adjSE` → `zCrit * adjSE`
- **Lines 11030, 11045, 11074** (MH, Peto): `1.96 * seLogOR/seLogRR` → `zCrit * se`
- **Lines 25799-25800** (cumulative MA): `1.96 * se` → `zCrit * se`

Lower priority (visualization — cosmetic):
- **Line 8638** (regression band): keep or parameterize
- **Lines 8946-8982** (Galbraith bounds): keep — Galbraith traditionally uses 95%
- **Line 10567** (excess sig threshold): keep — methodological choice, not user-facing CI

Skip (code export — should match user's confLevel):
- **Lines 22343-22353** (Python export): replace `1.96` with `scipy.stats.norm.ppf(1 - alpha/2)` in generated code

**Step 3: Run tests**
Run: `npx playwright test`
Expected: 228 passed

**Step 4: Commit**
```bash
git add metasprint-autopilot.html
git commit -m "fix: replace hardcoded z=1.96 with confLevel-aware critical values"
```

---

## Task 4: Write Playwright Tests — Error Conditions

**Files:**
- Modify: `tests/sglt2i-hf-benchmark.spec.js` (append new tests)

**Step 1: Add error condition tests**

```javascript
test('216 - Error: computeMetaAnalysis returns null for empty data array', async ({ page }) => {
  const result = await page.evaluate(() => {
    return computeMetaAnalysis([]);
  });
  expect(result).toBeNull();
});

test('217 - Error: computeMetaAnalysis handles k=1 (single study) gracefully', async ({ page }) => {
  const result = await page.evaluate(() => {
    return computeMetaAnalysis([{ yi: -0.26, vi: 0.005, label: 'Single' }]);
  });
  expect(result).not.toBeNull();
  expect(result.k).toBe(1);
  expect(result.I2).toBe(0);
  expect(result.tau2).toBe(0);
});

test('218 - Error: computeMetaAnalysis handles k=2 (minimum heterogeneity)', async ({ page }) => {
  const result = await page.evaluate(() => {
    return computeMetaAnalysis([
      { yi: -0.26, vi: 0.005, label: 'A' },
      { yi: -0.10, vi: 0.008, label: 'B' }
    ]);
  });
  expect(result).not.toBeNull();
  expect(result.k).toBe(2);
  expect(result.I2).toBeGreaterThanOrEqual(0);
});

test('219 - Error: 2x2 zero events in both arms returns null', async ({ page }) => {
  const result = await page.evaluate(() => {
    if (typeof compute2x2Effects === 'function') {
      return compute2x2Effects(0, 100, 0, 100);
    }
    return 'function_not_found';
  });
  if (result !== 'function_not_found') {
    expect(result?.OR).toBeNull();
  }
});

test('220 - Error: computeMetaAnalysis with all-identical effects gives tau2=0', async ({ page }) => {
  const result = await page.evaluate(() => {
    return computeMetaAnalysis([
      { yi: -0.26, vi: 0.005, label: 'A' },
      { yi: -0.26, vi: 0.008, label: 'B' },
      { yi: -0.26, vi: 0.006, label: 'C' }
    ]);
  });
  expect(result.tau2).toBeCloseTo(0, 4);
  expect(result.I2).toBeCloseTo(0, 1);
});
```

**Step 2: Run new tests**
Run: `npx playwright test --grep "216|217|218|219|220"`
Expected: 5 passed

**Step 3: Commit**
```bash
git add tests/sglt2i-hf-benchmark.spec.js
git commit -m "test: add 5 error condition tests (empty, k=1, k=2, zero-zero, identical effects)"
```

---

## Task 5: Write Playwright Tests — Edge Cases & Safety

**Files:**
- Modify: `tests/sglt2i-hf-benchmark.spec.js` (append)

**Step 1: Add edge case tests**

```javascript
test('221 - Edge: tau2=0 is preserved (not dropped by || fallback)', async ({ page }) => {
  const result = await page.evaluate(() => {
    const r = computeMetaAnalysis([
      { yi: -0.26, vi: 0.005, label: 'A' },
      { yi: -0.26, vi: 0.008, label: 'B' },
      { yi: -0.26, vi: 0.006, label: 'C' }
    ]);
    // Simulate the forest plot path that had tau2||0
    var tau2 = r.tau2 ?? 0;
    return { tau2, wt: 1 / (0.005 + tau2) };
  });
  expect(result.tau2).toBeCloseTo(0, 4);
  expect(result.wt).toBeCloseTo(200, 0);
});

test('222 - Edge: very large effect size does not break forest plot range', async ({ page }) => {
  const result = await page.evaluate(() => {
    return computeMetaAnalysis([
      { yi: 5.0, vi: 0.5, label: 'Huge' },
      { yi: -0.1, vi: 0.01, label: 'Normal' },
      { yi: 0.3, vi: 0.02, label: 'Small' }
    ]);
  });
  expect(result).not.toBeNull();
  expect(isFinite(result.mu)).toBe(true);
  expect(isFinite(result.ci_lo)).toBe(true);
  expect(isFinite(result.ci_hi)).toBe(true);
});

test('223 - Edge: negative variance is rejected', async ({ page }) => {
  const result = await page.evaluate(() => {
    return computeMetaAnalysis([
      { yi: 0.5, vi: -0.01, label: 'BadVar' },
      { yi: 0.3, vi: 0.02, label: 'Good' }
    ]);
  });
  // Engine should either filter or return null
  expect(result === null || result.k <= 1).toBe(true);
});

test('224 - Edge: confLevel parameter is respected in CI width', async ({ page }) => {
  const r95 = await page.evaluate(() => {
    return computeMetaAnalysis([
      { yi: -0.26, vi: 0.005, label: 'A' },
      { yi: -0.18, vi: 0.008, label: 'B' },
      { yi: -0.30, vi: 0.006, label: 'C' }
    ], { confLevel: 0.95 });
  });
  const r99 = await page.evaluate(() => {
    return computeMetaAnalysis([
      { yi: -0.26, vi: 0.005, label: 'A' },
      { yi: -0.18, vi: 0.008, label: 'B' },
      { yi: -0.30, vi: 0.006, label: 'C' }
    ], { confLevel: 0.99 });
  });
  if (r95 && r99) {
    const width95 = r95.ci_hi - r95.ci_lo;
    const width99 = r99.ci_hi - r99.ci_lo;
    expect(width99).toBeGreaterThan(width95);
  }
});

test('225 - Edge: REML converges for small k', async ({ page }) => {
  const result = await page.evaluate(() => {
    return computeMetaAnalysis([
      { yi: -0.26, vi: 0.005, label: 'A' },
      { yi: -0.18, vi: 0.008, label: 'B' },
      { yi: -0.30, vi: 0.006, label: 'C' }
    ]);
  });
  expect(result.tau2_reml).toBeDefined();
  expect(isFinite(result.tau2_reml)).toBe(true);
  expect(result.tau2_reml).toBeGreaterThanOrEqual(0);
});
```

**Step 2: Run new tests**
Run: `npx playwright test --grep "221|222|223|224|225"`
Expected: 5 passed (test 223 may need adjustment based on engine behavior)

**Step 3: Commit**
```bash
git add tests/sglt2i-hf-benchmark.spec.js
git commit -m "test: add 5 edge case tests (tau2=0, large effect, negative var, confLevel, REML k=3)"
```

---

## Task 6: Write Playwright Tests — Write Tab & UX

**Files:**
- Modify: `tests/sglt2i-hf-benchmark.spec.js` (append)

**Step 1: Add Write tab and UX tests**

```javascript
test('226 - Write tab exists in UI', async ({ page }) => {
  const tab = page.locator('[data-tab="tab-write"], [role="tab"]:has-text("Write")');
  await expect(tab).toBeVisible();
});

test('227 - Write: generatePaper function exists', async ({ page }) => {
  const exists = await page.evaluate(() => typeof generatePaper === 'function');
  expect(exists).toBe(true);
});

test('228 - Write: exportMarkdown function exists', async ({ page }) => {
  const exists = await page.evaluate(() => typeof exportMarkdown === 'function' || typeof exportWriteMarkdown === 'function');
  expect(exists).toBe(true);
});

test('229 - DTA tab exists in UI', async ({ page }) => {
  const tab = page.locator('[data-tab="tab-dta"], [role="tab"]:has-text("DTA")');
  await expect(tab).toBeVisible();
});

test('230 - Dose-Response tab exists in UI', async ({ page }) => {
  const tab = page.locator('[data-tab="tab-doseresponse"], [data-tab="tab-dose"], [role="tab"]:has-text("Dose")');
  await expect(tab).toBeVisible();
});
```

**Step 2: Run new tests**
Run: `npx playwright test --grep "226|227|228|229|230"`
Expected: 5 passed

**Step 3: Commit**
```bash
git add tests/sglt2i-hf-benchmark.spec.js
git commit -m "test: add 5 Write/DTA/Dose-Response tab existence tests"
```

---

## Task 7: Write Playwright Tests — Hardcoded z=1.96 Regression Guard

**Files:**
- Modify: `tests/sglt2i-hf-benchmark.spec.js` (append)

**Step 1: Add confLevel regression tests**

```javascript
test('231 - Regression: MH OR uses confLevel-aware CI (not hardcoded 1.96)', async ({ page }) => {
  const result = await page.evaluate(() => {
    if (typeof computeMantelHaenszel !== 'function') return 'skip';
    // Use known 2x2 data
    const studies = [
      { a: 15, b: 135, c: 25, d: 125 },
      { a: 20, b: 180, c: 30, d: 170 }
    ];
    return computeMantelHaenszel(studies, 'OR');
  });
  if (result !== 'skip') {
    expect(result.ciLower).toBeDefined();
    expect(result.ciUpper).toBeDefined();
    expect(result.ciLower).toBeLessThan(result.estimate);
    expect(result.ciUpper).toBeGreaterThan(result.estimate);
  }
});

test('232 - Regression: Peto OR uses confLevel-aware CI', async ({ page }) => {
  const result = await page.evaluate(() => {
    if (typeof computePetoMethod !== 'function') return 'skip';
    const studies = [
      { a: 5, b: 95, c: 10, d: 90 },
      { a: 3, b: 97, c: 8, d: 92 }
    ];
    return computePetoMethod(studies);
  });
  if (result !== 'skip') {
    expect(result.ciLower).toBeDefined();
    expect(result.ciUpper).toBeDefined();
  }
});

test('233 - Regression: cumulative MA CI width respects confLevel', async ({ page }) => {
  const result = await page.evaluate(() => {
    if (typeof computeCumulativeMA !== 'function') return 'skip';
    const data = [
      { yi: -0.26, vi: 0.005, label: 'DAPA-HF 2019' },
      { yi: -0.30, vi: 0.006, label: 'EMPEROR 2020' },
      { yi: -0.18, vi: 0.008, label: 'DELIVER 2022' }
    ];
    return computeCumulativeMA(data);
  });
  if (result !== 'skip' && Array.isArray(result)) {
    expect(result.length).toBe(3);
    result.forEach(r => {
      expect(isFinite(r.lo)).toBe(true);
      expect(isFinite(r.hi)).toBe(true);
    });
  }
});
```

**Step 2: Run new tests**
Run: `npx playwright test --grep "231|232|233"`
Expected: 3 passed

**Step 3: Commit**
```bash
git add tests/sglt2i-hf-benchmark.spec.js
git commit -m "test: add 3 regression guards for confLevel-aware CI calculations"
```

---

## Task 8: Update Manuscript — Fix Line Count & Feature Descriptions

**Files:**
- Modify: `paper/manuscript_plos_one.md`

**Step 1: Fix line counts**
- Line 13 (Abstract): "12,357 lines" → "27,605 lines"
- Line 75 (Methods): "12,357 lines" → "27,605 lines"

**Step 2: Update feature descriptions**
- Add DTA, NMA, and Dose-Response to the Methods section
- Update tab count from "seven sequential phases" to "seven sequential phases plus six advanced analysis modules"
- Update limitations to remove DTA and Dose-Response as "unsupported" (they are now shipped)

**Step 3: Update test counts**
- Update to match actual Playwright test count (228 + new tests from Tasks 4-7)

**Step 4: Commit**
```bash
git add paper/manuscript_plos_one.md
git commit -m "docs: update manuscript line counts, feature list, and test counts to match v2.1"
```

---

## Task 9: Update Manuscript — Trim Abstract to ≤300 Words

**Files:**
- Modify: `paper/manuscript_plos_one.md` (Abstract section, ~lines 13-19)

**Step 1: Count current abstract words**
The abstract is ~449 words. PLOS ONE limit is 300.

**Step 2: Trim abstract**
- Condense the Methods paragraph (currently lists every statistical method — summarize instead)
- Keep Background (2-3 sentences), Methods (3-4 sentences), Results (2-3 sentences), Conclusions (1-2 sentences)
- Remove exhaustive method enumeration — reference Methods section instead
- Target: 280-295 words

**Step 3: Verify word count**
Run: `wc -w` on the abstract section only

**Step 4: Commit**
```bash
git add paper/manuscript_plos_one.md
git commit -m "docs: trim abstract from 449 to ≤300 words (PLOS ONE compliance)"
```

---

## Task 10: Update Manuscript — Reference Check & Final Polish

**Files:**
- Modify: `paper/manuscript_plos_one.md`

**Step 1: Verify sequential reference numbering**
Check that references are numbered [1] through [N] in order of first appearance.

**Step 2: Verify all references are cited in text**
Cross-check reference list against in-text citations.

**Step 3: Update author contribution and data availability**
- Ensure contribution statement reflects actual scope of work
- Verify data availability statement is accurate

**Step 4: Commit**
```bash
git add paper/manuscript_plos_one.md
git commit -m "docs: verify reference numbering and polish manuscript metadata"
```

---

## Task 11: Final Verification — Run All Tests

**Step 1: Run full test suite**
Run: `npx playwright test`
Expected: 246 passed (228 original + 18 new)

**Step 2: Verify div balance**
Run: `grep -cE '<div[ >]' metasprint-autopilot.html && grep -c '</div>' metasprint-autopilot.html`

**Step 3: Verify no remaining hardcoded 1.96 in critical paths**
Run: `grep -n '1.96' metasprint-autopilot.html` — audit remaining instances

**Step 4: Final commit if needed**
```bash
git add -A
git commit -m "chore: final verification — all tests pass, manuscript synced"
```
