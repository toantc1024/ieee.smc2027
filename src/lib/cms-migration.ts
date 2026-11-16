import { hydrateBlockPropsServer } from "@/lib/cms-block-defaults";
import { extractPageBlocks } from "@/lib/page-blocks";

export const TEST_ARTIFACT_SLUG_PATTERN =
  /^(draft-test-|ast-test-|test-page-|conference-\d{10,}(?:\/|$))/;

export interface MigratableBlock {
  id: string;
  type: string;
  props: Record<string, unknown>;
  hidden?: boolean;
  children?: MigratableBlock[];
  [key: string]: unknown;
}

export interface MigratePageInput {
  slug: string;
  title: string;
  blocks?: unknown;
  content?: unknown;
  sessionsFromDb?: unknown[];
}

export interface MigratePageResult {
  blocks: MigratableBlock[];
  content: {
    root: Record<string, unknown>;
    content: MigratableBlock[];
  };
  changed: boolean;
}

function asRecord(val: unknown): Record<string, unknown> {
  return val && typeof val === "object" && !Array.isArray(val)
    ? { ...(val as Record<string, unknown>) }
    : {};
}

function pickDefined(
  src: Record<string, unknown>,
  keys: string[]
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const k of keys) {
    if (src[k] !== undefined) {
      out[k] = structuredClone(src[k]);
    }
  }
  return out;
}

function deduplicateCommitteeBlocks(blocks: MigratableBlock[]): MigratableBlock[] {
  const hasCommitteesSection = blocks.some(
    (b) => b?.type === "CommitteesSection"
  );
  const committeeAlias = blocks.find((b) => b?.type === "Committee");
  const aliasProps = committeeAlias ? asRecord(committeeAlias.props) : {};

  if (!hasCommitteesSection && committeeAlias) {
    return blocks.map((b) =>
      b?.type === "Committee"
        ? {
            ...b,
            type: "CommitteesSection",
            props: hydrateBlockPropsServer("CommitteesSection", aliasProps),
          }
        : b
    );
  }

  return blocks
    .filter((b) => b?.type !== "Committee")
    .map((b) => {
      if (b?.type === "CommitteesSection") {
        const merged = { ...asRecord(b.props) };
        if (
          Array.isArray(aliasProps.groups) &&
          aliasProps.groups.length > 0 &&
          (!Array.isArray(merged.groups) || merged.groups.length === 0)
        ) {
          merged.groups = structuredClone(aliasProps.groups);
        }
        return {
          ...b,
          props: hydrateBlockPropsServer("CommitteesSection", merged),
        };
      }
      return b;
    });
}

function decomposeLegacyBlock(
  block: MigratableBlock,
  slug: string,
  allBlockTypes: Set<string>
): MigratableBlock[] {
  const props = asRecord(block.props);
  const baseId = block.id || block.type.toLowerCase();

  // Split monolithic CallForPapers on dedicated submissions / CFP pages (keep compact overview on home)
  if (
    block.type === "CallForPapers" &&
    (slug === "submissions" || slug === "call-for-papers")
  ) {
    const out: MigratableBlock[] = [];
    if (!allBlockTypes.has("SubmissionPortalsBlock")) {
      out.push({
        id: `${baseId}-portals`,
        type: "SubmissionPortalsBlock",
        props: hydrateBlockPropsServer("SubmissionPortalsBlock", {}),
        hidden: Boolean(block.hidden),
      });
    }
    if (!allBlockTypes.has("CfpPoliciesBlock")) {
      const overrides = pickDefined(props, [
        "introText",
        "cfpPdfUrl",
        "downloadButtonLabel",
      ]);
      if (Array.isArray(props.policyCards)) {
        overrides.policies = structuredClone(props.policyCards);
      }
      out.push({
        id: `${baseId}-policies`,
        type: "CfpPoliciesBlock",
        props: hydrateBlockPropsServer("CfpPoliciesBlock", overrides),
        hidden: Boolean(block.hidden),
      });
    }
    if (!allBlockTypes.has("SubmissionCategoriesBlock")) {
      const overrides: Record<string, unknown> = {};
      if (Array.isArray(props.trackCards)) {
        overrides.categories = structuredClone(props.trackCards);
      }
      out.push({
        id: `${baseId}-categories`,
        type: "SubmissionCategoriesBlock",
        props: hydrateBlockPropsServer("SubmissionCategoriesBlock", overrides),
        hidden: Boolean(block.hidden),
      });
    }
    if (!allBlockTypes.has("CfpBrochureBannerBlock")) {
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
        props: hydrateBlockPropsServer("CfpBrochureBannerBlock", overrides),
        hidden: Boolean(block.hidden),
      });
    }
    return out.length > 0 ? out : [block];
  }

  // Split PaymentMethods / RegistrationFeesSection on registration page
  if (
    (block.type === "PaymentMethods" || block.type === "RegistrationFeesSection") &&
    slug === "registration"
  ) {
    const out: MigratableBlock[] = [];
    if (!allBlockTypes.has("RegistrationWizardBlock")) {
      out.push({
        id: `${baseId}-wizard`,
        type: "RegistrationWizardBlock",
        props: hydrateBlockPropsServer("RegistrationWizardBlock", {}),
        hidden: Boolean(block.hidden),
      });
    }
    if (!allBlockTypes.has("RegistrationFeeTableBlock")) {
      const overrides = pickDefined(props, [
        "scheduleHeading",
        "earlyBirdNote",
        "includedBadge",
        "rates",
      ]);
      out.push({
        id: `${baseId}-fees`,
        type: "RegistrationFeeTableBlock",
        props: hydrateBlockPropsServer("RegistrationFeeTableBlock", overrides),
        hidden: Boolean(block.hidden),
      });
    }
    if (!allBlockTypes.has("PaymentChannelsBlock")) {
      const overrides: Record<string, unknown> = {};
      if (Array.isArray(props.paymentChannels)) {
        overrides.channels = structuredClone(props.paymentChannels);
      }
      out.push({
        id: `${baseId}-channels`,
        type: "PaymentChannelsBlock",
        props: hydrateBlockPropsServer("PaymentChannelsBlock", overrides),
        hidden: Boolean(block.hidden),
      });
    }
    if (!allBlockTypes.has("VatInvoiceNoticeBlock")) {
      const vat = asRecord(props.vatInvoice);
      out.push({
        id: `${baseId}-invoice`,
        type: "VatInvoiceNoticeBlock",
        props: hydrateBlockPropsServer(
          "VatInvoiceNoticeBlock",
          pickDefined(vat, [
            "title",
            "description",
            "email",
            "buttonLabel",
            "emailSubject",
          ])
        ),
        hidden: Boolean(block.hidden),
      });
    }
    return out.length > 0 ? out : [block];
  }

  // Split Venue / VenueLocationSection on travel page
  if (
    (block.type === "Venue" || block.type === "VenueLocationSection") &&
    slug === "travel"
  ) {
    const out: MigratableBlock[] = [];
    if (!allBlockTypes.has("VenueOverviewBlock")) {
      out.push({
        id: `${baseId}-overview`,
        type: "VenueOverviewBlock",
        props: hydrateBlockPropsServer(
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
    if (!allBlockTypes.has("TransitLogisticsBlock")) {
      const overrides: Record<string, unknown> = {};
      if (Array.isArray(props.transitCards)) {
        overrides.cards = structuredClone(props.transitCards);
      }
      out.push({
        id: `${baseId}-transit`,
        type: "TransitLogisticsBlock",
        props: hydrateBlockPropsServer("TransitLogisticsBlock", overrides),
        hidden: Boolean(block.hidden),
      });
    }
    if (!allBlockTypes.has("VisitorInfoBlock")) {
      out.push({
        id: `${baseId}-visitor-info`,
        type: "VisitorInfoBlock",
        props: hydrateBlockPropsServer("VisitorInfoBlock", {}),
        hidden: Boolean(block.hidden),
      });
    }
    if (!allBlockTypes.has("CityAttractionsBlock")) {
      const overrides = pickDefined(props, [
        "attractions",
        "calloutText",
        "calloutButtonLabel",
        "calloutButtonUrl",
        "showCallout",
      ]);
      if (typeof props.attractionsHeading === "string") {
        overrides.title = props.attractionsHeading;
      }
      if (typeof props.attractionsSubtitle === "string") {
        overrides.subtitle = props.attractionsSubtitle;
      }
      out.push({
        id: `${baseId}-attractions`,
        type: "CityAttractionsBlock",
        props: hydrateBlockPropsServer("CityAttractionsBlock", overrides),
        hidden: Boolean(block.hidden),
      });
    }
    return out.length > 0 ? out : [block];
  }

  return [block];
}

/**
 * Pure, strictly idempotent transformation migrating legacy blocks to modular hydrated blocks
 * and ensuring `blocks` and `content.content` stay synchronized.
 */
export function migratePageBlocks(input: MigratePageInput): MigratePageResult {
  const rawBlocks = extractPageBlocks({
    blocks: input.blocks,
    content: input.content,
  }).filter(
    (b): b is MigratableBlock =>
      Boolean(b && typeof b === "object" && typeof b.type === "string")
  );

  const normalizedSlug = input.slug.replace(/^\/+|\/+$/g, "");
  let working = deduplicateCommitteeBlocks(rawBlocks);

  const presentTypes = new Set(working.map((b) => b.type));
  const expanded: MigratableBlock[] = [];
  for (const block of working) {
    const parts = decomposeLegacyBlock(block, normalizedSlug, presentTypes);
    for (const part of parts) {
      presentTypes.add(part.type);
      expanded.push(part);
    }
  }
  working = expanded;

  // Hydrate missing props without overwriting customized user props or explicit empty arrays
  working = working.map((b) => {
    const nextProps = hydrateBlockPropsServer(b.type, asRecord(b.props));
    if (
      b.type === "TechnicalSessionsBlock" &&
      Array.isArray(input.sessionsFromDb) &&
      input.sessionsFromDb.length > 0 &&
      (!Array.isArray(nextProps.sessions) || nextProps.sessions.length === 0)
    ) {
      nextProps.sessions = structuredClone(input.sessionsFromDb);
    }
    return {
      ...b,
      props: nextProps,
    };
  });

  const existingContent = asRecord(input.content);
  const existingRoot = asRecord(existingContent.root);
  const nextContent = {
    ...existingContent,
    root: {
      ...existingRoot,
      title: existingRoot.title || input.title,
      slug: input.slug,
    },
    content: working,
  };

  const beforeBlocksJson = JSON.stringify(input.blocks ?? null);
  const afterBlocksJson = JSON.stringify(working);
  const beforeContentJson = JSON.stringify(input.content ?? null);
  const afterContentJson = JSON.stringify(nextContent);

  return {
    blocks: working,
    content: nextContent,
    changed:
      beforeBlocksJson !== afterBlocksJson || beforeContentJson !== afterContentJson,
  };
}

