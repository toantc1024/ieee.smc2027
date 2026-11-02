/**
 * Tier 2: Boundary & Corner Cases — Analytics Module
 * Tests:
 * 1. Unauthenticated access guard returns 401/403
 * 2. Inverted date range (from > to) handled safely
 * 3. Zero-traffic / future date range returns empty structures, not 500
 * 4. Invalid dimension filter query parameters
 * 5. Malformed date-time strings handled safely
 *
 * Supports Progressive Testability: skips with diagnostic notice if Milestone M2 is not yet mounted.
 */

import test, { describe, beforeEach } from "node:test";
import assert from "node:assert/strict";
import TestHttpClient from "../helpers/http-client";

const isStrict = process.env.STRICT_CONTRACT === "true";

describe("Tier 2: Analytics Module Boundary & Corner Cases", () => {
  let adminClient: TestHttpClient;
  let unauthClient: TestHttpClient;

  beforeEach(async () => {
    adminClient = new TestHttpClient();
    await adminClient.loginAsAdmin();
    unauthClient = new TestHttpClient();
  });

  test("T2.2.1: Unauthenticated access to analytics endpoints returns HTTP 401/403", async (t) => {
    const endpoints = [
      "/api/admin/analytics/unit-post",
      "/api/admin/analytics/website",
      "/api/admin/analytics/system-post",
    ];

    for (const ep of endpoints) {
      const res = await unauthClient.get(ep);
      if (res.status === 404 && !isStrict) {
        t.skip(`Pending Milestone M2 implementation: ${ep} returned 404`);
        return;
      }
      assert.ok(
        [401, 403].includes(res.status),
        `Unauthenticated access to ${ep} must return 401 or 403, got: ${res.status}`
      );
    }
  });

  test("T2.2.2: Inverted date ranges (from after to) handled safely without 500", async (t) => {
    const from = "2030-01-01T00:00:00Z";
    const to = "2020-01-01T00:00:00Z";

    const res = await adminClient.get(
      `/api/admin/analytics/unit-post?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
    );

    if (res.status === 404 && !isStrict) {
      t.skip("Pending Milestone M2 implementation: /api/admin/analytics/unit-post returned 404");
      return;
    }

    assert.notStrictEqual(res.status, 500, "Inverted date range must not trigger unhandled 500 crash");
    assert.ok([200, 400].includes(res.status), `Expected 200 or 400, got ${res.status}`);
  });

  test("T2.2.3: Zero-traffic date interval query returns structured empty metric DTOs", async (t) => {
    const from = "2099-01-01T00:00:00Z";
    const to = "2099-01-02T00:00:00Z";

    const res = await adminClient.get(
      `/api/admin/analytics/website?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
    );

    if (res.status === 404 && !isStrict) {
      t.skip("Pending Milestone M2 implementation: /api/admin/analytics/website returned 404");
      return;
    }

    assert.notStrictEqual(res.status, 500, "Empty date range must not throw 500");
    if (res.status === 200) {
      assert.ok(res.data, "Should return empty data structure rather than null or crashing");
    }
  });

  test("T2.2.4: Invalid or unsupported dimension filter handled cleanly", async (t) => {
    const res = await adminClient.get("/api/admin/analytics/website?dimension=unknown_unsupported_dim");

    if (res.status === 404 && !isStrict) {
      t.skip("Pending Milestone M2 implementation: /api/admin/analytics/website returned 404");
      return;
    }

    assert.notStrictEqual(res.status, 500, "Invalid dimension must not crash server");
    assert.ok([200, 400].includes(res.status), `Expected 200 or 400 for invalid dimension, got: ${res.status}`);
  });

  test("T2.2.5: Malformed non-ISO timestamp string handled cleanly", async (t) => {
    const malformed = "not-a-valid-date-string-xyz";
    const res = await adminClient.get(
      `/api/admin/analytics/unit-post?from=${encodeURIComponent(malformed)}`
    );

    if (res.status === 404 && !isStrict) {
      t.skip("Pending Milestone M2 implementation: /api/admin/analytics/unit-post returned 404");
      return;
    }

    assert.notStrictEqual(res.status, 500, "Malformed date query parameter must not throw 500");
    assert.ok([200, 400].includes(res.status), `Expected 200 or 400 for malformed date, got: ${res.status}`);
  });
});
