"use client";

import { type ComponentPropsWithoutRef, useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "motion/react";
import { cn } from "@/lib/utils";

export interface NumberTickerProps extends ComponentPropsWithoutRef<"span"> {
  value: number;
  startValue?: number;
  direction?: "up" | "down";
  delay?: number;
  decimalPlaces?: number;
  isEditor?: boolean;
}

export function NumberTicker({
  value,
  startValue = 0,
  direction = "up",
  delay = 0,
  className,
  decimalPlaces = 0,
  isEditor = false,
  ...props
}: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const safeDecimals = Math.max(0, Math.min(20, Math.floor(decimalPlaces || 0)));
  const motionValue = useMotionValue(direction === "down" ? value : startValue);
  const springValue = useSpring(motionValue, {
    damping: 60,
    stiffness: 100,
  });
  const isInViewResult = useInView(ref, { once: true, margin: "0px" });
  const isInView = isEditor || isInViewResult;

  useEffect(() => {
    if (isEditor && ref.current) {
      ref.current.textContent = Intl.NumberFormat("en-US", {
        minimumFractionDigits: safeDecimals,
        maximumFractionDigits: safeDecimals,
      }).format(value);
      return;
    }

    if (isInView) {
      const timer = setTimeout(() => {
        motionValue.set(direction === "down" ? startValue : value);
      }, delay * 1000);
      return () => clearTimeout(timer);
    }
  }, [motionValue, isInView, delay, value, direction, startValue, isEditor, safeDecimals]);

  useEffect(
    () =>
      springValue.on("change", (latest) => {
        if (ref.current) {
          ref.current.textContent = Intl.NumberFormat("en-US", {
            minimumFractionDigits: safeDecimals,
            maximumFractionDigits: safeDecimals,
          }).format(Number(latest.toFixed(safeDecimals)));
        }
      }),
    [springValue, safeDecimals]
  );

  return (
    <span
      ref={ref}
      className={cn(
        "inline text-foreground tabular-nums dark:text-white",
        className
      )}
      {...props}
    >
      {props.children ??
        Intl.NumberFormat("en-US", {
          minimumFractionDigits: safeDecimals,
          maximumFractionDigits: safeDecimals,
        }).format(value)}
    </span>
  );
}
