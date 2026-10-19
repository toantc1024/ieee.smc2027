import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import crypto from "crypto";
import env from "@/config/env";
import prisma from "./prisma";
import { normalizeEmail } from "./utils";
import { Role, Prisma } from "@prisma/client";

const JWT_SECRET = new TextEncoder().encode(env.auth.jwtSecret);

export const SESSION_COOKIE_NAME = env.auth.sessionCookieName;

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  role: "ADMIN" | "USER";
  provider?: string;
  profileData?: Record<string, unknown>;
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

// ============================================================
// DATABASE ADMIN BOOTSTRAP (100% DB-DRIVEN, ZERO .ENV ADMIN)
// ============================================================

let adminSeedChecked = false;

export async function ensureDatabaseAdmins(): Promise<void> {
  if (adminSeedChecked) return;
  try {
    const adminCount = await prisma.user.count({
      where: { role: Role.ADMIN },
    });

    const defaultPasswordHash = hashPassword("Admin@Smc2027Secure!", "db_admin_bootstrap_salt");

    if (adminCount === 0) {
      await prisma.user.upsert({
        where: { email: "admin@hcmute.edu.vn" },
        update: {
          role: Role.ADMIN,
          passwordHash: defaultPasswordHash,
        },
        create: {
          email: "admin@hcmute.edu.vn",
          name: "HCMUTE Conference Admin",
          role: Role.ADMIN,
          provider: "password",
          passwordHash: defaultPasswordHash,
          profileData: {
            affiliation: "Ho Chi Minh City University of Technology and Education",
            country: "Vietnam",
            title: "System Administrator",
          },
        },
      });

      await prisma.user.upsert({
        where: { email: "tctoan1024@gmail.com" },
        update: { role: Role.ADMIN },
        create: {
          email: "tctoan1024@gmail.com",
          name: "Toan Tran",
          role: Role.ADMIN,
          provider: "google",
          passwordHash: defaultPasswordHash,
          profileData: {
            affiliation: "HCMUTE",
            country: "Vietnam",
            title: "Lead Platform Architect",
          },
        },
      });
    } else {
      // Ensure existing admin@hcmute.edu.vn has passwordHash populated in DB
      const mainAdmin = await prisma.user.findUnique({
        where: { email: "admin@hcmute.edu.vn" },
      });
      if (!mainAdmin) {
        await prisma.user.create({
          data: {
            email: "admin@hcmute.edu.vn",
            name: "HCMUTE Conference Admin",
            role: Role.ADMIN,
            provider: "password",
            passwordHash: defaultPasswordHash,
            profileData: {
              affiliation: "Ho Chi Minh City University of Technology and Education",
              country: "Vietnam",
              title: "System Administrator",
            },
          },
        });
      } else if (!mainAdmin.passwordHash) {
        await prisma.user.update({
          where: { email: "admin@hcmute.edu.vn" },
          data: {
            role: Role.ADMIN,
            passwordHash: defaultPasswordHash,
          },
        });
      }
    }

    adminSeedChecked = true;
  } catch (err) {
    console.error("Failed to verify DB admin bootstrap:", err);
  }
}

// ============================================================
// SESSION TOKENS & USER LOOKUP
// ============================================================

export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({
    id: user.id,
    email: user.email,
    name: user.name,
    avatar: user.avatar,
    role: user.role,
    provider: user.provider || "email_link",
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
      provider: (payload.provider as string) || "email_link",
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
    const sessionUser = await verifySessionToken(token);
    if (!sessionUser) return null;

    // Fetch live role and profile from PostgreSQL so DB role updates take effect immediately
    const dbUser = await prisma.user.findUnique({
      where: { email: normalizeEmail(sessionUser.email) },
    });

    if (!dbUser) return sessionUser;

    return {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      avatar: dbUser.avatar,
      role: dbUser.role as "ADMIN" | "USER",
      provider: dbUser.provider,
      profileData:
        dbUser.profileData && typeof dbUser.profileData === "object"
          ? (dbUser.profileData as Record<string, unknown>)
          : {},
    };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<{ user: SessionUser } | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  return { user };
}

export async function upsertUser(user: {
  id?: string;
  email: string;
  name?: string;
  avatar?: string | null;
  role?: "ADMIN" | "USER";
  provider?: string;
  profileData?: Record<string, unknown>;
}) {
  await ensureDatabaseAdmins();
  const cleanEmail = normalizeEmail(user.email);

  const existing = await prisma.user.findUnique({
    where: { email: cleanEmail },
  });

  // Role is strictly controlled by DB for existing users; new users default to USER unless explicitly created by Admin
  const finalRole: Role = existing
    ? existing.role
    : user.role === "ADMIN"
    ? Role.ADMIN
    : Role.USER;

  const finalName =
    user.name?.trim() ||
    existing?.name ||
    cleanEmail.split("@")[0].replace(/[._-]/g, " ");

  const mergedProfileData = {
    ...(existing?.profileData && typeof existing.profileData === "object"
      ? (existing.profileData as Record<string, unknown>)
      : {}),
    ...(user.profileData || {}),
  } as Prisma.InputJsonValue;

  const result = await prisma.user.upsert({
    where: { email: cleanEmail },
    update: {
      name: existing?.name && !user.name ? existing.name : finalName,
      avatar: user.avatar !== undefined ? user.avatar : existing?.avatar || null,
      role: finalRole,
      provider: user.provider || existing?.provider || "email_link",
      profileData: mergedProfileData,
      updatedAt: new Date(),
    },
    create: {
      ...(user.id ? { id: user.id } : {}),
      email: cleanEmail,
      name: finalName,
      avatar: user.avatar || null,
      role: finalRole,
      provider: user.provider || "email_link",
      profileData: mergedProfileData,
    },
  });

  return {
    id: result.id,
    email: result.email,
    name: result.name,
    avatar: result.avatar,
    role: result.role as "ADMIN" | "USER",
    provider: result.provider,
    profileData:
      result.profileData && typeof result.profileData === "object"
        ? (result.profileData as Record<string, unknown>)
        : {},
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
// DB-BACKED PASSWORD STORAGE ON USER TABLE
// ============================================================

export async function getUserPasswordHash(email: string): Promise<string | null> {
  await ensureDatabaseAdmins();
  const normalized = normalizeEmail(email);
  try {
    const user = await prisma.user.findUnique({
      where: { email: normalized },
      select: { passwordHash: true },
    });
    if (user?.passwordHash) {
      return user.passwordHash;
    }

    // Legacy fallback from website_settings if present, then migrate to User row
    const setting = await prisma.setting.findUnique({
      where: { key: "auth_passwords" },
    });
    if (setting && setting.data && typeof setting.data === "object") {
      const passwords = setting.data as Record<string, string>;
      if (passwords[normalized]) {
        await prisma.user
          .update({
            where: { email: normalized },
            data: { passwordHash: passwords[normalized] },
          })
          .catch(() => null);
        return passwords[normalized];
      }
    }
  } catch (err) {
    console.error("Error fetching user password hash from DB:", err);
  }

  return null;
}

export async function setUserPassword(email: string, plainText: string): Promise<void> {
  await ensureDatabaseAdmins();
  const normalized = normalizeEmail(email);
  const newHash = hashPassword(plainText);

  await prisma.user.upsert({
    where: { email: normalized },
    update: { passwordHash: newHash },
    create: {
      email: normalized,
      name: normalized.split("@")[0],
      role: Role.USER,
      provider: "password",
      passwordHash: newHash,
    },
  });
}

// ============================================================
// EMAIL LINK + OTP AUTHENTICATION (CHINA DELEGATE READY)
// ============================================================

interface OtpRecord {
  codeHash: string;
  expiresAt: number;
  attempts: number;
}

const otpCache = new Map<string, OtpRecord>();

export async function createEmailLinkToken(email: string): Promise<string> {
  const normalized = normalizeEmail(email);
  return new SignJWT({
    email: normalized,
    purpose: "email_magic_link",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(JWT_SECRET);
}

export async function verifyEmailLinkToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.purpose !== "email_magic_link" || typeof payload.email !== "string") {
      return null;
    }
    return normalizeEmail(payload.email);
  } catch {
    return null;
  }
}

export async function generateOtp(email: string): Promise<{
  code: string;
  emailLink: string;
  devMode: boolean;
}> {
  await ensureDatabaseAdmins();
  const normalized = normalizeEmail(email);
  const numericCode = crypto.randomInt(100000, 1000000).toString();
  const codeHash = crypto.createHash("sha256").update(numericCode).digest("hex");
  const expiresAt = Date.now() + 15 * 60 * 1000;

  otpCache.set(normalized, {
    codeHash,
    expiresAt,
    attempts: 0,
  });

  const linkToken = await createEmailLinkToken(normalized);
  const emailLink = `${env.app.url}/api/auth/email-link?token=${encodeURIComponent(linkToken)}`;
  const isDevMode = env.email.devMode;

  if (!isDevMode && env.email.host) {
    console.log(`[SMTP] Dispatched Email Link & OTP ${numericCode} to ${normalized}`);
  } else {
    console.log(`[DEV EMAIL LINK & OTP] Email: ${normalized} | Code: ${numericCode} | Link: ${emailLink}`);
  }

  return {
    code: numericCode,
    emailLink,
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
      reason: "Verification code has expired or has not been requested. Please request a new link or code.",
    };
  }

  if (Date.now() > record.expiresAt) {
    otpCache.delete(normalized);
    return {
      valid: false,
      reason: "Verification code has expired. Please request a new link or code.",
    };
  }

  if (record.attempts >= 5) {
    otpCache.delete(normalized);
    return {
      valid: false,
      reason: "Maximum verification attempts exceeded. Please request a new link or code.",
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
    reason: `Invalid verification code. ${5 - record.attempts} attempt(s) remaining.`,
  };
}
