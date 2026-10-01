const test: typeof import("node:test").test = module.require("node:test");
import type {} from "node:test";
const assert: typeof import("node:assert/strict") = module.require("node:assert/strict");

type SessionHandler = (...args: unknown[]) => unknown | Promise<unknown>;

type RegisteredTool = {
  name: string;
  renderResult?: (result: ToolResult, options: RenderOptions, theme: FakeTheme, context?: unknown) => { render(width: number): string[] };
  [key: string]: unknown;
};

type ToolResult = {
  content: Array<{ type: "text"; text: string }>;
  details?: Record<string, unknown>;
};

type RenderOptions = {
  expanded?: boolean;
  isPartial?: boolean;
};

type FakeTheme = {
  fg(_color: string, text: string): string;
  bold(text: string): string;
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

async function registerCodeExecutionTool() {
  const sandbox = {
    async cleanup() {},
    spawn() {
      throw new Error("sandbox spawn should not be used in render tests");
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
      return [];
    }
  }

  class FakeCodeExecutor {
    async execute() {
      throw new Error("execute should not be called in render tests");
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
      return [];
    },
    setActiveTools() {},
  };

  await ptcExtension(pi);
  await eventHandlers.get("session_start")?.({}, { cwd: process.cwd() });

  const tool = registered.filter((entry) => entry.name === "code_execution").at(-1);
  assert.ok(tool?.renderResult, "code_execution renderResult should be registered");

  return {
    tool,
    cleanup() {
      restoreSandbox();
      restoreManager();
      restoreRegistry();
      restoreExecutor();
      delete require.cache[require.resolve("../dist/index.js")];
    },
  };
}

function fakeTheme(): FakeTheme {
  return {
    fg(_color, text) {
      return text;
    },
    bold(text) {
      return text;
    },
  };
}

function completedResult(): ToolResult {
  return {
    content: [{ type: "text", text: '{"files":2,"status":"ok"}' }],
    details: {
      nestedToolCalls: 2,
      nestedToolNames: ["read", "grep"],
      nestedResultChars: 120,
      nestedResultCount: 2,
      nestedErrors: 0,
      durationMs: 1250,
      estimatedAvoidedTokens: 320,
      userCode: ["entries = await ptc.read_tree(pattern='**/*.ts', path='src')", "return {'files': len(entries)}"],
    },
  };
}

function reportCompletedResult(): ToolResult {
  return {
    content: [{ type: "text", text: JSON.stringify({ kind: "ptc_report", version: 1, title: "Repo summary" }) }],
    details: {
      nestedToolCalls: 1,
      nestedToolNames: ["find"],
      nestedResultChars: 80,
      nestedResultCount: 1,
      nestedErrors: 0,
      durationMs: 2000,
      estimatedAvoidedTokens: 210,
      userCode: ["return ptc.report(title='Repo summary', metrics={'files': 12})"],
      reportProduced: true,
      report: {
        kind: "ptc_report",
        version: 1,
        title: "Repo summary",
        metrics: { files: 12, healthy: true },
        tables: [
          {
            title: "Largest files",
            columns: ["path", "lines"],
            rows: [
              { path: "src/index.ts", lines: 523 },
              { path: "README.md", lines: 854 },
              { path: "test/index.test.ts", lines: 1220 },
            ],
          },
        ],
        samples: [
          { label: "example", value: { path: "src/report.ts", why: "contract" } },
          { label: "secondary", value: ["a", "b", "c"] },
        ],
        warnings: ["README is large", "runtime.py is size-sensitive"],
      },
    },
  };
}

function renderToText(tool: RegisteredTool, result: ToolResult, options: RenderOptions, width = 120): string {
  const component = tool.renderResult!(result, options, fakeTheme());
  return component.render(width).join("\n");
}

test("M21 completed collapsed code_execution results keep output first and preview only the first source line", async () => {
  const harness = await registerCodeExecutionTool();
  try {
    const text = renderToText(harness.tool, completedResult(), { expanded: false, isPartial: false });

    assert.match(text, /nested calls=2/);
    assert.match(text, /\{"files":2,"status":"ok"\}/);
    assert.match(text, /Python source: 2 lines/);
    assert.match(text, /to inspect Python source/);
    assert.match(text, /entries = await ptc\.read_tree/);
    assert.doesNotMatch(text, /2\s+│\s+return \{'files': len\(entries\)\}/);
  } finally {
    harness.cleanup();
  }
});

test("completed expanded code_execution results include line-numbered Python source after the result body", async () => {
  const harness = await registerCodeExecutionTool();
  try {
    const text = renderToText(harness.tool, completedResult(), { expanded: true, isPartial: false });

    assert.match(text, /\{"files":2,"status":"ok"\}/);
    assert.match(text, /Python source/);
    assert.match(text, /1\s+│\s+entries = await ptc\.read_tree/);
    assert.match(text, /2\s+│\s+return \{'files': len\(entries\)\}/);
    assert.ok(text.indexOf('{"files":2,"status":"ok"}') < text.indexOf("Python source"));
  } finally {
    harness.cleanup();
  }
});

test("completed collapsed code_execution report results render compact report details without raw JSON noise", async () => {
  const harness = await registerCodeExecutionTool();
  try {
    const text = renderToText(harness.tool, reportCompletedResult(), { expanded: false, isPartial: false });

    assert.match(text, /nested calls=1/);
    assert.match(text, /Repo summary/);
    assert.match(text, /files: 12/);
    assert.match(text, /healthy: true/);
    assert.match(text, /Largest files/);
    assert.match(text, /src\/index\.ts/);
    assert.match(text, /README is large/);
    assert.match(text, /Python source: 1 line/);
    assert.doesNotMatch(text, /"kind"\s*:\s*"ptc_report"/);
    assert.doesNotMatch(text, /test\/index\.test\.ts/);
    assert.doesNotMatch(text, /runtime\.py is size-sensitive/);
  } finally {
    harness.cleanup();
  }
});

test("completed expanded code_execution report results render full rows samples warnings before Python source", async () => {
  const harness = await registerCodeExecutionTool();
  try {
    const text = renderToText(harness.tool, reportCompletedResult(), { expanded: true, isPartial: false });

    assert.match(text, /Repo summary/);
    assert.match(text, /test\/index\.test\.ts/);
    assert.match(text, /runtime\.py is size-sensitive/);
    assert.match(text, /example/);
    assert.match(text, /secondary/);
    assert.match(text, /Python source/);
    assert.ok(text.indexOf("Repo summary") < text.indexOf("Python source"));
  } finally {
    harness.cleanup();
  }
});

test("partial code_execution rendering keeps the current-line executing-code view", async () => {
  const harness = await registerCodeExecutionTool();
  try {
    const text = renderToText(
      harness.tool,
      {
        content: [{ type: "text", text: "running" }],
        details: {
          nestedToolCalls: 0,
          nestedToolNames: [],
          nestedResultChars: 0,
          nestedResultCount: 0,
          nestedErrors: 0,
          durationMs: 0,
          estimatedAvoidedTokens: 0,
          currentLine: 2,
          totalLines: 3,
          userCode: ["a = 1", "b = a + 1", "return b"],
        },
      },
      { expanded: true, isPartial: true }
    );

    assert.match(text, /Executing Python code \(line 2\/3\):/);
    assert.match(text, /→\s+2\s+│ b = a \+ 1/);
    assert.doesNotMatch(text, /Python source:/);
  } finally {
    harness.cleanup();
  }
});

// M21 fixtures use Pi's public registration path; source remains metadata.
function sourceResult(code: string[], extra: Record<string, unknown> = {}, text = "result body"): ToolResult {
  const result = completedResult();
  result.content[0].text = text;
  result.details = { ...result.details, userCode: code, ...extra };
  return result;
}

function failedResult(includeTraceback = true): ToolResult {
  const traceback = "Traceback (most recent call last):\nValueError: phase64 failure";
  return sourceResult(["a = 1", "raise ValueError('phase64 failure')"], {
    failure: { type: "python", message: "phase64 failure", traceback },
  }, includeTraceback ? `Python error: phase64 failure\n${traceback}` : "Python error: phase64 failure");
}

test("M21 collapsed defaults preview the first physical line across all source-bearing states", async () => {
  const harness = await registerCodeExecutionTool();
  try {
    const cases: Array<[ToolResult, boolean]> = [
      [sourceResult(["first = 1", "later_secret = 2"]), false],
      [sourceResult(["first = 1", "later_secret = 2"], { currentLine: 2, totalLines: 2 }), true],
      [sourceResult(["first = 1", "later_secret = 2"], {}, "working"), true],
      [sourceResult(["first = 1", "later_secret = 2"], { nestedToolCalls: 1 }, "nested tool update"), true],
      [failedResult(), false], [reportCompletedResult(), false],
    ];
    for (const [result, isPartial] of cases) {
      for (const expanded of [false, undefined]) {
        const before = JSON.stringify(result);
        const text = renderToText(harness.tool, result, { expanded, isPartial });
        assert.match(text, /Python source: \d+ lines?/);
        assert.ok(text.includes((result.details!.userCode as string[])[0]));
        assert.doesNotMatch(text, /later_secret|raise ValueError|→/);
        assert.equal(JSON.stringify(result), before);
      }
    }
  } finally { harness.cleanup(); }
});

test("M21 partials without valid progress remain running and expand all source without an invented arrow", async () => {
  const harness = await registerCodeExecutionTool();
  try {
    for (const currentLine of [undefined, 0, -1, 4, 1.5]) {
      const result = sourceResult(["if True:", "    value = 1", "return value"], { currentLine }, "nested tool working");
      for (const expanded of [false, true]) {
        const text = renderToText(harness.tool, result, { expanded, isPartial: true });
        assert.match(text, /Executing Python code/);
        assert.match(text, /nested tool working/);
        assert.doesNotMatch(text, /nested calls=|line \d+\/|→/);
        if (expanded) assert.match(text, /2\s+│ {5}value = 1/);
        else assert.doesNotMatch(text, /value = 1/);
      }
    }
  } finally { harness.cleanup(); }
});

test("M21 structured failures label status and show a compact summary or expanded diagnostics before source", async () => {
  const harness = await registerCodeExecutionTool();
  try {
    for (const includeTraceback of [false, true]) {
      const result = failedResult(includeTraceback);
      const collapsed = renderToText(harness.tool, result, { expanded: false });
      assert.match(collapsed, /Python execution failed/);
      assert.match(collapsed, /phase64 failure/);
      assert.match(collapsed, /a = 1/);
      assert.doesNotMatch(collapsed, /Traceback|raise ValueError/);
      const expanded = renderToText(harness.tool, result, { expanded: true });
      assert.match(expanded, /Python execution failed/);
      assert.match(expanded, /Python error: phase64 failure/);
      assert.equal(expanded.split("Traceback (most recent call last):").length - 1, 1);
      assert.match(expanded, /2\s+│ raise ValueError/);
      assert.ok(expanded.indexOf("Traceback") < expanded.indexOf("Python source"));
    }
  } finally { harness.cleanup(); }
});

test("M21 missing or empty source preserves legacy bodies and never extracts source from args or output", async () => {
  const harness = await registerCodeExecutionTool();
  try {
    const legacy: ToolResult = { content: [{ type: "text", text: "legacy Python error" }] };
    const withoutSource = completedResult();
    delete withoutSource.details!.userCode;
    for (const result of [legacy, withoutSource, sourceResult([]), { content: [] } as ToolResult]) {
      for (const expanded of [false, true]) {
        const before = JSON.stringify(result);
        const component = harness.tool.renderResult!(result, { expanded }, fakeTheme(), { args: { code: "invented source" } });
        const text = component.render(120).join("\n");
        assert.doesNotMatch(text, /Python source|invented source|Python execution failed/);
        assert.equal(JSON.stringify(result), before);
        if (!result.content.length) assert.match(text, /\(No output\)/);
      }
    }
  } finally { harness.cleanup(); }
});

test("M21 preview is one width-safe row for Unicode and blank first lines, with no stale expanded source", async () => {
  const harness = await registerCodeExecutionTool();
  const { visibleWidth } = require("@mariozechner/pi-tui");
  try {
    for (const first of ["界🙂e\u0301".repeat(100), "", "\r", "\t" + "long".repeat(100)]) {
      const result = sourceResult([first, "    later = 2\r", "", "return later\r"]);
      const before = JSON.stringify(result);
      const collapsed = harness.tool.renderResult!(result, {}, fakeTheme());
      for (const width of [40, 80, 120, 40]) {
        const rows = collapsed.render(width);
        const sourceStart = rows.findIndex((row: string) => row.includes("Python source"));
        assert.ok(sourceStart >= 0);
        assert.equal(rows.length - sourceStart, 1, "preview must occupy exactly one terminal row");
        assert.ok(visibleWidth(rows[sourceStart]) <= width);
        assert.doesNotMatch(rows.join("\n"), /later = 2|return later/);
        if (!first.replace(/\r$/, "")) assert.match(rows[sourceStart], /\(blank line\)/);
      }
      const expanded = renderToText(harness.tool, result, { expanded: true });
      assert.match(expanded, /2\s+│ {5}later = 2/);
      assert.match(expanded, /3\s+│\s*\n/);
      assert.match(expanded, /4\s+│ return later/);
      assert.doesNotMatch(expanded, /\r/);
      assert.doesNotMatch(renderToText(harness.tool, result, { expanded: false }), /later = 2/);
      assert.equal(JSON.stringify(result), before);
    }
    assert.match(renderToText(harness.tool, sourceResult(["return 1"]), {}), /Python source: 1 line\b/);
  } finally { harness.cleanup(); }
});

test("M21 source disclosure uses the configured expand action, not a hardcoded key", async () => {
  const { getKeybindings, setKeybindings, KeybindingsManager } = require("@mariozechner/pi-tui");
  const previous = getKeybindings();
  setKeybindings(new KeybindingsManager({ "app.tools.expand": { defaultKeys: "alt+x" } }));
  const harness = await registerCodeExecutionTool();
  try {
    const text = renderToText(harness.tool, sourceResult(["return 1"]), {});
    assert.match(text, /alt\+x to inspect Python source/);
    assert.doesNotMatch(text, /ctrl\+o/i);
  } finally { harness.cleanup(); setKeybindings(previous); }
});


test("M21 pure preview formats only the first source line and respects ANSI-aware terminal width", () => {
  const { formatSourcePreview } = require("../dist/code-execution-renderer.js");
  const { visibleWidth } = require("@mariozechner/pi-tui");
  const source = ["first = 1", "unread later line"];
  Object.defineProperty(source, "1", { get() { throw new Error("collapsed preview visited later source"); } });
  assert.equal(formatSourcePreview(source, 80, "alt+x expand"), "Python source: 2 lines: first = 1 (alt+x expand)");
  assert.equal(formatSourcePreview([], 80, "expand"), "");
  for (const width of [40, 80, 120]) {
    const preview = formatSourcePreview(["界🙂".repeat(100)], width, "\x1b[2malt+x expand\x1b[0m");
    assert.ok(visibleWidth(preview) <= width);
    assert.doesNotMatch(preview, /\n/);
  }
});

test("M21 pure expanded formatter preserves physical lines and source ordering without mutation", () => {
  const { formatPythonSourceLines, formatCodeExecutionLines } = require("../dist/code-execution-renderer.js");
  const source = Object.freeze(["if True:\r", "    a = 1\r", "", "return a"]);
  assert.deepEqual(formatPythonSourceLines(source, fakeTheme(), 2), ["  1 │ if True:", "→  2 │     a = 1", "  3 │ ", "  4 │ return a"]);
  const result = sourceResult([...source], { currentLine: 2, totalLines: 4 }, "working");
  const lines = formatCodeExecutionLines("working", result.details, { expanded: true, isPartial: true, expandHint: "expand" }, fakeTheme(), 80);
  assert.equal(lines[0], "Executing Python code (line 2/4):");
  assert.ok(lines.includes("→  2 │     a = 1"));
  assert.equal(source[0], "if True:\r");
});
