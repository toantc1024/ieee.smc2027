"use client";

import React, { useRef, useState, useEffect } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus, LayoutGrid, ClipboardPaste } from "lucide-react";
import { useBuilderStore } from "../../store/builder-store";
import { SortableBlock } from "./sortable-block";
import { SeamDropzoneIndicator } from "./seam-dropzone";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const CANONICAL_WIDTHS = {
  desktop: 1240,
  tablet: 768,
  mobile: 390,
};

function BottomCanvasDropzone({
  counterScale,
  hasClipboard,
  onOpenLibrary,
  onPasteEnd,
}: {
  counterScale: number;
  hasClipboard: boolean;
  onOpenLibrary: () => void;
  onPasteEnd: () => void;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: "drop-after-end",
  });

  return (
    <div
      ref={setNodeRef}
      onClick={(e) => e.stopPropagation()}
      className={cn(
        "relative w-full py-10 my-6 rounded-2xl border-2 border-dashed transition-colors flex flex-col items-center justify-center gap-3",
        isOver
          ? "border-blue-600 bg-blue-50/50"
          : "border-slate-200 hover:border-blue-400/70 bg-slate-50/40"
      )}
    >
      {isOver && (
        <div className="absolute top-0 inset-x-0">
          <SeamDropzoneIndicator
            label="Canvas End"
            position="after"
            counterScale={counterScale}
          />
        </div>
      )}

      <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
        <Plus className="w-5 h-5" />
      </div>
      <div className="text-center">
        <p className="text-sm font-bold text-slate-800">
          Add Section to End
        </p>
        <p className="text-xs text-slate-500 mt-0.5">
          Drag any block here or browse the block library
        </p>
      </div>
      <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={onOpenLibrary}
          className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>Browse Block Library</span>
        </button>
        {hasClipboard && (
          <button
            type="button"
            onClick={onPasteEnd}
            className="px-3.5 py-1.5 rounded-lg border border-blue-200 bg-blue-50/80 hover:bg-blue-100 text-blue-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ClipboardPaste className="w-3.5 h-3.5" />
            <span>Paste Block</span>
          </button>
        )}
      </div>
    </div>
  );
}

export function BuilderCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const artboardRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(1240);
  const [frameHeight, setFrameHeight] = useState(800);

  const {
    data,
    viewport,
    zoom,
    isAutoFit,
    viewMode,
    clipboardBlock,
    selectBlock,
    hoverBlock,
    setSidebarTab,
    pasteBlock,
  } = useBuilderStore();

  const isPreview = viewMode === "preview";

  // Measure scroll container width with a 1px deadzone so minor subpixel changes never loop
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const nextWidth = Math.floor(entry.contentRect.width);
      if (nextWidth > 0) {
        setContainerWidth((prev) => (Math.abs(prev - nextWidth) >= 1 ? nextWidth : prev));
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Measure rendered artboard height with a >2px deadzone (never re-subscribing on content edits)
  useEffect(() => {
    const el = artboardRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const nextHeight = Math.ceil(entry.contentRect.height);
      if (nextHeight > 0) {
        setFrameHeight((prev) => (Math.abs(prev - nextHeight) > 2 ? nextHeight : prev));
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [isPreview]);

  // HCM-UTE adaptive Desktop Auto-Fit:
  // On desktop auto-fit, adapt baseWidth down to 768px before applying CSS transform scale,
  // keeping activeScale === 1 (crisp, natural flow, zero height oscillation) on normal screens.
  const availableWidth = Math.max(280, containerWidth - 48);
  const baseWidth =
    isAutoFit && viewport === "desktop"
      ? Math.min(CANONICAL_WIDTHS.desktop, Math.max(768, availableWidth))
      : CANONICAL_WIDTHS[viewport];

  const autoFitRatio = Math.min(1, Number((availableWidth / baseWidth).toFixed(3)));
  const activeScale = isPreview ? 1 : isAutoFit ? autoFitRatio : zoom / 100;
  const effectiveZoom = Math.round(activeScale * 100);
  const isScaled = !isPreview && activeScale !== 1;

  const visualWidth = Math.round(baseWidth * activeScale);
  const visualHeight = Math.max(360, Math.round(frameHeight * activeScale));
  const counterScale = effectiveZoom > 0 && effectiveZoom < 100 ? 100 / effectiveZoom : 1;

  const blockIds = data.content.map((b) => b.id);

  return (
    <div
      ref={containerRef}
      onClick={() => selectBlock(null)}
      onMouseLeave={() => hoverBlock(null)}
      className={cn(
        "relative flex-1 h-full overflow-y-auto overflow-x-hidden [scrollbar-gutter:stable] flex flex-col items-center",
        isPreview
          ? "bg-white p-0"
          : "p-6 pb-20 bg-[#edf2f7] bg-[radial-gradient(#94a3b8_1.25px,transparent_1.25px)] [background-size:24px_24px]"
      )}
    >
      {/* Physical Outer Shell — NO width/height CSS transition so image loads never oscillate */}
      <div
        className={cn(
          "relative shrink-0",
          !isPreview &&
            "shadow-[0_20px_60px_-15px_rgba(15,23,42,0.16)] rounded-xl ring-1 ring-slate-900/10 bg-white"
        )}
        style={{
          width: isPreview ? "100%" : visualWidth,
          height: isScaled ? visualHeight : "auto",
          minHeight: isPreview ? "100%" : isScaled ? visualHeight : 640,
          overflow: "visible",
        }}
      >
        {/* Inner Canonical Artboard */}
        <div
          ref={artboardRef}
          style={
            isPreview
              ? { width: "100%" }
              : isScaled
                ? {
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: baseWidth,
                    transform: `scale(${activeScale})`,
                    transformOrigin: "0 0",
                  }
                : {
                    position: "relative",
                    width: baseWidth,
                  }
          }
          className="flex flex-col min-h-[640px] bg-white rounded-xl"
        >
          <SortableContext
            items={blockIds}
            strategy={verticalListSortingStrategy}
          >
            {data.content.length === 0 ? (
              <div
                onClick={(e) => e.stopPropagation()}
                className="py-24 px-6 text-center space-y-4"
              >
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center mx-auto">
                  <Plus className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Your Page Canvas is Empty
                </h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">
                  Select or drag a section from the Blocks panel on the left to start building this page.
                </p>
                <div className="flex items-center justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setSidebarTab("library")}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors cursor-pointer"
                  >
                    Open Block Library
                  </button>
                  {clipboardBlock && (
                    <button
                      type="button"
                      onClick={() => {
                        pasteBlock();
                        toast.success("Pasted block to canvas");
                      }}
                      className="px-4 py-2 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-semibold transition-colors cursor-pointer"
                    >
                      Paste Block
                    </button>
                  )}
                </div>
              </div>
            ) : (
              data.content.map((block, idx) => (
                <SortableBlock
                  key={block.id}
                  block={block}
                  index={idx}
                  totalBlocks={data.content.length}
                  effectiveZoom={effectiveZoom}
                />
              ))
            )}
          </SortableContext>

          {/* Bottom Canvas Dropzone */}
          {!isPreview && data.content.length > 0 && (
            <div className="px-6 pb-10">
              <BottomCanvasDropzone
                counterScale={counterScale}
                hasClipboard={Boolean(clipboardBlock)}
                onOpenLibrary={() => setSidebarTab("library")}
                onPasteEnd={() => {
                  pasteBlock();
                  toast.success("Pasted block at end of page");
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
