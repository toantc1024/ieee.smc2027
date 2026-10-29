import { NextResponse } from "next/server";
import { Role, Prisma } from "@prisma/client";
import {
  prisma,
  normalizeEmail,
  ensureDatabaseAdmins,
  hashPassword,
  requireAdminRequest,
  apiSuccess,
  apiError,
} from "@/lib";

export async function GET() {
  const { errorResponse } = await requireAdminRequest();
  if (errorResponse) return errorResponse;

  try {
    await ensureDatabaseAdmins();

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "asc" },
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
        _count: {
          select: {
            posts: true,
            registrations: true,
          },
        },
      },
    });

    return apiSuccess({ users });
  } catch (error: unknown) {
    console.error("Error fetching users:", error);
    return apiError(error, 500);
  }
}

export async function POST(request: Request) {
  const { errorResponse } = await requireAdminRequest();
  if (errorResponse) return errorResponse;

  try {
    await ensureDatabaseAdmins();
    const body = await request.json();
    const {
      email,
      name,
      role = "USER",
      avatar,
      password,
      profileData,
    } = body;

    if (!email || !name) {
      return apiError("Email and full name are required", 400);
    }

    const cleanEmail = normalizeEmail(email);
    const targetRole = role === "ADMIN" ? Role.ADMIN : Role.USER;
    const passwordHash =
      typeof password === "string" && password.trim()
        ? hashPassword(password.trim())
        : undefined;

    const cleanProfileData: Prisma.InputJsonValue =
      profileData && typeof profileData === "object" ? profileData : {};

    const newUser = await prisma.user.upsert({
      where: { email: cleanEmail },
      update: {
        name: name.trim(),
        role: targetRole,
        ...(avatar !== undefined ? { avatar } : {}),
        ...(passwordHash ? { passwordHash } : {}),
        ...(profileData && typeof profileData === "object"
          ? { profileData: cleanProfileData }
          : {}),
      },
      create: {
        email: cleanEmail,
        name: name.trim(),
        avatar: avatar || null,
        role: targetRole,
        provider: passwordHash ? "password" : "email_link",
        passwordHash: passwordHash || null,
        profileData: cleanProfileData,
      },
    });

    return apiSuccess({ user: newUser });
  } catch (error: unknown) {
    console.error("Error creating user:", error);
    return apiError(error, 500);
  }
}
