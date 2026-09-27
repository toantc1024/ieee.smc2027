"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Plus,
  Search,
  ExternalLink,
  Edit,
  Trash2,
  Eye,
  Check,
  AlertCircle,
  RefreshCw,
  Calendar,
} from "lucide-react";

interface PostItem {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  category: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  views: number;
  createdAt: string;
  author?: {
    name: string;
    email: string;
  } | null;
}

export default function PostsManagementPage() {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [actionLoading, setActionLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/posts");
      const data = await res.json();
      if (data.posts) {
        setPosts(data.posts);
      }
    } catch {
      setStatusMessage({ type: "error", text: "Không thể tải danh sách bài viết" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDeletePost = async (id: string, title: string) => {
    if (!confirm(`Bạn có chắc muốn xóa bài viết "${title}"?`)) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/posts/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Lỗi xóa bài viết");
      setStatusMessage({ type: "success", text: "Đã xóa bài viết thành công!" });
      fetchPosts();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Lỗi khi xóa bài viết";
      setStatusMessage({ type: "error", text: message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/posts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Lỗi cập nhật trạng thái");
      setStatusMessage({
        type: "success",
        text: `Đã chuyển trạng thái sang ${nextStatus}!`,
      });
      fetchPosts();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Lỗi khi cập nhật";
      setStatusMessage({ type: "error", text: message });
    } finally {
      setActionLoading(false);
    }
  };

  const filteredPosts = posts.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#004776] flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-[#115eff]" />
            <span>Quản Lý Bài Viết & Thông Báo (Posts)</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Soạn thảo và đăng thông báo hội nghị với trình biên tập Tiptap và hỗ trợ tải ảnh trực tiếp
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchPosts}
            disabled={loading}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer"
            title="Làm mới"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <Link
            href="/admin/posts/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#115eff] hover:bg-[#0a4de6] text-white font-bold text-xs sm:text-sm rounded-[0.26rem] shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Viết Bài Mới (Tiptap)</span>
          </Link>
        </div>
      </div>

      {/* Status Notice */}
      {statusMessage && (
        <div
          className={`p-4 rounded-lg flex items-center justify-between gap-3 text-xs sm:text-sm ${
            statusMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === "success" ? (
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-xs font-bold hover:underline cursor-pointer"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tiêu đề bài viết hoặc slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-[#115eff] focus:bg-white transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
            Trạng thái:
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-[#115eff] text-[#004776]"
          >
            <option value="ALL">Tất cả ({posts.length})</option>
            <option value="PUBLISHED">
              Đã xuất bản ({posts.filter((p) => p.status === "PUBLISHED").length})
            </option>
            <option value="DRAFT">
              Bản nháp ({posts.filter((p) => p.status === "DRAFT").length})
            </option>
          </select>
        </div>
      </div>

      {/* Posts Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-[#004776] border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Tiêu đề bài viết</th>
                <th className="py-3.5 px-4">Chuyên mục</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-4">Lượt xem</th>
                <th className="py-3.5 px-4">Ngày tạo</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-[#115eff]" />
                      <span>Đang tải danh sách bài viết...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredPosts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    Chưa có bài viết nào. Hãy bấm &ldquo;Viết Bài Mới&rdquo; để thêm!
                  </td>
                </tr>
              ) : (
                filteredPosts.map((post) => (
                  <tr
                    key={post.id}
                    className="hover:bg-blue-50/30 transition-colors"
                  >
                    <td className="py-3.5 px-4 sm:px-6 max-w-md">
                      <div className="flex flex-col">
                        <Link
                          href={`/admin/posts/${post.id}`}
                          className="font-bold text-[#004776] hover:text-[#115eff] transition-colors leading-snug line-clamp-2"
                        >
                          {post.title}
                        </Link>
                        <span className="text-xs text-slate-400 font-mono mt-0.5 truncate">
                          /{post.slug}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-[#115eff] font-bold text-xs border border-blue-200/80">
                        {post.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleStatus(post.id, post.status)}
                        disabled={actionLoading}
                        className={`px-2.5 py-1 rounded text-xs font-bold uppercase transition-colors cursor-pointer border ${
                          post.status === "PUBLISHED"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                            : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                        }`}
                        title="Bấm để đổi trạng thái"
                      >
                        {post.status === "PUBLISHED" ? "Đã đăng" : "Bản nháp"}
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-xs font-semibold text-slate-600">
                      <span className="inline-flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                        <span>{post.views}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(post.createdAt).toLocaleDateString("vi-VN")}
                    </td>

                    <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <Link
                          href={`/admin/posts/${post.id}`}
                          className="p-1.5 text-slate-500 hover:text-[#115eff] hover:bg-slate-100 rounded transition-colors"
                          title="Chỉnh sửa bài viết"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>

                        <button
                          onClick={() => handleDeletePost(post.id, post.title)}
                          disabled={actionLoading}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                          title="Xóa bài viết"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
