"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, ChevronRight, Database } from "lucide-react";
import type { SessionUser } from "@/lib/auth";

interface AdminHeaderProps {
  user: SessionUser;
}

export function AdminHeader({ user: _user }: AdminHeaderProps) {
  const pathname = usePathname();

  const getBreadcrumbTitle = () => {
    if (pathname === "/admin") return "System Overview";
    if (pathname.startsWith("/admin/media")) return "Media Upload Library";
    if (pathname.startsWith("/admin/pages")) return "Page Hierarchy";
    if (pathname.startsWith("/admin/posts")) return "Posts & Announcements";
    if (pathname.startsWith("/admin/users")) return "User & Role Management";
    if (pathname.startsWith("/admin/oauth")) return "OAuth & AI Agent";
    if (pathname.startsWith("/admin/header")) return "Header & Navigation";
    if (pathname.startsWith("/admin/registrations")) return "Registrations & Payoo";
    if (pathname.startsWith("/admin/checkin")) return "QR Check-in";
    if (pathname.startsWith("/admin/broadcast")) return "Milestone Email Templates";
    return "Administration";
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="w-full px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs sm:text-sm">
          <Link
            href="/admin"
            className="text-slate-500 hover:text-[#005496] transition-colors font-medium"
          >
            HCMUTE Admin
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[#005496] font-bold">{getBreadcrumbTitle()}</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50/70 text-[#005496] border border-blue-100 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <Database className="w-3 h-3" />
            <span>PostgreSQL + MinIO Live</span>
          </div>

          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-[#005496] bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors shadow-2xs"
          >
            <span className="hidden sm:inline">View Website</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </Link>
        </div>
      </div>
    </header>
  );
}

export default AdminHeader;
