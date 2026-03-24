import sys
import io
import json
import time

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

opts = Options()
opts.add_argument('--headless=new')
opts.add_argument('--no-sandbox')
opts.add_argument('--disable-dev-shm-usage')
opts.add_argument('--disable-gpu')
opts.add_argument('--window-size=1400,900')

driver = webdriver.Chrome(options=opts)
driver.get('file:///C:/Users/user/Downloads/metasprint-autopilot/metasprint-autopilot.html')
time.sleep(4)

# Check initial state
init_state = driver.execute_script("""
return {
  projectsLen: window.projects ? window.projects.length : -1,
  currentProjectId: window.currentProjectId,
  hasModeModal: document.getElementById('modeModal') ? true : false,
  modeModalDisplay: document.getElementById('modeModal') ? window.getComputedStyle(document.getElementById('modeModal')).display : 'n/a',
  hasAddStudyRow: typeof window.addStudyRow === 'function',
  hasRunAnalysis: typeof window.runAnalysis === 'function',
  hasSwitchPhase: typeof window.switchPhase === 'function'
};
""")
print('Init state:', json.dumps(init_state, indent=2))

# Dismiss mode modal if visible by selecting rapidmeta mode
dismiss_js = """
try {
  var modal = document.getElementById('modeModal');
  if (modal && window.getComputedStyle(modal).display !== 'none') {
    if (typeof window.selectMode === 'function') {
      window.selectMode('rapidmeta');
      return 'Modal dismissed via selectMode';
    }
    modal.style.display = 'none';
    return 'Modal hidden directly';
  }
  return 'No modal visible';
} catch(e) {
  return 'ERROR: ' + e.message;
}
"""
r = driver.execute_script(dismiss_js)
print('Modal dismiss:', r)
time.sleep(1)

# Wait for project to be created
for attempt in range(5):
    state = driver.execute_script("return { pLen: window.projects ? window.projects.length : 0, pid: window.currentProjectId };")
    print(f'Attempt {attempt}: projects={state["pLen"]}, pid={state["pid"]}')
    if state['pLen'] > 0 and state['pid']:
        break
    time.sleep(1)

# Inject test data
inject_js = """
try {
  var etSel = document.getElementById('effectTypeSelect');
  if (etSel) etSel.value = 'OR';
  var imSel = document.getElementById('extractInputMode');
  if (imSel) { imSel.value = '2x2'; imSel.dispatchEvent(new Event('change')); }
  var studies = [
    { authorYear: 'Smith 2020', eventsInt: 15, totalInt: 100, eventsCtrl: 25, totalCtrl: 100, effectType: 'OR' },
    { authorYear: 'Jones 2019', eventsInt: 22, totalInt: 150, eventsCtrl: 35, totalCtrl: 150, effectType: 'OR' },
    { authorYear: 'Brown 2021', eventsInt: 8, totalInt: 80, eventsCtrl: 18, totalCtrl: 80, effectType: 'OR' },
    { authorYear: 'Davis 2018', eventsInt: 30, totalInt: 200, eventsCtrl: 45, totalCtrl: 200, effectType: 'OR' },
    { authorYear: 'Wilson 2022', eventsInt: 12, totalInt: 120, eventsCtrl: 20, totalCtrl: 120, effectType: 'OR' },
    { authorYear: 'Taylor 2020', eventsInt: 5, totalInt: 60, eventsCtrl: 12, totalCtrl: 60, effectType: 'OR' }
  ];
  studies.forEach(function(s) { window.addStudyRow(s); });
  return 'Injected ' + studies.length + ' studies, extractedStudies.length=' + window.extractedStudies.length;
} catch(e) {
  return 'ERROR: ' + e.message;
}
"""
r2 = driver.execute_script(inject_js)
print('Inject result:', r2)
time.sleep(1)

# Switch to analyze phase
switch_js = """
try {
  window.switchPhase('analyze');
  return 'Switched to analyze';
} catch(e) {
  return 'ERROR: ' + e.message;
}
"""
r3 = driver.execute_script(switch_js)
print('Switch phase:', r3)
time.sleep(1)

# Run analysis
run_js = """
try {
  window.runAnalysis();
  return 'Analysis triggered';
} catch(e) {
  return 'ERROR: ' + e.message;
}
"""
r4 = driver.execute_script(run_js)
print('Run analysis:', r4)
time.sleep(6)

# Check state after analysis
post_js = """
return {
  extractedLen: window.extractedStudies ? window.extractedStudies.length : -1,
  currentPhase: window.currentPhase,
  beggLen: document.getElementById('beggContainer') ? document.getElementById('beggContainer').innerHTML.length : -1,
  labbeLen: document.getElementById('labbeContainer') ? document.getElementById('labbeContainer').innerHTML.length : -1,
  nntLen: document.getElementById('nntContainer') ? document.getElementById('nntContainer').innerHTML.length : -1,
  trafficDisplay: document.getElementById('patientTrafficContainer') ? document.getElementById('patientTrafficContainer').style.display : 'n/a'
};
"""
post = driver.execute_script(post_js)
print('Post-analysis state:', json.dumps(post, indent=2))

# Check if analysis ran by looking for results section
result_check = driver.execute_script("""
var forestEl = document.getElementById('forestContainer');
var pooledEl = document.getElementById('pooledResult');
return {
  forestLen: forestEl ? forestEl.innerHTML.length : -1,
  pooledText: pooledEl ? pooledEl.textContent.slice(0, 100) : 'n/a'
};
""")
print('Result check:', json.dumps(result_check, indent=2))

# Full feature checks
check_js = """
var out = {};

// --- 1. Begg's Test ---
var begg = document.getElementById('beggContainer');
if (!begg) {
  out.begg = { exists: false, note: 'Container element not found' };
} else {
  var h = begg.innerHTML;
  out.begg = {
    exists: true,
    htmlLen: h.length,
    hasBeggText: /Begg/i.test(h),
    hasKendall: /Kendall|Kendall/i.test(h),
    hasTauSymbol: /tau|\\u03C4/.test(h),
    hasPValue: /p-value/i.test(h),
    hasConclusion: /correlation|bias/i.test(h),
    hasColorIndicator: /#ef4444|#16a34a|#10b981/.test(h),
    preview: h.slice(0, 500)
  };
}

// --- 2. L'Abbe Plot ---
var labbe = document.getElementById('labbeContainer');
if (!labbe) {
  out.labbe = { exists: false, note: 'Container element not found' };
} else {
  var h2 = labbe.innerHTML;
  var svgEl = labbe.querySelector('svg');
  var circles = labbe.querySelectorAll('circle');
  out.labbe = {
    exists: true,
    htmlLen: h2.length,
    hasSVG: !!svgEl,
    circleCount: circles.length,
    hasCER: /CER|Control Event Rate/i.test(h2),
    hasTER: /TER|Treatment Event Rate/i.test(h2),
    hasLabbeName: /L.Abb/i.test(h2),
    hasDiagonalLine: h2.indexOf('stroke-dasharray') > -1,
    preview: h2.slice(0, 500)
  };
}

// --- 3. NNT Curve (inside nntContainer) ---
var nntEl = document.getElementById('nntContainer');
if (!nntEl) {
  out.nntCurve = { containerExists: false, note: 'nntContainer not found' };
} else {
  var h3 = nntEl.innerHTML;
  var svgEl2 = nntEl.querySelector('svg');
  var paths = nntEl.querySelectorAll('path');
  var circles2 = nntEl.querySelectorAll('circle');
  out.nntCurve = {
    containerExists: true,
    htmlLen: h3.length,
    hasSVG: !!svgEl2,
    pathCount: paths.length,
    circleCount: circles2.length,
    hasBaselineRisk: /Baseline.*Risk|Baseline Event Rate/i.test(h3),
    hasNNTLabel: /NNT|NNH/i.test(h3),
    hasNNTvs: /NNT vs Baseline/i.test(h3),
    hasCurve: h3.indexOf('stroke-linecap') > -1,
    preview: h3.slice(0, 500)
  };
}

// --- 4. Patient Traffic Light ---
var traffic = document.getElementById('patientTrafficContainer');
if (!traffic) {
  out.patientTraffic = { exists: false, note: 'Container element not found' };
} else {
  var cs = window.getComputedStyle(traffic);
  var h4 = traffic.innerHTML;
  var lightEl = document.getElementById('mainTrafficLight');
  var headlineEl = document.getElementById('mainPatientHeadline');
  var textEl = document.getElementById('mainPatientText');
  var nntEl2 = document.getElementById('mainPatientNNT');
  out.patientTraffic = {
    exists: true,
    inlineDisplay: traffic.style.display,
    computedDisplay: cs.display,
    isVisible: cs.display !== 'none',
    htmlLen: h4.length,
    hasTrafficLightEl: !!lightEl,
    circleText: lightEl ? lightEl.textContent : '',
    circleColor: lightEl ? lightEl.style.background : '',
    headlineText: headlineEl ? headlineEl.textContent.slice(0, 150) : 'n/a',
    bodyText: textEl ? textEl.textContent.slice(0, 250) : 'n/a',
    nntText: nntEl2 ? nntEl2.textContent.slice(0, 100) : 'n/a',
    hasPatientFriendlyText: /reduce|increase|uncertain|benefit|risk|studies/i.test(h4)
  };
}

return out;
"""

checks = driver.execute_script(check_js)
print('\n=== FULL FEATURE TEST RESULTS ===')
print(json.dumps(checks, indent=2, ensure_ascii=False))

driver.quit()
