import { NextRequest, NextResponse } from "next/server";
import { verifyOtp, upsertUser, createSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body?.email?.toLowerCase()?.trim();
    const code = body?.code?.trim();

    if (!email || !code) {
      return NextResponse.json({ error: "Email và mã OTP là bắt buộc" }, { status: 400 });
    }

    const result = await verifyOtp(email, code);

    if (!result.valid) {
      return NextResponse.json({ error: result.reason || "Mã OTP không hợp lệ" }, { status: 400 });
    }

    // Name derived from email prefix or default
    const name = email.split("@")[0].toUpperCase();

    const user = await upsertUser({
      id: `otp_${Date.now()}`,
      email,
      name: `Admin (${name})`,
      provider: "email_otp",
      role: "ADMIN",
    });

    const token = await createSessionToken(user);

    const response = NextResponse.json({
      success: true,
      message: "Đăng nhập thành công",
      user,
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (err) {
    console.error("OTP verification error:", err);
    return NextResponse.json({ error: "Lỗi xác thực OTP trên hệ thống" }, { status: 500 });
  }
}
