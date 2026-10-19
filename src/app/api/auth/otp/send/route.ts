import { NextRequest, NextResponse } from "next/server";
import { generateOtp } from "@/lib/auth";
import { emailService } from "@/services/email.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body?.email?.toLowerCase()?.trim();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const { code, emailLink, devMode } = await generateOtp(email);

    await emailService
      .sendAuthEmailLink({
        email,
        code,
        emailLink,
      })
      .catch((err) => console.error("Failed to dispatch auth email:", err));

    return NextResponse.json({
      success: true,
      message: `Sign-in link and 6-digit verification code sent to ${email}.`,
      devMode,
      devCode: devMode ? code : undefined,
      devEmailLink: devMode ? emailLink : undefined,
    });
  } catch (err) {
    console.error("OTP send error:", err);
    return NextResponse.json(
      { error: "Unable to generate sign-in link. Please try again later." },
      { status: 500 }
    );
  }
}
