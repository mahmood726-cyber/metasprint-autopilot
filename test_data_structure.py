"""Get data structures for drill-down implementation."""
import sys, io, time, os, json
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
opts = Options()
opts.add_argument('--headless=new')
opts.add_argument('--no-sandbox')
opts.add_argument('--window-size=1920,1080')
driver = webdriver.Chrome(options=opts)
driver.implicitly_wait(2)
html_path = os.path.normpath(os.path.abspath('metasprint-autopilot.html'))
url = 'file:///' + html_path.replace(os.sep, '/').replace(' ', '%20')
driver.get(url)
time.sleep(4)
driver.execute_script('var m=document.getElementById("onboardOverlay");if(m)m.style.display="none"')

JS = """
var out = {};
if (typeof _alBurhanResults !== 'undefined' && _alBurhanResults && _alBurhanResults.length > 0) {
    var pooled = _alBurhanResults.filter(function(r) { return r.pooled && r.studies && r.studies.length >= 5; });
    if (pooled.length > 0) {
        var r = pooled[0];
        out.clusterId = r.id;
        out.drugClass = r.drug_class;
        out.subcat = r.subcategory;
        out.outcome = r.outcome;
        out.effectType = r.effect_type;
        out.furqan = r.furqan;
        out.shahid = r.shahid;
        out.interventions = r.interventions;
        out.k = r.studies.length;
        out.studySample = r.studies.slice(0, 2);
        out.studyKeys = Object.keys(r.studies[0]);
    }
} else {
    out.alBurhan = 'NO_DATA';
}

if (typeof universeTrialsCache !== 'undefined' && universeTrialsCache && universeTrialsCache.length > 0) {
    out.trialKeys = Object.keys(universeTrialsCache[0]);
    out.trialSample = universeTrialsCache[0];
    out.trialCount = universeTrialsCache.length;
} else {
    out.trials = 'NO_TRIALS';
}

if (typeof networkEdges !== 'undefined' && networkEdges) {
    out.edgeCount = networkEdges.length;
    out.edgeSample = networkEdges.slice(0, 3);
    out.nodeCount = networkNodes ? networkNodes.length : 0;
}

return out;
"""
result = driver.execute_script(JS)
print(json.dumps(result, indent=2))
driver.quit()
