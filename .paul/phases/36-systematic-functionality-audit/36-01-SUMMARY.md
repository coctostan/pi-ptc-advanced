---
phase: 36-systematic-functionality-audit
plan: 01
completed: 2026-03-26T23:20:00Z
duration: ~45 minutes active APPLY/UNIFY work
---

## Objective
Create and run a comprehensive live-tool audit exercising every pi-ptc-next Python helper and pipeline capability with real tool calls, producing a durable scorecard with per-capability ratings.

## What Was Built
| File | Purpose | Lines |
|------|---------|-------|
| `test/live-audit-helpers.test.ts` | 21 tests exercising all Python helpers through real Python runtime with stub tools | 410 |
| `test/live-audit-pipeline.test.ts` | 8 tests covering RPC bridge, ptcValue passthrough, error boundaries, output truncation, asyncio.run rejection | 204 |
| `.paul/phases/36-systematic-functionality-audit/AUDIT-SCORECARD.md` | Per-capability scorecard with 29 ratings, gap analysis, and Phase 37 recommendations | 99 |

## Acceptance Criteria Results
| AC | Description | Status | Evidence |
|----|-------------|--------|----------|
| AC-1 | All 21 helpers exercised with real tool calls | PASS | 21/21 tests pass; 18 working, 3 documented-bug tests (find_files, find_files_abs, read_tree) |
| AC-2 | Pipeline audit covers RPC bridge and error boundaries | PASS | 8/8 tests pass; RPC round-trip, ptcValue passthrough, 3 error types, output truncation, asyncio.run rejection |
| AC-3 | Durable scorecard artifact produced | PASS | AUDIT-SCORECARD.md has 29-capability table, gap analysis with root causes, and Phase 37 recommendations |

## Verification Results
| Command | Result |
|---------|--------|
| `npm run build` | PASS |
| `node --test test/live-audit-helpers.test.ts` | PASS (21 tests) |
| `node --test test/live-audit-pipeline.test.ts` | PASS (8 tests) |
| `node --test` | PASS WITH CONCERNS — 182 total / 181 passing / 1 pre-existing failure |
| `npm audit --json` | PASS WITH CONCERNS — 0 critical / 2 high / 8 moderate / 1 low (unchanged) |

## Module Execution Reports
### Pre-plan dispatch
- `DEAN(50)`: 0 critical, 2 high (unchanged) — PASS
- `TODD(100)`: 153 total / 152 passing / 1 pre-existing — baseline recorded

### Pre-apply dispatch
- `TODD(50)`: PASS | `WALT(100)`: baseline 153/152/1 — PASS

### Post-apply advisory
- `IRIS(250)`: 0 anti-patterns | `DOCS(250)`: README not modified (scorecard is artifact) | `RUBY(300)`: test files reasonable size | `SKIP(300)`: 1 critical bug, 2 minor findings documented

### Post-apply enforcement
- `WALT(100)`: 182/181/1; +29 new, 0 regressions — PASS | `DEAN(150)`: unchanged — PASS | `TODD(200)`: all audit tests green — PASS

### Pre-unify dispatch
- `[dispatch] pre-unify: 0 modules registered for this hook`

### Post-unify reports
- `WALT(100)`: quality history recorded — 181 passing / 1 failing, trend ↑ improving
- `SKIP(200)`: critical bug documented (glob/limit); 2 minor findings (syntax error reporting, output truncation overhead)
- `RUBY(300)`: 0 debt flags; new files at reasonable sizes

## Audit Findings Summary

### Critical (3 helpers broken)
- **`ptc.find_files()`, `ptc.find_files_abs()`, `ptc.read_tree()`** — all fail because `find_files()` calls `glob(limit=max_files)` but the Python `glob()` wrapper does not accept a `limit` keyword argument. Same root cause, single fix needed.

### Partial (2 pipeline quirks)
- **Syntax error reporting** — Python syntax errors crash the subprocess; caught as "RPC stdout closed" rather than a structured PtcPythonError with the SyntaxError traceback.
- **Output truncation overhead** — `maxOutputChars=200` produces ~258 chars of output. Truncation works but adds ~50-60 chars of framing overhead.

### Observations
- All 5 core wrappers (read, grep, find, ls, glob) require `await`
- `grep()` takes keyword-only args — positional args fail with unhelpful error
- `ptc.expect_kind()` requires a dict with a `kind` field — raw strings fail (correct but non-obvious)
- `ptc.get_tool_schema()` returned keys depend on registration; no guaranteed `name` field at top level

## Deviations
- Initial test run failed all 21 tests because the CodeExecutor was passed a tmpdir workspace as the extension root instead of `process.cwd()`. Fixed on first retry — no approach change needed.
- `PtcPythonError` import removed from pipeline test (unused — syntax errors surface as RPC close, not PtcPythonError). Amend-committed.

## Key Patterns / Decisions
- Document real bugs as `assert.rejects` tests that prove the bug exists, rather than skipping or faking success — keeps the audit honest and the tests repeatable
- Scorecard uses honest ratings (✅/⚠️/❌/⏭️) with evidence links to specific error messages

## Next Phase
Phase 37 (Stress and Edge Case Testing) should prioritize:
1. Fix the glob/limit bug first, then stress-test find_files and read_tree with large repos
2. Concurrency stress with 10+ parallel calls via batch_tool and gather_limit
3. Large file reads (500+ lines) and output budget stress with fit_output
4. Error recovery and missing tool handling
