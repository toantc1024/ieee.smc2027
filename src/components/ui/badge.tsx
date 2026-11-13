import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border border-transparent px-3 py-0.5 sm:py-1 text-xs sm:text-[13px] font-bold w-fit whitespace-nowrap shrink-0 [&>svg]:size-3.5 gap-1.5 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] transition-colors overflow-hidden leading-normal",
  {
    variants: {
      variant: {
        default: "bg-primary text-white [a&]:hover:bg-primary/90",
        secondary:
          "bg-slate-100 text-slate-800 border-slate-200/80 [a&]:hover:bg-slate-200",
        destructive:
          "bg-rose-600 text-white [a&]:hover:bg-rose-700",
        outline:
          "border-slate-200 text-slate-700 bg-white [a&]:hover:bg-slate-50",
        ghost: "hover:bg-slate-100 text-slate-700",
        link: "text-primary underline-offset-4 hover:underline",
        ute: "bg-blue-50 text-[#004776] border border-blue-200/80",
        success: "bg-emerald-50 text-emerald-800 border border-emerald-200/80",
        warning: "bg-amber-50 text-amber-900 border border-amber-200/80",
      },
      size: {
        default: "px-3 py-0.5 sm:py-1 text-xs sm:text-[13px]",
        sm: "px-2.5 py-0.5 text-xs font-semibold",
        lg: "px-3.5 py-1 text-sm font-bold",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  asChild?: boolean;
}

function Badge({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: BadgeProps) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
