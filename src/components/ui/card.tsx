import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-white text-slate-900 flex flex-col gap-5 rounded-2xl border border-slate-200/80 p-6 shadow-xs",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn("flex flex-col gap-1.5", className)}
      {...props}
    />
  );
}

export function CardTitle({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-snug font-bold text-slate-900", className)}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-slate-500 text-sm", className)}
      {...props}
    />
  );
}

export function CardContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div data-slot="card-content" className={cn("", className)} {...props} />
  );
}

export function CardFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center pt-2", className)}
      {...props}
    />
  );
}
