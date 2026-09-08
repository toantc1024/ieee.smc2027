"use client";

import React, { useState, useEffect } from "react";
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
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const [copiedDeadline, setCopiedDeadline] = useState(false);

  // Live countdown to April 08, 2027 23:59:59 GMT+7
  useEffect(() => {
    const targetDate = new Date(CONFERENCE_INFO.submissionDeadlineIso).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCopyDeadline = () => {
    navigator.clipboard.writeText(
      "IEEE SMC 2027 Paper Submission Deadline: April 08, 2027 - Workshops, Regular and Special Sessions (Ho Chi Minh City, Vietnam)"
    );
    setCopiedDeadline(true);
    setTimeout(() => setCopiedDeadline(false), 2500);
  };

  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    "IEEE SMC 2027 Paper Submission Deadline"
  )}&dates=20270408T165959Z/20270408T165959Z&details=${encodeURIComponent(
    "Paper submission for Workshops, Regular and Special Sessions for IEEE SMC 2027 in Ho Chi Minh City, Vietnam. Official website: https://ieeesmc2027.hcmute.edu.vn"
  )}&location=${encodeURIComponent(
    "Sheraton Saigon Grand Opera Hotel, Ho Chi Minh City, Vietnam"
  )}`;

  return (
    <SectionContainer id="submission-countdown" fullWidthBg="bg-blue-50/40" borderBottom={true}>
      <div className="relative overflow-hidden px-4 sm:px-6 py-6 sm:py-7">
        {/* Subtle Top-Right Corner Grid Accent */}
        <div className="corner-grid-tr opacity-60" />
        <div className="relative z-10 w-full flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          
          {/* Left: Deadline Info (Full Width, Strictly Left-Aligned) */}
          <div className="space-y-1.5 text-left min-w-0 flex-1">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight break-words leading-tight">
              Paper Submission Deadline: <span className="text-[#115eff] whitespace-nowrap">April 08, 2027</span>
            </h2>

            <div className="flex flex-wrap items-center justify-start gap-2.5 sm:gap-3 text-xs sm:text-sm text-slate-600">
              <span className="font-semibold text-slate-700">Workshops, Regular & Special Sessions</span>
              <span className="text-slate-300">•</span>
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
                className="inline-flex items-center gap-1 font-semibold text-slate-600 hover:text-[#115eff] transition-colors"
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

          {/* Right Group: Countdown Boxes + Action Buttons (Full Width Right-Aligned) */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 sm:gap-6 shrink-0 w-full lg:w-auto justify-start lg:justify-end">
            
            {/* Countdown Boxes */}
            <div className="grid grid-cols-4 gap-2 sm:gap-2.5 text-center shrink-0">
              <div className="min-w-[62px] sm:min-w-[70px] p-2 sm:p-2.5 bg-white border border-[#ccd7e2] rounded-[0.26rem] shadow-2xs">
                <div className="text-2xl sm:text-3xl font-black text-[#115eff] tabular-nums leading-none">
                  {timeLeft.days}
                </div>
                <div className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Days</div>
              </div>

              <div className="min-w-[62px] sm:min-w-[70px] p-2 sm:p-2.5 bg-white border border-[#ccd7e2] rounded-[0.26rem] shadow-2xs">
                <div className="text-2xl sm:text-3xl font-black text-[#115eff] tabular-nums leading-none">
                  {timeLeft.hours}
                </div>
                <div className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Hours</div>
              </div>

              <div className="min-w-[62px] sm:min-w-[70px] p-2 sm:p-2.5 bg-white border border-[#ccd7e2] rounded-[0.26rem] shadow-2xs">
                <div className="text-2xl sm:text-3xl font-black text-[#115eff] tabular-nums leading-none">
                  {timeLeft.minutes}
                </div>
                <div className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Mins</div>
              </div>

              <div className="min-w-[62px] sm:min-w-[70px] p-2 sm:p-2.5 bg-white border border-[#ccd7e2] rounded-[0.26rem] shadow-2xs">
                <div className="text-2xl sm:text-3xl font-black text-[#115eff] tabular-nums leading-none">
                  {timeLeft.seconds}
                </div>
                <div className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Secs</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 shrink-0">
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
      </div>
    </SectionContainer>
  );
}
