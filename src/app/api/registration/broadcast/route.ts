import { NextRequest } from "next/server";
import { emailService } from "@/services";
import { requireAdminRequest, apiSuccess, apiError } from "@/lib";
import type { BroadcastCampaignInput } from "@/types";

export async function POST(req: NextRequest) {
  const { errorResponse } = await requireAdminRequest("Administrator privileges required.");
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const {
      targetGroup = "ALL",
      subject,
      message,
      campaignType = "GENERAL",
    } = body as BroadcastCampaignInput;

    if (!subject || !message) {
      return apiError("Please provide both an email subject and message body.", 400);
    }

    const result = await emailService.sendBroadcastCampaign({
      targetGroup,
      campaignType,
      subject,
      message,
    });

    return apiSuccess(result);
  } catch (error: unknown) {
    console.error("Broadcast error:", error);
    return apiError(error, 500, "Failed to dispatch bulk email broadcast.");
  }
}
