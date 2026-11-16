import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cmsService } from "@/services";
import { prisma, withTimeout } from "@/lib";
import { getCurrentUser } from "@/lib/auth";
import { canViewPage } from "@/lib/page-access";
import { extractPageBlocks } from "@/lib/page-blocks";
import { PublicPageRenderer } from "@/app/(public)/[slug]/public-page-renderer";
import { DraftPreviewBanner } from "@/components/shared/draft-preview-banner";
import { ProgramSessionsFallbackView } from "./sessions-fallback";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const page = await cmsService.getPageByIdOrSlug("program/sessions").catch(() => null);
  if (page?.meta_title || page?.meta_description) {
    return {
      title: page.meta_title || "Technical Sessions & Tracks | IEEE SMC 2027",
      description:
        page.meta_description ||
        "Technical program schedule of oral sessions, tracks, and papers at IEEE SMC 2027.",
    };
  }
  return {
    title: "Technical Sessions & Tracks | IEEE SMC 2027",
    description:
      "Technical program schedule of oral sessions, tracks, and papers at IEEE SMC 2027 in Ho Chi Minh City.",
  };
}

export default async function ProgramSessionsPage({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string }>;
}) {
  const { preview } = await searchParams;
  const isPreview = preview === "true" || preview === "1";
  let page: Awaited<ReturnType<typeof cmsService.getPageByIdOrSlug>> = null;

  try {
    page = await withTimeout(
      cmsService.getPageByIdOrSlug("program/sessions"),
      2500,
      null
    );
  } catch (err) {
    console.error("Failed to fetch program/sessions page blocks, using fallback", err);
  }

  if (page) {
    const user = !page.is_published && isPreview ? await getCurrentUser() : null;
    if (!canViewPage(page.is_published, preview, user?.role)) notFound();

    let blocks = extractPageBlocks(page);

    if (blocks.length > 0) {
      const needsDbSessions = blocks.some(
        (b) =>
          b.type === "TechnicalSessionsBlock" &&
          (!Array.isArray(b.props?.sessions) || b.props.sessions.length === 0)
      );
      if (needsDbSessions) {
        try {
          const setting = await prisma.setting.findUnique({
            where: { key: "program_sessions" },
          });
          if (Array.isArray(setting?.data) && setting.data.length > 0) {
            blocks = blocks.map((b) =>
              b.type === "TechnicalSessionsBlock" &&
              (!Array.isArray(b.props?.sessions) || b.props.sessions.length === 0)
                ? { ...b, props: { ...(b.props || {}), sessions: setting.data } }
                : b
            );
          }
        } catch {
          // Non-fatal fallback
        }
      }

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

  return <ProgramSessionsFallbackView />;
}
