import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { revalidatePagePaths } from "@/lib/page-cache";
import { extractPageBlocks } from "@/lib/page-blocks";
import { DEFAULT_FOOTER_CONFIG, normalizeFooterHref } from "@/lib/footer-config";

type PageBlockLike = {
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
  "autoplayDelay",
] as const;

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

  // 2. ImportantDates sync across all pages that render ImportantDatesSection / ImportantDates
  const datesBlock = blockList.find(
    (b) =>
      (b?.type === "ImportantDatesSection" || b?.type === "ImportantDates") &&
      Array.isArray(b?.props?.dates)
  );
  if (datesBlock?.props) {
    const otherPages = await prisma.page.findMany({
      where: { slug: { not: normalizedSource } },
      select: { id: true, slug: true, title: true, blocks: true, content: true },
    });

    for (const page of otherPages) {
      const pageBlocks = extractPageBlocks(page) as PageBlockLike[];
      let pageChanged = false;
      const updated = pageBlocks.map((b) => {
        if (b?.type === "ImportantDatesSection" || b?.type === "ImportantDates") {
          const nextProps = {
            ...(b.props || {}),
            dates: structuredClone(datesBlock.props!.dates),
          };
          if (JSON.stringify(b.props || {}) !== JSON.stringify(nextProps)) {
            pageChanged = true;
            return { ...b, props: nextProps };
          }
        }
        return b;
      });
      if (pageChanged) {
        await persistUpdatedPageBlocks(page, updated);
      }
    }
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

