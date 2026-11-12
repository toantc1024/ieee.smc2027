/* eslint-disable @typescript-eslint/no-require-imports -- The test loader uses CommonJS require hooks. */
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const root = path.resolve(__dirname, "../..");
const ts = require("typescript");
const resolve = Module._resolveFilename;
Module._resolveFilename = function (request, parent, ...args) {
  if (request.startsWith("@/")) request = path.join(root, "src", request.slice(2));
  return resolve.call(this, request, parent, ...args);
};
for (const extension of [".ts", ".tsx"]) {
  require.extensions[extension] = function (module, filename) {
    const compiled = ts.transpileModule(fs.readFileSync(filename, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true }, fileName: filename });
    module._compile(compiled.outputText, filename);
  };
}
require("./hcmute-academic.test.ts");
