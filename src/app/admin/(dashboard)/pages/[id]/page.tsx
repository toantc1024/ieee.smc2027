import React, { Suspense } from "react";
import { StudioClient } from "./studio-client";
import { Skeleton } from "@/components/ui/skeleton";

function StudioSkeleton() {
  return (
    <div className="flex flex-col h-screen w-full bg-slate-100 select-none">
      <div className="h-14 border-b border-slate-200 bg-white px-4 flex items-center justify-between">
        <Skeleton className="h-8 w-48 rounded" />
        <Skeleton className="h-8 w-64 rounded" />
        <Skeleton className="h-8 w-24 rounded" />
      </div>
      <div className="flex-1 grid grid-cols-[308px_1fr_295px]">
        <div className="border-r border-slate-200 bg-white p-4 space-y-3">
          <Skeleton className="h-8 w-full rounded" />
          <Skeleton className="h-16 w-full rounded" />
          <Skeleton className="h-16 w-full rounded" />
        </div>
        <div className="flex items-center justify-center p-8">
          <Skeleton className="h-full w-full max-w-[1240px] rounded-xl" />
        </div>
        <div className="border-l border-slate-200 bg-white p-4 space-y-3">
          <Skeleton className="h-8 w-full rounded" />
          <Skeleton className="h-24 w-full rounded" />
        </div>
      </div>
    </div>
  );
}

export default async function AdminPageStudio({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Suspense fallback={<StudioSkeleton />}>
      <StudioClient pageId={id} />
    </Suspense>
  );
}
