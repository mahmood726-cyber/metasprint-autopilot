# Finrenone Port Priority Plan

Context:
- Source ideas were inventoried in `docs/plans/2026-03-14-finrenone-topic-idea-transfer.md`.
- This plan converts that inventory into gap-based work for `metasprint-autopilot`.

## Audit Summary

Already present in `metasprint-autopilot`:
- TruthCert handoff and writeback
- Evidence Capsule export
- Editorial pack export with data seal
- Patient-facing summary and NNT curve
- PRISMA, GRADE, SoF, and publication-ready outputs
- Sensitivity battery, PET-PEESE, Copas, Baujat, influence diagnostics, GOSH
- Ghost protocol checking and living/sequential monitoring
- Provenance records on extracted studies

Still missing or only partially surfaced from the Finrenone workspace:
- Extraction-level verification progress bar and clearer verification coverage summary
- Reviewer lock and review handoff pack for dual-review workflows
- Main-workflow evidence-delta dashboard for registry/publication lag and concordance
- Living update watcher surfaced directly from linked NCT trials in the extraction/analyze workflow
- More explicit provenance-first submission view that pulls verification progress into export/readiness outputs

## Priority Order

### P1. Verification Progress Bar
Why first:
- Small, low-risk gap
- Direct carry-over from the Finrenone verification UX
- Improves extraction review and submission readiness immediately

Scope:
- Add a coverage progress bar to the extraction verification panel
- Show verified + needs-check as actionable coverage
- Keep linked-to-registry counts visible
- Add regression coverage

Status:
- Implemented in this round

### P2. Reviewer Lock + Review Handoff Pack
Why next:
- Finrenone has stronger reviewer-governance ideas than the current app
- Useful for real dual-review screening sessions

Scope:
- Reviewer identity claim/release
- Lightweight review lock to reduce accidental overwrite
- Export/import handoff bundle for queued screening work

### P3. Evidence Delta Panel
Why next:
- The current app has ghost checks and provenance, but not a first-class registry-publication concordance dashboard in the main workflow

Scope:
- Per-trial registry status
- Results-posted lag
- Publication-vs-registry endpoint match flags
- “Ghost result” and “publication without posted results” summaries

### P4. Living Update Watcher For Linked Trials
Why next:
- Fits the living-review model already present in the app
- Makes linked NCT trials operational rather than just documented

Scope:
- Re-check linked NCT IDs
- Flag newly posted results or status changes
- Feed the alerts into extraction/analyze readiness summaries

### P5. Submission Readiness Fusion
Why later:
- High value, but best done after verification and evidence-delta signals are first-class

Scope:
- Pull verification coverage and provenance completeness into paper/export readiness
- Add explicit submission-grade checklist items tied to actual data state

## Immediate Implementation Notes

Files touched in this round:
- `metasprint-autopilot.html`
- `validation/test_analysis_edge_cases.py`

Acceptance target for this round:
- Extraction verification panel renders a progress bar
- Coverage percentage is derived from current verification states
- Regression test protects the new UI contract
