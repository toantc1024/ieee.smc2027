"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Layers,
  FileText,
  Users,
  PanelTop,
  ExternalLink,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  KeyRound,
  Menu,
  X,
  Globe,
  Settings,
  CreditCard,
  QrCode,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SessionUser } from "@/lib/auth";

interface AdminSidebarProps {
  user: SessionUser;
}

const NAV_GROUPS = [
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
    title: "ĐẠI BIỂU & ĐỐI SOÁT",
    items: [
      {
        name: "Đăng ký & Đối soát",
        href: "/admin/registrations",
        icon: CreditCard,
        exact: false,
        badge: "VietQR",
      },
      {
        name: "Quét QR Điểm danh",
        href: "/admin/checkin",
        icon: QrCode,
        exact: false,
      },
      {
        name: "Gửi Email hàng loạt",
        href: "/admin/broadcast",
        icon: Send,
        exact: false,
      },
    ],
  },
  {
    title: "NỘI DUNG & CẤU TRÚC",
    items: [
      {
        name: "Cấu trúc trang (Tree Pages)",
        href: "/admin/pages",
        icon: Layers,
        exact: false,
        badge: "Tree",
      },
      {
        name: "Bài viết & Tin tức",
        href: "/admin/posts",
        icon: FileText,
        exact: false,
      },
      {
        name: "Cấu hình Header & Menu",
        href: "/admin/header",
        icon: PanelTop,
        exact: false,
      },
    ],
  },
  {
    title: "BẢO MẬT & CÀI ĐẶT",
    items: [
      {
        name: "Quản trị người dùng",
        href: "/admin/users",
        icon: Users,
        exact: false,
        badge: "RBAC",
      },
      {
        name: "OAuth & AI Agent",
        href: "/admin/oauth",
        icon: KeyRound,
        exact: false,
        badge: "Secure",
      },
    ],
  },
];

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Restore collapsed state from localStorage on client
  useEffect(() => {
    const saved = localStorage.getItem("ieee_admin_sidebar_collapsed");
    if (saved !== null) {
      setCollapsed(saved === "true");
    }
  }, []);

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("ieee_admin_sidebar_collapsed", String(next));
  };

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <div className="lg:hidden fixed bottom-5 right-5 z-50">
        <button
          onClick={() => setMobileOpen((o) => !o)}
          className="w-11 h-11 rounded-lg bg-slate-900 text-white shadow-md flex items-center justify-center cursor-pointer hover:bg-slate-800 transition-colors"
          aria-label="Toggle Navigation"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Main Sidebar (shadcn sidebar-07 style) */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 z-40 h-screen bg-slate-50/80 backdrop-blur-md border-r border-slate-200/90 flex flex-col justify-between shrink-0 transition-all duration-200 ease-in-out",
          collapsed ? "w-16" : "w-64 xl:w-72",
          mobileOpen ? "translate-x-0 w-72" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header / Brand */}
        <div className="h-16 px-4 border-b border-slate-200/90 flex items-center justify-between">
          <Link
            href="/admin"
            className="flex items-center gap-2.5 overflow-hidden group focus:outline-none"
          >
            <div className="w-8 h-8 rounded-md bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:bg-[#115eff] transition-colors">
              <Shield className="w-4 h-4 text-white" />
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold text-slate-900 tracking-tight truncate">
                  IEEE SMC 2027
                </span>
                <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider truncate">
                  Admin Console
                </span>
              </div>
            )}
          </Link>

          {/* Desktop Collapse Trigger */}
          <button
            type="button"
            onClick={toggleCollapsed}
            className="hidden lg:flex p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-md transition-colors cursor-pointer"
            title={collapsed ? "Mở rộng thanh bên" : "Thu gọn thanh bên"}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation Menu (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-5">
          {NAV_GROUPS.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              {!collapsed && (
                <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {group.title}
                </div>
              )}

              <nav className="space-y-0.5">
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
                      title={collapsed ? item.name : undefined}
                      className={cn(
                        "flex items-center rounded-md text-xs font-medium transition-all group",
                        collapsed
                          ? "justify-center p-2.5"
                          : "justify-between px-2.5 py-2",
                        isActive
                          ? "bg-slate-900 text-white font-semibold shadow-2xs"
                          : "text-slate-600 hover:bg-slate-200/50 hover:text-slate-900"
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={cn(
                            "w-4 h-4 shrink-0 transition-colors",
                            isActive
                              ? "text-white"
                              : "text-slate-400 group-hover:text-slate-700"
                          )}
                        />
                        {!collapsed && <span className="truncate">{item.name}</span>}
                      </div>

                      {!collapsed && item.badge && (
                        <span
                          className={cn(
                            "text-[10px] px-1.5 py-0.2 rounded font-mono font-medium shrink-0",
                            isActive
                              ? "bg-white/20 text-white"
                              : "bg-slate-200/70 text-slate-600"
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

          {/* Quick External Links */}
          {!collapsed && (
            <div className="pt-3 border-t border-slate-200/80 space-y-1">
              <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                TRANG NGOÀI
              </div>
              <Link
                href="/"
                target="_blank"
                className="flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-200/40 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  <span>Xem trang chủ</span>
                </div>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </Link>
            </div>
          )}
        </div>

        {/* Footer: User Profile & Logout */}
        <div className="p-2.5 border-t border-slate-200/90 bg-white/50">
          <div
            className={cn(
              "flex items-center gap-2.5",
              collapsed ? "justify-center" : "justify-between"
            )}
          >
            <div className="flex items-center gap-2 min-w-0">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full border border-slate-200 object-cover shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}

              {!collapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-slate-900 truncate">
                    {user.name}
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[9px] font-bold uppercase px-1 rounded bg-slate-200/80 text-slate-700">
                      {user.role}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate max-w-[90px]">
                      {user.email}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {!collapsed && (
              <form action="/api/auth/logout" method="POST">
                <button
                  type="submit"
                  title="Đăng xuất"
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                  aria-label="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

export default AdminSidebar;
