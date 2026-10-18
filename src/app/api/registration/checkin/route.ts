import { NextRequest } from "next/server";
import { checkInService } from "@/services";
import { requireAdminRequest, apiSuccess, apiError } from "@/lib";

export async function POST(req: NextRequest) {
  const { errorResponse } = await requireAdminRequest("Administrator privileges required.");
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const { code } = body;

    if (!code) {
      return apiError("Please provide a valid QR code or registration code.", 400);
    }

    const result = await checkInService.verifyAndCheckIn(String(code));

    if (!result.found) {
      return apiError(result.error, 404);
    }

    return apiSuccess({
      alreadyCheckedIn: result.alreadyCheckedIn,
      registration: result.registration,
      message: result.message,
    });
  } catch (error: unknown) {
    console.error("Check-in error:", error);
    return apiError(error, 500, "Failed to process check-in.");
  }
}
