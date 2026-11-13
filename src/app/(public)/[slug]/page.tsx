import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib";
import { getCurrentUser } from "@/lib/auth";
import { canViewPage } from "@/lib/page-access";
import { PublicPageRenderer } from "./public-page-renderer";
import { STANDARD_CONFERENCE_PAGES } from "@/app/api/admin/pages/route";
import type { PageBlock } from "@/modules/website-builder/types";
import { DraftPreviewBanner } from "@/components/shared/draft-preview-banner";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { preview } = await searchParams;
  const page = await prisma.page.findFirst({
    where: {
      OR: [{ slug }, { id: slug }],
    },
  });

  if (!page) {
    const std = STANDARD_CONFERENCE_PAGES.find(
      (p) => p.slug === slug || p.id === slug
    );
    if (std) {
      return {
        title: std.metaTitle || `${std.title} | IEEE SMC 2027`,
        description:
          std.metaDescription ||
          "Official Conference Website for IEEE SMC 2027 in Ho Chi Minh City, Vietnam",
      };
    }
    return { title: "Page Not Found | IEEE SMC 2027" };
  }

  const user = !page.isPublished && (preview === "true" || preview === "1") ? await getCurrentUser() : null;
  if (!canViewPage(page.isPublished, preview, user?.role)) {
    return { title: "Page Not Found | IEEE SMC 2027", robots: { index: false, follow: false } };
  }

  return {
    title: page.metaTitle || `${page.title} | IEEE SMC 2027`,
    description:
      page.metaDescription ||
      "Official Conference Website for IEEE SMC 2027 in Ho Chi Minh City, Vietnam",
    openGraph: {
      title: page.metaTitle || `${page.title} | IEEE SMC 2027`,
      description:
        page.metaDescription ||
        "Official Conference Website for IEEE SMC 2027 in Ho Chi Minh City, Vietnam",
      type: "website",
    },
    ...(!page.isPublished ? { robots: { index: false, follow: false } } : {}),
  };
}

export default async function PublicPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}) {
  const { slug } = await params;
  const { preview } = await searchParams;
  const isPreview = preview === "true" || preview === "1";

  let page = await prisma.page.findFirst({
    where: {
      OR: [{ slug }, { id: slug }],
    },
  });

  if (!page) {
    const stdPage = STANDARD_CONFERENCE_PAGES.find(
      (p) => p.id === slug || p.slug === slug
    );
    if (stdPage) {
      page = await prisma.page.create({
        data: {
          id: stdPage.id,
          slug: stdPage.slug,
          title: stdPage.title,
          blocks: stdPage.blocks,
          content: {
            root: { title: stdPage.title, slug: stdPage.slug },
            content: stdPage.blocks,
          },
          isPublished: true,
          metaTitle: stdPage.metaTitle,
          metaDescription: stdPage.metaDescription,
          version: 1,
        },
      });
    } else {
      notFound();
    }
  }

  // Draft access protection
  const user = !page.isPublished && isPreview ? await getCurrentUser() : null;
  if (!canViewPage(page.isPublished, preview, user?.role)) {
    notFound();
  }

  // Normalize blocks
  let blocks: PageBlock[] = [];
  const rawContent: any = page.content;
  if (rawContent && typeof rawContent === "object" && Array.isArray(rawContent.content)) {
    blocks = rawContent.content;
  } else if (Array.isArray(page.blocks)) {
    blocks = page.blocks as any[];
  }

  return (
    <div className="w-full flex flex-col">
      {/* Draft Preview Banner */}
      {!page.isPublished && isPreview && (
        <DraftPreviewBanner version={page.version} />
      )}

      <PublicPageRenderer blocks={blocks} />
    </div>
  );
}
