import { NextResponse } from "next/server";
import { getCurrentUser, clearSessionCookie, apiSuccess } from "@/lib";

export async function POST() {
  return clearSessionCookie(apiSuccess({}));
}

export async function GET() {
  const user = await getCurrentUser();
  return NextResponse.json({ user });
}
