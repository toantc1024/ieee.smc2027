"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const FLOWER_BLUE = "/assets/flower-blue-gradient.png";
const FLOWER_WHITE = "/assets/flower-ute-white.png";

interface CarouselNavButtonProps {
  direction: "prev" | "next";
  onClick: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  className?: string;
  size?: "sm" | "md";
  variant?: "light" | "glass";
  disabled?: boolean;
}

export function CarouselNavButton({
  direction,
  onClick,
  onMouseEnter,
  onMouseLeave,
  className,
  size = "md",
  variant = "glass",
  disabled = false,
}: CarouselNavButtonProps) {
  const Icon = direction === "prev" ? ChevronLeft : ChevronRight;
  const sizeClasses = size === "sm" ? "p-2" : "p-2.5 sm:p-3";
  const iconSize = size === "sm" ? "w-4 h-4" : "w-5 h-5 sm:w-6 sm:h-6";

  const variantClasses =
    variant === "glass"
      ? "bg-white/10 hover:bg-white/25 backdrop-blur-xl border-white/20 hover:border-white/40 shadow-lg hover:shadow-xl"
      : "bg-white hover:bg-blue-50 border-slate-200 hover:border-blue-300 shadow-sm hover:shadow-lg hover:shadow-blue-500/15";

  const iconColor =
    variant === "glass"
      ? "text-white group-hover/nav:text-white"
      : "text-slate-600 group-hover/nav:text-blue-600";

  const flowerSrc = variant === "glass" ? FLOWER_WHITE : FLOWER_BLUE;

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      disabled={disabled}
      className={cn(
        "group/nav relative overflow-hidden rounded-full border transition-all duration-300 flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95",
        sizeClasses,
        variantClasses,
        disabled && "opacity-40 pointer-events-none cursor-not-allowed",
        className
      )}
      aria-label={direction === "prev" ? "Previous slide" : "Next slide"}
    >
      <span
        className={cn(
          "absolute inset-0 rounded-full opacity-0 group-hover/nav:opacity-100 transition-opacity duration-500 pointer-events-none",
          variant === "glass"
            ? "bg-[radial-gradient(circle,rgba(255,255,255,0.15)_0%,transparent_70%)]"
            : "bg-[radial-gradient(circle,rgba(59,130,246,0.12)_0%,transparent_70%)]"
        )}
      />

      <span className="absolute -right-2 -bottom-2 w-10 h-10 opacity-0 group-hover/nav:opacity-25 transition-all duration-500 ease-out group-hover/nav:rotate-45 group-hover/nav:scale-110 pointer-events-none">
        <Image src={flowerSrc} alt="" fill className="object-contain" />
      </span>

      <span
        className={cn(
          "absolute inset-0 -translate-x-full group-hover/nav:translate-x-full transition-transform duration-600 ease-out pointer-events-none",
          variant === "glass"
            ? "bg-gradient-to-r from-transparent via-white/20 to-transparent"
            : "bg-gradient-to-r from-transparent via-blue-300/30 to-transparent"
        )}
      />

      <Icon
        className={cn(
          "relative z-10 transition-all duration-300 group-hover/nav:drop-shadow-sm",
          iconColor,
          iconSize
        )}
      />
    </button>
  );
}
