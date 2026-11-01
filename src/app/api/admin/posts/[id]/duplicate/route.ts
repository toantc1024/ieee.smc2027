import { NextResponse } from "next/server";
import { PostStatus } from "@prisma/client";
import {
  prisma,
  requireAdminRequest,
  apiSuccess,
  apiError,
} from "@/lib";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, errorResponse } = await requireAdminRequest();
  if (errorResponse) return errorResponse;

  const { id } = await params;

  try {
    const original = await prisma.post.findUnique({
      where: { id },
    });

    if (!original) {
      return apiError("Original post not found", 404);
    }

    // Generate unique slug with -copy suffix and short timestamp
    const baseSlug = original.slug.replace(/-copy(-\d+)?$/, "");
    const uniqueSuffix = Date.now().toString().slice(-4);
    const newSlug = `${baseSlug}-copy-${uniqueSuffix}`;

    const duplicated = await prisma.post.create({
      data: {
        title: `${original.title} (Copy)`,
        slug: newSlug,
        summary: original.summary,
        content: original.content,
        coverImage: original.coverImage,
        category: original.category,
        status: PostStatus.DRAFT, // Always duplicate as draft for editing
        views: 0,
        authorId: user?.id,
      },
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

    return apiSuccess({
      post: duplicated,
      message: "Post duplicated successfully as draft",
    });
  } catch (error: unknown) {
    console.error("Error duplicating post:", error);
    return apiError(error, 500, "Failed to duplicate post");
  }
}
