/* eslint-disable @typescript-eslint/no-require-imports -- These tests run through the CommonJS TypeScript loader. */
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { JSDOM } = require("jsdom");

test("advanced blocks insert, render in saved HTML, and reload for editing", () => {
  const dom = new JSDOM("<!doctype html><html><body></body></html>", { pretendToBeVisual: true, url: "http://localhost:3000" });
  const saved = new Map();
  for (const key of ["window", "document", "navigator", "Node", "Element", "HTMLElement", "MutationObserver", "DOMParser", "getComputedStyle", "requestAnimationFrame", "cancelAnimationFrame"]) {
    saved.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    const value = key === "requestAnimationFrame" || key === "cancelAnimationFrame" ? dom.window[key].bind(dom.window) : dom.window[key];
    Object.defineProperty(globalThis, key, { value, configurable: true });
  }
  let editor;
  let reopened;
  try {
    const { Editor } = require("@tiptap/core");
    const { StarterKit } = require("@tiptap/starter-kit");
    const folder = path.resolve(__dirname, "../../src/components/admin/tiptap/hcmute");
    const { ImageBlockExtension } = require(path.join(folder, "../image-block-extension.ts"));
    const extensions = [StarterKit, ImageBlockExtension, ...["math-block", "math-inline", "chart-block", "embed-block", "mermaid-block"].map((name) => Object.values(require(path.join(folder, `${name}-extension.ts`)))[0])];
    editor = new Editor({ extensions, content: "<p>Before</p>" });
    assert.equal(editor.commands.setMathBlock({ formula: "\\frac{x}{2}" }), true);
    assert.equal(editor.commands.setChartBlock({ chartType: "bar", title: "Our chart", data: JSON.stringify([{ name: "One", value: 2 }, { name: "Two", value: 5 }]) }), true);
    assert.equal(editor.commands.setEmbedBlock({ html: "<h1>Hello</h1>", css: "h1{color:red}", js: "document.body.dataset.ok=1", height: 240 }), true);
    assert.equal(editor.commands.setMermaidBlock({ code: "graph TD; A-->B", theme: "default" }), true);
    assert.equal(editor.commands.insertImageBlock({ src: "/api/images/public/article.png", alt: "Article image" }), true);
    const html = editor.getHTML();
    const document = new dom.window.DOMParser().parseFromString(html, "text/html");
    assert.ok(document.querySelector('[data-type="math-block"] math'));
    assert.ok(document.querySelector('[data-type="chart-block"] svg rect'));
    const frame = document.querySelector('[data-type="embed-block"] iframe');
    assert.equal(frame.getAttribute("sandbox"), "allow-scripts allow-popups allow-forms");
    assert.match(frame.getAttribute("srcdoc"), /Hello/);
    assert.match(document.querySelector('[data-type="mermaid-block"]').textContent, /graph TD/);
    assert.equal(document.querySelector('figure[data-image-block] img').getAttribute("src"), "/api/images/public/article.png");
    reopened = new Editor({ extensions, content: html });
    const nodes = reopened.getJSON().content;
    assert.equal(nodes.find((node) => node.type === "mathBlock").attrs.formula, "\\frac{x}{2}");
    assert.equal(nodes.find((node) => node.type === "chartBlock").attrs.title, "Our chart");
    assert.equal(nodes.find((node) => node.type === "embedBlock").attrs.html, "<h1>Hello</h1>");
    assert.equal(nodes.find((node) => node.type === "embedBlock").attrs.js, "document.body.dataset.ok=1");
    assert.equal(nodes.find((node) => node.type === "mermaidBlock").attrs.code, "graph TD; A-->B");
    assert.equal(nodes.find((node) => node.type === "imageBlock").attrs.alt, "Article image");
  } finally {
    editor?.destroy(); reopened?.destroy(); dom.window.close();
    for (const [key, descriptor] of saved) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else Reflect.deleteProperty(globalThis, key);
    }
  }
});
