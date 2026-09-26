"use client";

import React from "react";
import { Award, Mic, Bell, ArrowRight } from "lucide-react";
import { CONFERENCE_INFO } from "@/data/conference";
import { SectionContainer } from "@/components/layout/SectionContainer";

export function Keynotes() {
  return (
    <SectionContainer id="keynotes" fullWidthBg="bg-white">
      {/* Section Header matching standard HCMUTE 2-line headline style */}
      <div className="relative overflow-hidden px-4 sm:px-6 pt-10 sm:pt-14 pb-4 sm:pb-6 w-full">
        {/* Subtle HCMUTE Royal Blue Dot Pattern in Top-Right Corner */}
        <div className="corner-dot-tr opacity-75 pointer-events-none" />

        <div className="space-y-3 w-full relative z-10">
          <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold uppercase tracking-tight leading-[1.2] w-full">
            <span className="block text-[#004776]">Keynote Speakers</span>
            <span className="block text-[#115eff]">& Plenary Sessions</span>
          </h2>
          <p className="text-base sm:text-lg text-[#004776]/80 font-medium">
            Distinguished global thought leaders across systems science, human–AI symbiosis, and cybernetics
          </p>
        </div>
      </div>

      {/* Forthcoming Keynote Announcement */}
      <div className="px-4 sm:px-6 py-8 sm:py-10">
        <div className="p-8 sm:p-10 bg-slate-50 border border-slate-200 rounded-md text-center max-w-3xl mx-auto flex flex-col items-center">
          <div className="w-14 h-14 bg-blue-100 text-[#115eff] rounded-full flex items-center justify-center mb-4">
            <Mic className="w-7 h-7" />
          </div>

          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
            Plenary Keynote Speakers Announcement Forthcoming
          </h3>

          <p className="mt-2.5 text-base text-slate-600 leading-relaxed max-w-xl">
            Distinguished global thought leaders across systems science, human–AI symbiosis, and cybernetics will be announced as plenary speakers.
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
