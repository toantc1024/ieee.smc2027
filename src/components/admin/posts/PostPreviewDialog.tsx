"use client";

import React from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye, Calendar, User, ExternalLink } from "lucide-react";

interface PostPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: {
    id: string;
    title: string;
    slug: string;
    category: string;
    summary: string | null;
    content: string;
    coverImage: string | null;
    status: string;
    views: number;
    createdAt: string;
    author?: { name: string } | null;
  } | null;
}

export function PostPreviewDialog({
  open,
  onOpenChange,
  post,
}: PostPreviewDialogProps) {
  if (!post) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto font-sans p-6 sm:p-8">
        <DialogHeader className="pb-3 border-b border-slate-100 flex items-center justify-between">
          <DialogTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <Eye className="size-4 text-[#005496]" />
            Xem trước bài viết
          </DialogTitle>
        </DialogHeader>

        <article className="space-y-5 pt-2">
          {/* Cover image */}
          {post.coverImage && (
            <div className="relative w-full h-56 sm:h-72 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          )}

          {/* Meta header */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="font-semibold text-[#005496]">
                {post.category}
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="size-3.5" />
                {new Date(post.createdAt).toLocaleDateString("vi-VN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1.5">
                <User className="size-3.5" />
                {post.author?.name || "Ban tổ chức"}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
              {post.title}
            </h1>

            {post.summary && (
              <p className="text-sm text-slate-600 font-medium italic border-l-3 border-[#005496] pl-3 py-0.5">
                {post.summary}
              </p>
            )}
          </div>

          {/* Content Body */}
          <div
            className="prose prose-sm max-w-none text-slate-800 leading-relaxed pt-2 border-t border-slate-100"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>

        <DialogFooter className="pt-4 border-t border-slate-100 flex items-center justify-between sm:justify-between">
          <span className="text-xs text-slate-400">
            Trạng thái:{" "}
            <strong className="text-slate-700">
              {post.status === "PUBLISHED" ? "Đã xuất bản" : "Bản nháp"}
            </strong>
          </span>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-8 px-4 text-xs"
          >
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
