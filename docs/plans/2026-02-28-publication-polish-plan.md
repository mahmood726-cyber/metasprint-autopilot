# Publication Polish Plan — MetaSprint Autopilot v2.1

**Date**: 2026-02-28
**Approach**: A — Publication Polish (maximize peer-review robustness)
**Current state**: 24,363 lines, 473 functions, 77/77 E2E tests, 22 features, 12/12 expert adoption

## Phase 1: Structural Integrity (Critical)

### 1.1 Fix div imbalance
- Audit flagged +4 extra closing `</div>` tags
- Scan with regex: count `<div[\s>]` vs `</div>` excluding JS strings
- Fix any mismatches

### 1.2 Event listener cleanup
- Audit flagged 43 addEventListener vs 8 removeEventListener (5.4:1 ratio)
- Modal close paths must remove keydown/keyup listeners
- Dialog dismiss must clean up escape handlers
- Add cleanup to all modal/overlay dismiss functions

### 1.3 CSS dead code removal
- Remove unused CSS rules (estimate ~200 lines of dead CSS)
- Consolidate duplicate color definitions into CSS variables

## Phase 2: Test Coverage Expansion (+18 tests → 95 total)

### 2.1 Write tab tests (4 new)
- Paper generation produces valid markdown
- PICO fields populate into generated text
- Pre-submission checklist renders all 9 items
- Export markdown downloads valid file

### 2.2 Screen tab tests (3 new)
- Import references populates screening table
- Include/exclude toggles update counts
- Screening summary shows correct PRISMA numbers

### 2.3 Discover tab tests (3 new)
- CT.gov search returns results for known condition
- PubMed search returns results
- Import from search adds to screening

### 2.4 Dashboard & Insights tests (2 new)
- Dashboard shows correct study count after data entry
- Insights tabs render without errors

### 2.5 Error condition tests (4 new)
- Empty study set shows guidance (not crash)
- Mixed effect types shows actionable error
- Invalid CI (lower > upper) shows warning
- Single study (k=1) runs without crash, shows appropriate warnings

### 2.6 Capsule interactivity tests (2 new)
- Capsule patient mode toggle works
- Capsule sensitivity toggles re-render

## Phase 3: Accessibility (A11y) Improvements

### 3.1 SVG plot accessibility
- Add `role="img"` and `aria-label` to forest plot SVG
- Add `aria-label` to funnel plot SVG with descriptive summary
- Add `<title>` element inside each SVG

### 3.2 Keyboard navigation
- Forest plot: arrow keys navigate studies, Enter shows tooltip
- Tab panels: arrow keys between tabs (already partially done)
- Modal focus trap: Tab cycles within open modal

### 3.3 Screen reader improvements
- Add `aria-live="polite"` to analysis results container
- Add `role="status"` to toast notifications
- Ensure all form inputs have associated labels

## Phase 4: Performance Optimization

### 4.1 Lazy tab initialization
- Insights tab: defer chart rendering until tab is first opened
- Checkpoints tab: load only when navigated to
- Al-Burhan universe: defer 3D rendering

### 4.2 CSS optimization
- Extract critical CSS (above-fold) inline, defer rest
- Consolidate repeated color values into CSS custom properties
- Remove unused animation keyframes

### 4.3 Large dataset handling
- Warn at k>100 studies about computation time
- Use requestAnimationFrame for progressive SVG rendering
- Debounce rapid slider changes (NNT baseline risk)

## Phase 5: Mobile Responsiveness

### 5.1 Breakpoint system
- Add 500px-768px responsive breakpoints
- Tab bar: horizontal scroll with visible scroll indicator (already added)
- Extract table: horizontal scroll wrapper with shadow hints
- Forest plot: scale SVG to viewport width

### 5.2 Touch targets
- Minimum 44x44px touch targets for all interactive elements
- Increase slider thumb size on touch devices
- Add touch gesture support for forest/funnel plot zoom

## Phase 6: Statistical Enhancements (Targeted)

### 6.1 Meta-regression (single covariate)
- Add optional covariate column to extract table
- Implement weighted least squares meta-regression
- Display bubble plot (effect vs covariate, sized by precision)
- Report slope, intercept, R², p-value

### 6.2 Bayesian credible interval (optional toggle)
- Normal-normal conjugate model (computationally simple)
- Prior: vague N(0, 10²) for mu, half-Cauchy(0, 0.5) for tau
- Report posterior median, 95% CrI alongside frequentist CI
- Toggle: "Show Bayesian CrI" checkbox in Analyze tab

### 6.3 R/Python code export
- "Export R Code" button generates reproducible metafor script
- "Export Python Code" button generates statsmodels/PythonMeta script
- Include data, model specification, and forest plot code
- Round-trip verified: output matches app results within 1e-6

## Out of Scope (deferred to v3.0)
- Full network meta-analysis (complex, needs separate design)
- IPD meta-analysis (different data model entirely)
- Bayesian model averaging (computationally heavy)
- PROSPERO auto-population (API access uncertain)
- Multi-language capsules beyond current 4 (EN/AR/ES/FR)

## Success Criteria
- 95+ E2E tests, all passing
- Zero div imbalance
- WCAG AA compliance for all interactive elements
- Mobile usable at 375px width (iPhone SE)
- Meta-regression validated against metafor within 1e-6
- R/Python export produces identical results to app

## Estimated Scope
- Phase 1: ~50 edits (structural fixes)
- Phase 2: ~300 lines new test code
- Phase 3: ~100 edits (a11y attributes)
- Phase 4: ~80 edits (performance)
- Phase 5: ~150 lines CSS additions
- Phase 6: ~800 lines new JS (meta-regression, Bayesian, code export)
