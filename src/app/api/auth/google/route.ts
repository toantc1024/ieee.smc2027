import { NextResponse } from "next/server";
import { getGoogleOAuthConfig, getRequestOrigin } from "@/lib";
import {
  createGoogleOAuthState,
  GOOGLE_OAUTH_CALLBACK_PATH,
  GOOGLE_OAUTH_LEGACY_CALLBACK_PATH,
  setGoogleOAuthStateCookie,
} from "@/lib/google-oauth-state";

export async function GET(request: Request) {
  const { clientId, appUrl } = await getGoogleOAuthConfig();

  if (!clientId) {
    return NextResponse.redirect(
      new URL("/admin/login?error=missing_google_credentials", request.url)
    );
  }

  const currentOrigin = getRequestOrigin(request);
  const requestUrl = new URL(request.url);
  const customCallback = requestUrl.searchParams.get("callback");
  const callbackPath = customCallback === GOOGLE_OAUTH_LEGACY_CALLBACK_PATH
    ? GOOGLE_OAUTH_LEGACY_CALLBACK_PATH
    : GOOGLE_OAUTH_CALLBACK_PATH;
  const baseOrigin = currentOrigin.includes("localhost") || currentOrigin.includes("127.0.0.1")
    ? currentOrigin
    : (appUrl || currentOrigin).replace("://www.ieee-smc2027.org", "://ieee-smc2027.org");
  const redirectUri = `${baseOrigin}${callbackPath}`;

  const state = createGoogleOAuthState();
  const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  googleAuthUrl.searchParams.set("client_id", clientId);
  googleAuthUrl.searchParams.set("redirect_uri", redirectUri);
  googleAuthUrl.searchParams.set("response_type", "code");
  googleAuthUrl.searchParams.set("scope", "openid email profile");
  googleAuthUrl.searchParams.set("access_type", "offline");
  googleAuthUrl.searchParams.set("prompt", "select_account");
  googleAuthUrl.searchParams.set("state", state);

  const response = NextResponse.redirect(googleAuthUrl.toString());
  setGoogleOAuthStateCookie(response, state, new URL(currentOrigin).protocol === "https:");
  return response;
}
