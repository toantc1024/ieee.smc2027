"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  Search,
  Users,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Layers,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface PaperItem {
  id: string;
  title: string;
  authors: string;
  time: string;
}

interface SessionItem {
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

const TRACK_LABELS: Record<string, string> = {
  ALL: "All Technical Tracks",
  SSE: "Systems Science & Engineering",
  CYB: "Cybernetics",
  HMS: "Human-Machine Systems",
  SS: "Special Sessions",
  WS: "Workshops & Tutorials",
};

export default function ProgramSessionsPage() {
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrack, setSelectedTrack] = useState<string>("ALL");
  const [selectedDay, setSelectedDay] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setLoading(true);
    fetch("/api/program/sessions")
      .then((res) => res.json())
      .then((json) => {
        if (json?.success && Array.isArray(json.data?.sessions)) {
          setSessions(json.data.sessions);
          const initialExpanded: Record<string, boolean> = {};
          json.data.sessions.forEach((s: SessionItem) => {
            initialExpanded[s.id] = true;
          });
          setExpandedIds(initialExpanded);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const days = useMemo(() => {
    const map = new Map<string, string>();
    sessions.forEach((s) => map.set(s.day, s.dayLabel));
    return Array.from(map.entries());
  }, [sessions]);

  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      if (selectedTrack !== "ALL" && s.track !== selectedTrack) return false;
      if (selectedDay !== "ALL" && s.day !== selectedDay) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inSession =
          s.code.toLowerCase().includes(q) ||
          s.title.toLowerCase().includes(q) ||
          s.chair.toLowerCase().includes(q) ||
          s.room.toLowerCase().includes(q);
        const inPapers = (s.papers || []).some(
          (p) =>
            p.id.toLowerCase().includes(q) ||
            p.title.toLowerCase().includes(q) ||
            p.authors.toLowerCase().includes(q)
        );
        return inSession || inPapers;
      }
      return true;
    });
  }, [sessions, selectedTrack, selectedDay, searchQuery]);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <main className="min-h-screen bg-slate-50/70 pb-20">
      <div className="bg-white border-b border-slate-200">
        <SectionContainer
          id="sessions-header"
          fullWidthBg="bg-white"
          className="py-10 sm:py-14"
        >
          <div className="max-w-4xl space-y-3">
            <Badge variant="ute" className="px-3 py-1">
              <Layers className="size-3.5" />
              Technical Program & PaperCept Schedule
            </Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
              Technical Sessions <span className="text-[#005496]">&amp; Tracks</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-600">
              Live database schedule of oral presentations, special sessions, and PaperCept manuscripts at IEEE SMC 2027 in Ho Chi Minh City.
            </p>
          </div>
        </SectionContainer>
      </div>

      <SectionContainer id="sessions-body" fullWidthBg="transparent" className="pt-8">
        <div className="space-y-6">
          {/* Filter Bar */}
          <Card className="p-5 space-y-4">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-1.5">
                {Object.entries(TRACK_LABELS).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedTrack(key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      selectedTrack === key
                        ? "bg-[#005496] text-white"
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
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search PaperCept ID, author, title..."
                  className="pl-10"
                />
              </div>
            </div>

            {days.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedDay("ALL")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                    selectedDay === "ALL"
                      ? "bg-blue-50 text-[#005496] border border-blue-200"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  All Days
                </button>
                {days.map(([dayIso, dayLabel]) => (
                  <button
                    key={dayIso}
                    type="button"
                    onClick={() => setSelectedDay(dayIso)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                      selectedDay === dayIso
                        ? "bg-blue-50 text-[#005496] border border-blue-200"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    {dayLabel}
                  </button>
                ))}
              </div>
            )}
          </Card>

          {/* Sessions List */}
          {loading ? (
            <Card className="p-16 items-center justify-center text-slate-400">
              <Loader2 className="size-7 animate-spin text-[#005496]" />
              <span className="text-xs">Loading technical sessions from PostgreSQL...</span>
            </Card>
          ) : filteredSessions.length === 0 ? (
            <Card className="p-12 text-center text-slate-500 text-sm">
              No technical sessions match your search criteria.
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredSessions.map((session) => {
                const isExpanded = Boolean(expandedIds[session.id]);
                return (
                  <Card key={session.id} className="p-0 overflow-hidden gap-0">
                    <div
                      onClick={() => toggleExpand(session.id)}
                      className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/70 transition-colors"
                    >
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="ute">{session.code}</Badge>
                          <Badge variant="secondary">{session.trackName}</Badge>
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500">
                            <Calendar className="size-3.5 text-[#005496]" />
                            {session.dayLabel}
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500">
                            <Clock className="size-3.5 text-[#005496]" />
                            {session.timeSlot}
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500">
                            <MapPin className="size-3.5 text-[#005496]" />
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
                        <Badge variant="outline">
                          {(session.papers || []).length} Papers
                        </Badge>
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
                                <span className="font-mono font-bold text-[#005496] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
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
                            <span className="font-mono font-semibold text-slate-500 shrink-0">
                              {paper.time}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}

          {/* Call to Action */}
          <Card className="bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Presenting an Accepted PaperCept Manuscript?
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Complete your Author Registration with your PaperCept ID to confirm inclusion in the technical program and IEEE Xplore proceedings.
              </p>
            </div>
            <Link href="/registration">
              <Button variant="ute">
                Author Registration
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </Card>
        </div>
      </SectionContainer>
    </main>
  );
}
