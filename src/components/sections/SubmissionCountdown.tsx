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

export function SubmissionCountdown() {
  const [copiedDeadline, setCopiedDeadline] = useState(false);

  const handleCopyDeadline = () => {
    navigator.clipboard.writeText(
      "IEEE SMC 2027 Paper Submission Deadline: April 08, 2027 (Ho Chi Minh City, Vietnam)"
    );
    setCopiedDeadline(true);
    setTimeout(() => setCopiedDeadline(false), 2500);
  };

  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    "IEEE SMC 2027 Paper Submission Deadline"
  )}&dates=20270408T165959Z/20270408T165959Z&details=${encodeURIComponent(
    "Paper submission deadline for IEEE SMC 2027 in Ho Chi Minh City, Vietnam. Official website: https://ieeesmc2027.hcmute.edu.vn"
  )}&location=${encodeURIComponent(
    "Sheraton Saigon Grand Opera Hotel, Ho Chi Minh City, Vietnam"
  )}`;

  return (
    <SectionContainer id="submission-countdown" fullWidthBg="bg-white" borderBottom={true}>
      <div className="relative overflow-hidden px-4 sm:px-6 py-6 sm:py-8">
        {/* Subtle Top-Right Corner Grid Accent */}
        <div className="corner-grid-tr opacity-60" />
        <div className="relative z-10 w-full flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          
          {/* Left: Deadline Info with Bigger 3D Calendar */}
          <div className="flex items-center gap-5 sm:gap-6 min-w-0 flex-1">
            <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 shrink-0 flex items-center justify-center">
              <Image
                src="/assets/3d/calendar-dates-3d.png"
                alt="Deadline Calendar"
                width={112}
                height={112}
                className="w-full h-full object-contain drop-shadow-md"
              />
            </div>
            <div className="space-y-2 text-left min-w-0">
              <h2 className="font-black tracking-tight leading-tight">
                <span className="block text-xl sm:text-2xl lg:text-3xl text-slate-900">
                  Paper Submission Deadline:
                </span>
                <span className="block text-2xl sm:text-3xl lg:text-4xl text-[#115eff] mt-0.5">
                  April 08, 2027
                </span>
              </h2>

              <div className="flex flex-wrap items-center justify-start gap-2.5 sm:gap-3 text-xs sm:text-sm text-slate-600 pt-0.5">
                <a
                  href={googleCalendarUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-semibold text-[#115eff] hover:text-blue-800 transition-colors"
                >
                  <GoogleCalendarIcon className="w-3.5 h-3.5" />
                  <span>Add to Google Calendar</span>
                </a>
                <span className="text-slate-300">•</span>
                <button
                  type="button"
                  onClick={handleCopyDeadline}
                  className="inline-flex items-center gap-1 font-semibold text-slate-600 hover:text-[#115eff] transition-colors cursor-pointer"
                >
                  {copiedDeadline ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Info</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Group: Action Buttons */}
          <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto justify-start lg:justify-end">
            <a
              href="#cfp"
              className="inline-flex items-center justify-center gap-2 min-h-[44px] sm:min-h-[48px] px-5 sm:px-6 py-2.5 bg-[#115eff] hover:bg-[#0a4de6] text-white font-bold text-xs sm:text-sm rounded-[0.26rem] transition-all shadow-sm hover:shadow-md group whitespace-nowrap"
            >
              <span>Author Guidelines</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>

            <a
              href={CONFERENCE_INFO.cfpPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 min-h-[44px] sm:min-h-[48px] px-4 sm:px-5 py-2.5 bg-white hover:bg-blue-50 text-[#115eff] border border-[#ccd7e2] font-bold text-xs sm:text-sm rounded-[0.26rem] transition-all shadow-2xs whitespace-nowrap"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>CFP (PDF)</span>
            </a>
          </div>

        </div>
      </div>
    </SectionContainer>
  );
}
