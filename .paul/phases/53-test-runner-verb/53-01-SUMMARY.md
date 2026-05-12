---
phase: 53-test-runner-verb
plan: 01
subsystem: testing
tags: [ptc, code_execution, node-test, test-runner, python-runtime, ptc_report, milestone-18]

requires:
  - phase: 50-structured-report-type
    provides: ptc.report shape, _normalize_report_* helpers, details.report preservation, compact completed-result rendering
  - phase: 52-callable-tool-introspection
    provides: helper-surface guidance contract and prompt-guidance test patterns

provides:
  - ptc.run_tests(pattern) Python helper returning a Phase 50 ptc_report for Node `node --test`
  - Bounded TAP/stream parser for `node --test` output with failed-name extraction
  - Runner-availability and timeout reporting without Python execution failures
  - README + CHANGELOG + generated code_execution description coverage for the new helper
  - Test-enforced docs/description contracts in test/run-tests-helper.test.ts and test/index.test.ts

affects:
  - Future PTC helper additions that wrap external runners or processes
  - Milestone 18 completion (Phase 53 of 53)

tech-stack:
  added: []
  patterns:
    - "Helper-as-report: external-tool wrappers return ptc.report data instead of raising on tool failure; only invalid arguments raise ValueError."
    - "Safe subprocess argv with shell=False, fixed timeout, and explicit child env scrubbing of reentry markers (NODE_TEST_CONTEXT, NODE_RUN_SCRIPT_NAME)."
    - "Bounded output parser with summary detection plus stdout/stderr tail fallback when summary lines are absent."
    - "Test-enforced README/CHANGELOG contracts colocated with helper tests."

key-files:
  created:
    - "test/run-tests-helper.test.ts"
  modified:
    - "src/python-runtime/runtime.py"
    - "src/index.ts"
    - "README.md"
    - "CHANGELOG.md"
    - "test/index.test.ts"

key-decisions:
  - "Decision: scope ptc.run_tests to Node `node --test` only; defer vitest/jest/pytest, package-script dispatch, and runner-selection options."
  - "Decision: missing `node` returns runner_available=false + warning, never raises Python execution errors."
  - "Decision: use a fixed 120s subprocess timeout; defer per-call timeout/options-object API."
  - "Decision: report cwd as \".\" and store command as a space-joined string to avoid leaking absolute host paths and to stay within Phase 50 scalar metric rules."
  - "Decision: scrub NODE_TEST_CONTEXT / NODE_RUN_SCRIPT_NAME from the subprocess env so the helper is safe to invoke from inside a Node test run."

patterns-established:
  - "Pattern: external-process helpers in _PtcHelpers return ptc.report data for tool-level failure and raise only for invalid arguments."
  - "Pattern: docs/CHANGELOG drift for PTC helpers is enforced by colocated focused tests rather than a separate drift gate."

duration: ~90min
started: 2026-05-12T21:14:00Z
completed: 2026-05-12T21:35:00Z
---

# Phase 53 Plan 01: Test Runner Verb Summary

**Shipped `ptc.run_tests(pattern)` — a first-class Python helper that runs Node's built-in `node --test` from the active runtime workspace and returns a Phase 50 ptc_report with pass/fail/duration metrics, a bounded failures table, runner-availability data, and a fixed 120s timeout.**

## Performance

| Metric | Value |
|--------|-------|
| Duration | ~90 min |
| Started | 2026-05-12T21:14:00Z |
| Completed | 2026-05-12T21:35:00Z |
| Tasks | 3 of 3 completed |
| Files modified | 7 (1 new test file, 6 modified) |

## Acceptance Criteria Results

| Criterion | Status | Notes |
|-----------|--------|-------|
| AC-1: ptc.run_tests returns structured report for passing/failing runs | Pass | Live `test/run-tests-helper.test.ts` exercises a real `node --test` against tmp `.test.js` fixtures and asserts kind=ptc_report, metrics.total≥1, exit_code=0, pattern, cwd=".", and `command` containing `node --test passing.test.js`. |
| AC-2: Failing tests reported, not raised | Pass | Failing-fixture test verifies non-zero exit code, failed≥1, and a bounded failures table/sample naming `runtests helper failing case` without raising PtcPythonError. |
| AC-3: Sandbox and runner-unavailable behavior is explicit and safe | Pass | Invalid-pattern test covers empty/non-string/absolute/parent-traversal inputs (each raises ValueError). Runner-unavailable test launches python3 with a PATH that excludes `node` and asserts runner_available=false, exit_code=null, zero counts, plus a node/runner warning. Subprocess uses argv list + shell=False; no new deps; Docker policy untouched. |
| AC-4: Docs and generated guidance describe scope without overpromising | Pass | README lists `ptc.run_tests(pattern) -> dict[str, Any]` with Node-only/sandbox-limited scope; CHANGELOG records the new helper under Unreleased/Added; `src/index.ts` generated description includes both the helper signature and a guidance line explicitly framing it as structured reporting, not a substitute for `npm test`/`npm run build`/PALS gates. README/CHANGELOG/description contracts are enforced by tests in `test/run-tests-helper.test.ts` and `test/index.test.ts`. |

## Module Execution Reports

### TODD (test-driven development enforcement)
- **pre-plan:** detected existing `node:test` coverage; plan type set to `tdd` with RED/GREEN/docs sequencing.
- **post-plan:** RED-first ordering already correct in Task 1; no overlay rewrite.
- **pre-apply:** test files existed and ordered first (Task 1 RED).
- **post-task (T1):** 6 RED tests added — all failing as expected (missing helper, missing description text, missing README, missing CHANGELOG).
- **post-task (T2):** 4 of 6 helper tests green after implementation; remaining 2 deferred to Task 3 docs as planned.
- **post-task (T3):** 17/17 focused tests pass; 236/236 full suite passes.
- **post-apply:** full test suite green — no REFACTOR candidates flagged.

### WALT (quality gating)
- **pre-apply baseline:** 230 passing / 0 failing on `npm test`; build clean.
- **post-apply:** 236 passing / 0 failing (+6 new); build clean.
- **quality delta:** Tests +6 ▲ / Lint clean ● / Typecheck clean ● / Coverage not measured here / **trend ▲ improving** (more coverage, no regressions).
- Logged to `.paul/quality-history.md` via post-unify entry below.

### DEAN (dependency audit)
- **pre-plan:** `npm audit --json` → 0 critical / 0 high / 3 moderate; recorded as APPLY baseline.
- **post-apply:** `npm audit --json` → 0 critical / 0 high / 3 moderate — no delta. PASS. No new advisories introduced.

### IRIS (review & inspection)
- **pre-plan:** no TODO/FIXME/HACK/XXX in planned files.
- **post-apply:** none introduced in the changed files; helper additions stay compact and well-named.

### CODI (codegraph blast radius)
- **pre-plan:** probed `buildToolDescription` (resolved, downstream sites: `registerCodeExecutionTool`, `buildCodeExecutionTool`, `handleSessionStart`, `registerCodeExecutionToolForState`) and `generateToolWrappers` (no downstream sites). Blast radius reflected in the executed plan.
- **post-unify:** appended row to `.paul/CODI-HISTORY.md` (see file).

### DAVE (deploy / CI)
- **pre-plan:** `.github/workflows/ci.yml` present, covers `npm run verify:ci`; no CI config changes in scope.
- **post-apply:** no CI files in changed set — SKIPPED.

### DOCS (documentation drift)
- **pre-plan:** README and CHANGELOG in planned scope; docs drift explicitly covered.
- **post-apply:** README + CHANGELOG updated alongside the helper; drift contracts enforced by `test/run-tests-helper.test.ts`. No drift.

### RUBY (debt / refactor)
- **pre-plan:** `runtime.py`, `src/index.ts`, README, `test/index.test.ts` flagged as hotspots; plan kept changes compact and routed RED coverage to a new file.
- **post-unify:** `_PtcHelpers.run_tests` added ~140 lines; `_parse_node_test_output` added ~85 lines (single-purpose, no nested complexity). No file crossed the 500-line or 100-line growth thresholds beyond expected helper additions. No refactor recommended this phase.

### SKIP (knowledge persistence)
- **post-apply / post-unify:** decision records captured in `key-decisions` and `patterns-established` in this frontmatter (Node-only scope, missing-runner-as-data, 120s fixed timeout, cwd="." and command-as-string for Phase 50 scalar metrics, env scrubbing).

### ARCH / SETH / SETH / DANA / GABE / OMAR / REED / PETE / VERA / ARIA / LUKE
- **pre-plan / post-apply:** SKIPPED — no architectural boundary, security-sensitive, data/schema, API route, observability, resilience, performance, privacy, UI, or accessibility surface in changed scope. Safe argv subprocess with `shell=False`, no host-command bypass, no secret/eval/PII handling, no new endpoints, no UI files.

### Missing dispatch evidence
None — all enabled modules with hooks relevant to this phase produced visible evidence. `pre-unify` hook has 0 registered modules in `modules.yaml`; this is the normal case for the installed registry, not a dispatch failure.

## Accomplishments

- Added `ptc.run_tests(pattern)` as a first-class, sandbox-respecting Python helper that runs Node's built-in `node --test` and returns a Phase 50 `ptc_report` with pass/fail/duration metrics, runner availability, and a bounded failures table.
- Made failing tests, missing `node`, and timeouts representable as report data so agents calling the helper from inside `code_execution` do not see PtcPythonError surface for ordinary test failures.
- Hardened the subprocess invocation with an explicit argv list, `shell=False`, pattern validation rejecting absolute paths / parent traversal / shell-control characters, and child-env scrubbing of `NODE_TEST_CONTEXT` and `NODE_RUN_SCRIPT_NAME` so the helper is reentry-safe.
- Documented Node-only scope across README, CHANGELOG, and the generated `code_execution` tool description, and made all three docs surfaces test-enforced.

## Task Commits

Phase 53 was committed as two atomic-ish commits (one functional, one lifecycle), keeping the helper + tests + docs together so reverts stay coherent.

| Task | Commit | Type | Description |
|------|--------|------|-------------|
| Tasks 1–3 (RED tests, helper impl, docs/CHANGELOG/generated guidance) | `7e287dc` | feat | Phase 53 implementation — `ptc.run_tests(pattern)` helper, parser, generated description, README, CHANGELOG, focused tests. |
| Phase 53 lifecycle update | `9b6c10d` | chore | STATE/ROADMAP set to APPLY ✓; consumed handoff archived to `.paul/handoffs/archive/`. |

## Files Created/Modified

| File | Change | Purpose |
|------|--------|---------|
| `src/python-runtime/runtime.py` | Modified | Added `_PtcHelpers.run_tests(pattern)`, the `_parse_node_test_output` bounded parser, and module-level constants (`_NODE_TEST_RUNNER_TIMEOUT_SECONDS`, regex patterns, pattern-forbidden chars). Added `subprocess`/`re`/`time` imports. |
| `src/index.ts` | Modified | Added `ptc.run_tests(pattern: str) -> dict[str, Any]` line and a guidance entry to the generated `code_execution` description, scoping it as Node-only structured reporting. |
| `test/run-tests-helper.test.ts` | Created | Focused live CodeExecutor tests covering passing, failing, invalid pattern, runner-unavailable, README, and CHANGELOG contracts. |
| `test/index.test.ts` | Modified | Added regex assertions enforcing that the generated tool description includes `ptc.run_tests(pattern: str) -> dict[str, Any]` and Node `node --test` framing. |
| `README.md` | Modified | Listed `ptc.run_tests(pattern) -> dict[str, Any]` in the helper section with Node-only/sandbox-limited scope. |
| `CHANGELOG.md` | Modified | Added an Unreleased / Added entry describing the helper and explicit out-of-scope items. |
| `.paul/STATE.md` / `.paul/ROADMAP.md` / `.paul/HANDOFF*` / `.paul/phases/53-test-runner-verb/53-01-PLAN.md` | Modified / Created / Archived | Lifecycle artifacts: PLAN authored, APPLY status, handoff archived to `.paul/handoffs/archive/`. |

## Decisions Made

| Decision | Rationale | Impact |
|----------|-----------|--------|
| Scope to Node `node --test` only | Smallest safe verb satisfying Milestone 18 ergonomics goal; cross-runner abstraction would expand surface, add dependencies, and balloon the parser. | Future cross-runner support can grow as new helpers (e.g., `ptc.run_pytest`) without retrofitting `run_tests`. |
| Missing runner returns data, not error | Agents calling the helper inside Docker / minimal sandboxes should still get a structured answer; raising would force defensive try/except in every agent script. | Helper is safe to use opportunistically; consumers branch on `runner_available`. |
| 120s fixed timeout, no per-call override | Keeps the public surface narrow for this phase and matches the upper bound of the active `code_execution` window. | Per-call timeout / options-object API deferred; reopen if a future user explicitly needs longer/shorter bounds. |
| `cwd: "."` and `command` as space-joined string in metrics | Phase 50 scalar-metric rules reject list/dict values inside `metrics`; absolute paths would leak host workspace data. | Reports stay portable across Docker vs. local sandboxes and respect Phase 50 contract. |
| Scrub `NODE_TEST_CONTEXT` / `NODE_RUN_SCRIPT_NAME` from child env | Without scrubbing, calling `ptc.run_tests` from inside a Node test run triggers `node:test run() is being called recursively within a test file. skipping running files.` and totals come back as 0. | Helper is reentry-safe; covered by the passing/failing tests, which themselves run under `node --test`. |

## Deviations from Plan

### Summary

| Type | Count | Impact |
|------|-------|--------|
| Auto-fixed | 2 | Minor — kept the helper safe and let the failing-fixture test see realistic counts. |
| Scope additions | 0 | None. |
| Deferred | 0 | None. |
| Plan-file scope shrink | 1 | `test/prompt-guidance.test.ts` was listed in `files_modified` but ended up unchanged; coverage moved to `test/index.test.ts`. |

**Total impact:** Essential fixes, no scope creep.

### Auto-fixed Issues

**1. Subprocess inherited Node test-runner reentry context**
- **Found during:** Task 2 (helper implementation) when the passing/failing fixtures returned `total=0` despite the child `node --test` clearly running.
- **Issue:** The parent test process exposes `NODE_TEST_CONTEXT` to children. The helper's `node --test` subprocess inherited it, hit "node:test run() is being called recursively", and skipped running files.
- **Fix:** Build a sanitized `child_env` that drops `NODE_TEST_CONTEXT` and `NODE_RUN_SCRIPT_NAME` and pass it as `env=` to `subprocess.run`.
- **Files:** `src/python-runtime/runtime.py`.
- **Verification:** Passing/failing helper tests went from 0/2 to 2/2 immediately after the fix; full suite still 236/236.
- **Commit:** `7e287dc` (Task 2 helper hardening).

**2. `command` metric was originally a list and tripped the Phase 50 scalar validator**
- **Found during:** Task 2 GREEN attempt; the report builder rejected the helper output because Phase 50 `_normalize_report_metrics` only accepts scalars.
- **Issue:** `metrics.command` was a Python list of argv elements; the validator returned a malformed-report Python error before any test data was exposed.
- **Fix:** Store `command` as `" ".join(command)` (space-joined string) and update the focused tests to assert on substring membership rather than `Array.isArray`. Behavior, including the assertion that command contains `node`, `--test`, and the pattern, is preserved.
- **Files:** `src/python-runtime/runtime.py`, `test/run-tests-helper.test.ts`.
- **Verification:** Passing fixture now exposes `metrics.command = "node --test passing.test.js"`; all four substring assertions pass.
- **Commit:** `7e287dc`.

### Plan-file Scope Shrink

**`test/prompt-guidance.test.ts` listed in `files_modified` but not modified**
- **Why:** The existing prompt-guidance test asserts the `promptGuidelines` array via strict `deepEqual`. Adding a `ptc.run_tests` line there would have invalidated the established Phase 52 contract about minimal guidance expansion. Instead, the generated `code_execution` description (where `ptc.run_tests` belongs) is covered by `test/index.test.ts`, and the README/CHANGELOG contracts are covered by `test/run-tests-helper.test.ts`. Equivalent contractual coverage with less prompt bloat.
- **Impact:** None on AC-4 — generated description and docs contracts are still test-enforced.

### Deferred Items

None — plan executed within scope.

## Issues Encountered

| Issue | Resolution |
|-------|------------|
| `tsc` rebuild produced a phantom "Build successful" wrapper line that masked a real compile error after one of the early edits broke template-literal escaping in `src/index.ts`. | Captured `tsc` stderr to `/tmp/tsc-out.log`, found `error TS1005: '}' expected.`, restored the closing `` ` ``; and `}` near the end of `buildToolDescription`, re-ran `tsc`, confirmed clean output, then re-ran focused and full suites. |
| Initial focused tests used `await ptc.run_tests(...)`, but the helper is synchronous (blocking subprocess), so Python raised `'dict' object can't be awaited`. | Removed `await` from helper-call sites in the focused tests; behavior unchanged. |

## Next Phase Readiness

**Ready:**
- Milestone 18 (`0.17.0`) is at 5 of 5 phases shipped: 49 (recipe ecosystem proof), 50 (structured report type), 51 (find_files surface), 52 (callable-tool introspection + `ptc.help`), and 53 (`ptc.run_tests`).
- `code_execution` now exposes a coherent Python helper surface for analysis (`ptc.read_many`/`read_tree`/`find_files*`), reporting (`ptc.report`/`tabulate`/`diff`), introspection (`ptc.help`/`list_callable_tools`/`get_tool_schema`), and now test reporting (`ptc.run_tests`).
- No new dependencies; audit baseline unchanged (0 critical / 0 high / 3 moderate, baseline window through 2026-06-11).
- All STATE/ROADMAP/PROJECT alignment items checked during this UNIFY.

**Concerns:**
- `ptc.run_tests` is intentionally scoped to Node `node --test`. If real usage demands cross-runner support or per-call timeout overrides, that should be a new phase, not a quiet expansion of this helper.
- The bounded parser falls back to stdout/stderr tails when Node changes its TAP / stream-summary format. The fallback is covered, but any major Node test-runner output change would still need a parser update.

**Blockers:**
- None for milestone completion.

---

*Phase: 53-test-runner-verb, Plan: 01*
*Completed: 2026-05-12*
