# RapidMeta 70-Topic Benchmark

## Scope
- Topic registry: 70 benchmark-ready RapidMeta topics
- Allowed discovery sources: ClinicalTrials.gov, PubMed, OpenAlex
- Extraction scope: PubMed abstracts and ClinicalTrials.gov records only
- Search cap override used for validation: 20

## Summary
- Topics validated: 70
- Status counts: pass=6, warn=61, fail=3
- Policy pass topics: 70/70
- Search non-zero topics: CT.gov 70/70, PubMed 70/70, OpenAlex 70/70
- Mean anchor recall: CT.gov 22.6%, PubMed 53.5%, OpenAlex 59.0%
- Extraction success: CT.gov 14/70, PubMed 67/70
- Comparator-backed topics: 63 (exact=23, domain=40, queued=7)

## Issues
- `sglt2i_ckd_renal` [warn]: ctgov_anchor_recall
- `sglt2i_ckd_cv` [warn]: ctgov_anchor_recall
- `sglt2i_ckd_allcause` [warn]: ctgov_anchor_recall
- `sglt2i_ckd_diabetes` [warn]: ctgov_anchor_recall
- `sglt2i_cvot_mace` [warn]: ctgov_anchor_recall
- `sglt2i_cvot_hfh` [warn]: ctgov_anchor_recall
- `sglt2i_cvot_cvdeath` [warn]: ctgov_anchor_recall
- `sglt2i_cvot_allcause` [warn]: ctgov_anchor_recall
- `finerenone_ckd_renal` [warn]: ctgov_extract
- `finerenone_ckd_cv` [warn]: ctgov_extract
- `finerenone_ckd_hyperkalemia` [warn]: ctgov_extract
- `incretin_hfpef_kccq` [warn]: ctgov_anchor_recall, ctgov_extract
- `incretin_hfpef_weight` [warn]: ctgov_anchor_recall, ctgov_extract
- `incretin_hfpef_totalhf` [warn]: ctgov_anchor_recall, ctgov_extract
- `glp1_cvot_mace` [warn]: ctgov_extract
- `glp1_cvot_stroke` [warn]: ctgov_extract
- `glp1_cvot_allcause` [warn]: ctgov_extract
- `glp1_cvot_hfh` [warn]: ctgov_extract
- `glp1_cvot_oral` [warn]: ctgov_extract
- `colchicine_cvd_mace` [warn]: ctgov_extract
- `colchicine_cvd_postmi` [warn]: ctgov_extract
- `colchicine_cvd_cad` [warn]: ctgov_extract
- `colchicine_cvd_stroke` [warn]: ctgov_extract
- `pcsk9_mace` [warn]: ctgov_anchor_recall, ctgov_extract
- `pcsk9_acs` [warn]: ctgov_anchor_recall, ctgov_extract
- `pcsk9_ldlc` [warn]: ctgov_anchor_recall, ctgov_extract
- `pcsk9_inclisiran` [warn]: ctgov_anchor_recall, ctgov_extract
- `bempedoic_mace` [warn]: ctgov_extract
- `bempedoic_ldlc` [warn]: ctgov_extract
- `bempedoic_statin_intolerance` [warn]: ctgov_extract
- `intensive_bp_mace` [warn]: ctgov_anchor_recall, ctgov_extract
- `intensive_bp_stroke` [warn]: ctgov_anchor_recall, ctgov_extract
- `intensive_bp_ckd` [warn]: ctgov_anchor_recall, ctgov_extract
- `intensive_bp_elderly` [warn]: ctgov_anchor_recall, ctgov_extract
- `renal_denervation_office` [fail]: ctgov_anchor_recall, ctgov_extract, pubmed_extract
- `renal_denervation_ambulatory` [fail]: ctgov_anchor_recall, ctgov_extract, pubmed_extract
- `renal_denervation_medication` [fail]: ctgov_anchor_recall, ctgov_extract, pubmed_extract
- `p2y12_monotherapy_pci_mace` [warn]: ctgov_extract
- `p2y12_monotherapy_pci_bleeding` [warn]: ctgov_extract
- `p2y12_monotherapy_pci_acs` [warn]: ctgov_extract
- `short_dapt_pci_mace` [warn]: ctgov_extract
- `short_dapt_pci_bleeding` [warn]: ctgov_extract
- `short_dapt_pci_high_bleeding_risk` [warn]: ctgov_extract
- `af_pci_dual_therapy_bleeding` [warn]: ctgov_extract
- `af_pci_dual_therapy_ischemic` [warn]: ctgov_extract
- `af_pci_dual_therapy_mortality` [warn]: ctgov_extract
- `dual_pathway_cad_pad_mace` [warn]: ctgov_extract
- `dual_pathway_cad_pad_limb` [warn]: ctgov_extract
- `dual_pathway_cad_pad_bleeding` [warn]: ctgov_extract
- `aspirin_primary_prevention_mace` [warn]: ctgov_anchor_recall, ctgov_extract
- `aspirin_primary_prevention_diabetes` [warn]: ctgov_anchor_recall, ctgov_extract
- `polypill_prevention_mace` [warn]: ctgov_anchor_recall, ctgov_extract
- `polypill_prevention_adherence` [warn]: ctgov_anchor_recall, ctgov_extract
- `obesity_incretins_weight` [warn]: ctgov_extract
- `obesity_incretins_mace` [warn]: ctgov_extract
- `obesity_incretins_sleep_apnea` [warn]: ctgov_extract
- `obesity_incretins_quality` [warn]: ctgov_extract
- `nsclc_immunotherapy_os` [warn]: ctgov_anchor_recall, ctgov_extract
- `nsclc_immunotherapy_pfs` [warn]: ctgov_anchor_recall, ctgov_extract
- `nsclc_immunotherapy_pdl1` [warn]: ctgov_anchor_recall, ctgov_extract
- `pah_novel_worsening` [warn]: ctgov_extract
- `pah_novel_exercise` [warn]: ctgov_extract
- `hcm_myosin_symptoms` [warn]: ctgov_extract
- `hcm_myosin_lvot` [warn]: ctgov_extract

## Comparator Packs

- `colchicine_cvd_exact`: tier=exact verdict=PASS reference=Long-term trials of colchicine for secondary prevention of vascular events: a meta-analysis
- `glp1_cvot_exact`: tier=exact verdict=PASS reference=Cardiovascular risk reduction with GLP-1 receptor agonists is proportional to HbA1c lowering in type 2 diabetes
- `pairwise70_cardio`: tier=domain verdict=PASS reference=Pairwise70 Cardio End-to-End
- `sglt2i_cvot_exact`: tier=exact verdict=PASS reference=Association of SGLT2 Inhibitors With Cardiovascular and Kidney Outcomes in Patients With Type 2 Diabetes: A Meta-analysis
- `sglt2i_hf_benchmark`: tier=exact verdict=PASS reference=Vaduganathan et al. SGLT2 inhibitors in heart failure and kidney disease
