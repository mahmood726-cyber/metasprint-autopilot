# MetaSprint Autopilot — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a single-file HTML meta-analysis automation platform with 7 workflow phases (Discover, Protocol, Search, Screen, Extract, Analyze, Write).

**Architecture:** Single HTML file (~30-40K lines), tab-based wizard, IndexedDB for data, localStorage for UI state. All API calls from browser (PubMed, OpenAlex, CT.gov — all CORS-friendly). No server dependencies.

**Tech Stack:** Vanilla HTML/CSS/JS, IndexedDB, PubMed E-utilities, OpenAlex REST, CT.gov API v2, SVG for plots.

**Build Order:** Skeleton → Screen → Extract → Analyze → Search → Discover → Protocol → Write

---

## Task 1: App Skeleton — HTML Structure, CSS, Tab Navigation

**Files:**
- Create: `metasprint-autopilot.html`

**Step 1: Create the base HTML with CSS variables and tab system**

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>MetaSprint Autopilot</title>
<style>
:root {
  --primary: #2563eb;
  --primary-hover: #1d4ed8;
  --success: #10b981;
  --warning: #f59e0b;
  --danger: #ef4444;
  --info: #6366f1;
  --bg: #f8fafc;
  --surface: #ffffff;
  --text: #1e293b;
  --text-muted: #64748b;
  --border: #e2e8f0;
  --radius: 8px;
  --shadow: 0 1px 3px rgba(0,0,0,0.1);
  --font: system-ui, -apple-system, sans-serif;
}
/* ... (full CSS in implementation) */
</style>
</head>
<body>
  <header class="app-header">
    <h1>MetaSprint Autopilot</h1>
    <div class="header-actions">
      <select id="projectSelect"></select>
      <button onclick="createProject()">New Project</button>
      <button onclick="exportProject()">Export</button>
      <button onclick="importProject()">Import</button>
    </div>
  </header>

  <nav class="tab-bar" role="tablist">
    <button class="tab active" data-phase="discover" role="tab">1. Discover</button>
    <button class="tab" data-phase="protocol" role="tab">2. Protocol</button>
    <button class="tab" data-phase="search" role="tab">3. Search</button>
    <button class="tab" data-phase="screen" role="tab">4. Screen</button>
    <button class="tab" data-phase="extract" role="tab">5. Extract</button>
    <button class="tab" data-phase="analyze" role="tab">6. Analyze</button>
    <button class="tab" data-phase="write" role="tab">7. Write</button>
  </nav>

  <main id="mainContent">
    <section id="phase-discover" class="phase active"><!-- Phase 1 --></section>
    <section id="phase-protocol" class="phase"><!-- Phase 2 --></section>
    <section id="phase-search" class="phase"><!-- Phase 3 --></section>
    <section id="phase-screen" class="phase"><!-- Phase 4 --></section>
    <section id="phase-extract" class="phase"><!-- Phase 5 --></section>
    <section id="phase-analyze" class="phase"><!-- Phase 6 --></section>
    <section id="phase-write" class="phase"><!-- Phase 7 --></section>
  </main>

  <div id="toastContainer"></div>
  <script>
  // ... app code
  </script>
</body>
</html>
```

**Step 2: Implement core utilities**

These utility functions go at the top of the `<script>` block:

```javascript
// --- Utilities ---
function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

function toSafeFloat(value, fallback = null) {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : fallback;
}

function toSafeInt(value, fallback = 0, min = 0, max = 1000000) {
  const n = parseInt(value, 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function generateId() {
  return 'r' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function showToast(msg, type = 'info', duration = 3000) {
  const container = document.getElementById('toastContainer');
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.textContent = msg;
  container.appendChild(el);
  setTimeout(() => el.remove(), duration);
}

function debounce(fn, ms = 300) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); };
}
```

**Step 3: Implement tab navigation**

```javascript
// --- Tab Navigation ---
let currentPhase = 'discover';

function switchPhase(phase) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.phase').forEach(p => p.classList.remove('active'));
  document.querySelector(`[data-phase="${phase}"]`)?.classList.add('active');
  document.getElementById(`phase-${phase}`)?.classList.add('active');
  currentPhase = phase;
  localStorage.setItem('msa-state', JSON.stringify({ phase, projectId: currentProjectId }));
}

document.querySelector('.tab-bar').addEventListener('click', (e) => {
  const tab = e.target.closest('[data-phase]');
  if (tab) switchPhase(tab.dataset.phase);
});
```

**Step 4: Implement IndexedDB initialization**

```javascript
// --- IndexedDB ---
const DB_NAME = 'MetaSprintAutopilot';
const DB_VERSION = 1;
let db = null;

function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('references')) {
        const store = db.createObjectStore('references', { keyPath: 'id' });
        store.createIndex('doi', 'doi', { unique: false });
        store.createIndex('pmid', 'pmid', { unique: false });
        store.createIndex('projectId', 'projectId', { unique: false });
      }
      if (!db.objectStoreNames.contains('studies')) {
        const store = db.createObjectStore('studies', { keyPath: 'id' });
        store.createIndex('projectId', 'projectId', { unique: false });
      }
      if (!db.objectStoreNames.contains('searches')) {
        const store = db.createObjectStore('searches', { keyPath: 'id' });
        store.createIndex('projectId', 'projectId', { unique: false });
      }
      if (!db.objectStoreNames.contains('projects')) {
        db.createObjectStore('projects', { keyPath: 'id' });
      }
    };
    request.onsuccess = (e) => { db = e.target.result; resolve(db); };
    request.onerror = (e) => reject(e.target.error);
  });
}
```

**Step 5: Implement project management**

```javascript
// --- Project Management ---
let currentProjectId = null;
let projects = [];

function createEmptyProject(name) {
  return {
    id: generateId(),
    name: name || 'Untitled Review',
    createdAt: new Date().toISOString(),
    pico: { P: '', I: '', C: '', O: '' },
    searchStrategy: '',
    prisma: { identified: 0, duplicates: 0, screened: 0,
              excludedScreen: 0, fullText: 0, excludedFullText: 0, included: 0 },
    settings: {}
  };
}

async function createProject() {
  const name = prompt('Project name:');
  if (!name) return;
  const project = createEmptyProject(name.slice(0, 80));
  const tx = db.transaction('projects', 'readwrite');
  tx.objectStore('projects').put(project);
  await tx.complete;
  currentProjectId = project.id;
  await loadProjects();
  showToast('Project created', 'success');
}

async function loadProjects() {
  const tx = db.transaction('projects', 'readonly');
  const store = tx.objectStore('projects');
  projects = await new Promise((resolve, reject) => {
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  renderProjectSelect();
}

function renderProjectSelect() {
  const sel = document.getElementById('projectSelect');
  sel.innerHTML = projects.map(p =>
    `<option value="${p.id}" ${p.id === currentProjectId ? 'selected' : ''}>${escapeHtml(p.name)}</option>`
  ).join('');
}
```

**Step 6: Implement app initialization**

```javascript
// --- Init ---
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await initDB();
    await loadProjects();
    if (projects.length === 0) {
      const p = createEmptyProject('My First Review');
      const tx = db.transaction('projects', 'readwrite');
      tx.objectStore('projects').put(p);
      currentProjectId = p.id;
      await loadProjects();
    } else {
      const saved = JSON.parse(localStorage.getItem('msa-state') || '{}');
      currentProjectId = saved.projectId || projects[0].id;
      if (saved.phase) switchPhase(saved.phase);
    }
    renderProjectSelect();
  } catch (err) {
    console.error('Init failed:', err);
    showToast('Failed to initialize database', 'danger');
  }
});
```

**Step 7: Verify skeleton works**

Open `metasprint-autopilot.html` in browser. Verify:
- 7 tabs render and switch correctly
- Project dropdown populates with "My First Review"
- Toast notifications work
- No console errors

---

## Task 2: Phase 4 — RIS/BibTeX File Import & Parsing

**Files:**
- Modify: `metasprint-autopilot.html` (add to Phase 4 section and script)

**Step 1: Add the import UI to Phase 4**

```html
<!-- Inside #phase-screen -->
<div class="screen-header">
  <h2>Abstract Screening</h2>
  <div class="import-actions">
    <button onclick="document.getElementById('risFileInput').click()">Import RIS/BibTeX</button>
    <button onclick="importFromPMIDList()">Paste PMIDs</button>
    <button onclick="importFromPhase3()">From Search Results</button>
    <input type="file" id="risFileInput" accept=".ris,.bib,.nbib,.xml,.csv,.txt"
           style="display:none" onchange="handleFileImport(event)" multiple>
    <span id="refCount">0 references</span>
  </div>
</div>
<div class="screen-layout">
  <div class="ref-list" id="refList"></div>
  <div class="ref-detail" id="refDetail">
    <p class="placeholder">Select a reference to view details</p>
  </div>
</div>
<div class="decision-bar" id="decisionBar" style="display:none">
  <button class="btn-success" onclick="makeDecision('include')">Include <kbd>I</kbd></button>
  <button class="btn-warning" onclick="makeDecision('maybe')">Maybe <kbd>M</kbd></button>
  <button class="btn-danger" onclick="makeDecision('exclude')">Exclude <kbd>E</kbd></button>
  <button class="btn-info" onclick="makeDecision('duplicate')">Duplicate <kbd>D</kbd></button>
  <button onclick="skipRecord()">Skip <kbd>N</kbd></button>
</div>
```

**Step 2: Implement RIS parser**

```javascript
// --- RIS Parser ---
function parseRIS(content) {
  const entries = content.split(/\r?\nER\s*-/);
  const parsed = [];
  for (const entry of entries) {
    if (!entry.trim()) continue;
    const record = { id: generateId(), keywords: [], projectId: currentProjectId };
    const lines = entry.split(/\r?\n/);
    let currentTag = '';
    for (const line of lines) {
      const match = line.match(/^([A-Z][A-Z0-9])\s+-\s+(.*)$/);
      if (match) {
        currentTag = match[1];
        const value = match[2].trim();
        switch (currentTag) {
          case 'TY': record.type = value; break;
          case 'TI': case 'T1': record.title = (record.title || '') + value; break;
          case 'AU': case 'A1': record.authors = record.authors ? record.authors + '; ' + value : value; break;
          case 'PY': case 'Y1': record.year = value.substring(0, 4); break;
          case 'AB': case 'N2': record.abstract = (record.abstract || '') + value; break;
          case 'JO': case 'JF': case 'T2': record.journal = value; break;
          case 'VL': record.volume = value; break;
          case 'IS': record.issue = value; break;
          case 'SP': record.startPage = value; break;
          case 'EP': record.endPage = value; break;
          case 'DO': record.doi = value; break;
          case 'AN': record.pmid = value; break;
          case 'KW': record.keywords.push(value); break;
        }
      } else if (currentTag && line.startsWith('      ')) {
        const value = line.trim();
        if (currentTag === 'AB' || currentTag === 'N2') record.abstract = (record.abstract || '') + ' ' + value;
        if (currentTag === 'TI' || currentTag === 'T1') record.title = (record.title || '') + ' ' + value;
      }
    }
    if (record.title) parsed.push(record);
  }
  return parsed;
}
```

**Step 3: Implement BibTeX parser**

```javascript
function parseBibTeX(content) {
  const entries = content.split(/(?=@\w+\{)/);
  const parsed = [];
  for (const entry of entries) {
    if (!entry.trim()) continue;
    const record = { id: generateId(), keywords: [], projectId: currentProjectId };
    const f = (pat) => { const m = entry.match(pat); return m ? m[1].replace(/[{}]/g, '') : ''; };
    record.title = f(/title\s*=\s*[{"]([^}"]+)[}"]/i);
    record.authors = f(/author\s*=\s*[{"]([^}"]+)[}"]/i).replace(/ and /g, '; ');
    record.year = f(/year\s*=\s*[{"]?(\d{4})[}""]?/i);
    record.abstract = f(/abstract\s*=\s*[{"]([^}"]+)[}"]/i);
    record.journal = f(/journal\s*=\s*[{"]([^}"]+)[}"]/i);
    record.doi = f(/doi\s*=\s*[{"]([^}"]+)[}"]/i);
    record.volume = f(/volume\s*=\s*[{"]?(\d+)[}""]?/i);
    const pages = f(/pages\s*=\s*[{"]([^}"]+)[}"]/i);
    if (pages) {
      const parts = pages.split(/[-\u2013]/);
      record.startPage = parts[0];
      if (parts[1]) record.endPage = parts[1];
    }
    if (record.title) parsed.push(record);
  }
  return parsed;
}
```

**Step 4: Implement PubMed NBIB parser**

```javascript
function parsePubMedNBib(content) {
  const entries = content.split(/\r?\n\r?\n(?=PMID-)/);
  const parsed = [];
  for (const entry of entries) {
    if (!entry.trim()) continue;
    const record = { id: generateId(), keywords: [], projectId: currentProjectId };
    const lines = entry.split(/\r?\n/);
    let currentTag = '';
    for (const line of lines) {
      const match = line.match(/^([A-Z]+)\s*-\s*(.*)$/);
      if (match) {
        currentTag = match[1];
        const value = match[2].trim();
        switch (currentTag) {
          case 'PMID': record.pmid = value; break;
          case 'TI': record.title = (record.title || '') + value; break;
          case 'AU': record.authors = record.authors ? record.authors + '; ' + value : value; break;
          case 'DP': record.year = value.substring(0, 4); break;
          case 'AB': record.abstract = (record.abstract || '') + value; break;
          case 'TA': case 'JT': record.journal = value; break;
          case 'VI': record.volume = value; break;
          case 'IP': record.issue = value; break;
          case 'PG':
            const pages = value.split('-');
            record.startPage = pages[0];
            if (pages[1]) record.endPage = pages[1];
            break;
          case 'AID':
            if (value.includes('[doi]')) record.doi = value.replace('[doi]', '').trim();
            break;
          case 'MH': case 'OT': record.keywords.push(value); break;
        }
      } else if (currentTag && line.startsWith('      ')) {
        const value = line.trim();
        if (currentTag === 'AB') record.abstract = (record.abstract || '') + ' ' + value;
        if (currentTag === 'TI') record.title = (record.title || '') + ' ' + value;
      }
    }
    if (record.title) parsed.push(record);
  }
  return parsed;
}
```

**Step 5: Implement file import handler and IndexedDB storage**

```javascript
async function handleFileImport(event) {
  const files = event.target.files;
  if (!files.length) return;
  let totalImported = 0;
  for (const file of files) {
    const content = await file.text();
    let records = [];
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext === 'ris' || ext === 'txt') records = parseRIS(content);
    else if (ext === 'bib') records = parseBibTeX(content);
    else if (ext === 'nbib') records = parsePubMedNBib(content);
    else if (ext === 'xml') records = parseEndNoteXML(content);
    else if (ext === 'csv') records = parseCSVReferences(content);
    else { showToast(`Unknown format: .${ext}`, 'warning'); continue; }

    // Store in IndexedDB
    const tx = db.transaction('references', 'readwrite');
    const store = tx.objectStore('references');
    for (const rec of records) {
      rec.importedAt = new Date().toISOString();
      rec.source = file.name;
      rec.decision = null;
      rec.reason = '';
      store.put(rec);
    }
    totalImported += records.length;
  }
  event.target.value = '';
  showToast(`Imported ${totalImported} references`, 'success');
  await renderReferenceList();
}

function parseEndNoteXML(content) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'text/xml');
  const recs = doc.querySelectorAll('record, Record');
  const parsed = [];
  recs.forEach(rec => {
    const record = { id: generateId(), keywords: [], projectId: currentProjectId };
    const q = (sel) => rec.querySelector(sel)?.textContent?.trim() || '';
    record.title = q('titles title, title');
    record.authors = Array.from(rec.querySelectorAll('authors author, contributors author'))
      .map(a => a.textContent.trim()).join('; ');
    record.year = q('dates year, year');
    record.abstract = q('abstract');
    record.journal = q('periodical full-title, secondary-title');
    record.doi = q('electronic-resource-num');
    record.pmid = q('accession-num');
    rec.querySelectorAll('keywords keyword').forEach(kw => record.keywords.push(kw.textContent.trim()));
    if (record.title) parsed.push(record);
  });
  return parsed;
}

function parseCSVReferences(content) {
  const lines = content.split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = parseCSVLine(lines[0].replace(/^\uFEFF/, '')).map(h => h.trim().toLowerCase());
  const parsed = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const values = parseCSVLine(lines[i]);
    const record = { id: generateId(), keywords: [], projectId: currentProjectId };
    headers.forEach((h, idx) => {
      const val = values[idx] || '';
      if (h.includes('title')) record.title = val;
      else if (h.includes('author')) record.authors = val;
      else if (h.includes('year')) record.year = val;
      else if (h.includes('abstract')) record.abstract = val;
      else if (h.includes('journal')) record.journal = val;
      else if (h.includes('doi')) record.doi = val;
      else if (h.includes('pmid')) record.pmid = val;
    });
    if (record.title) parsed.push(record);
  }
  return parsed;
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (ch === ',' && !inQuotes) { result.push(current.trim()); current = ''; }
    else { current += ch; }
  }
  result.push(current.trim());
  return result;
}
```

**Step 6: Verify file import works**

Test with a sample RIS file. Verify records appear in IndexedDB (DevTools > Application > IndexedDB).

---

## Task 3: Phase 4 — Screening UI, Decisions, Keyboard Shortcuts

**Files:**
- Modify: `metasprint-autopilot.html`

**Step 1: Implement reference list rendering**

```javascript
let allReferences = [];
let selectedRefId = null;
let filterStatus = 'all'; // all, pending, include, exclude, maybe, duplicate

async function loadReferences() {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('references', 'readonly');
    const store = tx.objectStore('references');
    const index = store.index('projectId');
    const req = index.getAll(currentProjectId);
    req.onsuccess = () => { allReferences = req.result; resolve(allReferences); };
    req.onerror = () => reject(req.error);
  });
}

async function renderReferenceList() {
  await loadReferences();
  const filtered = allReferences.filter(r => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'pending') return !r.decision;
    return r.decision === filterStatus;
  });
  const list = document.getElementById('refList');
  document.getElementById('refCount').textContent = `${allReferences.length} references`;
  list.innerHTML = filtered.map(r => `
    <div class="ref-item ${r.id === selectedRefId ? 'selected' : ''} ${r.decision ? 'decision-' + r.decision : ''}"
         onclick="selectReference('${r.id}')">
      <div class="ref-title">${escapeHtml((r.title || 'Untitled').slice(0, 120))}</div>
      <div class="ref-meta">${escapeHtml(r.authors?.split(';')[0] || '')} ${r.year ? '(' + escapeHtml(r.year) + ')' : ''}</div>
      ${r.decision ? `<span class="badge badge-${r.decision}">${r.decision}</span>` : ''}
    </div>
  `).join('');
}
```

**Step 2: Implement reference detail view with keyword highlighting**

```javascript
function selectReference(id) {
  selectedRefId = id;
  const r = allReferences.find(ref => ref.id === id);
  if (!r) return;
  document.getElementById('decisionBar').style.display = 'flex';
  const detail = document.getElementById('refDetail');
  const project = projects.find(p => p.id === currentProjectId);
  const picoTerms = project ? [project.pico.P, project.pico.I, project.pico.C, project.pico.O]
    .filter(Boolean).flatMap(t => t.split(/[,;]/).map(s => s.trim()).filter(Boolean)) : [];

  detail.innerHTML = `
    <h2 class="detail-title">${escapeHtml(r.title || 'Untitled')}</h2>
    <div class="detail-section">
      <h3>Authors</h3><p>${escapeHtml(r.authors || 'Not available')}</p>
    </div>
    <div class="detail-section">
      <h3>Publication</h3>
      <p>${escapeHtml(r.journal || 'Unknown')} ${r.year ? '(' + escapeHtml(r.year) + ')' : ''}${r.volume ? ', Vol. ' + escapeHtml(r.volume) : ''}${r.issue ? '(' + escapeHtml(r.issue) + ')' : ''}${r.startPage ? ': ' + escapeHtml(r.startPage) + (r.endPage ? '-' + escapeHtml(r.endPage) : '') : ''}</p>
      ${r.doi ? `<p class="text-muted">DOI: ${escapeHtml(r.doi)}</p>` : ''}
      ${r.pmid ? `<p class="text-muted">PMID: ${escapeHtml(r.pmid)}</p>` : ''}
    </div>
    <div class="detail-section">
      <h3>Abstract</h3>
      <div class="abstract-content">${highlightTerms(escapeHtml(r.abstract || 'No abstract available'), picoTerms)}</div>
    </div>
    ${r.keywords?.length ? `<div class="detail-section"><h3>Keywords</h3><div class="keyword-list">${r.keywords.map(k => `<span class="keyword">${escapeHtml(k)}</span>`).join('')}</div></div>` : ''}
    <div class="detail-section">
      <label>Exclusion Reason:</label>
      <input type="text" id="exclusionReason" value="${escapeHtml(r.reason || '')}" placeholder="e.g., wrong population, not RCT..."
             onchange="updateReason(this.value)">
    </div>
  `;
  renderReferenceList();
}

function highlightTerms(text, terms) {
  if (!terms.length) return text;
  const escaped = terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const regex = new RegExp(`(${escaped.join('|')})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}
```

**Step 3: Implement decision making and keyboard shortcuts**

```javascript
async function makeDecision(decision) {
  if (!selectedRefId) return;
  const ref = allReferences.find(r => r.id === selectedRefId);
  if (!ref) return;
  ref.decision = decision;
  if (decision === 'exclude') {
    const reasonInput = document.getElementById('exclusionReason');
    if (reasonInput) ref.reason = reasonInput.value;
  }
  const tx = db.transaction('references', 'readwrite');
  tx.objectStore('references').put(ref);
  // Move to next pending
  const nextPending = allReferences.find(r => !r.decision && r.id !== selectedRefId);
  if (nextPending) selectReference(nextPending.id);
  else { selectedRefId = null; document.getElementById('decisionBar').style.display = 'none'; }
  await renderReferenceList();
  updatePRISMACounts();
}

function updateReason(value) {
  const ref = allReferences.find(r => r.id === selectedRefId);
  if (!ref) return;
  ref.reason = value.slice(0, 500);
  const tx = db.transaction('references', 'readwrite');
  tx.objectStore('references').put(ref);
}

function skipRecord() {
  const currentIdx = allReferences.findIndex(r => r.id === selectedRefId);
  if (currentIdx < allReferences.length - 1) selectReference(allReferences[currentIdx + 1].id);
}

// Keyboard shortcuts (only active on screen phase)
document.addEventListener('keydown', (e) => {
  if (currentPhase !== 'screen' || !selectedRefId) return;
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  switch (e.key.toLowerCase()) {
    case 'i': makeDecision('include'); break;
    case 'e': makeDecision('exclude'); break;
    case 'm': makeDecision('maybe'); break;
    case 'd': makeDecision('duplicate'); break;
    case 'n': skipRecord(); break;
  }
});
```

**Step 4: Verify screening workflow**

Import a sample RIS file, screen 3 references using keyboard shortcuts. Verify decisions persist after page reload.

---

## Task 4: Phase 4 — Deduplication

**Files:**
- Modify: `metasprint-autopilot.html`

**Step 1: Implement deduplication engine**

```javascript
// --- Deduplication ---
function normalizeDOI(value) {
  if (!value) return '';
  return String(value).trim().replace(/^doi:\s*/i, '')
    .replace(/^https?:\/\/(dx\.)?doi\.org\//i, '').trim().toLowerCase();
}

function normalizeTitle(title) {
  if (!title) return '';
  return title.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
}

function levenshteinSimilarity(a, b) {
  if (a === b) return 1;
  if (!a || !b) return 0;
  const longer = a.length > b.length ? a : b;
  const shorter = a.length > b.length ? b : a;
  if (longer.length === 0) return 1;
  const matrix = [];
  for (let i = 0; i <= shorter.length; i++) matrix[i] = [i];
  for (let j = 0; j <= longer.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= shorter.length; i++) {
    for (let j = 1; j <= longer.length; j++) {
      matrix[i][j] = shorter[i-1] === longer[j-1]
        ? matrix[i-1][j-1]
        : Math.min(matrix[i-1][j-1]+1, matrix[i][j-1]+1, matrix[i-1][j]+1);
    }
  }
  return (longer.length - matrix[shorter.length][longer.length]) / longer.length;
}

async function runDeduplication() {
  await loadReferences();
  const dupes = [];
  const seenDOI = new Map();
  const seenPMID = new Map();
  const seenTitle = new Map();

  for (const r of allReferences) {
    // DOI match
    if (r.doi) {
      const nd = normalizeDOI(r.doi);
      if (nd && seenDOI.has(nd)) { dupes.push({ id: r.id, of: seenDOI.get(nd), method: 'DOI' }); continue; }
      if (nd) seenDOI.set(nd, r.id);
    }
    // PMID match
    if (r.pmid) {
      const np = String(r.pmid).replace(/\D/g, '');
      if (np && seenPMID.has(np)) { dupes.push({ id: r.id, of: seenPMID.get(np), method: 'PMID' }); continue; }
      if (np) seenPMID.set(np, r.id);
    }
    // Fuzzy title match
    if (r.title) {
      const nt = normalizeTitle(r.title);
      if (!nt) continue;
      const exact = seenTitle.get(nt);
      if (exact) { dupes.push({ id: r.id, of: exact, method: 'Title (exact)' }); continue; }
      let found = false;
      for (const [existingTitle, existingId] of seenTitle) {
        if (Math.abs(existingTitle.length - nt.length) > Math.max(12, nt.length * 0.25)) continue;
        if (levenshteinSimilarity(nt, existingTitle) >= 0.85) {
          dupes.push({ id: r.id, of: existingId, method: 'Title (fuzzy)' });
          found = true; break;
        }
      }
      if (!found) seenTitle.set(nt, r.id);
    }
  }

  // Mark duplicates
  const tx = db.transaction('references', 'readwrite');
  const store = tx.objectStore('references');
  for (const d of dupes) {
    const ref = allReferences.find(r => r.id === d.id);
    if (ref && !ref.decision) {
      ref.decision = 'duplicate';
      ref.reason = `Duplicate of ${d.of} (${d.method})`;
      store.put(ref);
    }
  }
  showToast(`Found ${dupes.length} duplicates`, 'info');
  await renderReferenceList();
  updatePRISMACounts();
}
```

**Step 2: Add dedup button to UI**

Add to the screen header: `<button onclick="runDeduplication()">Find Duplicates</button>`

**Step 3: Verify dedup**

Import the same RIS file twice. Run dedup. Verify all copies are marked as duplicates.

---

## Task 5: Phase 4 — PRISMA Flow Diagram

**Files:**
- Modify: `metasprint-autopilot.html`

**Step 1: Implement PRISMA count computation and SVG generation**

```javascript
function updatePRISMACounts() {
  const counts = { total: 0, duplicates: 0, excluded: 0, included: 0, maybe: 0, pending: 0, reasons: {} };
  for (const r of allReferences) {
    counts.total++;
    if (!r.decision) counts.pending++;
    else if (r.decision === 'duplicate') counts.duplicates++;
    else if (r.decision === 'exclude') {
      counts.excluded++;
      const reason = r.reason || 'Other';
      counts.reasons[reason] = (counts.reasons[reason] || 0) + 1;
    }
    else if (r.decision === 'include') counts.included++;
    else if (r.decision === 'maybe') counts.maybe++;
  }
  const project = projects.find(p => p.id === currentProjectId);
  if (project) {
    project.prisma = {
      identified: counts.total,
      duplicates: counts.duplicates,
      screened: counts.total - counts.duplicates,
      excludedScreen: counts.excluded,
      included: counts.included
    };
    const tx = db.transaction('projects', 'readwrite');
    tx.objectStore('projects').put(project);
  }
  renderPRISMAFlow(counts);
}

function renderPRISMAFlow(stats) {
  const screened = stats.total - stats.duplicates;
  const el = document.getElementById('prismaFlow');
  if (!el) return;
  el.innerHTML = `
    <svg viewBox="0 0 700 550" xmlns="http://www.w3.org/2000/svg" style="max-width:700px;width:100%">
      <style>
        .pbox { fill: var(--surface); stroke: var(--primary); stroke-width: 2; rx: 8; }
        .pbox-ex { fill: var(--surface); stroke: var(--danger); stroke-width: 2; rx: 8; }
        .pbox-inc { fill: var(--surface); stroke: var(--success); stroke-width: 2; rx: 8; }
        .plabel { font-family: var(--font); font-size: 12px; fill: var(--text); text-anchor: middle; }
        .pvalue { font-family: var(--font); font-size: 15px; font-weight: bold; fill: var(--primary); text-anchor: middle; }
        .parrow { stroke: var(--text-muted); stroke-width: 1.5; fill: none; marker-end: url(#ah); }
      </style>
      <defs><marker id="ah" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
        <polygon points="0 0, 8 3, 0 6" fill="var(--text-muted)"/></marker></defs>

      <rect class="pbox" x="175" y="20" width="350" height="60"/>
      <text class="plabel" x="350" y="45">Records identified</text>
      <text class="pvalue" x="350" y="65">(n = ${stats.total})</text>

      <path class="parrow" d="M350 80 L350 110"/>

      <rect class="pbox" x="175" y="110" width="350" height="60"/>
      <text class="plabel" x="350" y="135">After duplicates removed</text>
      <text class="pvalue" x="350" y="155">(n = ${screened})</text>

      <rect class="pbox-ex" x="545" y="70" width="140" height="50"/>
      <text class="plabel" x="615" y="90" style="fill:var(--danger)">Duplicates</text>
      <text class="pvalue" x="615" y="108" style="fill:var(--danger)">(n = ${stats.duplicates})</text>
      <path d="M525 95 L545 95" style="stroke:var(--danger);stroke-width:1.5"/>

      <path class="parrow" d="M350 170 L350 200"/>

      <rect class="pbox" x="175" y="200" width="350" height="60"/>
      <text class="plabel" x="350" y="225">Records screened</text>
      <text class="pvalue" x="350" y="245">(n = ${screened})</text>

      <rect class="pbox-ex" x="545" y="200" width="140" height="60"/>
      <text class="plabel" x="615" y="220" style="fill:var(--danger)">Excluded</text>
      <text class="pvalue" x="615" y="245" style="fill:var(--danger)">(n = ${stats.excluded})</text>
      <path d="M525 230 L545 230" style="stroke:var(--danger);stroke-width:1.5"/>

      <path class="parrow" d="M350 260 L350 290"/>

      <rect class="pbox" x="175" y="290" width="350" height="60"/>
      <text class="plabel" x="350" y="315">Awaiting decision</text>
      <text class="pvalue" x="350" y="335">(n = ${stats.pending + stats.maybe})</text>

      <path class="parrow" d="M350 350 L350 380"/>

      <rect class="pbox-inc" x="175" y="380" width="350" height="60"/>
      <text class="plabel" x="350" y="405" style="fill:var(--success)">Studies included</text>
      <text class="pvalue" x="350" y="425" style="fill:var(--success)">(n = ${stats.included})</text>
    </svg>
  `;
}
```

**Step 2: Add PRISMA container to Phase 4 HTML**

Add after the decision bar:
```html
<div class="prisma-section">
  <h3>PRISMA Flow</h3>
  <div id="prismaFlow"></div>
  <button onclick="exportPRISMASVG()">Export SVG</button>
</div>
```

**Step 3: Verify PRISMA updates live**

Screen several references, verify PRISMA counts update after each decision.

---

## Task 6: Phase 5 — Data Extraction Forms

**Files:**
- Modify: `metasprint-autopilot.html`

**Step 1: Add extraction UI to Phase 5**

```html
<!-- Inside #phase-extract -->
<div class="extract-header">
  <h2>Data Extraction</h2>
  <button onclick="addStudyRow()">Add Study</button>
  <button onclick="autoPopulateFromIncluded()">Import from Screening</button>
  <button onclick="exportToMetaSprint('pairwise')">Export for MetaSprint Pairwise</button>
  <button onclick="exportToMetaSprint('nma')">Export for MetaSprint NMA</button>
  <button onclick="exportStudiesCSV()">Export CSV</button>
</div>
<table class="extract-table" id="extractTable">
  <thead><tr>
    <th>Study ID</th><th>N Total</th><th>N Intervention</th><th>N Control</th>
    <th>Effect</th><th>Lower CI</th><th>Upper CI</th><th>Type</th>
    <th>Weight</th><th>Notes</th><th></th>
  </tr></thead>
  <tbody id="extractBody"></tbody>
</table>
```

**Step 2: Implement study row management**

```javascript
const VALID_EFFECT_TYPES = ['OR', 'RR', 'HR', 'MD', 'SMD', 'RD', 'Other'];
let extractedStudies = [];

async function loadStudies() {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('studies', 'readonly');
    const index = tx.objectStore('studies').index('projectId');
    const req = index.getAll(currentProjectId);
    req.onsuccess = () => { extractedStudies = req.result; resolve(); };
    req.onerror = () => reject(req.error);
  });
}

function addStudyRow(data = {}) {
  const study = {
    id: data.id || generateId(),
    projectId: currentProjectId,
    authorYear: data.authorYear || '',
    nTotal: data.nTotal ?? null,
    nIntervention: data.nIntervention ?? null,
    nControl: data.nControl ?? null,
    effectEstimate: data.effectEstimate ?? null,
    lowerCI: data.lowerCI ?? null,
    upperCI: data.upperCI ?? null,
    effectType: VALID_EFFECT_TYPES.includes(data.effectType) ? data.effectType : 'OR',
    weight: data.weight ?? null,
    notes: data.notes || '',
    rob: { d1: '', d2: '', d3: '', d4: '', d5: '', overall: '' }
  };
  extractedStudies.push(study);
  saveStudy(study);
  renderExtractTable();
}

function saveStudy(study) {
  const tx = db.transaction('studies', 'readwrite');
  tx.objectStore('studies').put(study);
}

function renderExtractTable() {
  const body = document.getElementById('extractBody');
  body.innerHTML = extractedStudies.map(s => `
    <tr data-id="${s.id}">
      <td><input type="text" value="${escapeHtml(s.authorYear)}" maxlength="200"
           onchange="updateStudy('${s.id}','authorYear',this.value)"></td>
      <td><input type="number" value="${s.nTotal ?? ''}"
           onchange="updateStudy('${s.id}','nTotal',toSafeInt(this.value,null))"></td>
      <td><input type="number" value="${s.nIntervention ?? ''}"
           onchange="updateStudy('${s.id}','nIntervention',toSafeInt(this.value,null))"></td>
      <td><input type="number" value="${s.nControl ?? ''}"
           onchange="updateStudy('${s.id}','nControl',toSafeInt(this.value,null))"></td>
      <td><input type="number" step="any" value="${s.effectEstimate ?? ''}"
           onchange="updateStudy('${s.id}','effectEstimate',toSafeFloat(this.value))"></td>
      <td><input type="number" step="any" value="${s.lowerCI ?? ''}"
           onchange="updateStudy('${s.id}','lowerCI',toSafeFloat(this.value))"></td>
      <td><input type="number" step="any" value="${s.upperCI ?? ''}"
           onchange="updateStudy('${s.id}','upperCI',toSafeFloat(this.value))"></td>
      <td><select onchange="updateStudy('${s.id}','effectType',this.value)">
        ${VALID_EFFECT_TYPES.map(t => `<option value="${t}" ${s.effectType === t ? 'selected' : ''}>${t}</option>`).join('')}
      </select></td>
      <td><input type="number" step="any" value="${s.weight ?? ''}"
           onchange="updateStudy('${s.id}','weight',toSafeFloat(this.value))"></td>
      <td><input type="text" value="${escapeHtml(s.notes)}" maxlength="500"
           onchange="updateStudy('${s.id}','notes',this.value.slice(0,500))"></td>
      <td><button onclick="deleteStudy('${s.id}')" class="btn-sm btn-danger">X</button></td>
    </tr>
  `).join('');
}

function updateStudy(id, field, value) {
  const s = extractedStudies.find(s => s.id === id);
  if (!s) return;
  s[field] = value;
  saveStudy(s);
}

function deleteStudy(id) {
  extractedStudies = extractedStudies.filter(s => s.id !== id);
  const tx = db.transaction('studies', 'readwrite');
  tx.objectStore('studies').delete(id);
  renderExtractTable();
}
```

**Step 3: Implement MetaSprint export**

```javascript
function exportToMetaSprint(format) {
  if (!extractedStudies.length) { showToast('No studies to export', 'warning'); return; }
  if (format === 'pairwise') {
    // MetaSprint Pairwise CSV format
    const header = 'Study ID,N Total,N Intervention,N Control,Effect,Lower CI,Upper CI,Type,Weight,Notes';
    const rows = extractedStudies.map(s =>
      [s.authorYear, s.nTotal ?? '', s.nIntervention ?? '', s.nControl ?? '',
       s.effectEstimate ?? '', s.lowerCI ?? '', s.upperCI ?? '',
       s.effectType, s.weight ?? '', `"${(s.notes || '').replace(/"/g, '""')}"`].join(',')
    );
    downloadFile(header + '\n' + rows.join('\n'), 'metasprint-pairwise-export.csv', 'text/csv');
  } else if (format === 'nma') {
    // MetaSprint NMA JSON format (user must specify treatments)
    const data = extractedStudies.map(s => ({
      id: s.id, authorYear: s.authorYear,
      nTotal: s.nTotal, effectEstimate: s.effectEstimate,
      lowerCI: s.lowerCI, upperCI: s.upperCI, effectType: s.effectType
    }));
    downloadFile(JSON.stringify(data, null, 2), 'metasprint-nma-export.json', 'application/json');
  }
  showToast(`Exported ${extractedStudies.length} studies`, 'success');
}

function exportStudiesCSV() {
  const header = 'Study ID,N Total,N Intervention,N Control,Effect,Lower CI,Upper CI,Type,Weight,Notes';
  const rows = extractedStudies.map(s =>
    [s.authorYear, s.nTotal ?? '', s.nIntervention ?? '', s.nControl ?? '',
     s.effectEstimate ?? '', s.lowerCI ?? '', s.upperCI ?? '',
     s.effectType, s.weight ?? '', `"${(s.notes || '').replace(/"/g, '""')}"`].join(',')
  );
  downloadFile(header + '\n' + rows.join('\n'), 'studies-export.csv', 'text/csv');
}

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function autoPopulateFromIncluded() {
  const included = allReferences.filter(r => r.decision === 'include');
  if (!included.length) { showToast('No included references', 'warning'); return; }
  let added = 0;
  for (const r of included) {
    const exists = extractedStudies.some(s => s.authorYear === `${r.authors?.split(';')[0]?.trim() || 'Unknown'} ${r.year || ''}`);
    if (!exists) {
      addStudyRow({ authorYear: `${r.authors?.split(';')[0]?.trim() || 'Unknown'} ${r.year || ''}`.trim() });
      added++;
    }
  }
  showToast(`Added ${added} studies from screening`, 'success');
}
```

**Step 4: Verify extraction and MetaSprint export**

Add 3 studies manually, export CSV. Import CSV into MetaSprint Pairwise app. Verify data matches.

---

## Task 7: Phase 6 — DerSimonian-Laird Meta-Analysis Engine

**Files:**
- Modify: `metasprint-autopilot.html`

**Step 1: Implement the DL random-effects engine**

```javascript
// --- Meta-Analysis Engine ---
function computeMetaAnalysis(studies) {
  // Filter studies with complete data
  const valid = studies.filter(s =>
    s.effectEstimate !== null && s.lowerCI !== null && s.upperCI !== null
  );
  if (valid.length === 0) return null;

  const isRatio = ['OR', 'RR', 'HR'].includes(valid[0].effectType);

  // Compute yi (effect) and sei (standard error)
  const data = valid.map(s => {
    const yi = isRatio ? Math.log(s.effectEstimate) : s.effectEstimate;
    const lo = isRatio ? Math.log(s.lowerCI) : s.lowerCI;
    const hi = isRatio ? Math.log(s.upperCI) : s.upperCI;
    const sei = (hi - lo) / (2 * 1.96);
    return { ...s, yi, sei, vi: sei * sei, wi: 1 / (sei * sei) };
  });

  // Fixed-effect estimate
  const sumW = data.reduce((a, d) => a + d.wi, 0);
  const muFE = data.reduce((a, d) => a + d.wi * d.yi, 0) / sumW;

  // Q statistic
  const Q = data.reduce((a, d) => a + d.wi * (d.yi - muFE) ** 2, 0);
  const df = data.length - 1;

  // DerSimonian-Laird tau-squared
  const C = sumW - data.reduce((a, d) => a + d.wi * d.wi, 0) / sumW;
  const tau2 = Math.max(0, (Q - df) / C);

  // Random-effects weights
  const reData = data.map(d => {
    const wi_re = 1 / (d.vi + tau2);
    return { ...d, wi_re };
  });
  const sumW_re = reData.reduce((a, d) => a + d.wi_re, 0);
  const muRE = reData.reduce((a, d) => a + d.wi_re * d.yi, 0) / sumW_re;
  const seRE = Math.sqrt(1 / sumW_re);

  // I-squared
  const I2 = df > 0 ? Math.max(0, (Q - df) / Q * 100) : 0;

  // z-test
  const z = muRE / seRE;
  const pValue = 2 * (1 - normalCDF(Math.abs(z)));

  // Back-transform for ratio measures
  const pooled = isRatio ? Math.exp(muRE) : muRE;
  const pooledLo = isRatio ? Math.exp(muRE - 1.96 * seRE) : muRE - 1.96 * seRE;
  const pooledHi = isRatio ? Math.exp(muRE + 1.96 * seRE) : muRE + 1.96 * seRE;

  // Per-study weights (%)
  const totalW = reData.reduce((a, d) => a + d.wi_re, 0);
  const studyResults = reData.map(d => ({
    ...d,
    weightPct: (d.wi_re / totalW * 100).toFixed(1),
    display: isRatio ? Math.exp(d.yi) : d.yi,
    displayLo: isRatio ? Math.exp(d.yi - 1.96 * d.sei) : d.yi - 1.96 * d.sei,
    displayHi: isRatio ? Math.exp(d.yi + 1.96 * d.sei) : d.yi + 1.96 * d.sei
  }));

  return {
    pooled, pooledLo, pooledHi, tau2, I2, Q, df, pValue,
    k: data.length, isRatio, studyResults,
    muRE, seRE // log-scale for internal use
  };
}

function normalCDF(x) {
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429;
  const p = 0.3275911;
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x) / Math.sqrt(2);
  const t = 1 / (1 + p * x);
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return 0.5 * (1 + sign * y);
}
```

**Step 2: Verify against known values**

Test with EMPEROR-Preserved + DELIVER HF data (known pooled HR ~0.80). Compare output.

---

## Task 8: Phase 6 — Forest Plot (SVG)

**Files:**
- Modify: `metasprint-autopilot.html`

**Step 1: Implement SVG forest plot renderer**

```javascript
function renderForestPlot(result) {
  if (!result) return '<p>No data for forest plot</p>';
  const { studyResults, pooled, pooledLo, pooledHi, isRatio } = result;
  const k = studyResults.length;
  const rowH = 28, headerH = 40, footerH = 50, pad = 20;
  const h = headerH + k * rowH + footerH + pad;
  const plotLeft = 250, plotRight = 550, plotW = plotRight - plotLeft;
  const nullLine = isRatio ? 1 : 0;

  // Compute x-axis range
  const allVals = studyResults.flatMap(s => [s.displayLo, s.displayHi]).concat([pooledLo, pooledHi, nullLine]);
  let xMin = Math.min(...allVals) * (isRatio ? 0.8 : 1) - (isRatio ? 0 : 0.2);
  let xMax = Math.max(...allVals) * (isRatio ? 1.2 : 1) + (isRatio ? 0 : 0.2);
  if (isRatio) { xMin = Math.max(0.01, xMin); } // avoid log(0)

  const xScale = isRatio
    ? (v) => plotLeft + (Math.log(v) - Math.log(xMin)) / (Math.log(xMax) - Math.log(xMin)) * plotW
    : (v) => plotLeft + (v - xMin) / (xMax - xMin) * plotW;

  let svg = `<svg viewBox="0 0 700 ${h}" xmlns="http://www.w3.org/2000/svg" style="max-width:700px;width:100%;font-family:var(--font)">`;

  // Header
  svg += `<text x="10" y="25" font-size="11" font-weight="bold">Study</text>`;
  svg += `<text x="${plotLeft + plotW/2}" y="25" text-anchor="middle" font-size="11" font-weight="bold">Effect (95% CI)</text>`;
  svg += `<text x="610" y="25" font-size="11" font-weight="bold">Weight</text>`;
  svg += `<text x="665" y="25" font-size="11" font-weight="bold">Est [CI]</text>`;

  // Null line
  const nullX = xScale(nullLine);
  svg += `<line x1="${nullX}" y1="${headerH}" x2="${nullX}" y2="${headerH + k * rowH}" stroke="#ccc" stroke-dasharray="4"/>`;

  // Study rows
  studyResults.forEach((s, i) => {
    const y = headerH + i * rowH + rowH / 2;
    const cx = xScale(s.display);
    const x1 = xScale(s.displayLo);
    const x2 = xScale(s.displayHi);
    const size = Math.max(3, Math.min(10, Math.sqrt(parseFloat(s.weightPct)) * 2));

    svg += `<text x="10" y="${y + 4}" font-size="10">${escapeHtml((s.authorYear || '').slice(0, 30))}</text>`;
    svg += `<line x1="${Math.max(plotLeft, x1)}" y1="${y}" x2="${Math.min(plotRight, x2)}" y2="${y}" stroke="var(--primary)" stroke-width="1.5"/>`;
    svg += `<rect x="${cx - size/2}" y="${y - size/2}" width="${size}" height="${size}" fill="var(--primary)" transform="rotate(45 ${cx} ${y})"/>`;
    svg += `<text x="610" y="${y + 4}" font-size="9">${s.weightPct}%</text>`;
    svg += `<text x="665" y="${y + 4}" font-size="9">${s.display.toFixed(2)} [${s.displayLo.toFixed(2)}, ${s.displayHi.toFixed(2)}]</text>`;
  });

  // Pooled diamond
  const dy = headerH + k * rowH + 20;
  const dx = xScale(pooled);
  const dlo = xScale(pooledLo);
  const dhi = xScale(pooledHi);
  svg += `<polygon points="${dlo},${dy} ${dx},${dy-8} ${dhi},${dy} ${dx},${dy+8}" fill="var(--danger)" opacity="0.8"/>`;
  svg += `<text x="10" y="${dy + 4}" font-size="10" font-weight="bold">Pooled (RE)</text>`;
  svg += `<text x="665" y="${dy + 4}" font-size="9" font-weight="bold">${pooled.toFixed(2)} [${pooledLo.toFixed(2)}, ${pooledHi.toFixed(2)}]</text>`;

  // X-axis
  const axisY = headerH + k * rowH + 40;
  svg += `<line x1="${plotLeft}" y1="${axisY}" x2="${plotRight}" y2="${axisY}" stroke="var(--text)" stroke-width="1"/>`;
  const ticks = isRatio ? [0.1, 0.25, 0.5, 1, 2, 4].filter(v => v >= xMin && v <= xMax) : 5;
  if (Array.isArray(ticks)) {
    ticks.forEach(v => {
      const tx = xScale(v);
      svg += `<line x1="${tx}" y1="${axisY}" x2="${tx}" y2="${axisY + 5}" stroke="var(--text)"/>`;
      svg += `<text x="${tx}" y="${axisY + 15}" text-anchor="middle" font-size="9">${v}</text>`;
    });
  }

  svg += `</svg>`;
  return svg;
}
```

**Step 2: Add analysis dashboard to Phase 6**

```html
<!-- Inside #phase-analyze -->
<h2>Analysis Dashboard</h2>
<div class="analysis-summary" id="analysisSummary"></div>
<div class="analysis-plots">
  <div id="forestPlotContainer"></div>
  <div id="funnelPlotContainer"></div>
</div>
<button onclick="runAnalysis()">Run Analysis</button>
```

```javascript
async function runAnalysis() {
  await loadStudies();
  const result = computeMetaAnalysis(extractedStudies);
  if (!result) { showToast('Need at least 1 study with complete data', 'warning'); return; }
  document.getElementById('analysisSummary').innerHTML = `
    <div class="stat-card"><div class="stat-label">Studies</div><div class="stat-value">${result.k}</div></div>
    <div class="stat-card"><div class="stat-label">Pooled Effect</div><div class="stat-value">${result.pooled.toFixed(3)}</div></div>
    <div class="stat-card"><div class="stat-label">95% CI</div><div class="stat-value">[${result.pooledLo.toFixed(3)}, ${result.pooledHi.toFixed(3)}]</div></div>
    <div class="stat-card"><div class="stat-label">I&sup2;</div><div class="stat-value">${result.I2.toFixed(1)}%</div></div>
    <div class="stat-card"><div class="stat-label">&tau;&sup2;</div><div class="stat-value">${result.tau2.toFixed(4)}</div></div>
    <div class="stat-card"><div class="stat-label">p-value</div><div class="stat-value">${result.pValue < 0.001 ? '< 0.001' : result.pValue.toFixed(3)}</div></div>
  `;
  document.getElementById('forestPlotContainer').innerHTML = renderForestPlot(result);
  document.getElementById('funnelPlotContainer').innerHTML = renderFunnelPlot(result);
}
```

**Step 3: Implement funnel plot**

```javascript
function renderFunnelPlot(result) {
  if (!result) return '';
  const { studyResults, muRE, isRatio } = result;
  const w = 500, h = 400, pad = 50;

  const ses = studyResults.map(d => d.sei);
  const maxSE = Math.max(...ses) * 1.2;

  const xScale = (v) => pad + (v - (muRE - 3 * maxSE)) / (6 * maxSE) * (w - 2 * pad);
  const yScale = (se) => pad + (se / maxSE) * (h - 2 * pad);

  let svg = `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" style="max-width:500px;width:100%;font-family:var(--font)">`;

  // Funnel triangle
  const topX = xScale(muRE);
  const bottomLo = xScale(muRE - 1.96 * maxSE);
  const bottomHi = xScale(muRE + 1.96 * maxSE);
  svg += `<polygon points="${topX},${pad} ${bottomLo},${h - pad} ${bottomHi},${h - pad}" fill="#f0f0f0" stroke="#ccc"/>`;

  // Vertical center line
  svg += `<line x1="${topX}" y1="${pad}" x2="${topX}" y2="${h - pad}" stroke="#999" stroke-dasharray="4"/>`;

  // Study points
  studyResults.forEach(d => {
    const cx = xScale(d.yi);
    const cy = yScale(d.sei);
    svg += `<circle cx="${cx}" cy="${cy}" r="4" fill="var(--primary)" opacity="0.7"/>`;
  });

  // Axes
  svg += `<text x="${w/2}" y="${h - 5}" text-anchor="middle" font-size="10">Effect size${isRatio ? ' (log scale)' : ''}</text>`;
  svg += `<text x="15" y="${h/2}" text-anchor="middle" font-size="10" transform="rotate(-90,15,${h/2})">Standard Error</text>`;

  svg += `</svg>`;
  return svg;
}
```

---

## Task 9: Phase 3 — PubMed Search & Multi-Source Integration

**Files:**
- Modify: `metasprint-autopilot.html`

**Step 1: Add search UI**

```html
<!-- Inside #phase-search -->
<h2>Search Strategy</h2>
<div class="pico-builder">
  <div class="pico-row"><label>Population (P):</label><input id="picoP" onchange="savePICO()"></div>
  <div class="pico-row"><label>Intervention (I):</label><input id="picoI" onchange="savePICO()"></div>
  <div class="pico-row"><label>Comparator (C):</label><input id="picoC" onchange="savePICO()"></div>
  <div class="pico-row"><label>Outcomes (O):</label><input id="picoO" onchange="savePICO()"></div>
</div>
<div class="search-actions">
  <button onclick="searchPubMed()">Search PubMed</button>
  <button onclick="searchOpenAlex()">Search OpenAlex</button>
  <button onclick="searchCTGov()">Search CT.gov</button>
  <button onclick="searchAll()">Search All Sources</button>
</div>
<div id="searchStatus"></div>
<div id="searchResults"></div>
```

**Step 2: Implement PubMed E-utilities search**

```javascript
const PUBMED_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/';
const RATE_LIMIT_MS = 350; // ~3 req/sec without API key
let lastRequestTime = 0;

async function rateLimitedFetch(url) {
  const now = Date.now();
  const wait = Math.max(0, RATE_LIMIT_MS - (now - lastRequestTime));
  if (wait > 0) await new Promise(r => setTimeout(r, wait));
  lastRequestTime = Date.now();
  return fetch(url);
}

function buildPubMedQuery() {
  const P = document.getElementById('picoP')?.value || '';
  const I = document.getElementById('picoI')?.value || '';
  const C = document.getElementById('picoC')?.value || '';
  const O = document.getElementById('picoO')?.value || '';
  const parts = [];
  if (P) parts.push(`(${P}[Title/Abstract] OR ${P}[MeSH Terms])`);
  if (I) parts.push(`(${I}[Title/Abstract] OR ${I}[MeSH Terms])`);
  if (C) parts.push(`(${C}[Title/Abstract])`);
  if (O) parts.push(`(${O}[Title/Abstract])`);
  parts.push('(randomized controlled trial[pt] OR randomized[tiab] OR randomised[tiab])');
  return parts.join(' AND ');
}

async function searchPubMed() {
  const query = buildPubMedQuery();
  document.getElementById('searchStatus').textContent = 'Searching PubMed...';
  try {
    // Step 1: ESearch
    const searchUrl = `${PUBMED_BASE}esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=200&retmode=json&usehistory=y`;
    const searchResp = await rateLimitedFetch(searchUrl);
    const searchData = await searchResp.json();
    const pmids = searchData.esearchresult?.idlist || [];
    if (!pmids.length) { document.getElementById('searchStatus').textContent = 'No results found'; return; }

    // Step 2: EFetch in batches of 50
    const allRecords = [];
    for (let i = 0; i < pmids.length; i += 50) {
      const batch = pmids.slice(i, i + 50);
      const fetchUrl = `${PUBMED_BASE}efetch.fcgi?db=pubmed&id=${batch.join(',')}&retmode=xml&rettype=abstract`;
      const fetchResp = await rateLimitedFetch(fetchUrl);
      const xml = await fetchResp.text();
      allRecords.push(...parsePubMedXML(xml));
      document.getElementById('searchStatus').textContent = `Fetched ${Math.min(i + 50, pmids.length)}/${pmids.length}...`;
    }
    displaySearchResults(allRecords, 'PubMed');
  } catch (err) {
    document.getElementById('searchStatus').textContent = `Error: ${err.message}`;
  }
}

function parsePubMedXML(xml) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'text/xml');
  const articles = doc.querySelectorAll('PubmedArticle');
  const results = [];
  articles.forEach(article => {
    const record = { id: generateId(), keywords: [], projectId: currentProjectId, source: 'PubMed' };
    record.pmid = article.querySelector('MedlineCitation PMID')?.textContent || '';
    record.title = article.querySelector('ArticleTitle')?.textContent || '';
    const abTexts = article.querySelectorAll('AbstractText');
    record.abstract = Array.from(abTexts).map(at => {
      const label = at.getAttribute('Label');
      return label ? `${label}: ${at.textContent}` : at.textContent;
    }).join(' ');
    const authors = article.querySelectorAll('Author');
    record.authors = Array.from(authors).map(a =>
      `${a.querySelector('LastName')?.textContent || ''} ${a.querySelector('Initials')?.textContent || ''}`
    ).filter(Boolean).join('; ');
    record.year = article.querySelector('PubDate Year')?.textContent || '';
    record.journal = article.querySelector('Journal Title')?.textContent || '';
    record.doi = article.querySelector('ArticleId[IdType="doi"]')?.textContent || '';
    article.querySelectorAll('MeshHeading DescriptorName').forEach(m => record.keywords.push(m.textContent));
    if (record.title) results.push(record);
  });
  return results;
}
```

**Step 3: Implement OpenAlex and CT.gov search**

```javascript
async function searchOpenAlex() {
  const P = document.getElementById('picoP')?.value || '';
  const I = document.getElementById('picoI')?.value || '';
  const query = [P, I].filter(Boolean).join(' ');
  if (!query) { showToast('Enter at least Population or Intervention', 'warning'); return; }
  document.getElementById('searchStatus').textContent = 'Searching OpenAlex...';
  try {
    const url = `https://api.openalex.org/works?search=${encodeURIComponent(query)}&filter=type:article&per_page=100&sort=relevance_score:desc`;
    const resp = await fetch(url, { headers: { 'User-Agent': 'MetaSprintAutopilot/1.0' } });
    const data = await resp.json();
    const records = (data.results || []).map(w => ({
      id: generateId(), projectId: currentProjectId, source: 'OpenAlex',
      title: w.title || '', doi: w.doi?.replace('https://doi.org/', '') || '',
      year: String(w.publication_year || ''),
      authors: (w.authorships || []).map(a => a.author?.display_name || '').join('; '),
      journal: w.primary_location?.source?.display_name || '',
      abstract: w.abstract_inverted_index ? reconstructAbstract(w.abstract_inverted_index) : '',
      keywords: (w.concepts || []).slice(0, 5).map(c => c.display_name)
    }));
    displaySearchResults(records, 'OpenAlex');
  } catch (err) {
    document.getElementById('searchStatus').textContent = `Error: ${err.message}`;
  }
}

function reconstructAbstract(invertedIndex) {
  if (!invertedIndex) return '';
  const words = [];
  for (const [word, positions] of Object.entries(invertedIndex)) {
    for (const pos of positions) words[pos] = word;
  }
  return words.filter(Boolean).join(' ');
}

async function searchCTGov() {
  const P = document.getElementById('picoP')?.value || '';
  const I = document.getElementById('picoI')?.value || '';
  document.getElementById('searchStatus').textContent = 'Searching ClinicalTrials.gov...';
  try {
    const params = new URLSearchParams({
      'query.cond': P, 'query.intr': I,
      'query.term': 'AREA[StudyType]INTERVENTIONAL AND AREA[DesignAllocation]RANDOMIZED',
      pageSize: '100', countTotal: 'true'
    });
    const resp = await fetch(`https://clinicaltrials.gov/api/v2/studies?${params}`);
    const data = await resp.json();
    const records = (data.studies || []).map(s => {
      const p = s.protocolSection || {};
      return {
        id: generateId(), projectId: currentProjectId, source: 'ClinicalTrials.gov',
        title: p.identificationModule?.officialTitle || p.identificationModule?.briefTitle || '',
        abstract: p.descriptionModule?.briefSummary || '',
        year: p.statusModule?.startDateStruct?.date?.substring(0, 4) || '',
        nctId: p.identificationModule?.nctId || '',
        enrollment: p.designModule?.enrollmentInfo?.count,
        status: p.statusModule?.overallStatus || '',
        keywords: []
      };
    });
    displaySearchResults(records, 'ClinicalTrials.gov');
  } catch (err) {
    document.getElementById('searchStatus').textContent = `Error: ${err.message}`;
  }
}

async function searchAll() {
  await searchPubMed();
  await searchOpenAlex();
  await searchCTGov();
  showToast('All sources searched', 'success');
}
```

**Step 4: Display results and import to screening**

```javascript
let searchResultsCache = [];

function displaySearchResults(records, source) {
  searchResultsCache = searchResultsCache.concat(records);
  document.getElementById('searchStatus').textContent =
    `${searchResultsCache.length} total results (${source}: ${records.length})`;
  document.getElementById('searchResults').innerHTML = `
    <div class="search-results-header">
      <span>${searchResultsCache.length} results</span>
      <button onclick="importSearchResults()">Import All to Screening</button>
    </div>
    ${searchResultsCache.slice(0, 50).map(r => `
      <div class="search-result-item">
        <div class="result-title">${escapeHtml(r.title)}</div>
        <div class="result-meta">${escapeHtml(r.authors?.split(';')[0] || '')} (${escapeHtml(r.year || '?')}) - ${escapeHtml(r.source)}</div>
      </div>
    `).join('')}
    ${searchResultsCache.length > 50 ? `<p class="text-muted">Showing first 50 of ${searchResultsCache.length}</p>` : ''}
  `;
}

async function importSearchResults() {
  if (!searchResultsCache.length) return;
  const tx = db.transaction('references', 'readwrite');
  const store = tx.objectStore('references');
  for (const rec of searchResultsCache) {
    rec.importedAt = new Date().toISOString();
    rec.decision = null;
    rec.reason = '';
    store.put(rec);
  }
  showToast(`Imported ${searchResultsCache.length} references to screening`, 'success');
  searchResultsCache = [];
  switchPhase('screen');
  await renderReferenceList();
}
```

---

## Task 10: Phase 1 — Topic Discovery

**Files:**
- Modify: `metasprint-autopilot.html`

**Step 1: Add discovery UI and implement gap analysis**

```html
<!-- Inside #phase-discover -->
<h2>Topic Discovery</h2>
<p>Find topics with multiple RCTs but no recent meta-analysis.</p>
<div class="discover-input">
  <input type="text" id="topicInput" placeholder="Enter broad topic (e.g., SGLT2 inhibitors, atrial fibrillation)">
  <button onclick="discoverTopics()">Analyze Gap</button>
</div>
<div id="discoveryStatus"></div>
<div id="discoveryResults"></div>
```

```javascript
async function discoverTopics() {
  const topic = document.getElementById('topicInput').value.trim();
  if (!topic) { showToast('Enter a topic', 'warning'); return; }
  document.getElementById('discoveryStatus').textContent = 'Searching PubMed for RCTs...';

  try {
    // Count RCTs
    const rctQuery = `${encodeURIComponent(topic)}+AND+randomized+controlled+trial[pt]`;
    const rctResp = await rateLimitedFetch(`${PUBMED_BASE}esearch.fcgi?db=pubmed&term=${rctQuery}&retmax=0&retmode=json`);
    const rctData = await rctResp.json();
    const rctCount = parseInt(rctData.esearchresult?.count || '0');

    // Count SRs/MAs
    const srQuery = `${encodeURIComponent(topic)}+AND+(systematic+review[pt]+OR+meta-analysis[pt])`;
    const srResp = await rateLimitedFetch(`${PUBMED_BASE}esearch.fcgi?db=pubmed&term=${srQuery}&retmax=10&retmode=json&sort=pub+date`);
    const srData = await srResp.json();
    const srCount = parseInt(srData.esearchresult?.count || '0');
    const srPMIDs = srData.esearchresult?.idlist || [];

    // Fetch recent SR details
    let recentSRs = [];
    if (srPMIDs.length > 0) {
      const fetchUrl = `${PUBMED_BASE}efetch.fcgi?db=pubmed&id=${srPMIDs.join(',')}&retmode=xml&rettype=abstract`;
      const fetchResp = await rateLimitedFetch(fetchUrl);
      const xml = await fetchResp.text();
      recentSRs = parsePubMedXML(xml);
    }

    // Gap analysis
    const currentYear = new Date().getFullYear();
    const latestSRYear = recentSRs.length > 0 ? Math.max(...recentSRs.map(r => parseInt(r.year) || 0)) : 0;
    const yearsSinceLastSR = latestSRYear > 0 ? currentYear - latestSRYear : 999;

    let gapLevel, gapLabel;
    if (rctCount >= 5 && yearsSinceLastSR >= 3) { gapLevel = 'high'; gapLabel = 'Strong opportunity'; }
    else if (rctCount >= 3 && yearsSinceLastSR >= 2) { gapLevel = 'medium'; gapLabel = 'Moderate opportunity'; }
    else { gapLevel = 'low'; gapLabel = 'Low opportunity'; }

    document.getElementById('discoveryStatus').textContent = '';
    document.getElementById('discoveryResults').innerHTML = `
      <div class="gap-card gap-${gapLevel}">
        <h3>${escapeHtml(topic)}</h3>
        <div class="gap-stats">
          <div class="stat-card"><div class="stat-label">RCTs Found</div><div class="stat-value">${rctCount}</div></div>
          <div class="stat-card"><div class="stat-label">SRs/MAs Found</div><div class="stat-value">${srCount}</div></div>
          <div class="stat-card"><div class="stat-label">Latest SR</div><div class="stat-value">${latestSRYear || 'None'}</div></div>
          <div class="stat-card"><div class="stat-label">Gap Score</div><div class="stat-value">${gapLabel}</div></div>
        </div>
        ${recentSRs.length > 0 ? `
          <h4>Recent Systematic Reviews</h4>
          <ul>${recentSRs.map(sr => `<li>${escapeHtml(sr.title)} (${escapeHtml(sr.year)})</li>`).join('')}</ul>
        ` : '<p>No existing systematic reviews found — strong opportunity!</p>'}
        <button onclick="useTopicForProtocol('${escapeHtml(topic)}')">Use This Topic &rarr; Protocol</button>
      </div>
    `;
  } catch (err) {
    document.getElementById('discoveryStatus').textContent = `Error: ${err.message}`;
  }
}

function useTopicForProtocol(topic) {
  document.getElementById('picoP')?.setAttribute('value', topic);
  switchPhase('protocol');
}
```

---

## Task 11: Phase 2 — PROSPERO Protocol Generator

**Step 1: Add protocol UI and template generator**

```html
<!-- Inside #phase-protocol -->
<h2>PROSPERO Protocol</h2>
<div class="protocol-form">
  <div class="form-group"><label>Review Title:</label>
    <input id="protTitle" placeholder="e.g., Efficacy of X vs Y in patients with Z: a systematic review"></div>
  <div class="form-group"><label>Population:</label><input id="protP"></div>
  <div class="form-group"><label>Intervention:</label><input id="protI"></div>
  <div class="form-group"><label>Comparator:</label><input id="protC"></div>
  <div class="form-group"><label>Outcomes:</label><input id="protO"></div>
  <div class="form-group"><label>Study Types:</label>
    <select id="protStudyType"><option>RCTs only</option><option>RCTs and observational</option></select></div>
  <button onclick="generateProtocol()">Generate Protocol</button>
  <button onclick="fetchSampleAbstracts()">Auto-Extract PICO from PubMed</button>
</div>
<div id="protocolOutput" class="protocol-output"></div>
```

```javascript
function generateProtocol() {
  const title = document.getElementById('protTitle').value || 'Untitled Review';
  const P = document.getElementById('protP').value || '[Population]';
  const I = document.getElementById('protI').value || '[Intervention]';
  const C = document.getElementById('protC').value || '[Comparator]';
  const O = document.getElementById('protO').value || '[Outcomes]';
  const studyType = document.getElementById('protStudyType').value;

  const protocol = `
# PROSPERO Protocol

## Review Title
${title}

## Review Question
What is the effect of ${I} compared with ${C} on ${O} in ${P}?

## Searches
We will search the following databases from inception to ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}:
- PubMed/MEDLINE
- Cochrane Central Register of Controlled Trials (CENTRAL)
- OpenAlex
- ClinicalTrials.gov (for unpublished and ongoing trials)

Search terms will combine MeSH terms and free-text synonyms for the population (${P}), intervention (${I}), and comparator (${C}), combined with a validated RCT filter. No language restrictions will be applied.

## Condition or Domain
${P}

## Participants/Population
Studies enrolling ${P}. No restrictions on age, sex, or severity unless otherwise specified.

## Intervention(s)/Exposure(s)
${I}

## Comparator(s)/Control
${C}

## Types of Study
${studyType === 'RCTs only' ? 'Randomized controlled trials (RCTs) only.' : 'Randomized controlled trials and prospective observational studies.'}

## Main Outcome(s)
${O}

## Data Extraction
Two reviewers will independently extract data using a standardized form including: study characteristics, participant demographics, intervention details, outcome definitions, and results. Disagreements will be resolved by consensus or a third reviewer.

## Risk of Bias Assessment
Risk of bias will be assessed using the Cochrane Risk of Bias 2.0 (RoB 2) tool for randomized trials across five domains: randomization process, deviations from intended interventions, missing outcome data, measurement of the outcome, and selection of the reported result.

## Data Synthesis
We will perform random-effects meta-analysis using the DerSimonian-Laird method. Heterogeneity will be assessed using I-squared and tau-squared statistics. If I-squared > 50%, we will explore sources of heterogeneity through pre-specified subgroup analyses. Publication bias will be assessed by funnel plot inspection and Egger's test when >= 10 studies are available.

## Analysis of Subgroups or Subsets
Pre-specified subgroup analyses by: age group, severity of condition, dose of intervention, and follow-up duration.

## Dissemination Plans
Results will be submitted for publication in a peer-reviewed journal and presented at relevant conferences.
  `.trim();

  document.getElementById('protocolOutput').innerHTML = `
    <pre class="protocol-text">${escapeHtml(protocol)}</pre>
    <button onclick="copyToClipboard(this.previousElementSibling.textContent)">Copy to Clipboard</button>
    <button onclick="downloadFile(\`${protocol.replace(/`/g, '\\`')}\`, 'prospero-protocol.txt', 'text/plain')">Download .txt</button>
  `;

  // Save PICO to project
  savePICO();
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => showToast('Copied!', 'success'));
}

function savePICO() {
  const project = projects.find(p => p.id === currentProjectId);
  if (!project) return;
  project.pico = {
    P: document.getElementById('picoP')?.value || document.getElementById('protP')?.value || '',
    I: document.getElementById('picoI')?.value || document.getElementById('protI')?.value || '',
    C: document.getElementById('picoC')?.value || document.getElementById('protC')?.value || '',
    O: document.getElementById('picoO')?.value || document.getElementById('protO')?.value || ''
  };
  const tx = db.transaction('projects', 'readwrite');
  tx.objectStore('projects').put(project);
}
```

---

## Task 12: Phase 7 — Live Paper Generator

**Step 1: Implement template-based methods/results generation**

```javascript
async function generatePaper() {
  const project = projects.find(p => p.id === currentProjectId);
  if (!project) return;
  await loadStudies();
  await loadReferences();
  const result = computeMetaAnalysis(extractedStudies);
  const pico = project.pico;
  const prisma = project.prisma;
  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const methods = `## Methods

### Search Strategy
A systematic search was conducted in PubMed, OpenAlex, and ClinicalTrials.gov from inception to ${today}. Search terms combined Medical Subject Headings (MeSH) and free-text terms for the population (${escapeHtml(pico.P || '[population]')}), intervention (${escapeHtml(pico.I || '[intervention]')}), and comparator (${escapeHtml(pico.C || '[comparator]')}), combined with a validated randomized controlled trial filter. Reference lists of included studies and relevant systematic reviews were also screened.

### Eligibility Criteria
We included randomized controlled trials comparing ${escapeHtml(pico.I || '[intervention]')} with ${escapeHtml(pico.C || '[comparator]')} in ${escapeHtml(pico.P || '[population]')}. The primary outcome was ${escapeHtml(pico.O || '[outcome]')}.

### Study Selection
Titles and abstracts of retrieved records were screened independently. Full-text articles of potentially eligible studies were assessed against pre-defined inclusion criteria.

### Data Extraction
Data were extracted using a standardized form. Extracted items included study design, sample size, participant characteristics, intervention details, and primary and secondary outcomes.

### Risk of Bias Assessment
Risk of bias was assessed using the Cochrane Risk of Bias 2.0 (RoB 2) tool.

### Statistical Analysis
Random-effects meta-analysis was performed using the DerSimonian-Laird method. Effect sizes were expressed as ${result?.isRatio ? 'hazard ratios (HR) or odds ratios (OR)' : 'mean differences (MD) or standardized mean differences (SMD)'} with 95% confidence intervals. Heterogeneity was quantified using I-squared and tau-squared statistics. Publication bias was assessed by visual inspection of funnel plots${result && result.k >= 10 ? " and Egger's regression test" : ''}.`;

  const results = `## Results

### Study Selection
The systematic search identified ${prisma.identified || '[N]'} records. After removing ${prisma.duplicates || '[N]'} duplicates, ${prisma.screened || '[N]'} records were screened at the title and abstract level. Of these, ${prisma.excludedScreen || '[N]'} were excluded, and ${(prisma.screened || 0) - (prisma.excludedScreen || 0)} full-text articles were assessed for eligibility. A total of ${prisma.included || extractedStudies.length} studies were included in the quantitative synthesis.

### Study Characteristics
${extractedStudies.length} studies were included, enrolling a total of ${extractedStudies.reduce((a, s) => a + (s.nTotal || 0), 0)} participants.${result ? ` The pooled ${result.isRatio ? 'effect estimate' : 'mean difference'} was ${result.pooled.toFixed(2)} (95% CI: ${result.pooledLo.toFixed(2)} to ${result.pooledHi.toFixed(2)}; p ${result.pValue < 0.001 ? '< 0.001' : '= ' + result.pValue.toFixed(3)}).` : ''}

### Heterogeneity
${result ? `Heterogeneity was ${result.I2 < 25 ? 'low' : result.I2 < 50 ? 'moderate' : result.I2 < 75 ? 'substantial' : 'considerable'} (I-squared = ${result.I2.toFixed(1)}%, tau-squared = ${result.tau2.toFixed(4)}).` : '[Awaiting analysis]'}`;

  document.getElementById('paperOutput').innerHTML = `
    <div class="paper-section">
      <pre class="paper-text">${escapeHtml(methods)}</pre>
      <pre class="paper-text">${escapeHtml(results)}</pre>
    </div>
    <button onclick="copyToClipboard(document.querySelector('.paper-text').textContent)">Copy Methods</button>
    <button onclick="downloadFile(document.querySelectorAll('.paper-text')[0].textContent + '\\n\\n' + document.querySelectorAll('.paper-text')[1].textContent, 'paper-draft.md', 'text/markdown')">Download Markdown</button>
  `;
}
```

**Step 2: Add paper UI**

```html
<!-- Inside #phase-write -->
<h2>Paper Generator</h2>
<p>Auto-generate Methods and Results sections from your review data.</p>
<button onclick="generatePaper()">Generate Draft</button>
<div id="paperOutput"></div>
```

---

## Task 13: CSS Styling

**Step 1: Write comprehensive CSS**

This task adds the full CSS to make the app visually polished. Includes:
- Tab bar styling
- Card/panel layouts for each phase
- Reference list with decision badges
- Extraction table styling
- Stat cards grid
- Toast notifications
- PRISMA section
- Responsive layout
- Dark mode toggle

(Full CSS approximately 500 lines — implement based on the component structure above)

---

## Task 14: Final Integration & Testing

**Step 1: Wire all phase switches**

Ensure tab switches load correct data:
```javascript
function switchPhase(phase) {
  // ... existing tab switch code ...
  // Load phase-specific data
  if (phase === 'screen') renderReferenceList();
  if (phase === 'extract') { loadStudies().then(renderExtractTable); }
  if (phase === 'analyze') { loadStudies(); }
  if (phase === 'search') { loadPICO(); }
}
```

**Step 2: Add project import/export**

```javascript
async function exportProject() {
  const project = projects.find(p => p.id === currentProjectId);
  await loadReferences();
  await loadStudies();
  const bundle = { project, references: allReferences, studies: extractedStudies, version: '1.0' };
  downloadFile(JSON.stringify(bundle, null, 2), `${project.name.replace(/\W+/g, '-')}.json`, 'application/json');
}

async function importProject() {
  const input = document.createElement('input');
  input.type = 'file'; input.accept = '.json';
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const data = JSON.parse(await file.text());
    if (!data.project) { showToast('Invalid project file', 'danger'); return; }
    const tx1 = db.transaction('projects', 'readwrite');
    tx1.objectStore('projects').put(data.project);
    if (data.references) {
      const tx2 = db.transaction('references', 'readwrite');
      for (const r of data.references) tx2.objectStore('references').put(r);
    }
    if (data.studies) {
      const tx3 = db.transaction('studies', 'readwrite');
      for (const s of data.studies) tx3.objectStore('studies').put(s);
    }
    currentProjectId = data.project.id;
    await loadProjects();
    showToast('Project imported', 'success');
  };
  input.click();
}
```

**Step 3: Smoke test the full workflow**

1. Open app → "My First Review" project created
2. Phase 1: Enter "heart failure SGLT2" → get gap analysis
3. Phase 2: Fill PICO → generate protocol → copy text
4. Phase 3: Search PubMed → get results → import to screening
5. Phase 4: Screen 10 abstracts → run dedup → check PRISMA
6. Phase 5: Import included → add effect sizes → export MetaSprint CSV
7. Phase 6: Run analysis → forest plot + funnel plot render
8. Phase 7: Generate paper → methods/results text correct

**Step 4: Create Selenium test skeleton**

Create `test/test_selenium.py` for automated regression testing.

---

## Build Priority Summary

| Task | Phase | Priority | Estimated Size |
|------|-------|----------|---------------|
| 1 | Skeleton | Critical | ~300 lines |
| 2 | Screen (import) | Critical | ~250 lines |
| 3 | Screen (UI) | Critical | ~200 lines |
| 4 | Screen (dedup) | High | ~100 lines |
| 5 | Screen (PRISMA) | High | ~150 lines |
| 6 | Extract (forms) | Critical | ~200 lines |
| 7 | Analyze (engine) | High | ~100 lines |
| 8 | Analyze (forest) | High | ~150 lines |
| 9 | Search (multi-source) | High | ~400 lines |
| 10 | Discover | Medium | ~100 lines |
| 11 | Protocol | Medium | ~150 lines |
| 12 | Write (paper) | Medium | ~150 lines |
| 13 | CSS | Critical | ~500 lines |
| 14 | Integration | Critical | ~100 lines |

**Total estimated: ~2,850 lines of code** (core functionality; CSS and HTML structure add ~1,500 more for ~4,350 total in v1.0)
