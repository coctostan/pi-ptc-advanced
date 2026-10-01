---
phase: 64-pi-tui-collapsed-expanded-rendering
plan: "01"
subsystem: ui
tags: [pi-tui, python-source, rendering, tdd]
status: reconciled-merge-blocked
requires:
  - phase: 63-stable-source-payload-contract
    provides: source-bearing success, partial and Python-failure details
provides:
  - width-aware collapsed first-physical-line preview across source-bearing states
  - full numbered expanded source with progress and diagnostics preserved
  - focused rendering regression evidence and Phase 65 handoff
affects: [65-regression-tests-and-docs]
tech-stack:
  added: []
  patterns: [pure formatting core, stateless width-aware TUI boundary]
key-files:
  created: [src/code-execution-renderer.ts]
  modified: [src/index.ts, test/code-execution-rendering.test.ts, pals.json]
key-decisions:
  - prioritize source over expansion hint at narrow widths
  - retain execution, payload, prompt and report contracts
  - repair only the configured repository target with explicit approval
duration: not measured
started: 2026-10-01
completed: 2026-10-01 # reconciliation finalized; GitHub Flow merge gate still blocked
---

# Phase 64 Plan 01: Pi TUI Source Rendering Summary

**Implemented consistent collapsed first-line disclosure and expanded numbered Python source for running, successful, report and structured-failure results.**

Reconciliation finalized with concerns: AC-1–7 verified, mandatory module reports complete. User approved UNIFY (`1`) and all four discard routes (`approve all 4`). No intent amendments or CI waiver. PR #23 CI failure blocks GitHub Flow closure and live Phase 65 progression; no merge intent.

## Performance

Three automated tasks and one explicitly approved human visual checkpoint. Duration/review timing not measured. Product scope is three planned source/test paths; pals.json carries the prior additive migration and approved target repair. No required `<skills>` section in PLAN; no skill-invocation gap.

## Acceptance Criteria Results

Evidence: sibling `64-01-PLAN.md` AC-1–7; `64-01-APPLY-LOG.md` §§ Baselines and TDD, Task outcomes, Visual batch. UNIFY inspects committed scope and carries APPLY results; it does not rerun WALT checks.

| Criterion | Result | Evidence |
|---|---|---|
| AC-1 collapsed preview | PASS | State matrix tests: success/report/progress/generic/nested/failure; false and omitted expanded; later lines hidden. Renderer:40–48,92–100. |
| AC-2 expanded source | PASS | Full order/indentation/blank lines, valid progress arrow, no invented progress; formatter and registration tests. Renderer:24–37,63–68,94–97. |
| AC-3 failure/compatibility | PASS | Explicit failed text, compact summary or full diagnostics, traceback deduplication, report/body-first, legacy/empty fallback, no metadata mutation. Renderer:69–90. |
| AC-4 width/edges | PASS | 40/80/120 widths; Unicode/combining marks/tabs/blank/CRLF/grammar/repeated redraw; configurable key. Getter test proves collapse does not visit later lines. |
| AC-5 RED | PASS | Before product edits, 6 pass / 5 assertion failures: absent completed preview, state-matrix first line, wrong generic partial classification, missing failure label, two-row preview. `cab0658`. |
| AC-6 GREEN | PASS | Build + focused renderer/index/RPC/error suite 41/41. `403e3cd`. |
| AC-7 REFACTOR | PASS | Explicit bounded no-op review; repeated focused 41/41; unchanged full-suite failure names vs fresh baseline. |

Visual decision: human `approved` for success/running/failure/report/narrow-width batch. Isolated loader proved exactly `/Users/maxwellnewman/pi/workspace/pi-ptc-next/src/index.ts`, errors=[]; initial cleanup omission timed out, corrected shutdown-handler probe exited 0. No automated subjective TUI observation is claimed. Launch: `pi --no-extensions --extension /Users/maxwellnewman/pi/workspace/pi-ptc-next/src/index.ts --no-session`.

## Tasks, Commits and Files

| Task | Result | Commit / actual |
|---|---|---|
| 1 RED | PASS | `cab0658` — specify source disclosure regressions |
| 2 GREEN | PASS | `403e3cd` — shared renderer and thin renderResult wiring |
| 3 REFACTOR / proof | PASS_WITH_CONCERNS | No-op after test-backed extraction; prior baseline and audit concerns retained |
| Config recovery | approved | `01ed9ee` — canonical target plus prior additive schema/CODI/implementer migration |

| File | Actual change |
|---|---|
| src/code-execution-renderer.ts | New 118-line formatter / stateless width-aware Text boundary |
| src/index.ts | Renderer delegation; shrank 470→391 physical lines; keybinding lookup remains here |
| test/code-execution-rendering.test.ts | Registration and pure-core regressions; 301→462 physical lines |
| pals.json | Prior additive migration preserved; git.remote alone repaired to canonical URL after explicit `yes` |

UNIFY measured the same file sizes and reviewed committed entrypoint/test diff plus renderer source. No execute/payload/report/prompt/description/recovery/dependency/CI semantic edits. No unapproved implementation paths: config is explicitly authorized lifecycle recovery, `.paul/*` is parent-owned evidence. No delegated implementer.

## Verification and Issues

Commands and exact named local failures remain in APPLY-LOG §§ Baselines and TDD / Enforcement cohort.

- Build + `node --test test/code-execution-rendering.test.ts test/index.test.ts test/rpc-protocol.test.ts test/execution-errors.test.ts`: 33→41 pass, exit 0 after GREEN and no-op.
- `npm test`: fresh local baseline 268 total / 259 pass / 9 fail → 276 total / 267 pass / same 9 fail. All nine failed with `node: bad option: --experimental-transform-types` on Node v26.7.0. These are failures, not waived/passing tests.
- `npx tsc --noEmit`: exit 0. `git diff --check`: clean. Lint/format/coverage unavailable, no invented metrics or infrastructure.
- `npm audit --json`: exit 1 with unchanged 0 critical / 7 high / 2 moderate / 0 low. Historical DEAN acknowledgement expired 2026-06-11; untouched, no renewal/override.
- Exact old-slug target guard initially blocked postflight. User approved only pals.json.git.remote repair; subsequent expected/observed `coctostan/pi-ptc-advanced` exact match. Origin/upstream URLs unchanged; branch pushed, PR #23 opened.

### Live CI exception

Source: `64-01-CI-EVIDENCE.md` (guarded gh commands, exact run URLs and base SHA). PR #23 is OPEN. Both Verify release baseline checks failed; both Socket checks succeeded. Detailed PR run 36803707293: focused 29/29; full 274 pass / 2 fail, exit 1:
1. README read example normalized payload mismatch: expected continuation:null and symbol tier:'exact', actual omits both.
2. Real hashline interop: TypeBox Value.Check / validateToolParams reports `Unknown type`; sg unavailable warning also present. Root cause not established.

Current main run 36799864386 at exact base `1aed19a5f25c0c4f687d6521c07fa043df5a3b54` failed 264 pass / 4 fail, including both PR failures plus two grep fixture failures. This establishes both failures predate renderer changes, not hermetic equivalence or a renderer-caused improvement. CI's sibling clone/dependencies can vary. CI failure is not the local Node-option mechanism and still strictly blocks merge; no merge-anyway path.

## Decisions, Deviations and Lessons

Source/hint trade-off follows PLAN: normalize display CR/tabs before terminal width measurement; omit hint before sacrificing preview width; source metadata remains immutable. Thin index shell injects active key hint; pure formatting has no I/O/env/logging/state/cache effects. No syntax highlighter or independent toggle.

No renderer behavior/scope deviation. Lifecycle additions: additive installed-config migration and explicitly approved one-field target repair. Probe cleanup retry was operational, not spec change. Advisory growth/docs/lint/instrumentation concerns and live CI failure are included in the routing batch below; none is silently waived. Phase 65 docs/E2E work is already planned, not newly added scope.

## Spec Deltas and Routing

Human decision on 2026-10-01: **`approve all 4`**, accepting D1–D4 `discard` routes without redirect or contest. Existing stable target **M21** retained. Discard means no product-intent amendment, not evidence removal or CI/security/programmatic waiver. Elapsed review seconds: **`not measured`**. No amendment provenance applies; decision provenance is Phase 64 / plan 01 / this SUMMARY § Spec Deltas and Routing.

| ID / typed delta | Target | Source / evidence | Proposed route | Rationale | Human decision | Review seconds | Amendment/provenance result |
|---|---|---|---|---|---|---|---|
| D1 ADDED: lifecycle config recovery | M21 | APPLY-LOG §§ Approved recovery; PLAN § Config Migration / Boundaries; commit 01ed9ee | discard | Already sanctioned config machinery and explicit repair; no renderer intent change | approved: `approve all 4` | not measured | discarded as intent change; no amendment; 64-01 / this SUMMARY |
| D2 DEFERRED: baseline validation concerns | M21 | APPLY-LOG § Enforcement cohort: same nine local Node failures, unchanged 7 high/2 moderate, expired acknowledgement | discard | Preserve baseline evidence and protected-scope boundary; no audit/quality waiver or new intent | approved: `approve all 4` | not measured | discarded as intent change; no amendment; 64-01 / this SUMMARY |
| D3 DEFERRED: advisory maintenance / instrumentation | M21 | APPLY-LOG §§ Advisory cohort: +161 test lines/unlisted imports, README:191 candidate drift, lint absent; post-unify CODI below: noncanonical log -> degraded history counts | discard | Planned extraction/tests and existing Phase 65 docs scope; unavailable metrics stay unknown, no spec repair required | approved: `approve all 4` | not measured | discarded as intent change; no amendment; 64-01 / this SUMMARY |
| D4 ADDED: live CI merge blocker | M21 | CI-EVIDENCE §§ PR #23 / Current main comparison: read fixture mismatch and real interop Unknown type already on base | discard | Keep strict CI gate; repair via separately scoped follow-up, not broaden renderer spec or waive failed CI | approved: `approve all 4` | not measured | discarded as intent change; no amendment; 64-01 / this SUMMARY |

## Module Execution Reports

Installed registry kernel 2.0.0-pals2.0 is authoritative. Carried APPLY evidence is in APPLY-LOG; fresh UNIFY hooks use only hook-local refs. Parent owns lifecycle and official verification; no module/helper authority inferred.

`[dispatch] pre-unify: 0 modules registered for this hook`

Carried `[dispatch] post-apply advisory: ARCH, SETH, LUKE, OMAR, PETE, REED, VERA, DOCS, IRIS, SKIP` and `[dispatch] post-apply enforcement: WALT, GABE, DEAN, DANA, ARIA, DAVE, TODD`.

### WALT — PASS_WITH_CONCERNS

APPLY-captured quality only; no UNIFY test rerun. Full tests passing 259→267 (+8 ▲); failing 9→9 (stable, same unsupported-option names), skipped 0→0. Focused 33→41. Coverage/lint/format untracked; typecheck after 0 diagnostics, before count not captured. Overall tracked delta ▲ improved, with baseline failures still visible. Post-unify side effect: append 64-01 to `.paul/QUALITY-HISTORY.md`; full pass/fail detail retained. D2 holds the material baseline concern; CI is separately D4, not a substituted local WALT metric.

### TODD — PASS_WITH_CONCERNS

RED cab0658 before GREEN 403e3cd; genuine behavior failures, 41 focused pass, explicit no-op refactor. Same nine baseline failures. Carried pre-apply and all three post-task gates; D2.

### DEAN — PASS_WITH_CONCERNS

Critical 0→0, high 7→7, moderate 2→2, low 0→0; no new critical/high. Historical expired acknowledgement unchanged. D2.

### ARCH — WARN

APPLY-LOG boundary-check table cites existing/unlisted src-root imports as WARN, not invented violations. Test growth 301→462 (+161, threshold >100); no changed file >500. Index shrank; renderer remains 118. D3.

### DOCS — WARN

Two candidate-drift rows map renderer/index to one README:191 completed-only source description; two paths not applicable (test/config). No user docs edited; Phase 65 already owns copy and E2E proof. D3.

### IRIS — WARN

No configured linter, non-blocking; scoped manual source review reported no unused/dead/empty-catch/review-marker concerns. Stateless invalidate() intentional. D3.

### SETH — PASS

Carried scoped secret/sink scan had no matches; progress range validation renderer:18–22; no execution/auth changes.

### OMAR — PASS

No logging/telemetry/catch changes; original failure diagnostics retained at renderer:75–83.

### PETE — PASS

Collapsed path visits only first source line; getter regression; expanded linear formatting. No benchmark claim, cache or I/O.

### REED — PASS

Source-less fallback renderer:88–90, diagnostics retained; no retry/execution/shutdown change.

### VERA — PASS

Intentional TUI disclosure only; no new logging/storage/collection/sharing or realistic PII fixtures.

### SKIP — NOTE

Post-unify source-backed rationale entry returned for parent reporting, not a separate lifecycle store:
- Source: this SUMMARY § Decisions, Deviations and Lessons; APPLY-LOG § Advisory cohort; renderer:40–48.
- Date / phase-plan: 2026-10-01 / 64-01.
- Type / title: rationale / Measure preview before Text wrapping.
- Context: Text expands tabs and wraps long lines.
- Content: normalize display CR/tabs before measurement; source takes priority over hint; never visit later lines for collapse.
- Impact: Phase 65 docs/regressions must retain one-row preview and immutable source. No invented alternatives or new intent.

### CODI — WARN

Post-unify uses PLAN § Blast Radius (CODI), no rerun of impact. Bold headings are renderExecutingCode then renderCompletedOutput. Injection exists, but PLAN log says `8 raw call-site lines` rather than canonical `K total call-sites`; R/U/K are therefore **—**, not reconstructed from raw output. Outcome **injected-degraded**, blast_radius=y. Advisory data fidelity only; no lifecycle/test verdict. Side effect: one 64-01 `.paul/CODI-HISTORY.md` row. D3.

### RUBY — PASS

Measured UNIFY physical lines: renderer 118, index 391, test 462. Changed formatter source already separates deterministic transformations from Text boundary; key lookup stays in entrypoint. No new local refactor concern beyond carried ARCH growth advisory; no complexity/lint metrics invented. No code changes or RUBY history write required by installed hook.

Routine carried skip cohort: LUKE no web component paths; GABE no route/controller/schema; DANA no models/migrations; ARIA no web UI paths; DAVE no CI/deploy edits. Terminal tests/human batch are not web-a11y certification.
- `LUKE | SKIP | no .tsx/.jsx/.vue/.svelte paths`
- `GABE | SKIP | no route/controller/schema paths`
- `DANA | SKIP | no data/migrations`
- `ARIA | SKIP | no web UI paths`
- `DAVE | SKIP | no CI/deploy paths`

`[dispatch] post-unify: WALT, SKIP, CODI, RUBY` — installed priority order 100/200/220/300; hook-local refs loaded. WALT appended one 64-01 QUALITY-HISTORY row and updated trajectory; SKIP returned the complete source-backed rationale above; CODI appended one 64-01 history row; RUBY completed scoped review. `[dispatch] CODI post-unify: entered for 64-01; injected-degraded, history appended, R/U/K=—, blast_radius=y`. No helper lifecycle writes; no duplicate history append on resume. Parent now harvests only this finalized module section for the derived ledger.

## Next Phase Readiness

Phase 65 handoff: document first physical line across running/success/failure, full numbered expansion, failure status/diagnostics, blank placeholder and narrow-width source priority; active expansion key, report/output-first ordering, source-less transport fallback and metadata-only source outside TUI. Add broader payload-to-render proof without reopening execution/prompt/report semantics.

**Blockers:** PR #23 CI failure blocks merge even when pre-existing; merge intent absent. Routing is resolved and reconciliation finalized. Phase 65 transition metadata is prepared on the Phase 64 feature branch; live Phase 65 work remains gated. CI repair is a separately scoped action, not authorized by discard approval.

## Artifact Budget

SUMMARY is above the advisory 12,000-byte soft ceiling (measured 16,633 bytes after routing finalization, before the transition note). Compaction recommendation: shorten repeated task/verification prose to APPLY-LOG section citations; retain typed routing fields, explicit decisions, timing, module reports and material failure evidence. Advisory only; not a closure block or authority to truncate.

## Transition / GitHub Flow Gate

ROADMAP explicitly declares only 64-01, now COMPLETE / 1 of 1; stored completion result **last_plan=true**. Matching phase directory has its PLAN and finalized SUMMARY; no phase handoffs to clean. Mandatory PROJECT/ROADMAP/STATE transition writes prepare Phase 65 without starting PLAN or unlocking live routing. Full re-reads of all three artifacts validated phase/status/focus/progress alignment; core value and M21 intent unchanged.

Commit sanity: this is a lifecycle-only completion commit, not a missing implementation. The complete feature diff already contains all three planned product paths in RED/GREEN commits cab0658 / 403e3cd, inspected during parent reconciliation; no source edits went outside the repository and no source restaging/override is needed. Feature branch retained; no local merge to main, tag, publish or release. AGENTS.md absent, advisory stale check not applicable. Optional HTML packet not requested.

Parent derived module-ledger harvest completed from this finalized module section (including no-scope rows); it is non-authoritative and has no influence on gating. History rows must not be appended again on resume.

Live gate order remains PR -> passing CI -> reviews if required -> explicit merge intent / merge -> base sync -> branch cleanup. require_reviews=false; current failed CI blocks before merge. Prepared Phase 65 route stays unavailable. Single next human action: approve separately scoped standard /paul:fix to diagnose and repair PR #23 read fixture / real hashline interop failures, with baseline revalidation and passing CI; no fix approval or merge intent inferred.
