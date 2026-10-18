import { NextResponse } from "next/server";
import { PostStatus } from "@prisma/client";
import {
  prisma,
  slugify,
  requireAdminRequest,
  apiSuccess,
  apiError,
} from "@/lib";

export async function GET() {
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

    return NextResponse.json({ posts });
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

    const finalSlug = slugify(slug || title);

    const newPost = await prisma.post.create({
      data: {
        title,
        slug: `${finalSlug}-${Date.now().toString().slice(-4)}`,
        summary: summary || null,
        content,
        coverImage: coverImage || null,
        category,
        status: status === "PUBLISHED" ? PostStatus.PUBLISHED : PostStatus.DRAFT,
        publishedAt: status === "PUBLISHED" ? new Date() : null,
        authorId: user.id,
      },
    });

    return apiSuccess({ post: newPost });
  } catch (error: unknown) {
    console.error("Error creating post:", error);
    return apiError(error, 500);
  }
}
