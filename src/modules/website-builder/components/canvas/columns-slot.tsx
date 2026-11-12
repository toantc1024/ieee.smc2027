"use client";

import React from "react";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { ClipboardPaste, Columns, Copy, CopyPlus, Eye, EyeOff, GripVertical, Plus, Scissors, Trash2 } from "lucide-react";
import { getBlockDefinition } from "../../registry";
import { useBuilderStore } from "../../store/builder-store";
import type { PageBlock } from "../../types";
import { COLUMN_SLOT_KEYS, type ColumnSlotKey } from "../../utils/block-tree";
import { getBlockPresentation, isBlockHidden } from "../../utils/block-presentation";
import { cn } from "@/lib/utils";

interface ColumnsSlotProps {
  title?: string | { en?: string; vi?: string };
  columnCount?: number | string;
  mobileLayout?: "stack" | "grid-2" | "scroll";
  gap?: string;
  verticalAlign?: string;
  containerWidth?: string;
  slot1Blocks?: PageBlock[]; slot2Blocks?: PageBlock[]; slot3Blocks?: PageBlock[]; slot4Blocks?: PageBlock[];
  slot1Items?: PageBlock[]; slot2Items?: PageBlock[]; slot3Items?: PageBlock[]; slot4Items?: PageBlock[];
  builderBlockId?: string;
  builderEditing?: boolean;
}

export function ColumnsSlot(props: ColumnsSlotProps) {
  const { title, columnCount = 2, mobileLayout = "stack", gap = "gap-6", verticalAlign = "items-start", containerWidth = "max-w-7xl", builderBlockId = "", builderEditing = false } = props;
  const updateBlockProps = useBuilderStore((state) => state.updateBlockProps);
  const count = columnCount === "left-wide" || columnCount === "right-wide" ? 2 : columnCount === "center-wide" ? 3 : Math.max(1, Math.min(4, Number(columnCount) || 2));
  const text = typeof title === "string" ? title : title?.en || title?.vi || "";
  const grid = columnCount === "left-wide" || columnCount === "right-wide" || columnCount === "center-wide" ? "md:grid-cols-12" : count === 4 ? "md:grid-cols-2 lg:grid-cols-4" : count === 3 ? "md:grid-cols-3" : count === 2 ? "md:grid-cols-2" : "grid-cols-1";
  const mobile = mobileLayout === "grid-2" ? "grid-cols-2" : mobileLayout === "scroll" ? "grid-flow-col auto-cols-[85%] overflow-x-auto snap-x md:grid-flow-row md:auto-cols-auto" : "grid-cols-1";
  return <section className={cn("relative mx-auto w-full px-4 py-4", containerWidth)}>
    {(text || builderEditing) && <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-border/40 pb-2">
      {text ? <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground sm:text-2xl"><Columns className="size-5 text-primary" />{text}</h2> : <div className="flex items-center gap-2 text-xs font-bold text-slate-700"><Columns className="size-4 text-blue-600" /><span>{count} Columns Layout</span></div>}
      {builderEditing && <div data-builder-controls className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-100 p-0.5" onClick={(event) => event.stopPropagation()}>{[{ label: "1 col", value: 1 }, { label: "50:50", value: 2 }, { label: "33:33:33", value: 3 }, { label: "25:25:25:25", value: 4 }, { label: "70:30", value: "left-wide" }, { label: "30:70", value: "right-wide" }].map((preset) => <button key={String(preset.value)} type="button" aria-pressed={columnCount === preset.value} onClick={() => updateBlockProps(builderBlockId, { columnCount: preset.value })} className={cn("rounded-md px-2 py-0.5 text-[11px] font-bold transition-all", columnCount === preset.value ? "bg-white text-blue-600 shadow-xs" : "text-slate-500 hover:text-slate-900")}>{preset.label}</button>)}</div>}
    </div>}
    <div className={cn("grid", mobile, grid, gap, verticalAlign)}>{COLUMN_SLOT_KEYS.slice(0, count).map((slot, index) => {
      const legacy = slot.replace("Blocks", "Items") as keyof ColumnsSlotProps;
      const blocks = (Array.isArray(props[slot]) ? props[slot] : Array.isArray(props[legacy]) ? props[legacy] : []) as PageBlock[];
      const span = columnCount === "left-wide" ? (index === 0 ? "md:col-span-8" : "md:col-span-4") : columnCount === "right-wide" ? (index === 0 ? "md:col-span-4" : "md:col-span-8") : columnCount === "center-wide" ? (index === 1 ? "md:col-span-6" : "md:col-span-3") : "";
      return builderEditing ? <EditableColumn key={slot} parentId={builderBlockId} slot={slot} index={index} blocks={blocks} span={span} /> : <div key={slot} className={cn("flex min-w-0 flex-col gap-3", span)}>{blocks.map((block) => <PublicNestedBlock key={block.id} block={block} />)}</div>;
    })}</div>
  </section>;
}

function EditableColumn({ parentId, slot, index, blocks, span }: { parentId: string; slot: ColumnSlotKey; index: number; blocks: PageBlock[]; span: string }) {
  const { setNodeRef, isOver } = useDroppable({ id: `slot:${parentId}:${slot}`, data: { type: "slot-dropzone", parentBlockId: parentId, slotKey: slot } });
  const insertIntoColumn = useBuilderStore((state) => state.insertIntoColumn);
  return <div ref={setNodeRef} data-builder-dropzone className={cn("group/column relative flex min-h-20 min-w-0 w-full flex-col font-sans transition-colors", span, isOver ? "rounded-xl bg-blue-50/20 outline-2 outline-blue-600" : "rounded-xl hover:outline-1 hover:outline-dashed hover:outline-blue-400/60")}>
    <div className="absolute -top-3.5 right-1 z-30 flex select-none items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-0.5 opacity-0 shadow-md transition-opacity group-hover/column:opacity-100 focus-within:opacity-100"><span className="px-1 text-[10px] font-bold text-blue-600">Column {index + 1} · {blocks.length}</span><button type="button" aria-label={`Add text to column ${index + 1}`} onClick={(event) => { event.stopPropagation(); insertIntoColumn(parentId, slot, "RichTextBlock"); }} className="rounded p-0.5 text-blue-600 transition-colors hover:bg-blue-50"><Plus className="size-3" /></button></div>
    {blocks.length ? <div className="flex w-full flex-col gap-3">{blocks.map((block) => <EditableNestedBlock key={block.id} block={block} />)}</div> : <button type="button" onClick={(event) => { event.stopPropagation(); insertIntoColumn(parentId, slot, "RichTextBlock"); }} className={cn("flex min-h-[120px] w-full flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed p-4 text-center transition-colors", isOver ? "border-blue-600 bg-blue-50/50 text-blue-600" : "border-slate-200 bg-slate-50/40 text-slate-400 hover:border-blue-500 hover:bg-blue-50/20 hover:text-blue-600")}><Plus className="size-4 text-blue-600/80" /><span className="text-xs font-bold text-slate-700">Column {index + 1}: Click or drag a block here</span></button>}
  </div>;
}

export function PublicNestedBlock({ block }: { block: PageBlock }) {
  if (isBlockHidden(block)) return null;
  const definition = getBlockDefinition(block.type);
  const Renderer = definition?.render;
  const presentation = getBlockPresentation(block);
  return <div className={presentation.className} style={presentation.style}>{Renderer ? <Renderer {...block.props} {...(block.type === "ColumnsSlot" ? { builderBlockId: block.id, builderEditing: false } : {})}>{block.children?.map((child) => <PublicNestedBlock key={child.id} block={child} />)}</Renderer> : <p className="p-4 text-xs text-slate-500">Section unavailable: {block.type}</p>}</div>;
}

export function EditableChildren({ block }: { block: PageBlock }) {
  const { setNodeRef, isOver } = useDroppable({ id: `container:${block.id}`, data: { type: "container-dropzone", parentBlockId: block.id } });
  const insert = useBuilderStore((state) => state.insertIntoContainer);
  return <div ref={setNodeRef} data-builder-dropzone className={cn("min-h-20 rounded-xl border border-dashed p-2", isOver ? "border-blue-600 bg-blue-50" : "border-slate-300")}><div className="mb-2 flex items-center justify-between text-[10px] font-bold uppercase text-slate-500"><span>Container contents</span><button type="button" aria-label="Add text to container" onClick={(event) => { event.stopPropagation(); insert(block.id, "RichTextBlock"); }} className="rounded p-1 text-blue-600 hover:bg-blue-100"><Plus className="size-4" /></button></div>{block.children?.length ? block.children.map((child) => <EditableNestedBlock key={child.id} block={child} />) : <p className="p-3 text-center text-xs text-slate-400">Drag a block here, or use + to add text</p>}</div>;
}

export function EditableNestedBlock({ block }: { block: PageBlock }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: block.id, data: { type: "nested-block" } });
  const { selectedBlockId, selectBlock, copyBlock, cutBlock, duplicateBlock, toggleBlockHidden, removeBlock, pasteAfterBlock, clipboardBlock } = useBuilderStore();
  const selected = selectedBlockId === block.id;
  const hidden = isBlockHidden(block);
  const definition = getBlockDefinition(block.type);
  const Renderer = definition?.render;
  const presentation = getBlockPresentation(block);
  return <div ref={setNodeRef} data-builder-nested={block.id} onClick={(event) => { event.stopPropagation(); selectBlock(block.id); }} className={cn("group relative min-w-0 cursor-pointer rounded-xl transition-colors", hidden && "border border-dashed border-amber-400/80 opacity-50", selected ? hidden ? "ring-2 ring-amber-500 ring-offset-2 ring-offset-background shadow-lg" : "ring-2 ring-blue-600 ring-offset-2 ring-offset-background shadow-lg" : "hover:ring-1 hover:ring-blue-500/70", isDragging && "opacity-50")}>
    {selected && <div className="absolute -top-3.5 right-2 z-40 flex items-center gap-1 rounded-lg border border-blue-400/80 bg-blue-600 px-2 py-0.5 text-xs text-white shadow-lg shadow-blue-600/30" onClick={(event) => event.stopPropagation()}>
      <span className="px-1 text-[10px] font-bold text-white">{definition?.label || block.type}</span>
      <button type="button" aria-label={`Drag ${definition?.label || block.type}`} title="Drag section" {...attributes} {...listeners} className="cursor-grab rounded p-1 text-blue-100 transition-colors hover:bg-blue-700 hover:text-white"><GripVertical className="size-3" /></button>
      <button type="button" title="Copy" aria-label="Copy nested section" onClick={() => copyBlock(block.id)} className="rounded p-1 text-white transition-colors hover:bg-blue-700"><Copy className="size-3" /></button>
      <button type="button" title="Cut" aria-label="Cut nested section" onClick={() => cutBlock(block.id)} className="rounded p-1 text-white transition-colors hover:bg-blue-700"><Scissors className="size-3" /></button>
      {clipboardBlock && <button type="button" title="Paste after section" aria-label="Paste after nested section" onClick={() => pasteAfterBlock(block.id)} className="rounded p-1 text-white transition-colors hover:bg-blue-700"><ClipboardPaste className="size-3" /></button>}
      <button type="button" title="Duplicate" aria-label="Duplicate nested section" onClick={() => duplicateBlock(block.id)} className="rounded p-1 text-white transition-colors hover:bg-blue-700"><CopyPlus className="size-3" /></button>
      <button type="button" title={hidden ? "Show" : "Hide"} aria-label={hidden ? "Show nested section" : "Hide nested section"} onClick={() => toggleBlockHidden(block.id)} className={cn("rounded p-1 transition-colors", hidden ? "bg-amber-500 text-white hover:bg-amber-600" : "text-white hover:bg-blue-700")}>{hidden ? <EyeOff className="size-3" /> : <Eye className="size-3" />}</button>
      <button type="button" title="Delete" aria-label="Delete nested section" onClick={() => removeBlock(block.id)} className="rounded p-1 text-white transition-colors hover:bg-red-600"><Trash2 className="size-3" /></button>
    </div>}
    <div className={cn(presentation.className, block.type !== "ColumnsSlot" && block.type !== "Container" && "pointer-events-none")} style={presentation.style}>{Renderer ? <Renderer {...block.props} {...(block.type === "ColumnsSlot" ? { builderBlockId: block.id, builderEditing: true } : {})}>{block.type === "Container" ? <EditableChildren block={block} /> : block.children?.map((child) => <EditableNestedBlock key={child.id} block={child} />)}</Renderer> : <p className="p-4 text-xs text-slate-500">Section unavailable: {block.type}</p>}</div>
  </div>;
}
