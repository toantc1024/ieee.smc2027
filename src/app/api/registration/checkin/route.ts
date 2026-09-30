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
    let { code } = body;

    if (!code) {
      return NextResponse.json({ error: "Vui lòng cung cấp mã QR hoặc mã đăng ký." }, { status: 400 });
    }

    // If the QR contains JSON payload like {"code":"SMC27-XXX"}
    if (typeof code === "string" && code.startsWith("{") && code.endsWith("}")) {
      try {
        const parsed = JSON.parse(code);
        if (parsed.code) code = parsed.code;
      } catch (e) {
        // ignore, treat as raw string
      }
    }

    const reg = await prisma.registration.findUnique({
      where: { registrationCode: String(code).trim().toUpperCase() },
    });

    if (!reg) {
      return NextResponse.json(
        { error: `Không tìm thấy đại biểu với mã "${code}". Vui lòng kiểm tra lại thẻ đại biểu.` },
        { status: 404 }
      );
    }

    const wasAlreadyCheckedIn = reg.checkInStatus;

    // Mark as checked in
    const updated = await prisma.registration.update({
      where: { id: reg.id },
      data: {
        checkInStatus: true,
        checkedInAt: reg.checkedInAt || new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      alreadyCheckedIn: wasAlreadyCheckedIn,
      registration: updated,
      message: wasAlreadyCheckedIn
        ? `Đại biểu ${updated.fullName} đã điểm danh trước đó lúc ${new Date(updated.checkedInAt!).toLocaleTimeString("vi-VN")}.`
        : `Điểm danh thành công cho đại biểu ${updated.fullName}!`,
    });
  } catch (error: any) {
    console.error("Check-in error:", error);
    return NextResponse.json({ error: error?.message || "Lỗi xử lý điểm danh." }, { status: 500 });
  }
}
