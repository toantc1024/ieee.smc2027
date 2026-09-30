"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import Image from "next/image";
import { SectionContainer } from "@/components/layout/SectionContainer";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  useCarousel,
} from "@/components/ui/carousel";
import { CarouselNavButton } from "@/components/ui/CarouselNavButton";
import { COMMITTEE_GROUPS, type CommitteeMember } from "@/data/conference";
import { cn } from "@/lib/utils";

// High-resolution chair portraits mapping (normalized to 900x1200 3:4 canvas)
const CHAIR_PHOTO_MAP: Record<string, string> = {
  // Honorary Chairs
  "Hieu-Giang Le": "/chairs/prof-hieu-giang-le.webp",
  "Saeid Nahavandi": "/chairs/prof-saeid-nahavandi.webp",
  // Steering Committee
  "Sam Kwong": "/chairs/steering/sam-kwong.webp",
  "Imre Rudas": "/chairs/steering/imre-rudas.webp",
  "Adrian Stoica": "/chairs/steering/adrian-stoica.webp",
  "Ljiljana Trajkovic": "/chairs/steering/ljiljana-trajkovic.webp",
  "Eddie Tunstel": "/chairs/steering/eddie-tunstel.webp",
  // General Chairs & Co-Chairs
  "Dinh-Thanh Chau": "/chairs/prof-dinh-thanh-chau.webp",
  "Yo-Ping Huang": "/chairs/prof-yo-ping-huang.webp",
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

// Standardized responsive card dimensions shared across both carousel and non-carousel views
const CARD_DIMENSION_CLASSES =
  "w-[150px] sm:w-[180px] md:w-[200px] lg:w-[215px] xl:w-[225px] shrink-0 flex h-full";

/**
 * Single Committee Member Card
 */
function CommitteeCard({ member }: { member: CommitteeMember }) {
  const photo = CHAIR_PHOTO_MAP[member.name];
  const [imgError, setImgError] = useState(false);

  return (
    <div className="group/card relative flex flex-col w-full h-full select-none">
      {/* The Card Box */}
      <div className="relative rounded-2xl bg-white border border-slate-200 group-hover/card:border-[#115eff] transition-all duration-300 flex flex-col flex-1 overflow-hidden shadow-2xs hover:shadow-md h-full">
        {/* Top: Image Canvas with Slate/White Background (Hover: Solid Primary Blue #115eff) */}
        <div className="relative w-full aspect-[3/4] bg-slate-50/70 group-hover/card:bg-[#115eff] transition-colors duration-300 overflow-hidden flex items-end justify-center shrink-0 p-0">
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

          {/* Image strictly scaled, full width & anchored to bottom, with error fallback */}
          <div className="relative w-full h-full flex items-end justify-center z-10 p-0">
            {photo && !imgError ? (
              <Image
                src={photo}
                alt={member.name}
                fill
                className="object-cover object-bottom transition-transform duration-300 ease-out group-hover/card:scale-105"
                sizes="(max-width: 640px) 150px, (max-width: 768px) 180px, (max-width: 1024px) 200px, 225px"
                onError={() => setImgError(true)}
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

        {/* Bottom Details Section: Consistent vertical height across all cards */}
        <div className="relative z-20 w-full p-2.5 sm:p-3 md:p-3.5 bg-white group-hover/card:bg-[#115eff] border-t border-slate-200 group-hover/card:border-white/20 transition-colors duration-300 flex flex-col justify-between flex-1 min-h-[105px] sm:min-h-[115px] md:min-h-[120px]">
          <div className="relative z-10">
            <span className="inline-block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#115eff] group-hover/card:!text-white transition-colors duration-300 mb-1 line-clamp-1">
              {member.role}
            </span>
            <h4 className="text-xs sm:text-sm md:text-base font-bold text-[#004776] group-hover/card:!text-white tracking-tight leading-snug transition-colors duration-300 line-clamp-1">
              {member.name}
            </h4>
            <p className="text-[11px] sm:text-xs text-slate-500 group-hover/card:!text-white/80 mt-0.5 font-normal leading-snug transition-colors duration-300 line-clamp-1">
              {member.affiliation || "\u00A0"}
            </p>
          </div>

          <div className="mt-2 sm:mt-2.5 pt-2 border-t border-slate-100 group-hover/card:border-white/20 flex items-center justify-between text-[10px] sm:text-xs text-slate-500 group-hover/card:text-white/80 transition-colors duration-300 gap-1">
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
}

/**
 * Chevron Navigation & Natural Fade Blur Controls
 * - Fade blur is visible ONLY on hover when overflow exists
 * - Chevrons slide in on hover and sit over the fade zone
 */
function CommitteeCarouselControls({
  isHovered,
  groupName,
}: {
  isHovered: boolean;
  groupName: string;
}) {
  const { scrollPrev, scrollNext, canScrollPrev, canScrollNext } = useCarousel();

  return (
    <>
      {/* Left Progressive Gradient Fade & Backdrop Blur Overlay — ONLY ON HOVER */}
      <div
        className={cn(
          "pointer-events-none absolute inset-y-0 left-0 z-10 w-12 sm:w-20 lg:w-28 transition-opacity duration-300 select-none",
          isHovered && canScrollPrev ? "opacity-100" : "opacity-0"
        )}
      >
        {/* Natural gradient fade to white */}
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent" />
        {/* Frosted progressive blur with linear gradient mask */}
        <div
          aria-hidden="true"
          className="absolute inset-0 backdrop-blur-[3px]"
          style={{
            maskImage: "linear-gradient(to right, black 0%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to right, black 0%, transparent 100%)",
          }}
        />
      </div>

      {/* Left Chevron Button: Slides in on hover, floats cleanly above the fade */}
      <div
        className={cn(
          "pointer-events-none absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 transition-all duration-300",
          isHovered && canScrollPrev
            ? "pointer-events-auto translate-x-0 opacity-100"
            : "-translate-x-4 opacity-0"
        )}
      >
        <CarouselNavButton
          direction="prev"
          onClick={scrollPrev}
          variant="light"
          size="md"
          className="shadow-md hover:shadow-xl"
          aria-label={`Scroll ${groupName} left`}
        />
      </div>

      {/* Right Progressive Gradient Fade & Backdrop Blur Overlay — ONLY ON HOVER */}
      <div
        className={cn(
          "pointer-events-none absolute inset-y-0 right-0 z-10 w-12 sm:w-20 lg:w-28 transition-opacity duration-300 select-none",
          isHovered && canScrollNext ? "opacity-100" : "opacity-0"
        )}
      >
        {/* Natural gradient fade to white */}
        <div className="absolute inset-0 bg-gradient-to-l from-white via-white/80 to-transparent" />
        {/* Frosted progressive blur with linear gradient mask */}
        <div
          aria-hidden="true"
          className="absolute inset-0 backdrop-blur-[3px]"
          style={{
            maskImage: "linear-gradient(to left, black 0%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to left, black 0%, transparent 100%)",
          }}
        />
      </div>

      {/* Right Chevron Button: Slides in on hover, floats cleanly above the fade */}
      <div
        className={cn(
          "pointer-events-none absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 transition-all duration-300",
          isHovered && canScrollNext
            ? "pointer-events-auto translate-x-0 opacity-100"
            : "translate-x-4 opacity-0"
        )}
      >
        <CarouselNavButton
          direction="next"
          onClick={scrollNext}
          variant="light"
          size="md"
          className="shadow-md hover:shadow-xl"
          aria-label={`Scroll ${groupName} right`}
        />
      </div>
    </>
  );
}

/**
 * Single Committee Group Row
 * - If items do not overflow: Centered, exact same card size, no chevrons, no fade blur
 * - If items overflow: Carousel with exact same card size, no duplicates, loop: false
 * - Chevrons & natural HCMUTE fade blur visible ONLY on hover when scrolling is available
 */
function CommitteeGroupCarousel({
  group,
}: {
  group: (typeof COMMITTEE_GROUPS)[number];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);

  // Dynamically check if items overflow container width based on screen width and card width
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const checkOverflow = () => {
      const w = window.innerWidth;
      const cardWidth = w < 640 ? 150 : w < 768 ? 180 : w < 1024 ? 200 : w < 1280 ? 215 : 225;
      const gap = w < 640 ? 12 : 16;
      const totalRequiredWidth =
        group.members.length * cardWidth + (group.members.length - 1) * gap;
      setIsOverflowing(totalRequiredWidth > el.clientWidth);
    };

    checkOverflow();
    const ro = new ResizeObserver(checkOverflow);
    ro.observe(el);
    window.addEventListener("resize", checkOverflow);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", checkOverflow);
    };
  }, [group.members.length]);

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

      {/* Row Container */}
      <div ref={containerRef} className="relative w-full">
        {!isOverflowing ? (
          /* Non-overflowing items: Centered, exact same card size, no chevrons, no fade blur */
          <div className="flex flex-wrap sm:flex-nowrap justify-center items-stretch gap-3 sm:gap-4 py-2">
            {group.members.map((member, idx) => (
              <div
                key={`${member.name}-${idx}`}
                className={CARD_DIMENSION_CLASSES}
              >
                <CommitteeCard member={member} />
              </div>
            ))}
          </div>
        ) : (
          /* Overflowing items: Carousel with exact same card size, NO duplicates, loop: false */
          <div
            className="group/carousel relative -mx-4 sm:-mx-6 px-4 sm:px-6"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <Carousel
              opts={{
                align: "start",
                loop: false,
                dragFree: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-3 sm:-ml-4 py-2 items-stretch">
                {group.members.map((member, idx) => (
                  <CarouselItem
                    key={`${member.name}-${idx}`}
                    className="pl-3 sm:pl-4 flex shrink-0"
                  >
                    <div className={CARD_DIMENSION_CLASSES}>
                      <CommitteeCard member={member} />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CommitteeCarouselControls
                isHovered={isHovered}
                groupName={group.groupName}
              />
            </Carousel>
          </div>
        )}
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

      {/* 2. All Groups Displayed - Centered if no overflow, Circular Carousel on overflow with hover-only fade blur */}
      <div className="px-4 sm:px-6 py-10 sm:py-14 space-y-12 sm:space-y-16">
        {COMMITTEE_GROUPS.map((group) => (
          <CommitteeGroupCarousel key={group.groupName} group={group} />
        ))}
      </div>
    </SectionContainer>
  );
}

export default CommitteesSection;
