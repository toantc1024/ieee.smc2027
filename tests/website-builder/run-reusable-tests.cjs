/* eslint-disable @typescript-eslint/no-require-imports -- The test loader uses CommonJS require hooks. */
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");
const root = path.resolve(__dirname, "../..");
const resolve = Module._resolveFilename;
Module._resolveFilename = function (request, parent, ...args) {
  if (request.startsWith("@/")) request = path.join(root, "src", request.slice(2));
  return resolve.call(this, request, parent, ...args);
};
for (const extension of [".ts", ".tsx"]) require.extensions[extension] = function (module, filename) {
  module._compile(ts.transpileModule(fs.readFileSync(filename, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true }, fileName: filename }).outputText, filename);
};
require("./reusable-templates.test.ts");
