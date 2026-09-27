"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, ShieldCheck, ChevronRight } from "lucide-react";
import type { SessionUser } from "@/lib/auth";

interface AdminHeaderProps {
  user: SessionUser;
}

export function AdminHeader({ user }: AdminHeaderProps) {
  const pathname = usePathname();

  const getBreadcrumbTitle = () => {
    if (pathname === "/admin") return "Tổng quan hệ thống";
    if (pathname.startsWith("/admin/pages")) return "Quản lý trang (Pages)";
    if (pathname.startsWith("/admin/posts")) return "Quản lý bài viết (Posts)";
    if (pathname.startsWith("/admin/users")) return "Quản trị người dùng (Users)";
    if (pathname.startsWith("/admin/header")) return "Cấu hình Header & Menu";
    return "Quản trị";
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-white border-b border-slate-200 shadow-2xs">
      <div className="w-full px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold">
          <Link
            href="/admin"
            className="text-slate-500 hover:text-[#115eff] transition-colors"
          >
            Admin
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[#004776] font-bold">{getBreadcrumbTitle()}</span>
        </div>

        {/* Right: Quick actions & User status */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>PostgreSQL Online</span>
          </div>

          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-[#115eff] bg-slate-100 hover:bg-slate-200/80 rounded-md transition-colors"
          >
            <span className="hidden sm:inline">Xem website</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}

export default AdminHeader;
