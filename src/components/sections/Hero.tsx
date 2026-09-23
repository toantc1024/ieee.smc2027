"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ArrowUpRight,
  Layers,
  MapPin,
  ChevronLeft,
  ChevronRight,
  FileDown,
} from "lucide-react";
import { CONFERENCE_INFO } from "@/data/conference";
import { PaperCeptIcon } from "@/components/common/ProviderIcons";

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
    icon?: "papercept" | "map" | "tracks" | "download";
  };
  secondaryCta: {
    label: string;
    href: string;
    isExternal?: boolean;
  };
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: "submissions",
    tabNumber: "01",
    tabLabel: "Call for Papers",
    badge: "Official CFP • Submissions via PaperCept",
    title: "IEEE SMC 2027",
    subtitle: "The 2027 IEEE International Conference on Systems, Man, and Cybernetics",
    highlight: "October 6–10, 2027 • Hosted by Ho Chi Minh City University of Technology and Engineering-Vietnam",
    bgImage: "/images/convention_center.jpg",
    primaryCta: {
      label: "Call for Papers (PaperCept)",
      href: "#cfp",
      icon: "papercept",
    },
    secondaryCta: {
      label: "Download CFP (PDF)",
      href: CONFERENCE_INFO.cfpPdfUrl,
      isExternal: true,
    },
  },
  {
    id: "theme",
    tabNumber: "02",
    tabLabel: "Conference Theme",
    badge: "Official Conference Theme",
    title: "Human-AI Symbiosis",
    subtitle: "“Engineering Intelligent, Autonomous, and Sustainable Futures”",
    highlight: "Cutting-edge advances in AI, robotics, digital twins, cyber-physical systems, and trustworthy AI.",
    bgImage: "/images/convention_center.jpg",
    primaryCta: {
      label: "Explore 3 Pillars (68+ Topics)",
      href: "#tracks",
      icon: "tracks",
    },
    secondaryCta: {
      label: "Important Dates",
      href: "#dates",
    },
  },
  {
    id: "venue",
    tabNumber: "03",
    tabLabel: "Venue & Destination",
    badge: "Official Conference Venue",
    title: "Sheraton Saigon Grand Opera Hotel",
    subtitle: "No. 88 Dong Khoi, Saigon Ward, Ho Chi Minh City, Vietnam",
    highlight: "Premier 5-star venue on historic Dong Khoi Street in central Ho Chi Minh City, hosted by HCM-UTE.",
    bgImage: "/images/convention_center.jpg",
    primaryCta: {
      label: "Venue & Travel Guide",
      href: "#venue",
      icon: "map",
    },
    secondaryCta: {
      label: "Vietnam e-Visa Portal",
      href: CONFERENCE_INFO.visaUrl,
      isExternal: true,
    },
  },
  {
    id: "indexing",
    tabNumber: "04",
    tabLabel: "IEEE Xplore® Indexing",
    badge: "Publication & Review Standards",
    title: "Published in IEEE Xplore®",
    subtitle: "Proceedings eligible for IEEE Xplore® Digital Library inclusion upon quality review.",
    highlight: "Indexed in Scopus, EI Compendex, and Web of Science following presentation.",
    bgImage: "/images/convention_center.jpg",
    primaryCta: {
      label: "Author Guidelines",
      href: "#cfp",
      icon: "papercept",
    },
    secondaryCta: {
      label: "April 08 Deadline",
      href: "#dates",
    },
  },
];

export function Hero() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

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

  const currentSlide = HERO_SLIDES[activeSlide];

  return (
    <section
      className="relative w-full overflow-hidden bg-slate-950 text-white h-[calc(100svh-64px)] max-h-[calc(100svh-64px)] min-h-[520px] lg:h-[calc(100svh-106px)] lg:max-h-[calc(100svh-106px)] lg:min-h-[560px] flex flex-col justify-between border-b border-white/20"
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
          {/* High-tech engineering dot (bottom-left) accent */}
          <div className="corner-dot-dark-bl opacity-40" />
        </div>
      ))}

      {/* Content Container aligned with site width and two continuous side borders */}
      <div className="relative z-10 w-full max-w-[1380px] mx-auto px-4 sm:px-8 lg:px-12 h-full flex flex-col grow">
        <div className="border-x border-white/20 h-full flex flex-col grow justify-center relative">
          {/* Main Hero Banner: Balanced, Left-Aligned Content */}
          <div className="px-4 sm:px-6 py-8 sm:py-12 lg:py-16 flex flex-col justify-center">
            
            {/* Left Top Content Block with locked min-height */}
            <div className="max-w-2xl lg:max-w-3xl flex flex-col items-start justify-center text-left space-y-3.5 sm:space-y-4 min-h-[200px] sm:min-h-[220px] lg:min-h-[240px]">
              {/* Headings: Balanced, Bold, High-Impact */}
              <div className="space-y-1.5">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-white tracking-tight leading-[1.12] drop-shadow-md">
                  {currentSlide.title}
                </h1>

                <p className="text-base sm:text-lg lg:text-xl font-semibold text-blue-100 leading-snug drop-shadow-sm">
                  {currentSlide.subtitle}
                </p>
              </div>

              {/* Concise Highlight Line */}
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
                  {currentSlide.primaryCta.icon === "papercept" && (
                    <PaperCeptIcon className="w-4.5 h-4.5 text-[#115eff] shrink-0" />
                  )}
                  {currentSlide.primaryCta.icon === "tracks" && (
                    <Layers className="w-4.5 h-4.5 text-[#115eff] shrink-0" />
                  )}
                  {currentSlide.primaryCta.icon === "map" && (
                    <MapPin className="w-4.5 h-4.5 text-[#115eff] shrink-0" />
                  )}
                  {currentSlide.primaryCta.icon === "download" && (
                    <FileDown className="w-4.5 h-4.5 text-[#115eff] shrink-0" />
                  )}
                  <span>{currentSlide.primaryCta.label}</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>

                <a
                  href={currentSlide.secondaryCta.href}
                  target={currentSlide.secondaryCta.isExternal ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center min-h-[48px] sm:min-h-[52px] px-6 py-3 bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/30 text-white font-semibold text-sm sm:text-base rounded-[0.26rem] transition-colors shadow-xs gap-1.5"
                >
                  <span>{currentSlide.secondaryCta.label}</span>
                  {currentSlide.secondaryCta.isExternal && <ArrowUpRight className="w-3.5 h-3.5 opacity-70" />}
                </a>
              </div>

            </div>

          </div>

          {/* Floating Slide Controls (No bottom line, no indicator) */}
          <div className="absolute bottom-6 right-4 sm:right-6 flex items-center gap-2 z-20">
            <button
              type="button"
              onClick={prevSlide}
              aria-label="Previous Slide"
              className="w-9 h-9 bg-white/15 hover:bg-white hover:text-[#115eff] text-white rounded-[0.26rem] flex items-center justify-center transition-all shadow-xs backdrop-blur-xs cursor-pointer border border-white/20"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={nextSlide}
              aria-label="Next Slide"
              className="w-9 h-9 bg-white/15 hover:bg-white hover:text-[#115eff] text-white rounded-[0.26rem] flex items-center justify-center transition-all shadow-xs backdrop-blur-xs cursor-pointer border border-white/20"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}
