"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  RotateCcw,
  BarChart2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DateRangePicker,
  getDateRangeFromPreset,
} from "@/components/ui/date-range-picker";
import { useUnitPostAnalytics } from "../../hooks/use-unit-post-analytics";
import { UnitPostKpiGrid } from "./unit-post-kpi-grid";
import { UnitPostGrowthChart } from "./unit-post-growth-chart";
import { UnitPostDistributionCharts } from "./unit-post-distribution-charts";
import { UnitPostWorkflowCard } from "./unit-post-workflow-card";
import { UnitPostLeaderboardCard } from "./unit-post-leaderboard-card";
import { UnitPostTrendingCard } from "./unit-post-trending-card";

export function UnitPostAnalyticsDashboard() {
  const searchParams = useSearchParams();
  const initialPreset = searchParams?.get("range") || "30d";
  const [selectedPreset, setSelectedPreset] = useState<string>(initialPreset);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date } | undefined>(() =>
    getDateRangeFromPreset(initialPreset)
  );

  const { filter, updateFilter, isLoading, refetch, data } = useUnitPostAnalytics();

  const handlePresetChange = (preset: string) => {
    setSelectedPreset(preset);
    const range = getDateRangeFromPreset(preset);
    setDateRange(range);

    if (preset === "all" || preset === "all_time") {
      updateFilter({ from: undefined, to: undefined, granularity: "MONTH" });
      return;
    }

    const from = range.from.toISOString();
    const to = range.to.toISOString();

    let granularity: "DAY" | "WEEK" | "MONTH" = "DAY";
    if (
      preset === "today" ||
      preset === "7d" ||
      preset === "last_7_days" ||
      preset === "30d" ||
      preset === "last_30_days"
    ) {
      granularity = "DAY";
    } else if (preset === "this_month") {
      granularity = "WEEK";
    } else {
      granularity = "MONTH";
    }

    updateFilter({ from, to, granularity });
  };

  const handleCustomRangeChange = (range?: { from?: Date; to?: Date }) => {
    if (!range?.from) {
      setSelectedPreset("all");
      setDateRange(getDateRangeFromPreset("all"));
      updateFilter({ from: undefined, to: undefined, granularity: "MONTH" });
      return;
    }

    setDateRange(range);
    setSelectedPreset("custom");

    const fromDate = range.from;
    const toDate = range.to || range.from;
    const diffDays = Math.round((toDate.getTime() - fromDate.getTime()) / (24 * 60 * 60 * 1000));
    const granularity: "DAY" | "WEEK" | "MONTH" =
      diffDays <= 14 ? "DAY" : diffDays <= 90 ? "WEEK" : "MONTH";

    updateFilter({
      from: fromDate.toISOString(),
      to: toDate.toISOString(),
      granularity,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Filter & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-card border border-border/70 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shrink-0">
            <BarChart2 className="size-4.5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-semibold text-foreground tracking-tight">
              Editorial Analytics
            </h2>
            <p className="text-xs text-muted-foreground">
              Publishing performance, author contributions, and reader engagement
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Unified Date Range Picker */}
          <DateRangePicker
            value={dateRange}
            presetKey={selectedPreset}
            onPresetChange={handlePresetChange}
            onChange={handleCustomRangeChange}
            variant="outline"
            placeholder="Select date range"
          />

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
            className="h-9 px-3 text-xs rounded-xl bg-background hover:bg-muted border-border/70 font-medium gap-1.5 shadow-2xs shrink-0 cursor-pointer"
          >
            <RotateCcw className={`size-3.5 text-blue-500 ${isLoading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* 1. KPI Grid (8 metrics) */}
      <UnitPostKpiGrid
        distribution={data.contentDistribution}
        engagement={data.engagementSummary}
        workflow={data.workflowSummary}
        authorSummary={data.authorSummary}
        isLoading={isLoading}
      />

      {/* 2. Growth Timeline Area Chart */}
      <UnitPostGrowthChart
        growthData={data.contentGrowth}
        granularity={filter.granularity}
        onGranularityChange={(granularity) => updateFilter({ granularity })}
        isLoading={isLoading}
      />

      {/* 3. Distribution Charts (Status Stack, Categories/Tags, Device Donut) */}
      <UnitPostDistributionCharts
        distribution={data.contentDistribution}
        engagement={data.engagementSummary}
        isLoading={isLoading}
      />

      {/* 4. Workflow Speed & Review Efficiency Card */}
      <UnitPostWorkflowCard
        workflowData={data.workflowSummary}
        isLoading={isLoading}
      />

      {/* 5. Author Leaderboard & Trending Posts (2 columns) */}
      <div className="grid gap-6 lg:grid-cols-2">
        <UnitPostLeaderboardCard
          leaderboardData={data.leaderboard}
          isLoading={isLoading}
        />
        <UnitPostTrendingCard
          trendingData={data.engagementTrending}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
