"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  FileText,
  Globe,
  Search,
  Plus,
  ExternalLink,
  Check,
  Newspaper,
  Loader2,
  FolderOpen,
  ArrowUpRight,
  Hash,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export interface PageLinkSelection {
  href: string;
  label?: string;
  isExternal?: boolean;
}

interface CmsPageItem {
  id: string;
  title: string;
  slug: string;
  isPublished?: boolean;
  updatedAt?: string;
}

interface CmsPostItem {
  id: string;
  title: string;
  slug: string;
  category?: string;
  publishedAt?: string;
}

interface StandardRouteItem {
  title: string;
  href: string;
  category: string;
}

const STANDARD_CONFERENCE_ROUTES: StandardRouteItem[] = [
  { title: "Home", href: "/", category: "Core" },
  { title: "About IEEE SMC 2027", href: "/#about", category: "Section" },
  { title: "Call for Papers", href: "/#cfp", category: "Section" },
  { title: "Important Dates", href: "/#dates", category: "Section" },
  { title: "Technical Tracks & Topics", href: "/#tracks", category: "Section" },
  { title: "Keynote Speakers", href: "/#keynotes", category: "Section" },
  { title: "Venue & Travel Info", href: "/#venue", category: "Section" },
  { title: "Latest Conference News", href: "/#news", category: "Section" },
  { title: "Sponsors & Exhibition", href: "/#sponsors", category: "Section" },
  { title: "Committees", href: "/committees", category: "Page" },
  { title: "Paper Submissions", href: "/submissions", category: "Page" },
  { title: "Program & Sessions", href: "/program/sessions", category: "Page" },
  { title: "Travel & Ho Chi Minh City", href: "/travel", category: "Page" },
  { title: "News & Announcements", href: "/news", category: "Page" },
  { title: "Author Portal", href: "/portal", category: "Page" },
];

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

interface PageLinkPickerProps {
  value: string;
  isExternal?: boolean;
  onSelect: (selection: PageLinkSelection) => void;
  buttonClassName?: string;
  label?: string;
}

export function PageLinkPicker({
  value,
  isExternal = false,
  onSelect,
  buttonClassName,
  label = "Choose Page",
}: PageLinkPickerProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"pages" | "posts" | "custom">("pages");
  const [search, setSearch] = useState("");
  const [pages, setPages] = useState<CmsPageItem[]>([]);
  const [posts, setPosts] = useState<CmsPostItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [customHref, setCustomHref] = useState(value || "");
  const [customLabel, setCustomLabel] = useState("");
  const [openNewTab, setOpenNewTab] = useState(isExternal);

  // Inline create page modal state
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [creating, setCreating] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pagesRes, postsRes] = await Promise.all([
        fetch("/api/admin/pages?limit=100").then((r) => (r.ok ? r.json() : { pages: [] })),
        fetch("/api/posts?limit=50").then((r) => (r.ok ? r.json() : { posts: [] })),
      ]);
      if (Array.isArray(pagesRes.pages)) {
        setPages(pagesRes.pages);
      }
      if (Array.isArray(postsRes.posts)) {
        setPosts(postsRes.posts);
      }
    } catch {
      // ignore load failure
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      setCustomHref(value || "");
      setOpenNewTab(isExternal);
      setCustomLabel("");
      void loadData();
    }
  }, [open, value, isExternal]);

  const filteredStandard = useMemo(() => {
    if (!search.trim()) return STANDARD_CONFERENCE_ROUTES;
    const q = search.toLowerCase();
    return STANDARD_CONFERENCE_ROUTES.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.href.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q)
    );
  }, [search]);

  const filteredPages = useMemo(() => {
    if (!search.trim()) return pages;
    const q = search.toLowerCase();
    return pages.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q)
    );
  }, [pages, search]);

  const filteredPosts = useMemo(() => {
    if (!search.trim()) return posts;
    const q = search.toLowerCase();
    return posts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        (p.category && p.category.toLowerCase().includes(q))
    );
  }, [posts, search]);

  const handleCreatePage = async () => {
    const title = newTitle.trim();
    const slug = (newSlug.trim() || toSlug(title)).replace(/^\/+/, "");
    if (!title || !slug) {
      toast.error("Please enter both page title and slug.");
      return;
    }

    setCreating(true);
    try {
      const res = await fetch("/api/admin/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          isPublished: true,
          blocks: [],
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.page) {
        toast.error(data.error || "Failed to create page.");
        return;
      }

      const created: CmsPageItem = data.page;
      setPages((prev) => [created, ...prev]);
      toast.success(`Created page /${created.slug}`);
      setShowCreate(false);
      setNewTitle("");
      setNewSlug("");
      setSlugTouched(false);

      onSelect({
        href: `/${created.slug.replace(/^\/+/, "")}`,
        label: customLabel.trim() || created.title,
        isExternal: openNewTab,
      });
      setOpen(false);
    } catch {
      toast.error("Network error while creating page.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className={cn(
          "h-8 px-2.5 gap-1.5 text-xs font-medium bg-white border-slate-200 hover:border-blue-300 text-slate-700 shrink-0",
          buttonClassName
        )}
      >
        <FolderOpen className="w-3.5 h-3.5 text-[#115eff]" />
        <span>{label}</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[660px] p-0 overflow-hidden bg-white border-slate-200">
          <DialogHeader className="px-5 pt-5 pb-3 border-b border-slate-100 bg-slate-50/70">
            <div className="flex items-center justify-between gap-3">
              <div>
                <DialogTitle className="text-base font-bold text-[#004776]">
                  Select Destination Link
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 mt-0.5">
                  Choose a conference route, CMS page, published article, or enter a custom URL.
                </DialogDescription>
              </div>
              <Button
                type="button"
                size="sm"
                onClick={() => setShowCreate((prev) => !prev)}
                className="h-8 text-xs bg-[#004776] hover:bg-[#00365a] text-white shrink-0"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Create Page
              </Button>
            </div>
          </DialogHeader>

          {showCreate && (
            <div className="mx-5 mt-3 p-3.5 rounded-md border border-blue-200 bg-blue-50/60 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#004776]">New CMS Page</span>
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="text-[11px] text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <Label className="text-[11px] text-slate-600 mb-1 block">Page Title</Label>
                  <Input
                    value={newTitle}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewTitle(val);
                      if (!slugTouched) setNewSlug(toSlug(val));
                    }}
                    placeholder="Workshops & Tutorials"
                    className="h-8 text-xs bg-white"
                  />
                </div>
                <div>
                  <Label className="text-[11px] text-slate-600 mb-1 block">URL Slug</Label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-mono">
                      /
                    </span>
                    <Input
                      value={newSlug}
                      onChange={(e) => {
                        setSlugTouched(true);
                        setNewSlug(e.target.value);
                      }}
                      placeholder="workshops"
                      className="h-8 text-xs bg-white pl-5 font-mono"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  type="button"
                  size="sm"
                  disabled={creating}
                  onClick={handleCreatePage}
                  className="h-7 text-xs bg-[#115eff] hover:bg-blue-700 text-white"
                >
                  {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
                  Create & Select
                </Button>
              </div>
            </div>
          )}

          <div className="p-5 space-y-3.5">
            {/* Tabs + New Tab option */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="inline-flex rounded-md bg-slate-100 p-0.5 border border-slate-200">
                <button
                  type="button"
                  onClick={() => setTab("pages")}
                  className={cn(
                    "px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer",
                    tab === "pages"
                      ? "bg-white text-[#004776] shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  Pages & Sections
                </button>
                <button
                  type="button"
                  onClick={() => setTab("posts")}
                  className={cn(
                    "px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer",
                    tab === "posts"
                      ? "bg-white text-[#004776] shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  Articles
                </button>
                <button
                  type="button"
                  onClick={() => setTab("custom")}
                  className={cn(
                    "px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer",
                    tab === "custom"
                      ? "bg-white text-[#004776] shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  Custom URL
                </button>
              </div>

              <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none">
                <Switch
                  checked={openNewTab}
                  onCheckedChange={setOpenNewTab}
                  className="scale-90"
                />
                <span>Open in new tab</span>
              </label>
            </div>

            {tab !== "custom" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Filter pages or sections..."
                    className="h-8 pl-8 text-xs bg-slate-50 border-slate-200"
                  />
                </div>
                <Input
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value)}
                  placeholder="Optional display title override"
                  className="h-8 text-xs bg-slate-50 border-slate-200"
                />
              </div>
            )}

            {tab === "pages" && (
              <div className="max-h-72 overflow-y-auto space-y-3 pr-1">
                {/* CMS Pages */}
                {loading ? (
                  <div className="py-6 flex items-center justify-center text-xs text-slate-400 gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading pages...
                  </div>
                ) : filteredPages.length > 0 ? (
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 px-1">
                      CMS Pages
                    </div>
                    <div className="space-y-1">
                      {filteredPages.map((page) => {
                        const pageHref = `/${page.slug.replace(/^\/+/, "")}`;
                        const isSelected = value === pageHref;
                        return (
                          <div
                            key={page.id}
                            className={cn(
                              "flex items-center justify-between gap-2 px-3 py-2 rounded-md border transition-colors",
                              isSelected
                                ? "bg-blue-50/70 border-blue-300"
                                : "bg-white border-slate-100 hover:border-blue-200 hover:bg-slate-50"
                            )}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                onSelect({
                                  href: pageHref,
                                  label: customLabel.trim() || page.title,
                                  isExternal: openNewTab,
                                });
                                setOpen(false);
                              }}
                              className="flex-1 text-left flex items-center gap-2.5 min-w-0 cursor-pointer"
                            >
                              <FileText className="w-4 h-4 text-[#115eff] shrink-0" />
                              <div className="min-w-0">
                                <div className="text-xs font-semibold text-slate-800 truncate">
                                  {page.title}
                                </div>
                                <div className="text-[11px] font-mono text-slate-400 truncate">
                                  {pageHref}
                                </div>
                              </div>
                            </button>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <Badge
                                variant={page.isPublished ? "success" : "secondary"}
                                size="sm"
                              >
                                {page.isPublished ? "Live" : "Draft"}
                              </Badge>
                              <a
                                href={`/admin/pages/${page.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Edit in Page Builder"
                                className="p-1.5 rounded text-slate-400 hover:text-[#115eff] hover:bg-blue-50"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                              {isSelected && <Check className="w-4 h-4 text-[#115eff]" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                {/* Conference Standard Routes & Anchors */}
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 px-1">
                    Conference Routes & Anchors
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {filteredStandard.map((route) => {
                      const isSelected = value === route.href;
                      return (
                        <button
                          key={route.href}
                          type="button"
                          onClick={() => {
                            onSelect({
                              href: route.href,
                              label: customLabel.trim() || route.title,
                              isExternal: openNewTab,
                            });
                            setOpen(false);
                          }}
                          className={cn(
                            "flex items-center justify-between gap-2 px-3 py-2 rounded-md border text-left transition-colors cursor-pointer",
                            isSelected
                              ? "bg-blue-50/70 border-blue-300"
                              : "bg-white border-slate-100 hover:border-blue-200 hover:bg-slate-50"
                          )}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {route.href.includes("#") ? (
                              <Hash className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            ) : (
                              <Globe className="w-3.5 h-3.5 text-[#115eff] shrink-0" />
                            )}
                            <div className="min-w-0">
                              <div className="text-xs font-semibold text-slate-800 truncate">
                                {route.title}
                              </div>
                              <div className="text-[11px] font-mono text-slate-400 truncate">
                                {route.href}
                              </div>
                            </div>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#115eff] shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {tab === "posts" && (
              <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1">
                {loading ? (
                  <div className="py-8 flex items-center justify-center text-xs text-slate-400 gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading articles...
                  </div>
                ) : filteredPosts.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    No published articles found.
                  </div>
                ) : (
                  filteredPosts.map((post) => {
                    const postHref = `/news/${post.slug}`;
                    const isSelected = value === postHref;
                    return (
                      <button
                        key={post.id}
                        type="button"
                        onClick={() => {
                          onSelect({
                            href: postHref,
                            label: customLabel.trim() || post.title,
                            isExternal: openNewTab,
                          });
                          setOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center justify-between gap-2 px-3 py-2 rounded-md border text-left transition-colors cursor-pointer",
                          isSelected
                            ? "bg-blue-50/70 border-blue-300"
                            : "bg-white border-slate-100 hover:border-blue-200 hover:bg-slate-50"
                        )}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Newspaper className="w-4 h-4 text-[#115eff] shrink-0" />
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-slate-800 truncate">
                              {post.title}
                            </div>
                            <div className="text-[11px] font-mono text-slate-400 truncate">
                              {postHref}
                            </div>
                          </div>
                        </div>
                        {post.category && (
                          <Badge variant="outline" size="sm">
                            {post.category}
                          </Badge>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            )}

            {tab === "custom" && (
              <div className="space-y-3 py-1">
                <div>
                  <Label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                    Target URL or Path
                  </Label>
                  <Input
                    value={customHref}
                    onChange={(e) => setCustomHref(e.target.value)}
                    placeholder="https://ieee-smc.org or /#cfp"
                    className="h-9 text-xs font-mono"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                    Display Label
                  </Label>
                  <Input
                    value={customLabel}
                    onChange={(e) => setCustomLabel(e.target.value)}
                    placeholder="Leave blank to keep current label"
                    className="h-9 text-xs"
                  />
                </div>
                <div className="flex justify-end pt-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      const trimmed = customHref.trim();
                      if (!trimmed) {
                        toast.error("Please enter a URL or path.");
                        return;
                      }
                      const autoExternal =
                        openNewTab ||
                        trimmed.startsWith("http://") ||
                        trimmed.startsWith("https://");
                      onSelect({
                        href: trimmed,
                        label: customLabel.trim() || undefined,
                        isExternal: autoExternal,
                      });
                      setOpen(false);
                    }}
                    className="bg-[#004776] hover:bg-[#00365a] text-white h-8 px-4 text-xs"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5 mr-1.5" />
                    Apply Link
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
