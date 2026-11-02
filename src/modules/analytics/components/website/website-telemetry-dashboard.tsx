"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { RotateCcw, Globe2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DateRangePicker,
  getDateRangeFromPreset,
} from "@/components/ui/date-range-picker";
import { useWebsiteAnalytics } from "../../hooks/use-website-analytics";
import { WebsiteTelemetryKpis } from "./website-telemetry-kpis";
import { WebsitePageviewsChart } from "./website-pageviews-chart";
import { WebsiteDimensionsBreakdown } from "./website-dimensions-breakdown";
import { WebsiteRealtimeStream } from "./website-realtime-stream";
import { WebsiteDiagnosticDialog } from "./website-diagnostic-dialog";
import { WebsiteResetModal } from "./website-reset-modal";
import { WebsiteAudienceSurveyCard } from "./website-audience-survey-card";

export function WebsiteTelemetryDashboard() {
  const searchParams = useSearchParams();
  const initialPreset = searchParams?.get("range") || "30d";
  const [selectedPreset, setSelectedPreset] = useState<string>(initialPreset);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date } | undefined>(() =>
    getDateRangeFromPreset(initialPreset)
  );

  const {
    filter,
    updateFilter,
    isLoading,
    isResetting,
    refetch,
    resetStats,
    fetchDiagnostic,
    diagnostic,
    data,
  } = useWebsiteAnalytics();

  const handlePresetChange = (preset: string) => {
    setSelectedPreset(preset);
    const range = getDateRangeFromPreset(preset);
    setDateRange(range);

    if (preset === "all" || preset === "all_time") {
      updateFilter({
        from: "2026-01-01T00:00:00.000Z",
        to: new Date().toISOString(),
        unit: "month",
      });
      return;
    }

    const from = range.from.toISOString();
    const to = range.to.toISOString();

    let unit: "hour" | "day" | "week" | "month" = "day";
    if (preset === "today" || preset === "last_24_hours") {
      unit = "hour";
    } else if (
      preset === "7d" ||
      preset === "last_7_days" ||
      preset === "30d" ||
      preset === "last_30_days" ||
      preset === "this_month"
    ) {
      unit = "day";
    } else if (preset === "90d" || preset === "this_quarter") {
      unit = "week";
    } else {
      unit = "month";
    }

    updateFilter({ from, to, unit });
  };

  const handleCustomRangeChange = (range?: { from?: Date; to?: Date }) => {
    if (!range?.from) {
      setSelectedPreset("all");
      const allR = getDateRangeFromPreset("all");
      setDateRange(allR);
      updateFilter({
        from: "2026-01-01T00:00:00.000Z",
        to: allR.to.toISOString(),
        unit: "month",
      });
      return;
    }

    setDateRange(range);
    setSelectedPreset("custom");

    const fromDate = range.from;
    const toDate = range.to || range.from;
    const diffDays = Math.round((toDate.getTime() - fromDate.getTime()) / (24 * 60 * 60 * 1000));
    const unit: "hour" | "day" | "week" | "month" =
      diffDays <= 2 ? "hour" : diffDays <= 45 ? "day" : diffDays <= 180 ? "week" : "month";

    updateFilter({
      from: fromDate.toISOString(),
      to: toDate.toISOString(),
      unit,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Filter & Tools Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-card border border-border/70 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shrink-0">
            <Globe2 className="size-4.5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-semibold text-foreground tracking-tight">
              Website Telemetry & Traffic
            </h2>
            <p className="text-xs text-muted-foreground">
              Real-time reader engagement, visitor geography, and device analytics
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

          {/* Diagnostic Dialog Trigger */}
          <WebsiteDiagnosticDialog
            diagnostic={diagnostic}
            onOpen={fetchDiagnostic}
          />

          {/* Reset Tracker Button */}
          <WebsiteResetModal
            onReset={resetStats}
            isResetting={isResetting}
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

      {/* 1. Live Badge & 5 KPI Cards */}
      <WebsiteTelemetryKpis
        stats={data.stats}
        activeUsers={data.activeUsers}
        isLoading={isLoading}
      />

      {/* 2. Pageviews & Sessions Area Timeline Chart */}
      <WebsitePageviewsChart
        pageviewsData={data.pageviews}
        unit={filter.unit}
        onUnitChange={(unit) => updateFilter({ unit })}
        isLoading={isLoading}
      />

      {/* 3. Multi-dimensions Breakdown & Realtime Stream (2 columns) */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <WebsiteDimensionsBreakdown
            metrics={data.metrics}
            activeDimension={filter.dimensionType}
            onDimensionChange={(dimensionType) => updateFilter({ dimensionType })}
            isLoading={isLoading}
          />
        </div>

        <div className="lg:col-span-5">
          <WebsiteRealtimeStream
            realtimeData={data.realtime}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* 4. Audience Survey Telemetry */}
      <WebsiteAudienceSurveyCard
        from={filter.from}
        to={filter.to}
      />
    </div>
  );
}
