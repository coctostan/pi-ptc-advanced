const test: typeof import("node:test").test = module.require("node:test");
import type {} from "node:test";
const assert: typeof import("node:assert/strict") = module.require("node:assert/strict");

type SessionHandler = (...args: unknown[]) => unknown | Promise<unknown>;

type RegisteredTool = {
  name: string;
  description: string;
  promptSnippet?: string;
  promptGuidelines?: string[];
  execute: (...args: unknown[]) => unknown;
  [key: string]: unknown;
};

function setModuleExports(modulePath: string, exportsValue: unknown): () => void {
  const resolved = require.resolve(modulePath);
  const previous = require.cache[resolved];
  require.cache[resolved] = {
    id: resolved,
    filename: resolved,
    loaded: true,
    exports: exportsValue,
  } as unknown as NodeJS.Module;

  return () => {
    if (previous) {
      require.cache[resolved] = previous;
    } else {
      delete require.cache[resolved];
    }
  };
}

async function bootstrapPtcExtension(activeTools: string[] = ["read", "grep"]) {
  const sandbox = {
    async cleanup() {},
    spawn() {
      throw new Error("sandbox spawn should not be used in prompt guidance tests");
    },
    getRuntimeWorkspaceRoot(cwd: string) {
      return cwd;
    },
  };

  class FakeCustomToolManager {
    async start() {}
    close() {}
  }

  class FakeToolRegistry {
    getCallableTools() {
      return [];
    }

    getAutoRoutableToolNames() {
      return ["read", "grep"];
    }
  }

  class FakeCodeExecutor {
    async execute() {
      return {
        output: "ok",
        details: {
          nestedToolCalls: 0,
          nestedToolNames: [],
          nestedResultChars: 0,
          nestedResultCount: 0,
          nestedErrors: 0,
          durationMs: 1,
          estimatedAvoidedTokens: 0,
        },
      };
    }
  }

  const restoreSandbox = setModuleExports("../dist/sandbox-manager.js", {
    createSandbox: async () => sandbox,
  });
  const restoreManager = setModuleExports("../dist/custom-tool-manager.js", {
    CustomToolManager: FakeCustomToolManager,
  });
  const restoreRegistry = setModuleExports("../dist/tool-registry.js", {
    ToolRegistry: FakeToolRegistry,
  });
  const restoreExecutor = setModuleExports("../dist/code-executor.js", {
    CodeExecutor: FakeCodeExecutor,
  });

  delete require.cache[require.resolve("../dist/index.js")];
  const extensionModule = require("../dist/index.js");
  const ptcExtension = extensionModule.default || extensionModule;

  const eventHandlers = new Map<string, SessionHandler>();
  const registered: RegisteredTool[] = [];
  const pi = {
    registerTool(tool: RegisteredTool) {
      registered.push(tool);
    },
    on(event: string, handler: SessionHandler) {
      eventHandlers.set(event, handler);
    },
    getAllTools() {
      return [{ name: "code_execution" }];
    },
    getActiveTools() {
      return [...activeTools];
    },
    setActiveTools(next: string[]) {
      activeTools.splice(0, activeTools.length, ...next);
    },
  };

  await ptcExtension(pi);
  await eventHandlers.get("session_start")?.({}, { cwd: process.cwd() });

  return {
    activeTools,
    registered,
    eventHandlers,
    cleanup() {
      restoreSandbox();
      restoreManager();
      restoreRegistry();
      restoreExecutor();
      delete require.cache[require.resolve("../dist/index.js")];
    },
  };
}

test("code_execution registers prompt metadata for Pi default system prompts", async () => {
  const harness = await bootstrapPtcExtension();
  try {
    const codeExecutionTools = harness.registered.filter((tool) => tool.name === "code_execution");
    assert.ok(codeExecutionTools.length >= 1);
    const latestCodeExecutionTool = codeExecutionTools[codeExecutionTools.length - 1];
    assert.equal(
      latestCodeExecutionTool.promptSnippet,
      "Run Python orchestration for repo-wide or batched analysis using local tool wrappers."
    );

    assert.deepEqual(latestCodeExecutionTool.promptGuidelines, [
      "Use for repeated tool calls or aggregation; prefer direct tools for one-off reads/searches.",
    ]);
    assert.ok(
      latestCodeExecutionTool.promptGuidelines.every((guideline) => guideline.length < 100),
      "promptGuidelines should stay concise"
    );
  } finally {
    harness.cleanup();
  }
});

test("auto-routing does not append duplicate prompt text when systemPromptOptions already carries code_execution guidance", async () => {
  const harness = await bootstrapPtcExtension(["read", "grep"]);
  try {
    const routeResult = harness.eventHandlers.get("before_agent_start")?.({
      prompt: "Analyze the first 8 test/**/*.test.ts files and return compact JSON only",
      systemPrompt:
        "base prompt\n\nGuidelines:\n- Use code_execution for repo-wide analysis and keep large intermediate results inside Python.",
      systemPromptOptions: {
        selectedTools: ["code_execution"],
        promptGuidelines: [
          "Use code_execution for repo-wide analysis, repeated lookups, and compact aggregate results.",
        ],
        cwd: process.cwd(),
      },
    });

    assert.deepEqual(harness.activeTools, ["code_execution"]);
    assert.equal(routeResult, undefined);
  } finally {
    harness.cleanup();
  }
});


test("M21 guidance: registered description advertises source inspection without prompt bloat", async () => {
  const harness = await bootstrapPtcExtension();
  try {
    const tool = harness.registered.filter((entry) => entry.name === "code_execution").at(-1);
    assert.ok(tool);
    for (const sentence of [
      "Run Python orchestration for repo-wide or batched analysis using local tool wrappers.",
      "Use ptc.list_helpers() and ptc.help(name) for available helpers.",
      "Direct wrappers include read, grep, find, ls, and glob.",
      "Expand results to inspect Python source.",
    ]) assert.ok(tool.description.includes(sentence), `Missing description sentence: ${sentence}`);
    assert.ok(tool.description.length < 250, "registered description must remain under 250 characters");
    assert.equal(tool.promptSnippet, "Run Python orchestration for repo-wide or batched analysis using local tool wrappers.");
    assert.deepEqual(tool.promptGuidelines, [
      "Use for repeated tool calls or aggregation; prefer direct tools for one-off reads/searches.",
    ]);
  } finally {
    await harness.eventHandlers.get("session_shutdown")?.();
    harness.cleanup();
  }
});

test("M21 README: bounded source-inspection subsection explains states, expansion and metadata limits", () => {
  const { readFileSync }: typeof import("node:fs") = module.require("node:fs");
  const readme = readFileSync(require.resolve("../README.md"), "utf8");
  const section = readme.match(/^### Inspecting Python source\s*\n([\s\S]*?)(?=^#{2,3} |$(?![\s\S]))/m)?.[1];
  assert.ok(section, "Missing source-inspection README subsection");
  for (const [concept, pattern] of [
    ["collapsed default", /collapsed.{0,40}default|default.{0,40}collapsed/i],
    ["first physical line", /first physical line/i],
    ["full numbered expansion", /full.{0,40}numbered|numbered.{0,40}full/i],
    ["running and success", /running[\s\S]*success/i],
    ["source-bearing Python failures", /source-bearing Python failures/i],
    ["configurable Pi expansion", /Pi[\s\S]*configur[\s\S]*tool.expansion/i],
    ["source and failure metadata", /details\.userCode[\s\S]*details\.failure[\s\S]*metadata/i],
    ["not ordinary output", /not[\s\S]{0,80}ordinary[\s\S]{0,40}output/i],
    ["CRLF display versus raw lines", /CRLF[\s\S]*display|display[\s\S]*CRLF/i],
    ["report preservation", /ptc\.report[\s\S]*details\.report/i],
    ["legacy source-less fallback", /legacy[\s\S]*source.less/i],
    ["pre-execution and transport limits", /pre.execution[\s\S]*transport/i],
    ["multiline Python example", /```python\n[^\n]+\n[^\n]+\n```/],
    ["focused proof command", /npm run build && node --test test\/code-execution-source-visibility\.test\.ts/],
  ] as const) assert.match(section, pattern, `Missing inspection concept: ${concept}`);
  assert.doesNotMatch(section, /ctrl\+o/i, "do not promise a universal expansion key");
});
