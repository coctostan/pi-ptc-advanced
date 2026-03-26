// @ts-nocheck
const test = module.require("node:test");
const assert = module.require("node:assert/strict");
const {
  extractSupportedHandles,
  normalizeToolResult,
} = module.require("../dist/tool-adapters.js");

const hashlineReadValue = {
  path: "src/tool-adapters.ts",
  startLine: 1,
  endLine: 3,
  lines: [
    { anchor: "1:abc123", text: 'import type { NormalizedToolResult } from "./contracts/execution-types";' },
    { anchor: "2:def456", text: "" },
    { anchor: "3:ghi789", text: "interface ToolExecutionResult {" },
  ],
};

const hashlineGrepValue = {
  matches: [
    { path: "src/tool-adapters.ts", anchor: "80:aa11", line: 80, text: "function extractPtcValue(details: unknown)", kind: "match" },
    { path: "src/tool-adapters.ts", anchor: "81:bb22", line: 81, text: 'if (!isRecord(details) || !("ptcValue" in details)) {', kind: "context" },
  ],
};

const hashlineEditValue = {
  ok: true,
  files: ["src/tool-adapters.ts"],
  edits: [
    {
      startAnchor: "79:aa11",
      endAnchor: "88:cc33",
      status: "applied",
    },
  ],
};

test("normalizeToolResult converts find empty sentinel to empty array", () => {
  const result = normalizeToolResult("find", {
    content: [{ type: "text", text: "No files found matching pattern" }],
  });

  assert.deepEqual(result.value, []);
  assert.equal(result.estimatedChars, 2);
});

test("normalizeToolResult parses grep output into structured matches when ptcValue is absent", () => {
  const result = normalizeToolResult("grep", {
    content: [
      {
        type: "text",
        text: "src/index.ts:12: const value = 1\nsrc/index.ts-13- const context = 2",
      },
    ],
  });

  assert.deepEqual(result.value, [
    { path: "src/index.ts", line: 12, text: "const value = 1", kind: "match" },
    { path: "src/index.ts", line: 13, text: "const context = 2", kind: "context" },
  ]);
});

test("normalizeToolResult returns read-style details.ptcValue unchanged", () => {
  const result = normalizeToolResult("read", {
    content: [{ type: "text", text: "human-readable hashline output" }],
    details: { ptcValue: hashlineReadValue },
  });

  assert.deepEqual(result.value, hashlineReadValue);
  assert.equal(result.estimatedChars, JSON.stringify(hashlineReadValue).length);
});

test("normalizeToolResult returns grep-style details.ptcValue unchanged", () => {
  const result = normalizeToolResult("grep", {
    content: [{ type: "text", text: "human-readable grep output" }],
    details: { ptcValue: hashlineGrepValue },
  });

  assert.deepEqual(result.value, hashlineGrepValue);
  assert.equal(result.estimatedChars, JSON.stringify(hashlineGrepValue).length);
});

test("normalizeToolResult returns edit-style details.ptcValue unchanged", () => {
  const result = normalizeToolResult("edit", {
    content: [{ type: "text", text: "Updated src/tool-adapters.ts" }],
    details: { ptcValue: hashlineEditValue, diff: "@@ -1 +1 @@" },
  });

  assert.deepEqual(result.value, hashlineEditValue);
  assert.equal(result.estimatedChars, JSON.stringify(hashlineEditValue).length);
});

test("normalizeToolResult returns details.ptcValue unchanged for generic custom tools", () => {
  const value = { rows: [{ id: 1 }], rowCount: 1 };
  const result = normalizeToolResult("query_db", {
    content: [{ type: "text", text: "Returned 1 rows" }],
    details: { ptcValue: value },
  });

  assert.deepEqual(result.value, value);
});

test("normalizeToolResult keeps read fallback on text only", () => {
  const result = normalizeToolResult("read", {
    content: [{ type: "text", text: "1:abc|first line\n2:def|second line" }],
  });

  assert.equal(result.value, "1:abc|first line\n2:def|second line");
});

test("normalizeToolResult keeps edit fallback on summary and diff when ptcValue is absent", () => {
  const result = normalizeToolResult("edit", {
    content: [{ type: "text", text: "Updated src/tool-adapters.ts" }],
    details: { diff: "@@ -1 +1 @@" },
  });

  assert.deepEqual(result.value, {
    ok: true,
    summary: "Updated src/tool-adapters.ts",
    diff: "@@ -1 +1 @@",
  });
});

test("normalizeToolResult keeps custom tool fallback on text only", () => {
  const result = normalizeToolResult("query_db", {
    content: [{ type: "text", text: "Returned 1 rows" }],
    details: { internal: true },
  });

  assert.equal(result.value, "Returned 1 rows");
});

test("extractSupportedHandles returns response and file handles for fetch_content payloads", () => {
  const handles = extractSupportedHandles("fetch_content", {
    responseId: "resp_fetch_123",
    urls: [
      {
        url: "https://example.com/page",
        title: "Example",
        filePath: "/tmp/pi-web-example.txt",
      },
    ],
    successCount: 1,
    totalCount: 1,
  });

  assert.deepEqual(handles, [
    { kind: "response", responseId: "resp_fetch_123" },
    { kind: "file", filePath: "/tmp/pi-web-example.txt" },
  ]);
});

test("extractSupportedHandles deduplicates repeated response and file handles", () => {
  const handles = extractSupportedHandles("fetch_content", {
    responseId: "resp_fetch_123",
    urls: [
      { filePath: "/tmp/pi-web-example.txt" },
      { responseId: "resp_fetch_123", filePath: "/tmp/pi-web-example.txt" },
    ],
  });

  assert.deepEqual(handles, [
    { kind: "response", responseId: "resp_fetch_123" },
    { kind: "file", filePath: "/tmp/pi-web-example.txt" },
  ]);
});

test("extractSupportedHandles supports web_search response handles without requiring file handles", () => {
  const handles = extractSupportedHandles("web_search", {
    responseId: "resp_search_123",
    queries: [{ query: "vitest", results: [{ url: "https://vitest.dev" }] }],
  });

  assert.deepEqual(handles, [{ kind: "response", responseId: "resp_search_123" }]);
});

test("extractSupportedHandles returns empty for unsupported tool names", () => {
  const handles = extractSupportedHandles("query_db", {
    responseId: "resp_fetch_123",
    filePath: "/tmp/pi-web-example.txt",
  });

  assert.deepEqual(handles, []);
});

test("extractSupportedHandles returns empty when supported tool payload has no responseId or filePath", () => {
  const handles = extractSupportedHandles("fetch_content", {
    urls: [{ url: "https://example.com/page", title: "Example" }],
    successCount: 1,
    totalCount: 1,
  });

  assert.deepEqual(handles, []);
});
