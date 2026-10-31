"use client";

import React, { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Send,
  Image as ImageIcon,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
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
  const [coverImgError, setCoverImgError] = useState(false);

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
          toast.error(data.error || "Post not found");
        }
      })
      .catch((err) => {
        toast.error(err.message || "Failed to load post data");
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
      const uploadedUrl = data.url || data.data?.url || data.data?.proxyUrl;
      if (uploadedUrl) {
        setCoverImage(uploadedUrl);
        setCoverImgError(false);
        toast.success("Cover image uploaded successfully");
      } else {
        toast.error(data.error || "Failed to upload cover image");
      }
    } catch {
      toast.error("Unable to upload cover image");
    } finally {
      setUploadingCover(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleUpdate = async (newStatus?: "DRAFT" | "PUBLISHED") => {
    if (!title.trim()) {
      toast.error("Please enter a post title");
      return;
    }
    if (!content.trim() || content === "<p></p>") {
      toast.error("Please enter post content");
      return;
    }

    setLoading(true);
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
      toast.success("Post updated successfully");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save post";
      toast.error(message);
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
        toast.success("Post deleted successfully");
        router.push("/admin/posts");
      } else {
        toast.error("Failed to delete post");
      }
    } catch {
      toast.error("Unable to connect to server");
    }
  };

  if (pageLoading) {
    return (
      <div className="py-24 text-center text-slate-500 text-xs flex flex-col items-center gap-3 font-sans">
        <RefreshCw className="size-5 animate-spin text-[#115eff]" />
        <span>Loading post details...</span>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/posts"
            className="p-1.5 text-slate-500 hover:text-[#115eff] hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                Edit Post
              </h1>
              <span
                className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                  status === "PUBLISHED"
                    ? "bg-slate-50 text-[#115eff] border-slate-200"
                    : "bg-slate-50 text-slate-600 border-slate-200"
                }`}
              >
                {status === "PUBLISHED" ? "Published" : "Draft"}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Update content, cover image, and category for this conference post
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDelete}
            className="h-8 inline-flex items-center gap-1.5 px-3 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200 transition-colors cursor-pointer"
            title="Delete post"
          >
            <Trash2 className="size-3.5" />
            <span>Delete</span>
          </button>

          {status === "PUBLISHED" ? (
            <button
              type="button"
              onClick={() => handleUpdate("DRAFT")}
              disabled={loading}
              className="h-8 inline-flex items-center gap-1.5 px-3 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium border border-slate-200 transition-colors cursor-pointer"
            >
              <span>Set Draft</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleUpdate("PUBLISHED")}
              disabled={loading}
              className="h-8 inline-flex items-center gap-1.5 px-3 rounded-lg bg-[#115eff] hover:bg-[#0a4de6] text-white text-xs font-medium border border-transparent transition-colors cursor-pointer"
            >
              <Send className="size-3.5" />
              <span>Publish</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => handleUpdate()}
            disabled={loading}
            className="h-8 inline-flex items-center gap-1.5 px-3.5 rounded-lg bg-[#115eff] hover:bg-[#0a4de6] text-white text-xs font-medium border border-transparent transition-colors cursor-pointer"
          >
            <Save className="size-3.5" />
            <span>{loading ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>
      </div>

      {/* Main Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: Main Editor */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Post Title *
              </label>
              <input
                type="text"
                required
                placeholder="Enter conference announcement title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full h-8 px-3 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#115eff] focus:bg-white font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                URL Slug
              </label>
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2.5 h-8 text-xs text-slate-500">
                <span className="font-mono text-[11px]">/posts/</span>
                <input
                  type="text"
                  placeholder="post-url-slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full py-1 pl-1 bg-transparent focus:outline-none text-slate-800 font-mono text-[11px]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Summary
              </label>
              <textarea
                rows={2}
                placeholder="Short excerpt displayed on the homepage and news list..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="w-full p-2.5 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#115eff] focus:bg-white resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* Tiptap Rich Text Editor */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
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
        <div className="space-y-4">
          {/* Post Settings */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
            <h3 className="text-xs font-semibold text-slate-800 pb-2 border-b border-slate-100">
              Post Settings
            </h3>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-8 px-2.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#115eff] focus:bg-white cursor-pointer"
              >
                <option value="Announcements">Announcements</option>
                <option value="Call for Papers">Call for Papers</option>
                <option value="Keynotes & Speakers">Keynotes &amp; Speakers</option>
                <option value="Workshops">Workshops</option>
                <option value="General News">General News</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as "DRAFT" | "PUBLISHED")}
                className="w-full h-8 px-2.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#115eff] focus:bg-white cursor-pointer"
              >
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
              </select>
            </div>
          </div>

          {/* Featured Image */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
            <h3 className="text-xs font-semibold text-slate-800 pb-2 border-b border-slate-100">
              Cover Image
            </h3>

            {coverImage ? (
              <div className="space-y-2.5">
                <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-200 group bg-slate-100">
                  {!coverImgError ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={coverImage}
                      alt="Cover preview"
                      className="w-full h-full object-cover"
                      onError={() => setCoverImgError(true)}
                    />
                  ) : (
                    <div className="size-full flex flex-col items-center justify-center gap-1 text-slate-400 bg-slate-100">
                      <ImageIcon className="size-6 text-slate-300" />
                      <span className="text-[10px] font-medium">Image not found</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setCoverImage("");
                        setCoverImgError(false);
                      }}
                      className="h-7 px-2.5 bg-white text-slate-800 hover:bg-slate-100 rounded-md text-xs font-medium border border-slate-200 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="Or paste direct image URL..."
                  value={coverImage}
                  onChange={(e) => {
                    setCoverImage(e.target.value);
                    setCoverImgError(false);
                  }}
                  className="w-full h-8 px-2.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#115eff] focus:bg-white"
                />
              </div>
            ) : (
              <div className="space-y-2.5">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 hover:border-[#115eff] bg-slate-50 hover:bg-blue-50/40 rounded-xl p-5 text-center cursor-pointer transition-colors"
                >
                  <div className="size-9 rounded-full bg-blue-50 text-[#115eff] flex items-center justify-center mx-auto mb-2 border border-blue-100">
                    <ImageIcon className="size-4.5" />
                  </div>
                  <p className="text-xs font-semibold text-slate-700">
                    {uploadingCover ? "Uploading image..." : "Upload from computer"}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
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
                  <div className="relative flex justify-center text-[10px]">
                    <span className="bg-white px-2 text-slate-400 font-medium">Or</span>
                  </div>
                </div>

                <input
                  type="text"
                  placeholder="Paste image URL..."
                  value={coverImage}
                  onChange={(e) => {
                    setCoverImage(e.target.value);
                    setCoverImgError(false);
                  }}
                  className="w-full h-8 px-2.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#115eff] focus:bg-white"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
