---
phase: 28-python-tool-introspection
plan: 01
subsystem: kernel
tags: [ptc, python, tool-introspection, runtime, code_execution, testing]
requires:
  - phase: 27-result-kind-assertions
    provides:
      - bounded top-level result-kind assertions via `ptc.expect_kind(value, kind)`
      - focused runtime-proof pattern for small Python helper slices
provides:
  - bounded Python-side callable tool introspection via `ptc.list_callable_tools()`
  - alias-aware schema lookup via `ptc.get_tool_schema(name)`
  - session-scoped `_PTC_CALLABLE_TOOL_METADATA` emitted from the live callable runtime surface
  - focused contract coverage for metadata emission and wrapper plumbing
affects:
  - 29-proof-and-docs
tech-stack:
  added: []
  patterns:
    - "Derive Python callable-tool introspection metadata from the same live `ToolInfo[]` surface already used for wrapper generation instead of maintaining a second registry"
    - "Keep Python helper ergonomics bounded by exposing serializable session metadata and defensive copies rather than runtime executors or generalized reflection APIs"
key-files:
  created: []
  modified:
    - src/tools/python-tool-contract.ts
    - src/tools/tool-wrapper.ts
    - src/python-runtime/runtime.py
    - test/python-tool-contract.test.ts
    - test/tool-wrapper.test.ts
key-decisions:
  - "Decision: Emit `_PTC_CALLABLE_TOOL_METADATA` from generated wrappers so runtime introspection stays aligned with the live callable tool surface without a duplicated registry"
  - "Decision: Keep Phase 28 proof at the contract/unit layer and defer execution-level introspection demos and docs to Phase 29"
patterns-established:
  - "Callable-tool introspection helpers should accept canonical tool names and Python helper aliases, but only return JSON-safe metadata and defensive copies"
  - "Small test-surface cleanup needed to satisfy typed dist imports can be folded into the same planned files when it preserves the phase boundary"
duration: ~16min
started: 2026-03-26T13:33:38Z
completed: 2026-03-26T13:49:19Z
---

# Phase 28 Plan 01: Python Tool Introspection Summary

**`pi-ptc-next` now exposes bounded Python-side callable-tool introspection via `ptc.list_callable_tools()` and `ptc.get_tool_schema(name)`, backed by session-scoped metadata emitted from the live callable runtime surface, with focused contract coverage that stays inside the Phase 28 implementation boundary.**

## Performance

| Metric | Value |
|--------|-------|
| Duration | ~16 minutes |
| Started | 2026-03-26T13:33:38Z |
| Completed | 2026-03-26T13:49:19Z |
| Tasks | 3 completed |
| Files modified | 5 |

## Acceptance Criteria Results

| Criterion | Status | Notes |
|-----------|--------|-------|
| AC-1: Callable tool listings are available inside Python from the real session surface | Pass | Generated wrappers now emit `_PTC_CALLABLE_TOOL_METADATA` from the same live `ToolInfo[]` runtime surface used for wrapper generation, and `ptc.list_callable_tools()` returns defensive JSON-safe copies including canonical names and Python helper aliases. |
| AC-2: Python can fetch a callable tool's parameter schema with clear failures | Pass | `ptc.get_tool_schema(name)` now supports lookup by canonical tool name or Python helper alias and raises clear `ValueError` messages for blank names and unknown tools. |
| AC-3: Phase 28 stays implementation-focused and defers execution-level proof/docs to Phase 29 | Pass | The phase only touched helper/wrapper/runtime plumbing plus focused contract tests in the planned files. README/tool-description updates and execution-level introspection examples remain deferred to Phase 29. |

## Verification Results

| Command | Result |
|---------|--------|
| `python3 -m py_compile src/python-runtime/runtime.py` | Pass |
| `npm run build` | Pass |
| `node --test test/python-tool-contract.test.ts test/tool-wrapper.test.ts` | Pass (`9` passing / `0` failing) |
| `npm test` | Pass (`116` passing / `0` failing) |
| `npm audit --json` | Baseline unchanged at `0 critical / 2 high / 2 moderate / 1 low` |
| `lsp workspace-diagnostics` on touched helper/runtime/test files | Pass (`0` errors / `0` warnings reported; TypeScript test-file hints resolved) |

## Module Execution Reports

### Apply-phase carried evidence
- **WALT:** Final verification stayed green after the bounded test-file cleanup: `python3 -m py_compile src/python-runtime/runtime.py`, `npm run build`, focused contract tests (`9` passing / `0` failing), and full `npm test` (`116` passing / `0` failing).
- **TODD:** The phase stayed on the planned narrow proof surface by extending `test/python-tool-contract.test.ts` and `test/tool-wrapper.test.ts` instead of broadening `test/code-executor.test.ts` or `test/index.test.ts`.
- **DEAN:** Dependency audit baseline remains non-blocking and unchanged at `0 critical / 2 high / 2 moderate / 1 low`.
- **DOCS:** README/CHANGELOG drift warnings remain expected and are intentionally deferred to Phase 29 per the approved phase split.

### Pre-unify
- No modules are registered for `pre-unify` in the installed registry.

### Post-unify side effects
- **WALT:** Recorded Phase 28 in `.paul/quality-history.md` as improved: `116` passing / `0` failing via `npm test`, typecheck/build clean via `npm run build`, lint not run separately.
- **RUBY:** Ad hoc no-config ESLint complexity review on the changed TypeScript files found no complexity findings, but fallback file-size inspection shows `src/python-runtime/runtime.py` at `345` lines, which is now past the soft `300`-line debt threshold and should stay tightly bounded in Phase 29.
- **SKIP:** Captured durable knowledge from this phase:

## [2026-03-26] Derive Python callable-tool introspection from wrapper-generation metadata

**Type:** decision  
**Phase:** 28 — Python Tool Introspection  
**Related:** `src/tools/python-tool-contract.ts`, `src/tools/tool-wrapper.ts`, `src/python-runtime/runtime.py`

**Context:** Phase 28 needed Python-side introspection over the live callable tool surface without introducing a second static registry or exposing runtime executors through the helper layer.

**Decision:** Emit `_PTC_CALLABLE_TOOL_METADATA` from the generated wrappers using the same live `ToolInfo[]` surface already used to build helper functions, then have runtime helpers consume only that bounded JSON-safe metadata.

**Alternatives considered:**
- Add a separate static metadata registry for Python introspection — rejected because duplicated registries drift easily and would break the requirement that Python reflects the live callable session surface.
- Reach into runtime internals or expose callable executors directly from Python — rejected because it would broaden the helper surface beyond safe bounded introspection and leak non-serializable implementation details.

**Rationale:** The wrapper-generation path already has the authoritative callable-tool view. Reusing it keeps metadata deterministic, session-scoped, and aligned with aliasing behavior while preserving the narrow helper philosophy.

**Impact:** Future introspection helpers should continue to layer on serializable session metadata rather than introducing parallel registries or direct runtime reflection.

## [2026-03-26] Clean ESM/type alignment inside the planned test files instead of widening phase scope

**Type:** lesson  
**Phase:** 28 — Python Tool Introspection  
**Related:** `test/python-tool-contract.test.ts`, `test/tool-wrapper.test.ts`

**What happened:** After the main implementation landed, the touched contract tests still had TypeScript diagnostics around `require(...)` usage and loose schema typing when imported against the emitted dist type declarations.

**What we learned:** Converting those already-planned test files to typed ESM imports and real `TypeBox` schemas is a safe in-scope cleanup when it preserves the same proof surface and removes misleading diagnostics without broadening behavior.

**How to apply:** When a bounded helper phase already owns focused contract test files, small type-alignment cleanups should stay local to those files instead of spilling into broader repo-wide test or packaging changes.

## Accomplishments

- Added `PythonCallableToolMetadata` builders that extract canonical tool names, Python helper aliases, descriptions, sources, read-only status, and deterministic JSON-safe parameter schemas from live callable tools.
- Updated generated Python wrappers to embed `_PTC_CALLABLE_TOOL_METADATA` and expose a `CallableToolMetadata` typed model to the runtime.
- Extended `_PtcHelpers` with `ptc.list_callable_tools()` and `ptc.get_tool_schema(name)` using defensive copies and alias-aware lookup.
- Added focused contract coverage for metadata emission, alias preservation, wrapper embedding, and schema lookup plumbing.
- Cleaned the two touched test files so their dist-based imports and schema fixtures remain type-correct under editor/LSP diagnostics.

## Task Commits

No task-level git commits were created during this phase.
Work remained as local working-tree changes on `feat/hashline-native-interop`, and reconciliation relied on the executed plan, file inspection, diagnostics, and verification output.

## Files Created/Modified

| File | Change | Purpose |
|------|--------|---------|
| `src/tools/python-tool-contract.ts` | Modified | Adds bounded callable-tool metadata types/builders and preserves helper-signature generation from the live tool surface. |
| `src/tools/tool-wrapper.ts` | Modified | Embeds `_PTC_CALLABLE_TOOL_METADATA` into generated Python wrappers alongside the existing helper models. |
| `src/python-runtime/runtime.py` | Modified | Adds defensive-copy callable-tool introspection helpers and alias-aware schema lookup to `_PtcHelpers`. |
| `test/python-tool-contract.test.ts` | Modified | Proves metadata serialization, alias preservation, helper signatures, and typed dist import compatibility. |
| `test/tool-wrapper.test.ts` | Modified | Proves wrapper output contains the embedded metadata payload and typed callable-tool model. |

## Decisions Made

| Decision | Rationale | Impact |
|----------|-----------|--------|
| Emit callable-tool introspection metadata from the wrapper-generation path | Keeps Python introspection aligned with the same live callable tool surface used for helper generation, avoiding registry drift. | Future helper slices can inspect session metadata without exposing executors or internal registries. |
| Keep Phase 28 proof at the focused contract/unit level | The approved split reserves runtime demos, docs, and user-facing examples for Phase 29. | Phase 29 now owns execution-level introspection proof and documentation updates cleanly. |
| Resolve touched test-file diagnostics locally | The diagnostics affected only the planned contract test files and did not require broader repo packaging changes. | The final Phase 28 working tree is clean for the touched files without expanding scope. |

## Deviations from Plan

### Summary

| Type | Count | Impact |
|------|-------|--------|
| Auto-fixed | 1 | None |
| Scope additions | 0 | None |
| Deferred | 0 | None |

**Total impact:** None. The plan objectives and boundaries held.

### Auto-fixed Issues

| Issue | Resolution | Impact |
|-------|------------|--------|
| The touched contract tests still showed TypeScript/LSP diagnostics for `require(...)`, loose schema literals, and one implicit `any` after the implementation landed. | Converted `test/python-tool-contract.test.ts` and `test/tool-wrapper.test.ts` to typed ESM imports and `TypeBox` schema fixtures, then re-ran focused and full verification. | None — stayed inside planned files and improved the final proof quality. |

### Deferred Items

None — execution-level introspection proof, README/tool-description updates, and safe usage examples remain intentionally deferred to Phase 29 exactly as planned.

## Issues Encountered

| Issue | Resolution |
|-------|------------|
| Ad hoc ESLint module checks from the PALS module registry use the older `--no-eslintrc` flag, which no longer works under the current ESLint CLI. | Used the CLI-compatible `--no-config-lookup` fallback for targeted post-unify review and documented the debt result conservatively. |
| `npm audit --json` still exits non-zero because the repo retains the known dependency baseline. | Recorded the unchanged baseline honestly rather than treating it as a new regression. |
| Node still reports `MODULE_TYPELESS_PACKAGE_JSON` warnings for ESM-style `.ts` tests because `package.json` does not declare `"type": "module"`. | Left the warning untouched because Phase 28 is not the right place to change repo-wide module packaging behavior. |

## Next Phase Readiness

**Ready:**
- Python can now enumerate live callable tools and fetch their schemas from bounded session metadata.
- Wrapper generation and runtime introspection are now aligned around the same authoritative callable-tool surface.
- The touched helper/runtime/test files are verification-clean, including the post-implementation diagnostics cleanup.
- Phase 29 can focus exclusively on execution-level introspection proof, README/tool-description updates, and safe usage examples.

**Concerns:**
- `src/python-runtime/runtime.py` is now `345` lines and should remain tightly bounded or be intentionally refactored only if Phase 29 truly requires it.
- The dependency audit baseline remains non-zero at `0 critical / 2 high / 2 moderate / 1 low`.
- The repo still emits `MODULE_TYPELESS_PACKAGE_JSON` warnings for ESM-style `.ts` tests; that packaging decision remains outside this phase.

**Blockers:**
- None

---
*Phase: 28-python-tool-introspection, Plan: 01*  
*Completed: 2026-03-26*
