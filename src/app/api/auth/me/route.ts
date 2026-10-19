import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, upsertUser, createSessionToken } from "@/lib/auth";
import { attachSessionCookie, apiError, apiSuccess } from "@/lib/api-helper";

export async function GET() {
  const user = await getCurrentUser();
  return NextResponse.json({ user });
}

export async function PATCH(request: NextRequest) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return apiError("Authentication required", 401);
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
