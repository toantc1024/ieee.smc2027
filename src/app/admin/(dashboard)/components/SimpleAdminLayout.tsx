"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Users,
  ExternalLink,
  LogOut,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  ChevronRight,
} from "lucide-react";
import type { SessionUser } from "@/lib/auth";

interface SimpleAdminLayoutProps {
  user: SessionUser;
  children: React.ReactNode;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  external?: boolean;
}

const PRIMARY_NAV_ITEMS: NavItem[] = [
  {
    name: "Bài viết & Tin tức",
    href: "/admin/posts",
    icon: FileText,
  },
  {
    name: "Người dùng & Phân quyền",
    href: "/admin/users",
    icon: Users,
  },
  {
    name: "Tổng quan",
    href: "/admin",
    icon: LayoutDashboard,
    exact: true,
  },
];

export function SimpleAdminLayout({ user, children }: SimpleAdminLayoutProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("ieee_admin_sidebar_collapsed");
    if (saved !== null) {
      setIsCollapsed(saved === "true");
    }
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("ieee_admin_sidebar_collapsed", String(next));
      return next;
    });
  };

  const getBreadcrumbTitle = () => {
    if (pathname === "/admin") return "Tổng quan";
    if (pathname.startsWith("/admin/posts")) return "Bài viết & Tin tức";
    if (pathname.startsWith("/admin/users")) return "Người dùng & Phân quyền";
    return "Quản trị";
  };

  const renderNavLinks = (collapsed: boolean) => (
    <div className="flex-1 overflow-y-auto px-2.5 py-4 space-y-1">
      {PRIMARY_NAV_ITEMS.map((item) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileMenuOpen(false)}
            title={collapsed ? item.name : undefined}
            className={`flex items-center rounded-xl text-xs font-medium transition-all group ${
              collapsed
                ? "justify-center p-3"
                : "justify-between px-3.5 py-2.5"
            } ${
              isActive
                ? "bg-[#005496] text-white shadow-xs font-semibold"
                : "text-slate-700 hover:bg-slate-100 hover:text-[#005496]"
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <Icon
                className={`size-4.5 shrink-0 transition-colors ${
                  isActive
                    ? "text-white"
                    : "text-slate-500 group-hover:text-[#005496]"
                }`}
              />
              {!collapsed && <span className="truncate">{item.name}</span>}
            </div>
          </Link>
        );
      })}

      <div className="pt-2 mt-2 border-t border-slate-100">
        <Link
          href="/"
          target="_blank"
          rel="noreferrer"
          title={collapsed ? "Xem trang chủ website" : undefined}
          className={`flex items-center rounded-xl text-xs font-medium text-slate-500 hover:text-[#005496] hover:bg-slate-100 transition-colors ${
            collapsed ? "justify-center p-3" : "justify-between px-3.5 py-2.5"
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <ExternalLink className="size-4.5 shrink-0 text-slate-400 group-hover:text-[#005496]" />
            {!collapsed && <span className="truncate">Xem trang website</span>}
          </div>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="admin-page-root min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row antialiased font-sans">
      {/* ── Mobile Top Header (< md) ── */}
      <div className="md:hidden sticky top-0 z-40 h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between shadow-2xs">
        <Link href="/admin" className="flex items-center gap-2">
          <Image
            src="/logo/rectangle-logo.png"
            alt="IEEE SMC 2027"
            width={120}
            height={28}
            className="h-7 w-auto object-contain"
            priority
          />
        </Link>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* ── Mobile Drawer ── */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] bg-white h-full flex flex-col shadow-2xl z-10">
            <div className="h-14 px-4 border-b border-slate-200 flex items-center justify-between">
              <Image
                src="/logo/rectangle-logo.png"
                alt="IEEE SMC 2027"
                width={130}
                height={30}
                className="h-7 w-auto object-contain"
              />
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            {renderNavLinks(false)}

            {/* Mobile User Footer */}
            <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="size-8 rounded-full bg-[#005496] text-white text-xs font-bold flex items-center justify-center shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold truncate text-slate-900">{user.name}</span>
                  <span className="text-[10px] text-slate-500 truncate">{user.email}</span>
                </div>
              </div>
              <form action="/api/auth/logout" method="POST">
                <button
                  type="submit"
                  title="Đăng xuất"
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md cursor-pointer"
                >
                  <LogOut className="size-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── Desktop Permanent Sidebar (md+) ── */}
      <aside
        className={`hidden md:flex shrink-0 flex-col bg-white border-r border-slate-200 min-h-screen sticky top-0 h-screen z-30 transition-[width] duration-300 ease-in-out ${
          isCollapsed ? "w-[72px]" : "w-64"
        }`}
      >
        {/* Brand Header */}
        <div
          className={`h-14 border-b border-slate-200 flex items-center shrink-0 transition-all ${
            isCollapsed ? "justify-center px-2" : "px-4"
          }`}
        >
          <Link
            href="/admin"
            className="flex items-center gap-2 min-w-0 overflow-hidden"
            title={isCollapsed ? "IEEE SMC 2027" : undefined}
          >
            {isCollapsed ? (
              <Image
                src="/logo/square-logo.png"
                alt="IEEE SMC"
                width={32}
                height={32}
                className="size-8 object-contain rounded"
                priority
              />
            ) : (
              <Image
                src="/logo/rectangle-logo.png"
                alt="IEEE SMC 2027"
                width={140}
                height={32}
                className="h-7 w-auto object-contain"
                priority
              />
            )}
          </Link>
        </div>

        {/* Navigation Items */}
        {renderNavLinks(isCollapsed)}

        {/* ── Sidebar Bottom: Collapse Button (Above Logout) + User & Logout ── */}
        <div className="p-2.5 border-t border-slate-200 bg-slate-50/70 flex flex-col gap-1.5 shrink-0">
          {/* Collapse / Expand Toggle Button as an item above logout */}
          <button
            type="button"
            onClick={toggleCollapse}
            className={`flex items-center rounded-xl text-xs font-medium text-slate-600 hover:text-[#005496] hover:bg-slate-100 transition-colors cursor-pointer group ${
              isCollapsed ? "justify-center p-2.5" : "justify-between px-3 py-2"
            }`}
            title={isCollapsed ? "Mở rộng thanh bên" : "Thu gọn thanh bên"}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {isCollapsed ? (
                <PanelLeftOpen className="size-4 shrink-0 text-slate-500 group-hover:text-[#005496]" />
              ) : (
                <PanelLeftClose className="size-4 shrink-0 text-slate-500 group-hover:text-[#005496]" />
              )}
              {!isCollapsed && <span>Thu gọn menu</span>}
            </div>
          </button>

          {/* User Info & Logout Button */}
          {isCollapsed ? (
            <div className="pt-1.5 border-t border-slate-200/80 flex flex-col items-center gap-1.5">
              <div
                className="size-8 rounded-full bg-[#005496] text-white text-xs font-bold flex items-center justify-center shrink-0 cursor-default"
                title={`${user.name} (${user.email})`}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
              <form action="/api/auth/logout" method="POST">
                <button
                  type="submit"
                  title="Đăng xuất"
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="size-4" />
                </button>
              </form>
            </div>
          ) : (
            <div className="pt-1.5 border-t border-slate-200/80 flex items-center justify-between gap-2 min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <div className="size-8 rounded-full bg-[#005496] text-white text-xs font-bold flex items-center justify-center shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-slate-900 truncate">{user.name}</span>
                  <span className="text-[10px] text-slate-500 truncate">{user.email}</span>
                </div>
              </div>

              <form action="/api/auth/logout" method="POST">
                <button
                  type="submit"
                  title="Đăng xuất"
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="size-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main Viewport Area ── */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen transition-all duration-300 ease-in-out">
        {/* Desktop Clean Top Header Bar */}
        <header className="hidden md:flex h-14 bg-white border-b border-slate-200 px-6 items-center justify-between sticky top-0 z-20">
          {/* Left: Clean Breadcrumb */}
          <div className="flex items-center gap-2 text-xs">
            <Link
              href="/admin"
              className="text-slate-500 hover:text-[#005496] transition-colors font-medium"
            >
              Quản trị
            </Link>
            <ChevronRight className="size-3.5 text-slate-400" />
            <span className="font-semibold text-slate-900">{getBreadcrumbTitle()}</span>
          </div>

          {/* Right: Clean Search Bar */}
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="size-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="Tìm kiếm..."
                className="w-full h-8.5 pl-8.5 pr-3 text-xs bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#005496] transition-all"
              />
            </div>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default SimpleAdminLayout;
