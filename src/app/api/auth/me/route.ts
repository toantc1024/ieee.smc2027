import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, upsertUser, createSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";
import { attachSessionCookie, clearSessionCookie, apiError, apiSuccess } from "@/lib/api-helper";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
};

export async function GET(request: NextRequest) {
  const hasCookie = Boolean(request.cookies.get(SESSION_COOKIE_NAME)?.value);
  const user = await getCurrentUser();

  if (!user) {
    const res = NextResponse.json(
      { user: null, sessionExpired: hasCookie },
      { headers: NO_STORE_HEADERS }
    );
    if (hasCookie) {
      clearSessionCookie(res);
    }
    return res;
  }

  return NextResponse.json({ user, sessionExpired: false }, { headers: NO_STORE_HEADERS });
}

export async function PATCH(request: NextRequest) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    const res = apiError("Authentication required", 401);
    return clearSessionCookie(res);
  }

  try {
    const body = await request.json();
    const { name, avatar, profileData } = body;

    const updatedUser = await upsertUser({
      email: currentUser.email,
      name: typeof name === "string" && name.trim() ? name.trim() : currentUser.name,
      avatar: avatar !== undefined ? avatar : currentUser.avatar,
      profileData:
        profileData && typeof profileData === "object"
          ? (profileData as Record<string, unknown>)
          : undefined,
    });

    const token = await createSessionToken(updatedUser);
    const response = apiSuccess({ user: updatedUser });
    return attachSessionCookie(response, token);
  } catch (err) {
    return apiError(err, 500, "Failed to update user profile");
  }
}
