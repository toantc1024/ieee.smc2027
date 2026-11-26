import * as React from "react";
import { Slot, Slottable } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import Image from "next/image";
import { cn } from "@/lib/utils";

const FLOWER_WHITE = "/assets/flower-ute-white.png";

export type ButtonVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link"
  | "ute";

export type ButtonSize =
  | "default"
  | "xs"
  | "sm"
  | "toolbar"
  | "lg"
  | "icon"
  | "icon-xs"
  | "icon-sm"
  | "icon-toolbar"
  | "icon-lg";

const buttonVariantsCva = cva(
  "relative overflow-hidden inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all cursor-pointer disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
        ute: "relative overflow-hidden bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-150",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 rounded-md gap-1.5 px-3 text-xs has-[>svg]:px-2.5",
        toolbar: "h-10 rounded-lg gap-2 px-3.5 text-sm has-[>svg]:px-3",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-toolbar": "size-10 rounded-lg",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export function buttonVariants({
  variant = "default",
  size = "default",
  className,
}: {
  variant?: ButtonVariant | null;
  size?: ButtonSize | null;
  className?: string;
} = {}) {
  return cn(buttonVariantsCva({ variant, size }), className);
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariantsCva> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      asChild = false,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    if (variant === "ute") {
      return (
        <Comp
          ref={ref}
          data-slot="button"
          data-variant={variant}
          data-size={size}
          className={cn(
            buttonVariants({ variant, size, className }),
            "group/utebtn"
          )}
          {...props}
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-8 -bottom-8 w-20 h-20 opacity-0 group-hover/utebtn:opacity-20 transition-all duration-500 ease-out group-hover/utebtn:-right-4 group-hover/utebtn:-bottom-4 group-hover/utebtn:rotate-12"
          >
            <Image src={FLOWER_WHITE} alt="" fill className="object-contain" />
          </span>

          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -translate-x-full group-hover/utebtn:translate-x-full transition-transform duration-600 ease-out bg-gradient-to-r from-transparent via-white/15 to-transparent"
          />

          <Slottable>
            <span className="relative z-10 flex items-center justify-center gap-2">
              {children}
            </span>
          </Slottable>
        </Comp>
      );
    }

    return (
      <Comp
        ref={ref}
        data-slot="button"
        data-variant={variant}
        data-size={size}
        className={buttonVariants({ variant, size, className })}
        {...props}
      >
        {children}
      </Comp>
    );
  }
);
Button.displayName = "Button";
