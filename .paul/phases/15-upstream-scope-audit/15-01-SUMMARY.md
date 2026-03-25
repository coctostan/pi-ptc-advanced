---
phase: 15-upstream-scope-audit
plan: 01
subsystem: docs
tags: [upstreaming, scope-audit, pr-structure, reviewability, policy]
requires: []
provides:
  - upstream keep/exclude classification for current branch work
  - recommended 2-PR upstream packaging strategy
  - execution checklists for phases 16, 17, and 18
affects:
  - 16-branch-cleanup-and-isolation
  - 17-acceptance-hardening
  - 18-pr-materials-and-submission-prep
tech-stack:
  added: []
  patterns:
    - "Use a scope-audit artifact to separate upstream-worthy changes from local-only workflow artifacts before PR preparation"
key-files:
  created:
    - .paul/phases/15-upstream-scope-audit/15-01-UPSTREAM-SCOPE.md
  modified: []
key-decisions:
  - "Decision: prefer a 2-PR upstream split with runtime interop first and metadata/helper/docs second"
patterns-established:
  - "Exclude personal launcher scripts, PALS artifacts, and repo-specific compatibility shims from upstream PTC submissions"
duration: 20min
started: 2026-03-24T14:11:00Z
completed: 2026-03-24T14:31:26Z
---

# Phase 15 Plan 01: Upstream Scope Audit Summary

**Created a concrete upstream scope lock for `pi-ptc-next`, including keep/exclude classification, a preferred 2-PR submission structure, and direct execution checklists for Phases 16-18.**

## Performance

| Metric | Value |
|--------|-------|
| Duration | 20min |
| Started | 2026-03-24T14:11:00Z |
| Completed | 2026-03-24T14:31:26Z |
| Tasks | 3 completed |
| Files modified | 1 |

## Acceptance Criteria Results

| Criterion | Status | Notes |
|-----------|--------|-------|
| AC-1: Current work is inventoried and classified | Pass | `15-01-UPSTREAM-SCOPE.md` inventories current branch outputs and classifies each area as upstream-worthy, local-only, or follow-up. |
| AC-2: The upstream packaging strategy is explicit | Pass | The audit recommends a preferred 2-PR split, explains why not to send a single large PR first, and lists explicit upstream exclusions. |
| AC-3: Later phases can execute without redoing scope analysis | Pass | The audit includes concrete checklists for Phase 16 cleanup, Phase 17 hardening, and Phase 18 PR-material prep. |

## Accomplishments

- Produced a durable scope audit artifact at `.paul/phases/15-upstream-scope-audit/15-01-UPSTREAM-SCOPE.md`.
- Identified the upstream-worthy core as runtime interop, Python/runtime contracts, focused tests, and maintainer-facing README updates.
- Locked the preferred upstream submission strategy to a 2-PR split with explicit local-only exclusions.

## Task Commits

No git commit was created during APPLY. This plan was documentation-only and execution remained within `.paul/` planning artifacts.

## Files Created/Modified

| File | Change | Purpose |
|------|--------|---------|
| `.paul/phases/15-upstream-scope-audit/15-01-UPSTREAM-SCOPE.md` | Created | Records the upstream keep/exclude matrix, PR structure recommendation, and later-phase execution checklists. |

## Decisions Made

| Decision | Rationale | Impact |
|----------|-----------|--------|
| Prefer a 2-PR upstream split instead of one large PR | Runtime interop and metadata/helper/docs are related but review better as separate slices | Phases 16-18 should prepare two reviewable upstream packages rather than one omnibus submission |
| Keep personal launcher scripts, PALS artifacts, and repo-specific shims out of upstream scope | These items dilute reviewer focus and are not generic product improvements | Cleanup must explicitly remove or isolate them before PR preparation continues |

## Deviations from Plan

### Summary

| Type | Count | Impact |
|------|-------|--------|
| Auto-fixed | 0 | None |
| Scope additions | 0 | None |
| Deferred | 0 | None |

**Total impact:** None — plan executed exactly as written.

### Auto-fixed Issues

None.

### Deferred Items

None - plan executed exactly as written.

## Issues Encountered

None.

## Next Phase Readiness

**Ready:**
- Phase 16 can remove or isolate local-only files using the explicit cleanup checklist.
- Phase 17 can harden only the upstream-worthy surface instead of rediscovering scope.
- Phase 18 can draft PR materials directly from the locked narrative in the audit.

**Concerns:**
- The current branch still contains local-only files and process artifacts that must not leak into the upstream submission path.
- Combined-stack docs are useful, but they likely need to be distilled rather than submitted wholesale in the first upstream pass.

**Blockers:**
- None

---
*Phase: 15-upstream-scope-audit, Plan: 01*
*Completed: 2026-03-24*
