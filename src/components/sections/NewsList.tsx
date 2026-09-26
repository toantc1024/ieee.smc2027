"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Share2,
  Check,
  ExternalLink,
} from "lucide-react";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { GridPattern } from "@/components/ui/grid-pattern";
import { CarouselNavButton } from "@/components/ui/CarouselNavButton";
import { cn } from "@/lib/utils";

export interface NewsItem {
  id: string;
  title: string;
  date: string;
  day: string;
  month: string;
  year: string;
  category: "Partnership" | "Program" | "Deadline" | "Keynote" | "Announcement";
  summary: string;
  content: string;
  image?: string;
  viewCount?: number;
  externalUrl?: string;
}

export const DEFAULT_NEWS_ITEMS: NewsItem[] = [
  {
    id: "news-quanser",
    title: "IEEE SMC 2026 is pleased to welcome Quanser as a Bronze Partner of this year's conference",
    date: "09/10/2026",
    day: "10",
    month: "09",
    year: "2026",
    category: "Partnership",
    summary: "IEEE SMC 2026 is pleased to welcome Quanser as a Bronze Partner of this year’s conference.",
    content: "The IEEE SMC Organizing Committee is proud to announce Quanser, a global leader in innovative platforms for control, mechatronics, and robotics education, as an official Bronze Partner. Quanser will showcase cutting-edge hardware-in-the-loop and robotics education systems at the conference venue.",
    image: "/news/giai-nha-robot.jpeg",
    viewCount: 1420,
    externalUrl: "https://www.ieeesmc2026.org/NewsDetail/8670507.html",
  },
  {
    id: "news-shimadzu",
    title: "Shimadzu Corporation Joins IEEE SMC 2026 as Bronze Partner",
    date: "09/07/2026",
    day: "07",
    month: "09",
    year: "2026",
    category: "Partnership",
    summary: "IEEE SMC 2026 is pleased to welcome Shimadzu Corporation as a Bronze Partner of this year’s conference.",
    content: "Shimadzu Corporation, renowned globally for analytical instruments and diagnostic medical equipment, joins IEEE SMC as a Bronze Partner. Their technical contributions in bio-sensing and analytical cyber-systems will be featured in special industrial demonstration sessions.",
    image: "/news/vina-ute.png",
    viewCount: 980,
    externalUrl: "https://www.ieeesmc2026.org/NewsDetail/8653404.html",
  },
  {
    id: "news-schedule",
    title: "IEEE SMC 2026 Schedule‑at‑a‑Glance Now Available Online",
    date: "09/03/2026",
    day: "03",
    month: "09",
    year: "2026",
    category: "Program",
    summary: "The IEEE SMC 2026 Organizing Committee is pleased to share that the official Schedule‑at‑a‑Glance has been published on the conference website.",
    content: "This condensed four‑day overview enables registered participants to preview tutorials, workshops, keynotes, panel discussions, parallel oral sessions, virtual presentations and social functions to help prepare for the in‑person conference taking place 4 – 7 October.",
    image: "/news/4.0-tech.jpg",
    viewCount: 2650,
    externalUrl: "https://www.ieeesmc2026.org/NewsDetail/8625546.html",
  },
  {
    id: "news-squirrel-ai",
    title: "Squirrel AI Learning Joins IEEE SMC 2026 as Silver Partner",
    date: "08/21/2026",
    day: "21",
    month: "08",
    year: "2026",
    category: "Partnership",
    summary: "IEEE SMC 2026 is pleased to welcome Squirrel AI Learning as a Silver Partner of this year’s conference.",
    content: "Squirrel AI Learning, an international pioneer in AI-powered adaptive education systems, has entered a Silver Partnership with IEEE SMC. Delegates will have the opportunity to interact with their adaptive learning algorithms and explore human-AI education paradigms.",
    image: "/news/Hinh khoi nghiep 11.jpg",
    viewCount: 1180,
    externalUrl: "https://www.ieeesmc2026.org/NewsDetail/8548748.html",
  },
  {
    id: "news-mind-children",
    title: "Mind Children Inc. Joins IEEE SMC 2026 as Bronze Partner",
    date: "08/11/2026",
    day: "11",
    month: "08",
    year: "2026",
    category: "Partnership",
    summary: "IEEE SMC 2026 welcomes Bronze Partner Mind Children Inc., which will showcase its multilingual social robot Codey for attendees to experience human-robot interaction in Bellevue.",
    content: "IEEE SMC welcomes Bronze Partner Mind Children Inc., which will showcase its multilingual companion robot Codey for attendees to experience human-robot interaction, affective computing, and social assistive robotics directly in the exhibition hall.",
    image: "/news/top-50.jpg",
    viewCount: 890,
    externalUrl: "https://www.ieeesmc2026.org/NewsDetail/8473083.html",
  },
  {
    id: "news-deadline-ext-aug",
    title: "Final Deadline Extension: Paper Submission and Early-Bird Registration Now Due August 9, 2026",
    date: "08/03/2026",
    day: "03",
    month: "08",
    year: "2026",
    category: "Deadline",
    summary: "In response to continued requests from authors and participants, the IEEE SMC deadline has been extended to August 9, 2026.",
    content: "In response to continued requests from authors and research groups worldwide, the final deadline extension for paper submission and early-bird registration is now due August 9, 2026. Authors are encouraged to finalize their manuscript submissions promptly.",
    image: "/news/aun.jpg",
    viewCount: 4120,
    externalUrl: "https://www.ieeesmc2026.org/NewsDetail/8361825.html",
  },
  {
    id: "news-deadline-ext-jul",
    title: "Final Paper Submission and Early Bird Registration Deadline Extended",
    date: "07/26/2026",
    day: "26",
    month: "07",
    year: "2026",
    category: "Deadline",
    summary: "In response to numerous requests, the final paper submission and early bird registration deadline has been extended.",
    content: "In response to numerous requests from international authors, academic institutions, and research labs, the organizing committee has extended the final paper submission and early bird registration deadlines to give additional preparation time.",
    image: "/news/hydro.jpg",
    viewCount: 2310,
    externalUrl: "https://www.ieeesmc2026.org/NewsDetail/8279400.html",
  },
  {
    id: "news-keynote-announcement",
    title: "Third Keynote Anouncement – IEEE SMC 2026",
    date: "06/29/2026",
    day: "29",
    month: "06",
    year: "2026",
    category: "Keynote",
    summary: "IEEE SMC 2026 is honored to feature Dr. Danielle Belgrave as our third keynote speaker.",
    content: "We are thrilled to announce Dr. Danielle Belgrave as our third keynote speaker for IEEE SMC 2026. Dr. Belgrave will deliver a plenary keynote lecture on healthcare machine learning and human-centric artificial intelligence.",
    image: "/news/hoi-thao-ute.jpg",
    viewCount: 1840,
    externalUrl: "https://www.ieeesmc2026.org/NewsDetail/8096397.html",
  },
];

export interface NewsListProps {
  title?: string;
  subtitle?: string;
  items?: NewsItem[];
}

export function NewsList({
  title = "Conference News & Announcements",
  subtitle = "Stay updated with the latest milestones, partnership alerts, and program schedules",
  items = DEFAULT_NEWS_ITEMS,
}: NewsListProps) {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const categories = ["All", "Partnership", "Program", "Deadline", "Keynote"];

  // Category scrolling & dragging state (for the top filter bar)
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollCatLeft, setCanScrollCatLeft] = useState(false);
  const [canScrollCatRight, setCanScrollCatRight] = useState(false);
  const isDraggingCat = useRef(false);
  const dragCatStartX = useRef(0);
  const dragCatScrollLeft = useRef(0);
  const hasDraggedCat = useRef(false);

  const checkCategoryScroll = useCallback(() => {
    const el = categoryScrollRef.current;
    if (!el) return;
    setCanScrollCatLeft(el.scrollLeft > 4);
    setCanScrollCatRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    checkCategoryScroll();
    const el = categoryScrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkCategoryScroll, { passive: true });
    window.addEventListener("resize", checkCategoryScroll);
    return () => {
      el.removeEventListener("scroll", checkCategoryScroll);
      window.removeEventListener("resize", checkCategoryScroll);
    };
  }, [checkCategoryScroll]);

  const onCatPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.pointerType === "touch" || e.button !== 0) return;
    const el = categoryScrollRef.current;
    if (!el) return;
    isDraggingCat.current = true;
    hasDraggedCat.current = false;
    dragCatStartX.current = e.clientX;
    dragCatScrollLeft.current = el.scrollLeft;
  }, []);

  const onCatPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDraggingCat.current) return;
    const el = categoryScrollRef.current;
    if (!el) return;
    const deltaX = e.clientX - dragCatStartX.current;
    if (Math.abs(deltaX) > 10) {
      hasDraggedCat.current = true;
      el.scrollLeft = dragCatScrollLeft.current - deltaX;
    }
  }, []);

  const onCatPointerUp = useCallback(() => {
    if (!isDraggingCat.current) return;
    isDraggingCat.current = false;
    if (hasDraggedCat.current) {
      setTimeout(() => {
        hasDraggedCat.current = false;
      }, 50);
    }
  }, []);

  const scrollCategories = (dir: "left" | "right") => {
    const el = categoryScrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -220 : 220, behavior: "smooth" });
  };

  const handleCategorySelect = (cat: string) => {
    if (hasDraggedCat.current) return;
    setActiveCategory(cat);
  };

  // Filter and sort items (newest first)
  const filteredAndSortedItems = useMemo(() => {
    const result = items.filter((item) => {
      const matchesCategory =
        activeCategory === "All" || item.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });

    return [...result].sort((a, b) => {
      const timeA = new Date(
        `${a.year}-${a.month.padStart(2, "0")}-${a.day.padStart(2, "0")}`
      ).getTime();
      const timeB = new Date(
        `${b.year}-${b.month.padStart(2, "0")}-${b.day.padStart(2, "0")}`
      ).getTime();
      return timeB - timeA; // newest first
    });
  }, [items, activeCategory, searchQuery]);

  // -------------------------------------------------------------
  // CAROUSEL LOGIC: Track scrolling, progressive blur, chevrons
  // -------------------------------------------------------------
  const cardsTrackRef = useRef<HTMLDivElement>(null);
  const [canScrollCardsLeft, setCanScrollCardsLeft] = useState(false);
  const [canScrollCardsRight, setCanScrollCardsRight] = useState(false);
  const isDraggingCards = useRef(false);
  const dragCardsStartX = useRef(0);
  const dragCardsScrollLeft = useRef(0);
  const hasDraggedCards = useRef(false);

  const checkCardsScroll = useCallback(() => {
    const el = cardsTrackRef.current;
    if (!el) return;
    setCanScrollCardsLeft(el.scrollLeft > 10);
    setCanScrollCardsRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  useEffect(() => {
    const el = cardsTrackRef.current;
    if (!el) return;
    checkCardsScroll();
    el.addEventListener("scroll", checkCardsScroll, { passive: true });
    window.addEventListener("resize", checkCardsScroll);
    return () => {
      el.removeEventListener("scroll", checkCardsScroll);
      window.removeEventListener("resize", checkCardsScroll);
    };
  }, [checkCardsScroll, filteredAndSortedItems]);

  // Reset scroll to start when filters change
  useEffect(() => {
    const el = cardsTrackRef.current;
    if (el) {
      el.scrollLeft = 0;
      checkCardsScroll();
    }
  }, [activeCategory, searchQuery, checkCardsScroll]);

  const scrollCards = (direction: "prev" | "next") => {
    const el = cardsTrackRef.current;
    if (!el) return;
    const cardEl = el.querySelector("article");
    const step = cardEl ? cardEl.clientWidth + 24 : 380;
    el.scrollBy({
      left: direction === "next" ? step : -step,
      behavior: "smooth",
    });
  };

  const onCardsPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.pointerType === "touch" || e.button !== 0) return;
    const el = cardsTrackRef.current;
    if (!el) return;
    isDraggingCards.current = true;
    hasDraggedCards.current = false;
    dragCardsStartX.current = e.clientX;
    dragCardsScrollLeft.current = el.scrollLeft;
  }, []);

  const onCardsPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDraggingCards.current) return;
    const el = cardsTrackRef.current;
    if (!el) return;
    const deltaX = e.clientX - dragCardsStartX.current;
    if (Math.abs(deltaX) > 10) {
      hasDraggedCards.current = true;
      el.scrollLeft = dragCardsScrollLeft.current - deltaX;
    }
  }, []);

  const onCardsPointerUp = useCallback(() => {
    if (!isDraggingCards.current) return;
    isDraggingCards.current = false;
    if (hasDraggedCards.current) {
      setTimeout(() => {
        hasDraggedCards.current = false;
      }, 50);
    }
  }, []);

  const handleShare = (news: NewsItem) => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(`${window.location.origin}/#news-${news.id}`);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <SectionContainer id="news" fullWidthBg="bg-white">
      {/* Section Header matching standard HCMUTE 2-line headline style (No divider or badge) */}
      <div className="relative overflow-hidden px-4 sm:px-6 pt-10 sm:pt-14 pb-4 sm:pb-6 w-full">
        <div className="corner-dot-tr opacity-75 pointer-events-none" />

        <div className="space-y-3 relative z-10 w-full">
          <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold uppercase tracking-tight leading-[1.2] w-full">
            <span className="block text-[#004776]">Latest Updates</span>
            <span className="block text-[#115eff]">& Announcements</span>
          </h2>
          <p className="text-base sm:text-lg text-[#004776]/80 font-medium">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Controls Container: Full Width Search + Draggable Fade Categories & Sorting */}
      <div className="px-4 sm:px-6 space-y-4 w-full">
        {/* Full Width Search Bar — Rounded-full and Bigger */}
        <div className="relative w-full">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search news, announcements, tracks, speakers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 sm:pl-14 pr-12 py-3 sm:py-3.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 hover:border-slate-300 focus:border-[#115eff] rounded-full text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-3 focus:ring-[#115eff]/10 transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Draggable Category Badges with Fade */}
        <div className="relative min-w-0 w-full overflow-hidden">
          {/* Left fade gradient */}
          <div
            className={cn(
              "pointer-events-none absolute inset-y-0 left-0 z-10 w-8 sm:w-12 bg-gradient-to-r from-white to-transparent transition-opacity duration-300",
              canScrollCatLeft ? "opacity-100" : "opacity-0"
            )}
          />
          {canScrollCatLeft && (
            <button
              type="button"
              onClick={() => scrollCategories("left")}
              className="absolute left-1 top-1/2 z-20 -translate-y-1/2 hidden sm:flex size-8 items-center justify-center rounded-full border border-slate-200 bg-white/95 backdrop-blur-xs transition-all hover:scale-105 cursor-pointer"
              aria-label="Scroll left"
            >
              <ChevronLeft className="size-4 text-slate-700" />
            </button>
          )}

          {/* Right fade gradient */}
          <div
            className={cn(
              "pointer-events-none absolute inset-y-0 right-0 z-10 w-8 sm:w-12 bg-gradient-to-l from-white to-transparent transition-opacity duration-300",
              canScrollCatRight ? "opacity-100" : "opacity-0"
            )}
          />
          {canScrollCatRight && (
            <button
              type="button"
              onClick={() => scrollCategories("right")}
              className="absolute right-1 top-1/2 z-20 -translate-y-1/2 hidden sm:flex size-8 items-center justify-center rounded-full border border-slate-200 bg-white/95 backdrop-blur-xs transition-all hover:scale-105 cursor-pointer"
              aria-label="Scroll right"
            >
              <ChevronRight className="size-4 text-slate-700" />
            </button>
          )}

          {/* Draggable Category Badges */}
          <div
            ref={categoryScrollRef}
            onPointerDown={onCatPointerDown}
            onPointerMove={onCatPointerMove}
            onPointerUp={onCatPointerUp}
            onPointerLeave={onCatPointerUp}
            className="flex items-center gap-2.5 overflow-x-auto scrollbar-none py-1.5 px-1 cursor-grab active:cursor-grabbing select-none touch-pan-x"
            style={{ scrollBehavior: isDraggingCat.current ? "auto" : "smooth" }}
          >
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategorySelect(cat)}
                className={cn(
                  "px-5 py-2 sm:px-6 sm:py-2.5 rounded-full text-xs sm:text-sm uppercase tracking-wider font-extrabold transition-all shrink-0 select-none cursor-pointer whitespace-nowrap",
                  activeCategory === cat
                    ? "bg-[#115eff] text-white"
                    : "bg-slate-50 text-slate-700 border border-slate-200/90 hover:bg-slate-100 hover:text-slate-900 hover:border-slate-300"
                )}
              >
                {cat.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* NEWS CAROUSEL with Progressive Blur & Left/Right Chevrons     */}
      {/* ------------------------------------------------------------- */}
      <div className="relative w-full py-6 sm:py-8 group/carousel">
        {filteredAndSortedItems.length === 0 ? (
          <div className="mx-4 sm:mx-6 p-12 text-center bg-slate-50 border border-slate-200 rounded-2xl text-slate-500 text-sm sm:text-base">
            No announcements found matching your filter criteria.
          </div>
        ) : (
          <div className="relative w-full overflow-hidden">
            {/* Left side fade — natural pure gradient matching hcmute-website-frontend */}
            <div
              className={cn(
                "pointer-events-none absolute inset-y-0 left-0 z-20 w-10 sm:w-16 lg:w-20 bg-gradient-to-r from-white to-transparent transition-opacity duration-300",
                canScrollCardsLeft ? "opacity-100" : "opacity-0"
              )}
            />

            {/* Left Chevron Navigation Button */}
            <div
              className={cn(
                "absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 transition-all duration-300",
                canScrollCardsLeft
                  ? "opacity-100 pointer-events-auto scale-100"
                  : "opacity-0 pointer-events-none scale-90"
              )}
            >
              <CarouselNavButton
                direction="prev"
                onClick={() => scrollCards("prev")}
                variant="light"
                size="md"
                className="border-slate-200 bg-white/95 backdrop-blur-xs hover:border-[#115eff]"
              />
            </div>

            {/* Right side fade — natural pure gradient matching hcmute-website-frontend */}
            <div
              className={cn(
                "pointer-events-none absolute inset-y-0 right-0 z-20 w-12 sm:w-20 lg:w-24 bg-gradient-to-l from-white to-transparent transition-opacity duration-300",
                canScrollCardsRight ? "opacity-100" : "opacity-0"
              )}
            />

            {/* Right Chevron Navigation Button */}
            <div
              className={cn(
                "absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 transition-all duration-300",
                canScrollCardsRight
                  ? "opacity-100 pointer-events-auto scale-100"
                  : "opacity-0 pointer-events-none scale-90"
              )}
            >
              <CarouselNavButton
                direction="next"
                onClick={() => scrollCards("next")}
                variant="light"
                size="md"
                className="border-slate-200 bg-white/95 backdrop-blur-xs hover:border-[#115eff]"
              />
            </div>

            {/* Horizontal Scrolling Cards Carousel Track */}
            <div
              ref={cardsTrackRef}
              onPointerDown={onCardsPointerDown}
              onPointerMove={onCardsPointerMove}
              onPointerUp={onCardsPointerUp}
              onPointerLeave={onCardsPointerUp}
              className="flex items-stretch gap-5 sm:gap-6 overflow-x-auto scrollbar-none py-3 px-4 sm:px-6 cursor-grab active:cursor-grabbing select-none touch-pan-x"
              style={{ scrollBehavior: isDraggingCards.current ? "auto" : "smooth" }}
            >
              {filteredAndSortedItems.map((news) => (
                <article
                  key={news.id}
                  onClick={() => {
                    if (hasDraggedCards.current) return;
                    setSelectedNews(news);
                  }}
                  className="w-[85vw] sm:w-[350px] lg:w-[380px] shrink-0 group group/card relative flex flex-col overflow-hidden rounded-xl bg-white border border-slate-200/90 hover:border-[#115eff] hover:bg-[#115eff] transition-all duration-300 cursor-pointer select-none"
                >
                  {/* Grid pattern — visible on hover at bottom right (HCMUTE style) */}
                  <GridPattern
                    width={32}
                    height={32}
                    className="pointer-events-none absolute inset-0 z-[1] stroke-white/0 fill-transparent transition-colors duration-200 group-hover:stroke-white/[0.08] group-hover/card:stroke-white/[0.08] [mask-image:radial-gradient(ellipse_75%_65%_at_bottom_right,white_40%,transparent_100%)]"
                  />

                  {/* UTE Flower watermark — appears subtle at bottom right on hover without rotation */}
                  <Image
                    src="/assets/flower-ute-white.png"
                    alt=""
                    width={260}
                    height={260}
                    unoptimized
                    className="pointer-events-none absolute -bottom-16 -right-16 z-[1] select-none opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-[0.14] group-hover/card:opacity-[0.14]"
                    aria-hidden="true"
                  />

                  {/* Padded Image Container with aspect-[16/9] (hcmute-website style) */}
                  <div className="relative z-[2] overflow-hidden p-2 sm:p-2.5">
                    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg bg-slate-100">
                      {news.image ? (
                        <Image
                          src={news.image}
                          alt={news.title}
                          fill
                          unoptimized
                          className="object-cover transition-transform duration-500 ease-out will-change-transform group-hover:scale-105 group-hover/card:scale-105"
                          sizes="(max-width: 640px) 85vw, (max-width: 1024px) 350px, 380px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#115eff] to-[#004776]">
                          <span className="text-xl font-bold text-white/30">IEEE SMC</span>
                        </div>
                      )}

                      {/* Category Badge on Bottom-Right of Image — NOT rounded-full (rounded-[var(--radius-sm)]), No shadow, inverts on card hover */}
                      <span className="news-card-badge absolute bottom-2.5 right-2.5 z-10 inline-flex items-center rounded-[var(--radius-sm)] bg-[#115eff] text-white border border-[#115eff]/20 backdrop-blur-xs px-2.5 py-1 text-xs font-semibold leading-normal group-hover:bg-white group-hover:!text-[#115eff] group-hover:border-white group-hover/card:bg-white group-hover/card:!text-[#115eff] group-hover/card:border-white transition-colors duration-200">
                        <span className="leading-normal py-0.5">{news.category}</span>
                      </span>
                    </div>
                  </div>

                  {/* Card Content Area: Title, Date & Views, Summary */}
                  <div className="relative z-[2] flex flex-1 flex-col px-5 pb-5 pt-1 justify-between">
                    <div className="space-y-3">
                      {/* Title: Dark blue-black unhovered, crisp white on hover */}
                      <h3 className="news-card-title line-clamp-2 text-base sm:text-lg font-bold leading-snug text-slate-900 group-hover:!text-white group-hover/card:!text-white transition-colors duration-200">
                        {news.title}
                      </h3>

                      {/* Date Row: Clean typography, no icon */}
                      <div className="news-card-date flex items-center gap-3 text-xs sm:text-sm font-medium text-slate-500 group-hover:!text-white/85 group-hover/card:!text-white/85 transition-colors duration-200">
                        <span>{news.date}</span>
                      </div>

                      {/* Summary text: Slate-600 unhovered, white/80 on hover */}
                      {news.summary && (
                        <p className="news-card-summary line-clamp-2 text-sm text-slate-600 group-hover:!text-white/80 group-hover/card:!text-white/80 leading-relaxed transition-colors duration-200">
                          {news.summary}
                        </p>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal Dialog for Full Story */}
      {selectedNews && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-xl w-full p-6 sm:p-7 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedNews(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Image if available */}
            {selectedNews.image && (
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-slate-100 mb-5">
                <Image
                  src={selectedNews.image}
                  alt={selectedNews.title}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center px-3 py-0.5 bg-blue-50 border border-blue-200 rounded-[var(--radius-sm)] text-xs font-bold uppercase tracking-wider text-[#115eff]">
                {selectedNews.category.toUpperCase()}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs sm:text-sm text-slate-600 font-medium">
                {selectedNews.date}
              </span>
              {selectedNews.viewCount && selectedNews.viewCount > 0 && (
                <>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs sm:text-sm text-slate-600 font-medium">
                    {selectedNews.viewCount.toLocaleString()} views
                  </span>
                </>
              )}
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug mb-4">
              {selectedNews.title}
            </h3>

            <div className="p-4 sm:p-5 bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-base text-slate-700 leading-relaxed space-y-3 mb-6">
              <p>{selectedNews.content}</p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
              <button
                onClick={() => handleShare(selectedNews)}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-[#115eff] px-3.5 py-2 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-600 font-semibold">Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2">
                {selectedNews.externalUrl && (
                  <a
                    href={selectedNews.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-[#115eff] border border-slate-200 text-xs sm:text-sm font-bold rounded-full transition-colors"
                  >
                    <span>View Official Site</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                <button
                  onClick={() => setSelectedNews(null)}
                  className="px-5 py-2 bg-[#115eff] hover:bg-[#0a4de6] text-white text-xs sm:text-sm font-bold rounded-full transition-all shadow-xs cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </SectionContainer>
  );
}

export default NewsList;
