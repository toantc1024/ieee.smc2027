"use client";

import React from "react";
import { Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export const TRACK_LABELS: Record<string, string> = {
  ALL: "All Technical Tracks",
  SSE: "Systems Science & Engineering",
  CYB: "Cybernetics",
  HMS: "Human-Machine Systems",
  SS: "Special Sessions",
  WS: "Workshops & Tutorials",
};

interface SessionsFilterBarProps {
  selectedTrack: string;
  onSelectTrack: (track: string) => void;
  selectedDay: string;
  onSelectDay: (day: string) => void;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  days: Array<[string, string]>;
}

export function SessionsFilterBar({
  selectedTrack,
  onSelectTrack,
  selectedDay,
  onSelectDay,
  searchQuery,
  onSearchChange,
  days,
}: SessionsFilterBarProps) {
  return (
    <Card className="p-5 space-y-4">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5">
          {Object.entries(TRACK_LABELS).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => onSelectTrack(key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                selectedTrack === key
                  ? "bg-[#115eff] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {key === "ALL" ? label : `${key} · ${label}`}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="size-4 text-slate-400 absolute left-3.5 top-3" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search PaperCept ID, author, title..."
            className="pl-10"
          />
        </div>
      </div>

      {days.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => onSelectDay("ALL")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
              selectedDay === "ALL"
                ? "bg-blue-50 text-[#115eff] border border-blue-200"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            All Days
          </button>
          {days.map(([dayIso, dayLabel]) => (
            <button
              key={dayIso}
              type="button"
              onClick={() => onSelectDay(dayIso)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                selectedDay === dayIso
                  ? "bg-blue-50 text-[#115eff] border border-blue-200"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {dayLabel}
            </button>
          ))}
        </div>
      )}
    </Card>
  );
}
