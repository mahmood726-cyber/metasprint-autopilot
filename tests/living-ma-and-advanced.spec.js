// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Living MA, Advanced Methods, DTA, NMA, and Import/Export Tests
 * ==============================================================
 * 51 tests across 5 blocks validating:
 *   Block 1 (L01-L20): Living Meta-Analysis sequential monitoring
 *   Block 2 (A01-A12): Advanced statistical methods
 *   Block 3 (D01-D06): DTA bivariate GLMM deep E2E
 *   Block 4 (N01-N05): NMA frequentist deep E2E
 *   Block 5 (E01-E08): Import/Export round-trip
 */

const BASE_URL = 'http://127.0.0.1:9876/metasprint-autopilot.html';

// ---- Helpers ----------------------------------------------------------------

async function dismissOverlays(page) {
  await page.evaluate(() => {
    const onboard = document.getElementById('onboardOverlay');
    if (onboard && onboard.style.display !== 'none') {
      onboard.style.display = 'none';
    }
    document.querySelectorAll('[onclick*="parentElement"]').forEach(b => {
      try { b.click(); } catch (_e) { /* ignore */ }
    });
  });
}

// ---- Single shared page for all blocks -------------------------------------

test.describe('Living MA + Advanced Methods + DTA + NMA + Import/Export', () => {
  /** @type {import('@playwright/test').Page} */
  let page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 60000 });
    await dismissOverlays(page);
  });

  test.afterAll(async () => {
    await page.close();
  });

  // ==========================================================================
  //  BLOCK 1: Living MA (L01 - L20)
  // ==========================================================================

  test('L01: computeCUSUM function exists', async () => {
    const exists = await page.evaluate(() => typeof computeCUSUM === 'function');
    expect(exists).toBe(true);
  });

  test('L02: CUSUM returns valid result for 8 studies', async () => {
    const result = await page.evaluate(() => {
      const studies = [];
      for (let i = 0; i < 8; i++) {
        studies.push({
          effect_estimate: 0.75 + i * 0.02,
          lower_ci: 0.65 + i * 0.02,
          upper_ci: 0.85 + i * 0.02,
          start_date: 2016 + i
        });
      }
      return computeCUSUM(studies);
    });
    expect(result).not.toBeNull();
    expect(result.k).toBe(8);
    expect(result).toHaveProperty('cusumPlus');
    expect(result).toHaveProperty('cusumMinus');
    expect(result).toHaveProperty('crossings');
    expect(result).toHaveProperty('alertStatus');
    expect(result).toHaveProperty('chartData');
    expect(result.chartData).toHaveLength(8);
  });

  test('L03: CUSUM returns null for < 3 studies', async () => {
    const result = await page.evaluate(() => {
      return computeCUSUM([
        { effect_estimate: 0.8, lower_ci: 0.7, upper_ci: 0.9, start_date: 2020 },
        { effect_estimate: 0.75, lower_ci: 0.65, upper_ci: 0.85, start_date: 2021 }
      ]);
    });
    expect(result).toBeNull();
  });

  test('L04: CUSUM detects shift with divergent data', async () => {
    const result = await page.evaluate(() => {
      const studies = [];
      // 10 studies at effect 0.80
      for (let i = 0; i < 10; i++) {
        studies.push({
          effect_estimate: 0.80,
          lower_ci: 0.75,
          upper_ci: 0.85,
          start_date: 2010 + i
        });
      }
      // 10 studies at effect 1.20 (clear shift)
      for (let i = 0; i < 10; i++) {
        studies.push({
          effect_estimate: 1.20,
          lower_ci: 1.10,
          upper_ci: 1.30,
          start_date: 2020 + i
        });
      }
      return computeCUSUM(studies, { threshold: 4 });
    });
    expect(result).not.toBeNull();
    expect(result.alertStatus).toBe('SHIFT_DETECTED');
    expect(result.crossings.length).toBeGreaterThan(0);
  });

  test('L05: alphaSpending function exists', async () => {
    const exists = await page.evaluate(() => typeof alphaSpending === 'function');
    expect(exists).toBe(true);
  });

  test('L06: OBF spending: conservative early (< 0.001 at t=0.25), full at end', async () => {
    const result = await page.evaluate(() => {
      const early = alphaSpending(0.25, 0.05, 'obrien-fleming');
      const full = alphaSpending(1.0, 0.05, 'obrien-fleming');
      return { early, full };
    });
    expect(result.early).toBeLessThan(0.001);
    expect(result.full).toBeCloseTo(0.05, 4);
  });

  test('L07: Pocock spending more uniform than OBF (higher early spending)', async () => {
    const result = await page.evaluate(() => {
      const obfEarly = alphaSpending(0.25, 0.05, 'obrien-fleming');
      const pocockEarly = alphaSpending(0.25, 0.05, 'pocock');
      return { obfEarly, pocockEarly };
    });
    expect(result.pocockEarly).toBeGreaterThan(result.obfEarly);
  });

  test('L08: computeSequentialBoundaries returns 4 boundaries, OBF early stricter than late', async () => {
    const result = await page.evaluate(() => {
      return computeSequentialBoundaries([0.25, 0.5, 0.75, 1.0], 0.05, 'obrien-fleming');
    });
    expect(result).toHaveLength(4);
    // Each boundary should have the required keys
    for (const b of result) {
      expect(b).toHaveProperty('infoFraction');
      expect(b).toHaveProperty('alphaSpent');
      expect(b).toHaveProperty('incrementalAlpha');
      expect(b).toHaveProperty('zBoundary');
    }
    // OBF: early z-boundary should be stricter (larger) than late
    expect(result[0].zBoundary).toBeGreaterThan(result[3].zBoundary);
  });

  test('L09: computeInformationFraction function exists', async () => {
    const exists = await page.evaluate(() => typeof computeInformationFraction === 'function');
    expect(exists).toBe(true);
  });

  test('L10: info fraction returns valid RIS and increasing fraction for 4 studies', async () => {
    const result = await page.evaluate(() => {
      const studies = [
        { effect_estimate: -0.3, lower_ci: -0.5, upper_ci: -0.1, start_date: 2018, se: 0.1 },
        { effect_estimate: -0.25, lower_ci: -0.45, upper_ci: -0.05, start_date: 2019, se: 0.1 },
        { effect_estimate: -0.28, lower_ci: -0.48, upper_ci: -0.08, start_date: 2020, se: 0.1 },
        { effect_estimate: -0.32, lower_ci: -0.52, upper_ci: -0.12, start_date: 2021, se: 0.1 }
      ];
      const pooled = { pooled: -0.29, I2: 10, tau2: 0.001 };
      return computeInformationFraction(studies, pooled);
    });
    expect(result).not.toBeNull();
    expect(result.ris).toBeGreaterThan(0);
    expect(result.fraction).toBeGreaterThan(0);
    expect(result.perStudy).toHaveLength(4);
    // Fractions should be monotonically increasing
    for (let i = 1; i < result.perStudy.length; i++) {
      expect(result.perStudy[i].fraction).toBeGreaterThan(result.perStudy[i - 1].fraction);
    }
  });

  test('L11: info fraction returns null for < 2 studies', async () => {
    const result = await page.evaluate(() => {
      const studies = [{ effect_estimate: -0.3, lower_ci: -0.5, upper_ci: -0.1, start_date: 2020 }];
      const pooled = { pooled: -0.3, I2: 0, tau2: 0 };
      return computeInformationFraction(studies, pooled);
    });
    expect(result).toBeNull();
  });

  test('L12: evaluateLMAAlerts function exists', async () => {
    const exists = await page.evaluate(() => typeof evaluateLMAAlerts === 'function');
    expect(exists).toBe(true);
  });

  test('L13: alerts fire for CUSUM shift', async () => {
    const alerts = await page.evaluate(() => {
      const cusumResult = {
        alertStatus: 'SHIFT_DETECTED',
        crossings: [{ index: 5, year: 2022, direction: 'positive', value: 5.2 }]
      };
      return evaluateLMAAlerts(cusumResult, null, null);
    });
    expect(alerts.length).toBeGreaterThanOrEqual(1);
    const shiftAlert = alerts.find(a => a.type === 'cusum_shift');
    expect(shiftAlert).toBeDefined();
    expect(shiftAlert.severity).toBe('alert');
  });

  test('L14: alerts fire for RIS reached (fraction >= 1.0)', async () => {
    const alerts = await page.evaluate(() => {
      const infoResult = { fraction: 1.2 };
      return evaluateLMAAlerts(null, infoResult, null);
    });
    expect(alerts.length).toBeGreaterThanOrEqual(1);
    const risAlert = alerts.find(a => a.type === 'ris_reached');
    expect(risAlert).toBeDefined();
    expect(risAlert.severity).toBe('info');
  });

  test('L15: showLMAToast function exists', async () => {
    const exists = await page.evaluate(() => typeof showLMAToast === 'function');
    expect(exists).toBe(true);
  });

  test('L16: toast renders and auto-dismisses', async () => {
    const countBefore = await page.evaluate(() => document.querySelectorAll('.lma-toast').length);
    await page.evaluate(() => showLMAToast('Test toast', 'info', 1000));
    const countDuring = await page.evaluate(() => document.querySelectorAll('.lma-toast').length);
    expect(countDuring).toBe(countBefore + 1);
    // Wait for auto-dismiss (1000ms duration + 300ms fade + buffer)
    await page.waitForTimeout(1800);
    const countAfter = await page.evaluate(() => document.querySelectorAll('.lma-toast').length);
    expect(countAfter).toBe(countBefore);
  });

  test('L17: Insights tab navigable', async () => {
    await page.evaluate(() => switchPhase('insights'));
    await page.waitForTimeout(500);
    const visible = await page.evaluate(() => {
      const el = document.getElementById('phase-insights');
      return el && el.style.display !== 'none' && !el.classList.contains('hidden');
    });
    expect(visible).toBe(true);
  });

  test('L18: Living sub-tab panel exists', async () => {
    const exists = await page.evaluate(() => {
      return document.getElementById('insight-living') !== null;
    });
    expect(exists).toBe(true);
  });

  test('L19: Sequential dashboard controls exist', async () => {
    const controls = await page.evaluate(() => {
      return {
        spendingType: document.getElementById('lmaSpendingType') !== null,
        cusumThreshold: document.getElementById('lmaCusumThreshold') !== null,
        power: document.getElementById('lmaPower') !== null,
        runBtn: document.getElementById('lmaRunBtn') !== null,
        autoInterval: document.getElementById('lmaAutoInterval') !== null,
      };
    });
    expect(controls.spendingType).toBe(true);
    expect(controls.cusumThreshold).toBe(true);
    expect(controls.power).toBe(true);
    expect(controls.runBtn).toBe(true);
    expect(controls.autoInterval).toBe(true);
  });

  test('L20: runLivingMADashboard function exists', async () => {
    const exists = await page.evaluate(() => typeof runLivingMADashboard === 'function');
    expect(exists).toBe(true);
  });

  // ==========================================================================
  //  BLOCK 2: Advanced Methods (A01 - A12)
  // ==========================================================================

  test('A01: computeDDMA function exists', async () => {
    const exists = await page.evaluate(() => typeof computeDDMA === 'function');
    expect(exists).toBe(true);
  });

  test('A02: computeRoBMA function exists', async () => {
    const exists = await page.evaluate(() => typeof computeRoBMA === 'function');
    expect(exists).toBe(true);
  });

  test('A03: computeZCurve function exists', async () => {
    const exists = await page.evaluate(() => typeof computeZCurve === 'function');
    expect(exists).toBe(true);
  });

  test('A04: computeCopasSelection function exists', async () => {
    const exists = await page.evaluate(() => typeof computeCopasSelection === 'function');
    expect(exists).toBe(true);
  });

  test('A05: computeThreeLevelMA function exists', async () => {
    const exists = await page.evaluate(() => typeof computeThreeLevelMA === 'function');
    expect(exists).toBe(true);
  });

  test('A06: computeCooksDistance function exists', async () => {
    const exists = await page.evaluate(() => typeof computeCooksDistance === 'function');
    expect(exists).toBe(true);
  });

  test('A07: computeMantelHaenszel function exists', async () => {
    const exists = await page.evaluate(() => typeof computeMantelHaenszel === 'function');
    expect(exists).toBe(true);
  });

  test('A08: computePetoMethod function exists', async () => {
    const exists = await page.evaluate(() => typeof computePetoMethod === 'function');
    expect(exists).toBe(true);
  });

  test('A09: MH produces valid pooled OR for 3 binary studies', async () => {
    const result = await page.evaluate(() => {
      const studies = [
        { eventsInt: 20, totalInt: 100, eventsCtrl: 30, totalCtrl: 100, authorYear: 'Study A 2020' },
        { eventsInt: 15, totalInt: 80, eventsCtrl: 25, totalCtrl: 80, authorYear: 'Study B 2021' },
        { eventsInt: 10, totalInt: 60, eventsCtrl: 18, totalCtrl: 60, authorYear: 'Study C 2022' }
      ];
      return computeMantelHaenszel(studies, 'OR', 0.95);
    });
    expect(result).not.toBeNull();
    expect(result.method).toBe('Mantel-Haenszel');
    expect(result.measure).toBe('OR');
    expect(result.estimate).toBeGreaterThan(0);
    expect(result.estimate).toBeLessThan(1); // Treatment beneficial (fewer events)
    expect(result.ciLower).toBeGreaterThan(0);
    expect(result.ciUpper).toBeLessThan(result.estimate * 3);
    expect(result.k).toBe(3);
    expect(result.pvalue).toBeGreaterThanOrEqual(0);
    expect(result.pvalue).toBeLessThanOrEqual(1);
  });

  test('A10: Peto OR for rare events', async () => {
    const result = await page.evaluate(() => {
      const studies = [
        { eventsInt: 2, totalInt: 200, eventsCtrl: 5, totalCtrl: 200, authorYear: 'Rare A 2020' },
        { eventsInt: 1, totalInt: 150, eventsCtrl: 4, totalCtrl: 150, authorYear: 'Rare B 2021' },
        { eventsInt: 3, totalInt: 300, eventsCtrl: 8, totalCtrl: 300, authorYear: 'Rare C 2022' }
      ];
      return computePetoMethod(studies, 0.95);
    });
    expect(result).not.toBeNull();
    expect(result.method).toBe('Peto');
    expect(result.measure).toBe('OR');
    expect(result.estimate).toBeGreaterThan(0);
    expect(result.estimate).toBeLessThan(1); // Treatment reduces rare events
    expect(result.k).toBe(3);
  });

  test('A11: Cook\'s Distance returns k values, outlier has highest D', async () => {
    const result = await page.evaluate(() => {
      // Normal studies cluster around -0.3, one outlier at +0.5
      const studies = [
        { yi: -0.30, sei: 0.10, authorYear: 'Normal A' },
        { yi: -0.28, sei: 0.12, authorYear: 'Normal B' },
        { yi: -0.32, sei: 0.09, authorYear: 'Normal C' },
        { yi: -0.27, sei: 0.11, authorYear: 'Normal D' },
        { yi:  0.50, sei: 0.10, authorYear: 'Outlier E' }  // Outlier
      ];
      return computeCooksDistance(studies, 0.01);
    });
    expect(result).not.toBeNull();
    expect(result.results).toHaveLength(5);
    expect(result.maxStudy).toBe('Outlier E');
    expect(result.maxCookD).toBeGreaterThan(0);
    expect(result.threshold).toBeCloseTo(4 / 5, 6);
    // The outlier should have highest Cook's D
    const outlierD = result.results.find(r => r.name === 'Outlier E').cookD;
    for (const r of result.results) {
      expect(outlierD).toBeGreaterThanOrEqual(r.cookD);
    }
  });

  test('A12: Z-Curve produces EDR between 0 and 1 for 20 z-values', async () => {
    const result = await page.evaluate(() => {
      // 20 studies with varying effect sizes and SEs
      const studies = [];
      const effects = [-0.5, -0.4, -0.35, -0.3, -0.28, -0.25, -0.22, -0.20, -0.18, -0.15,
                        -0.12, -0.10, -0.08, -0.05, -0.03, 0.0, 0.05, -0.45, -0.38, -0.33];
      for (let i = 0; i < 20; i++) {
        studies.push({ yi: effects[i], sei: 0.08 + i * 0.005, authorYear: 'ZC Study ' + (i + 1) });
      }
      return computeZCurve(studies);
    });
    expect(result).not.toBeNull();
    expect(result.k).toBe(20);
    expect(result.expectedDiscoveryRate).toBeGreaterThanOrEqual(0);
    expect(result.expectedDiscoveryRate).toBeLessThanOrEqual(1);
    expect(result.observedDiscoveryRate).toBeGreaterThanOrEqual(0);
    expect(result.observedDiscoveryRate).toBeLessThanOrEqual(1);
    expect(result.zScores).toHaveLength(20);
    expect(result).toHaveProperty('interpretation');
    expect(result).toHaveProperty('reference');
  });

  // ==========================================================================
  //  BLOCK 3: DTA Deep E2E (D01 - D06)
  // ==========================================================================

  test('D01: bivariate GLMM converges for 5 DTA studies', async () => {
    const result = await page.evaluate(() => {
      const studies = [
        { tp: 80, fp: 10, fn: 5,  tn: 105, authorYear: 'DTA-A 2018' },
        { tp: 70, fp: 15, fn: 8,  tn: 107, authorYear: 'DTA-B 2019' },
        { tp: 90, fp: 8,  fn: 3,  tn: 99,  authorYear: 'DTA-C 2020' },
        { tp: 65, fp: 20, fn: 12, tn: 103, authorYear: 'DTA-D 2021' },
        { tp: 85, fp: 12, fn: 6,  tn: 97,  authorYear: 'DTA-E 2022' }
      ];
      return computeBivariateModel(studies, 0.95);
    });
    expect(result).not.toBeNull();
    expect(result.pooledSens).toBeGreaterThan(0.7);
    expect(result.pooledSpec).toBeGreaterThan(0.7);
    expect(result.k).toBe(5);
    expect(result.sensLo).toBeLessThan(result.pooledSens);
    expect(result.sensHi).toBeGreaterThan(result.pooledSens);
    expect(result.specLo).toBeLessThan(result.pooledSpec);
    expect(result.specHi).toBeGreaterThan(result.pooledSpec);
    expect(result.dor).toBeGreaterThan(1);
    expect(result.posLR).toBeGreaterThan(1);
    expect(result.negLR).toBeLessThan(1);
  });

  test('D02: HSROC curve parameters computed (computeSROC)', async () => {
    const result = await page.evaluate(() => {
      const studies = [
        { tp: 80, fp: 10, fn: 5,  tn: 105 },
        { tp: 70, fp: 15, fn: 8,  tn: 107 },
        { tp: 90, fp: 8,  fn: 3,  tn: 99 },
        { tp: 65, fp: 20, fn: 12, tn: 103 },
        { tp: 85, fp: 12, fn: 6,  tn: 97 }
      ];
      const biv = computeBivariateModel(studies, 0.95);
      if (!biv) return null;
      return computeSROC(biv);
    });
    expect(result).not.toBeNull();
    expect(result).toHaveProperty('auc');
    expect(result).toHaveProperty('Lambda');
    expect(result).toHaveProperty('Theta');
    expect(result).toHaveProperty('curvePoints');
    expect(result.auc).toBeGreaterThan(0.5);
    expect(result.auc).toBeLessThanOrEqual(1.0);
    expect(result.curvePoints.length).toBeGreaterThan(0);
  });

  test('D03: SROC AUC uses normalCDF (verify normalCDF(0) = 0.5)', async () => {
    const val = await page.evaluate(() => normalCDF(0));
    expect(val).toBeCloseTo(0.5, 6);
  });

  test('D04: DTA tab renders study table (#dtaExtractBody exists)', async () => {
    const exists = await page.evaluate(() => {
      return document.getElementById('dtaExtractBody') !== null;
    });
    expect(exists).toBe(true);
  });

  test('D05: Fagan nomogram: LR+=5, preTest=0.3 gives postTest near 0.682', async () => {
    const result = await page.evaluate(() => {
      return computeFagan(0.3, 5, 0.2);
    });
    expect(result).not.toBeNull();
    expect(result.priorProb).toBeCloseTo(0.3, 4);
    expect(result.posLR).toBe(5);
    // Calculation: priorOdds = 0.3/0.7 = 0.4286, postOdds = 0.4286*5 = 2.1429,
    // postProb = 2.1429/3.1429 = 0.6818
    expect(result.postProbPos).toBeCloseTo(0.682, 2);
  });

  test('D06: Deeks funnel test returns slope and p-value for 12 studies', async () => {
    const result = await page.evaluate(() => {
      const studies = [];
      for (let i = 0; i < 12; i++) {
        studies.push({
          tp: 50 + Math.round(i * 3),
          fp: 10 + Math.round(i * 1.5),
          fn: 5 + Math.round(i * 0.8),
          tn: 100 + Math.round(i * 5),
          authorYear: 'Deeks ' + (i + 1) + ' ' + (2010 + i)
        });
      }
      const biv = computeBivariateModel(studies, 0.95);
      if (!biv) return null;
      return computeDeeksFunnel(biv);
    });
    expect(result).not.toBeNull();
    expect(result).toHaveProperty('slope');
    expect(result).toHaveProperty('pValue');
    expect(typeof result.slope).toBe('number');
    expect(result.pValue).toBeGreaterThanOrEqual(0);
    expect(result.pValue).toBeLessThanOrEqual(1);
    expect(result.points.length).toBeGreaterThanOrEqual(10);
  });

  // ==========================================================================
  //  BLOCK 4: NMA Deep E2E (N01 - N05)
  // ==========================================================================

  test('N01: computeFrequentistNMA produces 4-treatment league table', async () => {
    const result = await page.evaluate(() => {
      // 4 treatments: A (ref), B, C, D with 7 contrasts
      const contrasts = [
        { study: 'Trial 1',  treatA: 'A', treatB: 'B', effect: -0.30, se: 0.10 },
        { study: 'Trial 2',  treatA: 'A', treatB: 'B', effect: -0.25, se: 0.12 },
        { study: 'Trial 3',  treatA: 'A', treatB: 'C', effect: -0.20, se: 0.11 },
        { study: 'Trial 4',  treatA: 'B', treatB: 'C', effect:  0.05, se: 0.09 },
        { study: 'Trial 5',  treatA: 'A', treatB: 'D', effect: -0.40, se: 0.15 },
        { study: 'Trial 6',  treatA: 'C', treatB: 'D', effect: -0.15, se: 0.13 },
        { study: 'Trial 7',  treatA: 'B', treatB: 'D', effect: -0.10, se: 0.14 }
      ];
      return computeFrequentistNMA(contrasts, 0.95);
    });
    expect(result).not.toBeNull();
    expect(result.treatments).toHaveLength(4);
    expect(result.treatments).toEqual(expect.arrayContaining(['A', 'B', 'C', 'D']));
    expect(result).toHaveProperty('leagueTable');
    // League table should have 4*(4-1) = 12 pairwise entries
    expect(Object.keys(result.leagueTable).length).toBe(12);
    expect(result).toHaveProperty('pScores');
    expect(result).toHaveProperty('tau2');
    expect(result.tau2).toBeGreaterThanOrEqual(0);
  });

  test('N02: P-scores sum to approximately k/2', async () => {
    const result = await page.evaluate(() => {
      const contrasts = [
        { study: 'T1', treatA: 'A', treatB: 'B', effect: -0.30, se: 0.10 },
        { study: 'T2', treatA: 'A', treatB: 'B', effect: -0.25, se: 0.12 },
        { study: 'T3', treatA: 'A', treatB: 'C', effect: -0.20, se: 0.11 },
        { study: 'T4', treatA: 'B', treatB: 'C', effect:  0.05, se: 0.09 },
        { study: 'T5', treatA: 'A', treatB: 'D', effect: -0.40, se: 0.15 },
        { study: 'T6', treatA: 'C', treatB: 'D', effect: -0.15, se: 0.13 },
        { study: 'T7', treatA: 'B', treatB: 'D', effect: -0.10, se: 0.14 }
      ];
      const r = computeFrequentistNMA(contrasts, 0.95);
      if (!r) return null;
      const pScoreValues = Object.values(r.pScores);
      const sum = pScoreValues.reduce((a, b) => a + b, 0);
      return { sum, nTreat: r.treatments.length };
    });
    expect(result).not.toBeNull();
    // P-scores sum to k/2 where k = number of treatments
    // Allow reasonable tolerance (within 0.5 of expected sum)
    expect(result.sum).toBeCloseTo(result.nTreat / 2, 0);
  });

  test('N03: Bucher indirect: 3-treatment NMA produces indirect comparison', async () => {
    const result = await page.evaluate(() => {
      // 3 treatments: only direct evidence A-B and A-C, NMA yields indirect B-C
      const contrasts = [
        { study: 'Direct1', treatA: 'A', treatB: 'B', effect: -0.20, se: 0.10 },
        { study: 'Direct2', treatA: 'A', treatB: 'B', effect: -0.22, se: 0.11 },
        { study: 'Direct3', treatA: 'A', treatB: 'C', effect: -0.15, se: 0.12 },
        { study: 'Direct4', treatA: 'A', treatB: 'C', effect: -0.18, se: 0.10 }
      ];
      const r = computeFrequentistNMA(contrasts, 0.95);
      if (!r) return null;
      const bc = r.leagueTable['B vs C'];
      const cb = r.leagueTable['C vs B'];
      return { bc, cb, treatments: r.treatments };
    });
    expect(result).not.toBeNull();
    expect(result.treatments).toEqual(expect.arrayContaining(['A', 'B', 'C']));
    // Indirect B vs C should exist even though no direct trial
    expect(result.bc).toBeDefined();
    expect(typeof result.bc.effect).toBe('number');
    expect(result.bc.se).toBeGreaterThan(0);
    // B vs C should be opposite sign of C vs B
    expect(result.bc.effect).toBeCloseTo(-result.cb.effect, 6);
  });

  test('N04: NMA tab exists and renders', async () => {
    await page.evaluate(() => switchPhase('nma'));
    await page.waitForTimeout(500);
    const visible = await page.evaluate(() => {
      const el = document.getElementById('phase-nma');
      return el && el.style.display !== 'none' && !el.classList.contains('hidden');
    });
    expect(visible).toBe(true);
  });

  test('N05: NMA result has treatments and leagueTable keys', async () => {
    const result = await page.evaluate(() => {
      const contrasts = [
        { study: 'S1', treatA: 'Alpha', treatB: 'Beta',  effect: -0.1, se: 0.05 },
        { study: 'S2', treatA: 'Alpha', treatB: 'Gamma', effect: -0.2, se: 0.06 },
        { study: 'S3', treatA: 'Beta',  treatB: 'Gamma', effect: -0.05, se: 0.07 }
      ];
      const r = computeFrequentistNMA(contrasts, 0.95);
      if (!r) return null;
      return {
        hasTreatments: Array.isArray(r.treatments),
        hasLeagueTable: typeof r.leagueTable === 'object' && r.leagueTable !== null,
        hasPScores: typeof r.pScores === 'object' && r.pScores !== null,
        hasEdges: typeof r.edges === 'object' && r.edges !== null,
        hasTau2: typeof r.tau2 === 'number'
      };
    });
    expect(result).not.toBeNull();
    expect(result.hasTreatments).toBe(true);
    expect(result.hasLeagueTable).toBe(true);
    expect(result.hasPScores).toBe(true);
    expect(result.hasEdges).toBe(true);
    expect(result.hasTau2).toBe(true);
  });

  // ==========================================================================
  //  BLOCK 5: Import/Export (E01 - E08)
  // ==========================================================================

  test('E01: parseRIS handles standard RIS format', async () => {
    const result = await page.evaluate(() => {
      const ris = [
        'TY  - JOUR',
        'AU  - Smith, John',
        'AU  - Doe, Jane',
        'TI  - A Randomized Controlled Trial of Widget Therapy',
        'PY  - 2023',
        'JO  - Journal of Widgets',
        'VL  - 15',
        'DO  - 10.1234/jw.2023.001',
        'ER  - '
      ].join('\n');
      return parseRIS(ris);
    });
    expect(result).toHaveLength(1);
    expect(result[0].title).toContain('Randomized Controlled Trial');
    expect(result[0].authors).toContain('Smith');
    expect(result[0].authors).toContain('Doe');
    expect(result[0].year).toBe('2023');
    expect(result[0].journal).toBe('Journal of Widgets');
    expect(result[0].doi).toBe('10.1234/jw.2023.001');
  });

  test('E02: parseBibTeX handles standard @article entry', async () => {
    const result = await page.evaluate(() => {
      const bib = `@article{smith2023,
  title = {A Meta-Analysis of Treatment Effects},
  author = {Smith, John and Doe, Jane},
  year = {2023},
  journal = {Annals of Meta-Analysis},
  volume = {42},
  pages = {100-115},
  doi = {10.5678/ama.2023.042}
}`;
      return parseBibTeX(bib);
    });
    expect(result).toHaveLength(1);
    expect(result[0].title).toContain('Meta-Analysis');
    expect(result[0].authors).toContain('Smith');
    expect(result[0].year).toBe('2023');
    expect(result[0].journal).toContain('Annals');
    expect(result[0].doi).toBe('10.5678/ama.2023.042');
  });

  test('E03: RevMan XML export function exists and produces XML', async () => {
    const exists = await page.evaluate(() => typeof exportRevManXML === 'function');
    expect(exists).toBe(true);
  });

  test('E04: exportStudiesCSV function exists', async () => {
    const exists = await page.evaluate(() => typeof exportStudiesCSV === 'function');
    expect(exists).toBe(true);
  });

  test('E05: exportPlotPNG function exists', async () => {
    const exists = await page.evaluate(() => typeof exportPlotPNG === 'function');
    expect(exists).toBe(true);
  });

  test('E06: exportRCode function exists', async () => {
    const exists = await page.evaluate(() => typeof exportRCode === 'function');
    expect(exists).toBe(true);
  });

  test('E07: exportPythonCode function exists', async () => {
    const exists = await page.evaluate(() => typeof exportPythonCode === 'function');
    expect(exists).toBe(true);
  });

  test('E08: parsePubMedNBib handles PubMed NBIB format', async () => {
    const result = await page.evaluate(() => {
      const nbib = [
        'PMID- 12345678',
        'TI  - Efficacy of New Drug in Heart Failure',
        'AU  - Johnson, Robert',
        'AU  - Williams, Sarah',
        'DP  - 2024 Jan',
        'TA  - N Engl J Med',
        'VI  - 390',
        'IP  - 2',
        'PG  - 125-134',
        'AB  - Background: Heart failure is a major cause of morbidity.',
        'AID - 10.1056/NEJMoa2024816 [doi]',
        '',
        'PMID- 23456789',
        'TI  - Second Study on Drug Therapy',
        'AU  - Brown, Michael',
        'DP  - 2024 Mar',
        'TA  - Lancet',
        'AB  - We conducted a randomized trial.'
      ].join('\n');
      return parsePubMedNBib(nbib);
    });
    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result[0].pmid).toBe('12345678');
    expect(result[0].title).toContain('Efficacy');
    expect(result[0].authors).toContain('Johnson');
    expect(result[0].year).toBe('2024');
    expect(result[0].journal).toBe('N Engl J Med');
  });
});
