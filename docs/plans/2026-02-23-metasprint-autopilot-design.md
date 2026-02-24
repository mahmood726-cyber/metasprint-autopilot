# MetaSprint Autopilot — Design Document

**Date**: 2026-02-23
**Status**: Approved
**Architecture**: Single HTML file, tab-based wizard, IndexedDB + localStorage

## Overview

End-to-end meta-analysis automation platform for medical students. Single HTML file that guides users from topic discovery through paper generation, with data export compatible with existing MetaSprint Pairwise and NMA apps.

## Workflow (7 Phases)

```
[1. Discover] -> [2. Protocol] -> [3. Search] -> [4. Screen] -> [5. Extract] -> [6. Analyze] -> [7. Write]
```

Each phase is a tab. Users can jump between tabs but the wizard guides linear flow.

## Phase 1: Topic Discovery

**Purpose**: Find medical topics with multiple RCTs but no recent systematic review/meta-analysis.

**How it works**:
1. User enters a broad medical topic (e.g., "SGLT2 inhibitors in heart failure")
2. App queries PubMed E-utilities:
   - Search `"{topic}" AND randomized controlled trial[pt]` -> count RCTs
   - Search `"{topic}" AND (systematic review[pt] OR meta-analysis[pt])` -> find existing SRs
   - Filter SRs by date (flag if none in last 3 years)
3. Regex-based gap analysis:
   - Parse SR titles/abstracts for scope keywords
   - Compare against RCT condition/intervention keywords
   - Identify uncovered sub-topics
4. Output: Table of topic suggestions with RCT count, last SR date, gap score

**Data source**: PubMed E-utilities (esearch + efetch), CORS-friendly.

## Phase 2: PROSPERO Protocol Generator

**Purpose**: Auto-generate a structured PROSPERO-style protocol for the chosen topic.

**How it works**:
1. User selects/refines topic from Phase 1 (or enters new)
2. App queries PubMed for sample RCTs on that topic
3. Regex extraction from abstracts:
   - **P** (Population): Extract patient group patterns (`patients with X`, `adults with X`)
   - **I** (Intervention): Extract drug/device names (regex dictionary of common interventions)
   - **C** (Comparator): Extract `versus`, `compared to`, `placebo` patterns
   - **O** (Outcomes): Extract `primary endpoint`, `primary outcome`, mortality/morbidity keywords
4. User reviews/edits PICO in a structured form
5. Generates protocol sections:
   - Title, Review question, PICO, Search strategy, Inclusion/exclusion criteria
   - Study selection process, Data extraction plan, Risk of bias tool (ROB2)
   - Data synthesis plan (random-effects, subgroup analyses)
   - Timeline, Dissemination plans
6. Export: Copy-paste text or download as .txt

**Pattern source**: ESC ACS Living Meta PICO extraction + CT.gov strategies MeSH expansion.

## Phase 3: Search Strategy Builder

**Purpose**: Create comprehensive database search strings from the PICO.

**How it works**:
1. Takes PICO from Phase 2
2. MeSH synonym expansion (regex dictionary):
   - Heart failure -> "heart failure" OR "cardiac failure" OR "HFrEF" OR "HFpEF" OR "cardiomyopathy"
   - Each PICO element gets expanded
3. Builds Boolean search strings for:
   - **PubMed**: MeSH terms + free text, with filters
   - **Ovid MEDLINE**: Translated syntax (`.mp.`, `exp *Term/`)
   - **ClinicalTrials.gov**: Condition + intervention terms
   - **OpenAlex**: Concept-based search
4. Multi-source execution:
   - Runs PubMed search via E-utilities
   - Runs OpenAlex search via REST API
   - Runs CT.gov search via API v2
5. De-duplicates across sources (by DOI, PMID, title fuzzy match)
6. Outputs combined RIS-format result set

**Pattern source**: CT.gov search strategies repo (MeSH dictionaries, Boolean templates).

## Phase 4: Abstract Screening (Rayyan-style)

**Purpose**: Upload RIS files, screen abstracts for inclusion/exclusion.

**How it works**:
1. **Import**:
   - RIS file upload (PubMed, Ovid MEDLINE, Embase format)
   - BibTeX, EndNote XML
   - Direct from Phase 3 results
   - Paste PMID list
2. **Screening interface**:
   - Card-based display: title, authors, abstract, journal, year
   - Include / Exclude / Maybe buttons
   - Keyword highlighting (PICO terms highlighted in abstract)
   - Exclusion reason tags (wrong population, wrong intervention, wrong design, etc.)
   - Filter by decision status, keyword, year
3. **De-duplication**:
   - Automatic by DOI, PMID, title similarity (Jaccard)
   - Manual merge for edge cases
4. **Progress tracking**:
   - PRISMA flow diagram (auto-updated)
   - Screening statistics
5. **Export**:
   - Included studies as RIS
   - PRISMA numbers
   - Screening log (CSV)

**Storage**: IndexedDB (handles thousands of records).

## Phase 5: Data Extraction -> MetaSprint Integration

**Purpose**: Extract study data and push to MetaSprint Pairwise/NMA apps.

**How it works**:
1. For each included study, structured form:
   - Study ID, Author, Year, Design
   - Sample size (intervention/control)
   - Effect measure (OR, RR, HR, MD, SMD)
   - Point estimate + CI or raw 2x2 data
   - Risk of bias (ROB2 domains)
2. **Auto-population from CT.gov**:
   - If NCT ID available, fetch enrollment, completion date, outcomes via API v2
   - Pre-fill form fields
3. **Export to MetaSprint format**:
   - Generate JSON matching MetaSprint Pairwise `studyObject` schema
   - Generate JSON matching MetaSprint NMA `studyObject` schema (with treatment nodes)
   - Download as `.json` file -> user imports into MetaSprint apps
4. **Computation engine** (built-in):
   - OR/RR/RD from 2x2 tables
   - MD/SMD from means + SD
   - HR from reported values
   - SE derivation from CI when not reported

## Phase 6: Analysis Dashboard (Lite)

**Purpose**: Run basic meta-analysis within the app (for quick results before full MetaSprint analysis).

**Included methods**:
- Random-effects (DerSimonian-Laird)
- Forest plot (SVG)
- Heterogeneity (I-squared, tau-squared, Q-test)
- Funnel plot + Egger's test
- Subgroup analysis
- Leave-one-out sensitivity

For full analysis (ROB2 assessment, GRADE, NMA, CINeMA), users export to MetaSprint.

## Phase 7: Live Paper Generator

**Purpose**: Auto-generate methods and results sections as data is entered.

**Generated sections** (all regex/template-based, no LLM):
1. **Methods section** (from Phases 2-4):
   - Search strategy description (databases, date range, terms)
   - Inclusion/exclusion criteria (from PICO)
   - Screening process description
   - Data extraction procedure
   - Risk of bias assessment tool
   - Statistical methods (effect measure, model, software)
2. **Results section** (from Phases 4-6):
   - PRISMA flow paragraph (auto-filled numbers)
   - Study characteristics table
   - Main analysis results (pooled effect, CI, p-value, I-squared)
   - Subgroup results
   - Sensitivity analysis
   - Publication bias assessment
3. **Tables**:
   - Table 1: Study characteristics (auto-populated)
   - Table 2: Risk of bias summary
   - Table 3: Main results by outcome
   - PRISMA flow diagram (SVG, exportable)
4. **Export**: Markdown, formatted text, Word-compatible HTML

**NOT generated**: Introduction, Discussion, Abstract (require domain expertise).

## Data Architecture

```
IndexedDB: "metasprint-autopilot"
  store: "references"     (imported citations, screening decisions)
  store: "studies"         (extracted study data)
  store: "searches"        (saved search strategies, results)
  store: "projects"        (project metadata, PICO, protocol)

localStorage: "msa-settings"  (UI preferences)
localStorage: "msa-state"     (current tab, active project ID)
```

## API Integration

| API | Use | CORS | Auth |
|-----|-----|------|------|
| PubMed E-utilities | Topic discovery, search, abstract fetch | Yes | Free (api_key optional) |
| OpenAlex | Citation data, DOI resolution | Yes | Free, no key |
| CT.gov API v2 | Trial data, enrollment, outcomes | Yes | Free, no key |
| CrossRef | DOI metadata resolution | Yes | Free, polite pool |

No server-side dependencies. All APIs callable from browser.

## File Structure

```
C:\Users\user\Downloads\metasprint-autopilot\
  metasprint-autopilot.html    # Single-file app
  README.md                     # "Open the HTML file"
  LICENSE                       # MIT
  test/
    test_selenium.py            # Automated browser tests
```

## Design Principles

1. **Zero-install**: Double-click HTML file to start
2. **Progressive disclosure**: Each phase reveals only what's needed
3. **Fail-safe**: All data in IndexedDB persists across sessions
4. **Export-first**: Every phase can export independently
5. **MetaSprint-compatible**: Data exports match existing MetaSprint JSON schemas
6. **Regex-only NLP**: No LLM dependency, deterministic, inspectable
7. **Rate-limit aware**: PubMed 3 req/sec (10 with API key), built-in throttling
8. **PRISMA-aligned**: Generated text follows PRISMA 2020 reporting guidelines

## Rejected Alternatives

### Python Backend + HTML Frontend
- Requires Python install (barrier for medical students)
- Not portable, breaks single-file pattern

### Hybrid Python CLI + HTML Viewer
- Two-step workflow confusing for students
- Context switching between terminal and browser

## Implementation Priority

Phase 4 (Screening) and Phase 5 (Extraction) are the highest-value phases — they replace the most manual work. Phase 1 (Discovery) and Phase 7 (Paper) are the most novel. Recommended build order:

1. App skeleton + project management + IndexedDB
2. Phase 4: Screening (RIS import, card UI, decisions)
3. Phase 5: Extraction (forms, CT.gov auto-fill, MetaSprint export)
4. Phase 6: Analysis (DL forest plot, funnel)
5. Phase 3: Search (MeSH expansion, multi-source)
6. Phase 1: Discovery (PubMed gap analysis)
7. Phase 2: Protocol (PICO extraction, template)
8. Phase 7: Paper (template generation)
