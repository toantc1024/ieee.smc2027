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
  searchPlaceholder = "Tìm kiếm...",
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
          {/* Global search */}
          <div className="relative min-w-[220px] max-w-xs w-full">
            <Search className="size-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#005496] transition-all"
            />
            {globalFilter && (
              <button
                type="button"
                onClick={() => setGlobalFilter("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="size-3" />
              </button>
            )}
          </div>

          {/* Faceted column filters */}
          {filterColumns.map((filter) => (
            <div key={filter.id} className="relative">
              <select
                value={columnFilters[filter.id] || "ALL"}
                onChange={(e) =>
                  setColumnFilters((prev) => ({
                    ...prev,
                    [filter.id]: e.target.value,
                  }))
                }
                className="h-9 px-3 text-xs bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-[#005496] cursor-pointer transition-colors"
              >
                <option value="ALL">{filter.title}: Tất cả</option>
                {filter.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          ))}

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="h-9 px-2.5 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <X className="size-3.5" />
              <span>Xóa lọc</span>
            </button>
          )}
        </div>

        {/* Selected row count & batch action bar */}
        {selectedRows.length > 0 && batchActions && (
          <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
            <span className="text-xs font-semibold text-[#005496]">
              Đã chọn {selectedRows.length} mục
            </span>
            {batchActions(selectedRows, clearSelection)}
          </div>
        )}
      </div>

      {/* ── Table Container ── */}
      <div
        className={cn(
          "relative bg-white rounded-xl border border-slate-200 overflow-hidden transition-all duration-300",
          loading
            ? "shadow-lg shadow-slate-200/80 ring-1 ring-[#005496]/15"
            : "shadow-2xs"
        )}
      >
        {/* Animated accent shimmer progress bar when loading */}
        {loading && (
          <div className="absolute top-0 inset-x-0 h-[2.5px] bg-gradient-to-r from-transparent via-[#005496] to-transparent animate-pulse z-20" />
        )}

        {/* Floating loading shadow badge */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/45 backdrop-blur-[1px] z-10 pointer-events-none transition-all">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-white/95 border border-slate-200/90 rounded-full shadow-xl shadow-slate-300/40 text-xs font-semibold text-slate-700">
              <div className="size-3.5 border-2 border-[#005496] border-t-transparent rounded-full animate-spin" />
              <span>Đang tải dữ liệu...</span>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr
                  key={headerGroup.id}
                  className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-semibold text-[11px]"
                >
                  {headerGroup.headers.map((header) => {
                    const canSort = header.column.getCanSort();
                    const sortDirection = header.column.getIsSorted();

                    return (
                      <th
                        key={header.id}
                        className="py-3 px-3.5 select-none border-r border-slate-200/80 last:border-r-0"
                        style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                      >
                        {header.isPlaceholder ? null : canSort ? (
                          <div
                            onClick={header.column.getToggleSortingHandler()}
                            className="flex items-center gap-1.5 cursor-pointer hover:text-slate-900 transition-colors group"
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
                          flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )
                        )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>

            <tbody className="divide-y divide-slate-100 text-slate-800">
              {loading ? (
                <>
                  {Array.from({ length: 6 }).map((_, rIdx) => (
                    <tr
                      key={`skeleton-row-${rIdx}`}
                      className="border-b border-slate-100 last:border-b-0"
                    >
                      {columns.map((col, cIdx) => (
                        <td
                          key={`skeleton-cell-${rIdx}-${cIdx}`}
                          className="py-3.5 px-3.5 align-middle border-r border-slate-100 last:border-r-0"
                        >
                          <div
                            className={cn(
                              "h-3.5 bg-slate-200/60 rounded animate-pulse",
                              cIdx === 0
                                ? "w-4 h-4 rounded"
                                : cIdx === 1
                                ? "w-3/4"
                                : cIdx % 2 === 0
                                ? "w-1/2"
                                : "w-2/3"
                            )}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </>
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="py-16 text-center text-slate-400"
                  >
                    <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                      <FileQuestion className="size-8 text-slate-300 stroke-[1.5]" />
                      <p className="text-xs font-medium text-slate-600">
                        Không tìm thấy dữ liệu phù hợp
                      </p>
                      {hasActiveFilters && (
                        <button
                          type="button"
                          onClick={clearAllFilters}
                          className="text-xs text-[#005496] hover:underline cursor-pointer"
                        >
                          Xóa các bộ lọc hiện tại
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className={`transition-colors hover:bg-slate-50/80 ${
                      row.getIsSelected() ? "bg-blue-50/40" : ""
                    }`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="py-3 px-3.5 align-middle border-r border-slate-100 last:border-r-0"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination Footer ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border-t border-slate-200 bg-slate-50/50 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>
              Hiển thị{" "}
              <strong className="text-slate-800 font-semibold">
                {table.getState().pagination.pageIndex *
                  table.getState().pagination.pageSize +
                  (table.getRowModel().rows.length > 0 ? 1 : 0)}
              </strong>{" "}
              -{" "}
              <strong className="text-slate-800 font-semibold">
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) *
                    table.getState().pagination.pageSize,
                  table.getFilteredRowModel().rows.length
                )}
              </strong>{" "}
              trong tổng số{" "}
              <strong className="text-slate-800 font-semibold">
                {table.getFilteredRowModel().rows.length}
              </strong>{" "}
              mục
            </span>

            <span className="text-slate-300">|</span>

            {/* Page size selector */}
            <div className="flex items-center gap-1.5">
              <span>Mỗi trang:</span>
              <select
                value={table.getState().pagination.pageSize}
                onChange={(e) => table.setPageSize(Number(e.target.value))}
                className="h-7 px-2 text-xs bg-white border border-slate-200 rounded text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-[#005496] cursor-pointer"
              >
                {[10, 20, 50, 100].map((pageSize) => (
                  <option key={pageSize} value={pageSize}>
                    {pageSize}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Page navigation */}
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
              <span>Trước</span>
            </Button>

            <span className="px-2 text-xs font-medium text-slate-700">
              Trang {table.getState().pagination.pageIndex + 1} /{" "}
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
              <span>Sau</span>
              <ChevronRight className="size-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
