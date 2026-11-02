"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { RotateCcw, Globe2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DateRangePicker,
  getDateRangeFromPreset,
} from "@/components/ui/date-range-picker";
import { useSystemPostAnalytics } from "../../hooks/use-system-post-analytics";
import { SystemOverviewKpis } from "./system-overview-kpis";
import { SystemActivityHeatmap } from "./system-activity-heatmap";
import { SystemGovernanceCard } from "./system-governance-card";
import { SystemComparisonTable } from "./system-comparison-table";
import { SystemTrendsTopics } from "./system-trends-topics";

export function SystemPostAnalyticsDashboard() {
  const searchParams = useSearchParams();
  const initialPreset = searchParams?.get("range") || "30d";
  const [selectedPreset, setSelectedPreset] = useState<string>(initialPreset);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date } | undefined>(() =>
    getDateRangeFromPreset(initialPreset)
  );
  const { filter, updateFilter, isLoading, refetch, data } = useSystemPostAnalytics();

  const handlePresetChange = (preset: string) => {
    setSelectedPreset(preset);
    const range = getDateRangeFromPreset(preset);
    setDateRange(range);

    if (preset === "all" || preset === "all_time") {
      updateFilter({ from: undefined, to: undefined });
      return;
    }

    updateFilter({
      from: range.from.toISOString(),
      to: range.to.toISOString(),
    });
  };

  const handleCustomRangeChange = (range?: { from?: Date; to?: Date }) => {
    if (!range?.from) {
      setSelectedPreset("all");
      const allR = getDateRangeFromPreset("all");
      setDateRange(allR);
      updateFilter({ from: undefined, to: undefined });
      return;
    }

    setDateRange(range);
    setSelectedPreset("custom");

    updateFilter({
      from: range.from.toISOString(),
      to: (range.to || range.from).toISOString(),
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Filter & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-card border border-border/70 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 shrink-0">
            <Globe2 className="size-4.5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-semibold text-foreground tracking-tight">
              System Benchmark & Governance
            </h2>
            <p className="text-xs text-muted-foreground">
              Cross-track comparison, publishing heatmaps, and storage allocation
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
            <RotateCcw className={`size-3.5 text-rose-500 ${isLoading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* 1. Global KPIs & Cross-track Traffic */}
      <SystemOverviewKpis
        overviewData={data.overviewSummary}
        isLoading={isLoading}
      />

      {/* 2. Publishing Activity Heatmap */}
      <SystemActivityHeatmap
        activityData={data.activityMap}
        isLoading={isLoading}
      />

      {/* 3. Cross-track Comparison Rankings Table */}
      <SystemComparisonTable
        comparisonData={data.comparisonSummary}
        isLoading={isLoading}
      />

      {/* 4. Storage Quotas & Quality Controls (2 columns grid) */}
      <SystemGovernanceCard
        governanceData={data.governanceSummary}
        isLoading={isLoading}
      />

      {/* 5. Hot Topics & Keyword Analysis Matrix (2 columns grid) */}
      <SystemTrendsTopics
        hotTopicsData={data.hotTopics}
        keywordData={data.keywordAnalysis}
        isLoading={isLoading}
      />
    </div>
  );
}
