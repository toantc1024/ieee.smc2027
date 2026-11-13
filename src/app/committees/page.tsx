import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CommitteesSection } from "@/components/sections/CommitteesSection";
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
  const page = await cmsService.getPageByIdOrSlug("committees").catch(() => null);
  if (page?.meta_title || page?.meta_description) {
    return {
      title: page.meta_title || "Committees & Leadership | IEEE SMC 2027",
      description:
        page.meta_description ||
        "Organizing Committee, Steering Committee, General Chairs, and Program Chairs of the 2027 IEEE International Conference on Systems, Man, and Cybernetics (IEEE SMC 2027), hosted by HCM-UTE.",
      openGraph: {
        title: page.meta_title || "Committees & Leadership | IEEE SMC 2027",
        description:
          page.meta_description ||
          "Meet the international steering and local organizing committees leading IEEE SMC 2027 in Ho Chi Minh City, Vietnam.",
      },
    };
  }
  return {
    title: "Committees & Leadership | IEEE SMC 2027",
    description:
      "Organizing Committee, Steering Committee, General Chairs, and Program Chairs of the 2027 IEEE International Conference on Systems, Man, and Cybernetics (IEEE SMC 2027), hosted by HCM-UTE.",
    openGraph: {
      title: "Committees & Leadership | IEEE SMC 2027",
      description:
        "Meet the international steering and local organizing committees leading IEEE SMC 2027 in Ho Chi Minh City, Vietnam.",
    },
  };
}

export default async function CommitteesPage({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string }>;
}) {
  const { preview } = await searchParams;
  const isPreview = preview === "true" || preview === "1";
  let page: Awaited<ReturnType<typeof cmsService.getPageByIdOrSlug>> = null;

  try {
    page = await withTimeout(
      cmsService.getPageByIdOrSlug("committees"),
      2500,
      null
    );
  } catch (err) {
    console.error("Failed to fetch committees page blocks via Prisma, using fallback", err);
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
    <div className="w-full flex flex-col">
      <CommitteesSection
        title="Organizing Committee"
        subtitle="International Steering & Local Organizing Committees for IEEE SMC 2027 in Ho Chi Minh City, Vietnam"
        autoplayDuration={4}
        showAllGroups={true}
      />
    </div>
  );
}
