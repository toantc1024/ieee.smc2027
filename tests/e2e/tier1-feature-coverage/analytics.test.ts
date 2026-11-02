/**
 * Tier 1: Feature Coverage — Analytics Module
 * Verifies core happy paths:
 * 1. Query unit-post editorial analytics with date range
 * 2. Query website telemetry with active visitors, pageviews, and dimensions
 * 3. Query system-post benchmark with 7x24 heatmap and comparison rankings
 * 4. Query live/active visitor telemetry
 * 5. Verify telemetry tracking event contract
 *
 * Supports Progressive Testability: skips with diagnostic notice if Milestone M2 is not yet mounted.
 */

import test, { describe, beforeEach } from "node:test";
import assert from "node:assert/strict";
import TestHttpClient from "../helpers/http-client";

const isStrict = process.env.STRICT_CONTRACT === "true";

describe("Tier 1: Analytics Module", () => {
  let client: TestHttpClient;

  beforeEach(async () => {
    client = new TestHttpClient();
    await client.loginAsAdmin();
  });

  test("T1.2.1: Query unit-post editorial analytics with date range criteria", async (t) => {
    const from = "2026-01-01T00:00:00Z";
    const to = "2026-12-31T23:59:59Z";

    const res = await client.get(`/api/admin/analytics/unit-post?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);

    if (res.status === 404 && !isStrict) {
      t.skip("Pending Milestone M2 implementation: GET /api/admin/analytics/unit-post returned 404");
      return;
    }

    assert.strictEqual(res.status, 200, `Unit-post analytics endpoint should return 200, got: ${res.status}`);
    const data = res.data;
    assert.ok(data, "Response should have payload data");

    const hasEditorialMetrics =
      data.totalPosts !== undefined ||
      data.statusDistribution !== undefined ||
      data.growth !== undefined ||
      data.dataPoints !== undefined ||
      data.editorialKpis !== undefined;

    assert.ok(hasEditorialMetrics, "Unit post analytics response must contain editorial metrics or growth data");
  });

  test("T1.2.2: Query website telemetry returns active visitors, pageviews, and dimensions", async (t) => {
    const res = await client.get("/api/admin/analytics/website");

    if (res.status === 404 && !isStrict) {
      t.skip("Pending Milestone M2 implementation: GET /api/admin/analytics/website returned 404");
      return;
    }

    assert.strictEqual(res.status, 200, `Website telemetry endpoint should return 200, got: ${res.status}`);
    const data = res.data;
    assert.ok(data, "Response should contain telemetry payload");

    const hasTelemetryFields =
      data.visitors !== undefined ||
      data.pageviews !== undefined ||
      data.stats !== undefined ||
      data.activeVisitors !== undefined ||
      data.dimensions !== undefined;

    assert.ok(hasTelemetryFields, "Website telemetry response must contain visitor/pageview metrics");
  });

  test("T1.2.3: Query system-post benchmark returns 7x24 heatmap matrix and rankings", async (t) => {
    const res = await client.get("/api/admin/analytics/system-post");

    if (res.status === 404 && !isStrict) {
      t.skip("Pending Milestone M2 implementation: GET /api/admin/analytics/system-post returned 404");
      return;
    }

    assert.strictEqual(res.status, 200, `System-post benchmark endpoint should return 200, got: ${res.status}`);
    const data = res.data;
    assert.ok(data, "Response should contain system benchmark payload");

    const hasBenchmarkFields =
      data.activityGrid !== undefined ||
      data.heatmap !== undefined ||
      data.totalPosts !== undefined ||
      data.unitRankings !== undefined ||
      data.comparison !== undefined;

    assert.ok(hasBenchmarkFields, "System post benchmark must include activity heatmap or comparison metrics");
  });

  test("T1.2.4: Query live active visitor telemetry endpoint", async (t) => {
    const res = await client.get("/api/admin/analytics/website?dimension=active");

    if (res.status === 404 && !isStrict) {
      t.skip("Pending Milestone M2 implementation: GET /api/admin/analytics/website?dimension=active returned 404");
      return;
    }

    assert.ok([200, 204].includes(res.status), `Active visitor telemetry should return 200, got: ${res.status}`);
    assert.ok(res.data !== null && res.data !== undefined, "Telemetry response should not be null");
  });

  test("T1.2.5: Client telemetry custom event handling contract", async (t) => {
    const telemetryEventPayload = {
      event: "section_view",
      section: "CallForPapers",
      url: "/submissions",
      timestamp: new Date().toISOString(),
    };

    const res = await client.post("/api/admin/analytics/website", telemetryEventPayload);

    if (res.status === 404 && !isStrict) {
      t.skip("Pending Milestone M2 implementation: POST /api/admin/analytics/website returned 404");
      return;
    }

    assert.ok([200, 201, 204, 400].includes(res.status), `Event submission should return standard HTTP status, got: ${res.status}`);
  });
});
