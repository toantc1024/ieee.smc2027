# Handoff Report — Explorer M2-3: Analytics Page, Sidebar, Hooks & E2E Contracts

## 1. Observation

### 1.1 Page Architecture & Layout Observation
1. **Target Page Path**: `src/app/admin/(dashboard)/analytics/page.tsx` does not currently exist.
2. **Dashboard Layout Context**:
   - `src/app/admin/(dashboard)/layout.tsx` (lines 11-25) restricts access to `user.role === "ADMIN"` and renders `<SimpleAdminLayout user={user}>{children}</SimpleAdminLayout>`.
   - `src/app/admin/(dashboard)/components/SimpleAdminLayout.tsx` (lines 33-45) wraps the content inside `<main id="admin-main-content" className="relative flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 lg:p-8"><div className="max-w-7xl mx-auto w-full">{children}</div></main>`.
3. **Next.js 16 Client `<Suspense>` Invariant**:
   - Next.js App Router requires client components that invoke `useSearchParams()` to be wrapped in a `<Suspense>` boundary. Failing to wrap causes SSR de-optimization or build failure during `next build`.
   - In HCMUTE reference (`/Users/macos/Documents/Projects/hcmute-website/hcmute-website-frontend/app/manage/analytics/page.tsx`), the page directly invoked `useSearchParams()`. In Next.js 16, this must be separated into an inner client component (`AnalyticsContent`) wrapped by `<Suspense fallback={<AnalyticsSkeleton />}>`.
4. **Header and UI Primitives**:
   - Header component: `src/components/ui/management-page-header.tsx` exists and supports `image3d` (`/assets/3d-icons/analytics__hcmute-3d-icon.png`), `title`, and `description`.
   - Radix Tabs: `src/components/ui/tabs.tsx` exists with `Tabs`, `TabsList`, `TabsTrigger`, and `TabsContent`.
   - Skeleton: `src/components/ui/skeleton.tsx` exists with animated pulse primitive.
   - Date range selector: `src/components/ui/date-range-picker.tsx` exists.

### 1.2 Sidebar Wiring Observation
1. **Actual File Locations**:
   - The dispatch referenced `src/components/admin/AdminSidebar.tsx`. Direct codebase search confirms the actual implementation is located at `src/app/admin/(dashboard)/components/AdminSidebar.tsx` (959 lines).
   - Sidebar menu items are declared in `src/app/admin/(dashboard)/components/sidebar-config.ts` (133 lines).
2. **Active State Mechanism**:
   - `AdminSidebar.tsx` (lines 170–184) computes `activeHref`:
     ```ts
     const candidates = [
       ...quickNavItems.map((item) => item.href),
       ...sidebarMenuGroups.flatMap((group) => group.items.map((item) => item.href)),
       "/admin/profile",
     ]
       .map(normalizeHref)
       .filter((href) => href !== "/admin")
       .sort((a, b) => b.length - a.length);

     return (
       candidates.find((href) => pathname === href || pathname.startsWith(`${href}/`)) ??
       (pathname === "/admin" ? "/admin" : null)
     );
     ```
   - Currently, `sidebar-config.ts` has no entry for `/admin/analytics`. Adding an entry to `quickNavItems` (e.g., `{ id: "analytics", title: "Analytics", href: "/admin/analytics", icon: BarChart3 }`) will automatically be picked up by `AdminSidebar.tsx` without requiring structural modification of the sidebar component itself.

### 1.3 Client Hooks & Telemetry Observation
1. **Reference Implementation Analysis**:
   - Reference repository: `/Users/macos/Documents/Projects/hcmute-website/hcmute-website-frontend/modules/analytics/`.
   - `hooks/use-unit-post-analytics.ts` (134 lines): manages state for `filter` (`from`, `to`, `granularity`, `topN`), fetches `getCollaborationSummary`, `getContentDistribution`, `getEngagementSummary`, `getWorkflowSummary`, `getCollaborationLeaderboard`, `getContentGrowth`, `getEngagementTrending`.
   - `hooks/use-website-analytics.ts` (202 lines): manages state for `filter` (`from`, `to`, `unit`, `timezone`, `dimensionType`), fetches `getStats`, `getPageviews`, `getMetrics`, `getDateRange`, `getActiveUsers`, `getRealtimeSnapshot`. Includes a 25-second interval timer polling active users:
     ```ts
     pollingRef.current = setInterval(() => {
       pollRealtime();
     }, 25000);
     ```
   - `hooks/use-system-post-analytics.ts` (137 lines): manages state for `filter` (`from`, `to`, `topN`), fetches `getOverviewSummary`, `getActivityMap`, `getGovernanceSummary`, `getComparisonSummary`, `getHotTopics`, `getKeywordAnalysis`.
   - `tracker/use-section-focus-tracker.ts` (63 lines): observes DOM nodes matching `.content-section, [data-section-name]` with `threshold: 0.5`. On intersection, fires `trackUmamiEvent("Section Focus", { section_id, section_name, tenant })` with deduplication via `Set<string>`.
   - `tracker/umami-tracker.tsx` (144 lines): sanitizes script URL (replaces localhost/docker internal addresses, upgrades HTTP to HTTPS), dynamically injects `<Script strategy="afterInteractive" />`, and invokes `useSectionFocusTracker()`.
   - `tracker/custom-events.ts` (104 lines): defines `trackUmamiEvent`, `trackSectionTabClick`, `trackDocumentDownload`, `trackFormSubmission`, `trackAudienceSurvey`.

### 1.4 E2E Test Suite Assertions Observation
Direct inspection of `tests/e2e/tier1-feature-coverage/analytics.test.ts` (126 lines) and `tests/e2e/tier2-boundary-corner/analytics-edge.test.ts` (112 lines) reveals the exact contract requirements:

| Test ID | Method | Endpoint / Query | Headers | Payload / Parameters | Expected Status | Exact Assertions |
|---------|--------|------------------|---------|----------------------|-----------------|------------------|
| **T1.2.1** | `GET` | `/api/admin/analytics/unit-post` | Admin Cookie | `from=2026-01-01T00:00:00Z`<br>`to=2026-12-31T23:59:59Z` | `200` | `data` must have at least one of: `totalPosts`, `statusDistribution`, `growth`, `dataPoints`, `editorialKpis` |
| **T1.2.2** | `GET` | `/api/admin/analytics/website` | Admin Cookie | (default params) | `200` | `data` must have at least one of: `visitors`, `pageviews`, `stats`, `activeVisitors`, `dimensions` |
| **T1.2.3** | `GET` | `/api/admin/analytics/system-post` | Admin Cookie | (default params) | `200` | `data` must have at least one of: `activityGrid`, `heatmap`, `totalPosts`, `unitRankings`, `comparison` |
| **T1.2.4** | `GET` | `/api/admin/analytics/website` | Admin Cookie | `dimension=active` | `200` or `204` | `res.data !== null && res.data !== undefined` |
| **T1.2.5** | `POST` | `/api/admin/analytics/website` | Admin Cookie | `{ event: "section_view", section: "CallForPapers", url: "/submissions", timestamp: "..." }` | `200`, `201`, `204`, or `400` | Standard HTTP response (must not 500) |
| **T2.2.1** | `GET` | All 3 endpoints (`unit-post`, `website`, `system-post`) | None (Unauthenticated) | None | `401` or `403` | Strictly `[401, 403].includes(res.status)` (never 200 or 500) |
| **T2.2.2** | `GET` | `/api/admin/analytics/unit-post` | Admin Cookie | `from=2030-01-01T00:00:00Z`<br>`to=2020-01-01T00:00:00Z` (Inverted) | `200` or `400` | `res.status !== 500` (auto-swap dates or return clean 400) |
| **T2.2.3** | `GET` | `/api/admin/analytics/website` | Admin Cookie | `from=2099-01-01T00:00:00Z`<br>`to=2099-01-02T00:00:00Z` (Zero-traffic) | `200` | `res.status !== 500`; `assert.ok(res.data)` returning structured empty metric DTOs |
| **T2.2.4** | `GET` | `/api/admin/analytics/website` | Admin Cookie | `dimension=unknown_unsupported_dim` | `200` or `400` | `res.status !== 500` (safe handling of invalid dimension) |
| **T2.2.5** | `GET` | `/api/admin/analytics/unit-post` | Admin Cookie | `from=not-a-valid-date-string-xyz` (Malformed) | `200` or `400` | `res.status !== 500` (fallback to default date or return clean 400) |
| **T4.3** | `GET` | `/api/admin/analytics/website`<br>`unit-post`<br>`system-post` | Admin Cookie | Standard ranges | `200` | Real-time conference workflow execution |

---

## 2. Logic Chain

1. **Routing & SSR Invariant**:
   - `src/app/admin/(dashboard)/analytics/page.tsx` needs to read `tab` from `useSearchParams()`.
   - In Next.js App Router, any component using `useSearchParams()` must be wrapped in `<Suspense>`.
   - Therefore, the file structure must export a parent component containing `<Suspense fallback={<AnalyticsSkeleton />}><AnalyticsContent /></Suspense>`.
2. **Tab State & URL Synchronization**:
   - The three valid tab values are `"unit-post"`, `"website"`, and `"system-post"`.
   - If `?tab=` is absent or invalid, it must default to `"unit-post"`.
   - When the user clicks a tab trigger, `router.replace('?tab=${tab}', { scroll: false })` wrapped in `useTransition()` ensures smooth state transitions without unnecessary full-page refreshes.
3. **Sidebar Integration**:
   - `AdminSidebar.tsx` evaluates `quickNavItems` and `sidebarMenuGroups` dynamically in `activeHref`.
   - Adding `{ id: "analytics", title: "Analytics", href: "/admin/analytics", icon: BarChart3 }` to `quickNavItems` in `sidebar-config.ts` automatically wires the navigation, active styling, and URL matching without modifying the 959-line `AdminSidebar.tsx` file.
4. **Telemetry Contract Reconciliation**:
   - The E2E test `T1.2.5` sends custom telemetry events via `POST /api/admin/analytics/website`.
   - Meanwhile, `useSectionFocusTracker` tracks section visibility using `IntersectionObserver`.
   - Therefore, `src/modules/analytics/tracker/useSectionFocusTracker.ts` and `customEvents.ts` should both dispatch to Umami and support optional direct forwarding to `POST /api/admin/analytics/website`.
   - `UmamiTracker` must be mounted in `src/app/layout.tsx` so that public conference visitors trigger real-time telemetry.
5. **E2E Resiliency**:
   - Endpoints must validate `from` and `to` with fallback to default dates (`new Date(NaN)` must not throw Prisma crashes).
   - Inverted ranges (`from > to`) should be auto-swapped so the query returns valid empty or chronological data rather than erroring out.
   - All endpoints must verify the session using `getCurrentUser()` or `validateAdminSession()`: unauthenticated calls immediately return 401.

---

## 3. Caveats

1. **Role Gating in Tab Selection**:
   In the HCMUTE reference, the `system-post` tab was conditionally hidden based on `evaluateGlobalAction` and `hasRole(roles, "SYSTEM_ADMIN")`. In IEEE SMC 2027, all users accessing `/admin/*` have `user.role === "ADMIN"` (as enforced by `src/app/admin/(dashboard)/layout.tsx`). Hence, all three tabs are accessible to admin users.
2. **Umami Server Availability**:
   In local development and E2E testing environments, an external Umami server may not be running. `UmamiTracker` is designed to fail open (return `null` gracefully without throwing runtime errors or blocking page loads).
3. **File Path Discrepancy in Prompt**:
   The prompt mentioned `src/components/admin/AdminSidebar.tsx`. The true path in the repository is `src/app/admin/(dashboard)/components/AdminSidebar.tsx`. The configuration changes belong exclusively in `src/app/admin/(dashboard)/components/sidebar-config.ts`.
4. **Mock vs Prisma Data**:
   When database tables (`Post`, `User`, `Registration`, `MediaFile`) have few or zero records (e.g. fresh DB in tests), endpoints must return well-formed zero-metric DTOs rather than `null` or `undefined`, as required by `T2.2.3`.

---

## 4. Conclusion & Concrete Implementation Specifications

### 4.1 Target Layout for `src/app/admin/(dashboard)/analytics/page.tsx`
Create `src/app/admin/(dashboard)/analytics/page.tsx` with the following structure:

```tsx
"use client";

import React, { Suspense, useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FileText, Globe, ShieldCheck } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ManagementPageHeader } from "@/components/ui/management-page-header";
import { Skeleton } from "@/components/ui/skeleton";
import {
  UnitPostAnalyticsDashboard,
  WebsiteTelemetryDashboard,
  SystemPostAnalyticsDashboard,
} from "@/modules/analytics";

const VALID_TABS = ["unit-post", "website", "system-post"] as const;
type AnalyticsTab = (typeof VALID_TABS)[number];

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-28 w-full rounded-sm" />
      <Skeleton className="h-10 w-80 rounded-sm" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-sm" />
        ))}
      </div>
      <Skeleton className="h-80 w-full rounded-sm" />
    </div>
  );
}

function AnalyticsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [, startTransition] = useTransition();

  const urlTab = searchParams.get("tab") as AnalyticsTab | null;
  const activeTab: AnalyticsTab = urlTab && VALID_TABS.includes(urlTab) ? urlTab : "unit-post";

  const handleTabChange = (nextTab: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", nextTab);
      router.replace(`?${params.toString()}`, { scroll: false });
    });
  };

  return (
    <div className="space-y-6 relative pb-12">
      <ManagementPageHeader
        title="Analytics"
        description="Editorial publishing metrics, website traffic telemetry, and system benchmarks"
        image3d="/assets/3d-icons/analytics__hcmute-3d-icon.png"
      />

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-3">
          <TabsList className="bg-slate-100 dark:bg-slate-800/60 p-1 rounded-sm gap-1">
            <TabsTrigger value="unit-post" className="gap-2 px-3 py-1.5 text-xs font-semibold">
              <FileText className="size-4" />
              <span>Unit Posts</span>
            </TabsTrigger>
            <TabsTrigger value="website" className="gap-2 px-3 py-1.5 text-xs font-semibold">
              <Globe className="size-4" />
              <span>Website Traffic</span>
            </TabsTrigger>
            <TabsTrigger value="system-post" className="gap-2 px-3 py-1.5 text-xs font-semibold">
              <ShieldCheck className="size-4" />
              <span>System Benchmark</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="unit-post" className="mt-0 focus-visible:outline-none">
          <UnitPostAnalyticsDashboard />
        </TabsContent>
        <TabsContent value="website" className="mt-0 focus-visible:outline-none">
          <WebsiteTelemetryDashboard />
        </TabsContent>
        <TabsContent value="system-post" className="mt-0 focus-visible:outline-none">
          <SystemPostAnalyticsDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<AnalyticsSkeleton />}>
      <AnalyticsContent />
    </Suspense>
  );
}
```

### 4.2 Sidebar Configuration Update (`src/app/admin/(dashboard)/components/sidebar-config.ts`)
Add `BarChart3` import from `lucide-react` and append to `quickNavItems`:

```ts
import {
  LayoutDashboard,
  BarChart3,
  FileText,
  ...
} from "lucide-react";

export const quickNavItems: SidebarMenuItem[] = [
  {
    id: "dashboard",
    title: "Overview",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    id: "analytics",
    title: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
];
```

### 4.3 Client Hooks & Telemetry Specification (`src/modules/analytics/`)
Structure the module as:
```
src/modules/analytics/
├── components/
│   ├── index.ts
│   ├── unit-post/
│   │   └── unit-post-analytics-dashboard.tsx (and subcards)
│   ├── website/
│   │   └── website-telemetry-dashboard.tsx (and subcards)
│   ├── system-post/
│   │   └── system-post-analytics-dashboard.tsx (and subcards)
│   └── UmamiTracker.tsx
├── hooks/
│   ├── useAnalytics.ts (facade / re-export)
│   ├── useUnitPostAnalytics.ts
│   ├── useWebsiteAnalytics.ts
│   ├── useSystemPostAnalytics.ts
│   └── useSectionFocusTracker.ts
├── tracker/
│   ├── custom-events.ts
│   ├── use-section-focus-tracker.ts
│   └── umami-tracker.tsx
├── types/
│   ├── index.ts
│   ├── unit-post-analytics.ts
│   ├── website-analytics.ts
│   └── system-post-analytics.ts
└── index.ts
```

- **`useUnitPostAnalytics` / `useAnalytics`**: Calls `/api/admin/analytics/unit-post?from=...&to=...`, returning `{ filter, updateFilter, isLoading, error, refetch, data: { authorSummary, contentDistribution, engagementSummary, workflowSummary, leaderboard, contentGrowth, engagementTrending } }`.
- **`useWebsiteAnalytics`**: Calls `/api/admin/analytics/website?from=...&to=...&type=...`, with a 25s interval timer polling `/api/admin/analytics/website?dimension=active`.
- **`useSystemPostAnalytics`**: Calls `/api/admin/analytics/system-post?from=...&to=...`.
- **`useSectionFocusTracker`**: Uses `IntersectionObserver` (0.5 threshold) on `.content-section, [data-section-name]`, deduplicates section hits, and calls `trackUmamiEvent("Section Focus", ...)`.
- **`UmamiTracker`**: Injected into `src/app/layout.tsx`.

---

## 5. Verification Method

To independently verify the implementation:

1. **Verify E2E Test Suite**:
   Execute the E2E test runner focusing on Tier 1 and Tier 2 analytics:
   ```bash
   # Run Tier 1 Feature Coverage
   npx tsx tests/e2e/runner.ts --tier 1
   # Run Tier 2 Boundary & Corner Cases
   npx tsx tests/e2e/runner.ts --tier 2
   ```
   **Pass Condition**: `tests/e2e/tier1-feature-coverage/analytics.test.ts` (5 tests) and `tests/e2e/tier2-boundary-corner/analytics-edge.test.ts` (5 tests) complete with 0 failures and 0 unhandled rejections.

2. **Verify Next.js Build & `<Suspense>` Invariant**:
   Execute:
   ```bash
   pnpm run build
   ```
   **Pass Condition**: `next build` exits with code 0 without any `"useSearchParams() should be wrapped in a suspense boundary"` warning or bailout errors on route `/admin/analytics`.

3. **Verify Sidebar Link & Active State**:
   - Inspect `src/app/admin/(dashboard)/components/sidebar-config.ts` to confirm `/admin/analytics` is registered.
   - Navigate to `http://localhost:3000/admin/analytics` and verify that the sidebar highlights "Analytics".
   - Navigate to `http://localhost:3000/admin/analytics?tab=website` and verify that the sidebar retains active highlighting while the tabs switch accurately.

4. **Invalidation Conditions**:
   - Any endpoint returning 500 when given inverted dates (`from > to`) or malformed timestamps invalidates T2.2.2 and T2.2.5.
   - Any unauthenticated request returning 200 or 500 instead of 401/403 invalidates T2.2.1.
   - Removing the `<Suspense>` wrapper around `useSearchParams()` invalidates Next.js build compliance.
