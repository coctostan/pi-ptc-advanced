# PR 2 Materials — Metadata, Helper Contracts, and Docs Slice

## Suggested title
`feat(ptc): document and validate callable tool metadata for structured Python workflows`

## Depends on
PR 1 — `feat(ptc): use active Pi tool implementations in code_execution`

This PR assumes the runtime seam from PR 1 is already in place. PR 2 does not re-argue that foundation; it documents, types, normalizes, and verifies the layered metadata/helper/runtime contract that sits on top of it.

## One-paragraph summary
This PR adds the maintainer-facing contract around callable extension tools and structured Python workflows. It documents explicit `ptc.callable` / `ptc.policy` behavior, aligns Python helper/runtime contracts with the live structured payload surface, and adds focused regression coverage around default exposure, runtime normalization, RPC passthrough, and hashline-style structured results.

## Scope
Approved Phase 16 PR 2 candidate surface:
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

## What this PR argues
- extension tools need explicit callable/safety metadata for nested execution
- Python helper contracts should reflect the structured runtime surface instead of forcing prompt guesswork
- runtime normalization should preserve `details.ptcValue` as the machine-native contract when present
- maintainer-facing docs should state the conservative default posture clearly: custom/extension tools are not Python-callable by default, and mutating access stays gated

## What PR 2 adds on top of PR 1
PR 1 establishes that nested execution can use the active tool implementations.
PR 2 adds:
- explicit callable/policy metadata semantics and legacy compatibility behavior
- clearer Python helper contracts and generated wrapper typing
- RPC/runtime normalization details for structured payload passthrough
- maintainer-facing README guidance and focused contract coverage

## Expected branch construction
Create this review branch from the PR 1 review branch and restore the approved file set:

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

## Verification
Recommended focused verification for this PR:

```bash
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

Optional full confidence replay:

```bash
npm test
```

Optional diff audit before opening the PR:

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

## Suggested PR body
### What changed
- documented `ptc.callable` / `ptc.policy` and caller-routing expectations in README
- aligned Python helper/runtime contracts with structured nested payloads
- preserved `details.ptcValue` passthrough and related normalization behavior through the runtime/RPC layers
- added focused tests for default exposure, structured hashline contracts, wrappers, adapters, RPC behavior, and helper guidance

### Why this matters
Once PR 1 establishes the active runtime seam, maintainers need an explicit contract for which extension tools are callable from Python, how safety policy is enforced, and what structured payloads nested execution can rely on.

## Non-goals
- no new runtime seam or architecture change beyond what PR 1 already established
- no broadening of default callable exposure or mutating access
- no branch automation, PR automation, or CI/release packaging work
- no local-only combined-stack docs or personal launcher/profile support
- no adjacent-repo codegraph compatibility fixes

## Follow-ups
- eventual removal of the temporary executor bridge when Pi exposes `getToolExecutor()`
- version bump and release packaging
- `CHANGELOG.md`
- CI pipeline work
- optional promotion of the heavy real-runtime harness if maintainers want package-real proof later
- adjacent `pi-codegraph` metadata adoption if that repo’s read-only tools should be callable via PTC

## Explicit exclusions
Do not include these in PR 2:
- `.paul/**`
- `.gitignore` changes related only to `.paul/handoffs/`
- `pals.json`
- `scripts/start-pi-ptc-full-tools.sh`
- `docs/hashline-integration/**`
- `test/e2e-agent-harness.sh`
- `test/hashline-real-interop.mjs`
- `test/hashline-real-interop.test.ts`
- version bumping, `CHANGELOG.md`, CI setup, release packaging

## Caution on `test/utils.test.ts`
Phase 15/16 treated `test/utils.test.ts` as upstream-worthy in principle because it backs env/policy parsing behavior, but later phase summaries also called out pre-existing unrelated carry-over state in that file. Before opening PR 2, inspect the exact diff for `test/utils.test.ts` on the review branch and keep only the hunks that are genuinely part of the metadata/policy story.

## Reviewer notes
- This PR is intentionally stacked on PR 1.
- README language should stay aligned with the live structured payload surface and the focused tests, not broaden the contract beyond what the runtime actually exposes.
- The conservative default policy is part of the feature: extension tools are opt-in for Python callability, and mutating tools remain gated by metadata plus runtime policy.
