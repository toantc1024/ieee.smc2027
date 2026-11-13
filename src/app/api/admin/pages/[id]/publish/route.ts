import {
  prisma,
  requireAdminRequest,
  apiSuccess,
  apiError,
  revalidatePagePaths,
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
    const newPublished =
      typeof body.isPublished === "boolean"
        ? body.isPublished
        : typeof body.is_published === "boolean"
        ? body.is_published
        : !existing.isPublished;

    const updated = await prisma.page.update({
      where: { id: existing.id },
      data: { isPublished: newPublished },
      include: {
        histories: {
          orderBy: { version: "desc" },
        },
        children: true,
        parent: true,
      },
    });

    revalidatePagePaths(updated.slug);
    if (updated.slug === "committees") {
      revalidatePagePaths("home");
    }

    return apiSuccess({ page: formatPageRecord(updated) });
  } catch (error: unknown) {
    console.error("Error toggling page publish status:", error);
    return apiError(error, 500);
  }
}
