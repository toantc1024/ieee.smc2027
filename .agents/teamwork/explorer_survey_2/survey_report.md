# Analytics Module Specification Survey & Integration Blueprint

**Author**: Explorer Survey 2 (Analytics Spec Miner)  
**Date**: 2026-11-02  
**Target Repository**: `/Users/macos/ieee-smc-2027/`  
**Reference Source**: `/Users/macos/Documents/Projects/hcmute-website/hcmute-website-frontend/modules/analytics/` & `/app/manage/analytics/`  

---

## 1. Executive Summary

This report delivers the authoritative specification of the Analytics module from the reference HCMUTE project and outlines the end-to-end integration blueprint for the IEEE SMC 2027 website.

The Analytics module provides a unified command center composed of three sub-dashboards:
1. **Unit Post Analytics (`UnitPostAnalyticsDashboard`)**: Detailed metrics on editorial performance, content status distribution, growth over time, review workflow turnaround, author collaboration leaderboard, and trending post engagement.
2. **Website Telemetry & Live Traffic (`WebsiteTelemetryDashboard`)**: Real-time traffic intelligence powered by an internal Umami telemetry engine, featuring live active visitors (25s polling), pageviews vs. sessions area charts, multi-dimensional breakdowns (paths, events, referrers, browsers, OS, devices, countries), realtime event stream (30-min window), tracker diagnostic dialog, tracker data reset modal, and an audience segment distribution survey card.
3. **System-wide Post Analytics (`SystemPostAnalyticsDashboard`)**: Central oversight dashboard for administrators featuring cross-unit traffic comparisons, 7x24 publishing activity heatmap, multi-unit comparative rankings (production, average views, publishing speed), storage quota utilization, editorial quality controls (draft/hidden ratios with anomaly flags), and hot topics tag clouds with tenant keyword matrices.
4. **Client-side Telemetry Tracking Engine (`modules/analytics/tracker/`)**: Zero-latency script injection (`UmamiTracker`), automatic viewport section focus tracking via `IntersectionObserver` (`useSectionFocusTracker`), and typed helpers for tracking custom interactions (`custom-events.ts`).

---

## 2. Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Navigation | Multi-Tab Analytics Hub | Segmented navigation dock switching between Unit Posts, Website Traffic, and System-wide Benchmark views. Synchronizes with URL query param `?tab=`. | URL query `tab` ("unit-post", "website", "system-post"), user role | Active tab UI, transitions | Falls back to default `"unit-post"`; hides `"system-post"` tab for non-admin | `app/manage/analytics/page.tsx` |
| 2 | Filtering | Unified Date Range Picker | Preset button & calendar popover supporting quick intervals ("today", "7d", "30d", "this_month", "90d", "this_year", "all") and custom ranges. Auto-computes aggregation granularity. | Preset key, DateRange `{ from, to }` | Formatted label, ISO timestamp criteria `{ from, to, granularity }` | Fallback to "all" (from 2024-01-01 to now) on empty selection | `app/components/ui/date-range-picker.tsx` |
| 3 | Unit Analytics | Editorial KPI Grid | 8 animated KPI cards: Total Posts, Unit Post Views, Bilingual Ratio (%), Collaboration Index (%), Avg Time to Publish (days), Review Rounds, Active Reviewers, Rejection Rate (%). | Distribution, Engagement, Workflow, Author DTOs | Rendered KPI tiles with `NumberTicker` counter and icon accents | Skeletons displayed while loading; zero defaults when data null | `modules/analytics/components/unit-post/unit-post-kpi-grid.tsx` |
| 4 | Unit Analytics | Content Growth Area Chart | Recharts dual AreaChart tracking created posts (sapphire blue `#2563eb`) vs. published posts (crimson red `#e11d48`) over time. Includes granularity switcher (DAY, WEEK, MONTH, QUARTER, YEAR). | Growth DTO data points, granularity selection | SVG timeline chart with gradient fills, X/Y axes, custom tooltips | Empty calendar state graphic when 0 data points in range | `modules/analytics/components/unit-post/unit-post-growth-chart.tsx` |
| 5 | Unit Analytics | Content Status Distribution | Stacked progress bar and counters showing proportions of Published, Draft, and Hidden articles, plus bilingual ratio and uncategorized article warnings. | ContentDistribution DTO | Proportional color stack bar, 3-column metric grid | Defaults to 100% draft or published if zero total | `modules/analytics/components/unit-post/unit-post-distribution-charts.tsx` |
| 6 | Unit Analytics | Category & Tag Distribution | Top 5 categories horizontal proportional bars, plus Top 8 tags cloud with post frequency badges. Handles localized JSON strings cleanly. | Categories and tags entries | Horizontal bar progress and hashtag badges | Displays "Chưa có bài viết gắn danh mục/thẻ" on empty | `modules/analytics/components/unit-post/unit-post-distribution-charts.tsx` |
| 7 | Unit Analytics | Reader Device Distribution Donut | Recharts PieChart (donut style) showing reader access breakdown across Desktop, Mobile, Tablet, and Unknown devices with percentage labels and icons. | Engagement summary device distribution map | Donut chart with legend and total view count card | Displays placeholder icon when no device views recorded | `modules/analytics/components/unit-post/unit-post-distribution-charts.tsx` |
| 8 | Unit Analytics | Workflow Speed & Consensus Card | Consensus vs. Revision progress bar showing % approved immediately vs. % requiring revisions, with 4 metric cards: avg days, avg rounds, active reviewers, rejection rate. | WorkflowSummary DTO | Consensus ratio bar + 4-column metric layout | Formats negative days safely to positive (`formatPositiveDays`) | `modules/analytics/components/unit-post/unit-post-workflow-card.tsx` |
| 9 | Unit Analytics | Author Collaboration Leaderboard | Ranked list of top contributing authors with medals (Gold, Silver, Bronze), avatar initials, and breakdown of lead posts vs. co-authored posts. | Leaderboard DTO | Top authors list with rank badges | Displays empty user state if no author activity | `modules/analytics/components/unit-post/unit-post-leaderboard-card.tsx` |
| 10 | Unit Analytics | Trending Posts Card | Ranked list of most viewed articles (#1 rose, #2 amber, #3 blue) with view counters, post slugs, and direct links to editor/view page. | EngagementTrending DTO | Top posts list with links and eye count badges | Displays empty state text if no articles viewed | `modules/analytics/components/unit-post/unit-post-trending-card.tsx` |
| 11 | Website Telemetry | Live Active Visitors Header | Header bar showing current live online visitors, polled automatically every 25 seconds via `getActiveUsers()`. | WebsiteActiveUsers DTO | Live badge with pulse indicator ("X người dùng") | Polling errors caught silently in console without crashing UI | `modules/analytics/components/website/website-telemetry-kpis.tsx` |
| 12 | Website Telemetry | Telemetry 5-KPI Strip | 5 metric cards: Pageviews, Unique Visitors, Visits/Sessions, Bounce Rate (%), and Avg Visit Duration (s), with period-over-period delta calculation and green/red trend badges. | WebsiteStats DTO | KPI cards with delta percentages and arrows | Handles 0 previous period gracefully (neutral diff) | `modules/analytics/components/website/website-telemetry-kpis.tsx` |
| 13 | Website Telemetry | Pageviews & Sessions Area Chart | Interactive Recharts AreaChart comparing Pageviews (blue) and Sessions (red). Supports timescale toggle: Hour, Day, Week, Month. | WebsitePageviews DTO (pageviews + sessions points) | Dual-area SVG chart with custom formatted X/Y ticks | Displays empty clock state if no traffic recorded | `modules/analytics/components/website/website-pageviews-chart.tsx` |
| 14 | Website Telemetry | Multi-Dimension Breakdown | Horizontal progress bar rankings across 7 dimensions: Path (pages), Event, Referrer, Browser, OS, Device, Country. | WebsiteMetric DTO list, dimension type tab | Ranked rows with index (#1..#10), count, and % width bar | Empty state if no data for selected dimension | `modules/analytics/components/website/website-dimensions-breakdown.tsx` |
| 15 | Website Telemetry | Realtime Event Stream | Live snapshot of last 30 minutes: active URLs currently viewed and latest events / visitor countries with count badges. | WebsiteRealtime DTO | 2-column grid (Active URLs, Realtime Countries) | Shows "Không có trang hoạt động tức thời" if empty | `modules/analytics/components/website/website-realtime-stream.tsx` |
| 16 | Website Telemetry | Tracker Diagnostic Dialog | Modal dialog inspecting Umami tracker health: Website UUID, Registered Domain, Tracker Creation Date, and operational status. Features copy-to-clipboard. | WebsiteDetail DTO | Dialog with copyable UUID code block and status badge | Displays loading indicator while fetching diagnostic | `modules/analytics/components/website/website-diagnostic-dialog.tsx` |
| 17 | Website Telemetry | Tracker Data Reset Modal | AlertDialog confirmation for permanently wiping tracker metrics and event history with Sonner toast feedback and cache invalidation. | User confirmation click | Triggered POST `/reset`, cache flush, data reload | Toast error message if reset request fails | `modules/analytics/components/website/website-reset-modal.tsx` |
| 18 | Website Telemetry | Audience Segment Telemetry | Analytics card measuring audience survey distributions (Parents, Students, Businesses, Staff, Other) merging Umami events with local real-time Zustand votes. | Umami event metrics + Zustand audience store | Stacked segment bar, 4 KPI cards, ranked breakdown | Fallback info card when no survey responses collected | `modules/analytics/components/website/website-audience-survey-card.tsx` |
| 19 | System Benchmark | System Overview KPIs | 4 master tiles: Total System Posts, Published, In-progress, Total Views across all units, plus multi-tenant traffic breakdown grid. | PostOverviewSummarySystemDto | Master tiles + tenant traffic distribution cards | Skeletons on loading; access restriction card for non-admins | `modules/analytics/components/system-post/system-overview-kpis.tsx` |
| 20 | System Benchmark | 7x24 Activity Heatmap | 7-day x 24-hour visual matrix showing publishing intensity by day of week and hour of day, with normalized color heat scaling (5 color tiers). | PostOverviewActivityMapSystemDto | Matrix grid with hover tooltips and legend | Normalized by max count; empty hour shows neutral slate | `modules/analytics/components/system-post/system-activity-heatmap.tsx` |
| 21 | System Benchmark | Cross-Tenant Comparison Table | Multi-tab ranking table comparing organizational units across 3 performance criteria: Production (post count), Engagement (views/post), and Speed (days to publish). | PostComparisonSummarySystemDto | Ranked list (#1 Gold, #2 Silver, #3 Bronze) | Empty scroll area if no tenant metrics available | `modules/analytics/components/system-post/system-comparison-table.tsx` |
| 22 | System Benchmark | Storage & Quality Governance | 2-column card monitoring: (1) Storage quota bytes used per unit (human-formatted B, KB, MB, GB), and (2) Quality control anomaly alerts (draft >40% or hidden >20%). | PostGovernanceSummarySystemDto | Storage list + Quality warning list with AlertTriangle icons | Shows neutral icon when all metrics in normal range | `modules/analytics/components/system-post/system-governance-card.tsx` |
| 23 | System Benchmark | Hot Topics & Keyword Matrix | 2-column card displaying: (1) System-wide trending hashtag cloud (Top 3 solid blue), and (2) Cross-unit keyword specialization matrix. | HotTopics & KeywordAnalysis DTOs | Hashtag badges with counts + tenant tag list | Handles I18n JSON strings cleanly via formatters | `modules/analytics/components/system-post/system-trends-topics.tsx` |
| 24 | Telemetry Tracker | Dynamic Umami Script Injector | Client component dynamically injecting `<Script>` tag with sanitized script URL, protocol upgrade (prevents mixed content), and Docker hostname rewriting. | Tenant config (analyticsWebsiteId, umamiScriptUrl) | Next.js `<Script strategy="afterInteractive">` tag | Fails gracefully without throwing runtime errors | `modules/analytics/tracker/umami-tracker.tsx` |
| 25 | Telemetry Tracker | Section Focus Intersection Tracker | Hook observing `.content-section` or `[data-section-name]` elements and sending `Section Focus` Umami events when an element crosses 50% viewport visibility. | DOM elements, threshold = 0.5 | Dispatched custom Umami events | Deduplicates events per session; checks browser support | `modules/analytics/tracker/use-section-focus-tracker.ts` |
| 26 | Telemetry Tracker | Typed Custom Event Helpers | Helper functions for dispatching custom user actions: tab clicks, PDF/document downloads, form submissions, and audience quiz choices. | Event names, payload properties | Calls `window.umami.track(eventName, data)` | Verifies `window.umami` exists before invocation | `modules/analytics/tracker/custom-events.ts` |

---

## 3. Edge Cases & Observed Behaviors

| # | Feature | Input / Condition | Observed Behavior |
|---|---------|-------------------|-------------------|
| 1 | Growth Chart | Exactly 1 data point returned from API | Recharts AreaChart requires at least 2 points to draw an area gradient properly. Component automatically duplicates the single point with a trailing space period (`period + " "`) to render cleanly without graphical artifacts. |
| 2 | Telemetry Criteria | `from` date chronologically greater than `to` date | `normalizeWebsiteAnalyticsCriteria` detects `fromTime > toTime` and automatically swaps the values to prevent 400 Bad Request responses from the telemetry backend. |
| 3 | Dimension Metric | Request specifies legacy dimension `type: "url"` | Umami v2 API requires `path` instead of `url`. The normalization helper automatically maps `"url"` to `"path"`. |
| 4 | Telemetry URL | Docker internal hostname in environment (e.g. `http://hcmute-umami:3000/script.js` or `localhost`) | `sanitizeScriptUrl` detects internal container/localhost hostnames and rewrites to the public host based on the operating base domain. |
| 5 | Telemetry URL | HTTPS page with `http://` script URL | `sanitizeScriptUrl` automatically upgrades `http://` to `https://` to prevent browser Mixed Content security blocking. |
| 6 | Tag/Category Name | Raw JSON string stored in DB e.g. `{"en": null, "vi": "Hội nghị"}` | `formatLocalizedName` detects stringified or object JSON and extracts the preferred locale string (`vi` or `en`), avoiding raw `{...}` displays in badges and tables. |
| 7 | Workflow Days | Negative days due to misordered timestamps | `formatPositiveDays` applies `Math.abs(days)` to guarantee strictly non-negative durations. |
| 8 | Heatmap Intensity | All cells have 0 posts or maximum count is 0 | Uses `Math.max(1, ...)` normalization base to avoid division by zero when calculating intensity ratios. |
| 9 | Date Range Cache | Consecutive duplicate requests for date range within 60s | In-memory cache `DATE_RANGE_CACHE_TTL_MS = 60_000` returns cached `WebsiteDateRangeDto` or shares the in-flight Promise to prevent redundant HTTP roundtrips. |
| 10 | Realtime Polling | Tab in background / Polling error | Polling interval set to 25,000ms; errors are captured in `console.debug` and do not trigger user-facing error toasts or break UI state. |

---

## 4. UI Controls, Charting Libraries & Layout

### 4.1 Charting Architecture
- **Recharts (v2.15.4)** is the core charting library used across both area charts (`AreaChart`, `Area`, `XAxis`, `YAxis`, `CartesianGrid`, `ResponsiveContainer`) and donut distribution charts (`PieChart`, `Pie`, `Cell`, `Tooltip`).
- **Shadcn Chart Primitives (`ChartContainer`, `ChartConfig`, `ChartTooltip`, `ChartTooltipContent`)**:
  - Encapsulates theme variables, responsive container aspect ratios, and custom tooltip formatting with indicator dots.
  - Custom SVG linear gradients are defined inline with specific color stops (Sapphire Blue `#2563eb` with 0.4 to 0.0 opacity; Crimson Red `#e11d48` with 0.45 to 0.0 opacity).

### 4.2 Button & Action Layout Standards
- **Header Banner**: Standardized `ManagementPageHeader` with title, subtitle, 3D clay icon (`analytics__hcmute-3d-icon.png`), and background asset (`manage-stats-bg.jpg`).
- **Main Tabs**: Segmented dock (`h-12 p-1.5 rounded-2xl bg-card border border-border/70 shadow-2xs`) with 100% full-height buttons, blue active fill for unit/website tabs, red active fill for system admin benchmark.
- **Granularity & Unit Switchers**: Inline rounded button groups (`h-8` or `h-9` rounded-xl with `p-1`) matching 100% full-height active state (`bg-background text-foreground shadow-2xs border border-border/60`).
- **Refresh & Actions**: Right-aligned utility buttons (`h-9 px-3 rounded-xl border border-border/70 text-xs font-semibold gap-1.5`) with rotating animation on loading.

### 4.3 Icon Policy Check
- **Sparkle Icon Audit**: The reference analytics module was searched exhaustively for `sparkle`, `Sparkles`, and `Sparkle`. **ZERO sparkle icons are used in the reference analytics module.**
- Primary icons utilized: `BarChart2`, `RotateCcw`, `FileText`, `Globe2`, `ShieldCheck`, `TrendingUp`, `Calendar`, `FolderTree`, `Tag`, `Laptop`, `Smartphone`, `Tablet`, `Eye`, `Languages`, `Users2`, `Clock`, `Flame`, `Trophy`, `HardDrive`, `ShieldAlert`.
- **Constraint Compliance**: The target implementation must strictly avoid adding any sparkle icons.

---

## 5. Dependencies & Package Delta (HCMUTE vs. IEEE SMC 2027)

| Package | Reference (HCMUTE) | Target (IEEE SMC 2027) | Status / Action Needed |
|---------|-------------------|------------------------|------------------------|
| `recharts` | `2.15.4` | Not installed | **Required**: Add `"recharts": "2.15.4"` to `package.json` |
| `date-fns` | `^4.1.0` | Not installed | **Required**: Add `"date-fns": "^4.1.0"` to `package.json` |
| `react-day-picker` | `^9.14.0` | Not installed | **Required**: Add `"react-day-picker": "^9.14.0"` to `package.json` (for Calendar & DateRangePicker) |
| `@radix-ui/react-popover` | `^1.1.15` | Not installed | **Required**: Add `"@radix-ui/react-popover": "^1.1.15"` to `package.json` |
| `motion` / `framer-motion` | `framer-motion ^12.29.0` | `"motion": "^13.4.4"` | **Compatible**: Target already has modern `motion` v13. Use `motion/react` imports for spring counters and fade-ins. |
| `lucide-react` | `^0.563.0` | `^1.41.0` | **Compatible**: Target has newer version with all required icons. |
| `sonner` | `^2.0.7` | `^2.0.8` | **Compatible**: Target has identical Sonner toast library. |
| `@radix-ui/react-tabs` | `^1.1.13` | `^1.2.1` | **Compatible**: Target has newer Radix Tabs. |
| `@radix-ui/react-dialog` | `^1.1.15` | `^1.3.1` | **Compatible**: Target has newer Radix Dialog. |
| `@radix-ui/react-alert-dialog` | `^1.1.15` | `^1.2.1` | **Compatible**: Target has newer Radix AlertDialog. |
| `@radix-ui/react-avatar` | `^1.1.11` | `^1.3.1` | **Compatible**: Target has newer Radix Avatar. |
| `zustand` | `^5.0.10` | Not installed | **Adaptable**: In HCMUTE, Zustand was used for audience vote sync. Can be handled via lightweight React state or local storage in IEEE SMC 2027 without adding heavy state stores. |

---

## 6. UI Component Layer Gaps in IEEE SMC 2027

To render the reference analytics dashboards accurately, the following UI components must be added to `src/components/ui/` in IEEE SMC 2027:

1. **`src/components/ui/chart.tsx`**:
   - Implements shadcn chart container, chart tooltip wrapper, legend content, and dynamic style injection for Recharts.
2. **`src/components/ui/popover.tsx`**:
   - Radix UI Popover primitive wrapper (`Popover`, `PopoverTrigger`, `PopoverContent`).
3. **`src/components/ui/calendar.tsx`**:
   - `react-day-picker` wrapper with Vietnamese/English date formatting and styling.
4. **`src/components/ui/date-range-picker.tsx`**:
   - Port from HCMUTE: unified range selector supporting preset intervals and custom calendar range selection with `getDateRangeFromPreset`.
5. **`src/components/ui/number-ticker.tsx`**:
   - Port from HCMUTE: smooth spring counter using `useMotionValue` and `useSpring` from `motion/react`.

*Note: `management-page-header.tsx`, `card.tsx`, `badge.tsx`, `tabs.tsx`, `dialog.tsx`, `alert-dialog.tsx`, and `avatar.tsx` already exist in IEEE SMC 2027.*

---

## 7. Routing & Layout Architecture

### 7.1 Page Endpoints Comparison
| Module Page | Reference Route | Target Route | Layout Context |
|-------------|----------------|--------------|----------------|
| Analytics Hub | `/manage/analytics` | `/admin/analytics` | Admin Dashboard Layout (`src/app/admin/(dashboard)/layout.tsx`) |
| Loading Skeleton | `/manage/analytics/loading.tsx` | `/admin/analytics/loading.tsx` | Next.js App Router streaming boundary |
| Public Tracker | Embedded in `app/(public)/layout.tsx` | Embedded in `src/app/layout.tsx` or `src/app/(public)/...` | Runs globally on client navigation |

### 7.2 Sidebar Navigation Update
In `src/app/admin/(dashboard)/components/sidebar-config.ts`, add the Analytics item:
```typescript
{
  id: "analytics",
  title: "Analytics & Telemetry",
  href: "/admin/analytics",
  icon: BarChart2,
}
```
Placed under `Content Management` or alongside the `Overview` dashboard item.

### 7.3 Next.js 16 Architectural Rules (`AGENTS.md`)
- `useSearchParams()` in `src/app/admin/(dashboard)/analytics/page.tsx` must be wrapped in a `<Suspense fallback={<AdminDashboardSkeleton />}>` boundary to prevent Next.js build-time static rendering errors.
- Do NOT use deprecated `router.events`; keep router navigation in `startTransition` as done in the reference.

---

## 8. Data Contracts & API Specification

### 8.1 Unit Post Analytics Data Contracts
1. **`PostAuthorSummaryUnitDto`**:
   - `roleActivityDistribution: Record<string, number>`
   - `averageCollaboratorsPerPost: number`
   - `collaborationIndexPercent: number`
2. **`PostContentDistributionUnitDto`**:
   - `statusDistribution: Record<string, number>` (DRAFT, PUBLISHED, ARCHIVED)
   - `totalPosts: number`, `publishedCount: number`, `inProgressCount: number`, `uncategorizedCount: number`
   - `categories: { categoryId: string; categoryName: string; postCount: number }[]`
   - `topTags: { tagId: string; tagName: string; postCount: number }[]`
3. **`PostEngagementSummaryUnitDto`**:
   - `bilingualRatioPercent: number`
   - `deviceDistribution: Record<string, number>` (DESKTOP, MOBILE, TABLET, UNKNOWN)
   - `totalViewCount: number`
4. **`PostWorkflowSummaryUnitDto`**:
   - `averageDaysToPublish: number`, `medianDaysToPublish: number`
   - `averageTotalRounds: number`, `averageConsensusRounds: number`, `averageRejectionRounds: number`
   - `activeReviewersCount: number`, `totalAssignmentsCount: number`, `rejectionRatePercent: number`
5. **`PostCollaborationLeaderboardUnitDto`**:
   - `leaderboard: { authorId: string; authorName: string; ownedPostCount: number; collaboratedPostCount: number }[]`
6. **`PostContentGrowthUnitDto`**:
   - `dataPoints: { period: string; created: number; published: number }[]`
   - `granularity: string` ("DAY" | "WEEK" | "MONTH" | "QUARTER" | "YEAR")
7. **`PostEngagementTrendingUnitDto`**:
   - `totalViewCount: number`
   - `trendingPosts: { postId: string; postTitle: string; postSlug: string; viewCount: number }[]`

### 8.2 Website Telemetry Data Contracts
1. **`WebsiteStatsDto`**:
   - `pageviews: { value: number; prev: number }`
   - `visitors: { value: number; prev: number }`
   - `visits: { value: number; prev: number }`
   - `bounces: { value: number; prev: number }`
   - `totaltime: { value: number; prev: number }`
2. **`WebsitePageviewsDto`**:
   - `pageviews: { x: string; y: number }[]`
   - `sessions: { x: string; y: number }[]`
3. **`WebsiteMetricDto`**:
   - `{ x: string; y: number }` (for path, event, referrer, browser, os, device, country)
4. **`WebsiteActiveUsersDto`**:
   - `{ visitors: number }`
5. **`WebsiteRealtimeDto`**:
   - `countries: Record<string, number>`
   - `urls: Record<string, number>`
   - `totals: { views: number; visitors: number; events: number; countries: number }`
6. **`WebsiteDetailDto`**:
   - `{ id: string; name: string; domain: string; createdAt: string }`

### 8.3 System Post Analytics Data Contracts
1. **`PostOverviewSummarySystemDto`**:
   - `totalPosts: number`, `publishedCount: number`, `inProgressCount: number`, `totalViews: number`
   - `tenantTraffics: { tenantCode: string; tenantName: string; totalViews: number }[]`
2. **`PostOverviewActivityMapSystemDto`**:
   - `activityGrid: { dayOfWeek: number; hourOfDay: number; count: number }[]` (0=Sun..6=Sat, 0..23 hours)
3. **`PostGovernanceSummarySystemDto`**:
   - `storageQuotas: { tenantCode: string; tenantName: string; quotaUsedBytes: number }[]`
   - `qualityControlMetrics: { tenantCode: string; tenantName: string; draftCount: number; hiddenCount: number; totalCount: number; draftRatioPercent: number; hiddenRatioPercent: number }[]`
4. **`PostComparisonSummarySystemDto`**:
   - `productionRank: { tenantCode: string; tenantName: string; postCount: number; rank: number }[]`
   - `engagementRank: { tenantCode: string; tenantName: string; averageViews: number; rank: number }[]`
   - `workflowSpeed: { tenantCode: string; tenantName: string; averageDaysToPublish: number; rank: number }[]`
5. **`PostTrendHotTopicsSystemDto`**:
   - `hotTopics: { tagId: string; tagName: string; postCount: number }[]`
6. **`PostTrendKeywordAnalysisSystemDto`**:
   - `keywordAnalysis: { tenantCode: string; tenantName: string; tagName: string; postCount: number }[]`

---

## 9. Integration Plan into IEEE SMC 2027

### Phase 1: Package Dependencies & Base Primitives
1. Install missing packages:
   ```bash
   pnpm add recharts@2.15.4 date-fns@^4.1.0 react-day-picker@^9.14.0 @radix-ui/react-popover@^1.1.15
   ```
2. Add missing UI primitives into `src/components/ui/`:
   - `chart.tsx` (Recharts context and tooltip components)
   - `popover.tsx` (Radix popover)
   - `calendar.tsx` (DayPicker wrapper)
   - `date-range-picker.tsx` (Preset & custom range selector)
   - `number-ticker.tsx` (using `motion/react`)

### Phase 2: Analytics Module Structure
Create `src/modules/analytics/` with matching architecture:
```
src/modules/analytics/
├── index.ts
├── types/
│   ├── index.ts
│   ├── unit-post-analytics.ts
│   ├── website-analytics.ts
│   └── system-post-analytics.ts
├── utils/
│   └── analytics-formatters.ts
├── tracker/
│   ├── index.ts
│   ├── custom-events.ts
│   ├── umami-tracker.tsx
│   └── use-section-focus-tracker.ts
├── hooks/
│   ├── use-unit-post-analytics.ts
│   ├── use-website-analytics.ts
│   └── use-system-post-analytics.ts
└── components/
    ├── index.ts
    ├── unit-post/
    ├── website/
    └── system-post/
```

### Phase 3: Backend API Handlers & Prisma Integration
Implement Route Handlers under `src/app/api/admin/analytics/`:
- `src/app/api/admin/analytics/unit/post/...`: Query Prisma `Post` and `User` models to compute real distribution, growth timelines, author leaderboards, and trending posts.
- `src/app/api/admin/analytics/unit/website/...`: Provide telemetry endpoints connected to configured Umami instance or fallback realistic mock telemetry service for local development without external dependencies.
- `src/app/api/admin/analytics/system/post/...`: Aggregate cross-track / cross-author statistics, 7x24 publishing heatmap from post timestamps, and media file quota statistics from `MediaFile` table.

### Phase 4: Page Route & Admin Navigation
1. Create `src/app/admin/(dashboard)/analytics/page.tsx` and `loading.tsx` wrapping the tabbed views inside a `<Suspense>` boundary.
2. Update `src/app/admin/(dashboard)/components/sidebar-config.ts` to include the `Analytics` link with `BarChart2` icon.
3. Test build via `pnpm run build` to verify zero TypeScript and lint errors.

---

## 10. Verification Checklist

- [ ] All 3 tabs (`unit-post`, `website`, `system-post`) switch cleanly with URL parameter synchronization.
- [ ] Date range presets ("today", "7d", "30d", "this_month", "90d", "this_year", "all") update data correctly.
- [ ] Custom calendar date picker selects precise start and end dates.
- [ ] Both AreaCharts (growth and pageviews) render with smooth gradient fills and responsive tooltips.
- [ ] Donut pie chart renders reader device breakdowns with custom color palette.
- [ ] `NumberTicker` smoothly animates numeric transitions upon tab or date range change.
- [ ] Telemetry polling updates active visitors count every 25 seconds without layout shifts.
- [ ] No sparkle icons exist anywhere in the analytics module or admin dashboard.
- [ ] Next.js 16 build succeeds without `useSearchParams` dynamic bailout errors.
