import { NextRequest, NextResponse } from "next/server";
import { authService, registrationService } from "@/services";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await authService.getSession();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yêu cầu quyền Quản trị viên." }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    const updated = await registrationService.updateRegistration(id, body);
    return NextResponse.json({ success: true, registration: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Lỗi cập nhật.";
    console.error("Update registration error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await authService.getSession();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yêu cầu quyền Quản trị viên." }, { status: 403 });
    }

    const { id } = await params;
    await registrationService.deleteRegistration(id);

    return NextResponse.json({ success: true, message: "Đã xóa bản ghi đăng ký." });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Lỗi xóa bản ghi.";
    console.error("Delete registration error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
