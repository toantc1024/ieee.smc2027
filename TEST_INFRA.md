# Test Infrastructure & Strategy Specification: IEEE SMC 2027 Portal

**Integrity Mode**: Development & Opaque-Box E2E Testing  
**Test Harness Location**: `/Users/macos/ieee-smc-2027/tests/e2e/`  
**Execution Command**: `pnpm run test:e2e` or `npx tsx tests/e2e/runner.ts`  
**Target Platform**: Next.js 16 (App Router), Node.js 22, PostgreSQL (Prisma ORM), Tailwind CSS  

---

## 1. Test Philosophy & Principles

The IEEE SMC 2027 E2E Testing Suite is architected under an **opaque-box, requirement-driven** doctrine:

1. **Opaque-Box Verification**: Tests interact with the portal strictly via external HTTP APIs, cookies, headers, and public/administrative routes. Internal module private methods or memory state are never mutated directly during E2E verification.
2. **Authoritative Output Derivation**: Expected outputs are derived directly from:
   - The reference HCMUTE system specifications (`/Users/macos/Documents/Projects/hcmute-website/hcmute-website-frontend/`).
   - Project interface contracts documented in `/Users/macos/ieee-smc-2027/PROJECT.md`.
   - Security constraints codified in `/Users/macos/ieee-smc-2027/.agents/skills/ieee-smc-security/SKILL.md`.
3. **Zero Facade Testing**: No mock stubs that bypass database constraints or route security handlers. Tests execute against real PostgreSQL schema models and Next.js route handlers.
4. **Self-Contained & Isolated Lifecycles**: Every test generates distinct resources with timestamped/UUID identifiers and performs cleanup in teardown hooks, ensuring tests can execute in any order or repeatedly without polluting production data.
5. **Progressive Testability & Dual-Track Alignment**: While implementation milestones (M0, M1, M2, M3) proceed in parallel, the test harness defines the authoritative contracts across all 4 tiers, providing crisp pass/fail diagnostics to guide implementation agents toward 100% completion.

---

## 2. Feature Inventory Under Test

The test suite provides complete requirement coverage across the four ported modules:

| Module Code | Module Name | Scope & Interface Contract | Milestone Source |
|---|---|---|---|
| **FEAT-1** | **Page Editor / Page Builder** | Tree/table page listing (`GET /api/admin/pages`), AST block persistence (`GET/PATCH /api/admin/pages/[id]`), all 21 IEEE conference sections (HeroCarousel, CallForPapers, CommitteesSection, etc.), page publishing toggle (`POST /api/admin/pages/[id]/publish`), home page immutability guard, slug normalization. | M3 (`PROJECT.md` § Interface Contracts) |
| **FEAT-2** | **Analytics Module** | Unit post editorial metrics (`GET /api/admin/analytics/unit-post`), website telemetry with live active visitors & 7-dimension breakdowns (`GET /api/admin/analytics/website`), system post benchmarks with 7x24 heatmap matrix (`GET /api/admin/analytics/system-post`), client telemetry event handling. | M2 (`PROJECT.md` § Interface Contracts) |
| **FEAT-3** | **User Management, Profile & Last Login** | User directory query with status & login telemetry (`GET /api/admin/users`), user detail inspection (`GET /api/admin/users/[id]`), role/status mutation (`PATCH /api/admin/users/[id]`), password reset & session revocation (`POST /api/admin/users/[id]/revoke-sessions`), client IP & timestamp tracking upon login, profile query & update (`GET/PATCH /api/profile`). | M1 (`PROJECT.md` § Interface Contracts) |
| **FEAT-4** | **Build & Route Verification** | Public routes (`/`, `/committees`, `/submissions`, `/registration`, `/program`, `/travel`, `/news`), custom published dynamic routes, administrative guard enforcement (`/admin/*`), login route rendering (`/admin/login`), 404 fallbacks, security response headers (`X-Content-Type-Options`, `X-Frame-Options`, `Set-Cookie` attributes). | M0 & Base App Router |

---

## 3. Four-Tier Testing Methodology

The testing harness executes test cases across four distinct tiers of validation:

```
┌─────────────────────────────────────────────────────────────────┐
│                     4-TIER TESTING PYRAMID                      │
├─────────────────────────────────────────────────────────────────┤
│ Tier 4: Real-World Scenarios (End-to-End Conference Workflows) │
│ ─────────────────────────────────────────────────────────────── │
│ Tier 3: Cross-Feature Interactions (Pairwise Module Handshakes) │
│ ─────────────────────────────────────────────────────────────── │
│ Tier 2: Boundary & Corner Cases (Stress, Invalids, Errors)      │
│ ─────────────────────────────────────────────────────────────── │
│ Tier 1: Feature Coverage (Core Happy Paths >=5 per Feature)     │
└─────────────────────────────────────────────────────────────────┘
```

### Tier 1: Feature Coverage (>=5 test cases per feature)
Covers the primary happy-path functional requirements:
- **FEAT-1 (Page Builder)**:
  1. `T1.1.1`: Retrieve all conference pages with default seeded conference pages.
  2. `T1.1.2`: Fetch single page by ID/slug with structured blocks AST.
  3. `T1.1.3`: Create custom conference page with title, slug, and initial block configuration.
  4. `T1.1.4`: Update page metadata, title, and AST block structure.
  5. `T1.1.5`: Toggle publication state (draft to published) and verify public visibility.
- **FEAT-2 (Analytics Module)**:
  1. `T1.2.1`: Query unit-post editorial analytics with date range parameters (`from`, `to`).
  2. `T1.2.2`: Query website telemetry returning active visitors, pageviews/sessions, and 7-dimension breakdowns.
  3. `T1.2.3`: Query system-post benchmark returning 7x24 publishing heatmap matrix and cross-unit comparison rankings.
  4. `T1.2.4`: Poll realtime active visitor telemetry.
  5. `T1.2.5`: Emit client telemetry custom events and verify tracker payload acceptance.
- **FEAT-3 (User Management & Profile)**:
  1. `T1.3.1`: Retrieve user directory with pagination, status badges, and last login metadata.
  2. `T1.3.2`: Inspect individual user record (`/admin/users/[id]`) with active session telemetry.
  3. `T1.3.3`: Update user role and conference profile metadata.
  4. `T1.3.4`: Authenticate user and verify client IP (`x-forwarded-for`) and timestamp recording.
  5. `T1.3.5`: Fetch and update self-profile (`/api/profile`) with bio and affiliation.
- **FEAT-4 (Build & Route Verification)**:
  1. `T1.4.1`: Public home route (`/`) returns HTTP 200 with standard conference sections.
  2. `T1.4.2`: Standard conference routes (`/committees`, `/submissions`, `/registration`, `/travel`, `/news`) return HTTP 200.
  3. `T1.4.3`: Admin login page (`/admin/login`) loads cleanly.
  4. `T1.4.4`: Protected admin routes (`/admin`, `/admin/pages`, `/admin/users`) enforce session authentication.
  5. `T1.4.5`: Published custom page route dynamically renders content at its public slug.

### Tier 2: Boundary & Corner Cases (>=5 test cases per feature)
Adversarial verification testing stress boundaries, invalid inputs, and security constraints:
- **FEAT-1 (Page Builder Edge)**:
  1. `T2.1.1`: Automatic slug normalization and sanitization (spaces, diacritics, symbols).
  2. `T2.1.2`: Rejection of duplicate slug collision across tenant pages.
  3. `T2.1.3`: Guard preventing deletion or unpublishing of the default home page (`home`).
  4. `T2.1.4`: Unauthenticated access to admin page mutation endpoints returns HTTP 401/403.
  5. `T2.1.5`: Malformed AST blocks (invalid JSON, non-array structures) handled gracefully without server crash.
- **FEAT-2 (Analytics Edge)**:
  1. `T2.2.1`: Unauthenticated access to analytics route handlers returns HTTP 401/403.
  2. `T2.2.2`: Inverted date ranges (`from` chronologically after `to`) normalized safely without 500 error.
  3. `T2.2.3`: Zero-traffic date interval query returns structured empty metric DTOs instead of null pointer exceptions.
  4. `T2.2.4`: Extreme pagination numbers and invalid dimension filters rejected or clamped safely.
  5. `T2.2.5`: Malformed timestamp strings in query parameters handled with 400 Bad Request.
- **FEAT-3 (User Management Edge)**:
  1. `T2.3.1`: Non-admin / unauthenticated access to user management APIs rejected with 401/403.
  2. `T2.3.2`: Self-downgrade prevention: active admin cannot downgrade their own role.
  3. `T2.3.3`: Last admin safeguard: system rejects deleting or demoting the last remaining ADMIN account.
  4. `T2.3.4`: Invalid email syntax or short password (<6 characters) rejected with HTTP 400.
  5. `T2.3.5`: Non-existent user ID query/patch/delete returns HTTP 404 Not Found.
- **FEAT-4 (Build & Route Edge)**:
  1. `T2.4.1`: Non-existent URL paths return HTTP 404 without internal server stack traces.
  2. `T2.4.2`: Directory traversal attack vectors (`/../../etc/passwd`, `%2e%2e`) safely blocked.
  3. `T2.4.3`: Unpublished custom page returns HTTP 404 on public route access.
  4. `T2.4.4`: Unauthenticated access to admin dashboard redirects to `/admin/login`.
  5. `T2.4.5`: Response headers enforce security flags (`HttpOnly`, `SameSite=Lax`, `X-Content-Type-Options`).

### Tier 3: Cross-Feature Interactions
Pairwise stateful handshakes validating interplay across modules:
1. `T3.1`: **User Login -> Last Login Telemetry -> Analytics**:
   User authenticates -> client IP and timestamp stored in DB -> user list reflects updated `lastLoginAt` and `lastLoginIp` -> website analytics registers active visitor count increment.
2. `T3.2`: **Profile Update -> Auth Session Reflection -> Sidebar Greeting**:
   Admin updates profile (display name, affiliation, title) -> `/api/profile` persists -> subsequent `/api/auth/me` and `/admin` greeting render updated name.
3. `T3.3`: **Page Builder Creation -> AST Block Assembly -> Public Dynamic Rendering**:
   Admin creates page with `HeroCarousel` + `CallForPapers` blocks -> updates props -> publishes page -> public GET request renders exact section titles and metadata.
4. `T3.4`: **Session Revocation / Status Inactivation -> Immediate API Lockout**:
   Admin revokes user session or transitions status to `INACTIVE` -> user's existing JWT token is rejected on subsequent API requests with HTTP 401/403.
5. `T3.5`: **Concurrent Page Editing & Version Conflict Resolution**:
   Two concurrent update requests with differing versions tested for optimistic locking integrity.

### Tier 4: Real-World Scenarios
Multi-step end-to-end conference workflows mirroring real conference administrative lifecycles:
1. `T4.1`: **End-to-End Conference Track Content Lifecycle**:
   Admin authenticates -> seeds new track page ("Workshop on Cybernetics & AI") with 3 conference sections -> preview in draft mode -> edits section props -> publishes -> verifies public availability -> unpublishes -> cleans up.
2. `T4.2`: **Reviewer & Delegate Onboarding & Access Control Workflow**:
   Admin provisions reviewer account with initial role `USER` and conference track `SUBMITTER` -> reviewer logs in via password -> verifies IP/device capture -> reviewer edits self-profile with academic credentials -> reviewer attempts restricted admin action (verifies HTTP 403) -> admin inspects reviewer profile -> admin updates status -> session revocation.
3. `T4.3`: **Real-Time Conference Telemetry Monitoring & Reporting Workflow**:
   Simulated multi-device visitor traffic generated across conference pages -> admin queries website telemetry, editorial KPIs, and system benchmark heatmap -> verifies metric aggregations and delta calculations.
4. `T4.4`: **Content Versioning, Audit Trail & Disaster Recovery Workflow**:
   Admin creates page v1 -> modifies AST to v2 -> modifies AST to v3 -> retrieves version history -> verifies AST delta -> performs rollback to v1 -> verifies restored block configuration.

---

## 4. Test Infrastructure Architecture

### File Layout
```
tests/e2e/
├── config.ts                          # Test configurations, endpoints, credentials
├── helpers/
│   ├── http-client.ts                 # Cookie-jar HTTP client with auth session management
│   ├── server-manager.ts              # Automatic Next.js dev server lifecycle manager
│   ├── db-helper.ts                   # Direct Prisma verification & cleanup utilities
│   └── test-fixtures.ts               # Sample AST blocks, conference pages, profile data
├── tier1-feature-coverage/
│   ├── page-builder.test.ts           # Tier 1: Page Editor / Website Builder tests
│   ├── analytics.test.ts              # Tier 1: Analytics Module tests
│   ├── user-management.test.ts        # Tier 1: User Management & Profile tests
│   └── build-routes.test.ts           # Tier 1: Build & Route Verification tests
├── tier2-boundary-corner/
│   ├── page-builder-edge.test.ts      # Tier 2: Page Editor boundary tests
│   ├── analytics-edge.test.ts         # Tier 2: Analytics boundary tests
│   ├── user-management-edge.test.ts   # Tier 2: User & Profile boundary tests
│   └── build-routes-edge.test.ts      # Tier 2: Route & Security boundary tests
├── tier3-cross-feature/
│   └── cross-feature-interactions.test.ts # Tier 3: Pairwise integration tests
├── tier4-real-world/
│   └── conference-workflows.test.ts   # Tier 4: Real-world conference workflows
└── runner.ts                          # Dedicated test execution runner and reporter
```

### Server Management & Execution Strategy
The test harness operates in two modes:
1. **Live Server Mode**: If a Next.js server is already active at `process.env.E2E_BASE_URL` (e.g. `http://localhost:3000` or `http://localhost:3099`), tests immediately execute against it.
2. **Auto-Spawn Mode**: If no server is detected, `server-manager.ts` automatically launches `next dev --port 3099` in a dedicated child process, polls until health check succeeds, executes all test suites, and gracefully terminates the process upon completion.

---

## 5. Coverage Thresholds & Success Criteria

- **Tier 1 Coverage**: 100% of defined happy-path test cases (>=5 per feature, min 20 total) passing.
- **Tier 2 Coverage**: 100% of boundary and error-handling test cases (>=5 per feature, min 20 total) passing.
- **Tier 3 Coverage**: 100% of pairwise cross-feature handshakes (min 5 total) passing.
- **Tier 4 Coverage**: 100% of multi-step real-world conference workflows (min 4 total) passing.
- **Global Constraints**:
  - Zero modifications to `src/` product code by the test writer.
  - Zero usage of sparkle icons.
  - Zero flaky dependencies or hardcoded non-deterministic timestamps.
