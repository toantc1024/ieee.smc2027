"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus, LayoutGrid } from "lucide-react";
import { useBuilderStore } from "../../store/builder-store";
import { SortableBlock } from "./sortable-block";
import { SeamDropzoneIndicator } from "./seam-dropzone";
import { cn } from "@/lib/utils";

const CANONICAL_WIDTHS = {
  desktop: 1240,
  tablet: 768,
  mobile: 390,
};

function BottomCanvasDropzone({
  counterScale,
  onOpenLibrary,
}: {
  counterScale: number;
  onOpenLibrary: () => void;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: "drop-after-end",
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "relative w-full py-12 my-6 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-3",
        isOver
          ? "border-blue-600 bg-blue-50/50"
          : "border-slate-200 hover:border-slate-300 bg-white/60"
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

      <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
        <Plus className="w-5 h-5" />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-slate-800">
          Add Another Section
        </p>
        <p className="text-xs text-slate-400">
          Drop blocks here or open the library drawer to insert
        </p>
      </div>
      <button
        type="button"
        onClick={onOpenLibrary}
        className="mt-1 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
      >
        <LayoutGrid className="w-3.5 h-3.5" />
        <span>Browse Block Library</span>
      </button>
    </div>
  );
}

export function BuilderCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const artboardRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(1240);
  const [frameHeight, setFrameHeight] = useState(0);

  const {
    data,
    viewport,
    zoom,
    isAutoFit,
    viewMode,
    selectBlock,
    moveBlock,
    insertBlockAt,
    setSidebarTab,
  } = useBuilderStore();

  const isPreview = viewMode === "preview";
  const baseWidth = CANONICAL_WIDTHS[viewport];

  // Measure parent container width
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Measure rendered artboard height
  useEffect(() => {
    if (!artboardRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setFrameHeight(entry.contentRect.height);
      }
    });
    observer.observe(artboardRef.current);
    return () => observer.disconnect();
  }, [data.content]);

  // Dynamic Auto-fit scaling computation
  const availableWidth = Math.max(280, containerWidth - 48); // 48px breathing room
  const autoFitRatio = Math.min(1, availableWidth / baseWidth);
  const activeScale = isAutoFit ? autoFitRatio : zoom / 100;
  const effectiveZoom = Math.round(activeScale * 100);

  // Scaled dimensions for physical outer shell
  const visualWidth = Math.round(baseWidth * activeScale);
  const visualHeight = frameHeight > 0 ? Math.round(frameHeight * activeScale) : undefined;
  const counterScale = effectiveZoom > 0 && effectiveZoom < 100 ? 100 / effectiveZoom : 1;

  // Drag and drop sensor configuration
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    // 1. Dropped on bottom canvas dropzone
    if (overId === "drop-after-end") {
      const oldIndex = data.content.findIndex((b) => b.id === activeId);
      if (oldIndex !== -1 && oldIndex !== data.content.length - 1) {
        moveBlock(oldIndex, data.content.length - 1);
      }
      return;
    }

    // 2. Dropped on seam dropzone "drop-before-{targetId}"
    if (overId.startsWith("drop-before-")) {
      const targetId = overId.replace("drop-before-", "");
      const targetIndex = data.content.findIndex((b) => b.id === targetId);
      const activeIndex = data.content.findIndex((b) => b.id === activeId);

      if (activeIndex !== -1 && targetIndex !== -1) {
        const dest = activeIndex < targetIndex ? targetIndex - 1 : targetIndex;
        moveBlock(activeIndex, dest);
      }
      return;
    }

    // 3. Dropped on seam dropzone "drop-after-{targetId}"
    if (overId.startsWith("drop-after-")) {
      const targetId = overId.replace("drop-after-", "");
      const targetIndex = data.content.findIndex((b) => b.id === targetId);
      const activeIndex = data.content.findIndex((b) => b.id === activeId);

      if (activeIndex !== -1 && targetIndex !== -1) {
        const dest = activeIndex < targetIndex ? targetIndex : targetIndex + 1;
        moveBlock(activeIndex, dest);
      }
      return;
    }

    // 4. Standard sortable drop
    if (activeId !== overId) {
      const oldIndex = data.content.findIndex((b) => b.id === activeId);
      const newIndex = data.content.findIndex((b) => b.id === overId);
      if (oldIndex !== -1 && newIndex !== -1) {
        moveBlock(oldIndex, newIndex);
      }
    }
  };

  const blockIds = data.content.map((b) => b.id);

  return (
    <div
      ref={containerRef}
      onClick={() => selectBlock(null)}
      className={cn(
        "relative flex-1 h-full overflow-y-auto overflow-x-hidden p-6 flex flex-col items-center",
        isPreview
          ? "bg-white p-0"
          : "bg-slate-100/80 [background-image:radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]"
      )}
    >
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        {/* Physical Outer Shell with exact computed pixel boundaries */}
        <div
          className={cn(
            "transition-all duration-200 relative",
            !isPreview && "shadow-2xl rounded-2xl border border-slate-300/80 bg-white"
          )}
          style={{
            width: isPreview ? "100%" : visualWidth,
            height: isPreview ? "auto" : visualHeight,
            overflow: isPreview ? "visible" : "hidden",
          }}
        >
          {/* Inner Canonical Artboard transformed by activeScale */}
          <div
            ref={artboardRef}
            style={{
              width: isPreview ? "100%" : baseWidth,
              transform: isPreview ? "none" : `scale(${activeScale})`,
              transformOrigin: "0 0",
            }}
            className="flex flex-col min-h-screen bg-white"
          >
            <SortableContext
              items={blockIds}
              strategy={verticalListSortingStrategy}
            >
              {data.content.length === 0 ? (
                <div className="py-24 px-6 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                    <Plus className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Your Canvas is Empty
                  </h3>
                  <p className="text-sm text-slate-500 max-w-sm mx-auto">
                    Open the block library drawer on the left to start assembling conference sections.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSidebarTab("library")}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
                  >
                    Open Block Library
                  </button>
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
            {!isPreview && (
              <div className="px-6 pb-12">
                <BottomCanvasDropzone
                  counterScale={counterScale}
                  onOpenLibrary={() => setSidebarTab("library")}
                />
              </div>
            )}
          </div>
        </div>
      </DndContext>
    </div>
  );
}
