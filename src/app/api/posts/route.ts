import { NextResponse } from "next/server";
import { prisma } from "@/lib";
import { PostStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      where: { status: PostStatus.PUBLISHED },
      orderBy: { publishedAt: "desc" },
      select: {
        id: true,
        slug: true,
        title: true,
        summary: true,
        content: true,
        coverImage: true,
        category: true,
        views: true,
        publishedAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, posts });
  } catch (error: unknown) {
    console.error("Public posts API error:", error);
    return NextResponse.json({ success: false, posts: [] }, { status: 500 });
  }
}
