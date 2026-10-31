"use client";

import React from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  BookOpen,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export interface PaperItem {
  id: string;
  title: string;
  authors: string;
  time: string;
}

export interface SessionItem {
  id: string;
  code: string;
  title: string;
  track: "SSE" | "CYB" | "HMS" | "SS" | "WS";
  trackName: string;
  day: string;
  dayLabel: string;
  timeSlot: string;
  room: string;
  chair: string;
  coChair?: string;
  papers: PaperItem[];
}

interface TechnicalSessionCardProps {
  session: SessionItem;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export function TechnicalSessionCard({
  session,
  isExpanded,
  onToggleExpand,
}: TechnicalSessionCardProps) {
  return (
    <Card className="p-0 overflow-hidden gap-0">
      <div
        onClick={onToggleExpand}
        className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/70 transition-colors"
      >
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="ute">{session.code}</Badge>
            <Badge variant="secondary">{session.trackName}</Badge>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500">
              <Calendar className="size-3.5 text-[#115eff]" />
              {session.dayLabel}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500">
              <Clock className="size-3.5 text-[#115eff]" />
              {session.timeSlot}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500">
              <MapPin className="size-3.5 text-[#115eff]" />
              {session.room}
            </span>
          </div>

          <h3 className="text-lg font-extrabold text-slate-900">
            {session.title}
          </h3>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <Users className="size-3.5 text-slate-400" />
              <strong>Chair:</strong> {session.chair}
            </span>
            {session.coChair && (
              <span>
                <strong>Co-Chair:</strong> {session.coChair}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          <Badge variant="outline">{(session.papers || []).length} Papers</Badge>
          {isExpanded ? (
            <ChevronUp className="size-5 text-slate-400" />
          ) : (
            <ChevronDown className="size-5 text-slate-400" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-slate-100 bg-slate-50/50 divide-y divide-slate-100">
          {(session.papers || []).map((paper) => (
            <div
              key={paper.id}
              className="px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#115eff] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                    {paper.id}
                  </span>
                  <span className="font-bold text-slate-900 text-sm">
                    {paper.title}
                  </span>
                </div>
                <p className="text-slate-500 flex items-center gap-1.5">
                  <BookOpen className="size-3.5 text-slate-400" />
                  {paper.authors}
                </p>
              </div>
              <span className="font-semibold text-slate-500 shrink-0">
                {paper.time}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
