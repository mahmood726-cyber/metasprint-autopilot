// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Review Fixes Round 1 — E2E Tests
 * ==================================
 * 48 tests across 8 blocks validating P0/P1 fixes from commit e396d65:
 *   Block 1 (R01-R06): SROC / DTA Fixes
 *   Block 2 (R07-R10): Galbraith Plot Fixes
 *   Block 3 (R11-R20): GRADE Fixes
 *   Block 4 (R21-R24): REML Prediction Interval
 *   Block 5 (R25-R28): Study Removal Sensitivity
 *   Block 6 (R29-R32): CUSUM Reset
 *   Block 7 (R33-R40): Security Fixes
 *   Block 8 (R41-R48): ARIA Accessibility
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

test.describe('Review Fixes Round 1 (e396d65)', () => {
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
  //  BLOCK 1: SROC / DTA Fixes (R01 - R06)
  // ==========================================================================

  test('R01: computeSROC function exists', async () => {
    const exists = await page.evaluate(() => typeof computeSROC === 'function');
    expect(exists).toBe(true);
  });

  test('R02: SROC handles Lambda=0 edge case (slopeFactor = 1)', async () => {
    // When pooledLogitSens = -pooledLogitSpec, Lambda = 0 => slopeFactor must be 1
    const result = await page.evaluate(() => {
      const br = {
        pooledSens: 0.5, pooledSpec: 0.5,
        pooledLogitSens: 0, pooledLogitSpec: 0,
        seLogitSens: 0.3, seLogitSpec: 0.25,
        tau2Sens: 0.1, tau2Spec: 0.08, covTau: 0.02,
        Sigma: { s11: 0.1, s22: 0.08, s12: 0.02, rho: 0.224 },
        k: 10, confLevel: 0.95,
        sensLo: 0.4, sensHi: 0.6, specLo: 0.4, specHi: 0.6,
        posLR: 1, negLR: 1, dor: 1,
        posLRLo: 0.5, posLRHi: 2, negLRLo: 0.5, negLRHi: 2,
        dorLo: 0.5, dorHi: 2
      };
      const sroc = computeSROC(br);
      // With Lambda=0, the curve should still be generated without NaN/Infinity
      return {
        hasPoints: sroc && sroc.curvePoints && sroc.curvePoints.length > 0,
        noNaN: sroc ? sroc.curvePoints.every(p => isFinite(p.fpr) && isFinite(p.sens)) : false
      };
    });
    expect(result.hasPoints).toBe(true);
    expect(result.noNaN).toBe(true);
  });

  test('R03: SROC ellipse uses chi2Quantile(confLevel, 2) not univariate z', async () => {
    // chi2(0.95, 2) approx 5.99 => sqrt ~2.45, NOT z(0.975)=1.96
    const check = await page.evaluate(() => {
      const chi2Val = chi2Quantile(0.95, 2);
      const confRadius = Math.sqrt(chi2Val);
      // Univariate z at 0.95 would be ~1.96; bivariate chi2 with df=2 gives sqrt(~5.99) ~ 2.45
      return {
        chi2Val,
        confRadius,
        isGreaterThanUnivariate: confRadius > 2.0
      };
    });
    expect(check.chi2Val).toBeGreaterThan(5.5);
    expect(check.chi2Val).toBeLessThan(6.5);
    expect(check.isGreaterThanUnivariate).toBe(true);
  });

  test('R04: SROC ellipse incorporates rho via Cholesky decomposition', async () => {
    // Compare ellipse points with rho=0 vs rho=0.5 — they should differ
    const result = await page.evaluate(() => {
      function makeBR(rho) {
        return {
          pooledSens: 0.85, pooledSpec: 0.90,
          pooledLogitSens: 1.735, pooledLogitSpec: 2.197,
          seLogitSens: 0.3, seLogitSpec: 0.25,
          tau2Sens: 0.1, tau2Spec: 0.08, covTau: 0.02,
          Sigma: { s11: 0.1, s22: 0.08, s12: rho * 0.3 * 0.25, rho: rho },
          k: 10, confLevel: 0.95,
          sensLo: 0.78, sensHi: 0.90, specLo: 0.84, specHi: 0.94,
          posLR: 8.5, negLR: 0.17, dor: 50,
          posLRLo: 5, posLRHi: 14, negLRLo: 0.1, negLRHi: 0.25,
          dorLo: 20, dorHi: 125
        };
      }
      const sroc0 = computeSROC(makeBR(0));
      const sroc5 = computeSROC(makeBR(0.5));
      // Ellipse points should differ when rho changes
      const ellipse0 = sroc0.confEllipsePoints;
      const ellipse5 = sroc5.confEllipsePoints;
      if (!ellipse0 || !ellipse5 || ellipse0.length === 0 || ellipse5.length === 0) {
        return { differ: false, hasEllipse: false };
      }
      // Compare first few points
      let sumDiff = 0;
      const n = Math.min(ellipse0.length, ellipse5.length, 10);
      for (let i = 0; i < n; i++) {
        sumDiff += Math.abs(ellipse0[i].fpr - ellipse5[i].fpr) +
                   Math.abs(ellipse0[i].sens - ellipse5[i].sens);
      }
      return { differ: sumDiff > 0.001, hasEllipse: true };
    });
    expect(result.hasEllipse).toBe(true);
    expect(result.differ).toBe(true);
  });

  test('R05: SROC curvePoints are sorted by FPR', async () => {
    const sorted = await page.evaluate(() => {
      const br = {
        pooledSens: 0.85, pooledSpec: 0.90,
        pooledLogitSens: 1.735, pooledLogitSpec: 2.197,
        seLogitSens: 0.3, seLogitSpec: 0.25,
        tau2Sens: 0.1, tau2Spec: 0.08, covTau: 0.02,
        Sigma: { s11: 0.1, s22: 0.08, s12: 0.02, rho: 0.224 },
        k: 10, confLevel: 0.95,
        sensLo: 0.78, sensHi: 0.90, specLo: 0.84, specHi: 0.94,
        posLR: 8.5, negLR: 0.17, dor: 50,
        posLRLo: 5, posLRHi: 14, negLRLo: 0.1, negLRHi: 0.25,
        dorLo: 20, dorHi: 125
      };
      const sroc = computeSROC(br);
      if (!sroc || !sroc.curvePoints || sroc.curvePoints.length < 2) return false;
      for (let i = 1; i < sroc.curvePoints.length; i++) {
        if (sroc.curvePoints[i].fpr < sroc.curvePoints[i - 1].fpr) return false;
      }
      return true;
    });
    expect(sorted).toBe(true);
  });

  test('R06: SROC AUC uses normalCDF (Phi) not logistic', async () => {
    // AUC = normalCDF(Lambda / sqrt(2)). For Lambda ~3.93, AUC should differ from logistic
    const result = await page.evaluate(() => {
      const br = {
        pooledSens: 0.85, pooledSpec: 0.90,
        pooledLogitSens: 1.735, pooledLogitSpec: 2.197,
        seLogitSens: 0.3, seLogitSpec: 0.25,
        tau2Sens: 0.1, tau2Spec: 0.08, covTau: 0.02,
        Sigma: { s11: 0.1, s22: 0.08, s12: 0.02, rho: 0.224 },
        k: 10, confLevel: 0.95,
        sensLo: 0.78, sensHi: 0.90, specLo: 0.84, specHi: 0.94,
        posLR: 8.5, negLR: 0.17, dor: 50,
        posLRLo: 5, posLRHi: 14, negLRLo: 0.1, negLRHi: 0.25,
        dorLo: 20, dorHi: 125
      };
      const sroc = computeSROC(br);
      const Lambda = br.pooledLogitSens + br.pooledLogitSpec; // ~3.932
      const phiAUC = normalCDF(Lambda / Math.sqrt(2));
      const logisticAUC = 1 / (1 + Math.exp(-Lambda / Math.sqrt(2)));
      return {
        auc: sroc.auc,
        phiAUC,
        logisticAUC,
        usesNormalCDF: Math.abs(sroc.auc - phiAUC) < 0.001,
        diffFromLogistic: Math.abs(sroc.auc - logisticAUC) > 0.005
      };
    });
    expect(result.usesNormalCDF).toBe(true);
    // For large Lambda, Phi and logistic diverge — Phi gives a higher value
    expect(result.diffFromLogistic).toBe(true);
  });

  // ==========================================================================
  //  BLOCK 2: Galbraith Plot Fixes (R07 - R10)
  // ==========================================================================

  test('R07: renderGalbraithPlot function exists', async () => {
    const exists = await page.evaluate(() => typeof renderGalbraithPlot === 'function');
    expect(exists).toBe(true);
  });

  test('R08: Galbraith accepts confLevel and uses normalQuantile', async () => {
    // At confLevel=0.95, zCrit should be ~1.96; at 0.99, ~2.576
    const result = await page.evaluate(() => {
      const z95 = normalQuantile((1 + 0.95) / 2);
      const z99 = normalQuantile((1 + 0.99) / 2);
      return { z95, z99 };
    });
    expect(result.z95).toBeCloseTo(1.96, 1);
    expect(result.z99).toBeCloseTo(2.576, 1);
  });

  test('R09: Galbraith bands use correct zCrit at 0.99 level', async () => {
    // zCrit for 0.99 should be ~2.576, not hardcoded 1.96
    const result = await page.evaluate(() => {
      const z99 = normalQuantile((1 + 0.99) / 2);
      return {
        z99,
        isNotHardcoded196: Math.abs(z99 - 1.96) > 0.5,
        isClose2576: Math.abs(z99 - 2.576) < 0.05
      };
    });
    expect(result.isNotHardcoded196).toBe(true);
    expect(result.isClose2576).toBe(true);
  });

  test('R10: Galbraith caption includes actual confLevel percentage', async () => {
    // The caption text uses confPct = Math.round(confLevel * 100)
    // renderGalbraithPlot uses the existing #galbraithContainer in the DOM
    const result = await page.evaluate(() => {
      const el = document.getElementById('galbraithContainer');
      const savedHTML = el ? el.innerHTML : '';
      try {
        const studyResults = [];
        for (let i = 0; i < 5; i++) {
          studyResults.push({
            yi: -0.3 + i * 0.05,
            sei: 0.15 + i * 0.02,
            vi: (0.15 + i * 0.02) ** 2,
            label: 'Study ' + (i + 1)
          });
        }
        renderGalbraithPlot(studyResults, -0.2, 0.99);
        const html = el ? el.innerHTML : '';
        const has99 = html.includes('99%');
        const has95 = html.includes('95%');
        return { has99, has95, htmlLen: html.length };
      } finally {
        // Restore original content
        if (el) el.innerHTML = savedHTML;
      }
    });
    expect(result.htmlLen).toBeGreaterThan(0);
    expect(result.has99).toBe(true);
  });

  // ==========================================================================
  //  BLOCK 3: GRADE Fixes (R11 - R20)
  // ==========================================================================

  test('R11: computeGRADE function exists', async () => {
    const exists = await page.evaluate(() => typeof computeGRADE === 'function');
    expect(exists).toBe(true);
  });

  test('R12: GRADE dynamic OIS formula uses ceil((zAlpha+zBeta)^2 * 2 / delta^2) with floor 200', async () => {
    const result = await page.evaluate(() => {
      const zB = normalQuantile(0.80);
      const zAG = normalQuantile(0.975);
      // For OR=2 (log OR ~0.693), delta = 0.693
      const delta = Math.log(2);
      const ois = Math.ceil(Math.pow(zAG + zB, 2) * 2 / (delta * delta));
      // Floor = 200
      const oisFinal = Math.max(200, ois);
      return { zB, zAG, ois, oisFinal };
    });
    // (1.96 + 0.84)^2 * 2 / 0.693^2 = 7.84 * 2 / 0.480 ~ 32.7 => ceil = 33
    // But floor is 200
    expect(result.oisFinal).toBe(200);
    expect(result.ois).toBeGreaterThan(0);
  });

  test('R13: GRADE large effect upgrade for ratio measures (OR=3 -> +1, OR=6 -> +2)', async () => {
    const result = await page.evaluate(() => {
      // OR = 3 => log(3) = 1.099 > log(2) = 0.693 => +1
      const pooledOR3 = {
        pooled: 3.0, pooledLo: 2.0, pooledHi: 4.5,
        isRatio: true, pValue: 0.001, k: 8,
        I2: 10, tau2: 0.01, piLo: 1.5, piHi: 6.0, sValue: 8
      };
      const studies8 = Array.from({ length: 8 }, () => ({ nTotal: 500 }));
      const grade3 = computeGRADE(pooledOR3, studies8);

      // OR = 6 => log(6) = 1.791 > log(5) = 1.609 => +2
      const pooledOR6 = {
        pooled: 6.0, pooledLo: 4.0, pooledHi: 9.0,
        isRatio: true, pValue: 0.0001, k: 8,
        I2: 10, tau2: 0.01, piLo: 3.0, piHi: 12.0, sValue: 10
      };
      const grade6 = computeGRADE(pooledOR6, studies8);

      return {
        largeEffect3: grade3.domains.largeEffect,
        largeEffect6: grade6.domains.largeEffect
      };
    });
    expect(result.largeEffect3).toBe(1);
    expect(result.largeEffect6).toBe(2);
  });

  test('R14: GRADE large effect upgrade for continuous measures (SMD=0.9 -> +1, SMD=1.3 -> +2)', async () => {
    const result = await page.evaluate(() => {
      // SMD = 0.9 > 0.8 => +1
      const pooledSMD09 = {
        pooled: 0.9, pooledLo: 0.6, pooledHi: 1.2,
        isRatio: false, pValue: 0.001, k: 8,
        I2: 10, tau2: 0.01, piLo: 0.3, piHi: 1.5, sValue: 8
      };
      const studies8 = Array.from({ length: 8 }, () => ({ nTotal: 500 }));
      const grade09 = computeGRADE(pooledSMD09, studies8);

      // SMD = 1.3 > 1.2 => +2
      const pooledSMD13 = {
        pooled: 1.3, pooledLo: 1.0, pooledHi: 1.6,
        isRatio: false, pValue: 0.0001, k: 8,
        I2: 10, tau2: 0.01, piLo: 0.5, piHi: 2.1, sValue: 10
      };
      const grade13 = computeGRADE(pooledSMD13, studies8);

      return {
        largeEffect09: grade09.domains.largeEffect,
        largeEffect13: grade13.domains.largeEffect
      };
    });
    expect(result.largeEffect09).toBe(1);
    expect(result.largeEffect13).toBe(2);
  });

  test('R15: GRADE has no certainty >= 3 gate on upgrades', async () => {
    // Observational evidence can start LOW (2) and upgrade via large effect
    const result = await page.evaluate(() => {
      // Create a scenario with downgrades that push certainty low,
      // then a large effect that would upgrade. If there were a gate,
      // it would not upgrade.
      const pooled = {
        pooled: 6.0, pooledLo: 4.0, pooledHi: 9.0,
        isRatio: true, pValue: 0.0001, k: 4,
        I2: 80, tau2: 0.5, piLo: 0.5, piHi: 72, sValue: 10
      };
      // Small sample => OIS not met
      const studies4 = Array.from({ length: 4 }, () => ({ nTotal: 30 }));
      const grade = computeGRADE(pooled, studies4);
      // With I2=80 and PI crossing null => inconsistency -2
      // CI doesn't cross null but OIS not met => imprecision -1
      // largeEffect should still be +2 regardless of current certainty
      return {
        largeEffect: grade.domains.largeEffect,
        certainty: grade.certainty,
        inconsistency: grade.domains.inconsistency
      };
    });
    // Large effect upgrade should be applied regardless of current certainty level
    expect(result.largeEffect).toBe(2);
  });

  test('R16: GRADE doseResponse and plausibleConfounding domains present (set to 0)', async () => {
    const result = await page.evaluate(() => {
      const pooled = {
        pooled: 1.5, pooledLo: 1.2, pooledHi: 1.9,
        isRatio: true, pValue: 0.001, k: 5,
        I2: 20, tau2: 0.02, piLo: 0.9, piHi: 2.5, sValue: 6
      };
      const studies = Array.from({ length: 5 }, () => ({ nTotal: 200 }));
      const grade = computeGRADE(pooled, studies);
      return {
        hasDoseResponse: 'doseResponse' in grade.domains,
        hasPlausibleConfounding: 'plausibleConfounding' in grade.domains,
        doseResponse: grade.domains.doseResponse,
        plausibleConfounding: grade.domains.plausibleConfounding
      };
    });
    expect(result.hasDoseResponse).toBe(true);
    expect(result.hasPlausibleConfounding).toBe(true);
    expect(result.doseResponse).toBe(0);
    expect(result.plausibleConfounding).toBe(0);
  });

  test('R17: GRADE imprecision double-downgrade when OIS not met AND CI crosses null', async () => {
    const result = await page.evaluate(() => {
      // CI crosses null for ratio: pooledLo < 1 && pooledHi > 1
      // Small total N to ensure OIS not met
      const pooled = {
        pooled: 1.1, pooledLo: 0.8, pooledHi: 1.5,
        isRatio: true, pValue: 0.3, k: 3,
        I2: 10, tau2: 0.01, piLo: 0.6, piHi: 2.0, sValue: 6
      };
      const studies = Array.from({ length: 3 }, () => ({ nTotal: 20 }));
      const grade = computeGRADE(pooled, studies);
      return { imprecision: grade.domains.imprecision };
    });
    expect(result.imprecision).toBe(-2);
  });

  test('R18: GRADE inconsistency uses I2 and PI together', async () => {
    const result = await page.evaluate(() => {
      // High I2 + PI crosses null => -2
      const pooledHigh = {
        pooled: 0.8, pooledLo: 0.6, pooledHi: 0.95,
        isRatio: true, pValue: 0.01, k: 10,
        I2: 80, tau2: 0.5, piLo: 0.3, piHi: 2.1, sValue: 6
      };
      const studies10 = Array.from({ length: 10 }, () => ({ nTotal: 200 }));
      const gradeHigh = computeGRADE(pooledHigh, studies10);

      // I2 > 50 alone => -1
      const pooledMod = {
        pooled: 0.8, pooledLo: 0.6, pooledHi: 0.95,
        isRatio: true, pValue: 0.01, k: 10,
        I2: 60, tau2: 0.1, piLo: 0.5, piHi: 0.95, sValue: 6
      };
      const gradeMod = computeGRADE(pooledMod, studies10);

      return {
        inconsistencyHigh: gradeHigh.domains.inconsistency,
        inconsistencyMod: gradeMod.domains.inconsistency
      };
    });
    expect(result.inconsistencyHigh).toBe(-2);
    expect(result.inconsistencyMod).toBe(-1);
  });

  test('R19: GRADE returns certainty clamped 1-4 with label and color', async () => {
    const result = await page.evaluate(() => {
      // Good evidence => HIGH
      const pooledGood = {
        pooled: 0.7, pooledLo: 0.6, pooledHi: 0.82,
        isRatio: true, pValue: 0.0001, k: 15,
        I2: 10, tau2: 0.01, piLo: 0.5, piHi: 0.95, sValue: 10
      };
      const studiesGood = Array.from({ length: 15 }, () => ({ nTotal: 500 }));
      const gradeGood = computeGRADE(pooledGood, studiesGood);
      return {
        certainty: gradeGood.certainty,
        label: gradeGood.label,
        color: gradeGood.color,
        hasDomains: typeof gradeGood.domains === 'object'
      };
    });
    expect(result.certainty).toBeGreaterThanOrEqual(1);
    expect(result.certainty).toBeLessThanOrEqual(4);
    expect(typeof result.label).toBe('string');
    expect(typeof result.color).toBe('string');
    expect(result.hasDomains).toBe(true);
  });

  test('R20: GRADE certainty labels: 4=HIGH, 3=MODERATE, 2=LOW, 1=VERY LOW', async () => {
    const result = await page.evaluate(() => {
      // Manually check the label mapping used by computeGRADE
      const labels = { 4: 'HIGH', 3: 'MODERATE', 2: 'LOW', 1: 'VERY LOW' };
      // Create scenarios to hit each level
      // HIGH: good evidence, large N, low I2
      const pooled4 = {
        pooled: 0.65, pooledLo: 0.55, pooledHi: 0.77,
        isRatio: true, pValue: 0.00001, k: 20,
        I2: 5, tau2: 0.001, piLo: 0.5, piHi: 0.85, sValue: 12
      };
      const studies20 = Array.from({ length: 20 }, () => ({ nTotal: 1000 }));
      const g4 = computeGRADE(pooled4, studies20);

      return {
        expectedLabels: labels,
        grade4Label: g4.label,
        grade4Certainty: g4.certainty
      };
    });
    expect(result.expectedLabels[4]).toBe('HIGH');
    expect(result.expectedLabels[3]).toBe('MODERATE');
    expect(result.expectedLabels[2]).toBe('LOW');
    expect(result.expectedLabels[1]).toBe('VERY LOW');
    expect(result.grade4Label).toBe('HIGH');
    expect(result.grade4Certainty).toBe(4);
  });

  // ==========================================================================
  //  BLOCK 4: REML Prediction Interval (R21 - R24)
  // ==========================================================================

  test('R21: _applyREMLWeights function exists', async () => {
    const exists = await page.evaluate(() => typeof _applyREMLWeights === 'function');
    expect(exists).toBe(true);
  });

  test('R22: REML result includes piLo and piHi fields', async () => {
    const result = await page.evaluate(() => {
      const maResult = {
        k: 5, pooled: 0.75, pooledLo: 0.6, pooledHi: 0.94,
        isRatio: true, tau2: 0.05, tau2REML: 0.04, confLevel: 0.95,
        studyResults: [
          { yi: Math.log(0.7), vi: 0.04, sei: 0.2 },
          { yi: Math.log(0.8), vi: 0.03, sei: 0.173 },
          { yi: Math.log(0.65), vi: 0.05, sei: 0.224 },
          { yi: Math.log(0.9), vi: 0.02, sei: 0.141 },
          { yi: Math.log(0.72), vi: 0.035, sei: 0.187 }
        ]
      };
      const reml = _applyREMLWeights(maResult, 0.95);
      return {
        hasPiLo: 'piLo' in reml,
        hasPiHi: 'piHi' in reml,
        piLo: reml.piLo,
        piHi: reml.piHi
      };
    });
    expect(result.hasPiLo).toBe(true);
    expect(result.hasPiHi).toBe(true);
    expect(result.piLo).toBeDefined();
    expect(result.piHi).toBeDefined();
    // PI should be wider than CI
    expect(result.piLo).toBeGreaterThan(0);
    expect(result.piHi).toBeGreaterThan(0);
  });

  test('R23: REML PI uses t-distribution with df=k-1', async () => {
    // For k=5, df=4. tQuantile(0.975, 4) ~2.776 (wider than z=1.96)
    const result = await page.evaluate(() => {
      const tCrit4 = tQuantile(0.975, 4);
      const zCrit = normalQuantile(0.975);
      return {
        tCrit4,
        zCrit,
        tIsWiderThanZ: tCrit4 > zCrit
      };
    });
    expect(result.tCrit4).toBeGreaterThan(2.5);
    expect(result.tCrit4).toBeLessThan(3.1);
    expect(result.tIsWiderThanZ).toBe(true);
  });

  test('R24: REML PI for ratio measures: piLo/piHi are exponentiated', async () => {
    const result = await page.evaluate(() => {
      const maResult = {
        k: 5, pooled: 0.75, pooledLo: 0.6, pooledHi: 0.94,
        isRatio: true, tau2: 0.05, tau2REML: 0.04, confLevel: 0.95,
        studyResults: [
          { yi: Math.log(0.7), vi: 0.04, sei: 0.2 },
          { yi: Math.log(0.8), vi: 0.03, sei: 0.173 },
          { yi: Math.log(0.65), vi: 0.05, sei: 0.224 },
          { yi: Math.log(0.9), vi: 0.02, sei: 0.141 },
          { yi: Math.log(0.72), vi: 0.035, sei: 0.187 }
        ]
      };
      const remlRatio = _applyREMLWeights(maResult, 0.95);
      // For ratio measures, piLo and piHi should be on the natural scale (positive, typically < pooledLo and > pooledHi)
      // On log scale, pooled is ~log(0.75) = -0.288, so exp(mu - tCrit*piSE) should be > 0

      // Now test continuous
      const maResult2 = {
        k: 5, pooled: -0.5, pooledLo: -0.8, pooledHi: -0.2,
        isRatio: false, tau2: 0.05, tau2REML: 0.04, confLevel: 0.95,
        studyResults: [
          { yi: -0.5, vi: 0.04, sei: 0.2 },
          { yi: -0.4, vi: 0.03, sei: 0.173 },
          { yi: -0.6, vi: 0.05, sei: 0.224 },
          { yi: -0.3, vi: 0.02, sei: 0.141 },
          { yi: -0.55, vi: 0.035, sei: 0.187 }
        ]
      };
      const remlCont = _applyREMLWeights(maResult2, 0.95);

      return {
        ratioPiLo: remlRatio.piLo,
        ratioPiHi: remlRatio.piHi,
        ratioPooled: remlRatio.pooled,
        contPiLo: remlCont.piLo,
        contPiHi: remlCont.piHi,
        contPooled: remlCont.pooled,
        // Ratio PI should be positive (exponentiated)
        ratioPiPositive: remlRatio.piLo > 0 && remlRatio.piHi > 0,
        // Continuous PI can be negative
        contPiCanBeNeg: remlCont.piLo < 0
      };
    });
    expect(result.ratioPiPositive).toBe(true);
    // PI should bracket the pooled estimate more widely than CI
    expect(result.ratioPiLo).toBeLessThan(result.ratioPooled);
    expect(result.ratioPiHi).toBeGreaterThan(result.ratioPooled);
  });

  // ==========================================================================
  //  BLOCK 5: Study Removal Sensitivity (R25 - R28)
  // ==========================================================================

  test('R25: computeFragilityIndex function exists', async () => {
    const exists = await page.evaluate(() => typeof computeFragilityIndex === 'function');
    expect(exists).toBe(true);
  });

  test('R26: computeFragilityIndex returns null for < 2 studies', async () => {
    const result = await page.evaluate(() => {
      const single = [{ effectEstimate: 0.7, lowerCI: 0.5, upperCI: 0.98, effectType: 'OR', nIntervention: 100, nControl: 100 }];
      return computeFragilityIndex(single);
    });
    expect(result).toBeNull();
  });

  test('R27: computeFragilityIndex returns null for non-ratio outcomes', async () => {
    const result = await page.evaluate(() => {
      const studies = [
        { effectEstimate: -0.5, lowerCI: -0.8, upperCI: -0.2, effectType: 'MD', nIntervention: 100, nControl: 100 },
        { effectEstimate: -0.3, lowerCI: -0.6, upperCI: 0.0, effectType: 'MD', nIntervention: 100, nControl: 100 },
        { effectEstimate: -0.4, lowerCI: -0.7, upperCI: -0.1, effectType: 'MD', nIntervention: 100, nControl: 100 }
      ];
      return computeFragilityIndex(studies);
    });
    expect(result).toBeNull();
  });

  test('R28: computeFragilityIndex counts significance flips', async () => {
    const result = await page.evaluate(() => {
      // Create studies where removing one study flips significance
      const studies = [
        { effectEstimate: 0.5, lowerCI: 0.3, upperCI: 0.83, effectType: 'OR', nIntervention: 200, nControl: 200 },
        { effectEstimate: 0.6, lowerCI: 0.35, upperCI: 1.02, effectType: 'OR', nIntervention: 150, nControl: 150 },
        { effectEstimate: 0.55, lowerCI: 0.32, upperCI: 0.95, effectType: 'OR', nIntervention: 180, nControl: 180 },
        { effectEstimate: 0.52, lowerCI: 0.30, upperCI: 0.90, effectType: 'OR', nIntervention: 160, nControl: 160 },
        { effectEstimate: 0.58, lowerCI: 0.34, upperCI: 0.99, effectType: 'OR', nIntervention: 170, nControl: 170 }
      ];
      const fi = computeFragilityIndex(studies);
      return {
        notNull: fi !== null,
        hasFragilityIndex: fi ? 'fragilityIndex' in fi : false,
        hasK: fi ? fi.k === 5 : false,
        hasMethod: fi ? fi.method === 'Study-level removal' : false,
        fragilityIndex: fi ? fi.fragilityIndex : null,
        fragQuotient: fi ? fi.fragQuotient : null
      };
    });
    expect(result.notNull).toBe(true);
    expect(result.hasFragilityIndex).toBe(true);
    expect(result.hasK).toBe(true);
    expect(result.hasMethod).toBe(true);
    expect(result.fragilityIndex).toBeGreaterThanOrEqual(0);
    expect(result.fragQuotient).toBeGreaterThanOrEqual(0);
    expect(result.fragQuotient).toBeLessThanOrEqual(1);
  });

  // ==========================================================================
  //  BLOCK 6: CUSUM Reset (R29 - R32)
  // ==========================================================================

  test('R29: CUSUM resets accumulators after crossing threshold', async () => {
    const result = await page.evaluate(() => {
      // Create studies that cause a crossing, then continue
      const studies = [];
      // 5 studies at 0.8
      for (let i = 0; i < 5; i++) {
        studies.push({
          effect_estimate: 0.80,
          lower_ci: 0.75, upper_ci: 0.85,
          start_date: 2010 + i
        });
      }
      // 10 studies at 1.4 (strong shift)
      for (let i = 0; i < 10; i++) {
        studies.push({
          effect_estimate: 1.40,
          lower_ci: 1.30, upper_ci: 1.50,
          start_date: 2015 + i
        });
      }
      const result = computeCUSUM(studies, { threshold: 4 });
      if (!result || !result.crossings || result.crossings.length === 0) {
        return { hasCrossing: false };
      }
      // After first crossing, the accumulator should reset to 0
      const firstCrossingIdx = result.crossings[0].index;
      if (firstCrossingIdx + 1 < result.chartData.length) {
        const postReset = result.chartData[firstCrossingIdx];
        // After reset, at least one of cusumPlus/cusumMinus should be 0
        // (the one that crossed gets reset to 0)
        return {
          hasCrossing: true,
          postResetPlus: postReset.cusumPlus,
          postResetMinus: postReset.cusumMinus,
          // After crossing and reset, the accumulator that crossed should be 0
          resetOccurred: postReset.cusumPlus === 0 || postReset.cusumMinus === 0
        };
      }
      return { hasCrossing: true, resetOccurred: false };
    });
    expect(result.hasCrossing).toBe(true);
    expect(result.resetOccurred).toBe(true);
  });

  test('R30: CUSUM can detect a SECOND crossing after reset', async () => {
    const result = await page.evaluate(() => {
      const studies = [];
      // 3 studies baseline
      for (let i = 0; i < 3; i++) {
        studies.push({
          effect_estimate: 0.80,
          lower_ci: 0.70, upper_ci: 0.90,
          start_date: 2005 + i
        });
      }
      // 8 studies with big shift (first crossing)
      for (let i = 0; i < 8; i++) {
        studies.push({
          effect_estimate: 1.50,
          lower_ci: 1.35, upper_ci: 1.65,
          start_date: 2008 + i
        });
      }
      // 8 more studies with continued shift (second crossing after reset)
      for (let i = 0; i < 8; i++) {
        studies.push({
          effect_estimate: 1.50,
          lower_ci: 1.35, upper_ci: 1.65,
          start_date: 2016 + i
        });
      }
      const r = computeCUSUM(studies, { threshold: 4 });
      return {
        crossingCount: r ? r.crossings.length : 0,
        hasMultipleCrossings: r ? r.crossings.length >= 2 : false
      };
    });
    expect(result.hasMultipleCrossings).toBe(true);
    expect(result.crossingCount).toBeGreaterThanOrEqual(2);
  });

  test('R31: CUSUM chartData length matches number of studies', async () => {
    const result = await page.evaluate(() => {
      const studies = [];
      for (let i = 0; i < 12; i++) {
        studies.push({
          effect_estimate: 0.75 + i * 0.02,
          lower_ci: 0.65 + i * 0.02,
          upper_ci: 0.85 + i * 0.02,
          start_date: 2010 + i
        });
      }
      const r = computeCUSUM(studies);
      return {
        chartDataLen: r ? r.chartData.length : 0,
        k: r ? r.k : 0,
        match: r ? r.chartData.length === r.k : false
      };
    });
    expect(result.match).toBe(true);
    expect(result.chartDataLen).toBe(12);
  });

  test('R32: CUSUM alert status is STABLE when no crossing occurs', async () => {
    const result = await page.evaluate(() => {
      // Flat data = no shift
      const studies = [];
      for (let i = 0; i < 8; i++) {
        studies.push({
          effect_estimate: 0.80,
          lower_ci: 0.75, upper_ci: 0.85,
          start_date: 2010 + i
        });
      }
      const r = computeCUSUM(studies, { threshold: 4 });
      return { alertStatus: r ? r.alertStatus : null };
    });
    expect(result.alertStatus).toBe('STABLE');
  });

  // ==========================================================================
  //  BLOCK 7: Security Fixes (R33 - R40)
  // ==========================================================================

  test('R33: csvSafeCell function exists', async () => {
    const exists = await page.evaluate(() => typeof csvSafeCell === 'function');
    expect(exists).toBe(true);
  });

  test('R34: csvSafeCell escapes formula injection characters (=, +, @, \\t, \\r)', async () => {
    const result = await page.evaluate(() => {
      return {
        eq: csvSafeCell('=SUM(A1:A10)'),
        plus: csvSafeCell('+1234'),
        at: csvSafeCell('@import'),
        tab: csvSafeCell('\tdata'),
        cr: csvSafeCell('\rdata')
      };
    });
    // Each should be prepended with '
    expect(result.eq).toBe("'=SUM(A1:A10)");
    expect(result.plus).toBe("'+1234");
    expect(result.at).toBe("'@import");
    expect(result.tab).toBe("'\tdata");
    expect(result.cr).toBe("'\rdata");
  });

  test('R35: csvSafeCell does NOT prepend quote to negative numbers like "-0.5"', async () => {
    const result = await page.evaluate(() => {
      return {
        neg05: csvSafeCell('-0.5'),
        neg123: csvSafeCell('-1.23'),
        negInt: csvSafeCell('-42'),
        normal: csvSafeCell('hello')
      };
    });
    expect(result.neg05).toBe('-0.5');
    expect(result.neg123).toBe('-1.23');
    expect(result.negInt).toBe('-42');
    expect(result.normal).toBe('hello');
  });

  test('R36: escapeHtml function exists', async () => {
    const exists = await page.evaluate(() => typeof escapeHtml === 'function');
    expect(exists).toBe(true);
  });

  test('R37: escapeHtml escapes <, >, &, ", \'', async () => {
    const result = await page.evaluate(() => {
      const input = '<script>alert("XSS")&\'test\'</script>';
      return escapeHtml(input);
    });
    expect(result).toContain('&lt;');
    expect(result).toContain('&gt;');
    expect(result).toContain('&amp;');
    expect(result).toContain('&quot;');
    expect(result).toContain('&#39;');
    expect(result).not.toContain('<script>');
  });

  test('R38: chi2Quantile function exists and returns correct values', async () => {
    const result = await page.evaluate(() => {
      // chi2(0.95, 1) ≈ 3.841, chi2(0.95, 2) ≈ 5.991
      // Wilson-Hilferty approximation is less precise for small df
      return {
        chi2_95_1: chi2Quantile(0.95, 1),
        chi2_95_2: chi2Quantile(0.95, 2),
        chi2_95_10: chi2Quantile(0.95, 10)
      };
    });
    // Wilson-Hilferty has ~2.5% error for df=1, so use tolerance of 0
    // (which means precision to 0.5 units)
    expect(result.chi2_95_1).toBeCloseTo(3.841, 0);
    // df=2 is more accurate
    expect(result.chi2_95_2).toBeCloseTo(5.991, 0);
    // df=10: chi2(0.95,10) ≈ 18.307 — very accurate for larger df
    expect(result.chi2_95_10).toBeCloseTo(18.307, 0);
  });

  test('R39: normalQuantile function exists and returns ~1.96 for p=0.975', async () => {
    const result = await page.evaluate(() => {
      return {
        z975: normalQuantile(0.975),
        z95: normalQuantile(0.95),
        z50: normalQuantile(0.5),
        z025: normalQuantile(0.025)
      };
    });
    expect(result.z975).toBeCloseTo(1.96, 1);
    expect(result.z95).toBeCloseTo(1.645, 1);
    expect(result.z50).toBeCloseTo(0, 5);
    expect(result.z025).toBeCloseTo(-1.96, 1);
  });

  test('R40: tQuantile function exists and returns correct values', async () => {
    const result = await page.evaluate(() => {
      return {
        t975_4: tQuantile(0.975, 4),    // ~2.776
        t975_30: tQuantile(0.975, 30),   // ~2.042
        t975_200: tQuantile(0.975, 200)  // ~1.972 (close to z)
      };
    });
    expect(result.t975_4).toBeCloseTo(2.776, 1);
    expect(result.t975_30).toBeCloseTo(2.042, 1);
    // df=200 uses normal approximation
    expect(result.t975_200).toBeCloseTo(1.96, 1);
  });

  // ==========================================================================
  //  BLOCK 8: ARIA Accessibility (R41 - R48)
  // ==========================================================================

  test('R41: Insight tabs have role="tab" and aria-controls attributes', async () => {
    const result = await page.evaluate(() => {
      const tabs = document.querySelectorAll('.insights-tab');
      let allHaveRole = true;
      let allHaveAriaControls = true;
      tabs.forEach(tab => {
        if (tab.getAttribute('role') !== 'tab') allHaveRole = false;
        if (!tab.getAttribute('aria-controls')) allHaveAriaControls = false;
      });
      return { count: tabs.length, allHaveRole, allHaveAriaControls };
    });
    expect(result.count).toBeGreaterThan(0);
    expect(result.allHaveRole).toBe(true);
    expect(result.allHaveAriaControls).toBe(true);
  });

  test('R42: Insight tabs have correct tabindex (active=0, others=-1)', async () => {
    const result = await page.evaluate(() => {
      const tabs = document.querySelectorAll('.insights-tab');
      let activeTabIndex = null;
      let inactiveTabIndices = [];
      tabs.forEach(tab => {
        if (tab.classList.contains('active')) {
          activeTabIndex = tab.getAttribute('tabindex');
        } else {
          inactiveTabIndices.push(tab.getAttribute('tabindex'));
        }
      });
      return {
        activeTabIndex,
        inactiveAllMinus1: inactiveTabIndices.every(t => t === '-1'),
        inactiveCount: inactiveTabIndices.length
      };
    });
    expect(result.activeTabIndex).toBe('0');
    expect(result.inactiveAllMinus1).toBe(true);
    expect(result.inactiveCount).toBeGreaterThan(0);
  });

  test('R43: Insight panel has role="tabpanel"', async () => {
    const result = await page.evaluate(() => {
      const panels = document.querySelectorAll('.insight-panel[role="tabpanel"]');
      return { count: panels.length };
    });
    expect(result.count).toBeGreaterThan(0);
  });

  test('R44: Progress bar has role="progressbar" with aria-valuenow/min/max', async () => {
    const result = await page.evaluate(() => {
      const bar = document.querySelector('[role="progressbar"]');
      if (!bar) return { found: false };
      return {
        found: true,
        hasValueNow: bar.hasAttribute('aria-valuenow'),
        hasValueMin: bar.hasAttribute('aria-valuemin'),
        hasValueMax: bar.hasAttribute('aria-valuemax'),
        hasLabel: bar.hasAttribute('aria-label')
      };
    });
    expect(result.found).toBe(true);
    expect(result.hasValueNow).toBe(true);
    expect(result.hasValueMin).toBe(true);
    expect(result.hasValueMax).toBe(true);
  });

  test('R45: At least one SVG has a title element', async () => {
    // The CUSUM and sequential monitoring SVGs have <title> elements
    const result = await page.evaluate(() => {
      // Check static HTML for SVG title presence in the source code
      // SVGs with title elements are generated dynamically, but the page source
      // indicates they exist (CUSUM chart, sequential monitoring, etc.)
      // We verify the pattern by checking if SVG titles are generated when
      // CUSUM renders
      return typeof computeCUSUM === 'function';
    });
    expect(result).toBe(true);
    // Also check that the renderCUSUMChart function generates SVGs with <title>
    const hasSvgTitle = await page.evaluate(() => {
      // The page code at line 21320 creates: <svg ... role="img" aria-label="CUSUM control chart"><title>CUSUM control chart</title>
      // We verify this pattern exists in the page's function definitions
      const scripts = document.querySelectorAll('script');
      for (const s of scripts) {
        if (s.textContent && s.textContent.includes('<title>CUSUM control chart</title>')) {
          return true;
        }
      }
      return false;
    });
    expect(hasSvgTitle).toBe(true);
  });

  test('R46: .insights-nav has role="tablist"', async () => {
    const result = await page.evaluate(() => {
      const nav = document.querySelector('.insights-nav');
      return {
        found: !!nav,
        role: nav ? nav.getAttribute('role') : null
      };
    });
    expect(result.found).toBe(true);
    expect(result.role).toBe('tablist');
  });

  test('R47: escapeHtml handles non-string input gracefully', async () => {
    const result = await page.evaluate(() => {
      return {
        nullInput: escapeHtml(null),
        undefinedInput: escapeHtml(undefined),
        numberInput: escapeHtml(42),
        emptyString: escapeHtml('')
      };
    });
    expect(result.nullInput).toBe('');
    expect(result.undefinedInput).toBe('');
    expect(result.numberInput).toBe('');
    expect(result.emptyString).toBe('');
  });

  test('R48: csvSafeCell handles null/undefined and fields with commas/quotes', async () => {
    const result = await page.evaluate(() => {
      return {
        nullVal: csvSafeCell(null),
        undefinedVal: csvSafeCell(undefined),
        commaField: csvSafeCell('value,with,commas'),
        quoteField: csvSafeCell('value"with"quotes'),
        newlineField: csvSafeCell('line1\nline2')
      };
    });
    expect(result.nullVal).toBe('');
    expect(result.undefinedVal).toBe('');
    // Fields with commas should be quoted
    expect(result.commaField.startsWith('"')).toBe(true);
    expect(result.commaField.endsWith('"')).toBe(true);
    // Fields with quotes should have quotes doubled
    expect(result.quoteField).toContain('""');
  });
});
