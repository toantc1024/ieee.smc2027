import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookie, apiSuccess } from "@/lib/api-helper";

function isBrowserNavigation(request: NextRequest): boolean {
  const accept = request.headers.get("accept") || "";
  const fetchMode = request.headers.get("sec-fetch-mode") || "";
  return fetchMode === "navigate" || accept.includes("text/html");
}

function handleLogout(request: NextRequest): NextResponse {
  if (isBrowserNavigation(request)) {
    const res = NextResponse.redirect(new URL("/admin/login", request.url), {
      status: 303,
    });
    return clearSessionCookie(res);
  }
  return clearSessionCookie(apiSuccess({}));
}

export async function POST(request: NextRequest) {
  return handleLogout(request);
}

export async function GET(request: NextRequest) {
  return handleLogout(request);
}
