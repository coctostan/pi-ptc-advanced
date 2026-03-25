const nodeTest = require("node:test");
const nodeAssert = require("node:assert/strict");
const {
  buildInlinePythonSignature,
  buildMultilinePythonSignature,
  buildPythonParamMetadata,
  classifyBuiltinTool,
  describePythonHelper,
  describePythonHelpers,
  getBuiltinToolContract,
  getPythonReturnType,
  schemaToPythonType,
  validatePythonHelperNames,
} = require("../dist/tools/python-tool-contract.js");
const { generateToolWrappers: generateToolWrappersForTests } = require("../dist/tools/tool-wrapper.js");

function createTool(overrides = {}) {
  return {
    name: "search",
    description: "Search files",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string" },
        limit: { anyOf: [{ type: "integer" }, { type: "null" }] },
        tags: { type: "array", items: { type: "string" } },
      },
      required: ["query"],
    },
    source: "extension",
    isReadOnly: true,
    execute: async () => ({ content: [{ type: "text", text: "ok" }], details: undefined }),
    ...overrides,
  };
}

nodeTest("builtin contracts preserve read-only classification and return types", () => {
  nodeAssert.deepEqual(getBuiltinToolContract("read"), {
    isReadOnly: true,
    pythonReturnType: "Union[str, ReadResult]",
    helperSignature:
      "read(path: str, *, offset: Optional[int] = None, limit: Optional[int] = None, symbol: Optional[str] = None, map: Optional[bool] = None) -> Union[str, ReadResult]",
  });
  nodeAssert.deepEqual(classifyBuiltinTool("bash"), { isReadOnly: false });
  nodeAssert.deepEqual(classifyBuiltinTool("bash", { readOnly: true }), { isReadOnly: true });
  nodeAssert.equal(getPythonReturnType(createTool({ name: "custom" })), "Any");
  nodeAssert.equal(getPythonReturnType(createTool({ name: "grep" })), "Union[List[GrepMatch], GrepResult]");
  nodeAssert.equal(getPythonReturnType(createTool({ name: "edit" })), "AnchoredEditResult");
});

nodeTest("schemaToPythonType and parameter metadata handle unions, arrays, and keyword-only params", () => {
  nodeAssert.equal(schemaToPythonType({ type: "string" }), "str");
  nodeAssert.equal(schemaToPythonType({ anyOf: [{ type: "string" }, { type: "integer" }, { type: "null" }] }), "Union[str, int]");
  nodeAssert.equal(schemaToPythonType({ type: "array", items: { type: "boolean" } }), "List[bool]");

  const params = buildPythonParamMetadata(createTool());
  nodeAssert.deepEqual(params, [
    { name: "query", keywordOnly: false, signature: "query: str" },
    { name: "limit", keywordOnly: true, signature: "limit: Optional[int] = None" },
    { name: "tags", keywordOnly: true, signature: "tags: Optional[List[str]] = None" },
  ]);
});

nodeTest("signature helpers render required and optional parameters consistently", () => {
  const params = buildPythonParamMetadata(createTool());

  nodeAssert.equal(
    buildInlinePythonSignature("search", "Any", params),
    "search(query: str, *, limit: Optional[int] = None, tags: Optional[List[str]] = None) -> Any"
  );
  nodeAssert.equal(
    buildMultilinePythonSignature("search", "Any", params),
    [
      "async def search(",
      "    query: str,",
      "    *,",
      "    limit: Optional[int] = None,",
      "    tags: Optional[List[str]] = None",
      ") -> Any:",
    ].join("\n")
  );
});

nodeTest("helper descriptions and wrappers expose read(symbol=..., map=...) passthrough", () => {
  nodeAssert.equal(
    describePythonHelper(createTool({ name: "read", ptc: { pythonName: "read_text" } })),
    "read_text(path: str, *, offset: Optional[int] = None, limit: Optional[int] = None, symbol: Optional[str] = None, map: Optional[bool] = None) -> Union[str, ReadResult]"
  );

  const wrapperCode = generateToolWrappersForTests([
    createTool({
      name: "read",
      parameters: {
        type: "object",
        properties: {
          path: { type: "string" },
        },
        required: ["path"],
      },
      source: "builtin",
      isReadOnly: true,
    }),
  ]);

  nodeAssert.match(wrapperCode, /symbol: Optional\[str\] = None/);
  nodeAssert.match(wrapperCode, /map: Optional\[bool\] = None/);
  nodeAssert.match(wrapperCode, /"symbol": symbol/);
  nodeAssert.match(wrapperCode, /"map": map/);

  nodeAssert.deepEqual(describePythonHelpers([
    createTool(),
    createTool({ name: "search_alt", ptc: { pythonName: "search_alt_py" } }),
  ]), [
    "search(query: str, *, limit: Optional[int] = None, tags: Optional[List[str]] = None) -> Any",
    "search_alt_py(query: str, *, limit: Optional[int] = None, tags: Optional[List[str]] = None) -> Any",
  ]);
  nodeAssert.equal(describePythonHelper(createTool({ name: "grep" })), "grep(query: str, *, limit: Optional[int] = None, tags: Optional[List[str]] = None) -> Union[List[GrepMatch], GrepResult]");
  nodeAssert.equal(describePythonHelper(createTool({ name: "edit" })), "edit(query: str, *, limit: Optional[int] = None, tags: Optional[List[str]] = None) -> AnchoredEditResult");
});

nodeTest("generated wrappers expose edit semantic summary metadata", () => {
  const wrapperCode = generateToolWrappersForTests([]);
  nodeAssert.match(wrapperCode, /class SemanticSummary\(TypedDict, total=False\):/);
  nodeAssert.match(wrapperCode, /classification: str/);
  nodeAssert.match(wrapperCode, /difftasticAvailable: bool/);
  nodeAssert.match(wrapperCode, /movedBlocks: int/);
  nodeAssert.match(wrapperCode, /semanticSummary: Optional\[SemanticSummary\]/);
});

nodeTest("validatePythonHelperNames rejects duplicates and reserved aliases", () => {
  nodeAssert.throws(
    () => validatePythonHelperNames([createTool(), createTool({ name: "other", ptc: { pythonName: "search" } })]),
    /Duplicate Python helper name 'search'/
  );

  nodeAssert.throws(
    () => validatePythonHelperNames([createTool({ name: "other", ptc: { pythonName: "read" } })]),
    /Python helper name 'read' is reserved/
  );

  nodeAssert.doesNotThrow(() => validatePythonHelperNames([
    createTool({ name: "read" }),
    createTool({ name: "other", ptc: { pythonName: "search_other" } }),
  ]));
});


nodeTest("sg helper descriptions use a typed SgResult contract and reserve the sg helper name", () => {
  const sgTool = createTool({
    name: "sg",
    description: "AST grep",
    parameters: {
      type: "object",
      properties: {
        pattern: { type: "string" },
        lang: { anyOf: [{ type: "string" }, { type: "null" }] },
        path: { anyOf: [{ type: "string" }, { type: "null" }] },
      },
      required: ["pattern"],
    },
  });
  nodeAssert.equal(getPythonReturnType(sgTool), "SgResult");
  nodeAssert.equal(
    describePythonHelper(sgTool),
    "sg(pattern: str, *, lang: Optional[str] = None, path: Optional[str] = None) -> SgResult"
  );
  nodeAssert.equal(
    describePythonHelper({ ...sgTool, ptc: { pythonName: "sg_search" } }),
    "sg_search(pattern: str, *, lang: Optional[str] = None, path: Optional[str] = None) -> SgResult"
  );
  nodeAssert.throws(
    () => validatePythonHelperNames([createTool({ name: "other", ptc: { pythonName: "sg" } })]),
    /Python helper name 'sg' is reserved/
  );
});
