---
phase: 33-recipe-targets-and-example-contracts
plan: 01
completed: 2026-03-26T17:36:13Z
duration: ~15min
---

# Phase 33 Plan 01: Recipe Targets and Example Contracts Summary

## Objective
Define the first M4 ecosystem-recipes contract layer without reopening runtime semantics: add additive recipe-target metadata to the seeded eval/benchmark surface, seed deterministic recipe cases for the four intended workflow shapes, and prove benchmark consumption stays deterministic.

## What Was Built
| File | Purpose | Lines |
|------|---------|-------|
| `src/eval-cases.ts` | Adds additive `recipe_target` typing and validation so deterministic eval cases can declare adjacent-repo workflow targets and bounded output contracts. | 165 |
| `src/benchmark-runner.ts` | Preserves optional `recipe_target` metadata in benchmark result records without changing existing summary/comparison behavior. | 472 |
| `.pi/evals/ptc/cases/recipe-graph-compact-ranking.json` | Seeds the graph-ranking M4 recipe case. | 25 |
| `.pi/evals/ptc/cases/recipe-web-answer-comparison.json` | Seeds the multi-URL answer-comparison M4 recipe case. | 25 |
| `.pi/evals/ptc/cases/recipe-hashline-anomaly-summary.json` | Seeds the anchored-file anomaly-summary M4 recipe case. | 25 |
| `.pi/evals/ptc/cases/recipe-codegraph-web-evidence-merge.json` | Seeds the mixed codegraph + web evidence-merge M4 recipe case. | 25 |
| `test/eval-cases.test.ts` | Expands deterministic eval-case coverage to include the new recipe corpus, recipe metadata assertions, and malformed recipe-target validation. | 118 |
| `test/benchmark-runner.test.ts` | Adds focused proof that recipe-tagged cases survive benchmark loading and deterministic run generation, and converts the suite to import-based syntax that passes targeted TS diagnostics cleanly. | 378 |

## Acceptance Criteria Results
| Criterion | Status | Notes |
|-----------|--------|-------|
| AC-1: Eval-case schema can describe recipe targets additively | Pass | `src/eval-cases.ts` now validates optional `recipe_target` metadata with bounded output-contract fields, and existing routing/acceptance fields remain intact. |
| AC-2: Seeded recipe cases cover the intended M4 workflow shapes | Pass | Four deterministic recipe cases now cover graph ranking, URL comparison, hashline anomaly summarization, and codegraph-plus-web evidence merge under `.pi/evals/ptc/cases/`. |
| AC-3: Benchmark-facing consumption remains deterministic | Pass | `src/benchmark-runner.ts` and `test/benchmark-runner.test.ts` prove that recipe metadata is preserved through benchmark result records without redesigning the benchmark runner. |

## Verification Results
| Command | Result |
|---------|--------|
| `npm run build` | Pass |
| `node --test test/eval-cases.test.ts` | Pass (`6` passing / `0` failing) |
| `node --test test/benchmark-runner.test.ts` | Pass (`7` passing / `0` failing) |
| `npx tsc --noEmit --target es2022 --module nodenext --moduleResolution nodenext --types node test/eval-cases.test.ts test/benchmark-runner.test.ts` | Pass |
| `npm test` | Pass (`135` passing / `0` failing) |
| `npm audit --json` | Baseline unchanged at `0 critical / 2 high / 2 moderate / 1 low` |

## Module Execution Reports
### Apply-phase carried evidence
- **TODD:** Focused benchmark/eval suites stayed isolated in `test/eval-cases.test.ts` and `test/benchmark-runner.test.ts`, and the final full suite remained green.
- **WALT:** Quality improved from the Phase 32 baseline of `132` passing / `0` failing to `135` passing / `0` failing after the new recipe-contract coverage landed.
- **DEAN:** Dependency audit remained unchanged and non-blocking at `0 critical / 2 high / 2 moderate / 1 low`.
- **DOCS:** Intentional doc drift remains for this phase because `README.md`, generated tool guidance, and broader ecosystem proof were explicitly deferred to Phase 35.
- **IRIS:** No secret-pattern hits were found in the changed files; the configured no-config ESLint invocation is still unsupported by the current CLI, so smell review remained bounded.

### Pre-unify
- No modules are registered for `pre-unify` in the installed registry.

### Post-unify side effects
- **WALT:** Recorded the Phase 33 quality delta in `.paul/quality-history.md` as `135` passing / `0` failing via `npm test`, with build/typecheck still clean via `npm run build`.
- **RUBY:** The configured ESLint complexity command is still unavailable under the current CLI (`Invalid option '--eslintrc'`), so debt review fell back to file-size inspection. `src/benchmark-runner.ts` remains the largest changed product file at `472` lines, while `test/benchmark-runner.test.ts` is `378` lines and `src/eval-cases.ts` is `165` lines; future benchmark-fixture work should keep avoiding broad helper-runner expansion without need.
- **SKIP:** Captured durable phase knowledge in the decisions/lessons sections below rather than omitting post-unify knowledge extraction entirely.

## Decisions Made
| Decision | Rationale | Impact |
|----------|-----------|--------|
| Keep Phase 33 additive to eval/benchmark contracts instead of introducing a broader recipe DSL | The phase goal was to define targets and bounded expectations, not redesign runtime orchestration surfaces. | Phase 34 can build concrete fixtures and examples on top of stable recipe metadata without reopening helper semantics. |
| Preserve recipe metadata in benchmark result records rather than only at load time | Downstream proof and comparisons need access to recipe intent after case parsing. | Benchmark-oriented recipe examples can stay deterministic and JSON-native. |
| Convert the new test files to import-based syntax and `process.cwd()` path resolution | Post-apply diagnostics surfaced CommonJS-targeted TS complaints around `require(...)` and `import.meta`. | Phase 33 closes with clean targeted diagnostics for the modified tests without changing package-level module mode. |

## Deviations
### Summary
| Type | Count | Impact |
|------|-------|--------|
| Auto-fixed | 2 | Low |
| Offline context | 1 | Low |
| Deferred | 1 | Low |

### Auto-fixed
| Issue | Resolution | Impact |
|-------|------------|--------|
| Task 3 initially asserted the wrong expected workflow string in `test/benchmark-runner.test.ts`. | Corrected the assertion from the case id-style string to the actual workflow metadata value and re-ran the focused benchmark test. | None beyond one bounded retry. |
| After APPLY, targeted diagnostics flagged the modified tests for `require(...)`, `import.meta`, and inferred types. | Converted `test/eval-cases.test.ts` and `test/benchmark-runner.test.ts` to import-based syntax, switched path resolution to `process.cwd()`, and added local helper types before re-running targeted verification and the full suite. | None on shipped behavior; the final test surface is cleaner. |

### Offline context
| Issue | Resolution | Impact |
|-------|------------|--------|
| The worktree still contains unrelated local `.codegraph/` state outside the phase scope. | Reconciliation, verification, and planned commit staging stayed scoped to the phase files rather than sweeping unrelated local artifacts into the phase result. | None on shipped Phase 33 artifacts. |

### Deferred
| Issue | Resolution | Impact |
|-------|------------|--------|
| README/tool-description alignment and broader ecosystem proof still lag the new recipe-target corpus. | Left intentionally deferred to Phase 35, which already owns user-facing recipe docs and proof. | Low; documented drift is expected until the later milestone phase. |

## Lessons Learned
### Guard deterministic recipe metadata with focused file-local proof
The additive `recipe_target` contract stayed low-risk because the new seeded cases and benchmark passthrough were locked by focused tests instead of broad omnibus suites. Future recipe expansion should keep this pattern: define bounded metadata, add narrow proof, and avoid treating the benchmark runner as a general-purpose workflow engine.

### Test-file module syntax matters even when runtime behavior is unchanged
The user-surfaced diagnostics on the new tests did not indicate a product bug, but they still mattered. Converting the touched suites to import-based syntax and `process.cwd()` path resolution kept the phase closure honest and prevented avoidable follow-up noise in the exact files this phase introduced.

## Next Phase
Phase 33 is complete. The next step is Phase 34 — Cross-Repo Recipes and Benchmark Fixtures — to turn the new recipe-target contract into concrete recipe artifacts and benchmark-style examples while keeping large intermediate results local.
