"use client";

import React, { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Edit,
  Eye,
  EyeOff,
  Rocket,
  ExternalLink,
  Copy,
  CopyPlus,
  Trash2,
  RefreshCw,
  Calendar,
  Clock,
  User,
  Link as LinkIcon,
  ChevronRight,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

interface PostDetail {
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
  updatedAt: string;
  author?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export default function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [coverImgError, setCoverImgError] = useState(false);

  const fetchPost = useCallback(
    async (isManualRefresh = false) => {
      if (isManualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const res = await fetch(`/api/admin/posts/${id}`);
        const data = await res.json();
        if (data.post) {
          setPost(data.post);
          if (isManualRefresh) toast.success("Post data refreshed");
        } else {
          toast.error(data.error || "Post not found");
        }
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to load post");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [id]
  );

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  const handleTogglePublish = async () => {
    if (!post) return;
    const newStatus = post.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";

    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/admin/posts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update status");

      setPost((prev) => (prev ? { ...prev, status: newStatus } : null));
      toast.success(
        newStatus === "PUBLISHED" ? "Post published successfully" : "Post unpublished successfully"
      );
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to change post status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleCopyLink = async () => {
    if (!post) return;
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const publicUrl = `${origin}/news/${post.slug}`;
    try {
      await navigator.clipboard.writeText(publicUrl);
      toast.success("Public link copied to clipboard");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleDuplicatePost = async () => {
    if (!post) return;
    setIsDuplicating(true);
    try {
      toast.loading("Duplicating post...", { id: "dup-post" });
      const res = await fetch(`/api/admin/posts/${post.id}/duplicate`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to duplicate post");
      toast.success("Post duplicated! Opening editor...", { id: "dup-post" });
      router.push(`/admin/posts/${data.post.id}/edit`);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to duplicate post",
        { id: "dup-post" }
      );
    } finally {
      setIsDuplicating(false);
    }
  };

  const handleDeletePost = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete post");

      toast.success("Post deleted successfully");
      router.push("/admin/posts");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete post");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 font-sans">
        {/* Top Header Skeleton */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-none">
          <div className="flex items-center gap-3">
            <Skeleton className="size-9 rounded-lg" />
            <Skeleton className="h-5 w-56 rounded-md" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-24 rounded-lg" />
            <Skeleton className="h-9 w-24 rounded-lg" />
            <Skeleton className="h-9 w-24 rounded-lg" />
          </div>
        </div>

        {/* Article Reader Skeleton */}
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-none">
          <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-3.5 flex items-center gap-2">
            <Skeleton className="h-4 w-12 rounded" />
            <Skeleton className="h-4 w-32 rounded" />
            <Skeleton className="h-4 w-48 rounded" />
          </div>
          <div className="max-w-4xl mx-auto px-6 sm:px-10 py-10 space-y-6">
            <div className="flex gap-3">
              <Skeleton className="h-4 w-20 rounded" />
              <Skeleton className="h-4 w-28 rounded" />
              <Skeleton className="h-4 w-32 rounded" />
            </div>
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-10 w-3/4 rounded-md" />
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="aspect-[16/9] w-full rounded-2xl" />
            <div className="space-y-3 pt-4">
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-5/6 rounded" />
              <Skeleton className="h-4 w-4/6 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-none space-y-4 max-w-md mx-auto my-12">
        <p className="text-base font-semibold text-slate-800">
          Post not found
        </p>
        <p className="text-xs text-slate-500">
          The requested article does not exist or may have been deleted.
        </p>
        <Button variant="outline" size="sm" asChild className="h-9 px-3.5 text-xs font-semibold">
          <Link href="/admin/posts" className="inline-flex items-center gap-1.5">
            <ArrowLeft className="size-4 shrink-0" />
            <span>Back to Posts</span>
          </Link>
        </Button>
      </div>
    );
  }

  const publicUrl = `/news/${post.slug}`;
  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : new Date(post.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

  return (
    <div className="space-y-6 font-sans">
      {/* ── 1. Top Admin Action Rail (Single-line, h-9 standardized buttons, NO badge) ── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 flex flex-col xl:flex-row xl:items-center justify-between gap-4 shadow-none">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-9 shrink-0 cursor-pointer text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg inline-flex items-center justify-center"
            asChild
            title="Back to Posts"
          >
            <Link href="/admin/posts" className="inline-flex items-center justify-center size-9 shrink-0">
              <ArrowLeft className="size-4 shrink-0" />
            </Link>
          </Button>

          {/* Breadcrumb — strictly non-bold for all */}
          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 min-w-0 overflow-hidden font-normal">
            <Link href="/admin/posts" className="hover:text-[#115eff] transition-colors shrink-0 font-normal">
              Posts
            </Link>
            <ChevronRight className="size-3.5 shrink-0 text-slate-400" />
            <span className="text-[#004776] font-normal truncate min-w-0">
              {post.title}
            </span>
          </div>
        </div>

        {/* Action Buttons — HCMUTE Standard h-9, px-3.5/px-4, single-line flex */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {post.status === "PUBLISHED" ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleTogglePublish}
              disabled={isUpdatingStatus}
              className="h-9 px-4 gap-1.5 cursor-pointer text-xs sm:text-sm font-semibold shrink-0 whitespace-nowrap border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100 hover:text-rose-800 shadow-none inline-flex flex-row items-center"
            >
              <EyeOff className="size-4 shrink-0" />
              <span className="whitespace-nowrap shrink-0">Unpublish</span>
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              onClick={handleTogglePublish}
              disabled={isUpdatingStatus}
              className="h-9 px-4 gap-1.5 cursor-pointer text-xs sm:text-sm font-semibold shrink-0 whitespace-nowrap bg-[#115eff] hover:bg-[#0a4de6] text-white shadow-none inline-flex flex-row items-center"
            >
              <Rocket className="size-4 shrink-0" />
              <span className="whitespace-nowrap shrink-0">Publish Post</span>
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            asChild
            className="h-9 px-3.5 gap-1.5 cursor-pointer text-xs sm:text-sm font-semibold shrink-0 whitespace-nowrap bg-white hover:bg-slate-50 border-slate-200 text-slate-800 shadow-none inline-flex flex-row items-center"
          >
            <Link href={`/admin/posts/${post.id}/edit`} className="inline-flex flex-row items-center gap-1.5 whitespace-nowrap shrink-0">
              <Edit className="size-4 text-[#115eff] shrink-0" />
              <span className="whitespace-nowrap shrink-0">Edit Post</span>
            </Link>
          </Button>

          {/* Real Duplicate & Edit Action */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDuplicatePost}
            disabled={isDuplicating}
            className="h-9 px-3.5 gap-1.5 cursor-pointer text-xs sm:text-sm font-semibold shrink-0 whitespace-nowrap bg-white hover:bg-slate-50 border-slate-200 text-slate-800 shadow-none inline-flex flex-row items-center"
            title="Duplicate as draft and edit"
          >
            <CopyPlus className="size-4 text-[#115eff] shrink-0" />
            <span className="whitespace-nowrap shrink-0">Duplicate &amp; Edit</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            asChild
            className="h-9 px-3.5 gap-1.5 cursor-pointer text-xs sm:text-sm font-semibold shrink-0 whitespace-nowrap bg-blue-50/60 hover:bg-blue-100/70 border border-[#115eff]/30 text-[#115eff] shadow-none inline-flex flex-row items-center"
          >
            <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="inline-flex flex-row items-center gap-1.5 whitespace-nowrap shrink-0">
              <ExternalLink className="size-4 shrink-0" />
              <span className="whitespace-nowrap shrink-0">View Public</span>
            </a>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            className="h-9 px-3.5 gap-1.5 cursor-pointer text-xs sm:text-sm font-semibold shrink-0 whitespace-nowrap bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-none inline-flex flex-row items-center"
          >
            <Copy className="size-4 shrink-0" />
            <span className="whitespace-nowrap shrink-0">Copy Link</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => fetchPost(true)}
            disabled={refreshing}
            className="size-9 p-0 cursor-pointer text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg inline-flex items-center justify-center shrink-0"
            title="Refresh post details"
          >
            <RefreshCw className={cn("size-4 shrink-0", refreshing && "animate-spin")} />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            className="h-9 px-3.5 gap-1.5 cursor-pointer text-xs sm:text-sm font-semibold shrink-0 whitespace-nowrap text-rose-600 hover:text-rose-700 hover:bg-rose-50 inline-flex flex-row items-center"
            title="Delete post"
          >
            <Trash2 className="size-4 shrink-0" />
            <span className="whitespace-nowrap shrink-0">Delete</span>
          </Button>
        </div>
      </div>

      {/* ── 2. Authentic HCMUTE Post Reader Layout (100% Public/HCMUTE Parity) ── */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-none">
        {/* Top Breadcrumb Bar (Non-bold for all) */}
        <div className="w-full border-b border-slate-100 bg-slate-50/70 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center gap-2 text-xs sm:text-sm text-slate-500 overflow-x-auto scrollbar-none font-normal">
          <Link href="/" target="_blank" className="hover:text-[#115eff] transition-colors shrink-0 font-normal">
            Home
          </Link>
          <ChevronRight className="size-3.5 shrink-0 text-slate-400" />
          <Link href="/news" target="_blank" className="hover:text-[#115eff] transition-colors shrink-0 font-normal">
            News &amp; Announcements
          </Link>
          <ChevronRight className="size-3.5 shrink-0 text-slate-400" />
          <span className="text-slate-600 font-normal truncate shrink-0 max-w-[280px] sm:max-w-md">
            {post.title}
          </span>
        </div>

        {/* Article Container */}
        <div className="max-w-4xl mx-auto px-4 sm:px-8 lg:px-10 pt-8 sm:pt-12 pb-12 sm:pb-16 space-y-6">
          {/* Back link */}
          <Link
            href="/admin/posts"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-normal text-[#115eff] hover:text-[#004776] transition-colors group mb-2"
          >
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
            <span>Back to all announcements</span>
          </Link>

          {/* Category & Metadata Row */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-slate-500">
            <span className="font-bold uppercase tracking-wider text-[#115eff] text-xs">
              {post.category}
            </span>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1.5 font-normal text-slate-600">
              <Calendar className="size-3.5 text-slate-400" />
              <span>{formattedDate}</span>
            </div>
            {post.views > 0 && (
              <>
                <span className="text-slate-300">•</span>
                <div className="flex items-center gap-1.5 font-normal text-slate-600">
                  <Eye className="size-3.5 text-slate-400" />
                  <span>{post.views.toLocaleString("en-US")} views</span>
                </div>
              </>
            )}
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1.5 font-normal text-slate-600">
              <User className="size-3.5 text-slate-400" />
              <span>{post.author?.name || post.author?.email || "IEEE SMC 2027 Organizing Committee"}</span>
            </div>
          </div>

          {/* Article Main Headline (HCMUTE Style) */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-[2.65rem] font-extrabold text-[#004776] tracking-tight leading-[1.25]">
            {post.title}
          </h1>

          {/* Excerpt / Summary Callout with Royal Blue left bar */}
          {post.summary && (
            <div className="rounded-xl border-l-4 border-[#115eff] bg-blue-50/50 p-4 sm:p-5 mt-4">
              <p className="text-sm sm:text-base md:text-lg font-normal text-slate-700 leading-relaxed italic">
                &ldquo;{post.summary}&rdquo;
              </p>
            </div>
          )}

          {/* Featured Cover Image */}
          {post.coverImage && !coverImgError && (
            <div className="pt-2">
              <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden border border-slate-200/90 shadow-none bg-slate-100">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  unoptimized
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 896px"
                  onError={() => setCoverImgError(true)}
                />
              </div>
            </div>
          )}

          {/* Main Body Content (Strict HCMUTE Reader Style: line-height 1.8) */}
          <article className="pt-4">
            <div
              className="tiptap post-reader prose prose-slate sm:prose-lg max-w-none text-slate-800 leading-[1.8] font-sans prose-headings:font-bold prose-headings:text-[#004776] prose-headings:tracking-tight prose-a:text-[#115eff] prose-a:font-semibold hover:prose-a:underline prose-img:rounded-xl prose-img:border prose-img:border-slate-200 prose-blockquote:border-l-[#115eff] prose-blockquote:bg-blue-50/40 prose-blockquote:p-4 prose-blockquote:rounded-r-lg prose-table:border prose-table:border-slate-200"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </article>
        </div>

        {/* ── 3. Administrative Status & Metadata Dock (Bottom Rail) ── */}
        <div className="border-t border-slate-200 bg-slate-50/80 px-4 sm:px-8 py-5">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
            <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-slate-600">
              {/* Status */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-normal">Status:</span>
                <span
                  className={cn(
                    "font-semibold px-2 py-0.5 rounded-md text-[11px]",
                    post.status === "PUBLISHED"
                      ? "bg-blue-50 text-[#115eff] border border-blue-200"
                      : "bg-slate-100 text-slate-700 border border-slate-200"
                  )}
                >
                  {post.status === "PUBLISHED" ? "Published" : "Draft"}
                </span>
              </div>

              {/* Public URL Slug */}
              <div className="flex items-center gap-1.5 font-normal text-[11px] text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded-md">
                <LinkIcon className="size-3 text-[#115eff]" />
                <span className="truncate max-w-[200px]">/news/{post.slug}</span>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="text-[#115eff] hover:underline font-sans text-xs font-semibold ml-1 cursor-pointer"
                >
                  Copy
                </button>
              </div>

              {/* Published Date */}
              {post.publishedAt && (
                <div className="flex items-center gap-1.5 text-slate-500 font-normal">
                  <Clock className="size-3 text-slate-400" />
                  <span>Published: {new Date(post.publishedAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                asChild
                className="h-8 px-3 gap-1.5 cursor-pointer text-xs font-semibold bg-white border-slate-200 text-slate-700"
              >
                <Link href={`/admin/posts/${post.id}/edit`}>
                  <Edit className="size-3.5 text-[#115eff]" />
                  <span>Edit Content</span>
                </Link>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                asChild
                className="h-8 px-3 gap-1.5 cursor-pointer text-xs font-semibold bg-white border-slate-200 text-[#115eff]"
              >
                <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="size-3.5" />
                  <span>View Public Page</span>
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. Delete Confirmation Dialog ── */}
      {showDeleteDialog && (
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent className="rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this post?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the post &quot;{post.title}&quot;. This action cannot be
                undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting} className="h-8 text-xs">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeletePost}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 text-white h-8 text-xs font-semibold"
              >
                {isDeleting ? "Deleting..." : "Delete Post"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
