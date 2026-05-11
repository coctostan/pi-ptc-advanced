# Phase 18 Submission Checklist

## Purpose
This runbook turns the Phase 16 branch-isolation manifest into exact manual steps for opening the two upstream PRs without relying on the mixed history of `feat/hashline-native-interop`.

## Preflight
- Current working branch should remain `feat/hashline-native-interop` while preparing the review branches.
- Remote actions remain user-directed. Do not assume automatic commit, push, PR creation, or merge steps.
- Use restore-based review branches from `origin/main`, not cherry-picks from the mixed branch.
- Keep local-only artifacts and optional harness evidence out of both review branches.

## Preflight checks
Run these before creating either review branch:

```bash
git branch --show-current
git remote -v | head -10
git status --short --untracked-files=all
! grep -q 'docs/hashline-integration/' README.md
! grep -R "pi-codegraph" src README.md test/hashline-interop-smoke.test.ts test/hashline-default-exposure.test.ts test/utils.test.ts
```

Confirm the intended slice still matches the manifest:

```bash
git diff --name-only origin/main...HEAD -- \
  src/tool-registry.ts \
  src/code-executor.ts \
  src/index.ts \
  src/contracts/tool-types.ts \
  test/tool-registry.test.ts \
  test/hashline-interop-smoke.test.ts

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

git diff --name-only origin/main...HEAD -- \
  test/e2e-agent-harness.sh \
  test/hashline-real-interop.mjs \
  test/hashline-real-interop.test.ts
```

## PR 1 checklist — `review/pr1-runtime-interop`

### Create the branch
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

### Verify the branch contents
```bash
git diff --name-only origin/main...HEAD
npm run build
node --test test/tool-registry.test.ts test/hashline-interop-smoke.test.ts
```

### Prepare the manual PR opening
- Review the diff and confirm only the PR 1 runtime seam files are present.
- Commit locally with a title aligned to the planned narrative.
- Push the branch manually.
- Open the upstream PR manually.
- Use the draft in `18-01-PR1-MATERIALS.md` for the title, summary, non-goals, exclusions, and reviewer notes.

## PR 2 checklist — `review/pr2-metadata-helper-docs`

### Create the stacked branch
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

### Verify the branch contents
```bash
git diff --name-only review/pr1-runtime-interop...HEAD
npm run build
node --test \
  test/custom-tool-manager.test.ts \
  test/hashline-default-exposure.test.ts \
  test/hashline-edit-contract.test.ts \
  test/hashline-grep-contract.test.ts \
  test/hashline-read-contract.test.ts \
  test/hashline-sg-contract.test.ts \
  test/python-tool-contract.test.ts \
  test/rpc-protocol.test.ts \
  test/tool-adapters.test.ts \
  test/tool-wrapper.test.ts \
  test/utils.test.ts
```

Optional confidence replay:
```bash
npm test
```

### Prepare the manual PR opening
- Review the diff and confirm the branch only adds the metadata/helper/docs layer on top of PR 1.
- Inspect `test/utils.test.ts` specifically and drop unrelated carry-over hunks if they are not part of the intended metadata/policy story.
- Commit locally with a title aligned to the planned narrative.
- Push the branch manually.
- Open the upstream PR manually with PR 1 as the base if maintainers prefer stacked review.
- Use the draft in `18-01-PR2-MATERIALS.md` for the title, summary, non-goals, follow-ups, and reviewer notes.

## Explicit exclusions
Never carry these into either review branch unless a later explicit decision reverses the exclusion:
- `.paul/**`
- `.gitignore` changes related only to `.paul/handoffs/`
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
- version bumping, `CHANGELOG.md`, CI setup, publish/release packaging
- adjacent-repo work such as `pi-codegraph` metadata fixes

## Final review reminders
- If a file is not in the approved PR 1 or PR 2 candidate surface, exclude it by default.
- Preserve the approved 2-PR split: runtime seam first, metadata/helper/docs second.
- Keep reviewer-facing claims anchored to the retained focused verification surface.
- Do not rely on the mixed branch history as part of the upstream narrative; the review branches are the source of truth for submission.
