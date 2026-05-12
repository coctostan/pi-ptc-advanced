import test from "node:test";
import assert from "node:assert/strict";
import { execSync, spawn } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { tmpdir } from "node:os";
import { CodeExecutor } from "../dist/code-executor.js";
import { PtcPythonError } from "../dist/execution/execution-errors.js";

function createExecutor() {
  const workspace = mkdtempSync(path.join(tmpdir(), "ptc-run-tests-"));
  const toolRegistry = {
    createCallableToolRuntime() {
      return {
        tools: [],
        runTool: async (toolName: string) => {
          throw new Error(`Unexpected tool call: ${toolName}`);
        },
      };
    },
  };
  const sandboxManager = {
    spawn(code: string, cwd: string) {
      return spawn("python3", ["-u", "-c", code], { cwd, env: { ...process.env } });
    },
    getRuntimeWorkspaceRoot(cwd: string) {
      return cwd;
    },
    async cleanup() {},
  };

  const executor = new CodeExecutor(
    sandboxManager,
    toolRegistry as any,
    {
      executionTimeoutMs: 30_000,
      maxOutputChars: 16_000,
      allowMutations: false,
      allowBash: false,
      maxParallelToolCalls: 4,
      useDocker: false,
      allowUnsandboxedSubprocess: true,
      debugLogging: false,
      autoRoute: false,
      trustedReadOnlyTools: undefined,
      callableTools: undefined,
      blockedTools: undefined,
    },
    process.cwd()
  );

  return { executor, workspace };
}


function writePassingFixture(workspace: string, basename = "passing.test.js"): string {
  const filePath = path.join(workspace, basename);
  writeFileSync(
    filePath,
    `const test = require('node:test');\n` +
      `const assert = require('node:assert/strict');\n` +
      `test('runtests helper passing case', () => { assert.equal(1 + 1, 2); });\n`,
    "utf8"
  );
  return filePath;
}

function writeFailingFixture(workspace: string, basename = "failing.test.js"): string {
  const filePath = path.join(workspace, basename);
  writeFileSync(
    filePath,
    `const test = require('node:test');\n` +
      `test('runtests helper failing case', () => { throw new Error('intentional boom'); });\n`,
    "utf8"
  );
  return filePath;
}

test("ptc.run_tests returns a structured ptc_report for passing Node test files", async () => {
  const { executor, workspace } = createExecutor();
  writePassingFixture(workspace);

  const result = await executor.execute(
    `report = ptc.run_tests("passing.test.js")\nreturn report\n`,
    { cwd: workspace, ctx: { cwd: workspace } as any }
  );

  const output = JSON.parse(result.output);
  assert.equal(output.kind, "ptc_report");
  assert.equal(output.version, 1);
  assert.ok(typeof output.title === "string" && output.title.length > 0);
  assert.equal(output.metrics.runner_available, true);
  assert.equal(output.metrics.exit_code, 0);
  assert.equal(output.metrics.failed, 0);
  assert.ok(output.metrics.total >= 1);
  assert.ok(output.metrics.passed >= 1);
  assert.equal(output.metrics.pattern, "passing.test.js");
  assert.equal(output.metrics.cwd, ".");
  assert.equal(typeof output.metrics.command, "string");
  assert.ok(output.metrics.command.includes("node"));
  assert.ok(output.metrics.command.includes("--test"));
  assert.ok(output.metrics.command.includes("passing.test.js"));
  assert.equal(typeof output.metrics.duration_ms, "number");
  assert.equal(result.details.reportProduced, true);
  assert.deepEqual(result.details.report, output);

  // Reports must not leak absolute host paths.
  const serialized = JSON.stringify(output);
  assert.ok(!serialized.includes(workspace), "run_tests report should not include the absolute workspace path");
});

test("ptc.run_tests reports failing Node tests as report data, not Python errors", async () => {
  const { executor, workspace } = createExecutor();
  writeFailingFixture(workspace);

  const result = await executor.execute(
    `report = ptc.run_tests("failing.test.js")\nreturn report\n`,
    { cwd: workspace, ctx: { cwd: workspace } as any }
  );

  const output = JSON.parse(result.output);
  assert.equal(output.kind, "ptc_report");
  assert.equal(output.metrics.runner_available, true);
  assert.notEqual(output.metrics.exit_code, 0);
  assert.ok(output.metrics.failed >= 1, "failed count should be >= 1 for failing fixture");
  assert.equal(output.metrics.pattern, "failing.test.js");

  // A bounded failures table or sample must identify the failing test name.
  const tablesText = JSON.stringify(output.tables || []);
  const samplesText = JSON.stringify(output.samples || []);
  const combined = tablesText + samplesText;
  assert.ok(
    /runtests helper failing case/.test(combined),
    `expected failing test name in report tables/samples, got tables=${tablesText} samples=${samplesText}`
  );
});

test("ptc.run_tests rejects invalid patterns with a clear ValueError", async () => {
  const { executor, workspace } = createExecutor();

  await assert.rejects(
    executor.execute(`return ptc.run_tests("")\n`, {
      cwd: workspace,
      ctx: { cwd: workspace } as any,
    }),
    (error) => {
      assert.ok(error instanceof PtcPythonError);
      assert.match(error.message, /pattern must be a non-empty string|ValueError/i);
      return true;
    }
  );

  await assert.rejects(
    executor.execute(`return ptc.run_tests(123)\n`, {
      cwd: workspace,
      ctx: { cwd: workspace } as any,
    }),
    (error) => {
      assert.ok(error instanceof PtcPythonError);
      assert.match(error.message, /pattern must be a non-empty string|ValueError/i);
      return true;
    }
  );

  await assert.rejects(
    executor.execute(`return ptc.run_tests("/etc/passwd")\n`, {
      cwd: workspace,
      ctx: { cwd: workspace } as any,
    }),
    (error) => {
      assert.ok(error instanceof PtcPythonError);
      assert.match(error.message, /pattern|absolute|traversal|ValueError/i);
      return true;
    }
  );

  await assert.rejects(
    executor.execute(`return ptc.run_tests("../escape.test.js")\n`, {
      cwd: workspace,
      ctx: { cwd: workspace } as any,
    }),
    (error) => {
      assert.ok(error instanceof PtcPythonError);
      assert.match(error.message, /pattern|traversal|parent|ValueError/i);
      return true;
    }
  );
});

test("ptc.run_tests reports runner-unavailable as structured data when node is missing", async () => {
  const workspace = mkdtempSync(path.join(tmpdir(), "ptc-run-tests-norunner-"));
  writePassingFixture(workspace);

  // Build a PATH that intentionally excludes any directory containing `node` so
  // the subprocess invocation fails with FileNotFoundError and the helper falls
  // back to the runner-unavailable report shape. The python3 binary is launched
  // by absolute path so the executor itself still starts.
  const python3Path = String(execSync("command -v python3", { encoding: "utf8" })).trim();
  const sandboxManager = {
    spawn(code: string, cwd: string) {
      return spawn(python3Path, ["-u", "-c", code], {
        cwd,
        env: { ...process.env, PATH: "/var/empty" },
      });
    },
    getRuntimeWorkspaceRoot(cwd: string) {
      return cwd;
    },
    async cleanup() {},
  };
  const toolRegistry = {
    createCallableToolRuntime() {
      return {
        tools: [],
        runTool: async (toolName: string) => {
          throw new Error(`Unexpected tool call: ${toolName}`);
        },
      };
    },
  };

  const executor = new CodeExecutor(
    sandboxManager as any,
    toolRegistry as any,
    {
      executionTimeoutMs: 15_000,
      maxOutputChars: 16_000,
      allowMutations: false,
      allowBash: false,
      maxParallelToolCalls: 4,
      useDocker: false,
      allowUnsandboxedSubprocess: true,
      debugLogging: false,
      autoRoute: false,
      trustedReadOnlyTools: undefined,
      callableTools: undefined,
      blockedTools: undefined,
    },
    process.cwd()
  );

  const result = await executor.execute(
    `return ptc.run_tests("passing.test.js")\n`,
    { cwd: workspace, ctx: { cwd: workspace } as any }
  );

  const output = JSON.parse(result.output);
  assert.equal(output.kind, "ptc_report");
  assert.equal(output.metrics.runner_available, false);
  assert.equal(output.metrics.exit_code, null);
  assert.equal(output.metrics.total, 0);
  assert.equal(output.metrics.passed, 0);
  assert.equal(output.metrics.failed, 0);
  assert.equal(output.metrics.skipped, 0);
  assert.ok(
    Array.isArray(output.warnings) && output.warnings.some((w: string) => /node|runner/i.test(w)),
    "runner-unavailable report should include a warning mentioning node/runner"
  );
});

test("README documents ptc.run_tests as a Node-only test runner verb", () => {
  const readme = readFileSync(path.join(process.cwd(), "README.md"), "utf8");
  assert.match(
    readme,
    /ptc\.run_tests\(pattern\)/,
    "README must list ptc.run_tests(pattern) in the helper list"
  );
  assert.match(
    readme,
    /node --test/,
    "README must describe ptc.run_tests as a Node `node --test` helper"
  );
});

test("CHANGELOG records the Phase 53 test runner verb addition", () => {
  const changelog = readFileSync(path.join(process.cwd(), "CHANGELOG.md"), "utf8");
  assert.match(
    changelog,
    /ptc\.run_tests/,
    "CHANGELOG must mention ptc.run_tests"
  );
});
