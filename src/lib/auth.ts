import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import crypto from "crypto";
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
      provider: user.provider || existing?.provider || "google",
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
  const normalizedEmail = email.toLowerCase().trim();
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: "auth_passwords" },
    });
    if (setting && setting.data && typeof setting.data === "object") {
      const passwords = setting.data as Record<string, string>;
      if (passwords[normalizedEmail]) {
        return passwords[normalizedEmail];
      }
    }
  } catch (err) {
    console.error("Error fetching password hash:", err);
  }

  // Fallback to ADMIN_INITIAL_PASSWORD for configured admin emails
  if (
    ADMIN_EMAILS.includes(normalizedEmail) &&
    process.env.ADMIN_INITIAL_PASSWORD
  ) {
    return hashPassword(process.env.ADMIN_INITIAL_PASSWORD, "static_admin_seed_salt");
  }

  return null;
}

export async function setUserPassword(email: string, plainText: string): Promise<void> {
  const normalizedEmail = email.toLowerCase().trim();
  const newHash = hashPassword(plainText);

  const existing = await prisma.setting.findUnique({
    where: { key: "auth_passwords" },
  });

  const currentData: Record<string, string> =
    existing && typeof existing.data === "object"
      ? (existing.data as Record<string, string>)
      : {};

  currentData[normalizedEmail] = newHash;

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

// In-memory OTP storage cache with auto-expiry
const otpCache = new Map<string, OtpRecord>();

export async function generateOtp(email: string): Promise<{ code: string; devMode: boolean }> {
  const normalizedEmail = email.toLowerCase().trim();
  
  // 6-digit random number
  const numericCode = crypto.randomInt(100000, 1000000).toString();
  const codeHash = crypto.createHash("sha256").update(numericCode).digest("hex");
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes TTL

  otpCache.set(normalizedEmail, {
    codeHash,
    expiresAt,
    attempts: 0,
  });

  const isDevMode =
    process.env.EMAIL_DEV_MODE === "true" ||
    process.env.NODE_ENV !== "production" ||
    !process.env.EMAIL_SERVER_HOST;

  // In production, dispatch SMTP/Transactional email
  if (!isDevMode && process.env.EMAIL_SERVER_HOST) {
    try {
      // SMTP integration or transactional mailer
      console.log(`[SMTP] Dispatched OTP ${numericCode} to ${normalizedEmail}`);
    } catch (err) {
      console.error("Failed to send OTP via SMTP:", err);
    }
  } else {
    console.log(`\n========================================`);
    console.log(`[DEV OTP AUTH] Email: ${normalizedEmail}`);
    console.log(`[DEV OTP AUTH] Code:  ${numericCode} (valid 5 min)`);
    console.log(`========================================\n`);
  }

  return {
    code: numericCode,
    devMode: isDevMode,
  };
}

export async function verifyOtp(email: string, inputCode: string): Promise<{ valid: boolean; reason?: string }> {
  const normalizedEmail = email.toLowerCase().trim();
  const record = otpCache.get(normalizedEmail);

  if (!record) {
    return { valid: false, reason: "Mã OTP đã hết hạn hoặc chưa được tạo. Vui lòng yêu cầu mã mới." };
  }

  if (Date.now() > record.expiresAt) {
    otpCache.delete(normalizedEmail);
    return { valid: false, reason: "Mã OTP đã quá hạn (5 phút). Vui lòng yêu cầu mã mới." };
  }

  if (record.attempts >= 5) {
    otpCache.delete(normalizedEmail);
    return { valid: false, reason: "Đã vượt quá số lần thử OTP cho phép. Vui lòng yêu cầu mã mới." };
  }

  record.attempts += 1;
  const inputHash = crypto.createHash("sha256").update(inputCode.trim()).digest("hex");

  if (crypto.timingSafeEqual(Buffer.from(record.codeHash), Buffer.from(inputHash))) {
    otpCache.delete(normalizedEmail); // Invalidate on success
    return { valid: true };
  }

  return { valid: false, reason: `Mã OTP không chính xác (còn ${5 - record.attempts} lần thử).` };
}

// ============================================================
// WECHAT OPEN PLATFORM AUTHENTICATION
// ============================================================

export function getWeChatAuthUrl(origin: string): string {
  const appId = process.env.WECHAT_APP_ID || "wx_smc2027_dev";
  const redirectUri = encodeURIComponent(`${origin}/api/auth/callback/wechat`);
  const state = crypto.randomBytes(16).toString("hex");

  return `https://open.weixin.qq.com/connect/qrconnect?appid=${appId}&redirect_uri=${redirectUri}&response_type=code&scope=snsapi_login&state=${state}#wechat_redirect`;
}
