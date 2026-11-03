## 2026-11-02T09:42:53Z
You are assigned as Explorer M1-3 (User Detail, Profile Page & Sidebar Greeting Spec Miner).
Working directory: /Users/macos/ieee-smc-2027/.agents/teamwork/explorer_m1_3/

MANDATORY FIRST STEPS:
1. Read /Users/macos/ieee-smc-2027/.agents/teamwork/ORIGINAL_REQUEST.md.
2. Read /Users/macos/ieee-smc-2027/PROJECT.md.
3. Read reference material at:
   - `/Users/macos/Documents/Projects/hcmute-website/hcmute-website-frontend/app/manage/users/[id]/page.tsx`
   - `/Users/macos/Documents/Projects/hcmute-website/hcmute-website-frontend/app/manage/profile/page.tsx`
   - `/Users/macos/Documents/Projects/hcmute-website/hcmute-website-frontend/app/components/admin-layout/user-sidebar.tsx`

MISSION:
Investigate and design the exact technical specification and code proposals for:
1. User Detail Inspection Page:
   - Path: `src/app/admin/(dashboard)/users/[id]/page.tsx`.
   - Layout: 2-column inspection layout matching HCMUTE:
     - Left Column: Account Details Card (Avatar with fallback initials, Full Name, Email, Role badge, Status badge with `ShieldCheck`/`ShieldAlert`/`ShieldX`, Registration Date, Last Login Timestamp and IP badge).
     - Right Column:
       - Active Sessions Card: Displays client IP address (`Network` icon), Device/Browser string, Last Access timestamp, and a "Revoke Sessions" button.
       - Password & Security Card: "Reset Password" button opening a modal with temporary password input and copy button.
       - Account Status Card: Switch/toggle to Block or Unblock account.
       - Danger Zone Card: Delete user button with confirmation dialog and self-protection guard.
2. Profile Management Page:
   - Path: `src/app/admin/(dashboard)/profile/page.tsx`.
   - Layout: Matching HCMUTE profile page:
     - Profile Header: Avatar preview and upload, Full Name, Role badge list, Join Date.
     - Personal Information Card: Form fields for Name, Academic Title/Degree, Affiliation/Organization, Bio, with Email read-only.
     - Security & Authentication Card: Password update form or OTP request, Active Sessions display with Revoke button.
     - Logout button.
3. AdminSidebar Greeting Link:
   - Target: `src/app/admin/(dashboard)/components/AdminSidebar.tsx`.
   - Wrap the user greeting block (lines ~292–355) with `<Link href="/admin/profile">` with hover transition, ring highlight, and cursor pointer.

OUTPUT REQUIREMENTS:
- Produce concrete, production-ready code proposals in:
  - `/Users/macos/ieee-smc-2027/.agents/teamwork/explorer_m1_3/proposed_user_detail_page.tsx`
  - `/Users/macos/ieee-smc-2027/.agents/teamwork/explorer_m1_3/proposed_profile_page.tsx`
  - `/Users/macos/ieee-smc-2027/.agents/teamwork/explorer_m1_3/sidebar_patch.md`
  - `/Users/macos/ieee-smc-2027/.agents/teamwork/explorer_m1_3/handoff.md`
- Zero sparkle icons (use Lucide icons like `ShieldCheck`, `Network`, `KeyRound`, `LogOut`, `User`, `Mail`, `Building2`, `Calendar`).
- Clean layout without excessive English parenthetical subtitles.
- Send handoff message when complete.
