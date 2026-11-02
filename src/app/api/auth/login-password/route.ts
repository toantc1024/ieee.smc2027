import { NextRequest } from "next/server";
import {
  getUserPasswordHash,
  verifyPassword,
  hashPassword,
  createSessionToken,
  recordLogin,
  extractClientInfo,
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

    const { ip, device } = extractClientInfo(req);

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    let userToSign;
    let userIdToTrack: string;
    let userSessionVersion = 1;

    if (!existingUser) {
      // User does not exist -> Automatically create account for them
      const newHash = hashPassword(password);
      const defaultName = name || email.split("@")[0].replace(/[._-]/g, " ");

      const created = await prisma.user.create({
        data: {
          email,
          name: defaultName,
          role: Role.USER,
          status: "ACTIVE",
          provider: "password",
          passwordHash: newHash,
          lastLoginAt: new Date(),
          lastLoginIp: ip,
          lastLoginDevice: device,
          sessionVersion: 1,
          profileData: {
            conferenceRole,
          },
        },
      });

      userIdToTrack = created.id;
      userSessionVersion = created.sessionVersion;
      userToSign = {
        id: created.id,
        email: created.email,
        name: created.name,
        avatar: created.avatar,
        role: created.role as "ADMIN" | "USER",
        status: created.status,
        provider: "password",
        sessionVersion: created.sessionVersion,
        profileData: (created.profileData as Record<string, unknown>) || {},
      };
    } else {
      if (existingUser.status === "BLOCKED") {
        return apiError("Your account has been blocked. Please contact the conference committee.", 403);
      }

      const storedHash =
        existingUser.passwordHash || (await getUserPasswordHash(email));

      if (!storedHash) {
        // User exists without password (e.g. earlier OTP sign-in) -> Link password via email
        const newHash = hashPassword(password);
        const updated = await prisma.user.update({
          where: { email },
          data: {
            passwordHash: newHash,
            provider: "password",
            ...(name && !existingUser.name ? { name } : {}),
          },
        });

        userIdToTrack = updated.id;
        userSessionVersion = updated.sessionVersion;
        userToSign = {
          id: updated.id,
          email: updated.email,
          name: updated.name,
          avatar: updated.avatar,
          role: updated.role as "ADMIN" | "USER",
          status: updated.status,
          provider: updated.provider,
          sessionVersion: updated.sessionVersion,
          profileData: (updated.profileData as Record<string, unknown>) || {},
        };
      } else {
        if (!verifyPassword(password, storedHash)) {
          return apiError("Incorrect password. Please verify or use Email Code.", 401);
        }

        userIdToTrack = existingUser.id;
        userSessionVersion = existingUser.sessionVersion;
        userToSign = {
          id: existingUser.id,
          email: existingUser.email,
          name: existingUser.name,
          avatar: existingUser.avatar,
          role: existingUser.role as "ADMIN" | "USER",
          status: existingUser.status,
          provider: existingUser.provider,
          sessionVersion: existingUser.sessionVersion,
          profileData: (existingUser.profileData as Record<string, unknown>) || {},
        };
      }

      // Record login tracking in DB
      await recordLogin(userIdToTrack, ip, device);
    }

    const token = await createSessionToken({
      ...userToSign,
      sessionVersion: userSessionVersion,
    });

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

