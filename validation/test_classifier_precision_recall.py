"""Classifier Precision/Recall Validation.

Tests the CARDIO_SUBCATEGORIES keyword classifier against 282 ground-truth
cardiovascular trials from the Al-Burhan export. Each trial has a known
subcategory assigned by the FURQAN drug/outcome clustering pipeline.

Ground truth: cluster subcategory from pipeline (drug_class + outcome)
Prediction: classifyTrial() output from keyword matching on trial title + interventions

Metrics: per-class precision, recall, F1; macro and weighted averages.
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

# Load ground truth from Al-Burhan export
data_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'data', 'al_burhan_export.json')
with open(data_path, 'r', encoding='utf-8') as f:
    alb = json.load(f)

# Build ground truth: nct_id -> (title, interventions, expected_subcat)
# Use cluster subcategory as ground truth (assigned by drug/outcome pipeline)
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

print(f"Ground truth: {len(ground_truth)} unique trials across {len(set(v['expected'] for v in ground_truth.values()))} subcategories")

# Send trials to browser classifier in batches
batch_size = 50
nct_list = list(ground_truth.keys())
predictions = {}

for i in range(0, len(nct_list), batch_size):
    batch = nct_list[i:i+batch_size]
    # Build trial objects for classifyTrial()
    trial_objects = []
    for nct in batch:
        gt = ground_truth[nct]
        trial_objects.append({
            'nctId': nct,
            'title': gt['title'],
            'interventions': [{'name': iv} for iv in gt['interventions']],
            'conditions': []  # Title + interventions should suffice
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

    predictions.update(result)

print(f"Predictions: {len(predictions)} trials classified")

# Compute confusion matrix
subcats = sorted(set(v['expected'] for v in ground_truth.values()))
# Add any predicted categories not in ground truth
for pred in predictions.values():
    if pred not in subcats:
        subcats.append(pred)
subcats = sorted(set(subcats))

confusion = {true: {pred: 0 for pred in subcats} for true in subcats}
for nct, gt in ground_truth.items():
    pred = predictions.get(nct, 'general')
    true = gt['expected']
    confusion[true][pred] = confusion[true].get(pred, 0) + 1

# Compute per-class metrics
print(f"\n{'='*80}")
print(f"{'Subcategory':<16} {'TP':>5} {'FP':>5} {'FN':>5} {'Prec':>7} {'Recall':>7} {'F1':>7} {'Support':>8}")
print(f"{'='*80}")

total_tp = 0
total_fp = 0
total_fn = 0
weighted_prec = 0
weighted_rec = 0
weighted_f1 = 0
total_support = 0

for sc in subcats:
    tp = confusion[sc].get(sc, 0)
    fp = sum(confusion[true].get(sc, 0) for true in subcats if true != sc)
    fn = sum(confusion[sc].get(pred, 0) for pred in subcats if pred != sc)
    support = tp + fn

    prec = tp / (tp + fp) if (tp + fp) > 0 else 0
    rec = tp / (tp + fn) if (tp + fn) > 0 else 0
    f1 = 2 * prec * rec / (prec + rec) if (prec + rec) > 0 else 0

    total_tp += tp
    total_fp += fp
    total_fn += fn
    weighted_prec += prec * support
    weighted_rec += rec * support
    weighted_f1 += f1 * support
    total_support += support

    print(f"{sc:<16} {tp:>5} {fp:>5} {fn:>5} {prec:>7.1%} {rec:>7.1%} {f1:>7.1%} {support:>8}")

# Macro averages
n_classes = len([s for s in subcats if sum(confusion[s].values()) > 0])
macro_prec = sum(
    confusion[sc].get(sc, 0) / max(1, sum(confusion[t].get(sc, 0) for t in subcats))
    for sc in subcats if sum(confusion[sc].values()) > 0
) / max(1, n_classes)
macro_rec = sum(
    confusion[sc].get(sc, 0) / max(1, sum(confusion[sc].values()))
    for sc in subcats if sum(confusion[sc].values()) > 0
) / max(1, n_classes)
macro_f1 = 2 * macro_prec * macro_rec / (macro_prec + macro_rec) if (macro_prec + macro_rec) > 0 else 0

# Weighted averages
w_prec = weighted_prec / total_support if total_support > 0 else 0
w_rec = weighted_rec / total_support if total_support > 0 else 0
w_f1 = weighted_f1 / total_support if total_support > 0 else 0

# Overall accuracy
accuracy = total_tp / total_support if total_support > 0 else 0

print(f"{'='*80}")
print(f"{'Macro avg':<16} {'':>5} {'':>5} {'':>5} {macro_prec:>7.1%} {macro_rec:>7.1%} {macro_f1:>7.1%} {total_support:>8}")
print(f"{'Weighted avg':<16} {'':>5} {'':>5} {'':>5} {w_prec:>7.1%} {w_rec:>7.1%} {w_f1:>7.1%} {total_support:>8}")
print(f"{'Accuracy':<16} {'':>5} {'':>5} {'':>5} {'':>7} {'':>7} {accuracy:>7.1%} {total_support:>8}")
print(f"{'='*80}")

# Misclassification analysis
print(f"\n--- MISCLASSIFICATIONS (top 20) ---")
misclass = []
for nct, gt in ground_truth.items():
    pred = predictions.get(nct, 'general')
    if pred != gt['expected']:
        misclass.append({
            'nct': nct,
            'title': gt['title'][:60],
            'expected': gt['expected'],
            'predicted': pred,
            'drug_class': gt['drug_class']
        })

for mc in misclass[:20]:
    print(f"  {mc['nct']} | {mc['expected']:>8} -> {mc['predicted']:<8} | {mc['drug_class']:<15} | {mc['title']}")
print(f"\nTotal misclassified: {len(misclass)} / {len(ground_truth)} ({len(misclass)/len(ground_truth)*100:.1f}%)")

# Save detailed results for paper
results = {
    'total_trials': len(ground_truth),
    'accuracy': accuracy,
    'macro_precision': macro_prec,
    'macro_recall': macro_rec,
    'macro_f1': macro_f1,
    'weighted_precision': w_prec,
    'weighted_recall': w_rec,
    'weighted_f1': w_f1,
    'per_class': {},
    'misclassifications': len(misclass),
    'confusion_matrix': confusion
}
for sc in subcats:
    tp = confusion[sc].get(sc, 0)
    fp = sum(confusion[t].get(sc, 0) for t in subcats if t != sc)
    fn = sum(confusion[sc].get(p, 0) for p in subcats if p != sc)
    support = tp + fn
    prec = tp / (tp + fp) if (tp + fp) > 0 else 0
    rec = tp / (tp + fn) if (tp + fn) > 0 else 0
    f1 = 2 * prec * rec / (prec + rec) if (prec + rec) > 0 else 0
    results['per_class'][sc] = {
        'precision': round(prec, 4),
        'recall': round(rec, 4),
        'f1': round(f1, 4),
        'support': support,
        'tp': tp, 'fp': fp, 'fn': fn
    }

out_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'reports', 'classifier_validation.json')
os.makedirs(os.path.dirname(out_path), exist_ok=True)
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(results, f, indent=2)
print(f"\nResults saved to: {out_path}")

# JS errors
logs = driver.get_log('browser')
errors = [l for l in logs if l['level'] == 'SEVERE'
          and 'Access to fetch' not in l.get('message', '')
          and 'Failed to load resource' not in l.get('message', '')]
for e in errors[:3]:
    print(f"\nJS ERROR: {e['message'][:200]}")

driver.quit()
sys.exit(0 if accuracy >= 0.70 else 1)  # Pass if >= 70% accuracy
