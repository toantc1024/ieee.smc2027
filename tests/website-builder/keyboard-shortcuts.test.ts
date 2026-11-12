import test from "node:test";
import assert from "node:assert/strict";
import { useBuilderStore } from "../../src/modules/website-builder/store/builder-store";
import { handleBuilderShortcut } from "../../src/modules/website-builder/utils/keyboard-shortcuts";
import { findBlock } from "../../src/modules/website-builder/utils/block-tree";

function keyEvent(key: string, options: { ctrlKey?: boolean; metaKey?: boolean; shiftKey?: boolean; editable?: boolean; modal?: boolean } = {}) {
  let prevented = false;
  const target = { isContentEditable: false, closest: () => options.editable || options.modal ? {} : null };
  const event = { key, ctrlKey: !!options.ctrlKey, metaKey: !!options.metaKey, shiftKey: !!options.shiftKey, altKey: false, isComposing: false, defaultPrevented: false, target, preventDefault: () => { prevented = true; } } as unknown as KeyboardEvent;
  handleBuilderShortcut(event);
  return prevented;
}

function setup() {
  useBuilderStore.getState().initPage({ id: "keyboard", title: "Page", slug: "page", blocks: [{ id: "parent", type: "Container", props: {}, children: [{ id: "child", type: "Text", props: { content: "Nested text" } }] }, { id: "next", type: "Text", props: { content: "Next" } }] });
  useBuilderStore.getState().setViewMode("edit");
  useBuilderStore.getState().setStudioTab("content");
}

test("a loaded page starts deselected and Escape clears a selection", () => {
  setup();
  assert.equal(useBuilderStore.getState().selectedBlockId, null);
  useBuilderStore.getState().selectBlock("child");
  assert.equal(keyEvent("Escape"), true);
  assert.equal(useBuilderStore.getState().selectedBlockId, null);
});

test("shortcuts copy, paste and duplicate nested blocks next to their selection", () => {
  setup();
  useBuilderStore.getState().selectBlock("child");
  assert.equal(keyEvent("c", { ctrlKey: true }), true);
  assert.equal(keyEvent("v", { metaKey: true }), true);
  let children = useBuilderStore.getState().data.content[0].children!;
  assert.equal(children.length, 2);
  assert.notEqual(children[0].id, children[1].id);
  assert.equal(children[1].props.content, "Nested text");
  assert.equal(keyEvent("d", { ctrlKey: true }), true);
  children = useBuilderStore.getState().data.content[0].children!;
  assert.equal(children.length, 3);
  assert.equal(new Set(children.map((child) => child.id)).size, 3);
  assert.equal(keyEvent("z", { metaKey: true }), true);
  assert.equal(useBuilderStore.getState().data.content[0].children!.length, 2);
  assert.equal(useBuilderStore.getState().selectedBlockId, null);
  assert.equal(keyEvent("z", { metaKey: true, shiftKey: true }), true);
  assert.equal(useBuilderStore.getState().data.content[0].children!.length, 3);
});

test("cut and delete deselect removed blocks and history can restore them", () => {
  setup();
  useBuilderStore.getState().selectBlock("child");
  assert.equal(keyEvent("x", { ctrlKey: true }), true);
  assert.equal(useBuilderStore.getState().selectedBlockId, null);
  assert.equal(findBlock(useBuilderStore.getState().data.content, "child"), undefined);
  keyEvent("z", { ctrlKey: true });
  assert.ok(findBlock(useBuilderStore.getState().data.content, "child"));
  useBuilderStore.getState().selectBlock("child");
  assert.equal(keyEvent("Delete"), true);
  assert.equal(useBuilderStore.getState().selectedBlockId, null);
  assert.equal(findBlock(useBuilderStore.getState().data.content, "child"), undefined);
});

test("shortcuts do not interfere with editors, dialogs, preview, or save", () => {
  setup();
  useBuilderStore.getState().selectBlock("child");
  const original = JSON.stringify(useBuilderStore.getState().data);
  assert.equal(keyEvent("Backspace", { editable: true }), false);
  assert.equal(keyEvent("d", { ctrlKey: true, modal: true }), false);
  assert.equal(keyEvent("s", { ctrlKey: true }), false);
  useBuilderStore.getState().setViewMode("preview");
  assert.equal(keyEvent("Delete"), false);
  assert.equal(keyEvent("Escape"), false);
  assert.equal(JSON.stringify(useBuilderStore.getState().data), original);
  assert.equal(useBuilderStore.getState().selectedBlockId, "child");
  useBuilderStore.getState().setViewMode("edit");
});
