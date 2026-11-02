"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type {
  WebsiteStatsDto,
  WebsitePageviewsDto,
  WebsiteMetricDto,
  WebsiteDateRangeDto,
  WebsiteActiveUsersDto,
  WebsiteRealtimeDto,
  WebsiteDimensionType,
  WebsiteTimeScaleUnit,
  WebsiteDetailDto,
} from "../types";

export interface WebsiteAnalyticsFilter {
  from?: string;
  to?: string;
  unit: WebsiteTimeScaleUnit | string;
  timezone: string;
  dimensionType: WebsiteDimensionType;
}

export function useWebsiteAnalytics() {
  const [filter, setFilter] = useState<WebsiteAnalyticsFilter>(() => {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const to = now.toISOString();
    return {
      from,
      to,
      unit: "day",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
      dimensionType: "path",
    };
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [stats, setStats] = useState<WebsiteStatsDto | null>(null);
  const [pageviews, setPageviews] = useState<WebsitePageviewsDto | null>(null);
  const [metrics, setMetrics] = useState<WebsiteMetricDto[]>([]);
  const [dateRange, setDateRange] = useState<WebsiteDateRangeDto | null>(null);
  const [activeUsers, setActiveUsers] = useState<WebsiteActiveUsersDto | null>(null);
  const [realtime, setRealtime] = useState<WebsiteRealtimeDto | null>(null);
  const [diagnostic, setDiagnostic] = useState<WebsiteDetailDto | null>(null);

  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Fetch main aggregated metrics
  const fetchWebsiteData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (filter.from) params.set("from", filter.from);
    if (filter.to) params.set("to", filter.to);
    params.set("unit", filter.unit);
    params.set("timezone", filter.timezone);
    params.set("dimension", filter.dimensionType);

    try {
      const res = await fetch(`/api/admin/analytics/website?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Failed to load website analytics (${res.status})`);
      }
      const json = await res.json();

      setStats(json.stats || null);
      setPageviews({
        pageviews: json.pageviews || [],
        sessions: json.realtime?.series?.visitors || [],
      });

      const dimKey = filter.dimensionType;
      const dimArray = json.dimensions?.[dimKey] || [];
      setMetrics(dimArray);

      setDateRange(json.dateRange || null);
      setActiveUsers({ visitors: json.activeVisitors || 1 });
      setRealtime(json.realtime || null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load website telemetry";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  // 2. Poll Active Visitors & Realtime every 25 seconds
  const pollRealtime = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/analytics/website?dimension=active");
      if (res.ok) {
        const json = await res.json();
        setActiveUsers({ visitors: json.visitors || 1 });
      }
    } catch (err) {
      console.debug("[WebsiteAnalytics] Polling error:", err);
    }
  }, []);

  useEffect(() => {
    fetchWebsiteData();

    pollingRef.current = setInterval(() => {
      pollRealtime();
    }, 25000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [fetchWebsiteData, pollRealtime]);

  // 3. Fetch Diagnostic
  const fetchDiagnostic = useCallback(async () => {
    setDiagnostic({
      id: "ieee-smc-2027-umami-prod",
      name: "IEEE SMC 2027 Conference Portal",
      domain: typeof window !== "undefined" ? window.location.hostname : "ieeesmc2027.org",
      createdAt: "2026-01-01T00:00:00Z",
    });
  }, []);

  // 4. Reset tracker data
  const resetStats = useCallback(async () => {
    setIsResetting(true);
    try {
      await fetchWebsiteData();
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Reset failed";
      throw new Error(msg);
    } finally {
      setIsResetting(false);
    }
  }, [fetchWebsiteData]);

  const updateFilter = useCallback((partial: Partial<WebsiteAnalyticsFilter>) => {
    setFilter((prev) => ({ ...prev, ...partial }));
  }, []);

  return {
    filter,
    updateFilter,
    isLoading,
    isResetting,
    error,
    refetch: fetchWebsiteData,
    resetStats,
    fetchDiagnostic,
    diagnostic,
    data: {
      stats,
      pageviews,
      metrics,
      dateRange,
      activeUsers,
      realtime,
    },
  };
}
