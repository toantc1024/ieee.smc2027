import { NextRequest } from "next/server";
import {
  getUserPasswordHash,
  verifyPassword,
  upsertUser,
  createSessionToken,
  normalizeEmail,
  attachSessionCookie,
  apiSuccess,
  apiError,
} from "@/lib";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = normalizeEmail(body?.email);
    const password = body?.password;

    if (!email || !password) {
      return apiError("Please enter both Email and Password", 400);
    }

    const storedHash = await getUserPasswordHash(email);
    if (!storedHash) {
      return apiError("Account does not exist or password has not been configured", 401);
    }

    if (!verifyPassword(password, storedHash)) {
      return apiError("Incorrect password", 401);
    }

    const name = email.split("@")[0].toUpperCase();
    const user = await upsertUser({
      id: `pwd_${Date.now()}`,
      email,
      name: `Admin ${name}`,
      provider: "password",
      role: "ADMIN",
    });

    const token = await createSessionToken(user);
    const response = apiSuccess({
      message: "Signed in with password successfully",
      user,
    });

    return attachSessionCookie(response, token);
  } catch (err) {
    console.error("Password login error:", err);
    return apiError(err, 500, "Error processing password sign-in");
  }
}
