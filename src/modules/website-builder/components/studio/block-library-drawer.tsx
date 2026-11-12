"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Plus, Search, X } from "lucide-react";
import { useDraggable } from "@dnd-kit/core";
import type { ComponentDefinition } from "../../types";
import { ScalableWireframe } from "./wireframes";
import { CONFERENCE_BLOCK_DEFINITIONS } from "../../registry";
import { useBuilderStore } from "../../store/builder-store";
import { cn } from "@/lib/utils";

const CATEGORY_LABELS: Record<string, string> = {
  basic: "Modular Elements",
  hero: "Hero & Banners",
  conference: "Conference Overview",
  academic: "Call for Papers & Tracks",
  program: "Program & Schedule",
  organization: "Committees",
  registration: "Registration & Fees",
  venue: "Venue & Travel",
  hospitality: "Visa & Accommodation",
  partners: "Sponsors & Partners",
  contact: "Contact & Notices",
  support: "FAQ & Support",
  media: "Video & Media",
  history: "Past Conferences",
  layout: "Header & Footer",
};

export function BlockLibraryDrawer() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [preview, setPreview] = useState<{
    item: ComponentDefinition;
    top: number;
    left: number;
  } | null>(null);
  const { addBlock, selectedBlockId, insertBlockAfter } = useBuilderStore();

  const blockList = Object.values(CONFERENCE_BLOCK_DEFINITIONS);
  const allCategories = Array.from(new Set(blockList.map((b) => b.category)));

  const filtered = blockList.filter((b) => {
    if (activeCategory !== "all" && b.category !== activeCategory) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      b.label.toLowerCase().includes(q) ||
      b.type.toLowerCase().includes(q) ||
      b.description.toLowerCase().includes(q) ||
      (CATEGORY_LABELS[b.category] || b.category).toLowerCase().includes(q)
    );
  });

  const categories = Array.from(new Set(filtered.map((b) => b.category)));

  const toggleCategory = (cat: string) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const handleInsertBlock = (type: string) => {
    if (selectedBlockId) {
      insertBlockAfter(selectedBlockId, type);
      return;
    }
    addBlock(type);
  };

  return (
    <div className="flex flex-col h-full bg-white select-none">
      {/* Search + Category Quick Filter */}
      <div className="p-3 border-b border-slate-100 space-y-2.5 shrink-0">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search blocks..."
            className="w-full h-8 pl-8 pr-7 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/15 text-slate-900"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Horizontal Category Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 [scrollbar-width:none]">
          <button
            type="button"
            onClick={() => setActiveCategory("all")}
            className={cn(
              "px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer shrink-0",
              activeCategory === "all"
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900"
            )}
          >
            All
          </button>
          {allCategories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(activeCategory === cat ? "all" : cat)}
              className={cn(
                "px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer shrink-0",
                activeCategory === cat
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900"
              )}
            >
              {CATEGORY_LABELS[cat] || cat}
            </button>
          ))}
        </div>
      </div>

      {/* Blocks List */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3">
        {categories.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No matching blocks found.
          </div>
        ) : (
          categories.map((cat) => {
            const items = filtered.filter((b) => b.category === cat);
            const isCollapsed = !search.trim() && collapsedCategories.has(cat);
            return (
              <div key={cat} className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className="w-full flex items-center justify-between px-1 py-1 rounded-md hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                    {CATEGORY_LABELS[cat] || cat}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="rounded-full bg-slate-100 px-1.5 py-0.2 text-[10px] font-bold text-slate-500">
                      {items.length}
                    </span>
                    <ChevronDown
                      className={cn(
                        "w-3 h-3 text-slate-400 transition-transform",
                        isCollapsed && "-rotate-90"
                      )}
                    />
                  </div>
                </button>

                {!isCollapsed && (
                  <div className="space-y-1.5">
                    {items.map((item) => (
                      <PaletteItem
                        key={item.type}
                        item={item}
                        onAdd={handleInsertBlock}
                        onPreview={setPreview}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {preview &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="pointer-events-none fixed z-[100] w-[320px] rounded-2xl border-2 border-blue-500/30 bg-white p-4 text-left shadow-2xl shadow-blue-900/15"
            style={{ top: preview.top, left: preview.left }}
          >
            <div className="mb-2.5 border-b border-slate-100 pb-2 text-xs font-bold text-slate-800">
              {preview.item.label}
            </div>
            <div className="mb-3 flex aspect-[16/10] items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-2.5">
              <ScalableWireframe
                type={preview.item.type}
                label={preview.item.label}
                category={preview.item.category}
              />
            </div>
            <p className="text-xs leading-relaxed text-slate-600">
              {preview.item.description}
            </p>
            <p className="mt-2 border-t border-slate-100 pt-2 text-[10px] font-semibold text-blue-600">
              Drag onto the canvas or click + to insert
            </p>
          </div>,
          document.body
        )}
    </div>
  );
}

function PaletteItem({
  item,
  onAdd,
  onPreview,
}: {
  item: ComponentDefinition;
  onAdd: (type: string) => void;
  onPreview: (
    value: { item: ComponentDefinition; top: number; left: number } | null
  ) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette:${item.type}`,
    data: { isPalette: true, type: item.type },
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onMouseEnter={(event) => {
        if (!isDragging) {
          const rect = event.currentTarget.getBoundingClientRect();
          onPreview({
            item,
            top: Math.max(16, Math.min(rect.top, window.innerHeight - 356)),
            left: Math.min(rect.right + 12, window.innerWidth - 340),
          });
        }
      }}
      onMouseLeave={() => onPreview(null)}
      onPointerDown={(event) => {
        onPreview(null);
        listeners?.onPointerDown?.(event);
      }}
      className={cn(
        "group flex min-h-[82px] touch-none select-none items-center gap-2.5 rounded-xl border bg-white p-2.5 transition-colors hover:border-blue-500 hover:bg-blue-50/20 cursor-grab active:cursor-grabbing",
        isDragging ? "border-dashed border-blue-600 opacity-40" : "border-slate-200"
      )}
    >
      <div className="flex h-15 w-[84px] shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-1 group-hover:border-blue-300">
        <ScalableWireframe
          type={item.type}
          label={item.label}
          category={item.category}
        />
      </div>
      <div className="min-w-0 flex-1">
        <span className="block truncate text-xs font-bold text-slate-800 group-hover:text-blue-600">
          {item.label}
        </span>
        <p className="mt-0.5 line-clamp-2 text-[10px] leading-snug text-slate-500">
          {item.description}
        </p>
      </div>
      <button
        type="button"
        aria-label={`Add ${item.label}`}
        title="Add to page"
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.stopPropagation();
          onAdd(item.type);
        }}
        className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}
