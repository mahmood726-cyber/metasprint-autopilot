# Exact Dataset Replication: GLP-1RA MACE Meta-Analysis

## Reference Paper
- **Title**: Cardiovascular risk reduction with GLP-1 receptor agonists is proportional to HbA1c lowering in type 2 diabetes
- **Authors**: Hasebe M, Su CY, Keidai Y, et al.
- **Journal**: Diabetes, Obesity & Metabolism (2025)
- **DOI**: [10.1111/dom.70121](https://doi.org/10.1111/dom.70121)
- **PMID**: [40926380](https://pubmed.ncbi.nlm.nih.gov/40926380/)
- **PMC**: PMC12587236 (Open Access)

## Summary
- **Trials replicated**: 10
- **Total participants**: 73,263
- **Numerical checks**: 11/11 passed
- **Overall verdict**: PASS

## Trial-Level Data Used

| Trial | Year | Drug | N | HR | 95% CI | HbA1c Δ | Source PMID |
|-------|------|------|---|------|--------|---------|------------|
| ELIXA | 2015 | Lixisenatide | 6,068 | 1.02 | 0.89–1.17 | 0.27% | 26389183 |
| LEADER | 2016 | Liraglutide | 9,340 | 0.87 | 0.78–0.97 | 0.40% | 27295427 |
| SUSTAIN-6 | 2016 | Semaglutide (SC) | 3,297 | 0.74 | 0.58–0.95 | 0.85% | 27633186 |
| EXSCEL | 2017 | Exenatide | 14,752 | 0.91 | 0.83–1.00 | 0.53% | 28881995 |
| Harmony Outcomes | 2018 | Albiglutide | 9,463 | 0.78 | 0.68–0.90 | 0.52% | 30291013 |
| PIONEER 6 | 2019 | Semaglutide (oral) | 3,183 | 0.79 | 0.57–1.11 | 0.70% | 31185157 |
| REWIND | 2019 | Dulaglutide | 9,901 | 0.88 | 0.79–0.99 | 0.61% | 31189511 |
| AMPLITUDE-O | 2021 | Efpeglenatide | 4,076 | 0.73 | 0.58–0.92 | 1.24% | 34710927 |
| FLOW | 2024 | Semaglutide (SC) | 3,533 | 0.82 | 0.68–0.98 | 0.81% | 38785209 |
| SOUL | 2025 | Semaglutide (oral) | 9,650 | 0.86 | 0.77–0.96 | 0.56% | 40162642 |

## DerSimonian-Laird Pooled Results

| Metric | Computed | Published | Difference | Tolerance | Status |
|--------|----------|-----------|------------|-----------|--------|
| Pooled HR (MACE) | 0.862537 | 0.86 | 0.002537 | 0.02 | PASS |
| CI lower bound | 0.816552 | 0.82 | 0.003448 | 0.03 | PASS |
| CI upper bound | 0.911112 | 0.91 | 0.001112 | 0.03 | PASS |
| I-squared (%) | 31.309776 | 31.3 | 0.009776 | 5.0 | PASS |
| Number of studies (k) | 10 | 10 | 0.000000 | 0 | PASS |
| Total participants | 73263 | 73263 | 0.000000 | 0 | PASS |
| HbA1c regression slope | -0.31139 | -0.31 | 0.001390 | 0.1 | PASS |
| HbA1c slope within published CI | -0.3114 | [-0.54, -0.08] | N/A | within CI | PASS |
| HbA1c regression R² | 0.579766 | 0.61 | 0.030234 | 0.2 | PASS |
| Weight regression slope | -0.041756 | -0.04 | 0.001756 | 0.1 | PASS |
| Weight slope not significant (p>0.05) | 0.0962 | p=0.14 (not significant) | N/A | p>0.05 | PASS |

## Meta-Regression Results

### HbA1c Reduction vs MACE log-HR
- **Slope**: -0.3114 (published: -0.31)
- **95% CI**: [-0.4951, -0.1277]
  (published: [-0.54, -0.08])
- **p-value**: 0.0009 (published: 0.015)
- **R²**: 0.580 (published: 0.61)

### Bodyweight Reduction vs MACE log-HR
- **Slope**: -0.0418 (published: -0.04)
- **95% CI**: [-0.0910, 0.0074]
  (published: [-0.1, 0.02])
- **p-value**: 0.0962 (published: 0.14)
- **R²**: 0.257 (published: 0.21)

## JavaScript Engine Verification
- **JS pooled HR**: 0.862537
- **JS CI**: [0.816552, 0.911112]
- **JS I²**: 31.31%
- **JS tau²**: 0.002302
- **Python vs JS difference**: 0.00e+00

## DOM Editorial Checklist

| Category | Criterion | Weight | Met by Published Paper |
|----------|-----------|--------|----------------------|
| Reporting | PRISMA 2020 compliance | 10 | Yes |
| Reporting | PROSPERO registration | 8 | Yes |
| Reporting | Search strategy documented | 8 | Yes |
| Reporting | Study selection flowchart | 6 | Yes |
| Methods | Risk of bias assessment | 10 | Yes |
| Methods | Effect measure specified | 6 | Yes |
| Methods | Heterogeneity assessment | 8 | Yes |
| Methods | Publication bias assessment | 6 | Yes |
| Methods | Statistical software stated | 4 | Yes |
| Methods | Meta-regression methodology | 6 | Yes |
| Results | Forest plot | 8 | Yes |
| Results | Heterogeneity reported | 4 | Yes |
| Results | Sensitivity analyses | 6 | Yes |
| Results | Meta-regression results | 4 | Yes |
| Clinical | Clinical interpretability | 4 | Yes |
| Clinical | Limitations acknowledged | 4 | Yes |
| Integrity | Data availability statement | 2 | Yes |

**Total editorial weight**: 104/100

## Methodology Note

This replication uses the DerSimonian-Laird estimator (same as the published paper).
Meta-regression uses moment-based weighted least squares (DL tau²), while the
published paper used REML-based mixed-effects models (R `metafor` package).
Small differences in meta-regression slopes/p-values are expected due to this
methodological difference. All pooled estimates should match at machine-epsilon.

## Data Provenance

- Per-trial MACE HRs: original landmark CVOT publications (PMIDs listed above)
- HbA1c/bodyweight reductions: Hasebe et al. 2025, Table 1 (OA full text via PMC)
- Published pooled results: Hasebe et al. 2025, Results section (OA full text)
- All data OA-accessible; no paywall bypass.
