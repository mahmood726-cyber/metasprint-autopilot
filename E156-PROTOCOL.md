# E156 Protocol — `metasprint-autopilot`

This repository is the source code and dashboard backing an E156 micro-paper on the [E156 Student Board](https://mahmood726-cyber.github.io/e156/students.html).

---

## `[108]` MetaSprint Autopilot: Zero-Install Browser Platform for Systematic Review and Meta-Analysis

**Type:** methods  |  ESTIMAND: Engine accuracy vs Cochrane reviews  
**Data:** 291 Cochrane reviews (triple-blinded validation)

### 156-word body

Can a zero-install browser application match the statistical accuracy of validated meta-analysis software across hundreds of Cochrane reviews? MetaSprint Autopilot is a single HTML file implementing a complete seven-phase systematic review workflow from topic discovery through manuscript drafting, validated against 291 Cochrane reviews via triple-blinded architecture. The engine provides DerSimonian-Laird, REML, Mantel-Haenszel, and Peto pooling with Hartung-Knapp-Sidik-Jonkman intervals, publication bias diagnostics, living meta-analysis with sequential stopping rules, and GRADE assessment. Across all 291 reviews the engine achieved 100.0 percent accuracy with median effect difference of 1.65 times ten to the negative seventh, and R metafor v4.8.0 cross-validation confirmed exact agreement with concordance coefficient of 1.0000. Leave-one-out analysis showed 24.9 percent of reviews changed direction upon single-study removal, and 92.2 percent of prediction intervals crossed the null. The platform eliminates software installation barriers while preserving statistical rigor for global evidence synthesis. However, a limitation is that open-access search discovery rates remain moderate at 58 to 65 percent.

### Submission metadata

```
Corresponding author: Mahmood Ahmad <mahmood.ahmad2@nhs.net>
ORCID: 0000-0001-9107-3704
Affiliation: Tahir Heart Institute, Rabwah, Pakistan

Links:
  Code:      https://github.com/mahmood726-cyber/metasprint-autopilot
  Protocol:  https://github.com/mahmood726-cyber/metasprint-autopilot/blob/main/E156-PROTOCOL.md
  Dashboard: https://mahmood726-cyber.github.io/metasprint-autopilot/

References (topic pack: multilevel / three-level meta-analysis):
  1. Cheung MW-L. 2014. Modeling dependent effect sizes with three-level meta-analyses: a structural equation modeling approach. Psychol Methods. 19(2):211-229. doi:10.1037/a0032968
  2. Van den Noortgate W, López-López JA, Marín-Martínez F, Sánchez-Meca J. 2013. Three-level meta-analysis of dependent effect sizes. Behav Res Methods. 45(2):576-594. doi:10.3758/s13428-012-0261-6

Data availability: No patient-level data used. Analysis derived exclusively
  from publicly available aggregate records. All source identifiers are in
  the protocol document linked above.

Ethics: Not required. Study uses only publicly available aggregate data; no
  human participants; no patient-identifiable information; no individual-
  participant data. No institutional review board approval sought or required
  under standard research-ethics guidelines for secondary methodological
  research on published literature.

Funding: None.

Competing interests: MA serves on the editorial board of Synthēsis (the
  target journal); MA had no role in editorial decisions on this
  manuscript, which was handled by an independent editor of the journal.

Author contributions (CRediT):
  [STUDENT REWRITER, first author] — Writing – original draft, Writing –
    review & editing, Validation.
  [SUPERVISING FACULTY, last/senior author] — Supervision, Validation,
    Writing – review & editing.
  Mahmood Ahmad (middle author, NOT first or last) — Conceptualization,
    Methodology, Software, Data curation, Formal analysis, Resources.

AI disclosure: Computational tooling (including AI-assisted coding via
  Claude Code [Anthropic]) was used to develop analysis scripts and assist
  with data extraction. The final manuscript was human-written, reviewed,
  and approved by the author; the submitted text is not AI-generated. All
  quantitative claims were verified against source data; cross-validation
  was performed where applicable. The author retains full responsibility for
  the final content.

Preprint: Not preprinted.

Reporting checklist: PRISMA 2020 (methods-paper variant — reports on review corpus).

Target journal: ◆ Synthēsis (https://www.synthesis-medicine.org/index.php/journal)
  Section: Methods Note — submit the 156-word E156 body verbatim as the main text.
  The journal caps main text at ≤400 words; E156's 156-word, 7-sentence
  contract sits well inside that ceiling. Do NOT pad to 400 — the
  micro-paper length is the point of the format.

Manuscript license: CC-BY-4.0.
Code license: MIT.

SUBMITTED: [ ]
```


---

_Auto-generated from the workbook by `C:/E156/scripts/create_missing_protocols.py`. If something is wrong, edit `rewrite-workbook.txt` and re-run the script — it will overwrite this file via the GitHub API._