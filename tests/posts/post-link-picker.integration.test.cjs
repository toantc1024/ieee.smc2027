/* eslint-disable @typescript-eslint/no-require-imports -- Integration test uses the shared CommonJS loader. */
const test = require("node:test");
const assert = require("node:assert/strict");
const { JSDOM } = require("jsdom");
const React = require("react");
const { act } = React;
const { createRoot } = require("react-dom/client");

test("published post picker searches real API data and selects a working post URL", async () => {
  const dom = new JSDOM('<!doctype html><html><body><div id="picker"></div></body></html>', { pretendToBeVisual: true, url: "http://localhost:3000" });
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
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  saved.set("fetch", Object.getOwnPropertyDescriptor(globalThis, "fetch"));
  let requested;
  globalThis.fetch = async (input) => { requested = input; return Response.json({ success: true, posts: [{ id: "first", title: "Robotics keynote", slug: "robotics-keynote", category: "Program" }, { id: "second", title: "Registration opens", slug: "register", category: "Registration" }, { id: 9, title: "Invalid", slug: "bad" }] }); };
  let root;
  try {
    const { PostLinkPicker, loadPublishedPostLinks, filterPublishedPostLinks } = require("../../src/components/admin/tiptap/post-link-picker.tsx");
    const { ButtonBlock } = require("../../src/components/admin/tiptap/button-block-extension.tsx");
    const { Editor } = require("@tiptap/core");
    const { StarterKit } = require("@tiptap/starter-kit");
    const posts = await loadPublishedPostLinks();
    assert.equal(requested, "/api/posts");
    assert.equal(posts.length, 2);
    assert.deepEqual(filterPublishedPostLinks(posts, "registration").map((post) => post.slug), ["register"]);
    let selected;
    root = createRoot(document.querySelector("#picker"));
    await act(async () => { root.render(React.createElement(PostLinkPicker, { onSelectPost: (post) => { selected = post; } })); });
    await act(async () => { document.querySelector('button[title="Choose a published post"]').click(); });
    assert.match(document.body.textContent, /Robotics keynote/);
    const search = document.querySelector('input[placeholder="Search published posts..."]');
    assert.ok(search);
    assert.match(document.body.textContent, /Registration opens/);
    const result = Array.from(document.querySelectorAll("button")).find((button) => button.textContent.includes("Registration opens"));
    await act(async () => { result.click(); });
    assert.equal(selected.url, "/news/register");
    assert.equal(selected.title, "Registration opens");
    const editor = new Editor({ extensions: [StarterKit, ButtonBlock], content: "<p></p>" });
    editor.commands.setButtonBlock({ href: selected.url, label: selected.title });
    const savedHtml = editor.getHTML();
    assert.match(savedHtml, /href="\/news\/register"/);
    const reopened = new Editor({ extensions: [StarterKit, ButtonBlock], content: savedHtml });
    assert.equal(reopened.getJSON().content.find((node) => node.type === "buttonBlock").attrs.href, "/news/register");
    editor.commands.setContent('<div data-type="button-block" data-href="https://example.org/manual" data-label="Manual link" data-variant="primary"><a href="https://example.org/manual">Manual link</a></div>');
    assert.match(editor.getHTML(), /href="https:\/\/example.org\/manual"/);
    reopened.destroy(); editor.destroy();
    globalThis.fetch = async () => Response.json({ error: "unavailable" }, { status: 500 });
    await assert.rejects(loadPublishedPostLinks(), /Could not load/);
  } finally {
    if (root) await act(async () => root.unmount());
    dom.window.close();
    for (const [key, descriptor] of saved) { if (descriptor) Object.defineProperty(globalThis, key, descriptor); else Reflect.deleteProperty(globalThis, key); }
  }
});
