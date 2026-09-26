"use client";

import React from "react";
import Link from "next/link";
import {
  ExternalLink,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building,
} from "lucide-react";
import { SectionContainer } from "@/components/layout/SectionContainer";

export interface ConferenceVideoProps {
  badge?: string;
  title?: string;
  subtitle?: string;
  viewDetailsUrl?: string;
  videoUrl?: string;
  venueName?: string;
  location?: string;
}

export function ConferenceVideo({
  badge = "IEEE SMC 2026",
  title = "IEEE SMC 2026 Comes to Bellevue",
  subtitle = "Where systems science, human-machine interaction, and cybernetics meet Pacific Northwest vistas and global flavors — a hub for insights and memorable moments.",
  viewDetailsUrl = "https://www.ieeesmc2026.org/Bellevue",
  videoUrl = "https://www.youtube.com/embed/I1UGApHrQKo?si=pJEHr9cVC0WN1JFF",
  venueName = "Meydenbauer Center, Bellevue, WA",
  location = "Bellevue, WA, USA",
}: ConferenceVideoProps) {
  return (
    <SectionContainer id="video" fullWidthBg="bg-slate-50/50">
      {/* Section Header matching standard HCMUTE 2-line headline style */}
      <div className="relative overflow-hidden px-4 sm:px-6 pt-10 sm:pt-14 pb-4 sm:pb-6 w-full">
        {/* Subtle HCMUTE Royal Blue Dot Pattern in Top-Right Corner */}
        <div className="corner-dot-tr opacity-75 pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10 w-full">
          <div className="space-y-3 flex-1">
            <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold uppercase tracking-tight leading-[1.2] w-full">
              <span className="block text-[#004776]">IEEE SMC 2026</span>
              <span className="block text-[#115eff]">Comes to Bellevue</span>
            </h2>
            <p className="text-base sm:text-lg text-[#004776]/80 font-medium">
              {subtitle}
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-3 shrink-0">
            <a
              href={viewDetailsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 min-h-[42px] px-6 py-2.5 bg-[#115eff] hover:bg-[#0a4de6] text-white text-sm font-bold rounded-md transition-all shadow-xs"
            >
              <span>View Details</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* Left Column: Embedded Video Player in Premium Frame */}
          <div className="lg:col-span-7">
            <div className="relative w-full aspect-video rounded-xl overflow-hidden border-2 border-slate-200 bg-slate-900 shadow-md group">
              <iframe
                src={videoUrl}
                title="IEEE SMC 2027 Video Presentation"
                className="w-full h-full object-cover"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
          </div>

          {/* Right Column: Key City & Conference Highlights (HCMUTE Style) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="relative overflow-hidden p-6 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-4 group">
              <div className="corner-grid-tr opacity-0 group-hover:opacity-40 transition-opacity pointer-events-none" />
              <div className="corner-dot-bl opacity-0 group-hover:opacity-30 transition-opacity pointer-events-none" />

              <h3 className="relative z-10 text-lg font-bold text-slate-900 border-b border-slate-200 pb-3">
                Experience IEEE SMC in Bellevue
              </h3>

              <div className="relative z-10 space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-md bg-blue-50 text-[#115eff] flex items-center justify-center shrink-0 mt-0.5 border border-blue-100">
                    <Building className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block text-sm">
                      Meydenbauer Convention Center
                    </span>
                    <span className="text-slate-600 text-xs leading-relaxed">
                      A state-of-the-art center situated in downtown Bellevue, neighboring world-class tech headquarters and Pacific Northwest natural beauty.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-md bg-blue-50 text-[#115eff] flex items-center justify-center shrink-0 mt-0.5 border border-blue-100">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block text-sm">
                      Global Tech Innovation Hub
                    </span>
                    <span className="text-slate-600 text-xs leading-relaxed">
                      Where systems science, human-machine interaction, and cybernetics meet Pacific Northwest vistas and global flavors — a hub for insights and memorable moments.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-md bg-blue-50 text-[#115eff] flex items-center justify-center shrink-0 mt-0.5 border border-blue-100">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block text-sm">
                      World-Class Community & Programs
                    </span>
                    <span className="text-slate-600 text-xs leading-relaxed">
                      Connect with researchers, pioneers, and industry leaders representing over 60 countries across all cybernetics, automation, and human-machine systems.
                    </span>
                  </div>
                </div>
              </div>

              <div className="relative z-10 pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
                <a
                  href={viewDetailsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="grow inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#115eff] hover:bg-[#0a4de6] text-white font-bold text-xs sm:text-sm rounded-md transition-all shadow-xs"
                >
                  <span>View Details</span>
                  <ArrowRight className="w-4 h-4" />
                </a>

                <Link
                  href="#dates"
                  className="inline-flex items-center justify-center px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm rounded-md transition-all"
                >
                  <span>Key Dates</span>
                </Link>
              </div>
            </div>

          </div>

        </div>
      </div>
    </SectionContainer>
  );
}
