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
import { Role } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = normalizeEmail(body?.email);
    const password = body?.password?.trim();
    const name = body?.name?.trim();
    const conferenceRole = body?.conferenceRole || "SUBMITTER";

    if (!email || !password) {
      return apiError("Please enter both Email and Password", 400);
    }

    if (password.length < 6) {
      return apiError("Password must be at least 6 characters long", 400);
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    let userToSign;

    if (!existingUser) {
      // User does not exist -> Automatically create account for them
      const newHash = hashPassword(password);
      const defaultName = name || email.split("@")[0].replace(/[._-]/g, " ");

      const created = await prisma.user.create({
        data: {
          email,
          name: defaultName,
          role: Role.USER,
          provider: "email",
          passwordHash: newHash,
          profileData: {
            conferenceRole,
          },
        },
      });

      userToSign = {
        id: created.id,
        email: created.email,
        name: created.name,
        avatar: created.avatar,
        role: created.role as "ADMIN" | "USER",
        provider: "email",
        profileData: (created.profileData as Record<string, unknown>) || {},
      };
    } else {
      const storedHash =
        existingUser.passwordHash || (await getUserPasswordHash(email));

      if (!storedHash) {
        // User exists without password (e.g. earlier OTP sign-in) -> Link password via email
        const newHash = hashPassword(password);
        const updated = await prisma.user.update({
          where: { email },
          data: {
            passwordHash: newHash,
            provider: "email",
            ...(name && !existingUser.name ? { name } : {}),
          },
        });

        userToSign = {
          id: updated.id,
          email: updated.email,
          name: updated.name,
          avatar: updated.avatar,
          role: updated.role as "ADMIN" | "USER",
          provider: "email",
          profileData: (updated.profileData as Record<string, unknown>) || {},
        };
      } else {
        if (!verifyPassword(password, storedHash)) {
          return apiError("Incorrect password. Please verify or use Email Code.", 401);
        }

        userToSign = {
          id: existingUser.id,
          email: existingUser.email,
          name: existingUser.name,
          avatar: existingUser.avatar,
          role: existingUser.role as "ADMIN" | "USER",
          provider: "email",
          profileData: (existingUser.profileData as Record<string, unknown>) || {},
        };
      }
    }

    const token = await createSessionToken(userToSign);
    const response = apiSuccess({
      message: "Signed in successfully",
      user: userToSign,
      redirectTo: userToSign.role === "ADMIN" ? "/admin" : "/portal",
    });

    return attachSessionCookie(response, token);
  } catch (err) {
    console.error("Password login error:", err);
    return apiError(err, 500, "Error processing password sign-in");
  }
}
