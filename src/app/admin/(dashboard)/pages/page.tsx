import React, { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { PageListView } from "./components/page-list-view";

function PageListSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-6 border-b border-slate-200">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 rounded-lg" />
          <Skeleton className="h-4 w-96 rounded" />
        </div>
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>

      <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200">
        <Skeleton className="h-9 w-72 rounded-lg" />
        <Skeleton className="h-9 w-48 rounded-lg" />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </div>
  );
}

export default function PagesPage() {
  return (
    <Suspense fallback={<PageListSkeleton />}>
      <PageListView />
    </Suspense>
  );
}
