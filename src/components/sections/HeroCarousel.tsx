"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { gsap } from "gsap";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

const FLOWER_WHITE = "/assets/flower-ute-white.png";

export interface CarouselSlide {
  id: number | string;
  title: string;
  subtitle?: string;
  highlight?: string;
  badge?: string;
  image: string;
  mobileImage?: string;
  primaryAction?: {
    label: string;
    href: string;
  };
  secondaryAction?: {
    label: string;
    href: string;
  };
}

export const DEFAULT_CAROUSEL_SLIDES: CarouselSlide[] = [
  {
    id: 1,
    badge: "Flagship IEEE Global Conference",
    title: "IEEE SMC 2027",
    highlight: "Human-AI Symbiosis",
    subtitle: "2027 IEEE International Conference on Systems, Man, and Cybernetics • October 6–10, 2027",
    image: "/carousel/slide-1-desktop.jpg",
    mobileImage: "/carousel/slide-1-mobile.jpg",
    primaryAction: {
      label: "Call for Papers",
      href: "#cfp",
    },
    secondaryAction: {
      label: "Download CFP (PDF)",
      href: "/CFP - IEEE SMC 2027.pdf",
    },
  },
  {
    id: 2,
    badge: "October 6–10, 2027 • Ho Chi Minh City",
    title: "Call for Papers & 3 Core Pillars",
    highlight: "68 Technical Topics Across 3 Pillars",
    subtitle: "Systems Science & Engineering • Cybernetics • Human-Machine Systems",
    image: "/carousel/slide-2-desktop.jpg",
    mobileImage: "/carousel/slide-2-mobile.jpg",
    primaryAction: {
      label: "Explore Research Tracks",
      href: "#tracks",
    },
    secondaryAction: {
      label: "Important Dates",
      href: "#dates",
    },
  },
  {
    id: 3,
    badge: "Sheraton Saigon Grand Opera Hotel",
    title: "Welcome to Ho Chi Minh City, Vietnam",
    highlight: "Hosted by HCM-UTE",
    subtitle: "Co-organized by Ho Chi Minh City University of Technology and Engineering & IEEE SMC Society",
    image: "/carousel/slide-3-desktop.jpg",
    mobileImage: "/carousel/slide-3-mobile.jpg",
    primaryAction: {
      label: "Venue & Destination Guide",
      href: "#venue",
    },
    secondaryAction: {
      label: "Organizing Committee",
      href: "#committee",
    },
  },
];

const DEFAULT_AUTOPLAY_DURATION = 7; // seconds

export interface HeroCarouselProps {
  slides?: CarouselSlide[];
  autoplayDuration?: number;
  showOverlayText?: boolean;
  showIndicators?: boolean;
  className?: string;
}

export function HeroCarousel({
  slides: slidesProp,
  autoplayDuration = DEFAULT_AUTOPLAY_DURATION,
  showOverlayText = false,
  showIndicators = false,
  className,
}: HeroCarouselProps = {}) {
  const slides = slidesProp?.length ? slidesProp : DEFAULT_CAROUSEL_SLIDES;
  const duration = autoplayDuration;

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLElement>(null);
  const isAnimating = useRef(false);
  const autoplayTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Touch swipe
  const touchStartRef = useRef<{ x: number; time: number } | null>(null);

  const animateToSlide = useCallback(
    (nextIndex: number) => {
      if (isAnimating.current || nextIndex === currentSlide) return;
      isAnimating.current = true;

      const currentEl = slideRefs.current[currentSlide];
      const nextEl = slideRefs.current[nextIndex];

      if (!currentEl || !nextEl) {
        isAnimating.current = false;
        return;
      }

      const tl = gsap.timeline({
        onComplete: () => {
          isAnimating.current = false;
        },
      });

      setCurrentSlide(nextIndex);

      gsap.set(nextEl, {
        opacity: 1,
        zIndex: 2,
        scale: 1.05,
      });
      gsap.set(currentEl, { zIndex: 1 });

      tl.to(
        currentEl,
        {
          opacity: 0,
          duration: 0.65,
          ease: "power2.inOut",
        },
        0.1
      );

      tl.fromTo(
        nextEl,
        { scale: 1.05 },
        {
          scale: 1,
          duration: 0.65,
          ease: "power2.out",
        },
        0
      );
    },
    [currentSlide]
  );

  const nextSlide = useCallback(() => {
    const next = (currentSlide + 1) % slides.length;
    animateToSlide(next);
  }, [currentSlide, slides.length, animateToSlide]);

  const prevSlide = useCallback(() => {
    const prev = (currentSlide - 1 + slides.length) % slides.length;
    animateToSlide(prev);
  }, [currentSlide, slides.length, animateToSlide]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartRef.current = { x: e.touches[0].clientX, time: Date.now() };
    setIsAutoPlay(false);
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStartRef.current) return;
      const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
      const dt = Date.now() - touchStartRef.current.time;
      const velocity = Math.abs(dx) / dt;

      if (Math.abs(dx) > 40 || velocity > 0.3) {
        if (dx < 0) nextSlide();
        else prevSlide();
      }

      touchStartRef.current = null;
      setIsAutoPlay(true);
    },
    [nextSlide, prevSlide]
  );

  const goToSlide = useCallback(
    (index: number) => {
      animateToSlide(index);
    },
    [animateToSlide]
  );

  useEffect(() => {
    if (autoplayTimer.current) clearTimeout(autoplayTimer.current);

    if (isAutoPlay) {
      autoplayTimer.current = setTimeout(() => {
        nextSlide();
      }, duration * 1000);
    }

    return () => {
      if (autoplayTimer.current) clearTimeout(autoplayTimer.current);
    };
  }, [currentSlide, isAutoPlay, nextSlide, duration]);

  useEffect(() => {
    slideRefs.current.forEach((el, i) => {
      if (el) {
        gsap.set(el, {
          opacity: i === 0 ? 1 : 0,
          zIndex: i === 0 ? 2 : 1,
          scale: 1,
        });
      }
    });
  }, []);

  const activeSlideData = slides[currentSlide];

  return (
    <div
      className={cn(
        "relative z-20 w-full overflow-hidden bg-slate-950 group/carousel flex flex-col hero-carousel-height select-none",
        className
      )}
    >
      {/* Carousel images with subtle dark vignette overlay */}
      <section
        ref={containerRef}
        className="relative flex-1 w-full overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {slides.map((slide, index) => {
          return (
            <div
              key={slide.id}
              ref={(el) => {
                slideRefs.current[index] = el;
              }}
              className="absolute inset-0"
            >
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                className={cn(
                  "object-cover object-[center_35%] md:object-center",
                  slide.mobileImage ? "hidden md:block" : ""
                )}
                priority={index === 0}
                quality={75}
                sizes="100vw"
              />
              {slide.mobileImage && (
                <Image
                  src={slide.mobileImage}
                  alt={slide.title}
                  fill
                  className="object-cover object-center block md:hidden"
                  priority={index === 0}
                  quality={75}
                  sizes="100vw"
                />
              )}
              {/* Subtle dark gradient overlay only when text overlay is enabled */}
              {showOverlayText && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/30 pointer-events-none" />
              )}
            </div>
          );
        })}

        {/* Hero Slide Content Narrative Overlay (Disabled by default, hero image stays clean) */}
        {showOverlayText && (
          <div className="absolute inset-0 z-10 pointer-events-none flex items-center">
            <div className="w-full max-w-[1380px] mx-auto px-4 sm:px-8 lg:px-12">
              <div className="max-w-3xl space-y-3.5 sm:space-y-4 pointer-events-auto">
                {activeSlideData.badge && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#115eff]/85 text-white border border-white/20 text-xs sm:text-sm font-bold tracking-wide shadow-md backdrop-blur-xs">
                    <span>{activeSlideData.badge}</span>
                  </div>
                )}

                <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] drop-shadow-md">
                  {activeSlideData.title}{" "}
                  {activeSlideData.highlight && (
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-sky-200 to-white block sm:inline">
                      {activeSlideData.highlight}
                    </span>
                  )}
                </h2>

                {activeSlideData.subtitle && (
                  <p className="text-sm sm:text-base lg:text-lg text-slate-200 max-w-2xl font-normal leading-relaxed drop-shadow-sm">
                    {activeSlideData.subtitle}
                  </p>
                )}

                {/* Action Buttons */}
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  {activeSlideData.primaryAction && (
                    <Link
                      href={activeSlideData.primaryAction.href}
                      className="inline-flex items-center justify-center gap-2 min-h-[46px] px-6 py-2.5 bg-[#115eff] hover:bg-[#0a4de6] text-white font-bold text-sm sm:text-base rounded-[0.26rem] transition-all shadow-md hover:shadow-lg active:scale-95"
                    >
                      <span>{activeSlideData.primaryAction.label}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}

                  {activeSlideData.secondaryAction && (
                    <Link
                      href={activeSlideData.secondaryAction.href}
                      className="inline-flex items-center justify-center gap-2 min-h-[46px] px-5 py-2.5 bg-white/20 hover:bg-white/30 text-white font-semibold text-sm sm:text-base rounded-[0.26rem] border border-white/30 backdrop-blur-md transition-all shadow-sm active:scale-95"
                    >
                      <span>{activeSlideData.secondaryAction.label}</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Unified Bottom Controls Bar: Aligned with the two-side margin container, elevated with a gap */}
        <div className="absolute inset-x-0 bottom-4 sm:bottom-6 md:bottom-8 z-20 pointer-events-none">
          <div className="w-full max-w-[1380px] mx-auto px-4 sm:px-8 lg:px-12 relative flex items-center justify-end">
            {/* Optional Circular Countdown Progress Indicators with Rotating Flower */}
            {showIndicators && (
              <div className="pointer-events-auto absolute left-4 sm:left-1/2 sm:-translate-x-1/2">
                <div className="flex items-center gap-1.5 rounded-full border border-white/20 bg-black/40 backdrop-blur-md px-2.5 py-1.5 shadow-xl">
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        setIsAutoPlay(false);
                        goToSlide(index);
                      }}
                      onMouseEnter={() => setIsAutoPlay(false)}
                      onMouseLeave={() => setIsAutoPlay(true)}
                      className="relative w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center cursor-pointer group"
                      aria-label={`Go to slide ${index + 1}`}
                    >
                      {index === currentSlide ? (
                        <>
                          <svg
                            className="-rotate-90 absolute inset-0 w-full h-full pointer-events-none drop-shadow-md z-10"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              cx="12"
                              cy="12"
                              r="11"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              fill="none"
                              className="text-white/20"
                            />
                            <circle
                              key={`progress-${currentSlide}`}
                              cx="12"
                              cy="12"
                              r="11"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              fill="none"
                              className="text-white drop-shadow-lg"
                              strokeDasharray="69"
                              strokeDashoffset="69"
                              style={{
                                animation: `circle-draw ${duration}s linear forwards`,
                                animationPlayState: isAutoPlay ? "running" : "paused",
                              }}
                            />
                          </svg>
                          <span
                            key={`flower-${index}-${currentSlide}`}
                            className="absolute inset-[3px] opacity-100 animate-spin pointer-events-none z-20"
                            style={{ animationDuration: `${duration}s` }}
                          >
                            <Image
                              src={FLOWER_WHITE}
                              alt=""
                              fill
                              className="object-contain"
                              unoptimized
                            />
                          </span>
                        </>
                      ) : (
                        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white/40 transition-colors duration-300 group-hover:bg-white/80 pointer-events-none" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Right: Chevron Navigation Controls with light glassmorphism, aligned with two-side margin, revealed on carousel hover */}
            <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2 opacity-90 sm:opacity-0 sm:group-hover/carousel:opacity-100 sm:translate-y-1 sm:group-hover/carousel:translate-y-0 transition-all duration-300">
              <button
                type="button"
                onClick={() => {
                  setIsAutoPlay(false);
                  prevSlide();
                }}
                onMouseEnter={() => setIsAutoPlay(false)}
                onMouseLeave={() => setIsAutoPlay(true)}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-white/20 hover:bg-[#115eff] text-white flex items-center justify-center transition-all duration-200 cursor-pointer border border-white/35 backdrop-blur-md shadow-lg hover:border-white/60 hover:scale-105 active:scale-95 group/nav"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover/nav:-translate-x-0.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAutoPlay(false);
                  nextSlide();
                }}
                onMouseEnter={() => setIsAutoPlay(false)}
                onMouseLeave={() => setIsAutoPlay(true)}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-white/20 hover:bg-[#115eff] text-white flex items-center justify-center transition-all duration-200 cursor-pointer border border-white/35 backdrop-blur-md shadow-lg hover:border-white/60 hover:scale-105 active:scale-95 group/nav"
                aria-label="Next slide"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover/nav:translate-x-0.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SVG Animation Keyframes */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes circle-draw {
          from { stroke-dashoffset: 69; }
          to { stroke-dashoffset: 0; }
        }
      `,
        }}
      />
    </div>
  );
}

export default HeroCarousel;
