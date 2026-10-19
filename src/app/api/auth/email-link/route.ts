import { NextResponse } from "next/server";
import {
  verifyEmailLinkToken,
  upsertUser,
  createSessionToken,
  getRequestOrigin,
  attachSessionCookie,
} from "@/lib";

export async function GET(request: Request) {
  const currentOrigin = getRequestOrigin(request);
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(
      new URL("/admin/login?error=missing_email_link_token", currentOrigin)
    );
  }

  const email = await verifyEmailLinkToken(token);
  if (!email) {
    return NextResponse.redirect(
      new URL("/admin/login?error=expired_or_invalid_email_link", currentOrigin)
    );
  }

  try {
    const user = await upsertUser({
      email,
      provider: "email_link",
    });

    const sessionToken = await createSessionToken(user);
    const destination = user.role === "ADMIN" ? "/admin" : "/portal";
    const response = NextResponse.redirect(new URL(destination, currentOrigin));
    return attachSessionCookie(response, sessionToken);
  } catch (err) {
    console.error("Email link login error:", err);
    return NextResponse.redirect(
      new URL("/admin/login?error=email_link_failed", currentOrigin)
    );
  }
}
