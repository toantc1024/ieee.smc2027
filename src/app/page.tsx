import React from "react";
import { sql } from "@/lib/db";
import { HeroCarousel } from "@/components/sections/HeroCarousel";
import { WelcomeLetter } from "@/components/sections/WelcomeLetter";
import { NewsList } from "@/components/sections/NewsList";
import { ConferenceVideo } from "@/components/sections/ConferenceVideo";
import { PaperTemplates } from "@/components/sections/PaperTemplates";
import { ContactCards } from "@/components/sections/ContactCards";
import { CfpSubscribe } from "@/components/sections/CfpSubscribe";
import { SubmissionCountdown } from "@/components/sections/SubmissionCountdown";
import { ConferenceHighlights } from "@/components/sections/ConferenceHighlights";
import { CallForPapers } from "@/components/sections/CallForPapers";
import { TracksExplorer } from "@/components/sections/TracksExplorer";
import { ImportantDates } from "@/components/sections/ImportantDates";
import { About } from "@/components/sections/About";
import { Committee } from "@/components/sections/Committee";
import { Venue } from "@/components/sections/Venue";
import { FAQ } from "@/components/sections/FAQ";
import { Sponsors } from "@/components/sections/Sponsors";
import { Keynotes } from "@/components/sections/Keynotes";

export const dynamic = "force-dynamic";

interface PageBlockItem {
  id: string;
  type: string;
  props?: Record<string, unknown>;
  hidden?: boolean;
}

function renderBlock(block: PageBlockItem) {
  if (block.hidden) return null;

  switch (block.type) {
    case "HeroCarousel":
      return <HeroCarousel key={block.id} {...block.props} />;
    case "WelcomeLetter":
      return <WelcomeLetter key={block.id} {...block.props} />;
    case "NewsList":
      return <NewsList key={block.id} {...block.props} />;
    case "ConferenceVideo":
      return <ConferenceVideo key={block.id} {...block.props} />;
    case "PaperTemplates":
      return <PaperTemplates key={block.id} {...block.props} />;
    case "ContactCards":
      return <ContactCards key={block.id} {...block.props} />;
    case "CfpSubscribe":
      return <CfpSubscribe key={block.id} />;
    case "SubmissionCountdown":
      return <SubmissionCountdown key={block.id} />;
    case "ConferenceHighlights":
      return <ConferenceHighlights key={block.id} />;
    case "CallForPapers":
      return <CallForPapers key={block.id} />;
    case "TracksExplorer":
      return <TracksExplorer key={block.id} />;
    case "ImportantDates":
      return <ImportantDates key={block.id} />;
    case "About":
      return <About key={block.id} />;
    case "Committee":
      return <Committee key={block.id} />;
    case "Venue":
      return <Venue key={block.id} />;
    case "FAQ":
      return <FAQ key={block.id} />;
    case "Keynotes":
      return <Keynotes key={block.id} />;
    case "Sponsors":
      return <Sponsors key={block.id} />;
    case "CustomHTML":
      return (
        <div
          key={block.id}
          dangerouslySetInnerHTML={{
            __html: (block.props?.content as string) || "",
          }}
        />
      );
    default:
      return null;
  }
}

export default async function Home() {
  let blocks: PageBlockItem[] = [];

  try {
    const rows = await sql`
      SELECT blocks, is_published FROM website_pages WHERE id = 'home' OR slug = 'home' LIMIT 1
    `;
    if (rows.length > 0 && Array.isArray(rows[0].blocks)) {
      blocks = rows[0].blocks as PageBlockItem[];
    }
  } catch (err) {
    console.error("Failed to fetch home page blocks from Neon DB, using fallback", err);
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
        <Venue />
        <ContactCards />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col">
      {blocks.map((block) => renderBlock(block))}
    </div>
  );
}
