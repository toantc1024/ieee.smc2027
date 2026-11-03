# DISPATCH — 2026-11-02T09:55:00Z

## Mission: Implement Milestone M1 (User Management, Profile & Last Login Tracking)

Implement complete feature set for Milestone M1 based on the specifications and code proposals from Explorers M1-1, M1-2, and M1-3:
1. Auth & Session Revocation:
   - `src/lib/auth.ts`:
     - Fix session revocation bug: `if (!dbUser) return null;`
     - Add `sessionVersion` validation in `getCurrentUser()` to invalidate revoked sessions.
     - Embed `sessionVersion` in `createSessionToken()`.
     - Implement `recordLogin(userId, ip, device)`.
     - Implement `extractClientInfo(req)`.
   - Update `src/app/api/auth/login-password/route.ts` to call `recordLogin`.
   - Update `src/app/api/auth/otp/verify/route.ts` to call `recordLogin`.
   - Update `src/app/api/auth/callback/google/route.ts` to call `recordLogin`.

2. Admin User API Endpoints:
   - `src/app/api/admin/users/route.ts`: Add search, role filter, status filter, pagination (`page`, `limit`, `total`, `totalPages`), and select projections including `status`, `lastLoginAt`, `lastLoginIp`, `lastLoginDevice`.
   - `src/app/api/admin/users/[id]/route.ts`: Implement `GET` inspection, guarded `PATCH` (self-protection), guarded `DELETE` (self-protection).
   - `src/app/api/admin/users/[id]/reset-password/route.ts`: Create new password reset endpoint.
   - `src/app/api/admin/users/[id]/revoke-sessions/route.ts`: Create new session revocation endpoint (increments `sessionVersion`).

3. Profile API Endpoint:
   - `src/app/api/profile/route.ts`: Include `status`, `lastLoginAt`, `lastLoginIp`, `lastLoginDevice` in `GET`. Update `PATCH` to merge top-level profile fields (`affiliation`, `bio`, `academicInfo`, etc.) into `profileData`.

4. Admin UI Pages & Modals:
   - `src/app/admin/(dashboard)/users/page.tsx`: Deploy full user list with status indicators (`ShieldCheck`, `ShieldAlert`, `ShieldX`), last login timestamp & IP badge, debounced search, status filter pills, role filter, dropdown action menu.
   - `src/components/admin/users/CreateUserModal.tsx`: Deploy create user modal with switch for invitation email.
   - `src/components/admin/users/ResetPasswordModal.tsx`: Deploy reset password modal with password generator and clipboard copy.
   - `src/components/admin/users/UserDeleteDialog.tsx`: Deploy delete confirmation modal with self-protection guard.
   - `src/app/admin/(dashboard)/users/[id]/page.tsx`: Deploy 2-column user detail inspection view.
   - `src/app/admin/(dashboard)/profile/page.tsx`: Deploy profile management view matching HCMUTE.
   - `src/app/admin/(dashboard)/components/AdminSidebar.tsx`: Wrap greeting card with `<Link href="/admin/profile">` with hover chevron and active ring highlight.

5. Verification:
   - `pnpm exec tsc --noEmit` -> 0 errors.
   - `pnpm run build` -> 0 errors.
   - `pnpm run test:e2e` -> 10/10 suites passing.
   - Commit and push to git.

## Strict Rules
- MANDATORY INTEGRITY WARNING: DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.
- Never use sparkle icon (`Sparkles` or similar).
- Do not make too much text or english as sub in () bracelet, no need.
- For each atom change or big change make a commit and push.
