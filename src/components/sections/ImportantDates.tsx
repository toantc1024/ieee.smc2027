"use client";

import React from "react";
import { Clock, ExternalLink } from "lucide-react";
import { SectionContainer } from "@/components/layout/SectionContainer";

export interface ImportantDateItem {
  id: string;
  title: string;
  originalDeadline?: string;
  extendedDeadline?: string;
  date?: string;
  category?: string;
  status?: string;
  highlight?: boolean;
}

export interface ImportantDatesProps {
  title?: string;
  subtitle?: string;
  viewDetailsUrl?: string;
  dates?: ImportantDateItem[];
}

export const OFFICIAL_2027_DATES: ImportantDateItem[] = [
  {
    id: "proposals",
    title: "Submission of Proposals for Special Sessions, Tutorials and Workshops",
    date: "February 15, 2027",
    category: "Proposals",
    status: "Open",
  },
  {
    id: "ss-notification",
    title: "Special Sessions, Tutorials and Workshops Acceptance Notification",
    date: "March 04, 2027",
    category: "Notification",
  },
  {
    id: "paper-submission",
    title: "Paper Submission for Workshops, Regular and Special Sessions",
    date: "April 08, 2027",
    category: "Paper Submission",
    highlight: true,
    status: "Key Deadline",
  },
  {
    id: "paper-acceptance",
    title: "Notification of Papers Acceptance for Workshops, Regular and Special Sessions",
    date: "May 30, 2027",
    category: "Notification",
    highlight: true,
  },
  {
    id: "early-bird",
    title: "Deadline for Early Bird Registrations",
    date: "July 05, 2027",
    category: "Registration",
  },
  {
    id: "camera-ready",
    title: "Final Paper Camera-Ready Submission of Regular, Special Sessions and Workshops",
    date: "July 15, 2027",
    category: "Final Submission",
    highlight: true,
  },
  {
    id: "late-reg-author",
    title: "Deadline for Late Registration (Author)",
    date: "August 05, 2027",
    category: "Registration",
  },
  {
    id: "late-reg-non-author",
    title: "Deadline for Late Registration (Non-Author)",
    date: "October 04, 2027",
    category: "Registration",
  },
  {
    id: "conference-dates",
    title: "IEEE SMC 2027 Conference Dates (Ho Chi Minh City, Vietnam)",
    date: "October 6–10, 2027",
    category: "Conference Event",
    highlight: true,
    status: "Conference",
  },
];

export function ImportantDates({
  title = "Important Dates",
  subtitle = "Key conference deadlines and milestone schedule for IEEE SMC 2027",
  viewDetailsUrl = "#cfp",
  dates = OFFICIAL_2027_DATES,
}: ImportantDatesProps) {
  return (
    <SectionContainer id="dates" fullWidthBg="bg-white">
      {/* Section Header */}
      <div className="relative overflow-hidden px-4 sm:px-6 pt-10 sm:pt-14 pb-4 sm:pb-6 w-full">
        {/* Subtle HCMUTE Royal Blue Dot Pattern in Top-Right Corner */}
        <div className="corner-dot-tr opacity-75 pointer-events-none" />

        <div className="space-y-3 relative z-10 w-full">
          <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold uppercase tracking-tight leading-[1.2] w-full">
            {title.includes("&") ? (
              <>
                <span className="block text-[#004776]">
                  {title.split("&")[0].trim()}
                </span>
                <span className="block text-[#115eff]">
                  & {title.split("&")[1].trim()}
                </span>
              </>
            ) : (
              <span className="block text-[#004776]">{title}</span>
            )}
          </h2>
          {subtitle && (
            <p className="text-base sm:text-lg text-[#004776]/80 font-medium">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Simple Full-Width Block */}
      <div className="px-4 sm:px-6 pb-12 sm:pb-16 w-full">
        <div className="w-full bg-white border border-slate-300 rounded-[var(--radius)] overflow-hidden shadow-2xs divide-y divide-slate-200">
          {dates.map((item) => (
            <div
              key={item.id}
              className="group p-5 sm:p-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 hover:bg-slate-50/70 transition-colors"
            >
              {/* Title */}
              <div className="space-y-1">
                <a
                  href={viewDetailsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 group-hover:text-[#115eff] transition-colors leading-snug inline-block"
                >
                  {item.title}
                </a>
              </div>

              {/* Deadline & Status */}
              <div className="flex flex-wrap items-baseline sm:items-center gap-2 sm:gap-3 text-sm sm:text-base shrink-0">
                <span className="font-semibold text-slate-700">Deadline:</span>{" "}
                {item.extendedDeadline ? (
                  <>
                    <span className="line-through text-slate-400 font-medium">
                      {item.originalDeadline}
                    </span>{" "}
                    <span className="font-extrabold text-[#115eff] text-base sm:text-lg">
                      {item.extendedDeadline}
                    </span>
                  </>
                ) : (
                  <span className="font-extrabold text-[#115eff] text-base sm:text-lg">
                    {item.date || item.originalDeadline}
                  </span>
                )}
                {item.status && (
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 uppercase tracking-wider rounded-[var(--radius-sm)] ${
                      item.highlight
                        ? "text-blue-700 bg-blue-50 border border-blue-200"
                        : "text-emerald-700 bg-emerald-50 border border-emerald-200"
                    }`}
                  >
                    {item.status}
                  </span>
                )}
              </div>
            </div>
          ))}

          {/* Action Row with View Details Link & Timezone Notice */}
          <div className="p-5 sm:p-6 lg:px-8 bg-slate-50/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="text-xs sm:text-sm text-slate-500 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#115eff] shrink-0" />
              <span>
                All submission deadlines are set to{" "}
                <strong className="text-slate-700 font-semibold">23:59 Anywhere on Earth (AoE)</strong>.
              </span>
            </div>

            <a
              href={viewDetailsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#115eff] hover:bg-[#0a4de6] text-white text-sm font-bold rounded-[var(--radius-btn)] transition-all shadow-xs w-full sm:w-auto"
            >
              <span>View Details</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}
