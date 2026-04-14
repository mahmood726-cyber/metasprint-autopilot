"""
Agent B Deep Check — tests Fisher FI with significant studies,
and verifies LFK/Fail-safe N values more thoroughly.
"""
import sys
import io
import json
import time
from pathlib import Path

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

from selenium import webdriver
from selenium.webdriver.chrome.options import Options

opts = Options()
opts.add_argument('--headless=new')
opts.add_argument('--no-sandbox')
opts.add_argument('--disable-dev-shm-usage')
opts.add_argument('--disable-gpu')
opts.add_argument('--window-size=1400,900')

driver = webdriver.Chrome(options=opts)
driver.get((Path(__file__).resolve().parent / 'metasprint-autopilot.html').as_uri())
time.sleep(3)

# Setup autopilot mode
driver.execute_script("try { window.selectMode('autopilot'); } catch(e) {}")
time.sleep(2)

# Wait for project init
for _ in range(8):
    s = driver.execute_script("return { pLen: window.projects ? window.projects.length : 0, pid: window.currentProjectId };")
    if s['pLen'] > 0 and s['pid']:
        break
    time.sleep(1)

print('Project state:', driver.execute_script("return { pLen: window.projects ? window.projects.length : 0, pid: window.currentProjectId };"))

# Inject studies with STRONGER effects so some are significant by Fisher's exact
# Use large imbalances so Fisher p < 0.05
inject_js = """
try {
  var etSel = document.getElementById('effectTypeSelect');
  if (etSel) etSel.value = 'OR';
  var imSel = document.getElementById('extractInputMode');
  if (imSel) { imSel.value = '2x2'; imSel.dispatchEvent(new Event('change')); }

  // Studies with larger event differences (some will be Fisher sig)
  var studies = [
    // Strongly significant: 3/100 vs 20/100
    { authorYear: 'Study A 2018', eventsInt: 3, totalInt: 100, eventsCtrl: 20, totalCtrl: 100, effectType: 'OR' },
    // Strongly significant: 5/80 vs 25/80
    { authorYear: 'Study B 2019', eventsInt: 5, totalInt: 80, eventsCtrl: 25, totalCtrl: 80, effectType: 'OR' },
    // Borderline: 10/80 vs 20/80
    { authorYear: 'Study C 2020', eventsInt: 10, totalInt: 80, eventsCtrl: 20, totalCtrl: 80, effectType: 'OR' },
    // Significant: 8/200 vs 40/200
    { authorYear: 'Study D 2017', eventsInt: 8, totalInt: 200, eventsCtrl: 40, totalCtrl: 200, effectType: 'OR' },
    // Non-significant: 15/100 vs 20/100
    { authorYear: 'Study E 2021', eventsInt: 15, totalInt: 100, eventsCtrl: 20, totalCtrl: 100, effectType: 'OR' }
  ];
  studies.forEach(function(s) { window.addStudyRow(s); });
  return 'Injected ' + studies.length + ' studies, extractedStudies.length=' + (window.extractedStudies ? window.extractedStudies.length : 'N/A');
} catch(e) {
  return 'ERROR: ' + e.message;
}
"""
r = driver.execute_script(inject_js)
print('Inject:', r)
time.sleep(1)

driver.execute_script("try { window.switchPhase('analyze'); } catch(e) {}")
time.sleep(1)
driver.execute_script("try { window.runAnalysis(); } catch(e) {}")
time.sleep(6)

# Get container lengths for sanity
lengths = driver.execute_script("""
return {
  doiLfkLen: document.getElementById('doiLfkContainer') ? document.getElementById('doiLfkContainer').innerHTML.length : -1,
  failsafeNLen: document.getElementById('failsafeNContainer') ? document.getElementById('failsafeNContainer').innerHTML.length : -1,
  fisherFragLen: document.getElementById('fisherFragilityContainer') ? document.getElementById('fisherFragilityContainer').innerHTML.length : -1
};
""")
print('Container lengths:', lengths)

# Full fisher check
fisher_full = driver.execute_script("""
var container = document.getElementById('fisherFragilityContainer');
if (!container) return { exists: false };
var rows = container.querySelectorAll('tbody tr');
var rowData = [];
rows.forEach(function(row) {
  var cells = row.querySelectorAll('td');
  var cellTexts = Array.from(cells).map(function(c) { return c.textContent.trim(); });
  rowData.push(cellTexts);
});
return {
  exists: true,
  rowCount: rows.length,
  rowData: rowData,
  allText: container.textContent.slice(0, 2000)
};
""")
print('\nFisher deep check:')
print(json.dumps(fisher_full, indent=2, ensure_ascii=False))

# Check LFK full details
doi_full = driver.execute_script("""
var container = document.getElementById('doiLfkContainer');
if (!container) return { exists: false };
var svgEl = container.querySelector('svg');
var circles = container.querySelectorAll('circle');
var lines = container.querySelectorAll('line');
return {
  exists: true,
  htmlLen: container.innerHTML.length,
  hasSVG: !!svgEl,
  circleCount: circles.length,
  lineCount: lines.length,
  svgInnerHTML: svgEl ? svgEl.innerHTML.slice(0, 400) : null,
  allText: container.textContent.slice(0, 1000)
};
""")
print('\nDOI/LFK deep check:')
print(json.dumps(doi_full, indent=2, ensure_ascii=False))

# Fail-safe N deep
fsn_full = driver.execute_script("""
var container = document.getElementById('failsafeNContainer');
if (!container) return { exists: false };
return {
  exists: true,
  htmlLen: container.innerHTML.length,
  allText: container.textContent.slice(0, 1000)
};
""")
print('\nFail-safe N deep check:')
print(json.dumps(fsn_full, indent=2, ensure_ascii=False))

driver.quit()
print('\n=== DEEP TEST COMPLETE ===')
