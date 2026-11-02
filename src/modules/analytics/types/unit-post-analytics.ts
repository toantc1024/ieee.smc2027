/**
 * Unit Post Analytics TypeScript Types
 */

export type PostAnalyticsGranularity = "DAY" | "WEEK" | "MONTH" | "QUARTER" | "YEAR";

export interface PostAnalyticsUnitCriteria {
  from?: string; // ISO-8601 UTC Instant string
  to?: string;   // ISO-8601 UTC Instant string
}

/**
 * 1. PostAuthorSummaryUnitDto
 */
export interface PostAuthorSummaryUnitDto {
  roleActivityDistribution: Record<string, number>; // e.g. { OWNER: 12, CONTRIBUTOR: 5 }
  averageCollaboratorsPerPost: number;
  collaborationIndexPercent: number;
}

/**
 * 2. PostContentDistributionUnitDto
 */
export interface CategoryDistributionEntry {
  categoryId: string;
  categoryName: string;
  postCount: number;
}

export interface TagDistributionEntry {
  tagId: string;
  tagName: string;
  postCount: number;
}

export interface PostContentDistributionUnitDto {
  statusDistribution: Record<string, number>; // e.g. { DRAFT: 8, PUBLISHED: 20, ARCHIVED: 2 }
  totalPosts: number;
  publishedCount: number;
  inProgressCount: number;
  categories: CategoryDistributionEntry[];
  uncategorizedCount: number;
  topTags: TagDistributionEntry[];
  averageTagsPerPost: number;
  untaggedCount: number;
}

/**
 * 3. PostEngagementSummaryUnitDto
 */
export interface PostEngagementSummaryUnitDto {
  bilingualRatioPercent: number;
  deviceDistribution: Record<string, number>; // DESKTOP, MOBILE, TABLET, UNKNOWN
  totalViewCount: number;
}

/**
 * 4. PostWorkflowSummaryUnitDto
 */
export interface PostWorkflowSummaryUnitDto {
  averageDaysToPublish: number;
  medianDaysToPublish: number;
  averageTotalRounds: number;
  averageConsensusRounds: number;
  averageRejectionRounds: number;
  activeReviewersCount: number;
  totalAssignmentsCount: number;
  averageReviewersPerPost: number;
  rejectionRatePercent: number;
}

/**
 * 5. PostCollaborationLeaderboardUnitDto
 */
export interface AuthorLeaderboardEntry {
  authorId: string;
  authorName: string;
  ownedPostCount: number;
  collaboratedPostCount: number;
}

export interface PostCollaborationLeaderboardUnitDto {
  leaderboard: AuthorLeaderboardEntry[];
}

/**
 * 6. PostContentGrowthUnitDto
 */
export interface GrowthDataPoint {
  period: string; // e.g. "2026-03"
  created: number;
  published: number;
}

export interface PostContentGrowthUnitDto {
  dataPoints: GrowthDataPoint[];
  granularity: string; // DAY, WEEK, MONTH, QUARTER, YEAR
}

/**
 * 7. PostEngagementTrendingUnitDto
 */
export interface TrendingPostEntry {
  postId: string;
  postTitle: string;
  postSlug: string;
  viewCount: number;
}

export interface PostEngagementTrendingUnitDto {
  totalViewCount: number;
  trendingPosts: TrendingPostEntry[];
}
