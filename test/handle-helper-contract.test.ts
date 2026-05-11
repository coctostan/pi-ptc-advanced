const test = require("node:test");
import type {} from "node:test";
const assert = require("node:assert/strict");
const path = require("node:path");
const { readFileSync } = require("node:fs");
const { generateToolWrappers } = require("../dist/tools/tool-wrapper.js");

test("README handle-helper guidance stays aligned with the generated helper surface", () => {
  const wrapperCode = generateToolWrappers([]);
  const readme = readFileSync(path.resolve(__dirname, "../README.md"), "utf8");

  assert.match(wrapperCode, /class ResponseHandle\(TypedDict\):/);
  assert.match(wrapperCode, /class FileHandle\(TypedDict\):/);
  assert.match(wrapperCode, /SupportedHandle = Union\[ResponseHandle, FileHandle\]/);

  assert.match(readme, /ptc\.extract_handles\(value, kind=None\) -> list\[SupportedHandle\]/);
  assert.match(readme, /ptc\.first_handle\(value, kind=None\) -> Optional\[SupportedHandle\]/);
  assert.match(readme, /SupportedHandle = Union\[ResponseHandle, FileHandle\]/);
  assert.match(readme, /Response\/file handles are supported now; graph handles are still out of scope\./);
  assert.match(readme, /response_handle = ptc\.first_handle\(result, kind="response"\)/);
  assert.match(readme, /file_handle = ptc\.first_handle\(result, kind="file"\)/);
  assert.match(readme, /ptc\.extract_handles\(result\)/);
  assert.match(readme, /get_search_content\(responseId=response_handle\["responseId"\], urlIndex=0\)/);
  assert.match(readme, /ptc\.read_text\(file_handle\["filePath"\], limit=20\)/);
});
