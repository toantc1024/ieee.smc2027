"use client";

import React, { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import { Activity, Clock } from "lucide-react";
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
import type { WebsitePageviewsDto, WebsiteTimeScaleUnit } from "../../types";

interface WebsitePageviewsChartProps {
  pageviewsData: WebsitePageviewsDto | null;
  unit: WebsiteTimeScaleUnit | string;
  onUnitChange: (unit: WebsiteTimeScaleUnit | string) => void;
  isLoading: boolean;
}

const chartConfig = {
  views: {
    label: "Pageviews",
    color: "#2563eb",
  },
  sessions: {
    label: "Sessions",
    color: "#e11d48",
  },
} satisfies ChartConfig;

const units: { label: string; value: WebsiteTimeScaleUnit }[] = [
  { label: "Hour", value: "hour" },
  { label: "Day", value: "day" },
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
];

export function WebsitePageviewsChart({
  pageviewsData,
  unit,
  onUnitChange,
  isLoading,
}: WebsitePageviewsChartProps) {
  const chartData = useMemo(() => {
    const rawViews = pageviewsData?.pageviews ?? [];
    const rawSessions = pageviewsData?.sessions ?? [];

    const map = new Map<string, { x: string; views: number; sessions: number }>();

    for (const v of rawViews) {
      const xKey = v.x.slice(0, 10);
      map.set(xKey, { x: xKey, views: v.y, sessions: 0 });
    }

    for (const s of rawSessions) {
      const xKey = s.x.slice(0, 10);
      const entry = map.get(xKey) || { x: xKey, views: 0, sessions: 0 };
      entry.sessions = s.y;
      map.set(xKey, entry);
    }

    const res = Array.from(map.values()).sort((a, b) => a.x.localeCompare(b.x));

    if (res.length === 1) {
      return [{ ...res[0] }, { ...res[0], x: res[0].x + " " }];
    }
    return res;
  }, [pageviewsData]);

  const totalViews = chartData.reduce((acc, d) => acc + d.views, 0);
  const totalSessions = chartData.reduce((acc, d) => acc + d.sessions, 0);

  if (isLoading) {
    return <Skeleton className="h-[360px] w-full rounded-2xl" />;
  }

  return (
    <Card className="relative overflow-hidden rounded-2xl border border-border/70 bg-card shadow-2xs">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3.5 pb-2 pt-4 sm:pt-5">
        <div>
          <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shrink-0">
              <Activity className="size-4" />
            </div>
            <span>Traffic Activity & Timeline</span>
          </CardTitle>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300 font-medium text-xs">
              <span className="size-1.5 rounded-full bg-blue-600" />
              <span>Views: <b className="font-semibold">{totalViews.toLocaleString()}</b></span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-300 font-medium text-xs">
              <span className="size-1.5 rounded-full bg-red-600" />
              <span>Sessions: <b className="font-semibold">{totalSessions.toLocaleString()}</b></span>
            </div>
          </div>

          <div className="flex items-center gap-0.5 bg-muted/60 p-1 rounded-xl border border-border/60 h-8">
            {units.map((u) => (
              <button
                key={u.value}
                type="button"
                onClick={() => onUnitChange(u.value)}
                className={cn(
                  "h-full px-2.5 text-xs rounded-lg transition-all cursor-pointer flex items-center justify-center shrink-0",
                  unit === u.value
                    ? "bg-background text-foreground shadow-2xs border border-border/60 font-semibold"
                    : "text-muted-foreground hover:text-foreground font-medium"
                )}
              >
                {u.label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {chartData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[260px] text-center p-6 text-slate-500 dark:text-slate-400">
            <Clock className="size-10 stroke-1 mb-2 text-slate-400" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">No traffic recorded for this period</p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[290px] w-full">
            <AreaChart
              key={`pageviews-chart-${unit}`}
              data={chartData}
              margin={{ left: -10, right: 10, top: 12, bottom: 0 }}
            >
              <defs>
                <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity={0.4} />
                  <stop offset="60%" stopColor="#2563eb" stopOpacity={0.1} />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity={0.0} />
                </linearGradient>

                <linearGradient id="sessionsGrad" x1="0" y1="0" x2="0" y2="1">
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
                dataKey="x"
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
                    labelFormatter={(label: unknown) => `Date: ${String(label)}`}
                  />
                }
              />

              <Area
                type="monotone"
                dataKey="views"
                name="Pageviews"
                stroke="#2563eb"
                strokeWidth={2.5}
                fill="url(#viewsGrad)"
                isAnimationActive={true}
                animationDuration={450}
                animationEasing="ease-out"
                activeDot={{ r: 6, stroke: "#2563eb", strokeWidth: 2, fill: "#ffffff" }}
              />

              <Area
                type="monotone"
                dataKey="sessions"
                name="Sessions"
                stroke="#e11d48"
                strokeWidth={2.5}
                fill="url(#sessionsGrad)"
                isAnimationActive={true}
                animationDuration={450}
                animationEasing="ease-out"
                activeDot={{ r: 6, stroke: "#e11d48", strokeWidth: 2, fill: "#ffffff" }}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
