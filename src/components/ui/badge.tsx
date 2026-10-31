import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border border-transparent px-2.5 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] transition-colors overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-primary text-white [a&]:hover:bg-primary/90",
        secondary:
          "bg-slate-100 text-slate-700 [a&]:hover:bg-slate-200",
        destructive:
          "bg-rose-600 text-white [a&]:hover:bg-rose-700",
        outline:
          "border-slate-200 text-slate-700 bg-white [a&]:hover:bg-slate-50",
        ghost: "hover:bg-slate-100 text-slate-700",
        link: "text-primary underline-offset-4 hover:underline",
        ute: "bg-slate-100 text-[#004776] border-slate-200",
        success: "bg-slate-100 text-emerald-700 border-slate-200",
        warning: "bg-slate-100 text-amber-700 border-slate-200",
      },
    },
    defaultVariants: {
      variant: "default",
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
  asChild = false,
  ...props
}: BadgeProps) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
