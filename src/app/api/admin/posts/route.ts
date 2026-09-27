import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { PostStatus } from "@prisma/client";

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
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("Error fetching posts:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
      return NextResponse.json(
        { error: "Tiêu đề và nội dung bài viết không được để trống" },
        { status: 400 }
      );
    }

    const finalSlug = (slug || title)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

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

    return NextResponse.json({ success: true, post: newPost });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("Error creating post:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
