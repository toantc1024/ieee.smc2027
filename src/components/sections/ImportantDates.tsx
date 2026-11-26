"use client";

import React from "react";
import { Calendar, Clock, ExternalLink } from "lucide-react";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { subItemAttr } from "@/modules/website-builder/utils/sub-item-path";

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
  colMilestoneLabel?: string;
  colDeadlineLabel?: string;
  timezoneNotice?: string;
  ctaLabel?: string;
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
    title: "Deadline for Late Author Registration",
    date: "August 05, 2027",
    category: "Registration",
  },
  {
    id: "late-reg-non-author",
    title: "Deadline for Late Non-Author Registration",
    date: "October 04, 2027",
    category: "Registration",
  },
  {
    id: "conference-dates",
    title: "IEEE SMC 2027 Conference Dates",
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
  colMilestoneLabel = "Milestone / Event",
  colDeadlineLabel = "Deadline",
  timezoneNotice = "All submission deadlines are set to 23:59 Anywhere on Earth.",
  ctaLabel = "View Details",
  dates = OFFICIAL_2027_DATES,
}: ImportantDatesProps) {
  const safeDates = Array.isArray(dates) ? dates : [];

  return (
    <SectionContainer id="dates" fullWidthBg="bg-white">
      <div className="relative overflow-hidden px-4 sm:px-6 pt-10 sm:pt-14 pb-4 sm:pb-6 w-full">
        <div className="corner-dot-tr opacity-75 pointer-events-none" />

        <div className="space-y-3 relative z-10 w-full">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight leading-[1.2] w-full">
            {title.includes("&") ? (
              <>
                <span className="block text-[#004776]">
                  {title.split("&")[0].trim()}
                </span>
                <span className="block text-[#115eff]">
                  &amp; {title.split("&").slice(1).join("&").trim()}
                </span>
              </>
            ) : (
              <span className="block text-[#004776]">{title}</span>
            )}
          </h2>
          {subtitle && (
            <p className="text-sm sm:text-base lg:text-[17px] text-[#004776]/80 font-medium">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="px-4 sm:px-6 pb-12 sm:pb-16 w-full">
        <div className="w-full bg-white border border-border/80 ring-1 ring-border/50 rounded-xl overflow-hidden shadow-2xs">
          <div className="hidden sm:grid sm:grid-cols-12 gap-4 px-5 sm:px-6 lg:px-8 py-4 bg-blue-50/50 font-bold text-sm sm:text-base lg:text-[17px] text-[#004776] border-b border-blue-100/90">
            <div className="sm:col-span-7 lg:col-span-8 flex items-center gap-2.5">
              <span>{colMilestoneLabel}</span>
            </div>
            <div className="sm:col-span-5 lg:col-span-4 flex items-center gap-2.5">
              <Calendar className="w-5 h-5 text-[#115eff]" />
              <span>{colDeadlineLabel}</span>
            </div>
          </div>

          {safeDates.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              No milestones added yet.
            </div>
          ) : (
            <div className="divide-y divide-blue-100/70">
              {safeDates.map((item, idx) => {
                const isPrimaryRow = idx % 2 === 0;

                return (
                  <div
                    key={item.id || idx}
                    {...subItemAttr(["dates", idx])}
                    className={`p-4 sm:p-5 lg:px-8 transition-colors ${
                      isPrimaryRow
                        ? "bg-[#115eff] text-white hover:bg-[#0a4de6]"
                        : "bg-white text-[#004776] hover:bg-blue-50/50"
                    }`}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-12 items-start sm:items-center gap-2.5 sm:gap-4">
                      <div className="sm:col-span-7 lg:col-span-8 flex flex-wrap items-center gap-2">
                        <a
                          href={viewDetailsUrl || "#cfp"}
                          className={`text-[15px] sm:text-base lg:text-[17px] font-bold leading-snug inline-block transition-colors ${
                            isPrimaryRow
                              ? "text-white hover:text-blue-100 underline-offset-4 hover:underline"
                              : "text-[#004776] hover:text-[#115eff]"
                          }`}
                        >
                          {item.title}
                        </a>
                        {item.category && (
                          <span
                            className={`text-[11px] font-bold px-2 py-0.5 rounded-[var(--radius-sm)] ${
                              isPrimaryRow
                                ? "bg-white/15 text-blue-50 border border-white/25"
                                : "bg-blue-50 text-[#004776]/80 border border-blue-100"
                            }`}
                          >
                            {item.category}
                          </span>
                        )}
                      </div>

                      <div className="sm:col-span-5 lg:col-span-4 flex flex-wrap items-center gap-2 sm:gap-2.5">
                        <span
                          className={`text-xs sm:text-sm font-bold ${
                            isPrimaryRow ? "text-blue-100" : "text-slate-500"
                          }`}
                        >
                          {item.status === "Conference" ? "Dates:" : "Deadline:"}
                        </span>

                        {item.extendedDeadline || (item.originalDeadline && item.date && item.originalDeadline !== item.date) ? (
                          <div className="flex flex-wrap items-center gap-2">
                            {item.originalDeadline && (
                              <span
                                className={`line-through font-medium text-xs sm:text-sm ${
                                  isPrimaryRow ? "text-blue-200" : "text-slate-400"
                                }`}
                              >
                                {item.originalDeadline}
                              </span>
                            )}
                            <span
                              className={`text-sm sm:text-base font-bold ${
                                isPrimaryRow ? "text-white" : "text-[#004776]"
                              }`}
                            >
                              {item.extendedDeadline || item.date}
                            </span>
                          </div>
                        ) : (
                          <span
                            className={`text-sm sm:text-base font-bold ${
                              isPrimaryRow ? "text-white" : "text-[#004776]"
                            }`}
                          >
                            {item.date || item.originalDeadline}
                          </span>
                        )}

                        {item.status && (
                          <span
                            className={`text-xs font-bold px-2.5 py-0.5 rounded-[var(--radius-sm)] shadow-2xs ${
                              isPrimaryRow
                                ? item.highlight
                                  ? "bg-amber-300 text-slate-950 font-extrabold"
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
          )}

          <div className="p-4 sm:p-6 lg:px-8 bg-blue-50/40 border-t border-blue-100/85 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="text-xs sm:text-sm text-slate-600 flex items-center gap-2.5">
              <Clock className="w-4.5 h-4.5 text-[#115eff] shrink-0" />
              <span>{timezoneNotice}</span>
            </div>

            {ctaLabel && (
              <a
                href={viewDetailsUrl || "#cfp"}
                className="inline-flex items-center justify-center gap-2 min-h-[46px] px-7 py-3 bg-[#115eff] hover:bg-[#0a4de6] text-white text-sm sm:text-base font-bold rounded-[var(--radius-btn)] transition-all shadow-xs w-full sm:w-auto"
              >
                <span>{ctaLabel}</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}
