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
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";
import { cn } from "@/lib/utils";
import { subItemAttr, type SubItemPath } from "@/modules/website-builder/utils/sub-item-path";

// High-resolution chair portraits mapping (normalized to 900x1200 3:4 canvas)
export const CHAIR_PHOTO_MAP: Record<string, string> = {
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

// Abstract frosted-glass square fallback visuals (pink for female, blue for male)
export const CLAY_AVATARS = [
  "/assets/3d/abstract-glass-blue.svg",
  "/assets/3d/abstract-glass-pink.svg",
] as const;

const KNOWN_FEMALE_FULL_NAMES = new Set([
  "thi-hien truong",
  "pham-viet-anh-thu le",
  "phuong-thu-thuy phung",
  "thi-thanh-truc tran",
  "my-ha le",
  "ljiljana trajkovic",
  "mariagrazia dotoli",
  "yan wan",
]);

const FEMALE_HYPHENATED_GIVEN_NAMES = [
  "anh-thu",
  "thu-thuy",
  "thanh-truc",
  "my-ha",
  "thu-ha",
  "phuong-thao",
  "ngoc-lan",
  "kim-ngan",
  "bao-ngoc",
];

const UNAMBIGUOUS_FEMALE_TOKENS = new Set([
  "thi",
  "hien",
  "thuy",
  "truc",
  "linh",
  "trang",
  "huong",
  "vy",
  "nhi",
  "quynh",
  "oanh",
  "loan",
  "nga",
  "dung",
  "yen",
  "mai",
  "lan",
  "hoa",
  "bich",
  "alice",
  "mary",
  "sarah",
  "emily",
  "elena",
  "maria",
  "mariagrazia",
  "ljiljana",
  "anna",
  "julia",
  "sophia",
  "laura",
  "catherine",
  "jessica",
  "jennifer",
]);

function hashMemberSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Infer member gender from optional explicit field or normalized name tokens.
 */
export function inferMemberGender(
  name: string,
  explicitGender?: "male" | "female"
): "female" | "male" {
  if (explicitGender === "female" || explicitGender === "male") {
    return explicitGender;
  }

  const normalized = (name || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .trim();

  if (!normalized) return "male";
  if (KNOWN_FEMALE_FULL_NAMES.has(normalized)) return "female";
  if (FEMALE_HYPHENATED_GIVEN_NAMES.some((part) => normalized.includes(part))) {
    return "female";
  }

  const tokens = normalized.split(/[\s\-.,']+/).filter(Boolean);
  if (tokens.some((token) => UNAMBIGUOUS_FEMALE_TOKENS.has(token))) {
    return "female";
  }

  return "male";
}

/**
 * Return the themed abstract frosted-glass fallback vector asset for a member.
 */
export function getClayAvatarForMember(
  name: string,
  explicitGender?: "male" | "female"
): string {
  return inferMemberGender(name, explicitGender) === "female"
    ? "/assets/3d/abstract-glass-pink.svg"
    : "/assets/3d/abstract-glass-blue.svg";
}

export interface CommitteeMemberInput extends Omit<CommitteeMember, "gender"> {
  gender?: "male" | "female" | "auto";
  badgeLabel?: string;
}

export interface CommitteeGroupInput {
  groupName: string;
  members: CommitteeMemberInput[];
}

export interface CommitteesSectionProps {
  title?: string;
  titleAccent?: string;
  subtitle?: string;
  cardBadgeLabel?: string;
  autoplayDuration?: number;
  initialGroupIndex?: number;
  showAllGroups?: boolean;
  groups?: CommitteeGroupInput[];
}

// Responsive card widths (content box width)
const CARD_WIDTH_CLASSES =
  "w-[168px] sm:w-[190px] md:w-[210px] lg:w-[225px] xl:w-[240px]";

// Direct flex-basis for CarouselItem slides (matching CARD_WIDTH + CarouselItem pl-3/pl-4 gutter)
// pl-3 is 12px (mobile), pl-4 is 16px (sm and above)
const SLIDE_BASIS_CLASSES =
  "basis-[180px] sm:basis-[206px] md:basis-[226px] lg:basis-[241px] xl:basis-[256px]";

// Static card dimensions for non-overflowing views
const CARD_STATIC_CLASSES = cn(
  CARD_WIDTH_CLASSES,
  "shrink-0 flex h-full"
);

/**
 * Layered frosted-glass architectural squares fallback for committee members without photos
 */
function AbstractGlassSquareFallback({
  gender,
  seed,
}: {
  gender: "female" | "male";
  seed: string;
}) {
  const isPink = gender === "female";
  const mirrored = hashMemberSeed(seed) % 2 === 1;

  return (
    <div
      data-fallback-theme={isPink ? "pink" : "blue"}
      className="relative w-full h-full overflow-hidden pointer-events-none select-none"
    >
      {/* Layer 1: Top-transparent ambient fade dissolving cleanly on card hover */}
      <div
        className={cn(
          "absolute inset-0 bg-linear-to-b from-transparent via-transparent transition-opacity duration-300 group-hover/card:opacity-0",
          isPink ? "to-pink-100/60" : "to-blue-100/55"
        )}
      />

      {/* Layer 2a: Masked 18px dot matrix fading smoothly down from top */}
      <div
        className="absolute inset-0 opacity-100 group-hover/card:opacity-0 transition-opacity duration-300"
        style={{
          backgroundImage: isPink
            ? "radial-gradient(rgba(236, 72, 153, 0.44) 1.5px, transparent 1.5px)"
            : "radial-gradient(rgba(17, 94, 255, 0.42) 1.5px, transparent 1.5px)",
          backgroundSize: "18px 18px",
          maskImage:
            "linear-gradient(to bottom, transparent 18%, rgba(0,0,0,0.45) 52%, black 92%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 18%, rgba(0,0,0,0.45) 52%, black 92%)",
        }}
      />

      {/* Layer 2b: Crisp white dot matrix on hover with matching top-only fade mask */}
      <div
        className="absolute inset-0 bg-dot-pattern-white opacity-0 group-hover/card:opacity-45 transition-opacity duration-300"
        style={{
          maskImage:
            "linear-gradient(to bottom, transparent 18%, rgba(0,0,0,0.45) 52%, black 92%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 18%, rgba(0,0,0,0.45) 52%, black 92%)",
        }}
      />

      {/* Layer 2c: Lower ambient color glow refracted behind frosted glass squares */}
      <div
        className="absolute inset-0 opacity-100 group-hover/card:opacity-0 transition-opacity duration-300"
        style={{
          background: isPink
            ? "radial-gradient(circle at 65% 78%, rgba(236, 72, 153, 0.22), rgba(251, 113, 133, 0.08) 50%, transparent 75%)"
            : "radial-gradient(circle at 65% 78%, rgba(17, 94, 255, 0.20), rgba(56, 189, 248, 0.08) 50%, transparent 75%)",
        }}
      />

      {/* Layer 3a: Upper-back ghost glass square (top-faded) */}
      <div
        className={cn(
          "absolute top-[18%] w-[42%] aspect-square rounded-sm border bg-linear-to-b transition-all duration-300",
          mirrored ? "left-[13%]" : "right-[13%]",
          isPink
            ? "from-white/10 to-pink-400/22 border-pink-400/25"
            : "from-white/10 to-blue-400/20 border-blue-400/20",
          "group-hover/card:from-white/5 group-hover/card:to-white/18 group-hover/card:border-white/30"
        )}
        style={{
          maskImage: "linear-gradient(to bottom, transparent 8%, black 78%)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 8%, black 78%)",
        }}
      />

      {/* Layer 3b: Mid-depth tinted refraction square */}
      <div
        className={cn(
          "absolute top-[33%] w-[46%] aspect-square rounded-sm backdrop-blur-[3px] border bg-linear-to-br transition-all duration-300 group-hover/card:-translate-y-0.5",
          mirrored ? "right-[12%]" : "left-[12%]",
          isPink
            ? "from-pink-500/20 via-rose-300/14 to-white/30 border-pink-400/30"
            : "from-[#115eff]/18 via-sky-300/12 to-white/30 border-[#115eff]/25",
          "group-hover/card:from-white/22 group-hover/card:via-white/12 group-hover/card:to-white/5 group-hover/card:border-white/40"
        )}
      />

      {/* Layer 3c: Bottom-flush glass base shelf square */}
      <div className="absolute -bottom-[22%] left-1/2 -translate-x-1/2 w-[78%] aspect-square rounded-sm backdrop-blur-xs bg-linear-to-b from-white/35 to-white/65 border-t border-x border-white/85 group-hover/card:from-white/18 group-hover/card:to-white/8 group-hover/card:border-white/35 transition-all duration-300" />

      {/* Layer 3d: Foreground crystal frosted-glass square + nested geometric accent */}
      <div
        className={cn(
          "absolute bottom-[15%] left-1/2 -translate-x-1/2 w-[56%] aspect-square rounded-sm backdrop-blur-md bg-linear-to-b from-white/35 via-white/68 to-white/88 border border-white/95 transition-all duration-300 group-hover/card:-translate-y-1 group-hover/card:from-white/28 group-hover/card:via-white/20 group-hover/card:to-white/12 group-hover/card:border-white/55",
          isPink
            ? "shadow-[inset_0_1px_1px_rgba(255,255,255,0.95),0_10px_24px_-6px_rgba(236,72,153,0.20)]"
            : "shadow-[inset_0_1px_1px_rgba(255,255,255,0.95),0_10px_24px_-6px_rgba(17,94,255,0.18)]"
        )}
      >
        <div
          className={cn(
            "absolute inset-[20%] rounded-[2px] border bg-linear-to-br transition-colors duration-300",
            isPink
              ? "from-pink-500/14 to-rose-300/6 border-pink-400/25 group-hover/card:from-white/20 group-hover/card:to-white/5 group-hover/card:border-white/45"
              : "from-[#115eff]/14 to-sky-300/6 border-[#115eff]/22 group-hover/card:from-white/20 group-hover/card:to-white/5 group-hover/card:border-white/45"
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              "absolute top-0 left-0 size-1.5 border-t border-l transition-colors duration-300 group-hover/card:border-white/80",
              isPink ? "border-pink-500/55" : "border-[#115eff]/50"
            )}
          />
          <span
            aria-hidden="true"
            className={cn(
              "absolute top-0 right-0 size-1.5 border-t border-r transition-colors duration-300 group-hover/card:border-white/80",
              isPink ? "border-pink-500/55" : "border-[#115eff]/50"
            )}
          />
          <span
            aria-hidden="true"
            className={cn(
              "absolute bottom-0 left-0 size-1.5 border-b border-l transition-colors duration-300 group-hover/card:border-white/80",
              isPink ? "border-pink-500/55" : "border-[#115eff]/50"
            )}
          />
          <span
            aria-hidden="true"
            className={cn(
              "absolute bottom-0 right-0 size-1.5 border-b border-r transition-colors duration-300 group-hover/card:border-white/80",
              isPink ? "border-pink-500/55" : "border-[#115eff]/50"
            )}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Single Committee Member Card
 */
function CommitteeCard({
  member,
  subPath,
  cardBadgeLabel = "IEEE SMC 2027",
}: {
  member: CommitteeMemberInput;
  subPath?: SubItemPath;
  cardBadgeLabel?: string;
}) {
  if (!member) return null;
  const name = member.name?.trim() || "Committee Member";
  const resolvedBadge = member.badgeLabel?.trim() || cardBadgeLabel.trim();
  const photo =
    typeof member.photo === "string" && member.photo.trim().length > 0
      ? member.photo.trim()
      : CHAIR_PHOTO_MAP[name];
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [photo]);

  const hasPhoto = Boolean(photo && !imgError);
  const isFallback = !hasPhoto;
  const explicitGender =
    member.gender === "male" || member.gender === "female"
      ? member.gender
      : undefined;
  const gender = useMemo(
    () => inferMemberGender(name, explicitGender),
    [name, explicitGender]
  );
  const isPinkFallback = isFallback && gender === "female";

  return (
    <div
      {...(subPath ? subItemAttr(subPath) : {})}
      className="group/card relative flex flex-col w-full h-full select-none cursor-grab active:cursor-grabbing"
    >
      {/* The Card Box */}
      <div
        className={cn(
          "relative rounded-sm bg-white border transition-all duration-300 flex flex-col flex-1 overflow-hidden shadow-2xs hover:shadow-md h-full",
          isPinkFallback
            ? "border-pink-100/90 group-hover/card:border-pink-500"
            : "border-blue-100/90 group-hover/card:border-[#115eff]"
        )}
      >
        {/* Top: Portrait Canvas or Top-Transparent Abstract Frosted Glass Fallback */}
        <div
          className={cn(
            "relative w-full aspect-[3/4] transition-colors duration-300 overflow-hidden flex items-end justify-center shrink-0 p-0 pointer-events-none select-none",
            hasPhoto
              ? "bg-blue-50/35 group-hover/card:bg-[#115eff]"
              : isPinkFallback
                ? "bg-transparent group-hover/card:bg-pink-500"
                : "bg-transparent group-hover/card:bg-[#115eff]"
          )}
        >
          {/* Dot pattern overlay behind photo cutouts (top-only vertical fade) */}
          {hasPhoto && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div
                className="absolute inset-0 bg-dot-pattern opacity-50 group-hover/card:opacity-0 transition-opacity duration-300 pointer-events-none"
                style={{
                  maskImage:
                    "linear-gradient(to bottom, transparent 18%, rgba(0,0,0,0.45) 52%, black 92%)",
                  WebkitMaskImage:
                    "linear-gradient(to bottom, transparent 18%, rgba(0,0,0,0.45) 52%, black 92%)",
                }}
              />
              <div
                className="absolute inset-0 bg-dot-pattern-white opacity-0 group-hover/card:opacity-45 transition-opacity duration-300 pointer-events-none"
                style={{
                  maskImage:
                    "linear-gradient(to bottom, transparent 18%, rgba(0,0,0,0.45) 52%, black 92%)",
                  WebkitMaskImage:
                    "linear-gradient(to bottom, transparent 18%, rgba(0,0,0,0.45) 52%, black 92%)",
                }}
              />
            </div>
          )}

          {/* Photo cutout or layered frosted-glass square abstract fallback */}
          <div className="relative w-full h-full flex items-end justify-center z-10 p-0 pointer-events-none select-none">
            {hasPhoto ? (
              <Image
                src={photo}
                alt={name}
                fill
                unoptimized={/^(?:\/api\/|https?:\/\/|blob:|data:)/i.test(photo)}
                draggable={false}
                className="object-cover object-bottom scale-105 origin-bottom pointer-events-none select-none"
                sizes="(max-width: 640px) 150px, (max-width: 768px) 175px, (max-width: 1024px) 195px, (max-width: 1280px) 210px, 220px"
                onError={() => setImgError(true)}
              />
            ) : (
              <AbstractGlassSquareFallback gender={gender} seed={name} />
            )}
          </div>
        </div>

        {/* Bottom Details Section: Consistent vertical height across all cards */}
        <div
          className={cn(
            "relative z-20 w-full p-3 sm:p-3.5 md:p-4 bg-white border-t group-hover/card:border-white/20 transition-colors duration-300 flex flex-col justify-between flex-1 min-h-[112px] sm:min-h-[120px]",
            isPinkFallback
              ? "border-pink-100/85 group-hover/card:bg-pink-500"
              : "border-blue-100/85 group-hover/card:bg-[#115eff]"
          )}
        >
          <div className="relative z-10">
            <span
              className={cn(
                "inline-block text-xs font-bold group-hover/card:!text-white transition-colors duration-300 mb-1 line-clamp-1",
                isPinkFallback ? "text-pink-600" : "text-[#115eff]"
              )}
            >
              {member.role || "Committee Member"}
            </span>
            <h4 className="text-sm sm:text-[15px] font-bold text-[#004776] group-hover/card:!text-white tracking-tight leading-snug transition-colors duration-300 line-clamp-1">
              {name}
            </h4>
            <p className="text-xs text-slate-600 group-hover/card:!text-white/85 mt-0.5 font-normal leading-snug transition-colors duration-300 line-clamp-1">
              {member.affiliation || "\u00A0"}
            </p>
          </div>

          <div
            className={cn(
              "mt-2 sm:mt-2.5 pt-2 border-t group-hover/card:border-white/20 flex items-center justify-between text-xs text-slate-600 group-hover/card:text-white/85 transition-colors duration-300 gap-1",
              isPinkFallback ? "border-pink-50" : "border-blue-50"
            )}
          >
            <span className="font-semibold text-[#004776] group-hover/card:text-white truncate">
              {member.country || "Vietnam"}
            </span>
            {resolvedBadge && (
              <span className="text-[#004776]/75 group-hover/card:text-white/85 text-xs font-semibold shrink-0">
                {resolvedBadge}
              </span>
            )}
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
  hoveredSide,
  groupName,
}: {
  isHovered: boolean;
  hoveredSide: "left" | "right" | null;
  groupName: string;
}) {
  const { api, scrollPrev, scrollNext, canScrollPrev, canScrollNext } = useCarousel();

  // If no items overflow the viewport (only 1 scroll snap or API not ready), NEVER show chevrons or blur fades
  const hasOverflow = (api?.scrollSnapList().length ?? 0) > 1;
  if (!hasOverflow) return null;

  const showLeft = isHovered && canScrollPrev && (hoveredSide === "left" || hoveredSide === null);
  const showRight = isHovered && canScrollNext && (hoveredSide === "right" || hoveredSide === null);

  return (
    <>
      {/* Left Progressive Gradient Fade & Backdrop Blur Overlay — ONLY ON HOVER OF LEFT SIDE */}
      <div
        className={cn(
          "pointer-events-none absolute inset-y-0 left-0 z-10 w-12 sm:w-20 lg:w-28 transition-opacity duration-300 select-none",
          showLeft && hoveredSide === "left" ? "opacity-100" : "opacity-0"
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

      {/* Left Chevron Button: Slides in on hover of left side, floats cleanly above the fade */}
      <div
        className={cn(
          "pointer-events-none absolute left-2 sm:left-4 lg:left-6 top-1/2 -translate-y-1/2 z-20 transition-all duration-300",
          showLeft
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

      {/* Right Progressive Gradient Fade & Backdrop Blur Overlay — ONLY ON HOVER OF RIGHT SIDE */}
      <div
        className={cn(
          "pointer-events-none absolute inset-y-0 right-0 z-10 w-12 sm:w-20 lg:w-28 transition-opacity duration-300 select-none",
          showRight && hoveredSide === "right" ? "opacity-100" : "opacity-0"
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

      {/* Right Chevron Button: Slides in on hover of right side, floats cleanly above the fade */}
      <div
        className={cn(
          "pointer-events-none absolute right-2 sm:right-4 lg:right-6 top-1/2 -translate-y-1/2 z-20 transition-all duration-300",
          showRight
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
 * - If items overflow: Infinite circular carousel (loop: true) continuing seamlessly from last back to first as a circle
 * - Chevrons & single-side fade blur visible ONLY on hover of the respective side
 */
function CommitteeGroupCarousel({
  group,
  groupIndex,
  cardBadgeLabel,
}: {
  group: CommitteeGroupInput;
  groupIndex?: number;
  cardBadgeLabel?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredSide, setHoveredSide] = useState<"left" | "right" | null>(null);

  const members = useMemo(
    () => (Array.isArray(group?.members) ? group.members.filter(Boolean) : []),
    [group?.members]
  );
  const memberCount = members.length;

  // Default: groups with <= 5 members do not overflow on desktop (1280px site width)
  const [isOverflowing, setIsOverflowing] = useState(() => memberCount > 5);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || memberCount === 0) {
      setIsOverflowing(false);
      return;
    }

    const checkOverflow = () => {
      // Guard against measuring un-mounted or 0-width elements
      if (el.clientWidth === 0) return;

      const w = window.innerWidth;
      const cardWidth =
        w < 640 ? 168 : w < 768 ? 190 : w < 1024 ? 210 : w < 1280 ? 225 : 240;
      const gap = w < 640 ? 12 : 16;
      const totalRequiredWidth =
        memberCount * cardWidth + (memberCount - 1) * gap;

      // Only overflow if total required width is strictly greater than container width
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
  }, [memberCount]);

  // When overflowing, ensure Embla has enough slides so that canLoop() is always true,
  // enabling seamless, infinite circular scrolling from the last item back to the first.
  const carouselMembers = useMemo(() => {
    if (!isOverflowing || memberCount === 0) return members;
    if (memberCount < 12) {
      const repeat = Math.min(14, Math.ceil(14 / memberCount));
      return Array.from({ length: repeat }, () => members).flat();
    }
    return members;
  }, [members, isOverflowing, memberCount]);

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsHovered(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredSide(e.clientX - rect.left < rect.width / 2 ? "left" : "right");
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredSide(e.clientX - rect.left < rect.width / 2 ? "left" : "right");
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setHoveredSide(null);
  };

  const groupName = group?.groupName || "Committee Group";

  return (
    <div
      {...(groupIndex !== undefined ? subItemAttr(["groups", groupIndex]) : {})}
      className="space-y-4 sm:space-y-6"
    >
      {/* Group Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b-2 border-[#115eff]/20 gap-2">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 bg-[#115eff] rounded-xs shrink-0" />
          <h2 className="text-xl sm:text-2xl font-bold text-[#004776] tracking-tight">
            {groupName}
          </h2>
        </div>
        <span className="text-xs sm:text-sm font-semibold text-slate-500 pl-4 sm:pl-0">
          {memberCount} {memberCount === 1 ? "Member" : "Members"}
        </span>
      </div>

      {/* Row Container */}
      <div ref={containerRef} className="relative w-full">
        {memberCount === 0 ? (
          <div className="rounded-xl border border-dashed border-blue-200/80 bg-blue-50/35 p-6 sm:p-8 text-center">
            <p className="text-sm font-semibold text-slate-600">
              No committee members in &ldquo;{groupName}&rdquo; yet.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Add members using the right-side inspector panel.
            </p>
          </div>
        ) : !isOverflowing ? (
          /* Non-overflowing items: Centered, exact same card size, NO chevrons, NO fade blur */
          <div className="flex flex-wrap sm:flex-nowrap justify-center items-stretch gap-3 sm:gap-4 py-2">
            {members.map((member, idx) => (
              <div
                key={`${member.name || "member"}-${member.photo || ""}-${idx}`}
                className={CARD_STATIC_CLASSES}
              >
                <CommitteeCard
                  member={member}
                  cardBadgeLabel={cardBadgeLabel}
                  subPath={
                    groupIndex !== undefined
                      ? ["groups", groupIndex, "members", idx]
                      : undefined
                  }
                />
              </div>
            ))}
          </div>
        ) : (
          /* Overflowing items: Infinite Circular Carousel (loop: true) with hover-only fade blur & chevrons */
          <div
            className="group/carousel relative -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8"
            onMouseEnter={handleMouseEnter}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              plugins={[WheelGesturesPlugin()]}
              className="w-full"
            >
              <CarouselContent className="py-2 items-stretch cursor-grab active:cursor-grabbing">
                {carouselMembers.map((member, idx) => (
                  <CarouselItem
                    key={`${member.name || "member"}-${member.photo || ""}-${idx}`}
                    className={cn(SLIDE_BASIS_CLASSES, "shrink-0 flex")}
                  >
                    <div className="w-full h-full flex">
                      <CommitteeCard
                        member={member}
                        cardBadgeLabel={cardBadgeLabel}
                        subPath={
                          groupIndex !== undefined && memberCount > 0
                            ? ["groups", groupIndex, "members", idx % memberCount]
                            : undefined
                        }
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CommitteeCarouselControls
                isHovered={isHovered}
                hoveredSide={hoveredSide}
                groupName={groupName}
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
  titleAccent,
  subtitle = "International Steering & Organizing Committees for IEEE SMC 2027 in Ho Chi Minh City, Vietnam",
  cardBadgeLabel = "IEEE SMC 2027",
  groups,
}: CommitteesSectionProps) {
  const safeGroups =
    groups === undefined
      ? COMMITTEE_GROUPS
      : Array.isArray(groups)
        ? groups.filter(Boolean)
        : [];

  return (
    <SectionContainer id="committees" fullWidthBg="bg-white">
      {/* 1. Page / Section Header */}
      <div className="relative overflow-hidden px-4 sm:px-6 pt-10 sm:pt-14 pb-8 w-full border-b border-blue-100/85">
        <div className="corner-dot-tr opacity-70 pointer-events-none" />

        <div className="space-y-3 w-full relative z-10">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight leading-[1.2]">
            {titleAccent ? (
              <>
                <span className="block text-[#004776]">{title}</span>
                <span className="block text-[#115eff]">{titleAccent}</span>
              </>
            ) : title.includes("&") ? (
              <>
                <span className="block text-[#004776]">
                  {title.split("&")[0].trim()}
                </span>
                <span className="block text-[#115eff]">
                  &amp; {title.split("&").slice(1).join("&").trim()}
                </span>
              </>
            ) : (
              <>
                <span className="block text-[#004776]">{title}</span>
                <span className="block text-[#115eff]">&amp; Leadership</span>
              </>
            )}
          </h1>

          <p className="text-sm sm:text-base lg:text-[17px] text-[#004776]/80 font-medium max-w-3xl leading-relaxed">
            {subtitle}
          </p>
        </div>
      </div>

      {/* 2. All Groups Displayed - Centered if no overflow, Circular Carousel on overflow with hover-only fade blur */}
      <div className="px-4 sm:px-6 py-10 sm:py-14 space-y-12 sm:space-y-16">
        {safeGroups.length === 0 ? (
          <div className="rounded-xl border border-dashed border-blue-200/80 bg-blue-50/35 p-8 text-center">
            <p className="text-sm font-semibold text-slate-600">
              No committee groups added yet.
            </p>
          </div>
        ) : (
          safeGroups.map((group, idx) => (
            <CommitteeGroupCarousel
              key={`${group?.groupName || "group"}-${idx}`}
              group={group}
              groupIndex={idx}
              cardBadgeLabel={cardBadgeLabel}
            />
          ))
        )}
      </div>
    </SectionContainer>
  );
}

export default CommitteesSection;
