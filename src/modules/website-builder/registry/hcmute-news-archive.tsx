"use client";
/* eslint-disable @next/next/no-img-element -- Article images can be hosted on configured external domains. */

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { POSTS_SYNC_CHANNEL } from "@/lib/post-sync";

export type Post = { id: string; title: string; slug: string; summary?: string | null; content?: string; coverImage?: string | null; category?: string | null; publishedAt?: string | null; createdAt?: string | null; updatedAt?: string | null; views?: number };
export async function loadPublishedPosts(signal?: AbortSignal): Promise<Post[]> {
  const response = await fetch("/api/posts", { signal, cache: "no-store" });
  if (!response.ok) throw new Error("Unable to load posts");
  const result = await response.json();
  if (!Array.isArray(result.posts)) throw new Error("Invalid posts response");
  return result.posts;
}
export function filterNewsPosts(posts: Post[], category: string, query: string): Post[] {
  return posts.filter((post) => (!category || (post.category || "General") === category) && `${post.title} ${post.summary || ""}`.toLowerCase().includes(query.trim().toLowerCase()));
}
type NewsArchiveProps = { headerTitle?: string; headerSubtitle?: string; showBreadcrumb?: boolean; showSearch?: boolean; showCategories?: boolean; showFeaturedBento?: boolean; showCategoryCarousels?: boolean; postsPerCategory?: number; categoriesLimit?: number; tagId?: string };
export function NewsArchive({ headerTitle = "News and events", headerSubtitle = "Explore the latest news and announcements", showBreadcrumb = true, showSearch = true, showCategories = true, showFeaturedBento = true, showCategoryCarousels = true, postsPerCategory = 10, categoriesLimit = 0, tagId }: NewsArchiveProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        setPosts(await loadPublishedPosts(controller.signal));
        setStatus("ready");
      } catch (error) { if (!controller.signal.aborted) { console.error(error); setStatus("error"); } }
    }
    void load();
    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") void load();
    }, 6000);
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel(POSTS_SYNC_CHANNEL);
      channel.onmessage = () => void load();
    } catch {
      // BroadcastChannel unavailable
    }
    return () => {
      controller.abort();
      window.clearInterval(intervalId);
      if (channel) channel.close();
    };
  }, []);
  const categories = useMemo(() => Array.from(new Set(posts.map((post) => post.category || "General"))), [posts]);
  const filtered = useMemo(() => filterNewsPosts(posts, category, query), [posts, category, query]);
  const limit = Math.max(1, Math.min(50, Number(postsPerCategory) || 10));
  const groupNames = category ? [category] : categories.slice(0, Math.max(0, Number(categoriesLimit) || 0) || undefined);
  if (tagId) return <section className="mx-auto max-w-7xl px-4 py-10 text-sm text-slate-600">Tag-filtered news is unavailable because this site does not store post tags.</section>;
  return <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
    {showBreadcrumb && <nav aria-label="Breadcrumb" className="mb-5 text-xs text-slate-500"><Link href="/" className="hover:underline">Home</Link><span aria-hidden="true"> / </span><span>News</span></nav>}
    <div className="border-b border-slate-200/75 pb-6"><h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{headerTitle}</h2>{headerSubtitle && <p className="mt-2 text-base text-muted-foreground">{headerSubtitle}</p>}</div>
    {showSearch && <label className="mt-6 block max-w-md text-xs font-semibold text-slate-600">Search articles<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by title or summary" className="mt-1 block h-10 w-full rounded-lg border border-slate-200/85 px-3 text-sm font-normal" /></label>}
    {showCategories && categories.length > 0 && <div aria-label="News categories" className="mt-4 flex flex-wrap gap-2"><button type="button" aria-pressed={!category} onClick={() => setCategory("")} className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${!category ? "border-primary bg-primary text-white" : "border-slate-200/75 bg-white text-slate-600"}`}>All</button>{categories.map((name) => <button type="button" key={name} aria-pressed={category === name} onClick={() => setCategory(name)} className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${category === name ? "border-primary bg-primary text-white" : "border-slate-200/75 bg-white text-slate-600"}`}>{name}</button>)}</div>}
    {status === "loading" && <div role="status" aria-label="Loading news" className="mt-8 grid gap-4 md:grid-cols-3">{Array.from({ length: 3 }).map((_, idx) => <div key={idx} className="overflow-hidden rounded-2xl border border-slate-200/75 bg-white p-5 space-y-3"><Skeleton className="aspect-video w-full rounded-xl" /><Skeleton className="h-3 w-20" /><Skeleton className="h-5 w-4/5" /><Skeleton className="h-3.5 w-full" /><Skeleton className="h-3.5 w-2/3" /></div>)}</div>}{status === "error" && <p role="alert" className="py-8 text-sm text-red-700">Could not load news. Please try again later.</p>}{status === "ready" && filtered.length === 0 && <p className="py-8 text-sm text-slate-500">No articles found.</p>}
    {status === "ready" && showFeaturedBento && filtered.length > 0 && <div className="mt-8 grid gap-4 md:grid-cols-3">{filtered.slice(0, 3).map((post) => <PostCard key={post.id} post={post} />)}</div>}
    {status === "ready" && showCategoryCarousels && groupNames.map((name) => { const entries = filtered.filter((post) => (post.category || "General") === name).slice(0, limit); return entries.length > 0 ? <section key={name} className="mt-10"><h3 className="border-b border-slate-200/75 pb-3 text-xl font-bold text-foreground">{name}</h3><div className="mt-4 flex gap-4 overflow-x-auto pb-3">{entries.map((post) => <div key={post.id} className="w-[280px] shrink-0"><PostCard post={post} /></div>)}</div></section> : null; })}
  </section>;
}
function PostCard({ post }: { post: Post }) { return <article className="h-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><Link href={`/news/${encodeURIComponent(post.slug)}`} className="block h-full">{post.coverImage && <div className="aspect-video overflow-hidden bg-slate-100"><img src={post.coverImage} alt="" className="size-full object-cover" /></div>}<div className="p-4"><span className="text-xs font-semibold text-primary">{post.category || "General"}</span><h4 className="mt-1 text-base font-bold text-slate-900">{post.title}</h4>{post.summary && <p className="mt-2 line-clamp-3 text-sm text-slate-600">{post.summary}</p>}</div></Link></article>; }

type PostDetailProps = { postSlug?: string; showBreadcrumb?: boolean; showCoverImage?: boolean; showMeta?: boolean; showToolbar?: boolean; showDivider?: boolean; customTitle?: string; customDescription?: string; customCoverImageUrl?: string; customAuthorName?: string; customCategoryName?: string; customContent?: string };
export function PostDetail({ postSlug = "", showBreadcrumb = true, showCoverImage = true, showMeta = true, showToolbar = true, showDivider = true, customTitle = "", customDescription = "", customCoverImageUrl = "", customAuthorName = "", customCategoryName = "", customContent = "" }: PostDetailProps) {
  const [post, setPost] = useState<Post | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "missing" | "error">("loading");
  useEffect(() => {
    const controller = new AbortController();
    const path = window.location.pathname.match(/^\/news\/([^/]+)\/?$/);
    const slug = postSlug.trim() || (path ? decodeURIComponent(path[1]) : "");
    async function load() {
      try {
        if (!slug) { setStatus("missing"); return; }
        const posts = await loadPublishedPosts(controller.signal);
        const found = posts.find((item) => item.slug === slug) || null;
        setPost(found); setStatus(found ? "ready" : "missing");
      } catch { if (!controller.signal.aborted) setStatus("error"); }
    }
    void load();
    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") void load();
    }, 6000);
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel(POSTS_SYNC_CHANNEL);
      channel.onmessage = () => void load();
    } catch {
      // BroadcastChannel unavailable
    }
    return () => {
      controller.abort();
      window.clearInterval(intervalId);
      if (channel) channel.close();
    };
  }, [postSlug]);
  const hasCustom = Boolean(customTitle || customContent);
  if (!hasCustom && status === "loading") return <section className="mx-auto max-w-4xl space-y-5 px-4 py-10" role="status" aria-label="Loading article"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-3/4" /><Skeleton className="aspect-video w-full rounded-2xl" /><div className="space-y-2.5"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-5/6" /><Skeleton className="h-4 w-2/3" /></div></section>;
  if (!hasCustom && status === "error") return <section className="mx-auto max-w-7xl px-4 py-10 text-sm text-red-700" role="alert">Could not load the article. Please try again later.</section>;
  if (!hasCustom && status === "missing") return <section className="mx-auto max-w-7xl px-4 py-10 text-sm text-slate-600">{postSlug.trim() ? "Published article not found." : "Select a published post by entering its slug in the section settings."}</section>;
  const title = customTitle || post?.title || "";
  const summary = customDescription || post?.summary || "";
  const image = customCoverImageUrl || post?.coverImage || "";
  const category = customCategoryName || post?.category || "";
  const html = customContent || post?.content || "";
  return <article className={`mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 ${showDivider ? "border-b border-slate-200" : ""}`}>
    {showBreadcrumb && <nav aria-label="Breadcrumb" className="mb-5 text-xs text-slate-500"><Link href="/">Home</Link><span aria-hidden="true"> / </span><Link href="/news">News</Link><span aria-hidden="true"> / </span>{title}</nav>}
    {category && <p className="mb-2 text-xs font-bold text-primary">{category}</p>}<h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{title}</h1>{summary && <p className="mt-4 max-w-4xl text-base leading-relaxed text-slate-600">{summary}</p>}
    {showMeta && (customAuthorName || post?.publishedAt) && <p className="mt-4 text-xs text-slate-500">{customAuthorName}{customAuthorName && post?.publishedAt ? " · " : ""}{post?.publishedAt ? new Date(post.publishedAt).toLocaleDateString("en", { year: "numeric", month: "short", day: "numeric" }) : ""}</p>}
    {showCoverImage && image && <img src={image} alt="" className="mt-6 aspect-video w-full rounded-2xl object-cover" />}
    <div className="mt-8 flex gap-6">{showToolbar && <div className="shrink-0"><button type="button" onClick={() => window.print()} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">Print</button></div>}<div className="tiptap post-reader prose prose-slate max-w-none min-w-0 flex-1" dangerouslySetInnerHTML={{ __html: html }} /></div>
  </article>;
}
