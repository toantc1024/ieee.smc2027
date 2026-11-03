# Handoff Report — Analytics Specification Mining

**Agent**: Explorer Survey 2 (Analytics Spec Miner)  
**Parent Agent ID**: `e417c152-55b4-4ecc-ad3e-6ec5f3ea6688`  
**Date**: 2026-11-02  
**Handoff Type**: Hard (Task Complete)  

---

## 1. Observation

1. **Reference Source Files**:
   - Primary analytics directory: `/Users/macos/Documents/Projects/hcmute-website/hcmute-website-frontend/modules/analytics/` (46 files across `components/`, `hooks/`, `tracker/`, `types/`, `utils/`).
   - Admin page route: `/Users/macos/Documents/Projects/hcmute-website/hcmute-website-frontend/app/manage/analytics/page.tsx` (151 lines) and `loading.tsx` (6 lines).
   - Public telemetry tracking: `/Users/macos/Documents/Projects/hcmute-website/hcmute-website-frontend/app/(public)/layout.tsx` (lines 17, 102).
   - API endpoints: `/Users/macos/Documents/Projects/hcmute-website/hcmute-website-frontend/lib/api-client/endpoints/` (`post-analytics-unit.ts` [136 lines], `post-analytics-system.ts` [112 lines], `website-analytics-unit.ts` [205 lines]).
   - Dependencies in reference: `/Users/macos/Documents/Projects/hcmute-website/hcmute-website-frontend/package.json` (`recharts: 2.15.4`, `date-fns: ^4.1.0`, `react-day-picker: ^9.14.0`, `@radix-ui/react-popover: ^1.1.15`, `framer-motion: ^12.29.0`).

2. **Target Project State**:
   - Location: `/Users/macos/ieee-smc-2027/`.
   - `package.json`:
     - Next.js: `16.3.4`, React: `19.2.8`.
     - Animation: `"motion": "^13.4.4"` installed.
     - Missing: `recharts`, `date-fns`, `react-day-picker`, `@radix-ui/react-popover`.
   - Code Layout: Code is in `src/` (configured via `tsconfig.json` `"paths": { "@/*": ["./src/*"] }`).
   - Admin Dashboard Layout: `src/app/admin/(dashboard)/` contains `posts/`, `pages/`, `users/`, `registrations/`, but currently lacks `analytics/`.
   - Existing Assets: 3D clay icon `/public/assets/3d-icons/analytics__hcmute-3d-icon.png` and background `/public/assets/manage-stats-bg.jpg` are already present in IEEE SMC 2027.
   - Header Component: `src/components/ui/management-page-header.tsx` is already present and matches reference interface.

3. **Sparkle Icon Audit**:
   - Searched `modules/analytics` and `app/manage/analytics` for `sparkle`, `Sparkles`, and `sparkle` icons. 0 results found.
   - Conclusion: Reference analytics module does not use any sparkle icons.

---

## 2. Logic Chain

1. **Feature Set Mapping**:
   - The reference analytics module is divided cleanly into three self-contained tabs: (1) `unit-post` (editorial KPIs, growth chart, distribution donut/stack, workflow speed, leaderboard, trending posts), (2) `website` (live telemetry, pageviews/sessions chart, multi-dimension breakdown, realtime stream, tracker diagnostic, data reset, audience survey), and (3) `system-post` (system KPIs, 7x24 activity heatmap, cross-unit comparison rankings, storage quotas, quality control alerts, hot topics tag cloud).
   - In addition, client telemetry tracking consists of `UmamiTracker` and `useSectionFocusTracker`.

2. **UI & Charting Dependencies**:
   - The interactive visualizations rely on `recharts` (for area charts and pie/donut charts) paired with shadcn `ChartContainer` primitives in `chart.tsx`.
   - Date range filtering relies on `DateRangePicker`, which internally uses `date-fns` for date arithmetic and `react-day-picker` inside a Radix UI `Popover`.
   - Since IEEE SMC 2027 lacks `recharts`, `date-fns`, `react-day-picker`, and `@radix-ui/react-popover`, these 4 packages must be installed for direct feature parity.
   - For number transitions, `motion/react` (already available via `"motion": "^13.4.4"`) replaces `framer-motion` seamlessly.

3. **Next.js 16 Compatibility**:
   - Under Next.js 16 (`AGENTS.md`), client components calling `useSearchParams()` must be wrapped in `<Suspense>` boundaries to avoid build bailout errors during static generation.
   - `src/app/admin/(dashboard)/analytics/page.tsx` must wrap the tabbed view inside `<Suspense fallback={<AdminDashboardSkeleton />}>`.

4. **Data Contract & Backend Integration**:
   - Reference frontend called Spring Boot REST APIs (`/api/v1/admin/analytics/...`).
   - In IEEE SMC 2027, the backend is a Prisma + PostgreSQL Next.js App Router application.
   - Unit editorial analytics can query Prisma `Post` and `User` models directly.
   - Telemetry analytics can either connect to a remote Umami instance or expose local Next.js Route Handlers (`src/app/api/admin/analytics/...`) returning formatted mock/local telemetry when Umami is offline.

---

## 3. Caveats

1. **Umami Server Availability**: The reference website telemetry features (live visitors, active URLs, device breakdown) connect to an Umami telemetry instance. If an external Umami server is not configured in the target environment, the route handlers should return mock/fallback telemetry data to ensure the UI remains fully interactive without throwing runtime network exceptions.
2. **Organization / Multi-tenant Nuances**: In HCMUTE, system analytics compared multiple university units/faculties. In IEEE SMC 2027, these can be mapped to conference tracks/topics (e.g. Systems, Cybernetics, Human-Machine Systems) or registration participant categories (Author, Regular, Student, IEEE Member).
3. **Zustand Dependency**: HCMUTE used Zustand for audience survey live vote sync. For IEEE SMC 2027, this can be handled via lightweight React state or local storage to avoid introducing an extra state management library unless needed by other modules.

---

## 4. Conclusion

The specification mining for the Analytics module is complete. All 26 features, 10 edge cases, UI controls, charting libraries, data contracts, and integration requirements have been fully discovered and documented in `survey_report.md`.

The path to integration into IEEE SMC 2027 is clear and actionable:
1. Install 4 missing packages: `recharts`, `date-fns`, `react-day-picker`, `@radix-ui/react-popover`.
2. Add 5 UI primitives: `chart.tsx`, `popover.tsx`, `calendar.tsx`, `date-range-picker.tsx`, `number-ticker.tsx`.
3. Port `src/modules/analytics/` with types, hooks, formatters, tracker, and components.
4. Implement API Route Handlers under `src/app/api/admin/analytics/` backed by Prisma aggregations.
5. Create `src/app/admin/(dashboard)/analytics/page.tsx` with `<Suspense>` and add the navigation link in `sidebar-config.ts`.

---

## 5. Verification Method

To verify the findings of this survey:
1. **Inspect Documentation**:
   - Read `/Users/macos/ieee-smc-2027/.agents/teamwork/explorer_survey_2/survey_report.md` for full feature tables and DTO specifications.
2. **Verify Reference Codebase**:
   - Inspect `/Users/macos/Documents/Projects/hcmute-website/hcmute-website-frontend/modules/analytics/` to confirm all 46 files match the reported structure.
   - Check `/Users/macos/Documents/Projects/hcmute-website/hcmute-website-frontend/app/manage/analytics/page.tsx` to verify tab layout and button positioning.
3. **Verify Target Codebase**:
   - Check `/Users/macos/ieee-smc-2027/package.json` to confirm absence of `recharts` and `date-fns`.
   - Inspect `/Users/macos/ieee-smc-2027/public/assets/3d-icons/analytics__hcmute-3d-icon.png` to confirm icon readiness.
   - Inspect `/Users/macos/ieee-smc-2027/src/components/ui/management-page-header.tsx` to confirm banner compatibility.
