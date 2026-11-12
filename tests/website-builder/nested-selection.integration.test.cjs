/* eslint-disable @typescript-eslint/no-require-imports -- Integration test uses the shared CommonJS loader. */
const test = require("node:test");
const assert = require("node:assert/strict");
const { JSDOM } = require("jsdom");
const React = require("react");
const { act } = React;
const { createRoot } = require("react-dom/client");
const { DndContext } = require("@dnd-kit/core");
const { EditableNestedBlock } = require("../../src/modules/website-builder/components/canvas/columns-slot.tsx");
const { useBuilderStore } = require("../../src/modules/website-builder/store/builder-store.ts");

test("nested blocks show the floating toolbar only after selection", async () => {
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', { pretendToBeVisual: true, url: "http://localhost:3000" });
  const saved = new Map();
  for (const key of ["window", "document", "navigator", "Node", "Element", "HTMLElement", "MutationObserver", "DOMParser", "getComputedStyle", "requestAnimationFrame", "cancelAnimationFrame", "CustomEvent", "Event"]) {
    saved.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    const value = key === "requestAnimationFrame" || key === "cancelAnimationFrame" ? dom.window[key].bind(dom.window) : dom.window[key];
    Object.defineProperty(globalThis, key, { value, configurable: true });
  }
  saved.set("IS_REACT_ACT_ENVIRONMENT", Object.getOwnPropertyDescriptor(globalThis, "IS_REACT_ACT_ENVIRONMENT"));
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  let root;
  try {
    const block = { id: "nested-state", type: "Text", props: { content: "Example" } };
    useBuilderStore.getState().initPage({ id: "nested-state-page", title: "Page", slug: "page", blocks: [block] });
    useBuilderStore.getState().selectBlock(null);
    root = createRoot(document.querySelector("#root"));
    await act(async () => root.render(React.createElement(DndContext, null, React.createElement(EditableNestedBlock, { block }))));
    const wrapper = document.querySelector("#root > div");
    assert.match(wrapper.className, /hover:ring-1/);
    assert.equal(document.querySelector('[aria-label="Copy nested section"]'), null);
    await act(async () => wrapper.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true })));
    assert.equal(useBuilderStore.getState().selectedBlockId, block.id);
    assert.match(wrapper.className, /ring-2 ring-blue-600 ring-offset-2/);
    const copy = document.querySelector('[aria-label="Copy nested section"]');
    assert.ok(copy);
    assert.match(copy.parentElement.className, /-top-3\.5 right-2/);
  } finally {
    if (root) await act(async () => root.unmount());
    dom.window.close();
    for (const [key, descriptor] of saved) { if (descriptor) Object.defineProperty(globalThis, key, descriptor); else Reflect.deleteProperty(globalThis, key); }
  }
});
