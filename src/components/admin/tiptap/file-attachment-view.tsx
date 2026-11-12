"use client";

import React, { useRef, useState } from "react";
import type { NodeViewProps } from "@tiptap/react";
import {
  FileText,
  Upload,
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { uploadPostMedia } from "./upload";
import {
  BlockWrapper,
  type BlockAlignment,
  type BlockLayoutMode,
} from "./block-wrapper";
import type { FileAttachmentAttrs } from "./file-attachment-extension";

export function FileAttachmentView({
  node,
  updateAttributes,
  deleteNode,
  selected,
}: NodeViewProps) {
  const attrs = node.attrs as FileAttachmentAttrs;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const src = attrs.src || "";
  const title = attrs.title ?? "Document";
  const fileType = attrs.fileType || "PDF";
  const showPreview = attrs.showPreview !== false;
  const height = Number(attrs.height) || 460;
  const width = Number(attrs.width) || 100;
  const alignment: BlockAlignment = attrs.alignment || "center";
  const layoutMode: BlockLayoutMode = attrs.layoutMode || "inline";
  const caption = attrs.caption || "";
  const credit = attrs.credit || "";

  const isPdf =
    fileType.toUpperCase() === "PDF" || src.toLowerCase().endsWith(".pdf");

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const uploadedUrl = await uploadPostMedia(file);
      const ext = (file.name.split(".").pop() || "FILE").toUpperCase();
      updateAttributes({ src: uploadedUrl, title: file.name, fileType: ext });
      toast.success("Document uploaded to block");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to upload file");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <BlockWrapper
      selected={selected}
      label="Document / PDF Block"
      badge={fileType}
      icon={<FileText className="size-3.5" />}
      alignment={alignment}
      onAlignmentChange={(a) => updateAttributes({ alignment: a })}
      layoutMode={layoutMode}
      onLayoutModeChange={(m) => updateAttributes({ layoutMode: m })}
      width={width}
      onWidthChange={(w) => updateAttributes({ width: w })}
      height={showPreview && isPdf ? height : undefined}
      onHeightChange={
        showPreview && isPdf
          ? (h) => updateAttributes({ height: h })
          : undefined
      }
      caption={caption}
      onCaptionChange={(c) => updateAttributes({ caption: c })}
      credit={credit}
      onCreditChange={(cr) => updateAttributes({ credit: cr })}
      onDelete={deleteNode}
      headerActions={
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip"
            onChange={handleUploadFile}
            className="hidden"
          />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            disabled={isUploading}
            className={cn(
              "h-6 px-2 rounded-md text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer",
              selected
                ? "bg-blue-700 text-white hover:bg-blue-800"
                : "text-slate-600 hover:bg-slate-200/70"
            )}
          >
            {isUploading ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <Upload className="size-3" />
            )}
            <span className="hidden sm:inline">Upload File</span>
          </button>

          {isPdf && src && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                updateAttributes({ showPreview: !showPreview });
              }}
              title={showPreview ? "Hide PDF Preview" : "Show PDF Preview"}
              className={cn(
                "h-6 px-2 rounded-md text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer",
                selected
                  ? "text-blue-100 hover:bg-blue-700 hover:text-white"
                  : "text-slate-600 hover:bg-slate-200/70"
              )}
            >
              {showPreview ? (
                <EyeOff className="size-3" />
              ) : (
                <Eye className="size-3" />
              )}
              <span className="hidden md:inline">
                {showPreview ? "Card Only" : "Preview PDF"}
              </span>
            </button>
          )}
        </>
      }
      settingsContent={
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-600">
              File / PDF URL
            </label>
            <input
              type="text"
              value={src}
              onChange={(e) => updateAttributes({ src: e.target.value })}
              placeholder="https://... or upload a file"
              className="h-8 w-full rounded-md border border-slate-200 bg-white px-2.5 text-xs focus:outline-none focus:border-blue-600"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-600">
              Document Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => updateAttributes({ title: e.target.value })}
              placeholder="Document title..."
              className="h-8 w-full rounded-md border border-slate-200 bg-white px-2.5 text-xs focus:outline-none focus:border-blue-600"
            />
          </div>
        </div>
      }
    >
      {/* File Header Card */}
      <div className="p-4 flex items-center justify-between gap-3 bg-white">
        <div className="flex items-center gap-3 min-w-0">
          <div className="size-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0 font-bold text-xs">
            {fileType}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-900 truncate">{title}</p>
            <p className="text-xs text-slate-500 truncate">
              {src || "Click Upload File or enter URL in Settings"}
            </p>
          </div>
        </div>

        {src && (
          <div className="flex items-center gap-1.5 shrink-0">
            <a
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors"
            >
              <Download className="size-3.5" />
              <span>Download</span>
            </a>
            <a
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="size-8 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 flex items-center justify-center"
              title="Open in new tab"
            >
              <ExternalLink className="size-3.5" />
            </a>
          </div>
        )}
      </div>

      {/* Optional Embedded PDF Viewer */}
      {src && isPdf && showPreview && (
        <div
          style={{ height: `${height}px` }}
          className="w-full border-t border-slate-200 bg-slate-100"
        >
          <iframe
            src={src}
            title={title}
            className="w-full h-full border-0"
          />
        </div>
      )}
    </BlockWrapper>
  );
}
