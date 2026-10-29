"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import { ColumnDef } from "@tanstack/react-table";
import {
  Plus,
  RefreshCw,
  Eye,
  Edit2,
  Trash2,
  FileText,
  ImageIcon,
  ChevronDown,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable } from "@/components/admin/data-table/DataTable";
import {
  PostFormDialog,
  PostFormData,
} from "@/components/admin/posts/PostFormDialog";
import { PostPreviewDialog } from "@/components/admin/posts/PostPreviewDialog";
import { PostDeleteDialog } from "@/components/admin/posts/PostDeleteDialog";
import { StatusAlertBanner } from "@/components/shared/StatusAlertBanner";
import { cn } from "@/lib/utils";

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

export const POST_CATEGORIES = [
  "Announcements",
  "Call for Papers",
  "Keynotes & Speakers",
  "Workshops",
  "General News",
];

export default function PostsManagementPage() {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Dialog states
  const [formOpen, setFormOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [activePost, setActivePost] = useState<PostItem | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/posts");
      const data = await res.json();
      if (data.posts) {
        setPosts(data.posts);
      }
    } catch {
      setAlert({ type: "error", text: "Failed to load posts list" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Re-seed default posts handler
  const handleSeedDefaultPosts = async () => {
    setActionLoading(true);
    setAlert(null);
    try {
      const res = await fetch("/api/admin/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "seed" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load sample posts");
      setAlert({
        type: "success",
        text: "Official conference sample posts synchronized successfully!",
      });
      await fetchPosts();
    } catch (err: unknown) {
      setAlert({
        type: "error",
        text: err instanceof Error ? err.message : "Operation failed",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Save post (Create or Edit)
  const handleSavePost = async (formData: PostFormData) => {
    const isEdit = Boolean(formData.id);
    const url = isEdit ? `/api/admin/posts/${formData.id}` : "/api/admin/posts";
    const method = isEdit ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to save post");
    }

    setAlert({
      type: "success",
      text: isEdit ? "Post updated successfully!" : "Post created successfully!",
    });
    await fetchPosts();
  };

  // Delete post
  const handleDeletePost = async (id: string) => {
    const res = await fetch(`/api/admin/posts/${id}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to delete post");
    }

    setAlert({ type: "success", text: "Post deleted successfully!" });
    await fetchPosts();
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
      setAlert({ type: "success", text: `Deleted ${selected.length} post(s) successfully!` });
      await fetchPosts();
    } catch {
      setAlert({ type: "error", text: "Error deleting posts in batch" });
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
      setAlert({
        type: "success",
        text: `Updated status for ${selected.length} post(s) successfully!`,
      });
      await fetchPosts();
    } catch {
      setAlert({ type: "error", text: "Error updating status in batch" });
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
        setAlert({
          type: "success",
          text: `Status changed to ${
            newStatus === "PUBLISHED"
              ? "Published"
              : newStatus === "DRAFT"
              ? "Draft"
              : "Archived"
          } successfully!`,
        });
      } catch (err: unknown) {
        await fetchPosts();
        setAlert({
          type: "error",
          text: err instanceof Error ? err.message : "Failed to update status",
        });
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
        setAlert({
          type: "success",
          text: `Category changed to "${newCategory}" successfully!`,
        });
      } catch (err: unknown) {
        await fetchPosts();
        setAlert({
          type: "error",
          text: err instanceof Error ? err.message : "Failed to update category",
        });
      }
    },
    [fetchPosts]
  );

  // Column definitions using @tanstack/react-table
  const columns = useMemo<ColumnDef<PostItem, any>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <div className="flex items-center justify-center">
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
          <div className="flex items-center justify-center">
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
        accessorKey: "title",
        header: "Post",
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex items-center gap-3 min-w-[280px]">
              {/* Thumbnail preview */}
              <div className="relative size-11 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                {item.coverImage ? (
                  <Image
                    src={item.coverImage}
                    alt=""
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="size-full flex items-center justify-center text-slate-300">
                    <ImageIcon className="size-4" />
                  </div>
                )}
              </div>

              {/* Title & Slug */}
              <div className="min-w-0">
                <button
                  type="button"
                  onClick={() => {
                    setActivePost(item);
                    setPreviewOpen(true);
                  }}
                  className="font-semibold text-slate-900 hover:text-[#005496] text-sm text-left truncate block max-w-md transition-colors cursor-pointer"
                  title="Click to preview post"
                >
                  {item.title}
                </button>
                <span className="text-xs text-slate-400 font-medium truncate block max-w-xs">
                  /{item.slug}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => {
          const item = row.original;
          const cat = (row.getValue("category") as string) || item.category;
          return (
            <div className="flex items-center justify-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center justify-between gap-1.5 h-7 px-3 rounded-full text-xs font-medium text-slate-700 border border-slate-200 bg-slate-50/80 hover:bg-slate-100 focus:outline-none focus:ring-1 focus:ring-[#005496] transition-colors cursor-pointer group shadow-2xs"
                    title="Click to quick-change category"
                  >
                    <span className="truncate max-w-[130px]">{cat}</span>
                    <ChevronDown className="size-3 text-slate-400 opacity-60 group-hover:opacity-100 transition-opacity shrink-0" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-48 p-1.5 rounded-2xl shadow-xl border border-slate-200">
                  {POST_CATEGORIES.map((categoryOption) => (
                    <DropdownMenuItem
                      key={categoryOption}
                      onClick={() => handleQuickCategoryChange(item.id, categoryOption)}
                      className="flex items-center justify-between py-1.5 px-2.5 text-xs rounded-xl cursor-pointer"
                    >
                      <span className="truncate">{categoryOption}</span>
                      {cat === categoryOption && (
                        <Check className="size-3.5 text-[#005496] shrink-0 ml-2" />
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
        cell: ({ row }) => {
          const item = row.original;
          const status = (row.getValue("status") as string) || item.status;
          return (
            <div className="flex items-center justify-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      "inline-flex items-center justify-between gap-1.5 h-7 px-3 rounded-full text-xs font-semibold border transition-colors cursor-pointer group shadow-2xs focus:outline-none focus:ring-1 focus:ring-[#005496]",
                      status === "PUBLISHED"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/70"
                        : status === "DRAFT"
                        ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100/70"
                        : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200/70"
                    )}
                    title="Click to quick-change status"
                  >
                    <span className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          "size-1.5 rounded-full",
                          status === "PUBLISHED"
                            ? "bg-emerald-500"
                            : status === "DRAFT"
                            ? "bg-amber-500"
                            : "bg-slate-400"
                        )}
                      />
                      <span>
                        {status === "PUBLISHED"
                          ? "Published"
                          : status === "DRAFT"
                          ? "Draft"
                          : "Archived"}
                      </span>
                    </span>
                    <ChevronDown className="size-3 opacity-60 group-hover:opacity-100 transition-opacity" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-40 p-1.5 rounded-2xl shadow-xl border border-slate-200">
                  <DropdownMenuItem
                    onClick={() => handleQuickStatusChange(item.id, "PUBLISHED")}
                    className="flex items-center justify-between py-1.5 px-2.5 text-xs rounded-xl cursor-pointer"
                  >
                    <span className="flex items-center gap-2 text-emerald-700 font-semibold">
                      <span className="size-1.5 rounded-full bg-emerald-500" />
                      Published
                    </span>
                    {status === "PUBLISHED" && (
                      <Check className="size-3.5 text-emerald-700" />
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleQuickStatusChange(item.id, "DRAFT")}
                    className="flex items-center justify-between py-1.5 px-2.5 text-xs rounded-xl cursor-pointer"
                  >
                    <span className="flex items-center gap-2 text-amber-700 font-semibold">
                      <span className="size-1.5 rounded-full bg-amber-500" />
                      Draft
                    </span>
                    {status === "DRAFT" && (
                      <Check className="size-3.5 text-amber-700" />
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleQuickStatusChange(item.id, "ARCHIVED")}
                    className="flex items-center justify-between py-1.5 px-2.5 text-xs rounded-xl cursor-pointer"
                  >
                    <span className="flex items-center gap-2 text-slate-600 font-medium">
                      <span className="size-1.5 rounded-full bg-slate-400" />
                      Archived
                    </span>
                    {status === "ARCHIVED" && (
                      <Check className="size-3.5 text-slate-600" />
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
        cell: ({ row }) => {
          const val = Number(row.getValue("views") || 0);
          return (
            <div className="text-center font-medium text-slate-600 text-sm">
              {val.toLocaleString("en-US")}
            </div>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "Created Date",
        cell: ({ row }) => {
          const date = new Date(row.getValue("createdAt"));
          return (
            <div className="text-center text-xs text-slate-500 font-medium">
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
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex items-center justify-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setActivePost(item);
                  setPreviewOpen(true);
                }}
                className="p-1.5 text-slate-400 hover:text-[#005496] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                title="Preview post"
              >
                <Eye className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setActivePost(item);
                  setFormOpen(true);
                }}
                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                title="Edit post"
              >
                <Edit2 className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setActivePost(item);
                  setDeleteOpen(true);
                }}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                title="Delete post"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          );
        },
        enableSorting: false,
        size: 90,
      },
    ],
    [handleQuickStatusChange, handleQuickCategoryChange]
  );

  return (
    <div className="space-y-4">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <FileText className="size-6 text-[#005496]" />
            Posts &amp; News
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage conference announcements, call for papers, and news articles.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSeedDefaultPosts}
            disabled={actionLoading}
            className="h-9 px-3.5 text-xs text-slate-600 border-slate-200"
          >
            <RefreshCw
              className={cn("size-3.5 mr-1.5", actionLoading && "animate-spin")}
            />
            Seed Sample
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={() => {
              setActivePost(null);
              setFormOpen(true);
            }}
            className="h-9 px-4 text-xs bg-[#005496] hover:bg-[#004276] text-white shadow-xs"
          >
            <Plus className="size-4 mr-1.5" />
            New Post
          </Button>
        </div>
      </div>

      {/* Alert banner */}
      {alert && (
        <StatusAlertBanner
          variant={alert.type}
          message={alert.text}
          onDismiss={() => setAlert(null)}
        />
      )}

      {/* ── Advanced Table ── */}
      <DataTable
        columns={columns}
        data={posts}
        loading={loading}
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
              className="h-7 px-2.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-none"
            >
              Publish
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => handleBatchStatus(selected, "DRAFT", clear)}
              className="h-7 px-2.5 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-none"
            >
              Set Draft
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => handleBatchDelete(selected, clear)}
              className="h-7 px-2.5 text-xs font-semibold"
            >
              Delete selected
            </Button>
          </div>
        )}
      />

      {/* ── Dialogs ── */}
      <PostFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        post={
          activePost
            ? {
                id: activePost.id,
                title: activePost.title,
                slug: activePost.slug,
                category: activePost.category,
                summary: activePost.summary || "",
                content: activePost.content,
                coverImage: activePost.coverImage || "",
                status: activePost.status,
              }
            : null
        }
        onSave={handleSavePost}
      />

      <PostPreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        post={activePost}
      />

      <PostDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        post={activePost}
        onConfirm={handleDeletePost}
      />
    </div>
  );
}
