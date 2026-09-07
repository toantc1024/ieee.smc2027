"use client";

import React, { useState, useEffect } from "react";
import {
  Clock,
  Calendar,
  Copy,
  Check,
  ExternalLink,
  ArrowUpRight,
} from "lucide-react";
import { CONFERENCE_INFO } from "@/data/conference";
import { EasyChairIcon, GoogleCalendarIcon } from "@/components/common/ProviderIcons";
import { SectionContainer } from "@/components/layout/SectionContainer";

export function SubmissionCountdown() {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const [copiedDeadline, setCopiedDeadline] = useState(false);

  // Live countdown to May 15, 2027 23:59:59 GMT+7
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
      "IEEE SMC 2027 Paper Submission Deadline: May 15, 2027 (23:59 GMT+7) - https://easychair.org/conferences/?conf=ieeesmc2027"
    );
    setCopiedDeadline(true);
    setTimeout(() => setCopiedDeadline(false), 2500);
  };

  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    "IEEE SMC 2027 Paper Submission Deadline"
  )}&dates=20270515T165959Z/20270515T165959Z&details=${encodeURIComponent(
    "Full paper submission deadline for IEEE SMC 2027 at HCM-UTE, Ho Chi Minh City, Vietnam. Submit via EasyChair: https://easychair.org/conferences/?conf=ieeesmc2027"
  )}&location=${encodeURIComponent(
    "HCM-UTE Grand Convention Center, Ho Chi Minh City, Vietnam"
  )}`;

  return (
    <SectionContainer id="submission-countdown" fullWidthBg="bg-blue-50/40" borderBottom={true}>
      <div className="relative overflow-hidden px-4 sm:px-6 py-6 sm:py-7">
        {/* Subtle Top-Right Corner Grid Accent */}
        <div className="corner-grid-tr opacity-60" />
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
          
          {/* Left: Deadline Info */}
          <div className="space-y-2 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#115eff]/10 border border-[#115eff]/20 rounded-full text-xs font-bold text-[#115eff]">
              <span className="w-2 h-2 bg-[#115eff] rounded-full" />
              <span>Submissions Open • Round 1</span>
            </div>
            
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Paper Submission Deadline: May 15, 2027
            </h2>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 text-xs sm:text-sm text-slate-600">
              <span className="font-semibold text-slate-700">23:59 GMT+7 (AoE)</span>
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

          {/* Center: Countdown Boxes */}
          <div className="grid grid-cols-4 gap-2.5 sm:gap-3 text-center shrink-0">
            <div className="min-w-[68px] sm:min-w-[76px] p-2.5 sm:p-3 bg-white border border-[#ccd7e2] rounded-[0.26rem] shadow-2xs">
              <div className="text-2xl sm:text-3xl font-black text-[#115eff] tabular-nums leading-none">
                {timeLeft.days}
              </div>
              <div className="text-[11px] sm:text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Days</div>
            </div>

            <div className="min-w-[68px] sm:min-w-[76px] p-2.5 sm:p-3 bg-white border border-[#ccd7e2] rounded-[0.26rem] shadow-2xs">
              <div className="text-2xl sm:text-3xl font-black text-[#115eff] tabular-nums leading-none">
                {timeLeft.hours}
              </div>
              <div className="text-[11px] sm:text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Hours</div>
            </div>

            <div className="min-w-[68px] sm:min-w-[76px] p-2.5 sm:p-3 bg-white border border-[#ccd7e2] rounded-[0.26rem] shadow-2xs">
              <div className="text-2xl sm:text-3xl font-black text-[#115eff] tabular-nums leading-none">
                {timeLeft.minutes}
              </div>
              <div className="text-[11px] sm:text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Mins</div>
            </div>

            <div className="min-w-[68px] sm:min-w-[76px] p-2.5 sm:p-3 bg-white border border-[#ccd7e2] rounded-[0.26rem] shadow-2xs">
              <div className="text-2xl sm:text-3xl font-black text-[#115eff] tabular-nums leading-none">
                {timeLeft.seconds}
              </div>
              <div className="text-[11px] sm:text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Secs</div>
            </div>
          </div>

          {/* Right: Action Button (Guides to CFP instead of duplicating submit paper button) */}
          <div className="shrink-0 w-full sm:w-auto">
            <a
              href="#cfp"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 min-h-[48px] sm:min-h-[50px] px-6 sm:px-7 py-3 bg-[#115eff] hover:bg-[#0a4de6] text-white font-bold text-sm sm:text-base rounded-[0.26rem] transition-all shadow-sm hover:shadow-md group"
            >
              <span>View Author Guidelines</span>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </div>

        </div>
      </div>
    </SectionContainer>
  );
}
