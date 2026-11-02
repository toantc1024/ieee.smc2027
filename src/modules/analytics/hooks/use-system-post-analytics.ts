"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  PostOverviewSummarySystemDto,
  PostOverviewActivityMapSystemDto,
  PostGovernanceSummarySystemDto,
  PostComparisonSummarySystemDto,
  PostTrendHotTopicsSystemDto,
  PostTrendKeywordAnalysisSystemDto,
} from "../types";

export interface SystemPostAnalyticsFilter {
  from?: string;
  to?: string;
  topN: number;
}

export function useSystemPostAnalytics(initialFilter?: Partial<SystemPostAnalyticsFilter>) {
  const [filter, setFilter] = useState<SystemPostAnalyticsFilter>({
    from: initialFilter?.from,
    to: initialFilter?.to,
    topN: initialFilter?.topN || 10,
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [overviewSummary, setOverviewSummary] = useState<PostOverviewSummarySystemDto | null>(null);
  const [activityMap, setActivityMap] = useState<PostOverviewActivityMapSystemDto | null>(null);
  const [governanceSummary, setGovernanceSummary] = useState<PostGovernanceSummarySystemDto | null>(null);
  const [comparisonSummary, setComparisonSummary] = useState<PostComparisonSummarySystemDto | null>(null);
  const [hotTopics, setHotTopics] = useState<PostTrendHotTopicsSystemDto | null>(null);
  const [keywordAnalysis, setKeywordAnalysis] = useState<PostTrendKeywordAnalysisSystemDto | null>(null);

  const fetchSystemAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (filter.from) params.set("from", filter.from);
    if (filter.to) params.set("to", filter.to);
    params.set("topN", String(Math.max(1, filter.topN)));

    try {
      const res = await fetch(`/api/admin/analytics/system-post?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Failed to load system benchmark (${res.status})`);
      }
      const json = await res.json();

      setOverviewSummary(json.overviewSummary || null);
      setActivityMap(json.activityMap || null);
      setGovernanceSummary(json.governanceSummary || null);
      setComparisonSummary(json.comparisonSummary || null);
      setHotTopics(json.hotTopics || null);
      setKeywordAnalysis(json.keywordAnalysis || null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load system benchmark";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchSystemAnalytics();
  }, [fetchSystemAnalytics]);

  const updateFilter = useCallback((partial: Partial<SystemPostAnalyticsFilter>) => {
    setFilter((prev) => ({ ...prev, ...partial }));
  }, []);

  return {
    filter,
    updateFilter,
    isLoading,
    error,
    refetch: fetchSystemAnalytics,
    data: {
      overviewSummary,
      activityMap,
      governanceSummary,
      comparisonSummary,
      hotTopics,
      keywordAnalysis,
    },
  };
}
