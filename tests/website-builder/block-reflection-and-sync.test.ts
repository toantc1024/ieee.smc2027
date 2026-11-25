import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  BLOCK_ALIASES,
  CONFERENCE_BLOCK_DEFINITIONS,
  getBlockDefinition,
  resolveBlockProps,
} from "../../src/modules/website-builder/registry";
import { resolveArchetype } from "../../src/modules/website-builder/components/studio/wireframes/archetype-resolver";
import { BuilderBlockContext } from "../../src/modules/website-builder/utils/sub-item-path";
import { migratePageBlocks } from "../../src/lib/cms-migration";
import { applySharedBlockSyncToTargetBlocks } from "../../src/lib/block-sync";
import { PublicPageRenderer } from "../../src/app/(public)/[slug]/public-page-renderer";
import { InspectorField } from "../../src/modules/website-builder/components/studio/inspector-fields";
import { PAPER_TEMPLATE_ITEMS } from "../../src/components/sections/PaperTemplates";
import {
  buildDownloadUrl,
  DEFAULT_FILE_ACCEPT,
  isAllowedMediaFile,
  matchesAcceptSpec,
  resolveMimeType,
} from "../../src/lib/media-types";

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

function normalizeSsrHtml(html: string): string {
  return html
    .replace(/^(?:<link[^>]*\/>)+/g, "")
    .replace(/id="_R_[^"]+"/g, 'id="R_ID"')
    .replace(/<mask id="[^"]+"/g, '<mask id="MASK"')
    .replace(/url\(#[^)]+\)/g, "url(#MASK)")
    .replace(/aria-labelledby="[^"]+"/g, 'aria-labelledby="ARIA"');
}

test("PublicPageRenderer matches resolveBlockProps across every registered block type on empty props", () => {
  const routerDependentTypes = new Set(["HeaderSection", "NewsList"]);
  const allTypes = Array.from(
    new Set([
      ...Object.keys(CONFERENCE_BLOCK_DEFINITIONS),
      ...Object.keys(BLOCK_ALIASES),
      "Hero",
      "FAQ",
    ])
  );

  for (const appRouterType of routerDependentTypes) {
    assert.ok(getBlockDefinition(appRouterType), `Missing definition for ${appRouterType}`);
    assert.doesNotThrow(() => resolveBlockProps(appRouterType, {}));
  }

  const mismatches: string[] = [];

  for (const type of allTypes) {
    if (routerDependentTypes.has(type)) continue;
    const def = getBlockDefinition(type);
    assert.ok(def, `Missing definition for ${type}`);

    const resolved = resolveBlockProps(type, {});
    const studioHtml = normalizeSsrHtml(
      renderToStaticMarkup(React.createElement(def.render, resolved))
    );
    const publicRaw = renderToStaticMarkup(
      React.createElement(PublicPageRenderer, {
        blocks: [{ id: "b1", type, props: {} }],
      })
    );
    const publicInner = normalizeSsrHtml(
      publicRaw
        .replace(/^(?:<link[^>]*\/>)+/g, "")
        .replace(/^<div class="w-full flex flex-col min-h-\[50vh\]"><section[^>]*>/, "")
        .replace(/<\/section><\/div>$/, "")
    );

    if (studioHtml !== publicInner) {
      mismatches.push(type);
    }
  }

  assert.deepEqual(
    mismatches,
    [],
    `Blocks had Studio/Public empty-props parity mismatch: ${mismatches.join(", ")}`
  );
});

test("every edited schema field reflects verbatim in PublicPageRenderer output", () => {
  const cases: Array<{
    type: string;
    props: Record<string, unknown>;
    expected: string[];
  }> = [
    {
      type: "ContactSupportSection",
      props: {
        cards: [
          {
            iconImage: "/assets/3d-icons/email__3d-icon.jpg",
            eyebrow: "SENT_CONTACT_EYEBROW",
            title: "SENT_CONTACT_TITLE",
            description: "SENT_CONTACT_DESC",
            primaryValue: "SENT_CONTACT_PRIMARY",
            secondaryValue: "SENT_CONTACT_SECONDARY",
            copyValue: "SENT_CONTACT_COPY",
            actionLabel: "SENT_CONTACT_ACTION",
            actionUrl: "https://example.com/contact-action",
            copyButtonLabel: "SENT_CONTACT_COPYBTN",
          },
        ],
      },
      expected: [
        "SENT_CONTACT_EYEBROW",
        "SENT_CONTACT_TITLE",
        "SENT_CONTACT_DESC",
        "SENT_CONTACT_PRIMARY",
        "SENT_CONTACT_SECONDARY",
        "SENT_CONTACT_ACTION",
        "https://example.com/contact-action",
        "SENT_CONTACT_COPYBTN",
      ],
    },
    {
      type: "WorkshopTutorialSection",
      props: {
        cards: [
          {
            iconType: "tutorial",
            title: "SENT_WS_TITLE",
            description: "SENT_WS_DESC",
            bullets: [{ text: "SENT_WS_BULLET" }],
            footerLabel: "SENT_WS_FOOTER_LABEL",
            footerValue: "SENT_WS_FOOTER_VAL",
            footerHref: "https://example.com/ws-proposal",
          },
        ],
      },
      expected: [
        "SENT_WS_TITLE",
        "SENT_WS_DESC",
        "SENT_WS_BULLET",
        "SENT_WS_FOOTER_LABEL",
        "SENT_WS_FOOTER_VAL",
        "https://example.com/ws-proposal",
      ],
    },
    {
      type: "TravelAccommodationSection",
      props: {
        cards: [
          {
            iconType: "hotel",
            title: "SENT_TRV_TITLE",
            subtitle: "SENT_TRV_SUBTITLE",
            description: "SENT_TRV_DESC",
            buttonLabel: "SENT_TRV_BTN",
            buttonUrl: "https://example.com/hotel-book",
            footerNote: "SENT_TRV_FOOTER_NOTE",
          },
        ],
      },
      expected: [
        "SENT_TRV_TITLE",
        "SENT_TRV_SUBTITLE",
        "SENT_TRV_DESC",
        "SENT_TRV_BTN",
        "https://example.com/hotel-book",
        "SENT_TRV_FOOTER_NOTE",
      ],
    },
    {
      type: "VisaInformationSection",
      props: {
        cards: [
          {
            iconType: "letter",
            title: "SENT_VISA_TITLE",
            description: "SENT_VISA_DESC",
            bulletsHeading: "SENT_VISA_BULLETS_HEADING",
            bullets: [{ text: "SENT_VISA_BULLET" }],
            buttonLabel: "SENT_VISA_BTN",
            buttonUrl: "https://example.com/evisa",
            contactLabel: "SENT_VISA_CONTACT_LABEL",
            contactEmail: "sentvisa@example.com",
          },
        ],
      },
      expected: [
        "SENT_VISA_TITLE",
        "SENT_VISA_DESC",
        "SENT_VISA_BULLETS_HEADING",
        "SENT_VISA_BULLET",
        "SENT_VISA_BTN",
        "https://example.com/evisa",
        "SENT_VISA_CONTACT_LABEL",
        "sentvisa@example.com",
      ],
    },
    {
      type: "CfpPoliciesBlock",
      props: {
        policies: [
          {
            iconImage: "/assets/3d/announcement-3d.png",
            eyebrow: "SENT_POLICY_EYEBROW",
            title: "SENT_POLICY_TITLE",
            description: "SENT_POLICY_DESC",
            footerText: "SENT_POLICY_FOOTER",
            footerIcon: "shield",
          },
        ],
      },
      expected: [
        "SENT_POLICY_EYEBROW",
        "SENT_POLICY_TITLE",
        "SENT_POLICY_DESC",
        "SENT_POLICY_FOOTER",
      ],
    },
    {
      type: "PaymentChannelsBlock",
      props: {
        channels: [
          {
            iconType: "card",
            badge: "SENT_PAY_BADGE",
            title: "SENT_PAY_TITLE",
            description: "SENT_PAY_DESC",
            details: [{ label: "SENT_PAY_DET_LABEL", value: "SENT_PAY_DET_VAL" }],
            tags: [{ label: "SENT_PAY_TAG" }],
            ctaLabel: "SENT_PAY_CTA",
            ctaUrl: "https://example.com/pay",
            footerLeft: "SENT_PAY_FOOTER_LEFT",
            footerRight: "SENT_PAY_FOOTER_RIGHT",
          },
        ],
      },
      expected: [
        "SENT_PAY_BADGE",
        "SENT_PAY_TITLE",
        "SENT_PAY_DESC",
        "SENT_PAY_DET_LABEL",
        "SENT_PAY_DET_VAL",
        "SENT_PAY_TAG",
        "SENT_PAY_CTA",
        "SENT_PAY_FOOTER_LEFT",
        "SENT_PAY_FOOTER_RIGHT",
      ],
    },
    {
      type: "ImportantDatesSection",
      props: {
        dates: [
          {
            id: "sent-date",
            title: "SENT_DATE_TITLE",
            originalDeadline: "SENT_ORIG_DEADLINE",
            date: "SENT_NEW_DEADLINE",
            category: "SENT_DATE_CAT",
            status: "SENT_DATE_STATUS",
          },
        ],
      },
      expected: [
        "SENT_DATE_TITLE",
        "SENT_ORIG_DEADLINE",
        "SENT_NEW_DEADLINE",
        "SENT_DATE_CAT",
        "SENT_DATE_STATUS",
      ],
    },
    {
      type: "TransitLogisticsBlock",
      props: {
        cards: [
          {
            title: "SENT_TRANSIT_TITLE",
            description: "SENT_TRANSIT_DESC",
            footerText: "SENT_TRANSIT_FOOTER",
            linkLabel: "SENT_TRANSIT_LINK_LABEL",
            linkUrl: "https://example.com/transit",
          },
        ],
      },
      expected: [
        "SENT_TRANSIT_TITLE",
        "SENT_TRANSIT_DESC",
        "SENT_TRANSIT_FOOTER",
        "SENT_TRANSIT_LINK_LABEL",
        "https://example.com/transit",
      ],
    },
    {
      type: "SponsorshipSection",
      props: {
        sponsors: [
          {
            name: "SENT_SPONSOR_FULL_NAME",
            shortName: "SENT_SPONSOR_SHORT",
            type: "SENT_SPONSOR_TYPE",
            logoType: "ieee",
          },
        ],
      },
      expected: ["SENT_SPONSOR_FULL_NAME", "SENT_SPONSOR_SHORT", "SENT_SPONSOR_TYPE"],
    },
    {
      type: "DataSheetBlock",
      props: {
        title: "SENT_SHEET_TITLE",
        columnsList: [{ header: "SENT_COL_1" }, { header: "SENT_COL_2" }],
        rowsList: [{ cells: "SENT_CELL_A | SENT_CELL_B" }],
      },
      expected: ["SENT_SHEET_TITLE", "SENT_COL_1", "SENT_COL_2", "SENT_CELL_A", "SENT_CELL_B"],
    },
    {
      type: "ButtonsBlock",
      props: {
        buttons: [{ label: "SENT_BTN_LABEL", url: "https://example.com/btn", variant: "primary" }],
      },
      expected: ["SENT_BTN_LABEL", "https://example.com/btn"],
    },
    {
      type: "StatsRowBlock",
      props: {
        title: "SENT_STATS_TITLE",
        items: [{ value: "999+", label: "SENT_STAT_LABEL", description: "SENT_STAT_DESC" }],
      },
      expected: ["SENT_STATS_TITLE", "999+", "SENT_STAT_LABEL", "SENT_STAT_DESC"],
    },
    {
      type: "Features",
      props: {
        badge: "SENT_FEAT_BADGE",
        title: "SENT_FEAT_TITLE",
        items: [{ title: "SENT_FEAT_ITEM", description: "SENT_FEAT_DESC", badge: "SENT_ITEM_BADGE" }],
      },
      expected: ["SENT_FEAT_BADGE", "SENT_FEAT_TITLE", "SENT_FEAT_ITEM", "SENT_FEAT_DESC", "SENT_ITEM_BADGE"],
    },
    {
      type: "Conference/Speakers",
      props: {
        speakers: [
          {
            name: "SENT_SPK_NAME",
            affiliation: "SENT_SPK_AFFIL",
            country: "SENT_SPK_COUNTRY",
            image: "https://example.com/speaker-portrait.jpg",
          },
        ],
      },
      expected: ["SENT_SPK_NAME", "SENT_SPK_AFFIL", "SENT_SPK_COUNTRY", "https://example.com/speaker-portrait.jpg"],
    },
  ];

  for (const c of cases) {
    const html = renderToStaticMarkup(
      React.createElement(PublicPageRenderer, {
        blocks: [{ id: "test-block", type: c.type, props: c.props }],
      })
    );
    for (const token of c.expected) {
      assert.ok(
        html.includes(token),
        `${c.type} should reflect edited token "${token}" in PublicPageRenderer output`
      );
    }
  }
});

test("CommitteesSection and Conference/Speakers safely render external https image URLs", () => {
  assert.doesNotThrow(() => {
    const html = renderToStaticMarkup(
      React.createElement(PublicPageRenderer, {
        blocks: [
          {
            id: "comm-ext",
            type: "CommitteesSection",
            props: {
              groups: [
                {
                  groupName: "Steering",
                  members: [
                    {
                      name: "Prof. External Portrait",
                      role: "Chair",
                      country: "Japan",
                      photo: "https://example.com/portrait.jpg",
                    },
                  ],
                },
              ],
            },
          },
          {
            id: "spk-ext",
            type: "Conference/Speakers",
            props: {
              layout: "human-quote",
              speakers: [
                {
                  name: "Dr. External Keynote",
                  role: "Plenary",
                  image: "https://example.com/keynote.jpg",
                  country: "Germany",
                },
              ],
            },
          },
        ],
      })
    );
    assert.match(html, /https:\/\/example\.com\/portrait\.jpg/);
    assert.match(html, /https:\/\/example\.com\/keynote\.jpg/);
  });
});

test("BuilderBlockContext defaults to null outside any provider so admin shell guards never see a truthy builder context", () => {
  function ContextProbe() {
    const ctx = React.useContext(BuilderBlockContext);
    return React.createElement(
      "span",
      null,
      ctx === null ? "NO_CTX" : `HAS_CTX:${ctx.blockId}`
    );
  }

  const outsideHtml = renderToStaticMarkup(React.createElement(ContextProbe));
  assert.equal(outsideHtml, "<span>NO_CTX</span>");

  const insideHtml = renderToStaticMarkup(
    React.createElement(
      BuilderBlockContext.Provider,
      {
        value: {
          blockId: "blk-1",
          isPreview: true,
          activeSubPath: null,
          hoveredSubPath: null,
        },
      },
      React.createElement(ContextProbe)
    )
  );
  assert.equal(insideHtml, "<span>HAS_CTX:blk-1</span>");
});

test("media-types supports ZIP and document uploads regardless of browser MIME quirks and rejects executables", () => {
  for (const rawType of ["", "application/octet-stream", "application/x-zip-compressed", "application/zip"]) {
    assert.equal(resolveMimeType("ieee-latex-template.zip", rawType), "application/zip");
    assert.equal(isAllowedMediaFile("ieee-latex-template.zip", rawType), true);
    assert.equal(
      matchesAcceptSpec({ name: "ieee-latex-template.zip", type: rawType }, DEFAULT_FILE_ACCEPT),
      true
    );
  }

  for (const name of ["template.docx", "cfp.pdf", "slides.pptx", "fees.xlsx", "main.tex", "bundle.tar.gz"]) {
    assert.equal(isAllowedMediaFile(name, ""), true, name);
    assert.equal(matchesAcceptSpec({ name, type: "" }, DEFAULT_FILE_ACCEPT), true, name);
  }

  for (const bad of ["payload.exe", "script.sh", "xss.html", "malware.js"]) {
    assert.equal(isAllowedMediaFile(bad, ""), false, bad);
  }

  assert.equal(
    buildDownloadUrl("/api/images/public/uploads/template.zip", "IEEE-SMC-2027.zip"),
    "/api/images/public/uploads/template.zip?download=1&filename=IEEE-SMC-2027.zip"
  );
  assert.equal(buildDownloadUrl(""), "");
});

test("file UploadField accepts ZIP archives, renders download action, and omits static URL text input", () => {
  const emptyMarkup = renderToStaticMarkup(
    React.createElement(InspectorField, {
      field: { type: "file", label: "Template file" },
      value: "",
      path: ["templates", 0, "downloadUrl"],
      onChange() {},
      onBusyChange() {},
    })
  );
  assert.match(emptyMarkup, /\.zip/);
  assert.match(emptyMarkup, /application\/zip/);
  assert.doesNotMatch(emptyMarkup, /Or paste document URL/);

  const attachedMarkup = renderToStaticMarkup(
    React.createElement(InspectorField, {
      field: { type: "file", label: "Template file" },
      value: "/api/images/public/uploads/ieee-template.zip",
      path: ["templates", 0, "downloadUrl"],
      onChange() {},
      onBusyChange() {},
    })
  );
  assert.match(attachedMarkup, /ieee-template\.zip/);
  assert.match(attachedMarkup, />ZIP</);
  assert.match(attachedMarkup, /\/api\/images\/public\/uploads\/ieee-template\.zip\?download=1/);
  assert.doesNotMatch(attachedMarkup, /Or paste document URL/);
});

test("PaperSubmissionGuidelinesSection has no static external template URLs and reflects all editable fields including ZIP downloads", () => {
  for (const item of PAPER_TEMPLATE_ITEMS) {
    assert.equal(item.downloadUrl, "", `Default template "${item.name}" must not hardcode a static download URL`);
  }

  const def = getBlockDefinition("PaperSubmissionGuidelinesSection")!;
  assert.equal(def.fields.templates.itemFields?.downloadUrl.type, "file");
  assert.equal((def.fields.templates.defaultItem as Record<string, unknown>)?.downloadUrl, "");

  const html = renderToStaticMarkup(
    React.createElement(PublicPageRenderer, {
      blocks: [
        {
          id: "tpl-block",
          type: "PaperSubmissionGuidelinesSection",
          props: {
            title: "SENT_TPL_TITLE & SENT_TPL_PART2",
            subtitle: "SENT_TPL_SUBTITLE",
            templatesHeading: "SENT_TEMPLATES_HEADING",
            officialBadgeLabel: "SENT_DEFAULT_BADGE",
            usageNoteLabel: "SENT_USAGE_LABEL",
            downloadButtonLabel: "SENT_DL_BTN",
            unavailableButtonLabel: "SENT_PENDING_BTN",
            showCopyLink: true,
            copyLinkLabel: "SENT_COPY_BTN",
            templates: [
              {
                name: "SENT_ZIP_NAME",
                format: "LaTeX ZIP",
                badgeLabel: "SENT_ITEM_BADGE",
                description: "SENT_ZIP_DESC",
                fileSize: "2.4 MB",
                downloadUrl: "/api/images/public/uploads/smc2027-latex.zip",
                fileName: "SMC2027-LaTeX.zip",
                buttonLabel: "SENT_ITEM_DL_BTN",
                instructions: "SENT_ZIP_INSTR",
              },
              {
                name: "SENT_PENDING_NAME",
                format: "DOCX",
                description: "SENT_PENDING_DESC",
                fileSize: "",
                downloadUrl: "",
                instructions: "",
              },
            ],
            showComplianceNotice: true,
            complianceTitle: "SENT_COMP_TITLE",
            complianceMessage: "SENT_COMP_MSG",
            guidelinesHeading: "SENT_GUIDE_HEADING",
            guidelines: [{ label: "SENT_G_LBL", limit: "SENT_G_LIM", detail: "SENT_G_DET" }],
            checklistHeading: "SENT_CHECK_HEADING",
            checklistItems: [{ text: "SENT_CHECK_ITEM" }],
            showAuthorCenter: true,
            authorCenterLabel: "SENT_AUTHOR_LBL",
            authorCenterUrl: "https://example.org/author-center",
          },
        },
      ],
    })
  );

  for (const token of [
    "SENT_TPL_TITLE",
    "SENT_TPL_PART2",
    "SENT_TPL_SUBTITLE",
    "SENT_TEMPLATES_HEADING",
    "SENT_ITEM_BADGE",
    "SENT_USAGE_LABEL",
    "SENT_ITEM_DL_BTN",
    "SENT_PENDING_BTN",
    "SENT_COPY_BTN",
    "SENT_ZIP_NAME",
    "SENT_ZIP_DESC",
    "SENT_ZIP_INSTR",
    "SENT_PENDING_NAME",
    "SENT_COMP_TITLE",
    "SENT_COMP_MSG",
    "SENT_GUIDE_HEADING",
    "SENT_G_LBL",
    "SENT_G_LIM",
    "SENT_G_DET",
    "SENT_CHECK_HEADING",
    "SENT_CHECK_ITEM",
    "SENT_AUTHOR_LBL",
    "https://example.org/author-center",
  ]) {
    assert.ok(html.includes(token), `Missing edited sentinel ${token} in PaperSubmissionGuidelinesSection`);
  }

  assert.match(
    html,
    /href="\/api\/images\/public\/uploads\/smc2027-latex\.zip\?download=1&amp;filename=SMC2027-LaTeX\.zip"/
  );
  assert.match(html, /download="SMC2027-LaTeX\.zip"/);
});

test("CommitteesSection defaults card postfix to IEEE SMC 2027, supports editing it, and fades dot pattern from top only", () => {
  const def = getBlockDefinition("CommitteesSection")!;
  assert.equal(def.fields.cardBadgeLabel?.defaultValue, "IEEE SMC 2027");

  const defaultHtml = renderToStaticMarkup(
    React.createElement(PublicPageRenderer, {
      blocks: [
        {
          id: "comm-default",
          type: "CommitteesSection",
          props: {
            groups: [
              {
                groupName: "Chairs",
                members: [
                  {
                    name: "Prof. Photo Member",
                    role: "General Chair",
                    affiliation: "HCM-UTE",
                    country: "Vietnam",
                    photo: "/chairs/prof-hieu-giang-le.webp",
                  },
                  {
                    name: "Prof. Fallback Member",
                    role: "Co-Chair",
                    affiliation: "HCM-UTE",
                    country: "Vietnam",
                    photo: "",
                  },
                ],
              },
            ],
          },
        },
      ],
    })
  );

  assert.match(defaultHtml, />IEEE SMC 2027</);
  assert.doesNotMatch(defaultHtml, />IEEE SMC</);
  assert.match(defaultHtml, /linear-gradient\(to bottom,/);
  assert.doesNotMatch(defaultHtml, /to bottom right/);
  assert.doesNotMatch(defaultHtml, /165deg/);

  const editedHtml = renderToStaticMarkup(
    React.createElement(PublicPageRenderer, {
      blocks: [
        {
          id: "comm-edited",
          type: "CommitteesSection",
          props: {
            cardBadgeLabel: "SENT_SECTION_POSTFIX",
            groups: [
              {
                groupName: "Chairs",
                members: [
                  {
                    name: "Member A",
                    role: "Chair",
                    country: "Japan",
                    photo: "",
                  },
                  {
                    name: "Member B",
                    role: "Co-Chair",
                    country: "USA",
                    photo: "",
                    badgeLabel: "SENT_MEMBER_OVERRIDE",
                  },
                ],
              },
            ],
          },
        },
      ],
    })
  );

  assert.match(editedHtml, />SENT_SECTION_POSTFIX</);
  assert.match(editedHtml, />SENT_MEMBER_OVERRIDE</);
});

test("applySharedBlockSyncToTargetBlocks syncs CFP blocks, cfpPdfUrl, and PaperTemplates bidirectionally between home and submissions/call-for-papers", () => {
  // Direction A: Editing CallForPapers & PaperTemplates on `home` -> syncs to split CFP blocks on `submissions` / `call-for-papers`
  const homeBlocks = [
    {
      id: "cfp-1",
      type: "CallForPapers",
      props: {
        title: "Updated CFP 2027",
        subtitle: "Updated Subtitle",
        introText: "Updated Intro",
        cfpPdfUrl: "/api/images/public/uploads/cfp-v2.pdf",
        downloadButtonLabel: "Get CFP v2",
        policyCards: [{ eyebrow: "Policy", title: "Updated Policy", description: "Desc", footerText: "May 2027" }],
        trackCards: [{ badge: "Regular", deadline: "May 2027", title: "Regular Track", description: "Desc", checklist: [] }],
        brochureBanner: { title: "CFP Brochure v2", description: "Updated banner", openButtonLabel: "Open v2" },
      },
    },
    {
      id: "tpl-1",
      type: "PaperTemplates",
      props: {
        templatesHeading: "Updated Templates",
        templates: [{ name: "LaTeX v2", format: "ZIP", description: "Updated", downloadUrl: "/api/images/public/uploads/latex-v2.zip" }],
      },
    },
  ];

  const submissionsBlocks = [
    { id: "p1", type: "CfpPoliciesBlock", props: { cfpPdfUrl: "/cfp-ieee-smc-2027.pdf" } },
    { id: "c1", type: "SubmissionCategoriesBlock", props: {} },
    { id: "b1", type: "CfpBrochureBannerBlock", props: { cfpPdfUrl: "/cfp-ieee-smc-2027.pdf" } },
    { id: "cd1", type: "SubmissionCountdown", props: { cfpPdfUrl: "/cfp-ieee-smc-2027.pdf" } },
    { id: "t1", type: "PaperSubmissionGuidelinesSection", props: {} },
  ];

  const forward = applySharedBlockSyncToTargetBlocks(homeBlocks, submissionsBlocks);
  assert.equal(forward.changed, true);
  assert.equal(forward.syncedCfpPdfUrl, "/api/images/public/uploads/cfp-v2.pdf");
  assert.equal(forward.updated[0].props?.title, "Updated CFP 2027");
  assert.equal(forward.updated[0].props?.cfpPdfUrl, "/api/images/public/uploads/cfp-v2.pdf");
  assert.equal((forward.updated[0].props?.policies as Array<{ title: string }>)[0].title, "Updated Policy");
  assert.equal((forward.updated[1].props?.categories as Array<{ title: string }>)[0].title, "Regular Track");
  assert.equal(forward.updated[2].props?.title, "CFP Brochure v2");
  assert.equal(forward.updated[2].props?.cfpPdfUrl, "/api/images/public/uploads/cfp-v2.pdf");
  assert.equal(forward.updated[3].props?.cfpPdfUrl, "/api/images/public/uploads/cfp-v2.pdf");
  assert.equal(forward.updated[4].props?.templatesHeading, "Updated Templates");

  // Direction B: Editing split CFP blocks on `submissions` -> syncs back to `CallForPapers` & `PaperTemplates` on `home`
  const editedSubmissions = [
    {
      id: "p1",
      type: "CfpPoliciesBlock",
      props: {
        title: "Submissions Policy Title",
        cfpPdfUrl: "/api/images/public/uploads/cfp-v3.pdf",
        policies: [{ eyebrow: "Rev", title: "Policy v3", description: "Desc 3", footerText: "June 2027" }],
      },
    },
    {
      id: "c1",
      type: "SubmissionCategoriesBlock",
      props: {
        categories: [{ badge: "Special", deadline: "June 2027", title: "Special Track v3", description: "Desc", checklist: [] }],
      },
    },
    {
      id: "b1",
      type: "CfpBrochureBannerBlock",
      props: {
        title: "Brochure v3",
        cfpPdfUrl: "/api/images/public/uploads/cfp-v3.pdf",
      },
    },
    {
      id: "t1",
      type: "PaperSubmissionGuidelinesSection",
      props: {
        templatesHeading: "Templates v3",
      },
    },
  ];

  const reverse = applySharedBlockSyncToTargetBlocks(editedSubmissions, homeBlocks);
  assert.equal(reverse.changed, true);
  assert.equal(reverse.updated[0].props?.title, "Submissions Policy Title");
  assert.equal(reverse.updated[0].props?.cfpPdfUrl, "/api/images/public/uploads/cfp-v3.pdf");
  assert.equal((reverse.updated[0].props?.policyCards as Array<{ title: string }>)[0].title, "Policy v3");
  assert.equal((reverse.updated[0].props?.trackCards as Array<{ title: string }>)[0].title, "Special Track v3");
  assert.equal((reverse.updated[0].props?.brochureBanner as { title: string }).title, "Brochure v3");
  assert.equal(reverse.updated[1].props?.templatesHeading, "Templates v3");
});

test("applySharedBlockSyncToTargetBlocks syncs ALL other shared conference blocks and aliases across pages without touching page-specific blocks", () => {
  const sourceBlocks = [
    { id: "c1", type: "ContactCards", props: { title: "Updated Support", cards: [{ title: "Desk" }] } },
    { id: "f1", type: "FAQ", props: { title: "Updated FAQ", items: [{ question: "Q1", answer: "A1" }] } },
    { id: "k1", type: "Keynotes", props: { title: "Updated Keynotes", speakers: [{ name: "Dr. Ada" }] } },
    { id: "v1", type: "ConferenceVideo", props: { title: "Updated Video", videoUrl: "https://youtu.be/abc" } },
    { id: "n1", type: "NewsList", props: { title: "Updated News" } },
    { id: "d1", type: "ImportantDates", props: { title: "Updated Dates", dates: [{ id: "1", title: "D1", date: "May 2027" }] } },
    { id: "h1", type: "HeroCarousel", props: { slides: [{ title: "Home Only Hero" }] } },
  ];

  const targetBlocks = [
    { id: "tc1", type: "ContactSupportSection", props: { title: "Old Support" } },
    { id: "tf1", type: "FaqAccordionSection", props: { title: "Old FAQ" } },
    { id: "tk1", type: "KeynoteSpeakersSection", props: { title: "Old Keynotes" } },
    { id: "tv1", type: "ConferenceVideoSection", props: { title: "Old Video" } },
    { id: "tn1", type: "NewsGridSection", props: { title: "Old News" } },
    { id: "td1", type: "ImportantDatesSection", props: { title: "Old Dates", dates: [] } },
    { id: "th1", type: "HeroCarousel", props: { slides: [{ title: "Target Own Hero" }] } },
  ];

  const res = applySharedBlockSyncToTargetBlocks(sourceBlocks, targetBlocks);
  assert.equal(res.changed, true);
  assert.equal(res.updated[0].props?.title, "Updated Support");
  assert.equal(res.updated[1].props?.title, "Updated FAQ");
  assert.equal(res.updated[2].props?.title, "Updated Keynotes");
  assert.equal(res.updated[3].props?.title, "Updated Video");
  assert.equal(res.updated[4].props?.title, "Updated News");
  assert.equal(res.updated[5].props?.title, "Updated Dates");
  assert.equal((res.updated[5].props?.dates as Array<{ title: string }>)[0].title, "D1");
  // Page-specific HeroCarousel must NOT be overwritten
  assert.equal((res.updated[6].props?.slides as Array<{ title: string }>)[0].title, "Target Own Hero");
});
