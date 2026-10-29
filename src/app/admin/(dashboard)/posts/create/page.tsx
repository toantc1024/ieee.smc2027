"use client";

import React, { useState, useRef } from "react";
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
} from "lucide-react";
import { TiptapEditor } from "@/components/admin/TiptapEditor";

export default function CreatePostPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [category, setCategory] = useState("Announcements");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">("PUBLISHED");

  const [loading, setLoading] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slug) {
      setSlug(
        val
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
      );
    }
  };

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
      const uploadedUrl = data.url || data.data?.url || data.data?.proxyUrl;
      if (uploadedUrl) {
        setCoverImage(uploadedUrl);
      } else {
        alert(data.error || "Failed to upload cover image");
      }
    } catch {
      alert("Unable to upload cover image");
    } finally {
      setUploadingCover(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (submitStatus: "DRAFT" | "PUBLISHED") => {
    if (!title.trim()) {
      setError("Please enter a post title");
      return;
    }
    if (!content.trim() || content === "<p></p>") {
      setError("Please enter post content in the editor");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/posts", {
        method: "POST",
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
        throw new Error(data.error || "Failed to create post");
      }

      router.push("/admin/posts");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save post";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

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
            <h1 className="text-xl font-extrabold text-[#004776]">
              Create New Post
            </h1>
            <p className="text-xs text-slate-500">
              Publish news, submission guidelines, or official announcements for IEEE SMC 2027
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => handleSubmit("DRAFT")}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[0.26rem] bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Draft</span>
          </button>

          <button
            type="button"
            onClick={() => handleSubmit("PUBLISHED")}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[0.26rem] bg-[#115eff] hover:bg-[#0a4de6] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{loading ? "Publishing..." : "Publish Post"}</span>
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
                Post Title *
              </label>
              <input
                type="text"
                required
                placeholder="Enter conference announcement title..."
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full px-3.5 py-2.5 text-base font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-[#115eff] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                URL Slug
              </label>
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-md px-3 text-xs text-slate-500">
                <span>/posts/</span>
                <input
                  type="text"
                  placeholder="post-url-slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full py-2 pl-1 bg-transparent focus:outline-none text-slate-800 font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Summary
              </label>
              <textarea
                rows={3}
                placeholder="Short excerpt displayed on the homepage and news list..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-[#115eff] focus:bg-white leading-relaxed"
              />
            </div>
          </div>

          {/* Tiptap Rich Editor */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Post Content *
              </label>
              <span className="text-[11px] text-slate-400">
                Supports image uploads, headings, lists, and quotes
              </span>
            </div>

            <TiptapEditor
              content={content}
              onChange={setContent}
              placeholder="Start writing your post..."
            />
          </div>
        </div>

        {/* Right Col: Metadata & Cover Image */}
        <div className="space-y-5">
          {/* Cover Image Upload Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Cover Image
            </label>

            {coverImage ? (
              <div className="relative w-full h-44 rounded-lg overflow-hidden border border-slate-200 group">
                <img
                  src={coverImage}
                  alt="Cover preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1.5 bg-white text-xs font-bold rounded shadow-xs cursor-pointer"
                  >
                    Change Image
                  </button>
                  <button
                    type="button"
                    onClick={() => setCoverImage("")}
                    className="px-2.5 py-1.5 bg-rose-600 text-white text-xs font-bold rounded shadow-xs cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-44 border-2 border-dashed border-slate-300 hover:border-[#115eff] bg-slate-50/60 hover:bg-blue-50/20 rounded-lg flex flex-col items-center justify-center gap-2 text-slate-500 cursor-pointer transition-colors"
              >
                <Upload className="w-6 h-6 text-slate-400" />
                <span className="text-xs font-bold text-[#115eff]">
                  {uploadingCover ? "Uploading..." : "Upload from computer"}
                </span>
                <span className="text-[11px] text-slate-400">PNG, JPG, WebP</span>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverUpload}
              className="hidden"
            />

            <div>
              <span className="text-[11px] text-slate-500 block mb-1">
                Or paste direct image URL:
              </span>
              <input
                type="url"
                placeholder="https://example.com/cover.jpg"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-[#115eff]"
              />
            </div>
          </div>

          {/* Taxonomy & Settings Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm font-semibold text-[#004776] bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-[#115eff]"
              >
                <option value="Announcements">Announcements</option>
                <option value="CFP">Call for Papers</option>
                <option value="Venue">Venue &amp; Travel</option>
                <option value="Keynotes">Keynotes &amp; Speakers</option>
                <option value="Workshops">Workshops &amp; Tutorials</option>
                <option value="General">General News</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Publication Status
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setStatus("DRAFT")}
                  className={`p-2.5 rounded border text-xs font-bold cursor-pointer transition-all ${
                    status === "DRAFT"
                      ? "border-amber-400 bg-amber-50 text-amber-800"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Draft
                </button>
                <button
                  type="button"
                  onClick={() => setStatus("PUBLISHED")}
                  className={`p-2.5 rounded border text-xs font-bold cursor-pointer transition-all ${
                    status === "PUBLISHED"
                      ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Published
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
