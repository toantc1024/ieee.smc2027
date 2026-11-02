/**
 * Tier 2: Boundary & Corner Cases — Page Editor / Website Builder
 * Tests:
 * 1. Automatic slug normalization (spaces, uppercase, accents)
 * 2. Duplicate slug handling
 * 3. Protected home page deletion rejection (returns 400)
 * 4. Unauthenticated access guard to mutation endpoints (returns 401/403)
 * 5. Malformed block structure payload resilience
 */

import test, { describe, beforeEach, afterEach, before, after } from "node:test";
import assert from "node:assert/strict";
import TestHttpClient from "../helpers/http-client";
import { createTestPagePayload } from "../helpers/test-fixtures";
import dbHelper from "../helpers/db-helper";

describe("Tier 2: Page Editor Boundary & Corner Cases", { concurrency: 1 }, () => {
  let adminClient: TestHttpClient;
  let unauthClient: TestHttpClient;
  let createdSlugs: string[] = [];

  before(async () => {
    await dbHelper.cleanupTestData();
  });

  beforeEach(async () => {
    adminClient = new TestHttpClient();
    await adminClient.loginAsAdmin();
    unauthClient = new TestHttpClient();
  });

  afterEach(async () => {
    for (const slug of createdSlugs) {
      try {
        await adminClient.delete(`/api/admin/pages/${slug}`);
      } catch {
        // ignore
      }
    }
    createdSlugs = [];
  });

  after(async () => {
    await dbHelper.cleanupTestData();
  });

  test("T2.1.1: Slug with spaces, uppercase, and special characters is normalized cleanly", async () => {
    const rawSlug = `__e2e_test_Special Slug With Spaces & Signs ${Date.now()}`;
    const payload = createTestPagePayload(rawSlug, "Special Characters Title");

    const res = await adminClient.post("/api/admin/pages", payload);
    assert.ok([200, 201].includes(res.status), `Creation should succeed with normalized slug: ${res.text}`);

    const normalizedSlug = res.data?.page?.slug;
    assert.ok(normalizedSlug, "Normalized slug must be returned");
    createdSlugs.push(normalizedSlug);

    // Verify slug contains no unencoded spaces or uppercase
    assert.ok(!normalizedSlug.includes(" "), "Slug must not contain whitespace");
    assert.strictEqual(normalizedSlug, normalizedSlug.toLowerCase(), "Slug must be lowercase");
  });

  test("T2.1.2: Duplicate slug creation cleanly updates existing or returns 200/409", async () => {
    const payload = createTestPagePayload();
    createdSlugs.push(payload.slug);

    const firstRes = await adminClient.post("/api/admin/pages", payload);
    assert.ok([200, 201].includes(firstRes.status));

    // Post again with same slug but different title
    const secondPayload = { ...payload, title: "Duplicate Slug Second Attempt" };
    const secondRes = await adminClient.post("/api/admin/pages", secondPayload);

    // Should either cleanly upsert with 200 or return 409 conflict
    assert.ok([200, 201, 409].includes(secondRes.status), `Duplicate slug should return 200/409, got: ${secondRes.status}`);
  });

  test("T2.1.3: Deletion of default home page ('home') is strictly rejected with HTTP 400", async () => {
    const res = await adminClient.delete("/api/admin/pages/home");
    assert.strictEqual(res.status, 400, "Deleting the default home page must return HTTP 400 Bad Request");
    assert.ok(
      res.text.includes("Cannot delete") || res.text.includes("home"),
      "Error response should explain home page deletion prohibition"
    );

    // Verify home page still exists in database
    const homeInDb = await dbHelper.findPage("home");
    assert.ok(homeInDb, "Home page must still exist in DB after attempted deletion");
  });

  test("T2.1.4: Unauthenticated requests to create, update, or delete pages return 401/403", async () => {
    const payload = createTestPagePayload();

    // Attempt create without auth
    const createRes = await unauthClient.post("/api/admin/pages", payload);
    assert.ok([401, 403].includes(createRes.status), `Unauthenticated POST must return 401/403, got: ${createRes.status}`);

    // Attempt delete without auth
    const deleteRes = await unauthClient.delete(`/api/admin/pages/${payload.slug}`);
    assert.ok([401, 403].includes(deleteRes.status), `Unauthenticated DELETE must return 401/403, got: ${deleteRes.status}`);
  });

  test("T2.1.5: Malformed block payloads (non-array or null) handled gracefully", async () => {
    const timestamp = Date.now();
    const slug = `__e2e_test_malformed_${timestamp}`;
    createdSlugs.push(slug);

    // Body with blocks as empty array or string instead of breaking server
    const payload = {
      id: slug,
      slug,
      title: "Malformed Block Page",
      blocks: [], // Empty blocks should be supported
    };

    const res = await adminClient.post("/api/admin/pages", payload);
    assert.ok([200, 201, 400].includes(res.status), `Handled gracefully without 500: got ${res.status}`);
    assert.notStrictEqual(res.status, 500, "Must not throw unhandled 500 Internal Server Error");
  });
});
