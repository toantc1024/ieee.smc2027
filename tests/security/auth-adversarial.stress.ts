/**
 * Empirical Adversarial Challenge & Security Stress Harness
 * Author: Challenger M1-1 (API & Security Stress Challenger)
 *
 * Targets:
 * - src/lib/auth.ts (extractClientInfo, sessionVersion revocation, DB lookup)
 * - src/app/api/auth/* (login-password, me, otp/verify, callback/google)
 * - src/app/api/admin/users/* (user management, self-protection, last-admin protection, revoke-sessions, reset-password)
 * - src/app/api/profile/route.ts (profile inspection and password change)
 */

import test, { describe, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { extractClientInfo } from "../../src/lib/auth";
import TestHttpClient from "../e2e/helpers/http-client";
import dbHelper from "../e2e/helpers/db-helper";
import prisma from "../../src/lib/prisma";
import { Role } from "@prisma/client";

// ============================================================================
// SUITE 1: extractClientInfo Fuzzing & Multi-Proxy Headers
// ============================================================================
describe("Adversarial Suite 1: Client IP & User-Agent Extraction Fuzzing", { concurrency: 1 }, () => {
  test("ADV-IP.1: Extracts first client IP from multi-hop x-forwarded-for chain", () => {
    const headers = new Headers({
      "x-forwarded-for": "203.0.113.195, 70.41.3.18, 150.172.238.178",
    });
    const info = extractClientInfo({ headers });
    assert.strictEqual(info.ip, "203.0.113.195");
  });

  test("ADV-IP.2: Trims whitespace aggressively from x-forwarded-for entries", () => {
    const headers = new Headers({
      "x-forwarded-for": "   198.51.100.27   ,  10.0.0.1",
    });
    const info = extractClientInfo({ headers });
    assert.strictEqual(info.ip, "198.51.100.27");
  });

  test("ADV-IP.3: Normalizes IPv6 loopback (::1) and IPv4-mapped (::ffff:127.0.0.1) to 127.0.0.1", () => {
    const h1 = new Headers({ "x-forwarded-for": "::1" });
    assert.strictEqual(extractClientInfo({ headers: h1 }).ip, "127.0.0.1");

    const h2 = new Headers({ "x-forwarded-for": "::ffff:127.0.0.1" });
    assert.strictEqual(extractClientInfo({ headers: h2 }).ip, "127.0.0.1");

    const h3 = new Headers({ "x-real-ip": "::1" });
    assert.strictEqual(extractClientInfo({ headers: h3 }).ip, "127.0.0.1");
  });

  test("ADV-IP.4: Fallback header chain priority when x-forwarded-for is missing or empty", () => {
    const h1 = new Headers({
      "x-forwarded-for": "",
      "x-real-ip": "192.0.2.1",
    });
    assert.strictEqual(extractClientInfo({ headers: h1 }).ip, "192.0.2.1");

    const h2 = new Headers({
      "x-forwarded-for": ", 10.0.0.1",
      "cf-connecting-ip": "192.0.2.2",
    });
    assert.strictEqual(extractClientInfo({ headers: h2 }).ip, "192.0.2.2");

    const h3 = new Headers({
      "cf-connecting-ip": "192.0.2.3",
    });
    assert.strictEqual(extractClientInfo({ headers: h3 }).ip, "192.0.2.3");

    const h4 = new Headers({});
    assert.strictEqual(extractClientInfo({ headers: h4 }).ip, "127.0.0.1");
  });

  test("ADV-IP.5: User-Agent length clamping against buffer overflow / DB column limits", () => {
    const h1 = new Headers({});
    assert.strictEqual(extractClientInfo({ headers: h1 }).device, "Unknown Device");

    const hostileUA = "A".repeat(2000);
    const h2 = new Headers({ "user-agent": hostileUA });
    const info = extractClientInfo({ headers: h2 });
    assert.strictEqual(info.device.length, 255);
    assert.strictEqual(info.device, "A".repeat(255));
  });
});

// ============================================================================
// SUITE 2: Session Revocation Empirical Testing
// ============================================================================
describe("Adversarial Suite 2: Session Revocation Empirical Verification", { concurrency: 1 }, () => {
  let masterAdminClient: TestHttpClient;

  beforeEach(async () => {
    await dbHelper.ensureAdmins();
    masterAdminClient = new TestHttpClient();
    const loginRes = await masterAdminClient.loginAsAdmin();
    assert.strictEqual(loginRes.status, 200, "masterAdminClient must login successfully");
  });

  test("ADV-REV.1: Session Revocation via /api/admin/users/[id]/revoke-sessions immediately invalidates active JWT", async () => {
    const email = `rev1_${Date.now()}@test-smc.org`;
    const password = "Password123!Secure";
    const createRes = await masterAdminClient.post("/api/admin/users", { email, name: "Rev1 User", password });
    assert.strictEqual(createRes.status, 200, "Target user must be created cleanly");
    const userId = createRes.data?.user?.id;
    assert.ok(userId, "Target userId must exist");

    // Double check DB existence to guarantee user is committed
    const targetInDb = await prisma.user.findUnique({ where: { id: userId } });
    assert.ok(targetInDb, "Target user must exist in database");

    const userClient = new TestHttpClient();
    const loginRes = await userClient.post("/api/auth/login-password", { email, password });
    assert.strictEqual(loginRes.status, 200, "User login must succeed");
    const meBefore = await userClient.get("/api/auth/me");
    assert.strictEqual(meBefore.status, 200);
    assert.strictEqual(meBefore.data?.user?.email, email);

    // Revoke sessions
    const revokeRes = await masterAdminClient.post(`/api/admin/users/${userId}/revoke-sessions`);
    assert.strictEqual(revokeRes.status, 200, "Revoke sessions must return HTTP 200");
    assert.strictEqual(revokeRes.data?.sessionVersion, (targetInDb.sessionVersion || 1) + 1);

    const meAfter = await userClient.get("/api/auth/me");
    assert.strictEqual(meAfter.status, 200);
    assert.strictEqual(meAfter.data?.user, null);

    const profAfter = await userClient.get("/api/profile");
    assert.strictEqual(profAfter.status, 401);

    await prisma.user.deleteMany({ where: { id: userId } });
  });

  test("ADV-REV.2: Admin Password Reset immediately invalidates active JWT", async () => {
    const email = `rev2_${Date.now()}@test-smc.org`;
    const password = "Password123!Secure";
    const createRes = await masterAdminClient.post("/api/admin/users", { email, name: "Rev2 User", password });
    const userId = createRes.data?.user?.id;
    assert.ok(userId);

    const userClient = new TestHttpClient();
    await userClient.post("/api/auth/login-password", { email, password });

    // Reset password
    const resetRes = await masterAdminClient.post(`/api/admin/users/${userId}/reset-password`, {
      password: "NewPassword999!",
      temporary: true,
    });
    assert.strictEqual(resetRes.status, 200);

    const meAfter = await userClient.get("/api/auth/me");
    assert.strictEqual(meAfter.data?.user, null);

    const profAfter = await userClient.get("/api/profile");
    assert.strictEqual(profAfter.status, 401);

    await prisma.user.deleteMany({ where: { id: userId } });
  });

  test("ADV-REV.3: Blocking an account immediately invalidates active JWT", async () => {
    const email = `rev3_${Date.now()}@test-smc.org`;
    const password = "Password123!Secure";
    const createRes = await masterAdminClient.post("/api/admin/users", { email, name: "Rev3 User", password });
    const userId = createRes.data?.user?.id;
    assert.ok(userId);

    const userClient = new TestHttpClient();
    await userClient.post("/api/auth/login-password", { email, password });

    const blockRes = await masterAdminClient.patch(`/api/admin/users/${userId}`, { status: "BLOCKED" });
    assert.strictEqual(blockRes.status, 200);

    const meAfter = await userClient.get("/api/auth/me");
    assert.strictEqual(meAfter.data?.user, null);

    const profAfter = await userClient.get("/api/profile");
    assert.strictEqual(profAfter.status, 401);

    await prisma.user.deleteMany({ where: { id: userId } });
  });

  test("ADV-REV.4: Deleting user from DB immediately invalidates active JWT", async () => {
    const email = `rev4_${Date.now()}@test-smc.org`;
    const password = "Password123!Secure";
    const createRes = await masterAdminClient.post("/api/admin/users", { email, name: "Rev4 User", password });
    const userId = createRes.data?.user?.id;
    assert.ok(userId);

    const userClient = new TestHttpClient();
    await userClient.post("/api/auth/login-password", { email, password });

    await masterAdminClient.delete(`/api/admin/users/${userId}`);

    const meAfter = await userClient.get("/api/auth/me");
    assert.strictEqual(meAfter.data?.user, null);

    const profAfter = await userClient.get("/api/profile");
    assert.strictEqual(profAfter.status, 401);
  });

  test("ADV-REV.5: Setting status to INACTIVE immediately invalidates active JWT", async () => {
    const email = `rev5_${Date.now()}@test-smc.org`;
    const password = "Password123!Secure";
    const createRes = await masterAdminClient.post("/api/admin/users", { email, name: "Rev5 User", password });
    const userId = createRes.data?.user?.id;
    assert.ok(userId);

    const userClient = new TestHttpClient();
    await userClient.post("/api/auth/login-password", { email, password });

    await masterAdminClient.patch(`/api/admin/users/${userId}`, { status: "INACTIVE" });

    const meAfter = await userClient.get("/api/auth/me");
    assert.strictEqual(meAfter.data?.user, null);

    const profAfter = await userClient.get("/api/profile");
    assert.strictEqual(profAfter.status, 401);

    await prisma.user.deleteMany({ where: { id: userId } });
  });
});

// ============================================================================
// SUITE 3: Self-Protection Guard Analysis
// ============================================================================
describe("Adversarial Suite 3: Self-Protection Guard Analysis", { concurrency: 1 }, () => {
  let masterAdminClient: TestHttpClient;

  beforeEach(async () => {
    await dbHelper.ensureAdmins();
    masterAdminClient = new TestHttpClient();
    const loginRes = await masterAdminClient.loginAsAdmin();
    assert.strictEqual(loginRes.status, 200, "masterAdminClient must login successfully");
  });

  test("ADV-SELF.1: Self-downgrade via role: 'USER' is rejected with HTTP 400", async () => {
    const email = `self_admin_${Date.now()}@test-smc.org`;
    const password = "Password123!Secure";
    const createRes = await masterAdminClient.post("/api/admin/users", {
      email,
      name: "Self Admin 1",
      role: "ADMIN",
      password,
    });
    const id = createRes.data?.user?.id;
    assert.ok(id);

    const client = new TestHttpClient();
    await client.post("/api/auth/login-password", { email, password });

    const res = await client.patch(`/api/admin/users/${id}`, { role: "USER" });
    assert.strictEqual(res.status, 400);
    assert.ok(res.text.includes("downgrade"));

    await prisma.user.deleteMany({ where: { id } });
  });

  test("ADV-SELF.2: Self-block via uppercase status: 'BLOCKED' is rejected with HTTP 400", async () => {
    const email = `self_admin_${Date.now()}@test-smc.org`;
    const password = "Password123!Secure";
    const createRes = await masterAdminClient.post("/api/admin/users", {
      email,
      name: "Self Admin 2",
      role: "ADMIN",
      password,
    });
    const id = createRes.data?.user?.id;
    assert.ok(id);

    const client = new TestHttpClient();
    await client.post("/api/auth/login-password", { email, password });

    const res = await client.patch(`/api/admin/users/${id}`, { status: "BLOCKED" });
    assert.strictEqual(res.status, 400);
    assert.ok(res.text.includes("block"));

    await prisma.user.deleteMany({ where: { id } });
  });

  test("ADV-SELF.3: Self-deletion via DELETE is rejected with HTTP 400", async () => {
    const email = `self_admin_${Date.now()}@test-smc.org`;
    const password = "Password123!Secure";
    const createRes = await masterAdminClient.post("/api/admin/users", {
      email,
      name: "Self Admin 3",
      role: "ADMIN",
      password,
    });
    const id = createRes.data?.user?.id;
    assert.ok(id);

    const client = new TestHttpClient();
    await client.post("/api/auth/login-password", { email, password });

    const res = await client.delete(`/api/admin/users/${id}`);
    assert.strictEqual(res.status, 400);
    assert.ok(res.text.includes("delete"));

    await prisma.user.deleteMany({ where: { id } });
  });

  test("ADV-SELF.4: Lowercase status: 'blocked' is rejected by self-block guard with HTTP 400", async () => {
    const email = `self_admin_${Date.now()}@test-smc.org`;
    const password = "Password123!Secure";
    const createRes = await masterAdminClient.post("/api/admin/users", {
      email,
      name: "Self Admin 4",
      role: "ADMIN",
      password,
    });
    const id = createRes.data?.user?.id;
    assert.ok(id);

    const client = new TestHttpClient();
    await client.post("/api/auth/login-password", { email, password });

    // Attack: Send lowercase "blocked"
    const res = await client.patch(`/api/admin/users/${id}`, { status: "blocked" });
    assert.strictEqual(res.status, 400, "Lowercase 'blocked' must be rejected with HTTP 400");
    assert.ok(res.text.includes("block") || res.text.includes("administrator"));
    const inDb = await prisma.user.findUnique({ where: { id } });
    assert.strictEqual(inDb?.status, "ACTIVE");

    await prisma.user.deleteMany({ where: { id } });
  });

  test("ADV-SELF.5: Status 'INACTIVE' is rejected by self-deactivation guard with HTTP 400", async () => {
    const email = `self_admin_${Date.now()}@test-smc.org`;
    const password = "Password123!Secure";
    const createRes = await masterAdminClient.post("/api/admin/users", {
      email,
      name: "Self Admin 5",
      role: "ADMIN",
      password,
    });
    const id = createRes.data?.user?.id;
    assert.ok(id);

    const client = new TestHttpClient();
    await client.post("/api/auth/login-password", { email, password });

    // Attack: Send status: "INACTIVE"
    const res = await client.patch(`/api/admin/users/${id}`, { status: "INACTIVE" });
    assert.strictEqual(res.status, 400, "Self-deactivation must be rejected with HTTP 400");
    assert.ok(res.text.includes("deactivate") || res.text.includes("block"));
    const inDb = await prisma.user.findUnique({ where: { id } });
    assert.strictEqual(inDb?.status, "ACTIVE");

    await prisma.user.deleteMany({ where: { id } });
  });
});

// ============================================================================
// SUITE 4: Last-Admin Protection Analysis
// ============================================================================
describe("Adversarial Suite 4: Last-Admin Protection Analysis", { concurrency: 1 }, () => {
  let masterAdminClient: TestHttpClient;

  beforeEach(async () => {
    await dbHelper.ensureAdmins();
    masterAdminClient = new TestHttpClient();
    const loginRes = await masterAdminClient.loginAsAdmin();
    assert.strictEqual(loginRes.status, 200, "masterAdminClient must login successfully");
  });

  test("ADV-LAST.1: Deleting a non-last admin account succeeds when other admins exist", async () => {
    const email = `temp_admin_${Date.now()}@test-smc.org`;
    const password = "Password123!Secure";
    const createRes = await masterAdminClient.post("/api/admin/users", {
      email,
      name: "Secondary Admin",
      role: "ADMIN",
      password,
    });
    const id = createRes.data?.user?.id;
    assert.ok(id);

    const delRes = await masterAdminClient.delete(`/api/admin/users/${id}`);
    assert.strictEqual(delRes.status, 200);
  });

  test("ADV-LAST.2: Demoting admin account via lowercase role: 'user' is rejected with HTTP 400", async () => {
    const meRes = await masterAdminClient.get("/api/auth/me");
    const adminId = meRes.data?.user?.id;
    assert.ok(adminId);

    const patchRes = await masterAdminClient.patch(`/api/admin/users/${adminId}`, { role: "user" });
    assert.strictEqual(patchRes.status, 400, "Demoting admin with lowercase 'user' must return 400");
    assert.ok(patchRes.text.includes("downgrade") || patchRes.text.includes("last remaining"));
  });

  test("ADV-LAST.3: DELETE endpoint protects active admin from deletion", async () => {
    const meRes = await masterAdminClient.get("/api/auth/me");
    const adminId = meRes.data?.user?.id;
    assert.ok(adminId);

    const email = `blocked_admin_${Date.now()}@test-smc.org`;
    const password = "Password123!Secure";
    const createRes = await masterAdminClient.post("/api/admin/users", {
      email,
      name: "Blocked Admin",
      role: "ADMIN",
      status: "BLOCKED",
      password,
    });
    const blockedId = createRes.data?.user?.id;
    assert.ok(blockedId);

    const delRes = await masterAdminClient.delete(`/api/admin/users/${adminId}`);
    assert.strictEqual(delRes.status, 400, "Deleting active admin must return 400");
    assert.ok(delRes.text.includes("delete") || delRes.text.includes("last remaining"));

    await prisma.user.deleteMany({ where: { id: blockedId } });
  });
});

// ============================================================================
// SUITE 5: Profile & Password Adversarial Edge Cases
// ============================================================================
describe("Adversarial Suite 5: Profile & Password Adversarial Edge Cases", { concurrency: 1 }, () => {
  let userClient: TestHttpClient;
  let testUserId: string | null = null;
  const userEmail = `profile_test_${Date.now()}@test-smc.org`;
  const userPass = "OriginalPass123!";

  beforeEach(async () => {
    await dbHelper.ensureAdmins();
    userClient = new TestHttpClient();
    const res = await userClient.post("/api/auth/login-password", {
      email: userEmail,
      password: userPass,
    });
    assert.strictEqual(res.status, 200, "userClient must login successfully");
    testUserId = res.data?.user?.id || null;
    assert.ok(testUserId);
  });

  afterEach(async () => {
    if (testUserId) {
      await prisma.user.deleteMany({ where: { id: testUserId } });
      testUserId = null;
    }
  });

  test("ADV-PROF.1: Password change with incorrect current password returns HTTP 400", async () => {
    const res = await userClient.patch("/api/profile", {
      currentPassword: "WrongPassword999!",
      newPassword: "BrandNewPassword123!",
    });
    assert.strictEqual(res.status, 400);
    assert.ok(res.text.includes("Current password is incorrect"));
  });

  test("ADV-PROF.2: Password change with missing current password returns HTTP 400", async () => {
    const res = await userClient.patch("/api/profile", {
      newPassword: "BrandNewPassword123!",
    });
    assert.strictEqual(res.status, 400);
    assert.ok(res.text.includes("Current password is required"));
  });

  test("ADV-PROF.3: Password change with new password < 6 chars returns HTTP 400", async () => {
    const res = await userClient.patch("/api/profile", {
      currentPassword: userPass,
      newPassword: "123",
    });
    assert.strictEqual(res.status, 400);
    assert.ok(res.text.includes("at least 6 characters"));
  });

  test("ADV-PROF.4: Self-service password update increments sessionVersion and refreshes session cookie", async () => {
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
  });
});
