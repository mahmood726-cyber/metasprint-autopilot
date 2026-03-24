# RapidMeta Review Mode Integration — Design Document

**Date**: 2026-03-07
**Status**: Approved
**Approach**: Dual Shell (two tab bars, one HTML, shared IndexedDB)

## Summary

Integrate the full Finrenone RapidMeta 6-step systematic review workflow into MetaSprint Autopilot as the **default mode**, while keeping the existing Autopilot Sprint functionality available as an alternative. Users choose at startup via a modal; the choice is persisted in localStorage.

## Startup Modal

- **First visit** (no `msa_mode` in localStorage): centered modal with two cards
  - Left card (default/highlighted): **RapidMeta Review** — 6-step systematic review with dual-reviewer screening, evidence tracing, GRADE, 16 charts, patient mode
  - Right card: **Autopilot Sprint** — 40-day guided sprint with discovery, NMA, DTA, dose-response, ICER/QALY, Al-Burhan, CUSUM
  - Checkbox: "Remember my choice" (saves to `msa_mode_remember`)
- **Return visits with remembered choice**: modal skipped, goes straight to saved mode
- **Header dropdown**: small `<select>` in header actions to switch modes at any time
- **localStorage key**: `msa_mode` = `'rapidmeta'` | `'autopilot'`

## Mode Architecture

### HTML Structure

Two separate tab bars and phase containers in the same HTML file:

```
<nav id="rm-tabbar" class="tab-bar" style="display:none"> ... 6 RapidMeta tabs ... </nav>
<nav id="ap-tabbar" class="tab-bar"> ... existing 13 Autopilot tabs ... </nav>

<main>
  <!-- RapidMeta phases -->
  <section id="rm-protocol" class="rm-phase"> ... </section>
  <section id="rm-search" class="rm-phase"> ... </section>
  <section id="rm-screen" class="rm-phase"> ... </section>
  <section id="rm-extract" class="rm-phase"> ... </section>
  <section id="rm-analysis" class="rm-phase"> ... </section>
  <section id="rm-output" class="rm-phase"> ... </section>

  <!-- Existing Autopilot phases (unchanged) -->
  <section id="phase-dashboard" class="phase"> ... </section>
  ... existing sections ...
</main>
```

### Mode Switching (`setMode`)

```
setMode(mode):
  1. localStorage.setItem('msa_mode', mode)
  2. Hide all: rm-tabbar, ap-tabbar, rm-phase sections, phase sections
  3. If mode === 'rapidmeta':
       show rm-tabbar, switchRMPhase('rm-protocol')
  4. If mode === 'autopilot':
       show ap-tabbar, switchPhase('dashboard')
  5. Update header mode dropdown value
```

### Data Layer

Both modes share the **same IndexedDB** (`MetaSprintAutopilot`, version 5+):
- `references` store: trial/study records (screening, inclusion decisions)
- `studies` store: extracted data (effect sizes, demographics, RoB)
- `searches` store: search history
- `projects` store: project metadata

No data duplication. A study screened in RapidMeta appears in Autopilot's Screen tab.

### Stat Engine Reuse

RapidMeta's Analysis Suite calls existing Autopilot functions directly:
- `dlMeta()`, `remlMeta()`, `hksjAdjust()` (pooling)
- `trimFill()`, `eggerTest()` (publication bias)
- `bayesGrid()` (Bayesian posterior)
- `tQuantile()`, `normalQuantile()`, `chi2Quantile()` (distributions)
- Plotly chart rendering patterns (existing)

## RapidMeta Tabs — Feature Specification

### Tab 1: Protocol (`rm-protocol`)
- PICO framework form (Population, Intervention, Comparator, Outcomes)
- Eligibility criteria table (editable rows)
- Search strategy documentation (3 sources)
- Statistical analysis plan section
- PRISMA 2020 compliance checklist
- AMSTAR 2 critical domains mapping
- Audit trail of amendments (timestamped log)
- **Data source**: reads/writes PICO from project metadata in IDB

### Tab 2: Search (`rm-search`)
- Multi-source API queries: ClinicalTrials.gov, PubMed/Europe PMC, OpenAlex
- Real-time progress bar during search
- 3-stage deduplication: NCT-ID exact -> PubMed cross-ref -> fuzzy title
- Database coverage badges (searched / not searched)
- Search history log with timestamps
- **Reuses**: existing `searchCTgov()`, `searchEuropePMC()`, `searchOpenAlex()`, dedup functions

### Tab 3: Screening (`rm-screen`)
- **Dual-reviewer workflow**:
  - Reviewer 1: Propose Include (I) / Propose Exclude (E)
  - Reviewer 2: 2nd Confirm (C) — locks decision
  - Bulk "Double Screener (All)" button for single-user sign-off
- Split panel: left = scrollable trial list (450px), right = trial details + form
- Filter views: Show All / Show Included / Show Excluded
- Auto-screening classifier (keyword + publication type scoring 0-100)
- Keyboard shortcuts: I/E/C/N/P
- Metrics bar: #include, #exclude, #search counts
- `screenReview` data model per reference:
  ```
  { decision, reviewer1, reviewer2, confirmed, note, ts1, ts2, sig1, sig2 }
  ```
  - sig1/sig2: short FNV-1a hashes for audit trail

### Tab 4: Extraction (`rm-extract`)
- Study card layout per included trial
- 2x2 data entry form: Events(Tx), N(Tx), Events(Ctrl), N(Ctrl)
- Inline evidence panels with 3 types:
  - **Summary** (blue border): key finding quote
  - **Locator** (gray border, monospace): page/table/figure reference
  - **Meta** (amber border): interpretation or context
- Demographics section: N per arm, age, sex, baseline characteristics
- RoB 2.0: 5 Cochrane domains, click-to-cycle (Low -> Some Concerns -> High)
- Evidence toggle buttons per field
- Manual entry fallback (collapsible form)
- Audit log (timestamped edits)
- **Data source**: reads/writes `studies` IDB store (same as Autopilot)

### Tab 5: Analysis Suite (`rm-analysis`)
- **16 publication-quality charts** in responsive grid:
  1. Forest plot (fixed/random effects)
  2. Subgroup analysis
  3. Cumulative meta-analysis
  4. Z-curve analysis
  5. Leave-one-out sensitivity
  6. L'Abbe plot
  7. Galbraith plot
  8. NNT clinical utility curve
  9. Funnel plot (with contour-enhanced significance regions)
  10. Baujat plot
  11. Bayesian posterior density
  12. Meta-regression
  13. Copas sensitivity curve
  14. Conditional power curve
  15. Egger's regression plot
  16. Risk of Bias summary bar chart
- Primary result cards: OR/RR/HR, 95% CI, I^2, tau^2, Cochran Q
- Secondary metrics: HKSJ CI, prediction interval, fragility index, NNT
- Bayesian extension: posterior CrI, P(effect<1), info fraction
- Prior sensitivity controls (informative / vague / flat)
- Publication bias chips: Egger p, trim-fill, Copas, RIS
- Demographics table: trial-level summary
- R validation panel (cross-check against metafor)
- Download button on each chart (SVG export)
- **Reuses**: all existing stat engine functions + Plotly rendering

### Tab 6: Scientific Output (`rm-output`)
- **Visual abstract card**: white card with blue header, 3-column grid (design/results/conclusion)
- **Annotated forest plot**: publication-quality with trial names, weights, CI bands
- **Summary of Findings table**: GRADE-formatted, per-outcome rows with certainty levels
- **PRISMA 2020 flow diagram**: auto-generated from screening counts
- **Version timeline**: snapshot tracking with delta alerts
- **Data seal**: SHA-256 cryptographic fingerprint of current dataset
- **Export menu**: CSV data, JSON bundle, HTML report, Python script, PRISMA checklist, R code
- **Patient mode toggle**: traffic-light visual (green/amber/red), plain-language "What does this mean for you?"

## Visual Design

- **Matches Autopilot's existing style**: light-first, CSS variables (`--primary`, `--surface`, `--border`, etc.)
- Evidence panels adapted to Autopilot palette:
  - Summary: `border-left: 3px solid var(--primary)`, light blue background
  - Locator: `border-left: 3px solid var(--text-muted)`, monospace font
  - Meta: `border-left: 3px solid var(--warning)`, light amber background
- Screening badges reuse existing `.badge-include`, `.badge-exclude` classes
- Dark mode support via existing `body.dark` class

## Test Strategy

- Existing 412 Playwright + 1,050 Selenium tests remain untouched (Autopilot mode)
- New Playwright tests for RapidMeta mode:
  - Startup modal appears / persists choice
  - Mode switching via header dropdown
  - Each of the 6 tabs renders correctly
  - Dual-reviewer screening workflow (propose, confirm, filter)
  - Evidence panels display correctly
  - Analysis Suite renders 16 charts
  - Export functions work
  - Data persists across mode switches

## Estimated Size

- ~3,000-4,000 lines of new HTML (6 RapidMeta tab sections)
- ~1,500-2,000 lines of new JS (screening engine, evidence panels, output generation, mode switching)
- ~200-300 lines of new CSS (evidence panels, screening layout, mode modal)
- Total: ~5,000-6,500 lines added to the 30,829-line file
