"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Layers,
  Plus,
  RefreshCw,
  ExternalLink,
  Trash2,
  SlidersHorizontal,
} from "lucide-react";

interface PageSummary {
  id: string;
  slug: string;
  title: string;
  is_published: boolean;
  block_count?: number;
  updated_at: string;
}

export default function PagesManagementPage() {
  const [pages, setPages] = useState<PageSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchPages = () => {
    fetch("/api/admin/pages")
      .then((res) => res.json())
      .then((res) => {
        if (res.pages) setPages(res.pages);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setCreating(true);
    try {
      const res = await fetch("/api/admin/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          slug: newSlug.trim() || newTitle.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-"),
          blocks: [
            {
              id: `hero-${Date.now()}`,
              type: "HeroCarousel",
              props: {},
              hidden: false,
            },
          ],
        }),
      });

      if (res.ok) {
        setCreateModalOpen(false);
        setNewTitle("");
        setNewSlug("");
        fetchPages();
      } else {
        const err = await res.json();
        alert(err.error || "Lỗi tạo trang");
      }
    } catch {
      alert("Lỗi kết nối máy chủ");
    } finally {
      setCreating(false);
    }
  };

  const handleDeletePage = async (id: string, title: string) => {
    if (!confirm(`Bạn có chắc muốn xóa trang "${title}"?`)) return;

    try {
      const res = await fetch(`/api/admin/pages/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchPages();
      } else {
        const err = await res.json();
        alert(err.error || "Không thể xóa trang");
      }
    } catch {
      alert("Lỗi xóa trang");
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-[#115eff] text-xs font-bold uppercase tracking-wider mb-1">
            <Layers className="w-3.5 h-3.5" />
            <span>Quản Lý Nội Dung Các Trang</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Danh Sách Trang (Drag & Drop Pages)
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Tạo và chỉnh sửa bố cục trang bằng trình kéo thả (Page Builder) và cấu trúc JSON trực tiếp.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#115eff] hover:bg-[#0a4de6] text-white font-bold text-sm rounded-lg shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo trang mới</span>
        </button>
      </div>

      {/* Pages Table Card */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Các trang trong hệ thống ({pages.length})
          </span>
          <button
            onClick={fetchPages}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded transition-colors"
            title="Làm mới"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-500 text-sm flex flex-col items-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-[#115eff]" />
            <span>Đang tải danh sách trang từ Neon DB...</span>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {pages.map((p) => (
              <div
                key={p.id}
                className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="font-extrabold text-slate-900 text-sm">
                      {p.title}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-[#115eff] font-mono font-medium">
                      /{p.slug === "home" ? "" : p.slug}
                    </span>
                    {p.is_published && (
                      <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Đang xuất bản
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-3">
                    <span>{p.block_count || 0} khối component</span>
                    <span>•</span>
                    <span>Cập nhật: {new Date(p.updated_at).toLocaleDateString("vi-VN")}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/pages/${p.id}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#115eff] hover:bg-[#0a4de6] text-white text-xs font-bold rounded-md transition-colors shadow-2xs"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Sửa Kéo Thả (Builder)</span>
                  </Link>

                  <Link
                    href={p.slug === "home" ? "/" : `/${p.slug}`}
                    target="_blank"
                    className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                    title="Xem trang thực tế"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>

                  {p.slug !== "home" && (
                    <button
                      type="button"
                      onClick={() => handleDeletePage(p.id, p.title)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                      title="Xóa trang"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Tạo Trang Mới */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Tạo Trang Mới</h3>
            <p className="text-xs text-slate-500 mb-4">
              Nhập tiêu đề và đường dẫn (slug) cho trang web của bạn
            </p>

            <form onSubmit={handleCreatePage} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Tiêu đề trang
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => {
                    setNewTitle(e.target.value);
                    if (!newSlug) {
                      setNewSlug(
                        e.target.value
                          .toLowerCase()
                          .normalize("NFD")
                          .replace(/[\u0300-\u036f]/g, "")
                          .replace(/[^a-z0-9]+/g, "-")
                          .replace(/^-+|-+$/g, "")
                      );
                    }
                  }}
                  placeholder="Ví dụ: Chương trình hội thảo"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:border-[#115eff] text-sm text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Đường dẫn (Slug URL)
                </label>
                <div className="flex items-center">
                  <span className="bg-slate-100 border border-r-0 border-slate-300 px-2.5 py-2 rounded-l-md text-slate-500 font-mono text-xs">
                    /
                  </span>
                  <input
                    type="text"
                    required
                    value={newSlug}
                    onChange={(e) => setNewSlug(e.target.value)}
                    placeholder="chuong-trinh-hoi-thao"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-r-md focus:outline-none focus:border-[#115eff] font-mono text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-md transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 bg-[#115eff] hover:bg-[#0a4de6] text-white font-bold rounded-md transition-colors shadow-2xs disabled:opacity-50"
                >
                  {creating ? "Đang tạo..." : "Xác nhận tạo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
