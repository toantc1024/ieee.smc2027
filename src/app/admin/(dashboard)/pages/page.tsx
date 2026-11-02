"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  FolderTree,
  Table2,
  PanelsTopLeft,
  Pencil,
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
  LayoutTemplate,
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface PageSummary {
  id: string;
  slug: string;
  title: string;
  is_published: boolean;
  block_count?: number;
  updated_at: string;
}

interface TreeNode {
  page: PageSummary;
  children: TreeNode[];
  depth: number;
}

type ViewMode = "tree" | "table";

export default function PagesManagementPage() {
  const router = useRouter();
  const [pages, setPages] = useState<PageSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>("tree");
  const [searchQuery, setSearchQuery] = useState("");
  const [collapsedNodes, setCollapsedNodes] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Create Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [parentSlug, setParentSlug] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newSlugPart, setNewSlugPart] = useState("");
  const [creating, setCreating] = useState(false);

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<PageSummary | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [updating, setUpdating] = useState(false);

  const fetchPages = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/pages")
      .then((res) => res.json())
      .then((res) => {
        if (res.pages) setPages(res.pages);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  // Build Hierarchical Tree from flat pages list
  const treeData = useMemo(() => {
    const nodeMap = new Map<string, TreeNode>();
    const rootNodes: TreeNode[] = [];

    const sortedPages = [...pages].sort((a, b) => a.slug.localeCompare(b.slug));

    sortedPages.forEach((page) => {
      nodeMap.set(page.slug, { page, children: [], depth: 0 });
    });

    sortedPages.forEach((page) => {
      const node = nodeMap.get(page.slug)!;
      const parts = page.slug.split("/").filter(Boolean);

      if (parts.length > 1) {
        const parentPath = parts.slice(0, -1).join("/");
        const parentNode = nodeMap.get(parentPath);
        if (parentNode) {
          node.depth = parentNode.depth + 1;
          parentNode.children.push(node);
          return;
        }
      }

      node.depth = 0;
      rootNodes.push(node);
    });

    return rootNodes;
  }, [pages]);

  const toggleNodeCollapse = (slug: string) => {
    setCollapsedNodes((prev) => ({
      ...prev,
      [slug]: !prev[slug],
    }));
  };

  const isAllTreeExpanded = useMemo(() => {
    if (pages.length === 0) return true;
    for (const p of pages) {
      if (collapsedNodes[p.slug]) return false;
    }
    return true;
  }, [pages, collapsedNodes]);

  const handleToggleAllTree = () => {
    if (isAllTreeExpanded) {
      const all: Record<string, boolean> = {};
      pages.forEach((p) => {
        all[p.slug] = true;
      });
      setCollapsedNodes(all);
    } else {
      setCollapsedNodes({});
    }
  };

  const handleCopyLink = (page: PageSummary) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const path = page.slug === "home" ? "/" : `/${page.slug}`;
    const fullUrl = `${origin}${path}`;
    if (navigator?.clipboard?.writeText) {
      void navigator.clipboard.writeText(fullUrl);
    }
    setCopiedId(page.id);
    toast.success("Copied page URL to clipboard");
    setTimeout(() => {
      setCopiedId((curr) => (curr === page.id ? null : curr));
    }, 2000);
  };

  const openCreateSubPage = (parentPath: string) => {
    setParentSlug(parentPath === "home" ? "" : parentPath);
    setNewTitle("");
    setNewSlugPart("");
    setCreateModalOpen(true);
  };

  const openEditModal = (page: PageSummary) => {
    setEditingPage(page);
    setEditTitle(page.title);
    setEditSlug(page.slug);
    setEditModalOpen(true);
  };

  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const cleanSlugPart =
      newSlugPart.trim() ||
      newTitle
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    const fullSlug = parentSlug ? `${parentSlug}/${cleanSlugPart}` : cleanSlugPart;

    setCreating(true);
    try {
      const res = await fetch("/api/admin/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          slug: fullSlug,
          blocks: [
            {
              id: `hero-${Date.now()}`,
              type: "HeroCarousel",
              props: {},
              hidden: false,
            },
            {
              id: `content-${Date.now()}`,
              type: "About",
              props: {},
              hidden: false,
            },
          ],
        }),
      });

      if (res.ok) {
        toast.success("Page created successfully");
        setCreateModalOpen(false);
        setNewTitle("");
        setNewSlugPart("");
        setParentSlug("");
        fetchPages();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to create page");
      }
    } catch {
      toast.error("Server connection error");
    } finally {
      setCreating(false);
    }
  };

  const handleUpdatePageInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPage || !editTitle.trim()) return;

    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/pages/${editingPage.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle.trim(),
          slug: editSlug.trim(),
        }),
      });

      if (res.ok) {
        toast.success("Page info updated");
        setEditModalOpen(false);
        fetchPages();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to update page");
      }
    } catch {
      toast.error("Failed to update page");
    } finally {
      setUpdating(false);
    }
  };

  const handleTogglePublish = async (page: PageSummary) => {
    const nextStatus = !page.is_published;
    try {
      const res = await fetch(`/api/admin/pages/${page.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          is_published: nextStatus,
        }),
      });
      if (res.ok) {
        toast.success(nextStatus ? "Page published" : "Page set to draft");
        fetchPages();
      } else {
        toast.error("Failed to update status");
      }
    } catch {
      toast.error("Network error");
    }
  };

  const handleDeletePage = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      const res = await fetch(`/api/admin/pages/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Page deleted successfully");
        fetchPages();
      } else {
        const err = await res.json();
        toast.error(err.error || "Unable to delete page");
      }
    } catch {
      toast.error("Failed to delete page");
    }
  };

  const matchesSearch = (page: PageSummary) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return page.title.toLowerCase().includes(q) || page.slug.toLowerCase().includes(q);
  };

  const filteredPages = useMemo(() => {
    return pages.filter(matchesSearch);
  }, [pages, searchQuery]);

  // Row Action Buttons: matching HCMUTE page-list-view.tsx
  const renderRowActions = (page: PageSummary) => {
    const isCopied = copiedId === page.id;
    return (
      <div className="flex shrink-0 items-center justify-end gap-1">
        {/* Primary Action: Design / Edit Builder */}
        <Button
          variant="default"
          size="sm"
          className="h-7 px-2.5 text-[11px] font-semibold bg-[#115eff] hover:bg-[#0a4de6] text-white gap-1 shadow-2xs rounded-lg transition-all active:scale-98 shrink-0 cursor-pointer"
          title="Open visual page builder"
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/admin/pages/${page.id}`);
          }}
        >
          <PanelsTopLeft className="size-3.5" />
          <span>Edit Builder</span>
        </Button>

        {/* Copy Link Button */}
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "size-7 rounded-lg shadow-2xs transition-all active:scale-98 shrink-0 border-slate-200/90 cursor-pointer",
            isCopied
              ? "bg-emerald-50 text-emerald-700 border-emerald-300"
              : "bg-white text-slate-500 hover:text-slate-900 hover:bg-slate-100"
          )}
          title={isCopied ? "Copied page URL" : "Copy page URL"}
          onClick={(e) => {
            e.stopPropagation();
            handleCopyLink(page);
          }}
        >
          {isCopied ? (
            <Check className="size-3.5 text-emerald-600" />
          ) : (
            <Link2 className="size-3.5" />
          )}
        </Button>

        {/* Add Sub-Page Button */}
        <Button
          variant="outline"
          size="icon"
          className="size-7 rounded-lg shadow-2xs border-slate-200/90 bg-white text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all active:scale-98 shrink-0 cursor-pointer"
          title="Add sub-page under this item"
          onClick={(e) => {
            e.stopPropagation();
            openCreateSubPage(page.slug);
          }}
        >
          <Plus className="size-3.5" />
        </Button>

        {/* Edit Page Info */}
        <Button
          variant="outline"
          size="icon"
          className="size-7 rounded-lg shadow-2xs border-slate-200/90 bg-white text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all active:scale-98 shrink-0 cursor-pointer"
          title="Edit page information"
          onClick={(e) => {
            e.stopPropagation();
            openEditModal(page);
          }}
        >
          <Pencil className="size-3.5" />
        </Button>

        {/* Lifecycle Actions Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="size-7 rounded-lg shadow-2xs border-slate-200/90 bg-white text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all active:scale-98 shrink-0 cursor-pointer"
              title="More actions"
            >
              <MoreVertical className="size-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 text-xs font-sans">
            <DropdownMenuItem asChild>
              <Link
                href={page.slug === "home" ? "/" : `/${page.slug}`}
                target="_blank"
                className="cursor-pointer"
              >
                <ExternalLink className="size-3.5 mr-2 text-slate-500" />
                Live Preview
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleTogglePublish(page)}
              className="cursor-pointer"
            >
              {page.is_published ? (
                <>
                  <EyeOff className="size-3.5 mr-2 text-amber-500" />
                  Set to Draft
                </>
              ) : (
                <>
                  <Eye className="size-3.5 mr-2 text-emerald-500" />
                  Publish Page
                </>
              )}
            </DropdownMenuItem>
            {page.slug !== "home" && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleDeletePage(page.id, page.title)}
                  className="cursor-pointer text-rose-600 focus:text-rose-700 focus:bg-rose-50"
                >
                  <Trash2 className="size-3.5 mr-2 text-rose-500" />
                  Delete Page
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  };

  // Render a Single Tree Node and its recursive children
  const renderTreeNode = (node: TreeNode) => {
    const { page, children, depth } = node;
    const isCollapsed = Boolean(collapsedNodes[page.slug]);
    const hasChildren = children.length > 0;
    const isRoot = depth === 0;

    if (searchQuery && !matchesSearch(page) && !children.some((c) => matchesSearch(c.page))) {
      return null;
    }

    return (
      <div key={page.id} className="group/item">
        <div
          className={cn(
            "flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-100/90 transition-colors border border-transparent hover:border-slate-200/80 gap-3",
            page.slug === "home" && "bg-slate-50/70"
          )}
          style={{ paddingLeft: `${Math.max(12, depth * 26 + 12)}px` }}
        >
          {/* Left: Branch Indicator, Folder/File Icon, Title & Route */}
          <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
            {depth > 0 && (
              <span className="text-slate-300 select-none font-mono text-xs shrink-0">
                └─
              </span>
            )}

            {hasChildren ? (
              <button
                type="button"
                onClick={() => toggleNodeCollapse(page.slug)}
                className="p-1 hover:bg-slate-200 rounded text-slate-500 cursor-pointer shrink-0"
                title={isCollapsed ? "Expand branch" : "Collapse branch"}
              >
                {isCollapsed ? (
                  <ChevronRight className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>
            ) : (
              <div className="w-5 flex items-center justify-center shrink-0">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
              </div>
            )}

            {hasChildren ? (
              isCollapsed ? (
                <Folder className="w-4 h-4 text-amber-500 shrink-0" />
              ) : (
                <FolderOpen className="w-4 h-4 text-amber-600 shrink-0" />
              )
            ) : null}

            <div className="flex items-center gap-2 min-w-0 flex-wrap">
              <span className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
                {page.title}
              </span>

              <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200/80">
                /{page.slug === "home" ? "" : page.slug}
              </span>

              {isRoot && page.slug === "home" && (
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-blue-50 text-[#115eff] border border-blue-100">
                  Homepage
                </span>
              )}

              {/* Status Badge: matching HCMUTE enum badge */}
              {page.is_published ? (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border bg-emerald-50 text-emerald-700 border-emerald-200 shadow-2xs">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Published
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border bg-slate-100 text-slate-600 border-slate-200">
                  <span className="size-1.5 rounded-full bg-slate-400" />
                  Draft
                </span>
              )}

              <span className="text-[11px] text-slate-400 hidden md:inline">
                {page.block_count || 0} components
              </span>
            </div>
          </div>

          {/* Right: Actions */}
          {renderRowActions(page)}
        </div>

        {/* Nested Children */}
        {hasChildren && !isCollapsed && (
          <div className="space-y-0.5 mt-0.5">
            {children.map((child) => renderTreeNode(child))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Top Header */}
      <ManagementPageHeader
        title="Pages & Layouts"
        description="Hierarchical navigation tree and visual component page builder"
        actions={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                data-tour="create-page-btn"
                className="h-8 gap-1.5 bg-[#115eff] hover:bg-[#0a4de6] text-white text-xs font-semibold rounded-lg shadow-2xs cursor-pointer"
              >
                <Plus className="size-3.5" />
                <span>Create Page</span>
                <ChevronDown className="size-3.5 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 text-xs font-sans">
              <DropdownMenuItem
                onClick={() => {
                  setParentSlug("");
                  setNewTitle("");
                  setNewSlugPart("");
                  setCreateModalOpen(true);
                }}
                className="cursor-pointer"
              >
                <Plus className="size-4 mr-2 text-[#115eff]" />
                Blank Page
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setParentSlug("");
                  setNewTitle("New Conference Section");
                  setNewSlugPart("");
                  setCreateModalOpen(true);
                }}
                className="cursor-pointer"
              >
                <LayoutTemplate className="size-4 mr-2 text-teal-600" />
                From Template
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />

      {/* Main Container Card */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        {/* Toolbar Header (Matching HCMUTE shared toolbar) */}
        <div className="p-3 border-b border-slate-200 bg-slate-50/60 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
            {/* View Mode Segmented Switcher */}
            <div className="flex items-center gap-0.5 rounded-lg border border-slate-200 bg-slate-100 p-0.5 shadow-2xs">
              <Button
                variant={view === "tree" ? "secondary" : "ghost"}
                size="sm"
                className={cn(
                  "h-7 gap-1.5 px-2.5 text-xs font-semibold rounded-md transition-all cursor-pointer",
                  view === "tree"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                )}
                onClick={() => setView("tree")}
              >
                <FolderTree className="size-3.5" />
                Tree
              </Button>
              <Button
                variant={view === "table" ? "secondary" : "ghost"}
                size="sm"
                className={cn(
                  "h-7 gap-1.5 px-2.5 text-xs font-semibold rounded-md transition-all cursor-pointer",
                  view === "table"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                )}
                onClick={() => setView("table")}
              >
                <Table2 className="size-3.5" />
                Table
              </Button>
            </div>

            {/* Search Box */}
            <div className="relative w-full max-w-[280px]">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search pages or slug..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 pl-8 pr-7 text-xs w-full bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-800 shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Expand / Collapse All Toggle Button */}
            {view === "tree" && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleAllTree}
                className="h-8 gap-1.5 px-2.5 text-xs border-slate-200 bg-white text-slate-700 hover:bg-slate-100 rounded-lg shadow-2xs cursor-pointer"
                title={isAllTreeExpanded ? "Collapse all tree nodes" : "Expand all tree nodes"}
              >
                {isAllTreeExpanded ? (
                  <>
                    <ChevronsDownUp className="size-3.5 text-slate-500" />
                    <span>Collapse All</span>
                  </>
                ) : (
                  <>
                    <ChevronsUpDown className="size-3.5 text-slate-500" />
                    <span>Expand All</span>
                  </>
                )}
              </Button>
            )}

            {/* Refresh Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={fetchPages}
              className="size-8 border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg shadow-2xs cursor-pointer"
              title="Refresh list"
            >
              <RotateCcw className="size-3.5" />
            </Button>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Total pages: <strong className="text-slate-900">{pages.length}</strong>
          </div>
        </div>

        {/* Content View: Tree or Table */}
        <div className="p-3 sm:p-4">
          {loading ? (
            <div className="space-y-2 py-1">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={`skeleton-tree-${idx}`}
                  className="flex items-center justify-between py-2.5 px-3 rounded-lg border border-slate-100 bg-slate-50/50"
                  style={{ paddingLeft: `${idx % 2 === 0 ? 12 : 36}px` }}
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-4 rounded" />
                    <Skeleton className="h-4 w-44 rounded" />
                    <Skeleton className="h-3.5 w-24 rounded" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-7 w-20 rounded-lg" />
                    <Skeleton className="size-7 rounded-lg" />
                    <Skeleton className="size-7 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : view === "tree" ? (
            treeData.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                No pages found. Click &quot;Create Page&quot; above to begin.
              </div>
            ) : (
              <div className="space-y-1">
                {treeData.map((rootNode) => renderTreeNode(rootNode))}
              </div>
            )
          ) : (
            /* Table View */
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Page &amp; Route</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Components</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPages.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400">
                        No pages match your search query.
                      </td>
                    </tr>
                  ) : (
                    filteredPages.map((page) => (
                      <tr
                        key={page.id}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <FileText className="size-4 text-slate-400 shrink-0" />
                            <div>
                              <span className="font-semibold text-slate-900 block">
                                {page.title}
                              </span>
                              <span className="font-mono text-[11px] text-slate-500">
                                /{page.slug === "home" ? "" : page.slug}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          {page.is_published ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border bg-emerald-50 text-emerald-700 border-emerald-200">
                              <span className="size-1.5 rounded-full bg-emerald-500" />
                              Published
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border bg-slate-100 text-slate-600 border-slate-200">
                              <span className="size-1.5 rounded-full bg-slate-400" />
                              Draft
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500">
                          {page.block_count || 0} blocks
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          {renderRowActions(page)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Tree Footer */}
        <div className="px-4 py-2.5 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          <span>
            Displaying <strong className="text-slate-800">{filteredPages.length}</strong> pages
          </span>
          <span className="text-[11px] text-slate-400">
            Multi-level routing and live visual block editor enabled
          </span>
        </div>
      </div>

      {/* Create Page Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="max-w-md font-sans p-6 rounded-xl border border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              {parentSlug ? `Create Sub-Page Under "/${parentSlug}"` : "Create New Page"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              {parentSlug
                ? "The new page will inherit its URL hierarchy from the parent directory."
                : "Top-level pages appear directly under the main conference domain."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreatePage} className="space-y-3.5 text-xs mt-2">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Parent Page
              </label>
              <select
                value={parentSlug}
                onChange={(e) => setParentSlug(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#115eff] text-xs text-slate-800 shadow-2xs"
              >
                <option value="">[None - Root Page]</option>
                {pages.map((p) => (
                  <option key={p.id} value={p.slug}>
                    {p.title} (/{p.slug})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Page Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => {
                  setNewTitle(e.target.value);
                  if (!newSlugPart) {
                    setNewSlugPart(
                      e.target.value
                        .toLowerCase()
                        .normalize("NFD")
                        .replace(/[\u0300-\u036f]/g, "")
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/^-+|-+$/g, "")
                    );
                  }
                }}
                placeholder="e.g., Special Sessions & Tutorials"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#115eff] text-xs text-slate-900 shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                URL Slug
              </label>
              <div className="flex items-center">
                <span className="bg-slate-100 border border-r-0 border-slate-300 px-2.5 py-2 rounded-l-lg text-slate-500 font-mono text-xs">
                  /{parentSlug ? `${parentSlug}/` : ""}
                </span>
                <input
                  type="text"
                  required
                  value={newSlugPart}
                  onChange={(e) => setNewSlugPart(e.target.value)}
                  placeholder="special-sessions"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-r-lg focus:outline-none focus:border-[#115eff] font-mono text-xs text-slate-900 shadow-2xs"
                />
              </div>
            </div>

            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600">
              <span className="text-slate-400">Live URL: </span>
              <span className="font-mono text-slate-800 font-semibold">
                https://ieee-smc2027.org/{parentSlug ? `${parentSlug}/` : ""}{newSlugPart || "slug"}
              </span>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="px-4 py-1.5 bg-[#115eff] hover:bg-[#0a4de6] text-white font-semibold rounded-lg transition-colors shadow-2xs disabled:opacity-50 cursor-pointer"
              >
                {creating ? "Creating..." : "Create Page"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Page Info Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-md font-sans p-6 rounded-xl border border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              Edit Page Info: {editingPage?.title}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Update the page title and route slug.
            </DialogDescription>
          </DialogHeader>

          {editingPage && (
            <form onSubmit={handleUpdatePageInfo} className="space-y-3.5 text-xs mt-2">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Page Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#115eff] text-xs text-slate-900 shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  URL Slug
                </label>
                <div className="flex items-center">
                  <span className="bg-slate-100 border border-r-0 border-slate-300 px-2.5 py-2 rounded-l-lg text-slate-500 font-mono text-xs">
                    /
                  </span>
                  <input
                    type="text"
                    required
                    disabled={editingPage.slug === "home"}
                    value={editSlug}
                    onChange={(e) => setEditSlug(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-r-lg focus:outline-none focus:border-[#115eff] font-mono text-xs text-slate-900 shadow-2xs disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-1.5 bg-[#115eff] hover:bg-[#0a4de6] text-white font-semibold rounded-lg transition-colors shadow-2xs disabled:opacity-50 cursor-pointer"
                >
                  {updating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
