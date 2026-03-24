"""
BLINDED EXTRACTOR: Drives MetaSprint Autopilot via Selenium.
Reads ONLY from blinded_inputs/ -- never touches sealed_oracle/.
Outputs raw MetaSprint analysis results to extractor_outputs/.
"""
import json, os, sys, time, glob, io, traceback

if hasattr(sys.stdout, 'buffer') and not isinstance(sys.stdout, io.TextIOWrapper):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


def create_driver():
    """Create headless Chrome driver."""
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


def load_app(driver, html_path):
    """Load MetaSprint Autopilot HTML app."""
    url = 'file:///' + html_path.replace('\\', '/').replace(' ', '%20')
    driver.get(url)
    time.sleep(2)
    # Wait for the extract table to be present
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'extractBody'))
    )
    # Switch to extraction phase
    driver.execute_script("switchPhase('extract')")
    time.sleep(0.5)


def enter_studies_via_js(driver, studies, effect_type='OR'):
    """Enter study data using JavaScript for speed and reliability."""
    # Build JavaScript to add all studies at once
    js_studies = []
    for s in studies:
        study_id = f"{s['study']} {s.get('year', '')}".strip()
        en = s.get('en', 0)
        cn = s.get('cn', 0)
        n_total = int(en + cn) if en and cn else 0
        js_studies.append({
            'authorYear': study_id,
            'nTotal': n_total,
            'nIntervention': int(en) if en else 0,
            'nControl': int(cn) if cn else 0,
            'effectEstimate': s['effect_estimate'],
            'lowerCI': s['lower_ci'],
            'upperCI': s['upper_ci'],
            'effectType': s.get('effect_type', effect_type),
        })

    driver.execute_script("""
        const studies = arguments[0];
        // Clear existing
        document.getElementById('extractBody').innerHTML = '';

        // PASS 1: Create all rows first
        for (let i = 0; i < studies.length; i++) {
            addStudyRow();
        }

        // PASS 2: Set values on each row
        const rows = document.querySelectorAll('#extractBody tr');
        for (let i = 0; i < studies.length; i++) {
            const s = studies[i];
            const row = rows[i];
            if (!row) continue;
            const inputs = row.querySelectorAll('input');
            const selects = row.querySelectorAll('select');

            if (inputs[0]) inputs[0].value = s.authorYear;
            if (inputs[1]) inputs[1].value = String(s.nTotal);
            if (inputs[2]) inputs[2].value = String(s.nIntervention);
            if (inputs[3]) inputs[3].value = String(s.nControl);
            if (inputs[4]) inputs[4].value = String(s.effectEstimate);
            if (inputs[5]) inputs[5].value = String(s.lowerCI);
            if (inputs[6]) inputs[6].value = String(s.upperCI);

            if (selects[0]) {
                selects[0].value = s.effectType;
                selects[0].dispatchEvent(new Event('change'));
            }
        }
    """, js_studies)
    time.sleep(0.3)


def run_analysis_js(driver):
    """Run analysis and extract results via JavaScript for precision."""
    # Switch to analysis phase and run
    result = driver.execute_script("""
        switchPhase('analyze');

        // Collect studies from extraction table
        const rows = document.querySelectorAll('#extractBody tr');
        const studies = [];
        for (const row of rows) {
            const inputs = row.querySelectorAll('input');
            const selects = row.querySelectorAll('select');
            if (inputs.length >= 7) {
                const eff = parseFloat(inputs[4].value);
                const lo = parseFloat(inputs[5].value);
                const hi = parseFloat(inputs[6].value);
                if (!isNaN(eff) && !isNaN(lo) && !isNaN(hi)) {
                    studies.push({
                        authorYear: inputs[0].value,
                        nTotal: parseInt(inputs[1].value) || 0,
                        nIntervention: parseInt(inputs[2].value) || 0,
                        nControl: parseInt(inputs[3].value) || 0,
                        effectEstimate: eff,
                        lowerCI: lo,
                        upperCI: hi,
                        effectType: selects[0] ? selects[0].value : 'OR'
                    });
                }
            }
        }

        if (studies.length < 2) return {error: 'Less than 2 valid studies', k_found: studies.length, rows_total: rows.length};

        // Run the meta-analysis engine directly
        const result = computeMetaAnalysis(studies);
        if (!result) return {error: 'computeMetaAnalysis returned null', k_found: studies.length};

        // Render plots into the actual containers
        const fpContainer = document.getElementById('forestPlotContainer');
        const fnContainer = document.getElementById('funnelPlotContainer');
        try {
            if (fpContainer) fpContainer.innerHTML = renderForestPlot(result);
        } catch(e) {}
        try {
            if (fnContainer) fnContainer.innerHTML = renderFunnelPlot(result);
        } catch(e) {}

        const forestSvg = fpContainer ? fpContainer.querySelector('svg') : null;
        const funnelSvg = fnContainer ? fnContainer.querySelector('svg') : null;

        return {
            k: result.k,
            pooled: result.pooled,
            pooled_lo: result.pooledLo,
            pooled_hi: result.pooledHi,
            tau2: result.tau2,
            I2: result.I2,
            Q: result.Q,
            p_value: result.pValue,
            pooled_log: result.muRE,
            pooled_se: result.seRE,
            is_ratio: result.isRatio,
            forest_plot_rendered: !!forestSvg,
            funnel_plot_rendered: !!funnelSvg,
            forest_studies: forestSvg ? forestSvg.querySelectorAll('rect').length : 0,
            funnel_dots: funnelSvg ? funnelSvg.querySelectorAll('circle').length : 0,
            conf_level: result.confLevel,
        };
    """)
    return result


def clear_app(driver):
    """Clear studies for next review."""
    driver.execute_script("""
        document.getElementById('extractBody').innerHTML = '';
        const fp = document.getElementById('forestPlotContainer');
        const fnp = document.getElementById('funnelPlotContainer');
        if (fp) fp.innerHTML = '';
        if (fnp) fnp.innerHTML = '';
    """)
    time.sleep(0.1)


def run_blinded_extraction(input_dir, output_dir, html_path, batch_size=100):
    """
    Main extraction loop: for each blinded input, drive MetaSprint and capture results.
    """
    os.makedirs(output_dir, exist_ok=True)

    input_files = sorted(glob.glob(os.path.join(input_dir, '*.json')))
    print(f'Found {len(input_files)} blinded input files')

    # Skip already extracted
    already_done = set()
    for f in glob.glob(os.path.join(output_dir, '*.json')):
        already_done.add(os.path.basename(f).replace('.json', ''))

    to_process = [(f, os.path.basename(f).replace('.json', '')) for f in input_files
                  if os.path.basename(f).replace('.json', '') not in already_done]
    print(f'Already extracted: {len(already_done)}, remaining: {len(to_process)}')

    if not to_process:
        print('Nothing to extract.')
        return len(already_done), 0

    driver = None
    processed = len(already_done)
    errors = 0
    t_start = time.time()

    try:
        driver = create_driver()
        load_app(driver, html_path)

        for i, (input_file, ds_name) in enumerate(to_process):
            # Restart browser periodically to manage memory
            if i > 0 and i % batch_size == 0:
                driver.quit()
                driver = create_driver()
                load_app(driver, html_path)
                print(f'  Browser restarted at review {i}')

            try:
                with open(input_file, 'r', encoding='utf-8') as fh:
                    blinded = json.load(fh)

                # BLINDING CHECK
                input_str = json.dumps(blinded).lower()
                assert 'pooled' not in input_str, f'BLINDING VIOLATION in {input_file}'

                # Clear and enter studies
                clear_app(driver)
                driver.execute_script("switchPhase('extract')")
                time.sleep(0.1)

                enter_studies_via_js(driver, blinded['studies'],
                                    effect_type=blinded.get('effect_type', 'OR'))

                # Run analysis
                results = run_analysis_js(driver)

                if results and results.get('error'):
                    raise RuntimeError(results['error'])

                output = {
                    'dataset_name': ds_name,
                    'cd_number': blinded['cd_number'],
                    'analysis_name': blinded.get('analysis_name', ''),
                    'effect_type': blinded.get('effect_type', 'OR'),
                    'k_input': blinded['k'],
                    'results': results,
                }

                output_path = os.path.join(output_dir, f'{ds_name}.json')
                with open(output_path, 'w', encoding='utf-8') as fh:
                    json.dump(output, fh, indent=2)

                processed += 1

            except Exception as e:
                errors += 1
                error_output = {
                    'dataset_name': ds_name,
                    'error': str(e),
                    'traceback': traceback.format_exc(),
                    'results': None,
                }
                output_path = os.path.join(output_dir, f'{ds_name}.json')
                with open(output_path, 'w', encoding='utf-8') as fh:
                    json.dump(error_output, fh, indent=2)

            # Progress report
            if (i + 1) % 25 == 0 or i == len(to_process) - 1:
                elapsed = time.time() - t_start
                rate = (i + 1) / elapsed if elapsed > 0 else 0
                eta = (len(to_process) - i - 1) / rate if rate > 0 else 0
                print(f'  [{i+1}/{len(to_process)}] {processed} ok, {errors} err, '
                      f'{rate:.1f} rev/s, ETA {eta:.0f}s')

    finally:
        if driver:
            driver.quit()

    elapsed = time.time() - t_start
    print(f'\nExtraction complete: {processed} processed, {errors} errors in {elapsed:.0f}s')
    return processed, errors


if __name__ == '__main__':
    BASE = os.path.dirname(os.path.abspath(__file__))
    INPUT_DIR = os.path.join(BASE, 'blinded_inputs')
    OUTPUT_DIR = os.path.join(BASE, 'extractor_outputs')
    HTML_PATH = os.path.join(os.path.dirname(BASE), 'metasprint-autopilot.html')

    run_blinded_extraction(INPUT_DIR, OUTPUT_DIR, HTML_PATH)
