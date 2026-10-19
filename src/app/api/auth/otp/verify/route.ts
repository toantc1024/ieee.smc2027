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
      return apiError("Email and verification code are required", 400);
    }

    const result = await verifyOtp(email, code);
    if (!result.valid) {
      return apiError(result.reason || "Invalid verification code", 400);
    }

    const user = await upsertUser({
      email,
      provider: "email_otp",
    });

    const token = await createSessionToken(user);
    const response = apiSuccess({
      message: "Signed in successfully",
      user,
      redirectTo: user.role === "ADMIN" ? "/admin" : "/portal",
    });

    return attachSessionCookie(response, token);
  } catch (err) {
    console.error("OTP verification error:", err);
    return apiError(err, 500, "Error verifying code");
  }
}
