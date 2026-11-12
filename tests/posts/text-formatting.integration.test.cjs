/* eslint-disable @typescript-eslint/no-require-imports -- These tests use the CommonJS TipTap loader. */
const test = require("node:test");
const assert = require("node:assert/strict");
const { JSDOM } = require("jsdom");
const { Editor } = require("@tiptap/core");
const { StarterKit } = require("@tiptap/starter-kit");
const { Highlight, TextAlignment, TextStyle } = require("../../src/components/admin/tiptap/text-formatting.ts");
const extensions = [StarterKit, TextStyle, Highlight, TextAlignment];

function withDom(run) {
  const dom = new JSDOM("<!doctype html><html><body></body></html>", { pretendToBeVisual: true, url: "http://localhost:3000" });
  const saved = new Map();
  for (const key of ["window", "document", "navigator", "Node", "Element", "HTMLElement", "MutationObserver", "DOMParser", "getComputedStyle", "requestAnimationFrame", "cancelAnimationFrame"]) {
    saved.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    const value = key === "requestAnimationFrame" || key === "cancelAnimationFrame" ? dom.window[key].bind(dom.window) : dom.window[key];
    Object.defineProperty(globalThis, key, { value, configurable: true });
  }
  try { run(); } finally {
    dom.window.close();
    for (const [key, descriptor] of saved) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else Reflect.deleteProperty(globalThis, key);
    }
  }
}

test("text color, font size, highlight and alignment survive HTML save and reload", () => withDom(() => {
  const editor = new Editor({ extensions, content: "<p>Hello world</p>" });
  let reopened;
  try {
    editor.commands.setTextSelection({ from: 1, to: 6 });
    assert.equal(editor.commands.setColor("#ff0000"), true);
    assert.equal(editor.commands.setFontSize("20px"), true);
    assert.equal(editor.commands.toggleHighlight({ color: "#ffff00" }), true);
    assert.equal(editor.commands.setTextAlign("center"), true);
    const html = editor.getHTML();
    assert.match(html, /font-size: 20px/);
    assert.match(html, /color:/);
    assert.match(html, /<mark/);
    assert.match(html, /text-align: center/);
    reopened = new Editor({ extensions, content: html });
    const roundTrip = reopened.getHTML();
    assert.match(roundTrip, /font-size: 20px/);
    assert.match(roundTrip, /<mark/);
    assert.match(roundTrip, /text-align: center/);
    reopened.commands.setTextSelection({ from: 1, to: 6 });
    reopened.commands.unsetColor();
    assert.match(reopened.getHTML(), /font-size: 20px/);
    reopened.commands.unsetFontSize();
    reopened.commands.unsetHighlight();
    reopened.commands.unsetTextAlign();
    assert.doesNotMatch(reopened.getHTML(), /font-size|<mark|text-align/);
  } finally { reopened?.destroy(); editor.destroy(); }
}));

test("unsupported CSS and alignment values cannot enter the document", () => withDom(() => {
  const editor = new Editor({ extensions, content: "<p>Text</p>" });
  try {
    editor.commands.setTextSelection({ from: 1, to: 5 });
    assert.equal(editor.commands.setColor("red;position:fixed"), false);
    assert.equal(editor.commands.setFontSize("20px;background:red"), false);
    assert.equal(editor.commands.toggleHighlight({ color: "red;display:none" }), false);
    assert.equal(editor.commands.setTextAlign("not-an-alignment"), false);
    assert.doesNotMatch(editor.getHTML(), /style=/);
  } finally { editor.destroy(); }
}));
