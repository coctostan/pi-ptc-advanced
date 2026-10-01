---
phase: 65-regression-tests-and-docs
plan: 01
type: fix
chain_node: R7 — no spec impact
status: applied-awaiting-live-ci
completed: null
---

## Fix Summary
**Issue:** Phase 64 PR #23 fails exact README/live-read comparison and real hashline RPC interop validation.
**Mode:** Approved standard fix (`approve`); side-loop only.
**Chain node:** `R7 — no spec impact`, unchanged from the accepted proposal in FIX.md. Source: Phase 64 CI-EVIDENCE and ROADMAP M21 boundaries.

### Root Cause and Repair
CI requests nonexistent upstream `v0.8.6`, then silently clones latest. Latest adds read `continuation`/symbol `tier` fields and uses TypeBox 1.x schemas without the Sinclair validation metadata expected by this registry. Both failures reproduce under supported Node 22 before repair.

Pin upstream **v0.8.16 / f1234813c5f2ea0a0476143b41a59cf2094e945b**, which retains the current read payload and Sinclair schema contracts; remove fallback and verify the exact commit before installation. Two regression guards require compatible pinning, no swallowed failure, and identity verification before fixture installation. This is a CI fixture repair, not a declaration of compatibility with latest hashline/TypeBox 1.x. Fixture source is immutable; transitive npm installation remains the pre-existing policy, not fully hermetic dependency resolution.

**Evidence correction:** The read assertion's actual operand is README; expected is the live payload. Original CI-EVIDENCE prose reversed these operands. README lacks the new fields, not the other way round. The original diff remains valid; an explicit correction was appended without deleting historical evidence.

**Alternative rejected:** Updating README or bypassing/converting runtime schemas merely to accommodate an accidental floating fixture would change contracts unnecessarily. The supported pinned fixture passes the unchanged assertions and RPC workflow.

### Files Changed
| File | Change |
|---|---|
| `.github/workflows/ci.yml` | Valid tag, exact commit guard, no latest fallback; same verification command and sibling-root export |
| `test/ci-hashline-fixture.test.ts` | Two fail-closed workflow regression guards |
| Phase 64 `64-01-CI-EVIDENCE.md` | Append approved diagnosis, operand correction and repair cross-reference |
| Current-phase FIX / FIX-SUMMARY and `.paul/STATE.md` | Authorization, scope, verification, side-loop status; main loop unchanged |

No `src/*`, README, prompts, result payloads, Python runtime, package metadata/lockfiles, dependency contracts, active sibling checkout or remote URLs changed. No dependency-risk waiver, publish, merge, Phase 65 PLAN or milestone-intent amendment.

### Verification
- Fresh PR run **36805443212** at **5f9a56f58bbbaa4904f912a74988781c64fb9d15**: 29 focused pass; full 274 pass / 2 fail.
- Fresh local Node **v22.23.1** baseline with existing latest sibling: `npm test`, exit 1; 276 total / 274 pass / 2 fail / 0 skipped. Same two named CI failures.
- RED guards: 0 pass / 2 fail before workflow repair. GREEN: 2 pass / 0 fail.
- With Node v22.23.1 / npm **10.9.4** and canonical isolated pinned fixture, **`npm run verify:ci` exits 0**: focused **29/29**; full **278/278**, no failures/skips; release package metadata, tarball surface and clean installability pass.
- `node node_modules/typescript/bin/tsc --noEmit`, YAML parse / required CI keys, and `git diff --check` pass. No configured lint/format/coverage command. An initial `npm run typecheck` attempt found no such script; direct TypeScript verification recovered successfully.
- Audit unchanged: **0 critical / 7 high / 2 moderate**; existing acknowledgement is expired and was not renewed. No new findings or dependency repair inferred.
- Evidence commands and setup recovery: FIX.md § APPLY evidence; process `proc_3496` baseline and `proc_128a` complete passing CI-parity logs. Temporary `/tmp` vs `/private/tmp` path-only probe failures disappeared with canonical fixture root; assertions were not weakened.
- **Live repaired-head CI: pending.** Local success does not close the live CI gate.

### Quality
| Metric | Before | After | Delta |
|---|---|---|---|
| Full tests passing (Node 22) | 274 | 278 | +4: two repairs + two guards |
| Full tests failing | 2 | 0 | -2 |
| Full tests skipped | 0 | 0 | 0 |
| Type errors | — | 0 | Verified current result |
| Coverage / lint | — | — | Not configured |

### Module Execution Reports
Parent dispatched installed post-apply hooks in registry priority order and retains the following annotations. Post-unify history/report finalization awaits live CI; no Phase 64 history rows are duplicated.

| Module | Status | Evidence / outcome |
|---|---|---|
| WALT | PASS | 274/2 -> 278/0, 29 focused pass, full verify:ci / release proof, TypeScript clean, diff clean; strict no-regression gate passes locally |
| ARCH | PASS | New test imports only node:test, node:assert/strict, node:fs, node:path; no production layer or local imports changed; 33-line test, 46-line CI file, no size/growth concern |
| SETH | PASS | Public fixture SHA is not a secret; trusted static clone and SHA verification before install; no dynamic user input, validation bypass or new runtime sink |
| GABE | SKIP | No API files in changed set |
| DEAN | PASS_WITH_CONCERNS | Unchanged audit 0 critical / 7 high / 2 moderate; no new vulnerabilities, no implicit renewed acknowledgement |
| DANA | SKIP | No data/schema/migration files |
| LUKE | SKIP | No UI files |
| ARIA | SKIP | No UI files |
| OMAR | SKIP | No logging/health/error-handler source changes |
| DAVE | PASS | Nushell YAML parse passes; ubuntu-latest, checkout and verification step present; fixture tag/SHA fail closed |
| PETE | PASS | One bounded CI-file read in the guard test; no runtime/query/render loop change or performance finding |
| REED | PASS | CI fixture failure now propagates instead of silently replacing source; no service resilience contract changed |
| VERA | SKIP | No privacy/PII/storage changes |
| TODD | PASS | Standard config fix, not main-loop TDD; guard RED/GREEN recorded, full suite passes, unchanged live assertions retained; no refactor needed |
| DOCS | PASS | Runbook verify:ci command remains accurate; test-only scope has no public-doc drift; CI comments explain the pin; Phase 65 source-visibility docs remain unstarted |
| IRIS | PASS | Changed test/config only; no unused symbol, empty/broad catch, dead code or review-marker finding; no configured linter required |
| SKIP | NOTE | Source-backed fixture-pinning decision candidate below; no unrelated history scan or lifecycle writes by module |

### Knowledge Candidate (SKIP)
**Source:** This FIX-SUMMARY § Root Cause and Repair / Verification.
**Date:** 2026-10-01.
**Title / Type:** Fail closed on contract integration fixtures / decision.
**Phase/Plan:** 65-01 standard side-loop repairing Phase 64 PR #23.
**Context:** An absent tag caused CI to silently adopt newer payload/schema contracts.
**Content / rationale:** Pin a verified compatible tag plus immutable SHA and remove fallback; retain exact assertions and validation instead of masking accidental environment drift.
**Impact:** Future fixture upgrades require deliberate compatibility review and regression proof. This does not amend M21 source-visibility intent or certify latest upstream compatibility.

### Result
Local repair and post-apply verification pass. Await live CI, then finalize post-unify evidence once. Explicit merge intent and current-head passing checks remain mandatory; Phase 65 main loop stays unstarted.
