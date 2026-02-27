# Kitab al-Ayat: Discovery Index for the Ayat Universe

**Date**: 2026-02-27
**Status**: Approved
**File**: `metasprint-autopilot.html` (~18,300 lines)
**Estimated new code**: ~600-800 lines

## Problem

The Ayat Universe currently uses a **category-first** discovery model: users must select a cardiology subcategory, then browse interventions within it. There is no way to:
- Search across all 5K+ trials by keyword
- Discover connections between evidence clusters in different subcategories
- Systematically identify structural gaps (intervention+outcome pairs with zero evidence)
- Assess evidence maturity at a glance

## Quranic Epistemological Framework

The design draws on three Quranic methods of knowledge acquisition, plus a fourth for actionable judgment:

| Layer | Arabic Name | Quranic Principle | Function |
|-------|------------|-------------------|----------|
| 1 | **Fihris** (Index) | **Tafakkur** — guided reflection | Searchable inverted index over all trials |
| 2 | **Tafsir** (Cross-Refs) | **Ayat** — signs pointing to each other | Cross-subcategory semantic connections |
| 3 | **Bayan** (Void Map) | **Tadabbur** — pondering structure | Evidence matrix + void scoring |
| 4 | **Hukm** (Judgment) | **Ahkam** — rulings from evidence | Automated evidence maturity verdicts |

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    KITAB AL-AYAT                                │
│                                                                 │
│  ┌──────────────┐ ┌──────────────┐ ┌─────────────┐ ┌─────────┐ │
│  │ L1: FIHRIS   │ │ L2: TAFSIR   │ │ L3: BAYAN   │ │L4: HUKM │ │
│  │ Inverted idx │ │ Cross-refs   │ │ Evidence mtx │ │ Verdicts│ │
│  │ + search bar │ │ + sem. edges │ │ + void score │ │ + badge │ │
│  └──────────────┘ └──────────────┘ └─────────────┘ └─────────┘ │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Existing Ayat Universe Canvas               │    │
│  │   (nodes dim/highlight based on active search/layer)     │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

All four layers operate on existing `universeTrialsCache`. No new APIs or fetches required.

---

## Layer 1: Fihris (The Index) — Tafakkur

### Data Structure

```javascript
fihrisIndex = {
  tokens: Map<string, Set<number>>       // word → trial indices
  interventions: Map<string, Set<string>> // drug name → Ayat node IDs
  outcomes: Map<string, Set<string>>      // outcome → Ayat node IDs
  conditions: Map<string, Set<string>>    // condition → Ayat node IDs
}
```

### Functions

- `buildFihrisIndex(trials, ayatNodes)` — builds inverted index from trial fields
  - Tokenize: title, conditions[], interventions[].name, primaryOutcomes[]
  - Lowercase, remove stopwords (the, a, in, of, for, with, and, or, to, vs, study)
  - Simple plural stemming (trailing s/es removal)
  - O(N × avg_tokens), ~50ms for 5K trials, ~3 MB memory

- `queryFihris(queryString)` — returns `{ matchedTrialIndices: Set, matchedNodeIds: Set, matchIntensity: Map<nodeId, float> }`
  - Tokenize query → intersect token sets (AND semantics)
  - Map trial indices → node IDs
  - Compute match intensity per node: `matchCount / node.trialCount`

### UI

- Search bar above Ayat canvas, debounced 300ms
- Placeholder: "Search the evidence... (e.g., SGLT2 mortality, empagliflozin, heart failure Phase 3)"
- Result badge: "142 trials in 8 clusters"
- Collapsible result summary row: subcategory breakdown + top interventions (clickable → zoom)

### Ayat Integration

When search is active:
- Matched nodes: full opacity + gold match-intensity ring
- Unmatched nodes: 15% opacity, desaturated
- Clear button (×) restores normal view

---

## Layer 2: Tafsir (Cross-References) — Ayat-as-Signs

### Outcome Taxonomy

Static mapping of ~15 canonical outcome categories:

```javascript
const OUTCOME_TAXONOMY = {
  mortality: ['death', 'mortality', 'survival', 'all-cause death', 'cv death', ...],
  mace: ['mace', 'major adverse cardiovascular', 'composite endpoint', ...],
  hospitalization: ['hospitalization', 'hospital admission', 'readmission', ...],
  bleeding: ['bleeding', 'hemorrhage', 'major bleeding', 'TIMI', 'BARC'],
  stroke: ['stroke', 'cerebrovascular', 'ischemic stroke', 'TIA'],
  mi: ['myocardial infarction', 'heart attack', 'STEMI', 'NSTEMI', ...],
  renal: ['renal', 'kidney', 'eGFR', 'creatinine', 'dialysis', ...],
  bp: ['blood pressure', 'systolic', 'diastolic', 'hypertension', 'mmHg'],
  hr: ['heart rate', 'ventricular rate', 'rate control'],
  ef: ['ejection fraction', 'LVEF', 'LV function', 'systolic function'],
  biomarker: ['BNP', 'NT-proBNP', 'troponin', 'biomarker', 'hs-CRP'],
  qol: ['quality of life', 'QoL', 'SF-36', 'KCCQ', 'EQ-5D', ...],
  arrhythmia: ['arrhythmia', 'AF recurrence', 'sinus rhythm'],
  thromboembolism: ['thromboembolism', 'DVT', 'PE', 'VTE', 'embolism'],
  safety: ['adverse event', 'AE', 'SAE', 'discontinuation', 'tolerability']
};
```

### Sibling Computation

`computeTafsirLinks(ayatNodes)` computes three link types:

1. **Drug siblings**: same drug class across subcategories (using existing KB)
2. **Outcome bridges**: same canonical outcome via OUTCOME_TAXONOMY
3. **Mechanism overlap**: same drug class (not exact name)

Output: `tafsirLinks[] = [{ sourceId, targetId, linkType, label }]`

### Rendering

- Toggle: "Cross-refs" checkbox in layer controls
- Dashed curves between linked nodes
- Color by type: drug = purple, outcome = amber, mechanism = teal
- Opacity scales with LOD (faint at LOD 0-1, visible at LOD 2+)

### Drill-Down Enhancement

New "Related Signs" section in node drill-down:
```
Drug siblings:   SGLT2i in ACS (14 trials) | SGLT2i in renal (8 trials)
Outcome bridges: Mortality in ACS (45 trials) | Mortality in AF (12 trials)
```
Each clickable → zooms to sibling node.

---

## Layer 3: Bayan (Void Cartography) — Tadabbur

### Evidence Matrix

`buildBayanMatrix(ayatNodes)` → 2D grid: **Top 20 Interventions × 15 Canonical Outcomes**

- Cell value = trial count for (intervention, outcome) pair
- Color: 0 = white, 1+ = green gradient, 10+ = deep green
- Void cells adjacent to full cells highlighted amber/red

### Void Scoring

For each empty cell (i, j):
```
voidScore = neighborDensity × drugMaturity × outcomeRelevance
```
- `neighborDensity` = avg trial count in 4 adjacent cells
- `drugMaturity` = total trials for that drug (high → gap more surprising)
- `outcomeRelevance` = total trials for that outcome (high → gap more notable)

### UI

- New view option: "Matrix" alongside Ayat/Network/Treemap/Timeline
- Heatmap grid (canvas or CSS grid)
- Hover: drug name, outcome, trial count, void score
- Click non-empty → filter Ayat to that pair
- Click void → "Research Opportunity" card with context

### Top Voids List

Panel showing top 10 voids ranked by voidScore:
```
1. Empagliflozin × Stroke       (8.4) — 45 trials for mortality, 0 for stroke
2. Rivaroxaban × Renal           (7.1) — 23 trials for bleeding, 0 for renal
```

---

## Layer 4: Hukm (Judgment) — Evidence Verdicts

### Verdict Engine

`computeHukm(node, alBurhanData)` → per-node verdict:

```javascript
{
  verdict: 'SUFFICIENT' | 'GROWING' | 'INCONCLUSIVE' | 'CONTRADICTORY' | 'DESERT',
  confidence: 0-1,
  signals: {
    trialVolume: 'high' | 'moderate' | 'low',
    phaseMaturity: 'mature' | 'emerging' | 'early',
    recentActivity: 'active' | 'stale' | 'dormant',
    enrollmentMass: 'large' | 'medium' | 'small',
    outcomeConsistency: 'consistent' | 'mixed' | 'contradictory'
  },
  reasoning: 'string'
}
```

### Verdict Rules

| Verdict | Criteria |
|---------|----------|
| SUFFICIENT | Phase 3/4 > 50%, trialCount > 10, enrollment > 5000, Al-Burhan pooled with narrow CI |
| GROWING | trialCount 5-10, recentCount > 2, mixed phases |
| INCONCLUSIVE | trialCount > 5 but mostly Phase 1-2, or enrollment < 1000, or no recent activity |
| CONTRADICTORY | Al-Burhan I² > 75%, or conflicting direction across phases |
| DESERT | trialCount < 3, no recent activity, no Al-Burhan match |

### Rendering

- LOD 2+ badge in bottom-left of node:
  - SUFFICIENT: green checkmark
  - GROWING: blue upward arrow
  - INCONCLUSIVE: amber question mark
  - CONTRADICTORY: red exclamation triangle
  - DESERT: gray dashed circle

- Verdict summary bar above canvas:
  ```
  SUFFICIENT: 12 | GROWING: 23 | INCONCLUSIVE: 8 | CONTRADICTORY: 3 | DESERT: 34
  ```
  Clickable → filters Ayat to that verdict class.

- Verdict panel in drill-down (top of panel, above trial table).

---

## Performance Budget

| Component | Memory | Build Time |
|-----------|--------|------------|
| Fihris inverted index | ~3 MB | ~50ms |
| Tafsir links | ~100 KB | ~20ms |
| Bayan matrix | ~10 KB | ~30ms |
| Hukm verdicts | ~50 KB | ~10ms |
| **Total** | **~3.2 MB** | **~110ms** |

Index rebuilt only on universe refresh. All queries O(1) Map lookups.

---

## UI Layout

```
┌─────────────────────────────────────────────────────────┐
│ [Search: ________________________________________] [🔍] │
│ HF: 45 | ACS: 23 | AF: 12 | ...                  [×]  │
├─────────────────────────────────────────────────────────┤
│ [Ayat] [Matrix] [Network] [Treemap] [Timeline]         │
│ ☐ Cross-refs  ☐ Verdicts  ☐ Voids      Verdicts: ▓▓░░ │
├─────────────────────────────────────────────────────────┤
│                                                         │
│              Ayat Universe Canvas                        │
│   (search highlighting, cross-ref edges,                │
│    verdict badges, void glow)                           │
│                                                         │
├─────────────────────────────────────────────────────────┤
│ Top Voids: 1. Empagliflozin×Stroke (8.4)  2. ...       │
└─────────────────────────────────────────────────────────┘
```

---

## Implementation Order

1. **Fihris** (search) — highest user value, standalone
2. **Hukm** (verdicts) — independent of other layers, immediate visual impact
3. **Tafsir** (cross-refs) — depends on outcome taxonomy
4. **Bayan** (matrix/voids) — depends on outcome taxonomy (shared with Tafsir)

Layers 3 and 4 share `OUTCOME_TAXONOMY`, so implement that as a shared constant first.

---

## Verification Plan

1. Div balance after all edits
2. Script integrity (no literal `</script>` in template literals)
3. Manual tests:
   - Search "SGLT2" → verify nodes highlight across HF + other subcategories
   - Toggle cross-refs → verify edges appear between subcategories
   - Switch to Matrix view → verify heatmap renders with correct counts
   - Check verdict badges at LOD 2+ → verify classification logic
4. Run existing 313-test suite (no regressions)
5. Memory profiling: confirm < 5 MB overhead with 5K trials loaded
