"use client";

import React from "react";
import { CONFERENCE_STATS } from "@/data/conference";
import {
  IeeeXploreIcon,
  ScopusIcon,
  EiCompendexIcon,
  WebOfScienceIcon,
} from "@/components/common/ProviderIcons";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { subItemAttr } from "@/modules/website-builder/utils/sub-item-path";

export interface IndexingBadgeItem {
  label: string;
  iconType: "xplore" | "scopus" | "ei" | "wos";
}

export const DEFAULT_INDEXING_BADGES: IndexingBadgeItem[] = [
  { label: "IEEE Xplore", iconType: "xplore" },
  { label: "Scopus", iconType: "scopus" },
  { label: "EI Compendex", iconType: "ei" },
  { label: "Web of Science", iconType: "wos" },
];

export interface ConferenceHighlightsProps {
  items?: typeof CONFERENCE_STATS;
  showIndexingBanner?: boolean;
  indexingTitle?: string;
  indexingDescription?: string;
  indexingBadges?: IndexingBadgeItem[];
}

function renderBadgeIcon(iconType: IndexingBadgeItem["iconType"]) {
  switch (iconType) {
    case "scopus":
      return <ScopusIcon className="w-4 h-4" />;
    case "ei":
      return <EiCompendexIcon className="w-4 h-4" />;
    case "wos":
      return <WebOfScienceIcon className="w-4 h-4" />;
    default:
      return <IeeeXploreIcon className="w-4 h-4" />;
  }
}

export function ConferenceHighlights({
  items = CONFERENCE_STATS,
  showIndexingBanner = true,
  indexingTitle = "Publication & Global Indexing",
  indexingDescription = "Accepted and presented papers will be published in conference proceedings, eligible for inclusion in IEEE Xplore upon IEEE quality review, and indexed in Scopus, EI Compendex, and Web of Science.",
  indexingBadges = DEFAULT_INDEXING_BADGES,
}: ConferenceHighlightsProps) {
  const statList = Array.isArray(items) ? items : [];
  const badgeList = Array.isArray(indexingBadges) ? indexingBadges : [];

  return (
    <SectionContainer id="highlights" fullWidthBg="bg-white">
      <div className="px-4 sm:px-6 py-6 sm:py-8">
        {statList.length === 0 ? (
          <div className="rounded-md border border-dashed border-blue-200 bg-blue-50/30 p-6 text-center text-sm text-slate-500">
            No highlight statistics added yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {statList.map((stat, i) => (
              <div
                key={i}
                {...subItemAttr(["items", i])}
                className="p-5 sm:p-6 bg-slate-50/80 hover:bg-white border border-slate-200 hover:border-[#115eff] rounded-md shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between group"
              >
                <div>
                  <span className="text-3xl sm:text-4xl font-black text-[#115eff] tracking-tight block">
                    {stat.value}
                  </span>
                  <span className="text-base sm:text-lg font-bold text-slate-900 mt-2 block leading-snug group-hover:text-[#115eff] transition-colors">
                    {stat.label}
                  </span>
                </div>
                <span className="text-xs sm:text-sm text-slate-500 mt-2.5 block leading-relaxed font-medium">
                  {stat.sub}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {showIndexingBanner && (
        <>
          <div className="w-full border-t border-slate-200" />
          <div className="relative overflow-hidden px-4 sm:px-6 py-6 sm:py-7 bg-white">
            <div className="corner-grid-bl opacity-60" />
            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="space-y-1 max-w-2xl">
                <h3 className="text-sm font-bold text-slate-900">
                  {indexingTitle}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {indexingDescription}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                {badgeList.map((badge, bIdx) => (
                  <div
                    key={bIdx}
                    {...subItemAttr(["indexingBadges", bIdx])}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-[0.26rem] text-xs font-bold text-slate-800 shadow-2xs"
                  >
                    {renderBadgeIcon(badge.iconType)}
                    <span>{badge.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </SectionContainer>
  );
}
