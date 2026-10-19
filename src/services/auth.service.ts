/**
 * Authentication Service (DB-Backed Roles, Google OAuth, Email Link & OTP, Password)
 */

import {
  createSessionToken,
  verifySessionToken,
  getCurrentUser,
  getSession,
  upsertUser,
  hashPassword,
  verifyPassword,
  getUserPasswordHash,
  setUserPassword,
  generateOtp,
  verifyOtp,
  createEmailLinkToken,
  verifyEmailLinkToken,
  ensureDatabaseAdmins,
  SESSION_COOKIE_NAME,
  type SessionUser,
} from "@/lib/auth";

export class AuthService {
  public readonly sessionCookieName = SESSION_COOKIE_NAME;

  public async ensureDatabaseAdmins(): Promise<void> {
    return ensureDatabaseAdmins();
  }

  public async getCurrentUser(): Promise<SessionUser | null> {
    return getCurrentUser();
  }

  public async getSession(): Promise<{ user: SessionUser } | null> {
    return getSession();
  }

  public async requireAdmin(): Promise<SessionUser> {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      throw new Error("UNAUTHORIZED_ADMIN");
    }
    return user;
  }

  public async issueToken(user: SessionUser): Promise<string> {
    return createSessionToken(user);
  }

  public async verifyToken(token: string): Promise<SessionUser | null> {
    return verifySessionToken(token);
  }

  public async syncUserAccount(user: {
    id?: string;
    email: string;
    name?: string;
    avatar?: string | null;
    role?: "ADMIN" | "USER";
    provider?: "google" | "email_link" | "email_otp" | "password";
    profileData?: Record<string, unknown>;
  }) {
    return upsertUser(user);
  }

  public async sendEmailOtp(email: string) {
    return generateOtp(email);
  }

  public async verifyEmailOtp(email: string, code: string) {
    return verifyOtp(email, code);
  }

  public async createEmailLink(email: string) {
    return createEmailLinkToken(email);
  }

  public async verifyEmailLink(token: string) {
    return verifyEmailLinkToken(token);
  }

  public async verifyUserPassword(email: string, plainPassword: string): Promise<boolean> {
    const storedHash = await getUserPasswordHash(email);
    if (!storedHash) return false;
    return verifyPassword(plainPassword, storedHash);
  }

  public async updateUserPassword(email: string, newPassword: string): Promise<void> {
    return setUserPassword(email, newPassword);
  }

  public hashPassword(password: string): string {
    return hashPassword(password);
  }
}

export const authService = new AuthService();
export default authService;
