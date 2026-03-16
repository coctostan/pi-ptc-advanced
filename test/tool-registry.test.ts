const test = require("node:test");
const assert = require("node:assert/strict");
const Module = require("node:module");
const { Type } = require("@sinclair/typebox");

function stringParamSchema() {
  return Type.Object({
    value: Type.String(),
  });
}

function createToolResult(text: string) {
  return { content: [{ type: "text", text }], details: undefined };
}

function createStubTool(
  name: string,
  description: string,
  executeImpl?: (...args: unknown[]) => Promise<unknown> | unknown
) {
  return {
    name,
    description,
    parameters: stringParamSchema(),
    async execute(...args: unknown[]) {
      if (executeImpl) {
        return await executeImpl(...args);
      }
      return createToolResult(`builtin:${name}`);
    },
  };
}

function loadToolRegistryWithStubbedHost() {
  const originalLoad = Module._load;
  Module._load = function (request: string, parent: unknown, isMain: boolean) {
    if (request === "@mariozechner/pi-coding-agent") {
      return {
        createReadTool: (_cwd: string, _options?: unknown) => createStubTool("read", "read"),
        createBashTool: (_cwd: string, _options?: unknown) => createStubTool("bash", "bash"),
        createEditTool: (_cwd: string, _options?: unknown) => createStubTool("edit", "edit"),
        createWriteTool: (_cwd: string, _options?: unknown) => createStubTool("write", "write"),
        createGrepTool: (_cwd: string, _options?: unknown) => createStubTool("grep", "grep"),
        createFindTool: (_cwd: string, _options?: unknown) => createStubTool("find", "find"),
        createLsTool: (_cwd: string, _options?: unknown) => createStubTool("ls", "ls"),
      };
    }
    return originalLoad(request, parent, isMain);
  };

  try {
    delete require.cache[require.resolve("../dist/tool-registry.js")];
    return require("../dist/tool-registry.js").ToolRegistry;
  } finally {
    Module._load = originalLoad;
  }
}
function createRegistry(piOverrides = {}) {
  const ToolRegistry = loadToolRegistryWithStubbedHost();
  const pi = {
    getAllTools() {
      return [];
    },
    getActiveTools() {
      return [];
    },
    ...piOverrides,
  };
  return new ToolRegistry(pi);
}

function baseSettings(overrides = {}) {
  return {
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
    ...overrides,
  };
}

test("ToolRegistry blocks untrusted custom read-only tools when mutations are disabled", () => {
  const registry = createRegistry();
  registry.upsertTool({
    name: "query_db",
    description: "Query DB",
    parameters: stringParamSchema(),
    ptc: { enabled: true, readOnly: true },
    async execute() {
      return createToolResult("ok");
    },
  });

  const callable = registry.getCallableTools(process.cwd(), baseSettings());
  const names = callable.map((tool) => tool.name);

  assert.deepEqual(names.sort(), ["find", "glob", "grep", "ls", "read"]);
});

test("ToolRegistry allows trusted custom read-only tools when explicitly allowlisted", () => {
  const registry = createRegistry();
  registry.upsertTool({
    name: "query_db",
    description: "Query DB",
    parameters: stringParamSchema(),
    ptc: { enabled: true, readOnly: true, pythonName: "query_db_readonly" },
    async execute() {
      return createToolResult("ok");
    },
  });

  const callable = registry.getCallableTools(
    process.cwd(),
    baseSettings({ trustedReadOnlyTools: ["query_db"] })
  );

  assert.ok(callable.some((tool) => tool.name === "query_db"));
});

test("ToolRegistry rejects duplicate python helper names", () => {
  const registry = createRegistry();
  const parameters = stringParamSchema();

  for (const name of ["tool_a", "tool_b"]) {
    registry.upsertTool({
      name,
      description: name,
      parameters,
      ptc: { enabled: true, readOnly: true, pythonName: "shared_name" },
      async execute() {
        return createToolResult("ok");
      },
    });
  }

  assert.throws(
    () => registry.getCallableTools(process.cwd(), baseSettings({ trustedReadOnlyTools: ["tool_a", "tool_b"] })),
    /Duplicate Python helper name/
  );
});

test("ToolRegistry uses the active Pi executor for overridden builtin tool names", async () => {
  for (const [toolName, allowMutations] of [
    ["read", false],
    ["grep", false],
    ["edit", true],
  ]) {
    let capturedArgs: unknown[] | null = null;
    const signal = { type: `signal:${toolName}` };

    const registry = createRegistry({
      getAllTools() {
        return [
          {
            name: toolName,
            description: `override:${toolName}`,
            parameters: stringParamSchema(),
            async execute(...args: unknown[]) {
              capturedArgs = args;
              return createToolResult(`override:${toolName}`);
            },
          },
        ];
      },
      getActiveTools() {
        return [toolName];
      },
    });
    const runtime = registry.createCallableToolRuntime(process.cwd(), baseSettings({ allowMutations }), {
      ctx: { cwd: process.cwd(), label: `ctx:${toolName}` },
      signal,
      parentToolCallId: `parent:${toolName}`,
    });
    const result = await runtime.runTool(toolName, { value: toolName }, `nested:${toolName}`);
    const callable = runtime.tools.find((tool) => tool.name === toolName);
    assert.ok(callable);
    if (!capturedArgs) {
      throw new Error("override executor was not called");
    }
    const args = capturedArgs;
    assert.equal(result.content[0].text, `override:${toolName}`);
    assert.equal(callable.description, `override:${toolName}`);
    assert.equal(callable.parameters.type, "object");
    assert.equal(callable.parameters.properties.value.type, "string");
    assert.equal(args[0], `nested:${toolName}`);
    assert.deepEqual(args[1], { value: toolName });
    assert.equal(args[2], signal);
    assert.equal(args[3], undefined);
    assert.equal((args[4] as { cwd: string }).cwd, process.cwd());
    assert.deepEqual((args[4] as { caller: unknown }).caller, {
      type: "code_execution",
      parentToolCallId: `parent:${toolName}`,
      nestedCallId: `nested:${toolName}`,
    });
  }
});

test("ToolRegistry keeps builtin fallback when an override is not active", async () => {
  const registry = createRegistry({
    getAllTools() {
      return [
        {
          name: "read",
          description: "override:read",
          parameters: stringParamSchema(),
          async execute() {
            return createToolResult("override:read");
          },
        },
      ];
    },
    getActiveTools() {
      return [];
    },
  });

  const runtime = registry.createCallableToolRuntime(process.cwd(), baseSettings(), {
    ctx: { cwd: process.cwd() },
  });

  const result = await runtime.runTool("read", { value: "fallback" }, "nested:read");
  const callable = runtime.tools.find((tool) => tool.name === "read");

  assert.equal(result.content[0].text, "builtin:read");
  assert.equal(callable.description, "read");
});

test("ToolRegistry still excludes code_execution from nested callable tools", () => {
  const registry = createRegistry({
    getAllTools() {
      return [
        {
          name: "code_execution",
          description: "override:code_execution",
          parameters: stringParamSchema(),
          async execute() {
            return createToolResult("override:code_execution");
          },
        },
      ];
    },
    getActiveTools() {
      return ["code_execution"];
    },
  });

  const callable = registry.getCallableTools(process.cwd(), baseSettings({ allowMutations: true }));

  assert.ok(!callable.some((tool) => tool.name === "code_execution"));
});
