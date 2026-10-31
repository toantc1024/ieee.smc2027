"use client";

import React, { useState, useRef } from "react";
import {
  Upload,
  FolderOpen,
  X,
  FileText,
  Image as ImageIcon,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MediaLibraryModal } from "./MediaLibraryModal";
import type { StorageFolder } from "@/types";

interface ImageUploadFieldProps {
  label?: string;
  description?: string;
  value?: string | null;
  onChange: (url: string) => void;
  folder?: StorageFolder;
  accept?: string;
  aspect?: "square" | "video" | "document";
  showLibraryButton?: boolean;
}

export function ImageUploadField({
  label,
  description,
  value,
  onChange,
  folder = "public/uploads",
  accept = "image/*,application/pdf",
  aspect = "square",
  showLibraryButton = true,
}: ImageUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [libraryOpen, setLibraryOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isPdf = value?.toLowerCase().endsWith(".pdf");

  const handleDirectUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const res = await fetch("/api/media", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Upload failed");
      }

      onChange(json.data.proxyUrl || json.data.url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
          {label}
        </label>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
        {/* Preview Box */}
        <div
          className={`relative shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white flex items-center justify-center ${
            aspect === "square"
              ? "size-20"
              : aspect === "video"
                ? "w-32 h-20"
                : "w-24 h-20"
          }`}
        >
          {value ? (
            isPdf ? (
              <div className="flex flex-col items-center gap-1 text-[#115eff] p-2 text-center">
                <FileText className="size-7" />
                <span className="text-[9px] font-bold uppercase">PDF Uploaded</span>
              </div>
            ) : (
              <img
                src={value}
                alt={label || "Uploaded media"}
                className="w-full h-full object-cover"
              />
            )
          ) : (
            <ImageIcon className="size-6 text-slate-300" />
          )}

          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute top-1 right-1 size-5 rounded-full bg-slate-900/75 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
              title="Remove file"
            >
              <X className="size-3" />
            </button>
          )}
        </div>

        {/* Actions & Details */}
        <div className="flex-1 min-w-0 space-y-2">
          {description && (
            <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={inputRef}
              type="file"
              accept={accept}
              onChange={handleDirectUpload}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
            >
              {uploading ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Upload className="size-3.5" />
              )}
              {uploading ? "Uploading..." : "Upload File"}
            </Button>

            {showLibraryButton && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setLibraryOpen(true)}
              >
                <FolderOpen className="size-3.5" />
                Media Library
              </Button>
            )}

            {value && (
              <a
                href={value}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#115eff] hover:underline ml-1"
              >
                View <ExternalLink className="size-3" />
              </a>
            )}
          </div>

          {error && <p className="text-xs font-medium text-red-600">{error}</p>}
        </div>
      </div>

      <MediaLibraryModal
        open={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        defaultFolder={folder}
        accept={accept}
        onSelect={(url) => onChange(url)}
      />
    </div>
  );
}
