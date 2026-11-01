"use client";

import React, { useId } from "react";
import { cn } from "@/lib/utils";

export interface DotPatternProps extends React.SVGProps<SVGSVGElement> {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  cx?: number;
  cy?: number;
  cr?: number;
  className?: string;
  glow?: boolean;
}

/**
 * MagicUI DotPattern component
 * Canonical implementation for dot matrix background patterns matching HCMUTE brand.
 */
export function DotPattern({
  width = 18,
  height = 18,
  x = 0,
  y = 0,
  cx = 1.2,
  cy = 1.2,
  cr = 1.2,
  className,
  glow = false,
  ...props
}: DotPatternProps) {
  const id = useId();

  return (
    <svg
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full fill-slate-400/25",
        glow && "[filter:drop-shadow(0_0_1px_rgba(17,94,255,0.4))]",
        className
      )}
      {...props}
    >
      <defs>
        <pattern
          id={id}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          patternContentUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <circle id="pattern-circle" cx={cx} cy={cy} r={cr} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" strokeWidth={0} fill={`url(#${id})`} />
    </svg>
  );
}
