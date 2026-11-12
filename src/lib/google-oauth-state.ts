import { randomBytes, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

export const GOOGLE_OAUTH_STATE_COOKIE = "google_oauth_state";
export const GOOGLE_OAUTH_CALLBACK_PATH = "/api/auth/callback/google";
export const GOOGLE_OAUTH_LEGACY_CALLBACK_PATH = "/api/auth/google/callback";

/** Generate an unpredictable, short-lived browser-bound OAuth state value. */
export function createGoogleOAuthState(): string {
  return randomBytes(32).toString("base64url");
}

export function googleOAuthStateMatches(expected: string | undefined, received: string | null): boolean {
  if (!expected || !received || !/^[A-Za-z0-9_-]{43}$/.test(expected) || !/^[A-Za-z0-9_-]{43}$/.test(received)) {
    return false;
  }
  return timingSafeEqual(Buffer.from(expected), Buffer.from(received));
}

export function setGoogleOAuthStateCookie(response: NextResponse, state: string, secure: boolean): void {
  response.cookies.set(GOOGLE_OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/api/auth/",
    maxAge: 10 * 60,
  });
}

export function clearGoogleOAuthStateCookie(response: NextResponse, secure: boolean): void {
  response.cookies.set(GOOGLE_OAUTH_STATE_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/api/auth/",
    maxAge: 0,
  });
}
