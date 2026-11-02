/**
 * Opaque-box Test HTTP Client
 * Features:
 * - In-memory cookie jar persisting across requests (e.g. admin_session)
 * - Automatic JSON serialization and parsing
 * - Authentication helper methods (loginAsAdmin, loginAsUser, logout)
 * - Raw request/response inspection
 */

import { E2E_CONFIG } from "../config";
import { ensureServerRunning } from "./server-manager";

let serverReadyChecked = false;

export interface HttpResponse<T = any> {
  status: number;
  ok: boolean;
  headers: Headers;
  data: T;
  text: string;
}

export interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: any;
  query?: Record<string, string | number | boolean | undefined>;
  skipAuth?: boolean;
}

export class TestHttpClient {
  private baseUrl: string;
  private cookies: Map<string, string> = new Map();

  constructor(baseUrl: string = E2E_CONFIG.baseUrl) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  public setCookie(name: string, value: string): void {
    this.cookies.set(name, value);
  }

  public getCookie(name: string): string | undefined {
    return this.cookies.get(name);
  }

  public clearCookies(): void {
    this.cookies.clear();
  }

  private parseSetCookie(headerValue: string | null): void {
    if (!headerValue) return;
    // Handle comma or newline separated set-cookie headers
    const cookieStrings = headerValue.split(/,(?=[^;]+=[^;]+)/g);
    for (const c of cookieStrings) {
      const parts = c.trim().split(";")[0].split("=");
      if (parts.length >= 2) {
        const name = parts[0].trim();
        const value = parts.slice(1).join("=").trim();
        if (value) {
          this.cookies.set(name, value);
        } else {
          this.cookies.delete(name);
        }
      }
    }
  }

  private buildCookieHeader(): string {
    const pairs: string[] = [];
    for (const [name, value] of this.cookies.entries()) {
      pairs.push(`${name}=${value}`);
    }
    return pairs.join("; ");
  }

  public async request<T = any>(
    path: string,
    options: RequestOptions = {}
  ): Promise<HttpResponse<T>> {
    if (!serverReadyChecked) {
      await ensureServerRunning();
      serverReadyChecked = true;
    }

    let url = path.startsWith("http") ? path : `${this.baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;

    if (options.query) {
      const parsedUrl = new URL(url);
      for (const [k, v] of Object.entries(options.query)) {
        if (v !== undefined) {
          parsedUrl.searchParams.set(k, String(v));
        }
      }
      url = parsedUrl.toString();
    }

    const headers = new Headers(options.headers || {});

    if (this.cookies.size > 0 && !options.skipAuth && !headers.has("Cookie")) {
      headers.set("Cookie", this.buildCookieHeader());
    }

    if (options.body && typeof options.body === "object" && !(options.body instanceof FormData)) {
      if (!headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }
      options.body = JSON.stringify(options.body);
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const setCookie = response.headers.get("set-cookie");
    if (setCookie) {
      this.parseSetCookie(setCookie);
    }

    const text = await response.text();
    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    return {
      status: response.status,
      ok: response.ok,
      headers: response.headers,
      data: data as T,
      text,
    };
  }

  public async get<T = any>(path: string, options?: RequestOptions): Promise<HttpResponse<T>> {
    return this.request<T>(path, { ...options, method: "GET" });
  }

  public async post<T = any>(path: string, body?: any, options?: RequestOptions): Promise<HttpResponse<T>> {
    return this.request<T>(path, { ...options, method: "POST", body });
  }

  public async put<T = any>(path: string, body?: any, options?: RequestOptions): Promise<HttpResponse<T>> {
    return this.request<T>(path, { ...options, method: "PUT", body });
  }

  public async patch<T = any>(path: string, body?: any, options?: RequestOptions): Promise<HttpResponse<T>> {
    return this.request<T>(path, { ...options, method: "PATCH", body });
  }

  public async delete<T = any>(path: string, options?: RequestOptions): Promise<HttpResponse<T>> {
    return this.request<T>(path, { ...options, method: "DELETE" });
  }

  /**
   * Log in with password credentials and store session cookie
   */
  public async loginAsAdmin(
    email: string = E2E_CONFIG.adminCredentials.email,
    password: string = E2E_CONFIG.adminCredentials.password
  ): Promise<HttpResponse> {
    const res = await this.post("/api/auth/login-password", {
      email,
      password,
    });
    return res;
  }

  /**
   * Log in or register as standard user
   */
  public async loginAsUser(
    email: string,
    password: string = "UserPass123!",
    name?: string
  ): Promise<HttpResponse> {
    const res = await this.post("/api/auth/login-password", {
      email,
      password,
      name: name || email.split("@")[0],
    });
    return res;
  }

  /**
   * Log out session
   */
  public async logout(): Promise<HttpResponse> {
    const res = await this.post("/api/auth/logout");
    this.clearCookies();
    return res;
  }
}

export default TestHttpClient;
