import { NextResponse } from "next/server";
import { PostStatus } from "@prisma/client";
import {
  prisma,
  slugify,
  requireAdminRequest,
  apiSuccess,
  apiError,
} from "@/lib";
import {
  getBulkPostVersionNumbers,
  recordPostVersion,
} from "@/lib/post-versioning";
import { revalidatePostPaths } from "@/lib/page-cache";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
};

export async function GET() {
  const { errorResponse } = await requireAdminRequest();
  if (errorResponse) return errorResponse;
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    const versionMap = await getBulkPostVersionNumbers(posts.map((p) => p.id));
    const versionedPosts = posts.map((p) => ({
      ...p,
      version: versionMap[p.id] ?? 1,
    }));

    return NextResponse.json(
      { posts: versionedPosts },
      { headers: NO_STORE_HEADERS }
    );
  } catch (error: unknown) {
    console.error("Error fetching posts:", error);
    return apiError(error, 500);
  }
}

export async function POST(request: Request) {
  const { user, errorResponse } = await requireAdminRequest();
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();

    const {
      title,
      slug,
      summary,
      content,
      coverImage,
      category = "General",
      status = "DRAFT",
    } = body;

    if (!title || !content) {
      return apiError("Post title and content cannot be empty", 400);
    }

    const baseSlug = slugify(slug || title) || `post-${Date.now()}`;
    const existingSlug = await prisma.post.findUnique({
      where: { slug: baseSlug },
      select: { id: true },
    });
    const finalSlug = existingSlug
      ? `${baseSlug}-${Date.now().toString().slice(-4)}`
      : baseSlug;

    const newPost = await prisma.post.create({
      data: {
        title,
        slug: finalSlug,
        summary: summary || null,
        content,
        coverImage: coverImage || null,
        category,
        status: status === "PUBLISHED" ? PostStatus.PUBLISHED : PostStatus.DRAFT,
        publishedAt: status === "PUBLISHED" ? new Date() : null,
        authorId: user.id,
      },
    });

    const { version, histories } = await recordPostVersion(newPost, user.email);
    revalidatePostPaths(newPost.slug);

    return apiSuccess({
      post: { ...newPost, version, histories },
      version,
      histories,
    });
  } catch (error: unknown) {
    console.error("Error creating post:", error);
    return apiError(error, 500);
  }
}
