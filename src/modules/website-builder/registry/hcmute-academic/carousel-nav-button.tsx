"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const FLOWER_BLUE = "/assets/flower-blue-gradient.png";
const FLOWER_WHITE = "/assets/flower-ute-white.png";

export interface CarouselNavButtonProps {
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
  variant = "light",
  disabled = false,
}: CarouselNavButtonProps) {
  const Icon = direction === "prev" ? ChevronLeft : ChevronRight;
  const sizeClasses = size === "sm" ? "size-8.5 sm:size-10" : "size-9 sm:size-12";
  const iconSize = size === "sm" ? "size-4 sm:size-5" : "size-4.5 sm:size-6";

  const variantClasses =
    variant === "glass"
      ? "bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/25 hover:border-white/50 shadow-sm hover:shadow-md text-white"
      : "bg-white/95 dark:bg-card hover:bg-blue-50/80 dark:hover:bg-muted border border-slate-200 dark:border-zinc-700 hover:border-primary/50 shadow-sm hover:shadow-md text-primary";

  const iconColor =
    variant === "glass"
      ? "text-white group-hover/nav:text-white"
      : "text-primary group-hover/nav:text-primary";

  const flowerSrc = variant === "glass" ? FLOWER_WHITE : FLOWER_BLUE;

  return (
    <button
      type="button"
      aria-label={direction === "prev" ? "Previous" : "Next"}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      disabled={disabled}
      className={cn(
        "group/nav relative overflow-hidden rounded-full border transition-all duration-300 flex items-center justify-center shrink-0 cursor-pointer hover:scale-105 active:scale-95",
        sizeClasses,
        variantClasses,
        disabled && "opacity-0 pointer-events-none invisible select-none transition-all duration-300 scale-90",
        className,
      )}
    >
      <span
        className={cn(
          "absolute inset-0 rounded-full opacity-0 group-hover/nav:opacity-100 transition-opacity duration-500 pointer-events-none",
          variant === "glass"
            ? "bg-[radial-gradient(circle,rgba(255,255,255,0.2)_0%,transparent_70%)]"
            : "bg-[radial-gradient(circle,rgba(0,102,204,0.15)_0%,transparent_70%)]",
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
            : "bg-gradient-to-r from-transparent via-primary/20 to-transparent",
        )}
      />

      <Icon
        className={cn(
          "relative z-10 transition-all duration-300 stroke-[2]",
          iconColor,
          iconSize,
        )}
      />
    </button>
  );
}
