---
phase: 29-proof-and-docs
plan: 01
subsystem: docs
completed: 2026-03-26T10:12:47Z
duration: ~14min
tags: [ptc, docs, proof, code_execution, runtime, introspection]
requires:
  - phase: 27-result-kind-assertions
    provides:
      - strict top-level result-kind assertions via `ptc.expect_kind(value, kind)`
  - phase: 28-python-tool-introspection
    provides:
      - bounded callable-tool introspection via `ptc.list_callable_tools()` / `ptc.get_tool_schema(name)`
provides:
  - execution-level proof for callable-tool introspection helpers through real `CodeExecutor` runs
  - updated `code_execution` tool-description guidance for `ptc.expect_kind(...)` and callable-tool introspection helpers
  - README coverage for safe optional-tool branching against the live callable session surface
  - focused doc-contract coverage keeping helper docs aligned with shipped runtime behavior
affects:
  - milestone-11-complete
---

# Phase 29 Plan 01: Proof and Docs Summary

**Milestone 11 is now closed: `pi-ptc-next` has execution-level proof for `ptc.list_callable_tools()` / `ptc.get_tool_schema(name)`, refreshed `code_execution` tool-description guidance for `ptc.expect_kind(...)` plus the introspection helpers, and README examples that branch safely on the live callable session surface instead of assuming optional tools are present.**

## Performance

| Metric | Value |
|--------|-------|
| Duration | ~14 minutes |
| Started | 2026-03-26T09:58:54Z |
| Completed | 2026-03-26T10:12:47Z |
| Tasks | 3 completed |
| Files modified | 5 |

## Acceptance Criteria Results

| Criterion | Status | Notes |
|-----------|--------|-------|
| AC-1: Callable-tool introspection helpers are proven through the live execution path | Pass | `test/callable-tool-introspection-helper.test.ts` now exercises `ptc.list_callable_tools()` and alias-aware `ptc.get_tool_schema(name)` through a real `CodeExecutor` run, including the bounded unknown-tool failure path. |
| AC-2: The `code_execution` tool description exposes the current helper surface accurately | Pass | `src/index.ts` now advertises `ptc.expect_kind(value, kind)`, `ptc.list_callable_tools()`, and `ptc.get_tool_schema(name)`, and `test/index.test.ts` locks those strings plus the safe optional-tool introspection note. |
| AC-3: README guidance documents safe branching/introspection usage for Milestone 11 | Pass | `README.md` now documents the Milestone 11 helper surface and includes a safe example that inspects `ptc.list_callable_tools()` before using optional helpers like `sg`, backed by `test/callable-tool-introspection-contract.test.ts`. |

## Verification Results

| Command | Result |
|---------|--------|
| `npm run build` | Pass |
| `node --test test/callable-tool-introspection-helper.test.ts` | Pass (`2` passing / `0` failing) |
| `node --test test/callable-tool-introspection-contract.test.ts test/callable-tool-introspection-helper.test.ts test/index.test.ts` | Pass (`12` passing / `0` failing) |
| `npm test` | Pass (`119` passing / `0` failing) |
| `lsp diagnostics test/callable-tool-introspection-helper.test.ts` | Pass (`0` diagnostics after ESM/type cleanup) |
| `lsp diagnostics test/callable-tool-introspection-contract.test.ts` | Pass (`0` diagnostics) |
| `npm audit --json` | Baseline unchanged at `0 critical / 2 high / 2 moderate / 1 low` |

## Module Execution Reports

### Apply-phase carried evidence
- **WALT:** Final verification stayed green after the post-apply diagnostics cleanup: `npm run build`, focused runtime/doc-contract tests, and full `npm test` all passed with the suite moving from `116` passing to `119` passing.
- **TODD:** The phase kept execution-level proof focused in dedicated files (`test/callable-tool-introspection-helper.test.ts`, `test/callable-tool-introspection-contract.test.ts`) instead of broadening the already-large omnibus runtime test surfaces.
- **DEAN:** Dependency audit baseline remains unchanged and non-blocking at `0 critical / 2 high / 2 moderate / 1 low`.
- **DOCS:** README drift was resolved in-scope by updating `README.md`; changelog/release-note updates remain intentionally out of scope for this proof/docs slice.

### Pre-unify
- No modules are registered for `pre-unify` in the installed registry.

### Post-unify side effects
- **WALT:** Phase 29 was recorded in `.paul/quality-history.md` as improved: `119` passing / `0` failing via `npm test`, typecheck/build clean via `npm run build`, lint not run separately.
- **RUBY:** Targeted no-config ESLint complexity review found no complexity findings in the changed TypeScript files. Existing large-file debt remains in `README.md` and `test/index.test.ts`, but the new execution-level proof was kept isolated in dedicated focused tests rather than expanding broader runtime suites further.
- **SKIP:** Captured durable knowledge from this phase:

## [2026-03-26] Use `ptc.list_callable_tools()` as the authoritative optional-tool branching surface

**Type:** decision  
**Phase:** 29 — Proof and Docs  
**Related:** `README.md`, `src/index.ts`, `test/index.test.ts`

**Context:** Phase 29 needed a safe user-facing branching pattern for optional helpers like `sg` without implying that environment/config allowlists guarantee the helper is callable in the current `code_execution` session.

**Decision:** Document and assert `ptc.list_callable_tools()` as the authoritative live callable session surface before branching on optional helpers, and use `ptc.get_tool_schema(name)` only after presence has been confirmed.

**Alternatives considered:**
- Branch directly on `PTC_CALLABLE_TOOLS` or other config — rejected because the allowlist is a filter, not a loader, so the live session may still omit the requested helper.
- Scrape the `code_execution` prose description to discover helper availability — rejected because prose is not a stable runtime contract and can drift from the actual callable tool surface.

**Rationale:** The runtime already exposes bounded session metadata through `ptc.list_callable_tools()`. Using that surface in docs/examples keeps models aligned with the same live callable view Python actually sees.

**Impact:** Future optional-tool examples should branch on the live callable metadata first, not on configuration assumptions or copied helper lists.

## [2026-03-26] Convert new focused proof tests to ESM imports when diagnostics surface after APPLY

**Type:** lesson  
**Phase:** 29 — Proof and Docs  
**Related:** `test/callable-tool-introspection-helper.test.ts`, `test/callable-tool-introspection-contract.test.ts`

**What happened:** The initial focused proof tests passed at runtime, but editor/LSP diagnostics still flagged `require(...)`-style imports and one implicit-`any` parameter in the new helper test files.

**What we learned:** For new focused proof files, converting to ESM imports and adding the minimum explicit local typing/casts is a low-risk cleanup that preserves the planned proof surface while removing distracting diagnostics.

**How to apply:** When a new runtime/doc-contract test lands cleanly but still emits local diagnostics, prefer fixing the touched test files directly rather than widening scope into package-level module-mode changes unless the warning itself is part of the phase objective.

## Accomplishments
- Added `test/callable-tool-introspection-helper.test.ts` to prove `ptc.list_callable_tools()` and `ptc.get_tool_schema(name)` through real `CodeExecutor` execution, including alias-aware schema lookup and bounded unknown-tool failures.
- Added `test/callable-tool-introspection-contract.test.ts` to keep README helper documentation aligned with the shipped runtime helper surface.
- Updated `src/index.ts` so the generated `code_execution` tool description now advertises `ptc.expect_kind(...)`, `ptc.list_callable_tools()`, and `ptc.get_tool_schema(name)` plus the safe optional-tool introspection note.
- Updated `test/index.test.ts` to lock the new helper-description strings and the safe branching guidance.
- Updated `README.md` with the Milestone 11 helper surface and a safe example that branches on `ptc.list_callable_tools()` before using optional helpers.
- Cleaned the two new proof files to satisfy local diagnostics without changing runtime behavior or reopening Phase 28 helper plumbing.

## Files Created/Modified

| File | Change | Purpose | Delta |
|------|--------|---------|-------|
| `README.md` | Modified | Documents `ptc.expect_kind(...)`, callable-tool introspection helpers, and safe optional-tool branching guidance. | `+62 / -8` |
| `src/index.ts` | Modified | Extends the `code_execution` tool description with the Milestone 11 helper surface and live-session introspection note. | `+6 / -0` |
| `test/index.test.ts` | Modified | Locks the new helper-description strings and safe-branching wording in the registered tool description. | `+19 / -12` |
| `test/callable-tool-introspection-helper.test.ts` | Created | Provides focused execution-level proof for callable-tool introspection helpers via `CodeExecutor`. | `+199 / -0` |
| `test/callable-tool-introspection-contract.test.ts` | Created | Keeps README helper claims aligned with the shipped runtime/helper surface. | `+22 / -0` |

## Decisions Made

| Decision | Rationale | Impact |
|----------|-----------|--------|
| Treat `ptc.list_callable_tools()` as the authoritative optional-tool branching surface in docs and examples | The live callable session surface can differ from config/allowlist intent; docs must reflect runtime truth, not setup assumptions. | Future optional-tool examples and helper guidance should branch on live session metadata first. |
| Keep execution-level introspection proof in dedicated focused test files | The repo already carries large omnibus tests, and the phase only needed narrow proof for Milestone 11 helpers. | Runtime proof stayed reviewable and avoided reopening broader execution-test surfaces. |
| Fix new-test diagnostics locally rather than escalating module-mode changes into package scope | The runtime behavior was already correct; only the newly added proof files needed import/type cleanup. | The phase closed with clean targeted diagnostics while leaving the known package-level `MODULE_TYPELESS_PACKAGE_JSON` warning out of scope. |

## Deviations from Plan

### Summary

| Type | Count | Impact |
|------|-------|--------|
| Auto-fixed | 1 | None |
| Scope additions | 0 | None |
| Deferred | 0 | None |

**Total impact:** None. The phase goals and boundaries held.

### Auto-fixed Issues

| Issue | Resolution | Impact |
|-------|------------|--------|
| The new focused proof files still emitted local LSP hints for `require(...)` imports and one implicit `any` after APPLY completed. | Converted the new tests to ESM imports, added an explicit local tool type for the helper-test stub, and used minimal targeted casts where the dist `CodeExecutor` types are broader than the lightweight test doubles. | None — stayed inside planned files and improved final proof quality. |

### Deferred Items

None — the planned proof/docs scope is complete, and no further Milestone 11 follow-up remains open.

## Issues Encountered

| Issue | Resolution |
|-------|------------|
| The new helper proof file needed lightweight type escapes because the real `ToolRegistry` / `ExtensionContext` types are richer than the minimal test doubles needed to exercise `CodeExecutor`. | Used narrow `as any` casts only at the test-double boundary while keeping the helper logic and assertions strongly typed. |
| Node continues to emit `MODULE_TYPELESS_PACKAGE_JSON` warnings for ESM-style `.ts` tests because `package.json` does not declare `"type": "module"`. | Left the package-level warning untouched because Phase 29 only needed focused proof/docs work, not a repo-wide module-packaging decision. |
| `test/index.test.ts` still carries many pre-existing non-blocking hints unrelated to the Milestone 11 helper additions. | Kept Phase 29 scoped to the newly introduced helper assertions and the new proof files rather than treating unrelated historical hints as part of this milestone closure. |

## Next Phase Readiness

**Ready:**
- Milestone 11 is complete: result-kind assertions, callable-tool introspection helpers, execution-level proof, and user-facing docs are all aligned.
- The `code_execution` description and README now both describe the same bounded helper surface for `ptc.expect_kind(...)`, `ptc.list_callable_tools()`, and `ptc.get_tool_schema(name)`.
- New focused proof files are runtime-green and diagnostics-clean.
- Future work can start from a closed milestone instead of carrying Milestone 11 proof/docs debt forward.

**Concerns:**
- The known dependency audit baseline remains non-zero at `0 critical / 2 high / 2 moderate / 1 low`.
- `README.md` and `test/index.test.ts` remain large existing files; future edits should stay disciplined and prefer focused new files where practical.
- The repo still emits package-level `MODULE_TYPELESS_PACKAGE_JSON` warnings for ESM-style `.ts` tests; resolving that remains a separate packaging decision.

**Blockers:**
- None

---
*Phase: 29-proof-and-docs, Plan: 01*  
*Completed: 2026-03-26*
