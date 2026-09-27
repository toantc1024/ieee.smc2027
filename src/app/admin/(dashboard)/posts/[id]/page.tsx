"use client";

import React, { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Send,
  Upload,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Trash2,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { TiptapEditor } from "@/components/admin/TiptapEditor";

export default function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [category, setCategory] = useState("Announcements");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">("PUBLISHED");

  const [pageLoading, setPageLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/posts/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.post) {
          setTitle(data.post.title || "");
          setSlug(data.post.slug || "");
          setSummary(data.post.summary || "");
          setContent(data.post.content || "");
          setCoverImage(data.post.coverImage || "");
          setCategory(data.post.category || "Announcements");
          setStatus(data.post.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT");
        } else {
          setError(data.error || "Không tìm thấy bài viết");
        }
      })
      .catch((err) => {
        setError(err.message || "Lỗi tải dữ liệu bài viết");
      })
      .finally(() => setPageLoading(false));
  }, [id]);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.url) {
        setCoverImage(data.url);
      } else {
        alert(data.error || "Lỗi tải ảnh bìa");
      }
    } catch {
      alert("Không thể tải ảnh bìa lên");
    } finally {
      setUploadingCover(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleUpdate = async (newStatus?: "DRAFT" | "PUBLISHED") => {
    if (!title.trim()) {
      setError("Vui lòng nhập tiêu đề bài viết");
      return;
    }
    if (!content.trim() || content === "<p></p>") {
      setError("Vui lòng nhập nội dung bài viết");
      return;
    }

    setLoading(true);
    setError(null);
    setSavedSuccess(false);

    const submitStatus = newStatus || status;

    try {
      const res = await fetch(`/api/admin/posts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          slug: slug.trim(),
          summary: summary.trim(),
          content,
          coverImage: coverImage.trim() || null,
          category,
          status: submitStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Lỗi cập nhật bài viết");
      }

      setStatus(submitStatus);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Lỗi lưu bài viết";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Bạn có chắc chắn muốn xóa bài viết này không? Hành động này không thể hoàn tác.")) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/posts/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/admin/posts");
      } else {
        alert("Lỗi khi xóa bài viết");
      }
    } catch {
      alert("Không thể kết nối đến máy chủ");
    }
  };

  if (pageLoading) {
    return (
      <div className="py-24 text-center text-slate-500 text-sm flex flex-col items-center gap-3">
        <RefreshCw className="w-6 h-6 animate-spin text-[#115eff]" />
        <span>Đang tải thông tin bài viết...</span>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/posts"
            className="p-2 text-slate-500 hover:text-[#115eff] hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-[#004776]">
                Chỉnh Sửa Bài Viết
              </h1>
              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                  status === "PUBLISHED"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {status === "PUBLISHED" ? "Đã Xuất Bản" : "Bản Nháp"}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Cập nhật nội dung, hình ảnh và phân loại cho bài viết hội nghị
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[0.26rem] bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors cursor-pointer"
            title="Xóa bài viết"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Xóa</span>
          </button>

          {status === "PUBLISHED" ? (
            <button
              type="button"
              onClick={() => handleUpdate("DRAFT")}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[0.26rem] bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              <span>Chuyển Nháp</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleUpdate("PUBLISHED")}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[0.26rem] bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Xuất Bản Ngay</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => handleUpdate()}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[0.26rem] bg-[#115eff] hover:bg-[#0a4de6] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            {savedSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                <span>Đã lưu!</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>{loading ? "Đang lưu..." : "Cập Nhật"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Main Editor */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Tiêu đề bài viết *
              </label>
              <input
                type="text"
                required
                placeholder="Nhập tiêu đề thông báo hội nghị..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 text-base font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-[#115eff] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Đường dẫn slug
              </label>
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-md px-3 text-xs text-slate-500 font-mono">
                <span>/posts/</span>
                <input
                  type="text"
                  placeholder="duong-dan-bai-viet"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full py-2 pl-1 bg-transparent focus:outline-none text-slate-800 font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Tóm tắt ngắn (Summary)
              </label>
              <textarea
                rows={2}
                placeholder="Tóm tắt 1-2 câu hiển thị ở danh sách bài viết..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="w-full px-3.5 py-2 text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-[#115eff] focus:bg-white resize-none"
              />
            </div>
          </div>

          {/* Tiptap Rich Text Editor */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Nội dung bài viết (Tiptap Rich Text Editor) *
            </label>
            <TiptapEditor
              content={content}
              onChange={setContent}
              placeholder="Bắt đầu nhập nội dung bài viết, chèn ảnh, đề mục..."
            />
          </div>
        </div>

        {/* Right 1 Col: Metadata & Publishing Details */}
        <div className="space-y-5">
          {/* Post Settings */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 pb-2 border-b border-slate-100">
              Cài đặt bài viết
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Danh mục (Category)
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-[#115eff]"
              >
                <option value="Announcements">Thông Báo Hội Nghị (Announcements)</option>
                <option value="Call for Papers">Kêu Gọi Nộp Bài (Call for Papers)</option>
                <option value="Keynote Speakers">Diễn Giả Chính (Keynote Speakers)</option>
                <option value="Workshops">Phiên Hội Thảo (Workshops)</option>
                <option value="Venue & Travel">Địa Điểm & Visa (Venue & Travel)</option>
                <option value="Registration">Đăng Ký & Học Phí (Registration)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Trạng thái (Status)
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as "DRAFT" | "PUBLISHED")}
                className="w-full px-3 py-2 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-[#115eff]"
              >
                <option value="PUBLISHED">Xuất bản công khai (PUBLISHED)</option>
                <option value="DRAFT">Lưu nháp nội bộ (DRAFT)</option>
              </select>
            </div>
          </div>

          {/* Featured Image */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 pb-2 border-b border-slate-100">
              Ảnh bìa bài viết (Cover Image)
            </h3>

            {coverImage ? (
              <div className="space-y-3">
                <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-200 group bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={coverImage}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCoverImage("")}
                      className="p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-bold"
                    >
                      Gỡ ảnh
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="Hoặc dán URL ảnh trực tiếp..."
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-[#115eff]"
                />
              </div>
            ) : (
              <div className="space-y-3">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 hover:border-[#115eff] bg-slate-50 hover:bg-blue-50/50 rounded-xl p-6 text-center cursor-pointer transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-[#115eff] flex items-center justify-center mx-auto mb-2">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-slate-700">
                    {uploadingCover ? "Đang tải ảnh lên..." : "Tải ảnh từ máy tính"}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    PNG, JPG, WebP tối đa 5MB
                  </p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCoverUpload}
                  className="hidden"
                />

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase">
                    <span className="bg-white px-2 text-slate-400 font-bold">Hoặc</span>
                  </div>
                </div>

                <input
                  type="text"
                  placeholder="Dán liên kết ảnh URL..."
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  className="w-full px-3 py-2 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-[#115eff]"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
