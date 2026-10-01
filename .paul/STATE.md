# Project State

## Project Reference
See: `.paul/PROJECT.md`

**Core value:** `pi-ptc-next` should execute the same active Pi tool implementations that the user sees in chat.
**Current focus:** Approved standard CI fix side-loop 65-01 (`R7 — no spec impact`) for Phase 64 PR #23. Phase 65 transition remains prepared only; no merge or main-loop planning authorization.
## Current Position
Milestone: Milestone 21 — Code Execution Source Visibility UX
Phase: 65 of 65 (Regression Tests and Docs) — prepared transition only; Phase 64 PR #23 gate unresolved
Plan: Not started (Phase 65); previous plan `.paul/phases/64-pi-tui-collapsed-expanded-rendering/64-01-PLAN.md` reconciled
Status: Phase 65 planning prepared but blocked by Phase 64 PR #23 CI/merge gate
Last activity: 2026-10-01 — Approved standard fix 65-01 repairs missing-tag / floating hashline fixture drift; two fail-closed guards RED -> GREEN. Node 22 baseline 274/2 -> 278/0; verify:ci, release package, TypeScript/YAML/diff checks pass; post-apply modules recorded. Push / live CI and post-unify finalization pending; main loop unchanged.
Progress:
- Milestone 21 — Code Execution Source Visibility UX: [███████░░░] 75% reconciled (Phases 62/63 ✓; Phase 64 PLAN/APPLY/reconciliation ✓, CI/merge pending; Phase 65 ○ prepared, blocked)
- Milestone 20 — `pi-ptc-advanced` 1.0 Public NPM Release: [██████████] 100% ✓ (Phase 58 ✓; Phase 59 ✓; Phase 60 ✓; Phase 61 ✓)
- Milestone 19 — Live Runtime Helper Hardening: [██████████] 100% ✓ (Phase 54 ✓; Phase 55 ✓; Phase 56 ✓; Phase 57 ✓)
- Milestone 17 — Pi Compatibility and Prompt Integration Audit: [██████████] 100% ✓ (Phase 45 ✓, Phase 46 ✓, Phase 47 ✓, Phase 48 ✓)
- Phase 45 — Pi API and Documentation Delta Audit: [██████████] 100% ✓
- Phase 46 — Extension Runtime Compatibility Alignment: [██████████] 100% ✓
- Phase 47 — System Prompt and Tool Guidance Optimization: [██████████] 100% ✓
- Phase 48 — Compatibility Proof and Release Readiness: [██████████] 100% ✓
- Milestone 15 — Bug Fixes and Helper Hardening: [██████████] 100% ✓
- Milestone 16 — Publishable Fork Packaging: [██████████] 100% ✓
- Phase 42 — Rename and Package Identity: [██████████] 100% ✓
- Phase 43 — Publish Metadata and Documentation: [██████████] 100% ✓
- Phase 44 — Release Verification and Publish Readiness: [██████████] 100% ✓
- Phase 39 — P0 File-Discovery Repair: [██████████] 100% ✓
- Phase 40 — Error-Handling Hardening: [██████████] 100% ✓
- Phase 41 — Behavior Consistency and Follow-Up Proof: [██████████] 100% ✓
- Milestone 14 — Live Tool Audit and Stress Testing: [██████████] 100% ✓
- Phase 36 — Systematic Functionality Audit: [██████████] 100% ✓
- Phase 37 — Stress and Edge Case Testing: [██████████] 100% ✓
- Phase 38 — Composition Patterns and Audit Scorecard: [██████████] 100% ✓
- Milestone 13 — Ecosystem Examples and Recipes: [██████████] 100% ✓
- Phase 35 — Proof and Ecosystem Documentation: [██████████] 100% ✓
- Phase 34 — Cross-Repo Recipes and Benchmark Fixtures: [██████████] 100% ✓
- Phase 33 — Recipe Targets and Example Contracts: [██████████] 100% ✓
- Milestone 12 — High-Level Orchestration Helpers: [██████████] 100% ✓
- Phase 32 — Proof and Ecosystem Docs: [██████████] 100% ✓
- Phase 31 — Bounded Reduction and Output-Budget Helpers: [██████████] 100% ✓
- Phase 30 — Core Orchestration Primitives: [██████████] 100% ✓
- Milestone 11 — Result-Kind and Tool Introspection Helpers: [██████████] 100% ✓
- Phase 29 — Proof and Docs: [██████████] 100% ✓
- Phase 28 — Python Tool Introspection: [██████████] 100% ✓
- Milestone 10 — Typed Response and File Handle Helpers: [██████████] 100% ✓
- Milestone 9 — Release Readiness and Packaging: [██████████] 100% ✓
- Phase 24 — CI and Release Verification: [██████████] 100% ✓
- Phase 23 — Changelog and Release Notes: [██████████] 100% ✓
- Phase 22 — Release Version and Packaging: [██████████] 100% ✓
- Milestone 8 — Personal Fork Hardening: [██████████] 100% ✓
- Milestone 7 — Upstream PR Preparation: [██████████] 100% ✓
- Milestone 6 — Review Findings Remediation: [██████████] 100% ✓
- Milestone 5 — Python Helper Normalization: [██████████] 100% ✓
- Milestone 4 — Cross-Extension Tool Execution Bridge: [██████████] 100% ✓
- Milestone 3 — Python Ergonomics and Metadata: [██████████] 100% ✓
- Milestone 2 — Structured Results Contract: [██████████] 100% ✓
- Milestone 1 — Active Tool Runtime Seam: [██████████] 100% ✓
## Loop Position
Current loop state:
```text
PLAN ──▶ APPLY ──▶ UNIFY
  ○        ○        ○     [Phase 65 prepared only; Phase 64 reconciliation ✓✓✓, PR #23 CI/merge gate BLOCKED]
```

## Accumulated Context
### Milestone 21 Context
- Goal: make `code_execution` Python source visible in Pi TUI with collapsed-by-default first-line preview and expandable full source.
- Scope includes running, successful, and failed execution states.
- Source should be exposed through stable details/metadata for TUI/API/debug/test consumers, not injected into ordinary result text.
- Phase 62 current behavior audit found the source-visibility gap is split across payload and rendering: running progress updates carry `details.userCode`, completed-success RPC details currently omit `userCode`, failed executions reject without source-bearing details, and collapsed rendering currently shows a count/hint rather than a first-line preview.
- Phase 62 UNIFY completed the audit loop: `62-01-SOURCE-VISIBILITY-AUDIT.md` is the source-of-truth gap map for Phase 63 payload/error/progress contract planning and Phase 64 TUI rendering planning.
- Phase 63 PLAN created `.paul/phases/63-stable-source-payload-contract/63-01-PLAN.md` as a TDD plan for source-bearing success, partial, and failure details while deferring collapsed/expanded rendering to Phase 64.
- Phase 63 APPLY added stable source-bearing structured details for `code_execution` success, partial updates, nested tool-call updates, and user-code Python failures; focused verification passed, while full-suite `npm test` retains pre-existing local Node `--experimental-transform-types` failures in hashline live tests.
- Phase 63 UNIFY reconciled plan-vs-actual into `63-01-SUMMARY.md`, recorded post-unify module evidence, committed/pushed PR #20, and is blocked from phase transition only by GitHub Flow PR checks/merge gate.
- 2026-05-16: PR #20 confirmed MERGED (squash `bde0db1` to `main`, 2026-05-14T16:45:24Z) with `Verify release baseline` and Socket Security checks SUCCESS; local `main` is already fast-forwarded and clean, closing the Phase 63 merge gate and completing the phase.
- Note: two unrelated hotfix PRs (`#21` trim code_execution tool prompt, `#22` further trim) merged directly to `main` after PR #20 without PALS FIX lifecycle artifacts; out of Phase 63 scope, flagged here for visibility only.
- 2026-10-01: Phase 64 PLAN created `64-01-PLAN.md` (M21-only, no PRD/R# invention): 3 TDD tasks, a renderer companion module, and one blocking human visual checkpoint. Execution/payload/prompt/report semantics remain protected; Phase 65 owns user docs and broader end-to-end proof. No APPLY approval inferred.
- Phase 64 planning verification: build and focused render/index/RPC/error tests passed 33/33 under Node v26.7.0. Full suite not rerun in PLAN; APPLY must establish a fresh baseline for historical unsupported-Node hashline failures.
- DEAN pre-plan: historical baseline expired 2026-06-11; current npm audit is 0 critical / 7 high / 2 moderate / 0 low. Installed no-fresh-baseline rule is non-blocking with no current critical findings; no baseline refresh/override inferred. Counts carry into APPLY comparison.
- Automatic pals.json migration preserved existing settings, stamped `2.0.0-pals2.0`, and added installed CODI and agents.implementer defaults. PLAN exceeds the advisory 16 KB ceiling; compact repeated task/context prose by cited references if needed, preserving verbatim intent and module evidence.
- PLAN identified an exact-match remote guard risk from pals.json targeting the old pi-ptc-next slug. Resolved later by explicit config-repair approval; PLAN/visual approval alone did not authorize repair or merge.
- 2026-10-01: User explicitly approved APPLY (`yes`). Parent executed inline on feature/64-pi-tui-collapsed-expanded-rendering; created shared renderer and thin wiring, preserved protected semantics, committed RED cab0658 and GREEN 403e3cd. Task evidence: 64-01-APPLY-LOG.md.
- Fresh baseline/full comparison: 259 pass / 9 fail → 267 pass / same 9 fail, all unsupported --experimental-transform-types hashline live checks under Node v26.7.0. Focused 33/33 → 41/41; build/typecheck/diff hygiene pass; audit unchanged 0 critical / 7 high / 2 moderate.
- Repo-source load probe confirmed exactly this repository's src/index.ts and no errors; cleanup-corrected probe exited 0. Human visual batch `approved`; post-apply advisory/enforcement completed with no new local test/audit regressions. Subsequent UNIFY approval/reconciliation recorded below.
- Explicit approvals: APPLY `yes`, visual `approved`, one-field canonical-target repair `yes`, UNIFY `1`, D1–D4 discard routing `approve all 4`. 64-01-SUMMARY finalized; AC-1–7 PASS with unchanged local baseline/audit concerns. Mandatory post-unify evidence durable, history rows appended once. ROADMAP explicit one-plan inventory 1/1 complete -> last_plan=true; Phase 65 transition prepared on feature branch, blocked by Phase 64 PR #23 CI/merge. No new intent requirements, no repair or merge approval.
### Decisions
- Phase 55 normalized callable-wrapper contract guidance: direct callable Pi wrappers remain awaitable, `grep("pattern", path="...")` is supported in the runtime adapter, and Phase 56 keeps result/path/error semantics separate.
- Phase 57 shipped `ptc.list_helpers()` as the curated `ptc.*` helper inventory distinct from live callable-tool discovery via `ptc.list_callable_tools()`.
- Phase 57 kept `details.ptcValue` guidance in README only, not the generated `code_execution` description, to preserve prompt-description invariants and avoid widening Pi-side prompt-injection behavior.
- Phase 60 kept the 1.0 release gate as proof/documentation only: `docs/releases/PUBLISH-CHECKLIST.md` documents dry-run/manual publish sequencing, but actual npm publish, git tag, GitHub release, and repository rename remain user-owned/manual.
- Phase 61 checkpoint result: `rename-confirmed`; `gh repo view coctostan/pi-ptc-advanced` resolves public repo and old slug `coctostan/pi-ptc-next` redirects to the new slug. Local `origin` still points at old URL and was not rewritten automatically.
- Phase 57 left `.paul/dean-baseline.json` untouched as historical acknowledgement evidence while documenting that 0.18.0 materially supersedes the old audit posture with `0 critical / 0 high / 3 moderate / 0 low`.
- Milestone 20 targets `pi-ptc-advanced@1.0.0`: public identity cleanup, README/docs polish, release-readiness proof, and repo rename/migration preparation; actual `npm publish` remains user-owned.
- Phase 58 APPLY retargeted the active package/release baseline to `pi-ptc-advanced@1.0.0`, moved README/runbook opening copy to public product framing, preserved credit/lineage lower in README, and kept `npm publish`, tags/releases, and actual repo rename manual/user-owned.
- Personal fork ownership is now the primary path; upstream PR preparation is retained only as optional reference material
- Phase 39 APPLY fixed `ptc.find_files()` to avoid `glob(limit=...)` dependency and normalize string/list glob payloads before slicing, then converted the three Phase 36 known-bug assertions into passing bounded regression proof
- Phase 39 UNIFY reconciled plan-vs-actual into `39-01-SUMMARY.md`, recorded post-unify quality history, and transitioned the project to Phase 40
- Phase 19 restored a repo-local personal analysis launcher profile at `scripts/start-pi-ptc-full-tools.sh`
- `PTC_CALLABLE_TOOLS` is now treated explicitly as a filter over Pi-visible tools, not as a loader for missing tools
- Allowlisted-but-unavailable tools now produce explicit registry warnings instead of silent callable-surface mismatches
- Default conservative callable-tool behavior for non-personal sessions remains unchanged
- Phase 20 keeps routine verification repo-local (`npm run verify:personal`, `npm run verify:personal:full`) while leaving git remote/branch/rebase/push actions manual and documented
- Phase 50 established `ptc.report(...)` as an optional recognized output shape: preserve free-form returns, keep normal `output`, and attach structured report metadata through `details.report` / `details.reportProduced` for tests/evals.
- Future completed-result output shapes should stay compact by default, expand for fuller details, and keep rendering helpers outside `src/index.ts` when practical.
- Milestone 7 upstream PR-prep material now lives behind `.paul/milestones/0.6.0-UPSTREAM-PR-ARTIFACTS.md`, and current maintainer docs treat it as archived reference only
- Phase 22 set the fork's package/release baseline to 0.8.0, added fork repository metadata, and introduced repo-local `verify:release-package` tarball verification
- Phase 23 added a durable `CHANGELOG.md`, dedicated `0.8.0` release notes, and maintainer-doc links that describe the personal fork release baseline conservatively
- Phase 24 added a repo-local `verify:ci` command, a verification-only GitHub Actions workflow at `.github/workflows/ci.yml`, and maintainer/release-doc updates that keep publish/tag/git automation explicitly manual
- Untracked file additions in this repo still require `git status` alongside `git diff` during task proof because plain `git diff --name-only` does not surface newly created files before staging
- Phase 25 established a bounded response/file handle contract around existing `pi-web-tools` `responseId` / `filePath` flows without changing `normalizeToolResult()` return shapes
- Public contract coverage now uses an ESM-safe test harness with `createRequire(import.meta.url)` so dist import checks stay valid under Node's module parsing
- Phase 26 added bounded Python handle helpers via `ptc.extract_handles()` / `ptc.first_handle()` instead of changing normalized tool return shapes
- Response/file follow-up workflows are now proven inside `code_execution` and documented in both README guidance and the live tool description
- Phase 27 added `ptc.expect_kind(value, kind)` as a strict top-level kind assertion helper and intentionally kept broader validation/introspection work out of scope
- Bounded Python helper slices should prefer dedicated focused runtime tests over growing the already-large `test/code-executor.test.ts` without a concrete need
- Graph-handle helper ergonomics remain explicitly deferred until adjacent repos expose a stable public contract worth adopting
- Phase 28 derives Python callable-tool introspection metadata from the same live `ToolInfo[]` wrapper-generation surface and exposes only bounded JSON-safe session metadata to `runtime.py` for `ptc.list_callable_tools()` / `ptc.get_tool_schema(name)`
- Phase 29 adds dedicated execution-level proof for `ptc.list_callable_tools()` / `ptc.get_tool_schema(name)` plus README and tool-description guidance without reopening Phase 28 runtime plumbing
- Safe optional-tool branching guidance now points models at `ptc.list_callable_tools()` as the authoritative live session surface before calling optional helpers like `sg`
- Phase 30 keeps orchestration call specs bounded to `{"tool": str, "params": object}` and validates them in `runtime.py` rather than introducing a broader orchestration DSL
- `ptc.first_success(...)` now uses ordered sequential fallback semantics in Phase 30; `max_concurrency` is validated for interface consistency, while broader concurrent race behavior remains deferred
- `ptc.fit_output(...)` now defaults to the executor session output cap so Python-side compaction stays aligned with the real final output boundary
- Phase 31 intentionally returns structured preview metadata from `ptc.fit_output(...)` instead of collapsing immediately to an opaque string
- Phase 32 closed Milestone 12 with focused ecosystem proof/docs in `README.md`, `src/index.ts`, and dedicated focused tests instead of reopening runtime semantics
- README and generated `code_execution` guidance now both document `ptc.batch_tool(...)`, `ptc.first_success(...)`, `ptc.reduce_tool(...)`, and `ptc.fit_output(...)` with compact hashline/codegraph/web examples and contract coverage
- Milestone 12 verification improved from `127` passing / `0` failing to `132` passing / `0` failing while the dependency audit baseline stayed unchanged
- 2026-03-26: Task 3 retry corrected an expected recipe workflow string in `test/benchmark-runner.test.ts`; no runtime/product contract change was required
- Phase 33 kept the first M4 slice additive by introducing optional `recipe_target` eval metadata, benchmark passthrough, and four deterministic seeded recipe cases instead of a broader recipe DSL
- The touched Phase 33 benchmark/eval tests now use import-based syntax and `process.cwd()` path resolution so the modified files pass targeted TypeScript diagnostics without changing package-wide module mode
- Phase 34 keeps cross-repo recipe artifacts under `.pi/evals/ptc/recipes/` plus a deterministic recipe-only benchmark baseline at `.pi/evals/ptc/baselines/local__seeded__recipes.json`, without changing runtime/helper/doc surfaces
- Because `.pi/` is gitignored in this fork, Phase 34 proof for recipe artifacts relies on direct file existence/content checks plus focused eval/benchmark tests instead of git diff/status alone
- Phase 34 kept the planned scope additive even though the focused test edits landed early during APPLY to lock artifact and baseline alignment coherently
- Phase 40 APPLY hardened pre-terminal RPC close classification in `src/rpc-protocol.ts` so syntax/traceback stderr now surfaces actionable `PtcPythonError` context, added focused protocol regression coverage, and updated live-audit expectations; verification passed with `npm run build`, `node --test test/rpc-protocol.test.ts`, `node --test test/live-audit-pipeline.test.ts`, and `npm test` (205 pass / 0 fail)
- APPLY preflight detected a dirty working tree with pre-existing out-of-scope changes; execution proceeded with warning to keep Phase 40 edits bounded to planned files
- Phase 40 UNIFY reconciled plan-vs-actual into `40-01-SUMMARY.md`, recorded post-unify module reports and quality-history trend, and transitioned Milestone 15 flow to Phase 41 planning readiness
- Phase 40 UNIFY deferred github-flow merge-gate automation because the working tree still contained mixed pre-existing out-of-scope changes; reconciliation artifacts were completed and the next phase was unlocked while git/PR cleanup remains follow-up work
- Phase 41 APPLY added explicit `batch_tool(..., on_error='collect')` bounded partial mode (`kind: "batch_partial"`) while preserving default fail-fast behavior, aligned `batch_tool([])` with list-style empty results, and tightened executor truncation framing to enforce `maxOutputChars` caps
- Phase 41 proof updated focused orchestration/stress/pipeline/contracts plus README/tool-description helper guidance; full verification passed with `npm test` (`207` passing / `0` failing)
- Phase 41 UNIFY reconciled plan-vs-actual into `41-01-SUMMARY.md`, recorded post-unify module outputs and quality-history update, and marked Milestone 15 complete pending next milestone routing
- Phase 42 APPLY renamed package metadata to `pi-ptc-advanced` at `0.15.0`, updated `scripts/verify-release-package.sh` to assert the new package name/version baseline, preserved README/docs naming drift intentionally for Phase 43, and verified with `npm test`, `npm run build`, and `bash scripts/verify-release-package.sh`; `npm pack --dry-run` still includes `src/python-runtime/__pycache__/runtime.cpython-314.pyc`, which is non-blocking for this phase but should be reviewed during publish-readiness follow-up
- Phase 42 APPLY preflight detected the same dirty working tree with pre-existing out-of-scope changes; execution proceeded with warning while keeping edits bounded to `package.json`, `package-lock.json`, and `scripts/verify-release-package.sh`
- Phase 42 APPLY did not run github-flow postflight commit/push/PR automation because the branch still contains mixed pre-existing out-of-scope changes; auto-staging with `git add -A` would have swept unrelated work into the phase commit, so git/PR handling remains manual follow-up
- Phase 42 UNIFY reconciled plan-vs-actual into `42-01-SUMMARY.md`, appended stable quality history for the metadata/package-identity slice, marked Phase 42 complete in roadmap/project state, and routed Milestone 16 to Phase 43 planning readiness while keeping merge-gate/git hygiene as manual follow-up because the working tree still contains mixed historical changes
- Phase 43 UNIFY reconciled plan-vs-actual into `43-01-SUMMARY.md`, recorded stable quality history for the documentation-alignment slice, and transitioned Milestone 16 to Phase 44 planning readiness while keeping publish-readiness/tarball cleanup work explicitly deferred
- Phase 44 UNIFY reconciled the final publish-readiness slice into `44-01-SUMMARY.md`, recorded stable quality history for the packaging/installability gate, and closed Milestone 16 with the manual-publish boundary still explicit
- 2026-05-11: DEAN pre-plan enforcement for Phase 45 found current npm audit findings (1 critical / 4 high / 5 moderate); user approved override and `.paul/dean-baseline.json` now records the pre-existing dependency-risk baseline for 30 days.
- Plan 45-01 is audit-only: produce `.paul/phases/45-pi-api-and-documentation-delta-audit/45-01-PI-COMPAT-AUDIT.md` before any runtime or prompt-guidance implementation.
- Phase 45 APPLY produced `.paul/phases/45-pi-api-and-documentation-delta-audit/45-01-PI-COMPAT-AUDIT.md` (271 lines): evidence baseline confirms local install equals latest published Pi (`@earendil-works/pi-coding-agent@0.74.0`); 18-row compatibility matrix; 6 prompt-integration findings; Phase 46/47/48 handoff with 6 explicit deferrals.
- Phase 45 APPLY top-level findings: R-1 build-time peer scope drift (`@mariozechner/*@0.55.1` vs runtime `@earendil-works/*@0.74.0`) is the gating risk; R-2 `code_execution` lacks `promptSnippet`/`promptGuidelines` so it is invisible in the default system prompt's `Available tools` section; R-3 hashline executor bridge has no observability signal when no executors are emitted.
- Phase 45 APPLY GitHub Flow postflight pushed commit 6fef3f4 to `feat/hashline-native-interop` and opened PR #1 against `main`; CI "Verify release baseline" reports FAILURE due to a pre-existing GitHub Actions Node 20.20.2 runner `ERR_UNKNOWN_FILE_EXTENSION` on `node --test test/*.test.ts`, which is unrelated to the audit-only artifact and is surfaced for UNIFY/Phase 48 to address.

- Phase 46 PLAN created `.paul/phases/46-extension-runtime-compatibility-alignment/46-01-PLAN.md`: after user clarification, selected latest Mario-scope package alignment (`@mariozechner/*@0.73.1`) instead of a hard `@earendil-works/*` switch; plan still covers context-event compatibility, explicit `sourceInfo` compatibility strategy, and one-time hashline bridge no-executor observability signal; README/CHANGELOG/prompt-guidance remain deferred to Phase 47/48.
- Phase 46 APPLY completed in commit `c859c9b`: package metadata/lockfile now target `@mariozechner/*@0.73.1`, `sourceInfo` is preserved separately from PTC's internal `source` taxonomy, and the hashline bridge emits a no-executor observability warning while preserving builtin fallback. Deviation: Mario 0.73.1 does not type the `context` event overload, so APPLY retained an explicit compatibility shim instead of the originally planned direct typed call.
- Phase 46 UNIFY created `46-01-SUMMARY.md`, recorded quality/CODI module evidence, merged PR #2 via squash at `c3f7d06`, and transitioned the milestone to Phase 47 planning readiness.
- Phase 47 UNIFY created `47-01-SUMMARY.md`, recorded WALT/CODI/SKIP/RUBY post-unify evidence, confirmed `npm test && npm run build` at 213 passing / 0 failing, marked Phase 47 complete, and transitioned the milestone to Phase 48 planning readiness.
- Phase 47 prompt metadata decision: keep high-level `code_execution` routing guidance in Pi `promptSnippet` / `promptGuidelines`, preserve deep helper details in the tool description, and make fallback auto-route injection idempotent with `systemPromptOptions`.
- 2026-05-12: DEAN pre-plan enforcement for Phase 48 found current npm audit findings (4 critical / 0 high / 3 moderate); user approved override and `.paul/dean-baseline.json` now records the acknowledged dependency-risk baseline through 2026-06-11.
- Phase 48 PLAN created `.paul/phases/48-compatibility-proof-and-release-readiness/48-01-PLAN.md`: TDD release-readiness plan to add focused release metadata drift coverage, bump package/release verification to `0.16.0`, update README/CHANGELOG/runbook/release notes, run full verification, and require human approval of the audit caveat before UNIFY.
- Phase 49 APPLY implemented completed `code_execution` source visibility via Pi's existing collapsed/expanded tool-result affordance, kept partial execution rendering unchanged, clarified `nu` versus `code_execution` prompt guidance, and verified 223 tests passing with `npm test && npm run build`; `ptc.report(...)` and other Milestone 18 helper/report features remain deferred.
- Phase 49 UNIFY reconciled plan-vs-actual in `49-01-SUMMARY.md`, recorded CODI injected-degraded history for the plan's blast-radius evidence, appended WALT quality history (`223` passing / `0` failing), and documented the keybinding-hint implementation deviation as compatibility-preserving.
- Phase 49 GitHub Flow merge gate passed: PR #5 merged via squash to `main` at `44c8427` with all CI and Socket checks successful; feature branch deleted by GitHub.
- Phase 50 PLAN created `.paul/phases/50-structured-report-type/50-01-PLAN.md`: TDD plan to add `ptc.report(...)` canonical report helper, preserve recognized reports in `details.report`/`details.reportProduced`, render compact/expanded report output, update README/CHANGELOG, and preserve free-form/`ptc.fit_output(...)` behavior.
- Phase 50 APPLY added `ptc.report(...)` canonical JSON-safe report shape, preserved recognized reports in `details.report` / `details.reportProduced`, rendered compact/expanded completed report output, updated README/CHANGELOG, and preserved free-form / `ptc.fit_output(...)` behavior; verification passed with focused report/render/docs tests, `npm test` (228 passing / 0 failing), and `npm run build`.
- Phase 50 UNIFY reconciled plan-vs-actual in `50-01-SUMMARY.md`, recorded WALT/CODI/SKIP/RUBY post-unify evidence, marked Phase 50 complete, and transitioned Milestone 18 to Phase 51 planning readiness.
- Phase 51 PLAN created `.paul/phases/51-path-ergonomics-and-bridge-helpers/51-01-PLAN.md`: TDD plan for workspace-root-aware path formatting options on `find_files` / `find_files_abs` / `read_tree`, plus slim JSON-safe `ptc.tabulate(...)` and `ptc.diff(...)` bridge helpers; broad aggregators remain out of scope in favor of `nu`.
- Phase 51 APPLY added root-aware `relative` / `relative_to` formatting on `ptc.find_files(...)`, `ptc.find_files_abs(...)`, and `ptc.read_tree(...)`; added report-compatible `ptc.tabulate(...)` and shallow JSON-safe `ptc.diff(...)`; updated README, generated tool guidance, CHANGELOG, and contract tests. Verification passed: RED tests failed before implementation, focused tests passed, `npm test` passed with 230 passing / 0 failing, `npm run build` passed, and `npm audit --json` remained 0 critical / 0 high / 3 moderate.
- Phase 51 UNIFY reconciled path ergonomics and bridge helpers in `51-01-SUMMARY.md`, recorded WALT/CODI/RUBY/SKIP post-unify evidence, marked Phase 51 complete, and transitioned Milestone 18 to Phase 52 planning readiness.
- Phase 52 UNIFY reconciled callable-tool prompt metadata and `ptc.help(tool_name)` in `52-01-SUMMARY.md`, recorded WALT/CODI/RUBY/SKIP post-unify evidence, marked Phase 52 complete, and transitioned Milestone 18 to Phase 53 planning readiness.
- Phase 52 decision: `ptc.help(tool_name)` returns full callable metadata including `parameters`, while `ptc.get_tool_schema(...)` remains schema-only; generated guidance must keep `ptc.help(...)` on-demand rather than a routine prelude.
- Phase 53 PLAN created `.paul/phases/53-test-runner-verb/53-01-PLAN.md`: TDD plan for `ptc.run_tests(pattern)` as a sandbox-respecting Node `node --test` helper that returns Phase 50 structured reports for pass/fail/unavailable cases; cross-runner support, package-script dispatch, and Docker image changes remain out of scope.
- Phase 54 APPLY added scalar `runner_path` / `runner_resolution` metadata to `ptc.run_tests(pattern)`, shell-quoted command display via `shlex.join`, and active-runtime Node/PATH guidance in README/generated tool descriptions while preserving Node-only argv execution with `shell=False`.
### Deferred Issues
- Bridge teardown when pi adds getToolExecutor()
- `src/python-runtime/runtime.py` remains a significant debt hotspot at 1089 lines after Phase 52 helper additions; future changes should avoid casual growth without extraction justification
- `src/python-runtime/runtime.py` is now 1601 lines after Phase 57; `ptc.list_helpers()` and positional-wrapper consistency were bounded and additive, but future helper work should consider extraction/refactor before further growth.
- Existing docs/test/runtime hotspots remain in `README.md` (899 lines), `src/index.ts` (534 lines), and `test/index.test.ts` (1222 lines); future proof/docs/render work should keep using focused companion files or extract sections before growing those anchors further
- Full-suite verification now passes at `230` passing / `0` failing after Phase 52 UNIFY; maintain this as the current baseline for subsequent milestones
- Phase 44 removed packaged Python bytecode/cache artifacts from the tarball surface and added packed-artifact installability proof; preserve this publish-surface invariant in future release work
- Phase 48 shipped the 0.16.0 release candidate with explicit DEAN audit baseline acknowledgement (`4 critical / 0 high / 3 moderate / 0 low`, valid through 2026-06-11); advisory remediation is now a deferred follow-up tracked in `CHANGELOG.md` 0.16.0 Deferred section and `.paul/dean-baseline.json`.

### Fixes
| Fix 45-02 (standard, PARTIAL): bump CI Actions `node-version` 20→22 to fix `.ts` test loader | Phase 45 side-loop | `.github/workflows/ci.yml`, `.paul/phases/45-pi-api-and-documentation-delta-audit/45-02-FIX.md`, `.paul/phases/45-pi-api-and-documentation-delta-audit/45-02-FIX-SUMMARY.md` (commit `e777394`) |
| Fix 45-03 (standard, PASS): close all 26 newly-visible CI failures — force-add 5 ungitignored eval fixtures, install `@ast-grep/cli` + `difftastic 0.69.0` on CI, clone `pi-hashline-readmap` as sibling repo with its own `node_modules` and export `PI_HASHLINE_READMAP_ROOT` | Phase 45 side-loop | `.github/workflows/ci.yml`, 5 `.pi/evals/ptc/{baselines,recipes}/*` files, FIX + FIX-SUMMARY (commits `623ad2f`, `142e3f1`, `38876f4`, `d19b426`, `15d95b3`); CI now 207/207 PASS, PR #1 mergeable |
| Fix 65-01 (standard, APPLIED / LIVE CI PENDING): repair Phase 64 PR #23 fixture drift | Chain: R7 — no spec impact | Current Phase 65 prepared-only side-loop; main loop unchanged | `.github/workflows/ci.yml`, `test/ci-hashline-fixture.test.ts`, `65-01-FIX.md`, `65-01-FIX-SUMMARY.md`; Node 22 full 278/278, verify:ci pass, no merge authorization |

### Git State
- Phase 50 UNIFY metadata merged to `main` via PR #6 squash merge at `5eee7cb`.
- Phase 51 feature branch `feature/51-path-ergonomics-bridge-helpers` merged to `main` via PR #7 squash merge at `b2dc14b`; remote branch deleted by merge automation.
- PR #7: MERGED — https://github.com/coctostan/pi-ptc-next/pull/7; GitHub Actions `Verify release baseline` and Socket checks SUCCESS.
- PR #8: MERGED — https://github.com/coctostan/pi-ptc-next/pull/8; squash merge `b91d71d` to `main`; GitHub Actions `Verify release baseline` and Socket checks SUCCESS; remote feature branch deleted by merge automation.
- PR #9: MERGED — https://github.com/coctostan/pi-ptc-next/pull/9; squash merge `1f9305a` to `main`; GitHub Actions `Verify release baseline` SUCCESS; feature branch `feature/53-test-runner-verb` deleted by merge automation; local `main` fast-forwarded.
- PR #11: MERGED — https://github.com/coctostan/pi-ptc-next/pull/11; squash merge `5bd2108` to `main`; GitHub Actions `Verify release baseline` and Socket checks SUCCESS; local `main` fast-forwarded; remote/local feature branch deleted.
- PR #12: MERGED — https://github.com/coctostan/pi-ptc-next/pull/12; squash merge `bb54af2` to `main`; GitHub Actions `Verify release baseline` and Socket checks SUCCESS; remote/local feature branch deleted (Phase 55).
- PR #13: MERGED — https://github.com/coctostan/pi-ptc-next/pull/13; squash merge `b1a42a9` to `main`; GitHub Actions `Verify release baseline` ×2 and Socket Security ×2 SUCCESS; remote/local feature branch deleted (Phase 56).
- PR #14: MERGED — https://github.com/coctostan/pi-ptc-next/pull/14; squash merge `3a1ffbf` to `main`; GitHub Actions `Verify release baseline` ×2 and Socket Security ×2 SUCCESS; remote feature branch deleted by merge automation; local `main` fast-forwarded.
- PR #15: MERGED — https://github.com/coctostan/pi-ptc-next/pull/15; squash merge `a574a6d` to `main`; GitHub Actions `Verify release baseline` ×2 and Socket Security ×2 SUCCESS; remote feature branch deleted by merge automation; local `main` fast-forwarded.
- PR #16: MERGED — https://github.com/coctostan/pi-ptc-next/pull/16; squash merge `50f99a9` to `main`; GitHub Actions `Verify release baseline` ×2 and Socket Security ×2 SUCCESS; remote feature branch `feature/59-readme-docs-polish` deleted by merge automation; local `main` fast-forwarded (Phase 59).
- PR #19: MERGED — https://github.com/coctostan/pi-ptc-advanced/pull/19; squash merge `3c573dd` to `main`; GitHub Actions `Verify release baseline` ×2 and Socket Security ×2 SUCCESS; remote feature branch deleted by merge automation; local `main` fast-forwarded (Phase 62).
- PR #20: MERGED — https://github.com/coctostan/pi-ptc-advanced/pull/20; squash merge `bde0db1` to `main` (2026-05-14T16:45:24Z); GitHub Actions `Verify release baseline` and Socket Security checks SUCCESS; remote feature branch was not auto-deleted on merge, so local/remote `feature/63-stable-source-payload-contract` were cleaned up manually during Phase 63 transition verification on 2026-05-16; local `main` already fast-forwarded (Phase 63).
- Note: PR #21 and PR #22 (unrelated `code_execution` prompt-trim hotfixes) merged to `main` after PR #20 outside the PALS FIX lifecycle; out of Phase 63 scope, recorded for traceability only.
- Tags: `0.14.0` remains on the earlier Milestone 14 handoff checkpoint; no `0.16.0` tag created (publish remains manual)
- Phase 64: feature/64-pi-tui-collapsed-expanded-rendering holds product/config commits cab0658, 403e3cd, 01ed9ee plus finalized reconciliation / prepared transition metadata. PR #23 OPEN — https://github.com/coctostan/pi-ptc-advanced/pull/23; completed product checks Verify release baseline FAILURE, Socket SUCCESS. PR full 274 pass / 2 fail; exact main base had both failures. Phase metadata commit/push uses this feature branch; see git log for receipt. No local/main merge; CI-EVIDENCE is detailed source.
## Session Continuity
Last session: 2026-10-01
Stopped at: Approved standard fix 65-01 in progress; Phase 64 PR #23 CI/merge gate still blocks main-loop progression.
Next action: Push scoped 65-01 repair and obtain passing live PR #23 checks, then finalize post-unify evidence once; explicit merge intent still required before Phase 65 main-loop planning.
Resume file: `.paul/phases/65-regression-tests-and-docs/65-01-FIX-SUMMARY.md` (local fix verified; live CI pending; main loop unchanged)
wip_result: Phase 64 reconciliation is complete. Scoped standard CI repair approved (`R7 — no spec impact`) and in progress on the existing PR branch; no runtime/payload/prompt/dependency contract changes. Merge intent remains unapproved; Phase 65 main-loop planning has not begun.
Resume context:
- Phase 64 reconciliation complete with D1–D4 discarded as intent changes; evidence retained, no CI waiver. Phase 65 ○○○ transition prepared only; Milestone 21 3/4 reconciled. Live next action remains Phase 64 PR #23 CI gate, not Phase 65 PLAN.
- Success/running/failure/report visual batch uses `pi --no-extensions --extension /Users/maxwellnewman/pi/workspace/pi-ptc-next/src/index.ts --no-session`; no duplicate PTC extension.
- Focused 41 passing; full 267 passing / unchanged 9 baseline Node failures; audit unchanged; refactor no-op.
- Pre-unify zero registered modules; post-unify WALT/SKIP/CODI/RUBY complete. History rows appended once for 64-01 (do not duplicate), SKIP rationale in SUMMARY, RUBY scoped no-refactor review. SUMMARY finalized; explicit ROADMAP inventory selected last_plan=true. Mandatory transition metadata rides current feature PR; new Phase 65 action must not run while Phase 64 CI/merge gate is open.
- Prepared next action after gate closes: /paul:plan for Phase 65 — Regression Tests and Docs. CI-EVIDENCE distinguishes CI read-payload/Unknown type failures from local Node-option baseline; base failures still block merge. Use separately scoped fix, passing live CI, explicit merge intent, base sync and branch cleanup before exposing prepared route.

---
*STATE.md — Updated for Phase 64 finalized reconciliation / prepared Phase 65 transition; CI/merge gate blocked (last updated: 2026-10-01)*