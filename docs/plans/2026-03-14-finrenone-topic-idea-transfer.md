# Finrenone Topic And Idea Transfer

Source workspace: `C:\Users\user\Downloads\Finrenone`

Primary source files reviewed:
- `README.md`
- `LIVINGMETA_PLAN.md`
- `MANUSCRIPT_LIVINGMETA.md`
- `FINERENONE_REVIEW.html`
- `LivingMeta.html`
- `docs/plans/2026-03-09-methodological-enhancements.md`
- `docs/superpowers/plans/2026-03-10-glp1-cvot-analytics-upgrade.md`
- `docs/superpowers/plans/2026-03-11-glp1-cvot-phase3.md`
- `docs/superpowers/plans/2026-03-12-finerenone-v12-implementation.md`
- `docs/superpowers/specs/2026-03-10-glp1-cvot-analytics-upgrade-design.md`
- `docs/superpowers/specs/2026-03-10-glp1-cvot-phase3-design.md`
- `docs/superpowers/specs/2026-03-12-finerenone-v12-robustness-provenance-submission-design.md`

## Topic Inventory

Clinical topic/review apps found in the Finrenone workspace:
- Finerenone
- Colchicine for cardiovascular disease
- GLP-1 receptor agonist CVOTs
- SGLT2 inhibitors in heart failure
- Bempedoic acid
- PCSK9 inhibitors
- Intensive blood pressure control
- Incretins in HFpEF
- ATTR-CM
- Lipid hub / lipid-lowering review space
- LivingMeta as a multi-topic umbrella engine

Cross-cutting thematic areas already explored there:
- Cardiovascular outcomes
- Renal outcomes
- Heart failure outcomes
- Metabolic therapeutics
- Lipid-lowering therapeutics
- Rare disease therapeutics
- Living systematic reviews
- Submission-grade evidence synthesis
- Registry-publication concordance

## Product Ideas To Carry Over

### 1. Topic Architecture
- Config-library pattern for many disease/topic review apps inside one engine.
- Pre-configured flagship topics with locked baseline trial datasets.
- Living review framing: continuous update frequency with formal snapshots at major trial publications.
- Single-file browser-native distribution with no server dependency.

### 2. Workflow And Governance
- Full protocol surface inside the app: registration, PICO, eligibility, sources, extraction, RoB, synthesis, bias, certainty.
- Reviewer identity, reviewer lock, and review handoff/export pack.
- Two-reviewer adjudication workflow with rationale note and second-review confirmation.
- Bulk screening and conflict-resolution flows with explicit auditability.
- AMSTAR / PRISMA mapping embedded in the workflow.

### 3. Discovery And Surveillance
- Multi-source search across ClinicalTrials.gov, Europe PMC / PubMed, and OpenAlex.
- CT.gov-first registry discovery plus bibliographic backfill.
- Future-RCT candidate detection for trials that match the review criteria but are not yet part of the locked synthesis set.
- Ghost protocol detection: completed or published studies without structured CT.gov results.
- CT.gov evidence-delta dashboard: registry results posted, SAP availability, publication lag, outcome match, flags.
- Living update scan that re-checks registered trials and surfaces new result postings or status changes.

### 4. Extraction And Provenance
- Structured extraction cards with trial identifier, outcome, timepoint, analysis population, effect sizes, raw 2x2 counts, and notes.
- Per-number provenance layer so every extracted number points back to a source snippet.
- Evidence panels with verbatim CT.gov / PubMed / OpenAlex source text.
- Source-verification shortcuts on screening and extraction cards.
- Endpoint auto-resolution with hierarchical matching and equivalence bridge tables.
- Confidence-tiered text extraction with plausibility checks and automation tiers.
- Audit trail for auto-resolution and extraction decisions.

### 5. Core Analysis Ideas
- Dual-track synthesis where published HRs are preferred but RR/OR pooling remains available from 2x2 data.
- Multiple tau-squared estimators: DL, REML, PM, HS, HE, EB.
- HKSJ support and method-sensitivity comparisons.
- Mantel-Haenszel and Peto fixed-effect options.
- Prediction intervals in both stats cards and narrative text.
- Cumulative meta-analysis.
- Meta-regression with richer moderator support.
- Subgroup expansion and RoB sensitivity subsets.

### 6. Advanced Analysis Ideas
- Network meta-analysis and league tables.
- Unified treatment-ranking dashboard.
- Ranking heatmaps and radial SUCRA-style visualizations.
- Component NMA.
- Riley multivariate meta-analysis.
- Dose-response analysis.
- Time-to-benefit analysis.
- Trial sequential analysis with O'Brien-Fleming boundaries, futility logic, and required information size.
- Bayesian posterior density and prior-sensitivity panels.
- Fragility index and fragility quotient dashboards.
- Decision robustness panels: multiverse specification curve, threshold analysis, conformal prediction intervals, credibility ceilings.

### 7. Bias And Robustness Arsenal
- Egger and Begg tests.
- Trim-and-fill.
- PET-PEESE.
- Copas-style selection sensitivity.
- Mathur-VanderWeele sensitivity.
- WAAP-WLS.
- Vevea-Hedges style selection models.
- Z-curve.
- Influence diagnostics: Cook's distance, DFBETAS, Baujat, GOSH, forward search.
- Evidence-gap matrix.

### 8. Clinical And Patient-Facing Ideas
- Patient mode toggle alongside expert mode.
- Traffic-light summary for benefit / uncertainty / harm.
- NNT curve across baseline risk.
- Plain-language patient summary for shared decision-making.
- Time-to-benefit timelines to translate pooled effects into clinical timing.

### 9. Certainty, Verdict, And Submission
- GRADE automation with explicit downgrade logic for all five domains.
- TruthCert hierarchical verdict / certification layer.
- Reproducibility capsule ZIP with data, methods, code, and hashes.
- PRISMA 2020 flow diagram generation.
- Publication-quality forest plot export.
- GRADE evidence profile tables and SoF-style outputs.
- Editorial pack and manuscript-generation support.
- In-browser or companion R cross-validation against `metafor`.

### 10. UX And Internationalization
- Arabic translation layer for new panels and analytical outputs.
- Light/dark mode support.
- Panelized analysis dashboard with numbered charts / sections.
- Strong empty-state handling and expert-vs-standard tier labelling.

## Notable Specific Concepts

From `README.md` and the Finerenone review implementation:
- Validated against multiple published meta-analyses, not just against internal goldens.
- Dual representation of outcomes using OR, RR, and HR where applicable.
- Built-in comparison against landmark phase II/III trials.

From `LIVINGMETA_PLAN.md`:
- Three-phase living pipeline: discover -> extract -> synthesize.
- Single-file HTML architecture with section banners and config-driven topic switching.
- Locked verified baseline data plus newly discovered studies merged at analysis time.

From `MANUSCRIPT_LIVINGMETA.md`:
- WebR / browser-native R validation concept.
- 15+ advanced analyses positioned as a differentiator.
- Nine pre-configured clinical topics used both as demos and as validation fixtures.
- Multi-persona QA framing for statistical, security, UX, engineering, and domain review.

From the GLP-1 design/plan files:
- Multi-outcome NMA.
- Unified ranking dashboard.
- Per-adverse-event safety forests.
- TruthCert verdict panel integrated with analytical depth upgrades.
- Frontier visualization set: galaxy plot, kilim plot, radial SUCRA, e-value profile.

From the Finerenone v12 design/plan files:
- Sensitivity-analysis panel.
- Sequential/TSA monitoring overlays.
- Influence diagnostics panel family.
- Per-number provenance plus verification progress bar.
- Submission artifact automation as a first-class feature, not an afterthought.

## Suggested Follow-On Ports

If these ideas are going to be applied inside `metasprint-autopilot`, the highest-value ports look like:
- CT.gov evidence delta and ghost-protocol tracking.
- Per-number provenance and verification progress in extraction.
- Sensitivity / influence diagnostics bundle.
- Reproducibility capsule and editorial-pack export.
- Patient-mode traffic-light summary plus NNT curve.
- Living-update watcher for already-linked NCT trials.
