"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Layers, PanelTop } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    name: "Tổng quan",
    href: "/admin",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    name: "Quản lý trang (Drag & Drop)",
    href: "/admin/pages",
    icon: Layers,
    exact: false,
  },
  {
    name: "Sửa Header",
    href: "/admin/header",
    icon: PanelTop,
    exact: false,
  },
];

export function AdminNavClient() {
  const pathname = usePathname();

  return (
    <nav className="hidden lg:flex items-center gap-1">
      {NAV_ITEMS.map((item) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "inline-flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-md transition-all",
              isActive
                ? "bg-[#115eff] text-white shadow-2xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            )}
          >
            <Icon className="w-4 h-4" />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
