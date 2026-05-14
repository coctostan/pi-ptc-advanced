# Phase 62-01 Source Visibility Audit

## Scope

Phase 62 is read-only for product code. It audits the current `code_execution` Python-source visibility path and does not change `src/**`, `test/**`, README, package metadata, or installed Pi files.

States covered:

- running / partial execution updates;
- completed successful executions;
- failed executions from framed Python errors, pre-terminal Python failures, protocol/transport failures, and generic execution errors.

User-visible target being audited: collapsed-by-default first-line preview, expanded full Python source, and consistent availability across running, success, and failure states while keeping Python source in structured result details rather than normal stdout/result text.

## Evidence Map

| Area | Evidence | Current source-visibility relevance |
|---|---|---|
| Details contract | `src/contracts/execution-types.ts:52-60` (`ExecutionDetails`) | `userCode?: string[]` is the only structured field intended to carry Python source. It sits beside `currentLine`, `totalLines`, telemetry, recovery, and report details. |
| RPC message contract | `src/contracts/execution-types.ts:24-31` (`RpcMessage`) | Progress frames carry only `line`/`total_lines`; complete frames carry `output`/optional `report`; error frames carry `message`/optional `traceback`. No wire frame carries source explicitly. |
| RPC source capture | `src/rpc-protocol.ts:188-215` (`RpcProtocol`, `userCodeLines`) | Constructor receives raw user code and stores `this.userCodeLines = userCode.split("\n")`, making source available inside the protocol instance. |
| Running details | `src/rpc-protocol.ts:385-399` (`execution_progress`) | Partial `onUpdate` payloads include `currentLine`, `totalLines`, and `userCode: this.userCodeLines`. |
| Success details | `src/rpc-protocol.ts:407-413` (`complete`) | Successful completion resolves with `details: this.buildExecutionDetails(reportDetails)`, but does not pass `userCode`. As implemented in this file, completed success details omit Python source. |
| Non-source update details | `src/rpc-protocol.ts:421-426` (`update`) and `src/rpc-protocol.ts:432-440` (`tool_call`) | Generic update/tool-call partial details call `buildExecutionDetails()` without `userCode`, so those transient updates cannot render source. |
| Error path | `src/rpc-protocol.ts:417-419` (`error`) and `src/rpc-protocol.ts:315-325` (`buildUnexpectedCloseError`) | Error paths reject with `PtcPythonError`/transport/protocol errors instead of resolving a `CodeExecutionResult` with `details.userCode`. |
| Executor success/error behavior | `src/code-executor.ts:58-93` (`CodeExecutor.execute`) | Success returns `output` plus `result.details`; catch rethrows `PtcPythonError`/`Error`, so failed executions bypass normal result details. |
| Tool result wrapping | `src/index.ts:262-295` (`buildCodeExecutionTool.execute`) | Success returns `{ content, details: { ...result.details, telemetry, recovery } }`; catch records recovery state and throws the error. No failed-result `details.userCode` is returned. |
| Partial renderer | `src/index.ts:53-83` (`renderExecutingCode`) and `src/index.ts:297-305` (`renderResult`) | Partial rendering uses `details.userCode` plus `currentLine` to render the full code with a current-line arrow, regardless of collapsed/expanded state. |
| Completed renderer | `src/index.ts:99-135` (`renderCompletedOutput`) | Completed collapsed output shows a source-count hint only; expanded output shows full line-numbered `Python source`, but only when `details.userCode` exists. It does not show a first-line preview when collapsed. |
| Source formatting/hint | `src/index.ts:91-97` (`renderKeyHint`, `formatPythonSourceLines`) | Expanded source uses stable line numbers; collapsed hint is keybinding-aware but does not include any source text. |
| Existing render tests | `test/code-execution-rendering.test.ts:203-217`, `:219-232`, `:234-253`, `:255-270`, `:272-301` | Tests cover completed collapsed/expanded behavior using synthetic `details.userCode`, report rendering, and partial current-line rendering. They do not test actual executor success details, failed execution details, or collapsed first-line preview. |
| RPC failure tests | `test/rpc-protocol.test.ts:111-157` | Tests prove protocol failures reject with errors for clean exits, pre-terminal Python syntax stderr, and non-Python transport stderr; they do not assert failed-result details because no result details are produced on rejection. |
| Pi TUI API docs | `/opt/homebrew/lib/node_modules/@earendil-works/pi-coding-agent/docs/tui.md:394-404` | Custom `renderResult(result, options, theme, context)` receives `options` and `theme`; current extension is already using this affordance. |
| Prior Phase 49 summary | `.paul/phases/49-pi-tui-audit-and-collapsible-code-body/49-01-SUMMARY.md:7-12` | Phase 49 reports that completed source was intended to be compact when collapsed and visible when expanded, while partial rendering kept the current-line view. |

## Current Behavior Matrix

| State | Payload/details availability | Pi TUI collapsed behavior | Pi TUI expanded behavior | Meets desired UX? | Evidence |
|---|---|---|---|---|---|
| Running / `execution_progress` partial | `details.userCode` is present with `currentLine` and `totalLines` on `execution_progress` updates. Generic `update` and `tool_call` updates omit source. | `renderResult` checks `isPartial` and `details.userCode`; when true, it calls `renderExecutingCode`, which renders the full source/current-line view. It does not provide a collapsed first-line preview. | Same path as collapsed for partial updates; `expanded` is not consulted once `isPartial && details.userCode && details.currentLine` is true. | Partial. Source can be visible during progress updates, but the UX is not collapsed-first-line / expanded-full-source. Some partial update types have no source. | `src/rpc-protocol.ts:385-399`, `src/rpc-protocol.ts:421-426`, `src/rpc-protocol.ts:432-440`, `src/index.ts:297-305`, `test/code-execution-rendering.test.ts:272-301`. |
| Completed success | Current `RpcProtocol` complete path does not include `userCode` in `result.details`; `buildCodeExecutionTool.execute` forwards whatever details it receives. Renderer supports source only if `details.userCode` exists. Existing tests use synthetic details with `userCode`, not actual executor output. | If `details.userCode` exists, collapsed output shows `Python source: N lines` plus expand hint, but no first source line. If actual success details omit `userCode`, no source hint appears. | If `details.userCode` exists, expanded output shows a `Python source` heading and full line-numbered source after the result body. If actual success details omit `userCode`, expanded output cannot show source. | Partial/likely failing in actual execution. Renderer capability exists, but payload evidence shows completed success currently loses source before the tool result. Even in synthetic/details-present cases, collapsed first-line preview is missing. | `src/rpc-protocol.ts:407-413`, `src/code-executor.ts:81-86`, `src/index.ts:277-284`, `src/index.ts:118-131`, `test/code-execution-rendering.test.ts:203-232`. |
| Failed execution | Failed paths reject (`PtcPythonError`, `PtcProtocolError`, `PtcTransportError`, generic `Error`) rather than resolving a tool result with `details.userCode`. `PtcPythonError` stores `rawMessage` and optional `traceback`, not source. | Error rendering is owned by Pi's normal tool-error path after the extension throws; this extension returns no failed-result details with Python source for a custom renderer to use. | Same as collapsed; there is no extension-supplied result details payload for expansion. | Fails. Source is not preserved into visible result/error details for failed executions. | `src/rpc-protocol.ts:417-419`, `src/rpc-protocol.ts:315-325`, `src/execution/execution-errors.ts:20-30`, `src/code-executor.ts:87-92`, `src/index.ts:285-295`, `test/rpc-protocol.test.ts:111-157`. |

## Initial Findings

1. **Structured field exists but is inconsistently populated.** `ExecutionDetails.userCode?: string[]` is the stable current field for source, but `RpcProtocol` only populates it on `execution_progress` updates.
2. **Completed renderer support is ahead of completed payload behavior.** `renderCompletedOutput` can display source when `details.userCode` is present, and tests prove that synthetic result shape. The actual `complete` path currently omits `userCode`, so successful live executions can lose source before the renderer sees it.
3. **Collapsed rendering is a hint, not a preview.** The completed collapsed path advertises `Python source: N lines` and a keybinding hint, but does not show the first Python line. That explains why source is easy to miss even in result shapes where `userCode` is present.
4. **Running partial rendering is not aligned to the requested collapse/expand contract.** Running progress updates display a current-line full-code view and ignore `expanded`; non-progress updates have no source details.
5. **Failed executions have no source details path.** Protocol and executor failures reject instead of returning a structured failed result. Recovery telemetry may be updated, but Python source is not attached to any result/error details payload.
6. **Existing tests cover renderer shapes, not payload integration.** `test/code-execution-rendering.test.ts` is valuable for UI behavior, but it does not catch the current live payload gap because it constructs `details.userCode` directly.

## Gap Classification

| Requirement | Current status | Gap owner |
|---|---|---|
| Python source lives in structured metadata, not stdout/result text | Contract supports this via `details.userCode`; renderer reads from details. | Preserve in Phase 63/64. |
| Running state includes source | Progress updates include source; generic update/tool-call partial updates do not. | Phase 63 payload contract should decide source availability on all partial update types; Phase 64 should decide running preview/expanded rendering. |
| Completed success includes source | Renderer supports it only if supplied; actual RPC complete path currently omits source. | Phase 63 payload contract. |
| Failed execution includes source | No failed-result details path; errors are thrown. | Phase 63 payload/error contract, then Phase 64 rendering if Pi exposes details for errors or the extension returns structured error content. |
| Collapsed default shows first-line preview | Current collapsed completed rendering shows only count + hint; running partial shows current-line full-code view. | Phase 64 TUI rendering. |
| Expanded view shows full source | Completed renderer supports this when details include source; partial already shows full/current-line source; failures have no details. | Phase 63 for details availability; Phase 64 for consistent expanded rendering. |
| Existing tests lock intended behavior | Renderer tests exist for synthetic completed details and partial current-line rendering. No integration tests for executor/RPC payload success/failure, and no first-line preview tests. | Phase 63/64 tests. |

## Phase 63 Recommendations

Focus Phase 63 on the stable source payload contract and tests, without changing Pi TUI presentation beyond what is needed to expose details.

1. **Populate `details.userCode` on successful completion.** In `RpcProtocol`'s `complete` case, include `userCode: this.userCodeLines` in `buildExecutionDetails(...)` alongside report details. Preserve existing `details.userCode` naming for compatibility with Phase 49 renderer tests; only add an alias if a broader contract requires it.
2. **Define source details for failed executions.** Choose one explicit contract for Python/protocol failures, such as extending error classes with `details`, returning a structured failed `CodeExecutionResult`, or adding a Pi-supported error-details payload. The contract should carry at least `userCode`, `telemetry`, `recovery`, and traceback/raw error data where available.
3. **Make partial update source availability deliberate.** `execution_progress` already carries source. Decide whether `update` and `tool_call` updates should also include `userCode` so the TUI can consistently render a collapsed preview while nested tool calls run.
4. **Add integration-oriented tests beyond renderer fixtures.** Candidate tests:
   - `RpcProtocol` complete frame returns `details.userCode` from constructor input.
   - `RpcProtocol` error/pre-terminal failure path preserves source in the chosen error-details contract.
   - `buildCodeExecutionTool.execute` success returns tool-result `details.userCode` plus telemetry/recovery.
   - failure behavior surfaces source in the chosen result/error details contract without placing source in normal `content` text.
5. **Keep report details compatible.** Preserve `details.report` and `details.reportProduced` behavior while adding source to completion details.

## Phase 64 Recommendations

Focus Phase 64 on Pi TUI rendering and collapsed/expanded UX after Phase 63 makes source consistently available.

1. **Collapsed completed preview:** Replace or augment `Python source: N lines` with a first-line preview, for example `Python source: 1 │ <first line> … (N lines, <expand hint>)`. Keep full source out of default output.
2. **Expanded completed source:** Preserve current `Python source` heading and line-numbered full source after the result/report body.
3. **Running/partial preview:** Use `expanded` for partial rendering too. Collapsed partial should show concise status plus first-line/current-line preview; expanded partial can keep the current `renderExecutingCode` full-source view.
4. **Failed execution rendering:** Once Phase 63 provides source-bearing failure details, render failed collapsed output with the error summary plus first-line preview, and expanded output with traceback/error details plus full source. Do not duplicate source into stdout.
5. **Tests for UX contract:** Candidate tests:
   - completed collapsed includes first source line but not full source;
   - completed expanded includes full source;
   - partial collapsed respects `expanded: false` and avoids full source;
   - partial expanded preserves current-line full-code view;
   - failed collapsed/expanded behavior uses source details once Phase 63 supplies them.
6. **Avoid broad TUI refactors.** Keep work in the code execution renderer unless a small helper extraction is needed to control `src/index.ts` growth.

## Non-Goals / Boundaries

- Do not move Python source into normal result text, stdout, or model-facing error strings as the primary UX mechanism.
- Do not implement payload contract changes in Phase 62.
- Do not implement Pi TUI renderer changes in Phase 62.
- Do not edit installed Pi files under `/opt/homebrew/...`; they are read-only evidence.
- Do not broaden this work into the known unrelated Node-v26 `--experimental-transform-types` live-harness issue.
- Do not modify `src/**`, `test/**`, README, package metadata, release docs, or dependency/security baselines in this phase.

## Verification Summary

| Command | Result | Notes |
|---|---|---|
| `node --test test/code-execution-rendering.test.ts` | PASS — 5 passing / 0 failing / final duration 190.394916 ms | Confirms current renderer fixtures for completed collapsed/expanded, report rendering, and partial current-line rendering. |
| `node --test test/rpc-protocol.test.ts` | PASS — 10 passing / 0 failing / duration 112.177083 ms | Bounded extra baseline confirming current RPC success/failure protocol behavior, including rejection on Python/pre-terminal and transport failures. |

Verification checklist:

- [x] `.paul/phases/62-current-behavior-audit/62-01-SOURCE-VISIBILITY-AUDIT.md` exists.
- [x] Artifact contains Scope, Evidence Map, Current Behavior Matrix, Gap Classification, Phase 63 Recommendations, Phase 64 Recommendations, Non-Goals / Boundaries, and Verification Summary.
- [x] Matrix covers running/partial, completed success, and failed execution states.
- [x] Focused command `node --test test/code-execution-rendering.test.ts` result is recorded.
- [x] No `src/**`, `test/**`, README, package metadata, or installed Pi files were modified by this audit.
- [x] All acceptance criteria are addressed.
