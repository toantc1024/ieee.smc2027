/* eslint-disable @typescript-eslint/no-require-imports -- The TypeScript test loader uses CommonJS require hooks. */
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
    const compiled = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
      fileName: filename,
    });
    module._compile(compiled.outputText, filename);
  };
}
require("./advanced-blocks.test.ts");
require("./advanced-blocks.integration.test.cjs");
require("./text-formatting.integration.test.cjs");

require("./insertion-menu.integration.test.cjs");

require("./layout-container.integration.test.cjs");

require("./drag-handle.integration.test.cjs");
require("./post-link-picker.integration.test.cjs");

require("./multi-image-upload.integration.test.cjs");

require("./multi-image-dialog.integration.test.cjs");
