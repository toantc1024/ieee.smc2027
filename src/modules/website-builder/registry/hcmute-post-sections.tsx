"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ExternalLink, FileText, Mail, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { loadPublishedPosts, type Post } from "./hcmute-news-archive";

type QuickLink = { name?: string; href?: string; external?: boolean };
type Notice = { title?: string; time?: string; href?: string };
type ActionCardsProps = { showQuickLinks?: boolean; quickLinksTitle?: string; quickLinksDesc?: string; quickLinks?: QuickLink[]; showNotices?: boolean; noticesTitle?: string; noticesDesc?: string; noticeCategorySlug?: string; noticeTagId?: string; customNotices?: Notice[]; viewAllNoticesText?: string; viewAllNoticesHref?: string };
function normalizeCategory(value: string) { return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
export function ActionCards({ showQuickLinks = true, quickLinksTitle = "Quick links", quickLinksDesc = "Useful links and resources", quickLinks = [], showNotices = true, noticesTitle = "Notices", noticesDesc = "Latest announcements", noticeCategorySlug = "", noticeTagId = "", customNotices = [], viewAllNoticesText = "View all notices", viewAllNoticesHref = "/news" }: ActionCardsProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState(false);
  useEffect(() => {
    if (!noticeCategorySlug || noticeTagId) return;
    const controller = new AbortController();
    loadPublishedPosts(controller.signal).then(setPosts).catch(() => { if (!controller.signal.aborted) setError(true); });
    return () => controller.abort();
  }, [noticeCategorySlug, noticeTagId]);
  const notices = noticeCategorySlug ? posts.filter((post) => normalizeCategory(post.category || "General") === normalizeCategory(noticeCategorySlug)).slice(0, 4).map((post) => ({ title: post.title, href: `/news/${encodeURIComponent(post.slug)}`, time: post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("en", { year: "numeric", month: "short", day: "numeric" }) : "" })) : customNotices;
  return <section className="mx-auto grid w-full max-w-7xl gap-5 px-4 py-10 sm:px-6 md:grid-cols-2 lg:px-8">
    {showQuickLinks && <div className="rounded-2xl border border-slate-200/75 bg-white p-6 shadow-sm"><h2 className="text-xl font-bold tracking-tight text-foreground">{quickLinksTitle}</h2>{quickLinksDesc && <p className="mt-2 text-sm text-slate-600">{quickLinksDesc}</p>}<ul className="mt-5 divide-y divide-slate-100">{quickLinks.map((item, index) => <li key={index}><a href={item.href || "#"} target={item.external ? "_blank" : undefined} rel={item.external ? "noopener noreferrer" : undefined} className="flex items-center justify-between gap-2 py-3 text-sm font-semibold text-primary hover:underline">{item.name}{item.external ? <ExternalLink className="size-4 shrink-0" /> : <ArrowRight className="size-4 shrink-0" />}</a></li>)}</ul>{quickLinks.length === 0 && <p className="mt-4 text-sm text-slate-500">No quick links added.</p>}</div>}
    {showNotices && <div className="rounded-2xl border border-slate-200/75 bg-white p-6 shadow-sm"><h2 className="text-xl font-bold tracking-tight text-foreground">{noticesTitle}</h2>{noticesDesc && <p className="mt-2 text-sm text-slate-600">{noticesDesc}</p>}{noticeTagId ? <p className="mt-4 text-sm text-slate-600">Tag-filtered notices are unavailable on this site.</p> : error ? <p role="alert" className="mt-4 text-sm text-red-700">Could not load notices.</p> : <ul className="mt-5 divide-y divide-slate-100">{notices.map((notice, index) => <li key={index}><a href={notice.href || "#"} className="flex flex-col gap-1 py-3 text-sm font-semibold text-primary hover:underline"><span>{notice.title}</span>{notice.time && <span className="text-xs font-normal text-slate-500">{notice.time}</span>}</a></li>)}</ul>}{!noticeTagId && !error && !notices.length && <p className="mt-4 text-sm text-slate-500">No notices found.</p>}{viewAllNoticesText && viewAllNoticesHref && <a href={viewAllNoticesHref} className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline">{viewAllNoticesText}<ArrowRight className="size-4" /></a>}</div>}
  </section>;
}

type FooterProps = { postSlug?: string; showRelatedPosts?: boolean; relatedTitle?: string; relatedSubtitle?: string; relatedCount?: number; showTrendingPosts?: boolean; trendingTitle?: string; trendingSubtitle?: string; trendingCount?: number };
export function FooterSections({ postSlug = "", showRelatedPosts = true, relatedTitle = "Related articles", relatedSubtitle = "Discover more on the same topic", relatedCount = 4, showTrendingPosts = true, trendingTitle = "Most viewed", trendingSubtitle = "Published articles with the most views", trendingCount = 4 }: FooterProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentSlug, setCurrentSlug] = useState(postSlug);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  useEffect(() => {
    const controller = new AbortController();
    const path = window.location.pathname.match(/^\/news\/([^/]+)\/?$/);
    const slug = postSlug || (path ? decodeURIComponent(path[1]) : "");
    async function load() { try { const result = await loadPublishedPosts(controller.signal); setPosts(result); setCurrentSlug(slug); setStatus("ready"); } catch { if (!controller.signal.aborted) setStatus("error"); } }
    void load(); return () => controller.abort();
  }, [postSlug]);
  const current = posts.find((post) => post.slug === currentSlug);
  const related = current ? posts.filter((post) => post.slug !== current.slug && post.category === current.category).slice(0, Math.max(1, Math.min(8, Number(relatedCount) || 4))) : [];
  const trending = [...posts].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, Math.max(1, Math.min(8, Number(trendingCount) || 4)));
  return <section className="mx-auto w-full max-w-7xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">{status === "loading" && <div role="status" aria-label="Loading articles" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, idx) => <div key={idx} className="rounded-xl border border-slate-200/75 p-4 space-y-2.5"><Skeleton className="h-4 w-4/5" /><Skeleton className="h-3.5 w-1/2" /></div>)}</div>}{status === "error" && <p role="alert" className="text-sm text-red-700">Could not load articles.</p>}{status === "ready" && <>
    {showRelatedPosts && <ArticleGroup title={relatedTitle} subtitle={relatedSubtitle} posts={related} empty={current ? "No related articles found." : "Select a post to show related articles."} icon={<FileText className="size-5" />} />}
    {showTrendingPosts && <ArticleGroup title={trendingTitle} subtitle={trendingSubtitle} posts={trending} empty="No published articles found." icon={<TrendingUp className="size-5" />} />}
  </>}</section>;
}
function ArticleGroup({ title, subtitle, posts, empty, icon }: { title: string; subtitle: string; posts: Post[]; empty: string; icon: React.ReactNode }) { return <div><h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">{icon}{title}</h2>{subtitle && <p className="mt-2 text-sm text-slate-600">{subtitle}</p>}{posts.length ? <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">{posts.map((post) => <Link key={post.id} href={`/news/${encodeURIComponent(post.slug)}`} className="rounded-xl border border-slate-200/75 p-4 font-semibold text-slate-900 hover:border-primary hover:text-primary">{post.title}</Link>)}</div> : <p className="mt-4 text-sm text-slate-500">{empty}</p>}</div>; }

type NewsletterProps = { title?: string; subtitle?: string; buttonText?: string; placeholder?: string; subscribeUrl?: string };
export function Newsletter({ title = "Subscribe to our newsletter", subtitle = "Receive news and updates by email", buttonText = "Subscribe", subscribeUrl = "" }: NewsletterProps) {
  const allowedUrl = /^(https?:\/\/|\/[^/])/i.test(subscribeUrl) ? subscribeUrl : "";
  return <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><div className="relative overflow-hidden rounded-3xl bg-primary p-8 text-center text-white shadow-xl sm:p-10 lg:p-12"><Mail className="mx-auto mb-4 size-7" /><h2 className="text-2xl font-bold tracking-tight sm:text-4xl">{title}</h2>{subtitle && <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base">{subtitle}</p>}{allowedUrl ? <a href={allowedUrl} className="mt-6 inline-flex rounded-xl bg-white px-6 py-3 text-sm font-bold text-primary hover:bg-white/90">{buttonText}<ArrowRight className="ml-2 size-4" /></a> : <p className="mt-6 text-sm text-white/80">Newsletter sign-up is not available yet.</p>}</div></section>;
}
