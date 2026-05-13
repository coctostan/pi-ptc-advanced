---
phase: 59-readme-and-docs-polish
plan: 01
subsystem: docs
tags: [readme, release-docs, public-package, pi-ptc-advanced, 1.0.0, tdd]

requires:
  - phase: 58-public-identity-rename
    provides: public `pi-ptc-advanced@1.0.0` identity baseline (package metadata, release verifier, runbook title)

provides:
  - public-package README front door (Quick Start, Installation, Usage, Verification, Limitations, Development, Troubleshooting, License, Credits/lineage)
  - public release maintenance framing for `docs/personal-fork-maintenance.md` (filename preserved for compatibility)
  - bounded user-facing `docs/releases/1.0.0.md` with verification surface and explicit manual boundaries
  - Phase 59 release-readiness drift tests in `test/release-readiness.test.ts`

affects:
  - 60-final-release-gate (final publish checklist, release-note depth)
  - 61-repo-rename-and-migration-proof (manual GitHub rename to `coctostan/pi-ptc-advanced`)

tech-stack:
  added: []
  patterns:
    - "README opening path leads with product value + Quick Start + Installation before deep internals; Credits/lineage at bottom"
    - "Pre-publish install guidance uses Git source paths only; npm/pi registry install commands are gated behind confirmed publish"
    - "Phase 58 + Phase 59 docs-drift tests live in `test/release-readiness.test.ts` and use regex sections / heading anchors"

key-files:
  created:
    - .paul/phases/59-readme-and-docs-polish/59-01-PLAN.md
    - .paul/phases/59-readme-and-docs-polish/59-01-SUMMARY.md
  modified:
    - README.md
    - docs/personal-fork-maintenance.md
    - docs/releases/1.0.0.md
    - test/release-readiness.test.ts

key-decisions:
  - "Larger README rewrite (not a minimal section shuffle): Quick Start, Installation (Git source only), Usage, Verification, Limitations elevated above deep internals; Credits/lineage moved to bottom."
  - "Omit `npm install pi-ptc-advanced` and `pi install pi-ptc-advanced` registry-style commands until actual npm publish is user-confirmed."
  - "Preserve `docs/personal-fork-maintenance.md` filename and link compatibility while moving wording away from personal-fork-first framing."
  - "Treat 9 pre-existing `--experimental-transform-types` failures in `npm test` as Phase 59 plan boundary (Node-env mismatch), not a docs regression."

patterns-established:
  - "Pattern: release-readiness drift tests assert README section structure and ordering by regex anchors plus `readme.search(/^## .../m)` index comparisons."
  - "Pattern: pre-publish public package docs use `<pi-ptc-advanced source repo>` / `coctostan/pi-ptc-advanced` rename framing without claiming the rename, publish, tags, or release have happened."

duration: ~45min
started: 2026-05-13T22:30:00Z
completed: 2026-05-13T23:15:00Z
---

# Phase 59 Plan 01: README and Docs Polish Summary

**README rewritten into a public-package front door for `pi-ptc-advanced@1.0.0`, with maintainer runbook and 1.0 release note polished and guarded by new drift tests, while keeping `npm publish`, tags, GitHub releases, and the GitHub repo rename manual/user-owned.**

## Performance

| Metric | Value |
|--------|-------|
| Duration | ~45min |
| Started | 2026-05-13T22:30:00Z |
| Completed | 2026-05-13T23:15:00Z |
| Tasks | 3 completed |
| Files modified | 4 |

## Acceptance Criteria Results

| Criterion | Status | Notes |
|-----------|--------|-------|
| AC-1: README gives new users a coherent public package path | Pass | New `## Quick Start`, `## Installation`, `## Usage`, `## Verification`, `## Limitations`, plus existing `## Python helpers`, `## Environment variables`, `## Development`, `## Troubleshooting`, `## License`, and a moved-to-bottom `## Credits and lineage`; Phase 58 identity assertions still pass; ordering check (`Quick Start` before `Credits`/`Architecture`/`How it works`) green. |
| AC-2: Public docs avoid stale personal-fork/current-identity framing | Pass | README opening drops `## Personal fork maintenance`; runbook title is `# Public Release Maintenance`; opening 600 chars contain no `personal fork`; Installation no longer references `coctostan/pi-ptc-next`; no `npm install pi-ptc-advanced` / `pi install pi-ptc-advanced` / "available on npm" claims. |
| AC-3: Release and maintainer docs preserve manual boundaries | Pass | `docs/releases/1.0.0.md` Manual boundaries section names `npm publish`, dist-tags, git tags, GitHub releases, and the repo rename as manual/user-owned; new test forbids "has been published", "now available on the npm registry", "repository has been renamed", "repo rename complete", git-tag/GitHub-release publish claims across README/runbook/release note. |

## Module Execution Reports

### TODD (pre-plan + post-plan + APPLY)
| Phase | Commit | Status |
|-------|--------|--------|
| RED | local pre-commit | ✓ 4 Phase 59 docs-drift tests failed before Tasks 2-3 (missing required sections, `pi install pi-ptc-advanced` present, `## Personal fork maintenance` present, opening contained `personal fork`) |
| GREEN | `a0d61db` | ✓ 14/14 release-readiness tests pass after README + runbook + release-note edits |
| REFACTOR | n/a | ✓ docs-only scope; no test or runtime refactor required |

### WALT (post-apply quality)
| Metric | Result |
|--------|--------|
| `node --test test/release-readiness.test.ts` | 14/14 PASS |
| `npm run build` (`tsc`) | PASS |
| `bash scripts/verify-release-package.sh` | PASS — package metadata, `npm pack --dry-run` tarball surface, and clean-install proof for `pi-ptc-advanced@1.0.0` all green |
| `npm test` (full repo) | 248/257; 9 pre-existing `--experimental-transform-types` Node-environment failures (covered by Phase 59 plan boundary: "Local full `npm test` may fail under older local Node versions because some existing tests use `--experimental-transform-types`; do not treat that environment mismatch as a Phase 59 docs regression unless CI also fails.") |

### DEAN (pre-plan + post-apply)
| Metric | Result |
|--------|--------|
| `npm audit --json` | `0 critical / 0 high / 3 moderate / 0 low` — baseline unchanged from Phase 58; no override required. |

### DOCS / IRIS (advisory)
- README opening leads with product value, status note (`not yet on npm`), and Quick Start; `## Personal fork maintenance` heading removed from active doc copy; lineage retained near bottom.
- No stale `TODO`/`FIXME` introduced; pinned JSON payloads (`read`/`grep`/`edit`/`ast_search` `details.ptcValue` examples) preserved verbatim to keep Phase 58 contract tests green.
- Runbook title is `# Public Release Maintenance`; opening 600 chars do not lead with `Personal fork`; manual git/sync/upgrade boundary preserved.

### CODI / ARCH / GABE / LUKE / ARIA / DANA / OMAR / PETE / REED / VERA
- SKIPPED per pre-plan advisory dispatch — docs/test-only scope with no runtime architecture, API, UI, data schema, auth/privacy, observability, resilience, or performance-sensitive behavior.

### RUBY
- README size is ~1100 lines after rewrite (up from ~970). Active sections are now ordered for a public reader; deeper internals remain available but follow the new opening path. No source-code refactor performed.

## Accomplishments

- Rewrote the README into a public package front door with explicit Quick Start, Installation (Git source only, no premature `npm install pi-ptc-advanced` / `pi install pi-ptc-advanced` commands), Usage, Verification, and Limitations sections before deep internals.
- Moved `## Credits and lineage` to the bottom of the README while keeping upstream and `coctostan/pi-ptc-next` lineage intact.
- Removed the active `## Personal fork maintenance` section from the README and re-titled `docs/personal-fork-maintenance.md` framing to public release maintenance while preserving the existing filename for link compatibility.
- Expanded `docs/releases/1.0.0.md` from a stub into a user-facing 1.0 release note with verification surface and an explicit Manual boundaries section that does not claim publish/tags/releases/repo rename occurred.
- Added 7 Phase 59 release-readiness drift tests to guard README section structure and ordering, no premature npm/pi registry install commands, no `## Personal fork` heading or lead-paragraph framing, no claims that publish/tags/releases/rename happened, runbook public-release title, and release-note verification/rename references.

## Task Commits

Phase 59 used a single docs-polish commit because all three tasks land in the same docs surface and were verified together:

| Task | Commit | Type | Description |
|------|--------|------|-------------|
| Task 1: Extend release-readiness docs drift tests (RED first) | `a0d61db` | test | Added 7 new Phase 59 tests to `test/release-readiness.test.ts`; verified RED before docs edits. |
| Task 2: Restructure README into a public package front door | `a0d61db` | docs | Rewrote opening 64 lines into a public Quick Start/Installation/Usage/Verification/Limitations path, removed `## Personal fork maintenance`, moved Credits/lineage to bottom. |
| Task 3: Polish maintainer runbook and 1.0 release note | `a0d61db` | docs | Polished `docs/personal-fork-maintenance.md` heading/wording away from personal-fork-first framing; rewrote `docs/releases/1.0.0.md` into a user-facing release note with explicit manual boundaries. |

## Files Created/Modified

| File | Change | Purpose |
|------|--------|---------|
| `README.md` | Modified | Public-package front door rewrite (opening path + Credits moved to bottom). |
| `docs/personal-fork-maintenance.md` | Modified | Polished headings/wording to public release maintenance framing while preserving manual git boundary. |
| `docs/releases/1.0.0.md` | Modified | Expanded to user-facing release note with verification surface and explicit manual boundaries. |
| `test/release-readiness.test.ts` | Modified | Added 7 Phase 59 docs-drift assertions (RED-first, then GREEN). |
| `.paul/phases/59-readme-and-docs-polish/59-01-PLAN.md` | Created | Approved plan executed in this phase. |
| `.paul/phases/59-readme-and-docs-polish/59-01-SUMMARY.md` | Created | This reconciliation artifact. |

## Decisions Made

| Decision | Rationale | Impact |
|----------|-----------|--------|
| Larger README rewrite vs minimal shuffle | User clarification during PLAN refinement; the existing opening still framed the package as a personal fork. | README now reads as a public package README; future docs phases can iterate on tone without re-routing the entry path. |
| No `npm install pi-ptc-advanced` / `pi install pi-ptc-advanced` registry commands yet | Actual `npm publish` is not user-confirmed for `pi-ptc-advanced@1.0.0`. | Avoids advertising an install path that does not yet work; Phase 60/61 can re-introduce a registry block once publish is confirmed. |
| Keep `docs/personal-fork-maintenance.md` filename | Preserves existing inbound links and CI references. | Filename remains; content/title moved to public release maintenance framing. |
| Preserve historical `pi-ptc-next` references in Credits, CHANGELOG, and historical release notes | Phase 58/59 explicitly scope lineage as historical; rewriting old release notes would erase prior identity. | Stale-slug test (`coctostan/pi-ptc-next` in Installation) was kept satisfied by removing the stale slug from the Installation section only; lineage remains intact below. |

## Deviations from Plan

### Summary

| Type | Count | Impact |
|------|-------|--------|
| Auto-fixed | 1 | Initial wholesale rewrite removed pinned README content; restored and applied surgical edits instead. |
| Scope additions | 0 | — |
| Deferred | 0 | — |

**Total impact:** Minor — Phase 59 stayed within plan boundaries; one APPLY-time correction was required to keep Phase 58 contract tests green.

### Auto-fixed Issues

**1. README rewrite preserved pinned `details.ptcValue` payloads and helper guidance**
- **Found during:** Task 2 (README restructure) — full repository test run.
- **Issue:** The first README rewrite replaced the entire file with a leaner public README, which inadvertently removed JSON payload blocks, README orchestration/handle/callable-tool/sg guidance, and `## Personal fork maintenance` framing in one pass. 9 Phase 58 contract tests then failed (`README read/grep/edit/sg example exactly matches the normalized live payload`, `README orchestration helper guidance...`, `README callable-tool introspection guidance...`, `README handle-helper guidance...`).
- **Fix:** Restored the original README from `HEAD`, then applied two surgical edits — `replace_lines` on the opening (1–64) for the new front door, and a targeted `replace_lines` on the License section to move Credits/lineage to the bottom. All pinned JSON payloads and helper-guidance prose were preserved verbatim.
- **Files:** `README.md`.
- **Verification:** `node --test test/release-readiness.test.ts` 14/14 PASS; `npm test` 248/257 with the remaining 9 failures all caused by the pre-existing `--experimental-transform-types` Node-environment mismatch (covered by plan boundary).
- **Commit:** `a0d61db` (single squash for the phase).

### Deferred Items

None — plan executed as written.

## Issues Encountered

| Issue | Resolution |
|-------|------------|
| Local `npm test` reports 9 failures using `node --experimental-transform-types` against the locally installed Node version. | Confirmed identical failures on the unmodified baseline (`git stash` round-trip); treated as Phase 59 plan boundary (Node-env mismatch, not a docs regression). CI on the PR is the authoritative signal. |

## Next Phase Readiness

**Ready:**
- Phase 60 (final release gate) can build on a public-package-shaped README, a polished runbook, and a verification-surfaced 1.0 release note.
- Phase 61 (repo rename and migration proof) inherits explicit `coctostan/pi-ptc-advanced` framing throughout active docs.

**Concerns:**
- Local `npm test` will continue to surface 9 `--experimental-transform-types` failures on older local Node versions until either tests are migrated off `--experimental-transform-types` or local Node is bumped; Phase 60 should decide whether to treat this as in scope.
- README size continues to grow (~1100 lines); future docs phases should prefer focused companion files or section extraction before further inline growth.

**Blockers:**
- None.

---
*Phase: 59-readme-and-docs-polish, Plan: 01*
*Completed: 2026-05-13*
