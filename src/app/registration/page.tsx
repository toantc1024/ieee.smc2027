import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cmsService } from "@/services";
import { withTimeout } from "@/lib";
import { getCurrentUser } from "@/lib/auth";
import { canViewPage } from "@/lib/page-access";
import { extractPageBlocks } from "@/lib/page-blocks";
import { PublicPageRenderer } from "@/app/(public)/[slug]/public-page-renderer";
import { DraftPreviewBanner } from "@/components/shared/draft-preview-banner";
import { RegistrationFallbackView } from "./registration-fallback";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const page = await cmsService.getPageByIdOrSlug("registration").catch(() => null);
  if (page?.meta_title || page?.meta_description) {
    return {
      title: page.meta_title || "Registration & Payments | IEEE SMC 2027",
      description:
        page.meta_description ||
        "Online delegate registration, fee schedule, and payment channels for IEEE SMC 2027 in Ho Chi Minh City.",
    };
  }
  return {
    title: "Registration & Payments | IEEE SMC 2027",
    description:
      "Online delegate registration, fee schedule, and payment channels for IEEE SMC 2027 in Ho Chi Minh City, Vietnam.",
  };
}

export default async function RegistrationPage({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string }>;
}) {
  const { preview } = await searchParams;
  const isPreview = preview === "true" || preview === "1";
  let page: Awaited<ReturnType<typeof cmsService.getPageByIdOrSlug>> = null;

  try {
    page = await withTimeout(
      cmsService.getPageByIdOrSlug("registration"),
      2500,
      null
    );
  } catch (err) {
    console.error("Failed to fetch registration page blocks, using fallback", err);
  }

  if (page) {
    const user = !page.is_published && isPreview ? await getCurrentUser() : null;
    if (!canViewPage(page.is_published, preview, user?.role)) notFound();

    const blocks = extractPageBlocks(page);
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

  return <RegistrationFallbackView />;
}
