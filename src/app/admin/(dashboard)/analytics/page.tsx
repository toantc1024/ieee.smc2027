"use client";

import React, { Suspense, useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FileText, Globe, ShieldCheck } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ManagementPageHeader } from "@/components/ui/management-page-header";
import { Skeleton } from "@/components/ui/skeleton";
import {
  UnitPostAnalyticsDashboard,
  WebsiteTelemetryDashboard,
  SystemPostAnalyticsDashboard,
} from "@/modules/analytics";

const VALID_TABS = ["unit-post", "website", "system-post"] as const;
type AnalyticsTab = (typeof VALID_TABS)[number];

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-28 w-full rounded-2xl" />
      <Skeleton className="h-10 w-80 rounded-xl" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-80 w-full rounded-2xl" />
    </div>
  );
}

function AnalyticsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [, startTransition] = useTransition();

  const urlTab = searchParams.get("tab") as AnalyticsTab | null;
  const activeTab: AnalyticsTab = urlTab && VALID_TABS.includes(urlTab) ? urlTab : "unit-post";

  const handleTabChange = (nextTab: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", nextTab);
      router.replace(`?${params.toString()}`, { scroll: false });
    });
  };

  return (
    <div className="space-y-6 relative pb-12">
      <ManagementPageHeader
        title="Analytics"
        description="Editorial publishing metrics, website traffic telemetry, and system benchmarks"
        image3d="/assets/3d-icons/analytics__hcmute-3d-icon.png"
        backgroundImage="/assets/manage-stats-bg.jpg"
      />

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-border/70 pb-3">
          <TabsList className="bg-muted/60 p-1 rounded-xl gap-1">
            <TabsTrigger
              value="unit-post"
              className="gap-2 px-3.5 py-1.5 text-xs font-semibold data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg transition-all"
            >
              <FileText className="size-4" />
              <span>Editorial Analytics</span>
            </TabsTrigger>
            <TabsTrigger
              value="website"
              className="gap-2 px-3.5 py-1.5 text-xs font-semibold data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg transition-all"
            >
              <Globe className="size-4" />
              <span>Website Telemetry</span>
            </TabsTrigger>
            <TabsTrigger
              value="system-post"
              className="gap-2 px-3.5 py-1.5 text-xs font-semibold data-[state=active]:bg-red-600 data-[state=active]:text-white rounded-lg transition-all"
            >
              <ShieldCheck className="size-4" />
              <span>System Benchmark</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="unit-post" className="mt-0 focus-visible:outline-none">
          <UnitPostAnalyticsDashboard />
        </TabsContent>
        <TabsContent value="website" className="mt-0 focus-visible:outline-none">
          <WebsiteTelemetryDashboard />
        </TabsContent>
        <TabsContent value="system-post" className="mt-0 focus-visible:outline-none">
          <SystemPostAnalyticsDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<AnalyticsSkeleton />}>
      <AnalyticsContent />
    </Suspense>
  );
}
