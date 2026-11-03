## 2026-11-02T11:16:24Z
You are Worker M1-R2 (Milestone M1 Hardening & Remediation Worker).
Your working directory is: /Users/macos/ieee-smc-2027/.agents/teamwork/worker_m1_r2/
You must update your progress.md regularly with timestamps.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

MANDATORY FIRST STEP: Read /Users/macos/ieee-smc-2027/.agents/teamwork/ORIGINAL_REQUEST.md.
Also read PROJECT.md: /Users/macos/ieee-smc-2027/PROJECT.md.
Also read skill: /Users/macos/ieee-smc-2027/.agents/skills/ieee-smc-security/SKILL.md.

Read the 3 Explorer handoff reports containing the exact line-by-line diffs:
1. /Users/macos/ieee-smc-2027/.agents/teamwork/explorer_m1_r2_1/handoff.md (Auth & User Security Guards)
2. /Users/macos/ieee-smc-2027/.agents/teamwork/explorer_m1_r2_2/handoff.md (Null-Byte Sanitization & Email Regex)
3. /Users/macos/ieee-smc-2027/.agents/teamwork/explorer_m1_r2_3/handoff.md (Test Suite Concurrency & E2E Isolation)

Exclusive file write ownership:
- src/app/api/admin/users/[id]/route.ts
- src/app/api/profile/route.ts
- src/app/api/admin/users/route.ts
- tests/security/auth-adversarial.stress.ts
- tests/e2e/tier3-cross-feature/cross-feature-interactions.test.ts
- tests/e2e/tier4-real-world/conference-workflows.test.ts
- tests/e2e/helpers/server-manager.ts

Your task:
Apply all recommended code diffs from the 3 Explorer handoff reports:
1. In `src/app/api/admin/users/[id]/route.ts`:
   - Normalize role (`Role.ADMIN | Role.USER`) and status (`toUpperCase()`) before guards.
   - Safety Guard 1: reject downgrading own active admin account (`normalizedRole !== Role.ADMIN`).
   - Safety Guard 2: reject deactivating (`normalizedStatus && normalizedStatus !== "ACTIVE"`) or blocking self account.
   - Safety Guard 3: check `targetUser.role === Role.ADMIN && targetUser.status === "ACTIVE" && (normalizedRole === Role.USER || (normalizedStatus && normalizedStatus !== "ACTIVE"))`, counting active admins (`where: { role: Role.ADMIN, status: "ACTIVE" }`) and rejecting with 400 if `<= 1`.
   - In user update, bump `sessionVersion: { increment: 1 }` whenever `normalizedStatus && normalizedStatus !== "ACTIVE"`.
   - In DELETE Safety Guard 2: count active admins (`where: { role: Role.ADMIN, status: "ACTIVE" }`) and reject with 400 if `<= 1`.
   - In email update, validate format using `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` returning 400 if invalid.
2. In `src/app/api/profile/route.ts`:
   - When `updatedPasswordHash` is set, increment `sessionVersion: { increment: 1 }`.
   - Issue updated session token via `createSessionToken` containing the incremented `sessionVersion` and attach cookie via `attachSessionCookie(response, newSessionToken)` so the current user remains logged in while all other concurrent sessions are invalidated.
3. In `src/app/api/admin/users/route.ts`:
   - Sanitize search input against null bytes: `const cleanSearch = search.replace(/\0/g, "").trim();` before checking `if (cleanSearch)`.
   - Add email format regex validation in `POST /api/admin/users`: check `/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)` and return `apiError("Invalid email format", 400)`.
4. In `tests/security/auth-adversarial.stress.ts`:
   - Update tests `ADV-SELF.4`, `ADV-SELF.5`, `ADV-LAST.2`, `ADV-LAST.3`, `ADV-PROF.4` to assert that defenses enforce HTTP 400 rejections and session version bumps as documented in `explorer_m1_r2_1/handoff.md`.
5. In `tests/e2e/tier3-cross-feature/cross-feature-interactions.test.ts` & `tests/e2e/tier4-real-world/conference-workflows.test.ts`:
   - Add `{ concurrency: 1 }` to `describe()`.
   - Move global `dbHelper.cleanupTestData()` to `before()` and `after()`.
   - In `afterEach`, delete only explicitly tracked created user IDs and page slugs.
6. In `tests/e2e/helpers/server-manager.ts`:
   - Increase `isServerRunning` probe timeout from 2000ms to 5000ms.

Verification steps (Worker MUST execute all commands):
1. `pnpm exec tsc --noEmit` -> 0 errors.
2. `pnpm run build` -> 0 errors, all 56 routes compiled cleanly.
3. `node --env-file=.env npx tsx --test tests/security/auth-adversarial.stress.ts` -> all tests pass.
4. `pnpm run test:e2e` -> all 10 suites pass cleanly with exit code 0.

Git requirement:
- Commit each atomic or large change with descriptive message and push to `origin main`.

User constraints:
- Never use sparkle icon
- Do not make too much text or english as sub in () bracelet, no need
- For each atom change or big change make a commit and push

## 2026-11-02T11:27:23Z
**Context**: Milestone M1-R2 Hardening & Remediation
**Content**: Status check on implementation and verification progress. Please update your `progress.md` with current completed steps and provide an estimated ETA.
**Action**: Continue implementation, run tests (`tsc`, `pnpm run build`, `tests/security/auth-adversarial.stress.ts`, `pnpm run test:e2e`), commit and push, and deliver `handoff.md`.
