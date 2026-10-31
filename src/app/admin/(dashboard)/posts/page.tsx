"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import { ColumnDef } from "@tanstack/react-table";
import {
  Plus,
  Eye,
  Edit2,
  Trash2,
  FileText,
  ImageIcon,
  ChevronDown,
  Check,
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
import { DataTable } from "@/components/admin/data-table/DataTable";
import {
  PostFormDialog,
  PostFormData,
} from "@/components/admin/posts/PostFormDialog";
import { PostPreviewDialog } from "@/components/admin/posts/PostPreviewDialog";
import { PostDeleteDialog } from "@/components/admin/posts/PostDeleteDialog";
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

function PostCoverThumbnail({
  src,
  alt,
  onClick,
}: {
  src?: string | null;
  alt: string;
  onClick: () => void;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative w-24 h-14 sm:w-28 sm:h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 hover:border-[#115eff] transition-colors shrink-0 cursor-pointer block"
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
          <span className="text-[10px] font-medium text-slate-400">No cover</span>
        </div>
      )}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition-colors">
        <Eye className="size-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </button>
  );
}

export default function PostsManagementPage() {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);

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
      toast.error("Failed to load posts list");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

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

    toast.success(isEdit ? "Post updated successfully" : "Post created successfully");
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

    toast.success("Post deleted successfully");
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
        await fetchPosts();
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
        toast.success(`Category updated to ${newCategory}`);
      } catch (err: unknown) {
        await fetchPosts();
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
        accessorKey: "coverImage",
        header: "Cover",
        enableSorting: false,
        size: 130,
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex items-center justify-center py-1">
              <PostCoverThumbnail
                src={item.coverImage}
                alt={item.title}
                onClick={() => {
                  setActivePost(item);
                  setPreviewOpen(true);
                }}
              />
            </div>
          );
        },
      },
      {
        accessorKey: "title",
        header: "Post",
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="min-w-[240px] max-w-md py-1 space-y-1">
              <button
                type="button"
                onClick={() => {
                  setActivePost(item);
                  setPreviewOpen(true);
                }}
                className="font-semibold text-slate-900 hover:text-[#115eff] text-sm text-left line-clamp-2 transition-colors cursor-pointer block leading-snug"
                title={item.title}
              >
                {item.title}
              </button>
              {item.summary && (
                <p
                  className="text-xs text-slate-500 truncate leading-normal"
                  title={item.summary}
                >
                  {item.summary}
                </p>
              )}
              <div className="flex items-center gap-2 pt-0.5">
                <span
                  className="text-[11px] font-mono text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200 truncate max-w-[220px]"
                  title={`/${item.slug}`}
                >
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
                    className="inline-flex items-center justify-between gap-1.5 h-7 px-3 rounded-lg text-xs font-medium text-slate-700 border border-slate-200 bg-white hover:bg-slate-50 focus:outline-none focus:border-[#115eff] transition-colors cursor-pointer group"
                    title={cat}
                  >
                    <span className="truncate max-w-[130px]">{cat}</span>
                    <ChevronDown className="size-3 text-slate-400 group-hover:text-slate-600 transition-colors shrink-0" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-48 p-1.5 rounded-xl border border-slate-200 bg-white">
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
        cell: ({ row }) => {
          const item = row.original;
          const status = (row.getValue("status") as string) || item.status;
          return (
            <div className="flex items-center justify-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center justify-between gap-1.5 h-7 px-3 rounded-lg text-xs font-medium text-slate-700 border border-slate-200 bg-white hover:bg-slate-50 focus:outline-none focus:border-[#115eff] transition-colors cursor-pointer group"
                    title={status}
                  >
                    <span className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          "size-1.5 rounded-full",
                          status === "PUBLISHED"
                            ? "bg-[#115eff]"
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
                    <ChevronDown className="size-3 text-slate-400 group-hover:text-slate-600 transition-colors" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-40 p-1.5 rounded-xl border border-slate-200 bg-white">
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
                      <span className="size-1.5 rounded-full bg-slate-300" />
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
        cell: ({ row }) => {
          const val = Number(row.getValue("views") || 0);
          return (
            <div
              className="text-center font-medium text-slate-600 text-sm truncate"
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
        cell: ({ row }) => {
          const date = new Date(row.getValue("createdAt"));
          return (
            <div
              className="text-center text-xs text-slate-500 font-medium truncate"
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
                className="p-1.5 text-slate-500 hover:text-[#115eff] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
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
                className="p-1.5 text-slate-500 hover:text-[#115eff] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
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
                className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
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
            <FileText className="size-6 text-[#115eff]" />
            Posts &amp; News
          </h1>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            type="button"
            size="sm"
            onClick={() => {
              setActivePost(null);
              setFormOpen(true);
            }}
            className="h-9 px-4 text-xs bg-[#115eff] hover:bg-[#0a4de6] text-white border border-transparent"
          >
            <Plus className="size-4 mr-1.5" />
            New Post
          </Button>
        </div>
      </div>

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
          <div className="flex items-center gap-2 ml-2">
            <Button
              type="button"
              size="sm"
              onClick={() => handleBatchStatus(selected, "PUBLISHED", clear)}
              className="h-7 px-3 text-xs font-medium bg-[#115eff] hover:bg-[#0a4de6] text-white border border-transparent"
            >
              Publish
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => handleBatchStatus(selected, "DRAFT", clear)}
              className="h-7 px-3 text-xs font-medium bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            >
              Set Draft
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleBatchDelete(selected, clear)}
              className="h-7 px-3 text-xs font-medium bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900"
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
