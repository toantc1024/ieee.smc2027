import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yêu cầu quyền Quản trị viên." }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const {
      paymentStatus,
      transactionRef,
      checkInStatus,
      travelNotes,
      dietaryRequirement,
      needsVisaSupport,
    } = body;

    const updateData: any = {};

    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
      if (paymentStatus === "PAID") {
        updateData.paidAt = new Date();
      }
    }

    if (transactionRef !== undefined) {
      updateData.transactionRef = transactionRef;
    }

    if (checkInStatus !== undefined) {
      updateData.checkInStatus = Boolean(checkInStatus);
      updateData.checkedInAt = checkInStatus ? new Date() : null;
    }

    if (travelNotes !== undefined) updateData.travelNotes = travelNotes;
    if (dietaryRequirement !== undefined) updateData.dietaryRequirement = dietaryRequirement;
    if (needsVisaSupport !== undefined) updateData.needsVisaSupport = Boolean(needsVisaSupport);

    const updated = await prisma.registration.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, registration: updated });
  } catch (error: any) {
    console.error("Update registration error:", error);
    return NextResponse.json({ error: error?.message || "Lỗi cập nhật." }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yêu cầu quyền Quản trị viên." }, { status: 403 });
    }

    const { id } = await params;
    await prisma.registration.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Đã xóa bản ghi đăng ký." });
  } catch (error: any) {
    console.error("Delete registration error:", error);
    return NextResponse.json({ error: error?.message || "Lỗi xóa bản ghi." }, { status: 500 });
  }
}
