---
phase: 35-proof-and-ecosystem-documentation
plan: 01
completed: 2026-03-26T19:30:00Z
duration: ~15 minutes active APPLY/UNIFY work
---

## Objective
Add user-facing recipe workflow documentation to README.md and a dedicated ecosystem composition proof test that validates all four adjacent-repo workflow types compose cleanly through PTC helpers.

## What Was Built
| File | Purpose | Lines |
|------|---------|-------|
| `README.md` | Added "Recipe workflows" subsection documenting all 4 workflow types, helper usage table, CLI invocation, and extension guide | +31 lines |
| `test/recipe-ecosystem-proof.test.ts` | New focused ecosystem composition proof: 13 tests covering artifact existence, PTC helper patterns, no domain imports, and baseline coverage | 154 |

## Acceptance Criteria Results
| AC | Description | Status | Evidence |
|----|-------------|--------|----------|
| AC-1 | README recipe documentation | PASS | Recipe workflows subsection documents graph, web, hashline, and mixed workflows with helper tables, CLI, and extension guide |
| AC-2 | Ecosystem composition proof | PASS | `node --test test/recipe-ecosystem-proof.test.ts` — 13/13 passing; all 4 workflows validated for artifact existence, bounded PTC helper usage, no domain imports, and baseline coverage |
| AC-3 | No regression or scope widening | PASS | `npm run build` clean; only README.md and new test file modified; full suite 153 total / 152 passing / 1 pre-existing failure |

## Verification Results
| Command | Result |
|---------|--------|
| `npm run build` | PASS |
| `node --test test/recipe-ecosystem-proof.test.ts` | PASS (13 tests) |
| `node --test test/eval-cases.test.ts test/benchmark-runner.test.ts` | PASS (17 tests, unchanged) |
| `node --test` | PASS WITH CONCERNS — 153 total / 152 passing / 1 pre-existing `test/hashline-real-interop.mjs` failure |
| `npm audit --json` | PASS WITH CONCERNS — 0 critical / 2 high / 8 moderate / 1 low |

## Module Execution Reports
### Pre-plan dispatch
- `DEAN(50)`: 0 critical, 2 high (unchanged baseline) — PASS
- `TODD(100)`: test runner detected, 17 focused recipe/benchmark tests passing — PASS
- `IRIS(150)`: 0 anti-patterns in target files — skip
- `DAVE(200)`: CI config found — skip
- `DOCS(200)`: README is primary doc surface — skip
- `RUBY(250)`: README at 821 lines (known hotspot) — 0 debt flags

### Pre-apply dispatch
- `TODD(50)`: test files exist, baseline recorded — PASS
- `WALT(100)`: baseline recorded: 140 total / 139 passing / 1 failing — PASS

### Post-apply advisory
- `IRIS(250)`: 0 anti-patterns in changed files — skip
- `DOCS(250)`: README updated, no CHANGELOG drift — skip
- `RUBY(300)`: README at 852 lines (+31, acceptable); test at 154 lines (compact) — 0 debt flags
- `SKIP(300)`: no new decisions (pure docs/proof phase)

### Post-apply enforcement
- `WALT(100)`: 153 total / 152 passing / 1 failing; baseline 140→153 (+13 new, 0 regressions); build PASS — PASS
- `DEAN(150)`: 0 critical, 2 high (unchanged) — PASS
- `TODD(200)`: focused recipe tests 30/30 green — PASS

### Pre-unify dispatch
- `[dispatch] pre-unify: 0 modules registered for this hook`

### Post-unify reports
- `WALT(100)`: quality history recorded in `.paul/quality-history.md` — Phase 35 marked as improving: 152 passing / 1 failing (unchanged pre-existing), clean typecheck.
- `SKIP(200)`: no new decisions to capture (pure docs/proof phase).
- `RUBY(300)`: 0 debt flags; README at 852 lines (+31, acceptable growth); test file at 154 lines (compact).

## Deviations
- The baseline composition test (Task 2) needed one in-task fix: the baseline file stores `case_id` nested under `result` and uses full recipe-stem workflow names (e.g., `codegraph-web-evidence-merge`) rather than short workflow keys (e.g., `mixed`). The test was corrected to match by recipe filename stem. No approach change or plan deviation — resolved within normal task execution.

## Key Patterns / Decisions
- Recipe documentation stays inside the existing "Deterministic JSON evals and benchmarks" section as a subsection to avoid README section proliferation
- Ecosystem proof matches recipe filenames to baseline workflow entries by stem rather than abstract workflow labels, keeping the test aligned to actual artifact naming

## Next Phase
Phase 35 is the last phase in Milestone 13. If this is confirmed as the final plan, transition to milestone completion.
