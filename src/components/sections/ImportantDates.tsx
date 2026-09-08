"use client";

import React, { useState } from "react";
import { Calendar, Clock, Download } from "lucide-react";
import { IMPORTANT_DATES } from "@/data/conference";
import { SectionContainer } from "@/components/layout/SectionContainer";

export function ImportantDates() {
  const [filter, setFilter] = useState<string>("all");

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

  const categories = [
    { id: "all", label: "All Milestones" },
    { id: "submission", label: "Submissions" },
    { id: "notification", label: "Notifications" },
    { id: "registration", label: "Registration" },
    { id: "event", label: "Conference Event" },
  ];

  const filteredDates =
    filter === "all" ? IMPORTANT_DATES : IMPORTANT_DATES.filter((d) => d.category === filter);

  return (
    <SectionContainer id="dates">
      {/* Section Header */}
      <div className="relative overflow-hidden px-4 sm:px-6 py-6 sm:py-7 border-b border-[#ccd7e2] bg-slate-50/60 flex flex-wrap items-center justify-between gap-4">
        <div className="corner-grid-tr opacity-50" />
        <div className="relative z-10">
          <span className="text-sm font-bold text-[#115eff] uppercase tracking-wider block mb-1">
            Timeline & Official Milestones
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Important Dates & Deadlines
          </h2>
        </div>

        <button
          onClick={handleDownloadIcs}
          className="inline-flex items-center justify-center gap-2.5 min-h-[52px] px-7 py-3 bg-[#115eff] hover:bg-[#0a4de6] text-white text-sm sm:text-base font-bold rounded-[0.26rem] transition-all shadow-sm hover:shadow-md"
        >
          <Download className="w-4 h-4" />
          <span>Export All Dates (.ICS)</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="px-4 sm:px-6 py-3.5 border-b border-[#ccd7e2] bg-slate-50/30 flex flex-wrap items-center gap-2.5">
        <span className="text-sm font-medium text-slate-600 mr-2">Filter:</span>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilter(cat.id)}
            className={`min-h-[40px] px-5 py-2 text-sm font-semibold rounded-[0.26rem] transition-colors ${
              filter === cat.id
                ? "bg-[#115eff] text-white shadow-xs"
                : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Dates Timeline Grid */}
      <div className="px-4 sm:px-6 py-8 sm:py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDates.map((item) => (
            <div
              key={item.id}
              className={`p-6 sm:p-7 rounded-md border transition-all flex flex-col justify-between ${
                item.highlight
                  ? "bg-gradient-to-br from-blue-50/60 to-white border-blue-300 shadow-xs ring-1 ring-blue-200/50"
                  : "bg-white border-slate-200 hover:border-[#115eff] hover:shadow-sm"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-sm font-bold text-slate-600 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#115eff]" />
                    <span className="text-slate-900 font-extrabold">{item.date}</span>
                  </span>

                  {item.highlight && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#115eff] text-white text-xs font-bold rounded-md">
                      Major Milestone
                    </span>
                  )}
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-snug">
                  {item.title}
                </h3>

                <p className="mt-2.5 text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                  {item.description}
                </p>
              </div>

              <div className="mt-6 pt-3.5 border-t border-slate-100 flex items-center justify-between text-sm text-slate-600">
                <span className="capitalize font-medium text-slate-700">
                  {item.category} phase
                </span>
                <span className="text-[#115eff] font-bold">23:59 AoE</span>
              </div>
            </div>
          ))}
        </div>

        {/* Timezone Note */}
        <div className="mt-6 p-5 bg-slate-50 border border-slate-200/80 rounded-md flex items-center gap-3.5 text-sm text-slate-700">
          <Clock className="w-5 h-5 text-[#115eff] shrink-0" />
          <span>
            <strong>Official Timeline Notice:</strong> All paper submission and camera-ready deadlines follow 23:59 Anywhere on Earth (AoE). Conference sessions and gala banquet run according to local Ho Chi Minh City time (GMT+7).
          </span>
        </div>
      </div>
    </SectionContainer>
  );
}
