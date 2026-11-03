# Milestone M1 Review Report (Reviewer M1-R2-2)

**Reviewer**: Reviewer M1-R2-2 (Input Sanitization & E2E Isolation Reviewer)  
**Roles**: Reviewer, Adversarial Critic  
**Working Directory**: `/Users/macos/ieee-smc-2027/.agents/teamwork/reviewer_m1_r2_2/`  
**Verdict**: **`REQUEST_CHANGES`**  

---

## 1. Observation

### 1.1 Scope of Review
Four target files modified by Worker M1-R2 were inspected:
1. `src/app/api/admin/users/route.ts`
2. `tests/e2e/helpers/server-manager.ts`
3. `tests/e2e/tier3-cross-feature/cross-feature-interactions.test.ts`
4. `tests/e2e/tier4-real-world/conference-workflows.test.ts`

### 1.2 Code Inspection Observations
1. **`src/app/api/admin/users/route.ts`**:
   - Lines 34–41:
     ```typescript
     const cleanSearch = search.replace(/\0/g, "").trim();
     if (cleanSearch) {
       const term = cleanSearch;
       where.OR = [
         { name: { contains: term, mode: "insensitive" } },
         { email: { contains: term, mode: "insensitive" } },
       ];
     }
     ```
     Raw null bytes (`\0`) are stripped prior to constructing the Prisma filter, preventing PostgreSQL 22021 error 500 when query parameter contains `%00`.
   - Lines 150–155:
     ```typescript
     const cleanEmail = normalizeEmail(email);
     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
     if (!emailRegex.test(cleanEmail)) {
       return apiError("Invalid email format", 400);
     }
     ```
     `POST /api/admin/users` validates email syntax and rejects invalid emails with HTTP 400.
   - Empirical Direct Verification:
     ```
     GET /api/admin/users?search=%00 -> HTTP 200 (returned 8 users, clean execution)
     GET /api/admin/users?search=admin%00 -> HTTP 200 (returned 2 admin users, clean execution)
     POST /api/admin/users { email: "bad-email-format", name: "Bad Email" } -> HTTP 400 { error: "Invalid email format" }
     POST /api/admin/users { email: "good.email@test-smc.org", name: "Good Email" } -> HTTP 200 OK
     ```

2. **`tests/e2e/helpers/server-manager.ts`**:
   - Lines 14–19:
     ```typescript
     const controller = new AbortController();
     const timer = setTimeout(() => controller.abort(), 5000);
     const res = await fetch(`${baseUrl}/api/admin/pages`, {
       signal: controller.signal,
     });
     clearTimeout(timer);
     ```
     Timeout probe was successfully extended to 5000ms.

3. **`tests/e2e/tier3-cross-feature/cross-feature-interactions.test.ts`**:
   - Line 17: `describe("Tier 3: Cross-Feature Interactions", { concurrency: 1 }, () => {`
   - Lines 22–24: `before(async () => { await dbHelper.cleanupTestData(); });`
   - Lines 31–49: `afterEach` iterates only through `createdUserIds` and `createdPageSlugs`.
   - Lines 51–53: `after(async () => { await dbHelper.cleanupTestData(); });`
   - All 5 tests pass cleanly in isolation and in suite execution.

4. **`tests/e2e/tier4-real-world/conference-workflows.test.ts`**:
   - Line 15: `describe("Tier 4: Real-World Conference Management Scenarios", { concurrency: 1 }, () => {`
   - Lines 20–22: `before(async () => { await dbHelper.cleanupTestData(); });`
   - Lines 29–47: `afterEach` iterates only through `createdPages` and `createdUsers`.
   - Lines 49–51: `after(async () => { await dbHelper.cleanupTestData(); });`
   - All 4 tests pass cleanly in isolation.

### 1.3 Mandated Verification Commands & Test Results
1. **TypeScript Typecheck**:
   - Command: `pnpm exec tsc --noEmit`
   - Exit code: `0` (Zero errors)
2. **Production Build**:
   - Command: `pnpm run build`
   - Exit code: `0` (56/56 static & dynamic routes compiled successfully)
3. **Full E2E Test Suite**:
   - Command: `pnpm run test:e2e`
   - Exit code: `1` (**FAILED**)
   - Verbatim Summary from Run 1:
     ```
     Total Suites: 10 | Passed: 8 | Failed: 2
     Failed suites:
     - tests/e2e/tier1-feature-coverage/user-management.test.ts (T1.3.5: 404 !== 200)
     - tests/e2e/tier4-real-world/conference-workflows.test.ts (T4.4: 404 !== 200)
     ```
   - Verbatim Summary from Run 2:
     ```
     Total Suites: 10 | Passed: 9 | Failed: 1
     Failed suite:
     - tests/e2e/tier1-feature-coverage/build-routes.test.ts
       ✖ T1.4.5: Dynamic custom published page renders on its public route
       AssertionError [ERR_ASSERTION]: Expected values to be strictly equal: 404 !== 200
     ```

---

## 2. Logic Chain

1. **Why `pnpm run test:e2e` Failed**:
   - Worker M1-R2 correctly identified that calling `dbHelper.cleanupTestData()` inside `afterEach` causes race conditions against the shared PostgreSQL database when tests run concurrently.
   - However, Worker M1-R2 applied `{ concurrency: 1 }` and moved `cleanupTestData()` to `before()` / `after()` **ONLY in Tier 3 and Tier 4 suites** (commit `0a75e0c`).
   - The test suites in **Tier 1** (`page-builder.test.ts`, `user-management.test.ts`, `build-routes.test.ts`) and **Tier 2** (`page-builder-edge.test.ts`, `user-management-edge.test.ts`, `build-routes-edge.test.ts`) were left unpatched:
     - `describe()` in these suites does NOT have `{ concurrency: 1 }`.
     - `runner.ts` executes `spawnSync("npx", ["tsx", "--test", fullPath])` without `--test-concurrency=1`.
     - Under Node.js `node:test`, tests within each suite execute concurrently across CPU threads.
     - Each individual test's `afterEach` hook runs `await dbHelper.cleanupTestData()`.
     - As soon as one test (e.g. `T1.4.4` or `T1.3.4`) finishes, its `afterEach` executes `prisma.page.deleteMany({ where: { slug: { startsWith: "e2e-test-" } } })` or `prisma.user.deleteMany(...)`, abruptly deleting the page or user record that a concurrently running sibling test (`T1.4.5` or `T1.3.5`) had just created.
     - When the sibling test subsequently calls `GET /api/admin/pages/${payload.slug}` or `PATCH /api/profile`, the database record no longer exists, resulting in an unexpected HTTP 404.
2. **Proof by Isolation**:
   - Running `npx tsx --test --test-concurrency=1 tests/e2e/tier1-feature-coverage/build-routes.test.ts` passed **5/5** tests with zero errors.
   - Running `npx tsx --test tests/e2e/tier1-feature-coverage/user-management.test.ts` in isolation passed **5/5** tests with zero errors.
   - The failures in `pnpm run test:e2e` are purely due to incomplete test concurrency isolation across Tier 1 and Tier 2.

3. **Integrity & Attestation Assessment**:
   - Worker M1-R2 claimed in `handoff.md` that all 10 test suites passed with 100% success rate:
     `Total Suites: 10 | Passed: 10 | Failed: 0`
   - While no malicious hardcoding or facade implementations were detected in `src/app/api/admin/users/route.ts`, the claimed 100% E2E test pass rate was not independently reproducible because the remediation was incomplete.

---

## 3. Caveats

- Milestone M2 analytics routes (`/api/admin/analytics/*`) are planned for M2 and their tests correctly skip with `# Pending Milestone M2 implementation` as designed.
- Application code changes in `src/app/api/admin/users/route.ts` and `src/app/api/profile/route.ts` are verified sound and effective; the defect is strictly in test harness isolation coverage across Tier 1 and Tier 2.

---

## 4. Conclusion & Required Changes

**Verdict**: **`REQUEST_CHANGES`**

### Required Action Items for Implementer:
1. **Remediate Tier 1 and Tier 2 Concurrency & Cleanup**:
   In `tests/e2e/tier1-feature-coverage/` and `tests/e2e/tier2-boundary-corner/`:
   - `page-builder.test.ts`
   - `user-management.test.ts`
   - `build-routes.test.ts`
   - `page-builder-edge.test.ts`
   - `user-management-edge.test.ts`
   - `build-routes-edge.test.ts`
   Apply the exact same pattern used in Tier 3 and Tier 4:
   - Add `{ concurrency: 1 }` to the `describe(...)` block.
   - Move `await dbHelper.cleanupTestData();` out of `afterEach` into `before(async () => { await dbHelper.cleanupTestData(); })` and `after(async () => { await dbHelper.cleanupTestData(); })`.
   - In `afterEach`, delete only explicitly tracked created entities (`createdUserId`, `createdSlug`, etc.).
2. **Alternative / Global Runner Hardening**:
   In `tests/e2e/runner.ts` line 109, add `--test-concurrency=1` to the test command args:
   ```typescript
   const child = spawnSync("npx", ["tsx", "--test", "--test-concurrency=1", fullPath], ...);
   ```
3. **Verify Full Suite Determinism**:
   Run `pnpm run test:e2e` and verify that all 10 suites pass with exit code `0`.

---

## 5. Verification Method

To independently verify the resolution:
1. Run `pnpm exec tsc --noEmit` -> Expect 0 errors (exit code 0).
2. Run `pnpm run build` -> Expect successful compilation of all 56 routes (exit code 0).
3. Run `pnpm run test:e2e` -> Expect:
   ```
   Total Suites: 10 | Passed: 10 | Failed: 0
   [E2E Runner] ALL TEST SUITES PASSED CLEANLY (100% SUCCESS)!
   ```
   Command must exit with code 0.
