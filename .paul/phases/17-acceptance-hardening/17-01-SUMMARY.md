---
phase: 17-acceptance-hardening
plan: 01
completed: 2026-03-24T00:00:00Z
duration: ~25min
---

# Phase 17 Plan 01: Acceptance Hardening Summary

**Hardened the retained upstream reviewer surface by aligning the live structured `edit` contract with generated Python typings and README examples, clarifying the conservative callable-policy defaults and temporary executor-bridge rationale, and revalidating the in-scope verification surface with green focused tests plus a green full suite.**

## Objective Reconciliation

| Planned | Actual | Status |
|---------|--------|--------|
| Align the structured `edit` payload across live behavior, wrapper typings, and README examples | Added `SemanticSummary` and `semanticSummary` to the generated Python wrapper surface, updated the README `edit` JSON example to match the live payload, and tightened the focused contract assertions in `test/hashline-edit-contract.test.ts` | Pass |
| Tighten reviewer-facing docs around conservative defaults and the temporary executor bridge | README now explicitly states `ptc.callable` / `ptc.policy` opt-in behavior and documents the narrow `globalThis` + EventBus bridge with the `getToolExecutor()` teardown trigger | Pass |
| Re-run the retained upstream verification surface and close only in-scope gaps | Focused tests passed, a user-reported test-file diagnostic issue in `test/python-tool-contract.test.ts` was fixed in-scope, and `npm test` finished green | Pass with minor adaptation |

## Acceptance Criteria Results

| Criterion | Status | Notes |
|-----------|--------|-------|
| AC-1: Structured edit docs and typings match the live payload | Pass | The live `edit` contract, generated TypedDicts, and README example now all include the stable `semanticSummary` block. |
| AC-2: Reviewer-facing docs state the callable-policy defaults and bridge rationale clearly | Pass | README now states the explicit callable opt-in model, safety policy semantics, and the temporary bridge/teardown story in maintainer-facing language. |
| AC-3: The in-scope verification surface backs the PR claims and passes cleanly | Pass | Focused verification passed and the full test suite is green after the in-scope contract/doc fixes. |

## Verification Results

| Check | Result |
|------|--------|
| `node --test test/hashline-edit-contract.test.ts` | Pass |
| `node --test test/tool-registry.test.ts test/hashline-interop-smoke.test.ts test/python-tool-contract.test.ts` | Pass |
| `node --test test/python-tool-contract.test.ts` (post-fix replay for the user-reported diagnostics issue) | Pass |
| `npm test` | Pass |
| `git diff --name-only -- README.md src/tools/tool-wrapper.ts test/hashline-edit-contract.test.ts test/tool-registry.test.ts test/hashline-interop-smoke.test.ts test/python-tool-contract.test.ts` | Pass — actual non-`.paul/` changes remained within the planned Phase 17 file set |

## What Was Built

| File | Change | Purpose |
|------|--------|---------|
| `README.md` | Modified | Brought the `edit` structured payload example up to the live shape and made the conservative callable-policy + temporary bridge rationale explicit for reviewers. |
| `src/tools/tool-wrapper.ts` | Modified | Added `SemanticSummary` and exposed `semanticSummary` on `AnchoredEditResult` in generated Python wrapper typing. |
| `test/hashline-edit-contract.test.ts` | Modified | Tightened focused contract coverage so the live payload and generated wrappers both assert `semanticSummary`. |
| `test/python-tool-contract.test.ts` | Modified | Added wrapper-surface assertions for edit semantic metadata and fixed the file-local variable naming conflict reported during APPLY verification. |

## Offline / Out-of-Scope Changes Observed

| File | Status | Notes |
|------|--------|-------|
| `test/tool-registry.test.ts` | Planned but unchanged | Existing focused assertions already substantiated the README callable-policy and bridge claims; no source edits were necessary. |
| `test/hashline-interop-smoke.test.ts` | Planned but unchanged | Existing smoke coverage already backed the README bridge narrative; verification reused it without code changes. |
| `test/utils.test.ts` | Pre-existing modified working-tree file | Remained out of Phase 17 scope, consistent with the plan boundary. |
| `.paul/HANDOFF-2026-03-19.md` | Pre-existing tracked deletion on branch | Not produced by Phase 17 implementation work. |

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
| Review the existing focused tests and add/adjust assertions only where they do not already substantiate the README claims | `test/tool-registry.test.ts` and `test/hashline-interop-smoke.test.ts` were reused unchanged | Their existing assertions already proved the conservative default and temporary bridge behavior being documented | No product impact; Phase 17 stayed narrower and avoided unnecessary churn |
| Re-run focused verification, then close only in-scope gaps | Fixed the user-reported redeclaration diagnostics in `test/python-tool-contract.test.ts` after APPLY by renaming local test bindings and replaying verification | The issue surfaced during execution and was in direct Phase 17 scope because that file was already part of the retained verification surface | Positive impact; kept the phase internally consistent and fully green |

## Key Patterns / Decisions

- Acceptance hardening should align README examples and generated wrapper types to the live payload contract rather than hiding stable structured fields from documentation.
- Existing focused runtime/policy tests are sufficient evidence for the README bridge/default claims when they already cover the behavior precisely; Phase 17 did not need broader harness expansion.
- The temporary hashline executor bridge remains the intended upstream story until Pi exposes `getToolExecutor()`, and the teardown trigger is now explicit in the maintainer-facing docs.

## Issues Encountered

- Initial focused/full-suite verification exposed the README `edit` example drift versus the live payload because `semanticSummary` was missing from the documented example.
- A follow-on diagnostics issue in `test/python-tool-contract.test.ts` surfaced after APPLY; it was resolved in-scope by renaming local bindings to avoid block-scoped redeclaration noise.

## Git / Automation Notes

No git commit was created during APPLY/UNIFY. This project continues to treat git commit/branch/remote automation as user-directed because the remote is upstream-owned and no `pals.json` git workflow is active in-repo.

## Next Phase Readiness

**Ready:**
- Phase 18 can now write PR narratives against a reviewer-facing surface whose examples, wrapper types, and verification claims are aligned.
- The retained upstream tests provide focused evidence for both the runtime seam and the conservative metadata/policy story.
- The temporary bridge rationale and teardown trigger are explicit enough to carry into the upstream PR materials.

**Concerns:**
- `test/utils.test.ts` remains unrelated working-tree carry-over state and should stay out of Phase 18 unless deliberately addressed.
- The branch still contains local-only `.paul/**` history and prior mixed-branch baggage, so Phase 18 must continue using the explicit review-branch construction path from the Phase 16 manifest.

**Blockers:**
- None

---
*Phase: 17-acceptance-hardening, Plan: 01*
*Completed: 2026-03-24*
