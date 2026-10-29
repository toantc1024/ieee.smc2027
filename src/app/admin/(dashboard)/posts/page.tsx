"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  Search,
  ExternalLink,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  Calendar,
  Database,
  ImageIcon,
} from "lucide-react";
import { ManagementPageHeader } from "@/components/ui/management-page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusAlertBanner } from "@/components/shared/StatusAlertBanner";

interface PostItem {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  content: string;
  coverImage: string | null;
  category: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  views: number;
  publishedAt: string | null;
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
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [actionLoading, setActionLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/posts");
      const data = await res.json();
      if (data.posts) {
        setPosts(data.posts);
      }
    } catch {
      setStatusMessage({ type: "error", text: "Unable to load posts from server" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleSeedDefaultPosts = async () => {
    setActionLoading(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/admin/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "seed" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to seed conference news");
      setStatusMessage({
        type: "success",
        text: "Official conference sample news successfully synchronized!",
      });
      await fetchPosts();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to seed conference news";
      setStatusMessage({ type: "error", text: message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeletePost = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    setActionLoading(true);
    setStatusMessage(null);
    try {
      const res = await fetch(`/api/admin/posts/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete post");
      setStatusMessage({ type: "success", text: "Post deleted successfully!" });
      await fetchPosts();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete post";
      setStatusMessage({ type: "error", text: message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    setActionLoading(true);
    setStatusMessage(null);
    try {
      const res = await fetch(`/api/admin/posts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update status");
      setStatusMessage({
        type: "success",
        text: `Post status updated to ${nextStatus}!`,
      });
      await fetchPosts();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update post";
      setStatusMessage({ type: "error", text: message });
    } finally {
      setActionLoading(false);
    }
  };

  const categories = useMemo(() => {
    const cats = new Set(posts.map((p) => p.category).filter(Boolean));
    return ["ALL", ...Array.from(cats)];
  }, [posts]);

  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      const matchesSearch =
        !searchQuery.trim() ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.summary && p.summary.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
      const matchesCategory = categoryFilter === "ALL" || p.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [posts, searchQuery, statusFilter, categoryFilter]);

  const stats = useMemo(() => {
    const total = posts.length;
    const published = posts.filter((p) => p.status === "PUBLISHED").length;
    const drafts = posts.filter((p) => p.status === "DRAFT").length;
    const views = posts.reduce((acc, curr) => acc + (curr.views || 0), 0);
    return { total, published, drafts, views };
  }, [posts]);

  return (
    <div className="space-y-6">
      {/* ── HCMUTE Standard Management Page Header ── */}
      <ManagementPageHeader
        imageIcon="/assets/3d-icons/news__hcmute-3d-icon.png"
        backgroundImage="/assets/manage-posts-bg.jpg"
        title="Posts & News Management"
        description="Compose, categorize, and publish official conference announcements, news updates, and milestone releases with rich text and MinIO media uploads."
      >
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={fetchPosts}
            disabled={loading}
            className="gap-1.5 bg-white shadow-2xs"
            title="Refresh posts"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSeedDefaultPosts}
            disabled={actionLoading}
            className="gap-1.5 bg-white text-[#005496] hover:text-[#115eff] shadow-2xs"
            title="Synchronize default conference news"
          >
            <Database className="size-3.5 text-[#115eff]" />
            <span>Sync Sample News</span>
          </Button>

          <Link href="/admin/posts/create">
            <Button
              type="button"
              variant="ute"
              size="sm"
              className="gap-1.5 shadow-sm"
            >
              <Plus className="size-4" />
              <span>New Post</span>
            </Button>
          </Link>
        </div>
      </ManagementPageHeader>

      {/* ── Status Notification Banner ── */}
      {statusMessage && (
        <StatusAlertBanner
          variant={statusMessage.type}
          message={statusMessage.text}
          onDismiss={() => setStatusMessage(null)}
        />
      )}

      {/* ── Quick KPI Counters ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block">Total Articles</span>
          <span className="text-xl sm:text-2xl font-black text-[#004776] mt-0.5 block">
            {stats.total}
          </span>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-semibold text-emerald-600 block">Published</span>
          <span className="text-xl sm:text-2xl font-black text-emerald-700 mt-0.5 block">
            {stats.published}
          </span>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-semibold text-amber-600 block">Drafts</span>
          <span className="text-xl sm:text-2xl font-black text-amber-700 mt-0.5 block">
            {stats.drafts}
          </span>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-semibold text-[#115eff] block">Total Views</span>
          <span className="text-xl sm:text-2xl font-black text-[#004776] mt-0.5 block">
            {stats.views.toLocaleString()}
          </span>
        </div>
      </div>

      {/* ── Search & Filter Controls ── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by article title, summary, or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#115eff] focus:bg-white transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <span>Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#115eff] text-[#004776]"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#115eff] text-[#004776]"
            >
              <option value="ALL">All ({posts.length})</option>
              <option value="PUBLISHED">Published ({stats.published})</option>
              <option value="DRAFT">Draft ({stats.drafts})</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Posts Table ── */}
      <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-[#004776] border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Article</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Views</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-[#115eff]" />
                      <span className="text-sm font-semibold text-slate-600">Loading articles...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredPosts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center text-slate-500">
                    <div className="max-w-md mx-auto space-y-3">
                      <p className="font-semibold text-slate-700">
                        {posts.length === 0
                          ? "No conference articles in the database yet."
                          : "No articles matched your active search or filters."}
                      </p>
                      {posts.length === 0 && (
                        <Button
                          type="button"
                          variant="ute"
                          size="sm"
                          onClick={handleSeedDefaultPosts}
                          className="gap-2"
                        >
                          <Database className="size-4" />
                          <span>Sync Official Sample News</span>
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPosts.map((post) => (
                  <tr
                    key={post.id}
                    className="hover:bg-blue-50/40 transition-colors"
                  >
                    {/* Article: Thumbnail + Title + Slug */}
                    <td className="py-3.5 px-4 sm:px-6 max-w-lg">
                      <div className="flex items-start gap-3">
                        <div className="relative size-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                          {post.coverImage ? (
                            <Image
                              src={post.coverImage}
                              alt={post.title}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          ) : (
                            <ImageIcon className="size-5 text-slate-400" />
                          )}
                        </div>

                        <div className="flex flex-col min-w-0">
                          <Link
                            href={`/admin/posts/${post.id}`}
                            className="font-bold text-[#004776] hover:text-[#115eff] transition-colors leading-snug line-clamp-2"
                            title={post.title}
                          >
                            {post.title}
                          </Link>
                          <span className="text-xs text-slate-400 mt-0.5 truncate">
                            /{post.slug}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Badge variant="outline" className="font-semibold text-xs text-[#005496] bg-blue-50 border-blue-200">
                        {post.category}
                      </Badge>
                    </td>

                    {/* Status Toggle */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(post.id, post.status)}
                        disabled={actionLoading}
                        className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase transition-all cursor-pointer border ${
                          post.status === "PUBLISHED"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 shadow-2xs"
                            : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 shadow-2xs"
                        }`}
                        title="Click to toggle status"
                      >
                        {post.status === "PUBLISHED" ? "Published" : "Draft"}
                      </button>
                    </td>

                    {/* Views */}
                    <td className="py-3.5 px-4 text-xs font-semibold text-slate-600 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                        <span>{(post.views || 0).toLocaleString()}</span>
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {new Date(post.publishedAt || post.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <Link
                          href={`/#news`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-slate-400 hover:text-[#115eff] hover:bg-slate-100 rounded-lg transition-colors"
                          title="View on public site"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>

                        <Link
                          href={`/admin/posts/${post.id}`}
                          className="p-1.5 text-slate-500 hover:text-[#115eff] hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit article"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleDeletePost(post.id, post.title)}
                          disabled={actionLoading}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete article"
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
