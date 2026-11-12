"use client";

import React from "react";
import { Layers, ChevronUp, ChevronDown, Copy, ClipboardPaste, Scissors, Trash2, Eye, EyeOff } from "lucide-react";
import { useBuilderStore } from "../../store/builder-store";
import { getBlockDefinition } from "../../registry";
import { cn } from "@/lib/utils";
import { COLUMN_SLOT_KEYS, getColumnBlocks } from "../../utils/block-tree";
import type { PageBlock } from "../../types";

/** The HCMUTE layers panel, connected to the conference builder's store. */
export function LayersTree() {
  const { data, selectedBlockId, selectBlock, moveBlockUp, moveBlockDown, removeBlock, toggleBlockHidden, copyBlock, cutBlock, pasteBlock, pasteAfterBlock, clipboardBlock } = useBuilderStore();
  const content = data.content;
  if (content.length === 0) return <div className="flex h-full flex-col items-center justify-center gap-2 bg-white p-8 text-center text-xs text-slate-400"><Layers className="mb-1 size-8 text-slate-300" /><p className="font-semibold text-slate-700">No sections yet</p><p>Add a section from the block library.</p></div>;

  const pasteAfter = (id: string | null) => {
    const index = content.findIndex((block) => block.id === id);
    if (index < 0 && id) pasteAfterBlock(id);
    else pasteBlock(index < 0 ? content.length : index + 1);
  };
  return <div className="flex h-full select-none flex-col overflow-hidden bg-white text-slate-900">
    <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/70 p-3 text-xs text-slate-500">
      <span className="font-bold text-slate-700">Section structure</span>
      <div className="flex items-center gap-1.5">{clipboardBlock && <button type="button" onClick={() => pasteAfter(selectedBlockId)} className="inline-flex items-center gap-1 rounded border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700 hover:bg-blue-100"><ClipboardPaste className="size-3" />Paste</button>}<span className="rounded border border-slate-200 bg-white px-2 py-0.5 font-mono text-[11px]">{content.length} sections</span></div>
    </div>
    <div className="flex-1 space-y-1.5 overflow-y-auto p-3">{content.map((block, index) => {
      const selected = selectedBlockId === block.id;
      const hidden = Boolean(block.hidden);
      const label = getBlockDefinition(block.type)?.label || block.type;
      return <div key={block.id} className="space-y-1"><div className={cn("flex items-center justify-between gap-2 rounded-xl border p-2.5 transition-all", selected ? hidden ? "border-amber-500 bg-amber-50/70 ring-1 ring-amber-500" : "border-blue-500 bg-blue-50/80 ring-1 ring-blue-500" : hidden ? "border-amber-200 bg-amber-50/30" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60")}>
        <button type="button" onClick={() => selectBlock(block.id)} className="flex min-w-0 flex-1 items-center gap-2 text-left"><span className="w-4 shrink-0 text-center font-mono text-[11px] text-slate-400">{index + 1}</span><span className="min-w-0 flex-1"><span className={cn("block truncate text-xs font-bold", selected ? "text-blue-700" : "text-slate-700", hidden && "line-through opacity-75")}>{label}</span><span className="block truncate font-mono text-[10px] text-slate-400">#{block.id}</span></span>{hidden && <span className="rounded border border-amber-200 bg-amber-100 px-1 text-[9px] font-bold text-amber-700">Hidden</span>}</button>
        <div className="flex shrink-0 items-center gap-0.5">
          <button type="button" aria-label={`Move ${label} up`} title="Move up" disabled={index === 0} onClick={() => moveBlockUp(block.id)} className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-20"><ChevronUp className="size-3.5" /></button>
          <button type="button" aria-label={`Move ${label} down`} title="Move down" disabled={index === content.length - 1} onClick={() => moveBlockDown(block.id)} className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-20"><ChevronDown className="size-3.5" /></button>
          <button type="button" aria-label={`Copy ${label}`} title="Copy section" onClick={() => copyBlock(block.id)} className="rounded p-1 text-slate-400 hover:bg-blue-50 hover:text-blue-600"><Copy className="size-3.5" /></button>
          <button type="button" aria-label={`Cut ${label}`} title="Cut section" onClick={() => cutBlock(block.id)} className="rounded p-1 text-slate-400 hover:bg-blue-50 hover:text-blue-600"><Scissors className="size-3.5" /></button>
          <button type="button" aria-label={`Paste after ${label}`} title="Paste after section" disabled={!clipboardBlock} onClick={() => pasteAfter(block.id)} className="rounded p-1 text-slate-400 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-20"><ClipboardPaste className="size-3.5" /></button>
          <button type="button" aria-label={`${hidden ? "Show" : "Hide"} ${label}`} title={hidden ? "Show section" : "Hide section"} onClick={() => toggleBlockHidden(block.id)} className={cn("rounded p-1 hover:bg-slate-100", hidden ? "bg-amber-100/70 text-amber-600" : "text-slate-400 hover:text-slate-700")}>{hidden ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}</button>
          <button type="button" aria-label={`Delete ${label}`} title="Delete section" onClick={() => removeBlock(block.id)} className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="size-3.5" /></button>
        </div>
      </div><NestedLayers block={block} /></div>;
    })}</div>
  </div>;
}

function NestedLayers({ block }: { block: PageBlock }) {
  const { selectedBlockId, selectBlock, copyBlock, cutBlock, pasteAfterBlock, clipboardBlock, toggleBlockHidden, removeBlock, moveBlockUp, moveBlockDown } = useBuilderStore();
  const groups = [...COLUMN_SLOT_KEYS.map((slot, index) => ({ index, label: `Column ${index + 1}`, blocks: getColumnBlocks(block, slot) })), { index: 4, label: "Contents", blocks: block.children || [] }].filter((group) => group.blocks.length > 0);
  if (!groups.length) return null;
  return <div className="ml-4 space-y-1 border-l-2 border-slate-200 py-0.5 pl-3">{groups.map((group) => <div key={group.index} className="space-y-1"><p className="px-1 pt-1 text-[10px] font-bold uppercase text-slate-400">{group.label}</p>{group.blocks.map((child, index) => {
    const label = getBlockDefinition(child.type)?.label || child.type;
    const selected = selectedBlockId === child.id;
    const hidden = typeof child.hidden === "boolean" ? child.hidden : Boolean(child.props?.hidden);
    return <div key={child.id} className="space-y-1"><div className={cn("flex items-center gap-1 rounded-lg border p-2", selected ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500" : "border-slate-200 bg-slate-50/50", hidden && "border-amber-200 bg-amber-50/40")}>
      <button type="button" onClick={() => selectBlock(child.id)} className="min-w-0 flex-1 truncate text-left text-[11px] font-bold text-slate-700">{label}{hidden ? " · hidden" : ""}</button>
      <button type="button" aria-label={`Move ${label} up`} disabled={index === 0} onClick={() => moveBlockUp(child.id)} className="rounded p-1 text-slate-400 hover:text-blue-600 disabled:opacity-20"><ChevronUp className="size-3" /></button>
      <button type="button" aria-label={`Move ${label} down`} disabled={index === group.blocks.length - 1} onClick={() => moveBlockDown(child.id)} className="rounded p-1 text-slate-400 hover:text-blue-600 disabled:opacity-20"><ChevronDown className="size-3" /></button>
      <button type="button" aria-label={`Copy ${label}`} onClick={() => copyBlock(child.id)} className="rounded p-1 text-slate-400 hover:text-blue-600"><Copy className="size-3" /></button>
      <button type="button" aria-label={`Cut ${label}`} onClick={() => cutBlock(child.id)} className="rounded p-1 text-slate-400 hover:text-blue-600"><Scissors className="size-3" /></button>
      <button type="button" aria-label={`Paste after ${label}`} disabled={!clipboardBlock} onClick={() => pasteAfterBlock(child.id)} className="rounded p-1 text-slate-400 hover:text-blue-600 disabled:opacity-20"><ClipboardPaste className="size-3" /></button>
      <button type="button" aria-label={`${hidden ? "Show" : "Hide"} ${label}`} onClick={() => toggleBlockHidden(child.id)} className="rounded p-1 text-slate-400 hover:text-blue-600">{hidden ? <EyeOff className="size-3" /> : <Eye className="size-3" />}</button>
      <button type="button" aria-label={`Delete ${label}`} onClick={() => removeBlock(child.id)} className="rounded p-1 text-slate-400 hover:text-red-600"><Trash2 className="size-3" /></button>
    </div><NestedLayers block={child} /></div>;
  })}</div>)}</div>;
}
