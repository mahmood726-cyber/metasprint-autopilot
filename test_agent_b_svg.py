"""Agent B - Final SVG/container check for DOI plot"""
import sys, io, json, time
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
driver.get('file:///C:/Users/user/Downloads/metasprint-autopilot/metasprint-autopilot.html')
time.sleep(3)
driver.execute_script("try { window.selectMode('autopilot'); } catch(e) {}")
time.sleep(2)
for _ in range(6):
    s = driver.execute_script("return window.projects ? window.projects.length : 0;")
    if s > 0: break
    time.sleep(1)

# Inject 8 studies
driver.execute_script("""
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
""")
time.sleep(1)
driver.execute_script("window.switchPhase('analyze');")
time.sleep(1)
driver.execute_script("window.runAnalysis();")
time.sleep(6)

result = driver.execute_script("""
var doi = document.getElementById('doiLfkContainer');
var fsn = document.getElementById('failsafeNContainer');
var ff = document.getElementById('fisherFragilityContainer');

var svgEl = doi ? doi.querySelector('svg') : null;
var circles = doi ? doi.querySelectorAll('circle') : [];
var texts = doi ? doi.querySelectorAll('text') : [];

return {
  doi: {
    exists: !!doi,
    htmlLen: doi ? doi.innerHTML.length : 0,
    hasSVG: !!svgEl,
    circleCount: circles.length,
    textCount: texts.length,
    svgCircleDetails: Array.from(circles).slice(0,10).map(function(c) {
      return { cx: c.getAttribute('cx'), cy: c.getAttribute('cy'), r: c.getAttribute('r'), fill: c.getAttribute('fill') };
    }),
    axisLabels: Array.from(texts).map(function(t) { return t.textContent.trim(); }).filter(Boolean),
    fullText: doi ? doi.textContent : ''
  },
  fsn: {
    exists: !!fsn,
    htmlLen: fsn ? fsn.innerHTML.length : 0,
    fullText: fsn ? fsn.textContent : ''
  },
  ff: {
    exists: !!ff,
    htmlLen: ff ? ff.innerHTML.length : 0,
    rowCount: ff ? ff.querySelectorAll('tbody tr').length : 0,
    fullText: ff ? ff.textContent : ''
  }
};
""")
print(json.dumps(result, indent=2, ensure_ascii=False))
driver.quit()
