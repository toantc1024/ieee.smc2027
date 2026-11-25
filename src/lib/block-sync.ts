import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { revalidatePagePaths } from "@/lib/page-cache";
import { extractPageBlocks } from "@/lib/page-blocks";
import { DEFAULT_FOOTER_CONFIG, normalizeFooterHref } from "@/lib/footer-config";
import { DEFAULT_HEADER_DATA, normalizeHeaderConfig } from "@/lib/header-config";

export type PageBlockLike = {
  id?: string;
  type?: string;
  props?: Record<string, unknown>;
  hidden?: boolean;
  [key: string]: unknown;
};

const COMMITTEE_SYNC_PROP_KEYS = [
  "groups",
  "badge",
  "title",
  "titleAccent",
  "subtitle",
  "cardBadgeLabel",
  "autoplayDelay",
] as const;

const PAPER_TEMPLATE_TYPES = new Set([
  "PaperTemplates",
  "PaperSubmissionGuidelinesSection",
]);

const TRACKS_TYPES = new Set(["TracksExplorer", "ConferenceTracksSection"]);

const IMPORTANT_DATES_TYPES = new Set([
  "ImportantDatesSection",
  "ImportantDates",
]);

const DIRECT_SHARED_CFP_TYPES = new Set([
  "SubmissionPortalsBlock",
  "CfpPoliciesBlock",
  "SubmissionCategoriesBlock",
  "CfpBrochureBannerBlock",
  "SubmissionCountdown",
  "CfpSubscribe",
  "CallForPapers",
]);

function hasNonEmptyProps(props: unknown): boolean {
  return Boolean(props && typeof props === "object" && Object.keys(props).length > 0);
}

function mergeProps(
  targetProps: Record<string, unknown> | undefined,
  sourceProps: Record<string, unknown>,
  keys: readonly string[]
): Record<string, unknown> {
  const nextProps: Record<string, unknown> = { ...(targetProps || {}) };
  for (const key of keys) {
    if (sourceProps[key] !== undefined) {
      nextProps[key] = structuredClone(sourceProps[key]);
    }
  }
  return nextProps;
}

function mergeAllDefinedProps(
  targetProps: Record<string, unknown> | undefined,
  sourceProps: Record<string, unknown>
): Record<string, unknown> {
  const nextProps: Record<string, unknown> = { ...(targetProps || {}) };
  for (const [key, val] of Object.entries(sourceProps)) {
    if (val !== undefined) {
      nextProps[key] = structuredClone(val);
    }
  }
  return nextProps;
}

function updateCommitteeBlocks(
  blocks: PageBlockLike[],
  sourceProps: Record<string, unknown>
): { updated: PageBlockLike[]; changed: boolean } {
  const hasCommitteesSection = blocks.some((b) => b?.type === "CommitteesSection");
  let changed = false;

  const updated = blocks
    .filter((block) => {
      if (hasCommitteesSection && block?.type === "Committee") {
        changed = true;
        return false;
      }
      return true;
    })
    .map((block) => {
      if (
        block?.type === "CommitteesSection" ||
        (!hasCommitteesSection && block?.type === "Committee")
      ) {
        const nextProps = mergeProps(block.props, sourceProps, COMMITTEE_SYNC_PROP_KEYS);
        if (JSON.stringify(block.props || {}) !== JSON.stringify(nextProps)) {
          changed = true;
          return { ...block, props: nextProps };
        }
      }
      return block;
    });

  return { updated, changed };
}

function extractCfpPdfUrl(blocks: PageBlockLike[]): string | undefined {
  for (const b of blocks) {
    if (
      (b?.type === "CfpPoliciesBlock" ||
        b?.type === "CfpBrochureBannerBlock" ||
        b?.type === "CallForPapers" ||
        b?.type === "SubmissionCountdown") &&
      typeof b.props?.cfpPdfUrl === "string" &&
      b.props.cfpPdfUrl.trim().length > 0
    ) {
      return b.props.cfpPdfUrl.trim();
    }
  }
  return undefined;
}

/**
 * Pure, deterministic shared-block propagation from a saved source page's blocks
 * into another page's blocks. Handles:
 * - CFP blocks (both monolithic `CallForPapers` <-> split `CfpPoliciesBlock`,
 *   `SubmissionCategoriesBlock`, `CfpBrochureBannerBlock`, plus `SubmissionPortalsBlock`,
 *   `SubmissionCountdown`, `CfpSubscribe`, and `cfpPdfUrl`)
 * - Paper Templates (`PaperTemplates` <-> `PaperSubmissionGuidelinesSection`)
 * - Important Dates (`ImportantDates` <-> `ImportantDatesSection`)
 * - Tracks (`TracksExplorer` <-> `ConferenceTracksSection`)
 */
export function applySharedBlockSyncToTargetBlocks(
  sourceBlocks: PageBlockLike[],
  targetBlocks: PageBlockLike[]
): { updated: PageBlockLike[]; changed: boolean; syncedCfpPdfUrl?: string } {
  let changed = false;
  let nextBlocks = [...targetBlocks];

  const sourceByType = new Map<string, PageBlockLike>();
  for (const b of sourceBlocks) {
    if (b?.type && hasNonEmptyProps(b.props)) {
      sourceByType.set(b.type, b);
    }
  }

  const sourceCallForPapers = sourceByType.get("CallForPapers");
  const sourceCfpPolicies = sourceByType.get("CfpPoliciesBlock");
  const sourceSubmissionCategories = sourceByType.get("SubmissionCategoriesBlock");
  const sourceCfpBrochure = sourceByType.get("CfpBrochureBannerBlock");
  const sourcePaperTemplates =
    sourceBlocks.find((b) => b?.type && PAPER_TEMPLATE_TYPES.has(b.type) && hasNonEmptyProps(b.props));
  const sourceTracks =
    sourceBlocks.find((b) => b?.type && TRACKS_TYPES.has(b.type) && hasNonEmptyProps(b.props));
  const sourceDates = sourceBlocks.find(
    (b) => b?.type && IMPORTANT_DATES_TYPES.has(b.type) && Array.isArray(b.props?.dates)
  );
  const syncedCfpPdfUrl = extractCfpPdfUrl(sourceBlocks);

  nextBlocks = nextBlocks.map((target) => {
    const type = target?.type || "";
    let nextProps: Record<string, unknown> = { ...(target.props || {}) };

    // 1. Direct 1:1 shared CFP block sync (e.g. submissions <-> call-for-papers)
    if (DIRECT_SHARED_CFP_TYPES.has(type) && sourceByType.has(type)) {
      nextProps = mergeAllDefinedProps(nextProps, sourceByType.get(type)!.props!);
    }

    // 2. Monolithic CallForPapers -> split CFP blocks
    if (sourceCallForPapers?.props) {
      const sp = sourceCallForPapers.props;
      if (type === "CfpPoliciesBlock" && !sourceCfpPolicies) {
        if (sp.title !== undefined) nextProps.title = structuredClone(sp.title);
        if (sp.subtitle !== undefined) nextProps.subtitle = structuredClone(sp.subtitle);
        if (sp.introText !== undefined) nextProps.introText = structuredClone(sp.introText);
        if (sp.downloadButtonLabel !== undefined) {
          nextProps.downloadButtonLabel = structuredClone(sp.downloadButtonLabel);
        }
        if (sp.cfpPdfUrl !== undefined) nextProps.cfpPdfUrl = structuredClone(sp.cfpPdfUrl);
        if (Array.isArray(sp.policyCards)) {
          nextProps.policies = structuredClone(sp.policyCards);
        }
      }
      if (type === "SubmissionCategoriesBlock" && !sourceSubmissionCategories) {
        if (Array.isArray(sp.trackCards)) {
          nextProps.categories = structuredClone(sp.trackCards);
        }
      }
      if (type === "CfpBrochureBannerBlock" && !sourceCfpBrochure) {
        if (sp.cfpPdfUrl !== undefined) nextProps.cfpPdfUrl = structuredClone(sp.cfpPdfUrl);
        if (sp.brochureBanner && typeof sp.brochureBanner === "object") {
          const bb = sp.brochureBanner as Record<string, unknown>;
          if (bb.title !== undefined) nextProps.title = structuredClone(bb.title);
          if (bb.description !== undefined) nextProps.description = structuredClone(bb.description);
          if (bb.previewButtonLabel !== undefined) {
            nextProps.previewButtonLabel = structuredClone(bb.previewButtonLabel);
          }
          if (bb.hidePreviewButtonLabel !== undefined) {
            nextProps.hidePreviewButtonLabel = structuredClone(bb.hidePreviewButtonLabel);
          }
          if (bb.openButtonLabel !== undefined) {
            nextProps.openButtonLabel = structuredClone(bb.openButtonLabel);
          }
        }
      }
    }

    // 3. Split CFP blocks -> Monolithic CallForPapers (e.g. submissions/call-for-papers -> home)
    if (type === "CallForPapers" && !sourceCallForPapers) {
      if (sourceCfpPolicies?.props) {
        const sp = sourceCfpPolicies.props;
        if (sp.title !== undefined) nextProps.title = structuredClone(sp.title);
        if (sp.subtitle !== undefined) nextProps.subtitle = structuredClone(sp.subtitle);
        if (sp.introText !== undefined) nextProps.introText = structuredClone(sp.introText);
        if (sp.downloadButtonLabel !== undefined) {
          nextProps.downloadButtonLabel = structuredClone(sp.downloadButtonLabel);
        }
        if (sp.cfpPdfUrl !== undefined) nextProps.cfpPdfUrl = structuredClone(sp.cfpPdfUrl);
        if (Array.isArray(sp.policies)) {
          nextProps.policyCards = structuredClone(sp.policies);
        }
      }
      if (sourceSubmissionCategories?.props && Array.isArray(sourceSubmissionCategories.props.categories)) {
        nextProps.trackCards = structuredClone(sourceSubmissionCategories.props.categories);
      }
      if (sourceCfpBrochure?.props) {
        const sb = sourceCfpBrochure.props;
        if (sb.cfpPdfUrl !== undefined) nextProps.cfpPdfUrl = structuredClone(sb.cfpPdfUrl);
        const existingBanner =
          nextProps.brochureBanner && typeof nextProps.brochureBanner === "object"
            ? { ...(nextProps.brochureBanner as Record<string, unknown>) }
            : {};
        if (sb.title !== undefined) existingBanner.title = structuredClone(sb.title);
        if (sb.description !== undefined) existingBanner.description = structuredClone(sb.description);
        if (sb.previewButtonLabel !== undefined) {
          existingBanner.previewButtonLabel = structuredClone(sb.previewButtonLabel);
        }
        if (sb.hidePreviewButtonLabel !== undefined) {
          existingBanner.hidePreviewButtonLabel = structuredClone(sb.hidePreviewButtonLabel);
        }
        if (sb.openButtonLabel !== undefined) {
          existingBanner.openButtonLabel = structuredClone(sb.openButtonLabel);
        }
        if (Object.keys(existingBanner).length > 0) {
          nextProps.brochureBanner = existingBanner;
        }
      }
    }

    // 4. Propagate updated cfpPdfUrl to all CFP-linked blocks
    if (
      syncedCfpPdfUrl &&
      (type === "CallForPapers" ||
        type === "CfpPoliciesBlock" ||
        type === "CfpBrochureBannerBlock" ||
        type === "SubmissionCountdown" ||
        type === "FooterSection")
    ) {
      nextProps.cfpPdfUrl = syncedCfpPdfUrl;
    }

    // 5. PaperTemplates <-> PaperSubmissionGuidelinesSection
    if (PAPER_TEMPLATE_TYPES.has(type) && sourcePaperTemplates?.props) {
      nextProps = mergeAllDefinedProps(nextProps, sourcePaperTemplates.props);
    }

    // 6. TracksExplorer <-> ConferenceTracksSection
    if (TRACKS_TYPES.has(type) && sourceTracks?.props) {
      nextProps = mergeAllDefinedProps(nextProps, sourceTracks.props);
    }

    // 7. ImportantDates <-> ImportantDatesSection
    if (IMPORTANT_DATES_TYPES.has(type) && sourceDates?.props) {
      nextProps.dates = structuredClone(sourceDates.props.dates);
    }

    if (JSON.stringify(target.props || {}) !== JSON.stringify(nextProps)) {
      changed = true;
      return { ...target, props: nextProps };
    }
    return target;
  });

  return { updated: nextBlocks, changed, syncedCfpPdfUrl };
}

function normalizeFooterBlockProps(props: Record<string, unknown>): Record<string, unknown> {
  const linkGroups = Array.isArray(props.linkGroups)
    ? props.linkGroups.map((group) => {
        if (!group || typeof group !== "object") return group;
        const g = group as Record<string, unknown>;
        return {
          ...g,
          links: Array.isArray(g.links)
            ? g.links.map((link) => {
                if (!link || typeof link !== "object") return link;
                const l = link as Record<string, unknown>;
                return {
                  ...l,
                  href:
                    typeof l.href === "string"
                      ? normalizeFooterHref(l.href)
                      : l.href,
                };
              })
            : [],
        };
      })
    : undefined;

  return {
    ...DEFAULT_FOOTER_CONFIG,
    ...props,
    ...(linkGroups !== undefined ? { linkGroups } : {}),
  };
}

async function persistUpdatedPageBlocks(
  targetPage: { id: string; slug: string; title: string; blocks: unknown; content: unknown },
  updatedBlocks: PageBlockLike[]
) {
  const existingContent =
    targetPage.content && typeof targetPage.content === "object"
      ? (targetPage.content as Record<string, unknown>)
      : {};
  const existingRoot =
    existingContent.root && typeof existingContent.root === "object"
      ? (existingContent.root as Record<string, unknown>)
      : {};

  await prisma.page.update({
    where: { id: targetPage.id },
    data: {
      blocks: updatedBlocks as unknown as Prisma.InputJsonValue,
      content: {
        ...existingContent,
        root: {
          ...existingRoot,
          title: existingRoot.title || targetPage.title,
          slug: targetPage.slug,
        },
        content: updatedBlocks,
      } as unknown as Prisma.InputJsonValue,
    },
  });

  revalidatePagePaths(targetPage.slug);
}

/**
 * Synchronize shared sections across pages and Settings whenever a page is saved or rolled back.
 */
export async function syncSharedBlocksAcrossPages(
  sourceSlug: string,
  savedBlocks: unknown
): Promise<void> {
  const blockList = Array.isArray(savedBlocks)
    ? (savedBlocks as PageBlockLike[])
    : [];
  const normalizedSource = sourceSlug.replace(/^\/+|\/+$/g, "");

  // 1. Bidirectional CommitteesSection sync between `home` and `committees`
  if (normalizedSource === "home" || normalizedSource === "committees") {
    const committeesSection = blockList.find((b) => b?.type === "CommitteesSection");
    const committeeAlias = blockList.find(
      (b) => b?.type === "Committee" && hasNonEmptyProps(b.props)
    );
    const sourceCommittee = committeesSection || committeeAlias;

    if (sourceCommittee?.props && typeof sourceCommittee.props === "object") {
      const targetSlug = normalizedSource === "home" ? "committees" : "home";
      const targetPage = await prisma.page.findUnique({ where: { slug: targetSlug } });
      if (targetPage) {
        const currentBlocks = extractPageBlocks(targetPage) as PageBlockLike[];
        const { updated, changed } = updateCommitteeBlocks(
          currentBlocks,
          sourceCommittee.props
        );
        if (changed) {
          await persistUpdatedPageBlocks(targetPage, updated);
        }
      }
    }
  }

  // 2. Sync CFP blocks, Paper Templates, Tracks, ImportantDates, and cfpPdfUrl across ALL other pages
  const otherPages = await prisma.page.findMany({
    where: { slug: { not: normalizedSource } },
    select: { id: true, slug: true, title: true, blocks: true, content: true },
  });

  let propagatedCfpPdfUrl: string | undefined;

  for (const page of otherPages) {
    const pageBlocks = extractPageBlocks(page) as PageBlockLike[];
    const { updated, changed, syncedCfpPdfUrl } = applySharedBlockSyncToTargetBlocks(
      blockList,
      pageBlocks
    );
    if (syncedCfpPdfUrl) propagatedCfpPdfUrl = syncedCfpPdfUrl;
    if (changed) {
      await persistUpdatedPageBlocks(page, updated);
    }
  }

  // Also propagate updated cfpPdfUrl to global Header & Footer settings so topbar/footer CFP PDF links stay in sync
  if (propagatedCfpPdfUrl) {
    const headerSetting = await prisma.setting.findUnique({ where: { key: "header" } });
    const normalizedHeader = normalizeHeaderConfig(
      (headerSetting?.data as Record<string, unknown> | null) || DEFAULT_HEADER_DATA
    );
    let headerChanged = false;
    const nextQuickLinks = (normalizedHeader.topbar?.quickLinks || []).map((ql) => {
      if (ql.id === "top-cfp-pdf" && ql.href !== propagatedCfpPdfUrl) {
        headerChanged = true;
        return { ...ql, href: propagatedCfpPdfUrl };
      }
      return ql;
    });
    if (headerChanged) {
      await prisma.setting.upsert({
        where: { key: "header" },
        update: {
          data: {
            ...normalizedHeader,
            topbar: { ...normalizedHeader.topbar, quickLinks: nextQuickLinks },
          } as unknown as Prisma.InputJsonValue,
        },
        create: {
          key: "header",
          data: {
            ...normalizedHeader,
            topbar: { ...normalizedHeader.topbar, quickLinks: nextQuickLinks },
          } as unknown as Prisma.InputJsonValue,
        },
      });
    }

    const footerSetting = await prisma.setting.findUnique({ where: { key: "footer" } });
    if (footerSetting?.data && typeof footerSetting.data === "object") {
      const fData = footerSetting.data as Record<string, unknown>;
      if (fData.cfpPdfUrl !== propagatedCfpPdfUrl) {
        await prisma.setting.update({
          where: { key: "footer" },
          data: {
            data: { ...fData, cfpPdfUrl: propagatedCfpPdfUrl } as unknown as Prisma.InputJsonValue,
          },
        });
      }
    }
    revalidatePagePaths("home");
    revalidatePagePaths("submissions");
    revalidatePagePaths("call-for-papers");
  }

  // 3. FooterSection sync to global `footer` Setting and across pages
  const footerBlock = blockList.find(
    (b) => b?.type === "FooterSection" && hasNonEmptyProps(b?.props)
  );
  if (footerBlock?.props) {
    const normalizedFooter = normalizeFooterBlockProps(footerBlock.props);
    await prisma.setting.upsert({
      where: { key: "footer" },
      update: { data: normalizedFooter as unknown as Prisma.InputJsonValue },
      create: {
        key: "footer",
        data: normalizedFooter as unknown as Prisma.InputJsonValue,
      },
    });
    revalidatePagePaths("home");
  }

  // 4. TechnicalSessionsBlock sync to `program_sessions` Setting
  const sessionsBlock = blockList.find(
    (b) => b?.type === "TechnicalSessionsBlock" && Array.isArray(b?.props?.sessions)
  );
  if (sessionsBlock?.props && Array.isArray(sessionsBlock.props.sessions)) {
    const sessionsData = sessionsBlock.props.sessions;
    await prisma.setting.upsert({
      where: { key: "program_sessions" },
      update: { data: sessionsData as unknown as Prisma.InputJsonValue },
      create: {
        key: "program_sessions",
        data: sessionsData as unknown as Prisma.InputJsonValue,
      },
    });
    if (normalizedSource !== "program/sessions") {
      const targetPage = await prisma.page.findUnique({
        where: { slug: "program/sessions" },
      });
      if (targetPage) {
        const pageBlocks = extractPageBlocks(targetPage) as PageBlockLike[];
        let pageChanged = false;
        const updated = pageBlocks.map((b) => {
          if (b?.type === "TechnicalSessionsBlock") {
            pageChanged = true;
            return {
              ...b,
              props: {
                ...(b.props || {}),
                sessions: structuredClone(sessionsData),
              },
            };
          }
          return b;
        });
        if (pageChanged) {
          await persistUpdatedPageBlocks(targetPage, updated);
        }
      }
    }
    revalidatePagePaths("program/sessions");
  }
}
