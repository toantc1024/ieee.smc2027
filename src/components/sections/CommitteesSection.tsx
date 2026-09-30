"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { COMMITTEE_GROUPS, type CommitteeMember } from "@/data/conference";
import { cn } from "@/lib/utils";

// High-resolution chair portraits mapping (all normalized to 900x1200 3:4 transparent canvas)
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

/**
 * Single Committee Group Row Carousel
 * - Arranged in one horizontal line
 * - Centered if items do not overflow
 * - Mobile displays 2-3 cards in viewport
 * - Shows rounded, prominent chevrons on hover when overflowing
 */
function CommitteeGroupCarousel({
  group,
}: {
  group: (typeof COMMITTEE_GROUPS)[number];
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(() => group.members.length > 4);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(() => group.members.length > 4);

  // Pointer drag support for mouse/touchpad users
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragScrollLeft = useRef(0);
  const hasDragged = useRef(false);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const hasOverflow = el.scrollWidth > el.clientWidth + 4;
    setIsOverflowing(hasOverflow);
    setCanScrollLeft(hasOverflow && el.scrollLeft > 6);
    setCanScrollRight(hasOverflow && el.scrollLeft < el.scrollWidth - el.clientWidth - 6);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    updateScrollState();

    const ro = new ResizeObserver(() => {
      updateScrollState();
    });
    ro.observe(el);

    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      ro.disconnect();
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState]);

  const scroll = (direction: "prev" | "next") => {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.querySelector("[data-committee-card]");
    const cardWidth = card ? (card as HTMLElement).offsetWidth : 180;
    const gap = 12;
    // Step by approx. 2 cards on mobile or 65% of viewport width on desktop
    const step = Math.max(cardWidth + gap, Math.floor(el.clientWidth * 0.65));

    el.scrollBy({
      left: direction === "next" ? step : -step,
      behavior: "smooth",
    });

    setTimeout(updateScrollState, 150);
    setTimeout(updateScrollState, 400);
  };

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.pointerType === "touch" || e.button !== 0) return;
    const el = scrollRef.current;
    if (!el) return;
    isDragging.current = true;
    hasDragged.current = false;
    dragStartX.current = e.clientX;
    dragScrollLeft.current = el.scrollLeft;
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const el = scrollRef.current;
    if (!el) return;
    const deltaX = e.clientX - dragStartX.current;
    if (Math.abs(deltaX) > 6) {
      hasDragged.current = true;
      el.scrollLeft = dragScrollLeft.current - deltaX;
    }
  }, []);

  const onPointerUp = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (hasDragged.current) {
      setTimeout(() => {
        hasDragged.current = false;
      }, 50);
    }
  }, []);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Group Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b-2 border-[#115eff]/20 gap-2">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 bg-[#115eff] rounded-full shrink-0" />
          <h2 className="text-xl sm:text-2xl font-bold text-[#004776] tracking-tight">
            {group.groupName}
          </h2>
        </div>
        <span className="text-xs sm:text-sm font-semibold text-slate-500 pl-4 sm:pl-0">
          {group.members.length} {group.members.length === 1 ? "Member" : "Members"}
        </span>
      </div>

      {/* Carousel Track & Controls Container */}
      <div className="group/carousel relative -mx-4 sm:-mx-6 px-4 sm:px-6">
        {/* Left Progressive Gradient Fade */}
        <div
          className={cn(
            "pointer-events-none absolute inset-y-0 left-4 sm:left-6 z-20 w-10 sm:w-16 bg-gradient-to-r from-white via-white/80 to-transparent transition-opacity duration-300",
            isOverflowing && canScrollLeft ? "opacity-100" : "opacity-0"
          )}
        />

        {/* Left Chevron Button: Rounded-full, Prominent, Revealed on Hover */}
        <div
          className={cn(
            "absolute left-4 sm:left-7 top-1/2 -translate-y-1/2 z-30 transition-all duration-300",
            isOverflowing && canScrollLeft
              ? "opacity-100 sm:opacity-0 sm:group-hover/carousel:opacity-100 pointer-events-auto scale-100"
              : "opacity-0 pointer-events-none scale-90"
          )}
        >
          <button
            type="button"
            onClick={() => scroll("prev")}
            className="group/btn size-12 sm:size-13 rounded-full bg-white/95 hover:bg-[#115eff] text-[#004776] hover:text-white border border-slate-200/90 hover:border-[#115eff] shadow-lg hover:shadow-xl hover:shadow-[#115eff]/25 backdrop-blur-md flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
            aria-label={`Scroll ${group.groupName} left`}
          >
            <ChevronLeft
              className="size-6 sm:size-7 transition-transform duration-200 group-hover/btn:-translate-x-0.5"
              strokeWidth={2.5}
            />
          </button>
        </div>

        {/* Right Progressive Gradient Fade */}
        <div
          className={cn(
            "pointer-events-none absolute inset-y-0 right-4 sm:right-6 z-20 w-10 sm:w-16 bg-gradient-to-l from-white via-white/80 to-transparent transition-opacity duration-300",
            isOverflowing && canScrollRight ? "opacity-100" : "opacity-0"
          )}
        />

        {/* Right Chevron Button: Rounded-full, Prominent, Revealed on Hover */}
        <div
          className={cn(
            "absolute right-4 sm:right-7 top-1/2 -translate-y-1/2 z-30 transition-all duration-300",
            isOverflowing && canScrollRight
              ? "opacity-100 sm:opacity-0 sm:group-hover/carousel:opacity-100 pointer-events-auto scale-100"
              : "opacity-0 pointer-events-none scale-90"
          )}
        >
          <button
            type="button"
            onClick={() => scroll("next")}
            className="group/btn size-12 sm:size-13 rounded-full bg-white/95 hover:bg-[#115eff] text-[#004776] hover:text-white border border-slate-200/90 hover:border-[#115eff] shadow-lg hover:shadow-xl hover:shadow-[#115eff]/25 backdrop-blur-md flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
            aria-label={`Scroll ${group.groupName} right`}
          >
            <ChevronRight
              className="size-6 sm:size-7 transition-transform duration-200 group-hover/btn:translate-x-0.5"
              strokeWidth={2.5}
            />
          </button>
        </div>

        {/* Scrollable Single Horizontal Line Track */}
        <div
          ref={scrollRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          onPointerCancel={onPointerUp}
          className={cn(
            "overflow-x-auto scrollbar-none py-3 touch-pan-x select-none",
            isOverflowing ? "cursor-grab active:cursor-grabbing" : "cursor-default"
          )}
          style={{ scrollBehavior: isDragging.current ? "auto" : "smooth" }}
        >
          <div
            className={cn(
              "flex items-stretch gap-3 sm:gap-4 md:gap-5 py-1",
              isOverflowing ? "w-max justify-start px-1" : "w-full justify-center px-1"
            )}
          >
            {group.members.map((member, idx) => {
              const photo = CHAIR_PHOTO_MAP[member.name];
              return (
                <div
                  key={`${member.name}-${idx}`}
                  data-committee-card
                  className="group/card relative flex flex-col w-[132px] sm:w-[175px] md:w-[205px] lg:w-[230px] shrink-0"
                >
                  {/* The Card Box */}
                  <div className="relative rounded-2xl bg-white border border-slate-200 group-hover/card:border-[#115eff] transition-all duration-300 flex flex-col flex-1 overflow-hidden shadow-2xs hover:shadow-md h-full">
                    {/* Top: Image Canvas with Slate/White Background (Hover: Solid Primary Blue #115eff) */}
                    <div className="relative w-full aspect-[3/4] bg-slate-50/70 group-hover/card:bg-[#115eff] transition-colors duration-300 overflow-hidden flex items-end justify-center shrink-0">
                      {/* Clipped background elements (dots only) behind the cutout */}
                      <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        {/* Blue Dot Pattern */}
                        <div
                          className="absolute inset-0 bg-dot-pattern opacity-50 group-hover/card:opacity-0 transition-opacity duration-300 pointer-events-none"
                          style={{
                            maskImage:
                              "linear-gradient(to bottom right, transparent 25%, black 75%)",
                            WebkitMaskImage:
                              "linear-gradient(to bottom right, transparent 25%, black 75%)",
                          }}
                        />

                        {/* Crisp White Dot Pattern in hover (blue) state */}
                        <div
                          className="absolute inset-0 bg-dot-pattern-white opacity-0 group-hover/card:opacity-45 transition-opacity duration-300 pointer-events-none"
                          style={{
                            maskImage:
                              "linear-gradient(to bottom right, transparent 25%, black 75%)",
                            WebkitMaskImage:
                              "linear-gradient(to bottom right, transparent 25%, black 75%)",
                          }}
                        />
                      </div>

                      {/* Image strictly scaled and fitted inside the container */}
                      <div className="relative w-full h-full flex items-end justify-center z-10">
                        {photo ? (
                          <Image
                            src={photo}
                            alt={member.name}
                            fill
                            className="object-contain object-bottom transition-transform duration-300 ease-out group-hover/card:scale-105"
                            sizes="(max-width: 640px) 132px, (max-width: 768px) 175px, (max-width: 1024px) 205px, 230px"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center p-3 sm:p-5">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-white/90 border border-blue-200/80 group-hover/card:border-white/40 flex items-center justify-center text-[#115eff] group-hover/card:text-white group-hover/card:bg-white/20 font-bold text-sm sm:text-lg md:text-2xl shadow-xs transition-all duration-300">
                              {member.name
                                .split(" ")
                                .map((n) => n[0])
                                .filter(Boolean)
                                .slice(-2)
                                .join("")}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Details Section */}
                    <div className="relative z-20 w-full p-2.5 sm:p-4 md:p-5 bg-white group-hover/card:bg-[#115eff] border-t border-slate-200 group-hover/card:border-white/20 transition-colors duration-300 flex flex-col justify-between flex-1 min-h-[92px] sm:min-h-[110px]">
                      <div className="relative z-10">
                        <span className="inline-block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#115eff] group-hover/card:!text-white transition-colors duration-300 mb-1 sm:mb-1.5 line-clamp-1">
                          {member.role}
                        </span>
                        <h4 className="text-xs sm:text-sm md:text-base font-bold text-[#004776] group-hover/card:!text-white tracking-tight leading-snug transition-colors duration-300 line-clamp-2">
                          {member.name}
                        </h4>
                        {member.affiliation && (
                          <p className="text-[11px] sm:text-xs text-slate-500 group-hover/card:!text-white/80 mt-1 font-normal leading-snug transition-colors duration-300 line-clamp-2">
                            {member.affiliation}
                          </p>
                        )}
                      </div>

                      <div className="mt-2.5 sm:mt-3 pt-2 sm:pt-2.5 border-t border-slate-100 group-hover/card:border-white/20 flex items-center justify-between text-[10px] sm:text-xs text-slate-500 group-hover/card:text-white/80 transition-colors duration-300 gap-1">
                        <span className="font-semibold text-slate-700 group-hover/card:text-white truncate">
                          {member.country}
                        </span>
                        <span className="text-[#004776] group-hover/card:text-white/80 text-[10px] font-semibold shrink-0">
                          IEEE SMC
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
    </div>
  );
}

export function CommitteesSection({
  title = "Organizing Committee",
  subtitle = "International Steering & Organizing Committees for IEEE SMC 2027 in Ho Chi Minh City, Vietnam",
}: CommitteesSectionProps) {
  return (
    <SectionContainer id="committees" fullWidthBg="bg-white">
      {/* 1. Page / Section Header */}
      <div className="relative overflow-hidden px-4 sm:px-6 pt-10 sm:pt-14 pb-8 w-full border-b border-slate-200">
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

      {/* 2. All Groups Displayed in a Single Page - One Line Per Group with Centering & Carousel */}
      <div className="px-4 sm:px-6 py-10 sm:py-14 space-y-12 sm:space-y-16">
        {COMMITTEE_GROUPS.map((group) => (
          <CommitteeGroupCarousel key={group.groupName} group={group} />
        ))}
      </div>
    </SectionContainer>
  );
}

export default CommitteesSection;
