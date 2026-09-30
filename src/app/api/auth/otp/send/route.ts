import { NextRequest, NextResponse } from "next/server";
import { generateOtp } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body?.email?.toLowerCase()?.trim();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Email không hợp lệ" }, { status: 400 });
    }

    const { code, devMode } = await generateOtp(email);

    return NextResponse.json({
      success: true,
      message: `Mã OTP xác thực 6 chữ số đã được tạo thành công cho ${email}.`,
      devMode,
      // If dev mode is enabled, supply devCode so user can test effortlessly in local dev
      devCode: devMode ? code : undefined,
    });
  } catch (err) {
    console.error("OTP send error:", err);
    return NextResponse.json({ error: "Không thể tạo mã OTP. Vui lòng thử lại sau." }, { status: 500 });
  }
}
