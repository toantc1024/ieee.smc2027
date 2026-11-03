# Empirical Adversarial Challenge Report: Milestone M1 (Auth & User Security)

**Agent**: Challenger M1-1 (API & Security Stress Challenger)  
**Roles**: critic, specialist  
**Working Directory**: `/Users/macos/ieee-smc-2027/.agents/teamwork/challenger_m1_1/`  
**Verdict**: **`REQUEST_CHANGES`**

---

## 1. Observation

Empirical testing was conducted against the live Next.js API server (`http://localhost:3099`) and core libraries using an automated adversarial stress suite in `tests/security/auth-adversarial.stress.ts`.

### 1.1 Verification Vector Results

| Vector | Expected Behavior | Actual Behavior Observed | Result |
|---|---|---|---|
| **V1. Session Revocation** | Incrementing `sessionVersion`, admin password reset, blocking, deactivation (`INACTIVE`), or deleting account rejects existing JWT tokens on `/api/auth/me` and `/api/profile`. | Tested all 5 cases. `/api/auth/me` returns `{ user: null }` and `/api/profile` returns `401 Unauthorized` immediately upon token presentation. | **PASS** ✔ |
| **V2. Client IP Extraction** | Extracts first IP from multi-hop `x-forwarded-for`, trims whitespace, maps `::1` / `::ffff:127.0.0.1` to `127.0.0.1`, clamps `User-Agent` to 255 chars, and respects fallback priority (`x-real-ip` > `cf-connecting-ip` > `127.0.0.1`). | All 5 test cases in `Adversarial Suite 1` passed with zero errors. | **PASS** ✔ |
| **V3. Self-Protection (Standard)** | Active admin cannot self-demote with `role: "USER"`, cannot self-block with `status: "BLOCKED"`, and cannot self-delete. | Returned `HTTP 400 Bad Request` with appropriate error messages (`ADV-SELF.1`, `ADV-SELF.2`, `ADV-SELF.3`, `ADV-SELF.6`). | **PASS** ✔ |
| **V4. Self-Protection (Adversarial)** | Active admin sending lowercase `status: "blocked"` or `status: "INACTIVE"` should be strictly rejected. | **VULNERABILITY REPRODUCED**: Endpoint returned `HTTP 200 OK`, updated PostgreSQL to `"BLOCKED"` or `"INACTIVE"`, and locked the admin out. | **FAIL** ✖ |
| **V5. Last-Admin Protection (Adversarial)** | Demoting last admin with lowercase `role: "user"` or deleting sole active admin when a blocked admin exists should be rejected. | **VULNERABILITY REPRODUCED**: Guard was bypassed with lowercase `role: "user"` (returned `HTTP 200 OK` and demoted to `Role.USER`). In `DELETE`, blocked admins are counted in `totalAdmins`. | **FAIL** ✖ |
| **V6. Profile Password Update** | Self-service password change on `PATCH /api/profile` should bump `sessionVersion` to invalidate old sessions on other devices. | **DEFECT REPRODUCED**: `sessionVersion` remained unchanged (`before: 1, after: 1`). Old sessions remain valid. | **FAIL** ✖ |

### 1.2 Verbatim Observations & Tool Command Outputs

#### Observation 1: Self-Block Bypass via Lowercase `status: "blocked"`
- **File**: `src/app/api/admin/users/[id]/route.ts`, lines 118-120:
  ```typescript
  // Safety Guard 2: Cannot block own active admin account
  if (currentAdmin && currentAdmin.id === targetUser.id && status && status === "BLOCKED") {
    return apiError("You cannot block your own active administrator account", 400);
  }
  ```
- **Tool execution command & output**:
  ```bash
  PATCH /api/admin/users/b15ac2c9-7c99-4674-967f-7ebf01a84679
  Body: { "status": "blocked" }
  Response: HTTP 200 OK
  Body: {"success":true,"user":{"id":"b15ac2c9-7c99-4674-967f-7ebf01a84679","role":"ADMIN","status":"BLOCKED",...}}
  ```
- Line 170 executes `status: status.toUpperCase()`, storing `"BLOCKED"` into the database, locking the admin out immediately.

#### Observation 2: Self-Deactivation Bypass via `status: "INACTIVE"`
- **File**: `src/app/api/admin/users/[id]/route.ts`, lines 118-120
- **Tool execution command & output**:
  ```bash
  PATCH /api/admin/users/96207480-88a3-44f7-a7af-c08c72645fbf
  Body: { "status": "INACTIVE" }
  Response: HTTP 200 OK
  Body: {"success":true,"user":{"id":"96207480-88a3-44f7-a7af-c08c72645fbf","status":"INACTIVE",...}}
  ```
- Subsequent session validation:
  ```bash
  GET /api/auth/me -> { "user": null }
  ```
- The active admin successfully self-deactivated because Guard 2 only checks `status === "BLOCKED"`. In `src/lib/auth.ts:269`, `dbUser.status === "INACTIVE"` immediately invalidates access.

#### Observation 3: Last-Admin Demotion Bypass via Lowercase `role: "user"`
- **File**: `src/app/api/admin/users/[id]/route.ts`, lines 123-130:
  ```typescript
  // Safety Guard 3: Cannot demote or block the last remaining active ADMIN account in DB
  if (targetUser.role === Role.ADMIN && (role === "USER" || status === "BLOCKED")) {
    const totalAdmins = await prisma.user.count({
      where: { role: Role.ADMIN, status: "ACTIVE" },
    });
    if (totalAdmins <= 1) {
      return apiError("Cannot downgrade or block the last remaining active ADMIN account in the database", 400);
    }
  }
  ```
- **Tool execution command & output**:
  ```bash
  PATCH /api/admin/users/00bd1a87-dd1c-47c3-9171-657987d4130c
  Body: { "role": "user" }
  Response: HTTP 200 OK
  Body: {"success":true,"user":{"id":"00bd1a87-dd1c-47c3-9171-657987d4130c","role":"USER","status":"ACTIVE",...}}
  ```
- Since `"user" === "USER"` evaluates to `false`, Safety Guard 3 is bypassed. Line 169 then evaluates `role === "ADMIN" ? Role.ADMIN : Role.USER`, setting `role: Role.USER` and leaving the platform without its active administrator.

#### Observation 4: `DELETE` Last-Admin Guard Counts Inactive & Blocked Admins
- **File**: `src/app/api/admin/users/[id]/route.ts`, lines 224-231:
  ```typescript
  // Safety Guard 2: Cannot delete the last remaining active ADMIN account
  if (targetUser.role === Role.ADMIN) {
    const totalAdmins = await prisma.user.count({
      where: { role: Role.ADMIN },
    });
    if (totalAdmins <= 1) {
      return apiError("Cannot delete the last remaining ADMIN account in the database", 400);
    }
  }
  ```
- `totalAdmins` query does NOT specify `status: "ACTIVE"`. In a database with 1 active admin and 1 blocked admin, `totalAdmins` equals 2, permitting the deletion of the sole active admin.

#### Observation 5: Self-Service Password Update Does Not Bump `sessionVersion`
- **File**: `src/app/api/profile/route.ts`, lines 128-150:
  ```typescript
  const updatedUser = await prisma.user.update({
    where: { id: current.id },
    data: {
      ...(typeof name === "string" && name.trim() ? { name: name.trim() } : {}),
      ...(avatar !== undefined ? { avatar } : {}),
      ...(updatedPasswordHash ? { passwordHash: updatedPasswordHash } : {}),
      profileData: mergedProfileData,
    },
  ```
- In contrast to `/api/admin/users/[id]/reset-password` (which increments `sessionVersion`), `src/app/api/profile/route.ts` does NOT increment `sessionVersion` when a user updates their password.
- **Empirical Evidence**: Tested in `ADV-PROF.4`: `sessionVersion` remained 1 before and after password update (`userAfter.sessionVersion === initialSessionVersion`).

---

## 2. Logic Chain

1. *Step 1 (Session Revocation & Tracking)*: Observation 1.1 confirms that `getCurrentUser()` in `src/lib/auth.ts` correctly verifies `dbUser.status` (`BLOCKED` or `INACTIVE`) and `dbUser.sessionVersion === sessionUser.sessionVersion`. Furthermore, `extractClientInfo` correctly parses proxies, cleans whitespace, and sanitizes User-Agent strings. These core foundation modules are functioning as specified.
2. *Step 2 (Self-Protection Holes)*: Observations 1 & 2 prove that Safety Guard 2 relies on an exact uppercase string match (`status === "BLOCKED"`). Because incoming values are only uppercased during the Prisma update statement (`status.toUpperCase()`), lowercase `"blocked"` and `"INACTIVE"` evade the check, yielding `HTTP 200` and immediately locking the administrator out.
3. *Step 3 (Last-Admin Demotion Holes)*: Observation 3 proves that Safety Guard 3 checks `role === "USER"` instead of a normalized role. Passing lowercase `role: "user"` bypasses the guard, allowing the last active admin to be demoted to `Role.USER`.
4. *Step 4 (Admin Count in DELETE)*: Observation 4 proves that the DELETE guard checks `where: { role: Role.ADMIN }` instead of `{ role: Role.ADMIN, status: "ACTIVE" }`. A stale or blocked admin account in the DB tricks the system into permitting the deletion of the only remaining functional admin.
5. *Step 5 (Profile Session Invalidation)*: Observation 5 proves that changing passwords via `PATCH /api/profile` does not invalidate existing tokens on other devices, creating a session hijacking window when an account credential has been compromised.

---

## 3. Caveats

- Rate limiting and brute force mitigations on `/api/auth/login-password` were not challenged at the application layer; per architecture, reverse proxy / Cloudflare handles L7 DDoS and burst rate limiting.
- Chinese delegate OTP SMS fallback was tested in development simulation mode (`EMAIL_DEV_MODE=true`).
- No changes to implementation code were made during this challenge; all tests are codified in `tests/security/auth-adversarial.stress.ts`.

---

## 4. Conclusion

**Verdict: `REQUEST_CHANGES`**

While the core JWT session revocation engine in `src/lib/auth.ts` is robust and IP extraction is accurate, **four security bypass vulnerabilities** in `src/app/api/admin/users/[id]/route.ts` and **one session invalidation omission** in `src/app/api/profile/route.ts` must be resolved:

1. **Fix VULN-M1-1 & VULN-M1-2 (Self-Protection Bypass)** in `src/app/api/admin/users/[id]/route.ts`:
   Normalize `status` upfront and block both `"BLOCKED"` and `"INACTIVE"`:
   ```typescript
   const normalizedStatus = status ? status.toUpperCase() : undefined;
   if (currentAdmin && currentAdmin.id === targetUser.id && normalizedStatus && (normalizedStatus === "BLOCKED" || normalizedStatus === "INACTIVE")) {
     return apiError("You cannot block or deactivate your own active administrator account", 400);
   }
   ```
2. **Fix VULN-M1-3 (Last-Admin Demotion Bypass)** in `src/app/api/admin/users/[id]/route.ts`:
   Normalize `role` and `status` upfront:
   ```typescript
   const normalizedRole = role ? (role.toUpperCase() === "ADMIN" ? Role.ADMIN : Role.USER) : undefined;
   if (targetUser.role === Role.ADMIN && (normalizedRole === Role.USER || normalizedStatus === "BLOCKED" || normalizedStatus === "INACTIVE")) {
     const totalAdmins = await prisma.user.count({
       where: { role: Role.ADMIN, status: "ACTIVE" },
     });
     if (totalAdmins <= 1) {
       return apiError("Cannot downgrade or deactivate the last remaining active ADMIN account in the database", 400);
     }
   }
   ```
3. **Fix VULN-M1-4 (Last-Admin Guard in DELETE)** in `src/app/api/admin/users/[id]/route.ts`:
   Filter by active status:
   ```typescript
   if (targetUser.role === Role.ADMIN) {
     const totalAdmins = await prisma.user.count({
       where: { role: Role.ADMIN, status: "ACTIVE" },
     });
     if (totalAdmins <= 1) {
       return apiError("Cannot delete the last remaining active ADMIN account in the database", 400);
     }
   }
   ```
4. **Fix DEFECT-M1-5 (Profile Password Session Invalidation)** in `src/app/api/profile/route.ts`:
   Increment `sessionVersion` when a user updates their password:
   ```typescript
   data: {
     ...(typeof name === "string" && name.trim() ? { name: name.trim() } : {}),
     ...(avatar !== undefined ? { avatar } : {}),
     ...(updatedPasswordHash ? { passwordHash: updatedPasswordHash, sessionVersion: { increment: 1 } } : {}),
     profileData: mergedProfileData,
   }
   ```

---

## 5. Verification Method

To independently verify these findings and execute the complete empirical stress test harness:

1. Ensure the Next.js dev server is running or spawn it on port 3099:
   ```bash
   pnpm run test:e2e -- --tier 2
   ```
2. Execute the dedicated adversarial stress suite:
   ```bash
   E2E_BASE_URL=http://localhost:3099 npx tsx --test tests/security/auth-adversarial.stress.ts
   ```
   **Output**: 22 tests across 5 suites confirming all defenses and empirical reproduction of the vulnerabilities.
3. Code inspection:
   - `src/app/api/admin/users/[id]/route.ts`: lines 113-130 and lines 224-231.
   - `src/app/api/profile/route.ts`: lines 128-150.
