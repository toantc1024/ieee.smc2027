import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  Calendar,
  Clock,
  User,
  ChevronRight,
  ArrowLeft,
  Eye,
  FileText,
  Download,
  Building,
  GraduationCap,
  MapPin,
  ExternalLink,
  Tag,
  CheckCircle2,
} from "lucide-react";
import { prisma } from "@/lib";
import { PostStatus } from "@prisma/client";
import { DEFAULT_NEWS_ITEMS } from "@/data/news-data";
import { NewsDetailClient } from "./news-detail-client";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getPostData(slug: string) {
  try {
    // 1. Lookup in PostgreSQL
    const post = await prisma.post.findFirst({
      where: {
        OR: [{ slug }, { id: slug }],
        status: PostStatus.PUBLISHED,
      },
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (post) {
      // Fetch 4 related posts
      const related = await prisma.post.findMany({
        where: {
          status: PostStatus.PUBLISHED,
          NOT: { id: post.id },
        },
        orderBy: { publishedAt: "desc" },
        take: 4,
        select: {
          id: true,
          slug: true,
          title: true,
          summary: true,
          coverImage: true,
          category: true,
          publishedAt: true,
          createdAt: true,
        },
      });

      return {
        post: {
          id: post.id,
          slug: post.slug,
          title: post.title,
          summary: post.summary,
          content: post.content,
          coverImage: post.coverImage,
          category: post.category,
          views: post.views,
          publishedAt: post.publishedAt?.toISOString() || post.createdAt.toISOString(),
          authorName: post.author?.name || "IEEE SMC 2027 Organizing Committee",
        },
        relatedPosts: related.map((r) => ({
          id: r.id,
          slug: r.slug,
          title: r.title,
          summary: r.summary,
          coverImage: r.coverImage,
          category: r.category,
          date: new Date(r.publishedAt || r.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
        })),
      };
    }
  } catch (err) {
    console.error("DB post lookup error:", err);
  }

  // 2. Fallback to DEFAULT_NEWS_ITEMS if not found in database
  const cleanSlug = slug.replace(/^news-/, "");
  const defaultItem = DEFAULT_NEWS_ITEMS.find(
    (item) =>
      item.id === slug ||
      item.id.replace(/^news-/, "") === cleanSlug ||
      item.externalUrl === `#${slug}` ||
      item.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").includes(cleanSlug)
  );

  if (defaultItem) {
    const related = DEFAULT_NEWS_ITEMS.filter((i) => i.id !== defaultItem.id)
      .slice(0, 4)
      .map((r) => ({
        id: r.id,
        slug: r.id,
        title: r.title,
        summary: r.summary,
        coverImage: r.image || null,
        category: r.category,
        date: r.date,
      }));

    return {
      post: {
        id: defaultItem.id,
        slug: defaultItem.id,
        title: defaultItem.title,
        summary: defaultItem.summary,
        content: defaultItem.content,
        coverImage: defaultItem.image || null,
        category: defaultItem.category,
        views: defaultItem.viewCount || 1420,
        publishedAt: `${defaultItem.year}-${defaultItem.month}-${defaultItem.day}`,
        authorName: "IEEE SMC 2027 Organizing Committee",
      },
      relatedPosts: related,
    };
  }

  return null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPostData(slug);

  if (!data?.post) {
    return {
      title: "Article Not Found | IEEE SMC 2027",
    };
  }

  const { post } = data;
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ieee-smc2027.org";

  return {
    title: `${post.title} | IEEE SMC 2027 Vietnam`,
    description: post.summary || `Read official announcement: ${post.title}`,
    openGraph: {
      title: post.title,
      description: post.summary || undefined,
      url: `${siteUrl}/news/${post.slug}`,
      siteName: "IEEE SMC 2027",
      images: post.coverImage ? [{ url: post.coverImage }] : undefined,
      type: "article",
    },
  };
}

export default async function PublicPostDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getPostData(slug);

  if (!data?.post) {
    notFound();
  }

  const { post, relatedPosts } = data;

  const formattedDate = new Date(post.publishedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Calculate estimated reading time
  const plainText = post.content.replace(/<[^>]*>/g, " ");
  const wordCount = plainText.trim().split(/\s+/).filter(Boolean).length;
  const readingTimeMin = Math.max(1, Math.ceil(wordCount / 220));

  return (
    <div className="w-full bg-[#f8fafc]/40 font-sans text-slate-800 min-h-screen">
      {/* ── 1. HCMUTE Academic Top Banner with Royal Cobalt Blue & Dot Texture ── */}
      <section className="relative w-full bg-[#004776] text-white overflow-hidden border-b border-[#00385e] shadow-xs">
        {/* Subtle HCMUTE Royal Blue Dot Pattern in Top-Right Corner */}
        <div className="corner-dot-tr opacity-25 pointer-events-none" />

        <div className="w-full max-w-[var(--site-width)] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            {/* Breadcrumb Navigation (Strictly Non-Bold per HCMUTE guideline) */}
            <nav
              aria-label="Breadcrumbs"
              className="flex items-center gap-2 text-white/80 overflow-x-auto scrollbar-none font-normal"
            >
              <Link
                href="/"
                className="hover:text-white transition-colors shrink-0 font-normal hover:underline"
              >
                Home
              </Link>
              <ChevronRight className="size-3.5 shrink-0 text-white/50" />
              <Link
                href="/#news"
                className="hover:text-white transition-colors shrink-0 font-normal hover:underline"
              >
                News &amp; Announcements
              </Link>
              <ChevronRight className="size-3.5 shrink-0 text-white/50" />
              <span className="text-[#a5cbf5] shrink-0 font-normal">{post.category}</span>
              <ChevronRight className="size-3.5 shrink-0 text-white/50 hidden sm:inline" />
              <span className="text-white/90 truncate max-w-[200px] sm:max-w-md hidden sm:inline font-normal">
                {post.title}
              </span>
            </nav>

            {/* University & Conference Crest Attribution */}
            <div className="flex items-center gap-2 text-white/80 text-[11px] shrink-0">
              <span className="inline-block size-2 rounded-xs bg-[#115eff] animate-pulse" />
              <span className="font-semibold text-white">IEEE SMC 2027</span>
              <span className="text-white/40">•</span>
              <span>Host: HCM-UTE, Ho Chi Minh City</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Main 12-Column Responsive Editorial Grid ── */}
      <div className="w-full max-w-[var(--site-width)] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column (1 col): Floating Action Dock (Desktop XL only) */}
          <div className="hidden xl:block xl:col-span-1">
            <NewsDetailClient
              title={post.title}
              slug={post.slug}
              summary={post.summary || ""}
            />
          </div>

          {/* Center Column (7-8 cols): Main Editorial Article */}
          <main className="col-span-1 xl:col-span-8 bg-white rounded-sm border border-slate-200/90 p-5 sm:p-8 lg:p-10 shadow-2xs space-y-6 sm:space-y-8">
            {/* Top Navigation & Category Pill */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <Link
                href="/#news"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#115eff] hover:text-[#004776] transition-colors group"
              >
                <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" />
                <span>All Announcements</span>
              </Link>

              <span className="inline-flex items-center px-2.5 py-0.5 rounded-sm text-[11px] font-bold uppercase tracking-wider text-[#004776] bg-blue-50 border border-blue-200">
                {post.category}
              </span>
            </div>

            {/* Article Headline */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#004776] tracking-tight leading-[1.25]">
              {post.title}
            </h1>

            {/* Article Editorial Metadata Bar */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-xs text-slate-500 py-3 px-4 rounded-sm bg-slate-50/80 border border-slate-100">
              <div className="flex items-center gap-1.5 font-normal text-slate-700">
                <Calendar className="size-3.5 text-[#115eff]" />
                <span>{formattedDate}</span>
              </div>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-1.5 font-normal text-slate-700">
                <Clock className="size-3.5 text-[#115eff]" />
                <span>{readingTimeMin} min read</span>
              </div>
              {post.views > 0 && (
                <>
                  <span className="text-slate-300">•</span>
                  <div className="flex items-center gap-1.5 font-normal text-slate-700">
                    <Eye className="size-3.5 text-[#115eff]" />
                    <span>{post.views.toLocaleString("en-US")} views</span>
                  </div>
                </>
              )}
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-1.5 font-normal text-slate-700">
                <User className="size-3.5 text-[#115eff]" />
                <span className="truncate max-w-[200px]">{post.authorName}</span>
              </div>
            </div>

            {/* Excerpt / Lead Summary Callout with Royal Blue Accent Border */}
            {post.summary && (
              <div className="rounded-sm border-l-4 border-[#115eff] bg-blue-50/60 p-4 sm:p-5">
                <p className="text-sm sm:text-base font-normal text-slate-700 leading-relaxed italic">
                  &ldquo;{post.summary}&rdquo;
                </p>
              </div>
            )}

            {/* Hero Cover Image (if available) */}
            {post.coverImage && (
              <div className="relative aspect-[16/9] w-full rounded-sm overflow-hidden border border-slate-200/90 shadow-2xs bg-slate-100">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  unoptimized
                  priority
                  className="object-cover"
                  sizes="(max-width: 1280px) 100vw, 850px"
                />
              </div>
            )}

            {/* Authentic HCMUTE Article Reader (Strict Line-Height 1.8 & Academic Typography) */}
            <article className="pt-2">
              <div
                className="tiptap post-reader prose prose-slate sm:prose-lg max-w-none text-slate-800 leading-[1.8] font-sans prose-headings:font-bold prose-headings:text-[#004776] prose-headings:tracking-tight prose-a:text-[#115eff] prose-a:font-semibold hover:prose-a:underline prose-img:rounded-sm prose-img:border prose-img:border-slate-200 prose-blockquote:border-l-[#115eff] prose-blockquote:bg-blue-50/40 prose-blockquote:p-4 prose-blockquote:rounded-r-sm prose-table:border prose-table:border-slate-200 prose-th:bg-slate-50 prose-th:text-[#004776] prose-th:font-semibold"
                dangerouslySetInnerHTML={{
                  __html:
                    post.content.includes("<") && post.content.includes(">")
                      ? post.content
                      : `<p>${post.content}</p>`,
                }}
              />
            </article>

            {/* Article Subject Tags */}
            <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mr-2">
                <Tag className="size-3.5 text-[#115eff]" />
                <span>Tags:</span>
              </div>
              {["IEEE SMC 2027", "HCMUTE", post.category, "Ho Chi Minh City", "Conference"].map(
                (tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    #{tag.replace(/\s+/g, "")}
                  </span>
                )
              )}
            </div>

            {/* Official University & Conference Signature Box */}
            <div className="rounded-sm border border-blue-100 bg-gradient-to-br from-blue-50/70 to-slate-50/60 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="size-11 rounded-sm bg-[#004776] text-white flex items-center justify-center shrink-0 shadow-2xs font-bold text-xs">
                  SMC
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#004776] leading-snug">
                    IEEE SMC 2027 Organizing Secretariat
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Ho Chi Minh City University of Technology and Education (HCM-UTE)
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Contact: <span className="text-[#115eff] font-medium">smc2027@hcmute.edu.vn</span>
                  </p>
                </div>
              </div>

              <Link
                href="/#contact"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-sm bg-white border border-slate-200 text-xs font-semibold text-[#004776] hover:bg-slate-50 transition-colors shrink-0 shadow-2xs"
              >
                <span>Contact Committee</span>
                <ChevronRight className="size-3.5 text-slate-400" />
              </Link>
            </div>

            {/* Mobile / Inline Actions Dock rendered by client */}
            <div className="xl:hidden">
              <NewsDetailClient
                title={post.title}
                slug={post.slug}
                summary={post.summary || ""}
              />
            </div>
          </main>

          {/* Right Sidebar (3-4 cols): University / Conference widgets */}
          <aside className="col-span-1 xl:col-span-3 space-y-6">
            {/* ── Widget 1: Important Conference Milestones ── */}
            <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-[#004776] uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="size-4 text-[#115eff]" />
                  <span>Important Dates</span>
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#115eff] bg-blue-50 px-2 py-0.5 rounded-sm border border-blue-200">
                  2027
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-2.5 rounded-sm bg-slate-50 border border-slate-100/90 flex flex-col gap-1">
                  <span className="font-semibold text-slate-800">
                    Regular Paper Submission
                  </span>
                  <span className="text-slate-500 flex items-center justify-between">
                    <span>Deadline</span>
                    <span className="font-semibold text-[#004776]">May 15, 2027</span>
                  </span>
                </div>

                <div className="p-2.5 rounded-sm bg-slate-50 border border-slate-100/90 flex flex-col gap-1">
                  <span className="font-semibold text-slate-800">
                    Acceptance Notification
                  </span>
                  <span className="text-slate-500 flex items-center justify-between">
                    <span>Notification</span>
                    <span className="font-semibold text-[#004776]">July 15, 2027</span>
                  </span>
                </div>

                <div className="p-2.5 rounded-sm bg-slate-50 border border-slate-100/90 flex flex-col gap-1">
                  <span className="font-semibold text-slate-800">
                    Final Camera-Ready
                  </span>
                  <span className="text-slate-500 flex items-center justify-between">
                    <span>Final Submission</span>
                    <span className="font-semibold text-[#004776]">August 15, 2027</span>
                  </span>
                </div>

                <div className="p-2.5 rounded-sm bg-blue-50/70 border border-blue-100 flex flex-col gap-1">
                  <span className="font-bold text-[#004776]">
                    Conference Main Dates
                  </span>
                  <span className="text-slate-600 flex items-center justify-between">
                    <span>Sheraton Saigon</span>
                    <span className="font-bold text-[#115eff]">October 17–20, 2027</span>
                  </span>
                </div>
              </div>

              <Link
                href="/#dates"
                className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-sm bg-[#115eff] hover:bg-[#0a4de6] text-white text-xs font-semibold transition-colors shadow-2xs"
              >
                <span>View Full Timeline</span>
                <ChevronRight className="size-3.5" />
              </Link>
            </div>

            {/* ── Widget 2: Related & Recent Announcements ── */}
            {relatedPosts.length > 0 && (
              <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-[#004776] uppercase tracking-wider flex items-center gap-2">
                    <FileText className="size-4 text-[#115eff]" />
                    <span>Related News</span>
                  </h3>
                </div>

                <div className="divide-y divide-slate-100">
                  {relatedPosts.map((item, idx) => (
                    <article key={item.id} className="py-3 first:pt-0 last:pb-0 group">
                      <Link href={`/news/${item.slug}`} className="block space-y-1.5">
                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          <span className="font-bold uppercase tracking-wider text-[#115eff]">
                            {item.category}
                          </span>
                          <span>•</span>
                          <span>{item.date}</span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-[#115eff] transition-colors line-clamp-2 leading-snug">
                          {item.title}
                        </h4>
                      </Link>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {/* ── Widget 3: Key Resources & Downloads ── */}
            <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-2xs space-y-3">
              <h3 className="text-sm font-bold text-[#004776] uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
                <Download className="size-4 text-[#115eff]" />
                <span>Conference Resources</span>
              </h3>

              <div className="space-y-2 text-xs">
                <a
                  href="/CFP - IEEE SMC 2027 - 13.10.2026.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-sm border border-slate-200 hover:border-[#115eff] hover:bg-slate-50 transition-colors group"
                >
                  <div className="flex items-center gap-2.5 text-slate-700 font-medium">
                    <FileText className="size-4 text-[#115eff]" />
                    <span>Call for Papers (PDF)</span>
                  </div>
                  <Download className="size-3.5 text-slate-400 group-hover:text-[#115eff] transition-colors" />
                </a>

                <Link
                  href="/travel"
                  className="flex items-center justify-between p-2.5 rounded-sm border border-slate-200 hover:border-[#115eff] hover:bg-slate-50 transition-colors group"
                >
                  <div className="flex items-center gap-2.5 text-slate-700 font-medium">
                    <MapPin className="size-4 text-[#115eff]" />
                    <span>Venue &amp; Travel Guide</span>
                  </div>
                  <ChevronRight className="size-3.5 text-slate-400 group-hover:text-[#115eff] transition-colors" />
                </Link>

                <a
                  href="https://hcmute.edu.vn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-sm border border-slate-200 hover:border-[#115eff] hover:bg-slate-50 transition-colors group"
                >
                  <div className="flex items-center gap-2.5 text-slate-700 font-medium">
                    <GraduationCap className="size-4 text-[#115eff]" />
                    <span>HCM-UTE Portal</span>
                  </div>
                  <ExternalLink className="size-3.5 text-slate-400 group-hover:text-[#115eff] transition-colors" />
                </a>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* ── 3. Edge-to-Edge Full Viewport Divider (Exact HCMUTE Specification) ── */}
      <div className="w-full border-t border-slate-200 my-8 lg:my-14" />

      {/* ── 4. Bottom Announcements Archive Showcase ── */}
      {relatedPosts.length > 0 && (
        <section className="w-full max-w-[var(--site-width)] mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24">
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-[#004776] tracking-tight">
                  More Announcements &amp; Updates
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Stay updated with official milestones from the organizing committee
                </p>
              </div>
              <Link
                href="/#news"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#115eff] hover:text-[#004776] transition-colors"
              >
                <span>View all announcements</span>
                <ChevronRight className="size-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.slice(0, 3).map((related) => (
                <div
                  key={related.id}
                  className="group flex flex-col justify-between rounded-sm bg-white border border-slate-200 hover:border-[#115eff] overflow-hidden transition-all duration-300 shadow-2xs hover:shadow-md"
                >
                  <div>
                    {related.coverImage ? (
                      <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
                        <Image
                          src={related.coverImage}
                          alt={related.title}
                          fill
                          unoptimized
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, 360px"
                        />
                      </div>
                    ) : (
                      <div className="aspect-[16/9] w-full bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center text-slate-400">
                        <FileText className="size-8 text-[#115eff]/40" />
                      </div>
                    )}

                    <div className="p-5 space-y-2.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#115eff]">
                        {related.category}
                      </span>
                      <h4 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#115eff] transition-colors line-clamp-2 leading-snug">
                        {related.title}
                      </h4>
                      {related.summary && (
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {related.summary}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-5 pt-0 border-t border-slate-100 mt-2 flex items-center justify-between gap-2">
                    <span className="text-[11px] font-medium text-slate-500">
                      {related.date}
                    </span>
                    <Link
                      href={`/news/${related.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#115eff] hover:text-[#004776] whitespace-nowrap shrink-0"
                    >
                      <span>Read Announcement</span>
                      <ChevronRight className="size-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
