import { NextResponse } from "next/server";
import { cmsService } from "@/services";
import {
  prisma,
  requireAdminRequest,
  apiSuccess,
  apiError,
} from "@/lib";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const page = await cmsService.getPageByIdOrSlug(id);

    if (!page) {
      return apiError("Page not found", 404);
    }

    return NextResponse.json({ page });
  } catch (error: unknown) {
    console.error("Error fetching page:", error);
    return apiError(error, 500);
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { errorResponse } = await requireAdminRequest();
  if (errorResponse) return errorResponse;

  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.page.findUnique({ where: { id } });
    if (!existing) {
      return apiError("Page not found", 404);
    }

    const updated = await cmsService.upsertPage({
      id,
      slug: body.slug ?? existing.slug,
      title: body.title ?? existing.title,
      blocks: body.blocks ?? (existing.blocks as never),
      isPublished: body.is_published ?? existing.isPublished,
      metaTitle: body.meta_title ?? existing.metaTitle,
      metaDescription: body.meta_description ?? existing.metaDescription,
    });

    return apiSuccess({ page: updated });
  } catch (error: unknown) {
    console.error("Error updating page:", error);
    return apiError(error, 500);
  }
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

    await cmsService.deletePage(id);
    return apiSuccess({});
  } catch (error: unknown) {
    console.error("Error deleting page:", error);
    return apiError(error, 500);
  }
}
