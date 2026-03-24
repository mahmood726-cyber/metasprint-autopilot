#!/usr/bin/env python
"""Master test runner for MetaSprint Autopilot.

Runs all test suites in order and reports totals.

Usage:
    python run_all_tests.py           # Run all suites
    python run_all_tests.py --quick   # Skip slow suites (ML classifier)
"""
import subprocess, sys, os, time, re
from validation.browser_runtime import ensure_local_browser_libs

os.chdir(os.path.dirname(os.path.abspath(__file__)))

PYTHON = sys.executable
TRANSIENT_SELENIUM_RETRIES = 1
SELENIUM_RETRY_BACKOFF_SEC = 1.5

# --- Test suites (in execution order) ---
# Type: "pytest" runs via pytest; "selenium" runs as standalone scripts
SUITES = [
    # Pytest-based suites (validation/)
    {
        "name": "Core Engine (pytest: edge cases, 12-angle, features, Al-Burhan)",
        "type": "pytest",
        "cmd": [PYTHON, "-m", "pytest",
                "validation/test_analysis_edge_cases.py",
                "validation/test_comprehensive_12angle.py",
                "validation/test_features.py",
                "validation/test_al_burhan.py",
                "-q", "--tb=short", "-p", "no:capture"],
        "requires_browser": True,
        "slow": False,
    },
    # Pytest-based pipeline tests
    {
        "name": "Pipeline (pytest: DL, HKSJ, REML, harvest, cluster, export)",
        "type": "pytest",
        "cmd": [PYTHON, "-m", "pytest", "pipeline/", "-q", "--tb=short"],
        "requires_browser": False,
        "slow": False,
    },
    # Standalone Selenium suites (validation/)
    {
        "name": "GRADE + NNT Validation",
        "type": "selenium",
        "cmd": [PYTHON, "validation/test_grade_nnt.py"],
        "requires_browser": True,
        "slow": False,
    },
    {
        "name": "GRADE Concordance",
        "type": "selenium",
        "cmd": [PYTHON, "validation/test_grade_concordance.py"],
        "requires_browser": True,
        "slow": False,
    },
    {
        "name": "Raw 2x2 Input Validation",
        "type": "selenium",
        "cmd": [PYTHON, "validation/test_2x2_input.py"],
        "requires_browser": True,
        "slow": False,
    },
    {
        "name": "Subgroup Analysis + Gap Thresholds",
        "type": "selenium",
        "cmd": [PYTHON, "validation/test_subgroup_analysis.py"],
        "requires_browser": True,
        "slow": False,
    },
    {
        "name": "Advanced Analysis (Cumulative MA, Trim-Fill, Fragility)",
        "type": "selenium",
        "cmd": [PYTHON, "validation/test_advanced_analysis.py"],
        "requires_browser": True,
        "slow": False,
    },
    {
        "name": "UX & Accessibility (WCAG 2.1 AA)",
        "type": "selenium",
        "cmd": [PYTHON, "validation/test_ux_accessibility.py"],
        "requires_browser": True,
        "slow": False,
    },
    {
        "name": "Meta-Regression + NMA League Table",
        "type": "selenium",
        "cmd": [PYTHON, "validation/test_meta_regression_nma.py"],
        "requires_browser": True,
        "slow": False,
    },
    {
        "name": "Landscape Analytics (heatmap, temporal, maturity, drift)",
        "type": "selenium",
        "cmd": [PYTHON, "validation/test_landscape_analytics.py"],
        "requires_browser": True,
        "slow": False,
    },
    {
        "name": "Classifier Precision/Recall (282 trials)",
        "type": "selenium",
        "cmd": [PYTHON, "validation/test_classifier_precision_recall.py"],
        "requires_browser": True,
        "slow": False,
    },
    {
        "name": "ML Classifier (MiniLM-L6-v2 embeddings)",
        "type": "selenium",
        "cmd": [PYTHON, "validation/test_ml_classifier.py"],
        "requires_browser": True,
        "slow": True,
    },
]

def browser_runtime_available():
    """Best-effort check that Selenium + chromedriver can start."""
    probe = (
        "from selenium import webdriver;"
        "from selenium.webdriver.chrome.options import Options;"
        "o=Options();"
        "o.add_argument('--headless=new');"
        "o.add_argument('--no-sandbox');"
        "o.add_argument('--disable-dev-shm-usage');"
        "o.add_argument('--disable-gpu');"
        "d=webdriver.Chrome(options=o);"
        "d.quit();"
        "print('ok')"
    )
    try:
        result = subprocess.run(
            [PYTHON, "-c", probe],
            capture_output=True, text=True, timeout=60,
            encoding='utf-8', errors='replace'
        )
    except Exception as e:
        return False, str(e)
    if result.returncode == 0:
        return True, ""
    msg = (result.stderr or result.stdout or "").strip().splitlines()
    return False, (msg[-1] if msg else f"exit={result.returncode}")


def parse_pytest_summary(output):
    """Extract pass/fail counts from pytest output."""
    passed = 0
    failed = 0
    errors = 0
    # Match "227 passed" anywhere in output (stdout or stderr combined)
    m = re.search(r'(\d+) passed', output)
    if m:
        passed = int(m.group(1))
    m = re.search(r'(\d+) failed', output)
    if m:
        failed = int(m.group(1))
    m = re.search(r'(\d+) errors?', output)
    if m:
        errors = int(m.group(1))
    # Fallback: count dots in -q output (each dot = 1 passed test)
    if passed == 0 and failed == 0:
        dot_lines = re.findall(r'^[.FEx]+\s', output, re.MULTILINE)
        for line in dot_lines:
            passed += line.count('.')
            failed += line.count('F')
            errors += line.count('E')
    return passed, failed + errors


def parse_selenium_summary(output):
    """Extract pass/fail counts from standalone Selenium test output."""
    passed = 0
    failed = 0
    # Try summary line first (most reliable)
    m = re.search(r'(\d+)\s+pass.*?(\d+)\s+fail', output)
    if m:
        passed = int(m.group(1))
        failed = int(m.group(2))
    else:
        # Fall back to counting individual PASS/FAIL lines
        passed = len(re.findall(r'^\s*PASS\s', output, re.MULTILINE))
        failed = len(re.findall(r'^\s*FAIL\s', output, re.MULTILINE))
    # For classifier tests: report accuracy as pass/fail
    if passed == 0 and failed == 0:
        m = re.search(r'Total misclassified:\s*(\d+)\s*/\s*(\d+)', output)
        if m:
            misclassified = int(m.group(1))
            total = int(m.group(2))
            passed = total - misclassified
            failed = 0  # Misclassifications are expected, not failures
        # Also check ML classifier output
        m = re.search(r'Keyword=([\d.]+)%', output)
        if m and passed == 0:
            passed = 1  # Report ran successfully
    return passed, failed


def _run_suite_once(suite):
    """Run one suite attempt and return (passed, failed, duration, exit_code, output)."""
    start = time.time()
    try:
        result = subprocess.run(
            suite["cmd"],
            capture_output=True, text=True, timeout=300,
            encoding='utf-8', errors='replace'
        )
        output = result.stdout + result.stderr
        duration = time.time() - start

        if suite["type"] == "pytest":
            passed, failed = parse_pytest_summary(output)
        else:
            passed, failed = parse_selenium_summary(output)
        return passed, failed, duration, result.returncode, output
    except subprocess.TimeoutExpired:
        duration = time.time() - start
        return 0, 1, duration, 1, f"TIMEOUT after {duration:.0f}s"
    except Exception as e:
        duration = time.time() - start
        return 0, 1, duration, 1, f"ERROR: {e}"


def run_suite(suite):
    """Run a single test suite and return (name, passed, failed, duration, exit_code)."""
    name = suite["name"]
    print(f"\n{'='*60}")
    print(f"  {name}")
    print(f"{'='*60}")

    retries = suite.get(
        "retries",
        TRANSIENT_SELENIUM_RETRIES if suite["type"] == "selenium" else 0,
    )
    total_duration = 0.0
    attempt = 0
    while True:
        attempt += 1
        if attempt > 1:
            print(f"  RETRY  attempt {attempt}/{retries + 1}")

        passed, failed, duration, exit_code, output = _run_suite_once(suite)
        total_duration += duration

        lines = [line for line in output.strip().split('\n') if line.strip()] if output else []
        tail_count = 20 if exit_code != 0 else 8
        for line in lines[-tail_count:]:
            print(f"  {line}")

        if exit_code == 0 or attempt > retries:
            return name, passed, failed, total_duration, exit_code

        print(f"  RETRY  transient suite failure; waiting {SELENIUM_RETRY_BACKOFF_SEC:.1f}s before retry")
        time.sleep(SELENIUM_RETRY_BACKOFF_SEC)


def main():
    quick = '--quick' in sys.argv
    start_total = time.time()

    print("MetaSprint Autopilot — Master Test Runner")
    print(f"Mode: {'QUICK (skipping slow suites)' if quick else 'FULL'}")
    print(f"Python: {PYTHON}")
    print(f"CWD: {os.getcwd()}")

    lib_status = ensure_local_browser_libs(auto_download=True)
    if lib_status.get("ok"):
        print(f"Browser shared libs: READY ({lib_status.get('source')} @ {lib_status.get('lib_dir')})")
    else:
        print(f"Browser shared libs: UNAVAILABLE ({lib_status.get('reason')})")

    browser_ok, browser_reason = browser_runtime_available()
    if browser_ok:
        print("Browser runtime: AVAILABLE")
    else:
        print(f"Browser runtime: UNAVAILABLE ({browser_reason})")
        print("Selenium/browser suites will be skipped.")

    results = []
    total_pass = 0
    total_fail = 0
    any_failure = False

    for suite in SUITES:
        if quick and suite.get("slow"):
            print(f"\n  SKIP  {suite['name']} (--quick mode)")
            continue
        if suite.get("requires_browser") and not browser_ok:
            print(f"\n  SKIP  {suite['name']} (browser runtime unavailable)")
            results.append((suite["name"], 0, 0, 0.0, 0, "SKIP"))
            any_failure = True  # Skipping critical browser suites = not a clean pass
            continue
        name, passed, failed, duration, exit_code = run_suite(suite)
        # If parsing misses the failure mode, still count a non-zero exit.
        if exit_code != 0 and failed == 0:
            failed = 1
        results.append((name, passed, failed, duration, exit_code, "OK" if exit_code == 0 else "FAIL"))
        total_pass += passed
        total_fail += failed
        if exit_code != 0 or failed > 0:
            any_failure = True

    total_duration = time.time() - start_total

    # Summary table
    print(f"\n\n{'='*70}")
    print("  MASTER TEST SUMMARY")
    print(f"{'='*70}")
    print(f"  {'Suite':<50} {'Pass':>5} {'Fail':>5} {'Time':>6} {'Status':>7}")
    print(f"  {'-'*50} {'-'*5} {'-'*5} {'-'*6} {'-'*7}")
    for name, passed, failed, duration, exit_code, status in results:
        print(f"  {name:<50} {passed:>5} {failed:>5} {duration:>5.1f}s {status:>7}")
    print(f"  {'-'*50} {'-'*5} {'-'*5} {'-'*6} {'-'*7}")
    print(f"  {'TOTAL':<50} {total_pass:>5} {total_fail:>5} {total_duration:>5.1f}s {'':>7}")
    print(f"{'='*70}")

    if any_failure:
        print(f"\n  RESULT: FAIL ({total_fail} failures)")
        sys.exit(1)
    else:
        print(f"\n  RESULT: ALL {total_pass} TESTS PASS")
        sys.exit(0)


if __name__ == '__main__':
    main()
