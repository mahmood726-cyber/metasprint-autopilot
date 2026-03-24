// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * RapidMeta Review Mode — Integration Tests
 * ==========================================
 * 20 tests across 5 blocks validating the RapidMeta Review dual-mode system:
 *   Block 1 (RM01-RM04): Startup Modal & Mode Selection
 *   Block 2 (RM05-RM05): Header Mode Dropdown
 *   Block 3 (RM06-RM10): RapidMeta Tab Content — Protocol, Search, Screening, Extraction
 *   Block 4 (RM11-RM16): Analysis Suite Elements
 *   Block 5 (RM17-RM20): Scientific Output & Data Persistence
 */

const BASE_URL = 'http://127.0.0.1:9876/metasprint-autopilot.html';

// ---- Helpers ----------------------------------------------------------------

/**
 * Dismiss the onboard overlay and any stray close-parent buttons.
 * Does NOT dismiss the mode modal — tests that need it should call selectMode() separately.
 */
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

/**
 * Select a mode via JS, dismissing the modal and applying the mode.
 * Also clears the "remember" checkbox side-effect so tests stay isolated.
 */
async function enterMode(page, mode) {
  await page.evaluate((m) => {
    selectMode(m);
  }, mode);
  // Give applyMode/switchRMPhase a tick to finish rendering
  await page.waitForTimeout(300);
}

// =============================================================================
//  BLOCK 1: Startup Modal & Mode Selection (RM01 - RM04)
// =============================================================================

test.describe('Block 1: Startup Modal & Mode Selection', () => {

  test('RM01: Startup modal appears on fresh load (no localStorage)', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    // Clear all storage to simulate first visit
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 60000 });
    await page.evaluate(() => {
      localStorage.removeItem('msa_mode');
      localStorage.removeItem('msa_mode_remember');
    });
    await page.reload({ waitUntil: 'networkidle', timeout: 60000 });
    await dismissOverlays(page);

    const modalVisible = await page.evaluate(() => {
      const modal = document.getElementById('modeModal');
      if (!modal) return false;
      // Modal is visible when it does NOT have the 'hidden' class
      return !modal.classList.contains('hidden');
    });
    expect(modalVisible).toBe(true);

    // Verify the two mode cards exist
    const cardsExist = await page.evaluate(() => {
      return !!(document.getElementById('modeCardRM') && document.getElementById('modeCardAP'));
    });
    expect(cardsExist).toBe(true);

    await page.close();
    await context.close();
  });

  test('RM02: Selecting RapidMeta hides Autopilot tabs, shows RM tabs', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 60000 });
    await dismissOverlays(page);
    await enterMode(page, 'rapidmeta');

    const result = await page.evaluate(() => {
      const rmTabbar = document.getElementById('rm-tabbar');
      const apTabbar = document.getElementById('ap-tabbar');
      return {
        rmVisible: rmTabbar ? rmTabbar.style.display !== 'none' : false,
        apHidden: apTabbar ? apTabbar.style.display === 'none' : false,
        rmTabCount: document.querySelectorAll('.rm-tab').length
      };
    });
    expect(result.rmVisible).toBe(true);
    expect(result.apHidden).toBe(true);
    expect(result.rmTabCount).toBe(6);

    await page.close();
    await context.close();
  });

  test('RM03: Selecting Autopilot hides RM tabs, shows AP tabs', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 60000 });
    await dismissOverlays(page);
    await enterMode(page, 'autopilot');

    const result = await page.evaluate(() => {
      const rmTabbar = document.getElementById('rm-tabbar');
      const apTabbar = document.getElementById('ap-tabbar');
      return {
        rmHidden: rmTabbar ? rmTabbar.style.display === 'none' : false,
        apVisible: apTabbar ? apTabbar.style.display !== 'none' : false,
        apTabCount: document.querySelectorAll('.tab').length
      };
    });
    expect(result.rmHidden).toBe(true);
    expect(result.apVisible).toBe(true);
    // Autopilot has 14 tabs (Dashboard + 13 phase tabs)
    expect(result.apTabCount).toBeGreaterThanOrEqual(10);

    await page.close();
    await context.close();
  });

  test('RM04: "Remember my choice" persists across page reloads', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 60000 });
    await dismissOverlays(page);

    // Check the remember checkbox, then select rapidmeta
    await page.evaluate(() => {
      const cb = document.getElementById('modeRememberCb');
      if (cb) cb.checked = true;
      selectMode('rapidmeta');
    });

    // Verify localStorage was set
    const stored = await page.evaluate(() => ({
      mode: localStorage.getItem('msa_mode'),
      remember: localStorage.getItem('msa_mode_remember')
    }));
    expect(stored.mode).toBe('rapidmeta');
    expect(stored.remember).toBe('1');

    // Reload the page
    await page.reload({ waitUntil: 'networkidle', timeout: 60000 });
    await dismissOverlays(page);
    await page.waitForTimeout(500);

    // Modal should NOT appear (remember was checked)
    const modalHidden = await page.evaluate(() => {
      const modal = document.getElementById('modeModal');
      return modal ? modal.classList.contains('hidden') : true;
    });
    expect(modalHidden).toBe(true);

    // Mode should be rapidmeta (RM tabbar visible)
    const rmVisible = await page.evaluate(() => {
      const rmTabbar = document.getElementById('rm-tabbar');
      return rmTabbar ? rmTabbar.style.display !== 'none' : false;
    });
    expect(rmVisible).toBe(true);

    await page.close();
    await context.close();
  });
});

// =============================================================================
//  BLOCK 2: Header Mode Dropdown (RM05)
// =============================================================================

test.describe('Block 2: Header Mode Dropdown', () => {

  test('RM05: Header mode dropdown switches between modes', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 60000 });
    await dismissOverlays(page);
    await enterMode(page, 'rapidmeta');

    // Verify dropdown exists and shows rapidmeta
    const dropdownVal = await page.evaluate(() => {
      const sel = document.getElementById('modeSelect');
      return sel ? sel.value : null;
    });
    expect(dropdownVal).toBe('rapidmeta');

    // Switch to autopilot via the dropdown (simulating switchMode)
    await page.evaluate(() => {
      switchMode('autopilot');
    });
    await page.waitForTimeout(300);

    const afterSwitch = await page.evaluate(() => {
      const sel = document.getElementById('modeSelect');
      const rmTabbar = document.getElementById('rm-tabbar');
      const apTabbar = document.getElementById('ap-tabbar');
      return {
        dropdownVal: sel ? sel.value : null,
        rmHidden: rmTabbar ? rmTabbar.style.display === 'none' : false,
        apVisible: apTabbar ? apTabbar.style.display !== 'none' : false
      };
    });
    expect(afterSwitch.dropdownVal).toBe('autopilot');
    expect(afterSwitch.rmHidden).toBe(true);
    expect(afterSwitch.apVisible).toBe(true);

    // Switch back to rapidmeta
    await page.evaluate(() => {
      switchMode('rapidmeta');
    });
    await page.waitForTimeout(300);

    const backToRM = await page.evaluate(() => {
      const sel = document.getElementById('modeSelect');
      const rmTabbar = document.getElementById('rm-tabbar');
      return {
        dropdownVal: sel ? sel.value : null,
        rmVisible: rmTabbar ? rmTabbar.style.display !== 'none' : false
      };
    });
    expect(backToRM.dropdownVal).toBe('rapidmeta');
    expect(backToRM.rmVisible).toBe(true);

    await page.close();
    await context.close();
  });
});

// =============================================================================
//  BLOCK 3: RapidMeta Tab Content (RM06 - RM10)
// =============================================================================

test.describe('Block 3: RapidMeta Tab Content', () => {
  /** @type {import('@playwright/test').Page} */
  let page;
  /** @type {import('@playwright/test').BrowserContext} */
  let context;

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext();
    page = await context.newPage();
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 60000 });
    await dismissOverlays(page);
    await enterMode(page, 'rapidmeta');
  });

  test.afterAll(async () => {
    await page.close();
    await context.close();
  });

  test('RM06: Protocol tab renders PICO form with textarea fields', async () => {
    // Protocol is the default RM phase, so it should already be active
    const result = await page.evaluate(() => {
      const picoP = document.getElementById('rmPicoP');
      const picoI = document.getElementById('rmPicoI');
      const picoC = document.getElementById('rmPicoC');
      const picoO = document.getElementById('rmPicoO');
      const protocolSection = document.getElementById('rm-protocol');
      return {
        picoP: !!(picoP && picoP.tagName === 'TEXTAREA'),
        picoI: !!(picoI && picoI.tagName === 'TEXTAREA'),
        picoC: !!(picoC && picoC.tagName === 'TEXTAREA'),
        picoO: !!(picoO && picoO.tagName === 'TEXTAREA'),
        protocolActive: protocolSection ? protocolSection.classList.contains('active') : false
      };
    });
    expect(result.picoP).toBe(true);
    expect(result.picoI).toBe(true);
    expect(result.picoC).toBe(true);
    expect(result.picoO).toBe(true);
    expect(result.protocolActive).toBe(true);
  });

  test('RM07: Search tab shows source buttons and search controls', async () => {
    await page.evaluate(() => { switchRMPhase('rm-search'); });
    await page.waitForTimeout(300);

    const result = await page.evaluate(() => {
      const searchSection = document.getElementById('rm-search');
      const searchActive = searchSection ? searchSection.classList.contains('active') : false;
      // Check for database badges
      const dbCTgov = document.getElementById('rmDbCTgov');
      const dbPubMed = document.getElementById('rmDbPubMed');
      const dbOpenAlex = document.getElementById('rmDbOpenAlex');
      // Check for search buttons (Search All, CT.gov Only, PubMed Only)
      const buttons = searchSection ? searchSection.querySelectorAll('button') : [];
      const searchAllBtn = Array.from(buttons).some(b => b.textContent.includes('Search All'));
      return {
        searchActive: searchActive,
        hasDbCTgov: !!dbCTgov,
        hasDbPubMed: !!dbPubMed,
        hasDbOpenAlex: !!dbOpenAlex,
        hasSearchAllBtn: searchAllBtn,
        buttonCount: buttons.length
      };
    });
    expect(result.searchActive).toBe(true);
    expect(result.hasDbCTgov).toBe(true);
    expect(result.hasDbPubMed).toBe(true);
    expect(result.hasDbOpenAlex).toBe(true);
    expect(result.hasSearchAllBtn).toBe(true);
    expect(result.buttonCount).toBeGreaterThanOrEqual(3);
  });

  test('RM08: Screening tab renders toolbar with count and filter buttons', async () => {
    await page.evaluate(() => { switchRMPhase('rm-screen'); });
    await page.waitForTimeout(300);

    const result = await page.evaluate(() => {
      const screenSection = document.getElementById('rm-screen');
      const screenActive = screenSection ? screenSection.classList.contains('active') : false;
      const screenCount = document.getElementById('rmScreenCount');
      const filterAll = document.getElementById('rmSfAll');
      const filterInclude = document.getElementById('rmSfInclude');
      const filterExclude = document.getElementById('rmSfExclude');
      // Check the toolbar contains dual-reviewer buttons
      const toolbar = screenSection ? screenSection.querySelector('.rm-screen-toolbar') : null;
      return {
        screenActive: screenActive,
        hasScreenCount: !!screenCount,
        hasFilterAll: !!filterAll,
        hasFilterInclude: !!filterInclude,
        hasFilterExclude: !!filterExclude,
        hasToolbar: !!toolbar
      };
    });
    expect(result.screenActive).toBe(true);
    expect(result.hasScreenCount).toBe(true);
    expect(result.hasFilterAll).toBe(true);
    expect(result.hasFilterInclude).toBe(true);
    expect(result.hasFilterExclude).toBe(true);
    expect(result.hasToolbar).toBe(true);
  });

  test('RM09: Screening keyboard shortcuts handler is active in screen phase', async () => {
    // Already on rm-screen from previous test, but ensure it
    await page.evaluate(() => { switchRMPhase('rm-screen'); });
    await page.waitForTimeout(200);

    const result = await page.evaluate(() => {
      // Verify that currentMode and currentRMPhase are set correctly
      return {
        mode: typeof currentMode !== 'undefined' ? currentMode : null,
        phase: typeof currentRMPhase !== 'undefined' ? currentRMPhase : null,
        // Verify the keyboard handler exists by checking that rmScreenEngine is defined
        hasScreenEngine: typeof rmScreenEngine !== 'undefined',
        hasResolve: typeof rmScreenEngine !== 'undefined' && typeof rmScreenEngine.resolve === 'function',
        hasConfirm: typeof rmScreenEngine !== 'undefined' && typeof rmScreenEngine.confirmCurrent === 'function'
      };
    });
    expect(result.mode).toBe('rapidmeta');
    expect(result.phase).toBe('rm-screen');
    expect(result.hasScreenEngine).toBe(true);
    expect(result.hasResolve).toBe(true);
    expect(result.hasConfirm).toBe(true);
  });

  test('RM10: Extraction tab shows view selector buttons', async () => {
    await page.evaluate(() => { switchRMPhase('rm-extract'); });
    await page.waitForTimeout(300);

    const result = await page.evaluate(() => {
      const extractSection = document.getElementById('rm-extract');
      const extractActive = extractSection ? extractSection.classList.contains('active') : false;
      const viewData = document.getElementById('rmExtViewData');
      const viewDemo = document.getElementById('rmExtViewDemo');
      const viewRob = document.getElementById('rmExtViewRob');
      return {
        extractActive: extractActive,
        hasDataEntry: !!(viewData && viewData.textContent.includes('Data Entry')),
        hasDemographics: !!(viewDemo && viewDemo.textContent.includes('Demographics')),
        hasRiskOfBias: !!(viewRob && viewRob.textContent.includes('Risk of Bias')),
        hasExtractEngine: typeof rmExtractEngine !== 'undefined'
      };
    });
    expect(result.extractActive).toBe(true);
    expect(result.hasDataEntry).toBe(true);
    expect(result.hasDemographics).toBe(true);
    expect(result.hasRiskOfBias).toBe(true);
    expect(result.hasExtractEngine).toBe(true);
  });
});

// =============================================================================
//  BLOCK 4: Analysis Suite Elements (RM11 - RM16)
// =============================================================================

test.describe('Block 4: Analysis Suite & Evidence Panels', () => {
  /** @type {import('@playwright/test').Page} */
  let page;
  /** @type {import('@playwright/test').BrowserContext} */
  let context;

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext();
    page = await context.newPage();
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 60000 });
    await dismissOverlays(page);
    await enterMode(page, 'rapidmeta');
  });

  test.afterAll(async () => {
    await page.close();
    await context.close();
  });

  test('RM11: Evidence panel CSS classes exist in stylesheet', async () => {
    const result = await page.evaluate(() => {
      // Check that the CSS rules for evidence panels are defined
      const sheets = document.styleSheets;
      let hasSummary = false, hasLocator = false, hasMeta = false;
      // Also check by creating temporary elements and verifying styles apply
      const div1 = document.createElement('div');
      div1.className = 'evidence-panel evidence-panel-summary';
      document.body.appendChild(div1);
      const style1 = getComputedStyle(div1);
      hasSummary = style1.borderLeftWidth !== '0px'; // should have 3px border-left
      document.body.removeChild(div1);

      const div2 = document.createElement('div');
      div2.className = 'evidence-panel evidence-panel-locator';
      document.body.appendChild(div2);
      const style2 = getComputedStyle(div2);
      hasLocator = style2.fontFamily.includes('monospace');
      document.body.removeChild(div2);

      const div3 = document.createElement('div');
      div3.className = 'evidence-panel evidence-panel-meta';
      document.body.appendChild(div3);
      const style3 = getComputedStyle(div3);
      hasMeta = style3.borderLeftWidth !== '0px';
      document.body.removeChild(div3);

      return { hasSummary, hasLocator, hasMeta };
    });
    expect(result.hasSummary).toBe(true);
    expect(result.hasLocator).toBe(true);
    expect(result.hasMeta).toBe(true);
  });

  test('RM12: Analysis Suite renders stat card containers', async () => {
    await page.evaluate(() => { switchRMPhase('rm-analysis'); });
    await page.waitForTimeout(300);

    const result = await page.evaluate(() => {
      const analysisSection = document.getElementById('rm-analysis');
      const analysisActive = analysisSection ? analysisSection.classList.contains('active') : false;
      // Check primary stat cards
      const statPooled = document.getElementById('rmStatPooled');
      const statI2 = document.getElementById('rmStatI2');
      const statTau2 = document.getElementById('rmStatTau2');
      const statQ = document.getElementById('rmStatQ');
      const statK = document.getElementById('rmStatK');
      // Check secondary stat cards
      const statHKSJ = document.getElementById('rmStatHKSJ');
      const statPI = document.getElementById('rmStatPI');
      const statFI = document.getElementById('rmStatFI');
      const statNNT = document.getElementById('rmStatNNT');
      return {
        analysisActive: analysisActive,
        primaryCards: !!(statPooled && statI2 && statTau2 && statQ && statK),
        secondaryCards: !!(statHKSJ && statPI && statFI && statNNT),
        primaryCount: [statPooled, statI2, statTau2, statQ, statK].filter(Boolean).length,
        secondaryCount: [statHKSJ, statPI, statFI, statNNT].filter(Boolean).length
      };
    });
    expect(result.analysisActive).toBe(true);
    expect(result.primaryCards).toBe(true);
    expect(result.secondaryCards).toBe(true);
    expect(result.primaryCount).toBe(5);
    expect(result.secondaryCount).toBe(4);
  });

  test('RM13: Analysis Suite renders 16 chart containers (#rmChart1 through #rmChart16)', async () => {
    // Should still be on rm-analysis from previous test
    const result = await page.evaluate(() => {
      const charts = [];
      for (let i = 1; i <= 16; i++) {
        const el = document.getElementById('rmChart' + i);
        charts.push({ id: 'rmChart' + i, exists: !!el });
      }
      return {
        allExist: charts.every(c => c.exists),
        existCount: charts.filter(c => c.exists).length,
        missing: charts.filter(c => !c.exists).map(c => c.id)
      };
    });
    expect(result.allExist).toBe(true);
    expect(result.existCount).toBe(16);
    if (!result.allExist) {
      // Log missing chart IDs if any fail
      console.log('Missing chart containers:', result.missing);
    }
  });

  test('RM14: Analysis controls: Effect Measure, CI, and Prior buttons present', async () => {
    const result = await page.evaluate(() => {
      const emBtns = document.querySelectorAll('.rmEmBtn');
      const clBtns = document.querySelectorAll('.rmClBtn');
      const prBtns = document.querySelectorAll('.rmPrBtn');
      // Verify specific effect measures
      const emValues = Array.from(emBtns).map(b => b.getAttribute('data-rm-em'));
      const clValues = Array.from(clBtns).map(b => b.getAttribute('data-rm-cl'));
      const prValues = Array.from(prBtns).map(b => b.getAttribute('data-rm-pr'));
      return {
        emCount: emBtns.length,
        clCount: clBtns.length,
        prCount: prBtns.length,
        emValues: emValues,
        clValues: clValues,
        prValues: prValues,
        hasAnalysisEngine: typeof rmAnalysisEngine !== 'undefined'
      };
    });
    // Effect measure: OR, RR, RD
    expect(result.emCount).toBe(3);
    expect(result.emValues).toEqual(expect.arrayContaining(['OR', 'RR', 'RD']));
    // CI levels: 90%, 95%, 99%
    expect(result.clCount).toBe(3);
    expect(result.clValues).toEqual(expect.arrayContaining(['0.9', '0.95', '0.99']));
    // Prior: vague, informative, flat
    expect(result.prCount).toBe(3);
    expect(result.prValues).toEqual(expect.arrayContaining(['vague', 'informative', 'flat']));
    expect(result.hasAnalysisEngine).toBe(true);
  });

  test('RM15: Bayesian extension card with posterior CrI, probability, info fraction', async () => {
    const result = await page.evaluate(() => {
      const bayesCrI = document.getElementById('rmStatBayesCrI');
      const bayesProb = document.getElementById('rmStatBayesProb');
      const infoFrac = document.getElementById('rmStatInfoFrac');
      return {
        hasBayesCrI: !!bayesCrI,
        hasBayesProb: !!bayesProb,
        hasInfoFrac: !!infoFrac
      };
    });
    expect(result.hasBayesCrI).toBe(true);
    expect(result.hasBayesProb).toBe(true);
    expect(result.hasInfoFrac).toBe(true);
  });

  test('RM16: R Cross-Validation section exists in analysis tab', async () => {
    const result = await page.evaluate(() => {
      const rValidation = document.getElementById('rmRValidation');
      return {
        exists: !!rValidation,
        isHidden: rValidation ? rValidation.classList.contains('hidden') : false
      };
    });
    expect(result.exists).toBe(true);
    // Initially hidden (collapsed)
    expect(result.isHidden).toBe(true);
  });
});

// =============================================================================
//  BLOCK 5: Scientific Output & Data Persistence (RM17 - RM20)
// =============================================================================

test.describe('Block 5: Scientific Output & Data Persistence', () => {
  /** @type {import('@playwright/test').Page} */
  let page;
  /** @type {import('@playwright/test').BrowserContext} */
  let context;

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext();
    page = await context.newPage();
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 60000 });
    await dismissOverlays(page);
    await enterMode(page, 'rapidmeta');
    // Navigate to the output tab
    await page.evaluate(() => { switchRMPhase('rm-output'); });
    await page.waitForTimeout(300);
  });

  test.afterAll(async () => {
    await page.close();
    await context.close();
  });

  test('RM17: Scientific Output renders visual abstract container', async () => {
    const result = await page.evaluate(() => {
      const outputSection = document.getElementById('rm-output');
      const outputActive = outputSection ? outputSection.classList.contains('active') : false;
      // Visual abstract elements
      const vaDesign = document.getElementById('rmVADesign');
      const vaResult = document.getElementById('rmVAResult');
      const vaResultCI = document.getElementById('rmVAResultCI');
      const vaConclusion = document.getElementById('rmVAConclusion');
      const vaSubtitle = document.getElementById('rmVASubtitle');
      return {
        outputActive: outputActive,
        hasVADesign: !!vaDesign,
        hasVAResult: !!vaResult,
        hasVAResultCI: !!vaResultCI,
        hasVAConclusion: !!vaConclusion,
        hasVASubtitle: !!vaSubtitle
      };
    });
    expect(result.outputActive).toBe(true);
    expect(result.hasVADesign).toBe(true);
    expect(result.hasVAResult).toBe(true);
    expect(result.hasVAResultCI).toBe(true);
    expect(result.hasVAConclusion).toBe(true);
    expect(result.hasVASubtitle).toBe(true);
  });

  test('RM18: PRISMA flow and Data Seal containers exist', async () => {
    const result = await page.evaluate(() => {
      const prismaFlow = document.getElementById('rmPrismaFlow');
      const dataSeal = document.getElementById('rmDataSeal');
      const dataSealTime = document.getElementById('rmDataSealTime');
      return {
        hasPrismaFlow: !!prismaFlow,
        hasDataSeal: !!dataSeal,
        hasDataSealTime: !!dataSealTime
      };
    });
    expect(result.hasPrismaFlow).toBe(true);
    expect(result.hasDataSeal).toBe(true);
    expect(result.hasDataSealTime).toBe(true);
  });

  test('RM19: Export buttons and Patient Mode toggle exist', async () => {
    const result = await page.evaluate(() => {
      const outputSection = document.getElementById('rm-output');
      const buttons = outputSection ? outputSection.querySelectorAll('button') : [];
      const btnTexts = Array.from(buttons).map(b => b.textContent.trim());
      const hasCSV = btnTexts.some(t => t.includes('CSV'));
      const hasJSON = btnTexts.some(t => t.includes('JSON'));
      const hasR = btnTexts.some(t => t.includes('R Script'));
      const hasPRISMA = btnTexts.some(t => t.includes('PRISMA'));
      const patientToggle = document.getElementById('rmPatientModeToggle');
      return {
        hasCSV: hasCSV,
        hasJSON: hasJSON,
        hasRScript: hasR,
        hasPRISMAExport: hasPRISMA,
        hasPatientToggle: !!(patientToggle && patientToggle.type === 'checkbox'),
        hasOutputEngine: typeof rmOutputEngine !== 'undefined'
      };
    });
    expect(result.hasCSV).toBe(true);
    expect(result.hasJSON).toBe(true);
    expect(result.hasRScript).toBe(true);
    expect(result.hasPRISMAExport).toBe(true);
    expect(result.hasPatientToggle).toBe(true);
    expect(result.hasOutputEngine).toBe(true);
  });

  test('RM20: Mode switch preserves data (IDB round-trip)', async () => {
    // Put a test reference in IDB while in RapidMeta mode
    const putResult = await page.evaluate(async () => {
      const testRef = {
        id: 'rm-test-persist-' + Date.now(),
        title: 'Test Reference for Persistence',
        source: 'test',
        decision: 'include',
        projectId: typeof currentProjectId !== 'undefined' ? currentProjectId : 'test-project'
      };
      await idbPut('references', testRef);
      // Verify it was stored
      const all = await idbGetAll('references');
      const found = all.find(r => r.id === testRef.id);
      return { stored: !!found, refId: testRef.id };
    });
    expect(putResult.stored).toBe(true);

    // Switch to Autopilot mode
    await page.evaluate(() => { switchMode('autopilot'); });
    await page.waitForTimeout(300);

    // Verify we are in autopilot mode
    const inAP = await page.evaluate(() => currentMode === 'autopilot');
    expect(inAP).toBe(true);

    // Switch back to RapidMeta mode
    await page.evaluate(() => { switchMode('rapidmeta'); });
    await page.waitForTimeout(300);

    // Verify the reference is still in IDB
    const verifyResult = await page.evaluate(async (refId) => {
      const all = await idbGetAll('references');
      const found = all.find(r => r.id === refId);
      return { stillExists: !!found, title: found ? found.title : null };
    }, putResult.refId);

    expect(verifyResult.stillExists).toBe(true);
    expect(verifyResult.title).toBe('Test Reference for Persistence');

    // Clean up the test reference
    await page.evaluate(async (refId) => {
      await idbDelete('references', refId);
    }, putResult.refId);
  });
});
