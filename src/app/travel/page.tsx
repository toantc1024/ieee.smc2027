import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cmsService } from "@/services";
import { withTimeout } from "@/lib";
import { getCurrentUser } from "@/lib/auth";
import { canViewPage } from "@/lib/page-access";
import { PublicPageRenderer } from "@/app/(public)/[slug]/public-page-renderer";
import { DraftPreviewBanner } from "@/components/shared/draft-preview-banner";
import type { PageBlock } from "@/modules/website-builder/types";
import { TravelFallbackView } from "./travel-fallback";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string }>;
}): Promise<Metadata> {
  const page = await cmsService.getPageByIdOrSlug("travel").catch(() => null);
  if (page?.meta_title || page?.meta_description) {
    return {
      title: page.meta_title || "Travel & Accommodation | IEEE SMC 2027",
      description:
        page.meta_description ||
        "Venue, hotel accommodation, and Ho Chi Minh City travel guide for IEEE SMC 2027 delegates.",
    };
  }
  return {
    title: "Travel & Accommodation | IEEE SMC 2027",
    description:
      "Essential guide to the conference venue at Sheraton Saigon Grand Opera Hotel, international arrivals, visa regulations, and iconic destinations in Ho Chi Minh City.",
    openGraph: {
      title: "Travel & Accommodation | IEEE SMC 2027",
      description:
        "Essential guide to the conference venue at Sheraton Saigon Grand Opera Hotel, international arrivals, visa regulations, and iconic destinations in Ho Chi Minh City.",
    },
  };
}

export default async function TravelPage({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string }>;
}) {
  const { preview } = await searchParams;
  const isPreview = preview === "true" || preview === "1";
  let page: Awaited<ReturnType<typeof cmsService.getPageByIdOrSlug>> = null;

  try {
    page = await withTimeout(
      cmsService.getPageByIdOrSlug("travel"),
      2500,
      null
    );
  } catch (err) {
    console.error("Failed to fetch travel page blocks via Prisma, using fallback", err);
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

  return <TravelFallbackView />;
}
