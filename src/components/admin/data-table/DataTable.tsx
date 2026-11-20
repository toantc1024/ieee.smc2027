"use client";

import React, { useMemo, useRef, useState } from "react";
import {
  Column,
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
  ChevronLeft,
  ChevronRight,
  ListFilter,
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

const NON_INTERACTIVE_COLUMN_IDS = new Set([
  "select",
  "actions",
  "cover",
  "coverimage",
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

function formatCellSearchText(record: Record<string, unknown>, colId: string): string {
  const raw = record[colId];
  if (raw == null) return "";
  if (colId === "title") {
    return [record.title, record.summary, record.slug].filter(Boolean).join(" ");
  }
  if (colId === "createdAt" || colId === "joinedDate" || colId === "date") {
    const d = new Date(String(raw));
    if (!Number.isNaN(d.getTime())) {
      return `${String(raw)} ${d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })}`;
    }
  }
  return String(raw);
}

interface ColumnHeaderMenuProps<TData> {
  column: Column<TData, unknown>;
  title: string;
  align: "left" | "center" | "right";
  canSort: boolean;
  sortDirection: false | "asc" | "desc";
  searchValue: string;
  onSearchChange: (val: string) => void;
  filterConfig?: FilterColumn;
  filterValue: string;
  onFilterChange: (val: string) => void;
  onSortChange: (dir: false | "asc" | "desc") => void;
  onResetColumn: () => void;
}

function ColumnHeaderMenu<TData>({
  title,
  align,
  canSort,
  sortDirection,
  searchValue,
  onSearchChange,
  filterConfig,
  filterValue,
  onFilterChange,
  onSortChange,
  onResetColumn,
}: ColumnHeaderMenuProps<TData>) {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasFilter = Boolean(filterValue && filterValue !== "ALL");
  const hasSearch = Boolean(searchValue.trim());
  const isActive = Boolean(sortDirection) || hasFilter || hasSearch;

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setTimeout(() => inputRef.current?.focus(), 20);
        }
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-1.5 px-1.5 py-1 -mx-1.5 rounded-md hover:bg-blue-50/80 hover:text-[#115eff] transition-colors cursor-pointer group",
            align === "center"
              ? "justify-center mx-auto"
              : align === "right"
              ? "justify-end ml-auto"
              : "justify-start",
            isActive && "text-[#115eff] bg-blue-50/70"
          )}
          title={`Search, filter & sort ${title}`}
        >
          <span>{title}</span>
          {sortDirection === "asc" ? (
            <ArrowUp className="size-3.5 text-[#115eff] shrink-0" />
          ) : sortDirection === "desc" ? (
            <ArrowDown className="size-3.5 text-[#115eff] shrink-0" />
          ) : (
            <ListFilter
              className={cn(
                "size-3.5 shrink-0 transition-opacity",
                isActive
                  ? "text-[#115eff] opacity-100"
                  : "text-slate-400 opacity-55 group-hover:opacity-100 group-hover:text-[#115eff]"
              )}
            />
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align={align === "right" ? "end" : align === "center" ? "center" : "start"}
        sideOffset={6}
        className="w-64 p-2.5 rounded-xl border border-slate-200 bg-white shadow-lg space-y-2.5 text-left font-normal"
      >
        {/* Header + Reset */}
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-[#004776]">{title}</span>
          {isActive && (
            <button
              type="button"
              onClick={() => {
                onResetColumn();
                setOpen(false);
              }}
              className="text-[11px] font-semibold text-[#115eff] hover:underline cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>

        {/* Column Search Input */}
        <div className="relative flex items-center">
          <Search className="size-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
          <Input
            ref={inputRef}
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape" || e.key === "Enter") setOpen(false);
            }}
            placeholder={`Search ${title.toLowerCase()}...`}
            className="h-8 pl-8 pr-7 text-xs bg-slate-50/70 border-slate-200 rounded-lg focus:bg-white focus:border-[#115eff]"
          />
          {searchValue && (
            <button
              type="button"
              onClick={() => {
                onSearchChange("");
                inputRef.current?.focus();
              }}
              className="absolute right-2 p-0.5 text-slate-400 hover:text-slate-700 cursor-pointer"
              aria-label={`Clear ${title} search`}
            >
              <X className="size-3" />
            </button>
          )}
        </div>

        {/* Sort Actions */}
        {canSort && (
          <div className="space-y-0.5 pt-1.5 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                onSortChange(sortDirection === "asc" ? false : "asc");
                setOpen(false);
              }}
              className={cn(
                "w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-colors cursor-pointer",
                sortDirection === "asc"
                  ? "bg-blue-50 text-[#115eff] font-semibold"
                  : "text-slate-700 hover:bg-slate-50 font-medium"
              )}
            >
              <span className="inline-flex items-center gap-2">
                <ArrowUp className="size-3.5" />
                <span>Sort Ascending</span>
              </span>
              {sortDirection === "asc" && <Check className="size-3.5" />}
            </button>
            <button
              type="button"
              onClick={() => {
                onSortChange(sortDirection === "desc" ? false : "desc");
                setOpen(false);
              }}
              className={cn(
                "w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-colors cursor-pointer",
                sortDirection === "desc"
                  ? "bg-blue-50 text-[#115eff] font-semibold"
                  : "text-slate-700 hover:bg-slate-50 font-medium"
              )}
            >
              <span className="inline-flex items-center gap-2">
                <ArrowDown className="size-3.5" />
                <span>Sort Descending</span>
              </span>
              {sortDirection === "desc" && <Check className="size-3.5" />}
            </button>
          </div>
        )}

        {/* Filter Options (when column has predefined filter choices) */}
        {filterConfig && filterConfig.options.length > 0 && (
          <div className="space-y-0.5 pt-1.5 border-t border-slate-100 max-h-48 overflow-y-auto">
            <div className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Filter
            </div>
            <button
              type="button"
              onClick={() => {
                onFilterChange("ALL");
                setOpen(false);
              }}
              className={cn(
                "w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-colors cursor-pointer",
                !hasFilter
                  ? "bg-blue-50 text-[#115eff] font-semibold"
                  : "text-slate-700 hover:bg-slate-50 font-medium"
              )}
            >
              <span>All</span>
              {!hasFilter && <Check className="size-3.5" />}
            </button>
            {filterConfig.options.map((opt) => {
              const selected = filterValue === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onFilterChange(opt.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-colors cursor-pointer",
                    selected
                      ? "bg-blue-50 text-[#115eff] font-semibold"
                      : "text-slate-700 hover:bg-slate-50 font-medium"
                  )}
                >
                  <span className="truncate">{opt.label}</span>
                  {selected && <Check className="size-3.5 shrink-0" />}
                </button>
              );
            })}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
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
  const [columnSearches, setColumnSearches] = useState<Record<string, string>>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [searchOpen, setSearchOpen] = useState(false);
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

      for (const [colId, query] of Object.entries(columnSearches)) {
        const needle = query.trim().toLowerCase();
        if (needle) {
          const haystack = formatCellSearchText(record, colId).toLowerCase();
          if (!haystack.includes(needle)) {
            return false;
          }
        }
      }

      return true;
    });
  }, [data, columnFilters, columnSearches]);

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

  const columnTitleMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const col of table.getAllLeafColumns()) {
      if (typeof col.columnDef.header === "string") {
        map.set(col.id, col.columnDef.header);
      }
    }
    return map;
  }, [table]);

  const activeSort = sorting[0] || null;

  const selectedRows = table
    .getSelectedRowModel()
    .rows.map((row) => row.original);

  const clearSelection = () => setRowSelection({});

  const activeFilterEntries = Object.entries(columnFilters).filter(
    ([, v]) => v && v !== "ALL"
  );
  const activeSearchEntries = Object.entries(columnSearches).filter(
    ([, v]) => v.trim().length > 0
  );
  const hasActiveFilters =
    Boolean(globalFilter.trim()) ||
    Boolean(activeSort) ||
    activeFilterEntries.length > 0 ||
    activeSearchEntries.length > 0;

  const clearAll = () => {
    setGlobalFilter("");
    setColumnFilters({});
    setColumnSearches({});
    setSorting([]);
  };

  return (
    <div className="font-sans">
      <div className="relative bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        {/* ── Unified Toolbar ── */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 border-b border-slate-200 bg-white">
          <div className="flex flex-wrap items-center gap-2 min-w-0">
            {toolbarLeft}

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

            {activeSort && (
              <span className="inline-flex items-center gap-1 h-7 pl-2.5 pr-1.5 rounded-md bg-blue-50 border border-blue-200 text-xs font-medium text-[#004776]">
                {activeSort.desc ? (
                  <ArrowDown className="size-3 text-[#115eff]" />
                ) : (
                  <ArrowUp className="size-3 text-[#115eff]" />
                )}
                <span>{columnTitleMap.get(activeSort.id) || activeSort.id}</span>
                <button
                  type="button"
                  onClick={() => setSorting([])}
                  className="p-0.5 rounded hover:bg-blue-100 text-slate-500 hover:text-slate-800 cursor-pointer"
                  aria-label="Clear sort"
                >
                  <X className="size-3" />
                </button>
              </span>
            )}

            {activeSearchEntries.map(([colId, q]) => (
              <span
                key={`search-${colId}`}
                className="inline-flex items-center gap-1 h-7 pl-2.5 pr-1.5 rounded-md bg-blue-50 border border-blue-200 text-xs font-medium text-[#004776]"
              >
                <span className="text-slate-400">
                  {columnTitleMap.get(colId) || colId}:
                </span>
                <span className="max-w-[120px] truncate">{q.trim()}</span>
                <button
                  type="button"
                  onClick={() =>
                    setColumnSearches((prev) => ({ ...prev, [colId]: "" }))
                  }
                  className="p-0.5 rounded hover:bg-blue-100 text-slate-500 hover:text-slate-800 cursor-pointer"
                  aria-label={`Clear ${colId} search`}
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}

            {activeFilterEntries.map(([key, val]) => {
              const fc = filterMap.get(key.toLowerCase());
              const optLabel =
                fc?.options.find((o) => o.value === val)?.label || val;
              return (
                <span
                  key={`filter-${key}`}
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
                onClick={clearAll}
                className="text-xs font-medium text-slate-500 hover:text-[#115eff] px-1.5 py-1 rounded transition-colors cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {selectedRows.length > 0 && batchActions && (
              <div className="flex items-center gap-2 bg-blue-50/70 px-2.5 h-9 rounded-lg border border-blue-200 mr-1">
                <span className="text-xs font-semibold text-[#004776]">
                  {selectedRows.length} selected
                </span>
                {batchActions(selectedRows, clearSelection)}
              </div>
            )}

            {/* Global Search Icon Popover */}
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

            {toolbarRight}
          </div>
        </div>

        {/* ── Table with Per-Column Single Button (Search + Filter + Sort Popover) ── */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/90 border-b border-slate-200">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="hover:bg-transparent"
                >
                  {headerGroup.headers.map((header) => {
                    const colId = header.column.id;
                    const align = resolveAlign(colId, header.column.columnDef);
                    const headerClassName = (
                      header.column.columnDef.meta as
                        | { headerClassName?: string }
                        | undefined
                    )?.headerClassName;

                    const isInteractiveColumn =
                      typeof header.column.columnDef.header === "string" &&
                      !NON_INTERACTIVE_COLUMN_IDS.has(colId.toLowerCase());
                    const isStickyActions = colId.toLowerCase() === "actions";
                    const colFilter = filterMap.get(colId.toLowerCase());

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
                          isStickyActions &&
                            "sticky right-0 z-20 bg-slate-50 border-l border-slate-200/80 shadow-[-6px_0_10px_-6px_rgba(15,23,42,0.08)]",
                          headerClassName
                        )}
                        style={{
                          width:
                            header.getSize() !== 150
                              ? header.getSize()
                              : undefined,
                        }}
                      >
                        {header.isPlaceholder ? null : isInteractiveColumn ? (
                          <ColumnHeaderMenu
                            column={header.column}
                            title={String(header.column.columnDef.header)}
                            align={align}
                            canSort={header.column.getCanSort()}
                            sortDirection={header.column.getIsSorted()}
                            searchValue={columnSearches[colId] || ""}
                            onSearchChange={(val) =>
                              setColumnSearches((prev) => ({
                                ...prev,
                                [colId]: val,
                              }))
                            }
                            filterConfig={colFilter}
                            filterValue={
                              colFilter ? columnFilters[colFilter.id] || "ALL" : "ALL"
                            }
                            onFilterChange={(val) => {
                              if (!colFilter) return;
                              setColumnFilters((prev) => ({
                                ...prev,
                                [colFilter.id]: val,
                              }));
                            }}
                            onSortChange={(dir) => {
                              if (!dir) {
                                setSorting([]);
                              } else {
                                setSorting([{ id: colId, desc: dir === "desc" }]);
                              }
                            }}
                            onResetColumn={() => {
                              setColumnSearches((prev) => ({
                                ...prev,
                                [colId]: "",
                              }));
                              if (colFilter) {
                                setColumnFilters((prev) => ({
                                  ...prev,
                                  [colFilter.id]: "ALL",
                                }));
                              }
                              if (activeSort?.id === colId) {
                                setSorting([]);
                              }
                            }}
                          />
                        ) : (
                          flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )
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
                          onClick={clearAll}
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
                      "group/row transition-colors",
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
                      const isStickyActions =
                        cell.column.id.toLowerCase() === "actions";
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
                            isStickyActions &&
                              "sticky right-0 z-10 bg-white group-hover/row:bg-[#f4f8ff] border-l border-slate-100 shadow-[-6px_0_10px_-6px_rgba(15,23,42,0.08)] transition-colors",
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
