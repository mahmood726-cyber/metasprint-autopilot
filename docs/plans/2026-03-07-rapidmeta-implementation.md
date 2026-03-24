# RapidMeta Review Mode — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a full Finrenone-style 6-tab systematic review mode (RapidMeta) to MetaSprint Autopilot, offered as default at startup, while keeping existing Autopilot Sprint mode as an alternative.

**Architecture:** Dual Shell — two tab bars and two sets of phase sections in one HTML file. Startup modal lets user pick mode. Both modes share the same IndexedDB data stores and statistical engine functions. RapidMeta adds dual-reviewer screening, evidence panels, 16-chart analysis suite, and scientific output with GRADE/PRISMA.

**Tech Stack:** Vanilla JS, SVG charts (existing engine), IndexedDB, localStorage, CSS variables (Autopilot design language)

**Key file:** `metasprint-autopilot.html` (30,829 lines)

**Key landmarks:**
- Header: line 1114
- Autopilot tab bar: line 1140
- Main content: line 1157
- Stat engine: lines 8673-12700 (distribution fns, DL, REML, HKSJ, Bayesian)
- Trim-fill: line 15858
- Search functions: lines 16234-17200
- Dedup: line 17214
- DOMContentLoaded init: line 30232
- Last `</script>`: line 30827

---

### Task 1: Startup Modal — HTML + CSS

**Files:**
- Modify: `metasprint-autopilot.html` (insert after line 1113, before `<header>`)

**Step 1: Add modal CSS**

Insert into the `<style>` block (after line ~115, after `.phase.active`):

```css
/* --- Mode Selection Modal --- */
.mode-modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center;
  z-index: 9999; backdrop-filter: blur(4px);
}
.mode-modal-overlay.hidden { display: none; }
.mode-modal {
  background: var(--surface); border-radius: 16px; padding: 32px;
  max-width: 640px; width: 90%; box-shadow: 0 25px 50px rgba(0,0,0,0.25);
}
.mode-modal h2 { font-size: 1.5rem; text-align: center; margin-bottom: 8px; }
.mode-modal p { text-align: center; color: var(--text-muted); font-size: 0.875rem; margin-bottom: 24px; }
.mode-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
.mode-card {
  border: 2px solid var(--border); border-radius: 12px; padding: 20px;
  cursor: pointer; transition: border-color 0.2s, box-shadow 0.2s;
  text-align: center;
}
.mode-card:hover { border-color: var(--primary); box-shadow: 0 4px 12px rgba(37,99,235,0.15); }
.mode-card.recommended { border-color: var(--primary); background: rgba(37,99,235,0.04); }
.mode-card h3 { font-size: 1.1rem; margin-bottom: 8px; }
.mode-card .mode-tag {
  display: inline-block; font-size: 0.65rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.08em; padding: 2px 8px; border-radius: 8px;
  background: var(--primary); color: #fff; margin-bottom: 10px;
}
.mode-card ul { text-align: left; font-size: 0.78rem; color: var(--text-muted); line-height: 1.7; list-style: none; padding: 0; }
.mode-card ul li::before { content: '\2713\00a0'; color: var(--success); font-weight: 700; }
.mode-card .mode-start-btn {
  margin-top: 14px; padding: 8px 24px; border-radius: 8px;
  font-weight: 600; font-size: 0.875rem; width: 100%;
}
.mode-remember { text-align: center; font-size: 0.8rem; color: var(--text-muted); }
.mode-remember label { cursor: pointer; }
```

**Step 2: Add modal HTML**

Insert after line 1113 (before `<header>`):

```html
<!-- Mode Selection Modal -->
<div id="modeModal" class="mode-modal-overlay hidden">
  <div class="mode-modal" role="dialog" aria-labelledby="modeModalTitle" aria-modal="true">
    <h2 id="modeModalTitle">Welcome to MetaSprint</h2>
    <p>Choose your workflow</p>
    <div class="mode-cards">
      <div class="mode-card recommended" onclick="selectMode('rapidmeta')" id="modeCardRM">
        <span class="mode-tag">Recommended</span>
        <h3>RapidMeta Review</h3>
        <ul>
          <li>6-step systematic review</li>
          <li>Dual-reviewer screening</li>
          <li>Evidence traceability</li>
          <li>GRADE + 16 charts</li>
          <li>Patient mode</li>
        </ul>
        <button class="mode-start-btn" type="button">Start Review</button>
      </div>
      <div class="mode-card" onclick="selectMode('autopilot')" id="modeCardAP">
        <h3>Autopilot Sprint</h3>
        <ul>
          <li>40-day guided sprint</li>
          <li>Discovery + NMA + DTA</li>
          <li>Dose-response + ICER</li>
          <li>Al-Burhan engine</li>
          <li>Living MA + CUSUM</li>
        </ul>
        <button class="mode-start-btn btn-outline" type="button">Start Sprint</button>
      </div>
    </div>
    <div class="mode-remember">
      <label><input type="checkbox" id="modeRememberCb"> Remember my choice</label>
    </div>
  </div>
</div>
```

**Step 3: Add mode-select dropdown to header**

In the header actions div (line ~1116), add a mode selector before the project select:

```html
<select id="modeSelect" aria-label="Switch mode" onchange="switchMode(this.value)" style="padding:4px 8px;font-size:0.75rem;border:1px solid var(--border);border-radius:var(--radius);background:var(--surface);color:var(--text);cursor:pointer;font-weight:600">
  <option value="rapidmeta">RapidMeta</option>
  <option value="autopilot">Autopilot</option>
</select>
```

**Step 4: Commit**

```bash
git add metasprint-autopilot.html
git commit -m "feat: add startup mode selection modal HTML + CSS"
```

---

### Task 2: Mode Switching JS Logic

**Files:**
- Modify: `metasprint-autopilot.html` (insert JS before DOMContentLoaded at ~line 30230)

**Step 1: Add mode switching functions**

Insert before the `// APP INITIALIZATION` comment (line ~30230):

```javascript
// ============================================================
// MODE SWITCHING (RapidMeta vs Autopilot)
// ============================================================
let currentMode = 'rapidmeta';

function showModeModal() {
  document.getElementById('modeModal').classList.remove('hidden');
  // Focus first card for a11y
  document.getElementById('modeCardRM').focus();
}

function selectMode(mode) {
  const remember = document.getElementById('modeRememberCb').checked;
  safeSetStorage('msa_mode', mode);
  if (remember) safeSetStorage('msa_mode_remember', '1');
  document.getElementById('modeModal').classList.add('hidden');
  applyMode(mode);
}

function switchMode(mode) {
  safeSetStorage('msa_mode', mode);
  applyMode(mode);
}

function applyMode(mode) {
  currentMode = mode;
  const rmTabbar = document.getElementById('rm-tabbar');
  const apTabbar = document.getElementById('ap-tabbar');
  const modeSelect = document.getElementById('modeSelect');
  if (modeSelect) modeSelect.value = mode;

  // Hide all phases
  document.querySelectorAll('.phase').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.rm-phase').forEach(p => p.classList.remove('active'));

  if (mode === 'rapidmeta') {
    if (rmTabbar) rmTabbar.style.display = '';
    if (apTabbar) apTabbar.style.display = 'none';
    // Show/hide Autopilot-only header controls
    document.querySelectorAll('.ap-only').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.rm-only').forEach(el => el.style.display = '');
    switchRMPhase('rm-protocol');
  } else {
    if (rmTabbar) rmTabbar.style.display = 'none';
    if (apTabbar) apTabbar.style.display = '';
    document.querySelectorAll('.ap-only').forEach(el => el.style.display = '');
    document.querySelectorAll('.rm-only').forEach(el => el.style.display = 'none');
    switchPhase('dashboard');
  }
}

let currentRMPhase = 'rm-protocol';

function switchRMPhase(phase) {
  document.querySelectorAll('.rm-tab').forEach(t => {
    t.classList.remove('active');
    t.setAttribute('aria-selected', 'false');
  });
  document.querySelectorAll('.rm-phase').forEach(p => p.classList.remove('active'));
  const activeTab = document.querySelector('[data-rm-phase="' + phase + '"]');
  if (activeTab) {
    activeTab.classList.add('active');
    activeTab.setAttribute('aria-selected', 'true');
  }
  const panel = document.getElementById(phase);
  if (panel) panel.classList.add('active');
  currentRMPhase = phase;
  // Phase-specific init
  if (phase === 'rm-screen') rmScreenEngine.render();
  if (phase === 'rm-extract') rmExtractEngine.render();
  if (phase === 'rm-analysis') rmAnalysisEngine.render();
  if (phase === 'rm-output') rmOutputEngine.render();
}
```

**Step 2: Update DOMContentLoaded init**

In the DOMContentLoaded handler (line ~30232), after `renderSprintDashboard()` (line ~30289), add mode initialization:

```javascript
// Mode initialization
const savedMode = safeGetStorage('msa_mode', '');
const remembered = safeGetStorage('msa_mode_remember', '');
if (savedMode && remembered === '1') {
  applyMode(savedMode);
} else if (savedMode) {
  applyMode(savedMode);
  showModeModal();
} else {
  showModeModal();
}
```

**Step 3: Add `ap-only` class to Autopilot-specific header controls**

Wrap the day-control and sprint-specific buttons in `ap-only`:

The `day-control` div (line ~1121) and related buttons get class `ap-only`.

**Step 4: Add `id="ap-tabbar"` to existing tab bar**

Change `<nav class="tab-bar"` at line 1140 to `<nav id="ap-tabbar" class="tab-bar"`.

**Step 5: Commit**

```bash
git add metasprint-autopilot.html
git commit -m "feat: add mode switching JS logic and init flow"
```

---

### Task 3: RapidMeta Tab Bar + Empty Phase Shells

**Files:**
- Modify: `metasprint-autopilot.html`

**Step 1: Add RapidMeta tab bar HTML**

Insert after the existing `</nav>` (line ~1155), before `<main>`:

```html
<nav id="rm-tabbar" class="tab-bar" role="tablist" aria-label="RapidMeta review phases" style="display:none">
  <button class="rm-tab active" data-rm-phase="rm-protocol" role="tab" aria-selected="true" aria-controls="rm-protocol">1. Protocol</button>
  <button class="rm-tab" data-rm-phase="rm-search" role="tab" aria-selected="false" aria-controls="rm-search">2. Search</button>
  <button class="rm-tab" data-rm-phase="rm-screen" role="tab" aria-selected="false" aria-controls="rm-screen">3. Screening</button>
  <button class="rm-tab" data-rm-phase="rm-extract" role="tab" aria-selected="false" aria-controls="rm-extract">4. Extraction</button>
  <button class="rm-tab" data-rm-phase="rm-analysis" role="tab" aria-selected="false" aria-controls="rm-analysis">5. Analysis</button>
  <button class="rm-tab" data-rm-phase="rm-output" role="tab" aria-selected="false" aria-controls="rm-output">6. Output</button>
</nav>
```

**Step 2: Add tab bar click handler in JS**

```javascript
document.getElementById('rm-tabbar').addEventListener('click', (e) => {
  const tab = e.target.closest('[data-rm-phase]');
  if (tab) switchRMPhase(tab.dataset.rmPhase);
});
```

**Step 3: Add empty phase shells inside `<main>`**

Insert after the existing Dashboard section (after line ~1212), before the DTA section:

```html
<!-- ============================================================ -->
<!-- RAPIDMETA PHASES                                             -->
<!-- ============================================================ -->

<section id="rm-protocol" class="rm-phase" role="tabpanel" tabindex="-1">
  <div style="max-width:900px;margin:0 auto">
    <h2 style="margin-bottom:16px">Protocol & Registration</h2>
    <div id="rmProtocolContent"><!-- Task 4 fills this --></div>
  </div>
</section>

<section id="rm-search" class="rm-phase" role="tabpanel" tabindex="-1">
  <div style="max-width:900px;margin:0 auto">
    <h2 style="margin-bottom:16px">Multi-Source Search</h2>
    <div id="rmSearchContent"><!-- Task 5 fills this --></div>
  </div>
</section>

<section id="rm-screen" class="rm-phase" role="tabpanel" tabindex="-1">
  <div id="rmScreenContent"><!-- Task 6 fills this --></div>
</section>

<section id="rm-extract" class="rm-phase" role="tabpanel" tabindex="-1">
  <div style="max-width:1000px;margin:0 auto">
    <h2 style="margin-bottom:16px">Extraction & Evidence</h2>
    <div id="rmExtractContent"><!-- Task 7 fills this --></div>
  </div>
</section>

<section id="rm-analysis" class="rm-phase" role="tabpanel" tabindex="-1">
  <div style="max-width:1200px;margin:0 auto">
    <h2 style="margin-bottom:16px">Analysis Suite</h2>
    <div id="rmAnalysisContent"><!-- Task 8 fills this --></div>
  </div>
</section>

<section id="rm-output" class="rm-phase" role="tabpanel" tabindex="-1">
  <div style="max-width:1000px;margin:0 auto">
    <h2 style="margin-bottom:16px">Scientific Output</h2>
    <div id="rmOutputContent"><!-- Task 9 fills this --></div>
  </div>
</section>
```

**Step 4: Add CSS for rm-phase visibility**

```css
.rm-phase { display: none; padding: 24px; }
.rm-phase.active { display: block; }
.rm-tab { /* same styles as .tab */ }
```

(Reuse `.tab` styles by making `.rm-tab` share them — either comma-separate selectors or add `.rm-tab` to existing `.tab` rules.)

**Step 5: Commit**

```bash
git add metasprint-autopilot.html
git commit -m "feat: add RapidMeta tab bar and 6 empty phase shells"
```

---

### Task 4: Protocol Tab Content

**Files:**
- Modify: `metasprint-autopilot.html` (fill `rm-protocol` section + add JS)

**Step 1: Add Protocol HTML**

Fill `#rmProtocolContent` with:
- PICO form (Population, Intervention, Comparator, Outcomes) — 4 textareas
- Eligibility criteria table (2 columns: Inclusion / Exclusion, editable rows)
- Search strategy section (3 source checkboxes + search terms textarea)
- Statistical analysis plan textarea
- PRISMA 2020 checklist (27-item accordion, auto-checked based on progress)
- AMSTAR 2 critical domains (7 items, status badges)
- Audit trail panel (timestamped log, rendered from project data)

**Step 2: Add JS for protocol data binding**

```javascript
const rmProtocolEngine = {
  render() {
    // Load PICO from project metadata (shared with Autopilot)
    // Bind textareas to project.pico.{population,intervention,comparator,outcomes}
    // Render eligibility table from project.eligibility[]
    // Render audit log from project.auditLog[]
  },
  savePICO(field, value) {
    // Update project metadata and save to IDB
  },
  addEligibilityRow(type) {
    // Add inclusion/exclusion criterion
  },
  addAuditEntry(action, detail) {
    // Timestamp + action + detail → project.auditLog[]
  }
};
```

**Step 3: Commit**

```bash
git commit -m "feat(rapidmeta): add Protocol tab with PICO, eligibility, PRISMA, AMSTAR"
```

---

### Task 5: Search Tab Content

**Files:**
- Modify: `metasprint-autopilot.html` (fill `rm-search` section + add JS)

**Step 1: Add Search HTML**

Fill `#rmSearchContent` with:
- Source buttons: ClinicalTrials.gov, PubMed, Europe PMC, OpenAlex, CrossRef, AACT
- Database coverage badges (searched/not-searched per source)
- Search terms input (prefilled from protocol PICO)
- Progress bar + status text
- Results count card
- Search history log (timestamped entries)
- "Search All Sources" primary button

**Step 2: Add JS — reuse existing search functions**

```javascript
const rmSearchEngine = {
  async searchAll() {
    // Reuse existing searchAll() function (line 17124)
    // Update progress bar
    // Run dedupSearchResults() (line 17214)
    // Save to IDB references store
    // Update coverage badges
    // Log to search history
  },
  render() {
    // Show coverage badges
    // Render search history from project.searchLog[]
    // Show result counts
  },
  updateBadges() {
    // Mark which sources have been searched
  }
};
```

Key: this wraps the existing `searchAll()`, `searchPubMed()`, `searchCTGov()`, etc. — no reimplementation needed.

**Step 3: Commit**

```bash
git commit -m "feat(rapidmeta): add Search tab wrapping existing multi-source search"
```

---

### Task 6: Screening Tab — Dual-Reviewer Workflow

**Files:**
- Modify: `metasprint-autopilot.html` (fill `rm-screen` section + add JS + CSS)

This is the most complex new feature. Port the Finrenone `ScreenEngine` pattern.

**Step 1: Add Screening CSS**

```css
/* --- RapidMeta Screening --- */
.rm-screen-layout { display: flex; height: calc(100vh - 120px); overflow: hidden; }
.rm-screen-sidebar { width: 380px; border-right: 1px solid var(--border); overflow-y: auto; background: var(--surface); }
.rm-screen-detail { flex: 1; padding: 24px; overflow-y: auto; }
.rm-screen-toolbar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 16px; border-bottom: 1px solid var(--border); background: var(--bg);
}
.rm-screen-item {
  padding: 12px 16px; border-bottom: 1px solid var(--border); cursor: pointer; transition: background 0.1s;
}
.rm-screen-item:hover { background: #f1f5f9; }
.rm-screen-item.selected { background: #eff6ff; border-left: 3px solid var(--primary); }
body.dark .rm-screen-item:hover { background: #1e293b; }
body.dark .rm-screen-item.selected { background: #1e3a5f; }
.rm-review-status { font-size: 0.7rem; margin-top: 4px; }
.rm-review-status.confirmed { color: var(--success); }
.rm-review-status.pending { color: var(--warning); }
.evidence-panel { border: 1px solid var(--border); border-radius: 8px; padding: 12px; margin-top: 8px; font-size: 0.8rem; }
.evidence-panel-summary { border-left: 3px solid var(--primary); background: rgba(37,99,235,0.04); }
.evidence-panel-locator { border-left: 3px solid var(--text-muted); font-family: monospace; font-size: 0.75rem; }
.evidence-panel-meta { border-left: 3px solid var(--warning); background: rgba(245,158,11,0.04); }
.evidence-label { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-muted); margin-bottom: 4px; }
```

**Step 2: Add Screening HTML**

Fill `#rmScreenContent`:

```html
<div class="rm-screen-toolbar">
  <div style="display:flex;align-items:center;gap:16px">
    <span style="font-weight:600;color:var(--success)">Review Queue: <span id="rmScreenCount">0</span></span>
    <button class="btn-outline btn-sm" onclick="rmScreenEngine.toggleFilter('all')" id="rmSfAll">All</button>
    <button class="btn-outline btn-sm" onclick="rmScreenEngine.toggleFilter('include')" id="rmSfInclude">Included</button>
    <button class="btn-outline btn-sm" onclick="rmScreenEngine.toggleFilter('exclude')" id="rmSfExclude">Excluded</button>
  </div>
  <div style="display:flex;align-items:center;gap:8px">
    <span style="font-size:0.7rem;color:var(--text-muted)">N/P = nav | I/E = propose | C = confirm</span>
    <button class="btn-success btn-sm" onclick="rmScreenEngine.resolve('include')">Propose Include (I)</button>
    <button class="btn-danger btn-sm" onclick="rmScreenEngine.resolve('exclude')">Propose Exclude (E)</button>
    <button class="btn-info btn-sm" onclick="rmScreenEngine.confirmCurrent()">2nd Confirm (C)</button>
    <button class="btn-outline btn-sm" onclick="rmScreenEngine.bulkDualSignoff()">Bulk Dual Sign-off</button>
  </div>
</div>
<div id="rmScreenMetrics" style="padding:4px 16px;font-size:0.7rem;color:var(--text-muted);border-bottom:1px solid var(--border)"></div>
<div class="rm-screen-layout">
  <div class="rm-screen-sidebar" id="rmScreenList"></div>
  <div class="rm-screen-detail" id="rmScreenDetail"></div>
</div>
```

**Step 3: Add ScreenEngine JS**

```javascript
const rmScreenEngine = {
  activeIdx: 0,
  filter: 'all',

  async getQueue() {
    const refs = await idbGetAll('references');
    if (this.filter === 'include') return refs.filter(r => r.decision === 'include' || r.screenReview?.decision === 'include');
    if (this.filter === 'exclude') return refs.filter(r => r.decision === 'exclude' || r.screenReview?.decision === 'exclude');
    return refs;
  },

  async render() {
    const queue = await this.getQueue();
    document.getElementById('rmScreenCount').textContent = queue.length;
    // Update filter button active states
    ['All','Include','Exclude'].forEach(f => {
      const btn = document.getElementById('rmSf' + f);
      if (btn) btn.classList.toggle('active', this.filter === f.toLowerCase());
    });
    // Render sidebar list
    const list = document.getElementById('rmScreenList');
    list.innerHTML = queue.map((r, i) => {
      const sr = r.screenReview ?? {};
      const statusText = sr.confirmed ? sr.decision.toUpperCase() + ' (confirmed)'
        : sr.decision ? sr.decision.toUpperCase() + ' (pending 2nd)'
        : r.decision ?? 'UNSCREENED';
      const statusClass = sr.confirmed ? 'confirmed' : sr.decision ? 'pending' : '';
      return '<div class="rm-screen-item' + (i === this.activeIdx ? ' selected' : '') +
        '" onclick="rmScreenEngine.select(' + i + ')" tabindex="0">' +
        '<div class="ref-title">' + escapeHtml(r.title ?? 'Untitled') + '</div>' +
        '<div class="ref-meta">' + escapeHtml(r.source ?? '') + ' | ' + escapeHtml(r.year ?? '') + '</div>' +
        '<div class="rm-review-status ' + statusClass + '">' + escapeHtml(statusText) + '</div>' +
        '</div>';
    }).join('');
    if (queue.length > 0) this.select(Math.min(this.activeIdx, queue.length - 1));
    this.updateMetrics(queue);
  },

  updateMetrics(queue) {
    const inc = queue.filter(r => r.screenReview?.confirmed && r.screenReview?.decision === 'include').length;
    const exc = queue.filter(r => r.screenReview?.confirmed && r.screenReview?.decision === 'exclude').length;
    const pending = queue.filter(r => r.screenReview?.decision && !r.screenReview?.confirmed).length;
    document.getElementById('rmScreenMetrics').textContent =
      'Confirmed: ' + inc + ' included, ' + exc + ' excluded | Pending 2nd review: ' + pending + ' | Total: ' + queue.length;
  },

  async select(idx) {
    this.activeIdx = idx;
    const queue = await this.getQueue();
    const r = queue[idx];
    if (!r) return;
    // Update sidebar highlight
    const items = document.getElementById('rmScreenList').children;
    for (let i = 0; i < items.length; i++) {
      items[i].classList.toggle('selected', i === idx);
    }
    // Render detail pane
    const sr = r.screenReview ?? {};
    const reviewState = sr.confirmed
      ? '<span style="color:var(--success);font-weight:600">Confirmed by ' + escapeHtml(sr.reviewer1 ?? '--') + ' + ' + escapeHtml(sr.reviewer2 ?? '--') + ' (seal: ' + escapeHtml(sr.sig2 ?? '--') + ')</span>'
      : sr.decision
        ? '<span style="color:var(--warning);font-weight:600">Proposed ' + escapeHtml(sr.decision.toUpperCase()) + ' by ' + escapeHtml(sr.reviewer1 ?? '--') + ' (awaiting 2nd reviewer)</span>'
        : '<span style="color:var(--text-muted)">No decision yet</span>';

    document.getElementById('rmScreenDetail').innerHTML =
      '<div class="card" style="padding:20px">' +
        '<h3 style="margin-bottom:8px">' + escapeHtml(r.title ?? 'Untitled') + '</h3>' +
        '<div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:12px">' +
          (r.authors ? escapeHtml(r.authors) + ' | ' : '') +
          escapeHtml(r.year ?? '') + ' | ' + escapeHtml(r.source ?? '') +
          (r.nctId ? ' | ' + escapeHtml(r.nctId) : '') +
          (r.pmid ? ' | PMID: ' + escapeHtml(r.pmid) : '') +
        '</div>' +
        '<div style="margin-bottom:16px">' + reviewState + '</div>' +
        '<div class="evidence-panel evidence-panel-summary" style="margin-bottom:12px">' +
          '<div class="evidence-label">Abstract</div>' +
          '<div style="font-size:0.8rem;line-height:1.6">' + escapeHtml(r.abstract ?? 'No abstract available.') + '</div>' +
        '</div>' +
        '<div style="margin-top:16px">' +
          '<label style="font-size:0.8rem;font-weight:600">Screening Note:</label>' +
          '<textarea id="rmScreenNote" rows="2" style="width:100%;padding:8px;border:1px solid var(--border);border-radius:var(--radius);margin-top:4px;font-size:0.8rem" placeholder="Add rationale for decision..." oninput="rmScreenEngine.saveNote(this.value)">' + escapeHtml(sr.note ?? '') + '</textarea>' +
        '</div>' +
      '</div>';
  },

  // FNV-1a short hash for audit trail
  _fnv1a(str) {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return (h >>> 0).toString(16).slice(0, 8);
  },

  async resolve(decision) {
    const queue = await this.getQueue();
    const r = queue[this.activeIdx];
    if (!r) return;
    if (r.screenReview?.confirmed) { showToast('Already confirmed by two reviewers.', 'warning'); return; }
    const reviewer = prompt('Enter your reviewer name:');
    if (!reviewer || !reviewer.trim()) return;
    if (!r.screenReview) r.screenReview = { decision: '', reviewer1: '', reviewer2: '', confirmed: false, note: '', ts1: '', ts2: '', sig1: '', sig2: '' };
    r.screenReview.decision = decision;
    r.screenReview.reviewer1 = reviewer.trim();
    r.screenReview.ts1 = new Date().toISOString();
    r.screenReview.sig1 = this._fnv1a(decision + '|' + reviewer.trim() + '|' + r.screenReview.ts1);
    await idbPut('references', r);
    showToast('Proposed ' + decision.toUpperCase() + ' by ' + reviewer.trim(), 'success');
    this.render();
  },

  async confirmCurrent() {
    const queue = await this.getQueue();
    const r = queue[this.activeIdx];
    if (!r) return;
    const sr = r.screenReview;
    if (!sr?.decision) { showToast('No proposal to confirm. Use Propose Include/Exclude first.', 'warning'); return; }
    if (sr.confirmed) { showToast('Already confirmed.', 'info'); return; }
    const reviewer2 = prompt('Enter 2nd reviewer name (must differ from ' + escapeHtml(sr.reviewer1) + '):');
    if (!reviewer2 || !reviewer2.trim()) return;
    if (reviewer2.trim().toLowerCase() === sr.reviewer1.toLowerCase()) { showToast('Second reviewer must be different from first.', 'warning'); return; }
    sr.reviewer2 = reviewer2.trim();
    sr.ts2 = new Date().toISOString();
    sr.sig2 = this._fnv1a(sr.decision + '|' + sr.reviewer2 + '|' + sr.ts2 + '|' + sr.sig1);
    sr.confirmed = true;
    r.decision = sr.decision; // Promote to top-level decision
    await idbPut('references', r);
    showToast('Confirmed ' + sr.decision.toUpperCase() + ' by ' + sr.reviewer1 + ' + ' + sr.reviewer2, 'success');
    this.render();
  },

  async bulkDualSignoff() {
    const pair = prompt('Enter two reviewer names (comma-separated):');
    if (!pair) return;
    const names = pair.split(',').map(s => s.trim()).filter(Boolean);
    if (names.length < 2) { showToast('Enter two names separated by comma.', 'warning'); return; }
    if (names[0].toLowerCase() === names[1].toLowerCase()) { showToast('Names must differ.', 'warning'); return; }
    const refs = await idbGetAll('references');
    let count = 0;
    const now = new Date().toISOString();
    for (const r of refs) {
      if (r.screenReview?.confirmed) continue;
      if (!r.screenReview?.decision) continue;
      r.screenReview.reviewer1 = r.screenReview.reviewer1 || names[0];
      r.screenReview.reviewer2 = names[1];
      r.screenReview.ts1 = r.screenReview.ts1 || now;
      r.screenReview.ts2 = now;
      r.screenReview.sig1 = r.screenReview.sig1 || this._fnv1a(r.screenReview.decision + '|' + names[0] + '|' + now);
      r.screenReview.sig2 = this._fnv1a(r.screenReview.decision + '|' + names[1] + '|' + now + '|' + r.screenReview.sig1);
      r.screenReview.confirmed = true;
      r.decision = r.screenReview.decision;
      await idbPut('references', r);
      count++;
    }
    showToast('Bulk confirmed ' + count + ' decisions.', 'success');
    this.render();
  },

  async saveNote(note) {
    const queue = await this.getQueue();
    const r = queue[this.activeIdx];
    if (!r) return;
    if (!r.screenReview) r.screenReview = { decision: '', reviewer1: '', reviewer2: '', confirmed: false, note: '', ts1: '', ts2: '', sig1: '', sig2: '' };
    r.screenReview.note = note;
    await idbPut('references', r);
  },

  toggleFilter(type) {
    this.filter = type;
    this.activeIdx = 0;
    this.render();
  }
};
```

**Step 4: Add keyboard shortcuts in DOMContentLoaded**

```javascript
window.addEventListener('keydown', (e) => {
  if (currentMode !== 'rapidmeta' || currentRMPhase !== 'rm-screen') return;
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
  if (e.key.toLowerCase() === 'i') rmScreenEngine.resolve('include');
  if (e.key.toLowerCase() === 'e') rmScreenEngine.resolve('exclude');
  if (e.key.toLowerCase() === 'c') rmScreenEngine.confirmCurrent();
  if (e.key.toLowerCase() === 'n') { rmScreenEngine.activeIdx++; rmScreenEngine.render(); }
  if (e.key.toLowerCase() === 'p') { rmScreenEngine.activeIdx = Math.max(0, rmScreenEngine.activeIdx - 1); rmScreenEngine.render(); }
});
```

**Step 5: Commit**

```bash
git commit -m "feat(rapidmeta): add Screening tab with dual-reviewer workflow"
```

---

### Task 7: Extraction Tab — Evidence Panels + RoB

**Files:**
- Modify: `metasprint-autopilot.html`

**Step 1: Add Extraction HTML**

Fill `#rmExtractContent` with:
- Header with "Extract & Verify Evidence" button
- View selector: Data Entry / Demographics / Risk of Bias
- Study cards (rendered dynamically from included references)
- Each card has: 2x2 data form, evidence panels (3 types), RoB circles (5 domains)
- Manual entry fallback form (collapsible)
- Audit log panel

**Step 2: Add rmExtractEngine JS**

```javascript
const rmExtractEngine = {
  view: 'data', // 'data' | 'demographics' | 'rob'

  async render() {
    const refs = await idbGetAll('references');
    const included = refs.filter(r => r.decision === 'include');
    const studies = await idbGetAll('studies');
    // Render study cards for each included reference
    // Each card shows: trial name, 2x2 inputs, evidence panels, RoB
    // Reuse existing studies store for data
  },

  setView(v) {
    this.view = v;
    this.render();
  },

  async saveStudyData(studyId, field, value) {
    // Update study in IDB studies store
  },

  cycleRoB(studyId, domain) {
    // Cycle: low -> some -> high -> low
    // Update study.rob[domain] in IDB
  },

  renderEvidencePanel(type, label, text, source) {
    // Returns HTML for evidence-panel-summary / locator / meta
    return '<div class="evidence-panel evidence-panel-' + type + '">' +
      '<div class="evidence-label">' + escapeHtml(label) + '</div>' +
      (source ? '<div style="font-size:0.65rem;color:var(--text-muted);font-style:italic">' + escapeHtml(source) + '</div>' : '') +
      '<div style="font-size:0.8rem;line-height:1.6">' + escapeHtml(text) + '</div>' +
    '</div>';
  }
};
```

**Step 3: Commit**

```bash
git commit -m "feat(rapidmeta): add Extraction tab with evidence panels and RoB"
```

---

### Task 8: Analysis Suite — 16 Charts

**Files:**
- Modify: `metasprint-autopilot.html`

This is the largest tab but heavily reuses existing stat functions.

**Step 1: Add Analysis HTML**

Fill `#rmAnalysisContent` with:
- Primary stat cards row (OR/RR, CI, I2, tau2, Q-test) — large typography
- Secondary stat cards (HKSJ CI, prediction interval, fragility index, NNT)
- Bayesian card (posterior CrI, P(effect<1), info fraction)
- Prior sensitivity buttons (Informative / Vague / Flat)
- Effect measure selector (OR / RR / HR / MD / SMD)
- Confidence level buttons (90% / 95% / 99%)
- Publication bias chips (Egger p, trim-fill, Copas, RIS)
- Chart grid (4x4 responsive) — 16 div containers with ids `rmChart1`..`rmChart16`
- R validation panel (collapsible)
- Demographics table

**Step 2: Add rmAnalysisEngine JS**

```javascript
const rmAnalysisEngine = {
  confLevel: 0.95,
  effectMeasure: 'OR',
  bayesPrior: 'vague',

  async render() {
    const studies = await idbGetAll('studies');
    if (studies.length === 0) {
      document.getElementById('rmAnalysisContent').innerHTML = '<p style="color:var(--text-muted)">No extracted studies. Go to Extraction tab first.</p>';
      return;
    }
    // 1. Run computeMetaAnalysis() (line 8696) — reuse existing
    const result = computeMetaAnalysis(studies, this.confLevel);
    // 2. Run REML + HKSJ
    const remlResult = JSON.parse(JSON.stringify(result));
    _applyREMLWeights(remlResult, this.confLevel);
    applyHKSJ(remlResult);
    // 3. Render primary stat cards
    this.renderStatCards(result, remlResult);
    // 4. Render 16 charts
    this.renderAllCharts(result, studies);
    // 5. Render bias chips
    this.renderBiasChips(result);
    // 6. Render Bayesian
    this.renderBayesian(result);
  },

  renderStatCards(result, hksjResult) {
    // Large cards for pooled OR, CI, I2, tau2, Q, HKSJ CI, PI, FI, NNT
  },

  renderAllCharts(result, studies) {
    // Chart 1: Forest plot — renderForestPlot(result) (line 10894)
    // Chart 2: Subgroup forest — group studies by subgroup field
    // Chart 3: Cumulative — sequential addition of studies
    // Chart 4: Z-curve — z-value distribution
    // Chart 5: Leave-one-out — iterate excluding each study
    // Chart 6: L'Abbe — event rates scatter
    // Chart 7: Galbraith — precision vs standardized effect
    // Chart 8: NNT curve — 1/ARD across baseline risks
    // Chart 9: Funnel — renderFunnelPlot(result) (line 11319)
    // Chart 10: Baujat — influence vs heterogeneity contribution
    // Chart 11: Bayesian posterior — density curve
    // Chart 12: Meta-regression — WLS scatter
    // Chart 13: Copas — selection-model sensitivity
    // Chart 14: Conditional power — power curve
    // Chart 15: Egger's regression — weighted regression line
    // Chart 16: RoB summary — stacked bar chart
    // Each chart renders into its container div as SVG
  },

  renderBiasChips(result) {
    // Egger p-value, trim-fill results, Copas, RIS
    if (result.studyResults.length >= 3) {
      const egger = eggersTest(result);
      // render chip
    }
    const tf = trimAndFill(result.studyResults, result, this.confLevel);
    // render chip
  },

  renderBayesian(result) {
    const bayes = computeBayesianCrI(result.studyResults, this.confLevel);
    // render card
  },

  setConfLevel(cl) { this.confLevel = cl; this.render(); },
  setEffectMeasure(em) { this.effectMeasure = em; this.render(); },
  setPrior(prior) { this.bayesPrior = prior; this.render(); }
};
```

**Step 3: Commit**

```bash
git commit -m "feat(rapidmeta): add Analysis Suite with 16 charts and stat cards"
```

---

### Task 9: Scientific Output Tab

**Files:**
- Modify: `metasprint-autopilot.html`

**Step 1: Add Output HTML**

Fill `#rmOutputContent` with:
- Visual abstract card (white card, 3-column grid: design / main result / conclusion)
- Forest plot section (publication-quality, annotated)
- Summary of Findings table (GRADE per outcome)
- PRISMA 2020 flow diagram (auto-generated from screening counts)
- Version timeline (snapshot list)
- Data seal display (SHA-256 hash of current dataset)
- Export buttons: CSV, JSON, HTML, Python, PRISMA checklist, R code
- Patient mode toggle + traffic-light display

**Step 2: Add rmOutputEngine JS**

```javascript
const rmOutputEngine = {
  patientMode: false,

  async render() {
    const refs = await idbGetAll('references');
    const studies = await idbGetAll('studies');
    const included = refs.filter(r => r.decision === 'include');
    const excluded = refs.filter(r => r.decision === 'exclude');

    this.renderVisualAbstract(studies);
    this.renderPRISMA(refs.length, included.length, excluded.length);
    this.renderSoFTable(studies);
    this.renderDataSeal(studies);
    this.renderExportMenu();
    if (this.patientMode) this.renderPatientView(studies);
  },

  renderVisualAbstract(studies) {
    // White card with blue header
    // 3-col grid: Study Design | Main Result | Conclusion
  },

  renderPRISMA(total, included, excluded) {
    // Auto-generated flow diagram
    // Records identified → Screened → Assessed → Included
    // With exclusion reasons at each step
  },

  renderSoFTable(studies) {
    // GRADE formatted: outcome, N studies, N participants, effect (CI), certainty
  },

  async renderDataSeal(studies) {
    // SHA-256 of JSON.stringify(studies) using SubtleCrypto
    const data = JSON.stringify(studies);
    const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(data));
    const hex = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
    // Display truncated hex
  },

  renderExportMenu() {
    // Buttons for CSV, JSON, HTML report, Python, PRISMA checklist, R code
  },

  togglePatientMode() {
    this.patientMode = !this.patientMode;
    this.render();
  },

  renderPatientView(studies) {
    // Traffic light (green/amber/red circles)
    // Plain language summary
    // NNT as "1 in X benefit" narrative
  },

  // Export functions
  exportCSV() { /* reuse existing CSV export pattern */ },
  exportJSON() { /* full state bundle */ },
  exportR() { /* generate R validation script */ },
  exportPython() { /* generate Python script */ }
};
```

**Step 3: Commit**

```bash
git commit -m "feat(rapidmeta): add Scientific Output with visual abstract, PRISMA, GRADE, exports"
```

---

### Task 10: Integration Testing

**Files:**
- Create: `tests/test_rapidmeta_mode.spec.js`

**Step 1: Write Playwright tests**

```javascript
// Tests to write:
// 1. Startup modal appears on fresh load (no localStorage)
// 2. Selecting RapidMeta hides Autopilot tabs, shows RM tabs
// 3. Selecting Autopilot hides RM tabs, shows AP tabs
// 4. "Remember my choice" persists across page reloads
// 5. Header mode dropdown switches between modes
// 6. RapidMeta Protocol tab renders PICO form
// 7. RapidMeta Search tab shows source buttons
// 8. Screening dual-reviewer flow: propose → confirm
// 9. Screening keyboard shortcuts (I/E/C/N/P)
// 10. Extraction tab shows included studies
// 11. Evidence panels render correctly (3 types)
// 12. Analysis Suite renders stat cards
// 13. Analysis Suite renders 16 chart containers
// 14. Scientific Output renders visual abstract
// 15. PRISMA flow shows correct counts
// 16. Data seal generates SHA-256
// 17. Export buttons are present
// 18. Patient mode toggle works
// 19. Mode switch preserves data (shared IndexedDB)
// 20. Existing Autopilot tests still pass (regression)
```

**Step 2: Run existing tests to verify no regression**

```bash
npx playwright test tests/ --reporter=list
```

**Step 3: Commit**

```bash
git commit -m "test: add 20 Playwright tests for RapidMeta mode"
```

---

### Task 11: Final Polish + Div Balance Check

**Files:**
- Modify: `metasprint-autopilot.html`

**Step 1: Div balance verification**

```bash
grep -c '<div[\s>]' metasprint-autopilot.html
grep -c '</div>' metasprint-autopilot.html
# These counts must match
```

**Step 2: Check for `</script>` inside template literals**

```bash
grep -n '</script>' metasprint-autopilot.html
# Only the actual closing tag should appear, not inside JS strings
```

**Step 3: Verify element ID uniqueness**

```bash
grep -oP 'id="[^"]*"' metasprint-autopilot.html | sort | uniq -d
# Should return empty (no duplicates)
```

**Step 4: Final commit**

```bash
git commit -m "chore: verify div balance, ID uniqueness, and script integrity"
```

---

## Execution Order Summary

| Task | Description | Depends On | ~Lines Added |
|------|------------|------------|-------------|
| 1 | Startup Modal HTML + CSS | — | ~120 |
| 2 | Mode Switching JS | Task 1 | ~100 |
| 3 | Tab Bar + Empty Shells | Task 2 | ~80 |
| 4 | Protocol Tab | Task 3 | ~200 |
| 5 | Search Tab | Task 3 | ~150 |
| 6 | Screening Tab | Task 3 | ~350 |
| 7 | Extraction Tab | Task 6 | ~300 |
| 8 | Analysis Suite | Task 7 | ~500 |
| 9 | Scientific Output | Task 8 | ~400 |
| 10 | Integration Tests | Task 9 | ~300 |
| 11 | Final Polish | Task 10 | ~20 |
| **Total** | | | **~2,520** |
