import { NextRequest } from "next/server";
import { emailService } from "@/services";
import { requireAdminRequest, apiSuccess, apiError } from "@/lib";
import type { BroadcastCampaignInput } from "@/types";

export async function POST(req: NextRequest) {
  const { errorResponse } = await requireAdminRequest("Yêu cầu quyền Quản trị viên.");
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
      return apiError("Vui lòng nhập đầy đủ tiêu đề và nội dung email thông báo.", 400);
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
    return apiError(error, 500, "Lỗi gửi email hàng loạt.");
  }
}
