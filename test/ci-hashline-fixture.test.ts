{
const test = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");

const workflow = readFileSync(path.resolve(__dirname, "../.github/workflows/ci.yml"), "utf8");
const fixtureStep = workflow
  .split("      - name: Clone and install pi-hashline-readmap as sibling repo\n")[1]
  ?.split(/\n      - name:/)[0];

// This fixture exercises the existing Sinclair TypeBox and README payload contracts.
const fixtureTag = "v0.8.16";
const fixtureCommit = "f1234813c5f2ea0a0476143b41a59cf2094e945b";

test("CI hashline fixture uses a compatible tag without a floating fallback", () => {
  assert.ok(fixtureStep, "hashline fixture setup step is missing");
  assert.ok(fixtureStep.includes(`git clone --depth 1 --branch ${fixtureTag} `));
  assert.doesNotMatch(fixtureStep, /\|\||continue-on-error|\|\s*true/);
});

test("CI verifies the exact hashline commit before installing and running tests", () => {
  assert.ok(fixtureStep, "hashline fixture setup step is missing");
  const identityCheck = `test "$(git -C ../pi-hashline-readmap rev-parse HEAD)" = ${fixtureCommit}`;
  const checkIndex = fixtureStep.indexOf(identityCheck);
  const installIndex = fixtureStep.indexOf("npm install --no-audit --no-fund");
  assert.ok(checkIndex >= 0, "fixture must verify its immutable commit");
  assert.ok(installIndex > checkIndex, "fixture identity must be verified before installation");
  assert.ok(fixtureStep.includes("PI_HASHLINE_READMAP_ROOT=$GITHUB_WORKSPACE/../pi-hashline-readmap"));
  assert.ok(workflow.includes("run: npm run verify:ci"));
});
}
