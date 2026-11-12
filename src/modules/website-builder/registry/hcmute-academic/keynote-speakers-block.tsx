"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  Users,
  Globe,
  Link2,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Mail,
  Quote,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CarouselNavButton } from "./carousel-nav-button";
import { GridPattern } from "./grid-pattern";

export interface KeynoteSpeakerItem {
  id?: string;
  name: string;
  role?: string;
  affiliation?: string;
  country?: string;
  image?: string;
  email?: string;
  quote?: string;
  duties?: string;
  group?: string;
  keynoteTitle?: string;
  abstract?: string;
  scholarUrl?: string;
  linkedinUrl?: string;
  orcid?: string;
}

export interface HeaderAction {
  label: string;
  href: string;
}

export interface KeynoteSpeakersBlockProps {
  sectionTitle?: string;
  sectionSubtitle?: string;
  badge?: string;
  columns?: "1" | "2" | "3" | "4";
  layout?: "cards" | "human-quote" | "carousel";
  backgroundColor?: "primary" | "white" | "slate" | "dark" | string;
  background?: string;
  titleColor?: string;
  subtitleColor?: string;
  badgeColor?: string;
  badgeBgColor?: string;
  textColor?: string;
  styles?: Record<string, string | undefined>;
  actions?: HeaderAction[];
  exploreLabel?: string;
  exploreHref?: string;
  admissionsLabel?: string;
  admissionsHref?: string;
  speakers?: KeynoteSpeakerItem[];
  locale?: string;
}

import { Container } from "./container";


const CTA_BACKGROUND = "/assets/cta-background.webp";

function isDarkColor(colorStr?: string): boolean {
  if (!colorStr) return false;
  const s = colorStr.trim().toLowerCase();
  if (s === "dark" || s === "black" || s === "primary") return true;
  if (s === "white" || s === "slate" || s === "transparent") return false;
  if (s.startsWith("#")) {
    const hex = s.replace("#", "");
    if (hex.length === 3) {
      const r = parseInt(hex[0] + hex[0], 16);
      const g = parseInt(hex[1] + hex[1], 16);
      const b = parseInt(hex[2] + hex[2], 16);
      return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.55;
    }
    if (hex.length === 6) {
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.55;
    }
  }
  return false;
}

export function KeynoteSpeakersBlock({
  sectionTitle = "",
  sectionSubtitle = "",
  badge,
  titleColor,
  subtitleColor,
  badgeColor,
  badgeBgColor,
  columns = "2",
  layout = "cards",
  backgroundColor = "primary",
  background,
  textColor,
  styles,
  actions,
  exploreLabel,
  exploreHref = "",
  admissionsLabel,
  admissionsHref = "",
  speakers,
  locale,
}: KeynoteSpeakersBlockProps) {
  void locale;

  const expandLabel = "View details";
  const collapseLabel = "Show less";

  const [expandedBios, setExpandedBios] = useState<Record<string, boolean>>({});
  const [currentSlide, setCurrentSlide] = useState(0);

  const defaultSpeakers: KeynoteSpeakerItem[] = [];

  const speakerList = Array.isArray(speakers) ? speakers.filter(Boolean) : defaultSpeakers;

  const isPrimaryBg = backgroundColor === "primary";
  const isPresetDark = backgroundColor === "dark";
  const isSlateBg = backgroundColor === "slate";

  const customBg =
    styles?.backgroundGradient ||
    styles?.backgroundColor ||
    background ||
    (backgroundColor && !["primary", "white", "slate", "dark"].includes(backgroundColor) ? backgroundColor : undefined);

  const isDarkBg = isPresetDark || (customBg ? isDarkColor(customBg) : false);

  const sectionBgClass = customBg
    ? ""
    : isDarkBg
    ? "bg-zinc-950 text-white"
    : isSlateBg
    ? "bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-white"
    : "bg-white dark:bg-zinc-950 text-foreground";

  // Section Header Title Color
  const isPrimaryTitle = titleColor === "primary";
  const isWhiteTitle = titleColor === "white";
  const isDarkTitle = titleColor === "dark";
  const isHexOrRgbTitle = Boolean(titleColor && !isPrimaryTitle && !isWhiteTitle && !isDarkTitle);

  const titleColorClass = isPrimaryTitle
    ? "text-primary"
    : isWhiteTitle
    ? "text-white"
    : isDarkTitle
    ? "text-slate-900 dark:text-white"
    : isHexOrRgbTitle
    ? ""
    : (styles?.textColor || textColor)
    ? ""
    : isDarkBg
    ? "text-white"
    : "text-foreground";

  const titleInlineStyle: React.CSSProperties = {
    ...(isHexOrRgbTitle ? { color: titleColor } : {}),
    ...(!titleColor && (styles?.textColor || textColor) ? { color: styles?.textColor || textColor } : {}),
  };

  // Section Header Subtitle Color
  const isPrimarySubtitle = subtitleColor === "primary";
  const isWhiteSubtitle = subtitleColor === "white";
  const isDarkSubtitle = subtitleColor === "dark";
  const isMutedSubtitle = subtitleColor === "muted";
  const isHexOrRgbSubtitle = Boolean(subtitleColor && !isPrimarySubtitle && !isWhiteSubtitle && !isDarkSubtitle && !isMutedSubtitle);

  const subtitleColorClass = isPrimarySubtitle
    ? "text-primary/90"
    : isWhiteSubtitle
    ? "text-white/80"
    : isDarkSubtitle
    ? "text-slate-700 dark:text-zinc-300"
    : isMutedSubtitle
    ? "text-muted-foreground"
    : isHexOrRgbSubtitle
    ? ""
    : isDarkBg
    ? "text-zinc-400"
    : "text-muted-foreground";

  const subtitleInlineStyle: React.CSSProperties = {
    ...(isHexOrRgbSubtitle ? { color: subtitleColor } : {}),
    ...(!subtitleColor && (styles?.textColor || textColor) ? { color: styles?.textColor || textColor } : {}),
  };

  // Badge Color
  const isCustomBadgeColor = Boolean(badgeColor && badgeColor.trim() !== "");
  const isCustomBadgeBg = Boolean(badgeBgColor && badgeBgColor.trim() !== "");

  const badgeColorClass = badgeColor === "primary"
    ? "bg-primary/10 text-primary border border-primary/20"
    : badgeColor === "red"
    ? "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
    : badgeColor === "amber"
    ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20"
    : badgeColor === "white"
    ? "bg-white/10 text-white border border-white/20"
    : badgeColor === "dark"
    ? "bg-zinc-800 text-zinc-200 border border-zinc-700"
    : isDarkBg
    ? "bg-zinc-800 text-zinc-200 border border-zinc-700"
    : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300";

  const badgeInlineStyle: React.CSSProperties = {
    ...(isCustomBadgeColor && !["primary", "red", "amber", "white", "dark"].includes(badgeColor!) ? { color: badgeColor } : {}),
    ...(isCustomBadgeBg ? { backgroundColor: badgeBgColor } : {}),
  };

  const colClass =
    columns === "1"
      ? "grid-cols-1 max-w-4xl mx-auto"
      : columns === "3"
      ? "grid-cols-1 lg:grid-cols-2 xl:grid-cols-3"
      : columns === "4"
      ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-4"
      : "grid-cols-1 lg:grid-cols-2";

  const cardContainerClass = isPrimaryBg
    ? "bg-gradient-to-br from-primary via-blue-700 to-primary text-white shadow-xl hover:shadow-2xl border border-blue-400/20 hover:border-blue-300/40 relative overflow-hidden"
    : isDarkBg
    ? "bg-zinc-900 text-white border border-zinc-800 hover:border-zinc-700 shadow-lg relative overflow-hidden"
    : isSlateBg
    ? "bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-white border border-slate-200/80 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:border-primary/40 relative overflow-hidden"
    : "bg-white dark:bg-zinc-900 text-slate-900 dark:text-white border border-slate-200/80 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:border-primary/40 relative overflow-hidden";

  const toggleBio = (id: string) => {
    setExpandedBios((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const shouldShowBadge = Boolean(badge?.trim());

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + speakerList.length) % speakerList.length);
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % speakerList.length);
  };

  const currentSpeaker = speakerList[currentSlide] || speakerList[0] || { name: "" };

  // Action links displayed on the right of the header
  const resolvedActions = actions && actions.length > 0
    ? actions
    : [
        ...(exploreHref ? [{ label: exploreLabel || "Explore", href: exploreHref }] : []),
        ...(admissionsHref ? [{ label: admissionsLabel || "Learn more", href: admissionsHref }] : []),
      ];

  return (
    <section
      className={cn("relative w-full py-10 sm:py-12 lg:py-16 font-sans overflow-hidden", sectionBgClass)}
      style={customBg ? { background: customBg } : undefined}
    >
      <Container className="relative z-10 space-y-6 sm:space-y-8">
        {/* Section Header — Aligned two sides */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6">
          <div className="space-y-1.5 sm:space-y-2">
            {shouldShowBadge && (
              <div
                className={cn(
                  "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold",
                  badgeColorClass
                )}
                style={badgeInlineStyle}
              >
                <Users className="size-3.5" />
                <span>{badge}</span>
              </div>
            )}
            <h2
              className={cn(
                "text-2xl sm:text-3xl lg:text-[2.75rem] uppercase font-bold tracking-tight lg:leading-[1.25]",
                titleColorClass
              )}
              style={titleInlineStyle}
            >
              {sectionTitle}
            </h2>
            {sectionSubtitle && (
              <p
                className={cn(
                  "text-sm sm:text-base lg:text-lg",
                  subtitleColorClass
                )}
                style={subtitleInlineStyle}
              >
                {sectionSubtitle}
              </p>
            )}
          </div>

          {/* Right side: Action Links and Carousel Navigation */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 flex-wrap">
            {resolvedActions.map((act) => (
              <Link
                key={act.label}
                href={act.href}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200",
                  isDarkBg
                    ? "bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700"
                    : "border border-primary/20 text-primary hover:bg-primary hover:text-white"
                )}
              >
                <span>{act.label}</span>
                <ArrowRight className="size-3.5" />
              </Link>
            ))}

            {(layout === "human-quote" || layout === "carousel") && speakerList.length > 1 && (
              <div className="flex items-center gap-2 pl-1 sm:pl-2">
                <CarouselNavButton direction="prev" onClick={handlePrevSlide} size="md" />
                <CarouselNavButton direction="next" onClick={handleNextSlide} size="md" />
              </div>
            )}
          </div>
        </div>

        {/* Layout: Human Cutout & Quote style with Multi-person Row */}
        {layout === "human-quote" && speakerList.length > 0 ? (
          <div className="space-y-6">
            {/* Main Stage: Human Cutout Standing + Quote */}
            <div className="relative overflow-hidden rounded-2xl bg-primary text-primary-foreground shadow-xl">
              {/* Background decorative image — active on desktop */}
              <div className="hidden lg:block absolute inset-0 overflow-hidden pointer-events-none opacity-20">
                <Image
                  src={CTA_BACKGROUND}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 1200px"
                  className="object-cover"
                />
              </div>

              <div className="relative z-10 flex flex-col lg:flex-row items-stretch justify-between lg:pb-0">
                {/* Image: On mobile (order-1) top center with full-width container and divider. On desktop (order-2) right side anchored to bottom, stretching to match left column height */}
                <div className="order-1 lg:order-2 relative w-full lg:w-auto h-72 sm:h-80 lg:h-auto lg:self-stretch shrink-0 flex items-end justify-center lg:justify-end border-b lg:border-b-0 border-white/15 bg-gradient-to-b from-white/10 to-transparent lg:bg-none lg:pr-8 xl:pr-12">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`img-${currentSlide}`}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      className="relative h-[270px] sm:h-[310px] lg:h-full lg:min-h-[500px] xl:min-h-[550px] w-[230px] sm:w-[270px] lg:w-[390px] xl:w-[450px] flex items-end justify-center lg:justify-end"
                    >
                      {currentSpeaker.image && <Image
                        src={currentSpeaker.image}
                        alt={currentSpeaker?.name || "Speaker"}
                        fill
                        priority
                        sizes="(max-width: 640px) 260px, (max-width: 1024px) 390px, 450px"
                        style={{ objectPosition: "bottom" }}
                        className="object-contain object-bottom drop-shadow-2xl block"
                      />}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Left: Leader Info & Quote — on mobile (order-2) under divider with left text, grid pattern, and Xem chi tiết button. On desktop (order-1) left side */}
                <div className="order-2 lg:order-1 relative z-10 flex-1 p-5 sm:p-7 lg:px-12 lg:py-10 max-w-none lg:max-w-2xl text-left overflow-hidden">
                  {/* GridPattern & UTE Flower (20% increased spread: ellipse 90% 80%, white 30%, transparent 85%) */}
                  <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
                    <GridPattern
                      width={24}
                      height={24}
                      className="absolute inset-0 h-full w-full stroke-white/[0.14] fill-transparent [mask-image:radial-gradient(ellipse_90%_80%_at_bottom_right,white_30%,transparent_85%)]"
                    />
                    <Image
                      src="/assets/flower-ute-white.png"
                      alt=""
                      width={200}
                      height={200}
                      className="pointer-events-none absolute -bottom-8 -right-8 select-none opacity-[0.1] rotate-[15deg]"
                      aria-hidden="true"
                    />
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentSpeaker.id || `slide-${currentSlide}`}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.25 }}
                      className="relative z-10 space-y-2.5 sm:space-y-3 text-white text-left"
                    >
                      {currentSpeaker.group && (
                        <span className="inline-block px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-white/20 text-white backdrop-blur-xs">
                          {currentSpeaker.group}
                        </span>
                      )}

                      <h3 className="text-xl sm:text-2xl lg:text-4xl font-bold text-white leading-tight uppercase">
                        {currentSpeaker.name}
                      </h3>

                      {currentSpeaker.role && (
                        <p className="text-xs sm:text-sm lg:text-base font-semibold text-blue-100">
                          {currentSpeaker.role}
                        </p>
                      )}

                      {currentSpeaker.email && (
                        <a
                          href={`mailto:${currentSpeaker.email}`}
                          className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-blue-100 hover:text-white underline"
                        >
                          <Mail className="size-3.5" />
                          <span>{currentSpeaker.email}</span>
                        </a>
                      )}

                      {(currentSpeaker.quote || currentSpeaker.abstract) && (
                        <div className="pt-2 text-xs sm:text-sm font-normal leading-relaxed text-blue-50/95">
                          <div className={cn(
                            "relative transition-all",
                            expandedBios[currentSpeaker.id || `slide-${currentSlide}`]
                              ? "max-h-[220px] overflow-y-auto pr-2 scrollbar-thin"
                              : "line-clamp-3 lg:line-clamp-none"
                          )}>
                            <p className="text-xs sm:text-sm lg:text-base leading-relaxed text-blue-50/95 font-light italic">
                              <Quote className="inline size-3.5 sm:size-4 text-blue-200 mr-2 -mt-1 shrink-0" />
                              {currentSpeaker.quote || currentSpeaker.abstract}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleBio(currentSpeaker.id || `slide-${currentSlide}`)}
                            className="mt-2 font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer text-xs text-white lg:hidden"
                          >
                            <span>{expandedBios[currentSpeaker.id || `slide-${currentSlide}`] ? collapseLabel : expandLabel}</span>
                            {expandedBios[currentSpeaker.id || `slide-${currentSlide}`] ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                          </button>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Multi-Person Row Selector: Thumbnails of all leaders in a row */}
            {speakerList.length > 1 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-1 sm:pt-2">
                {speakerList.map((speaker, idx) => {
                  const isSelected = idx === currentSlide;
                  return (
                    <button
                      key={speaker.id || `thumb-${idx}`}
                      type="button"
                      onClick={() => setCurrentSlide(idx)}
                      className={cn(
                        "group relative flex flex-col p-2.5 sm:p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer",
                        isSelected
                          ? "bg-primary/5 border-primary shadow-md ring-2 ring-primary/20"
                          : "bg-white dark:bg-zinc-800/80 border-slate-200/80 dark:border-zinc-700 hover:border-primary/50 hover:bg-slate-50"
                      )}
                    >
                      <div className="relative h-28 sm:h-36 w-full rounded-lg overflow-hidden bg-slate-100 dark:bg-zinc-800 mb-2 sm:mb-2.5">
                        {speaker.image && <Image
                          src={speaker.image}
                          alt={speaker?.name || "Speaker"}
                          fill
                          sizes="(max-width: 640px) 140px, 200px"
                          style={{ objectPosition: "bottom" }}
                          className="object-contain object-bottom group-hover:scale-105 transition-transform duration-200"
                        />}
                        {speaker.group && (
                          <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-white/90 text-slate-800 backdrop-blur-xs shadow-2xs">
                            {speaker.group}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-bold text-foreground dark:text-white line-clamp-1 uppercase">
                        {speaker.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground line-clamp-1">
                        {speaker.role}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* Cards Grid Layout: Responsive Horizontal Cards with Image on Left and Content & Quote on Right */
          <div className={cn("grid gap-4 sm:gap-6", colClass)}>
            {speakerList.map((speaker, idx) => {
              const sId = speaker.id || `sp-${idx}`;
              const isBioExpanded = expandedBios[sId];

              return (
                <div
                  key={sId}
                  className={cn(
                    "group relative flex flex-col sm:flex-row items-stretch rounded-2xl overflow-hidden transition-all duration-300",
                    cardContainerClass
                  )}
                >
                  {/* GridPattern & UTE Flower Watermark on Bottom Right of Card — positioned relatively to the CARD (20% increased spread) */}
                  {isPrimaryBg ? (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
                      <GridPattern
                        width={24}
                        height={24}
                        className="absolute inset-0 h-full w-full stroke-white/[0.14] fill-transparent [mask-image:radial-gradient(ellipse_90%_80%_at_bottom_right,white_30%,transparent_85%)]"
                      />
                      <Image
                        src="/assets/flower-ute-white.png"
                        alt=""
                        width={200}
                        height={200}
                        className="pointer-events-none absolute -bottom-8 -right-8 select-none opacity-[0.1] rotate-[15deg]"
                        aria-hidden="true"
                      />
                    </div>
                  ) : (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
                      <GridPattern
                        width={24}
                        height={24}
                        className="absolute inset-0 h-full w-full stroke-border/40 fill-transparent [mask-image:radial-gradient(ellipse_90%_80%_at_bottom_right,white_30%,transparent_85%)]"
                      />
                    </div>
                  )}

                  {/* Left / Top: Image & Badge — guaranteed height on mobile with center image, opaque backdrop so grid pattern never overflows into image */}
                  <div className={cn(
                    "relative w-full h-64 sm:h-auto shrink-0 sm:w-[180px] md:w-[200px] xl:w-[220px] sm:min-h-[280px] overflow-hidden flex items-end justify-center self-center sm:self-stretch z-10",
                    isPrimaryBg
                      ? "bg-primary bg-gradient-to-b from-white/15 to-white/5 border-b sm:border-b-0 sm:border-r border-white/15"
                      : "bg-white dark:bg-zinc-900 bg-gradient-to-b from-blue-50/70 to-slate-100 dark:from-zinc-800 dark:to-zinc-900 border-b sm:border-b-0 sm:border-r border-slate-200/60 dark:border-zinc-800"
                  )}>
                    {speaker.image && <Image
                      src={speaker.image}
                      alt={speaker?.name || "Speaker"}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 240px, 320px"
                      style={{ objectPosition: "bottom" }}
                      className="object-contain object-bottom group-hover:scale-105 transition-transform duration-300 block"
                    />}
                    {speaker.group && (
                      <div className="absolute top-2.5 left-2.5 z-10">
                        <span className={cn(
                          "inline-block px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide shadow-2xs backdrop-blur-xs",
                          isPrimaryBg
                            ? "bg-white text-primary"
                            : "bg-white/95 text-primary dark:bg-zinc-900/95 dark:text-blue-300 border border-slate-200/80 dark:border-zinc-700"
                        )}>
                          {speaker.group}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Right / Bottom: Content & Quote — left-aligned text, divider above on mobile */}
                  <div className="relative z-10 flex-1 p-4 sm:p-5 lg:p-6 flex flex-col justify-between space-y-3 sm:space-y-4 min-w-0">
                    <div className="relative z-10 space-y-1.5 sm:space-y-2 min-w-0 text-left">
                      {/* Name - font-bold, responsive text size */}
                      <h3 className={cn(
                        "text-base sm:text-lg lg:text-xl font-bold uppercase leading-snug tracking-tight break-words",
                        isPrimaryBg ? "text-white" : "text-slate-900 dark:text-white"
                      )}>
                        {speaker.name}
                      </h3>

                      {/* Role - font-semibold */}
                      {speaker.role && (
                        <p className={cn(
                          "text-xs sm:text-sm font-semibold break-words",
                          isPrimaryBg ? "text-blue-100" : "text-primary dark:text-blue-400"
                        )}>
                          {speaker.role}
                        </p>
                      )}

                      {/* Email - truncate for extreme narrow widths */}
                      {speaker.email && (
                        <p className="text-xs min-w-0">
                          <a
                            href={`mailto:${speaker.email}`}
                            className={cn(
                              "inline-flex items-center gap-1.5 transition-colors max-w-full",
                              isPrimaryBg
                                ? "text-blue-100 hover:text-white underline"
                                : "text-slate-600 dark:text-slate-400 hover:text-primary"
                            )}
                          >
                            <Mail className={cn("size-3.5 shrink-0", isPrimaryBg ? "text-blue-200" : "text-primary/80")} />
                            <span className="truncate">{speaker.email}</span>
                          </a>
                        </p>
                      )}

                      {/* Affiliation if present and not redundant */}
                      {speaker.affiliation && speaker.affiliation !== sectionSubtitle && (
                        <p className={cn(
                          "text-xs font-medium break-words",
                          isPrimaryBg ? "text-blue-200/90" : "text-slate-500 dark:text-slate-400"
                        )}>
                          {speaker.affiliation}
                        </p>
                      )}

                      {/* Keynote Title if present */}
                      {speaker.keynoteTitle && (
                        <div className={cn(
                          "p-2.5 rounded-xl space-y-0.5",
                          isPrimaryBg
                            ? "bg-white/10 border border-white/15 backdrop-blur-xs"
                            : "bg-slate-100/70 dark:bg-zinc-800/60 border border-slate-200/70 dark:border-zinc-700/60"
                        )}>
                          <span className={cn(
                            "text-[10px] font-bold uppercase tracking-wider",
                            isPrimaryBg ? "text-blue-200" : "text-slate-500"
                          )}>
                            {"Keynote topic:"}
                          </span>
                          <p className={cn(
                            "text-xs font-semibold leading-snug break-words",
                            isPrimaryBg ? "text-white" : "text-slate-900 dark:text-white"
                          )}>
                            &ldquo;{speaker.keynoteTitle}&rdquo;
                          </p>
                        </div>
                      )}

                      {/* Quote / Duties / Abstract Collapsible */}
                      {(speaker.quote || speaker.duties || speaker.abstract) && (
                        <div className={cn(
                          "pt-2 text-xs sm:text-sm font-normal leading-relaxed",
                          isPrimaryBg
                            ? "text-blue-50/95"
                            : "text-slate-600 dark:text-slate-300"
                        )}>
                          <div className={cn(
                            "relative transition-all",
                            isBioExpanded
                              ? "max-h-[220px] overflow-y-auto pr-1.5 scrollbar-thin"
                              : "line-clamp-3"
                          )}>
                            <p>
                              {speaker.quote || speaker.duties || speaker.abstract}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleBio(sId)}
                            className={cn(
                              "mt-2 font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer text-xs",
                              isPrimaryBg ? "text-white" : "text-primary dark:text-blue-400"
                            )}
                          >
                            <span>{isBioExpanded ? collapseLabel : expandLabel}</span>
                            {isBioExpanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Social / Scholar Links if present */}
                    {(speaker.scholarUrl || speaker.linkedinUrl || speaker.orcid) && (
                      <div className="relative z-10 flex items-center gap-2 pt-3">
                        {speaker.scholarUrl && (
                          <a
                            href={speaker.scholarUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                              "p-1.5 rounded-lg border transition-colors",
                              isPrimaryBg
                                ? "bg-white/15 text-white hover:bg-white/25 border-white/20"
                                : "bg-slate-50 dark:bg-zinc-800 text-slate-600 hover:text-primary dark:text-slate-300 border-slate-200 dark:border-zinc-700"
                            )}
                            title="Google Scholar"
                          >
                            <BookOpen className="size-4" />
                          </a>
                        )}
                        {speaker.linkedinUrl && (
                          <a
                            href={speaker.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                              "p-1.5 rounded-lg border transition-colors",
                              isPrimaryBg
                                ? "bg-white/15 text-white hover:bg-white/25 border-white/20"
                                : "bg-slate-50 dark:bg-zinc-800 text-slate-600 hover:text-primary dark:text-slate-300 border-slate-200 dark:border-zinc-700"
                            )}
                            title="LinkedIn"
                          >
                            <Link2 className="size-4" />
                          </a>
                        )}
                        {speaker.orcid && (
                          <a
                            href={speaker.orcid}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                              "p-1.5 rounded-lg border transition-colors text-xs font-bold",
                              isPrimaryBg
                                ? "bg-white/15 text-white hover:bg-white/25 border-white/20"
                                : "bg-slate-50 dark:bg-zinc-800 text-slate-600 hover:text-emerald-600 dark:text-slate-300 border-slate-200 dark:border-zinc-700"
                            )}
                            title="ORCID"
                          >
                            <Globe className="size-4" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Container>
    </section>
  );
}

