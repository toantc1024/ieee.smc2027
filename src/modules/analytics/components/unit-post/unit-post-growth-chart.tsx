"use client";

import React, { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  TrendingUp,
  Calendar,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  PostContentGrowthUnitDto,
  PostAnalyticsGranularity,
} from "../../types";

interface UnitPostGrowthChartProps {
  growthData: PostContentGrowthUnitDto | null;
  granularity: PostAnalyticsGranularity;
  onGranularityChange: (granularity: PostAnalyticsGranularity) => void;
  isLoading: boolean;
}

const chartConfig = {
  created: {
    label: "Created",
    color: "#2563eb",
  },
  published: {
    label: "Published",
    color: "#e11d48",
  },
} satisfies ChartConfig;

const granularities: { label: string; value: PostAnalyticsGranularity }[] = [
  { label: "Day", value: "DAY" },
  { label: "Week", value: "WEEK" },
  { label: "Month", value: "MONTH" },
  { label: "Quarter", value: "QUARTER" },
  { label: "Year", value: "YEAR" },
];

export function UnitPostGrowthChart({
  growthData,
  granularity,
  onGranularityChange,
  isLoading,
}: UnitPostGrowthChartProps) {
  const rawDataPoints = growthData?.dataPoints ?? [];
  const totalCreated = rawDataPoints.reduce((acc, p) => acc + (p.created || 0), 0);
  const totalPublished = rawDataPoints.reduce((acc, p) => acc + (p.published || 0), 0);

  const dataPoints = useMemo(() => {
    if (rawDataPoints.length === 1) {
      const single = rawDataPoints[0];
      return [
        { ...single, period: single.period },
        { ...single, period: single.period + " " },
      ];
    }
    return rawDataPoints;
  }, [rawDataPoints]);

  if (isLoading) {
    return <Skeleton className="h-[360px] w-full rounded-2xl" />;
  }

  return (
    <Card className="relative overflow-hidden rounded-2xl border border-border/70 bg-card shadow-2xs">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3.5 pb-2 pt-4 sm:pt-5">
        <div>
          <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shrink-0">
              <TrendingUp className="size-4" />
            </div>
            <span>Content Publishing Growth</span>
          </CardTitle>
        </div>

        {/* Action Controls & Metric Badges */}
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
          {/* Quick Metrics Badges */}
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300 font-medium text-xs">
              <span className="size-1.5 rounded-full bg-blue-600" />
              <span>Created: <b className="font-semibold">{totalCreated}</b></span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-300 font-medium text-xs">
              <span className="size-1.5 rounded-full bg-red-600" />
              <span>Published: <b className="font-semibold">{totalPublished}</b></span>
            </div>
          </div>

          {/* Granularity Switcher */}
          <div className="flex items-center gap-0.5 bg-muted/60 p-1 rounded-xl border border-border/60 h-8 overflow-x-auto max-w-full">
            {granularities.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => onGranularityChange(item.value)}
                className={cn(
                  "h-full px-2 sm:px-2.5 text-xs rounded-lg transition-all cursor-pointer flex items-center justify-center shrink-0",
                  granularity === item.value
                    ? "bg-background text-foreground shadow-2xs border border-border/60 font-semibold"
                    : "text-muted-foreground hover:text-foreground font-medium"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {dataPoints.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[260px] text-center p-6 text-slate-500 dark:text-slate-400">
            <Calendar className="size-10 stroke-1 mb-2 text-slate-400" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">No publishing data in this date range</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Try adjusting the date filter or granularity
            </p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[290px] w-full">
            <AreaChart
              key={`growth-chart-${granularity}`}
              data={dataPoints}
              margin={{ left: -10, right: 10, top: 12, bottom: 0 }}
            >
              <defs>
                <linearGradient id="createdGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity={0.4} />
                  <stop offset="60%" stopColor="#2563eb" stopOpacity={0.1} />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity={0.0} />
                </linearGradient>

                <linearGradient id="publishedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#e11d48" stopOpacity={0.45} />
                  <stop offset="60%" stopColor="#e11d48" stopOpacity={0.12} />
                  <stop offset="100%" stopColor="#e11d48" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                vertical={false}
                strokeDasharray="4 4"
                className="stroke-slate-200/60 dark:stroke-slate-800/60"
              />

              <XAxis
                dataKey="period"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                className="text-[11px] font-semibold fill-slate-500 dark:fill-slate-400"
              />

              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                allowDecimals={false}
                className="text-[11px] font-semibold fill-slate-500 dark:fill-slate-400"
              />

              <ChartTooltip
                content={
                  <ChartTooltipContent
                    indicator="dot"
                    labelFormatter={(label: unknown) => `Period: ${String(label)}`}
                  />
                }
              />

              <Area
                type="monotone"
                dataKey="created"
                name="Created Posts"
                stroke="#2563eb"
                strokeWidth={2.5}
                fill="url(#createdGrad)"
                isAnimationActive={true}
                animationDuration={450}
                animationEasing="ease-out"
                activeDot={{ r: 6, stroke: "#2563eb", strokeWidth: 2, fill: "#ffffff" }}
              />

              <Area
                type="monotone"
                dataKey="published"
                name="Published Posts"
                stroke="#e11d48"
                strokeWidth={3}
                fill="url(#publishedGrad)"
                isAnimationActive={true}
                animationDuration={450}
                animationEasing="ease-out"
                activeDot={{ r: 7, stroke: "#e11d48", strokeWidth: 2, fill: "#ffffff" }}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
