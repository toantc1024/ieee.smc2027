"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FileText, Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";

export type PublishedPostLink = { id: string; title: string; slug: string; category?: string | null };
export async function loadPublishedPostLinks(signal?: AbortSignal): Promise<PublishedPostLink[]> {
  const response = await fetch("/api/posts", { signal });
  if (!response.ok) throw new Error("Could not load published posts.");
  const result = await response.json();
  if (!Array.isArray(result.posts)) throw new Error("The posts response was invalid.");
  return result.posts.filter((post: unknown): post is PublishedPostLink => {
    if (!post || typeof post !== "object") return false;
    const value = post as Record<string, unknown>;
    return typeof value.id === "string" && typeof value.title === "string" && typeof value.slug === "string" && Boolean(value.slug);
  });
}
export function filterPublishedPostLinks(posts: PublishedPostLink[], query: string): PublishedPostLink[] {
  const term = query.trim().toLowerCase();
  return posts.filter((post) => `${post.title} ${post.slug} ${post.category || ""}`.toLowerCase().includes(term)).slice(0, 15);
}

export function PostLinkPicker({ onSelectPost }: { onSelectPost: (post: { url: string; title: string; slug: string }) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [posts, setPosts] = useState<PublishedPostLink[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    async function load() {
      try { const result = await loadPublishedPostLinks(controller.signal); setPosts(result); setStatus("ready"); }
      catch { if (!controller.signal.aborted) setStatus("error"); }
    }
    void load();
    return () => controller.abort();
  }, [open, attempt]);
  const visiblePosts = useMemo(() => filterPublishedPostLinks(posts, query), [posts, query]);
  const changeOpen = useCallback((next: boolean) => { setOpen(next); if (next) setStatus("loading"); }, []);
  return <Popover open={open} onOpenChange={changeOpen}>
    <PopoverTrigger asChild><button type="button" title="Choose a published post" className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2 text-xs font-medium text-slate-700 hover:bg-slate-100"><FileText className="size-3.5 text-blue-600" />Choose post</button></PopoverTrigger>
    <PopoverContent align="start" sideOffset={6} className="w-80 p-0" onMouseDown={(event) => event.stopPropagation()}>
      <div className="border-b border-slate-200 bg-slate-50 p-2.5"><label className="relative block"><span className="sr-only">Search published posts</span><Search className="pointer-events-none absolute left-2.5 top-2 size-4 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search published posts..." className="h-8 w-full rounded-md border border-slate-200 bg-white pl-8 pr-2 text-xs text-slate-800" autoFocus /></label></div>
      <div className="max-h-64 overflow-y-auto p-1">{status === "loading" ? <div role="status" aria-label="Loading published posts" className="space-y-1.5 p-2">{Array.from({ length: 4 }).map((_, idx) => <div key={idx} className="rounded-lg p-2 space-y-1.5"><Skeleton className="h-3.5 w-4/5" /><Skeleton className="h-2.5 w-1/2" /></div>)}</div> : status === "error" ? <div role="alert" className="p-4 text-center text-xs text-slate-600"><p>Could not load posts.</p><button type="button" onClick={() => { setStatus("loading"); setAttempt((value) => value + 1); }} className="mt-2 font-semibold text-blue-700 hover:underline">Try again</button></div> : visiblePosts.length === 0 ? <p className="p-6 text-center text-xs text-slate-500">No published posts found.</p> : visiblePosts.map((post) => <button key={post.id} type="button" onClick={() => { onSelectPost({ url: `/news/${encodeURIComponent(post.slug)}`, title: post.title, slug: post.slug }); setOpen(false); }} className="flex w-full items-start gap-2 rounded-lg p-2 text-left hover:bg-blue-50"><FileText className="mt-0.5 size-4 shrink-0 text-blue-500" /><span className="min-w-0"><span className="block text-xs font-medium text-slate-800">{post.title}</span><span className="mt-0.5 block truncate font-mono text-[10px] text-slate-500">/news/{post.slug}</span></span></button>)}</div>
    </PopoverContent>
  </Popover>;
}
