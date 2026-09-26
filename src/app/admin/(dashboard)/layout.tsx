import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import {
  ExternalLink,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { AdminNavClient } from "./components/AdminNavClient";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans flex flex-col">
      {/* Admin Topbar */}
      <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200 shadow-2xs">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          
          {/* Left: Brand & Badges */}
          <div className="flex items-center gap-6">
            <Link href="/admin" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-lg bg-[#115eff] text-white flex items-center justify-center font-black shadow-xs group-hover:bg-[#0a4de6] transition-colors">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black text-slate-900 leading-tight tracking-tight">
                  IEEE SMC 2027
                </span>
                <span className="text-[11px] font-bold text-[#115eff] tracking-wide uppercase">
                  CMS Admin Portal
                </span>
              </div>
            </Link>

            {/* Navigation Tabs */}
            <AdminNavClient />
          </div>

          {/* Right: Public Site link & User Info with Logout */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-md transition-colors"
            >
              <span>Xem trang ngoài</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <div className="h-6 w-[1px] bg-slate-200 hidden sm:block" />

            {/* User Profile & Logout Client */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2.5 text-left">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full border border-slate-200 object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-[#115eff] font-bold text-xs flex items-center justify-center border border-blue-200">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="hidden md:flex flex-col">
                  <span className="text-xs font-bold text-slate-900 leading-snug">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-slate-500 truncate max-w-[140px]">
                    {user.email}
                  </span>
                </div>
              </div>

              <form action="/api/auth/logout" method="POST">
                <button
                  type="submit"
                  title="Đăng xuất"
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </form>
            </div>

          </div>

        </div>
      </header>

      {/* Main Admin Content Body */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
