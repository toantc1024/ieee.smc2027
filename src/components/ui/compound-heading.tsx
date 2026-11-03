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
