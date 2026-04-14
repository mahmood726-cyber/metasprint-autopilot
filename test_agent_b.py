import sys
import io
import json
import time
from pathlib import Path

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By

opts = Options()
opts.add_argument('--headless=new')
opts.add_argument('--no-sandbox')
opts.add_argument('--disable-dev-shm-usage')
opts.add_argument('--disable-gpu')
opts.add_argument('--window-size=1400,900')

driver = webdriver.Chrome(options=opts)
driver.get((Path(__file__).resolve().parent / 'metasprint-autopilot.html').as_uri())
time.sleep(3)

# Step 1: Check initial state
init_state = driver.execute_script("""
return {
  projectsLen: window.projects ? window.projects.length : -1,
  currentProjectId: window.currentProjectId,
  hasModeModal: !!document.getElementById('modeModal'),
  modeModalDisplay: document.getElementById('modeModal') ? window.getComputedStyle(document.getElementById('modeModal')).display : 'n/a',
  hasAddStudyRow: typeof window.addStudyRow === 'function',
  hasRunAnalysis: typeof window.runAnalysis === 'function',
  hasSwitchPhase: typeof window.switchPhase === 'function',
  hasApplyMode: typeof window.applyMode === 'function',
  hasSelectMode: typeof window.selectMode === 'function',
  currentMode: window.currentMode || 'none'
};
""")
print('Init state:', json.dumps(init_state, indent=2))

# Step 2: Use autopilot mode (NOT rapidmeta, so switchPhase works)
dismiss_result = driver.execute_script("""
try {
  // Use autopilot mode so switchPhase('analyze') works
  if (typeof window.selectMode === 'function') {
    window.selectMode('autopilot');
    return 'Selected autopilot mode';
  } else if (typeof window.applyMode === 'function') {
    window.applyMode('autopilot');
    document.getElementById('modeModal').classList.add('hidden');
    return 'Applied autopilot mode directly';
  }
  return 'No mode functions available';
} catch(e) {
  return 'ERROR: ' + e.message;
}
""")
print('Mode select result:', dismiss_result)
time.sleep(2)

# Step 3: Wait for projects to be initialized (async IDB)
for attempt in range(8):
    state = driver.execute_script("""
    return {
      pLen: window.projects ? window.projects.length : 0,
      pid: window.currentProjectId,
      mode: window.currentMode || 'none',
      extractLen: window.extractedStudies ? window.extractedStudies.length : -1
    };
    """)
    print(f'Attempt {attempt}: projects={state["pLen"]}, pid={state["pid"]}, mode={state["mode"]}, extractLen={state["extractLen"]}')
    if state['pLen'] > 0 and state['pid']:
        break
    time.sleep(1)

# Step 4: Inject 8 studies with 2x2 data
inject_js = """
try {
  var etSel = document.getElementById('effectTypeSelect');
  if (etSel) etSel.value = 'OR';
  var imSel = document.getElementById('extractInputMode');
  if (imSel) { imSel.value = '2x2'; imSel.dispatchEvent(new Event('change')); }

  var studies = [
    { authorYear: 'Alpha 2018', eventsInt: 10, totalInt: 80, eventsCtrl: 20, totalCtrl: 80, effectType: 'OR' },
    { authorYear: 'Beta 2019', eventsInt: 25, totalInt: 200, eventsCtrl: 40, totalCtrl: 200, effectType: 'OR' },
    { authorYear: 'Gamma 2020', eventsInt: 5, totalInt: 50, eventsCtrl: 12, totalCtrl: 50, effectType: 'OR' },
    { authorYear: 'Delta 2017', eventsInt: 35, totalInt: 250, eventsCtrl: 50, totalCtrl: 250, effectType: 'OR' },
    { authorYear: 'Epsilon 2021', eventsInt: 8, totalInt: 100, eventsCtrl: 15, totalCtrl: 100, effectType: 'OR' },
    { authorYear: 'Zeta 2019', eventsInt: 18, totalInt: 130, eventsCtrl: 28, totalCtrl: 130, effectType: 'OR' },
    { authorYear: 'Eta 2022', eventsInt: 3, totalInt: 40, eventsCtrl: 9, totalCtrl: 40, effectType: 'OR' },
    { authorYear: 'Theta 2020', eventsInt: 42, totalInt: 300, eventsCtrl: 55, totalCtrl: 300, effectType: 'OR' }
  ];
  studies.forEach(function(s) { window.addStudyRow(s); });
  return 'Injected ' + studies.length + ' studies, extractedStudies.length=' + (window.extractedStudies ? window.extractedStudies.length : 'N/A');
} catch(e) {
  return 'ERROR: ' + e.message;
}
"""
r2 = driver.execute_script(inject_js)
print('Inject result:', r2)
time.sleep(1)

# Step 5: Switch to analyze phase
r3 = driver.execute_script("""
try {
  window.switchPhase('analyze');
  return 'Switched to analyze';
} catch(e) {
  return 'ERROR: ' + e.message;
}
""")
print('Switch phase:', r3)
time.sleep(1)

# Step 6: Run analysis
r4 = driver.execute_script("""
try {
  window.runAnalysis();
  return 'Analysis triggered';
} catch(e) {
  return 'ERROR: ' + e.message;
}
""")
print('Run analysis:', r4)
time.sleep(6)

# Step 7: Check analysis ran
post = driver.execute_script("""
return {
  extractedLen: window.extractedStudies ? window.extractedStudies.length : -1,
  currentPhase: window.currentPhase,
  forestLen: document.getElementById('forestContainer') ? document.getElementById('forestContainer').innerHTML.length : -1,
  pooledText: document.getElementById('pooledResult') ? document.getElementById('pooledResult').textContent.slice(0, 150) : 'n/a',
  doiLfkLen: document.getElementById('doiLfkContainer') ? document.getElementById('doiLfkContainer').innerHTML.length : -1,
  failsafeNLen: document.getElementById('failsafeNContainer') ? document.getElementById('failsafeNContainer').innerHTML.length : -1,
  fisherFragLen: document.getElementById('fisherFragilityContainer') ? document.getElementById('fisherFragilityContainer').innerHTML.length : -1
};
""")
print('Post-analysis state:', json.dumps(post, indent=2))

# ============================================================
# FEATURE 1: DOI / LFK Index
# ============================================================
doi_lfk_js = """
var container = document.getElementById('doiLfkContainer');
if (!container) {
  return { exists: false, note: 'Container element #doiLfkContainer not found' };
}
var h = container.innerHTML;
var allText = container.textContent;
var svgEl = container.querySelector('svg');

// Extract LFK value (numeric, could be negative)
var lfkMatch = allText.match(/LFK[^-\\d]*(-?\\d+\\.\\d+)/i);
var lfkValue = lfkMatch ? lfkMatch[1] : null;

// Try broader pattern if no match
if (!lfkValue) {
  var nums = allText.match(/-?\\d+\\.\\d+/g) || [];
  lfkValue = nums.length > 0 ? nums[0] : null;
}

// Asymmetry classification
var noAsymm = /no asymmetry/i.test(allText);
var minorAsymm = /minor asymmetry/i.test(allText);
var majorAsymm = /major asymmetry/i.test(allText);

return {
  exists: true,
  htmlLen: h.length,
  hasSVG: !!svgEl,
  svgWidth: svgEl ? (svgEl.getAttribute('width') || svgEl.viewBox?.baseVal?.width) : null,
  hasLFKText: /LFK/i.test(allText),
  hasDOIText: /DOI/i.test(allText),
  lfkValue: lfkValue,
  hasNoAsymmetry: noAsymm,
  hasMinorAsymmetry: minorAsymm,
  hasMajorAsymmetry: majorAsymm,
  hasAnyAsymmetryClass: noAsymm || minorAsymm || majorAsymm,
  hasFuruyaKanamori: /Furuya|Kanamori/i.test(allText),
  numericValuesFound: (allText.match(/-?\\d+\\.\\d+/g) || []).slice(0, 10),
  textPreview: allText.slice(0, 800),
  htmlPreview: h.slice(0, 500)
};
"""
doi_lfk_result = driver.execute_script(doi_lfk_js)
print('\n=== FEATURE 1: DOI / LFK Index ===')
print(json.dumps(doi_lfk_result, indent=2, ensure_ascii=False))

# ============================================================
# FEATURE 2: Fail-safe N
# ============================================================
failsafe_js = """
var container = document.getElementById('failsafeNContainer');
if (!container) {
  return { exists: false, note: 'Container element #failsafeNContainer not found' };
}
var h = container.innerHTML;
var allText = container.textContent;

// Rosenthal / Orwin
var hasRosenthal = /Rosenthal/i.test(allText);
var hasOrwin = /Orwin/i.test(allText);

// 5k+10 threshold
var hasThreshold = /5.*k.*\\+.*10|threshold/i.test(allText);

// Numeric values (fail-safe N)
var numericMatches = allText.match(/\\d+/g) || [];

// Conclusion keywords
var hasRobust = /robust/i.test(allText);
var hasNotRobust = /not robust|fragile|concern/i.test(allText);

// Look for actual FSN numbers
var fsnMatch = allText.match(/(?:Rosenthal|Orwin|Fail[- ]?safe)[^\\d]*(\\d+)/i);
var fsnValue = fsnMatch ? fsnMatch[1] : null;

return {
  exists: true,
  htmlLen: h.length,
  hasRosenthal: hasRosenthal,
  hasOrwin: hasOrwin,
  hasThreshold: hasThreshold,
  hasRobustConclusion: hasRobust,
  hasNotRobustConclusion: hasNotRobust,
  fsnValue: fsnValue,
  numericValues: numericMatches.slice(0, 20),
  textPreview: allText.slice(0, 1000),
  htmlPreview: h.slice(0, 600)
};
"""
failsafe_result = driver.execute_script(failsafe_js)
print('\n=== FEATURE 2: Fail-safe N ===')
print(json.dumps(failsafe_result, indent=2, ensure_ascii=False))

# ============================================================
# FEATURE 3: Fisher Exact + Fragility Index
# ============================================================
fisher_js = """
var container = document.getElementById('fisherFragilityContainer');
if (!container) {
  return { exists: false, note: 'Container element #fisherFragilityContainer not found' };
}
var h = container.innerHTML;
var allText = container.textContent;

// Table presence
var tableEl = container.querySelector('table');
var rows = container.querySelectorAll('tbody tr');

// FI / FQ mentions
var hasFI = /Fragility Index|\\bFI\\b/i.test(allText);
var hasFQ = /Fragility Quotient|\\bFQ\\b/i.test(allText);
var hasFisher = /Fisher/i.test(allText);
var hasPValue = /p[- ]?value|p\\s*[=<>]/i.test(allText);

// Arm modification text
var hasTreatmentArm = /treatment/i.test(allText);
var hasControlArm = /control/i.test(allText);

// Extract row data
var rowData = [];
rows.forEach(function(row, i) {
  if (i >= 12) return;
  var cells = row.querySelectorAll('td, th');
  var cellTexts = Array.from(cells).map(function(c) { return c.textContent.trim().slice(0, 60); });
  rowData.push(cellTexts);
});

// Null/empty FI for non-significant
var hasNullFI = /N\\/A|—|n\\/a|not significant|-/i.test(allText);

return {
  exists: true,
  htmlLen: h.length,
  hasTable: !!tableEl,
  rowCount: rows.length,
  hasFI: hasFI,
  hasFQ: hasFQ,
  hasFisher: hasFisher,
  hasPValue: hasPValue,
  hasTreatmentArm: hasTreatmentArm,
  hasControlArm: hasControlArm,
  hasNullFIForNonSig: hasNullFI,
  sampleRows: rowData.slice(0, 10),
  textPreview: allText.slice(0, 1000),
  htmlPreview: h.slice(0, 800)
};
"""
fisher_result = driver.execute_script(fisher_js)
print('\n=== FEATURE 3: Fisher Exact + Fragility Index ===')
print(json.dumps(fisher_result, indent=2, ensure_ascii=False))

# ============================================================
# DEEP DIVE: Full text of containers
# ============================================================
print('\n=== DEEP DIVE: Full container text ===')

doi_text = driver.execute_script("""
var c = document.getElementById('doiLfkContainer');
return c ? c.textContent : 'NOT FOUND';
""")
print('DOI/LFK full text (2000 chars):\n', doi_text[:2000])

failsafe_text = driver.execute_script("""
var c = document.getElementById('failsafeNContainer');
return c ? c.textContent : 'NOT FOUND';
""")
print('\nFail-safe N full text (2000 chars):\n', failsafe_text[:2000])

fisher_text = driver.execute_script("""
var c = document.getElementById('fisherFragilityContainer');
return c ? c.textContent : 'NOT FOUND';
""")
print('\nFisher/Fragility full text (3000 chars):\n', fisher_text[:3000])

driver.quit()
print('\n=== TEST COMPLETE ===')
