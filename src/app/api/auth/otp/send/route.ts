import { NextRequest, NextResponse } from "next/server";
import { generateOtp } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body?.email?.toLowerCase()?.trim();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const { code, devMode } = await generateOtp(email);

    return NextResponse.json({
      success: true,
      message: `A 6-digit verification code has been sent to ${email}.`,
      devMode,
      // If dev mode is enabled, supply devCode so user can test effortlessly in local dev
      devCode: devMode ? code : undefined,
    });
  } catch (err) {
    console.error("OTP send error:", err);
    return NextResponse.json({ error: "Unable to generate OTP code. Please try again later." }, { status: 500 });
  }
}
