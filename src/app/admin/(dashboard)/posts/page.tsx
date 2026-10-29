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

const POST_CATEGORIES = [
  "Thông báo",
  "Call for Papers",
  "Diễn giả & Keynote",
  "Hội thảo & Workshop",
  "Tin tức chung",
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
      setAlert({ type: "error", text: "Không thể tải danh sách bài viết" });
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
      if (!res.ok) throw new Error(data.error || "Không thể nạp bài viết mẫu");
      setAlert({
        type: "success",
        text: "Đã đồng bộ danh sách bài viết mẫu chính thức của hội nghị!",
      });
      await fetchPosts();
    } catch (err: unknown) {
      setAlert({
        type: "error",
        text: err instanceof Error ? err.message : "Thao tác thất bại",
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
      throw new Error(data.error || "Lưu bài viết không thành công");
    }

    setAlert({
      type: "success",
      text: isEdit ? "Cập nhật bài viết thành công" : "Tạo bài viết mới thành công",
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
      throw new Error(data.error || "Xóa bài viết thất bại");
    }

    setAlert({ type: "success", text: "Đã xóa bài viết thành công" });
    await fetchPosts();
  };

  // Batch actions
  const handleBatchDelete = async (selected: PostItem[], clearSelection: () => void) => {
    if (!confirm(`Bạn có chắc muốn xóa ${selected.length} bài viết đã chọn?`)) return;
    try {
      await Promise.all(
        selected.map((item) =>
          fetch(`/api/admin/posts/${item.id}`, { method: "DELETE" })
        )
      );
      clearSelection();
      setAlert({ type: "success", text: `Đã xóa ${selected.length} bài viết` });
      await fetchPosts();
    } catch {
      setAlert({ type: "error", text: "Xảy ra lỗi khi xóa bài viết hàng loạt" });
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
        text: `Đã cập nhật trạng thái cho ${selected.length} bài viết`,
      });
      await fetchPosts();
    } catch {
      setAlert({ type: "error", text: "Xảy ra lỗi khi cập nhật trạng thái" });
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
        if (!res.ok) throw new Error(data.error || "Không thể cập nhật trạng thái");
        setAlert({
          type: "success",
          text: `Đã đổi trạng thái thành ${
            newStatus === "PUBLISHED"
              ? "Đã xuất bản"
              : newStatus === "DRAFT"
              ? "Bản nháp"
              : "Lưu trữ"
          }!`,
        });
      } catch (err: unknown) {
        await fetchPosts();
        setAlert({
          type: "error",
          text: err instanceof Error ? err.message : "Cập nhật trạng thái thất bại",
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
        if (!res.ok) throw new Error(data.error || "Không thể cập nhật chuyên mục");
        setAlert({
          type: "success",
          text: `Đã đổi chuyên mục sang "${newCategory}"!`,
        });
      } catch (err: unknown) {
        await fetchPosts();
        setAlert({
          type: "error",
          text: err instanceof Error ? err.message : "Cập nhật chuyên mục thất bại",
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
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Chọn tất cả"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Chọn dòng"
          />
        ),
        size: 36,
        enableSorting: false,
      },
      {
        accessorKey: "title",
        header: "Bài viết",
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex items-center gap-3 min-w-[280px]">
              {/* Thumbnail preview */}
              <div className="relative size-11 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
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
                  className="font-semibold text-slate-900 hover:text-[#005496] text-left truncate block max-w-md transition-colors cursor-pointer"
                  title="Nhấn để xem trước bài viết"
                >
                  {item.title}
                </button>
                <span className="text-[11px] text-slate-400 font-medium truncate block max-w-xs">
                  /{item.slug}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "category",
        header: "Chuyên mục",
        cell: ({ row }) => {
          const item = row.original;
          const cat = (row.getValue("category") as string) || item.category;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 px-2 py-1 -mx-2 rounded-md hover:bg-slate-100 focus:outline-none focus:ring-1 focus:ring-[#005496] transition-colors cursor-pointer group"
                  title="Nhấn để đổi chuyên mục nhanh"
                >
                  <span className="truncate max-w-[130px]">{cat}</span>
                  <ChevronDown className="size-3 text-slate-400 opacity-60 group-hover:opacity-100 transition-opacity shrink-0" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48 p-1">
                {POST_CATEGORIES.map((categoryOption) => (
                  <DropdownMenuItem
                    key={categoryOption}
                    onClick={() => handleQuickCategoryChange(item.id, categoryOption)}
                    className="flex items-center justify-between py-1.5 px-2.5 text-xs cursor-pointer"
                  >
                    <span className="truncate">{categoryOption}</span>
                    {cat === categoryOption && (
                      <Check className="size-3.5 text-[#005496] shrink-0 ml-2" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Trạng thái",
        cell: ({ row }) => {
          const item = row.original;
          const status = (row.getValue("status") as string) || item.status;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 -mx-2 rounded-md hover:bg-slate-100 focus:outline-none focus:ring-1 focus:ring-[#005496] transition-colors cursor-pointer group"
                  title="Nhấn để đổi trạng thái nhanh"
                >
                  {status === "PUBLISHED" ? (
                    <span className="inline-flex items-center gap-1.5 text-emerald-700">
                      <span className="size-2 rounded-full bg-emerald-500" />
                      <span>Đã xuất bản</span>
                    </span>
                  ) : status === "DRAFT" ? (
                    <span className="inline-flex items-center gap-1.5 text-amber-700">
                      <span className="size-2 rounded-full bg-amber-500" />
                      <span>Bản nháp</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-slate-600">
                      <span className="size-2 rounded-full bg-slate-400" />
                      <span>Lưu trữ</span>
                    </span>
                  )}
                  <ChevronDown className="size-3 text-slate-400 opacity-60 group-hover:opacity-100 transition-opacity" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-40 p-1">
                <DropdownMenuItem
                  onClick={() => handleQuickStatusChange(item.id, "PUBLISHED")}
                  className="flex items-center justify-between py-1.5 px-2.5 text-xs cursor-pointer"
                >
                  <span className="flex items-center gap-2 text-emerald-700 font-medium">
                    <span className="size-2 rounded-full bg-emerald-500" />
                    Đã xuất bản
                  </span>
                  {status === "PUBLISHED" && (
                    <Check className="size-3.5 text-emerald-700" />
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleQuickStatusChange(item.id, "DRAFT")}
                  className="flex items-center justify-between py-1.5 px-2.5 text-xs cursor-pointer"
                >
                  <span className="flex items-center gap-2 text-amber-700 font-medium">
                    <span className="size-2 rounded-full bg-amber-500" />
                    Bản nháp
                  </span>
                  {status === "DRAFT" && (
                    <Check className="size-3.5 text-amber-700" />
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleQuickStatusChange(item.id, "ARCHIVED")}
                  className="flex items-center justify-between py-1.5 px-2.5 text-xs cursor-pointer"
                >
                  <span className="flex items-center gap-2 text-slate-600 font-medium">
                    <span className="size-2 rounded-full bg-slate-400" />
                    Lưu trữ
                  </span>
                  {status === "ARCHIVED" && (
                    <Check className="size-3.5 text-slate-600" />
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
      {
        accessorKey: "views",
        header: "Lượt xem",
        cell: ({ row }) => {
          const val = Number(row.getValue("views") || 0);
          return (
            <span className="font-medium text-slate-600">
              {val.toLocaleString("vi-VN")}
            </span>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "Ngày tạo",
        cell: ({ row }) => {
          const date = new Date(row.getValue("createdAt"));
          return (
            <span className="text-slate-500 font-medium">
              {date.toLocaleDateString("vi-VN")}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex items-center justify-end gap-1">
              <button
                type="button"
                onClick={() => {
                  setActivePost(item);
                  setPreviewOpen(true);
                }}
                className="p-1.5 text-slate-400 hover:text-[#005496] hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                title="Xem trước bài viết"
              >
                <Eye className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setActivePost(item);
                  setFormOpen(true);
                }}
                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors cursor-pointer"
                title="Chỉnh sửa bài viết"
              >
                <Edit2 className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setActivePost(item);
                  setDeleteOpen(true);
                }}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                title="Xóa bài viết"
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
            Bài viết &amp; Tin tức
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý thông báo chính thức, tin tức hội nghị và bài viết Call for Papers.
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
            Bài mẫu
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
            Viết bài mới
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
        searchPlaceholder="Tìm theo tiêu đề, slug, nội dung..."
        filterColumns={[
          {
            id: "status",
            title: "Trạng thái",
            options: [
              { label: "Đã xuất bản", value: "PUBLISHED" },
              { label: "Bản nháp", value: "DRAFT" },
              { label: "Lưu trữ", value: "ARCHIVED" },
            ],
          },
          {
            id: "category",
            title: "Chuyên mục",
            options: [
              { label: "Thông báo", value: "Thông báo" },
              { label: "Call for Papers", value: "Call for Papers" },
              { label: "Diễn giả & Keynote", value: "Keynote" },
              { label: "Hội thảo & Workshop", value: "Hội thảo & Workshop" },
            ],
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
              Xuất bản
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => handleBatchStatus(selected, "DRAFT", clear)}
              className="h-7 px-2.5 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-none"
            >
              Chuyển nháp
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => handleBatchDelete(selected, clear)}
              className="h-7 px-2.5 text-xs font-semibold"
            >
              Xóa đã chọn
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
