import { NextResponse } from "next/server";
import { PostStatus } from "@prisma/client";
import {
  prisma,
  requireAdminRequest,
  apiSuccess,
  apiError,
} from "@/lib";
import {
  deletePostVersionMeta,
  getPostVersionMeta,
  recordPostVersion,
} from "@/lib/post-versioning";
import { revalidatePostPaths } from "@/lib/page-cache";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { errorResponse } = await requireAdminRequest();
  if (errorResponse) return errorResponse;
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

    const { version, histories } = await getPostVersionMeta(post.id, post);

    return NextResponse.json(
      { post: { ...post, version, histories }, version, histories },
      { headers: NO_STORE_HEADERS }
    );
  } catch (error: unknown) {
    return apiError(error, 500);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, errorResponse } = await requireAdminRequest();
  if (errorResponse) return errorResponse;

  const { id } = await params;

  try {
    const existingPost = await prisma.post.findUnique({
      where: { id },
    });
    if (!existingPost) {
      return apiError("Post not found", 404);
    }

    const body = await request.json();
    const {
      title,
      slug,
      summary,
      content,
      coverImage,
      category,
      status,
      restoreVersion,
    } = body;

    const data: Record<string, unknown> = {};

    if (typeof restoreVersion === "number") {
      const meta = await getPostVersionMeta(id, existingPost);
      const target = meta.histories.find((h) => h.version === restoreVersion);
      if (!target) {
        return apiError(`Version v${restoreVersion} not found`, 404);
      }
      data.title = target.title;
      data.summary = target.summary;
      data.content = target.content;
      data.coverImage = target.coverImage;
      data.category = target.category;
      if (target.status === "PUBLISHED") {
        data.status = PostStatus.PUBLISHED;
        if (!existingPost.publishedAt) data.publishedAt = new Date();
      } else if (target.status === "ARCHIVED") {
        data.status = PostStatus.ARCHIVED;
      } else {
        data.status = PostStatus.DRAFT;
      }
    } else {
      if (title !== undefined) data.title = title.trim();
      if (slug !== undefined && slug.trim()) {
        const cleanSlug = slug.trim().toLowerCase();
        const duplicate = await prisma.post.findFirst({
          where: {
            slug: cleanSlug,
            NOT: { id },
          },
        });
        if (duplicate) {
          return apiError(
            "A post with this URL slug already exists. Please choose a different slug.",
            400
          );
        }
        data.slug = cleanSlug;
      }
      if (summary !== undefined) data.summary = summary ? summary.trim() : null;
      if (content !== undefined) data.content = content;
      if (coverImage !== undefined) data.coverImage = coverImage || null;
      if (category !== undefined) data.category = category;
      if (status !== undefined) {
        if (status === "PUBLISHED") {
          data.status = PostStatus.PUBLISHED;
          if (!existingPost.publishedAt) {
            data.publishedAt = new Date();
          }
        } else if (status === "ARCHIVED") {
          data.status = PostStatus.ARCHIVED;
        } else {
          data.status = PostStatus.DRAFT;
        }
      }
    }

    const updated = await prisma.post.update({
      where: { id },
      data,
    });

    const { version, histories } = await recordPostVersion(updated, user.email);
    revalidatePostPaths(existingPost.slug);
    if (updated.slug !== existingPost.slug) {
      revalidatePostPaths(updated.slug);
    }

    const res = apiSuccess({
      post: { ...updated, version, histories },
      version,
      histories,
    });
    res.headers.set("Cache-Control", NO_STORE_HEADERS["Cache-Control"]);
    return res;
  } catch (error: unknown) {
    console.error("Error updating post:", error);
    return apiError(error, 500, "Failed to update post");
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
    const existing = await prisma.post.findUnique({
      where: { id },
      select: { slug: true },
    });
    await prisma.post.delete({ where: { id } });
    await deletePostVersionMeta(id);
    revalidatePostPaths(existing?.slug);
    return apiSuccess({});
  } catch (error: unknown) {
    console.error("Error deleting post:", error);
    return apiError(error, 500);
  }
}
