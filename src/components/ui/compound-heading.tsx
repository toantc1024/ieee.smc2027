import * as React from "react";
import { cn } from "@/lib/utils";

interface CompoundHeadingProps {
  badge?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
}

export function CompoundHeading({
  badge,
  title,
  subtitle,
  align = "left",
  className,
}: CompoundHeadingProps) {
  return (
    <div
      className={cn(
        "space-y-2.5",
        align === "center" ? "text-center mx-auto max-w-3xl" : "text-left",
        className
      )}
    >
      {badge && (
        <div
          className={cn(
            "inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-200/80 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#005496]"
          )}
        >
          <span className="size-1.5 rounded-full bg-[#005496]" />
          {badge}
        </div>
      )}
      <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
        {title}
      </h2>
      {subtitle && (
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}
