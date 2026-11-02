"use client";

import React from "react";
import {
  Monitor,
  Tablet,
  Smartphone,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ClipboardPaste,
  Languages,
} from "lucide-react";
import { useBuilderStore } from "../../store/builder-store";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface SubToolbarProps {
  onOpenTranslateModal?: () => void;
}

export function SubToolbar({ onOpenTranslateModal }: SubToolbarProps) {
  const {
    viewport,
    setViewport,
    zoom,
    setZoom,
    isAutoFit,
    toggleAutoFit,
    undoStack,
    redoStack,
    undo,
    redo,
    pasteBlock,
    clipboardBlock,
  } = useBuilderStore();

  const handleZoomChange = (delta: number) => {
    setZoom(Math.max(25, Math.min(200, zoom + delta)));
  };

  return (
    <div className="h-10 border-b border-slate-200 bg-white/95 backdrop-blur-xs px-4 flex items-center justify-between select-none shrink-0 z-20 text-xs">
      {/* Left: Viewport Switcher */}
      <div className="flex items-center gap-1">
        <div className="flex items-center p-0.5 rounded-lg bg-slate-100 border border-slate-200">
          <button
            type="button"
            onClick={() => setViewport("desktop")}
            className={cn(
              "p-1 rounded-md transition-all flex items-center gap-1.5 text-xs font-medium",
              viewport === "desktop"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            )}
            title="Desktop View (1240px)"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Desktop</span>
          </button>
          <button
            type="button"
            onClick={() => setViewport("tablet")}
            className={cn(
              "p-1 rounded-md transition-all flex items-center gap-1.5 text-xs font-medium",
              viewport === "tablet"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            )}
            title="Tablet View (768px)"
          >
            <Tablet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tablet</span>
          </button>
          <button
            type="button"
            onClick={() => setViewport("mobile")}
            className={cn(
              "p-1 rounded-md transition-all flex items-center gap-1.5 text-xs font-medium",
              viewport === "mobile"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            )}
            title="Mobile View (390px)"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mobile</span>
          </button>
        </div>
      </div>

      {/* Center: History & Clipboard Actions */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={undoStack.length === 0}
          onClick={undo}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          disabled={redoStack.length === 0}
          onClick={redo}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          title="Redo (Ctrl+Y)"
        >
          <Redo2 className="w-3.5 h-3.5" />
        </button>

        <div className="h-4 w-px bg-slate-200 mx-1" />

        <button
          type="button"
          onClick={() => pasteBlock()}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-1"
          title="Paste Block"
        >
          <ClipboardPaste className="w-3.5 h-3.5" />
          <span className="hidden md:inline text-[11px]">Paste</span>
        </button>

        {onOpenTranslateModal && (
          <>
            <div className="h-4 w-px bg-slate-200 mx-1" />
            <button
              type="button"
              onClick={onOpenTranslateModal}
              className="px-2 py-1 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-1.5 text-xs font-semibold"
              title="Multilingual Sync & Translation"
            >
              <Languages className="w-3.5 h-3.5 text-blue-600" />
              <span>Translate Sync</span>
            </button>
          </>
        )}
      </div>

      {/* Right: Zoom Controls */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => handleZoomChange(-10)}
          className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                "px-2 py-1 rounded-md text-xs font-semibold transition-all",
                isAutoFit
                  ? "bg-blue-50 text-blue-600 border border-blue-200"
                  : "text-slate-700 hover:bg-slate-100"
              )}
            >
              {isAutoFit ? "Auto Fit" : `${zoom}%`}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36 text-xs">
            <DropdownMenuItem onClick={toggleAutoFit}>
              <Maximize2 className="w-3.5 h-3.5 mr-2" />
              Auto Fit (Responsive)
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setZoom(50)}>50% Scale</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setZoom(75)}>75% Scale</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setZoom(100)}>100% (1:1)</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setZoom(125)}>125% Scale</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <button
          type="button"
          onClick={() => handleZoomChange(10)}
          className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
