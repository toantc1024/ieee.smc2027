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

export function ConferenceHighlights() {
  return (
    <SectionContainer id="highlights" fullWidthBg="bg-white">
      
      {/* Top: 4 Key Conference Statistics Cards */}
      <div className="px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {CONFERENCE_STATS.map((stat, i) => (
            <div
              key={i}
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
      </div>

      {/* FULL WIDTH DIVIDER: Connects directly from left border to right border, no padding/margin */}
      <div className="w-full border-t border-slate-200" />

      {/* Bottom: Official Indexing & Academic Inclusion with Bottom-Left Corner Grid Accent */}
      <div className="relative overflow-hidden px-4 sm:px-6 py-6 sm:py-7 bg-white">
        <div className="corner-grid-bl opacity-60" />
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          
          <div className="space-y-1 max-w-2xl">
            <h3 className="text-sm font-bold text-slate-900">
              Publication & Global Indexing
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Accepted and presented papers will be published in conference proceedings, eligible for inclusion in <strong>IEEE Xplore®</strong> upon IEEE quality review, and indexed in <strong>Scopus</strong>, <strong>EI Compendex</strong>, and <strong>Web of Science</strong>.
            </p>
          </div>

          {/* Provider Badges */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-[0.26rem] text-xs font-bold text-slate-800 shadow-2xs">
              <IeeeXploreIcon className="w-4 h-4" />
              <span>IEEE Xplore</span>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-[0.26rem] text-xs font-bold text-slate-800 shadow-2xs">
              <ScopusIcon className="w-4 h-4" />
              <span>Scopus</span>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-[0.26rem] text-xs font-bold text-slate-800 shadow-2xs">
              <EiCompendexIcon className="w-4 h-4" />
              <span>EI Compendex</span>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-[0.26rem] text-xs font-bold text-slate-800 shadow-2xs">
              <WebOfScienceIcon className="w-4 h-4" />
              <span>Web of Science</span>
            </div>
          </div>

        </div>
      </div>

    </SectionContainer>
  );
}
