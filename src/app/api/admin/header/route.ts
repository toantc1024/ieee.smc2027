import { NextResponse } from "next/server";
import { authService, cmsService } from "@/services";
import { DEFAULT_HEADER_DATA } from "@/lib/header-config";

export async function GET() {
  try {
    const header = await cmsService.getHeaderSetting();
    return NextResponse.json({ header });
  } catch (error: unknown) {
    console.error("Error fetching header settings:", error);
    return NextResponse.json({ header: DEFAULT_HEADER_DATA });
  }
}

export async function POST(request: Request) {
  const user = await authService.getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    await cmsService.saveHeaderSetting(body);
    return NextResponse.json({ success: true, header: body });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("Error saving header settings:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
