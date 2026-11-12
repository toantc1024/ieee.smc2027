import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { HCMUTE_ACADEMIC_BLOCKS } from "../../src/modules/website-builder/registry/hcmute-academic-blocks";
import { getBlockDefinition } from "../../src/modules/website-builder/registry";

test("HCMUTE academic sections have editable fields and render supplied content", () => {
  const examples: [string, Record<string, unknown>, string][] = [
    ["Conference/Schedule", { days: "Monday", sessions: [{ dayIndex: 0, time: "09:30", title: "Robotics session", type: "keynote", track: "AI", speaker: "Dr Example" }] }, "Robotics session"],
    ["Conference/CallForPapers", { conferenceName: "Test symposium", deadlines: [{ title: "Paper deadline", date: "1 July", highlight: true }], topics: [{ trackName: "Reliable systems", subTopics: "Safety" }] }, "Paper deadline"],
    ["Conference/Speakers", { speakers: [{ name: "Dr Example", affiliation: "Example University", image: "/portrait.png", role: "Chair" }] }, "Example University"],
    ["Conference/Pricing", { tiers: [{ name: "Student", price: "$100", features: "Proceedings;Sessions", ctaText: "Register", ctaLink: "/register" }] }, "$100"],
    ["Data/Timeline", { items: [{ year: "2027", title: "Conference opening", description: "The opening session", status: "current" }] }, "Conference opening"],
    ["Data/StatsChart", { metrics: [{ value: "350", label: "Registrations", trend: "Increasing", icon: "book" }], dataPoints: [{ label: "2027", value1: 350, value2: 20 }] }, "Registrations"],
  ];
  for (const [type, props, expected] of examples) {
    const def = HCMUTE_ACADEMIC_BLOCKS[type];
    assert.ok(def, type);
    assert.equal(getBlockDefinition(type)?.type, type, `${type} registered`);
    assert.ok(Object.keys(def.fields).length > 2, `${type} has editor fields`);
    const html = renderToStaticMarkup(React.createElement(def.render, { ...def.defaultProps, ...props }));
    assert.ok(html.includes(expected), `${type} renders ${expected}`);
  }
});

test("empty sections never substitute reference demo people or fees", () => {
  for (const [type, def] of Object.entries(HCMUTE_ACADEMIC_BLOCKS)) {
    const props = { ...def.defaultProps, ...(type === "Conference/Speakers" ? { layout: "human-quote" } : {}) };
    const html = renderToStaticMarkup(React.createElement(def.render, props));
    assert.doesNotMatch(html, /John Doe|3\.500\.000|ICMED 2026|520\+|LE HIEU GIANG/i, type);
  }
});

test("timeline horizontal layout and nested media fields remain editable", () => {
  const def = HCMUTE_ACADEMIC_BLOCKS["Data/Timeline"];
  const html = renderToStaticMarkup(React.createElement(def.render, { ...def.defaultProps, layout: "horizontal", items: [{ year: "2027", title: "Opening", description: "Welcome", image: "/opening.png", linkUrl: "/event", linkText: "View event" }] }));
  assert.match(html, /overflow-x-auto/);
  assert.match(html, /opening\.png/);
  assert.match(html, /View event/);
  assert.equal(def.fields.items.itemFields?.image.type, "image");
  assert.equal(HCMUTE_ACADEMIC_BLOCKS["Conference/Speakers"].fields.speakers.itemFields?.image.type, "image");
  assert.equal(HCMUTE_ACADEMIC_BLOCKS["Conference/Schedule"].fields.sessions.itemFields?.speakerAvatar.type, "image");
});
