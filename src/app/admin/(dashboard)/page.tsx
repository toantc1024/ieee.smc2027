import React from "react";
import Link from "next/link";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import {
  PanelTop,
  Layers,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Database,
  Globe,
  SlidersHorizontal,
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
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900 via-[#115eff] to-blue-600 text-white p-7 sm:p-9 shadow-md">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-xs font-bold uppercase tracking-wider text-blue-100">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Hệ Thống Quản Trị IEEE SMC 2027</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">
            Xin chào, {user?.name || "Quản trị viên"}!
          </h1>

          <p className="text-sm sm:text-base text-blue-100 leading-relaxed font-normal">
            Chào mừng bạn đến với bảng điều khiển CMS. Bạn có thể chỉnh sửa thanh Header, tùy biến bố cục trang kéo thả (Drag & Drop) và cấu hình dữ liệu hội nghị trực tiếp với Neon Database.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              href="/admin/pages/home"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-[#115eff] hover:bg-blue-50 font-bold text-xs sm:text-sm rounded-md transition-colors shadow-xs"
            >
              <Layers className="w-4 h-4" />
              <span>Chỉnh sửa Trang Chủ (Drag & Drop)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/admin/header"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/15 hover:bg-white/25 text-white font-semibold text-xs sm:text-sm rounded-md border border-white/20 transition-colors backdrop-blur-xs"
            >
              <PanelTop className="w-4 h-4" />
              <span>Chỉnh sửa Header</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Action Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1: Header Builder */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-7 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#115eff] flex items-center justify-center border border-blue-100 group-hover:scale-105 transition-transform">
              <PanelTop className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Sửa Thanh Điều Hướng (Header)
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Tùy biến thanh thông báo tiện ích trên cùng, hotline, email liên hệ, danh sách menu điều hướng, nút Call-To-Action (PaperCept) và xem trước trực tiếp (Live Preview).
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Lưu vào Neon PostgreSQL</span>
            <Link
              href="/admin/header"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#115eff] hover:underline"
            >
              <span>Mở trình sửa Header</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Card 2: Drag & Drop Page Builder */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-7 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 group-hover:scale-105 transition-transform">
              <Layers className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Quản Lý Trang Kéo Thả (Page Builder)
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Kế thừa logic Drag & Drop và JSON Schema từ HCMUTE CMS: Thêm khối Hero Carousel, Call for Papers, Timeline, Tracks, FAQ, đổi thứ tự, sửa nội dung và lưu thời gian thực.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">{pages.length} trang đã tạo</span>
            <Link
              href="/admin/pages"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#115eff] hover:underline"
            >
              <span>Quản lý các trang</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>

      {/* Pages Table Overview */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Danh Sách Trang Web</h3>
            <p className="text-xs text-slate-500">Các trang có thể chỉnh sửa trực tiếp bằng Drag & Drop</p>
          </div>
          <Link
            href="/admin/pages"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#115eff] hover:underline"
          >
            <span>Xem tất cả</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-slate-200">
          {pages.map((p: AdminPageSummary) => (
            <div
              key={p.id}
              className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <span className="font-bold text-slate-900 text-sm">{p.title}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-[#115eff] font-mono font-medium">
                    /{p.slug === "home" ? "" : p.slug}
                  </span>
                  {p.is_published && (
                    <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Công khai
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500">
                  {p.block_count || 0} khối component • Cập nhật lần cuối: {p.updated_at ? new Date(p.updated_at).toLocaleDateString("vi-VN") : "Hôm nay"}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/pages/${p.id}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#115eff] hover:bg-[#0a4de6] text-white text-xs font-bold rounded-md transition-colors shadow-2xs"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Mở Trình Kéo Thả</span>
                </Link>

                <Link
                  href={p.slug === "home" ? "/" : `/${p.slug}`}
                  target="_blank"
                  className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                  title="Xem trang ngoài"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Status Footprint */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-600" />
            <span>Neon Database: <strong>Đã kết nối</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#115eff]" />
            <span>Next.js 16 + React 19 App Router</span>
          </div>
        </div>

        <div className="text-slate-400">
          IEEE SMC 2027 • Human-AI Symbiosis
        </div>
      </div>
    </div>
  );
}
