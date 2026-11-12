import React from "react";
import { cmsService } from "@/services";
import { withTimeout } from "@/lib";
import { getCurrentUser } from "@/lib/auth";
import { canViewPage } from "@/lib/page-access";
import { notFound } from "next/navigation";
import { HeroCarousel } from "@/components/sections/HeroCarousel";
import { WelcomeLetter } from "@/components/sections/WelcomeLetter";
import { NewsList } from "@/components/sections/NewsList";
import { ConferenceVideo } from "@/components/sections/ConferenceVideo";
import { ContactCards } from "@/components/sections/ContactCards";
import { ImportantDates } from "@/components/sections/ImportantDates";
import { Venue } from "@/components/sections/Venue";
import { CommitteesSection } from "@/components/sections/CommitteesSection";
import { PublicPageRenderer } from "@/app/(public)/[slug]/public-page-renderer";
import type { PageBlock } from "@/modules/website-builder/types";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: Promise<{ preview?: string }> }) {
  const { preview } = await searchParams;
  let homePage: Awaited<ReturnType<typeof cmsService.getPageByIdOrSlug>> = null;

  try {
    homePage = await withTimeout(
      cmsService.getPageByIdOrSlug("home"),
      2500,
      null
    );
  } catch (err) {
    console.error("Failed to fetch home page blocks via Prisma, using fallback", err);
  }

  if (homePage) {
    const user = !homePage.is_published && (preview === "true" || preview === "1") ? await getCurrentUser() : null;
    if (!canViewPage(homePage.is_published, preview, user?.role)) notFound();
    if (Array.isArray(homePage.blocks)) return <PublicPageRenderer blocks={homePage.blocks as unknown as PageBlock[]} />;
  }

  // A missing page or unavailable database falls back to the conference homepage.
  return (
    <div className="w-full flex flex-col">
      <HeroCarousel />
      <WelcomeLetter />
      <NewsList />
      <ImportantDates />
      <ConferenceVideo />
      <CommitteesSection />
      <Venue />
      <ContactCards />
    </div>
  );
}
