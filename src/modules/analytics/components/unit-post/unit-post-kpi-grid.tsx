"use client";

import React from "react";
import { motion } from "motion/react";
import {
  FileText,
  CheckCircle2,
  Clock,
  Eye,
  Languages,
  Users2,
  FileCheck,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NumberTicker } from "@/components/ui/number-ticker";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  PostContentDistributionUnitDto,
  PostEngagementSummaryUnitDto,
  PostWorkflowSummaryUnitDto,
  PostAuthorSummaryUnitDto,
} from "../../types";

interface UnitPostKpiGridProps {
  distribution: PostContentDistributionUnitDto | null;
  engagement: PostEngagementSummaryUnitDto | null;
  workflow: PostWorkflowSummaryUnitDto | null;
  authorSummary: PostAuthorSummaryUnitDto | null;
  isLoading: boolean;
}

export function UnitPostKpiGrid({
  distribution,
  engagement,
  workflow,
  authorSummary,
  isLoading,
}: UnitPostKpiGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
    );
  }

  const kpis = [
    {
      title: "Total Posts",
      numericValue: distribution?.totalPosts ?? 0,
      decimalPlaces: 0,
      suffix: "",
      description: `${distribution?.publishedCount ?? 0} published, ${distribution?.inProgressCount ?? 0} drafting`,
      icon: <FileText className="size-4 text-blue-600 dark:text-blue-400" />,
      accent: "blue" as const,
    },
    {
      title: "Post Views",
      numericValue: engagement?.totalViewCount ?? 0,
      decimalPlaces: 0,
      suffix: "",
      description: "Total reader engagement for track posts",
      icon: <Eye className="size-4 text-blue-600 dark:text-blue-400" />,
      accent: "blue" as const,
    },
    {
      title: "Bilingual Ratio",
      numericValue: Number((engagement?.bilingualRatioPercent ?? 0).toFixed(1)),
      decimalPlaces: 1,
      suffix: "%",
      description: "Posts with multiple language editions",
      icon: <Languages className="size-4 text-blue-600 dark:text-blue-400" />,
      accent: "blue" as const,
    },
    {
      title: "Collaboration Index",
      numericValue: Number((authorSummary?.collaborationIndexPercent ?? 0).toFixed(1)),
      decimalPlaces: 1,
      suffix: "%",
      description: `Avg ${authorSummary?.averageCollaboratorsPerPost ?? 0} co-authors per post`,
      icon: <Users2 className="size-4 text-blue-600 dark:text-blue-400" />,
      accent: "blue" as const,
    },
    {
      title: "Time to Publish",
      numericValue: Number(Math.max(0, Math.abs(workflow?.averageDaysToPublish ?? 0)).toFixed(1)),
      decimalPlaces: 1,
      suffix: " days",
      description: `Median: ${Number(Math.max(0, Math.abs(workflow?.medianDaysToPublish ?? 0)).toFixed(1))} days`,
      icon: <Clock className="size-4 text-blue-600 dark:text-blue-400" />,
      accent: "blue" as const,
    },
    {
      title: "Review Rounds",
      numericValue: Number((workflow?.averageTotalRounds ?? 0).toFixed(1)),
      decimalPlaces: 1,
      suffix: " rounds",
      description: `Consensus: ${workflow?.averageConsensusRounds ?? 0}, Revision: ${workflow?.averageRejectionRounds ?? 0}`,
      icon: <FileCheck className="size-4 text-blue-600 dark:text-blue-400" />,
      accent: "blue" as const,
    },
    {
      title: "Active Reviewers",
      numericValue: workflow?.activeReviewersCount ?? 0,
      decimalPlaces: 0,
      suffix: " people",
      description: `${workflow?.totalAssignmentsCount ?? 0} review assignments`,
      icon: <CheckCircle2 className="size-4 text-blue-600 dark:text-blue-400" />,
      accent: "blue" as const,
    },
    {
      title: "Rejection Rate",
      numericValue: Number((workflow?.rejectionRatePercent ?? 0).toFixed(1)),
      decimalPlaces: 1,
      suffix: "%",
      description: "Initial editorial revision rate",
      icon: <AlertCircle className="size-4 text-red-600 dark:text-red-400" />,
      accent: "red" as const,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5 lg:grid-cols-4">
      {kpis.map((kpi, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: index * 0.03 }}
          className="flex"
        >
          <div className="group relative flex w-full flex-col justify-between rounded-2xl border border-border/70 bg-card p-3.5 sm:p-4.5 text-left shadow-2xs hover:border-border hover:shadow-md transition-all duration-300 overflow-hidden h-full min-h-[108px] sm:min-h-[118px]">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-medium text-muted-foreground truncate">
                {kpi.title}
              </span>
              <div
                className={cn(
                  "p-1.5 sm:p-2 rounded-xl border shrink-0 transition-transform duration-300 group-hover:scale-110",
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
                <span className="text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight tabular-nums text-foreground">
                  <NumberTicker
                    value={kpi.numericValue}
                    decimalPlaces={kpi.decimalPlaces}
                    className="text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight tabular-nums text-foreground"
                  />
                </span>
                {kpi.suffix && (
                  <span className="text-xs font-medium text-muted-foreground">
                    {kpi.suffix.trim()}
                  </span>
                )}
              </div>
              {kpi.description ? (
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {kpi.description}
                </p>
              ) : null}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
