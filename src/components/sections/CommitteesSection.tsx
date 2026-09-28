"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Globe,
  Award,
  Shield,
  Briefcase,
  Play,
  Pause,
} from "lucide-react";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { COMMITTEE_GROUPS, type CommitteeMember } from "@/data/conference";

// High-resolution chair portraits mapping
const CHAIR_PHOTO_MAP: Record<string, string> = {
  // Honorary Chairs
  "Hieu-Giang Le": "/chairs/prof-hieu-giang-le.webp",
  "Saeid Nahavandi": "/chairs/prof-saeid-nahavandi.webp",
  // General Chairs & Co-Chairs
  "Dinh-Thanh Chau": "/chairs/prof-dinh-thanh-chau.webp",
  "Yo-Ping Huang": "/chairs/prof-yo-ping-huang.webp",
  // Steering Committee
  "Sam Kwong": "/chairs/steering/sam-kwong.webp",
  "Imre Rudas": "/chairs/steering/imre-rudas.webp",
  "Adrian Stoica": "/chairs/steering/adrian-stoica.webp",
  "Ljiljana Trajkovic": "/chairs/steering/ljiljana-trajkovic.webp",
  "Eddie Tunstel": "/chairs/steering/eddie-tunstel.webp",
  // Other Committee Leaders
  "Ha-Hai Phan": "/chairs/prof-ha-hai-phan.png",
  "Rodney Roberts": "/chairs/prof-rodney-roberts.png",
  "Vladik Kreinovich": "/chairs/prof-vladik-kreinovich.png",
};

interface CommitteesSectionProps {
  title?: string;
  subtitle?: string;
  autoplayDuration?: number;
  initialGroupIndex?: number;
  showAllGroups?: boolean;
}

export function CommitteesSection({
  title = "Organizing Committee",
  subtitle = "International Steering & Local Organizing Committees for IEEE SMC 2027",
  autoplayDuration = 4,
  initialGroupIndex = 0,
  showAllGroups = true,
}: CommitteesSectionProps) {
  const [activeGroupIndex, setActiveGroupIndex] = useState(initialGroupIndex);
  const [isPaused, setIsPaused] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null);

  const activeGroup =
    COMMITTEE_GROUPS[activeGroupIndex] || COMMITTEE_GROUPS[0];

  // Check scroll position for edge fade & navigation buttons
  const checkScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  }, []);

  const scrollByAmount = useCallback((amount: number) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.scrollBy({ left: amount, behavior: "smooth" });
  }, []);

  const scrollNext = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 20) {
      // Loop back to start smoothly
      el.scrollTo({ left: 0, behavior: "smooth" });
    } else {
      scrollByAmount(320);
    }
  }, [scrollByAmount]);

  const scrollPrev = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    if (el.scrollLeft <= 20) {
      el.scrollTo({ left: el.scrollWidth, behavior: "smooth" });
    } else {
      scrollByAmount(-320);
    }
  }, [scrollByAmount]);

  // Autoplay effect: advances carousel automatically every N seconds, pauses on hover
  useEffect(() => {
    if (isPaused) {
      if (autoplayTimerRef.current) clearInterval(autoplayTimerRef.current);
      return;
    }

    autoplayTimerRef.current = setInterval(() => {
      scrollNext();
    }, autoplayDuration * 1000);

    return () => {
      if (autoplayTimerRef.current) clearInterval(autoplayTimerRef.current);
    };
  }, [isPaused, autoplayDuration, scrollNext]);

  // Reset scroll position on active group change
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ left: 0, behavior: "smooth" });
    }
    checkScroll();
  }, [activeGroupIndex, checkScroll]);

  return (
    <SectionContainer id="committees" fullWidthBg="bg-white">
      {/* 1. Page / Section Header aligned with site frame */}
      <div className="relative overflow-hidden px-4 sm:px-6 pt-10 sm:pt-14 pb-6 w-full">
        <div className="corner-dot-tr opacity-70 pointer-events-none" />

        <div className="space-y-3 w-full relative z-10">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold uppercase tracking-tight leading-[1.15]">
            <span className="block text-[#004776]">{title}</span>
            <span className="block text-[#115eff]">& Leadership</span>
          </h1>

          <p className="text-base sm:text-lg text-[#004776]/80 font-medium max-w-3xl leading-relaxed">
            {subtitle}
          </p>
        </div>
      </div>

      {/* 2. Committee Category Tabs (Clean border style without dark premium) */}
      <div className="px-4 sm:px-6 py-3 border-y border-slate-200 bg-slate-50/60 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 min-w-max">
          {COMMITTEE_GROUPS.map((group, idx) => {
            const isActive = activeGroupIndex === idx;
            return (
              <button
                key={group.groupName}
                onClick={() => setActiveGroupIndex(idx)}
                className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-[0.26rem] transition-all cursor-pointer select-none ${
                  isActive
                    ? "bg-[#115eff] text-white shadow-xs"
                    : "bg-white hover:bg-slate-100 text-[#004776] border border-slate-200"
                }`}
              >
                <span>{group.groupName}</span>
                <span
                  className={`ml-2 px-1.5 py-0.5 rounded text-[11px] ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {group.members.length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. News-Group Style Header with Chevrons (Strictly Full Width Square between side borders) */}
      <div className="px-4 sm:px-6 pt-6 sm:pt-8">
        <div className="relative overflow-hidden flex items-center justify-between px-5 sm:px-7 py-4 sm:py-5 bg-[#115eff] text-white rounded-none shadow-xs border-x border-white">
          {/* Top-Right Rigid Grid Pattern */}
          <div
            className="pointer-events-none absolute inset-y-0 right-0 h-full w-56 sm:w-80 overflow-hidden select-none"
            style={{
              maskImage:
                "radial-gradient(ellipse at top right, white 45%, transparent 85%)",
              WebkitMaskImage:
                "radial-gradient(ellipse at top right, white 45%, transparent 85%)",
            }}
          >
            <div className="corner-grid-tr opacity-60 w-full h-full" />
          </div>

          {/* Group Title */}
          <div className="relative z-10 flex items-center gap-3 min-w-0 pr-4">
            <Shield className="w-5 h-5 text-white/90 shrink-0" />
            <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-white truncate drop-shadow-2xs">
              {activeGroup.groupName}
            </h2>
            <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-white/20 text-white border border-white/30 backdrop-blur-xs">
              {activeGroup.members.length} Members
            </span>
          </div>

          {/* Chevron Navigation Controls on Header */}
          <div className="relative z-10 flex items-center gap-2 shrink-0">
            {/* Auto-play toggle button */}
            <button
              onClick={() => setIsPaused((p) => !p)}
              className="p-2 rounded-full border border-white/25 bg-white/15 hover:bg-white/25 text-white transition-all cursor-pointer text-xs flex items-center gap-1.5"
              title={isPaused ? "Resume Autoplay" : "Pause Autoplay"}
              aria-label="Toggle autoplay"
            >
              {isPaused ? (
                <Play className="w-3.5 h-3.5 fill-white" />
              ) : (
                <Pause className="w-3.5 h-3.5" />
              )}
              <span className="hidden md:inline text-[11px] font-semibold">
                {isPaused ? "Play" : "Auto"}
              </span>
            </button>

            {/* Left Chevron */}
            <button
              onClick={scrollPrev}
              className="p-2 sm:p-2.5 rounded-full border border-white/25 bg-white/20 hover:bg-white/35 backdrop-blur-xs text-white transition-all cursor-pointer shadow-xs active:scale-95"
              title="Previous"
              aria-label="Previous members"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Right Chevron */}
            <button
              onClick={scrollNext}
              className="p-2 sm:p-2.5 rounded-full border border-white/25 bg-white/20 hover:bg-white/35 backdrop-blur-xs text-white transition-all cursor-pointer shadow-xs active:scale-95"
              title="Next"
              aria-label="Next members"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* 4. Carousel with Members Starting from Left + Progressive Edge Blur */}
        <div
          className="relative w-full py-6"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Progressive Blur / Gradient Fade on Left Edge */}
          <div
            className={`pointer-events-none absolute inset-y-6 left-0 z-20 w-12 sm:w-16 bg-gradient-to-r from-white via-white/80 to-transparent transition-opacity duration-300 ${
              canScrollLeft ? "opacity-100" : "opacity-0"
            }`}
          />

          {/* Progressive Blur / Gradient Fade on Right Edge */}
          <div
            className={`pointer-events-none absolute inset-y-6 right-0 z-20 w-12 sm:w-16 bg-gradient-to-l from-white via-white/80 to-transparent transition-opacity duration-300 ${
              canScrollRight ? "opacity-100" : "opacity-0"
            }`}
          />

          {/* Scroll Container */}
          <div
            ref={scrollContainerRef}
            onScroll={checkScroll}
            className="flex items-stretch gap-5 overflow-x-auto scroll-smooth no-scrollbar py-2 px-1"
            style={{
              scrollSnapType: "x mandatory",
            }}
          >
            {activeGroup.members.map((member, index) => {
              const photo = CHAIR_PHOTO_MAP[member.name];
              return (
                <div
                  key={`${member.name}-${index}`}
                  className="w-[280px] sm:w-[320px] shrink-0 group relative flex flex-col"
                  style={{ scrollSnapAlign: "start" }}
                >
                  {/* The Card Box - Clean overflow-hidden container */}
                  <div className="relative rounded-2xl bg-white border border-slate-200 group-hover:border-[#115eff] transition-all duration-300 flex flex-col flex-1 overflow-hidden shadow-2xs hover:shadow-md">
                    {/* Top: Image Canvas with Slate/White Background (Hover: Solid Primary Blue #115eff) */}
                    <div className="relative w-full h-64 sm:h-72 bg-slate-50/70 group-hover:bg-[#115eff] transition-colors duration-300 overflow-hidden flex items-end justify-center pt-4 px-2">
                      {/* Clipped background elements (dots only) behind the cutout */}
                      <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        {/* Blue Dot Pattern */}
                        <div
                          className="absolute inset-0 bg-dot-pattern opacity-50 group-hover:opacity-0 transition-opacity duration-300 pointer-events-none"
                          style={{
                            maskImage:
                              "linear-gradient(to bottom right, transparent 25%, black 75%)",
                            WebkitMaskImage:
                              "linear-gradient(to bottom right, transparent 25%, black 75%)",
                          }}
                        />

                        {/* Crisp White Dot Pattern in hover (blue) state */}
                        <div
                          className="absolute inset-0 bg-dot-pattern-white opacity-0 group-hover:opacity-45 transition-opacity duration-300 pointer-events-none"
                          style={{
                            maskImage:
                              "linear-gradient(to bottom right, transparent 25%, black 75%)",
                            WebkitMaskImage:
                              "linear-gradient(to bottom right, transparent 25%, black 75%)",
                          }}
                        />
                      </div>

                      {/* Role Badge pinned at top-left */}
                      <div className="absolute top-3 left-3 z-20">
                        <span className="inline-block px-2.5 py-0.5 rounded bg-blue-50 text-[#115eff] border border-blue-200 group-hover:bg-white group-hover:text-[#115eff] group-hover:border-white text-[11px] font-bold uppercase tracking-wider shadow-xs transition-colors duration-300">
                          {member.role}
                        </span>
                      </div>

                      {/* Country Badge at top-right */}
                      <div className="absolute top-3 right-3 z-20">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/90 backdrop-blur-xs border border-slate-200 text-[11px] font-semibold text-slate-700 shadow-2xs group-hover:bg-white group-hover:text-[#115eff] group-hover:border-transparent transition-colors duration-300">
                          <Globe className="w-3 h-3 text-[#115eff]" />
                          <span>{member.country}</span>
                        </span>
                      </div>

                      {/* Image strictly scaled and fitted inside the container */}
                      <div className="relative w-full h-full flex items-end justify-center z-10">
                        {photo ? (
                          <Image
                            src={photo}
                            alt={member.name}
                            width={360}
                            height={440}
                            className="h-full w-auto max-h-full max-w-full object-contain object-bottom transition-transform duration-300 ease-out group-hover:scale-105"
                            sizes="320px"
                          />
                        ) : (
                          <div className="w-24 h-24 mb-6 rounded-full bg-white border border-blue-200 flex items-center justify-center text-[#115eff] font-bold text-2xl shadow-inner group-hover:scale-105 transition-transform">
                            {member.name
                              .split(" ")
                              .map((n) => n[0])
                              .filter(Boolean)
                              .slice(-2)
                              .join("")}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Details Section */}
                    <div className="relative z-20 w-full p-5 bg-white group-hover:bg-[#115eff] border-t border-slate-200 group-hover:border-white/20 transition-colors duration-300 flex flex-col justify-between flex-1">
                      <div className="relative z-10">
                        <h4 className="text-base sm:text-lg font-bold text-[#004776] group-hover:!text-white tracking-tight leading-snug transition-colors duration-300">
                          {member.name}
                        </h4>
                        <p className="text-xs text-[#004776]/70 group-hover:!text-white/90 mt-1.5 font-medium leading-relaxed transition-colors duration-300">
                          {member.affiliation}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 group-hover:border-white/20 flex items-center justify-between text-xs text-slate-500 group-hover:text-white/80 transition-colors duration-300">
                        <span className="font-semibold text-slate-600 group-hover:text-white">
                          {member.country}
                        </span>
                        <span className="text-[#115eff] group-hover:text-white font-bold flex items-center gap-1">
                          <span>Delegate</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 5. Full Committee Directory Overview Table */}
      {showAllGroups && (
        <div className="px-4 sm:px-6 py-10 border-t border-slate-200 mt-6">
          <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#004776]">
                Complete Committee Roster
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Directory of all organizing committees and chairs
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-3 py-1 bg-blue-50 text-[#115eff] border border-blue-200 rounded">
                {COMMITTEE_GROUPS.reduce(
                  (acc, g) => acc + g.members.length,
                  0
                )}{" "}
                Total Leaders
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {COMMITTEE_GROUPS.map((group) => (
              <div
                key={group.groupName}
                className="p-5 bg-slate-50/70 border border-slate-200 rounded-lg flex flex-col justify-between"
              >
                <div>
                  <h4 className="text-base font-bold text-[#004776] border-b border-slate-200 pb-2 mb-3 flex items-center justify-between">
                    <span>{group.groupName}</span>
                    <span className="text-xs font-semibold text-slate-500">
                      ({group.members.length})
                    </span>
                  </h4>
                  <ul className="space-y-2 text-xs sm:text-sm">
                    {group.members.map((m, idx) => (
                      <li
                        key={idx}
                        className="flex items-center justify-between text-slate-700"
                      >
                        <span className="font-semibold text-[#004776]">
                          {m.name}
                        </span>
                        <span className="text-slate-500 text-xs">
                          {m.country}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </SectionContainer>
  );
}

export default CommitteesSection;
