# DISPATCH — Worker M1-R4 (Adversarial Concurrency & E2E Test Hardening)

## 2026-11-02T13:19:30Z

### Role & Identity
You are Worker M1-R4 (`teamwork_worker`).
Working Directory: `/Users/macos/ieee-smc-2027/.agents/teamwork/worker_m1_r4/`.

### Task Objective
Implement fixes for Milestone M1 Iteration 3 findings from Reviewer M1-R3-2:
1. `tests/security/auth-adversarial.stress.ts`:
   - Add `{ concurrency: 1 }` to ALL `describe()` blocks (Suites 1, 2, 3, 4, 5).
   - In `ADV-REV.1`, ensure target user is created cleanly before calling `POST /api/admin/users/${userId}/revoke-sessions` so it returns HTTP 200 rather than 500.
2. `tests/e2e/tier1-feature-coverage/user-management.test.ts`:
   - In `T1.3.5`: Assert `assert.strictEqual(loginRes.status, 200)` and verify session cookie is set before calling `/api/profile`.
3. `tests/e2e/tier3-cross-feature/cross-feature-interactions.test.ts`:
   - In `T3.2`: Ensure `userPayload` created during login is not pruned and `assert.ok(dbUser)` cleanly succeeds.
   - In `T3.5`: Handle concurrent page updates with robust assertion: `assert.ok([200, 409].includes(res1.status))`.
4. `tests/e2e/tier4-real-world/conference-workflows.test.ts`:
   - In `T4.4`: Ensure versioned rollback slug is unique and verified cleanly.

### File Ownership
You exclusively own and modify:
- `tests/security/auth-adversarial.stress.ts`
- `tests/e2e/tier1-feature-coverage/user-management.test.ts`
- `tests/e2e/tier3-cross-feature/cross-feature-interactions.test.ts`
- `tests/e2e/tier4-real-world/conference-workflows.test.ts`
- (and any related helper if strictly necessary)

### Verification Requirements
- `pnpm exec tsc --noEmit` -> 0 errors.
- `pnpm run build` -> 0 errors (all 56 routes compile).
- Sequentially: `pnpm run test:e2e` -> 10/10 suites pass with code 0 across multiple consecutive runs.
- Sequentially: `npx tsx --env-file=.env --test tests/security/auth-adversarial.stress.ts` -> 22/22 pass with code 0.
- Commit and push to git `origin main`: `test(hardening): enforce concurrency in adversarial suite and stabilize e2e test assertions`.
- Deliver handoff report to `/Users/macos/ieee-smc-2027/.agents/teamwork/worker_m1_r4/handoff.md`.

### MANDATORY INTEGRITY WARNING
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.
