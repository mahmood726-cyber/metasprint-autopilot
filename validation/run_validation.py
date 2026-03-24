"""
ORCHESTRATOR: Runs all validation phases in sequence.
Phase A: Meta-analysis engine (291 Cochrane reviews, blinded)
Phase B: Search engine (100 reviews, CT.gov + PubMed)
Phase C: Feature tests (17 Selenium tests)
"""
import os, sys, io, time, json

if hasattr(sys.stdout, 'buffer') and not isinstance(sys.stdout, io.TextIOWrapper):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

BASE = os.path.dirname(os.path.abspath(__file__))
HTML_PATH = os.path.join(os.path.dirname(BASE), 'metasprint-autopilot.html')
ORACLE_PATH = os.path.join(BASE, 'sealed_oracle', 'oracle_results.json')
INPUT_DIR = os.path.join(BASE, 'blinded_inputs')
OUTPUT_DIR = os.path.join(BASE, 'extractor_outputs')
REPORT_DIR = os.path.join(BASE, 'reports')
CSV_DIR = 'C:/Users/user/OneDrive - NHS/Documents/CochraneDataExtractor/data/pairwise'

t_total = time.time()

# ============================================================
# PHASE A: Meta-analysis engine validation
# ============================================================
print('='*60)
print('PHASE A: Meta-Analysis Engine Validation')
print('='*60)

if not os.path.exists(ORACLE_PATH):
    print('  Step 1: Sealing oracle...')
    from oracle_seal import seal_oracle
    seal_oracle(CSV_DIR, None, os.path.join(BASE, 'sealed_oracle'))
else:
    print('  Step 1: Oracle already sealed.')

if not os.path.exists(INPUT_DIR) or len(os.listdir(INPUT_DIR)) == 0:
    print('  Step 2: Preparing blinded inputs...')
    from prepare_inputs import prepare_blinded_inputs
    prepare_blinded_inputs(ORACLE_PATH, INPUT_DIR)
else:
    n_inputs = len([f for f in os.listdir(INPUT_DIR) if f.endswith('.json')])
    print(f'  Step 2: Blinded inputs already prepared ({n_inputs} files).')

n_extracted = len([f for f in os.listdir(OUTPUT_DIR) if f.endswith('.json')]) if os.path.exists(OUTPUT_DIR) else 0
n_inputs = len([f for f in os.listdir(INPUT_DIR) if f.endswith('.json')])
if n_extracted < n_inputs:
    print(f'  Step 3: Running blinded extraction ({n_inputs - n_extracted} remaining)...')
    from blinded_extractor import run_blinded_extraction
    run_blinded_extraction(INPUT_DIR, OUTPUT_DIR, HTML_PATH)
else:
    print(f'  Step 3: Extraction already complete ({n_extracted} files).')

print('  Step 4: Running judge comparison...')
from judge_compare import run_judge
engine_summary = run_judge(ORACLE_PATH, OUTPUT_DIR, REPORT_DIR)

# ============================================================
# PHASE B: Search engine validation
# ============================================================
print('\n' + '='*60)
print('PHASE B: Search Engine Validation')
print('='*60)

search_path = os.path.join(REPORT_DIR, 'search_validation.json')
if not os.path.exists(search_path):
    print('  Running search validation (100 reviews)...')
    os.environ.setdefault('PUBMED_API_KEY', os.environ.get('PUBMED_API_KEY', ''))
    from search_validator import run_search_validation
    search_summary = run_search_validation(ORACLE_PATH, CSV_DIR, REPORT_DIR, n_sample=100)
else:
    with open(search_path, 'r') as f:
        search_summary = json.load(f)['summary']
    print(f'  Search validation already complete: CT.gov {search_summary["ctgov_rate"]:.1f}%, PubMed {search_summary["pubmed_rate"]:.1f}%')

# ============================================================
# PHASE C: Feature tests
# ============================================================
print('\n' + '='*60)
print('PHASE C: Feature Validation')
print('='*60)
from test_features import run_all_tests
feature_results = run_all_tests(HTML_PATH)

# ============================================================
# FINAL REPORT
# ============================================================
print('\n' + '='*60)
print('GENERATING FINAL REPORT')
print('='*60)
from generate_report import generate_report
generate_report(REPORT_DIR, ORACLE_PATH, OUTPUT_DIR)

elapsed = time.time() - t_total
print(f'\n{"="*60}')
print(f'VALIDATION COMPLETE in {elapsed:.0f}s')
print(f'{"="*60}')
print(f'  Phase A (Engine):  {engine_summary["pass"]}/{engine_summary["pass"]+engine_summary["fail"]} ({engine_summary["pass_rate"]:.1f}%)')
print(f'  Phase B (Search):  CT.gov {search_summary["ctgov_rate"]:.1f}%, PubMed {search_summary["pubmed_rate"]:.1f}%')
print(f'  Phase C (Features): {feature_results["passed"]}/{feature_results["total"]}')
print(f'  Report: {os.path.join(REPORT_DIR, "VALIDATION_REPORT.md")}')
