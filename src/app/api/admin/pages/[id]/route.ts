import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const rows = await sql`
      SELECT id, slug, title, blocks, is_published, meta_title, meta_description, created_at, updated_at
      FROM website_pages
      WHERE id = ${id} OR slug = ${id}
      LIMIT 1
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    return NextResponse.json({ page: rows[0] });
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
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    const rows = await sql`
      UPDATE website_pages
      SET
        title = COALESCE(${body.title}, title),
        slug = COALESCE(${body.slug}, slug),
        blocks = COALESCE(${JSON.stringify(body.blocks)}, blocks),
        is_published = COALESCE(${body.is_published}, is_published),
        meta_title = COALESCE(${body.meta_title}, meta_title),
        meta_description = COALESCE(${body.meta_description}, meta_description),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING id, slug, title, blocks, is_published, meta_title, meta_description, created_at, updated_at;
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, page: rows[0] });
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
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    if (id === "home") {
      return NextResponse.json(
        { error: "Không thể xóa trang chủ mặc định (home)" },
        { status: 400 }
      );
    }

    await sql`
      DELETE FROM website_pages WHERE id = ${id}
    `;

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("Error deleting page:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
