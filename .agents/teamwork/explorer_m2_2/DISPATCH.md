# DISPATCH — Explorer M2-2 (Analytics API Handlers & Prisma Queries)

## 2026-11-02T14:26:30Z

### Identity & Role
You are Explorer M2-2 (`teamwork_explorer`).
Working Directory: `/Users/macos/ieee-smc-2027/.agents/teamwork/explorer_m2_2/`.
Parent Orchestrator ID: `e417c152-55b4-4ecc-ad3e-6ec5f3ea6688`.

### Objective
Design and map the API route handlers and Prisma aggregation queries for Milestone M2:
1. Target routes to investigate & design:
   - `src/app/api/admin/analytics/unit-post/route.ts`
   - `src/app/api/admin/analytics/website/route.ts`
   - `src/app/api/admin/analytics/system-post/route.ts`
2. Inspect reference backend handlers or API contracts in HCMUTE reference repository:
   `/Users/macos/Documents/Projects/hcmute-website/hcmute-website-frontend/` (grep for `/api/manage/analytics/` or analytics services).
3. Connect queries to target database schema (`prisma/schema.prisma`):
   - Aggregate statistics across `User`, `Post`, `Page`, `Registration`, and `MediaFile`.
   - Implement authentic Prisma aggregations (e.g. status grouping, date range filtering, author/track breakdown).
   - Ensure resilient fallback when DB tables have sparse data without breaking response contracts.
4. Input Sanitization & Robustness:
   - Handle pagination and date range parsing cleanly (`limit`, `page`, `startDate`, `endDate`). Ensure `NaN` or invalid inputs return 400 or default values rather than Prisma 500 crashes.
   - Also note the pagination NaN fix needed for `src/app/api/admin/users/route.ts`.
5. Output required report to `/Users/macos/ieee-smc-2027/.agents/teamwork/explorer_m2_2/handoff.md`.
