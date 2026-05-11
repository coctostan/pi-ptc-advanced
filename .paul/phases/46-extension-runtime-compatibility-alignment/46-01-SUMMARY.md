---
phase: 46-extension-runtime-compatibility-alignment
plan: 01
subsystem: extension-runtime
tags: [pi-runtime, mario-scope, sourceInfo, hashline, tool-registry]

requires:
  - phase: 45-pi-api-and-documentation-delta-audit
    provides: Phase 45 compatibility audit findings 46-A through 46-D
provides:
  - latest Mario-scope package alignment for `@mariozechner/*@0.73.1`
  - explicit separation between Pi `sourceInfo` provenance and PTC internal `source` taxonomy
  - hashline executor bridge no-executor observability signal
affects:
  - 47-system-prompt-and-tool-guidance-optimization
  - 48-compatibility-proof-and-release-readiness

tech-stack:
  added: []
  patterns:
    - Mario-scope compatibility target instead of hard `@earendil-works/*` switch
    - Pi provenance carried as `sourceInfo` separately from PTC callable metadata

key-files:
  created:
    - .paul/CODI-HISTORY.md
  modified:
    - package.json
    - package-lock.json
    - src/index.ts
    - src/contracts/tool-types.ts
    - src/tool-registry.ts
    - test/tool-registry.test.ts

key-decisions:
  - "Decision: Target latest Mario-scope Pi packages (`@mariozechner/*@0.73.1`) for local compatibility."
  - "Decision: Preserve Pi `sourceInfo` separately from PTC's internal `source` field."
  - "Decision: Keep an explicit `context` event compatibility shim on Mario 0.73.1 because the public overload is not typed there."

patterns-established:
  - "Pattern: Do not collapse host provenance (`sourceInfo`) into PTC's callable-tool `source` taxonomy."
  - "Pattern: Hashline bridge startup should visibly warn when no pre-emitted executors are present while keeping builtin fallback active."

duration: ~30min
started: 2026-05-11T20:22:11Z
completed: 2026-05-11T20:30:00Z
---

# Phase 46 Plan 01: Extension Runtime Compatibility Alignment Summary

**Latest Mario-scope runtime alignment shipped with explicit Pi provenance handling and hashline bridge startup observability, while preserving compatibility with the user's current Mario Pi setup.**

## Performance

| Metric | Value |
|--------|-------|
| Duration | ~30 minutes |
| Started | 2026-05-11T20:22:11Z |
| Completed | 2026-05-11T20:30:00Z |
| Tasks | 3 completed |
| Files modified | 6 runtime/test files + lifecycle artifacts |

## Acceptance Criteria Results

| Criterion | Status | Notes |
|-----------|--------|-------|
| AC-1: Pi package scope is Mario-latest compatible | Pass | `package.json` and `package-lock.json` now target `@mariozechner/pi-coding-agent@^0.73.1` and `@mariozechner/pi-tui@^0.73.1`; source imports remain on the Mario scope. |
| AC-2: Runtime registration uses typed Mario-latest Pi APIs | Pass with documented deviation | Mario 0.73.1 does not expose a typed `context` overload, so direct `pi.on("context", ...)` was not possible. The prior `unknown` cast was replaced with a narrower explicit `ExtensionAPI & { on(event: "context", ...) }` compatibility shim plus rationale. |
| AC-3: Hashline bridge no-op state is observable but non-breaking | Pass | `ToolRegistry` emits a one-time PTC warning when no pre-emitted hashline executors are present; builtin fallback and later `hashline:tool-executors` ingestion remain covered by tests. |
| AC-4: Pi provenance strategy is explicit | Pass | `ToolInfo` now omits/reintroduces `sourceInfo` separately from internal `source`; registry conversions preserve `sourceInfo` without changing Python helper `source` metadata. |

## Module Execution Reports

### Pre-Unify Dispatch

[dispatch] pre-unify: 0 modules registered for this hook.

### WALT Quality

| Metric | Before | After | Delta | Trajectory |
|--------|--------|-------|-------|------------|
| Tests passing | 207 | 210 | +3 | ▲ improving |
| Tests failing | 0 | 0 | 0 | ● stable |
| Typecheck | clean | clean | unchanged | ● stable |
| Lint/complexity | not tracked for Phase 45 | clean on changed TS/test files | improved signal | ▲ improving |

**Evidence:** `npm test` passed with 210 passing / 0 failing; `npm run build` passed; `npx eslint --no-config-lookup --rule 'complexity: [warn, 10]' --format json ...` reported no issues.

**Side effect:** Appended the Phase 46 row to `.paul/quality-history.md`.

### CODI

[dispatch] CODI post-unify: hook body entered for 46-01.

CODI found no canonical injected blast-radius record in the approved plan, so it recorded `no-dispatch-found` per the post-unify history schema.

**Side effect:** Created `.paul/CODI-HISTORY.md` with row `46-01 | 2026-05-11 | no-dispatch-found | — | — | — | — | n`.

### RUBY

RUBY post-unify debt scan completed on changed files.

| File | Lines | Complexity result | Note |
|------|-------|-------------------|------|
| `src/index.ts` | 427 | clean | Existing large file; no new complexity warnings from the Phase 46 change. |
| `src/tool-registry.ts` | 479 | clean | Existing hotspot grew slightly for sourceInfo and bridge warning behavior; below critical 500-line threshold. |
| `src/contracts/tool-types.ts` | 98 | clean | Small type-contract update. |
| `src/tools/python-tool-contract.ts` | 293 | clean | Planned file, unchanged in final implementation. |
| `test/tool-registry.test.ts` | 554 | clean | Test file exceeds 500 lines after adding focused cases; acceptable test growth but should be watched for future extraction. |

### SKIP Knowledge Capture

#### 2026-05-11 Latest Mario-scope compatibility target
Type: decision  
Phase: 46  
Context: User confirmed they are still on the Mario package scope, so a hard `@earendil-works/*` switch would risk breaking the local setup.  
Decision: Target latest Mario packages (`@mariozechner/*@0.73.1`) and preserve Mario imports for Phase 46.  
Alternatives considered: hard `@earendil-works/*` switch (rejected as locally breaking); document-only deferral (rejected because the lockfile/package drift could be improved safely).  
Rationale: Keeps the project compatible with the active local Pi environment while still removing the older 0.55.1 build-time drift.  
Impact: Phase 47/48 should continue treating `@earendil-works/*` as an upstream migration topic, not a Phase 46 implementation fact.

#### 2026-05-11 SourceInfo taxonomy separation
Type: rationale  
Phase: 46  
Explanation: Pi host provenance and PTC callable metadata use similar concepts but different purposes.  
Key factors: Python helper metadata already depends on `source: builtin | alias | extension`; overwriting that with host provenance would be a backward-incompatible metadata change; preserving `sourceInfo` separately keeps both meanings available.

### Post-Unify Dispatch Summary

[dispatch] post-unify: WALT PASS; CODI recorded `no-dispatch-found`; RUBY PASS with hotspot note for `test/tool-registry.test.ts`; SKIP captured decision/rationale knowledge above. No blocking post-unify module findings.

## Accomplishments

- Updated package metadata and lockfile from Mario 0.55.1-era dependencies to latest Mario 0.73.1 packages without switching scopes.
- Made Pi `sourceInfo` handling explicit and tested while preserving PTC's stable internal `source` metadata for Python helpers.
- Added a one-time hashline bridge no-executor warning and focused tests for warning/no-warning/sourceInfo behavior.
- Preserved builtin fallback and later EventBus executor ingestion for hashline-native interop.

## Task Commits

| Task | Commit | Type | Description |
|------|--------|------|-------------|
| Task 1: Align package metadata to latest Mario-scope Pi | `c859c9b` | chore | Updated `package.json` and regenerated `package-lock.json` for `@mariozechner/*@0.73.1`. |
| Task 2: Remove obsolete context cast and make sourceInfo strategy explicit | `c859c9b` | chore | Replaced the `unknown` context cast with a narrower compatibility shim and preserved `sourceInfo` separately from internal `source`. |
| Task 3: Add hashline bridge no-executor visibility signal | `c859c9b` | chore | Added one-time warning behavior and focused ToolRegistry tests. |

Plan metadata: pending UNIFY metadata commit.

## Files Created/Modified

| File | Change | Purpose |
|------|--------|---------|
| `package.json` | Modified | Target latest Mario-scope Pi peer/dependency ranges. |
| `package-lock.json` | Modified | Resolve Mario Pi packages and transitive dependencies at 0.73.1 baseline. |
| `src/index.ts` | Modified | Keep context event compatibility explicit for Mario 0.73.1. |
| `src/contracts/tool-types.ts` | Modified | Separate Pi `sourceInfo` from PTC internal `source` taxonomy. |
| `src/tool-registry.ts` | Modified | Preserve `sourceInfo`, add hashline bridge startup warning, keep fallback/event ingestion. |
| `test/tool-registry.test.ts` | Modified | Cover no-executor warning, pre-emitted no-warning path, and sourceInfo preservation. |
| `.paul/CODI-HISTORY.md` | Created | Record CODI post-unify history row for 46-01. |
| `.paul/quality-history.md` | Modified | Record Phase 46 quality delta. |
| `.paul/STATE.md`, `.paul/ROADMAP.md`, `.paul/PROJECT.md` | Modified | Update lifecycle and routing state. |

## Decisions Made

| Decision | Rationale | Impact |
|----------|-----------|--------|
| Target latest Mario-scope Pi (`@mariozechner/*@0.73.1`) | User is still on Mario scope; hard-switching to `@earendil-works/*` could break local installs. | Phase 46 is compatibility alignment, not upstream-scope migration. |
| Preserve source imports on `@mariozechner/*` | Keeps runtime/build behavior compatible with current local Pi. | Docs/release notes should not claim an `@earendil-works/*` migration shipped. |
| Preserve `sourceInfo` separately from `source` | Avoids breaking Python helper metadata while still carrying Pi provenance. | Future registry code should keep these concepts separate. |
| Retain a typed compatibility shim for `context` | Mario 0.73.1 does not type the overload; direct call does not compile. | Documented deviation from original plan; revisit if/when package scope migrates. |

## Deviations from Plan

### Summary

| Type | Count | Impact |
|------|-------|--------|
| Planned compatibility adjustment | 1 | Plan was revised before APPLY to target latest Mario instead of `@earendil-works/*`. |
| Implementation deviation | 1 | Direct typed `pi.on("context", ...)` was not possible on Mario 0.73.1, so a narrower compatibility shim remains. |
| Deferred | 2 | Upstream `@earendil-works/*` migration and docs/prompt/release work remain Phase 47/48 scope. |

**Total impact:** No functional regression; compatibility improved for the user's active Mario setup while preserving the future upstream migration decision.

### Auto-fixed Issues

None.

### Deferred Items

- Upstream `@earendil-works/*` package-scope migration remains deferred until the user's active Pi setup moves scopes.
- README/CHANGELOG/prompt metadata guidance remains deferred to Phase 47/48 as planned.

## Issues Encountered

| Issue | Resolution |
|-------|------------|
| Direct `pi.on("context", onContext)` does not compile against Mario 0.73.1 public ExtensionAPI types. | Replaced the previous `unknown` cast with a narrower explicit `ExtensionAPI & { on(event: "context", ...) }` compatibility shim and comment. |
| `npm audit --json` still exits non-zero. | Audit signal improved to 0 critical / 0 high / 3 moderate; remaining moderate findings are not new critical/high blockers. |

## Verification

| Command | Result |
|---------|--------|
| `npm install` | Pass — regenerated lockfile for Mario 0.73.1 baseline. |
| `npm run build` | Pass. |
| `node --test test/tool-registry.test.ts` | Pass — 18 passing / 0 failing. |
| `node --test test/hashline-default-exposure.test.ts test/hashline-interop-smoke.test.ts` | Pass. |
| `npm test` | Pass — 210 passing / 0 failing. |
| `npm audit --json` | Non-zero due to 3 moderate findings; improved from DEAN baseline and introduced no new critical/high findings. |
| `npx eslint --no-config-lookup --rule 'complexity: [warn, 10]' --format json ...` | Pass — no issues found. |

## Next Phase Readiness

**Ready:**
- Phase 46 implementation is complete and PR #2 is open.
- The package baseline now matches the latest Mario package line without breaking local scope compatibility.
- Tool registry provenance and hashline bridge observability are tested.

**Concerns:**
- CI was still in progress at initial APPLY postflight and must pass before the GitHub Flow merge gate can close.
- `test/tool-registry.test.ts` is now 554 lines; future registry-test additions should consider extraction.
- Upstream `@earendil-works/*` migration remains a future compatibility/release decision.

**Blockers:**
- GitHub Flow merge gate blocks loop closure until PR #2 CI passes and the PR is merged.

---
*Phase: 46-extension-runtime-compatibility-alignment, Plan: 01*
*Completed: 2026-05-11*
