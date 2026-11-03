# Analytics Reference & UI Components Architectural Specification

**Agent**: Explorer M2-1 (`teamwork_explorer`)  
**Date**: 2026-11-02  
**Target Path**: `/Users/macos/ieee-smc-2027/src/modules/analytics/` & `/Users/macos/ieee-smc-2027/src/app/admin/(dashboard)/analytics/`  
**Reference Path**: `/Users/macos/Documents/Projects/hcmute-website/hcmute-website-frontend/modules/analytics/` & `/app/manage/analytics/`  
**Milestone**: M2 (Analytics Module)

---

## 1. Observation

Direct investigation of the reference repository `/Users/macos/Documents/Projects/hcmute-website/hcmute-website-frontend/` and target repository `/Users/macos/ieee-smc-2027/` revealed the following exact components, structure, and constraints:

### 1.1 Reference Directory Structure
- Main Page Hub:
  - `app/manage/analytics/page.tsx` (151 lines): Tri-tab segmented dock switching between `unit-post`, `website`, and `system-post`. Uses `useSearchParams()`, `useTransition()`, `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`, and `ManagementPageHeader`.
  - `app/manage/analytics/loading.tsx` (16 lines): Streaming fallback skeleton.
- Analytics Module Core:
  - `modules/analytics/index.ts`: Unified exports for dashboards, hooks, tracker, types.
  - `modules/analytics/components/unit-post/`:
    - `unit-post-analytics-dashboard.tsx` (174 lines)
    - `unit-post-kpi-grid.tsx` (179 lines)
    - `unit-post-growth-chart.tsx` (227 lines)
    - `unit-post-distribution-charts.tsx` (364 lines)
    - `unit-post-workflow-card.tsx` (150 lines)
    - `unit-post-leaderboard-card.tsx` (124 lines)
    - `unit-post-trending-card.tsx` (116 lines)
  - `modules/analytics/components/website/`:
    - `website-telemetry-dashboard.tsx` (225 lines)
    - `website-telemetry-kpis.tsx` (214 lines)
    - `website-pageviews-chart.tsx` (249 lines)
    - `website-dimensions-breakdown.tsx` (141 lines)
    - `website-realtime-stream.tsx` (117 lines)
    - `website-diagnostic-dialog.tsx` (126 lines)
    - `website-reset-modal.tsx` (78 lines)
    - `website-audience-survey-card.tsx` (400 lines)
  - `modules/analytics/components/system-post/`:
    - `system-post-analytics-dashboard.tsx` (169 lines)
    - `system-overview-kpis.tsx` (180 lines)
    - `system-activity-heatmap.tsx` (143 lines)
    - `system-comparison-table.tsx` (209 lines)
    - `system-governance-card.tsx` (186 lines)
    - `system-trends-topics.tsx` (162 lines)
  - `modules/analytics/tracker/`:
    - `umami-tracker.tsx` (144 lines)
    - `use-section-focus-tracker.ts` (63 lines)
    - `custom-events.ts` (104 lines)
  - `modules/analytics/hooks/`:
    - `use-unit-post-analytics.ts` (134 lines)
    - `use-website-analytics.ts` (202 lines)
    - `use-system-post-analytics.ts` (137 lines)
  - `modules/analytics/types/`:
    - `unit-post-analytics.ts` (115 lines)
    - `website-analytics.ts` (154 lines)
    - `system-post-analytics.ts` (128 lines)
  - `modules/analytics/utils/`:
    - `analytics-formatters.ts` (56 lines)

### 1.2 Target Shared UI Primitives Status
Verification of `/Users/macos/ieee-smc-2027/src/components/ui/` confirmed that M0 has successfully created all necessary primitives:
- `chart.tsx`: `ChartContainer`, `ChartTooltip`, `ChartTooltipContent`, `ChartConfig` present and supporting Recharts v2.15.
- `date-range-picker.tsx`: `DateRangePicker`, `getDateRangeFromPreset`, `DateRangePreset` present.
- `number-ticker.tsx`: Spring counter using `motion/react` present.
- `popover.tsx`: Radix Popover primitive present.
- `calendar.tsx`: `react-day-picker` wrapper present.
- `management-page-header.tsx`: Header component with title, description, icon, and background present.
- `card.tsx`, `badge.tsx`, `button.tsx`, `dialog.tsx`, `alert-dialog.tsx`, `avatar.tsx`, `skeleton.tsx`, `tabs.tsx` are fully functional.

### 1.3 Icon Audit & User Global Rules
1. **Sparkle Icon Audit**:
   - `grep_search` across `/Users/macos/Documents/Projects/hcmute-website/hcmute-website-frontend/modules/analytics/` and `/app/manage/analytics/` for `sparkle` yielded: `No results found`.
   - The reference implementation contains exactly 0 sparkle icons.
   - All components utilize standard Lucide icons: `BarChart2`/`BarChart3`, `Activity`, `TrendingUp`, `Globe2`/`Globe`, `FileText`, `FileBox`, `FileCheck`, `FileCheck2`, `Clock`, `Clock3`, `Eye`, `Languages`, `Users`, `Users2`, `CheckCircle2`, `AlertCircle`, `AlertTriangle`, `FolderTree`, `Tag`, `Hash`, `Laptop`, `Smartphone`, `Tablet`, `HelpCircle`, `Layers`, `ThumbsUp`, `RotateCcw`, `Trophy`, `Award`, `User`, `Flame`, `ExternalLink`, `MousePointerClick`, `Percent`, `Radio`, `Zap`, `Stethoscope`, `Trash2`, `Building`, `Building2`, `HardDrive`, `ShieldAlert`.
2. **Excessive Bilingual Text & Parentheticals Audit**:
   - User Global Rule: *"Do not make too much text or english as sub in () bracelet, no need"*.
   - Reference had mixed Vietnamese UI labels with occasional parentheses. For the IEEE SMC 2027 portal (an international IEEE conference portal), all labels must be mapped to clean, professional, unpadded English terms (e.g. "Total Posts", "Editorial Analytics", "Website Telemetry", "System Benchmark", "Bounce Rate", "Time to Publish").

---

## 2. Logic Chain

From the observations above, the component specifications and design logic proceed systematically:

### Step 1: Page Shell & Tab Routing (`src/app/admin/(dashboard)/analytics/page.tsx`)
1. **Next.js 16 Architectural Rule**: Because the page reads query parameter `?tab=` via `useSearchParams()`, it must be wrapped inside `<Suspense fallback={<AnalyticsSkeleton />}>` to avoid dynamic bailouts and build failures during Next.js App Router static optimization.
2. **Navigation Tabs**:
   - Segmented dock (`h-12 p-1.5 rounded-2xl bg-card border border-border/70 shadow-2xs`).
   - Tab 1: `unit-post` (Icon: `FileText`, Label: "Editorial Analytics", active color: `data-[state=active]:bg-blue-600 data-[state=active]:text-white`).
   - Tab 2: `website` (Icon: `Globe2`, Label: "Website Telemetry", active color: `data-[state=active]:bg-blue-600 data-[state=active]:text-white`).
   - Tab 3: `system-post` (Icon: `ShieldCheck`, Label: "System Benchmark", active color: `data-[state=active]:bg-red-600 data-[state=active]:text-white`).
   - Role guard: non-admin users cannot see or switch to `system-post`.

### Step 2: Tab 1 — Unit Post Editorial Analytics Component Tree
- **`UnitPostAnalyticsDashboard`**:
  - Filter Bar: Header title "Editorial Analytics", unified `DateRangePicker` with preset options (`today`, `7d`, `30d`, `this_month`, `90d`, `this_year`, `all`), auto-deriving granularity (`DAY`, `WEEK`, `MONTH`), and `RotateCcw` refresh button.
- **`UnitPostKpiGrid`** (8 Animated Tiles):
  1. *Total Posts*: `distribution.totalPosts`, description `${publishedCount} published · ${inProgressCount} drafting`, icon `FileText` (blue).
  2. *Unit Post Views*: `engagement.totalViewCount`, description "Total reader engagement for track posts", icon `Eye` (blue).
  3. *Bilingual Ratio*: `engagement.bilingualRatioPercent` (%), icon `Languages` (blue).
  4. *Collaboration Index*: `authorSummary.collaborationIndexPercent` (%), description `Avg ${averageCollaboratorsPerPost} co-authors/post`, icon `Users2` (blue).
  5. *Time to Publish*: `workflow.averageDaysToPublish` (days), description `Median: ${medianDaysToPublish} days`, icon `Clock` (blue). Formatted via `formatPositiveDays` to avoid negative duration artifacts.
  6. *Review Rounds*: `workflow.averageTotalRounds` (rounds), description `Consensus: ${averageConsensusRounds} · Revisions: ${averageRejectionRounds}`, icon `FileCheck` (blue).
  7. *Active Reviewers*: `workflow.activeReviewersCount` (people), description `${totalAssignmentsCount} assignments`, icon `CheckCircle2` (blue).
  8. *Rejection Rate*: `workflow.rejectionRatePercent` (%), icon `AlertCircle` (red).
  - Uses `<NumberTicker />` for smooth numeric spring transitions.
- **`UnitPostGrowthChart`**:
  - Recharts `AreaChart` with dual SVG gradient fills:
    - Created series: Sapphire Blue (`#2563eb`), opacity `0.4 -> 0.0`.
    - Published series: Crimson Red (`#e11d48`), opacity `0.45 -> 0.0`.
  - Granularity switcher pills: Day, Week, Month, Quarter, Year.
  - Edge case: single data point duplication (`period + " "`) to ensure Recharts area renders correctly.
  - Icons: `TrendingUp`, `Calendar`.
- **`UnitPostDistributionCharts`** (3 Cards Grid):
  - Card 1 (*Status Breakdown*): Proportional stacked bar (Published: blue, Draft: amber, Hidden: slate) + 3-box summary grid + bilingual ratio + uncategorized count. Icons: `FileBox`, `Languages`, `AlertTriangle`.
  - Card 2 (*Categories & Tags*): Top 5 categories with horizontal progress bars + Top 8 hashtag badges with frequency counts. Localized name formatter (`formatLocalizedName`) ensures stringified JSON strings e.g. `{"en": "Robotics"}` are cleanly extracted without displaying raw syntax. Icons: `FolderTree`, `Tag`, `Hash`.
  - Card 3 (*Device Distribution*): Recharts donut `PieChart` (Desktop: `#2563eb`, Mobile: `#e11d48`, Tablet: `#06b6d4`, Unknown: `#94a3b8`) + legend + total views footer. Icons: `Laptop`, `Smartphone`, `Tablet`, `HelpCircle`, `Layers`.
- **`UnitPostWorkflowCard`**:
  - Consensus vs Revision bar: % approved directly vs % requiring revisions.
  - 4 metrics: Avg Days to Publish, Avg Review Rounds, Active Reviewers, Rejection Rate.
  - Icons: `FileCheck2`, `Clock3`, `ThumbsUp`, `RotateCcw`, `Users`, `ShieldCheck`.
- **`UnitPostLeaderboardCard`**:
  - Ranked author list with gold (`Trophy`), silver (`Award`), bronze (`Award`) medals, avatar fallback initials, owned vs collaborated post breakdown, total post count.
- **`UnitPostTrendingCard`**:
  - Top viewed posts with ranks #1 (rose), #2 (amber), #3 (blue), eye view counts, and direct links to post details (`ExternalLink`). Icons: `Flame`, `Eye`, `ExternalLink`, `FileText`.

### Step 3: Tab 2 — Website Telemetry Component Tree
- **`WebsiteTelemetryDashboard`**:
  - Filter bar: Header title "Website Telemetry & Live Traffic", `DateRangePicker`, `WebsiteDiagnosticDialog` button (`Stethoscope`), `WebsiteResetModal` button (`Trash2`), refresh button (`RotateCcw`).
  - Polling interval: 25,000ms polling for active visitors and realtime events.
- **`WebsiteTelemetryKpis`**:
  - Live visitor strip: "Active Visitors: X online" with pulse indicator and 25s auto-update notice.
  - 5 KPI tiles with delta calculations (`calculateDiff`) and green/red trend badges:
    1. *Pageviews*: `stats.pageviews.value`, icon `Eye`.
    2. *Unique Visitors*: `stats.visitors.value`, icon `Users`.
    3. *Visits / Sessions*: `stats.visits.value`, icon `MousePointerClick`.
    4. *Bounce Rate*: `(bounces.value / visits.value) * 100` (%), icon `Percent` (inverted diff: lower is green).
    5. *Avg Visit Duration*: `(totaltime.value / visits.value)` (seconds), icon `Clock`.
- **`WebsitePageviewsChart`**:
  - Recharts `AreaChart` comparing Pageviews (`#2563eb`) and Sessions (`#e11d48`).
  - Timescale unit switcher: Hour, Day, Week, Month.
  - Quick metric summary badges: Total Views, Total Sessions. Icons: `Activity`, `Clock`.
- **`WebsiteDimensionsBreakdown`**:
  - 7 dimension tabs: Path (`FileText`), Event (`Activity`), Referrer (`ExternalLink`), Browser (`Compass`), OS (`Layers`), Device (`Laptop`), Country (`Globe`).
  - Top 10 ranked rows with index `#1..#10`, name, count, and horizontal percentage progress bar.
- **`WebsiteRealtimeStream`** (Last 30-min window):
  - 2-column layout: Active URLs with viewer badges + Realtime Countries & latest events. Icons: `Radio` (pulse), `Zap`, `Activity`, `Globe`.
- **`WebsiteDiagnosticDialog`**:
  - Modal displaying tracker parameters: Website ID (UUID with copy to clipboard), Domain name, Created date, Operational status badge. Icons: `Stethoscope`, `CheckCircle`, `Copy`, `Globe`, `Calendar`.
- **`WebsiteResetModal`**:
  - `AlertDialog` confirmation modal to wipe telemetry data. Icons: `Trash2`, `AlertTriangle`.
 solitons toast feedback via Sonner.
- **`WebsiteAudienceSurveyCard`**:
  - Surveys audience segments (Parents/Students, Attendees, Partners/Industry, Committee/Faculty, General/Other).
  - 4 KPI cards (Total Responses, Segment 1, Segment 2, Dominant Segment), stacked segment progress bar, ranked breakdown. Icons: `Users`, `GraduationCap`, `Building2`, `Briefcase`, `CircleEllipsis`, `Activity`, `ExternalLink`, `CheckCircle2`.

### Step 4: Tab 3 — System Post Benchmark Component Tree
- **`SystemPostAnalyticsDashboard`**:
  - Access control check: displays unauthorized warning card with `AlertCircle` if user is not System Admin or Conference Chair.
  - Filter bar: Header title "System Benchmark & Governance", `DateRangePicker`, refresh button (`RotateCcw`).
- **`SystemOverviewKpis`**:
  - 4 Master KPI tiles: Total System Posts (`totalPosts`), Published (`publishedCount`), In-Progress (`inProgressCount`), Total System Views (`totalViews`).
  - Cross-Tenant Traffic Breakdown Card: tracks/departments list with views and percentage bar. Icons: `Globe2`, `FileCheck`, `FileEdit`, `Eye`, `Building2`, `BarChart2`.
- **`SystemActivityHeatmap`**:
  - 7-day x 24-hour publishing activity heatmap matrix.
  - 5-tier normalized intensity scaling (neutral slate -> blue -> deep blue -> rose -> crimson red).
  - Hover tooltips showing exact day, hour, and post count. Legend with 5 color squares. Icon: `Flame`.
- **`SystemComparisonTable`**:
  - 3-criteria ranking table: Production (`FileText`), Engagement (`Eye`), Publishing Speed (`Clock`).
  - Medals for ranks #1 (gold), #2 (silver), #3 (bronze), and #4..N. Icon: `Trophy`.
- **`SystemGovernanceCard`** (2-column governance grid):
  - Left (*Storage Governance*): Storage quota bytes per unit/track sorted descending, formatted with `formatBytes` (B, KB, MB, GB, TB). Icons: `HardDrive`, `Building`.
  - Right (*Quality Control Alerts*): Anomaly detection with `AlertTriangle` warning when draft ratio > 40% or hidden ratio > 20%. Icons: `ShieldAlert`, `AlertTriangle`, `FileWarning`.
- **`SystemTrendsTopics`** (2-column matrix):
  - Left (*Hot Topics*): System-wide trending hashtag cloud with Top 3 solid blue. Icons: `TrendingUp`, `Tag`, `Hash`.
  - Right (*Keyword Matrix*): Cross-unit keyword specialization matrix. Icons: `Building2`, `Tag`.

---

## 3. Caveats

1. **Backend Integration Mode**: In the reference HCMUTE project, API client methods (`postAnalyticsUnitApi`, `websiteAnalyticsUnitApi`, `postAnalyticsSystemApi`) communicate with dedicated backend microservices. In IEEE SMC 2027, the backend route handlers (`/api/admin/analytics/unit-post`, `/api/admin/analytics/website`, `/api/admin/analytics/system-post`) will query Prisma database models (`Post`, `User`, `MediaFile`) with deterministic fallback mock services when telemetry engines are offline.
2. **Next.js 16 Suspense Boundary**: The main page component at `src/app/admin/(dashboard)/analytics/page.tsx` must wrap any component calling `useSearchParams()` inside `<Suspense fallback={<AnalyticsSkeleton />}>`. Omitting this will cause Next.js 16 production build (`pnpm run build`) to throw bail-out errors.
3. **No External Zustand for Telemetry**: The reference project used a global Zustand audience store for local vote tallying. In IEEE SMC 2027, this can be handled via lightweight React state or local storage without introducing unnecessary external state stores.
4. **Zero Sparkle Icons**: Strict compliance with the user rule is maintained. No `Sparkle` or `Sparkles` icon from Lucide React or any other icon set will be imported or rendered.
5. **Clean English Text**: All UI labels are converted to concise English without parenthesis bloat.

---

## 4. Conclusion

The Analytics Module architecture is fully mapped, verified, and ready for implementation in Milestone M2:
1. **Target Component Structure**: 24 UI components cleanly partitioned under `src/modules/analytics/components/` across `unit-post`, `website`, and `system-post`.
2. **Telemetry & Client Engine**: `UmamiTracker`, `useSectionFocusTracker`, and `custom-events.ts` ready to port under `src/modules/analytics/tracker/`.
3. **Data Contracts & Types**: Clean DTO definitions mapped under `src/modules/analytics/types/`.
4. **Hooks**: 3 specialized React hooks (`useUnitPostAnalytics`, `useWebsiteAnalytics`, `useSystemPostAnalytics`) under `src/modules/analytics/hooks/`.
5. **Page Route**: `src/app/admin/(dashboard)/analytics/page.tsx` with `<Suspense>` wrapper and updated sidebar navigation in `sidebar-config.ts`.
6. **Rule Compliance**: 100% compliant with 0 sparkle icons and 0 excessive bilingual parentheticals.

---

## 5. Verification Method

To independently verify this investigation and the upcoming implementation:

1. **Verify Reference File Existence**:
   ```bash
   ls -la /Users/macos/Documents/Projects/hcmute-website/hcmute-website-frontend/modules/analytics/components/unit-post/
   ls -la /Users/macos/Documents/Projects/hcmute-website/hcmute-website-frontend/modules/analytics/components/website/
   ls -la /Users/macos/Documents/Projects/hcmute-website/hcmute-website-frontend/modules/analytics/components/system-post/
   ```
2. **Verify Sparkle Icon Policy (Must return 0 results)**:
   ```bash
   grep -rnwi "sparkle" /Users/macos/Documents/Projects/hcmute-website/hcmute-website-frontend/modules/analytics/
   grep -rnwi "sparkles" /Users/macos/Documents/Projects/hcmute-website/hcmute-website-frontend/modules/analytics/
   ```
3. **Verify Target Primitives in IEEE SMC 2027**:
   ```bash
   ls -la /Users/macos/ieee-smc-2027/src/components/ui/chart.tsx
   ls -la /Users/macos/ieee-smc-2027/src/components/ui/date-range-picker.tsx
   ls -la /Users/macos/ieee-smc-2027/src/components/ui/number-ticker.tsx
   ```
4. **Build Verification (Upon Worker M2 Implementation)**:
   ```bash
   cd /Users/macos/ieee-smc-2027 && pnpm run build
   ```
   Ensure zero TypeScript compilation errors, zero lint warnings, and zero Next.js App Router dynamic bailout exceptions.
