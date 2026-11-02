"use client";

import React from "react";
import { Flame } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { PostOverviewActivityMapSystemDto } from "../../types";

interface SystemActivityHeatmapProps {
  activityData: PostOverviewActivityMapSystemDto | null;
  isLoading: boolean;
}

const dayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const hours = Array.from({ length: 24 }, (_, i) => i);

export function SystemActivityHeatmap({
  activityData,
  isLoading,
}: SystemActivityHeatmapProps) {
  if (isLoading) {
    return <Skeleton className="h-[320px] rounded-2xl" />;
  }

  const grid = activityData?.activityGrid ?? [];
  const maxCount = Math.max(1, ...grid.map((p) => p.count));

  const matrix: number[][] = Array.from({ length: 7 }, () =>
    Array(24).fill(0)
  );

  grid.forEach((point) => {
    if (
      point.dayOfWeek >= 0 &&
      point.dayOfWeek < 7 &&
      point.hourOfDay >= 0 &&
      point.hourOfDay < 24
    ) {
      matrix[point.dayOfWeek][point.hourOfDay] = point.count;
    }
  });

  const getIntensityClass = (count: number) => {
    if (count === 0) return "bg-muted/50 hover:bg-muted";
    const ratio = count / maxCount;
    if (ratio < 0.25) return "bg-blue-500/30 hover:brightness-110";
    if (ratio < 0.5) return "bg-blue-600/70 text-white hover:brightness-110";
    if (ratio < 0.75) return "bg-rose-500/80 text-white hover:brightness-110";
    return "bg-red-600 text-white font-bold hover:brightness-110";
  };

  return (
    <Card className="relative border border-border/70 bg-card shadow-xs overflow-hidden rounded-2xl">
      <CardHeader className="pb-4 pt-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2.5 text-foreground">
            <div className="p-2 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
              <Flame className="size-4" />
            </div>
            <span>Publishing Activity Heatmap Matrix</span>
          </CardTitle>

          <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
            <span>Low</span>
            <div className="flex gap-1 items-center">
              <div className="size-3 rounded-xs bg-muted border border-border/60" />
              <div className="size-3 rounded-xs bg-blue-500/30" />
              <div className="size-3 rounded-xs bg-blue-600/70" />
              <div className="size-3 rounded-xs bg-rose-500/80" />
              <div className="size-3 rounded-xs bg-red-600" />
            </div>
            <span>High activity</span>
          </div>
        </div>
        <CardDescription className="text-xs text-muted-foreground">
          Distribution of published articles across all 168 hours of the week
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-0 overflow-x-auto pb-4">
        <div className="min-w-[640px] space-y-1.5">
          {/* Header Hours Labels */}
          <div className="grid grid-cols-[80px_repeat(24,1fr)] gap-1 text-[10px] text-muted-foreground text-center font-medium">
            <span className="text-left pl-1">Hour</span>
            {hours.map((h) => (
              <span key={h} className="truncate">
                {h}h
              </span>
            ))}
          </div>

          {/* 7 Days Rows */}
          {dayNames.map((dayName, dayIndex) => (
            <div
              key={dayIndex}
              className="grid grid-cols-[80px_repeat(24,1fr)] gap-1 items-center"
            >
              <span className="text-xs font-medium text-foreground truncate pl-1">
                {dayName}
              </span>

              {hours.map((hour) => {
                const count = matrix[dayIndex][hour];
                return (
                  <div
                    key={hour}
                    className={`h-6 rounded-md transition-all flex items-center justify-center text-[10px] cursor-pointer group relative ${getIntensityClass(
                      count
                    )}`}
                    title={`${dayName} at ${hour}:00 - ${count} published`}
                  >
                    {count > 0 && <span className="opacity-0 group-hover:opacity-100">{count}</span>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
