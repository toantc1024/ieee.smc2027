import { Role } from "@prisma/client";
import {
  prisma,
  isSuperAdminEmail,
  requireAdminRequest,
  apiSuccess,
  apiError,
} from "@/lib";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { errorResponse } = await requireAdminRequest();
  if (errorResponse) return errorResponse;

  const { id } = await params;

  try {
    const body = await request.json();
    const { role, name } = body;

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return apiError("User not found", 404);
    }

    if (isSuperAdminEmail(targetUser.email) && role && role !== "ADMIN") {
      return apiError("Cannot downgrade administrator role of primary super-admin account", 400);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(role ? { role: role === "ADMIN" ? Role.ADMIN : Role.USER } : {}),
        ...(name ? { name: name.trim() } : {}),
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
  const { errorResponse } = await requireAdminRequest();
  if (errorResponse) return errorResponse;

  const { id } = await params;

  try {
    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return apiError("User not found", 404);
    }

    if (isSuperAdminEmail(targetUser.email)) {
      return apiError("Cannot delete primary super-admin account", 400);
    }

    await prisma.user.delete({ where: { id } });
    return apiSuccess({});
  } catch (error: unknown) {
    console.error("Error deleting user:", error);
    return apiError(error, 500);
  }
}
