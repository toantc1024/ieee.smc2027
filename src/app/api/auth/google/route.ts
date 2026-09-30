import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  let clientId = process.env.GOOGLE_CLIENT_ID;

  if (!clientId || clientId.trim() === "") {
    try {
      const setting = await prisma.setting.findUnique({
        where: { key: "oauth_google" },
      });
      const data = (setting?.data as Record<string, string>) || {};
      clientId = data.clientId;
    } catch (e) {
      console.error("Failed to read OAuth settings from DB:", e);
    }
  }

  if (!clientId || clientId.trim() === "") {
    return NextResponse.redirect(
      new URL("/admin/login?error=missing_google_credentials", request.url)
    );
  }

  // Determine current origin from request URL or configured environment
  const requestUrl = new URL(request.url);
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || requestUrl.host;
  const proto = request.headers.get("x-forwarded-proto") || (requestUrl.protocol.replace(":", ""));
  const currentOrigin = `${proto}://${host}`;
  const redirectUri = `${currentOrigin}/api/auth/callback/google`;

  const state = Math.random().toString(36).substring(2);
  const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  googleAuthUrl.searchParams.set("client_id", clientId);
  googleAuthUrl.searchParams.set("redirect_uri", redirectUri);
  googleAuthUrl.searchParams.set("response_type", "code");
  googleAuthUrl.searchParams.set("scope", "openid email profile");
  googleAuthUrl.searchParams.set("access_type", "offline");
  googleAuthUrl.searchParams.set("prompt", "select_account");
  googleAuthUrl.searchParams.set("state", state);

  return NextResponse.redirect(googleAuthUrl.toString());
}
