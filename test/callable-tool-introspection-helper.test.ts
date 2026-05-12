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
  promptSnippet?: string;
  promptGuidelines?: string[];
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
      promptSnippet: "Search indexed project documents.",
      promptGuidelines: ["Use search when indexed project context is needed.", "Prefer read for direct file inspection."],
    },
  ];
}

test("ptc callable-tool introspection helpers work through the live CodeExecutor path", async () => {
  const executor = createExecutor(createCallableTools());

  const result = await executor.execute(
    [
      "tools = ptc.list_callable_tools()",
      'search_help_by_name = ptc.help("search")',
      'search_help_by_alias = ptc.help("search_py")',
      'search_schema_by_name = ptc.get_tool_schema("search")',
      'search_schema_by_alias = ptc.get_tool_schema("search_py")',
      'read_schema = ptc.get_tool_schema("read")',
      "return {",
      '  "tools": tools,',
      '  "search_help_by_name": search_help_by_name,',
      '  "search_help_by_alias": search_help_by_alias,',
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

  const parsed = JSON.parse(result.output);
  assert.equal(parsed.tools.length, 2);
  assert.deepEqual(parsed.tools[0], {
    name: "read",
    pythonName: "read",
    description: "Read a file",
    source: "builtin",
    isReadOnly: true,
    parameters: {
      type: "object",
      properties: {
        limit: { type: "integer" },
        path: { type: "string" },
      },
      required: ["path"],
      additionalProperties: false,
    },
  });
  assert.equal("promptSnippet" in parsed.tools[0], false);
  assert.equal("promptGuidelines" in parsed.tools[0], false);

  const expectedSearchMetadata = {
    name: "search",
    pythonName: "search_py",
    description: "Search indexed documents",
    source: "extension",
    isReadOnly: true,
    parameters: {
      type: "object",
      properties: {
        limit: { type: "integer" },
        query: { type: "string" },
      },
      required: ["query"],
      additionalProperties: false,
    },
    promptSnippet: "Search indexed project documents.",
    promptGuidelines: ["Use search when indexed project context is needed.", "Prefer read for direct file inspection."],
  };
  assert.deepEqual(parsed.tools[1], expectedSearchMetadata);
  assert.deepEqual(parsed.search_help_by_name, expectedSearchMetadata);
  assert.deepEqual(parsed.search_help_by_alias, expectedSearchMetadata);
  assert.deepEqual(parsed.search_schema_by_name, expectedSearchMetadata.parameters);
  assert.deepEqual(parsed.search_schema_by_alias, expectedSearchMetadata.parameters);
  assert.deepEqual(parsed.read_schema, parsed.tools[0].parameters);
});

test("ptc introspection helpers surface clear bounded errors for unknown callable tools", async () => {
  const executor = createExecutor(createCallableTools());

  for (const helperCall of ['ptc.get_tool_schema("missing_tool")', 'ptc.help("missing_tool")']) {
    await assert.rejects(
      executor.execute(
        [
          helperCall,
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
  }
});
