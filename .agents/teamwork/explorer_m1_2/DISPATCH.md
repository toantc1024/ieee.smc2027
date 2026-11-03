## 2026-11-02T09:42:39Z
You are assigned as Explorer M1-2 (User Table & List View Parity Spec Miner).
Working directory: /Users/macos/ieee-smc-2027/.agents/teamwork/explorer_m1_2/

MANDATORY FIRST STEPS:
1. Read /Users/macos/ieee-smc-2027/.agents/teamwork/ORIGINAL_REQUEST.md.
2. Read /Users/macos/ieee-smc-2027/PROJECT.md.
3. Read reference material at /Users/macos/Documents/Projects/hcmute-website/hcmute-website-frontend/app/manage/users/page.tsx and its components.

MISSION:
Investigate and design the exact technical specification and code changes for upgrading the User Management list view in IEEE SMC 2027:
Target file: `src/app/admin/(dashboard)/users/page.tsx` and any supporting modal/table components.

Requirements for User List View Parity:
1. Status Column & Badges:
   - Match HCMUTE status indicators:
     - "ACTIVE" (or "1"): Badge with `ShieldCheck`, emerald theme.
     - "INACTIVE" (or "0"): Badge with `ShieldAlert` / `AlertTriangle`, amber theme.
     - "BLOCKED" / "SUSPENDED" (or "-1"): Badge with `ShieldX` / `XCircle`, rose/red theme.
2. Last Login Column:
   - Format: Date/time + IP address badge (e.g. `12/10/2026, 14:32 • 203.0.113.195`).
   - If not logged in yet: display clean fallback (e.g. "Chưa đăng nhập" / "Never").
3. Action Menu (`MoreHorizontal` dropdown):
   - Replace direct raw buttons with a polished `DropdownMenu` with `MoreHorizontal` trigger containing:
     - `Eye` View Profile: Links to `/admin/users/${user.id}`.
     - `Mail` Resend Invitation: Triggers invite/OTP resend.
     - `KeyRound` Reset Password: Opens reset password modal.
     - `LogOut` Revoke Sessions: Calls `/api/admin/users/${user.id}/revoke-sessions`.
     - `Lock` / `Unlock` Block/Unblock User: Toggles user status between `ACTIVE` and `BLOCKED`.
     - `Trash2` Delete User: Confirmation dialog with self-protection guard (disabled or hidden for current logged-in user).
4. Create User Dialog:
   - Form fields: Name, Email, Password, Role (`ADMIN` / `USER`), Conference Role, Affiliation, and a Switch component (`@radix-ui/react-switch`) for sending invite email.
5. Search & Filters:
   - Debounced search by name/email, faceted filters by Role and Status.

OUTPUT REQUIREMENTS:
- Produce concrete, production-ready code proposals in `/Users/macos/ieee-smc-2027/.agents/teamwork/explorer_m1_2/proposed_users_page.tsx` and `/Users/macos/ieee-smc-2027/.agents/teamwork/explorer_m1_2/handoff.md`.
- Zero sparkle icons (use Lucide icons like `ShieldCheck`, `ShieldAlert`, `ShieldX`, `MoreHorizontal`, `KeyRound`, `LogOut`, etc.).
- Clean layout without excessive English parenthetical subtitles.
- Send handoff message when complete.
