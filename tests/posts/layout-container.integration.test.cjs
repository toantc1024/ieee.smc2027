/* eslint-disable @typescript-eslint/no-require-imports -- Shared CommonJS test loader. */
const test = require("node:test");
const assert = require("node:assert/strict");
const { JSDOM } = require("jsdom");

test("post columns preserve content through resize, undo, public HTML and reload", () => {
  const dom = new JSDOM("<!doctype html><html><body></body></html>", { pretendToBeVisual: true, url: "http://localhost:3000" });
  const saved = new Map();
  for (const key of ["window", "document", "navigator", "Node", "Element", "HTMLElement", "MutationObserver", "DOMParser", "getComputedStyle", "requestAnimationFrame", "cancelAnimationFrame"]) {
    saved.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    const value = key === "requestAnimationFrame" || key === "cancelAnimationFrame" ? dom.window[key].bind(dom.window) : dom.window[key];
    Object.defineProperty(globalThis, key, { value, configurable: true });
  }
  let editor, reopened;
  try {
    const { Editor } = require("@tiptap/core");
    const { StarterKit } = require("@tiptap/starter-kit");
    const { LayoutContainer, LayoutColumn, resizeLayoutContainer } = require("../../src/components/admin/tiptap/hcmute/layout-container-extension.ts");
    const extensions = [StarterKit, LayoutContainer, LayoutColumn];
    const paragraph = (text) => ({ type: "paragraph", content: [{ type: "text", text }] });
    editor = new Editor({ extensions, content: { type: "doc", content: [{ type: "layoutContainer", attrs: { cols: 3, gap: "lg", ratio: "custom", customTemplate: "2fr 1fr 1fr" }, content: ["First", "Second", "Third"].map((text) => ({ type: "layoutColumn", content: [paragraph(text)] })) }, paragraph("After") ] } });
    const html = editor.getHTML();
    const doc = new dom.window.DOMParser().parseFromString(html, "text/html");
    const container = doc.querySelector('[data-type="layout-container"]');
    assert.equal(container.querySelectorAll('[data-type="layout-column"]').length, 3);
    assert.equal(container.style.getPropertyValue("--layout-template"), "2fr 1fr 1fr");
    assert.equal(container.dataset.gap, "lg");
    reopened = new Editor({ extensions, content: html });
    assert.equal(reopened.state.doc.firstChild.attrs.customTemplate, "2fr 1fr 1fr");
    const first = editor.state.doc.firstChild;
    const resized = resizeLayoutContainer(first, editor.state.schema, 2);
    editor.view.dispatch(editor.state.tr.replaceWith(0, first.nodeSize, resized));
    assert.equal(editor.state.doc.firstChild.childCount, 2);
    assert.equal(editor.state.doc.firstChild.child(1).textContent, "SecondThird");
    assert.match(editor.getHTML(), /Third/);
    assert.equal(editor.commands.undo(), true);
    assert.equal(editor.state.doc.firstChild.childCount, 3);
    editor.commands.setTextSelection(3);
    const before = editor.getHTML();
    assert.equal(editor.commands.setLayoutContainer({ cols: 2 }), false);
    assert.equal(editor.getHTML(), before, "a layout must not be inserted inside another layout");
    const larger = resizeLayoutContainer(editor.state.doc.firstChild, editor.state.schema, 4);
    assert.equal(larger.childCount, 4);
    assert.equal(larger.child(2).textContent, "Third");
  } finally {
    editor?.destroy(); reopened?.destroy(); dom.window.close();
    for (const [key, descriptor] of saved) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else Reflect.deleteProperty(globalThis, key);
    }
  }
});
