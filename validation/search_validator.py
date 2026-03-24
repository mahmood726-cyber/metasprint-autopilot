"""
SEARCH VALIDATOR: Tests MetaSprint's search logic against ClinicalTrials.gov API v2.
For a subset of reviews, derives PICO terms from Cochrane metadata, queries CT.gov,
and verifies that relevant trials are discoverable.
"""
import json, os, sys, io, csv, re, time, random, glob
import urllib.request, urllib.parse, urllib.error

if hasattr(sys.stdout, 'buffer') and not isinstance(sys.stdout, io.TextIOWrapper):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')


def strip_html(text):
    """Strip HTML tags and entities."""
    if not text:
        return ''
    text = re.sub(r'<[^>]+>', ' ', text)
    text = text.replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>')
    text = text.replace('&quot;', '"').replace('&#39;', "'")
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def extract_pico_from_cochrane(cd_number, csv_dir):
    """Extract PICO terms from Cochrane overall-estimates and study-information CSVs."""
    info_file = None
    est_file = None
    for f in os.listdir(csv_dir):
        if cd_number not in f:
            continue
        if 'study-information' in f:
            info_file = os.path.join(csv_dir, f)
        elif 'overall-estimates' in f:
            est_file = os.path.join(csv_dir, f)

    pico = {'P': '', 'I': '', 'C': '', 'O': '', 'group_name': ''}

    # Primary: use structured fields from overall-estimates
    if est_file:
        with open(est_file, 'r', encoding='utf-8-sig') as fh:
            reader = csv.DictReader(fh)
            for row in reader:
                group_name = row.get('Analysis group name', '')
                analysis_name = row.get('Analysis name', '')
                ei = strip_html(row.get('Experimental intervention', ''))
                ci = strip_html(row.get('Control intervention', ''))

                pico['group_name'] = group_name
                pico['O'] = analysis_name

                if ei:
                    pico['I'] = ei
                if ci:
                    pico['C'] = ci

                # Parse group_name for P, I, C (format: "X vs Y" or "X versus Y - context")
                if group_name:
                    # Extract condition/intervention from group name
                    vs_match = re.split(r'\s+(?:vs\.?|versus|compared?\s+(?:with|to))\s+', group_name, flags=re.IGNORECASE)
                    if len(vs_match) >= 2:
                        raw_i = vs_match[0].strip()
                        raw_c = vs_match[1].split(' - ')[0].strip()  # remove context after dash
                        if not pico['I']:
                            pico['I'] = raw_i[:80]
                        if not pico['C']:
                            pico['C'] = raw_c[:80]

                    # Extract condition from context after dash
                    dash_parts = group_name.split(' - ')
                    if len(dash_parts) >= 2:
                        context = dash_parts[-1].strip()
                        # Use context as population hint
                        if not pico['P'] and len(context) > 5:
                            pico['P'] = context[:80]
                break  # first analysis only

    # Fallback: use study-information for population
    if not pico['P'] and info_file:
        with open(info_file, 'r', encoding='utf-8-sig') as fh:
            reader = csv.DictReader(fh)
            for i, row in enumerate(reader):
                if i >= 3:
                    break
                p = strip_html(row.get('Char: Participants', ''))
                if p:
                    # Extract just the first meaningful phrase (condition/age)
                    first_sent = re.split(r'[.;]', p)[0].strip()
                    if len(first_sent) > 10:
                        pico['P'] = first_sent[:80]
                        break

    return pico


def extract_key_phrase(text, pico_type):
    """Extract key PICO phrase from descriptive text."""
    # Take first sentence
    first_sent = re.split(r'[.!?]', text)[0].strip()
    # Limit to reasonable length
    if len(first_sent) > 100:
        # Try to find key condition/intervention terms
        words = first_sent.split()[:15]
        return ' '.join(words)
    return first_sent


def search_ctgov_api(condition, intervention=None, max_results=50):
    """Search ClinicalTrials.gov API v2 (same logic as MetaSprint app)."""
    params = {
        'query.cond': condition,
        'query.term': 'AREA[DesignAllocation]RANDOMIZED',
        'pageSize': str(min(max_results, 100)),
        'countTotal': 'true',
        'fields': 'NCTId,BriefTitle,OfficialTitle,OverallStatus,Phase,EnrollmentCount,StartDate,Condition,InterventionName',
    }
    if intervention:
        params['query.intr'] = intervention
        params['query.term'] = 'AREA[StudyType]INTERVENTIONAL AND AREA[DesignAllocation]RANDOMIZED'

    url = 'https://clinicaltrials.gov/api/v2/studies?' + urllib.parse.urlencode(params)
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'MetaSprint-Validator/1.0'})
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode('utf-8'))
        total = data.get('totalCount', 0)
        studies = data.get('studies', [])
        results = []
        for s in studies:
            p = s.get('protocolSection', {})
            nct = p.get('identificationModule', {}).get('nctId', '')
            title = p.get('identificationModule', {}).get('officialTitle', '') or \
                    p.get('identificationModule', {}).get('briefTitle', '')
            status = p.get('statusModule', {}).get('overallStatus', '')
            results.append({'nctId': nct, 'title': title, 'status': status})
        return {'total': total, 'results': results}
    except Exception as e:
        return {'total': 0, 'results': [], 'error': str(e)}


def search_pubmed_api(query, api_key=None, max_results=20):
    """Search PubMed via eUtils (same logic as MetaSprint app)."""
    base = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/'
    params = {
        'db': 'pubmed',
        'term': query + ' AND "Randomized Controlled Trial"[Publication Type]',
        'retmax': str(max_results),
        'retmode': 'json',
    }
    if api_key:
        params['api_key'] = api_key

    url = base + 'esearch.fcgi?' + urllib.parse.urlencode(params)
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'MetaSprint-Validator/1.0'})
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode('utf-8'))
        total = int(data.get('esearchresult', {}).get('count', 0))
        pmids = data.get('esearchresult', {}).get('idlist', [])
        return {'total': total, 'pmids': pmids}
    except Exception as e:
        return {'total': 0, 'pmids': [], 'error': str(e)}


def run_search_validation(oracle_path, csv_dir, output_dir, n_sample=50, seed=42):
    """Run search validation on a random sample of reviews."""
    os.makedirs(output_dir, exist_ok=True)

    with open(oracle_path, 'r', encoding='utf-8') as fh:
        oracle = json.load(fh)

    # Sample reviews
    rng = random.Random(seed)
    cd_list = list(oracle.keys())
    rng.shuffle(cd_list)
    sample = cd_list[:n_sample]

    results = {}
    ctgov_found = 0
    pubmed_found = 0
    pico_extracted = 0
    errors = 0

    pubmed_key = os.environ.get('PUBMED_API_KEY', '')

    print(f'Search validation: {len(sample)} reviews')
    print(f'PubMed API key: {"SET" if pubmed_key else "NOT SET"}')

    for i, ds_name in enumerate(sample):
        entry = oracle[ds_name]
        cd_number = entry['cd_number']

        try:
            # Extract PICO
            pico = extract_pico_from_cochrane(cd_number, csv_dir)
            has_pico = bool(pico['P']) or bool(pico['I'])
            if has_pico:
                pico_extracted += 1

            result = {
                'dataset_name': ds_name,
                'cd_number': cd_number,
                'pico': pico,
                'has_pico': has_pico,
            }

            if has_pico:
                # Build search terms - use group_name if available (most structured)
                group_name = pico.get('group_name', '')
                intervention = pico['I'][:60] if pico['I'] else ''
                condition = pico['P'][:60] if pico['P'] else ''
                outcome = pico['O'][:60] if pico['O'] else ''

                # For CT.gov: use intervention as condition search (broader)
                # CT.gov condition field matches MeSH-like terms
                ct_cond = condition if condition else intervention
                ct_intr = intervention if condition else None

                # Multi-strategy: try focused first, then broader
                ctgov = search_ctgov_api(ct_cond, ct_intr)
                if ctgov['total'] == 0 and ct_intr:
                    # Retry with just condition
                    ctgov = search_ctgov_api(ct_cond)
                if ctgov['total'] == 0 and intervention and intervention != ct_cond:
                    # Retry with intervention as condition
                    ctgov = search_ctgov_api(intervention)

                result['ctgov'] = {
                    'total': ctgov['total'],
                    'n_returned': len(ctgov['results']),
                    'sample': ctgov['results'][:5],
                    'error': ctgov.get('error'),
                }
                if ctgov['total'] > 0:
                    ctgov_found += 1
                time.sleep(0.3)  # rate limit

                # For PubMed: use intervention + outcome as query
                pm_parts = []
                if intervention:
                    pm_parts.append(intervention)
                if outcome:
                    pm_parts.append(outcome)
                if not pm_parts and condition:
                    pm_parts.append(condition)
                pm_query = ' AND '.join(pm_parts) if pm_parts else group_name
                pubmed = search_pubmed_api(pm_query, api_key=pubmed_key)
                result['pubmed'] = {
                    'total': pubmed['total'],
                    'n_pmids': len(pubmed['pmids']),
                    'error': pubmed.get('error'),
                }
                if pubmed['total'] > 0:
                    pubmed_found += 1
                time.sleep(0.2)  # rate limit
            else:
                result['ctgov'] = {'total': 0, 'error': 'No PICO terms extracted'}
                result['pubmed'] = {'total': 0, 'error': 'No PICO terms extracted'}

            results[ds_name] = result

        except Exception as e:
            errors += 1
            results[ds_name] = {'error': str(e)}

        if (i + 1) % 10 == 0 or i == len(sample) - 1:
            print(f'  [{i+1}/{len(sample)}] PICO: {pico_extracted}, CTgov: {ctgov_found}, PubMed: {pubmed_found}, Err: {errors}')

    # Summary
    n_with_pico = sum(1 for r in results.values() if r.get('has_pico'))
    summary = {
        'total_tested': len(sample),
        'pico_extracted': pico_extracted,
        'ctgov_found': ctgov_found,
        'pubmed_found': pubmed_found,
        'errors': errors,
        'ctgov_rate': ctgov_found / max(1, n_with_pico) * 100,
        'pubmed_rate': pubmed_found / max(1, n_with_pico) * 100,
    }

    print(f'\n{"="*60}')
    print(f'SEARCH VALIDATION SUMMARY')
    print(f'{"="*60}')
    print(f'  Reviews tested: {summary["total_tested"]}')
    print(f'  PICO extracted: {summary["pico_extracted"]} ({summary["pico_extracted"]/summary["total_tested"]*100:.0f}%)')
    print(f'  CT.gov found trials: {summary["ctgov_found"]}/{n_with_pico} ({summary["ctgov_rate"]:.1f}%)')
    print(f'  PubMed found RCTs: {summary["pubmed_found"]}/{n_with_pico} ({summary["pubmed_rate"]:.1f}%)')
    print(f'  Errors: {summary["errors"]}')

    # Save
    output_path = os.path.join(output_dir, 'search_validation.json')
    with open(output_path, 'w', encoding='utf-8') as fh:
        json.dump({'summary': summary, 'details': results}, fh, indent=2, ensure_ascii=False)
    print(f'\nSaved to {output_path}')
    return summary


if __name__ == '__main__':
    BASE = os.path.dirname(os.path.abspath(__file__))
    ORACLE_PATH = os.path.join(BASE, 'sealed_oracle', 'oracle_results.json')
    CSV_DIR = 'C:/Users/user/OneDrive - NHS/Documents/CochraneDataExtractor/data/pairwise'
    OUTPUT_DIR = os.path.join(BASE, 'reports')

    run_search_validation(ORACLE_PATH, CSV_DIR, OUTPUT_DIR, n_sample=50)
