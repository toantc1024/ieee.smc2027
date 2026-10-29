"use client";

import React, { useState } from "react";
import {
  ColumnDef,
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
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  FileQuestion,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

interface FilterOption {
  label: string;
  value: string;
}

interface FilterColumn {
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
  loading?: boolean;
}

export function DataTable<TData, TValue = unknown>({
  columns,
  data,
  searchPlaceholder = "Search...",
  filterColumns = [],
  batchActions,
  loading = false,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<{ [key: string]: string }>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const filteredData = React.useMemo(() => {
    return data.filter((item: any) => {
      // Check column filters
      for (const [key, value] of Object.entries(columnFilters)) {
        if (value && value !== "ALL") {
          const itemVal = item[key];
          if (String(itemVal).toLowerCase() !== value.toLowerCase()) {
            return false;
          }
        }
      }
      return true;
    });
  }, [data, columnFilters]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      globalFilter,
      rowSelection,
    },
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

  const hasActiveFilters =
    Boolean(globalFilter) ||
    Object.values(columnFilters).some((v) => v && v !== "ALL");

  const clearAllFilters = () => {
    setGlobalFilter("");
    setColumnFilters({});
  };

  return (
    <div className="space-y-3 font-sans">
      {/* ── Toolbar: Search & Faceted Filters ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Global search with shadcn Input */}
          <div className="relative min-w-[220px] max-w-xs w-full">
            <Search className="size-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              type="text"
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder={searchPlaceholder}
              className="h-9 pl-9 pr-7 text-xs bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:border-[#005496] focus:ring-1 focus:ring-[#005496]"
            />
            {globalFilter && (
              <button
                type="button"
                onClick={() => setGlobalFilter("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
              >
                <X className="size-3" />
              </button>
            )}
          </div>

          {/* Faceted column filters with shadcn Select */}
          {filterColumns.map((filter) => (
            <div key={filter.id} className="relative">
              <Select
                value={columnFilters[filter.id] || "ALL"}
                onValueChange={(val) =>
                  setColumnFilters((prev) => ({
                    ...prev,
                    [filter.id]: val,
                  }))
                }
              >
                <SelectTrigger className="h-9 min-w-[130px] w-auto rounded-xl">
                  <SelectValue placeholder={`${filter.title}: All`} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">{filter.title}: All</SelectItem>
                  {filter.options.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}

          {hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-9 px-2.5 text-xs text-slate-500 hover:text-slate-800 rounded-xl flex items-center gap-1.5"
            >
              <X className="size-3.5" />
              <span>Reset</span>
            </Button>
          )}
        </div>

        {/* Selected row count & batch action bar */}
        {selectedRows.length > 0 && batchActions && (
          <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100">
            <span className="text-xs font-semibold text-[#005496]">
              {selectedRows.length} selected
            </span>
            {batchActions(selectedRows, clearSelection)}
          </div>
        )}
      </div>

      {/* ── Table Container: Clean Shadow Skeleton ── */}
      <div
        className={cn(
          "relative bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all duration-300",
          loading
            ? "shadow-lg shadow-slate-200/90 ring-1 ring-[#005496]/15"
            : "shadow-xs"
        )}
      >
        {/* Animated accent shimmer progress bar when loading */}
        {loading && (
          <div className="absolute top-0 inset-x-0 h-[2.5px] bg-gradient-to-r from-transparent via-[#005496] to-transparent animate-pulse z-20" />
        )}

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/70 border-b border-slate-200">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="hover:bg-transparent border-b-0"
                >
                  {headerGroup.headers.map((header) => {
                    const canSort = header.column.getCanSort();
                    const sortDirection = header.column.getIsSorted();

                    return (
                      <TableHead
                        key={header.id}
                        className="text-center align-middle"
                        style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                      >
                        {header.isPlaceholder ? null : canSort ? (
                          <div
                            onClick={header.column.getToggleSortingHandler()}
                            className="flex items-center justify-center gap-1.5 cursor-pointer hover:text-slate-900 transition-colors group mx-auto text-center"
                          >
                            <span>
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                            </span>
                            <span className="text-slate-400 group-hover:text-slate-700">
                              {sortDirection === "asc" ? (
                                <ChevronUp className="size-3.5 text-[#005496]" />
                              ) : sortDirection === "desc" ? (
                                <ChevronDown className="size-3.5 text-[#005496]" />
                              ) : (
                                <ChevronsUpDown className="size-3 opacity-40 group-hover:opacity-100" />
                              )}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center text-center mx-auto">
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
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
                      className="border-b border-slate-100 hover:bg-transparent"
                    >
                      {columns.map((col, cIdx) => (
                        <TableCell key={`skeleton-cell-${rIdx}-${cIdx}`}>
                          <div
                            className={cn(
                              "h-3.5 bg-slate-200/70 rounded animate-pulse",
                              cIdx === 0
                                ? "w-4 h-4 rounded"
                                : cIdx === 1
                                ? "w-3/4"
                                : cIdx % 2 === 0
                                ? "w-1/2"
                                : "w-2/3"
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
                    className="py-16 text-center text-slate-400 border-r-0"
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
                          className="text-xs text-[#005496] hover:underline cursor-pointer"
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
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* ── Pagination Footer with shadcn Select & Button ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border-t border-slate-200 bg-slate-50/50 text-xs text-slate-500">
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

            {/* Page size selector with shadcn Select */}
            <div className="flex items-center gap-1.5">
              <span>Per page:</span>
              <Select
                value={String(table.getState().pagination.pageSize)}
                onValueChange={(val) => table.setPageSize(Number(val))}
              >
                <SelectTrigger className="h-7 w-[68px] px-2 text-xs bg-white border-slate-200">
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

          {/* Page navigation with shadcn Button */}
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
