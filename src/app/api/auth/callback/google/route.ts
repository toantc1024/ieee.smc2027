import { NextRequest, NextResponse } from "next/server";
import { clearGoogleOAuthStateCookie, GOOGLE_OAUTH_STATE_COOKIE, googleOAuthStateMatches } from "@/lib/google-oauth-state";
import {
  createSessionToken,
  upsertUser,
  recordLogin,
  extractClientInfo,
  getGoogleOAuthConfig,
  getRequestOrigin,
  attachSessionCookie,
  extractErrorMessage,
  prisma,
} from "@/lib";

export async function GET(request: NextRequest) {
  const currentOrigin = getRequestOrigin(request);
  const requestUrl = new URL(request.url);
  const { searchParams } = requestUrl;
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const state = searchParams.get("state");
  const expectedState = request.cookies.get(GOOGLE_OAUTH_STATE_COOKIE)?.value;
  const secureCookie = new URL(currentOrigin).protocol === "https:";
  const redirectAndClear = (path: string) => {
    const response = NextResponse.redirect(new URL(path, currentOrigin));
    clearGoogleOAuthStateCookie(response, secureCookie);
    return response;
  };

  if (!googleOAuthStateMatches(expectedState, state)) {
    return redirectAndClear("/admin/login?error=invalid_oauth_state");
  }

  if (error || !code) {
    return redirectAndClear(`/admin/login?error=${encodeURIComponent(error || "no_code")}`);
  }

  const { clientId, clientSecret, appUrl } = await getGoogleOAuthConfig();
  const baseOrigin = currentOrigin.includes("localhost") || currentOrigin.includes("127.0.0.1")
    ? currentOrigin
    : (appUrl || currentOrigin).replace("://www.ieee-smc2027.org", "://ieee-smc2027.org");
  const redirectUri = `${baseOrigin}${requestUrl.pathname}`;

  if (!clientId || !clientSecret) {
    return redirectAndClear("/admin/login?error=missing_google_credentials");
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
      return redirectAndClear(`/admin/login?error=${encodeURIComponent(
        tokenData.error_description || tokenData.error || "token_exchange_failed"
      )}`);
    }

    const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const profile = await userInfoResponse.json();

    if (!userInfoResponse.ok || !profile.email) {
      return redirectAndClear("/admin/login?error=failed_user_info");
    }

    const cleanEmail = profile.email.toLowerCase().trim();

    // Check if account blocked
    const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existing && existing.status === "BLOCKED") {
      return redirectAndClear("/admin/login?error=account_blocked");
    }

    const { ip, device } = extractClientInfo(request);

    const dbUser = await upsertUser({
      id: profile.sub || `google_${cleanEmail}`,
      email: cleanEmail,
      name: profile.name || cleanEmail.split("@")[0],
      avatar: profile.picture || null,
      provider: "google",
    });

    await recordLogin(dbUser.id, ip, device);

    const sessionToken = await createSessionToken(dbUser);
    const destination = dbUser.role === "ADMIN" ? "/admin" : "/portal";
    const response = NextResponse.redirect(new URL(destination, currentOrigin));
    clearGoogleOAuthStateCookie(response, secureCookie);
    return attachSessionCookie(response, sessionToken);
  } catch (err: unknown) {
    const message = extractErrorMessage(err, "internal_error");
    console.error("Google OAuth error:", err);
    return redirectAndClear(`/admin/login?error=${encodeURIComponent(message)}`);
  }
}
