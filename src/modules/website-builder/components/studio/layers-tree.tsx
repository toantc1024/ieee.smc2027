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
  if (content.length === 0) return <div className="flex h-full flex-col items-center justify-center gap-2 bg-white p-8 text-center text-sm text-slate-400"><Layers className="mb-1 size-8 text-slate-400" /><p className="font-bold text-slate-800">No sections yet</p><p>Add a section from the block library.</p></div>;

  const pasteAfter = (id: string | null) => {
    const index = content.findIndex((block) => block.id === id);
    if (index < 0 && id) pasteAfterBlock(id);
    else pasteBlock(index < 0 ? content.length : index + 1);
  };
  return <div className="flex h-full select-none flex-col overflow-hidden bg-white text-slate-900">
    <div className="flex items-center justify-between border-b border-slate-200 bg-white p-3 text-xs text-slate-500">
      <span className="font-bold text-sm text-slate-900">Section structure</span>
      <div className="flex items-center gap-1.5">{clipboardBlock && <button type="button" onClick={() => pasteAfter(selectedBlockId)} className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-bold text-slate-800 hover:border-slate-400 hover:bg-slate-50 cursor-pointer"><ClipboardPaste className="size-3.5" />Paste</button>}<span className="rounded-md border border-slate-300 bg-white px-2 py-0.5 text-xs font-bold text-slate-700">{content.length} sections</span></div>
    </div>
    <div className="flex-1 space-y-2 overflow-y-auto p-3">{content.map((block, index) => {
      const selected = selectedBlockId === block.id;
      const hidden = Boolean(block.hidden);
      const label = getBlockDefinition(block.type)?.label || block.type;
      return <div key={block.id} className="space-y-1"><div className={cn("flex items-center justify-between gap-2 rounded-xl border p-2.5 transition-all bg-white", selected ? hidden ? "border-amber-600 bg-white ring-1 ring-amber-600 shadow-xs" : "border-slate-900 bg-white ring-1 ring-slate-900/10 shadow-xs" : hidden ? "border-amber-300 bg-amber-50/20" : "border-slate-300 hover:border-slate-400 hover:shadow-2xs")}>
        <button type="button" onClick={() => selectBlock(block.id)} className="flex min-w-0 flex-1 items-center gap-2.5 text-left cursor-pointer"><span className="w-5 shrink-0 text-center font-bold text-xs text-slate-400">{index + 1}</span><span className="min-w-0 flex-1"><span className={cn("block truncate text-sm font-bold", selected ? "text-slate-900" : "text-slate-800", hidden && "line-through opacity-70")}>{label}</span><span className="block truncate text-xs text-slate-400">#{block.id}</span></span>{hidden && <span className="rounded border border-amber-600 bg-amber-600 px-1.5 py-0.5 text-xs font-bold text-white">Hidden</span>}</button>
        <div className="flex shrink-0 items-center gap-0.5">
          <button type="button" aria-label={`Move ${label} up`} title="Move up" disabled={index === 0} onClick={() => moveBlockUp(block.id)} className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-20 cursor-pointer"><ChevronUp className="size-3.5" /></button>
          <button type="button" aria-label={`Move ${label} down`} title="Move down" disabled={index === content.length - 1} onClick={() => moveBlockDown(block.id)} className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-20 cursor-pointer"><ChevronDown className="size-3.5" /></button>
          <button type="button" aria-label={`Copy ${label}`} title="Copy section" onClick={() => copyBlock(block.id)} className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"><Copy className="size-3.5" /></button>
          <button type="button" aria-label={`Cut ${label}`} title="Cut section" onClick={() => cutBlock(block.id)} className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"><Scissors className="size-3.5" /></button>
          <button type="button" aria-label={`Paste after ${label}`} title="Paste after section" disabled={!clipboardBlock} onClick={() => pasteAfter(block.id)} className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-20 cursor-pointer"><ClipboardPaste className="size-3.5" /></button>
          <button type="button" aria-label={`${hidden ? "Show" : "Hide"} ${label}`} title={hidden ? "Show section" : "Hide section"} onClick={() => toggleBlockHidden(block.id)} className={cn("rounded p-1 cursor-pointer", hidden ? "bg-amber-600 text-white" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100")}>{hidden ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}</button>
          <button type="button" aria-label={`Delete ${label}`} title="Delete section" onClick={() => removeBlock(block.id)} className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 cursor-pointer"><Trash2 className="size-3.5" /></button>
        </div>
      </div><NestedLayers block={block} /></div>;
    })}</div>
  </div>;
}

function NestedLayers({ block }: { block: PageBlock }) {
  const { selectedBlockId, selectBlock, copyBlock, cutBlock, pasteAfterBlock, clipboardBlock, toggleBlockHidden, removeBlock, moveBlockUp, moveBlockDown } = useBuilderStore();
  const groups = [...COLUMN_SLOT_KEYS.map((slot, index) => ({ index, label: `Column ${index + 1}`, blocks: getColumnBlocks(block, slot) })), { index: 4, label: "Contents", blocks: block.children || [] }].filter((group) => group.blocks.length > 0);
  if (!groups.length) return null;
  return <div className="ml-4 space-y-1.5 border-l-2 border-slate-200 py-1 pl-3">{groups.map((group) => <div key={group.index} className="space-y-1"><p className="px-1 pt-1 text-xs font-bold uppercase text-slate-500">{group.label}</p>{group.blocks.map((child, index) => {
    const label = getBlockDefinition(child.type)?.label || child.type;
    const selected = selectedBlockId === child.id;
    const hidden = typeof child.hidden === "boolean" ? child.hidden : Boolean(child.props?.hidden);
    return <div key={child.id} className="space-y-1"><div className={cn("flex items-center gap-1 rounded-lg border p-2 bg-white", selected ? "border-slate-900 ring-1 ring-slate-900/10 shadow-xs" : "border-slate-300 hover:border-slate-400", hidden && "border-amber-300 bg-amber-50/20")}>
      <button type="button" onClick={() => selectBlock(child.id)} className="min-w-0 flex-1 truncate text-left text-xs font-bold text-slate-800 cursor-pointer">{label}{hidden ? " · hidden" : ""}</button>
      <button type="button" aria-label={`Move ${label} up`} disabled={index === 0} onClick={() => moveBlockUp(child.id)} className="rounded p-1 text-slate-500 hover:text-slate-900 disabled:opacity-20 cursor-pointer"><ChevronUp className="size-3" /></button>
      <button type="button" aria-label={`Move ${label} down`} disabled={index === group.blocks.length - 1} onClick={() => moveBlockDown(child.id)} className="rounded p-1 text-slate-500 hover:text-slate-900 disabled:opacity-20 cursor-pointer"><ChevronDown className="size-3" /></button>
      <button type="button" aria-label={`Copy ${label}`} onClick={() => copyBlock(child.id)} className="rounded p-1 text-slate-500 hover:text-slate-900 cursor-pointer"><Copy className="size-3" /></button>
      <button type="button" aria-label={`Cut ${label}`} onClick={() => cutBlock(child.id)} className="rounded p-1 text-slate-500 hover:text-slate-900 cursor-pointer"><Scissors className="size-3" /></button>
      <button type="button" aria-label={`Paste after ${label}`} disabled={!clipboardBlock} onClick={() => pasteAfterBlock(child.id)} className="rounded p-1 text-slate-500 hover:text-slate-900 disabled:opacity-20 cursor-pointer"><ClipboardPaste className="size-3" /></button>
      <button type="button" aria-label={`${hidden ? "Show" : "Hide"} ${label}`} onClick={() => toggleBlockHidden(child.id)} className="rounded p-1 text-slate-500 hover:text-slate-900 cursor-pointer">{hidden ? <EyeOff className="size-3" /> : <Eye className="size-3" />}</button>
      <button type="button" aria-label={`Delete ${label}`} onClick={() => removeBlock(child.id)} className="rounded p-1 text-slate-400 hover:text-rose-600 cursor-pointer"><Trash2 className="size-3" /></button>
    </div><NestedLayers block={child} /></div>;
  })}</div>)}</div>;
}
