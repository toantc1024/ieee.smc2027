/* eslint-disable @typescript-eslint/no-require-imports -- Integration test uses the shared CommonJS loader. */
const test = require("node:test");
const assert = require("node:assert/strict");
const { JSDOM } = require("jsdom");
const React = require("react");
const { act } = React;
const { createRoot } = require("react-dom/client");

test("image staging reorders files and retains successful uploads across a partial failure", async () => {
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', { pretendToBeVisual: true, url: "http://localhost:3000" });
  dom.window.scrollBy = () => {};
  dom.window.HTMLElement.prototype.attachEvent = () => {};
  dom.window.HTMLElement.prototype.detachEvent = () => {};
  const saved = new Map();
  for (const key of ["window", "document", "navigator", "Node", "Element", "HTMLElement", "HTMLInputElement", "MutationObserver", "DOMParser", "getComputedStyle", "requestAnimationFrame", "cancelAnimationFrame", "CustomEvent", "KeyboardEvent", "Event", "NodeFilter", "HTMLButtonElement"]) {
    saved.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    const value = key === "requestAnimationFrame" || key === "cancelAnimationFrame" ? dom.window[key].bind(dom.window) : dom.window[key];
    Object.defineProperty(globalThis, key, { value, configurable: true });
  }
  saved.set("IS_REACT_ACT_ENVIRONMENT", Object.getOwnPropertyDescriptor(globalThis, "IS_REACT_ACT_ENVIRONMENT"));
  saved.set("fetch", Object.getOwnPropertyDescriptor(globalThis, "fetch"));
  const originalCreate = URL.createObjectURL, originalRevoke = URL.revokeObjectURL;
  URL.createObjectURL = (file) => "blob:" + file.name;
  URL.revokeObjectURL = () => {};
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const calls = [];
  let secondAttempt = false, inserted, closed = 0, root;
  globalThis.fetch = async (url, options) => {
    assert.equal(url, "/api/admin/upload");
    const name = options.body.get("file").name;
    calls.push(name);
    if (name === "second.png" && !secondAttempt) return Response.json({ error: "Storage unavailable" }, { status: 500 });
    return Response.json({ proxyUrl: "/api/images/" + name });
  };
  try {
    const { MultiImageStagingDialog } = require("../../src/components/admin/tiptap/multi-image-staging-dialog.tsx");
    root = createRoot(document.querySelector("#root"));
    await act(async () => { root.render(React.createElement(MultiImageStagingDialog, { onClose: () => { closed++; }, onInsert: (images) => { inserted = images; return true; } })); });
    const input = document.querySelector('input[type="file"]');
    Object.defineProperty(input, "files", { configurable: true, value: [new File(["1"], "first.png", { type: "image/png" }), new File(["2"], "second.png", { type: "image/png" })] });
    await act(async () => { input.dispatchEvent(new dom.window.Event("change", { bubbles: true })); });
    assert.equal(document.querySelectorAll('img[src^="blob:"]').length, 2);
    await act(async () => { document.querySelector('button[aria-label="Move second.png up"]').click(); });
    const button = Array.from(document.querySelectorAll("button")).find((item) => item.textContent.includes("Upload and insert"));
    await act(async () => { button.click(); await new Promise((resolve) => setTimeout(resolve, 0)); });
    assert.equal(inserted, undefined);
    assert.equal(closed, 0);
    assert.match(document.body.textContent, /Storage unavailable/);
    assert.match(document.body.textContent, /could not be uploaded/);
    secondAttempt = true;
    const retry = Array.from(document.querySelectorAll("button")).find((item) => item.textContent.includes("Retry and insert"));
    await act(async () => { retry.click(); await new Promise((resolve) => setTimeout(resolve, 0)); });
    assert.deepEqual(inserted.map((item) => item.file.name), ["second.png", "first.png"]);
    assert.deepEqual(inserted.map((item) => item.url), ["/api/images/second.png", "/api/images/first.png"]);
    assert.equal(calls.filter((name) => name === "first.png").length, 1);
    assert.equal(calls.filter((name) => name === "second.png").length, 2);
    assert.equal(closed, 1);
  } finally {
    if (root) await act(async () => root.unmount());
    dom.window.close(); URL.createObjectURL = originalCreate; URL.revokeObjectURL = originalRevoke;
    for (const [key, descriptor] of saved) { if (descriptor) Object.defineProperty(globalThis, key, descriptor); else Reflect.deleteProperty(globalThis, key); }
  }
});
