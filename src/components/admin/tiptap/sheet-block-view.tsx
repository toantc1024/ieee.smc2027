"use client";

import React, { useState, useRef } from "react";
import type { NodeViewProps } from "@tiptap/react";
import {
  Table2,
  Plus,
  Trash2,
  Upload,
  Search,
  Columns,
  Rows,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { parseDelimitedText } from "./parse-delimited-text";
import {
  BlockWrapper,
  type BlockAlignment,
  type BlockLayoutMode,
} from "./block-wrapper";
import type { SheetBlockAttrs } from "./sheet-block-extension";

function parseSheetJson(raw?: string): string[][] {
  if (!raw) {
    return [
      ["Column 1", "Column 2", "Column 3"],
      ["", "", ""],
    ];
  }
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0 && Array.isArray(parsed[0])) {
      return parsed.map((r: unknown[]) => r.map((c) => String(c ?? "")));
    }
  } catch {
    // ignore
  }
  return [
    ["Column 1", "Column 2", "Column 3"],
    ["Row 1", "", ""],
    ["Row 2", "", ""],
  ];
}

function getColumnLetter(colIdx: number): string {
  let letter = "";
  let temp = colIdx;
  while (temp >= 0) {
    letter = String.fromCharCode((temp % 26) + 65) + letter;
    temp = Math.floor(temp / 26) - 1;
  }
  return letter;
}

export function SheetBlockView({
  node,
  updateAttributes,
  deleteNode,
  selected,
}: NodeViewProps) {
  const attrs = node.attrs as SheetBlockAttrs;
  const rows = parseSheetJson(attrs.dataJson);
  const title = attrs.title || "Data Sheet";
  const caption = attrs.caption || "";
  const credit = attrs.credit || "";
  const width = Number(attrs.width) || 100;
  const alignment: BlockAlignment = attrs.alignment || "center";
  const layoutMode: BlockLayoutMode = attrs.layoutMode || "inline";
  const hasHeader = attrs.hasHeader !== false;
  const striped = attrs.striped !== false;

  const [activeCell, setActiveCell] = useState<{ r: number; c: number } | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const rowCount = rows.length;
  const colCount = rows[0]?.length || 1;

  const saveRows = (nextRows: string[][]) => {
    updateAttributes({ dataJson: JSON.stringify(nextRows) });
  };

  const handleCellChange = (rIdx: number, cIdx: number, val: string) => {
    const next = rows.map((r) => [...r]);
    if (!next[rIdx]) return;
    next[rIdx][cIdx] = val;
    saveRows(next);
  };

  const addRow = () => {
    const next = [...rows.map((r) => [...r]), Array(colCount).fill("")];
    saveRows(next);
  };

  const addCol = () => {
    const next = rows.map((r, rIdx) => [
      ...r,
      rIdx === 0 && hasHeader ? `Col ${colCount + 1}` : "",
    ]);
    saveRows(next);
  };

  const removeRow = (rIdx: number) => {
    if (rows.length <= 1) return;
    const next = rows.filter((_, i) => i !== rIdx);
    saveRows(next);
    setActiveCell(null);
  };

  const removeCol = (cIdx: number) => {
    if (colCount <= 1) return;
    const next = rows.map((r) => r.filter((_, i) => i !== cIdx));
    saveRows(next);
    setActiveCell(null);
  };

  const handleImportCsv = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const normalized = parseDelimitedText(text);
      if (!normalized.length) { toast.error("The file is empty"); return; }
      updateAttributes({
        dataJson: JSON.stringify(normalized),
        title: file.name.replace(/\.[^/.]+$/, ""),
      });
      toast.success(`Imported ${normalized.length} rows into Sheet Block`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to parse CSV / Sheet file");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <BlockWrapper
      selected={selected}
      label={title || "Sheet Block"}
      badge={`${rowCount}×${colCount}`}
      icon={<Table2 className="size-3.5" />}
      alignment={alignment}
      onAlignmentChange={(a) => updateAttributes({ alignment: a })}
      layoutMode={layoutMode}
      onLayoutModeChange={(m) => updateAttributes({ layoutMode: m })}
      width={width}
      onWidthChange={(w) => updateAttributes({ width: w })}
      caption={caption}
      onCaptionChange={(c) => updateAttributes({ caption: c })}
      captionPlaceholder="Table caption or note..."
      credit={credit}
      onCreditChange={(cr) => updateAttributes({ credit: cr })}
      creditPlaceholder="Data source..."
      onDelete={deleteNode}
      headerActions={
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.tsv,.txt"
            onChange={handleImportCsv}
            className="hidden"
          />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            title="Import CSV / Sheet data"
            className={cn(
              "h-6 px-2 rounded-md text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer",
              selected
                ? "bg-blue-700 text-white hover:bg-blue-800"
                : "text-slate-600 hover:bg-slate-200/70"
            )}
          >
            <Upload className="size-3" />
            <span className="hidden sm:inline">Import CSV</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              addRow();
            }}
            title="Add Row"
            className={cn(
              "h-6 px-1.5 rounded-md text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer",
              selected
                ? "text-blue-100 hover:bg-blue-700 hover:text-white"
                : "text-slate-600 hover:bg-slate-200/70"
            )}
          >
            <Rows className="size-3" />
            <span className="hidden lg:inline">+Row</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              addCol();
            }}
            title="Add Column"
            className={cn(
              "h-6 px-1.5 rounded-md text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer",
              selected
                ? "text-blue-100 hover:bg-blue-700 hover:text-white"
                : "text-slate-600 hover:bg-slate-200/70"
            )}
          >
            <Columns className="size-3" />
            <span className="hidden lg:inline">+Col</span>
          </button>
        </>
      }
      settingsContent={
        <div className="space-y-2.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-600">
                Sheet Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => updateAttributes({ title: e.target.value })}
                placeholder="Sheet / Table title..."
                className="h-8 w-full rounded-md border border-slate-200 bg-white px-2.5 text-xs focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="flex items-end gap-4 pb-1.5">
              <label className="inline-flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasHeader}
                  onChange={(e) =>
                    updateAttributes({ hasHeader: e.target.checked })
                  }
                  className="rounded border-slate-200/85"
                />
                <span>Header Row</span>
              </label>

              <label className="inline-flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={striped}
                  onChange={(e) =>
                    updateAttributes({ striped: e.target.checked })
                  }
                  className="rounded border-slate-200/85"
                />
                <span>Striped Rows</span>
              </label>
            </div>
          </div>
        </div>
      }
    >
      {/* Spreadsheet Toolbar & Filter */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="px-3 py-2 bg-emerald-50/50 border-b border-slate-200/75 flex flex-wrap items-center justify-between gap-2"
      >
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-bold">
            Sheet
          </span>
          <input
            type="text"
            value={title}
            onChange={(e) => updateAttributes({ title: e.target.value })}
            className="text-xs font-bold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-600 focus:outline-none px-1 py-0.5"
          />
        </div>

        <div className="flex items-center gap-2">
          {activeCell && (
            <div className="flex items-center gap-1 text-[11px]">
              <span className="font-mono text-slate-500 px-1.5 py-0.5 rounded bg-white border border-slate-200">
                {getColumnLetter(activeCell.c)}
                {activeCell.r + 1}
              </span>
              {rowCount > 1 && (
                <button
                  type="button"
                  onClick={() => removeRow(activeCell.r)}
                  className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 hover:bg-rose-100 text-[10px] font-medium cursor-pointer"
                  title="Delete selected row"
                >
                  Del Row
                </button>
              )}
              {colCount > 1 && (
                <button
                  type="button"
                  onClick={() => removeCol(activeCell.c)}
                  className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 hover:bg-rose-100 text-[10px] font-medium cursor-pointer"
                  title="Delete selected column"
                >
                  Del Col
                </button>
              )}
            </div>
          )}

          <div className="relative w-40">
            <Search className="size-3 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter sheet..."
              className="w-full h-6 pl-6 pr-2 rounded border border-slate-200 bg-white text-[11px] focus:outline-none focus:border-blue-600"
            />
          </div>
        </div>
      </div>

      {/* Interactive Spreadsheet Grid */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="overflow-x-auto max-h-[420px]"
      >
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200 text-[10px] font-mono text-slate-500 select-none">
              <th className="w-8 py-1 px-1.5 border-r border-slate-200 text-center bg-slate-100">
                #
              </th>
              {Array.from({ length: colCount }).map((_, cIdx) => (
                <th
                  key={cIdx}
                  className={cn(
                    "py-1 px-2 border-r border-slate-200 text-center font-semibold",
                    activeCell?.c === cIdx && "bg-blue-50 text-blue-600"
                  )}
                >
                  {getColumnLetter(cIdx)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {rows.map((row, rIdx) => {
              const isHeaderRow = hasHeader && rIdx === 0;
              const matchesSearch =
                !searchQuery.trim() ||
                isHeaderRow ||
                row.some((c) =>
                  c.toLowerCase().includes(searchQuery.toLowerCase())
                );

              if (!matchesSearch) return null;

              return (
                <tr
                  key={rIdx}
                  className={cn(
                    isHeaderRow
                      ? "bg-[#004776] text-white font-bold"
                      : striped && rIdx % 2 === 1
                        ? "bg-slate-50/70"
                        : "bg-white"
                  )}
                >
                  <td
                    className={cn(
                      "w-8 py-1.5 px-1.5 border-r border-slate-200 text-center font-mono text-[10px] select-none",
                      isHeaderRow
                        ? "bg-[#00385e] text-blue-100"
                        : activeCell?.r === rIdx
                          ? "bg-blue-50 text-blue-600 font-bold"
                          : "bg-slate-50 text-slate-400"
                    )}
                  >
                    {rIdx + 1}
                  </td>
                  {row.map((cell, cIdx) => {
                    const isFocused =
                      activeCell?.r === rIdx && activeCell?.c === cIdx;
                    return (
                      <td
                        key={cIdx}
                        className={cn(
                          "p-0 border-r border-slate-200/80 last:border-r-0 min-w-[110px]",
                          isFocused && "ring-2 ring-inset ring-blue-600 z-10"
                        )}
                      >
                        <input
                          type="text"
                          value={cell}
                          onFocus={() => setActiveCell({ r: rIdx, c: cIdx })}
                          onChange={(e) =>
                            handleCellChange(rIdx, cIdx, e.target.value)
                          }
                          placeholder={
                            isHeaderRow ? `Header ${cIdx + 1}` : "..."
                          }
                          className={cn(
                            "w-full px-2.5 py-2 text-xs bg-transparent focus:outline-none",
                            isHeaderRow
                              ? "font-bold text-white placeholder:text-blue-200/60"
                              : "text-slate-800 placeholder:text-slate-300"
                          )}
                        />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Bottom Quick Add Row Bar */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="px-3 py-1.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500"
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={addRow}
            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
          >
            <Plus className="size-3" />
            <span>Add Row</span>
          </button>
          <span className="text-slate-300">•</span>
          <button
            type="button"
            onClick={addCol}
            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
          >
            <Plus className="size-3" />
            <span>Add Column</span>
          </button>
        </div>
        <span className="font-mono text-[10px] text-slate-400">
          {rowCount} rows × {colCount} cols
        </span>
      </div>
    </BlockWrapper>
  );
}
