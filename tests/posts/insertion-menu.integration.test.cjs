/* eslint-disable @typescript-eslint/no-require-imports -- Integration test uses the shared CommonJS loader. */
const test = require("node:test");
const assert = require("node:assert/strict");
const { JSDOM } = require("jsdom");
const React = require("react");
const { act } = React;
const { createRoot } = require("react-dom/client");

test("slash and insert-between menus insert real blocks at the intended position", async () => {
  const dom = new JSDOM('<!doctype html><html><body><div id="editor"></div><div id="menu"></div></body></html>', { pretendToBeVisual: true, url: "http://localhost:3000" });
  dom.window.scrollBy = () => {};
  dom.window.HTMLElement.prototype.attachEvent = () => {};
  dom.window.HTMLElement.prototype.detachEvent = () => {};
  const saved = new Map();
  for (const key of ["window", "document", "navigator", "Node", "Element", "HTMLElement", "MutationObserver", "DOMParser", "getComputedStyle", "requestAnimationFrame", "cancelAnimationFrame", "CustomEvent", "KeyboardEvent"]) {
    saved.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    const value = key === "requestAnimationFrame" || key === "cancelAnimationFrame" ? dom.window[key].bind(dom.window) : dom.window[key];
    Object.defineProperty(globalThis, key, { value, configurable: true });
  }
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  let editor;
  let root;
  try {
    const { Editor } = require("@tiptap/core");
    const { StarterKit } = require("@tiptap/starter-kit");
    const { InsertionMenu, filterInsertionItems } = require("../../src/components/admin/tiptap/insertion-menu.tsx");
    const { INSERT_BETWEEN_OPEN_EVENT } = require("../../src/components/admin/tiptap/insert-between-extension.ts");
    editor = new Editor({ element: document.querySelector("#editor"), extensions: [StarterKit], content: "<p></p>" });
    editor.view.coordsAtPos = () => ({ left: 100, right: 100, top: 100, bottom: 120 });
    root = createRoot(document.querySelector("#menu"));
    await act(async () => { root.render(React.createElement(InsertionMenu, { editor })); });
    await act(async () => { editor.commands.insertContent("/heading"); });
    assert.equal(filterInsertionItems("heading").length, 3);
    assert.ok(document.querySelector('[role="menu"]'));
    await act(async () => { editor.view.dom.dispatchEvent(new dom.window.KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true })); });
    await act(async () => { editor.view.dom.dispatchEvent(new dom.window.KeyboardEvent("keydown", { key: "Enter", bubbles: true })); });
    assert.equal(editor.getJSON().content[0].type, "heading");
    assert.equal(editor.getJSON().content[0].attrs.level, 2);
    assert.doesNotMatch(editor.getHTML(), /\/heading/);
    await act(async () => { editor.commands.setContent("<p>Before</p><p>After</p>"); });
    const pos = editor.state.doc.child(0).nodeSize;
    await act(async () => { document.dispatchEvent(new dom.window.CustomEvent(INSERT_BETWEEN_OPEN_EVENT, { detail: { editor, insertPos: pos, x: 120, y: 150 } })); });
    const divider = Array.from(document.querySelectorAll('[role="menuitem"]')).find((button) => button.textContent.includes("Divider"));
    assert.ok(divider);
    await act(async () => { divider.click(); });
    assert.deepEqual(editor.getJSON().content.map((node) => node.type), ["paragraph", "horizontalRule", "paragraph"]);
    assert.equal(editor.getJSON().content[0].content[0].text, "Before");
    assert.equal(editor.getJSON().content[2].content[0].text, "After");
  } finally {
    if (root) await act(async () => root.unmount());
    editor?.destroy(); dom.window.close(); delete globalThis.IS_REACT_ACT_ENVIRONMENT;
    for (const [key, descriptor] of saved) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else Reflect.deleteProperty(globalThis, key);
    }
  }
});
