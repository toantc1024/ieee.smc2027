import * as React from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "success"
  | "warning"
  | "ute";

const badgeVariantsMap: Record<BadgeVariant, string> = {
  default: "border-transparent bg-primary text-white",
  secondary: "border-transparent bg-slate-100 text-slate-700",
  destructive: "border-transparent bg-red-50 text-red-700 border-red-200",
  outline: "border-slate-200 text-slate-700 bg-white",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  ute: "border-blue-200 bg-blue-50 text-[#005496]",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <span
      data-slot="badge"
      className={cn(
        "inline-flex items-center justify-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors",
        badgeVariantsMap[variant],
        className
      )}
      {...props}
    />
  );
}
