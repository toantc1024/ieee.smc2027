"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, ChevronRight, Database } from "lucide-react";
import type { SessionUser } from "@/lib/auth";

interface AdminHeaderProps {
  user: SessionUser;
}

export function AdminHeader({ user }: AdminHeaderProps) {
  const pathname = usePathname();

  const getBreadcrumbTitle = () => {
    if (pathname === "/admin") return "Tổng quan hệ thống";
    if (pathname.startsWith("/admin/pages")) return "Cấu trúc trang (Tree Pages)";
    if (pathname.startsWith("/admin/posts")) return "Quản lý bài viết";
    if (pathname.startsWith("/admin/users")) return "Quản trị người dùng";
    if (pathname.startsWith("/admin/oauth")) return "OAuth & AI Agent";
    if (pathname.startsWith("/admin/header")) return "Cấu hình Header & Menu";
    return "Quản trị";
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="w-full px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Breadcrumb Hierarchy */}
        <div className="flex items-center gap-2 text-xs sm:text-sm">
          <Link
            href="/admin"
            className="text-slate-500 hover:text-slate-900 transition-colors font-medium"
          >
            Admin
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-semibold">{getBreadcrumbTitle()}</span>
        </div>

        {/* Status Indicators & View Site */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <Database className="w-3 h-3 text-slate-500" />
            <span>Neon DB Connected</span>
          </div>

          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-md transition-colors shadow-2xs"
          >
            <span className="hidden sm:inline">Xem website</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </Link>
        </div>
      </div>
    </header>
  );
}

export default AdminHeader;
