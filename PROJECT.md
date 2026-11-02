# Project: IEEE SMC 2027 Portal Modernization

## Architecture
The IEEE SMC 2027 website is built with Next.js 16 (App Router), React 19, Tailwind CSS, Lucide React, and PostgreSQL via Prisma ORM.
This project ports and integrates three enterprise modules from the reference HCMUTE frontend:
1. **Website Builder / Page Editor**: Tri-panel studio visual CMS with Figma-ratio auto-fitting artboard canvas, counter-scaled action pills, seam dropzones, block registry for all 21 conference sections, info/history tabs, and tree/table list view.
2. **Analytics Hub**: Tri-dashboard analytics suite (`unit-post`, `website` telemetry with live visitors & period-over-period KPIs, `system-post` benchmark with 7x24 heatmap), client telemetry engine, and Prisma-backed route handlers.
3. **User Management & Profile & Last Login**: Extended Prisma User model (`status`, `lastLoginAt`, `lastLoginIp`, `lastLoginDevice`, `sessionVersion`), auth login tracking, enriched user table with status badges and `MoreHorizontal` actions, 2-column user detail page (`/admin/users/[id]`), and user profile management (`/admin/profile`) connected to sidebar greeting.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Shared Dependencies & UI Primitives | Install recharts, date-fns, react-day-picker, radix popover/switch, diff, zustand; create chart, popover, calendar, date-range-picker, switch, number-ticker | M0 | survey 1,2,3 |
| 2 | Prisma Schema Extensions | Extend User (status, lastLoginAt, lastLoginIp, lastLoginDevice, sessionVersion) and Page (parentId, orderIndex, version, content, PageHistory, WebsiteTemplate) | M0 | survey 1,3 |
| 3 | Auth Login Tracking | Record client IP and timestamp in password login, OTP verify, and Google callback endpoints | M1 | survey 3 |
| 4 | User List View Parity | Status badge (ShieldCheck/Alert/X), Last Login column, MoreHorizontal dropdown actions, search and filters | M1 | survey 3 |
| 5 | User Detail Page (`/admin/users/[id]`) | 2-column inspection view, active session IP & last access list, password reset modal, account block/unblock, delete | M1 | survey 3 |
| 6 | Profile Management (`/admin/profile`) | Personal info form, avatar display, role badges, account security card, logout button | M1 | survey 3 |
| 7 | Sidebar Greeting Link | Connect AdminSidebar greeting card to `/admin/profile` with hover transitions | M1 | survey 3 |
| 8 | Unit Post Editorial Analytics | 8 editorial KPIs, created vs. published growth area chart (dual series), status distribution, device donut chart, leaderboard | M2 | survey 2 |
| 9 | Website Telemetry Analytics | Live online visitors (25s poll), 5 KPI cards with delta calculation, pageviews/sessions chart, 7-dimension breakdown, 30-min event stream | M2 | survey 2 |
| 10 | System Post Benchmark | 4 master KPIs, 7x24 publishing activity heatmap matrix, cross-unit comparison table, quality control alerts | M2 | survey 2 |
| 11 | Analytics API Route Handlers | `/api/admin/analytics/unit-post`, `/api/admin/analytics/website`, `/api/admin/analytics/system-post` backed by Prisma & local mock fallbacks | M2 | survey 2 |
| 12 | Analytics Admin Page & Sidebar | Tabbed analytics view at `src/app/admin/(dashboard)/analytics/page.tsx` with `<Suspense>` boundary and sidebar config | M2 | survey 2 |
| 13 | Client Telemetry Engine | `UmamiTracker` and `useSectionFocusTracker` IntersectionObserver hook | M2 | survey 2 |
| 14 | Page List View (`/admin/pages`) | Dual view (FolderTree / Table2), search with debounce, expand/collapse, template configuration, floating bulk action bar | M3 | survey 1 |
| 15 | Tri-Panel Studio Layout | 308px left block drawer, fluid center canvas, 295px right property inspector (content, styles, json tabs) | M3 | survey 1 |
| 16 | Dynamic Auto-Fit Canvas | Figma-ratio auto-fitting (Desktop 1240px, Tablet 768px, Mobile 390px), counter-scaled floating action pills, seam dropzones | M3 | survey 1 |
| 17 | Block Registry & Conference Sections | Register all 21 IEEE SMC conference sections (HeroCarousel, CallForPapers, CommitteesSection, etc.) in modular registry | M3 | survey 1 |
| 18 | Page Top Bar & Sub-Toolbar Controls | Viewport switcher, zoom presets, undo/redo, paste, preview mode, versioned save (Ctrl+S / Cmd+S), publish/unpublish | M3 | survey 1 |
| 19 | Auxiliary Tabs & Modal | Info tab (0-100 SEO scoring, social preview), History tab (properties diff), SyncTranslateModal (Languages icon) | M3 | survey 1 |
| 20 | Page Data Persistence & Public Rendering | Save `{ root, content }` AST to PostgreSQL; render published pages dynamically on public routes | M3 | survey 1 |
| 21 | Opaque-Box E2E Test Suite | Comprehensive automated test harness covering Tiers 1-4 across all ported modules | E2E | user request |
| 22 | Coverage Hardening & Verification | 100% E2E test pass followed by Tier 5 adversarial edge-case hardening | Final | user request |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M0 | Shared Foundation & Dependencies | Package installation, Prisma schema extensions, database sync, shared UI primitives | none | DONE |
| M1 | User Management, Profile & Last Login | Auth IP/time tracking, enhanced user list, user detail page, profile management, sidebar greeting | M0 | IN_PROGRESS (Iteration 2) |
| M2 | Analytics Module | Port analytics components, hooks, tracker, Prisma route handlers, tabbed analytics page, sidebar link | M0 | PLANNED |
| M3 | Page Editor & Website Builder | Visual studio engine, canvas auto-fit, 21 conference section registry, property inspector, auxiliary tabs, page list | M0 | PLANNED |
| E2E | E2E Testing Suite | Requirement-driven opaque-box test runner and test cases (Tiers 1-4) | M0 | DONE (TEST_READY.md published) |
| Final | E2E Test Pass & Coverage Hardening | Pass 100% of E2E tests across Tiers 1-4, then Tier 5 adversarial hardening | M1, M2, M3, E2E | PLANNED |

## Interface Contracts

### M0 ↔ All Modules (Data Models & Primitives)
- Prisma User model additions:
  - `status`: String (default: "ACTIVE")
  - `lastLoginAt`: DateTime?
  - `lastLoginIp`: String?
  - `lastLoginDevice`: String?
  - `sessionVersion`: Int (default: 1)
- Prisma Page model additions:
  - `parentId`: String?
  - `orderIndex`: Int (default: 0)
  - `version`: Int (default: 1)
  - `content`: Json? (structured AST `{ root: {}, content: PageBlock[] }`)
  - `PageHistory` model with `pageId`, `version`, `content`, `changeSummary`, `createdAt`
- Shared UI primitives in `src/components/ui/`:
  - `chart.tsx`: Recharts container wrapper with tooltip formatting
  - `popover.tsx`: Radix Popover primitive
  - `calendar.tsx`: react-day-picker wrapper
  - `date-range-picker.tsx`: Preset and custom range selector returning `{ from: Date, to: Date }`
  - `switch.tsx`: Radix Switch primitive
  - `number-ticker.tsx`: Motion spring counter

### M1 ↔ Authentication & Admin (User Management & Profile)
- Auth endpoints:
  - `src/app/api/auth/login-password/route.ts`: Extracts `x-forwarded-for` and `user-agent`, updates `lastLoginAt`, `lastLoginIp`, `lastLoginDevice`
  - `src/app/api/auth/otp/verify/route.ts`: Same IP and device extraction
  - `src/app/api/auth/callback/google/route.ts`: Same IP and device extraction
- Admin User endpoints:
  - `GET /api/admin/users`: Returns `{ users: UserSummary[], total: number }` including `status`, `lastLoginAt`, `lastLoginIp`
  - `GET /api/admin/users/[id]`: Returns detailed user record with active session info
  - `PATCH /api/admin/users/[id]`: Updates role, status, profileData
  - `POST /api/admin/users/[id]/reset-password`: Resets user password
  - `POST /api/admin/users/[id]/revoke-sessions`: Increments `sessionVersion`
- Profile endpoints:
  - `GET /api/profile`: Returns current user profile
  - `PATCH /api/profile`: Updates current user profile (name, avatar, bio)
- Frontend routes:
  - `src/app/admin/(dashboard)/users/page.tsx`
  - `src/app/admin/(dashboard)/users/[id]/page.tsx`
  - `src/app/admin/(dashboard)/profile/page.tsx`
  - `src/app/admin/(dashboard)/components/AdminSidebar.tsx` (greeting card link)

### M2 ↔ Analytics (Metrics & Telemetry)
- Endpoints:
  - `GET /api/admin/analytics/unit-post?from=...&to=...`: Returns editorial KPIs, growth timeline, status distribution, device breakdown
  - `GET /api/admin/analytics/website?from=...&to=...`: Returns live visitors, pageviews/sessions, 7-dimension breakdown
  - `GET /api/admin/analytics/system-post?from=...&to=...`: Returns benchmark KPIs, 7x24 heatmap matrix, unit rankings
- Frontend routes:
  - `src/app/admin/(dashboard)/analytics/page.tsx` (wrapped in `<Suspense>`)
  - Navigation added in `src/app/admin/(dashboard)/components/sidebar-config.ts`

### M3 ↔ Website Builder (Pages & Studio)
- Storage contract:
  - `GET /api/admin/pages`: Returns tree/table list of pages with parent-child hierarchy
  - `GET /api/admin/pages/[id]`: Returns page with `content` AST, `metaTitle`, `metaDescription`, `isPublished`
  - `PATCH /api/admin/pages/[id]`: Saves page `content`, increments `version`, creates `PageHistory` entry
  - `POST /api/admin/pages/[id]/publish`: Toggles publish state
- Block structure:
  - `PageBlock`: `{ id: string, type: string, props: Record<string, any>, children?: PageBlock[] }`
  - All 21 conference sections mapped to `type: "HeroCarousel" | "CallForPapers" | "CommitteesSection" | ...`
- Frontend routes:
  - `src/app/admin/(dashboard)/pages/page.tsx` (Page list tree/table view)
  - `src/app/admin/(dashboard)/pages/[id]/page.tsx` (Tri-panel visual studio editor)

## Code Layout
- `prisma/schema.prisma`: Database schema definitions
- `src/components/ui/`: Shared UI primitives (`chart.tsx`, `popover.tsx`, `calendar.tsx`, `date-range-picker.tsx`, `switch.tsx`, `number-ticker.tsx`)
- `src/modules/analytics/`: Analytics module (components, hooks, tracker, types, utils)
- `src/modules/website-builder/`: Website builder module (studio components, canvas, store, registry, auxiliary tabs)
- `src/app/admin/(dashboard)/users/`: User management pages and modals
- `src/app/admin/(dashboard)/users/[id]/`: User detail inspection page
- `src/app/admin/(dashboard)/profile/`: User profile management page
- `src/app/admin/(dashboard)/analytics/`: Analytics dashboard page
- `src/app/admin/(dashboard)/pages/`: Page list view and builder studio
- `src/app/api/admin/`: Admin API route handlers (users, analytics, pages)
- `tests/e2e/`: Requirement-driven opaque-box E2E test suite
