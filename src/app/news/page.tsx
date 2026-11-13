import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { NewsList } from "@/components/sections/NewsList";
import { cmsService } from "@/services";
import { withTimeout } from "@/lib";
import { getCurrentUser } from "@/lib/auth";
import { canViewPage } from "@/lib/page-access";
import { PublicPageRenderer } from "@/app/(public)/[slug]/public-page-renderer";
import { DraftPreviewBanner } from "@/components/shared/draft-preview-banner";
import type { PageBlock } from "@/modules/website-builder/types";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string }>;
}): Promise<Metadata> {
  const page = await cmsService.getPageByIdOrSlug("news").catch(() => null);
  if (page?.meta_title || page?.meta_description) {
    return {
      title: page.meta_title || "News & Announcements | IEEE SMC 2027",
      description:
        page.meta_description ||
        "Official announcements, call for papers, important deadlines, and conference milestones for IEEE SMC 2027.",
    };
  }
  return {
    title: "News & Announcements | IEEE SMC 2027",
    description:
      "Official announcements, call for papers, important deadlines, and conference milestones for IEEE SMC 2027.",
  };
}

export default async function NewsArchivePage({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string }>;
}) {
  const { preview } = await searchParams;
  const isPreview = preview === "true" || preview === "1";
  let page: Awaited<ReturnType<typeof cmsService.getPageByIdOrSlug>> = null;

  try {
    page = await withTimeout(
      cmsService.getPageByIdOrSlug("news"),
      2500,
      null
    );
  } catch (err) {
    console.error("Failed to fetch news page blocks via Prisma, using fallback", err);
  }

  if (page) {
    const user = !page.is_published && isPreview ? await getCurrentUser() : null;
    if (!canViewPage(page.is_published, preview, user?.role)) notFound();

    let blocks: PageBlock[] = [];
    if (Array.isArray(page.blocks) && page.blocks.length > 0) {
      blocks = page.blocks as unknown as PageBlock[];
    } else if (
      page.content &&
      typeof page.content === "object" &&
      Array.isArray((page.content as any).content) &&
      (page.content as any).content.length > 0
    ) {
      blocks = (page.content as any).content as PageBlock[];
    }

    if (blocks.length > 0) {
      return (
        <div className="w-full flex flex-col">
          {!page.is_published && isPreview && (
            <DraftPreviewBanner version={page.version} />
          )}
          <PublicPageRenderer blocks={blocks} />
        </div>
      );
    }
  }

  return (
    <div className="w-full bg-white font-sans text-slate-800 min-h-screen">
      {/* Top Breadcrumb Bar */}
      <div className="w-full border-b border-slate-100 bg-slate-50/70">
        <div className="w-full max-w-[var(--site-width)] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center gap-2 text-xs sm:text-sm text-slate-500">
          <Link href="/" className="hover:text-[#115eff] transition-colors font-normal">
            Home
          </Link>
          <ChevronRight className="size-3.5 text-slate-400" />
          <span className="text-slate-600 font-normal">News &amp; Announcements</span>
        </div>
      </div>

      {/* Main News Section */}
      <div className="w-full">
        <NewsList />
      </div>
    </div>
  );
}
