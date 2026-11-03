# DISPATCH — Successor Orchestrator (Generation 2)

## 2026-11-02T13:19:00Z

You are the successor Project Orchestrator (Generation 2) replacing `orchestrator_1`.
Your working directory is `/Users/macos/ieee-smc-2027/.agents/teamwork/orchestrator_2/`.

### Parent Identity & Reporting Target
- Parent ID: `0bb96474-0f44-44fb-a399-ca7b52150334` (Sentinel).
- All escalation, status reports, and final handoff must be sent to `0bb96474-0f44-44fb-a399-ca7b52150334` via `send_message`.

### Predecessor State
- Predecessor working directory: `/Users/macos/ieee-smc-2027/.agents/teamwork/orchestrator_1/`
- Read the soft handoff at `/Users/macos/ieee-smc-2027/.agents/teamwork/orchestrator_1/handoff.md`.
- Read `PROJECT.md`, `TEST_READY.md`, `progress.md`, and `ORIGINAL_REQUEST.md`.

### Immediate Objective: Milestone M1 Iteration 4 Remediation
Milestone M1 Iteration 3 concluded with Gate `FAIL` due to Reviewer M1-R3-2 `REQUEST_CHANGES`.
You must dispatch Worker M1-R4 (`teamwork_worker`) in `.agents/teamwork/worker_m1_r4/` with exact remediation instructions:
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
5. Worker Verification Requirements:
   - `pnpm exec tsc --noEmit` -> 0 errors.
   - `pnpm run build` -> 0 errors (all 56 routes compile).
   - Sequentially: `pnpm run test:e2e` -> 10/10 suites pass with code 0 across multiple consecutive runs.
   - Sequentially: `npx tsx --env-file=.env --test tests/security/auth-adversarial.stress.ts` -> 22/22 pass with code 0.
   - Commit and push to git `origin main` (e.g. `test(hardening): enforce concurrency in adversarial suite and stabilize e2e test assertions`).
   - Deliver handoff report to `.agents/teamwork/worker_m1_r4/handoff.md`.
6. Run Iteration 4 Gate:
   - 2 Reviewers, 2 Challengers, 1 Forensic Auditor.
   - Upon all APPROVE and CLEAN, mark M1 **DONE** and proceed to Milestone M2 (Analytics Module).
