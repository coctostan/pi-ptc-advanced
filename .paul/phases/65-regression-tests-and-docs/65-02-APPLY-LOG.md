# 65-02 APPLY Evidence

## Authority and scope
- Date: 2026-10-01. Human `appove` explicitly approved the single proposed 65-02 APPLY action.
- Parent executed inline; no implementer delegation, checkpoints, plan amendment or scope deviation.
- PLAN: `65-02-PLAN.md`; M21 only. Completed `65-01-FIX` is a separate side-loop.
- GitHub Flow preflight: `feature/65-regression-tests-and-docs`, refreshed origin/main at c81c6fa, ahead/behind 0/0 before tasks. Owned planning artifacts only; no unrelated product changes.
- Configured target guard: `gh repo view --json nameWithOwner --jq .nameWithOwner` exactly returns `coctostan/pi-ptc-advanced`. Origin's historical redirect URL was not rewritten.
- Only four product paths changed: new `test/code-execution-source-visibility.test.ts`, extended `test/prompt-guidance.test.ts`, bounded README subsection, one description string in `src/index.ts`.
- Skills loaded: paul-apply; pi-processes for verification processes; readme-reviewer adapted to the approved bounded subsection, not a repository-wide rewrite.

## Supported verification environment
Reused isolated setup from 65-01; no provisioning, active sibling edits, root dependency/lock changes or global installation.

```bash
export PATH=/private/tmp/pi-ptc-fix65-node22-binary/node_modules/node-bin-darwin-arm64/bin:/private/tmp/pi-ptc-fix65-npm10/node_modules/.bin:$PATH
export PI_HASHLINE_READMAP_ROOT=/private/tmp/pi-ptc-fix65-hashline
```

Node v22.23.1 / npm 10.9.4. Python is the available python3; AST-grep and difft CLIs available. Fixture HEAD is exactly `f1234813c5f2ea0a0476143b41a59cf2094e945b` (v0.8.16). Existing fixture lockfile-only installation changes were observed, not created in this APPLY; executable fixture source is unchanged. Canonical `/private/tmp` avoids alias-sensitive live assertions.

## Pre-APPLY baseline
[dispatch] pre-apply: TODD(50), WALT(100).
- TODD PASS: execute off-ramp; Task 1 proves existing runtime behavior, Task 2 explicitly creates missing-text guards before Task 3 static-text implementation. No manufactured runtime RED.
- WALT: process `proc_e569`, `npm run verify:ci`, exit 0. Focused 29/29; full 278/278; fail/cancelled/skipped 0. Release metadata, tarball surface and clean installability pass at unchanged 1.0.0.
- No configured lint/formatter/coverage command; no metrics invented.
- Audit comparison comes from approved PLAN pre-plan evidence: 0 critical / 7 high / 2 moderate / 0 low. Historical DEAN acknowledgement remains expired, not renewed.

## Task 1 — PASS
Commit `1db7732`: real execution-to-registered-render regression companion.
- Real CodeExecutor, RpcProtocol and bundled Python assets; only sandbox creation, registry and custom-manager boundaries replaced. Trusted Python literal fixtures spawned via argv, no shell/network/sleeps.
- Five tagged cases: success/stdout, nested tool/progress, ptc.report, ValueError and syntax failure. Exact raw split arrays preserve CRLF remnants, indentation and blank physical lines; reports/failures retain metadata.
- Generated progress and Calling updates are rendered with omitted/false/true expansion; valid tracing arrows only, terminal bodies precede source, toggles at widths 24/80/240 do not mutate details. First-line previews never select hidden later sentinels.
- Finally invokes session_shutdown, terminates/waits for remaining Python children and restores module cache, PTC env and keybindings. Passing cases assert sandbox/manager cleanup and empty child tracking.
- First verification: 31 pass / 5 fail (new cases only), because Text.render pads rows to width. Corrected the test's rendered-row expectation with padEnd(240), and compared the first output line for padded multiline terminal output. Raw-source equality unchanged; not a production defect or runtime RED.
- Official retry: `npm run build && node --test test/code-execution-source-visibility.test.ts test/code-execution-rendering.test.ts test/rpc-protocol.test.ts test/execution-errors.test.ts`, exit 0, 36/36, zero failures/skips.
[dispatch] post-task(Task 1): TODD PASS, no existing-test regression.

## Task 2 — PASS (expected missing-text failures)
Commit `84e5e2d`: bounded README and registered-description guards.
- `npm run build && node --test test/prompt-guidance.test.ts`, exit 1: existing tests 2 PASS; new guards 2 FAIL, zero skips.
- Exact expected errors: `Missing description sentence: Expand results to inspect Python source.` and `Missing source-inspection README subsection`.
- No loader/setup/runtime failures. Guards require compact description, original sentences, exact prompt metadata and source-inspection concepts, not whole-file snapshots.
[dispatch] post-task(Task 2): TODD PASS; valid missing-documentation/description evidence unlocks Task 3. Execute plan, not runtime TDD.

## Task 3 — PASS
Commit `acc4474`: README source-inspection subsection and exact 41-character description append.
- README describes collapsed default / first physical line, configurable Pi expansion, numbered full source for running/success/source-bearing Python failures, raw metadata versus display, source-less/pre-execution/transport limits, reports, multiline example and focused proof command.
- Description is 247 characters; three prior sentences and all promptSnippet/promptGuidelines/routing/execute/render/session behavior unchanged. Diff against origin/main shows only src/index.ts line 57 changed.
- Official focused command: `npm run build && node --test test/code-execution-source-visibility.test.ts test/code-execution-rendering.test.ts test/prompt-guidance.test.ts test/index.test.ts test/rpc-protocol.test.ts test/execution-errors.test.ts test/report-shape.test.ts test/contracts-public-types.test.ts`: exit 0, 54/54, zero failures/skips. Both Task 2 guards GREEN.
- `node node_modules/typescript/bin/tsc --noEmit`, exit 0; `git diff --check`, exit 0.
- Full supported `npm run verify:ci`, process `proc_919e`, exit 0: focused 29/29, full 285/285, no failures/cancellations/skips; release metadata/tarball/installability pass at 1.0.0. Process also reran noEmit and diff check successfully.
[dispatch] post-task(Task 3): TODD PASS, guards green and no new regressions.
- Refactor review: no-op. Shared disclosure assertions already avoid repeated checks; real integration fixture isolation remains local. Production string-only edit warrants no extraction. Existing Unicode/keybinding/legacy tests pass; prior Phase 64 human visual approval is dependency evidence only, not a new observation.

## Post-APPLY module evidence
Installed logical modules.yaml kernel 2.0.0-pals2.0 matches project config. Hook-local refs loaded; parent retains authority. Advisory cohort evaluated before final enforcement decision; official final-suite output is reusable comparison evidence.

[dispatch] post-apply advisory: ARCH(125), SETH(130), LUKE(160), OMAR(170), PETE(175), REED(180), VERA(185), DOCS(250), IRIS(250), SKIP(300).

| Module | Result | Source-backed evidence / recovery |
|---|---|---|
| ARCH | PASS with existing fan-out advisory | New test imports node:test/assert/child_process/events and type-only ExecutionDetails; Test → platform/contracts permitted. No production import edits; no recognized layer map invented. Test parent now 49 files (>25, prior PLAN 48); companion keeps growth out of test/index.test.ts. New test 227 lines, prompt test 223 (+47), src/index 391 (no growth), README 1117 (+19 content lines); docs size is not code debt. |
| SETH | PASS | New test lines 43–47: Python subprocess via trusted literals/argv, no shell. Scoped source scan found no secret-like literals; no production auth/validation/sink change. |
| LUKE | SKIP | No .tsx/.jsx/.vue/.svelte component changes. |
| OMAR | SKIP | No production logging/readiness/error-handler changes; test finally blocks propagate failures and restore resources. |
| PETE | WARN advisory | New fixture helper withRegisteredTool spans lines 32–119 (88 lines), exceeding >80 function-size advisory. Test-only setup/teardown, not latency evidence; fixed toggle matrix depth 2 and one bounded README read. Parent recommends no broad extraction in this phase; UNIFY owns finding route. |
| REED | PASS | Test lines 103–118: session shutdown, fallback child cleanup, cache/env/keybindings restoration in finally; 10s execution timeout. No retry/service/runtime resilience edits. |
| VERA | SKIP | Synthetic fixtures, no realistic PII, privacy/storage/consent changes. |
| DOCS | UPDATED / NOT_APPLICABLE | src/index.ts → README inspection subsection UPDATED (1); two test paths and README-only content NOT_APPLICABLE (3), no candidate drift. No release/API claims added. |
| IRIS | PASS with size advisory | Changed source reviewed: no unused symbol/dead code/empty catch/broad catch/marker finding. Same 88-line test fixture is a maintainability review candidate, not a production issue. No configured lint tool. |
| SKIP | NOTE | Lesson candidate below, derived only from current Task 1 evidence. |

[dispatch] post-apply enforcement: WALT(100), GABE(140), DEAN(150), DANA(155), ARIA(165), DAVE(175), TODD(200).

| Module | Result | Evidence |
|---|---|---|
| WALT | PASS | 278/0/0 → 285/0/0 full pass/fail/skip (+7 new passes); focused final 54/54; release proof/typecheck/diff clean. Lint/format/coverage unavailable, not zero metrics. |
| GABE | SKIP | No route/controller/API/schema changes. |
| DEAN | PASS_WITH_CONCERNS | `npm audit --json` exit 1 with parseable vulnerabilities: critical 0→0, high 7→7, moderate 2→2, low 0→0; all severity deltas 0. No new critical/high gate finding; expired acknowledgement remains unchanged. High packages still pi-coding-agent, brace-expansion, extract-zip, ip-address, protobufjs, undici, ws; moderate file-type/yaml. No audit fix or waiver. |
| DANA | SKIP | No data/schema/migration changes. |
| ARIA | SKIP | No HTML/UI component changes. |
| DAVE | SKIP | No CI config/Dockerfile changes; full verification and fixture workflow remain protected. |
| TODD | PASS | Docs guard missing-text failures → GREEN; existing runtime regression proof passes. Full suite +7 passes, no new/unresolved failures. No-op refactor rationale above. |

### SKIP knowledge candidate
- Source: this log § Task 1; `test/code-execution-source-visibility.test.ts` § verifyDisclosure.
- Date / Phase / Plan: 2026-10-01 / 65 Regression Tests and Docs / 65-02.
- Type / Title: lesson / Separate raw source metadata from terminal row padding.
- Context: Real payloads passed raw-source checks, but rendered-row comparisons assumed unpadded strings.
- Content: Keep exact code.split("\n") equality at the execution boundary; rendered expectations account for Text padding and display CR normalization. Do not repair protected runtime code to satisfy a mistaken display assertion.
- Impact: Future source/render tests must distinguish storage invariants from terminal presentation; this phase proves both without adding production test hooks.

## Acceptance and close
AC-1–5 PASS: actual execution payloads, registered render behavior, guarded docs, compact prompt and fresh quality/package proof. Three tasks PASS; overall PASS_WITH_CONCERNS for unchanged dependency risk and advisory fixture size/fan-out. No override, scope deviation, skipped task or unresolved checkpoint. UNIFY permission is requested because concerns remain; no merge intent inferred. ROADMAP inventory stays 0/1 until UNIFY reconciles the plan.

## GitHub Flow postflight
Parent planning/lifecycle evidence committed as `9d2381e` and pushed on feature/65-regression-tests-and-docs; PR #24 created against main: https://github.com/coctostan/pi-ptc-advanced/pull/24 (OPEN). Configured repository-target guard exactly matched coctostan/pi-ptc-advanced. At checked head `9d2381e5ac3e2649c0c53cd7422df27f9d7e42f3`, Verify release baseline was IN_PROGRESS (run 36881404562); no pass claim. This receipt metadata is committed/pushed afterward, so UNIFY must check its then-current head afresh. No merge/publish/tag/release authorized.
