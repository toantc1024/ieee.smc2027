# DISPATCH — Worker M2 (Analytics Module Implementation & User NaN Bug Fix)
Date: 2026-11-02T14:38:00Z

## Objective
Implement Milestone M2 (Analytics Module) for IEEE SMC 2027 portal, porting from reference HCMUTE frontend (`/Users/macos/Documents/Projects/hcmute-website/hcmute-website-frontend/`) with complete feature parity, and apply the non-numeric pagination bugfix in `src/app/api/admin/users/route.ts`.

## Core Requirements & Specifications
Read the three explorer handoff reports thoroughly before starting:
- `/Users/macos/ieee-smc-2027/.agents/teamwork/explorer_m2_1/handoff.md` (UI Components & Reference Mapping)
- `/Users/macos/ieee-smc-2027/.agents/teamwork/explorer_m2_2/handoff.md` (Prisma Aggregations, Route Blueprints & User NaN Fix)
- `/Users/macos/ieee-smc-2027/.agents/teamwork/explorer_m2_3/handoff.md` (Page Suspense, Sidebar Wiring, Hooks & E2E Contracts)
- `/Users/macos/ieee-smc-2027/.agents/teamwork/ORIGINAL_REQUEST.md`

### 1. User Management NaN Bugfix
File: `src/app/api/admin/users/route.ts`
Sanitize `page` and `limit` to prevent `NaN` passing into Prisma `skip`/`take`:
```typescript
const rawPage = parseInt(searchParams.get("page") || "1", 10);
const page = Number.isFinite(rawPage) && rawPage >= 1 ? rawPage : 1;

const defaultLimit = searchParams.has("limit") || searchParams.has("size") ? 20 : 100;
const rawLimitParam = searchParams.get("limit") || searchParams.get("size");
const rawLimit = rawLimitParam ? parseInt(rawLimitParam, 10) : defaultLimit;
const limit = Number.isFinite(rawLimit) && rawLimit >= 1 ? Math.min(100, rawLimit) : defaultLimit;
```

### 2. API Route Handlers
Create under `src/app/api/admin/analytics/`:
- `helpers.ts`: Shared query parser, date range sanitizer (auto-swap inverted dates, 400 on malformed dates, safe numeric clamping), in-memory telemetry buffer.
- `unit-post/route.ts`: Authenticated with `requireAdminRequest`. Genuine Prisma Post & User aggregations (status distribution, categories, views, trending posts, author leaderboard, growth timeline, device distribution, workflow speed, editorial KPIs). Dual-compatibility payload satisfying T1.2.1, T2.2.2, T2.2.5 and HCMUTE DTOs.
- `website/route.ts`: Authenticated with `requireAdminRequest`. GET handler with `dimension=active` branch (T1.2.4), zero-traffic/future range guard (T2.2.3), 7-dimension breakdown using Page, Registration, User models. POST handler for custom telemetry events (T1.2.5). Dual-compatibility payload satisfying T1.2.2, T2.2.1, T2.2.4.
- `system-post/route.ts`: Authenticated with `requireAdminRequest`. 4 master KPIs, 7x24 publishing heatmap matrix (168 cells: 7 days x 24 hours), cross-category track comparisons, governance storage quota from MediaFile, hot topics & keyword specialization. Dual-compatibility payload satisfying T1.2.3, T2.2.1.

### 3. Analytics Module Core (`src/modules/analytics/`)
Port from `/Users/macos/Documents/Projects/hcmute-website/hcmute-website-frontend/modules/analytics/`:
- `types/`: `unit-post-analytics.ts`, `website-analytics.ts`, `system-post-analytics.ts`, `index.ts`
- `utils/`: `analytics-formatters.ts`
- `hooks/`: `use-unit-post-analytics.ts`, `use-website-analytics.ts` (with 25s polling for active visitors), `use-system-post-analytics.ts`, `index.ts`
- `tracker/`: `custom-events.ts`, `use-section-focus-tracker.ts`, `umami-tracker.tsx`, `index.ts`
- `components/unit-post/`: `unit-post-analytics-dashboard.tsx`, `unit-post-kpi-grid.tsx` (8 animated KPI tiles with `NumberTicker`), `unit-post-growth-chart.tsx` (AreaChart with dual SVG gradients), `unit-post-distribution-charts.tsx`, `unit-post-workflow-card.tsx`, `unit-post-leaderboard-card.tsx`, `unit-post-trending-card.tsx`, `index.ts`
- `components/website/`: `website-telemetry-dashboard.tsx`, `website-telemetry-kpis.tsx` (Active visitor strip + 5 KPI tiles with delta trend badges), `website-pageviews-chart.tsx`, `website-dimensions-breakdown.tsx` (7 dimension tabs), `website-realtime-stream.tsx`, `website-diagnostic-dialog.tsx`, `website-reset-modal.tsx`, `website-audience-survey-card.tsx`, `index.ts`
- `components/system-post/`: `system-post-analytics-dashboard.tsx`, `system-overview-kpis.tsx` (4 master KPIs + Cross-Tenant Traffic Breakdown Card), `system-activity-heatmap.tsx` (7x24 publishing activity heatmap matrix), `system-comparison-table.tsx`, `system-governance-card.tsx`, `system-trends-topics.tsx`, `index.ts`
- `components/index.ts` & `index.ts`

### 4. Admin Page & Navigation Wiring
- `src/app/admin/(dashboard)/analytics/page.tsx`:
  `<Suspense fallback={<AnalyticsSkeleton />}>` wrapping `AnalyticsContent` using `useSearchParams()` for `?tab=`. Tri-tab segmented dock (`unit-post`, `website`, `system-post`).
- `src/app/admin/(dashboard)/components/sidebar-config.ts`:
  Add `{ id: "analytics", title: "Analytics", href: "/admin/analytics", icon: BarChart3 }` to `quickNavItems`.
- Mount `<UmamiTracker />` in `src/app/layout.tsx`.

## Critical Constraints
- ZERO SPARKLE ICONS: Never use Lucide `Sparkles`, `Sparkle`, `✨`, or sparkle SVGs.
- No excessive bilingual text or English in parentheses `()`.
- For each atomic or big change, make a git commit and push to `origin main`.
- MANDATORY INTEGRITY WARNING: DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Verification Requirements
1. `pnpm exec tsc --noEmit` -> 0 errors.
2. `pnpm run build` -> 0 errors (all 57+ routes compile cleanly, including `/admin/analytics`).
3. `npx tsx --env-file=.env --test tests/security/auth-adversarial.stress.ts` -> 22/22 pass.
4. `pnpm run test:e2e` -> 10/10 test suites pass.
5. Deliver handoff report to `.agents/teamwork/worker_m2/handoff.md`.
