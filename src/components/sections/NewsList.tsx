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
  category: "Partnership" | "Program" | "Deadline" | "Keynote" | "Announcement" | string;
  summary: string;
  content: string;
  image?: string;
  viewCount?: number;
  externalUrl?: string;
}

export const DEFAULT_NEWS_ITEMS: NewsItem[] = [
  {
    id: "news-cfp-2027",
    title: "IEEE SMC 2027 Call for Papers Officially Released – Human-AI Symbiosis",
    date: "01/15/2027",
    day: "15",
    month: "01",
    year: "2027",
    category: "Call for Papers",
    summary: "The IEEE SMC 2027 Organizing Committee has published the official Call for Papers under the theme Human-AI Symbiosis: Engineering Intelligent, Autonomous, and Sustainable Futures.",
    content: "Hosted by Ho Chi Minh City University of Technology and Engineering-Vietnam (HCM-UTE), the 2027 IEEE International Conference on Systems, Man, and Cybernetics (IEEE SMC 2027) will take place October 6–10, 2027 at the Sheraton Saigon Grand Opera Hotel in Ho Chi Minh City, Vietnam. Submissions across Systems Science & Engineering (SSE), Cybernetics (CYB), and Human-Machine Systems (HMS) are now invited.",
    image: "/news/hoi-thao-ute.jpg",
    viewCount: 3420,
    externalUrl: "#cfp",
  },
  {
    id: "news-proposals-deadline",
    title: "Call for Special Sessions, Tutorials and Workshops Proposals Due February 15, 2027",
    date: "01/25/2027",
    day: "25",
    month: "01",
    year: "2027",
    category: "Special Sessions",
    summary: "Proposals for organized Special Sessions, technical Tutorials, and Workshops are now being accepted through February 15, 2027.",
    content: "Researchers and industry pioneers are invited to submit proposals for Special Sessions, Tutorials, and Workshops for IEEE SMC 2027. Formal notification of accepted proposals will be announced on March 04, 2027.",
    image: "/news/top-50.jpg",
    viewCount: 2150,
    externalUrl: "#dates",
  },
  {
    id: "news-paper-submission-deadline",
    title: "Paper Submission Deadline for Workshops, Regular and Special Sessions: April 08, 2027",
    date: "02/05/2027",
    day: "05",
    month: "02",
    year: "2027",
    category: "Deadline",
    summary: "Full paper submissions for IEEE SMC 2027 Regular, Special Sessions, and Workshops are due on April 08, 2027.",
    content: "All submissions must be in English. The full papers are to be submitted electronically in PDF format via the PaperCept submission system link. Accepted and presented papers will be eligible for inclusion in the IEEE Xplore® Digital Library.",
    image: "/news/aun.jpg",
    viewCount: 4890,
    externalUrl: "#dates",
  },
  {
    id: "news-venue-sheraton",
    title: "Sheraton Saigon Grand Opera Hotel Confirmed as Official Conference Headquarters",
    date: "02/15/2027",
    day: "15",
    month: "02",
    year: "2027",
    category: "Announcement",
    summary: "IEEE SMC 2027 delegates will experience five memorable days in District 1, Ho Chi Minh City at the prestigious Sheraton Saigon Grand Opera Hotel.",
    content: "Located at No. 88 Dong Khoi, Saigon Ward, District 1, the venue is situated in the cultural and business heart of Saigon, steps from historical landmarks, the Saigon Opera House, and Metro Line 1.",
    image: "/images/sheraton-saigon-card.jpg",
    viewCount: 2980,
    externalUrl: "#venue",
  },
  {
    id: "news-visa-portal",
    title: "Official Vietnam Electronic Visa (e-Visa) Application Portal Guide for Attendees",
    date: "02/28/2027",
    day: "28",
    month: "02",
    year: "2027",
    category: "Announcement",
    summary: "International attendees can apply directly for official 90-day Vietnam electronic visas online at evisa.gov.vn.",
    content: "The organizing committee has published official visa guidance for international attendees. Citizens of all countries can apply for electronic visas directly through the official Vietnam government visa portal at https://evisa.gov.vn.",
    image: "/assets/3d/visa-travel-3d.png",
    viewCount: 3120,
    externalUrl: "https://evisa.gov.vn",
  },
  {
    id: "news-technical-pillars",
    title: "IEEE SMC 2027 Unveils 68+ Technical Tracks Across SSE, CYB, and HMS",
    date: "03/10/2027",
    day: "10",
    month: "03",
    year: "2027",
    category: "Program",
    summary: "Explore the comprehensive technical scope spanning autonomous bionic robotics, quantum cybernetics, and brain-machine interface systems.",
    content: "The 2027 technical program includes three core pillars: Systems Science & Engineering (27 topics), Cybernetics (28 topics), and Human-Machine Systems (14 topics), addressing cutting-edge artificial intelligence, human-AI symbiosis, and trustworthy autonomous systems.",
    image: "/news/4.0-tech.jpg",
    viewCount: 2740,
    externalUrl: "#tracks",
  },
  {
    id: "news-industry-partnerships",
    title: "Call for Industry Exhibition & Partnership Sponsorships Open for IEEE SMC 2027",
    date: "03/20/2027",
    day: "20",
    month: "03",
    year: "2027",
    category: "Partnership",
    summary: "Leading technology enterprises, robotics developers, and academic institutions are invited to participate as conference partners.",
    content: "IEEE SMC 2027 offers premier exhibition booths, industrial demonstration tracks, and diamond/platinum/gold sponsorship packages at the Sheraton Saigon Grand Opera Hotel in Ho Chi Minh City.",
    image: "/news/giai-nha-robot.jpeg",
    viewCount: 1640,
    externalUrl: "#contact",
  },
  {
    id: "news-host-hcmute",
    title: "HCM-UTE to Host IEEE SMC 2027 – Vietnam's Premier Systems & AI Gathering",
    date: "04/01/2027",
    day: "01",
    month: "04",
    year: "2027",
    category: "Announcement",
    summary: "HCM-UTE welcomes the international systems, cybernetics, and human-machine systems community to Ho Chi Minh City on October 6–10, 2027.",
    content: "With over six decades of leadership in engineering and technological education, Ho Chi Minh City University of Technology and Engineering (HCM-UTE) is honored to host the flagship annual conference of the IEEE Systems, Man, and Cybernetics Society.",
    image: "/news/vina-ute.png",
    viewCount: 3820,
    externalUrl: "#welcome",
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

  // Scrollable categories (excluding "All" which is pinned to the left)
  const categories = useMemo(() => {
    const base = [
      "Partnership",
      "Program",
      "Deadline",
      "Keynote",
      "Call for Papers",
      "Workshops",
      "Special Sessions",
      "Announcements",
    ];
    const fromItems = items.map((i) => i.category).filter(Boolean);
    return Array.from(new Set([...base, ...fromItems])).filter((c) => c !== "All");
  }, [items]);

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
    if (el) {
      el.addEventListener("scroll", checkCategoryScroll, { passive: true });
      window.addEventListener("resize", checkCategoryScroll);
    }
    return () => {
      el?.removeEventListener("scroll", checkCategoryScroll);
      window.removeEventListener("resize", checkCategoryScroll);
    };
  }, [checkCategoryScroll, categories]);

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
    if (Math.abs(deltaX) > 15) {
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
    categoryScrollRef.current?.scrollBy({
      left: dir === "left" ? -240 : 240,
      behavior: "smooth",
    });
  };

  const handleCategorySelect = useCallback((cat: string) => {
    if (hasDraggedCat.current) return;
    setActiveCategory(cat);
  }, []);

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
            className="w-full pl-12 sm:pl-14 pr-12 py-3 sm:py-3.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 hover:border-slate-300 focus:border-[#115eff] !rounded-full text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-3 focus:ring-[#115eff]/10 transition-all shadow-2xs"
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

        {/* Category Badges: Exact pattern from http://localhost:3000/bai-viet */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Fixed "All" badge */}
          <button
            type="button"
            onClick={() => handleCategorySelect("All")}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer select-none",
              activeCategory === "All"
                ? "bg-primary text-white shadow-xs"
                : "bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100 dark:bg-card dark:border-border dark:text-muted-foreground dark:hover:bg-muted"
            )}
          >
            All
          </button>

          {/* Separator */}
          <div className="h-6 w-px shrink-0 bg-neutral-200 dark:bg-border" />

          {/* Scrollable category badges with two-side fade + chevron */}
          <div className="relative min-w-0 flex-1 overflow-hidden">
            {/* Left fade — exact same pure gradient as http://localhost:3000/bai-viet */}
            <div
              className={cn(
                "pointer-events-none absolute inset-y-0 left-0 z-10 w-8 sm:w-12 bg-gradient-to-r from-background to-transparent transition-opacity duration-300",
                canScrollCatLeft ? "opacity-100" : "opacity-0"
              )}
            />
            {/* Left chevron */}
            {canScrollCatLeft && (
              <button
                type="button"
                onClick={() => scrollCategories("left")}
                className="absolute left-1 top-1/2 z-20 -translate-y-1/2 hidden sm:flex size-7 items-center justify-center rounded-full border border-neutral-200 bg-white/95 backdrop-blur-xs shadow-md transition-all hover:scale-105 hover:shadow-lg cursor-pointer dark:bg-card dark:border-border"
                aria-label="Scroll left"
              >
                <ChevronLeft className="size-3.5 text-foreground/80" />
              </button>
            )}

            {/* Right fade — exact same pure gradient as http://localhost:3000/bai-viet */}
            <div
              className={cn(
                "pointer-events-none absolute inset-y-0 right-0 z-10 w-8 sm:w-12 bg-gradient-to-l from-background to-transparent transition-opacity duration-300",
                canScrollCatRight ? "opacity-100" : "opacity-0"
              )}
            />
            {/* Right chevron */}
            {canScrollCatRight && (
              <button
                type="button"
                onClick={() => scrollCategories("right")}
                className="absolute right-1 top-1/2 z-20 -translate-y-1/2 hidden sm:flex size-7 items-center justify-center rounded-full border border-neutral-200 bg-white/95 backdrop-blur-xs shadow-md transition-all hover:scale-105 hover:shadow-lg cursor-pointer dark:bg-card dark:border-border"
                aria-label="Scroll right"
              >
                <ChevronRight className="size-3.5 text-foreground/80" />
              </button>
            )}

            <div
              ref={categoryScrollRef}
              className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 px-0.5 cursor-grab active:cursor-grabbing select-none touch-pan-x"
              onPointerDown={onCatPointerDown}
              onPointerMove={onCatPointerMove}
              onPointerUp={onCatPointerUp}
              onPointerCancel={onCatPointerUp}
            >
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategorySelect(activeCategory === cat ? "All" : cat)}
                  className={cn(
                    "shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer",
                    activeCategory === cat
                      ? "bg-primary text-white shadow-xs"
                      : "bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100 dark:bg-card dark:border-border dark:text-muted-foreground dark:hover:bg-muted"
                  )}
                >
                  {cat}
                </button>
              ))}

              {/* Spacer so fade doesn't cover last badge */}
              {canScrollCatRight && <div className="shrink-0 w-6" />}
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* NEWS CAROUSEL with Progressive Blur & Left/Right Chevrons     */}
      {/* ------------------------------------------------------------- */}
      <div className="relative w-full pt-1.5 sm:pt-2 pb-10 sm:pb-14 group/carousel">
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
              <span className="inline-flex items-center px-2.5 py-0.5 bg-blue-50 border border-blue-200 rounded-full text-xs font-semibold text-[#115eff]">
                {selectedNews.category}
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
