import test from "node:test";
import assert from "node:assert/strict";
import { Type } from "@sinclair/typebox";
import type { ToolInfo } from "../dist/contracts/tool-types.js";
import { generateToolWrappers } from "../dist/tools/tool-wrapper.js";

test("generateToolWrappers emits concise wrappers with typed result models", () => {
  const code = generateToolWrappers([
    {
      name: "read",
      description: "Read a file",
      parameters: Type.Object({
        path: Type.String({ description: "Path" }),
        offset: Type.Optional(Type.Integer({ description: "Offset" })),
      }, { additionalProperties: false }),
      source: "builtin",
      isReadOnly: true,
      execute: (async () => ({ content: [{ type: "text", text: "ok" }], details: undefined })) as ToolInfo["execute"],
      ptc: { pythonName: "read_text" },
    },
    {
      name: "glob",
      description: "Find files",
      parameters: Type.Object({
        pattern: Type.String({ description: "Glob" }),
        path: Type.Optional(Type.Union([
          Type.String(),
          Type.Integer(),
        ], { description: "Base path or numeric selector" })),
      }, { additionalProperties: false }),
      source: "alias",
      isReadOnly: true,
      execute: (async () => ({ content: [{ type: "text", text: "ok" }], details: undefined })) as ToolInfo["execute"],
      ptc: { pythonName: "glob_py" },
    },
    {
      name: "bash",
      description: "Run shell command",
      parameters: Type.Object({
        command: Type.String({ description: "Command" }),
      }, { additionalProperties: false }),
      source: "builtin",
      isReadOnly: false,
      execute: (async () => ({ content: [{ type: "text", text: "ok" }], details: undefined })) as ToolInfo["execute"],
    },
  ] as ToolInfo[]);

  assert.match(code, /import json as _ptc_json/);
  assert.match(code, /from typing import Optional, List, Dict, Any, TypedDict, Union, Literal/);
  assert.match(code, /class BashResult\(TypedDict\):/);
  assert.match(code, /class ReadLine\(TypedDict\):/);
  assert.match(code, /class ReadResult\(TypedDict\):/);
  assert.match(code, /class GrepResult\(TypedDict\):/);
  assert.match(code, /class ResponseHandle\(TypedDict\):/);
  assert.match(code, /kind: Literal\["response"\]/);
  assert.match(code, /class FileHandle\(TypedDict\):/);
  assert.match(code, /kind: Literal\["file"\]/);
  assert.match(code, /SupportedHandle = Union\[ResponseHandle, FileHandle\]/);
  assert.match(code, /class CallableToolMetadata\(TypedDict\):/);
  assert.match(code, /pythonName: str/);
  assert.match(code, /parameters: Dict\[str, Any\]/);
  assert.match(code, /_PTC_CALLABLE_TOOL_METADATA: List\[CallableToolMetadata\] = _ptc_json\.loads\(/);
  assert.match(code, /\\"name\\":\\"read\\"/);
  assert.match(code, /\\"pythonName\\":\\"read_text\\"/);
  assert.match(code, /\\"name\\":\\"glob\\"/);
  assert.match(code, /\\"pythonName\\":\\"glob_py\\"/);
  assert.match(code, /async def read\(/);
  assert.match(code, /\) -> Union\[str, ReadResult\]:/);
  assert.match(code, /path: str/);
  assert.doesNotMatch(code, /file_path/);
  assert.match(code, /async def glob_py\(/);
  assert.match(code, /path: Optional\[Union\[str, int\]\] = None/);
  assert.match(code, /async def bash\(/);
  assert.match(code, /\) -> BashResult:/);
  assert.doesNotMatch(code, /Args:/);
  assert.match(code, /return await _rpc_call\("glob", params\)/);
  assert.match(code, /class EditSpan\(TypedDict, total=False\):/);
});
