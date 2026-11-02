"use client";

import React from "react";
import { motion } from "motion/react";
import {
  Globe2,
  FileCheck,
  FileEdit,
  Eye,
  Building2,
  BarChart2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NumberTicker } from "@/components/ui/number-ticker";
import { Skeleton } from "@/components/ui/skeleton";
import type { PostOverviewSummarySystemDto } from "../../types";

interface SystemOverviewKpisProps {
  overviewData: PostOverviewSummarySystemDto | null;
  isLoading: boolean;
}

export function SystemOverviewKpis({
  overviewData,
  isLoading,
}: SystemOverviewKpisProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-40 rounded-2xl" />
      </div>
    );
  }

  const kpis = [
    {
      title: "Total Conference Posts",
      numericValue: overviewData?.totalPosts ?? 0,
      suffix: "",
      description: "Complete portal publication scope",
      icon: <Globe2 className="size-4" />,
      iconStyle: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25",
    },
    {
      title: "Published Articles",
      numericValue: overviewData?.publishedCount ?? 0,
      suffix: "",
      description: "Approved & active online",
      icon: <FileCheck className="size-4" />,
      iconStyle: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25",
    },
    {
      title: "Drafting Queue",
      numericValue: overviewData?.inProgressCount ?? 0,
      suffix: "",
      description: "Under preparation & review",
      icon: <FileEdit className="size-4" />,
      iconStyle: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/25",
    },
    {
      title: "Total Reader Views",
      numericValue: overviewData?.totalViews ?? 0,
      suffix: "",
      description: `Across ${overviewData?.tenantTraffics?.length ?? 0} conference tracks`,
      icon: <Eye className="size-4" />,
      iconStyle: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/25",
    },
  ];

  const tenantTraffics = overviewData?.tenantTraffics ?? [];
  const totalSystemViews = overviewData?.totalViews || 1;

  return (
    <div className="space-y-5">
      {/* 4 Master KPI Cards */}
      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {kpis.map((kpi, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: index * 0.03 }}
            className="flex"
          >
            <div className="relative flex w-full flex-col justify-between overflow-hidden rounded-2xl border border-border/70 bg-card p-4 sm:p-5 text-left shadow-2xs hover:border-border hover:shadow-md transition-all duration-300 h-full min-h-[120px]">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-medium text-muted-foreground truncate tracking-tight">
                  {kpi.title}
                </span>
                <div className={`p-2 rounded-xl border shrink-0 ${kpi.iconStyle}`}>
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
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {kpi.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Cross-Tenant Traffic Breakdown Card */}
      {tenantTraffics.length > 0 && (
        <Card className="relative border border-border/70 bg-card shadow-xs overflow-hidden rounded-2xl">
          <CardHeader className="pb-3 pt-5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2.5 text-foreground">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  <BarChart2 className="size-4" />
                </div>
                Reader Traffic by Conference Track
              </CardTitle>
              <Badge variant="outline" className="text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                {tenantTraffics.length} tracks
              </Badge>
            </div>
            <CardDescription className="text-xs text-muted-foreground">
              Proportion of views across technical tracks and conference sections
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0 pb-5">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {tenantTraffics.map((t, idx) => {
                const percent = Math.round((t.totalViews / totalSystemViews) * 100);

                return (
                  <div
                    key={t.tenantCode || idx}
                    className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 space-y-2.5 hover:bg-muted/70 transition-all"
                  >
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-semibold text-foreground truncate flex items-center gap-1.5">
                        <Building2 className="size-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                        {t.tenantName || t.tenantDescription || t.tenantCode}
                      </span>
                      <span className="font-bold text-foreground shrink-0 tabular-nums">
                        {t.totalViews.toLocaleString()} views
                      </span>
                    </div>

                    <div className="h-2 w-full bg-muted/80 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${Math.max(3, percent)}%` }}
                        className="h-full bg-blue-600 rounded-full transition-all duration-300"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
