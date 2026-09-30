"use client";

import React, { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import Image from "next/image";
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
        "fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50 transition-all duration-300 ease-out",
        isVisible
          ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
          : "opacity-0 translate-y-4 scale-90 pointer-events-none"
      )}
    >
      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Move to top"
        title="Move to top"
        className={cn(
          "group/scrolltop relative flex items-center justify-center",
          "w-11 h-11 sm:w-12 sm:h-12 rounded-full",
          "bg-white/95 hover:bg-[#115eff] text-[#004776] hover:text-white",
          "border-2 border-slate-200/90 hover:border-[#115eff]",
          "backdrop-blur-md shadow-lg hover:shadow-xl hover:shadow-[#115eff]/25",
          "cursor-pointer transition-all duration-300 hover:scale-110 active:scale-95 overflow-hidden"
        )}
      >
        {/* Subtle flower watermark rotating on hover (HCMUTE style) */}
        <span className="absolute -right-2 -bottom-2 w-10 h-10 opacity-0 group-hover/scrolltop:opacity-25 transition-all duration-500 ease-out group-hover/scrolltop:rotate-45 pointer-events-none">
          <Image
            src="/assets/flower-blue-gradient.png"
            alt=""
            fill
            className="object-contain"
          />
        </span>

        {/* Upward Arrow Icon */}
        <ArrowUp className="w-5 h-5 sm:w-5.5 sm:h-5.5 relative z-10 transition-transform duration-300 group-hover/scrolltop:-translate-y-0.5 group-hover/scrolltop:scale-110" />

        {/* Tooltip on hover for desktop */}
        <span className="absolute right-full mr-3.5 px-2.5 py-1 rounded-md bg-[#004776] text-white text-xs font-semibold whitespace-nowrap opacity-0 group-hover/scrolltop:opacity-100 transition-opacity duration-200 pointer-events-none shadow-md hidden sm:block">
          Move to top
        </span>
      </button>
    </div>
  );
}
