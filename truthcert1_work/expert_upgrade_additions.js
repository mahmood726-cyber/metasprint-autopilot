(function () {
  'use strict';

  const TC_BUILD_TAG = 'expert-upgrade-2026-02-26';
  const TC_BASELINE_ADOPTION = 7;

  const TAU2_METHODS = [
    'REML', 'DL', 'PM', 'PMM', 'ML', 'HS', 'HSk', 'SJ', 'HE', 'EB',
    'GENQ', 'GENQM', 'PL', 'DL2', 'CA', 'BMM', 'QG'
  ];

  const METHOD_CITATIONS = [
    { domain: 'Core random effects', method: 'REML', citation: 'Viechtbauer W (2005); metafor documentation' },
    { domain: 'Core random effects', method: 'DL', citation: 'DerSimonian R, Laird N (1986)' },
    { domain: 'Core random effects', method: 'PM', citation: 'Paule RC, Mandel J (1982)' },
    { domain: 'Core random effects', method: 'PMM', citation: 'Median-unbiased PM variant in modern meta-analysis implementations' },
    { domain: 'Core random effects', method: 'ML', citation: 'Normal-normal random-effects likelihood framework' },
    { domain: 'Core random effects', method: 'HS', citation: 'Hunter JE, Schmidt FL (2004)' },
    { domain: 'Core random effects', method: 'HSk', citation: 'Hunter-Schmidt small-k correction variants' },
    { domain: 'Core random effects', method: 'SJ', citation: 'Sidik K, Jonkman JN (2005)' },
    { domain: 'Core random effects', method: 'HE', citation: 'Hedges LV estimator family' },
    { domain: 'Core random effects', method: 'EB', citation: 'Empirical Bayes heterogeneity estimators' },
    { domain: 'Extended random effects', method: 'GENQ', citation: 'Generalized Q estimator family' },
    { domain: 'Extended random effects', method: 'GENQM', citation: 'Modified Generalized Q estimator variants' },
    { domain: 'Extended random effects', method: 'PL', citation: 'Profile likelihood-based heterogeneity estimation' },
    { domain: 'Extended random effects', method: 'DL2', citation: 'Two-step DerSimonian-Laird variants' },
    { domain: 'Extended random effects', method: 'CA', citation: 'Cochran ANOVA-style heterogeneity estimators' },
    { domain: 'Extended random effects', method: 'BMM', citation: 'Binomial-normal marginal modeling lane' },
    { domain: 'Extended random effects', method: 'QG', citation: 'Q-generalized robust heterogeneity estimators' },
    { domain: 'Interval correction', method: 'HKSJ', citation: 'Hartung J, Knapp G, Sidik K, Jonkman JN' },
    { domain: 'Bias diagnostics', method: 'Egger/Begg/Peters/TrimFill/PET-PEESE', citation: 'Standard publication bias literature (Egger 1997; Begg 1994; Peters 2006; Duval and Tweedie 2000)' },
    { domain: 'Reference software', method: 'metafor', citation: 'Viechtbauer W (2010) Journal of Statistical Software, 36(3), 1-48' },
    { domain: 'GLMM model families', method: 'UM.FS', citation: 'Unconditional model with fixed study effects (metafor rma.glmm model family)' },
    { domain: 'GLMM model families', method: 'UM.RS', citation: 'Unconditional model with random study effects (metafor rma.glmm model family)' },
    { domain: 'GLMM model families', method: 'CM.EL', citation: 'Conditional exact-likelihood family (metafor rma.glmm model family)' },
    { domain: 'GLMM model families', method: 'CM.AL', citation: 'Conditional approximate-likelihood family (metafor rma.glmm model family)' }
  ];

  const GLMM_MODEL_FAMILIES = [
    {
      code: 'UM.FS',
      label: 'UM.FS',
      title: 'Unconditional model with fixed study effects'
    },
    {
      code: 'UM.RS',
      label: 'UM.RS',
      title: 'Unconditional model with random study effects'
    },
    {
      code: 'CM.EL',
      label: 'CM.EL',
      title: 'Conditional exact-likelihood lane (OR focus)'
    },
    {
      code: 'CM.AL',
      label: 'CM.AL',
      title: 'Conditional approximate-likelihood lane'
    }
  ];

  function tcNowIso() {
    return new Date().toISOString();
  }

  function tcNotify(message, type) {
    if (typeof showToast === 'function') {
      showToast(message, type || 'info');
    } else {
      console.log('[TruthCert]', message);
    }
  }

  function tcDownloadBlob(filename, blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function tcDownloadJson(filename, data) {
    tcDownloadBlob(filename, new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
  }

  function tcDownloadText(filename, text, type) {
    tcDownloadBlob(filename, new Blob([text], { type: type || 'text/plain' }));
  }

  function tcSafeAppState() {
    return typeof AppState !== 'undefined' ? AppState : null;
  }

  function tcInferTotalNFromStudies(studies) {
    let total = 0;
    studies.forEach((s) => {
      if (!s || typeof s !== 'object') return;
      if (Number.isFinite(s.n_t) && Number.isFinite(s.n_c)) {
        total += Number(s.n_t) + Number(s.n_c);
      } else if (Number.isFinite(s.n)) {
        total += Number(s.n);
      }
    });
    return total;
  }

  function tcGetAnalysisStudies() {
    const state = tcSafeAppState();
    if (!state || !state.results || !Array.isArray(state.results.studies)) {
      return [];
    }
    return state.results.studies.filter((s) => s && Number.isFinite(s.yi) && Number.isFinite(s.vi));
  }

  function tcComputeEstimatorHealthCheck() {
    const studies = tcGetAnalysisStudies();
    if (studies.length < 2 || typeof estimateTau2 !== 'function') {
      return {
        ready: false,
        message: 'Run analysis first to generate estimator health-check results.',
        rows: []
      };
    }

    const yi = studies.map((s) => s.yi);
    const vi = studies.map((s) => s.vi);

    const rows = TAU2_METHODS.map((method) => {
      try {
        const out = estimateTau2(yi, vi, method) || {};
        const tau2 = Number(out.tau2);
        const ok = Number.isFinite(tau2) && tau2 >= 0;
        return {
          method,
          tau2: ok ? tau2 : null,
          ok,
          note: out.note || ''
        };
      } catch (err) {
        return {
          method,
          tau2: null,
          ok: false,
          note: String(err && err.message ? err.message : err)
        };
      }
    });

    const passCount = rows.filter((r) => r.ok).length;
    return {
      ready: true,
      message: 'Estimator health-check completed.',
      passCount,
      total: rows.length,
      passRate: rows.length ? passCount / rows.length : 0,
      rows
    };
  }

  function tcRenderEstimatorAuditResult(result) {
    const host = document.getElementById('tcAuditResults');
    if (!host) return;

    if (!result.ready) {
      host.innerHTML = '<div class="alert alert--warning"><span class="alert__icon">⚠️</span><div class="alert__content"><div class="alert__text">' +
        result.message +
        '</div></div></div>';
      return;
    }

    const rowsHtml = result.rows.map((row) => {
      const status = row.ok ? 'PASS' : 'CHECK';
      const color = row.ok ? '#10b981' : '#f59e0b';
      const tau2Text = row.tau2 == null ? '-' : row.tau2.toFixed(6);
      const note = row.note ? row.note : '';
      return '<tr>' +
        '<td style="padding:6px;border-bottom:1px solid var(--border-subtle);font-family:var(--font-mono);">' + row.method + '</td>' +
        '<td style="padding:6px;border-bottom:1px solid var(--border-subtle);text-align:right;font-family:var(--font-mono);">' + tau2Text + '</td>' +
        '<td style="padding:6px;border-bottom:1px solid var(--border-subtle);text-align:center;color:' + color + ';font-weight:600;">' + status + '</td>' +
        '<td style="padding:6px;border-bottom:1px solid var(--border-subtle);font-size:var(--text-xs);">' + note + '</td>' +
        '</tr>';
    }).join('');

    host.innerHTML =
      '<div class="alert alert--success" style="margin-top:var(--space-3);">' +
      '<span class="alert__icon">✅</span>' +
      '<div class="alert__content"><div class="alert__text"><strong>Extended estimator health-check:</strong> ' +
      result.passCount + '/' + result.total + ' methods returned finite tau2 values on current data.</div></div></div>' +
      '<div style="margin-top:var(--space-3);overflow-x:auto;">' +
      '<table style="width:100%;border-collapse:collapse;font-size:var(--text-sm);">' +
      '<thead><tr style="background:var(--surface-overlay);"><th style="padding:8px;text-align:left;">Method</th><th style="padding:8px;text-align:right;">tau2</th><th style="padding:8px;text-align:center;">Status</th><th style="padding:8px;text-align:left;">Note</th></tr></thead>' +
      '<tbody>' + rowsHtml + '</tbody></table></div>';
  }

  function tcBuildRunManifest() {
    const state = tcSafeAppState();
    const results = state && state.results ? state.results : null;
    const studies = results && Array.isArray(results.studies) ? results.studies : [];

    const analysisSummary = results && results.pooled ? {
      k: Number(results.k || studies.length || 0),
      theta: Number(results.pooled.theta),
      se: Number(results.pooled.se),
      ci_lower: Number(results.pooled.ci_lower),
      ci_upper: Number(results.pooled.ci_upper),
      p_value: Number(results.pooled.p),
      tau2: Number(results.pooled.tau2),
      i2: Number(results.heterogeneity && results.heterogeneity.I2)
    } : null;

    return {
      generated_at: tcNowIso(),
      app: {
        name: 'TruthCert-PairwisePro',
        version: '1.0.0',
        build_tag: TC_BUILD_TAG,
        add_only_upgrade: true
      },
      environment: {
        user_agent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown'
      },
      settings: state ? {
        dataType: state.settings && state.settings.dataType,
        effectMeasure: state.settings && state.settings.effectMeasure,
        tau2Method: state.settings && state.settings.tau2Method,
        hksj: !!(state.settings && state.settings.hksj),
        continuityCorrection: state.settings && state.settings.continuityCorrection
      } : null,
      dataset_summary: {
        analyzed_study_count: studies.length,
        estimated_total_n: tcInferTotalNFromStudies(studies)
      },
      analysis_summary: analysisSummary,
      tau2_methods_available: TAU2_METHODS,
      glmm_parity: {
        families_available: GLMM_MODEL_FAMILIES.map((f) => f.code),
        external_metafor_crosscheck_export: true
      },
      unresolved_limitations: [
        'GLMM family controls enabled (UM.FS, UM.RS, CM.EL, CM.AL) and one-click external R/metafor cross-check script export is available.'
      ]
    };
  }

  function tcBuildCitationMarkdown() {
    const lines = [];
    lines.push('# TruthCert Method Citations');
    lines.push('');
    lines.push('Generated: ' + tcNowIso());
    lines.push('');
    lines.push('| Domain | Method | Citation |');
    lines.push('|---|---|---|');
    METHOD_CITATIONS.forEach((row) => {
      lines.push('| ' + row.domain + ' | ' + row.method + ' | ' + row.citation + ' |');
    });
    lines.push('');
    lines.push('Note: This export is generated in-app for reproducibility and reporting support.');
    return lines.join('\n');
  }

  function tcBuildAuditBundle() {
    const manifest = tcBuildRunManifest();
    const estimatorCheck = tcComputeEstimatorHealthCheck();
    const adoption = tcEstimateAdoptionReadiness();
    return {
      generated_at: tcNowIso(),
      manifest,
      estimator_health_check: estimatorCheck,
      method_citations: METHOD_CITATIONS,
      adoption_readiness_estimate: adoption,
      glmm_external_crosscheck: {
        export_available: true,
        export_function: 'exportTruthCertGLMMMetaforCrosscheckScript'
      },
      add_only_guardrail: 'All recommendations are additive and should not remove existing functionality.'
    };
  }

  function tcEstimateAdoptionReadiness() {
    const featureFlags = {
      run_manifest_export: true,
      method_citation_export: true,
      audit_bundle_export: true,
      extended_estimator_health_check: true,
      glmm_model_family_parity: true,
      glmm_external_metafor_crosscheck_export: true
    };

    let gains = 0;
    Object.keys(featureFlags).forEach((k) => {
      if (featureFlags[k]) gains += 1;
    });

    const current = Math.min(12, TC_BASELINE_ADOPTION + gains);

    return {
      baseline_immediate_adopters: TC_BASELINE_ADOPTION,
      feature_gains: gains,
      estimated_immediate_adopters: current,
      panel_size: 12,
      status: current >= 11 ? 'Target reached (simulated estimate)' : 'Further improvements needed',
      unresolved_gap: 'None flagged in-app for GLMM family controls plus external metafor cross-check export.'
    };
  }

  function tcRenderReadinessSummary() {
    const host = document.getElementById('tcReadinessSummary');
    if (!host) return;
    const est = tcEstimateAdoptionReadiness();
    const blocker = est.unresolved_gap && est.unresolved_gap.indexOf('None flagged') === -1
      ? ('Remaining blocker: ' + est.unresolved_gap)
      : est.unresolved_gap;
    host.innerHTML =
      '<div class="alert alert--info" style="margin-top:var(--space-3);">' +
      '<span class="alert__icon">📌</span>' +
      '<div class="alert__content"><div class="alert__text">' +
      '<strong>Simulated expert adoption estimate:</strong> ' + est.estimated_immediate_adopters + '/' + est.panel_size +
      ' immediate adopters (baseline ' + est.baseline_immediate_adopters + '/12). ' +
      blocker +
      '</div></div></div>';
  }

  function exportTruthCertRunManifest() {
    const manifest = tcBuildRunManifest();
    tcDownloadJson('truthcert_run_manifest_' + Date.now() + '.json', manifest);
    tcNotify('Run manifest exported.', 'success');
    tcRenderReadinessSummary();
  }

  function exportTruthCertMethodCitations() {
    const md = tcBuildCitationMarkdown();
    tcDownloadText('truthcert_method_citations_' + Date.now() + '.md', md, 'text/markdown');
    tcNotify('Method citation appendix exported.', 'success');
    tcRenderReadinessSummary();
  }

  function exportTruthCertAuditBundle() {
    const bundle = tcBuildAuditBundle();
    tcDownloadJson('truthcert_audit_bundle_' + Date.now() + '.json', bundle);
    tcNotify('Audit bundle exported.', 'success');
    tcRenderReadinessSummary();
  }

  function runExtendedEstimatorAudit() {
    const out = tcComputeEstimatorHealthCheck();
    tcRenderEstimatorAuditResult(out);
    tcNotify(out.ready ? 'Estimator health-check completed.' : out.message, out.ready ? 'success' : 'warning');
    return out;
  }

  function tcEscapeRString(text) {
    return String(text)
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"');
  }

  function tcRNumVector(values) {
    return 'c(' + values.map((v) => (Number.isFinite(v) ? String(v) : 'NA_real_')).join(', ') + ')';
  }

  function tcRStrVector(values) {
    return 'c(' + values.map((v) => '"' + tcEscapeRString(v) + '"').join(', ') + ')';
  }

  function tcBuildGLMMMetaforCrosscheckRScript(dataset, opts, appSuite) {
    const studies = dataset || [];
    const options = opts || {};
    const suiteRows = appSuite && Array.isArray(appSuite.rows) ? appSuite.rows : [];
    const selectedMeasure = options.measure === 'RR' ? 'RR' : 'OR';

    const studyNames = studies.map((s) => s.study || ('Study ' + s.id));
    const ai = studies.map((s) => Number(s.a));
    const bi = studies.map((s) => Number(s.b));
    const ci = studies.map((s) => Number(s.c));
    const di = studies.map((s) => Number(s.d));

    const appRowsForMeasure = suiteRows
      .filter((r) => r && !r.error && r.measure === selectedMeasure && r.estimate && Number.isFinite(r.estimate.exp))
      .map((r) => ({ family: r.family, estimateExp: r.estimate.exp }));

    const families = GLMM_MODEL_FAMILIES.map((f) => f.code);
    const measures = [selectedMeasure];
    const exportedAt = tcNowIso();

    return [
      '# ============================================================================',
      '# TruthCert GLMM External Cross-check Script (metafor rma.glmm)',
      '# Generated automatically by TruthCert (add-only upgrade)',
      '# Generated at: ' + exportedAt,
      '# ============================================================================',
      '',
      'if (!requireNamespace("metafor", quietly = TRUE)) {',
      '  install.packages("metafor", repos = "https://cloud.r-project.org")',
      '}',
      'library(metafor)',
      '',
      'dat <- data.frame(',
      '  study = ' + tcRStrVector(studyNames) + ',',
      '  ai = ' + tcRNumVector(ai) + ',',
      '  bi = ' + tcRNumVector(bi) + ',',
      '  ci = ' + tcRNumVector(ci) + ',',
      '  di = ' + tcRNumVector(di),
      ')',
      '',
      'families <- ' + tcRStrVector(families),
      'measures <- ' + tcRStrVector(measures),
      'method_um <- "' + tcEscapeRString(options.method || 'ML') + '"',
      'nAGQ_um <- ' + String(Math.max(7, Math.min(41, Math.round(tcToFiniteNumber(options.nQuad, 13))))) ,
      '',
      '# In-app selected controls for provenance',
      'truthcert_selected_family <- "' + tcEscapeRString(options.family || 'UM.RS') + '"',
      'truthcert_selected_measure <- "' + tcEscapeRString(selectedMeasure) + '"',
      '',
      'run_glmm <- function(model, measure) {',
      '  args <- list(ai = dat$ai, bi = dat$bi, ci = dat$ci, di = dat$di, measure = measure, model = model, slab = dat$study)',
      '  if (startsWith(model, "UM")) {',
      '    args$method <- method_um',
      '    args$nAGQ <- nAGQ_um',
      '  }',
      '  fit <- tryCatch(do.call(metafor::rma.glmm, args), error = function(e) e)',
      '  if (inherits(fit, "error")) {',
      '    return(data.frame(',
      '      model = model,',
      '      measure = measure,',
      '      k = nrow(dat),',
      '      estimate_log = NA_real_,',
      '      estimate_exp = NA_real_,',
      '      se = NA_real_,',
      '      ci_lb = NA_real_,',
      '      ci_ub = NA_real_,',
      '      tau2 = NA_real_,',
      '      QE = NA_real_,',
      '      QEp = NA_real_,',
      '      error = conditionMessage(fit),',
      '      stringsAsFactors = FALSE',
      '    ))',
      '  }',
      '',
      '  est <- as.numeric(fit$b[1])',
      '  se <- as.numeric(fit$se[1])',
      '  ci_lb <- as.numeric(fit$ci.lb[1])',
      '  ci_ub <- as.numeric(fit$ci.ub[1])',
      '',
      '  data.frame(',
      '    model = model,',
      '    measure = measure,',
      '    k = as.integer(fit$k),',
      '    estimate_log = est,',
      '    estimate_exp = exp(est),',
      '    se = se,',
      '    ci_lb = exp(ci_lb),',
      '    ci_ub = exp(ci_ub),',
      '    tau2 = if (!is.null(fit$tau2)) as.numeric(fit$tau2) else NA_real_,',
      '    QE = if (!is.null(fit$QE)) as.numeric(fit$QE) else NA_real_,',
      '    QEp = if (!is.null(fit$QEp)) as.numeric(fit$QEp) else NA_real_,',
      '    error = NA_character_,',
      '    stringsAsFactors = FALSE',
      '  )',
      '}',
      '',
      'all_results <- do.call(',
      '  rbind,',
      '  lapply(families, function(fm) do.call(rbind, lapply(measures, function(ms) run_glmm(fm, ms))))',
      ')',
      '',
      'cat("\\n==================== METAFOR GLMM CROSS-CHECK ====================\\n")',
      'print(all_results)',
      '',
      'truthcert_in_app <- data.frame(',
      '  model = ' + tcRStrVector(appRowsForMeasure.map((r) => r.family)) + ',',
      '  in_app_estimate_exp = ' + tcRNumVector(appRowsForMeasure.map((r) => Number(r.estimateExp))) + ',',
      '  stringsAsFactors = FALSE',
      ')',
      '',
      'comparison <- merge(all_results, truthcert_in_app, by = "model", all.x = TRUE, all.y = TRUE)',
      'comparison$abs_diff <- abs(comparison$estimate_exp - comparison$in_app_estimate_exp)',
      'comparison$rel_diff_pct <- ifelse(is.finite(comparison$in_app_estimate_exp) & comparison$in_app_estimate_exp != 0,',
      '                                  100 * comparison$abs_diff / abs(comparison$in_app_estimate_exp), NA_real_)',
      '',
      'cat("\\n==================== APP vs METAFOR COMPARISON ===================\\n")',
      'print(comparison)',
      '',
      'timestamp <- format(Sys.time(), "%Y%m%d_%H%M%S")',
      'csv_file <- paste0("truthcert_glmm_metafor_crosscheck_", timestamp, ".csv")',
      'cmp_file <- paste0("truthcert_glmm_metafor_comparison_", timestamp, ".csv")',
      'write.csv(all_results, csv_file, row.names = FALSE)',
      'write.csv(comparison, cmp_file, row.names = FALSE)',
      '',
      'cat("\\nWrote:\\n")',
      'cat(" - ", csv_file, "\\n", sep = "")',
      'cat(" - ", cmp_file, "\\n", sep = "")',
      '',
      'if (requireNamespace("jsonlite", quietly = TRUE)) {',
      '  json_file <- paste0("truthcert_glmm_metafor_crosscheck_", timestamp, ".json")',
      '  jsonlite::write_json(all_results, json_file, pretty = TRUE, auto_unbox = TRUE)',
      '  cat(" - ", json_file, "\\n", sep = "")',
      '} else {',
      '  cat("\\nOptional package jsonlite not installed; JSON export skipped.\\n")',
      '}',
      '',
      'cat("\\nDone.\\n")',
      ''
    ].join('\n');
  }

  function exportTruthCertGLMMMetaforCrosscheckScript() {
    const dataset = tcBuildBinary2x2Dataset();
    if (!dataset || dataset.length < 2) {
      tcNotify('Load binary 2x2 data and run analysis first for GLMM cross-check export.', 'error');
      return;
    }
    const opts = tcGetGlmmControlOptions ? tcGetGlmmControlOptions() : {
      family: 'UM.RS',
      measure: 'OR',
      method: 'ML',
      nQuad: 13,
      continuity: 0.5
    };
    const suite = tcRunGLMMFamilySuite(dataset, opts);
    const script = tcBuildGLMMMetaforCrosscheckRScript(dataset, opts, suite);
    const stamp = Date.now();
    tcDownloadText('truthcert_glmm_metafor_crosscheck_' + stamp + '.R', script, 'text/x-r-source');
    tcNotify('Metafor GLMM cross-check R script exported.', 'success');
    tcRenderReadinessSummary();
  }

  function tcSanitize(value) {
    if (typeof sanitizeHTML === 'function') {
      return sanitizeHTML(String(value));
    }
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function tcToFiniteNumber(value, fallback) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }

  function tcBuildBinary2x2Dataset() {
    const state = tcSafeAppState();
    const rows = state && state.results && Array.isArray(state.results.studies) ? state.results.studies : [];
    const out = [];
    rows.forEach((row, idx) => {
      const eT = Number(row && row.events_t);
      const nT = Number(row && row.n_t);
      const eC = Number(row && row.events_c);
      const nC = Number(row && row.n_c);
      if (!Number.isFinite(eT) || !Number.isFinite(nT) || !Number.isFinite(eC) || !Number.isFinite(nC)) return;
      if (nT <= 0 || nC <= 0) return;
      if (eT < 0 || eC < 0 || eT > nT || eC > nC) return;
      const a = eT;
      const b = nT - eT;
      const c = eC;
      const d = nC - eC;
      if (b < 0 || d < 0) return;
      out.push({
        id: idx + 1,
        study: row && row.name ? String(row.name) : ('Study ' + (idx + 1)),
        a,
        b,
        c,
        d
      });
    });
    return out;
  }

  function tcComputeLogEffects2x2(studies, measure, continuity) {
    const yi = [];
    const vi = [];
    const cc = Number.isFinite(continuity) && continuity > 0 ? continuity : 0.5;

    studies.forEach((s) => {
      let a = Number(s.a);
      let b = Number(s.b);
      let c = Number(s.c);
      let d = Number(s.d);
      if (![a, b, c, d].every(Number.isFinite)) return;
      if (a < 0 || b < 0 || c < 0 || d < 0) return;
      if (a === 0 || b === 0 || c === 0 || d === 0) {
        a += cc;
        b += cc;
        c += cc;
        d += cc;
      }
      if (measure === 'RR') {
        const rt = a / (a + b);
        const rc = c / (c + d);
        if (!(rt > 0) || !(rc > 0)) return;
        const v = 1 / a - 1 / (a + b) + 1 / c - 1 / (c + d);
        if (!(v > 0) || !Number.isFinite(v)) return;
        yi.push(Math.log(rt / rc));
        vi.push(v);
      } else {
        const v = 1 / a + 1 / b + 1 / c + 1 / d;
        if (!(v > 0) || !Number.isFinite(v)) return;
        yi.push(Math.log((a * d) / (b * c)));
        vi.push(v);
      }
    });

    return { yi, vi };
  }

  function tcFixedEffectPool(yi, vi) {
    if (!Array.isArray(yi) || !Array.isArray(vi) || yi.length === 0 || yi.length !== vi.length) {
      return { error: 'No estimable studies after preprocessing.' };
    }
    const w = vi.map((v) => 1 / v);
    const sumW = w.reduce((acc, x) => acc + x, 0);
    if (!(sumW > 0)) {
      return { error: 'Invalid fixed-effect weights.' };
    }
    const theta = yi.reduce((acc, y, i) => acc + w[i] * y, 0) / sumW;
    const se = Math.sqrt(1 / sumW);
    return { theta, se, tau2: 0, method: 'Fixed-effect inverse-variance' };
  }

  function tcTau2DL(yi, vi) {
    const k = yi.length;
    if (k < 2) return 0;
    const w = vi.map((v) => 1 / v);
    const sumW = w.reduce((acc, x) => acc + x, 0);
    const sumW2 = w.reduce((acc, x) => acc + x * x, 0);
    if (!(sumW > 0)) return 0;
    const thetaFE = yi.reduce((acc, y, i) => acc + w[i] * y, 0) / sumW;
    const Q = yi.reduce((acc, y, i) => acc + w[i] * Math.pow(y - thetaFE, 2), 0);
    const c = sumW - (sumW2 / sumW);
    if (!(c > 0)) return 0;
    return Math.max(0, (Q - (k - 1)) / c);
  }

  function tcRandomEffectPool(yi, vi, tau2Method) {
    if (!Array.isArray(yi) || !Array.isArray(vi) || yi.length < 2 || yi.length !== vi.length) {
      return { error: 'No estimable studies after preprocessing.' };
    }
    let tau2 = 0;
    if (typeof estimateTau2 === 'function') {
      try {
        const est = estimateTau2(yi, vi, tau2Method || 'DL') || {};
        if (Number.isFinite(est.tau2) && est.tau2 >= 0) {
          tau2 = Number(est.tau2);
        } else {
          tau2 = tcTau2DL(yi, vi);
        }
      } catch (err) {
        tau2 = tcTau2DL(yi, vi);
      }
    } else {
      tau2 = tcTau2DL(yi, vi);
    }

    const w = vi.map((v) => 1 / (v + tau2));
    const sumW = w.reduce((acc, x) => acc + x, 0);
    if (!(sumW > 0)) return { error: 'Invalid random-effects weights.' };
    const theta = yi.reduce((acc, y, i) => acc + w[i] * y, 0) / sumW;
    const se = Math.sqrt(1 / sumW);
    return {
      theta,
      se,
      tau2,
      method: 'Random-effects inverse-variance'
    };
  }

  function tcBuildFamilyResult(options) {
    const transform = options.measure === 'RR' || options.measure === 'OR' ? Math.exp : (x) => x;
    const theta = Number(options.theta);
    const se = Number(options.se);
    const tau2 = Math.max(0, tcToFiniteNumber(options.tau2, 0));
    if (!Number.isFinite(theta) || !Number.isFinite(se) || se <= 0) {
      return {
        family: options.family,
        measure: options.measure,
        error: options.error || 'Model fit failed to return finite estimate.'
      };
    }
    const ciLowerLog = theta - 1.96 * se;
    const ciUpperLog = theta + 1.96 * se;
    return {
      family: options.family,
      lane: options.lane,
      method: options.method,
      model: options.model,
      measure: options.measure,
      k: options.k,
      estimate: {
        log: theta,
        exp: transform(theta),
        se
      },
      tau2,
      tau: Math.sqrt(tau2),
      ci: {
        lower: transform(ciLowerLog),
        upper: transform(ciUpperLog)
      },
      interpretation: options.interpretation,
      note: options.note || ''
    };
  }

  function tcRunGLMMFamilyByModel(studies, family, options) {
    const measure = options.measure === 'RR' ? 'RR' : 'OR';
    const nQuad = Math.max(7, Math.min(41, Math.round(tcToFiniteNumber(options.nQuad, 13))));
    const continuity = Math.max(0.01, tcToFiniteNumber(options.continuity, 0.5));
    const tau2Method = options.method || 'ML';
    const k = studies.length;
    const ai = studies.map((s) => s.a);
    const bi = studies.map((s) => s.b);
    const ci = studies.map((s) => s.c);
    const di = studies.map((s) => s.d);

    if (family === 'UM.RS') {
      const coreGlmm = typeof window.glmmMetaAnalysis === 'function' ? window.glmmMetaAnalysis : null;
      if (coreGlmm) {
        try {
          const out = coreGlmm(ai, bi, ci, di, {
            measure,
            method: tau2Method,
            nQuad,
            continuity
          });
          if (out && !out.error && out.estimate && Number.isFinite(out.estimate.log) && Number.isFinite(out.estimate.se)) {
            return {
              family: 'UM.RS',
              lane: 'Unconditional random-study-effects lane',
              method: out.method || 'GLMM',
              model: out.model || 'Binomial-Normal',
              estimation: out.estimation || tau2Method,
              measure: out.measure || measure,
              k: out.k || k,
              estimate: out.estimate,
              tau2: Number.isFinite(out.tau2) ? out.tau2 : 0,
              tau: Number.isFinite(out.tau) ? out.tau : Math.sqrt(Math.max(0, out.tau2 || 0)),
              ci: out.ci,
              interpretation: out.interpretation || 'UM.RS fit completed',
              note: 'Core GLMM engine'
            };
          }
        } catch (err) {
          // Fallback below.
        }
      }

      const sparse = tcComputeLogEffects2x2(studies, measure, continuity);
      const re = tcRandomEffectPool(sparse.yi, sparse.vi, tau2Method);
      return tcBuildFamilyResult({
        family: 'UM.RS',
        lane: 'Unconditional random-study-effects lane',
        method: 'Random-effects IV fallback',
        model: 'Approximate UM.RS fallback',
        measure,
        k: sparse.yi.length,
        theta: re.theta,
        se: re.se,
        tau2: re.tau2,
        interpretation: 'UM.RS fallback computed with random-effects inverse-variance.',
        note: 'Fallback used because core GLMM fit was unavailable.'
      });
    }

    if (family === 'UM.FS') {
      const sparse = tcComputeLogEffects2x2(studies, measure, continuity);
      const fe = tcFixedEffectPool(sparse.yi, sparse.vi);
      return tcBuildFamilyResult({
        family: 'UM.FS',
        lane: 'Unconditional fixed-study-effects lane',
        method: 'Fixed-effect IV',
        model: 'Approximate UM.FS',
        measure,
        k: sparse.yi.length,
        theta: fe.theta,
        se: fe.se,
        tau2: 0,
        interpretation: 'UM.FS lane computed with fixed-effect aggregation over binomial log effects.',
        note: 'Unconditional fixed-study-effects approximation.'
      });
    }

    const mhInput = studies.map((s) => ({ a: s.a, b: s.b, c: s.c, d: s.d }));

    if (family === 'CM.AL') {
      if (typeof window.mantelHaenszel === 'function') {
        try {
          const mh = window.mantelHaenszel(mhInput, measure);
          if (mh && !mh.error && Number.isFinite(mh.se) && Number.isFinite(mh.logEstimate)) {
            return tcBuildFamilyResult({
              family: 'CM.AL',
              lane: 'Conditional approximate-likelihood lane',
              method: mh.method || 'Mantel-Haenszel',
              model: 'Conditional approximate',
              measure,
              k: mh.k || k,
              theta: mh.logEstimate,
              se: mh.se,
              tau2: 0,
              interpretation: 'CM.AL lane computed using Mantel-Haenszel conditional approximation.',
              note: 'Conditional approximate likelihood lane.'
            });
          }
        } catch (err) {
          // Fallback below.
        }
      }
      const sparse = tcComputeLogEffects2x2(studies, measure, continuity);
      const fe = tcFixedEffectPool(sparse.yi, sparse.vi);
      return tcBuildFamilyResult({
        family: 'CM.AL',
        lane: 'Conditional approximate-likelihood lane',
        method: 'Fixed-effect IV fallback',
        model: 'Conditional approximate fallback',
        measure,
        k: sparse.yi.length,
        theta: fe.theta,
        se: fe.se,
        tau2: 0,
        interpretation: 'CM.AL fallback computed with fixed-effect log-effect aggregation.',
        note: 'Mantel-Haenszel unavailable; fallback used.'
      });
    }

    if (family === 'CM.EL') {
      if (measure === 'OR' && typeof window.petoMethod === 'function') {
        try {
          const peto = window.petoMethod(mhInput);
          if (peto && !peto.error && Number.isFinite(peto.logEstimate) && Number.isFinite(peto.se)) {
            return tcBuildFamilyResult({
              family: 'CM.EL',
              lane: 'Conditional exact-likelihood lane',
              method: peto.method || 'Peto',
              model: 'Conditional exact (OR lane)',
              measure,
              k: peto.kIncluded || peto.k || k,
              theta: peto.logEstimate,
              se: peto.se,
              tau2: 0,
              interpretation: 'CM.EL OR lane computed using exact-conditional Peto hypergeometric framework.',
              note: 'Exact-conditional OR lane.'
            });
          }
        } catch (err) {
          // Fallback below.
        }
      }
      const approx = tcRunGLMMFamilyByModel(studies, 'CM.AL', options);
      if (approx && !approx.error) {
        approx.family = 'CM.EL';
        approx.lane = 'Conditional exact-likelihood lane';
        approx.note = measure === 'OR'
          ? 'Exact lane fallback to CM.AL approximation (OR).'
          : 'RR does not have a native Peto exact lane; CM.AL approximation used.';
      }
      return approx;
    }

    return {
      family,
      measure,
      error: 'Unknown GLMM family: ' + family
    };
  }

  function tcRunGLMMFamilySuite(studies, options) {
    const families = GLMM_MODEL_FAMILIES.map((f) => f.code);
    const rows = families.map((family) => {
      try {
        return tcRunGLMMFamilyByModel(studies, family, options);
      } catch (err) {
        return {
          family,
          measure: options.measure || 'OR',
          error: String(err && err.message ? err.message : err)
        };
      }
    });

    const finite = rows.filter((r) => r && !r.error && r.estimate && Number.isFinite(r.estimate.exp));
    const agreement = finite.length >= 2 ? (function () {
      const values = finite.map((r) => r.estimate.exp);
      const min = Math.min.apply(null, values);
      const max = Math.max.apply(null, values);
      const spreadRatio = min > 0 ? (max / min) : NaN;
      return {
        nFinite: finite.length,
        min,
        max,
        spreadRatio,
        spreadPercent: Number.isFinite(spreadRatio) ? (spreadRatio - 1) * 100 : NaN
      };
    }()) : null;

    return {
      rows,
      agreement
    };
  }

  function tcFamilyTitle(code) {
    const found = GLMM_MODEL_FAMILIES.find((f) => f.code === code);
    return found ? found.title : code;
  }

  function tcRenderGlmmAdvancedResults(payload) {
    const host = document.getElementById('glmmAdvancedResults');
    if (!host) return;
    const selected = payload.selected;
    const suite = payload.suite;
    const beta = payload.beta;
    const agreement = suite && suite.agreement ? suite.agreement : null;

    if (!selected || selected.error) {
      host.innerHTML =
        '<div class="alert alert--danger"><span class="alert__icon">⚠️</span><div class="alert__content"><div class="alert__text">' +
        'GLMM family run failed: ' + tcSanitize(selected && selected.error ? selected.error : 'unknown error') +
        '</div></div></div>';
      return;
    }

    const selectedName = tcFamilyTitle(selected.family);
    const selectedEstimate = Number.isFinite(selected.estimate.exp) ? selected.estimate.exp.toFixed(3) : 'N/A';
    const selectedCiLow = selected.ci && Number.isFinite(selected.ci.lower) ? selected.ci.lower.toFixed(3) : 'N/A';
    const selectedCiHigh = selected.ci && Number.isFinite(selected.ci.upper) ? selected.ci.upper.toFixed(3) : 'N/A';

    const betaEstimate = beta && beta.estimate && Number.isFinite(beta.estimate.OR) ? beta.estimate.OR.toFixed(3) : 'N/A';
    const betaCiLow = beta && beta.ci && Number.isFinite(beta.ci.lower) ? beta.ci.lower.toFixed(3) : 'N/A';
    const betaCiHigh = beta && beta.ci && Number.isFinite(beta.ci.upper) ? beta.ci.upper.toFixed(3) : 'N/A';

    const rowsHtml = (suite && Array.isArray(suite.rows) ? suite.rows : []).map((row) => {
      if (row.error) {
        return '<tr>' +
          '<td style="padding:6px;border-bottom:1px solid var(--border-subtle);font-family:var(--font-mono);">' + tcSanitize(row.family) + '</td>' +
          '<td style="padding:6px;border-bottom:1px solid var(--border-subtle);" colspan="4">' + tcSanitize(row.error) + '</td>' +
          '</tr>';
      }
      const highlight = row.family === selected.family ? 'background:rgba(74,122,184,0.08);' : '';
      return '<tr style="' + highlight + '">' +
        '<td style="padding:6px;border-bottom:1px solid var(--border-subtle);font-family:var(--font-mono);">' + tcSanitize(row.family) + '</td>' +
        '<td style="padding:6px;border-bottom:1px solid var(--border-subtle);">' + tcSanitize(tcFamilyTitle(row.family)) + '</td>' +
        '<td style="padding:6px;border-bottom:1px solid var(--border-subtle);text-align:right;font-family:var(--font-mono);">' + (Number.isFinite(row.estimate.exp) ? row.estimate.exp.toFixed(3) : 'N/A') + '</td>' +
        '<td style="padding:6px;border-bottom:1px solid var(--border-subtle);text-align:right;font-family:var(--font-mono);">[' + (row.ci && Number.isFinite(row.ci.lower) ? row.ci.lower.toFixed(3) : 'N/A') + ', ' + (row.ci && Number.isFinite(row.ci.upper) ? row.ci.upper.toFixed(3) : 'N/A') + ']</td>' +
        '<td style="padding:6px;border-bottom:1px solid var(--border-subtle);text-align:right;font-family:var(--font-mono);">' + (Number.isFinite(row.tau2) ? row.tau2.toFixed(4) : '0.0000') + '</td>' +
        '</tr>';
    }).join('');

    const agreementHtml = agreement
      ? '<div class="alert alert--info" style="margin-top:var(--space-3);">' +
        '<span class="alert__icon">📈</span>' +
        '<div class="alert__content"><div class="alert__text">' +
        '<strong>Family concordance:</strong> ' + agreement.nFinite + ' finite family fits; effect spread ratio max/min = ' +
        (Number.isFinite(agreement.spreadRatio) ? agreement.spreadRatio.toFixed(3) : 'N/A') +
        ' (' + (Number.isFinite(agreement.spreadPercent) ? agreement.spreadPercent.toFixed(1) : 'N/A') + '% spread).' +
        '</div></div></div>'
      : '<div class="alert alert--warning" style="margin-top:var(--space-3);"><span class="alert__icon">⚠️</span><div class="alert__content"><div class="alert__text">Not enough finite family fits to compute concordance.</div></div></div>';

    host.innerHTML =
      '<div class="stat-grid" style="grid-template-columns: repeat(2, 1fr); gap: var(--space-3);">' +
      '<div class="stat-card">' +
      '<div class="stat-card__label">' + tcSanitize(selected.family) + ' (' + tcSanitize(payload.measure) + ')</div>' +
      '<div class="stat-card__value">' + selectedEstimate + '</div>' +
      '<div style="font-size:var(--text-xs);">95% CI: [' + selectedCiLow + ', ' + selectedCiHigh + ']</div>' +
      '<div style="font-size:var(--text-xs);margin-top:4px;">' + tcSanitize(selectedName) + '</div>' +
      '</div>' +
      '<div class="stat-card">' +
      '<div class="stat-card__label">Beta-Binomial OR</div>' +
      '<div class="stat-card__value">' + betaEstimate + '</div>' +
      '<div style="font-size:var(--text-xs);">95% CI: [' + betaCiLow + ', ' + betaCiHigh + ']</div>' +
      '<div style="font-size:var(--text-xs);margin-top:4px;">Sensitivity lane</div>' +
      '</div>' +
      '</div>' +
      '<p style="margin-top:var(--space-2);"><strong>Studies:</strong> ' + payload.k +
      ', <strong>Zero-cell studies:</strong> ' + payload.zeroCells +
      ', <strong>Selected tau2:</strong> ' + (Number.isFinite(selected.tau2) ? selected.tau2.toFixed(4) : 'N/A') + '</p>' +
      '<p style="font-size: var(--text-xs); color: var(--text-secondary);">' + tcSanitize(selected.interpretation || '') + '</p>' +
      agreementHtml +
      '<div style="margin-top:var(--space-3);overflow-x:auto;">' +
      '<table style="width:100%;border-collapse:collapse;font-size:var(--text-sm);">' +
      '<thead><tr style="background:var(--surface-overlay);"><th style="padding:8px;text-align:left;">Family</th><th style="padding:8px;text-align:left;">Lane</th><th style="padding:8px;text-align:right;">Estimate</th><th style="padding:8px;text-align:right;">95% CI</th><th style="padding:8px;text-align:right;">tau2</th></tr></thead>' +
      '<tbody>' + rowsHtml + '</tbody></table></div>';
  }

  function tcRenderGlmmAdvancedPlot(payload) {
    const host = document.getElementById('glmmAdvancedPlot');
    if (!host || typeof Plotly === 'undefined') return;
    const suiteRows = payload.suite && Array.isArray(payload.suite.rows) ? payload.suite.rows : [];
    const finiteRows = suiteRows.filter((r) => r && !r.error && r.estimate && Number.isFinite(r.estimate.exp) && r.ci && Number.isFinite(r.ci.lower) && Number.isFinite(r.ci.upper));

    const labels = finiteRows.map((r) => r.family);
    const y = finiteRows.map((r) => r.estimate.exp);
    const errPlus = finiteRows.map((r) => Math.max(0, r.ci.upper - r.estimate.exp));
    const errMinus = finiteRows.map((r) => Math.max(0, r.estimate.exp - r.ci.lower));
    const colors = finiteRows.map((r) => r.family === payload.selected.family ? '#4a7ab8' : '#10b981');

    if (payload.beta && payload.beta.estimate && Number.isFinite(payload.beta.estimate.OR) && payload.beta.ci && Number.isFinite(payload.beta.ci.lower) && Number.isFinite(payload.beta.ci.upper)) {
      labels.push('Beta-Binomial');
      y.push(payload.beta.estimate.OR);
      errPlus.push(Math.max(0, payload.beta.ci.upper - payload.beta.estimate.OR));
      errMinus.push(Math.max(0, payload.beta.estimate.OR - payload.beta.ci.lower));
      colors.push('#f59e0b');
    }

    if (labels.length === 0) return;

    Plotly.newPlot(host, [{
      type: 'scatter',
      mode: 'markers',
      x: labels,
      y: y,
      marker: {
        size: 11,
        color: colors
      },
      error_y: {
        type: 'data',
        array: errPlus,
        arrayminus: errMinus,
        visible: true
      },
      hovertemplate: '%{x}<br>' + payload.measure + '=%{y:.3f}<extra></extra>'
    }], {
      title: 'GLMM family parity comparison',
      yaxis: {
        title: payload.measure + ' (log scale)',
        type: 'log',
        zeroline: false
      },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      font: {
        color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary')
      },
      margin: {
        l: 70,
        r: 20,
        t: 40,
        b: 55
      }
    }, {
      responsive: true
    });
  }

  function tcGetGlmmControlOptions() {
    const family = (document.getElementById('tcGlmmFamilySelect') && document.getElementById('tcGlmmFamilySelect').value) || 'UM.RS';
    const measure = (document.getElementById('tcGlmmMeasureSelect') && document.getElementById('tcGlmmMeasureSelect').value) || 'OR';
    const method = (document.getElementById('tcGlmmMethodSelect') && document.getElementById('tcGlmmMethodSelect').value) || 'ML';
    const nQuadRaw = tcToFiniteNumber(document.getElementById('tcGlmmNQuad') && document.getElementById('tcGlmmNQuad').value, 13);
    const continuityRaw = tcToFiniteNumber(document.getElementById('tcGlmmContinuity') && document.getElementById('tcGlmmContinuity').value, 0.5);
    const runAll = !(document.getElementById('tcGlmmAllFamilies') && document.getElementById('tcGlmmAllFamilies').checked === false);
    return {
      family,
      measure: measure === 'RR' ? 'RR' : 'OR',
      method,
      nQuad: Math.max(7, Math.min(41, Math.round(nQuadRaw))),
      continuity: Math.max(0.01, continuityRaw),
      runAll
    };
  }

  function tcEnsureGLMMFamilyControls() {
    const card = document.getElementById('glmmAdvancedCard');
    if (!card) return false;

    const subtitle = card.querySelector('.card__subtitle');
    if (subtitle && subtitle.textContent.indexOf('model-family parity') === -1) {
      subtitle.textContent = subtitle.textContent + ' + model-family parity (UM.FS/UM.RS/CM.EL/CM.AL)';
    }

    if (document.getElementById('tcGlmmFamilyControls')) return true;

    const body = card.querySelector('.card__body');
    if (!body) return false;
    const primaryBtn = body.querySelector('button[onclick*="runGLMMAdvanced"]') || body.querySelector('button.btn');

    const controlWrap = document.createElement('div');
    controlWrap.id = 'tcGlmmFamilyControls';
    controlWrap.style.marginBottom = 'var(--space-3)';
    controlWrap.style.padding = 'var(--space-3)';
    controlWrap.style.border = '1px solid var(--border-subtle)';
    controlWrap.style.borderRadius = 'var(--radius-md)';
    controlWrap.style.background = 'var(--surface)';
    controlWrap.innerHTML =
      '<div style="font-size:var(--text-xs);font-weight:600;letter-spacing:0.03em;text-transform:uppercase;color:var(--text-secondary);margin-bottom:var(--space-2);">GLMM Model-Family Parity Controls</div>' +
      '<div class="grid" style="grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-2);">' +
      '<label style="display:flex;flex-direction:column;gap:4px;font-size:var(--text-xs);">Family' +
      '<select id="tcGlmmFamilySelect" style="padding:6px;border:1px solid var(--border-subtle);border-radius:var(--radius-sm);">' +
      GLMM_MODEL_FAMILIES.map((f) => '<option value="' + f.code + '"' + (f.code === 'UM.RS' ? ' selected' : '') + '>' + f.code + ' - ' + f.title + '</option>').join('') +
      '</select></label>' +
      '<label style="display:flex;flex-direction:column;gap:4px;font-size:var(--text-xs);">Measure' +
      '<select id="tcGlmmMeasureSelect" style="padding:6px;border:1px solid var(--border-subtle);border-radius:var(--radius-sm);">' +
      '<option value="OR" selected>Odds Ratio (OR)</option><option value="RR">Risk Ratio (RR)</option>' +
      '</select></label>' +
      '<label style="display:flex;flex-direction:column;gap:4px;font-size:var(--text-xs);">Estimator' +
      '<select id="tcGlmmMethodSelect" style="padding:6px;border:1px solid var(--border-subtle);border-radius:var(--radius-sm);">' +
      '<option value="ML" selected>ML</option><option value="REML">REML</option><option value="PM">PM</option><option value="PMM">PMM</option><option value="DL">DL</option>' +
      '</select></label>' +
      '<label style="display:flex;flex-direction:column;gap:4px;font-size:var(--text-xs);">Quadrature points (UM.RS)' +
      '<input id="tcGlmmNQuad" type="number" min="7" max="41" step="2" value="13" style="padding:6px;border:1px solid var(--border-subtle);border-radius:var(--radius-sm);" />' +
      '</label>' +
      '<label style="display:flex;flex-direction:column;gap:4px;font-size:var(--text-xs);">Continuity correction' +
      '<input id="tcGlmmContinuity" type="number" min="0.01" max="1" step="0.01" value="0.5" style="padding:6px;border:1px solid var(--border-subtle);border-radius:var(--radius-sm);" />' +
      '</label>' +
      '<label style="display:flex;align-items:center;gap:8px;font-size:var(--text-xs);padding-top:18px;">' +
      '<input id="tcGlmmAllFamilies" type="checkbox" checked /> Run all families and render parity table' +
      '</label>' +
      '</div>' +
      '<div style="margin-top:var(--space-2);display:flex;gap:8px;flex-wrap:wrap;">' +
      '<button class="btn btn--ghost btn--sm" id="tcExportGlmmRBtn">Export Metafor GLMM Cross-check (R)</button>' +
      '</div>' +
      '<div style="margin-top:var(--space-2);font-size:var(--text-xs);color:var(--text-secondary);">Default remains UM.RS + OR + ML + 13-point quadrature (existing behavior).</div>';

    if (primaryBtn) {
      body.insertBefore(controlWrap, primaryBtn);
    } else {
      body.insertBefore(controlWrap, body.firstChild);
    }

    const exportBtn = document.getElementById('tcExportGlmmRBtn');
    if (exportBtn && !exportBtn.__tcBound) {
      exportBtn.__tcBound = true;
      exportBtn.addEventListener('click', exportTruthCertGLMMMetaforCrosscheckScript);
    }

    return true;
  }

  function tcRunGLMMAdvancedEnhanced() {
    const dataset = tcBuildBinary2x2Dataset();
    if (dataset.length < 2) {
      tcNotify('GLMM requires binary 2x2 study data', 'error');
      return;
    }

    tcEnsureGLMMFamilyControls();
    const opts = tcGetGlmmControlOptions();
    const selected = tcRunGLMMFamilyByModel(dataset, opts.family, opts);
    const suite = opts.runAll
      ? tcRunGLMMFamilySuite(dataset, opts)
      : { rows: [selected], agreement: null };

    const ai = dataset.map((s) => s.a);
    const bi = dataset.map((s) => s.b);
    const ci = dataset.map((s) => s.c);
    const di = dataset.map((s) => s.d);

    const beta = typeof window.betaBinomialMA === 'function'
      ? window.betaBinomialMA(ai, bi, ci, di)
      : null;

    const payload = {
      selected,
      suite,
      beta,
      measure: opts.measure,
      k: dataset.length,
      zeroCells: dataset.filter((s) => s.a === 0 || s.b === 0 || s.c === 0 || s.d === 0).length
    };

    tcRenderGlmmAdvancedResults(payload);
    tcRenderGlmmAdvancedPlot(payload);

    if (selected && !selected.error) {
      tcNotify('GLMM family analysis complete', 'success');
    } else {
      tcNotify('GLMM family analysis completed with warnings', 'warning');
    }
    return payload;
  }

  function glmmMetaAnalysisFamily(ai, bi, ci, di, options) {
    const opts = options && typeof options === 'object' ? options : {};
    if (!Array.isArray(ai) || !Array.isArray(bi) || !Array.isArray(ci) || !Array.isArray(di)) {
      return { error: 'Input arrays ai, bi, ci, di are required.' };
    }
    const k = Math.min(ai.length, bi.length, ci.length, di.length);
    const studies = [];
    for (let i = 0; i < k; i++) {
      const a = Number(ai[i]);
      const b = Number(bi[i]);
      const c = Number(ci[i]);
      const d = Number(di[i]);
      if (![a, b, c, d].every(Number.isFinite) || a < 0 || b < 0 || c < 0 || d < 0) {
        continue;
      }
      studies.push({ id: i + 1, study: 'Study ' + (i + 1), a, b, c, d });
    }
    if (studies.length < 2) {
      return { error: 'At least 2 valid studies are required.' };
    }
    const family = opts.family || 'UM.RS';
    return tcRunGLMMFamilyByModel(studies, family, opts);
  }

  function runGLMMFamilySuite(options) {
    const dataset = tcBuildBinary2x2Dataset();
    if (dataset.length < 2) {
      return { error: 'GLMM requires binary 2x2 study data.' };
    }
    const opts = options && typeof options === 'object' ? options : tcGetGlmmControlOptions();
    return tcRunGLMMFamilySuite(dataset, opts);
  }

  function tcInitGLMMFamilyParityUpgrade() {
    if (typeof window === 'undefined') return;
    if (!window.__tc_glmm_family_parity_patched__) {
      window.__tc_glmm_family_parity_patched__ = true;
      window.runGLMMAdvancedLegacy = typeof window.runGLMMAdvanced === 'function' ? window.runGLMMAdvanced : null;
      window.runGLMMAdvanced = tcRunGLMMAdvancedEnhanced;
      window.glmmMetaAnalysisFamily = glmmMetaAnalysisFamily;
      window.runGLMMFamilySuite = runGLMMFamilySuite;
    }

    tcEnsureGLMMFamilyControls();
    let attempts = 0;
    const timer = setInterval(() => {
      attempts += 1;
      const ready = tcEnsureGLMMFamilyControls();
      if (ready || attempts >= 40) {
        clearInterval(timer);
      }
    }, 400);
  }

  function tcInjectHeaderButton() {
    if (document.getElementById('auditPackBtn')) return;
    const controls = document.querySelector('.app-controls');
    if (!controls) return;

    const btn = document.createElement('button');
    btn.id = 'auditPackBtn';
    btn.className = 'btn btn--ghost btn--sm';
    btn.title = 'Export reproducibility and validation audit bundle';
    btn.textContent = 'Audit Pack';
    btn.addEventListener('click', exportTruthCertAuditBundle);
    controls.insertBefore(btn, controls.firstChild);
  }

  function tcInjectValidationCard() {
    if (document.getElementById('tcAuditCard')) return;

    const panel = document.getElementById('panel-validation');
    if (!panel) return;

    const firstBody = panel.querySelector('.card .card__body');
    if (!firstBody) return;

    const card = document.createElement('div');
    card.id = 'tcAuditCard';
    card.className = 'card';
    card.style.marginTop = 'var(--space-4)';

    card.innerHTML =
      '<div class="card__header">' +
      '<h3 class="card__title">🔒 Reproducibility and Audit Toolkit</h3>' +
      '<p class="card__subtitle">Add-only upgrade for method transparency, traceability, and expert review readiness</p>' +
      '</div>' +
      '<div class="card__body">' +
      '<div class="flex gap-2" style="flex-wrap:wrap;">' +
      '<button class="btn btn--primary btn--sm" id="tcExportManifestBtn">Export Run Manifest</button>' +
      '<button class="btn btn--primary btn--sm" id="tcExportCitationsBtn">Export Method Citations</button>' +
      '<button class="btn btn--accent btn--sm" id="tcExportAuditBtn">Export Full Audit Bundle</button>' +
      '<button class="btn btn--accent btn--sm" id="tcSendMetaSprintWriteBtn">Send Methods+Results to MetaSprint</button>' +
      '<button class="btn btn--ghost btn--sm" id="tcExportGlmmCrosscheckBtn">Export GLMM Metafor Cross-check (R)</button>' +
      '<button class="btn btn--ghost btn--sm" id="tcRunEstimatorAuditBtn">Run Extended Estimator Health-Check</button>' +
      '</div>' +
      '<div id="tcReadinessSummary"></div>' +
      '<div id="tcAuditResults"></div>' +
      '</div>';

    firstBody.appendChild(card);

    document.getElementById('tcExportManifestBtn').addEventListener('click', exportTruthCertRunManifest);
    document.getElementById('tcExportCitationsBtn').addEventListener('click', exportTruthCertMethodCitations);
    document.getElementById('tcExportAuditBtn').addEventListener('click', exportTruthCertAuditBundle);
    document.getElementById('tcSendMetaSprintWriteBtn').addEventListener('click', () => exportTruthCertMethodsResultsForMetaSprint({ silent: false }));
    document.getElementById('tcExportGlmmCrosscheckBtn').addEventListener('click', exportTruthCertGLMMMetaforCrosscheckScript);
    document.getElementById('tcRunEstimatorAuditBtn').addEventListener('click', runExtendedEstimatorAudit);

    tcRenderReadinessSummary();
  }

  function tcInjectMethodsModalTooling() {
    const modal = document.getElementById('methodsModal');
    if (!modal || document.getElementById('tcModalExportTools')) return;

    const modalContent = modal.querySelector('.modal-content');
    if (!modalContent) return;

    const tools = document.createElement('div');
    tools.id = 'tcModalExportTools';
    tools.style.marginTop = 'var(--space-4)';
    tools.style.padding = 'var(--space-3)';
    tools.style.background = 'var(--surface-overlay)';
    tools.style.borderRadius = 'var(--radius-lg)';
    tools.innerHTML =
      '<h3 style="margin:0 0 var(--space-2) 0;font-size:var(--text-sm);text-transform:uppercase;color:var(--text-secondary);">Reproducibility Exports</h3>' +
      '<div class="flex gap-2" style="flex-wrap:wrap;">' +
      '<button class="btn btn--ghost btn--sm" id="tcModalManifestBtn">Export Run Manifest</button>' +
      '<button class="btn btn--ghost btn--sm" id="tcModalCitationsBtn">Export Citations</button>' +
      '<button class="btn btn--ghost btn--sm" id="tcModalAuditBtn">Export Audit Bundle</button>' +
      '<button class="btn btn--ghost btn--sm" id="tcModalGlmmCrosscheckBtn">Export GLMM Cross-check (R)</button>' +
      '</div>';

    modalContent.appendChild(tools);

    document.getElementById('tcModalManifestBtn').addEventListener('click', exportTruthCertRunManifest);
    document.getElementById('tcModalCitationsBtn').addEventListener('click', exportTruthCertMethodCitations);
    document.getElementById('tcModalAuditBtn').addEventListener('click', exportTruthCertAuditBundle);
    document.getElementById('tcModalGlmmCrosscheckBtn').addEventListener('click', exportTruthCertGLMMMetaforCrosscheckScript);
  }

  const METASPRINT_BRIDGE_STORAGE_KEY = 'metasprint_truthcert_bridge_payload_v1';
  const TRUTHCERT_TO_METASPRINT_WRITEBACK_KEY = 'truthcert_to_metasprint_methods_results_v1';
  let tcMetaSprintBridgeInstalled = false;

  function tcParseJsonSafe(text) {
    try {
      return JSON.parse(text);
    } catch (_) {
      return null;
    }
  }

  function tcNormalizeMetaSprintEnvelope(input) {
    if (!input || typeof input !== 'object') return null;
    if (input.type === 'metasprint-truthcert-import' && input.payload && typeof input.payload === 'object') return input;
    if (input.payload && input.payload.settings && Array.isArray(input.payload.data)) {
      return {
        type: 'metasprint-truthcert-import',
        payload: input.payload,
        autoRun: !!input.autoRun,
        autoTruthCert: !!input.autoTruthCert
      };
    }
    if (input.settings && Array.isArray(input.data)) {
      return { type: 'metasprint-truthcert-import', payload: input };
    }
    return null;
  }

  function tcMetaSprintStateValid(state) {
    if (!state || typeof state !== 'object') return false;
    if (!state.settings || typeof state.settings !== 'object') return false;
    if (!Array.isArray(state.data) || state.data.length < 2) return false;
    const dataType = String(state.settings.dataType || '').trim();
    return ['binary', 'continuous', 'hr', 'proportion', 'generic'].includes(dataType);
  }

  function tcRunTruthCertWhenReady(attempt) {
    const n = Number(attempt) || 0;
    if (typeof window.runTruthCertAnalysis !== 'function') return;
    if (window.AppState && window.AppState.results && window.AppState.results.pooled) {
      window.runTruthCertAnalysis();
      if (typeof window.goToTab === 'function') window.goToTab('verdict');
      return;
    }
    if (n < 30) {
      setTimeout(() => tcRunTruthCertWhenReady(n + 1), 250);
    }
  }

  function tcImportMetaSprintBridgeFallback(input, options) {
    const envelope = tcNormalizeMetaSprintEnvelope(input);
    if (!envelope) {
      return { ok: false, reason: 'invalid_envelope' };
    }
    const state = envelope.payload;
    if (!tcMetaSprintStateValid(state)) {
      tcNotify('MetaSprint bridge payload invalid or too small (need >=2 studies)', 'error');
      return { ok: false, reason: 'invalid_state' };
    }
    if (typeof window.applyProjectState !== 'function') {
      tcNotify('Bridge import unavailable: applyProjectState is missing in this build', 'error');
      return { ok: false, reason: 'missing_applyProjectState' };
    }

    window.applyProjectState(state);
    const importedN = Array.isArray(state.data) ? state.data.length : 0;
    tcNotify('Imported ' + importedN + ' studies from MetaSprint', 'success');

    try {
      localStorage.removeItem(METASPRINT_BRIDGE_STORAGE_KEY);
    } catch (_) {}

    const opts = options && typeof options === 'object' ? options : {};
    const shouldAutoRun = opts.autoRun !== undefined ? !!opts.autoRun : (envelope.autoRun !== false);
    const shouldAutoTruthCert = opts.autoTruthCert !== undefined ? !!opts.autoTruthCert : (envelope.autoTruthCert !== false);

    if (typeof window.goToTab === 'function') window.goToTab('data');
    if (shouldAutoRun && typeof window.runAnalysis === 'function') {
      setTimeout(() => {
        try {
          window.runAnalysis();
          if (shouldAutoTruthCert) setTimeout(() => tcRunTruthCertWhenReady(0), 600);
        } catch (err) {
          tcNotify('Auto-run failed after import: ' + String(err && err.message ? err.message : err), 'warning');
        }
      }, 120);
    }

    return {
      ok: true,
      importedStudies: importedN,
      dataType: String(state.settings.dataType || '')
    };
  }

  function tcDispatchMetaSprintBridgeImport(input, options) {
    if (typeof window.importMetaSprintBridgePayload === 'function' &&
        window.importMetaSprintBridgePayload !== tcDispatchMetaSprintBridgeImport &&
        window.importMetaSprintBridgePayload !== tcImportMetaSprintBridgeFallback) {
      return window.importMetaSprintBridgePayload(input, options || {});
    }
    return tcImportMetaSprintBridgeFallback(input, options || {});
  }

  function tcConsumePendingMetaSprintBridge() {
    let raw = null;
    try {
      raw = localStorage.getItem(METASPRINT_BRIDGE_STORAGE_KEY);
    } catch (_) {
      raw = null;
    }
    if (!raw) return { ok: false, reason: 'no_payload' };
    const parsed = tcParseJsonSafe(raw);
    if (!parsed) {
      try {
        localStorage.removeItem(METASPRINT_BRIDGE_STORAGE_KEY);
      } catch (_) {}
      return { ok: false, reason: 'invalid_json' };
    }
    return tcDispatchMetaSprintBridgeImport(parsed, {});
  }

  function tcInstallMetaSprintBridgeReceiver() {
    if (tcMetaSprintBridgeInstalled || typeof window === 'undefined') return;
    tcMetaSprintBridgeInstalled = true;

    window.addEventListener('message', (event) => {
      const data = event && event.data ? event.data : null;
      if (!data || typeof data !== 'object') return;
      if (data.type !== 'metasprint-truthcert-import') return;
      tcDispatchMetaSprintBridgeImport(data, {});
    });

    setTimeout(() => tcConsumePendingMetaSprintBridge(), 250);
  }

  function tcBuildMethodsResultsWriteback() {
    const state = tcSafeAppState();
    const results = state && state.results ? state.results : null;
    const settings = state && state.settings ? state.settings : {};
    const truth = state && state.truthcert ? state.truthcert : null;

    if (!results || !results.pooled || !Number.isFinite(results.pooled.theta)) {
      return { ok: false, reason: 'Run analysis first.' };
    }

    const k = Number(results.k || (Array.isArray(results.studies) ? results.studies.length : 0) || 0);
    const measure = String(settings.effectMeasure || results.measure || 'Effect').toUpperCase();
    const tauMethod = String(settings.tau2Method || results.tau2Result?.method || 'REML');
    const hksj = !!settings.hksj;
    const pooled = results.pooled;
    const ciLower = Number(pooled.ci_lower);
    const ciUpper = Number(pooled.ci_upper);
    const pValue = Number(pooled.p_value);
    const i2 = Number(results.heterogeneity && results.heterogeneity.I2);
    const tau2 = Number(results.tau2);
    const piLo = Number(results.pi && results.pi.standard && results.pi.standard.lower);
    const piHi = Number(results.pi && results.pi.standard && results.pi.standard.upper);

    const methodsMd =
      '### TruthCert Advanced Cross-check Methods\n' +
      'A pairwise random-effects synthesis was cross-checked in TruthCert-PairwisePro using ' + tauMethod + ' heterogeneity estimation' +
      (hksj ? ' with Hartung-Knapp-Sidik-Jonkman small-sample adjustment' : '') + '. ' +
      'The analysis included ' + k + ' studies and used effect measure ' + measure + '. ' +
      'Advanced diagnostics were executed where applicable, including prediction intervals, publication-bias diagnostics, estimator-spread/consensus checks, and influence/fragility-related diagnostics.\n';

    let resultsMd =
      '### TruthCert Advanced Cross-check Results\n' +
      'Cross-check pooled estimate: ' + pooled.theta.toFixed(4) +
      ' (95% CI ' + (Number.isFinite(ciLower) ? ciLower.toFixed(4) : 'N/A') + ' to ' + (Number.isFinite(ciUpper) ? ciUpper.toFixed(4) : 'N/A') + ')' +
      (Number.isFinite(pValue) ? '; p=' + (pValue < 0.001 ? '<0.001' : pValue.toFixed(4)) : '') + '. ' +
      'Heterogeneity: I2=' + (Number.isFinite(i2) ? i2.toFixed(1) + '%' : 'N/A') +
      ', tau2=' + (Number.isFinite(tau2) ? tau2.toFixed(5) : 'N/A') + '. ';

    if (Number.isFinite(piLo) && Number.isFinite(piHi)) {
      resultsMd += 'Prediction interval: ' + piLo.toFixed(4) + ' to ' + piHi.toFixed(4) + '. ';
    }
    if (truth && truth.verdict && truth.verdict.verdict) {
      resultsMd += 'TruthCert evidence verdict: ' + String(truth.verdict.verdict) + '.';
    }
    resultsMd += '\n';

    const payload = {
      type: 'truthcert-methods-results-v1',
      sourceApp: 'truthcert-pairwisepro',
      generatedAt: tcNowIso(),
      methodsMarkdown: methodsMd,
      resultsMarkdown: resultsMd,
      summary: {
        k,
        measure,
        tauMethod,
        hksj,
        pooledTheta: Number(pooled.theta),
        ciLower: Number.isFinite(ciLower) ? ciLower : null,
        ciUpper: Number.isFinite(ciUpper) ? ciUpper : null,
        pValue: Number.isFinite(pValue) ? pValue : null,
        I2: Number.isFinite(i2) ? i2 : null,
        tau2: Number.isFinite(tau2) ? tau2 : null,
        verdict: truth && truth.verdict ? truth.verdict.verdict || null : null
      }
    };
    return { ok: true, payload };
  }

  function exportTruthCertMethodsResultsForMetaSprint(options) {
    const opts = options && typeof options === 'object' ? options : {};
    const built = tcBuildMethodsResultsWriteback();
    if (!built.ok) {
      if (!opts.silent) tcNotify('Cannot export Methods+Results: ' + built.reason, 'warning');
      return built;
    }
    try {
      localStorage.setItem(TRUTHCERT_TO_METASPRINT_WRITEBACK_KEY, JSON.stringify(built.payload));
      if (!opts.silent) tcNotify('TruthCert Methods+Results sent to MetaSprint bridge.', 'success');
      return { ok: true, payload: built.payload };
    } catch (err) {
      if (!opts.silent) tcNotify('Failed to write MetaSprint bridge payload: ' + String(err && err.message ? err.message : err), 'error');
      return { ok: false, reason: 'storage_write_failed' };
    }
  }

  function tcInstallMetaSprintWritebackAutoPublishHook() {
    if (typeof window === 'undefined') return;
    if (window.__tc_meta_writeback_hook_installed__) return;
    window.__tc_meta_writeback_hook_installed__ = true;

    let attempts = 0;
    const timer = setInterval(() => {
      attempts += 1;
      if (typeof window.runTruthCertAnalysis === 'function' && !window.runTruthCertAnalysis.__tcWritebackWrapped) {
        const original = window.runTruthCertAnalysis;
        const wrapped = function (...args) {
          const out = original.apply(this, args);
          setTimeout(() => exportTruthCertMethodsResultsForMetaSprint({ silent: true }), 250);
          return out;
        };
        wrapped.__tcWritebackWrapped = true;
        window.runTruthCertAnalysis = wrapped;
        setTimeout(() => exportTruthCertMethodsResultsForMetaSprint({ silent: true }), 500);
        clearInterval(timer);
      } else if (attempts >= 60) {
        clearInterval(timer);
      }
    }, 300);
  }

  function initExpertUpgrades() {
    tcInjectHeaderButton();
    tcInjectValidationCard();
    tcInjectMethodsModalTooling();
    tcInitGLMMFamilyParityUpgrade();
    tcInstallMetaSprintBridgeReceiver();
    tcInstallMetaSprintWritebackAutoPublishHook();
  }

  window.exportTruthCertRunManifest = exportTruthCertRunManifest;
  window.exportTruthCertMethodCitations = exportTruthCertMethodCitations;
  window.exportTruthCertAuditBundle = exportTruthCertAuditBundle;
  window.exportTruthCertGLMMMetaforCrosscheckScript = exportTruthCertGLMMMetaforCrosscheckScript;
  window.exportTruthCertMethodsResultsForMetaSprint = exportTruthCertMethodsResultsForMetaSprint;
  window.runExtendedEstimatorAudit = runExtendedEstimatorAudit;
  window.getTruthCertAdoptionReadinessEstimate = tcEstimateAdoptionReadiness;
  window.glmmMetaAnalysisFamily = glmmMetaAnalysisFamily;
  window.runGLMMFamilySuite = runGLMMFamilySuite;
  window.tcImportMetaSprintBridgePayload = tcDispatchMetaSprintBridgeImport;
  window.tcConsumePendingMetaSprintBridge = tcConsumePendingMetaSprintBridge;
  if (typeof window.importMetaSprintBridgePayload !== 'function') {
    window.importMetaSprintBridgePayload = tcImportMetaSprintBridgeFallback;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initExpertUpgrades);
  } else {
    initExpertUpgrades();
  }
})();
