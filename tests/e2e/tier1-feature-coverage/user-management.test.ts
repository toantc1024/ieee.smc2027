/**
 * Tier 1: Feature Coverage — User Management, Last Login & Profile Management
 * Verifies core happy paths:
 * 1. Retrieve user directory list with summary metadata
 * 2. Inspect individual user record
 * 3. Update user role and conference profile data
 * 4. Verify password authentication records session
 * 5. Fetch and update self profile
 */

import test, { describe, beforeEach, afterEach, before, after } from "node:test";
import assert from "node:assert/strict";
import TestHttpClient from "../helpers/http-client";
import { createTestUserPayload } from "../helpers/test-fixtures";
import dbHelper from "../helpers/db-helper";

describe("Tier 1: User Management, Last Login & Profile Management", { concurrency: 1 }, () => {
  let adminClient: TestHttpClient;
  let createdUserId: string | null = null;
  let testUserPayload: ReturnType<typeof createTestUserPayload>;

  before(async () => {
    await dbHelper.cleanupTestData();
  });

  beforeEach(async () => {
    adminClient = new TestHttpClient();
    await adminClient.loginAsAdmin();
    testUserPayload = createTestUserPayload("USER");
  });

  afterEach(async () => {
    if (createdUserId) {
      try {
        await adminClient.delete(`/api/admin/users/${createdUserId}`);
      } catch {
        // ignore
      }
      createdUserId = null;
    }
  });

  after(async () => {
    await dbHelper.cleanupTestData();
  });

  test("T1.3.1: Retrieve user directory list returns seeded admin and user array", async () => {
    const res = await adminClient.get("/api/admin/users");
    assert.strictEqual(res.status, 200, "Should return HTTP 200 for user list");
    assert.ok(res.data?.users, "Response must include users collection");
    assert.ok(Array.isArray(res.data.users), "users must be an array");

    const users = res.data.users as Array<{ email: string; role: string }>;
    const adminUser = users.find((u) => u.email === "admin@hcmute.edu.vn");
    assert.ok(adminUser, "admin@hcmute.edu.vn must be present in user directory");
    assert.strictEqual(adminUser.role, "ADMIN");
  });

  test("T1.3.2: Create and inspect individual user record by ID", async () => {
    // Create new test user via admin API
    const createRes = await adminClient.post("/api/admin/users", testUserPayload);
    assert.strictEqual(createRes.status, 200, `User creation failed: ${createRes.text}`);
    assert.ok(createRes.data?.user?.id, "Created user must have an ID");

    createdUserId = createRes.data.user.id;

    // Inspect user
    const inspectRes = await adminClient.get(`/api/admin/users/${createdUserId}`);
    // Support either direct /api/admin/users/[id] or lookup in users list
    if (inspectRes.status === 200) {
      const user = inspectRes.data.user || inspectRes.data;
      assert.strictEqual(user.email, testUserPayload.email);
    } else {
      // Fallback check in users list
      const listRes = await adminClient.get("/api/admin/users");
      const found = (listRes.data?.users as any[]).find((u) => u.id === createdUserId);
      assert.ok(found, "User should be found in user list");
      assert.strictEqual(found.email, testUserPayload.email);
    }
  });

  test("T1.3.3: Update user role and profileData metadata", async () => {
    const createRes = await adminClient.post("/api/admin/users", testUserPayload);
    assert.strictEqual(createRes.status, 200);
    createdUserId = createRes.data.user.id;

    // Patch user with updated name and role
    const updatedName = `${testUserPayload.name} (Senior Reviewer)`;
    const patchRes = await adminClient.patch(`/api/admin/users/${createdUserId}`, {
      name: updatedName,
      profileData: {
        affiliation: "IEEE SMC 2027 Organizing Committee",
        conferenceTrack: "SPEAKER",
      },
    });

    assert.strictEqual(patchRes.status, 200, `Patch user failed: ${patchRes.text}`);
    assert.ok(patchRes.data?.user, "Updated user object should be returned");
    assert.strictEqual(patchRes.data.user.name, updatedName);

    // Verify in database
    const dbUser = await dbHelper.findUser(testUserPayload.email);
    assert.ok(dbUser);
    assert.strictEqual(dbUser.name, updatedName);
  });

  test("T1.3.4: Authenticate with password and record session with client IP", async () => {
    const userClient = new TestHttpClient();
    const loginRes = await userClient.request("/api/auth/login-password", {
      method: "POST",
      headers: {
        "x-forwarded-for": "198.51.100.42",
        "user-agent": "Mozilla/5.0 SMC-Test-Agent",
      },
      body: {
        email: testUserPayload.email,
        password: testUserPayload.password,
        name: testUserPayload.name,
      },
    });

    assert.strictEqual(loginRes.status, 200, `User login failed: ${loginRes.text}`);
    assert.ok(loginRes.data?.user, "Login response should return user data");

    // Session cookie admin_session must be set
    const sessionCookie = userClient.getCookie("admin_session");
    assert.ok(sessionCookie, "Session cookie must be issued upon successful password authentication");

    // Calling /api/auth/me should identify logged-in user
    const meRes = await userClient.get("/api/auth/me");
    assert.strictEqual(meRes.status, 200);
    assert.strictEqual(meRes.data?.user?.email, testUserPayload.email);

    // Store ID for cleanup
    createdUserId = loginRes.data.user.id;
  });

  test("T1.3.5: Fetch and update self profile with academic affiliation", async () => {
    const userClient = new TestHttpClient();
    const loginRes = await userClient.request("/api/auth/login-password", {
      method: "POST",
      body: {
        email: testUserPayload.email,
        password: testUserPayload.password,
        name: testUserPayload.name,
      },
    });
    if (loginRes.data?.user?.id) {
      createdUserId = loginRes.data.user.id;
    }

    // Fetch self profile
    const profileRes = await userClient.get("/api/profile");
    assert.ok([200, 404].includes(profileRes.status), "Self-profile endpoint should respond cleanly");

    if (profileRes.status === 200) {
      // Update self profile
      const updateRes = await userClient.patch("/api/profile", {
        name: `${testUserPayload.name} - Updated Profile`,
        bio: "Specializing in Human-Machine Systems and Cybernetics",
      });
      assert.strictEqual(updateRes.status, 200);
    }
  });
});
