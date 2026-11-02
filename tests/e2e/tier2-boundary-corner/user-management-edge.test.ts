/**
 * Tier 2: Boundary & Corner Cases — User Management & Profile
 * Tests:
 * 1. Non-admin unauthorized access rejected with 401/403
 * 2. Self-downgrade prevention (active admin cannot demote themselves) returns 400
 * 3. Self-deletion prevention (active admin cannot delete their own account) returns 400
 * 4. Password validation (<6 chars) and missing credentials rejected with 400
 * 5. Non-existent user ID returns 404
 */

import test, { describe, beforeEach, afterEach, before, after } from "node:test";
import assert from "node:assert/strict";
import TestHttpClient from "../helpers/http-client";
import dbHelper from "../helpers/db-helper";

describe("Tier 2: User Management Boundary & Corner Cases", { concurrency: 1 }, () => {
  let adminClient: TestHttpClient;
  let unauthClient: TestHttpClient;
  let adminUserRecord: any;

  before(async () => {
    await dbHelper.cleanupTestData();
  });

  beforeEach(async () => {
    adminClient = new TestHttpClient();
    await adminClient.loginAsAdmin();
    unauthClient = new TestHttpClient();

    // Find current admin's DB record
    adminUserRecord = await dbHelper.findUser("admin@hcmute.edu.vn");
  });

  after(async () => {
    await dbHelper.cleanupTestData();
  });

  test("T2.3.1: Unauthenticated request to /api/admin/users returns 401/403", async () => {
    const res = await unauthClient.get("/api/admin/users");
    assert.ok(
      [401, 403].includes(res.status),
      `Unauthenticated access to /api/admin/users must return 401/403, got: ${res.status}`
    );
  });

  test("T2.3.2: Self-downgrade prevention: active admin cannot downgrade their own role", async () => {
    assert.ok(adminUserRecord, "admin@hcmute.edu.vn record must exist in DB");

    // Attempt to downgrade active admin to USER
    const res = await adminClient.patch(`/api/admin/users/${adminUserRecord.id}`, {
      role: "USER",
    });

    assert.strictEqual(
      res.status,
      400,
      `Self-downgrade must be rejected with HTTP 400, got ${res.status}: ${res.text}`
    );
    assert.ok(
      res.text.includes("downgrade") || res.text.includes("administrator"),
      "Error message should explain self-downgrade prohibition"
    );

    // Verify role in database remains ADMIN
    const freshRecord = await dbHelper.findUser("admin@hcmute.edu.vn");
    assert.strictEqual(freshRecord?.role, "ADMIN");
  });

  test("T2.3.3: Self-deletion prevention: active admin cannot delete their own account", async () => {
    assert.ok(adminUserRecord);

    const res = await adminClient.delete(`/api/admin/users/${adminUserRecord.id}`);
    assert.strictEqual(
      res.status,
      400,
      `Self-deletion must be rejected with HTTP 400, got ${res.status}: ${res.text}`
    );
    assert.ok(
      res.text.includes("delete") || res.text.includes("account"),
      "Error message should explain self-deletion prohibition"
    );

    // Verify admin still exists
    const stillExists = await dbHelper.findUser("admin@hcmute.edu.vn");
    assert.ok(stillExists, "Admin account must still exist in DB");
  });

  test("T2.3.4: Short password (<6 characters) or missing email rejected with 400", async () => {
    // 1. Password < 6 chars
    const shortPassRes = await adminClient.post("/api/auth/login-password", {
      email: "test_short_pass@test-smc.org",
      password: "123", // Only 3 characters
    });
    assert.strictEqual(shortPassRes.status, 400, "Password under 6 chars must return 400");
    assert.ok(
      shortPassRes.text.includes("6 characters") || shortPassRes.text.includes("Password"),
      "Error should explain minimum password length requirement"
    );

    // 2. Missing email
    const missingEmailRes = await adminClient.post("/api/auth/login-password", {
      email: "",
      password: "ValidPassword123!",
    });
    assert.strictEqual(missingEmailRes.status, 400, "Missing email must return 400");
  });

  test("T2.3.5: Non-existent user ID query/patch/delete returns 404 Not Found", async () => {
    const nonExistentId = "00000000-0000-0000-0000-000000000000";

    const patchRes = await adminClient.patch(`/api/admin/users/${nonExistentId}`, {
      name: "Nobody",
    });
    assert.strictEqual(patchRes.status, 404, `Patching non-existent user must return 404, got: ${patchRes.status}`);

    const deleteRes = await adminClient.delete(`/api/admin/users/${nonExistentId}`);
    assert.strictEqual(deleteRes.status, 404, `Deleting non-existent user must return 404, got: ${deleteRes.status}`);
  });
});
