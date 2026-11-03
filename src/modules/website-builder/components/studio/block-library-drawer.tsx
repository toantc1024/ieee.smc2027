"use client";

import React, { useState } from "react";
import { Search, Plus } from "lucide-react";
import { CONFERENCE_BLOCK_DEFINITIONS } from "../../registry";
import { useBuilderStore } from "../../store/builder-store";

const CATEGORY_LABELS: Record<string, string> = {
  basic: "Small Modular Blocks",
  hero: "Hero & Banners",
  conference: "Conference Sections",
  academic: "Call for Papers & Tracks",
  program: "Program & Schedule",
  organization: "Committees",
  registration: "Registration & Fees",
  venue: "Venue & Travel",
  hospitality: "Visa & Accommodation",
  partners: "Sponsors",
  contact: "Contact & Alerts",
  support: "FAQ & Help",
  media: "Video & Media",
  history: "Past Conferences",
  layout: "Header & Footer",
};

export function BlockLibraryDrawer() {
  const [search, setSearch] = useState("");
  const { addBlock, selectedBlockId, data, insertBlockAt } = useBuilderStore();

  const blockList = Object.values(CONFERENCE_BLOCK_DEFINITIONS);

  const filtered = blockList.filter((b) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      b.label.toLowerCase().includes(q) ||
      b.type.toLowerCase().includes(q) ||
      b.description.toLowerCase().includes(q) ||
      b.category.toLowerCase().includes(q)
    );
  });

  // Group by category, ensuring "basic" (Small Modular Blocks) is first
  const categories = Array.from(new Set(filtered.map((b) => b.category)));

  const handleInsertBlock = (type: string) => {
    if (selectedBlockId) {
      const idx = data.content.findIndex((b) => b.id === selectedBlockId);
      if (idx !== -1) {
        insertBlockAt(type, idx + 1);
        return;
      }
    }
    addBlock(type);
  };

  return (
    <div className="flex flex-col h-full bg-white select-none">
      {/* Search Input */}
      <div className="p-3 border-b border-slate-100">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search blocks (text, image, sheet...)"
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900"
          />
        </div>
      </div>

      {/* Blocks List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {categories.map((cat) => {
          const items = filtered.filter((b) => b.category === cat);
          return (
            <div key={cat} className="space-y-1.5">
              <h5 className="text-[10px] font-bold uppercase tracking-wider text-blue-600/80 px-1">
                {CATEGORY_LABELS[cat] || cat}
              </h5>
              <div className="space-y-1">
                {items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() => handleInsertBlock(item.type)}
                      className="w-full text-left p-2.5 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all flex items-start gap-2.5 group cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-900 group-hover:text-blue-600 truncate">
                            {item.label}
                          </span>
                          <Plus className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                          {item.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
