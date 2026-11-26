"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
} from "lucide-react";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { GridPattern } from "@/components/ui/grid-pattern";
import { CarouselNavButton } from "@/components/ui/CarouselNavButton";
import { cn } from "@/lib/utils";
import { POSTS_SYNC_CHANNEL } from "@/lib/post-sync";
import { subItemAttr } from "@/modules/website-builder/utils/sub-item-path";

import { DEFAULT_NEWS_ITEMS, getNewsDetailUrl, type NewsItem } from "@/data/news-data";
export { DEFAULT_NEWS_ITEMS, getNewsDetailUrl, type NewsItem };

export interface NewsListProps {
  title?: string;
  subtitle?: string;
  items?: NewsItem[];
}

export function NewsList({
  title = "Conference News & Announcements",
  subtitle = "Stay updated with the latest milestones, partnership alerts, and program schedules",
  items: itemsProp,
}: NewsListProps) {
  const router = useRouter();
  const hasExplicitItems = itemsProp !== undefined;
  const [fetchedItems, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(() => !hasExplicitItems);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const items = useMemo(
    () =>
      hasExplicitItems
        ? Array.isArray(itemsProp)
          ? itemsProp
          : []
        : fetchedItems,
    [hasExplicitItems, itemsProp, fetchedItems]
  );
  const isLoading = !hasExplicitItems && loading;

  useEffect(() => {
    if (hasExplicitItems) return;
    let isMounted = true;

    const loadPosts = async () => {
      try {
        const res = await fetch("/api/posts", { cache: "no-store" });
        const data = await res.json();
        if (isMounted && data?.success && Array.isArray(data.posts)) {
          const mapped: NewsItem[] = data.posts.map(
            (p: {
              id: string;
              title: string;
              publishedAt?: string | null;
              createdAt: string;
              category?: string | null;
              summary?: string | null;
              content: string;
              coverImage?: string | null;
              views?: number;
              slug?: string;
            }) => {
              const dateObj = new Date(p.publishedAt || p.createdAt);
              const day = String(dateObj.getDate()).padStart(2, "0");
              const month = String(dateObj.getMonth() + 1).padStart(2, "0");
              const year = String(dateObj.getFullYear());
              return {
                id: p.id,
                title: p.title,
                date: `${day}/${month}/${year}`,
                day,
                month,
                year,
                category: p.category || "Announcements",
                summary: p.summary || p.title,
                content: p.content,
                image: p.coverImage || "/news/keynote-hoi-thao.jpg",
                viewCount: p.views || 0,
                externalUrl: p.slug ? `#${p.slug}` : undefined,
                slug: p.slug || p.id,
              };
            }
          );
          setItems(mapped);
        }
      } catch (err) {
        console.error("Failed to load live news posts:", err);
        if (isMounted) {
          setItems((prev) => (prev.length > 0 ? prev : DEFAULT_NEWS_ITEMS));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadPosts();

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void loadPosts();
      }
    }, 6000);

    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === "visible") {
        void loadPosts();
      }
    };

    window.addEventListener("focus", handleVisibilityOrFocus);
    document.addEventListener("visibilitychange", handleVisibilityOrFocus);

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel(POSTS_SYNC_CHANNEL);
      channel.onmessage = () => {
        void loadPosts();
      };
    } catch {
      // BroadcastChannel unavailable
    }

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleVisibilityOrFocus);
      document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
      if (channel) channel.close();
    };
  }, [hasExplicitItems]);

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
    const indexed = items.map((item, origIdx) => ({ item, origIdx }));
    const result = indexed.filter(({ item }) => {
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
        `${a.item.year}-${a.item.month.padStart(2, "0")}-${a.item.day.padStart(2, "0")}`
      ).getTime();
      const timeB = new Date(
        `${b.item.year}-${b.item.month.padStart(2, "0")}-${b.item.day.padStart(2, "0")}`
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

  return (
    <SectionContainer id="news" fullWidthBg="bg-white">
      {/* Section Header matching standard HCMUTE 2-line headline style (No divider or badge) */}
      <div className="relative overflow-hidden px-4 sm:px-6 pt-10 sm:pt-14 pb-4 sm:pb-6 w-full">
        <div className="corner-dot-tr opacity-75 pointer-events-none" />

        <div className="space-y-3 relative z-10 w-full">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight leading-[1.2] w-full">
            {title.includes("&") ? (
              <>
                <span className="block text-[#004776]">{title.split("&")[0].trim()}</span>
                <span className="block text-[#115eff]">& {title.split("&").slice(1).join("&").trim()}</span>
              </>
            ) : (
              <span className="block text-[#004776]">{title}</span>
            )}
          </h2>
          <p className="text-sm sm:text-base lg:text-[17px] text-[#004776]/80 font-medium">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Controls Container: Full Width Search + Draggable Fade Categories */}
      <div className="px-4 sm:px-6 space-y-4 w-full">
        {/* Full Width Search Bar — Rounded-full matching HCM-UTE */}
        <div className="relative w-full">
          <Search className="w-4.5 h-4.5 text-slate-400 absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search news, announcements, tracks, speakers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 sm:pl-13 pr-11 py-3 bg-slate-50/80 hover:bg-slate-100/70 focus:bg-white border border-border hover:border-primary/40 focus:border-primary rounded-full text-sm sm:text-base text-foreground placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/15 transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Badges: Solid Blue Hover matching HCM-UTE */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Fixed "All" badge */}
          <button
            type="button"
            onClick={() => handleCategorySelect("All")}
            className={cn(
              "shrink-0 rounded-lg px-3.5 py-1.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer select-none border",
              activeCategory === "All"
                ? "bg-primary text-primary-foreground border-primary shadow-xs"
                : "bg-white text-foreground border-border/80 hover:bg-primary hover:text-primary-foreground hover:border-primary"
            )}
          >
            All
          </button>

          {/* Separator */}
          <div className="h-6 w-px shrink-0 bg-border" />

          {/* Scrollable category badges with two-side fade + chevron */}
          <div className="relative min-w-0 flex-1 overflow-hidden">
            <div
              className={cn(
                "pointer-events-none absolute inset-y-0 left-0 z-10 w-8 sm:w-12 bg-gradient-to-r from-background to-transparent transition-opacity duration-300",
                canScrollCatLeft ? "opacity-100" : "opacity-0"
              )}
            />
            {canScrollCatLeft && (
              <button
                type="button"
                onClick={() => scrollCategories("left")}
                className="absolute left-1 top-1/2 z-20 -translate-y-1/2 hidden sm:flex size-7 items-center justify-center rounded-full border border-border bg-white/95 backdrop-blur-xs shadow-md transition-all hover:scale-105 hover:border-primary/50 cursor-pointer"
                aria-label="Scroll left"
              >
                <ChevronLeft className="size-3.5 text-primary" />
              </button>
            )}

            <div
              className={cn(
                "pointer-events-none absolute inset-y-0 right-0 z-10 w-8 sm:w-12 bg-gradient-to-l from-background to-transparent transition-opacity duration-300",
                canScrollCatRight ? "opacity-100" : "opacity-0"
              )}
            />
            {canScrollCatRight && (
              <button
                type="button"
                onClick={() => scrollCategories("right")}
                className="absolute right-1 top-1/2 z-20 -translate-y-1/2 hidden sm:flex size-7 items-center justify-center rounded-full border border-border bg-white/95 backdrop-blur-xs shadow-md transition-all hover:scale-105 hover:border-primary/50 cursor-pointer"
                aria-label="Scroll right"
              >
                <ChevronRight className="size-3.5 text-primary" />
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
                    "shrink-0 whitespace-nowrap rounded-lg px-3.5 py-1.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer border",
                    activeCategory === cat
                      ? "bg-primary text-primary-foreground border-primary shadow-xs"
                      : "bg-white text-foreground border-border/80 hover:bg-primary hover:text-primary-foreground hover:border-primary"
                  )}
                >
                  {cat}
                </button>
              ))}

              {canScrollCatRight && <div className="shrink-0 w-6" />}
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* NEWS CAROUSEL with Progressive Blur & Left/Right Chevrons     */}
      {/* ------------------------------------------------------------- */}
      <div className="relative w-full pt-1.5 sm:pt-2 pb-10 sm:pb-14 group/carousel">
        {isLoading ? (
          <div className="mx-4 sm:mx-6 p-12 text-center bg-blue-50/35 border border-blue-100/90 rounded-sm text-slate-500 text-sm sm:text-base">
            Loading published announcements...
          </div>
        ) : filteredAndSortedItems.length === 0 ? (
          <div className="mx-4 sm:mx-6 p-12 text-center bg-blue-50/35 border border-blue-100/90 rounded-sm text-slate-600 text-sm sm:text-base">
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
                className="border-blue-100/90 bg-white/95 backdrop-blur-xs hover:border-[#115eff]"
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
                className="border-blue-100/90 bg-white/95 backdrop-blur-xs hover:border-[#115eff]"
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
            >
              {filteredAndSortedItems.map(({ item: news, origIdx }) => {
                const detailUrl = getNewsDetailUrl(news);

                return (
                  <article
                    key={news.id}
                    {...(hasExplicitItems ? subItemAttr(["items", origIdx]) : {})}
                    onClick={() => {
                      if (hasDraggedCards.current) return;
                      router.push(detailUrl);
                    }}
                    className="w-[82vw] max-w-[340px] sm:w-[340px] lg:w-[370px] shrink-0 group/card relative flex flex-col overflow-hidden rounded-xl bg-background border border-border/80 ring-1 ring-border/50 transition-all duration-300 ease-out hover:border-primary hover:bg-primary hover:shadow-xl cursor-pointer select-none"
                  >
                    {/* Grid pattern — visible on hover at bottom right (Exact HCM-UTE PostCard) */}
                    <GridPattern
                      width={32}
                      height={32}
                      className="pointer-events-none absolute inset-0 z-[1] stroke-primary-foreground/0 fill-transparent transition-colors duration-200 group-hover/card:stroke-primary-foreground/[0.08] [mask-image:radial-gradient(ellipse_75%_65%_at_bottom_right,white_40%,transparent_100%)]"
                    />

                    {/* UTE Flower watermark — appears subtle at bottom right on hover */}
                    <Image
                      src="/assets/flower-ute-white.png"
                      alt=""
                      width={260}
                      height={260}
                      unoptimized
                      className="pointer-events-none absolute -bottom-16 -right-16 z-[1] select-none opacity-0 transition-opacity duration-200 ease-out group-hover/card:opacity-[0.14]"
                      aria-hidden="true"
                    />

                    {/* Padded Image Container with aspect-[16/10] & bottom-right Category Badge (Exact HCM-UTE PostCard) */}
                    <div className="relative z-[2] overflow-hidden p-2">
                      <Link
                        href={detailUrl}
                        onClick={(e) => {
                          if (hasDraggedCards.current) e.preventDefault();
                        }}
                        className="block relative aspect-[16/10] w-full overflow-hidden rounded-sm bg-slate-100"
                      >
                        {news.image ? (
                          <Image
                            src={news.image}
                            alt={news.title}
                            fill
                            unoptimized
                            className="object-cover transition-transform duration-200 will-change-transform group-hover/card:scale-[1.03]"
                            sizes="(max-width: 640px) 85vw, (max-width: 1024px) 350px, 380px"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary to-[#004776]">
                            <span className="text-xl font-bold text-white/30">IEEE SMC</span>
                          </div>
                        )}
                        {news.category && (
                          <span className="absolute bottom-2.5 right-2.5 z-10 inline-flex items-center rounded-[var(--radius-sm)] bg-primary text-white px-3 py-1 text-xs font-semibold leading-normal shadow-xs border border-primary/20 group-hover/card:bg-white group-hover/card:text-primary group-hover/card:border-white transition-colors duration-200">
                            {news.category}
                          </span>
                        )}
                      </Link>
                    </div>

                    {/* Card Content Area: Title, Calendar Date, and Summary (Exact HCM-UTE PostCard) */}
                    <div className="relative z-[2] flex flex-1 flex-col px-5 pb-5 pt-1">
                      <Link
                        href={detailUrl}
                        onClick={(e) => {
                          if (hasDraggedCards.current) e.preventDefault();
                        }}
                        className="block"
                      >
                        <h3 className="line-clamp-2 text-base font-semibold tracking-tight text-foreground transition-colors duration-200 group-hover/card:text-primary-foreground">
                          {news.title}
                        </h3>
                      </Link>

                      <div className="mt-2 flex items-center gap-2 text-xs sm:text-sm font-medium text-muted-foreground group-hover/card:text-primary-foreground/85 transition-colors duration-200 [&_svg]:transition-colors [&_svg]:duration-200 group-hover/card:[&_svg]:text-white">
                        <CalendarDays className="size-3.5 sm:size-4" />
                        <span>{news.date}</span>
                      </div>

                      {news.summary && (
                        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground transition-colors duration-200 group-hover/card:text-primary-foreground/80">
                          {news.summary}
                        </p>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </SectionContainer>
  );
}

export default NewsList;
