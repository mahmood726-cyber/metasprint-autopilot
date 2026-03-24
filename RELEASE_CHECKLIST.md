# Release Checklist

## Status
- [x] README present
- [x] LICENSE present
- [x] Runtime manifests present (`package.json`, `package-lock.json`, `pyproject.toml`, `requirements.txt`)
- [x] Browser test tooling present (`@playwright/test`)
- [x] Validation/test suite present
- [x] Public remote configured
- [ ] Working tree cleaned for release
- [ ] Tag created and release notes finalized
- [ ] Zenodo DOI minted from tagged release

## Before Publishing
1. Remove or separate scratch/generated files from the release commit.
2. Run `python run_all_tests.py`.
3. Run `npx playwright test`.
4. Create a clean Git tag and GitHub release.
5. Mint the Zenodo DOI and update `CITATION.cff` if you want the archive DOI cited.
