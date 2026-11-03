"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { useDroppable, useDndContext } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  ArrowUp,
  ArrowDown,
  Copy,
  ClipboardCopy,
  ClipboardPaste,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";
import type { PageBlock } from "../../types";
import { getBlockDefinition } from "../../registry";
import { useBuilderStore } from "../../store/builder-store";
import { BlockErrorBoundary } from "./block-error-boundary";
import { SeamDropzoneIndicator } from "./seam-dropzone";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface SortableBlockProps {
  block: PageBlock;
  index: number;
  totalBlocks: number;
  effectiveZoom?: number;
}

export function SortableBlock({
  block,
  index,
  totalBlocks,
  effectiveZoom = 100,
}: SortableBlockProps) {
  const {
    selectedBlockId,
    hoveredBlockId,
    selectBlock,
    hoverBlock,
    moveBlockUp,
    moveBlockDown,
    duplicateBlock,
    copyBlock,
    pasteBlock,
    clipboardBlock,
    removeBlock,
    toggleBlockHidden,
    viewMode,
  } = useBuilderStore();

  const { active } = useDndContext();
  const isAnyDragActive = Boolean(active);

  const isSelected = selectedBlockId === block.id;
  const isHovered = hoveredBlockId === block.id;
  const isPreview = viewMode === "preview";

  const def = getBlockDefinition(block.type);
  const ComponentToRender = def?.render;
  const customStyles = (block.props?._styles || {}) as Record<string, string>;

  // DnD Sortable hook
  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: block.id,
    disabled: isPreview,
  });

  // Top and bottom droppables for seam insertion
  const { isOver: isOverBefore, setNodeRef: setBeforeDropRef } = useDroppable({
    id: `drop-before-${block.id}`,
    disabled: isPreview,
  });

  const { isOver: isOverAfter, setNodeRef: setAfterDropRef } = useDroppable({
    id: `drop-after-${block.id}`,
    disabled: isPreview,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.45 : 1,
  };

  // Counter scale formula: 100 / effectiveZoom so toolbar remains crisp at any zoom
  const counterScale =
    effectiveZoom > 0 && effectiveZoom < 100 ? 100 / effectiveZoom : 1;

  if (isPreview) {
    if (block.hidden) return null;
    return (
      <div
        id={block.id}
        className={cn(
          "relative w-full",
          customStyles.paddingTop,
          customStyles.paddingBottom,
          customStyles.className
        )}
        style={{
          backgroundColor: customStyles.backgroundColor || undefined,
          color: customStyles.textColor || undefined,
        }}
      >
        <BlockErrorBoundary blockType={block.type} blockId={block.id}>
          {ComponentToRender ? (
            <ComponentToRender {...block.props} />
          ) : (
            <div className="p-8 text-center bg-slate-100 text-slate-500">
              Unknown block: {block.type}
            </div>
          )}
        </BlockErrorBoundary>
      </div>
    );
  }

  return (
    <div
      ref={setSortableRef}
      style={style}
      id={block.id}
      onClick={(e) => {
        e.stopPropagation();
        selectBlock(block.id);
      }}
      onMouseEnter={() => hoverBlock(block.id)}
      onMouseLeave={() => hoverBlock(null)}
      className={cn(
        "relative group transition-all duration-150 select-none",
        isSelected ? "z-[45]" : isHovered ? "z-[40]" : "z-[2]",
        block.hidden && "opacity-45 grayscale"
      )}
    >
      {/* Top half droppable seam detector (only intercepts pointer when dragging) */}
      <div
        ref={setBeforeDropRef}
        className={cn(
          "absolute top-0 inset-x-0 h-1/2 z-20",
          isAnyDragActive ? "pointer-events-auto" : "pointer-events-none"
        )}
      />

      {/* Bottom half droppable seam detector (only intercepts pointer when dragging) */}
      <div
        ref={setAfterDropRef}
        className={cn(
          "absolute bottom-0 inset-x-0 h-1/2 z-20",
          isAnyDragActive ? "pointer-events-auto" : "pointer-events-none"
        )}
      />

      {/* Seam insertion indicator before */}
      {isOverBefore && (
        <div className="absolute top-0 inset-x-0 z-50">
          <SeamDropzoneIndicator
            label={def?.label || block.type}
            position="before"
            counterScale={counterScale}
          />
        </div>
      )}

      {/* Seam insertion indicator after */}
      {isOverAfter && (
        <div className="absolute bottom-0 inset-x-0 z-50">
          <SeamDropzoneIndicator
            label={def?.label || block.type}
            position="after"
            counterScale={counterScale}
          />
        </div>
      )}

      {/* Top-Left Floating Blue Action Toolbar (HCMUTE Website Builder Style) */}
      {(isSelected || isHovered) && !isDragging && (
        <div
          className="absolute top-1.5 left-1.5 z-50 flex items-center gap-1.5 h-9 bg-blue-600 text-white rounded-lg px-3 py-1.5 shadow-lg shadow-blue-600/35 border border-blue-400/80 select-none"
          style={{
            transform: counterScale !== 1 ? `scale(${counterScale})` : undefined,
            transformOrigin: "top left",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drag Grip Handle + Block Name */}
          <div
            {...attributes}
            {...listeners}
            className="flex items-center gap-1.5 cursor-grab active:cursor-grabbing pr-2 border-r border-white/25 hover:text-white/90 h-full"
            title="Drag to reorder block"
          >
            <GripVertical className="w-4 h-4 opacity-90 shrink-0" />
            <span className="text-xs font-semibold tracking-tight whitespace-nowrap">
              {def?.label || block.type}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 pl-0.5">
            {/* Move Up */}
            <button
              type="button"
              disabled={index === 0}
              onClick={(e) => {
                e.stopPropagation();
                moveBlockUp(block.id);
              }}
              className="w-6 h-6 flex items-center justify-center hover:bg-blue-700 rounded-md disabled:opacity-35 disabled:pointer-events-none transition-colors cursor-pointer"
              title="Move Up"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>

            {/* Move Down */}
            <button
              type="button"
              disabled={index === totalBlocks - 1}
              onClick={(e) => {
                e.stopPropagation();
                moveBlockDown(block.id);
              }}
              className="w-6 h-6 flex items-center justify-center hover:bg-blue-700 rounded-md disabled:opacity-35 disabled:pointer-events-none transition-colors cursor-pointer"
              title="Move Down"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>

            <div className="w-px h-4 bg-white/25 mx-0.5" />

            {/* Copy Block */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                copyBlock(block.id);
                toast.success(`Copied "${def?.label || block.type}"`);
              }}
              className="w-6 h-6 flex items-center justify-center hover:bg-blue-700 rounded-md transition-colors cursor-pointer"
              title="Copy Block"
            >
              <ClipboardCopy className="w-3.5 h-3.5" />
            </button>

            {/* Paste Below */}
            {clipboardBlock && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  pasteBlock(index + 1);
                  toast.success("Pasted block below");
                }}
                className="w-6 h-6 flex items-center justify-center hover:bg-blue-700 rounded-md transition-colors cursor-pointer"
                title="Paste Copied Block Below"
              >
                <ClipboardPaste className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Duplicate */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                duplicateBlock(block.id);
                toast.success(`Duplicated "${def?.label || block.type}"`);
              }}
              className="w-6 h-6 flex items-center justify-center hover:bg-blue-700 rounded-md transition-colors cursor-pointer"
              title="Duplicate Block"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>

            {/* Hide / Show */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleBlockHidden(block.id);
              }}
              className="w-6 h-6 flex items-center justify-center hover:bg-blue-700 rounded-md transition-colors cursor-pointer"
              title={block.hidden ? "Show Block" : "Hide Block"}
            >
              {block.hidden ? (
                <EyeOff className="w-3.5 h-3.5 text-amber-300" />
              ) : (
                <Eye className="w-3.5 h-3.5" />
              )}
            </button>

            {/* Delete */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeBlock(block.id);
                toast.success(`Removed "${def?.label || block.type}"`);
              }}
              className="w-6 h-6 flex items-center justify-center hover:bg-red-500 rounded-md transition-colors cursor-pointer"
              title="Delete Block"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Hidden Status Badge (counter-scaled at bottom right) */}
      {block.hidden && (
        <div
          className="absolute bottom-3 right-3 z-30 px-2.5 py-1 rounded-full bg-amber-500 text-white text-[10px] font-bold shadow-md flex items-center gap-1 select-none pointer-events-none"
          style={{
            transform: counterScale !== 1 ? `scale(${counterScale})` : undefined,
            transformOrigin: "bottom right",
          }}
        >
          <EyeOff className="w-3 h-3" />
          <span>Hidden</span>
        </div>
      )}

      {/* Render Component Body */}
      <div
        className={cn(
          "w-full pointer-events-auto",
          customStyles.paddingTop,
          customStyles.paddingBottom,
          customStyles.className
        )}
        style={{
          backgroundColor: customStyles.backgroundColor || undefined,
          color: customStyles.textColor || undefined,
        }}
      >
        <BlockErrorBoundary blockType={block.type} blockId={block.id}>
          {ComponentToRender ? (
            <ComponentToRender {...block.props} />
          ) : (
            <div className="p-8 text-center bg-slate-100 text-slate-500 font-medium">
              Section renderer unavailable for: {block.type}
            </div>
          )}
        </BlockErrorBoundary>
      </div>

      {/* Blue Selection Border & 4 Corner Handles (Figma / HCMUTE Artboard Style) */}
      <div
        className={cn(
          "absolute inset-0 pointer-events-none z-40 transition-colors duration-150",
          isSelected
            ? "border-2 border-blue-600 shadow-[0_0_0_1px_rgba(37,99,235,0.2)]"
            : isHovered
              ? "border-2 border-blue-500/70"
              : "border border-transparent"
        )}
      >
        {isSelected && (
          <>
            <span className="absolute -top-1.25 -left-1.25 w-2.5 h-2.5 bg-white border-2 border-blue-600 rounded-[1px] shadow-xs" />
            <span className="absolute -top-1.25 -right-1.25 w-2.5 h-2.5 bg-white border-2 border-blue-600 rounded-[1px] shadow-xs" />
            <span className="absolute -bottom-1.25 -left-1.25 w-2.5 h-2.5 bg-white border-2 border-blue-600 rounded-[1px] shadow-xs" />
            <span className="absolute -bottom-1.25 -right-1.25 w-2.5 h-2.5 bg-white border-2 border-blue-600 rounded-[1px] shadow-xs" />
          </>
        )}
      </div>
    </div>
  );
}
