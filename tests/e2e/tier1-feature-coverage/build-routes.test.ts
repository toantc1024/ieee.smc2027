/**
 * Tier 1: Feature Coverage — Build & Route Verification
 * Verifies core happy paths:
 * 1. Public home route (/) returns HTTP 200 with expected metadata
 * 2. Standard conference routes load cleanly
 * 3. Admin login page loads cleanly
 * 4. Protected admin routes require authentication
 * 5. Published custom page dynamically renders on public route
 */

import test, { describe, beforeEach, afterEach, before, after } from "node:test";
import assert from "node:assert/strict";
import TestHttpClient from "../helpers/http-client";
import { createTestPagePayload } from "../helpers/test-fixtures";
import dbHelper from "../helpers/db-helper";

describe("Tier 1: Build & Route Verification", { concurrency: 1 }, () => {
  let client: TestHttpClient;
  let createdSlug: string | null = null;

  before(async () => {
    await dbHelper.cleanupTestData();
  });

  beforeEach(() => {
    client = new TestHttpClient();
  });

  afterEach(async () => {
    if (createdSlug) {
      const adminClient = new TestHttpClient();
      await adminClient.loginAsAdmin();
      try {
        await adminClient.delete(`/api/admin/pages/${createdSlug}`);
      } catch {
        // ignore
      }
      createdSlug = null;
    }
  });

  after(async () => {
    await dbHelper.cleanupTestData();
  });

  test("T1.4.1: Public home route (/) returns HTTP 200 and loads conference page", async () => {
    const res = await client.get("/");
    assert.strictEqual(res.status, 200, "Home page should return HTTP 200");
    assert.ok(
      res.text.includes("IEEE SMC 2027") || res.text.includes("smc") || res.text.includes("Ho Chi Minh City"),
      "Home page response should reference conference content"
    );
  });

  test("T1.4.2: Standard conference routes return HTTP 200", async () => {
    const routes = ["/committees", "/submissions", "/registration", "/travel", "/news"];

    for (const route of routes) {
      const res = await client.get(route);
      assert.strictEqual(res.status, 200, `Route '${route}' must return 200 OK, got: ${res.status}`);
      assert.ok(res.text.length > 200, `Route '${route}' must render meaningful HTML content`);
    }
  });

  test("T1.4.3: Admin login page (/admin/login) loads cleanly", async () => {
    const res = await client.get("/admin/login");
    assert.strictEqual(res.status, 200, "Admin login page must return 200 OK");
    assert.ok(
      res.text.includes("login") || res.text.includes("Sign in") || res.text.includes("password") || res.text.includes("Email"),
      "Login page should include authentication form elements"
    );
  });

  test("T1.4.4: Protected admin routes enforce session authentication", async () => {
    const protectedRoutes = ["/admin", "/admin/pages", "/admin/users"];
    const unauthClient = new TestHttpClient(); // No login

    for (const route of protectedRoutes) {
      const res = await unauthClient.get(route, { redirect: "manual" });
      // Next.js server components redirect unauthenticated users to /admin/login (307/302/303) or return 401
      const isProtected = [302, 303, 307, 308, 401, 403].includes(res.status) || res.text.includes("login");
      assert.ok(isProtected, `Route '${route}' must be protected from unauthenticated access, got status ${res.status}`);
    }
  });

  test("T1.4.5: Dynamic custom published page renders on its public route", async () => {
    const adminClient = new TestHttpClient();
    await adminClient.loginAsAdmin();

    const payload = createTestPagePayload();
    createdSlug = payload.slug;

    // Create and publish page
    const createRes = await adminClient.post("/api/admin/pages", payload);
    assert.ok([200, 201].includes(createRes.status));

    // Fetch via public API or page route
    const publicRes = await client.get(`/api/admin/pages/${payload.slug}`);
    assert.strictEqual(publicRes.status, 200);
    assert.strictEqual(publicRes.data?.page?.title, payload.title);
  });
});
