import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import {
  prisma,
  normalizeEmail,
  isSuperAdminEmail,
  requireAdminRequest,
  apiSuccess,
  apiError,
} from "@/lib";

export async function GET() {
  const { errorResponse } = await requireAdminRequest();
  if (errorResponse) return errorResponse;

  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        provider: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { posts: true },
        },
      },
    });

    return NextResponse.json({ users });
  } catch (error: unknown) {
    console.error("Error fetching users:", error);
    return apiError(error, 500);
  }
}

export async function POST(request: Request) {
  const { errorResponse } = await requireAdminRequest();
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const { email, name, role = "USER" } = body;

    if (!email || !name) {
      return apiError("Email and user name are required", 400);
    }

    const cleanEmail = normalizeEmail(email);
    const targetRole =
      isSuperAdminEmail(cleanEmail) || role === "ADMIN" ? Role.ADMIN : Role.USER;

    const newUser = await prisma.user.upsert({
      where: { email: cleanEmail },
      update: {
        name: name.trim(),
        role: targetRole,
      },
      create: {
        id: `usr_${Date.now()}`,
        email: cleanEmail,
        name: name.trim(),
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanEmail)}`,
        role: targetRole,
        provider: "credentials",
      },
    });

    return apiSuccess({ user: newUser });
  } catch (error: unknown) {
    console.error("Error creating user:", error);
    return apiError(error, 500);
  }
}
