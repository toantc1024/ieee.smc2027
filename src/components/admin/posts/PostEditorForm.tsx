"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Save,
  Send,
  Eye,
  EyeOff,
  Type,
  Image as ImageIcon,
  FolderOpen,
  Link as LinkIcon,
  FileText,
  ChevronLeft,
  ChevronRight,
  Crop,
  X,
  Upload,
  RefreshCw,
  Rocket,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
import { TiptapEditor } from "@/components/admin/TiptapEditor";
import { PostPreviewDialog } from "@/components/admin/posts/PostPreviewDialog";
import { ImageInsertModal } from "@/components/admin/tiptap/ImageInsertModal";
import { POST_CATEGORIES } from "@/app/admin/(dashboard)/posts/page";
import { cn } from "@/lib/utils";

interface PostEditorFormProps {
  initialData?: {
    id?: string;
    title: string;
    slug: string;
    summary: string;
    content: string;
    coverImage: string | null;
    category: string;
    status: "DRAFT" | "PUBLISHED";
  };
  isEditMode?: boolean;
  onSave?: (data: {
    title: string;
    slug: string;
    summary: string;
    content: string;
    coverImage: string | null;
    category: string;
    status: "DRAFT" | "PUBLISHED";
  }) => Promise<void>;
  backUrl?: string;
}

export function PostEditorForm({
  initialData,
  isEditMode = false,
  onSave,
  backUrl = "/admin/posts",
}: PostEditorFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [summary, setSummary] = useState(initialData?.summary || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [coverImage, setCoverImage] = useState<string | null>(initialData?.coverImage || null);
  const [category, setCategory] = useState(initialData?.category || "Announcements");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">(
    initialData?.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT"
  );

  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [coverImgError, setCoverImgError] = useState(false);
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<"attributes" | "files">("attributes");

  // Modals
  const [showCoverModal, setShowCoverModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showDirtyBackDialog, setShowDirtyBackDialog] = useState(false);

  // Track initial state for dirty detection
  const initialDataRef = useRef({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    summary: initialData?.summary || "",
    content: initialData?.content || "",
    coverImage: initialData?.coverImage || null,
    category: initialData?.category || "Announcements",
    status: initialData?.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
  });

  const isDirty =
    title !== initialDataRef.current.title ||
    slug !== initialDataRef.current.slug ||
    summary !== initialDataRef.current.summary ||
    content !== initialDataRef.current.content ||
    coverImage !== initialDataRef.current.coverImage ||
    category !== initialDataRef.current.category ||
    status !== initialDataRef.current.status;

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slug || !isEditMode) {
      const generatedSlug = val
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setSlug(generatedSlug);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      const uploadedUrl = data.url || data.data?.url || data.data?.proxyUrl;
      if (uploadedUrl) {
        setCoverImage(uploadedUrl);
        setCoverImgError(false);
        toast.success("Cover image uploaded successfully");
      } else {
        toast.error(data.error || "Failed to upload cover image");
      }
    } catch {
      toast.error("Unable to upload cover image");
    } finally {
      setIsUploadingCover(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = async (submitStatus?: "DRAFT" | "PUBLISHED") => {
    const targetStatus = submitStatus || status;

    if (!title.trim()) {
      toast.error("Please enter a post title");
      return;
    }
    if (!content.trim() || content === "<p></p>") {
      toast.error("Please enter post content");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        title: title.trim(),
        slug: slug.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        summary: summary.trim(),
        content,
        coverImage,
        category,
        status: targetStatus,
      };

      if (onSave) {
        await onSave(payload);
      } else if (isEditMode && initialData?.id) {
        const res = await fetch(`/api/admin/posts/${initialData.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to save post");
        setStatus(targetStatus);
        initialDataRef.current = { ...payload };
        toast.success(
          targetStatus === "PUBLISHED" ? "Post published successfully" : "Draft saved successfully"
        );
        router.push(`/admin/posts/${initialData.id}`);
      } else {
        const res = await fetch("/api/admin/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create post");
        toast.success(
          targetStatus === "PUBLISHED" ? "Post published successfully" : "Draft created successfully"
        );
        const createdId = data.post?.id || data.id;
        if (createdId) {
          router.push(`/admin/posts/${createdId}`);
        } else {
          router.push("/admin/posts");
        }
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save post");
    } finally {
      setIsSaving(false);
    }
  };

  const handleBackSafe = () => {
    if (isDirty) {
      setShowDirtyBackDialog(true);
    } else {
      router.push(backUrl);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background select-none font-sans">
      {/* ── Top Header Bar ── */}
      <header className="shrink-0 bg-white dark:bg-card border-b border-border/80 z-20">
        <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 h-13 min-h-[52px] w-full min-w-0">
          {/* Back Button */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleBackSafe}
            className="size-9 shrink-0 cursor-pointer"
            title="Back"
          >
            <ArrowLeft className="size-4" />
          </Button>

          {/* Title Input inside Header */}
          <div
            className={cn(
              "flex-1 min-w-0 flex items-center h-9 border border-border rounded-md transition-all box-border bg-slate-50/50 dark:bg-muted/30",
              "focus-within:border-primary/40 focus-within:ring-1 focus-within:ring-primary/10 focus-within:bg-white dark:focus-within:bg-card"
            )}
          >
            <div className="px-2.5 sm:px-3 border-r border-border h-full flex items-center shrink-0">
              <Type className="size-4 text-muted-foreground/60" />
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder={isEditMode ? "Edit post title..." : "Enter new post title..."}
              className="flex-1 min-w-0 bg-transparent border-none outline-none h-full px-2.5 sm:px-3 text-sm font-semibold placeholder:text-muted-foreground/40 text-foreground"
            />
          </div>

          {/* Status Badge */}
          <div className="hidden sm:flex items-center gap-1.5 shrink-0">
            <Badge
              variant={status === "PUBLISHED" ? "default" : "secondary"}
              className={cn(
                "h-7 px-2.5 text-xs font-semibold rounded-md",
                status === "PUBLISHED"
                  ? "bg-[#115eff] text-white hover:bg-[#115eff]"
                  : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
              )}
            >
              {status === "PUBLISHED" ? "Published" : "Draft"}
            </Badge>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-1.5 shrink-0 ml-auto">
            {/* Preview Button */}
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setShowPreviewModal(true)}
              className="h-8 gap-1.5 cursor-pointer text-xs font-medium shrink-0 bg-white hover:bg-slate-50 border-slate-200 shadow-none"
              title="Preview post"
            >
              <Eye className="size-3.5" />
              <span className="hidden md:inline">Preview</span>
            </Button>

            {/* Save Draft Button */}
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => handleSave("DRAFT")}
              disabled={isSaving}
              className="h-8 gap-1.5 cursor-pointer text-xs font-medium shrink-0 bg-white hover:bg-slate-50 border-slate-200 shadow-none text-slate-700"
            >
              <Save className="size-3.5" />
              <span>Save Draft</span>
            </Button>

            {/* Publish / Unpublish Button */}
            {status === "PUBLISHED" ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => handleSave("DRAFT")}
                disabled={isSaving}
                className="h-8 gap-1.5 cursor-pointer text-xs font-medium shrink-0 border-amber-300 bg-amber-50/80 text-amber-700 hover:bg-amber-100 hover:text-amber-800 shadow-none"
              >
                <EyeOff className="size-3.5" />
                <span>Unpublish</span>
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                onClick={() => handleSave("PUBLISHED")}
                disabled={isSaving}
                className="h-8 gap-1.5 cursor-pointer text-xs font-semibold shrink-0 bg-[#115eff] hover:bg-[#0a4de6] text-white shadow-none"
              >
                <Rocket className="size-3.5" />
                <span>Publish Post</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* ── Main Two-Pane Workspace ── */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
        {/* ── Left Collapsible Attributes Sidebar ── */}
        {isLeftSidebarOpen ? (
          <aside className="w-full lg:w-[360px] xl:w-[390px] shrink-0 border-b lg:border-b-0 lg:border-r border-border/80 bg-white dark:bg-card flex flex-col overflow-hidden z-10 shadow-none">
            {/* Sidebar Sticky Header */}
            <div className="px-4 py-3 bg-muted/20 border-b border-border/80 flex items-center justify-between shrink-0">
              <div className="min-w-0">
                <h3 className="font-semibold text-sm text-foreground tracking-tight truncate">
                  Post Information
                </h3>
                <p className="text-xs text-muted-foreground truncate">
                  Cover image, category & summary
                </p>
              </div>

              <TooltipProvider delayDuration={150}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsLeftSidebarOpen(false)}
                      className="size-8 text-muted-foreground hover:text-foreground cursor-pointer"
                      aria-label="Collapse sidebar"
                    >
                      <ChevronLeft className="size-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    Collapse sidebar
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Tab switch */}
            <div className="px-3 py-1.5 border-b border-border/70 bg-muted/10 shrink-0">
              <div className="grid grid-cols-2 p-0.5 rounded-lg bg-muted/60 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab("attributes")}
                  className={cn(
                    "flex items-center justify-center gap-1.5 py-1 px-2 rounded-md font-medium transition-all cursor-pointer",
                    activeTab === "attributes"
                      ? "bg-background text-foreground font-semibold shadow-none"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <FileText className="size-3.5" />
                  <span>Attributes</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("files")}
                  className={cn(
                    "flex items-center justify-center gap-1.5 py-1 px-2 rounded-md font-medium transition-all cursor-pointer",
                    activeTab === "files"
                      ? "bg-background text-foreground font-semibold shadow-none"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <ImageIcon className="size-3.5 text-primary" />
                  <span>Media</span>
                </button>
              </div>
            </div>

            {/* Scrollable Sidebar Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {activeTab === "attributes" ? (
                <>
                  {/* Card 1: Cover Image */}
                  <div
                    id="post-sidebar-cover"
                    className="rounded-xl border border-border/80 bg-slate-50/50 dark:bg-muted/20 p-3.5 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <ImageIcon className="size-4 text-muted-foreground" />
                        Cover Image
                      </label>
                      <span className="text-[11px] text-muted-foreground">16:9 ratio</span>
                    </div>

                    {coverImage && !coverImgError ? (
                      <div className="space-y-2">
                        <div className="relative group overflow-hidden rounded-lg border border-border bg-slate-100">
                          <div className="aspect-[16/9] w-full relative">
                            <Image
                              src={coverImage}
                              alt="Cover preview"
                              fill
                              className="object-cover rounded-lg"
                              unoptimized
                              onError={() => setCoverImgError(true)}
                            />
                          </div>
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              className="h-7 px-2.5 text-xs bg-white text-slate-900 hover:bg-slate-100 cursor-pointer font-medium"
                              onClick={() => setShowCoverModal(true)}
                            >
                              <Crop className="mr-1 size-3" />
                              Change
                            </Button>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="h-7 px-2.5 text-xs cursor-pointer font-medium"
                              onClick={() => setCoverImage(null)}
                            >
                              <X className="mr-1 size-3" />
                              Remove
                            </Button>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-0.5">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="flex-1 h-8 text-xs font-medium cursor-pointer bg-white"
                            onClick={() => setShowCoverModal(true)}
                          >
                            <ImageIcon className="mr-1.5 size-3.5 text-muted-foreground" />
                            Change Cover
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-xs text-rose-600 hover:bg-rose-50"
                            onClick={() => setCoverImage(null)}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="border border-dashed border-border rounded-lg p-4 text-center bg-white dark:bg-card">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <div className="size-10 rounded-full bg-slate-100 dark:bg-muted flex items-center justify-center text-muted-foreground">
                            <ImageIcon className="size-5" />
                          </div>
                          <div className="text-center">
                            <p className="text-xs font-medium text-foreground">
                              No cover image selected
                            </p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              Upload an image or paste an image URL
                            </p>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs font-medium cursor-pointer bg-white"
                              onClick={() => setShowCoverModal(true)}
                            >
                              <ImageIcon className="size-3 mr-1" />
                              Choose Image
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs font-medium cursor-pointer bg-white"
                              onClick={() => fileInputRef.current?.click()}
                              disabled={isUploadingCover}
                            >
                              <Upload className="size-3 mr-1" />
                              {isUploadingCover ? "Uploading..." : "Upload File"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleCoverUpload}
                      className="hidden"
                    />
                  </div>

                  {/* Card 2: Category */}
                  <div
                    id="post-sidebar-category"
                    className="rounded-xl border border-border/80 bg-slate-50/50 dark:bg-muted/20 p-3.5 space-y-2.5"
                  >
                    <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <FolderOpen className="size-4 text-primary" />
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full h-8 px-2.5 text-xs bg-white dark:bg-card border border-border rounded-lg font-medium text-foreground focus:outline-none focus:border-primary cursor-pointer"
                    >
                      {POST_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Card 3: URL Slug */}
                  <div
                    id="post-sidebar-slug"
                    className="rounded-xl border border-border/80 bg-slate-50/50 dark:bg-muted/20 p-3.5 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <LinkIcon className="size-4 text-muted-foreground" />
                        URL Slug
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const autoSlug = title
                            .toLowerCase()
                            .normalize("NFD")
                            .replace(/[\u0300-\u036f]/g, "")
                            .replace(/[^a-z0-9]+/g, "-")
                            .replace(/^-+|-+$/g, "");
                          setSlug(autoSlug);
                          toast.success("Slug generated from title");
                        }}
                        className="text-[11px] text-primary hover:underline cursor-pointer font-medium"
                      >
                        Auto-generate
                      </button>
                    </div>
                    <div className="flex items-center bg-white dark:bg-card border border-border rounded-lg px-2.5 h-8 text-xs text-muted-foreground">
                      <span className="font-mono text-[11px] opacity-70">/news/</span>
                      <input
                        type="text"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        placeholder="post-url-slug"
                        className="w-full py-1 pl-1 bg-transparent focus:outline-none text-foreground font-mono text-[11px]"
                      />
                    </div>
                  </div>

                  {/* Card 4: Summary / Excerpt */}
                  <div
                    id="post-sidebar-summary"
                    className="rounded-xl border border-border/80 bg-slate-50/50 dark:bg-muted/20 p-3.5 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <FileText className="size-4 text-muted-foreground" />
                        Summary Excerpt
                      </label>
                      <span className="text-[11px] text-muted-foreground">
                        {summary.length} chars
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                      placeholder="Short description displayed on news feeds and SEO cards..."
                      className="w-full p-2.5 text-xs text-foreground bg-white dark:bg-card border border-border rounded-lg focus:outline-none focus:border-primary resize-none leading-relaxed"
                    />
                  </div>
                </>
              ) : (
                /* Media Quick Upload Tab */
                <div className="space-y-3">
                  <div className="border border-dashed border-border rounded-xl p-6 text-center bg-slate-50/50 dark:bg-muted/20">
                    <ImageIcon className="size-8 mx-auto text-muted-foreground/60 mb-2" />
                    <p className="text-xs font-semibold text-foreground">Media & Attachments</p>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Upload images directly into your content or set as cover image
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setShowCoverModal(true)}
                      className="mt-3 h-8 text-xs font-medium bg-[#115eff] text-white"
                    >
                      <Upload className="size-3.5 mr-1.5" />
                      Insert Image to Content
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </aside>
        ) : (
          /* Minimized Left Rail */
          <aside className="w-12 shrink-0 border-r border-border/80 bg-white dark:bg-card flex flex-col items-center py-3 gap-3 z-10">
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsLeftSidebarOpen(true)}
                    className="size-8 text-muted-foreground hover:text-foreground cursor-pointer"
                    aria-label="Expand sidebar"
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs">
                  Expand post details
                </TooltipContent>
              </Tooltip>

              <div className="w-6 border-t border-border" />

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => {
                      setIsLeftSidebarOpen(true);
                      setTimeout(() => {
                        document.getElementById("post-sidebar-cover")?.scrollIntoView({ behavior: "smooth" });
                      }, 100);
                    }}
                    className="size-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                  >
                    <ImageIcon className="size-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs">
                  Cover Image
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => {
                      setIsLeftSidebarOpen(true);
                      setTimeout(() => {
                        document.getElementById("post-sidebar-category")?.scrollIntoView({ behavior: "smooth" });
                      }, 100);
                    }}
                    className="size-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                  >
                    <FolderOpen className="size-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs">
                  Category
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => {
                      setIsLeftSidebarOpen(true);
                      setTimeout(() => {
                        document.getElementById("post-sidebar-summary")?.scrollIntoView({ behavior: "smooth" });
                      }, 100);
                    }}
                    className="size-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                  >
                    <FileText className="size-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs">
                  Summary
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <button
              type="button"
              onClick={() => setIsLeftSidebarOpen(true)}
              className="mt-auto cursor-pointer py-2 px-1 text-[11px] font-semibold tracking-wider text-muted-foreground/60 hover:text-foreground transition-colors [writing-mode:vertical-rl] rotate-180 uppercase select-none"
              title="Click to expand"
            >
              Post Details
            </button>
          </aside>
        )}

        {/* ── Center Paper Canvas Workspace ── */}
        <div className="flex-1 min-w-0 min-h-0 overflow-hidden flex flex-col bg-slate-100/70 dark:bg-[#070b14]">
          <TiptapEditor
            content={content}
            onChange={setContent}
            placeholder="Write article content here..."
            documentStyle={true}
            className="flex-1 h-full min-h-0"
          />
        </div>
      </div>

      {/* ── Cover Image Insert Modal ── */}
      {showCoverModal && (
        <ImageInsertModal
          open={showCoverModal}
          onClose={() => setShowCoverModal(false)}
          onInsertImage={(src) => {
            setCoverImage(src);
            setCoverImgError(false);
          }}
        />
      )}

      {/* ── Preview Dialog Modal ── */}
      {showPreviewModal && (
        <PostPreviewDialog
          open={showPreviewModal}
          onOpenChange={setShowPreviewModal}
          post={{
            id: initialData?.id || "preview-post",
            title: title || "Untitled Post",
            slug: slug || "preview",
            summary,
            content,
            coverImage,
            category,
            status,
            views: 0,
            createdAt: new Date().toISOString(),
            author: { name: "Author" },
          }}
        />
      )}

      {/* ── Dirty Navigation Confirmation Dialog ── */}
      {showDirtyBackDialog && (
        <AlertDialog open={showDirtyBackDialog} onOpenChange={setShowDirtyBackDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Discard Unsaved Changes?</AlertDialogTitle>
              <AlertDialogDescription>
                You have unsaved changes in this post. Leaving this page will discard any modifications.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep Editing</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => router.push(backUrl)}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Discard & Leave
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}

export default PostEditorForm;
