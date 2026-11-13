"use client";

import { toast } from "sonner";

export const AUTH_CHANNEL_NAME = "smc2027_auth_sync";

let isLoggingOut = false;

declare global {
  interface Window {
    __smcOrigFetch?: typeof window.fetch;
    __smcFetchInterceptorCount?: number;
  }
}

function getRequestPathname(input: RequestInfo | URL): string | null {
  if (typeof window === "undefined") return null;
  try {
    const rawUrl =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.href
          : input.url;
    const parsed = new URL(rawUrl, window.location.origin);
    if (parsed.origin !== window.location.origin) {
      return null;
    }
    return parsed.pathname;
  } catch {
    return null;
  }
}

export function broadcastAuthLogout(): void {
  if (typeof window === "undefined") return;
  try {
    const channel = new BroadcastChannel(AUTH_CHANNEL_NAME);
    channel.postMessage({ type: "LOGOUT" });
    channel.close();
  } catch {
    // BroadcastChannel may be unavailable in restricted contexts
  }
}

/**
 * Trigger immediate auto-logout once and redirect cleanly to sign-in.
 */
export function triggerAutoLogout(
  redirectPath = "/admin/login",
  message = "Session expired. Redirecting to sign in..."
): void {
  if (typeof window === "undefined") return;
  if (isLoggingOut) return;
  isLoggingOut = true;

  broadcastAuthLogout();
  toast.error(message);

  const rawFetch = window.__smcOrigFetch || window.fetch.bind(window);
  void rawFetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
    keepalive: true,
  }).catch(() => {});

  const currentPath = window.location.pathname;
  if (currentPath !== redirectPath) {
    const targetUrl =
      redirectPath === "/admin/login"
        ? "/admin/login?reason=session_expired"
        : redirectPath;
    window.location.replace(targetUrl);
  }
}

/**
 * Install an idempotent global fetch interceptor that detects 401/invalid-session responses
 * on protected API routes and immediately triggers auto-logout.
 */
export function installSessionFetchInterceptor(options?: {
  requireAdmin?: boolean;
  redirectPath?: string;
}): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const redirectPath = options?.redirectPath || "/admin/login";
  const requireAdmin = options?.requireAdmin ?? false;

  if (!window.__smcOrigFetch) {
    window.__smcOrigFetch = window.fetch.bind(window);
  }
  const origFetch = window.__smcOrigFetch;
  window.__smcFetchInterceptorCount = (window.__smcFetchInterceptorCount || 0) + 1;

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const response = await origFetch(input, init);
    const pathname = getRequestPathname(input);

    if (!pathname || pathname === "/api/auth/logout") {
      return response;
    }

    const isProtectedPath =
      pathname.startsWith("/api/admin") ||
      pathname === "/api/profile" ||
      pathname === "/api/auth/me";

    if (!isProtectedPath) {
      return response;
    }

    if (response.status === 401) {
      triggerAutoLogout(redirectPath);
    } else if (requireAdmin && response.status === 403 && pathname.startsWith("/api/admin")) {
      try {
        const meRes = await origFetch("/api/auth/me", {
          cache: "no-store",
          credentials: "include",
        });
        const meData = await meRes.json().catch(() => null);
        if (!meRes.ok || !meData?.user || meData.user.role !== "ADMIN") {
          triggerAutoLogout(redirectPath);
        }
      } catch {
        triggerAutoLogout(redirectPath);
      }
    }

    return response;
  };

  return () => {
    if (typeof window === "undefined") return;
    window.__smcFetchInterceptorCount = Math.max(
      0,
      (window.__smcFetchInterceptorCount || 1) - 1
    );
    if (window.__smcFetchInterceptorCount === 0 && window.__smcOrigFetch) {
      window.fetch = window.__smcOrigFetch;
    }
  };
}

