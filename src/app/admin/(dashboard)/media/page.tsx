"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Upload, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatusAlertBanner } from "@/components/shared/StatusAlertBanner";
import { MediaFileGrid } from "@/components/admin/media/MediaFileGrid";
import { DEFAULT_ALL_MEDIA_ACCEPT } from "@/lib/media-types";
import type { StorageFolder } from "@/types";
import type { MediaFileItem } from "@/components/media/MediaLibraryModal";
import { toast } from "sonner";

export default function AdminMediaLibraryPage() {
  const [files, setFiles] = useState<MediaFileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeFolder, setActiveFolder] = useState<string>("all");
  const [activeCategory, setActiveCategory] = useState<"all" | "IMAGE" | "DOCUMENT">("all");
  const [uploadFolder, setUploadFolder] =
    useState<StorageFolder>("public/uploads");
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [pendingDelete, setPendingDelete] = useState<MediaFileItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadFiles = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (activeFolder !== "all") params.set("folder", activeFolder);
      if (activeCategory !== "all") params.set("category", activeCategory);
      if (search.trim()) params.set("search", search.trim());

      const res = await fetch(`/api/media?${params.toString()}`);
      const json = await res.json();
      if (res.ok && json.success) {
        setFiles(json.files || json.data?.files || []);
      } else {
        setError(json.error || "Unable to load media files");
      }
    } catch {
      setError("Network error while loading media catalog");
    } finally {
      setLoading(false);
    }
  }, [activeFolder, activeCategory, search]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected || selected.length === 0) return;

    setUploading(true);
    setError("");
    try {
      for (let i = 0; i < selected.length; i++) {
        const formData = new FormData();
        formData.append("file", selected[i]);
        formData.append("folder", uploadFolder);

        const res = await fetch("/api/media", {
          method: "POST",
          body: formData,
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error || `Failed to upload ${selected[i].name}`);
        }
      }
      await loadFiles();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRequestDelete = (id: string) => {
    const target = files.find((item) => item.id === id) || null;
    if (target) setPendingDelete(target);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    setError("");
    try {
      const res = await fetch(`/api/media/${pendingDelete.id}`, { method: "DELETE" });
      if (res.ok) {
        setFiles((prev) => prev.filter((item) => item.id !== pendingDelete.id));
        toast.success(`Deleted ${pendingDelete.filename}`);
        setPendingDelete(null);
      } else {
        setError("Unable to delete media file");
      }
    } catch {
      setError("Unable to delete media file");
    } finally {
      setDeleting(false);
    }
  };

  const handleCopyUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <select
          value={uploadFolder}
          onChange={(e) => setUploadFolder(e.target.value as StorageFolder)}
          className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700"
        >
          <option value="public/uploads">Upload to: General</option>
          <option value="public/avatars">Upload to: Avatars</option>
          <option value="public/proofs">Upload to: Proofs</option>
          <option value="public/news">Upload to: News & CMS</option>
          <option value="private/passports">Upload to: Passports</option>
        </select>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={DEFAULT_ALL_MEDIA_ACCEPT}
          onChange={handleUpload}
          className="hidden"
        />
        <Button
          type="button"
          variant="ute"
          size="sm"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="size-4" />
          <span>{uploading ? "Uploading..." : "Upload Files"}</span>
        </Button>
      </div>

      <StatusAlertBanner
        variant="error"
        message={error}
        onDismiss={() => setError("")}
      />

      <MediaFileGrid
        files={files}
        loading={loading}
        activeFolder={activeFolder}
        onFolderChange={setActiveFolder}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        search={search}
        onSearchChange={setSearch}
        copiedId={copiedId}
        onCopyUrl={handleCopyUrl}
        onDelete={handleRequestDelete}
        onRefresh={loadFiles}
        onUploadClick={() => fileInputRef.current?.click()}
      />

      <Dialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open && !deleting) setPendingDelete(null);
        }}
      >
        <DialogContent className="sm:max-w-[420px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              Delete File
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-600">
              Are you sure you want to permanently delete{" "}
              <span className="font-semibold text-slate-900 break-all">
                {pendingDelete?.filename}
              </span>
              ? Pages or links using this file will stop loading it.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={deleting}
              onClick={() => setPendingDelete(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={deleting}
              onClick={handleConfirmDelete}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              {deleting ? (
                <Loader2 className="size-3.5 animate-spin mr-1.5" />
              ) : (
                <Trash2 className="size-3.5 mr-1.5" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
