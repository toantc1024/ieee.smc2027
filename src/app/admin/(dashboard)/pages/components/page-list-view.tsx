"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  FolderTree,
  Table2,
  PanelsTopLeft,
  Trash2,
  Link2,
  Check,
  Search,
  X,
  ChevronDown,
  ChevronRight,
  Folder,
  FolderOpen,
  FileText,
  RotateCcw,
  ChevronsDownUp,
  ChevronsUpDown,
  MoreVertical,
  ExternalLink,
  Eye,
  EyeOff,
  Sliders,
  Layers,
  Calendar,
  CreditCard,
  Clock,
  MapPin,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ManagementPageHeader } from "@/components/ui/management-page-header";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { TemplateSelectionModal } from "./template-selection-modal";
import { buildPageTree, type PageTreeNode as HierarchyNode } from "@/modules/website-builder/utils/page-tree";
import { BulkActionBar } from "./bulk-action-bar";

export interface PageItem {
  id: string;
  slug: string;
  title: string;
  blocks: any[];
  content?: any;
  parentId?: string | null;
  parent?: any;
  children?: PageItem[];
  orderIndex: number;
  version: number;
  isPublished: boolean;
  is_published?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  templateId?: string | null;
  block_count?: number;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
}

type PageTreeNode = HierarchyNode<PageItem>;

export function PageListView() {
  const router = useRouter();
  const [pages, setPages] = useState<PageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [viewMode, setViewMode] = useState<"tree" | "table">("tree");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(["home"]));
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // Modals state
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [targetParentId, setTargetParentId] = useState<string | null>(null);
  const [deletePageTarget, setDeletePageTarget] = useState<PageItem | null>(null);

  // 300ms Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch pages from API
  const fetchPages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/pages?view=flat");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load pages");
      setPages(Array.isArray(data.pages) ? data.pages : []);
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch website pages");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  // Use explicit parents and the reference builder's ordered hierarchy.
  const treeData = useMemo(() => buildPageTree(pages), [pages]);

  // Auto-expand tree nodes matching search query
  useEffect(() => {
    if (!debouncedSearch.trim()) return;
    const q = debouncedSearch.toLowerCase().trim();
    const toExpand = new Set<string>();

    const checkNode = (node: PageTreeNode): boolean => {
      const selfMatch =
        node.title.toLowerCase().includes(q) || node.slug.toLowerCase().includes(q);
      let childMatch = false;
      for (const child of node.children) {
        if (checkNode(child)) childMatch = true;
      }
      if (selfMatch || childMatch) {
        toExpand.add(node.id);
        return true;
      }
      return false;
    };

    treeData.forEach(checkNode);
    setExpandedNodes((prev) => new Set([...prev, ...toExpand]));
  }, [debouncedSearch, treeData]);

  // Filtered flat pages for table view and active filtering
  const filteredPages = useMemo(() => {
    return pages.filter((page) => {
      if (statusFilter === "published" && !page.isPublished) return false;
      if (statusFilter === "draft" && page.isPublished) return false;
      if (debouncedSearch.trim()) {
        const q = debouncedSearch.toLowerCase().trim();
        return (
          page.title.toLowerCase().includes(q) ||
          page.slug.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [pages, statusFilter, debouncedSearch]);

  const toggleExpandNode = (id: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleExpandAll = () => {
    const allIds = new Set<string>();
    const collect = (nodes: PageTreeNode[]) => {
      nodes.forEach((n) => {
        allIds.add(n.id);
        collect(n.children);
      });
    };
    collect(treeData);
    setExpandedNodes(allIds);
  };

  const handleCollapseAll = () => {
    setExpandedNodes(new Set());
  };

  const handleCopyLink = (slug: string) => {
    const url = `${window.location.origin}/${slug === "home" ? "" : slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    toast.success("Public page URL copied to clipboard");
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const handleSelectPage = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredPages.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredPages.map((p) => p.id));
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletePageTarget) return;
    const target = deletePageTarget;
    setDeletePageTarget(null);

    try {
      const res = await fetch(`/api/admin/pages/${target.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete page");
      toast.success("Page deleted successfully");
      fetchPages();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete page");
    }
  };

  // Keep ancestors visible when a descendant matches a search or status filter.
  const matchesTreeFilter = (node: PageTreeNode): boolean => {
    const q = debouncedSearch.toLowerCase().trim();
    const textMatch = !q || node.title.toLowerCase().includes(q) || node.slug.toLowerCase().includes(q);
    const statusMatch = statusFilter === "all" || (statusFilter === "published" ? node.isPublished : !node.isPublished);
    return (textMatch && statusMatch) || node.children.some(matchesTreeFilter);
  };

  const renderTreeNode = (node: PageTreeNode, isLast = true, ancestorHasNext: boolean[] = []) => {
    const filterActive = Boolean(debouncedSearch.trim()) || statusFilter !== "all";
    const isExpanded = expandedNodes.has(node.id) || filterActive;
    const isSelected = selectedIds.includes(node.id);
    const isHome = node.slug === "home";
    if (!matchesTreeFilter(node)) return null;

    return (
      <div key={node.id} className="select-none">
        <div
          className={cn(
            "group flex min-h-12 items-stretch gap-2 px-3 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0",
            isSelected && "bg-blue-50/60"
          )}
        >
          {/* Checkbox */}
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => handleSelectPage(node.id)}
            aria-label={`Select ${node.title}`}
            className="my-auto w-4 h-4 shrink-0 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
          />

          {/* HCMUTE's square branch guides keep every hierarchy level aligned. */}
          {Array.from({ length: node.depth }, (_, index) => {
            const currentBranch = index === node.depth - 1;
            return <div key={index} className="relative w-5 self-stretch shrink-0" aria-hidden="true">
              {(currentBranch || ancestorHasNext[index]) && <span className={cn("absolute left-1/2 top-0 w-px bg-slate-300", currentBranch && isLast ? "h-1/2" : "h-full")} />}
              {currentBranch && <span className="absolute left-1/2 right-0 top-1/2 h-px bg-slate-300" />}
            </div>;
          })}

          {/* Expand/Collapse Chevron */}
          {node.hasChildren ? (
            <button
              type="button"
              onClick={() => toggleExpandNode(node.id)}
              aria-label={`${isExpanded ? "Collapse" : "Expand"} ${node.title}`}
              aria-expanded={isExpanded}
              className="my-auto w-5 h-5 shrink-0 flex items-center justify-center rounded text-blue-600 hover:bg-blue-50"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          ) : (
            <div className="my-auto w-5 h-5 shrink-0" />
          )}

          {/* Folder / File Icon */}
          <div className={cn("my-auto flex size-7 shrink-0 items-center justify-center rounded-md border", node.depth === 0 ? "bg-blue-600 border-blue-600 text-white" : "bg-blue-50 border-blue-200 text-blue-600")}>
            {node.hasChildren ? (
              isExpanded ? (
                <FolderOpen className="w-4 h-4" />
              ) : (
                <Folder className="w-4 h-4" />
              )
            ) : (
              <FileText className="w-4 h-4" />
            )}
          </div>

          {/* Page Title & Slug */}
          <div className="my-auto flex-1 min-w-0 flex items-center gap-2.5">
            <Link
              href={`/admin/pages/${node.id}`}
              className="text-sm font-medium text-slate-900 hover:text-blue-600 truncate"
            >
              {node.title}
            </Link>
            <span className="text-xs text-slate-400 font-mono bg-slate-100 px-1.5 py-0.5 rounded shrink-0">
              /{node.slug}
            </span>
            {isHome && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 shrink-0">
                Home
              </span>
            )}
          </div>

          {/* Metadata badges */}
          <div className="my-auto flex items-center gap-3 shrink-0">
            <span className="text-xs text-slate-400">
              {node.block_count || (Array.isArray(node.blocks) ? node.blocks.length : 0)} sections
            </span>

            <span className="text-xs text-slate-400">v{node.version || 1}</span>

            <span
              className={cn(
                "text-[11px] font-medium px-2 py-0.5 rounded-full",
                node.isPublished
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-slate-100 text-slate-600 border border-slate-200"
              )}
            >
              {node.isPublished ? "Published" : "Draft"}
            </span>

            {/* Quick Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                onClick={() => router.push(`/admin/pages/${node.id}`)}
                title="Edit in Visual Studio"
              >
                <PanelsTopLeft className="w-3.5 h-3.5" />
              </Button>

              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 text-slate-500 hover:text-slate-900"
                onClick={() => handleCopyLink(node.slug)}
                title="Copy public link"
              >
                {copiedSlug === node.slug ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Link2 className="w-3.5 h-3.5" />
                )}
              </Button>

              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 text-slate-500 hover:text-slate-900"
                onClick={() => {
                  setTargetParentId(node.id);
                  setTemplateModalOpen(true);
                }}
                title="Add sub-page"
              >
                <Plus className="w-3.5 h-3.5" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-slate-500 hover:text-slate-900"
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem
                    onClick={() => router.push(`/admin/pages/${node.id}`)}
                  >
                    <PanelsTopLeft className="w-4 h-4 mr-2" />
                    Visual Studio
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      window.open(`/${node.slug === "home" ? "" : node.slug}`, "_blank")
                    }
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Live Page
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleCopyLink(node.slug)}>
                    <Link2 className="w-4 h-4 mr-2" />
                    Copy Page URL
                  </DropdownMenuItem>
                  {!isHome && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-rose-600 focus:text-rose-600 focus:bg-rose-50"
                        onClick={() => setDeletePageTarget(node)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Page
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Children Subtree */}
        {node.hasChildren && isExpanded && (
          <div className="relative">
            {node.children.filter(matchesTreeFilter).map((child, index, siblings) => renderTreeNode(child, index === siblings.length - 1, [...ancestorHasNext, !isLast]))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Management Header */}
      <ManagementPageHeader
        title="Page Management"
        description="Design and manage conference pages, navigation hierarchies, and content sections for IEEE SMC 2027."
        image3d="/assets/3d-icons/website-pages__hcmute-3d-icon.png"
        backgroundImage="/assets/manage-website-bg.jpg"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchPages}
              disabled={loading}
              className="gap-1.5 text-xs text-slate-600"
            >
              <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
              Refresh
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setTargetParentId(null);
                setTemplateModalOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow-sm text-xs"
            >
              <Plus className="w-4 h-4" />
              New Page
            </Button>
          </div>
        }
      />

      {/* Control Bar: Search, Filters, View Modes */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-white border border-slate-200 shadow-sm">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search pages by title or slug..."
            className="w-full pl-9 pr-8 py-1.5 text-sm rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 transition-all placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="w-5 h-5 absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center justify-center text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Chips & View Mode Switcher */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          {/* Status Filter */}
          <div className="flex items-center p-0.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-medium text-slate-600">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={cn(
                "px-2.5 py-1 rounded-md transition-all",
                statusFilter === "all" ? "bg-white text-slate-900 shadow-sm" : "hover:text-slate-900"
              )}
            >
              All ({pages.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("published")}
              className={cn(
                "px-2.5 py-1 rounded-md transition-all",
                statusFilter === "published" ? "bg-white text-slate-900 shadow-sm" : "hover:text-slate-900"
              )}
            >
              Published
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("draft")}
              className={cn(
                "px-2.5 py-1 rounded-md transition-all",
                statusFilter === "draft" ? "bg-white text-slate-900 shadow-sm" : "hover:text-slate-900"
              )}
            >
              Draft
            </button>
          </div>

          {/* Expand/Collapse All (Tree mode only) */}
          {viewMode === "tree" && (
            <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExpandAll}
                className="h-7 px-2 text-xs text-slate-600 hover:text-slate-900"
                title="Expand All"
              >
                <ChevronsUpDown className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCollapseAll}
                className="h-7 px-2 text-xs text-slate-600 hover:text-slate-900"
                title="Collapse All"
              >
                <ChevronsDownUp className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}

          {/* View Mode Toggle */}
          <div className="flex items-center p-0.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-600">
            <button
              type="button"
              onClick={() => setViewMode("tree")}
              className={cn(
                "p-1 rounded-md transition-all",
                viewMode === "tree" ? "bg-white text-blue-600 shadow-sm" : "hover:text-slate-900"
              )}
              title="Folder Tree View"
            >
              <FolderTree className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={cn(
                "p-1 rounded-md transition-all",
                viewMode === "table" ? "bg-white text-blue-600 shadow-sm" : "hover:text-slate-900"
              )}
              title="Table View"
            >
              <Table2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Pages Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-9 w-full rounded-lg" />
            <Skeleton className="h-9 w-full rounded-lg" />
            <Skeleton className="h-9 w-full rounded-lg" />
            <Skeleton className="h-9 w-full rounded-lg" />
          </div>
        ) : filteredPages.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <FolderTree className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">No pages found</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              {searchQuery
                ? `No pages match '${searchQuery}'. Try searching with different keywords.`
                : "No conference pages exist yet. Create your first conference page from a preset."}
            </p>
            {!searchQuery && (
              <Button
                size="sm"
                onClick={() => setTemplateModalOpen(true)}
                className="mt-2 bg-blue-600 text-white hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Create First Page
              </Button>
            )}
          </div>
        ) : viewMode === "tree" ? (
          <div className="overflow-x-auto">
            <div className="min-w-[640px]">
              {treeData.filter(matchesTreeFilter).map((node, index, siblings) => renderTreeNode(node, index === siblings.length - 1))}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200/75 text-xs font-semibold text-slate-500">
                <tr>
                  <th className="py-3 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={
                        filteredPages.length > 0 &&
                        selectedIds.length === filteredPages.length
                      }
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded border-slate-200/85 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-4">Page Title & Slug</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Sections</th>
                  <th className="py-3 px-4">Version</th>
                  <th className="py-3 px-4">Last Updated</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPages.map((page) => {
                  const isSelected = selectedIds.includes(page.id);
                  const isHome = page.slug === "home";
                  const blockCount =
                    page.block_count ||
                    (Array.isArray(page.blocks) ? page.blocks.length : 0);
                  const updatedStr = page.updatedAt || page.updated_at;

                  return (
                    <tr
                      key={page.id}
                      className={cn(
                        "hover:bg-slate-50/70 transition-colors",
                        isSelected && "bg-blue-50/50"
                      )}
                    >
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectPage(page.id)}
                          className="w-4 h-4 rounded border-slate-200/85 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/pages/${page.id}`}
                            className="font-medium text-slate-900 hover:text-blue-600 transition-colors"
                          >
                            {page.title}
                          </Link>
                          <span className="text-xs text-slate-400 font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                            /{page.slug}
                          </span>
                          {isHome && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                              Home
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={cn(
                            "text-xs font-medium px-2 py-0.5 rounded-full",
                            page.isPublished
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                          )}
                        >
                          {page.isPublished ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-500">
                        {blockCount} sections
                      </td>
                      <td className="py-3 px-4 text-xs font-mono text-slate-500">
                        v{page.version || 1}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-400">
                        {updatedStr ? new Date(updatedStr).toLocaleDateString() : "—"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                            onClick={() => router.push(`/admin/pages/${page.id}`)}
                            title="Edit in Visual Studio"
                          >
                            <PanelsTopLeft className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900"
                            onClick={() => handleCopyLink(page.slug)}
                            title="Copy URL"
                          >
                            {copiedSlug === page.slug ? (
                              <Check className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Link2 className="w-4 h-4" />
                            )}
                          </Button>
                          {!isHome && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                              onClick={() => setDeletePageTarget(page)}
                              title="Delete Page"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Floating Bulk Action Bar */}
      <BulkActionBar
        selectedIds={selectedIds}
        onClearSelection={() => setSelectedIds([])}
        onRefresh={fetchPages}
      />

      {/* Template Selection Modal */}
      <TemplateSelectionModal
        open={templateModalOpen}
        onOpenChange={setTemplateModalOpen}
        parentId={targetParentId}
        onPageCreated={() => fetchPages()}
      />

      {/* Single Page Delete Confirmation Dialog */}
      <AlertDialog
        open={Boolean(deletePageTarget)}
        onOpenChange={(open) => !open && setDeletePageTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-rose-600">
              <AlertTriangle className="w-5 h-5" />
              Delete Page '{deletePageTarget?.title}'?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this page? Any sub-pages will be re-parented to avoid broken links. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              Delete Page
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
