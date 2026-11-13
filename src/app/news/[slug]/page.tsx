import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  Calendar,
  Clock,
  ChevronRight,
  Eye,
  FileText,
  Download,
  Building,
  GraduationCap,
  MapPin,
  ExternalLink,
  Tag,
} from "lucide-react";
import { prisma } from "@/lib";
import { PostStatus } from "@prisma/client";
import { DEFAULT_NEWS_ITEMS } from "@/data/news-data";
import { NewsDetailToolbar, NewsDetailShareBar } from "./news-detail-client";
import { GridPattern } from "@/components/ui/grid-pattern";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

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
      // Real view tracking: Increment view count on each visit in PostgreSQL
      prisma.post
        .update({
          where: { id: post.id },
          data: { views: { increment: 1 } },
        })
        .catch(() => {});

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
          views: (post.views || 0) + 1,
          publishedAt: post.publishedAt?.toISOString() || post.createdAt.toISOString(),
          updatedAt: post.updatedAt.toISOString(),
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
        updatedAt: undefined,
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

  const coverImage = post.coverImage || "/carousel/hero-desktop.jpg";

  return (
    <div className="w-full bg-[#f8fafc]/40 font-sans text-slate-800 min-h-screen">
      {/* ── 0. High-Resolution Hero Cover Image (Edge-to-Edge 16:9 Ratio) ── */}
      {coverImage && (
        <section className="relative z-20 w-full overflow-hidden bg-slate-950 border-0 p-0 m-0">
          <div className="relative w-full aspect-[16/9] max-h-[75vh]">
            <Image
              src={coverImage}
              alt={post.title}
              fill
              priority
              unoptimized
              className="object-cover w-full h-full"
              sizes="100vw"
            />
          </div>
        </section>
      )}

      {/* ── 1. Sticky Breadcrumb Bar with Royal Primary Blue & Subtle Dot Pattern ── */}
      <section className="sticky top-16 sm:top-[72px] z-40 w-full bg-primary text-white overflow-hidden border-0 shadow-md">
        {/* Subtle HCMUTE Royal Blue Dot Pattern in Bottom-Right Corner */}
        <div
          className="pointer-events-none absolute bottom-0 right-0 h-full w-56 sm:w-80 md:w-96 select-none opacity-35 sm:opacity-40"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255, 255, 255, 0.75) 1.2px, transparent 1.2px)",
            backgroundSize: "13px 13px",
            WebkitMaskImage: "radial-gradient(ellipse 90% 90% at 100% 100%, black 20%, transparent 75%)",
            maskImage: "radial-gradient(ellipse 90% 90% at 100% 100%, black 20%, transparent 75%)",
          }}
          aria-hidden="true"
        />

        <div className="w-full max-w-[var(--site-width)] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4 relative z-10">
          <div className="flex items-center text-xs sm:text-sm">
            {/* Breadcrumb Navigation — Unified font sizes and weights */}
            <nav
              aria-label="Breadcrumbs"
              className="flex items-center gap-2 text-white/90 overflow-x-auto scrollbar-none font-medium"
            >
              <Link
                href="/"
                className="hover:text-white transition-colors shrink-0 hover:underline"
              >
                Home
              </Link>
              <ChevronRight className="size-3.5 shrink-0 text-white/60" />
              <Link
                href="/#news"
                className="hover:text-white transition-colors shrink-0 hover:underline"
              >
                News &amp; Announcements
              </Link>
              <ChevronRight className="size-3.5 shrink-0 text-white/60" />
              <span className="text-white/80 shrink-0">{post.category}</span>
              <ChevronRight className="size-3.5 shrink-0 text-white/60 hidden sm:inline" />
              <span className="text-white truncate max-w-[200px] sm:max-w-md hidden sm:inline font-semibold">
                {post.title}
              </span>
            </nav>
          </div>
        </div>
      </section>

      {/* ── 2. Main Article Section with Full-Width Header & Clean Unbordered Layout ── */}
      <div className="w-full max-w-[var(--site-width)] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        {/* Full-Width Article Header */}
        <div className="mb-6 lg:mb-8">
          {/* Category Badge */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Link
              href="/#news"
              className="inline-flex items-center px-3 py-1 rounded-sm text-xs font-semibold text-white bg-primary hover:bg-primary/90 shadow-xs transition-colors"
            >
              {post.category}
            </Link>
          </div>

          {/* Title - Full Width */}
          <h1 className="w-full text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#004776] leading-tight mb-6">
            {post.title}
          </h1>

          {/* Author & Meta Info Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-3.5 border-y border-slate-200/80 text-xs sm:text-sm">
            {/* Author */}
            <div className="flex items-center gap-3">
              <div
                className="size-9 rounded-full bg-primary/10 text-primary flex items-center justify-center border border-slate-200 shrink-0 shadow-xs font-semibold text-sm uppercase"
                style={{ borderRadius: "50%" }}
              >
                {post.authorName.trim().charAt(0)}
              </div>
              <div className="text-left">
                <span className="block text-sm font-semibold text-[#004776] leading-tight">
                  {post.authorName}
                </span>
              </div>
            </div>

            {/* Metadata Stats */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-slate-500 font-medium">
              <div className="flex items-center gap-1.5 text-slate-600">
                <Calendar className="size-4 text-primary" />
                <span>{formattedDate}</span>
              </div>

              {post.views > 0 && (
                <>
                  <div className="w-1 h-1 bg-slate-300 rounded-full hidden sm:block" />
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Eye className="size-4 text-primary" />
                    <span>{post.views.toLocaleString("en-US")} views</span>
                  </div>
                </>
              )}

              <div className="w-1 h-1 bg-slate-300 rounded-full hidden sm:block" />
              <div className="flex items-center gap-1.5 text-slate-600">
                <Clock className="size-4 text-primary" />
                <span>{readingTimeMin} min read</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Row: Left Sticky Toolbar + Unbordered Clean Article */}
        <div className="flex gap-6 lg:gap-10 items-start">
          {/* Left Buttons - Sticky Toolbar (Rounded-full pills) */}
          <NewsDetailToolbar
            title={post.title}
            slug={post.slug}
            summary={post.summary || ""}
            initialUpdatedAt={post.updatedAt}
          />

          {/* Main Article Content - Takes Remaining Width, No Box Border! */}
          <article className="post-public-article flex-1 min-w-0 w-full space-y-6 sm:space-y-8">
            {/* Excerpt / Lead Summary Callout with Royal Blue Accent Border */}
            {post.summary && (
              <div className="rounded-sm border-l-4 border-primary bg-primary/5 p-4 sm:p-5">
                <p className="text-sm sm:text-base font-normal text-slate-700 leading-relaxed italic">
                  &ldquo;{post.summary}&rdquo;
                </p>
              </div>
            )}

            {/* Authentic Academic Article Reader (Strict Line-Height 1.8 & Academic Typography) */}
            <div
              className="tiptap post-reader prose prose-slate sm:prose-lg max-w-none text-slate-800 leading-[1.8] font-sans prose-headings:font-bold prose-headings:text-[#004776] prose-headings:tracking-tight prose-a:text-primary prose-a:font-semibold hover:prose-a:underline prose-img:rounded-sm prose-img:border prose-img:border-slate-200 prose-blockquote:border-l-primary prose-blockquote:bg-blue-50/40 prose-blockquote:p-4 prose-blockquote:rounded-r-sm prose-table:border prose-table:border-slate-200 prose-th:bg-slate-50 prose-th:text-[#004776] prose-th:font-semibold"
              dangerouslySetInnerHTML={{
                __html:
                  post.content.includes("<") && post.content.includes(">")
                    ? post.content
                    : `<p>${post.content}</p>`,
              }}
            />

            {/* Article Subject Tags */}
            <div className="pt-6 border-t border-slate-200/75 flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mr-2">
                <Tag className="size-3.5 text-primary" />
                <span>Tags:</span>
              </div>
              {["IEEE SMC 2027", "HCMUTE", post.category, "Ho Chi Minh City", "Conference"].map(
                (tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-sm text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    #{tag.replace(/\s+/g, "")}
                  </span>
                )
              )}
            </div>

            {/* Official University & Conference Signature Box */}
            <div className="rounded-sm border border-blue-100 bg-gradient-to-br from-blue-50/70 to-slate-50/60 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="size-10 rounded-sm bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-2xs font-semibold text-xs">
                  SMC
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-semibold text-[#004776] leading-snug">
                    IEEE SMC 2027 Organizing Secretariat
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 mt-0.5 font-normal">
                    Ho Chi Minh City University of Technology and Education (HCM-UTE)
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 font-normal">
                    Contact: <span className="text-primary font-medium">smc2027@hcmute.edu.vn</span>
                  </p>
                </div>
              </div>

              <Link
                href="/#contact"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-sm bg-white border border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shrink-0 shadow-2xs"
              >
                <span>Contact Committee</span>
                <ChevronRight className="size-3.5 text-slate-400" />
              </Link>
            </div>

            {/* End-of-Article Share Dock */}
            <NewsDetailShareBar
              title={post.title}
              slug={post.slug}
              summary={post.summary || ""}
            />
          </article>
        </div>
      </div>

      {/* ── 3. Edge-to-Edge Full Viewport Divider ── */}
      <div className="w-full border-t border-slate-200 my-8 sm:my-12" />

      {/* ── 4. Full Width Sections Under the Post ── */}
      <div className="w-full max-w-[var(--site-width)] mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24 space-y-12 sm:space-y-16">
        {/* 2-Column Action Cards Block: Key Dates & Conference Resources */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Important Conference Milestones */}
          <div className="rounded-sm border border-slate-200/90 bg-white p-6 shadow-2xs flex flex-col justify-between gap-5">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base sm:text-lg font-bold text-[#004776] flex items-center gap-2">
                  <Calendar className="size-4 text-primary" />
                  <span>Important Dates</span>
                </h3>
                <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-sm border border-primary/20">
                  2027
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                <div className="p-3 rounded-sm bg-slate-50 border border-slate-100 flex flex-col gap-1">
                  <span className="font-semibold text-slate-800">
                    Regular Paper Submission
                  </span>
                  <span className="text-slate-500 flex items-center justify-between">
                    <span className="font-medium">Deadline</span>
                    <span className="font-semibold text-[#004776]">May 15, 2027</span>
                  </span>
                </div>

                <div className="p-3 rounded-sm bg-slate-50 border border-slate-100 flex flex-col gap-1">
                  <span className="font-semibold text-slate-800">
                    Acceptance Notification
                  </span>
                  <span className="text-slate-500 flex items-center justify-between">
                    <span className="font-medium">Notification</span>
                    <span className="font-semibold text-[#004776]">July 15, 2027</span>
                  </span>
                </div>

                <div className="p-3 rounded-sm bg-slate-50 border border-slate-100 flex flex-col gap-1">
                  <span className="font-semibold text-slate-800">
                    Final Camera-Ready
                  </span>
                  <span className="text-slate-500 flex items-center justify-between">
                    <span className="font-medium">Final Submission</span>
                    <span className="font-semibold text-[#004776]">August 15, 2027</span>
                  </span>
                </div>

                <div className="p-3 rounded-sm bg-blue-50/70 border border-blue-100 flex flex-col gap-1">
                  <span className="font-semibold text-[#004776]">
                    Conference Main Dates
                  </span>
                  <span className="text-slate-600 flex items-center justify-between">
                    <span className="font-medium">Sheraton Saigon</span>
                    <span className="font-semibold text-primary">October 17–20, 2027</span>
                  </span>
                </div>
              </div>
            </div>

            <Link
              href="/#dates"
              className="inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-sm bg-primary hover:bg-primary/90 text-white text-xs sm:text-sm font-semibold transition-colors shadow-2xs self-start"
            >
              <span>View Full Timeline</span>
              <ChevronRight className="size-3.5" />
            </Link>
          </div>

          {/* Card 2: Key Resources & Downloads */}
          <div className="rounded-sm border border-slate-200/90 bg-white p-6 shadow-2xs flex flex-col justify-between gap-5">
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base sm:text-lg font-bold text-[#004776] flex items-center gap-2">
                  <Download className="size-4 text-primary" />
                  <span>Conference Resources</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                <a
                  href="/CFP - IEEE SMC 2027 - 13.10.2026.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-sm border border-slate-200 hover:border-primary hover:bg-slate-50 transition-colors group"
                >
                  <div className="flex items-center gap-2 text-slate-700 font-medium">
                    <FileText className="size-4 text-primary" />
                    <span>Call for Papers (PDF)</span>
                  </div>
                  <Download className="size-3.5 text-slate-400 group-hover:text-primary transition-colors" />
                </a>

                <Link
                  href="/travel"
                  className="flex items-center justify-between p-3 rounded-sm border border-slate-200 hover:border-primary hover:bg-slate-50 transition-colors group"
                >
                  <div className="flex items-center gap-2 text-slate-700 font-medium">
                    <MapPin className="size-4 text-primary" />
                    <span>Venue &amp; Travel Guide</span>
                  </div>
                  <ChevronRight className="size-3.5 text-slate-400 group-hover:text-primary transition-colors" />
                </Link>

                <a
                  href="https://hcmute.edu.vn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-sm border border-slate-200 hover:border-primary hover:bg-slate-50 transition-colors group"
                >
                  <div className="flex items-center gap-2 text-slate-700 font-medium">
                    <GraduationCap className="size-4 text-primary" />
                    <span>HCM-UTE Portal</span>
                  </div>
                  <ExternalLink className="size-3.5 text-slate-400 group-hover:text-primary transition-colors" />
                </a>

                <Link
                  href="/#contact"
                  className="flex items-center justify-between p-3 rounded-sm border border-slate-200 hover:border-primary hover:bg-slate-50 transition-colors group"
                >
                  <div className="flex items-center gap-2 text-slate-700 font-medium">
                    <Building className="size-4 text-primary" />
                    <span>Contact Committee</span>
                  </div>
                  <ChevronRight className="size-3.5 text-slate-400 group-hover:text-primary transition-colors" />
                </Link>
              </div>
            </div>

            <Link
              href="/#contact"
              className="inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-sm border border-primary text-primary hover:bg-primary hover:text-white text-xs sm:text-sm font-semibold transition-colors shadow-2xs self-start"
            >
              <span>Get in Touch</span>
              <ChevronRight className="size-3.5" />
            </Link>
          </div>
        </section>

        {/* Synced More Announcements & Updates Section (Synchronized Font Size & Weights with Home Page) */}
        {relatedPosts.length > 0 && (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-[#004776] tracking-tight">
                  More Announcements &amp; Updates
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-normal">
                  Stay updated with official milestones from the organizing committee
                </p>
              </div>
              <Link
                href="/#news"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary hover:underline transition-colors"
              >
                <span>View all announcements</span>
                <ChevronRight className="size-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPosts.slice(0, 3).map((news) => {
                const detailUrl = `/news/${news.slug}`;

                return (
                  <article
                    key={news.id}
                    className="group group/card relative flex flex-col overflow-hidden rounded-sm bg-white border border-slate-200/90 hover:border-[#115eff] hover:bg-[#115eff] transition-all duration-300 cursor-pointer select-none"
                  >
                    {/* Grid pattern — visible on hover at bottom right (HCMUTE style) */}
                    <GridPattern
                      width={32}
                      height={32}
                      className="pointer-events-none absolute inset-0 z-[1] stroke-white/0 fill-transparent transition-colors duration-200 group-hover:stroke-white/[0.08] group-hover/card:stroke-white/[0.08] [mask-image:radial-gradient(ellipse_75%_65%_at_bottom_right,white_40%,transparent_100%)]"
                    />

                    {/* UTE Flower watermark — appears subtle at bottom right on hover without rotation */}
                    <Image
                      src="/assets/flower-ute-white.png"
                      alt=""
                      width={260}
                      height={260}
                      unoptimized
                      className="pointer-events-none absolute -bottom-16 -right-16 z-[1] select-none opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-[0.14] group-hover/card:opacity-[0.14]"
                      aria-hidden="true"
                    />

                    {/* Padded Image Container with aspect-[16/9] (hcmute-website style) */}
                    <div className="relative z-[2] overflow-hidden p-2 sm:p-2.5">
                      <Link
                        href={detailUrl}
                        className="block relative aspect-[16/9] w-full overflow-hidden rounded-sm bg-slate-100"
                      >
                        {news.coverImage ? (
                          <Image
                            src={news.coverImage}
                            alt={news.title}
                            fill
                            unoptimized
                            className="object-cover transition-transform duration-500 ease-out will-change-transform group-hover:scale-105 group-hover/card:scale-105"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#115eff] to-[#004776]">
                            <span className="text-base sm:text-lg font-semibold text-white/40">IEEE SMC</span>
                          </div>
                        )}
                      </Link>
                    </div>

                    {/* Card Content Area: Title, Summary, and Post Detail Button */}
                    <div className="relative z-[2] flex flex-1 flex-col px-5 pb-5 pt-2 justify-between gap-4">
                      <div className="space-y-2">
                        <Link href={detailUrl} className="block">
                          <h4 className="news-card-title line-clamp-2 text-base sm:text-lg font-semibold leading-snug text-slate-900 group-hover:!text-white group-hover/card:!text-white transition-colors duration-200">
                            {news.title}
                          </h4>
                        </Link>
                        {news.summary && (
                          <p className="news-card-summary line-clamp-2 text-sm text-slate-600 group-hover:!text-white/80 group-hover/card:!text-white/80 leading-relaxed transition-colors duration-200 font-normal">
                            {news.summary}
                          </p>
                        )}
                      </div>

                      {/* Bottom Action Row: Date + View Details Button */}
                      <div className="pt-3 border-t border-slate-100 group-hover:border-white/20 group-hover/card:border-white/20 flex items-center justify-between gap-3">
                        <span className="news-card-date text-xs sm:text-sm font-medium text-slate-500 group-hover:!text-white/85 group-hover/card:!text-white/85 transition-colors duration-200 whitespace-nowrap">
                          {news.date}
                        </span>
                        <Link
                          href={detailUrl}
                          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#115eff] group-hover:bg-white text-white group-hover:!text-[#115eff] group-hover/card:bg-white group-hover/card:!text-[#115eff] text-xs sm:text-sm font-semibold rounded-sm transition-all duration-200 whitespace-nowrap shadow-xs hover:shadow-md cursor-pointer shrink-0"
                        >
                          <span>View Details</span>
                          <ChevronRight className="size-4" />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
