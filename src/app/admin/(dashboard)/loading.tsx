import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboardLoading() {
  return (
    <div
      role="status"
      aria-label="Loading dashboard"
      className="space-y-6 p-6 md:p-8 font-sans"
    >
      <div className="rounded-2xl border border-slate-200/75 bg-white p-6 space-y-3">
        <Skeleton className="h-7 w-64" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-slate-200/75 bg-white p-5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="size-8 rounded-lg" />
            </div>
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3.5 w-32" />
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200/75 bg-white overflow-hidden">
        <div className="border-b border-slate-200/75 px-5 py-4 flex items-center justify-between gap-4">
          <Skeleton className="h-9 w-64 rounded-lg" />
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
        <div className="divide-y divide-slate-100 p-5 space-y-4">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="flex items-center gap-4 pt-3 first:pt-0">
              <Skeleton className="size-4 rounded" />
              <Skeleton className="h-4 flex-1 max-w-sm" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
