import { NextRequest } from "next/server";
import {
  prisma,
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

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        sessionVersion: { increment: 1 },
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
      message: "All active sessions for this user have been revoked",
      user: updatedUser,
      sessionVersion: updatedUser.sessionVersion,
    });
  } catch (error: unknown) {
    console.error("Error revoking user sessions:", error);
    return apiError(error, 500);
  }
}
