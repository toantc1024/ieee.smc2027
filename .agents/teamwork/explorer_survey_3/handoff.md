# Handoff Report: Explorer Survey 3 (User & Profile Spec Miner)

**Author**: Explorer Survey 3 (User & Profile Spec Miner)  
**Recipient**: Lead Orchestrator (`e417c152-55b4-4ecc-ad3e-6ec5f3ea6688`)  
**Timestamp**: 2026-11-02T08:20:00Z  
**Type**: Hard Handoff (Investigation & Survey Complete)  

---

## 1. Observation

1. **Reference User Management Structure**:
   - `/Users/macos/Documents/Projects/hcmute-website/hcmute-website-frontend/app/manage/users/page.tsx`:
     - Lines 122–146: Status formatting function `normalizeAccountStatus` and status icons (`ShieldCheck` for "1", `ShieldAlert` for "0", `ShieldX` for "-1").
     - Lines 551–695: Table columns including `fullName` (with Avatar and initials), `email`, `status` (badges with status colors), `group` (inline `SelectPrimitive` dropdown with loader `Loader2`), `provider`, and `createdDate`.
     - Lines 790–950: Action menu using `DropdownMenu` with `MoreHorizontal` trigger, providing:
       - `Eye` View Profile (`/manage/users/${row.id}`)
       - `Send` Resend Invitation
       - `LogOut` Revoke Sessions
       - `Lock` / `Unlock` Block or Unblock Account
       - `Trash2` Delete User with self-protection guard
   - `/Users/macos/Documents/Projects/hcmute-website/hcmute-website-frontend/app/manage/users/[id]/page.tsx`:
     - 1472 lines (56KB) containing a comprehensive 2-column user detail view.
     - Lines 196–212: `formatDateTime` and `formatUnixMillis` handling session time with fallback `"Chưa đăng nhập"`.
     - Lines 915–945: Active sessions list displaying client IP address (`Network` icon) and last access time (`Truy cập cuối: formatUnixMillis(session.lastAccess)`).
     - Lines 977–990: Keycloak password reset button opening a modal dialog with a temporary password switch toggle.
     - Lines 1100–1240: Management actions card with Resend Invitation, Revoke Sessions, Block/Unblock, and Delete User.
   - `/Users/macos/Documents/Projects/hcmute-website/hcmute-website-frontend/app/manage/users/components/create-user-dialog.tsx`:
     - Lines 265–282: Switch component toggle (`@radix-ui/react-switch`) for `sendInviteEmail`.
   - `/Users/macos/Documents/Projects/hcmute-website/hcmute-website-frontend/app/manage/profile/page.tsx`:
     - 303 lines (10KB) providing personal info form (First Name, Last Name, Bio, disabled email), avatar display, role badge list, account join date, security card, and logout button.
   - `/Users/macos/Documents/Projects/hcmute-website/hcmute-website-frontend/app/components/admin-layout/user-sidebar.tsx`:
     - Lines 480–558: Greeting card in the admin sidebar is wrapped in `<Link href="/manage/profile">` with hover transition and active ring.

2. **Target Project IEEE SMC 2027 Current State**:
   - `/Users/macos/ieee-smc-2027/prisma/schema.prisma`:
     - Lines 21–37: Model `User` contains `id`, `email`, `name`, `avatar`, `role`, `provider`, `passwordHash`, `profileData`, `createdAt`, `updatedAt`.
     - **Observed Absence**: Model `User` lacks `status`, `lastLoginAt`, `lastLoginIp`, `lastLoginDevice`, and session versioning.
   - `/Users/macos/ieee-smc-2027/src/app/admin/(dashboard)/users/page.tsx`:
     - Lines 256–505: Table columns `select`, `name`, `role`, `conferenceRole`, `affiliation`, `createdAt`, `actions`. Uses `DataTable.tsx` with sorting and filtering.
     - **Observed Absence**: Does not display Account Status (`ShieldCheck`/`ShieldAlert`/`ShieldX`), does not display Last Login, and actions are direct Edit/Delete buttons rather than a `MoreHorizontal` dropdown with View Detail, Revoke Sessions, and Resend Invite.
   - `/Users/macos/ieee-smc-2027/src/app/admin/(dashboard)/users/[id]/page.tsx`:
     - **File does not exist**.
   - `/Users/macos/ieee-smc-2027/src/app/admin/(dashboard)/profile/page.tsx`:
     - **File does not exist**.
   - `/Users/macos/ieee-smc-2027/src/app/admin/(dashboard)/components/AdminSidebar.tsx`:
     - Lines 292–355: Greeting card renders avatar, greeting, name, and role as a static `div` with `cursor-default` instead of linking to `/admin/profile`.
   - `/Users/macos/ieee-smc-2027/src/app/api/auth/`:
     - In `login-password/route.ts`, `otp/verify/route.ts`, and `callback/google/route.ts`, users are authenticated and JWT cookies issued, but neither `lastLoginAt` nor client IP is captured.
   - `/Users/macos/ieee-smc-2027/package.json`:
     - TanStack Table, Lucide React, Motion, Sonner, and major Radix UI components are installed.
     - `@radix-ui/react-switch` is not listed in dependencies.
   - `/Users/macos/ieee-smc-2027/public/assets/`:
     - `3d-icons/users__hcmute-3d-icon.png` (757KB) and `manage-users-bg.jpg` are already present.
     - `assets/sidebar-greeting-bg.jpg` is present.
   - **Icon Verification**:
     - Negative ripgrep searches across reference user modules and target code confirmed zero instances of `Sparkles` or sparkle icons.

---

## 2. Logic Chain

1. **Step 1 — Core Parity Requirement**:  
   The user request mandates feature, control, and button layout parity with HCMUTE's user, profile, and last login tracking.

2. **Step 2 — Identification of Gaps**:  
   - Observations 1 & 2 show that while IEEE SMC 2027 has an initial user table (`/admin/users/page.tsx`), it lacks the user detail inspection route (`/admin/users/[id]`), the profile page (`/admin/profile`), and account status toggles (`ACTIVE`, `BLOCKED`, `PENDING`).
   - The reference sidebar greeting card navigates to `/manage/profile`, whereas in IEEE SMC 2027 it is an unclickable `div`.

3. **Step 3 — Last Login Tracking Logic**:  
   - Observation 1 demonstrates that HCMUTE tracks active sessions with IP addresses and last access timestamps, allowing session revocation.
   - Observation 2 demonstrates that IEEE SMC 2027's database and auth endpoints do not record timestamps or IP addresses during authentication.
   - Therefore, to achieve feature parity, the `User` model must be extended with `status`, `lastLoginAt`, `lastLoginIp`, `lastLoginDevice`, and `sessionVersion`, and the three login endpoints must capture headers (`x-forwarded-for`, `user-agent`).

4. **Step 4 — UI Control Alignment**:  
   - Observation 1 defines the exact control standard: `ManagementPageHeader` with 3D icon and background, debounced search toolbar, faceted status and role filters, `DataTable` with status badges, and `MoreHorizontal` dropdown actions.
   - Because `@radix-ui/react-switch` is missing from `package.json`, either installing it or implementing an accessible switch primitive is required for the user invitation toggle and email verification toggle.

---

## 3. Caveats

1. **Keycloak vs Internal JWT**:  
   HCMUTE integrates with an external Keycloak identity server for session querying. IEEE SMC 2027 uses internal HS256 JWT sessions stored in Postgres and cookies. Active session tracking in IEEE SMC 2027 will be managed directly via PostgreSQL (`lastLoginAt`, `lastLoginIp`, and `sessionVersion`), delivering identical user-facing controls without external Keycloak dependencies.
2. **China Firewall Compliance**:  
   Per `SKILL.md` (ieee-smc-security), Chinese and international conference delegates rely heavily on Email OTP and Email/Password. All profile and user management workflows must remain fully functional without Google services.
3. **Read-Only Investigation**:  
   No source code was altered during this survey.

---

## 4. Conclusion

The specification for User Management, Profile Management, and Last Login Tracking is fully mapped and ready for implementation.

Key deliverables required for implementation:
1. **Schema Extension**: Add `status`, `lastLoginAt`, `lastLoginIp`, `lastLoginDevice`, and `sessionVersion` to `prisma/schema.prisma`.
2. **Auth Capture**: Update login endpoints (`login-password`, `otp/verify`, `callback/google`) to record login IP and timestamp.
3. **Route `/admin/users` Enhancement**: Add Status column, Last Login column, and `MoreHorizontal` dropdown action menu.
4. **Route `/admin/users/[id]` Creation**: Implement the 2-column user detail inspection view featuring account information, active session IP display, password reset modal, and management actions.
5. **Route `/admin/profile` Creation**: Implement the profile management view and link it to the sidebar greeting card in `AdminSidebar.tsx`.
6. **Switch UI Component**: Add `src/components/ui/switch.tsx`.

---

## 5. Verification Method

To independently verify the survey findings:

1. **Verify Existing User Management Files**:
   ```bash
   cat src/app/admin/\(dashboard\)/users/page.tsx | grep -E "columns|DataTable|CreateUserModal"
   cat src/app/api/admin/users/route.ts | grep -E "export async function"
   ```
2. **Verify Missing Routes**:
   ```bash
   ls src/app/admin/\(dashboard\)/users/\[id\]
   ls src/app/admin/\(dashboard\)/profile
   ```
   *Expected result: No such file or directory.*
3. **Verify Reference Components**:
   ```bash
   ls /Users/macos/Documents/Projects/hcmute-website/hcmute-website-frontend/app/manage/users/\[id\]/page.tsx
   ls /Users/macos/Documents/Projects/hcmute-website/hcmute-website-frontend/app/manage/profile/page.tsx
   ```
4. **Verify Sparkle Icon Absence**:
   ```bash
   grep -rn "Sparkles" /Users/macos/Documents/Projects/hcmute-website/hcmute-website-frontend/app/manage/users
   grep -rn "Sparkles" src/app/admin/\(dashboard\)/users
   ```
   *Expected result: 0 matches.*
