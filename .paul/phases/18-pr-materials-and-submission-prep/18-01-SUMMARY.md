---
phase: 18-pr-materials-and-submission-prep
plan: 01
completed: 2026-03-24T16:17:50Z
duration: ~10min
---

# Phase 18 Plan 01: PR Materials and Submission Prep Summary

**Packaged Milestone 7 into reviewer-ready local submission artifacts by drafting the runtime-interop PR narrative, the stacked metadata/helper/docs PR narrative, and a deterministic manual submission checklist that preserves the approved review-branch construction and exclusion rules.**

## Objective Reconciliation

| Planned | Actual | Status |
|---------|--------|--------|
| Draft reviewer-ready PR 1 materials for the runtime-interop slice | Created `.paul/phases/18-pr-materials-and-submission-prep/18-01-PR1-MATERIALS.md` with title, summary, scope, rationale, verification, non-goals, exclusions, and follow-ups aligned to the Phase 16 manifest | Pass |
| Draft reviewer-ready PR 2 materials for the stacked metadata/helper/docs slice | Created `.paul/phases/18-pr-materials-and-submission-prep/18-01-PR2-MATERIALS.md` with dependency-on-PR1 framing, scope, verification, non-goals, follow-ups, exclusions, and `test/utils.test.ts` caution notes | Pass |
| Produce a manual submission runbook for clean upstream opening | Created `.paul/phases/18-pr-materials-and-submission-prep/18-01-SUBMISSION-CHECKLIST.md` with preflight checks, exact restore-based branch commands, verification commands, manual PR-opening reminders, and explicit exclusions | Pass |

## Acceptance Criteria Results

| Criterion | Status | Notes |
|-----------|--------|-------|
| AC-1: PR 1 materials match the approved runtime-interop slice | Pass | The PR 1 draft reflects the approved file group, reviewer narrative, focused runtime proof, explicit exclusions, and follow-up boundaries from the branch-isolation manifest. |
| AC-2: PR 2 materials match the stacked metadata/helper/docs slice | Pass | The PR 2 draft carries the approved stacked file group, explicit dependency on PR 1, hardened maintainer-facing proof points, deferred work, and the caution about `test/utils.test.ts`. |
| AC-3: Submission notes are executable for manual upstream opening | Pass | The checklist gives exact review-branch commands, verification replays, manual push/open reminders, and a durable exclusion list without relying on mixed branch history. |

## Verification Results

| Check | Result |
|------|--------|
| `test -f .paul/phases/18-pr-materials-and-submission-prep/18-01-PR1-MATERIALS.md && grep -q "## Scope" ... && grep -q "## Verification" ... && grep -q "## Non-goals" ...` | Pass |
| `test -f .paul/phases/18-pr-materials-and-submission-prep/18-01-PR2-MATERIALS.md && grep -q "## Scope" ... && grep -q "## Verification" ... && grep -q "## Follow-ups" ...` | Pass |
| `test -f .paul/phases/18-pr-materials-and-submission-prep/18-01-SUBMISSION-CHECKLIST.md && grep -q "review/pr1-runtime-interop" ... && grep -q "review/pr2-metadata-helper-docs" ... && grep -q "## Explicit exclusions" ...` | Pass |
| `git status --short -- .paul/phases/18-pr-materials-and-submission-prep/18-01-PR1-MATERIALS.md .paul/phases/18-pr-materials-and-submission-prep/18-01-PR2-MATERIALS.md .paul/phases/18-pr-materials-and-submission-prep/18-01-SUBMISSION-CHECKLIST.md` | Pass — all three Phase 18 artifacts are present as new local files |

## What Was Built

| File | Change | Purpose |
|------|--------|---------|
| `.paul/phases/18-pr-materials-and-submission-prep/18-01-PR1-MATERIALS.md` | Created | Reviewer-ready draft for the runtime-interop PR slice with scope, narrative, proof, exclusions, and follow-up notes. |
| `.paul/phases/18-pr-materials-and-submission-prep/18-01-PR2-MATERIALS.md` | Created | Reviewer-ready draft for the stacked metadata/helper/docs PR slice with dependency framing, proof, exclusions, follow-ups, and caution notes. |
| `.paul/phases/18-pr-materials-and-submission-prep/18-01-SUBMISSION-CHECKLIST.md` | Created | Manual runbook for review-branch construction, verification, exclusions, and upstream PR opening. |

## Offline / Out-of-Scope Changes Observed

| File | Status | Notes |
|------|--------|-------|
| `.paul/HANDOFF-2026-03-19.md` | Pre-existing modified tracked file | Not created by Phase 18 execution. |
| `.paul/PROJECT.md`, `.paul/ROADMAP.md`, `.paul/STATE.md` | Phase bookkeeping | Updated as part of the normal PALS planning/apply/unify lifecycle, not as upstream product changes. |
| `README.md`, `src/tools/tool-wrapper.ts`, `test/hashline-edit-contract.test.ts`, `test/python-tool-contract.test.ts` | Pre-existing tracked upstream-scope work | Carry-over product changes from earlier phases; Phase 18 did not modify them. |
| `test/utils.test.ts` | Pre-existing modified tracked file | Remains a carry-over concern that the PR 2 review branch should inspect and trim to the intended metadata/policy hunks only. |
| `.paul/phases/15-upstream-scope-audit/*`, `.paul/phases/16-branch-cleanup-and-isolation/*`, `.paul/phases/17-acceptance-hardening/*` | Untracked local history artifacts | Present as local planning history, not produced by new Phase 18 product work. |

## Deviations from Plan

### Summary

| Type | Count | Impact |
|------|-------|--------|
| Execution adaptation | 1 | Low |
| Scope additions | 0 | None |
| Deferred | 0 | None |

### Execution Adaptation

| Plan | Actual | Why | Impact |
|------|--------|-----|--------|
| Use the standard ground-truth checks to confirm the created artifact files were modified | Verification combined the planned file/section existence checks with `git status` instead of relying on `git diff` alone | New untracked `.paul` files do not appear in `git diff` until staged, so `git status` was the reliable creation proof during APPLY | No product impact; UNIFY documents the adaptation so later review does not mistake it for scope drift |

## Key Patterns / Decisions

- The upstream submission story is now explicitly packaged as a restore-based 2-PR flow: runtime seam first, metadata/helper/docs second.
- Manual PR opening remains the correct posture for this repo; the checklist reinforces user-directed branch creation, verification, push, and PR submission rather than adding automation.
- Reviewer-facing materials should preserve the explicit exclusion boundary around `.paul/**`, local-only docs/scripts/config, optional heavy harness files, and adjacent-repo work.
- `test/utils.test.ts` remains the only notable caution in the planned PR 2 slice and should be inspected carefully when constructing the review branch.

## Issues Encountered

None blocking. The only reconciliation note was the expected verification adaptation for new untracked local artifacts.

## Git / Automation Notes

No git commit was created during APPLY/UNIFY. This project continues to treat git commit/branch/remote automation as user-directed because the remote is upstream-owned and no in-repo `pals.json` git workflow is active.

## Next Phase Readiness

**Ready:**
- Milestone 7 now has local reviewer-ready PR 1 and PR 2 narratives plus a deterministic submission checklist.
- The approved branch-isolation strategy has been turned into exact manual steps for creating the review branches from `origin/main`.
- The upstream reviewer story now spans scope audit, branch isolation, acceptance hardening, and final submission materials.

**Concerns:**
- `test/utils.test.ts` still requires review-branch-level hunk inspection before opening PR 2.
- Local-only `.paul/**` history remains present on the working branch and must continue to be excluded by restore-based review branch construction.

**Blockers:**
- None

---
*Phase: 18-pr-materials-and-submission-prep, Plan: 01*
*Completed: 2026-03-24*
