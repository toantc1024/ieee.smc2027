"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SessionsFilterBar } from "@/components/program/SessionsFilterBar";
import {
  TechnicalSessionCard,
  type SessionItem,
} from "@/components/program/TechnicalSessionCard";
import { subItemAttr, useActiveBuilderSubIndex } from "@/modules/website-builder/utils/sub-item-path";

export const DEFAULT_TECHNICAL_SESSIONS: SessionItem[] = [
  {
    id: "s1",
    code: "ThA01",
    title: "Autonomous Robotics & Intelligent Control",
    track: "SSE",
    trackName: "Systems Science & Engineering",
    day: "2027-10-07",
    dayLabel: "Day 1 · Oct 7, 2027",
    timeSlot: "09:00 – 10:30",
    room: "Grand Ballroom A",
    chair: "Prof. Dimitar Filev · IEEE Fellow",
    coChair: "Assoc. Prof. Nguyen Van B · HCMUTE",
    papers: [
      {
        id: "SMC27-101",
        title: "Model Predictive Control for Multi-Agent Autonomous Navigation in GPS-Denied Environments",
        authors: "Alex Chen, Min-Jun Kim, Sarah Connor",
        time: "09:00 – 09:20",
      },
      {
        id: "SMC27-102",
        title: "Real-Time Trajectory Optimization for Quadruped Robots via Deep Reinforcement Learning",
        authors: "Tran Minh Tri, Hiroshi Tanaka, David Lee",
        time: "09:20 – 09:40",
      },
    ],
  },
  {
    id: "s2",
    code: "ThA02",
    title: "Deep Learning Foundations & Biomedical Cybernetics",
    track: "CYB",
    trackName: "Cybernetics",
    day: "2027-10-07",
    dayLabel: "Day 1 · Oct 7, 2027",
    timeSlot: "09:00 – 10:30",
    room: "Ballroom B",
    chair: "Prof. Witold Pedrycz · IEEE Life Fellow",
    coChair: "Dr. Pham Thi C · HCMUTE",
    papers: [
      {
        id: "SMC27-201",
        title: "Explainable Fuzzy Cognitive Maps for Personalized Cardiovascular Disease Diagnosis",
        authors: "Michael Zhang, Maria Garcia, Oliver Brown",
        time: "09:00 – 09:20",
      },
    ],
  },
  {
    id: "s3",
    code: "FrA01",
    title: "Human-Robot Collaborative Manufacturing & Brain-Computer Interfaces",
    track: "HMS",
    trackName: "Human-Machine Systems",
    day: "2027-10-08",
    dayLabel: "Day 2 · Oct 8, 2027",
    timeSlot: "10:45 – 12:15",
    room: "Lotus Hall 1",
    chair: "Prof. Sam Kwong · IEEE Fellow",
    coChair: "Assoc. Prof. Le Hoang D · HCMUTE",
    papers: [
      {
        id: "SMC27-301",
        title: "Shared Autonomy and Intent Prediction for Industrial Exoskeleton Teleoperation",
        authors: "Chen Wei, Hoang Gia Bao, Lukas Weber",
        time: "10:45 – 11:05",
      },
    ],
  },
];

export interface TechnicalSessionsBlockProps {
  title?: string;
  subtitle?: string;
  sessions?: SessionItem[];
  syncFromDatabase?: boolean;
  ctaTitle?: string;
  ctaDescription?: string;
  ctaButtonLabel?: string;
  ctaButtonUrl?: string;
  showCta?: boolean;
}

export function TechnicalSessionsBlock({
  title = "Technical Sessions & Tracks",
  subtitle = "Schedule of oral presentations, special sessions, and PaperCept manuscripts at IEEE SMC 2027 in Ho Chi Minh City.",
  sessions: sessionsProp,
  syncFromDatabase = true,
  ctaTitle = "Presenting an Accepted PaperCept Manuscript?",
  ctaDescription = "Complete your Author Registration with your PaperCept ID to confirm inclusion in the technical program and IEEE Xplore proceedings.",
  ctaButtonLabel = "Author Registration",
  ctaButtonUrl = "/registration",
  showCta = true,
}: TechnicalSessionsBlockProps) {
  const hasExplicitSessions = Array.isArray(sessionsProp);
  const [sessions, setSessions] = useState<SessionItem[]>(() =>
    hasExplicitSessions ? sessionsProp : DEFAULT_TECHNICAL_SESSIONS
  );
  const [loading, setLoading] = useState(
    Boolean(syncFromDatabase && !hasExplicitSessions)
  );
  const [selectedTrack, setSelectedTrack] = useState<string>("ALL");
  const [selectedDay, setSelectedDay] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const activeSubIndex = useActiveBuilderSubIndex("sessions", sessions.length);

  useEffect(() => {
    if (Array.isArray(sessionsProp)) {
      setSessions(sessionsProp);
    }
  }, [sessionsProp]);

  useEffect(() => {
    if (!syncFromDatabase || (hasExplicitSessions && sessionsProp.length > 0)) {
      setLoading(false);
      return;
    }
    let mounted = true;
    setLoading(true);
    fetch("/api/program/sessions", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (mounted && json?.success && Array.isArray(json.data?.sessions)) {
          setSessions(json.data.sessions);
        }
      })
      .catch(() => null)
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [syncFromDatabase, hasExplicitSessions, sessionsProp?.length]);

  useEffect(() => {
    if (activeSubIndex !== null && sessions[activeSubIndex]) {
      const targetId = sessions[activeSubIndex].id || String(activeSubIndex);
      setExpandedIds((prev) => ({ ...prev, [targetId]: true }));
    }
  }, [activeSubIndex, sessions]);

  const days = useMemo(() => {
    const map = new Map<string, string>();
    sessions.forEach((s) => {
      if (s.day) map.set(s.day, s.dayLabel || s.day);
    });
    return Array.from(map.entries());
  }, [sessions]);

  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      if (selectedTrack !== "ALL" && s.track !== selectedTrack) return false;
      if (selectedDay !== "ALL" && s.day !== selectedDay) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inSession =
          (s.code || "").toLowerCase().includes(q) ||
          (s.title || "").toLowerCase().includes(q) ||
          (s.chair || "").toLowerCase().includes(q) ||
          (s.room || "").toLowerCase().includes(q);
        const inPapers = (s.papers || []).some(
          (p) =>
            (p.id || "").toLowerCase().includes(q) ||
            (p.title || "").toLowerCase().includes(q) ||
            (p.authors || "").toLowerCase().includes(q)
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
    <div className="w-full bg-slate-50/70 pb-16">
      <div className="bg-white border-b border-slate-200">
        <SectionContainer
          id="sessions-header"
          fullWidthBg="bg-white"
          className="py-10 sm:py-14"
        >
          <div className="max-w-4xl space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
              {title.includes("&") ? (
                <>
                  <span className="text-[#004776]">{title.split("&")[0].trim()} </span>
                  <span className="text-[#115eff]">&amp; {title.split("&").slice(1).join("&").trim()}</span>
                </>
              ) : (
                <span className="text-[#004776]">{title}</span>
              )}
            </h1>
            {subtitle && (
              <p className="text-base sm:text-lg text-slate-600">{subtitle}</p>
            )}
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
              <Loader2 className="size-7 animate-spin text-[#115eff]" />
              <span className="text-xs">Loading technical sessions...</span>
            </Card>
          ) : filteredSessions.length === 0 ? (
            <Card className="p-12 text-center text-slate-500 text-sm">
              No technical sessions match your criteria.
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredSessions.map((session, sIdx) => {
                const origIdx = sessions.indexOf(session);
                const effectiveIdx = origIdx >= 0 ? origIdx : sIdx;
                const key = session.id || String(effectiveIdx);
                const isExpanded =
                  expandedIds[key] !== undefined ? expandedIds[key] : true;

                return (
                  <div
                    key={key}
                    {...subItemAttr(["sessions", effectiveIdx])}
                    className="rounded-xl"
                  >
                    <TechnicalSessionCard
                      session={session}
                      sessionIndex={effectiveIdx}
                      isExpanded={isExpanded}
                      onToggleExpand={() => toggleExpand(key)}
                    />
                  </div>
                );
              })}
            </div>
          )}

          {showCta && (
            <Card className="bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {ctaTitle}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {ctaDescription}
                </p>
              </div>
              {ctaButtonLabel && (
                <Link href={ctaButtonUrl || "/registration"}>
                  <Button variant="ute">
                    {ctaButtonLabel}
                    <ArrowRight className="size-4" />
                  </Button>
                </Link>
              )}
            </Card>
          )}
        </div>
      </SectionContainer>
    </div>
  );
}

