"use client";

import React, { useState } from "react";
import { closestCenter, DndContext, DragOverlay, PointerSensor, pointerWithin, useSensor, useSensors, type CollisionDetection, type DragEndEvent, type DragStartEvent } from "@dnd-kit/core";
import { Layers } from "lucide-react";
import { getBlockDefinition } from "../../registry";
import { useBuilderStore } from "../../store/builder-store";
import { resolveCanvasDrop } from "../../utils/canvas-drop";
import { COLUMN_SLOT_KEYS, findBlock, type ColumnSlotKey } from "../../utils/block-tree";

const collisionDetection: CollisionDetection = (args) => {
  const pointer = pointerWithin(args);
  if (!args.pointerCoordinates) return closestCenter(args);
  const isNestedTarget = (item: typeof pointer[number]) => ["slot-dropzone", "container-dropzone"].includes(item.data?.droppableContainer?.data.current?.type);
  const area = (item: typeof pointer[number]) => { const rect = item.data?.droppableContainer?.rect.current; return rect ? rect.width * rect.height : Infinity; };
  return [...pointer.filter(isNestedTarget).sort((a, b) => area(a) - area(b)), ...pointer.filter((item) => !isNestedTarget(item))];
};

export function BuilderDndContext({ children }: { children: React.ReactNode }) {
  const [paletteType, setPaletteType] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const activeCanvasBlock = !paletteType && activeId
    ? findBlock(useBuilderStore.getState().data.content, activeId)
    : undefined;
  const activeType = paletteType || activeCanvasBlock?.type || null;
  const definition = activeType ? getBlockDefinition(activeType) : undefined;
  const Icon = definition?.icon || Layers;

  function onDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
    setPaletteType(event.active.data.current?.isPalette ? event.active.data.current.type : null);
  }

  function clearDragState() {
    setPaletteType(null);
    setActiveId(null);
  }

  function onDragEnd({ active, over }: DragEndEvent) {
    clearDragState();
    if (!over) return;
    const { data, insertBlockAt, moveBlock, insertIntoColumn, moveIntoColumn, insertIntoContainer, moveIntoContainer, moveToRoot } = useBuilderStore.getState();
    const isPalette = Boolean(active.data.current?.isPalette);
    const target = over.data.current;
    if (target?.type === "container-dropzone" && typeof target.parentBlockId === "string") {
      if (isPalette && typeof active.data.current?.type === "string") insertIntoContainer(target.parentBlockId, active.data.current.type);
      else if (!isPalette) moveIntoContainer(String(active.id), target.parentBlockId);
      return;
    }
    if (target?.type === "slot-dropzone" && typeof target.parentBlockId === "string" && COLUMN_SLOT_KEYS.includes(target.slotKey as ColumnSlotKey)) {
      const slot = target.slotKey as ColumnSlotKey;
      if (isPalette && typeof active.data.current?.type === "string") insertIntoColumn(target.parentBlockId, slot, active.data.current.type);
      else if (!isPalette) moveIntoColumn(String(active.id), target.parentBlockId, slot);
      return;
    }
    if (!isPalette && !data.content.some((block) => block.id === String(active.id))) {
      const overId = String(over.id);
      const before = overId.startsWith("drop-before-");
      const after = overId.startsWith("drop-after-") && overId !== "drop-after-end";
      const id = before ? overId.slice("drop-before-".length) : after ? overId.slice("drop-after-".length) : overId;
      const targetIndex = overId === "drop-after-end" ? data.content.length : data.content.findIndex((block) => block.id === id);
      if (targetIndex >= 0) moveToRoot(String(active.id), targetIndex + (after ? 1 : 0));
      return;
    }
    const drop = resolveCanvasDrop(data.content.map((block) => block.id), String(active.id), String(over.id), isPalette);
    if (!drop) return;
    if (drop.kind === "insert") {
      const type = active.data.current?.type;
      if (typeof type === "string" && getBlockDefinition(type)) insertBlockAt(drop.index, type);
      return;
    }
    moveBlock(drop.from, drop.to);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      autoScroll={{ enabled: true, threshold: { x: 0.2, y: 0.2 }, acceleration: 14 }}
      onDragStart={onDragStart}
      onDragCancel={clearDragState}
      onDragEnd={onDragEnd}
    >
      {children}
      <DragOverlay dropAnimation={null}>
        {definition && (
          <div className="flex w-60 items-center gap-3 rounded-xl border border-blue-400/80 bg-white p-3 text-xs font-bold text-slate-800 shadow-xl">
            <span className="flex size-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Icon className="size-4" />
            </span>
            <span className="truncate">{definition.label}</span>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
