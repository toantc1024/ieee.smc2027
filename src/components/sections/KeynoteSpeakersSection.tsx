"use client";

import React from "react";
import { Mic, Bell, ArrowRight, User } from "lucide-react";
import { CONFERENCE_INFO } from "@/data/conference";
import { SectionContainer } from "@/components/layout/SectionContainer";

export interface SpeakerItem {
  name: string;
  affiliation: string;
  topic?: string;
  photo?: string;
  bio?: string;
}

interface KeynoteSpeakersProps {
  title?: string;
  subtitle?: string;
  speakers?: SpeakerItem[];
}

export function KeynoteSpeakersSection({
  title = "Keynote Speakers & Plenary Sessions",
  subtitle = "Distinguished global thought leaders across systems science, human–AI symbiosis, and cybernetics",
  speakers = [],
}: KeynoteSpeakersProps) {
  return (
    <SectionContainer id="keynotes" fullWidthBg="bg-white">
      <div className="relative overflow-hidden px-4 sm:px-6 pt-10 sm:pt-14 pb-4 sm:pb-6 w-full">
        <div className="space-y-3 w-full relative z-10">
          <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold uppercase tracking-tight leading-[1.2] w-full">
            {title.includes("&") ? (
              <>
                <span className="block text-[#004776]">{title.split("&")[0].trim()}</span>
                <span className="block text-[#115eff]">& {title.split("&").slice(1).join("&").trim()}</span>
              </>
            ) : (
              <span className="block text-[#004776]">{title}</span>
            )}
          </h2>
          <p className="text-base sm:text-lg text-[#004776]/80 font-medium">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-8 sm:py-10">
        {speakers && speakers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {speakers.map((spk, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition-all shadow-xs flex flex-col items-center text-center"
              >
                <div className="w-24 h-24 rounded-full bg-blue-100 border-2 border-blue-500 overflow-hidden mb-4 flex items-center justify-center">
                  {spk.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={spk.photo} alt={spk.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-10 h-10 text-blue-600" />
                  )}
                </div>
                <h3 className="text-lg font-bold text-slate-900">{spk.name}</h3>
                <p className="text-xs font-semibold text-blue-600 mt-1">{spk.affiliation}</p>
                {spk.topic && (
                  <p className="text-xs text-slate-600 mt-3 italic line-clamp-2">
                    &ldquo;{spk.topic}&rdquo;
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 sm:p-10 bg-slate-50 border border-slate-200 rounded-sm text-center max-w-3xl mx-auto flex flex-col items-center">
            <div className="w-14 h-14 bg-blue-100 text-[#115eff] rounded-sm flex items-center justify-center mb-4">
              <Mic className="w-7 h-7" />
            </div>

            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
              Plenary Keynote Speakers Announcement Forthcoming
            </h3>

            <p className="mt-2.5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
              Distinguished global thought leaders across systems science, human–AI symbiosis, and cybernetics will be announced as plenary speakers.
            </p>

            <div className="mt-6 p-4 bg-white border border-slate-200 rounded-sm text-sm sm:text-base text-slate-700 max-w-lg w-full">
              <span className="font-bold text-[#115eff] block mb-1">Conference Theme</span>
              &ldquo;{CONFERENCE_INFO.theme}&rdquo;
            </div>

            <a
              href="#subscribe"
              className="mt-6 inline-flex items-center gap-2 min-h-[48px] px-6 py-3 bg-[#115eff] hover:bg-[#0a4de6] text-white font-bold text-sm sm:text-base rounded-sm transition-all shadow-xs"
            >
              <Bell className="w-4 h-4" />
              <span>Notify Me When Keynotes Are Announced</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        )}
      </div>
    </SectionContainer>
  );
}
