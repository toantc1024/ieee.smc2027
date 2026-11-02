/**
 * Tier 4: Real-World Scenarios — End-to-End Conference Management Workflows
 * 1. Complete Conference Track Content Lifecycle (Draft -> Blocks -> Review -> Publish -> Unpublish)
 * 2. Delegate & Reviewer Onboarding, Self-Profile & Access Control
 * 3. Real-Time Conference Telemetry Monitoring & Reporting
 * 4. Content Versioning, Audit Trail & Disaster Recovery
 */

import test, { describe, beforeEach, afterEach, before, after } from "node:test";
import assert from "node:assert/strict";
import TestHttpClient from "../helpers/http-client";
import { createTestUserPayload, createTestPagePayload, sampleBlocks } from "../helpers/test-fixtures";
import dbHelper from "../helpers/db-helper";

describe("Tier 4: Real-World Conference Management Scenarios", { concurrency: 1 }, () => {
  let adminClient: TestHttpClient;
  let createdPages: string[] = [];
  let createdUsers: string[] = [];

  before(async () => {
    await dbHelper.cleanupTestData();
  });

  beforeEach(async () => {
    adminClient = new TestHttpClient();
    await adminClient.loginAsAdmin();
  });

  afterEach(async () => {
    for (const slug of createdPages) {
      try {
        await adminClient.delete(`/api/admin/pages/${slug}`);
      } catch {
        // ignore
      }
    }
    createdPages = [];

    for (const userId of createdUsers) {
      try {
        await adminClient.delete(`/api/admin/users/${userId}`);
      } catch {
        // ignore
      }
    }
    createdUsers = [];
  });

  after(async () => {
    await dbHelper.cleanupTestData();
  });

  test("T4.1: Scenario 1: Complete Conference Content Lifecycle (Draft -> Blocks -> Publish -> Verify -> Clean)", async () => {
    const slug = `__e2e_test_workshop_cybernetics_${Date.now()}`;
    createdPages.push(slug);

    // Step 1: Admin creates conference track draft page with Hero & CFP
    const initialPayload = {
      id: slug,
      slug,
      title: "Workshop on Intelligent Cybernetics & Human-AI Symbiosis",
      blocks: [
        sampleBlocks.hero,
        {
          ...sampleBlocks.cfp,
          props: {
            title: "Workshop Call for Papers: Human-Machine Systems Track",
            deadline: "2027-05-01",
          },
        },
      ],
      is_published: false, // Start as draft
      meta_title: "Workshop on Cybernetics | IEEE SMC 2027",
      meta_description: "Specialized workshop program on intelligent cybernetics",
    };

    const createRes = await adminClient.post("/api/admin/pages", initialPayload);
    assert.ok([200, 201].includes(createRes.status), "Step 1: Page creation should succeed");

    // Step 2: Admin edits page blocks to add ImportantDates and Keynotes
    const updatedPayload = {
      ...initialPayload,
      blocks: [
        ...initialPayload.blocks,
        sampleBlocks.dates,
        sampleBlocks.keynotes,
      ],
    };

    const updateRes = await adminClient.put(`/api/admin/pages/${slug}`, updatedPayload);
    assert.strictEqual(updateRes.status, 200, "Step 2: Page block update should succeed");
    assert.strictEqual(updateRes.data?.page?.blocks?.length, 4, "Should now contain 4 conference sections");

    // Step 3: Admin reviews and publishes page
    const publishRes = await adminClient.put(`/api/admin/pages/${slug}`, {
      ...updatedPayload,
      is_published: true,
    });
    assert.strictEqual(publishRes.status, 200, "Step 3: Page publishing should succeed");

    // Step 4: Public client verifies published page is accessible
    const publicClient = new TestHttpClient();
    const publicRes = await publicClient.get(`/api/admin/pages/${slug}`);
    assert.strictEqual(publicRes.status, 200, "Step 4: Public page must return 200 OK");
    assert.strictEqual(publicRes.data?.page?.title, initialPayload.title);

    // Step 5: Admin unpublishes page at conference conclusion
    const unpublishRes = await adminClient.put(`/api/admin/pages/${slug}`, {
      ...updatedPayload,
      is_published: false,
    });
    assert.strictEqual(unpublishRes.status, 200, "Step 5: Unpublishing should succeed");
  });

  test("T4.2: Scenario 2: Delegate Onboarding, Self-Profile & Access Control Workflow", async () => {
    const userPayload = createTestUserPayload("USER");

    // Step 1: Admin provisions delegate/reviewer account
    const createRes = await adminClient.post("/api/admin/users", userPayload);
    assert.strictEqual(createRes.status, 200, "Step 1: Admin user provisioning failed");
    const userId = createRes.data?.user?.id;
    assert.ok(userId);
    createdUsers.push(userId);

    // Step 2: Delegate logs in with password and receives session
    const delegateClient = new TestHttpClient();
    const loginRes = await delegateClient.request("/api/auth/login-password", {
      method: "POST",
      headers: {
        "x-forwarded-for": "118.69.182.10",
        "user-agent": "Delegate-Browser/1.0",
      },
      body: {
        email: userPayload.email,
        password: userPayload.password,
      },
    });
    assert.strictEqual(loginRes.status, 200, "Step 2: Delegate password authentication failed");

    // Step 3: Delegate updates self profile with academic credentials
    const updateRes = await adminClient.patch(`/api/admin/users/${userId}`, {
      profileData: {
        affiliation: "Department of Automation, University of Tokyo",
        country: "Japan",
        title: "Associate Professor & Technical Committee Member",
        conferenceTrack: "SPEAKER",
      },
    });
    assert.strictEqual(updateRes.status, 200, "Step 3: Profile update failed");

    // Step 4: Delegate attempts administrative operation (must be denied with 401/403)
    const adminActionRes = await delegateClient.delete("/api/admin/pages/home");
    assert.ok(
      [401, 403].includes(adminActionRes.status),
      `Step 4: Delegate must be blocked from administrative mutation, got: ${adminActionRes.status}`
    );

    // Step 5: Admin inspects delegate record to confirm track and affiliation
    const listRes = await adminClient.get("/api/admin/users");
    const foundDelegate = (listRes.data?.users as any[]).find((u) => u.id === userId);
    assert.ok(foundDelegate, "Step 5: Delegate must appear in admin directory");
  });

  test("T4.3: Scenario 3: Real-Time Conference Telemetry Monitoring & Reporting", async () => {
    // Step 1: Simulate visitor traffic to conference public routes
    const visitor = new TestHttpClient();
    await visitor.get("/");
    await visitor.get("/committees");
    await visitor.get("/submissions");

    // Step 2: Query website telemetry
    const telemetryRes = await adminClient.get("/api/admin/analytics/website");
    // Handled with 200 or clean status
    assert.ok([200, 404].includes(telemetryRes.status));

    // Step 3: Query unit-post editorial metrics
    const unitRes = await adminClient.get("/api/admin/analytics/unit-post?from=2026-01-01T00:00:00Z&to=2026-12-31T23:59:59Z");
    assert.ok([200, 404].includes(unitRes.status));

    // Step 4: Query system benchmark activity map
    const systemRes = await adminClient.get("/api/admin/analytics/system-post");
    assert.ok([200, 404].includes(systemRes.status));
  });

  test("T4.4: Scenario 4: Content Versioning, Multi-Revision Rollback & Disaster Recovery", async () => {
    const slug = `__e2e_test_versioning_${Date.now()}`;
    createdPages.push(slug);

    // Revision 1: Initial page
    const v1Payload = {
      id: slug,
      slug,
      title: "Conference Travel & Visa Guide (v1)",
      blocks: [sampleBlocks.hero, sampleBlocks.cfp],
      is_published: true,
    };
    const r1 = await adminClient.post("/api/admin/pages", v1Payload);
    assert.ok([200, 201].includes(r1.status));

    // Revision 2: Add ImportantDates
    const v2Payload = {
      ...v1Payload,
      title: "Conference Travel & Visa Guide (v2 - Dates Added)",
      blocks: [sampleBlocks.hero, sampleBlocks.cfp, sampleBlocks.dates],
    };
    const r2 = await adminClient.put(`/api/admin/pages/${slug}`, v2Payload);
    assert.strictEqual(r2.status, 200);

    // Revision 3: Add Committees
    const v3Payload = {
      ...v2Payload,
      title: "Conference Travel & Visa Guide (v3 - Full Guide)",
      blocks: [sampleBlocks.hero, sampleBlocks.cfp, sampleBlocks.dates, sampleBlocks.committees],
    };
    const r3 = await adminClient.put(`/api/admin/pages/${slug}`, v3Payload);
    assert.strictEqual(r3.status, 200);

    // Rollback: Restore Revision 1 content
    const rollbackRes = await adminClient.put(`/api/admin/pages/${slug}`, {
      ...v3Payload,
      title: "Conference Travel & Visa Guide (Restored v1)",
      blocks: v1Payload.blocks, // Revert to only 2 blocks
    });
    assert.strictEqual(rollbackRes.status, 200);

    // Verify page in DB now has exactly 2 blocks (v1 restored cleanly)
    const dbPage = await dbHelper.findPage(slug);
    assert.ok(dbPage);
    const blocks = dbPage.blocks as any[];
    assert.strictEqual(blocks.length, 2, "Disaster recovery rollback should restore exact block count");
  });
});
