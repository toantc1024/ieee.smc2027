"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Layers,
  Plus,
  RefreshCw,
  ExternalLink,
  Trash2,
  SlidersHorizontal,
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  FileText,
  Search,
  CheckCircle2,
  Eye,
  CornerDownRight,
  FolderPlus,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ManagementPageHeader } from "@/components/ui/management-page-header";


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

export default function PagesManagementPage() {
  const [pages, setPages] = useState<PageSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [collapsedNodes, setCollapsedNodes] = useState<Record<string, boolean>>({});

  // Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [parentSlug, setParentSlug] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newSlugPart, setNewSlugPart] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchPages = () => {
    setLoading(true);
    fetch("/api/admin/pages")
      .then((res) => res.json())
      .then((res) => {
        if (res.pages) setPages(res.pages);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPages();
  }, []);

  // Build Hierarchical Tree from flat pages list
  const treeData = useMemo(() => {
    const nodeMap = new Map<string, TreeNode>();
    const rootNodes: TreeNode[] = [];

    // Sort by slug depth and name
    const sortedPages = [...pages].sort((a, b) => a.slug.localeCompare(b.slug));

    // First create a node for every page
    sortedPages.forEach((page) => {
      nodeMap.set(page.slug, { page, children: [], depth: 0 });
    });

    // Link children to their parent
    sortedPages.forEach((page) => {
      const node = nodeMap.get(page.slug)!;
      const parts = page.slug.split("/").filter(Boolean);

      if (parts.length > 1) {
        // Find closest ancestor
        const parentPath = parts.slice(0, -1).join("/");
        const parentNode = nodeMap.get(parentPath);
        if (parentNode) {
          node.depth = parentNode.depth + 1;
          parentNode.children.push(node);
          return;
        }
      }

      // If no parent found, this is a top-level root
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

  const expandAll = () => {
    setCollapsedNodes({});
  };

  const collapseAll = () => {
    const allCollapsed: Record<string, boolean> = {};
    pages.forEach((p) => {
      allCollapsed[p.slug] = true;
    });
    setCollapsedNodes(allCollapsed);
  };

  const openCreateSubPage = (parentPath: string) => {
    setParentSlug(parentPath === "home" ? "" : parentPath);
    setNewTitle("");
    setNewSlugPart("");
    setCreateModalOpen(true);
  };

  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const cleanSlugPart = (
      newSlugPart.trim() ||
      newTitle
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
    );

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
        setCreateModalOpen(false);
        setNewTitle("");
        setNewSlugPart("");
        setParentSlug("");
        fetchPages();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to create page");
      }
    } catch {
      alert("Server connection error");
    } finally {
      setCreating(false);
    }
  };

  const handleDeletePage = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      const res = await fetch(`/api/admin/pages/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchPages();
      } else {
        const err = await res.json();
        alert(err.error || "Unable to delete page");
      }
    } catch {
      alert("Failed to delete page");
    }
  };

  // Filter search
  const matchesSearch = (page: PageSummary) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return page.title.toLowerCase().includes(q) || page.slug.toLowerCase().includes(q);
  };

  // Render a Single Tree Node and its recursive children
  const renderTreeNode = (node: TreeNode) => {
    const { page, children, depth } = node;
    const isCollapsed = !!collapsedNodes[page.slug];
    const hasChildren = children.length > 0;
    const isRoot = depth === 0;

    if (searchQuery && !matchesSearch(page) && !children.some((c) => matchesSearch(c.page))) {
      return null;
    }

    return (
      <div key={page.id} className="group/item">
        {/* Node Row */}
        <div
          className={`flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-slate-100/80 transition-colors border border-transparent hover:border-slate-200 ${
            page.slug === "home" ? "bg-slate-50/70" : ""
          }`}
          style={{ paddingLeft: `${Math.max(12, depth * 28 + 12)}px` }}
        >
          {/* Left: Icon, Expand/Collapse, Title & Path */}
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Tree Branch line helper */}
            {depth > 0 && (
              <span className="text-slate-300 select-none font-mono text-xs">
                └─
              </span>
            )}

            {/* Collapse toggle or Leaf Icon */}
            {hasChildren ? (
              <button
                type="button"
                onClick={() => toggleNodeCollapse(page.slug)}
                className="p-1 hover:bg-slate-200 rounded text-slate-500 cursor-pointer"
                title={isCollapsed ? "Expand" : "Collapse"}
              >
                {isCollapsed ? (
                  <ChevronRight className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>
            ) : (
              <div className="w-5 flex items-center justify-center">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
              </div>
            )}

            {/* Folder or Page Icon */}
            {hasChildren ? (
              isCollapsed ? (
                <Folder className="w-4 h-4 text-amber-500 shrink-0" />
              ) : (
                <FolderOpen className="w-4 h-4 text-amber-600 shrink-0" />
              )
            ) : null}

            {/* Title & Route Link */}
            <div className="flex items-center gap-2 min-w-0 flex-wrap">
              <span className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
                {page.title}
              </span>

              <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200/80">
                /{page.slug === "home" ? "" : page.slug}
              </span>

              {isRoot && page.slug === "home" && (
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-blue-50 text-[#115eff]">
                  Homepage
                </span>
              )}

              {page.is_published ? (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 font-medium inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Published
                </span>
              ) : (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-500">
                  Draft
                </span>
              )}

              <span className="text-[11px] text-slate-400 hidden md:inline">
                {page.block_count || 0} components
              </span>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5 shrink-0 ml-3">
            {/* Add Sub-Page Button */}
            <button
              type="button"
              onClick={() => openCreateSubPage(page.slug)}
              className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded transition-colors cursor-pointer shadow-2xs"
              title="Add sub-page under this level"
            >
              <FolderPlus className="w-3 h-3 text-slate-500" />
              <span className="hidden sm:inline">Add Sub-page</span>
            </button>

            {/* Visual Builder */}
            <Link
              href={`/admin/pages/${page.id}`}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors shadow-2xs"
              title="Open visual page builder"
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span className="hidden sm:inline">Edit Builder</span>
            </Link>

            {/* Live Preview */}
            <Link
              href={page.slug === "home" ? "/" : `/${page.slug}`}
              target="_blank"
              className="p-1.5 text-slate-400 hover:text-slate-800 rounded hover:bg-slate-200/50 transition-colors"
              title="Preview live page"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            {/* Delete (Home protected) */}
            {page.slug !== "home" && (
              <button
                type="button"
                onClick={() => handleDeletePage(page.id, page.title)}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                title="Delete page"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Render Nested Children if not collapsed */}
        {hasChildren && !isCollapsed && (
          <div className="space-y-0.5 mt-0.5">
            {children.map((child) => renderTreeNode(child))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header */}
      <ManagementPageHeader
        title="Pages & Layouts"
        description="Hierarchical navigation tree and visual component page builder"
        actions={
          <button
            type="button"
            onClick={() => {
              setParentSlug("");
              setNewTitle("");
              setNewSlugPart("");
              setCreateModalOpen(true);
            }}
            className="h-8 inline-flex items-center gap-1.5 px-3.5 bg-[#115eff] hover:bg-[#0a4de6] text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer shadow-none"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Root Page</span>
          </button>
        }
      />

      {/* Main Tree Card */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        {/* Toolbar Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by page title or URL slug..."
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-md text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-800"
            />
          </div>

          {/* Tree Controls */}
          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={expandAll}
              className="px-2.5 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded border border-slate-200 bg-white transition-colors cursor-pointer"
            >
              Expand All
            </button>
            <button
              type="button"
              onClick={collapseAll}
              className="px-2.5 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded border border-slate-200 bg-white transition-colors cursor-pointer"
            >
              Collapse All
            </button>
            <button
              type="button"
              onClick={fetchPages}
              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 rounded border border-slate-200 bg-white transition-colors cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Tree Container */}
        <div className="p-4 sm:p-5">
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
                    <Skeleton className="h-6 w-20 rounded" />
                    <Skeleton className="h-6 w-20 rounded" />
                    <Skeleton className="size-6 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : treeData.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No pages initialized yet. Click &quot;New Root Page&quot; above to begin.
            </div>
          ) : (
            <div className="space-y-1">
              {treeData.map((rootNode) => renderTreeNode(rootNode))}
            </div>
          )}
        </div>

        {/* Tree Footer Info */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          <span>Total pages: <strong className="text-slate-800">{pages.length}</strong></span>
          <span className="text-[11px] text-slate-400">Supports multi-level nested hierarchy</span>
        </div>
      </div>

      {/* Create Page Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 animate-in fade-in duration-150">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              {parentSlug ? `Create Sub-Page Under "/${parentSlug}"` : "Create New Root Page"}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {parentSlug
                ? "The new page will inherit its URL path from the parent directory."
                : "Root pages appear directly under the primary domain."}
            </p>

            <form onSubmit={handleCreatePage} className="space-y-4 text-xs">
              {/* Parent Selector */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Parent Page
                </label>
                <select
                  value={parentSlug}
                  onChange={(e) => setParentSlug(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:border-slate-800 text-xs text-slate-800"
                >
                  <option value="">[None - Root Page]</option>
                  {pages.map((p) => (
                    <option key={p.id} value={p.slug}>
                      {p.title} (/{p.slug})
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
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
                  placeholder="e.g., Special Sessions"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:border-slate-800 text-xs text-slate-900"
                />
              </div>

              {/* Slug Path */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  URL Slug
                </label>
                <div className="flex items-center">
                  <span className="bg-slate-100 border border-r-0 border-slate-300 px-2.5 py-2 rounded-l-md text-slate-500 font-mono text-xs">
                    /{parentSlug ? `${parentSlug}/` : ""}
                  </span>
                  <input
                    type="text"
                    required
                    value={newSlugPart}
                    onChange={(e) => setNewSlugPart(e.target.value)}
                    placeholder="special-sessions"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-r-md focus:outline-none focus:border-slate-800 font-mono text-xs text-slate-900"
                  />
                </div>
              </div>

              {/* URL Preview */}
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-md text-[11px] text-slate-600">
                <span className="text-slate-400">Live URL: </span>
                <span className="font-mono text-slate-800 font-semibold">
                  https://ieee-smc2027.org/{parentSlug ? `${parentSlug}/` : ""}{newSlugPart || "slug"}
                </span>
              </div>

              {/* Modal Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-md transition-colors shadow-2xs disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Create Page"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
