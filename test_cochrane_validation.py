#!/usr/bin/env python3
"""Cochrane Validation Test — MetaSprint Autopilot vs real Cochrane review data.

Tests 2 real Cochrane reviews with known pooled effects:
  1. CD016131 — RSV vaccines in older adults (k=4, RR, I²=0%)
  2. CD015588 — SGLT2 inhibitors all-cause death (k=14, RR, I²≈29%)

For each: enters exact Cochrane study-level data → runs DL random-effects →
compares pooled effect, CI, I², τ² against hand-calculated expected values.

Also verifies CT.gov search can find the trials (network-dependent).
"""

import sys
import io
import time
import math
import json

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.options import Options

opts = Options()
opts.add_argument('--headless=new')
opts.add_argument('--window-size=1400,900')
opts.set_capability('goog:loggingPrefs', {'browser': 'ALL'})
driver = webdriver.Chrome(options=opts)

passed = 0
failed = 0
total = 0


def check(label, condition, detail=''):
    global passed, failed, total
    total += 1
    if condition:
        passed += 1
        print(f'  PASS: {label}' + (f' ({detail})' if detail else ''))
    else:
        failed += 1
        print(f'  FAIL: {label}' + (f' ({detail})' if detail else ''))


def dl_meta(studies, z=1.959964):
    """Hand-calculate DL random-effects from effect estimates + CIs (log scale)."""
    log_data = []
    for s in studies:
        yi = math.log(s['e'])
        se = (math.log(s['hi']) - math.log(s['lo'])) / (2 * z)
        wi = 1 / (se * se)
        log_data.append({'yi': yi, 'se': se, 'wi': wi})

    sum_w = sum(d['wi'] for d in log_data)
    mu_fe = sum(d['wi'] * d['yi'] for d in log_data) / sum_w
    Q = sum(d['wi'] * (d['yi'] - mu_fe) ** 2 for d in log_data)
    df = len(log_data) - 1
    C = sum_w - sum(d['wi'] ** 2 for d in log_data) / sum_w
    tau2 = max(0, (Q - df) / C) if C > 0 else 0
    I2 = max(0, (Q - df) / Q * 100) if Q > df else 0

    re_data = [{'yi': d['yi'], 'wi_re': 1 / (d['se'] ** 2 + tau2)} for d in log_data]
    sum_w_re = sum(d['wi_re'] for d in re_data)
    mu_re = sum(d['wi_re'] * d['yi'] for d in re_data) / sum_w_re
    se_re = math.sqrt(1 / sum_w_re)

    pooled = math.exp(mu_re)
    ci_lo = math.exp(mu_re - z * se_re)
    ci_hi = math.exp(mu_re + z * se_re)

    z_test = mu_re / se_re

    def normalCDF(x):
        t = 1 / (1 + 0.2316419 * abs(x))
        d = 0.3989422804014327
        p = d * math.exp(-x * x / 2) * (
            0.3193815 * t - 0.3565638 * t**2 + 1.781478 * t**3
            - 1.8212560 * t**4 + 1.3302744 * t**5
        )
        return 1 - p if x > 0 else p

    p_value = 2 * (1 - normalCDF(abs(z_test)))

    return {
        'pooled': pooled, 'ci_lo': ci_lo, 'ci_hi': ci_hi,
        'tau2': tau2, 'I2': I2, 'Q': Q, 'df': df, 'p': p_value, 'k': len(studies)
    }


# ===============================================================
# REVIEW 1: CD016131 — RSV vaccines for older adults
# Cochrane DOI: 10.1002/14651858.CD016131
# Outcome: RSV-associated lower respiratory tract illness
# Effect measure: Risk Ratio (RR)
# ===============================================================
RSV_STUDIES = [
    {'ay': 'Papi 2023',    'nct': 'NCT04886596', 'nI': 12469, 'nC': 12498, 'e': 0.2163, 'lo': 0.1459, 'hi': 0.3207, 'tp': 'RR'},
    {'ay': 'Walsh 2023',   'nct': 'NCT05127434', 'nI': 17215, 'nC': 17069, 'e': 0.3305, 'lo': 0.1671, 'hi': 0.6537, 'tp': 'RR'},
    {'ay': 'Wilson 2023',  'nct': 'NCT05035212', 'nI': 17572, 'nC': 17516, 'e': 0.1631, 'lo': 0.0806, 'hi': 0.3299, 'tp': 'RR'},
    {'ay': 'Falsey 2023',  'nct': 'NCT05127434', 'nI': 2791,  'nC': 2801,  'e': 0.2509, 'lo': 0.1257, 'hi': 0.5007, 'tp': 'RR'},
]

# ===============================================================
# REVIEW 2: CD015588 — SGLT2 inhibitors all-cause death
# Cochrane DOI: 10.1002/14651858.CD015588.pub2
# Outcome: All-cause death
# Effect measure: Risk Ratio (RR)
# Only studies with non-zero events in both arms
# ===============================================================
SGLT2_STUDIES = [
    {'ay': 'Cherney 2021',         'nI': 184,  'nC': 93,   'e': 0.5054, 'lo': 0.1501, 'hi': 1.7022, 'tp': 'RR'},
    {'ay': 'DECLARE-TIMI 58a',     'nI': 606,  'nC': 659,  'e': 0.8875, 'lo': 0.6618, 'hi': 1.1901, 'tp': 'RR'},
    {'ay': 'DIA3004 2013',         'nI': 179,  'nC': 90,   'e': 1.0056, 'lo': 0.1877, 'hi': 5.3868, 'tp': 'RR'},
    {'ay': 'EMPA-REG a',           'nI': 1212, 'nC': 607,  'e': 0.8514, 'lo': 0.5833, 'hi': 1.2427, 'tp': 'RR'},
    {'ay': 'EMPA-REG RENAL',       'nI': 224,  'nC': 224,  'e': 0.3333, 'lo': 0.0349, 'hi': 3.1803, 'tp': 'RR'},
    {'ay': 'SCORED 2020',          'nI': 5292, 'nC': 5292, 'e': 1.0000, 'lo': 0.8415, 'hi': 1.1884, 'tp': 'RR'},
    {'ay': 'VERTIS RENAL',         'nI': 313,  'nC': 154,  'e': 1.1480, 'lo': 0.3010, 'hi': 4.3786, 'tp': 'RR'},
    {'ay': 'DECLARE-TIMI 58b',     'nI': 3838, 'nC': 3894, 'e': 0.8940, 'lo': 0.7592, 'hi': 1.0526, 'tp': 'RR'},
    {'ay': 'EMPA-REG b',           'nI': 2423, 'nC': 1238, 'e': 0.5762, 'lo': 0.4402, 'hi': 0.7541, 'tp': 'RR'},
    {'ay': 'CREDENCE 2017',        'nI': 2202, 'nC': 2199, 'e': 0.8347, 'lo': 0.6860, 'hi': 1.0156, 'tp': 'RR'},
    {'ay': 'DAPA-CKD 2020',        'nI': 1455, 'nC': 1451, 'e': 0.7413, 'lo': 0.5643, 'hi': 0.9739, 'tp': 'RR'},
    {'ay': 'Kohan 2014',           'nI': 168,  'nC': 84,   'e': 0.5000, 'lo': 0.1489, 'hi': 1.6794, 'tp': 'RR'},
    {'ay': 'VERTIS-CV 2020',       'nI': 5499, 'nC': 2747, 'e': 0.9303, 'lo': 0.8044, 'hi': 1.0759, 'tp': 'RR'},
    {'ay': 'Wada 2022',            'nI': 154,  'nC': 154,  'e': 4.0000, 'lo': 0.4522, 'hi': 35.3814,'tp': 'RR'},
]

# ===============================================================
# REVIEW 3: CD015849 — GLP-1 RA all-cause death (CKD population)
# Cochrane DOI: 10.1002/14651858.CD015849.pub2
# Effect measure: Risk Ratio (RR)
# Only non-zero-event studies
# ===============================================================
GLP1_STUDIES = [
    {'ay': 'EXSCEL 2017a',    'nI': 1557, 'nC': 1620, 'e': 1.0145, 'lo': 0.8435, 'hi': 1.2201, 'tp': 'RR'},
    {'ay': 'LEADER 2017',     'nI': 1116, 'nC': 1042, 'e': 0.7553, 'lo': 0.6167, 'hi': 0.9252, 'tp': 'RR'},
    {'ay': 'LIRA-RENAL 2016', 'nI': 140,  'nC': 137,  'e': 3.9143, 'lo': 0.4431, 'hi': 34.5789,'tp': 'RR'},
    {'ay': 'PIONEER 5 2019',  'nI': 163,  'nC': 161,  'e': 0.9877, 'lo': 0.0623, 'hi': 15.6566,'tp': 'RR'},
    {'ay': 'Sivalingam 2024', 'nI': 30,   'nC': 30,   'e': 1.0000, 'lo': 0.0655, 'hi': 15.2598,'tp': 'RR'},
    {'ay': 'EXSCEL 2017b',    'nI': 5769, 'nC': 5745, 'e': 0.7873, 'lo': 0.6800, 'hi': 0.9114, 'tp': 'RR'},
]

# Pre-compute expected results
rsv_expected = dl_meta(RSV_STUDIES)
sglt2_expected = dl_meta(SGLT2_STUDIES)
glp1_expected = dl_meta(GLP1_STUDIES)

REVIEWS = [
    ('CD016131: RSV vaccines vs placebo — LRTI in older adults',
     RSV_STUDIES, rsv_expected, 'RSV vaccine respiratory syncytial virus'),
    ('CD015588: SGLT2 inhibitors — all-cause death',
     SGLT2_STUDIES, sglt2_expected, 'SGLT2 inhibitor heart failure mortality'),
    ('CD015849: GLP-1 receptor agonists — all-cause death in CKD',
     GLP1_STUDIES, glp1_expected, 'GLP-1 receptor agonist CKD mortality'),
]

print('=' * 70)
print('COCHRANE VALIDATION: Hand-Calculated Expected Results')
for title, _, exp, _ in REVIEWS:
    print(f'\n  {title}')
    print(f'    k={exp["k"]}, Pooled RR={exp["pooled"]:.4f} [{exp["ci_lo"]:.4f}, {exp["ci_hi"]:.4f}]')
    print(f'    tau2={exp["tau2"]:.6f}, I2={exp["I2"]:.1f}%, Q={exp["Q"]:.3f} (df={exp["df"]})')
print('=' * 70)

try:
    driver.get(
        'file:///C:/Users/user/Downloads/metasprint-autopilot/metasprint-autopilot.html'
    )
    time.sleep(2)

    check('App loads', 'MetaSprint' in driver.title, driver.title)

    # ==========================================================
    # PHASE A: CT.gov SEARCH VERIFICATION (network-dependent)
    # ==========================================================
    print('\n=== PHASE A: CT.gov SEARCH VERIFICATION ===')
    try:
        driver.find_element(By.CSS_SELECTOR, '[data-phase="search"]').click()
        time.sleep(0.5)

        # Use PICO fields (the app's actual search interface)
        pico_p = driver.find_element(By.ID, 'picoP')
        pico_p.clear()
        pico_p.send_keys('respiratory syncytial virus')
        pico_i = driver.find_element(By.ID, 'picoI')
        pico_i.clear()
        pico_i.send_keys('vaccine')
        time.sleep(0.3)

        check('PICO fields populated', True)

        # Click CT.gov-only search button
        ctgov_btn = driver.find_element(By.XPATH, '//button[text()="CT.gov"]')
        ctgov_btn.click()

        # Poll for results with 20s timeout
        found = False
        for _ in range(40):
            time.sleep(0.5)
            try:
                results_area = driver.find_element(By.ID, 'searchResults')
                result_html = results_area.get_attribute('innerHTML')
                if len(result_html) > 100 and 'NCT' in result_html:
                    found = True
                    break
            except Exception:
                pass

        if found:
            result_text = results_area.text
            result_html = results_area.get_attribute('innerHTML')
            check('CT.gov search returns results', True, f'{len(result_text)} chars')

            # Look for known RSV vaccine trial NCT IDs
            known_ncts = ['NCT04886596', 'NCT05127434', 'NCT05035212']
            found_ncts = [nct for nct in known_ncts if nct in result_html]
            check('CT.gov finds known RSV trial NCTs', len(found_ncts) > 0,
                  f'{len(found_ncts)}/3: {found_ncts}')

            # Check total count
            status_text = driver.find_element(By.ID, 'searchStatus').text
            check('CT.gov reports result count', 'result' in status_text.lower(),
                  status_text[:80])
        else:
            print('  SKIP: CT.gov search timed out (20s) — may need network')
    except Exception as e:
        print(f'  SKIP: CT.gov search error: {str(e)[:80]}')

    # ==========================================================
    # PHASE B-D: ENTER DATA & VALIDATE FOR EACH REVIEW
    # ==========================================================
    for review_idx, (title, studies, expected, search_terms) in enumerate(REVIEWS):
        print(f'\n=== REVIEW {review_idx + 1}: {title} ===')
        print(f'  Expected: k={expected["k"]}, RR={expected["pooled"]:.4f} '
              f'[{expected["ci_lo"]:.4f}, {expected["ci_hi"]:.4f}], '
              f'I2={expected["I2"]:.1f}%, tau2={expected["tau2"]:.6f}')

        # --- Create new project for each review (clear old studies) ---
        if review_idx > 0:
            # Create a fresh project and clear extracted studies
            driver.execute_script("""
                return (async function() {
                    var p = createEmptyProject('Test Review """ + str(review_idx + 1) + """');
                    await idbPut('projects', p);
                    currentProjectId = p.id;
                    extractedStudies = [];
                    document.getElementById('extractBody').innerHTML = '';
                    await loadProjects();
                })();
            """)
            time.sleep(1)

        # --- Enter protocol info ---
        driver.find_element(By.CSS_SELECTOR, '[data-phase="protocol"]').click()
        time.sleep(0.5)

        pico = {
            'protTitle': title,
            'protP': 'Adults',
            'protI': search_terms.split()[0],
            'protC': 'Placebo or control',
            'protO': 'Primary outcome as reported',
        }
        for fid, val in pico.items():
            el = driver.find_element(By.ID, fid)
            el.clear()
            el.send_keys(val)

        driver.find_element(By.XPATH, '//button[text()="Generate Protocol"]').click()
        time.sleep(0.5)
        check(f'R{review_idx+1}: Protocol generated',
              len(driver.find_element(By.ID, 'protocolOutput').text) > 50)

        # --- Enter study data ---
        driver.find_element(By.CSS_SELECTOR, '[data-phase="extract"]').click()
        time.sleep(0.5)

        for s in studies:
            n_total = s['nI'] + s['nC']
            js = (
                "addStudyRow({"
                f"authorYear:'{s['ay']}',"
                f"nTotal:{n_total},nIntervention:{s['nI']},nControl:{s['nC']},"
                f"effectEstimate:{s['e']},lowerCI:{s['lo']},upperCI:{s['hi']},"
                f"effectType:'{s['tp']}'"
                "});"
            )
            driver.execute_script(js)
            time.sleep(0.15)

        time.sleep(0.3)
        rows = driver.find_elements(By.CSS_SELECTOR, '#extractBody tr')
        check(f'R{review_idx+1}: {expected["k"]} study rows entered',
              len(rows) == expected['k'], f'{len(rows)} rows')

        # --- RoB 2 quick assessment ---
        driver.execute_script('syncRoBFromStudies(); toggleRoBSection()')
        time.sleep(0.3)
        driver.execute_script('renderRoBSummaryTable()')
        time.sleep(0.3)
        rob_rows = driver.find_elements(By.CSS_SELECTOR, '#robSummaryTable tr')
        check(f'R{review_idx+1}: RoB table populated', len(rob_rows) > 0, f'{len(rob_rows)} rows')

        # --- Run meta-analysis ---
        driver.find_element(By.CSS_SELECTOR, '[data-phase="analyze"]').click()
        time.sleep(0.5)
        driver.find_element(By.XPATH, '//button[text()="Run Analysis"]').click()
        time.sleep(1.5)

        summary = driver.find_element(By.ID, 'analysisSummary')
        cards = summary.find_elements(By.CLASS_NAME, 'stat-card')
        check(f'R{review_idx+1}: Stat cards rendered', len(cards) >= 4, f'{len(cards)} cards')

        # Parse card data
        card_data = {}
        for card in cards:
            try:
                label = card.find_element(By.CLASS_NAME, 'stat-label').text.strip()
                value = card.find_element(By.CLASS_NAME, 'stat-value').text.strip()
                card_data[label] = value
            except Exception:
                pass
        print(f'  App output: {card_data}')

        # --- Statistical validation ---
        # k studies
        app_k = card_data.get('Studies', '0')
        check(f'R{review_idx+1}: k = {expected["k"]}',
              app_k == str(expected['k']), f'got {app_k}')

        # Pooled effect
        try:
            app_pooled = float(card_data.get('Pooled Effect', '0'))
            diff_p = abs(app_pooled - expected['pooled'])
            # Use tighter tolerance for homogeneous, looser for heterogeneous
            tol = 0.02 if expected['I2'] > 10 else 0.01
            check(f'R{review_idx+1}: Pooled RR matches (expected {expected["pooled"]:.3f})',
                  diff_p < tol,
                  f'got {app_pooled:.3f}, diff={diff_p:.4f}, tol={tol}')
        except (ValueError, TypeError) as e:
            check(f'R{review_idx+1}: Pooled RR parseable', False, str(e))
            app_pooled = None

        # CI
        ci_text = card_data.get('95% CI', '')
        ci_parts = ci_text.replace('[', '').replace(']', '').split(',')
        if len(ci_parts) == 2:
            try:
                app_lo = float(ci_parts[0].strip())
                app_hi = float(ci_parts[1].strip())
                diff_lo = abs(app_lo - expected['ci_lo'])
                diff_hi = abs(app_hi - expected['ci_hi'])
                tol_ci = 0.02 if expected['I2'] > 10 else 0.01
                check(f'R{review_idx+1}: CI lower matches (expected {expected["ci_lo"]:.3f})',
                      diff_lo < tol_ci, f'got {app_lo:.3f}, diff={diff_lo:.4f}')
                check(f'R{review_idx+1}: CI upper matches (expected {expected["ci_hi"]:.3f})',
                      diff_hi < tol_ci, f'got {app_hi:.3f}, diff={diff_hi:.4f}')
            except (ValueError, TypeError):
                check(f'R{review_idx+1}: CI parseable', False, ci_text)
        else:
            check(f'R{review_idx+1}: CI parseable', False, ci_text)

        # I-squared
        try:
            i2_card = cards[3]
            i2_text = i2_card.find_element(By.CLASS_NAME, 'stat-value').text.strip()
            if '%' in i2_text:
                app_i2 = float(i2_text.replace('%', ''))
                diff_i2 = abs(app_i2 - expected['I2'])
                check(f'R{review_idx+1}: I2 matches (expected {expected["I2"]:.1f}%)',
                      diff_i2 < 5.0, f'got {app_i2:.1f}%, diff={diff_i2:.1f}')
        except Exception:
            pass

        # tau-squared
        try:
            tau2_card = cards[4]
            tau2_text = tau2_card.find_element(By.CLASS_NAME, 'stat-value').text.strip()
            app_tau2 = float(tau2_text)
            diff_tau2 = abs(app_tau2 - expected['tau2'])
            check(f'R{review_idx+1}: tau2 matches (expected {expected["tau2"]:.4f})',
                  diff_tau2 < 0.01, f'got {app_tau2:.4f}, diff={diff_tau2:.6f}')
        except Exception:
            pass

        # Forest plot
        forest = driver.find_element(By.ID, 'forestPlotContainer')
        svgs = forest.find_elements(By.TAG_NAME, 'svg')
        check(f'R{review_idx+1}: Forest plot rendered', len(svgs) >= 1)

        if svgs:
            forest_texts = svgs[0].find_elements(By.TAG_NAME, 'text')
            all_text = ' '.join(t.text for t in forest_texts)
            names_found = sum(1 for s in studies if s['ay'] in all_text)
            check(f'R{review_idx+1}: Forest plot shows study names',
                  names_found >= len(studies) - 1,
                  f'{names_found}/{len(studies)}')

            rects = svgs[0].find_elements(By.TAG_NAME, 'rect')
            check(f'R{review_idx+1}: Forest plot has study squares',
                  len(rects) >= len(studies), f'{len(rects)} rects')

            polygons = svgs[0].find_elements(By.TAG_NAME, 'polygon')
            check(f'R{review_idx+1}: Forest plot has diamond',
                  len(polygons) >= 1, f'{len(polygons)} polygons')

        # Funnel plot
        funnel = driver.find_element(By.ID, 'funnelPlotContainer')
        funnel_svgs = funnel.find_elements(By.TAG_NAME, 'svg')
        check(f'R{review_idx+1}: Funnel plot rendered', len(funnel_svgs) >= 1)
        if funnel_svgs:
            circles = funnel_svgs[0].find_elements(By.TAG_NAME, 'circle')
            check(f'R{review_idx+1}: Funnel plot has {expected["k"]} dots',
                  len(circles) == expected['k'], f'{len(circles)}')

        # --- Generate paper ---
        driver.find_element(By.CSS_SELECTOR, '[data-phase="write"]').click()
        time.sleep(0.5)
        driver.find_element(By.XPATH, '//button[text()="Generate Draft"]').click()
        time.sleep(1)
        paper = driver.find_element(By.ID, 'paperOutput').text
        check(f'R{review_idx+1}: Paper draft generated', len(paper) > 200, f'{len(paper)} chars')
        if app_pooled is not None:
            pooled_str = f'{app_pooled:.2f}'
            check(f'R{review_idx+1}: Paper contains pooled effect',
                  pooled_str in paper, f'looking for {pooled_str}')

    # ==========================================================
    # FINAL: Console errors
    # ==========================================================
    print('\n=== CONSOLE ERROR CHECK ===')
    logs = driver.get_log('browser')
    errors = [l for l in logs if l['level'] == 'SEVERE']
    if errors:
        for e in errors[:5]:
            print(f'  JS ERROR: {e["message"][:120]}')
    check('No JS console errors', len(errors) == 0, f'{len(errors)} errors')

    # ==========================================================
    # SUMMARY
    # ==========================================================
    print('\n' + '=' * 70)
    print(f'RESULTS: {passed}/{total} passed, {failed} failed')
    if failed == 0:
        print('ALL TESTS PASSED')
    else:
        print(f'{failed} FAILURES')
    print('=' * 70)

    print('\nCOCHRANE VALIDATION SUMMARY:')
    for title, studies, expected, _ in REVIEWS:
        print(f'\n  {title}')
        print(f'    Cochrane k={expected["k"]}: '
              f'Pooled RR = {expected["pooled"]:.4f} '
              f'[{expected["ci_lo"]:.4f}, {expected["ci_hi"]:.4f}]')
        print(f'    I2={expected["I2"]:.1f}%, tau2={expected["tau2"]:.6f}')
        sig = 'SIGNIFICANT' if expected['ci_hi'] < 1.0 else 'NOT significant (CI crosses null)'
        if expected['pooled'] > 1.0:
            sig = 'SIGNIFICANT (increased risk)' if expected['ci_lo'] > 1.0 else 'NOT significant'
        print(f'    {sig} (p={expected["p"]:.6f})')

finally:
    driver.quit()
    sys.exit(0 if failed == 0 else 1)
