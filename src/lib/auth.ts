import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { sql, type UserRecord } from "./db";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "ieee_smc_2027_ultra_secure_jwt_secret_key_92837482"
);

export const SESSION_COOKIE_NAME = "admin_session";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  role: string;
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
      role: (payload.role as string) || "ADMIN",
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
}): Promise<UserRecord> {
  const role = user.role || "ADMIN";
  const provider = user.provider || "google";

  const rows = await sql`
    INSERT INTO users (id, email, name, avatar, role, provider, updated_at)
    VALUES (${user.id}, ${user.email}, ${user.name}, ${user.avatar || null}, ${role}, ${provider}, CURRENT_TIMESTAMP)
    ON CONFLICT (email) DO UPDATE SET
      name = EXCLUDED.name,
      avatar = EXCLUDED.avatar,
      updated_at = CURRENT_TIMESTAMP
    RETURNING id, email, name, avatar, role, provider, created_at, updated_at;
  `;
  return rows[0] as UserRecord;
}
