import { NextResponse } from "next/server";
import { getCurrentUser, ADMIN_EMAILS } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { email, name, role = "USER" } = body;

    if (!email || !name) {
      return NextResponse.json(
        { error: "Email và tên người dùng là bắt buộc" },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const targetRole =
      cleanEmail === "tctoan1024@gmail.com" || role === "ADMIN"
        ? Role.ADMIN
        : Role.USER;

    const newUser = await prisma.user.upsert({
      where: { email: cleanEmail },
      update: {
        name: name.trim(),
        role: targetRole,
        updatedAt: new Date(),
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

    return NextResponse.json({ success: true, user: newUser });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("Error creating user:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
