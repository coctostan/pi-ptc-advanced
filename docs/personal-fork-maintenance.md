# Personal Fork Maintenance

This document is the maintainer runbook for the personal `pi-ptc-next` fork.

It covers the repo-local workflow that should remain stable across sessions:
- start Pi with the preferred personal analysis profile
- run the routine verification bundle for day-to-day checks
- run the full verification bundle when confidence needs to be higher
- handle sync and upgrade work as explicit manual git operations instead of hidden automation

## Day-to-day workflow

### 1. Start Pi with the personal analysis profile

From the repo root:

```bash
./scripts/start-pi-ptc-full-tools.sh
```

That launcher keeps mutations and bash disabled for `code_execution`, requests `sg` plus selected graph tools, and leaves `edit`, `write`, `bash`, `resolve_edge`, and `delete_edge` out of the Python surface on purpose.

If Pi does not expose one of the requested read-only tools to PTC in the current session, PTC will warn and keep that tool unavailable. The launcher is an environment/profile helper only; it does not change git state or install dependencies.

### 2. Run routine verification

For normal local maintenance, use the focused verification entrypoint:

```bash
npm run verify:personal
```

Current focused coverage:
- `npm run build`
- `node --test test/tool-registry.test.ts test/hashline-default-exposure.test.ts test/utils.test.ts test/hashline-interop-smoke.test.ts`

Use this after routine local changes, dependency refreshes that are expected to be low risk, or Pi/tool-surface checks.

### 3. Run the higher-confidence verification path when needed

For larger updates or before treating the fork as revalidated, run:

```bash
npm run verify:personal:full
```

This currently runs the full repo test path via `npm test`.

Use the full path when:
- you changed multiple files
- you updated dependencies
- you rebased onto a newer upstream or fork base
- Pi changed in a way that may affect runtime/tool visibility

## Manual sync and upgrade boundary

Phase 20 intentionally keeps git and remote operations manual.

That means this repo documents the process, but does **not** automate:
- remote creation
- fetch/rebase strategy
- branch selection
- push / force-push
- PR creation or merge

Those steps stay user-directed because they depend on your remotes, branch policy, and tolerance for history rewriting.

### Suggested manual sync checklist

If you maintain this fork against another branch or upstream repository, use an explicit flow such as:

```bash
# inspect remotes and current branch
git remote -v
git branch --show-current

# fetch whichever remote you treat as the source of truth
git fetch origin
# or: git fetch upstream

# rebase or merge manually according to your preference
# example only:
# git rebase origin/main

# then re-run repo-local verification
npm run verify:personal
npm run verify:personal:full
```

If a rebase or merge needs conflict resolution, handle that manually first, then re-run verification before pushing anything.

## What this phase does not automate

The following remain out of scope here:
- release/version bumping
- CHANGELOG maintenance
- CI pipeline setup
- PR automation
- reopening the archived upstream-submission prep flow (see `.paul/milestones/0.6.0-UPSTREAM-PR-ARTIFACTS.md` for historical reference only)
Those are separate concerns from the basic local maintenance workflow.

## Quick reference

```bash
# start the preferred local Pi profile
./scripts/start-pi-ptc-full-tools.sh

# routine maintenance verification
npm run verify:personal

# higher-confidence verification
npm run verify:personal:full
```

## Related files

- `scripts/start-pi-ptc-full-tools.sh`
- `scripts/verify-personal-fork.sh`
- `README.md`
