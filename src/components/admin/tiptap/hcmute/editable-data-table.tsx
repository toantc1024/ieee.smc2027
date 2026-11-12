"use client";

import { useCallback, useMemo } from "react";
import { Plus, Trash2 } from "lucide-react";

interface EditableDataTableProps {
  data: Record<string, unknown>[];
  onDataChange: (data: Record<string, unknown>[]) => void;
  /** The first key is treated as the category/label column */
  categoryKey?: string;
}

export function EditableDataTable({
  data,
  onDataChange,
  categoryKey: _categoryKey,
}: EditableDataTableProps) {
  const allKeys = useMemo(() => data.length > 0 ? Object.keys(data[0]) : [], [data]);
  const categoryKey = _categoryKey || allKeys[0] || "name";
  const valueKeys = allKeys.filter((k) => k !== categoryKey);

  const updateCell = useCallback(
    (rowIdx: number, key: string, value: string) => {
      const next = [...data];
      next[rowIdx] = {
        ...next[rowIdx],
        [key]: key === categoryKey ? value : (Number(value) || 0),
      };
      onDataChange(next);
    },
    [data, categoryKey, onDataChange],
  );

  const addRow = useCallback(() => {
    const newRow: Record<string, unknown> = {};
    allKeys.forEach((k, i) => {
      newRow[k] = i === 0 ? "" : 0;
    });
    onDataChange([...data, newRow]);
  }, [data, allKeys, onDataChange]);

  const deleteRow = useCallback(
    (idx: number) => {
      onDataChange(data.filter((_, i) => i !== idx));
    },
    [data, onDataChange],
  );

  const addColumn = useCallback(() => {
    const newKey = `col${allKeys.length}`;
    onDataChange(data.map((row) => ({ ...row, [newKey]: 0 })));
  }, [data, allKeys, onDataChange]);

  const deleteColumn = useCallback(
    (key: string) => {
      onDataChange(
        data.map((row) => {
          const rest = { ...row };
          delete rest[key];
          return rest;
        }),
      );
    },
    [data, onDataChange],
  );

  if (allKeys.length === 0) {
    return (
      <div className="text-xs text-muted-foreground text-center py-4">
        No data
      </div>
    );
  }

  return (
    <div
      draggable={false}
      onDragStart={(e) => { e.stopPropagation(); e.preventDefault(); }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="rounded-lg border bg-background overflow-hidden">
        <div className="relative overflow-auto max-h-[320px]">
          <table className="w-full text-xs border-collapse min-w-[400px]">
            <thead className="sticky top-0 z-20">
              <tr className="bg-muted/60 backdrop-blur-sm">
                {/* Category column header - sticky left */}
                <th className="sticky left-0 z-30 bg-muted/90 backdrop-blur-sm px-3 py-2 text-left font-semibold text-muted-foreground border-b border-r whitespace-nowrap min-w-[120px]">
                  {categoryKey}
                </th>
                {/* Value column headers */}
                {valueKeys.map((key) => (
                  <th
                    key={key}
                    className="px-3 py-2 text-left font-semibold text-muted-foreground border-b border-r whitespace-nowrap min-w-[100px]"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="flex-1 truncate">{key}</span>
                      <button
                        type="button"
                        className="shrink-0 size-5 inline-flex items-center justify-center text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors rounded"
                        onClick={() => deleteColumn(key)}
                        title="Delete column"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  </th>
                ))}
                {/* Action column header - sticky right */}
                <th className="sticky right-0 z-30 bg-muted/90 backdrop-blur-sm w-10 border-b border-l text-center px-1 py-2">
                  <span className="text-[10px] text-muted-foreground/50">#</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIdx) => (
                <tr
                  key={rowIdx}
                  className="border-b last:border-b-0 hover:bg-muted/5 transition-colors"
                >
                  {/* Category cell - sticky left */}
                  <td className="sticky left-0 z-10 bg-background border-r p-0">
                    <input
                      type="text"
                      value={String(row[categoryKey] ?? "")}
                      onChange={(e) => updateCell(rowIdx, categoryKey, e.target.value)}
                      className="w-full h-9 px-3 bg-transparent text-xs focus:outline-none focus:bg-primary/5 transition-colors"
                      onKeyDown={(e) => e.stopPropagation()}
                    />
                  </td>
                  {/* Value cells */}
                  {valueKeys.map((key) => (
                    <td key={key} className="border-r p-0">
                      <input
                        type="number"
                        value={String(row[key] ?? "")}
                        onChange={(e) => updateCell(rowIdx, key, e.target.value)}
                        className="w-full h-9 px-3 bg-transparent text-xs text-right tabular-nums focus:outline-none focus:bg-primary/5 transition-colors"
                        onKeyDown={(e) => e.stopPropagation()}
                      />
                    </td>
                  ))}
                  {/* Delete row button - sticky right */}
                  <td className="sticky right-0 z-10 bg-background border-l w-10 p-0">
                    <button
                      type="button"
                      className="w-full h-9 inline-flex items-center justify-center text-muted-foreground/30 hover:text-destructive hover:bg-destructive/10 transition-colors"
                      onClick={() => deleteRow(rowIdx)}
                      title="Delete row"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add row/column buttons */}
      <div className="flex gap-2 mt-2">
        <button
          type="button"
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2.5 py-1.5 rounded-md border border-dashed hover:border-foreground/30 transition-colors"
          onClick={addRow}
        >
          <Plus className="size-3" /> Add row
        </button>
        <button
          type="button"
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2.5 py-1.5 rounded-md border border-dashed hover:border-foreground/30 transition-colors"
          onClick={addColumn}
        >
          <Plus className="size-3" /> Add column
        </button>
      </div>
    </div>
  );
}
