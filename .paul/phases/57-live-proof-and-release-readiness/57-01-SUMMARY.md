---
phase: 57-live-proof-and-release-readiness
plan: 01
subsystem: release-runtime-hardening
tags: [code_execution, python-runtime, live-audit, release, ptc.list_helpers, 0.18.0]
requires:
  - phase: 54-runner-availability-and-command-reporting
    provides: ptc.run_tests runner availability and shell-quoted command metadata
  - phase: 55-callable-wrapper-contract-consistency
    provides: explicit async callable wrapper contract and grep positional shorthand
  - phase: 56-result-normalization-and-partial-error-semantics
    provides: path normalization, read_many partial envelopes, and batch_tool collect-mode classification
provides:
  - live-audit closeout for helper edge cases 1, 4, 5, 8, and 9
  - curated ptc.list_helpers() helper inventory
  - 0.18.0 release baseline and verification artifacts
affects:
  - future runtime helper changes
  - release readiness and manual publish workflows
tech-stack:
  added: []
  patterns:
    - deterministic literal helper inventory for Python-side ptc.* helper discovery
    - release-readiness drift tests as version/doc/script alignment guards
key-files:
  created:
    - docs/releases/0.18.0.md
  modified:
    - src/python-runtime/runtime.py
    - test/live-audit-helpers.test.ts
    - src/index.ts
    - README.md
    - CHANGELOG.md
    - docs/issues/2026-05-13-code-execution-helper-edge-cases.md
    - package.json
    - package-lock.json
    - scripts/verify-release-package.sh
    - test/release-readiness.test.ts
    - docs/personal-fork-maintenance.md
key-decisions:
  - "Ship ptc.list_helpers() as a public helper inventory complement to ptc.list_callable_tools()."
  - "Keep details.ptcValue guidance in README, not generated code_execution text, to preserve existing prompt-description tests and Pi prompt-injection boundaries."
  - "Leave .paul/dean-baseline.json untouched but document that 0.18.0 materially supersedes the old dependency-risk posture."
patterns-established:
  - "Future helper inventory additions should update the literal runtime inventory, README, generated tool description, and live-audit tests together."
  - "Release-baseline bumps must keep package metadata, verify script, release notes, CHANGELOG, README, maintainer docs, and release-readiness tests aligned."
duration: carried from APPLY session
started: 2026-05-13T17:27:39Z
completed: 2026-05-13T18:26:00Z
---

# Phase 57 Plan 01: Live Proof and Release Readiness Summary

Phase 57 closed Milestone 19 by converting the remaining live-audit helper edge cases into regression proof, shipping the bounded `ptc.list_helpers()` helper inventory, and cutting the verifiable `pi-ptc-advanced@0.18.0` release baseline.

## Performance

| Metric | Value |
|--------|-------|
| Duration | Carried from APPLY session |
| Started | 2026-05-13T17:27:39Z |
| Completed | 2026-05-13T18:26:00Z |
| Tasks | 4 completed |
| Files modified | 15 changed vs `origin/main...HEAD` |

## Acceptance Criteria Results

| Criterion | Status | Notes |
|-----------|--------|-------|
| AC-1: Live regression proof covers remaining helper edge cases | PASS | `test/live-audit-helpers.test.ts` now includes issue-numbered tests for issues 1, 4, 5, 8, and 9. Focused APPLY evidence: `node --test test/live-audit-helpers.test.ts` passed 29/29 after implementation. |
| AC-2: Prompt and docs clarify async/sync split, callable-vs-helper distinction, and ptcValue boundary | PASS with documented boundary deviation | README and `src/index.ts` agree on async callable wrappers, `ptc.list_callable_tools()` vs `ptc.list_helpers()`, and `ptc.run_tests` environment dependence. The `details.ptcValue` callout was kept in README only to preserve the existing generated-description invariant. |
| AC-3: 0.18.0 release baseline is verifiable end-to-end | PASS | `package.json`, `package-lock.json`, `scripts/verify-release-package.sh`, CHANGELOG, release notes, README, maintainer docs, and release-readiness tests now target `0.18.0`. APPLY evidence: `npm run build` and `bash scripts/verify-release-package.sh` passed; local `npm test` had 241 pass / 9 pre-existing Node 26 transform-type environment failures, while PR CI passed. |

## Module Execution Reports

### Pre-UNIFY Dispatch

`[dispatch] pre-unify: 0 modules registered for this hook` — installed `modules.yaml` has post-unify hooks but no pre-unify hooks.

### WALT — Quality History

| Evidence | Result |
|----------|--------|
| APPLY local `npm test` | 241 passing / 9 failing; failures classified in APPLY handoff as pre-existing Node 26 `--experimental-transform-types` environment failures, no new regressions |
| APPLY `npm run build` | PASS |
| APPLY `bash scripts/verify-release-package.sh` | PASS against `0.18.0` baseline |
| PR #14 CI | GitHub Actions `Verify release baseline` and Socket checks SUCCESS |

Post-unify side effect: appended `.paul/quality-history.md` row for Phase 57 with the APPLY quality evidence and stable release-gate trajectory.

### CODI — Blast Radius History

CODI post-unify classified the Phase 57 plan as `injected-degraded`: the PLAN contains CODI pre-plan blast-radius prose for `list_callable_tools`, `run_tests`, and `read_many`, but no canonical R/U/K success-count line survived in the plan artifact.

Post-unify side effect: appended `.paul/CODI-HISTORY.md` row for `57-01`.

### RUBY — Debt Review

| File | Finding | Status |
|------|---------|--------|
| `src/python-runtime/runtime.py` | 1601 lines after a +97 line additive helper-inventory change | WARN — existing hotspot; no refactor was in scope |
| `README.md` | 965 lines | WARN — existing documentation hotspot; additions were bounded |
| `src/index.ts` | 544 lines | WARN — existing entrypoint hotspot; generated-description edit stayed minimal |
| `test/live-audit-helpers.test.ts` | 586 lines after focused live-audit additions | WARN — future helper proof should consider focused companion tests if this file keeps growing |

RUBY remains advisory. The bounded runtime growth exceeded the plan's `~40 lines` target for `list_helpers()` alone but stayed additive and did not perform extraction/refactor work.

### SKIP — Knowledge Capture

Captured durable knowledge in this SUMMARY instead of a separate persistence file:

- `ptc.list_helpers()` is now the curated `ptc.*` helper inventory, distinct from live callable-tool introspection via `ptc.list_callable_tools()`.
- `details.ptcValue` callable-boundary guidance remains README-only; generated `code_execution` description deliberately avoids that phrase to preserve prompt-description tests and Pi-side prompt-injection boundaries.
- `.paul/dean-baseline.json` remains historical acknowledgement evidence, while the 0.18.0 release documents the materially improved audit posture (`0 critical / 0 high / 3 moderate / 0 low`).

## Accomplishments

- Added focused live-audit regression coverage for the remaining helper edge cases: runner availability/command quoting, helper-vs-callable discovery, positional wrapper behavior, `details.ptcValue` override preservation, and async wrapper misuse.
- Added `ptc.list_helpers()` as a deterministic JSON-safe helper inventory and documented how it differs from `ptc.list_callable_tools()`.
- Updated README and generated `code_execution` guidance for async callable wrappers, sync/async helper signatures, helper inventory discovery, and `ptc.run_tests` runtime dependence.
- Reconciled all 10 live-audit issue-note items with explicit Closed / Documented status.
- Cut the `0.18.0` package, lockfile, verification script, CHANGELOG, release note, README, maintainer-doc, and release-readiness-test baseline.
- Preserved the manual publish boundary: no npm publish, no tag creation, and no GitHub release automation.

## Task Commits

| Task | Commit | Type | Description |
|------|--------|------|-------------|
| Plan metadata | `95df188` | plan | Created approved Phase 57 TDD plan. |
| Tasks 1-4 | `73d2c19` | apply | Implemented live-audit closeout, `ptc.list_helpers()`, docs, and `0.18.0` release artifacts. |
| APPLY lifecycle | `fa91a11` | state | Marked APPLY complete and routed to UNIFY. |

## Files Created/Modified

| File | Change | Purpose |
|------|--------|---------|
| `.paul/phases/57-live-proof-and-release-readiness/57-01-PLAN.md` | Created | Approved execution prompt for the phase. |
| `test/live-audit-helpers.test.ts` | Modified | Added issue-numbered regression coverage for issues 1, 4, 5, 8, and 9. |
| `src/python-runtime/runtime.py` | Modified | Added literal helper inventory, `ptc.list_helpers()`, and bounded positional-wrapper post-processing. |
| `README.md` | Modified | Documented async wrappers, helper inventory distinction, `ptcValue` boundary, and 0.18.0 release baseline. |
| `src/index.ts` | Modified | Aligned generated `code_execution` description with helper/runtime guidance. |
| `CHANGELOG.md` | Modified | Added dated 0.18.0 release section and audit-posture improvement. |
| `docs/releases/0.18.0.md` | Created | Standalone 0.18.0 release notes. |
| `docs/issues/2026-05-13-code-execution-helper-edge-cases.md` | Modified | Added per-issue Phase 57 resolution status. |
| `package.json` / `package-lock.json` | Modified | Bumped package baseline to `0.18.0`. |
| `scripts/verify-release-package.sh` | Modified | Updated release-package assertions to `0.18.0`. |
| `test/release-readiness.test.ts` | Modified | Refreshed drift guards for the 0.18.0 baseline. |
| `docs/personal-fork-maintenance.md` | Modified | Repointed maintainer guidance to 0.18.0. |
| `.paul/STATE.md` / `.paul/ROADMAP.md` | Modified | Recorded lifecycle progress through APPLY; finalized during UNIFY. |

## Decisions Made

| Decision | Rationale | Impact |
|----------|-----------|--------|
| Ship `ptc.list_helpers()` as a public helper inventory | Live-audit issue 4 showed models need a runtime way to distinguish callable Pi tools from curated `ptc.*` helpers. | Future helper additions must update inventory/docs/tests in lockstep. |
| Keep `details.ptcValue` callout out of generated `code_execution` description | Existing `test/index.test.ts` asserts the generated description does not contain `details.ptcValue`; changing that would widen Pi prompt-injection behavior beyond the plan boundary. | README remains the durable user-facing contract for this edge case; generated guidance stays concise. |
| Leave `.paul/dean-baseline.json` untouched | The old Phase 48 acknowledgement remains historical evidence even though current audit counts improved. | CHANGELOG/release notes document the materially superseded posture without rewriting prior acknowledgement artifacts. |
| Preserve manual publish boundary | Phase 57 is release readiness, not publication. | No tags, `npm publish`, or GitHub release automation were performed. |

## Deviations from Plan

### Summary

| Type | Count | Impact |
|------|-------|--------|
| Scope additions | 3 | Necessary release-baseline drift guards and maintainer docs changed beyond the plan frontmatter. |
| Documented boundary deviations | 2 | `details.ptcValue` generated-description omission and runtime.py growth over the small-line target were explicitly recorded. |
| Deferred | 1 | Runtime hotspot refactor remains future work. |

**Total impact:** Bounded release-readiness expansion; no public API removal, no publish automation, and no broad refactor.

### Scope Additions

1. `test/release-readiness.test.ts` was updated because the durable release-baseline drift suite must follow the 0.18.0 bump.
2. `docs/personal-fork-maintenance.md` was updated so maintainer guidance no longer points at the 0.17.0 baseline.
3. README received both helper-contract edits and release-baseline alignment edits.

### Boundary Deviations

1. The generated `code_execution` description does not include the literal `details.ptcValue` callout from AC-2; README carries it instead to preserve the existing generated-description invariant.
2. `src/python-runtime/runtime.py` grew by about 97 lines rather than the `~40 lines` target because the implementation included the literal inventory plus post-processing wrappers for positional consistency. This is advisory debt, not a blocker.

### Deferred Items

- Future milestone: consider extracting or reorganizing `src/python-runtime/runtime.py` if helper additions continue; it is now 1601 lines and remains an IRIS/RUBY hotspot.

## Issues Encountered

| Issue | Resolution |
|-------|------------|
| Local `npm test` on the APPLY host reported 9 Node 26 transform-type environment failures. | Classified during APPLY as pre-existing environment-only failures; `npm run build`, release-package verification, focused helper tests, and PR #14 CI all passed. |
| `details.ptcValue` generated-description requirement conflicted with an existing test invariant. | Kept the callout in README only and documented the deviation in this SUMMARY and release notes. |
| Runtime helper inventory implementation exceeded the small line-budget target. | Accepted as bounded additive work; no extraction/refactor performed in Phase 57. |

## Next Phase Readiness

**Ready:**
- Milestone 19 `0.18.0` release baseline is prepared and verified.
- Live-audit issue note is reconciled for all 10 items.
- PR #14 is open with CI passing and ready for the GitHub Flow merge gate.

**Concerns:**
- `src/python-runtime/runtime.py`, `README.md`, `src/index.ts`, and `test/live-audit-helpers.test.ts` remain debt hotspots by size.
- Local Node 26 test-runner behavior remains noisier than CI; CI is the release gate for the current baseline.

**Blockers:**
- None for UNIFY or Milestone 19 closure.

---
*Phase: 57-live-proof-and-release-readiness, Plan: 01*
*Completed: 2026-05-13*
