/**
 * System Post Analytics TypeScript Types
 */

export interface PostAnalyticsSystemCriteria {
  from?: string; // ISO-8601 UTC Instant string
  to?: string;   // ISO-8601 UTC Instant string
}

export interface TenantTrafficEntry {
  tenantCode: string;
  tenantName: string;
  tenantDescription?: string;
  totalViews: number;
}

export interface PostOverviewSummarySystemDto {
  totalPosts: number;
  publishedCount: number;
  inProgressCount: number;
  totalViews: number;
  tenantTraffics: TenantTrafficEntry[];
}

export interface ActivityGridPoint {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  hourOfDay: number; // 0 - 23
  count: number;
}

export interface PostOverviewActivityMapSystemDto {
  activityGrid: ActivityGridPoint[];
}

export interface StorageQuotaEntry {
  tenantCode: string;
  tenantName: string;
  tenantDescription?: string;
  quotaUsedBytes: number;
}

export interface QualityControlEntry {
  tenantCode: string;
  tenantName: string;
  tenantDescription?: string;
  draftCount: number;
  hiddenCount: number;
  totalCount: number;
  draftRatioPercent: number;
  hiddenRatioPercent: number;
}

export interface PostGovernanceSummarySystemDto {
  storageQuotas: StorageQuotaEntry[];
  qualityControlMetrics: QualityControlEntry[];
}

export interface ProductionRankEntry {
  tenantCode: string;
  tenantName: string;
  tenantDescription?: string;
  postCount: number;
  rank: number;
}

export interface EngagementRankEntry {
  tenantCode: string;
  tenantName: string;
  tenantDescription?: string;
  averageViews: number;
  rank: number;
}

export interface WorkflowSpeedEntry {
  tenantCode: string;
  tenantName: string;
  tenantDescription?: string;
  averageDaysToPublish: number;
  rank: number;
}

export interface PostComparisonSummarySystemDto {
  productionRank: ProductionRankEntry[];
  engagementRank: EngagementRankEntry[];
  workflowSpeed: WorkflowSpeedEntry[];
}

export interface HotTopicEntry {
  tagId: string;
  tagName: string;
  postCount: number;
}

export interface PostTrendHotTopicsSystemDto {
  hotTopics: HotTopicEntry[];
}

export interface KeywordAnalysisEntry {
  tenantCode: string;
  tenantName: string;
  tenantDescription?: string;
  tagName: string;
  postCount: number;
}

export interface PostTrendKeywordAnalysisSystemDto {
  keywordAnalysis: KeywordAnalysisEntry[];
}
