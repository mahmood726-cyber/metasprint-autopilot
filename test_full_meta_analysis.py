#!/usr/bin/env python3
"""Full end-to-end meta-analysis test for MetaSprint Autopilot.

Enters 6 real studies (beta-blockers in heart failure), runs the DL random-effects
meta-analysis, and validates the pooled OR against hand-calculated values.
Also tests sprint dashboard, DoD gates, RoB 2, protocol, paper generation, and dark mode.
"""

import sys
import io
import time
import math
import json
from pathlib import Path

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


# ===== STUDY DATA (beta-blockers in HF, OR scale) =====
STUDIES = [
    {'ay': 'Packer 2001', 'nT': 200, 'nI': 100, 'nC': 100, 'e': 0.75, 'lo': 0.55, 'hi': 1.02, 'tp': 'OR'},
    {'ay': 'MERIT-HF 1999', 'nT': 150, 'nI': 75, 'nC': 75, 'e': 0.62, 'lo': 0.40, 'hi': 0.96, 'tp': 'OR'},
    {'ay': 'CIBIS-II 1999', 'nT': 180, 'nI': 90, 'nC': 90, 'e': 0.88, 'lo': 0.60, 'hi': 1.29, 'tp': 'OR'},
    {'ay': 'COPERNICUS 2001', 'nT': 120, 'nI': 60, 'nC': 60, 'e': 0.55, 'lo': 0.35, 'hi': 0.86, 'tp': 'OR'},
    {'ay': 'SENIORS 2005', 'nT': 250, 'nI': 125, 'nC': 125, 'e': 0.70, 'lo': 0.50, 'hi': 0.98, 'tp': 'OR'},
    {'ay': 'Hjalmarson 2000', 'nT': 160, 'nI': 80, 'nC': 80, 'e': 0.82, 'lo': 0.58, 'hi': 1.16, 'tp': 'OR'},
]

# ===== HAND-CALCULATED DL RANDOM-EFFECTS =====
z_crit = 1.959964
log_data = []
for s in STUDIES:
    yi = math.log(s['e'])
    se = (math.log(s['hi']) - math.log(s['lo'])) / (2 * z_crit)
    wi = 1 / (se * se)
    log_data.append({'yi': yi, 'se': se, 'wi': wi})

sum_w = sum(d['wi'] for d in log_data)
mu_fe = sum(d['wi'] * d['yi'] for d in log_data) / sum_w
Q = sum(d['wi'] * (d['yi'] - mu_fe) ** 2 for d in log_data)
df = len(log_data) - 1
C = sum_w - sum(d['wi'] ** 2 for d in log_data) / sum_w
tau2 = max(0, (Q - df) / C)
I2 = max(0, (Q - df) / Q * 100) if Q > 0 else 0

re_data = [{'yi': d['yi'], 'wi_re': 1 / (d['se'] ** 2 + tau2)} for d in log_data]
sum_w_re = sum(d['wi_re'] for d in re_data)
mu_re = sum(d['wi_re'] * d['yi'] for d in re_data) / sum_w_re
se_re = math.sqrt(1 / sum_w_re)
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
pooled_or = math.exp(mu_re)
ci_lo = math.exp(mu_re - z_crit * se_re)
ci_hi = math.exp(mu_re + z_crit * se_re)

print('=' * 70)
print('HAND-CALCULATED EXPECTED RESULTS')
print(f'  Pooled OR = {pooled_or:.4f}')
print(f'  95% CI    = [{ci_lo:.4f}, {ci_hi:.4f}]')
print(f'  tau2      = {tau2:.6f}')
print(f'  I2        = {I2:.1f}%')
print(f'  Q         = {Q:.4f} (df={df})')
print(f'  p-value   = {p_value:.6f}')
print('=' * 70)

app_pooled = None
app_lo = None
app_hi = None

try:
    driver.get(
        (Path(__file__).resolve().parent / 'metasprint-autopilot.html').as_uri()
    )
    time.sleep(2)

    # ============================================================
    print('\n=== PHASE 0: APP INITIALIZATION ===')
    # ============================================================
    check('Title loads', 'MetaSprint' in driver.title, driver.title)
    check(
        'Dashboard visible',
        driver.find_element(By.ID, 'phase-dashboard').is_displayed(),
    )
    check('Health score init', driver.find_element(By.ID, 'healthScore').text == '100%')

    # ============================================================
    print('\n=== PHASE 1: SPRINT DASHBOARD ===')
    # ============================================================
    for i in range(4):
        driver.find_element(By.ID, 'nextDayBtn').click()
        time.sleep(0.15)
    day = driver.find_element(By.ID, 'sprintDayNum').text
    check('Day advances to 5', day == '5', f'day={day}')

    goal = driver.find_element(By.ID, 'goalText').text
    check('Goal text updates per day', len(goal) > 10, goal[:60])

    tasks_el = driver.find_element(By.ID, 'sprintTasks')
    task_items = tasks_el.find_elements(By.CLASS_NAME, 'checklist-item')
    check('Tasks present for day 5', len(task_items) > 0, f'{len(task_items)} tasks')

    # Toggle a task
    task_items[0].click()
    time.sleep(0.3)
    tasks_el = driver.find_element(By.ID, 'sprintTasks')
    task_items = tasks_el.find_elements(By.CLASS_NAME, 'checklist-item')
    check('Task toggles on', 'checked' in task_items[0].get_attribute('class'))

    timeline = driver.find_element(By.ID, 'sprintTimeline')
    rows = timeline.find_elements(By.TAG_NAME, 'tr')
    check('Timeline has 5 phases', len(rows) == 5, f'{len(rows)} rows')

    risk = driver.find_element(By.ID, 'riskBadge').text
    check('Risk panel renders', risk in ['LOW', 'MEDIUM', 'HIGH'], risk)

    # ============================================================
    print('\n=== PHASE 2: PROTOCOL GENERATION ===')
    # ============================================================
    driver.find_element(By.CSS_SELECTOR, '[data-phase="protocol"]').click()
    time.sleep(0.5)
    check(
        'Protocol tab visible',
        driver.find_element(By.ID, 'phase-protocol').is_displayed(),
    )

    pico = {
        'protTitle': 'Beta-blockers vs placebo in heart failure: a meta-analysis',
        'protP': 'Adults with chronic heart failure (NYHA II-IV)',
        'protI': 'Beta-blockers (carvedilol, metoprolol, bisoprolol, nebivolol)',
        'protC': 'Placebo or standard care',
        'protO': 'All-cause mortality',
    }
    for fid, val in pico.items():
        el = driver.find_element(By.ID, fid)
        el.clear()
        el.send_keys(val)

    driver.find_element(By.XPATH, '//button[text()="Generate Protocol"]').click()
    time.sleep(0.5)
    output = driver.find_element(By.ID, 'protocolOutput')
    check(
        'Protocol generated',
        output.is_displayed() and len(output.text) > 100,
        f'{len(output.text)} chars',
    )
    check('Protocol has PICO', 'Beta-blockers' in output.text and 'heart failure' in output.text)
    check('Protocol has methods', 'DerSimonian-Laird' in output.text)

    # ============================================================
    print('\n=== PHASE 3: DATA EXTRACTION (6 studies) ===')
    # ============================================================
    driver.find_element(By.CSS_SELECTOR, '[data-phase="extract"]').click()
    time.sleep(0.5)
    check(
        'Extract tab visible',
        driver.find_element(By.ID, 'phase-extract').is_displayed(),
    )

    for s in STUDIES:
        js = (
            "addStudyRow({"
            f"authorYear:'{s['ay']}',"
            f"nTotal:{s['nT']},nIntervention:{s['nI']},nControl:{s['nC']},"
            f"effectEstimate:{s['e']},lowerCI:{s['lo']},upperCI:{s['hi']},"
            f"effectType:'{s['tp']}'"
            "});"
        )
        driver.execute_script(js)
        time.sleep(0.2)

    time.sleep(0.5)
    rows = driver.find_elements(By.CSS_SELECTOR, '#extractBody tr')
    check('6 study rows in table', len(rows) == 6, f'{len(rows)} rows')

    first_inputs = rows[0].find_elements(By.TAG_NAME, 'input')
    check(
        'Study ID populated',
        first_inputs[0].get_attribute('value') == 'Packer 2001',
        first_inputs[0].get_attribute('value'),
    )
    check(
        'Effect value correct',
        first_inputs[4].get_attribute('value') == '0.75',
        first_inputs[4].get_attribute('value'),
    )

    # ============================================================
    print('\n=== PHASE 4: RoB 2 ASSESSMENT ===')
    # ============================================================
    driver.execute_script('toggleRoBSection()')
    time.sleep(0.5)
    rob_body = driver.find_element(By.ID, 'robBody')
    check('RoB 2 section opens', rob_body.is_displayed())

    rob_table = driver.find_element(By.ID, 'robSummaryTable')
    rob_trs = rob_table.find_elements(By.TAG_NAME, 'tr')
    check('RoB table has 6+ rows', len(rob_trs) >= 6, f'{len(rob_trs)} rows')

    # Programmatically assess RoB for all 6 studies
    driver.execute_script("""
        var robs = getRoBAssessments();
        var judgments = [
            {d1:'low',d2:'low',d3:'low',d4:'low',d5:'low',overall:'low'},
            {d1:'low',d2:'low',d3:'some',d4:'low',d5:'low',overall:'low'},
            {d1:'some',d2:'low',d3:'low',d4:'some',d5:'low',overall:'some'},
            {d1:'low',d2:'some',d3:'high',d4:'low',d5:'some',overall:'high'},
            {d1:'low',d2:'low',d3:'low',d4:'low',d5:'low',overall:'low'},
            {d1:'some',d2:'some',d3:'low',d4:'low',d5:'some',overall:'some'}
        ];
        robs.forEach(function(r, i) {
            if (i < judgments.length) {
                var j = judgments[i];
                r.d1 = j.d1; r.d2 = j.d2; r.d3 = j.d3;
                r.d4 = j.d4; r.d5 = j.d5; r.overall = j.overall;
            }
        });
        saveSprintState();
        renderRoBSummaryTable();
        computeGRADERoBSuggestion();
    """)
    time.sleep(0.3)

    grade = driver.find_element(By.ID, 'robGradeBanner')
    check('GRADE RoB banner visible', grade.is_displayed(), grade.text[:80])

    dots = driver.find_elements(By.CSS_SELECTOR, '.rob-dot.low, .rob-dot.some, .rob-dot.high')
    check('RoB dots colored', len(dots) > 0, f'{len(dots)} colored dots')

    # ============================================================
    print('\n=== PHASE 5: META-ANALYSIS (statistical validation) ===')
    # ============================================================
    driver.find_element(By.CSS_SELECTOR, '[data-phase="analyze"]').click()
    time.sleep(0.5)
    check(
        'Analyze tab visible',
        driver.find_element(By.ID, 'phase-analyze').is_displayed(),
    )

    driver.find_element(By.XPATH, '//button[text()="Run Analysis"]').click()
    time.sleep(1)

    summary = driver.find_element(By.ID, 'analysisSummary')
    cards = summary.find_elements(By.CLASS_NAME, 'stat-card')
    check('6 stat cards rendered', len(cards) == 6, f'{len(cards)} cards')

    # Parse all card data
    card_data = {}
    for card in cards:
        label = card.find_element(By.CLASS_NAME, 'stat-label').text.strip()
        value = card.find_element(By.CLASS_NAME, 'stat-value').text.strip()
        card_data[label] = value
    print(f'  App output: {card_data}')

    # k studies
    check('k = 6 studies', card_data.get('Studies') == '6', card_data.get('Studies'))

    # Pooled effect
    app_pooled = float(card_data.get('Pooled Effect', '0'))
    diff_p = abs(app_pooled - pooled_or)
    check(
        f'Pooled OR matches (expected {pooled_or:.3f})',
        diff_p < 0.01,
        f'got {app_pooled:.3f}, diff={diff_p:.6f}',
    )

    # CI
    ci_text = card_data.get('95% CI', '')
    ci_parts = ci_text.replace('[', '').replace(']', '').split(',')
    if len(ci_parts) == 2:
        app_lo = float(ci_parts[0].strip())
        app_hi = float(ci_parts[1].strip())
        diff_lo = abs(app_lo - ci_lo)
        diff_hi = abs(app_hi - ci_hi)
        check(
            f'CI lower matches (expected {ci_lo:.3f})',
            diff_lo < 0.01,
            f'got {app_lo:.3f}, diff={diff_lo:.6f}',
        )
        check(
            f'CI upper matches (expected {ci_hi:.3f})',
            diff_hi < 0.01,
            f'got {app_hi:.3f}, diff={diff_hi:.6f}',
        )
    else:
        check('CI parseable', False, ci_text)

    # I-squared (by card position since Unicode labels may not match)
    i2_val = cards[3].find_element(By.CLASS_NAME, 'stat-value').text.strip()
    if '%' in i2_val:
        app_i2 = float(i2_val.replace('%', ''))
        diff_i2 = abs(app_i2 - I2)
        check(f'I2 matches (expected {I2:.1f}%)', diff_i2 < 0.5, f'got {app_i2:.1f}%, diff={diff_i2:.2f}')

    # tau-squared (by position)
    tau2_val = cards[4].find_element(By.CLASS_NAME, 'stat-value').text.strip()
    app_tau2 = float(tau2_val)
    diff_tau2 = abs(app_tau2 - tau2)
    check(
        f'tau2 matches (expected {tau2:.4f})',
        diff_tau2 < 0.001,
        f'got {app_tau2:.4f}, diff={diff_tau2:.6f}',
    )

    # p-value (by position)
    p_val = cards[5].find_element(By.CLASS_NAME, 'stat-value').text.strip()
    if p_val == '< 0.001':
        check('p-value < 0.001', p_value < 0.001, f'expected p={p_value:.6f}')
    else:
        app_p = float(p_val)
        diff_pv = abs(app_p - p_value)
        check(f'p-value matches (expected {p_value:.4f})', diff_pv < 0.005, f'got {app_p}, diff={diff_pv:.6f}')

    # Forest plot
    forest = driver.find_element(By.ID, 'forestPlotContainer')
    svgs = forest.find_elements(By.TAG_NAME, 'svg')
    check('Forest plot SVG rendered', len(svgs) >= 1)

    if svgs:
        texts = svgs[0].find_elements(By.TAG_NAME, 'text')
        all_text = ' '.join(t.text for t in texts)
        study_names_found = sum(1 for s in STUDIES if s['ay'] in all_text)
        check('Forest plot shows study names', study_names_found >= 4, f'{study_names_found}/6 names')
        polygons = svgs[0].find_elements(By.TAG_NAME, 'polygon')
        check('Forest plot has diamond (pooled)', len(polygons) >= 1, f'{len(polygons)} polygons')
        rects = svgs[0].find_elements(By.TAG_NAME, 'rect')
        check('Forest plot has study squares', len(rects) >= 6, f'{len(rects)} rects')
        lines = svgs[0].find_elements(By.TAG_NAME, 'line')
        check('Forest plot has CI lines', len(lines) >= 6, f'{len(lines)} lines')

    # Funnel plot
    funnel = driver.find_element(By.ID, 'funnelPlotContainer')
    funnel_svgs = funnel.find_elements(By.TAG_NAME, 'svg')
    check('Funnel plot SVG rendered', len(funnel_svgs) >= 1)
    if funnel_svgs:
        circles = funnel_svgs[0].find_elements(By.TAG_NAME, 'circle')
        check('Funnel plot has 6 study dots', len(circles) == 6, f'{len(circles)} circles')

    # ============================================================
    print('\n=== PHASE 6: DOD CHECKPOINTS ===')
    # ============================================================
    driver.find_element(By.CSS_SELECTOR, '[data-phase="checkpoints"]').click()
    time.sleep(0.5)
    check(
        'Checkpoints tab visible',
        driver.find_element(By.ID, 'phase-checkpoints').is_displayed(),
    )

    dod_container = driver.find_element(By.ID, 'dodContainer')
    dod_sections = dod_container.find_elements(By.CLASS_NAME, 'dod-section')
    check('5 DoD sections', len(dod_sections) == 5, f'{len(dod_sections)}')

    all_items = dod_container.find_elements(By.CLASS_NAME, 'checklist-item')
    check('33 total DoD items', len(all_items) == 33, f'{len(all_items)}')

    # Check all DoD-A items via JS (avoids stale element from DOM re-render)
    dod_a_count = driver.execute_script("""
        var items = document.querySelectorAll('#dodContainer .dod-section:first-child .checklist-item');
        return items.length;
    """)
    for i in range(dod_a_count):
        driver.execute_script(f"""
            var items = document.querySelectorAll('#dodContainer .dod-section:first-child .checklist-item');
            if (items[{i}]) items[{i}].click();
        """)
        time.sleep(0.15)
    time.sleep(0.3)

    dod_container = driver.find_element(By.ID, 'dodContainer')
    dod_sections = dod_container.find_elements(By.CLASS_NAME, 'dod-section')
    dod_a_checked = [
        i
        for i in dod_sections[0].find_elements(By.CLASS_NAME, 'checklist-item')
        if 'checked' in i.get_attribute('class')
    ]
    check('All 9 DoD-A items checked', len(dod_a_checked) == 9, f'{len(dod_a_checked)}/9')

    # Sign off DoD-A
    driver.execute_script("""
        window.confirm = function(){return true};
        var btns = document.querySelectorAll('#dodContainer .dod-section:first-child button');
        if (btns.length) btns[btns.length - 1].click();
    """)
    time.sleep(0.5)

    dod_container = driver.find_element(By.ID, 'dodContainer')
    check('DoD-A signed off', 'PASSED' in dod_container.text)

    # Dashboard gate dot
    driver.find_element(By.CSS_SELECTOR, '[data-phase="dashboard"]').click()
    time.sleep(0.5)
    gate_a = driver.find_element(By.ID, 'gateA')
    check('Gate A dot passed', 'passed' in gate_a.get_attribute('class'))

    gates_el = driver.find_element(By.ID, 'gatesPassed')
    check('Gates count updated', '1/5' in gates_el.text, gates_el.text)

    # ============================================================
    print('\n=== PHASE 7: PAPER GENERATION ===')
    # ============================================================
    driver.find_element(By.CSS_SELECTOR, '[data-phase="write"]').click()
    time.sleep(0.5)
    check('Write tab visible', driver.find_element(By.ID, 'phase-write').is_displayed())

    driver.find_element(By.XPATH, '//button[text()="Generate Draft"]').click()
    time.sleep(1)
    paper = driver.find_element(By.ID, 'paperOutput').text
    check('Paper generated', len(paper) > 200, f'{len(paper)} chars')
    check('Paper has methods section', 'DerSimonian-Laird' in paper or 'random-effects' in paper.lower())
    check('Paper has heterogeneity', 'I-squared' in paper or 'heterogeneity' in paper.lower())
    # Check the actual pooled value appears
    or_str = f'{app_pooled:.2f}' if app_pooled else ''
    check('Paper has pooled OR', or_str in paper, f'looking for {or_str}')

    # ============================================================
    print('\n=== PHASE 8: DARK MODE ===')
    # ============================================================
    driver.find_element(By.ID, 'darkModeBtn').click()
    time.sleep(0.3)
    body_cls = driver.find_element(By.TAG_NAME, 'body').get_attribute('class')
    check('Dark mode on', 'dark-mode' in body_cls)

    driver.find_element(By.ID, 'darkModeBtn').click()
    time.sleep(0.3)
    body_cls = driver.find_element(By.TAG_NAME, 'body').get_attribute('class')
    check('Dark mode off', 'dark-mode' not in (body_cls or ''))

    # ============================================================
    print('\n=== PHASE 9: PROJECT EXPORT ===')
    # ============================================================
    exported = driver.execute_script(
        """
        var project = projects.find(function(p){return p.id === currentProjectId});
        return JSON.stringify({
            project: project,
            studies: extractedStudies,
            studyCount: extractedStudies.length,
            version: '1.0'
        });
    """
    )
    bundle = json.loads(exported)
    check('Export has project', bundle.get('project') is not None)
    check('Export has 6 studies', bundle.get('studyCount') == 6, str(bundle.get('studyCount')))

    # ============================================================
    print('\n=== PHASE 10: KEYBOARD SHORTCUTS ===')
    # ============================================================
    driver.find_element(By.CSS_SELECTOR, '[data-phase="dashboard"]').click()
    time.sleep(0.5)
    day_before = driver.find_element(By.ID, 'sprintDayNum').text
    body_el = driver.find_element(By.TAG_NAME, 'body')
    body_el.send_keys(Keys.ARROW_RIGHT)
    time.sleep(0.3)
    day_after = driver.find_element(By.ID, 'sprintDayNum').text
    check(
        'Arrow right increments day',
        int(day_after) == int(day_before) + 1,
        f'{day_before} -> {day_after}',
    )
    body_el.send_keys(Keys.ARROW_LEFT)
    time.sleep(0.3)
    day_back = driver.find_element(By.ID, 'sprintDayNum').text
    check('Arrow left decrements day', day_back == day_before, f'{day_after} -> {day_back}')

    # ============================================================
    print('\n=== PHASE 11: CONSOLE ERROR CHECK ===')
    # ============================================================
    logs = driver.get_log('browser')
    errors = [l for l in logs if l['level'] == 'SEVERE']
    if errors:
        for e in errors[:5]:
            print(f'  JS ERROR: {e["message"][:120]}')
    check('No JS console errors', len(errors) == 0, f'{len(errors)} errors')

    # ============================================================
    print('\n' + '=' * 70)
    print(f'RESULTS: {passed}/{total} passed, {failed} failed')
    if failed == 0:
        print('ALL TESTS PASSED')
    else:
        print(f'{failed} FAILURES')
    print('=' * 70)

    print('\nSTATISTICAL VALIDATION SUMMARY:')
    print(f'  Hand-calc pooled OR: {pooled_or:.4f}   App: {app_pooled:.4f}   Match: {abs(app_pooled - pooled_or) < 0.01}')
    if app_lo is not None:
        print(f'  Hand-calc CI lower:  {ci_lo:.4f}   App: {app_lo:.4f}   Match: {abs(app_lo - ci_lo) < 0.01}')
        print(f'  Hand-calc CI upper:  {ci_hi:.4f}   App: {app_hi:.4f}   Match: {abs(app_hi - ci_hi) < 0.01}')
    print(f'  Hand-calc I2:        {I2:.1f}%')
    print(f'  Hand-calc tau2:      {tau2:.6f}')
    print(f'  Conclusion: Pooled OR {pooled_or:.2f} (95% CI: {ci_lo:.2f}-{ci_hi:.2f})')
    if ci_hi < 1.0:
        print(f'  SIGNIFICANT: beta-blockers reduce mortality (p={p_value:.4f})')
    else:
        print(f'  NOT significant: CI crosses null')

finally:
    driver.quit()
    sys.exit(0 if failed == 0 else 1)
