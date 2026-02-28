# MetaSprint Autopilot: Expert-Readiness Upgrade Design

**Date:** 2026-02-28
**Goal:** Make MetaSprint Autopilot the definitive cardiology pairwise meta-analysis app such that 11 of 12 experts would adopt immediately.
**Approach:** Benchmark-Driven (Approach C) — SGLT2i HF trials drive every fix, port, and polish.

---

## 1. Benchmark Data: 4-Outcome SGLT2i Golden Standard

### Trials (Heart Failure)
| Trial | Drug | Population | N | Year |
|-------|------|-----------|---|------|
| DAPA-HF | Dapagliflozin | HFrEF | 4,744 | 2019 |
| EMPEROR-Reduced | Empagliflozin | HFrEF | 3,730 | 2020 |
| EMPEROR-Preserved | Empagliflozin | HFpEF | 5,988 | 2021 |
| DELIVER | Dapagliflozin | HFmrEF/HFpEF | 6,263 | 2022 |
| SOLOIST-WHF | Sotagliflozin | Worsening HF | 1,222 | 2021 |

### Trials (Renal — additional for renal composite)
| Trial | Drug | Population | N | Year |
|-------|------|-----------|---|------|
| DAPA-CKD | Dapagliflozin | CKD | 4,304 | 2020 |
| EMPA-KIDNEY | Empagliflozin | CKD | 6,609 | 2022 |
| CREDENCE | Canagliflozin | DKD | 4,401 | 2019 |

### Golden Values
| Outcome | Trials | Golden HR (95% CI) | I-squared | Source |
|---------|--------|-------------------|-----------|--------|
| Composite (CV death + HF hosp) | 5 HF | 0.77 (0.72-0.82) | ~50% | Vaduganathan 2022 Lancet |
| All-cause mortality | 5 HF | 0.87 (0.78-0.97) | ~0% | Trial publications |
| HF hospitalization alone | 5 HF | 0.71 (0.61-0.84) | ~65% | Trial publications |
| Renal composite | 3 CKD + select HF | 0.69 (0.57-0.83) | ~40% | CRES validated |

### Why These 4 Outcomes
- **Composite**: Significant + moderate I-squared (tests standard pooling)
- **ACM**: Borderline significant + low I-squared (tests method sensitivity — DL/REML should agree)
- **HF hosp**: Highly significant + high I-squared (tests HKSJ, prediction intervals, outlier detection)
- **Renal**: Cross-indication pooling (tests subgroup/network across HF and CKD indications)

---

## 2. Phases

### Phase 1: Data Import & Extraction
- Import 8 trials (5 HF + 3 CKD) via Extract tab
- Enter 2x2 event data + HR/CI for each outcome
- Verify auto-computation: log(HR), SE from CI, effect size conversions
- Fix any broken conversion paths (HR <-> OR <-> RR)

### Phase 2: Core Analysis Engine
- Run all 4 outcomes through DL, REML, FE, DL+HKSJ
- Golden gate: pooled HR matches within epsilon=0.02
- Verify: I-squared, tau-squared, Q-statistic, prediction intervals
- Fix: convergence issues, REML diagnostics, correct df for HKSJ

### Phase 3: Visualization & Forest Plots
- Forest plot per outcome: point estimates, CIs, summary diamond, prediction interval band
- Funnel plot, Galbraith plot, L'Abbe plot
- Dynamic axis labels (HR/OR/RR), publication-quality SVG export
- Fix: rendering bugs, clipped text, missing legends

### Phase 4: Advanced Methods (Existing — Audit & Fix)
- Run on all 4 outcomes: DDMA, RoBMA, Z-Curve, Copas, Cook's Distance, LOO, Peto, MH, TSA, PET-PEESE
- Verify: results plausible, no crashes, sensitivity battery table complete
- Fix: any method that crashes, hangs, produces NaN, or gives implausible results

### Phase 5: TruthCert Methods Port
Methods to port from truthcert-denominator-phase1 and truthcert-meta2-prototype:

1. **Conservative Arbitration** (arbitration.py)
   - When DL and REML disagree (expected on HF hosp, I-squared ~65%), show disagreement score
   - Inflate CI by 1.3x (mid disagreement) or 2.0x (high disagreement)
   - Guarantee: arbitrated CI never narrower than any individual method's CI
   - UI: disagreement badge on Analyze tab

2. **Decision Regret Framework** (regret.py)
   - Classify each outcome: Recommend / Consider-benefit / Consider-harm / Research / DoNot
   - Asymmetric costs: FP=1.0, FN=1.0, Research=0.5
   - Show regret-optimal decision alongside standard statistical conclusion

3. **Bias Decomposition** (bias_decomposition.py)
   - Per-trial breakdown: publication bias risk, endpoint reporting, sponsor effects
   - Registry denominator integration via CT.gov data already in universe
   - Visual: stacked bar showing 3 bias components per trial

4. **Question Contracts** (question_contract.py)
   - Pre-register PICO before analysis (SHA-256 hash lock)
   - UI: modal on Protocol tab, locked hash shown in analysis header
   - Prevents post-hoc outcome switching

5. **Deterministic Seeding** (seed.py)
   - Hash-chained PCG64 (xoshiro128** JS equivalent) for all bootstrap/simulation
   - User-configurable master seed
   - Reproducibility badge: "Seed: 42 | Hash: a3f7..."

### Phase 5.5: Network Meta-Analysis (NMA)
- **Pairwise NMA**: Indirect comparisons via shared placebo arms
  - Dapagliflozin vs Empagliflozin vs Sotagliflozin (3-node network)
  - Bucher method for simple indirect comparisons
  - Frequentist NMA (multivariate meta-analysis) for full network
- **Consistency checks**: Node-splitting, design-by-treatment interaction
- **Ranking**: P-score / SUCRA with uncertainty intervals
- **Network plot**: Force-directed graph with edge thickness = number of studies
- **League table**: All pairwise comparisons with CIs
- Validate: compare rankings against published NMA (if available)

### Phase 6: Missing Features
- **Meta-regression**: Continuous + categorical moderators (year, LVEF cutoff, drug class)
- **Cumulative meta-analysis**: By publication year (shows evidence evolution)
- **Subgroup analysis**: HFrEF vs HFpEF (natural SGLT2i subgroup), interaction p-value
- **GRADE automation**: Auto-downgrade for inconsistency (I-squared), imprecision (CI crosses null), indirectness
- **Export**: CSV pairwise data, R metafor script, RevMan XML, forest plot SVG/PNG

### Phase 7: Polish & Integration Testing
- Full Selenium E2E for all 4 outcomes end-to-end
- Dark mode visual check on all tabs
- Keyboard accessibility (Tab, Enter, Escape)
- Edge cases: k=1 (single study), k=2 (minimum for I-squared), zero events
- Performance gate: page load <2s, analysis <1s
- Div balance verification after all structural edits

---

## 3. Success Criteria (Expert Adoption Gate)

An expert would adopt immediately if ALL 10 criteria are met:

1. **Numbers match R metafor** within epsilon=0.01 for all 4 golden outcomes (DL, REML, FE, HKSJ)
2. **Every method runs** without crash on all 4 outcomes (zero dead buttons)
3. **Sensitivity battery** shows DL/REML/HKSJ/FE side-by-side in one table with divergence flags
4. **TruthCert arbitration** flags method disagreement and explains inflation rationale
5. **Forest plots** are publication-quality with prediction intervals (Cochrane 2025 standard)
6. **GRADE table** auto-generated with downgrading reasons per domain
7. **Subgroup analysis** correctly splits HFrEF vs HFpEF with interaction p-value
8. **NMA** produces indirect comparisons with consistency checks and ranking
9. **No dead ends** — every tab leads to actionable output
10. **Reproducible** — same data + same seed = identical results every time

---

## 4. TruthCert Methods: JS Translation Notes

### Conservative Arbitration (Python -> JS)
```
Input: estimates[] = [{method: 'DL', mu, ci_lo, ci_hi}, {method: 'REML', ...}, ...]
disagreement_sd = std(estimates.map(e => e.mu))
if sd < 0.05: use delta engine as-is
if sd < 0.15: inflate all CIs by 1.3x
if sd >= 0.15: inflate by 2.0x + downgrade decision to "Research"
Output: arbitrated_mu, arbitrated_ci, disagreement_level, inflation_factor
Guarantee: arbitrated CI width >= max(individual CI widths)
```

### Decision Regret (Python -> JS)
```
For each outcome:
  p_benefit = P(pooled_effect < 0) from normal(mu, se)
  p_harm = P(pooled_effect > threshold)
  silent_rate = n_silent / n_registered (from CT.gov universe)

  Classify:
    Recommend: p_benefit >= 0.80, ci_hi < 0, silent_rate <= 0.50
    Consider-benefit: p_benefit >= 0.60, silent_rate <= 0.70
    Consider-harm: p_harm >= 0.20
    Research: silent_rate >= 0.40
    DoNot: all else

  Regret = w_FP * I(decision=benefit, truth=no_benefit) + w_FN * I(decision=no_benefit, truth=benefit)
  w_Research = 0.5 (deferral less costly than harm)
```

### Bias Decomposition (Python -> JS)
```
For each study i in meta-analysis:
  silent_rate_i = (n_registered - n_published) / n_registered [from CT.gov]
  endpoint_miss_i = fraction of pre-registered endpoints not reported
  industry_fraction_i = 1 if industry-sponsored, 0 otherwise

  bias_score_i = 0.4*silent_rate + 0.35*endpoint_miss + 0.25*industry_fraction

  Visual: stacked horizontal bar per study, color-coded by component
```

---

## 5. Data Sources (Already Available)

| Source | Path | Content |
|--------|------|---------|
| LEC Phase 0 | `lec_phase0_project/data/sglt2i_hf_extraction.json` | 6 HF trials, full metadata |
| CRES | `C:\Models\CRES\fin.html` | 7 SGLT2i + 13 other trials, validated |
| MetaSprint ACM | `truthcert1_work/metajs-lib/examples/sglt2_acm.json` | 5 trials, 2x2 ACM data |
| TruthCert Phase 1 | `C:\Models\truthcert-denominator-phase1\sim\` | 15 Python modules to port |
| TruthCert Phase 2 | `C:\Models\truthcert-meta2-prototype\sim\` | 8 governance modules to port |
| CT.gov Universe | Embedded in Autopilot | 4,700+ CV trials for registry denominators |

---

## 6. Risk Mitigation

- **Div balance**: Verify `<div` vs `</div>` count after every structural edit
- **`</script>` in literals**: Never write literal `</script>` — use `${'<'}/script>`
- **localStorage keys**: All keys prefixed `msa-` (MetaSprint Autopilot variant)
- **Regression**: Save test snapshot before each phase; compare after
- **NMA complexity**: Start with Bucher indirect comparison (simpler), then full frequentist NMA
- **24K line file**: Use line offsets, never load entire file repeatedly
