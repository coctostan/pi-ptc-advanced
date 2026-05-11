import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { CodeExecutor } from "../dist/code-executor.js";
import { PtcPythonError } from "../dist/execution/execution-errors.js";

type CallableToolStub = {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, { type: string }>;
    required: string[];
    additionalProperties: boolean;
  };
  source: "builtin" | "extension";
  isReadOnly: boolean;
  ptc?: {
    pythonName: string;
  };
};

function createExecutor(tools: CallableToolStub[]) {
  const sandboxManager = {
    spawn(code: string, cwd: string) {
      return spawn("python3", ["-u", "-c", code], {
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
        tools,
        runTool: async (toolName: string) => {
          throw new Error(`Unexpected nested tool call: ${toolName}`);
        },
      };
    },
  };

  return new CodeExecutor(
    sandboxManager,
    toolRegistry as any,
    {
      executionTimeoutMs: 10_000,
      maxOutputChars: 10_000,
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
}

function createCallableTools(): CallableToolStub[] {
  return [
    {
      name: "read",
      description: "Read a file",
      parameters: {
        type: "object",
        properties: {
          path: { type: "string" },
          limit: { type: "integer" },
        },
        required: ["path"],
        additionalProperties: false,
      },
      source: "builtin",
      isReadOnly: true,
    },
    {
      name: "search",
      description: "Search indexed documents",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string" },
          limit: { type: "integer" },
        },
        required: ["query"],
        additionalProperties: false,
      },
      source: "extension",
      isReadOnly: true,
      ptc: { pythonName: "search_py" },
    },
  ];
}

test("ptc callable-tool introspection helpers work through the live CodeExecutor path", async () => {
  const executor = createExecutor(createCallableTools());

  const result = await executor.execute(
    [
      "tools = ptc.list_callable_tools()",
      "summary = [{",
      '  "name": tool["name"],',
      '  "pythonName": tool["pythonName"],',
      '  "source": tool["source"],',
      '  "isReadOnly": tool["isReadOnly"],',
      "} for tool in tools]",
      'search_schema_by_name = ptc.get_tool_schema("search")',
      'search_schema_by_alias = ptc.get_tool_schema("search_py")',
      'read_schema = ptc.get_tool_schema("read")',
      "return {",
      '  "tools": summary,',
      '  "search_schema_by_name": search_schema_by_name,',
      '  "search_schema_by_alias": search_schema_by_alias,',
      '  "read_schema": read_schema,',
      "}",
    ].join("\n"),
    {
      cwd: process.cwd(),
      ctx: ({ cwd: process.cwd() } as any),
    }
  );

  assert.deepEqual(JSON.parse(result.output), {
    tools: [
      {
        name: "read",
        pythonName: "read",
        source: "builtin",
        isReadOnly: true,
      },
      {
        name: "search",
        pythonName: "search_py",
        source: "extension",
        isReadOnly: true,
      },
    ],
    search_schema_by_name: {
      type: "object",
      properties: {
        query: { type: "string" },
        limit: { type: "integer" },
      },
      required: ["query"],
      additionalProperties: false,
    },
    search_schema_by_alias: {
      type: "object",
      properties: {
        query: { type: "string" },
        limit: { type: "integer" },
      },
      required: ["query"],
      additionalProperties: false,
    },
    read_schema: {
      type: "object",
      properties: {
        path: { type: "string" },
        limit: { type: "integer" },
      },
      required: ["path"],
      additionalProperties: false,
    },
  });
});

test("ptc.get_tool_schema surfaces a clear bounded error for unknown callable tools at execution time", async () => {
  const executor = createExecutor(createCallableTools());

  await assert.rejects(
    executor.execute(
      [
        'ptc.get_tool_schema("missing_tool")',
        "return 'unreachable'",
      ].join("\n"),
      {
        cwd: process.cwd(),
        ctx: ({ cwd: process.cwd() } as any),
      }
    ),
    (error: InstanceType<typeof PtcPythonError>) => {
      assert.ok(error instanceof PtcPythonError);
      assert.match(error.rawMessage, /Unknown callable tool 'missing_tool'/);
      assert.match(error.rawMessage, /Available: read, search, search_py/);
      return true;
    }
  );
});
