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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/admin/data-table/DataTable";
import { PostDeleteDialog } from "@/components/admin/posts/PostDeleteDialog";
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
      className="group relative w-28 sm:w-32 aspect-video rounded-lg overflow-hidden bg-blue-50/50 border border-blue-100/90 hover:border-[#115eff] transition-colors shrink-0 cursor-pointer block shadow-2xs"
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
        <div className="size-full flex items-center justify-center p-2.5 bg-gradient-to-br from-blue-50/80 via-white to-blue-100/60">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo/ieee-smc-2027-conference-lockup-transparent.png"
            alt="IEEE SMC 2027"
            className="max-h-full max-w-full object-contain opacity-85 group-hover:opacity-100 transition-opacity"
          />
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
        size: 128,
        meta: {
          align: "center",
        },
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div
              className="flex items-center justify-center"
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
        size: 260,
        meta: {
          align: "left",
          searchable: true,
        },
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="w-full min-w-0 max-w-[240px] lg:max-w-[260px] xl:max-w-[320px] space-y-1 overflow-hidden">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/admin/posts/${item.id}`);
                }}
                className="font-bold text-[#004776] hover:text-[#115eff] text-[15px] sm:text-base text-left truncate leading-snug transition-colors cursor-pointer block w-full"
                title={item.title}
              >
                {item.title}
              </button>

              {item.summary && (
                <p
                  className="text-xs sm:text-[13px] text-slate-500 truncate leading-normal w-full"
                  title={item.summary}
                >
                  {item.summary}
                </p>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "category",
        header: "Category",
        size: 135,
        meta: {
          align: "left",
        },
        cell: ({ row }) => {
          const item = row.original;
          const cat = (row.getValue("category") as string) || item.category;
          return (
            <div
              className="flex items-center justify-start min-w-0 max-w-[160px] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 py-1 px-2 -mx-2 max-w-full rounded-md text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-[#115eff] focus:outline-none transition-colors cursor-pointer group"
                    title={cat}
                  >
                    <span className="truncate min-w-0">{cat}</span>
                    <ChevronDown className="size-3.5 text-slate-400 group-hover:text-[#115eff] transition-colors shrink-0" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48 p-1.5 rounded-xl border border-slate-200 bg-white shadow-lg">
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
        size: 90,
        sortingFn: (rowA, rowB) =>
          Number(rowA.original.views || 0) - Number(rowB.original.views || 0),
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
        size: 130,
        sortingFn: (rowA, rowB) =>
          new Date(rowA.original.createdAt).getTime() -
          new Date(rowB.original.createdAt).getTime(),
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
    <div className="font-sans">
      <DataTable
        columns={columns}
        data={displayedPosts}
        loading={loading}
        onRowClick={(item) => router.push(`/admin/posts/${item.id}`)}
        searchPlaceholder="Search by title, slug, summary..."
        toolbarLeft={
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="h-9 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <TabsTrigger value="all" className="text-xs font-semibold px-3 h-8 rounded-md data-[state=active]:bg-white data-[state=active]:text-[#004776] data-[state=active]:shadow-xs">
                <FileText className="mr-1.5 size-3.5" />
                <span>All ({posts.length})</span>
              </TabsTrigger>
              <TabsTrigger value="published" className="text-xs font-semibold px-3 h-8 rounded-md data-[state=active]:bg-white data-[state=active]:text-[#115eff] data-[state=active]:shadow-xs">
                <Check className="mr-1.5 size-3.5 text-[#115eff]" />
                <span>Published ({posts.filter((p) => p.status === "PUBLISHED").length})</span>
              </TabsTrigger>
              <TabsTrigger value="draft" className="text-xs font-semibold px-3 h-8 rounded-md data-[state=active]:bg-white data-[state=active]:text-slate-700 data-[state=active]:shadow-xs">
                <Edit2 className="mr-1.5 size-3.5 text-slate-500" />
                <span>Drafts ({posts.filter((p) => p.status === "DRAFT").length})</span>
              </TabsTrigger>
              <TabsTrigger value="archived" className="text-xs font-semibold px-3 h-8 rounded-md data-[state=active]:bg-white data-[state=active]:text-slate-700 data-[state=active]:shadow-xs">
                <Archive className="mr-1.5 size-3.5 text-slate-400" />
                <span>Archived ({posts.filter((p) => p.status === "ARCHIVED").length})</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        }
        toolbarRight={
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fetchPosts(false)}
              disabled={loading}
              className="h-9 w-9 p-0 text-slate-600 bg-white hover:bg-slate-50 border-slate-200 rounded-lg cursor-pointer"
              title="Refresh"
              aria-label="Refresh posts"
            >
              <RefreshCw className={cn("size-4", loading && "animate-spin text-[#115eff]")} />
            </Button>
            <Button
              size="sm"
              onClick={() => router.push("/admin/posts/create")}
              className="bg-[#115eff] hover:bg-[#0a4de6] text-white gap-1.5 text-xs sm:text-sm font-semibold rounded-lg h-9 px-3.5 cursor-pointer"
            >
              <Plus className="size-4" />
              <span>New Post</span>
            </Button>
          </>
        }
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
