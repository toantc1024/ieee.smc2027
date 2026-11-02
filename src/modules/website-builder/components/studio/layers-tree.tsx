"use client";

import React from "react";
import {
  GripVertical,
  ChevronUp,
  ChevronDown,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Layers,
} from "lucide-react";
import { useBuilderStore } from "../../store/builder-store";
import { getBlockDefinition } from "../../registry";
import { cn } from "@/lib/utils";

export function LayersTree() {
  const {
    data,
    selectedBlockId,
    selectBlock,
    moveBlockUp,
    moveBlockDown,
    duplicateBlock,
    removeBlock,
    toggleBlockHidden,
  } = useBuilderStore();

  if (data.content.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 space-y-2 select-none">
        <Layers className="w-8 h-8 mx-auto text-slate-300" />
        <p className="text-xs font-medium">No sections added yet</p>
      </div>
    );
  }

  return (
    <div className="p-2 space-y-1 overflow-y-auto select-none">
      {data.content.map((block, idx) => {
        const isSelected = selectedBlockId === block.id;
        const def = getBlockDefinition(block.type);
        const Icon = def?.icon || Layers;

        return (
          <div
            key={block.id}
            onClick={() => selectBlock(block.id)}
            className={cn(
              "group flex items-center justify-between p-2 rounded-lg border text-xs transition-all cursor-pointer",
              isSelected
                ? "bg-blue-50 border-blue-200 text-blue-900 font-medium"
                : "bg-white border-transparent hover:bg-slate-50 text-slate-700"
            )}
          >
            <div className="flex items-center gap-2 min-w-0">
              <Icon className={cn("w-3.5 h-3.5 shrink-0", isSelected ? "text-blue-600" : "text-slate-400")} />
              <span className="truncate">{def?.label || block.type}</span>
              {block.hidden && (
                <span className="text-[10px] text-amber-600 font-semibold">(Hidden)</span>
              )}
            </div>

            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                disabled={idx === 0}
                onClick={(e) => {
                  e.stopPropagation();
                  moveBlockUp(block.id);
                }}
                className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20"
                title="Move Up"
              >
                <ChevronUp className="w-3 h-3" />
              </button>
              <button
                type="button"
                disabled={idx === data.content.length - 1}
                onClick={(e) => {
                  e.stopPropagation();
                  moveBlockDown(block.id);
                }}
                className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20"
                title="Move Down"
              >
                <ChevronDown className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  duplicateBlock(block.id);
                }}
                className="p-1 text-slate-400 hover:text-slate-700"
                title="Duplicate"
              >
                <Copy className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleBlockHidden(block.id);
                }}
                className="p-1 text-slate-400 hover:text-slate-700"
                title={block.hidden ? "Show" : "Hide"}
              >
                {block.hidden ? (
                  <EyeOff className="w-3 h-3 text-amber-500" />
                ) : (
                  <Eye className="w-3 h-3" />
                )}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeBlock(block.id);
                }}
                className="p-1 text-rose-500 hover:text-rose-700"
                title="Delete"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
