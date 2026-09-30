"use client";

import React, { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show button once user scrolls down 300px
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div
      className={cn(
        "fixed bottom-6 sm:bottom-8 z-50 transition-all duration-300 ease-out",
        isVisible
          ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
          : "opacity-0 translate-y-4 scale-90 pointer-events-none"
      )}
      style={{
        right: "max(1.25rem, calc((100% - var(--site-width, 80rem)) / 4 - 1.5rem))",
      }}
    >
      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Move to top"
        title="Move to top"
        className={cn(
          "group/scrolltop relative flex items-center justify-center",
          "w-11 h-11 sm:w-12 sm:h-12 rounded-full",
          "bg-[#115eff] hover:bg-[#0a4de6] active:bg-[#083eb8] text-white",
          "border border-white/30 hover:border-white/60",
          "shadow-lg shadow-[#115eff]/30 hover:shadow-xl hover:shadow-[#115eff]/50",
          "cursor-pointer transition-all duration-200 hover:scale-110 active:scale-95 overflow-hidden"
        )}
      >
        {/* Upward Arrow Icon in crisp white */}
        <ArrowUp className="w-5 h-5 sm:w-6 sm:h-6 text-white relative z-10 transition-transform duration-200 group-hover/scrolltop:-translate-y-0.5 group-hover/scrolltop:scale-110" />

        {/* Tooltip on hover for desktop */}
        <span className="absolute right-full mr-3 px-2.5 py-1 rounded-md bg-[#0a4de6] text-white text-xs font-semibold whitespace-nowrap opacity-0 group-hover/scrolltop:opacity-100 transition-opacity duration-200 pointer-events-none shadow-md hidden sm:block border border-white/20">
          Move to top
        </span>
      </button>
    </div>
  );
}
