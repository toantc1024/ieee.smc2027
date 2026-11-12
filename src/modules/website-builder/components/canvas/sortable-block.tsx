"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { useDroppable, useDndContext } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  ChevronUp,
  ChevronDown,
  Copy,
  CopyPlus,
  Scissors,
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
import { getBlockPresentation, isBlockHidden } from "../../utils/block-presentation";
import { EditableChildren, EditableNestedBlock, PublicNestedBlock } from "./columns-slot";

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
    cutBlock,
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
  const isHidden = isBlockHidden(block);
  const isPreview = viewMode === "preview";

  const def = getBlockDefinition(block.type);
  const ComponentToRender = def?.render;
  const presentation = getBlockPresentation(block);

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
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isHidden ? (isHovered || isSelected ? 0.75 : 0.45) : 1,
    zIndex: !isDragging && (isOverBefore || isOverAfter) ? 9999 : isDragging ? 100 : isSelected ? 55 : isHovered ? 50 : 2,
  };

  // Counter scale formula: 100 / effectiveZoom so toolbar remains crisp at any zoom
  const counterScale =
    effectiveZoom > 0 && effectiveZoom < 100 ? 100 / effectiveZoom : 1;

  if (isPreview) {
    if (isHidden) return null;
    return (
      <div
        id={block.id}
        className={cn(
          "relative w-full",
          presentation.className
        )}
        style={presentation.style}
      >
        <BlockErrorBoundary blockType={block.type} blockId={block.id}>
          {ComponentToRender ? (
            <ComponentToRender {...block.props} {...(block.type === "ColumnsSlot" ? { builderBlockId: block.id, builderEditing: false } : {})}>{block.children?.map((child) => <PublicNestedBlock key={child.id} block={child} />)}</ComponentToRender>
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
      data-builder-block={block.id}
      data-builder-state={isSelected ? "selected" : isHovered ? "hovered" : "idle"}
      data-builder-hidden={isHidden ? "true" : "false"}
      {...attributes}
      onPointerDown={(event) => {
        const target = event.target as HTMLElement;
        if (target.closest("[data-builder-controls], [data-builder-nested], [data-builder-dropzone]")) return;
        listeners?.onPointerDown?.(event);
      }}
      onClick={(e) => {
        e.stopPropagation();
        selectBlock(block.id);
      }}
      onMouseEnter={(event) => { if (event.buttons === 0) hoverBlock(block.id); }}
      onMouseMove={(event) => {
        if (event.buttons === 0 && useBuilderStore.getState().hoveredBlockId !== block.id) {
          hoverBlock(block.id);
        }
      }}
      onMouseLeave={() => { if (useBuilderStore.getState().hoveredBlockId === block.id) hoverBlock(null); }}
      className={cn(
        "relative group select-none font-sans w-full cursor-grab active:cursor-grabbing touch-none"
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

      {isDragging && <div className="absolute inset-0 z-30 flex items-center justify-center rounded-xl border-2 border-dashed border-blue-500/80 bg-slate-500/10 pointer-events-none"><span className="rounded-full border border-white/20 bg-slate-900/80 px-3.5 py-1 text-xs font-bold text-white shadow-md">Dragging block</span></div>}

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

      {/* Top-Left Floating Blue Action Toolbar */}
      {(isSelected || isHovered) && !isDragging && (
        <div
          className="absolute top-1.5 left-1.5 z-[70] flex items-center gap-1.5 h-9 bg-blue-600 text-white rounded-lg px-3 py-1.5 shadow-lg shadow-blue-600/35 border border-blue-400/80 select-none"
          data-builder-toolbar
          data-builder-controls
          onPointerDown={(event) => event.stopPropagation()}
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
            className="flex items-center gap-2 px-1.5 py-1 text-white font-bold select-none shrink-0 cursor-grab active:cursor-grabbing touch-none"
            title="Drag to reorder block"
          >
            <GripVertical className="w-3.5 h-3.5 text-blue-100 shrink-0" />
            <span className="text-xs font-bold tracking-tight max-w-[160px] truncate leading-none text-white">
              {def?.label || block.type}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            {/* Move Up */}
            <button
              type="button"
              disabled={index === 0}
              onClick={(e) => {
                e.stopPropagation();
                moveBlockUp(block.id);
              }}
              className="w-7 h-7 flex items-center justify-center hover:bg-blue-700 rounded-md disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer shrink-0"
              title="Move Up"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>

            {/* Move Down */}
            <button
              type="button"
              disabled={index === totalBlocks - 1}
              onClick={(e) => {
                e.stopPropagation();
                moveBlockDown(block.id);
              }}
              className="w-7 h-7 flex items-center justify-center hover:bg-blue-700 rounded-md disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer shrink-0"
              title="Move Down"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            <div className="w-px h-4 bg-blue-400/70 mx-0.5 shrink-0" />

            {/* Copy Block */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                copyBlock(block.id);
                toast.success(`Copied "${def?.label || block.type}"`);
              }}
              className="w-7 h-7 flex items-center justify-center hover:bg-blue-700 rounded-md transition-colors cursor-pointer shrink-0"
              title="Copy Block"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>

              <button
                type="button"
                disabled={!clipboardBlock}
                onClick={(e) => {
                  e.stopPropagation();
                  pasteBlock(index + 1);
                  toast.success("Pasted block below");
                }}
                className="w-7 h-7 flex items-center justify-center hover:bg-blue-700 rounded-md transition-colors cursor-pointer shrink-0 disabled:opacity-30"
                title="Paste Copied Block Below"
              >
                <ClipboardPaste className="w-3.5 h-3.5" />
              </button>

            <button type="button" onClick={(event) => { event.stopPropagation(); cutBlock(block.id); toast.success(`Cut "${def?.label || block.type}"`); }} className="w-7 h-7 flex items-center justify-center hover:bg-blue-700 rounded-md transition-colors cursor-pointer shrink-0" title="Cut Block" aria-label={`Cut ${def?.label || block.type}`}><Scissors className="w-3.5 h-3.5" /></button>

            {/* Duplicate */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                duplicateBlock(block.id);
                toast.success(`Duplicated "${def?.label || block.type}"`);
              }}
              className="w-7 h-7 flex items-center justify-center hover:bg-blue-700 rounded-md transition-colors cursor-pointer shrink-0"
              title="Duplicate Block"
            >
              <CopyPlus className="w-3.5 h-3.5" />
            </button>

            <div className="w-px h-4 bg-blue-400/70 mx-0.5 shrink-0" />

            {/* Hide / Show */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleBlockHidden(block.id);
              }}
              className={cn("w-7 h-7 flex items-center justify-center rounded-md transition-colors cursor-pointer shrink-0", isHidden ? "bg-amber-500 hover:bg-amber-600 text-white shadow-xs" : "hover:bg-blue-700")}
              title={isHidden ? "Show Block" : "Hide Block"}
            >
              {isHidden ? (
                <EyeOff className="w-3.5 h-3.5" />
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
              className="w-7 h-7 flex items-center justify-center hover:bg-red-600 rounded-md transition-colors cursor-pointer shrink-0"
              title="Delete Block"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Hidden Status Badge (counter-scaled at bottom right) */}
      {isHidden && !isDragging && (
        <div
          className="absolute bottom-2 right-2 z-30 pointer-events-none flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/95 text-white text-[11px] font-bold shadow-md shadow-amber-500/20 border border-amber-300 backdrop-blur font-sans select-none"
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
          "min-h-[48px] w-full flex flex-col justify-center",
          block.type !== "ColumnsSlot" && block.type !== "Container" && "pointer-events-none",
          presentation.className
        )}
        style={presentation.style}
      >
        <BlockErrorBoundary blockType={block.type} blockId={block.id}>
          {ComponentToRender ? (
            <ComponentToRender {...block.props} {...(block.type === "ColumnsSlot" ? { builderBlockId: block.id, builderEditing: true } : {})}>{block.type === "Container" ? <EditableChildren block={block} /> : block.children?.map((child) => <EditableNestedBlock key={child.id} block={child} />)}</ComponentToRender>
          ) : (
            <div className="p-8 text-center bg-slate-100 text-slate-500 font-medium">
              Section renderer unavailable for: {block.type}
            </div>
          )}
        </BlockErrorBoundary>
      </div>

      {/* Blue Selection Border & 4 Corner Handles */}
      <div
        data-builder-outline
        className={cn(
          "absolute inset-0 pointer-events-none z-[60] transition-colors duration-100 border-2",
          isSelected
            ? isHidden ? "border-amber-500 shadow-xs" : "border-blue-600 shadow-xs"
            : isHovered
              ? isHidden ? "border-amber-400/80 border-dashed" : "border-blue-500/70"
              : isHidden ? "border-dashed border-amber-400/40" : "border-transparent"
        )}
      >
        {isSelected && (
          <>
            {["-top-1.25 -left-1.25", "-top-1.25 -right-1.25", "-bottom-1.25 -left-1.25", "-bottom-1.25 -right-1.25"].map((position) => <span key={position} className={cn("absolute w-2.5 h-2.5 bg-white border-2 rounded-none shadow-md pointer-events-none z-[70]", position, isHidden ? "border-amber-500" : "border-blue-600")} />)}
          </>
        )}
      </div>
    </div>
  );
}
