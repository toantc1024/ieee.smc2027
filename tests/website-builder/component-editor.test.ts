import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { CONFERENCE_BLOCK_DEFINITIONS, getBlockDefinition } from "../../src/modules/website-builder/registry";
import { InspectorField, createFieldDefault } from "../../src/modules/website-builder/components/studio/inspector-fields";
import { setFieldValue } from "../../src/modules/website-builder/utils/field-values";
import { uploadEditorMedia } from "../../src/modules/website-builder/utils/upload-media";
import { uploadPostMedia } from "../../src/components/admin/tiptap/upload";
import { parseDelimitedText } from "../../src/components/admin/tiptap/parse-delimited-text";
import { useBuilderStore } from "../../src/modules/website-builder/store/builder-store";

test("nested edits preserve neighboring content and leave defaults unchanged", () => {
  const source = [{ name: "Existing speaker", photo: "/before.jpg", affiliation: "University" }];
  const next = setFieldValue(source, [0, "photo"], "/after.jpg");
  assert.deepEqual(next, [{ name: "Existing speaker", photo: "/after.jpg", affiliation: "University" }]);
  assert.equal(source[0].photo, "/before.jpg");
  assert.deepEqual(setFieldValue({ primaryAction: { label: "Submit", href: "/before" } }, ["primaryAction", "href"], "/after"), { primaryAction: { label: "Submit", href: "/after" } });
  assert.deepEqual(setFieldValue(undefined, [0, "name"], "New member"), [{ name: "New member" }]);
});

test("legacy section names expose detailed image and collection fields", () => {
  assert.equal(getBlockDefinition("Hero")?.fields.slides.itemFields?.image.type, "image");
  assert.equal(getBlockDefinition("Keynotes")?.fields.speakers.itemFields?.photo.type, "image");
  assert.equal(getBlockDefinition("Committee")?.fields.groups.itemFields?.members.itemFields?.photo.type, "image");
  assert.equal(getBlockDefinition("Sponsors")?.fields.sponsors.itemFields?.logo.type, "image");
  assert.equal(getBlockDefinition("Venue")?.fields.image.type, "image");
  assert.equal(getBlockDefinition("FAQ")?.fields.items.itemFields?.answer.type, "textarea");
  assert.equal(getBlockDefinition("RichTextBlock")?.fields.content.type, "richtext");
});

test("nested collection fields render real image upload controls and previews", () => {
  const field = getBlockDefinition("Keynotes")!.fields.speakers;
  const markup = renderToStaticMarkup(React.createElement(InspectorField, {
    field,
    value: [{ name: "Ada Example", photo: "/speaker.jpg", affiliation: "Example University" }],
    path: ["speakers"], onChange() {}, onBusyChange() {},
  }));
  assert.match(markup, /Ada Example/);
  assert.match(markup, /Replace Speaker photo/);
  assert.match(markup, /Speaker photo preview/);
  assert.match(markup, /type="file"/);
  assert.match(markup, /aria-label="Move Ada Example up"/);
});

test("all editable collections can be cleared without crashing a section", () => {
  let checked = 0;
  for (const definition of Object.values(CONFERENCE_BLOCK_DEFINITIONS)) {
    for (const [key, field] of Object.entries(definition.fields)) {
      if (field.type !== "array") continue;
      assert.doesNotThrow(() => renderToStaticMarkup(React.createElement(definition.render, { ...definition.defaultProps, [key]: [] })), `${definition.type}.${key}`);
      assert.doesNotThrow(() => structuredClone(field.defaultValue ?? definition.defaultProps[key] ?? []), `${definition.type}.${key} has serializable defaults`);
      checked++;
    }
  }
  assert.ok(checked >= 17);
});

test("edited collection content reaches actual section renderers", () => {
  const cases: [string, Record<string, unknown>, string][] = [
    ["Keynotes", { speakers: [{ name: "Edited speaker", affiliation: "Edited university", photo: "/portrait.jpg" }] }, "Edited speaker"],
    ["Committee", { groups: [{ groupName: "Edited committee", members: [{ name: "Edited chair", role: "Chair", country: "Vietnam", photo: "/chair.jpg" }] }] }, "Edited chair"],
    ["Sponsors", { sponsors: [{ name: "Edited partner", shortName: "Edited partner", type: "Gold", logo: "/partner.svg", logoType: "ieee" }] }, "/partner.svg"],
    ["FAQ", { items: [{ question: "Edited question", answer: "Edited answer", category: "Submission" }] }, "Edited answer"],
    ["ImportantDates", { dates: [{ id: "new-date", title: "Edited milestone", date: "May 01, 2027" }] }, "Edited milestone"],
    ["ScheduleTimelineSection", { days: [{ dayNumber: 1, dateStr: "Edited day", theme: "Research", events: [{ time: "09:00", title: "Edited event", room: "A" }] }] }, "Edited event"],
    ["PaymentMethods", { rates: [{ category: "Edited fee", earlyBird: "$1", standard: "$2", late: "$3", note: "Edited inclusion", popular: false }] }, "Edited inclusion"],
    ["PaperTemplates", { templates: [{ name: "Edited template", format: "LaTeX", description: "Updated", fileSize: "1 MB", downloadUrl: "/template.zip", instructions: "Edited instructions" }] }, "Edited instructions"],
    ["TracksExplorer", { pillars: [{ id: "systems", title: "Edited track", subtitle: "Subtitle", code: "SSE", description: "Description", topics: [{ name: "Edited topic", code: "SSE-1", category: "General" }] }] }, "Edited topic"],
    ["AwardsSection", { awards: [{ title: "Edited award", description: "Edited award description", prize: "Certificate" }] }, "Edited award description"],
    ["WelcomeLetter", { body: "<p>Edited welcome content</p>", chairs: [] }, "Edited welcome content"],
  ];
  for (const [type, props, expected] of cases) {
    const definition = getBlockDefinition(type)!;
    assert.match(renderToStaticMarkup(React.createElement(definition.render, { ...definition.defaultProps, ...props })), new RegExp(expected), type);
  }
});

test("nested edits survive undo, redo, and a saved JSON round trip", () => {
  const store = useBuilderStore;
  const groups = structuredClone(getBlockDefinition("Committee")!.fields.groups.defaultValue);
  store.getState().initPage({ id: "editor-test", title: "Test", slug: "test", blocks: [{ id: "committee-test", type: "Committee", props: { groups } }] });
  const before = store.getState().data.content[0].props.groups;
  store.getState().updateBlockProps("committee-test", { groups: setFieldValue(before, [0, "members", 0, "photo"], "/edited-chair.jpg") });
  assert.equal(store.getState().data.content[0].props.groups[0].members[0].photo, "/edited-chair.jpg");
  store.getState().undo();
  assert.deepEqual(store.getState().data.content[0].props.groups, before);
  store.getState().redo();
  const saved = JSON.parse(JSON.stringify(store.getState().data));
  store.getState().initPage({ id: "editor-test", title: "Test", slug: "test", content: saved });
  assert.equal(store.getState().data.content[0].props.groups[0].members[0].photo, "/edited-chair.jpg");
});

test("media uploads read the API data envelope and prefer the durable proxy URL", async () => {
  const originalFetch = globalThis.fetch;
  try {
    let requestBody: FormData | undefined;
    globalThis.fetch = async (_input, init) => {
      requestBody = init?.body as FormData;
      return Response.json({ success: true, data: { url: "https://storage.example/temporary", proxyUrl: "/api/images/public/test.png", file: { url: "https://storage.example/temporary" } } });
    };
    const file = new File(["test"], "test.png", { type: "image/png" });
    assert.equal(await uploadEditorMedia(file), "/api/images/public/test.png");
    assert.equal(requestBody?.get("folder"), "public/uploads");
    assert.equal((requestBody?.get("file") as File).name, "test.png");
    globalThis.fetch = async () => Response.json({ success: true, url: "https://storage.example/temporary", proxyUrl: "/api/images/public/flat-response.png", file: { url: "https://storage.example/temporary" } });
    assert.equal(await uploadEditorMedia(file), "/api/images/public/flat-response.png");
    globalThis.fetch = async () => Response.json({ error: "Storage unavailable" }, { status: 500 });
    await assert.rejects(uploadEditorMedia(file), /Storage unavailable/);
    globalThis.fetch = async () => Response.json({ success: true, data: {} });
    await assert.rejects(uploadEditorMedia(file), /Upload failed/);
  } finally { globalThis.fetch = originalFetch; }
});

test("new nested items start with typed values rather than stringified booleans", () => {
  assert.deepEqual(createFieldDefault({ type: "object", label: "Settings", fields: { visible: { type: "switch", label: "Visible" }, count: { type: "number", label: "Count", min: 3 }, items: { type: "array", label: "Items" } } }), { visible: false, count: 3, items: [] });
});

test("post media upload uses the authenticated endpoint and returns its proxy URL", async () => {
  const originalFetch = globalThis.fetch;
  try {
    let endpoint: RequestInfo | URL | undefined;
    globalThis.fetch = async (input) => { endpoint = input; return Response.json({ data: { proxyUrl: "/api/images/public/document.pdf", url: "https://storage.example/document.pdf" } }); };
    const file = new File(["pdf"], "document.pdf", { type: "application/pdf" });
    assert.equal(await uploadPostMedia(file), "/api/images/public/document.pdf");
    assert.equal(endpoint, "/api/admin/upload");
    globalThis.fetch = async () => Response.json({ error: "Storage unavailable" }, { status: 500 });
    await assert.rejects(uploadPostMedia(file), /Storage unavailable/);
  } finally { globalThis.fetch = originalFetch; }
});

test("sheet import preserves quoted commas, escaped quotes, and multiline cells", () => {
  assert.deepEqual(parseDelimitedText('\uFEFFName,Notes\r\n"Smith, Ada","Said ""hello""\nand left"\r\nBob,OK\r\n'), [["Name", "Notes"], ["Smith, Ada", 'Said "hello"\nand left'], ["Bob", "OK"]]);
  assert.deepEqual(parseDelimitedText('Name\tValue\nA\t"x,y"'), [["Name", "Value"], ["A", "x,y"]]);
  assert.throws(() => parseDelimitedText('Name,Value\n"unfinished'), /unclosed/);
});

test("inspector image picker renders centered hover actions and global CSS preserves blue borders", () => {
  const markup = renderToStaticMarkup(React.createElement(InspectorField, {
    field: { type: "image", label: "Hero Banner" },
    value: "/carousel/hero-desktop-smc2027.png",
    path: ["image"],
    onChange() {},
    onBusyChange() {},
  }));
  assert.match(markup, /items-center justify-center/);
  assert.match(markup, /group-hover:opacity-100/);
  assert.match(markup, />Change</);
  assert.match(markup, />Library</);
  assert.match(markup, /aria-label="Remove Hero Banner"/);

  const globalsCss = fs.readFileSync(path.resolve(__dirname, "../../src/app/globals.css"), "utf8");
  assert.match(globalsCss, /@layer base\s*\{\s*\*\s*\{\s*@apply border-border/);

  const canvasTsx = fs.readFileSync(path.resolve(__dirname, "../../src/modules/website-builder/components/canvas/builder-canvas.tsx"), "utf8");
  assert.match(canvasTsx, /\[scrollbar-gutter:stable\]/);
  assert.doesNotMatch(canvasTsx, /transition-all duration-200/);
});
