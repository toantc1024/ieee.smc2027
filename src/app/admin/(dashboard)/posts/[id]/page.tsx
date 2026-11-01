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
  Trash2,
  RefreshCw,
  FolderOpen,
  Calendar,
  Clock,
  User,
  Link as LinkIcon,
  Quote,
  FileText,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
      <div className="h-full flex flex-col overflow-hidden bg-background">
        <div className="h-13 min-h-[52px] border-b border-border/80 px-4 flex items-center justify-between bg-white dark:bg-card">
          <div className="flex items-center gap-3">
            <Skeleton className="size-8 rounded-lg" />
            <Skeleton className="h-5 w-64 rounded-md" />
          </div>
          <Skeleton className="h-7 w-20 rounded-md" />
        </div>
        <div className="h-12 border-b border-border/70 px-4 flex items-center gap-2 bg-slate-50/60 dark:bg-muted/10">
          <Skeleton className="h-8 w-28 rounded-lg" />
          <Skeleton className="h-8 w-24 rounded-lg" />
          <Skeleton className="h-8 w-28 rounded-lg" />
        </div>
        <div className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-96 w-full rounded-xl" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-44 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-background">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
          Post not found
        </p>
        <p className="text-xs text-muted-foreground mb-4">
          The requested article does not exist or may have been deleted.
        </p>
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/posts">
            <ArrowLeft className="size-3.5 mr-1.5" />
            Back to Posts
          </Link>
        </Button>
      </div>
    );
  }

  const publicUrl = `/news/${post.slug}`;

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background font-sans select-none">
      {/* ── 1. Top Header Bar ── */}
      <header className="shrink-0 bg-white dark:bg-card border-b border-border/80 z-20">
        <div className="flex items-center gap-3 px-4 h-13 min-h-[52px]">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-9 shrink-0 cursor-pointer"
            asChild
            title="Back to Posts"
          >
            <Link href="/admin/posts">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>

          <div className="flex-1 min-w-0">
            <h1 className="text-base font-semibold tracking-tight text-foreground line-clamp-1">
              {post.title}
            </h1>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <Badge
              variant="outline"
              className="text-xs font-semibold rounded-md border-primary/30 text-primary bg-primary/5"
            >
              {post.category}
            </Badge>

            <Badge
              variant={post.status === "PUBLISHED" ? "default" : "secondary"}
              className={cn(
                "text-xs font-semibold rounded-md",
                post.status === "PUBLISHED"
                  ? "bg-[#115eff] text-white hover:bg-[#115eff]"
                  : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
              )}
            >
              {post.status === "PUBLISHED" ? "Published" : "Draft"}
            </Badge>
          </div>
        </div>
      </header>

      {/* ── 2. Action Rail (Horizontal Action Bar like HCMUTE) ── */}
      <div className="shrink-0 bg-slate-50/70 dark:bg-muted/10 border-b border-border/70 px-4 py-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {/* Publish / Unpublish Toggle Button */}
          {post.status === "PUBLISHED" ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleTogglePublish}
              disabled={isUpdatingStatus}
              className="h-8.5 px-3 text-xs font-medium border-amber-300 bg-amber-50/80 text-amber-700 hover:bg-amber-100 hover:text-amber-800 shadow-none cursor-pointer"
            >
              <EyeOff className="size-3.5 mr-1.5" />
              <span>Unpublish Post</span>
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              onClick={handleTogglePublish}
              disabled={isUpdatingStatus}
              className="h-8.5 px-3 text-xs font-semibold bg-[#115eff] hover:bg-[#0a4de6] text-white shadow-none cursor-pointer"
            >
              <Rocket className="size-3.5 mr-1.5" />
              <span>Publish Post</span>
            </Button>
          )}

          {/* Edit Post Button (Goes to full-screen editor) */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            asChild
            className="h-8.5 px-3 text-xs font-medium bg-white hover:bg-slate-50 border-slate-200 text-slate-800 shadow-none cursor-pointer"
          >
            <Link href={`/admin/posts/${post.id}/edit`}>
              <Edit className="size-3.5 mr-1.5 text-primary" />
              <span>Edit Post</span>
            </Link>
          </Button>

          {/* Open Public Post */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            asChild
            className="h-8.5 px-3 text-xs font-medium bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-none cursor-pointer"
          >
            <a href={publicUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="size-3.5 mr-1.5" />
              <span>View Public Post</span>
            </a>
          </Button>

          {/* Copy Public Link */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            className="h-8.5 px-3 text-xs font-medium bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-none cursor-pointer"
          >
            <Copy className="size-3.5 mr-1.5" />
            <span>Copy Link</span>
          </Button>
        </div>

        <div className="flex items-center gap-1.5 ml-auto">
          {/* Refresh Data */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => fetchPost(true)}
            disabled={refreshing}
            className="h-8.5 px-2.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
            title="Refresh post details"
          >
            <RefreshCw className={cn("size-3.5", refreshing && "animate-spin")} />
          </Button>

          {/* Delete Post */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            className="h-8.5 px-2.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
            title="Delete post"
          >
            <Trash2 className="size-3.5 mr-1.5" />
            <span>Delete</span>
          </Button>
        </div>
      </div>

      {/* ── 3. Scrollable 2-Column Detail View Layout ── */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6 lg:p-8 bg-slate-50/50 dark:bg-[#070b14]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Columns: Summary & Formatted Reading Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Excerpt Callout (if summary exists) */}
            {post.summary && (
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <div className="size-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5 text-primary">
                    <Quote className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">
                      Post Summary / Excerpt
                    </p>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                      {post.summary}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Article Content Viewer Card */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-card p-6 sm:p-10 shadow-none">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <FileText className="size-4 text-primary" />
                  <span>Article Content</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="h-7 text-xs text-primary hover:bg-primary/10"
                >
                  <Link href={`/admin/posts/${post.id}/edit`}>
                    <Edit className="size-3 mr-1" />
                    Edit Content
                  </Link>
                </Button>
              </div>

              {/* Formatted Reader HTML */}
              <div
                className="tiptap prose max-w-none text-slate-800 dark:text-slate-100 leading-relaxed font-sans"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>
          </div>

          {/* Right Column: Metadata Sidebar Card */}
          <div className="space-y-6">
            {/* Card 1: Cover Image & Quick Overview */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-card p-4 sm:p-5 space-y-4 shadow-none">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Cover Image
              </h3>

              {post.coverImage && !coverImgError ? (
                <div className="aspect-[16/9] w-full relative rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    className="object-cover"
                    unoptimized
                    onError={() => setCoverImgError(true)}
                  />
                </div>
              ) : (
                <div className="aspect-[16/9] w-full rounded-lg border border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-slate-400 gap-1.5">
                  <FileText className="size-6 text-slate-300" />
                  <span className="text-xs font-medium">No cover image</span>
                </div>
              )}

              {/* Metadata Details */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3 text-xs">
                {/* Category */}
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <FolderOpen className="size-3.5 text-primary" />
                    Category
                  </span>
                  <Badge variant="secondary" className="font-medium text-xs">
                    {post.category}
                  </Badge>
                </div>

                {/* Status */}
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Check className="size-3.5 text-primary" />
                    Status
                  </span>
                  <Badge
                    variant={post.status === "PUBLISHED" ? "default" : "outline"}
                    className={cn(
                      "text-[11px] font-semibold",
                      post.status === "PUBLISHED"
                        ? "bg-[#115eff] text-white hover:bg-[#115eff]"
                        : "text-slate-600"
                    )}
                  >
                    {post.status === "PUBLISHED" ? "Published" : "Draft"}
                  </Badge>
                </div>

                {/* Published Date */}
                {post.publishedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Clock className="size-3.5" />
                      Published Date
                    </span>
                    <span className="font-medium text-foreground">
                      {new Date(post.publishedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                )}

                {/* Created Date */}
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="size-3.5" />
                    Created Date
                  </span>
                  <span className="font-medium text-foreground">
                    {new Date(post.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>

                {/* Author */}
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <User className="size-3.5" />
                    Author
                  </span>
                  <span className="font-medium text-foreground">
                    {post.author?.name || post.author?.email || "Admin"}
                  </span>
                </div>

                {/* URL Slug */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <LinkIcon className="size-3.5" />
                    URL Slug
                  </span>
                  <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-50 dark:bg-muted/40 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                    <span className="truncate">/news/{post.slug}</span>
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="text-primary hover:underline shrink-0 font-sans text-xs"
                      title="Copy slug"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. Delete Confirmation Dialog ── */}
      {showDeleteDialog && (
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this post?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the post &quot;{post.title}&quot;. This action cannot be
                undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeletePost}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 text-white"
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
