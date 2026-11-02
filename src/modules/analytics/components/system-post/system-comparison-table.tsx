"use client";

import React, { useState } from "react";
import {
  Trophy,
  Clock,
  Eye,
  FileText,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { PostComparisonSummarySystemDto } from "../../types";

interface SystemComparisonTableProps {
  comparisonData: PostComparisonSummarySystemDto | null;
  isLoading: boolean;
}

type TabType = "production" | "engagement" | "speed";

export function SystemComparisonTable({
  comparisonData,
  isLoading,
}: SystemComparisonTableProps) {
  const [activeTab, setActiveTab] = useState<TabType>("production");

  if (isLoading) {
    return <Skeleton className="h-[360px] rounded-2xl" />;
  }

  const productionRank = comparisonData?.productionRank ?? [];
  const engagementRank = comparisonData?.engagementRank ?? [];
  const speedRank = comparisonData?.workflowSpeed ?? [];

  return (
    <Card className="relative border border-border/70 bg-card shadow-xs flex flex-col justify-between overflow-hidden rounded-2xl">
      <CardHeader className="pb-4 pt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <CardTitle className="text-base font-semibold flex items-center gap-2.5 text-foreground">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <Trophy className="size-4" />
            </div>
            <span>Cross-Track Benchmark & Comparison</span>
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Compare production volume, audience engagement, and publishing speed across tracks
          </CardDescription>
        </div>

        <div className="h-9 p-0.5 rounded-xl bg-muted/60 border border-border/60 flex items-center self-start sm:self-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("production")}
            className={`h-full px-3 text-xs font-semibold rounded-lg gap-1.5 transition-all cursor-pointer ${
              activeTab === "production"
                ? "bg-background text-blue-600 dark:text-blue-400 shadow-2xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileText className="size-3.5" />
            <span>Production</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("engagement")}
            className={`h-full px-3 text-xs font-semibold rounded-lg gap-1.5 transition-all cursor-pointer ${
              activeTab === "engagement"
                ? "bg-background text-blue-600 dark:text-blue-400 shadow-2xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Eye className="size-3.5" />
            <span>Avg Views</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("speed")}
            className={`h-full px-3 text-xs font-semibold rounded-lg gap-1.5 transition-all cursor-pointer ${
              activeTab === "speed"
                ? "bg-background text-rose-600 dark:text-rose-400 shadow-2xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Clock className="size-3.5" />
            <span>Speed</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-0 pb-5 flex-1">
        {activeTab === "production" && (
          <div className="space-y-1 max-h-[300px] overflow-y-auto pr-1">
            {productionRank.map((item, idx) => (
              <div
                key={item.tenantCode || idx}
                className="py-2 px-2.5 rounded-xl flex items-center justify-between gap-3 text-xs hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`flex items-center justify-center size-5 rounded-md font-bold text-[11px] shrink-0 ${
                      item.rank === 1
                        ? "bg-amber-500 text-white"
                        : item.rank === 2
                        ? "bg-slate-400 text-white"
                        : item.rank === 3
                        ? "bg-amber-700 text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {item.rank}
                  </div>
                  <span className="font-semibold text-foreground truncate">
                    {item.tenantName || item.tenantDescription || item.tenantCode}
                  </span>
                </div>
                <div className="font-bold text-foreground shrink-0 tabular-nums">
                  {item.postCount} <span className="text-muted-foreground font-normal">posts</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "engagement" && (
          <div className="space-y-1 max-h-[300px] overflow-y-auto pr-1">
            {engagementRank.map((item, idx) => (
              <div
                key={item.tenantCode || idx}
                className="py-2 px-2.5 rounded-xl flex items-center justify-between gap-3 text-xs hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`flex items-center justify-center size-5 rounded-md font-bold text-[11px] shrink-0 ${
                      item.rank === 1
                        ? "bg-amber-500 text-white"
                        : item.rank === 2
                        ? "bg-slate-400 text-white"
                        : item.rank === 3
                        ? "bg-amber-700 text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {item.rank}
                  </div>
                  <span className="font-semibold text-foreground truncate">
                    {item.tenantName || item.tenantDescription || item.tenantCode}
                  </span>
                </div>
                <div className="font-bold text-foreground shrink-0 tabular-nums">
                  {item.averageViews.toFixed(1)}{" "}
                  <span className="text-muted-foreground font-normal">views/post</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "speed" && (
          <div className="space-y-1 max-h-[300px] overflow-y-auto pr-1">
            {speedRank.map((item, idx) => (
              <div
                key={item.tenantCode || idx}
                className="py-2 px-2.5 rounded-xl flex items-center justify-between gap-3 text-xs hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`flex items-center justify-center size-5 rounded-md font-bold text-[11px] shrink-0 ${
                      item.rank === 1
                        ? "bg-amber-500 text-white"
                        : item.rank === 2
                        ? "bg-slate-400 text-white"
                        : item.rank === 3
                        ? "bg-amber-700 text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {item.rank}
                  </div>
                  <span className="font-semibold text-foreground truncate">
                    {item.tenantName || item.tenantDescription || item.tenantCode}
                  </span>
                </div>
                <div className="font-bold text-foreground shrink-0 tabular-nums">
                  {Math.abs(item.averageDaysToPublish).toFixed(1)}{" "}
                  <span className="text-muted-foreground font-normal">days</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
