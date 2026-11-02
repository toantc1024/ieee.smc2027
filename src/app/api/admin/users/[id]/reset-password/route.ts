import { NextRequest } from "next/server";
import crypto from "crypto";
import {
  prisma,
  hashPassword,
  requireAdminRequest,
  apiSuccess,
  apiError,
} from "@/lib";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { errorResponse } = await requireAdminRequest();
  if (errorResponse) return errorResponse;

  const { id } = await params;

  try {
    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return apiError("User not found", 404);
    }

    const body = await request.json().catch(() => ({}));
    const { password, temporary = true } = body;

    let finalPassword = "";
    let isGenerated = false;

    if (typeof password === "string" && password.trim()) {
      if (password.trim().length < 6) {
        return apiError("Password must be at least 6 characters long", 400);
      }
      finalPassword = password.trim();
    } else {
      // Generate secure temporary password
      finalPassword = `Smc2027@${crypto.randomBytes(3).toString("hex")}`;
      isGenerated = true;
    }

    const newHash = hashPassword(finalPassword);

    const currentProfile =
      targetUser.profileData && typeof targetUser.profileData === "object"
        ? (targetUser.profileData as Record<string, unknown>)
        : {};

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        passwordHash: newHash,
        sessionVersion: { increment: 1 },
        profileData: {
          ...currentProfile,
          mustChangePassword: Boolean(temporary),
          lastPasswordResetAt: new Date().toISOString(),
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        sessionVersion: true,
        updatedAt: true,
      },
    });

    return apiSuccess({
      message: "Password reset successfully",
      user: updatedUser,
      ...(isGenerated ? { temporaryPassword: finalPassword } : {}),
    });
  } catch (error: unknown) {
    console.error("Error resetting user password:", error);
    return apiError(error, 500);
  }
}
