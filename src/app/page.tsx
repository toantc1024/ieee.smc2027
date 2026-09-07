import React from "react";
import { Hero } from "@/components/sections/Hero";
import { SubmissionCountdown } from "@/components/sections/SubmissionCountdown";
import { ConferenceHighlights } from "@/components/sections/ConferenceHighlights";
import { About } from "@/components/sections/About";
import { CallForPapers } from "@/components/sections/CallForPapers";
import { TracksExplorer } from "@/components/sections/TracksExplorer";
import { ImportantDates } from "@/components/sections/ImportantDates";
import { Keynotes } from "@/components/sections/Keynotes";
import { Committee } from "@/components/sections/Committee";
import { Venue } from "@/components/sections/Venue";
import { FAQ } from "@/components/sections/FAQ";
import { CfpSubscribe } from "@/components/sections/CfpSubscribe";
import { Sponsors } from "@/components/sections/Sponsors";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  return (
    <>
      <Hero />
      <SubmissionCountdown />
      <ConferenceHighlights />
      <About />
      <CallForPapers />
      <TracksExplorer />
      <ImportantDates />
      <Keynotes />
      <Committee />
      <Venue />
      <FAQ />
      <CfpSubscribe />
      <Sponsors />
      <Footer />
    </>
  );
}
