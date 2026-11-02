/**
 * Shared Analytics Helpers & Sanitization Utilities
 */
import { NextResponse } from "next/server";
import { apiError } from "@/lib";

export interface ParsedAnalyticsQuery {
  fromDate: Date;
  toDate: Date;
  granularity: "DAY" | "WEEK" | "MONTH" | "QUARTER" | "YEAR";
  topN: number;
  page: number;
  limit: number;
  dimension: string;
  errorResponse: NextResponse | null;
}

export function parseAnalyticsQuery(searchParams: URLSearchParams): ParsedAnalyticsQuery {
  const fromParam = searchParams.get("from") || searchParams.get("startDate");
  const toParam = searchParams.get("to") || searchParams.get("endDate");

  const now = new Date();
  const defaultFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const defaultTo = now;

  let fromDate = defaultFrom;
  let toDate = defaultTo;

  if (fromParam) {
    const d = new Date(fromParam);
    if (isNaN(d.getTime())) {
      return {
        fromDate,
        toDate,
        granularity: "MONTH",
        topN: 10,
        page: 1,
        limit: 20,
        dimension: "path",
        errorResponse: apiError("Invalid 'from' date parameter", 400),
      };
    }
    fromDate = d;
  }

  if (toParam) {
    const d = new Date(toParam);
    if (isNaN(d.getTime())) {
      return {
        fromDate,
        toDate,
        granularity: "MONTH",
        topN: 10,
        page: 1,
        limit: 20,
        dimension: "path",
        errorResponse: apiError("Invalid 'to' date parameter", 400),
      };
    }
    toDate = d;
  }

  // Chronological Validation: Auto-swap if inverted
  if (fromDate.getTime() > toDate.getTime()) {
    const temp = fromDate;
    fromDate = toDate;
    toDate = temp;
  }

  // Safe Granularity
  const rawGranularity = (searchParams.get("granularity") || "MONTH").toUpperCase();
  const validGranularities = ["DAY", "WEEK", "MONTH", "QUARTER", "YEAR"];
  const granularity = (validGranularities.includes(rawGranularity)
    ? rawGranularity
    : "MONTH") as ParsedAnalyticsQuery["granularity"];

  // Safe Numeric Parameters
  const rawTopN = parseInt(searchParams.get("topN") || "10", 10);
  const topN = Number.isFinite(rawTopN) && rawTopN >= 1 ? Math.min(100, rawTopN) : 10;

  const rawPage = parseInt(searchParams.get("page") || "1", 10);
  const page = Number.isFinite(rawPage) && rawPage >= 1 ? rawPage : 1;

  const rawLimit = parseInt(searchParams.get("limit") || searchParams.get("pageSize") || "20", 10);
  const limit = Number.isFinite(rawLimit) && rawLimit >= 1 ? Math.min(100, rawLimit) : 20;

  // Dimension parameter
  const rawDimension = searchParams.get("dimension") || searchParams.get("type") || "path";
  const validDimensions = ["active", "path", "url", "browser", "os", "device", "country", "language", "referrer", "event"];
  const dimension = validDimensions.includes(rawDimension) ? rawDimension : rawDimension;

  return {
    fromDate,
    toDate,
    granularity,
    topN,
    page,
    limit,
    dimension,
    errorResponse: null,
  };
}

/**
 * Global In-Memory Telemetry Ring Buffer for Realtime Stream
 */
export interface TelemetryEvent {
  event: string;
  section?: string;
  url?: string;
  timestamp: string;
  sessionId?: string;
  browser?: string;
  os?: string;
  device?: string;
  country?: string;
}

const telemetryEventsBuffer: TelemetryEvent[] = [];
const MAX_TELEMETRY_BUFFER_SIZE = 100;

export function recordTelemetryEvent(event: TelemetryEvent) {
  telemetryEventsBuffer.unshift(event);
  if (telemetryEventsBuffer.length > MAX_TELEMETRY_BUFFER_SIZE) {
    telemetryEventsBuffer.pop();
  }
}

export function getRecentTelemetryEvents(): TelemetryEvent[] {
  return [...telemetryEventsBuffer];
}
