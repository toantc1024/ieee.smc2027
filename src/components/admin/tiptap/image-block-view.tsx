"use client";

import React, { useRef, useState } from "react";
import type { NodeViewProps } from "@tiptap/react";
import {
  Image as ImageIcon,
  Upload,
  Maximize2,
  Minimize2,
  ExternalLink,
  Loader2,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { uploadPostMedia } from "./upload";
import {
  BlockWrapper,
  type BlockAlignment,
  type BlockLayoutMode,
} from "./block-wrapper";
import type { ImageBlockAttrs } from "./image-block-extension";

const WIDTH_PRESETS = [25, 50, 75, 100] as const;

export function ImageBlockView({
  node,
  updateAttributes,
  deleteNode,
  selected,
}: NodeViewProps) {
  const attrs = node.attrs as ImageBlockAttrs;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const src = attrs.src || "";
  const alt = attrs.alt || "";
  const caption = attrs.caption || "";
  const credit = attrs.credit || "";
  const width = Number(attrs.width) || 100;
  const height = Number(attrs.height) || 0;
  const alignment: BlockAlignment = attrs.alignment || "center";
  const layoutMode: BlockLayoutMode = attrs.layoutMode || "inline";
  const objectFit: "cover" | "contain" = attrs.objectFit || "cover";
  const rounded = attrs.rounded !== false;

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const uploadedUrl = await uploadPostMedia(file);
      updateAttributes({ src: uploadedUrl, alt: alt || file.name.replace(/\.[^/.]+$/, "") });
      toast.success("Image uploaded to block");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to upload image");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <BlockWrapper
      selected={selected}
      label="Image Block"
      icon={<ImageIcon className="size-3.5" />}
      alignment={alignment}
      onAlignmentChange={(a) => updateAttributes({ alignment: a })}
      layoutMode={layoutMode}
      onLayoutModeChange={(m) => updateAttributes({ layoutMode: m })}
      width={width}
      onWidthChange={(w) => updateAttributes({ width: w })}
      height={height > 0 ? height : undefined}
      onHeightChange={(h) => updateAttributes({ height: h })}
      minHeight={140}
      maxHeight={900}
      caption={caption}
      onCaptionChange={(c) => updateAttributes({ caption: c })}
      captionPlaceholder="Enter image caption..."
      credit={credit}
      onCreditChange={(cr) => updateAttributes({ credit: cr })}
      creditPlaceholder="Photo credit / Source..."
      onDelete={deleteNode}
      headerActions={
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
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
            title="Upload / Replace image"
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
            <span className="hidden sm:inline">
              {src ? "Replace" : "Upload"}
            </span>
          </button>

          {src && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                updateAttributes({
                  objectFit: objectFit === "cover" ? "contain" : "cover",
                });
              }}
              title={
                objectFit === "cover"
                  ? "Switch to Fit (Contain)"
                  : "Switch to Fill (Cover)"
              }
              className={cn(
                "size-6 rounded-md flex items-center justify-center transition-colors cursor-pointer",
                selected
                  ? "text-blue-100 hover:bg-blue-700 hover:text-white"
                  : "text-slate-500 hover:bg-slate-200/70"
              )}
            >
              {objectFit === "cover" ? (
                <Minimize2 className="size-3" />
              ) : (
                <Maximize2 className="size-3" />
              )}
            </button>
          )}
        </>
      }
      settingsContent={
        <div className="space-y-2.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-600">
                Image URL
              </label>
              <input
                type="text"
                value={src}
                onChange={(e) => updateAttributes({ src: e.target.value })}
                placeholder="https://... or /uploads/..."
                className="h-8 w-full rounded-md border border-slate-200 bg-white px-2.5 text-xs focus:outline-none focus:border-blue-600"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-600">
                Alt Text
              </label>
              <input
                type="text"
                value={alt}
                onChange={(e) => updateAttributes({ alt: e.target.value })}
                placeholder="Describe image for accessibility..."
                className="h-8 w-full rounded-md border border-slate-200 bg-white px-2.5 text-xs focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-slate-500 mr-1">Width:</span>
              {WIDTH_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => updateAttributes({ width: preset })}
                  className={cn(
                    "h-6 px-2 rounded text-[11px] font-semibold border transition-colors cursor-pointer",
                    width === preset
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
                  )}
                >
                  {preset}%
                </button>
              ))}
              {height > 0 && (
                <button
                  type="button"
                  onClick={() => updateAttributes({ height: 0 })}
                  className="h-6 px-2 rounded text-[11px] border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 ml-1 cursor-pointer"
                >
                  Auto Height
                </button>
              )}
            </div>

            <label className="inline-flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={rounded}
                onChange={(e) =>
                  updateAttributes({ rounded: e.target.checked })
                }
                className="rounded border-slate-200/85"
              />
              <span>Rounded corners</span>
            </label>
          </div>
        </div>
      }
    >
      {!src ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="p-8 sm:p-10 flex flex-col items-center justify-center text-center gap-2.5 bg-slate-50/70 hover:bg-blue-50/40 cursor-pointer transition-colors"
        >
          <div className="size-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            {isUploading ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <ImageIcon className="size-5" />
            )}
          </div>
          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-slate-800">
              Click to upload image or paste URL in Settings
            </p>
            <p className="text-[11px] text-slate-400">
              Supports PNG, JPG, WEBP, GIF
            </p>
          </div>
        </div>
      ) : (
        <div className="relative bg-slate-100/50 flex items-center justify-center overflow-hidden group/img">
          {/* Quick Floating Preset Toolbar */}
          <div
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "absolute bottom-2.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-900/85 backdrop-blur-md text-white shadow-lg border border-white/15 transition-opacity",
              selected
                ? "opacity-100"
                : "opacity-0 group-hover/img:opacity-100"
            )}
          >
            {WIDTH_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => updateAttributes({ width: preset })}
                className={cn(
                  "h-5 px-1.5 rounded text-[10px] font-mono font-semibold transition-colors cursor-pointer",
                  width === preset
                    ? "bg-blue-600 text-white"
                    : "text-white/75 hover:text-white hover:bg-white/15"
                )}
              >
                {preset}%
              </button>
            ))}

            <div className="w-px h-3.5 bg-white/20 mx-0.5" />

            {(
              [
                { id: "left", icon: AlignLeft, title: "Left" },
                { id: "center", icon: AlignCenter, title: "Center" },
                { id: "right", icon: AlignRight, title: "Right" },
              ] as const
            ).map((a) => {
              const IconComp = a.icon;
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() =>
                    updateAttributes({
                      alignment: a.id,
                      layoutMode: "inline",
                    })
                  }
                  title={a.title}
                  className={cn(
                    "size-5 rounded flex items-center justify-center transition-colors cursor-pointer",
                    alignment === a.id && layoutMode === "inline"
                      ? "bg-blue-600 text-white"
                      : "text-white/75 hover:text-white hover:bg-white/15"
                  )}
                >
                  <IconComp className="size-3" />
                </button>
              );
            })}
          </div>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt || caption || "Post image"}
            style={{
              height: height > 0 ? `${height}px` : undefined,
              objectFit: height > 0 ? objectFit : undefined,
            }}
            className={cn(
              "w-full block select-none",
              height === 0 && "h-auto max-h-[680px] object-contain",
              rounded && "rounded-none"
            )}
          />
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            title="Open original image"
            className="absolute top-2.5 right-2.5 size-7 rounded-lg bg-black/55 text-white flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity hover:bg-black/75"
          >
            <ExternalLink className="size-3.5" />
          </a>
        </div>
      )}
    </BlockWrapper>
  );
}
