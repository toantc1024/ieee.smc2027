import { NextRequest } from "next/server";
import { Role, Prisma } from "@prisma/client";
import {
  prisma,
  hashPassword,
  normalizeEmail,
  requireAdminRequest,
  apiSuccess,
  apiError,
} from "@/lib";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { errorResponse } = await requireAdminRequest();
  if (errorResponse) return errorResponse;

  const { id } = await params;

  try {
    const user = await prisma.user.findUnique({
      where: { id },
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
        sessionVersion: true,
        profileData: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            posts: true,
            registrations: true,
            mediaFiles: true,
          },
        },
        registrations: {
          take: 5,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            registrationCode: true,
            fullName: true,
            participantType: true,
            paymentStatus: true,
            feeAmount: true,
            createdAt: true,
          },
        },
        posts: {
          take: 5,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            slug: true,
            title: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      return apiError("User not found", 404);
    }

    return apiSuccess({ user });
  } catch (error: unknown) {
    console.error("Error fetching single user:", error);
    return apiError(error, 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user: currentAdmin, errorResponse } = await requireAdminRequest();
  if (errorResponse) return errorResponse;

  const { id } = await params;

  try {
    const body = await request.json();
    const {
      role,
      status,
      name,
      email,
      avatar,
      password,
      conferenceRole,
      affiliation,
      profileData,
    } = body;

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return apiError("User not found", 404);
    }

    // Safety Guard 1: Cannot demote own active admin account
    if (currentAdmin && currentAdmin.id === targetUser.id && role && role !== "ADMIN") {
      return apiError("You cannot downgrade your own active administrator account", 400);
    }

    // Safety Guard 2: Cannot block own active admin account
    if (currentAdmin && currentAdmin.id === targetUser.id && status && status === "BLOCKED") {
      return apiError("You cannot block your own active administrator account", 400);
    }

    // Safety Guard 3: Cannot demote or block the last remaining active ADMIN account in DB
    if (targetUser.role === Role.ADMIN && (role === "USER" || status === "BLOCKED")) {
      const totalAdmins = await prisma.user.count({
        where: { role: Role.ADMIN, status: "ACTIVE" },
      });
      if (totalAdmins <= 1) {
        return apiError("Cannot downgrade or block the last remaining active ADMIN account in the database", 400);
      }
    }

    // Email uniqueness check if email being changed
    if (email && normalizeEmail(email) !== targetUser.email) {
      const cleanEmail = normalizeEmail(email);
      const existingEmailUser = await prisma.user.findUnique({ where: { email: cleanEmail } });
      if (existingEmailUser) {
        return apiError("An account with this email address already exists", 409);
      }
    }

    // Password validation & hashing if provided
    let passwordHash: string | undefined;
    if (typeof password === "string" && password.trim()) {
      if (password.trim().length < 6) {
        return apiError("Password must be at least 6 characters long", 400);
      }
      passwordHash = hashPassword(password.trim());
    }

    // Merging profileData
    const currentProfile =
      targetUser.profileData && typeof targetUser.profileData === "object"
        ? (targetUser.profileData as Record<string, unknown>)
        : {};

    const mergedProfileData = {
      ...currentProfile,
      ...(conferenceRole ? { conferenceRole } : {}),
      ...(affiliation ? { affiliation } : {}),
      ...(profileData && typeof profileData === "object" ? profileData : {}),
    } as Prisma.InputJsonValue;

    // If blocking user, automatically bump sessionVersion to revoke existing sessions immediately
    const sessionVersionIncrement = status === "BLOCKED" ? { sessionVersion: { increment: 1 } } : {};

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(role ? { role: role === "ADMIN" ? Role.ADMIN : Role.USER } : {}),
        ...(status ? { status: status.toUpperCase() } : {}),
        ...(typeof name === "string" && name.trim() ? { name: name.trim() } : {}),
        ...(email ? { email: normalizeEmail(email) } : {}),
        ...(avatar !== undefined ? { avatar } : {}),
        ...(passwordHash ? { passwordHash } : {}),
        profileData: mergedProfileData,
        ...sessionVersionIncrement,
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
        sessionVersion: true,
        profileData: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return apiSuccess({ user: updated });
  } catch (error: unknown) {
    console.error("Error updating user:", error);
    return apiError(error, 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user: currentAdmin, errorResponse } = await requireAdminRequest();
  if (errorResponse) return errorResponse;

  const { id } = await params;

  try {
    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return apiError("User not found", 404);
    }

    // Safety Guard 1: Cannot delete own active admin account
    if (currentAdmin && currentAdmin.id === targetUser.id) {
      return apiError("You cannot delete your own active administrator account", 400);
    }

    // Safety Guard 2: Cannot delete the last remaining active ADMIN account
    if (targetUser.role === Role.ADMIN) {
      const totalAdmins = await prisma.user.count({
        where: { role: Role.ADMIN },
      });
      if (totalAdmins <= 1) {
        return apiError("Cannot delete the last remaining ADMIN account in the database", 400);
      }
    }

    await prisma.user.delete({ where: { id } });
    return apiSuccess({ message: "User deleted successfully", deletedId: id });
  } catch (error: unknown) {
    console.error("Error deleting user:", error);
    return apiError(error, 500);
  }
}
