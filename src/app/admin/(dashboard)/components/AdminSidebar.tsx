"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Layers,
  FileText,
  Users,
  PanelTop,
  ExternalLink,
  LogOut,
  ChevronRight,
  Shield,
  CreditCard,
  Menu,
  X,
  KeyRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SessionUser } from "@/lib/auth";

interface AdminSidebarProps {
  user: SessionUser;
}

const SIDEBAR_ITEMS = [
  {
    title: "TỔNG QUAN",
    items: [
      {
        name: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
        exact: true,
      },
    ],
  },
  {
    title: "NỘI DUNG & TRANG",
    items: [
      {
        name: "Quản lý trang (Pages)",
        href: "/admin/pages",
        icon: Layers,
        exact: false,
        badge: "Drag & Drop",
      },
      {
        name: "Bài viết & Tin tức",
        href: "/admin/posts",
        icon: FileText,
        exact: false,
        badge: "Tiptap",
      },
      {
        name: "Cấu hình Header",
        href: "/admin/header",
        icon: PanelTop,
        exact: false,
      },
    ],
  },
  {
    title: "HỆ THỐNG",
    items: [
      {
        name: "Người dùng (Users)",
        href: "/admin/users",
        icon: Users,
        exact: false,
        badge: "Roles",
      },
      {
        name: "OAuth & AI Agent",
        href: "/admin/oauth",
        icon: KeyRound,
        exact: false,
        badge: "Google",
      },
    ],
  },
];

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Drawer Toggle */}
      <div className="lg:hidden fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setMobileOpen((o) => !o)}
          className="w-12 h-12 rounded-full bg-[#115eff] text-white shadow-lg flex items-center justify-center cursor-pointer"
          aria-label="Toggle admin menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-xs"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 z-40 h-screen w-64 xl:w-72 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 transition-transform duration-200",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Brand Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200">
          <Link
            href="/admin"
            className="flex items-center gap-3 group focus:outline-none"
          >
            <div className="w-10 h-10 rounded-lg bg-[#115eff] text-white flex items-center justify-center font-black shadow-xs group-hover:bg-[#0a4de6] transition-colors shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-base font-extrabold text-[#004776] leading-tight tracking-tight">
                IEEE SMC 2027
              </span>
              <span className="text-[11px] font-bold text-[#115eff] uppercase tracking-wider mt-0.5">
                Admin Management
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-6">
          {SIDEBAR_ITEMS.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1.5">
              <div className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                {group.title}
              </div>
              <nav className="space-y-1">
                {group.items.map((item) => {
                  const isActive = item.exact
                    ? pathname === item.href
                    : pathname.startsWith(item.href);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center justify-between px-3 py-2.5 rounded-md text-xs sm:text-sm font-semibold transition-all group",
                        isActive
                          ? "bg-[#115eff] text-white shadow-xs font-bold"
                          : "text-[#004776] hover:bg-blue-50/70 hover:text-[#115eff]"
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={cn(
                            "w-4 h-4 shrink-0 transition-colors",
                            isActive
                              ? "text-white"
                              : "text-slate-500 group-hover:text-[#115eff]"
                          )}
                        />
                        <span className="truncate">{item.name}</span>
                      </div>

                      {item.badge && (
                        <span
                          className={cn(
                            "text-[10px] px-1.5 py-0.2 rounded font-bold uppercase shrink-0",
                            isActive
                              ? "bg-white/20 text-white"
                              : "bg-blue-50 text-[#115eff]"
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}

          {/* Quick Direct Links to Public Site */}
          <div className="pt-2 border-t border-slate-100 space-y-1">
            <div className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              TRANG NGOÀI (PUBLIC SITE)
            </div>
            <Link
              href="/"
              target="_blank"
              className="flex items-center justify-between px-3 py-2 rounded-md text-xs text-slate-600 hover:text-[#115eff] hover:bg-slate-50 transition-colors"
            >
              <span>Xem trang chủ</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </Link>
            <Link
              href="/committees"
              target="_blank"
              className="flex items-center justify-between px-3 py-2 rounded-md text-xs text-slate-600 hover:text-[#115eff] hover:bg-slate-50 transition-colors"
            >
              <span>Trang Committees</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          </div>
        </div>

        {/* User Profile & Logout Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-200 bg-slate-50/60">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-9 h-9 rounded-full border border-slate-200 object-cover shrink-0"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-[#115eff] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-slate-900 truncate">
                  {user.name}
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-blue-100 text-[#115eff]">
                    {user.role}
                  </span>
                  <span className="text-[10px] text-slate-500 truncate max-w-[90px]">
                    {user.email}
                  </span>
                </div>
              </div>
            </div>

            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                title="Đăng xuất"
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                aria-label="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </aside>
    </>
  );
}

export default AdminSidebar;
