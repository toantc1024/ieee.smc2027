import { NextResponse } from "next/server";
import { cmsService } from "@/services";
import { DEFAULT_HEADER_DATA } from "@/lib/header-config";
import { requireAdminRequest, apiSuccess, apiError, withTimeout } from "@/lib";

export async function GET() {
  try {
    const header = await withTimeout(
      cmsService.getHeaderSetting(),
      2000,
      DEFAULT_HEADER_DATA
    );
    return NextResponse.json({ header });
  } catch (error: unknown) {
    console.error("Error fetching header settings:", error);
    return NextResponse.json({ header: DEFAULT_HEADER_DATA });
  }
}

export async function POST(request: Request) {
  const { errorResponse } = await requireAdminRequest();
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    await cmsService.saveHeaderSetting(body);
    return apiSuccess({ header: body });
  } catch (error: unknown) {
    console.error("Error saving header settings:", error);
    return apiError(error, 500);
  }
}
