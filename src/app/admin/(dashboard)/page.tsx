import React from "react";
import Link from "next/link";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import {
  PanelTop,
  Layers,
  ArrowRight,
  ExternalLink,
  Database,
  Globe,
  SlidersHorizontal,
  Shield,
  KeyRound,
} from "lucide-react";

interface AdminPageSummary {
  id: string;
  slug: string;
  title: string;
  is_published: boolean;
  block_count?: number;
  updated_at?: string;
}

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();
  const pagesRaw = await sql`
    SELECT id, slug, title, is_published, jsonb_array_length(blocks) as block_count, updated_at
    FROM website_pages
    ORDER BY created_at ASC
  `;
  const pages = pagesRaw as unknown as AdminPageSummary[];

  return (
    <div className="space-y-6 font-sans">
      {/* Welcome Card (Clean shadcn style, zero loud gradients) */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-7 shadow-xs">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
            <Shield className="w-3.5 h-3.5 text-slate-500" />
            <span>Hệ Thống Quản Trị IEEE SMC 2027</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Xin chào, {user?.name || "Quản trị viên"}!
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Hệ thống hỗ trợ quản lý cấu trúc cây trang web (Tree Pages), chỉnh sửa thanh Header, tùy biến khối giao diện kéo thả (Drag & Drop), quản lý tài khoản và cấu hình OAuth đa nền tảng.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-2.5">
            <Link
              href="/admin/pages"
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 font-semibold text-xs sm:text-sm rounded-lg transition-colors shadow-2xs"
            >
              <Layers className="w-4 h-4" />
              <span>Cấu trúc trang (Tree Pages)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/admin/header"
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200/70 text-slate-800 font-medium text-xs sm:text-sm rounded-lg border border-slate-200 transition-colors"
            >
              <PanelTop className="w-4 h-4 text-slate-500" />
              <span>Cấu hình Header</span>
            </Link>

            <Link
              href="/admin/oauth"
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200/70 text-slate-800 font-medium text-xs sm:text-sm rounded-lg border border-slate-200 transition-colors"
            >
              <KeyRound className="w-4 h-4 text-slate-500" />
              <span>OAuth & AI Agent</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Action Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: Tree Pages */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-2.5">
            <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center border border-slate-200">
              <Layers className="w-5 h-5" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Cây Phân Cấp Trang (Tree Pages)
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Tổ chức nội dung đa tầng vô hạn theo mô hình cha - con (Parent - Child). Mỗi trang đều hỗ trợ trình kéo thả linh kiện Page Builder.
            </p>
          </div>

          <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">{pages.length} trang đã tạo</span>
            <Link
              href="/admin/pages"
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-900 hover:underline"
            >
              <span>Xem cấu trúc cây</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Card 2: Header Builder */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-2.5">
            <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center border border-slate-200">
              <PanelTop className="w-5 h-5" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Thanh Header & Menu
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Tùy biến thanh tiện ích, hotline, email liên hệ, liên kết mạng xã hội, danh sách menu điều hướng đa cấp và nút Submit Paper.
            </p>
          </div>

          <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Đồng bộ Neon DB</span>
            <Link
              href="/admin/header"
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-900 hover:underline"
            >
              <span>Mở trình sửa Header</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Pages Table Overview */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Danh Sách Trang Web</h3>
            <p className="text-xs text-slate-400">Các trang hiện có trong hệ thống</p>
          </div>
          <Link
            href="/admin/pages"
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-800 hover:underline"
          >
            <span>Mở giao diện Tree</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {pages.map((p: AdminPageSummary) => (
            <div
              key={p.id}
              className="px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900">{p.title}</span>
                  <span className="font-mono text-[11px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                    /{p.slug === "home" ? "" : p.slug}
                  </span>
                  {p.is_published && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 font-medium inline-flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Xuất bản
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400">
                  {p.block_count || 0} component • Cập nhật: {p.updated_at ? new Date(p.updated_at).toLocaleDateString("vi-VN") : "Hôm nay"}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/pages/${p.id}`}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded transition-colors shadow-2xs text-[11px]"
                >
                  <SlidersHorizontal className="w-3 h-3" />
                  <span>Sửa Builder</span>
                </Link>

                <Link
                  href={p.slug === "home" ? "/" : `/${p.slug}`}
                  target="_blank"
                  className="p-1 text-slate-400 hover:text-slate-900 rounded hover:bg-slate-100 transition-colors"
                  title="Xem trang ngoài"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Status Footprint */}
      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span>Neon PostgreSQL: <strong className="text-slate-800">Online</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span>Next.js 16 + React 19</span>
          </div>
        </div>

        <div className="text-slate-400 text-[11px]">
          IEEE SMC 2027 • Admin Portal
        </div>
      </div>
    </div>
  );
}
