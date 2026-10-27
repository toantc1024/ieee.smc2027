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
  Shield,
  KeyRound,
  Globe,
  CreditCard,
  QrCode,
  Send,
  FolderOpen,
  Menu,
  X,
  Laptop,
  ChevronLeft,
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
  badge?: string;
  external?: boolean;
}

interface NavGroup {
  groupTitle: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    groupTitle: "Overview",
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
    groupTitle: "Delegates & Payoo",
    items: [
      {
        name: "Registrations & Payoo",
        href: "/admin/registrations",
        icon: CreditCard,
        badge: "Payoo",
      },
      {
        name: "QR Check-in",
        href: "/admin/checkin",
        icon: QrCode,
      },
      {
        name: "Milestone Emails",
        href: "/admin/broadcast",
        icon: Send,
      },
    ],
  },
  {
    groupTitle: "Content & Media",
    items: [
      {
        name: "Media Library",
        href: "/admin/media",
        icon: FolderOpen,
        badge: "MinIO",
      },
      {
        name: "Page Hierarchy",
        href: "/admin/pages",
        icon: Layers,
      },
      {
        name: "Posts & News",
        href: "/admin/posts",
        icon: FileText,
      },
      {
        name: "Header Navigation",
        href: "/admin/header",
        icon: PanelTop,
      },
    ],
  },
  {
    groupTitle: "Security & RBAC",
    items: [
      {
        name: "Users & Roles",
        href: "/admin/users",
        icon: Users,
        badge: "RBAC",
      },
      {
        name: "OAuth & AI Agent",
        href: "/admin/oauth",
        icon: KeyRound,
      },
    ],
  },
  {
    groupTitle: "Portals",
    items: [
      {
        name: "Conference Website",
        href: "/",
        icon: Globe,
        external: true,
      },
      {
        name: "Delegate Portal",
        href: "/portal",
        icon: Laptop,
        external: true,
      },
    ],
  },
];

export function SimpleAdminLayout({ user, children }: SimpleAdminLayoutProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

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

  const getPageTitle = () => {
    if (pathname === "/admin") return "Dashboard";
    if (pathname.startsWith("/admin/registrations")) return "Registrations & Payoo";
    if (pathname.startsWith("/admin/checkin")) return "QR Check-in";
    if (pathname.startsWith("/admin/broadcast")) return "Milestone Emails";
    if (pathname.startsWith("/admin/media")) return "Media Library";
    if (pathname.startsWith("/admin/pages")) return "Page Hierarchy";
    if (pathname.startsWith("/admin/posts")) return "Posts & News";
    if (pathname.startsWith("/admin/header")) return "Header Navigation";
    if (pathname.startsWith("/admin/users")) return "Users & Roles";
    if (pathname.startsWith("/admin/oauth")) return "OAuth & AI Agent";
    return "Administration";
  };

  const renderNavItems = (collapsed: boolean) => (
    <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-5">
      {NAV_GROUPS.map((group) => (
        <div key={group.groupTitle} className="space-y-1">
          {!collapsed ? (
            <div className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {group.groupTitle}
            </div>
          ) : (
            <div className="my-1.5 border-t border-slate-100" />
          )}

          <div className="space-y-0.5">
            {group.items.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : !item.external && pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noreferrer" : undefined}
                  onClick={() => setMobileMenuOpen(false)}
                  title={collapsed ? item.name : undefined}
                  className={`flex items-center rounded-lg text-xs font-semibold transition-all group ${
                    collapsed
                      ? "justify-center p-2.5"
                      : "justify-between px-3 py-2"
                  } ${
                    isActive
                      ? "bg-[#115eff] text-white shadow-xs"
                      : "text-[#004776] hover:bg-[#eff6ff] hover:text-[#115eff]"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={`size-4 shrink-0 transition-colors ${
                        isActive
                          ? "text-white"
                          : "text-slate-500 group-hover:text-[#115eff]"
                      }`}
                    />
                    {!collapsed && <span className="truncate">{item.name}</span>}
                  </div>

                  {!collapsed && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      {item.badge && (
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-medium ${
                            isActive
                              ? "bg-white/20 text-white"
                              : "bg-[#eff6ff] text-[#115eff] border border-[#dbeafe]"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                      {item.external && (
                        <ExternalLink
                          className={`size-3 ${
                            isActive ? "text-white/70" : "text-slate-400"
                          }`}
                        />
                      )}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="admin-page-root no-page-borders min-h-screen bg-slate-50 text-[#004776] flex flex-col md:flex-row antialiased">
      {/* ── Mobile Top Header (only on mobile screens < md) ── */}
      <div className="md:hidden sticky top-0 z-40 h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between shadow-2xs">
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="size-8 rounded-lg bg-gradient-to-br from-[#005496] to-[#115eff] text-white flex items-center justify-center shadow-xs">
            <Shield className="size-4" />
          </div>
          <span className="font-extrabold text-sm text-[#005496] tracking-tight">
            IEEE SMC 2027
          </span>
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

      {/* ── Mobile Drawer (Slide-in menu) ── */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] bg-white h-full flex flex-col shadow-2xl z-10">
            {/* Drawer Header */}
            <div className="h-14 px-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-lg bg-gradient-to-br from-[#005496] to-[#115eff] text-white flex items-center justify-center shadow-xs">
                  <Shield className="size-4" />
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-sm text-[#005496]">IEEE SMC 2027</span>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">HCMUTE Admin</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Drawer Nav Items */}
            {renderNavItems(false)}

            {/* Drawer User Footer */}
            <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="size-8 rounded-full bg-gradient-to-br from-[#005496] to-[#115eff] text-white text-xs font-bold flex items-center justify-center shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold truncate text-[#004776]">{user.name}</span>
                  <span className="text-[10px] text-slate-500 truncate">{user.email}</span>
                </div>
              </div>
              <form action="/api/auth/logout" method="POST">
                <button
                  type="submit"
                  title="Sign out"
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md cursor-pointer"
                >
                  <LogOut className="size-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── Desktop Permanent Sidebar with Collapse Toggle (md+) ── */}
      <aside
        className={`hidden md:flex shrink-0 flex-col bg-white border-r border-slate-200 min-h-screen sticky top-0 h-screen z-30 transition-[width] duration-300 ease-in-out ${
          isCollapsed ? "w-[70px]" : "w-64"
        }`}
      >
        {/* Brand Header & Chevron Toggle */}
        <div
          className={`h-14 border-b border-slate-200 flex items-center transition-all ${
            isCollapsed ? "justify-center px-2" : "justify-between px-3.5"
          }`}
        >
          <Link
            href="/admin"
            className="flex items-center gap-2.5 min-w-0 overflow-hidden"
            title={isCollapsed ? "IEEE SMC 2027 Admin Console" : undefined}
          >
            <div className="size-8 rounded-lg bg-gradient-to-br from-[#005496] to-[#115eff] text-white flex items-center justify-center shadow-xs shrink-0">
              <Shield className="size-4" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-extrabold text-sm text-[#005496] tracking-tight leading-tight truncate">
                  IEEE SMC 2027
                </span>
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider truncate">
                  HCMUTE Admin
                </span>
              </div>
            )}
          </Link>

          {!isCollapsed && (
            <button
              type="button"
              onClick={toggleCollapse}
              className="p-1.5 rounded-md text-slate-400 hover:text-[#115eff] hover:bg-[#eff6ff] transition-colors cursor-pointer shrink-0"
              title="Collapse sidebar"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="size-4" />
            </button>
          )}
        </div>

        {/* Desktop Nav Items */}
        {renderNavItems(isCollapsed)}

        {/* Desktop User Footer */}
        <div className="p-2.5 border-t border-slate-200 bg-slate-50/70 flex flex-col gap-2">
          {isCollapsed ? (
            <div className="flex flex-col items-center gap-2">
              <div
                className="size-8 rounded-full bg-gradient-to-br from-[#005496] to-[#115eff] text-white text-xs font-bold flex items-center justify-center shrink-0 cursor-default"
                title={`${user.name} (${user.email})`}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
              <button
                type="button"
                onClick={toggleCollapse}
                className="p-1.5 rounded-md text-slate-400 hover:text-[#115eff] hover:bg-white transition-colors cursor-pointer"
                title="Expand sidebar"
                aria-label="Expand sidebar"
              >
                <ChevronRight className="size-4" />
              </button>
              <form action="/api/auth/logout" method="POST">
                <button
                  type="submit"
                  title="Sign Out"
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                >
                  <LogOut className="size-4" />
                </button>
              </form>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2 min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <div className="size-8 rounded-full bg-gradient-to-br from-[#005496] to-[#115eff] text-white text-xs font-bold flex items-center justify-center shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-[#004776] truncate">{user.name}</span>
                  <span className="text-[10px] text-slate-500 truncate">{user.email}</span>
                </div>
              </div>

              <form action="/api/auth/logout" method="POST">
                <button
                  type="submit"
                  title="Sign Out"
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                >
                  <LogOut className="size-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main Viewport Area (smoothly resizes when sidebar expands/collapses) ── */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen transition-all duration-300 ease-in-out">
        {/* Desktop Top Header Bar */}
        <header className="hidden md:flex h-14 bg-white/95 backdrop-blur-xs border-b border-slate-200 px-6 items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            {isCollapsed && (
              <button
                type="button"
                onClick={toggleCollapse}
                className="p-1.5 -ml-2 rounded-md text-slate-400 hover:text-[#115eff] hover:bg-[#eff6ff] transition-colors cursor-pointer"
                title="Expand sidebar"
                aria-label="Expand sidebar"
              >
                <ChevronRight className="size-4" />
              </button>
            )}

            <div className="flex items-center gap-2 text-xs">
              <Link
                href="/admin"
                className="text-slate-500 hover:text-[#115eff] transition-colors font-medium"
              >
                Console
              </Link>
              <span className="text-slate-300">/</span>
              <span className="font-bold text-[#005496]">{getPageTitle()}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#eff6ff] text-[#115eff] border border-[#dbeafe] text-[11px] font-semibold">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>HCMUTE System Live</span>
            </div>

            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#004776] hover:text-[#115eff] bg-white hover:bg-[#eff6ff] border border-slate-200 hover:border-[#dbeafe] rounded-md transition-colors shadow-2xs"
            >
              <span>Conference Website</span>
              <ExternalLink className="size-3 text-slate-400" />
            </Link>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default SimpleAdminLayout;
