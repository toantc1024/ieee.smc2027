import { NextResponse } from "next/server";
import { createSessionToken, upsertUser, SESSION_COOKIE_NAME } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = body.email || "admin@hcmute.edu.vn";
    const name = body.name || "HCMUTE Conference Administrator";

    const dbUser = await upsertUser({
      id: `dev_${email}`,
      email,
      name,
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=hcmute",
      role: "ADMIN",
      provider: "dev_mock",
    });

    const sessionToken = await createSessionToken({
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      avatar: dbUser.avatar,
      role: dbUser.role,
    });

    const response = NextResponse.json({ success: true, user: dbUser });
    response.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
