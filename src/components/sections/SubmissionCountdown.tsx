"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Copy,
  Check,
  ArrowUpRight,
  FileDown,
} from "lucide-react";
import { CONFERENCE_INFO } from "@/data/conference";
import { GoogleCalendarIcon } from "@/components/common/ProviderIcons";
import { SectionContainer } from "@/components/layout/SectionContainer";

export interface SubmissionCountdownProps {
  title?: string;
  deadlineText?: string;
  iconImage?: string;
  calendarEventTitle?: string;
  calendarDates?: string;
  calendarLocation?: string;
  primaryButtonLabel?: string;
  primaryButtonUrl?: string;
  secondaryButtonLabel?: string;
  cfpPdfUrl?: string;
  showCalendarActions?: boolean;
}

export function SubmissionCountdown({
  title = "Paper Submission Deadline:",
  deadlineText = "April 08, 2027",
  iconImage = "/assets/3d/calendar-dates-3d.png",
  calendarEventTitle = "IEEE SMC 2027 Paper Submission Deadline",
  calendarDates = "20270408T165959Z/20270408T165959Z",
  calendarLocation = "Sheraton Saigon Grand Opera Hotel, Ho Chi Minh City, Vietnam",
  primaryButtonLabel = "Author Guidelines",
  primaryButtonUrl = "#cfp",
  secondaryButtonLabel = "CFP (PDF)",
  cfpPdfUrl = CONFERENCE_INFO.cfpPdfUrl,
  showCalendarActions = true,
}: SubmissionCountdownProps) {
  const [copiedDeadline, setCopiedDeadline] = useState(false);

  const handleCopyDeadline = () => {
    navigator.clipboard.writeText(
      `IEEE SMC 2027 ${title} ${deadlineText} (${calendarLocation})`
    );
    setCopiedDeadline(true);
    setTimeout(() => setCopiedDeadline(false), 2500);
  };

  const resolvedDates = calendarDates.includes("/")
    ? calendarDates
    : `${calendarDates}/${calendarDates}`;

  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    calendarEventTitle
  )}&dates=${encodeURIComponent(resolvedDates)}&details=${encodeURIComponent(
    `Paper submission deadline for IEEE SMC 2027 in Ho Chi Minh City, Vietnam. Official website: ${CONFERENCE_INFO.website}`
  )}&location=${encodeURIComponent(calendarLocation)}`;

  const resolvedIcon = iconImage?.trim() || "/assets/3d/calendar-dates-3d.png";
  const resolvedPdfUrl = cfpPdfUrl?.trim() || CONFERENCE_INFO.cfpPdfUrl;

  return (
    <SectionContainer id="submission-countdown" fullWidthBg="bg-white">
      <div className="relative overflow-hidden px-4 sm:px-6 py-6 sm:py-8">
        {/* Subtle Top-Right Corner Grid Accent */}
        <div className="corner-grid-tr opacity-60" />
        <div className="relative z-10 w-full flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          
          {/* Left: Deadline Info with Bigger 3D Calendar */}
          <div className="flex items-center gap-5 sm:gap-6 min-w-0 flex-1">
            <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 shrink-0 flex items-center justify-center">
              <Image
                src={resolvedIcon}
                alt="Deadline Calendar"
                width={112}
                height={112}
                unoptimized={resolvedIcon.startsWith("/api/") || resolvedIcon.startsWith("http")}
                className="w-full h-full object-contain drop-shadow-md"
              />
            </div>
            <div className="space-y-2 text-left min-w-0">
              <h2 className="font-bold tracking-tight leading-tight">
                <span className="block text-lg sm:text-xl lg:text-2xl text-[#004776]">
                  {title}
                </span>
                <span className="block text-xl sm:text-2xl lg:text-3xl text-[#115eff] mt-0.5">
                  {deadlineText}
                </span>
              </h2>

              {showCalendarActions && (
                <div className="flex flex-wrap items-center justify-start gap-2.5 sm:gap-3 text-sm sm:text-base text-slate-600 pt-0.5">
                  <a
                    href={googleCalendarUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-semibold text-[#115eff] hover:text-blue-800 transition-colors"
                  >
                    <GoogleCalendarIcon className="w-4 h-4" />
                    <span>Add to Google Calendar</span>
                  </a>
                  <span className="text-slate-300">•</span>
                  <button
                    type="button"
                    onClick={handleCopyDeadline}
                    className="inline-flex items-center gap-1.5 font-semibold text-slate-600 hover:text-[#115eff] transition-colors cursor-pointer"
                  >
                    {copiedDeadline ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span className="text-emerald-600 font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy Info</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Group: Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0 w-full sm:w-auto justify-start lg:justify-end">
            {primaryButtonLabel && (
              <a
                href={primaryButtonUrl || "#cfp"}
                className="inline-flex items-center justify-center gap-2 min-h-[46px] px-5 sm:px-6 py-2.5 sm:py-3 bg-[#115eff] hover:bg-[#0a4de6] text-white font-bold text-sm sm:text-[15px] rounded-[0.26rem] transition-all shadow-sm hover:shadow-md group whitespace-nowrap"
              >
                <span>{primaryButtonLabel}</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            )}

            {secondaryButtonLabel && (
              <a
                href={resolvedPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 min-h-[46px] px-5 sm:px-6 py-2.5 sm:py-3 bg-white hover:bg-[#115eff] text-[#115eff] hover:text-white border border-[#115eff] font-bold text-sm sm:text-[15px] rounded-[0.26rem] transition-all shadow-2xs whitespace-nowrap"
              >
                <FileDown className="w-4 h-4" />
                <span>{secondaryButtonLabel}</span>
              </a>
            )}
          </div>

        </div>
      </div>
    </SectionContainer>
  );
}
