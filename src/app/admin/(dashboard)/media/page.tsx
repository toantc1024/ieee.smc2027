"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Upload, Loader2 } from "lucide-react";
import { ManagementPageHeader } from "@/components/ui/management-page-header";
import { Button } from "@/components/ui/button";
import { StatusAlertBanner } from "@/components/shared/StatusAlertBanner";
import { MediaFileGrid } from "@/components/admin/media/MediaFileGrid";
import type { StorageFolder } from "@/types";
import type { MediaFileItem } from "@/components/media/MediaLibraryModal";

export default function AdminMediaLibraryPage() {
  const [files, setFiles] = useState<MediaFileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeFolder, setActiveFolder] = useState<string>("all");
  const [uploadFolder, setUploadFolder] =
    useState<StorageFolder>("public/uploads");
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadFiles = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (activeFolder !== "all") params.set("folder", activeFolder);
      if (search.trim()) params.set("search", search.trim());

      const res = await fetch(`/api/media?${params.toString()}`);
      const json = await res.json();
      if (res.ok && json.success) {
        setFiles(json.data.files || []);
      } else {
        setError(json.error || "Unable to load media files");
      }
    } catch {
      setError("Network error while loading media catalog");
    } finally {
      setLoading(false);
    }
  }, [activeFolder, search]);

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

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/media/${id}`, { method: "DELETE" });
      if (res.ok) {
        setFiles((prev) => prev.filter((item) => item.id !== id));
      }
    } catch {
      setError("Unable to delete media file");
    }
  };

  const handleCopyUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <div className="space-y-6">
      <ManagementPageHeader
        imageIcon="/assets/3d-icons/media-management__hcmute-3d-icon.png"
        backgroundImage="/assets/manage-media-bg.jpg"
        title="Media Upload Library"
        description="Manage images, delegate badge portraits, IEEE/Student proof documents, passport scans, and generated conference PDFs stored in MinIO & PostgreSQL."
      >
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
          accept="image/*,application/pdf"
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
          {uploading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Upload className="size-4" />
          )}
          {uploading ? "Uploading..." : "Upload Files"}
        </Button>
      </ManagementPageHeader>

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
        search={search}
        onSearchChange={setSearch}
        copiedId={copiedId}
        onCopyUrl={handleCopyUrl}
        onDelete={handleDelete}
        onRefresh={loadFiles}
        onUploadClick={() => fileInputRef.current?.click()}
      />
    </div>
  );
}
