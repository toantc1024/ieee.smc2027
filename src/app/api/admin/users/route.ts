import { NextRequest } from "next/server";
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

export async function GET(request: NextRequest) {
  const { errorResponse } = await requireAdminRequest();
  if (errorResponse) return errorResponse;

  try {
    await ensureDatabaseAdmins();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || searchParams.get("q") || "";
    const status = searchParams.get("status") || "all";
    const role = searchParams.get("role") || "all";
    const conferenceRole = searchParams.get("conferenceRole") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    // Default to 100 if pagination limit not explicitly passed, to safely include newly created users in list calls
    const defaultLimit = searchParams.has("limit") || searchParams.has("size") ? 20 : 100;
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || searchParams.get("size") || String(defaultLimit), 10)));
    const sort = searchParams.get("sort") || "createdAt,desc";

    // Build dynamic where clause
    const where: Prisma.UserWhereInput = {};

    if (search.trim()) {
      const term = search.trim();
      where.OR = [
        { name: { contains: term, mode: "insensitive" } },
        { email: { contains: term, mode: "insensitive" } },
      ];
    }

    if (status && status !== "all") {
      where.status = status.toUpperCase();
    }

    if (role && role !== "all") {
      where.role = role.toUpperCase() === "ADMIN" ? Role.ADMIN : Role.USER;
    }

    if (conferenceRole && conferenceRole !== "all") {
      where.profileData = {
        path: ["conferenceRole"],
        string_contains: conferenceRole,
      };
    }

    // Dynamic sorting
    const [sortField, sortOrder] = sort.split(",");
    const validSortFields: Record<string, string> = {
      createdAt: "createdAt",
      name: "name",
      email: "email",
      lastLoginAt: "lastLoginAt",
      status: "status",
      role: "role",
    };
    const field = validSortFields[sortField] || "createdAt";
    const order: "asc" | "desc" = sortOrder === "asc" ? "asc" : "desc";
    const orderBy = { [field]: order };

    const skip = (page - 1) * limit;

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy,
        skip,
        take: limit,
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
            },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return apiSuccess({
      users,
      total,
      page,
      limit,
      totalPages,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error: unknown) {
    console.error("Error fetching users:", error);
    return apiError(error, 500);
  }
}

export async function POST(request: NextRequest) {
  const { errorResponse } = await requireAdminRequest();
  if (errorResponse) return errorResponse;

  try {
    await ensureDatabaseAdmins();
    const body = await request.json();
    const {
      email,
      name,
      role = "USER",
      status = "ACTIVE",
      avatar,
      password,
      conferenceRole,
      affiliation,
      profileData,
    } = body;

    if (!email || !name) {
      return apiError("Email and full name are required", 400);
    }

    const cleanEmail = normalizeEmail(email);
    const targetRole = role === "ADMIN" ? Role.ADMIN : Role.USER;
    const targetStatus = ["ACTIVE", "INACTIVE", "BLOCKED"].includes(status?.toUpperCase())
      ? status.toUpperCase()
      : "ACTIVE";

    let passwordHash: string | null = null;
    if (typeof password === "string" && password.trim()) {
      if (password.trim().length < 6) {
        return apiError("Password must be at least 6 characters long", 400);
      }
      passwordHash = hashPassword(password.trim());
    }

    const cleanProfileData: Record<string, unknown> = {
      ...(profileData && typeof profileData === "object" ? profileData : {}),
      ...(conferenceRole ? { conferenceRole } : {}),
      ...(affiliation ? { affiliation } : {}),
    };

    const newUser = await prisma.user.upsert({
      where: { email: cleanEmail },
      update: {
        name: name.trim(),
        role: targetRole,
        status: targetStatus,
        ...(avatar !== undefined ? { avatar } : {}),
        ...(passwordHash ? { passwordHash } : {}),
        profileData: cleanProfileData as Prisma.InputJsonValue,
      },
      create: {
        email: cleanEmail,
        name: name.trim(),
        avatar: avatar || null,
        role: targetRole,
        status: targetStatus,
        provider: passwordHash ? "password" : "email_link",
        passwordHash: passwordHash || null,
        profileData: cleanProfileData as Prisma.InputJsonValue,
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

    return apiSuccess({ user: newUser });
  } catch (error: unknown) {
    console.error("Error creating user:", error);
    return apiError(error, 500);
  }
}
