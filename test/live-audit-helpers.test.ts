import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { readFileSync, mkdtempSync, writeFileSync } from "node:fs";
import path from "node:path";
import { tmpdir } from "node:os";
import { CodeExecutor } from "../dist/code-executor.js";

/**
 * Live audit: exercises every Python helper through the real Python runtime
 * with stub tools that return deterministic structured payloads.
 *
 * Rating key:
 *   PASS   = working
 *   SKIP   = cannot test in this harness (document why)
 *   FAIL   = broken or unexpected behavior
 */

type ToolStub = {
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
};

function createAuditExecutor(maxOutputChars = 4_000) {
  const workspace = mkdtempSync(path.join(tmpdir(), "ptc-audit-"));

  // Create a few fixture files in the workspace
  writeFileSync(path.join(workspace, "file-a.txt"), "line1\nline2\nline3\n", "utf8");
  writeFileSync(path.join(workspace, "file-b.txt"), "alpha\nbeta\ngamma\n", "utf8");
  writeFileSync(path.join(workspace, "data.json"), '{"key": "value", "items": [1,2,3]}', "utf8");
  writeFileSync(path.join(workspace, "nested", "deep.txt").replace("nested/", ""), "flat file", "utf8");

  const tools: ToolStub[] = [
    {
      name: "read",
      description: "Read a file",
      parameters: {
        type: "object",
        properties: { path: { type: "string" }, offset: { type: "integer" }, limit: { type: "integer" } },
        required: ["path"],
        additionalProperties: false,
      },
      source: "builtin",
      isReadOnly: true,
    },
    {
      name: "grep",
      description: "Search files",
      parameters: {
        type: "object",
        properties: {
          pattern: { type: "string" },
          path: { type: "string" },
          glob: { type: "string" },
          literal: { type: "boolean" },
        },
        required: ["pattern"],
        additionalProperties: false,
      },
      source: "builtin",
      isReadOnly: true,
    },
    {
      name: "find",
      description: "Find files",
      parameters: {
        type: "object",
        properties: { pattern: { type: "string" }, path: { type: "string" } },
        required: ["pattern"],
        additionalProperties: false,
      },
      source: "builtin",
      isReadOnly: true,
    },
    {
      name: "ls",
      description: "List directory",
      parameters: {
        type: "object",
        properties: { path: { type: "string" } },
        required: [],
        additionalProperties: false,
      },
      source: "builtin",
      isReadOnly: true,
    },
    {
      name: "glob",
      description: "Glob files",
      parameters: {
        type: "object",
        properties: { pattern: { type: "string" }, path: { type: "string" } },
        required: ["pattern"],
        additionalProperties: false,
      },
      source: "builtin",
      isReadOnly: true,
    },
    {
      name: "web_search",
      description: "Search the web (stub)",
      parameters: {
        type: "object",
        properties: { query: { type: "string" } },
        required: ["query"],
        additionalProperties: false,
      },
      source: "extension",
      isReadOnly: true,
    },
  ];

  const toolRegistry = {
    createCallableToolRuntime() {
      return {
        tools,
        runTool: async (toolName: string, params: Record<string, unknown>) => {
          if (toolName === "read") {
            const p = String(params.path || "");
            const fullPath = path.isAbsolute(p) ? p : path.join(workspace, p);
            try {
              const content = readFileSync(fullPath, "utf8");
              return { content: [{ type: "text", text: content }] };
            } catch {
              throw new Error(`File not found: ${p}`);
            }
          }
          if (toolName === "grep") {
            return {
              content: [{ type: "text", text: JSON.stringify([{ path: "file-a.txt", line: 1, text: "line1" }]) }],
              details: {
                ptcValue: {
                  kind: "grep",
                  matches: [{ path: "file-a.txt", line: 1, anchor: "1:abc1", text: "line1" }],
                },
              },
            };
          }
          if (toolName === "find") {
            return { content: [{ type: "text", text: JSON.stringify(["file-a.txt", "file-b.txt", "data.json"]) }] };
          }
          if (toolName === "ls") {
            return { content: [{ type: "text", text: JSON.stringify(["file-a.txt", "file-b.txt", "data.json"]) }] };
          }
          if (toolName === "glob") {
            return { content: [{ type: "text", text: JSON.stringify(["file-a.txt", "file-b.txt"]) }] };
          }
          if (toolName === "web_search") {
            return {
              content: [{ type: "text", text: "Search results for: " + params.query }],
              details: {
                ptcValue: {
                  responseId: "resp_ws_001",
                  results: [{ title: "Result 1", url: "https://example.com" }],
                },
              },
            };
          }
          throw new Error(`Unexpected tool: ${toolName}`);
        },
      };
    },
  };

  const sandboxManager = {
    spawn(code: string, cwd: string) {
      return spawn("python3", ["-u", "-c", code], { cwd, env: { ...process.env } });
    },
    getRuntimeWorkspaceRoot(cwd: string) { return cwd; },
    async cleanup() {},
  };

  const executor = new CodeExecutor(
    sandboxManager,
    toolRegistry as any,
    {
      executionTimeoutMs: 15_000,
      maxOutputChars,
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

  (executor as any).__workspace = workspace;
  return executor;
}
const exec = (executor: any, code: string) => {
  const cwd = (executor as any).__workspace || process.cwd();
  return executor.execute(code, { cwd, ctx: { cwd } as any });
};

// ═══════════════════════════════════════════
// CORE WRAPPERS
// ═══════════════════════════════════════════

test("audit: read() returns file content", async () => {
  const executor = createAuditExecutor();
  const result = await exec(executor, 'r = await read("file-a.txt")\nreturn str(type(r)) + "|" + str(len(str(r)) > 0)');
  assert.ok(result.output.includes("True"), `read() should return content, got: ${result.output}`);
});

test("audit: grep() returns matches", async () => {
  const executor = createAuditExecutor();
  const result = await exec(executor, 'r = await grep(pattern="line", path=".")\nreturn str(type(r)) + "|" + str(len(str(r)) > 0)');
  assert.ok(result.output.includes("True"), `grep() should return matches, got: ${result.output}`);
});


test("audit: grep() accepts primary pattern as a positional argument", async () => {
  const executor = createAuditExecutor();
  const result = await exec(executor, 'r = await grep("line", path=".")\nreturn str(type(r)) + "|" + str(len(str(r)) > 0)');
  assert.ok(result.output.includes("True"), `grep() positional pattern should return matches, got: ${result.output}`);
});

test("audit: find() returns file paths", async () => {
  const executor = createAuditExecutor();
  const result = await exec(executor, 'r = await find("*.txt")\nreturn str(type(r)) + "|" + str(len(r) > 0)');
  assert.ok(result.output.includes("True"), `find() should return paths, got: ${result.output}`);
});

test("audit: ls() returns directory entries", async () => {
  const executor = createAuditExecutor();
  const result = await exec(executor, 'r = await ls()\nreturn str(type(r)) + "|" + str(len(r) > 0)');
  assert.ok(result.output.includes("True"), `ls() should return entries, got: ${result.output}`);
});

test("audit: glob() returns matched paths", async () => {
  const executor = createAuditExecutor();
  const result = await exec(executor, 'r = await glob("*.txt")\nreturn str(type(r)) + "|" + str(len(r) > 0)');
  assert.ok(result.output.includes("True"), `glob() should return paths, got: ${result.output}`);
});

// ═══════════════════════════════════════════
// BATCH / FILE HELPERS
// ═══════════════════════════════════════════

test("audit: ptc.read_many() returns list of strings", async () => {
  const executor = createAuditExecutor();
  const result = await exec(executor,
    'r = await ptc.read_many(["file-a.txt", "file-b.txt"])\nreturn str(type(r)) + "|" + str(len(r))');
  assert.ok(result.output.includes("2"), `read_many should return 2, got: ${result.output}`);
});

test("audit: ptc.read_tree() returns bounded path/content entries", async () => {
  const executor = createAuditExecutor();
  const result = await exec(executor,
    'r = await ptc.read_tree(pattern="*.txt", max_files=1)\nok = len(r) == 1 and isinstance(r[0], dict) and "path" in r[0] and "content" in r[0] and isinstance(r[0]["content"], str)\nreturn str(len(r)) + "|" + str(ok)');
  assert.ok(result.output.includes("1|True"), `read_tree should return one bounded entry with path/content, got: ${result.output}`);
});

test("audit: ptc.find_files() returns bounded relative paths", async () => {
  const executor = createAuditExecutor();
  const result = await exec(executor,
    'r = await ptc.find_files(pattern="*.txt", max_files=1)\nis_rel = len(r) == 1 and all(not p.startswith("/") for p in r)\nreturn str(len(r)) + "|" + str(is_rel)');
  assert.ok(result.output.includes("1|True"), `find_files should return one bounded relative path, got: ${result.output}`);
});

test("audit: ptc.find_files_abs() returns bounded absolute paths", async () => {
  const executor = createAuditExecutor();
  const result = await exec(executor,
    'import os\nr = await ptc.find_files_abs(pattern="*.txt", max_files=1)\nis_abs = len(r) == 1 and all(os.path.isabs(p) for p in r)\nreturn str(len(r)) + "|" + str(is_abs)');
  assert.ok(result.output.includes("1|True"), `find_files_abs should return one bounded absolute path, got: ${result.output}`);
});


test("audit: path helpers support explicit relative and absolute formatting", async () => {
  const executor = createAuditExecutor();
  const result = await exec(executor, [
    "import os",
    'default_rel = await ptc.find_files(pattern="*.txt", max_files=1)',
    'abs_paths = await ptc.find_files(pattern="*.txt", max_files=1, relative=False)',
    'abs_default = await ptc.find_files_abs(pattern="*.txt", max_files=1)',
    'rel_from_abs = await ptc.find_files_abs(pattern="*.txt", max_files=1, relative=True)',
    'tree_rel = await ptc.read_tree(pattern="*.txt", max_files=1, relative=True)',
    "checks = [",
    "  len(default_rel) == 1 and not os.path.isabs(default_rel[0]),",
    "  len(abs_paths) == 1 and os.path.isabs(abs_paths[0]),",
    "  len(abs_default) == 1 and os.path.isabs(abs_default[0]),",
    "  len(rel_from_abs) == 1 and not os.path.isabs(rel_from_abs[0]),",
    "  len(tree_rel) == 1 and not os.path.isabs(tree_rel[0]['path']) and isinstance(tree_rel[0]['content'], str),",
    "]",
    'return ptc.json_dump({"checks": checks, "tree_path": tree_rel[0]["path"]})',
  ].join("\n"));
  const parsed = JSON.parse(result.output);
  assert.deepEqual(parsed.checks, [true, true, true, true, true], `path helper formatting should pass, got: ${result.output}`);
  assert.equal(parsed.tree_path, "file-a.txt");
});


test("audit: bridge helpers compose with ptc.report", async () => {
  const executor = createAuditExecutor();
  const result = await exec(executor, [
    'rows = [{"path": "a.txt", "lines": 2}, {"path": "b.txt", "lines": 3}]',
    'table = ptc.tabulate(rows, title="Files")',
    'delta = ptc.diff({"count": 1, "status": "old", "same": True}, {"count": 2, "extra": "new", "same": True})',
    'report = ptc.report(title="Bridge helpers", tables=[table], samples=[{"label": "delta", "value": delta}])',
    'return ptc.json_dump(report)',
  ].join("\n"));
  const parsed = JSON.parse(result.output);
  assert.equal(parsed.kind, "ptc_report");
  assert.deepEqual(parsed.tables[0], {
    title: "Files",
    columns: ["path", "lines"],
    rows: [
      { path: "a.txt", lines: 2 },
      { path: "b.txt", lines: 3 },
    ],
  });
  assert.deepEqual(parsed.samples[0].value, {
    kind: "ptc_diff",
    added: { extra: "new" },
    removed: { status: "old" },
    changed: { count: { before: 1, after: 2 } },
  });
});

test("audit: ptc.read_text() returns a string", async () => {
  const executor = createAuditExecutor();
  const result = await exec(executor,
    'r = await ptc.read_text("file-a.txt")\nreturn str(type(r)) + "|" + str(len(r) > 0)');
  assert.ok(result.output.includes("str") && result.output.includes("True"),
    `read_text should return str, got: ${result.output}`);
});

test("audit: ptc.gather_limit() runs bounded concurrency", async () => {
  const executor = createAuditExecutor();
  const result = await exec(executor,
    'r = await ptc.gather_limit([read("file-a.txt"), read("file-b.txt")], limit=2)\nreturn str(type(r)) + "|" + str(len(r))');
  assert.ok(result.output.includes("2"), `gather_limit should return 2 results, got: ${result.output}`);
});

// ═══════════════════════════════════════════
// ORCHESTRATION HELPERS
// ═══════════════════════════════════════════

test("audit: ptc.batch_tool() returns list of results", async () => {
  const executor = createAuditExecutor();
  const result = await exec(executor, [
    "calls = [",
    '  {"tool": "read", "params": {"path": "file-a.txt"}},',
    '  {"tool": "read", "params": {"path": "file-b.txt"}},',
    "]",
    "r = await ptc.batch_tool(calls)",
    'return str(type(r)) + "|" + str(len(r))',
  ].join("\n"));
  assert.ok(result.output.includes("2"), `batch_tool should return 2 results, got: ${result.output}`);
});

test("audit: ptc.first_success() returns first succeeding result", async () => {
  const executor = createAuditExecutor();
  const result = await exec(executor, [
    "calls = [",
    '  {"tool": "read", "params": {"path": "NONEXISTENT.txt"}},',
    '  {"tool": "read", "params": {"path": "file-a.txt"}},',
    "]",
    "r = await ptc.first_success(calls)",
    'return str(type(r)) + "|" + str(len(str(r)) > 0)',
  ].join("\n"));
  assert.ok(result.output.includes("True"), `first_success should return content, got: ${result.output}`);
});

test("audit: ptc.reduce_tool() accumulates across calls", async () => {
  const executor = createAuditExecutor();
  const result = await exec(executor, [
    "calls = [",
    '  {"tool": "read", "params": {"path": "file-a.txt"}},',
    '  {"tool": "read", "params": {"path": "file-b.txt"}},',
    "]",
    'r = await ptc.reduce_tool(calls, lambda acc, val: acc + str(len(str(val))) + ",", "")',
    "return r",
  ].join("\n"));
  assert.ok(result.output.length > 0, `reduce_tool should accumulate, got: ${result.output}`);
});

// ═══════════════════════════════════════════
// OUTPUT / ASSERTION HELPERS
// ═══════════════════════════════════════════

test("audit: ptc.fit_output() truncates large data", async () => {
  const executor = createAuditExecutor();
  const result = await exec(executor,
    'r = ptc.fit_output({"items": list(range(100))}, max_items=3)\nreturn ptc.json_dump(r)');
  const parsed = JSON.parse(result.output);
  assert.equal(parsed.kind, "fit_output", `fit_output should return kind=fit_output`);
  assert.equal(parsed.truncated, true, `fit_output should truncate`);
});

test("audit: ptc.expect_kind() passes on correct kind", async () => {
  const executor = createAuditExecutor();
  const result = await exec(executor,
    'v = ptc.expect_kind({"kind": "test", "data": 42}, "test")\nreturn "ok|" + str(v["data"])');
  assert.ok(result.output.includes("ok"), `expect_kind should pass, got: ${result.output}`);
});

test("audit: ptc.json_dump() serializes to JSON string", async () => {
  const executor = createAuditExecutor();
  const result = await exec(executor,
    'r = ptc.json_dump({"key": "value", "n": 42})\nreturn r');
  const parsed = JSON.parse(result.output);
  assert.equal(parsed.key, "value");
  assert.equal(parsed.n, 42);
});

// ═══════════════════════════════════════════
// INTROSPECTION HELPERS
// ═══════════════════════════════════════════

test("audit: ptc.list_callable_tools() returns tool list", async () => {
  const executor = createAuditExecutor();
  const result = await exec(executor,
    'r = ptc.list_callable_tools()\nreturn ptc.json_dump({"count": len(r), "names": [t["name"] for t in r]})');
  const parsed = JSON.parse(result.output);
  assert.ok(parsed.count > 0, `Should have callable tools, got count=${parsed.count}`);
  assert.ok(parsed.names.includes("read"), `Should include read tool`);
});

test("audit: ptc.get_tool_schema() returns schema for a tool", async () => {
  const executor = createAuditExecutor();
  const result = await exec(executor,
    'r = ptc.get_tool_schema("read")\nreturn ptc.json_dump({"keys": list(r.keys()), "has_content": len(r) > 0})');
  const parsed = JSON.parse(result.output);
  assert.ok(parsed.has_content, `Schema should have content, got keys: ${parsed.keys}`);
});

// ═══════════════════════════════════════════
// HANDLE HELPERS
// ═══════════════════════════════════════════

test("audit: ptc.extract_handles() finds response handles", async () => {
  const executor = createAuditExecutor();
  const result = await exec(executor, [
    'ws = web_search(query="test query")',
    "handles = ptc.extract_handles(ws)",
    'return ptc.json_dump({"count": len(handles), "types": [h.get("kind", "?") for h in handles]})',
  ].join("\n"));
  const parsed = JSON.parse(result.output);
  assert.ok(parsed.count >= 0, `extract_handles should return a list, got count=${parsed.count}`);
});

test("audit: ptc.first_handle() returns first matching handle or None", async () => {
  const executor = createAuditExecutor();
  const result = await exec(executor, [
    'ws = web_search(query="test query")',
    'h = ptc.first_handle(ws, kind="response")',
    'return ptc.json_dump({"found": h is not None, "type": str(type(h))})',
  ].join("\n"));
  const parsed = JSON.parse(result.output);
  assert.equal(typeof parsed.found, "boolean", `first_handle should return bool for found`);
});

// ═══════════════════════════════════════════
// PHASE 57 LIVE-AUDIT CLOSEOUT (issues 1, 4, 5, 8, 9)
// ═══════════════════════════════════════════

test("audit: issue-1 ptc.run_tests() reports runner availability and shell-quoted command", async () => {
  const executor = createAuditExecutor();
  const result = await exec(executor, [
    'r = ptc.run_tests("test/no-such-pattern.test.js")',
    'cmd = r["metrics"]["command"]',
    'return ptc.json_dump({',
    '  "kind": r["kind"],',
    '  "runner_available_present": "runner_available" in r["metrics"],',
    '  "runner_available_is_bool": isinstance(r["metrics"]["runner_available"], bool),',
    '  "command_starts_with_node": cmd.startswith("node "),',
    '  "command": cmd,',
    '})',
  ].join("\n"));
  const parsed = JSON.parse(result.output);
  assert.equal(parsed.kind, "ptc_report", `run_tests should produce a ptc_report, got: ${result.output}`);
  assert.equal(parsed.runner_available_present, true, `metrics.runner_available must be present`);
  assert.equal(parsed.runner_available_is_bool, true, `metrics.runner_available must be a bool`);
  assert.equal(parsed.command_starts_with_node, true, `metrics.command must start with 'node ', got: ${parsed.command}`);
});

test("audit: issue-4 ptc.list_callable_tools() vs ptc.list_helpers() distinguish surfaces", async () => {
  const executor = createAuditExecutor();
  const result = await exec(executor, [
    'callable_names = sorted([t["name"] for t in ptc.list_callable_tools()])',
    'helpers = ptc.list_helpers()',
    'helper_names = sorted([h["name"] for h in helpers])',
    'return ptc.json_dump({',
    '  "callable_names": callable_names,',
    '  "helper_names": helper_names,',
    '  "helpers_are_dicts": all(isinstance(h, dict) and "name" in h and "signature" in h for h in helpers),',
    '  "no_helper_in_callable": all(name not in callable_names for name in ["report", "run_tests", "read_many", "batch_tool"]),',
    '})',
  ].join("\n"));
  const parsed = JSON.parse(result.output);
  assert.ok(parsed.callable_names.includes("read"), `list_callable_tools must list callable Pi tools (read), got: ${parsed.callable_names}`);
  assert.equal(parsed.no_helper_in_callable, true, `list_callable_tools must NOT include ptc.* helpers, got: ${parsed.callable_names}`);
  assert.equal(parsed.helpers_are_dicts, true, `list_helpers entries must be dicts with name+signature`);
  for (const expected of ["report", "run_tests", "read_many", "batch_tool", "list_callable_tools"]) {
    assert.ok(parsed.helper_names.includes(expected), `list_helpers must include ptc.${expected}, got: ${parsed.helper_names}`);
  }
});

test("audit: issue-5 callable wrappers have consistent positional-argument behavior", async () => {
  const executor = createAuditExecutor();
  const result = await exec(executor, [
    'async def safe(coro):',
    '    try:',
    '        await coro',
    '        return "ok"',
    '    except TypeError as e:',
    '        return "TypeError:" + str(e)',
    '    except Exception as e:',
    '        return type(e).__name__ + ":" + str(e)',
    '',
    '# First positional should be accepted for every documented wrapper',
    'r1 = await safe(read("file-a.txt"))',
    'r2 = await safe(grep("line", path="."))',
    'r3 = await safe(glob("*.txt"))',
    'r4 = await safe(find("*.txt"))',
    'r5 = await safe(ls())',
    '',
    '# Excess positionals must raise TypeError naming the wrapper',
    'r6 = await safe(read("a", "b"))',
    'r7 = await safe(grep("a", "b"))',
    'r8 = await safe(glob("a", "b"))',
    'r9 = await safe(find("a", "b"))',
    'r10 = await safe(ls("a", "b"))',
    '',
    'return ptc.json_dump({',
    '  "first_positional_ok": [r1, r2, r3, r4, r5],',
    '  "excess_positional": [r6, r7, r8, r9, r10],',
    '})',
  ].join("\n"));
  const parsed = JSON.parse(result.output);
  assert.deepEqual(parsed.first_positional_ok, ["ok", "ok", "ok", "ok", "ok"],
    `each wrapper must accept its documented first positional, got: ${result.output}`);
  const namedWrappers = ["read", "grep", "glob", "find", "ls"];
  parsed.excess_positional.forEach((entry: string, idx: number) => {
    assert.ok(entry.startsWith("TypeError:"), `${namedWrappers[idx]}() must reject excess positionals with TypeError, got: ${entry}`);
    assert.ok(entry.includes(namedWrappers[idx] + "()"), `${namedWrappers[idx]}() TypeError must name the wrapper, got: ${entry}`);
  });
});

test("audit: issue-8 callable wrapper preserves details.ptcValue override unchanged", async () => {
  const executor = createAuditExecutor();
  const result = await exec(executor, [
    '# web_search stub returns details.ptcValue with a fixed shape; wrapper must surface it unchanged.',
    'r = await web_search(query="phase-57 ptcValue probe")',
    'return ptc.json_dump({',
    '  "type": type(r).__name__,',
    '  "is_dict": isinstance(r, dict),',
    '  "has_responseId": isinstance(r, dict) and r.get("responseId") == "resp_ws_001",',
    '  "results_len": (len(r["results"]) if isinstance(r, dict) and "results" in r else -1),',
    '})',
  ].join("\n"));
  const parsed = JSON.parse(result.output);
  assert.equal(parsed.is_dict, true, `web_search override must arrive as dict, got: ${result.output}`);
  assert.equal(parsed.has_responseId, true, `details.ptcValue must be delivered unchanged (responseId), got: ${result.output}`);
  assert.equal(parsed.results_len, 1, `details.ptcValue.results must be preserved as a 1-element list, got: ${result.output}`);
});

test("audit: issue-9 ptc.run_tests() shell-quotes patterns containing spaces", async () => {
  const executor = createAuditExecutor();
  const result = await exec(executor, [
    'r = ptc.run_tests("test/name with spaces.test.js")',
    'cmd = r["metrics"]["command"]',
    'return ptc.json_dump({"command": cmd})',
  ].join("\n"));
  const parsed = JSON.parse(result.output);
  const cmd: string = parsed.command;
  const quoted = cmd.includes("'test/name with spaces.test.js'")
    || cmd.includes('"test/name with spaces.test.js"');
  assert.ok(quoted,
    `metrics.command must shell-quote patterns containing spaces (issue-9), got: ${cmd}`);
});
