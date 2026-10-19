import * as React from "react";
import { cn } from "@/lib/utils";

export function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      data-slot="label"
      className={cn(
        "text-xs font-bold uppercase tracking-wider text-slate-500 select-none",
        className
      )}
      {...props}
    />
  );
}
