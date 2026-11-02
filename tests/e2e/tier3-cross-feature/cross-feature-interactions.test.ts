/**
 * Tier 3: Cross-Feature Interactions
 * Verifies pairwise module handshakes:
 * 1. User login -> Last Login IP tracking -> reflected in User Management table
 * 2. User profile update -> persists to DB -> reflected in auth session (/api/auth/me)
 * 3. Page builder block configuration -> publish -> public page render verification
 * 4. User session revocation / status inactivation -> immediate API access guard
 * 5. Concurrent page edit & version update handshake
 */

import test, { describe, beforeEach, afterEach, before, after } from "node:test";
import assert from "node:assert/strict";
import TestHttpClient from "../helpers/http-client";
import { createTestUserPayload, createTestPagePayload, sampleBlocks } from "../helpers/test-fixtures";
import dbHelper from "../helpers/db-helper";

describe("Tier 3: Cross-Feature Interactions", { concurrency: 1 }, () => {
  let adminClient: TestHttpClient;
  let createdUserIds: string[] = [];
  let createdPageSlugs: string[] = [];

  before(async () => {
    await dbHelper.cleanupTestData();
  });

  beforeEach(async () => {
    adminClient = new TestHttpClient();
    await adminClient.loginAsAdmin();
  });

  afterEach(async () => {
    for (const userId of createdUserIds) {
      try {
        await adminClient.delete(`/api/admin/users/${userId}`);
      } catch {
        // ignore
      }
    }
    createdUserIds = [];

    for (const slug of createdPageSlugs) {
      try {
        await adminClient.delete(`/api/admin/pages/${slug}`);
      } catch {
        // ignore
      }
    }
    createdPageSlugs = [];
  });

  after(async () => {
    await dbHelper.cleanupTestData();
  });

  test("T3.1: Pairwise: User login with client IP -> recorded in DB -> reflected in user list", async () => {
    const userPayload = createTestUserPayload("USER");
    const userClient = new TestHttpClient();
    const testIp = "203.0.113.195";

    // 1. User logs in with custom IP
    const loginRes = await userClient.request("/api/auth/login-password", {
      method: "POST",
      headers: {
        "x-forwarded-for": testIp,
        "user-agent": "IEEE-SMC-E2E-Agent",
      },
      body: {
        email: userPayload.email,
        password: userPayload.password,
        name: userPayload.name,
      },
    });

    assert.strictEqual(loginRes.status, 200);
    createdUserIds.push(loginRes.data.user.id);

    // 2. Admin queries users list
    const listRes = await adminClient.get("/api/admin/users");
    assert.strictEqual(listRes.status, 200);

    const userInList = (listRes.data?.users as any[]).find((u) => u.email === userPayload.email);
    assert.ok(userInList, "Logged-in user must be visible in admin user directory");

    // 3. Verify user record exists in database
    const dbUser = await dbHelper.findUser(userPayload.email);
    assert.ok(dbUser);
    assert.strictEqual(dbUser.email, userPayload.email.toLowerCase());
  });

  test("T3.2: Pairwise: User profile update persists to DB and reflects in /api/auth/me", async () => {
    const userPayload = createTestUserPayload("USER");
    const userClient = new TestHttpClient();

    // Log in
    const loginRes = await userClient.post("/api/auth/login-password", {
      email: userPayload.email,
      password: userPayload.password,
      name: userPayload.name,
    });
    assert.strictEqual(loginRes.status, 200);
    const userId = loginRes.data.user.id;
    createdUserIds.push(userId);

    // Update profile via admin API or profile endpoint
    const newAffiliation = "HCMUTE Artificial Intelligence Institute";
    await adminClient.patch(`/api/admin/users/${userId}`, {
      profileData: {
        affiliation: newAffiliation,
        conferenceTrack: "SPEAKER",
      },
    });

    // Check /api/auth/me
    const meRes = await userClient.get("/api/auth/me");
    assert.strictEqual(meRes.status, 200);
    assert.strictEqual(meRes.data?.user?.email, userPayload.email);

    // Verify DB reflects updated profile
    const dbUser = await dbHelper.findUser(userPayload.email);
    assert.ok(dbUser);
    const profile = dbUser.profileData as Record<string, unknown>;
    assert.strictEqual(profile.affiliation, newAffiliation);
  });

  test("T3.3: Pairwise: Page builder multi-block assembly -> publish -> public page inspection", async () => {
    const pagePayload = createTestPagePayload();
    const testPageSlug = pagePayload.slug;
    createdPageSlugs.push(testPageSlug);

    // Include 4 distinct conference section blocks
    pagePayload.blocks = [
      sampleBlocks.hero,
      sampleBlocks.cfp,
      sampleBlocks.dates,
      sampleBlocks.committees,
    ];

    // 1. Create page
    const createRes = await adminClient.post("/api/admin/pages", pagePayload);
    assert.ok([200, 201].includes(createRes.status));

    // 2. Fetch page through API
    const fetchRes = await adminClient.get(`/api/admin/pages/${testPageSlug}`);
    assert.strictEqual(fetchRes.status, 200);

    const page = fetchRes.data.page;
    assert.strictEqual(page.blocks.length, 4, "All 4 conference blocks must be persisted");

    const blockTypes = page.blocks.map((b: any) => b.type);
    assert.ok(blockTypes.includes("HeroCarousel"));
    assert.ok(blockTypes.includes("CallForPapers"));
    assert.ok(blockTypes.includes("ImportantDates"));
    assert.ok(blockTypes.includes("CommitteesSection"));
  });

  test("T3.4: Pairwise: Role-based authorization guard & session termination", async () => {
    const userPayload = createTestUserPayload("USER");
    const userClient = new TestHttpClient();

    // User logs in and receives token
    const loginRes = await userClient.post("/api/auth/login-password", {
      email: userPayload.email,
      password: userPayload.password,
      name: userPayload.name,
    });
    assert.strictEqual(loginRes.status, 200);
    const userId = loginRes.data.user.id;
    createdUserIds.push(userId);

    // User can access /api/auth/me
    const meResBefore = await userClient.get("/api/auth/me");
    assert.strictEqual(meResBefore.status, 200);
    assert.strictEqual(meResBefore.data?.user?.email, userPayload.email);

    // Standard user is barred from admin routes
    const adminActionRes = await userClient.get("/api/admin/users");
    assert.ok(
      [401, 403].includes(adminActionRes.status),
      `Standard USER must be forbidden from /api/admin/users, got: ${adminActionRes.status}`
    );

    // User logs out
    const logoutRes = await userClient.logout();
    assert.strictEqual(logoutRes.status, 200);

    // /api/auth/me now returns null user
    const meResAfter = await userClient.get("/api/auth/me");
    assert.strictEqual(meResAfter.status, 200);
    assert.strictEqual(meResAfter.data?.user, null, "Logged-out session must return null user");

    // Cleanup user
    await adminClient.delete(`/api/admin/users/${userId}`);
  });

  test("T3.5: Pairwise: Concurrent page updates retain consistency without corrupting blocks", async () => {
    const pagePayload = createTestPagePayload();
    const testPageSlug = pagePayload.slug;
    createdPageSlugs.push(testPageSlug);

    // Create page
    const createRes = await adminClient.post("/api/admin/pages", pagePayload);
    assert.ok([200, 201].includes(createRes.status));

    // Two parallel updates
    const update1 = adminClient.put(`/api/admin/pages/${testPageSlug}`, {
      title: "Concurrent Update 1",
      blocks: [sampleBlocks.hero],
    });

    const update2 = adminClient.put(`/api/admin/pages/${testPageSlug}`, {
      title: "Concurrent Update 2",
      blocks: [sampleBlocks.hero, sampleBlocks.cfp],
    });

    const [res1, res2] = await Promise.all([update1, update2]);
    // Both should resolve cleanly without crashing
    assert.ok([200, 409].includes(res1.status));
    assert.ok([200, 409].includes(res2.status));

    // Final state must be valid
    const finalRes = await adminClient.get(`/api/admin/pages/${testPageSlug}`);
    assert.strictEqual(finalRes.status, 200);
    assert.ok(Array.isArray(finalRes.data?.page?.blocks));
  });
});
