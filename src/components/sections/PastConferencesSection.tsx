"use client";

import React from "react";
import { History, Globe, ExternalLink, Calendar } from "lucide-react";
import { SectionContainer } from "@/components/layout/SectionContainer";

interface PastConferencesProps {
  conferences?: typeof PAST_CONFERENCES;
  title?: string;
  subtitle?: string;
}

export const PAST_CONFERENCES = [
  {
    year: "2026",
    city: "Bellevue, Washington, USA",
    theme: "Autonomous Machine Intelligence for Global Societal Challenges",
    dates: "October 2026",
  },
  {
    year: "2025",
    city: "Sarawak, Malaysia",
    theme: "Sustainable Human-Centric Cybernetics & Intelligent Ecosystems",
    dates: "October 2025",
  },
  {
    year: "2024",
    city: "Kuching, Sarawak, Malaysia",
    theme: "Connected Cyber-Physical Systems for Resilient Futures",
    dates: "October 6–10, 2024",
  },
  {
    year: "2023",
    city: "Honolulu, Hawaii, USA",
    theme: "Human-Machine Convergence in the Era of Generative AI",
    dates: "October 1–4, 2023",
  },
  {
    year: "2022",
    city: "Prague, Czech Republic",
    theme: "Next-Generation Cybernetics and Cognitive Automation",
    dates: "October 9–12, 2022",
  },
];

export function PastConferencesSection({
  conferences = PAST_CONFERENCES,
  title = "Past IEEE SMC Conferences",
  subtitle = "Discover the international heritage of the IEEE Systems, Man, and Cybernetics Society flagship annual conference",
}: PastConferencesProps) {
  return (
    <SectionContainer id="past-conferences" fullWidthBg="bg-slate-50">
      <div className="px-4 sm:px-6 pt-10 sm:pt-14 pb-8 w-full">
        <div className="space-y-3 max-w-4xl">
          <h2 className="text-3xl sm:text-4xl font-bold uppercase tracking-tight text-slate-900 leading-tight">
            {title}
          </h2>
          <p className="text-base sm:text-lg text-slate-600 font-medium">
            {subtitle}
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {conferences.map((conf) => (
            <div
              key={conf.year}
              className="p-5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition-all shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-black text-blue-600">
                    SMC {conf.year}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {conf.dates}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 mb-2">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  {conf.city}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed italic">
                  &ldquo;{conf.theme}&rdquo;
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-right">
                <span className="text-[11px] font-semibold text-blue-600 hover:underline inline-flex items-center gap-1 cursor-pointer">
                  <span>IEEE Xplore Proceedings</span>
                  <ExternalLink className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionContainer>
  );
}
