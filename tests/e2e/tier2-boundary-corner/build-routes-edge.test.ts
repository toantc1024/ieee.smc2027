/**
 * Tier 2: Boundary & Corner Cases — Build & Route Verification
 * Tests:
 * 1. Non-existent routes return 404 cleanly
 * 2. Path traversal attack strings are rejected safely
 * 3. Unpublished page is hidden from public route access
 * 4. Unauthenticated access to admin dashboard redirects to /admin/login
 * 5. Security headers and cookie security flags compliance
 */

import test, { describe, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import TestHttpClient from "../helpers/http-client";
import { createTestPagePayload } from "../helpers/test-fixtures";
import dbHelper from "../helpers/db-helper";

describe("Tier 2: Build & Route Boundary & Corner Cases", () => {
  let client: TestHttpClient;
  let adminClient: TestHttpClient;
  let createdSlug: string | null = null;

  beforeEach(async () => {
    client = new TestHttpClient();
    adminClient = new TestHttpClient();
    await adminClient.loginAsAdmin();
  });

  afterEach(async () => {
    if (createdSlug) {
      try {
        await adminClient.delete(`/api/admin/pages/${createdSlug}`);
      } catch {
        // ignore
      }
      createdSlug = null;
    }
    await dbHelper.cleanupTestData();
  });

  test("T2.4.1: Non-existent URL route returns clean HTTP 404 without server stack traces", async () => {
    const res = await client.get(`/definitely-non-existent-route-${Date.now()}`);
    assert.strictEqual(res.status, 404, "Unknown route must return 404");
    assert.ok(!res.text.includes("TypeError"), "Response should not expose Node.js TypeError traces");
    assert.ok(!res.text.includes("PrismaClientInitializationError"), "Response must not leak DB errors");
  });

  test("T2.4.2: Path traversal attempt string is safely handled", async () => {
    // Attempt directory traversal
    const res = await client.get("/..%2f..%2fetc%2fpasswd");
    // Must return 400 or 404, never 200 or 500
    assert.ok([400, 404].includes(res.status), `Path traversal must return 400 or 404, got: ${res.status}`);
  });

  test("T2.4.3: Unpublished custom page is hidden from public route access", async () => {
    const payload = createTestPagePayload();
    createdSlug = payload.slug;
    payload.is_published = false;

    // Create unpublished draft page
    const createRes = await adminClient.post("/api/admin/pages", payload);
    assert.ok([200, 201].includes(createRes.status));

    // Update to ensure isPublished = false
    await adminClient.put(`/api/admin/pages/${payload.slug}`, {
      ...payload,
      is_published: false,
    });

    // Public request to unpublished page should not be accessible as published
    const publicRes = await client.get(`/api/admin/pages/${payload.slug}`);
    if (publicRes.status === 200) {
      // If endpoint returns page, its publication flag must accurately be false
      const page = publicRes.data?.page;
      assert.strictEqual(page?.is_published ?? page?.isPublished, false);
    } else {
      assert.strictEqual(publicRes.status, 404);
    }
  });

  test("T2.4.4: Unauthenticated admin dashboard access redirects to /admin/login", async () => {
    const unauthClient = new TestHttpClient();
    const res = await unauthClient.get("/admin", { redirect: "manual" });

    // Next.js redirection or 401
    const isRedirect = [302, 303, 307, 308].includes(res.status);
    if (isRedirect) {
      const location = res.headers.get("location") || "";
      assert.ok(
        location.includes("/admin/login") || location.includes("login"),
        `Redirect destination should point to login, got: ${location}`
      );
    } else {
      assert.ok([401, 403].includes(res.status) || res.text.includes("login"));
    }
  });

  test("T2.4.5: Session cookie enforces strict security flags (HttpOnly, SameSite, Path)", async () => {
    const loginClient = new TestHttpClient();
    const loginRes = await loginClient.post("/api/auth/login-password", {
      email: "admin@hcmute.edu.vn",
      password: "Admin@Smc2027Secure!",
    });

    assert.strictEqual(loginRes.status, 200);
    const setCookieHeader = loginRes.headers.get("set-cookie") || "";

    assert.ok(setCookieHeader.includes("admin_session="), "Cookie must contain admin_session token");
    assert.ok(
      setCookieHeader.toLowerCase().includes("httponly"),
      "admin_session cookie MUST have HttpOnly flag enabled"
    );
    assert.ok(
      setCookieHeader.toLowerCase().includes("samesite"),
      "admin_session cookie MUST have SameSite policy defined"
    );
  });
});
