import { Role, Prisma } from "@prisma/client";
import {
  prisma,
  hashPassword,
  requireAdminRequest,
  apiSuccess,
  apiError,
} from "@/lib";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user: currentAdmin, errorResponse } = await requireAdminRequest();
  if (errorResponse) return errorResponse;

  const { id } = await params;

  try {
    const body = await request.json();
    const { role, name, avatar, password, profileData } = body;

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return apiError("User not found", 404);
    }

    if (currentAdmin && currentAdmin.id === targetUser.id && role && role !== "ADMIN") {
      return apiError(
        "You cannot downgrade your own active administrator account",
        400
      );
    }

    if (targetUser.role === Role.ADMIN && role && role !== "ADMIN") {
      const totalAdmins = await prisma.user.count({
        where: { role: Role.ADMIN },
      });
      if (totalAdmins <= 1) {
        return apiError(
          "Cannot downgrade the last remaining ADMIN account in the database",
          400
        );
      }
    }

    const mergedProfileData =
      profileData && typeof profileData === "object"
        ? ({
            ...(targetUser.profileData && typeof targetUser.profileData === "object"
              ? (targetUser.profileData as Record<string, unknown>)
              : {}),
            ...(profileData as Record<string, unknown>),
          } as Prisma.InputJsonValue)
        : undefined;

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(role ? { role: role === "ADMIN" ? Role.ADMIN : Role.USER } : {}),
        ...(typeof name === "string" && name.trim() ? { name: name.trim() } : {}),
        ...(avatar !== undefined ? { avatar } : {}),
        ...(typeof password === "string" && password.trim()
          ? { passwordHash: hashPassword(password.trim()) }
          : {}),
        ...(mergedProfileData !== undefined ? { profileData: mergedProfileData } : {}),
      },
    });

    return apiSuccess({ user: updated });
  } catch (error: unknown) {
    console.error("Error updating user:", error);
    return apiError(error, 500);
  }
}

export async function DELETE(
  request: Request,
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

    if (currentAdmin && currentAdmin.id === targetUser.id) {
      return apiError("You cannot delete your own active administrator account", 400);
    }

    if (targetUser.role === Role.ADMIN) {
      const totalAdmins = await prisma.user.count({
        where: { role: Role.ADMIN },
      });
      if (totalAdmins <= 1) {
        return apiError(
          "Cannot delete the last remaining ADMIN account in the database",
          400
        );
      }
    }

    await prisma.user.delete({ where: { id } });
    return apiSuccess({});
  } catch (error: unknown) {
    console.error("Error deleting user:", error);
    return apiError(error, 500);
  }
}
