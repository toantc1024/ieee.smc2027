"use client";

import React, { useState } from "react";
import { Clock, MapPin, User } from "lucide-react";
import { SectionContainer } from "@/components/layout/SectionContainer";
import {
  subItemAttr,
  useActiveBuilderSubIndex,
} from "@/modules/website-builder/utils/sub-item-path";

export interface TimelineEvent {
  time: string;
  title: string;
  room: string;
  speakers?: string;
  track?: string;
}

export interface TimelineDay {
  dayNumber: number;
  dateStr: string;
  shortDate?: string;
  theme: string;
  events: TimelineEvent[];
}

export const DEFAULT_DAYS: TimelineDay[] = [
  {
    dayNumber: 1,
    dateStr: "Wednesday, Oct 6, 2027",
    theme: "Workshops, Tutorials & Welcome Reception",
    events: [
      { time: "08:30 - 12:00", title: "Morning Hands-On Tutorials & Workshops", room: "Grand Ballroom A/B", track: "Workshops" },
      { time: "12:00 - 13:30", title: "Buffet Lunch & Networking", room: "Saigon Foyer" },
      { time: "13:30 - 17:00", title: "Afternoon Specialized Technical Workshops", room: "Grand Ballroom C", track: "Workshops" },
      { time: "18:00 - 20:30", title: "Welcome Reception & Cultural Showcase", room: "Poolside Terrace", track: "Social" },
    ],
  },
  {
    dayNumber: 2,
    dateStr: "Thursday, Oct 7, 2027",
    theme: "Opening Ceremony & Plenary Keynotes",
    events: [
      { time: "09:00 - 10:15", title: "Official Opening Ceremony & Presidential Address", room: "Grand Opera Hall", track: "Plenary" },
      { time: "10:45 - 12:00", title: "Plenary Keynote I: Autonomous Human-AI Systems", room: "Grand Opera Hall", speakers: "Distinguished SMC Fellow", track: "Keynote" },
      { time: "13:30 - 17:30", title: "Parallel Oral Technical Sessions (Tracks A-F)", room: "Session Rooms 1-6", track: "Technical" },
    ],
  },
  {
    dayNumber: 3,
    dateStr: "Friday, Oct 8, 2027",
    theme: "Flagship Keynotes & Industrial Symposia",
    events: [
      { time: "09:00 - 10:15", title: "Plenary Keynote II: Cybernetic Brain-Computer Interfaces", room: "Grand Opera Hall", track: "Keynote" },
      { time: "10:45 - 12:30", title: "Industry Forum: Sustainable Smart Manufacturing", room: "Ballroom B", track: "Industry" },
      { time: "14:00 - 17:30", title: "Parallel Technical Sessions & Interactive Poster Demos", room: "Session Rooms 1-6", track: "Technical" },
      { time: "19:00 - 22:00", title: "Gala Banquet & Best Paper Awards Ceremony", room: "Grand Opera Ballroom", track: "Social" },
    ],
  },
  {
    dayNumber: 4,
    dateStr: "Saturday, Oct 9, 2027",
    theme: "Advanced Tracks & Women in Engineering (WiE)",
    events: [
      { time: "09:00 - 10:15", title: "Plenary Keynote III: Ethical Autonomous Cyber-Physical Systems", room: "Grand Opera Hall", track: "Keynote" },
      { time: "10:45 - 12:30", title: "IEEE Women in Engineering & Young Professionals Panel", room: "Ballroom A", track: "WiE / YP" },
      { time: "13:30 - 17:30", title: "Special Sessions on Human-Machine Symbiosis", room: "Session Rooms 1-6", track: "Technical" },
    ],
  },
  {
    dayNumber: 5,
    dateStr: "Sunday, Oct 10, 2027",
    theme: "Closing Plenary & Saigon Technical Excursion",
    events: [
      { time: "09:30 - 11:30", title: "Closing Ceremony & SMC 2028 Flag Passing", room: "Grand Opera Hall", track: "Closing" },
      { time: "13:00 - 18:00", title: "Ho Chi Minh City High-Tech Park & Cultural Tour", room: "Departure: Hotel Lobby", track: "Excursion" },
    ],
  },
];

export interface ScheduleTimelineProps {
  days?: TimelineDay[];
  title?: string;
  subtitle?: string;
  venueBadge?: string;
}

export function ScheduleTimelineSection({
  days = DEFAULT_DAYS,
  title = "Conference Schedule & Daily Timeline",
  subtitle = "October 6–10, 2027 • Five days of cutting-edge research, keynotes, workshops, and networking",
  venueBadge = "Sheraton Saigon Grand Opera Hotel",
}: ScheduleTimelineProps) {
  const safeDays = Array.isArray(days) ? days : DEFAULT_DAYS;
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const builderDayIdx = useActiveBuilderSubIndex("days", safeDays.length);
  const [lastBuilderIdx, setLastBuilderIdx] = useState<number | null>(null);

  if (builderDayIdx !== lastBuilderIdx) {
    setLastBuilderIdx(builderDayIdx);
    if (builderDayIdx !== null) {
      setSelectedDayIdx(builderDayIdx);
    }
  }

  const activeDayIndex =
    safeDays.length > 0 ? Math.max(0, Math.min(selectedDayIdx, safeDays.length - 1)) : 0;
  const activeDay = safeDays[activeDayIndex];

  return (
    <SectionContainer id="schedule" fullWidthBg="bg-slate-50">
      <div className="px-4 sm:px-6 pt-10 sm:pt-14 pb-6 w-full">
        <div className="space-y-3 max-w-4xl">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
            {title}
          </h2>
          <p className="text-base sm:text-lg text-slate-600 font-medium">
            {subtitle}
          </p>
        </div>

        {/* Day Selector Tabs */}
        <div className="mt-8 flex flex-wrap gap-2 border-b border-slate-200 pb-4">
          {safeDays.map((day, index) => {
            const isSelected = activeDayIndex === index;
            const parsedDate =
              day.shortDate ||
              (day.dateStr
                ? day.dateStr.includes(",")
                  ? day.dateStr.split(",").slice(1, 2).join("").trim()
                  : day.dateStr
                : "");
            return (
              <button
                key={`${day.dayNumber}-${index}`}
                type="button"
                onClick={() => setSelectedDayIdx(index)}
                {...subItemAttr(["days", index])}
                className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <span>Day {day.dayNumber ?? index + 1}</span>
                {parsedDate && (
                  <span className={`text-xs ${isSelected ? "text-blue-100" : "text-slate-400"}`}>
                    ({parsedDate})
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {activeDay ? (
          <>
            {/* Active Day Overview Banner */}
            <div className="mt-6 p-4 rounded-xl bg-white border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-xs">
              <div>
                <span className="text-xs font-bold text-blue-600">
                  {activeDay.dateStr}
                </span>
                <h3 className="text-lg font-bold text-slate-900">{activeDay.theme}</h3>
              </div>
              {venueBadge && (
                <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                  {venueBadge}
                </span>
              )}
            </div>

            {/* Events Timeline */}
            <div className="mt-6 space-y-3">
              {(activeDay.events || []).length === 0 ? (
                <p className="py-6 text-sm text-slate-500">No events scheduled for this day.</p>
              ) : (
                (activeDay.events || []).map((evt, idx) => (
                  <div
                    key={idx}
                    {...subItemAttr(["days", activeDayIndex, "events", idx])}
                    className="p-5 rounded-xl bg-white border border-slate-200 hover:border-blue-300 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                            {evt.time}
                          </span>
                          {evt.track && (
                            <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                              {evt.track}
                            </span>
                          )}
                        </div>
                        <h4 className="text-base font-bold text-slate-900">{evt.title}</h4>
                        {evt.speakers && (
                          <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
                            <User className="w-3.5 h-3.5" />
                            <span>{evt.speakers}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-md self-end md:self-center shrink-0">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{evt.room}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <p className="py-8 text-sm text-slate-500">No schedule days added yet.</p>
        )}
      </div>
    </SectionContainer>
  );
}
