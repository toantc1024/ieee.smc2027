import { NextResponse } from "next/server";
import { createSessionToken, upsertUser, SESSION_COOKIE_NAME } from "@/lib/auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (error || !code) {
    return NextResponse.redirect(
      new URL(`/admin/login?error=${encodeURIComponent(error || "no_code")}`, appUrl)
    );
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${appUrl}/api/auth/callback/google`;

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
          `/admin/login?error=${encodeURIComponent(tokenData.error_description || "token_exchange_failed")}`,
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
