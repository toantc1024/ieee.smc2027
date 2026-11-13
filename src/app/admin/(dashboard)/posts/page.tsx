"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import {
  Plus,
  Eye,
  Edit2,
  CopyPlus,
  Trash2,
  FileText,
  ImageIcon,
  ChevronDown,
  Check,
  Archive,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DataTable } from "@/components/admin/data-table/DataTable";
import { PostDeleteDialog } from "@/components/admin/posts/PostDeleteDialog";
import { ManagementPageHeader } from "@/components/ui/management-page-header";
import { cn } from "@/lib/utils";
import { POSTS_SYNC_CHANNEL, broadcastPostSync } from "@/lib/post-sync";

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
  version?: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt?: string;
  author?: {
    name: string;
    email: string;
  } | null;
}

export const POST_CATEGORIES = [
  "Announcements",
  "Call for Papers",
  "Keynotes & Speakers",
  "Workshops",
  "General News",
];

function PostCoverThumbnail({
  src,
  alt,
  onClick,
}: {
  src?: string | null;
  alt: string;
  onClick: (e: React.MouseEvent) => void;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative w-24 h-14 sm:w-28 sm:h-16 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 hover:border-[#115eff] transition-colors shrink-0 cursor-pointer block shadow-2xs"
      title="Click to preview post"
    >
      {src && !imgError ? (
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          unoptimized
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="size-full flex flex-col items-center justify-center gap-1 text-slate-300 group-hover:text-slate-400 transition-colors">
          <ImageIcon className="size-5" />
          <span className="text-xs font-medium text-slate-400">No cover</span>
        </div>
      )}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition-colors">
        <Eye className="size-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </button>
  );
}

export default function PostsManagementPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("all");

  // Dialog states (only Delete confirmation dialog is kept for safety)
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [activePost, setActivePost] = useState<PostItem | null>(null);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);

  const displayedPosts = useMemo(() => {
    if (activeTab === "published") return posts.filter((p) => p.status === "PUBLISHED");
    if (activeTab === "draft") return posts.filter((p) => p.status === "DRAFT");
    if (activeTab === "archived") return posts.filter((p) => p.status === "ARCHIVED");
    return posts;
  }, [posts, activeTab]);

  const fetchPosts = useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true);
    }
    try {
      const res = await fetch("/api/admin/posts", { cache: "no-store" });
      const data = await res.json();
      if (data.posts) {
        setPosts(data.posts);
      }
    } catch {
      if (!silent) {
        toast.error("Failed to load posts list");
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void fetchPosts(false);

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void fetchPosts(true);
      }
    }, 5000);

    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === "visible") {
        void fetchPosts(true);
      }
    };

    window.addEventListener("focus", handleVisibilityOrFocus);
    document.addEventListener("visibilitychange", handleVisibilityOrFocus);

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel(POSTS_SYNC_CHANNEL);
      channel.onmessage = () => {
        void fetchPosts(true);
      };
    } catch {
      // BroadcastChannel unavailable
    }

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleVisibilityOrFocus);
      document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
      if (channel) channel.close();
    };
  }, [fetchPosts]);

  // Delete post
  const handleDeletePost = async (id: string) => {
    const res = await fetch(`/api/admin/posts/${id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to delete post");
    }

    broadcastPostSync({ type: "POST_DELETED", id });
    toast.success("Post deleted successfully");
    await fetchPosts(true);
  };

  // Batch actions
  const handleBatchDelete = async (selected: PostItem[], clearSelection: () => void) => {
    if (!confirm(`Are you sure you want to delete ${selected.length} selected post(s)?`)) return;
    try {
      await Promise.all(
        selected.map((item) =>
          fetch(`/api/admin/posts/${item.id}`, { method: "DELETE" })
        )
      );
      clearSelection();
      toast.success(`Deleted ${selected.length} post(s) successfully`);
      await fetchPosts();
    } catch {
      toast.error("Error deleting posts in batch");
    }
  };

  const handleBatchStatus = async (
    selected: PostItem[],
    status: "PUBLISHED" | "DRAFT",
    clearSelection: () => void
  ) => {
    try {
      await Promise.all(
        selected.map((item) =>
          fetch(`/api/admin/posts/${item.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
          })
        )
      );
      clearSelection();
      toast.success(
        `Updated status to ${status === "PUBLISHED" ? "Published" : "Draft"} for ${selected.length} post(s)`
      );
      await fetchPosts();
    } catch {
      toast.error("Error updating status in batch");
    }
  };

  // Quick status change handler with optimistic update
  const handleQuickStatusChange = useCallback(
    async (postId: string, newStatus: "PUBLISHED" | "DRAFT" | "ARCHIVED") => {
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, status: newStatus } : p))
      );

      try {
        const res = await fetch(`/api/admin/posts/${postId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update status");
        broadcastPostSync({ type: "POST_UPDATED", id: postId });
        toast.success(
          `Status changed to ${
            newStatus === "PUBLISHED"
              ? "Published"
              : newStatus === "DRAFT"
              ? "Draft"
              : "Archived"
          }`
        );
      } catch (err: unknown) {
        await fetchPosts(true);
        toast.error(err instanceof Error ? err.message : "Failed to update status");
      }
    },
    [fetchPosts]
  );

  // Quick category change handler with optimistic update
  const handleQuickCategoryChange = useCallback(
    async (postId: string, newCategory: string) => {
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, category: newCategory } : p))
      );

      try {
        const res = await fetch(`/api/admin/posts/${postId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ category: newCategory }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update category");
        broadcastPostSync({ type: "POST_UPDATED", id: postId });
        toast.success(`Category updated to ${newCategory}`);
      } catch (err: unknown) {
        await fetchPosts(true);
        toast.error(err instanceof Error ? err.message : "Failed to update category");
      }
    },
    [fetchPosts]
  );

  // Table columns definition
  const columns: ColumnDef<PostItem>[] = useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <div
            className="flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Checkbox
              checked={
                table.getIsAllPageRowsSelected() ||
                (table.getIsSomePageRowsSelected() && "indeterminate")
              }
              onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
              aria-label="Select all"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div
            className="flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="Select row"
            />
          </div>
        ),
        size: 40,
        enableSorting: false,
      },
      {
        accessorKey: "coverImage",
        header: "Cover",
        enableSorting: false,
        size: 110,
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div
              className="flex items-center justify-center py-1"
              onClick={(e) => e.stopPropagation()}
            >
              <PostCoverThumbnail
                src={item.coverImage}
                alt={item.title}
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/admin/posts/${item.id}`);
                }}
              />
            </div>
          );
        },
      },
      {
        accessorKey: "title",
        header: "Post",
        size: 340,
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="w-full min-w-0 max-w-[360px] sm:max-w-md py-1 space-y-1 overflow-hidden whitespace-normal">
              {/* Title with word-wrap and caption */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/admin/posts/${item.id}`);
                }}
                className="font-semibold text-slate-900 hover:text-[#115eff] text-sm sm:text-base text-left line-clamp-2 break-words [overflow-wrap:anywhere] leading-snug transition-colors cursor-pointer block w-full"
                title={item.title}
              >
                {item.title}
              </button>

              {/* Summary with wrap and caption */}
              {item.summary && (
                <p
                  className="text-xs sm:text-sm text-slate-500 line-clamp-2 break-words [overflow-wrap:anywhere] leading-normal w-full"
                  title={item.summary}
                >
                  {item.summary}
                </p>
              )}

              {/* Slug tag & Version badge with safe truncation */}
              <div className="pt-0.5 min-w-0 max-w-full overflow-hidden flex items-center gap-1.5 flex-wrap">
                <span
                  className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 inline-block max-w-full truncate align-middle"
                  title={`/${item.slug}`}
                >
                  /{item.slug}
                </span>
                <span className="text-xs font-mono font-semibold text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                  v{item.version || 1}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "category",
        header: "Category",
        size: 140,
        cell: ({ row }) => {
          const item = row.original;
          const cat = (row.getValue("category") as string) || item.category;
          return (
            <div
              className="flex items-center justify-center min-w-0 max-w-[150px] mx-auto overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center justify-between gap-1.5 h-7 px-3 max-w-full rounded-full text-xs font-medium text-slate-700 border border-slate-200 bg-slate-50 hover:bg-slate-100 focus:outline-none focus:border-[#115eff] transition-colors cursor-pointer group shadow-2xs"
                    title={cat}
                  >
                    <span className="truncate min-w-0 flex-1 text-left">{cat}</span>
                    <ChevronDown className="size-3 text-slate-400 group-hover:text-slate-600 transition-colors shrink-0 ml-1" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-48 p-1.5 rounded-xl border border-slate-200 bg-white shadow-lg">
                  {POST_CATEGORIES.map((categoryOption) => (
                    <DropdownMenuItem
                      key={categoryOption}
                      onClick={() => handleQuickCategoryChange(item.id, categoryOption)}
                      className="flex items-center justify-between py-1.5 px-2.5 text-xs rounded-lg cursor-pointer text-slate-700 hover:bg-slate-50"
                    >
                      <span className="truncate" title={categoryOption}>{categoryOption}</span>
                      {cat === categoryOption && (
                        <Check className="size-3.5 text-[#115eff] shrink-0 ml-2" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        size: 130,
        cell: ({ row }) => {
          const item = row.original;
          const status = (row.getValue("status") as string) || item.status;
          return (
            <div
              className="flex items-center justify-center min-w-0 max-w-[130px] mx-auto overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      "inline-flex items-center justify-between gap-1.5 h-7 px-3 max-w-full rounded-full text-xs font-semibold border transition-colors cursor-pointer group shadow-2xs",
                      status === "PUBLISHED"
                        ? "bg-blue-50 text-[#115eff] border-blue-200 hover:bg-blue-100/80"
                        : status === "DRAFT"
                        ? "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200/70"
                        : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100/80"
                    )}
                    title={status}
                  >
                    <span className="flex items-center gap-1.5 min-w-0 truncate">
                      <span
                        className={cn(
                          "size-1.5 rounded-full shrink-0",
                          status === "PUBLISHED"
                            ? "bg-[#115eff]"
                            : status === "DRAFT"
                            ? "bg-slate-400"
                            : "bg-amber-500"
                        )}
                      />
                      <span className="truncate">
                        {status === "PUBLISHED"
                          ? "Published"
                          : status === "DRAFT"
                          ? "Draft"
                          : "Archived"}
                      </span>
                    </span>
                    <ChevronDown className="size-3 opacity-60 group-hover:opacity-100 transition-opacity shrink-0 ml-1" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-40 p-1.5 rounded-xl border border-slate-200 bg-white shadow-lg">
                  <DropdownMenuItem
                    onClick={() => handleQuickStatusChange(item.id, "PUBLISHED")}
                    className="flex items-center justify-between py-1.5 px-2.5 text-xs rounded-lg cursor-pointer text-slate-700 hover:bg-slate-50"
                  >
                    <span className="flex items-center gap-2 font-medium">
                      <span className="size-1.5 rounded-full bg-[#115eff]" />
                      Published
                    </span>
                    {status === "PUBLISHED" && (
                      <Check className="size-3.5 text-[#115eff]" />
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleQuickStatusChange(item.id, "DRAFT")}
                    className="flex items-center justify-between py-1.5 px-2.5 text-xs rounded-lg cursor-pointer text-slate-700 hover:bg-slate-50"
                  >
                    <span className="flex items-center gap-2 font-medium">
                      <span className="size-1.5 rounded-full bg-slate-400" />
                      Draft
                    </span>
                    {status === "DRAFT" && (
                      <Check className="size-3.5 text-[#115eff]" />
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleQuickStatusChange(item.id, "ARCHIVED")}
                    className="flex items-center justify-between py-1.5 px-2.5 text-xs rounded-lg cursor-pointer text-slate-700 hover:bg-slate-50"
                  >
                    <span className="flex items-center gap-2 font-medium">
                      <span className="size-1.5 rounded-full bg-amber-500" />
                      Archived
                    </span>
                    {status === "ARCHIVED" && (
                      <Check className="size-3.5 text-[#115eff]" />
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
      {
        accessorKey: "views",
        header: "Views",
        size: 80,
        cell: ({ row }) => {
          const val = Number(row.getValue("views") || 0);
          return (
            <div
              className="text-center font-medium text-slate-700 text-xs sm:text-sm truncate px-1"
              title={`${val.toLocaleString("en-US")} views`}
            >
              {val.toLocaleString("en-US")}
            </div>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "Created Date",
        size: 115,
        cell: ({ row }) => {
          const date = new Date(row.getValue("createdAt"));
          return (
            <div
              className="text-center text-xs sm:text-sm text-slate-600 font-medium truncate px-1"
              title={date.toLocaleString("en-US")}
            >
              {date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        size: 140,
        cell: ({ row }) => {
          const item = row.original;
          const isDuplicating = duplicatingId === item.id;
          return (
            <div
              className="flex items-center justify-center gap-1.5 shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 1. Direct Post Detail View */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/admin/posts/${item.id}`);
                }}
                className="size-8 inline-flex items-center justify-center text-slate-500 hover:text-white hover:bg-[#115eff] hover:border-[#115eff] border border-slate-200 bg-white rounded-lg transition-colors cursor-pointer shadow-2xs"
                title="View post detail page"
              >
                <Eye className="size-4" />
              </button>

              {/* 2. Direct Edit in Full Editor */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/admin/posts/${item.id}/edit`);
                }}
                className="size-8 inline-flex items-center justify-center text-slate-500 hover:text-white hover:bg-[#115eff] hover:border-[#115eff] border border-slate-200 bg-white rounded-lg transition-colors cursor-pointer shadow-2xs"
                title="Edit post in full editor"
              >
                <Edit2 className="size-4" />
              </button>

              {/* 3. Real Duplicate & Edit Action */}
              <button
                type="button"
                disabled={isDuplicating}
                onClick={async (e) => {
                  e.stopPropagation();
                  setDuplicatingId(item.id);
                  try {
                    toast.loading("Duplicating post...", { id: "dup-post" });
                    const res = await fetch(`/api/admin/posts/${item.id}/duplicate`, {
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
                    setDuplicatingId(null);
                  }
                }}
                className="size-8 inline-flex items-center justify-center text-slate-500 hover:text-white hover:bg-[#115eff] hover:border-[#115eff] border border-slate-200 bg-white rounded-lg transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
                title="Duplicate & edit post"
              >
                <CopyPlus className="size-4" />
              </button>

              {/* 4. Delete Post */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActivePost(item);
                  setDeleteOpen(true);
                }}
                className="size-8 inline-flex items-center justify-center text-rose-500 hover:text-white hover:bg-rose-600 hover:border-rose-600 border border-slate-200 bg-white rounded-lg transition-colors cursor-pointer shadow-2xs"
                title="Delete post"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          );
        },
        enableSorting: false,
      },
    ],
    [router, duplicatingId, handleQuickStatusChange, handleQuickCategoryChange]
  );

  return (
    <div className="space-y-6 font-sans">
      {/* ── Page Header ── */}
      <ManagementPageHeader
        title="Posts & News"
        description="Conference announcements, call for papers, and news updates"
        image3d="/assets/3d-icons/article-management__hcmute-3d-icon.png"
        backgroundImage="/assets/manage-posts-bg.jpg"
        actions={
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fetchPosts(false)}
              disabled={loading}
              className="gap-1.5 text-xs sm:text-sm text-slate-600 bg-white hover:bg-slate-50 border-slate-200 rounded-lg shadow-sm font-semibold h-9 px-3"
              title="Refresh"
            >
              <RefreshCw className={cn("size-3.5 sm:size-4", loading && "animate-spin text-[#115eff]")} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <Button
              size="sm"
              onClick={() => router.push("/admin/posts/create")}
              className="bg-[#115eff] hover:bg-[#0a4de6] text-white gap-1.5 shadow-sm text-xs sm:text-sm font-semibold rounded-lg h-9 px-3.5"
            >
              <Plus className="size-4" />
              <span>New Post</span>
            </Button>
          </div>
        }
      />

      {/* ── Tabs Row ── */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-white border border-slate-200 shadow-sm">
          <TabsList className="h-9 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <TabsTrigger value="all" className="text-xs sm:text-sm font-semibold px-3.5 h-8 rounded-md data-[state=active]:bg-white data-[state=active]:text-[#004776] data-[state=active]:shadow-sm">
              <FileText className="mr-1.5 size-4" />
              <span>All ({posts.length})</span>
            </TabsTrigger>
            <TabsTrigger value="published" className="text-xs sm:text-sm font-semibold px-3.5 h-8 rounded-md data-[state=active]:bg-white data-[state=active]:text-[#115eff] data-[state=active]:shadow-sm">
              <Check className="mr-1.5 size-4 text-[#115eff]" />
              <span>Published ({posts.filter((p) => p.status === "PUBLISHED").length})</span>
            </TabsTrigger>
            <TabsTrigger value="draft" className="text-xs sm:text-sm font-semibold px-3.5 h-8 rounded-md data-[state=active]:bg-white data-[state=active]:text-slate-700 data-[state=active]:shadow-sm">
              <Edit2 className="mr-1.5 size-4 text-slate-500" />
              <span>Drafts ({posts.filter((p) => p.status === "DRAFT").length})</span>
            </TabsTrigger>
            <TabsTrigger value="archived" className="text-xs sm:text-sm font-semibold px-3.5 h-8 rounded-md data-[state=active]:bg-white data-[state=active]:text-slate-700 data-[state=active]:shadow-sm">
              <Archive className="mr-1.5 size-4 text-slate-400" />
              <span>Archived ({posts.filter((p) => p.status === "ARCHIVED").length})</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={activeTab} className="mt-0">
          <DataTable
            columns={columns}
            data={displayedPosts}
            loading={loading}
            onRowClick={(item) => router.push(`/admin/posts/${item.id}`)}
            searchPlaceholder="Search by title, slug, summary..."
            filterColumns={[
              {
                id: "status",
                title: "Status",
                options: [
                  { label: "Published", value: "PUBLISHED" },
                  { label: "Draft", value: "DRAFT" },
                  { label: "Archived", value: "ARCHIVED" },
                ],
              },
              {
                id: "category",
                title: "Category",
                options: POST_CATEGORIES.map((c) => ({ label: c, value: c })),
              },
            ]}
            batchActions={(selected, clear) => (
              <div className="flex items-center gap-1.5 ml-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => handleBatchStatus(selected, "PUBLISHED", clear)}
                  className="h-7 px-3 text-xs font-semibold bg-[#115eff] hover:bg-[#0a4de6] text-white rounded-md shadow-none"
                >
                  Publish
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => handleBatchStatus(selected, "DRAFT", clear)}
                  className="h-7 px-3 text-xs font-semibold bg-white text-[#004776] border-slate-200 hover:bg-slate-50 rounded-md shadow-none"
                >
                  Set Draft
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleBatchDelete(selected, clear)}
                  className="h-7 px-3 text-xs font-semibold bg-white text-rose-600 border-slate-200 hover:bg-rose-50 hover:text-rose-700 rounded-md shadow-none"
                >
                  Delete selected
                </Button>
              </div>
            )}
          />
        </TabsContent>
      </Tabs>



      {/* ── Delete Confirmation Dialog ── */}
      <PostDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        post={activePost}
        onConfirm={handleDeletePost}
      />
    </div>
  );
}
