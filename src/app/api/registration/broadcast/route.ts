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
      templateSlug,
    } = body as BroadcastCampaignInput;

    if (!templateSlug && (!subject || !message)) {
      return apiError(
        "Please select a Milestone Template or provide both subject and message body.",
        400
      );
    }

    const result = await emailService.sendBroadcastCampaign({
      targetGroup,
      campaignType,
      templateSlug,
      subject: subject || "",
      message: message || "",
    });

    return apiSuccess(result);
  } catch (error: unknown) {
    console.error("Broadcast error:", error);
    return apiError(error, 500, "Failed to dispatch bulk email broadcast.");
  }
}
