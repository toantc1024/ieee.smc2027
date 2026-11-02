import {
  prisma,
  requireAdminRequest,
  apiSuccess,
  apiError,
} from "@/lib";
import { formatPageRecord } from "../../route";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { errorResponse } = await requireAdminRequest();
  if (errorResponse) return errorResponse;

  try {
    const { id } = await params;
    const existing = await prisma.page.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
    });

    if (!existing) {
      return apiError("Page not found", 404);
    }

    const body = await request.json().catch(() => ({}));
    const { version, historyId } = body;

    if (version === undefined && !historyId) {
      return apiError("Either version or historyId is required for rollback", 400);
    }

    let historySnapshot = null;
    if (historyId) {
      historySnapshot = await prisma.pageHistory.findUnique({
        where: { id: historyId },
      });
    } else if (version !== undefined) {
      historySnapshot = await prisma.pageHistory.findUnique({
        where: {
          pageId_version: {
            pageId: existing.id,
            version: Number(version),
          },
        },
      });
    }

    if (!historySnapshot) {
      return apiError("Page history snapshot not found", 404);
    }

    const rawContent: any = historySnapshot.content;
    let restoredBlocks: any = [];
    let restoredContent: any = rawContent;

    if (rawContent && typeof rawContent === "object") {
      if (Array.isArray(rawContent.content)) {
        restoredBlocks = rawContent.content;
      } else if (Array.isArray(rawContent)) {
        restoredBlocks = rawContent;
        restoredContent = {
          root: (existing.content as any)?.root || { title: existing.title, slug: existing.slug },
          content: restoredBlocks,
        };
      }
    }

    const newVersion = existing.version + 1;
    const changeSummary = `Rolled back to revision v${historySnapshot.version}`;

    const [updatedPage] = await prisma.$transaction([
      prisma.page.update({
        where: { id: existing.id },
        data: {
          blocks: restoredBlocks,
          content: restoredContent,
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
          content: restoredContent,
          changeSummary,
        },
      }),
    ]);

    return apiSuccess({
      page: formatPageRecord(updatedPage),
      restoredVersion: historySnapshot.version,
    });
  } catch (error: unknown) {
    console.error("Error executing page rollback:", error);
    return apiError(error, 500);
  }
}
