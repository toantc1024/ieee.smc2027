import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cmsService } from "@/services";
import { withTimeout } from "@/lib";
import { getCurrentUser } from "@/lib/auth";
import { canViewPage } from "@/lib/page-access";
import { PublicPageRenderer } from "@/app/(public)/[slug]/public-page-renderer";
import { DraftPreviewBanner } from "@/components/shared/draft-preview-banner";
import type { PageBlock } from "@/modules/website-builder/types";
import { SubmissionsFallbackView } from "./submissions-fallback";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string }>;
}): Promise<Metadata> {
  const page = await cmsService.getPageByIdOrSlug("submissions").catch(() => null);
  if (page?.meta_title || page?.meta_description) {
    return {
      title: page.meta_title || "Submissions & CFP | IEEE SMC 2027",
      description:
        page.meta_description ||
        "Author submission guidelines, templates, and key paper submission deadlines for IEEE SMC 2027.",
    };
  }
  return {
    title: "Call for Papers & Submissions | IEEE SMC 2027",
    description:
      "Author submission guidelines, IEEE manuscript templates, and key paper submission deadlines for IEEE SMC 2027 in Ho Chi Minh City, Vietnam.",
    openGraph: {
      title: "Call for Papers & Submissions | IEEE SMC 2027",
      description:
        "Author submission guidelines, IEEE manuscript templates, and key paper submission deadlines for IEEE SMC 2027 in Ho Chi Minh City, Vietnam.",
    },
  };
}

export default async function SubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string }>;
}) {
  const { preview } = await searchParams;
  const isPreview = preview === "true" || preview === "1";
  let page: Awaited<ReturnType<typeof cmsService.getPageByIdOrSlug>> = null;

  try {
    page = await withTimeout(
      cmsService.getPageByIdOrSlug("submissions"),
      2500,
      null
    );
  } catch (err) {
    console.error("Failed to fetch submissions page blocks via Prisma, using fallback", err);
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

  return <SubmissionsFallbackView />;
}
