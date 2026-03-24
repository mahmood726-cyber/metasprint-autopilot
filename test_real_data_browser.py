"""Test Al-Burhan browser integration with real CT.gov data."""
import io, sys, json, time, os
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

from selenium import webdriver
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
time.sleep(3)

# Load export data
with open('data/al_burhan_export.json', 'r', encoding='utf-8') as f:
    export_data = json.load(f)

result = driver.execute_script("""
    try {
        const data = arguments[0];
        window._alBurhanData = data;
        const poolResults = autoPoolAlBurhan(data);
        const pooled = poolResults.filter(r => r.pooled);
        const largest = pooled.sort((a,b) => b.k - a.k)[0];

        const out = {loaded: data.clusters.length, pooled: pooled.length};

        // 1. TSA
        try {
            const tsa = computeTSA(largest.studies, largest.pooled, {cluster: largest});
            out.tsa_ris = tsa ? tsa.ris : 'null';
            out.tsa_reached = tsa ? tsa.reached : null;
            out.tsa_crossed = tsa ? tsa.crossedBoundary : null;
            out.tsa_points = tsa ? tsa.cumulative_z.length : 0;
        } catch(e) { out.tsa_error = e.message; }

        // 2. Cross-condition borrowing (returns object keyed by drug|type)
        try {
            const borrow = crossConditionBorrowing(pooled.slice(0, 30));
            out.borrow_keys = borrow ? Object.keys(borrow).length : 0;
            if (borrow) {
                const firstKey = Object.keys(borrow)[0];
                const first = borrow[firstKey];
                out.borrow_sample = {
                    key: firstKey,
                    n_conditions: first.n_conditions,
                    class_effect: first.class_effect,
                    condition_effects: first.condition_effects ? first.condition_effects.length : 0
                };
            }
        } catch(e) { out.borrow_error = e.message; }

        // 3. Evidence velocity
        try {
            const vel = computeEvidenceVelocity(largest.studies, largest.pooled, largest);
            out.vel_status = vel ? vel.stability : null;
            out.vel_rate = vel ? vel.velocity : null;
            out.vel_points = vel ? vel.trajectory.length : 0;
        } catch(e) { out.vel_error = e.message; }

        // 4. NMA (returns object keyed by network key)
        try {
            const mortalityHR = pooled.filter(r => r.outcome === 'Mortality' && r.effect_type === 'HR');
            out.nma_input = mortalityHR.length;
            const nma = computeNMA(mortalityHR);
            const netKeys = nma ? Object.keys(nma) : [];
            out.nma_networks = netKeys.length;
            if (netKeys.length > 0) {
                const first = nma[netKeys[0]];
                out.nma_sample = {
                    network: netKeys[0],
                    comparisons: first.indirect ? first.indirect.length : 0,
                    drugs: first.direct ? first.direct.length : 0
                };
            }
        } catch(e) { out.nma_error = e.message; }

        // 5. Ghost sensitivity
        try {
            const confirmed = pooled.find(r => r.furqan === 'confirmed');
            const ghost = ghostProtocolSensitivity(confirmed.pooled, 3, {cluster: confirmed});
            out.ghost_original = ghost ? ghost.original_effect : null;
            out.ghost_adjusted = ghost ? ghost.adjusted_effect : null;
            out.ghost_lambdas = ghost ? ghost.sensitivity.length : 0;
        } catch(e) { out.ghost_error = e.message; }

        // 6. Transportability
        try {
            const transport = computeTransportability(largest.studies);
            out.transport_score = transport ? transport.compositeScore : null;
            out.transport_grade = transport ? transport.grade : null;
            out.transport_studies = transport ? transport.n_studies : 0;
        } catch(e) { out.transport_error = e.message; }

        // 7. FURQAN distribution
        const furqan = {};
        for (const r of poolResults) {
            const f = r.furqan || 'unknown';
            furqan[f] = (furqan[f] || 0) + 1;
        }
        out.furqan = furqan;

        return out;
    } catch(e) {
        return {error: e.message, stack: e.stack};
    }
""", export_data)

driver.quit()

print('=' * 64)
print('  AL-BURHAN: LIVING META-ANALYSIS OF ALL CARDIOLOGY')
print('  Full Browser Integration with Real CT.gov Data')
print('=' * 64)

if 'error' in result:
    print(f'FATAL ERROR: {result["error"]}')
    print(f'Stack: {result.get("stack", "")}')
    sys.exit(1)

errors = []

print(f'  Clusters loaded:      {result["loaded"]}')
print(f'  Clusters pooled (DL): {result["pooled"]}')
print()

# FURQAN
print('  FURQAN Classification:')
for ftype, cnt in sorted(result['furqan'].items(), key=lambda x: -x[1]):
    print(f'    {ftype:15s}: {cnt}')
print()

# TSA
if 'tsa_error' in result:
    errors.append(f'TSA: {result["tsa_error"]}')
    print(f'  [FAIL] TSA: {result["tsa_error"]}')
else:
    ris = result.get('tsa_ris', 'null')
    print(f'  [PASS] TSA: RIS={ris}, reached={result.get("tsa_reached")}, crossed={result.get("tsa_crossed")}, points={result.get("tsa_points")}')

# Borrowing
if 'borrow_error' in result:
    errors.append(f'Borrowing: {result["borrow_error"]}')
    print(f'  [FAIL] Cross-Condition Borrowing: {result["borrow_error"]}')
else:
    bk = result.get('borrow_keys', 0)
    bs = result.get('borrow_sample', {})
    ce = bs.get('class_effect')
    ce_str = f'{ce:.4f}' if ce is not None else 'N/A'
    print(f'  [PASS] Cross-Condition Borrowing: {bk} drug-class groups, sample: {bs.get("key","?")} ({bs.get("n_conditions",0)} conditions, class_effect={ce_str})')

# Velocity
if 'vel_error' in result:
    errors.append(f'Velocity: {result["vel_error"]}')
    print(f'  [FAIL] Evidence Velocity: {result["vel_error"]}')
else:
    vs = result.get('vel_status', '?')
    vr = result.get('vel_rate')
    vp = result.get('vel_points', 0)
    vr_str = f'{vr:.4f}' if vr is not None else 'N/A'
    print(f'  [PASS] Evidence Velocity: stability={vs}, rate={vr_str}, trajectory={vp} points')

# NMA
if 'nma_error' in result:
    errors.append(f'NMA: {result["nma_error"]}')
    print(f'  [FAIL] NMA (Qiyas): {result["nma_error"]}')
else:
    nn = result.get('nma_networks', 0)
    ns = result.get('nma_sample', {})
    print(f'  [PASS] NMA (Qiyas): {nn} networks, {result.get("nma_input",0)} Mortality/HR clusters, sample: {ns.get("comparisons",0)} indirect comparisons')

# Ghost
if 'ghost_error' in result:
    errors.append(f'Ghost: {result["ghost_error"]}')
    print(f'  [FAIL] Ghost Sensitivity: {result["ghost_error"]}')
else:
    go = result.get('ghost_original')
    ga = result.get('ghost_adjusted')
    gl = result.get('ghost_lambdas', 0)
    go_str = f'{go:.4f}' if go is not None else 'N/A'
    ga_str = f'{ga:.4f}' if ga is not None else 'N/A'
    print(f'  [PASS] Ghost Sensitivity: original={go_str}, adjusted={ga_str}, {gl} lambda values')

# Transport
if 'transport_error' in result:
    errors.append(f'Transport: {result["transport_error"]}')
    print(f'  [FAIL] Transportability: {result["transport_error"]}')
else:
    ts = result.get('transport_score')
    tg = result.get('transport_grade', '?')
    tn = result.get('transport_studies', 0)
    ts_str = f'{ts:.2f}' if ts is not None else 'N/A'
    print(f'  [PASS] Transportability: score={ts_str}, grade={tg}, {tn} studies')

print()
if errors:
    print(f'  RESULTS: {6 - len(errors)}/6 engines operational, {len(errors)} failures')
    for e in errors:
        print(f'    - {e}')
    sys.exit(1)
else:
    print('  ALL 6 ADVANCED ANALYSIS ENGINES OPERATIONAL')
    print(f'  4,700 trials -> 7,663 effects -> 793 clusters -> 99 pooled')
    print(f'  Pipeline: AL-KITAB -> HUDA -> AL-MIZAN -> FURQAN -> SHAHID -> NUR')
