import { NextResponse } from "next/server";
import { cmsService } from "@/services";
import {
  prisma,
  requireAdminRequest,
  apiSuccess,
  apiError,
} from "@/lib";
import { STANDARD_CONFERENCE_PAGES } from "../route";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let page = await cmsService.getPageByIdOrSlug(id);

    if (!page) {
      const stdPage = STANDARD_CONFERENCE_PAGES.find(
        (p) => p.id === id || p.slug === id
      );
      if (stdPage) {
        page = await cmsService.upsertPage({
          id: stdPage.id,
          slug: stdPage.slug,
          title: stdPage.title,
          blocks: stdPage.blocks,
          isPublished: true,
          metaTitle: stdPage.metaTitle,
          metaDescription: stdPage.metaDescription,
        });
      } else {
        return apiError("Page not found", 404);
      }
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
            isPublished: true,
            metaTitle: stdPage.metaTitle,
            metaDescription: stdPage.metaDescription,
          },
        });
      } else {
        return apiError("Page not found", 404);
      }
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
