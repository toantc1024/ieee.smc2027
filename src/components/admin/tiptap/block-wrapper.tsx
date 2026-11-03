"use client";

import React, { useState, useRef, useCallback } from "react";
import { NodeViewWrapper } from "@tiptap/react";
import {
  GripVertical,
  Trash2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Maximize2,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  PanelLeft,
  PanelRight,
  Square,
  Columns2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type BlockAlignment,
  type BlockLayoutMode,
  normalizeAlignment,
  normalizeLayoutMode,
} from "./block-layout";

export type { BlockAlignment, BlockLayoutMode };

export interface BlockWrapperProps {
  selected?: boolean;
  label: string;
  icon?: React.ReactNode;
  badge?: string;
  alignment?: BlockAlignment;
  onAlignmentChange?: (alignment: BlockAlignment) => void;
  layoutMode?: BlockLayoutMode;
  onLayoutModeChange?: (mode: BlockLayoutMode) => void;
  width?: number;
  onWidthChange?: (width: number) => void;
  minWidth?: number;
  maxWidth?: number;
  height?: number;
  onHeightChange?: (height: number) => void;
  minHeight?: number;
  maxHeight?: number;
  caption?: string;
  onCaptionChange?: (caption: string) => void;
  captionPlaceholder?: string;
  credit?: string;
  onCreditChange?: (credit: string) => void;
  creditPlaceholder?: string;
  headerActions?: React.ReactNode;
  settingsContent?: React.ReactNode;
  defaultSettingsOpen?: boolean;
  onDelete?: () => void;
  children: React.ReactNode;
  className?: string;
}

const LAYOUT_MODES: {
  id: BlockLayoutMode;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "inline", label: "In line", icon: Square },
  { id: "wrap-left", label: "Wrap left", icon: PanelLeft },
  { id: "wrap-right", label: "Wrap right", icon: PanelRight },
  { id: "breakout", label: "Wide (75%)", icon: Columns2 },
  { id: "full", label: "Full (100%)", icon: Maximize2 },
];

export function BlockWrapper({
  selected = false,
  label,
  icon,
  badge,
  alignment = "center",
  onAlignmentChange,
  layoutMode = "inline",
  onLayoutModeChange,
  width = 100,
  onWidthChange,
  minWidth = 25,
  maxWidth = 100,
  height,
  onHeightChange,
  minHeight = 140,
  maxHeight = 1200,
  caption,
  onCaptionChange,
  captionPlaceholder = "Add a caption...",
  credit,
  onCreditChange,
  creditPlaceholder = "Source / Credit...",
  headerActions,
  settingsContent,
  defaultSettingsOpen = false,
  onDelete,
  children,
  className,
}: BlockWrapperProps) {
  const [settingsOpen, setSettingsOpen] = useState(defaultSettingsOpen);
  const [isResizingWidth, setIsResizingWidth] = useState(false);
  const [isResizingHeight, setIsResizingHeight] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const normalizedLayout = normalizeLayoutMode(layoutMode);
  const normalizedAlign = normalizeAlignment(alignment);

  const effectiveWidth =
    normalizedLayout === "full"
      ? 100
      : normalizedLayout === "breakout"
        ? Math.max(width, 75)
        : normalizedLayout === "wrap-left" || normalizedLayout === "wrap-right"
          ? Math.min(Math.max(width, 25), 65)
          : width;

  // Horizontal width drag handler
  const handleWidthResizeStart = useCallback(
    (e: React.MouseEvent, side: "left" | "right") => {
      if (!onWidthChange) return;
      e.preventDefault();
      e.stopPropagation();

      const el = containerRef.current;
      const parent = el?.parentElement;
      if (!el || !parent) return;

      const parentWidth = parent.getBoundingClientRect().width || 1;
      const startX = e.clientX;
      const startWidthPct = effectiveWidth;

      setIsResizingWidth(true);

      const onMouseMove = (moveEvent: MouseEvent) => {
        const deltaPx =
          side === "right"
            ? moveEvent.clientX - startX
            : startX - moveEvent.clientX;
        const multiplier =
          normalizedAlign === "center" && normalizedLayout === "inline" ? 2 : 1;
        const deltaPct = ((deltaPx * multiplier) / parentWidth) * 100;
        const nextWidth = Math.round(
          Math.min(maxWidth, Math.max(minWidth, startWidthPct + deltaPct))
        );
        onWidthChange(nextWidth);
      };

      const onMouseUp = () => {
        setIsResizingWidth(false);
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    },
    [effectiveWidth, minWidth, maxWidth, normalizedAlign, normalizedLayout, onWidthChange]
  );

  // Vertical height drag handler
  const handleHeightResizeStart = useCallback(
    (e: React.MouseEvent) => {
      if (!onHeightChange) return;
      e.preventDefault();
      e.stopPropagation();

      const startY = e.clientY;
      const startHeight = height || 420;
      setIsResizingHeight(true);

      const onMouseMove = (moveEvent: MouseEvent) => {
        const deltaY = moveEvent.clientY - startY;
        const nextHeight = Math.round(
          Math.min(maxHeight, Math.max(minHeight, startHeight + deltaY))
        );
        onHeightChange(nextHeight);
      };

      const onMouseUp = () => {
        setIsResizingHeight(false);
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    },
    [height, minHeight, maxHeight, onHeightChange]
  );

  const wrapperLayoutClass = cn(
    "my-4 transition-all relative group/block clear-none",
    normalizedLayout === "wrap-left" && "float-left mr-5 mb-3 z-10",
    normalizedLayout === "wrap-right" && "float-right ml-5 mb-3 z-10",
    normalizedLayout === "inline" && normalizedAlign === "left" && "mr-auto",
    normalizedLayout === "inline" && normalizedAlign === "center" && "mx-auto",
    normalizedLayout === "inline" && normalizedAlign === "right" && "ml-auto",
    (normalizedLayout === "breakout" || normalizedLayout === "full") &&
      "mx-auto clear-both"
  );

  const hasCaptionOrCredit =
    onCaptionChange !== undefined || onCreditChange !== undefined;

  return (
    <NodeViewWrapper
      className={wrapperLayoutClass}
      style={{
        width: `${effectiveWidth}%`,
        maxWidth: "100%",
      }}
      data-layout={normalizedLayout}
      data-align={normalizedAlign}
    >
      <div
        ref={containerRef}
        contentEditable={false}
        className={cn(
          "relative rounded-xl border bg-white text-slate-900 transition-all select-none overflow-visible",
          selected
            ? "border-blue-600 ring-2 ring-blue-600/20 shadow-md"
            : "border-slate-200 hover:border-blue-400/80 shadow-xs",
          (isResizingWidth || isResizingHeight) && "ring-2 ring-blue-600/35",
          className
        )}
      >
        {/* Top Block Control Bar (Blue Header when selected, clean slate when idle) */}
        <div
          className={cn(
            "flex items-center justify-between gap-1.5 px-2.5 py-1.5 border-b rounded-t-xl text-xs transition-colors",
            selected
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-slate-50/90 text-slate-700 border-slate-200/80"
          )}
        >
          {/* Left: Drag Handle + Block Icon & Name */}
          <div className="flex items-center gap-1.5 min-w-0">
            <div
              data-drag-handle
              draggable="true"
              className={cn(
                "cursor-grab active:cursor-grabbing p-1 rounded transition-colors",
                selected
                  ? "text-white/80 hover:text-white hover:bg-blue-700"
                  : "text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
              )}
              title="Drag to move block"
            >
              <GripVertical className="size-3.5" />
            </div>

            {icon && (
              <span
                className={cn(
                  "shrink-0",
                  selected ? "text-white" : "text-blue-600"
                )}
              >
                {icon}
              </span>
            )}

            <span className="font-semibold truncate text-[11px]">{label}</span>

            {badge && (
              <span
                className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded font-mono shrink-0",
                  selected
                    ? "bg-blue-700 text-white"
                    : "bg-slate-200/70 text-slate-600"
                )}
              >
                {badge}
              </span>
            )}

            {onWidthChange && (
              <span
                className={cn(
                  "text-[10px] font-mono hidden sm:inline-block",
                  selected ? "text-blue-100" : "text-slate-400"
                )}
              >
                {effectiveWidth}%
              </span>
            )}
          </div>

          {/* Right: Layout Mode, Alignment, Custom Actions, Settings, Delete */}
          <div className="flex items-center gap-0.5 shrink-0 flex-wrap">
            {headerActions}

            {/* Layout Mode Controls */}
            {onLayoutModeChange && (
              <div
                className={cn(
                  "hidden md:flex items-center rounded-md p-0.5 gap-0.5 mr-1",
                  selected
                    ? "bg-blue-700/80"
                    : "bg-white border border-slate-200/80"
                )}
              >
                {LAYOUT_MODES.map((m) => {
                  const IconComp = m.icon;
                  const active = normalizedLayout === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onLayoutModeChange(m.id);
                        if (m.id === "full" && onWidthChange) onWidthChange(100);
                        else if (
                          m.id === "breakout" &&
                          onWidthChange &&
                          width < 75
                        )
                          onWidthChange(85);
                        else if (
                          (m.id === "wrap-left" || m.id === "wrap-right") &&
                          onWidthChange &&
                          width > 65
                        ) {
                          onWidthChange(45);
                        }
                      }}
                      title={m.label}
                      className={cn(
                        "h-5 px-1.5 rounded text-[10px] font-medium flex items-center gap-1 transition-colors cursor-pointer",
                        active
                          ? selected
                            ? "bg-white text-blue-600 font-bold"
                            : "bg-blue-600 text-white"
                          : selected
                            ? "text-blue-100 hover:text-white"
                            : "text-slate-500 hover:text-slate-900"
                      )}
                    >
                      <IconComp className="size-3" />
                      <span className="hidden xl:inline">{m.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Alignment Controls */}
            {onAlignmentChange && normalizedLayout === "inline" && (
              <div
                className={cn(
                  "flex items-center rounded-md p-0.5 gap-0.5 mr-1",
                  selected
                    ? "bg-blue-700/80"
                    : "bg-white border border-slate-200/80"
                )}
              >
                {(
                  [
                    { id: "left", icon: AlignLeft, title: "Align left" },
                    { id: "center", icon: AlignCenter, title: "Align center" },
                    { id: "right", icon: AlignRight, title: "Align right" },
                  ] as const
                ).map((a) => {
                  const IconComp = a.icon;
                  const active = normalizedAlign === a.id;
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAlignmentChange(a.id);
                      }}
                      title={a.title}
                      className={cn(
                        "size-5 rounded flex items-center justify-center transition-colors cursor-pointer",
                        active
                          ? selected
                            ? "bg-white text-blue-600"
                            : "bg-blue-600 text-white"
                          : selected
                            ? "text-blue-100 hover:text-white"
                            : "text-slate-500 hover:text-slate-900"
                      )}
                    >
                      <IconComp className="size-3" />
                    </button>
                  );
                })}
              </div>
            )}

            {/* Settings & Caption Toggle */}
            {(settingsContent || hasCaptionOrCredit) && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSettingsOpen((v) => !v);
                }}
                title="Block settings & caption"
                className={cn(
                  "h-6 px-2 rounded-md text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer",
                  settingsOpen
                    ? selected
                      ? "bg-white text-blue-600 font-bold"
                      : "bg-blue-50 text-blue-600"
                    : selected
                      ? "text-blue-100 hover:bg-blue-700 hover:text-white"
                      : "text-slate-600 hover:bg-slate-200/60"
                )}
              >
                <SlidersHorizontal className="size-3" />
                <span className="hidden sm:inline">Settings</span>
                {settingsOpen ? (
                  <ChevronUp className="size-3" />
                ) : (
                  <ChevronDown className="size-3" />
                )}
              </button>
            )}

            {/* Delete Block */}
            {onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                title="Delete block"
                className={cn(
                  "size-6 rounded-md flex items-center justify-center transition-colors cursor-pointer",
                  selected
                    ? "text-blue-100 hover:bg-red-500 hover:text-white"
                    : "text-slate-500 hover:bg-red-50 hover:text-red-600"
                )}
              >
                <Trash2 className="size-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Main Block Content */}
        <div className="relative">{children}</div>

        {/* Left / Right Width Resize Handles */}
        {onWidthChange && normalizedLayout !== "full" && (
          <>
            <div
              onMouseDown={(e) => handleWidthResizeStart(e, "left")}
              title="Drag to resize width"
              className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-10 rounded-full bg-white border-2 border-blue-600 shadow-sm opacity-0 group-hover/block:opacity-100 hover:scale-110 cursor-ew-resize z-20 transition-all"
            />
            <div
              onMouseDown={(e) => handleWidthResizeStart(e, "right")}
              title="Drag to resize width"
              className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-2.5 h-10 rounded-full bg-white border-2 border-blue-600 shadow-sm opacity-0 group-hover/block:opacity-100 hover:scale-110 cursor-ew-resize z-20 transition-all"
            />
          </>
        )}

        {/* Bottom Height Resize Handle */}
        {onHeightChange && (
          <div
            onMouseDown={handleHeightResizeStart}
            title="Drag to resize height"
            className="w-full h-3 flex items-center justify-center cursor-ns-resize bg-slate-50 hover:bg-blue-50 transition-colors border-t border-slate-200/70"
          >
            <div className="w-10 h-1 rounded-full bg-slate-300 group-hover/block:bg-blue-500 transition-colors" />
          </div>
        )}

        {/* Caption Preview (when settings panel is closed) */}
        {!settingsOpen && (caption || credit) && (
          <div
            onClick={() => setSettingsOpen(true)}
            className="px-3.5 py-2 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-600 flex items-center justify-between gap-2 cursor-pointer hover:bg-slate-50 transition-colors rounded-b-xl"
          >
            <span className="italic truncate">{caption}</span>
            {credit && (
              <span className="text-[11px] text-slate-400 shrink-0">
                Source: {credit}
              </span>
            )}
          </div>
        )}

        {/* Collapsible Settings & Caption Drawer */}
        {settingsOpen && (settingsContent || hasCaptionOrCredit) && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="p-3.5 border-t border-slate-200 bg-slate-50/70 space-y-3 rounded-b-xl"
          >
            {settingsContent}

            {hasCaptionOrCredit && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {onCaptionChange !== undefined && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600">
                      Caption
                    </label>
                    <input
                      type="text"
                      value={caption || ""}
                      onChange={(e) => onCaptionChange(e.target.value)}
                      placeholder={captionPlaceholder}
                      className="h-8 w-full rounded-md border border-slate-200 bg-white px-2.5 text-xs focus:outline-none focus:border-blue-600"
                    />
                  </div>
                )}
                {onCreditChange !== undefined && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600">
                      Source / Credit
                    </label>
                    <input
                      type="text"
                      value={credit || ""}
                      onChange={(e) => onCreditChange(e.target.value)}
                      placeholder={creditPlaceholder}
                      className="h-8 w-full rounded-md border border-slate-200 bg-white px-2.5 text-xs focus:outline-none focus:border-blue-600"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
}
