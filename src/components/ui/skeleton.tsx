import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-lg bg-slate-200/55 dark:bg-slate-800/55", className)}
      {...props}
    />
  );
}

export { Skeleton };
