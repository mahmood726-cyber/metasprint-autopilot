(function() {
  'use strict';

  function trials(rows) {
    return rows.map(function(row) {
      return {
        id: row[0],
        nctId: row[1],
        year: row[2]
      };
    });
  }

  const DEFAULT_WORKFLOW = {
    benchmarkReady: true,
    yearFloor: 2015,
    allowedSources: ['ctgov', 'pubmed', 'openalex'],
    blockedSources: ['epmc', 'crossref', 'aact', 'pdf'],
    extractionMode: 'pubmed-abstract-and-ctgov-records-only',
    screeningMode: 'human-review-required',
    recordExtractRequirement: 'Every imported effect should preserve the raw abstract or CT.gov record extract for human checking.'
  };

  const VALIDATION_PACKS = {
    pairwise70_cardio: {
      id: 'pairwise70_cardio',
      name: 'Pairwise70 Cardio End-to-End',
      tier: 'domain',
      verdict: 'PASS',
      date: '2026-02-27',
      summary: '45/45 prepared cardiovascular datasets passed using ClinicalTrials.gov, PubMed, and OpenAlex only, with no PDF extraction pipeline.',
      counts: { prepared: 45, pass: 45, fail: 0, error: 0, passRate: 100.0 },
      sourcePath: 'validation/reports/pairwise70_cardio_benchmark/pairwise70_cardio_end_to_end_report.json'
    },
    sglt2i_hf_benchmark: {
      id: 'sglt2i_hf_benchmark',
      name: 'SGLT2 HF/CKD Golden Benchmark',
      tier: 'exact',
      verdict: 'PASS',
      date: '2026-03-13',
      summary: 'Bundled golden HF and CKD benchmark outcomes aligned to Vaduganathan 2022 Lancet and CRES v5.0.',
      reference: {
        title: 'Vaduganathan et al. SGLT2 inhibitors in heart failure and kidney disease',
        journal: 'Lancet',
        year: 2022
      }
    },
    sglt2i_cvot_exact: {
      id: 'sglt2i_cvot_exact',
      name: 'SGLT2 CVOT Exact Replication',
      tier: 'exact',
      verdict: 'PASS',
      date: '2026-02-27',
      summary: '10/10 checks passed against the bundled SGLT2 cardiovascular outcomes meta-analysis benchmark.',
      counts: { k: 5, totalN: 46969, checksPassed: 10, checksTotal: 10 },
      reference: {
        title: 'Association of SGLT2 Inhibitors With Cardiovascular and Kidney Outcomes in Patients With Type 2 Diabetes: A Meta-analysis',
        journal: 'JAMA Cardiology',
        year: 2021,
        pmid: '33031522',
        doi: '10.1001/jamacardio.2020.4511'
      },
      sourcePath: 'validation/reports/exact_replication_sglt2i/exact_replication_sglt2i_report.json'
    },
    glp1_cvot_exact: {
      id: 'glp1_cvot_exact',
      name: 'GLP-1 CVOT Exact Replication',
      tier: 'exact',
      verdict: 'PASS',
      date: '2026-02-27',
      summary: '11/11 checks passed against the bundled GLP-1 cardiovascular outcomes meta-analysis benchmark.',
      counts: { k: 10, totalN: 73263, checksPassed: 11, checksTotal: 11 },
      reference: {
        title: 'Cardiovascular risk reduction with GLP-1 receptor agonists is proportional to HbA1c lowering in type 2 diabetes',
        journal: 'Diabetes, Obesity & Metabolism',
        year: 2025,
        pmid: '40926380',
        doi: '10.1111/dom.70121'
      },
      sourcePath: 'validation/reports/exact_replication_glp1/exact_replication_glp1_report.json'
    },
    colchicine_cvd_exact: {
      id: 'colchicine_cvd_exact',
      name: 'Colchicine CVD Exact Replication',
      tier: 'exact',
      verdict: 'PASS',
      date: '2026-02-27',
      summary: '8/8 checks passed against the bundled colchicine vascular events meta-analysis benchmark.',
      counts: { k: 6, totalN: 21800, checksPassed: 8, checksTotal: 8 },
      reference: {
        title: 'Long-term trials of colchicine for secondary prevention of vascular events: a meta-analysis',
        journal: 'European Heart Journal',
        year: 2025,
        pmid: '40314333',
        doi: '10.1093/eurheartj/ehaf174'
      },
      sourcePath: 'validation/reports/exact_replication_colchicine/exact_replication_colchicine_report.json'
    }
  };

  const SGLT2_HF_TRIALS = trials([
    ['DAPA-HF', 'NCT03036124', 2019],
    ['EMPEROR-Reduced', 'NCT03057977', 2020],
    ['EMPEROR-Preserved', 'NCT03057951', 2021],
    ['DELIVER', 'NCT03619213', 2022],
    ['SOLOIST-WHF', 'NCT03521934', 2021]
  ]);

  const SGLT2_CKD_TRIALS = trials([
    ['DAPA-CKD', 'NCT03036150', 2020],
    ['CREDENCE', 'NCT02065791', 2019],
    ['EMPA-KIDNEY', 'NCT03594110', 2022]
  ]);

  const SGLT2_CVOT_TRIALS = trials([
    ['EMPA-REG OUTCOME', 'NCT01131676', 2015],
    ['CANVAS Program', 'NCT01032629', 2017],
    ['DECLARE-TIMI 58', 'NCT01730534', 2019],
    ['VERTIS-CV', 'NCT01986881', 2020]
  ]);

  const FINERENONE_CKD_TRIALS = trials([
    ['FIDELIO-DKD', 'NCT02540993', 2020],
    ['FIGARO-DKD', 'NCT02545049', 2021]
  ]);

  const INCRETIN_HFPEF_TRIALS = trials([
    ['STEP-HFpEF', 'NCT04788511', 2023],
    ['STEP-HFpEF DM', 'NCT04916470', 2024],
    ['SUMMIT', 'NCT04847557', 2024]
  ]);

  const GLP1_CVOT_TRIALS = trials([
    ['ELIXA', 'NCT01147250', 2015],
    ['LEADER', 'NCT01179048', 2016],
    ['SUSTAIN-6', 'NCT01720446', 2016],
    ['EXSCEL', 'NCT01144338', 2017],
    ['Harmony Outcomes', 'NCT02465515', 2018],
    ['REWIND', 'NCT01394952', 2019],
    ['PIONEER-6', 'NCT02692716', 2019],
    ['AMPLITUDE-O', 'NCT03496298', 2021]
  ]);

  const COLCHICINE_CVD_TRIALS = trials([
    ['COLCOT', 'NCT02551094', 2019],
    ['LoDoCo2', '', 2020],
    ['COPS', '', 2020],
    ['CLEAR-SYNERGY', 'NCT03048825', 2024],
    ['CONVINCE', 'NCT02898610', 2025]
  ]);

  const PCSK9_TRIALS = trials([
    ['FOURIER', 'NCT01764633', 2017],
    ['ODYSSEY Outcomes', 'NCT01663402', 2018],
    ['ORION-10', 'NCT03399370', 2020],
    ['ORION-11', 'NCT03400800', 2020]
  ]);

  const BEMPEDOIC_TRIALS = trials([
    ['CLEAR Harmony', 'NCT02666664', 2019],
    ['CLEAR Wisdom', 'NCT02991118', 2019],
    ['CLEAR Serenity', 'NCT02988115', 2019],
    ['CLEAR Outcomes', 'NCT02993406', 2023]
  ]);

  const INTENSIVE_BP_TRIALS = trials([
    ['SPRINT', 'NCT01206062', 2015],
    ['STEP', 'NCT03015311', 2021],
    ['ESPRIT', 'NCT04993924', 2023]
  ]);

  const RENAL_DENERVATION_TRIALS = trials([
    ['SPYRAL HTN-OFF MED', 'NCT02439775', 2018],
    ['SPYRAL HTN-ON MED', 'NCT02439749', 2020],
    ['RADIANCE-HTN TRIO', 'NCT02649426', 2021],
    ['RADIANCE II', 'NCT03614260', 2023]
  ]);

  const P2Y12_MONO_TRIALS = trials([
    ['GLOBAL LEADERS', 'NCT01813435', 2018],
    ['SMART-CHOICE', 'NCT02079194', 2019],
    ['STOPDAPT-2', 'NCT02619760', 2019],
    ['TWILIGHT', 'NCT02270242', 2019],
    ['TICO', 'NCT02494895', 2020]
  ]);

  const SHORT_DAPT_TRIALS = trials([
    ['MASTER DAPT', 'NCT03023020', 2021],
    ['One-Month DAPT', 'NCT02658955', 2021],
    ['STOPDAPT-2 ACS', 'NCT03462498', 2022]
  ]);

  const AF_PCI_TRIALS = trials([
    ['PIONEER AF-PCI', 'NCT01830543', 2016],
    ['RE-DUAL PCI', 'NCT02164864', 2017],
    ['AUGUSTUS', 'NCT02415400', 2019],
    ['ENTRUST-AF PCI', 'NCT02866175', 2019]
  ]);

  const DUAL_PATHWAY_TRIALS = trials([
    ['COMPASS', 'NCT01776424', 2017],
    ['VOYAGER PAD', 'NCT02504216', 2020]
  ]);

  const ASPIRIN_PRIMARY_TRIALS = trials([
    ['ASCEND', 'NCT00135226', 2018],
    ['ARRIVE', 'NCT00501059', 2018],
    ['ASPREE', 'NCT01038583', 2018]
  ]);

  const POLYPILL_TRIALS = trials([
    ['PolyIran', '', 2019],
    ['TIPS-3', 'NCT01646437', 2020],
    ['SECURE', 'NCT02596126', 2022]
  ]);

  const OBESITY_INCRETIN_TRIALS = trials([
    ['STEP 1', 'NCT03548935', 2021],
    ['STEP 2', 'NCT03552757', 2021],
    ['SURMOUNT-1', 'NCT04184622', 2022],
    ['SELECT', 'NCT03574597', 2023],
    ['SURMOUNT-OSA', 'NCT05412004', 2024]
  ]);

  const NSCLC_IO_TRIALS = trials([
    ['KEYNOTE-024', 'NCT02142738', 2016],
    ['KEYNOTE-189', 'NCT02578680', 2018],
    ['KEYNOTE-407', 'NCT02775435', 2018],
    ['CheckMate 227', 'NCT02477826', 2018],
    ['IMpower110', 'NCT02409342', 2020]
  ]);

  const PAH_TRIALS = trials([
    ['GRIPHON', 'NCT01106014', 2015],
    ['STELLAR', 'NCT04576988', 2023],
    ['ZENITH', 'NCT04896008', 2025]
  ]);

  const HCM_MYOSIN_TRIALS = trials([
    ['EXPLORER-HCM', 'NCT03470545', 2020],
    ['VALOR-HCM', 'NCT04349072', 2022],
    ['REDWOOD-HCM', 'NCT04219826', 2022]
  ]);

  const CLUSTERS = [
    {
      id: 'sglt2i_hf',
      category: 'Heart Failure',
      name: 'SGLT2 inhibitors - Heart Failure',
      population: 'Adults with chronic heart failure (HFrEF or HFpEF)',
      intervention: 'SGLT2 inhibitors (dapagliflozin, empagliflozin, sotagliflozin)',
      comparator: 'Placebo or standard care',
      searchStrategy: {
        ctgov: '(SGLT2 OR dapagliflozin OR empagliflozin OR sotagliflozin) AND (heart failure OR HFrEF OR HFpEF)',
        pubmed: '("SGLT2 inhibitor" OR dapagliflozin OR empagliflozin OR sotagliflozin) AND ("heart failure" OR HFrEF OR HFpEF) AND (randomized controlled trial[pt] OR randomized[tiab])',
        openalex: 'sglt2 inhibitor heart failure randomized trial'
      },
      trials: SGLT2_HF_TRIALS,
      validationPackId: 'sglt2i_hf_benchmark',
      publishedMeta: { title: 'Vaduganathan et al.', journal: 'Lancet', year: 2022 },
      outcomes: [
        { slug: 'composite', label: 'Composite', outcome: 'Cardiovascular death or heart failure hospitalization' },
        { slug: 'hfh', label: 'HF hospitalization', outcome: 'First or total heart failure hospitalization' },
        { slug: 'cvdeath', label: 'CV death', outcome: 'Cardiovascular death' },
        { slug: 'allcause', label: 'All-cause mortality', outcome: 'All-cause mortality' },
        { slug: 'hfref', label: 'HFrEF subgroup', outcome: 'Primary HF composite in reduced ejection fraction' },
        { slug: 'hfpef', label: 'HFpEF subgroup', outcome: 'Primary HF composite in preserved ejection fraction' }
      ]
    },
    {
      id: 'sglt2i_ckd',
      category: 'Kidney Disease',
      name: 'SGLT2 inhibitors - Chronic Kidney Disease',
      population: 'Adults with chronic kidney disease with or without diabetes',
      intervention: 'SGLT2 inhibitors',
      comparator: 'Placebo or standard care',
      searchStrategy: {
        ctgov: '(SGLT2 OR dapagliflozin OR empagliflozin OR canagliflozin) AND (chronic kidney disease OR CKD OR nephropathy)',
        pubmed: '("SGLT2 inhibitor" OR dapagliflozin OR empagliflozin OR canagliflozin) AND ("chronic kidney disease" OR CKD OR nephropathy) AND (randomized controlled trial[pt] OR randomized[tiab])',
        openalex: 'sglt2 inhibitor chronic kidney disease randomized trial'
      },
      trials: SGLT2_CKD_TRIALS,
      validationPackId: 'sglt2i_hf_benchmark',
      publishedMeta: { title: 'CRES v5.0 renal benchmark', journal: 'Internal benchmark', year: 2026 },
      outcomes: [
        { slug: 'renal', label: 'Renal composite', outcome: 'Kidney failure, sustained eGFR decline, or renal death' },
        { slug: 'cv', label: 'Cardiorenal composite', outcome: 'Cardiovascular death or heart failure hospitalization' },
        { slug: 'allcause', label: 'All-cause mortality', outcome: 'All-cause mortality' },
        { slug: 'diabetes', label: 'Diabetes subgroup', outcome: 'Primary renal outcome in participants with type 2 diabetes' }
      ]
    },
    {
      id: 'sglt2i_cvot',
      category: 'Cardiovascular Outcomes',
      name: 'SGLT2 inhibitors - CVOT',
      population: 'Adults with type 2 diabetes at high cardiovascular risk',
      intervention: 'SGLT2 inhibitors',
      comparator: 'Placebo',
      searchStrategy: {
        ctgov: '(SGLT2 OR empagliflozin OR canagliflozin OR dapagliflozin OR ertugliflozin) AND (cardiovascular) AND (type 2 diabetes)',
        pubmed: '("SGLT2 inhibitor" OR empagliflozin OR canagliflozin OR dapagliflozin OR ertugliflozin) AND ("cardiovascular outcomes" OR MACE OR hospitalization for heart failure) AND (randomized controlled trial[pt] OR randomized[tiab])',
        openalex: 'sglt2 cardiovascular outcomes diabetes randomized trial'
      },
      trials: SGLT2_CVOT_TRIALS,
      validationPackId: 'sglt2i_cvot_exact',
      publishedMeta: { title: 'SGLT2 inhibitor cardiovascular and kidney outcomes meta-analysis', journal: 'JAMA Cardiology', year: 2021 },
      outcomes: [
        { slug: 'mace', label: 'MACE', outcome: 'Three-point major adverse cardiovascular events' },
        { slug: 'hfh', label: 'HF hospitalization', outcome: 'Hospitalization for heart failure' },
        { slug: 'cvdeath', label: 'CV death', outcome: 'Cardiovascular death' },
        { slug: 'allcause', label: 'All-cause mortality', outcome: 'All-cause mortality' }
      ]
    },
    {
      id: 'finerenone_ckd',
      category: 'Kidney Disease',
      name: 'Finerenone - CKD with Type 2 Diabetes',
      population: 'Adults with chronic kidney disease and type 2 diabetes',
      intervention: 'Finerenone',
      comparator: 'Placebo',
      searchStrategy: {
        ctgov: '(finerenone OR BAY94-8862) AND (chronic kidney disease OR diabetic nephropathy)',
        pubmed: '(finerenone OR BAY94-8862) AND ("chronic kidney disease" OR diabetic nephropathy) AND (randomized controlled trial[pt] OR randomized[tiab])',
        openalex: 'finerenone chronic kidney disease randomized trial'
      },
      trials: FINERENONE_CKD_TRIALS,
      validationPackId: 'pairwise70_cardio',
      publishedMeta: { title: 'FIDELITY pooled analysis', journal: 'European Heart Journal', year: 2022 },
      outcomes: [
        { slug: 'renal', label: 'Renal composite', outcome: 'Kidney failure, sustained eGFR decline, or renal death' },
        { slug: 'cv', label: 'CV composite', outcome: 'Cardiovascular death, nonfatal myocardial infarction, nonfatal stroke, or heart failure hospitalization' },
        { slug: 'hyperkalemia', label: 'Hyperkalemia safety', outcome: 'Hyperkalemia or treatment discontinuation due to hyperkalemia' }
      ]
    },
    {
      id: 'incretin_hfpef',
      category: 'Heart Failure',
      name: 'Incretin therapies - HFpEF and obesity',
      population: 'Adults with HFpEF and obesity or type 2 diabetes',
      intervention: 'Semaglutide or tirzepatide',
      comparator: 'Placebo',
      searchStrategy: {
        ctgov: '(semaglutide OR tirzepatide OR GLP-1) AND (HFpEF OR heart failure preserved ejection fraction OR obesity)',
        pubmed: '(semaglutide OR tirzepatide OR "GLP-1 receptor agonist") AND (HFpEF OR "heart failure with preserved ejection fraction" OR obesity) AND (randomized controlled trial[pt] OR randomized[tiab])',
        openalex: 'semaglutide tirzepatide hfpef obesity randomized trial'
      },
      trials: INCRETIN_HFPEF_TRIALS,
      validationPackId: 'pairwise70_cardio',
      publishedMeta: { title: 'Emerging HFpEF incretin synthesis', journal: 'Bundled topic queue', year: 2026 },
      outcomes: [
        { slug: 'kccq', label: 'KCCQ clinical status', outcome: 'Kansas City Cardiomyopathy Questionnaire clinical summary score' },
        { slug: 'weight', label: 'Body weight', outcome: 'Body weight or body-mass reduction' },
        { slug: 'totalhf', label: 'HF events', outcome: 'Total worsening heart failure events or cardiovascular death' }
      ]
    },
    {
      id: 'glp1_cvot',
      category: 'Cardiovascular Outcomes',
      name: 'GLP-1 receptor agonists - CVOT',
      population: 'Adults with type 2 diabetes at high cardiovascular risk',
      intervention: 'GLP-1 receptor agonists',
      comparator: 'Placebo',
      searchStrategy: {
        ctgov: '(GLP-1 OR liraglutide OR semaglutide OR dulaglutide OR exenatide OR albiglutide) AND (cardiovascular) AND (type 2 diabetes)',
        pubmed: '("GLP-1 receptor agonist" OR liraglutide OR semaglutide OR dulaglutide OR exenatide OR albiglutide) AND ("cardiovascular outcomes" OR MACE OR stroke) AND (randomized controlled trial[pt] OR randomized[tiab])',
        openalex: 'glp1 receptor agonist cardiovascular outcomes randomized trial'
      },
      trials: GLP1_CVOT_TRIALS,
      validationPackId: 'glp1_cvot_exact',
      publishedMeta: { title: 'GLP-1 receptor agonist cardiovascular risk reduction meta-analysis', journal: 'Diabetes, Obesity & Metabolism', year: 2025 },
      outcomes: [
        { slug: 'mace', label: 'MACE', outcome: 'Three-point major adverse cardiovascular events' },
        { slug: 'stroke', label: 'Stroke', outcome: 'Fatal or nonfatal stroke' },
        { slug: 'allcause', label: 'All-cause mortality', outcome: 'All-cause mortality' },
        { slug: 'hfh', label: 'HF hospitalization', outcome: 'Hospitalization for heart failure' },
        { slug: 'oral', label: 'Oral semaglutide safety', outcome: 'Cardiovascular safety in oral semaglutide trials' }
      ]
    },
    {
      id: 'colchicine_cvd',
      category: 'Atherosclerosis and Inflammation',
      name: 'Colchicine - Cardiovascular prevention',
      population: 'Adults with coronary, cerebrovascular, or polyvascular atherosclerotic disease',
      intervention: 'Low-dose colchicine',
      comparator: 'Placebo or standard care',
      searchStrategy: {
        ctgov: '(colchicine) AND (cardiovascular OR myocardial infarction OR coronary artery disease OR stroke)',
        pubmed: '(colchicine) AND ("cardiovascular" OR "myocardial infarction" OR "coronary artery disease" OR stroke) AND (randomized controlled trial[pt] OR randomized[tiab])',
        openalex: 'colchicine cardiovascular prevention randomized trial'
      },
      trials: COLCHICINE_CVD_TRIALS,
      validationPackId: 'colchicine_cvd_exact',
      publishedMeta: { title: 'Long-term trials of colchicine for secondary prevention of vascular events', journal: 'European Heart Journal', year: 2025 },
      outcomes: [
        { slug: 'mace', label: 'MACE', outcome: 'Composite major adverse cardiovascular events' },
        { slug: 'postmi', label: 'Recent MI', outcome: 'Post-myocardial infarction major adverse cardiovascular events' },
        { slug: 'cad', label: 'Chronic CAD', outcome: 'Events in stable coronary artery disease' },
        { slug: 'stroke', label: 'Stroke/TIA', outcome: 'Stroke, transient ischemic attack, or cerebrovascular recurrence' }
      ]
    },
    {
      id: 'pcsk9',
      category: 'Lipids',
      name: 'PCSK9 pathway inhibitors',
      population: 'Adults with ASCVD or familial hypercholesterolemia',
      intervention: 'Evolocumab, alirocumab, or inclisiran',
      comparator: 'Placebo or usual care',
      searchStrategy: {
        ctgov: '(PCSK9 OR evolocumab OR alirocumab OR inclisiran) AND (cardiovascular OR LDL OR cholesterol)',
        pubmed: '("PCSK9 inhibitor" OR evolocumab OR alirocumab OR inclisiran) AND ("cardiovascular outcomes" OR LDL cholesterol) AND (randomized controlled trial[pt] OR randomized[tiab])',
        openalex: 'pcsk9 inhibitor cardiovascular randomized trial'
      },
      trials: PCSK9_TRIALS,
      validationPackId: 'pairwise70_cardio',
      publishedMeta: { title: 'PCSK9 inhibitor outcome meta-analyses', journal: 'Bundled topic queue', year: 2026 },
      outcomes: [
        { slug: 'mace', label: 'MACE', outcome: 'Composite major adverse cardiovascular events' },
        { slug: 'acs', label: 'ACS subgroup', outcome: 'MACE after acute coronary syndrome' },
        { slug: 'ldlc', label: 'LDL-C reduction', outcome: 'Percent or absolute LDL cholesterol reduction' },
        { slug: 'inclisiran', label: 'Inclisiran subgroup', outcome: 'LDL cholesterol reduction in inclisiran outcome-safety trials' }
      ]
    },
    {
      id: 'bempedoic',
      category: 'Lipids',
      name: 'Bempedoic acid',
      population: 'Adults with ASCVD risk and statin intolerance or residual LDL-C elevation',
      intervention: 'Bempedoic acid',
      comparator: 'Placebo',
      searchStrategy: {
        ctgov: '(bempedoic acid OR ETC-1002) AND (cholesterol OR cardiovascular)',
        pubmed: '("bempedoic acid" OR ETC-1002) AND ("cardiovascular" OR LDL cholesterol OR ASCVD) AND (randomized controlled trial[pt] OR randomized[tiab])',
        openalex: 'bempedoic acid cardiovascular randomized trial'
      },
      trials: BEMPEDOIC_TRIALS,
      validationPackId: 'pairwise70_cardio',
      publishedMeta: { title: 'Bempedoic acid cardiovascular outcome syntheses', journal: 'Bundled topic queue', year: 2026 },
      outcomes: [
        { slug: 'mace', label: 'MACE', outcome: 'Major adverse cardiovascular events' },
        { slug: 'ldlc', label: 'LDL-C reduction', outcome: 'Absolute or percent LDL cholesterol reduction' },
        { slug: 'statin_intolerance', label: 'Statin-intolerant subgroup', outcome: 'Outcomes in statin-intolerant participants' }
      ]
    },
    {
      id: 'intensive_bp',
      category: 'Hypertension',
      name: 'Intensive blood pressure targets',
      population: 'Adults with hypertension at elevated cardiovascular risk',
      intervention: 'Intensive systolic blood pressure target',
      comparator: 'Standard blood pressure target',
      searchStrategy: {
        ctgov: '(intensive blood pressure OR systolic blood pressure target) AND (cardiovascular OR stroke OR kidney)',
        pubmed: '("intensive blood pressure" OR "systolic blood pressure target") AND ("cardiovascular" OR stroke OR kidney) AND (randomized controlled trial[pt] OR randomized[tiab])',
        openalex: 'intensive blood pressure target randomized trial'
      },
      trials: INTENSIVE_BP_TRIALS,
      validationPackId: 'pairwise70_cardio',
      publishedMeta: { title: 'Intensive blood pressure control meta-analyses', journal: 'Bundled topic queue', year: 2026 },
      outcomes: [
        { slug: 'mace', label: 'MACE', outcome: 'Composite cardiovascular outcome' },
        { slug: 'stroke', label: 'Stroke', outcome: 'Fatal or nonfatal stroke' },
        { slug: 'ckd', label: 'Kidney outcomes', outcome: 'Incident CKD or renal function decline' },
        { slug: 'elderly', label: 'Older adults', outcome: 'Primary composite outcome in participants aged 75 years or older' }
      ]
    },
    {
      id: 'renal_denervation',
      category: 'Hypertension',
      name: 'Renal denervation',
      population: 'Adults with uncontrolled hypertension',
      intervention: 'Catheter-based renal denervation',
      comparator: 'Sham procedure or standard therapy',
      searchStrategy: {
        ctgov: '(renal denervation) AND (hypertension)',
        pubmed: '("renal denervation") AND (hypertension) AND (randomized controlled trial[pt] OR randomized[tiab] OR sham[tiab])',
        openalex: 'renal denervation hypertension randomized sham trial'
      },
      trials: RENAL_DENERVATION_TRIALS,
      validationPackId: 'pairwise70_cardio',
      publishedMeta: { title: 'Renal denervation sham-controlled meta-analyses', journal: 'Bundled topic queue', year: 2026 },
      outcomes: [
        { slug: 'office', label: 'Office SBP', outcome: 'Change in office systolic blood pressure' },
        { slug: 'ambulatory', label: 'Ambulatory SBP', outcome: 'Change in 24-hour ambulatory systolic blood pressure' },
        { slug: 'medication', label: 'Medication-on background', outcome: 'Blood-pressure reduction on background antihypertensive therapy' }
      ]
    },
    {
      id: 'p2y12_monotherapy_pci',
      category: 'Coronary Disease',
      name: 'P2Y12 monotherapy after PCI',
      population: 'Adults after percutaneous coronary intervention',
      intervention: 'P2Y12 inhibitor monotherapy after short aspirin exposure',
      comparator: 'Conventional dual antiplatelet therapy',
      searchStrategy: {
        ctgov: '(P2Y12 OR ticagrelor OR clopidogrel) AND (PCI OR percutaneous coronary intervention) AND (monotherapy)',
        pubmed: '("P2Y12 monotherapy" OR ticagrelor OR clopidogrel) AND (PCI OR "percutaneous coronary intervention") AND (randomized controlled trial[pt] OR randomized[tiab])',
        openalex: 'p2y12 monotherapy pci randomized trial'
      },
      trials: P2Y12_MONO_TRIALS,
      validationPackId: 'pairwise70_cardio',
      publishedMeta: { title: 'P2Y12 monotherapy meta-analyses after PCI', journal: 'Bundled topic queue', year: 2026 },
      outcomes: [
        { slug: 'mace', label: 'MACE', outcome: 'Major adverse cardiovascular or cerebrovascular events' },
        { slug: 'bleeding', label: 'Bleeding', outcome: 'Major or clinically relevant bleeding' },
        { slug: 'acs', label: 'ACS subgroup', outcome: 'Net adverse clinical events in acute coronary syndrome PCI' }
      ]
    },
    {
      id: 'short_dapt_pci',
      category: 'Coronary Disease',
      name: 'Short DAPT after PCI',
      population: 'Adults after PCI with drug-eluting stents',
      intervention: 'Very short dual antiplatelet therapy',
      comparator: 'Standard-duration dual antiplatelet therapy',
      searchStrategy: {
        ctgov: '(DAPT OR dual antiplatelet therapy) AND (PCI OR stent) AND (short OR one month)',
        pubmed: '("short DAPT" OR "one month DAPT" OR "dual antiplatelet therapy") AND (PCI OR stent) AND (randomized controlled trial[pt] OR randomized[tiab])',
        openalex: 'short dapt pci randomized trial'
      },
      trials: SHORT_DAPT_TRIALS,
      validationPackId: 'pairwise70_cardio',
      publishedMeta: { title: 'Short DAPT meta-analyses after PCI', journal: 'Bundled topic queue', year: 2026 },
      outcomes: [
        { slug: 'mace', label: 'MACE', outcome: 'Composite ischemic events or net adverse clinical events' },
        { slug: 'bleeding', label: 'Bleeding', outcome: 'Major bleeding or clinically relevant nonmajor bleeding' },
        { slug: 'high_bleeding_risk', label: 'High bleeding risk', outcome: 'Net benefit in high bleeding risk PCI populations' }
      ]
    },
    {
      id: 'af_pci_dual_therapy',
      category: 'Atrial Fibrillation',
      name: 'DOAC-based dual therapy in AF-PCI',
      population: 'Adults with atrial fibrillation undergoing PCI',
      intervention: 'DOAC-based dual antithrombotic therapy',
      comparator: 'Warfarin-based triple therapy',
      searchStrategy: {
        ctgov: '(atrial fibrillation) AND (PCI) AND (apixaban OR rivaroxaban OR dabigatran OR edoxaban)',
        pubmed: '("atrial fibrillation" AND PCI) AND (apixaban OR rivaroxaban OR dabigatran OR edoxaban) AND (randomized controlled trial[pt] OR randomized[tiab])',
        openalex: 'atrial fibrillation pci doac dual therapy randomized trial'
      },
      trials: AF_PCI_TRIALS,
      validationPackId: 'pairwise70_cardio',
      publishedMeta: { title: 'AF-PCI dual versus triple therapy meta-analyses', journal: 'Bundled topic queue', year: 2026 },
      outcomes: [
        { slug: 'bleeding', label: 'Bleeding', outcome: 'Major or clinically relevant nonmajor bleeding' },
        { slug: 'ischemic', label: 'Ischemic events', outcome: 'Death, myocardial infarction, stent thrombosis, or stroke' },
        { slug: 'mortality', label: 'All-cause mortality', outcome: 'All-cause mortality' }
      ]
    },
    {
      id: 'dual_pathway_cad_pad',
      category: 'Atherosclerosis and Inflammation',
      name: 'Dual-pathway inhibition in CAD/PAD',
      population: 'Adults with stable CAD or peripheral artery disease',
      intervention: 'Low-dose rivaroxaban plus aspirin',
      comparator: 'Aspirin alone',
      searchStrategy: {
        ctgov: '(rivaroxaban) AND (COMPASS OR VOYAGER OR peripheral artery disease OR coronary artery disease)',
        pubmed: '(rivaroxaban AND aspirin) AND ("peripheral artery disease" OR "coronary artery disease") AND (randomized controlled trial[pt] OR randomized[tiab])',
        openalex: 'rivaroxaban aspirin coronary peripheral artery disease randomized trial'
      },
      trials: DUAL_PATHWAY_TRIALS,
      validationPackId: 'pairwise70_cardio',
      publishedMeta: { title: 'Dual-pathway inhibition meta-analyses', journal: 'Bundled topic queue', year: 2026 },
      outcomes: [
        { slug: 'mace', label: 'MACE', outcome: 'Major adverse cardiovascular events' },
        { slug: 'limb', label: 'Limb outcomes', outcome: 'Acute limb ischemia or major vascular amputation' },
        { slug: 'bleeding', label: 'Bleeding', outcome: 'Major bleeding' }
      ]
    },
    {
      id: 'aspirin_primary_prevention',
      category: 'Prevention',
      name: 'Aspirin for primary prevention',
      population: 'Adults without prior cardiovascular disease',
      intervention: 'Aspirin',
      comparator: 'Placebo or usual care',
      searchStrategy: {
        ctgov: '(aspirin) AND (primary prevention) AND (cardiovascular)',
        pubmed: '(aspirin) AND ("primary prevention") AND (cardiovascular OR diabetes) AND (randomized controlled trial[pt] OR randomized[tiab])',
        openalex: 'aspirin primary prevention cardiovascular randomized trial'
      },
      trials: ASPIRIN_PRIMARY_TRIALS,
      validationPackId: 'pairwise70_cardio',
      publishedMeta: { title: 'Primary prevention aspirin meta-analyses', journal: 'Bundled topic queue', year: 2026 },
      outcomes: [
        { slug: 'mace', label: 'MACE', outcome: 'Major adverse cardiovascular events' },
        { slug: 'diabetes', label: 'Diabetes subgroup', outcome: 'Cardiovascular events in diabetes-specific primary prevention' }
      ]
    },
    {
      id: 'polypill_prevention',
      category: 'Prevention',
      name: 'Cardiovascular polypill strategies',
      population: 'Adults at high cardiovascular risk or after myocardial infarction',
      intervention: 'Fixed-dose combination cardiovascular prevention polypill',
      comparator: 'Usual care',
      searchStrategy: {
        ctgov: '(polypill OR fixed-dose combination) AND (cardiovascular OR myocardial infarction)',
        pubmed: '("polypill" OR "fixed-dose combination") AND (cardiovascular OR myocardial infarction) AND (randomized controlled trial[pt] OR randomized[tiab])',
        openalex: 'polypill cardiovascular prevention randomized trial'
      },
      trials: POLYPILL_TRIALS,
      validationPackId: 'pairwise70_cardio',
      publishedMeta: { title: 'Cardiovascular polypill meta-analyses', journal: 'Bundled topic queue', year: 2026 },
      outcomes: [
        { slug: 'mace', label: 'MACE', outcome: 'Major adverse cardiovascular events' },
        { slug: 'adherence', label: 'Adherence', outcome: 'Medication adherence or risk-factor control' }
      ]
    },
    {
      id: 'obesity_incretins',
      category: 'Obesity and Metabolism',
      name: 'Semaglutide and tirzepatide in obesity',
      population: 'Adults with obesity or overweight with cardiometabolic risk',
      intervention: 'Semaglutide or tirzepatide',
      comparator: 'Placebo',
      searchStrategy: {
        ctgov: '(semaglutide OR tirzepatide) AND (obesity OR overweight)',
        pubmed: '(semaglutide OR tirzepatide) AND (obesity OR overweight) AND (randomized controlled trial[pt] OR randomized[tiab])',
        openalex: 'semaglutide tirzepatide obesity randomized trial'
      },
      trials: OBESITY_INCRETIN_TRIALS,
      validationPackId: 'pairwise70_cardio',
      publishedMeta: { title: 'Incretin obesity treatment syntheses', journal: 'Bundled topic queue', year: 2026 },
      outcomes: [
        { slug: 'weight', label: 'Weight loss', outcome: 'Absolute or percent body-weight reduction' },
        { slug: 'mace', label: 'MACE', outcome: 'Major adverse cardiovascular events in obesity outcomes trials' },
        { slug: 'sleep_apnea', label: 'Sleep apnea', outcome: 'Obstructive sleep apnea severity or related symptoms' },
        { slug: 'quality', label: 'Quality of life', outcome: 'Physical function or health-related quality of life' }
      ]
    },
    {
      id: 'nsclc_immunotherapy',
      category: 'Oncology',
      name: 'Checkpoint immunotherapy in NSCLC',
      population: 'Adults with advanced or metastatic non-small cell lung cancer',
      intervention: 'PD-1 or PD-L1 inhibitor regimens',
      comparator: 'Chemotherapy-containing control regimens',
      searchStrategy: {
        ctgov: '(pembrolizumab OR nivolumab OR atezolizumab OR checkpoint inhibitor) AND (NSCLC OR non-small cell lung cancer)',
        pubmed: '("checkpoint inhibitor" OR pembrolizumab OR nivolumab OR atezolizumab) AND (NSCLC OR "non-small cell lung cancer") AND (randomized controlled trial[pt] OR randomized[tiab])',
        openalex: 'checkpoint inhibitor nsclc randomized trial'
      },
      trials: NSCLC_IO_TRIALS,
      validationPackId: null,
      publishedMeta: { title: 'NSCLC immunotherapy meta-analyses', journal: 'Bundled topic queue', year: 2026 },
      outcomes: [
        { slug: 'os', label: 'Overall survival', outcome: 'Overall survival' },
        { slug: 'pfs', label: 'Progression-free survival', outcome: 'Progression-free survival' },
        { slug: 'pdl1', label: 'High PD-L1 subgroup', outcome: 'Overall survival in high PD-L1 populations' }
      ]
    },
    {
      id: 'pah_novel',
      category: 'Pulmonary Hypertension',
      name: 'Novel therapies in pulmonary arterial hypertension',
      population: 'Adults with pulmonary arterial hypertension',
      intervention: 'Sotatercept or selexipag-based therapy',
      comparator: 'Placebo on background therapy',
      searchStrategy: {
        ctgov: '(sotatercept OR selexipag) AND (pulmonary arterial hypertension OR PAH)',
        pubmed: '(sotatercept OR selexipag) AND ("pulmonary arterial hypertension" OR PAH) AND (randomized controlled trial[pt] OR randomized[tiab])',
        openalex: 'sotatercept selexipag pulmonary arterial hypertension randomized trial'
      },
      trials: PAH_TRIALS,
      validationPackId: null,
      publishedMeta: { title: 'PAH novel-therapy syntheses', journal: 'Bundled topic queue', year: 2026 },
      outcomes: [
        { slug: 'worsening', label: 'Clinical worsening', outcome: 'Clinical worsening or morbidity-mortality composite' },
        { slug: 'exercise', label: 'Exercise capacity', outcome: 'Six-minute walk distance or exercise capacity' }
      ]
    },
    {
      id: 'hcm_myosin',
      category: 'Structural Heart Disease',
      name: 'Cardiac myosin inhibition in hypertrophic cardiomyopathy',
      population: 'Adults with obstructive hypertrophic cardiomyopathy',
      intervention: 'Mavacamten or aficamten',
      comparator: 'Placebo',
      searchStrategy: {
        ctgov: '(mavacamten OR aficamten) AND (hypertrophic cardiomyopathy OR HCM)',
        pubmed: '(mavacamten OR aficamten) AND ("hypertrophic cardiomyopathy" OR HCM) AND (randomized controlled trial[pt] OR randomized[tiab])',
        openalex: 'mavacamten aficamten hypertrophic cardiomyopathy randomized trial'
      },
      trials: HCM_MYOSIN_TRIALS,
      validationPackId: null,
      publishedMeta: { title: 'Myosin inhibitor HCM syntheses', journal: 'Bundled topic queue', year: 2026 },
      outcomes: [
        { slug: 'symptoms', label: 'Symptoms and functional class', outcome: 'NYHA class improvement or symptomatic response' },
        { slug: 'lvot', label: 'LVOT gradient', outcome: 'Left ventricular outflow tract gradient reduction' }
      ]
    }
  ];

  function buildEligibility(cluster, variant) {
    return {
      include: [
        'Randomized controlled trial',
        'Primary report year 2015 or later',
        'Search restricted to ClinicalTrials.gov, PubMed, and OpenAlex',
        'Data extraction restricted to PubMed abstracts and CT.gov records',
        cluster.intervention + ' versus ' + cluster.comparator,
        variant.outcome
      ],
      exclude: [
        'Non-randomized or observational studies',
        'Conference abstracts without extractable PubMed abstract text',
        'No ClinicalTrials.gov record and no extractable PubMed abstract result text',
        'Pre-2015 primary publication or trial result release'
      ]
    };
  }

  function buildTopic(cluster, variant) {
    const validationPack = cluster.validationPackId ? VALIDATION_PACKS[cluster.validationPackId] : null;
    return {
      id: cluster.id + '_' + variant.slug,
      shortId: cluster.id,
      category: cluster.category,
      name: cluster.name + ' - ' + variant.label,
      displayLabel: cluster.name + ' - ' + variant.label,
      version: '2.0.0',
      lastUpdated: '2026-03-15',
      trialCount: cluster.trials.length,
      tags: [
        'benchmark-ready',
        '2015-plus',
        'pubmed',
        'openalex',
        'ctgov',
        cluster.category.toLowerCase().replace(/\s+/g, '-')
      ],
      pico: {
        P: cluster.population,
        I: cluster.intervention,
        C: cluster.comparator,
        O: variant.outcome
      },
      searchStrategy: cluster.searchStrategy,
      eligibility: buildEligibility(cluster, variant),
      subgroups: {
        outcomeFamily: {
          label: 'Outcome family',
          groups: {
            primary: { label: variant.label },
            supportive: { label: 'Supporting subgroup or sensitivity run' }
          }
        }
      },
      trials: cluster.trials,
      workflow: Object.assign({}, DEFAULT_WORKFLOW),
      validation: {
        tier: validationPack ? validationPack.tier : 'queued',
        validationPackId: cluster.validationPackId || null,
        verdict: validationPack ? validationPack.verdict : 'QUEUED',
        summary: validationPack ? validationPack.summary : 'No bundled comparator yet; topic is queued for published-meta benchmarking.',
        publishedMeta: cluster.publishedMeta || null
      }
    };
  }

  const topicList = [];
  CLUSTERS.forEach(function(cluster) {
    cluster.outcomes.forEach(function(variant) {
      topicList.push(buildTopic(cluster, variant));
    });
  });

  const topicLibrary = {};
  topicList.forEach(function(topic) {
    topicLibrary[topic.id] = topic;
  });

  window.RM_TOPIC_LIBRARY = topicLibrary;
  window.RM_TOPIC_LIBRARY_LIST = topicList;
  window.RM_TOPIC_LIBRARY_STATS = {
    totalTopics: topicList.length,
    benchmarkReadyTopics: topicList.filter(function(topic) {
      return topic.workflow && topic.workflow.benchmarkReady;
    }).length,
    yearFloor: 2015
  };
  window.RM_TOPIC_VALIDATION_PACKS = VALIDATION_PACKS;
})();
