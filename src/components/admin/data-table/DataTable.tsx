"use client";

import React, { useMemo, useRef, useState } from "react";
import {
  ColumnDef,
  FilterFn,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  SortingState,
  useReactTable,
  RowSelectionState,
} from "@tanstack/react-table";
import {
  Search,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
  FileQuestion,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterColumn {
  id: string;
  title: string;
  options: FilterOption[];
}

interface DataTableProps<TData, TValue = unknown> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchPlaceholder?: string;
  filterColumns?: FilterColumn[];
  batchActions?: (selectedRows: TData[], clearSelection: () => void) => React.ReactNode;
  onRowClick?: (row: TData) => void;
  loading?: boolean;
  toolbarLeft?: React.ReactNode;
  toolbarRight?: React.ReactNode;
}

const CENTER_COLUMN_IDS = new Set([
  "select",
  "actions",
  "status",
  "role",
  "provider",
  "cover",
  "coverimage",
  "createdat",
  "joineddate",
  "date",
  "views",
]);

function resolveAlign(colId: string, colDef: unknown): "left" | "center" | "right" {
  const def = colDef as { align?: string; meta?: { align?: string } } | undefined;
  const custom = def?.align || def?.meta?.align;
  if (custom === "center" || custom === "right" || custom === "left") {
    return custom;
  }
  return CENTER_COLUMN_IDS.has(colId.toLowerCase()) ? "center" : "left";
}

function matchesSearchValue(value: unknown, needle: string): boolean {
  if (value == null) return false;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value).toLowerCase().includes(needle);
  }
  if (Array.isArray(value)) {
    return value.some((item) => matchesSearchValue(item, needle));
  }
  if (typeof value === "object") {
    return Object.values(value as Record<string, unknown>).some((v) =>
      matchesSearchValue(v, needle)
    );
  }
  return false;
}

export function DataTable<TData, TValue = unknown>({
  columns,
  data,
  searchPlaceholder = "Search...",
  filterColumns = [],
  batchActions,
  onRowClick,
  loading = false,
  toolbarLeft,
  toolbarRight,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [searchOpen, setSearchOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filterMap = useMemo(() => {
    const map = new Map<string, FilterColumn>();
    for (const fc of filterColumns) {
      map.set(fc.id.toLowerCase(), fc);
    }
    return map;
  }, [filterColumns]);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const record = item as Record<string, unknown>;
      for (const [key, value] of Object.entries(columnFilters)) {
        if (value && value !== "ALL") {
          const itemVal = record[key];
          if (String(itemVal ?? "").toLowerCase() !== value.toLowerCase()) {
            return false;
          }
        }
      }
      return true;
    });
  }, [data, columnFilters]);

  const globalFilterFn: FilterFn<TData> = useMemo(
    () => (row, _columnId, filterValue) => {
      const needle = String(filterValue || "").trim().toLowerCase();
      if (!needle) return true;
      return matchesSearchValue(row.original, needle);
    },
    []
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      globalFilter,
      rowSelection,
    },
    globalFilterFn,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  const selectedRows = table
    .getSelectedRowModel()
    .rows.map((row) => row.original);

  const clearSelection = () => setRowSelection({});

  const activeFilterEntries = Object.entries(columnFilters).filter(
    ([, v]) => v && v !== "ALL"
  );
  const activeFilterCount = activeFilterEntries.length;
  const hasActiveFilters = Boolean(globalFilter.trim()) || activeFilterCount > 0;

  const clearAllFilters = () => {
    setGlobalFilter("");
    setColumnFilters({});
  };

  return (
    <div className="font-sans">
      <div className="relative bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        {/* ── Unified Compact Toolbar (ute.short pattern: icon popovers + inline actions) ── */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 border-b border-slate-200 bg-white">
          <div className="flex flex-wrap items-center gap-2 min-w-0">
            {toolbarLeft}

            {/* Active search chip */}
            {globalFilter.trim() && (
              <span className="inline-flex items-center gap-1 h-7 pl-2.5 pr-1.5 rounded-md bg-blue-50 border border-blue-200 text-xs font-medium text-[#004776]">
                <Search className="size-3 text-[#115eff]" />
                <span className="max-w-[140px] truncate">{globalFilter.trim()}</span>
                <button
                  type="button"
                  onClick={() => setGlobalFilter("")}
                  className="p-0.5 rounded hover:bg-blue-100 text-slate-500 hover:text-slate-800 cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="size-3" />
                </button>
              </span>
            )}

            {/* Active filter chips */}
            {activeFilterEntries.map(([key, val]) => {
              const fc = filterMap.get(key.toLowerCase());
              const optLabel =
                fc?.options.find((o) => o.value === val)?.label || val;
              return (
                <span
                  key={key}
                  className="inline-flex items-center gap-1 h-7 pl-2.5 pr-1.5 rounded-md bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700"
                >
                  <span className="text-slate-400">{fc?.title || key}:</span>
                  <span>{optLabel}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setColumnFilters((prev) => ({ ...prev, [key]: "ALL" }))
                    }
                    className="p-0.5 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-800 cursor-pointer"
                    aria-label={`Clear ${fc?.title || key} filter`}
                  >
                    <X className="size-3" />
                  </button>
                </span>
              );
            })}

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-xs font-medium text-slate-500 hover:text-[#115eff] px-1.5 py-1 rounded transition-colors cursor-pointer"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Batch Actions */}
            {selectedRows.length > 0 && batchActions && (
              <div className="flex items-center gap-2 bg-blue-50/70 px-2.5 h-9 rounded-lg border border-blue-200 mr-1">
                <span className="text-xs font-semibold text-[#004776]">
                  {selectedRows.length} selected
                </span>
                {batchActions(selectedRows, clearSelection)}
              </div>
            )}

            {/* Search Icon Popover */}
            <Popover
              open={searchOpen}
              onOpenChange={(open) => {
                setSearchOpen(open);
                if (open) {
                  setTimeout(() => searchInputRef.current?.focus(), 20);
                }
              }}
            >
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className={cn(
                    "relative h-9 w-9 p-0 rounded-lg border-slate-200 bg-white hover:bg-slate-50 hover:border-blue-300 transition-colors cursor-pointer",
                    globalFilter.trim() &&
                      "border-[#115eff] bg-blue-50/60 text-[#115eff]"
                  )}
                  title="Search"
                  aria-label="Search table"
                >
                  <Search className="size-4" />
                  {globalFilter.trim() && (
                    <span className="absolute -top-1 -right-1 size-2.5 rounded-full bg-[#115eff] ring-2 ring-white" />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                sideOffset={6}
                className="w-72 sm:w-80 p-2.5 rounded-xl border border-slate-200 bg-white shadow-lg"
              >
                <div className="relative flex items-center">
                  <Search className="size-4 text-slate-400 absolute left-2.5 pointer-events-none" />
                  <Input
                    ref={searchInputRef}
                    type="text"
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") setSearchOpen(false);
                    }}
                    placeholder={searchPlaceholder}
                    className="h-9 pl-8 pr-8 text-sm bg-slate-50/70 border-slate-200 rounded-lg focus:bg-white focus:border-[#115eff]"
                  />
                  {globalFilter && (
                    <button
                      type="button"
                      onClick={() => {
                        setGlobalFilter("");
                        searchInputRef.current?.focus();
                      }}
                      className="absolute right-2 p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                      aria-label="Clear search"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>
              </PopoverContent>
            </Popover>

            {/* Filter Icon Popover */}
            {filterColumns.length > 0 && (
              <Popover open={filterOpen} onOpenChange={setFilterOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={cn(
                      "relative h-9 px-2.5 gap-1.5 rounded-lg border-slate-200 bg-white hover:bg-slate-50 hover:border-blue-300 text-slate-700 transition-colors cursor-pointer",
                      activeFilterCount > 0 &&
                        "border-[#115eff] bg-blue-50/60 text-[#115eff]"
                    )}
                    title="Filters"
                  >
                    <SlidersHorizontal className="size-3.5" />
                    <span className="hidden sm:inline text-xs font-semibold">Filter</span>
                    {activeFilterCount > 0 && (
                      <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[#115eff] text-white text-[10px] font-bold">
                        {activeFilterCount}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  align="end"
                  sideOffset={6}
                  className="w-72 p-3 rounded-xl border border-slate-200 bg-white shadow-lg space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-[#004776]">Filters</span>
                    {activeFilterCount > 0 && (
                      <button
                        type="button"
                        onClick={() => setColumnFilters({})}
                        className="text-xs font-medium text-[#115eff] hover:underline cursor-pointer"
                      >
                        Reset
                      </button>
                    )}
                  </div>

                  {filterColumns.map((fc) => {
                    const current = columnFilters[fc.id] || "ALL";
                    return (
                      <div key={fc.id} className="space-y-1.5">
                        <div className="text-[11px] font-semibold text-slate-500">
                          {fc.title}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              setColumnFilters((prev) => ({ ...prev, [fc.id]: "ALL" }))
                            }
                            className={cn(
                              "px-2.5 py-1 rounded-md text-xs font-medium border transition-colors cursor-pointer",
                              current === "ALL"
                                ? "bg-[#115eff] text-white border-[#115eff]"
                                : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
                            )}
                          >
                            All
                          </button>
                          {fc.options.map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() =>
                                setColumnFilters((prev) => ({
                                  ...prev,
                                  [fc.id]: opt.value,
                                }))
                              }
                              className={cn(
                                "px-2.5 py-1 rounded-md text-xs font-medium border transition-colors cursor-pointer",
                                current === opt.value
                                  ? "bg-[#115eff] text-white border-[#115eff]"
                                  : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
                              )}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </PopoverContent>
              </Popover>
            )}

            {toolbarRight}
          </div>
        </div>

        {/* ── Table ── */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/90 border-b border-slate-200">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="hover:bg-transparent"
                >
                  {headerGroup.headers.map((header) => {
                    const canSort = header.column.getCanSort();
                    const sortDirection = header.column.getIsSorted();
                    const align = resolveAlign(header.column.id, header.column.columnDef);
                    const colMeta = header.column.columnDef.meta as
                      | { headerClassName?: string; searchable?: boolean }
                      | undefined;
                    const colFilter = filterMap.get(header.column.id.toLowerCase());
                    const activeColFilterVal = colFilter
                      ? columnFilters[colFilter.id] || "ALL"
                      : "ALL";

                    return (
                      <TableHead
                        key={header.id}
                        className={cn(
                          "align-middle select-none whitespace-nowrap",
                          align === "center"
                            ? "text-center"
                            : align === "right"
                            ? "text-right"
                            : "text-left",
                          colMeta?.headerClassName
                        )}
                        style={{
                          width: header.getSize() !== 150 ? header.getSize() : undefined,
                        }}
                      >
                        {header.isPlaceholder ? null : (
                          <div
                            className={cn(
                              "flex items-center gap-1",
                              align === "center"
                                ? "justify-center"
                                : align === "right"
                                ? "justify-end"
                                : "justify-start"
                            )}
                          >
                            {canSort ? (
                              <button
                                type="button"
                                onClick={header.column.getToggleSortingHandler()}
                                className={cn(
                                  "inline-flex items-center gap-1.5 py-1 rounded hover:text-[#115eff] transition-colors cursor-pointer group",
                                  sortDirection && "text-[#115eff]"
                                )}
                              >
                                <span>
                                  {flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                  )}
                                </span>
                                <span className="shrink-0">
                                  {sortDirection === "asc" ? (
                                    <ArrowUp className="size-3.5 text-[#115eff]" />
                                  ) : sortDirection === "desc" ? (
                                    <ArrowDown className="size-3.5 text-[#115eff]" />
                                  ) : (
                                    <ArrowUpDown className="size-3 text-slate-400 opacity-50 group-hover:opacity-100 group-hover:text-[#115eff]" />
                                  )}
                                </span>
                              </button>
                            ) : (
                              <span>
                                {flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                              </span>
                            )}

                            {/* Column-level quick search popover icon */}
                            {colMeta?.searchable && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSearchOpen(true);
                                  setTimeout(() => searchInputRef.current?.focus(), 20);
                                }}
                                className={cn(
                                  "p-1 rounded hover:bg-blue-50 text-slate-400 hover:text-[#115eff] transition-colors cursor-pointer",
                                  globalFilter.trim() && "text-[#115eff] bg-blue-50"
                                )}
                                title="Search"
                                aria-label="Search posts"
                              >
                                <Search className="size-3.5" />
                              </button>
                            )}

                            {/* Column-level quick filter popover icon */}
                            {colFilter && (
                              <Popover>
                                <PopoverTrigger asChild>
                                  <button
                                    type="button"
                                    onClick={(e) => e.stopPropagation()}
                                    className={cn(
                                      "p-1 rounded hover:bg-blue-50 text-slate-400 hover:text-[#115eff] transition-colors cursor-pointer",
                                      activeColFilterVal !== "ALL" &&
                                        "text-[#115eff] bg-blue-50"
                                    )}
                                    title={`Filter by ${colFilter.title}`}
                                  >
                                    <SlidersHorizontal className="size-3" />
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent
                                  align={align === "left" ? "start" : "center"}
                                  sideOffset={6}
                                  className="w-48 p-1.5 rounded-xl border border-slate-200 bg-white shadow-lg"
                                >
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setColumnFilters((prev) => ({
                                        ...prev,
                                        [colFilter.id]: "ALL",
                                      }))
                                    }
                                    className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg hover:bg-slate-50 text-slate-700 cursor-pointer"
                                  >
                                    <span>All {colFilter.title}</span>
                                    {activeColFilterVal === "ALL" && (
                                      <Check className="size-3.5 text-[#115eff]" />
                                    )}
                                  </button>
                                  {colFilter.options.map((opt) => (
                                    <button
                                      key={opt.value}
                                      type="button"
                                      onClick={() =>
                                        setColumnFilters((prev) => ({
                                          ...prev,
                                          [colFilter.id]: opt.value,
                                        }))
                                      }
                                      className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg hover:bg-slate-50 text-slate-700 cursor-pointer"
                                    >
                                      <span className="truncate">{opt.label}</span>
                                      {activeColFilterVal === opt.value && (
                                        <Check className="size-3.5 text-[#115eff] shrink-0" />
                                      )}
                                    </button>
                                  ))}
                                </PopoverContent>
                              </Popover>
                            )}
                          </div>
                        )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody className="divide-y divide-slate-100 text-slate-800">
              {loading ? (
                <>
                  {Array.from({ length: 6 }).map((_, rIdx) => (
                    <TableRow
                      key={`skeleton-row-${rIdx}`}
                      className="hover:bg-transparent"
                    >
                      {columns.map((_, cIdx) => (
                        <TableCell key={`skeleton-cell-${rIdx}-${cIdx}`}>
                          <div
                            className={cn(
                              "h-3.5 bg-slate-200/55 rounded-lg animate-pulse",
                              cIdx === 0
                                ? "w-4 h-4 rounded"
                                : cIdx === 1
                                ? "w-28 h-14 rounded-lg mx-auto"
                                : cIdx % 2 === 0
                                ? "w-3/4"
                                : "w-1/2 mx-auto"
                            )}
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </>
              ) : table.getRowModel().rows.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={columns.length}
                    className="py-16 text-center text-slate-400"
                  >
                    <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                      <FileQuestion className="size-8 text-slate-300 stroke-[1.5]" />
                      <p className="text-xs font-medium text-slate-600">
                        No matching records found
                      </p>
                      {hasActiveFilters && (
                        <button
                          type="button"
                          onClick={clearAllFilters}
                          className="text-xs text-[#115eff] hover:underline cursor-pointer"
                        >
                          Clear current filters
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() ? "selected" : undefined}
                    onClick={() => onRowClick?.(row.original)}
                    className={cn(
                      "transition-colors",
                      onRowClick
                        ? "cursor-pointer hover:bg-blue-50/35"
                        : "hover:bg-slate-50/60"
                    )}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const align = resolveAlign(
                        cell.column.id,
                        cell.column.columnDef
                      );
                      const cellClassName = (
                        cell.column.columnDef.meta as
                          | { cellClassName?: string }
                          | undefined
                      )?.cellClassName;

                      return (
                        <TableCell
                          key={cell.id}
                          className={cn(
                            "align-middle",
                            align === "center"
                              ? "text-center"
                              : align === "right"
                              ? "text-right"
                              : "text-left",
                            cellClassName
                          )}
                          style={{
                            width:
                              cell.column.getSize() !== 150
                                ? cell.column.getSize()
                                : undefined,
                            maxWidth:
                              cell.column.getSize() !== 150
                                ? cell.column.getSize()
                                : undefined,
                          }}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* ── Pagination Footer ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-2.5 border-t border-slate-200 bg-slate-50/50 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>
              Showing{" "}
              <strong className="text-slate-800 font-semibold">
                {table.getState().pagination.pageIndex *
                  table.getState().pagination.pageSize +
                  (table.getRowModel().rows.length > 0 ? 1 : 0)}
              </strong>{" "}
              to{" "}
              <strong className="text-slate-800 font-semibold">
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) *
                    table.getState().pagination.pageSize,
                  table.getFilteredRowModel().rows.length
                )}
              </strong>{" "}
              of{" "}
              <strong className="text-slate-800 font-semibold">
                {table.getFilteredRowModel().rows.length}
              </strong>{" "}
              entries
            </span>

            <span className="text-slate-300">|</span>

            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <span>Per page:</span>
              <Select
                value={String(table.getState().pagination.pageSize)}
                onValueChange={(val) => table.setPageSize(Number(val))}
              >
                <SelectTrigger className="h-8 w-[68px] px-2 text-xs bg-white border-slate-200 rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[10, 20, 50, 100].map((pageSize) => (
                    <SelectItem key={pageSize} value={String(pageSize)}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="h-8 px-2.5 text-xs text-slate-600 disabled:opacity-40"
            >
              <ChevronLeft className="size-3.5 mr-1" />
              <span>Previous</span>
            </Button>

            <span className="px-2 text-xs font-medium text-slate-700">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {Math.max(1, table.getPageCount())}
            </span>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="h-8 px-2.5 text-xs text-slate-600 disabled:opacity-40"
            >
              <span>Next</span>
              <ChevronRight className="size-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
