import React from "react";
import { cmsService } from "@/services";
import { withTimeout } from "@/lib";
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

export default async function Home() {
  let blocks: PageBlock[] = [];

  try {
    const homePage = await withTimeout(
      cmsService.getPageByIdOrSlug("home"),
      2500,
      null
    );
    if (homePage && Array.isArray(homePage.blocks)) {
      blocks = homePage.blocks as unknown as PageBlock[];
    }
  } catch (err) {
    console.error("Failed to fetch home page blocks via Prisma, using fallback", err);
  }

  // Fallback in case of DB disconnect or empty blocks
  if (blocks.length === 0) {
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

  return <PublicPageRenderer blocks={blocks} />;
}
