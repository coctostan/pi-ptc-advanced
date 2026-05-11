---
phase: 25-response-and-file-handle-contract
plan: 01
subsystem: kernel
tags: [ptc, handles, responseId, filePath, web-tools, normalization]
requires: []
provides:
  - explicit response/file handle contract types for existing `pi-web-tools` follow-up surfaces
  - narrow adapter-side handle extraction for `responseId` and `filePath`
  - focused regression coverage for supported and unsupported handle cases
affects:
  - 26-python-helpers-proof-and-docs
tech-stack:
  added: []
  patterns:
    - "Keep handle extraction separate from normalized tool values so existing `details.ptcValue` passthrough consumers remain unchanged"
    - "Scope handle support to current ecosystem-proven `responseId` and `filePath` flows; defer graph handles until a stable upstream contract exists"
key-files:
  created:
    - src/contracts/handle-types.ts
  modified:
    - src/tool-adapters.ts
    - src/types.ts
    - test/tool-adapters.test.ts
    - test/contracts-public-types.test.ts
key-decisions:
  - "Decision: Support only response and file handles in Phase 25 and explicitly defer graph-handle standardization"
  - "Decision: Expose handle discovery through separate extraction helpers instead of wrapping `normalizeToolResult()` outputs in a new envelope"
patterns-established:
  - "New ecosystem-follow-up contracts should start from existing adjacent-repo payloads, not invented cross-repo protocol changes"
  - "Public contract additions should be re-exported via `src/types.ts` and covered by direct dist import tests"
duration: 29min
started: 2026-03-25T20:22:28Z
completed: 2026-03-25T20:50:57Z
---

# Phase 25 Plan 01: Response and File Handle Contract Summary

**`pi-ptc-next` now has an explicit, non-breaking response/file handle contract for existing `pi-web-tools` `responseId` and `filePath` follow-up flows, with focused regression proof and no upstream protocol churn.**

## Performance

| Metric | Value |
|--------|-------|
| Duration | ~29 minutes |
| Started | 2026-03-25T20:22:28Z |
| Completed | 2026-03-25T20:50:57Z |
| Tasks | 3 completed |
| Files modified | 5 |

## Acceptance Criteria Results

| Criterion | Status | Notes |
|-----------|--------|-------|
| AC-1: Existing response/file follow-up surfaces have an explicit local contract | Pass | Added `src/contracts/handle-types.ts`, re-exported the public types via `src/types.ts`, and added adapter-side extraction for existing `responseId` / `filePath` shapes. |
| AC-2: Adapter normalization remains non-breaking | Pass | `normalizeToolResult()` still returns upstream `details.ptcValue` unchanged and preserves text fallbacks when `ptcValue` is absent. Handle discovery is separate. |
| AC-3: The new contract is covered by focused regression proof | Pass | Added positive and negative regression cases in `test/tool-adapters.test.ts` and direct dist import coverage in `test/contracts-public-types.test.ts`. |

## Module Execution Reports

### Apply-phase carried evidence
- **WALT:** `npm test` passed with `110` passing / `0` failing. Build remained clean via `npm run build`.
- **TODD:** Existing focused `node:test` coverage was extended rather than restructured into a TDD plan; coverage now includes response/file handle extraction cases and unsupported-handle negatives.
- **DEAN:** Dependency audit remained non-blocking, but the post-apply state moved from `0 critical / 2 high / 1 moderate / 1 low` to `0 critical / 2 high / 2 moderate / 1 low` (`+1 moderate`, no new critical/high).

### Pre-unify
- No modules registered for `pre-unify` in the installed registry.

### Post-unify side effects
- **WALT:** Quality history should record this phase as stable: `110` passing / `0` failing via `npm test`, build clean via `npm run build`.
- **RUBY:** No additional debt escalation recorded from this phase; the main changed implementation file (`src/tool-adapters.ts`) remained below the repo's 300/500-line warning thresholds.
- **SKIP:** No new standalone decision record was required beyond the summary and project/state updates for this bounded contract slice.

## Accomplishments

- Added a dedicated response/file handle contract module with bounded support for `ResponseHandle`, `FileHandle`, and `SupportedHandle`.
- Added narrow `extractSupportedHandles()` logic to discover `responseId` and `filePath` references from existing `pi-web-tools` structured payloads.
- Preserved existing adapter behavior by keeping `normalizeToolResult()` passthrough/fallback semantics unchanged.
- Added focused test coverage for supported handle extraction, deduplication, unsupported tool names, and empty-handle cases.
- Fixed the public-contract import test to be ESM-safe while still validating CommonJS dist entrypoints via `createRequire(import.meta.url)`.

## Task Commits

No task-level git commits were created during this phase.
The repository has no active repo-local `pals.json`, so PAUL git automation remained disabled and work stayed as local working-tree changes on `feat/hashline-native-interop`.

## Files Created/Modified

| File | Change | Purpose |
|------|--------|---------|
| `src/contracts/handle-types.ts` | Created | Defines the explicit response/file handle contract for this milestone slice. |
| `src/types.ts` | Modified | Re-exports the new handle contract types through the public type surface. |
| `src/tool-adapters.ts` | Modified | Adds bounded handle extraction while preserving existing normalized result behavior. |
| `test/tool-adapters.test.ts` | Modified | Adds focused positive/negative regression coverage for response/file handle extraction. |
| `test/contracts-public-types.test.ts` | Modified | Verifies the new contract module is importable from dist and fixes the test’s ESM/CommonJS interop issue. |

## Decisions Made

| Decision | Rationale | Impact |
|----------|-----------|--------|
| Support only response and file handles in Phase 25 | These flows already exist concretely in `pi-web-tools`; graph-handle standardization does not yet have an equivalent stable public contract. | Keeps the phase reviewable and prevents premature abstraction. |
| Keep handle extraction separate from normalized result values | Existing Python/runtime consumers already rely on `normalizeToolResult()` passthrough/fallback behavior. | Avoids a breaking envelope change while still making supported handles explicit. |
| Fix the contract import test with ESM imports plus `createRequire(import.meta.url)` | The original CommonJS-style test bindings caused diagnostics and failed under ESM parsing. | Keeps direct dist import coverage without changing package module mode. |

## Deviations from Plan

### Summary

| Type | Count | Impact |
|------|-------|--------|
| Auto-fixed | 1 | Low; kept the planned file/test scope intact. |
| Scope additions | 0 | None |
| Deferred | 1 | Graph-handle standardization remains deferred to a future phase/milestone. |

**Total impact:** One execution-time test harness adjustment, no scope creep, no change to the planned deliverable boundaries.

### Auto-fixed Issues

**1. Test harness interop issue in public contract coverage**
- **Found during:** Verification for Task 1 / final phase verification
- **Issue:** `test/contracts-public-types.test.ts` triggered block-scoped redeclaration diagnostics and then failed under ESM parsing because `require` was used directly.
- **Fix:** Converted the file to ESM imports and used `createRequire(import.meta.url)` for CommonJS dist entrypoint loading.
- **Files:** `test/contracts-public-types.test.ts`
- **Verification:** `npm run build && node --test test/contracts-public-types.test.ts`
- **Commit:** none (local working tree)

### Deferred Items

Logged for future consideration:
- Graph/trace/record handle standardization remains deferred until adjacent repos expose stable public handle contracts worth adopting.

## Issues Encountered

| Issue | Resolution |
|-------|------------|
| Public contract import test conflicted with ESM parsing and direct `require` usage | Rewrote the test to use ESM imports plus `createRequire(import.meta.url)` while keeping the dist-import assertion. |
| Dependency audit moderate count increased by one during the phase | Recorded as a non-blocking DEAN warning for follow-up; no new critical/high vulnerabilities were introduced. |

## Next Phase Readiness

**Ready:**
- The bounded response/file handle contract is now explicit and publicly exported.
- Adapter extraction logic exists for current ecosystem-proven follow-up shapes.
- Focused tests now cover the contract that Phase 26 can build helper ergonomics around.

**Concerns:**
- Dependency audit baseline worsened slightly at the moderate level (`+1 moderate`), so future verification should continue to surface that drift.
- Graph handles are still deferred and should not be implied by Phase 26 unless a stable adjacent-repo contract appears.

**Blockers:**
- None

---
*Phase: 25-response-and-file-handle-contract, Plan: 01*
*Completed: 2026-03-25*
