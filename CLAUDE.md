# CLAUDE.md — MetaSprint App Suite

## Project Overview
META-SPRINT is a 40-day structured meta-analysis framework with 5 quality gates (DoD A-E), implemented as single-file HTML apps. **14 files**: 1 main pairwise, 1 NMA, 12 specialized variants + gateway index.

## Key Files
| File | Variant |
|------|---------|
| `meta-sprint-v3_0-2.html` | Main pairwise (~5K lines) |
| `meta-sprint-nma-v3.html` | Network MA (~3.6K lines) |
| `meta-sprint-dta-v1.html` | Diagnostic Test Accuracy |
| `meta-sprint-surv-v1.html` | Survival / Time-to-event |
| `meta-sprint-dose-v1.html` | Dose-Response |
| `meta-sprint-ipd-v1.html` | Individual Patient Data |
| `meta-sprint-prev-v1.html` | Prevalence |
| `meta-sprint-prog-v1.html` | Prognostic |
| `meta-sprint-animal-v1.html` | Animal / Preclinical |
| `meta-sprint-rapid-v1.html` | Rapid Review |
| `meta-sprint-hta-v1.html` | Health Technology Assessment |
| `meta-sprint-umbrella-v1.html` | Umbrella Review |
| `meta-sprint-qes-v1.html` | Qualitative Evidence Synthesis |
| `meta-sprint-living-v1.html` | Living Systematic Review |
| `index.html` | Gateway / launcher |

## Critical Warnings
- **Copy-paste from NMA leaves `cinema-*` element IDs** in variant files — ALWAYS check element IDs match the actual form when copying across variants.
- **`function saveROBINS-E()` is INVALID JS** — hyphen parsed as minus operator. Use camelCase: `saveRobinsE()`.
- **Fix propagation across 14 files is the dominant issue** — when fixing a bug, check ALL 14 files for the same pattern.
- **localStorage keys and export filenames** must be unique per variant — never reuse NMA keys in variant files.
- **`escapeHtml()`** must be present and used in ALL 14 files for any user-supplied text rendered to DOM.
- **QuotaExceededError**: `save()` must be wrapped in try/catch in ALL files.
- **Clipboard `.then()/.catch()`** required on ALL clipboard calls in all files.

## Do NOT
- Add npm/build dependencies (must work offline, single-file architecture)
- Modify one variant without checking if the same fix applies to others
- Use `cinema-*` IDs outside of NMA — each variant has its own ID prefix
- Skip `escapeHtml()` on any user-rendered text (XSS risk)

## Testing
```bash
# Run Selenium tests (run from repo root)
python ./test_metasprint.py
```

## Workflow Rules (from usage insights)

### Data Integrity
Never fabricate or hallucinate identifiers (NCT IDs, DOIs, trial names, PMIDs). If you don't have the real identifier, say so and ask the user to provide it. Always verify identifiers against existing data files before using them in configs or gold standards.

### Multi-Persona Reviews
When running multi-persona reviews, run agents sequentially (not in parallel) to avoid rate limits and empty agent outputs. If an agent returns empty output, immediately retry it before moving on. Never launch more than 2 sub-agents simultaneously.

### Fix Completeness
When asked to "fix all issues", fix ALL identified issues in a single pass — do not stop partway. After applying fixes, re-run the relevant tests/validation before reporting completion. If fixes introduce new failures, fix those too before declaring done.

### Scope Discipline
Stay focused on the specific files and scope the user requests. Do not survey or analyze files outside the stated scope. When editing files, triple-check you are editing the correct file path — never edit a stale copy or wrong directory.

### Regression Prevention
Before applying optimization changes to extraction or analysis pipelines, save a snapshot of current accuracy metrics. After each change, compare against the snapshot. If any trial/metric regresses by more than 2%, immediately rollback and try a different approach. Never apply aggressive heuristics without isolated testing first.
