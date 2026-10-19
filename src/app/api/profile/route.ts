import { Prisma } from "@prisma/client";
import { getCurrentUser, prisma, apiSuccess, apiError } from "@/lib";
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
        provider: true,
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
    return apiError(error, 500, "Failed to load delegate profile");
  }
}

export async function PATCH(request: Request) {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) {
      return apiError("Authentication required", 401);
    }

    const body = await request.json();
    const { name, avatar, profileData } = body;

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

    const currentProfile =
      current.profileData && typeof current.profileData === "object"
        ? (current.profileData as Record<string, unknown>)
        : {};

    const mergedProfileData = {
      ...currentProfile,
      ...(profileData && typeof profileData === "object"
        ? (profileData as Record<string, unknown>)
        : {}),
    } as Prisma.InputJsonValue;

    const updatedUser = await prisma.user.update({
      where: { id: current.id },
      data: {
        ...(typeof name === "string" && name.trim() ? { name: name.trim() } : {}),
        ...(avatar !== undefined ? { avatar } : {}),
        profileData: mergedProfileData,
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        provider: true,
        profileData: true,
        updatedAt: true,
      },
    });

    return apiSuccess({
      user: updatedUser,
    });
  } catch (error: unknown) {
    return apiError(error, 500, "Failed to update delegate profile");
  }
}
