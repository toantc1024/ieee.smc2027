import { NextResponse } from "next/server";
import { prisma } from "@/lib";
import { PostStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    // Look up by slug, or fallback to id
    const post = await prisma.post.findFirst({
      where: {
        OR: [{ slug }, { id: slug }],
        status: PostStatus.PUBLISHED,
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

    if (!post) {
      return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 });
    }

    // Increment view count asynchronously
    prisma.post
      .update({
        where: { id: post.id },
        data: { views: { increment: 1 } },
      })
      .catch(() => {});

    // Fetch up to 3 related published posts for the sidebar/bottom
    const relatedPosts = await prisma.post.findMany({
      where: {
        status: PostStatus.PUBLISHED,
        NOT: { id: post.id },
      },
      orderBy: { publishedAt: "desc" },
      take: 3,
      select: {
        id: true,
        slug: true,
        title: true,
        summary: true,
        coverImage: true,
        category: true,
        publishedAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      post,
      relatedPosts,
    });
  } catch (error: unknown) {
    console.error("Public post detail API error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
