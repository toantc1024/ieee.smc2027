"use client";

import React, { useMemo } from "react";
import { usePathname } from "next/navigation";
import { Toaster } from "sonner";
import type { SessionUser } from "@/lib/auth";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";

interface SimpleAdminLayoutProps {
  user: SessionUser;
  children: React.ReactNode;
}

export function SimpleAdminLayout({ user, children }: SimpleAdminLayoutProps) {
  const pathname = usePathname();

  const isFullBleed = useMemo(() => {
    return (
      (pathname.startsWith("/admin/posts/") &&
        pathname !== "/admin/posts" &&
        pathname !== "/admin/posts/new") ||
      (pathname.startsWith("/admin/pages/") && pathname !== "/admin/pages")
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
                : "relative flex-1 min-h-0 overflow-y-auto p-4 md:px-6 md:pb-8 md:pt-6"
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
