"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { slugify } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface PostFormData {
  id?: string;
  title: string;
  slug: string;
  category: string;
  summary: string;
  content: string;
  coverImage: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
}

interface PostFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post?: PostFormData | null;
  onSave: (data: PostFormData) => Promise<void>;
}

const CATEGORIES = [
  "Thông báo",
  "Call for Papers",
  "Diễn giả & Keynote",
  "Hội thảo & Workshop",
  "Tin tức chung",
];

export function PostFormDialog({
  open,
  onOpenChange,
  post,
  onSave,
}: PostFormDialogProps) {
  const isEdit = Boolean(post?.id);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("Thông báo");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED" | "ARCHIVED">("PUBLISHED");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      if (post) {
        setTitle(post.title || "");
        setSlug(post.slug || "");
        setCategory(post.category || "Thông báo");
        setSummary(post.summary || "");
        setContent(post.content || "");
        setCoverImage(post.coverImage || "");
        setStatus(post.status || "PUBLISHED");
      } else {
        setTitle("");
        setSlug("");
        setCategory("Thông báo");
        setSummary("");
        setContent("");
        setCoverImage("/news/keynote-hoi-thao.jpg");
        setStatus("PUBLISHED");
      }
      setError("");
    }
  }, [open, post]);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEdit) {
      setSlug(slugify(val));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Vui lòng nhập tiêu đề bài viết");
      return;
    }
    if (!content.trim()) {
      setError("Vui lòng nhập nội dung bài viết");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await onSave({
        id: post?.id,
        title: title.trim(),
        slug: slug.trim() || slugify(title.trim()),
        category,
        summary: summary.trim(),
        content: content.trim(),
        coverImage: coverImage.trim(),
        status,
      });
      onOpenChange(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Không thể lưu bài viết");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto font-sans p-6">
        <DialogHeader className="pb-3 border-b border-slate-100">
          <DialogTitle className="text-lg font-bold text-slate-900">
            {isEdit ? "Chỉnh sửa bài viết" : "Tạo bài viết mới"}
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-1 text-xs">
          {/* Tiêu đề */}
          <div className="space-y-1.5">
            <Label className="font-semibold text-slate-700 normal-case tracking-normal">
              Tiêu đề bài viết <span className="text-rose-500">*</span>
            </Label>
            <Input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Nhập tiêu đề thông báo hoặc bài viết..."
              className="h-9 px-3 text-xs border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
              required
            />
          </div>

          {/* Đường dẫn & Chuyên mục */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="font-semibold text-slate-700 normal-case tracking-normal">
                Đường dẫn (Slug)
              </Label>
              <Input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="duong-dan-bai-viet"
                className="h-9 px-3 text-xs border-slate-200 rounded-lg bg-slate-50 focus:bg-white font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="font-semibold text-slate-700 normal-case tracking-normal">
                Chuyên mục
              </Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-9 w-full bg-slate-50 border-slate-200 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Trạng thái & Ảnh bìa */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="font-semibold text-slate-700 normal-case tracking-normal">
                Trạng thái xuất bản
              </Label>
              <Select
                value={status}
                onValueChange={(val) =>
                  setStatus(val as "DRAFT" | "PUBLISHED" | "ARCHIVED")
                }
              >
                <SelectTrigger className="h-9 w-full bg-slate-50 border-slate-200 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PUBLISHED">Đã xuất bản (Công khai)</SelectItem>
                  <SelectItem value="DRAFT">Bản nháp (Chưa công khai)</SelectItem>
                  <SelectItem value="ARCHIVED">Lưu trữ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="font-semibold text-slate-700 normal-case tracking-normal">
                Ảnh bìa (Đường dẫn URL)
              </Label>
              <Input
                type="text"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="/news/hcmute.jpg hoặc link ảnh"
                className="h-9 px-3 text-xs border-slate-200 rounded-lg bg-slate-50 focus:bg-white font-medium"
              />
            </div>
          </div>

          {/* Tóm tắt ngắn */}
          <div className="space-y-1.5">
            <Label className="font-semibold text-slate-700 normal-case tracking-normal">
              Tóm tắt ngắn (Hiển thị ở trang chủ)
            </Label>
            <Textarea
              rows={2}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Nhập 1-2 câu tóm tắt nội dung chính..."
              className="min-h-[64px] p-2.5 text-xs border-slate-200 rounded-lg bg-slate-50 focus:bg-white resize-none"
            />
          </div>

          {/* Nội dung chi tiết */}
          <div className="space-y-1.5">
            <Label className="font-semibold text-slate-700 normal-case tracking-normal">
              Nội dung bài viết <span className="text-rose-500">*</span>
            </Label>
            <Textarea
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Nhập nội dung bài viết (hỗ trợ văn bản hoặc HTML cơ bản)..."
              className="min-h-[160px] p-3 text-xs border-slate-200 rounded-lg bg-slate-50 focus:bg-white font-medium leading-relaxed resize-y"
              required
            />
          </div>

          <DialogFooter className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={saving}
              className="h-9 px-4 text-xs"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={saving}
              className="h-9 px-5 text-xs bg-[#005496] hover:bg-[#004276] text-white"
            >
              {saving ? (
                <>
                  <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                  Đang lưu...
                </>
              ) : isEdit ? (
                "Cập nhật bài viết"
              ) : (
                "Tạo bài viết"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
