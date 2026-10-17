import { NextRequest, NextResponse } from "next/server";
import { authService, emailService } from "@/services";
import type { BroadcastCampaignInput } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const session = await authService.getSession();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yêu cầu quyền Quản trị viên." }, { status: 403 });
    }

    const body = await req.json();
    const {
      targetGroup = "ALL",
      subject,
      message,
      campaignType = "GENERAL",
    } = body as BroadcastCampaignInput;

    if (!subject || !message) {
      return NextResponse.json(
        { error: "Vui lòng nhập đầy đủ tiêu đề và nội dung email thông báo." },
        { status: 400 }
      );
    }

    const result = await emailService.sendBroadcastCampaign({
      targetGroup,
      campaignType,
      subject,
      message,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Lỗi gửi email hàng loạt.";
    console.error("Broadcast error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
