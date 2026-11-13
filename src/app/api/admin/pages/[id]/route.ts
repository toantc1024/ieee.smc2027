import { NextResponse } from "next/server";
import {
  prisma,
  requireAdminRequest,
  apiSuccess,
  apiError,
  revalidatePagePaths,
} from "@/lib";
import { STANDARD_CONFERENCE_PAGES, normalizeSlug, formatPageRecord } from "../route";
import { isValidPageParent } from "@/modules/website-builder/utils/page-tree";

const COMMITTEE_SYNC_PROP_KEYS = [
  "groups",
  "badge",
  "title",
  "subtitle",
  "autoplayDelay",
] as const;

type PageBlockLike = {
  id?: string;
  type?: string;
  props?: Record<string, unknown>;
  [key: string]: unknown;
};

function mergeCommitteesProps(
  targetProps: Record<string, unknown> | undefined,
  sourceProps: Record<string, unknown>
): Record<string, unknown> {
  const nextProps: Record<string, unknown> = { ...(targetProps || {}) };
  for (const key of COMMITTEE_SYNC_PROP_KEYS) {
    if (sourceProps[key] !== undefined) {
      nextProps[key] = sourceProps[key];
    }
  }
  return nextProps;
}

function updateBlocksCommitteesSection(
  blocks: unknown,
  sourceProps: Record<string, unknown>
): { updated: PageBlockLike[]; changed: boolean } {
  if (!Array.isArray(blocks)) return { updated: [], changed: false };
  let changed = false;
  const updated = (blocks as PageBlockLike[]).map((block) => {
    if (block && block.type === "CommitteesSection") {
      changed = true;
      return {
        ...block,
        props: mergeCommitteesProps(block.props, sourceProps),
      };
    }
    return block;
  });
  return { updated, changed };
}

/**
 * Keep the CommitteesSection block synchronized between `/committees` and `/` (`home`)
 * so edits saved in either page stay consistent across public views.
 */
async function syncCommitteesSectionToCounterpart(
  slug: string,
  blocks: unknown
): Promise<void> {
  if (slug !== "committees" && slug !== "home") return;
  if (!Array.isArray(blocks)) return;

  const sourceBlock = (blocks as PageBlockLike[]).find(
    (block) =>
      block?.type === "CommitteesSection" &&
      Array.isArray(block.props?.groups) &&
      block.props.groups.length > 0
  );
  if (!sourceBlock?.props) return;

  const counterpartSlug = slug === "committees" ? "home" : "committees";
  const counterpart = await prisma.page.findFirst({
    where: { slug: counterpartSlug },
  });
  if (!counterpart) return;

  const counterpartContent =
    counterpart.content && typeof counterpart.content === "object"
      ? (counterpart.content as { root?: unknown; content?: unknown })
      : null;

  const rawBlocks = Array.isArray(counterpart.blocks)
    ? counterpart.blocks
    : Array.isArray(counterpartContent?.content)
      ? counterpartContent.content
      : [];

  const { updated: syncedBlocks, changed } = updateBlocksCommitteesSection(
    rawBlocks,
    sourceBlock.props
  );
  if (!changed) return;

  const syncedContent = counterpartContent
    ? {
        ...counterpartContent,
        content: Array.isArray(counterpartContent.content)
          ? updateBlocksCommitteesSection(counterpartContent.content, sourceBlock.props).updated
          : syncedBlocks,
      }
    : {
        root: { title: counterpart.title, slug: counterpart.slug },
        content: syncedBlocks,
      };

  await prisma.page.update({
    where: { id: counterpart.id },
    data: {
      blocks: syncedBlocks as any,
      content: syncedContent as any,
      version: counterpart.version + 1,
    },
  });

  revalidatePagePaths("home");
  revalidatePagePaths("committees");
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { errorResponse } = await requireAdminRequest();
  if (errorResponse) return errorResponse;
  try {
    const { id } = await params;
    let page = await prisma.page.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        histories: {
          orderBy: { version: "desc" },
        },
        children: {
          orderBy: { orderIndex: "asc" },
        },
        parent: true,
      },
    });

    if (!page) {
      const stdPage = STANDARD_CONFERENCE_PAGES.find(
        (p) => p.id === id || p.slug === id
      );
      if (stdPage) {
        page = await prisma.page.create({
          data: {
            id: stdPage.id,
            slug: stdPage.slug,
            title: stdPage.title,
            blocks: stdPage.blocks,
            content: { root: { title: stdPage.title, slug: stdPage.slug }, content: stdPage.blocks },
            isPublished: true,
            metaTitle: stdPage.metaTitle,
            metaDescription: stdPage.metaDescription,
            version: 1,
            histories: {
              create: {
                version: 1,
                content: { root: { title: stdPage.title, slug: stdPage.slug }, content: stdPage.blocks },
                changeSummary: "Standard conference seed page",
              },
            },
          },
          include: {
            histories: {
              orderBy: { version: "desc" },
            },
            children: true,
            parent: true,
          },
        });
      } else {
        return apiError("Page not found", 404);
      }
    }

    return NextResponse.json({ page: formatPageRecord(page) });
  } catch (error: unknown) {
    console.error("Error fetching page:", error);
    return apiError(error, 500);
  }
}

async function handleUpdate(
  request: Request,
  paramsPromise: Promise<{ id: string }>
) {
  const { errorResponse } = await requireAdminRequest();
  if (errorResponse) return errorResponse;

  try {
    const { id } = await paramsPromise;
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return apiError("Invalid JSON body", 400);
    }

    let existing = await prisma.page.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
    });

    if (!existing) {
      const stdPage = STANDARD_CONFERENCE_PAGES.find(
        (p) => p.id === id || p.slug === id
      );
      if (stdPage) {
        existing = await prisma.page.create({
          data: {
            id: stdPage.id,
            slug: stdPage.slug,
            title: stdPage.title,
            blocks: stdPage.blocks,
            content: { root: { title: stdPage.title, slug: stdPage.slug }, content: stdPage.blocks },
            isPublished: true,
            metaTitle: stdPage.metaTitle,
            metaDescription: stdPage.metaDescription,
            version: 1,
          },
        });
      } else {
        return apiError("Page not found", 404);
      }
    }

    // Optimistic locking check: if client passes version without forceSave, ensure it matches DB
    const expectedVersion =
      body.forceSave === true
        ? existing.version
        : typeof body.version === "number"
        ? body.version
        : existing.version;

    if (expectedVersion !== existing.version) {
      return apiError(
        "Conflict: Page version mismatch. The page has been updated concurrently.",
        409
      );
    }

    const title = (body.title !== undefined ? body.title : existing.title) || existing.title;
    let slug = existing.slug;
    if (body.slug) {
      slug = normalizeSlug(body.slug);
      if (slug !== existing.slug) {
        const slugConflict = await prisma.page.findFirst({
          where: {
            slug,
            id: { not: existing.id },
          },
        });
        if (slugConflict) {
          return apiError(`A page with slug '${slug}' already exists`, 409);
        }
      }
    }

    // Sync blocks and content AST
    let blocks: any = existing.blocks;
    let content: any = existing.content;

    if (body.content !== undefined) {
      content = body.content;
      if (Array.isArray(body.blocks)) {
        blocks = body.blocks;
      } else if (content && Array.isArray(content.content)) {
        blocks = content.content;
      }
    } else if (body.blocks !== undefined) {
      blocks = Array.isArray(body.blocks) ? body.blocks : [];
      content = {
        root: (existing.content as any)?.root || { title, slug },
        content: blocks,
      };
    }

    const isPublished =
      body.isPublished !== undefined
        ? body.isPublished
        : body.is_published !== undefined
        ? body.is_published
        : existing.isPublished;

    const metaTitle =
      body.metaTitle !== undefined
        ? body.metaTitle
        : body.meta_title !== undefined
        ? body.meta_title
        : existing.metaTitle;

    const metaDescription =
      body.metaDescription !== undefined
        ? body.metaDescription
        : body.meta_description !== undefined
        ? body.meta_description
        : existing.metaDescription;

    const parentId =
      body.parentId !== undefined ? (body.parentId || null) : existing.parentId;

    if (body.parentId !== undefined && parentId !== existing.parentId) {
      const hierarchy = await prisma.page.findMany({ select: { id: true, parentId: true } });
      if (!isValidPageParent(hierarchy, existing.id, parentId)) {
        return apiError("Select an existing parent outside this page's descendants", 400);
      }
    }

    const orderIndex =
      typeof body.orderIndex === "number" ? body.orderIndex : existing.orderIndex;

    const templateId =
      body.templateId !== undefined ? (body.templateId || null) : existing.templateId;

    const newVersion = existing.version + 1;
    const changeSummary =
      body.changeSummary || body.change_summary || "Updated page content";

    const [updatedPage] = await prisma.$transaction([
      prisma.page.update({
        where: { id: existing.id },
        data: {
          slug,
          title,
          blocks,
          content,
          isPublished,
          metaTitle,
          metaDescription,
          parentId,
          orderIndex,
          templateId,
          version: newVersion,
        },
        include: {
          histories: {
            orderBy: { version: "desc" },
          },
          children: true,
          parent: true,
        },
      }),
      prisma.pageHistory.create({
        data: {
          pageId: existing.id,
          version: newVersion,
          content: content ?? { root: { title, slug }, content: blocks },
          changeSummary,
        },
      }),
    ]);

    revalidatePagePaths(slug);
    if (existing.slug !== slug) {
      revalidatePagePaths(existing.slug);
    }

    await syncCommitteesSectionToCounterpart(updatedPage.slug, updatedPage.blocks);

    return apiSuccess({ page: formatPageRecord(updatedPage) }, 200);
  } catch (error: unknown) {
    console.error("Error updating page:", error);
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      ((error as { code: string }).code === "P2002" || (error as { code: string }).code === "P2034")
    ) {
      return apiError("Conflict during concurrent update", 409);
    }
    return apiError(error, 500);
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleUpdate(request, params);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleUpdate(request, params);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { errorResponse } = await requireAdminRequest();
  if (errorResponse) return errorResponse;

  try {
    const { id } = await params;
    if (id === "home") {
      return apiError("Cannot delete default home page", 400);
    }

    const existing = await prisma.page.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
    });

    if (!existing) {
      return apiError("Page not found", 404);
    }

    if (existing.slug === "home") {
      return apiError("Cannot delete default home page", 400);
    }

    // Cascade re-parent child pages to prevent orphaned routes
    await prisma.page.updateMany({
      where: { parentId: existing.id },
      data: { parentId: existing.parentId || null },
    });

    // Delete history snapshots and page in a transaction
    await prisma.$transaction([
      prisma.pageHistory.deleteMany({
        where: { pageId: existing.id },
      }),
      prisma.page.delete({
        where: { id: existing.id },
      }),
    ]);

    revalidatePagePaths(existing.slug);

    return apiSuccess({ message: "Page deleted successfully" });
  } catch (error: unknown) {
    console.error("Error deleting page:", error);
    return apiError(error, 500);
  }
}
