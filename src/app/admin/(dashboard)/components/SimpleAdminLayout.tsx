"use client";

import React, { useState } from "react";
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

  const renderNavList = () => (
    <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
      {NAV_GROUPS.map((group) => (
        <div key={group.groupTitle} className="space-y-1">
          <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {group.groupTitle}
          </div>
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
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    isActive
                      ? "bg-[#005496] text-white shadow-xs"
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={`size-4 shrink-0 ${
                        isActive ? "text-white" : "text-slate-500"
                      }`}
                    />
                    <span className="truncate">{item.name}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {item.badge && (
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-medium ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-blue-50 text-[#005496]"
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
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="admin-page-root no-page-borders min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row antialiased">
      {/* ── Mobile Top Header (only on mobile screens < md) ── */}
      <div className="md:hidden sticky top-0 z-40 h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="size-8 rounded-lg bg-[#005496] text-white flex items-center justify-center shadow-xs">
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
                <div className="size-8 rounded-lg bg-[#005496] text-white flex items-center justify-center">
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
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Drawer Nav Items */}
            {renderNavList()}

            {/* Drawer User Footer */}
            <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
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

      {/* ── Desktop Permanent Sidebar (w-64 on md+) ── */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col bg-white border-r border-slate-200 min-h-screen sticky top-0 h-screen z-30">
        {/* Brand Header */}
        <div className="h-14 px-4 border-b border-slate-200 flex items-center gap-2.5">
          <div className="size-8 rounded-lg bg-[#005496] text-white flex items-center justify-center shadow-xs shrink-0">
            <Shield className="size-4" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-extrabold text-sm text-[#005496] tracking-tight leading-tight">
              IEEE SMC 2027
            </span>
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
              HCMUTE Admin
            </span>
          </div>
        </div>

        {/* Desktop Nav Items */}
        {renderNavList()}

        {/* Desktop User Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="size-8 rounded-full bg-[#005496] text-white text-xs font-bold flex items-center justify-center shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-slate-900 truncate">{user.name}</span>
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
      </aside>

      {/* ── Main Viewport Area ── */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Desktop Top Header Bar */}
        <header className="hidden md:flex h-14 bg-white border-b border-slate-200 px-6 items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Administration</span>
            <span className="text-xs text-slate-300">/</span>
            <span className="text-xs font-bold text-[#005496]">{getPageTitle()}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>System Live</span>
            </div>

            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-[#005496] bg-white hover:bg-slate-50 border border-slate-200 rounded-md transition-colors"
            >
              <span>View Website</span>
              <ExternalLink className="size-3 text-slate-400" />
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default SimpleAdminLayout;
