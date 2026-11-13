/* eslint-disable @typescript-eslint/no-require-imports -- This integration test uses the shared CommonJS loader. */
const test = require("node:test");
const assert = require("node:assert/strict");
const { JSDOM } = require("jsdom");
const React = require("react");
const { act } = React;

test("page builder selection and hover follow the active block and disappear in preview", async () => {
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', { pretendToBeVisual: true, url: "http://localhost:3000" });
  const descriptors = new Map();
  const keys = ["window", "document", "navigator", "Node", "Element", "HTMLElement", "MutationObserver", "DOMParser", "getComputedStyle", "requestAnimationFrame", "cancelAnimationFrame", "CustomEvent", "MouseEvent", "IS_REACT_ACT_ENVIRONMENT"];
  for (const key of keys) {
    descriptors.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    const value = key === "IS_REACT_ACT_ENVIRONMENT" ? true : key === "requestAnimationFrame" || key === "cancelAnimationFrame" ? dom.window[key].bind(dom.window) : dom.window[key];
    Object.defineProperty(globalThis, key, { value, configurable: true });
  }
  let root;
  try {
    const { createRoot } = require("react-dom/client");
    const { DndContext } = require("@dnd-kit/core");
    const { SortableContext, verticalListSortingStrategy } = require("@dnd-kit/sortable");
    const { SortableBlock } = require("../../src/modules/website-builder/components/canvas/sortable-block.tsx");
    const { useBuilderStore } = require("../../src/modules/website-builder/store/builder-store.ts");
    useBuilderStore.getState().initPage({ id: "overlay-test", title: "Page", slug: "page", blocks: [
      { id: "first", type: "Text", props: { content: "First section" } },
      { id: "second", type: "Text", props: { content: "Second section" } },
    ] });
    useBuilderStore.getState().setViewMode("edit");
    useBuilderStore.getState().selectBlock(null);
    useBuilderStore.getState().hoverBlock(null);
    function Canvas() {
      const content = useBuilderStore((state) => state.data.content);
      return React.createElement(DndContext, null,
        React.createElement(SortableContext, { items: content.map((block) => block.id), strategy: verticalListSortingStrategy },
          content.map((block, index) => React.createElement(SortableBlock, { key: block.id, block, index, totalBlocks: content.length }))));
    }
    root = createRoot(document.getElementById("root"));
    await act(async () => root.render(React.createElement(Canvas)));
    const find = (id) => document.querySelector(`[data-builder-block="${id}"]`);
    const first = find("first");
    const second = find("second");
    assert.ok(first && second, "both sections render in the editor");
    assert.equal(first.dataset.builderState, "idle");
    assert.equal(second.dataset.builderState, "idle");
    assert.equal(document.querySelectorAll("[data-builder-toolbar]").length, 0);

    await act(async () => first.dispatchEvent(new dom.window.MouseEvent("mouseover", { bubbles: true, relatedTarget: document.body })));
    assert.equal(useBuilderStore.getState().hoveredBlockId, "first");
    assert.equal(first.dataset.builderState, "hovered");
    assert.ok(first.querySelector("[data-builder-outline]"));
    assert.match(first.querySelector("[data-builder-outline]").className, /border-blue-500\/70/);
    assert.equal(first.querySelector("[data-builder-outline]").children.length, 0, "hover alone does not show selected corner handles");
    assert.ok(first.querySelector("[data-builder-toolbar]"));
    assert.equal(second.dataset.builderState, "idle");

    await act(async () => first.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true })));
    assert.equal(useBuilderStore.getState().selectedBlockId, "first");
    assert.equal(first.dataset.builderState, "selected");
    assert.ok(first.querySelector("[data-builder-toolbar]"));
    assert.doesNotMatch(first.className, /\btouch-none\b|\bcursor-grab\b/);
    const dragHandle = first.querySelector('[data-builder-toolbar] [title="Drag to reorder block"]');
    assert.ok(dragHandle, "left toolbar exposes dedicated drag handle");
    assert.match(dragHandle.className, /\btouch-none\b/);
    assert.match(dragHandle.className, /\bcursor-grab\b/);
    assert.match(first.querySelector("[data-builder-outline]").className, /border-blue-600/);
    assert.equal(first.querySelector("[data-builder-outline]").children.length, 4, "selected blocks show four corner handles");

    await act(async () => second.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true })));
    assert.equal(useBuilderStore.getState().selectedBlockId, "second");
    assert.equal(second.dataset.builderState, "selected");
    assert.ok(second.querySelector("[data-builder-toolbar]"));
    assert.notEqual(first.dataset.builderState, "selected");
    assert.ok(first.querySelector("[data-builder-toolbar]"), "a hovered section retains its toolbar independently of selection");

    await act(async () => useBuilderStore.getState().toggleBlockHidden("second"));
    assert.equal(second.dataset.builderHidden, "true");
    assert.match(second.querySelector("[data-builder-outline]").className, /amber/);
    assert.ok(second.querySelector("[data-builder-toolbar]"));

    await act(async () => useBuilderStore.getState().setViewMode("preview"));
    assert.match(document.body.textContent, /First section/);
    assert.doesNotMatch(document.body.textContent, /Second section/, "hidden blocks are omitted from preview");
    assert.equal(document.querySelectorAll("[data-builder-outline], [data-builder-toolbar]").length, 0);
  } finally {
    if (root) await act(async () => root.unmount());
    dom.window.close();
    for (const [key, descriptor] of descriptors) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else Reflect.deleteProperty(globalThis, key);
    }
  }
});
