"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Upload,
  Search,
  Trash2,
  Copy,
  Check,
  FileText,
  Image as ImageIcon,
  ExternalLink,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { ManagementPageHeader } from "@/components/ui/management-page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { StorageFolder } from "@/types";
import type { MediaFileItem } from "@/components/media/MediaLibraryModal";

const FOLDERS: Array<{ value: string; label: string }> = [
  { value: "all", label: "All Folders" },
  { value: "public/avatars", label: "Delegate Avatars" },
  { value: "public/proofs", label: "IEEE & Student Proofs" },
  { value: "public/news", label: "News & CMS Assets" },
  { value: "public/uploads", label: "General Uploads" },
  { value: "private/passports", label: "Passport Scans" },
  { value: "private/invoices", label: "Receipts & Invoices" },
  { value: "private/visa-letters", label: "Visa Support Letters" },
];

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function AdminMediaLibraryPage() {
  const [files, setFiles] = useState<MediaFileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeFolder, setActiveFolder] = useState<string>("all");
  const [uploadFolder, setUploadFolder] = useState<StorageFolder>("public/uploads");
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

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
          {error}
        </div>
      )}

      <Card className="p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {FOLDERS.map((folder) => (
              <button
                key={folder.value}
                type="button"
                onClick={() => setActiveFolder(folder.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeFolder === folder.value
                    ? "bg-[#005496] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {folder.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-60">
              <Search className="size-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search file name..."
                className="h-9 pl-8 text-xs"
              />
            </div>
            <Button type="button" variant="outline" size="sm" onClick={loadFiles}>
              <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="size-7 animate-spin text-[#005496]" />
            <span className="text-xs font-medium">Loading media catalog...</span>
          </div>
        ) : files.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <ImageIcon className="size-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">
              No media files found in this folder
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="size-3.5" />
              Upload First File
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {files.map((item) => {
              const isImage = item.mimeType.startsWith("image/");
              const displayUrl = item.proxyUrl || item.url;

              return (
                <div
                  key={item.id || item.key}
                  className="group rounded-xl border border-slate-200 bg-white overflow-hidden flex flex-col justify-between shadow-2xs hover:shadow-md transition-all"
                >
                  <div className="relative aspect-4/3 bg-slate-100 flex items-center justify-center overflow-hidden">
                    {isImage ? (
                      <img
                        src={displayUrl}
                        alt={item.filename}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-1.5 text-[#005496]">
                        <FileText className="size-10" />
                        <span className="text-[10px] font-bold uppercase">
                          {item.mimeType}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-3 space-y-2">
                    <div>
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {item.filename}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[10px] text-slate-400">
                          {formatBytes(item.size)}
                        </span>
                        <Badge variant="secondary" className="text-[9px]">
                          {item.folder}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => handleCopyUrl(item.id, displayUrl)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#005496] hover:underline cursor-pointer"
                      >
                        {copiedId === item.id ? (
                          <>
                            <Check className="size-3 text-emerald-600" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="size-3" />
                            Copy URL
                          </>
                        )}
                      </button>

                      <div className="flex items-center gap-1.5">
                        <a
                          href={displayUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1 text-slate-400 hover:text-slate-800"
                          title="Open file"
                        >
                          <ExternalLink className="size-3.5" />
                        </a>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                          title="Delete file"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
