"use client";

import React from "react";
import {
  FileCheck2,
  Clock3,
  ThumbsUp,
  RotateCcw,
  Users,
  ShieldCheck,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPositiveDays } from "../../utils/analytics-formatters";
import type { PostWorkflowSummaryUnitDto } from "../../types";

interface UnitPostWorkflowCardProps {
  workflowData: PostWorkflowSummaryUnitDto | null;
  isLoading: boolean;
}

export function UnitPostWorkflowCard({
  workflowData,
  isLoading,
}: UnitPostWorkflowCardProps) {
  if (isLoading) {
    return <Skeleton className="h-[280px] rounded-2xl" />;
  }

  const consensusRounds = workflowData?.averageConsensusRounds ?? 0;
  const rejectionRounds = workflowData?.averageRejectionRounds ?? 0;
  const totalRounds = workflowData?.averageTotalRounds || consensusRounds + rejectionRounds || 1;
  const consensusPercent = Math.min(100, Math.max(0, Math.round((consensusRounds / totalRounds) * 100)));
  const revisionPercent = 100 - consensusPercent;

  const avgDaysStr = formatPositiveDays(workflowData?.averageDaysToPublish, 1);
  const medianDaysStr = formatPositiveDays(workflowData?.medianDaysToPublish, 1);
  const avgRoundsStr = (workflowData?.averageTotalRounds ?? 0).toFixed(1);
  const rejectionRateStr = (workflowData?.rejectionRatePercent ?? 0).toFixed(1);

  return (
    <Card className="relative overflow-hidden rounded-2xl border border-border/70 bg-card shadow-2xs">
      <CardHeader className="pb-3 pt-4 sm:pt-5">
        <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shrink-0">
            <FileCheck2 className="size-4" />
          </div>
          <span>Review Workflow & Publishing Efficiency</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Consensus vs Rejection Breakdown */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between text-xs font-medium gap-2">
            <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
              <ThumbsUp className="size-3.5" />
              <span>Direct consensus approval: {consensusRounds.toFixed(1)} rounds</span>
            </span>
            <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
              <RotateCcw className="size-3.5" />
              <span>Required revisions: {rejectionRounds.toFixed(1)} rounds</span>
            </span>
          </div>

          <div className="h-2.5 w-full bg-amber-500/15 rounded-full overflow-hidden flex p-0.5 border border-amber-500/20">
            <div
              style={{ width: `${consensusPercent}%` }}
              className="bg-blue-600 dark:bg-blue-500 h-full rounded-full transition-all duration-500"
              title={`Direct consensus: ${consensusPercent}%, Revisions required: ${revisionPercent}%`}
            />
          </div>
        </div>

        {/* 4 Metric Columns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          {/* 1. Avg Days */}
          <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <Clock3 className="size-3.5 text-blue-500" />
              <span>Avg Days</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground tabular-nums">
                {avgDaysStr}
              </span>
              <span className="text-xs font-medium text-muted-foreground">days</span>
            </div>
            <p className="text-xs text-muted-foreground truncate">
              Median: <strong className="font-semibold text-foreground tabular-nums">{medianDaysStr}</strong> days
            </p>
          </div>

          {/* 2. Review Rounds */}
          <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <FileCheck2 className="size-3.5 text-indigo-500" />
              <span>Review Rounds</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground tabular-nums">
                {avgRoundsStr}
              </span>
              <span className="text-xs font-medium text-muted-foreground">rounds</span>
            </div>
            <p className="text-xs text-muted-foreground truncate">per published article</p>
          </div>

          {/* 3. Active Reviewers */}
          <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <Users className="size-3.5 text-blue-500" />
              <span>Active Reviewers</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground tabular-nums">
                {workflowData?.activeReviewersCount ?? 0}
              </span>
              <span className="text-xs font-medium text-muted-foreground">peers</span>
            </div>
            <p className="text-xs text-muted-foreground truncate">
              <strong className="font-semibold text-foreground tabular-nums">{workflowData?.totalAssignmentsCount ?? 0}</strong> assignments
            </p>
          </div>

          {/* 4. Rejection Rate */}
          <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <ShieldCheck className="size-3.5 text-red-500" />
              <span>Revision Rate</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-semibold tracking-tight text-red-600 dark:text-red-400 tabular-nums">
                {rejectionRateStr}
              </span>
              <span className="text-xs font-medium text-muted-foreground">%</span>
            </div>
            <p className="text-xs text-muted-foreground truncate">first-round revision request</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
