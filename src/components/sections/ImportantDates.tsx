"use client";

import React from "react";
import { Calendar, Clock, ExternalLink } from "lucide-react";
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
        <div className="w-full bg-white border border-slate-300 rounded-[var(--radius)] overflow-hidden shadow-2xs">
          {/* Table Header: Ensures deadlines align in one dedicated column */}
          <div className="hidden sm:grid sm:grid-cols-12 gap-4 px-5 sm:px-6 lg:px-8 py-3.5 bg-slate-100 font-bold text-xs sm:text-sm uppercase tracking-wider text-[#004776] border-b border-slate-200">
            <div className="sm:col-span-7 lg:col-span-8 flex items-center gap-2">
              <span>Milestone / Event</span>
            </div>
            <div className="sm:col-span-5 lg:col-span-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#115eff]" />
              <span>Deadline</span>
            </div>
          </div>

          {/* Alternating Rows: Blue Primary with White Text & White with Blue-Black Text */}
          <div className="divide-y divide-slate-200/60">
            {dates.map((item, idx) => {
              const isPrimaryRow = idx % 2 === 0;

              return (
                <div
                  key={item.id}
                  className={`p-5 sm:p-6 lg:px-8 transition-colors ${
                    isPrimaryRow
                      ? "bg-[#115eff] text-white hover:bg-[#0a4de6]"
                      : "bg-white text-[#004776] hover:bg-blue-50/50"
                  }`}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-3 sm:gap-4">
                    {/* Event / Milestone Title Column */}
                    <div className="sm:col-span-7 lg:col-span-8">
                      <a
                        href={viewDetailsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`text-base sm:text-lg lg:text-xl font-bold leading-snug inline-block transition-colors ${
                          isPrimaryRow
                            ? "text-white hover:text-blue-100 underline-offset-4 hover:underline"
                            : "text-[#004776] hover:text-[#115eff]"
                        }`}
                      >
                        {item.title}
                      </a>
                    </div>

                    {/* Deadline Column: Perfectly aligned into one single column */}
                    <div className="sm:col-span-5 lg:col-span-4 flex flex-wrap items-center gap-2 sm:gap-3">
                      <span
                        className={`text-xs sm:hidden font-semibold uppercase tracking-wider ${
                          isPrimaryRow ? "text-blue-100" : "text-slate-500"
                        }`}
                      >
                        {item.status === "Conference" ? "Dates:" : "Deadline:"}
                      </span>

                      {item.extendedDeadline ? (
                        <div className="flex items-center gap-2">
                          <span
                            className={`line-through font-medium text-sm sm:text-base ${
                              isPrimaryRow ? "text-blue-200" : "text-slate-400"
                            }`}
                          >
                            {item.originalDeadline}
                          </span>
                          <span
                            className={`text-base sm:text-lg font-extrabold ${
                              isPrimaryRow ? "text-white" : "text-[#004776]"
                            }`}
                          >
                            {item.extendedDeadline}
                          </span>
                        </div>
                      ) : (
                        <span
                          className={`text-base sm:text-lg font-extrabold ${
                            isPrimaryRow ? "text-white" : "text-[#004776]"
                          }`}
                        >
                          {item.date || item.originalDeadline}
                        </span>
                      )}

                      {item.status && (
                        <span
                          className={`text-xs font-extrabold px-2.5 py-0.5 sm:py-1 uppercase tracking-wider rounded-[var(--radius-sm)] shadow-2xs ${
                            isPrimaryRow
                              ? item.highlight
                                ? "bg-amber-300 text-slate-950 font-black"
                                : "bg-white text-[#115eff]"
                              : item.highlight
                              ? "bg-blue-100 text-[#115eff] border border-blue-200"
                              : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          }`}
                        >
                          {item.status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Row with View Details Link & Timezone Notice */}
          <div className="p-5 sm:p-6 lg:px-8 bg-slate-50/90 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="text-sm sm:text-base text-slate-600 flex items-center gap-2.5">
              <Clock className="w-4.5 h-4.5 text-[#115eff] shrink-0" />
              <span>
                All submission deadlines are set to{" "}
                <strong className="text-[#004776] font-bold">23:59 Anywhere on Earth (AoE)</strong>.
              </span>
            </div>

            <a
              href={viewDetailsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 min-h-[46px] px-7 py-3 bg-[#115eff] hover:bg-[#0a4de6] text-white text-sm sm:text-base font-bold rounded-[var(--radius-btn)] transition-all shadow-xs w-full sm:w-auto"
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
