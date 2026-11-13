"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  Save,
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
  Rocket,
  History,
  RotateCcw,
  RefreshCw,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { TiptapEditor, type TiptapEditorHandle } from "@/components/admin/TiptapEditor";
import { ImageInsertModal } from "@/components/admin/tiptap/ImageInsertModal";
import { uploadPostMedia } from "@/components/admin/tiptap/upload";
import { POST_CATEGORIES } from "@/app/admin/(dashboard)/posts/page";
import { cn } from "@/lib/utils";
import {
  POSTS_SYNC_CHANNEL,
  broadcastPostSync,
  type PostVersionSnapshot,
} from "@/lib/post-sync";

interface PolledPostPayload {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  content: string;
  coverImage: string | null;
  category: string;
  status: string;
  updatedAt?: string;
  version?: number;
  histories?: PostVersionSnapshot[];
}

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
    version?: number;
    histories?: PostVersionSnapshot[];
    updatedAt?: string;
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
  const editorRef = useRef<TiptapEditorHandle>(null);

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

  // Modals & Version Polling
  const [showCoverModal, setShowCoverModal] = useState(false);
  const [showContentImageModal, setShowContentImageModal] = useState(false);
  const [showDirtyBackDialog, setShowDirtyBackDialog] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);

  const [version, setVersion] = useState<number>(initialData?.version ?? 1);
  const [histories, setHistories] = useState<PostVersionSnapshot[]>(
    initialData?.histories ?? []
  );
  const [lastSyncedUpdatedAt, setLastSyncedUpdatedAt] = useState<string>(
    initialData?.updatedAt || ""
  );
  const [remoteNewerPost, setRemoteNewerPost] = useState<PolledPostPayload | null>(null);
  const [restoringVersion, setRestoringVersion] = useState<number | null>(null);

  // Track initial state for dirty detection
  const [initialSnapshot, setInitialSnapshot] = useState({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    summary: initialData?.summary || "",
    content: initialData?.content || "",
    coverImage: initialData?.coverImage || null,
    category: initialData?.category || "Announcements",
    status: initialData?.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
  });

  const isDirty =
    title !== initialSnapshot.title ||
    slug !== initialSnapshot.slug ||
    summary !== initialSnapshot.summary ||
    content !== initialSnapshot.content ||
    coverImage !== initialSnapshot.coverImage ||
    category !== initialSnapshot.category ||
    status !== initialSnapshot.status;

  const applySyncedPost = useCallback((remote: PolledPostPayload) => {
    const nextStatus: "DRAFT" | "PUBLISHED" =
      remote.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT";
    const nextSnapshot = {
      title: remote.title || "",
      slug: remote.slug || "",
      summary: remote.summary || "",
      content: remote.content || "",
      coverImage: remote.coverImage || null,
      category: remote.category || "Announcements",
      status: nextStatus,
    };
    setTitle(nextSnapshot.title);
    setSlug(nextSnapshot.slug);
    setSummary(nextSnapshot.summary);
    setContent(nextSnapshot.content);
    setCoverImage(nextSnapshot.coverImage);
    setCategory(nextSnapshot.category);
    setStatus(nextStatus);
    setInitialSnapshot(nextSnapshot);
    editorRef.current?.setContent(nextSnapshot.content);
    if (typeof remote.version === "number") {
      setVersion(remote.version);
    }
    if (Array.isArray(remote.histories)) {
      setHistories(remote.histories);
    }
    if (remote.updatedAt) {
      setLastSyncedUpdatedAt(remote.updatedAt);
    }
    setRemoteNewerPost(null);
  }, []);

  const pollPostVersion = useCallback(async () => {
    if (!isEditMode || !initialData?.id || isSaving) return;
    try {
      const res = await fetch(`/api/admin/posts/${initialData.id}`, {
        cache: "no-store",
      });
      if (!res.ok) return;
      const data = await res.json();
      const remote: PolledPostPayload | undefined = data.post;
      if (!remote) return;

      const remoteHistories = Array.isArray(remote.histories)
        ? remote.histories
        : Array.isArray(data.histories)
          ? data.histories
          : null;
      if (remoteHistories) {
        setHistories(remoteHistories);
      }

      const remoteVer = remote.version ?? data.version ?? version;
      const hasNewerVersion =
        (remote.updatedAt && lastSyncedUpdatedAt && remote.updatedAt !== lastSyncedUpdatedAt) ||
        remoteVer > version;

      if (hasNewerVersion) {
        if (!isDirty) {
          applySyncedPost({
            ...remote,
            version: remoteVer,
            histories: remoteHistories ?? undefined,
          });
        } else {
          setRemoteNewerPost({
            ...remote,
            version: remoteVer,
            histories: remoteHistories ?? undefined,
          });
        }
      }
    } catch {
      // Ignore transient polling failures
    }
  }, [applySyncedPost, initialData?.id, isDirty, isEditMode, isSaving, lastSyncedUpdatedAt, version]);

  useEffect(() => {
    if (!isEditMode || !initialData?.id) return;

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void pollPostVersion();
      }
    }, 4000);

    const handleFocusOrVisibility = () => {
      if (document.visibilityState === "visible") {
        void pollPostVersion();
      }
    };

    window.addEventListener("focus", handleFocusOrVisibility);
    document.addEventListener("visibilitychange", handleFocusOrVisibility);

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel(POSTS_SYNC_CHANNEL);
      channel.onmessage = (event) => {
        if (event.data?.id === initialData.id) {
          void pollPostVersion();
        }
      };
    } catch {
      // BroadcastChannel unavailable
    }

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleFocusOrVisibility);
      document.removeEventListener("visibilitychange", handleFocusOrVisibility);
      if (channel) channel.close();
    };
  }, [initialData?.id, isEditMode, pollPostVersion]);

  const handleRestoreVersion = async (targetVersion: number) => {
    if (!initialData?.id) return;
    setRestoringVersion(targetVersion);
    try {
      const res = await fetch(`/api/admin/posts/${initialData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restoreVersion: targetVersion }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to restore version");

      const restored = data.post;
      if (restored) {
        applySyncedPost(restored);
        broadcastPostSync({
          type: "POST_UPDATED",
          id: restored.id,
          slug: restored.slug,
          version: restored.version,
          updatedAt: restored.updatedAt,
        });
      }
      setShowHistoryDialog(false);
      toast.success(`Restored version v${targetVersion}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to restore version");
    } finally {
      setRestoringVersion(null);
    }
  };

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
      const uploadedUrl = await uploadPostMedia(file);
      setCoverImage(uploadedUrl);
      setCoverImgError(false);
      toast.success("Cover image uploaded successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to upload cover image");
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
        const savedPost = data.post || data.data?.post;
        setStatus(targetStatus);
        setInitialSnapshot({ ...payload });
        setRemoteNewerPost(null);
        if (typeof savedPost?.version === "number") {
          setVersion(savedPost.version);
        } else if (typeof data.version === "number") {
          setVersion(data.version);
        }
        if (Array.isArray(savedPost?.histories)) {
          setHistories(savedPost.histories);
        } else if (Array.isArray(data.histories)) {
          setHistories(data.histories);
        }
        if (savedPost?.updatedAt) {
          setLastSyncedUpdatedAt(savedPost.updatedAt);
        }
        broadcastPostSync({
          type: "POST_UPDATED",
          id: initialData.id,
          slug: savedPost?.slug || payload.slug,
          version: savedPost?.version ?? data.version,
          updatedAt: savedPost?.updatedAt,
        });
        toast.success(
          targetStatus === "PUBLISHED" ? "Post published successfully" : "Draft saved successfully"
        );
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
        const createdPost = data.data?.post || data.post;
        const createdId = createdPost?.id || data.id;
        broadcastPostSync({
          type: "POST_UPDATED",
          id: createdId,
          slug: createdPost?.slug || payload.slug,
          version: createdPost?.version ?? data.version ?? 1,
          updatedAt: createdPost?.updatedAt,
        });
        if (createdId) {
          router.push(`/admin/posts/${createdId}/edit`);
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
      <header className="shrink-0 bg-white dark:bg-card border-b border-border/80 z-20 shadow-2xs">
        <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 h-14 min-h-[56px] w-full min-w-0">
          {/* Back Button */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleBackSafe}
            className="size-9 rounded-lg shrink-0 cursor-pointer text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            title="Back"
          >
            <ArrowLeft className="size-4" />
          </Button>

          {/* Title Input inside Header */}
          <div
            className={cn(
              "flex-1 min-w-0 flex items-center h-10 border border-slate-200 rounded-lg transition-all box-border bg-slate-50/60 dark:bg-muted/30",
              "focus-within:border-[#115eff] focus-within:ring-2 focus-within:ring-[#115eff]/10 focus-within:bg-white dark:focus-within:bg-card"
            )}
          >
            <div className="px-3 border-r border-slate-200 h-full flex items-center shrink-0">
              <Type className="size-4 text-slate-400" />
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder={isEditMode ? "Edit post title..." : "Enter new post title..."}
              className="flex-1 min-w-0 bg-transparent border-none outline-none h-full px-3 text-sm sm:text-base font-semibold placeholder:text-slate-400 text-slate-900"
            />
          </div>

          {/* Status & Version Controls */}
          <div className="hidden sm:flex items-center gap-1.5 shrink-0">
            <span
              className={cn(
                "inline-flex items-center h-8 px-3 text-xs font-semibold rounded-full border",
                status === "PUBLISHED"
                  ? "bg-blue-50 text-[#115eff] border-blue-200"
                  : "bg-slate-100 text-slate-700 border-slate-200"
              )}
            >
              <span
                className={cn(
                  "size-1.5 rounded-full mr-1.5",
                  status === "PUBLISHED" ? "bg-[#115eff]" : "bg-slate-400"
                )}
              />
              {status === "PUBLISHED" ? "Published" : "Draft"}
            </span>

            {isEditMode && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setShowHistoryDialog(true)}
                className="h-8 px-2.5 gap-1.5 text-xs font-semibold rounded-full border-slate-200 bg-white hover:bg-slate-50 text-slate-700 cursor-pointer"
                title="Open version history"
              >
                <History className="size-3.5 text-[#115eff]" />
                <span>v{version}</span>
              </Button>
            )}

            {remoteNewerPost && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  applySyncedPost(remoteNewerPost);
                  toast.success(`Synced to v${remoteNewerPost.version || version}`);
                }}
                className="h-8 px-2.5 gap-1.5 text-xs font-semibold rounded-full border-blue-300 bg-blue-50 text-[#115eff] hover:bg-blue-100 cursor-pointer"
              >
                <RefreshCw className="size-3" />
                <span>Sync v{remoteNewerPost.version}</span>
              </Button>
            )}
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2 shrink-0 ml-auto">
            {/* Direct Preview to Full Post Page (No modal dialog) */}
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                if (initialData?.id) {
                  window.open(`/admin/posts/${initialData.id}`, "_blank");
                } else if (slug) {
                  window.open(`/news/${slug}`, "_blank");
                } else {
                  toast.info("Please enter a title or save draft first to preview.");
                }
              }}
              className="h-9 px-3.5 gap-1.5 cursor-pointer text-xs sm:text-sm font-semibold shrink-0 whitespace-nowrap bg-white hover:bg-slate-50 border-slate-200 text-slate-700 rounded-lg shadow-sm"
              title="Open full post page in new tab"
            >
              <Eye className="size-4 text-[#115eff]" />
              <span>View Page</span>
            </Button>

            {/* Save Draft Button */}
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => handleSave("DRAFT")}
              disabled={isSaving}
              className="h-9 px-3.5 gap-1.5 cursor-pointer text-xs sm:text-sm font-semibold shrink-0 whitespace-nowrap bg-white hover:bg-slate-50 border-slate-200 shadow-sm text-slate-700 rounded-lg"
            >
              <Save className="size-4" />
              <span>Save Draft</span>
            </Button>

            {/* Publish / Unpublish Button (Red for Unpublish, Blue for Publish - No Yellow) */}
            {status === "PUBLISHED" ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => handleSave("DRAFT")}
                disabled={isSaving}
                className="h-9 px-4 gap-1.5 cursor-pointer text-xs sm:text-sm font-semibold shrink-0 whitespace-nowrap border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 hover:text-rose-800 rounded-lg shadow-sm"
              >
                <EyeOff className="size-4" />
                <span>Unpublish</span>
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                onClick={() => handleSave("PUBLISHED")}
                disabled={isSaving}
                className="h-9 px-4 gap-1.5 cursor-pointer text-xs sm:text-sm font-semibold shrink-0 whitespace-nowrap bg-[#115eff] hover:bg-[#0a4de6] text-white rounded-lg shadow-sm"
              >
                <Rocket className="size-4" />
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
          <aside className="w-full lg:w-[370px] xl:w-[400px] shrink-0 border-b lg:border-b-0 lg:border-r border-slate-200 bg-white flex flex-col overflow-hidden z-10 shadow-none">
            {/* Sidebar Sticky Header */}
            <div className="px-4 py-3 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div className="min-w-0">
                <h3 className="font-semibold text-sm sm:text-base text-slate-900 tracking-tight truncate">
                  Post Information
                </h3>
                <p className="text-xs text-slate-500 truncate">
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
                      className="size-8 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
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
            <div className="px-3 py-2 border-b border-slate-200 bg-white shrink-0">
              <div className="grid grid-cols-2 p-1 rounded-lg bg-slate-100 text-xs sm:text-sm">
                <button
                  type="button"
                  onClick={() => setActiveTab("attributes")}
                  className={cn(
                    "flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md font-medium transition-all cursor-pointer",
                    activeTab === "attributes"
                      ? "bg-white text-slate-900 font-semibold shadow-xs"
                      : "text-slate-500 hover:text-slate-900"
                  )}
                >
                  <FileText className="size-3.5" />
                  <span>Attributes</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("files")}
                  className={cn(
                    "flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md font-medium transition-all cursor-pointer",
                    activeTab === "files"
                      ? "bg-white text-slate-900 font-semibold shadow-xs"
                      : "text-slate-500 hover:text-slate-900"
                  )}
                >
                  <ImageIcon className="size-3.5 text-[#115eff]" />
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
                    className="rounded-xl border border-slate-200 bg-slate-50/40 p-4 space-y-3 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <label className="text-xs sm:text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                        <ImageIcon className="size-4 text-slate-500" />
                        Cover Image
                      </label>
                      <span className="text-xs text-slate-400 font-medium">16:9 ratio</span>
                    </div>

                    {coverImage && !coverImgError ? (
                      <div className="space-y-2">
                        <div className="relative group overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
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
                              className="h-8 px-3 text-xs bg-white text-slate-900 hover:bg-slate-100 cursor-pointer font-medium rounded-lg"
                              onClick={() => setShowCoverModal(true)}
                            >
                              <Crop className="mr-1 size-3.5" />
                              Change
                            </Button>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="h-8 px-3 text-xs cursor-pointer font-medium rounded-lg"
                              onClick={() => setCoverImage(null)}
                            >
                              <X className="mr-1 size-3.5" />
                              Remove
                            </Button>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-0.5">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="flex-1 h-8 text-xs font-medium cursor-pointer bg-white rounded-lg border-slate-200"
                            onClick={() => setShowCoverModal(true)}
                          >
                            <ImageIcon className="mr-1.5 size-3.5 text-slate-500" />
                            Change Cover
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg"
                            onClick={() => setCoverImage(null)}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="border border-dashed border-slate-200 rounded-lg p-5 text-center bg-white">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <div className="size-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                            <ImageIcon className="size-5" />
                          </div>
                          <div className="text-center">
                            <p className="text-xs sm:text-sm font-medium text-slate-800">
                              No cover image selected
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Upload an image or choose from library
                            </p>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="h-8 text-xs font-medium cursor-pointer bg-white rounded-lg border-slate-200"
                              onClick={() => setShowCoverModal(true)}
                            >
                              <ImageIcon className="size-3.5 mr-1 text-slate-500" />
                              Choose Image
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="h-8 text-xs font-medium cursor-pointer bg-white rounded-lg border-slate-200"
                              onClick={() => fileInputRef.current?.click()}
                              disabled={isUploadingCover}
                            >
                              <Upload className="size-3.5 mr-1 text-slate-500" />
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
                    className="rounded-xl border border-slate-200 bg-slate-50/40 p-4 space-y-2.5 shadow-2xs"
                  >
                    <label className="text-xs sm:text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                      <FolderOpen className="size-4 text-[#115eff]" />
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#115eff]/20 focus:border-[#115eff] cursor-pointer"
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
                    className="rounded-xl border border-slate-200 bg-slate-50/40 p-4 space-y-2.5 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <label className="text-xs sm:text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                        <LinkIcon className="size-4 text-slate-500" />
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
                        className="text-xs text-[#115eff] hover:underline cursor-pointer font-medium"
                      >
                        Auto-generate
                      </button>
                    </div>
                    <div className="flex items-center bg-white border border-slate-200 rounded-lg px-3 h-10 text-sm focus-within:border-[#115eff] focus-within:ring-2 focus-within:ring-[#115eff]/20">
                      <span className="font-mono text-xs text-slate-400 select-none">/news/</span>
                      <input
                        type="text"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        placeholder="post-url-slug"
                        className="w-full py-1 pl-1 bg-transparent focus:outline-none text-slate-800 font-mono text-xs sm:text-sm"
                      />
                    </div>
                  </div>

                  {/* Card 4: Summary / Excerpt */}
                  <div
                    id="post-sidebar-summary"
                    className="rounded-xl border border-slate-200 bg-slate-50/40 p-4 space-y-2.5 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <label className="text-xs sm:text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                        <FileText className="size-4 text-slate-500" />
                        Summary Excerpt
                      </label>
                      <span className="text-xs text-slate-400 font-medium">
                        {summary.length} chars
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                      placeholder="Short description displayed on news feeds and SEO cards..."
                      className="w-full p-3 text-sm text-slate-800 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#115eff]/20 focus:border-[#115eff] resize-none leading-relaxed placeholder:text-slate-400"
                    />
                  </div>
                </>
              ) : (
                /* Media Quick Upload Tab */
                <div className="space-y-3">
                  <div className="border border-dashed border-slate-200 rounded-xl p-6 text-center bg-white shadow-2xs">
                    <ImageIcon className="size-8 mx-auto text-slate-400 mb-2" />
                    <p className="text-sm font-semibold text-slate-800">Media & Attachments</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Upload images directly into your content or set as cover image
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setShowContentImageModal(true)}
                      className="mt-3 h-9 text-xs sm:text-sm font-medium bg-[#115eff] hover:bg-[#0a4de6] text-white rounded-lg shadow-sm"
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
          <aside className="w-12 shrink-0 border-r border-slate-200 bg-white flex flex-col items-center py-3 gap-3 z-10">
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsLeftSidebarOpen(true)}
                    className="size-8 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
                    aria-label="Expand sidebar"
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs">
                  Expand post details
                </TooltipContent>
              </Tooltip>

              <div className="w-6 border-t border-slate-200" />

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
                    className="size-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
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
                    className="size-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
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
                    className="size-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
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
              className="mt-auto cursor-pointer py-2 px-1 text-xs font-semibold text-slate-400 hover:text-slate-700 transition-colors [writing-mode:vertical-rl] rotate-180 select-none"
              title="Click to expand"
            >
              Post Details
            </button>
          </aside>
        )}

        {/* ── Center Paper Canvas Workspace ── */}
        <div className="flex-1 min-w-0 min-h-0 overflow-hidden flex flex-col bg-slate-100/70 dark:bg-[#070b14]">
          <TiptapEditor
            editorRef={editorRef}
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
      {showContentImageModal && (
        <ImageInsertModal open={showContentImageModal} onClose={() => setShowContentImageModal(false)} onInsertImage={(src, alt) => {
          if (!editorRef.current?.insertImage(src, alt)) toast.error("The editor is not ready. Please try again.");
        }} />
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

      {/* ── Post Version History Dialog ── */}
      <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
        <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <History className="size-4 text-[#115eff]" />
              <span>Version History</span>
              <Badge variant="outline" className="ml-1 text-xs font-mono">
                v{version}
              </Badge>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Automatically polled revisions for this article. Restore any saved version.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 mt-2">
            {histories.length === 0 ? (
              <p className="text-sm text-slate-500 py-8 text-center">
                No revision history recorded yet.
              </p>
            ) : (
              histories.map((entry) => {
                const isCurrent = entry.version === version;
                return (
                  <div
                    key={entry.id}
                    className={cn(
                      "rounded-xl border p-3 flex items-start justify-between gap-3 transition-colors",
                      isCurrent
                        ? "border-blue-200 bg-blue-50/50"
                        : "border-slate-200 bg-white hover:bg-slate-50/70"
                    )}
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold font-mono text-slate-900">
                          v{entry.version}
                        </span>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] px-1.5 py-0 h-5",
                            entry.status === "PUBLISHED"
                              ? "border-blue-200 bg-blue-50 text-[#115eff]"
                              : "border-slate-200 bg-slate-100 text-slate-600"
                          )}
                        >
                          {entry.status}
                        </Badge>
                        {isCurrent && (
                          <span className="text-[11px] font-semibold text-[#115eff]">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-medium text-slate-800 truncate">
                        {entry.title || "Untitled"}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {new Date(entry.updatedAt).toLocaleString()} · {entry.savedBy}
                      </p>
                    </div>
                    {!isCurrent && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={restoringVersion !== null}
                        onClick={() => handleRestoreVersion(entry.version)}
                        className="h-8 px-2.5 text-xs font-semibold shrink-0 cursor-pointer"
                      >
                        <RotateCcw className="size-3.5 mr-1" />
                        {restoringVersion === entry.version ? "Restoring..." : "Restore"}
                      </Button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default PostEditorForm;
