const test = require("node:test");
import type {} from "node:test";
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
    events: {
      on() { return () => {}; },
      emit() {},
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
    autoRoute: true,
    trustedReadOnlyTools: undefined,
    callableTools: undefined,
    blockedTools: undefined,
    ...overrides,
  };
}

test("ToolRegistry warns once when hashline bridge starts without pre-emitted executors", () => {
  delete (globalThis as typeof globalThis & { __hashlineToolExecutors?: unknown }).__hashlineToolExecutors;
  delete process.env.PTC_HASHLINE_BRIDGE_NO_EXECUTORS_WARNED;
  const warnings: string[] = [];
  const originalEmitWarning = process.emitWarning;
  process.emitWarning = ((warning: string | Error) => {
    warnings.push(String(warning));
  }) as typeof process.emitWarning;

  try {
    createRegistry();
    assert.equal(warnings.length, 1);
    assert.match(warnings[0], /Hashline tool executor bridge started with no pre-emitted executors/);
  } finally {
    process.emitWarning = originalEmitWarning;
  }
});

test("ToolRegistry does not warn when hashline executors are pre-emitted", () => {
  const mockExecute = async () => createToolResult("hashline:read");
  (globalThis as typeof globalThis & { __hashlineToolExecutors?: unknown }).__hashlineToolExecutors = {
    read: {
      name: "read",
      execute: mockExecute,
      ptc: { callable: true, policy: "read-only" },
      parameters: stringParamSchema(),
    },
  };
  const warnings: string[] = [];
  const originalEmitWarning = process.emitWarning;
  process.emitWarning = ((warning: string | Error) => {
    warnings.push(String(warning));
  }) as typeof process.emitWarning;

  try {
    createRegistry();
    assert.deepEqual(warnings, []);
  } finally {
    process.emitWarning = originalEmitWarning;
    delete (globalThis as typeof globalThis & { __hashlineToolExecutors?: unknown }).__hashlineToolExecutors;
  }
});

test("ToolRegistry blocks untrusted custom read-only tools when mutations are disabled", () => {
  const registry = createRegistry();
  registry.upsertTool({
    name: "query_db",
    description: "Query DB",
    parameters: stringParamSchema(),
    ptc: { callable: true, policy: "read-only" },
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
    ptc: { callable: true, policy: "read-only", pythonName: "query_db_readonly" },
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

test("ToolRegistry preserves backward compatibility for legacy ptc enabled/readOnly metadata", () => {
  const registry = createRegistry();
  registry.upsertTool({
    name: "legacy_reader",
    description: "Legacy reader",
    parameters: stringParamSchema(),
    ptc: { enabled: true, readOnly: true, pythonName: "legacy_reader_py" },
    async execute() {
      return createToolResult("ok");
    },
  });

  const callable = registry.getCallableTools(
    process.cwd(),
    baseSettings({ allowMutations: true, trustedReadOnlyTools: ["legacy_reader"] })
  );
  const tool = callable.find((entry) => entry.name === "legacy_reader");

  assert.ok(tool);
  assert.deepEqual(tool.ptc, {
    enabled: true,
    callable: true,
    readOnly: true,
    policy: "read-only",
    pythonName: "legacy_reader_py",
  });
});

test("ToolRegistry requires explicit callable metadata for extension tools", () => {
  const registry = createRegistry();
  registry.upsertTool({
    name: "hidden_tool",
    description: "Hidden tool",
    parameters: stringParamSchema(),
    ptc: { policy: "read-only", pythonName: "hidden_tool_py" },
    async execute() {
      return createToolResult("ok");
    },
  });

  const warnings: string[] = [];
  const originalEmitWarning = process.emitWarning;
  process.emitWarning = ((warning: string | Error) => {
    warnings.push(String(warning));
  }) as typeof process.emitWarning;

  try {
    const callable = registry.getCallableTools(
      process.cwd(),
      baseSettings({
        allowMutations: true,
        callableTools: ["hidden_tool"],
        trustedReadOnlyTools: ["hidden_tool"],
      })
    );
  assert.ok(!callable.some((tool) => tool.name === "hidden_tool"));
    assert.equal(warnings.length, 1);
    assert.match(warnings[0], /hidden_tool \(missing ptc\.callable metadata\)/);
  } finally {
    process.emitWarning = originalEmitWarning;
  }
});

test("ToolRegistry warns when allowlisted tools are absent from the current Pi tool set", () => {
  const registry = createRegistry();
  const warnings: string[] = [];
  const originalEmitWarning = process.emitWarning;
  process.emitWarning = ((warning: string | Error) => {
    warnings.push(String(warning));
  }) as typeof process.emitWarning;

  try {
    const callable = registry.getCallableTools(
      process.cwd(),
      baseSettings({
        callableTools: ["read", "sg", "symbol_graph"],
        trustedReadOnlyTools: ["sg", "symbol_graph"],
      })
    );

    assert.ok(callable.some((tool) => tool.name === "read"));
    assert.ok(!callable.some((tool) => tool.name === "sg"));
    assert.ok(!callable.some((tool) => tool.name === "symbol_graph"));
    assert.equal(warnings.length, 1);
    assert.match(warnings[0], /sg \(not present in the current Pi tool set\)/);
    assert.match(warnings[0], /symbol_graph \(not present in the current Pi tool set\)/);
  } finally {
    process.emitWarning = originalEmitWarning;
  }
});

test("ToolRegistry blocks mutating extension tools when mutations are disabled even if metadata opts them in", () => {
  const registry = createRegistry();
  registry.upsertTool({
    name: "mutate_db",
    description: "Mutate DB",
    parameters: stringParamSchema(),
    ptc: { callable: true, policy: "mutating", pythonName: "mutate_db_py" },
    async execute() {
      return createToolResult("ok");
    },
  });

  const blocked = registry.getCallableTools(process.cwd(), baseSettings({ allowMutations: false }));
  assert.ok(!blocked.some((tool) => tool.name === "mutate_db"));

  const allowed = registry.getCallableTools(process.cwd(), baseSettings({ allowMutations: true }));
  const mutatingTool = allowed.find((tool) => tool.name === "mutate_db");
  assert.ok(mutatingTool);
  assert.deepEqual(mutatingTool.ptc, {
    callable: true,
    enabled: true,
    readOnly: false,
    policy: "mutating",
    pythonName: "mutate_db_py",
  });
});

test("ToolRegistry rejects duplicate python helper names", () => {
  const registry = createRegistry();
  const parameters = stringParamSchema();

  for (const name of ["tool_a", "tool_b"]) {
    registry.upsertTool({
      name,
      description: name,
      parameters,
      ptc: { callable: true, policy: "read-only", pythonName: "shared_name" },
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
  ] as const) {
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
    if (!capturedArgs) {
      throw new Error("override executor was not called");
    }
    const args = capturedArgs;
    assert.equal((result as { content: Array<{ text: string }> }).content[0].text, `override:${toolName}`);
    assert.equal(callable.description, `override:${toolName}`);
    assert.equal((callable.parameters as { type: string }).type, "object");
    assert.equal((callable.parameters as { properties: { value: { type: string } } }).properties.value.type, "string");
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
  assert.equal((result as { content: Array<{ text: string }> }).content[0].text, "builtin:read");
  assert.equal(callable?.description, "read");
});

test("ToolRegistry preserves Pi sourceInfo separately from internal source taxonomy", () => {
  const sourceInfo = { source: "builtin" };
  const registry = createRegistry({
    getAllTools() {
      return [
        {
          name: "read",
          description: "override:read",
          parameters: stringParamSchema(),
          sourceInfo,
          async execute() {
            return createToolResult("override:read");
          },
        },
      ];
    },
    getActiveTools() {
      return ["read"];
    },
  });

  const readTool = registry.getAllTools(process.cwd()).find((tool) => tool.name === "read");
  assert.ok(readTool);
  assert.equal(readTool.source, "builtin");
  assert.equal(readTool.sourceInfo, sourceInfo);
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
test("ToolRegistry overlays extension executors from globalThis onto builtins", async () => {
  let capturedArgs: unknown[] | null = null;
  const mockExecute = async (...args: unknown[]) => {
    capturedArgs = args;
    return { content: [{ type: "text", text: "hashline:read" }], details: { ptcValue: { tool: "read", lines: [] } } };
  };

  (globalThis as typeof globalThis & { __hashlineToolExecutors?: unknown }).__hashlineToolExecutors = {
    read: {
      name: "read",
      execute: mockExecute,
      ptc: { callable: true, policy: "read-only" },
      parameters: stringParamSchema(),
    },
  };

  try {
    const registry = createRegistry();
    const runtime = registry.createCallableToolRuntime(process.cwd(), baseSettings(), {
      ctx: { cwd: process.cwd() },
      parentToolCallId: "parent:bridge",
    });
    const result = await runtime.runTool("read", { value: "test" }, "nested:bridge");
    assert.ok(capturedArgs, "hashline executor was not called");
    assert.equal((result as { content: Array<{ text: string }> }).content[0].text, "hashline:read");
    assert.deepEqual((result as { details: unknown }).details, { ptcValue: { tool: "read", lines: [] } });
  } finally {
    delete (globalThis as typeof globalThis & { __hashlineToolExecutors?: unknown }).__hashlineToolExecutors;
  }
});
test("ToolRegistry overlays extension executors from EventBus subscription", () => {
  let eventHandler: ((data: unknown) => void) | null = null;
  const registry = createRegistry({
    events: {
      on(channel: string, handler: (data: unknown) => void) {
        if (channel === "hashline:tool-executors") {
          eventHandler = handler;
        }
        return () => {};
      },
      emit() {},
    },
  });

  assert.ok(eventHandler, "EventBus handler was not registered");
  const mockExecute = async () => ({ content: [{ type: "text", text: "hashline:grep" }] });
  eventHandler!({
    grep: {
      name: "grep",
      execute: mockExecute,
      ptc: { callable: true, policy: "read-only" },
      parameters: stringParamSchema(),
    },
  });
  const callable = registry.getCallableTools(process.cwd(), baseSettings());
  const grepTool = callable.find((tool) => tool.name === "grep");
  assert.ok(grepTool, "grep tool not found in callable tools");
  assert.equal(grepTool.execute, mockExecute, "grep execute should be the extension executor");
});
test("ToolRegistry preserves builtin fallback when no extension executors exist", async () => {
  delete (globalThis as typeof globalThis & { __hashlineToolExecutors?: unknown }).__hashlineToolExecutors;

  const registry = createRegistry();
  const runtime = registry.createCallableToolRuntime(process.cwd(), baseSettings(), {
    ctx: { cwd: process.cwd() },
  });
  const result = await runtime.runTool("read", { value: "fallback" }, "nested:fallback");
  assert.equal((result as { content: Array<{ text: string }> }).content[0].text, "builtin:read");
});
test("ToolRegistry respects code_execution-only callers for custom tools", () => {
  const registry = createRegistry();
  registry.upsertTool({
    name: "query_db",
    description: "Query DB",
    parameters: stringParamSchema(),
    ptc: { enabled: true, readOnly: true, callers: ["code_execution"] },
    async execute() {
      return { content: [{ type: "text", text: "ok" }], details: undefined };
    },
  });
  const callable = registry.getCallableTools(
    process.cwd(),
    baseSettings({ trustedReadOnlyTools: ["query_db"] })
  );
  assert.ok(callable.some((tool) => tool.name === "query_db"));
  const routable = registry.getAutoRoutableToolNames(
    process.cwd(),
    baseSettings({ trustedReadOnlyTools: ["query_db"] })
  );
  assert.ok(!routable.includes("query_db"));
});
test("ToolRegistry auto-routing only hides tools callable both directly and from code_execution", () => {
  const registry = createRegistry();
  registry.upsertTool({
    name: "query_db",
    description: "Query DB",
    parameters: stringParamSchema(),
    ptc: { enabled: true, readOnly: true, callers: ["direct", "code_execution"] },
    async execute() {
      return { content: [{ type: "text", text: "ok" }], details: undefined };
    },
  });

  const routable = registry.getAutoRoutableToolNames(
    process.cwd(),
    baseSettings({ trustedReadOnlyTools: ["query_db"] })
  );
  assert.ok(routable.includes("read"));
  assert.ok(routable.includes("query_db"));
  assert.ok(!routable.includes("code_execution"));
});
