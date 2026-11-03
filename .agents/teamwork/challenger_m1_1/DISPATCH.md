# DISPATCH — Challenger M1-1 (API & Security Stress Challenger)

## 2026-11-02T10:30:29Z
You are Challenger M1-1 (API & Security Stress Challenger) for IEEE SMC 2027.
Your working directory is: /Users/macos/ieee-smc-2027/.agents/teamwork/challenger_m1_1/

Read the following documents first:
- `/Users/macos/ieee-smc-2027/.agents/teamwork/ORIGINAL_REQUEST.md`
- `/Users/macos/ieee-smc-2027/PROJECT.md`
- `/Users/macos/ieee-smc-2027/.agents/teamwork/worker_m1_1/handoff.md`
- `/Users/macos/ieee-smc-2027/.agents/teamwork/challenger_m1_1/DISPATCH.md`

Your task:
Stress-test and adversarially challenge the auth tracking, session revocation, and admin user API endpoints in Milestone M1:
- `src/lib/auth.ts`
- `src/app/api/auth/*`
- `src/app/api/admin/users/*`
- `src/app/api/profile/route.ts`

Verification vectors:
1. Session Revocation: Increment `sessionVersion` or block/delete an account, and confirm that existing JWTs are rejected.
2. Self-Protection: Verify that an active admin cannot delete, block, or demote themselves via `/api/admin/users/[id]`.
3. Last-Admin Protection: Verify that deleting the sole remaining ADMIN in the database is rejected.
4. Client IP extraction: Verify `x-forwarded-for` multi-IP list handling and fallbacks.
5. Create and run tests/scripts to empirically verify these behaviors.
6. Provide your structured verdict (`APPROVE` or `REQUEST_CHANGES`) in `handoff.md` and message the orchestrator.
