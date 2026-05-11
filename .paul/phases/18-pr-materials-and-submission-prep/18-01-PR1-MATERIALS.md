# PR 1 Materials — Runtime Interop Slice

## Suggested title
`feat(ptc): use active Pi tool implementations in code_execution`

## One-paragraph summary
This PR makes `code_execution` use the same active Pi tool implementations that the user sees in chat instead of a split-brain nested tool surface. It keeps callable-policy behavior conservative, preserves structured machine-native results across the nested RPC boundary, and adds focused proof that the active runtime seam works for hashline-style overrides.

## Problem
Before this slice, nested Python execution could diverge from the active tool implementations visible in chat. That weakens trust in `code_execution`, especially when active overrides provide richer structured payloads than the fallback builtin behavior.

## Solution
- resolve active tool implementations into the PTC callable runtime
- keep the runtime seam narrow and provider-agnostic
- preserve structured nested results instead of collapsing them back into prose
- verify the seam with focused runtime tests rather than a heavy package-real harness in the first upstream pass

## Scope
Approved Phase 16 PR 1 candidate surface:
- `src/tool-registry.ts`
- `src/code-executor.ts`
- `src/index.ts`
- `src/contracts/tool-types.ts`
- `test/tool-registry.test.ts`
- `test/hashline-interop-smoke.test.ts`

## Why these files stay together
- `src/tool-registry.ts`, `src/code-executor.ts`, and `src/index.ts` are the core runtime seam.
- `src/contracts/tool-types.ts` carries shared execution metadata needed by that seam and is cleaner to review with the runtime path than as a later split-out.
- `test/tool-registry.test.ts` and `test/hashline-interop-smoke.test.ts` are the narrowest retained proof that the active executor path and structured passthrough behavior actually work.

## Reviewer rationale
This should land first because it is the architectural foundation for the rest of the milestone.
- It carries the central product claim: `code_execution` should execute the same active Pi tool implementations visible in chat.
- It improves correctness without broadening mutating access or weakening safety policy.
- It gives PR 2 a stable runtime seam to build on when documenting metadata, helper contracts, and maintainer-facing guidance.

## Expected branch construction
Create this review branch from `origin/main` and restore only the approved file set:

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

## Verification
Recommended focused verification for this PR:

```bash
npm run build
node --test test/tool-registry.test.ts test/hashline-interop-smoke.test.ts
```

Optional confidence replay before opening the PR:

```bash
git diff --name-only origin/main...HEAD -- \
  src/tool-registry.ts \
  src/code-executor.ts \
  src/index.ts \
  src/contracts/tool-types.ts \
  test/tool-registry.test.ts \
  test/hashline-interop-smoke.test.ts
```

## Suggested PR body
### What changed
- wired `code_execution` to the same active Pi tool implementations exposed in chat
- preserved structured nested results when active tools return machine-native payloads
- kept callable-policy behavior conservative while resolving runtime executors
- added focused regression proof for active override execution and structured passthrough

### Why this matters
`code_execution` becomes trustworthy for real nested tool workflows because it no longer runs against a different effective tool surface than the user sees directly.

## Non-goals
- no metadata/policy documentation expansion beyond what this runtime seam strictly needs
- no broad Python helper ergonomics work beyond what is required by the runtime seam
- no heavy real-runtime harness promotion in the first upstream pass
- no personal launcher/profile support
- no adjacent-repo compatibility work such as `pi-codegraph` metadata fixes
- no automatic expansion of mutating tool exposure

## Explicit exclusions
Do not include these in PR 1:
- `.paul/**`
- `.gitignore` changes related only to `.paul/handoffs/`
- `pals.json`
- `scripts/start-pi-ptc-full-tools.sh`
- `docs/hashline-integration/**`
- `test/e2e-agent-harness.sh`
- `test/hashline-real-interop.mjs`
- `test/hashline-real-interop.test.ts`
- version bumping, `CHANGELOG.md`, CI setup, release packaging

## Follow-up items that belong outside PR 1
- PR 2: explicit `ptc.callable` / `ptc.policy`, helper/runtime contracts, focused docs/tests
- optional heavy real-runtime harness evidence if maintainers want it later
- eventual bridge teardown when Pi exposes `getToolExecutor()`
- adjacent `pi-codegraph` metadata adoption if those read-only tools should be callable from PTC

## Reviewer notes
- This PR is intentionally narrow and is the first half of an approved 2-PR split.
- The implementation uses the temporary active-executor bridge already documented for reviewers; teardown is deferred until Pi exposes `getToolExecutor()`.
- The submission path should use restore-based review branches from `origin/main`, not cherry-picks from the mixed working branch.
