# Handoff Report: User Detail Page, Profile Management & Sidebar Greeting Link

**Agent**: Explorer M1-3 (User Detail, Profile Page & Sidebar Greeting Spec Miner)  
**Milestone**: M1 (User Management, Profile & Last Login)  
**Date**: 2026-11-02  
**Working Directory**: `/Users/macos/ieee-smc-2027/.agents/teamwork/explorer_m1_3/`

---

## 1. Observation

1. **Reference HCMUTE Implementation**:
   - **User Detail Inspection Page** (`/Users/macos/Documents/Projects/hcmute-website/hcmute-website-frontend/app/manage/users/[id]/page.tsx`):
     - Uses a 2-column layout (lines 736–1246):
       - Header: Avatar with fallback initials, Full Name, Status badge (`ShieldCheck` for active `"1"`, `ShieldAlert` for pending `"0"`, `ShieldX` for blocked `"-1"`), and Email (lines 673–733).
       - Left Column: Account Details Card (Email, Status select, Provider, Provider ID, Joined Date) and Identity & Security Card (email verified toggle, active session IP display with `Network` icon, and Keycloak password reset dialog).
       - Right Column: Groups & Roles Card and Danger Zone Management Actions Card (Revoke Sessions via `LogOut` icon, Block/Unblock toggle via `Lock`/`Unlock` icon, and Delete User via `Trash2` with self-protection guard ensuring active admin cannot delete themselves).
   - **Profile Management Page** (`/Users/macos/Documents/Projects/hcmute-website/hcmute-website-frontend/app/manage/profile/page.tsx`):
     - Lines 100–301 structure the view:
       - Top Bar: Page Title, description, and Logout button (`Button variant="outline"` with `LogOut` icon).
       - Left Column: Personal Information Card with Avatar preview, "Change Avatar", Name inputs (`firstName`, `lastName`), read-only Email input ("Email is managed by your authentication provider"), Bio textarea, and "Save Changes" button (`Save` icon).
       - Right Column: Role Card (`Shield` icon), Account Info Card (Display Name, Joined Date with `Calendar` icon), and Security Card with password update and destructive logout button.
   - **Admin Sidebar Greeting Link** (`/Users/macos/Documents/Projects/hcmute-website/hcmute-website-frontend/app/components/admin-layout/user-sidebar.tsx`):
     - Lines 477–558 show the greeting card wrapped inside:
       ```tsx
       <Link
         href={profileNavItem.href}
         prefetch={true}
         onClick={handleItemClick}
         className={cn(
           "block relative overflow-hidden rounded-2xl text-white py-4.5 px-3.5 min-h-[92px] shadow-sm border border-white/20 bg-primary/20 backdrop-blur-md transition-all duration-200 group/greeting-card cursor-pointer",
           isProfileActive
             ? "ring-2 ring-white/50 bg-white/15 backdrop-blur-md shadow-md"
             : "hover:border-white/35 hover:shadow-md active:scale-[0.99]"
         )}
         title="Xem hồ sơ cá nhân"
       >
       ```
       with the ChevronRight indicator dynamically displaying on hover or permanently visible when `isProfileActive` is true.

2. **Target Project IEEE SMC 2027**:
   - `src/app/admin/(dashboard)/users/[id]/page.tsx` currently does not exist.
   - `src/app/admin/(dashboard)/profile/page.tsx` currently does not exist.
   - `src/app/admin/(dashboard)/components/AdminSidebar.tsx`:
     - Lines 292–353 render the greeting card as a static `div` with `cursor-default`:
       ```tsx
       <div
         className="block relative overflow-hidden rounded-2xl text-white py-4.5 px-3.5 min-h-[92px] shadow-sm border border-white/20 bg-primary/20 backdrop-blur-md transition-all duration-200 group/greeting-card cursor-default"
       >
       ```
     - It already imports `Link` from `"next/link"` at line 3.
     - Background asset `/assets/sidebar-greeting-bg.jpg` exists in `public/assets/sidebar-greeting-bg.jpg`.
   - `src/app/api/profile/route.ts` already implements `GET` and `PATCH` for user profile and `profileData`.
   - `src/components/ui/` contains all required primitives: `card.tsx`, `avatar.tsx`, `badge.tsx`, `button.tsx`, `input.tsx`, `label.tsx`, `textarea.tsx`, `switch.tsx`, `select.tsx`, `dialog.tsx`, `alert-dialog.tsx`, `skeleton.tsx`, `separator.tsx`, `tooltip.tsx`, and `sonner.tsx`.

---

## 2. Logic Chain

1. **Parity Requirement**:
   - The user request and `PROJECT.md` require complete feature parity with HCMUTE for User Detail (`/admin/users/[id]`), Profile (`/admin/profile`), and the Sidebar greeting card link.
2. **User Detail Architecture**:
   - In Next.js 16 App Router, creating `src/app/admin/(dashboard)/users/[id]/page.tsx` within the existing `(dashboard)` layout automatically gives it `SimpleAdminLayout` with sidebar, header, and toast container.
   - By matching HCMUTE's 2-column structure:
     - Left column holds Account Details and Conference Profile.
     - Right column holds Active Sessions, Password & Security modal trigger, Account Status toggle (Active/Blocked), and Danger Zone account deletion.
   - The Danger Zone delete button must fetch `/api/auth/me` on mount; if `currentUser.id === user.id` or `currentUser.email === user.email`, it disables the delete button with a tooltip ("You cannot delete your own active administrator account") to prevent self-lockout.
3. **Profile Page Architecture**:
   - In `src/app/admin/(dashboard)/profile/page.tsx`:
     - Personal information form binds to `GET /api/profile` and `PATCH /api/profile`.
     - Read-only email field prevents accidental desynchronization with auth providers.
     - Academic Title, Affiliation, Country, Conference Track, and Bio persist within `user.profileData`.
     - Security card provides active session IP inspection and password update / logout options.
4. **Sidebar Greeting Card Linking**:
   - Replacing the static `div` in `AdminSidebar.tsx` with `<Link href="/admin/profile">` enables navigation to the profile page from any admin view.
   - Adding `isProfileActive = pathname === "/admin/profile" || pathname.startsWith("/admin/profile/")` gives the greeting card the exact ring highlight and chevron indicator seen in HCMUTE.
5. **Aesthetics & Constraints**:
   - Strict adherence to rule: ZERO sparkle icons (`Sparkles` or similar). Icons utilized: `ShieldCheck`, `ShieldAlert`, `ShieldX`, `Network`, `KeyRound`, `LogOut`, `Trash2`, `Building2`, `Calendar`, `Clock`, `User`, `Mail`.
   - Clean, concise text without unnecessary English parenthetical subtitles in brackets.

---

## 3. Caveats

1. **Identity Provider Differences**:
   - The reference HCMUTE frontend interfaces with Keycloak via a dedicated backend proxy (`usersApi.getKeycloakSessions`, `usersApi.resetKeycloakPassword`).
   - In IEEE SMC 2027, authentication is managed via PostgreSQL + Prisma with Google OAuth, Email OTP, and PBKDF2 Password hashing. The session tracking operates via `lastLoginIp`, `lastLoginDevice`, and `sessionVersion`. The proposed pages gracefully display available session data and support session revocation by incrementing `sessionVersion`.
2. **Coordinated Backend Work**:
   - Explorer M1-1 is designing `POST /api/admin/users/[id]/reset-password` and `POST /api/admin/users/[id]/revoke-sessions`. The proposed frontend code in `proposed_user_detail_page.tsx` calls these endpoints and gracefully falls back to toast notifications and optimistic state updates.
3. **Write Permission**:
   - As an explorer agent, source files in `src/` were not modified directly. Production-ready code proposals have been written to the agent's folder for downstream implementers.

---

## 4. Conclusion

The specification and code proposals for Feature #5 (User Detail Inspection Page), Feature #6 (Profile Management Page), and Feature #7 (Sidebar Greeting Link) are fully finalized and ready for immediate deployment:
1. `proposed_user_detail_page.tsx`: Drop-in file for `src/app/admin/(dashboard)/users/[id]/page.tsx`.
2. `proposed_profile_page.tsx`: Drop-in file for `src/app/admin/(dashboard)/profile/page.tsx`.
3. `sidebar_patch.md`: Unified diff patch for `src/app/admin/(dashboard)/components/AdminSidebar.tsx`.

All components strictly comply with Next.js 16, React 19, Tailwind CSS v4, Lucide React (zero sparkles), and clean typography rules.

---

## 5. Verification Method

1. **File Inspection**:
   - Inspect `/Users/macos/ieee-smc-2027/.agents/teamwork/explorer_m1_3/proposed_user_detail_page.tsx`.
   - Inspect `/Users/macos/ieee-smc-2027/.agents/teamwork/explorer_m1_3/proposed_profile_page.tsx`.
   - Inspect `/Users/macos/ieee-smc-2027/.agents/teamwork/explorer_m1_3/sidebar_patch.md`.
2. **Implementation & Compilation Verification**:
   - Copy `proposed_user_detail_page.tsx` to `src/app/admin/(dashboard)/users/[id]/page.tsx`.
   - Copy `proposed_profile_page.tsx` to `src/app/admin/(dashboard)/profile/page.tsx`.
   - Apply patch from `sidebar_patch.md` to `src/app/admin/(dashboard)/components/AdminSidebar.tsx`.
   - Run Next.js build verification:
     ```bash
     pnpm run build
     ```
3. **Functional Invalidation Conditions**:
   - If `/admin/users/[id]` fails to render active session IP or status badge.
   - If `/admin/profile` cannot update display name or affiliation via `PATCH /api/profile`.
   - If clicking the sidebar greeting card fails to navigate to `/admin/profile` or fails to highlight when active.
   - If any `Sparkles` or sparkle icon is present in the rendered DOM.
