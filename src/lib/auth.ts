import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import prisma from "./prisma";
import { Role } from "@prisma/client";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "ieee_smc_2027_ultra_secure_jwt_secret_key_92837482"
);

export const SESSION_COOKIE_NAME = "admin_session";

export const ADMIN_EMAILS = [
  "tctoan1024@gmail.com",
  "admin@hcmute.edu.vn",
];

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  role: "ADMIN" | "USER";
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({
    id: user.id,
    email: user.email,
    name: user.name,
    avatar: user.avatar,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      id: payload.id as string,
      email: payload.email as string,
      name: payload.name as string,
      avatar: (payload.avatar as string) || null,
      role: (payload.role as "ADMIN" | "USER") || "USER",
    };
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}

export async function upsertUser(user: {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  role?: string;
  provider?: string;
}) {
  const isSuperAdmin = ADMIN_EMAILS.includes(user.email.toLowerCase());
  
  const existing = await prisma.user.findUnique({
    where: { email: user.email },
  });

  const finalRole: Role = isSuperAdmin
    ? Role.ADMIN
    : existing?.role
    ? existing.role
    : user.role === "ADMIN"
    ? Role.ADMIN
    : Role.USER;

  const result = await prisma.user.upsert({
    where: { email: user.email },
    update: {
      name: user.name,
      avatar: user.avatar !== undefined ? user.avatar : existing?.avatar || null,
      role: finalRole,
      updatedAt: new Date(),
    },
    create: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar || null,
      role: finalRole,
      provider: user.provider || "google",
    },
  });

  return {
    id: result.id,
    email: result.email,
    name: result.name,
    avatar: result.avatar,
    role: result.role as "ADMIN" | "USER",
    provider: result.provider,
    created_at: result.createdAt.toISOString(),
    updated_at: result.updatedAt.toISOString(),
  };
}
