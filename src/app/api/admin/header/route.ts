import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { DEFAULT_HEADER_DATA } from "@/lib/header-config";

export async function GET() {
  try {
    const rows = await sql`
      SELECT data FROM website_settings WHERE key = 'header' LIMIT 1
    `;
    if (rows.length > 0 && rows[0].data) {
      return NextResponse.json({ header: rows[0].data });
    }
    return NextResponse.json({ header: DEFAULT_HEADER_DATA });
  } catch (error: unknown) {
    console.error("Error fetching header settings:", error);
    return NextResponse.json({ header: DEFAULT_HEADER_DATA });
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    await sql`
      INSERT INTO website_settings (key, data, updated_at)
      VALUES ('header', ${JSON.stringify(body)}, CURRENT_TIMESTAMP)
      ON CONFLICT (key) DO UPDATE SET
        data = EXCLUDED.data,
        updated_at = CURRENT_TIMESTAMP
    `;
    return NextResponse.json({ success: true, header: body });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("Error saving header settings:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
