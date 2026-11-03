# Handoff Report: User Management Auth Tracking & API Handlers Spec Miner (M1-1)

## 1. Observation
1. **Prisma User Model State** (`prisma/schema.prisma:21-43`):
   The schema already defines:
   ```prisma
   model User {
     id              String         @id @default(uuid())
     email           String         @unique
     name            String
     avatar          String?
     role            Role           @default(USER)
     provider        String         @default("google")
     passwordHash    String?        @map("password_hash")
     profileData     Json           @default("{}") @map("profile_data")
     status          String         @default("ACTIVE")
     lastLoginAt     DateTime?      @map("last_login_at")
     lastLoginIp     String?        @map("last_login_ip")
     lastLoginDevice String?        @map("last_login_device")
     sessionVersion  Int            @default(1) @map("session_version")
     posts           Post[]
     registrations   Registration[]
     mediaFiles      MediaFile[]
     createdAt       DateTime       @default(now()) @map("created_at")
     updatedAt       DateTime       @updatedAt @map("updated_at")

     @@index([status])
     @@map("users")
   }
   ```
   All required tracking fields (`status`, `lastLoginAt`, `lastLoginIp`, `lastLoginDevice`, `sessionVersion`) are mapped and available in the PostgreSQL schema.

2. **Session Revocation Bug in `getCurrentUser()`** (`src/lib/auth.ts:185-215`):
   ```typescript
   194: const dbUser = await prisma.user.findUnique({
   195:   where: { email: normalizeEmail(sessionUser.email) },
   196: });
   197: 
   198: if (!dbUser) return sessionUser;
   ```
   At line 198, if `dbUser` is null (the account has been deleted by an administrator), `getCurrentUser()` returns `sessionUser` from the decoded JWT. A deleted user continues to access authenticated endpoints until JWT expiration.
   Furthermore, `createSessionToken` does not embed `sessionVersion`, `verifySessionToken` does not verify `sessionVersion`, and `getCurrentUser` does not check if `dbUser.status === "BLOCKED"` or `sessionUser.sessionVersion !== dbUser.sessionVersion`.

3. **Absence of Login Tracking in Auth Routes**:
   - `src/app/api/auth/login-password/route.ts:15-118`: Authenticates via password and returns JWT cookie, but does not extract `x-forwarded-for` or `user-agent`, and never updates `lastLoginAt`, `lastLoginIp`, or `lastLoginDevice`.
   - `src/app/api/auth/otp/verify/route.ts:12-44`: Verifies OTP and logs user in, but lacks IP/device extraction and `recordLogin`.
   - `src/app/api/auth/callback/google/route.ts:11-91`: Exchanges Google OAuth authorization code and creates session, but omits IP/device extraction and `recordLogin`.

4. **Incomplete User Administration Endpoints**:
   - `src/app/api/admin/users/route.ts:13-46`: `GET` only executes `findMany({ orderBy: { createdAt: "asc" } })` without search filter, status filter, role filter, or pagination metadata (`total`, `page`, `limit`, `totalPages`), omitting `status`, `lastLoginAt`, `lastLoginIp`, and `lastLoginDevice` in the response projection.
   - `src/app/api/admin/users/[id]/route.ts`: Only implements `PATCH` and `DELETE`. The `GET` method is missing entirely (`405 Method Not Allowed`).
   - Missing sub-routes:
     - `src/app/api/admin/users/[id]/reset-password/route.ts` does not exist.
     - `src/app/api/admin/users/[id]/revoke-sessions/route.ts` does not exist.

5. **Profile Route Gaps** (`src/app/api/profile/route.ts:5-106`):
   - `GET`: Select projection omits `status`, `lastLoginAt`, `lastLoginIp`, and `lastLoginDevice`.
   - `PATCH`: Only extracts `{ name, avatar, profileData }`. Top-level academic fields passed in requests (e.g., `{ name, bio, affiliation }` in E2E tests `T1.3.5`) are not automatically merged into `profileData`. Does not support self-service password update with current password verification.

---

## 2. Logic Chain
1. From Observation 2, because `if (!dbUser) return sessionUser;` was executed, any deleted user retained full session privileges. Modifying this line to `if (!dbUser) return null;` immediately revokes sessions for deleted users upon their next request.
2. From Observation 1 & 2, adding `sessionVersion` to the JWT payload (`createSessionToken`) and checking `if (sessionUser.sessionVersion !== undefined && dbUser.sessionVersion !== sessionUser.sessionVersion) return null;` provides an immediate session revocation mechanism when `sessionVersion` is incremented.
3. From Observation 3, implementing `extractClientInfo(request)` (resolving `x-forwarded-for` first IP, then `x-real-ip`, Cloudflare, and fallbacks) and calling `recordLogin(userId, ip, device)` in `login-password`, `otp/verify`, and `callback/google` guarantees that `lastLoginAt`, `lastLoginIp`, and `lastLoginDevice` are recorded on every authentication vector.
4. From Observation 4, adding `GET` to `/api/admin/users/[id]` satisfies E2E test `T1.3.2` and the User Inspection page requirement. Adding `reset-password` and `revoke-sessions` sub-routes satisfies admin control parity with the HCMUTE reference.
5. From Observation 5, enhancing `src/app/api/profile/route.ts` to accept top-level profile attributes (`affiliation`, `title`, `country`, `bio`, `academicInfo`, `conferenceRole`) and merge them into `profileData` satisfies E2E test `T1.3.5` and the personal info form contract.

---

## 3. Caveats
1. **Multi-Proxy Header Trust**: `x-forwarded-for` contains a comma-separated list of IPs when passing through multiple proxies. The first entry is the client IP provided by the ingress proxy. In self-hosted or Docker setups without a reverse proxy, the direct socket remote address or `127.0.0.1` is used as fallback.
2. **Cookie Clearing in Server Components**: Next.js App Router prevents mutating cookies (`cookies().delete()`) during Server Component render phases. Therefore, `getCurrentUser()` simply returns `null` to deny access. The client or API route handlers handle redirecting to `/admin/login` or `/portal`.
3. **No Sparkle Icons & No Parentheses Subtitles**: Per user global rules, the proposed implementations contain zero sparkle icons and no unnecessary English parenthetical subtitles in error messages or responses.

---

## 4. Conclusion
The technical specifications, type signatures, and concrete route implementations have been designed and documented in:
- `/Users/macos/ieee-smc-2027/.agents/teamwork/explorer_m1_1/proposed_auth_api.ts`
- `/Users/macos/ieee-smc-2027/.agents/teamwork/explorer_m1_1/auth_api.patch`

Key deliverable specs:
1. `recordLogin(userId, ip, device)` and `extractClientInfo(request)` in `src/lib/auth.ts`.
2. Immediate session termination in `getCurrentUser()` upon user deletion, blocking (`status === "BLOCKED"`), or session version bump (`sessionVersion`).
3. Client IP and device tracking wired into:
   - `src/app/api/auth/login-password/route.ts`
   - `src/app/api/auth/otp/verify/route.ts`
   - `src/app/api/auth/callback/google/route.ts`
4. Paginated, searchable, status-filtered `src/app/api/admin/users/route.ts`.
5. Full inspection `GET`, guarded `PATCH` (self-demote & last-admin protected), and guarded `DELETE` in `src/app/api/admin/users/[id]/route.ts`.
6. Password reset with optional temporary password generation in `src/app/api/admin/users/[id]/reset-password/route.ts`.
7. Session revocation in `src/app/api/admin/users/[id]/revoke-sessions/route.ts`.
8. Enhanced self-profile management in `src/app/api/profile/route.ts`.

---

## 5. Verification Method
1. **Automated E2E Test Verification**:
   Run the project E2E test runner:
   ```bash
   pnpm test:e2e
   # or direct execution:
   npx tsx tests/e2e/runner.ts
   ```
   Specific test suites verifying these endpoints:
   - `tests/e2e/tier1-feature-coverage/user-management.test.ts` (T1.3.1 - T1.3.5)
   - `tests/e2e/tier2-boundary-corner/user-management-edge.test.ts` (T2.3.1 - T2.3.5)
   - `tests/e2e/tier3-cross-feature/cross-feature-interactions.test.ts` (T3.1, T3.2, T3.4)

2. **Manual / Curl Invalidation Tests**:
   - **Login Tracking Test**:
     ```bash
     curl -X POST http://localhost:3000/api/auth/login-password \
       -H "Content-Type: application/json" \
       -H "X-Forwarded-For: 203.0.113.195" \
       -H "User-Agent: SMC-Test-Device" \
       -d '{"email":"admin@hcmute.edu.vn","password":"Admin@Smc2027Secure!"}'
     ```
     Verify in database that `last_login_ip = '203.0.113.195'` and `last_login_device = 'SMC-Test-Device'`.
   - **User Deletion Revocation Test**:
     Issue token for a test user -> delete user in DB -> call `/api/auth/me` with cookie -> must return `{ "user": null }`.
   - **Session Revocation Test**:
     Call `POST /api/admin/users/[id]/revoke-sessions` -> previous cookie must return `{ "user": null }` or `401 Unauthorized`.
