"use client";

import React from "react";
import { TrendingUp, Tag, Hash, Building2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatLocalizedName } from "../../utils/analytics-formatters";
import type {
  PostTrendHotTopicsSystemDto,
  PostTrendKeywordAnalysisSystemDto,
} from "../../types";

interface SystemTrendsTopicsProps {
  hotTopicsData: PostTrendHotTopicsSystemDto | null;
  keywordData: PostTrendKeywordAnalysisSystemDto | null;
  isLoading: boolean;
}

export function SystemTrendsTopics({
  hotTopicsData,
  keywordData,
  isLoading,
}: SystemTrendsTopicsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-[320px] rounded-2xl" />
        <Skeleton className="h-[320px] rounded-2xl" />
      </div>
    );
  }

  const topics = hotTopicsData?.hotTopics ?? [];
  const keywordAnalysis = keywordData?.keywordAnalysis ?? [];

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* 1. Hot Topics Cloud */}
      <Card className="relative border border-border/70 bg-card shadow-xs flex flex-col justify-between overflow-hidden rounded-2xl">
        <CardHeader className="pb-3 pt-5">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2.5 text-foreground">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                <TrendingUp className="size-4" />
              </div>
              <span>Trending Research Topics</span>
            </CardTitle>
            <Badge variant="outline" className="text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/60">
              Top {topics.length}
            </Badge>
          </div>
          <CardDescription className="text-xs text-muted-foreground">
            Frequently cited research themes and tags across submissions
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-0 pb-5 flex-1">
          {topics.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[200px] text-center text-muted-foreground">
              <Tag className="size-8 stroke-1 mb-2 text-muted-foreground/50" />
              <p className="text-xs">No topic trends recorded</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 pt-2">
              {topics.map((t, idx) => {
                const isHot = idx < 3;
                const localizedTag = formatLocalizedName(t.tagName, "en") || t.tagName;

                return (
                  <Badge
                    key={t.tagId || idx}
                    variant={isHot ? "default" : "outline"}
                    className={`text-xs py-1.5 px-3 rounded-xl gap-1.5 transition-all ${
                      isHot
                        ? "bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-2xs border-transparent"
                        : "bg-muted/50 hover:bg-muted text-foreground border-border/70 font-medium"
                    }`}
                  >
                    <Hash className="size-3 opacity-60" />
                    <span>{localizedTag}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                        isHot ? "bg-white/25 text-white" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {t.postCount}
                    </span>
                  </Badge>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2. Keyword Matrix by Track */}
      <Card className="relative border border-border/70 bg-card shadow-xs flex flex-col justify-between overflow-hidden rounded-2xl">
        <CardHeader className="pb-3 pt-5">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2.5 text-foreground">
              <div className="p-2 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                <Building2 className="size-4" />
              </div>
              <span>Track Specialization Keyword Matrix</span>
            </CardTitle>
            <Badge variant="outline" className="text-[11px] font-semibold bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/60">
              Cross-Track
            </Badge>
          </div>
          <CardDescription className="text-xs text-muted-foreground">
            Specialized keyword distribution across tracks and domains
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-0 pb-5 flex-1">
          {keywordAnalysis.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[200px] text-center text-muted-foreground">
              <Building2 className="size-8 stroke-1 mb-2 text-muted-foreground/50" />
              <p className="text-xs">No keyword matrix data</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
              {keywordAnalysis.slice(0, 15).map((item, idx) => {
                const localizedTag = formatLocalizedName(item.tagName, "en") || item.tagName;
                return (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-muted/40 border border-border/60 flex items-center justify-between gap-2 text-xs hover:bg-muted/70 transition-all"
                  >
                    <div className="min-w-0">
                      <span className="font-semibold text-foreground truncate block">
                        {item.tenantName || item.tenantDescription || item.tenantCode}
                      </span>
                      <span className="text-[11px] text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1 mt-0.5">
                        <Tag className="size-3" /> {localizedTag}
                      </span>
                    </div>

                    <Badge variant="outline" className="font-bold text-[11px] shrink-0 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800/60">
                      {item.postCount} posts
                    </Badge>
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
