"use client";

import React, { useMemo, useState } from "react";
import type { NavLinkItem } from "@/lib/header-config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  LayoutGrid,
  ListTree,
  Columns3,
  Image as ImageIcon,
  PlusCircle,
  PanelTop,
  GripVertical,
  Search,
  Trash2,
  Plus,
  ChevronRight,
  Link2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type PaletteDragBlockType =
  | "category-links"
  | "promo-card"
  | "trigger"
  | "general";

interface BuilderPaletteProps {
  navLinks: NavLinkItem[];
  activeTriggerId: string;
  onSelectTrigger: (triggerId: string) => void;
  onAddTrigger: () => void;
  onRenameTrigger: (triggerId: string, name: string) => void;
  onDeleteTrigger: (triggerId: string) => void;
  onReorderTriggers: (fromIndex: number, toIndex: number) => void;
  onAddColumnBlock: (type: "category-links" | "promo-card") => void;
  onSelectGeneral: () => void;
}

interface BlockCardDef {
  id: PaletteDragBlockType;
  title: string;
  description: string;
  group: "columns" | "navigation";
  icon: React.ComponentType<{ className?: string }>;
}

const BLOCK_CARDS: BlockCardDef[] = [
  {
    id: "category-links",
    title: "Category Links Column",
    description: "Structured column of icon links, descriptions and badges.",
    group: "columns",
    icon: Columns3,
  },
  {
    id: "promo-card",
    title: "Featured Promo Card",
    description: "Highlight banner column with image, badge and CTA link.",
    group: "columns",
    icon: ImageIcon,
  },
  {
    id: "trigger",
    title: "New Menu Trigger",
    description: "Append a new top-level navigation item to the header bar.",
    group: "navigation",
    icon: PlusCircle,
  },
  {
    id: "general",
    title: "Top Bar & Brand Settings",
    description: "Configure layout variant, logos, hotline, search and CTA.",
    group: "navigation",
    icon: PanelTop,
  },
];

export function BuilderPalette({
  navLinks,
  activeTriggerId,
  onSelectTrigger,
  onAddTrigger,
  onRenameTrigger,
  onDeleteTrigger,
  onReorderTriggers,
  onAddColumnBlock,
  onSelectGeneral,
}: BuilderPaletteProps) {
  const [tab, setTab] = useState<"blocks" | "triggers">("blocks");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const filteredBlocks = useMemo(() => {
    if (!search.trim()) return BLOCK_CARDS;
    const q = search.toLowerCase();
    return BLOCK_CARDS.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q)
    );
  }, [search]);

  const activeTrigger = navLinks.find((n) => n.id === activeTriggerId);
  const isMegaActive = activeTrigger?.type === "mega";

  const handleBlockClick = (id: PaletteDragBlockType) => {
    if (id === "category-links" || id === "promo-card") {
      onAddColumnBlock(id);
    } else if (id === "trigger") {
      onAddTrigger();
    } else if (id === "general") {
      onSelectGeneral();
    }
  };

  const handleBlockDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    id: PaletteDragBlockType
  ) => {
    e.dataTransfer.setData("application/x-builder-block", id);
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <aside className="w-[272px] shrink-0 bg-white border-r border-slate-200 flex flex-col h-full select-none">
      {/* Studio Tab Switcher */}
      <div className="p-2.5 border-b border-slate-100">
        <div className="grid grid-cols-2 gap-1 p-1 rounded-md bg-slate-100 border border-slate-200/70">
          <button
            type="button"
            onClick={() => setTab("blocks")}
            className={cn(
              "flex items-center justify-center gap-1.5 py-1.5 rounded text-xs font-semibold transition-all cursor-pointer",
              tab === "blocks"
                ? "bg-white text-[#004776] shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Blocks</span>
          </button>
          <button
            type="button"
            onClick={() => setTab("triggers")}
            className={cn(
              "flex items-center justify-center gap-1.5 py-1.5 rounded text-xs font-semibold transition-all cursor-pointer",
              tab === "triggers"
                ? "bg-white text-[#004776] shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <ListTree className="w-3.5 h-3.5" />
            <span>Menu</span>
            <span className="ml-0.5 text-[10px] px-1.5 py-0.2 rounded-full bg-blue-50 text-[#115eff] font-bold">
              {navLinks.length}
            </span>
          </button>
        </div>
      </div>

      {tab === "blocks" ? (
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search blocks..."
              className="h-8 pl-8 text-xs bg-slate-50 border-slate-200"
            />
          </div>

          {/* Group 1: Mega Menu Columns */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Mega Menu Columns
              </span>
              {!isMegaActive && (
                <span className="text-[10px] text-amber-600 font-medium">
                  Auto-converts
                </span>
              )}
            </div>

            <div className="space-y-2">
              {filteredBlocks
                .filter((b) => b.group === "columns")
                .map((block) => {
                  const Icon = block.icon;
                  return (
                    <div
                      key={block.id}
                      draggable
                      onDragStart={(e) => handleBlockDragStart(e, block.id)}
                      onClick={() => handleBlockClick(block.id)}
                      className="group p-2.5 rounded-lg border border-slate-200 bg-white hover:border-[#115eff] hover:bg-blue-50/30 transition-all cursor-grab active:cursor-grabbing shadow-2xs"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-md bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 group-hover:bg-[#115eff] group-hover:border-[#115eff] transition-colors">
                          <Icon className="w-4 h-4 text-[#115eff] group-hover:text-white transition-colors" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-bold text-slate-800 group-hover:text-[#004776] truncate">
                              {block.title}
                            </span>
                            <Plus className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#115eff] shrink-0" />
                          </div>
                          <p className="text-[11px] text-slate-500 leading-snug mt-0.5 line-clamp-2">
                            {block.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Group 2: Navigation & Utility */}
          <div className="space-y-2">
            <div className="px-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Header & Navigation
              </span>
            </div>

            <div className="space-y-2">
              {filteredBlocks
                .filter((b) => b.group === "navigation")
                .map((block) => {
                  const Icon = block.icon;
                  return (
                    <div
                      key={block.id}
                      draggable
                      onDragStart={(e) => handleBlockDragStart(e, block.id)}
                      onClick={() => handleBlockClick(block.id)}
                      className="group p-2.5 rounded-lg border border-slate-200 bg-white hover:border-[#115eff] hover:bg-blue-50/30 transition-all cursor-pointer shadow-2xs"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 group-hover:bg-[#004776] group-hover:border-[#004776] transition-colors">
                          <Icon className="w-4 h-4 text-[#004776] group-hover:text-white transition-colors" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-bold text-slate-800 group-hover:text-[#004776] truncate">
                              {block.title}
                            </span>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#115eff] shrink-0" />
                          </div>
                          <p className="text-[11px] text-slate-500 leading-snug mt-0.5 line-clamp-2">
                            {block.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          <div className="p-2.5 rounded-md bg-slate-50 border border-dashed border-slate-200 text-[11px] text-slate-500 leading-relaxed">
            Drag a column block onto the mega menu canvas or click it to append immediately.
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
            {navLinks.map((item, index) => {
              const isSelected = item.id === activeTriggerId;
              const isEditing = editingId === item.id;
              const colCount = item.columns?.length || 0;

              return (
                <div
                  key={item.id}
                  draggable={!isEditing}
                  onDragStart={(e) => {
                    setDragIndex(index);
                    e.dataTransfer.setData("application/x-trigger-index", String(index));
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (dragIndex !== null && dragIndex !== index) {
                      setDragOverIndex(index);
                    }
                  }}
                  onDragLeave={() => {
                    if (dragOverIndex === index) setDragOverIndex(null);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (dragIndex !== null && dragIndex !== index) {
                      onReorderTriggers(dragIndex, index);
                    }
                    setDragIndex(null);
                    setDragOverIndex(null);
                  }}
                  onDragEnd={() => {
                    setDragIndex(null);
                    setDragOverIndex(null);
                  }}
                  onClick={() => onSelectTrigger(item.id)}
                  className={cn(
                    "group flex items-center gap-2 px-2 py-2 rounded-md border transition-all cursor-pointer",
                    isSelected
                      ? "bg-blue-50/80 border-[#115eff] shadow-2xs"
                      : "bg-white border-slate-200 hover:border-blue-200 hover:bg-slate-50",
                    dragOverIndex === index && "border-t-2 border-t-[#115eff]"
                  )}
                >
                  <GripVertical className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 cursor-grab shrink-0" />

                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <Input
                        autoFocus
                        value={item.name}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => onRenameTrigger(item.id, e.target.value)}
                        onBlur={() => setEditingId(null)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === "Escape") {
                            setEditingId(null);
                          }
                        }}
                        className="h-6 px-1.5 text-xs font-semibold bg-white"
                      />
                    ) : (
                      <div
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          setEditingId(item.id);
                        }}
                        className="flex items-center justify-between gap-1.5"
                      >
                        <span
                          className={cn(
                            "text-xs font-semibold truncate",
                            isSelected ? "text-[#004776]" : "text-slate-700"
                          )}
                        >
                          {item.name || "Untitled"}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-400">
                      {item.type === "mega" ? (
                        <span className="inline-flex items-center gap-1 text-[#115eff] font-semibold">
                          Mega Menu · {colCount} {colCount === 1 ? "col" : "cols"}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 truncate font-mono">
                          <Link2 className="w-2.5 h-2.5 shrink-0" />
                          <span className="truncate">{item.href || "/"}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {navLinks.length > 1 && (
                    <button
                      type="button"
                      title="Delete trigger"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteTrigger(item.id);
                      }}
                      className="p-1 rounded text-slate-300 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="p-2.5 border-t border-slate-100 bg-slate-50/50">
            <Button
              type="button"
              size="sm"
              onClick={onAddTrigger}
              className="w-full h-8 text-xs bg-[#004776] hover:bg-[#00365a] text-white font-semibold"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Add Menu Trigger
            </Button>
          </div>
        </div>
      )}
    </aside>
  );
}
