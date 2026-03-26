---
phase: 26-python-helpers-proof-and-docs
plan: 01
subsystem: kernel
tags: [ptc, python, helpers, handles, responseId, filePath, documentation, proof]
requires:
  - phase: 25-response-and-file-handle-contract
    provides:
      - explicit response/file handle contract types
      - bounded adapter extraction for existing `responseId` / `filePath` payloads
provides:
  - bounded Python handle helper ergonomics via `ptc.extract_handles()` and `ptc.first_handle()`
  - execution-level proof for response/file follow-up flows inside `code_execution`
  - README/model guidance for supported response/file handle workflows
affects:
  - future handle-follow-up workflows
  - maintainer documentation
  - milestone-completion context
tech-stack:
  added: []
  patterns:
    - "Prefer helper-based handle discovery over ad hoc recursive JSON walking in Python"
    - "Keep Python handle ergonomics bounded to `response` / `file` kinds while preserving existing normalized tool return shapes"
key-files:
  created:
    - test/handle-helper-contract.test.ts
  modified:
    - src/python-runtime/runtime.py
    - src/tools/tool-wrapper.ts
    - src/index.ts
    - README.md
    - test/tool-wrapper.test.ts
    - test/index.test.ts
    - test/code-executor.test.ts
key-decisions:
  - "Decision: Expose exactly two bounded Python handle helpers (`ptc.extract_handles`, `ptc.first_handle`) instead of broad helper churn or new tool result envelopes"
  - "Decision: Keep handle-helper scope limited to response/file handles and explicitly continue deferring graph-handle support"
patterns-established:
  - "Document helper APIs in both README.md and the generated code_execution tool description, then lock them with focused tests"
  - "Execution proof for Python helper ergonomics should use deterministic mocked nested tools inside the real runtime rather than adding heavier external harnesses"
duration: 19min
started: 2026-03-25T22:24:04Z
completed: 2026-03-25T22:43:01Z
---

# Phase 26 Plan 01: Python Helpers, Proof, and Docs Summary

**`pi-ptc-next` now exposes bounded Python handle helpers for existing response/file follow-up workflows, proves them inside the real `code_execution` runtime, and documents the live API without widening the contract beyond `responseId` / `filePath`.**

## Performance

| Metric | Value |
|--------|-------|
| Duration | ~19 minutes |
| Started | 2026-03-25T22:24:04Z |
| Completed | 2026-03-25T22:43:01Z |
| Tasks | 3 completed |
| Files modified | 8 |

## Acceptance Criteria Results

| Criterion | Status | Notes |
|-----------|--------|-------|
| AC-1: Python helper ergonomics expose the bounded handle contract cleanly | Pass | Added `ResponseHandle` / `FileHandle` / `SupportedHandle` TypedDict coverage in generated wrappers plus runtime helpers `ptc.extract_handles()` and `ptc.first_handle()` in `src/python-runtime/runtime.py`. |
| AC-2: Supported follow-up workflows are proven end-to-end inside `code_execution` | Pass | Added execution-level proof in `test/code-executor.test.ts` covering response-handle follow-up via `get_search_content` and file-handle follow-up via `ptc.read_text`. |
| AC-3: Maintainer/model documentation matches the live helper surface | Pass | Updated `src/index.ts` tool guidance and `README.md`, then locked the contract with `test/handle-helper-contract.test.ts`. |

## Module Execution Reports

### Apply-phase carried evidence
- **WALT:** Full verification finished green at `112` passing / `0` failing via `npm test`; build remained clean through `npm run build`.
- **TODD:** Existing focused `node:test` coverage was extended rather than restructuring the phase as TDD; wrapper, index, code-executor, README-contract, and existing adapter tests all passed.
- **DEAN:** Dependency audit stayed unchanged and non-blocking at `0 critical / 2 high / 2 moderate / 1 low`.
- **DOCS:** Repo-owned documentation drift was addressed directly in `README.md` alongside the runtime/helper changes.

### Pre-unify
- No modules registered for `pre-unify` in the installed registry.

### Post-unify side effects
- **WALT:** Recorded this phase in `.paul/quality-history.md` as improved: `112` passing / `0` failing via `npm test`, build clean via `npm run build`.
- **SKIP:** No additional standalone knowledge artifact was needed beyond this summary and the project/state updates.
- **RUBY:** Fallback debt review notes that the new implementation files stayed bounded (`src/python-runtime/runtime.py` at 280 lines, `src/tools/tool-wrapper.ts` at 167 lines), while already-large edited files such as `src/index.ts`, `README.md`, and `test/index.test.ts` remain areas to watch rather than new debt introduced by the helper slice itself.

## Accomplishments

- Added bounded Python-side handle discovery helpers for structured tool results: `ptc.extract_handles()` and `ptc.first_handle()`.
- Added generated Python TypedDict coverage for `ResponseHandle`, `FileHandle`, and `SupportedHandle`.
- Proved supported response/file follow-up flows in the real combined runtime using deterministic mocked nested tools.
- Updated both README and `code_execution` tool guidance so the live helper API and its response/file-only scope are explicit.
- Repaired post-apply TypeScript diagnostics in touched tests before reconciliation so the final proof surface is clean.

## Task Commits

No task-level git commits were created during this phase.
The repository has no active repo-local `pals.json`, so PAUL git automation remained disabled and work stayed as local working-tree changes on `feat/hashline-native-interop`.

## Files Created/Modified

| File | Change | Purpose |
|------|--------|---------|
| `src/python-runtime/runtime.py` | Modified | Adds bounded runtime handle discovery helpers for structured Python tool results. |
| `src/tools/tool-wrapper.ts` | Modified | Adds generated Python TypedDict coverage for response/file handle types. |
| `src/index.ts` | Modified | Extends the `code_execution` tool description with the new `ptc` helper signatures. |
| `README.md` | Modified | Documents the bounded handle-helper API and example response/file follow-up workflow. |
| `test/tool-wrapper.test.ts` | Modified | Verifies generated wrapper/type coverage for response/file handle helpers. |
| `test/index.test.ts` | Modified | Verifies the model-facing `code_execution` tool description advertises the helper APIs. |
| `test/code-executor.test.ts` | Modified | Proves helper-driven response/file follow-up flows inside the real runtime. |
| `test/handle-helper-contract.test.ts` | Created | Locks README helper guidance to the generated helper surface and example semantics. |

## Decisions Made

| Decision | Rationale | Impact |
|----------|-----------|--------|
| Expose exactly two bounded Python handle helpers (`ptc.extract_handles`, `ptc.first_handle`) | Keeps Phase 26 reviewable and practical without redesigning helper ergonomics more broadly. | Models and maintainers get a clear helper path for supported handle discovery with minimal new surface area. |
| Keep helper filtering limited to `kind="response"` / `kind="file"` | Aligns Python ergonomics with the existing Phase 25 contract and avoids implying unsupported handle categories. | Graph/trace/record handles remain explicitly deferred. |
| Fix post-apply test diagnostics before UNIFY rather than carrying them as debt | Final proof should reflect the actual typed state of the edited test files. | Reconciliation closes on a clean verification surface instead of a known failing test snapshot. |

## Deviations from Plan

### Summary

| Type | Count | Impact |
|------|-------|--------|
| Auto-fixed | 1 | Low; tightened touched test files after APPLY so the final proof surface remained type-clean. |
| Scope additions | 0 | None |
| Deferred | 1 | Graph-handle support remains out of scope and deferred to a future milestone with a stable adjacent-repo contract. |

**Total impact:** One post-apply cleanup to touched test files, no scope creep, and no change to the intended bounded response/file helper deliverable.

### Auto-fixed Issues

**1. Post-apply TypeScript diagnostics in touched tests**
- **Found during:** Final verification before UNIFY
- **Issue:** `test/index.test.ts`, `test/code-executor.test.ts`, and `test/handle-helper-contract.test.ts` had typing/module diagnostics after the helper/docs changes landed.
- **Fix:** Tightened local test typings, added module markers where needed, and narrowed nullable state in the new execution proof without changing runtime behavior.
- **Files:** `test/index.test.ts`, `test/code-executor.test.ts`, `test/handle-helper-contract.test.ts`
- **Verification:** `node --test test/index.test.ts test/code-executor.test.ts test/handle-helper-contract.test.ts` and final `npm test`
- **Commit:** none (local working tree)

### Deferred Items

Logged for future consideration:
- Graph/trace/record handle ergonomics remain deferred until adjacent repos expose a stable public handle contract worth adopting.

## Issues Encountered

| Issue | Resolution |
|-------|------------|
| New helper/docs proof initially left touched tests with TypeScript diagnostics | Tightened the affected test typings and re-ran targeted plus full verification before UNIFY. |
| New test file creation is not visible in plain `git diff --name-only` before staging | Verified the new summary-lock test via targeted test execution and `git status`, consistent with the repo's existing proof guidance. |

## Next Phase Readiness

**Ready:**
- Python can now discover supported response/file handles from structured results without custom recursive JSON walking.
- Response/file follow-up flows are documented and proven inside the real runtime.
- Milestone 10 is now complete at the phase level and ready for milestone-close routing.

**Concerns:**
- Dependency audit remains unchanged but non-zero at `0 critical / 2 high / 2 moderate / 1 low`.
- Already-large edited files like `README.md` and `test/index.test.ts` should stay under observation in future maintenance slices.

**Blockers:**
- None

---
*Phase: 26-python-helpers-proof-and-docs, Plan: 01*
*Completed: 2026-03-25*
