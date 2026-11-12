import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { getBlockDefinition } from "../../src/modules/website-builder/registry";
import { parseVideoUrl } from "../../src/modules/website-builder/registry/hcmute-media-blocks";
import { filterNewsPosts, loadPublishedPosts } from "../../src/modules/website-builder/registry/hcmute-news-archive";

test("HCMUTE layout and content block definitions remain available", () => {
  for (const type of ["Container", "GridLayout", "FlexLayout", "FormattedText", "RichText", "Spacer", "Divider", "Video", "ImageVideo", "Features", "CTA", "Stats", "NewsArchive", "PostDetail", "PostDetail/ActionCards", "PostDetail/FooterSections", "PostDetail/Newsletter"]) {
    assert.ok(getBlockDefinition(type), `${type} must be available in the block library`);
  }
});

test("post action links and notices use configured data", () => {
  const block = getBlockDefinition("PostDetail/ActionCards")!;
  const markup = renderToStaticMarkup(React.createElement(block.render, { quickLinks: [{ name: "Program", href: "/program" }], customNotices: [{ title: "Schedule updated", href: "/news/schedule", time: "Today" }] }));
  for (const value of ["Program", "/program", "Schedule updated", "/news/schedule", "Today"]) assert.ok(markup.includes(value));
});

test("newsletter does not claim success when no service is configured", () => {
  const block = getBlockDefinition("PostDetail/Newsletter")!;
  const unavailable = renderToStaticMarkup(React.createElement(block.render, {}));
  assert.match(unavailable, /Newsletter sign-up is not available yet/);
  assert.doesNotMatch(unavailable, /Successfully subscribed/);
  const configured = renderToStaticMarkup(React.createElement(block.render, { subscribeUrl: "https://example.org/signup" }));
  assert.match(configured, /href="https:\/\/example.org\/signup"/);
  const unsafe = renderToStaticMarkup(React.createElement(block.render, { subscribeUrl: "javascript:alert(1)" }));
  assert.doesNotMatch(unsafe, /href="javascript:/);
});

test("news archive uses the real public-posts response and applies category and search filters", async () => {
  const oldFetch = globalThis.fetch;
  const posts = [{ id: "one", slug: "first", title: "Robotics conference", summary: "Opening keynote", category: "Program" }, { id: "two", slug: "second", title: "Registration opens", summary: "Robotics tickets", category: "Registration" }];
  try {
    let requested = "";
    globalThis.fetch = async (input) => { requested = String(input); return Response.json({ success: true, posts }); };
    const loaded = await loadPublishedPosts();
    assert.equal(requested, "/api/posts");
    assert.deepEqual(loaded, posts);
    assert.deepEqual(filterNewsPosts(loaded, "Program", "ROBOTICS").map((item) => item.id), ["one"]);
    assert.deepEqual(filterNewsPosts(loaded, "Registration", "robotics").map((item) => item.id), ["two"]);
    globalThis.fetch = async () => Response.json({ error: "Unavailable" }, { status: 500 });
    await assert.rejects(loadPublishedPosts(), /Unable to load/);
  } finally { globalThis.fetch = oldFetch; }
});

test("feature cards, calls to action and statistics display their editable fields", () => {
  const feature = getBlockDefinition("Features")!;
  const markup = renderToStaticMarkup(React.createElement(feature.render, { title: "Our features", items: [{ title: "Robotics", description: "Autonomous systems", badge: "Research" }] }));
  for (const value of ["Our features", "Robotics", "Autonomous systems", "Research"]) assert.ok(markup.includes(value));
  const callToAction = getBlockDefinition("CTA")!;
  assert.match(renderToStaticMarkup(React.createElement(callToAction.render, { title: "Submit", buttonLabel: "Apply", buttonHref: "/apply" })), /href="\/apply"/);
  const stats = getBlockDefinition("Stats")!;
  const statsMarkup = renderToStaticMarkup(React.createElement(stats.render, { title: "Conference", stats: [{ value: "200+", label: "Speakers", icon: "Users" }] }));
  assert.match(statsMarkup, /200\+/);
  assert.match(statsMarkup, /Speakers/);
});

test("HCMUTE grid and flex cards render saved content and responsive settings", () => {
  const grid = getBlockDefinition("GridLayout")!;
  const markup = renderToStaticMarkup(React.createElement(grid.render, { title: "Tracks", columnsDesktop: 4, columnsTablet: 2, columnsMobile: 1, items: [{ title: "Robotics", description: "Research track", badge: "Featured", href: "/tracks", columnSpan: "col-span-2" }] }));
  for (const value of ["Tracks", "Robotics", "Research track", "Featured", "/tracks", "lg:grid-cols-4", "lg:col-span-2"]) assert.ok(markup.includes(value), value);
  const flex = getBlockDefinition("FlexLayout")!;
  const cards = renderToStaticMarkup(React.createElement(flex.render, { items: [{ title: "Deadline", content: "Submit by Friday", buttonText: "Apply", buttonHref: "/apply" }] }));
  for (const value of ["Deadline", "Submit by Friday", "Apply", "/apply"]) assert.ok(cards.includes(value), value);
});

test("rich text and nested container render real saved content", () => {
  const formatted = getBlockDefinition("FormattedText")!;
  const html = renderToStaticMarkup(React.createElement(formatted.render, { content: { en: "<h2>Conference program</h2>", vi: "<h2>Other</h2>" }, cardStyle: "card" }));
  assert.match(html, /<h2>Conference program<\/h2>/);
  const container = getBlockDefinition("Container")!;
  assert.match(renderToStaticMarkup(React.createElement(container.render, {}, React.createElement("p", null, "Nested content"))), /Nested content/);
});

test("original video URL parsing supports YouTube, Vimeo and direct files", () => {
  assert.equal(parseVideoUrl("https://youtu.be/dQw4w9WgXcQ").type, "youtube");
  assert.equal(parseVideoUrl("https://vimeo.com/123456").type, "vimeo");
  assert.equal(parseVideoUrl("https://example.com/movie.mp4").type, "video");
});

test("HCMUTE Hero and uncategorized FAQ keep their own content", () => {
  const hero = getBlockDefinition("Hero")!;
  assert.equal(hero.render, getBlockDefinition("Hero")!.render);
  const heroMarkup = renderToStaticMarkup(React.createElement(hero.render, { title: "Our campus", subtitle: "Teaching and research", primaryCtaLabel: "Explore", primaryCtaHref: "/campus" }));
  assert.match(heroMarkup, /Our campus/);
  assert.match(heroMarkup, /href="\/campus"/);
  const faq = getBlockDefinition("FAQ")!;
  assert.equal(faq.render, getBlockDefinition("FAQ")!.render);
  const faqMarkup = renderToStaticMarkup(React.createElement(faq.render, { title: "Campus FAQ", badge: "Help", items: [{ question: "Where is it?", answer: "In the city." }] }));
  assert.match(faqMarkup, /Campus FAQ/);
  assert.match(faqMarkup, /Where is it\?/);
  assert.doesNotMatch(faqMarkup, /Category:/);
  const conferenceFaq = renderToStaticMarkup(React.createElement(faq.render, { title: "Conference questions", items: [{ question: "When?", answer: "October", category: "Submission" }] }));
  assert.match(conferenceFaq, /Category:/);
  assert.match(conferenceFaq, /Submission/);
  const carousel = renderToStaticMarkup(React.createElement(hero.render, { autoplayDuration: 7 }));
  assert.match(carousel, /IEEE SMC 2027/);
});
