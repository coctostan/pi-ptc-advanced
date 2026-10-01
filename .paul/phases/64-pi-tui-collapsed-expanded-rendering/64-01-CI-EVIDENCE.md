# Phase 64 CI evidence — merge blocked

Observed during UNIFY on 2026-10-01 after user approved reconciliation (`1`). Evidence only; no CI repair or merge approval.

## Repository / commands

Configured target: pals.json.git.remote = https://github.com/coctostan/pi-ptc-advanced.git. Shared guard: `gh repo view --json nameWithOwner --jq .nameWithOwner` matched coctostan/pi-ptc-advanced before gh commands.

Read-only commands:
- `gh pr view 23 --repo coctostan/pi-ptc-advanced --json url,state,statusCheckRollup`
- `gh run view 36803707293 --repo coctostan/pi-ptc-advanced --log-failed`
- `gh run list --repo coctostan/pi-ptc-advanced --branch main --limit 3 --json databaseId,headSha,conclusion,status,url`
- `gh run view 36799864386 --repo coctostan/pi-ptc-advanced --log-failed`

## PR #23

https://github.com/coctostan/pi-ptc-advanced/pull/23 is OPEN. Both Verify release baseline checks failed:
- https://github.com/coctostan/pi-ptc-advanced/actions/runs/36803676233
- https://github.com/coctostan/pi-ptc-advanced/actions/runs/36803707293

Socket Security: Project Report and Pull Request Alerts both SUCCESS. Security success is not CI success.

Detailed run 36803707293: repository focused verification 29 tests / 29 pass / 0 fail; full suite 276 tests / 274 pass / 2 fail / 0 skipped, exit 1. No release-package success inferred after failing full-suite step.

Failures:
1. `README read example exactly matches the normalized live payload`, test/hashline-read-contract.test.ts:169: ERR_ASSERTION. Expected README payload includes `continuation: null` and symbol `tier: 'exact'`; actual live payload omits them. Assertion excerpt:
   ```text
   + actual - expected
   -   continuation: null,
   ...
   -     tier: 'exact'
   ```
2. `real hashline interop harness runs sg -> read(symbol) -> edit -> grep through code_execution`, test/hashline-real-interop.test.ts:7: subprocess exits with PtcPythonError/ToolCallError `Unknown type`; stack points to @sinclair/typebox Value.Check and src/tool-registry.ts:110 validateToolParams / :464 RpcProtocol.runTool. Log also warns sg is unavailable in the session. Root cause not established by UNIFY.

## Current main comparison

Latest main run https://github.com/coctostan/pi-ptc-advanced/actions/runs/36799864386 at exact pre-Phase-64 base 1aed19a5f25c0c4f687d6521c07fa043df5a3b54 also failed. Focused verification 29/29; full suite 268 tests / 264 pass / 4 fail:
- grep live payload shape and TypedDict coverage stay aligned
- README grep example exactly matches the normalized live payload
- README read example exactly matches the normalized live payload (same continuation/tier mismatch)
- real hashline interop harness runs sg -> read(symbol) -> edit -> grep through code_execution (Unknown type)

The two PR failures therefore existed on the exact base in CI. Do not attribute the other two disappearing failures to the renderer or claim hermetic equivalence: CI clones a sibling hashline repo (tag v0.8.6 with unpinned fallback) and installs dependencies. That external environment may vary between runs; no new base CI run was triggered.

## Separate local evidence / consequence

APPLY-LOG documents local Node v26.7.0 baseline 259 pass / 9 unsupported --experimental-transform-types failures -> 267 pass / same nine failures, focused 41/41. CI is configured for Node 22 and reveals actual hashline integration/fixture failures; these are not the local unsupported-option failure mechanism.

CI remains a strict GitHub Flow blocker even when failures predate Phase 64. No merge-anyway, silent baseline waiver, source/README/CI edits, spec amendment, or Phase 65 transition authorized by these observations. Repair needs a separately scoped action after UNIFY routing; root-cause diagnosis is not complete.
