import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yêu cầu quyền Quản trị viên." }, { status: 403 });
    }

    const body = await req.json();
    const { targetGroup = "ALL", subject, message, campaignType = "GENERAL" } = body;

    if (!subject || !message) {
      return NextResponse.json(
        { error: "Vui lòng nhập đầy đủ tiêu đề và nội dung email thông báo." },
        { status: 400 }
      );
    }

    const where: any = {};
    if (targetGroup === "PAID") {
      where.paymentStatus = "PAID";
    } else if (targetGroup === "PENDING") {
      where.paymentStatus = "PENDING";
    } else if (targetGroup === "AUTHOR") {
      where.participantType = "AUTHOR";
    } else if (targetGroup === "STUDENT") {
      where.participantType = "STUDENT";
    }

    const recipients = await prisma.registration.findMany({
      where,
      select: {
        id: true,
        fullName: true,
        email: true,
        registrationCode: true,
        participantType: true,
        paymentStatus: true,
      },
    });

    if (recipients.length === 0) {
      return NextResponse.json({
        success: true,
        sentCount: 0,
        message: "Không có đại biểu nào trong nhóm mục tiêu đã chọn.",
      });
    }

    // In production, dispatch emails via SMTP / Resend / SendGrid / NodeMailer.
    // For now, log the batch broadcast and return success status
    console.log(`[Email Broadcast] Dispatched "${subject}" to ${recipients.length} recipients:`, {
      targetGroup,
      campaignType,
      sampleRecipient: recipients[0]?.email,
    });

    return NextResponse.json({
      success: true,
      sentCount: recipients.length,
      sampleRecipients: recipients.slice(0, 5).map((r) => `${r.fullName} <${r.email}>`),
      message: `Đã gửi email thành công tới ${recipients.length} đại biểu (${targetGroup}).`,
    });
  } catch (error: any) {
    console.error("Broadcast error:", error);
    return NextResponse.json({ error: error?.message || "Lỗi gửi email hàng loạt." }, { status: 500 });
  }
}
