/**
 * Shared Next.js API Route Helpers
 * Eliminates duplicated auth checks, cookie handling, origin resolution, and JSON error responses.
 */

import { NextResponse } from "next/server";
import env from "@/config/env";
import { getCurrentUser, SESSION_COOKIE_NAME, type SessionUser } from "./auth";
import { extractErrorMessage } from "./utils";

const SEVEN_DAYS_IN_SECONDS = 60 * 60 * 24 * 7;

/**
 * Standardized JSON Error Response
 */
export function apiError(
  error: unknown,
  status = 500,
  fallbackMessage = "Internal Server Error"
): NextResponse {
  const message = extractErrorMessage(error, fallbackMessage);
  return NextResponse.json({ error: message }, { status });
}

/**
 * Standardized JSON Success Response
 */
export function apiSuccess<T extends Record<string, unknown>>(
  payload: T,
  status = 200
): NextResponse {
  return NextResponse.json({ success: true, ...payload }, { status });
}

/**
 * Guard helper for Admin API routes.
 * Returns either `{ user, errorResponse: null }` or `{ user: null, errorResponse: NextResponse }`.
 */
export async function requireAdminRequest(
  unauthorizedMessage = "Unauthorized"
): Promise<
  | { user: SessionUser; errorResponse: null }
  | { user: null; errorResponse: NextResponse }
> {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { error: unauthorizedMessage },
        { status: user ? 403 : 401 }
      ),
    };
  }
  return { user, errorResponse: null };
}

/**
 * Attach signed JWT session cookie with strict security flags
 */
export function attachSessionCookie(
  response: NextResponse,
  token: string
): NextResponse {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: env.isProd,
    sameSite: "lax",
    path: "/",
    maxAge: SEVEN_DAYS_IN_SECONDS,
  });
  return response;
}

/**
 * Clear session cookie on logout
 */
export function clearSessionCookie(response: NextResponse): NextResponse {
  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}

/**
 * Resolve public origin URL from reverse-proxy headers or request URL
 */
export function getRequestOrigin(request: Request): string {
  const requestUrl = new URL(request.url);
  const host =
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    requestUrl.host;
  const proto =
    request.headers.get("x-forwarded-proto") ||
    requestUrl.protocol.replace(":", "");
  return `${proto}://${host}` || env.app.url;
}
