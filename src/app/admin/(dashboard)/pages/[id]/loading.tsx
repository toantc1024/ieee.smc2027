import { Skeleton } from "@/components/ui/skeleton";

export default function PageStudioLoading() {
  return (
    <div
      role="status"
      aria-label="Loading Page Studio"
      className="h-screen w-full flex flex-col bg-slate-50/70 overflow-hidden"
    >
      <div className="h-14 shrink-0 border-b border-slate-200/75 bg-white px-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="size-8 rounded-lg" />
          <Skeleton className="h-5 w-48" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-24 rounded-lg" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
      </div>
      <div className="h-11 shrink-0 border-b border-slate-200/75 bg-white/80 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-7 w-24 rounded-md" />
          <Skeleton className="h-7 w-28 rounded-md" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-7 w-20 rounded-md" />
          <Skeleton className="h-7 w-20 rounded-md" />
        </div>
      </div>
      <div className="flex-1 min-h-0 grid grid-cols-[280px_1fr_340px]">
        <div className="border-r border-slate-200/75 bg-white p-4 space-y-3">
          <Skeleton className="h-9 w-full rounded-lg" />
          <div className="grid grid-cols-2 gap-2 pt-2">
            {Array.from({ length: 6 }).map((_, idx) => (
              <Skeleton key={idx} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        </div>
        <div className="p-8 flex flex-col items-center gap-5 overflow-hidden">
          <Skeleton className="h-56 w-full max-w-4xl rounded-2xl" />
          <Skeleton className="h-40 w-full max-w-4xl rounded-2xl" />
          <Skeleton className="h-48 w-full max-w-4xl rounded-2xl" />
        </div>
        <div className="border-l border-slate-200/75 bg-white p-4 space-y-4">
          <Skeleton className="h-8 w-full rounded-lg" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
