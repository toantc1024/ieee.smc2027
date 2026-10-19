"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Layers, ArrowRight, Loader2 } from "lucide-react";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SessionsFilterBar } from "@/components/program/SessionsFilterBar";
import {
  TechnicalSessionCard,
  type SessionItem,
} from "@/components/program/TechnicalSessionCard";

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
              Live database schedule of oral presentations, special sessions,
              and PaperCept manuscripts at IEEE SMC 2027 in Ho Chi Minh City.
            </p>
          </div>
        </SectionContainer>
      </div>

      <SectionContainer
        id="sessions-body"
        fullWidthBg="transparent"
        className="pt-8"
      >
        <div className="space-y-6">
          <SessionsFilterBar
            selectedTrack={selectedTrack}
            onSelectTrack={setSelectedTrack}
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            days={days}
          />

          {loading ? (
            <Card className="p-16 items-center justify-center text-slate-400">
              <Loader2 className="size-7 animate-spin text-[#005496]" />
              <span className="text-xs">
                Loading technical sessions from PostgreSQL...
              </span>
            </Card>
          ) : filteredSessions.length === 0 ? (
            <Card className="p-12 text-center text-slate-500 text-sm">
              No technical sessions match your search criteria.
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredSessions.map((session) => (
                <TechnicalSessionCard
                  key={session.id}
                  session={session}
                  isExpanded={Boolean(expandedIds[session.id])}
                  onToggleExpand={() => toggleExpand(session.id)}
                />
              ))}
            </div>
          )}

          <Card className="bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Presenting an Accepted PaperCept Manuscript?
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Complete your Author Registration with your PaperCept ID to
                confirm inclusion in the technical program and IEEE Xplore
                proceedings.
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
