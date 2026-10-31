"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye, Calendar, User, ImageIcon } from "lucide-react";

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
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [post?.id, post?.coverImage]);

  if (!post) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto font-sans p-6 sm:p-8">
        <DialogHeader className="pb-3 border-b border-slate-100 flex items-center justify-between">
          <DialogTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <Eye className="size-4 text-[#115eff]" />
            Post Preview
          </DialogTitle>
        </DialogHeader>

        <article className="space-y-5 pt-2">
          {/* Cover image with error fallback */}
          {post.coverImage && (
            <div className="relative w-full h-56 sm:h-72 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
              {!imgError ? (
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  className="object-cover"
                  unoptimized
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="size-full flex flex-col items-center justify-center gap-2 text-slate-400 bg-slate-100">
                  <ImageIcon className="size-8 text-slate-300" />
                  <span className="text-xs font-medium">Cover image not available</span>
                </div>
              )}
            </div>
          )}

          {/* Meta header */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="font-semibold text-[#115eff]">
                {post.category}
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="size-3.5" />
                {new Date(post.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1.5">
                <User className="size-3.5" />
                {post.author?.name || "Organizing Committee"}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
              {post.title}
            </h1>

            {post.summary && (
              <p className="text-sm text-slate-600 font-medium italic border-l-3 border-[#115eff] pl-3 py-0.5">
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
          <span className="text-xs text-slate-500">
            Status:{" "}
            <strong className="text-slate-800 font-semibold">
              {post.status === "PUBLISHED"
                ? "Published"
                : post.status === "DRAFT"
                ? "Draft"
                : "Archived"}
            </strong>
          </span>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-8 px-4 text-xs bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shadow-none"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
