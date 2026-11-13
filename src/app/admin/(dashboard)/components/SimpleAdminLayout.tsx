"use client";

import React, { useMemo, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Toaster } from "@/components/ui/sonner";
import type { SessionUser } from "@/lib/auth";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import {
  AUTH_CHANNEL_NAME,
  installSessionFetchInterceptor,
  triggerAutoLogout,
} from "@/lib/session-guard";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";

interface SimpleAdminLayoutProps {
  user: SessionUser;
  children: React.ReactNode;
}

export function SimpleAdminLayout({ user, children }: SimpleAdminLayoutProps) {
  const pathname = usePathname();

  useEffect(() => {
    const uninstallInterceptor = installSessionFetchInterceptor({
      requireAdmin: true,
      redirectPath: "/admin/login",
    });

    const checkSession = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          cache: "no-store",
          credentials: "include",
        });
        if (res.status === 401) {
          triggerAutoLogout("/admin/login");
          return;
        }
        if (!res.ok) return;
        const data = await res.json().catch(() => null);
        if (!data?.user || data.user.role !== "ADMIN") {
          triggerAutoLogout("/admin/login");
        }
      } catch {
        // Ignore transient network errors during background heartbeat
      }
    };

    const intervalId = window.setInterval(checkSession, 10000);
    const handleFocus = () => {
      void checkSession();
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void checkSession();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    let authChannel: BroadcastChannel | null = null;
    try {
      authChannel = new BroadcastChannel(AUTH_CHANNEL_NAME);
      authChannel.onmessage = (event) => {
        if (event.data?.type === "LOGOUT") {
          window.location.replace("/admin/login");
        }
      };
    } catch {
      // BroadcastChannel unavailable
    }

    return () => {
      uninstallInterceptor();
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (authChannel) {
        authChannel.close();
      }
    };
  }, []);

  const isFullBleed = useMemo(() => {
    return (
      (pathname.startsWith("/admin/pages/") && pathname !== "/admin/pages") ||
      pathname === "/admin/posts/create" ||
      (pathname.startsWith("/admin/posts/") && pathname.endsWith("/edit")) ||
      pathname.startsWith("/admin/header")
    );
  }, [pathname]);

  return (
    <div className="admin-page-root">
      <SidebarProvider className="fixed inset-0 h-svh max-h-svh overflow-hidden overscroll-none bg-background text-foreground antialiased font-sans">
        <AdminSidebar user={user} />
        <SidebarInset className="flex flex-col h-full min-h-0 overflow-hidden bg-slate-50/60 dark:bg-[#070b14]">
          <AdminHeader />
          <main
            id="admin-main-content"
            className={
              isFullBleed
                ? "relative flex-1 min-h-0 overflow-hidden p-0"
                : "relative flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 lg:p-8"
            }
          >
            <div className={isFullBleed ? "h-full w-full" : "max-w-7xl mx-auto w-full"}>
              {children}
            </div>
          </main>
        </SidebarInset>
        <Toaster position="top-right" richColors />
      </SidebarProvider>
    </div>
  );
}

export default SimpleAdminLayout;
