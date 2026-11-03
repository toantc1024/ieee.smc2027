# DISPATCH — Explorer M3-1 (Page List View & Admin Pages API Handlers)
Date: 2026-11-02T15:40:00Z

## Mission
Investigate the reference HCMUTE page management (`modules/website-builder/` and `app/manage/pages/`) and target IEEE SMC 2027 codebase to specify the Page List View (`/admin/pages`) and the backend API route handlers (`/api/admin/pages`).

## Source of Truth Paths
- Reference: `/Users/macos/Documents/Projects/hcmute-website/hcmute-website-frontend/app/manage/pages/`
- Reference: `/Users/macos/Documents/Projects/hcmute-website/hcmute-website-frontend/modules/website-builder/`
- Target: `/Users/macos/ieee-smc-2027/src/app/admin/(dashboard)/pages/`
- Target: `/Users/macos/ieee-smc-2027/src/app/api/admin/pages/`
- Target Schema: `/Users/macos/ieee-smc-2027/prisma/schema.prisma` (Inspect `Page` and `PageHistory` models)
- E2E Tests: `/Users/macos/ieee-smc-2027/tests/e2e/tier1-feature-coverage/page-builder.test.ts`
- Edge Tests: `/Users/macos/ieee-smc-2027/tests/e2e/tier2-boundary-corner/page-builder-edge.test.ts`
- Cross-Feature: `/Users/macos/ieee-smc-2027/tests/e2e/tier3-cross-feature/cross-feature-interactions.test.ts`
- Workflows: `/Users/macos/ieee-smc-2027/tests/e2e/tier4-real-world/conference-workflows.test.ts`
- Original Request: `/Users/macos/ieee-smc-2027/.agents/teamwork/ORIGINAL_REQUEST.md`

## Key Questions to Answer
1. **API Endpoints**: What route handlers currently exist under `src/app/api/admin/pages/`? What are the exact schemas for `GET /api/admin/pages`, `POST /api/admin/pages`, `GET /api/admin/pages/[id]`, `PATCH /api/admin/pages/[id]`, `DELETE /api/admin/pages/[id]`, `POST /api/admin/pages/[id]/publish`, `POST /api/admin/pages/[id]/rollback`?
2. **Page List UI**: How does reference HCMUTE implement the dual view (`FolderTree` vs `Table2`), search with debounce, expand/collapse hierarchy, template modal, and bulk action bar?
3. **User Constraints**: Verify 0 sparkle icons, clean English terminology, and Next.js 16 App Router compliance.

Deliver your detailed report to `/Users/macos/ieee-smc-2027/.agents/teamwork/explorer_m3_1/handoff.md` and send a message when done.
