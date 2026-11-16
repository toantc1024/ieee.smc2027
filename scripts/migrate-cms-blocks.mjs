import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const TEST_ARTIFACT_SLUG_PATTERN =
  /^(draft-test-|ast-test-|test-page-|conference-\d{10,}(?:\/|$))/;

const INITIAL_SESSIONS_FALLBACK = [
  {
    id: "s1",
    code: "ThA01",
    title: "Autonomous Robotics & Intelligent Control",
    track: "SSE",
    trackName: "Systems Science & Engineering",
    day: "2027-10-07",
    dayLabel: "Day 1 · Oct 7, 2027",
    timeSlot: "09:00 – 10:30",
    room: "Grand Ballroom A",
    chair: "Prof. Dimitar Filev · IEEE Fellow",
    coChair: "Assoc. Prof. Nguyen Van B · HCMUTE",
    papers: [
      {
        id: "SMC27-101",
        title: "Model Predictive Control for Multi-Agent Autonomous Navigation in GPS-Denied Environments",
        authors: "Alex Chen, Min-Jun Kim, Sarah Connor",
        time: "09:00 – 09:20",
      },
      {
        id: "SMC27-102",
        title: "Real-Time Trajectory Optimization for Quadruped Robots via Deep Reinforcement Learning",
        authors: "Tran Minh Tri, Hiroshi Tanaka, David Lee",
        time: "09:20 – 09:40",
      },
    ],
  },
  {
    id: "s2",
    code: "ThA02",
    title: "Deep Learning Foundations & Biomedical Cybernetics",
    track: "CYB",
    trackName: "Cybernetics",
    day: "2027-10-07",
    dayLabel: "Day 1 · Oct 7, 2027",
    timeSlot: "09:00 – 10:30",
    room: "Ballroom B",
    chair: "Prof. Witold Pedrycz · IEEE Life Fellow",
    coChair: "Dr. Pham Thi C · HCMUTE",
    papers: [
      {
        id: "SMC27-201",
        title: "Explainable Fuzzy Cognitive Maps for Personalized Cardiovascular Disease Diagnosis",
        authors: "Michael Zhang, Maria Garcia, Oliver Brown",
        time: "09:00 – 09:20",
      },
    ],
  },
];

const CORE_DEFAULTS = {
  SubmissionPortalsBlock: {
    title: "Submission Portals & Electronic Tools",
    subtitle:
      "Submit manuscripts, validate PDF Xplore compliance, and sign copyright agreements",
  },
  CfpPoliciesBlock: {
    title: "Call For Papers & Submission Policies",
    subtitle: "IEEE Systems, Man, and Cybernetics Society Review & Publication Standards",
    cfpPdfUrl: "/cfp-ieee-smc-2027.pdf",
    downloadButtonLabel: "Download Official CFP Brochure",
  },
  SubmissionCategoriesBlock: {
    title: "Submission Categories & Paper Types",
    subtitle:
      "Regular papers, special sessions, workshops, and tutorials across core conference tracks",
  },
  CfpBrochureBannerBlock: {
    title: "Complete IEEE SMC 2027 Call for Papers Brochure",
    description:
      "Download the authoritative specification for paper templates, special session guidelines, committees, and topics.",
    cfpPdfUrl: "/cfp-ieee-smc-2027.pdf",
    previewButtonLabel: "Preview PDF Specification",
    hidePreviewButtonLabel: "Hide PDF Preview",
    openButtonLabel: "Open PDF Document",
    defaultExpanded: false,
  },
  RegistrationWizardBlock: {
    title: "Conference Registration Portal",
    subtitle: "Select delegate fee tier and complete participant registration",
    continueLabel: "Continue to Participant Details",
    defaultCurrency: "VND",
    extraPageVnd: 3750000,
    extraPageUsd: 150,
    extraBanquetVnd: 2250000,
    extraBanquetUsd: 90,
  },
  RegistrationFeeTableBlock: {
    title: "Registration & Fee Schedule",
    subtitle:
      "Official registration fee schedule and entitlements for IEEE SMC 2027 participants and authors",
    scheduleHeading: "Registration Fee Schedule",
    earlyBirdNote:
      "All prices in USD. Early bird registration deadline: July 05, 2027",
    includedBadge: "IEEE Scopus & Xplore Proceedings Included",
  },
  PaymentChannelsBlock: {
    title: "Accepted Payment Channels & Wire Instructions",
    subtitle:
      "Secure bank transfer, SWIFT international wire, and online card settlement",
  },
  VatInvoiceNoticeBlock: {
    title: "Electronic Financial Invoice & Tax Receipt Issuance",
    description:
      "Authors needing official financial invoices for institutional reimbursement should provide institution tax identification and billing details to the secretariat with payment proof.",
    email: "ieeesmc2027@hcmute.edu.vn",
    buttonLabel: "Request Invoice Receipt",
    emailSubject: "IEEE SMC 2027 VAT Invoice Request",
  },
  VenueOverviewBlock: {
    title: "Conference Venue & Host City",
    subtitle: "Official Hotel & Destination Guide for Delegates Attending IEEE SMC 2027",
    venueName: "Sheraton Saigon Grand Opera Hotel",
    address: "No. 88 Dong Khoi, Saigon Ward, Ho Chi Minh City, Vietnam",
    hostInstitution: "Ho Chi Minh City University of Technology and Engineering-Vietnam",
    contactEmail: "ieeesmc2027@hcmute.edu.vn",
    hotline: "+84 981 479 507 (Van-Phong Vu)",
    image: "/images/sheraton-saigon-card.jpg",
    googleMapsUrl:
      "https://maps.google.com/?q=Sheraton+Saigon+Grand+Opera+Hotel+88+Dong+Khoi+Ho+Chi+Minh",
    hotelBookingUrl:
      "https://www.marriott.com/en-us/hotels/sgnsi-sheraton-saigon-grand-opera-hotel/overview/",
    visaUrl: "https://evisa.gov.vn",
    travelGuideUrl: "/travel",
  },
  TransitLogisticsBlock: {
    title: "Transit & Arrival Logistics",
    subtitle:
      "Visa entry guidance, airport transfers, and downtown District 1 connectivity",
  },
  CityAttractionsBlock: {
    title: "Must-Visit Heritage & Cultural Places in Ho Chi Minh City",
    subtitle: "Explore iconic Saigon architecture, museums, and dining around District 1",
  },
  VisitorInfoBlock: {
    title: "Local Weather, Transport & Practicalities",
    subtitle:
      "Practical information for international visitors arriving in Ho Chi Minh City",
  },
  TechnicalSessionsBlock: {
    title: "Technical Sessions & Symposium Schedule",
    subtitle:
      "Browse the daily agenda for plenary keynotes, paper tracks, and industry panels",
    syncFromDatabase: true,
  },
  CommitteesSection: {
    title: "Organizing Committee",
    titleAccent: "& Leadership",
    subtitle:
      "International Steering & Organizing Committees for IEEE SMC 2027 in Ho Chi Minh City, Vietnam",
    autoplayDelay: 3500,
  },
};

function asRecord(val) {
  return val && typeof val === "object" && !Array.isArray(val) ? { ...val } : {};
}

function clone(val) {
  return val === undefined ? undefined : structuredClone(val);
}

function pickDefined(src, keys) {
  const out = {};
  for (const k of keys) {
    if (src[k] !== undefined) out[k] = clone(src[k]);
  }
  return out;
}

function hydrateCoreProps(type, props) {
  const defaults = CORE_DEFAULTS[type] || {};
  const next = asRecord(props);
  for (const [k, v] of Object.entries(defaults)) {
    if (next[k] === undefined) {
      next[k] = clone(v);
    }
  }
  if (type === "FooterSection" && Array.isArray(next.linkGroups)) {
    next.linkGroups = next.linkGroups.map((group) => {
      if (!group || typeof group !== "object") return group;
      return {
        ...group,
        links: Array.isArray(group.links)
          ? group.links.map((l) =>
              l && typeof l === "object" && typeof l.href === "string"
                ? { ...l, href: l.href.startsWith("#") ? `/${l.href}` : l.href }
                : l
            )
          : [],
      };
    });
  }
  return next;
}

function extractBlocks(page) {
  if (
    page.content &&
    typeof page.content === "object" &&
    Array.isArray(page.content.content) &&
    (page.content.content.length > 0 || !Array.isArray(page.blocks) || page.blocks.length === 0)
  ) {
    return page.content.content;
  }
  if (Array.isArray(page.blocks)) {
    return page.blocks;
  }
  return [];
}

function deduplicateCommittees(blocks) {
  const hasCommitteesSection = blocks.some((b) => b?.type === "CommitteesSection");
  const committeeAlias = blocks.find((b) => b?.type === "Committee");
  const aliasProps = committeeAlias ? asRecord(committeeAlias.props) : {};

  if (!hasCommitteesSection && committeeAlias) {
    return blocks.map((b) =>
      b?.type === "Committee"
        ? { ...b, type: "CommitteesSection", props: hydrateCoreProps("CommitteesSection", aliasProps) }
        : b
    );
  }

  return blocks
    .filter((b) => b?.type !== "Committee")
    .map((b) => {
      if (b?.type === "CommitteesSection") {
        const merged = asRecord(b.props);
        if (
          Array.isArray(aliasProps.groups) &&
          aliasProps.groups.length > 0 &&
          (!Array.isArray(merged.groups) || merged.groups.length === 0)
        ) {
          merged.groups = clone(aliasProps.groups);
        }
        return { ...b, props: hydrateCoreProps("CommitteesSection", merged) };
      }
      return b;
    });
}

function decomposeBlock(block, slug, presentTypes) {
  const props = asRecord(block.props);
  const baseId = block.id || block.type.toLowerCase();

  if (
    block.type === "CallForPapers" &&
    (slug === "submissions" || slug === "call-for-papers")
  ) {
    const out = [];
    if (!presentTypes.has("SubmissionPortalsBlock")) {
      out.push({
        id: `${baseId}-portals`,
        type: "SubmissionPortalsBlock",
        props: hydrateCoreProps("SubmissionPortalsBlock", {}),
        hidden: Boolean(block.hidden),
      });
    }
    if (!presentTypes.has("CfpPoliciesBlock")) {
      const overrides = pickDefined(props, ["introText", "cfpPdfUrl", "downloadButtonLabel"]);
      if (Array.isArray(props.policyCards)) overrides.policies = clone(props.policyCards);
      out.push({
        id: `${baseId}-policies`,
        type: "CfpPoliciesBlock",
        props: hydrateCoreProps("CfpPoliciesBlock", overrides),
        hidden: Boolean(block.hidden),
      });
    }
    if (!presentTypes.has("SubmissionCategoriesBlock")) {
      const overrides = {};
      if (Array.isArray(props.trackCards)) overrides.categories = clone(props.trackCards);
      out.push({
        id: `${baseId}-categories`,
        type: "SubmissionCategoriesBlock",
        props: hydrateCoreProps("SubmissionCategoriesBlock", overrides),
        hidden: Boolean(block.hidden),
      });
    }
    if (!presentTypes.has("CfpBrochureBannerBlock")) {
      const banner = asRecord(props.brochureBanner);
      const overrides = {
        ...pickDefined(props, ["cfpPdfUrl"]),
        ...pickDefined(banner, [
          "title",
          "description",
          "previewButtonLabel",
          "hidePreviewButtonLabel",
          "openButtonLabel",
        ]),
      };
      out.push({
        id: `${baseId}-brochure`,
        type: "CfpBrochureBannerBlock",
        props: hydrateCoreProps("CfpBrochureBannerBlock", overrides),
        hidden: Boolean(block.hidden),
      });
    }
    return out.length > 0 ? out : [block];
  }

  if (
    (block.type === "PaymentMethods" || block.type === "RegistrationFeesSection") &&
    slug === "registration"
  ) {
    const out = [];
    if (!presentTypes.has("RegistrationWizardBlock")) {
      out.push({
        id: `${baseId}-wizard`,
        type: "RegistrationWizardBlock",
        props: hydrateCoreProps("RegistrationWizardBlock", {}),
        hidden: Boolean(block.hidden),
      });
    }
    if (!presentTypes.has("RegistrationFeeTableBlock")) {
      const overrides = pickDefined(props, [
        "scheduleHeading",
        "earlyBirdNote",
        "includedBadge",
        "rates",
      ]);
      out.push({
        id: `${baseId}-fees`,
        type: "RegistrationFeeTableBlock",
        props: hydrateCoreProps("RegistrationFeeTableBlock", overrides),
        hidden: Boolean(block.hidden),
      });
    }
    if (!presentTypes.has("PaymentChannelsBlock")) {
      const overrides = {};
      if (Array.isArray(props.paymentChannels)) overrides.channels = clone(props.paymentChannels);
      out.push({
        id: `${baseId}-channels`,
        type: "PaymentChannelsBlock",
        props: hydrateCoreProps("PaymentChannelsBlock", overrides),
        hidden: Boolean(block.hidden),
      });
    }
    if (!presentTypes.has("VatInvoiceNoticeBlock")) {
      const vat = asRecord(props.vatInvoice);
      out.push({
        id: `${baseId}-invoice`,
        type: "VatInvoiceNoticeBlock",
        props: hydrateCoreProps(
          "VatInvoiceNoticeBlock",
          pickDefined(vat, ["title", "description", "email", "buttonLabel", "emailSubject"])
        ),
        hidden: Boolean(block.hidden),
      });
    }
    return out.length > 0 ? out : [block];
  }

  if ((block.type === "Venue" || block.type === "VenueLocationSection") && slug === "travel") {
    const out = [];
    if (!presentTypes.has("VenueOverviewBlock")) {
      out.push({
        id: `${baseId}-overview`,
        type: "VenueOverviewBlock",
        props: hydrateCoreProps(
          "VenueOverviewBlock",
          pickDefined(props, [
            "venueName",
            "description",
            "secondaryDescription",
            "address",
            "hostInstitution",
            "contactEmail",
            "hotline",
            "image",
            "imageBadge",
            "imageCaptionLabel",
            "googleMapsUrl",
            "hotelBookingUrl",
            "visaUrl",
            "travelGuideUrl",
          ])
        ),
        hidden: Boolean(block.hidden),
      });
    }
    if (!presentTypes.has("TransitLogisticsBlock")) {
      const overrides = {};
      if (Array.isArray(props.transitCards)) overrides.cards = clone(props.transitCards);
      out.push({
        id: `${baseId}-transit`,
        type: "TransitLogisticsBlock",
        props: hydrateCoreProps("TransitLogisticsBlock", overrides),
        hidden: Boolean(block.hidden),
      });
    }
    if (!presentTypes.has("VisitorInfoBlock")) {
      out.push({
        id: `${baseId}-visitor-info`,
        type: "VisitorInfoBlock",
        props: hydrateCoreProps("VisitorInfoBlock", {}),
        hidden: Boolean(block.hidden),
      });
    }
    if (!presentTypes.has("CityAttractionsBlock")) {
      const overrides = pickDefined(props, [
        "attractions",
        "calloutText",
        "calloutButtonLabel",
        "calloutButtonUrl",
        "showCallout",
      ]);
      if (typeof props.attractionsHeading === "string") overrides.title = props.attractionsHeading;
      if (typeof props.attractionsSubtitle === "string") {
        overrides.subtitle = props.attractionsSubtitle;
      }
      out.push({
        id: `${baseId}-attractions`,
        type: "CityAttractionsBlock",
        props: hydrateCoreProps("CityAttractionsBlock", overrides),
        hidden: Boolean(block.hidden),
      });
    }
    return out.length > 0 ? out : [block];
  }

  return [block];
}

function migrateSinglePage(page, sessionsFromDb) {
  const rawBlocks = extractBlocks(page).filter(
    (b) => b && typeof b === "object" && typeof b.type === "string"
  );
  const slug = String(page.slug || "").replace(/^\/+|\/+$/g, "");

  let working = deduplicateCommittees(rawBlocks);
  const presentTypes = new Set(working.map((b) => b.type));
  const expanded = [];

  for (const block of working) {
    const parts = decomposeBlock(block, slug, presentTypes);
    for (const part of parts) {
      presentTypes.add(part.type);
      expanded.push(part);
    }
  }

  working = expanded.map((b) => {
    const nextProps = hydrateCoreProps(b.type, b.props);
    if (
      b.type === "TechnicalSessionsBlock" &&
      Array.isArray(sessionsFromDb) &&
      sessionsFromDb.length > 0 &&
      (!Array.isArray(nextProps.sessions) || nextProps.sessions.length === 0)
    ) {
      nextProps.sessions = clone(sessionsFromDb);
    }
    return {
      ...b,
      props: nextProps,
    };
  });

  const existingContent = asRecord(page.content);
  const existingRoot = asRecord(existingContent.root);
  const nextContent = {
    ...existingContent,
    root: {
      ...existingRoot,
      title: existingRoot.title || page.title,
      slug: page.slug,
    },
    content: working,
  };

  const changed =
    JSON.stringify(page.blocks ?? null) !== JSON.stringify(working) ||
    JSON.stringify(page.content ?? null) !== JSON.stringify(nextContent);

  return { blocks: working, content: nextContent, changed };
}

async function main() {
  let deletedCount = 0;
  let createdCount = 0;
  let updatedCount = 0;

  // 1. Load live sessions from Setting (fallback to defaults)
  const sessionsSetting = await prisma.setting.findUnique({
    where: { key: "program_sessions" },
  });
  const sessionsFromDb =
    Array.isArray(sessionsSetting?.data) && sessionsSetting.data.length > 0
      ? sessionsSetting.data
      : INITIAL_SESSIONS_FALLBACK;

  // 2. Delete automated test artifact pages
  const allPages = await prisma.page.findMany({
    select: {
      id: true,
      slug: true,
      title: true,
      blocks: true,
      content: true,
      version: true,
    },
  });

  const artifactIds = allPages
    .filter((p) => TEST_ARTIFACT_SLUG_PATTERN.test(p.slug))
    .map((p) => p.id);

  if (artifactIds.length > 0) {
    const res = await prisma.page.deleteMany({
      where: { id: { in: artifactIds } },
    });
    deletedCount = res.count;
  }

  // 3. Ensure `program/sessions` CMS page exists
  const hasSessionsPage = allPages.some((p) => p.slug === "program/sessions");
  if (!hasSessionsPage) {
    const initialBlocks = [
      {
        id: "sessions-1",
        type: "TechnicalSessionsBlock",
        props: hydrateCoreProps("TechnicalSessionsBlock", { sessions: sessionsFromDb }),
        hidden: false,
      },
      {
        id: "schedule-1",
        type: "ScheduleTimelineSection",
        props: {},
        hidden: false,
      },
      {
        id: "contact-1",
        type: "ContactSupportSection",
        props: {},
        hidden: false,
      },
    ];
    const initialContent = {
      root: { title: "Technical Sessions & Tracks", slug: "program/sessions" },
      content: initialBlocks,
    };
    await prisma.page.create({
      data: {
        id: "program_sessions",
        slug: "program/sessions",
        title: "Technical Sessions & Tracks",
        blocks: initialBlocks,
        content: initialContent,
        isPublished: true,
        metaTitle: "Technical Sessions & Tracks | IEEE SMC 2027",
        metaDescription:
          "Technical sessions schedule, rooms, chairs, and PaperCept papers",
        version: 1,
        histories: {
          create: {
            version: 1,
            content: initialContent,
            changeSummary: "Seeded modular program/sessions page",
          },
        },
      },
    });
    createdCount++;
  }

  // 4. Migrate remaining pages idempotently
  const remainingPages = await prisma.page.findMany({
    select: {
      id: true,
      slug: true,
      title: true,
      blocks: true,
      content: true,
      version: true,
    },
  });

  for (const page of remainingPages) {
    const { blocks, content, changed } = migrateSinglePage(page, sessionsFromDb);
    if (!changed) continue;

    const nextVersion = (page.version || 1) + 1;
    await prisma.$transaction([
      prisma.page.update({
        where: { id: page.id },
        data: {
          blocks,
          content,
          version: nextVersion,
        },
      }),
      prisma.pageHistory.create({
        data: {
          pageId: page.id,
          version: nextVersion,
          content,
          changeSummary: "Migrated to modular hydrated blocks & synchronized AST",
        },
      }),
    ]);
    updatedCount++;
  }

  console.log(
    `[migrate-cms-blocks] Complete — deleted: ${deletedCount}, created: ${createdCount}, modified: ${updatedCount}`
  );
}

main()
  .catch((err) => {
    console.error("[migrate-cms-blocks] Error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

