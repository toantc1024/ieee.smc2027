"use client";

import React from "react";
import {
  HardDrive,
  ShieldAlert,
  AlertTriangle,
  FileWarning,
  Building,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { PostGovernanceSummarySystemDto } from "../../types";

interface SystemGovernanceCardProps {
  governanceData: PostGovernanceSummarySystemDto | null;
  isLoading: boolean;
}

function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function SystemGovernanceCard({
  governanceData,
  isLoading,
}: SystemGovernanceCardProps) {
  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-[320px] rounded-2xl" />
        <Skeleton className="h-[320px] rounded-2xl" />
      </div>
    );
  }

  const storageList = governanceData?.storageQuotas ?? [];
  const qualityList = governanceData?.qualityControlMetrics ?? [];

  const sortedStorage = [...storageList].sort(
    (a, b) => b.quotaUsedBytes - a.quotaUsedBytes
  );

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* 1. Storage Quotas per Track */}
      <Card className="relative border border-border/70 bg-card shadow-xs flex flex-col justify-between overflow-hidden rounded-2xl">
        <CardHeader className="pb-3 pt-5">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2.5 text-foreground">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                <HardDrive className="size-4" />
              </div>
              <span>Storage Quota Governance</span>
            </CardTitle>
            <Badge variant="outline" className="text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/60">
              {storageList.length} tracks
            </Badge>
          </div>
          <CardDescription className="text-xs text-muted-foreground">
            Attachment and media storage allocated across tracks
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-0 pb-5 flex-1">
          {sortedStorage.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[200px] text-center text-muted-foreground">
              <HardDrive className="size-8 stroke-1 mb-2 text-muted-foreground/50" />
              <p className="text-xs">No storage metrics recorded</p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
              {sortedStorage.map((s, idx) => (
                <div
                  key={s.tenantCode || idx}
                  className="p-2.5 rounded-xl bg-muted/40 border border-border/60 flex items-center justify-between gap-3 text-xs hover:bg-muted/70 transition-all"
                >
                  <div className="min-w-0">
                    <div className="font-semibold text-foreground truncate flex items-center gap-1.5">
                      <Building className="size-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                      <span>{s.tenantName || s.tenantDescription || s.tenantCode}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      Track: {s.tenantCode}
                    </span>
                  </div>

                  <Badge variant="outline" className="font-mono font-bold text-xs shrink-0 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/60">
                    {formatBytes(s.quotaUsedBytes)}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2. Quality Controls & Anomaly Detection */}
      <Card className="relative border border-border/70 bg-card shadow-xs flex flex-col justify-between overflow-hidden rounded-2xl">
        <CardHeader className="pb-3 pt-5">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2.5 text-foreground">
              <div className="p-2 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                <ShieldAlert className="size-4" />
              </div>
              <span>Editorial Quality Alerts</span>
            </CardTitle>
            <Badge variant="outline" className="text-[11px] font-semibold bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/60">
              Audit
            </Badge>
          </div>
          <CardDescription className="text-xs text-muted-foreground">
            Tracks with elevated backlog of drafts or unreleased submissions
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-0 pb-5 flex-1">
          {qualityList.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[200px] text-center text-muted-foreground">
              <FileWarning className="size-8 stroke-1 mb-2 text-muted-foreground/50" />
              <p className="text-xs">No quality alerts recorded</p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
              {qualityList.map((q, idx) => {
                const isHighDraft = q.draftRatioPercent > 40;
                const isHighHidden = q.hiddenRatioPercent > 20;

                return (
                  <div
                    key={q.tenantCode || idx}
                    className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 text-xs transition-all ${
                      isHighDraft || isHighHidden
                        ? "bg-red-500/10 border-red-500/30 text-red-800 dark:text-red-300"
                        : "bg-muted/40 border-border/60 hover:bg-muted/70"
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-foreground truncate flex items-center gap-1.5">
                        <span>{q.tenantName || q.tenantDescription || q.tenantCode}</span>
                        {(isHighDraft || isHighHidden) && (
                          <AlertTriangle className="size-3.5 text-red-600 dark:text-red-400 shrink-0" />
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Total: {q.totalCount} posts · Drafts: {q.draftCount}
                      </p>
                    </div>

                    <div className="text-right shrink-0 flex gap-2">
                      <div className="text-right">
                        <span className="text-[10px] text-muted-foreground block">Draft ratio</span>
                        <span className={`font-bold tabular-nums ${isHighDraft ? "text-red-600 dark:text-red-400" : "text-foreground"}`}>
                          {q.draftRatioPercent.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
