import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const EXPECTED_PACKAGE_NAME = "pi-ptc-advanced";
const EXPECTED_VERSION = "0.16.0";
const EXPECTED_RELEASE_DOC = `docs/releases/${EXPECTED_VERSION}.md`;

function resolveFromRoot(rel: string): string {
  return fileURLToPath(new URL(`../${rel}`, import.meta.url));
}

function read(rel: string): string {
  return readFileSync(resolveFromRoot(rel), "utf-8");
}

function exists(rel: string): boolean {
  return existsSync(resolveFromRoot(rel));
}

test("package.json targets pi-ptc-advanced@0.16.0", () => {
  const pkg = JSON.parse(read("package.json")) as { name?: string; version?: string };
  assert.equal(pkg.name, EXPECTED_PACKAGE_NAME);
  assert.equal(pkg.version, EXPECTED_VERSION);
});

test("package-lock.json root metadata is aligned to 0.16.0", () => {
  const lock = JSON.parse(read("package-lock.json")) as {
    name?: string;
    version?: string;
    packages?: Record<string, { name?: string; version?: string }>;
  };
  assert.equal(lock.name, EXPECTED_PACKAGE_NAME);
  assert.equal(lock.version, EXPECTED_VERSION);
  const rootEntry = lock.packages?.[""];
  assert.ok(rootEntry, "lockfile root package entry missing");
  assert.equal(rootEntry?.name, EXPECTED_PACKAGE_NAME);
  assert.equal(rootEntry?.version, EXPECTED_VERSION);
});

test("scripts/verify-release-package.sh asserts the 0.16.0 baseline", () => {
  const script = read("scripts/verify-release-package.sh");
  assert.ok(
    script.includes(`pkg.version !== '${EXPECTED_VERSION}'`),
    "verify-release-package.sh must check version 0.16.0",
  );
  assert.ok(
    script.includes(`expected version ${EXPECTED_VERSION}`),
    "verify-release-package.sh must reference version 0.16.0 in its error text",
  );
  assert.ok(
    !script.includes("0.15.0"),
    "verify-release-package.sh must not reference stale 0.15.0",
  );
  // Preserve existing safety scaffolding.
  assert.ok(script.includes("set -euo pipefail"), "must keep strict shell mode");
  assert.ok(script.includes("pkg.name !== 'pi-ptc-advanced'"), "must keep package name check");
});

test("docs/releases/0.16.0.md exists and describes Milestone 17 outcomes", () => {
  assert.ok(exists(EXPECTED_RELEASE_DOC), `${EXPECTED_RELEASE_DOC} must exist`);
  const note = read(EXPECTED_RELEASE_DOC);
  assert.ok(/0\.16\.0/.test(note), "release note must mention 0.16.0");
  assert.ok(
    /Mario/i.test(note) || /mariozechner/i.test(note),
    "release note must mention Mario-scope Pi alignment",
  );
  assert.ok(
    /prompt|code_execution/i.test(note),
    "release note must mention prompt metadata / code_execution work",
  );
  assert.ok(/audit/i.test(note), "release note must mention the dependency-audit caveat");
  assert.ok(
    !/clean audit|hard migration to @earendil-works/i.test(note),
    "release note must not claim a clean audit or a hard @earendil-works/* migration",
  );
});

test("README references the 0.16.0 release baseline and release note", () => {
  const readme = read("README.md");
  assert.ok(
    readme.includes(`${EXPECTED_PACKAGE_NAME}@${EXPECTED_VERSION}`),
    "README must reference pi-ptc-advanced@0.16.0",
  );
  assert.ok(
    readme.includes(`docs/releases/${EXPECTED_VERSION}.md`),
    "README must link to the 0.16.0 release note",
  );
  assert.ok(
    !readme.includes(`${EXPECTED_PACKAGE_NAME}@0.15.0`),
    "README must not describe pi-ptc-advanced@0.15.0 as the active baseline",
  );
});

test("CHANGELOG promotes the 0.16.0 release and records the audit caveat", () => {
  const changelog = read("CHANGELOG.md");
  assert.ok(
    /^## 0\.16\.0/m.test(changelog),
    "CHANGELOG must contain a 0.16.0 release section",
  );
  const section = changelog.split(/^## 0\.16\.0/m)[1] ?? "";
  assert.ok(/audit/i.test(section), "0.16.0 section must mention the audit caveat");
  assert.ok(
    /(Mario|mariozechner|compatibility|prompt)/i.test(section),
    "0.16.0 section must reference compatibility/prompt work",
  );
});

test("docs/personal-fork-maintenance.md targets the 0.16.0 baseline", () => {
  const runbook = read("docs/personal-fork-maintenance.md");
  assert.ok(
    runbook.includes(`${EXPECTED_PACKAGE_NAME}@${EXPECTED_VERSION}`),
    "runbook must reference pi-ptc-advanced@0.16.0",
  );
  assert.ok(
    runbook.includes(`releases/${EXPECTED_VERSION}.md`),
    "runbook must link to the 0.16.0 release note",
  );
  assert.ok(
    !runbook.includes(`${EXPECTED_PACKAGE_NAME}@0.15.0`),
    "runbook must not describe pi-ptc-advanced@0.15.0 as the active baseline",
  );
});
