---
phase: 65-regression-tests-and-docs
plan: "02"
subsystem: testing
serves: [M21]
tags: [python-source, tui, regression, docs]
status: complete-with-concerns
requires:
  - phase: 63-stable-source-payload-contract
    provides: original source and Python failure details
  - phase: 64-pi-tui-collapsed-expanded-rendering
    provides: collapsed/expanded registered renderer
provides:
  - real execution-to-render source regressions
  - bounded source-inspection docs and compact-description guards
affects: [milestone-21-completion]
tech-stack:
  added: []
  patterns: [real execution with isolated boundary fixtures]
key-files:
  created: [test/code-execution-source-visibility.test.ts]
  modified: [test/prompt-guidance.test.ts, README.md, src/index.ts]
key-decisions:
  - preserve protected runtime and prompt contracts
patterns-established:
  - distinguish raw physical source lines from padded terminal rows
duration: not measured
started: not recorded
completed: 2026-10-01
---

# Phase 65 Plan 02: Regression Tests and Docs Summary

**Real Python execution now guards registered source disclosure; bounded README guidance and a 247-character description explain inspection without runtime changes.**

## Performance

Three tasks completed; four product paths changed. APPLY date: 2026-10-01. Duration and exact APPLY timestamps were not recorded. This reconciliation reuses APPLY verification rather than rerunning quality checks.

## Acceptance Criteria Results

All evidence below comes from `65-02-APPLY-LOG.md` (same directory) and the approved `65-02-PLAN.md` AC/task IDs. UNIFY checked the feature diff against origin/main and the actual new test source.

| Criterion | Result | Evidence |
|---|---|---|
| AC-1 | PASS | APPLY § Task 1; five real success/stdout, nested/progress, report, ValueError and syntax cases. Exact code.split("\n") arrays retain CRLF/indentation/blanks, failure/report metadata survives, ordinary output has no appended whole-source block. |
| AC-2 | PASS | APPLY §§ Task 1, Task 3; registered renderer receives generated updates/results, omitted/false/true expansion, valid-only arrows, body-before-source and width/toggle nonmutation checks; existing Unicode/key/legacy suite passes. |
| AC-3 | PASS | APPLY §§ Task 2, Task 3; README source-inspection guard missing-text failure → GREEN. Metadata/display distinction, supported states, report/fallback/transport limits, multiline example and proof command covered. |
| AC-4 | PASS | APPLY §§ Task 2, Task 3; description guard missing-text failure → GREEN; 247 characters, original three sentences and exact prompt metadata retained. src/index.ts diff changes only the description line. |
| AC-5 | PASS | APPLY §§ Pre-APPLY baseline, Task 3, Post-APPLY; fresh supported Node 22 verify:ci full 278/278 → 285/285, focused final 54/54, no failures/skips; release metadata/tarball/installability at unchanged 1.0.0, noEmit and diff PASS. |

## Accomplishments / Task Commits

| PLAN task | Commit | Actual result / verification |
|---|---|---|
| 1 | `1db7732` | Integration companion uses real CodeExecutor/RpcProtocol/bundled Python; only sandbox/registry/manager boundaries replaced. Official focused retry 36/36 PASS; child/session/cache/env/keybindings cleanup verified. |
| 2 | `84e5e2d` | Documentation/description guards before text edits: existing 2 PASS, new 2 expected missing-text FAIL; no runtime or loader failure. |
| 3 | `acc4474` | Bounded source-inspection subsection and exact short sentence; final focused 54/54 and full/release/type/diff proof PASS. No-op refactor rationale in APPLY § Task 3. |

Parent planning/APPLY receipts: `9d2381e`, `b4a710d`. Final UNIFY/transition metadata is committed on the feature branch under `docs(65-02): complete regression proof and final-phase transition`.

## Files Created/Modified

| Product path | Change | Purpose |
|---|---|---|
| `test/code-execution-source-visibility.test.ts` | Created, 227 lines | Actual payload-to-registered-render proof with synthetic fixtures and cleanup. |
| `test/prompt-guidance.test.ts` | +47 lines; 223 total | Bounded README and compact-description concept guards. |
| `README.md` | Local subsection; 1117 total | Source inspection states, expansion, raw metadata/display limits and focused command. |
| `src/index.ts` | String-only line; 391 total, no growth | Append expansion sentence; no execution/session/routing/render change. |

No unplanned product paths, protected runtime/contract/render/Python/package/CI/fixture changes, dependency edits or generated artifacts. PLAN/PROJECT/ROADMAP/STATE/APPLY receipts are parent-owned lifecycle scope. The consumed handoff is archived during this UNIFY; these writes are not new product intent.

## Decisions Made

Human `yes` after resume authorizes UNIFY only. No merge intent, renewed audit acknowledgement, scope amendment or new subjective visual observation inferred. The completed 65-01-FIX is a separate side-loop; Phase 65 declares one main-loop plan, 65-02.

## Deviations from Plan / Issues Encountered

No scope deviation, task omission or unresolved checkpoint. Task 1 initially had 31 PASS / 5 FAIL because Text.render pads terminal rows, not because runtime source was wrong. The test expectation was corrected with padEnd(240) and first-output-line comparison; exact raw-source equality stayed unchanged. The official retry passed 36/36 before subsequent tasks. This planned-fixture correction is not a production repair or manufactured runtime RED.

### Lesson retained for SKIP

Source: `65-02-APPLY-LOG.md` §§ Task 1, SKIP knowledge candidate; `test/code-execution-source-visibility.test.ts` § verifyDisclosure. Date: 2026-10-01; Phase 65 / plan 02; type: lesson; title: Separate raw source metadata from terminal row padding. Context: real payloads passed raw checks while rendered-row comparisons assumed unpadded strings. Content: keep exact code.split("\n") equality at the execution boundary; display assertions account for Text padding and trailing-CR normalization. Impact: future execution/render proof distinguishes storage invariants from terminal presentation without changing protected runtime code.

## Quality

| Metric | Before | After | Delta |
|---|---|---|---|
| Full tests passing | 278 | 285 | +7 ▲ |
| Full tests failing | 0 | 0 | 0 ● |
| Full tests skipped | 0 | 0 | 0 ● |
| Types | No baseline count captured | noEmit exit 0 | Not quantified |
| Coverage / lint / formatter | Unavailable | Unavailable | — |

Overall: ▲ improved. Source: APPLY §§ Pre-APPLY baseline, Task 3, WALT. Node v22.23.1 / npm 10.9.4; exact canonical fixture v0.8.16 at f1234813c5f2ea0a0476143b41a59cf2094e945b and isolated toolchain recipe are retained in APPLY § Supported verification environment. No skipped live tests, root/sibling/global installation edits or invented coverage/lint/timing metrics.

## Spec Deltas and Routing

Human `approve all` explicitly approved the sole D1–D3 discard batch on 2026-10-01, with no redirect/contest. All target existing M21. Review seconds: not measured. Discard makes no intent amendment, removes no evidence, renews no acknowledgement and waives no security/CI/merge gate. Decision provenance: Phase 65 / plan 02 / this SUMMARY § Spec Deltas and Routing.

| Delta / Type | Stable target | Source citation / evidence summary | Proposed route | One-line rationale | Human decision / redirect / contest | Elapsed review seconds | Amendment / provenance result |
|---|---|---|---|---|---|---|---|
| D1 / DEFERRED: existing dependency risk | M21 | APPLY § Post-APPLY / DEAN: 0 critical / 7 high / 2 moderate unchanged; acknowledgement expired | discard | Preserve existing risk evidence without broadening protected proof/docs scope or waiving security/CI | approved: human `approve all`; no redirect/contest | not measured | discarded as intent change; no amendment; Phase 65 / plan 02 / this SUMMARY |
| D2 / DEFERRED: advisory maintainability | M21 | APPLY § Post-APPLY / ARCH, PETE, IRIS; new test:32–119 helper 88 lines; test parent 49 files; existing src/index.ts 391 lines | discard | Isolated test lifecycle and companion proof meet scope; no broad extraction or suite reorganization warranted here | approved: human `approve all`; no redirect/contest | not measured | discarded as intent change; no amendment; Phase 65 / plan 02 / this SUMMARY |
| D3 / DEFERRED: advisory instrumentation limits | M21 | PLAN § Blast Radius (CODI), noncanonical dispatch line / stale edges / unresolved renderer; APPLY baseline has no lint/coverage tooling | discard | Real source/registration proof is authoritative; keep unknown metrics unknown, do not add tooling or infer graph coverage | approved: human `approve all`; no redirect/contest | not measured | discarded as intent change; no amendment; Phase 65 / plan 02 / this SUMMARY |

## Module Execution Reports

Installed logical modules.yaml kernel 2.0.0-pals2.0 matches config; hook-local refs loaded. Parent owns lifecycle. Carried-forward APPLY/module findings are evidence; § Spec Deltas and Routing is the sole human routing record.

[dispatch] pre-unify: 0 modules registered for this hook
[dispatch] post-unify: WALT(100), SKIP(200), CODI(220), RUBY(300) — completed; no module returned action: block
[dispatch] CODI post-unify: injected-degraded — one 65-02 history row appended; R/U/K unknown, exact symbol heading retained

### WALT — PASS

APPLY § WALT: full 278/0/0 → 285/0/0, focused final 54/54; release/types/diff PASS. Post-unify appended exactly one 65-02 row to tracked `.paul/quality-history.md` (installed logical QUALITY-HISTORY path) with 285 passes, 0 type errors, lint/coverage — and improved verdict; trajectory updated. No rerun; baseline type count absent, no type delta invented.

### TODD — PASS

Execute off-ramp, actual integration proof and expected missing-documentation failures → GREEN; no production logic requiring runtime RED. Full +7 passes, zero new/unresolved failures; no-op refactor rationale retained in APPLY.

### DEAN — PASS_WITH_CONCERNS

APPLY § DEAN: audit exit 1 with parseable counts, all severity deltas zero. High packages: pi-coding-agent, brace-expansion, extract-zip, ip-address, protobufjs, undici, ws; moderate: file-type, yaml. No new critical/high finding; expired historical acknowledgement untouched, no fix/waiver. D1 routes this retained risk.

### ARCH — PASS_WITH_CONCERNS

APPLY § ARCH: test imports only platform/contracts, no production import edits or invented layer map. Test directory 48→49 files (>25 advisory). Companion avoids test/index.test.ts growth. D2 routes maintenance evidence.

### PETE — WARN

APPLY § PETE: new withRegisteredTool lines 32–119 = 88 lines (>80 advisory), bounded fixed depth-2 toggle matrix and one README read. Test setup/teardown, not latency evidence. No benchmark or production performance claim. D2 routes fixture review.

### IRIS — PASS_WITH_CONCERNS

APPLY § IRIS: no unused/dead/empty-catch/marker issue in scoped changes; same 88-line fixture concern, no configured lint tool. D2/D3 retain the concerns without broadening scope.

### SETH — PASS

APPLY § SETH: trusted synthetic Python literals via argv, no shell or secret-like literals; no production auth/validation/sink change.

### REED — PASS

APPLY § REED: finally restores session/cache/env/keybindings and waits for tracked children; execution timeout 10s. No retry/service/runtime resilience edits.

### DOCS — PASS

APPLY § DOCS: src/index.ts → README subsection UPDATED (1); test/README content NOT_APPLICABLE (3); no candidate drift, release/API claims or unrelated doc overhaul.

### SKIP — NOTE

Post-unify validated the APPLY lesson's required fields against this SUMMARY § Lesson retained for SKIP and workflow evidence. Parent persisted one entry at `.paul/knowledge/65-02-source-metadata-terminal-padding.md`. Lesson only, not a new intent requirement, human decision or hidden lifecycle record.

### CODI — WARN

Post-unify resolved sibling PLAN § module_dispatch as primary. Noncanonical trace plus Blast Radius/symbol heading yields injected-degraded, not invented numeric counts: R/U/K = —; Symbols = buildToolDescription (exact heading), blast_radius=y. Renderer unresolved text remains cited evidence, not a fabricated symbol heading. Appended exactly one 65-02 row to `.paul/CODI-HISTORY.md`; no graph rerun. Stale edges/unresolved renderer remain advisory, not coverage; D3 routes instrumentation limits.

### RUBY — WARN

Post-unify reviewed only changed source/test diff and actual companion source. Measured lines: new test 227, prompt test 223, src/index.ts 391, README 1117; README docs are not code debt. withRegisteredTool:32–119 = 88 lines isolates process/cache/env lifecycle effects; source disclosure assertions are already separate in verifyDisclosure. Existing 391-line production anchor has no growth and only a string edit. No local pure-core extraction justified, broad refactor forbidden by scope. Lint/complexity tools unavailable; no metrics invented, blast radius unknown except bounded harness calls. D2/D3 route maintained advisories; no new product behavior or blocking finding.

### Routine-skip appendix (carried-forward post-apply)

One cohort summary: GABE, LUKE, ARIA, DANA, OMAR, VERA, DAVE have no applicable changed production surface.
- GABE | SKIP | no route/controller/API/schema change
- LUKE | SKIP | no UI component paths
- ARIA | SKIP | no HTML/UI component change
- DANA | SKIP | no data/schema/migration change
- OMAR | SKIP | no production logging/readiness/error-handler change
- VERA | SKIP | synthetic fixtures, no privacy/storage/consent/PII change
- DAVE | SKIP | no CI/Dockerfile change

### Derived-aid append / artifact budget

[ledger] WARNING: module efficacy append skipped — referenced `docs/PALS-MODULE-EFFICACY-LEDGER-CONTRACT.md` is absent from the installed runtime. Existing `.paul/MODULE-LEDGER.md` unchanged; SUMMARY remains authoritative. This derived-aid input failure is non-blocking, not missing module dispatch, new product intent or a waived gate.

SUMMARY is above the advisory 12,000-byte soft ceiling (14,294 bytes before this note). Recommend compacting repeated routine AC/task references with ID-plus-source slices in future; preserve required routing/module/evidence fields. Budget pressure does not block closure or authorize truncation.

## Next Phase Readiness

Reconciliation finalized: AC-1–5 PASS, three tasks complete, D1–D3 explicitly discarded as intent changes, mandatory post-unify evidence/history/knowledge durable. ROADMAP one main-loop plan / 1/1 complete gives last_plan=true; mandatory final-phase PROJECT/ROADMAP/STATE transition prepared and consistency verified. Implementation sanity: all four planned product paths already live in task commits 1db7732/84e5e2d/acc4474, so final commit intentionally contains only parent metadata, not missing implementation. No stale phase handoffs or root AGENTS.md found. PR #24 merge gate remains open without merge intent; pushed head requires fresh CI. M21 completion/fresh-context adherence audit remains separate after merge; no publish/tag/release authorized.
