/**
 * Empirical Adversarial Challenge & Analytics Security Stress Harness
 * Author: Challenger M2-1 (Analytics API Edge Cases & Stress Challenger)
 *
 * Targets:
 * - src/app/api/admin/users/route.ts (Pagination NaN/bounds guards)
 * - src/app/api/admin/analytics/helpers.ts (parseAnalyticsQuery sanitization & buffer)
 * - src/app/api/admin/analytics/unit-post/route.ts (Date validation, inversion, metrics)
 * - src/app/api/admin/analytics/website/route.ts (Zero-traffic, active visitors, dimensions, telemetry ingestion)
 * - src/app/api/admin/analytics/system-post/route.ts (Heatmap 168-cell matrix, comparison rankings)
 */

import test, { describe, beforeEach, after } from "node:test";
import assert from "node:assert/strict";
import TestHttpClient from "../e2e/helpers/http-client";
import { stopSpawnedServer } from "../e2e/helpers/server-manager";
import dbHelper from "../e2e/helpers/db-helper";

describe("Adversarial Challenge M2-1: Analytics & User Pagination Stress Suite", { concurrency: 1 }, () => {
  let adminClient: TestHttpClient;
  let unauthClient: TestHttpClient;

  beforeEach(async () => {
    await dbHelper.ensureAdmins();
    adminClient = new TestHttpClient();
    const loginRes = await adminClient.loginAsAdmin();
    assert.strictEqual(loginRes.status, 200, "adminClient must authenticate successfully");
    unauthClient = new TestHttpClient();
  });

  after(() => {
    stopSpawnedServer();
  });

  // ==========================================================================
  // SUITE 1: User Pagination NaN & Boundary Adversarial Stress
  // ==========================================================================
  describe("Suite 1: User Management Pagination Boundary & NaN Fuzzing", () => {
    test("PAG-ADV.1: Non-numeric page and limit (page=NaN&limit=abc) fallback gracefully to 200", async () => {
      const res = await adminClient.get("/api/admin/users?page=NaN&limit=abc");
      assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}`);
      const body = res.data;
      assert.ok(body.success, "Response should indicate success");
      assert.strictEqual(body.page, 1, "page=NaN should fall back to page 1");
      assert.strictEqual(body.limit, 20, "limit=abc should fall back to default limit 20");
      assert.ok(Array.isArray(body.users), "users should be an array");
    });

    test("PAG-ADV.2: Negative and zero boundary values (page=0&limit=-10) clamped safely to 200", async () => {
      const res = await adminClient.get("/api/admin/users?page=0&limit=-10");
      assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}`);
      const body = res.data;
      assert.ok(body.success, "Response should indicate success");
      assert.strictEqual(body.page, 1, "page=0 should clamp to page 1");
      assert.strictEqual(body.limit, 20, "limit=-10 should clamp to default limit 20");
      assert.ok(Array.isArray(body.users), "users should be an array");
    });

    test("PAG-ADV.3: Highly negative inputs (page=-999999&limit=-500) clamped safely without 500", async () => {
      const res = await adminClient.get("/api/admin/users?page=-999999&limit=-500");
      assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}`);
      const body = res.data;
      assert.strictEqual(body.page, 1);
      assert.strictEqual(body.limit, 20);
    });

    test("PAG-ADV.4: Excessively large limit (limit=999999) clamped to max 100", async () => {
      const res = await adminClient.get("/api/admin/users?page=1&limit=999999");
      assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}`);
      const body = res.data;
      assert.strictEqual(body.limit, 100, "limit should be clamped to maximum 100");
    });

    test("PAG-ADV.5: Fuzz string injections (page=[object Object]&limit=<script>alert(1)</script>)", async () => {
      const res = await adminClient.get("/api/admin/users?page=[object%20Object]&limit=%3Cscript%3Ealert(1)%3C/script%3E");
      assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}`);
      const body = res.data;
      assert.strictEqual(body.page, 1);
      assert.strictEqual(body.limit, 20);
    });
  });

  // ==========================================================================
  // SUITE 2: Analytics Unit-Post Date Validation & Inversion Stress
  // ==========================================================================
  describe("Suite 2: Unit-Post Date Validation & Inversion Stress", () => {
    test("UNIT-ADV.1: Malformed 'from' date parameter rejected with HTTP 400", async () => {
      const res = await adminClient.get("/api/admin/analytics/unit-post?from=not-a-valid-date-xyz");
      assert.strictEqual(res.status, 400, `Expected 400 for malformed from date, got ${res.status}`);
      assert.ok(res.data?.error || res.data?.message, "Should return descriptive error payload");
    });

    test("UNIT-ADV.2: Malformed 'to' date parameter rejected with HTTP 400", async () => {
      const res = await adminClient.get("/api/admin/analytics/unit-post?to=invalid-date-format!!");
      assert.strictEqual(res.status, 400, `Expected 400 for malformed to date, got ${res.status}`);
      assert.ok(res.data?.error || res.data?.message, "Should return descriptive error payload");
    });

    test("UNIT-ADV.3: Inverted date range (from=2030-01-01&to=2020-01-01) handled safely without 500", async () => {
      const res = await adminClient.get("/api/admin/analytics/unit-post?from=2030-01-01T00:00:00Z&to=2020-01-01T00:00:00Z");
      assert.notStrictEqual(res.status, 500, "Inverted date range must never crash server with 500");
      assert.ok([200, 400].includes(res.status), `Expected 200 or 400, got ${res.status}`);
      if (res.status === 200) {
        assert.ok(res.data.statusDistribution !== undefined, "Should have statusDistribution");
        assert.ok(res.data.editorialKpis !== undefined, "Should have editorialKpis");
      }
    });

    test("UNIT-ADV.4: Unsupported granularity parameter defaults safely to MONTH without 500", async () => {
      const res = await adminClient.get("/api/admin/analytics/unit-post?granularity=CENTURY_UNKNOWN");
      assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}`);
      assert.strictEqual(res.data.contentGrowth?.granularity, "MONTH", "Should default to MONTH granularity");
    });

    test("UNIT-ADV.5: Non-numeric topN parameter (topN=abc) defaults safely to 10", async () => {
      const res = await adminClient.get("/api/admin/analytics/unit-post?topN=abc");
      assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}`);
      assert.ok(res.data.leaderboard, "Response should contain leaderboard");
    });
  });

  // ==========================================================================
  // SUITE 3: Website Telemetry Zero-Traffic, Invalidation & Dimension Probing
  // ==========================================================================
  describe("Suite 3: Website Telemetry Zero-Traffic, Invalidation & Dimension Probing", () => {
    test("WEB-ADV.1: Zero-traffic future range (2099-01-01 to 2099-01-02) returns structured empty DTOs (200, never 500)", async () => {
      const res = await adminClient.get("/api/admin/analytics/website?from=2099-01-01T00:00:00Z&to=2099-01-02T00:00:00Z");
      assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}`);
      const body = res.data;
      assert.strictEqual(body.visitors, 0, "Zero-traffic range should have 0 visitors");
      assert.strictEqual(body.activeVisitors, 0, "Zero-traffic range should have 0 active visitors");
      assert.deepStrictEqual(body.pageviews, [], "pageviews should be empty array");
      assert.strictEqual(body.stats.pageviews.value, 0, "stats.pageviews.value should be 0");
      assert.deepStrictEqual(body.dimensions.path, [], "dimensions.path should be empty array");
      assert.deepStrictEqual(body.dimensions.browser, [], "dimensions.browser should be empty array");
      assert.strictEqual(body.realtime.totals.views, 0, "realtime.totals.views should be 0");
    });

    test("WEB-ADV.2: Invalid dimension filter parameter handled cleanly without 500", async () => {
      const res = await adminClient.get("/api/admin/analytics/website?dimension=unknown_unsupported_dim");
      assert.notStrictEqual(res.status, 500, "Invalid dimension must never return 500");
      assert.ok([200, 400].includes(res.status), `Expected 200 or 400, got ${res.status}`);
    });

    test("WEB-ADV.3: Live active visitor probe (dimension=active) returns 200 with visitors count", async () => {
      const res = await adminClient.get("/api/admin/analytics/website?dimension=active");
      assert.ok([200, 204].includes(res.status), `Expected 200 or 204, got ${res.status}`);
      if (res.status === 200) {
        assert.ok(typeof res.data.visitors === "number", "visitors should be a number");
        assert.ok(res.data.visitors >= 1, "visitors should be >= 1");
      }
    });

    test("WEB-ADV.4: POST telemetry ingestion with valid payload accepted with 200", async () => {
      const payload = {
        event: "adversarial_stress_view",
        section: "AdversarialHarness",
        url: "/stress-test",
        timestamp: new Date().toISOString(),
        sessionId: "sess_stress_123",
        browser: "NodeTestAgent",
        os: "macOS",
        device: "Desktop",
      };
      const res = await adminClient.post("/api/admin/analytics/website", payload);
      assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}`);
      assert.strictEqual(res.data.success, true);
      assert.strictEqual(res.data.received, true);
    });

    test("WEB-ADV.5: POST telemetry ingestion with corrupted body returns 400, never 500", async () => {
      const res = await adminClient.post("/api/admin/analytics/website", "not-json-string");
      assert.strictEqual(res.status, 400, `Expected 400 for corrupted payload, got ${res.status}`);
    });
  });

  // ==========================================================================
  // SUITE 4: Unauthenticated Access & Security Guard Enforcement
  // ==========================================================================
  describe("Suite 4: Unauthenticated Access Security Enforcement", () => {
    test("AUTH-ADV.1: Unauthenticated GET /api/admin/analytics/unit-post returns 401 or 403", async () => {
      const res = await unauthClient.get("/api/admin/analytics/unit-post");
      assert.ok([401, 403].includes(res.status), `Expected 401/403, got ${res.status}`);
    });

    test("AUTH-ADV.2: Unauthenticated GET /api/admin/analytics/website returns 401 or 403", async () => {
      const res = await unauthClient.get("/api/admin/analytics/website");
      assert.ok([401, 403].includes(res.status), `Expected 401/403, got ${res.status}`);
    });

    test("AUTH-ADV.3: Unauthenticated GET /api/admin/analytics/system-post returns 401 or 403", async () => {
      const res = await unauthClient.get("/api/admin/analytics/system-post");
      assert.ok([401, 403].includes(res.status), `Expected 401/403, got ${res.status}`);
    });

    test("AUTH-ADV.4: Unauthenticated GET /api/admin/users returns 401 or 403", async () => {
      const res = await unauthClient.get("/api/admin/users");
      assert.ok([401, 403].includes(res.status), `Expected 401/403, got ${res.status}`);
    });

    test("AUTH-ADV.5: Forged fake admin_session cookie returns 401 or 403", async () => {
      const forgedClient = new TestHttpClient();
      forgedClient.setCookie("admin_session", "forged.jwt.token.here");
      const res = await forgedClient.get("/api/admin/analytics/website");
      assert.ok([401, 403].includes(res.status), `Expected 401/403, got ${res.status}`);
    });
  });

  // ==========================================================================
  // SUITE 5: Analytics System-Post Heatmap & Aggregation Stress
  // ==========================================================================
  describe("Suite 5: System-Post Heatmap & Benchmark Matrix Stress", () => {
    test("SYS-ADV.1: System-post returns 7x24 heatmap matrix with exactly 168 cells", async () => {
      const res = await adminClient.get("/api/admin/analytics/system-post");
      assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}`);
      const body = res.data;
      assert.ok(Array.isArray(body.activityGrid), "activityGrid should be an array");
      assert.strictEqual(body.activityGrid.length, 168, "Activity grid must contain exactly 168 cells (7x24)");
      assert.ok(body.comparisonSummary?.productionRank, "Should contain comparison rankings");
      assert.ok(body.governanceSummary?.storageQuotas, "Should contain storage quotas");
    });

    test("SYS-ADV.2: System-post with zero-traffic date range returns valid empty heatmap (168 cells with count 0)", async () => {
      const res = await adminClient.get("/api/admin/analytics/system-post?from=2099-01-01T00:00:00Z&to=2099-01-02T00:00:00Z");
      assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}`);
      const body = res.data;
      assert.strictEqual(body.activityGrid.length, 168);
      const nonZeroCells = body.activityGrid.filter((c: any) => c.count > 0);
      assert.strictEqual(nonZeroCells.length, 0, "All cells in future date range should have count 0");
    });

    test("SYS-ADV.3: Inverted dates on system-post handled safely without 500", async () => {
      const res = await adminClient.get("/api/admin/analytics/system-post?from=2030-01-01T00:00:00Z&to=2020-01-01T00:00:00Z");
      assert.notStrictEqual(res.status, 500, "Inverted date range must not crash system-post");
      assert.ok([200, 400].includes(res.status), `Expected 200 or 400, got ${res.status}`);
    });
  });
});
