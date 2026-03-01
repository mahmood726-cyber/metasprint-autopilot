/**
 * Cross-Validation Tests: JS Engine vs R Benchmark Fixtures
 *
 * Pre-computed R values from metafor, mada, netmeta stored in
 * tests/fixtures/r-benchmarks.json. Tolerance: 1e-4 for all comparisons.
 *
 * To regenerate R benchmarks: Rscript tests/validate_against_R.R
 */

const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const TOL = 1e-4;
const APP_URL = `file:///${path.resolve(__dirname, '..', 'metasprint-autopilot.html').replace(/\\/g, '/')}`;
const BENCHMARKS = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'r-benchmarks.json'), 'utf-8'));

function getRValue(metric) {
  const entry = BENCHMARKS.find(b => b.metric === metric);
  return entry ? entry.R_value : null;
}

test.describe('R Cross-Validation Suite', () => {
  let page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto(APP_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);
  });

  test.afterAll(async () => {
    await page.close();
  });

  // ─── 1. Pairwise DerSimonian-Laird ───────────────────────────

  test('RV-01: DL pooled log-HR matches metafor::rma(method="DL")', async () => {
    const rVal = getRValue('DL_pooled_logHR');
    const jsVal = await page.evaluate(() => {
      const yi = [Math.log(0.74), Math.log(0.75), Math.log(0.82), Math.log(0.79), Math.log(0.67)];
      const ciLo = [Math.log(0.65), Math.log(0.65), Math.log(0.73), Math.log(0.69), Math.log(0.52)];
      const ciHi = [Math.log(0.85), Math.log(0.86), Math.log(0.92), Math.log(0.90), Math.log(0.85)];
      const studies = yi.map((y, i) => {
        const se = (ciHi[i] - ciLo[i]) / (2 * 1.959964);
        return { effectEstimate: y, standardError: se, lowerCI: ciLo[i], upperCI: ciHi[i], authorYear: 'S' + (i + 1) };
      });
      const r = computeMetaAnalysis(studies, 0.95, 'DL');
      return r ? r.pooled : null;
    });
    expect(jsVal).not.toBeNull();
    expect(Math.abs(jsVal - rVal)).toBeLessThan(TOL);
  });

  test('RV-02: DL tau2 matches metafor', async () => {
    const rVal = getRValue('DL_tau2');
    const jsVal = await page.evaluate(() => {
      const yi = [Math.log(0.74), Math.log(0.75), Math.log(0.82), Math.log(0.79), Math.log(0.67)];
      const ciLo = [Math.log(0.65), Math.log(0.65), Math.log(0.73), Math.log(0.69), Math.log(0.52)];
      const ciHi = [Math.log(0.85), Math.log(0.86), Math.log(0.92), Math.log(0.90), Math.log(0.85)];
      const studies = yi.map((y, i) => {
        const se = (ciHi[i] - ciLo[i]) / (2 * 1.959964);
        return { effectEstimate: y, standardError: se, lowerCI: ciLo[i], upperCI: ciHi[i], authorYear: 'S' + (i + 1) };
      });
      const r = computeMetaAnalysis(studies, 0.95, 'DL');
      return r ? r.tau2 : null;
    });
    expect(jsVal).not.toBeNull();
    expect(Math.abs(jsVal - rVal)).toBeLessThan(TOL);
  });

  test('RV-03: DL I2 matches metafor', async () => {
    const rVal = getRValue('DL_I2');
    const jsVal = await page.evaluate(() => {
      const yi = [Math.log(0.74), Math.log(0.75), Math.log(0.82), Math.log(0.79), Math.log(0.67)];
      const ciLo = [Math.log(0.65), Math.log(0.65), Math.log(0.73), Math.log(0.69), Math.log(0.52)];
      const ciHi = [Math.log(0.85), Math.log(0.86), Math.log(0.92), Math.log(0.90), Math.log(0.85)];
      const studies = yi.map((y, i) => {
        const se = (ciHi[i] - ciLo[i]) / (2 * 1.959964);
        return { effectEstimate: y, standardError: se, lowerCI: ciLo[i], upperCI: ciHi[i], authorYear: 'S' + (i + 1) };
      });
      const r = computeMetaAnalysis(studies, 0.95, 'DL');
      return r ? r.I2 : null;
    });
    expect(jsVal).not.toBeNull();
    expect(Math.abs(jsVal - rVal)).toBeLessThan(TOL);
  });

  // ─── 2. REML ─────────────────────────────────────────────────

  test('RV-04: REML pooled log-HR matches metafor::rma(method="REML")', async () => {
    const rVal = getRValue('REML_pooled_logHR');
    const jsVal = await page.evaluate(() => {
      const yi = [Math.log(0.74), Math.log(0.75), Math.log(0.82), Math.log(0.79), Math.log(0.67)];
      const ciLo = [Math.log(0.65), Math.log(0.65), Math.log(0.73), Math.log(0.69), Math.log(0.52)];
      const ciHi = [Math.log(0.85), Math.log(0.86), Math.log(0.92), Math.log(0.90), Math.log(0.85)];
      const studies = yi.map((y, i) => {
        const se = (ciHi[i] - ciLo[i]) / (2 * 1.959964);
        return { effectEstimate: y, standardError: se, lowerCI: ciLo[i], upperCI: ciHi[i], authorYear: 'S' + (i + 1) };
      });
      const r = computeMetaAnalysis(studies, 0.95, 'REML');
      return r ? r.pooled : null;
    });
    expect(jsVal).not.toBeNull();
    expect(Math.abs(jsVal - rVal)).toBeLessThan(TOL);
  });

  test('RV-05: REML tau2 matches metafor', async () => {
    const rVal = getRValue('REML_tau2');
    const jsVal = await page.evaluate(() => {
      const yi = [Math.log(0.74), Math.log(0.75), Math.log(0.82), Math.log(0.79), Math.log(0.67)];
      const ciLo = [Math.log(0.65), Math.log(0.65), Math.log(0.73), Math.log(0.69), Math.log(0.52)];
      const ciHi = [Math.log(0.85), Math.log(0.86), Math.log(0.92), Math.log(0.90), Math.log(0.85)];
      const studies = yi.map((y, i) => {
        const se = (ciHi[i] - ciLo[i]) / (2 * 1.959964);
        return { effectEstimate: y, standardError: se, lowerCI: ciLo[i], upperCI: ciHi[i], authorYear: 'S' + (i + 1) };
      });
      const r = computeMetaAnalysis(studies, 0.95, 'REML');
      return r ? r.tau2 : null;
    });
    expect(jsVal).not.toBeNull();
    expect(Math.abs(jsVal - rVal)).toBeLessThan(TOL);
  });

  // ─── 3. HKSJ ─────────────────────────────────────────────────

  test('RV-06: HKSJ CI lower matches metafor::rma(test="knha")', async () => {
    const rVal = getRValue('HKSJ_CI_lower');
    const jsVal = await page.evaluate(() => {
      const yi = [Math.log(0.74), Math.log(0.75), Math.log(0.82), Math.log(0.79), Math.log(0.67)];
      const ciLo = [Math.log(0.65), Math.log(0.65), Math.log(0.73), Math.log(0.69), Math.log(0.52)];
      const ciHi = [Math.log(0.85), Math.log(0.86), Math.log(0.92), Math.log(0.90), Math.log(0.85)];
      const studies = yi.map((y, i) => {
        const se = (ciHi[i] - ciLo[i]) / (2 * 1.959964);
        return { effectEstimate: y, standardError: se, lowerCI: ciLo[i], upperCI: ciHi[i], authorYear: 'S' + (i + 1) };
      });
      const r = computeMetaAnalysis(studies, 0.95, 'HKSJ');
      return r ? r.pooledLo : null;
    });
    expect(jsVal).not.toBeNull();
    expect(Math.abs(jsVal - rVal)).toBeLessThan(TOL);
  });

  test('RV-07: HKSJ CI upper matches metafor', async () => {
    const rVal = getRValue('HKSJ_CI_upper');
    const jsVal = await page.evaluate(() => {
      const yi = [Math.log(0.74), Math.log(0.75), Math.log(0.82), Math.log(0.79), Math.log(0.67)];
      const ciLo = [Math.log(0.65), Math.log(0.65), Math.log(0.73), Math.log(0.69), Math.log(0.52)];
      const ciHi = [Math.log(0.85), Math.log(0.86), Math.log(0.92), Math.log(0.90), Math.log(0.85)];
      const studies = yi.map((y, i) => {
        const se = (ciHi[i] - ciLo[i]) / (2 * 1.959964);
        return { effectEstimate: y, standardError: se, lowerCI: ciLo[i], upperCI: ciHi[i], authorYear: 'S' + (i + 1) };
      });
      const r = computeMetaAnalysis(studies, 0.95, 'HKSJ');
      return r ? r.pooledHi : null;
    });
    expect(jsVal).not.toBeNull();
    expect(Math.abs(jsVal - rVal)).toBeLessThan(TOL);
  });

  // ─── 4. SMD (Hedges' g) ──────────────────────────────────────

  test('RV-08: Hedges g matches metafor::escalc(measure="SMD")', async () => {
    const rVal = getRValue('SMD_HedgesG');
    const jsVal = await page.evaluate(() => {
      const r = computeSMDFromRaw(50, 103, 15, 50, 100, 15, 'hedges');
      return r ? r.effect : null;
    });
    expect(jsVal).not.toBeNull();
    expect(Math.abs(jsVal - rVal)).toBeLessThan(TOL);
  });

  test('RV-09: Hedges g SE matches metafor::escalc', async () => {
    const rVal = getRValue('SMD_SE');
    const jsVal = await page.evaluate(() => {
      const r = computeSMDFromRaw(50, 103, 15, 50, 100, 15, 'hedges');
      return r ? r.se : null;
    });
    expect(jsVal).not.toBeNull();
    expect(Math.abs(jsVal - rVal)).toBeLessThan(TOL);
  });

  // ─── 5. DTA Bivariate Model ──────────────────────────────────

  test('RV-10: DTA logit-sensitivity matches mada::reitsma (tolerance 0.05)', async () => {
    const rVal = getRValue('DTA_logitSens');
    if (rVal === null) { test.skip(); return; }
    const jsVal = await page.evaluate(() => {
      const studies = [
        { tp: 90, fp: 10, fn: 5, tn: 95 },
        { tp: 85, fp: 15, fn: 8, tn: 92 },
        { tp: 92, fp: 8, fn: 3, tn: 97 },
        { tp: 78, fp: 22, fn: 12, tn: 88 },
        { tp: 88, fp: 12, fn: 6, tn: 94 }
      ];
      const br = computeBivariateModel(studies, 0.95);
      return br ? br.pooledLogitSens : null;
    });
    expect(jsVal).not.toBeNull();
    // DTA bivariate model tolerance is wider due to REML iteration differences
    expect(Math.abs(jsVal - rVal)).toBeLessThan(0.05);
  });

  test('RV-11: DTA logit-FPR matches mada::reitsma (tolerance 0.05)', async () => {
    const rVal = getRValue('DTA_logitFPR');
    if (rVal === null) { test.skip(); return; }
    const jsVal = await page.evaluate(() => {
      const studies = [
        { tp: 90, fp: 10, fn: 5, tn: 95 },
        { tp: 85, fp: 15, fn: 8, tn: 92 },
        { tp: 92, fp: 8, fn: 3, tn: 97 },
        { tp: 78, fp: 22, fn: 12, tn: 88 },
        { tp: 88, fp: 12, fn: 6, tn: 94 }
      ];
      const br = computeBivariateModel(studies, 0.95);
      // mada parameterizes as (tsens, tfpr), our model uses logit(Spec)
      // logitFPR = -logitSpec (per lessons.md SROC sign)
      return br ? -br.pooledLogitSpec : null;
    });
    expect(jsVal).not.toBeNull();
    expect(Math.abs(jsVal - rVal)).toBeLessThan(0.05);
  });

  // ─── 6. NMA ──────────────────────────────────────────────────

  test('RV-12: NMA Drug A vs Placebo matches netmeta (tolerance 0.05)', async () => {
    const rVal = getRValue('NMA_DrugA_vs_Placebo');
    if (rVal === null) { test.skip(); return; }
    const jsVal = await page.evaluate(() => {
      const contrasts = [
        { study: 'S1', treatA: 'Drug A', treatB: 'Placebo', effect: -0.5, se: 0.2 },
        { study: 'S2', treatA: 'Drug A', treatB: 'Placebo', effect: -0.4, se: 0.25 },
        { study: 'S3', treatA: 'Drug B', treatB: 'Placebo', effect: -0.3, se: 0.2 },
        { study: 'S4', treatA: 'Drug B', treatB: 'Placebo', effect: -0.35, se: 0.22 },
        { study: 'S5', treatA: 'Drug A', treatB: 'Drug B', effect: -0.15, se: 0.3 }
      ];
      const nma = computeFrequentistNMA(contrasts, 0.95);
      if (!nma || !nma.leagueTable) return null;
      // leagueTable is an object keyed by "A vs B" strings
      const key = 'Drug A vs Placebo';
      const entry = nma.leagueTable[key];
      return entry ? entry.effect : null;
    });
    expect(jsVal).not.toBeNull();
    expect(Math.abs(jsVal - rVal)).toBeLessThan(0.05);
  });

  test('RV-13: NMA Drug B vs Placebo matches netmeta (tolerance 0.05)', async () => {
    const rVal = getRValue('NMA_DrugB_vs_Placebo');
    if (rVal === null) { test.skip(); return; }
    const jsVal = await page.evaluate(() => {
      const contrasts = [
        { study: 'S1', treatA: 'Drug A', treatB: 'Placebo', effect: -0.5, se: 0.2 },
        { study: 'S2', treatA: 'Drug A', treatB: 'Placebo', effect: -0.4, se: 0.25 },
        { study: 'S3', treatA: 'Drug B', treatB: 'Placebo', effect: -0.3, se: 0.2 },
        { study: 'S4', treatA: 'Drug B', treatB: 'Placebo', effect: -0.35, se: 0.22 },
        { study: 'S5', treatA: 'Drug A', treatB: 'Drug B', effect: -0.15, se: 0.3 }
      ];
      const nma = computeFrequentistNMA(contrasts, 0.95);
      if (!nma || !nma.leagueTable) return null;
      const key = 'Drug B vs Placebo';
      const entry = nma.leagueTable[key];
      return entry ? entry.effect : null;
    });
    expect(jsVal).not.toBeNull();
    expect(Math.abs(jsVal - rVal)).toBeLessThan(0.05);
  });
});
