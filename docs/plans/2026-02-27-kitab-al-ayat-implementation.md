# Kitab al-Ayat Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add four discovery layers (Fihris search, Tafsir cross-refs, Bayan evidence matrix, Hukm verdicts) to the Ayat Universe in metasprint-autopilot.html.

**Architecture:** All layers operate on existing `universeTrialsCache` (no new APIs). A shared `OUTCOME_TAXONOMY` constant feeds Tafsir and Bayan. The Fihris inverted index reuses the existing `tokenize()` and `STOP_WORDS` (line 4721). Each layer renders as an overlay on the existing Ayat canvas, toggled by checkboxes. The Bayan matrix reuses the existing `matrixCanvas` view slot.

**Tech Stack:** Vanilla JS, Canvas 2D, existing IndexedDB store, existing `escapeHtml`/`tokenize`/`normalizeOutcome` utilities.

**Design Doc:** `docs/plans/2026-02-27-kitab-al-ayat-design.md`

---

## Shared Constants (prerequisite for Tasks 2-4)

### Task 0: Add OUTCOME_TAXONOMY and shared infrastructure

**Files:**
- Modify: `metasprint-autopilot.html` — insert after `normalizeOutcome()` (~line 10565)

**Step 1: Add OUTCOME_TAXONOMY constant**

Insert immediately after the closing `}` of `normalizeOutcome()` (line 10565), before the Network Graph section comment:

```javascript
  // ============================================================
  // KITAB AL-AYAT — Shared Outcome Taxonomy
  // ============================================================
  const OUTCOME_TAXONOMY = {
    mortality:        ['death', 'mortality', 'survival', 'all-cause death', 'cv death', 'cardiovascular death'],
    mace:             ['mace', 'major adverse cardiovascular', 'composite endpoint', 'cv events'],
    hospitalization:  ['hospitalization', 'hospital admission', 'readmission', 'hf hospitalization'],
    bleeding:         ['bleeding', 'hemorrhage', 'major bleeding', 'timi bleeding', 'barc'],
    stroke:           ['stroke', 'cerebrovascular', 'ischemic stroke', 'tia'],
    mi:               ['myocardial infarction', 'heart attack', 'stemi', 'nstemi', 'acute coronary'],
    renal:            ['renal', 'kidney', 'egfr', 'creatinine', 'dialysis', 'ckd progression'],
    bp:               ['blood pressure', 'systolic', 'diastolic', 'hypertension', 'mmhg'],
    hr:               ['heart rate', 'ventricular rate', 'rate control'],
    ef:               ['ejection fraction', 'lvef', 'lv function', 'systolic function'],
    biomarker:        ['bnp', 'nt-probnp', 'troponin', 'biomarker', 'hs-crp'],
    qol:              ['quality of life', 'qol', 'sf-36', 'kccq', 'eq-5d', 'patient-reported'],
    arrhythmia:       ['arrhythmia', 'atrial fibrillation', 'af recurrence', 'sinus rhythm'],
    thromboembolism:  ['thromboembolism', 'dvt', 'pe', 'vte', 'embolism'],
    safety:           ['adverse event', 'ae', 'sae', 'discontinuation', 'tolerability', 'side effect']
  };

  // Map a raw outcome string to its canonical taxonomy key (or null if no match)
  function classifyOutcome(outcomeStr) {
    if (!outcomeStr) return null;
    const low = outcomeStr.toLowerCase();
    for (const [cat, terms] of Object.entries(OUTCOME_TAXONOMY)) {
      if (terms.some(t => low.includes(t))) return cat;
    }
    return null;
  }

  // Kitab al-Ayat global state
  let _fihrisIndex = null;       // Layer 1: inverted index
  let _tafsirLinks = [];         // Layer 2: cross-reference edges
  let _bayanMatrix = null;       // Layer 3: evidence matrix
  let _hukmVerdicts = new Map(); // Layer 4: node ID → verdict
  let _kitabSearchQuery = '';    // Active search query
  let _kitabLayers = { crossRefs: false, verdicts: false, voids: false }; // Toggle state
```

**Step 2: Verify no syntax errors**

Run: `python -c "import re; content=open('metasprint-autopilot.html','r',encoding='utf-8').read(); opens=len(re.findall(r'<div[\\s>]',content)); closes=len(re.findall(r'</div>',content)); print(f'Divs: {opens}/{closes}')"` from the project directory.
Expected: Equal div counts.

**Step 3: Commit**

```bash
git add metasprint-autopilot.html
git commit -m "feat(kitab): add OUTCOME_TAXONOMY and shared Kitab al-Ayat state"
```

---

## Task 1: Fihris — Inverted Search Index (Layer 1)

### Task 1a: Build the inverted index engine

**Files:**
- Modify: `metasprint-autopilot.html` — insert after the Kitab state variables from Task 0

**Step 1: Add `buildFihrisIndex()` function**

Insert after the `_kitabLayers` declaration:

```javascript
  // ============================================================
  // LAYER 1: FIHRIS (Index) — Tafakkur (guided reflection)
  // ============================================================

  function buildFihrisIndex(trials, ayatNodes) {
    const tokens = new Map();     // token → Set of trial indices
    const nodeMap = new Map();    // token → Set of node IDs
    const trialToNode = new Map(); // trial nctId → node ID

    // Build trial → node mapping from ayatNodes
    // (ayatNodes are intervention clusters; each node covers multiple trials)
    // We map by subcategory + intervention label prefix match
    if (ayatNodes) {
      for (const node of ayatNodes) {
        // node.id = "subcatId:interventionLabel"
        // We'll map this below when indexing trials
        node._trialIndices = new Set();
      }
    }

    for (let i = 0; i < trials.length; i++) {
      const t = trials[i];
      // Tokenize all text fields
      const fields = [
        t.title || '',
        (t.conditions || []).join(' '),
        (t.interventions || []).map(iv => typeof iv === 'string' ? iv : (iv.name || '')).join(' '),
        (t.primaryOutcomes || []).join(' '),
        t.phase || '',
        t.nctId || ''
      ].join(' ');

      const toks = tokenize(fields);
      for (const tok of toks) {
        if (!tokens.has(tok)) tokens.set(tok, new Set());
        tokens.get(tok).add(i);
      }

      // Map trial to its Ayat node
      if (ayatNodes) {
        const sc = t.subcategory || 'general';
        const ivNames = getTrialInterventionNames(t, { excludeComparators: true, maxItems: 3, fallbackLabel: '' })
          .map(n => n.slice(0, 30)).filter(n => n.length > 2);
        const ivKey = ivNames.length > 0 ? ivNames[0] : 'Other';
        const nodeId = sc + ':' + ivKey;
        trialToNode.set(t.nctId, nodeId);
        // Find matching node
        const matchNode = ayatNodes.find(n => n.id === nodeId);
        if (matchNode) matchNode._trialIndices.add(i);
      }
    }

    // Build node-level token index
    if (ayatNodes) {
      for (const node of ayatNodes) {
        for (const ti of node._trialIndices) {
          const t = trials[ti];
          const fields = [t.title || '', (t.conditions || []).join(' '),
            (t.interventions || []).map(iv => typeof iv === 'string' ? iv : (iv.name || '')).join(' '),
            (t.primaryOutcomes || []).join(' ')].join(' ');
          for (const tok of tokenize(fields)) {
            if (!nodeMap.has(tok)) nodeMap.set(tok, new Set());
            nodeMap.get(tok).add(node.id);
          }
        }
      }
    }

    return { tokens, nodeMap, trialToNode, trialCount: trials.length };
  }

  function queryFihris(queryString, index, ayatNodes) {
    if (!index || !queryString || queryString.trim().length < 2) {
      return { matchedTrialIndices: new Set(), matchedNodeIds: new Set(), matchIntensity: new Map() };
    }
    const qTokens = tokenize(queryString);
    if (qTokens.length === 0) {
      return { matchedTrialIndices: new Set(), matchedNodeIds: new Set(), matchIntensity: new Map() };
    }

    // AND semantics: intersect trial sets for each query token
    let trialSets = qTokens.map(qt => {
      // Support prefix matching for short tokens
      if (qt.length <= 3) {
        const merged = new Set();
        for (const [tok, s] of index.tokens) {
          if (tok.startsWith(qt)) for (const v of s) merged.add(v);
        }
        return merged;
      }
      return index.tokens.get(qt) || new Set();
    });

    // Intersect
    let matched = new Set(trialSets[0]);
    for (let i = 1; i < trialSets.length; i++) {
      const next = trialSets[i];
      matched = new Set([...matched].filter(x => next.has(x)));
    }

    // Map to node IDs and compute intensity
    const matchedNodeIds = new Set();
    const nodeMatchCounts = new Map();
    for (const ti of matched) {
      // Find which node this trial belongs to
      for (const node of (ayatNodes || [])) {
        if (node._trialIndices && node._trialIndices.has(ti)) {
          matchedNodeIds.add(node.id);
          nodeMatchCounts.set(node.id, (nodeMatchCounts.get(node.id) || 0) + 1);
        }
      }
    }

    // Compute intensity per node
    const matchIntensity = new Map();
    for (const node of (ayatNodes || [])) {
      if (nodeMatchCounts.has(node.id)) {
        matchIntensity.set(node.id, nodeMatchCounts.get(node.id) / Math.max(1, node.trialCount));
      }
    }

    return { matchedTrialIndices: matched, matchedNodeIds, matchIntensity };
  }
```

**Step 2: Verify no syntax errors** — same div balance check as Task 0 Step 2.

**Step 3: Commit**

```bash
git add metasprint-autopilot.html
git commit -m "feat(kitab): add Fihris inverted index engine"
```

---

### Task 1b: Add search bar UI

**Files:**
- Modify: `metasprint-autopilot.html` — insert into HTML at line ~1173 (after gap threshold controls, before closing `</div>` of `#universeControls`)

**Step 1: Add the search bar HTML**

Insert after the `(Gap score thresholds)` span line (line 1172-1173), before `</div>` closing `#universeControls`:

```html
        <div id="kitabSearchRow" style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:8px;padding-top:8px;border-top:1px solid var(--border)">
          <div style="position:relative;flex:1;min-width:200px">
            <input type="text" id="fihrisSearch" placeholder="Search the evidence... (e.g., SGLT2 mortality, empagliflozin)" style="width:100%;padding:6px 32px 6px 10px;border:1px solid var(--border);border-radius:6px;font-size:0.82rem;background:var(--surface);color:var(--text)" oninput="debounceFihrisSearch(this.value)">
            <span id="fihrisSearchClear" onclick="clearFihrisSearch()" style="position:absolute;right:8px;top:50%;transform:translateY(-50%);cursor:pointer;font-size:1rem;color:var(--text-muted);display:none" title="Clear search">&times;</span>
          </div>
          <span id="fihrisResultBadge" style="font-size:0.78rem;color:var(--text-muted);white-space:nowrap"></span>
          <label style="font-size:0.75rem;color:var(--text-muted);display:flex;align-items:center;gap:3px;margin-left:8px">
            <input type="checkbox" id="kitabCrossRefs" onchange="toggleKitabLayer('crossRefs',this.checked)"> Cross-refs
          </label>
          <label style="font-size:0.75rem;color:var(--text-muted);display:flex;align-items:center;gap:3px">
            <input type="checkbox" id="kitabVerdicts" onchange="toggleKitabLayer('verdicts',this.checked)"> Verdicts
          </label>
        </div>
        <div id="fihrisResultSummary" style="display:none;margin-top:6px;font-size:0.78rem;color:var(--text-muted);padding:4px 8px;background:var(--surface);border-radius:4px"></div>
```

**Step 2: Add debounce + search + clear functions**

Insert after `queryFihris()` function (from Task 1a):

```javascript
  let _fihrisDebounceTimer = null;
  function debounceFihrisSearch(val) {
    clearTimeout(_fihrisDebounceTimer);
    _fihrisDebounceTimer = setTimeout(() => executeFihrisSearch(val), 300);
  }

  function executeFihrisSearch(val) {
    _kitabSearchQuery = (val || '').trim();
    const clearBtn = document.getElementById('fihrisSearchClear');
    const badge = document.getElementById('fihrisResultBadge');
    const summary = document.getElementById('fihrisResultSummary');

    if (_kitabSearchQuery.length < 2) {
      if (clearBtn) clearBtn.style.display = 'none';
      if (badge) badge.textContent = '';
      if (summary) summary.style.display = 'none';
      // Re-render Ayat without highlighting
      if (currentUniverseView === 'ayat' && universeTrialsCache.length > 0) {
        renderAyatUniverse(universeTrialsCache);
      }
      return;
    }

    if (clearBtn) clearBtn.style.display = 'inline';

    // Query index
    const result = queryFihris(_kitabSearchQuery, _fihrisIndex, _lastAyatClusters);
    const matchCount = result.matchedTrialIndices.size;
    const nodeCount = result.matchedNodeIds.size;

    if (badge) badge.textContent = matchCount + ' trials in ' + nodeCount + ' clusters';

    // Build subcategory breakdown for summary
    if (summary && _lastAyatClusters) {
      const subcatCounts = {};
      for (const nid of result.matchedNodeIds) {
        const node = _lastAyatClusters.find(n => n.id === nid);
        if (node) {
          const sc = node.subcatLabel || node.subcatId;
          subcatCounts[sc] = (subcatCounts[sc] || 0) + (result.matchIntensity.get(nid) || 0);
        }
      }
      const parts = Object.entries(subcatCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([k, v]) => k + ': ' + Math.round(v * 100) + '%');
      if (parts.length > 0) {
        summary.textContent = parts.join(' | ');
        summary.style.display = 'block';
      } else {
        summary.style.display = 'none';
      }
    }

    // Store search result for render integration and trigger re-render
    _lastFihrisResult = result;
    if (currentUniverseView === 'ayat' && universeTrialsCache.length > 0) {
      renderAyatUniverse(universeTrialsCache);
    }
  }

  let _lastFihrisResult = null;
  let _lastAyatClusters = null;

  function clearFihrisSearch() {
    const input = document.getElementById('fihrisSearch');
    if (input) input.value = '';
    executeFihrisSearch('');
  }

  function toggleKitabLayer(layer, enabled) {
    _kitabLayers[layer] = enabled;
    // Re-render to show/hide layer
    if (currentUniverseView === 'ayat' && universeTrialsCache.length > 0) {
      renderAyatUniverse(universeTrialsCache);
    }
  }
```

**Step 3: Commit**

```bash
git add metasprint-autopilot.html
git commit -m "feat(kitab): add Fihris search bar UI and debounced query"
```

---

### Task 1c: Integrate search highlighting into Ayat renderer

**Files:**
- Modify: `metasprint-autopilot.html`
  - `renderAyatUniverse()` — trigger index build + stash clusters
  - `render()` inside `renderAyatUniverseOnCanvas()` — add node opacity/highlighting

**Step 1: Hook index build into universe cache population**

Find the line `universeTrialsCache = trials;` at ~line 3807. Insert after it:

```javascript
        // Build Kitab al-Ayat search index (Layer 1: Fihris)
        // Note: full index with node mapping is rebuilt when Ayat renders (needs clusters)
        _fihrisIndex = buildFihrisIndex(trials, null);
```

**Step 2: Hook cluster stash into `renderAyatUniverse`**

Find `renderAyatUniverse` function. After `buildAyatClusters(trials)` call, stash the result:

```javascript
        _lastAyatClusters = clusters;
        // Rebuild Fihris with node mapping
        _fihrisIndex = buildFihrisIndex(universeTrialsCache, clusters);
```

To find the exact line: search for `function renderAyatUniverse(` and find the `buildAyatClusters` call inside it.

**Step 3: Add highlighting to the render loop**

In the `render()` function inside `renderAyatUniverseOnCanvas` (~line 13838), modify the node rendering loop (line ~13858-13861). Replace:

```javascript
      // Layer 3: Nodes (ayat)
      for (const node of clusters) {
        renderAyatGlyph(ctx, node, lod);
      }
```

With:

```javascript
      // Layer 3: Nodes (ayat) — with Fihris search highlighting
      const hasSearch = _kitabSearchQuery.length >= 2 && _lastFihrisResult;
      for (const node of clusters) {
        if (hasSearch) {
          const intensity = _lastFihrisResult.matchIntensity.get(node.id);
          if (intensity != null) {
            // Matched node: render normally + gold highlight ring
            renderAyatGlyph(ctx, node, lod);
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.r + 4, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(251,191,36,' + Math.min(1, 0.4 + intensity * 0.6) + ')';
            ctx.lineWidth = 2.5;
            ctx.stroke();
          } else {
            // Unmatched node: dimmed
            ctx.globalAlpha = 0.15;
            renderAyatGlyph(ctx, node, lod);
            ctx.globalAlpha = 1;
          }
        } else {
          renderAyatGlyph(ctx, node, lod);
        }
      }
```

**Step 4: Verify div balance**

Run div count check. Expected: still balanced.

**Step 5: Commit**

```bash
git add metasprint-autopilot.html
git commit -m "feat(kitab): integrate Fihris search highlighting into Ayat renderer"
```

---

## Task 2: Tafsir — Cross-Reference Edges (Layer 2)

### Task 2a: Compute sibling links

**Files:**
- Modify: `metasprint-autopilot.html` — insert after Fihris functions

**Step 1: Add `computeTafsirLinks()` function**

```javascript
  // ============================================================
  // LAYER 2: TAFSIR (Cross-References) — Ayat-as-Signs
  // ============================================================

  function computeTafsirLinks(ayatNodes) {
    if (!ayatNodes || ayatNodes.length < 2) return [];
    const links = [];
    const seen = new Set(); // avoid duplicate A↔B

    // For each pair of nodes in DIFFERENT subcategories
    for (let i = 0; i < ayatNodes.length; i++) {
      for (let j = i + 1; j < ayatNodes.length; j++) {
        const a = ayatNodes[i], b = ayatNodes[j];
        if (a.subcatId === b.subcatId) continue; // only cross-subcategory
        const pairKey = a.id + '|' + b.id;
        if (seen.has(pairKey)) continue;

        // Check 1: Drug class match (same intervention label)
        const aLabel = a.label.toLowerCase();
        const bLabel = b.label.toLowerCase();
        if (aLabel === bLabel || aLabel.includes(bLabel) || bLabel.includes(aLabel)) {
          links.push({ sourceId: a.id, targetId: b.id, linkType: 'drug', label: a.label });
          seen.add(pairKey);
          continue;
        }

        // Check 2: Shared canonical outcome
        const aOutcomes = new Set((a.topOutcomes || []).map(classifyOutcome).filter(Boolean));
        const bOutcomes = new Set((b.topOutcomes || []).map(classifyOutcome).filter(Boolean));
        const shared = [...aOutcomes].filter(o => bOutcomes.has(o));
        if (shared.length > 0) {
          links.push({ sourceId: a.id, targetId: b.id, linkType: 'outcome', label: shared[0] });
          seen.add(pairKey);
          continue;
        }

        // Check 3: Drug class mechanism overlap (using KB)
        // Both labels contain a known drug class keyword
        const drugClasses = ['sglt2', 'ace', 'arb', 'beta-block', 'calcium', 'statin',
          'doac', 'anticoagul', 'antiplatelet', 'diuretic', 'nitrate', 'amiodarone',
          'ivabradine', 'sacubitril', 'entresto', 'pcsk9', 'mra', 'aldosterone'];
        for (const dc of drugClasses) {
          if (aLabel.includes(dc) && bLabel.includes(dc)) {
            links.push({ sourceId: a.id, targetId: b.id, linkType: 'mechanism', label: dc });
            seen.add(pairKey);
            break;
          }
        }
      }
    }
    return links;
  }
```

**Step 2: Commit**

```bash
git add metasprint-autopilot.html
git commit -m "feat(kitab): add Tafsir cross-reference link computation"
```

---

### Task 2b: Render cross-reference edges

**Files:**
- Modify: `metasprint-autopilot.html` — add rendering after Tafsir computation, and hook into the Ayat render loop

**Step 1: Add `renderTafsirEdges()` function**

Insert after `computeTafsirLinks`:

```javascript
  function renderTafsirEdges(ctx, links, ayatNodes, lod) {
    if (!links || links.length === 0 || lod < 1) return;
    const nodeById = new Map(ayatNodes.map(n => [n.id, n]));
    const typeColors = { drug: '#a78bfa', outcome: '#fbbf24', mechanism: '#2dd4bf' };

    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = lod >= 2 ? 1.5 : 1;

    for (const link of links) {
      const src = nodeById.get(link.sourceId);
      const tgt = nodeById.get(link.targetId);
      if (!src || !tgt) continue;

      const color = typeColors[link.linkType] || '#94a3b8';
      ctx.strokeStyle = color + (lod >= 2 ? 'aa' : '55');
      ctx.beginPath();

      // Quadratic curve with offset for visual separation
      const mx = (src.x + tgt.x) / 2;
      const my = (src.y + tgt.y) / 2;
      const dx = tgt.x - src.x, dy = tgt.y - src.y;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      const offX = -dy / len * 15;
      const offY = dx / len * 15;

      ctx.moveTo(src.x, src.y);
      ctx.quadraticCurveTo(mx + offX, my + offY, tgt.x, tgt.y);
      ctx.stroke();

      // Label at midpoint (LOD 2+ only)
      if (lod >= 2 && link.label) {
        ctx.fillStyle = color + 'cc';
        ctx.font = '6px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(link.label, mx + offX, my + offY - 4);
      }
    }
    ctx.setLineDash([]);
    ctx.restore();
  }
```

**Step 2: Hook into the render loop**

In `render()` inside `renderAyatUniverseOnCanvas`, after the node rendering loop (Layer 3 block), add:

```javascript
      // Layer 3b: Tafsir cross-reference edges (dashed curves)
      if (_kitabLayers.crossRefs && _tafsirLinks.length > 0) {
        renderTafsirEdges(ctx, _tafsirLinks, clusters, lod);
      }
```

**Step 3: Trigger Tafsir computation when Ayat renders**

In `renderAyatUniverse` function, after `_lastAyatClusters = clusters;`, add:

```javascript
        _tafsirLinks = computeTafsirLinks(clusters);
```

**Step 4: Add "Related Signs" section to `drillDownAyatNode`**

In the `drillDownAyatNode` function (~line 10896), after the trial table HTML is built (before `showDrillDownPanel()`), insert:

```javascript
    // Tafsir: Related Signs
    if (_tafsirLinks.length > 0) {
      var relLinks = _tafsirLinks.filter(function(l) { return l.sourceId === node.id || l.targetId === node.id; });
      if (relLinks.length > 0) {
        html += '<div style="margin-top:12px;padding-top:8px;border-top:1px solid var(--border)">';
        html += '<div style="font-weight:600;font-size:0.82rem;margin-bottom:4px">Related Signs (Tafsir)</div>';
        for (var ri = 0; ri < relLinks.length; ri++) {
          var rl = relLinks[ri];
          var sibId = rl.sourceId === node.id ? rl.targetId : rl.sourceId;
          var parts = sibId.split(':');
          var typeIcon = rl.linkType === 'drug' ? '&#x1f48a;' : rl.linkType === 'outcome' ? '&#x1f3af;' : '&#x2699;';
          html += '<span style="display:inline-block;margin:2px 6px 2px 0;padding:2px 8px;background:var(--surface);border-radius:12px;font-size:0.75rem;cursor:pointer" title="' + escapeHtml(rl.linkType) + ': ' + escapeHtml(rl.label || '') + '">';
          html += typeIcon + ' ' + escapeHtml(parts[1] || sibId) + ' (' + escapeHtml(parts[0] || '') + ')';
          html += '</span>';
        }
        html += '</div>';
      }
    }
```

**Step 5: Commit**

```bash
git add metasprint-autopilot.html
git commit -m "feat(kitab): render Tafsir cross-reference edges and Related Signs in drill-down"
```

---

## Task 3: Bayan — Evidence Matrix (Layer 3)

### Task 3a: Build the evidence matrix

**Files:**
- Modify: `metasprint-autopilot.html` — insert after Tafsir functions

**Step 1: Add `buildBayanMatrix()` and `computeVoidScores()` functions**

```javascript
  // ============================================================
  // LAYER 3: BAYAN (Void Cartography) — Tadabbur
  // ============================================================

  function buildBayanMatrix(trials) {
    if (!trials || trials.length === 0) return null;

    // Extract top interventions (by frequency)
    const ivCounts = {};
    const ivTrialSets = {};
    for (let i = 0; i < trials.length; i++) {
      const t = trials[i];
      const names = getTrialInterventionNames(t, { excludeComparators: true, maxItems: 2, fallbackLabel: '' })
        .map(n => n.toLowerCase().slice(0, 30)).filter(n => n.length > 2);
      for (const n of names) {
        ivCounts[n] = (ivCounts[n] || 0) + 1;
        if (!ivTrialSets[n]) ivTrialSets[n] = new Set();
        ivTrialSets[n].add(i);
      }
    }
    const topIvs = Object.entries(ivCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([k]) => k);

    // Build matrix: interventions × canonical outcomes
    const outcomeCats = Object.keys(OUTCOME_TAXONOMY);
    const cells = []; // [ivIdx][ocIdx] = { count, trialIndices }
    for (let iv = 0; iv < topIvs.length; iv++) {
      cells[iv] = [];
      for (let oc = 0; oc < outcomeCats.length; oc++) {
        cells[iv][oc] = { count: 0, trialIndices: [] };
      }
    }

    // Populate cells
    for (let i = 0; i < trials.length; i++) {
      const t = trials[i];
      const names = getTrialInterventionNames(t, { excludeComparators: true, maxItems: 2, fallbackLabel: '' })
        .map(n => n.toLowerCase().slice(0, 30)).filter(n => n.length > 2);
      const matchedIvs = names.map(n => topIvs.indexOf(n)).filter(idx => idx >= 0);
      if (matchedIvs.length === 0) continue;

      // Classify outcomes
      const matchedOcs = new Set();
      for (const o of (t.primaryOutcomes || [])) {
        const cat = classifyOutcome(o);
        if (cat) {
          const ocIdx = outcomeCats.indexOf(cat);
          if (ocIdx >= 0) matchedOcs.add(ocIdx);
        }
      }
      // Also check title for outcome mentions
      if (matchedOcs.size === 0 && t.title) {
        for (let oc = 0; oc < outcomeCats.length; oc++) {
          if (OUTCOME_TAXONOMY[outcomeCats[oc]].some(term => t.title.toLowerCase().includes(term))) {
            matchedOcs.add(oc);
          }
        }
      }

      for (const ivIdx of matchedIvs) {
        for (const ocIdx of matchedOcs) {
          cells[ivIdx][ocIdx].count++;
          cells[ivIdx][ocIdx].trialIndices.push(i);
        }
      }
    }

    return {
      interventions: topIvs,
      outcomes: outcomeCats,
      cells,
      outcomeLabels: outcomeCats.map(k => {
        // Title case the taxonomy key
        return k.charAt(0).toUpperCase() + k.slice(1).replace(/([A-Z])/g, ' $1');
      })
    };
  }

  function computeVoidScores(matrix) {
    if (!matrix) return [];
    const { interventions, outcomes, cells } = matrix;
    const voids = [];

    for (let iv = 0; iv < interventions.length; iv++) {
      // Drug maturity: total trials across all outcomes
      let drugTotal = 0;
      for (let oc = 0; oc < outcomes.length; oc++) drugTotal += cells[iv][oc].count;

      for (let oc = 0; oc < outcomes.length; oc++) {
        if (cells[iv][oc].count > 0) continue; // Not a void

        // Outcome relevance: total trials for this outcome across all drugs
        let outcomeTotal = 0;
        for (let iv2 = 0; iv2 < interventions.length; iv2++) outcomeTotal += cells[iv2][oc].count;

        // Neighbor density: average of 4 neighbors (up/down/left/right)
        let neighborSum = 0, neighborCount = 0;
        if (iv > 0) { neighborSum += cells[iv - 1][oc].count; neighborCount++; }
        if (iv < interventions.length - 1) { neighborSum += cells[iv + 1][oc].count; neighborCount++; }
        if (oc > 0) { neighborSum += cells[iv][oc - 1].count; neighborCount++; }
        if (oc < outcomes.length - 1) { neighborSum += cells[iv][oc + 1].count; neighborCount++; }
        const neighborDensity = neighborCount > 0 ? neighborSum / neighborCount : 0;

        if (neighborDensity === 0 && drugTotal === 0) continue; // Not interesting

        const voidScore = neighborDensity * Math.log2(drugTotal + 1) * Math.log2(outcomeTotal + 1);
        if (voidScore > 0.5) {
          voids.push({
            ivIdx: iv, ocIdx: oc,
            intervention: interventions[iv],
            outcome: outcomes[oc],
            voidScore: Math.round(voidScore * 10) / 10,
            drugTotal, outcomeTotal, neighborDensity
          });
        }
      }
    }

    return voids.sort((a, b) => b.voidScore - a.voidScore);
  }
```

**Step 2: Commit**

```bash
git add metasprint-autopilot.html
git commit -m "feat(kitab): add Bayan evidence matrix builder and void scorer"
```

---

### Task 3b: Render the Bayan evidence matrix view

**Files:**
- Modify: `metasprint-autopilot.html` — add renderer + hook into view switch

**Step 1: Add `renderBayanMatrix()` function**

```javascript
  function renderBayanMatrix(trials) {
    _bayanMatrix = buildBayanMatrix(trials);
    if (!_bayanMatrix) return;

    const voids = computeVoidScores(_bayanMatrix);
    const { interventions, outcomeLabels, cells } = _bayanMatrix;
    const canvas = document.getElementById('matrixCanvas');
    if (!canvas) return;

    // Render as HTML table overlaid on the canvas container
    // (Reuse matrixCanvas's parent for insertion)
    let container = document.getElementById('bayanMatrixContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'bayanMatrixContainer';
      container.style.cssText = 'overflow:auto;max-height:600px;font-size:0.75rem';
      canvas.parentElement.insertBefore(container, canvas);
      canvas.style.display = 'none';
    }

    // Find max for color scaling
    let maxCount = 1;
    for (let iv = 0; iv < interventions.length; iv++) {
      for (let oc = 0; oc < outcomeLabels.length; oc++) {
        if (cells[iv][oc].count > maxCount) maxCount = cells[iv][oc].count;
      }
    }

    // Build void score lookup
    const voidLookup = {};
    for (const v of voids) voidLookup[v.ivIdx + ',' + v.ocIdx] = v;

    let html = '<table style="border-collapse:collapse;width:100%">';
    // Header
    html += '<thead><tr><th style="padding:4px 6px;position:sticky;top:0;background:var(--bg);z-index:1;text-align:left;min-width:120px">Intervention</th>';
    for (const ol of outcomeLabels) {
      html += '<th style="padding:4px 4px;position:sticky;top:0;background:var(--bg);z-index:1;writing-mode:vertical-rl;text-align:left;font-size:0.7rem;min-width:28px;max-width:36px">' + escapeHtml(ol) + '</th>';
    }
    html += '</tr></thead><tbody>';

    // Rows
    for (let iv = 0; iv < interventions.length; iv++) {
      html += '<tr>';
      html += '<td style="padding:3px 6px;border:1px solid var(--border);font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:150px" title="' + escapeHtml(interventions[iv]) + '">' + escapeHtml(interventions[iv]) + '</td>';
      for (let oc = 0; oc < outcomeLabels.length; oc++) {
        const count = cells[iv][oc].count;
        const voidInfo = voidLookup[iv + ',' + oc];
        let bg, fg, title;
        if (count > 0) {
          const intensity = Math.min(1, count / maxCount);
          const g = Math.round(180 + (1 - intensity) * 75);
          bg = 'rgb(' + Math.round(220 - intensity * 100) + ',' + g + ',' + Math.round(220 - intensity * 100) + ')';
          fg = intensity > 0.6 ? '#fff' : 'var(--text)';
          title = interventions[iv] + ' x ' + outcomeLabels[oc] + ': ' + count + ' trials';
        } else if (voidInfo) {
          bg = voidInfo.voidScore > 5 ? '#fca5a5' : voidInfo.voidScore > 2 ? '#fed7aa' : '#fef3c7';
          fg = '#92400e';
          title = 'VOID: ' + interventions[iv] + ' x ' + outcomeLabels[oc] + ' (score ' + voidInfo.voidScore + ')';
        } else {
          bg = 'var(--surface)';
          fg = 'var(--text-muted)';
          title = interventions[iv] + ' x ' + outcomeLabels[oc] + ': 0 trials';
        }
        html += '<td style="padding:2px;border:1px solid var(--border);text-align:center;background:' + bg + ';color:' + fg + ';cursor:pointer;min-width:28px" title="' + escapeHtml(title) + '" onclick="clickBayanCell(' + iv + ',' + oc + ',' + count + ')">';
        html += count > 0 ? count : (voidInfo ? '<span style="font-size:0.65rem">&#x25CB;</span>' : '');
        html += '</td>';
      }
      html += '</tr>';
    }
    html += '</tbody></table>';

    // Top voids list below matrix
    if (voids.length > 0) {
      html += '<div style="margin-top:12px;padding:8px;background:var(--surface);border-radius:6px">';
      html += '<div style="font-weight:600;font-size:0.82rem;margin-bottom:6px">Top Research Voids (Bayan)</div>';
      var topVoids = voids.slice(0, 10);
      for (var vi = 0; vi < topVoids.length; vi++) {
        var v = topVoids[vi];
        var vColor = v.voidScore > 5 ? '#dc2626' : v.voidScore > 2 ? '#d97706' : '#ca8a04';
        html += '<div style="display:flex;gap:8px;align-items:center;margin:3px 0;font-size:0.78rem">';
        html += '<span style="color:' + vColor + ';font-weight:600;min-width:30px">' + v.voidScore + '</span>';
        html += '<span>' + escapeHtml(v.intervention) + ' &times; ' + escapeHtml(v.outcome) + '</span>';
        html += '<span style="color:var(--text-muted);font-size:0.72rem">(' + v.drugTotal + ' trials for drug, ' + v.outcomeTotal + ' for outcome)</span>';
        html += '</div>';
      }
      html += '</div>';
    }

    container.innerHTML = html;
  }

  function clickBayanCell(ivIdx, ocIdx, count) {
    if (!_bayanMatrix) return;
    var iv = _bayanMatrix.interventions[ivIdx];
    var oc = _bayanMatrix.outcomes[ocIdx];
    if (count > 0) {
      // Filter Ayat to this drug+outcome pair
      var input = document.getElementById('fihrisSearch');
      if (input) { input.value = iv + ' ' + oc; executeFihrisSearch(iv + ' ' + oc); }
      switchUniverseView('ayat');
    } else {
      // Show void details in drill-down
      var voids = computeVoidScores(_bayanMatrix);
      var match = voids.find(function(v) { return v.ivIdx === ivIdx && v.ocIdx === ocIdx; });
      var html = '<div style="text-align:center;padding:16px">';
      html += '<div style="font-size:1.2rem;font-weight:700;color:#d97706;margin-bottom:8px">Research Void Detected</div>';
      html += '<div style="font-size:0.9rem"><strong>' + escapeHtml(iv) + '</strong> &times; <strong>' + escapeHtml(oc) + '</strong></div>';
      if (match) {
        html += '<div style="margin-top:8px;font-size:0.82rem;color:var(--text-muted)">Void score: ' + match.voidScore + '</div>';
        html += '<div style="font-size:0.82rem;color:var(--text-muted)">This drug has ' + match.drugTotal + ' trials for other outcomes.</div>';
        html += '<div style="font-size:0.82rem;color:var(--text-muted)">This outcome has ' + match.outcomeTotal + ' trials with other drugs.</div>';
      }
      html += '<div style="margin-top:12px;font-size:0.82rem">No trials study this combination despite strong evidence in neighboring cells.</div>';
      html += '</div>';
      showDrillDownPanel('Research Void: ' + iv + ' x ' + oc, html);
    }
  }
```

**Step 2: Hook into view switch**

In `switchUniverseView()` (~line 11403), in the `switch` block, add a case for `'matrix'`. Find the existing matrix case (if any) or add before `default`:

```javascript
      case 'matrix': renderBayanMatrix(trials); break;
```

If a `case 'matrix'` already exists, replace its body with `renderBayanMatrix(trials); break;`.

**Step 3: Commit**

```bash
git add metasprint-autopilot.html
git commit -m "feat(kitab): add Bayan evidence matrix view with void scoring and top voids list"
```

---

## Task 4: Hukm — Evidence Verdicts (Layer 4)

### Task 4a: Verdict computation engine

**Files:**
- Modify: `metasprint-autopilot.html` — insert after Bayan functions

**Step 1: Add `computeHukm()` and `computeAllHukm()` functions**

```javascript
  // ============================================================
  // LAYER 4: HUKM (Judgment) — Evidence Verdicts
  // ============================================================

  function computeHukm(node, alBurhanClusters) {
    const signals = {};

    // Trial volume
    const tc = node.trialCount || 0;
    signals.trialVolume = tc > 15 ? 'high' : tc > 5 ? 'moderate' : 'low';

    // Phase maturity
    const phases = node.phases || {};
    const totalPhased = (phases[1] || 0) + (phases[2] || 0) + (phases[3] || 0) + (phases[4] || 0);
    const latePhaseFrac = totalPhased > 0 ? ((phases[3] || 0) + (phases[4] || 0)) / totalPhased : 0;
    signals.phaseMaturity = latePhaseFrac > 0.5 ? 'mature' : latePhaseFrac > 0.2 ? 'emerging' : 'early';

    // Recent activity
    const recent = node.recentCount || 0;
    signals.recentActivity = recent > 3 ? 'active' : recent > 0 ? 'stale' : 'dormant';

    // Enrollment mass
    const enr = node.enrollment || 0;
    signals.enrollmentMass = enr > 5000 ? 'large' : enr > 1000 ? 'medium' : 'small';

    // Outcome consistency (from Al-Burhan if available)
    signals.outcomeConsistency = 'unknown';
    let matchedCluster = null;
    if (alBurhanClusters) {
      // Try to find an Al-Burhan cluster matching this node's intervention
      const nodeLabelLow = (node.label || '').toLowerCase();
      const nodeScId = node.subcatId || '';
      matchedCluster = alBurhanClusters.find(c => {
        const clsLow = (c.drug_class || '').toLowerCase();
        return c.subcategory === nodeScId && (clsLow.includes(nodeLabelLow) || nodeLabelLow.includes(clsLow));
      });
      if (matchedCluster && matchedCluster.pooled) {
        const i2 = matchedCluster.pooled.i2 ?? null;
        if (i2 != null) {
          signals.outcomeConsistency = i2 > 75 ? 'contradictory' : i2 > 50 ? 'mixed' : 'consistent';
        }
      }
    }

    // Compute verdict
    let verdict, confidence, reasoning;

    if (signals.outcomeConsistency === 'contradictory') {
      verdict = 'CONTRADICTORY';
      confidence = 0.85;
      reasoning = 'High heterogeneity (I\u00B2>' + (matchedCluster?.pooled?.i2 ?? '75') + '%) suggests conflicting evidence across trials.';
    } else if (tc < 3 && signals.recentActivity === 'dormant') {
      verdict = 'DESERT';
      confidence = 0.90;
      reasoning = 'Fewer than 3 trials with no recent activity. This area is an evidence desert.';
    } else if (signals.phaseMaturity === 'mature' && tc > 10 && enr > 5000 && signals.outcomeConsistency !== 'mixed') {
      verdict = 'SUFFICIENT';
      confidence = 0.88;
      reasoning = 'Mature Phase 3/4 evidence (' + tc + ' trials, ' + enr.toLocaleString() + ' patients) with consistent outcomes.';
    } else if (tc >= 5 && signals.recentActivity === 'active') {
      verdict = 'GROWING';
      confidence = 0.75;
      reasoning = 'Active research frontier (' + recent + ' recent trials). Evidence is accumulating.';
    } else {
      verdict = 'INCONCLUSIVE';
      confidence = 0.65;
      reasoning = tc > 5
        ? 'Mostly early-phase trials or insufficient enrollment to draw conclusions.'
        : 'Too few trials (' + tc + ') to assess evidence maturity.';
    }

    return { verdict, confidence, signals, reasoning };
  }

  function computeAllHukm(ayatNodes) {
    const alBurhanClusters = (typeof EMBEDDED_AL_BURHAN_DATA !== 'undefined' && EMBEDDED_AL_BURHAN_DATA.clusters)
      ? EMBEDDED_AL_BURHAN_DATA.clusters : null;

    _hukmVerdicts = new Map();
    for (const node of ayatNodes) {
      _hukmVerdicts.set(node.id, computeHukm(node, alBurhanClusters));
    }
    return _hukmVerdicts;
  }

  const HUKM_ICONS = {
    SUFFICIENT:    { symbol: '\u2713', color: '#22c55e' },  // checkmark
    GROWING:       { symbol: '\u2191', color: '#3b82f6' },  // up arrow
    INCONCLUSIVE:  { symbol: '?',      color: '#f59e0b' },  // question mark
    CONTRADICTORY: { symbol: '!',      color: '#ef4444' },  // exclamation
    DESERT:        { symbol: '\u25CB', color: '#9ca3af' }   // empty circle
  };
```

**Step 2: Commit**

```bash
git add metasprint-autopilot.html
git commit -m "feat(kitab): add Hukm verdict computation engine"
```

---

### Task 4b: Render verdict badges on Ayat glyphs

**Files:**
- Modify: `metasprint-autopilot.html`
  - `renderAyatGlyph()` — add verdict badge at LOD 2+
  - `render()` in `renderAyatUniverseOnCanvas()` — add verdict summary bar
  - `renderAyatUniverse()` — trigger verdict computation

**Step 1: Add verdict badge rendering to `renderAyatGlyph`**

In `renderAyatGlyph()`, find the end of the LOD 3 block (after the phase legend at bottom). Before the final closing `}` of the function, add:

```javascript
    // Hukm verdict badge (LOD 2+)
    if (_kitabLayers.verdicts && lod >= 2) {
      const hukm = _hukmVerdicts.get(node.id);
      if (hukm) {
        const icon = HUKM_ICONS[hukm.verdict] || HUKM_ICONS.INCONCLUSIVE;
        const bx = x - r * 0.65, by = y + r * 0.55;
        ctx.beginPath();
        ctx.arc(bx, by, 5, 0, Math.PI * 2);
        ctx.fillStyle = icon.color;
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 7px system-ui';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(icon.symbol, bx, by);
      }
    }
```

**Step 2: Add verdict summary to HUD**

Find `renderUniverseHUD` function. At the end of the HUD rendering (before the function closes), add:

```javascript
    // Hukm verdict summary (if enabled)
    if (_kitabLayers.verdicts && _hukmVerdicts.size > 0) {
      const counts = { SUFFICIENT: 0, GROWING: 0, INCONCLUSIVE: 0, CONTRADICTORY: 0, DESERT: 0 };
      for (const [, v] of _hukmVerdicts) counts[v.verdict]++;
      const labels = Object.entries(counts).filter(([, c]) => c > 0);
      let hx = 10;
      ctx.font = '9px system-ui';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      for (const [verdict, count] of labels) {
        const icon = HUKM_ICONS[verdict];
        ctx.fillStyle = icon.color;
        ctx.fillRect(hx, H - 18, 8, 8);
        ctx.fillStyle = tc.text;
        ctx.fillText(verdict[0] + ': ' + count, hx + 10, H - 18);
        hx += ctx.measureText(verdict[0] + ': ' + count).width + 18;
      }
    }
```

**Step 3: Trigger Hukm computation in `renderAyatUniverse`**

After `_tafsirLinks = computeTafsirLinks(clusters);` (from Task 2b Step 3), add:

```javascript
        computeAllHukm(clusters);
```

**Step 4: Add verdict section to `drillDownAyatNode`**

In `drillDownAyatNode()`, at the very start of the HTML build (after `var html = '<div...'` line), insert:

```javascript
    // Hukm verdict banner
    var hukm = _hukmVerdicts.get(node.id);
    if (hukm) {
      var icon = HUKM_ICONS[hukm.verdict] || HUKM_ICONS.INCONCLUSIVE;
      html += '<div style="margin-bottom:10px;padding:8px 12px;border-radius:6px;background:' + icon.color + '18;border-left:4px solid ' + icon.color + '">';
      html += '<div style="font-weight:700;color:' + icon.color + ';font-size:0.85rem">Hukm: ' + escapeHtml(hukm.verdict) + '</div>';
      html += '<div style="font-size:0.78rem;color:var(--text-muted);margin-top:2px">' + escapeHtml(hukm.reasoning) + '</div>';
      html += '<div style="font-size:0.72rem;color:var(--text-muted);margin-top:4px">';
      html += 'Volume: ' + hukm.signals.trialVolume + ' | Phase: ' + hukm.signals.phaseMaturity;
      html += ' | Activity: ' + hukm.signals.recentActivity + ' | Enrollment: ' + hukm.signals.enrollmentMass;
      if (hukm.signals.outcomeConsistency !== 'unknown') html += ' | Consistency: ' + hukm.signals.outcomeConsistency;
      html += '</div></div>';
    }
```

**Step 5: Commit**

```bash
git add metasprint-autopilot.html
git commit -m "feat(kitab): render Hukm verdict badges, HUD summary, and drill-down panels"
```

---

## Task 5: Final Integration & Verification

**Files:**
- Modify: `metasprint-autopilot.html` — minor wiring

**Step 1: Verify all cache population sites trigger index build**

Check all three sites where `universeTrialsCache` is assigned (~lines 3807, 18670, 18712). Ensure each has the Fihris index build call added in Task 1c Step 1. If the other two sites (18670, 18712) don't yet have it, add:

```javascript
        _fihrisIndex = buildFihrisIndex(trials || universeTrialsCache, null);
```

**Step 2: Verify div balance**

```bash
cd "C:\Users\user\Downloads\metasprint-autopilot" && python -c "
import re
with open('metasprint-autopilot.html','r',encoding='utf-8') as f:
    content=f.read()
opens=len(re.findall(r'<div[\s>]',content))
closes=len(re.findall(r'</div>',content))
print(f'Divs: {opens}/{closes} - {\"OK\" if opens==closes else \"MISMATCH\"}')"
```

Expected: `Divs: XXX/XXX - OK`

**Step 3: Verify no literal `</script>` in JS**

```bash
python -c "
lines=open('metasprint-autopilot.html','r',encoding='utf-8').readlines()
for i,l in enumerate(lines,1):
    s=l.strip()
    if '</script>' in l and not s.startswith('</script>') and s!='</script>':
        print(f'Line {i}: {s[:120]}')"
```

Expected: no output.

**Step 4: Run existing test suite**

```bash
cd "C:\Users\user\Downloads\metasprint-autopilot" && python run_all_tests.py
```

Expected: 313 tests pass (no regressions).

**Step 5: Manual smoke test**

1. Open `metasprint-autopilot.html` in browser
2. Load universe (pick a subcategory or load cached)
3. Switch to Ayat view → verify normal rendering
4. Type "SGLT2" in search bar → verify matching nodes highlight, others dim
5. Clear search → verify all nodes restore
6. Check "Cross-refs" checkbox → verify dashed edges appear between subcategories
7. Check "Verdicts" checkbox → verify small colored badges appear on nodes at zoom
8. Switch to Matrix view → verify heatmap renders with colored cells and void indicators
9. Click a void cell → verify drill-down panel shows "Research Void Detected"
10. Click a non-empty cell → verify it switches to Ayat view with that search

**Step 6: Final commit**

```bash
git add metasprint-autopilot.html
git commit -m "feat(kitab): Kitab al-Ayat complete — Fihris search, Tafsir cross-refs, Bayan void matrix, Hukm verdicts"
```

---

## Summary

| Task | Layer | Functions Added | Estimated Lines |
|------|-------|----------------|-----------------|
| 0 | Shared | `OUTCOME_TAXONOMY`, `classifyOutcome()`, state vars | ~50 |
| 1a | Fihris | `buildFihrisIndex()`, `queryFihris()` | ~100 |
| 1b | Fihris | Search UI HTML, `debounceFihrisSearch()`, `executeFihrisSearch()`, `clearFihrisSearch()` | ~80 |
| 1c | Fihris | Render integration (highlighting, dimming) | ~30 |
| 2a | Tafsir | `computeTafsirLinks()` | ~50 |
| 2b | Tafsir | `renderTafsirEdges()`, drill-down "Related Signs" | ~60 |
| 3a | Bayan | `buildBayanMatrix()`, `computeVoidScores()` | ~100 |
| 3b | Bayan | `renderBayanMatrix()`, `clickBayanCell()` | ~100 |
| 4a | Hukm | `computeHukm()`, `computeAllHukm()`, `HUKM_ICONS` | ~80 |
| 4b | Hukm | Glyph badges, HUD summary, drill-down verdict panel | ~60 |
| 5 | Final | Wiring, verification | ~10 |
| **Total** | | | **~720 lines** |
