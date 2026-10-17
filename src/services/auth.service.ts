/**
 * Authentication Service Template (Google OAuth, Email OTP, Email & Password)
 * WeChat authentication has been removed per project specification.
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
  SESSION_COOKIE_NAME,
  ADMIN_EMAILS,
  type SessionUser,
} from "@/lib/auth";

export class AuthService {
  public readonly sessionCookieName = SESSION_COOKIE_NAME;
  public readonly adminEmails = ADMIN_EMAILS;

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
    id: string;
    email: string;
    name: string;
    avatar?: string | null;
    role?: string;
    provider?: "google" | "email_otp" | "password";
  }) {
    return upsertUser(user);
  }

  public async sendEmailOtp(email: string) {
    return generateOtp(email);
  }

  public async verifyEmailOtp(email: string, code: string) {
    return verifyOtp(email, code);
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
