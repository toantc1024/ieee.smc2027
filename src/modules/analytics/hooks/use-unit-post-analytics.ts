"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  PostAuthorSummaryUnitDto,
  PostContentDistributionUnitDto,
  PostEngagementSummaryUnitDto,
  PostWorkflowSummaryUnitDto,
  PostCollaborationLeaderboardUnitDto,
  PostContentGrowthUnitDto,
  PostEngagementTrendingUnitDto,
  PostAnalyticsGranularity,
} from "../types";

export interface UnitPostAnalyticsFilter {
  from?: string;
  to?: string;
  granularity: PostAnalyticsGranularity;
  topN: number;
}

export function useUnitPostAnalytics(initialFilter?: Partial<UnitPostAnalyticsFilter>) {
  const [filter, setFilter] = useState<UnitPostAnalyticsFilter>({
    from: initialFilter?.from,
    to: initialFilter?.to,
    granularity: initialFilter?.granularity || "MONTH",
    topN: initialFilter?.topN || 10,
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [authorSummary, setAuthorSummary] = useState<PostAuthorSummaryUnitDto | null>(null);
  const [contentDistribution, setContentDistribution] = useState<PostContentDistributionUnitDto | null>(null);
  const [engagementSummary, setEngagementSummary] = useState<PostEngagementSummaryUnitDto | null>(null);
  const [workflowSummary, setWorkflowSummary] = useState<PostWorkflowSummaryUnitDto | null>(null);
  const [leaderboard, setLeaderboard] = useState<PostCollaborationLeaderboardUnitDto | null>(null);
  const [contentGrowth, setContentGrowth] = useState<PostContentGrowthUnitDto | null>(null);
  const [engagementTrending, setEngagementTrending] = useState<PostEngagementTrendingUnitDto | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (filter.from) params.set("from", filter.from);
    if (filter.to) params.set("to", filter.to);
    params.set("granularity", filter.granularity);
    params.set("topN", String(filter.topN));

    try {
      const res = await fetch(`/api/admin/analytics/unit-post?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Failed to load editorial analytics (${res.status})`);
      }
      const json = await res.json();

      setAuthorSummary(json.authorSummary || null);
      setContentDistribution(json.contentDistribution || null);
      setEngagementSummary(json.engagementSummary || null);
      setWorkflowSummary(json.workflowSummary || null);
      setLeaderboard(json.leaderboard || null);
      setContentGrowth(json.contentGrowth || null);
      setEngagementTrending(json.engagementTrending || null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load editorial analytics";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const updateFilter = useCallback((partial: Partial<UnitPostAnalyticsFilter>) => {
    setFilter((prev) => ({ ...prev, ...partial }));
  }, []);

  return {
    filter,
    updateFilter,
    isLoading,
    error,
    refetch: fetchAnalytics,
    data: {
      authorSummary,
      contentDistribution,
      engagementSummary,
      workflowSummary,
      leaderboard,
      contentGrowth,
      engagementTrending,
    },
  };
}
