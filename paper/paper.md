---
title: 'MetaSprint Autopilot: A Browser-Based Meta-Analysis Engine with Living Evidence Capabilities'
tags:
  - meta-analysis
  - systematic review
  - evidence synthesis
  - JavaScript
  - browser-based
authors:
  - name: Mahmood Ahmad
    orcid: 0009-0003-7781-4478
    affiliation: 1
affiliations:
  - name: Royal Free Hospital, London, United Kingdom
    index: 1
date: 28 February 2026
bibliography: paper.bib
---

# Summary

MetaSprint Autopilot is a zero-install, browser-based meta-analysis engine that performs
pairwise, diagnostic test accuracy (DTA), network (NMA), and dose-response meta-analysis
entirely client-side. It requires no server, no software installation, and no account
creation. All computations run in the user's browser via JavaScript, ensuring data never
leaves the local machine. The application supports living evidence synthesis through
integration with ClinicalTrials.gov and PubMed APIs, automatic study classification, and
longitudinal tracking of evidence accumulation.

# Statement of Need

Systematic reviews and meta-analyses are the foundation of evidence-based medicine, yet
existing tools impose significant barriers. Commercial software (Comprehensive Meta-Analysis,
RevMan) requires licenses costing hundreds of dollars. Open-source alternatives (R packages
such as `metafor`, `mada`, `netmeta`, `dosresmeta`) demand programming expertise. Web-based
tools typically require server infrastructure and data upload to external servers, raising
data governance concerns.

MetaSprint Autopilot addresses these gaps by providing:

1. **Zero barriers to entry**: A single HTML file that runs in any modern browser
2. **Comprehensive methodology**: DerSimonian-Laird, REML, HKSJ/mKH, Hartung-Knapp, and
   profile likelihood methods for pairwise meta-analysis; bivariate GLMM for DTA;
   frequentist NMA with P-score ranking; and two-stage dose-response with restricted
   cubic splines
3. **Living evidence**: Automated ClinicalTrials.gov search, Cochrane-trained study
   classifier (95.4% accuracy), and temporal evidence tracking
4. **Publication-ready outputs**: Forest plots, funnel plots, SROC curves, network graphs,
   GRADE assessments, PRISMA 2020 flow diagrams, and Evidence Capsule summaries
5. **Data sovereignty**: All data remains on the user's device; no server communication
   except optional PubMed/ClinicalTrials.gov API queries

# Key Features

## Pairwise Meta-Analysis
- Random-effects models: DerSimonian-Laird, REML, HKSJ, modified Knapp-Hartung
- Fixed-effect models: Mantel-Haenszel, Peto, inverse variance
- Heterogeneity: tau-squared, I-squared with confidence intervals, prediction intervals
- Publication bias: Egger's test, Peters' test, PET-PEESE, trim-and-fill, p-curve
- Sensitivity: leave-one-out, cumulative meta-analysis, influence diagnostics (Cook's D)
- Effect size calculators: HR, OR, RR, RD, MD, SMD (Hedges' g, Cohen's d, Glass's delta)
- Trial Sequential Analysis with O'Brien-Fleming and harm boundaries
- GRADE certainty assessment with evidence profile export

## Diagnostic Test Accuracy
- Bivariate GLMM (Reitsma 2005) with REML estimation
- SROC curve with confidence and prediction regions
- Summary sensitivity, specificity, positive/negative likelihood ratios, diagnostic odds ratio
- Fagan nomogram for post-test probability visualization
- QUADAS-2 quality assessment
- Deeks' funnel plot for DTA publication bias

## Network Meta-Analysis
- Frequentist NMA (Rucker 2012) with graph-theoretic design matrix
- League table of all pairwise comparisons
- P-score ranking (Rucker & Schwarzer 2015)
- Node-splitting for direct vs. indirect evidence inconsistency
- Interactive network graph visualization

## Dose-Response Meta-Analysis
- Two-stage Greenland-Longnecker (1992) approach
- Linear and restricted cubic spline (RCS) models
- Non-linearity Wald test
- Dose-response curve with 95% CI band

## Risk of Bias
- RoB 2.0 for randomized trials
- ROBINS-I for non-randomized studies
- Traffic light and summary bar chart visualizations

## Living Evidence
- ClinicalTrials.gov API integration for trial discovery
- PubMed search for published evidence
- 3-layer hybrid classifier (keyword + drug-class + neural) with 95.4% accuracy
- Al-Burhan Living Meta-Analysis engine for automated evidence updates

# Comparison with Existing Tools

| Feature | MetaSprint | RevMan | CMA | metafor (R) |
|---------|-----------|--------|-----|-------------|
| Installation | None | Desktop app | Desktop app | R + packages |
| Cost | Free | Free (Cochrane) | $195-$1,295 | Free |
| DTA meta-analysis | Yes | Limited | No | Via mada |
| Network meta-analysis | Yes | No | No | Via netmeta |
| Dose-response | Yes | No | No | Via dosresmeta |
| Living evidence | Yes | No | No | No |
| Client-side only | Yes | No | Yes | N/A |
| GRADE assessment | Yes | Yes | No | No |
| PRISMA 2020 flow | Yes | Yes | No | No |

# Validation

All statistical engines are cross-validated against R reference implementations:

- Pairwise: `metafor::rma()` for DL, REML, HKSJ — tolerance $< 10^{-4}$
- SMD: `metafor::escalc(measure="SMD")` for Hedges' g — tolerance $< 10^{-4}$
- DTA: `mada::reitsma()` for pooled sensitivity/specificity — tolerance $< 0.05$
- NMA: `netmeta::netmeta()` for league table values — tolerance $< 0.05$
- Dose-response: `dosresmeta::dosresmeta()` for pooled coefficients

The application includes 222+ end-to-end tests and 13 R cross-validation tests.

# Acknowledgements

We acknowledge the developers of `metafor` [@Viechtbauer2010], `mada` [@Doebler2015],
`netmeta` [@Rucker2020], and `dosresmeta` [@Crippa2016] for providing the R reference
implementations used in our validation suite.

# References
