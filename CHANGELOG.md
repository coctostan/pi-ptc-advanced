# Changelog

This changelog tracks notable release-facing changes for the personal `pi-ptc-next` fork.

## 0.8.0 — 2026-03-25

### Added
- Repo-local `verify:release-package` validation that builds the project and checks the `npm pack --dry-run` tarball surface.
- Repo-local `verify:ci` validation that chains the focused suite, the full test suite, and release-package verification.
- A verification-only GitHub Actions workflow at `.github/workflows/ci.yml`.
- A checked-in `LICENSE` file so the package surface now matches the declared MIT license metadata.
- Fork package metadata pointing at `coctostan/pi-ptc-next`.
- Personal-fork release documentation and maintainer guidance for the `0.8.0` baseline.

### Changed
- Package and project version markers are now aligned to `0.8.0`.
- `code_execution` continues to use the same active Pi tool implementations visible in chat, including the established hashline-native `read` / `grep` / `edit` interop path.
- The personal maintenance workflow now has four stable repo-local verification paths:
  - `npm run verify:personal`
  - `npm run verify:personal:full`
  - `npm run verify:ci`
  - `npm run verify:release-package`

### Highlights carried into this release baseline
- Active overridden builtin tools resolve through the same Pi executors the user sees in chat.
- Structured `details.ptcValue` payloads flow across the RPC boundary unchanged when active tools provide them.
- Python helper contracts and generated wrappers expose richer structured anchored result models for builtin tooling.
- Personal-fork maintenance is now the active operational path, while the old upstream PR-prep flow is archived as reference material only.

### Deferred / not included
- Release verification is now automated in CI, but automated tagging, publish automation, and git workflow automation are still not part of the repo-local workflow.
- The current dependency audit baseline remains unchanged at `0 critical / 2 high / 1 moderate / 1 low`.
- Bridge teardown when Pi exposes `getToolExecutor()` remains future work.
