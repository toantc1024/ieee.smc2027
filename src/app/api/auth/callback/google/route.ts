import { NextResponse } from "next/server";
import {
  createSessionToken,
  upsertUser,
  getGoogleOAuthConfig,
  getRequestOrigin,
  attachSessionCookie,
  extractErrorMessage,
} from "@/lib";

export async function GET(request: Request) {
  const currentOrigin = getRequestOrigin(request);
  const requestUrl = new URL(request.url);
  const { searchParams } = requestUrl;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(
      new URL(`/admin/login?error=${encodeURIComponent(error || "no_code")}`, currentOrigin)
    );
  }

  const { clientId, clientSecret } = await getGoogleOAuthConfig();
  const redirectUri = `${currentOrigin}${requestUrl.pathname}`;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      new URL("/admin/login?error=missing_google_credentials", currentOrigin)
    );
  }

  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error("Token exchange failed:", tokenData);
      return NextResponse.redirect(
        new URL(
          `/admin/login?error=${encodeURIComponent(
            tokenData.error_description || tokenData.error || "token_exchange_failed"
          )}`,
          currentOrigin
        )
      );
    }

    const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const profile = await userInfoResponse.json();

    if (!userInfoResponse.ok || !profile.email) {
      return NextResponse.redirect(
        new URL("/admin/login?error=failed_user_info", currentOrigin)
      );
    }

    const dbUser = await upsertUser({
      id: profile.sub || `google_${profile.email}`,
      email: profile.email,
      name: profile.name || profile.email.split("@")[0],
      avatar: profile.picture || null,
      provider: "google",
    });

    const sessionToken = await createSessionToken(dbUser);
    const destination = dbUser.role === "ADMIN" ? "/admin" : "/portal";
    const response = NextResponse.redirect(new URL(destination, currentOrigin));
    return attachSessionCookie(response, sessionToken);
  } catch (err: unknown) {
    const message = extractErrorMessage(err, "internal_error");
    console.error("Google OAuth error:", err);
    return NextResponse.redirect(
      new URL(`/admin/login?error=${encodeURIComponent(message)}`, currentOrigin)
    );
  }
}
