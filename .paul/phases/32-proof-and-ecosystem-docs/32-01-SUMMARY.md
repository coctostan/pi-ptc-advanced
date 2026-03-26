---
phase: 32-proof-and-ecosystem-docs
plan: 01
subsystem: docs-proof
completed: 2026-03-26T17:01:49Z
duration: ~10min
tags: [ptc, docs, proof, orchestration, code_execution]
provides:
  - focused ecosystem-style CodeExecutor proof for the Milestone 12 helper surface
  - generated code_execution guidance for orchestration and output-budget helpers
  - README ecosystem examples plus doc-contract coverage for Milestone 12
---

# Phase 32 Plan 01: Proof and Ecosystem Docs Summary

**Milestone 12 is now closed:** `pi-ptc-next` now pairs the shipped orchestration/output-budget helper surface with focused ecosystem-style execution proof, aligned `code_execution` tool-description text, and compact README examples for hashline-style reduction, codegraph-style fallback, and web-handle follow-up workflows.

## Performance

| Metric | Value |
|--------|-------|
| Duration | ~10 minutes |
| Started | 2026-03-26T16:55:51Z |
| Completed | 2026-03-26T17:01:49Z |
| Tasks | 3 completed |
| Files modified | 5 product/proof files + PALS artifacts |

## What Was Built

| File | Purpose | Lines |
|------|---------|-------|
| `README.md` | Documents the full Milestone 12 helper surface, when to prefer orchestration helpers over direct one-off tool calls, and compact hashline/codegraph/web composition examples. | 821 |
| `src/index.ts` | Extends the generated `code_execution` tool description with the orchestration/output-budget helper signatures and a short usage note for repeated multi-tool workflows. | 423 |
| `test/index.test.ts` | Locks the new `code_execution` description strings so the registered tool guidance stays aligned with the shipped helper surface. | 1219 |
| `test/orchestration-ecosystem-helper.test.ts` | Adds focused live `CodeExecutor` proof for hashline-style batching/reduction, codegraph-style ordered fallback, and web-handle bounded output fitting. | 406 |
| `test/orchestration-ecosystem-contract.test.ts` | Guards the README orchestration-helper claims against the shipped runtime/helper surface. | 27 |

## Acceptance Criteria Results

| Criterion | Status | Notes |
|-----------|--------|-------|
| AC-1: Ecosystem-style orchestration helpers are proven through the live execution path | Pass | `test/orchestration-ecosystem-helper.test.ts` exercises `ptc.batch_tool(...)`, `ptc.reduce_tool(...)`, `ptc.first_success(...)`, and `ptc.fit_output(...)` through real `CodeExecutor` runs that model hashline-style, codegraph-style, and web-handle workflows without changing runtime semantics. |
| AC-2: The `code_execution` tool description exposes the Milestone 12 helper surface accurately | Pass | `src/index.ts` now advertises `ptc.batch_tool(...)`, `ptc.first_success(...)`, `ptc.reduce_tool(...)`, and `ptc.fit_output(...)`, and `test/index.test.ts` locks those strings plus the short orchestration-guidance note. |
| AC-3: README guidance documents ecosystem-oriented composition for Milestone 12 | Pass | `README.md` now documents the helper list, direct-call vs orchestration guidance, and compact hashline/codegraph/web examples, backed by `test/orchestration-ecosystem-contract.test.ts`. |

## Verification Results

| Command | Result |
|---------|--------|
| `npm run build` | Pass |
| `node --test test/orchestration-ecosystem-helper.test.ts` | Pass (`4` passing / `0` failing) |
| `node --test test/orchestration-ecosystem-contract.test.ts` | Pass (`1` passing / `0` failing) |
| `node --test test/index.test.ts` | Pass (`9` passing / `0` failing) |
| `npm test` | Pass (`132` passing / `0` failing) |
| `npm audit --json` | Baseline unchanged at `0 critical / 2 high / 2 moderate / 1 low` |

## Module Execution Reports

### Apply-phase carried evidence
- **WALT:** Pre-apply baseline was `127` passing / `0` failing; post-apply verification closed green at `132` passing / `0` failing with `npm run build` still clean.
- **TODD:** The phase kept new proof isolated in `test/orchestration-ecosystem-helper.test.ts` and `test/orchestration-ecosystem-contract.test.ts` instead of widening `test/code-executor.test.ts` or reopening the runtime-helper implementation files.
- **DEAN:** Dependency audit baseline remained unchanged and non-blocking at `0 critical / 2 high / 2 moderate / 1 low`.
- **DOCS:** `README.md` and the generated `code_execution` guidance were updated together, closing the intentionally deferred Phase 31 documentation drift without starting a broader docs sweep.
- **RUBY:** Existing large files (`README.md`, `src/index.ts`, `test/index.test.ts`) were touched narrowly, and the new execution proof landed in dedicated focused files rather than broadening unrelated omnibus suites.

### Pre-unify
- No modules are registered for `pre-unify` in the installed registry.

### Post-unify side effects
- **WALT:** Phase 32 was recorded in `.paul/quality-history.md` as improved from the Phase 31 baseline to `132` passing / `0` failing via `npm test`, with build/typecheck still clean via `npm run build`.
- **RUBY:** The configured no-config ESLint complexity invocation is unavailable under the current CLI (`Invalid option '--eslintrc'`), so the debt review fell back to file-size inspection. `README.md` is `821` lines, `src/index.ts` is `423` lines, `test/index.test.ts` is `1219` lines, and `test/orchestration-ecosystem-helper.test.ts` is `406` lines; future proof/docs changes should continue favoring focused companion files over casually growing those anchors further.
- **SKIP:** Captured durable knowledge from this phase:

## [2026-03-26] Close Milestone 12 with proof/docs alignment instead of reopening runtime semantics

**Type:** decision  
**Phase:** 32 — Proof and Ecosystem Docs  
**Related:** `README.md`, `src/index.ts`, `test/index.test.ts`, `test/orchestration-ecosystem-helper.test.ts`, `test/orchestration-ecosystem-contract.test.ts`

**Context:** Phases 30 and 31 already shipped the orchestration/output-budget runtime behavior. Phase 32 only needed milestone-closing proof and user-facing guidance, so reopening `runtime.py`, executor policy, or broader helper semantics would have expanded scope without addressing the actual remaining gap.

**Decision:** Close Milestone 12 by adding focused `CodeExecutor` proof, generated tool-description updates, and README/doc-contract coverage on top of the already-shipped helper surface, while leaving runtime semantics unchanged.

**Alternatives considered:**
- Reopen `src/python-runtime/runtime.py` to add more orchestration semantics during the docs/proof phase — rejected because the shipped behavior already met the milestone's functional needs and Phase 32 was explicitly scoped to proof/docs closure.
- Expand existing omnibus suites instead of adding dedicated ecosystem-proof files — rejected because the repo already has large test anchors and this phase only needed narrow execution-level evidence.

**Rationale:** The smallest defensible close-out was to prove and document the live helper surface exactly as shipped. That keeps the milestone reviewable, avoids unnecessary runtime churn, and turns deferred documentation debt into stable guarded guidance.

**Impact:** Future ergonomics or runtime changes for orchestration helpers now need separate justification; Milestone 12 itself no longer carries proof/docs debt.

## [2026-03-26] Use deterministic ecosystem-style stubs and bounded examples for orchestration-helper proof

**Type:** trade-off  
**Phase:** 32 — Proof and Ecosystem Docs  
**Related:** `test/orchestration-ecosystem-helper.test.ts`, `README.md`

**What we gained:** Stable, deterministic proof for representative hashline-style, codegraph-style, and web-handle workflows without depending on live optional tool availability, network access, or adjacent repository state.

**What we accepted:** The new proof/examples demonstrate realistic workflow shapes rather than using live graph/web integrations end-to-end, so callers must still inspect the live callable session surface before branching on optional tools.

**Conditions for revisiting:** Revisit this trade-off only if adjacent repos expose a stable public contract that justifies a heavier end-to-end harness, or if future milestone work needs stronger live integration evidence than the current bounded proof provides.

## [2026-03-26] Guard model-facing helper guidance with focused doc-contract tests

**Type:** lesson  
**Phase:** 32 — Proof and Ecosystem Docs  
**Related:** `README.md`, `src/index.ts`, `test/index.test.ts`, `test/orchestration-ecosystem-contract.test.ts`

**What happened:** Milestone 12 needed the README and generated `code_execution` description to describe the same helper surface after Phases 30-31 shipped runtime behavior first. Phase 32 added focused assertions that read those guidance surfaces directly and compare them against the shipped helper/runtime contract.

**What we learned:** Model-facing helper guidance stays trustworthy only when documentation claims are locked by focused contract coverage, not by memory or informal review. The drift risk is highest when runtime behavior lands before ecosystem docs.

**How to apply:** When future helper surfaces expand, add a dedicated doc-contract test at the same time so README text and generated tool descriptions fail fast if they diverge from the shipped implementation.

## Accomplishments
- Added focused live `CodeExecutor` proof for hashline-style batching/reduction, codegraph-style ordered fallback, and web-handle bounded output fitting.
- Updated `src/index.ts` and `test/index.test.ts` so the generated `code_execution` description now advertises the full Milestone 12 helper surface and when to use it.
- Expanded `README.md` with helper signatures, orchestration-vs-direct-call guidance, and compact ecosystem examples.
- Added `test/orchestration-ecosystem-contract.test.ts` to lock the README claims to the shipped runtime/helper surface.
- Closed Milestone 12 with verification green at `132` passing / `0` failing and the audit baseline unchanged.

## Files Created/Modified

| File | Change | Purpose |
|------|--------|---------|
| `README.md` | Modified | Documents the Milestone 12 helper surface plus compact ecosystem usage examples. |
| `src/index.ts` | Modified | Extends the generated `code_execution` tool description with the orchestration/output-budget helper guidance. |
| `test/index.test.ts` | Modified | Locks the new tool-description strings and usage note. |
| `test/orchestration-ecosystem-helper.test.ts` | Created | Provides focused live execution proof for representative ecosystem-style orchestration workflows. |
| `test/orchestration-ecosystem-contract.test.ts` | Created | Guards README claims against the shipped helper/runtime surface. |
| `.paul/phases/32-proof-and-ecosystem-docs/32-01-SUMMARY.md` | Created | Records plan-vs-actual reconciliation for Phase 32. |
| `.paul/STATE.md` | Modified | Closes the Phase 32 loop and marks Milestone 12 complete. |
| `.paul/PROJECT.md` | Modified | Records the shipped Phase 32 proof/docs closure and removes the remaining Milestone 12 planned item. |
| `.paul/ROADMAP.md` | Modified | Marks Phase 32 complete and closes Milestone 12. |
| `.paul/MILESTONES.md` | Modified | Adds the completed Milestone 12 history entry. |
| `.paul/quality-history.md` | Modified | Appends the quality snapshot for Phase 32. |

## Decisions Made

| Decision | Rationale | Impact |
|----------|-----------|--------|
| Close Milestone 12 with proof/docs alignment instead of new runtime changes | The shipped helper behavior already existed; the remaining gap was evidence and user-facing guidance. | Future orchestration helper changes should be scoped as new capability work, not retroactive milestone cleanup. |
| Use deterministic ecosystem-style stubs for representative orchestration proof | Bounded proof needed to stay stable and runnable without optional live-tool dependencies. | Future heavier integration harness work should only happen when there is a concrete contract or failure mode worth paying for. |
| Lock README and generated tool guidance with focused contract tests | Model-facing helper guidance drifts easily when runtime behavior ships first. | Future helper docs should add direct contract coverage at the same time as prose changes. |

## Deviations from Plan

### Summary

| Type | Count | Impact |
|------|-------|--------|
| Auto-fixed | 0 | None |
| Offline context | 1 | Low |
| Deferred | 0 | None |

**Total impact:** Low. The planned scope, acceptance criteria, and verification all held.

### Offline context

| Issue | Resolution | Impact |
|-------|------------|--------|
| Pre-existing tracked changes in `.paul/MILESTONES.md` and `docs/personal-fork-maintenance.md`, plus several historical untracked `.paul/**` artifacts, were already present in the worktree during UNIFY. | Reconciliation relied on planned-file diffs, targeted verification, and the current phase artifacts instead of assuming a clean worktree. Local phase-closure git commit creation was left user-directed to avoid sweeping unrelated local work into a single commit. | None on shipped Phase 32 behavior; note only for local git hygiene. |

### Deferred Items
None — Milestone 12's planned proof/docs scope is complete, and broader graph-handle/runtime-reflection ergonomics remain intentionally out of scope.

## Issues Encountered

| Issue | Resolution |
|-------|------------|
| The Node test runner still emits `MODULE_TYPELESS_PACKAGE_JSON` warnings for ESM-style `.ts` tests because `package.json` does not declare `"type": "module"`. | Left unchanged because that packaging decision remains outside the scoped Phase 32 proof/docs work. |
| RUBY's configured no-config ESLint complexity command is not supported by the current CLI (`Invalid option '--eslintrc'`). | Fell back to file-size inspection for the changed files and recorded the large-file hotspots explicitly in the post-unify report. |
| Existing large-file hotspots remain in `README.md`, `src/index.ts`, and `test/index.test.ts`. | Kept edits narrow and moved the new execution proof/doc-contract coverage into dedicated focused files rather than widening those anchors more than necessary. |
| The working tree still contains unrelated local changes outside Phase 32. | Left phase-closure commit creation user-directed for this session so UNIFY could finish without bundling unrelated tracked changes. |

## Next Phase Readiness

**Ready:**
- Milestone 12 is complete: orchestration helpers, reduction/output fitting, ecosystem proof, and user-facing docs are now aligned.
- Full verification is green at `132` passing / `0` failing, and the dependency audit baseline remains unchanged.
- A future milestone can build on a closed orchestration-helper surface instead of carrying Milestone 12 proof/docs debt forward.

**Concerns:**
- `README.md` (`821` lines), `src/index.ts` (`423` lines), and `test/index.test.ts` (`1219` lines) remain large anchors for future documentation/assertion work.
- `src/python-runtime/runtime.py` remains a `656`-line debt hotspot even though Phase 32 did not reopen it.
- The dependency audit baseline remains non-zero at `0 critical / 2 high / 2 moderate / 1 low`.
- Local phase-closure git commit creation is still pending because unrelated worktree changes were present during UNIFY.

**Blockers:**
- None

---
*Phase: 32-proof-and-ecosystem-docs, Plan: 01*  
*Completed: 2026-03-26*
