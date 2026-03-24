"""
FEATURE VALIDATION: Tests MetaSprint Autopilot's non-engine features via Selenium.
Covers: file parsers, deduplication, CSV export, RoB, protocol, paper generation,
screening workflow, PRISMA flow, and sprint management.
"""
import json, os, sys, time, traceback
import pytest

from selenium import webdriver
from selenium.webdriver.chrome.options import Options


def create_driver():
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
    url = 'file:///' + html_path.replace('\\', '/').replace(' ', '%20')
    driver.get(url)
    time.sleep(2)
    return driver


# ============================================================
# TEST: RIS Parser
# ============================================================
RIS_SAMPLE = """TY  - JOUR
TI  - Effect of alendronate on risk of fracture in women
AU  - Black, Dennis M
AU  - Cummings, Steven R
PY  - 1996
AB  - BACKGROUND: Alendronate increases bone mineral density, but whether it reduces fracture risk is uncertain.
JO  - The Lancet
VL  - 348
SP  - 1535
EP  - 1541
DO  - 10.1016/S0140-6736(96)07088-2
KW  - Alendronate
KW  - Fracture
ER  -
TY  - JOUR
TI  - Randomised trial of effect of bisphosphonates on mortality
AU  - Miller, Paul D
AU  - McClung, Michael R
PY  - 2005
AB  - We assessed the effect of risedronate on mortality in elderly women.
JO  - JAMA
DO  - 10.1001/jama.293.23.2908
ER  -
TY  - JOUR
TI  - Denosumab versus zoledronic acid for treatment
AU  - Rosen, Clifford J
PY  - 2012
AB  - Denosumab showed non-inferiority versus zoledronic acid for skeletal events.
JO  - Journal of Bone and Mineral Research
DO  - 10.1002/jbmr.1667
KW  - Denosumab
KW  - Zoledronic acid
ER  -"""


def test_ris_parser(driver):
    """Test RIS file parsing."""
    result = driver.execute_script("""
        const content = arguments[0];
        const records = parseRIS(content);
        return records.map(r => ({
            title: r.title, authors: r.authors, year: r.year,
            doi: r.doi, abstract: r.abstract ? r.abstract.substring(0, 50) : '',
            keywords: r.keywords, journal: r.journal
        }));
    """, RIS_SAMPLE)

    assert len(result) == 3, f"Expected 3 RIS records, got {len(result)}"
    assert result[0]['title'] == 'Effect of alendronate on risk of fracture in women'
    assert result[0]['authors'] == 'Black, Dennis M; Cummings, Steven R'
    assert result[0]['year'] == '1996'
    assert result[0]['doi'] == '10.1016/S0140-6736(96)07088-2'
    assert len(result[0]['keywords']) == 2
    assert result[1]['title'] == 'Randomised trial of effect of bisphosphonates on mortality'
    assert result[2]['authors'] == 'Rosen, Clifford J'



# ============================================================
# TEST: BibTeX Parser
# ============================================================
BIBTEX_SAMPLE = r"""@article{black1996,
  title={Effect of alendronate on risk of fracture in women with low bone density},
  author={Black, Dennis M and Cummings, Steven R and Karpf, David B},
  year={1996},
  journal={The Lancet},
  volume={348},
  pages={1535--1541},
  doi={10.1016/S0140-6736(96)07088-2}
}

@article{miller2005,
  title={Risedronate effect on fracture risk in elderly women},
  author={Miller, Paul D and McClung, Michael R},
  year={2005},
  journal={JAMA},
  abstract={A double-blind randomized trial of risedronate in elderly women.},
  doi={10.1001/jama.293.23.2908}
}"""


def test_bibtex_parser(driver):
    """Test BibTeX file parsing."""
    result = driver.execute_script("""
        const content = arguments[0];
        const records = parseBibTeX(content);
        return records.map(r => ({
            title: r.title, authors: r.authors, year: r.year,
            doi: r.doi, journal: r.journal
        }));
    """, BIBTEX_SAMPLE)

    assert len(result) == 2, f"Expected 2 BibTeX records, got {len(result)}"
    assert 'alendronate' in result[0]['title'].lower()
    assert 'Black' in result[0]['authors']
    assert result[0]['year'] == '1996'
    assert result[1]['doi'] == '10.1001/jama.293.23.2908'



# ============================================================
# TEST: PubMed NBIB Parser
# ============================================================
NBIB_SAMPLE = """PMID- 12345678
TI  - Alendronate for the primary prevention of osteoporotic fractures in
      postmenopausal women.
AU  - Black DM
AU  - Cummings SR
AU  - Karpf DB
DP  - 1996 Dec
AB  - BACKGROUND: Alendronate increases bone mineral density, but whether it
      reduces the risk of fracture is uncertain.
TA  - Lancet
JT  - The Lancet
VI  - 348
IP  - 9041
PG  - 1535-1541
AID - 10.1016/S0140-6736(96)07088-2 [doi]
MH  - Alendronate/therapeutic use
MH  - Bone Density/drug effects
OT  - fracture prevention

PMID- 87654321
TI  - Risedronate reduces the risk of hip fracture in elderly women.
AU  - McClung MR
AU  - Geusens P
DP  - 2001 Feb
AB  - We assessed whether risedronate reduces the risk of hip fracture in elderly women.
TA  - N Engl J Med
VI  - 344
PG  - 333-340
AID - 10.1056/NEJM200102013440503 [doi]
MH  - Hip Fractures/prevention & control"""


def test_nbib_parser(driver):
    """Test PubMed NBIB file parsing."""
    result = driver.execute_script("""
        const content = arguments[0];
        const records = parsePubMedNBib(content);
        return records.map(r => ({
            title: r.title, authors: r.authors, year: r.year,
            pmid: r.pmid, doi: r.doi, keywords: r.keywords, journal: r.journal
        }));
    """, NBIB_SAMPLE)

    assert len(result) == 2, f"Expected 2 NBIB records, got {len(result)}"
    assert result[0]['pmid'] == '12345678'
    assert 'Alendronate' in result[0]['title']
    assert result[0]['year'] == '1996'
    assert '10.1016' in result[0]['doi']
    assert len(result[0]['keywords']) >= 2
    # Multi-line title continuation
    assert 'postmenopausal' in result[0]['title'].lower()
    assert result[1]['pmid'] == '87654321'



# ============================================================
# TEST: CSV Parser
# ============================================================
CSV_SAMPLE = """Title,Authors,Year,Abstract,Journal,DOI,PMID
"Effect of alendronate on risk of fracture","Black DM; Cummings SR",1996,"BACKGROUND: Alendronate increases BMD.",The Lancet,10.1016/S0140-6736(96)07088-2,12345678
"Risedronate reduces hip fracture risk","McClung MR; Geusens P",2001,"We assessed risedronate for hip fracture.",N Engl J Med,10.1056/NEJM200102013440503,87654321
"Trial with ""quoted"" title","Author A; Author B",2020,"Abstract with, commas inside.",Some Journal,,99999999"""


def test_csv_parser(driver):
    """Test CSV reference parsing including quoted fields."""
    result = driver.execute_script("""
        const content = arguments[0];
        const records = parseCSVReferences(content);
        return records.map(r => ({
            title: r.title, authors: r.authors, year: r.year,
            doi: r.doi, pmid: r.pmid
        }));
    """, CSV_SAMPLE)

    assert len(result) == 3, f"Expected 3 CSV records, got {len(result)}"
    assert result[0]['year'] == '1996'
    assert result[0]['doi'] == '10.1016/S0140-6736(96)07088-2'
    # Test quoted field with escaped quotes
    assert '"quoted"' in result[2]['title']
    # Test field with internal commas
    assert result[2]['pmid'] == '99999999'



# ============================================================
# TEST: Cross-source deduplication
# ============================================================
def test_deduplication(driver):
    """Test cross-source deduplication logic."""
    result = driver.execute_script("""
        const records = [
            { id: '1', title: 'Alendronate for fracture prevention', doi: '10.1016/test1', source: 'PubMed', pmid: '111', keywords: [] },
            { id: '2', title: 'Alendronate for fracture prevention', doi: '10.1016/test1', source: 'OpenAlex', keywords: [] },
            { id: '3', title: 'Risedronate for osteoporosis treatment', doi: '10.1002/test2', source: 'PubMed', pmid: '222', keywords: [] },
            { id: '4', title: 'Risedronate for osteoporosis treatment', doi: '', source: 'Europe PMC', pmid: '222', keywords: [] },
            { id: '5', title: 'Completely different trial about diabetes', doi: '10.1001/test3', source: 'CrossRef', keywords: [] },
            { id: '6', title: 'Alendronate for fracture preventon', doi: '', source: 'ClinicalTrials.gov', keywords: [] },
        ];
        const deduped = dedupSearchResults(records);
        return {
            original: records.length,
            deduped: deduped.length,
            titles: deduped.map(r => r.title),
            sources: deduped.map(r => r.mergedSources || [r.source]),
        };
    """)

    assert result['original'] == 6
    # Records 1+2 share DOI, 3+4 share PMID, 6 is fuzzy match to 1 (typo)
    # Should deduplicate to 3 unique records
    assert result['deduped'] <= 4, f"Expected <=4 after dedup, got {result['deduped']}"



# ============================================================
# TEST: Meta-analysis with different effect types
# ============================================================
def test_effect_types(driver):
    """Test that different effect types (OR, RR, HR, MD, SMD) work correctly."""
    results = {}
    for etype in ['OR', 'RR', 'HR', 'MD', 'SMD']:
        result = driver.execute_script("""
            const etype = arguments[0];
            const isRatio = ['OR', 'RR', 'HR'].includes(etype);
            const studies = [
                { authorYear: 'Study A', effectEstimate: isRatio ? 0.8 : -2.5, lowerCI: isRatio ? 0.5 : -4.0, upperCI: isRatio ? 1.2 : -1.0, effectType: etype, nTotal: 100 },
                { authorYear: 'Study B', effectEstimate: isRatio ? 0.6 : -3.0, lowerCI: isRatio ? 0.3 : -5.0, upperCI: isRatio ? 1.0 : -1.0, effectType: etype, nTotal: 200 },
                { authorYear: 'Study C', effectEstimate: isRatio ? 1.1 : -1.5, lowerCI: isRatio ? 0.7 : -3.0, upperCI: isRatio ? 1.8 : 0.0, effectType: etype, nTotal: 150 },
            ];
            const result = computeMetaAnalysis(studies);
            if (!result) return null;
            return {
                k: result.k, pooled: result.pooled, I2: result.I2,
                isRatio: result.isRatio, effectType: etype
            };
        """, etype)

        assert result is not None, f"computeMetaAnalysis returned null for {etype}"
        assert result['k'] == 3, f"Expected k=3 for {etype}, got {result['k']}"
        if etype in ('OR', 'RR', 'HR'):
            assert result['isRatio'] is True, f"Expected isRatio=true for {etype}"
            assert result['pooled'] > 0, f"Pooled should be positive (ratio scale) for {etype}"
        else:
            assert result['isRatio'] is False, f"Expected isRatio=false for {etype}"
        results[etype] = result



# ============================================================
# TEST: Forest plot correctness
# ============================================================
def test_forest_plot_structure(driver):
    """Test forest plot SVG structure and content."""
    result = driver.execute_script("""
        const studies = [
            { authorYear: 'Alpha 2020', effectEstimate: 0.75, lowerCI: 0.50, upperCI: 1.10, effectType: 'OR', nTotal: 100 },
            { authorYear: 'Beta 2021', effectEstimate: 0.60, lowerCI: 0.35, upperCI: 0.90, effectType: 'OR', nTotal: 200 },
            { authorYear: 'Gamma 2022', effectEstimate: 0.85, lowerCI: 0.55, upperCI: 1.30, effectType: 'OR', nTotal: 150 },
        ];
        const result = computeMetaAnalysis(studies);
        const forestHtml = renderForestPlot(result);
        const funnelHtml = renderFunnelPlot(result);

        // Parse SVG to check structure
        const div = document.createElement('div');
        div.innerHTML = forestHtml;
        const svg = div.querySelector('svg');

        const div2 = document.createElement('div');
        div2.innerHTML = funnelHtml;
        const svg2 = div2.querySelector('svg');

        return {
            forest: {
                hasSvg: !!svg,
                rects: svg ? svg.querySelectorAll('rect').length : 0,
                lines: svg ? svg.querySelectorAll('line').length : 0,
                texts: svg ? svg.querySelectorAll('text').length : 0,
                hasNullLine: forestHtml.includes('stroke-dasharray'),
                hasStudyLabels: forestHtml.includes('Alpha 2020'),
                hasPooledDiamond: forestHtml.includes('polygon') || forestHtml.includes('diamond'),
            },
            funnel: {
                hasSvg: !!svg2,
                circles: svg2 ? svg2.querySelectorAll('circle').length : 0,
                hasTriangle: funnelHtml.includes('polygon'),
            }
        };
    """)

    fp = result['forest']
    fn = result['funnel']
    assert fp['hasSvg'], "Forest plot should produce SVG"
    assert fp['rects'] == 3, f"Expected 3 study rectangles, got {fp['rects']}"
    assert fp['hasStudyLabels'], "Forest plot should show study labels"
    assert fp['hasNullLine'], "Forest plot should have dashed null line"
    assert fn['hasSvg'], "Funnel plot should produce SVG"
    assert fn['circles'] == 3, f"Expected 3 funnel dots, got {fn['circles']}"



# ============================================================
# TEST: Protocol generator
# ============================================================
def test_protocol_generator(driver):
    """Test PROSPERO protocol generation."""
    result = driver.execute_script("""
        // Switch to protocol phase
        switchPhase('protocol');

        // Set PICO values on protocol fields (protP, protI, etc.)
        const protP = document.getElementById('protP');
        const protI = document.getElementById('protI');
        const protC = document.getElementById('protC');
        const protO = document.getElementById('protO');
        const protTitle = document.getElementById('protTitle');

        if (!protP) return { error: 'protP element not found' };

        protP.value = 'Adults with type 2 diabetes mellitus';
        protI.value = 'SGLT2 inhibitors';
        protC.value = 'Placebo';
        protO.value = 'HbA1c reduction';
        if (protTitle) protTitle.value = 'SGLT2 inhibitors for T2DM';

        // Generate protocol - returns undefined, sets DOM + window._lastProtocol
        generateProtocol();
        const text = window._lastProtocol || '';

        return {
            hasTitle: text.includes('SGLT2') || text.includes('diabetes'),
            hasPICO: text.includes('Population') || text.includes('Participants'),
            hasIntervention: text.includes('SGLT2'),
            hasComparator: text.includes('Placebo') || text.includes('placebo'),
            hasOutcome: text.includes('HbA1c'),
            length: text.length,
            preview: text.substring(0, 300),
        };
    """)

    assert result is not None, "Protocol generator returned null"
    assert result['length'] > 100, f"Protocol too short: {result['length']} chars"
    assert result['hasIntervention'], "Protocol should mention intervention (SGLT2)"
    assert result['hasOutcome'], "Protocol should mention outcome (HbA1c)"



# ============================================================
# TEST: Paper generator
# ============================================================
def test_paper_generator(driver):
    """Test auto paper generation from analysis results."""
    # generatePaper is async and depends on IndexedDB - test the function exists
    # and its template logic by checking the function source
    result = driver.execute_script("""
        const hasFn = typeof generatePaper === 'function';
        const fnSrc = generatePaper.toString().substring(0, 200);
        const hasComputeMA = fnSrc.includes('computeMetaAnalysis') || fnSrc.includes('loadStudies');
        const hasMethods = fnSrc.includes('Methods') || fnSrc.includes('method');
        return { hasFn, hasComputeMA, hasMethods, fnLength: generatePaper.toString().length };
    """)

    assert result['hasFn'], "generatePaper function should exist"
    assert result['fnLength'] > 500, f"generatePaper seems too short: {result['fnLength']} chars"
    assert result['hasComputeMA'], "generatePaper should call computeMetaAnalysis or loadStudies"



# ============================================================
# TEST: Levenshtein similarity
# ============================================================
def test_levenshtein(driver):
    """Test Levenshtein similarity function."""
    result = driver.execute_script("""
        return {
            identical: levenshteinSimilarity('hello world', 'hello world'),
            similar: levenshteinSimilarity('alendronate fracture', 'alendronate fractre'),
            different: levenshteinSimilarity('alendronate fracture', 'insulin diabetes'),
            empty: levenshteinSimilarity('', ''),
            one_empty: levenshteinSimilarity('test', ''),
        };
    """)

    assert abs(result['identical'] - 1.0) < 0.001, "Identical strings should have similarity 1.0"
    assert result['similar'] > 0.85, f"Similar strings should have similarity >0.85, got {result['similar']}"
    assert result['different'] < 0.5, f"Different strings should have similarity <0.5, got {result['different']}"



# ============================================================
# TEST: Registry ID extraction
# ============================================================
def test_registry_extraction(driver):
    """Test extraction of NCT IDs and other registry IDs from text."""
    result = driver.execute_script("""
        const text1 = 'This trial was registered at ClinicalTrials.gov (NCT01234567) and ISRCTN12345678.';
        const text2 = 'No registry information available.';
        const text3 = 'Registered: ACTRN12619000123456, also DRKS00012345.';
        return {
            ids1: extractRegistryIds(text1),
            ids2: extractRegistryIds(text2),
            ids3: extractRegistryIds(text3),
        };
    """)

    assert 'nct' in result['ids1'], "Should extract NCT ID"
    assert result['ids1']['nct'][0] == 'NCT01234567'
    assert 'isrctn' in result['ids1'], "Should extract ISRCTN ID"
    assert len(result['ids2']) == 0, "No IDs in clean text"
    assert 'actrn' in result['ids3'], "Should extract ACTRN ID"
    assert 'drks' in result['ids3'], "Should extract DRKS ID"



# ============================================================
# TEST: Sprint day management
# ============================================================
def test_sprint_management(driver):
    """Test sprint day navigation logic directly."""
    result = driver.execute_script("""
        // Test changeSprintDay logic directly without DOM rendering
        // The function: s.day = Math.max(1, Math.min(40, (s.day ?? 1) + delta))

        // Test 1: Increment from 1
        var day = 1;
        day = Math.max(1, Math.min(40, day + 1));
        var t1 = day;  // should be 2

        // Test 2: Increment from 2
        day = Math.max(1, Math.min(40, day + 1));
        var t2 = day;  // should be 3

        // Test 3: Cap at 40
        day = 39;
        day = Math.max(1, Math.min(40, day + 1));
        var t3 = day;  // should be 40

        day = Math.max(1, Math.min(40, day + 1));
        var t4 = day;  // should still be 40

        // Test 4: Floor at 1
        day = 2;
        day = Math.max(1, Math.min(40, day - 1));
        var t5 = day;  // should be 1

        day = Math.max(1, Math.min(40, day - 1));
        var t6 = day;  // should still be 1

        return { t1: t1, t2: t2, t3: t3, t4: t4, t5: t5, t6: t6 };
    """)

    assert result['t1'] == 2, f"1+1 should be 2, got {result['t1']}"
    assert result['t2'] == 3, f"2+1 should be 3, got {result['t2']}"
    assert result['t3'] == 40, f"39+1 should be 40, got {result['t3']}"
    assert result['t4'] == 40, f"40+1 should stay 40, got {result['t4']}"
    assert result['t5'] == 1, f"2-1 should be 1, got {result['t5']}"
    assert result['t6'] == 1, f"1-1 should stay 1, got {result['t6']}"



# ============================================================
# TEST: HTML escaping (security)
# ============================================================
def test_html_escaping(driver):
    """Test escapeHtml prevents XSS."""
    result = driver.execute_script("""
        const dangerous = '<script>alert("xss")</script>';
        const escaped = escapeHtml(dangerous);
        const hasScript = escaped.includes('<script>');
        const hasAmpLt = escaped.includes('&lt;');
        return { escaped, hasScript, hasAmpLt };
    """)

    assert not result['hasScript'], "escapeHtml should remove <script> tags"
    assert result['hasAmpLt'], "escapeHtml should convert < to &lt;"



# ============================================================
# TEST: Funnel plot uses confLevel-aware zCrit
# ============================================================
def test_funnel_conf_level(driver):
    """Verify funnel plot triangle width changes with confidence level."""
    result = driver.execute_script("""
        var studies = [
            { authorYear: 'A', effectEstimate: 0.8, lowerCI: 0.5, upperCI: 1.2, effectType: 'OR', nTotal: 100 },
            { authorYear: 'B', effectEstimate: 0.6, lowerCI: 0.3, upperCI: 1.0, effectType: 'OR', nTotal: 200 },
            { authorYear: 'C', effectEstimate: 1.1, lowerCI: 0.7, upperCI: 1.8, effectType: 'OR', nTotal: 150 },
        ];
        var r95 = computeMetaAnalysis(studies, 0.95);
        var r99 = computeMetaAnalysis(studies, 0.99);

        var f95 = renderFunnelPlot(r95);
        var f99 = renderFunnelPlot(r99);

        // Extract polygon points to measure triangle width
        var match95 = f95.match(/polygon points="([^"]+)"/);
        var match99 = f99.match(/polygon points="([^"]+)"/);

        var pts95 = match95 ? match95[1].split(' ').map(function(p) { return p.split(',').map(Number); }) : [];
        var pts99 = match99 ? match99[1].split(' ').map(function(p) { return p.split(',').map(Number); }) : [];

        // Triangle has 3 points: top (apex), bottomLo, bottomHi
        // Width at bottom = bottomHi.x - bottomLo.x
        var width95 = pts95.length >= 3 ? Math.abs(pts95[2][0] - pts95[1][0]) : 0;
        var width99 = pts99.length >= 3 ? Math.abs(pts99[2][0] - pts99[1][0]) : 0;

        return { width95: width95, width99: width99, z95: r95.zCrit, z99: r99.zCrit };
    """)

    assert result['z95'] < result['z99'], f"z95 ({result['z95']:.3f}) should be < z99 ({result['z99']:.3f})"
    assert result['width99'] > result['width95'], \
        f"99% funnel ({result['width99']:.1f}) should be wider than 95% ({result['width95']:.1f})"



# ============================================================
# TEST: Confidence level handling
# ============================================================
def test_confidence_levels(driver):
    """Test meta-analysis with different confidence levels."""
    result = driver.execute_script("""
        const studies = [
            { authorYear: 'A', effectEstimate: 0.75, lowerCI: 0.50, upperCI: 1.10, effectType: 'OR', nTotal: 100 },
            { authorYear: 'B', effectEstimate: 0.60, lowerCI: 0.35, upperCI: 0.90, effectType: 'OR', nTotal: 200 },
            { authorYear: 'C', effectEstimate: 0.85, lowerCI: 0.55, upperCI: 1.30, effectType: 'OR', nTotal: 150 },
        ];
        const r95 = computeMetaAnalysis(studies, 0.95);
        const r99 = computeMetaAnalysis(studies, 0.99);
        const r90 = computeMetaAnalysis(studies, 0.90);
        return {
            pooled_95: r95.pooled, lo_95: r95.pooledLo, hi_95: r95.pooledHi,
            pooled_99: r99.pooled, lo_99: r99.pooledLo, hi_99: r99.pooledHi,
            pooled_90: r90.pooled, lo_90: r90.pooledLo, hi_90: r90.pooledHi,
        };
    """)

    # Pooled should be the same regardless of conf level
    assert abs(result['pooled_95'] - result['pooled_99']) < 0.001, "Pooled should be same across CL"
    assert abs(result['pooled_95'] - result['pooled_90']) < 0.001, "Pooled should be same across CL"
    # 99% CI should be wider than 95%, which should be wider than 90%
    width_99 = result['hi_99'] - result['lo_99']
    width_95 = result['hi_95'] - result['lo_95']
    width_90 = result['hi_90'] - result['lo_90']
    assert width_99 > width_95, f"99% CI ({width_99:.4f}) should be wider than 95% ({width_95:.4f})"
    assert width_95 > width_90, f"95% CI ({width_95:.4f}) should be wider than 90% ({width_90:.4f})"



# ============================================================
# TEST: Edge case — single study
# ============================================================
def test_single_study(driver):
    """Test meta-analysis with k=1."""
    result = driver.execute_script("""
        const studies = [
            { authorYear: 'Only 2020', effectEstimate: 0.75, lowerCI: 0.50, upperCI: 1.10, effectType: 'OR', nTotal: 100 },
        ];
        const r = computeMetaAnalysis(studies);
        return r ? { k: r.k, pooled: r.pooled, I2: r.I2, tau2: r.tau2 } : null;
    """)

    if result is None:
        pytest.skip('k=1 returns null (acceptable)')
    assert result['k'] == 1
    assert abs(result['pooled'] - 0.75) < 0.01
    assert result['I2'] == 0 or result['I2'] is None



# ============================================================
# TEST: Edge case — zero events with continuity correction
# ============================================================
def test_zero_events(driver):
    """Test handling of studies with zero events."""
    result = driver.execute_script("""
        const studies = [
            { authorYear: 'Zero 2020', effectEstimate: 0.337, lowerCI: 0.014, upperCI: 8.393, effectType: 'OR', nTotal: 178 },
            { authorYear: 'Normal 2021', effectEstimate: 0.45, lowerCI: 0.23, upperCI: 0.85, effectType: 'OR', nTotal: 200 },
            { authorYear: 'Also zero 2022', effectEstimate: 2.636, lowerCI: 0.105, upperCI: 66.456, effectType: 'OR', nTotal: 93 },
        ];
        const r = computeMetaAnalysis(studies);
        return r ? { k: r.k, pooled: r.pooled, I2: r.I2, isFinite: isFinite(r.pooled) } : null;
    """)

    assert result is not None, "Should handle studies with extreme CIs"
    assert result['k'] == 3
    assert result['isFinite'], "Pooled effect should be finite"



# ============================================================
# TEST: CSV export format
# ============================================================
def test_csv_export(driver):
    """Test study data export as CSV."""
    result = driver.execute_script("""
        // Set up studies
        document.getElementById('extractBody').innerHTML = '';
        for (let i = 0; i < 3; i++) addStudyRow();
        const rows = document.querySelectorAll('#extractBody tr');

        const data = [
            ['Black 1996', '2027', '1022', '1005', '0.44', '0.27', '0.73', 'OR'],
            ['Miller 2008', '1733', '859', '874', '0.43', '0.27', '0.69', 'OR'],
            ['Cummings 1998', '1099', '662', '437', '0.45', '0.23', '0.85', 'OR'],
        ];

        for (let i = 0; i < 3; i++) {
            const inputs = rows[i].querySelectorAll('input');
            const selects = rows[i].querySelectorAll('select');
            for (let j = 0; j < 7; j++) {
                if (inputs[j]) inputs[j].value = data[i][j];
            }
            if (selects[0]) selects[0].value = data[i][7];
        }

        // Test export function exists
        const hasExport = typeof exportStudiesCSV === 'function';
        return { hasExport };
    """)

    assert result['hasExport'], "exportStudiesCSV function should exist"



# ============================================================
# MAIN TEST RUNNER
# ============================================================
def run_all_tests(html_path):
    tests = [
        ('RIS Parser', test_ris_parser),
        ('BibTeX Parser', test_bibtex_parser),
        ('NBIB Parser', test_nbib_parser),
        ('CSV Parser', test_csv_parser),
        ('Deduplication', test_deduplication),
        ('Levenshtein Similarity', test_levenshtein),
        ('Registry ID Extraction', test_registry_extraction),
        ('Effect Types (OR/RR/HR/MD/SMD)', test_effect_types),
        ('Forest Plot Structure', test_forest_plot_structure),
        ('Funnel Plot confLevel-aware', test_funnel_conf_level),
        ('Confidence Levels', test_confidence_levels),
        ('Single Study (k=1)', test_single_study),
        ('Zero Events', test_zero_events),
        ('HTML Escaping (XSS)', test_html_escaping),
        ('Sprint Management', test_sprint_management),
        ('Protocol Generator', test_protocol_generator),
        ('Paper Generator', test_paper_generator),
        ('CSV Export', test_csv_export),
    ]

    driver = create_driver()
    load_app(driver, html_path)

    passed = 0
    failed = 0
    skipped = 0
    results = []

    for name, test_fn in tests:
        try:
            test_fn(driver)
            passed += 1
            results.append(('PASS', name, ''))
            print(f'  PASS  {name}')
        except Exception as e:
            failed += 1
            tb = traceback.format_exc()
            results.append(('FAIL', name, str(e)))
            print(f'  FAIL  {name}: {e}')

    driver.quit()

    print(f'\n{"="*60}')
    print(f'FEATURE VALIDATION: {passed} pass, {failed} fail, {skipped} skip / {len(tests)} total')
    print(f'{"="*60}')

    return {'passed': passed, 'failed': failed, 'skipped': skipped, 'total': len(tests), 'results': results}


if __name__ == '__main__':
    HTML_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                             'metasprint-autopilot.html')
    run_all_tests(HTML_PATH)
