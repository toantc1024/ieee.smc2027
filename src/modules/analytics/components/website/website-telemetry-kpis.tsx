"use client";

import React from "react";
import { motion } from "motion/react";
import {
  Eye,
  Users,
  MousePointerClick,
  Percent,
  Clock,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NumberTicker } from "@/components/ui/number-ticker";
import { Skeleton } from "@/components/ui/skeleton";
import type { WebsiteStatsDto, WebsiteActiveUsersDto } from "../../types";

interface WebsiteTelemetryKpisProps {
  stats: WebsiteStatsDto | null;
  activeUsers: WebsiteActiveUsersDto | null;
  isLoading: boolean;
}

function calculateDiff(metric?: { value: number; prev: number }) {
  if (!metric || metric.prev === 0) {
    return { diffPercent: 0, isPositive: true, isNeutral: true };
  }
  const diff = metric.value - metric.prev;
  const diffPercent = (diff / metric.prev) * 100;
  return {
    diffPercent: Math.abs(diffPercent),
    isPositive: diff >= 0,
    isNeutral: diff === 0,
  };
}

export function WebsiteTelemetryKpis({
  stats,
  activeUsers,
  isLoading,
}: WebsiteTelemetryKpisProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
    );
  }

  const liveVisitors = activeUsers?.visitors ?? 1;

  const pageviewsDiff = calculateDiff(stats?.pageviews);
  const visitorsDiff = calculateDiff(stats?.visitors);
  const visitsDiff = calculateDiff(stats?.visits);
  const bouncesDiff = calculateDiff(stats?.bounces);
  const durationDiff = calculateDiff(stats?.totaltime);

  const totalVisits = stats?.visits?.value || 1;
  const bounceRate = Math.min(100, Math.round(((stats?.bounces?.value || 0) / totalVisits) * 100));
  const avgSeconds = Math.round((stats?.totaltime?.value || 0) / totalVisits);

  const kpis = [
    {
      title: "Pageviews",
      numericValue: stats?.pageviews?.value ?? 0,
      suffix: "",
      diff: pageviewsDiff,
      icon: <Eye className="size-4 text-blue-600 dark:text-blue-400" />,
      prevValue: stats?.pageviews?.prev?.toLocaleString() ?? "0",
      invertDiff: false,
      accent: "blue" as const,
    },
    {
      title: "Unique Visitors",
      numericValue: stats?.visitors?.value ?? 0,
      suffix: "",
      diff: visitorsDiff,
      icon: <Users className="size-4 text-blue-600 dark:text-blue-400" />,
      prevValue: stats?.visitors?.prev?.toLocaleString() ?? "0",
      invertDiff: false,
      accent: "blue" as const,
    },
    {
      title: "Visits & Sessions",
      numericValue: stats?.visits?.value ?? 0,
      suffix: "",
      diff: visitsDiff,
      icon: <MousePointerClick className="size-4 text-blue-600 dark:text-blue-400" />,
      prevValue: stats?.visits?.prev?.toLocaleString() ?? "0",
      invertDiff: false,
      accent: "blue" as const,
    },
    {
      title: "Bounce Rate",
      numericValue: bounceRate,
      suffix: "%",
      diff: bouncesDiff,
      icon: <Percent className="size-4 text-red-600 dark:text-red-400" />,
      prevValue: `${stats?.bounces?.prev ?? 0}`,
      invertDiff: true,
      accent: "red" as const,
    },
    {
      title: "Avg Visit Duration",
      numericValue: avgSeconds,
      suffix: "s",
      diff: durationDiff,
      icon: <Clock className="size-4 text-blue-600 dark:text-blue-400" />,
      prevValue: `${Math.round((stats?.totaltime?.prev || 0) / (stats?.visits?.prev || 1))}s`,
      invertDiff: false,
      accent: "blue" as const,
    },
  ];

  return (
    <div className="space-y-3.5">
      {/* Live Active Visitor Header Strip */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-card border border-border/70 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <span className="size-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Live Active Visitors:
          </span>
          <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-lg border border-blue-500/20 tabular-nums">
            {liveVisitors} online
          </span>
        </div>
        <span className="text-[11px] text-muted-foreground hidden sm:inline font-medium">
          Auto-refresh every 25s
        </span>
      </div>

      {/* 5 KPI Metric Cards */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-5">
        {kpis.map((kpi, idx) => {
          const isGood = kpi.invertDiff ? !kpi.diff.isPositive : kpi.diff.isPositive;

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: idx * 0.03 }}
              className="flex"
            >
              <div className="group relative flex w-full flex-col justify-between rounded-2xl border border-border/70 bg-card p-4 sm:p-5 text-left shadow-2xs hover:border-border hover:shadow-md transition-all duration-300 overflow-hidden h-full min-h-[120px]">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-medium text-muted-foreground truncate">
                    {kpi.title}
                  </span>
                  <div
                    className={cn(
                      "p-2 rounded-xl border shrink-0 transition-transform duration-300 group-hover:scale-110",
                      kpi.accent === "red"
                        ? "bg-red-500/10 border-red-500/25 shadow-xs shadow-red-500/10"
                        : "bg-blue-500/10 border-blue-500/25 shadow-xs shadow-blue-500/10"
                    )}
                  >
                    {kpi.icon}
                  </div>
                </div>

                <div className="my-1">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl sm:text-3xl font-semibold tracking-tight tabular-nums text-foreground">
                      <NumberTicker
                        value={kpi.numericValue}
                        className="text-2xl sm:text-3xl font-semibold tracking-tight tabular-nums text-foreground"
                      />
                    </span>
                    {kpi.suffix && (
                      <span className="text-xs font-medium text-muted-foreground">
                        {kpi.suffix.trim()}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 mt-1.5 text-[11px]">
                    {!kpi.diff.isNeutral && (
                      <span
                        className={cn(
                          "flex items-center font-bold px-1.5 py-0.5 rounded-md text-[10px]",
                          isGood
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                            : "bg-red-500/10 text-red-700 dark:text-red-300"
                        )}
                      >
                        {kpi.diff.isPositive ? (
                          <ArrowUp className="size-3 mr-0.5" />
                        ) : (
                          <ArrowDown className="size-3 mr-0.5" />
                        )}
                        {kpi.diff.diffPercent.toFixed(1)}%
                      </span>
                    )}
                    <span className="text-slate-400 dark:text-slate-500 text-[10px]">
                      vs previous
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
