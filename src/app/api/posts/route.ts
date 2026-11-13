import { NextResponse } from "next/server";
import { prisma } from "@/lib";
import { PostStatus } from "@prisma/client";
import { getBulkPostVersionNumbers } from "@/lib/post-versioning";

export const dynamic = "force-dynamic";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
};

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
        updatedAt: true,
      },
    });

    const versionMap = await getBulkPostVersionNumbers(posts.map((p) => p.id));
    const versionedPosts = posts.map((p) => ({
      ...p,
      version: versionMap[p.id] ?? 1,
    }));

    return NextResponse.json(
      { success: true, posts: versionedPosts },
      { headers: NO_STORE_HEADERS }
    );
  } catch (error: unknown) {
    console.error("Public posts API error:", error);
    return NextResponse.json({ success: false, posts: [] }, { status: 500 });
  }
}
