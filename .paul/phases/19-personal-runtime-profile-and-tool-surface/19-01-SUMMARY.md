---
phase: 19-personal-runtime-profile-and-tool-surface
plan: 01
completed: 2026-03-25T02:09:46Z
duration: ~10min
---

# Phase 19 Plan 01: Personal Runtime Profile and Tool Surface Summary

**Made the personal-use PTC profile reproducible by restoring a repo-local analysis launcher, surfacing allowlisted-but-unavailable tool gaps explicitly in the registry, and documenting/testing the rule that `PTC_CALLABLE_TOOLS` only filters Pi-visible tools instead of loading missing ones.**

## Objective Reconciliation

| Planned | Actual | Status |
|---------|--------|--------|
| Diagnose and harden callable-tool selection for the personal read-only profile | Added allowlist-gap warning/reporting in `src/tool-registry.ts` so missing or non-callable allowlisted tools are explained explicitly, while keeping the default conservative policy unchanged | Pass |
| Restore a repo-local personal launcher profile and align operator guidance | Restored `scripts/start-pi-ptc-full-tools.sh` from the archived local-only copy and updated `README.md` with personal-profile notes plus the runtime-visibility limitation | Pass |
| Add focused regression proof for the personal profile contract | Expanded `test/tool-registry.test.ts` with warning-path coverage and revalidated the focused/default-exposure/env surface with green tests plus a green full suite | Pass |

## Acceptance Criteria Results

| Criterion | Status | Notes |
|-----------|--------|-------|
| AC-1: Analysis-oriented callable surface is deterministic | Pass | The preferred personal profile now behaves deterministically: allowlisted tools remain gated by Pi runtime visibility and metadata, mutating tools stay excluded when mutations are disabled, and missing tools produce an explicit warning instead of a silent mismatch. |
| AC-2: Personal launcher profile is reproducible from the repo | Pass | `scripts/start-pi-ptc-full-tools.sh` now lives in the repo again with the intended allowlist, trusted read-only list, exclusions, and operator notes. |
| AC-3: Default product posture remains conservative | Pass | Focused policy/default-exposure verification stayed green and no broad default exposure change was introduced for extension tools. |

## Verification Results

| Check | Result |
|------|--------|
| `npm run build && node --test test/tool-registry.test.ts test/hashline-default-exposure.test.ts test/utils.test.ts` | Pass |
| `test -f scripts/start-pi-ptc-full-tools.sh && grep -q 'PTC_CALLABLE_TOOLS=' scripts/start-pi-ptc-full-tools.sh && grep -q 'PTC_TRUSTED_READ_ONLY_TOOLS=' scripts/start-pi-ptc-full-tools.sh && grep -q 'analysis-oriented' README.md` | Pass |
| `npm test` | Pass — 105 passing / 0 failing |

## What Was Built

| File | Change | Purpose |
|------|--------|---------|
| `src/tool-registry.ts` | Modified | Added explicit allowlist-gap diagnostics so `PTC_CALLABLE_TOOLS` failures are explained in terms of policy, missing metadata, or missing Pi runtime visibility. |
| `scripts/start-pi-ptc-full-tools.sh` | Created | Restored the repo-local personal analysis launcher profile with the intended read-only surface and clear operator notes. |
| `README.md` | Modified | Documented the personal analysis profile and clarified that `PTC_CALLABLE_TOOLS` filters only tools Pi already exposes to PTC. |
| `test/tool-registry.test.ts` | Modified | Added focused regression coverage for allowlisted-but-unavailable tools and tools missing `ptc.callable` metadata. |
| `.paul/quality-history.md` | Created | Recorded the post-unify quality snapshot for this phase. |

## Offline / Out-of-Scope Changes Observed

| File | Status | Notes |
|------|--------|-------|
| `src/index.ts`, `src/utils.ts`, `src/contracts/tool-types.ts`, `test/hashline-default-exposure.test.ts` | Planned but unchanged | The issue was resolved without touching these files. Existing behavior/tests remained sufficient. |
| `test/utils.test.ts` | Pre-existing modified tracked file | Present in the working tree during the phase, but not intentionally changed by this phase’s implementation work. |
| `.paul/**` artifacts | Phase bookkeeping / local history | Normal PALS state and summary updates, not product-surface changes. |

## Module Execution Reports

- **WALT post-unify:** recorded the phase quality snapshot in `.paul/quality-history.md` with `npm test` green and `npm run build` clean.
- No additional pre-unify hooks or durable post-unify reports materially affected reconciliation for this phase.

## Deviations from Plan

### Summary

| Type | Count | Impact |
|------|-------|--------|
| Execution adaptation | 2 | Low |
| Scope additions | 0 | None |
| Deferred | 0 | None |

### Execution Adaptations

| Plan | Actual | Why | Impact |
|------|--------|-----|--------|
| Investigate a likely runtime/registration bug across `src/tool-registry.ts`, `src/index.ts`, `src/utils.ts`, and `src/contracts/tool-types.ts` | The actionable fix landed only in `src/tool-registry.ts` plus docs/tests | The root issue was not broad runtime breakage; it was that the policy surface needed to explain allowlist gaps deterministically instead of implying missing Pi-visible tools should have been callable | Low; behavior is clearer without widening scope |
| Add or tighten focused proof across several existing test files | New proof landed in `test/tool-registry.test.ts` while existing `test/hashline-default-exposure.test.ts` / `test/utils.test.ts` coverage was reused without source edits | Existing focused tests already substantiated the default-exposure and env parsing behavior; only the new warning path needed new assertions | Low; avoided unnecessary churn |

## Key Patterns / Decisions

- For personal use, `PTC_CALLABLE_TOOLS` should be treated as a **filter over tools Pi already exposes to PTC**, not as a mechanism that loads unavailable tools.
- The personal analysis profile remains intentionally read-only: `sg` and selected graph tools are preferred when available, while `edit`, `write`, `bash`, `resolve_edge`, and `delete_edge` stay excluded.
- The right fix for the observed mismatch was explicit diagnostics plus repo-local operator guidance, not a broader loosening of default callable-tool policy.

## Issues Encountered

- The original analysis-oriented launcher expectation assumed that a correct allowlist alone would make `sg` and selected graph tools callable inside `code_execution`; phase execution confirmed that Pi runtime visibility and metadata are the real gating factors.
- A pre-existing tracked `test/utils.test.ts` working-tree change remained visible during reconciliation but was outside this phase’s intended implementation work.

## Git / Automation Notes

- No git commit was created during APPLY/UNIFY. This fork still treats git automation as user-directed.
- Verification relied on focused test runs plus the full suite; no remote or PR automation was involved.

## Next Phase Readiness

**Ready:**
- Phase 20 can now build local maintenance workflow/documentation on top of a reproducible personal launcher profile.
- The personal tool-surface policy story is now explicit enough to support future maintenance without revisiting the same ambiguity.
- Quality history for this phase now exists in `.paul/quality-history.md`.

**Concerns:**
- The personal profile still depends on what Pi actually exposes to PTC at runtime; if Pi’s active-tool surface changes, the warning path may fire again legitimately.
- The repo still carries unrelated working-tree/history artifacts that Phase 21 may choose to demote or remove for personal clarity.

**Blockers:**
- None

---
*Phase: 19-personal-runtime-profile-and-tool-surface, Plan: 01*
*Completed: 2026-03-24*
