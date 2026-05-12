---
phase: 48-compatibility-proof-and-release-readiness
plan: 01
type: tdd
status: complete
applied_on: 2026-05-12
---

# Phase 48 — Plan 01 SUMMARY

Plan: [`48-01-PLAN.md`](./48-01-PLAN.md)

## Objective vs Result

**Planned:** Finalize the bounded `0.16.0` compatibility-proof and release-readiness surface for `pi-ptc-advanced`, with explicit evidence for Pi compatibility, package versioning, release verification, and the acknowledged dependency-audit risk baseline.

**Result:** Achieved. Package metadata, lockfile root, and verify-release-package script now target `pi-ptc-advanced@0.16.0`. A new focused regression test (`test/release-readiness.test.ts`, 7 tests) guards version/doc-link/audit-caveat drift. README, CHANGELOG, personal-fork runbook, and a new `docs/releases/0.16.0.md` describe the Milestone 17 outcomes accurately and explicitly do not claim a hard `@earendil-works/*` migration or a clean dependency audit. The user explicitly accepted the DEAN-acknowledged audit baseline at the human-verify checkpoint.

## Files Changed and Purpose

| File | Purpose |
|---|---|
| `package.json` | Bump version `0.15.0` → `0.16.0`. |
| `package-lock.json` | Lockfile root metadata + root package entry version aligned to `0.16.0` via `npm version`. |
| `scripts/verify-release-package.sh` | Update both expected-version assertions (`pkg.version !== '0.16.0'`) and the error text; preserve `set -euo pipefail`, package-name check, tarball assertions, temp-install proof, and cleanup trap. |
| `test/release-readiness.test.ts` | New focused `node:test` regression suite (7 tests) covering package metadata, lockfile root, verify-script assertions, release-note existence/content, README baseline + release-note link, CHANGELOG `0.16.0` section + audit-caveat mention, and runbook baseline. Uses `import`/`import.meta.url` to match the repo's ESM-style test convention. |
| `docs/releases/0.16.0.md` | New release note: Milestone 17 outcomes (Phase 45 audit, Phase 46 Mario-scope alignment, Phase 47 prompt metadata integration), verification commands, dependency-audit caveat, deferred items, and links back to README/CHANGELOG/runbook/previous releases. |
| `README.md` | Repoint active release baseline references from `pi-ptc-advanced@0.15.0` to `0.16.0` (lines 33, 39, 51, 549) and add `docs/releases/0.16.0.md` as the active release link with `0.15.0` preserved as "Previous baseline". |
| `CHANGELOG.md` | Promote `Unreleased` prompt-guidance entries into a new `## 0.16.0 — 2026-05-12` section with Added / Changed / Deferred groups; explicit non-clean-audit statement with current `4 critical / 0 high / 3 moderate / 0 low` baseline and DEAN expiry date. |
| `docs/personal-fork-maintenance.md` | Repoint runbook baseline from `0.15.0` to `0.16.0` (lines 9, 11, 66) and add the new release-note link; explicit "no hard @earendil-works/* migration / no clean audit" callout linked to the release note. |
| `.paul/dean-baseline.json` | DEAN baseline carried forward / refreshed during Phase 48 PLAN with current 4 critical / 0 high / 3 moderate / 0 low counts, valid through 2026-06-11. |
| `.paul/phases/48-compatibility-proof-and-release-readiness/48-01-PLAN.md` | Phase 48 plan (committed during APPLY). |
| `.paul/STATE.md`, `.paul/ROADMAP.md` | Lifecycle updates: Phase 48 APPLY complete; routing toward UNIFY/transition. |

No `src/**` runtime files were modified. No dependency versions or scopes were changed beyond the root package version metadata. No CI workflow behavior was changed.

## Acceptance Criteria Results

- **AC-1 — Release metadata and verification target `0.16.0`:** ✅ PASS. `package.json`, lockfile root, and `scripts/verify-release-package.sh` consistently target `pi-ptc-advanced@0.16.0`.
- **AC-2 — Release-readiness drift covered by focused tests:** ✅ PASS. `test/release-readiness.test.ts` failed first on the stale `0.15.0` baseline and missing `0.16.0` release note (7 fails), then turned all 7 green after Tasks 2–3.
- **AC-3 — Docs accurately describe compatibility proof and risk:** ✅ PASS. README, CHANGELOG, runbook, and the new release note describe Phase 45/46/47 outcomes, the latest Mario-scope compatibility target (`@mariozechner/*@0.73.1`), the manual publish boundary, and the acknowledged dependency-audit baseline. No claim of a clean audit or a hard `@earendil-works/*` migration.
- **AC-4 — Release-readiness verification green and human-gated:** ✅ PASS. `npm test`, `npm run build`, `npm run verify:release-package`, and `npm run verify:ci` all passed locally; user approved `0.16.0` as release-ready with the acknowledged DEAN audit baseline.

## Task / Verification Results

| Task | Status | Verification |
|---|---|---|
| 1 RED — Add release-readiness drift coverage | PASS | `npm run build` ✓; `node --test test/release-readiness.test.ts` initially **7 failing** (stale 0.15.0 + missing 0.16.0 release note). |
| 2 GREEN — Align package metadata + verify script to 0.16.0 | PASS | `npm run build` ✓; `node --test test/release-readiness.test.ts` 3 metadata/script tests pass; `npm run verify:release-package` ✓ (metadata + `npm pack --dry-run` tarball surface + clean temp install). |
| 3 — Document the 0.16.0 candidate + run full verification | PASS | `npm test` **220 pass / 0 fail**; `npm run build` ✓; `npm run verify:release-package` ✓; `npm run verify:ci` ✓. |
| 4 — Checkpoint: human-verify (blocking) | PASS / APPROVED | User reviewed release-note, CHANGELOG, README, runbook, audit baseline, and local verification evidence; replied `approved`. |

Additional post-task fix (no scope change): Test file converted from `module.require(...)` / `const fs = require(...)` to ESM-style `import { existsSync, readFileSync } from "node:fs"` + `fileURLToPath(new URL(..., import.meta.url))` to match the repo's prevailing test convention and clear hint diagnostics. Re-ran the focused test (7/7 PASS) and `npm test` after the change. No LSP diagnostics remain.

## Deviations

- **None material.** README and runbook each picked up one extra line for a "Previous baseline" link to `docs/releases/0.15.0.md`. This is consistent with the plan's intent — the test deliberately allows the historical `0.15.0` reference to remain while forbidding `pi-ptc-advanced@0.15.0` as the *active* baseline.
- The intentional ESM `import` refactor on the new test file was applied after Task 3 completion but before UNIFY; it is reflected in the same Task 1/Task 3 file scope and is covered by both the focused suite and `npm test`.

## Checkpoint Decisions

- **Phase 48 human-verify (Task 4):** APPROVED. User explicitly accepted `0.16.0` as release-ready with the acknowledged DEAN audit baseline (`4 critical / 0 high / 3 moderate / 0 low`, valid through 2026-06-11). Remediation is deferred and treated as a separate manual decision before any publish action.

## Dependency-Audit Baseline (final, as of UNIFY)

- `npm audit --json` (Phase 48 APPLY):
  - critical: 4
  - high: 0
  - moderate: 3
  - low: 0
  - info: 0
- Matches `.paul/dean-baseline.json` (override valid through 2026-06-11).
- Documented in `docs/releases/0.16.0.md` (Dependency-audit caveat) and `CHANGELOG.md` (Deferred / not included section).

## Verification Commands and Outcomes

| Command | Result |
|---|---|
| `npm run build` | ✓ Build successful (0 units compiled) |
| `node --test test/release-readiness.test.ts` (RED) | 7 failing (expected) |
| `node --test test/release-readiness.test.ts` (final) | **7 / 7 PASS** |
| `npm test` | **220 pass / 0 fail / 0 cancelled / 0 skipped** |
| `npm run verify:release-package` | ✓ package metadata, tarball surface, and installability look correct |
| `npm run verify:ci` | ✓ all CI verification steps passed |
| `npm audit --json` | 4 critical / 0 high / 3 moderate / 0 low (acknowledged) |

## GitHub Flow Evidence (APPLY)

- Branch: `feature/48-compatibility-proof-release-readiness` (cut from synced `main` at preflight).
- APPLY commit: `906379c` — `feat(48): release 0.16.0 compatibility-proof candidate` (12 files changed, 566 insertions, 55 deletions).
- Pushed to `origin`; PR **#4** opened against `main`, MERGEABLE; CI checks running at APPLY time. Merge readiness is owned by the UNIFY merge gate.

## Module Execution Reports

### Post-apply advisory (recorded during APPLY)
- **WALT** PASS — full verification chain green (npm test 220/0, build, verify:release-package, verify:ci).
- **TODD** PASS — TDD ordering held: 1 RED → 2/3 GREEN; suite count 213 → 220 (+7 release-readiness tests).
- **DOCS** PASS — no drift between source/docs after Phase 48 changes; new release note linked from README and runbook.
- **IRIS** PASS — no new TODO/FIXME/HACK/XXX introduced in planned files.
- **SETH** PASS — release metadata/docs/shell verification only; no auth/secret/injection surface; `set -euo pipefail` and cleanup trap preserved.
- **ARCH** PASS — edits inside planned files only; no `src/**` runtime changes.
- **DAVE** PASS — CI workflow unchanged; `verify:ci` chain still green locally.
- **RUBY** PASS — README +1 line, runbook +1 line; package-lock.json change is the npm-tooling-produced root version bump only.
- **OMAR / PETE / REED / GABE / LUKE / ARIA / DANA / VERA** SKIPPED — no in-scope files.
- **CODI** SKIPPED — no extractable runtime symbols in scope.

### Post-apply enforcement (recorded during APPLY)
- **DEAN** OVERRIDE ACKNOWLEDGED — `npm audit --json` 4 critical / 0 high / 3 moderate / 0 low matches `.paul/dean-baseline.json`; user approved override at `/paul:plan` and reconfirmed at the Phase 48 human-verify checkpoint.
- **WALT** PASS — no blocking enforcement findings.

### Post-unify (recorded during UNIFY)
- **WALT** PASS — re-confirmed: SUMMARY captures all evidence; no failing verification.
- **DOCS** PASS — STATE/ROADMAP/SUMMARY narratives stay consistent with the release note and changelog section.
- **SKIP** PERSIST — durable patterns: release-readiness drift test (single source of truth for release-version surface), `dean-baseline.json` override protocol with expiry, and post-merge `docs/releases/{version}.md` convention with "Previous baseline" historical link.
- **DEAN** ACKNOWLEDGED carry-forward — audit-advisory remediation deferred; tracked in CHANGELOG `0.16.0` Deferred section and `.paul/dean-baseline.json`.
- **IRIS** PASS — no debt regressions detected post-apply.
- **CODI** SKIPPED — no runtime symbol surface in scope.

## Lessons / Knowledge Persistence

- A focused release-readiness regression test is the cheapest durable guard against version/doc/script drift; the 7-test pattern (`package.json`, `package-lock.json`, verify script, release note, README, CHANGELOG, runbook) is reusable for future version bumps — only the version constants need updating.
- Keeping detailed release narrative in `docs/releases/{version}.md` and bounded summary in README/CHANGELOG avoids README bloat. Historical baselines link forward/backward via "Previous baseline" lines.
- The DEAN override workflow with explicit user acknowledgement at both PLAN and APPLY checkpoints, plus a documented expiry in `.paul/dean-baseline.json` and the release note, is a clean way to ship a release-candidate that intentionally does not claim a clean audit.
- Use ESM `import` + `fileURLToPath(new URL(...))` for new tests to match the repo's prevailing convention and stay free of `require`-hint diagnostics.

## Milestone 17 Status

This plan completes Phase 48, which is the last phase of Milestone 17 (Pi Compatibility and Prompt Integration Audit, `0.16.0`). After UNIFY, the transition workflow closes the milestone:

- Phase 45 — Pi API and Documentation Delta Audit — ✓ Complete
- Phase 46 — Extension Runtime Compatibility Alignment — ✓ Complete
- Phase 47 — System Prompt and Tool Guidance Optimization — ✓ Complete
- Phase 48 — Compatibility Proof and Release Readiness — ✓ Complete (this plan)

Milestone 17 ships a release-candidate `pi-ptc-advanced@0.16.0` with: a durable Pi compatibility audit artifact, latest Mario-scope Pi runtime alignment (no hard `@earendil-works/*` migration), `code_execution` Pi prompt metadata integration with idempotent auto-route, custom-tool prompt metadata preservation, release-readiness regression coverage, and a documented acknowledged dependency-audit baseline.

## Next Phase

Milestone 17 is complete. Routing decision (after transition):
- Begin the next milestone (e.g., `0.17.0` dependency-advisory remediation, automated publish, or another scope), or
- Treat `0.16.0` as a manual release gate and pause planning.
