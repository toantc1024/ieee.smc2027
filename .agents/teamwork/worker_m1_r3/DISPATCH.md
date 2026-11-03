# Dispatch Assignment: Worker M1-R3 (Test Concurrency & Isolation Hardening)

## Target Objective
Fix the test concurrency race conditions and cleanup collisions across Tier 1 and Tier 2 E2E test suites, and harden the test runner so that `pnpm run test:e2e` executes 100% deterministically with exit code 0 across all 10 suites.

## Reviewer M1-R2-2 Findings
Reviewer M1-R2-2 found:
1. `tests/e2e/runner.ts`: Line 109 executes `spawnSync("npx", ["tsx", "--test", fullPath], ...)` without `--test-concurrency=1`.
2. Tier 1 suites (`page-builder.test.ts`, `user-management.test.ts`, `build-routes.test.ts`) and Tier 2 suites (`page-builder-edge.test.ts`, `user-management-edge.test.ts`, `build-routes-edge.test.ts`) run subtests concurrently without `{ concurrency: 1 }`, and call global `await dbHelper.cleanupTestData()` in `afterEach`.
3. When sibling subtests execute concurrently, one test finishing wipes out the users or pages created by another test mid-flight, causing random HTTP 404 test failures.

## Action Items
1. In `tests/e2e/runner.ts`:
   Add `--test-concurrency=1` to the `spawnSync` invocation on line 109:
   ```typescript
   const child = spawnSync("npx", ["tsx", "--test", "--test-concurrency=1", fullPath], { ... });
   ```
2. In the 6 Tier 1 and Tier 2 test suites:
   - `tests/e2e/tier1-feature-coverage/page-builder.test.ts`
   - `tests/e2e/tier1-feature-coverage/user-management.test.ts`
   - `tests/e2e/tier1-feature-coverage/build-routes.test.ts`
   - `tests/e2e/tier2-boundary-corner/page-builder-edge.test.ts`
   - `tests/e2e/tier2-boundary-corner/user-management-edge.test.ts`
   - `tests/e2e/tier2-boundary-corner/build-routes-edge.test.ts`
   Apply the exact same pattern already proven in Tier 3 and Tier 4:
   - Add `{ concurrency: 1 }` to the top-level `describe()` block.
   - Move `await dbHelper.cleanupTestData();` out of `afterEach` into `before()` and `after()`.
   - In `afterEach`, delete only explicitly tracked created entities (e.g. `createdUserId`, `createdSlug`, etc.) if needed, or rely on `before()` and `after()` cleanup.
3. Verify:
   - Run `pnpm exec tsc --noEmit` -> 0 errors.
   - Run `pnpm run build` -> 0 errors (all 56 routes compile).
   - Run `pnpm run test:e2e` -> all 10 suites pass cleanly (exit code 0).
   - Run `node --env-file=.env npx tsx --test tests/security/auth-adversarial.stress.ts` -> 22/22 tests pass.
4. Commit & Push:
   - Commit changes to git and push to `origin main` with a clear commit message, e.g.:
     `test(e2e): enforce strict concurrency and isolate database cleanup across Tier 1 and 2 suites`
5. Report:
   - Deliver handoff report to `.agents/teamwork/worker_m1_r3/handoff.md`.
