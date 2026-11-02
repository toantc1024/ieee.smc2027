import { NextRequest } from "next/server";
import {
  getUserPasswordHash,
  verifyPassword,
  hashPassword,
  createSessionToken,
  normalizeEmail,
  attachSessionCookie,
  apiSuccess,
  apiError,
  prisma,
} from "@/lib";
import { Role, Prisma } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = normalizeEmail(body?.email);
    const password = body?.password?.trim();
    const name = body?.name?.trim();
    const conferenceRole = body?.conferenceRole || "SUBMITTER"; // SPEAKER, SUBMITTER, ATTENDEE
    const affiliation = body?.affiliation?.trim() || "";

    if (!email || !email.includes("@")) {
      return apiError("Please provide a valid email address", 400);
    }

    if (!password || password.length < 6) {
      return apiError("Password must be at least 6 characters long", 400);
    }

    const defaultName = name || email.split("@")[0].replace(/[._-]/g, " ");

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    let targetUser;

    if (existingUser) {
      const storedHash =
        existingUser.passwordHash || (await getUserPasswordHash(email));

      if (storedHash) {
        if (!verifyPassword(password, storedHash)) {
          return apiError(
            "An account with this email already exists. Please sign in with your password.",
            409
          );
        }
      }

      // If existing user has no password or password matched, update profile and link password
      const newHash = storedHash || hashPassword(password);
      const existingProfile =
        existingUser.profileData && typeof existingUser.profileData === "object"
          ? (existingUser.profileData as Record<string, unknown>)
          : {};

      const updated = await prisma.user.update({
        where: { email },
        data: {
          name: defaultName,
          passwordHash: newHash,
          profileData: {
            ...existingProfile,
            conferenceRole,
            ...(affiliation ? { affiliation } : {}),
          } as Prisma.InputJsonValue,
        },
      });

      targetUser = {
        id: updated.id,
        email: updated.email,
        name: updated.name,
        avatar: updated.avatar,
        role: updated.role as "ADMIN" | "USER",
        provider: "email",
        profileData: (updated.profileData as Record<string, unknown>) || {},
      };
    } else {
      // New account creation
      const passwordHash = hashPassword(password);
      const created = await prisma.user.create({
        data: {
          email,
          name: defaultName,
          role: Role.USER,
          provider: "email",
          passwordHash,
          profileData: {
            conferenceRole,
            ...(affiliation ? { affiliation } : {}),
          },
        },
      });

      targetUser = {
        id: created.id,
        email: created.email,
        name: created.name,
        avatar: created.avatar,
        role: created.role as "ADMIN" | "USER",
        provider: "email",
        profileData: (created.profileData as Record<string, unknown>) || {},
      };
    }

    const token = await createSessionToken(targetUser);
    const response = apiSuccess({
      message: "Account created and signed in successfully",
      user: targetUser,
      redirectTo: targetUser.role === "ADMIN" ? "/admin" : "/portal",
    });

    return attachSessionCookie(response, token);
  } catch (err) {
    console.error("User registration error:", err);
    return apiError(err, 500, "Error creating account");
  }
}
