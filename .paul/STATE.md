# Project State

## Project Reference
See: `.paul/PROJECT.md`

**Core value:** `pi-ptc-next` should execute the same active Pi tool implementations that the user sees in chat.
**Current focus:** Milestone 9 is defined. Ready to plan Phase 22 release work.
## Current Position
Milestone: Milestone 9 — Release Readiness and Packaging
Phase: 22 of 24 (Release Version and Packaging)
Plan: Not started
Status: Ready to plan
Last activity: 2026-03-24 23:15:53 EDT — Created Milestone 9
Progress:
- Milestone 9 — Release Readiness and Packaging: [░░░░░░░░░░] 0%
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
  ○        ○        ○     [Ready for first PLAN]
```

## Accumulated Context
### Decisions
- Personal fork ownership is now the primary path; upstream PR preparation is retained only as optional reference material
- Phase 19 restored a repo-local personal analysis launcher profile at `scripts/start-pi-ptc-full-tools.sh`
- `PTC_CALLABLE_TOOLS` is now treated explicitly as a filter over Pi-visible tools, not as a loader for missing tools
- Allowlisted-but-unavailable tools now produce explicit registry warnings instead of silent callable-surface mismatches
- Default conservative callable-tool behavior for non-personal sessions remains unchanged
- Phase 20 keeps routine verification repo-local (`npm run verify:personal`, `npm run verify:personal:full`) while leaving git remote/branch/rebase/push actions manual and documented
- Milestone 7 upstream PR-prep material now lives behind `.paul/milestones/0.6.0-UPSTREAM-PR-ARTIFACTS.md`, and current maintainer docs treat it as archived reference only

### Deferred Issues
- Bridge teardown when pi adds getToolExecutor()

## Session Continuity
Last session: 2026-03-24 23:15:53 EDT
Stopped at: Milestone 9 created, ready to plan
Next action: /paul:plan for Phase 22
Resume file: .paul/ROADMAP.md
Resume context:
- Milestone 9 focuses on aligned package/version metadata, changelog/release notes, and CI/release verification
- Phase 22 is the entry point for defining the concrete release/version/package scope
- Milestone 8 remains complete in roadmap and milestone history as the finalized fork-hardening baseline

---
*STATE.md — Updated after every significant action*
