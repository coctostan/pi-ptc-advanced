---
phase: 45-pi-api-and-documentation-delta-audit
plan: 03
type: fix
depends_on: [45-02]
completed: 2026-05-11
result: PASS
---

## Fix Summary

**Issue:** Fix 45-02 unblocked the `.ts` test loader by bumping the
Actions Node version 20→22, which surfaced 26 pre-existing CI
environment failures (181 pass / 26 fail). Three classes:

1. **5 ungitignored eval fixture files** that the seeded recipe /
   benchmark tests read.
2. **`pi-hashline-readmap` missing** from the CI environment, so
   hashline contract tests could not resolve it.
3. **`ast-grep` (`sg`)** and (last-mile) **`difftastic` (`difft`)** not
   on CI `PATH`, so `hashline-real-interop` and the
   `semanticSummary.difftasticAvailable` README contract failed.

**Mode:** Standard fix (PALS /paul:fix side loop). FIX.md authored at
`.paul/phases/45-pi-api-and-documentation-delta-audit/45-03-FIX.md`.

**Result:** PASS. CI `Verify release baseline` now reports **SUCCESS**
on both runs; **207/207 tests pass**; PR #1 is mergeable; Phase 45's
merge gate is clear; `require_pr_before_next_phase: true` no longer
blocks Phase 46.

### Files Changed

| File | Change |
|------|--------|
| `.github/workflows/ci.yml` | Added 3 install steps (`@ast-grep/cli`, `difftastic 0.69.0` prebuilt linux-gnu binary, and a sibling clone+install of `pi-hashline-readmap`) and exported `PI_HASHLINE_READMAP_ROOT` |
| `.pi/evals/ptc/baselines/local__seeded__recipes.json` | Force-added (was ungitignored) |
| `.pi/evals/ptc/recipes/codegraph-web-evidence-merge.py` | Force-added |
| `.pi/evals/ptc/recipes/graph-compact-ranking.py` | Force-added |
| `.pi/evals/ptc/recipes/hashline-anomaly-summary.py` | Force-added |
| `.pi/evals/ptc/recipes/web-answer-comparison.py` | Force-added |
| `.paul/phases/45-pi-api-and-documentation-delta-audit/45-03-FIX.md` | New FIX artifact |

No `src/**`, `test/**`, `package.json`, or product-docs changes.

### Verification

| Check | Result |
|---|---|
| `git ls-files .pi/evals/ptc/baselines/ .pi/evals/ptc/recipes/` lists all 5 fixture files | PASS |
| `.github/workflows/ci.yml` installs `@ast-grep/cli`, `difftastic`, and clones `pi-hashline-readmap` with `npm install` | PASS |
| `npm run build` passes locally | PASS (0 units compiled) |
| CI `Verify release baseline` reports SUCCESS on PR #1 | PASS (both runs SUCCESS) |
| PR #1 mergeable | PASS (`mergeable: MERGEABLE`) |
| Suite stats | 207 pass / 0 fail (was 181/26 after Fix 45-02; was 0/0 before Fix 45-02) |

### Execution Story

The fix was executed in four commits inside this FIX loop because each
push revealed the next bounded blocker:

1. `623ad2f fix(ci): install ast-grep + pi-hashline-readmap, add missing
    eval fixtures (45-03)` — Task 1 + initial Task 2. Result: 181→198 pass,
    9 fail (Class 1 fully fixed; Class 2 still failing because
    `require.resolve("pi-hashline-readmap")` does not search the npm
    global prefix from project `node_modules`).
2. `142e3f1 fix(ci): export PI_HASHLINE_READMAP_ROOT after global install`
    — point the test's first candidate at the global install path.
    Result: 198 pass / 9 fail. Error class changed to
    `ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING` because Node 22
    refuses to type-strip `.ts` files inside `node_modules`.
3. `38876f4 fix(ci): clone pi-hashline-readmap as sibling repo (not npm
    global)` — match the local dev layout so the test loader resolves
    the package outside `node_modules`. Result: 198 pass / 9 fail.
    Error class changed to
    `Cannot find package '@mariozechner/pi-coding-agent'` because the
    sibling clone had no `node_modules`.
4. `d19b426 fix(ci): npm install in pi-hashline-readmap sibling clone`
    — install the clone's own peer deps. Result: **206 pass / 1 fail**.
    Last failure: `semanticSummary.difftasticAvailable: false` vs README
    `true` because `difftastic` was not installed on the runner.
5. `15d95b3 fix(ci): install difftastic so semantic-edit tests match
    README payload` — download the prebuilt `difft 0.69.0` linux-gnu
    binary. Result: **207/207 pass / 0 fail; CI SUCCESS.**

Each step ran the official `<verify>` (CI status poll) and only the
next narrow follow-up was added — no scope creep into runtime/test
code.

### Result

CI green. PR #1 is mergeable. Phase 45 merge gate clear.

### Module Execution Reports

- `[dispatch] post-apply: WALT — PASS — npm run build clean; CI now reports 207/207 PASS (was 181/26 after Fix 45-02).`
- `[dispatch] post-apply: DAVE — INFO — CI workflow gained 3 install steps (ast-grep, difftastic, pi-hashline-readmap sibling clone + npm install) and exports PI_HASHLINE_READMAP_ROOT.`
- `[dispatch] post-apply: SETH — PASS — no executable code or dependency-version changes; pinned pi-hashline-readmap@^0.8.6 and difftastic 0.69.0 are added to CI install only.`
- `[dispatch] post-apply: IRIS — PASS — no TODO/FIXME markers introduced.`
- `[dispatch] post-apply: DOCS — PASS — README and product docs untouched.`
- `[dispatch] post-apply: TODD — PASS — full 207-test suite now exercises on every CI run; Class 1/2/3 gaps closed.`
- `[dispatch] post-apply: DEAN — INFO — three new external deps invoked in CI; pinned versions; not added to runtime package.json.`
- `[dispatch] post-unify: IRIS — PASS — FIX summary records bounded outcome and per-commit progression.`
- `[dispatch] post-unify: DOCS — PASS — only .paul/* and .github/workflows/ci.yml and .pi/evals/ptc/{baselines,recipes}/* touched.`
- `[dispatch] post-unify: SKIP — PASS — knowledge captured: CI env now has ast-grep, difftastic, and a sibling pi-hashline-readmap clone with its own node_modules; force-added eval fixtures are now tracked even though .gitignore:8 still ignores .pi/ by default.`
- `[dispatch] post-unify: WALT — PASS — quality baseline holds; CI green; merge gate clear.`
- `[dispatch] post-unify: DEAN — DEFERRED — Phase 45 baseline at .paul/dean-baseline.json still authoritative.`

### Side Effects

- `.gitignore` is unchanged; the 5 fixture files are tracked despite
  `.pi/` being ignored. If future Pi or PALS tooling regenerates
  `.gitignore` rules, the force-added files will remain tracked but new
  files under `.pi/evals/ptc/baselines/` or `.pi/evals/ptc/recipes/`
  will need similar `git add -f` discipline. Recorded for Phase 48 in
  case a release-readiness regeneration touches `.gitignore`.

### Next

PR #1 merge gate is clear. Recommended next move is the Phase 45 UNIFY
merge-gate finalization: merge PR #1 with `squash` (per `pals.json`
`merge_method: squash`), then route to `/paul:plan` for Phase 46.
