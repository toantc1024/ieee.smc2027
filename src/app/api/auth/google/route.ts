import { NextResponse } from "next/server";
import { getGoogleOAuthConfig, getRequestOrigin } from "@/lib";

export async function GET(request: Request) {
  const { clientId } = await getGoogleOAuthConfig();

  if (!clientId) {
    return NextResponse.redirect(
      new URL("/admin/login?error=missing_google_credentials", request.url)
    );
  }

  const currentOrigin = getRequestOrigin(request);
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
