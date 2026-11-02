"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  FolderTree,
  Tag,
  Laptop,
  Smartphone,
  Tablet,
  HelpCircle,
  Layers,
  FileBox,
  Hash,
  Languages,
  AlertTriangle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatLocalizedName } from "../../utils/analytics-formatters";
import type {
  PostContentDistributionUnitDto,
  PostEngagementSummaryUnitDto,
} from "../../types";

interface UnitPostDistributionChartsProps {
  distribution: PostContentDistributionUnitDto | null;
  engagement: PostEngagementSummaryUnitDto | null;
  isLoading: boolean;
}

const deviceColors: Record<string, string> = {
  DESKTOP: "#2563eb",
  MOBILE: "#e11d48",
  TABLET: "#06b6d4",
  UNKNOWN: "#94a3b8",
};

const deviceIcons: Record<string, React.ReactNode> = {
  DESKTOP: <Laptop className="size-4 text-blue-600 dark:text-blue-400" />,
  MOBILE: <Smartphone className="size-4 text-red-600 dark:text-red-400" />,
  TABLET: <Tablet className="size-4 text-cyan-600 dark:text-cyan-400" />,
  UNKNOWN: <HelpCircle className="size-4 text-slate-400" />,
};

const deviceLabels: Record<string, string> = {
  DESKTOP: "Desktop",
  MOBILE: "Mobile",
  TABLET: "Tablet",
  UNKNOWN: "Unknown",
};

export function UnitPostDistributionCharts({
  distribution,
  engagement,
  isLoading,
}: UnitPostDistributionChartsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-[340px] rounded-2xl" />
        <Skeleton className="h-[340px] rounded-2xl" />
        <Skeleton className="h-[340px] rounded-2xl" />
      </div>
    );
  }

  // 1. Prepare Device Distribution Data
  const deviceRaw = engagement?.deviceDistribution || {};
  const deviceData = Object.entries(deviceRaw)
    .filter(([_, percent]) => percent > 0)
    .map(([key, percent]) => ({
      name: deviceLabels[key] || key,
      deviceKey: key,
      value: Number(percent.toFixed(1)),
      fill: deviceColors[key] || "#cbd5e1",
    }));

  // 2. Prepare Category Data (Top 5)
  const categoriesData = (distribution?.categories || [])
    .slice(0, 5)
    .map((c) => ({
      name: formatLocalizedName(c.categoryName, "en"),
      count: c.postCount,
    }));

  // 3. Status breakdown numbers
  const statusRaw = distribution?.statusDistribution || {};
  const draftCount = statusRaw["DRAFT"] || 0;
  const publishedCount = statusRaw["PUBLISHED"] || distribution?.publishedCount || 0;
  const hiddenCount = statusRaw["HIDDEN"] || statusRaw["ARCHIVED"] || 0;
  const total = distribution?.totalPosts || draftCount + publishedCount + hiddenCount || 1;

  const draftPercent = Math.round((draftCount / total) * 100);
  const publishedPercent = Math.round((publishedCount / total) * 100);
  const hiddenPercent = Math.round((hiddenCount / total) * 100);

  return (
    <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Card 1: Content Status & Inventory Breakdown */}
      <Card className="rounded-2xl border border-border/70 bg-card shadow-2xs flex flex-col justify-between">
        <CardHeader className="pb-3 pt-4 sm:pt-5">
          <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shrink-0">
              <FileBox className="size-4" />
            </div>
            <span>Content Status Breakdown</span>
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-1 flex-1 flex flex-col justify-between gap-4">
          {/* Progress Stack Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium text-muted-foreground">
              <span>Published: <strong className="text-foreground">{publishedPercent}%</strong></span>
              <span>Drafting: <strong className="text-foreground">{draftPercent}%</strong></span>
              <span>Archived: <strong className="text-foreground">{hiddenPercent}%</strong></span>
            </div>
            <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted/60 p-0.5 border border-border/60">
              {publishedPercent > 0 && (
                <div
                  style={{ width: `${publishedPercent}%` }}
                  className="h-full bg-blue-600 rounded-full transition-all duration-500"
                  title={`Published: ${publishedCount} (${publishedPercent}%)`}
                />
              )}
              {draftPercent > 0 && (
                <div
                  style={{ width: `${draftPercent}%` }}
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  title={`Draft: ${draftCount} (${draftPercent}%)`}
                />
              )}
              {hiddenPercent > 0 && (
                <div
                  style={{ width: `${hiddenPercent}%` }}
                  className="h-full bg-slate-400 dark:bg-slate-500 rounded-full transition-all duration-500"
                  title={`Archived: ${hiddenCount} (${hiddenPercent}%)`}
                />
              )}
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <span className="text-[11px] font-medium text-blue-700 dark:text-blue-300 block mb-0.5">Published</span>
              <span className="text-lg font-semibold tracking-tight text-blue-900 dark:text-blue-100 tabular-nums">{publishedCount}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <span className="text-[11px] font-medium text-amber-700 dark:text-amber-300 block mb-0.5">Draft</span>
              <span className="text-lg font-semibold tracking-tight text-amber-900 dark:text-amber-100 tabular-nums">{draftCount}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-muted/60 border border-border/60">
              <span className="text-[11px] font-medium text-muted-foreground block mb-0.5">Archived</span>
              <span className="text-lg font-semibold tracking-tight text-foreground tabular-nums">{hiddenCount}</span>
            </div>
          </div>

          {/* Language & Extra Indicators */}
          <div className="pt-3 border-t border-border/60 text-xs space-y-2">
            <div className="flex justify-between items-center text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Languages className="size-3.5 text-blue-500" />
                Bilingual ratio:
              </span>
              <span className="font-semibold text-blue-600 dark:text-blue-400 tabular-nums">
                {(engagement?.bilingualRatioPercent ?? 0).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="size-3.5 text-amber-500" />
                Uncategorized posts:
              </span>
              <span className={`font-semibold tabular-nums ${(distribution?.uncategorizedCount ?? 0) > 0 ? "text-amber-600 dark:text-amber-400" : "text-foreground"}`}>
                {distribution?.uncategorizedCount ?? 0}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 2: Category & Top Tags Distribution */}
      <Card className="relative overflow-hidden rounded-2xl border border-border/70 bg-card shadow-2xs flex flex-col justify-between">
        <CardHeader className="pb-3 pt-4 sm:pt-5">
          <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shrink-0">
              <FolderTree className="size-4" />
            </div>
            <span>Categories & Tags</span>
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-1 flex-1 flex flex-col justify-between gap-4">
          {/* Categories Horizontal Bars */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
              <span>Top Categories</span>
              <span className="text-[11px]">{categoriesData.length} tracks</span>
            </div>
            {categoriesData.length === 0 ? (
              <p className="text-xs text-muted-foreground py-2 italic">No categorized posts recorded</p>
            ) : (
              <div className="space-y-2">
                {categoriesData.map((cat, i) => {
                  const ratio = Math.min(100, Math.round((cat.count / (distribution?.totalPosts || 1)) * 100));
                  return (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="truncate max-w-[200px] font-medium text-foreground" title={cat.name}>
                          {cat.name}
                        </span>
                        <span className="text-muted-foreground font-semibold tabular-nums shrink-0 ml-2">
                          {cat.count}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-muted/60 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${ratio}%` }}
                          className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-300"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Top Tags Cloud */}
          <div className="space-y-2 pt-3 border-t border-border/60">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
              <span className="flex items-center gap-1.5">
                <Tag className="size-3.5 text-blue-500" />
                <span>Featured Topics</span>
              </span>
              <span className="text-[11px]">
                {Math.min(8, (distribution?.topTags || []).length)} tags
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(distribution?.topTags || []).length === 0 ? (
                <p className="text-xs text-muted-foreground italic py-1">No tags assigned yet</p>
              ) : (
                (distribution?.topTags || []).slice(0, 8).map((t, i) => {
                  const localizedTag = formatLocalizedName(t.tagName, "en") || t.tagName;
                  return (
                    <Badge
                      key={i}
                      variant="outline"
                      className="text-xs font-medium bg-muted/50 hover:bg-muted border-border/70 py-1 px-2.5 gap-1.5 rounded-lg transition-colors inline-flex items-center"
                    >
                      <Hash className="size-3 text-muted-foreground/70" />
                      <span className="truncate max-w-[150px]" title={localizedTag}>{localizedTag}</span>
                      <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-1.5 py-0.2 rounded-md tabular-nums">
                        {t.postCount}
                      </span>
                    </Badge>
                  );
                })
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 3: Device Access Distribution */}
      <Card className="relative overflow-hidden rounded-2xl border border-border/70 bg-card shadow-2xs flex flex-col justify-between">
        <CardHeader className="pb-3 pt-4 sm:pt-5">
          <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shrink-0">
              <Laptop className="size-4" />
            </div>
            <span>Reader Device Distribution</span>
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-1 flex-1 flex flex-col items-center justify-between gap-4">
          {deviceData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[200px] text-center text-muted-foreground">
              <Layers className="size-8 stroke-1 mb-1 text-muted-foreground/40" />
              <p className="text-xs">No device telemetry recorded</p>
            </div>
          ) : (
            <div className="w-full flex flex-col sm:flex-row items-center justify-around gap-4 py-1">
              <div className="size-32 sm:size-36 relative flex items-center justify-center shrink-0">
                <ResponsiveContainer width="100%" height="100%" debounce={50}>
                  <PieChart>
                    <Tooltip
                      formatter={(val: number, name: string) => [`${val}%`, name]}
                      contentStyle={{
                        backgroundColor: "var(--background)",
                        borderColor: "var(--border)",
                        borderRadius: "0.75rem",
                        fontSize: "0.75rem",
                      }}
                    />
                    <Pie
                      data={deviceData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={62}
                      paddingAngle={3}
                      isAnimationActive={true}
                      animationDuration={500}
                    >
                      {deviceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} stroke="transparent" />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-col gap-2.5 w-full sm:w-auto">
                {deviceData.map((d, i) => (
                  <div key={i} className="flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-lg bg-muted/80 border border-border/60">
                        {deviceIcons[d.deviceKey] || <HelpCircle className="size-3.5" />}
                      </div>
                      <span className="font-medium text-foreground">{d.name}</span>
                    </div>
                    <span className="font-semibold text-foreground tabular-nums">{d.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reader Access Summary Footer */}
          <div className="w-full rounded-xl bg-muted/40 border border-border/60 p-2.5 text-xs flex justify-between items-center">
            <span className="text-muted-foreground font-medium">
              Total Engagement:
            </span>
            <span className="font-semibold text-foreground tabular-nums">
              {(engagement?.totalViewCount ?? 0).toLocaleString()} views
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
