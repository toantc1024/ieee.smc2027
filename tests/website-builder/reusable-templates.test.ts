import test from "node:test";
import assert from "node:assert/strict";
import { cloneReusableContent, isReusableContent, isValidReusableName } from "../../src/modules/website-builder/utils/reusable-templates";

test("reusable content requires a known version, kind and valid block shape", () => {
  const block = { id: "parent", type: "ColumnsSlot", props: {} };
  assert.equal(isReusableContent({ version: 1, kind: "block", block }), true);
  assert.equal(isReusableContent({ version: 1, kind: "page", content: [block], zones: {} }), true);
  assert.equal(isReusableContent({ version: 2, kind: "block", block }), false);
  assert.equal(isReusableContent({ version: 1, kind: "site-template", block }), false);
  assert.equal(isReusableContent({ version: 1, kind: "block", block: { id: "", type: "Text", props: {} } }), false);
  assert.equal(isReusableContent({ version: 1, kind: "page", content: [block], zones: { bad: [null] } }), false);
  assert.equal(isValidReusableName("  "), false);
  assert.equal(isValidReusableName("Reusable layout"), true);
  assert.equal(isValidReusableName("x".repeat(101)), false);
});

test("reusing nested blocks assigns fresh IDs and remaps page-zone owners", () => {
  const source = { version: 1 as const, kind: "page" as const, content: [{ id: "parent", type: "ColumnsSlot", props: { id: "parent", slot1Blocks: [{ id: "child", type: "Text", props: {} }] } }], zones: { "parent:slot": [{ id: "zoned", type: "Text", props: {} }] } };
  const copy = cloneReusableContent(source);
  assert.equal(copy.kind, "page");
  if (copy.kind !== "page") return;
  const parent = copy.content[0];
  assert.notEqual(parent.id, "parent");
  assert.equal(parent.props.id, parent.id);
  assert.notEqual(parent.props.slot1Blocks[0].id, "child");
  assert.equal(copy.zones?.[`${parent.id}:slot`]?.length, 1);
  assert.notEqual(copy.zones?.[`${parent.id}:slot`]?.[0].id, "zoned");
  assert.equal(source.content[0].id, "parent");
});
