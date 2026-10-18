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
          setError(data.error || "Post not found");
        }
      })
      .catch((err) => {
        setError(err.message || "Failed to load post data");
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
        alert(data.error || "Failed to upload cover image");
      }
    } catch {
      alert("Unable to upload cover image");
    } finally {
      setUploadingCover(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleUpdate = async (newStatus?: "DRAFT" | "PUBLISHED") => {
    if (!title.trim()) {
      setError("Please enter a post title");
      return;
    }
    if (!content.trim() || content === "<p></p>") {
      setError("Please enter post content");
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
        throw new Error(data.error || "Failed to update post");
      }

      setStatus(submitStatus);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save post";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/posts/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/admin/posts");
      } else {
        alert("Failed to delete post");
      }
    } catch {
      alert("Unable to connect to server");
    }
  };

  if (pageLoading) {
    return (
      <div className="py-24 text-center text-slate-500 text-sm flex flex-col items-center gap-3">
        <RefreshCw className="w-6 h-6 animate-spin text-[#115eff]" />
        <span>Loading post details...</span>
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
                Edit Post
              </h1>
              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                  status === "PUBLISHED"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {status === "PUBLISHED" ? "Published" : "Draft"}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Update content, cover image, and category for this conference post
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[0.26rem] bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors cursor-pointer"
            title="Delete post"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Delete</span>
          </button>

          {status === "PUBLISHED" ? (
            <button
              type="button"
              onClick={() => handleUpdate("DRAFT")}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[0.26rem] bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              <span>Move to Draft</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleUpdate("PUBLISHED")}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[0.26rem] bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Publish Now</span>
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
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>{loading ? "Saving..." : "Update"}</span>
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
                Post Title *
              </label>
              <input
                type="text"
                required
                placeholder="Enter conference announcement title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 text-base font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-[#115eff] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                URL Slug
              </label>
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-md px-3 text-xs text-slate-500 font-mono">
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
                rows={2}
                placeholder="Short 1-2 sentence excerpt displayed on the posts list..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="w-full px-3.5 py-2 text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-[#115eff] focus:bg-white resize-none"
              />
            </div>
          </div>

          {/* Tiptap Rich Text Editor */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Post Content *
            </label>
            <TiptapEditor
              content={content}
              onChange={setContent}
              placeholder="Start writing your post content, insert images, headings..."
            />
          </div>
        </div>

        {/* Right 1 Col: Metadata & Publishing Details */}
        <div className="space-y-5">
          {/* Post Settings */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 pb-2 border-b border-slate-100">
              Post Settings
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-[#115eff]"
              >
                <option value="Announcements">Announcements</option>
                <option value="Call for Papers">Call for Papers</option>
                <option value="Keynote Speakers">Keynote Speakers</option>
                <option value="Workshops">Workshops</option>
                <option value="Venue & Travel">Venue &amp; Travel</option>
                <option value="Registration">Registration</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as "DRAFT" | "PUBLISHED")}
                className="w-full px-3 py-2 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-[#115eff]"
              >
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
              </select>
            </div>
          </div>

          {/* Featured Image */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 pb-2 border-b border-slate-100">
              Cover Image
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
                      Remove Image
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="Or paste direct image URL..."
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
                    {uploadingCover ? "Uploading image..." : "Upload from computer"}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    PNG, JPG, WebP up to 5MB
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
                    <span className="bg-white px-2 text-slate-400 font-bold">Or</span>
                  </div>
                </div>

                <input
                  type="text"
                  placeholder="Paste image URL..."
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
