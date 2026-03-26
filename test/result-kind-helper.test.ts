const test = require("node:test");
import type {} from "node:test";
const assert = require("node:assert/strict");
const childProcess = require("node:child_process");
const { CodeExecutor } = require("../dist/code-executor.js");
const { PtcPythonError } = require("../dist/execution/execution-errors.js");

function createExecutor(payload: Record<string, unknown>) {
  const sandboxManager = {
    spawn(code: string, cwd: string) {
      return childProcess.spawn("python3", ["-u", "-c", code], {
        cwd,
        env: { ...process.env },
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
        tools: [
          {
            name: "emit_value",
            description: "Emit a deterministic structured value",
            parameters: {
              type: "object",
              properties: {},
              required: [],
            },
            source: "custom",
            isReadOnly: true,
          },
        ],
        runTool: async (toolName: string) => {
          assert.equal(toolName, "emit_value");
          return {
            content: [{ type: "text", text: JSON.stringify(payload) }],
            details: {
              ptcValue: payload,
            },
          };
        },
      };
    },
  };

  return new CodeExecutor(
    sandboxManager,
    toolRegistry,
    {
      executionTimeoutMs: 10_000,
      maxOutputChars: 10_000,
      allowMutations: false,
      allowBash: false,
      maxParallelToolCalls: 4,
      useDocker: false,
      allowUnsandboxedSubprocess: true,
      debugLogging: false,
      trustedReadOnlyTools: undefined,
      callableTools: undefined,
      blockedTools: undefined,
    },
    process.cwd()
  );
}

test("ptc.expect_kind returns the original structured value for matching kinds", async () => {
  const executor = createExecutor({ kind: "response", responseId: "resp_123", title: "Example" });

  const result = await executor.execute(
    [
      "result = await emit_value()",
      'validated = ptc.expect_kind(result, "response")',
      "return {",
      '  "same_object": validated is result,',
      '  "kind": validated["kind"],',
      '  "responseId": validated["responseId"],',
      "}",
    ].join("\n"),
    {
      cwd: process.cwd(),
      ctx: { cwd: process.cwd() },
    }
  );

  assert.deepEqual(JSON.parse(result.output), {
    same_object: true,
    kind: "response",
    responseId: "resp_123",
  });
});

test("ptc.expect_kind raises a clear mismatch error for the wrong kind", async () => {
  const executor = createExecutor({ kind: "file", filePath: "/tmp/example.txt" });

  await assert.rejects(
    executor.execute(
      [
        "result = await emit_value()",
        'ptc.expect_kind(result, "response")',
        "return 'unreachable'",
      ].join("\n"),
      {
        cwd: process.cwd(),
        ctx: { cwd: process.cwd() },
      }
    ),
    (error: InstanceType<typeof PtcPythonError>) => {
      assert.ok(error instanceof PtcPythonError);
      assert.match(error.rawMessage, /Expected kind 'response', got 'file'/);
      return true;
    }
  );
});

test("ptc.expect_kind raises a clear error when the top-level kind is missing", async () => {
  const executor = createExecutor({ responseId: "resp_123" });

  await assert.rejects(
    executor.execute(
      [
        "result = await emit_value()",
        'ptc.expect_kind(result, "response")',
        "return 'unreachable'",
      ].join("\n"),
      {
        cwd: process.cwd(),
        ctx: { cwd: process.cwd() },
      }
    ),
    (error: InstanceType<typeof PtcPythonError>) => {
      assert.ok(error instanceof PtcPythonError);
      assert.match(error.rawMessage, /Expected kind 'response', but value has missing top-level kind/);
      return true;
    }
  );
});
