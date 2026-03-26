---
phase: 27-result-kind-assertions
plan: 01
subsystem: kernel
tags: [ptc, python, result-kind, runtime, code_execution, testing]
requires:
  - phase: 26-python-helpers-proof-and-docs
    provides:
      - bounded Python helper surface in `src/python-runtime/runtime.py`
      - execution-level proof pattern for focused runtime helper tests
provides:
  - strict Python-side kind assertion via `ptc.expect_kind(value, kind)`
  - clear expected-vs-actual top-level kind failures for missing and mismatched kinds
  - dedicated runtime proof in `test/result-kind-helper.test.ts`
affects:
  - 28-python-tool-introspection
  - 29-proof-and-docs
tech-stack:
  added: []
  patterns:
    - "Keep Python-side result-kind assertions bounded to the top-level `kind` field instead of introducing broader schema validation"
    - "Use a dedicated focused runtime helper test when extending Python ergonomics instead of growing the already-large `test/code-executor.test.ts` further"
key-files:
  created:
    - test/result-kind-helper.test.ts
  modified:
    - src/python-runtime/runtime.py
key-decisions:
  - "Decision: Restrict `ptc.expect_kind` to top-level kind checks with clear ValueError messages instead of building a general validation DSL"
  - "Decision: Prove the helper in a new focused runtime test file rather than adding more debt to `test/code-executor.test.ts`"
patterns-established:
  - "Result-kind checks in Python should fail with explicit expected-vs-actual messages and otherwise return the original structured value unchanged"
duration: ~25min
started: 2026-03-26T12:53:50Z
completed: 2026-03-26T13:19:07Z
---

# Phase 27 Plan 01: Result-Kind Assertions Summary

**`pi-ptc-next` now exposes a strict Python-side `ptc.expect_kind(value, kind)` helper that preserves matching structured values, fails clearly for missing or wrong top-level kinds, and is proven inside the live `code_execution` runtime with a dedicated focused test file.**

## Performance

| Metric | Value |
|--------|-------|
| Duration | ~25 minutes |
| Started | 2026-03-26T12:53:50Z |
| Completed | 2026-03-26T13:19:07Z |
| Tasks | 2 completed |
| Files modified | 2 |

## Acceptance Criteria Results

| Criterion | Status | Notes |
|-----------|--------|-------|
| AC-1: Matching kinds pass through unchanged | Pass | `ptc.expect_kind(value, kind)` now returns the original structured dict unchanged when the top-level `kind` string matches the requested kind. |
| AC-2: Wrong or missing kinds fail clearly | Pass | The runtime raises bounded `ValueError` messages for blank expected kinds, missing/non-string top-level `kind` values, and mismatches such as `Expected kind 'response', got 'file'`. |
| AC-3: The helper is proven in the real `code_execution` runtime without broadening scope | Pass | Added `test/result-kind-helper.test.ts` and verified matching, mismatched, and missing-kind behavior through the real `CodeExecutor`, while existing `test/code-executor.test.ts` coverage still passes. |

## Verification Results

| Command | Result |
|---------|--------|
| `python3 -m py_compile src/python-runtime/runtime.py` | Pass |
| `npm run build` | Pass |
| `node --test test/result-kind-helper.test.ts test/code-executor.test.ts` | Pass (`8` passing / `0` failing) |
| `npm test` | Pass (`115` passing / `0` failing) |
| `npm audit --json` | Baseline unchanged at `0 critical / 2 high / 2 moderate / 1 low` |

## Module Execution Reports

### Apply-phase carried evidence
- **WALT:** Final verification is green: `python3 -m py_compile src/python-runtime/runtime.py`, `npm run build`, targeted runtime tests (`8` passing / `0` failing), and full `npm test` (`115` passing / `0` failing).
- **TODD:** The phase followed the plan's bounded proof strategy by adding `test/result-kind-helper.test.ts` instead of extending the already-large `test/code-executor.test.ts` beyond the adjacent coverage needed for regression safety.
- **DEAN:** Dependency audit remains non-blocking and unchanged at `0 critical / 2 high / 2 moderate / 1 low`.

### Pre-unify
- No modules are registered for `pre-unify` in the installed registry.

### Post-unify side effects
- **WALT:** Recorded Phase 27 in `.paul/quality-history.md` as improved: `115` passing / `0` failing via `npm test`, typecheck/build clean via `npm run build`.
- **RUBY:** Fallback debt review found no new debt hotspots in the changed files. `src/python-runtime/runtime.py` is `299` lines and `test/result-kind-helper.test.ts` is `141` lines, so both remain within the soft thresholds. The ad hoc ESLint complexity invocation was unavailable under the current CLI, so the post-unify review fell back to file-size inspection.
- **SKIP:** Captured durable knowledge from this phase:

## [2026-03-26] Restrict Python result-kind assertions to top-level `kind` checks

**Type:** decision
**Phase:** 27 — Result-Kind Assertions
**Related:** `src/python-runtime/runtime.py`, `test/result-kind-helper.test.ts`

**Context:** Phase 27 needed a practical Python helper for models to assert result kinds explicitly without drifting into a general validation system or changing existing tool result envelopes.

**Decision:** Implement `ptc.expect_kind(value, kind)` as a small helper that inspects only the top-level `kind` field, returns the original value unchanged on success, and raises clear `ValueError` messages for blank expected kinds, missing/non-string kinds, and mismatches.

**Alternatives considered:**
- Add recursive shape validation for nested payloads — rejected because it would broaden the helper into an unplanned validation framework.
- Introduce new normalized result envelopes for kind-tagged values — rejected because earlier milestones intentionally preserved existing tool result shapes.

**Rationale:** The top-level `kind` contract is enough to make model-written follow-up logic safer while keeping the runtime change reviewable and aligned with Milestone 11's bounded ergonomics goal.

**Impact:** Future Python-side helpers should layer on this narrow contract instead of inventing broader schema machinery unless a later milestone explicitly expands scope.

## [2026-03-26] Prefer dedicated focused runtime helper tests for bounded Python ergonomics changes

**Type:** lesson
**Phase:** 27 — Result-Kind Assertions
**Related:** `test/result-kind-helper.test.ts`, `test/code-executor.test.ts`

**What happened:** The phase added runtime proof for `ptc.expect_kind` in a new focused test file while retaining the existing CodeExecutor test file only as adjacent regression coverage.

**What we learned:** Small dedicated runtime helper tests keep proof readable and avoid compounding debt in already-large integration-oriented test files.

**How to apply:** Future bounded Python helper slices should default to new focused `node:test` files unless broader existing integration coverage must change for a concrete reason.

## Accomplishments

- Added a strict Python-side `ptc.expect_kind(value, kind)` helper to the runtime helper surface.
- Locked the helper to top-level `kind` inspection with explicit missing-kind and wrong-kind error messages.
- Added a dedicated live-runtime proof file covering matching, mismatched, and missing-kind paths.
- Re-ran targeted and full verification to confirm the helper lands without broadening runtime scope or regressing existing CodeExecutor behavior.

## Task Commits

No task-level git commits were created during this phase.
Work remained as local working-tree changes on `feat/hashline-native-interop`, and reconciliation relied on the executed plan, file inspection, and verification output.

## Files Created/Modified

| File | Change | Purpose |
|------|--------|---------|
| `src/python-runtime/runtime.py` | Modified | Adds the bounded `ptc.expect_kind(value, kind)` runtime helper and exposes it through `_PtcHelpers`. |
| `test/result-kind-helper.test.ts` | Created | Proves matching, mismatched, and missing-kind behavior inside the live `CodeExecutor` runtime with deterministic local fixtures. |

## Decisions Made

| Decision | Rationale | Impact |
|----------|-----------|--------|
| Restrict `ptc.expect_kind` to top-level `kind` checks only | Keeps Phase 27 narrow and avoids sliding into a general validation DSL. | Future kind-aware Python logic now has a clear minimal assertion primitive without changing tool result shapes. |
| Add a new focused runtime helper test file instead of growing `test/code-executor.test.ts` | The existing CodeExecutor test file is already large, and the plan explicitly preferred a dedicated proof file. | Future helper slices have a cleaner pattern for targeted execution-level proof. |

## Deviations from Plan

### Summary

| Type | Count | Impact |
|------|-------|--------|
| Auto-fixed | 0 | None |
| Scope additions | 0 | None |
| Deferred | 0 | None |

**Total impact:** None. The plan executed as written.

### Auto-fixed Issues

None.

### Deferred Items

None — this phase intentionally stayed out of tool-introspection and documentation work reserved for Phases 28-29.

## Issues Encountered

| Issue | Resolution |
|-------|------------|
| The working-tree diff for `src/python-runtime/runtime.py` also contains earlier uncommitted helper additions from Phase 26, so a raw diff against `HEAD` does not isolate only the Phase 27 hunk. | Reconciliation was anchored to the executed plan, current file inspection, and targeted verification rather than relying on raw file-level diff shape alone. |
| `npm audit --json` still exits non-zero because the repo retains the known dependency baseline. | Recorded the unchanged baseline honestly in the summary and state rather than treating it as a new regression. |

## Next Phase Readiness

**Ready:**
- Python code can now assert structured result kinds explicitly with `ptc.expect_kind(value, kind)`.
- The runtime has a focused proof pattern for future bounded helper slices.
- Phase 28 can build tool-introspection helpers on top of a clearer result-kind assertion primitive.

**Concerns:**
- `src/python-runtime/runtime.py` is now close to the 300-line soft debt threshold and should stay bounded as Phase 28 adds more helper surface.
- The dependency audit baseline remains non-zero at `0 critical / 2 high / 2 moderate / 1 low`.

**Blockers:**
- None

---
*Phase: 27-result-kind-assertions, Plan: 01*
*Completed: 2026-03-26*
