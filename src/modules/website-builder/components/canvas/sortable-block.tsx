"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  ChevronUp,
  ChevronDown,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  Sliders,
} from "lucide-react";
import type { PageBlock } from "../../types";
import { getBlockDefinition } from "../../registry";
import { useBuilderStore } from "../../store/builder-store";
import { BlockErrorBoundary } from "./block-error-boundary";
import { SeamDropzoneIndicator } from "./seam-dropzone";
import { cn } from "@/lib/utils";

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
    removeBlock,
    toggleBlockHidden,
    viewMode,
  } = useBuilderStore();

  const isSelected = selectedBlockId === block.id;
  const isHovered = hoveredBlockId === block.id;
  const isPreview = viewMode === "preview";

  const def = getBlockDefinition(block.type);
  const ComponentToRender = def?.render;

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
    opacity: isDragging ? 0.35 : 1,
  };

  // Counter scale formula: 100 / effectiveZoom so toolbar remains crisp
  const counterScale =
    effectiveZoom > 0 && effectiveZoom < 100 ? 100 / effectiveZoom : 1;

  if (isPreview) {
    if (block.hidden) return null;
    return (
      <div id={block.id} className="relative w-full">
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
        "relative group transition-all duration-150",
        isSelected
          ? "ring-2 ring-blue-600 z-[45] shadow-lg"
          : isHovered
          ? "ring-1 ring-blue-400 z-[40]"
          : "z-[2]",
        block.hidden && "opacity-45 grayscale"
      )}
    >
      {/* Top half droppable seam detector */}
      <div
        ref={setBeforeDropRef}
        className="absolute top-0 inset-x-0 h-1/2 z-20 pointer-events-auto"
      />

      {/* Bottom half droppable seam detector */}
      <div
        ref={setAfterDropRef}
        className="absolute bottom-0 inset-x-0 h-1/2 z-20 pointer-events-auto"
      />

      {/* Seam insertion indicator before */}
      {isOverBefore && (
        <div className="absolute top-0 inset-x-0">
          <SeamDropzoneIndicator
            label={def?.label || block.type}
            position="before"
            counterScale={counterScale}
          />
        </div>
      )}

      {/* Seam insertion indicator after */}
      {isOverAfter && (
        <div className="absolute bottom-0 inset-x-0">
          <SeamDropzoneIndicator
            label={def?.label || block.type}
            position="after"
            counterScale={counterScale}
          />
        </div>
      )}

      {/* Floating Counter-Scaled Action Pill */}
      {(isSelected || isHovered) && (
        <div
          className="absolute -top-4 left-4 z-[50] flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900 text-white shadow-xl backdrop-blur-md select-none border border-slate-700"
          style={{
            transform: counterScale !== 1 ? `scale(${counterScale})` : undefined,
            transformOrigin: "top left",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drag Grip Handle */}
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 cursor-grab active:cursor-grabbing"
            title="Drag to reorder"
          >
            <GripVertical className="w-3.5 h-3.5" />
          </button>

          <span className="text-xs font-bold text-white px-1">
            {def?.label || block.type}
          </span>

          <div className="h-3 w-px bg-slate-700 mx-0.5" />

          {/* Move Up */}
          <button
            type="button"
            disabled={index === 0}
            onClick={() => moveBlockUp(block.id)}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none"
            title="Move Up"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>

          {/* Move Down */}
          <button
            type="button"
            disabled={index === totalBlocks - 1}
            onClick={() => moveBlockDown(block.id)}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none"
            title="Move Down"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          <div className="h-3 w-px bg-slate-700 mx-0.5" />

          {/* Duplicate */}
          <button
            type="button"
            onClick={() => duplicateBlock(block.id)}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
            title="Duplicate Section"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>

          {/* Hide / Show */}
          <button
            type="button"
            onClick={() => toggleBlockHidden(block.id)}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
            title={block.hidden ? "Show Section" : "Hide Section"}
          >
            {block.hidden ? (
              <EyeOff className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Eye className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={() => removeBlock(block.id)}
            className="p-1 rounded text-rose-400 hover:text-rose-200 hover:bg-rose-950/60"
            title="Delete Section"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
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
          <span>Hidden in Live View</span>
        </div>
      )}

      {/* Render Component Body */}
      <div className="w-full pointer-events-auto">
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
    </div>
  );
}
