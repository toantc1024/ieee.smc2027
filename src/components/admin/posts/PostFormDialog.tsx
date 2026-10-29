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

export const CATEGORIES = [
  "Announcements",
  "Call for Papers",
  "Keynotes & Speakers",
  "Workshops",
  "General News",
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
  const [category, setCategory] = useState("Announcements");
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
        setCategory(post.category || "Announcements");
        setSummary(post.summary || "");
        setContent(post.content || "");
        setCoverImage(post.coverImage || "");
        setStatus(post.status || "PUBLISHED");
      } else {
        setTitle("");
        setSlug("");
        setCategory("Announcements");
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
      setError("Please enter a post title");
      return;
    }
    if (!content.trim()) {
      setError("Please enter post content");
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
      setError(err instanceof Error ? err.message : "Failed to save post");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto font-sans p-6">
        <DialogHeader className="pb-3 border-b border-slate-100">
          <DialogTitle className="text-lg font-bold text-slate-900">
            {isEdit ? "Edit Post" : "Create New Post"}
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-1 text-xs">
          {/* Title */}
          <div className="space-y-1.5">
            <Label className="font-semibold text-slate-700 normal-case tracking-normal">
              Post Title <span className="text-rose-500">*</span>
            </Label>
            <Input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Enter announcement or article title..."
              className="h-9 px-3 text-xs border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
              required
            />
          </div>

          {/* Slug & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="font-semibold text-slate-700 normal-case tracking-normal">
                Slug URL
              </Label>
              <Input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="post-url-slug"
                className="h-9 px-3 text-xs border-slate-200 rounded-lg bg-slate-50 focus:bg-white font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="font-semibold text-slate-700 normal-case tracking-normal">
                Category
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

          {/* Status & Cover Image */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="font-semibold text-slate-700 normal-case tracking-normal">
                Publication Status
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
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="font-semibold text-slate-700 normal-case tracking-normal">
                Cover Image URL
              </Label>
              <Input
                type="text"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="/news/hcmute.jpg or image URL"
                className="h-9 px-3 text-xs border-slate-200 rounded-lg bg-slate-50 focus:bg-white font-medium"
              />
            </div>
          </div>

          {/* Short Summary */}
          <div className="space-y-1.5">
            <Label className="font-semibold text-slate-700 normal-case tracking-normal">
              Summary
            </Label>
            <Textarea
              rows={2}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Enter brief 1-2 sentence overview..."
              className="min-h-[64px] p-2.5 text-xs border-slate-200 rounded-lg bg-slate-50 focus:bg-white resize-none"
            />
          </div>

          {/* Content */}
          <div className="space-y-1.5">
            <Label className="font-semibold text-slate-700 normal-case tracking-normal">
              Post Content <span className="text-rose-500">*</span>
            </Label>
            <Textarea
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter post content (supports text or HTML formatting)..."
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
              Cancel
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
                  Saving...
                </>
              ) : isEdit ? (
                "Save Changes"
              ) : (
                "Create Post"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
