import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("README callable-tool introspection guidance stays aligned with the shipped helper surface", () => {
  const readme = readFileSync(new URL("../README.md", import.meta.url), "utf8");
  const runtimeSource = readFileSync(new URL("../src/python-runtime/runtime.py", import.meta.url), "utf8");

  assert.match(runtimeSource, /def expect_kind\(self, value: Any, kind: str\) -> Any:/);
  assert.match(runtimeSource, /def list_callable_tools\(self\) -> list\[dict\[str, Any\]\]:/);
  assert.match(runtimeSource, /def get_tool_schema\(self, name: str\) -> dict\[str, Any\]:/);
  assert.match(runtimeSource, /def help\(self, name: str\) -> dict\[str, Any\]:/);

  assert.match(readme, /ptc\.expect_kind\(value, kind\) -> Any/);
  assert.match(readme, /ptc\.list_callable_tools\(\) -> list\[dict\[str, Any\]\]/);
  assert.match(readme, /ptc\.get_tool_schema\(name\) -> dict\[str, Any\]/);
  assert.match(readme, /ptc\.help\(tool_name\) -> dict\[str, Any\]/);
  assert.match(readme, /Use `ptc\.help\(tool_name\)` when optional-tool prompt metadata would help choose or parameterize a tool/);
  assert.match(readme, /If Python needs to branch on optional tools, inspect `ptc\.list_callable_tools\(\)` first\./);
  assert.match(readme, /Optional tools should be detected from `ptc\.list_callable_tools\(\)`, not assumed from env\/config alone\./);
  assert.match(readme, /tools_by_name = \{tool\["name"\]: tool for tool in ptc\.list_callable_tools\(\)\}/);
  assert.match(readme, /if "sg" in tools_by_name:/);
  assert.match(readme, /sg_schema = ptc\.get_tool_schema\("sg"\)/);
  assert.match(readme, /sg_help = ptc\.help\("sg"\)/);
  assert.match(readme, /matches = await sg\(pattern="console\.log\(\$\$\$ARGS\)", lang="typescript", path="src"\)/);
});
