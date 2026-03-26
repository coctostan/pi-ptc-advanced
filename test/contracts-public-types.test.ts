import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

test("contract and public type entrypoints remain directly importable", () => {
  const executionTypes = require("../dist/contracts/execution-types.js");
  const handleTypes = require("../dist/contracts/handle-types.js");
  const toolTypes = require("../dist/contracts/tool-types.js");
  const publicTypes = require("../dist/types.js");
  assert.equal(typeof executionTypes, "object");
  assert.equal(typeof handleTypes, "object");
  assert.equal(typeof toolTypes, "object");
  assert.equal(typeof publicTypes, "object");
});
