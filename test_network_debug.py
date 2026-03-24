"""Debug network view and zoom issues."""
import sys, io, time, json, os
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options

opts = Options()
opts.add_argument('--headless=new')
opts.add_argument('--no-sandbox')
opts.add_argument('--disable-dev-shm-usage')
opts.add_argument('--window-size=1920,1080')
opts.set_capability('goog:loggingPrefs', {'browser': 'ALL'})
driver = webdriver.Chrome(options=opts)
driver.implicitly_wait(2)

html_path = os.path.normpath(os.path.abspath('metasprint-autopilot.html'))
url = 'file:///' + html_path.replace(os.sep, '/').replace(' ', '%20')
driver.get(url)
time.sleep(4)

# Dismiss onboarding
driver.execute_script(
    'var m = document.getElementById("onboardOverlay");'
    'if (m) m.style.display = "none";'
    'try { localStorage.setItem("msa-onboarded", "1"); } catch(e) {}'
)
time.sleep(1)

driver.execute_script('switchPhase("discover")')
time.sleep(2)

# === NETWORK VIEW ===
print("=== NETWORK VIEW ===")
result = driver.execute_script("""
    switchUniverseView("network");
    var svg = document.getElementById("networkSvg");
    var out = {};
    out.svgExists = !!svg;
    out.svgInDOM = svg ? document.body.contains(svg) : false;
    out.svgDisplay = svg ? getComputedStyle(svg).display : "none";
    out.svgVisibility = svg ? getComputedStyle(svg).visibility : "hidden";
    out.svgW = svg ? svg.getBoundingClientRect().width : 0;
    out.svgH = svg ? svg.getBoundingClientRect().height : 0;
    out.svgViewBox = svg ? svg.getAttribute("viewBox") : "none";
    out.svgChildren = svg ? svg.children.length : 0;
    out.svgInnerLen = svg ? svg.innerHTML.length : 0;
    out.hasActiveClass = svg ? svg.classList.contains("active") : false;
    out.svgClasses = svg ? svg.className.baseVal : "none";

    // Check all universe-view elements
    var views = document.querySelectorAll(".universe-view");
    out.allViews = [];
    views.forEach(function(v) {
        out.allViews.push({
            id: v.id || v.tagName,
            active: v.classList.contains("active"),
            display: getComputedStyle(v).display
        });
    });

    out.trialsCache = universeTrialsCache ? universeTrialsCache.length : 0;
    return out;
""")
print(json.dumps(result, indent=2))

# Check CSS rule for .universe-view and .universe-view.active
css = driver.execute_script("""
    var out = {};
    // Find the CSS rules
    for (var i = 0; i < document.styleSheets.length; i++) {
        try {
            var rules = document.styleSheets[i].cssRules || [];
            for (var j = 0; j < rules.length; j++) {
                var sel = rules[j].selectorText || "";
                if (sel.includes("universe-view") && !sel.includes("tab")) {
                    out[sel] = rules[j].cssText.substring(0, 200);
                }
            }
        } catch(e) {}
    }
    return out;
""")
print("\nCSS rules for universe-view:")
for sel, text in css.items():
    print(f"  {sel}: {text}")

# Check if network SVG has style="display:none" inline
inline_display = driver.execute_script("""
    var svg = document.getElementById("networkSvg");
    return svg ? svg.style.display : "no element";
""")
print(f"\nNetwork SVG inline style.display: '{inline_display}'")

driver.save_screenshot('/tmp/msa_network_debug.png')
print("Screenshot: /tmp/msa_network_debug.png")

# === ZOOM DIAGNOSTICS ===
print("\n=== AYAT ZOOM ===")
zoom = driver.execute_script("""
    switchUniverseView("ayat");
    var canvas = document.getElementById("ayatCanvas");
    var out = {};
    out.canvasW = canvas ? canvas.width : 0;
    out.canvasH = canvas ? canvas.height : 0;
    out.ayatState = typeof _ayatState !== "undefined" ? _ayatState : "undefined";
    // Check if wheel event listener is attached
    out.canvasCursor = canvas ? canvas.style.cursor : "none";
    out.canvasTabIndex = canvas ? canvas.tabIndex : -1;
    return out;
""")
print(json.dumps(zoom, indent=2))

# JS errors
logs = driver.get_log('browser')
errors = [l for l in logs if l['level'] == 'SEVERE']
for e in errors[:5]:
    print(f"JS ERROR: {e['message'][:300]}")
print(f"JS errors: {len(errors)}")

driver.quit()
