import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  BLOCK_ALIASES,
  CONFERENCE_BLOCK_DEFINITIONS,
  getBlockDefinition,
} from "../../src/modules/website-builder/registry";
import { resolveArchetype } from "../../src/modules/website-builder/components/studio/wireframes/archetype-resolver";
import { BuilderBlockContext } from "../../src/modules/website-builder/utils/sub-item-path";
import { migratePageBlocks } from "../../src/lib/cms-migration";

test("every registered block and alias resolves to a dedicated wireframe archetype", () => {
  const genericTypes: string[] = [];
  for (const def of Object.values(CONFERENCE_BLOCK_DEFINITIONS)) {
    const archetype = resolveArchetype(def.type, def.category);
    if (archetype === "fallback-generic" && def.type !== "CustomHTML") {
      genericTypes.push(def.type);
    }
  }
  for (const alias of Object.keys(BLOCK_ALIASES)) {
    const archetype = resolveArchetype(alias);
    if (archetype === "fallback-generic") {
      genericTypes.push(alias);
    }
  }
  assert.deepEqual(
    genericTypes,
    [],
    `Blocks fell back to generic wireframe: ${genericTypes.join(", ")}`
  );
});

test("builder sub-item reflection emits data-builder-subpath inside BuilderBlockContext", () => {
  const blockTypes = [
    "FaqAccordionSection",
    "SubmissionPortalsBlock",
    "CfpPoliciesBlock",
    "SubmissionCategoriesBlock",
    "RegistrationFeeTableBlock",
    "PaymentChannelsBlock",
    "TransitLogisticsBlock",
    "CityAttractionsBlock",
    "VisitorInfoBlock",
    "CommitteesSection",
    "SponsorshipSection",
    "ScheduleTimelineSection",
  ];

  for (const type of blockTypes) {
    const def = getBlockDefinition(type);
    assert.ok(def, `Missing block definition: ${type}`);
    const markup = renderToStaticMarkup(
      React.createElement(
        BuilderBlockContext.Provider,
        {
          value: {
            blockId: "test-block",
            isPreview: false,
            activeSubPath: null,
            hoveredSubPath: null,
          },
        },
        React.createElement(def.render, def.defaultProps)
      )
    );
    assert.match(
      markup,
      /data-builder-subpath="/,
      `${type} should emit data-builder-subpath for nested item reflection`
    );
  }
});

test("explicit empty collections render zero items without falling back to static mocks", () => {
  const faqDef = getBlockDefinition("FaqAccordionSection")!;
  const emptyFaqMarkup = renderToStaticMarkup(
    React.createElement(faqDef.render, { ...faqDef.defaultProps, items: [] })
  );
  assert.doesNotMatch(emptyFaqMarkup, /PaperCept/);

  const sponsorDef = getBlockDefinition("SponsorshipSection")!;
  const emptySponsorMarkup = renderToStaticMarkup(
    React.createElement(sponsorDef.render, { ...sponsorDef.defaultProps, sponsors: [] })
  );
  assert.match(emptySponsorMarkup, /No sponsors listed yet/);

  const portalsDef = getBlockDefinition("SubmissionPortalsBlock")!;
  const emptyPortalsMarkup = renderToStaticMarkup(
    React.createElement(portalsDef.render, { ...portalsDef.defaultProps, portals: [] })
  );
  assert.doesNotMatch(emptyPortalsMarkup, /PaperCept/);
});

test("HERO_COMPATIBILITY_DEFINITION preserves HcmuteHero props without morphing into HeroCarousel", () => {
  const heroDef = getBlockDefinition("Hero")!;
  const customHeroMarkup = renderToStaticMarkup(
    React.createElement(heroDef.render, {
      backgroundImage: "/images/campus.jpg",
      title: "Custom Hero Title",
      subtitle: "Hero subtitle text",
      primaryCtaLabel: "Explore Now",
      primaryCtaHref: "/about",
    })
  );
  assert.match(customHeroMarkup, /Custom Hero Title/);
  assert.doesNotMatch(customHeroMarkup, /hero-carousel-height/);

  const carouselMarkup = renderToStaticMarkup(
    React.createElement(heroDef.render, { autoplayDuration: 7 })
  );
  assert.match(carouselMarkup, /hero-carousel-height/);
});

test("migratePageBlocks decomposes monoliths, deduplicates committees, and is strictly idempotent", () => {
  const subFirst = migratePageBlocks({
    slug: "submissions",
    title: "Submissions & CFP",
    blocks: [
      {
        id: "cfp-1",
        type: "CallForPapers",
        props: { cfpPdfUrl: "/custom-cfp-2027.pdf" },
      },
      { id: "dates-1", type: "ImportantDates", props: {} },
    ],
    content: null,
  });

  assert.equal(subFirst.changed, true);
  assert.deepEqual(
    subFirst.blocks.map((b) => b.type),
    [
      "SubmissionPortalsBlock",
      "CfpPoliciesBlock",
      "SubmissionCategoriesBlock",
      "CfpBrochureBannerBlock",
      "ImportantDates",
    ]
  );
  assert.equal(
    subFirst.blocks.find((b) => b.type === "CfpPoliciesBlock")?.props.cfpPdfUrl,
    "/custom-cfp-2027.pdf"
  );

  const subSecond = migratePageBlocks({
    slug: "submissions",
    title: "Submissions & CFP",
    blocks: subFirst.blocks,
    content: subFirst.content,
  });
  assert.equal(subSecond.changed, false);
  assert.deepEqual(subSecond.blocks, subFirst.blocks);

  const regFirst = migratePageBlocks({
    slug: "registration",
    title: "Registration",
    blocks: [
      {
        id: "pay-1",
        type: "PaymentMethods",
        props: { scheduleHeading: "Custom Schedule Heading" },
      },
    ],
    content: null,
  });
  assert.deepEqual(
    regFirst.blocks.map((b) => b.type),
    [
      "RegistrationWizardBlock",
      "RegistrationFeeTableBlock",
      "PaymentChannelsBlock",
      "VatInvoiceNoticeBlock",
    ]
  );
  assert.equal(
    regFirst.blocks.find((b) => b.type === "RegistrationFeeTableBlock")?.props
      .scheduleHeading,
    "Custom Schedule Heading"
  );
  assert.equal(
    migratePageBlocks({
      slug: "registration",
      title: "Registration",
      blocks: regFirst.blocks,
      content: regFirst.content,
    }).changed,
    false
  );

  const travelFirst = migratePageBlocks({
    slug: "travel",
    title: "Venue & Travel",
    blocks: [
      {
        id: "venue-1",
        type: "Venue",
        props: { venueName: "Custom Grand Hotel" },
      },
    ],
    content: null,
  });
  assert.deepEqual(
    travelFirst.blocks.map((b) => b.type),
    [
      "VenueOverviewBlock",
      "TransitLogisticsBlock",
      "VisitorInfoBlock",
      "CityAttractionsBlock",
    ]
  );
  assert.equal(
    travelFirst.blocks.find((b) => b.type === "VenueOverviewBlock")?.props.venueName,
    "Custom Grand Hotel"
  );

  const commFirst = migratePageBlocks({
    slug: "committees",
    title: "Committees",
    blocks: [
      {
        id: "comm-legacy",
        type: "Committee",
        props: {
          groups: [{ groupName: "Presidential Board", members: [] }],
        },
      },
      { id: "comm-sec", type: "CommitteesSection", props: {} },
    ],
    content: null,
  });
  assert.deepEqual(
    commFirst.blocks.map((b) => b.type),
    ["CommitteesSection"]
  );
  assert.equal(
    (commFirst.blocks[0].props.groups as Array<{ groupName: string }>)[0].groupName,
    "Presidential Board"
  );
});
