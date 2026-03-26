---
phase: 30-core-orchestration-primitives
plan: 01
subsystem: python-runtime
completed: 2026-03-26T15:09:01Z
duration: ~8min
tags: [ptc, python-runtime, orchestration, code_execution]
provides:
  - bounded Python orchestration helpers via `ptc.batch_tool(...)` and `ptc.first_success(...)`
  - shared runtime-local call-spec validation for nested tool orchestration
  - focused execution-level proof for ordering, bounded concurrency, and bounded fallback failures
---

# Phase 30 Plan 01: Core Orchestration Primitives Summary

**Phase 30 is complete:** `pi-ptc-next` now exposes bounded Python-side orchestration helpers for small nested tool workflows. `ptc.batch_tool(...)` executes validated call specs with stable input ordering and capped concurrency, while `ptc.first_success(...)` provides ordered fallback execution with compact aggregate failure reporting.

## Performance

| Metric | Value |
|--------|-------|
| Duration | ~8 minutes |
| Started | 2026-03-26T15:01:26Z |
| Completed | 2026-03-26T15:09:01Z |
| Tasks | 3 completed |
| Files modified | 2 product files + PALS artifacts |

## What Was Built

| File | Purpose | Lines |
|------|---------|-------|
| `src/python-runtime/runtime.py` | Adds shared orchestration call-spec validation, bounded `max_concurrency` normalization, `ptc.batch_tool(...)`, and ordered `ptc.first_success(...)`. | 417 |
| `test/orchestration-helper.test.ts` | Proves stable result ordering, bounded concurrency, ordered fallback semantics, aggregate failure messages, and invalid-input rejection through real `CodeExecutor` execution. | 280 |

## Acceptance Criteria Results

| Criterion | Status | Notes |
|-----------|--------|-------|
| AC-1: Python can batch bounded nested tool calls through a shared helper | Pass | `ptc.batch_tool(...)` validates a non-empty sequence of `{tool, params}` call specs, defaults missing params to `{}`, clamps concurrency through the existing helper limit path, and returns nested call results in input order. |
| AC-2: Python can try multiple candidate calls and return the first successful result with clear failure behavior | Pass | `ptc.first_success(...)` tries candidates in order, returns immediately on the first success, and raises a bounded `ValueError` summarizing attempted tool calls when every candidate fails. |
| AC-3: Phase 30 stays narrowly scoped to core orchestration primitives | Pass | The implementation stayed inside `runtime.py` plus a dedicated focused test file; reducers, output-budget helpers, `parallel_map(...)`, README updates, and broader orchestration APIs remain deferred to later phases. |

## Verification Results

| Command | Result |
|---------|--------|
| `python3 -m py_compile src/python-runtime/runtime.py` | Pass |
| `npm run build` | Pass |
| `node --test test/orchestration-helper.test.ts` | Pass (`4` passing / `0` failing) |
| `npm test` | Pass (`123` passing / `0` failing) |
| `npm audit --json` | Baseline unchanged at `0 critical / 2 high / 2 moderate / 1 low` |

## Module Execution Reports

### Apply-phase carried evidence
- **WALT:** Runtime verification stayed green for the shipped helper slice: Python compilation passed, `npm run build` passed, the dedicated orchestration-helper suite passed (`4` passing / `0` failing), and the full suite passed at `123` passing / `0` failing.
- **TODD:** Proof stayed isolated in a dedicated execution-level file (`test/orchestration-helper.test.ts`) rather than expanding the larger omnibus runtime suites.
- **DEAN:** Dependency audit baseline remained unchanged and non-blocking at `0 critical / 2 high / 2 moderate / 1 low`.

### Pre-unify
- No modules are registered for `pre-unify` in the installed registry.

### Post-unify side effects
- **WALT:** Phase 30 was recorded in `.paul/quality-history.md` as improved from the prior `119` passing baseline to `123` passing / `0` failing via `npm test`, with typecheck/build remaining clean via `npm run build`.
- **RUBY:** No no-config ESLint complexity findings were reported for `test/orchestration-helper.test.ts`. `src/python-runtime/runtime.py` is now `417` lines, so future helper additions should continue favoring compact focused helpers over broader runtime expansion.
- **SKIP:** Captured durable knowledge from this phase:

## [2026-03-26] Keep orchestration call specs bounded to `{tool, params}` in the Python runtime

**Type:** decision  
**Phase:** 30 — Core Orchestration Primitives  
**Related:** `src/python-runtime/runtime.py`, `test/orchestration-helper.test.ts`

**Context:** Phase 30 needed a small orchestration surface for nested tool calls without introducing a larger DSL, secondary registry, or loosely shaped ad-hoc payload contract.

**Decision:** Standardize Phase 30 orchestration inputs on a non-empty sequence of objects containing a non-empty `tool` string and optional object `params`, and validate that shape inside `runtime.py` before dispatching nested tool calls.

**Alternatives considered:**
- Introduce a broader orchestration DSL with extra routing or reducer fields — rejected because Phase 30 only needed two narrow helpers and a larger schema would expand scope before the basic runtime contract was proven.
- Reuse raw `_rpc_call(...)` signatures directly from user code with no shared normalization — rejected because it would preserve repetitive low-level plumbing and leave input validation inconsistent across helpers.

**Rationale:** A single bounded call-spec shape keeps the helper surface small, generic, and easy to validate while still covering the immediate multi-tool orchestration use cases Phase 30 set out to solve.

**Impact:** Future orchestration helpers should build on the same compact call-spec contract unless a later phase demonstrates a concrete need to extend it.

## [2026-03-26] Prefer ordered sequential fallback semantics for `ptc.first_success(...)`

**Type:** trade-off  
**Phase:** 30 — Core Orchestration Primitives  
**Related:** `src/python-runtime/runtime.py`, `test/orchestration-helper.test.ts`

**What we gained:** Deterministic fallback behavior, compact failure reporting, and a helper contract that is easy to reason about because candidates are tried in the exact order provided.

**What we accepted:** `ptc.first_success(...)` does not race candidates concurrently in Phase 30, even when a `max_concurrency` argument is present; concurrency remains validated for interface consistency only.

**Conditions for revisiting:** Revisit this trade-off only if a later orchestration phase has a concrete need for cancellation-aware racing semantics and can prove that extra complexity is worth the loss of determinism.

## Accomplishments
- Added `_normalize_orchestration_calls(...)`, `_normalize_orchestration_limit(...)`, and `_summarize_orchestration_error(...)` to keep orchestration helper validation and error handling runtime-local and bounded.
- Added `ptc.batch_tool(...)` to run validated nested tool calls through the normal callable runtime surface with capped concurrency and stable input ordering.
- Added `ptc.first_success(...)` to support ordered fallback tool attempts with compact aggregate failure summaries.
- Added `test/orchestration-helper.test.ts` to exercise successful batching, concurrency limits, ordered fallback success, aggregate failure behavior, and invalid call-spec errors through real `CodeExecutor` runs.

## Files Created/Modified

| File | Change | Purpose |
|------|--------|---------|
| `src/python-runtime/runtime.py` | Modified | Adds the shared call-spec normalization path plus the Phase 30 orchestration helpers. |
| `test/orchestration-helper.test.ts` | Created | Provides focused execution-level proof for the new orchestration helpers. |
| `.paul/phases/30-core-orchestration-primitives/30-01-SUMMARY.md` | Created | Records plan-vs-actual reconciliation for Phase 30. |
| `.paul/STATE.md` | Modified | Closes the Phase 30 loop and routes the project to Phase 31 planning. |
| `.paul/PROJECT.md` | Modified | Records the shipped Phase 30 helper capability and related design decisions. |
| `.paul/ROADMAP.md` | Modified | Marks Phase 30 complete and advances Milestone 12 progress. |
| `.paul/quality-history.md` | Modified | Appends the quality snapshot for Phase 30. |

## Decisions Made

| Decision | Rationale | Impact |
|----------|-----------|--------|
| Keep orchestration call specs bounded to `{tool, params}` and validate them in `runtime.py` | The first orchestration slice only needed a small, generic contract; broader orchestration schema would add scope without proving additional value. | Future helper additions should either reuse this call shape or justify any extension explicitly in later phases. |
| Keep `ptc.first_success(...)` sequential and ordered in Phase 30 | Deterministic fallback behavior is easier to reason about and test than concurrent racing/cancellation in the first orchestration primitive slice. | Broader race-style semantics remain deferred until a later phase has concrete need and proof. |
| Keep orchestration proof in a dedicated helper test file | The repo already carries large omnibus test surfaces, and this phase only needed narrow runtime evidence. | Future helper slices should continue preferring focused proof files over broadening existing omnibus suites when possible. |

## Deviations from Plan

### Summary

| Type | Count | Impact |
|------|-------|--------|
| Auto-fixed | 0 | None |
| Scope additions | 0 | None |
| Deferred | 0 | None |

**Total impact:** None. The phase goals and boundaries held.

### Deferred Items
None — reducers, output-budget helpers, broader concurrency APIs, and docs/examples were intentionally left for later Milestone 12 phases exactly as planned.

## Issues Encountered

| Issue | Resolution |
|-------|------------|
| The Node test runner continues to emit `MODULE_TYPELESS_PACKAGE_JSON` warnings for ESM-style `.ts` tests. | Left unchanged because the warning is a known package-level concern outside the narrow runtime-helper scope of Phase 30. |
| `src/python-runtime/runtime.py` remains above the soft size threshold. | Kept the new helper additions compact and runtime-local, and deferred broader runtime restructuring to future work unless adjacent phases make that unavoidable. |

## Next Phase Readiness

**Ready:**
- Phase 30 is closed with shipped `ptc.batch_tool(...)` and `ptc.first_success(...)` helpers plus focused execution-level proof.
- The callable runtime now has a reusable bounded call-spec validation path for later orchestration helpers.
- Full verification is green at `123` passing / `0` failing, with the dependency audit baseline unchanged.

**Concerns:**
- `src/python-runtime/runtime.py` is now `417` lines, so Phase 31 should stay disciplined about helper size and avoid broader refactors.
- The dependency audit baseline remains non-zero at `0 critical / 2 high / 2 moderate / 1 low`.
- Package-level `MODULE_TYPELESS_PACKAGE_JSON` warnings remain present for ESM-style `.ts` tests.

**Blockers:**
- None

---
*Phase: 30-core-orchestration-primitives, Plan: 01*  
*Completed: 2026-03-26*
