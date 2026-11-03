# Investigation & Specification Report: User Search Input Sanitization & Creation Validation

**Agent**: Explorer M1-R2-2 (User Search Input Sanitization & Creation Validation Explorer)  
**Scope**: `src/app/api/admin/users/route.ts` (GET and POST handlers), `src/app/api/admin/users/[id]/route.ts`  
**Milestone**: M1 (User Management, Last Login & Profile Management — Iteration 2)  
**Status**: COMPLETE (Read-Only Investigation & Proposal)

---

## 1. Observation

### 1.1 Direct File Observations in `src/app/api/admin/users/route.ts`

1. **User Search Query Building (`GET /api/admin/users`)**:
   - Location: `src/app/api/admin/users/route.ts`, lines 21 and 34–40:
     ```typescript
     21: const search = searchParams.get("search") || searchParams.get("q") || "";
     ...
     34: if (search.trim()) {
     35:   const term = search.trim();
     36:   where.OR = [
     37:     { name: { contains: term, mode: "insensitive" } },
     38:     { email: { contains: term, mode: "insensitive" } },
     39:   ];
     40: }
     ```
   - When a client sends a query with a null byte (e.g. `GET /api/admin/users?search=%00` or `?search=\u0000`), the Node.js standard URL parser decodes `%00` into `\u0000` (ASCII 0x00).
   - In ECMAScript specification (§ 11.2 & § 11.3), `String.prototype.trim()` strips whitespace characters (such as `\u0020`, `\t`, `\n`, `\r`, `\u00A0`, etc.), but does **not** consider `\u0000` whitespace.
   - Therefore, `"\u0000".trim()` evaluates to `"\u0000"`, which is truthy.
   - `where.OR` is populated with `{ contains: "\u0000", mode: "insensitive" }`.
   - Prisma ORM compiles this into PostgreSQL `ILIKE '%' || $1 || '%'` with parameter `\x00`.
   - PostgreSQL engine terminates text parsing upon encountering `0x00`, throwing:
     ```
     PostgresError { code: "22021", message: "invalid byte sequence for encoding \"UTF8\": 0x00\", severity: \"ERROR\" }
     ```
   - In lines 120–123:
     ```typescript
     120: } catch (error: unknown) {
     121:   console.error("Error fetching users:", error);
     122:   return apiError(error, 500);
     123: }
     ```
   - `apiError(error, 500)` calls `extractErrorMessage(error)` in `src/lib/api-helper.ts` (lines 16–23) and `src/lib/utils.ts` (lines 72–83), which returns `error.message`.
   - As observed verbatim in Challenger M1-2 handoff (`challenger_m1_2/handoff.md`, lines 63–66):
     ```
     [Prisma Error]
     Invalid prisma.user.count() invocation in src/app/api/admin/users/route.ts:192
     ConnectorError { user_facing_error: None, kind: QueryError(PostgresError { code: "22021", message: "invalid byte sequence for encoding \"UTF8\": 0x00", severity: "ERROR" }) }
     ```
   - This returns an unhandled HTTP 500 response leaking internal server paths, file line numbers, and database connector error details to the client.

2. **User Creation Email Validation (`POST /api/admin/users`)**:
   - Location: `src/app/api/admin/users/route.ts`, lines 145–155:
     ```typescript
     145: if (!email || !name) {
     146:   return apiError("Email and full name are required", 400);
     147: }
     148: 
     149: const cleanEmail = normalizeEmail(email);
     150: const targetRole = role === "ADMIN" ? Role.ADMIN : Role.USER;
     151: const targetStatus = ["ACTIVE", "INACTIVE", "BLOCKED"].includes(status?.toUpperCase())
     152:   ? status.toUpperCase()
     153:   : "ACTIVE";
     ```
   - `normalizeEmail` in `src/lib/utils.ts` (line 15) performs only:
     ```typescript
     export function normalizeEmail(email?: string | null): string {
       return (email || "").trim().toLowerCase();
     }
     ```
   - Passing malformed emails such as `{ email: "invalid-email-format", name: "Test" }` satisfies `!email || !name` (both truthy strings).
   - No email structure or regex validation is executed.
   - The user is inserted directly into PostgreSQL via `prisma.user.upsert` with `email = "invalid-email-format"`, and the endpoint returns HTTP 200.

3. **Frontend Implementation Parity in `src/components/admin/users/CreateUserModal.tsx`**:
   - Location: `src/components/admin/users/CreateUserModal.tsx`, lines 100–104:
     ```typescript
     100: const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
     101: if (!emailRegex.test(cleanEmail)) {
     102:   setError("Please enter a valid email address");
     103:   return;
     104: }
     ```
   - The frontend enforces this regex check before dispatching requests, but direct API calls, scripts, external integrations, or malicious delegates bypass frontend checks entirely.

---

## 2. Logic Chain

1. **Why `search.trim()` fails to prevent null-byte crashes**:
   - [Observation 1.1] demonstrates that `%00` decodes to character `\u0000`.
   - In JavaScript, `\u0000` is code point 0. Standard `trim()` removes only code points defined as whitespace in Unicode.
   - Because `"\u0000".trim() === "\u0000"`, the truthiness check passes.
   - PostgreSQL prohibits `0x00` in UTF-8 text strings (`ERROR 22021`).
   - Consequently, any query parameter containing `%00` or `\u0000` causes an unhandled database crash (HTTP 500) and exposes Prisma query internals.
   - *Inference*: Stripping null bytes via `search.replace(/\0/g, "").trim()` reduces `"\u0000"` to `""`. The condition `if (term)` then evaluates to `false`, omitting the invalid `where.OR` clause. The endpoint executes cleanly and returns HTTP 200 with all users (identical to empty search queries). Mixed queries like `admin\0` are sanitized to `admin`, searching matching records without error.

2. **Why missing email regex validation creates severe defects**:
   - [Observation 1.2] demonstrates that `POST /api/admin/users` currently checks only presence (`!email || !name`).
   - The Prisma schema defines `User.email` as `String @unique`, lacking an SQL-level check constraint for RFC 5322 compliance.
   - When users are created without passwords, `src/app/api/admin/users/route.ts` line 185 assigns `provider: "email_link"`.
   - When a user with a malformed email address tries to sign in via magic link or OTP verification (`/api/auth/otp/send`), the mailing transport service (e.g. Nodemailer/SES) fails or throws unhandled exceptions.
   - Administrative alerts, conference notifications, and self-service password resets are permanently broken for that record.
   - [Observation 1.3] confirms the frontend already uses `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`.
   - *Inference*: Mirroring the exact regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` in `POST /api/admin/users` enforces server-side validation integrity, rejecting malformed emails with HTTP 400 Bad Request (`"Invalid email format"`) and satisfying Challenger M1-2 requirements.

---

## 3. Recommended Code Changes

### Proposed Change 1: Sanitize Search Input Against Null Bytes in `GET /api/admin/users`

**Target File**: `src/app/api/admin/users/route.ts`  
**Target Lines**: 34–40  

#### Code Snippet Diff:
```diff
--- a/src/app/api/admin/users/route.ts
+++ b/src/app/api/admin/users/route.ts
@@ -34,7 +34,8 @@
-    if (search.trim()) {
-      const term = search.trim();
+    const sanitizedSearch = search.replace(/\0/g, "").trim();
+    if (sanitizedSearch) {
       where.OR = [
-        { name: { contains: term, mode: "insensitive" } },
-        { email: { contains: term, mode: "insensitive" } },
+        { name: { contains: sanitizedSearch, mode: "insensitive" } },
+        { email: { contains: sanitizedSearch, mode: "insensitive" } },
       ];
     }
```

*Alternative (Sanitizing at parameter extraction line 21)*:
```diff
--- a/src/app/api/admin/users/route.ts
+++ b/src/app/api/admin/users/route.ts
@@ -21,1 +21,2 @@
-    const search = searchParams.get("search") || searchParams.get("q") || "";
+    const rawSearch = searchParams.get("search") || searchParams.get("q") || "";
+    const search = rawSearch.replace(/\0/g, "").trim();
@@ -34,4 +35,4 @@
-    if (search.trim()) {
-      const term = search.trim();
+    if (search) {
+      const term = search;
       where.OR = [
```

Both approaches guarantee that queries consisting solely of null bytes (`%00`, `\u0000`, `%00%00`) reduce to an empty string (`""`), bypassing `where.OR` and returning HTTP 200 with empty/matching results cleanly.

---

### Proposed Change 2: Enforce Email Format Regex Validation in `POST /api/admin/users`

**Target File**: `src/app/api/admin/users/route.ts`  
**Target Lines**: 145–155  

#### Code Snippet Diff:
```diff
--- a/src/app/api/admin/users/route.ts
+++ b/src/app/api/admin/users/route.ts
@@ -145,6 +145,12 @@
     if (!email || !name) {
       return apiError("Email and full name are required", 400);
     }
 
     const cleanEmail = normalizeEmail(email);
+    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
+    if (!emailRegex.test(cleanEmail)) {
+      return apiError("Invalid email format", 400);
+    }
+
     const targetRole = role === "ADMIN" ? Role.ADMIN : Role.USER;
     const targetStatus = ["ACTIVE", "INACTIVE", "BLOCKED"].includes(status?.toUpperCase())
```

---

### Proposed Change 3 (Defense-in-Depth): Enforce Email Regex Validation in `PATCH /api/admin/users/[id]`

**Target File**: `src/app/api/admin/users/[id]/route.ts`  
**Target Lines**: 132–140  

#### Code Snippet Diff:
```diff
--- a/src/app/api/admin/users/[id]/route.ts
+++ b/src/app/api/admin/users/[id]/route.ts
@@ -132,6 +132,11 @@
     // Email uniqueness check if email being changed
     if (email && normalizeEmail(email) !== targetUser.email) {
       const cleanEmail = normalizeEmail(email);
+      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
+      if (!emailRegex.test(cleanEmail)) {
+        return apiError("Invalid email format", 400);
+      }
       const existingEmailUser = await prisma.user.findUnique({ where: { email: cleanEmail } });
       if (existingEmailUser) {
         return apiError("An account with this email address already exists", 409);
       }
```

---

## 4. Caveats

1. **RFC 5322 Email Complexity**:
   - The regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` is a practical industry standard for web applications that validates format without rejecting valid international or complex domain configurations (e.g. `user.name+tag@domain.co.uk`). It deliberately disallows spaces, missing `@`, and missing top-level domains.
2. **Database Schema Constraints**:
   - The Prisma schema does not enforce email regex at the PostgreSQL DDL level (e.g., via `CHECK (email ~* '...')`). Server-side validation in route handlers is essential to preserve database integrity.
3. **No Unintended Side Effects on Existing E2E Tests**:
   - In `tests/e2e/tier1-feature-coverage/user-management.test.ts`, all test fixtures use valid emails matching `@test-smc.org` or `@hcmute.edu.vn`.
   - In `tests/e2e/tier2-boundary-corner/user-management-adversarial.test.ts`, test `ADV-1.4` and `ADV-2.3` explicitly probe null bytes and malformed inputs, which will now pass cleanly.

---

## 5. Conclusion

1. **Root Causes Fully Identified**:
   - **User Search**: Lack of null-byte removal before `search.trim()` causes PostgreSQL UTF-8 error 22021, crashing the request into an unhandled HTTP 500 error leaking Prisma internals.
   - **User Creation**: Lack of email structure testing permits arbitrary non-email strings into the database with HTTP 200.
2. **Actionable Resolution**:
   - Applying `search.replace(/\0/g, "").trim()` in `GET /api/admin/users` prevents PostgreSQL crash and returns HTTP 200 cleanly.
   - Adding `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` check in `POST /api/admin/users` rejects invalid emails with HTTP 400 Bad Request (`"Invalid email format"`).
3. **Ready for Worker Implementation**:
   - Detailed, line-precise before-and-after diffs are provided above for Worker M1-1 (or Worker M1-R2) to apply.

---

## 6. Verification Method

Once the implementer applies the recommendations, verify via the following tests:

### 6.1 Test 1: Null-Byte Query Clean Handling
Execute probe script:
```bash
npx tsx -e '
import TestHttpClient from "./tests/e2e/helpers/http-client";
async function main() {
  const client = new TestHttpClient();
  await client.loginAsAdmin();
  
  // 1. Raw null byte
  const res1 = await client.get("/api/admin/users?search=%00");
  console.log("Null byte search status:", res1.status);
  if (res1.status === 200 && Array.isArray(res1.data?.users)) {
    console.log("PASS: Raw null byte handled cleanly with HTTP 200");
  } else {
    console.error("FAIL: Expected 200, got:", res1.status, res1.text);
  }

  // 2. Unicode null byte with query string
  const res2 = await client.get("/api/admin/users?q=\\u0000");
  console.log("Unicode null byte status:", res2.status);
  if (res2.status === 200) {
    console.log("PASS: Unicode null byte handled cleanly with HTTP 200");
  } else {
    console.error("FAIL: Expected 200, got:", res2.status, res2.text);
  }
}
main();
'
```
*Expected Result*: Status `200`, `Array.isArray(res.data.users) === true`, no database connector errors logged.

### 6.2 Test 2: Email Format Validation
Execute creation test:
```bash
npx tsx -e '
import TestHttpClient from "./tests/e2e/helpers/http-client";
async function main() {
  const client = new TestHttpClient();
  await client.loginAsAdmin();
  
  const invalidPayloads = [
    { email: "invalid-email-format", name: "Invalid 1" },
    { email: "user@", name: "Invalid 2" },
    { email: "@domain.com", name: "Invalid 3" },
    { email: "user@domain", name: "Invalid 4" },
    { email: "user @domain.com", name: "Invalid 5" },
  ];

  for (const payload of invalidPayloads) {
    const res = await client.post("/api/admin/users", payload);
    console.log(`Payload [${payload.email}] -> Status: ${res.status}, Error: ${res.data?.error}`);
    if (res.status === 400 && res.data?.error === "Invalid email format") {
      console.log(`PASS: Properly rejected with 400`);
    } else {
      console.error(`FAIL: Expected 400 with Invalid email format, got ${res.status}`);
    }
  }

  // Valid email should succeed
  const validRes = await client.post("/api/admin/users", {
    email: `valid_test_${Date.now()}@smc2027.org`,
    name: "Valid User",
  });
  console.log("Valid email creation status:", validRes.status);
  if (validRes.status === 200 && validRes.data?.user?.id) {
    console.log("PASS: Valid email accepted with HTTP 200");
    await client.delete(`/api/admin/users/${validRes.data.user.id}`);
  }
}
main();
'
```
*Expected Result*: All 5 invalid payloads return HTTP `400` with `{ error: "Invalid email format" }`. Valid payload returns HTTP `200`.

### 6.3 Test 3: Tier 2 Boundary Adversarial Suite
Run the adversarial test suite:
```bash
npx tsx --test tests/e2e/tier2-boundary-corner/user-management-adversarial.test.ts
```
*Expected Result*: All tests in the suite pass cleanly without unhandled exceptions.
