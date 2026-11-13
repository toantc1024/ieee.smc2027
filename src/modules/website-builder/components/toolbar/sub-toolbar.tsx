"use client";

import React, { useState } from "react";
import {
  Monitor,
  Tablet,
  Smartphone,
  Undo2,
  Redo2,
  Minus,
  Plus,
  ClipboardPaste,
  Eye,
  EyeOff,
  Maximize2,
  ExternalLink,
  Link2,
  ChevronDown,
} from "lucide-react";
import { useBuilderStore } from "../../store/builder-store";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { PagePreviewModal } from "../modals/page-preview-modal";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const ZOOM_PRESETS = [
  { label: "Small", value: 50 },
  { label: "Medium", value: 75 },
  { label: "Large", value: 100 },
] as const;

export function SubToolbar() {
  const {
    pageSlug,
    viewport,
    setViewport,
    zoom,
    setZoom,
    isAutoFit,
    setAutoFit,
    viewMode,
    setViewMode,
    undoStack,
    redoStack,
    undo,
    redo,
    pasteBlock,
    clipboardBlock,
  } = useBuilderStore();

  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const isPreview = viewMode === "preview";
  const publicPath = `/${pageSlug === "home" ? "" : pageSlug}`;

  const handleZoomStep = (delta: number) => {
    const base = isAutoFit ? 100 : zoom;
    setZoom(Math.max(25, Math.min(150, base + delta)));
  };

  const handleCopyLink = () => {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}${publicPath}`
        : publicPath;
    navigator.clipboard.writeText(url);
    toast.success("Copied page link to clipboard");
  };

  return (
    <>
      <div className="h-11 border-b border-slate-200/75 bg-white/95 backdrop-blur-xs px-3 sm:px-4 flex items-center justify-between gap-2 overflow-x-auto [scrollbar-width:thin] select-none shrink-0 z-20 text-xs">
        {/* Left: Responsive Viewport Switcher */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center p-0.5 rounded-lg bg-slate-100 border border-slate-200/75">
            <button
              type="button"
              onClick={() => setViewport("desktop")}
              className={cn(
                "px-2.5 py-1 rounded-md transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer",
                viewport === "desktop"
                  ? "bg-white text-blue-600 shadow-2xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              )}
              title="Desktop Viewport"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Desktop</span>
            </button>
            <button
              type="button"
              onClick={() => setViewport("tablet")}
              className={cn(
                "px-2.5 py-1 rounded-md transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer",
                viewport === "tablet"
                  ? "bg-white text-blue-600 shadow-2xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              )}
              title="Tablet Viewport"
            >
              <Tablet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tablet</span>
            </button>
            <button
              type="button"
              onClick={() => setViewport("mobile")}
              className={cn(
                "px-2.5 py-1 rounded-md transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer",
                viewport === "mobile"
                  ? "bg-white text-blue-600 shadow-2xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              )}
              title="Mobile Viewport"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mobile</span>
            </button>
          </div>
        </div>

        {/* Center: HCM-UTE Inline Zoom Bar */}
        {!isPreview ? (
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] font-semibold text-slate-400 mr-0.5">
              Zoom
            </span>
            <div className="flex items-center p-0.5 rounded-lg bg-slate-100 border border-slate-200/75">
              <button
                type="button"
                onClick={() => setAutoFit(true)}
                className={cn(
                  "px-2 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer",
                  isAutoFit
                    ? "bg-blue-600 text-white shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                Auto
              </button>

              {ZOOM_PRESETS.map((preset) => {
                const active = !isAutoFit && zoom === preset.value;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setZoom(preset.value)}
                    className={cn(
                      "px-2 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer",
                      active
                        ? "bg-white text-blue-600 shadow-2xs font-bold"
                        : "text-slate-600 hover:text-slate-900"
                    )}
                  >
                    {preset.label}
                  </button>
                );
              })}

              <div className="h-3.5 w-px bg-slate-200 mx-1" />

              <button
                type="button"
                onClick={() => handleZoomStep(-10)}
                className="p-1 rounded-md text-slate-600 hover:text-slate-900 hover:bg-white transition-colors cursor-pointer"
                title="Zoom Out"
                aria-label="Zoom out"
              >
                <Minus className="w-3 h-3" />
              </button>

              <span className="px-1.5 text-[11px] font-bold text-slate-700 min-w-[40px] text-center">
                {isAutoFit ? "Fit" : `${zoom}%`}
              </span>

              <button
                type="button"
                onClick={() => handleZoomStep(10)}
                className="p-1 rounded-md text-slate-600 hover:text-slate-900 hover:bg-white transition-colors cursor-pointer"
                title="Zoom In"
                aria-label="Zoom in"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
            <Eye className="w-3.5 h-3.5" />
            <span>Interactive Preview Active</span>
          </div>
        )}

        {/* Right: Undo / Redo / Paste Pill + HCM-UTE Preview Dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          {!isPreview && (
            <div className="flex items-center p-0.5 rounded-lg bg-slate-100 border border-slate-200/75">
              <button
                type="button"
                disabled={undoStack.length === 0}
                onClick={undo}
                className="p-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-white disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                title="Undo"
                aria-label="Undo"
              >
                <Undo2 className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                disabled={redoStack.length === 0}
                onClick={redo}
                className="p-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-white disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                title="Redo"
                aria-label="Redo"
              >
                <Redo2 className="w-3.5 h-3.5" />
              </button>

              <div className="h-3.5 w-px bg-slate-200 mx-0.5" />

              <button
                type="button"
                onClick={() => {
                  pasteBlock();
                  toast.success("Pasted block");
                }}
                disabled={!clipboardBlock}
                className="px-2 py-1 rounded-md text-slate-600 hover:text-blue-600 hover:bg-white transition-colors flex items-center gap-1 disabled:opacity-30 disabled:pointer-events-none cursor-pointer font-semibold"
                title="Paste Block"
              >
                <ClipboardPaste className="w-3.5 h-3.5" />
                <span className="hidden lg:inline text-[11px]">Paste</span>
              </button>
            </div>
          )}

          {isPreview ? (
            <button
              type="button"
              onClick={() => setViewMode("edit")}
              className="h-8 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span>Exit Preview</span>
            </button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="h-8 px-3 rounded-lg border border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/40 text-slate-700 hover:text-blue-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-blue-600" />
                  <span>Preview</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 text-xs">
                <DropdownMenuItem
                  onClick={() => setPreviewModalOpen(true)}
                  className="cursor-pointer font-medium"
                >
                  <Maximize2 className="w-3.5 h-3.5 mr-2 text-blue-600" />
                  Full-Screen Preview
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setViewMode("preview")}
                  className="cursor-pointer font-medium"
                >
                  <Eye className="w-3.5 h-3.5 mr-2 text-blue-600" />
                  Interactive Canvas
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() =>
                    window.open(`${publicPath}?preview=true`, "_blank")
                  }
                  className="cursor-pointer font-medium"
                >
                  <ExternalLink className="w-3.5 h-3.5 mr-2 text-slate-500" />
                  Open Public Page
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleCopyLink}
                  className="cursor-pointer font-medium"
                >
                  <Link2 className="w-3.5 h-3.5 mr-2 text-slate-500" />
                  Copy Page Link
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <PagePreviewModal
        open={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
      />
    </>
  );
}
