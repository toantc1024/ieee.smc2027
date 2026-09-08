"use client";

import React from "react";
import { Sparkles, Bell, ArrowRight } from "lucide-react";
import { CONFERENCE_INFO } from "@/data/conference";
import { SectionContainer } from "@/components/layout/SectionContainer";

export function Keynotes() {
  return (
    <SectionContainer id="keynotes" fullWidthBg="bg-white">
      {/* Section Header Strip with Top-Right Corner Dot Accent */}
      <div className="relative overflow-hidden border-b border-[#ccd7e2] px-4 sm:px-6 py-5 sm:py-6 bg-slate-50/60 flex flex-wrap items-center justify-between gap-4">
        <div className="corner-dot-tr opacity-60" />
        <div className="relative z-10">
          <span className="text-sm font-bold text-[#115eff] block mb-1 uppercase tracking-wider">
            Thought Leadership
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Keynote Speakers & Plenary Sessions
          </h2>
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-[#115eff] bg-blue-50 px-4 py-2 rounded-full border border-blue-200 shadow-2xs">
          <Sparkles className="w-4 h-4" />
          <span>Distinguished Global Researchers</span>
        </div>
      </div>

      {/* Forthcoming Keynote Announcement */}
      <div className="px-4 sm:px-6 py-8 sm:py-10">
        <div className="p-8 sm:p-10 bg-slate-50 border border-slate-200 rounded-md text-center max-w-3xl mx-auto flex flex-col items-center">
          <div className="w-14 h-14 bg-blue-100 text-[#115eff] rounded-full flex items-center justify-center mb-4">
            <Sparkles className="w-7 h-7" />
          </div>

          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
            Plenary Keynote Speakers Announcement Forthcoming
          </h3>

          <p className="mt-3 text-base text-slate-600 leading-relaxed max-w-xl">
            World-renowned thought leaders in systems science, human–machine symbiosis, and cybernetics will be announced as plenary speakers for IEEE SMC 2027.
          </p>

          <div className="mt-6 p-4 bg-white border border-slate-200 rounded-md text-sm text-slate-700 max-w-lg w-full">
            <span className="font-bold text-[#115eff] block mb-1">Conference Theme</span>
            &ldquo;{CONFERENCE_INFO.theme}&rdquo;
          </div>

          <a
            href="#subscribe"
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-[#115eff] hover:bg-[#0a4de6] text-white font-bold text-sm rounded-[0.26rem] transition-all shadow-xs"
          >
            <Bell className="w-4 h-4" />
            <span>Notify Me When Keynotes Are Announced</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </SectionContainer>
  );
}
