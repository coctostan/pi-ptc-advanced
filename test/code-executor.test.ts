const test = require("node:test");
import type {} from "node:test";
const assert = require("node:assert/strict");
const { EventEmitter } = require("node:events");
const { PassThrough } = require("node:stream");
const childProcess = require("node:child_process");
const { PtcPythonError } = require("../dist/execution/execution-errors.js");
const { CodeExecutor } = require("../dist/code-executor.js");

test("CodeExecutor rejects asyncio.run before execution", async () => {
  const sandboxManager = {
    spawn() {
      throw new Error("spawn should not be reached");
    },
    getRuntimeWorkspaceRoot(cwd) {
      return cwd;
    },
    async cleanup() {},
  };
  const toolRegistry = {
    createCallableToolRuntime() {
      throw new Error("tool registry should not be reached");
    },
  };

  const executor = new CodeExecutor(
    sandboxManager,
    toolRegistry,
    {
      executionTimeoutMs: 1000,
      maxOutputChars: 1000,
      allowMutations: false,
      allowBash: false,
      maxParallelToolCalls: 4,
      callableTools: undefined,
      blockedTools: undefined,
    },
    process.cwd()
  );

  await assert.rejects(
    executor.execute("import asyncio\nasyncio.run(main())", {
      cwd: process.cwd(),
      ctx: { cwd: process.cwd() },
    }),
    /Top-level await is already available/
  );
});

test("CodeExecutor passes the current execution context to nested tools", async () => {
  const sandboxManager = {
    spawn() {
      throw new Error("spawn should not be reached");
    },
    getRuntimeWorkspaceRoot(cwd) {
      return cwd;
    },
    async cleanup() {},
  };

  let capturedExecution: { ctx?: unknown; parentToolCallId?: string } | null = null;
  const toolRegistry = {
    createCallableToolRuntime(_cwd, _settings, execution) {
      capturedExecution = execution;
      throw new Error("stop after capturing execution context");
    },
  };

  const executor = new CodeExecutor(
    sandboxManager,
    toolRegistry,
    {
      executionTimeoutMs: 1000,
      maxOutputChars: 1000,
      allowMutations: false,
      allowBash: false,
      maxParallelToolCalls: 4,
      callableTools: undefined,
      blockedTools: undefined,
    },
    process.cwd()
  );

  const currentCtx = { cwd: "/tmp/current", label: "current-context" };
  await assert.rejects(
    executor.execute("return 1", {
      cwd: currentCtx.cwd,
      ctx: currentCtx,
      parentToolCallId: "parent-1",
    }),
    /stop after capturing execution context/
  );
  assert.ok(capturedExecution);
  const executionContext = capturedExecution!;

  assert.equal(executionContext.ctx, currentCtx);
  assert.equal(executionContext.parentToolCallId, "parent-1");
});

test("CodeExecutor preserves typed Python errors", async () => {
  class FakeProcess extends EventEmitter {
    constructor() {
      super();
      this.stdin = new PassThrough();
      this.stdout = new PassThrough();
      this.stderr = new PassThrough();
      this.exitCode = 0;
    }

    kill() {}
  }

  const sandboxManager = {
    spawn() {
      return new FakeProcess();
    },
    getRuntimeWorkspaceRoot(cwd) {
      return cwd;
    },
    async cleanup() {},
  };

  const toolRegistry = {
    createCallableToolRuntime() {
      return {
        tools: [],
        runTool: async () => null,
      };
    },
  };

  const executor = new CodeExecutor(
    sandboxManager,
    toolRegistry,
    {
      executionTimeoutMs: 1000,
      maxOutputChars: 1000,
      allowMutations: false,
      allowBash: false,
      maxParallelToolCalls: 4,
      callableTools: undefined,
      blockedTools: undefined,
    },
    process.cwd()
  );

  const typedError = new PtcPythonError("boom", "traceback details");
  const originalLoad = executor.loadRuntimeFiles;
  const originalBuild = executor.buildCombinedCode;
  executor.loadRuntimeFiles = () => ({ rpcCode: "", runtimeCode: "" });
  executor.buildCombinedCode = () => "";
  const { RpcProtocol } = require("../dist/rpc-protocol.js");
  const originalWait = RpcProtocol.prototype.waitForCompletion;
  RpcProtocol.prototype.waitForCompletion = async function () {
    throw typedError;
  };

  try {
    await assert.rejects(
      executor.execute("return 1", { cwd: process.cwd(), ctx: { cwd: process.cwd() } }),
      (error) => error === typedError
    );
  } finally {
    RpcProtocol.prototype.waitForCompletion = originalWait;
    executor.loadRuntimeFiles = originalLoad;
    executor.buildCombinedCode = originalBuild;
  }
});

test("CodeExecutor runs the core tool-call pipeline through RpcProtocol", async () => {
  class FakeProcess extends EventEmitter {
    constructor() {
      super();
      this.stdin = new PassThrough();
      this.stdout = new PassThrough();
      this.stderr = new PassThrough();
      this.exitCode = null;
    }

    kill() {
      this.exitCode = 0;
      this.emit("exit", 0);
    }
  }

  let runToolArgs: unknown[] | null = null;
  const sandboxManager = {
    spawn() {
      const proc = new FakeProcess();
      proc.stdin.on("data", () => {
        proc.stdout.write(JSON.stringify({ type: "complete", output: "done" }) + "\n");
      });
      queueMicrotask(() => {
        proc.stdout.write(JSON.stringify({ type: "tool_call", id: "nested-1", tool: "glob", params: { pattern: "**/*.ts" } }) + "\n");
      });
      return proc;
    },
    getRuntimeWorkspaceRoot(cwd) {
      return cwd;
    },
    async cleanup() {},
  };

  const toolRegistry = {
    createCallableToolRuntime() {
      return {
        tools: [
          {
            name: "glob",
            description: "Find files",
            parameters: { type: "object", properties: { pattern: { type: "string" } }, required: ["pattern"] },
            source: "alias",
            isReadOnly: true,
          },
        ],
        runTool: async (...args) => {
          runToolArgs = args;
          return { content: [{ type: "text", text: "a.ts\nb.ts" }], details: undefined };
        },
      };
    },
  };

  const executor = new CodeExecutor(
    sandboxManager,
    toolRegistry,
    {
      executionTimeoutMs: 1000,
      maxOutputChars: 1000,
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

  const result = await executor.execute("files = await glob(pattern='**/*.ts')\nreturn len(files)", {
    cwd: process.cwd(),
    ctx: { cwd: process.cwd() },
  });

  assert.equal(result.output, "done");
  assert.deepEqual(runToolArgs, ["glob", { pattern: "**/*.ts" }, "nested-1"]);
  assert.equal(result.details.nestedToolCalls, 1);
  assert.equal(result.details.nestedResultCount, 1);
});


test("CodeExecutor exposes ptc handle helpers for bounded response/file follow-up flows", async () => {
  const nestedCalls: Array<[string, Record<string, unknown>]> = [];
  const sandboxManager = {
    spawn(code, cwd) {
      return childProcess.spawn("python3", ["-u", "-c", code], {
        cwd,
        env: { ...process.env },
      });
    },
    getRuntimeWorkspaceRoot(cwd) {
      return cwd;
    },
    async cleanup() {},
  };

  const toolRegistry = {
    createCallableToolRuntime() {
      return {
        tools: [
          {
            name: "fetch_content",
            description: "Fetch URL content",
            parameters: { type: "object", properties: { url: { type: "string" } }, required: ["url"] },
            source: "custom",
            isReadOnly: true,
          },
          {
            name: "get_search_content",
            description: "Read cached fetched content",
            parameters: {
              type: "object",
              properties: {
                responseId: { type: "string" },
                urlIndex: { type: "integer" },
              },
              required: ["responseId"],
            },
            source: "custom",
            isReadOnly: true,
          },
          {
            name: "read",
            description: "Read file content",
            parameters: {
              type: "object",
              properties: {
                path: { type: "string" },
                offset: { type: "integer" },
                limit: { type: "integer" },
              },
              required: ["path"],
            },
            source: "builtin",
            isReadOnly: true,
          },
        ],
        runTool: async (toolName: string, params: Record<string, unknown>) => {
          nestedCalls.push([toolName, params]);
          if (toolName === "fetch_content") {
            return {
              content: [{ type: "text", text: "Fetched 1 URL" }],
              details: {
                ptcValue: {
                  responseId: "resp_fetch_123",
                  urls: [
                    {
                      url: "https://example.com/page",
                      title: "Example page",
                      filePath: "/tmp/example-page.md",
                    },
                  ],
                  successCount: 1,
                  totalCount: 1,
                },
              },
            };
          }

          if (toolName === "get_search_content") {
            assert.deepEqual(params, { responseId: "resp_fetch_123", urlIndex: 0 });
            return {
              content: [{ type: "text", text: "Example body" }],
              details: undefined,
            };
          }

          if (toolName === "read") {
            assert.equal(params.path, "/tmp/example-page.md");
            assert.equal(params.limit, 20);
            return {
              content: [{ type: "text", text: "cached preview" }],
              details: undefined,
            };
          }

          throw new Error(`Unexpected tool: ${toolName}`);
        },
      };
    },
  };

  const executor = new CodeExecutor(
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

  const result = await executor.execute(
    [
      'result = await fetch_content(url="https://example.com/page")',
      'response_handle = ptc.first_handle(result, kind="response")',
      'file_handle = ptc.first_handle(result, kind="file")',
      'return {',
      '  "all_handles": ptc.extract_handles(result),',
      '  "response_preview": await get_search_content(responseId=response_handle["responseId"], urlIndex=0),',
      '  "file_preview": await ptc.read_text(file_handle["filePath"], limit=20),',
      '}',
    ].join("\n"),
    {
      cwd: process.cwd(),
      ctx: { cwd: process.cwd() },
    }
  );

  assert.deepEqual(JSON.parse(result.output), {
    all_handles: [
      { kind: "response", responseId: "resp_fetch_123" },
      { kind: "file", filePath: "/tmp/example-page.md" },
    ],
    response_preview: "Example body",
    file_preview: "cached preview",
  });
  assert.deepEqual(
    nestedCalls.map(([toolName]) => toolName),
    ["fetch_content", "get_search_content", "read"]
  );
});
