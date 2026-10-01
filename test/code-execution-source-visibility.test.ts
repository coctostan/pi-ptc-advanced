const test: typeof import("node:test").test = module.require("node:test");
import type {} from "node:test";
const assert: typeof import("node:assert/strict") = module.require("node:assert/strict");
const { spawn }: typeof import("node:child_process") = module.require("node:child_process");
const { once }: typeof import("node:events") = module.require("node:events");
import type { ChildProcess } from "node:child_process";
import type { ExecutionDetails } from "../src/contracts/execution-types";

type Result = { content: Array<{ type: "text"; text: string }>; details: ExecutionDetails };
type Options = { expanded?: boolean; isPartial?: boolean };
type Theme = { fg(color: string, text: string): string; bold(text: string): string };
type Tool = {
  name: string;
  execute(id: string, args: { code: string }, signal: undefined,
    onUpdate: (result: Result) => void, ctx: { cwd: string }): Promise<Result>;
  renderResult(result: Result, options: Options, theme: Theme): { render(width: number): string[] };
};
type Handler = (...args: unknown[]) => unknown | Promise<unknown>;

function replaceModule(path: string, exports: unknown): () => void {
  const id = require.resolve(path);
  const previous = require.cache[id];
  require.cache[id] = { id, filename: id, loaded: true, exports } as NodeJS.Module;
  return () => {
    if (previous) require.cache[id] = previous;
    else delete require.cache[id];
  };
}

// Only the sandbox/registry/custom-manager boundaries are replaced. The registered
// tool uses the real CodeExecutor, RpcProtocol and bundled Python runtime assets.
async function withRegisteredTool(run: (tool: Tool, calls: string[]) => Promise<void>) {
  const children = new Set<ChildProcess>();
  const calls: string[] = [];
  const handlers = new Map<string, Handler>();
  const restores: Array<() => void> = [];
  const priorEnv = Object.fromEntries(Object.entries(process.env).filter(([key]) => key.startsWith("PTC_")));
  const { getKeybindings, setKeybindings } = require("@mariozechner/pi-tui");
  const priorKeys = getKeybindings();
  let sandboxCleaned = false;
  let managerClosed = false;
  const sandbox = {
    spawn(code: string, cwd: string) {
      const child = spawn("python3", ["-u", "-c", code], { cwd, env: { ...process.env } });
      children.add(child);
      child.once("close", () => children.delete(child));
      return child;
    },
    getRuntimeWorkspaceRoot(cwd: string) { return cwd; },
    async cleanup() {
      await Promise.all([...children].map(async (child) => {
        const closed = once(child, "close");
        if (child.exitCode === null && child.signalCode === null) child.kill("SIGKILL");
        await closed;
      }));
      sandboxCleaned = true;
    },
  };
  const tools = [{
    name: "source_probe", description: "Synthetic read-only probe",
    parameters: { type: "object", properties: { value: { type: "string" } }, required: ["value"] },
    source: "extension", isReadOnly: true,
  }];
  class Registry {
    getCallableTools() { return tools; }
    getAutoRoutableToolNames() { return []; }
    createCallableToolRuntime() {
      return { tools, runTool: async (name: string, params: unknown) => {
        assert.equal(name, "source_probe");
        assert.deepEqual(params, { value: "probe" });
        calls.push(name);
        return { content: [{ type: "text", text: "PROBE_OUTPUT" }] };
      } };
    }
  }
  class Manager {
    async start() {}
    close() { managerClosed = true; }
  }
  try {
    for (const key of Object.keys(process.env)) if (key.startsWith("PTC_")) delete process.env[key];
    Object.assign(process.env, { PTC_AUTO_ROUTE: "false", PTC_AUTO_RECOVER: "false", PTC_EXECUTION_TIMEOUT_MS: "10000" });
    restores.push(replaceModule("../dist/sandbox-manager.js", { createSandbox: async () => sandbox }));
    restores.push(replaceModule("../dist/tool-registry.js", { ToolRegistry: Registry }));
    restores.push(replaceModule("../dist/custom-tool-manager.js", { CustomToolManager: Manager }));
    const indexId = require.resolve("../dist/index.js");
    const priorIndex = require.cache[indexId];
    delete require.cache[indexId];
    restores.push(() => {
      if (priorIndex) require.cache[indexId] = priorIndex;
      else delete require.cache[indexId];
    });
    const registered: Tool[] = [];
    await require("../dist/index.js").default({
      registerTool(tool: Tool) { registered.push(tool); },
      on(event: string, handler: Handler) { handlers.set(event, handler); },
      getAllTools() { return []; }, getActiveTools() { return []; }, setActiveTools() {},
    });
    await handlers.get("session_start")!({}, { cwd: process.cwd() });
    const tool = registered.find((entry) => entry.name === "code_execution");
    assert.ok(tool?.execute && tool.renderResult);
    await run(tool, calls);
  } finally {
    try {
      await handlers.get("session_shutdown")?.();
    } finally {
      try { await sandbox.cleanup(); }
      finally {
        restores.reverse().forEach((restore) => restore());
        for (const key of Object.keys(process.env)) if (key.startsWith("PTC_")) delete process.env[key];
        Object.assign(process.env, priorEnv);
        setKeybindings(priorKeys);
      }
    }
  }
  assert.equal(sandboxCleaned, true);
  assert.equal(managerClosed, true);
  assert.equal(children.size, 0, "all real Python children closed");
}

const theme: Theme = { fg: (_color, text) => text, bold: (text) => text };
const body = (result: Result) => result.content.map((item) => item.text).join("");
function render(tool: Tool, result: Result, options: Options, width = 240) {
  return tool.renderResult(result, options, theme).render(width).join("\n");
}
function verifyDisclosure(tool: Tool, result: Result, code: string, isPartial = false) {
  assert.deepEqual(result.details.userCode, code.split("\n"), "raw physical lines must survive execution");
  const snapshot = JSON.stringify(result.details);
  const collapsed = render(tool, result, { isPartial });
  assert.equal(collapsed, render(tool, result, { isPartial, expanded: false }));
  assert.doesNotMatch(collapsed, /│/, "collapsed disclosure must not show numbered source");
  const preview = collapsed.split("\n").find((line) => line.startsWith("Python source:"));
  assert.ok(preview, "first-physical-line disclosure is present");
  const lines = code.split("\n");
  assert.ok(preview.includes(lines[0].replace(/\r$/, "") || "(blank line)"));
  assert.ok(!preview.includes("HIDDEN_SOURCE_SENTINEL"), "preview never selects a later line");
  const expanded = render(tool, result, { isPartial, expanded: true });
  const numbered = expanded.split("\n").filter((line) => line.includes("│"));
  assert.deepEqual(numbered, lines.map((line, index) => {
    const n = index + 1;
    const prefix = isPartial && n === result.details.currentLine
      ? `→ ${String(n).padStart(2, " ")} │ ` : `${String(n).padStart(3, " ")} │ `;
    return (prefix + line.replace(/\r$/, "")).padEnd(240, " ");
  }));
  if (!isPartial) {
    assert.doesNotMatch(expanded, /→/);
    const expectedBody = result.details.failure ? "Python execution failed"
      : result.details.report ? result.details.report.title : body(result).split("\n")[0];
    assert.ok(expanded.indexOf(expectedBody) < expanded.indexOf("Python source"), "terminal body precedes source");
  }
  for (const width of [24, 80, 240]) for (const expanded of [true, false, true]) {
    render(tool, result, { isPartial, expanded }, width);
  }
  assert.equal(JSON.stringify(result.details), snapshot, "width/toggle renders cannot mutate metadata");
}

async function execute(tool: Tool, code: string) {
  const updates: Result[] = [];
  const result = await tool.execute("m21-source", { code }, undefined, (update) => updates.push(update), { cwd: process.cwd() });
  assert.ok(!body(result).includes(code), "ordinary result text must not append the whole source block");
  return { result, updates };
}

test("M21 payload/render: real success preserves CRLF, indentation and leading/trailing blanks", async () => {
  await withRegisteredTool(async (tool) => {
    const code = '\r\n# HIDDEN_SOURCE_SENTINEL\r\nif True:\r\n    print("STDOUT_OUTPUT")\r\n    value = "RETURN_OUTPUT"\r\nreturn value\r\n';
    const { result } = await execute(tool, code);
    assert.match(body(result), /STDOUT_OUTPUT/);
    assert.match(body(result), /RETURN_OUTPUT/);
    assert.ok(!body(result).includes("HIDDEN_SOURCE_SENTINEL"));
    assert.equal(result.details.failure, undefined);
    verifyDisclosure(tool, result, code);
  });
});

test("M21 payload/render: actual progress and nested updates share ordered source without invented arrows", async () => {
  await withRegisteredTool(async (tool, calls) => {
    const code = '# FIRST_SOURCE_SENTINEL\n# HIDDEN_SOURCE_SENTINEL\nvalue = await source_probe(value="probe")\nreturn value\n';
    const { result, updates } = await execute(tool, code);
    assert.deepEqual(calls, ["source_probe"]);
    assert.equal(body(result), "PROBE_OUTPUT");
    assert.equal(result.details.nestedToolCalls, 1);
    assert.deepEqual(result.details.nestedToolNames, ["source_probe"]);
    const progress = updates.filter((update) => Number.isInteger(update.details.currentLine));
    assert.ok(progress.length > 0, "real Python tracing must produce progress");
    for (const update of progress) {
      assert.ok(update.details.currentLine! >= 1 && update.details.currentLine! <= code.split("\n").length);
      assert.equal(update.details.totalLines, code.split("\n").length);
      verifyDisclosure(tool, update, code, true);
      assert.match(render(tool, update, { isPartial: true, expanded: true }), /→/);
    }
    const nested = updates.find((update) => body(update) === "Calling source_probe()");
    assert.ok(nested, "real RPC nested call update must be captured");
    assert.equal(nested.details.currentLine, undefined);
    verifyDisclosure(tool, nested, code, true);
    assert.doesNotMatch(render(tool, nested, { isPartial: true, expanded: true }), /→/);
    verifyDisclosure(tool, result, code);
  });
});

test("M21 payload/render: recognized report metadata and compact/expanded report bodies survive", async () => {
  await withRegisteredTool(async (tool) => {
    const code = '# FIRST_SOURCE_SENTINEL\n# HIDDEN_SOURCE_SENTINEL\nreturn ptc.report(title="Synthetic report", metrics={"files": 2})\n';
    const { result } = await execute(tool, code);
    assert.equal(result.details.reportProduced, true);
    assert.equal(result.details.report?.title, "Synthetic report");
    assert.deepEqual(result.details.report?.metrics, { files: 2 });
    assert.equal(JSON.parse(body(result)).kind, "ptc_report");
    for (const expanded of [false, true]) assert.match(render(tool, result, { expanded }), /Synthetic report/);
    verifyDisclosure(tool, result, code);
  });
});

for (const [label, code, diagnostic] of [
  ["ValueError", '# FIRST_SOURCE_SENTINEL\n# HIDDEN_SOURCE_SENTINEL\nif True:\n    raise ValueError("SYNTHETIC_FAILURE")\n', /SYNTHETIC_FAILURE/],
  ["syntax failure", '\n# HIDDEN_SOURCE_SENTINEL\ndef broken(\nreturn 1\n', /SyntaxError/],
] as const) {
  test(`M21 payload/render: real ${label} retains failure details and source after diagnostics`, async () => {
    await withRegisteredTool(async (tool) => {
      const { result } = await execute(tool, code);
      assert.equal(result.details.failure?.type, "python");
      assert.match(body(result), diagnostic);
      assert.match(render(tool, result, { expanded: true }), diagnostic);
      verifyDisclosure(tool, result, code);
    });
  });
}
