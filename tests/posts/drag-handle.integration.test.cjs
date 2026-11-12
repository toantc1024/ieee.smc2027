/* eslint-disable @typescript-eslint/no-require-imports -- Shared CommonJS test loader. */
const test = require("node:test");
const assert = require("node:assert/strict");
const { JSDOM } = require("jsdom");

test("drag handle moves a post block without losing or duplicating content", () => {
  const dom = new JSDOM('<!doctype html><html><body><div id="editor" style="position:relative"></div></body></html>', { pretendToBeVisual: true, url: "http://localhost:3000" });
  dom.window.scrollBy = () => {};
  const saved = new Map();
  for (const key of ["window", "document", "navigator", "Node", "Element", "HTMLElement", "MutationObserver", "DOMParser", "getComputedStyle", "requestAnimationFrame", "cancelAnimationFrame"]) {
    saved.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    const value = key === "requestAnimationFrame" || key === "cancelAnimationFrame" ? dom.window[key].bind(dom.window) : dom.window[key];
    Object.defineProperty(globalThis, key, { value, configurable: true });
  }
  let editor;
  try {
    const { Editor } = require("@tiptap/core");
    const { StarterKit } = require("@tiptap/starter-kit");
    const { DragHandle } = require("../../src/components/admin/tiptap/drag-handle-extension.ts");
    editor = new Editor({ element: document.querySelector("#editor"), extensions: [StarterKit, DragHandle], content: "<p>First</p><p>Second</p>" });
    const handle = document.querySelector(".block-drag-handle");
    assert.ok(handle);
    Object.defineProperty(handle, "offsetParent", { value: document.querySelector("#editor") });
    editor.view.dom.getBoundingClientRect = () => ({ left: 0, right: 500, top: 0, bottom: 200, width: 500, height: 200 });
    editor.view.nodeDOM(0).getBoundingClientRect = () => ({ left: 0, right: 500, top: 0, bottom: 30, width: 500, height: 30 });
    editor.view.posAtCoords = () => ({ pos: 1, inside: 0 });
    editor.view.dom.dispatchEvent(new dom.window.MouseEvent("mousemove", { bubbles: true, clientX: 10, clientY: 10 }));
    assert.ok(handle.classList.contains("visible"));
    const transfer = { clearData() {}, setData() {}, getData() { return ""; }, setDragImage() {}, files: [], effectAllowed: "" };
    const dragstart = new dom.window.Event("dragstart", { bubbles: true, cancelable: true });
    Object.defineProperty(dragstart, "dataTransfer", { value: transfer });
    handle.querySelector(".block-drag-handle__grip").dispatchEvent(dragstart);
    assert.ok(editor.view.dragging?.slice, "ProseMirror receives the dragged block slice");
    editor.view.posAtCoords = () => ({ pos: editor.state.doc.content.size, inside: -1 });
    const drop = new dom.window.Event("drop", { bubbles: true, cancelable: true });
    Object.defineProperty(drop, "dataTransfer", { value: transfer });
    editor.view.dom.dispatchEvent(drop);
    assert.deepEqual(editor.getJSON().content.map((node) => node.content[0].text), ["Second", "First"]);
  } finally {
    editor?.destroy(); dom.window.close();
    for (const [key, descriptor] of saved) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else Reflect.deleteProperty(globalThis, key);
    }
  }
});
