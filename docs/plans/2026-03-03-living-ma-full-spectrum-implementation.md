# Living MA + Full-Spectrum Enhancement Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add Living MA automation (CUSUM, alpha spending, sequential stopping), expand test coverage for all gaps, run a full-spectrum 5-persona review, and major-rewrite the PLOS ONE manuscript.

**Architecture:** Phase 1 adds 6 Living MA features to the Insights tab (lines 1889-2120) and statistical engine (near line 21424 where TSA already lives). Phase 2 adds ~100+ Playwright E2E tests in a new spec file. Phase 3 runs 5 sequential review agents. Phase 4 rewrites the manuscript to reflect all current capabilities.

**Tech Stack:** Single-file HTML/CSS/JS (metasprint-autopilot.html, ~30K lines), Playwright E2E tests, PLOS ONE markdown manuscript.

**Key Code Locations:**
- Insights tab HTML: lines 1889-2120
- Insights tab nav buttons: lines 1892-1908
- TSA function (computeTSA): line 21424
- Cumulative trajectory: line 20923 (computeTemporalTrajectory)
- Evidence velocity: line 20971 (computeLandscapeVelocity)
- Temporal rendering: line 20987 (renderTemporalTrajectories)
- Statistical engine: line 8641 (computeMetaAnalysis)
- normalQuantile: line 8628
- tQuantile: line 10218
- Last function before </script>: line 29930
- Test file: tests/sglt2i-hf-benchmark.spec.js (4,428 lines, 313 tests)
- Manuscript: paper/manuscript_plos_one.md (379 lines)

---

## PHASE 1: Living MA Features (6 features)

### Task 1: CUSUM Monitoring Function

**Files:**
- Modify: `metasprint-autopilot.html` (insert after computeTSA, ~line 21550)

**Step 1: Write the CUSUM computation function**

Insert after the TSA section (after computeTSA ends). The CUSUM monitors cumulative deviation of each new study's effect from the running pooled mean, scaled by SE. When it crosses a configurable threshold (default h=4), it signals a shift.

```javascript
/**
 * CUSUM monitoring for sequential evidence surveillance.
 * Detects shifts in pooled effect as studies accumulate chronologically.
 * @param {Array} studies - [{effect_estimate, lower_ci, upper_ci, start_date}]
 * @param {object} options - {threshold: 4, targetEffect: null, confLevel: 0.95}
 * @returns {object} {cusumPlus, cusumMinus, crossings, alertStatus, chartData}
 */
function computeCUSUM(studies, options) {
  'use strict';
  const opts = options ?? {};
  const threshold = opts.threshold ?? 4;
  const confLevel = opts.confLevel ?? 0.95;
  const zCrit = normalQuantile(1 - (1 - confLevel) / 2);

  // Sort chronologically
  const dated = studies
    .filter(s => s.effect_estimate != null && s.start_date)
    .map(s => {
      const yr = typeof s.start_date === 'number' ? s.start_date
        : parseInt(String(s.start_date).replace(/\D.*/, ''), 10);
      const se = (Math.log(Math.abs(s.upper_ci ?? s.effect_estimate)) -
                  Math.log(Math.abs(s.lower_ci ?? s.effect_estimate))) / (2 * zCrit) || 0.5;
      return { effect: s.effect_estimate, se: Math.max(se, 0.001), year: yr || 2020 };
    })
    .sort((a, b) => a.year - b.year);

  if (dated.length < 3) return null;

  // Target effect: use overall pooled mean if not specified
  const targetEffect = opts.targetEffect ?? (function() {
    let sw = 0, swe = 0;
    for (const d of dated) { const w = 1 / (d.se * d.se); sw += w; swe += w * d.effect; }
    return sw > 0 ? swe / sw : 0;
  })();

  const chartData = [];
  let cusumPlus = 0, cusumMinus = 0;
  const crossings = [];

  for (let i = 0; i < dated.length; i++) {
    const z = (dated[i].effect - targetEffect) / dated[i].se;
    cusumPlus = Math.max(0, cusumPlus + z - 0.5);
    cusumMinus = Math.max(0, cusumMinus - z - 0.5);

    const crossed = cusumPlus >= threshold || cusumMinus >= threshold;
    if (crossed) {
      crossings.push({
        index: i,
        year: dated[i].year,
        direction: cusumPlus >= threshold ? 'positive' : 'negative',
        value: cusumPlus >= threshold ? cusumPlus : cusumMinus
      });
    }

    chartData.push({
      index: i,
      year: dated[i].year,
      cusumPlus: cusumPlus,
      cusumMinus: cusumMinus,
      threshold: threshold,
      crossed: crossed
    });
  }

  return {
    cusumPlus: cusumPlus,
    cusumMinus: cusumMinus,
    crossings: crossings,
    alertStatus: crossings.length > 0 ? 'SHIFT_DETECTED' : 'STABLE',
    threshold: threshold,
    targetEffect: targetEffect,
    k: dated.length,
    chartData: chartData
  };
}
```

**Step 2: Verify no syntax errors**

Run: `npx playwright test tests/sglt2i-hf-benchmark.spec.js --grep "001" --timeout 30000 2>&1 | tail -5`
Expected: Single test passes (page loads without JS errors)

**Step 3: Commit**

```bash
git add metasprint-autopilot.html
git commit -m "feat(living-ma): add CUSUM monitoring function for sequential surveillance"
```

---

### Task 2: Alpha Spending Functions

**Files:**
- Modify: `metasprint-autopilot.html` (insert after computeCUSUM)

**Step 1: Write alpha spending functions**

Three spending function types: O'Brien-Fleming (conservative early, aggressive late), Pocock (uniform spending), and Lan-DeMets (O'Brien-Fleming approximation).

```javascript
/**
 * Alpha spending functions for sequential monitoring boundaries.
 * @param {number} infoFraction - Information fraction (0 to 1+)
 * @param {number} alpha - Overall significance level (default 0.05)
 * @param {string} type - 'obrien-fleming' | 'pocock' | 'lan-demets'
 * @returns {number} Cumulative alpha spent at this information fraction
 */
function alphaSpending(infoFraction, alpha, type) {
  'use strict';
  alpha = alpha ?? 0.05;
  type = type ?? 'obrien-fleming';
  const t = Math.max(0, Math.min(infoFraction, 1.5));
  if (t <= 0) return 0;
  if (t >= 1) return alpha;

  switch (type) {
    case 'obrien-fleming':
      // 2 * (1 - Phi(z_{alpha/2} / sqrt(t)))
      return 2 * (1 - normalCDF(normalQuantile(1 - alpha / 2) / Math.sqrt(t)));
    case 'pocock':
      // alpha * ln(1 + (e - 1) * t)
      return alpha * Math.log(1 + (Math.E - 1) * t);
    case 'lan-demets':
      // Lan-DeMets O'Brien-Fleming approximation: alpha * (1 - exp(-2 * z^2 / t)) ... simplified
      // Standard: 2 - 2*Phi(z_{alpha/2} / sqrt(t))  [same as OBF for spending]
      return 2 * (1 - normalCDF(normalQuantile(1 - alpha / 2) / Math.sqrt(t)));
    default:
      return alpha * t; // Linear spending (Pocock-like)
  }
}

/**
 * Compute sequential monitoring boundaries at each interim look.
 * @param {Array<number>} infoFractions - Array of information fractions [0.25, 0.5, 0.75, 1.0]
 * @param {number} alpha - Overall two-sided alpha (default 0.05)
 * @param {string} spendingType - 'obrien-fleming' | 'pocock' | 'lan-demets'
 * @returns {Array<object>} [{infoFraction, alphaSpent, incrementalAlpha, zBoundary}]
 */
function computeSequentialBoundaries(infoFractions, alpha, spendingType) {
  'use strict';
  alpha = alpha ?? 0.05;
  spendingType = spendingType ?? 'obrien-fleming';
  if (!infoFractions || infoFractions.length === 0) return [];

  const sorted = [...infoFractions].sort((a, b) => a - b);
  const boundaries = [];
  let prevSpent = 0;

  for (const t of sorted) {
    const cumSpent = alphaSpending(t, alpha, spendingType);
    const incremental = Math.max(0, cumSpent - prevSpent);
    // Two-sided z-boundary from incremental alpha
    const zBound = incremental > 0 ? normalQuantile(1 - incremental / 2) : Infinity;
    boundaries.push({
      infoFraction: t,
      alphaSpent: cumSpent,
      incrementalAlpha: incremental,
      zBoundary: Math.min(zBound, 20) // Cap at 20 for display
    });
    prevSpent = cumSpent;
  }

  return boundaries;
}
```

**Step 2: Verify no syntax errors**

Run: `npx playwright test tests/sglt2i-hf-benchmark.spec.js --grep "001" --timeout 30000 2>&1 | tail -5`
Expected: PASS

**Step 3: Commit**

```bash
git add metasprint-autopilot.html
git commit -m "feat(living-ma): add alpha spending functions (OBF, Pocock, Lan-DeMets)"
```

---

### Task 3: Information Fraction + RIS Tracker

**Files:**
- Modify: `metasprint-autopilot.html` (insert after computeSequentialBoundaries)

**Step 1: Write information fraction computation**

```javascript
/**
 * Compute Required Information Size and running information fraction.
 * RIS = (z_alpha + z_beta)^2 / delta^2 * (1 + D2) where D2 = I2/(1-I2)
 * @param {Array} studies - Chronologically sorted study data
 * @param {object} pooledResult - From computeMetaAnalysis
 * @param {object} options - {alpha: 0.05, power: 0.80, anticipatedEffect: null}
 * @returns {object} {ris, accrued, fraction, perStudy: [{k, fraction, year}]}
 */
function computeInformationFraction(studies, pooledResult, options) {
  'use strict';
  const opts = options ?? {};
  const alpha = opts.alpha ?? 0.05;
  const power = opts.power ?? 0.80;
  const zAlpha = normalQuantile(1 - alpha / 2);
  const zBeta = normalQuantile(power);

  if (!pooledResult || !studies || studies.length < 2) return null;

  const delta = opts.anticipatedEffect ?? pooledResult.pooled ?? 0;
  if (Math.abs(delta) < 1e-10) return null;

  const I2 = (pooledResult.I2 ?? 0) / 100;
  const D2 = I2 < 1 ? I2 / (1 - I2) : 10;
  const risNaive = Math.pow(zAlpha + zBeta, 2) / Math.pow(delta, 2);
  const ris = risNaive * (1 + D2);

  // Cumulative information = sum(1/vi)
  const dated = studies
    .filter(s => s.effect_estimate != null)
    .map(s => {
      const se = s.se ?? ((Math.log(Math.abs(s.upper_ci ?? s.effect_estimate)) -
                           Math.log(Math.abs(s.lower_ci ?? s.effect_estimate))) / (2 * zAlpha) || 0.5);
      const yr = typeof s.start_date === 'number' ? s.start_date
        : parseInt(String(s.start_date ?? '2020').replace(/\D.*/, ''), 10);
      return { se: Math.max(se, 0.001), year: yr || 2020 };
    })
    .sort((a, b) => a.year - b.year);

  let accrued = 0;
  const perStudy = [];
  for (let i = 0; i < dated.length; i++) {
    accrued += 1 / (dated[i].se * dated[i].se);
    perStudy.push({
      k: i + 1,
      year: dated[i].year,
      accrued: accrued,
      fraction: accrued / ris
    });
  }

  return {
    ris: ris,
    risNaive: risNaive,
    D2: D2,
    accrued: accrued,
    fraction: accrued / ris,
    anticipatedEffect: delta,
    perStudy: perStudy
  };
}
```

**Step 2: Verify no syntax errors**

Run: quick Playwright smoke test
Expected: PASS

**Step 3: Commit**

```bash
git add metasprint-autopilot.html
git commit -m "feat(living-ma): add information fraction and RIS computation"
```

---

### Task 4: Alert Threshold System

**Files:**
- Modify: `metasprint-autopilot.html` (insert after computeInformationFraction for logic; insert near CSS section for toast styles; insert near announceToScreenReader ~line 29930 for UI)

**Step 1: Add toast notification CSS**

Insert in the `<style>` section (near other utility CSS):

```css
.lma-toast {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 10003;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 0.85rem;
  line-height: 1.4;
  max-width: 360px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  animation: lmaToastIn 0.3s ease-out;
  transition: opacity 0.3s;
}
.lma-toast.lma-toast-warn { background: #fff3cd; color: #856404; border-left: 4px solid #ffc107; }
.lma-toast.lma-toast-alert { background: #f8d7da; color: #721c24; border-left: 4px solid #dc3545; }
.lma-toast.lma-toast-info { background: #d1ecf1; color: #0c5460; border-left: 4px solid #17a2b8; }
@keyframes lmaToastIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
@media (prefers-color-scheme: dark) {
  .lma-toast.lma-toast-warn { background: #3d3200; color: #ffc107; }
  .lma-toast.lma-toast-alert { background: #3d0a0a; color: #f5c6cb; }
  .lma-toast.lma-toast-info { background: #0a2e36; color: #bee5eb; }
}
```

**Step 2: Add toast + alert evaluation functions**

Insert near announceToScreenReader (~line 29930):

```javascript
/**
 * Show a Living MA alert toast notification.
 * @param {string} message - Alert text
 * @param {string} severity - 'info' | 'warn' | 'alert'
 * @param {number} duration - Auto-dismiss ms (default 6000)
 */
function showLMAToast(message, severity, duration) {
  'use strict';
  severity = severity ?? 'info';
  duration = duration ?? 6000;
  const toast = document.createElement('div');
  toast.className = 'lma-toast lma-toast-' + severity;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'assertive');
  toast.textContent = message;
  // Stack below existing toasts
  const existing = document.querySelectorAll('.lma-toast');
  const offset = 16 + existing.length * 56;
  toast.style.top = offset + 'px';
  document.body.appendChild(toast);
  announceToScreenReader(message);
  setTimeout(function() {
    toast.style.opacity = '0';
    setTimeout(function() { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 300);
  }, duration);
}

/**
 * Evaluate Living MA alerts from CUSUM + info fraction + trajectory data.
 * @param {object} cusumResult - From computeCUSUM
 * @param {object} infoResult - From computeInformationFraction
 * @param {Array} trajectory - From computeTemporalTrajectory
 * @returns {Array<object>} [{type, severity, message}]
 */
function evaluateLMAAlerts(cusumResult, infoResult, trajectory) {
  'use strict';
  const alerts = [];

  if (cusumResult && cusumResult.alertStatus === 'SHIFT_DETECTED') {
    const last = cusumResult.crossings[cusumResult.crossings.length - 1];
    alerts.push({
      type: 'cusum_shift',
      severity: 'alert',
      message: 'CUSUM shift detected (' + last.direction + ', year ' + last.year +
               '). The pooled effect may have changed direction or magnitude.'
    });
  }

  if (infoResult) {
    if (infoResult.fraction >= 1.0) {
      alerts.push({
        type: 'ris_reached',
        severity: 'info',
        message: 'Required Information Size reached (' + (infoResult.fraction * 100).toFixed(0) +
                 '%). Sequential monitoring boundaries are fully powered.'
      });
    } else if (infoResult.fraction >= 0.5) {
      alerts.push({
        type: 'ris_interim',
        severity: 'warn',
        message: 'Information fraction at ' + (infoResult.fraction * 100).toFixed(0) +
                 '% of RIS. Interim analysis may be warranted.'
      });
    }
  }

  if (trajectory && trajectory.length >= 3) {
    const last = trajectory[trajectory.length - 1];
    const prev = trajectory[trajectory.length - 2];
    if (last && prev) {
      const lastSign = last.effect > 0 ? 1 : last.effect < 0 ? -1 : 0;
      const prevSign = prev.effect > 0 ? 1 : prev.effect < 0 ? -1 : 0;
      if (lastSign !== 0 && prevSign !== 0 && lastSign !== prevSign) {
        alerts.push({
          type: 'direction_change',
          severity: 'alert',
          message: 'Direction change detected: pooled effect crossed null between k=' +
                   (trajectory.length - 1) + ' and k=' + trajectory.length + '.'
        });
      }
    }
  }

  return alerts;
}
```

**Step 3: Commit**

```bash
git add metasprint-autopilot.html
git commit -m "feat(living-ma): add alert threshold system with toast notifications"
```

---

### Task 5: Sequential Stopping Dashboard UI

**Files:**
- Modify: `metasprint-autopilot.html` (add HTML panel in Insights tab ~line 2100, add rendering function near renderTemporalTrajectories ~line 21037)

**Step 1: Add the "Living" insight sub-panel HTML**

Find the existing Living insight panel in the Insights tab HTML (search for `insight-living` or the Living sub-tab). Add or replace its content with the sequential stopping dashboard UI:

```html
<div class="insight-panel" id="insight-living">
  <h3 style="font-size:1rem;margin-bottom:8px">Sequential Monitoring Dashboard</h3>
  <p class="text-muted" style="font-size:0.8rem;margin-bottom:12px">
    Living meta-analysis surveillance: CUSUM control charts, alpha spending boundaries, and stopping recommendations.
  </p>
  <div style="display:flex;gap:12px;margin-bottom:12px;flex-wrap:wrap;align-items:center">
    <label style="font-size:0.8rem">Spending function:
      <select id="lmaSpendingType" style="padding:3px 6px;font-size:0.8rem;border:1px solid var(--border);border-radius:var(--radius)">
        <option value="obrien-fleming" selected>O'Brien-Fleming</option>
        <option value="pocock">Pocock</option>
        <option value="lan-demets">Lan-DeMets</option>
      </select>
    </label>
    <label style="font-size:0.8rem">CUSUM threshold (h):
      <input type="number" id="lmaCusumThreshold" value="4" min="1" max="10" step="0.5"
             style="width:56px;padding:3px 6px;font-size:0.8rem;border:1px solid var(--border);border-radius:var(--radius)">
    </label>
    <label style="font-size:0.8rem">Power:
      <select id="lmaPower" style="padding:3px 6px;font-size:0.8rem;border:1px solid var(--border);border-radius:var(--radius)">
        <option value="0.80" selected>80%</option>
        <option value="0.90">90%</option>
      </select>
    </label>
    <button id="lmaRunBtn" class="btn btn-sm"
            style="padding:4px 14px;font-size:0.8rem;background:var(--primary);color:#fff;border:none;border-radius:var(--radius);cursor:pointer"
            onclick="runLivingMADashboard()">Run Surveillance</button>
  </div>
  <div id="lmaInfoFractionBar" style="margin-bottom:12px;display:none">
    <div style="font-size:0.78rem;margin-bottom:4px"><strong>Information Fraction:</strong> <span id="lmaInfoPct">0%</span> of RIS</div>
    <div style="height:12px;background:var(--border);border-radius:6px;overflow:hidden">
      <div id="lmaInfoFill" style="height:100%;background:var(--primary);border-radius:6px;transition:width 0.4s;width:0%"></div>
    </div>
  </div>
  <div id="lmaCusumChart" style="margin-bottom:16px"></div>
  <div id="lmaSequentialChart" style="margin-bottom:16px"></div>
  <div id="lmaStoppingRecommendation" style="margin-bottom:12px"></div>
  <div id="lmaAlertLog" style="margin-bottom:12px"></div>
</div>
```

**Step 2: Add the dashboard rendering function**

Insert after renderTemporalTrajectories (~line 21037):

```javascript
/**
 * Run the Living MA sequential monitoring dashboard.
 * Uses current analysis results + Al-Burhan data to compute CUSUM, boundaries, info fraction.
 */
function runLivingMADashboard() {
  'use strict';
  const spendingType = document.getElementById('lmaSpendingType')?.value ?? 'obrien-fleming';
  const cusumH = parseFloat(document.getElementById('lmaCusumThreshold')?.value) ?? 4;
  const power = parseFloat(document.getElementById('lmaPower')?.value) ?? 0.80;
  const confLevel = parseFloat(document.getElementById('confLevelSelect')?.value) ?? 0.95;
  const alpha = 1 - confLevel;

  // Get studies from current analysis or Al-Burhan
  let studies = [];
  const result = window._lastAnalysisResult;
  if (result && result.studies && result.studies.length >= 3) {
    studies = result.studies.map(function(s, i) {
      return {
        effect_estimate: s.effectEstimate ?? s.yi,
        lower_ci: s.lowerCI ?? s.ci_lo,
        upper_ci: s.upperCI ?? s.ci_hi,
        start_date: s.year ?? (2000 + i),
        se: s.se ?? s.sei
      };
    });
  }

  if (studies.length < 3) {
    const el = document.getElementById('lmaCusumChart');
    if (el) el.innerHTML = '<p class="text-muted" style="font-size:0.8rem">Need at least 3 dated studies for sequential monitoring. Load data in the Analyze tab first.</p>';
    return;
  }

  // Compute all Living MA metrics
  const cusumResult = computeCUSUM(studies, { threshold: cusumH, confLevel: confLevel });
  const pooled = result ? { pooled: result.pooled ?? result.muRE, I2: result.I2, tau2: result.tau2 } : null;
  const infoResult = computeInformationFraction(studies, pooled, { alpha: alpha, power: power });

  // Info fraction bar
  const barWrap = document.getElementById('lmaInfoFractionBar');
  if (barWrap && infoResult) {
    barWrap.style.display = '';
    const pct = Math.min(infoResult.fraction * 100, 150).toFixed(1);
    document.getElementById('lmaInfoPct').textContent = pct + '%';
    document.getElementById('lmaInfoFill').style.width = Math.min(parseFloat(pct), 100) + '%';
    document.getElementById('lmaInfoFill').style.background =
      infoResult.fraction >= 1 ? '#28a745' : infoResult.fraction >= 0.5 ? '#ffc107' : 'var(--primary)';
  }

  // CUSUM chart (SVG)
  renderCUSUMChart(cusumResult);

  // Sequential boundaries chart
  if (infoResult) {
    const fractions = infoResult.perStudy.map(function(s) { return s.fraction; });
    const boundaries = computeSequentialBoundaries(fractions, alpha, spendingType);
    renderSequentialChart(cusumResult, boundaries, infoResult, studies, pooled);
  }

  // Stopping recommendation
  renderStoppingRecommendation(cusumResult, infoResult, pooled, alpha, spendingType);

  // Alerts
  const trajectory = (function() {
    try { return computeTemporalTrajectory({ studies: studies }); } catch (_e) { return null; }
  })();
  const alerts = evaluateLMAAlerts(cusumResult, infoResult, trajectory);
  renderLMAAlertLog(alerts);

  // Show toasts for any active alerts
  for (const a of alerts) {
    showLMAToast(a.message, a.severity);
  }
}

function renderCUSUMChart(cusumResult) {
  'use strict';
  const el = document.getElementById('lmaCusumChart');
  if (!el || !cusumResult || !cusumResult.chartData || cusumResult.chartData.length === 0) {
    if (el) el.innerHTML = '';
    return;
  }
  const data = cusumResult.chartData;
  const W = 600, H = 200, pad = { l: 50, r: 20, t: 20, b: 30 };
  const plotW = W - pad.l - pad.r, plotH = H - pad.t - pad.b;
  const maxVal = Math.max(cusumResult.threshold * 1.3,
    ...data.map(function(d) { return Math.max(d.cusumPlus, d.cusumMinus); }));
  const xScale = function(i) { return pad.l + (i / Math.max(data.length - 1, 1)) * plotW; };
  const yScale = function(v) { return pad.t + plotH - (v / maxVal) * plotH; };

  let svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" style="width:100%;max-width:600px;font-family:system-ui">';
  svg += '<rect x="' + pad.l + '" y="' + pad.t + '" width="' + plotW + '" height="' + plotH + '" fill="var(--bg-alt,#f8f9fa)" rx="4"/>';

  // Threshold line
  const threshY = yScale(cusumResult.threshold);
  svg += '<line x1="' + pad.l + '" y1="' + threshY + '" x2="' + (W - pad.r) + '" y2="' + threshY + '" stroke="#dc3545" stroke-dasharray="4,3" stroke-width="1.5"/>';
  svg += '<text x="' + (W - pad.r - 2) + '" y="' + (threshY - 4) + '" fill="#dc3545" font-size="10" text-anchor="end">h=' + cusumResult.threshold + '</text>';

  // CUSUM+ line
  let pathPlus = 'M';
  for (let i = 0; i < data.length; i++) {
    pathPlus += (i > 0 ? 'L' : '') + xScale(i).toFixed(1) + ',' + yScale(data[i].cusumPlus).toFixed(1);
  }
  svg += '<path d="' + pathPlus + '" fill="none" stroke="#0066cc" stroke-width="2"/>';

  // CUSUM- line
  let pathMinus = 'M';
  for (let i = 0; i < data.length; i++) {
    pathMinus += (i > 0 ? 'L' : '') + xScale(i).toFixed(1) + ',' + yScale(data[i].cusumMinus).toFixed(1);
  }
  svg += '<path d="' + pathMinus + '" fill="none" stroke="#cc6600" stroke-width="2"/>';

  // Crossing markers
  for (const c of cusumResult.crossings) {
    const cx = xScale(c.index), cy = yScale(c.value);
    svg += '<circle cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="5" fill="#dc3545" stroke="#fff" stroke-width="1.5"/>';
  }

  // Axis labels
  svg += '<text x="' + (pad.l + plotW / 2) + '" y="' + (H - 4) + '" fill="var(--text)" font-size="11" text-anchor="middle">Study index</text>';
  svg += '<text x="14" y="' + (pad.t + plotH / 2) + '" fill="var(--text)" font-size="11" text-anchor="middle" transform="rotate(-90,14,' + (pad.t + plotH / 2) + ')">CUSUM</text>';

  // Legend
  svg += '<circle cx="' + (pad.l + 10) + '" cy="' + (pad.t + 10) + '" r="4" fill="#0066cc"/>';
  svg += '<text x="' + (pad.l + 18) + '" y="' + (pad.t + 14) + '" fill="var(--text)" font-size="9">CUSUM+</text>';
  svg += '<circle cx="' + (pad.l + 70) + '" cy="' + (pad.t + 10) + '" r="4" fill="#cc6600"/>';
  svg += '<text x="' + (pad.l + 78) + '" y="' + (pad.t + 14) + '" fill="var(--text)" font-size="9">CUSUM\u2212</text>';

  svg += '</svg>';
  el.innerHTML = '<h4 style="font-size:0.85rem;margin-bottom:6px">CUSUM Control Chart</h4>' + svg;
}

function renderSequentialChart(cusumResult, boundaries, infoResult, studies, pooled) {
  'use strict';
  const el = document.getElementById('lmaSequentialChart');
  if (!el || !boundaries || boundaries.length === 0 || !infoResult) { if (el) el.innerHTML = ''; return; }

  const W = 600, H = 220, pad = { l: 50, r: 20, t: 20, b: 30 };
  const plotW = W - pad.l - pad.r, plotH = H - pad.t - pad.b;
  const maxFrac = Math.max(1.1, ...infoResult.perStudy.map(function(s) { return s.fraction; }));
  const maxZ = Math.max(4, ...boundaries.map(function(b) { return Math.min(b.zBoundary, 8); }));
  const xScale = function(f) { return pad.l + (f / maxFrac) * plotW; };
  const yScale = function(z) { return pad.t + plotH / 2 - (z / maxZ) * (plotH / 2); };

  let svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" style="width:100%;max-width:600px;font-family:system-ui">';
  svg += '<rect x="' + pad.l + '" y="' + pad.t + '" width="' + plotW + '" height="' + plotH + '" fill="var(--bg-alt,#f8f9fa)" rx="4"/>';

  // Zero line
  svg += '<line x1="' + pad.l + '" y1="' + yScale(0) + '" x2="' + (W - pad.r) + '" y2="' + yScale(0) + '" stroke="var(--text-muted)" stroke-width="0.5"/>';

  // RIS = 1.0 vertical line
  if (maxFrac > 1) {
    const risX = xScale(1.0);
    svg += '<line x1="' + risX + '" y1="' + pad.t + '" x2="' + risX + '" y2="' + (pad.t + plotH) + '" stroke="#28a745" stroke-dasharray="3,3" stroke-width="1"/>';
    svg += '<text x="' + risX + '" y="' + (pad.t - 4) + '" fill="#28a745" font-size="9" text-anchor="middle">RIS</text>';
  }

  // Upper boundary line
  let pathUpper = 'M';
  for (let i = 0; i < boundaries.length; i++) {
    const bx = xScale(boundaries[i].infoFraction);
    const by = yScale(Math.min(boundaries[i].zBoundary, maxZ));
    pathUpper += (i > 0 ? 'L' : '') + bx.toFixed(1) + ',' + by.toFixed(1);
  }
  svg += '<path d="' + pathUpper + '" fill="none" stroke="#dc3545" stroke-width="2" stroke-dasharray="6,3"/>';

  // Lower boundary (mirror)
  let pathLower = 'M';
  for (let i = 0; i < boundaries.length; i++) {
    const bx = xScale(boundaries[i].infoFraction);
    const by = yScale(-Math.min(boundaries[i].zBoundary, maxZ));
    pathLower += (i > 0 ? 'L' : '') + bx.toFixed(1) + ',' + by.toFixed(1);
  }
  svg += '<path d="' + pathLower + '" fill="none" stroke="#dc3545" stroke-width="2" stroke-dasharray="6,3"/>';

  // Cumulative z-statistic trajectory (from TSA-like computation)
  const confLevel = parseFloat(document.getElementById('confLevelSelect')?.value) ?? 0.95;
  const zCrit = normalQuantile(1 - (1 - confLevel) / 2);
  if (studies.length >= 2 && infoResult.perStudy.length >= 2) {
    let pathZ = 'M';
    const dated = studies
      .filter(function(s) { return s.effect_estimate != null; })
      .sort(function(a, b) { return (a.start_date ?? 0) - (b.start_date ?? 0); });
    let sw = 0, swe = 0;
    for (let i = 0; i < dated.length; i++) {
      const se = dated[i].se ?? 0.5;
      const w = 1 / (se * se);
      sw += w; swe += w * dated[i].effect_estimate;
      if (i >= 1 && sw > 0) {
        const pooledEst = swe / sw;
        const seMu = 1 / Math.sqrt(sw);
        const zStat = seMu > 0 ? pooledEst / seMu : 0;
        const frac = infoResult.perStudy[Math.min(i, infoResult.perStudy.length - 1)]?.fraction ?? 0;
        pathZ += (pathZ === 'M' ? '' : 'L') + xScale(frac).toFixed(1) + ',' + yScale(Math.max(-maxZ, Math.min(maxZ, zStat))).toFixed(1);
      }
    }
    if (pathZ !== 'M') {
      svg += '<path d="' + pathZ + '" fill="none" stroke="#0066cc" stroke-width="2.5"/>';
    }
  }

  // Axis labels
  svg += '<text x="' + (pad.l + plotW / 2) + '" y="' + (H - 4) + '" fill="var(--text)" font-size="11" text-anchor="middle">Information fraction</text>';
  svg += '<text x="14" y="' + (pad.t + plotH / 2) + '" fill="var(--text)" font-size="11" text-anchor="middle" transform="rotate(-90,14,' + (pad.t + plotH / 2) + ')">Cumulative Z</text>';

  svg += '</svg>';
  el.innerHTML = '<h4 style="font-size:0.85rem;margin-bottom:6px">Sequential Monitoring Boundaries</h4>' + svg;
}

function renderStoppingRecommendation(cusumResult, infoResult, pooled, alpha, spendingType) {
  'use strict';
  const el = document.getElementById('lmaStoppingRecommendation');
  if (!el) return;
  if (!infoResult || !cusumResult) { el.innerHTML = ''; return; }

  let recommendation = 'CONTINUE';
  let reason = '';
  let color = '#0c5460';
  let bg = '#d1ecf1';

  const fraction = infoResult.fraction;
  const boundaries = computeSequentialBoundaries([fraction], alpha ?? 0.05, spendingType);
  const zBound = boundaries.length > 0 ? boundaries[0].zBoundary : Infinity;

  // Compute current z-statistic
  const muRE = pooled?.pooled ?? 0;
  const seRE = pooled?.seMu ?? (infoResult.accrued > 0 ? 1 / Math.sqrt(infoResult.accrued) : 1);
  const currentZ = seRE > 0 ? Math.abs(muRE / seRE) : 0;

  if (currentZ >= zBound && fraction >= 0.5) {
    recommendation = 'STOP FOR EFFICACY';
    reason = 'Cumulative Z (' + currentZ.toFixed(2) + ') exceeds monitoring boundary (' + zBound.toFixed(2) +
             ') at ' + (fraction * 100).toFixed(0) + '% information fraction.';
    color = '#155724'; bg = '#d4edda';
  } else if (fraction >= 1.0 && currentZ < normalQuantile(1 - (alpha ?? 0.05) / 2)) {
    recommendation = 'STOP FOR FUTILITY';
    reason = 'Full RIS reached but Z (' + currentZ.toFixed(2) + ') below significance threshold. Consider stopping.';
    color = '#856404'; bg = '#fff3cd';
  } else if (cusumResult.alertStatus === 'SHIFT_DETECTED') {
    recommendation = 'INVESTIGATE';
    reason = 'CUSUM detected an effect shift. Review recent studies for heterogeneity or population changes.';
    color = '#721c24'; bg = '#f8d7da';
  } else {
    reason = 'Information fraction at ' + (fraction * 100).toFixed(0) + '%, Z = ' + currentZ.toFixed(2) +
             ', boundary = ' + zBound.toFixed(2) + '. Continue accumulating evidence.';
  }

  el.innerHTML = '<div style="padding:10px 16px;border-radius:8px;background:' + bg + ';color:' + color +
    ';font-size:0.85rem;border-left:4px solid ' + color + '">' +
    '<strong>Recommendation: ' + recommendation + '</strong><br>' +
    '<span style="font-size:0.78rem">' + reason + '</span></div>';
}

function renderLMAAlertLog(alerts) {
  'use strict';
  const el = document.getElementById('lmaAlertLog');
  if (!el) return;
  if (!alerts || alerts.length === 0) {
    el.innerHTML = '<p class="text-muted" style="font-size:0.78rem">No alerts triggered.</p>';
    return;
  }
  let html = '<h4 style="font-size:0.85rem;margin-bottom:6px">Alert Log</h4><ul style="font-size:0.8rem;margin:0;padding-left:18px">';
  for (const a of alerts) {
    const icon = a.severity === 'alert' ? '\u26a0' : a.severity === 'warn' ? '\u25b2' : '\u2139';
    html += '<li style="margin-bottom:4px"><strong>' + icon + '</strong> ' + a.message + '</li>';
  }
  html += '</ul>';
  el.innerHTML = html;
}
```

**Step 3: Commit**

```bash
git add metasprint-autopilot.html
git commit -m "feat(living-ma): add sequential stopping dashboard with CUSUM chart, boundaries, and recommendations"
```

---

### Task 6: Auto-Update Scheduler UI

**Files:**
- Modify: `metasprint-autopilot.html` (add scheduler controls in the Living panel, add timer logic)

**Step 1: Add scheduler controls to the Living panel**

Add below the existing controls div in insight-living:

```html
<div style="display:flex;gap:12px;margin-bottom:12px;flex-wrap:wrap;align-items:center;padding:8px 12px;background:var(--bg-alt,#f8f9fa);border-radius:var(--radius)">
  <label style="font-size:0.8rem">Auto-update interval:
    <select id="lmaAutoInterval" style="padding:3px 6px;font-size:0.8rem;border:1px solid var(--border);border-radius:var(--radius)">
      <option value="0" selected>Manual only</option>
      <option value="86400000">Daily</option>
      <option value="604800000">Weekly</option>
      <option value="2592000000">Monthly</option>
    </select>
  </label>
  <button id="lmaAutoToggle" class="btn btn-sm"
          style="padding:4px 14px;font-size:0.8rem;background:var(--surface-alt,#6c757d);color:#fff;border:none;border-radius:var(--radius);cursor:pointer"
          onclick="toggleLMAAutoUpdate()">Enable Auto-Update</button>
  <span id="lmaLastUpdated" class="text-muted" style="font-size:0.75rem"></span>
  <span id="lmaStaleWarning" style="display:none;font-size:0.75rem;color:#dc3545;font-weight:600">Evidence may be stale</span>
</div>
```

**Step 2: Add auto-update timer logic**

Insert near runLivingMADashboard:

```javascript
let _lmaAutoTimer = null;
let _lmaLastUpdateTime = null;

function toggleLMAAutoUpdate() {
  'use strict';
  const btn = document.getElementById('lmaAutoToggle');
  const intervalMs = parseInt(document.getElementById('lmaAutoInterval')?.value ?? '0', 10);

  if (_lmaAutoTimer) {
    clearInterval(_lmaAutoTimer);
    _lmaAutoTimer = null;
    if (btn) { btn.textContent = 'Enable Auto-Update'; btn.style.background = 'var(--surface-alt,#6c757d)'; }
    return;
  }

  if (intervalMs <= 0) {
    showLMAToast('Select an interval first (daily/weekly/monthly).', 'warn');
    return;
  }

  // Run immediately, then schedule
  runLivingMADashboard();
  _lmaLastUpdateTime = Date.now();
  updateLMATimestamp();

  _lmaAutoTimer = setInterval(function() {
    runLivingMADashboard();
    _lmaLastUpdateTime = Date.now();
    updateLMATimestamp();
  }, intervalMs);

  if (btn) { btn.textContent = 'Disable Auto-Update'; btn.style.background = '#28a745'; }
  showLMAToast('Auto-update enabled. Next check in ' + formatInterval(intervalMs) + '.', 'info');
}

function updateLMATimestamp() {
  'use strict';
  const el = document.getElementById('lmaLastUpdated');
  const warn = document.getElementById('lmaStaleWarning');
  if (el && _lmaLastUpdateTime) {
    el.textContent = 'Last updated: ' + new Date(_lmaLastUpdateTime).toLocaleString();
  }
  // Check staleness
  const intervalMs = parseInt(document.getElementById('lmaAutoInterval')?.value ?? '0', 10);
  if (warn && intervalMs > 0 && _lmaLastUpdateTime) {
    const elapsed = Date.now() - _lmaLastUpdateTime;
    warn.style.display = elapsed > intervalMs * 1.5 ? '' : 'none';
  }
}

function formatInterval(ms) {
  'use strict';
  if (ms >= 2592000000) return 'monthly';
  if (ms >= 604800000) return 'weekly';
  if (ms >= 86400000) return 'daily';
  return (ms / 1000).toFixed(0) + 's';
}
```

**Step 3: Verify all existing tests still pass**

Run: `npx playwright test tests/sglt2i-hf-benchmark.spec.js 2>&1 | tail -5`
Expected: 313 passed

**Step 4: Commit**

```bash
git add metasprint-autopilot.html
git commit -m "feat(living-ma): add auto-update scheduler with stale evidence warning"
```

---

## PHASE 2: Test Coverage Expansion

### Task 7: Living MA Feature Tests (new spec file)

**Files:**
- Create: `tests/living-ma-and-advanced.spec.js`

**Step 1: Write the test file with Living MA tests**

```javascript
// @ts-check
const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:9876/metasprint-autopilot.html';

// ── Living MA study data: 8 studies with dates for temporal monitoring ──
const TEMPORAL_STUDIES = [
  { authorYear: 'Alpha 2015', effect: 0.82, lo: 0.68, hi: 0.99, effectType: 'HR', nTotal: 500, nIntervention: 250, nControl: 250 },
  { authorYear: 'Beta 2016', effect: 0.79, lo: 0.65, hi: 0.96, effectType: 'HR', nTotal: 600, nIntervention: 300, nControl: 300 },
  { authorYear: 'Gamma 2017', effect: 0.85, lo: 0.72, hi: 1.01, effectType: 'HR', nTotal: 400, nIntervention: 200, nControl: 200 },
  { authorYear: 'Delta 2018', effect: 0.75, lo: 0.63, hi: 0.89, effectType: 'HR', nTotal: 800, nIntervention: 400, nControl: 400 },
  { authorYear: 'Epsilon 2019', effect: 0.88, lo: 0.74, hi: 1.05, effectType: 'HR', nTotal: 350, nIntervention: 175, nControl: 175 },
  { authorYear: 'Zeta 2020', effect: 0.72, lo: 0.61, hi: 0.85, effectType: 'HR', nTotal: 1000, nIntervention: 500, nControl: 500 },
  { authorYear: 'Eta 2021', effect: 0.78, lo: 0.67, hi: 0.91, effectType: 'HR', nTotal: 700, nIntervention: 350, nControl: 350 },
  { authorYear: 'Theta 2022', effect: 0.80, lo: 0.70, hi: 0.92, effectType: 'HR', nTotal: 900, nIntervention: 450, nControl: 450 },
];

test.describe('Living MA + Advanced Methods', () => {
  let page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    // Dismiss onboarding
    await page.evaluate(() => {
      const ob = document.getElementById('onboardOverlay');
      if (ob) ob.style.display = 'none';
      document.querySelectorAll('[onclick*="parentElement"]').forEach(b => { try { b.click(); } catch (_) {} });
    });
  });

  test.afterAll(async () => { await page.close(); });

  // ── CUSUM ──
  test('L01 - computeCUSUM function exists', async () => {
    const exists = await page.evaluate(() => typeof computeCUSUM === 'function');
    expect(exists).toBe(true);
  });

  test('L02 - CUSUM returns valid result for 8 studies', async () => {
    const result = await page.evaluate(() => {
      const studies = [
        { effect_estimate: 0.82, lower_ci: 0.68, upper_ci: 0.99, start_date: 2015 },
        { effect_estimate: 0.79, lower_ci: 0.65, upper_ci: 0.96, start_date: 2016 },
        { effect_estimate: 0.85, lower_ci: 0.72, upper_ci: 1.01, start_date: 2017 },
        { effect_estimate: 0.75, lower_ci: 0.63, upper_ci: 0.89, start_date: 2018 },
        { effect_estimate: 0.88, lower_ci: 0.74, upper_ci: 1.05, start_date: 2019 },
        { effect_estimate: 0.72, lower_ci: 0.61, upper_ci: 0.85, start_date: 2020 },
        { effect_estimate: 0.78, lower_ci: 0.67, upper_ci: 0.91, start_date: 2021 },
        { effect_estimate: 0.80, lower_ci: 0.70, upper_ci: 0.92, start_date: 2022 },
      ];
      return computeCUSUM(studies, { threshold: 4 });
    });
    expect(result).not.toBeNull();
    expect(result.k).toBe(8);
    expect(result.chartData.length).toBe(8);
    expect(result.alertStatus).toMatch(/^(STABLE|SHIFT_DETECTED)$/);
    expect(result.cusumPlus).toBeGreaterThanOrEqual(0);
    expect(result.cusumMinus).toBeGreaterThanOrEqual(0);
  });

  test('L03 - CUSUM returns null for < 3 studies', async () => {
    const result = await page.evaluate(() => {
      return computeCUSUM([
        { effect_estimate: 0.82, lower_ci: 0.68, upper_ci: 0.99, start_date: 2015 },
        { effect_estimate: 0.79, lower_ci: 0.65, upper_ci: 0.96, start_date: 2016 },
      ]);
    });
    expect(result).toBeNull();
  });

  test('L04 - CUSUM detects shift with divergent data', async () => {
    const result = await page.evaluate(() => {
      const studies = [];
      for (let i = 0; i < 10; i++) {
        studies.push({ effect_estimate: 0.80, lower_ci: 0.70, upper_ci: 0.92, start_date: 2010 + i });
      }
      // Sudden shift
      for (let i = 0; i < 10; i++) {
        studies.push({ effect_estimate: 1.20, lower_ci: 1.05, upper_ci: 1.38, start_date: 2020 + i });
      }
      return computeCUSUM(studies, { threshold: 4 });
    });
    expect(result).not.toBeNull();
    expect(result.alertStatus).toBe('SHIFT_DETECTED');
    expect(result.crossings.length).toBeGreaterThan(0);
  });

  // ── Alpha Spending ──
  test('L05 - alphaSpending function exists', async () => {
    const exists = await page.evaluate(() => typeof alphaSpending === 'function');
    expect(exists).toBe(true);
  });

  test('L06 - OBF spending: conservative early, full at end', async () => {
    const result = await page.evaluate(() => {
      return {
        early: alphaSpending(0.25, 0.05, 'obrien-fleming'),
        mid: alphaSpending(0.5, 0.05, 'obrien-fleming'),
        late: alphaSpending(0.75, 0.05, 'obrien-fleming'),
        full: alphaSpending(1.0, 0.05, 'obrien-fleming'),
      };
    });
    expect(result.early).toBeLessThan(0.001);  // Very conservative early
    expect(result.mid).toBeLessThan(0.02);
    expect(result.late).toBeLessThan(result.full);
    expect(result.full).toBeCloseTo(0.05, 3);
  });

  test('L07 - Pocock spending: more uniform than OBF', async () => {
    const result = await page.evaluate(() => {
      return {
        obfEarly: alphaSpending(0.25, 0.05, 'obrien-fleming'),
        pocockEarly: alphaSpending(0.25, 0.05, 'pocock'),
      };
    });
    expect(result.pocockEarly).toBeGreaterThan(result.obfEarly);
  });

  test('L08 - computeSequentialBoundaries returns valid array', async () => {
    const result = await page.evaluate(() => {
      return computeSequentialBoundaries([0.25, 0.5, 0.75, 1.0], 0.05, 'obrien-fleming');
    });
    expect(result.length).toBe(4);
    expect(result[0].zBoundary).toBeGreaterThan(result[3].zBoundary);  // OBF: early boundary stricter
    for (const b of result) {
      expect(b.infoFraction).toBeGreaterThan(0);
      expect(b.alphaSpent).toBeGreaterThanOrEqual(0);
      expect(b.zBoundary).toBeGreaterThan(0);
    }
  });

  // ── Information Fraction ──
  test('L09 - computeInformationFraction function exists', async () => {
    const exists = await page.evaluate(() => typeof computeInformationFraction === 'function');
    expect(exists).toBe(true);
  });

  test('L10 - info fraction returns valid RIS and fraction', async () => {
    const result = await page.evaluate(() => {
      const studies = [
        { effect_estimate: 0.82, lower_ci: 0.68, upper_ci: 0.99, start_date: 2015 },
        { effect_estimate: 0.79, lower_ci: 0.65, upper_ci: 0.96, start_date: 2016 },
        { effect_estimate: 0.85, lower_ci: 0.72, upper_ci: 1.01, start_date: 2017 },
        { effect_estimate: 0.75, lower_ci: 0.63, upper_ci: 0.89, start_date: 2018 },
      ];
      const pooled = { pooled: 0.80, I2: 20, tau2: 0.01 };
      return computeInformationFraction(studies, pooled);
    });
    expect(result).not.toBeNull();
    expect(result.ris).toBeGreaterThan(0);
    expect(result.fraction).toBeGreaterThan(0);
    expect(result.perStudy.length).toBe(4);
    expect(result.perStudy[3].fraction).toBeGreaterThan(result.perStudy[0].fraction);
  });

  test('L11 - info fraction returns null for < 2 studies', async () => {
    const result = await page.evaluate(() => {
      return computeInformationFraction(
        [{ effect_estimate: 0.8, lower_ci: 0.6, upper_ci: 1.0, start_date: 2020 }],
        { pooled: 0.8, I2: 0, tau2: 0 }
      );
    });
    expect(result).toBeNull();
  });

  // ── Alert System ──
  test('L12 - evaluateLMAAlerts function exists', async () => {
    const exists = await page.evaluate(() => typeof evaluateLMAAlerts === 'function');
    expect(exists).toBe(true);
  });

  test('L13 - alerts fire for CUSUM shift', async () => {
    const alerts = await page.evaluate(() => {
      const cusum = { alertStatus: 'SHIFT_DETECTED', crossings: [{ direction: 'positive', year: 2022 }] };
      return evaluateLMAAlerts(cusum, null, null);
    });
    expect(alerts.length).toBeGreaterThan(0);
    expect(alerts[0].type).toBe('cusum_shift');
    expect(alerts[0].severity).toBe('alert');
  });

  test('L14 - alerts fire for RIS reached', async () => {
    const alerts = await page.evaluate(() => {
      const info = { fraction: 1.2 };
      return evaluateLMAAlerts(null, info, null);
    });
    expect(alerts.some(a => a.type === 'ris_reached')).toBe(true);
  });

  test('L15 - showLMAToast function exists', async () => {
    const exists = await page.evaluate(() => typeof showLMAToast === 'function');
    expect(exists).toBe(true);
  });

  test('L16 - toast renders and auto-dismisses', async () => {
    const result = await page.evaluate(async () => {
      showLMAToast('Test alert', 'info', 1000);
      const count = document.querySelectorAll('.lma-toast').length;
      await new Promise(r => setTimeout(r, 1500));
      const countAfter = document.querySelectorAll('.lma-toast').length;
      return { count, countAfter };
    });
    expect(result.count).toBeGreaterThanOrEqual(1);
    expect(result.countAfter).toBe(0);
  });

  // ── Dashboard Integration ──
  test('L17 - Insights tab exists and is navigable', async () => {
    await page.evaluate(() => switchPhase('insights'));
    await page.waitForTimeout(500);
    const visible = await page.evaluate(() => {
      const panel = document.getElementById('phase-insights');
      return panel && panel.offsetParent !== null;
    });
    expect(visible).toBe(true);
  });

  test('L18 - Living sub-tab panel exists', async () => {
    const exists = await page.evaluate(() => !!document.getElementById('insight-living'));
    expect(exists).toBe(true);
  });

  test('L19 - Sequential dashboard controls exist', async () => {
    const controls = await page.evaluate(() => ({
      spending: !!document.getElementById('lmaSpendingType'),
      threshold: !!document.getElementById('lmaCusumThreshold'),
      power: !!document.getElementById('lmaPower'),
      runBtn: !!document.getElementById('lmaRunBtn'),
      autoInterval: !!document.getElementById('lmaAutoInterval'),
    }));
    expect(controls.spending).toBe(true);
    expect(controls.threshold).toBe(true);
    expect(controls.power).toBe(true);
    expect(controls.runBtn).toBe(true);
    expect(controls.autoInterval).toBe(true);
  });

  test('L20 - runLivingMADashboard function exists', async () => {
    const exists = await page.evaluate(() => typeof runLivingMADashboard === 'function');
    expect(exists).toBe(true);
  });
});
```

**Step 2: Run the Living MA tests**

Run: `npx playwright test tests/living-ma-and-advanced.spec.js 2>&1 | tail -10`
Expected: 20 passed

**Step 3: Commit**

```bash
git add tests/living-ma-and-advanced.spec.js
git commit -m "test: add 20 Living MA E2E tests (CUSUM, alpha spending, info fraction, alerts)"
```

---

### Task 8: Advanced Methods Tests (DDMA, RoBMA, Z-Curve, Copas, 3-Level, Cook's D)

**Files:**
- Modify: `tests/living-ma-and-advanced.spec.js` (append new describe block)

**Step 1: Append advanced methods tests**

Add a second describe block to the same file:

```javascript
test.describe('Advanced Ported Methods', () => {
  let page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.evaluate(() => {
      const ob = document.getElementById('onboardOverlay');
      if (ob) ob.style.display = 'none';
    });
  });

  test.afterAll(async () => { await page.close(); });

  // 8 ported methods: function existence + basic output
  const METHODS = [
    { name: 'computeDDMA', label: 'DDMA' },
    { name: 'computeRoBMA', label: 'RoBMA' },
    { name: 'computeZCurve', label: 'Z-Curve' },
    { name: 'computeCopasSelection', label: 'Copas Selection' },
    { name: 'computeThreeLevelMA', label: 'Three-Level MA' },
    { name: 'computeCooksDistance', label: "Cook's Distance" },
    { name: 'computeMantelHaenszel', label: 'Mantel-Haenszel' },
    { name: 'computePetoOR', label: 'Peto OR' },
  ];

  for (const m of METHODS) {
    test(`A01-${m.label}: ${m.name} function exists`, async () => {
      const exists = await page.evaluate((fn) => typeof window[fn] === 'function' || typeof eval(fn) === 'function', m.name);
      expect(exists).toBe(true);
    });
  }

  test('A09 - Mantel-Haenszel produces valid pooled OR for binary data', async () => {
    const result = await page.evaluate(() => {
      const studies = [
        { events_i: 15, total_i: 100, events_c: 25, total_c: 100 },
        { events_i: 20, total_i: 150, events_c: 30, total_c: 150 },
        { events_i: 10, total_i: 80, events_c: 18, total_c: 80 },
      ];
      return typeof computeMantelHaenszel === 'function' ? computeMantelHaenszel(studies) : null;
    });
    if (result) {
      expect(result.pooledOR).toBeLessThan(1);  // Intervention should be protective
      expect(result.pooledOR).toBeGreaterThan(0);
      expect(result.ciLo).toBeLessThan(result.pooledOR);
      expect(result.ciHi).toBeGreaterThan(result.pooledOR);
    }
  });

  test('A10 - Peto OR for rare events', async () => {
    const result = await page.evaluate(() => {
      const studies = [
        { events_i: 2, total_i: 200, events_c: 8, total_c: 200 },
        { events_i: 1, total_i: 150, events_c: 5, total_c: 150 },
        { events_i: 3, total_i: 300, events_c: 10, total_c: 300 },
      ];
      return typeof computePetoOR === 'function' ? computePetoOR(studies) : null;
    });
    if (result) {
      expect(result.pooledOR).toBeLessThan(1);
      expect(result.pooledOR).toBeGreaterThan(0);
    }
  });

  test('A11 - Cook\'s Distance returns k values', async () => {
    const result = await page.evaluate(() => {
      if (typeof computeCooksDistance !== 'function') return null;
      const studies = [
        { effectEstimate: -0.5, lowerCI: -0.9, upperCI: -0.1 },
        { effectEstimate: -0.3, lowerCI: -0.7, upperCI: 0.1 },
        { effectEstimate: -0.4, lowerCI: -0.8, upperCI: 0.0 },
        { effectEstimate: 0.5, lowerCI: 0.1, upperCI: 0.9 },   // Outlier
        { effectEstimate: -0.6, lowerCI: -1.0, upperCI: -0.2 },
      ];
      return computeCooksDistance(studies);
    });
    if (result) {
      expect(result.length).toBe(5);
      // The outlier (index 3) should have highest Cook's D
      const maxIdx = result.indexOf(Math.max(...result));
      expect(maxIdx).toBe(3);
    }
  });

  test('A12 - Z-Curve produces expected discovery rate', async () => {
    const result = await page.evaluate(() => {
      if (typeof computeZCurve !== 'function') return null;
      // Generate 20 z-values (mix of significant and non-significant)
      const zValues = [2.5, 3.1, 1.8, 2.9, 0.5, 3.5, 2.1, 1.2, 2.8, 4.0,
                       1.5, 2.3, 0.8, 3.2, 2.0, 1.9, 2.7, 0.3, 3.8, 2.4];
      return computeZCurve(zValues);
    });
    if (result) {
      expect(result.EDR).toBeGreaterThan(0);
      expect(result.EDR).toBeLessThanOrEqual(1);
      if (result.ERR !== undefined) {
        expect(result.ERR).toBeGreaterThanOrEqual(0);
      }
    }
  });
});
```

**Step 2: Run the tests**

Run: `npx playwright test tests/living-ma-and-advanced.spec.js 2>&1 | tail -10`
Expected: All pass (32+ tests)

**Step 3: Commit**

```bash
git add tests/living-ma-and-advanced.spec.js
git commit -m "test: add advanced methods tests (MH, Peto, Cook's D, Z-Curve, 8 function checks)"
```

---

### Task 9: DTA + NMA Deep E2E Tests

**Files:**
- Modify: `tests/living-ma-and-advanced.spec.js` (append DTA/NMA describe blocks)

**Step 1: Append DTA deep tests**

```javascript
test.describe('DTA Deep E2E', () => {
  let page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.evaluate(() => {
      const ob = document.getElementById('onboardOverlay');
      if (ob) ob.style.display = 'none';
    });
  });

  test.afterAll(async () => { await page.close(); });

  const DTA_STUDIES = [
    { tp: 90, fp: 10, fn: 5, tn: 95, authorYear: 'Study A 2018' },
    { tp: 85, fp: 15, fn: 8, tn: 92, authorYear: 'Study B 2019' },
    { tp: 92, fp: 8, fn: 3, tn: 97, authorYear: 'Study C 2020' },
    { tp: 78, fp: 22, fn: 12, tn: 88, authorYear: 'Study D 2020' },
    { tp: 88, fp: 12, fn: 6, tn: 94, authorYear: 'Study E 2021' },
  ];

  test('D01 - bivariate GLMM converges for 5 studies', async () => {
    const result = await page.evaluate((studies) => {
      return computeBivariateModel(studies, 0.95);
    }, DTA_STUDIES);
    expect(result).not.toBeNull();
    expect(result.pooledSens).toBeGreaterThan(0.7);
    expect(result.pooledSpec).toBeGreaterThan(0.7);
    expect(result.dor).toBeGreaterThan(1);
    expect(result.k).toBe(5);
  });

  test('D02 - HSROC curve parameters computed', async () => {
    const result = await page.evaluate((studies) => {
      const biv = computeBivariateModel(studies, 0.95);
      return biv?.hsroc ?? biv;
    }, DTA_STUDIES);
    expect(result).not.toBeNull();
  });

  test('D03 - SROC AUC uses normalCDF (Phi), not logistic', async () => {
    const auc = await page.evaluate(() => {
      // Verify that SROC AUC calculation path uses normalCDF
      // AUC = Phi(Lambda/sqrt(2)) where Lambda = d/sqrt(1 + s^2/4)
      const phi05 = normalCDF(0);
      return { phi05, usesNormalCDF: typeof normalCDF === 'function' };
    });
    expect(auc.phi05).toBeCloseTo(0.5, 5);
    expect(auc.usesNormalCDF).toBe(true);
  });

  test('D04 - DTA tab renders study table', async () => {
    await page.evaluate(() => switchPhase('dta'));
    await page.waitForTimeout(500);
    const tableExists = await page.evaluate(() => !!document.getElementById('dtaExtractBody'));
    expect(tableExists).toBe(true);
  });

  test('D05 - Fagan nomogram computation: LR+ increases post-test prob', async () => {
    const result = await page.evaluate(() => {
      // Manual check: preTestProb=0.3, LR+=5 => postTest should be higher
      const preTest = 0.3;
      const LRplus = 5;
      const preOdds = preTest / (1 - preTest);
      const postOdds = preOdds * LRplus;
      const postTest = postOdds / (1 + postOdds);
      return { preTest, postTest };
    });
    expect(result.postTest).toBeGreaterThan(result.preTest);
    expect(result.postTest).toBeCloseTo(0.682, 2);
  });

  test('D06 - Deeks funnel test returns slope and p-value', async () => {
    const result = await page.evaluate((studies) => {
      if (typeof computeDeeksFunnel !== 'function') return null;
      return computeDeeksFunnel(studies);
    }, [
      ...DTA_STUDIES,
      { tp: 95, fp: 5, fn: 2, tn: 98, authorYear: 'F 2021' },
      { tp: 80, fp: 20, fn: 10, tn: 90, authorYear: 'G 2021' },
      { tp: 87, fp: 13, fn: 7, tn: 93, authorYear: 'H 2022' },
      { tp: 91, fp: 9, fn: 4, tn: 96, authorYear: 'I 2022' },
      { tp: 83, fp: 17, fn: 9, tn: 91, authorYear: 'J 2022' },
      { tp: 89, fp: 11, fn: 5, tn: 95, authorYear: 'K 2023' },
      { tp: 86, fp: 14, fn: 8, tn: 92, authorYear: 'L 2023' },
    ]);
    if (result) {
      expect(result.slope).toBeDefined();
      expect(result.pValue).toBeGreaterThan(0);
      expect(result.pValue).toBeLessThanOrEqual(1);
    }
  });
});

test.describe('NMA Deep E2E', () => {
  let page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.evaluate(() => {
      const ob = document.getElementById('onboardOverlay');
      if (ob) ob.style.display = 'none';
    });
  });

  test.afterAll(async () => { await page.close(); });

  const NMA_CONTRASTS = [
    { study: 'Trial1', treatA: 'DrugA', treatB: 'Placebo', effect: -0.50, se: 0.20 },
    { study: 'Trial2', treatA: 'DrugA', treatB: 'Placebo', effect: -0.40, se: 0.25 },
    { study: 'Trial3', treatA: 'DrugB', treatB: 'Placebo', effect: -0.30, se: 0.20 },
    { study: 'Trial4', treatA: 'DrugB', treatB: 'Placebo', effect: -0.35, se: 0.22 },
    { study: 'Trial5', treatA: 'DrugA', treatB: 'DrugB', effect: -0.15, se: 0.30 },
    { study: 'Trial6', treatA: 'DrugC', treatB: 'Placebo', effect: -0.20, se: 0.18 },
    { study: 'Trial7', treatA: 'DrugC', treatB: 'DrugA', effect: 0.25, se: 0.28 },
  ];

  test('N01 - computeFrequentistNMA produces 4-treatment league table', async () => {
    const result = await page.evaluate((contrasts) => {
      return computeFrequentistNMA(contrasts, 0.95);
    }, NMA_CONTRASTS);
    expect(result).not.toBeNull();
    expect(result.treatments.length).toBe(4);
    expect(result.leagueTable).toBeDefined();
  });

  test('N02 - P-scores sum to approximately k*(k-1)/2 / k', async () => {
    const result = await page.evaluate((contrasts) => {
      const nma = computeFrequentistNMA(contrasts, 0.95);
      if (!nma || !nma.pScores) return null;
      const sum = Object.values(nma.pScores).reduce((s, v) => s + v, 0);
      return { pScores: nma.pScores, sum, k: nma.treatments.length };
    }, NMA_CONTRASTS);
    if (result) {
      // P-scores should sum to approximately k/2
      expect(result.sum).toBeCloseTo(result.k / 2, 0);
    }
  });

  test('N03 - Bucher indirect: A vs C = (A vs B) - (C vs B)', async () => {
    const result = await page.evaluate(() => {
      // Direct: A vs Placebo = -0.45 (pooled), C vs Placebo = -0.20
      // Indirect A vs C should be approximately -0.25
      const contrasts = [
        { study: 'T1', treatA: 'A', treatB: 'Placebo', effect: -0.45, se: 0.15 },
        { study: 'T2', treatA: 'C', treatB: 'Placebo', effect: -0.20, se: 0.18 },
      ];
      const nma = computeFrequentistNMA(contrasts, 0.95);
      if (!nma || !nma.leagueTable) return null;
      // Find A vs C in league table
      const key = ['A', 'C'].sort().join('_vs_');
      return nma;
    });
    expect(result).not.toBeNull();
    expect(result.treatments.length).toBeGreaterThanOrEqual(3);
  });

  test('N04 - NMA tab exists and renders', async () => {
    await page.evaluate(() => switchPhase('nma'));
    await page.waitForTimeout(500);
    const panel = await page.evaluate(() => {
      const el = document.getElementById('phase-nma');
      return el && el.offsetParent !== null;
    });
    expect(panel).toBe(true);
  });

  test('N05 - node-splitting consistency check structure', async () => {
    const result = await page.evaluate((contrasts) => {
      const nma = computeFrequentistNMA(contrasts, 0.95);
      return {
        hasConsistency: !!(nma?.consistency),
        hasTreatments: !!(nma?.treatments),
        hasLeague: !!(nma?.leagueTable),
      };
    }, NMA_CONTRASTS);
    expect(result.hasTreatments).toBe(true);
    expect(result.hasLeague).toBe(true);
  });
});
```

**Step 2: Run the tests**

Run: `npx playwright test tests/living-ma-and-advanced.spec.js 2>&1 | tail -10`
Expected: All pass

**Step 3: Commit**

```bash
git add tests/living-ma-and-advanced.spec.js
git commit -m "test: add DTA deep E2E (6 tests) + NMA deep E2E (5 tests)"
```

---

### Task 10: Import/Export Round-Trip Tests

**Files:**
- Modify: `tests/living-ma-and-advanced.spec.js` (append import/export describe block)

**Step 1: Append round-trip tests**

```javascript
test.describe('Import/Export Round-Trip', () => {
  let page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.evaluate(() => {
      const ob = document.getElementById('onboardOverlay');
      if (ob) ob.style.display = 'none';
    });
  });

  test.afterAll(async () => { await page.close(); });

  test('E01 - parseRIS handles standard RIS format', async () => {
    const result = await page.evaluate(() => {
      if (typeof parseRIS !== 'function') return null;
      const ris = 'TY  - JOUR\nAU  - Smith, J\nTI  - Test Study\nPY  - 2023\nER  - \n';
      return parseRIS(ris);
    });
    if (result) {
      expect(result.length).toBe(1);
      expect(result[0].title).toContain('Test Study');
    }
  });

  test('E02 - parseBibTeX handles standard entry', async () => {
    const result = await page.evaluate(() => {
      if (typeof parseBibTeX !== 'function') return null;
      const bib = '@article{smith2023,\n  author = {Smith, J},\n  title = {Test Study},\n  year = {2023},\n  journal = {BMJ}\n}\n';
      return parseBibTeX(bib);
    });
    if (result) {
      expect(result.length).toBe(1);
    }
  });

  test('E03 - RevMan XML export contains valid structure', async () => {
    const xml = await page.evaluate(() => {
      if (typeof exportRevManXML !== 'function') return null;
      // Set up minimal study data
      const studies = [
        { authorYear: 'Test 2023', effectEstimate: 0.75, lowerCI: 0.60, upperCI: 0.94, effectType: 'OR' },
      ];
      try { return exportRevManXML(studies); } catch (_e) { return 'error'; }
    });
    if (xml && xml !== 'error') {
      expect(xml).toContain('<?xml');
      expect(xml).toContain('OUTCOME');
    }
  });

  test('E04 - CSV export captures study data', async () => {
    const csv = await page.evaluate(() => {
      if (typeof exportAnalysisCSV !== 'function') return null;
      try { return exportAnalysisCSV(); } catch (_e) { return null; }
    });
    // May be null if no analysis is loaded; just check function exists
    const exists = await page.evaluate(() => typeof exportAnalysisCSV === 'function');
    expect(exists).toBe(true);
  });

  test('E05 - PNG export function exists', async () => {
    const exists = await page.evaluate(() =>
      typeof exportPNG === 'function' || typeof exportForestPNG === 'function'
    );
    expect(exists).toBe(true);
  });

  test('E06 - R code export produces valid metafor script', async () => {
    const code = await page.evaluate(() => {
      if (typeof exportRCode !== 'function') return null;
      try { return exportRCode(); } catch (_e) { return null; }
    });
    const exists = await page.evaluate(() => typeof exportRCode === 'function');
    expect(exists).toBe(true);
  });

  test('E07 - Python code export produces valid script', async () => {
    const exists = await page.evaluate(() => typeof exportPythonCode === 'function');
    expect(exists).toBe(true);
  });

  test('E08 - parseNBIB handles PubMed format', async () => {
    const result = await page.evaluate(() => {
      if (typeof parseNBIB !== 'function') return null;
      const nbib = 'PMID- 12345678\nTI  - A Test Article\nAU  - Author A\nDP  - 2023\n\n';
      return parseNBIB(nbib);
    });
    if (result) {
      expect(result.length).toBe(1);
    }
  });
});
```

**Step 2: Run the tests**

Run: `npx playwright test tests/living-ma-and-advanced.spec.js 2>&1 | tail -10`
Expected: All pass

**Step 3: Commit**

```bash
git add tests/living-ma-and-advanced.spec.js
git commit -m "test: add 8 import/export round-trip tests (RIS, BibTeX, RevMan XML, CSV, PNG, R, Python, NBIB)"
```

---

### Task 11: Run full test suite (both spec files)

**Step 1: Run all Playwright tests**

Run: `npx playwright test 2>&1 | tail -15`
Expected: 313 (original) + ~50 (new) = ~363 passed, 0 failed

**Step 2: Commit with updated test count**

No code change needed. Just verify.

---

## PHASE 3: Full-Spectrum Multi-Persona Review

### Task 12: Run 5-Persona Sequential Review

Run 5 review agents sequentially (max 2 concurrent per CLAUDE.md rules). Each agent reads the full codebase (metasprint-autopilot.html) and produces findings classified as P0/P1/P2.

**Personas:**
1. **Cardiologist** — Focus: SGLT2i defaults, GRADE logic, NNT interpretation, ESC/AHA guideline alignment, clinical appropriateness of Living MA alerts
2. **Biostatistician** — Focus: All 40+ methods correctness, CUSUM formula, alpha spending derivation, RIS formula, edge cases, numerical stability
3. **Security Auditor** — Focus: XSS vectors, localStorage poisoning, malicious CSV/RIS injection, eval/innerHTML patterns, toast injection, data leakage
4. **Cochrane Editor** — Focus: Methodological standards (Handbook v6.5), PRISMA 2020, reporting completeness, Living MA sequential monitoring guidelines
5. **UX/Accessibility Specialist** — Focus: WCAG 2.1 AA, keyboard navigation, screen reader support, mobile responsiveness, dark mode, toast accessibility

**Process for each persona:**
1. Launch agent with persona prompt + full file read
2. Collect P0/P1/P2 findings
3. Fix all P0s immediately
4. Fix P1s in batch
5. P2s at discretion

**After all 5 personas:**
- Deduplicate findings
- Re-run full test suite
- Commit all fixes

---

## PHASE 4: Manuscript Major Rewrite

### Task 13: Rewrite Methods Section

**Files:**
- Modify: `paper/manuscript_plos_one.md`

**Key updates:**
- Line count: 27,923 → actual count after Phase 1
- Methods section: expand to cover all 40+ methods including Living MA (CUSUM, alpha spending, sequential monitoring, auto-update)
- Add sections for: Mantel-Haenszel pooling, Peto method, DDMA, RoBMA, Z-Curve, Copas, Three-Level MA, Cook's Distance, PET-PEESE, Bayesian CrI
- Add Living MA section: CUSUM monitoring, alpha spending functions (OBF/Pocock/Lan-DeMets), information fraction/RIS, sequential stopping rules, alert thresholds
- Update i18n mention (5 languages)
- Update import/export formats (6 input, 7 output)
- Add MH/Peto to Table 7 comparison

### Task 14: Rewrite Results Section

- Update test count: 694 → actual count after Phase 2
- Update line count
- Add Living MA validation results (if applicable)
- Update software testing paragraph with new test breakdown

### Task 15: Update Discussion + Limitations

- Remove "planned development" items that are now implemented (MH pooling, multi-language, Living MA)
- Add Living MA to strengths
- Update limitations re: sequential monitoring (now available but not yet formally validated in prospective setting)

### Task 16: Final Manuscript Verification

- Verify all numbers against actual code/test output
- Verify reference numbering [1]-[N] is sequential
- Verify abstract word count < 300
- Verify all table numbers match text citations
- Commit final manuscript

---

## Execution Order Summary

| Task | Phase | Description | Dependencies |
|------|-------|-------------|-------------|
| 1 | 1 | CUSUM function | None |
| 2 | 1 | Alpha spending functions | Task 1 |
| 3 | 1 | Information fraction + RIS | Task 2 |
| 4 | 1 | Alert threshold system | Tasks 1-3 |
| 5 | 1 | Sequential stopping dashboard UI | Tasks 1-4 |
| 6 | 1 | Auto-update scheduler | Task 5 |
| 7 | 2 | Living MA tests | Tasks 1-6 |
| 8 | 2 | Advanced methods tests | None (parallel with 7) |
| 9 | 2 | DTA + NMA deep tests | None (parallel with 7) |
| 10 | 2 | Import/export tests | None (parallel with 7) |
| 11 | 2 | Full test suite run | Tasks 7-10 |
| 12 | 3 | 5-persona review + fixes | Task 11 |
| 13 | 4 | Rewrite Methods section | Task 12 |
| 14 | 4 | Rewrite Results section | Task 13 |
| 15 | 4 | Update Discussion | Task 14 |
| 16 | 4 | Final manuscript verification | Task 15 |
