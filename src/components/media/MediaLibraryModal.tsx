"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  X,
  Upload,
  Search,
  Image as ImageIcon,
  FileText,
  Check,
  Loader2,
  Trash2,
  FolderOpen,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import type { StorageFolder } from "@/types";

export interface MediaFileItem {
  id: string;
  key: string;
  filename: string;
  url: string;
  proxyUrl: string;
  mimeType: string;
  size: number;
  folder: string;
  width?: number | null;
  height?: number | null;
  createdAt: string;
}

interface MediaLibraryModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string, file?: MediaFileItem) => void;
  defaultFolder?: StorageFolder;
  accept?: string;
  title?: string;
  allowDelete?: boolean;
}

const FOLDERS: Array<{ value: string; label: string }> = [
  { value: "all", label: "All Files" },
  { value: "public/avatars", label: "Avatars" },
  { value: "public/proofs", label: "Academic Proofs" },
  { value: "public/news", label: "News & CMS" },
  { value: "public/uploads", label: "General Uploads" },
  { value: "private/passports", label: "Passports" },
];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function MediaLibraryModal({
  open,
  onClose,
  onSelect,
  defaultFolder = "public/uploads",
  accept = "image/*,application/pdf",
  title = "Media Library",
  allowDelete = false,
}: MediaLibraryModalProps) {
  const [files, setFiles] = useState<MediaFileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeFolder, setActiveFolder] = useState<string>("all");
  const [uploadFolder, setUploadFolder] = useState<StorageFolder>(defaultFolder);
  const [selectedFile, setSelectedFile] = useState<MediaFileItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = useCallback(async () => {
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
      setError("Network error while loading media library");
    } finally {
      setLoading(false);
    }
  }, [activeFolder, search]);

  useEffect(() => {
    if (open) {
      setUploadFolder(defaultFolder);
      fetchMedia();
    }
  }, [open, defaultFolder, fetchMedia]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    setUploading(true);
    setError("");

    try {
      let lastUploaded: MediaFileItem | null = null;
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", uploadFolder);

        const res = await fetch("/api/media", {
          method: "POST",
          body: formData,
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error || `Failed to upload ${file.name}`);
        }
        lastUploaded = json.data.file;
      }

      await fetchMedia();
      if (lastUploaded) {
        setSelectedFile(lastUploaded);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/media/${id}`, { method: "DELETE" });
      if (res.ok) {
        setFiles((prev) => prev.filter((f) => f.id !== id));
        if (selectedFile?.id === id) setSelectedFile(null);
      }
    } catch {
      setError("Failed to delete file");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
      <div className="flex flex-col w-full max-w-4xl max-h-[88vh] rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-[#115eff] border border-blue-100">
              <FolderOpen className="size-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{title}</h3>
              <p className="text-xs text-slate-500">
                Upload new files or select from stored conference assets
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3.5 border-b border-slate-100 bg-white">
          <div className="flex flex-wrap items-center gap-1.5">
            {FOLDERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setActiveFolder(f.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeFolder === f.value
                    ? "bg-[#115eff] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-48 sm:w-56">
              <Search className="size-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search filename..."
                className="h-8 pl-8 text-xs"
              />
            </div>

            <button
              type="button"
              onClick={fetchMedia}
              className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
              title="Refresh"
            >
              <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              multiple
              onChange={handleFileUpload}
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
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Upload className="size-3.5" />
              )}
              {uploading ? "Uploading..." : "Upload File"}
            </Button>
          </div>
        </div>

        {error && (
          <div className="px-6 py-2.5 bg-red-50 border-b border-red-100 text-xs font-medium text-red-700">
            {error}
          </div>
        )}

        {/* File Grid */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/40">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
              <Loader2 className="size-7 animate-spin text-[#115eff]" />
              <span className="text-xs font-medium">Loading files...</span>
            </div>
          ) : files.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="size-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                <ImageIcon className="size-6" />
              </div>
              <p className="text-sm font-bold text-slate-700">No media files found</p>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Upload an image or PDF document to store it in the library
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="size-3.5" />
                Choose File to Upload
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {files.map((item) => {
                const isSelected = selectedFile?.id === item.id;
                const isImage = item.mimeType.startsWith("image/");
                const displayUrl = item.proxyUrl || item.url;

                return (
                  <div
                    key={item.id || item.key}
                    onClick={() => setSelectedFile(item)}
                    onDoubleClick={() => {
                      onSelect(displayUrl, item);
                      onClose();
                    }}
                    className={`group relative rounded-xl border bg-white overflow-hidden cursor-pointer transition-all ${
                      isSelected
                        ? "border-[#115eff] ring-2 ring-[#115eff]/25 shadow-md"
                        : "border-slate-200 hover:border-slate-300 shadow-2xs"
                    }`}
                  >
                    <div className="relative aspect-4/3 bg-slate-100 flex items-center justify-center overflow-hidden">
                      {isImage ? (
                        <img
                          src={displayUrl}
                          alt={item.filename}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-1.5 text-slate-500">
                          <FileText className="size-9 text-[#115eff]" />
                          <span className="text-[10px] font-bold uppercase">PDF Document</span>
                        </div>
                      )}

                      {isSelected && (
                        <div className="absolute top-2 right-2 size-6 rounded-full bg-[#115eff] text-white flex items-center justify-center shadow-sm">
                          <Check className="size-3.5" />
                        </div>
                      )}

                      {allowDelete && item.id && (
                        <button
                          type="button"
                          onClick={(e) => handleDelete(item.id, e)}
                          className="opacity-0 group-hover:opacity-100 absolute top-2 left-2 size-6 rounded-lg bg-red-600/90 text-white flex items-center justify-center transition-opacity"
                          title="Delete file"
                        >
                          <Trash2 className="size-3" />
                        </button>
                      )}
                    </div>

                    <div className="p-2.5">
                      <p className="text-xs font-semibold text-slate-800 truncate">
                        {item.filename}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[10px] text-slate-400">
                          {formatFileSize(item.size)}
                        </span>
                        <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
                          {item.folder.replace("public/", "").replace("private/", "")}
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-100 bg-white">
          <div className="text-xs text-slate-500 truncate max-w-md">
            {selectedFile ? (
              <span>
                Selected: <strong className="text-slate-800">{selectedFile.filename}</strong>
              </span>
            ) : (
              <span>Click a file to select</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="ute"
              size="sm"
              disabled={!selectedFile}
              onClick={() => {
                if (selectedFile) {
                  onSelect(selectedFile.proxyUrl || selectedFile.url, selectedFile);
                  onClose();
                }
              }}
            >
              Use Selected File
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
