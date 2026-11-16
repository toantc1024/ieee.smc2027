import React from "react";
import { SubmissionCountdown } from "@/components/sections/SubmissionCountdown";
import { SubmissionPortalsBlock } from "@/components/sections/SubmissionPortalsBlock";
import { CfpPoliciesBlock } from "@/components/sections/CfpPoliciesBlock";
import { SubmissionCategoriesBlock } from "@/components/sections/SubmissionCategoriesBlock";
import { CfpBrochureBannerBlock } from "@/components/sections/CfpBrochureBannerBlock";
import { TracksExplorer } from "@/components/sections/TracksExplorer";
import { PaperTemplates } from "@/components/sections/PaperTemplates";
import { ImportantDates } from "@/components/sections/ImportantDates";
import { FAQ } from "@/components/sections/FAQ";
import { ContactCards } from "@/components/sections/ContactCards";

export function SubmissionsFallbackView() {
  return (
    <main className="min-h-screen bg-white">
      <SubmissionCountdown />
      <SubmissionPortalsBlock />
      <CfpPoliciesBlock />
      <SubmissionCategoriesBlock />
      <CfpBrochureBannerBlock />
      <TracksExplorer />
      <PaperTemplates />
      <ImportantDates />
      <FAQ />
      <ContactCards />
    </main>
  );
}
