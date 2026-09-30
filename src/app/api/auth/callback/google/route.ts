import { NextResponse } from "next/server";
import { createSessionToken, upsertUser, SESSION_COOKIE_NAME } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || requestUrl.host;
  const proto = request.headers.get("x-forwarded-proto") || (requestUrl.protocol.replace(":", ""));
  const currentOrigin = `${proto}://${host}`;
  const appUrl = currentOrigin || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const { searchParams } = requestUrl;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(
      new URL(`/admin/login?error=${encodeURIComponent(error || "no_code")}`, appUrl)
    );
  }

  let clientId = process.env.GOOGLE_CLIENT_ID;
  let clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    try {
      const setting = await prisma.setting.findUnique({
        where: { key: "oauth_google" },
      });
      const data = (setting?.data as Record<string, string>) || {};
      clientId = clientId || data.clientId;
      clientSecret = clientSecret || data.clientSecret;
    } catch (e) {
      console.error("Failed to read OAuth settings from DB in callback:", e);
    }
  }

  const redirectUri = `${currentOrigin}/api/auth/callback/google`;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      new URL("/admin/login?error=missing_google_credentials", appUrl)
    );
  }

  try {
    // 1. Exchange authorization code for tokens
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
          `/admin/login?error=${encodeURIComponent(tokenData.error_description || tokenData.error || "token_exchange_failed")}`,
          appUrl
        )
      );
    }

    // 2. Fetch Google profile info
    const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const profile = await userInfoResponse.json();

    if (!userInfoResponse.ok || !profile.email) {
      console.error("UserInfo fetch failed:", profile);
      return NextResponse.redirect(
        new URL("/admin/login?error=failed_user_info", appUrl)
      );
    }

    // 3. Upsert user in Neon DB
    const dbUser = await upsertUser({
      id: profile.sub || `google_${profile.email}`,
      email: profile.email,
      name: profile.name || profile.email.split("@")[0],
      avatar: profile.picture || null,
      role: "ADMIN",
      provider: "google",
    });

    // 4. Sign JWT session
    const sessionToken = await createSessionToken({
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      avatar: dbUser.avatar,
      role: dbUser.role,
    });

    // 5. Redirect to admin with cookie
    const response = NextResponse.redirect(new URL("/admin", appUrl));
    response.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "internal_error";
    console.error("Google OAuth error:", err);
    return NextResponse.redirect(
      new URL(`/admin/login?error=${encodeURIComponent(message)}`, appUrl)
    );
  }
}
