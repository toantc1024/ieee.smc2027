import { NextRequest } from "next/server";
import {
  verifyOtp,
  upsertUser,
  createSessionToken,
  normalizeEmail,
  attachSessionCookie,
  apiSuccess,
  apiError,
} from "@/lib";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = normalizeEmail(body?.email);
    const code = body?.code?.trim();

    if (!email || !code) {
      return apiError("Email và mã OTP là bắt buộc", 400);
    }

    const result = await verifyOtp(email, code);
    if (!result.valid) {
      return apiError(result.reason || "Mã OTP không hợp lệ", 400);
    }

    const name = email.split("@")[0].toUpperCase();
    const user = await upsertUser({
      id: `otp_${Date.now()}`,
      email,
      name: `Admin ${name}`,
      provider: "email_otp",
      role: "ADMIN",
    });

    const token = await createSessionToken(user);
    const response = apiSuccess({
      message: "Đăng nhập thành công",
      user,
    });

    return attachSessionCookie(response, token);
  } catch (err) {
    console.error("OTP verification error:", err);
    return apiError(err, 500, "Lỗi xác thực OTP trên hệ thống");
  }
}
