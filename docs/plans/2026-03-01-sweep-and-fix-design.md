# Sweep-and-Fix Design — MetaSprint Autopilot

**Date**: 2026-03-01
**Approach**: A — Parallel bug fixes, test expansion, publication polish
**Baseline**: 27,605 lines, 228/228 Playwright tests pass, 788/750 div imbalance

## Bug Fixes (Structural Integrity)

### 1. Div imbalance (+38)
- 788 `<div` opens vs 750 `</div>` closes
- Many opens are likely inside JS template literals (innerHTML)
- Audit: separate HTML-section divs from JS-string divs
- Fix any genuine structural mismatches

### 2. Event listener cleanup
- Audit addEventListener vs removeEventListener ratio
- Modal/overlay dismiss must remove keydown/keyup listeners
- Dialog Escape handlers must clean up

### 3. JS safety patterns
- `|| fallback` on numeric values → `?? fallback` (drops valid zero)
- `parseFloat(x) || null` → `isFinite()` check (drops 0.0)
- Float `===` comparison → tolerance-based

### 4. Hardcoded z=1.96
- All CI calculations must use confLevel-aware critical values
- Check for literal 1.96 or 1.645 in statistical functions

## Test Expansion (~15-20 new Playwright tests)

### 5. Write tab tests (3-4 new)
- Paper generation produces valid content
- PICO fields populate into generated text
- Export markdown produces downloadable content

### 6. Error condition tests (4-5 new)
- Empty study set shows guidance (not crash)
- Mixed effect types shows actionable error
- Invalid CI (lower > upper) shows warning
- Single study (k=1) runs without crash

### 7. Edge case tests (3-4 new)
- Zero events in both arms handled correctly
- k=2 minimum for heterogeneity
- Very large effect sizes don't break rendering

## Publication Polish

### 8. Manuscript number sync
- Line count: 12,357 → 27,605
- Test count: update to reflect current suite
- Feature count: update for new methods (NMA, DTA, dose-response)
- Function count: recount

### 9. Abstract word count
- PLOS ONE limit: 300 words
- Current abstract is very long — may need trimming

### 10. Reference check
- Sequential numbering [1]-[N]
- All references cited in text
- No orphan references

## Success Criteria
- Zero div imbalance (or documented JS-string exceptions)
- 245+ Playwright tests, all passing
- Manuscript numbers match actual codebase
- Abstract <= 300 words
- Zero hardcoded z=1.96 in statistical functions
