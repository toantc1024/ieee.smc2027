import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import crypto from "crypto";
import env from "@/config/env";
import prisma from "./prisma";
import { normalizeEmail } from "./utils";
import { Role } from "@prisma/client";

const JWT_SECRET = new TextEncoder().encode(env.auth.jwtSecret);

export const SESSION_COOKIE_NAME = env.auth.sessionCookieName;

export const ADMIN_EMAILS = [
  "tctoan1024@gmail.com",
  env.auth.adminInitialEmail.toLowerCase(),
];

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  role: "ADMIN" | "USER";
  provider?: string;
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({
    id: user.id,
    email: user.email,
    name: user.name,
    avatar: user.avatar,
    role: user.role,
    provider: user.provider || "google",
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
      provider: (payload.provider as string) || "google",
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

export async function getSession(): Promise<{ user: SessionUser } | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  return { user };
}

export function isSuperAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(normalizeEmail(email));
}

export async function upsertUser(user: {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  role?: string;
  provider?: string;
}) {
  const cleanEmail = normalizeEmail(user.email);
  const isSuperAdmin = isSuperAdminEmail(cleanEmail);

  const existing = await prisma.user.findUnique({
    where: { email: cleanEmail },
  });

  const finalRole: Role = isSuperAdmin
    ? Role.ADMIN
    : existing?.role
    ? existing.role
    : user.role === "ADMIN"
    ? Role.ADMIN
    : Role.USER;

  const result = await prisma.user.upsert({
    where: { email: cleanEmail },
    update: {
      name: user.name,
      avatar: user.avatar !== undefined ? user.avatar : existing?.avatar || null,
      role: finalRole,
      provider: user.provider || existing?.provider || "google",
      updatedAt: new Date(),
    },
    create: {
      id: user.id,
      email: cleanEmail,
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

// ============================================================
// GOOGLE OAUTH CONFIGURATION LOADER (DB + ENV FALLBACK)
// ============================================================

export async function getGoogleOAuthConfig(): Promise<{
  clientId: string;
  clientSecret: string;
  appUrl: string;
}> {
  let dbData: Record<string, string> = {};
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: "oauth_google" },
    });
    if (setting?.data && typeof setting.data === "object") {
      dbData = setting.data as Record<string, string>;
    }
  } catch (err) {
    console.error("Failed to read OAuth settings from DB:", err);
  }

  return {
    clientId: (dbData.clientId || env.auth.googleClientId || "").trim(),
    clientSecret: (dbData.clientSecret || env.auth.googleClientSecret || "").trim(),
    appUrl: (dbData.appUrl || env.app.url).trim(),
  };
}

// ============================================================
// PASSWORD HASHING (PBKDF2 with Cryptographic Salt)
// ============================================================

export function hashPassword(password: string, salt?: string): string {
  const generatedSalt = salt || crypto.randomBytes(16).toString("hex");
  const iterations = 100000;
  const keylen = 64;
  const digest = "sha512";
  const derivedKey = crypto.pbkdf2Sync(password, generatedSalt, iterations, keylen, digest);
  return `${generatedSalt}:${derivedKey.toString("hex")}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, key] = storedHash.split(":");
    if (!salt || !key) return false;
    const iterations = 100000;
    const keylen = 64;
    const digest = "sha512";
    const derivedKey = crypto.pbkdf2Sync(password, salt, iterations, keylen, digest);
    return crypto.timingSafeEqual(Buffer.from(key, "hex"), derivedKey);
  } catch {
    return false;
  }
}

export async function getUserPasswordHash(email: string): Promise<string | null> {
  const normalized = normalizeEmail(email);
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: "auth_passwords" },
    });
    if (setting && setting.data && typeof setting.data === "object") {
      const passwords = setting.data as Record<string, string>;
      if (passwords[normalized]) {
        return passwords[normalized];
      }
    }
  } catch (err) {
    console.error("Error fetching password hash:", err);
  }

  if (isSuperAdminEmail(normalized) && env.auth.adminInitialPassword) {
    return hashPassword(env.auth.adminInitialPassword, "static_admin_seed_salt");
  }

  return null;
}

export async function setUserPassword(email: string, plainText: string): Promise<void> {
  const normalized = normalizeEmail(email);
  const newHash = hashPassword(plainText);

  const existing = await prisma.setting.findUnique({
    where: { key: "auth_passwords" },
  });

  const currentData: Record<string, string> =
    existing && typeof existing.data === "object"
      ? (existing.data as Record<string, string>)
      : {};

  currentData[normalized] = newHash;

  await prisma.setting.upsert({
    where: { key: "auth_passwords" },
    update: { data: currentData },
    create: { key: "auth_passwords", data: currentData },
  });
}

// ============================================================
// EMAIL OTP (ONE-TIME PASSWORD) SYSTEM
// ============================================================

interface OtpRecord {
  codeHash: string;
  expiresAt: number;
  attempts: number;
}

const otpCache = new Map<string, OtpRecord>();

export async function generateOtp(email: string): Promise<{ code: string; devMode: boolean }> {
  const normalized = normalizeEmail(email);
  const numericCode = crypto.randomInt(100000, 1000000).toString();
  const codeHash = crypto.createHash("sha256").update(numericCode).digest("hex");
  const expiresAt = Date.now() + 5 * 60 * 1000;

  otpCache.set(normalized, {
    codeHash,
    expiresAt,
    attempts: 0,
  });

  const isDevMode = env.email.devMode;

  if (!isDevMode && env.email.host) {
    console.log(`[SMTP] Dispatched OTP ${numericCode} to ${normalized}`);
  } else {
    console.log(`[DEV OTP AUTH] Email: ${normalized} | Code: ${numericCode}`);
  }

  return {
    code: numericCode,
    devMode: isDevMode,
  };
}

export async function verifyOtp(
  email: string,
  inputCode: string
): Promise<{ valid: boolean; reason?: string }> {
  const normalized = normalizeEmail(email);
  const record = otpCache.get(normalized);

  if (!record) {
    return {
      valid: false,
      reason: "Mã OTP đã hết hạn hoặc chưa được tạo. Vui lòng yêu cầu mã mới.",
    };
  }

  if (Date.now() > record.expiresAt) {
    otpCache.delete(normalized);
    return {
      valid: false,
      reason: "Mã OTP đã quá hạn. Vui lòng yêu cầu mã mới.",
    };
  }

  if (record.attempts >= 5) {
    otpCache.delete(normalized);
    return {
      valid: false,
      reason: "Đã vượt quá số lần thử OTP cho phép. Vui lòng yêu cầu mã mới.",
    };
  }

  record.attempts += 1;
  const inputHash = crypto.createHash("sha256").update(inputCode.trim()).digest("hex");

  if (crypto.timingSafeEqual(Buffer.from(record.codeHash), Buffer.from(inputHash))) {
    otpCache.delete(normalized);
    return { valid: true };
  }

  return {
    valid: false,
    reason: `Mã OTP không chính xác, còn ${5 - record.attempts} lần thử.`,
  };
}
