## 2026-11-02T09:42:27Z
You are assigned as Explorer M1-1 (User Management Auth Tracking & API Handlers Spec Miner).
Working directory: /Users/macos/ieee-smc-2027/.agents/teamwork/explorer_m1_1/

MANDATORY FIRST STEPS:
1. Read /Users/macos/ieee-smc-2027/.agents/teamwork/ORIGINAL_REQUEST.md.
2. Read /Users/macos/ieee-smc-2027/PROJECT.md.
3. Read reference material at /Users/macos/Documents/Projects/hcmute-website/hcmute-website-frontend/ (specifically auth and user endpoints/actions).

MISSION:
Investigate and design the exact technical specification, type signatures, and code changes for:
1. Auth Login Tracking:
   - `src/lib/auth.ts`: Add `recordLogin(userId, ip, device)` updating `lastLoginAt`, `lastLoginIp`, `lastLoginDevice`.
   - Update `getCurrentUser()` to ensure that if a user was deleted from the database, or if `sessionVersion` does not match, the session is invalidated immediately (fixes the user deletion revocation bug).
   - In `src/app/api/auth/login-password/route.ts`, `src/app/api/auth/otp/verify/route.ts`, and `src/app/api/auth/callback/google/route.ts`: extract client IP (checking `x-forwarded-for` and standard headers) and user-agent string, and call login tracking.
2. User Administration API Endpoints:
   - `src/app/api/admin/users/route.ts`: List users with status, last login, role, conference role, search, pagination.
   - `src/app/api/admin/users/[id]/route.ts`:
     - `GET`: Return single user full details including `status`, `lastLoginAt`, `lastLoginIp`, `lastLoginDevice`, `profileData`.
     - `PATCH`: Update user status (`ACTIVE`, `INACTIVE`, `BLOCKED`), role, conferenceRole, affiliation, name, email.
     - `DELETE`: Delete user with safety guard (cannot delete own active admin account).
   - `src/app/api/admin/users/[id]/reset-password/route.ts`: Admin password reset endpoint allowing admin to set a temporary password or trigger reset.
   - `src/app/api/admin/users/[id]/revoke-sessions/route.ts`: Revoke user sessions by incrementing `sessionVersion` in the DB.
3. Profile API Endpoints:
   - `src/app/api/profile/route.ts`: `GET` self profile, `PATCH` update self profile (name, avatar, academic info in profileData).

OUTPUT REQUIREMENTS:
- Produce concrete, production-ready code proposals and patches in `/Users/macos/ieee-smc-2027/.agents/teamwork/explorer_m1_1/proposed_auth_api.ts` and `/Users/macos/ieee-smc-2027/.agents/teamwork/explorer_m1_1/handoff.md`.
- Follow Next.js 16 App Router standards (`AGENTS.md`).
- Ensure ZERO sparkle icons and clean code without unnecessary English parenthetical subtitles.
- Send handoff message when complete.
