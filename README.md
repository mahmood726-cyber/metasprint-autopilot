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
