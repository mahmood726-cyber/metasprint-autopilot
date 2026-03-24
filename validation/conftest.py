"""Shared Selenium fixtures for MetaSprint Autopilot test suite."""
import os
import sys
import time
import pytest
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from browser_runtime import ensure_local_browser_libs

HTML_PATH = os.path.normpath(os.path.join(os.path.dirname(__file__), '..', 'metasprint-autopilot.html'))
BROWSER_LIB_STATUS = ensure_local_browser_libs(auto_download=True)

# Standalone Selenium scripts are executed directly by run_all_tests.py and
# should not be imported/collected by pytest.
collect_ignore = [
    "test_2x2_input.py",
    "test_advanced_analysis.py",
    "test_classifier_precision_recall.py",
    "test_grade_concordance.py",
    "test_grade_nnt.py",
    "test_landscape_analytics.py",
    "test_meta_regression_nma.py",
    "test_ml_classifier.py",
    "test_subgroup_analysis.py",
    "test_ux_accessibility.py",
]


def _create_driver():
    opts = Options()
    opts.add_argument('--headless=new')
    opts.add_argument('--no-sandbox')
    opts.add_argument('--disable-dev-shm-usage')
    opts.add_argument('--window-size=1920,1080')
    opts.add_argument('--disable-gpu')
    opts.set_capability('goog:loggingPrefs', {'browser': 'ALL'})
    driver = webdriver.Chrome(options=opts)
    driver.implicitly_wait(2)
    return driver


def _load_app(driver):
    url = 'file:///' + HTML_PATH.replace('\\', '/').replace(' ', '%20')
    driver.get(url)
    time.sleep(2)
    # Dismiss onboarding modal if present
    try:
        driver.execute_script("""
            const m = document.getElementById('onboardOverlay');
            if (m) m.style.display = 'none';
            try { localStorage.setItem('msa-onboarded', '1'); } catch(e) {}
        """)
    except Exception:
        pass
    return driver


@pytest.fixture(scope="session")
def driver():
    if not BROWSER_LIB_STATUS.get("ok"):
        pytest.skip(f"Chrome runtime libraries unavailable: {BROWSER_LIB_STATUS.get('reason')}")
    try:
        d = _create_driver()
    except Exception as e:
        pytest.skip(f"Chrome WebDriver unavailable in this environment: {e}")
    _load_app(d)
    yield d
    d.quit()
