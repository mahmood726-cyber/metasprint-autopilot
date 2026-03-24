# Changelog

All notable changes to MetaSprint Autopilot are documented in this file.

## [1.0.0] - 2026-02-26

### Core Platform
- Single HTML file (12,905 lines) implementing all 7 phases of systematic review
- DerSimonian-Laird random-effects meta-analysis with HKSJ confidence intervals
- REML heterogeneity estimation (Fisher scoring) for sensitivity analysis
- Publication bias diagnostics: Egger's test, Peters' test, funnel plots
- Prediction intervals using t-distribution (df = k-1, Cochrane 2025)
- S-value (surprisal) for statistical significance interpretation
- Leave-one-out sensitivity analysis with influence diagnostics

### Discovery & Living Evidence (Al-Burhan)
- ClinicalTrials.gov universe exploration (4,700+ cardiovascular trials)
- 3-layer hybrid classifier (keywords + drug boost + MiniLM-L6-v2 embeddings, 95.7% accuracy)
- Gap score computation with configurable thresholds
- Network graph visualization with force-directed layout
- FURQAN classification (Confirmed/Updated/Contradicted/Novel/Ghost)
- SHAHID validation against 291 Cochrane reviews (100.0% accuracy)

### Statistical Features
- GRADE certainty of evidence assessment (5 domains, automated scoring)
- Number Needed to Treat (NNT) with interactive baseline risk adjustment
- Raw 2x2 contingency table input (OR/RR/RD with Woolf/log method)
- Subgroup analysis with chi-squared test for interaction (Q_between)
- Meta-regression with bubble plot (year, sample size, precision moderators)
- NMA league table via Bucher indirect comparisons with P-score ranking
- Landscape Analytics: cross-disease drug class heatmap
- Landscape Analytics: temporal effect trajectories with evidence velocity
- Landscape Analytics: evidence maturity index (composite k + N + I² + span scoring)
- Landscape Analytics: population drift detection (early vs late trial comparison, z-test)
- Cumulative meta-analysis (chronological evidence accumulation)
- Duval-Tweedie trim-and-fill for publication bias adjustment (L0 estimator)
- Fragility Index (study-level LOO significance sensitivity)
- Trial Sequential Analysis with O'Brien-Fleming boundaries

### Search & Screening
- 6-source search: PubMed, ClinicalTrials.gov, OpenAlex, Europe PMC, CrossRef, AACT
- BM25 relevance scoring with PICO n-gram similarity
- Dual auto-screener (BM25 + PICO component matcher)
- RIS, BibTeX, NBIB, CSV import parsers
- Deduplication (DOI + fuzzy title matching)
- PRISMA 2020 flow diagram (auto-generated)

### UX & Accessibility
- Dark mode with auto-detection (prefers-color-scheme) and manual toggle
- WAI-ARIA tablist pattern with arrow key navigation
- Skip navigation link, focus-visible indicators
- Prefers-reduced-motion support
- Responsive design: 800px (tablet) and 480px (phone) breakpoints
- 44px touch targets for mobile

### Validation
- 1,050+ automated tests across 13 test suites
- Triple-blinded validation against 291 Cochrane systematic reviews
- R metafor v4.8.0 cross-validation (CCC = 1.0000)
- Master test runner (run_all_tests.py)
