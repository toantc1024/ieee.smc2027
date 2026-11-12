// Run the repository's focused TypeScript/TSX tests without a separate build.
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const typescript = require("typescript");

const root = path.resolve(__dirname, "..");
const resolveFilename = Module._resolveFilename;
Module._resolveFilename = function (request, parent, ...args) {
  if (request.startsWith("@/")) request = path.join(root, "src", request.slice(2));
  return resolveFilename.call(this, request, parent, ...args);
};
for (const extension of [".ts", ".tsx"]) {
  require.extensions[extension] = (module, filename) => {
    const result = typescript.transpileModule(fs.readFileSync(filename, "utf8"), {
      fileName: filename,
      compilerOptions: { module: typescript.ModuleKind.CommonJS, target: typescript.ScriptTarget.ES2022, jsx: typescript.JsxEmit.ReactJSX, esModuleInterop: true },
    });
    module._compile(result.outputText, filename);
  };
}
for (const filename of ["page-tree-and-dnd.test.ts", "component-editor.test.ts", "hcmute-blocks.test.ts", "hcmute-academic.test.ts", "reusable-templates.test.ts", "keyboard-shortcuts.test.ts"]) {
  require(path.join(__dirname, "website-builder", filename));
}
require(path.join(__dirname, "website-builder", "selection-hover.integration.test.cjs"));
require(path.join(__dirname, "website-builder", "nested-selection.integration.test.cjs"));
