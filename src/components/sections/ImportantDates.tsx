"use client";

import React, { useState, useRef } from "react";
import {
  Calendar,
  Clock,
  Download,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  ExternalLink,
  ArrowRight,
  ArrowLeft,
  List,
  GitCommit,
  Bell,
} from "lucide-react";
import { IMPORTANT_DATES, ImportantDate, CONFERENCE_INFO } from "@/data/conference";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { GoogleCalendarIcon } from "@/components/common/ProviderIcons";

export function ImportantDates() {
  const [activeMilestoneId, setActiveMilestoneId] = useState<string>("paper-submission");
  const [viewMode, setViewMode] = useState<"roadmap" | "tree" | "table">("roadmap");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const activeIndex = IMPORTANT_DATES.findIndex((d) => d.id === activeMilestoneId);
  const activeMilestone = IMPORTANT_DATES[activeIndex >= 0 ? activeIndex : 2]; // default to paper submission

  // Scroll active item into view within the horizontal ribbon
  const scrollMilestoneIntoView = (index: number) => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const items = container.querySelectorAll<HTMLElement>("[data-timeline-node]");
    if (items[index]) {
      const item = items[index];
      const containerWidth = container.offsetWidth;
      const itemLeft = item.offsetLeft;
      const itemWidth = item.offsetWidth;
      container.scrollTo({
        left: itemLeft - containerWidth / 2 + itemWidth / 2,
        behavior: "smooth",
      });
    }
  };

  const handleSelectMilestone = (id: string, index: number) => {
    setActiveMilestoneId(id);
    scrollMilestoneIntoView(index);
  };

  const handleNextMilestone = () => {
    const nextIdx = (activeIndex + 1) % IMPORTANT_DATES.length;
    setActiveMilestoneId(IMPORTANT_DATES[nextIdx].id);
    scrollMilestoneIntoView(nextIdx);
  };

  const handlePrevMilestone = () => {
    const prevIdx = (activeIndex - 1 + IMPORTANT_DATES.length) % IMPORTANT_DATES.length;
    setActiveMilestoneId(IMPORTANT_DATES[prevIdx].id);
    scrollMilestoneIntoView(prevIdx);
  };

  const scrollRibbon = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const scrollAmount = 340;
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const handleCopyMilestone = (item: ImportantDate) => {
    navigator.clipboard.writeText(
      `IEEE SMC 2027 Milestone: ${item.title} - ${item.date} (23:59 AoE) - https://ieeesmc2027.hcmute.edu.vn`
    );
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const generateGoogleCalendarUrl = (item: ImportantDate) => {
    // Format date string
    const dateObj = new Date(item.dateIso);
    const dateStr = dateObj.toISOString().replace(/-|:|\.\d\d\d/g, "");
    const title = encodeURIComponent(`IEEE SMC 2027: ${item.title}`);
    const details = encodeURIComponent(
      `${item.description}\n\nConference: IEEE SMC 2027 (Ho Chi Minh City, Vietnam)\nWebsite: https://ieeesmc2027.hcmute.edu.vn`
    );
    const location = encodeURIComponent(CONFERENCE_INFO.venue + ", " + CONFERENCE_INFO.location);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dateStr}/${dateStr}&details=${details}&location=${location}`;
  };

  const handleDownloadIcs = () => {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//IEEE SMC 2027//Ho Chi Minh City Vietnam//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
SUMMARY:IEEE SMC 2027 Proposals Deadline (Special Sessions, Tutorials & Workshops)
DESCRIPTION:Submission of Proposals for Special Sessions, Tutorials and Workshops for IEEE SMC 2027.
LOCATION:Sheraton Saigon Grand Opera Hotel, Ho Chi Minh City, Vietnam
DTSTART:20270215T235959Z
DTEND:20270216T000000Z
STATUS:CONFIRMED
END:VEVENT
BEGIN:VEVENT
SUMMARY:IEEE SMC 2027 Paper Submission Deadline (Workshops, Regular & Special Sessions)
DESCRIPTION:Paper submission deadline for Workshops, Regular and Special Sessions for IEEE SMC 2027 via PaperCept.
LOCATION:Sheraton Saigon Grand Opera Hotel, Ho Chi Minh City, Vietnam
DTSTART:20270408T235959Z
DTEND:20270409T000000Z
STATUS:CONFIRMED
END:VEVENT
BEGIN:VEVENT
SUMMARY:IEEE SMC 2027 Paper Acceptance Notification
DESCRIPTION:Notification of Papers Acceptance for Workshops, Regular and Special Sessions.
LOCATION:Sheraton Saigon Grand Opera Hotel, Ho Chi Minh City, Vietnam
DTSTART:20270530T235959Z
DTEND:20270531T000000Z
STATUS:CONFIRMED
END:VEVENT
BEGIN:VEVENT
SUMMARY:IEEE SMC 2027 Final Camera-Ready Paper Submission
DESCRIPTION:Final Paper Camera-ready Submission of Regular, Special Sessions and Workshops.
LOCATION:Sheraton Saigon Grand Opera Hotel, Ho Chi Minh City, Vietnam
DTSTART:20270715T235959Z
DTEND:20270716T000000Z
STATUS:CONFIRMED
END:VEVENT
BEGIN:VEVENT
SUMMARY:IEEE SMC 2027 Conference in Ho Chi Minh City
DESCRIPTION:The 2027 IEEE International Conference on Systems, Man, and Cybernetics (IEEE SMC 2027), hosted by HCMUTE.
LOCATION:Sheraton Saigon Grand Opera Hotel, No. 88 Dong Khoi, Saigon Ward, Ho Chi Minh City, Vietnam
DTSTART:20271006T080000Z
DTEND:20271010T180000Z
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute("download", "ieee-smc-2027-dates.ics");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <SectionContainer id="dates">
      {/* Section Header */}
      <div className="relative overflow-hidden px-4 sm:px-6 py-6 sm:py-7 border-b border-[#ccd7e2] bg-slate-50/60 flex flex-wrap items-center justify-between gap-4">
        <div className="corner-grid-tr opacity-50" />
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#115eff]/10 border border-[#115eff]/20 rounded-full text-xs font-bold text-[#115eff] mb-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Interactive Conference Roadmap</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Important Dates & Timeline
          </h2>
        </div>

        {/* View Mode Switcher + ICS Download */}
        <div className="relative z-10 flex flex-wrap items-center gap-2.5">
          {/* View Mode Buttons */}
          <div className="bg-white border border-[#ccd7e2] p-1 rounded-[0.35rem] flex items-center shadow-2xs">
            <button
              onClick={() => setViewMode("roadmap")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[0.26rem] text-xs font-bold transition-all ${
                viewMode === "roadmap"
                  ? "bg-[#115eff] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
              title="Interactive Horizontal Stepper"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Roadmap</span>
            </button>

            <button
              onClick={() => setViewMode("tree")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[0.26rem] text-xs font-bold transition-all ${
                viewMode === "tree"
                  ? "bg-[#115eff] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
              title="Alternating Connected Timeline (CFP PDF Style)"
            >
              <GitCommit className="w-3.5 h-3.5" />
              <span>CFP Tree</span>
            </button>

            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[0.26rem] text-xs font-bold transition-all ${
                viewMode === "table"
                  ? "bg-[#115eff] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
              title="Table Summary"
            >
              <List className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>

          <button
            onClick={handleDownloadIcs}
            className="inline-flex items-center justify-center gap-2 min-h-[42px] px-5 py-2 bg-[#115eff] hover:bg-[#0a4de6] text-white text-xs sm:text-sm font-bold rounded-[0.26rem] transition-all shadow-sm hover:shadow-md"
          >
            <Download className="w-4 h-4" />
            <span>Export (.ICS)</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: SMART INTERACTIVE ROADMAP (Default) */}
      {viewMode === "roadmap" && (
        <div className="px-4 sm:px-6 py-8 sm:py-10 space-y-8">
          
          {/* Smart Upcoming Notice Banner */}
          <div className="p-4 sm:p-5 bg-blue-50 border border-blue-200/90 rounded-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#115eff] text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-[#115eff]">
                  Key Upcoming Deadline
                </div>
                <h4 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                  Paper Submission (Workshops, Regular & Special Sessions): <span className="text-[#115eff]">April 08, 2027</span>
                </h4>
              </div>
            </div>

            <button
              onClick={() => handleSelectMilestone("paper-submission", 2)}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 bg-white text-[#115eff] border border-[#ccd7e2] hover:bg-blue-50 rounded-[0.26rem] transition-colors shadow-2xs shrink-0"
            >
              <span>View Milestone Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Horizontal Scrollable Stepper Ribbon Header Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">Chronological Stepper</span>
              <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                • Click any date or use arrows to navigate
              </span>
            </div>

            {/* Left / Right Active Milestone Navigation Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevMilestone}
                aria-label="Previous timeline milestone"
                className="w-9 h-9 bg-white hover:bg-slate-100 border border-[#ccd7e2] rounded-[0.26rem] flex items-center justify-center text-slate-700 hover:text-[#115eff] transition-all shadow-2xs"
                title="Previous milestone"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextMilestone}
                aria-label="Next timeline milestone"
                className="w-9 h-9 bg-white hover:bg-slate-100 border border-[#ccd7e2] rounded-[0.26rem] flex items-center justify-center text-slate-700 hover:text-[#115eff] transition-all shadow-2xs"
                title="Next milestone"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Continuous Horizontal Scrollable Ribbon with Connector Line */}
          <div className="relative py-2">
            {/* Background Connector Track */}
            <div className="absolute top-[34px] left-8 right-8 h-1 bg-slate-200 hidden md:block" />

            <div
              ref={scrollContainerRef}
              className="flex items-start gap-4 sm:gap-6 overflow-x-auto pb-4 pt-1 px-1 scroll-smooth snap-x snap-mandatory"
              style={{ scrollbarWidth: "thin" }}
            >
              {IMPORTANT_DATES.map((item, idx) => {
                const isSelected = item.id === activeMilestoneId;
                const isCritical = item.highlight;
                const stepNum = String(idx + 1).padStart(2, "0");

                return (
                  <button
                    key={item.id}
                    data-timeline-node
                    onClick={() => handleSelectMilestone(item.id, idx)}
                    className={`shrink-0 w-44 sm:w-52 p-4 rounded-md border-2 text-left transition-colors relative snap-start cursor-pointer group ${
                      isSelected
                        ? "bg-white border-[#115eff] shadow-sm"
                        : "bg-white border-slate-200 hover:border-[#115eff]/60 hover:shadow-2xs"
                    }`}
                  >
                    {/* Top Step Number Badge & Status Dot */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-colors ${
                            isSelected
                              ? "bg-[#115eff] text-white shadow-xs"
                              : isCritical
                              ? "bg-blue-100 text-[#115eff]"
                              : "bg-slate-100 text-slate-700 group-hover:bg-blue-50 group-hover:text-[#115eff]"
                          }`}
                        >
                          {stepNum}
                        </span>

                        {isCritical && (
                          <span className="w-2 h-2 rounded-full bg-[#115eff] animate-pulse" />
                        )}
                      </div>

                      <span
                        className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          isSelected
                            ? "bg-blue-50 text-[#115eff] font-bold"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {item.category}
                      </span>
                    </div>

                    {/* Date */}
                    <div
                      className={`text-sm sm:text-base font-extrabold leading-tight ${
                        isSelected ? "text-[#115eff]" : "text-slate-900"
                      }`}
                    >
                      {item.date}
                    </div>

                    {/* Short Title */}
                    <p className="mt-1.5 text-xs text-slate-600 line-clamp-2 leading-snug font-normal">
                      {item.title}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Featured Active Milestone Inspector Card */}
          <div className="p-6 sm:p-8 bg-gradient-to-br from-blue-50/70 via-white to-slate-50 border border-[#ccd7e2] rounded-md shadow-xs">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-slate-200">
              
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="px-3 py-1 bg-[#115eff] text-white text-xs font-bold rounded-md uppercase tracking-wider">
                    Milestone {String(activeIndex + 1).padStart(2, "0")} of 09
                  </span>
                  <span className="px-3 py-1 bg-white border border-[#ccd7e2] text-slate-700 text-xs font-bold rounded-md capitalize">
                    {activeMilestone.category} Phase
                  </span>
                  {activeMilestone.highlight && (
                    <span className="px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-md">
                      Critical Conference Deadline
                    </span>
                  )}
                </div>

                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {activeMilestone.title}
                </h3>
              </div>

              {/* Big Date Callout */}
              <div className="p-4 bg-white border border-blue-200 rounded-md text-left lg:text-right shrink-0 shadow-2xs min-w-[200px]">
                <div className="text-xs font-bold uppercase tracking-wider text-[#115eff]">
                  Milestone Date
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900">
                  {activeMilestone.date}
                </div>
                <div className="text-xs text-slate-500 font-semibold mt-0.5">
                  23:59 AoE (Anywhere on Earth)
                </div>
              </div>

            </div>

            {/* Description & Action Toolbar */}
            <div className="pt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              
              <p className="text-base sm:text-lg text-slate-700 leading-relaxed max-w-2xl font-normal">
                {activeMilestone.description}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <a
                  href={generateGoogleCalendarUrl(activeMilestone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-[#ccd7e2] text-slate-800 text-xs sm:text-sm font-bold rounded-[0.26rem] transition-colors shadow-2xs"
                >
                  <GoogleCalendarIcon className="w-4 h-4" />
                  <span>Google Calendar</span>
                </a>

                <button
                  onClick={() => handleCopyMilestone(activeMilestone)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-[#ccd7e2] text-slate-800 text-xs sm:text-sm font-bold rounded-[0.26rem] transition-colors shadow-2xs"
                >
                  {copiedId === activeMilestone.id ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-600" />
                      <span>Copy Date</span>
                    </>
                  )}
                </button>
              </div>

            </div>

            {/* Previous / Next Milestone Stepper Buttons */}
            <div className="mt-8 pt-5 border-t border-slate-200/80 flex items-center justify-between">
              <button
                onClick={handlePrevMilestone}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold text-slate-700 hover:text-[#115eff] hover:bg-white rounded-[0.26rem] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous Milestone</span>
              </button>

              <div className="text-xs text-slate-500 font-semibold hidden sm:block">
                Use arrow buttons or click any node to explore the full timeline
              </div>

              <button
                onClick={handleNextMilestone}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-[#115eff] hover:bg-[#0a4de6] rounded-[0.26rem] transition-all shadow-xs"
              >
                <span>Next Milestone</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      )}

      {/* VIEW 2: CFP TREE VIEW (Alternating Connected Branches Matching CFP PDF Page 2) */}
      {viewMode === "tree" && (
        <div className="px-4 sm:px-6 py-10 sm:py-14">
          <div className="text-center max-w-xl mx-auto mb-10">
            <div className="text-xs font-bold uppercase tracking-wider text-[#115eff] mb-1">
              Official CFP Design
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Alternating Chronological Tree
            </h3>
            <p className="mt-1.5 text-sm text-slate-600">
              Matching the milestone layout from page 2 of the official CFP document.
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            {/* Center Vertical Spine Line (Desktop) / Left Line (Mobile) */}
            <div className="absolute left-6 md:left-1/2 top-0 bottom-12 w-0.5 bg-[#115eff]/30 md:-translate-x-1/2" />

            <div className="space-y-8 sm:space-y-12 relative">
              {IMPORTANT_DATES.map((item, idx) => {
                const isEven = idx % 2 === 0; // Left on desktop
                const isLast = idx === IMPORTANT_DATES.length - 1;

                return (
                  <div
                    key={item.id}
                    className={`relative flex items-center ${
                      isLast
                        ? "justify-center pt-6"
                        : isEven
                        ? "md:flex-row flex-row"
                        : "md:flex-row-reverse flex-row"
                    }`}
                  >
                    {/* Center Node Dot */}
                    <div
                      className={`absolute left-6 md:left-1/2 -translate-x-1/2 w-8 h-8 rounded-full border-4 flex items-center justify-center z-10 transition-all ${
                        item.highlight
                          ? "bg-[#115eff] border-blue-200 text-white shadow-md ring-4 ring-blue-100"
                          : "bg-white border-[#115eff] text-[#115eff]"
                      }`}
                    >
                      <span className="text-[10px] font-black">{idx + 1}</span>
                    </div>

                    {/* Content Box */}
                    <div
                      className={`ml-14 md:ml-0 w-full md:w-[calc(50%-42px)] p-5 sm:p-6 bg-white border rounded-md transition-all shadow-2xs hover:shadow-md ${
                        item.highlight
                          ? "border-blue-300 ring-1 ring-blue-100 bg-gradient-to-br from-blue-50/40 to-white"
                          : "border-slate-200 hover:border-[#115eff]"
                      } ${isEven ? "md:text-right" : "md:text-left"}`}
                    >
                      {/* Date Badge */}
                      <div
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs sm:text-sm font-extrabold mb-2 ${
                          item.highlight
                            ? "bg-[#115eff] text-white shadow-xs"
                            : "bg-blue-50 text-[#115eff] border border-blue-200"
                        }`}
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{item.date}</span>
                      </div>

                      <h4 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-snug">
                        {item.title}
                      </h4>

                      <p className="mt-1.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
                        {item.description}
                      </p>

                      <div
                        className={`mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold ${
                          isEven ? "md:justify-end justify-between" : "justify-between"
                        }`}
                      >
                        <span className="text-slate-500 uppercase tracking-wider">
                          {item.category} phase
                        </span>
                        <a
                          href={generateGoogleCalendarUrl(item)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#115eff] hover:underline flex items-center gap-1 font-bold"
                        >
                          <span>Calendar</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: COMPACT TABLE VIEW */}
      {viewMode === "table" && (
        <div className="px-4 sm:px-6 py-8 sm:py-10">
          <div className="overflow-x-auto border border-[#ccd7e2] rounded-md shadow-2xs">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-xs border-b border-[#ccd7e2]">
                <tr>
                  <th className="px-4 py-3.5">#</th>
                  <th className="px-4 py-3.5">Milestone Date</th>
                  <th className="px-4 py-3.5">Conference Milestone</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ccd7e2] bg-white">
                {IMPORTANT_DATES.map((item, idx) => (
                  <tr
                    key={item.id}
                    className={`hover:bg-slate-50/70 transition-colors ${
                      item.highlight ? "bg-blue-50/30" : ""
                    }`}
                  >
                    <td className="px-4 py-4 font-bold text-slate-500">
                      {String(idx + 1).padStart(2, "0")}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="font-extrabold text-slate-900 block">
                        {item.date}
                      </span>
                      <span className="text-xs text-slate-500">23:59 AoE</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-bold text-slate-900 block leading-snug">
                        {item.title}
                      </span>
                      <span className="text-xs text-slate-600 mt-0.5 block">
                        {item.description}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded uppercase tracking-wider">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right">
                      <div className="inline-flex items-center gap-2">
                        <a
                          href={generateGoogleCalendarUrl(item)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-white hover:bg-blue-50 border border-[#ccd7e2] text-[#115eff] rounded hover:border-[#115eff] transition-colors"
                          title="Add to Google Calendar"
                        >
                          <GoogleCalendarIcon className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleCopyMilestone(item)}
                          className="p-2 bg-white hover:bg-slate-50 border border-[#ccd7e2] text-slate-700 rounded hover:text-[#115eff] transition-colors"
                          title="Copy date"
                        >
                          {copiedId === item.id ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Global Timezone Note */}
      <div className="px-4 sm:px-6 pb-8">
        <div className="p-4 sm:p-5 bg-slate-50 border border-slate-200/80 rounded-md flex items-center gap-3.5 text-xs sm:text-sm text-slate-700">
          <Clock className="w-5 h-5 text-[#115eff] shrink-0" />
          <span>
            <strong>Timezone Notice:</strong> All submission and camera-ready deadlines follow 23:59 Anywhere on Earth (AoE). Conference technical sessions and event timings follow local Ho Chi Minh City time (GMT+7).
          </span>
        </div>
      </div>
    </SectionContainer>
  );
}
