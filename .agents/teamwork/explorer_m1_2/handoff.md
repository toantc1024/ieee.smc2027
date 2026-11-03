# Handoff Report — Explorer M1-2: User Table & List View Parity Spec Miner

## 1. Observation

1. **Existing User Management Implementation**:
   - `src/app/admin/(dashboard)/users/page.tsx`:
     - Line 485–520: Actions column currently renders raw inline buttons (`Edit2` and `Trash2`), lacking the HCMUTE `MoreHorizontal` dropdown menu.
     - Lacks Status column badges entirely (only renders `User`, `Role`, `Conference Track`, `Affiliation`, `Joined Date`, `Actions`).
     - Lacks Last Login column entirely (no `lastLoginAt` or `lastLoginIp` rendering).
     - Missing Status Filter Pills (`All`, `Active`, `Inactive`, `Blocked`) present in HCMUTE reference (`app/manage/users/page.tsx:1074-1130`).
     - Create User modal lacks the Radix Switch toggle (`@radix-ui/react-switch`) for invitation email delivery.
   - `src/components/admin/users/CreateUserModal.tsx`:
     - Lacks invitation email sending toggle with `@radix-ui/react-switch`.
     - Lacks visual icons on form labels (`User`, `Mail`, `Shield`, `Tag`, `Building2`, `KeyRound`).
   - `src/components/admin/users/EditUserModal.tsx`:
     - Contains inline profile editing and password reset, but does not provide a dedicated, lightweight `ResetPasswordModal` with random password generator and clipboard copy.
   - `src/components/admin/users/UserDeleteDialog.tsx`:
     - Lines 23–93: Lacks self-protection guard directly in the dialog UI when deleting user accounts.

2. **Reference Implementation (`hcmute-website-frontend`)**:
   - `app/manage/users/page.tsx`:
     - Lines 122–146: Status badge helper functions with emerald, amber, and rose themes:
       - Active (`1`): Emerald badge with `ShieldCheck`
       - Pending/Inactive (`0`): Amber badge with `ShieldAlert`
       - Blocked (`-1`): Rose badge with `ShieldX`
     - Lines 797–957: Action Menu with `MoreHorizontal` trigger containing `Eye` View Profile, `Mail` Resend Invitation, `KeyRound` Reset Password, `LogOut` Revoke Sessions, `Lock` / `Unlock` Block/Unblock, and `Trash2` Delete User with self-protection guard (`isSelf`).
     - Lines 1040–1130: Header filter toolbar featuring debounced search box and status filter pills (`All`, `Active`, `Pending`, `Blocked`) with item counts and theme-colored active states.
     - Lines 1177–1225: Active applied filter badges bar displaying filter pills with dismiss `[x]` buttons and a "Clear all" button.
   - `app/manage/users/components/create-user-dialog.tsx`:
     - Lines 265–282: Radix Switch toggle for sending activation/invitation email.

3. **Prisma & Backend Capabilities**:
   - `prisma/schema.prisma` lines 21–43:
     - The `User` model already defines: `status` (String, default: "ACTIVE"), `lastLoginAt` (DateTime?), `lastLoginIp` (String?), `lastLoginDevice` (String?), and `sessionVersion` (Int, default: 1).
   - Peer task alignment with Explorer M1-1:
     - M1-1 extends `src/app/api/admin/users/route.ts` to return `status`, `lastLoginAt`, `lastLoginIp`, `lastLoginDevice`, and `sessionVersion`.
     - M1-1 implements `POST /api/admin/users/[id]/revoke-sessions` (increments `sessionVersion`), `POST /api/admin/users/[id]/reset-password`, and `PATCH /api/admin/users/[id]`.
   - Peer task alignment with Explorer M1-3:
     - M1-3 implements the User Detail page (`src/app/admin/(dashboard)/users/[id]/page.tsx`), matching the `Eye` View Profile link.

4. **Lint and Type Verification**:
   - `npx tsc --project tsconfig.json --noEmit`: Exited with code 0.
   - `npx eslint .agents/teamwork/explorer_m1_2/`: Exited with code 0 (0 errors, 0 warnings).

---

## 2. Logic Chain

1. **Status Column & Badges**:
   - From Observation 1 & 2, the IEEE SMC 2027 user table must represent user account states with visual clarity.
   - Normalizing status (`normalizeAccountStatus`) maps string enums (`"ACTIVE"`, `"INACTIVE"`, `"BLOCKED"`) and numeric representations (`"1"`, `"0"`, `"-1"`) to a unified union type `"ACTIVE" | "INACTIVE" | "BLOCKED"`.
   - Each state receives matching Lucide icons:
     - `ACTIVE`: `ShieldCheck` (emerald theme: `bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800`).
     - `INACTIVE`: `ShieldAlert` (amber theme: `bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800`).
     - `BLOCKED`: `ShieldX` (rose theme: `bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800`).

2. **Last Login Column**:
   - From Observation 1 & 3, users have `lastLoginAt` and `lastLoginIp` stored in Prisma.
   - If `lastLoginAt` is null or undefined, the cell displays an italicized fallback `Never` (`text-slate-400`).
   - If present, `formatLastLogin` formats the date via `Intl.DateTimeFormat` (`MM/DD/YYYY, HH:mm` or `Mon D, YYYY, HH:mm`) and renders a clean inline bullet with a monospace IP badge:
     `12/10/2026, 14:32 • 203.0.113.195`.
   - If `lastLoginDevice` is available, it is attached as a browser tooltip.

3. **Action Menu (`MoreHorizontal` dropdown)**:
   - Replaces raw buttons with a polished `DropdownMenu` trigger with `MoreHorizontal` on every row.
   - Dropdown menu items:
     - `Eye` View Profile: Navigates to `/admin/users/${user.id}`.
     - `Mail` Resend Invitation: Calls `POST /api/admin/users/${user.id}/resend-invitation` with toast confirmation.
     - `KeyRound` Reset Password: Opens `ResetPasswordModal` for this user.
     - `LogOut` Revoke Sessions: Triggers a confirmation `AlertDialog` and calls `POST /api/admin/users/${user.id}/revoke-sessions`.
     - `Lock` / `Unlock` Block/Unblock Account: Toggles status between `ACTIVE` and `BLOCKED` via `PATCH /api/admin/users/${user.id}` with optimistic UI updates. Disabled for `isSelf`.
     - `Trash2` Delete Account: Opens `UserDeleteDialog` with target user details and self-protection guard (disabled if `isSelf`).

4. **Create User Dialog**:
   - Form fields: Name, Email, Role (`ADMIN` / `USER`), Conference Track (`SUBMITTER` / `SPEAKER` / `ATTENDEE`), Affiliation, Initial Password (optional).
   - Includes the Radix Switch (`@radix-ui/react-switch`) with title "Send invitation email" and description "Send an account activation link and login instructions".
   - Dispatches payload to `POST /api/admin/users`, displays loading state (`Loader2`), resets form, and refetches users on completion.

5. **Search & Filter Controls**:
   - Debounced search input (300ms) with search icon and clear `[x]` button.
   - Status Filter Pills matching HCMUTE parity with live count badges:
     - `All (${statusCounts.ALL})`
     - `Active (${statusCounts.ACTIVE})`
     - `Inactive (${statusCounts.INACTIVE})`
     - `Blocked (${statusCounts.BLOCKED})`
   - Role dropdown filter (`All Roles`, `Administrator`, `Regular User`).
   - Active applied filter badges bar showing removable chips and a "Clear all" button.
   - Multi-row selection with "Delete selected" batch action guarded against deleting current user.

6. **Constraint Compliance**:
   - Zero sparkle icons (only standard Lucide icons: `ShieldCheck`, `ShieldAlert`, `ShieldX`, `MoreHorizontal`, `KeyRound`, `LogOut`, `Eye`, `Mail`, `Trash2`, `UserPlus`, `Plus`, `Search`, `RotateCcw`, `Lock`, `Unlock`, `Calendar`, `User`, `Shield`, `Tag`, `Building2`).
   - Clean UI without parenthetical English clutter.

---

## 3. Caveats

1. **Backend Route Dependencies**:
   - The frontend action menu triggers `/api/admin/users/${id}/revoke-sessions` and `/api/admin/users/${id}/reset-password`. These endpoints are being designed by Explorer M1-1. The frontend proposal implements fallback error handling and graceful degradations (e.g. falling back to `PATCH /api/admin/users/${id}` if the dedicated endpoint returns 404).
2. **Current User Identification**:
   - Self-protection guards depend on `/api/auth/me` returning the active admin's email. If the network call fails, safe fallbacks are applied.
3. **Database Population**:
   - Historical users created before M0 may have `lastLoginAt` and `lastLoginIp` as null. The component renders "Never", which is expected and handles null values cleanly.

---

## 4. Conclusion

The specification and production-ready code proposals for the User Management list view have been created in the working directory:
1. `proposed_users_page.tsx`: Full replacement for `src/app/admin/(dashboard)/users/page.tsx` with all 5 requirements implemented.
2. `proposed_create_user_modal.tsx`: Modal with Radix Switch, conference track selector, and affiliation.
3. `proposed_reset_password_modal.tsx`: Dedicated password reset modal with random generator and copy button.
4. `proposed_user_delete_dialog.tsx`: Delete confirmation modal with self-protection guard.

### Proposed File Placement Plan for Implementer:
| Source Proposal | Target Production Path |
|---|---|
| `.agents/teamwork/explorer_m1_2/proposed_users_page.tsx` | `src/app/admin/(dashboard)/users/page.tsx` |
| `.agents/teamwork/explorer_m1_2/proposed_create_user_modal.tsx` | `src/components/admin/users/CreateUserModal.tsx` |
| `.agents/teamwork/explorer_m1_2/proposed_reset_password_modal.tsx` | `src/components/admin/users/ResetPasswordModal.tsx` |
| `.agents/teamwork/explorer_m1_2/proposed_user_delete_dialog.tsx` | `src/components/admin/users/UserDeleteDialog.tsx` |

---

## 5. Verification Method

1. **TypeScript Typecheck**:
   ```bash
   npx tsc --project tsconfig.json --noEmit
   ```
   *Expected outcome*: Exits with code 0.

2. **ESLint Validation**:
   ```bash
   npx eslint .agents/teamwork/explorer_m1_2/
   ```
   *Expected outcome*: 0 errors, 0 warnings.

3. **Visual & Behavioral Invalidation Conditions**:
   - Any sparkle icon in the DOM invalidates requirement compliance.
   - Missing status pills, status badges, or last login IP badges invalidates parity.
   - Inability to block/unblock or revoke sessions via the `MoreHorizontal` dropdown invalidates acceptance.
