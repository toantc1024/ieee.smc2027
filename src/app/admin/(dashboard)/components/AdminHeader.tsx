"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, ChevronRight, Database, Shield } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import type { SessionUser } from "@/lib/auth";

interface AdminHeaderProps {
  user: SessionUser;
}

export function AdminHeader({ user: _user }: AdminHeaderProps) {
  const pathname = usePathname();

  const getBreadcrumbInfo = () => {
    if (pathname === "/admin") return { category: "Overview", title: "Dashboard" };
    if (pathname.startsWith("/admin/registrations")) return { category: "Operations", title: "Registrations & Payoo" };
    if (pathname.startsWith("/admin/checkin")) return { category: "Operations", title: "QR Check-in" };
    if (pathname.startsWith("/admin/broadcast")) return { category: "Operations", title: "Milestone Emails" };
    if (pathname.startsWith("/admin/media")) return { category: "Content", title: "Media Library" };
    if (pathname.startsWith("/admin/pages")) return { category: "Content", title: "Page Hierarchy" };
    if (pathname.startsWith("/admin/posts")) return { category: "Content", title: "Posts & News" };
    if (pathname.startsWith("/admin/header")) return { category: "Content", title: "Header & Navigation" };
    if (pathname.startsWith("/admin/users")) return { category: "System", title: "Users & Roles" };
    if (pathname.startsWith("/admin/oauth")) return { category: "System", title: "OAuth & AI Agent" };
    return { category: "Console", title: "Administration" };
  };

  const breadcrumb = getBreadcrumbInfo();

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-2 border-b border-slate-200/90 bg-white/95 px-4 backdrop-blur-md transition-[width,height] ease-linear">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4 bg-slate-200" />
        
        <nav className="flex items-center gap-1.5 text-xs">
          <Link
            href="/admin"
            className="text-slate-500 hover:text-[#115eff] transition-colors font-medium"
          >
            Console
          </Link>
          <ChevronRight className="size-3.5 text-slate-400" />
          <span className="text-slate-500 hidden sm:inline">{breadcrumb.category}</span>
          <ChevronRight className="size-3.5 text-slate-400 hidden sm:inline" />
          <span className="font-bold text-[#115eff]">{breadcrumb.title}</span>
        </nav>
      </div>

      <div className="flex items-center gap-2.5">
        <div className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-[#115eff] border border-blue-100 text-[11px] font-semibold">
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          <Database className="size-3" />
          <span>PostgreSQL + MinIO Live</span>
        </div>

        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-[#115eff] bg-white hover:bg-slate-50 border border-slate-200 rounded-md transition-colors shadow-2xs"
        >
          <span className="hidden sm:inline">Conference Website</span>
          <ExternalLink className="size-3 text-slate-400" />
        </Link>
      </div>
    </header>
  );
}

export default AdminHeader;
