"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ArrowUpRight,
  Calendar,
  Clock,
  Layers,
  MapPin,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { CONFERENCE_INFO } from "@/data/conference";
import { EasyChairIcon } from "@/components/common/ProviderIcons";

interface HeroSlide {
  id: string;
  tabNumber: string;
  tabLabel: string;
  badge: string;
  title: string;
  subtitle: string;
  highlight: string;
  bgImage: string;
  primaryCta: {
    label: string;
    href: string;
    icon?: "easychair" | "map" | "tracks";
  };
  secondaryCta: {
    label: string;
    href: string;
  };
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: "submissions",
    tabNumber: "01",
    tabLabel: "Submissions Open",
    badge: "Call for Papers Active • Submissions Open",
    title: "IEEE SMC 2027",
    subtitle: "2027 IEEE International Conference on Systems, Man, and Cybernetics",
    highlight: "October 10–13, 2027 • Hosted by HCM-UTE, Ho Chi Minh City, Vietnam",
    bgImage: "/images/convention_center.jpg",
    primaryCta: {
      label: "Submit Paper (EasyChair)",
      href: CONFERENCE_INFO.submissionPortal,
      icon: "easychair",
    },
    secondaryCta: {
      label: "Explore 3 Pillars",
      href: "#tracks",
    },
  },
  {
    id: "theme",
    tabNumber: "02",
    tabLabel: "Conference Theme",
    badge: "Guiding Scientific Vision",
    title: "Harmonizing Systems, Humans & AI",
    subtitle: "“Harmonizing Systems, Humans, and Cybernetic Intelligence”",
    highlight: "Advancing Systems Science, Human-Machine Symbiosis, and Cybernetic Intelligence.",
    bgImage: "/images/convention_center.jpg",
    primaryCta: {
      label: "Explore 3 Pillars",
      href: "#tracks",
      icon: "tracks",
    },
    secondaryCta: {
      label: "Call for Papers",
      href: "#cfp",
    },
  },
  {
    id: "venue",
    tabNumber: "03",
    tabLabel: "Host & Venue",
    badge: "Host Campus in Ho Chi Minh City",
    title: "HCM-UTE Convention Center",
    subtitle: "Ho Chi Minh City University of Technology and Education • Thu Duc City, Vietnam",
    highlight: "Pioneering engineering, robotics & AI with a modern 1,200-seat plenary facility.",
    bgImage: "/images/convention_center.jpg",
    primaryCta: {
      label: "Venue & Travel Guide",
      href: "#venue",
      icon: "map",
    },
    secondaryCta: {
      label: "Host University",
      href: "https://hcmute.edu.vn",
    },
  },
  {
    id: "indexing",
    tabNumber: "04",
    tabLabel: "IEEE Xplore Indexing",
    badge: "Publication & Global Indexing",
    title: "Published in IEEE Xplore",
    subtitle: "All accepted & presented papers indexed in Scopus, EI Compendex & Web of Science.",
    highlight: "Selected outstanding papers invited for high-impact IEEE SMC Transactions.",
    bgImage: "/images/convention_center.jpg",
    primaryCta: {
      label: "Author Guidelines",
      href: "#cfp",
      icon: "easychair",
    },
    secondaryCta: {
      label: "Important Dates",
      href: "#dates",
    },
  },
];

export function Hero() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [hcmcTime, setHcmcTime] = useState<string>("");

  // Auto-advance slides every 6.5s when not hovered
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6500);
    return () => clearInterval(interval);
  }, [isPaused]);

  const nextSlide = useCallback(() => {
    setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setActiveSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  }, []);

  // Live HCMC Time Clock (GMT+7)
  useEffect(() => {
    const updateHcmcClock = () => {
      try {
        const now = new Date();
        const formatted = new Intl.DateTimeFormat("en-US", {
          timeZone: "Asia/Ho_Chi_Minh",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }).format(now);
        setHcmcTime(formatted);
      } catch {
        setHcmcTime("GMT+7");
      }
    };

    updateHcmcClock();
    const interval = setInterval(updateHcmcClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const currentSlide = HERO_SLIDES[activeSlide];

  return (
    <section
      className="relative w-full overflow-hidden bg-slate-950 text-white select-none h-[calc(100svh-64px)] max-h-[calc(100svh-64px)] min-h-[520px] lg:h-[calc(100svh-106px)] lg:max-h-[calc(100svh-106px)] lg:min-h-[560px] flex flex-col justify-between"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Full-width Background Cross-Fade Images */}
      {HERO_SLIDES.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === activeSlide ? "opacity-100 z-0" : "opacity-0 pointer-events-none z-0"
          }`}
        >
          <img
            src={slide.bgImage}
            alt={slide.title}
            className="w-full h-full object-cover object-center"
          />
          {/* Translucent overlay: preserves original photo background with clean text contrast */}
          <div className="absolute inset-0 bg-slate-950/45" />
          <div className="absolute inset-0 bg-[#115eff]/15" />
          {/* High-tech engineering corner grid (top-right) and dot (bottom-left) accents */}
          <div className="corner-grid-dark-tr opacity-35" />
          <div className="corner-dot-dark-bl opacity-40" />
        </div>
      ))}

      {/* Content Container aligned with site width and two continuous side borders */}
      <div className="relative z-10 w-full max-w-[1380px] mx-auto px-4 sm:px-8 lg:px-12 h-full flex flex-col grow">
        <div className="border-x border-white/20 h-full flex flex-col grow justify-between">
          
          {/* Top Info Strip */}
          <div className="shrink-0 border-b border-white/20 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-blue-100">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <span className="font-bold text-white bg-white/20 px-2.5 py-0.5 rounded-[0.26rem]">
                IEEE SMC 2027
              </span>
              <span className="text-white/40">•</span>
              <span className="text-white font-semibold">
                HCM-UTE • Ho Chi Minh City, Vietnam
              </span>
            </div>

            <div className="flex items-center gap-3 text-blue-100 flex-wrap">
              <span className="flex items-center gap-1.5 font-medium text-white">
                <Calendar className="w-3.5 h-3.5 text-blue-200" />
                <span>{CONFERENCE_INFO.dates}</span>
              </span>
              {hcmcTime && (
                <>
                  <span className="text-white/40 hidden sm:inline">•</span>
                  <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white/15 border border-white/25 rounded-[0.26rem] font-medium text-white text-xs">
                    <Clock className="w-3 h-3 text-blue-200" />
                    <span>HCMC: {hcmcTime}</span>
                    <span className="text-blue-200 font-semibold">(GMT+7)</span>
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Main Hero Banner: Balanced, Left-Aligned Top Content */}
          <div className="grow px-4 sm:px-6 py-6 sm:py-8 lg:py-10 flex flex-col justify-center">
            
            {/* Left Top Content Block with locked min-height so image/hero height never shifts */}
            <div className="max-w-2xl lg:max-w-3xl flex flex-col items-start justify-center text-left space-y-3.5 sm:space-y-4 min-h-[220px] sm:min-h-[240px] lg:min-h-[260px]">
              
              {/* Category / Status Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-sm border border-white/30 text-xs sm:text-sm text-white font-semibold rounded-full shadow-xs">
                <span className="w-2 h-2 bg-white rounded-full" />
                <span>{currentSlide.badge}</span>
              </div>

              {/* Headings: Balanced, Bold, High-Impact */}
              <div className="space-y-1.5">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-white tracking-tight leading-[1.12] drop-shadow-md">
                  {currentSlide.title}
                </h1>

                <p className="text-base sm:text-lg lg:text-xl font-semibold text-blue-100 leading-snug drop-shadow-sm">
                  {currentSlide.subtitle}
                </p>
              </div>

              {/* Concise Highlight Line - Just one crisp sentence */}
              <p className="text-sm sm:text-base lg:text-lg text-white/90 leading-normal max-w-2xl drop-shadow-sm font-normal">
                {currentSlide.highlight}
              </p>

              {/* Balanced Prominent Action Buttons */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <a
                  href={currentSlide.primaryCta.href}
                  target={currentSlide.primaryCta.href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 min-h-[48px] sm:min-h-[52px] px-6 sm:px-8 py-3 bg-white hover:bg-blue-50 text-[#115eff] font-bold text-sm sm:text-base rounded-[0.26rem] transition-all shadow-md hover:shadow-lg group"
                >
                  {currentSlide.primaryCta.icon === "easychair" && (
                    <EasyChairIcon className="w-4.5 h-4.5 text-[#115eff] shrink-0" />
                  )}
                  {currentSlide.primaryCta.icon === "tracks" && (
                    <Layers className="w-4.5 h-4.5 text-[#115eff] shrink-0" />
                  )}
                  {currentSlide.primaryCta.icon === "map" && (
                    <MapPin className="w-4.5 h-4.5 text-[#115eff] shrink-0" />
                  )}
                  <span>{currentSlide.primaryCta.label}</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>

                <a
                  href={currentSlide.secondaryCta.href}
                  className="inline-flex items-center justify-center min-h-[48px] sm:min-h-[52px] px-6 py-3 bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/30 text-white font-semibold text-sm sm:text-base rounded-[0.26rem] transition-colors shadow-xs"
                >
                  <span>{currentSlide.secondaryCta.label}</span>
                </a>
              </div>

            </div>

          </div>

          {/* Carousel Navigation Strip at Bottom */}
          <div className="shrink-0 border-t border-white/20 px-4 sm:px-6 py-3 sm:py-3.5 flex flex-wrap items-center justify-between gap-3">
            
            {/* Numeric Slide Indicator Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5">
              {HERO_SLIDES.map((slide, index) => {
                const isActive = index === activeSlide;
                return (
                  <button
                    key={slide.id}
                    onClick={() => setActiveSlide(index)}
                    className={`px-3 py-1.5 rounded-[0.26rem] text-left transition-all flex items-center gap-2 ${
                      isActive
                        ? "bg-white text-[#115eff] font-bold shadow-md"
                        : "bg-white/15 hover:bg-white/25 text-white font-medium"
                    }`}
                  >
                    <span className="text-xs sm:text-sm font-black">{slide.tabNumber}</span>
                    <span className="text-xs sm:text-sm hidden md:inline">{slide.tabLabel}</span>
                  </button>
                );
              })}
            </div>

            {/* Prev / Next Arrows */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={prevSlide}
                aria-label="Previous Slide"
                className="w-9 h-9 bg-white/20 hover:bg-white hover:text-[#115eff] text-white rounded-[0.26rem] flex items-center justify-center transition-all shadow-xs"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={nextSlide}
                aria-label="Next Slide"
                className="w-9 h-9 bg-white/20 hover:bg-white hover:text-[#115eff] text-white rounded-[0.26rem] flex items-center justify-center transition-all shadow-xs"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}




