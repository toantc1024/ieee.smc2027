# Auth & User Security Guards Investigation Report (Milestone M1-R2)

**Explorer**: Explorer M1-R2-1 (Auth & User Security Guards Explorer)  
**Roles**: Security Analyst, Code Investigator, Report Synthesizer  
**Target Files**:
- `src/app/api/admin/users/[id]/route.ts`
- `src/app/api/profile/route.ts`
- `src/lib/auth.ts`
- `src/app/api/admin/users/route.ts`
- `tests/security/auth-adversarial.stress.ts`

**Core Finding**:
Direct inspection of `src/app/api/admin/users/[id]/route.ts` and `src/app/api/profile/route.ts` confirmed four security bypass vulnerabilities and one session retention flaw: casing bypass on self-block and last-admin demotion, omission of `INACTIVE` account status in guards and session version increments, counting blocked admins in the DELETE last-admin check, and lack of session version invalidation/cookie refresh during self-service password changes.

---

## 1. Observation

### 1.1 Direct File Observations

#### Observation 1: Case Sensitivity and Bypass in Safety Guards 1, 2, and 3
- **File**: `src/app/api/admin/users/[id]/route.ts` lines 94-130 and lines 166-170
- **Verbatim Code**:
  ```typescript
  // Lines 113-130:
  // Safety Guard 1: Cannot demote own active admin account
  if (currentAdmin && currentAdmin.id === targetUser.id && role && role !== "ADMIN") {
    return apiError("You cannot downgrade your own active administrator account", 400);
  }

  // Safety Guard 2: Cannot block own active admin account
  if (currentAdmin && currentAdmin.id === targetUser.id && status && status === "BLOCKED") {
    return apiError("You cannot block your own active administrator account", 400);
  }

  // Safety Guard 3: Cannot demote or block the last remaining active ADMIN account in DB
  if (targetUser.role === Role.ADMIN && (role === "USER" || status === "BLOCKED")) {
    const totalAdmins = await prisma.user.count({
      where: { role: Role.ADMIN, status: "ACTIVE" },
    });
    if (totalAdmins <= 1) {
      return apiError("Cannot downgrade or block the last remaining active ADMIN account in the database", 400);
    }
  }

  // Lines 166-170:
  const updated = await prisma.user.update({
    where: { id },
    data: {
      ...(role ? { role: role === "ADMIN" ? Role.ADMIN : Role.USER } : {}),
      ...(status ? { status: status.toUpperCase() } : {}),
  ```
- **Observed Behavior**:
  - In Guard 2, when an active administrator sends `{ status: "blocked" }` (lowercase), `status === "BLOCKED"` evaluates to `false` because `"blocked" !== "BLOCKED"`. The guard passes. Line 170 then evaluates `status.toUpperCase()`, storing `"BLOCKED"` in PostgreSQL. The administrator is immediately locked out.
  - In Guard 3, when a caller demotes the last remaining active administrator using `{ role: "user" }`, `role === "USER"` evaluates to `false` because `"user" !== "USER"`. The guard passes without querying `prisma.user.count`. Line 169 evaluates `role === "ADMIN" ? Role.ADMIN : Role.USER` which produces `Role.USER`, demoting the last active administrator.
  - In Guard 1, if an administrator sends `{ role: "admin" }` (lowercase), `role !== "ADMIN"` evaluates to `true` (`"admin" !== "ADMIN"`), causing a false-positive rejection of a legitimate update.

#### Observation 2: Safety Guards 2 & 3 Omit Account Deactivation (`INACTIVE`)
- **File**: `src/lib/auth.ts` lines 268-271 vs. `src/app/api/admin/users/[id]/route.ts` lines 117-130
- **Verbatim Code (`src/lib/auth.ts`)**:
  ```typescript
  // Revocation Bug Fix 2: User blocked or inactive -> session is immediately invalidated
  if (dbUser.status === "BLOCKED" || dbUser.status === "INACTIVE") {
    return null;
  }
  ```
- **Observed Behavior**:
  - `getCurrentUser()` in `src/lib/auth.ts` treats `INACTIVE` identically to `BLOCKED`, revoking session validity immediately.
  - Safety Guard 2 in `src/app/api/admin/users/[id]/route.ts` only checked `status === "BLOCKED"`. Passing `{ status: "INACTIVE" }` or `{ status: "inactive" }` bypasses Guard 2 and allows an admin to deactivate their own active account, immediately bricking access.
  - Safety Guard 3 only checked `status === "BLOCKED"`. Deactivating the last active administrator via `{ status: "INACTIVE" }` bypasses Guard 3, leaving zero active administrators.

#### Observation 3: DELETE Endpoint Counts Inactive & Blocked Admins
- **File**: `src/app/api/admin/users/[id]/route.ts` lines 223-231
- **Verbatim Code**:
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
- **Observed Behavior**:
  - In PATCH (line 125), `totalAdmins` queries `{ role: Role.ADMIN, status: "ACTIVE" }`.
  - In DELETE (line 225), `totalAdmins` queries `{ role: Role.ADMIN }` without filtering by status.
  - In a system with 1 active administrator and 1 blocked administrator, `totalAdmins` is 2. The guard does not trigger, permitting deletion of the sole active administrator.

#### Observation 4: Self-Service Profile Password Change Omits Session Invalidation and Cookie Refresh
- **File**: `src/app/api/profile/route.ts` lines 97-154
- **Verbatim Code**:
  ```typescript
  let updatedPasswordHash: string | undefined;
  if (newPassword) {
    if (!currentPassword) {
      return apiError("Current password is required to change password", 400);
    }
    if (!current.passwordHash || !verifyPassword(currentPassword, current.passwordHash)) {
      return apiError("Current password is incorrect", 400);
    }
    if (typeof newPassword !== "string" || newPassword.trim().length < 6) {
      return apiError("New password must be at least 6 characters long", 400);
    }
    updatedPasswordHash = hashPassword(newPassword.trim());
  }
  ...
  const updatedUser = await prisma.user.update({
    where: { id: current.id },
    data: {
      ...(typeof name === "string" && name.trim() ? { name: name.trim() } : {}),
      ...(avatar !== undefined ? { avatar } : {}),
      ...(updatedPasswordHash ? { passwordHash: updatedPasswordHash } : {}),
      profileData: mergedProfileData,
    },
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
      role: true,
      status: true,
      provider: true,
      lastLoginAt: true,
      lastLoginIp: true,
      lastLoginDevice: true,
      profileData: true,
      updatedAt: true,
    },
  });

  return apiSuccess({
    user: updatedUser,
  });
  ```
- **Observed Behavior**:
  - `sessionVersion` is not incremented when `updatedPasswordHash` is set.
  - Active sessions on other devices remain valid until token expiry (up to 7 days).
  - Merely bumping `sessionVersion: { increment: 1 }` without calling `attachSessionCookie` would invalidate the caller's own session immediately upon their next request, because the caller's cookie holds the old `sessionVersion`.

#### Observation 5: Status Change to `INACTIVE` Missing `sessionVersion` Increment
- **File**: `src/app/api/admin/users/[id]/route.ts` line 164
- **Verbatim Code**:
  ```typescript
  // If blocking user, automatically bump sessionVersion to revoke existing sessions immediately
  const sessionVersionIncrement = status === "BLOCKED" ? { sessionVersion: { increment: 1 } } : {};
  ```
- **Observed Behavior**:
  - Changing status to `INACTIVE` (or passing lowercase `"blocked"`) leaves `sessionVersionIncrement` empty (`{}`).
  - While `getCurrentUser()` returns `null` for `status === "INACTIVE"`, failure to bump `sessionVersion` means that if the user's status is subsequently restored to `ACTIVE`, previously leaked or existing JWT tokens will immediately regain valid access.

---

## 2. Logic Chain

1. **Premise 1 (Input Normalization Precedes Validation)**:
   - Security guards that inspect unnormalized user input (`role`, `status`) are susceptible to string casing and whitespace bypasses.
   - Normalizing `role` to `Role.ADMIN | Role.USER | undefined` and `status` to `string.toUpperCase().trim()` before any guard evaluation guarantees uniform evaluation across all branches.

2. **Premise 2 (Consistency Between Guard Rules and Authentication Enforcement)**:
   - `src/lib/auth.ts:269` enforces: `if (dbUser.status === "BLOCKED" || dbUser.status === "INACTIVE") return null;`
   - Therefore, any status transition away from `"ACTIVE"` terminates administrative session rights.
   - Guard 2 (self-lockout) and Guard 3 (last-admin protection) must prohibit any transition away from `"ACTIVE"` (`normalizedStatus !== "ACTIVE"`, or specifically `"BLOCKED"` and `"INACTIVE"`).

3. **Premise 3 (Accurate Accounting of Functional Administrators)**:
   - A disabled or blocked administrator cannot authenticate or perform administrative actions.
   - Therefore, counting administrators to protect system availability must always filter for `{ role: Role.ADMIN, status: "ACTIVE" }` in both `PATCH` and `DELETE`.

4. **Premise 4 (Atomic Credential Invalidation with Continuity of Active Session)**:
   - Changing a password must revoke all other concurrent sessions across all devices (`sessionVersion: { increment: 1 }`).
   - To maintain session continuity for the user executing the change, the server must issue an updated session token containing the new `sessionVersion` and attach it via `attachSessionCookie(response, newToken)`.

5. **Premise 5 (Defense-in-Depth for Account Status Changes)**:
   - Setting a user's status away from `ACTIVE` represents an administrative suspension.
   - Bumping `sessionVersion: { increment: 1 }` during this transition ensures cryptographic invalidation of outstanding tokens, preventing replay even if the account is later reactivated.

---

## 3. Recommended Code Changes

### Recommendation 1: `src/app/api/admin/users/[id]/route.ts`
Implement input normalization, extend Guards 2 & 3, fix the DELETE query, and ensure `sessionVersion` increment on non-active status.

```diff
--- a/src/app/api/admin/users/[id]/route.ts
+++ b/src/app/api/admin/users/[id]/route.ts
@@ -107,24 +107,39 @@ export async function PATCH(
     const targetUser = await prisma.user.findUnique({ where: { id } });
     if (!targetUser) {
       return apiError("User not found", 404);
     }
 
+    // Normalize role and status before any safety guards
+    const normalizedRole: Role | undefined =
+      typeof role === "string" && role.trim()
+        ? role.trim().toUpperCase() === "ADMIN"
+          ? Role.ADMIN
+          : Role.USER
+        : undefined;
+
+    const normalizedStatus: string | undefined =
+      typeof status === "string" && status.trim()
+        ? status.trim().toUpperCase()
+        : undefined;
+
     // Safety Guard 1: Cannot demote own active admin account
-    if (currentAdmin && currentAdmin.id === targetUser.id && role && role !== "ADMIN") {
+    if (currentAdmin && currentAdmin.id === targetUser.id && normalizedRole && normalizedRole !== Role.ADMIN) {
       return apiError("You cannot downgrade your own active administrator account", 400);
     }
 
-    // Safety Guard 2: Cannot block own active admin account
-    if (currentAdmin && currentAdmin.id === targetUser.id && status && status === "BLOCKED") {
-      return apiError("You cannot block your own active administrator account", 400);
+    // Safety Guard 2: Cannot deactivate or block own active admin account
+    if (currentAdmin && currentAdmin.id === targetUser.id && normalizedStatus && normalizedStatus !== "ACTIVE") {
+      return apiError("You cannot deactivate or block your own active administrator account", 400);
     }
 
-    // Safety Guard 3: Cannot demote or block the last remaining active ADMIN account in DB
-    if (targetUser.role === Role.ADMIN && (role === "USER" || status === "BLOCKED")) {
-      const totalAdmins = await prisma.user.count({
+    // Safety Guard 3: Cannot demote, deactivate, or block the last remaining active ADMIN account in DB
+    if (
+      targetUser.role === Role.ADMIN &&
+      targetUser.status === "ACTIVE" &&
+      (normalizedRole === Role.USER || (normalizedStatus && normalizedStatus !== "ACTIVE"))
+    ) {
+      const totalActiveAdmins = await prisma.user.count({
         where: { role: Role.ADMIN, status: "ACTIVE" },
       });
-      if (totalAdmins <= 1) {
-        return apiError("Cannot downgrade or block the last remaining active ADMIN account in the database", 400);
+      if (totalActiveAdmins <= 1) {
+        return apiError("Cannot downgrade, deactivate, or block the last remaining active ADMIN account in the database", 400);
       }
     }
@@ -163,12 +178,14 @@ export async function PATCH(
     // If blocking user, automatically bump sessionVersion to revoke existing sessions immediately
-    const sessionVersionIncrement = status === "BLOCKED" ? { sessionVersion: { increment: 1 } } : {};
+    const sessionVersionIncrement =
+      normalizedStatus && normalizedStatus !== "ACTIVE"
+        ? { sessionVersion: { increment: 1 } }
+        : {};
 
     const updated = await prisma.user.update({
       where: { id },
       data: {
-        ...(role ? { role: role === "ADMIN" ? Role.ADMIN : Role.USER } : {}),
-        ...(status ? { status: status.toUpperCase() } : {}),
+        ...(normalizedRole ? { role: normalizedRole } : {}),
+        ...(normalizedStatus ? { status: normalizedStatus } : {}),
         ...(typeof name === "string" && name.trim() ? { name: name.trim() } : {}),
         ...(email ? { email: normalizeEmail(email) } : {}),
         ...(avatar !== undefined ? { avatar } : {}),
@@ -223,8 +240,8 @@ export async function DELETE(
     // Safety Guard 2: Cannot delete the last remaining active ADMIN account
-    if (targetUser.role === Role.ADMIN) {
-      const totalAdmins = await prisma.user.count({
-        where: { role: Role.ADMIN },
+    if (targetUser.role === Role.ADMIN && targetUser.status === "ACTIVE") {
+      const totalActiveAdmins = await prisma.user.count({
+        where: { role: Role.ADMIN, status: "ACTIVE" },
       });
-      if (totalAdmins <= 1) {
-        return apiError("Cannot delete the last remaining ADMIN account in the database", 400);
+      if (totalActiveAdmins <= 1) {
+        return apiError("Cannot delete the last remaining active ADMIN account in the database", 400);
       }
     }
```

---

### Recommendation 2: `src/app/api/profile/route.ts`
Add `sessionVersion` increment on password change, generate a new JWT with the bumped version, and attach it to the response via `attachSessionCookie`.

```diff
--- a/src/app/api/profile/route.ts
+++ b/src/app/api/profile/route.ts
@@ -2,6 +2,8 @@ import { NextRequest } from "next/server";
 import { Prisma } from "@prisma/client";
 import {
   getCurrentUser,
+  createSessionToken,
+  attachSessionCookie,
   prisma,
   hashPassword,
   verifyPassword,
@@ -130,8 +132,13 @@ export async function PATCH(request: NextRequest) {
       where: { id: current.id },
       data: {
         ...(typeof name === "string" && name.trim() ? { name: name.trim() } : {}),
         ...(avatar !== undefined ? { avatar } : {}),
-        ...(updatedPasswordHash ? { passwordHash: updatedPasswordHash } : {}),
+        ...(updatedPasswordHash
+          ? {
+              passwordHash: updatedPasswordHash,
+              sessionVersion: { increment: 1 },
+            }
+          : {}),
         profileData: mergedProfileData,
       },
       select: {
@@ -143,6 +150,7 @@ export async function PATCH(request: NextRequest) {
         status: true,
         provider: true,
+        sessionVersion: true,
         lastLoginAt: true,
         lastLoginIp: true,
         lastLoginDevice: true,
@@ -151,9 +159,28 @@ export async function PATCH(request: NextRequest) {
       },
     });
 
-    return apiSuccess({
+    let response = apiSuccess({
       user: updatedUser,
     });
+
+    // When password is changed, refresh session cookie with incremented sessionVersion
+    // so the current user stays logged in while all other concurrent sessions are invalidated
+    if (updatedPasswordHash) {
+      const newSessionToken = await createSessionToken({
+        id: updatedUser.id,
+        email: updatedUser.email,
+        name: updatedUser.name,
+        avatar: updatedUser.avatar,
+        role: updatedUser.role as "ADMIN" | "USER",
+        status: updatedUser.status,
+        provider: updatedUser.provider,
+        sessionVersion: updatedUser.sessionVersion,
+        profileData:
+          updatedUser.profileData && typeof updatedUser.profileData === "object"
+            ? (updatedUser.profileData as Record<string, unknown>)
+            : {},
+      });
+      response = attachSessionCookie(response, newSessionToken);
+    }
+
+    return response;
```

---

### Recommendation 3: `src/app/api/admin/users/route.ts` (Null-Byte Sanitization)
Prevent PostgreSQL 22021 unhandled crashes on raw null bytes (`\0`) in search queries:

```diff
--- a/src/app/api/admin/users/route.ts
+++ b/src/app/api/admin/users/route.ts
@@ -34,3 +34,4 @@ export async function GET(request: NextRequest) {
-    if (search.trim()) {
-      const term = search.trim();
+    const cleanSearch = search.replace(/\0/g, "").trim();
+    if (cleanSearch) {
+      const term = cleanSearch;
       where.OR = [
```

---

### Recommendation 4: `tests/security/auth-adversarial.stress.ts` Test Adjustments
Update the tests that previously asserted vulnerability reproduction (`ADV-SELF.4`, `ADV-SELF.5`, `ADV-LAST.2`, `ADV-LAST.3`, `ADV-PROF.4`) to assert that the defenses properly reject or enforce security invariants:

1. **`ADV-SELF.4`**:
   ```typescript
   // Send lowercase "blocked"
   const res = await client.patch(`/api/admin/users/${id}`, { status: "blocked" });
   assert.strictEqual(res.status, 400, "Lowercase 'blocked' must be rejected with HTTP 400");
   assert.ok(res.text.includes("block") || res.text.includes("administrator"));
   const inDb = await prisma.user.findUnique({ where: { id } });
   assert.strictEqual(inDb?.status, "ACTIVE");
   ```
2. **`ADV-SELF.5`**:
   ```typescript
   // Send status: "INACTIVE"
   const res = await client.patch(`/api/admin/users/${id}`, { status: "INACTIVE" });
   assert.strictEqual(res.status, 400, "Self-deactivation must be rejected with HTTP 400");
   assert.ok(res.text.includes("deactivate") || res.text.includes("block"));
   const inDb = await prisma.user.findUnique({ where: { id } });
   assert.strictEqual(inDb?.status, "ACTIVE");
   ```
3. **`ADV-LAST.2`**:
   ```typescript
   // Demoting the last remaining active admin via lowercase role: 'user'
   // When only 1 active admin remains:
   const patchRes = await masterAdminClient.patch(`/api/admin/users/${soleActiveAdminId}`, { role: "user" });
   assert.strictEqual(patchRes.status, 400, "Demoting last admin with lowercase 'user' must return 400");
   assert.ok(patchRes.text.includes("downgrade") || patchRes.text.includes("last remaining"));
   ```
4. **`ADV-LAST.3`**:
   ```typescript
   // When 1 active admin and 1 blocked admin exist, deleting the active admin must return 400:
   const delRes = await masterAdminClient.delete(`/api/admin/users/${soleActiveAdminId}`);
   assert.strictEqual(delRes.status, 400, "Deleting sole active admin when blocked admins exist must return 400");
   assert.ok(delRes.text.includes("delete") || delRes.text.includes("last remaining"));
   ```
5. **`ADV-PROF.4`**:
   ```typescript
   const userBefore = await prisma.user.findUnique({ where: { id: testUserId! } });
   const initialSessionVersion = userBefore?.sessionVersion ?? 1;

   const res = await userClient.patch("/api/profile", {
     currentPassword: userPass,
     newPassword: "UpdatedSecurePassword123!",
   });
   assert.strictEqual(res.status, 200);

   const userAfter = await prisma.user.findUnique({ where: { id: testUserId! } });
   assert.strictEqual(
     userAfter?.sessionVersion,
     initialSessionVersion + 1,
     "sessionVersion must be incremented on password update"
   );

   // Active client stays authenticated because cookie was refreshed
   const profileCheck = await userClient.get("/api/profile");
   assert.strictEqual(profileCheck.status, 200, "Current user must remain logged in with updated cookie");
   ```

---

## 4. Caveats

- **Scope Boundary**: These recommendations address API route logic and guards; client-side frontend forms (`/admin/users/[id]` and `/admin/profile`) send uppercase or lowercase depending on dropdown components. Normalization on the backend ensures frontend independence.
- **`src/app/api/auth/otp/verify/route.ts`**: Line 34 checks `if (existing && existing.status === "BLOCKED")`. While `getCurrentUser()` invalidates `INACTIVE` accounts upon subsequent calls, for defensive consistency `existing.status === "INACTIVE"` should also be rejected during OTP verification.
- **Admin Seeding**: `src/lib/auth.ts:ensureDatabaseAdmins()` ensures two admins (`admin@hcmute.edu.vn` and `tctoan1024@gmail.com`). Tests testing last-admin edge cases must account for both accounts when computing `totalActiveAdmins`.

---

## 5. Conclusion

All 5 core questions and vulnerabilities have been fully diagnosed with exact root causes and code-level solutions:
1. **Casing Normalization**: Implemented via `normalizedRole` (`Role.ADMIN | Role.USER`) and `normalizedStatus` (`toUpperCase()`) prior to any guard execution.
2. **`INACTIVE` Guarding**: Safety Guard 2 and Safety Guard 3 now protect against any non-`ACTIVE` status, closing the self-deactivation and last-admin lockout loopholes.
3. **DELETE Active Count**: Filter updated from `{ role: Role.ADMIN }` to `{ role: Role.ADMIN, status: "ACTIVE" }`, preventing deletion of the sole active admin when inactive/blocked admins exist.
4. **Profile Password Invalidation & Cookie Refresh**: Atomically increments `sessionVersion` and calls `attachSessionCookie(response, newSessionToken)` to invalidate stolen sessions while preserving caller login state.
5. **Non-Active Status Session Revocation**: In `PATCH /api/admin/users/[id]`, `sessionVersionIncrement` is triggered whenever `normalizedStatus !== "ACTIVE"`.

These recommendations are ready for immediate implementation by the Worker agent.

---

## 6. Verification Method

To verify these changes after implementation:

1. **Static Analysis & Build**:
   ```bash
   pnpm exec tsc --noEmit
   pnpm run build
   ```
2. **Milestone M1 E2E Test Suites**:
   ```bash
   npx tsx tests/e2e/runner.ts --tier 1
   npx tsx tests/e2e/runner.ts --tier 2
   ```
3. **Dedicated Adversarial Security Stress Harness**:
   ```bash
   node --env-file=.env npx tsx --test tests/security/auth-adversarial.stress.ts
   ```
   Verify that all 22 test cases pass cleanly with zero vulnerability regressions.
