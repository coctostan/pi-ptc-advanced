# Project: @cegersdo/pi-ptc

## What This Is
A `pi-ptc-next` enhancement that makes `code_execution` invoke the same active Pi tool implementations the user sees in chat, including hashline-native `read`, `grep`, and `edit` overrides. This removes split-brain tool behavior and incrementally establishes native structured hashline interop for Python workflows.

## Core Value
`pi-ptc-next` should execute the same active Pi tool implementations that the user sees in chat, so `code_execution` gets trustworthy hashline-native `read`/`grep`/`edit` behavior without split-brain tool semantics.

## Current State
| Attribute | Value |
|-----------|-------|
| Version | 0.1.1 |
| Status | Prototype |
| Last Updated | 2026-03-24 |

## Requirements
### Validated (Shipped)
- [x] Python code execution is available through `code_execution`
- [x] PTC supports callable tool registration, sandbox/runtime execution, and custom tool loading
- [x] `code_execution` resolves overridden builtin tool names (`read`, `grep`, `edit`) to the same active Pi executors used in chat — Milestone 1
- [x] Builtin fallback behavior remains intact when no override is present — Milestone 1
- [x] Allow/deny policy behavior remains unchanged for read-only vs mutating tools — Milestone 1
- [x] Focused regression tests cover overridden and non-overridden cases — Milestone 1
- [x] `normalizeToolResult()` prefers `details.ptcValue` as the first-class machine-native result when present — Phase 2
- [x] Mocked hashline-style structured payload tests cover `read`, `grep`, and `edit` while preserving text fallback behavior — Phase 2
- [x] Nested RPC handling preserves structured `details.ptcValue` results unchanged across the tool boundary — Phase 2
- [x] Documented expected structured result shapes and fallback semantics for hashline-style `read` / `grep` / `edit` payloads — Phase 3
- [x] Added a lightweight combined interop smoke regression proving active hashline-style `read` / `grep` / `edit` override execution and `details.ptcValue` passthrough — Phase 4
- [x] Finalized milestone-facing interop docs with smoke-proof location and contract expectations — Phase 4
- [x] Python helper contracts, generated wrappers, and model-facing guidance now expose structured anchored result models for builtin `read` / `grep` / `edit` while preserving fallback-safe behavior — Phase 5
- [x] Extension tools now support explicit `ptc.callable` / `ptc.policy` metadata with legacy `enabled` / `readOnly` compatibility, aligned callable-tool policy behavior, and documented combined-stack setup guidance — Phase 6
- [x] Added a canonical end-to-end search → inspect → edit demo workflow plus aligned combined-stack documentation for `pi-ptc-next` + `pi-hashline-readmap` — Phase 7
- [x] Evaluated the heavier real two-extension loading harness and explicitly deferred it in favor of the lightweight smoke proof unless future packaging-level evidence justifies it — Phase 7
- [x] Prepared reviewer-facing PR 1 / PR 2 narratives and a deterministic manual submission checklist for the approved 2-PR upstream split — Phase 18
- [x] Restored a repo-local personal analysis launcher profile and made allowlisted-but-unavailable tool gaps explicit so personal `code_execution` sessions fail transparently instead of silently — Phase 19
- [x] Added repo-local personal-fork maintenance entrypoints and a normal maintainer runbook for routine verification plus manual sync/upgrade boundaries — Phase 20
- [x] Archived/demoted upstream PR-prep material behind a Milestone 7 archive guide so personal maintenance is the active workflow and the old submission path is historical reference only — Phase 21
### Active (In Progress)
- [ ] None currently; Milestone 8 is complete
### Planned (Next)
- [ ] Revisit version bump / release packaging only if the personal fork actually needs it
### Out of Scope
- [ ] Long-term IR refactors during the early interop milestones
- [ ] Broad helper ergonomics changes beyond what is required for trustworthy structured interop

## Target Users
**Primary:** Pi extension authors and advanced Pi users building Python-assisted tool workflows
- Need `code_execution` to behave consistently with the active tools visible in chat
- Need reliable anchored file-inspection and edit workflows
- Need minimal divergence between normal Pi execution and PTC execution paths

**Secondary:** Maintainers integrating `pi-ptc-next` with `pi-hashline-readmap`
- Need a small, reviewable runtime seam before structured payload work
- Need lightweight, trustworthy proof before broader together-testing and documentation work

## Context
**Business Context:**
This work improves trustworthiness and interoperability across Pi extensions by making `pi-ptc-next` honor the same active tool implementations users already rely on in chat.

**Technical Context:**
- Existing codebase detected: TypeScript npm package / Pi extension with Python runtime support
- Package name: `@cegersdo/pi-ptc`
- Key source areas: `src/index.ts`, `src/code-executor.ts`, `src/custom-tool-manager.ts`, `src/tool-registry.ts`, `src/tool-adapters.ts`, `src/rpc-protocol.ts`
- Maintainer-facing integration docs now live in `README.md`; deeper local planning/history artifacts live under `.paul/`
- Current branch is `feat/hashline-native-interop`

## Constraints
### Technical Constraints
- Must preserve existing `code_execution` behavior for tools without overrides
- Must use the same active Pi tool implementations users see in chat for overridden names
- Must not introduce accidental recursion into `code_execution`
- Must keep safety and determinism intact for anchored hashline workflows
- Existing TypeScript, Node, and Python runtime architecture should be preserved

### Business Constraints
- Changes should be narrowly scoped and reviewable
- Upstream-friendly patches are preferred over a long-lived fork

### Compliance Constraints
- No additional compliance constraints identified yet

## Key Decisions
| Decision | Rationale | Date | Status |
|----------|-----------|------|--------|
| Start with the runtime seam for active tool execution | It removes split-brain behavior and makes later interop work trustworthy | 2026-03-16 | Active |
| Keep milestone 1 focused on correctness and tests | Small scoped patches reduce risk in a brownfield codebase | 2026-03-16 | Active |
| Preserve fallback builtin behavior and policy handling | Interop improvements should not regress existing safety or compatibility | 2026-03-16 | Active |
| Keep the seam in the registry/tool-resolution layer | Minimizes risk and avoids unnecessary runtime churn | 2026-03-16 | Active |
| Make `ptcValue` preference explicit in the normalization layer before broader interop work | The runtime contract should be locked down with small, testable changes before adding docs or together-testing | 2026-03-16 | Active |
| Prefer mocked hashline-style payload tests before a real two-extension smoke harness | Lightweight proof keeps the current phase narrow and sets up Phase 4 for a focused real-world check | 2026-03-16 | Active |
| Clarify in model-facing `code_execution` guidance that builtin helper signatures are fallback defaults and active overrides may return richer `details.ptcValue` payloads | Prevents users/models from assuming fallback signatures cap structured interop behavior | 2026-03-17 | Active |
| Keep Phase 4 closure lightweight: prove active override + `ptcValue` flow with focused smoke coverage and document exact verification steps | Delivers together-confidence without introducing heavy harness complexity or milestone scope creep | 2026-03-17 | Active |
| Model builtin helper ergonomics with explicit structured anchored result types instead of only generic fallback signatures | Makes Python-side hashline interop easier to understand and use without changing runtime behavior | 2026-03-17 | Active |
| Prefer explicit `ptc.callable` / `ptc.policy` metadata for extension tools while normalizing legacy `enabled` / `readOnly` metadata | Clarifies callable intent and safety traits without breaking existing extension tools or operator workflows | 2026-03-17 | Active |
| Close Milestone 3 with focused docs/demo artifacts and an explicit harness recommendation instead of automatically building heavier integration infrastructure | Keeps the final milestone slice reviewable and grounded in demonstrated runtime behavior while preserving a clear future trigger for deeper harnessing | 2026-03-17 | Active |
| Prefer a 2-PR upstream packaging strategy for the current PTC interop work | Runtime interop and metadata/helper/docs are both upstream-worthy, but they review more cleanly as separate slices with clearer narratives | 2026-03-24 | Active |
| Build upstream review branches from `origin/main` with explicit file restores instead of relying on mixed-branch cherry-picks | The current feature branch mixes upstream-worthy code, local-only PALS history, and optional harness/docs; explicit restore-based branch construction gives clean PR slices | 2026-03-24 | Active |
| Acceptance hardening should align reviewer-facing docs and generated wrapper types to the live structured payloads while reusing the smallest focused proof set that already covers the claims | Keeps upstream acceptance work narrow, defensible, and grounded in the existing retained verification surface instead of adding broader harness churn | 2026-03-24 | Active |
| Keep upstream submission execution manual and restore-based even after the PR materials are prepared | The working branch still mixes local-only history with upstream-worthy code, so clean review branches and user-directed PR opening remain the safest path | 2026-03-24 | Active |
| Shift from upstream submission prep to personal fork maintainability as the primary delivery goal | The upstream project is no longer expected to move quickly, while the fork already works and will be maintained for personal use | 2026-03-24 | Active |
| Treat `PTC_CALLABLE_TOOLS` as a filter over Pi-visible tools, not as a loader for missing tools | The personal analysis profile must be deterministic and honest about runtime visibility limits instead of implying the allowlist alone should materialize unavailable tools | 2026-03-24 | Active |
| Keep personal fork maintenance automation repo-local and verification-focused while leaving git sync/upgrade actions manual | The fork needs repeatable local verification and operator guidance, but remote/branch/rebase/push/PR actions still depend on user-specific remotes and history choices | 2026-03-24 | Active |
| Archive the old upstream PR-prep material behind a single milestone-level guide instead of deleting it outright | Preserves the historical upstream rationale while making the personal maintenance workflow unambiguous for future sessions | 2026-03-24 | Active |

## Success Metrics
| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Overridden `read`/`grep`/`edit` execute via active Pi tool implementations inside `code_execution` | Yes | Yes | Achieved |
| Builtin fallback works when no override is present | Yes | Yes | Achieved |
| Focused tests for override and fallback paths | Added and passing | Added and passing | Achieved |
| Structured `ptcValue` normalization and RPC passthrough for hashline-native tools | Yes | Normalization + mocked proof + docs/model-guidance reconciliation landed | Achieved |
| Lightweight interop smoke proof for active hashline-style overrides and `ptcValue` passthrough | Yes | Added in `test/hashline-interop-smoke.test.ts` and documented in README/hashline docs | Achieved |
| Python helper ergonomics for structured anchored builtin results | Yes | Builtin contracts, wrappers, and `code_execution` guidance now expose richer anchored result models | Achieved |
| Explicit metadata/policy contract for extension tools | Yes | `ptc.callable` / `ptc.policy` normalization, legacy compatibility, policy tests, and combined-stack guidance landed | Achieved |
| Full real two-extension loading smoke harness with `pi-hashline-readmap` | Optional | Explicitly evaluated and deferred; lightweight smoke coverage remains the first-pass upstream verification point | Deferred |

## Tech Stack
| Layer | Technology | Notes |
|-------|------------|-------|
| Framework | `@mariozechner/pi-coding-agent` extension API | Pi extension entrypoint in `src/index.ts` |
| Runtime | Node.js + TypeScript | Built with `tsc` |
| Python Execution | Bundled Python runtime assets | Used by `code_execution` |
| UI | `@mariozechner/pi-tui` | Tool rendering components |
| Schema | `@sinclair/typebox` | Tool parameter schemas |

## Links
| Resource | URL |
|----------|-----|
| Repository | https://github.com/edxeth/pi-ptc-next |
| Maintainer Docs | `README.md` |
| Local Roadmap | `.paul/ROADMAP.md` |
| Milestone History | `.paul/MILESTONES.md` |

---
*PROJECT.md — Updated when requirements or context change*
*Last updated: 2026-03-24 after Phase 21 completion*
