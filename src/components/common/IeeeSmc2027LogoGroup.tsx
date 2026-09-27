import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface IeeeSmc2027LogoGroupProps {
  className?: string;
  variant?: "full" | "lockup" | "transparent";
  height?: number;
  priority?: boolean;
}

/**
 * IEEE SMC 2027 Official Logo Group
 * Matching the 2026 Bellevue conference header branding:
 * [Emblem: Human + Robot Hand cradling Cybernetic Sphere]
 * IEEE SMC 2027 • Ho Chi Minh City, Vietnam | IEEE SMC Society | IEEE
 */
export function IeeeSmc2027LogoGroup({
  className,
  variant = "full",
  height = 54,
  priority = false,
}: IeeeSmc2027LogoGroupProps) {
  const src =
    variant === "lockup"
      ? "/logo/ieee-smc-2027-conference-lockup-transparent.png"
      : variant === "transparent"
      ? "/logo/ieee-smc-2027-logo-group-transparent.png"
      : "/logo/ieee-smc-2027-logo-group.png";

  return (
    <div className={cn("inline-flex items-center", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="IEEE SMC 2027 Ho Chi Minh City, Vietnam • IEEE SMC Society • IEEE"
        style={{ height: `${height}px`, width: "auto" }}
        className="object-contain max-w-full h-auto select-none"
        loading={priority ? "eager" : "lazy"}
      />
    </div>
  );
}

export default IeeeSmc2027LogoGroup;
