/**
 * Tier 1: Feature Coverage — Page Editor / Website Builder
 * Verifies core happy paths:
 * 1. List conference pages (all standard pages seeded)
 * 2. Fetch single page by ID or slug
 * 3. Create a new custom conference page
 * 4. Update page blocks, title, and metadata
 * 5. Delete custom page cleanly
 */

import test, { describe, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import TestHttpClient from "../helpers/http-client";
import { createTestPagePayload, sampleBlocks } from "../helpers/test-fixtures";
import dbHelper from "../helpers/db-helper";

describe("Tier 1: Page Editor / Website Builder Module", () => {
  let client: TestHttpClient;
  let createdPageSlug: string | null = null;

  beforeEach(async () => {
    client = new TestHttpClient();
    await client.loginAsAdmin();
  });

  afterEach(async () => {
    if (createdPageSlug) {
      try {
        await client.delete(`/api/admin/pages/${createdPageSlug}`);
      } catch {
        // ignore
      }
      createdPageSlug = null;
    }
    await dbHelper.cleanupTestData();
  });

  test("T1.1.1: List conference pages returns standard pages with blocks structure", async () => {
    const res = await client.get("/api/admin/pages");
    assert.strictEqual(res.status, 200, "Should return HTTP 200 for pages list");
    assert.ok(Array.isArray(res.data?.pages), "Response data.pages should be an array");

    const pages = res.data.pages as Array<{ slug: string; title: string; blocks: any[] }>;
    const slugs = pages.map((p) => p.slug);

    // Standard conference pages required by IEEE SMC 2027
    const expectedSlugs = ["home", "committees", "submissions", "registration", "program", "travel", "news"];
    for (const expected of expectedSlugs) {
      assert.ok(
        slugs.includes(expected),
        `Standard conference pages list must include '${expected}', found: ${slugs.join(", ")}`
      );
    }

    const homePage = pages.find((p) => p.slug === "home");
    assert.ok(homePage, "Home page must exist");
    assert.ok(Array.isArray(homePage.blocks) && homePage.blocks.length > 0, "Home page must contain block definitions");
  });

  test("T1.1.2: Fetch single page by ID/slug returns complete block AST and metadata", async () => {
    const res = await client.get("/api/admin/pages/home");
    assert.strictEqual(res.status, 200, "Should fetch home page with 200 OK");
    assert.ok(res.data?.page, "Response should contain page object");

    const page = res.data.page;
    assert.strictEqual(page.slug, "home");
    assert.strictEqual(page.title, "Home");
    assert.ok(page.is_published !== undefined || page.isPublished !== undefined, "Page should have publication flag");
    assert.ok(Array.isArray(page.blocks), "Page blocks should be an array");
  });

  test("T1.1.3: Create new conference page with initial block configuration", async () => {
    const payload = createTestPagePayload();
    createdPageSlug = payload.slug;

    const res = await client.post("/api/admin/pages", payload);
    assert.ok([200, 201].includes(res.status), `Create page should return 200/201, got ${res.status}: ${res.text}`);
    assert.ok(res.data?.page, "Created response should include page object");

    const page = res.data.page;
    assert.strictEqual(page.slug, payload.slug);
    assert.strictEqual(page.title, payload.title);
    assert.strictEqual(page.blocks?.length, 3, "Should persist all 3 initial blocks");

    // Verify in database directly
    const dbPage = await dbHelper.findPage(payload.slug);
    assert.ok(dbPage, "Page must be persisted in database");
    assert.strictEqual(dbPage.title, payload.title);
  });

  test("T1.1.4: Update page blocks, title, and metadata", async () => {
    const payload = createTestPagePayload();
    createdPageSlug = payload.slug;

    // Create first
    const createRes = await client.post("/api/admin/pages", payload);
    assert.ok([200, 201].includes(createRes.status), "Page creation failed");

    // Update with new block and updated title
    const updatedTitle = `${payload.title} — Revised`;
    const updateRes = await client.put(`/api/admin/pages/${payload.slug}`, {
      title: updatedTitle,
      meta_title: `Updated | ${updatedTitle}`,
      meta_description: "Updated meta description for testing",
      blocks: [...payload.blocks, sampleBlocks.committees],
    });

    assert.strictEqual(updateRes.status, 200, `Update should return 200, got ${updateRes.status}: ${updateRes.text}`);
    assert.ok(updateRes.data?.page, "Updated page object should be returned");
    assert.strictEqual(updateRes.data.page.title, updatedTitle);

    // Verify fetch reflects changes
    const fetchRes = await client.get(`/api/admin/pages/${payload.slug}`);
    assert.strictEqual(fetchRes.status, 200);
    assert.strictEqual(fetchRes.data.page.title, updatedTitle);
    assert.strictEqual(fetchRes.data.page.blocks.length, 4, "Should now have 4 blocks");
  });

  test("T1.1.5: Delete custom page removes it cleanly from list and database", async () => {
    const payload = createTestPagePayload();
    const createRes = await client.post("/api/admin/pages", payload);
    assert.ok([200, 201].includes(createRes.status));

    // Delete custom page
    const deleteRes = await client.delete(`/api/admin/pages/${payload.slug}`);
    assert.strictEqual(deleteRes.status, 200, `Delete should return 200, got: ${deleteRes.text}`);

    // Verify page no longer exists
    const fetchRes = await client.get(`/api/admin/pages/${payload.slug}`);
    assert.strictEqual(fetchRes.status, 404, "Deleted page should return 404 Not Found");

    const dbPage = await dbHelper.findPage(payload.slug);
    assert.strictEqual(dbPage, null, "Page should be deleted from database");
  });
});
