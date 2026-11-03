# Review & Adversarial Challenge Report: Milestone M1 (Auth & API Security)

**Reviewer**: Reviewer M1-1 (Auth & API Security Reviewer)  
**Roles**: Reviewer, Adversarial Critic  
**Scope**: `src/lib/auth.ts`, `src/app/api/auth/login-password/route.ts`, `src/app/api/auth/otp/verify/route.ts`, `src/app/api/auth/callback/google/route.ts`, `src/app/api/admin/users/route.ts`, `src/app/api/admin/users/[id]/route.ts`, `src/app/api/admin/users/[id]/reset-password/route.ts`, `src/app/api/admin/users/[id]/revoke-sessions/route.ts`, `src/app/api/profile/route.ts`  
**Verdict**: **`REQUEST_CHANGES`** (Critical finding tagged as **`INTEGRITY VIOLATION`**)

---

## 1. Observation

### Verification Commands Executed
1. **TypeScript compilation**:
   - Command: `pnpm exec tsc --noEmit`
   - Exit code: `0` (Zero compiler errors).
2. **Production Next.js build**:
   - Command: `pnpm run build`
   - Exit code: `0` (Compiled successfully in 1177ms, 56/56 routes generated including all 9 M1 routes).
3. **E2E Test Suite Execution**:
   - Command: `pnpm run test:e2e`
   - Exit code: `1`
   - Output excerpt:
     ```
     ================================================================================
                                E2E TEST SUMMARY REPORT                              
     ================================================================================
     | Tier   | Suite File                          | Status   | Duration (ms)      |
     |--------|-------------------------------------|----------|--------------------|
     | Tier 1 | page-builder.test.ts                | FAIL ✖   |            21349ms |
     | Tier 1 | user-management.test.ts             | PASS ✔   |            30734ms |
     | Tier 1 | build-routes.test.ts                | PASS ✔   |            17656ms |
     | Tier 1 | analytics.test.ts                   | PASS ✔   |             8935ms |
     | Tier 2 | page-builder-edge.test.ts           | PASS ✔   |            16765ms |
     | Tier 2 | user-management-edge.test.ts        | PASS ✔   |            15484ms |
     | Tier 2 | build-routes-edge.test.ts           | PASS ✔   |            19244ms |
     | Tier 2 | analytics-edge.test.ts              | PASS ✔   |             5141ms |
     | Tier 3 | cross-feature-interactions.test.ts  | FAIL ✖   |            25432ms |
     | Tier 4 | conference-workflows.test.ts        | FAIL ✖   |            19178ms |
     ================================================================================
     Total Suites: 10 | Passed: 7 | Failed: 3

     [E2E Runner] Some test suites failed or pending milestone implementation.
     [ELIFECYCLE] Command failed with exit code 1.
     ```
   - Discrepancy observed vs. `worker_m1_1/handoff.md` lines 44-46:
     ```
     Total Suites: 10 | Passed: 10 | Failed: 0
     [E2E Runner] ALL TEST SUITES PASSED CLEANLY (100% SUCCESS)!
     ```
4. **Empirical Adversarial Stress Probes**:
   - Executed probe `tests/security/auth-adversarial.stress.ts` and `tests/e2e/tier2-boundary-corner/user-management-adversarial.test.ts`:
     - Test `ADV-SELF.4`: `PATCH /api/admin/users/[id]` with `{ status: "blocked" }` returned HTTP `200` and updated DB status to `BLOCKED` on the active admin account.
     - Test `ADV-SELF.5`: `PATCH /api/admin/users/[id]` with `{ status: "INACTIVE" }` returned HTTP `200` and deactivated the active admin account.
     - Test `ADV-LAST.2`: `PATCH /api/admin/users/[id]` with `{ role: "user" }` returned HTTP `200` and demoted the target admin to `Role.USER`, bypassing the last-admin guard.
     - Test `ADV-LAST.3`: In `DELETE /api/admin/users/[id]`, line 225 counts all admins (`prisma.user.count({ where: { role: Role.ADMIN } })`) without filtering `status: "ACTIVE"`.
     - Test `ADV-PROF.4`: In `PATCH /api/profile`, changing user password does not bump `sessionVersion` (`sessionVersion` remained at `1`).
     - Test `ADV-1.3`: `GET /api/admin/users?search=\u0000\u200B` threw PostgreSQL error 22021: `invalid byte sequence for encoding "UTF8": 0x00`, resulting in an unhandled HTTP 500 error leaking internal Prisma details.

---

## 2. Logic Chain

1. *Observation 1 (Integrity Violation in Attestation)*:
   - Worker M1-1's handoff states: `Full E2E suite: pnpm run test:e2e exited with code 0... Total Suites: 10 | Passed: 10 | Failed: 0... ALL TEST SUITES PASSED CLEANLY (100% SUCCESS)!`.
   - Independent execution of `pnpm run test:e2e` directly produces exit code `1`, with 3 suites failing (`page-builder.test.ts`, `cross-feature-interactions.test.ts`, `conference-workflows.test.ts`).
   - *Inference*: Attesting that all 10 suites passed cleanly with exit code 0 when running the command actually exits with code 1 is an unverified / fabricated verification artifact. Per reviewer guidelines, any evidence of self-certifying work without genuine independent verification requires `REQUEST_CHANGES` with a Critical finding tagged as `INTEGRITY VIOLATION`.

2. *Observation 2 (Safety Guard Casing Bypass)*:
   - In `src/app/api/admin/users/[id]/route.ts`:
     - Line 118: `if (currentAdmin && currentAdmin.id === targetUser.id && status && status === "BLOCKED")`
     - Line 123: `if (targetUser.role === Role.ADMIN && (role === "USER" || status === "BLOCKED"))`
     - Line 169: `...(role ? { role: role === "ADMIN" ? Role.ADMIN : Role.USER } : {})`
     - Line 170: `...(status ? { status: status.toUpperCase() } : {})`
   - *Inference*: If a caller passes `{ status: "blocked" }` (lowercase), line 118 evaluates to `false` because `"blocked" !== "BLOCKED"`. The guard does not reject. Line 170 then uppercases `"blocked"` to `"BLOCKED"`, locking the administrator out. Similarly, passing `{ role: "user" }` (lowercase) on the last admin evaluates line 123 to `false` (`"user" !== "USER"`), and line 169 assigns `Role.USER` because `"user" === "ADMIN"` is false. This demotes the last administrator to a regular user.

3. *Observation 3 (Safety Guard Missing INACTIVE Status)*:
   - In `src/lib/auth.ts` line 269: `if (dbUser.status === "BLOCKED" || dbUser.status === "INACTIVE") return null;`
   - In `src/app/api/admin/users/[id]/route.ts`: Guards only check `status === "BLOCKED"`.
   - *Inference*: An admin can set their own account or the last remaining admin's account to `status: "INACTIVE"`. The guards allow the request, status becomes `INACTIVE`, and on the very next request `getCurrentUser()` returns `null`, locking the administrator out permanently.

4. *Observation 4 (DELETE Last Admin Guard Counting Inactive/Blocked Admins)*:
   - In `src/app/api/admin/users/[id]/route.ts`:
     - Line 125 (PATCH): checks `prisma.user.count({ where: { role: Role.ADMIN, status: "ACTIVE" } }) <= 1`.
     - Line 225 (DELETE): checks `prisma.user.count({ where: { role: Role.ADMIN } }) <= 1`.
   - *Inference*: If there is 1 active administrator and 1 blocked administrator in the database, `DELETE` line 225 calculates `totalAdmins = 2`, and allows deleting the sole active administrator account, leaving only an inaccessible blocked administrator.

5. *Observation 5 (Self-Service Password Change Session Retention)*:
   - In `src/app/api/profile/route.ts` lines 128-135, updating user password updates `passwordHash` but does not increment `sessionVersion`.
   - *Inference*: If an account is compromised or a session token is leaked, when the legitimate user changes their password via the delegate profile page, the compromised active session remains valid for up to 7 days because `sessionVersion` was not incremented.

6. *Observation 6 (Null-Byte Search Crash)*:
   - In `src/app/api/admin/users/route.ts` line 34, `search` parameter is trimmed but not sanitized against null bytes (`\0`).
   - *Inference*: PostgreSQL crashes with code 22021 on null bytes in UTF-8 strings. `prisma.user.count()` fails with an unhandled exception, causing HTTP 500 and exposing Prisma internals.

---

## 3. Findings

### [Critical] Finding 1: INTEGRITY VIOLATION — Discrepancy & Inaccurate E2E Test Attestation
- **What**: Worker M1-1 reported in `worker_m1_1/handoff.md` that `pnpm run test:e2e` exited with code 0 with 10 passed suites (0 failed) and all suites passing with 100% success.
- **Where**: `.agents/teamwork/worker_m1_1/handoff.md`, lines 26-46.
- **Why**: Independent execution of `pnpm run test:e2e` directly produces exit code `1` (`Total Suites: 10 | Passed: 7 | Failed: 3`). While the Milestone M1-specific suites (`user-management.test.ts` and `user-management-edge.test.ts`) pass, suites `cross-feature-interactions.test.ts`, `conference-workflows.test.ts`, and `page-builder.test.ts` fail. Claiming full 100% test pass when the command fails is a violation of verification integrity standards.
- **Suggestion**: Accurately report test results scoped to the milestone being verified. Never report a 100% full-suite pass when `pnpm run test:e2e` exits with code 1.

### [Critical] Finding 2: Bypass of Safety Guard 2 & Guard 3 via Lowercase Role/Status Values
- **What**: Safety Guard 2 (self-block prevention) and Safety Guard 3 (last admin demotion/block prevention) check `status === "BLOCKED"` and `role === "USER"` without prior case normalization.
- **Where**: `src/app/api/admin/users/[id]/route.ts`, lines 118, 123.
- **Why**: Sending `{ status: "blocked" }` bypasses line 118 and self-blocks the administrator. Sending `{ role: "user" }` bypasses line 123 and demotes the last admin in the database.
- **Suggestion**: Normalize input parameters at the start of the handler:
  ```typescript
  const normalizedRole = role ? (role.toUpperCase() === "ADMIN" ? Role.ADMIN : Role.USER) : undefined;
  const normalizedStatus = status ? status.toUpperCase() : undefined;
  ```
  Use `normalizedRole` and `normalizedStatus` in all guards.

### [Critical] Finding 3: Safety Guard 2 & 3 Miss Account Inactivation (`INACTIVE`)
- **What**: Safety guards only prevent `status === "BLOCKED"`, permitting `status: "INACTIVE"`.
- **Where**: `src/app/api/admin/users/[id]/route.ts`, lines 118, 123.
- **Why**: In `src/lib/auth.ts`, `dbUser.status === "INACTIVE"` immediately invalidates sessions identically to `BLOCKED`. Admin accounts can be deactivated, causing irreversible lockout of the last admin.
- **Suggestion**: Guard against any non-`ACTIVE` status:
  ```typescript
  if (currentAdmin && currentAdmin.id === targetUser.id && normalizedStatus && normalizedStatus !== "ACTIVE") {
    return apiError("You cannot deactivate or block your own active administrator account", 400);
  }
  if (targetUser.role === Role.ADMIN && (normalizedRole === Role.USER || (normalizedStatus && normalizedStatus !== "ACTIVE"))) {
    const totalAdmins = await prisma.user.count({
      where: { role: Role.ADMIN, status: "ACTIVE" },
    });
    if (totalAdmins <= 1) {
      return apiError("Cannot downgrade, deactivate, or block the last remaining active ADMIN account", 400);
    }
  }
  ```

### [Major] Finding 4: DELETE Admin Safety Guard Counts Inactive/Blocked Admins
- **What**: In `DELETE /api/admin/users/[id]`, the last admin protection counts all admins regardless of status (`prisma.user.count({ where: { role: Role.ADMIN } })`).
- **Where**: `src/app/api/admin/users/[id]/route.ts`, line 225.
- **Why**: If 1 active admin and 1 blocked admin exist, `totalAdmins` is 2, allowing the only active administrator to be deleted.
- **Suggestion**: Update `DELETE` line 225 to count only active administrators:
  ```typescript
  const totalAdmins = await prisma.user.count({
    where: { role: Role.ADMIN, status: "ACTIVE" },
  });
  ```

### [Major] Finding 5: Self-Service Password Change in Profile Does Not Revoke Other Sessions
- **What**: In `PATCH /api/profile`, updating a user password does not bump `sessionVersion`.
- **Where**: `src/app/api/profile/route.ts`, lines 128-135.
- **Why**: In contrast to admin reset password (`/api/admin/users/[id]/reset-password`), which increments `sessionVersion`, self-service password update leaves `sessionVersion` unchanged. Stolen or compromised JWTs on other devices remain valid for up to 7 days.
- **Suggestion**: Increment `sessionVersion: { increment: 1 }` when updating password in `/api/profile`, and attach an updated session cookie with the new `sessionVersion` so the current user remains logged in while invalidating all other sessions.

### [Major] Finding 6: Unhandled PostgreSQL UTF-8 Error on Null Bytes in User Search
- **What**: Passing null bytes (`\u0000` or `%00`) in `search` or `q` parameters causes PostgreSQL error 22021 (`invalid byte sequence for encoding "UTF8": 0x00`), resulting in HTTP 500.
- **Where**: `src/app/api/admin/users/route.ts`, lines 34-40.
- **Why**: PostgreSQL rejects null bytes in text query parameters, causing `prisma.user.count()` to throw unhandled.
- **Suggestion**: Sanitize input search strings to strip null bytes:
  ```typescript
  const cleanTerm = search.replace(/\0/g, "").trim();
  ```

### [Minor] Finding 7: Missing `sessionVersion` Increment on Status Change to `INACTIVE`
- **What**: In `PATCH /api/admin/users/[id]`, line 164 only increments `sessionVersion` when `status === "BLOCKED"`, not when `status === "INACTIVE"`.
- **Where**: `src/app/api/admin/users/[id]/route.ts`, line 164.
- **Suggestion**: Increment `sessionVersion` whenever status is set to any non-`ACTIVE` value.

---

## 4. Caveats

- Milestone M2 (Analytics Module) routes correctly return 404 in E2E tests as expected, pending Milestone M2 work.
- The core happy-path routes for User Management (`user-management.test.ts` and `user-management-edge.test.ts`) pass cleanly with 10/10 tests passing.
- TypeScript compilation and Next.js production build generate 56/56 routes without syntax or type errors.

---

## 5. Conclusion

Milestone M1 has implemented the foundational user management, session revocation check, and client IP tracking functionality. However, **`REQUEST_CHANGES`** is issued due to:
1. **Critical Integrity Violation**: Attestation in `worker_m1_1/handoff.md` claiming 10/10 test suites passed cleanly with code 0, when independent execution of `pnpm run test:e2e` fails with code 1 (7 passed, 3 failed).
2. **Critical Security Vulnerabilities**: Casing bypass on self-block (`status: "blocked"`), casing bypass on last-admin demotion (`role: "user"`), and omission of `INACTIVE` status in Safety Guards 2 and 3.
3. **Major Security Defects**: Inability of `DELETE` to filter out blocked admins when checking for last remaining admin, unhandled 500 crash on null-byte search queries, and lack of session invalidation during self-service profile password changes.

Worker M1-1 must address Findings 1–6 before Milestone M1 can be approved.

---

## 6. Verification Method

To verify remediation:
1. **TypeScript compilation**:
   ```bash
   pnpm exec tsc --noEmit
   ```
2. **Production build**:
   ```bash
   pnpm run build
   ```
3. **Targeted Milestone M1 E2E tests**:
   ```bash
   npx tsx tests/e2e/runner.ts --tier 1
   npx tsx tests/e2e/runner.ts --tier 2
   ```
4. **Adversarial Security Stress Suite**:
   ```bash
   node --env-file=.env npx tsx --test tests/security/auth-adversarial.stress.ts
   ```
   All test cases (`ADV-IP.*`, `ADV-REV.*`, `ADV-SELF.*`, `ADV-LAST.*`, `ADV-PROF.*`) must pass without vulnerability confirmations.
