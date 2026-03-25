# Al-Burhan: Automated living evidence synthesis from trial registry to guideline-contextualized meta-analysis, validated against 291 Cochrane reviews

## Authors

Mahmood Ahmad 0009-0003-7781-4478
Royal Free Hospital, London, UK
Corresponding author: mahmood.ahmad2@nhs.net

## Abstract

Clinical practice guidelines require synthesis of rapidly expanding evidence, yet guideline development spans 24-30 months, during which new pivotal trials may alter recommendations. Living systematic reviews address this lag but require substantial infrastructure and manual effort. No existing tool provides an integrated pipeline from trial registry surveillance through pooled estimates with automated GRADE assessment and guideline linkage. This study developed and validated the Al-Burhan pipeline, which transforms ClinicalTrials.gov registry data into living meta-analyses with GRADE certainty ratings contextualized against current ESC/AHA cardiovascular guidelines. The pipeline implements seven stages: registry landscape observation of 4,700+ cardiovascular trials; three-layer hybrid classification (weighted keywords, drug-class boost, MiniLM-L6-v2 neural embeddings) mapping trials to 9 subspecialties; automated pooling via DerSimonian-Laird with Hartung-Knapp-Sidik-Jonkman confidence intervals; publication bias assessment; temporal trajectory analysis; three-component compartmentalized validation against 291 Cochrane systematic reviews; and proof-carrying estimates with automated GRADE, NNT, and guideline context. The engine achieved near-perfect numerical concordance with R metafor v4.8.0 (CCC = 1.0000; median difference: 1.65 x 10^-7). The classifier achieved 95.7% concordance with its internal drug-class reference standard (95% Clopper-Pearson exact CI: 92.7-97.8%; weighted F1 = 0.959) across 282 trials. All 99 poolable clusters received internally consistent GRADE ratings. Processing completes in under 10 seconds on commodity hardware. Automated evidence surveillance from trial registries is feasible for cardiovascular medicine, and the Al-Burhan pipeline could reduce time from evidence generation to guideline recommendation by providing pre-panel dashboards with full provenance chains.

**Keywords:** living systematic review, clinical practice guidelines, meta-analysis, GRADE, evidence surveillance, cardiovascular medicine, ClinicalTrials.gov, automation

---

## Introduction

### The evidence-to-guideline gap

Clinical practice guidelines are the primary mechanism by which evidence from randomized controlled trials reaches clinical decision-making [1]. The European Society of Cardiology (ESC) publishes comprehensive guidelines covering heart failure [2], atrial fibrillation [3], hypertension [4], acute coronary syndromes [5], and other cardiovascular conditions. Each recommendation receives a Class (I, IIa, IIb, III) and Level of Evidence (A, B, C) informed by the GRADE framework [6].

Guideline development is resource-intensive. Each ESC guideline task force spans 24-30 months from constitution to publication [7]. By publication, the evidence base has often evolved — FINEARTS-HF (finerenone in HFpEF) reported in 2024, one year after the ESC Heart Failure guideline was finalized. The ESC has introduced focused updates, but infrastructure for continuous evidence surveillance remains underdeveloped.

### Living systematic reviews

Living systematic reviews (LSRs) — continuously updated syntheses incorporating new evidence as it becomes available — have been endorsed by the Cochrane Collaboration [8] and implemented for COVID-19 evidence [9]. However, existing LSR implementations require institutional teams, manual updates, and substantial infrastructure. No published framework automates the full pipeline from trial registry observation through meta-analysis to guideline-contextualized output with GRADE assessment.

### Current tool landscape

Several tools automate components of systematic review. RevMan [10] and R metafor [11] provide meta-analysis computation but require manual study identification. ASReview [12] and Rayyan [13] automate screening but not synthesis. Covidence and EPPI-Reviewer provide workflow platforms but require institutional subscriptions and do not integrate registry data. MetaInsight provides network meta-analysis via R Shiny but requires server infrastructure. Evidence gap maps (3ie, Campbell Collaboration) visualize evidence landscapes but are static and do not auto-pool estimates [14]. No existing tool integrates registry surveillance, automated classification, meta-analysis, publication bias assessment, temporal trajectory analysis, validation, and guideline-contextualized output in a single zero-install pipeline.

### Study objectives

This study aimed to develop and validate a pipeline that:
1. Observes the cardiovascular trial registry landscape at scale
2. Classifies trials into clinically actionable subspecialties
3. Pools trial-level effects into living meta-analyses
4. Detects publication bias including registered-but-unpublished trials
5. Tracks temporal evidence trajectories and population drift
6. Validates against gold-standard Cochrane systematic reviews
7. Delivers proof-carrying estimates with automated GRADE and guideline context

---

## Methods

### Pipeline overview

The Al-Burhan pipeline — named after the Quranic term for "clear proof" (2:111: "Bring your proof") — implements seven stages of evidence synthesis (Fig 1). Each stage is named after a concept from Arabic evidence epistemology: Ayat (signs/observation), Furqan (criterion/classification), Ijma (consensus/pooling), Ghayb (the unseen/bias detection), Tawatur (continuous transmission/temporal analysis), Shahid (witness/validation), and Burhan (proof/delivery). The pipeline is implemented as a single HTML file (12,961 lines) that runs entirely client-side in any modern web browser, requiring no server infrastructure, installation, or account.

### Stage 1: Ayat (signs) — registry landscape observation

The Ayat stage queries the ClinicalTrials.gov API v2 for cardiovascular interventional studies with reported quantitative results. For each trial, the system extracts: NCT identifier, title, conditions, interventions, enrollment, phase, start and completion dates, and quantitative outcome measures (effect estimates, confidence intervals, effect type). The current cardiovascular harvest encompasses 4,700+ trials. From this universe, trials are retained for quantitative analysis if they have: (a) at least one reported outcome measure with a numeric effect estimate, (b) a parseable confidence interval or standard error, and (c) an identifiable effect type (OR, RR, HR, MD, or SMD). Trials with only categorical results, missing CIs, or non-standard effect measures are excluded. This filtering yielded 282 trials with extractable quantitative effects (1,101 effect-outcome pairs across 793 unique drug-outcome-effect type combinations). The harvest is versioned with a SHA-256 content hash and timestamped for provenance (isnad).

### Stage 2: Furqan (criterion) — hybrid trial classifier

The Furqan classifier assigns each trial to one of 9 cardiovascular subspecialties (heart failure, atrial fibrillation, hypertension, acute coronary syndromes, lipids/CV prevention, pulmonary hypertension, peripheral arterial disease, heart rhythm/devices, and general cardiovascular) using a three-layer architecture:

**Layer 1 — Weighted keyword matching.** Each subspecialty has a curated set of keywords compiled into regular expressions sorted longest-first for greedy matching. Keywords receive weights proportional to character length (weight = ceil(length/6)), so domain-specific multi-word phrases (e.g., "pulmonary arterial hypertension", weight = 6) outscore shorter generic terms.

**Layer 2 — Drug-class boost.** A curated map of 60+ unambiguous drug-to-subspecialty assignments adds a fixed bonus (+5) to the matched subspecialty's score. For example, ticagrelor always boosts ACS, dapagliflozin always boosts HF, and riociguat always boosts PH. This layer encodes pharmacological domain knowledge that drug identity often defines therapeutic category.

**Layer 3 — Neural sentence embeddings.** The all-MiniLM-L6-v2 model [30] (22 MB, quantized ONNX) runs client-side via Transformers.js and WebAssembly. Each trial's title and intervention text is embedded into a 384-dimensional vector and compared via cosine similarity against 4 natural-language prototype sentences per subspecialty. The neural layer acts as a conservative tiebreaker: it only overrides keyword+drug predictions when the keyword margin is thin (<=2 points) and the ML confidence gap exceeds 0.05.

The classifier uses a last-wins-on-tie policy so that more specific subspecialties take priority over broader categories.

### Stage 3: Ijma (consensus) — automated meta-analysis pooling

Trials are grouped into clusters by the key: subcategory | drug class | normalized outcome | effect type. Outcome normalization maps synonymous outcome names to canonical forms (e.g., "major adverse cardiovascular events" and "MACE" to a single key). Drug normalization maps brand and generic names to drug class.

Clusters with k >= 2 studies are pooled using DerSimonian-Laird (DL) random-effects meta-analysis [15] with:
- Hartung-Knapp-Sidik-Jonkman (HKSJ) confidence intervals using the t-distribution (df = k-1), which provides more honest coverage than standard Wald CIs for small k [16,29]
- REML tau-squared estimation via Fisher scoring for heterogeneity sensitivity, following Cochrane Handbook v6.5 recommendation [17]. REML tau-squared is displayed alongside DL tau-squared; REML-based pooled estimates are not computed separately
- Q-profile confidence intervals for tau-squared [18]
- Prediction intervals using the t-distribution with df = k-1 [28], updated from the previous k-2 convention per Cochrane Handbook v6.5 [17]
- Modified Knapp-Hartung (mKH) adjustment [31] when the HKSJ variance ratio falls below 1.0, preventing HKSJ CIs from being narrower than standard DL CIs

Primary pooled estimates use DL-derived weights with HKSJ-corrected CIs. REML tau-squared is computed separately and displayed alongside DL tau-squared for transparency. When DL and REML tau-squared diverge by more than 20%, a caution flag is raised.

### Stage 4: Ghayb (the unseen) — publication bias detection

Publication bias assessment operates at multiple levels:

**Registered-but-unpublished trials.** The Ayat harvest identifies trials registered on ClinicalTrials.gov that reached completion but never posted results — "ghost protocols." These are quantified per cluster as potential missing evidence.

**Small-study effects.** Egger's weighted regression test [19] is the default asymmetry test; for binary outcomes (OR/RR), Peters' test [20] is applied instead, as Egger's test has inflated false-positive rates with ratio measures. Both require k >= 10. Funnel plot asymmetry is visualized with contour-enhanced funnel plots.

**S-value.** Following Mathur and VanderWeele [21], the S-value quantifies the severity of publication bias needed to explain away a pooled result: it represents the number of nonaffirmative studies that would need to exist for every affirmative study in the broader population of all conducted studies (published and unpublished) for the population-level effect to include the null. Higher S-values indicate greater robustness because more missing nonaffirmative evidence would be required to nullify the result.

**PET-PEESE.** Stanley and Doucouliagos' precision-effect test and precision-effect estimate with standard error [22] provide bias-adjusted pooled estimates for clusters with k >= 5. This threshold is lower than the k >= 10 recommended for Egger/Peters regression tests; PET-PEESE estimates for k = 5-9 should be interpreted with caution due to potential instability.

**Trim-and-fill.** The Duval-Tweedie L0 estimator [23] imputes missing studies to symmetrize the funnel plot, providing an adjusted pooled estimate.

### Stage 5: Tawatur (continuous transmission) — temporal evidence trajectories

The Tawatur stage tracks how evidence evolves over time through four analyses:

**Cumulative meta-analysis.** Studies are ordered chronologically and the meta-analysis is re-computed after each addition, producing a trajectory of pooled estimates over time.

**Evidence velocity.** The rate of new trial accumulation per drug-outcome pair is computed, distinguishing rapidly evolving evidence bases (e.g., SGLT2 inhibitors in HF) from stable ones.

**Evidence maturity index.** A composite score incorporating trial count (k), total sample size (N), heterogeneity (I-squared), and evidence time span, categorizing each cluster as Nascent, Developing, Established, or Mature.

**Population drift detection.** Early trials (first half chronologically) are compared against late trials (second half) using an exploratory z-test on the log-scale random-effects estimates. This assumes independence between subgroups (valid for non-overlapping studies) but does not account for heterogeneity estimation uncertainty and may be anti-conservative for small subgroups. The Cochrane Handbook recommended Q-based test for subgroup interaction (Q_between, chi-squared df = 1) [17] would be more appropriate but requires within-subgroup heterogeneity estimation that is unreliable with the small k typical of each half. Significant drift (p < 0.05) is treated as a screening signal for further investigation, not a formal interaction test.

### Stage 6: Shahid (witness) — validation

Validation was conducted using four complementary approaches.

**Three-component compartmentalized Cochrane concordance (n = 291).** The meta-analysis engine was validated against 291 Cochrane systematic reviews using a three-component compartmentalized architecture: (a) an Oracle — an independent Python DL implementation that produces SHA-256 sealed expected results before testing begins; (b) an Extractor — Selenium WebDriver driving the system in headless Chrome, computing results without access to expected values; (c) a Judge — an independent comparator applying pre-specified tolerances. Reviews were stratified by study count (k = 2-3: n = 76; k = 4-5: n = 51; k = 6-10: n = 68; k = 11-20: n = 53; k > 20: n = 43) and data type (binary/OR: n = 202; continuous/MD: n = 63; inverse-variance: n = 26). The Oracle was separately cross-validated against R metafor v4.8.0 to establish the chain: MetaSprint (JS) = Oracle (Python) = R metafor.

**Classifier precision/recall (n = 282).** The classifier was evaluated against 282 cardiovascular trials with subspecialty labels assigned by the FURQAN drug-outcome clustering pipeline (an internal component using pharmacological class rather than clinical indication). This represents internal concordance against an automated reference standard, not validation against human-annotated ground truth. Each trial was classified using only its title and intervention names, without access to the drug-class labels used by FURQAN.

**GRADE internal consistency (n = 99).** For all 99 poolable clusters, internal consistency was verified: certainty score equals 4 + sum(domain adjustments) clamped to [1, 4]; imprecision domain consistent with CI-crosses-null and OIS logic; publication bias domain consistent with S-value thresholds; large-effect upgrade restricted to ratio measures; risk of bias flagged as "Not Assessed" throughout.

**AI-simulated multi-persona ESC specialist review (12 personas, 4 rounds).** An AI-simulated review was conducted using a large language model prompted to adopt 12 ESC specialist perspectives (interventional cardiology, electrophysiology, heart failure, hypertension, lipidology, pulmonary hypertension, clinical pharmacology, biostatistics, guideline methodology, clinical trials, medical education, and systematic review methodology). Each persona assessed guideline reference accuracy, NNT sourcing, Class/LoE correctness, statistical formula validity, and clinical safety. Findings were rated P0 (critical), P1 (important), or P2 (minor). This is a systematic quality assurance step, not a substitute for human expert validation [24].

### Stage 7: Burhan (proof) — proof-carrying estimates

The Burhan stage delivers estimates with four components of provenance:

**Automated GRADE assessment.** Starting from HIGH certainty (score = 4 for RCTs), five domains are evaluated:
1. *Risk of bias:* Flagged as "Not Assessed" (score = 0) rather than using trial count as proxy. This honest disclosure avoids inflating certainty when per-trial RoB 2.0 data [25] is unavailable.
2. *Inconsistency (algorithm-specific thresholds):* I-squared > 75% AND prediction interval crosses null: -2; I-squared > 50% OR (I-squared > 25% AND PI crosses null): -1; otherwise 0. These thresholds are pipeline-specific rules informed by GRADE principles but do not follow a published scoring algorithm.
3. *Imprecision:* CI crosses null AND total N < 400: -2; CI crosses null OR total N < 400: -1; otherwise 0.
4. *Publication bias:* S-value < 2: -2; S-value 2-4: -1; S-value >= 4 or insufficient data: 0.
5. *Indirectness:* Set to 0 (requires manual assessment).
6. *Large effect upgrade* (ratio measures only, when certainty >= MODERATE): |log(effect)| > log(5): +2; |log(effect)| > log(2): +1. Note: per GRADE guidance, large-effect upgrades should only be applied when RoB has been assessed and is not serious. Since RoB is flagged as "Not Assessed" in this pipeline, any large-effect upgrades are provisional and should be reconsidered after RoB evaluation. Dose-response and plausible-confounding upgrade domains are not implementable from registry data and are not included.

**Number Needed to Treat (NNT).** For odds ratios, the Sackett formula [26]: EER = CER x OR / (1 - CER + CER x OR); ARR = CER - EER; NNT = ceil(1/|ARR|). For hazard ratios (low event rate approximation): ARR = CER x (1 - HR); NNT = ceil(1/|ARR|). Default baseline risk is 15%.

**Guideline knowledge base.** A curated knowledge base maps 9 cardiovascular subspecialties to current ESC/AHA guideline recommendations, including guideline references (e.g., ESC-HF-2023, ESC-AF-2024, ESC-HTN-2024, ESC-PAD-2024), recommendation Class (I/IIa/IIb/III), Level of Evidence (A/B/C), and NNT with duration, endpoint, and landmark trial citation (e.g., "NNT = 20 over 18 months for CV death/HF hospitalization, DAPA-HF").

**Isnad (provenance chain).** Each cluster carries a machine-readable provenance record: data source, harvest date, content hash, pipeline version, and the chain from pooled estimate through individual NCT identifiers to ClinicalTrials.gov records.

### Software and reproducibility

The complete system is contained in a single HTML file executable in any modern web browser (Chrome 90+, Firefox 90+, Edge 90+, Safari 15+). No server infrastructure, API keys, user accounts, or installation is required. The statistical engine was validated against R metafor v4.8.0 [11]. Over 1,060 automated tests across 13 test suites verify all components. The application, validation scripts, test data, and pipeline code are available at https://github.com/mahmood726-cyber/metasprint-autopilot. The Al-Burhan export dataset is deposited at [ZENODO_DOI_PLACEHOLDER].

---

## Results

### Registry landscape (Ayat)

The Ayat harvest identified 4,700+ cardiovascular interventional studies on ClinicalTrials.gov, of which 282 yielded extractable quantitative effects. These 282 trials produced 1,101 effect-outcome pairs across 793 unique drug-outcome-effect type combinations, of which 99 clusters had k >= 2 studies and were eligible for meta-analysis. Clusters were distributed across 8 active subspecialties: atrial fibrillation (201 clusters), heart failure (145), lipids/CV prevention (133), acute coronary syndromes (115), pulmonary hypertension (92), hypertension (77), general cardiovascular (25), and heart rhythm/devices (5).

### Classifier performance (Furqan)

The three-layer hybrid classifier achieved 95.7% overall concordance with the internal drug-class reference across 282 cardiovascular trials (Table 1).

**Table 1. Classifier precision, recall, and F1 by subspecialty (n = 282)**

| Subspecialty | Precision | Recall | F1 | Support |
|---|---|---|---|---|
| Hypertension | 97.0% | 100.0% | 98.5% | 64 |
| Lipids / CV Prevention | 100.0% | 96.0% | 98.0% | 25 |
| ACS / Coronary | 100.0% | 97.6% | 98.8% | 42 |
| Atrial Fibrillation | 98.5% | 97.0% | 97.7% | 66 |
| Heart Failure | 89.8% | 97.8% | 93.6% | 45 |
| Pulmonary Hypertension | 100.0% | 87.9% | 93.5% | 33 |
| **Weighted average** | **96.2%** | **95.7%** | **95.9%** | **282** |
| **Macro average** | **86.9%** | **85.6%** | **86.2%** | **282** |

*Table 1 shows 6 subspecialties with support >= 25. Three additional subspecialties had low support: PAD (support = 0, no PAD-labeled trials in the test set), heart rhythm (n = 4, F1 = 0.67), and general CV (n = 3, F1 = 0.40). Macro average includes all 9 subspecialties.*

**Layer contribution analysis.** Keywords alone achieved 78.4% concordance. Adding the drug-class boost raised concordance to 95.7% (+17.3 percentage points), the largest single improvement. The drug-class boost rescued 49 trials whose titles lacked disease-specific terminology. The neural embedding layer provided marginal additional benefit, primarily because keyword+drug signals are highly discriminative in cardiovascular medicine.

**Ground-truth concordance analysis.** Of 12 misclassifications against the internal FURQAN reference, 10 (83%) reflected systematic disagreement between drug-class clustering and clinical-indication classification. For example, PDE5 inhibitor trials in HF patients were labeled as PH by the drug-class reference but classified as HF by the system based on the stated patient population. These disagreements highlight the limitation of using an automated reference standard: the drug-class taxonomy and clinical-indication taxonomy are both valid but produce different classifications for multi-indication drugs. Only 2 of 12 misclassifications represented clearly incorrect predictions.

### Meta-analysis engine concordance (Ijma + Shahid)

The engine achieved near-perfect numerical concordance with R metafor v4.8.0 across all 291 Cochrane reviews (Table 2).

**Table 2. Meta-analysis engine concordance (n = 291)**

*Differences are between the JavaScript engine and the Python Oracle. The Oracle was independently verified to be numerically identical to R metafor v4.8.0 (CCC = 1.0000, MAD = 0.0), establishing the transitive chain: MetaSprint (JS) = Oracle (Python) = R metafor.*

| Metric | Median difference | Mean difference | Max difference | CCC |
|---|---|---|---|---|
| Pooled effect | 1.65 x 10^-7 | 1.19 x 10^-6 | 1.66 x 10^-4 | 1.0000 |
| CI lower bound | 1.74 x 10^-7 | 8.29 x 10^-7 | 1.04 x 10^-4 | 1.0000 |
| CI upper bound | 2.38 x 10^-7 | 2.40 x 10^-6 | 1.88 x 10^-4 | 1.0000 |
| I-squared | 5.61 x 10^-6 | 1.69 x 10^-4 | 2.55 x 10^-2 | 1.0000 |
| Tau-squared | 1.57 x 10^-7 | 7.66 x 10^-6 | 1.47 x 10^-3 | 1.0000 |

Concordance was maintained across all strata: k = 2-3 (76/76), k = 4-5 (51/51), k = 6-10 (68/68), k = 11-20 (53/53), k > 20 (43/43); and all data types: binary (202/202), continuous (63/63), inverse-variance (26/26). The validation chain — MetaSprint (JavaScript) = Oracle (Python) = R metafor — was established through independent cross-validation at each link.

### GRADE assessment (Burhan)

All 99 poolable clusters received GRADE certainty ratings with 100% internal consistency (Table 3).

**Table 3. GRADE certainty distribution (n = 99 poolable clusters)**

| Certainty level | Count | Percentage |
|---|---|---|
| HIGH | 10 | 10.1% |
| MODERATE | 39 | 39.4% |
| LOW | 28 | 28.3% |
| VERY LOW | 22 | 22.2% |

Internal consistency checks: certainty = 4 + sum(domains), clamped [1, 4]: 99/99 (100%); imprecision domain logic: 99/99 (100%); publication bias S-value thresholds: 99/99 (100%); large-effect upgrade restricted to ratio measures: 0 violations; risk of bias flagged "Not Assessed": 99/99 (100%). Two clusters received large-effect upgrades (both ratio measures with |log(effect)| > log(2)).

### Discovery classification (Furqan)

Among 793 drug-outcome clusters, FURQAN classification against published Cochrane meta-analyses yielded: 24 confirmed (same direction and overlapping CIs), 14 updated (same direction, significant shift in magnitude), 53 contradicted (opposite direction), 69 novel (no published comparator), and 633 unverifiable (insufficient published comparator data). The 53 contradicted clusters represent drug-outcome pairs where registry-derived evidence diverges from published syntheses — potential signals for guideline updates.

### Publication bias assessment (Ghayb)

Among the 20 clusters with k >= 5 (minimum for regression-based bias assessment), PET-PEESE bias-adjusted estimates were computed. PET-PEESE estimates are displayed alongside unadjusted estimates in the provenance panels for transparency but do not override primary DL+HKSJ pooled estimates. Among the 47 clusters with k >= 3, S-values were computed for publication bias robustness; the distribution informed the GRADE publication bias domain ratings.

### AI-simulated ESC specialist review

The 12-persona review across 4 rounds identified and resolved all critical issues (Table 4).

**Table 4. AI-simulated ESC specialist review findings by round**

| Round | Personas | P0 found | P0 fixed | P1 found | P1 fixed | Verdict |
|---|---|---|---|---|---|---|
| 1 | 12 | 18 | 18 | 12 | 12 | Fix required |
| 2 | 4 | 5 | 5 | 3 | 3 | Fix required |
| 3 | 4 | 0 | 0 | 1 | 1 | Conditional pass |
| 4 | 4 | 0 | 0 | 0 | 0 | **CLEAN** |

Key P0 issues identified and resolved included: NNT formula corrected from simplified to Sackett conversion; hardcoded z = 1.96 replaced with confidence-level-aware critical values; GRADE risk-of-bias proxy replaced with honest "Not Assessed" flag; GRADE large-effect upgrade disabled for non-ratio measures; phantom guideline references corrected to published years; heatmap color inversion fixed for outcomes where negative mean difference indicates benefit (e.g., blood pressure, LDL cholesterol).

### System performance

Processing 282 trials through the full pipeline (classification, clustering, pooling, GRADE, guideline linkage) completes in under 10 seconds on commodity hardware. The automated test suite encompasses 1,060+ tests across 13 suites (Table 5).

**Table 5. Automated test suite summary**

| Suite | Tests | Type | Coverage |
|---|---|---|---|
| Statistical edge cases | 227 | pytest | Boundary conditions, zero events, single study |
| 12-angle integration | 62 | pytest | Multi-persona workflow validation |
| Feature tests | 18 | pytest | Parsers, deduplication, plots, XSS prevention |
| Al-Burhan integration | 6 | pytest | Living evidence engine |
| Pipeline engine | 66 | pytest | DL, HKSJ, REML, harvest, clustering, export |
| GRADE + NNT | 33 | selenium | Certainty assessment, NNT computation |
| GRADE concordance | 27 | selenium | Cross-cluster consistency |
| 2x2 contingency input | 52 | selenium | OR/RR/RD from raw tables |
| Subgroup analysis | 35 | selenium | Stratified pooling, test for interaction |
| Advanced analysis | 44 | selenium | Cumulative MA, trim-and-fill, fragility index |
| UX / accessibility | 51 | selenium | WCAG 2.1 AA, ARIA, responsive design |
| Meta-regression + NMA | 78 | selenium | Bubble plot, Bucher indirect [27], P-scores |
| Landscape analytics | 91 | selenium | Heatmap, temporal, maturity, drift |
| Classifier precision/recall | 270 | selenium | 282 trials, 9-class classification concordance |
| **Total** | **1,060+** | | |

### Guideline knowledge base coverage

The guideline knowledge base maps 9 cardiovascular subspecialties to current ESC/AHA recommendations (Table 6).

**Table 6. Guideline knowledge base coverage**

| Subspecialty | Guidelines | Drug/intervention entries | With NNT | Year |
|---|---|---|---|---|
| Heart failure | ESC-HF-2021 [2], ESC-HF-2023-FU [32], ACC-ECDP-2024 | 8 | 6 | 2021-2024 |
| ACS / Coronary | ESC-ACS-2023, ESC-CCS-2024, ACC-AHA-ACS-2025 | 7 | 1 | 2023-2025 |
| Atrial fibrillation | ESC-AF-2024, ACC-AHA-AF-2023 | 7 | 0 | 2023-2024 |
| Hypertension | ESC-HTN-2024 | 6 | 0 | 2024 |
| Lipids / CV prevention | ESC-EAS-LIPIDS-2019, ESC-EAS-FOCUSED-2025 | 6 | 2 | 2019-2025 |
| Valve disease | ESC-EACTS-VHD-2021 | 5 | 0 | 2021 |
| Pulmonary hypertension | ESC-ERS-PH-2022 | 6 | 0 | 2022 |
| PAD / Vascular | ESC-PAD-2024 | 5 | 1 | 2024 |
| Heart rhythm / Devices | ESC-VA-SCD-2022, ESC-PACING-2021 | 6 | 0 | 2021-2022 |
| General CV prevention | ESC-CVD-PREVENTION-2021 | 6 | 0 | 2021 |

*Guideline codes (e.g., ESC-HF-2021) are shorthand identifiers used by the system's internal knowledge base; formal citations for guidelines referenced as evidence in the manuscript appear in the reference list [2-5,32]. NNT values cite landmark trial sources with published event rates for independent verification (e.g., PARADIGM-HF NNT = 22 from 21.8% vs 26.5% CV death/HF hospitalization over 27 months).*

---

## Discussion

### Principal findings

This study demonstrated that automated evidence surveillance from trial registries is technically feasible for cardiovascular medicine. The Al-Burhan pipeline produces meta-analytic estimates with near-perfect numerical concordance against R metafor (CCC = 1.0000), classifies cardiovascular trials with 95.7% concordance against its internal drug-class reference (95% CI: 92.7-97.8%), and provides transparent GRADE assessments with 100% internal consistency. The seven-stage architecture — from registry observation through proof-carrying delivery — represents the first integrated pipeline connecting trial registries to guideline-contextualized meta-analyses.

### Comparison with existing approaches

Table 7 compares the Al-Burhan pipeline with existing tools across the systematic review lifecycle.

**Table 7. Comparison of Al-Burhan with existing evidence synthesis tools**

| Feature | Al-Burhan | RevMan | metafor | ASReview | Covidence | Cochrane LSR |
|---|---|---|---|---|---|---|
| Registry surveillance | Yes | No | No | No | No | Manual |
| Auto-classification | Yes | No | No | No | No | No |
| Meta-analysis | DL+HKSJ | DL/REML | Multiple | No | No | DL/REML |
| GRADE automation | Yes | Manual | No | No | No | Manual |
| Guideline linkage | Yes | No | No | No | No | No |
| NNT with trial citation | Yes | No | No | No | No | No |
| Publication bias suite | 5 methods | 2 methods | 5+ methods | No | No | Variable |
| Temporal trajectories | Yes | No | Possible | No | No | Manual |
| Population drift | Yes | No | No | No | No | No |
| Zero installation | Yes | Install | R required | Python | Web account | Institutional |
| Cost | Free | Free | Free | Free | Subscription | Institutional |

The key differentiator is integration: Al-Burhan connects registry observation to guideline-contextualized output in a single pipeline, whereas existing tools address individual steps. RevMan and metafor provide more extensive statistical methods (e.g., metafor supports 16+ heterogeneity estimators, multivariate models, and network meta-analysis via R scripting) but require manual data preparation. This comparison reflects scope of built-in integration, not statistical capability; users requiring advanced methods should use specialized tools. Cochrane LSRs provide rigorous living review methodology but require institutional teams and infrastructure.

### Potential for guideline development

The pipeline could serve ESC/AHA guideline development in three phases:

**Pre-panel.** Before a task force convenes, the pipeline auto-generates pooled estimates, GRADE certainty domains, evidence gaps, and temporal trajectories from live registry data. The 53 contradicted clusters and 69 novel clusters identified in this study represent immediate candidates for panel review.

**During deliberation.** Drill-down provenance enables panelists to trace any pooled estimate through individual NCT identifiers to ClinicalTrials.gov records. The transparent GRADE domain scoring provides a structured starting point for certainty assessment that panelists can override based on their judgment.

**Post-publication.** The living meta-analysis engine monitors for new trials that could shift recommendations. The S-value and Trial Sequential Analysis features quantify how robust current evidence is to future studies.

### Limitations

1. **Risk of bias is not assessed.** The system flags RoB as "Not Assessed" rather than using proxy measures. Full GRADE assessment requires per-trial evaluation using RoB 2.0 [25], which needs access to full-text publications. This is the most significant limitation for clinical deployment.

2. **Classifier validation uses internal ground truth.** The 95.7% concordance is measured against labels from the system's own drug-class clustering pipeline, not against human-annotated classifications. The residual 12 misclassifications are dominated by drug-class vs. clinical-indication disagreements (e.g., PDE5 inhibitor trials in HF patients labeled as PH by drug class). Validation against an independent expert-annotated gold standard would strengthen these claims.

3. **ClinicalTrials.gov coverage is incomplete.** Only 282 of 4,700+ cardiovascular trials (6%) reported quantitative results in structured fields. The evidence landscape may underrepresent trials that report results only in publications.

4. **GRADE imprecision uses simplified OIS.** The Optimal Information Size threshold (N >= 400) is a liberal lower bound chosen because only enrollment N is available from registry data, not event rates or clinically important differences needed for proper OIS calculation [6]. For rare outcomes (e.g., cardiovascular mortality with 5% baseline risk), true OIS may require thousands of participants, making this threshold insufficient. The automated imprecision rating should be considered a lower bound on the true imprecision penalty.

5. **NNT for hazard ratios uses RR approximation.** The relationship between hazard ratios and absolute risk reduction depends on the survival function, which is unavailable from registry data. The approximation is acceptable when event rates are low.

6. **Indirectness requires manual assessment.** The system cannot automatically determine whether trial populations, interventions, or outcomes differ from guideline targets.

7. **Single cardiovascular domain.** Validation is limited to one medical specialty. Generalizability to oncology, nephrology, or other fields requires separate validation.

8. **Drug-class boost assumes single-indication mapping.** Drugs with multiple approved indications (e.g., dapagliflozin: HF, CKD, T2DM; rivaroxaban: AF, ACS, PAD) are deterministically mapped to a single subspecialty. Trials conducted in populations outside the mapped indication may be misclassified by the drug-class layer.

9. **Category imbalance affects evaluation.** The ground-truth dataset has uneven representation (AF: 66 trials vs. PAD/rhythm < 10 each). Per-class metrics for low-support categories are unstable.

10. **AI-simulated review is not human expert validation.** While AI personas identified genuine errors (23 P0 issues), they cannot replicate the clinical judgment and tacit knowledge of human ESC panel members [24].

11. **Single-file architecture limits collaboration.** While zero-install is advantageous for accessibility, it does not support simultaneous multi-user editing.

12. **Default baseline risk for NNT.** The 15% default CER may not reflect the baseline risk in specific patient populations. Users can adjust this parameter but may not do so.

13. **Current implementation is evidence surveillance, not a living systematic review.** The pipeline supports manual re-harvesting and re-analysis but does not yet implement continuous automated updating on a pre-defined schedule as required by the formal LSR framework [8]. Continuous harvesting with automated re-pooling is planned as future work.

### Future directions

1. Integration of RoB 2.0 assessment using natural language processing on trial protocols and publications
2. Extension to other medical specialties (oncology, nephrology, neurology)
3. Living guideline dashboard with automated alerts when new evidence shifts GRADE certainty
4. Continuous harvesting with automated re-pooling upon new trial result posting
5. Integration with PROSPERO for living review registration
6. Multi-user collaborative mode via shared state synchronization

---

## Conclusions

Automated evidence surveillance from trial registries is feasible for cardiovascular medicine. The Al-Burhan pipeline — implementing seven stages from registry observation (Ayat) through proof-carrying delivery (Burhan) — produces meta-analytic estimates with near-perfect numerical concordance against R metafor (CCC = 1.0000 across 291 Cochrane reviews) and classifies cardiovascular trials with 95.7% concordance against its internal drug-class reference. GRADE assessments are internally consistent but require human validation of the risk of bias and indirectness domains before clinical use. While the system does not replace expert judgment, it could substantially reduce the time from evidence generation to guideline recommendation by providing pre-panel evidence dashboards with full provenance chains. The zero-install architecture ensures accessibility regardless of institutional resources.

---

## Data availability statement

All relevant data are within the manuscript and its Supporting Information files. The Al-Burhan export dataset (282 trials, 1,101 effects, 99 poolable clusters with GRADE ratings) is deposited at [ZENODO_DOI_PLACEHOLDER]. The complete application source code, validation scripts, pipeline code, and test data are available at https://github.com/mahmood726-cyber/metasprint-autopilot.

## Ethics statement

This study is a computational validation of software against publicly available data. No human participants were enrolled. Ethical approval was not required.

## Author contributions

**Conceptualization:** Mahmood Ahmad. **Data curation:** Mahmood Ahmad. **Formal analysis:** Mahmood Ahmad. **Investigation:** Mahmood Ahmad. **Methodology:** Mahmood Ahmad. **Project administration:** Mahmood Ahmad. **Resources:** Mahmood Ahmad. **Software:** Mahmood Ahmad. **Validation:** Mahmood Ahmad. **Visualization:** Mahmood Ahmad. **Writing — original draft:** Mahmood Ahmad. **Writing — review and editing:** Mahmood Ahmad.

## Funding

This research received no specific grant from any funding agency in the public, commercial, or not-for-profit sectors.

## Competing interests

The author declares no competing interests.

## Acknowledgments

The Cochrane Collaboration for maintaining systematic review datasets used in validation. The ClinicalTrials.gov team at NIH/NLM for the open registry API. Wolfgang Viechtbauer for the R metafor package used as external reference standard.

## Supporting information

**S1 File. Validation report.** Detailed three-component compartmentalized validation methodology and results for all 291 Cochrane systematic reviews.

**S2 File. Classifier validation.** Per-class precision, recall, F1, and confusion matrix for 282 cardiovascular trials across 9 subspecialties.

**S3 File. Al-Burhan export dataset.** Complete pipeline output including 282 trials, 1,101 effect-outcome pairs, 793 clusters, and 99 poolable meta-analyses with GRADE ratings (deposited at [ZENODO_DOI_PLACEHOLDER]).

**S4 File. Test suite specifications.** Detailed test descriptions for all 1,060+ automated tests across 13 test suites.

**S5 File. Guideline knowledge base.** Complete mapping of 9 cardiovascular subspecialties to ESC/AHA guideline recommendations with NNT calculations and landmark trial citations.

## Protocol registration

This study is a software validation study, not a systematic review. Protocol registration in PROSPERO was not applicable. The validation protocol (study selection criteria, tolerance thresholds, and analysis plan) was specified before testing began and is documented in the Validation Report (S1 File).

---

## References

[1] Institute of Medicine. Clinical Practice Guidelines We Can Trust. Washington, DC: National Academies Press; 2011. https://doi.org/10.17226/13058

[2] McDonagh TA, Metra M, Adamo M, Gardner RS, Baumbach A, Bohm M, et al. 2021 ESC Guidelines for the diagnosis and treatment of acute and chronic heart failure. Eur Heart J. 2021;42(36):3599-3726. https://doi.org/10.1093/eurheartj/ehab368

[3] Van Gelder IC, Rienstra M, Bunting KV, et al. 2024 ESC Guidelines for the management of atrial fibrillation. Eur Heart J. 2024;45(36):3314-3414. https://doi.org/10.1093/eurheartj/ehae176

[4] McEvoy JW, McCarthy S, Bruno JG, Barber S, Bakris GL, Baum SJ, et al. 2024 ESC Guidelines for elevated blood pressure and hypertension. Eur Heart J. 2024;45(38):3912-4018. https://doi.org/10.1093/eurheartj/ehae178

[5] Byrne RA, Rossello X, Coughlan JJ, Barbato E, Berry C, Chieffo A, et al. 2023 ESC Guidelines for the management of acute coronary syndromes. Eur Heart J. 2023;44(38):3720-3826. https://doi.org/10.1093/eurheartj/ehad191

[6] Guyatt GH, Oxman AD, Vist GE, Kunz R, Falck-Ytter Y, Alonso-Coello P, et al. GRADE: an emerging consensus on rating quality of evidence and strength of recommendations. BMJ. 2008;336(7650):924-926. https://doi.org/10.1136/bmj.39489.470347.AD

[7] European Society of Cardiology. ESC Clinical Practice Guidelines: Policies and Procedures. 2022. Available from: https://www.escardio.org/Guidelines/Clinical-Practice-Guidelines/Guidelines-development

[8] Elliott JH, Synnot A, Turner T, Simmonds M, Akl EA, McDonald S, et al. Living systematic review: 1. Introduction — the why, what, when, and how. J Clin Epidemiol. 2017;91:23-30. https://doi.org/10.1016/j.jclinepi.2017.08.010

[9] Siemieniuk RA, Bartoszko JJ, Diaz Martinez JP, Kum E, Qasim A, Zeraatkar D, et al. Antibody and cellular therapies for treatment of covid-19: a living systematic review and network meta-analysis. BMJ. 2021;374:n2231. https://doi.org/10.1136/bmj.n2231

[10] Review Manager (RevMan) [Computer program]. Version 5.4. The Cochrane Collaboration; 2020.

[11] Viechtbauer W. Conducting meta-analyses in R with the metafor package. J Stat Softw. 2010;36(3):1-48. https://doi.org/10.18637/jss.v036.i03

[12] van de Schoot R, de Bruin J, Schram R, et al. An open source machine learning framework for efficient and transparent systematic reviews. Nat Mach Intell. 2021;3(2):125-133. https://doi.org/10.1038/s42256-020-00287-7

[13] Ouzzani M, Hammady H, Fedorowicz Z, Elmagarmid A. Rayyan — a web and mobile app for systematic reviews. Syst Rev. 2016;5(1):210. https://doi.org/10.1186/s13643-016-0384-4

[14] Snilstveit B, Vojtkova M, Bhavsar A, Stevenson J, Gaarder M. Evidence & Gap Maps: a tool for promoting evidence informed policy and strategic research agendas. J Clin Epidemiol. 2016;79:120-129. https://doi.org/10.1016/j.jclinepi.2016.05.015

[15] DerSimonian R, Laird N. Meta-analysis in clinical trials. Control Clin Trials. 1986;7(3):177-188. https://doi.org/10.1016/0197-2456(86)90046-2

[16] Hartung J, Knapp G. A refined method for the meta-analysis of controlled clinical trials with binary outcome. Stat Med. 2001;20(24):3875-3889. https://doi.org/10.1002/sim.1009

[17] Higgins JPT, Thomas J, Chandler J, Cumpston M, Li T, Page MJ, et al., editors. Cochrane Handbook for Systematic Reviews of Interventions version 6.5 (updated January 2025). Cochrane; 2025. Available from: https://training.cochrane.org/handbook

[18] Viechtbauer W. Confidence intervals for the amount of heterogeneity in meta-analysis. Stat Med. 2007;26(1):37-52. https://doi.org/10.1002/sim.2514

[19] Egger M, Davey Smith G, Schneider M, Minder C. Bias in meta-analysis detected by a simple, graphical test. BMJ. 1997;315(7109):629-634. https://doi.org/10.1136/bmj.315.7109.629

[20] Peters JL, Sutton AJ, Jones DR, Abrams KR, Rushton L. Comparison of two methods to detect publication bias in meta-analysis. JAMA. 2006;295(6):676-680. https://doi.org/10.1001/jama.295.6.676

[21] Mathur MB, VanderWeele TJ. Sensitivity analysis for publication bias in meta-analyses. J R Stat Soc C. 2020;69(5):1091-1119. https://doi.org/10.1111/rssc.12440

[22] Stanley TD, Doucouliagos H. Meta-regression approximations to reduce publication selection bias. Res Synth Methods. 2014;5(1):60-78. https://doi.org/10.1002/jrsm.1095

[23] Duval S, Tweedie R. Trim and fill: a simple funnel-plot-based method of testing and adjusting for publication bias in meta-analysis. Biometrics. 2000;56(2):455-463. https://doi.org/10.1111/j.0006-341X.2000.00455.x

[24] Checco A, Bracciale L, Loreti P, Pinfield S, Bianchi G. AI-assisted peer review. Humanit Soc Sci Commun. 2021;8:25. https://doi.org/10.1057/s41599-020-00703-8

[25] Sterne JAC, Savovic J, Page MJ, Elbers RG, Blencowe NS, Boutron I, et al. RoB 2: a revised tool for assessing risk of bias in randomised trials. BMJ. 2019;366:l4898. https://doi.org/10.1136/bmj.l4898

[26] Sackett DL, Straus SE, Richardson WS, Rosenberg W, Haynes RB. Evidence-Based Medicine: How to Practice and Teach EBM. 2nd ed. Edinburgh: Churchill Livingstone; 2000.

[27] Bucher HC, Guyatt GH, Griffith LE, Walter SD. The results of direct and indirect treatment comparisons in meta-analysis of randomized controlled trials. J Clin Epidemiol. 1997;50(6):683-691. https://doi.org/10.1016/S0895-4356(97)00049-8

[28] Higgins JPT, Thompson SG, Spiegelhalter DJ. A re-evaluation of random-effects meta-analysis. J R Stat Soc A. 2009;172(1):137-159. https://doi.org/10.1111/j.1467-985X.2008.00552.x

[29] IntHout J, Ioannidis JPA, Borm GF. The Hartung-Knapp-Sidik-Jonkman method for random effects meta-analysis is straightforward and considerably outperforms the standard DerSimonian-Laird method. BMC Med Res Methodol. 2014;14:25. https://doi.org/10.1186/1471-2288-14-25

[30] Reimers N, Gurevych I. Sentence-BERT: Sentence embeddings using Siamese BERT-networks. In: Proceedings of the 2019 Conference on Empirical Methods in Natural Language Processing. 2019:3982-3992. https://doi.org/10.18653/v1/D19-1410

[31] Rover C, Knapp G, Friede T. Hartung-Knapp-Sidik-Jonkman approach and its modification for random-effects meta-analysis with few studies. BMC Med Res Methodol. 2015;15:99. https://doi.org/10.1186/s12874-015-0091-1

[32] McDonagh TA, Metra M, Adamo M, Gardner RS, Baumbach A, Bohm M, et al. 2023 Focused Update of the 2021 ESC Guidelines for the diagnosis and treatment of acute and chronic heart failure. Eur Heart J. 2023;44(37):3627-3639. https://doi.org/10.1093/eurheartj/ehad195
