/* eslint-disable @typescript-eslint/no-require-imports -- Shared CommonJS test loader. */
const test = require("node:test");
const assert = require("node:assert/strict");
const { JSDOM } = require("jsdom");
const { uploadStagedImages, insertStagedImages } = require("../../src/components/admin/tiptap/multi-image-upload.ts");

const stage = (name, caption = "") => ({ id: name, file: new File([name], name + ".png", { type: "image/png" }), preview: "blob:" + name, alt: name, caption, credit: "Photographer" });

test("staged image uploads preserve order and retry only failed files", async () => {
  const images = [stage("first", "First caption"), stage("second"), stage("third")];
  const calls = [];
  const result = await uploadStagedImages(images, async (file) => {
    calls.push(file.name);
    if (file.name === "second.png") throw new Error("Storage unavailable");
    return "/api/images/" + file.name;
  });
  assert.deepEqual(result.map((image) => image.id), ["first", "second", "third"]);
  assert.equal(result[0].url, "/api/images/first.png");
  assert.equal(result[1].error, "Storage unavailable");
  assert.equal(result[1].url, undefined);
  assert.equal(result[2].url, "/api/images/third.png");
  const retried = [];
  const success = await uploadStagedImages(result, async (file) => { retried.push(file.name); return "/api/images/" + file.name; });
  assert.deepEqual(retried, ["second.png"]);
  assert.deepEqual(success.map((image) => image.url), ["/api/images/first.png", "/api/images/second.png", "/api/images/third.png"]);
  assert.equal(success[1].error, undefined);
  assert.equal(success[0].caption, "First caption");
});

test("uploaded images insert in order at the saved selection and survive HTML reload", () => {
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
    const { ImageBlockExtension } = require("../../src/components/admin/tiptap/image-block-extension.ts");
    const extensions = [StarterKit, ImageBlockExtension];
    editor = new Editor({ extensions, content: "<p>Before</p><p>After</p>" });
    editor.commands.setTextSelection(7);
    let bookmark = editor.state.selection.getBookmark();
    const transaction = editor.state.tr.insertText("New ", 1);
    bookmark = bookmark.map(transaction.mapping);
    editor.view.dispatch(transaction);
    const images = [{ ...stage("second", "Caption 2"), url: "/api/images/second.png" }, { ...stage("first", "Caption 1"), url: "/api/images/first.png" }];
    assert.equal(insertStagedImages(editor, bookmark, images), true);
    const html = editor.getHTML();
    const parsed = new dom.window.DOMParser().parseFromString(html, "text/html");
    const figures = Array.from(parsed.querySelectorAll("figure[data-image-block]"));
    assert.deepEqual(figures.map((figure) => figure.getAttribute("data-src")), ["/api/images/second.png", "/api/images/first.png"]);
    assert.equal(figures[0].getAttribute("data-caption"), "Caption 2");
    assert.equal(figures[0].getAttribute("data-credit"), "Photographer");
    assert.ok(html.indexOf("New Before") < html.indexOf("second.png"));
    assert.ok(html.indexOf("first.png") < html.indexOf("After"));
    reopened = new Editor({ extensions, content: html });
    assert.deepEqual(reopened.getJSON().content.filter((node) => node.type === "imageBlock").map((node) => node.attrs.src), ["/api/images/second.png", "/api/images/first.png"]);
    const before = reopened.getHTML();
    assert.equal(insertStagedImages(reopened, reopened.state.selection.getBookmark(), [stage("failed")]), false);
    assert.equal(reopened.getHTML(), before);
  } finally {
    editor?.destroy(); reopened?.destroy(); dom.window.close();
    for (const [key, descriptor] of saved) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else Reflect.deleteProperty(globalThis, key);
    }
  }
});
