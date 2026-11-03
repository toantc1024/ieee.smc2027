/**
 * Technical Specification & Concrete Code Proposals
 * Explorer M1-1: User Management Auth Tracking & API Handlers
 * 
 * Target Files:
 * 1. src/lib/auth.ts (recordLogin, extractClientInfo, sessionVersion token, getCurrentUser fix)
 * 2. src/app/api/auth/login-password/route.ts
 * 3. src/app/api/auth/otp/verify/route.ts
 * 4. src/app/api/auth/callback/google/route.ts
 * 5. src/app/api/admin/users/route.ts
 * 6. src/app/api/admin/users/[id]/route.ts
 * 7. src/app/api/admin/users/[id]/reset-password/route.ts
 * 8. src/app/api/admin/users/[id]/revoke-sessions/route.ts
 * 9. src/app/api/profile/route.ts
 */

import { NextRequest, NextResponse } from "next/server";
import { Role, Prisma } from "@prisma/client";

// ============================================================================
// PART 1: AUTH LOGIN TRACKING & SESSION REVOCATION (src/lib/auth.ts)
// ============================================================================

/**
 * 1.1 Type Signature Extensions in src/lib/auth.ts
 */
export interface SessionUserProposal {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  role: "ADMIN" | "USER";
  status?: string;
  provider?: string;
  sessionVersion?: number;
  profileData?: Record<string, unknown>;
}

/**
 * 1.2 Client IP and User-Agent Extractor Helper
 * Robust multi-proxy extraction supporting X-Forwarded-For, X-Real-IP, Cloudflare, Fastly, AWS ALB.
 */
export function extractClientInfoProposal(request: Request | NextRequest): {
  ip: string;
  device: string;
} {
  const headers = request.headers;

  // NextRequest might have ip property
  let ip = (request as NextRequest).ip;

  if (!ip) {
    const forwarded = headers.get("x-forwarded-for");
    if (forwarded) {
      ip = forwarded.split(",")[0].trim();
    }
  }

  if (!ip) {
    ip =
      headers.get("x-real-ip") ||
      headers.get("cf-connecting-ip") ||
      headers.get("true-client-ip") ||
      headers.get("fastly-client-ip") ||
      headers.get("x-client-ip") ||
      null;
  }

  if (!ip || ip === "::1" || ip === "::ffff:127.0.0.1") {
    ip = "127.0.0.1";
  }

  const rawUserAgent = headers.get("user-agent") || "Unknown Device";
  const device = rawUserAgent.length > 255 ? rawUserAgent.slice(0, 255) : rawUserAgent;

  return { ip, device };
}

/**
 * 1.3 recordLogin Helper in src/lib/auth.ts
 * Persists lastLoginAt, lastLoginIp, and lastLoginDevice without breaking login flow on error.
 */
export async function recordLoginProposal(
  userId: string,
  ip?: string | null,
  device?: string | null
): Promise<void> {
  try {
    // Uses prisma from src/lib/prisma
    // await prisma.user.update({
    //   where: { id: userId },
    //   data: {
    //     lastLoginAt: new Date(),
    //     ...(ip ? { lastLoginIp: ip } : {}),
    //     ...(device ? { lastLoginDevice: device } : {}),
    //   },
    // });
  } catch (error) {
    console.warn(`[auth] Failed to record login tracking for ${userId}:`, error);
  }
}

/**
 * 1.4 createSessionToken with sessionVersion in src/lib/auth.ts
 */
/*
export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({
    id: user.id,
    email: user.email,
    name: user.name,
    avatar: user.avatar,
    role: user.role,
    provider: user.provider || "email",
    sessionVersion: user.sessionVersion ?? 1,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}
*/

/**
 * 1.5 verifySessionToken with sessionVersion in src/lib/auth.ts
 */
/*
export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      id: payload.id as string,
      email: payload.email as string,
      name: payload.name as string,
      avatar: (payload.avatar as string) || null,
      role: (payload.role as "ADMIN" | "USER") || "USER",
      provider: (payload.provider as string) || "email",
      sessionVersion:
        typeof payload.sessionVersion === "number" ? payload.sessionVersion : 1,
    };
  } catch {
    return null;
  }
}
*/

/**
 * 1.6 getCurrentUser Fix in src/lib/auth.ts
 * Fixes:
 * 1. Deletion revocation bug: If user deleted from DB, return null immediately (invalidating session).
 * 2. Revoked session check: If dbUser.sessionVersion !== sessionUser.sessionVersion, return null.
 * 3. Status check: If dbUser.status is BLOCKED or INACTIVE, return null.
 */
/*
export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    const sessionUser = await verifySessionToken(token);
    if (!sessionUser) return null;

    // Fetch live user from PostgreSQL
    const dbUser = await prisma.user.findFirst({
      where: {
        OR: [
          { id: sessionUser.id },
          { email: normalizeEmail(sessionUser.email) },
        ],
      },
    });

    // BUG FIX 1: User deleted from DB -> session is immediately invalidated
    if (!dbUser) {
      return null;
    }

    // BUG FIX 2: User blocked or inactive -> session is immediately invalidated
    if (dbUser.status === "BLOCKED" || dbUser.status === "INACTIVE") {
      return null;
    }

    // BUG FIX 3: Session revoked via sessionVersion increment -> invalidate
    if (
      sessionUser.sessionVersion !== undefined &&
      dbUser.sessionVersion !== sessionUser.sessionVersion
    ) {
      return null;
    }

    return {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      avatar: dbUser.avatar,
      role: dbUser.role as "ADMIN" | "USER",
      provider: dbUser.provider,
      sessionVersion: dbUser.sessionVersion,
      profileData:
        dbUser.profileData && typeof dbUser.profileData === "object"
          ? (dbUser.profileData as Record<string, unknown>)
          : {},
    };
  } catch {
    return null;
  }
}
*/


// ============================================================================
// PART 2: AUTH ROUTE HANDLERS TRACKING PATCHES
// ============================================================================

/**
 * 2.1 Proposed src/app/api/auth/login-password/route.ts
 */
export const PROPOSED_LOGIN_PASSWORD_ROUTE = `
import { NextRequest } from "next/server";
import {
  getUserPasswordHash,
  verifyPassword,
  hashPassword,
  createSessionToken,
  recordLogin,
  extractClientInfo,
  normalizeEmail,
  attachSessionCookie,
  apiSuccess,
  apiError,
  prisma,
} from "@/lib";
import { Role } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = normalizeEmail(body?.email);
    const password = body?.password?.trim();
    const name = body?.name?.trim();
    const conferenceRole = body?.conferenceRole || "SUBMITTER";

    if (!email || !password) {
      return apiError("Please enter both Email and Password", 400);
    }

    if (password.length < 6) {
      return apiError("Password must be at least 6 characters long", 400);
    }

    const { ip, device } = extractClientInfo(req);

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    let userToSign;
    let userIdToTrack: string;
    let userSessionVersion = 1;

    if (!existingUser) {
      // User does not exist -> Automatically create account for them
      const newHash = hashPassword(password);
      const defaultName = name || email.split("@")[0].replace(/[._-]/g, " ");

      const created = await prisma.user.create({
        data: {
          email,
          name: defaultName,
          role: Role.USER,
          status: "ACTIVE",
          provider: "password",
          passwordHash: newHash,
          lastLoginAt: new Date(),
          lastLoginIp: ip,
          lastLoginDevice: device,
          sessionVersion: 1,
          profileData: {
            conferenceRole,
          },
        },
      });

      userIdToTrack = created.id;
      userSessionVersion = created.sessionVersion;
      userToSign = {
        id: created.id,
        email: created.email,
        name: created.name,
        avatar: created.avatar,
        role: created.role as "ADMIN" | "USER",
        provider: "password",
        sessionVersion: created.sessionVersion,
        profileData: (created.profileData as Record<string, unknown>) || {},
      };
    } else {
      if (existingUser.status === "BLOCKED") {
        return apiError("Your account has been blocked. Please contact the conference committee.", 403);
      }

      const storedHash =
        existingUser.passwordHash || (await getUserPasswordHash(email));

      if (!storedHash) {
        // User exists without password (earlier OTP/Google) -> Link password
        const newHash = hashPassword(password);
        const updated = await prisma.user.update({
          where: { email },
          data: {
            passwordHash: newHash,
            provider: "password",
            ...(name && !existingUser.name ? { name } : {}),
          },
        });

        userIdToTrack = updated.id;
        userSessionVersion = updated.sessionVersion;
        userToSign = {
          id: updated.id,
          email: updated.email,
          name: updated.name,
          avatar: updated.avatar,
          role: updated.role as "ADMIN" | "USER",
          provider: updated.provider,
          sessionVersion: updated.sessionVersion,
          profileData: (updated.profileData as Record<string, unknown>) || {},
        };
      } else {
        if (!verifyPassword(password, storedHash)) {
          return apiError("Incorrect password. Please verify or use Email Code.", 401);
        }

        userIdToTrack = existingUser.id;
        userSessionVersion = existingUser.sessionVersion;
        userToSign = {
          id: existingUser.id,
          email: existingUser.email,
          name: existingUser.name,
          avatar: existingUser.avatar,
          role: existingUser.role as "ADMIN" | "USER",
          provider: existingUser.provider,
          sessionVersion: existingUser.sessionVersion,
          profileData: (existingUser.profileData as Record<string, unknown>) || {},
        };
      }

      // Record login tracking in background/awaited
      await recordLogin(userIdToTrack, ip, device);
    }

    const token = await createSessionToken({
      ...userToSign,
      sessionVersion: userSessionVersion,
    });

    const response = apiSuccess({
      message: "Signed in successfully",
      user: userToSign,
      redirectTo: userToSign.role === "ADMIN" ? "/admin" : "/portal",
    });

    return attachSessionCookie(response, token);
  } catch (err) {
    console.error("Password login error:", err);
    return apiError(err, 500, "Error processing password sign-in");
  }
}
`;

/**
 * 2.2 Proposed src/app/api/auth/otp/verify/route.ts
 */
export const PROPOSED_OTP_VERIFY_ROUTE = `
import { NextRequest } from "next/server";
import {
  verifyOtp,
  upsertUser,
  recordLogin,
  extractClientInfo,
  createSessionToken,
  normalizeEmail,
  attachSessionCookie,
  apiSuccess,
  apiError,
  prisma,
} from "@/lib";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = normalizeEmail(body?.email);
    const code = body?.code?.trim();

    if (!email || !code) {
      return apiError("Email and verification code are required", 400);
    }

    const result = await verifyOtp(email, code);
    if (!result.valid) {
      return apiError(result.reason || "Invalid verification code", 400);
    }

    const { ip, device } = extractClientInfo(req);

    // Check if account blocked
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing && existing.status === "BLOCKED") {
      return apiError("Your account has been blocked. Please contact the conference committee.", 403);
    }

    const user = await upsertUser({
      email,
      provider: "email",
    });

    await recordLogin(user.id, ip, device);

    const token = await createSessionToken(user);
    const response = apiSuccess({
      message: "Signed in successfully",
      user,
      redirectTo: user.role === "ADMIN" ? "/admin" : "/portal",
    });

    return attachSessionCookie(response, token);
  } catch (err) {
    console.error("OTP verification error:", err);
    return apiError(err, 500, "Error verifying code");
  }
}
`;

/**
 * 2.3 Proposed src/app/api/auth/callback/google/route.ts
 */
export const PROPOSED_GOOGLE_CALLBACK_ROUTE = `
import { NextResponse } from "next/server";
import {
  createSessionToken,
  upsertUser,
  recordLogin,
  extractClientInfo,
  getGoogleOAuthConfig,
  getRequestOrigin,
  attachSessionCookie,
  extractErrorMessage,
  prisma,
} from "@/lib";

export async function GET(request: Request) {
  const currentOrigin = getRequestOrigin(request);
  const requestUrl = new URL(request.url);
  const { searchParams } = requestUrl;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(
      new URL(\`/admin/login?error=\${encodeURIComponent(error || "no_code")}\`, currentOrigin)
    );
  }

  const { clientId, clientSecret } = await getGoogleOAuthConfig();
  const redirectUri = \`\${currentOrigin}\${requestUrl.pathname}\`;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      new URL("/admin/login?error=missing_google_credentials", currentOrigin)
    );
  }

  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error("Token exchange failed:", tokenData);
      return NextResponse.redirect(
        new URL(
          \`/admin/login?error=\${encodeURIComponent(
            tokenData.error_description || tokenData.error || "token_exchange_failed"
          )}\`,
          currentOrigin
        )
      );
    }

    const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: \`Bearer \${tokenData.access_token}\` },
    });

    const profile = await userInfoResponse.json();

    if (!userInfoResponse.ok || !profile.email) {
      return NextResponse.redirect(
        new URL("/admin/login?error=failed_user_info", currentOrigin)
      );
    }

    const cleanEmail = profile.email.toLowerCase().trim();

    // Check if account blocked
    const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existing && existing.status === "BLOCKED") {
      return NextResponse.redirect(
        new URL("/admin/login?error=account_blocked", currentOrigin)
      );
    }

    const { ip, device } = extractClientInfo(request);

    const dbUser = await upsertUser({
      id: profile.sub || \`google_\${cleanEmail}\`,
      email: cleanEmail,
      name: profile.name || cleanEmail.split("@")[0],
      avatar: profile.picture || null,
      provider: "google",
    });

    await recordLogin(dbUser.id, ip, device);

    const sessionToken = await createSessionToken(dbUser);
    const destination = dbUser.role === "ADMIN" ? "/admin" : "/portal";
    const response = NextResponse.redirect(new URL(destination, currentOrigin));
    return attachSessionCookie(response, sessionToken);
  } catch (err: unknown) {
    const message = extractErrorMessage(err, "internal_error");
    console.error("Google OAuth error:", err);
    return NextResponse.redirect(
      new URL(\`/admin/login?error=\${encodeURIComponent(message)}\`, currentOrigin)
    );
  }
}
`;


// ============================================================================
// PART 3: USER ADMINISTRATION API ENDPOINTS
// ============================================================================

/**
 * 3.1 Proposed src/app/api/admin/users/route.ts
 * GET: Lists users with status, last login, role, conference role, search, pagination.
 * POST: Creates new user with safety and validation.
 */
export const PROPOSED_ADMIN_USERS_ROUTE = `
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
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || searchParams.get("size") || "20", 10)));
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

    return apiSuccess({
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
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
`;

/**
 * 3.2 Proposed src/app/api/admin/users/[id]/route.ts
 * GET: Full user details with stats and active session info.
 * PATCH: Update user status, role, conferenceRole, affiliation, name, email with safety guards.
 * DELETE: Delete user with safety guard (cannot delete own active admin account or last admin).
 */
export const PROPOSED_ADMIN_USER_ID_ROUTE = `
import { NextRequest } from "next/server";
import { Role, Prisma } from "@prisma/client";
import {
  prisma,
  hashPassword,
  normalizeEmail,
  requireAdminRequest,
  apiSuccess,
  apiError,
} from "@/lib";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { errorResponse } = await requireAdminRequest();
  if (errorResponse) return errorResponse;

  const { id } = await params;

  try {
    const user = await prisma.user.findUnique({
      where: { id },
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
            mediaFiles: true,
          },
        },
        registrations: {
          take: 5,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            registrationCode: true,
            fullName: true,
            participantType: true,
            paymentStatus: true,
            feeAmount: true,
            createdAt: true,
          },
        },
        posts: {
          take: 5,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            slug: true,
            title: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      return apiError("User not found", 404);
    }

    return apiSuccess({ user });
  } catch (error: unknown) {
    console.error("Error fetching single user:", error);
    return apiError(error, 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user: currentAdmin, errorResponse } = await requireAdminRequest();
  if (errorResponse) return errorResponse;

  const { id } = await params;

  try {
    const body = await request.json();
    const {
      role,
      status,
      name,
      email,
      avatar,
      password,
      conferenceRole,
      affiliation,
      profileData,
    } = body;

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return apiError("User not found", 404);
    }

    // Safety Guard 1: Cannot demote own active admin account
    if (currentAdmin && currentAdmin.id === targetUser.id && role && role !== "ADMIN") {
      return apiError("You cannot downgrade your own active administrator account", 400);
    }

    // Safety Guard 2: Cannot block own active admin account
    if (currentAdmin && currentAdmin.id === targetUser.id && status && status === "BLOCKED") {
      return apiError("You cannot block your own active administrator account", 400);
    }

    // Safety Guard 3: Cannot demote or block the last remaining ADMIN account in DB
    if (targetUser.role === Role.ADMIN && (role === "USER" || status === "BLOCKED")) {
      const totalAdmins = await prisma.user.count({
        where: { role: Role.ADMIN, status: "ACTIVE" },
      });
      if (totalAdmins <= 1) {
        return apiError("Cannot downgrade or block the last remaining active ADMIN account in the database", 400);
      }
    }

    // Email uniqueness check if email being changed
    if (email && normalizeEmail(email) !== targetUser.email) {
      const cleanEmail = normalizeEmail(email);
      const existingEmailUser = await prisma.user.findUnique({ where: { email: cleanEmail } });
      if (existingEmailUser) {
        return apiError("An account with this email address already exists", 409);
      }
    }

    // Password validation & hashing if provided
    let passwordHash: string | undefined;
    if (typeof password === "string" && password.trim()) {
      if (password.trim().length < 6) {
        return apiError("Password must be at least 6 characters long", 400);
      }
      passwordHash = hashPassword(password.trim());
    }

    // Merging profileData
    const currentProfile =
      targetUser.profileData && typeof targetUser.profileData === "object"
        ? (targetUser.profileData as Record<string, unknown>)
        : {};

    const mergedProfileData = {
      ...currentProfile,
      ...(conferenceRole ? { conferenceRole } : {}),
      ...(affiliation ? { affiliation } : {}),
      ...(profileData && typeof profileData === "object" ? profileData : {}),
    } as Prisma.InputJsonValue;

    // If blocking user, automatically bump sessionVersion to revoke existing sessions immediately
    const sessionVersionIncrement = status === "BLOCKED" ? { sessionVersion: { increment: 1 } } : {};

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(role ? { role: role === "ADMIN" ? Role.ADMIN : Role.USER } : {}),
        ...(status ? { status: status.toUpperCase() } : {}),
        ...(typeof name === "string" && name.trim() ? { name: name.trim() } : {}),
        ...(email ? { email: normalizeEmail(email) } : {}),
        ...(avatar !== undefined ? { avatar } : {}),
        ...(passwordHash ? { passwordHash } : {}),
        profileData: mergedProfileData,
        ...sessionVersionIncrement,
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

    return apiSuccess({ user: updated });
  } catch (error: unknown) {
    console.error("Error updating user:", error);
    return apiError(error, 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user: currentAdmin, errorResponse } = await requireAdminRequest();
  if (errorResponse) return errorResponse;

  const { id } = await params;

  try {
    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return apiError("User not found", 404);
    }

    // Safety Guard 1: Cannot delete own active admin account
    if (currentAdmin && currentAdmin.id === targetUser.id) {
      return apiError("You cannot delete your own active administrator account", 400);
    }

    // Safety Guard 2: Cannot delete the last remaining active ADMIN account
    if (targetUser.role === Role.ADMIN) {
      const totalAdmins = await prisma.user.count({
        where: { role: Role.ADMIN },
      });
      if (totalAdmins <= 1) {
        return apiError("Cannot delete the last remaining ADMIN account in the database", 400);
      }
    }

    await prisma.user.delete({ where: { id } });
    return apiSuccess({ message: "User deleted successfully", deletedId: id });
  } catch (error: unknown) {
    console.error("Error deleting user:", error);
    return apiError(error, 500);
  }
}
`;

/**
 * 3.3 Proposed src/app/api/admin/users/[id]/reset-password/route.ts
 * POST: Admin resets password by setting custom password or generating temporary password.
 * Increments sessionVersion so old sessions are terminated.
 */
export const PROPOSED_ADMIN_RESET_PASSWORD_ROUTE = `
import { NextRequest } from "next/server";
import crypto from "crypto";
import {
  prisma,
  hashPassword,
  requireAdminRequest,
  apiSuccess,
  apiError,
} from "@/lib";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { errorResponse } = await requireAdminRequest();
  if (errorResponse) return errorResponse;

  const { id } = await params;

  try {
    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return apiError("User not found", 404);
    }

    const body = await request.json().catch(() => ({}));
    const { password, temporary = true } = body;

    let finalPassword = "";
    let isGenerated = false;

    if (typeof password === "string" && password.trim()) {
      if (password.trim().length < 6) {
        return apiError("Password must be at least 6 characters long", 400);
      }
      finalPassword = password.trim();
    } else {
      // Generate secure temporary password
      finalPassword = \`Smc2027@\${crypto.randomBytes(3).toString("hex")}\`;
      isGenerated = true;
    }

    const newHash = hashPassword(finalPassword);

    const currentProfile =
      targetUser.profileData && typeof targetUser.profileData === "object"
        ? (targetUser.profileData as Record<string, unknown>)
        : {};

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        passwordHash: newHash,
        sessionVersion: { increment: 1 },
        profileData: {
          ...currentProfile,
          mustChangePassword: Boolean(temporary),
          lastPasswordResetAt: new Date().toISOString(),
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        sessionVersion: true,
        updatedAt: true,
      },
    });

    return apiSuccess({
      message: "Password reset successfully",
      user: updatedUser,
      ...(isGenerated ? { temporaryPassword: finalPassword } : {}),
    });
  } catch (error: unknown) {
    console.error("Error resetting user password:", error);
    return apiError(error, 500);
  }
}
`;

/**
 * 3.4 Proposed src/app/api/admin/users/[id]/revoke-sessions/route.ts
 * POST: Revoke user active sessions by incrementing sessionVersion in the DB.
 */
export const PROPOSED_ADMIN_REVOKE_SESSIONS_ROUTE = `
import { NextRequest } from "next/server";
import {
  prisma,
  requireAdminRequest,
  apiSuccess,
  apiError,
} from "@/lib";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { errorResponse } = await requireAdminRequest();
  if (errorResponse) return errorResponse;

  const { id } = await params;

  try {
    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return apiError("User not found", 404);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        sessionVersion: { increment: 1 },
      },
      select: {
        id: true,
        email: true,
        name: true,
        sessionVersion: true,
        updatedAt: true,
      },
    });

    return apiSuccess({
      message: "All active sessions for this user have been revoked",
      user: updatedUser,
      sessionVersion: updatedUser.sessionVersion,
    });
  } catch (error: unknown) {
    console.error("Error revoking user sessions:", error);
    return apiError(error, 500);
  }
}
`;


// ============================================================================
// PART 4: PROFILE API ENDPOINTS (src/app/api/profile/route.ts)
// ============================================================================

/**
 * 4.1 Proposed src/app/api/profile/route.ts
 * GET: Self profile with status, last login metadata, and conference registrations.
 * PATCH: Update self profile (name, avatar, bio, affiliation, academic info, password change).
 */
export const PROPOSED_PROFILE_ROUTE = `
import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import {
  getCurrentUser,
  prisma,
  hashPassword,
  verifyPassword,
  apiSuccess,
  apiError,
} from "@/lib";
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
        status: true,
        provider: true,
        lastLoginAt: true,
        lastLoginIp: true,
        lastLoginDevice: true,
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
    console.error("Error loading profile:", error);
    return apiError(error, 500, "Failed to load delegate profile");
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) {
      return apiError("Authentication required", 401);
    }

    const body = await request.json();
    const {
      name,
      avatar,
      affiliation,
      country,
      title,
      bio,
      phone,
      academicInfo,
      conferenceRole,
      profileData,
      currentPassword,
      newPassword,
    } = body;

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

    // Optional password update
    let updatedPasswordHash: string | undefined;
    if (newPassword) {
      if (!currentPassword) {
        return apiError("Current password is required to change password", 400);
      }
      if (!current.passwordHash || !verifyPassword(currentPassword, current.passwordHash)) {
        return apiError("Current password is incorrect", 400);
      }
      if (typeof newPassword !== "string" || newPassword.trim().length < 6) {
        return apiError("New password must be at least 6 characters long", 400);
      }
      updatedPasswordHash = hashPassword(newPassword.trim());
    }

    const currentProfile =
      current.profileData && typeof current.profileData === "object"
        ? (current.profileData as Record<string, unknown>)
        : {};

    const mergedProfileData = {
      ...currentProfile,
      ...(affiliation !== undefined ? { affiliation } : {}),
      ...(country !== undefined ? { country } : {}),
      ...(title !== undefined ? { title } : {}),
      ...(bio !== undefined ? { bio } : {}),
      ...(phone !== undefined ? { phone } : {}),
      ...(academicInfo !== undefined ? { academicInfo } : {}),
      ...(conferenceRole !== undefined ? { conferenceRole } : {}),
      ...(profileData && typeof profileData === "object" ? profileData : {}),
    } as Prisma.InputJsonValue;

    const updatedUser = await prisma.user.update({
      where: { id: current.id },
      data: {
        ...(typeof name === "string" && name.trim() ? { name: name.trim() } : {}),
        ...(avatar !== undefined ? { avatar } : {}),
        ...(updatedPasswordHash ? { passwordHash: updatedPasswordHash } : {}),
        profileData: mergedProfileData,
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
        profileData: true,
        updatedAt: true,
      },
    });

    return apiSuccess({
      user: updatedUser,
    });
  } catch (error: unknown) {
    console.error("Error updating profile:", error);
    return apiError(error, 500, "Failed to update delegate profile");
  }
}
`;
