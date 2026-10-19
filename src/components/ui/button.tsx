import * as React from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link"
  | "ute";

export type ButtonSize = "default" | "sm" | "lg" | "icon";

const variantClasses: Record<ButtonVariant, string> = {
  default:
    "bg-primary text-white shadow-sm hover:bg-primary/90 focus-visible:ring-primary/40",
  destructive:
    "bg-red-600 text-white shadow-sm hover:bg-red-700 focus-visible:ring-red-500/40",
  outline:
    "border border-slate-200 bg-white text-slate-700 shadow-xs hover:bg-slate-50 hover:text-slate-900",
  secondary:
    "bg-slate-100 text-slate-800 shadow-xs hover:bg-slate-200/80",
  ghost:
    "text-slate-700 hover:bg-slate-100 hover:text-slate-900",
  link: "text-primary underline-offset-4 hover:underline",
  ute: "group relative overflow-hidden bg-gradient-to-r from-[#005496] to-[#0284c7] text-white shadow-md transition-all duration-300 hover:from-[#0284c7] hover:to-[#0369a1] hover:shadow-lg",
};

const sizeClasses: Record<ButtonSize, string> = {
  default: "h-10 px-4 py-2 text-sm",
  sm: "h-8 rounded-lg px-3 text-xs",
  lg: "h-11 rounded-xl px-6 text-sm",
  icon: "h-9 w-9",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
}

export function buttonVariants({
  variant = "default",
  size = "default",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return cn(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-semibold transition-all cursor-pointer disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2",
    variantClasses[variant],
    sizeClasses[size],
    className
  );
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        data-slot="button"
        className={buttonVariants({ variant, size, className })}
        {...props}
      >
        {variant === "ute" ? (
          <>
            <span
              className="pointer-events-none absolute -right-4 -bottom-4 z-0 h-20 w-20 bg-contain bg-right-bottom bg-no-repeat opacity-25 transition-all duration-700 ease-out group-hover:scale-150 group-hover:rotate-12 group-hover:opacity-40"
              style={{
                backgroundImage: 'url("/assets/flower-ute-white.png")',
              }}
            />
            <span className="relative z-10 flex items-center justify-center gap-2">
              {children}
            </span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);
Button.displayName = "Button";
