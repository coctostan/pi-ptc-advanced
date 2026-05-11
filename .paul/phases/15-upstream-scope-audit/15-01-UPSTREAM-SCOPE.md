# Upstream Scope Audit — Milestone 7 / Phase 15

## Purpose
This audit defines what in `pi-ptc-next` is suitable for upstream PR submission versus what should remain local-only or move to follow-up work. It is the scope lock for Milestone 7.

## Inventory

| Area | Files | Contribution | Current disposition signal |
|---|---|---|---|
| Runtime interop core | `src/tool-registry.ts`, `src/index.ts`, `src/code-executor.ts` | Makes `code_execution` use the same active Pi tool implementations seen in chat, preserves callable policy behavior, and wires the callable runtime surface into Python execution | Strong upstream candidate |
| Python helper and runtime contract surface | `src/tools/python-tool-contract.ts`, `src/tools/tool-wrapper.ts`, `src/python-runtime/runtime.py` | Gives Python a clearer structured helper surface, typed helper contracts, and generic runtime helpers for nested tool use | Strong upstream candidate |
| Operator-facing policy documentation | `README.md` | Documents `ptc.callable` / `ptc.policy`, caller routing, environment variables, and architecture in one maintainer-visible location | Strong upstream candidate |
| Interop regression proof | `test/hashline-interop-smoke.test.ts` | Proves active hashline-style overrides are the nested executors and that structured `details.ptcValue` survives the RPC boundary unchanged | Strong upstream candidate |
| Metadata/policy regression coverage | `test/hashline-default-exposure.test.ts`, `test/utils.test.ts` | Proves default exposure semantics, read-only trust behavior, and env parsing for callable/block/trusted lists | Strong upstream candidate |
| Combined-stack explainer docs | `docs/hashline-integration/START-HERE.md`, `docs/hashline-integration/DEMO.md`, `docs/hashline-integration/HARNESS-EVALUATION.md` | Explain setup, search→inspect→edit flow, and the deliberate decision to keep the lightweight smoke proof instead of a heavier harness | Useful, but likely too specific for the first upstream PR |
| Milestone/history docs | `docs/hashline-integration/ROADMAP.md`, `docs/hashline-integration/MILESTONE-01.md` | Preserve local implementation history and milestone framing for this worktree | Local-only |
| Personal operator profile | `scripts/start-pi-ptc-full-tools.sh` | Personal launcher for an analysis-oriented PTC surface | Local-only |
| Local project/process config | `pals.json`, `.paul/**` | PALS lifecycle state, local planning, and personal project automation context | Local-only |
| Adjacent repo diagnosis | `~/pi/workspace/pi-codegraph/PTC-METADATA-IMPLEMENTATION-PROMPT.md` and the related live diagnosis context | Identifies why `pi-codegraph` tools are missing from PTC nested execution and how to fix that in the correct repo | Follow-up in adjacent repo, not a `pi-ptc-next` PR |

## Disposition

### Upstream-worthy now

#### 1. Runtime interop and callable tool resolution
Keep these in upstream scope:
- `src/tool-registry.ts`
- `src/index.ts`
- `src/code-executor.ts`

Rationale:
- This is the core product improvement: `code_execution` should execute the same active Pi tool implementations visible in chat.
- The behavior is generic to PTC and not tied to a personal environment.
- It preserves conservative policy semantics rather than weakening them.

#### 2. Python-side helper contracts and runtime ergonomics
Keep these in upstream scope:
- `src/tools/python-tool-contract.ts`
- `src/tools/tool-wrapper.ts`
- `src/python-runtime/runtime.py`

Rationale:
- These files turn structured nested tool use into a documented, typed surface instead of prompt guesswork.
- The changes are provider-agnostic glue work that matches this repo’s role.
- They strengthen the substrate without embedding domain-specific logic.

#### 3. Core tests that prove the runtime and policy contract
Keep these in upstream scope:
- `test/hashline-interop-smoke.test.ts`
- `test/hashline-default-exposure.test.ts`
- `test/utils.test.ts`

Rationale:
- The PR needs behavior proof, not just implementation.
- These tests show active override execution, metadata/default exposure behavior, and env policy parsing.
- They support maintainers’ likely review questions around safety and correctness.

#### 4. Focused maintainer-facing docs in README
Keep this in upstream scope:
- `README.md`

Rationale:
- Upstream reviewers need one canonical description of the metadata and policy model.
- README-level documentation is a better first submission target than milestone-specific side docs.

### Local-only

Keep these out of upstream submission:
- `.paul/**`
- `pals.json`
- `scripts/start-pi-ptc-full-tools.sh`
- `docs/hashline-integration/ROADMAP.md`
- `docs/hashline-integration/MILESTONE-01.md`

Rationale:
- These are local planning, personal workflow, historical milestone, or personal operator-profile artifacts.
- None of them improve the upstream product directly.
- Including them would dilute review focus.

### Follow-up / optional, not first-PR material

Treat these as optional follow-up material rather than first-PR scope:
- `docs/hashline-integration/START-HERE.md`
- `docs/hashline-integration/DEMO.md`
- `docs/hashline-integration/HARNESS-EVALUATION.md`

Rationale:
- The content is useful, but it is combined-stack specific and more verbose than the minimal upstream case likely needs.
- The first upstream pass should prioritize product behavior, tests, and concise contract docs.
- These docs can be mined for README wording, PR description examples, or a later docs-focused follow-up PR.

### Explicit exclusions from upstream scope
- Personal launcher/profile scripts
- PALS artifacts and milestone state
- Hardcoded compatibility shims for external repos such as `pi-codegraph`
- New feature work from the ecosystem plan (`handle` helpers, orchestration helpers, recipes) that is not required to upstream the current shipped improvements

## Recommended PR Structure

### Preferred strategy: split into 2 PRs
A 2-PR split is the best balance between reviewer load and narrative coherence.

#### PR 1 — Active tool runtime interop and structured nested execution
**Suggested title:** `feat(ptc): use active Pi tool implementations in code_execution`

**Primary file group:**
- `src/tool-registry.ts`
- `src/index.ts`
- `src/code-executor.ts`
- `test/hashline-interop-smoke.test.ts`

**What this PR argues:**
- `code_execution` should execute the same active Pi tool implementations the user sees in chat.
- Structured machine-native results can cross the RPC boundary without being collapsed back into prose.
- Conservative policy behavior remains intact.

**Why this should go first:**
- It is the architectural foundation.
- It is the clearest product-level improvement.
- It minimizes reviewer context switching.

#### PR 2 — Metadata/policy contracts, Python helper surface, and focused docs/tests
**Suggested title:** `feat(ptc): document and validate callable tool metadata for structured Python workflows`

**Primary file group:**
- `src/tools/python-tool-contract.ts`
- `src/tools/tool-wrapper.ts`
- `src/python-runtime/runtime.py`
- `README.md`
- `test/hashline-default-exposure.test.ts`
- `test/utils.test.ts`

**What this PR argues:**
- Extension tools need an explicit callable/safety contract.
- Python helper contracts should reflect the structured runtime surface.
- The metadata/policy model should be documented and regression-tested.

**Why this should be separate:**
- It is reviewer-friendly to discuss metadata/policy and helper ergonomics after the runtime seam is understood.
- It avoids mixing architecture and documentation-heavy changes into one large patch.

### Why not a single PR?
A single PR is possible, but not preferred.
- The branch spans runtime resolution, structured nested execution, metadata normalization, Python helper contracts, policy docs, and tests.
- Reviewers are more likely to accept two coherent slices than one large “everything interop-related” patch.
- The split also creates a cleaner rollback and merge path if maintainers want the runtime seam before the docs/helper layer.

## Core upstream narrative

### Problem
`code_execution` can diverge from the active Pi tool implementations visible in chat, and extension tools need a clearer nested-execution metadata contract.

### Solution
- resolve active tool implementations into the callable runtime
- preserve structured machine-native nested results
- document and test explicit `ptc.callable` / `ptc.policy` behavior
- improve the Python helper surface without broadening default mutating access

### Non-goals
- no personal launcher/profile support in upstream scope
- no codegraph-specific compatibility shim in PTC
- no expansion into domain-specific orchestration features yet
- no automatic broadening of mutating tool exposure

### Adjacent follow-ups
- `pi-codegraph` should adopt explicit PTC metadata if its read-only tools should be callable from `code_execution`
- richer handle/orchestration helpers belong to a later milestone after current upstream work is extracted cleanly

## Phase 16 Checklist

### Branch cleanup and isolation
- [ ] Remove local-only files from the upstream submission path:
  - [ ] `scripts/start-pi-ptc-full-tools.sh`
  - [ ] `pals.json`
  - [ ] all `.paul/**` artifacts
  - [ ] `docs/hashline-integration/ROADMAP.md`
  - [ ] `docs/hashline-integration/MILESTONE-01.md`
- [ ] Decide whether `START-HERE.md`, `DEMO.md`, and `HARNESS-EVALUATION.md` stay local, move to a follow-up docs PR, or are distilled into `README.md`
- [ ] Confirm the working tree contains only PR-relevant changes before packaging work begins
- [ ] Ensure no repo-specific compatibility shim ideas leaked into `pi-ptc-next`

## Phase 17 Checklist

### Acceptance hardening
- [ ] Re-run core verification for the upstream-worthy surface
- [ ] Confirm README examples match the current metadata and policy behavior
- [ ] Tighten wording around conservative defaults and explicit opt-in for extension tools
- [ ] Make the temporary executor bridge rationale explicit where needed so reviewers understand the seam and the future teardown path
- [ ] Confirm the tests cover the claims made in the PR descriptions

## Phase 18 Checklist

### PR materials and submission prep
- [ ] Draft PR 1 title, summary, non-goals, and reviewer notes
- [ ] Draft PR 2 title, summary, non-goals, and reviewer notes
- [ ] Prepare a concise “why split this way” note in case maintainers ask
- [ ] Capture the adjacent follow-up note for `pi-codegraph` metadata so it stays out of the `pi-ptc-next` PR scope
- [ ] Decide whether to submit from the existing branch via cherry-pick/split branches or to prepare new review branches for each PR slice
- [ ] Ensure the final PR body explicitly excludes personal/local tooling and PALS artifacts
