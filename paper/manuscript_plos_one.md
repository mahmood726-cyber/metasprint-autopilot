# MetaSprint Autopilot: A zero-install, single-file platform for automated systematic review and meta-analysis with living evidence monitoring

[AUTHOR_PLACEHOLDER]^1

^1 [AFFILIATION_PLACEHOLDER]

\* Corresponding author: [EMAIL_PLACEHOLDER]

ORCID: [ORCID_PLACEHOLDER]

## Abstract

**Background:** Systematic reviews and meta-analyses (SR/MA) represent the highest level of clinical evidence, yet conducting them requires expensive software, programming expertise, or institutional subscriptions. No existing tool provides a zero-install, offline-capable platform integrating all SR/MA phases — including living evidence monitoring with sequential stopping rules — within a single file.

**Methods:** MetaSprint Autopilot is a single HTML file (30,639 lines) implementing 13 workflow tabs spanning topic discovery through manuscript drafting. The statistical engine provides DerSimonian-Laird (DL), restricted maximum likelihood (REML), Mantel-Haenszel (MH), and Peto random- and fixed-effects meta-analysis with Knapp-Hartung/Sidik-Jonkman (HKSJ) confidence intervals, Bayesian credible intervals, publication bias diagnostics (Egger, Peters, PET-PEESE, Copas selection model, Z-Curve, RoBMA), influence diagnostics (Cook's distance, leave-one-out), GRADE certainty assessment with dynamic optimal information size, subgroup and meta-regression analysis, and Number Needed to Treat computation. A living meta-analysis module implements CUSUM control charts, alpha spending functions (O'Brien-Fleming, Pocock, Lan-DeMets), required information size with heterogeneity adjustment, and three-tier sequential stopping recommendations. Specialized modules support diagnostic test accuracy, network meta-analysis, and dose-response meta-analysis. Validation used a triple-blinded architecture against 291 Cochrane reviews, cross-validated against R metafor v4.8.0. Software quality was assessed through approximately 1,414 automated tests (364 Playwright end-to-end plus over 1,050 Selenium/Python tests across 15+ test files).

**Results:** The engine achieved 100.0% accuracy (all 291 reviews within pre-specified tolerances; median difference: 1.65 x 10^-7). Cross-validation against R metafor confirmed exact agreement (Lin's concordance correlation coefficient [CCC] = 1.0000). Leave-one-out analysis showed 24.9% of reviews changed direction upon single-study removal, and 92.2% of prediction intervals crossed the null.

**Conclusions:** MetaSprint Autopilot provides a free, zero-install, browser-based SR/MA platform with near-exact statistical accuracy, living evidence monitoring, and advanced publication bias diagnostics, validated against 291 Cochrane reviews and R metafor. The single-file architecture eliminates software installation and licensing barriers to evidence synthesis.

## Introduction

Systematic reviews and meta-analyses represent the highest tier of the evidence hierarchy in medicine and are foundational to clinical practice guidelines, health technology assessments, and regulatory decisions [1,2]. Despite their importance, producing a systematic review remains a resource-intensive process typically requiring 6 to 18 months of dedicated effort and access to specialized statistical software [3]. A 2017 analysis of the PROSPERO registry found that systematic reviews required a median of 67.3 weeks from registration to publication, with substantial variation based on team size and resource availability [3]. The Cochrane Collaboration alone has published over 8,000 systematic reviews, yet thousands of clinical questions remain without up-to-date evidence synthesis, and the majority of published reviews become outdated within five years [4].

Current tools for conducting meta-analyses fall into two broad categories: desktop applications requiring installation (RevMan [5], Stata [6], Comprehensive Meta-Analysis [7]) and web-based platforms requiring institutional subscriptions (Covidence [8], DistillerSR [9]). While the R package metafor [10] provides a comprehensive, free, open-source statistical engine validated against multiple reference implementations, it requires programming expertise in R that represents a significant barrier for medical students and practicing clinicians. More recently, web-based tools such as Rayyan [11] and SRDR+ [12] have addressed specific phases of the workflow (screening and data extraction, respectively) but do not provide an integrated end-to-end solution encompassing all seven phases of systematic review.

The accessibility gap is particularly acute in low- and middle-income countries, where institutional site licenses for commercial software may be unavailable, reliable internet connectivity cannot be assumed, and IT infrastructure for installing and maintaining desktop applications may be limited. Medical students and trainees in these settings frequently encounter systematic review methodology in their curricula but lack practical tools to apply it. This represents a digital health equity challenge: the tools needed to synthesize evidence are concentrated in well-resourced institutions, while the clinical questions demanding evidence synthesis span all settings.

A further challenge is the rapid pace of evidence accumulation. Traditional systematic reviews provide a snapshot of the evidence at a single point in time, but new trials are published continuously. The concept of "living systematic reviews" — reviews that are continuously updated as new evidence emerges [33] — has gained traction, yet existing tools provide limited support for sequential monitoring of accumulating evidence. Without formal sequential stopping rules, repeated updating of a meta-analysis inflates the cumulative type I error rate, potentially leading to premature conclusions of efficacy or futility [34]. Tools that integrate trial sequential analysis (TSA) or group sequential monitoring methods are either proprietary (TSA software [35]) or require programming expertise (R packages such as rpact or gsDesign).

Several specific gaps remain in the current tool landscape. First, no existing tool provides a zero-install, offline-capable platform that runs entirely within a standard web browser without server infrastructure, external dependencies, or internet connectivity after initial download. Second, no single tool guides users through all seven phases of systematic review — from clinical question formulation and topic discovery through statistical analysis and manuscript drafting — in a unified, wizard-style workflow, while simultaneously providing living evidence monitoring with formal sequential stopping rules. Third, existing meta-analysis software tools are rarely validated transparently against gold-standard references at the scale of hundreds of reviews, with the validation data made publicly available for independent verification.

MetaSprint Autopilot was developed to address these gaps. It is a single HTML file (30,639 lines) that runs in any modern web browser (Chrome 90+, Firefox 90+, Edge 90+, Safari 15+) without installation, server infrastructure, internet connection (after initial download), or institutional license. It implements a 13-tab workflow covering all phases of systematic review — including specialized modules for diagnostic test accuracy, network meta-analysis, dose-response meta-analysis, and living evidence monitoring — with a multi-method meta-analysis engine (DL, REML, MH, Peto) that has been validated against 291 Cochrane systematic reviews and cross-validated against the R metafor v4.8.0 reference implementation.

## Methods

### System design and architecture

MetaSprint Autopilot is implemented as a single HTML file containing HTML structure, CSS styling, and JavaScript application logic. This monolithic single-file architecture was chosen to maximize portability and eliminate deployment complexity: the application can be distributed via email attachment, USB drive, institutional intranet, or direct download from a repository. It runs in any modern browser without compilation, transpilation, package management, or server infrastructure. The complete application occupies approximately 2.5 MB uncompressed, including embedded benchmark datasets and validation data.

The application implements a wizard-style interface guiding users through seven sequential phases, each accessible as a tab panel:

1. **Discover**: Topic gap analysis using the PubMed E-utilities API to identify clinical questions with multiple published randomized controlled trials (RCTs) but no recent systematic review, highlighting opportunities for evidence synthesis.
2. **Protocol**: PROSPERO-style protocol generator with automated PICO (Population, Intervention, Comparator, Outcomes) extraction from sample abstracts, producing a structured protocol document.
3. **Search**: Multi-database literature search across five sources — PubMed (via E-utilities API), ClinicalTrials.gov/AACT (via PostgreSQL proxy), OpenAlex, Europe PMC, and CrossRef — with automatic cross-source deduplication via DOI matching and Levenshtein title similarity (threshold 0.85).
4. **Screen**: Title/abstract screening with optional BM25-based automated relevance scoring (Okapi BM25 [13], k1 = 1.5, b = 0.75) combined with PICO-component character n-gram similarity to prioritize references for manual review.
5. **Extract**: Structured data extraction form supporting two input modes: (a) pre-computed effect estimates with confidence intervals, and (b) raw 2x2 contingency table counts (events and totals per arm) with automatic effect size computation (OR via Woolf's method, RR via log method, RD via standard formula, with 0.5 continuity correction for single-zero cells). Integrated Risk of Bias 2.0 assessment domains [14]. Extracted data supports six effect measure types: odds ratio (OR), risk ratio (RR), risk difference (RD), hazard ratio (HR), mean difference (MD), and standardized mean difference (SMD).
6. **Analyze**: Multi-method random-effects meta-analysis (DL, REML, MH, Peto) with interactive SVG forest plots, funnel plots, leave-one-out sensitivity analysis, Cook's distance influence diagnostics, subgroup analysis with chi-squared test for interaction, publication bias diagnostics (Egger, Peters, PET-PEESE, Copas selection model, Z-Curve, RoBMA), automated GRADE certainty of evidence assessment with dynamic optimal information size (five domains with transparent scoring), Bayesian credible intervals, NNT computation with interactive baseline risk slider, cumulative meta-analysis with SVG visualization, Duval-Tweedie trim-and-fill publication bias adjustment, study removal sensitivity analysis, prediction intervals, three-level meta-analysis for dependent effect sizes, and design-driven meta-analysis (DDMA). Ratio measures (OR, RR, HR) are analyzed on the natural logarithm scale with back-transformation for presentation.
7. **Write**: Automated manuscript section generator producing Introduction, Methods, Results, and Discussion sections with PICO-informed text, statistical results, and PRISMA 2020 flow diagram data [15].

In addition to the seven core phases, the application provides six supplementary tabs: **Dashboard** (project overview and navigation, including trial landscape analytics with interactive visualizations), **Checkpoints** (project state snapshots), **Insights** (evidence surveillance with living meta-analysis sequential monitoring), **DTA** (diagnostic test accuracy meta-analysis with bivariate generalized linear mixed model [GLMM], hierarchical summary receiver operating characteristic [HSROC] curve with Cholesky-decomposed SROC ellipse incorporating between-study correlation, QUADAS-2 risk of bias assessment, and Fagan nomogram for post-test probability), **NMA** (network meta-analysis via Bucher indirect comparisons with P-score ranking, node-splitting for inconsistency detection, and league table presentation), and **Dose-Response** (dose-response meta-analysis using restricted cubic splines with the Greenland-Longnecker generalized least squares method). The application thus comprises 13 tabs in total.

Data persistence uses the IndexedDB API for structured project data (studies, references, extraction forms, analysis results), with an automatic in-memory fallback store when IndexedDB is unavailable (as occurs in private/incognito browsing mode). All user-generated content rendered to the DOM is passed through an explicit HTML escaping function covering angle brackets, ampersands, and quotation marks to prevent cross-site scripting (XSS). CSV exports apply formula injection prevention via a csvSafeCell() sanitizer that prefixes cells beginning with `=`, `+`, `@`, tab, or carriage return characters with a single quote. TruthCert URL validation restricts accepted schemes to `file:` and `https:` only. The application implements undo/redo functionality (maximum 50 states) for data extraction operations.

The application provides internationalization support with Arabic (right-to-left layout), Spanish, and French translations for patient-facing content, enabling evidence communication across diverse clinical populations.

### Statistical engine

The meta-analysis engine implements four pooling methods, providing users with complementary approaches for different data scenarios.

#### DerSimonian-Laird random-effects model

The DerSimonian-Laird (DL) random-effects model [16] is the most widely used heterogeneity estimator in meta-analysis software worldwide and the historical default in Cochrane RevMan through version 5.4. Between-study variance (tau-squared) is estimated as:

> tau-squared_DL = max(0, (Q - (k - 1)) / C)

where Q = sum(w_i * (y_i - mu_FE)^2) is Cochran's Q statistic [17], k is the number of studies, w_i = 1/v_i are fixed-effect inverse-variance weights, mu_FE is the fixed-effect pooled estimate, v_i is the within-study variance of study i, and C = sum(w_i) - sum(w_i^2) / sum(w_i) is the DerSimonian-Laird C-denominator.

**Confidence intervals.** Confidence intervals for the pooled effect are computed using the Knapp-Hartung/Sidik-Jonkman (HKSJ) modification [18], which replaces the standard normal distribution with a t-distribution on k - 1 degrees of freedom and uses a study-specific adjusted variance estimate. The HKSJ modification produces wider, more conservative confidence intervals than the standard DL approach, particularly for meta-analyses with few studies (small k). It is applied by default for all analyses with k >= 2, consistent with current Cochrane Handbook recommendations [19]. Users should note that when the DL estimate of tau-squared equals zero (indicating no detectable heterogeneity), the HKSJ modification may produce confidence intervals that are narrower than the standard DL intervals — a known anti-conservative property that has been documented by Rover et al. [20].

**REML sensitivity analysis.** For heterogeneity sensitivity analysis, the restricted maximum likelihood (REML) estimator [21] is implemented using an iterative estimation algorithm initialized from the DL estimate (maximum 50 iterations, convergence tolerance 10^-5). REML generally provides less biased estimates of tau-squared than DL, particularly for small k, and is recommended as a sensitivity analysis estimator in the Cochrane Handbook v6.5 [19]. REML-based I-squared is computed as:

> I-squared_REML = 100 * tau-squared_REML / (tau-squared_REML + v_typical)

where v_typical = (k - 1) * sum(w_i) / (sum(w_i)^2 - sum(w_i^2)) represents the typical within-study sampling variance derived from the Q-statistic decomposition [21]. REML now recalculates prediction intervals using REML-based tau-squared, following Cochrane Handbook v6.5 Section 10.10.4.4 [19], providing users with REML-specific prediction intervals alongside the DL-based intervals. DL was retained as the primary estimator for this validation study to match the estimator used in the Cochrane pairwise comparison reference dataset and to enable direct cross-validation against the established R metafor DL implementation. REML results are provided alongside DL for every analysis.

#### Mantel-Haenszel pooling

For binary outcomes (OR, RR, RD), the Mantel-Haenszel (MH) method [36] provides a fixed-effect pooling approach that does not require continuity corrections for zero cells (except double-zero studies, which are excluded). The MH estimator is the recommended method for sparse binary data in the Cochrane Handbook [19], as it weights studies by a function of the cell counts rather than the variance of the log effect estimate, avoiding the instability of inverse-variance weights when event counts are small. MH pooled odds ratios, risk ratios, and risk differences are computed using the standard formulas with Robins-Breslow-Greenland variance estimation.

#### Peto method for rare events

The Peto method [37] provides an alternative fixed-effect approach specifically designed for meta-analyses of rare events. It uses the observed-minus-expected formulation (O - E) and the hypergeometric variance, avoiding continuity corrections entirely. The Peto method is recommended when events are rare (less than 1% in one arm) and treatment effects are not too large (OR between 0.2 and 5), as per Cochrane Handbook guidance [19]. Results include the Peto odds ratio with confidence interval and the heterogeneity Q statistic.

#### Bayesian credible intervals

A Bayesian analysis module provides credible intervals computed using a conjugate normal-normal model with vague priors (Normal(0, 10^4) for the overall effect, inverse-gamma for tau-squared). The posterior is computed analytically without Markov chain Monte Carlo (MCMC) sampling, ensuring deterministic results and rapid computation. The 95% credible interval is reported alongside the frequentist confidence interval, enabling users to compare the two inferential frameworks.

#### Prediction intervals

Prediction intervals, which estimate the range of true effects that might be observed in a future study, are computed using the t-distribution on k - 1 degrees of freedom, following the updated recommendation in Cochrane Handbook v6.5 (August 2024) [19] and the methods described by Higgins et al. [22] and Riley et al. [23]. Both DL-based and REML-based prediction intervals are reported.

#### Publication bias diagnostics

Funnel plot asymmetry is assessed through a suite of complementary methods:

**Egger's test.** Egger's weighted linear regression test [24] is applied for continuous outcomes. Applied only when k >= 10, following the recommendation of Sterne et al. [26].

**Peters' test.** Peters' test [25] is used for binary outcomes (odds ratios and risk ratios), employing the inverse of the total sample size as the precision proxy to avoid the artefactual correlation between the log odds ratio and its standard error that affects Egger's test for binary outcomes. An automated test selector (chooseAsymmetryTest) routes to the appropriate test based on effect measure type, study count, and heterogeneity level (I-squared < 50%).

**PET-PEESE.** The precision-effect test (PET) and precision-effect estimate with standard errors (PEESE) [38] provide a two-step approach to publication bias adjustment. PET regresses effect estimates on their standard errors; if the PET intercept is statistically significant (p < 0.10), PEESE refines the estimate by regressing on the variance (SE-squared) instead. The conditional estimator provides a bias-adjusted pooled effect that is less sensitive to small-study effects than the unadjusted estimate.

**Copas selection model.** The Copas selection model [39] estimates the number of hypothetically unpublished studies and provides a bias-adjusted pooled effect by jointly modeling the treatment effect and a selection process that determines publication probability as a function of study precision. The model reports the estimated number of missing studies and the adjusted pooled estimate with confidence interval.

**Z-Curve.** Z-Curve analysis [40] uses an expectation-maximization (EM) algorithm fitted to the distribution of z-values from the included studies to estimate the expected replication rate (ERR) and expected discovery rate (EDR). Low ERR (below 50%) suggests that the published literature may overestimate the true effect due to selective reporting. Z-Curve results include the fitted mixture model parameters and bootstrapped confidence intervals.

**RoBMA.** Robust Bayesian Meta-Analysis (RoBMA) [41] implements Bayesian model averaging across models with and without publication bias selection functions, providing a model-averaged posterior estimate that accounts for model uncertainty regarding the presence and form of publication bias.

**Trim-and-fill.** The Duval and Tweedie (2000) trim-and-fill method is implemented using the L0 rank-based estimator to detect and correct for funnel plot asymmetry [27]. The algorithm iteratively estimates the number of hypothetically missing studies (k0), imputes mirror-image studies on the sparse side, and recomputes the pooled estimate with the augmented dataset. The method requires k >= 5 studies and converges within 10 iterations.

#### Influence diagnostics

**Leave-one-out sensitivity analysis.** Each study is sequentially removed and the pooled effect recomputed, identifying studies whose inclusion or exclusion changes the magnitude, direction, or statistical significance of the meta-analytic conclusion.

**Cook's distance.** Following Viechtbauer and Cheung [42], Cook's distance is computed for each study as a measure of overall influence on the pooled estimate. Studies with Cook's distance exceeding a threshold (4/k by default) are flagged as influential. This complements leave-one-out analysis by providing a single summary influence metric per study, enabling rapid identification of outlying studies that disproportionately affect the pooled result.

#### Raw 2x2 table input

In addition to accepting pre-computed effect estimates with confidence intervals, the data extraction interface supports direct entry of raw 2x2 contingency table counts (events and total participants per arm). When in 2x2 input mode, effect sizes are automatically computed using standard epidemiological formulas: odds ratios via Woolf's method (log OR standard error = sqrt(1/a + 1/b + 1/c + 1/d)), risk ratios via the log method, and risk differences via the standard formula. Single-zero cells receive a 0.5 continuity correction applied to all four cells; studies with zero events in both arms return null (not computable). Computed effect sizes and 95% confidence intervals update in real-time as the user enters counts, with sample sizes (N total, N intervention, N control) auto-populated from the arm totals.

#### Zero-event handling

Studies with zero events in both treatment and control arms are excluded from the inverse-variance meta-analysis, consistent with the standard approach in RevMan and metafor for the inverse-variance method. No continuity correction is applied at the meta-analysis pooling stage. The MH and Peto methods handle zero cells without continuity correction (single-zero cells for MH; all non-double-zero studies for Peto), providing alternative pooling approaches when zero events are common. In 2x2 input mode, a 0.5 continuity correction is applied at the effect size computation stage for single-zero cells, consistent with the approach used in RevMan and Stata metan. Users are notified when studies are excluded for this reason.

#### Numerical robustness

The engine implements 15 explicit numerical guards: division-by-zero protection in the DL C-denominator and Egger/Peters regression denominators, logarithm-of-zero guards in effect transformation, square-root-of-negative guards in Peters' test and confidence interval computation, underflow protection in REML iteration weights, overflow protection in auxiliary analysis functions, and Lambda=0 division guards in HSROC SROC curve computation. These guards return null or safely bounded values rather than NaN or Infinity propagation.

#### Cumulative meta-analysis

Studies are sorted chronologically by publication year (extracted from the study identifier string) and the pooled effect estimate is recomputed after each sequential addition, producing a series of cumulative point estimates and confidence intervals. This visualization reveals how the evidence base evolved over time: whether early estimates were volatile and later stabilized, whether a single landmark trial shifted the pooled estimate, or whether the effect has remained consistent across decades. The cumulative forest plot is rendered as an interactive SVG with study labels on the y-axis and cumulative pooled effects (diamonds) with confidence intervals on the x-axis.

#### Study removal sensitivity index

For binary outcomes (OR, RR, HR), the study removal sensitivity index quantifies result robustness by counting how many individual study removals would change the pooled result from statistically significant (p < 0.05) to non-significant, or vice versa. This approach performs leave-one-out sensitivity analysis at the study level, identifying the number and identity of studies whose removal would flip the statistical conclusion. The sensitivity quotient (SQ = sensitivity index / k) normalizes for the number of studies; SQ > 0.33 suggests the meta-analysis conclusion is sensitive to individual studies. This method differs from the trial-level Fragility Index of Walsh et al. [28] — which modifies event counts within a single trial — in that it operates at the meta-analysis level by removing entire studies rather than modifying within-study counts. The study removal sensitivity index is computed for ratio measures only (OR, RR, HR) and is not applicable to continuous outcomes (MD, SMD).

#### Design-driven meta-analysis

The DDMA module [43] assesses the impact of study design characteristics on the pooled estimate. Studies are stratified by design features (randomization method, blinding status, allocation concealment) and meta-regression is used to quantify the contribution of design quality to heterogeneity, enabling users to evaluate whether design limitations in included studies systematically bias the pooled effect.

#### Three-level meta-analysis

For situations where multiple effect sizes are reported within the same study (e.g., multiple outcomes, multiple timepoints, or multiple treatment comparisons), the three-level meta-analysis module [44] accounts for the correlation between effect sizes nested within studies. This approach extends the standard random-effects model by adding a within-study variance component, avoiding the underestimation of standard errors that occurs when dependent effect sizes are treated as independent.

#### Subgroup analysis

When studies are assigned subgroup labels in the data extraction table, the analysis automatically performs stratified meta-analysis by computing separate pooled estimates for each subgroup using the same DL+HKSJ engine. A test for subgroup differences is conducted using the chi-squared test for heterogeneity between subgroups (Cochrane Handbook v6.5 [19], Section 10.11): Q_between = sum_j(w_j * (theta_j - theta_overall)^2) on J - 1 degrees of freedom, where J is the number of subgroups, w_j = 1/v_j is the inverse of each subgroup's pooled variance, and theta_overall is the fixed-effect weighted average of subgroup estimates. A p-value below 0.10 is flagged as evidence of subgroup interaction, consistent with the conventional threshold for exploratory subgroup analyses.

#### GRADE certainty of evidence

The analysis dashboard includes automated GRADE assessment [29] starting from HIGH certainty for RCTs, with downgrading across five domains: (1) risk of bias — flagged as "Not Assessed" when per-trial RoB 2.0 data is unavailable, rather than using study count as proxy; (2) inconsistency — based on I-squared thresholds and whether the prediction interval crosses the null; (3) indirectness — set to zero (requires manual evaluation); (4) imprecision — based on whether the confidence interval crosses the null and whether total enrollment exceeds a dynamic optimal information size (OIS) threshold, replacing the previously hardcoded threshold of 400 with a sample size calculation based on the observed effect size, baseline event rate, desired power (80%), and alpha (0.05); (5) publication bias — based on the Mathur-VanderWeele S-value [30].

GRADE upgrading is applied for observational evidence across three criteria: (a) large effect — for ratio measures when the pooled effect exceeds a two-fold threshold, and for continuous measures when the standardized effect exceeds a pre-specified magnitude; (b) dose-response gradient — when meta-regression demonstrates a statistically significant monotonic relationship between dose/exposure level and effect magnitude; (c) plausible confounding — when the direction of unmeasured confounding would bias toward the null, strengthening the causal inference. Observational evidence may be upgraded from LOW certainty without requiring a minimum starting certainty, consistent with the GRADE Working Group guidance that all three upgrade criteria are applicable regardless of the initial rating. Each domain score and rationale is displayed transparently alongside the final certainty rating.

#### Number Needed to Treat

For binary outcomes (OR, RR, HR), the NNT is computed using the Sackett formula for odds ratios and the risk ratio approximation for RR and HR. An interactive baseline event rate slider (range 1-50%) allows users to explore NNT sensitivity to assumed baseline risk, with confidence intervals derived from the pooled effect CI bounds.

#### Galbraith plot

The Galbraith (radial) plot displays standardized effect estimates (z-values) against study precision (1/SE), enabling visual identification of outlying studies and assessment of heterogeneity. The confidence band uses a confLevel-aware z-value (computed from the user-selected confidence level) rather than a hardcoded critical value, ensuring that the displayed band correctly reflects the chosen alpha level for any confidence level between 80% and 99%.

### Living meta-analysis sequential monitoring

The living meta-analysis module provides formal sequential monitoring methods for continuously updated meta-analyses, addressing the multiple testing problem inherent in repeated analysis of accumulating evidence [33,34].

#### CUSUM control charts

Cumulative sum (CUSUM) control charts [45] track the cumulative deviation of the observed treatment effect from a reference value (typically the null hypothesis or a clinically important difference). The implementation uses a two-sided CUSUM with post-crossing reset: when the cumulative sum exceeds a pre-specified decision boundary (calibrated to control the type I error rate), a signal is generated and the cumulative sum resets to zero, enabling detection of subsequent shifts. The CUSUM chart is rendered as an interactive SVG with decision boundaries displayed as horizontal reference lines.

#### Alpha spending functions

To control the overall type I error rate across multiple interim analyses, three alpha spending functions are implemented:

1. **O'Brien-Fleming** [46]: Allocates very little alpha at early interim analyses and progressively more at later analyses, producing conservative early boundaries that preserve most of the alpha for the final analysis. This is the recommended default for most clinical applications.
2. **Pocock** [47]: Allocates alpha approximately equally across all interim analyses, producing constant monitoring boundaries. This approach uses alpha more aggressively at early time points, providing greater power for early stopping but requiring a larger maximum sample size.
3. **Lan-DeMets** [48]: A flexible spending function that approximates the O'Brien-Fleming or Pocock boundaries while allowing interim analyses at arbitrary (unplanned) information fractions. This is particularly useful for living meta-analyses where the timing and number of updates are not pre-specified.

The alpha spending approach is used rather than fixed group sequential boundaries because it accommodates the irregular timing of evidence accumulation inherent in living systematic reviews, where new studies are incorporated as they are published rather than at pre-planned analysis points.

#### Required information size

The required information size (RIS) [35] is computed as the meta-analytic equivalent of a sample size calculation for a single trial. The RIS accounts for between-study heterogeneity by inflating the required number of participants:

> RIS = (sample_size_for_single_trial) * D

where D = 1 + tau-squared / v_typical is the heterogeneity adjustment factor (design effect for meta-analysis), tau-squared is the estimated between-study variance, and v_typical is the typical within-study variance. The information fraction at each interim analysis is computed as the cumulative number of participants divided by the RIS. An information fraction progress bar with WCAG-compliant `role="progressbar"` and dynamic `aria-valuenow` attributes provides accessible real-time monitoring.

#### Sequential stopping recommendations

The module synthesizes the CUSUM chart, alpha spending boundaries, and information fraction into a three-tier recommendation system:

- **STOP — EFFICACY**: The cumulative evidence has crossed the efficacy boundary with sufficient information fraction, supporting early termination in favor of the intervention.
- **STOP — FUTILITY**: The cumulative evidence has crossed the futility boundary or the information fraction has reached the maximum with no significant result, suggesting further studies are unlikely to demonstrate a clinically meaningful effect.
- **CONTINUE**: The cumulative evidence remains within the continuation region; additional studies are needed before a definitive conclusion can be drawn.

An auto-update scheduler enables periodic dashboard refresh at user-configurable intervals, supporting the workflow of living systematic reviews that incorporate new evidence as it becomes available.

### Advanced statistical methods

#### PET-PEESE publication bias adjustment

The precision-effect test and precision-effect estimate with standard errors (PET-PEESE) [38] implements a conditional two-step estimator for publication bias. PET regresses effect estimates on their standard errors (weighted by inverse variance); if the intercept is significantly different from zero (p < 0.10), indicating publication bias, PEESE refines the bias-adjusted estimate by regressing on the squared standard errors instead, which provides a less biased estimate when the true effect is non-zero.

#### Copas selection model

The Copas selection model [39] provides a sensitivity analysis framework for publication bias by jointly modeling the treatment effect distribution and a probit selection function governing the probability of publication. The model estimates how many studies may be missing from the meta-analysis and provides adjusted pooled estimates under different assumptions about the strength of selection. Results include the estimated number of unpublished studies and the range of adjusted effects across a sensitivity parameter grid.

#### Z-Curve analysis

Z-Curve [40] fits a finite mixture model to the distribution of z-values from the included studies using an expectation-maximization (EM) algorithm. The estimated expected replication rate (ERR) quantifies the average power of the included studies, while the expected discovery rate (EDR) estimates the proportion of true effects among all conducted tests. A large discrepancy between the observed discovery rate and the EDR suggests substantial publication bias or p-hacking.

#### Robust Bayesian meta-analysis

RoBMA [41] implements Bayesian model averaging across a set of models that vary in their assumptions about the presence of a true effect, heterogeneity, and publication bias. Selection models with weight functions (e.g., step functions at p = 0.05) are included in the model space. The posterior model-averaged estimate is robust to model specification uncertainty regarding publication bias, as it averages across models with and without bias adjustment, weighted by their posterior probability.

### Diagnostic test accuracy enhancements

The DTA module implements the bivariate GLMM [49] and HSROC [50] models for meta-analysis of diagnostic test accuracy studies. The SROC ellipse is computed using Cholesky decomposition of the between-study variance-covariance matrix, incorporating the estimated between-study correlation (rho) to produce correctly oriented confidence and prediction ellipses. The chi-squared critical value for the ellipse boundary is computed from the user-selected confidence level (confLevel-aware), replacing the previously hardcoded value of 5.991 (which corresponds to alpha = 0.05 only). A numerical guard prevents division by zero when Lambda = 0 in the SROC curve computation.

### Security and accessibility

The application implements multiple security measures: HTML escaping (escapeHtml()) for all user-generated content rendered to the DOM, preventing XSS via innerHTML injection; CSV formula injection prevention (csvSafeCell()) for all exported data; TruthCert URL validation restricting accepted schemes to `file:` and `https:`; and field-level input allowlists for data extraction.

Accessibility features comply with WCAG 2.1 Level AA: roving tabindex keyboard navigation for insight sub-tabs, `role="progressbar"` with dynamic `aria-valuenow` on the information fraction bar, SVG chart elements with `<title>` elements and `tabindex="0"` for screen reader access, toast notification dark mode CSS overrides for sufficient contrast, alert log icons with `aria-hidden="true"` to prevent redundant screen reader announcements, keyboard-navigable tablist pattern, skip navigation, focus-visible indicators, `prefers-color-scheme` and `prefers-reduced-motion` media queries, and responsive design with breakpoints at 800px and 480px for tablet and phone form factors respectively.

### Validation design

A triple-blinded validation architecture was designed to prevent confirmation bias during accuracy assessment:

1. **Oracle** (sealed reference): An independent Python implementation computed DL random-effects meta-analysis results from raw Cochrane pairwise comparison data files. Results were sealed using SHA-256 content hashing before any browser-based extraction began, ensuring the reference values could not be modified post hoc to match browser outputs.

2. **Extractor** (blinded): A Selenium WebDriver automation script drove MetaSprint Autopilot in Chrome headless mode. The extractor injected study-level data (effect estimates and confidence intervals) programmatically and retrieved pooled results from the browser engine. The extractor had no access to expected oracle results.

3. **Judge** (independent): A comparator script loaded both sealed oracle outputs and blinded extractor outputs from separate file paths and assessed agreement using pre-specified tolerances (Table 1). The judge script was written and tested before the extraction phase began.

**Table 1. Pre-specified validation tolerances.**

| Metric | Tolerance |
|--------|-----------|
| Pooled log-effect | +/- 0.005 absolute |
| Pooled effect (back-transformed) | +/- 1% relative or +/- 0.01 absolute |
| Confidence interval bounds | +/- 2% relative or +/- 0.02 absolute |
| I-squared | +/- 2 percentage points |
| Tau-squared | +/- 0.005 absolute or +/- 5% relative |
| Study count (k) | Exact match |

### Study sample

A total of 291 Cochrane systematic reviews were included from published pairwise comparison datasets, stratified by study count to ensure representation across the full range of meta-analysis sizes: small (k = 2-3, n = 76), medium-small (k = 4-5, n = 51), medium (k = 6-10, n = 68), medium-large (k = 11-20, n = 53), and large (k > 20, n = 43). Reviews spanned three outcome data types: binary (n = 202, analyzed as odds ratios), continuous (n = 63, analyzed as mean differences), and generic inverse-variance (n = 26, pre-computed log-scale effect estimates with standard errors).

### External cross-validation against R metafor

To validate the engine against an established reference standard, all 291 oracle results were independently cross-validated against R metafor v4.8.0 [10] using the `rma(method="DL")` function. Study-level data was independently re-parsed from raw Cochrane CSV files by the R cross-validation script, ensuring no data-flow dependency on the Python oracle implementation. Agreement was assessed using Pearson correlation, Lin's concordance correlation coefficient (CCC), and mean absolute difference (MAD).

### Software testing

The automated test suite comprises approximately 1,414 tests across more than 15 test files, executed via Playwright v1.50 (end-to-end browser tests in Chromium) and Selenium WebDriver v4.27 (validation tests in headless Chrome 131), with Python 3.13 for Selenium tests. No external services or API keys were required:

- **Playwright end-to-end tests** (364 tests across multiple spec files): 313 benchmark tests covering the complete analysis pipeline (DL, HKSJ, REML, MH, Peto, Egger, Peters, PET-PEESE, Copas, Z-Curve, RoBMA, leave-one-out, Cook's distance, prediction intervals, cumulative MA, trim-and-fill, study removal sensitivity, subgroup analysis, meta-regression, three-level MA, DDMA, GRADE with dynamic OIS, NNT, Bayesian credible intervals, forest/funnel/Galbraith plots, CSV export, manuscript generation, confidence level propagation, error conditions, edge cases, tab navigation, and UX behavior), SGLT2i benchmark validation tests (multi-outcome golden dataset against published pooled estimates), Meta2 governance tests (conservative arbitration, bias decomposition, question contracts, decision regret), and R cross-validation tests comparing JavaScript engine outputs against pre-computed R metafor v4.8.0, mada, and netmeta reference values; plus 51 living meta-analysis and advanced method tests covering CUSUM control charts, alpha spending functions, required information size, sequential stopping rules, information fraction tracking, and auto-update scheduling.
- **Selenium validation tests** (over 1,050 tests across 15+ files): Statistical edge case tests (mathematical foundations, numerical guards, data transformation), comprehensive validation tests, feature tests (reference parsers, SVG rendering, XSS prevention, CSV formula injection, security guards), autoscreener threshold tests, autoscreener cardiology-mode tests, Al-Burhan living meta-analysis integration tests, extractor adapter tests, clinical data validation tests, accessibility compliance tests, and internationalization tests.

## Results

### Meta-analysis engine accuracy

The engine achieved 100.0% accuracy (291 of 291 reviews within pre-specified tolerances) across all three outcome data types: binary (202 of 202, 100.0%), continuous (63 of 63, 100.0%), and generic inverse-variance (26 of 26, 100.0%) (Table 2; complete per-review results in S3 Table). Accuracy was maintained across all five study count strata, from small meta-analyses (k = 2-3, 76 of 76, 100.0%) to large meta-analyses (k > 20, 43 of 43, 100.0%) (Table 3).

**Table 2. Engine accuracy by outcome data type.**

| Data type | n | Pass | Rate |
|-----------|---|------|------|
| Binary | 202 | 202 | 100.0% |
| Continuous | 63 | 63 | 100.0% |
| Generic inverse-variance | 26 | 26 | 100.0% |
| **Total** | **291** | **291** | **100.0%** |

**Table 3. Engine accuracy by study count stratum.**

| Study count (k) | n | Pass | Rate |
|------------------|---|------|------|
| 2-3 | 76 | 76 | 100.0% |
| 4-5 | 51 | 51 | 100.0% |
| 6-10 | 68 | 68 | 100.0% |
| 11-20 | 53 | 53 | 100.0% |
| >20 | 43 | 43 | 100.0% |

### Per-metric precision

Per-metric analysis revealed near-exact precision across all statistical outputs (Table 4). The median absolute difference between MetaSprint and the sealed oracle was 1.65 x 10^-7 for the pooled effect estimate, with a maximum difference of 1.66 x 10^-4 (well within the pre-specified tolerance of 0.01). The 95th percentile difference was 2.91 x 10^-6, indicating that differences exceeding one part per million were rare.

**Table 4. Per-metric precision between MetaSprint and sealed oracle.**

| Metric | Pass rate | Median diff | Mean diff | Max diff | P95 |
|--------|-----------|-------------|-----------|----------|-----|
| Pooled effect | 100.0% | 1.65e-07 | 1.19e-06 | 1.66e-04 | 2.91e-06 |
| Pooled log/linear | 100.0% | 1.51e-07 | 2.68e-06 | 3.41e-04 | 5.29e-06 |
| CI lower bound | 100.0% | 1.74e-07 | 8.29e-07 | 1.04e-04 | 1.96e-06 |
| CI upper bound | 100.0% | 2.38e-07 | 2.40e-06 | 1.88e-04 | 7.24e-06 |
| I-squared | 100.0% | 5.61e-06 | 1.69e-04 | 2.55e-02 | 4.62e-04 |
| Tau-squared | 100.0% | 1.57e-07 | 7.66e-06 | 1.47e-03 | 9.37e-06 |
| Study count (k) | 100.0% | 0 | 0 | 0 | 0 |

### External cross-validation against R metafor

The Python oracle's DL implementation produced results identical to R metafor v4.8.0 across all 291 reviews (Table 5), establishing the complete three-link external validation chain: MetaSprint (browser JavaScript) = Python Oracle = R metafor.

**Table 5. Agreement between Python oracle DL and R metafor v4.8.0 DL.**

| Metric | Pearson r | Lin CCC | MAD | Max AD |
|--------|-----------|---------|-----|--------|
| Pooled log-effect | 1.000000 | 1.000000 | 0.00 | 0.00 |
| Tau-squared | 1.000000 | 1.000000 | 0.00 | 0.00 |
| I-squared | 1.000000 | 1.000000 | 0.00 | 0.00 |

Study count exact match was achieved for all 291 reviews (100.0%). Perfect agreement was maintained across all data types: binary (n = 202, CCC = 1.0000), continuous (n = 63, CCC = 1.0000), and generic inverse-variance (n = 26, CCC = 1.0000).

### DL versus REML sensitivity analysis

DerSimonian-Laird and REML heterogeneity estimators showed near-perfect agreement for binary outcomes (CCC = 0.9994, MAD = 0.0104) and generic inverse-variance outcomes (CCC = 1.0000, MAD = 0.0092) (S1 Fig). Continuous outcomes showed greater estimator divergence (CCC = 0.7388, MAD = 1.0952) attributable to the heterogeneous effect scales across diverse clinical measurement units in the continuous outcome reviews (Table 6).

**Table 6. DL vs REML agreement by data type.**

| Data type | n | CCC (pooled log) | MAD (pooled log) | Max AD | Bland-Altman LOA |
|-----------|---|-------------------|------------------|--------|------------------|
| Binary | 202 | 0.9994 | 0.0104 | 0.1327 | [-0.046, 0.049] |
| Continuous | 63 | 0.7388 | 1.0952 | 61.0843 | [-14.22, 16.01] |
| GIV | 26 | 1.0000 | 0.0092 | 0.0555 | [-0.035, 0.032] |

### Heterogeneity analysis

Statistical heterogeneity increased systematically with study count: 70% of reviews with k > 20 had I-squared > 50%, compared with 28% for reviews with k = 2-3 (S1 Table). Mean I-squared was 26.7% for small meta-analyses (k = 2-3) and 60.9% for large meta-analyses (k > 20) (S2 Fig). This pattern is consistent with the expectation that larger meta-analyses are more likely to include clinically diverse study populations, resulting in greater between-study variability.

### Leave-one-out sensitivity analysis

Leave-one-out analysis was performed on 245 reviews with k >= 3. Direction of the pooled effect changed upon removal of a single study in 61 reviews (24.9%), and statistical significance at alpha = 0.05 changed in 65 reviews (26.5%) (S2 Table). The median range of leave-one-out pooled effects across all removed studies within each review was 0.3453 log units. These findings indicate that approximately one quarter of published meta-analyses contain at least one study whose inclusion or exclusion changes the qualitative conclusion, underscoring the importance of routine sensitivity analysis.

### Prediction intervals

Prediction intervals were computed for 245 reviews with k >= 3. Of these, 226 reviews (92.2%) had prediction intervals crossing the null, indicating that even when the pooled effect is nominally statistically significant at alpha = 0.05, the predicted true effect in a new study setting frequently includes the possibility of no benefit or harm. The median prediction interval width was 2.96 log units. This finding supports the recommendation that prediction intervals should be routinely reported alongside confidence intervals in meta-analyses [22].

### Publication bias diagnostics

Egger's weighted regression test was applied to 107 reviews meeting the minimum study count threshold (k >= 10) [26]. Funnel plot asymmetry at p < 0.10 was detected in 28 reviews (26.2%), and at p < 0.05 in 20 reviews (18.7%). These proportions are consistent with published estimates that approximately 20-30% of meta-analyses in medicine show evidence of small-study effects [24].

### Automated search validation

Automated PICO-based multi-database search was evaluated against 100 Cochrane reviews with known trial registrations. PICO extraction from the review abstract succeeded for all 100 reviews (100.0%). Relevant registered trials were discovered on ClinicalTrials.gov for 65 reviews (65.0%) and matching publications were identified on PubMed for 58 reviews (58.0%), with zero API errors during the evaluation. These discovery rates represent lower bounds on recall, as the evaluation compared automated search against only those trials already included in the Cochrane review, and the automated search may additionally identify relevant trials not captured in the original review's search strategy.

### Pooling method comparison

**Table 7. Comparison of MetaSprint Autopilot with existing tools.**

| Feature | MetaSprint | RevMan 5 [5] | Covidence [8] | metafor [10] | Rayyan [11] | SRDR+ [12] |
|---------|-----------|--------------|---------------|-------------|-------------|------------|
| Installation required | No | Yes | No (web) | Yes (R) | No (web) | No (web) |
| Internet required | No* | No | Yes | No | Yes | Yes |
| Institutional license | No | No** | Yes | No | Freemium | No |
| Protocol generation | Yes | No | No | No | No | No |
| Multi-database search | Yes (5) | No | No | No | No | No |
| Screening with ML | Yes (BM25) | No | Yes (AI) | No | Yes (AI) | No |
| Data extraction | Yes | Yes | Yes | No | No | Yes |
| Raw 2x2 input | Yes (OR/RR/RD) | Yes | No | Yes | No | No |
| Pooling: DL+HKSJ | Yes | Yes (IV) | No | Yes | No | Limited |
| Pooling: MH | Yes | Yes | No | Yes | No | No |
| Pooling: Peto | Yes | Yes | No | Yes | No | No |
| REML sensitivity | Yes | No | No | Yes | No | No |
| Bayesian CrI | Yes | No | No | Yes (bayesmeta) | No | No |
| Forest/funnel plots | Yes (SVG) | Yes | No | Yes | No | Limited |
| GRADE assessment | Yes (automated) | No | No | No | No | No |
| NNT computation | Yes (interactive) | No | No | No | No | No |
| Subgroup analysis | Yes (interaction test) | Yes | No | Yes | No | No |
| Cumulative MA | Yes (SVG) | Yes | No | Yes | No | No |
| Trim-and-fill | Yes (L0) | No | No | Yes | No | No |
| PET-PEESE | Yes | No | No | Yes (puniform) | No | No |
| Copas selection model | Yes | No | No | Yes | No | No |
| Z-Curve | Yes | No | No | No | No | No |
| RoBMA | Yes | No | No | Yes (RoBMA) | No | No |
| Cook's distance | Yes | No | No | Yes | No | No |
| Study removal sensitivity | Yes | No | No | No | No | No |
| Three-level MA | Yes | No | No | Yes | No | No |
| DDMA | Yes | No | No | No | No | No |
| Living MA (CUSUM/TSA) | Yes | No | No | No | No | No |
| DTA meta-analysis | Yes (GLMM/HSROC) | No | No | Yes (mada) | No | No |
| Network meta-analysis | Yes (Bucher) | No | No | Yes (netmeta) | No | No |
| Dose-response MA | Yes (RCS/GL) | No | No | Yes (dosresmeta) | No | No |
| Manuscript generation | Yes | No | No | No | No | No |
| Offline capable | Yes | Yes | No | Yes | No | No |
| Validated (reviews) | 291 | Not published | N/A | Extensive | N/A | N/A |
| Internationalization | Yes (AR/ES/FR) | Limited | No | No | Yes | No |
| WCAG 2.1 AA | Yes | Partial | Partial | N/A (CLI) | Partial | Partial |

\* After initial download. \*\* Free for Cochrane authors; limited for others.

## Discussion

### Summary of principal findings

MetaSprint Autopilot achieves near-exact accuracy in DerSimonian-Laird random-effects meta-analysis across 291 Cochrane systematic reviews spanning three outcome data types and five study count strata. The median absolute difference from the sealed oracle reference was 1.65 x 10^-7 (approximately one part in six million), with perfect agreement (CCC = 1.0000) against the R metafor reference implementation. The single-file architecture eliminates installation, server infrastructure, and institutional licensing requirements, enabling evidence synthesis in any setting with a modern web browser.

Since the initial validation, the statistical engine has been substantially expanded to include Mantel-Haenszel and Peto pooling methods for sparse binary data, Bayesian credible intervals, five publication bias methods beyond Egger/Peters (PET-PEESE, Copas selection model, Z-Curve, RoBMA, trim-and-fill), Cook's distance influence diagnostics, three-level meta-analysis for dependent effects, design-driven meta-analysis, and a living meta-analysis module with CUSUM control charts, alpha spending functions, and sequential stopping rules. These additions bring the total test suite to approximately 1,414 automated tests across more than 15 test files.

### Comparison with existing tools

Several tools currently serve parts of the systematic review and meta-analysis workflow (Table 7). MetaSprint Autopilot differs from these tools in four key respects. First, it operates as a single file requiring no installation, server infrastructure, or persistent internet connection after initial download — a design that maximizes accessibility in bandwidth-limited and resource-constrained settings. Second, it integrates all phases of systematic review across 13 tabs in a guided workflow — including specialized modules for diagnostic test accuracy, network meta-analysis, dose-response meta-analysis, and living evidence monitoring — reducing the need to transfer data between multiple tools and lowering the methodological expertise required to initiate a review. Third, it has been validated at a scale (291 reviews) and precision (median difference 10^-7) that exceeds most published meta-analysis software validations, with all validation data and scripts made publicly available for independent verification. Fourth, it provides living meta-analysis monitoring with formal sequential stopping rules (CUSUM, alpha spending, RIS), a capability not available in any other free, zero-install meta-analysis tool.

### Strengths

The triple-blinded validation architecture prevents confirmation bias by cryptographically sealing reference results before browser extraction begins. The large validation sample (291 reviews) spans three outcome data types and five study count strata, providing comprehensive coverage of real-world meta-analysis scenarios. External cross-validation against R metafor v4.8.0 establishes a three-link independent verification chain (JavaScript engine to Python oracle to R metafor). The automated test suite (approximately 1,414 tests across more than 15 files) covers mathematical foundations, statistical functions, all four pooling methods (DL, REML, MH, Peto), five publication bias diagnostics (Egger, Peters, PET-PEESE, Copas, Z-Curve, RoBMA, trim-and-fill), Cook's distance influence diagnostics, CUSUM sequential monitoring, alpha spending functions, GRADE certainty assessment with dynamic OIS, NNT computation, raw 2x2 input validation, subgroup analysis, three-level meta-analysis, DDMA, Bayesian credible intervals, R cross-validation against metafor/mada/netmeta, clinical data validation, security (XSS prevention, CSV formula injection, URL validation), accessibility compliance (WCAG 2.1 AA), and internationalization. The integrated GRADE assessment with transparent domain scoring including dynamic optimal information size calculation, subgroup analysis with formal test for interaction, and interactive NNT calculator provides decision support not available in other free meta-analysis tools. The zero-install single-file design maximizes accessibility for medical students and clinicians in resource-limited settings, requiring only a web browser that is already present on virtually all computing devices. The application implements WAI-ARIA authoring practices including keyboard-navigable tablist pattern with roving tabindex, skip navigation, focus-visible indicators, `prefers-color-scheme` and `prefers-reduced-motion` media queries, SVG chart accessibility with `<title>` elements, and responsive design with breakpoints at 800px and 480px for tablet and phone form factors respectively.

### Limitations

Several limitations should be acknowledged. First, the primary estimator validated against the 291-review benchmark is DerSimonian-Laird, which is known to produce downwardly biased estimates of between-study variance, particularly for meta-analyses with few studies [31]. While the HKSJ modification is applied by default for confidence intervals and REML is available for sensitivity analysis, alternative moment-based estimators such as Paule-Mandel are not yet implemented. Second, when the DL estimate of tau-squared is exactly zero, the HKSJ modification may produce confidence intervals that are anti-conservative (narrower than standard DL intervals), a documented limitation of the HKSJ approach [20]. Third, no formal user study was conducted; validation was purely computational, and usability, time savings, and error rates in practice remain to be assessed in a prospective evaluation with target users. Fourth, while the application now provides diagnostic test accuracy meta-analysis (bivariate GLMM, HSROC), dose-response meta-analysis (restricted cubic splines, Greenland-Longnecker), and exploratory network meta-analysis via Bucher's indirect comparison method [32] with P-score ranking, the NMA implementation does not yet support full frequentist graph-theoretical models or consistency assessment beyond node-splitting, and individual participant data meta-analysis is not supported. Fifth, search recall rates (65.0% for ClinicalTrials.gov, 58.0% for PubMed) depend on the quality of automated PICO term extraction and may not replace comprehensive manual search strategies; these rates represent lower bounds, as the gold standard was limited to trials already included in Cochrane reviews. Sixth, while the application implements automated GRADE certainty assessment across five domains with dynamic OIS and three upgrade criteria, two downgrading domains — risk of bias and indirectness — require manual per-trial evaluation that cannot be automated from registry-level data alone [29]. Seventh, no real-time collaboration features are available; multi-reviewer workflows require manual coordination through file export and import. Eighth, all computation runs client-side in the browser, which may limit performance for very large datasets (more than 500 studies) on low-powered devices. Ninth, the CUSUM sequential monitoring module is exploratory; while the statistical properties of CUSUM charts and alpha spending functions are well established in the clinical trial literature [45,46,47,48], their application to the meta-analysis context — where "information increments" are entire studies rather than individual patient outcomes — remains an area of active methodological development, and the alpha spending approach assumes approximately independent increments of information, an assumption that may be violated when newly added studies share population characteristics or treatment protocols with existing studies. Tenth, the Bayesian credible interval module uses a conjugate normal-normal model with vague priors, which provides a closed-form posterior but does not support informative priors, hierarchical priors, or full MCMC-based posterior exploration; users requiring flexible Bayesian meta-analysis should consider dedicated software such as bayesmeta or brms.

### Clinical implications

By eliminating installation barriers and institutional licensing costs, MetaSprint Autopilot may facilitate evidence synthesis by medical students, residents, and clinicians who would otherwise lack access to meta-analysis software. The guided 13-tab workflow with automated protocol generation, multi-database search, and manuscript drafting reduces the methodological expertise required to initiate a systematic review, while the validated statistical engine ensures that computation errors do not compromise the accuracy of pooled estimates. The living meta-analysis module with formal sequential stopping rules enables researchers to maintain up-to-date evidence syntheses while controlling for the multiple testing problem inherent in repeated updating, supporting timely evidence-based decision-making. The PRISMA 2020-aligned workflow [15] encourages adherence to established reporting guidelines. The offline capability makes the tool suitable for use in clinical rotations, field settings, and regions with unreliable internet connectivity. The availability of Arabic, Spanish, and French translations for patient-facing content supports evidence communication across linguistically diverse clinical populations.

### Future directions

Planned development includes expanded network meta-analysis capabilities using a full frequentist graph-theoretical framework with multivariate consistency assessment, individual participant data meta-analysis support, integration of machine learning-assisted data extraction from PDF publications, a formal user study with medical students to assess usability and time efficiency, and additional language translations for the patient-facing interface.

## Conclusions

MetaSprint Autopilot is a free, open-source, zero-install platform for systematic review and meta-analysis that achieves 100.0% accuracy (within pre-specified tolerances) across 291 Cochrane systematic reviews, validated through a triple-blinded architecture with SHA-256 sealed references and cross-validated against R metafor v4.8.0. The median pooled effect difference of 1.65 x 10^-7 demonstrates near-exact numerical agreement. The platform provides four pooling methods (DL, REML, MH, Peto), seven publication bias diagnostics, Bayesian credible intervals, Cook's distance influence analysis, three-level meta-analysis, living evidence monitoring with CUSUM control charts and alpha spending functions, automated GRADE certainty assessment with dynamic optimal information size, and comprehensive accessibility compliance (WCAG 2.1 AA) with internationalization support — all within a single 30,639-line HTML file validated by approximately 1,414 automated tests. The single-file design maximizes accessibility for medical students and clinicians globally, particularly in settings where institutional software licenses, reliable internet, or local IT infrastructure may be unavailable.

## Ethics statement

This study involved computational validation using publicly available Cochrane systematic review datasets and publicly registered clinical trial data from ClinicalTrials.gov. No human participants, patient data, or animal subjects were involved. No institutional review board (IRB) or ethics committee approval was required, as the study used only publicly available aggregate data with no identifiable patient information.

## Author contributions (CRediT)

**[AUTHOR_PLACEHOLDER]**: Conceptualization, Methodology, Software, Validation, Formal analysis, Investigation, Data curation, Writing — original draft, Writing — review and editing, Visualization, Project administration.

## Data availability statement

All source code, validation data, sealed oracle hashes, blinded extractor outputs, and judge comparison scripts are available at [REPOSITORY_URL_PLACEHOLDER] under the MIT License. The Cochrane pairwise comparison data used for validation are derived from publicly available Cochrane systematic reviews. ClinicalTrials.gov data are public domain (National Institutes of Health). A Zenodo archive of the complete validation dataset and reproducibility capsule is available at [ZENODO_DOI_PLACEHOLDER].

## Acknowledgments

The statistical methods implemented in MetaSprint Autopilot were informed by the Cochrane Handbook for Systematic Reviews of Interventions [19] and the R metafor package documentation [10]. The validation framework design was inspired by triple-blinded assessment principles from clinical trial methodology. The living meta-analysis sequential monitoring methods were informed by the trial sequential analysis literature [35] and the Cochrane guidance on living systematic reviews [33].

## Competing interests

The author declares no competing interests.

## Funding

The author received no specific funding for this work.

## References

[1] Murad MH, Asi N, Alsawas M, Alahdab F. New evidence pyramid. BMJ Evidence-Based Medicine. 2016;21(4):125-127. https://doi.org/10.1136/ebmed-2016-110401

[2] Sackett DL, Rosenberg WM, Gray JM, Haynes RB, Richardson WS. Evidence based medicine: what it is and what it isn't. BMJ. 1996;312(7023):71-72. https://doi.org/10.1136/bmj.312.7023.71

[3] Borah R, Brown AW, Capers PL, Kaiser KA. Analysis of the time and workers needed to conduct systematic reviews of medical interventions using data from the PROSPERO registry. BMJ Open. 2017;7(2):e012545. https://doi.org/10.1136/bmjopen-2016-012545

[4] Cochrane Library. About Cochrane Reviews. Cochrane; 2024. Available from: https://www.cochranelibrary.com/about/about-cochrane-reviews

[5] Review Manager (RevMan) [Computer program]. Version 5.4. The Cochrane Collaboration; 2020. Available from: https://training.cochrane.org/online-learning/core-software/revman

[6] Harris RJ, Bradburn MJ, Deeks JJ, Harbord RM, Altman DG, Sterne JAC. metan: fixed- and random-effects meta-analysis. Stata Journal. 2008;8(1):3-28. https://doi.org/10.1177/1536867X0800800102

[7] Borenstein M, Hedges LV, Higgins JPT, Rothstein HR. Comprehensive Meta-Analysis (Version 4) [Computer program]. Biostat; 2022. Available from: https://www.meta-analysis.com

[8] Covidence systematic review software. Veritas Health Innovation, Melbourne, Australia. Available from: https://www.covidence.org

[9] DistillerSR [Computer program]. Evidence Partners; 2023. Available from: https://www.evidencepartners.com

[10] Viechtbauer W. Conducting meta-analyses in R with the metafor package. Journal of Statistical Software. 2010;36(3):1-48. https://doi.org/10.18637/jss.v036.i03

[11] Ouzzani M, Hammady H, Fedorowicz Z, Elmagarmid A. Rayyan — a web and mobile app for systematic reviews. Systematic Reviews. 2016;5:210. https://doi.org/10.1186/s13643-016-0384-4

[12] Systematic Review Data Repository Plus (SRDR+). Agency for Healthcare Research and Quality (AHRQ); 2024. Available from: https://srdrplus.ahrq.gov

[13] Robertson SE, Walker S, Jones S, Hancock-Beaulieu MM, Gatford M. Okapi at TREC-3. In: Proceedings of the Third Text REtrieval Conference (TREC-3). NIST; 1994. p. 109-126.

[14] Sterne JAC, Savovic J, Page MJ, Elbers RG, Blencowe NS, Boutron I, et al. RoB 2: a revised tool for assessing risk of bias in randomised trials. BMJ. 2019;366:l4898. https://doi.org/10.1136/bmj.l4898

[15] Page MJ, McKenzie JE, Bossuyt PM, Boutron I, Hoffmann TC, Mulrow CD, et al. The PRISMA 2020 statement: an updated guideline for reporting systematic reviews. BMJ. 2021;372:n71. https://doi.org/10.1136/bmj.n71

[16] DerSimonian R, Laird N. Meta-analysis in clinical trials. Controlled Clinical Trials. 1986;7(3):177-188. https://doi.org/10.1016/0197-2456(86)90046-2

[17] Cochran WG. The combination of estimates from different experiments. Biometrics. 1954;10(1):101-129. https://doi.org/10.2307/3001666

[18] Knapp G, Hartung J. Improved tests for a random effects meta-regression with a single covariate. Statistics in Medicine. 2003;22(17):2693-2710. https://doi.org/10.1002/sim.1482

[19] Higgins JPT, Thomas J, Chandler J, Cumpston M, Li T, Page MJ, et al., editors. Cochrane Handbook for Systematic Reviews of Interventions version 6.5 (updated August 2024). Cochrane; 2024. Available from: https://training.cochrane.org/handbook

[20] Rover C, Knapp G, Friede T. Hartung-Knapp-Sidik-Jonkman approach and its modification for random-effects meta-analysis with few studies. BMC Medical Research Methodology. 2015;15:99. https://doi.org/10.1186/s12874-015-0091-1

[21] Viechtbauer W. Bias and efficiency of meta-analytic variance estimators in the random-effects model. Journal of Educational and Behavioral Statistics. 2005;30(3):261-293. https://doi.org/10.3102/10769986030003261

[22] Higgins JPT, Thompson SG, Spiegelhalter DJ. A re-evaluation of random-effects meta-analysis. Journal of the Royal Statistical Society: Series A. 2009;172(1):137-159. https://doi.org/10.1111/j.1467-985X.2008.00552.x

[23] Riley RD, Higgins JPT, Deeks JJ. Interpretation of random effects meta-analyses. BMJ. 2011;342:d549. https://doi.org/10.1136/bmj.d549

[24] Egger M, Davey Smith G, Schneider M, Minder C. Bias in meta-analysis detected by a simple, graphical test. BMJ. 1997;315(7109):629-634. https://doi.org/10.1136/bmj.315.7109.629

[25] Peters JL, Sutton AJ, Jones DR, Abrams KR, Rushton L. Comparison of two methods to detect publication bias in meta-analysis. JAMA. 2006;295(6):676-680. https://doi.org/10.1001/jama.295.6.676

[26] Sterne JAC, Sutton AJ, Ioannidis JPA, Terrin N, Jones DR, Lau J, et al. Recommendations for examining and interpreting funnel plot asymmetry in meta-analyses of randomised controlled trials. BMJ. 2011;343:d4002. https://doi.org/10.1136/bmj.d4002

[27] Duval S, Tweedie R. Trim and fill: A simple funnel-plot-based method of testing and adjusting for publication bias in meta-analysis. Biometrics. 2000;56(2):455-463. https://doi.org/10.1111/j.0006-341X.2000.00455.x

[28] Walsh M, Srinathan SK, McAuley DF, Mrkobrada M, Levine O, Ribic C, et al. The statistical significance of randomized controlled trial results is frequently fragile: a case for a Fragility Index. Journal of Clinical Epidemiology. 2014;67(6):622-628. https://doi.org/10.1016/j.jclinepi.2013.10.019

[29] Guyatt GH, Oxman AD, Vist GE, Kunz R, Falck-Ytter Y, Alonso-Coello P, et al. GRADE: an emerging consensus on rating quality of evidence and strength of recommendations. BMJ. 2008;336(7650):924-926. https://doi.org/10.1136/bmj.39489.470347.AD

[30] Mathur MB, VanderWeele TJ. Sensitivity analysis for publication bias in meta-analyses. Journal of the Royal Statistical Society: Series C. 2020;69(5):1091-1119. https://doi.org/10.1111/rssc.12440

[31] Langan D, Higgins JPT, Jackson D, Bowden J, Veroniki AA, Kontopantelis E, et al. A comparison of heterogeneity variance estimators in simulated random-effects meta-analyses. Research Synthesis Methods. 2019;10(1):83-98. https://doi.org/10.1002/jrsm.1316

[32] Bucher HC, Guyatt GH, Griffith LE, Walter SD. The results of direct and indirect treatment comparisons in meta-analysis of randomized controlled trials. Journal of Clinical Epidemiology. 1997;50(6):683-691. https://doi.org/10.1016/S0895-4356(97)00049-8

[33] Elliott JH, Synnot A, Turner T, Simmonds M, Akl EA, McDonald S, et al. Living systematic review: 1. Introduction — the why, what, when, and how. Journal of Clinical Epidemiology. 2017;91:23-30. https://doi.org/10.1016/j.jclinepi.2017.08.010

[34] Simmonds M, Salanti G, McKenzie J, Elliott J, Herber M, Reeves B, et al. Living systematic reviews: 3. Statistical methods for updating meta-analyses. Journal of Clinical Epidemiology. 2017;91:38-46. https://doi.org/10.1016/j.jclinepi.2017.08.008

[35] Wetterslev J, Thorlund K, Brok J, Gluud C. Trial sequential analysis may establish when firm evidence is reached in cumulative meta-analysis. Journal of Clinical Epidemiology. 2008;61(1):64-75. https://doi.org/10.1016/j.jclinepi.2007.03.013

[36] Mantel N, Haenszel W. Statistical aspects of the analysis of data from retrospective studies of disease. Journal of the National Cancer Institute. 1959;22(4):719-748. https://doi.org/10.1093/jnci/22.4.719

[37] Yusuf S, Peto R, Lewis J, Collins R, Sleight P. Beta blockade during and after myocardial infarction: an overview of the randomized trials. Progress in Cardiovascular Diseases. 1985;27(5):335-371. https://doi.org/10.1016/S0033-0620(85)80003-7

[38] Stanley TD, Doucouliagos H. Meta-regression approximations to reduce publication selection bias. Research Synthesis Methods. 2014;5(1):60-78. https://doi.org/10.1002/jrsm.1095

[39] Copas JB, Shi JQ. A sensitivity analysis for publication bias in systematic reviews. Statistical Methods in Medical Research. 2001;10(4):251-265. https://doi.org/10.1177/096228020101000402

[40] Bartos F, Schimmack U. Z-Curve 2.0: Estimating replication rates and discovery rates. Meta-Psychology. 2022;6:MP.2021.2720. https://doi.org/10.15626/MP.2021.2720

[41] Maier M, Bartos F, Wagenmakers EJ. Robust Bayesian meta-analysis: Addressing publication bias with model-averaging. Psychological Methods. 2023;28(1):107-122. https://doi.org/10.1037/met0000405

[42] Viechtbauer W, Cheung MWL. Outlier and influence diagnostics for meta-analysis. Research Synthesis Methods. 2010;1(2):112-125. https://doi.org/10.1002/jrsm.11

[43] Trinquart L, Chatellier G, Ravaud P. Adjustment for reporting biases in a pool of randomized controlled trials. BMC Medical Research Methodology. 2012;12:150. https://doi.org/10.1186/1471-2288-12-150

[44] Van den Noortgate W, Lopez-Lopez JA, Marin-Martinez F, Sanchez-Meca J. Three-level meta-analysis of dependent effect sizes. Behavior Research Methods. 2013;45(2):576-594. https://doi.org/10.3758/s13428-012-0261-6

[45] Page ES. Continuous inspection schemes. Biometrika. 1954;41(1-2):100-115. https://doi.org/10.1093/biomet/41.1-2.100

[46] O'Brien PC, Fleming TR. A multiple testing procedure for clinical trials. Biometrics. 1979;35(3):549-556. https://doi.org/10.2307/2530245

[47] Pocock SJ. Group sequential methods in the design and analysis of clinical trials. Biometrika. 1977;64(2):191-199. https://doi.org/10.1093/biomet/64.2.191

[48] Lan KKG, DeMets DL. Discrete sequential boundaries for clinical trials. Biometrika. 1983;70(3):659-663. https://doi.org/10.1093/biomet/70.3.659

[49] Reitsma JB, Glas AS, Rutjes AW, Scholten RJ, Bossuyt PM, Zwinderman AH. Bivariate analysis of sensitivity and specificity produces informative summary measures in diagnostic reviews. Journal of Clinical Epidemiology. 2005;58(10):982-990. https://doi.org/10.1016/j.jclinepi.2005.02.022

[50] Rutter CM, Gatsonis CA. A hierarchical regression approach to meta-analysis of diagnostic test accuracy evaluations. Statistics in Medicine. 2001;20(19):2865-2884. https://doi.org/10.1002/sim.942

## Supporting information

**S1 Table.** Heterogeneity statistics by study count stratum. Mean I-squared, proportion with I-squared > 50% and > 75%, and mean absolute precision difference for each of five k-strata.

**S2 Table.** Leave-one-out sensitivity analysis summary. Direction change rate, significance change rate, and effect range statistics for 245 reviews with k >= 3.

**S3 Table.** Complete per-review validation results. Oracle sealed values, MetaSprint extracted values, absolute differences, and pass/fail status for all 291 reviews.

**S1 Fig.** Bland-Altman plot of DL vs REML pooled log-effect estimates for binary outcomes (n = 202).

**S2 Fig.** Distribution of I-squared values across 291 reviews, stratified by data type.

**S3 Fig.** Screenshot of MetaSprint Autopilot showing the 13-tab workflow interface with forest plot, funnel plot, and living meta-analysis CUSUM chart outputs.

**S4 Fig.** Sequential monitoring dashboard showing CUSUM control chart, information fraction progress bar, and three-tier stopping recommendation.
