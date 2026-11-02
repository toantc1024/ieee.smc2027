/**
 * Website Analytics & Telemetry TypeScript Types
 */

export type WebsiteDimensionType =
  | "path"
  | "url"
  | "referrer"
  | "browser"
  | "os"
  | "device"
  | "country"
  | "language"
  | "event";

export type WebsiteTimeScaleUnit = "minute" | "hour" | "day" | "week" | "month" | "year";

export interface WebsiteAnalyticsUnitCriteria {
  from?: string;     // ISO-8601 UTC Instant string
  to?: string;       // ISO-8601 UTC Instant string
  url?: string;      // filter by path
  query?: string;    // search query
  unit?: WebsiteTimeScaleUnit | string;
  timezone?: string; // e.g. "UTC"
  type?: WebsiteDimensionType | string;
  eventName?: string;
  page?: number;     // 1-indexed
  pageSize?: number; // limit
}

export interface MetricValue {
  value: number;
  prev: number;
}

export interface WebsiteStatsDto {
  pageviews: MetricValue;
  visitors: MetricValue;
  visits: MetricValue;
  bounces: MetricValue;
  totaltime: MetricValue;
}

export interface TimePoint {
  x: string; // ISO 8601 date string e.g. "2026-07-06T00:00:00Z"
  y: number; // count
}

export interface WebsitePageviewsDto {
  pageviews: TimePoint[];
  sessions: TimePoint[];
}

export interface WebsiteMetricDto {
  x: string; // dimension value name (e.g., "Chrome", "US", "/call-for-papers")
  y: number; // count of occurrences / visitors
}

export interface WebsiteMetricExpandedDto {
  data: WebsiteMetricDto[];
  count: number;
}

export interface WebsiteEventSeriesDto {
  x: string; // ISO 8601 date string
  y: number; // event count
}

export interface WebsiteDateRangeDto {
  startDate: string | null;
  endDate: string | null;
}

export interface WebsiteActiveUsersDto {
  visitors: number;
}

export interface RealtimeEvent {
  __type?: string;
  sessionId?: string;
  event?: string;
  timestamp?: string;
  createdAt: string;
  browser?: string;
  os?: string;
  device?: string;
  country?: string;
  urlPath?: string;
  referrerDomain?: string;
}

export interface RealtimeSeries {
  views: TimePoint[];
  visitors: TimePoint[];
}

export interface RealtimeTotals {
  views: number;
  visitors: number;
  events: number;
  countries: number;
}

export interface WebsiteRealtimeDto {
  countries: Record<string, number>;
  urls: Record<string, number>;
  referrers: Record<string, number>;
  events: RealtimeEvent[];
  series: RealtimeSeries;
  totals: RealtimeTotals;
  timestamp: number;
}

export interface WebsiteResetResponseDto {
  ok: boolean;
}

export interface WebsiteDetailDto {
  id: string; // Tracker website UUID
  name: string;
  domain: string;
  createdAt: string;
  userId?: string;
}
