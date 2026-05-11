import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { CodeExecutor } from "../dist/code-executor.js";

type EcosystemToolStub = {
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

type RuntimeStats = {
  activeCalls: number;
  maxActiveCalls: number;
  seenCalls: string[];
};

function createExecutor(stats: RuntimeStats, maxOutputChars = 700) {
  const workspace = mkdtempSync(path.join(tmpdir(), "ptc-ecosystem-"));
  const fetchedPagePath = path.join(workspace, "fetched-page.md");
  writeFileSync(
    fetchedPagePath,
    [
      "# Orchestration helper notes",
      "- Keep intermediate tool results inside Python.",
      "- Return compact summaries or bounded previews.",
      "- Prefer focused follow-up reads over dumping full payloads.",
    ].join("\n"),
    "utf8"
  );

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

  const tools: EcosystemToolStub[] = [
    {
      name: "search_hashline",
      description: "Return a structured hashline-style search payload for a scope/query pair.",
      parameters: {
        type: "object",
        properties: {
          scope: { type: "string" },
          query: { type: "string" },
          delayMs: { type: "integer" },
        },
        required: ["scope", "query"],
        additionalProperties: false,
      },
      source: "extension",
      isReadOnly: true,
    },
    {
      name: "graph_primary",
      description: "Primary graph lookup that can fail deterministically.",
      parameters: {
        type: "object",
        properties: {
          symbol: { type: "string" },
        },
        required: ["symbol"],
        additionalProperties: false,
      },
      source: "extension",
      isReadOnly: true,
    },
    {
      name: "graph_cached",
      description: "Fallback graph lookup that returns a compact symbol summary.",
      parameters: {
        type: "object",
        properties: {
          symbol: { type: "string" },
        },
        required: ["symbol"],
        additionalProperties: false,
      },
      source: "extension",
      isReadOnly: true,
    },
    {
      name: "fetch_page",
      description: "Return response/file handles plus nested metadata for a fetched page.",
      parameters: {
        type: "object",
        properties: {
          url: { type: "string" },
        },
        required: ["url"],
        additionalProperties: false,
      },
      source: "extension",
      isReadOnly: true,
    },
    {
      name: "read",
      description: "Read a text file and return plain text content.",
      parameters: {
        type: "object",
        properties: {
          path: { type: "string" },
          offset: { type: "integer" },
          limit: { type: "integer" },
        },
        required: ["path"],
        additionalProperties: false,
      },
      source: "builtin",
      isReadOnly: true,
    },
  ];

  const toolRegistry = {
    createCallableToolRuntime() {
      return {
        tools,
        runTool: async (toolName: string, params: Record<string, unknown>) => {
          const label = typeof params.scope === "string"
            ? params.scope
            : typeof params.symbol === "string"
              ? params.symbol
              : typeof params.url === "string"
                ? params.url
                : "<none>";

          stats.seenCalls.push(`${toolName}:${label}`);
          stats.activeCalls += 1;
          stats.maxActiveCalls = Math.max(stats.maxActiveCalls, stats.activeCalls);

          try {
            const delayMs = typeof params.delayMs === "number" ? params.delayMs : 0;
            if (delayMs > 0) {
              await delay(delayMs);
            }

            if (toolName === "search_hashline") {
              const scope = typeof params.scope === "string" ? params.scope : "unknown";
              const query = typeof params.query === "string" ? params.query : "query";
              const shortScope = scope.slice(0, 2) || "xx";
              return {
                content: [{ type: "text", text: JSON.stringify({ scope, query }) }],
                details: {
                  ptcValue: {
                    kind: "grep",
                    scope,
                    query,
                    matches: [
                      {
                        path: `src/${scope}.ts`,
                        line: 10,
                        anchor: `10:${shortScope}a1`,
                        text: `const ${query}_${scope} = true;`,
                      },
                      {
                        path: `src/${scope}.ts`,
                        line: 18,
                        anchor: `18:${shortScope}b2`,
                        text: `return ${query}_${scope};`,
                      },
                    ],
                  },
                },
              };
            }

            if (toolName === "graph_primary") {
              const symbol = typeof params.symbol === "string" ? params.symbol : "unknown";
              throw new Error(`no live graph result for ${symbol}`);
            }

            if (toolName === "graph_cached") {
              const symbol = typeof params.symbol === "string" ? params.symbol : "unknown";
              return {
                content: [{ type: "text", text: JSON.stringify({ symbol }) }],
                details: {
                  ptcValue: {
                    kind: "symbol_card",
                    name: symbol,
                    path: "src/code-executor.ts",
                    signature: "class CodeExecutor",
                    summary: `cached summary for ${symbol}`,
                    score: 0.91,
                  },
                },
              };
            }

            if (toolName === "fetch_page") {
              const url = typeof params.url === "string" ? params.url : "https://example.com";
              return {
                content: [{ type: "text", text: JSON.stringify({ url }) }],
                details: {
                  ptcValue: {
                    title: "Orchestration helper page",
                    url,
                    responseId: "resp_orchestration_page",
                    filePath: fetchedPagePath,
                    sections: [
                      {
                        heading: "Summary",
                        bullets: [
                          "batch_tool for repeated calls",
                          "first_success for ordered fallback",
                          "fit_output for bounded previews",
                        ],
                      },
                    ],
                  },
                },
              };
            }

            if (toolName === "read") {
              const targetPath = typeof params.path === "string" ? params.path : "";
              const offset = typeof params.offset === "number" ? Math.max(1, params.offset) : 1;
              const limit = typeof params.limit === "number" ? Math.max(1, params.limit) : undefined;
              const lines = readFileSync(targetPath, "utf8").split(/\r?\n/);
              const sliced = lines.slice(offset - 1, limit ? offset - 1 + limit : undefined).join("\n");
              return {
                content: [{ type: "text", text: sliced }],
              };
            }

            throw new Error(`Unexpected nested tool call: ${toolName}`);
          } finally {
            stats.activeCalls -= 1;
          }
        },
      };
    },
  };

  return new CodeExecutor(
    sandboxManager,
    toolRegistry as any,
    {
      executionTimeoutMs: 10_000,
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
}

test("ecosystem hashline-style batching keeps nested search results local before bounded output fitting", async () => {
  const stats: RuntimeStats = { activeCalls: 0, maxActiveCalls: 0, seenCalls: [] };
  const executor = createExecutor(stats, 420);

  const result = await executor.execute(
    [
      "calls = [",
      '  {"tool": "search_hashline", "params": {"scope": "alpha", "query": "helper", "delayMs": 40}},',
      '  {"tool": "search_hashline", "params": {"scope": "beta", "query": "helper", "delayMs": 5}},',
      '  {"tool": "search_hashline", "params": {"scope": "gamma", "query": "helper", "delayMs": 5}},',
      "]",
      "searches = await ptc.batch_tool(calls, max_concurrency=2)",
      'summary = [{"path": entry["matches"][0]["path"], "anchor": entry["matches"][0]["anchor"]} for entry in searches]',
      'return ptc.fit_output({"workflow": "hashline", "searches": searches, "summary": summary, "notes": "n" * 220}, max_chars=420, max_items=2, max_depth=3)',
    ].join("\n"),
    {
      cwd: process.cwd(),
      ctx: ({ cwd: process.cwd() } as any),
    }
  );

  const parsed = JSON.parse(result.output);
  assert.equal(parsed.kind, "fit_output");
  assert.equal(parsed.limits.maxChars, 420);
  assert.equal(parsed.limits.maxItems, 2);
  assert.equal(parsed.limits.maxDepth, 3);
  assert.equal(parsed.truncated, true);
  assert.match(typeof parsed.preview === "string" ? parsed.preview : JSON.stringify(parsed.preview), /alpha/);
  assert.equal(stats.maxActiveCalls, 2);
  assert.deepEqual(stats.seenCalls, [
    "search_hashline:alpha",
    "search_hashline:beta",
    "search_hashline:gamma",
  ]);
});

test("ecosystem hashline-style reduction preserves input order while summarizing anchored payloads", async () => {
  const stats: RuntimeStats = { activeCalls: 0, maxActiveCalls: 0, seenCalls: [] };
  const executor = createExecutor(stats);

  const result = await executor.execute(
    [
      "calls = [",
      '  {"tool": "search_hashline", "params": {"scope": "alpha", "query": "anchor", "delayMs": 40}},',
      '  {"tool": "search_hashline", "params": {"scope": "beta", "query": "anchor", "delayMs": 5}},',
      '  {"tool": "search_hashline", "params": {"scope": "gamma", "query": "anchor", "delayMs": 5}},',
      "]",
      "summary = await ptc.reduce_tool(",
      "  calls,",
      '  lambda acc, entry: {"paths": acc["paths"] + [entry["matches"][0]["path"]], "anchors": acc["anchors"] + [entry["matches"][0]["anchor"]]},',
      '  initial={"paths": [], "anchors": []},',
      "  max_concurrency=2,",
      ")",
      "return summary",
    ].join("\n"),
    {
      cwd: process.cwd(),
      ctx: ({ cwd: process.cwd() } as any),
    }
  );

  assert.deepEqual(JSON.parse(result.output), {
    paths: ["src/alpha.ts", "src/beta.ts", "src/gamma.ts"],
    anchors: ["10:ala1", "10:bea1", "10:gaa1"],
  });
  assert.equal(stats.maxActiveCalls, 2);
  assert.deepEqual(stats.seenCalls, [
    "search_hashline:alpha",
    "search_hashline:beta",
    "search_hashline:gamma",
  ]);
});

test("ecosystem codegraph-style fallback uses ptc.first_success in ordered sequence", async () => {
  const stats: RuntimeStats = { activeCalls: 0, maxActiveCalls: 0, seenCalls: [] };
  const executor = createExecutor(stats);

  const result = await executor.execute(
    [
      "graph_result = await ptc.first_success([",
      '  {"tool": "graph_primary", "params": {"symbol": "CodeExecutor"}},',
      '  {"tool": "graph_cached", "params": {"symbol": "CodeExecutor"}},',
      '  {"tool": "graph_cached", "params": {"symbol": "ShouldNotRun"}},',
      "], max_concurrency=3)",
      'return {"name": graph_result["name"], "summary": graph_result["summary"], "path": graph_result["path"]}',
    ].join("\n"),
    {
      cwd: process.cwd(),
      ctx: ({ cwd: process.cwd() } as any),
    }
  );

  assert.deepEqual(JSON.parse(result.output), {
    name: "CodeExecutor",
    summary: "cached summary for CodeExecutor",
    path: "src/code-executor.ts",
  });
  assert.equal(stats.maxActiveCalls, 1);
  assert.deepEqual(stats.seenCalls, [
    "graph_primary:CodeExecutor",
    "graph_cached:CodeExecutor",
  ]);
});

test("ecosystem web-handle follow-up can fit nested handle-aware output into a bounded preview", async () => {
  const stats: RuntimeStats = { activeCalls: 0, maxActiveCalls: 0, seenCalls: [] };
  const executor = createExecutor(stats, 520);

  const result = await executor.execute(
    [
      'fetched = await fetch_page(url="https://example.com/docs/orchestration")',
      'response_handle = ptc.first_handle(fetched, kind="response")',
      'file_handle = ptc.first_handle(fetched, kind="file")',
      'file_preview = await ptc.read_text(file_handle["filePath"], limit=2) if file_handle else None',
      'return ptc.fit_output({"workflow": "web", "response_handle": response_handle, "file_handle": file_handle, "file_preview": file_preview, "all_handles": ptc.extract_handles(fetched)}, max_chars=520, max_items=3, max_depth=3)',
    ].join("\n"),
    {
      cwd: process.cwd(),
      ctx: ({ cwd: process.cwd() } as any),
    }
  );

  const parsed = JSON.parse(result.output);
  assert.equal(parsed.kind, "fit_output");
  assert.equal(parsed.limits.maxChars, 520);
  assert.equal(parsed.truncated, true);
  assert.match(JSON.stringify(parsed.preview), /response_handle/);
  assert.match(JSON.stringify(parsed.preview), /fetched-page\.md/);
  assert.deepEqual(stats.seenCalls, [
    "fetch_page:https://example.com/docs/orchestration",
    "read:<none>",
  ]);
});
