# Design: Living MA + Full-Spectrum Enhancement (2026-03-03)

## Scope

Four workstreams executed in phased pipeline order:

1. **Phase 1 — Living MA Features** (Insights tab enhancement)
2. **Phase 2 — Test Coverage Expansion** (Playwright E2E for all gaps)
3. **Phase 3 — Full-Spectrum Multi-Persona Review** (5 personas)
4. **Phase 4 — Manuscript Major Rewrite** (PLOS ONE submission)

## Phase 1: Living MA Features

### Existing (already in codebase)
- Al-Burhan auto-clustering + temporal velocity
- Insights tab with temporal trajectories
- Evidence accumulation visualization
- Multi-temporal conflict detection
- FURQAN badges + drill-down

### New Features to Add

1. **CUSUM monitoring** — Cumulative Sum control chart for detecting shifts in pooled effect over time. Plot CUSUM statistic against study index, with configurable threshold (default: 4 SE units). Visual alert when crossed.

2. **Alpha spending functions** — O'Brien-Fleming, Pocock, and Lan-DeMets (O'Brien-Fleming-type) boundaries for sequential monitoring of accumulating evidence. Plot spending boundaries on the TSA-style information fraction chart.

3. **Information fraction tracking** — Running fraction of Required Information Size (RIS). RIS = (z_alpha + z_beta)^2 / (delta^2 * sum(1/vi)). Display as progress bar + percentage.

4. **Alert thresholds** — Configurable triggers:
   - CUSUM crosses threshold → "Effect shift detected"
   - Information fraction reaches interim boundary → "Interim analysis boundary reached"
   - Prediction interval shifts direction → "Direction change warning"
   - Display as toast notifications + persistent badge on Insights tab

5. **Auto-update scheduler** — UI control for check interval (daily/weekly/monthly/manual). "Last updated" badge. "Stale evidence" warning after interval expires. Uses existing Al-Burhan harvest pipeline.

6. **Sequential stopping dashboard** — Visual panel showing:
   - O'Brien-Fleming / Pocock boundaries overlaid on cumulative z-statistic
   - Current trajectory with confidence band
   - Clear "Continue / Stop for efficacy / Stop for futility" recommendation
   - Information fraction progress bar

### Implementation Location
- All features go in the Insights tab (`phase-insights` section)
- CUSUM + alpha spending functions added to the statistical engine section
- Dashboard UI in the Insights rendering code

## Phase 2: Test Coverage Expansion

### Gap 1: 8 Ported Methods (DDMA, RoBMA, Z-Curve, Copas, 3-Level MA, Cook's D, MH, Peto)
- Verify each method produces output containers
- Check numerical results where possible (MH/Peto against known values)
- Edge cases: k=1, k=2, zero events

### Gap 2: DTA + NMA E2E
- DTA: bivariate GLMM convergence, HSROC curve rendering, QUADAS-2 assessment, Fagan nomogram
- NMA: Bucher indirect computation, P-score ranking, league table, rankogram, consistency check

### Gap 3: Import/Export Round-Trip
- RevMan XML import → analysis → re-export → compare
- RIS/BibTeX/NBIB/CSV parsing edge cases (unicode, missing fields)
- PNG 300dpi export verification (canvas dimensions)

### Gap 4: Living MA Features (from Phase 1)
- CUSUM chart rendering + threshold crossing
- Alpha spending boundary computation
- Information fraction calculation
- Alert trigger logic
- Sequential stopping recommendation

## Phase 3: Full-Spectrum Multi-Persona Review

### 5 Personas (run sequentially, max 2 concurrent)

1. **Cardiologist** — Clinical appropriateness of SGLT2i defaults, GRADE logic, NNT interpretation, ESC/AHA guideline alignment
2. **Biostatistician** — Mathematical correctness of all 40+ methods, edge cases, numerical stability, formula verification
3. **Security Auditor** — XSS vectors, localStorage poisoning, malicious CSV/RIS injection, eval/innerHTML patterns, data leakage
4. **Cochrane Editor** — Methodological standards compliance (Handbook v6.5), PRISMA 2020, reporting completeness, bias tool alignment
5. **UX/Accessibility Specialist** — WCAG 2.1 AA compliance, keyboard navigation, screen reader support, mobile responsiveness, dark mode

### Severity Classification
- P0: Correctness/security bug (must fix)
- P1: Robustness/standards gap (should fix)
- P2: Polish/enhancement (nice to fix)

## Phase 4: Manuscript Major Rewrite

### Key Updates Needed
- Test count: 694 → actual count after Phase 2
- Feature inventory: expand Methods section to cover all 40+ statistical methods
- Living MA: new section on CUSUM, sequential monitoring, auto-update
- Specialized modules: expand DTA, NMA, dose-response descriptions
- Import/export: document all 6 input + 7 output formats
- i18n: mention 5-language support
- Validation: update with any new benchmark results
- Results tables: refresh all numbers

### Structure
Keep PLOS ONE formatting. Major rewrite of Methods and Results. Light touch on Introduction and Discussion.
