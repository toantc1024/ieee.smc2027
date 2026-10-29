import { NextResponse } from "next/server";
import { PostStatus } from "@prisma/client";
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
  const { id } = await params;

  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!post) {
      return apiError("Post not found", 404);
    }

    return NextResponse.json({ post });
  } catch (error: unknown) {
    return apiError(error, 500);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { errorResponse } = await requireAdminRequest();
  if (errorResponse) return errorResponse;

  const { id } = await params;

  try {
    const body = await request.json();
    const { title, slug, summary, content, coverImage, category, status } = body;

    const data: Record<string, unknown> = {};
    if (title !== undefined) data.title = title;
    if (slug !== undefined) data.slug = slug;
    if (summary !== undefined) data.summary = summary;
    if (content !== undefined) data.content = content;
    if (coverImage !== undefined) data.coverImage = coverImage;
    if (category !== undefined) data.category = category;
    if (status !== undefined) {
      if (status === "PUBLISHED") {
        data.status = PostStatus.PUBLISHED;
        data.publishedAt = new Date();
      } else if (status === "ARCHIVED") {
        data.status = PostStatus.ARCHIVED;
      } else {
        data.status = PostStatus.DRAFT;
      }
    }

    const updated = await prisma.post.update({
      where: { id },
      data,
    });

    return apiSuccess({ post: updated });
  } catch (error: unknown) {
    console.error("Error updating post:", error);
    return apiError(error, 500);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { errorResponse } = await requireAdminRequest();
  if (errorResponse) return errorResponse;

  const { id } = await params;

  try {
    await prisma.post.delete({ where: { id } });
    return apiSuccess({});
  } catch (error: unknown) {
    console.error("Error deleting post:", error);
    return apiError(error, 500);
  }
}
