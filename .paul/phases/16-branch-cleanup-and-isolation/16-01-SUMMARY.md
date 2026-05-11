---
phase: 16-branch-cleanup-and-isolation
plan: 01
completed: 2026-03-24T00:00:00Z
duration: ~35min
---

# Phase 16 Plan 01: Branch Cleanup and Isolation Summary

**Converted the upstream scope audit into an executable branch-isolation manifest, removed local-only review baggage from the active working tree, and made the first-pass upstream reviewer surface self-contained through `README.md`.**

## Objective Reconciliation

| Planned | Actual | Status |
|---------|--------|--------|
| Create a durable branch-isolation artifact with PR1/PR2/local-only/follow-up classification | Created `.paul/phases/16-branch-cleanup-and-isolation/16-01-BRANCH-ISOLATION.md` with file-group classification, verification commands, and Phase 18 branch-prep handoff | Pass |
| Clean reviewer-facing docs so upstream review no longer depends on local-only companion docs | Rewrote `README.md` combined-stack section to stand alone without `docs/hashline-integration/*` references | Pass |
| Remove loose local-only baggage from active PR path | Relocated untracked local-only docs, `pals.json`, and the personal launcher script into `.paul/handoffs/archive/phase-16-local-only/` so they no longer appear in active `git status` | Pass with minor adaptation |

## Acceptance Criteria Results

| Criterion | Status | Notes |
|-----------|--------|-------|
| AC-1: Branch contents are explicitly classified for upstream isolation | Pass | The branch-isolation manifest classifies the current branch into PR 1 runtime interop, PR 2 metadata/helper/docs, follow-up harness items, and local-only exclusions. |
| AC-2: The maintainer-facing docs stand on their own for first-pass upstream review | Pass | `README.md` now states the combined-stack maintainer story directly and no longer points at local-only `docs/hashline-integration/*` pages. |
| AC-3: The repo has a reproducible path to PR-ready branch isolation | Pass | The manifest records exact verification commands, explicit exclusions, Phase 18 review-branch construction commands, and a clean leakage check for `pi-codegraph`. |

## Verification Results

| Check | Result |
|------|--------|
| `test -f .paul/phases/16-branch-cleanup-and-isolation/16-01-BRANCH-ISOLATION.md && grep -q "## PR 1 Candidate Surface" ... && grep -q "## Local-only Exclusions" ...` | Pass |
| `test -z "$(git status --short --untracked-files=all | grep -E '^(\?\?|[ MARCUD]{2}) (docs/hashline-integration/|pals\.json|scripts/start-pi-ptc-full-tools\.sh)')" && ! grep -q 'docs/hashline-integration/' README.md` | Pass |
| `grep -q "## Verification Commands" ... && grep -q "## Phase 18 Branch-Prep Handoff" ... && ! grep -R "pi-codegraph" src README.md test/hashline-interop-smoke.test.ts test/hashline-default-exposure.test.ts test/utils.test.ts` | Pass |
| Final replay of all Phase 16 completion checks | Pass |

## What Was Built

| File | Change | Purpose |
|------|--------|---------|
| `.paul/phases/16-branch-cleanup-and-isolation/16-01-BRANCH-ISOLATION.md` | Created | Durable execution map for PR1/PR2/local-only/follow-up classification, verification commands, and Phase 18 branch construction. |
| `README.md` | Modified | Replaced local-doc references with a self-contained maintainer-facing combined-stack summary and focused verification point. |
| `.paul/handoffs/archive/phase-16-local-only/` | Populated | Ignored storage for local-only loose docs/config/script that should not remain as active PR baggage. |

## Offline / Out-of-Scope Changes Observed

| File | Status | Notes |
|------|--------|-------|
| `test/utils.test.ts` | Pre-existing modified working-tree file | Not touched by Phase 16 execution; remains unrelated carry-over state. |
| `.paul/HANDOFF-2026-03-19.md` | Archived/deleted from active root during resume lifecycle | Expected PALS handoff lifecycle effect, not Phase 16 product work. |
| `.paul/phases/15-upstream-scope-audit/*` | Untracked planning artifacts | Prior-phase local artifacts, not produced by this plan. |

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
| Remove or relocate the local-only loose docs/config/script from the active submission path | Relocated them into `.paul/handoffs/archive/phase-16-local-only/` rather than deleting them outright | Preserves local reference material while still clearing active review baggage from `git status` | No upstream product impact; Phase 18 still has a clean branch-prep baseline |

### Reconciliation Note

The plan's `files_modified` list included several untracked local-only files (`docs/hashline-integration/*`, `pals.json`, `scripts/start-pi-ptc-full-tools.sh`) because Phase 16 needed to clean them out of the active working tree. The durable repo changes from this plan are primarily `README.md` plus the new `.paul` manifest/state artifacts; the excluded loose files were intentionally moved into ignored local storage rather than retained as tracked repo edits.

## Key Patterns / Decisions

- The mixed `feat/hashline-native-interop` branch should be split for upstream review by constructing fresh review branches from `origin/main` with explicit file restores, not by relying on whole-commit cherry-picks.
- Combined-stack explainer docs remain useful local source material, but the first upstream reviewer surface should live in `README.md` plus focused tests.
- Heavy local harness files remain follow-up / optional evidence rather than first-pass upstream PR material.

## Issues Encountered

None blocking. Verification passed on the first execution path after the planned doc cleanup and relocation steps.

## Git / Automation Notes

No git commit was created during APPLY/UNIFY. This project continues to treat git commit/branch/remote automation as user-directed because the remote is upstream-owned.

## Next Phase Readiness

**Ready:**
- Phase 17 can now harden only the retained upstream surface.
- Phase 18 already has explicit PR1/PR2 file groups and branch construction commands.
- The active working tree no longer advertises local-only hashline side docs, `pals.json`, or the personal launcher script as loose PR baggage.

**Concerns:**
- `test/utils.test.ts` remains a pre-existing unrelated modified file and should stay out of Phase 17 scope unless intentionally addressed later.
- `.paul/**` history still exists on the branch and must continue to be excluded by review-branch construction rather than mistaken for upstream material.

**Blockers:**
- None

---
*Phase: 16-branch-cleanup-and-isolation, Plan: 01*
*Completed: 2026-03-24*
