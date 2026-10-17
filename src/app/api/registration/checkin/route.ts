import { NextRequest, NextResponse } from "next/server";
import { authService, checkInService } from "@/services";

export async function POST(req: NextRequest) {
  try {
    const session = await authService.getSession();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yêu cầu quyền Quản trị viên." }, { status: 403 });
    }

    const body = await req.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json(
        { error: "Vui lòng cung cấp mã QR hoặc mã đăng ký." },
        { status: 400 }
      );
    }

    const result = await checkInService.verifyAndCheckIn(String(code));

    if (!result.found) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      alreadyCheckedIn: result.alreadyCheckedIn,
      registration: result.registration,
      message: result.message,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Lỗi xử lý điểm danh.";
    console.error("Check-in error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
