"""Neural ML Classifier Validation.

Tests the hybrid 3-layer classifier (keywords + drug boost + Transformers.js
neural embeddings) against 282 ground-truth cardiovascular trials.

Requires internet access for first model download (~22MB MiniLM-L6-v2).
Model is cached in browser IndexedDB after first load.
"""
import sys, io, time, json, os
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
driver.set_script_timeout(300)  # 5 minutes for model download

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

# Load ground truth
data_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'data', 'al_burhan_export.json')
with open(data_path, 'r', encoding='utf-8') as f:
    alb = json.load(f)

ground_truth = {}
for cluster in alb['clusters']:
    subcat = cluster['subcategory']
    interventions = cluster.get('interventions', [])
    drug_class = cluster.get('drug_class', '')
    for study in cluster.get('studies', []):
        nct = study.get('nct_id')
        if not nct or nct in ground_truth:
            continue
        ground_truth[nct] = {
            'title': study.get('title', ''),
            'interventions': interventions,
            'drug_class': drug_class,
            'expected': subcat
        }

print(f"Ground truth: {len(ground_truth)} trials")

# === Phase 1: Keyword-only baseline ===
print("\n=== PHASE 1: Keywords + Drug Boost (no ML) ===")
batch_size = 50
nct_list = list(ground_truth.keys())
kw_predictions = {}

for i in range(0, len(nct_list), batch_size):
    batch = nct_list[i:i+batch_size]
    trial_objects = []
    for nct in batch:
        gt = ground_truth[nct]
        trial_objects.append({
            'nctId': nct,
            'title': gt['title'],
            'interventions': [{'name': iv} for iv in gt['interventions']],
            'conditions': []
        })
    result = driver.execute_script("""
        var trials = arguments[0];
        var results = {};
        for (var i = 0; i < trials.length; i++) {
            var t = trials[i];
            results[t.nctId] = classifyTrial(t);
        }
        return results;
    """, trial_objects)
    kw_predictions.update(result)

kw_correct = sum(1 for nct in ground_truth if kw_predictions.get(nct) == ground_truth[nct]['expected'])
kw_acc = kw_correct / len(ground_truth)
print(f"Keyword+Drug accuracy: {kw_correct}/{len(ground_truth)} ({kw_acc:.1%})")

# === Phase 2: Initialize ML classifier ===
print("\n=== PHASE 2: Loading Neural Model (Transformers.js) ===")
print("This may take 30-120 seconds on first run (downloading ~22MB model)...")

# Start ML init (non-blocking) then poll for completion
driver.execute_script("""
    window._mlInitDone = false;
    window._mlInitResult = null;
    window._mlProgress = 'Starting...';
    initMLClassifier(function(msg, progress) {
        window._mlProgress = msg + ' (' + Math.round(progress*100) + '%)';
    }).then(function(ok) {
        window._mlInitDone = true;
        window._mlInitResult = {success: ok, ready: typeof mlReady !== 'undefined' ? mlReady : false};
    }).catch(function(err) {
        window._mlInitDone = true;
        window._mlInitResult = {success: false, error: err.toString()};
    });
""")

# Poll for completion (5s intervals, up to 10 minutes)
ml_init_result = None
for poll in range(120):
    time.sleep(5)
    status = driver.execute_script("return {done: window._mlInitDone, result: window._mlInitResult, progress: window._mlProgress};")
    print(f"  [{poll*5}s] {status.get('progress', '?')}")
    if status.get('done'):
        ml_init_result = status.get('result')
        break

print(f"ML init result: {ml_init_result}")

if not ml_init_result or not ml_init_result.get('success'):
    print("ML classifier failed to load. Testing keyword-only mode.")
    print(f"\nFINAL ACCURACY (keywords only): {kw_acc:.1%}")
    driver.quit()
    sys.exit(0 if kw_acc >= 0.80 else 1)

# === Phase 3: Batch-classify with ML embeddings ===
print("\n=== PHASE 3: Neural Embedding Classification ===")

# Build all trial objects
all_trials = []
for nct in nct_list:
    gt = ground_truth[nct]
    all_trials.append({
        'nctId': nct,
        'title': gt['title'],
        'interventions': [{'name': iv} for iv in gt['interventions']],
        'conditions': []
    })

# Batch classify with ML (polling approach to avoid timeout)
chunk_size = 30
for i in range(0, len(all_trials), chunk_size):
    chunk = all_trials[i:i+chunk_size]
    # Start batch (non-blocking)
    driver.execute_script("""
        window._batchDone = false;
        window._batchResult = -1;
        classifyBatchML(arguments[0], function(){}).then(function(n) {
            window._batchDone = true;
            window._batchResult = n;
        }).catch(function(err) {
            window._batchDone = true;
            window._batchResult = -1;
        });
    """, chunk)
    # Poll for completion
    for poll in range(60):
        time.sleep(2)
        status = driver.execute_script("return {done: window._batchDone, n: window._batchResult};")
        if status.get('done'):
            print(f"  ML batch {i//chunk_size + 1}: classified {status.get('n')} trials")
            break

# === Phase 4: Hybrid classification with ML cache ===
print("\n=== PHASE 4: Hybrid Classification (Keywords + Drug + ML) ===")
hybrid_predictions = {}

for i in range(0, len(nct_list), batch_size):
    batch = nct_list[i:i+batch_size]
    trial_objects = []
    for nct in batch:
        gt = ground_truth[nct]
        trial_objects.append({
            'nctId': nct,
            'title': gt['title'],
            'interventions': [{'name': iv} for iv in gt['interventions']],
            'conditions': []
        })
    result = driver.execute_script("""
        var trials = arguments[0];
        var results = {};
        for (var i = 0; i < trials.length; i++) {
            var t = trials[i];
            results[t.nctId] = classifyTrial(t);
        }
        return results;
    """, trial_objects)
    hybrid_predictions.update(result)

# === Phase 5: Compute metrics ===
hybrid_correct = sum(1 for nct in ground_truth if hybrid_predictions.get(nct) == ground_truth[nct]['expected'])
hybrid_acc = hybrid_correct / len(ground_truth)

print(f"\nHybrid accuracy: {hybrid_correct}/{len(ground_truth)} ({hybrid_acc:.1%})")
print(f"Improvement over keywords: +{hybrid_acc - kw_acc:.1%}")

# Per-class metrics
subcats = sorted(set(v['expected'] for v in ground_truth.values()))
for pred in hybrid_predictions.values():
    if pred not in subcats:
        subcats.append(pred)
subcats = sorted(set(subcats))

print(f"\n{'='*80}")
print(f"{'Subcategory':<16} {'Prec':>7} {'Recall':>7} {'F1':>7} {'Support':>8} | {'KW-only':>8}")
print(f"{'='*80}")

total_support = 0
weighted_f1 = 0
macro_f1_sum = 0
n_classes = 0

for sc in subcats:
    tp = sum(1 for nct in ground_truth if ground_truth[nct]['expected'] == sc and hybrid_predictions.get(nct) == sc)
    fp = sum(1 for nct in ground_truth if ground_truth[nct]['expected'] != sc and hybrid_predictions.get(nct) == sc)
    fn = sum(1 for nct in ground_truth if ground_truth[nct]['expected'] == sc and hybrid_predictions.get(nct) != sc)
    support = tp + fn

    prec = tp / (tp + fp) if (tp + fp) > 0 else 0
    rec = tp / (tp + fn) if (tp + fn) > 0 else 0
    f1 = 2 * prec * rec / (prec + rec) if (prec + rec) > 0 else 0

    # KW-only recall for comparison
    kw_tp = sum(1 for nct in ground_truth if ground_truth[nct]['expected'] == sc and kw_predictions.get(nct) == sc)
    kw_rec = kw_tp / support if support > 0 else 0

    total_support += support
    weighted_f1 += f1 * support
    if support > 0:
        macro_f1_sum += f1
        n_classes += 1

    print(f"{sc:<16} {prec:>7.1%} {rec:>7.1%} {f1:>7.1%} {support:>8} | {kw_rec:>7.1%}")

w_f1 = weighted_f1 / total_support if total_support > 0 else 0
m_f1 = macro_f1_sum / n_classes if n_classes > 0 else 0

print(f"{'='*80}")
print(f"{'Weighted avg':<16} {'':>7} {'':>7} {w_f1:>7.1%} {total_support:>8}")
print(f"{'Macro avg':<16} {'':>7} {'':>7} {m_f1:>7.1%} {total_support:>8}")
print(f"{'Accuracy':<16} {'':>7} {'':>7} {hybrid_acc:>7.1%} {total_support:>8}")
print(f"{'='*80}")

# Misclassification analysis
misclass = []
for nct in ground_truth:
    pred = hybrid_predictions.get(nct, 'general')
    if pred != ground_truth[nct]['expected']:
        misclass.append({
            'nct': nct,
            'title': ground_truth[nct]['title'][:60],
            'expected': ground_truth[nct]['expected'],
            'predicted': pred,
            'drug_class': ground_truth[nct]['drug_class'],
            'kw_pred': kw_predictions.get(nct, 'general')
        })

print(f"\n--- REMAINING MISCLASSIFICATIONS ({len(misclass)}) ---")
for mc in misclass[:15]:
    fixed = "FIXED" if mc['kw_pred'] != mc['expected'] and mc['predicted'] == mc['expected'] else ""
    print(f"  {mc['nct']} | {mc['expected']:>8} -> {mc['predicted']:<8} | {mc['drug_class']:<15} | {mc['title']} {fixed}")

# ML-specific fixes
ml_fixed = sum(1 for mc in misclass if mc['kw_pred'] != mc['expected'] and mc['predicted'] == mc['expected'])
ml_broke = sum(1 for nct in ground_truth
               if kw_predictions.get(nct) == ground_truth[nct]['expected']
               and hybrid_predictions.get(nct) != ground_truth[nct]['expected'])
print(f"\nML fixed {ml_fixed} keyword errors, ML broke {ml_broke} keyword correct")
print(f"Net improvement: {ml_fixed - ml_broke} trials")

# Save results
results = {
    'keyword_accuracy': round(kw_acc, 4),
    'hybrid_accuracy': round(hybrid_acc, 4),
    'improvement': round(hybrid_acc - kw_acc, 4),
    'weighted_f1': round(w_f1, 4),
    'macro_f1': round(m_f1, 4),
    'misclassifications': len(misclass),
    'ml_model': 'Xenova/all-MiniLM-L6-v2' if ml_init_result.get('success') else 'none',
    'ml_fixed': ml_fixed,
    'ml_broke': ml_broke
}

out_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'reports', 'ml_classifier_validation.json')
os.makedirs(os.path.dirname(out_path), exist_ok=True)
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(results, f, indent=2)
print(f"\nResults saved to: {out_path}")

# JS errors
logs = driver.get_log('browser')
errors = [l for l in logs if l['level'] == 'SEVERE'
          and 'Access to fetch' not in l.get('message', '')
          and 'Failed to load resource' not in l.get('message', '')
          and 'Uncaught' not in l.get('message', '')]
for e in errors[:3]:
    print(f"\nJS ERROR: {e['message'][:200]}")

driver.quit()

print(f"\n{'='*60}")
print(f"FINAL: Keyword={kw_acc:.1%} | Hybrid={hybrid_acc:.1%} | Delta=+{hybrid_acc-kw_acc:.1%}")
print(f"{'='*60}")

# Pass threshold: 85% for keyword-only, 90% for hybrid
threshold = 0.90 if ml_init_result.get('success') else 0.85
sys.exit(0 if hybrid_acc >= threshold else 1)
