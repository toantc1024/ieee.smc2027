"use client";

import React, { useState } from "react";
import { MapPin, ChevronDown, ChevronUp, UserCheck, Sparkles } from "lucide-react";
import { KEYNOTE_SPEAKERS } from "@/data/conference";
import { SectionContainer } from "@/components/layout/SectionContainer";

export function Keynotes() {
  const [expandedSpeaker, setExpandedSpeaker] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedSpeaker(expandedSpeaker === id ? null : id);
  };

  return (
    <SectionContainer id="keynotes" fullWidthBg="bg-white">
      {/* Section Header Strip with Top-Right Corner Dot Accent */}
      <div className="relative overflow-hidden border-b border-[#ccd7e2] px-4 sm:px-6 py-5 sm:py-6 bg-slate-50/60 flex flex-wrap items-center justify-between gap-4">
        <div className="corner-dot-tr opacity-60" />
        <div className="relative z-10">
          <span className="text-sm font-bold text-[#115eff] block mb-1">
            Plenary Keynotes & Thought Leaders
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

      {/* Speakers Grid with 25% Larger Text */}
      <div className="px-4 sm:px-6 py-8 sm:py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {KEYNOTE_SPEAKERS.map((speaker) => {
            const isExpanded = expandedSpeaker === speaker.id;
            return (
              <div
                key={speaker.id}
                className="p-6 sm:p-7 bg-white border border-slate-200 rounded-md flex flex-col justify-between hover:border-[#115eff] hover:shadow-md transition-all"
              >
                <div>
                  {/* Category tag & location */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-semibold px-3 py-1 bg-blue-50 border border-blue-200/80 text-[#115eff] rounded-md">
                      {speaker.category}
                    </span>
                    <div className="flex items-center gap-1.5 text-sm text-slate-600 font-medium">
                      <MapPin className="w-4 h-4 text-[#115eff]" />
                      <span>{speaker.location}</span>
                    </div>
                  </div>

                  {/* Speaker Identity */}
                  <div className="flex items-start gap-4">
                    {/* Monogram Avatar with Royal Blue Gradient */}
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-[#115eff] text-white flex items-center justify-center font-bold text-xl shrink-0 rounded-md shadow-xs">
                      {speaker.name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")}
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                        {speaker.name}
                      </h3>
                      <p className="text-sm font-semibold text-[#115eff] mt-1">
                        {speaker.title}
                      </p>
                      <p className="text-sm text-slate-500 mt-0.5">
                        {speaker.affiliation}
                      </p>
                    </div>
                  </div>

                  {/* Talk Title */}
                  <div className="mt-5 p-4 bg-slate-50 border border-slate-200/80 rounded-md">
                    <span className="text-xs font-bold text-slate-500 block mb-1">
                      Plenary Keynote Title
                    </span>
                    <p className="text-base sm:text-lg font-semibold text-slate-900 leading-snug">
                      &ldquo;{speaker.talkTitle}&rdquo;
                    </p>
                  </div>

                  {/* Expandable Abstract */}
                  {isExpanded && (
                    <div className="mt-4 p-4 bg-blue-50/50 border border-blue-100 rounded-md text-sm text-slate-700 leading-relaxed animate-in fade-in duration-200">
                      <strong className="block mb-1 text-[#115eff]">Abstract Overview:</strong>
                      {speaker.abstract}
                    </div>
                  )}
                </div>

                {/* Bottom Toggle */}
                <div className="mt-6 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => toggleExpand(speaker.id)}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#115eff] hover:text-blue-800 transition-colors"
                  >
                    <span>{isExpanded ? "Hide Abstract" : "Read Full Abstract"}</span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>

                  <span className="text-xs text-slate-500 font-medium">
                    Plenary Auditorium • HCM-UTE
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </SectionContainer>
  );
}
