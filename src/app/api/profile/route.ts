import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import {
  getCurrentUser,
  prisma,
  hashPassword,
  verifyPassword,
  apiSuccess,
  apiError,
} from "@/lib";
import { registrationService } from "@/services";

export async function GET() {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) {
      return apiError("Authentication required", 401);
    }

    const dbUser = await prisma.user.findFirst({
      where: {
        OR: [
          { id: sessionUser.id },
          { email: sessionUser.email },
        ],
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        status: true,
        provider: true,
        lastLoginAt: true,
        lastLoginIp: true,
        lastLoginDevice: true,
        profileData: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!dbUser) {
      return apiError("User account not found", 404);
    }

    const registrations = await registrationService.getByUser(dbUser.id, dbUser.email);

    return apiSuccess({
      user: dbUser,
      registrations,
    });
  } catch (error: unknown) {
    console.error("Error loading profile:", error);
    return apiError(error, 500, "Failed to load delegate profile");
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) {
      return apiError("Authentication required", 401);
    }

    const body = await request.json();
    const {
      name,
      avatar,
      affiliation,
      country,
      title,
      bio,
      phone,
      academicInfo,
      conferenceRole,
      profileData,
      currentPassword,
      newPassword,
    } = body;

    const current = await prisma.user.findFirst({
      where: {
        OR: [
          { id: sessionUser.id },
          { email: sessionUser.email },
        ],
      },
    });

    if (!current) {
      return apiError("User account not found", 404);
    }

    // Optional password update
    let updatedPasswordHash: string | undefined;
    if (newPassword) {
      if (!currentPassword) {
        return apiError("Current password is required to change password", 400);
      }
      if (!current.passwordHash || !verifyPassword(currentPassword, current.passwordHash)) {
        return apiError("Current password is incorrect", 400);
      }
      if (typeof newPassword !== "string" || newPassword.trim().length < 6) {
        return apiError("New password must be at least 6 characters long", 400);
      }
      updatedPasswordHash = hashPassword(newPassword.trim());
    }

    const currentProfile =
      current.profileData && typeof current.profileData === "object"
        ? (current.profileData as Record<string, unknown>)
        : {};

    const mergedProfileData = {
      ...currentProfile,
      ...(affiliation !== undefined ? { affiliation } : {}),
      ...(country !== undefined ? { country } : {}),
      ...(title !== undefined ? { title } : {}),
      ...(bio !== undefined ? { bio } : {}),
      ...(phone !== undefined ? { phone } : {}),
      ...(academicInfo !== undefined ? { academicInfo } : {}),
      ...(conferenceRole !== undefined ? { conferenceRole } : {}),
      ...(profileData && typeof profileData === "object" ? profileData : {}),
    } as Prisma.InputJsonValue;

    const updatedUser = await prisma.user.update({
      where: { id: current.id },
      data: {
        ...(typeof name === "string" && name.trim() ? { name: name.trim() } : {}),
        ...(avatar !== undefined ? { avatar } : {}),
        ...(updatedPasswordHash ? { passwordHash: updatedPasswordHash } : {}),
        profileData: mergedProfileData,
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        status: true,
        provider: true,
        lastLoginAt: true,
        lastLoginIp: true,
        lastLoginDevice: true,
        profileData: true,
        updatedAt: true,
      },
    });

    return apiSuccess({
      user: updatedUser,
    });
  } catch (error: unknown) {
    console.error("Error updating profile:", error);
    return apiError(error, 500, "Failed to update delegate profile");
  }
}
