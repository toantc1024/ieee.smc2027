# Specification & Integration Survey Report: User Management, Profile Management & Last Login Tracking

**Project**: IEEE SMC 2027 Conference Management Platform  
**Reference Project**: HCMUTE Website Frontend (`/Users/macos/Documents/Projects/hcmute-website/hcmute-website-frontend`)  
**Target Project**: IEEE SMC 2027 (`/Users/macos/ieee-smc-2027`)  
**Surveyed by**: Explorer Survey 3 (User & Profile Spec Miner)  
**Date**: 2026-11-02  
**Status**: Comprehensive Assessment Complete  

---

## Executive Summary

This survey establishes the complete technical specification for bringing **User Management**, **Profile Management**, and **Last Login Tracking** in IEEE SMC 2027 to full functional and aesthetic parity with the reference HCMUTE project.

While IEEE SMC 2027 already includes an initial administrative user table (`src/app/admin/(dashboard)/users/page.tsx`) and delegate profile API (`src/app/api/profile/route.ts`), it currently lacks:
1. An account status life-cycle (`Active`, `Blocked`, `Pending`) with visual badges and inline/modal toggle controls.
2. An individual user detail inspection page (`/admin/users/[id]`), which in the reference HCMUTE project is a comprehensive administrative view (`/manage/users/[id]`, 56KB) providing identity provider details, email verification toggle, password reset dialog, active sessions inspection, and danger zone controls.
3. An administrative profile management view (`/admin/profile`), mirroring HCMUTE's `/manage/profile` (10KB), wired directly to the greeting card in `AdminSidebar.tsx`.
4. Dedicated Last Login and session tracking (capturing client IP, device user agent, and timestamp upon every login vector: Google OAuth, Email OTP, and Password).

All visual assets (3D user icon `users__hcmute-3d-icon.png`, header background `manage-users-bg.jpg`, and sidebar greeting background `sidebar-greeting-bg.jpg`) already exist in the target project. The target project also features compatible Radix UI primitives and TanStack Table v8. Zero sparkle icons are used in the reference, adhering strictly to the user constraint.

---

## 1. Detailed Feature Inventory

### 1.1 User Management List & Table View
| Feature | Reference HCMUTE (`/manage/users`) | Current IEEE SMC 2027 (`/admin/users`) | Parity Gap & Target Specification |
|---|---|---|---|
| **Header Banner** | `ManagementPageHeader` with 3D icon (`users__hcmute-3d-icon.png`), title, description, and "Add User" action button | `ManagementPageHeader` present with blue background and title | Maintain layout; attach `users__hcmute-3d-icon.png` and `manage-users-bg.jpg` |
| **User Identification Column** | Avatar with initials fallback + Gradient background, Full Name, Email | Avatar with solid color fallback, Full Name, Email, "You" badge on active admin | Full parity; retain "You" active account badge |
| **Account Status Column** | Badges with custom icons: `ShieldCheck` (Active/`1`), `ShieldAlert` (Pending/`0`), `ShieldX` (Blocked/`-1`) | None (only role and conference track) | **GAP**: Add Status column with status badges and colors |
| **Role Assignment** | Inline dropdown `Select` allowing instant role/group update with inline spinner `Loader2` | Dropdown menu on role badge with quick change between Admin and User | Both support quick toggle; target additionally supports Conference Track (Speaker, Submitter, Attendee) |
| **Auth Provider Column** | `Badge variant="outline"` showing provider (`google`, `password`, `email_link`) | Provider badge (`google`, `email_link`) + "Password Set" badge | Parity exists |
| **Last Login Column** | Localized date and time from identity sessions (`Truy cập cuối: formatUnixMillis(...)`) | None (only `Joined Date` / `createdAt`) | **GAP**: Add `Last Login` column displaying formatted timestamp and relative time |
| **Created / Joined Date** | Calendar icon + short localized date (`Nov 2, 2026`) | Short formatted date (`Nov 2, 2026`) | Parity exists |
| **Row Actions Dropdown** | `MoreHorizontal` button with: View Profile (`Eye`), Resend Invitation (`Send`), Revoke Sessions (`LogOut`), Block/Unblock (`Lock`/`Unlock`), Delete User (`Trash2`) | Individual Edit and Delete action buttons | **GAP**: Adopt `MoreHorizontal` dropdown menu matching reference action set |

### 1.2 Search, Filtering & Batch Operations
| Control | Reference HCMUTE | Current IEEE SMC 2027 | Parity Assessment |
|---|---|---|---|
| **Debounced Search** | 350ms debounced input synced to URL params `search`, `fullName`, `email` | Client-side global filter input in `DataTable.tsx` with instant clear button | Compatible. Target can support both client filtering and server-side URL queries |
| **Status Filter** | Dropdown select filter (`All`, `Active`, `Blocked`, `Pending`) synced to URL | Faceted select filter in `DataTable.tsx` | Target `DataTable` supports faceted filter columns; needs Status filter configured |
| **Group / Role Filter** | Dropdown select filter for groups | Role and Conference Track faceted filters | Parity exists; add status filter option |
| **Applied Filter Badges** | Active filter chips with `X` button and "Reset All" button | "Reset" button when filters are active | Add filter badge tags above table |
| **Multi-Row Batch Selection** | TanStack Table row selection with batch delete dialog | TanStack Table row selection with batch delete button | Parity exists; target has active self-protection |

### 1.3 User Creation Modal (`CreateUserDialog`)
- **Header**: `DialogHeader` with gradient icon badge (`UserPlus` icon inside gradient circle), Title ("Add New User"), Description ("Pre-provision user account and assign initial conference role").
- **Fields**:
  - `Email`: Required input with `Mail` icon, format regex validation.
  - `Full Name`: Optional/Required input with `User` icon.
  - `Role`: Select dropdown (`ADMIN` / `USER`).
  - `Conference Track`: Select dropdown (`SUBMITTER`, `SPEAKER`, `ATTENDEE`).
  - `Send Invitation Email`: Accessible switch toggle with explanatory caption ("Automatically send an email notification with access link to the portal").
  - `Password` (optional): For initial credential setup.
- **Hierarchy Notice**: Warning banner informing that administrators cannot grant permissions exceeding their own rank.
- **Footer**: Cancel button (outline) + Submit button (primary gradient with `UserPlus` or spinning `Loader2`).

### 1.4 User Detail & Management Inspection Page (`/admin/users/[id]`)
In the reference project, clicking "View Profile" navigates to a dedicated page (`/manage/users/[id]`). This is completely absent in IEEE SMC 2027 and must be created:
- **Top Navigation**: Ghost back button (`ArrowLeft`) returning to `/admin/users`, refresh button (`RefreshCw`) with spinning state.
- **Profile Header Card**:
  - 24x24 Avatar with fallback initials.
  - Full Name, Status badge (`ShieldCheck` / `ShieldAlert` / `ShieldX`), Email address (`Mail` icon).
  - Role badges and Provider badge.
- **Left Panel (2/3 width)**:
  - *Card 1: Account Information*: Email address, Status selector (instant update), Provider, Provider ID, Joined Date.
  - *Card 2: Identity & Security*:
    - Login status (`CheckCircle2` / `XCircle`), Identity creation date.
    - Email Verified toggle switch.
    - Active Sessions Panel: Lists recent sessions, displaying client IP address (`Network` icon) and Last Access timestamp (`Truy cập cuối: formatDateTime(...)`).
    - Password Reset Button: Opens modal dialog to set new password with "Temporary password (must change on first login)" switch toggle.
- **Right Panel (1/3 width)**:
  - *Card 3: Role & Conference Assignment*: Dropdown to update role and conference track, registration count badge.
  - *Card 4: Danger Zone / Management Actions*:
    - "Resend Invitation" button (`Send` icon, blue theme).
    - "Revoke All Sessions" button (`LogOut` icon, amber theme).
    - "Block / Unblock User" button (`Lock` / `Unlock` icon, amber/green theme).
    - "Delete User" button (`Trash2` icon, destructive theme, disabled if targeting self or system admin).

---

## 2. Profile Management Views (`/admin/profile`)

The reference project provides `/manage/profile` (10KB) for authenticated administrators and staff to inspect and edit their own identity.

### 2.1 View Structure
1. **Page Header**:
   - Title: "Hồ sơ cá nhân" / "Admin Profile"
   - Subtitle: "Quản lý thông tin cá nhân và cài đặt tài khoản" / "Manage your personal information and account settings"
   - Action: Logout button (`Button variant="outline"` with `LogOut` icon and destructive styling).
2. **Left Panel: Personal Information Card**:
   - Avatar section: Size 24 avatar with initials fallback and "Change Avatar" button (triggers file selection or modal upload).
   - Display name and email caption.
   - Form fields:
     - `First Name` & `Last Name` (or `Full Name`).
     - `Email`: Disabled input with explanation ("Email is managed by Google OAuth / Conference credentials").
     - `Bio`: Textarea for biography or conference affiliation details.
   - Action: "Save Changes" button (`Save` icon with spinner `ButtonLoader`).
3. **Right Panel: Role, Account Info & Security Cards**:
   - *Card 1: Role & Permissions (`Shield` icon)*: Badges showing user role (`ADMIN` / `USER`) and Conference Track (`SPEAKER` / `SUBMITTER` / `ATTENDEE`).
   - *Card 2: Account Details (`Calendar` icon)*:
     - Display name.
     - Joined date (formatted).
     - Last login timestamp and IP address.
   - *Card 3: Security & Session (`Key` icon)*:
     - Password update button (for password-based accounts).
     - Google OAuth indicator (for SSO accounts).
     - Logout button (`variant="destructive"`).

### 2.2 Sidebar Greeting Card Integration
In `src/app/admin/(dashboard)/components/AdminSidebar.tsx`:
- Currently, lines 292–353 render the greeting card as a static `div` with `cursor-default`.
- In HCMUTE (`app/components/admin-layout/user-sidebar.tsx:480`), this greeting card is a `<Link href="/admin/profile">` that highlights when the current path is `/admin/profile`.
- Integrating `/admin/profile` and wrapping the greeting card in a Next.js `Link` achieves 1:1 behavioral alignment with the reference project.

---

## 3. Last Login Tracking Implementation

### 3.1 Reference Mechanism
In the reference HCMUTE project:
1. Active sessions are captured through identity provider sessions (`UserKeycloakSessionView`):
   - `id`: Session UUID.
   - `ipAddress`: Remote client IP address.
   - `start`: Unix timestamp ms when session was established.
   - `lastAccess`: Unix timestamp ms of the most recent request.
   - `clients`: Applications accessed.
2. Display format:
   - Evaluated using `formatDateTime(new Date(timestamp).toISOString())` or `formatUnixMillis(session.lastAccess)`:
     ```typescript
     function formatDateTime(dateString?: string) {
       if (!dateString) return "Chưa đăng nhập";
       const date = new Date(dateString);
       if (isNaN(date.getTime())) return "—";
       return date.toLocaleDateString("vi-VN", {
         year: "numeric",
         month: "long",
         day: "numeric",
         hour: "2-digit",
         minute: "2-digit",
       });
     }
     ```
3. Session Revocation:
   - Triggered via `POST /api/v1/admin/users/${userId}/revoke-sessions`, instantly terminating active tokens.

### 3.2 IEEE SMC 2027 Integration Strategy
In IEEE SMC 2027:
1. **Database Schema**:
   Add dedicated fields to the `User` model in `prisma/schema.prisma`:
   ```prisma
   enum UserStatus {
     ACTIVE
     BLOCKED
     PENDING
   }

   model User {
     // ... existing fields ...
     status          UserStatus     @default(ACTIVE)
     lastLoginAt     DateTime?      @map("last_login_at")
     lastLoginIp     String?        @map("last_login_ip")
     lastLoginDevice String?        @map("last_login_device")
     sessionVersion  Int            @default(1) @map("session_version")
   }
   ```
   *Note: `sessionVersion` enables instant revocation of all existing JWTs by incrementing the version integer upon calling `revoke-sessions`.*

2. **Capture Points in Auth Handlers**:
   Extract client IP and user agent in all 3 auth endpoints:
   - `src/app/api/auth/login-password/route.ts`
   - `src/app/api/auth/otp/verify/route.ts`
   - `src/app/api/auth/callback/google/route.ts`
   ```typescript
   const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
              req.headers.get("x-real-ip") || "127.0.0.1";
   const device = req.headers.get("user-agent") || "Unknown Device";

   await prisma.user.update({
     where: { id: user.id },
     data: {
       lastLoginAt: new Date(),
       lastLoginIp: ip,
       lastLoginDevice: device,
     },
   });
   ```

3. **Display Formatting**:
   - User Table: Format as `"Nov 2, 2026 15:30"` or `"Chưa đăng nhập"` (Never logged in).
   - User Detail Page: Render IP address with `Network` icon and Last Access time.
   - Profile Page: Render in Account Information card under "Lần đăng nhập gần nhất" / "Last Login".

---

## 4. UI Controls, Button Layout & Modals

### 4.1 UI Controls & Button Taxonomy
| UI Control Area | Reference Standard | Button Style / Variant | Icon |
|---|---|---|---|
| **Page Header Action** | Top-right of `ManagementPageHeader` | `bg-white/10 hover:bg-white/20 text-white border border-white/20` | `UserPlus` |
| **Search Bar** | Left of toolbar, debounced with clear `X` | Clean input with `Search` left icon | `Search`, `X` |
| **Faceted Filters** | Toolbar center, select dropdowns | `Select` trigger, clean border | `Filter`, `ChevronDown` |
| **Reset Filters** | Appears when active filters exist | `Button variant="ghost" size="sm"` | `X` or `RotateCcw` |
| **Batch Action Bar** | Appears when rows are checked | Slate badge with count + `Button variant="destructive" size="sm"` | `Trash2` |
| **Table Actions Dropdown** | Last column of each row | `Button variant="ghost" size="icon"` | `MoreHorizontal` |
| **Detail Back Button** | Top-left of user detail page | `Button variant="ghost"` | `ArrowLeft` |
| **Detail Refresh Button** | Top-right of user detail header | `Button variant="outline"` | `RefreshCw` |
| **Status Toggle Dropdown** | Inline on detail card | `Select` with status color badges | `ShieldCheck`, `ShieldX`, `ShieldAlert` |
| **Management Actions** | Danger zone card on detail page | Outlined buttons with colored accents (blue, amber, red) | `Send`, `LogOut`, `Lock`, `Unlock`, `Trash2` |
| **Profile Save Button** | Bottom-right of personal info form | `Button variant="default"` | `Save` |
| **Profile Logout Button** | Top-right of profile header & security card | `Button variant="outline" text-destructive` | `LogOut` |

### 4.2 Modal Dialogs
1. **Create User Modal (`CreateUserModal`)**:
   - Title: "Thêm người dùng mới" / "Add New User"
   - Body: Email, Full Name, Role select, Conference Track select, Invitation switch toggle.
   - Footer: "Hủy" / "Cancel" (outline), "Khởi tạo người dùng" / "Create User" (primary with spinner).
2. **Password Reset Modal**:
   - Title: "Đặt lại mật khẩu" / "Reset Password"
   - Body: New password input, "Temporary password (must change on first login)" switch toggle.
   - Footer: "Cancel", "Confirm Reset".
3. **Action Confirmation Alert Dialog (`AlertDialog`)**:
   - Reusable for Block, Unblock, Resend Invitation, Revoke Sessions, and Delete User.
   - Content: Explanatory confirmation text with destructive or warning color highlights.

---

## 5. Dependencies & Packages Assessment

| Package | Status in Reference | Status in IEEE SMC 2027 | Assessment & Action Required |
|---|---|---|---|
| `@tanstack/react-table` | `^8.21.2` | `^8.21.3` (Installed) | Ready to use |
| `@radix-ui/react-dialog` | `^1.1.1` | `^1.3.1` (Installed) | Ready to use |
| `@radix-ui/react-alert-dialog` | `^1.1.1` | `^1.2.1` (Installed) | Ready to use |
| `@radix-ui/react-dropdown-menu` | `^2.1.1` | `^2.2.1` (Installed) | Ready to use |
| `@radix-ui/react-select` | `^2.1.1` | `^2.4.1` (Installed) | Ready to use |
| `@radix-ui/react-avatar` | `^1.1.0` | `^1.3.1` (Installed) | Ready to use |
| `@radix-ui/react-switch` | `^1.1.0` | **Missing** | **Action**: Install `@radix-ui/react-switch` or provide standard switch component in `src/components/ui/switch.tsx` |
| `lucide-react` | `^0.441.0` | `^1.41.0` (Installed) | Ready to use |
| `motion` | `motion/react` | `^13.4.4` (Installed) | Ready to use |
| `sonner` | `^1.5.0` | `^2.0.8` (Installed) | Ready to use |
| `jose` | `^5.6.3` | `^6.2.12` (Installed) | Ready to use |
| `prisma` | N/A (Spring Boot) | `^6.4.1` (Installed) | Ready to use for schema extensions |
| `zustand` | Used in reference for profile cache | Not present in target | Target uses server components / React state; no need to add zustand |

---

## 6. Routing & Page Endpoints Mapping

| View / Function | Reference Endpoint (HCMUTE) | Target Endpoint (IEEE SMC 2027) | Status & Implementation Scope |
|---|---|---|---|
| **User Management List** | `/manage/users` | `/admin/users` | **Exists**: Enhance table columns (Status, Last Login, Actions dropdown) and filters |
| **User Detail Inspection** | `/manage/users/[id]` | `/admin/users/[id]` | **New**: Create `src/app/admin/(dashboard)/users/[id]/page.tsx` with full 2-column inspection layout |
| **Profile Management** | `/manage/profile` | `/admin/profile` | **New**: Create `src/app/admin/(dashboard)/profile/page.tsx` with personal info, security, and avatar |
| **Sidebar Profile Link** | `/manage/profile` | `/admin/profile` | **Update**: Wire greeting card in `AdminSidebar.tsx` to `<Link href="/admin/profile">` |
| **Delegate Portal Profile** | `/portal` | `/portal` | **Exists**: Self-service conference badge and JSON registration data |

---

## 7. API & Data Contracts

### 7.1 Existing vs Required Endpoints
| HTTP Method | Route | Purpose | Current Target State | Required Adjustments |
|---|---|---|---|---|
| `GET` | `/api/admin/users` | Retrieve paginated user list | Returns all users `{ users: [...] }` | Add query params: `search`, `status`, `role`, `page`, `limit` |
| `POST` | `/api/admin/users` | Pre-create user account | Creates user | Support `sendInviteEmail` flag and `status` |
| `GET` | `/api/admin/users/[id]` | Retrieve user detail record | Missing (only PATCH/DELETE) | **Add GET handler** returning user, session list, login tracking |
| `PATCH` | `/api/admin/users/[id]` | Update user role, status, profile | Exists (PATCH name, role, avatar) | Support `status: "ACTIVE" \| "BLOCKED" \| "PENDING"` |
| `DELETE` | `/api/admin/users/[id]` | Safe delete user | Exists with self-protection | Parity verified |
| `POST` | `/api/admin/users/[id]/resend-invitation` | Trigger invitation email | Missing | **Add POST handler** calling email template broadcast |
| `POST` | `/api/admin/users/[id]/revoke-sessions` | Revoke active user sessions | Missing | **Add POST handler** incrementing `sessionVersion` |
| `GET` | `/api/profile` | Load current user profile | Exists (returns user + registrations) | Compatible |
| `PATCH` | `/api/profile` | Update current user profile | Exists (updates name, avatar, bio) | Compatible |

### 7.2 Session Revocation & Verification Protocol
To support instant session revocation without heavy database lookups on every request:
1. `User` table holds `sessionVersion: Int @default(1)`.
2. Session JWT payload includes `sessionVersion: user.sessionVersion`.
3. In `getCurrentUser()` (`src/lib/auth.ts:185`), compare `token.sessionVersion === dbUser.sessionVersion`. If mismatched, treat session as revoked (`return null`).
4. Calling `/api/admin/users/[id]/revoke-sessions` executes:
   ```typescript
   await prisma.user.update({
     where: { id },
     data: { sessionVersion: { increment: 1 } },
   });
   ```

---

## 8. Migration & Integration Plan

The implementation should be carried out systematically in 6 logical steps:

### Phase 1: Database Schema & Migration
1. Update `prisma/schema.prisma`:
   - Add `UserStatus` enum (`ACTIVE`, `BLOCKED`, `PENDING`).
   - Add `status UserStatus @default(ACTIVE)`.
   - Add `lastLoginAt DateTime? @map("last_login_at")`.
   - Add `lastLoginIp String? @map("last_login_ip")`.
   - Add `lastLoginDevice String? @map("last_login_device")`.
   - Add `sessionVersion Int @default(1) @map("session_version")`.
2. Run `pnpm prisma db push` or migration.

### Phase 2: Auth Flow Last Login Capture & Session Revocation
1. Modify `src/app/api/auth/login-password/route.ts`, `src/app/api/auth/otp/verify/route.ts`, and `src/app/api/auth/callback/google/route.ts` to record `lastLoginAt`, `lastLoginIp`, and `lastLoginDevice` on sign-in.
2. Include `sessionVersion` in `createSessionToken()`.
3. Validate `sessionVersion` in `getCurrentUser()`.

### Phase 3: API Endpoint Extensions
1. Add `GET /api/admin/users/[id]` returning comprehensive user profile, registration records, and session tracking.
2. Add `POST /api/admin/users/[id]/resend-invitation`.
3. Add `POST /api/admin/users/[id]/revoke-sessions`.
4. Update `GET /api/admin/users` to return `status`, `lastLoginAt`, `lastLoginIp`.

### Phase 4: User Detail Inspection Page (`/admin/users/[id]`)
1. Create `src/app/admin/(dashboard)/users/[id]/page.tsx` adhering to Next.js 16 (`const { id } = await params;` or `useParams()`).
2. Build 2-column layout matching reference controls:
   - Header profile banner.
   - Account info & status dropdown.
   - Active session tracking panel (IP, Last Access).
   - Password reset dialog.
   - Management action buttons (Resend invite, Revoke sessions, Block/Unblock, Delete).

### Phase 5: Profile Management Page (`/admin/profile`)
1. Create `src/app/admin/(dashboard)/profile/page.tsx`:
   - Personal info form (avatar, name, email, bio).
   - Role badges & account details (joined date, last login).
   - Password change modal (for password-based accounts).
2. Wire greeting card in `src/app/admin/(dashboard)/components/AdminSidebar.tsx` to `<Link href="/admin/profile">`.
3. Add breadcrumb handling in `AdminHeader.tsx`.

### Phase 6: User Management Table (`/admin/users`) Enhancement
1. Create `src/components/ui/switch.tsx` (using `@radix-ui/react-switch`).
2. Update `CreateUserModal.tsx` to include `Switch` for "Send invitation email" matching reference `create-user-dialog.tsx`.
3. Update table columns in `src/app/admin/(dashboard)/users/page.tsx`:
   - Add `Status` column with `ShieldCheck`/`ShieldAlert`/`ShieldX`.
   - Add `Last Login` column with formatted date/relative time.
   - Add `MoreHorizontal` dropdown actions replacing individual buttons.

---

## Icon & Text Cleanliness Compliance Checklist

- [x] **No Sparkle Icon**: Verified that neither HCMUTE reference user modules nor IEEE SMC 2027 use `Sparkles` icon. Prohibited in all new components.
- [x] **No Subtitle English Parentheses**: Text labels must be clean English or Vietnamese without redundant `(English)` parentheses (e.g. use `Users`, not `Người dùng (Users)`).
- [x] **Next.js 16 Compliance**: `params` and `searchParams` handled asynchronously in server components; client components use `useParams()` and `useSearchParams()`.
- [x] **Zero Source Code Modifications**: Completed in read-only investigation mode.
