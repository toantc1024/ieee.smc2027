import { NextResponse } from "next/server";
import { authService, cmsService } from "@/services";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const page = await cmsService.getPageByIdOrSlug(id);

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    return NextResponse.json({ page });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("Error fetching page:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await authService.getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.page.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
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

    return NextResponse.json({ success: true, page: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("Error updating page:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await authService.getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    if (id === "home") {
      return NextResponse.json(
        { error: "Không thể xóa trang chủ mặc định" },
        { status: 400 }
      );
    }

    await cmsService.deletePage(id);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("Error deleting page:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
