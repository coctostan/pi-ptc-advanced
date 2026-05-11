# Branch Isolation Manifest — Milestone 7 / Phase 16

## Purpose
This artifact converts the Phase 15 scope audit into a file-level execution map for upstream PR preparation. It answers three operational questions:
- what belongs in PR 1
- what belongs in PR 2
- what must stay local-only or move to a later follow-up

## Baseline Snapshot
- Branch: `feat/hashline-native-interop`
- Comparison base: `origin/main...HEAD`
- Scope authority: `.paul/phases/15-upstream-scope-audit/15-01-UPSTREAM-SCOPE.md`
- Current working-tree note: the branch already mixes shipped upstream-worthy code, committed local-only PALS history, and loose untracked local artifacts that should not survive into review branches.

## PR 1 Candidate Surface
### Runtime interop core
Keep these together for the first upstream PR because they carry the central product claim: `code_execution` should execute the same active Pi tool implementations visible in chat.

- `src/tool-registry.ts`
- `src/code-executor.ts`
- `src/index.ts`
- `src/contracts/tool-types.ts`
- `test/tool-registry.test.ts`
- `test/hashline-interop-smoke.test.ts`

### Why these stay together
- `src/tool-registry.ts`, `src/code-executor.ts`, and `src/index.ts` are the runtime seam.
- `src/contracts/tool-types.ts` carries shared execution metadata needed by the registry/runtime path and is easier to keep with the seam than to split later.
- `test/tool-registry.test.ts` and `test/hashline-interop-smoke.test.ts` provide the focused proof that the active executor path and structured passthrough behavior actually work.

## PR 2 Candidate Surface
### Metadata, helper/runtime contracts, and focused maintainer docs/tests
Keep these for the second upstream PR after PR 1 establishes the runtime seam.

- `README.md`
- `src/custom-tool-manager.ts`
- `src/tool-adapters.ts`
- `src/tools/python-tool-contract.ts`
- `src/tools/tool-wrapper.ts`
- `src/python-runtime/runtime.py`
- `src/python-runtime/rpc.py`
- `src/utils.ts`
- `test/custom-tool-manager.test.ts`
- `test/hashline-default-exposure.test.ts`
- `test/hashline-edit-contract.test.ts`
- `test/hashline-grep-contract.test.ts`
- `test/hashline-read-contract.test.ts`
- `test/hashline-sg-contract.test.ts`
- `test/index.test.ts`
- `test/python-tool-contract.test.ts`
- `test/rpc-protocol.test.ts`
- `test/tool-adapters.test.ts`
- `test/tool-wrapper.test.ts`
- `test/utils.test.ts`

### Why these belong in PR 2
- They document and validate `ptc.callable` / `ptc.policy`, structured helper contracts, fallback normalization rules, and runtime hardening.
- `src/python-runtime/runtime.py`, `src/python-runtime/rpc.py`, `src/tool-adapters.ts`, and `src/utils.ts` are supporting substrate for the structured nested-execution contract rather than the initial registry seam itself.
- `README.md` should be the maintainer-facing explanation surface for the upstream submission; companion local docs should not be required.

## Follow-up / Optional Items
These files are useful evidence or local diagnostics, but they should not be in the first-pass upstream PR set.

- `test/e2e-agent-harness.sh`
  - Disposition: isolate later via branch construction, not by editing the file now
  - Rationale: valuable local regression coverage, but it is a heavy real-runtime harness and not necessary to establish the first-pass upstream contract
- `test/hashline-real-interop.mjs`
- `test/hashline-real-interop.test.ts`
  - Disposition: isolate later via branch construction, not by editing the file now
  - Rationale: these depend on paired-extension/local-environment assumptions and are better treated as optional follow-up evidence rather than required upstream review surface

## Local-only Exclusions
These must stay out of upstream review branches.

- `.paul/**`
  - Disposition: keep local-only; isolate later by constructing clean review branches from `origin/main` instead of trying to sanitize this branch history
  - Rationale: PALS state/history is project-local process metadata, not product code
- `.gitignore`
  - Disposition: keep local-only unless a separate non-PALS reason emerges
  - Rationale: the current delta only adds `.paul/handoffs/` ignore behavior
- `pals.json`
  - Disposition: relocate now into ignored local storage
  - Rationale: local workflow configuration, not upstream product behavior
- `scripts/start-pi-ptc-full-tools.sh`
  - Disposition: relocate now into ignored local storage
  - Rationale: personal launcher profile for a local analysis surface
- `docs/hashline-integration/ROADMAP.md`
- `docs/hashline-integration/MILESTONE-01.md`
  - Disposition: relocate now into ignored local storage
  - Rationale: milestone/history docs are local implementation history, not upstream product docs
- `docs/hashline-integration/START-HERE.md`
- `docs/hashline-integration/DEMO.md`
- `docs/hashline-integration/HARNESS-EVALUATION.md`
  - Disposition: distill any essential maintainer-facing guidance into `README.md`, then relocate the full side docs into ignored local storage
  - Rationale: useful source material, but too combined-stack-specific for the first upstream pass

## Working-tree Cleanup Result
Phase 16 relocated the loose local-only artifacts into ignored storage so they no longer appear as accidental PR baggage in `git status`.

Ignored storage root used:
- `.paul/handoffs/archive/phase-16-local-only/`
Relocated during APPLY:
- `pals.json`
- `scripts/start-pi-ptc-full-tools.sh`
- `docs/hashline-integration/START-HERE.md`
- `docs/hashline-integration/DEMO.md`
- `docs/hashline-integration/HARNESS-EVALUATION.md`
- `docs/hashline-integration/ROADMAP.md`
- `docs/hashline-integration/MILESTONE-01.md`

## Repo-specific Leakage Check
Checked intended upstream surface for adjacent-repo leakage after the Phase 16 cleanup.
Result:
- `grep -R "pi-codegraph" src README.md test/hashline-interop-smoke.test.ts test/hashline-default-exposure.test.ts test/utils.test.ts` returned no matches on 2026-03-24.
- Keep any `pi-codegraph` follow-up notes in local planning artifacts only.

## Verification Commands
Run these checks before Phase 17 or Phase 18 branch prep:

### 1. Confirm local-only loose files are gone from active status
```bash
git status --short --untracked-files=all
```
Expected after Phase 16 cleanup:
- no active entries for `docs/hashline-integration/*`
- no active entry for `pals.json`
- no active entry for `scripts/start-pi-ptc-full-tools.sh`

### 2. Confirm README is self-contained for first-pass review
```bash
! grep -q 'docs/hashline-integration/' README.md
```

### 3. Confirm PR 1 file group against the current branch
```bash
git diff --name-only origin/main...HEAD -- \
  src/tool-registry.ts \
  src/code-executor.ts \
  src/index.ts \
  src/contracts/tool-types.ts \
  test/tool-registry.test.ts \
  test/hashline-interop-smoke.test.ts
```

### 4. Confirm PR 2 file group against the current branch
```bash
git diff --name-only origin/main...HEAD -- \
  README.md \
  src/custom-tool-manager.ts \
  src/tool-adapters.ts \
  src/tools/python-tool-contract.ts \
  src/tools/tool-wrapper.ts \
  src/python-runtime/runtime.py \
  src/python-runtime/rpc.py \
  src/utils.ts \
  test/custom-tool-manager.test.ts \
  test/hashline-default-exposure.test.ts \
  test/hashline-edit-contract.test.ts \
  test/hashline-grep-contract.test.ts \
  test/hashline-read-contract.test.ts \
  test/hashline-sg-contract.test.ts \
  test/index.test.ts \
  test/python-tool-contract.test.ts \
  test/rpc-protocol.test.ts \
  test/tool-adapters.test.ts \
  test/tool-wrapper.test.ts \
  test/utils.test.ts
```

### 5. Confirm optional/follow-up harness files stay out of first-pass PRs
```bash
git diff --name-only origin/main...HEAD -- \
  test/e2e-agent-harness.sh \
  test/hashline-real-interop.mjs \
  test/hashline-real-interop.test.ts
```
Review outcome:
- these files may exist on the working branch, but Phase 18 review branches should exclude them unless explicitly promoted later

### 6. Confirm no adjacent-repo leakage in intended upstream surface
```bash
! grep -R "pi-codegraph" src README.md test/hashline-interop-smoke.test.ts test/hashline-default-exposure.test.ts test/utils.test.ts
```

## Phase 18 Branch-Prep Handoff
### Recommended branch construction strategy
Do **not** rely on whole-commit cherry-picks from `feat/hashline-native-interop`.

Reason:
- the branch history mixes upstream-worthy code, local-only `.paul/**` history, optional harness work, and review-slice boundaries that do not align cleanly to the existing commits

### PR 1 construction
Start from `origin/main` and restore only the PR 1 file set.

```bash
git switch -c review/pr1-runtime-interop origin/main
git restore --source feat/hashline-native-interop -- \
  src/tool-registry.ts \
  src/code-executor.ts \
  src/index.ts \
  src/contracts/tool-types.ts \
  test/tool-registry.test.ts \
  test/hashline-interop-smoke.test.ts
```

Then verify with the focused runtime checks and commit that slice alone.

### PR 2 construction
Create the second review branch from the PR 1 branch so the metadata/helper/docs layer can stack on the runtime seam.

```bash
git switch -c review/pr2-metadata-helper-docs review/pr1-runtime-interop
git restore --source feat/hashline-native-interop -- \
  README.md \
  src/custom-tool-manager.ts \
  src/tool-adapters.ts \
  src/tools/python-tool-contract.ts \
  src/tools/tool-wrapper.ts \
  src/python-runtime/runtime.py \
  src/python-runtime/rpc.py \
  src/utils.ts \
  test/custom-tool-manager.test.ts \
  test/hashline-default-exposure.test.ts \
  test/hashline-edit-contract.test.ts \
  test/hashline-grep-contract.test.ts \
  test/hashline-read-contract.test.ts \
  test/hashline-sg-contract.test.ts \
  test/index.test.ts \
  test/python-tool-contract.test.ts \
  test/rpc-protocol.test.ts \
  test/tool-adapters.test.ts \
  test/tool-wrapper.test.ts \
  test/utils.test.ts
```

### Explicit exclusions for both review branches
Never carry these into the upstream review branches unless a later decision explicitly reverses the exclusion:
- `.paul/**`
- `.gitignore` change for `.paul/handoffs/`
- `pals.json`
- `scripts/start-pi-ptc-full-tools.sh`
- `docs/hashline-integration/ROADMAP.md`
- `docs/hashline-integration/MILESTONE-01.md`
- `docs/hashline-integration/START-HERE.md`
- `docs/hashline-integration/DEMO.md`
- `docs/hashline-integration/HARNESS-EVALUATION.md`
- `test/e2e-agent-harness.sh`
- `test/hashline-real-interop.mjs`
- `test/hashline-real-interop.test.ts`

### Final review-branch rule
If a file is not listed under PR 1 or PR 2 candidate surface above, it is excluded by default until explicitly re-justified.
