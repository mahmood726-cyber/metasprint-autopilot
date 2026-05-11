# MetaSprint Autopilot

Zero-install, single-file platform for systematic review and meta-analysis.

MetaSprint Autopilot is a browser-first workflow that guides medical students and clinicians through seven phases of evidence synthesis, from topic discovery to manuscript drafting, with a validated DerSimonian-Laird meta-analysis engine built in.

## Key Features

- Zero install: download one HTML file and open it in a modern browser.
- Seven-phase workflow: Discover -> Protocol -> Search -> Screen -> Extract -> Analyze -> Write.
- Six-source search support: PubMed, ClinicalTrials.gov, OpenAlex, Europe PMC, CrossRef, and AACT.
- Built-in random-effects meta-analysis with HKSJ confidence intervals.
- REML sensitivity analysis, publication-bias diagnostics, subgroup analysis, and cumulative meta-analysis.
- GRADE assessment, NNT calculation, meta-regression, and indirect-comparison support.
- PRISMA flow generation and paper drafting from the same interface.
- Offline-capable browser app after initial load.
- Validation suite with 1,050+ automated tests.

## Quick Start

1. Open `metasprint-autopilot.html` in Chrome, Firefox, Edge, or Safari.
2. Follow the seven-phase workflow.
3. Export plots, tables, and manuscript-ready outputs from the app.

No installation, server, or account is required for normal use.

## Validation

Validated against 291 Cochrane systematic reviews using a triple-blinded architecture.

| Metric | Result |
|--------|--------|
| Engine accuracy | 100.0% (291/291) |
| Median pooled effect difference | 1.65 x 10^-7 |
| R metafor v4.8.0 agreement (CCC) | 1.0000 |
| Forest plot rendering | 100.0% |
| Funnel plot rendering | 100.0% |
| CT.gov search discovery | 65.0% |
| PubMed search discovery | 58.0% |
| Classifier accuracy | 95.7% (282 trials) |

See `validation/reports/VALIDATION_REPORT.md` for the full validation record.

## System Requirements

- Modern browser: Chrome 90+, Firefox 90+, Edge 90+, or Safari 15+.
- No server infrastructure for the main application.
- Python 3.10+ and Chrome only if you want to run the validation suite locally.

## Repository Structure

```text
metasprint-autopilot/
|-- metasprint-autopilot.html
|-- README.md
|-- LICENSE
|-- CHANGELOG.md
|-- requirements.txt
|-- pyproject.toml
|-- .gitignore
|-- run_all_tests.py
|-- paper/
|-- validation/
|-- pipeline/
|-- data/
`-- docs/
```

Key validation assets:

- `validation/reports/VALIDATION_REPORT.md`: triple-blinded validation summary.
- `validation/sealed_oracle/`: sealed reference results.
- `validation/blinded_inputs/`: blinded benchmark datasets.
- `validation/extractor_outputs/`: MetaSprint output snapshots.

## Running Tests

```bash
pip install -r requirements.txt
python run_all_tests.py
python run_all_tests.py --quick
python -m pytest validation/ pipeline/ -q
```

Selenium-based suites run in headless Chrome. No external services or API keys are required.

## Test Suite Summary

| Suite | Tests |
|------|------:|
| Edge cases | 227 |
| 12-angle integration | 62 |
| Features | 18 |
| Al-Burhan integration | 6 |
| Pipeline engine | 66 |
| GRADE + NNT | 33 |
| GRADE concordance | 27 |
| 2x2 input | 52 |
| Subgroup analysis | 35 |
| Advanced analysis | 44 |
| UX and accessibility | 51 |
| Meta-regression + NMA | 78 |
| Landscape analytics | 91 |
| Total | 1,050+ |

## Methods

The pooling engine is JavaScript-only and runs in the browser tab. Primary pooling is **DerSimonian–Laird** with **Hartung–Knapp–Sidik–Jonkman (HKSJ)** confidence intervals; **REML**, **Mantel–Haenszel**, and **Peto** pools are exposed as alternative estimators in the same UI. The HKSJ implementation uses `t_{k-1}` quantiles and applies the `max(1, Q/(k-1))` variance floor so that the interval does not narrow below the underlying DerSimonian–Laird interval when Q < k-1.

Heterogeneity is reported as `τ²`, `I²` (with Q-profile interval for small k), and a prediction interval on the `t_{k-1}` × √(τ² + SE²) scale (Cochrane Handbook v6.5, §10.10.4.3). Publication-bias diagnostics include Egger's radial test, trim-and-fill (sensitivity only), and a conditional PET / PEESE.

R cross-validation: `tests/validate_against_R.R` re-runs the same 2×2 / mean-difference inputs through `metafor`, `mada`, `netmeta`, and `dosresmeta`, and reports `(metric, R_value, JS_value, abs_diff, pass/fail)` at a 1e-4 tolerance. The 291-Cochrane validation reported in the table above uses this script.

## Limitations

- **DerSimonian–Laird default at k < 10.** DL underestimates τ² with few studies; the engine exposes REML and Paule–Mandel as alternatives, but does not auto-switch. For analyses with k < 10 the user should pick REML or PM explicitly and treat any DL-only report as a sensitivity case.
- **No Bayesian inference.** No Stan / MCMC path; for hierarchical priors, posterior probabilities of clinically meaningful effects, or rare-event Poisson-Normal models, a Bayesian tool (e.g. `brms`, `metaBMA`) is needed downstream.
- **Search coverage is partial.** CT.gov discovery ≈ 65% and PubMed discovery ≈ 58% on the validation set. A formal systematic review should not rely on the built-in search alone — the seven-phase workflow lets the user paste in external search results, and that path should be used when completeness matters.
- **Single-file scope limits dataset size.** Browser memory bounds and single-HTML packaging mean very large NMA networks (hundreds of treatments, IPD-scale rows) are slower than equivalent R workflows; for those scales, export to R and finish there.
- **Browser-only test harness.** Selenium-based Chrome is required to reproduce the full test suite. Headless-Chrome on locked-down corporate browsers may need flags; CI runs are not currently public-facing.
- **No risk-of-bias auto-import.** RoB-2 and ROBINS-I assessments are typed in by the user; the engine does not parse Cochrane RoB JSON exports.

## Conclusions

Use MetaSprint Autopilot when (a) the analyst needs a one-file workflow that runs offline after first load, (b) the meta-analysis is pairwise or modest NMA scale with classic 2×2 / mean-difference outcomes, and (c) DerSimonian–Laird or REML pooling is appropriate. For Bayesian inference, large IPD networks, or formal systematic-review search completeness, hand off to specialised R / Stan tooling after using MetaSprint for the workflow scaffolding.

## Citation

Use `CITATION.cff` for software citation metadata.

If a tagged GitHub release and Zenodo archive are created, add the minted DOI to both `CITATION.cff` and the repository release notes.

## License

MIT. See `LICENSE`.

## Contributing

1. Fork the repository.
2. Create a feature branch.
3. Run the relevant validation suites for your change.
4. Keep reviewer-facing documentation in sync with the implementation.
5. Open a pull request with a concise summary of the evidence for the change.
