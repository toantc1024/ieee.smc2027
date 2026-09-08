"use client";

import React from "react";
import { ShieldCheck } from "lucide-react";
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
    <SectionContainer id="highlights" fullWidthBg="bg-white" borderBottom={true}>
      
      {/* Top: 4 Key Conference Statistics with Full Height Thin Dividers */}
      <div className="relative overflow-hidden">
        <div className="corner-dot-tr opacity-70" />
        <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4">
          {CONFERENCE_STATS.map((stat, i) => (
            <div
              key={i}
              className={`flex flex-col justify-center px-4 sm:px-6 py-6 sm:py-7 transition-colors hover:bg-slate-50/50 ${
                i % 2 !== 0 ? "border-l border-[#ccd7e2]" : ""
              } ${i >= 2 ? "border-t border-[#ccd7e2] lg:border-t-0" : ""} ${
                i === 2 ? "lg:border-l lg:border-[#ccd7e2]" : ""
              }`}
            >
              <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#115eff] tracking-tight">
                {stat.value}
              </span>
              <span className="text-sm sm:text-base font-bold text-slate-900 mt-1.5 leading-snug">
                {stat.label}
              </span>
              <span className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                {stat.sub}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* FULL WIDTH DIVIDER: Connects directly from left border to right border, no padding/margin */}
      <div className="w-full border-t border-[#ccd7e2]" />

      {/* Bottom: Official Indexing & Academic Inclusion with Bottom-Left Corner Grid Accent */}
      <div className="relative overflow-hidden px-4 sm:px-6 py-5 sm:py-6 bg-slate-50/60">
        <div className="corner-grid-bl opacity-60" />
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4.5 h-4.5 text-[#115eff]" />
              <span className="text-sm font-bold text-slate-900">
                Official Publication & Global Indexing
              </span>
              <span className="text-xs font-bold text-[#115eff] bg-blue-100/60 px-2 py-0.5 rounded-[0.26rem]">
                Peer-Reviewed
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Accepted and presented papers will be copyrighted to IEEE and published in conference proceedings, which will be eligible for inclusion in the <strong>IEEE Xplore® Digital Library</strong>, once it meets the requirements of an IEEE quality review.
            </p>
          </div>

          {/* Provider Badges */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-[#ccd7e2] rounded-[0.26rem] text-xs font-bold text-slate-800 shadow-2xs">
              <IeeeXploreIcon className="w-4 h-4" />
              <span>IEEE Xplore</span>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-[#ccd7e2] rounded-[0.26rem] text-xs font-bold text-slate-800 shadow-2xs">
              <ScopusIcon className="w-4 h-4" />
              <span>Scopus</span>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-[#ccd7e2] rounded-[0.26rem] text-xs font-bold text-slate-800 shadow-2xs">
              <EiCompendexIcon className="w-4 h-4" />
              <span>EI Compendex</span>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-[#ccd7e2] rounded-[0.26rem] text-xs font-bold text-slate-800 shadow-2xs">
              <WebOfScienceIcon className="w-4 h-4" />
              <span>Web of Science</span>
            </div>
          </div>

        </div>
      </div>

    </SectionContainer>
  );
}
