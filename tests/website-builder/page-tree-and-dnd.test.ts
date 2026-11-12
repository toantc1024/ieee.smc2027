import test from "node:test";
import assert from "node:assert/strict";
import { buildPageTree, isValidPageParent } from "../../src/modules/website-builder/utils/page-tree";
import { resolveCanvasDrop } from "../../src/modules/website-builder/utils/canvas-drop";
import { useBuilderStore } from "../../src/modules/website-builder/store/builder-store";
import { getBlockPresentation, isBlockHidden } from "../../src/modules/website-builder/utils/block-presentation";
import { findBlock, getColumnBlocks } from "../../src/modules/website-builder/utils/block-tree";
import { getBlockDefinition } from "../../src/modules/website-builder/registry";
import { PublicNestedBlock } from "../../src/modules/website-builder/components/canvas/columns-slot";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const item = (id: string, parentId: string | null, orderIndex = 0) => ({ id, parentId, title: id, slug: id, orderIndex });

test("page tree calculates the correct depth even when children arrive first", () => {
  const roots = buildPageTree([item("leaf", "child"), item("child", "root"), item("root", null)]);
  assert.equal(roots.length, 1);
  assert.equal(roots[0].id, "root");
  assert.equal(roots[0].children[0].depth, 1);
  assert.equal(roots[0].children[0].children[0].depth, 2);
  assert.equal(roots[0].children[0].children[0].id, "leaf");
});

test("orphaned and cyclic pages stay visible exactly once", () => {
  const roots = buildPageTree([item("orphan", "missing"), item("a", "b"), item("b", "a"), item("self", "self")]);
  const ids: string[] = [];
  const visit = (nodes: typeof roots) => nodes.forEach((node) => { ids.push(node.id); visit(node.children); });
  visit(roots);
  assert.deepEqual(ids.sort(), ["a", "b", "orphan", "self"]);
});

test("parent changes reject self, descendants, missing parents, and existing cycles", () => {
  const pages = [item("root", null), item("child", "root"), item("leaf", "child"), item("a", "b"), item("b", "a")];
  assert.equal(isValidPageParent(pages, "root", "root"), false);
  assert.equal(isValidPageParent(pages, "root", "leaf"), false);
  assert.equal(isValidPageParent(pages, "root", "missing"), false);
  assert.equal(isValidPageParent(pages, "root", "a"), false);
  assert.equal(isValidPageParent(pages, "leaf", "root"), true);
  assert.equal(isValidPageParent(pages, "leaf", null), true);
});

test("page parent edits participate in undo and redo", () => {
  const store = useBuilderStore;
  store.getState().initPage({ id: "child", title: "Child", slug: "child", parentId: "parent", blocks: [] });
  store.getState().updatePageMeta({ parentId: null });
  assert.equal(store.getState().data.root.parentId, null);
  store.getState().undo();
  assert.equal(store.getState().data.root.parentId, "parent");
  store.getState().redo();
  assert.equal(store.getState().data.root.parentId, null);
});

test("an in-flight save does not mark later edits as saved", () => {
  const store = useBuilderStore;
  store.getState().initPage({ id: "page", title: "Original", slug: "original", blocks: [] });
  store.getState().updatePageMeta({ title: "First edit" });
  const sentSnapshot = store.getState().data;
  store.getState().updatePageMeta({ title: "Newer edit" });
  store.getState().markClean(2, sentSnapshot);
  assert.equal(store.getState().pageVersion, 2);
  assert.equal(store.getState().isDirty, true);
  assert.equal(store.getState().data.root.title, "Newer edit");
  store.getState().markClean(3, store.getState().data);
  assert.equal(store.getState().isDirty, false);
});

test("palette and canvas drops insert and move at the intended seam", () => {
  const blocks = ["a", "b", "c"];
  assert.deepEqual(resolveCanvasDrop(blocks, "palette:x", "drop-before-b", true), { kind: "insert", index: 1 });
  assert.deepEqual(resolveCanvasDrop(blocks, "palette:x", "drop-after-b", true), { kind: "insert", index: 2 });
  assert.deepEqual(resolveCanvasDrop([], "palette:x", "drop-after-end", true), { kind: "insert", index: 0 });
  assert.deepEqual(resolveCanvasDrop(blocks, "a", "drop-after-b", false), { kind: "move", from: 0, to: 1 });
  assert.deepEqual(resolveCanvasDrop(blocks, "c", "drop-before-a", false), { kind: "move", from: 2, to: 0 });
  assert.deepEqual(resolveCanvasDrop(blocks, "a", "drop-after-end", false), { kind: "move", from: 0, to: 2 });
  assert.equal(resolveCanvasDrop(blocks, "a", "drop-before-a", false), null);
  assert.equal(resolveCanvasDrop(blocks, "palette:x", "not-a-drop-zone", true), null);
});

test("existing HCMUTE block styles, children, and zones survive loading and editing", () => {
  const store = useBuilderStore;
  const content = {
    root: { title: "Page", slug: "page", theme: { primaryColor: "#004776" } },
    content: [{ id: "block", type: "ImageBlock", props: { imageUrl: "/image.jpg" }, styles: { paddingTop: "24px", borderColor: "#abc123", hideTwoSideBorders: false }, children: [{ id: "nested", type: "RichTextBlock", props: {} }] }],
    zones: { main: [{ id: "zone-child", type: "RichTextBlock", props: {} }] },
  };
  store.getState().initPage({ id: "page", title: "Page", slug: "page", content });
  const original = store.getState().data.content[0];
  assert.equal(original.children?.[0].id, "nested");
  assert.equal(store.getState().data.zones?.main[0].id, "zone-child");
  assert.equal(getBlockPresentation(original).style.paddingTop, "24px");
  assert.equal(getBlockPresentation(original).style.borderLeft, "1px solid #abc123");
  store.getState().updateBlockProps("block", { caption: "Updated" });
  const updated = store.getState().data.content[0];
  assert.equal(updated.children?.[0].id, "nested");
  assert.equal(updated.styles?.borderColor, "#abc123");
  assert.equal(store.getState().data.zones?.main[0].id, "zone-child");
  store.getState().updateBlockStyles("block", { paddingTop: "pt-8", hideTwoSideBorders: true });
  const presentation = getBlockPresentation(store.getState().data.content[0]);
  assert.match(presentation.className, /pt-8/);
  assert.equal(presentation.style.borderLeft, undefined);
});

test("legacy hidden properties remain hidden until explicitly shown", () => {
  const store = useBuilderStore;
  store.getState().initPage({ id: "page", title: "Page", slug: "page", blocks: [{ id: "hidden", type: "RichTextBlock", props: { hidden: true } }] });
  assert.equal(isBlockHidden(store.getState().data.content[0]), true);
  store.getState().toggleBlockHidden("hidden");
  const shown = store.getState().data.content[0];
  assert.equal(isBlockHidden(shown), false);
  store.getState().initPage({ id: "page", title: "Page", slug: "page", blocks: [shown] });
  assert.equal(isBlockHidden(store.getState().data.content[0]), false);
});

test("nested column edits, movement and duplication persist through undo and JSON", () => {
  const store = useBuilderStore;
  store.getState().initPage({ id: "page", title: "Page", slug: "page", blocks: [
    { id: "layout", type: "ColumnsSlot", props: { columnCount: 2, slot1Items: [{ id: "nested", type: "Text", props: { content: { en: "Before", vi: "Trước" } } }], slot2Blocks: [] } },
    { id: "outer", type: "Text", props: { content: "Outside" } },
  ] });
  store.getState().updateBlockProps("nested", { content: { en: "After", vi: "Trước" } });
  assert.equal(findBlock(store.getState().data.content, "nested")?.props.content.en, "After");
  assert.equal(findBlock(store.getState().data.content, "nested")?.props.content.vi, "Trước");
  store.getState().moveIntoColumn("outer", "layout", "slot2Blocks");
  assert.equal(store.getState().data.content.length, 1);
  assert.equal(getColumnBlocks(store.getState().data.content[0], "slot2Blocks")[0].id, "outer");
  store.getState().duplicateBlock("layout");
  const copy = store.getState().data.content[1];
  assert.notEqual(copy.id, "layout");
  assert.notEqual(getColumnBlocks(copy, "slot1Blocks")[0].id, "nested");
  assert.notEqual(getColumnBlocks(copy, "slot2Blocks")[0].id, "outer");
  store.getState().undo();
  store.getState().moveToRoot("outer", 0);
  assert.equal(store.getState().data.content[0].id, "outer");
  store.getState().undo();
  assert.equal(getColumnBlocks(store.getState().data.content[0], "slot2Blocks")[0].id, "outer");
  const saved = JSON.parse(JSON.stringify(store.getState().data));
  store.getState().initPage({ id: "page", title: "Page", slug: "page", content: saved });
  assert.equal(findBlock(store.getState().data.content, "nested")?.props.content.en, "After");
  assert.equal(findBlock(store.getState().data.content, "outer")?.props.content, "Outside");
});

test("column layouts reject moves into their descendants and render nested public content", () => {
  const store = useBuilderStore;
  const blocks = [{ id: "parent", type: "ColumnsSlot", props: { columnCount: 2, slot1Blocks: [{ id: "inner", type: "ColumnsSlot", props: { columnCount: 1, slot1Blocks: [{ id: "text", type: "Text", props: { content: { en: "Public English", vi: "Tiếng Việt" } } }] } }], slot2Blocks: [] } }];
  store.getState().initPage({ id: "page", title: "Page", slug: "page", blocks });
  store.getState().moveIntoColumn("parent", "inner", "slot1Blocks");
  assert.equal(store.getState().data.content[0].id, "parent");
  const renderer = getBlockDefinition("ColumnsSlot")!.render;
  const html = renderToStaticMarkup(React.createElement(renderer, blocks[0].props));
  assert.match(html, /Public English/);
  store.getState().toggleBlockHidden("text");
  const hiddenHtml = renderToStaticMarkup(React.createElement(renderer, store.getState().data.content[0].props));
  assert.doesNotMatch(hiddenHtml, /Public English/);
});

test("adding a block beside a nested selection keeps it in the same column", () => {
  const store = useBuilderStore;
  store.getState().initPage({ id: "nested-add", title: "Page", slug: "page", blocks: [{ id: "parent", type: "ColumnsSlot", props: { columnCount: 1, slot1Blocks: [{ id: "first", type: "Text", props: {} }] } }] });
  store.getState().insertBlockAfter("first", "Text");
  const current = store.getState();
  assert.equal(current.data.content.length, 1);
  const items = getColumnBlocks(current.data.content[0], "slot1Blocks");
  assert.equal(items.length, 2);
  assert.equal(items[0].id, "first");
  assert.equal(items[1].id, current.selectedBlockId);
  current.moveBlockUp(items[1].id);
  assert.equal(getColumnBlocks(store.getState().data.content[0], "slot1Blocks")[0].id, items[1].id);
  store.getState().undo();
  current.undo();
  assert.equal(getColumnBlocks(store.getState().data.content[0], "slot1Blocks").length, 1);
});

test("container children can be inserted, edited, reordered and cannot contain an ancestor", () => {
  const store = useBuilderStore;
  store.getState().initPage({ id: "container-test", title: "Page", slug: "page", blocks: [
    { id: "outer", type: "Container", props: {}, children: [{ id: "inner", type: "Container", props: {}, children: [] }] },
    { id: "text", type: "Text", props: { content: "Original" } },
  ] });
  store.getState().moveIntoContainer("outer", "inner");
  assert.equal(store.getState().data.content.length, 2);
  store.getState().moveIntoContainer("text", "inner");
  assert.equal(store.getState().data.content.length, 1);
  store.getState().updateBlockProps("text", { content: "Edited" });
  store.getState().insertIntoContainer("inner", "Text");
  const inner = findBlock(store.getState().data.content, "inner")!;
  assert.equal(inner.children?.length, 2);
  store.getState().moveBlockUp(inner.children![1].id);
  assert.equal(findBlock(store.getState().data.content, "inner")!.children![1].props.content, "Edited");
  store.getState().undo();
  assert.equal(findBlock(store.getState().data.content, "inner")!.children![0].id, "text");
  const html = renderToStaticMarkup(React.createElement(PublicNestedBlock, { block: store.getState().data.content[0] }));
  assert.match(html, /Edited/);
});

test("cut preserves a nested block for paste and can be undone", () => {
  const store = useBuilderStore;
  store.getState().initPage({ id: "cut", title: "Page", slug: "page", blocks: [{ id: "parent", type: "Container", props: {}, children: [{ id: "child", type: "Text", props: { content: "Content" } }] }] });
  store.getState().cutBlock("child");
  assert.equal(findBlock(store.getState().data.content, "child"), undefined);
  assert.equal(store.getState().clipboardBlock?.props.content, "Content");
  store.getState().undo();
  assert.equal(findBlock(store.getState().data.content, "child")?.props.content, "Content");
  store.getState().pasteAfterBlock("child");
  assert.equal(store.getState().data.content[0].children?.length, 2);
  assert.notEqual(store.getState().data.content[0].children?.[0].id, store.getState().data.content[0].children?.[1].id);
});

test("inserting saved blocks and applying page layouts are undoable and preserve page details", () => {
  const store = useBuilderStore;
  store.getState().initPage({ id: "saved-layout", title: "Original title", slug: "original", content: { root: {}, content: [{ id: "parent", type: "Container", props: {}, children: [{ id: "child", type: "Text", props: { content: "Original" } }] }], zones: { old: [] } } });
  store.getState().selectBlock("child");
  store.getState().insertSavedBlock({ id: "new-copy", type: "Text", props: { content: "Saved" } });
  assert.deepEqual(store.getState().data.content[0].children?.map((item) => item.id), ["child", "new-copy"]);
  store.getState().undo();
  assert.equal(store.getState().data.content[0].children?.length, 1);
  store.getState().applySavedLayout([{ id: "layout", type: "Text", props: { content: "New layout" } }]);
  assert.equal(store.getState().data.root.title, "Original title");
  assert.equal(store.getState().data.root.slug, "original");
  assert.equal(store.getState().data.zones, undefined);
  store.getState().undo();
  assert.equal(store.getState().data.content[0].id, "parent");
  assert.ok(store.getState().data.zones?.old);
});
