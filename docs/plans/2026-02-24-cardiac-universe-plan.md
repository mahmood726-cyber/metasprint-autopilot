# Cardiac Universe & Gap Finder Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform MetaSprint Autopilot from a general-purpose SR tool into a cardiology-focused meta-analysis engine with a pre-loaded trial universe, network graph visualization, gap-score-driven opportunity discovery, and optional RCT Extractor integration.

**Architecture:** Pre-bundled cardiac trial universe (~40-60K trials from CT.gov) stored in IndexedDB, classified into 10 cardiovascular subcategories. A force-directed network graph renders subcategories as connected nodes (edges = shared interventions). Gap scores (RCTs vs recent MAs) drive the primary discovery workflow. The analysis engine, validation suite, and sprint framework are unchanged.

**Tech Stack:** Single-file HTML + embedded CSS/JS. Pure SVG for network graph. IndexedDB for universe storage. CT.gov API v2 for delta updates. PubMed E-utilities for MA counts. Optional: RCT Extractor v2 FastAPI at localhost:8000.

**Key file:** `C:\Users\user\Downloads\metasprint-autopilot\metasprint-autopilot.html` (currently 4,460 lines)

**Validation:** `C:\Users\user\Downloads\metasprint-autopilot\validation\test_features.py` (18 tests, must stay 18/18)

**Integrity checks after every task:**
```bash
python -c "
import re
with open('C:/Users/user/Downloads/metasprint-autopilot/metasprint-autopilot.html','r',encoding='utf-8') as f:
    content = f.read()
script_start = content.find('<script>')
script_end = content.find('</script>')
html_part = content[:script_start] + content[script_end:]
opens = len(re.findall(r'<div[\s>]', html_part))
closes = len(re.findall(r'</div>', html_part))
print(f'Divs: {opens}/{closes} diff={opens-closes}')
js_part = content[script_start:script_end]
print(f'Literal </script> in JS: {js_part.count(\"</script>\")}')
funcs = re.findall(r'function\s+(\w+)\s*\(', content)
from collections import Counter
dupes = {k:v for k,v in Counter(funcs).items() if v > 1}
print(f'Duplicate funcs: {dupes if dupes else \"none\"}')
print(f'Lines: {content.count(chr(10))+1}')
"
```

---

## Task 1: Cardiac Subcategory Taxonomy & Classification Engine

**What:** Add the cardiovascular subcategory taxonomy and a function that classifies any CT.gov trial into one of 10 cardiac clusters based on its conditions and interventions.

**Files:**
- Modify: `metasprint-autopilot.html` (add JS after the existing `SPRINT_PHASES` constants block, ~line 1008)

**Step 1: Add taxonomy constants and classifier function**

Add after the `ROB2_DOMAINS` constant (after line 1149):

```javascript
// ============================================================
// CARDIAC UNIVERSE — Subcategory Taxonomy
// ============================================================
const CARDIO_SUBCATEGORIES = [
  {
    id: 'hf', label: 'Heart Failure',
    keywords: ['heart failure', 'hfref', 'hfpef', 'hfmref', 'cardiomyopathy', 'lvef',
               'left ventricular', 'cardiac failure', 'congestive heart', 'ejection fraction',
               'sacubitril', 'entresto', 'sglt2', 'dapagliflozin', 'empagliflozin'],
    color: '#ef4444', meshTerms: ['Heart Failure']
  },
  {
    id: 'acs', label: 'ACS / Coronary',
    keywords: ['acute coronary', 'myocardial infarction', 'stemi', 'nstemi', 'unstable angina',
               'percutaneous coronary', 'pci', 'cabg', 'coronary artery disease', 'acs',
               'troponin', 'angioplasty', 'stent', 'coronary bypass', 'angina pectoris'],
    color: '#f97316', meshTerms: ['Acute Coronary Syndrome', 'Myocardial Infarction', 'Coronary Artery Disease']
  },
  {
    id: 'af', label: 'Atrial Fibrillation',
    keywords: ['atrial fibrillation', 'atrial flutter', 'af ablation', 'anticoagul',
               'apixaban', 'rivaroxaban', 'edoxaban', 'dabigatran', 'doac', 'noac',
               'stroke prevention', 'left atrial appendage'],
    color: '#a855f7', meshTerms: ['Atrial Fibrillation']
  },
  {
    id: 'htn', label: 'Hypertension',
    keywords: ['hypertension', 'blood pressure', 'antihypertensive', 'resistant hypertension',
               'amlodipine', 'losartan', 'valsartan', 'ace inhibitor', 'arb',
               'calcium channel', 'diuretic', 'renal denervation', 'pulmonary hypertension'],
    color: '#3b82f6', meshTerms: ['Hypertension']
  },
  {
    id: 'valve', label: 'Valve Disease',
    keywords: ['aortic stenosis', 'mitral regurgitation', 'tavr', 'tavi', 'savr',
               'transcatheter aortic', 'mitraclip', 'valve replacement', 'valve repair',
               'prosthetic valve', 'tricuspid', 'endocarditis'],
    color: '#ec4899', meshTerms: ['Heart Valve Diseases', 'Aortic Valve Stenosis']
  },
  {
    id: 'pad', label: 'PAD / Vascular',
    keywords: ['peripheral artery', 'peripheral arterial', 'claudication', 'critical limb',
               'aortic aneurysm', 'carotid', 'endovascular', 'pad', 'pvd',
               'intermittent claudication', 'limb ischemia'],
    color: '#14b8a6', meshTerms: ['Peripheral Arterial Disease']
  },
  {
    id: 'lipids', label: 'Lipids / Prevention',
    keywords: ['cholesterol', 'ldl', 'statin', 'pcsk9', 'lipid lowering', 'dyslipidemia',
               'hyperlipidemia', 'atherosclerosis', 'cardiovascular prevention',
               'ezetimibe', 'inclisiran', 'bempedoic'],
    color: '#eab308', meshTerms: ['Dyslipidemias', 'Hypercholesterolemia']
  },
  {
    id: 'rhythm', label: 'Heart Rhythm',
    keywords: ['ventricular tachycardia', 'sudden cardiac', 'icd', 'implantable cardioverter',
               'cardiac resynchronization', 'crt', 'pacemaker', 'ablation',
               'supraventricular', 'bradycardia', 'arrhythmia'],
    color: '#6366f1', meshTerms: ['Arrhythmias, Cardiac']
  },
  {
    id: 'ph', label: 'Pulmonary Hypertension',
    keywords: ['pulmonary arterial hypertension', 'pah', 'pulmonary hypertension',
               'right ventricular', 'bosentan', 'ambrisentan', 'sildenafil', 'tadalafil',
               'riociguat', 'selexipag', 'macitentan'],
    color: '#0ea5e9', meshTerms: ['Hypertension, Pulmonary']
  },
  {
    id: 'general', label: 'General CV',
    keywords: ['cardiovascular', 'cardiac', 'heart disease'],
    color: '#64748b', meshTerms: ['Cardiovascular Diseases']
  }
];

function classifyTrial(trial) {
  const text = [
    ...(trial.conditions || []),
    ...(trial.interventions || []).map(iv => iv.name),
    trial.title || ''
  ].join(' ').toLowerCase();

  let bestId = 'general', bestScore = 0;
  for (const cat of CARDIO_SUBCATEGORIES) {
    if (cat.id === 'general') continue;
    let score = 0;
    for (const kw of cat.keywords) {
      if (text.includes(kw)) score += (kw.length > 5 ? 2 : 1);
    }
    if (score > bestScore) { bestScore = score; bestId = cat.id; }
  }
  return bestId;
}

function getSubcategory(id) {
  return CARDIO_SUBCATEGORIES.find(c => c.id === id) || CARDIO_SUBCATEGORIES[9];
}
```

**Step 2: Run integrity checks**

Run the integrity check script above. Expected: divs balanced, 0 literal `</script>`, no duplicate functions.

**Step 3: Run feature tests**

```bash
cd C:/Users/user/Downloads/metasprint-autopilot/validation && python test_features.py
```
Expected: 18/18 pass

---

## Task 2: Universe IndexedDB Store & Delta Update Engine

**What:** Add a `universe` IndexedDB object store, a bulk-load function, and a delta-update function that fetches new cardiac trials from CT.gov since last update.

**Files:**
- Modify: `metasprint-autopilot.html`
  - IndexedDB schema (`initDB`, ~line 1601): bump DB_VERSION to 2, add `universe` store
  - Add universe loading functions after the project management section (~line 1744)

**Step 1: Update IndexedDB schema**

Change `DB_VERSION` from 1 to 2 and add universe store in `onupgradeneeded`:

```javascript
const DB_VERSION = 2;
// ... in onupgradeneeded:
if (!database.objectStoreNames.contains('universe')) {
  const store = database.createObjectStore('universe', { keyPath: 'nctId' });
  store.createIndex('subcategory', 'subcategory', { unique: false });
  store.createIndex('startYear', 'startYear', { unique: false });
}
```

**Step 2: Add universe loader functions**

```javascript
// ============================================================
// CARDIAC UNIVERSE — Data Loading & Delta Updates
// ============================================================
const UNIVERSE_META_KEY = 'msa-universe-meta';

function getUniverseMeta() {
  try {
    return JSON.parse(localStorage.getItem(UNIVERSE_META_KEY) || '{}');
  } catch(e) { return {}; }
}

function setUniverseMeta(meta) {
  localStorage.setItem(UNIVERSE_META_KEY, JSON.stringify(meta));
}

async function getUniverseCount() {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('universe', 'readonly');
    const req = tx.objectStore('universe').count();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function getAllUniverseTrials() {
  return idbGetAll('universe');
}

async function getUniverseBySubcategory(subcatId) {
  return idbGetAll('universe', 'subcategory', subcatId);
}

// Fetch cardiac RCTs from CT.gov and store in universe
async function fetchCardiacUniverse(sinceDate) {
  const conditions = CARDIO_SUBCATEGORIES
    .filter(c => c.id !== 'general')
    .flatMap(c => c.meshTerms);

  const allTrials = [];
  const seenNCT = new Set();

  // Fetch per MeSH term to get good coverage
  for (const mesh of conditions) {
    let pageToken = null;
    let page = 0;
    do {
      const params = new URLSearchParams({
        'query.cond': mesh,
        'query.term': 'AREA[StudyType]INTERVENTIONAL AND AREA[DesignAllocation]RANDOMIZED',
        'pageSize': '1000',
        'countTotal': 'true'
      });
      if (sinceDate) params.set('filter.advanced', 'AREA[StartDate]RANGE[' + sinceDate + ', MAX]');
      if (pageToken) params.set('pageToken', pageToken);

      try {
        const resp = await rateLimitedFetch(
          'https://clinicaltrials.gov/api/v2/studies?' + params, 'ctgov'
        );
        const data = await resp.json();
        const studies = data.studies || [];
        pageToken = data.nextPageToken || null;
        page++;

        for (const s of studies) {
          const p = s.protocolSection || {};
          const nctId = p.identificationModule?.nctId || '';
          if (!nctId || seenNCT.has(nctId)) continue;
          seenNCT.add(nctId);

          const conditions = p.conditionsModule?.conditions || [];
          const rawIv = p.armsInterventionsModule?.interventions || [];
          const interventions = rawIv.map(iv => ({ name: iv.name || '', type: iv.type || '' }));
          const arms = (p.armsInterventionsModule?.armGroups || []).map(a => ({
            label: a.label || '', type: a.type || ''
          }));
          const primaryOutcomes = (p.outcomesModule?.primaryOutcomes || []).map(o => o.measure || '');
          const startYear = parseInt(p.statusModule?.startDateStruct?.date?.substring(0, 4) || '0');

          const trial = {
            nctId, conditions, interventions, arms, primaryOutcomes, startYear,
            title: p.identificationModule?.officialTitle || p.identificationModule?.briefTitle || '',
            status: p.statusModule?.overallStatus || '',
            enrollment: p.designModule?.enrollmentInfo?.count || 0,
            phase: (p.designModule?.phases || []).join(', ')
          };
          trial.subcategory = classifyTrial(trial);
          allTrials.push(trial);
        }
      } catch (err) {
        console.warn('CT.gov fetch error for', mesh, ':', err.message);
        pageToken = null; // stop pagination on error
      }
    } while (pageToken && page < 10);
  }

  // Bulk write to IndexedDB
  if (allTrials.length > 0) {
    const tx = db.transaction('universe', 'readwrite');
    const store = tx.objectStore('universe');
    for (const t of allTrials) store.put(t);
    await new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  }

  return allTrials.length;
}

// Delta update: fetch only new trials since last update
async function updateCardiacUniverse(statusCallback) {
  const meta = getUniverseMeta();
  const count = await getUniverseCount();
  const now = new Date().toISOString().split('T')[0];

  if (count === 0) {
    // First load: full fetch
    if (statusCallback) statusCallback('Loading cardiac trial universe (first time, may take 2-3 minutes)...');
    const added = await fetchCardiacUniverse(null);
    setUniverseMeta({ lastUpdate: now, totalCount: added });
    if (statusCallback) statusCallback('Loaded ' + added + ' cardiac RCTs');
    return added;
  }

  // Check staleness (7 days)
  if (meta.lastUpdate) {
    const lastDate = new Date(meta.lastUpdate);
    const daysSince = (Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince < 7) {
      if (statusCallback) statusCallback(count + ' cardiac RCTs (updated ' + meta.lastUpdate + ')');
      return 0;
    }
  }

  // Delta fetch
  if (statusCallback) statusCallback('Updating cardiac universe...');
  const sinceDate = meta.lastUpdate || '2020-01-01';
  const added = await fetchCardiacUniverse(sinceDate);
  const newCount = await getUniverseCount();
  setUniverseMeta({ lastUpdate: now, totalCount: newCount });
  if (statusCallback) statusCallback(newCount + ' cardiac RCTs (+' + added + ' new)');
  return added;
}
```

**Step 3: Run integrity checks + feature tests**

Expected: divs balanced, no `</script>`, no duplicate functions, 18/18 tests pass.

---

## Task 3: Gap Score Engine (PubMed MA Cross-Reference)

**What:** For each subcategory, query PubMed for recent systematic reviews/meta-analyses. Compute gap scores. Cache results.

**Files:**
- Modify: `metasprint-autopilot.html` (add after universe functions)

**Step 1: Add gap score functions**

```javascript
// ============================================================
// GAP SCORE ENGINE — RCTs vs Meta-Analyses
// ============================================================
const GAP_CACHE_KEY = 'msa-gap-cache';
const GAP_CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

function getGapCache() {
  try {
    const raw = localStorage.getItem(GAP_CACHE_KEY);
    if (!raw) return {};
    const cache = JSON.parse(raw);
    if (Date.now() - (cache._timestamp || 0) > GAP_CACHE_TTL) return {};
    return cache;
  } catch(e) { return {}; }
}

function setGapCache(cache) {
  cache._timestamp = Date.now();
  localStorage.setItem(GAP_CACHE_KEY, JSON.stringify(cache));
}

async function fetchMACountForCategory(cat) {
  // Query PubMed for systematic reviews in this category (last 5 years)
  const meshQuery = cat.meshTerms.map(m => '"' + m + '"[MeSH Terms]').join(' OR ');
  const query = '(' + meshQuery + ') AND ("systematic review"[Publication Type] OR "meta-analysis"[Publication Type])';
  const fiveYearsAgo = (new Date().getFullYear() - 5) + '/01/01';
  const url = PUBMED_BASE + 'esearch.fcgi?db=pubmed&term=' + encodeURIComponent(query) +
    '&mindate=' + fiveYearsAgo + '&datetype=pdat&retmode=json&retmax=0';
  try {
    const resp = await rateLimitedFetch(url, 'pubmed');
    const data = await resp.json();
    return parseInt(data.esearchresult?.count || '0');
  } catch(e) { return 0; }
}

async function computeAllGapScores(universeTrials, statusCallback) {
  const cache = getGapCache();
  const results = {};
  const currentYear = new Date().getFullYear();

  // Group trials by subcategory
  const bySubcat = {};
  for (const t of universeTrials) {
    const sc = t.subcategory || 'general';
    if (!bySubcat[sc]) bySubcat[sc] = [];
    bySubcat[sc].push(t);
  }

  const cats = CARDIO_SUBCATEGORIES.filter(c => c.id !== 'general');
  for (let i = 0; i < cats.length; i++) {
    const cat = cats[i];
    if (statusCallback) statusCallback('Computing gaps: ' + cat.label + ' (' + (i+1) + '/' + cats.length + ')');

    const trials = bySubcat[cat.id] || [];
    const recentRCTs = trials.filter(t => t.startYear >= currentYear - 3).length;
    const totalRCTs = trials.length;

    // Use cache if available
    let maCount;
    if (cache[cat.id] !== undefined && cache[cat.id] !== null) {
      maCount = cache[cat.id];
    } else {
      maCount = await fetchMACountForCategory(cat);
      cache[cat.id] = maCount;
    }

    // Gap score: high recentRCTs + low MA count = opportunity
    const gapScore = totalRCTs > 0
      ? (recentRCTs * Math.log2(totalRCTs + 1)) / (maCount + 1)
      : 0;

    results[cat.id] = {
      totalRCTs, recentRCTs, maCount, gapScore,
      totalEnrollment: trials.reduce((a, t) => a + (t.enrollment || 0), 0),
      topInterventions: tallyTopN(trials.flatMap(t => (t.interventions || []).map(iv => iv.name)), 5),
      topOutcomes: tallyTopN(trials.flatMap(t => t.primaryOutcomes || []), 5),
      opportunity: gapScore > 10 ? 'HIGH' : gapScore > 3 ? 'MODERATE' : 'LOW'
    };
  }

  setGapCache(cache);
  return results;
}

function tallyTopN(items, n) {
  const counts = {};
  for (const item of items) {
    const key = (item || '').trim().toLowerCase().slice(0, 60);
    if (key.length < 3) continue;
    counts[key] = (counts[key] || 0) + 1;
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([name, count]) => ({ name, count }));
}
```

**Step 2: Run integrity checks + feature tests**

---

## Task 4: Network Graph Visualization (SVG Force-Directed)

**What:** Replace the text-search Discover tab with a force-directed network graph. Nodes = subcategories. Edges = shared interventions. Gap score controls glow intensity.

**Files:**
- Modify: `metasprint-autopilot.html`
  - CSS: Add network graph styles (~line 312, after existing universe styles)
  - HTML: Replace discover phase content (~line 700)
  - JS: Add force-directed layout engine + rendering

**Step 1: Add CSS for network graph**

Add after the existing `.bubble:hover` style:

```css
/* --- Cardiac Universe Network Graph --- */
.universe-panel {
  background: #0f172a;
  border-radius: var(--radius);
  padding: 20px;
  margin-bottom: 16px;
  position: relative;
  overflow: hidden;
}
.universe-panel::before {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; bottom: 0;
  background: radial-gradient(ellipse at center, rgba(99,102,241,0.08) 0%, transparent 70%);
  pointer-events: none;
}
.universe-title {
  color: #e2e8f0; font-size: 1.1rem; font-weight: 700;
  margin-bottom: 4px; position: relative;
}
.universe-subtitle {
  color: #94a3b8; font-size: 0.82rem; margin-bottom: 16px; position: relative;
}
.network-svg {
  width: 100%; cursor: grab; position: relative;
}
.network-svg:active { cursor: grabbing; }
.node-label {
  fill: #e2e8f0; font-size: 10px; text-anchor: middle;
  pointer-events: none; font-weight: 600;
}
.node-count {
  fill: #94a3b8; font-size: 8px; text-anchor: middle; pointer-events: none;
}
.node-glow {
  animation: nodePulse 3s ease-in-out infinite;
}
@keyframes nodePulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.7; }
}
.edge-line {
  stroke: rgba(148,163,184,0.2); stroke-width: 1;
}
.node-ring-opportunity {
  fill: none; stroke: #eab308; stroke-width: 2.5;
  stroke-dasharray: 4 2; animation: ringRotate 8s linear infinite;
}
@keyframes ringRotate {
  from { stroke-dashoffset: 0; } to { stroke-dashoffset: 24; }
}
.opportunity-banner {
  background: linear-gradient(135deg, #1e1b4b, #312e81);
  border: 1px solid #4338ca; border-radius: var(--radius);
  padding: 14px 18px; margin-bottom: 16px;
}
.opportunity-banner h3 { color: #c7d2fe; font-size: 0.95rem; margin-bottom: 8px; }
.opportunity-item {
  display: flex; align-items: center; gap: 10px; padding: 6px 0;
  border-bottom: 1px solid rgba(99,102,241,0.15);
  color: #e2e8f0; font-size: 0.85rem;
}
.opportunity-item:last-child { border-bottom: none; }
.opp-score {
  background: #dc2626; color: #fff; padding: 2px 8px; border-radius: 999px;
  font-size: 0.7rem; font-weight: 700; white-space: nowrap;
}
.opp-score.moderate { background: #d97706; }
.opp-score.low { background: #64748b; }
.opp-start-btn {
  margin-left: auto; padding: 4px 12px; font-size: 0.75rem;
  background: #4f46e5; color: #fff; border: none; border-radius: var(--radius);
  cursor: pointer;
}
.opp-start-btn:hover { background: #4338ca; }

/* Network tooltip */
.network-tooltip {
  position: absolute; background: #1e293b; color: #e2e8f0;
  border: 1px solid #334155; border-radius: 6px; padding: 10px 14px;
  font-size: 0.8rem; pointer-events: none; z-index: 10;
  max-width: 260px; display: none; line-height: 1.4;
}
.network-tooltip.visible { display: block; }
.network-tooltip h4 { font-size: 0.85rem; margin-bottom: 4px; }
.network-tooltip .tt-stat { color: #94a3b8; font-size: 0.75rem; }
```

**Step 2: Replace Discover phase HTML**

Replace the entire `<section id="phase-discover">` content with:

```html
<section id="phase-discover" class="phase" role="tabpanel" aria-labelledby="tab-discover" tabindex="-1">
  <div id="opportunityBanner" class="opportunity-banner" style="display:none"></div>
  <div class="universe-panel" id="universePanel">
    <div class="universe-title">Cardiovascular RCT Universe</div>
    <div class="universe-subtitle" id="universeStatus">Loading...</div>
    <svg id="networkSvg" class="network-svg" viewBox="0 0 800 500"
         role="img" aria-label="Network graph of cardiovascular trial subcategories"></svg>
    <div class="network-tooltip" id="networkTooltip"></div>
  </div>
  <div id="universeControls" style="display:none;margin-bottom:12px">
    <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
      <button class="filter-btn active" onclick="sortUniverse('gap',this)">Top Opportunities</button>
      <button class="filter-btn" onclick="sortUniverse('recent',this)">Most Recent</button>
      <button class="filter-btn" onclick="sortUniverse('count',this)">Most RCTs</button>
      <span class="text-muted" style="margin-left:auto;font-size:0.8rem" id="universeStats"></span>
    </div>
  </div>
  <div id="universeGrid"></div>
</section>
```

**Step 3: Add force-directed layout engine**

Add after the existing `clusterAndRender()` function (replace or refactor it):

```javascript
// ============================================================
// NETWORK GRAPH — Force-Directed Layout
// ============================================================
let networkNodes = [];
let networkEdges = [];
let gapScores = {};
let isDragging = false;
let dragNodeIdx = -1;

function buildNetworkGraph(universeTrials, gapData) {
  gapScores = gapData;

  // Build nodes from subcategories (exclude general if empty)
  networkNodes = CARDIO_SUBCATEGORIES
    .filter(c => c.id !== 'general' || (gapData[c.id]?.totalRCTs || 0) > 0)
    .map(cat => {
      const g = gapData[cat.id] || { totalRCTs: 0, recentRCTs: 0, maCount: 0, gapScore: 0 };
      const r = 20 + Math.sqrt(g.totalRCTs) * 2; // radius
      return {
        id: cat.id, label: cat.label, color: cat.color,
        r: Math.min(r, 65), // cap radius
        x: 400 + (Math.random() - 0.5) * 300,
        y: 250 + (Math.random() - 0.5) * 200,
        vx: 0, vy: 0,
        totalRCTs: g.totalRCTs, recentRCTs: g.recentRCTs,
        maCount: g.maCount, gapScore: g.gapScore, opportunity: g.opportunity || 'LOW',
        topInterventions: g.topInterventions || [], topOutcomes: g.topOutcomes || []
      };
    });

  // Build edges: shared interventions between subcategories
  networkEdges = [];
  const trialsBySubcat = {};
  for (const t of universeTrials) {
    const sc = t.subcategory || 'general';
    if (!trialsBySubcat[sc]) trialsBySubcat[sc] = new Set();
    for (const iv of (t.interventions || [])) {
      if (iv.name) trialsBySubcat[sc].add(iv.name.toLowerCase().slice(0, 40));
    }
  }

  for (let i = 0; i < networkNodes.length; i++) {
    for (let j = i + 1; j < networkNodes.length; j++) {
      const a = trialsBySubcat[networkNodes[i].id] || new Set();
      const b = trialsBySubcat[networkNodes[j].id] || new Set();
      let shared = 0;
      for (const iv of a) { if (b.has(iv)) shared++; }
      if (shared > 0) {
        networkEdges.push({
          source: i, target: j,
          weight: Math.min(shared, 20)
        });
      }
    }
  }

  // Run force simulation
  runForceLayout(80);
  renderNetwork();
}

function runForceLayout(iterations) {
  const W = 800, H = 500;
  const k = Math.sqrt((W * H) / (networkNodes.length + 1)) * 0.8;

  for (let iter = 0; iter < iterations; iter++) {
    const temp = 0.1 * (1 - iter / iterations);

    // Repulsion between all nodes
    for (let i = 0; i < networkNodes.length; i++) {
      networkNodes[i].vx = 0;
      networkNodes[i].vy = 0;
      for (let j = 0; j < networkNodes.length; j++) {
        if (i === j) continue;
        const dx = networkNodes[i].x - networkNodes[j].x;
        const dy = networkNodes[i].y - networkNodes[j].y;
        const dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));
        const force = (k * k) / dist;
        networkNodes[i].vx += (dx / dist) * force;
        networkNodes[i].vy += (dy / dist) * force;
      }
    }

    // Attraction along edges
    for (const e of networkEdges) {
      const a = networkNodes[e.source];
      const b = networkNodes[e.target];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));
      const force = (dist * dist) / (k * (e.weight + 1));
      a.vx += (dx / dist) * force * 0.5;
      a.vy += (dy / dist) * force * 0.5;
      b.vx -= (dx / dist) * force * 0.5;
      b.vy -= (dy / dist) * force * 0.5;
    }

    // Center gravity
    for (const n of networkNodes) {
      n.vx += (W / 2 - n.x) * 0.01;
      n.vy += (H / 2 - n.y) * 0.01;
    }

    // Apply velocity with temperature decay
    for (const n of networkNodes) {
      const speed = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
      if (speed > 0) {
        const maxDisp = Math.max(1, temp * k);
        const scale = Math.min(speed, maxDisp) / speed;
        n.x += n.vx * scale;
        n.y += n.vy * scale;
      }
      // Constrain to bounds
      n.x = Math.max(n.r + 10, Math.min(W - n.r - 10, n.x));
      n.y = Math.max(n.r + 10, Math.min(H - n.r - 10, n.y));
    }
  }
}

function renderNetwork() {
  const svg = document.getElementById('networkSvg');
  if (!svg) return;

  let html = '<defs>';
  // Glow filters for each node
  for (const n of networkNodes) {
    html += '<filter id="glow-' + n.id + '" x="-50%" y="-50%" width="200%" height="200%">' +
      '<feGaussianBlur stdDeviation="' + (n.gapScore > 10 ? 8 : n.gapScore > 3 ? 5 : 3) + '" result="blur"/>' +
      '<feFlood flood-color="' + n.color + '" flood-opacity="0.4"/>' +
      '<feComposite in2="blur" operator="in"/>' +
      '<feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>';
  }
  html += '</defs>';

  // Draw edges
  for (const e of networkEdges) {
    const a = networkNodes[e.source], b = networkNodes[e.target];
    const opacity = 0.1 + Math.min(0.4, e.weight * 0.03);
    html += '<line class="edge-line" x1="' + a.x + '" y1="' + a.y + '" x2="' + b.x + '" y2="' + b.y +
      '" style="stroke-opacity:' + opacity + ';stroke-width:' + (0.5 + e.weight * 0.15) + '"/>';
  }

  // Draw nodes
  networkNodes.forEach((n, i) => {
    // Glow circle (behind main node)
    if (n.gapScore > 1) {
      html += '<circle cx="' + n.x + '" cy="' + n.y + '" r="' + (n.r + 8) +
        '" fill="' + n.color + '" opacity="' + Math.min(0.3, n.gapScore * 0.02) +
        '" class="node-glow"/>';
    }
    // Main circle
    html += '<circle cx="' + n.x + '" cy="' + n.y + '" r="' + n.r +
      '" fill="' + n.color + '" opacity="0.85" filter="url(#glow-' + n.id + ')"' +
      ' style="cursor:pointer" data-node="' + i + '"/>';
    // Opportunity ring
    if (n.opportunity === 'HIGH') {
      html += '<circle cx="' + n.x + '" cy="' + n.y + '" r="' + (n.r + 4) +
        '" class="node-ring-opportunity"/>';
    }
    // Labels
    html += '<text class="node-label" x="' + n.x + '" y="' + (n.y - 2) + '">' + escapeHtml(n.label) + '</text>';
    html += '<text class="node-count" x="' + n.x + '" y="' + (n.y + 10) + '">' + n.totalRCTs + ' RCTs</text>';
  });

  svg.innerHTML = html;

  // Attach event listeners
  svg.querySelectorAll('circle[data-node]').forEach(el => {
    el.addEventListener('mouseenter', (e) => showNetworkTooltip(e, parseInt(el.dataset.node)));
    el.addEventListener('mouseleave', hideNetworkTooltip);
    el.addEventListener('click', () => expandSubcategory(parseInt(el.dataset.node)));
    el.addEventListener('mousedown', (e) => startDragNode(e, parseInt(el.dataset.node)));
  });
}

function showNetworkTooltip(event, idx) {
  const n = networkNodes[idx];
  if (!n) return;
  const tt = document.getElementById('networkTooltip');
  const ivList = (n.topInterventions || []).slice(0, 4).map(iv => escapeHtml(iv.name)).join(', ');
  tt.innerHTML = '<h4>' + escapeHtml(n.label) + '</h4>' +
    '<div class="tt-stat">' + n.totalRCTs + ' RCTs (' + n.recentRCTs + ' in last 3yr)</div>' +
    '<div class="tt-stat">' + n.maCount + ' meta-analyses (last 5yr)</div>' +
    '<div class="tt-stat">Gap score: ' + n.gapScore.toFixed(1) + ' (' + n.opportunity + ')</div>' +
    (ivList ? '<div class="tt-stat" style="margin-top:4px">Top drugs: ' + ivList + '</div>' : '') +
    '<div style="margin-top:6px;color:#94a3b8;font-size:0.7rem">Click to explore</div>';
  const rect = document.getElementById('universePanel').getBoundingClientRect();
  const svgRect = document.getElementById('networkSvg').getBoundingClientRect();
  const scale = svgRect.width / 800;
  tt.style.left = (n.x * scale + 20) + 'px';
  tt.style.top = (n.y * scale - 20) + 'px';
  tt.classList.add('visible');
}

function hideNetworkTooltip() {
  document.getElementById('networkTooltip')?.classList.remove('visible');
}

// Node dragging
function startDragNode(e, idx) {
  isDragging = true;
  dragNodeIdx = idx;
  e.preventDefault();
  const onMove = (ev) => {
    if (!isDragging || dragNodeIdx < 0) return;
    const svgEl = document.getElementById('networkSvg');
    const rect = svgEl.getBoundingClientRect();
    const scale = 800 / rect.width;
    networkNodes[dragNodeIdx].x = (ev.clientX - rect.left) * scale;
    networkNodes[dragNodeIdx].y = (ev.clientY - rect.top) * scale;
    renderNetwork();
  };
  const onUp = () => {
    isDragging = false;
    dragNodeIdx = -1;
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
  };
  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onUp);
}

// Click a node: expand subcategory into the grid below
async function expandSubcategory(idx) {
  const n = networkNodes[idx];
  if (!n) return;
  const trials = await getUniverseBySubcategory(n.id);
  document.getElementById('universeControls').style.display = 'block';
  document.getElementById('universeStats').textContent =
    n.label + ': ' + trials.length + ' RCTs, ' + n.maCount + ' MAs (5yr)';
  renderUniverseGrid(trials, n);
}
```

**Step 4: Add grid rendering for drill-down**

```javascript
function renderUniverseGrid(trials, subcatNode) {
  // Sub-cluster by intervention type
  const clusters = {};
  for (const t of trials) {
    for (const iv of (t.interventions || [])) {
      const key = iv.name ? iv.name.toLowerCase().slice(0, 40) : 'unknown';
      if (!clusters[key]) clusters[key] = { label: iv.name || 'Unknown', trials: [], recentCount: 0 };
      clusters[key].trials.push(t);
      if (t.startYear >= new Date().getFullYear() - 3) clusters[key].recentCount++;
    }
  }

  const sorted = Object.values(clusters)
    .filter(c => c.trials.length >= 2)
    .sort((a, b) => b.recentCount - a.recentCount || b.trials.length - a.trials.length)
    .slice(0, 40);

  const grid = document.getElementById('universeGrid');
  grid.innerHTML = sorted.map(c => {
    const enrollment = c.trials.reduce((a, t) => a + (t.enrollment || 0), 0);
    const years = {};
    c.trials.forEach(t => { if (t.startYear > 2010) years[t.startYear] = (years[t.startYear] || 0) + 1; });
    const sparkYears = [];
    const curYear = new Date().getFullYear();
    for (let y = curYear - 9; y <= curYear; y++) sparkYears.push(years[y] || 0);
    const maxSpk = Math.max(1, ...sparkYears);

    return '<div class="universe-card" tabindex="0">' +
      '<div class="card-heat ' + (c.recentCount > 5 ? 'heat-hot' : c.recentCount > 2 ? 'heat-warm' : 'heat-cool') + '"></div>' +
      '<h4>' + escapeHtml(c.label) + '</h4>' +
      '<div class="card-stats">' +
        '<div class="card-stat"><div class="card-stat-value">' + c.trials.length + '</div><div class="card-stat-label">RCTs</div></div>' +
        '<div class="card-stat"><div class="card-stat-value">' + c.recentCount + '</div><div class="card-stat-label">Recent (3yr)</div></div>' +
        '<div class="card-stat"><div class="card-stat-value">' + (enrollment > 1000 ? Math.round(enrollment/1000) + 'K' : enrollment) + '</div><div class="card-stat-label">Enrolled</div></div>' +
      '</div>' +
      '<div class="sparkline-row">' +
        sparkYears.map(v => '<div class="sparkline-bar" style="height:' + Math.max(2, (v/maxSpk)*100) + '%"></div>').join('') +
      '</div>' +
      '<div class="card-actions">' +
        '<button class="opp-start-btn" onclick="startReviewFromUniverse(\'' + escapeHtml(c.label) + '\',\'' + escapeHtml(subcatNode.id) + '\')">Start Review</button>' +
      '</div>' +
    '</div>';
  }).join('');
}

function startReviewFromUniverse(interventionLabel, subcatId) {
  const cat = getSubcategory(subcatId);
  // Auto-populate PICO from the subcategory
  const project = projects.find(p => p.id === currentProjectId);
  if (project) {
    project.pico = {
      P: cat.label.toLowerCase().includes('hypertension') ? 'adults with hypertension' :
         'adults with ' + cat.label.toLowerCase(),
      I: interventionLabel,
      C: 'placebo or standard care',
      O: cat.id === 'hf' ? 'CV death or HF hospitalization' :
         cat.id === 'acs' ? 'MACE (CV death, MI, stroke)' :
         cat.id === 'af' ? 'stroke or systemic embolism' :
         'cardiovascular outcomes'
    };
    idbPut('projects', project);
  }
  switchPhase('protocol');
  loadPICO();
  showToast('PICO populated from ' + cat.label + ' universe', 'success');
}
```

**Step 5: Run integrity checks + feature tests**

---

## Task 5: Opportunity Banner on Dashboard

**What:** Show the top 5 gap-score opportunities on the Dashboard tab and above the network graph.

**Files:**
- Modify: `metasprint-autopilot.html`
  - HTML: Add opportunity section to dashboard phase
  - JS: Render opportunities in `renderSprintDashboard()`

**Step 1: Add opportunity rendering**

```javascript
function renderOpportunityBanner() {
  const banner = document.getElementById('opportunityBanner');
  if (!banner || !gapScores) return;

  const opportunities = CARDIO_SUBCATEGORIES
    .filter(c => c.id !== 'general' && gapScores[c.id])
    .map(c => ({ ...c, ...gapScores[c.id] }))
    .filter(c => c.gapScore > 1)
    .sort((a, b) => b.gapScore - a.gapScore)
    .slice(0, 5);

  if (opportunities.length === 0) { banner.style.display = 'none'; return; }

  banner.style.display = 'block';
  banner.innerHTML = '<h3>Top Review Opportunities</h3>' +
    opportunities.map(o => {
      const cls = o.opportunity === 'HIGH' ? '' : o.opportunity === 'MODERATE' ? ' moderate' : ' low';
      return '<div class="opportunity-item">' +
        '<span class="opp-score' + cls + '">' + o.opportunity + '</span>' +
        '<span>' + escapeHtml(o.label) + ' &mdash; ' + o.recentRCTs + ' recent RCTs, ' + o.maCount + ' MAs</span>' +
        '<button class="opp-start-btn" onclick="expandSubcategory(' +
          networkNodes.findIndex(n => n.id === o.id) + ')">Explore</button>' +
      '</div>';
    }).join('');
}
```

Update `renderSprintDashboard()` to also call `renderOpportunityBanner()` when gap data is available.

**Step 2: Add a dashboard opportunity section**

Add in the dashboard HTML (before the risk panel):

```html
<div id="dashboardOpportunities" style="margin-bottom:16px"></div>
```

```javascript
// In renderSprintDashboard(), add:
if (Object.keys(gapScores).length > 0) {
  const el = document.getElementById('dashboardOpportunities');
  if (el) {
    const top3 = CARDIO_SUBCATEGORIES
      .filter(c => gapScores[c.id]?.gapScore > 1)
      .sort((a, b) => (gapScores[b.id]?.gapScore || 0) - (gapScores[a.id]?.gapScore || 0))
      .slice(0, 3);
    if (top3.length > 0) {
      el.innerHTML = '<div class="card-header-sprint">Review Opportunities</div>' +
        '<div style="padding:10px">' + top3.map(c => {
          const g = gapScores[c.id];
          return '<div style="display:flex;align-items:center;gap:8px;padding:4px 0;font-size:0.85rem">' +
            '<span style="width:8px;height:8px;border-radius:50%;background:' + c.color + '"></span>' +
            '<span>' + escapeHtml(c.label) + '</span>' +
            '<span class="text-muted" style="font-size:0.75rem">' + g.recentRCTs + ' RCTs / ' + g.maCount + ' MAs</span>' +
            '<button class="btn-sm" style="margin-left:auto" onclick="switchPhase(\'discover\')">Explore</button>' +
          '</div>';
        }).join('') + '</div>';
    }
  }
}
```

**Step 3: Run integrity checks + feature tests**

---

## Task 6: Wire Up App Initialization & Universe Loading

**What:** Update the DOMContentLoaded handler to load the cardiac universe on startup, compute gap scores, and render the network.

**Files:**
- Modify: `metasprint-autopilot.html` — DOMContentLoaded handler and switchPhase

**Step 1: Update app initialization**

```javascript
// In DOMContentLoaded, after renderSprintDashboard():

// Load cardiac universe in background
setTimeout(async () => {
  try {
    await updateCardiacUniverse((msg) => {
      const el = document.getElementById('universeStatus');
      if (el) el.textContent = msg;
    });
    const trials = await getAllUniverseTrials();
    if (trials.length > 0) {
      const gapData = await computeAllGapScores(trials, (msg) => {
        const el = document.getElementById('universeStatus');
        if (el) el.textContent = msg;
      });
      buildNetworkGraph(trials, gapData);
      renderOpportunityBanner();
      renderSprintDashboard(); // re-render to include opportunities
    }
  } catch (err) {
    console.warn('Universe load error:', err);
    const el = document.getElementById('universeStatus');
    if (el) el.textContent = 'Universe unavailable (offline mode)';
  }
}, 500);
```

**Step 2: Update switchPhase for discover**

In `switchPhase()`, update the discover case:

```javascript
if (phase === 'discover') {
  // If network already built, just re-render
  if (networkNodes.length > 0) {
    renderNetwork();
    renderOpportunityBanner();
  }
}
```

**Step 3: Update app title/subtitle**

Change the `<title>` tag:
```html
<title>MetaSprint Autopilot — Cardiovascular Meta-Analysis Engine</title>
```

Update the header `<h1>`:
```html
<h1>MetaSprint <span style="color:var(--text-muted);font-weight:400;font-size:0.85rem">Cardiovascular</span></h1>
```

**Step 4: Run integrity checks + full feature test suite**

Expected: divs balanced, 18/18 tests pass, no regressions.

---

## Task 7: RCT Extractor Integration (Optional Accelerator)

**What:** Add a "Extract from PDF" button in the Extract phase that calls the local RCT Extractor v2 API.

**Files:**
- Modify: `metasprint-autopilot.html` — Extract phase HTML + JS

**Step 1: Add HTML button and modal**

In the extract header (after the existing buttons):

```html
<button class="btn-info" onclick="showExtractorModal()">Extract from PDF</button>
```

Add modal HTML (before `</main>`):

```html
<div id="extractorOverlay" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:100;display:none;align-items:center;justify-content:center">
  <div style="background:var(--surface);border-radius:var(--radius);padding:24px;max-width:500px;width:90%">
    <h3 style="margin-bottom:12px">Extract Effect Data</h3>
    <p style="font-size:0.82rem;color:var(--text-muted);margin-bottom:12px">
      Paste text from a trial publication, or upload a PDF. Requires RCT Extractor running at localhost:8000.
    </p>
    <textarea id="extractorText" rows="6" placeholder="Paste results text here (e.g., 'HR 0.74, 95% CI 0.65-0.85, P<0.001')"
      style="width:100%;padding:8px;border:1px solid var(--border);border-radius:var(--radius);font-size:0.85rem;resize:vertical"></textarea>
    <div style="margin-top:8px;display:flex;gap:8px">
      <input type="file" id="extractorFile" accept=".pdf" style="font-size:0.82rem">
    </div>
    <div id="extractorStatus" style="margin-top:8px;font-size:0.82rem;color:var(--text-muted)"></div>
    <div style="margin-top:12px;display:flex;gap:8px;justify-content:flex-end">
      <button class="btn-outline" onclick="closeExtractorModal()">Cancel</button>
      <button onclick="runExtractor()">Extract</button>
    </div>
  </div>
</div>
```

**Step 2: Add JS functions**

```javascript
// ============================================================
// RCT EXTRACTOR INTEGRATION (optional, localhost:8000)
// ============================================================
const EXTRACTOR_URL = 'http://localhost:8000';

function showExtractorModal() {
  document.getElementById('extractorOverlay').style.display = 'flex';
  document.getElementById('extractorText').value = '';
  document.getElementById('extractorStatus').textContent = '';
}

function closeExtractorModal() {
  document.getElementById('extractorOverlay').style.display = 'none';
}

async function runExtractor() {
  const text = document.getElementById('extractorText').value.trim();
  const fileInput = document.getElementById('extractorFile');
  const statusEl = document.getElementById('extractorStatus');

  if (!text && !fileInput.files.length) {
    statusEl.textContent = 'Paste text or select a PDF file';
    return;
  }

  statusEl.textContent = 'Extracting...';

  try {
    let data;
    if (text) {
      const resp = await fetch(EXTRACTOR_URL + '/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, include_raw: true })
      });
      if (!resp.ok) throw new Error('Extractor returned ' + resp.status);
      data = await resp.json();
    } else {
      const formData = new FormData();
      formData.append('file', fileInput.files[0]);
      const resp = await fetch(EXTRACTOR_URL + '/extract/pdf', {
        method: 'POST', body: formData
      });
      if (!resp.ok) throw new Error('Extractor returned ' + resp.status);
      data = await resp.json();
    }

    if (!data.success || !data.extractions?.length) {
      statusEl.textContent = 'No effects found in text';
      return;
    }

    // Add each extraction as a study row
    let added = 0;
    for (const ext of data.extractions) {
      if (ext.point_estimate == null) continue;
      const typeMap = { HR: 'HR', OR: 'OR', RR: 'RR', MD: 'MD', SMD: 'SMD', ARD: 'RD' };
      const effectType = typeMap[ext.effect_type] || 'Other';
      const tierBadge = ext.automation_tier === 'full_auto' ? '[AUTO]' :
                        ext.automation_tier === 'verify' ? '[VERIFY]' : '[MANUAL]';
      addStudyRow({
        effectEstimate: ext.point_estimate,
        lowerCI: ext.ci?.lower ?? null,
        upperCI: ext.ci?.upper ?? null,
        effectType: effectType,
        notes: tierBadge + ' ' + (ext.source_text || '').slice(0, 200)
      });
      added++;
    }

    closeExtractorModal();
    showToast('Extracted ' + added + ' effect(s) from text', 'success');
  } catch (err) {
    if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
      statusEl.innerHTML = 'RCT Extractor not running.<br><code style="font-size:0.75rem">cd C:\\Users\\user\\rct-extractor-v2 && uvicorn src.api.main:app --port 8000</code>';
    } else {
      statusEl.textContent = 'Error: ' + err.message;
    }
  }
}
```

**Step 3: Run integrity checks + feature tests**

---

## Task 8: Final Polish & Validation

**What:** Clean up old generic discover code, update paper generator to reference cardiology, run full validation.

**Step 1: Remove old `loadRCTUniverse()` text search box**

The old topic input and "Load Universe" button in the discover phase are replaced by the network graph. Remove the old functions only if they're no longer called (the clustering functions may still be useful — check references before deleting).

**Step 2: Update paper generator**

In `generatePaper()`, update the search strategy text to mention "cardiovascular databases" and the cardiology focus.

**Step 3: Run full validation**

```bash
cd C:/Users/user/Downloads/metasprint-autopilot/validation
python test_features.py
```

Expected: 18/18 pass.

**Step 4: Final integrity check**

Run the integrity check script. Expected: divs balanced, 0 literal `</script>`, no duplicate functions.

**Step 5: Manual smoke test**

Open the app in Chrome. Verify:
1. Universe loads (or shows "loading..." if offline)
2. Network graph renders with 9-10 nodes
3. Nodes are draggable
4. Hover shows tooltip with gap scores
5. Click a node shows the drill-down grid
6. "Start Review" populates PICO
7. Dashboard shows top opportunities
8. Analysis engine still works (add test data, run meta-analysis)
9. Extract from PDF button shows modal (even if extractor not running)

---

## Execution Order Summary

| Task | What | Est. Lines Added |
|------|------|-----------------|
| 1 | Taxonomy + classifier | ~80 |
| 2 | Universe IndexedDB + delta update | ~150 |
| 3 | Gap score engine | ~100 |
| 4 | Network graph visualization | ~350 |
| 5 | Opportunity banner | ~60 |
| 6 | Wire up initialization | ~40 |
| 7 | RCT Extractor integration | ~100 |
| 8 | Polish + validation | ~20 |
| **Total** | | **~900 lines** |

Final file: ~5,350 lines (from current 4,460).
