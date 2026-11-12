/**
 * Empirical Adversarial Challenge & Page Builder Security Stress Harness
 * Author: Challenger M3-1 (Page Builder & Pages API Adversarial Challenger)
 *
 * Targets:
 * - src/app/api/admin/pages/route.ts (GET with view=tree/flat, POST with slug normalization & 409 conflict)
 * - src/app/api/admin/pages/[id]/route.ts (GET, PUT/PATCH optimistic locking, DELETE protected home & re-parenting)
 * - src/app/api/admin/pages/[id]/publish/route.ts (Publish toggle & draft isolation)
 * - src/app/api/admin/pages/[id]/rollback/route.ts (Version rollback & AST backward/forward compatibility)
 * - src/app/(public)/[slug]/page.tsx (Public dynamic SSR renderer & draft security enforcement)
 * - src/lib/utils.ts (normalizeSlug diacritics & Unicode normalization)
 */

import test, { describe, beforeEach, afterEach, before, after } from "node:test";
import assert from "node:assert/strict";
import TestHttpClient, { HttpResponse } from "../e2e/helpers/http-client";
import { ensureServerRunning, stopSpawnedServer } from "../e2e/helpers/server-manager";
import dbHelper from "../e2e/helpers/db-helper";
import prisma from "../../src/lib/prisma";
import { normalizeSlug } from "../../src/lib/utils";

describe("Adversarial Challenge M3-1: Page Builder & Pages API Stress Suite", { concurrency: 1 }, () => {
  let adminClient: TestHttpClient;
  let unauthClient: TestHttpClient;
  const createdPageIds: string[] = [];

  const trackPage = (idOrSlug: string) => {
    if (idOrSlug && !createdPageIds.includes(idOrSlug)) {
      createdPageIds.push(idOrSlug);
    }
  };

  const cleanupTrackedPages = async () => {
    if (createdPageIds.length === 0) return;
    try {
      const idsToDelete = [...createdPageIds];
      await prisma.pageHistory.deleteMany({
        where: {
          OR: [
            { pageId: { in: idsToDelete } },
            { page: { slug: { in: idsToDelete } } },
          ],
        },
      });
      await prisma.page.deleteMany({
        where: {
          OR: [
            { id: { in: idsToDelete } },
            { slug: { in: idsToDelete } },
            { slug: { startsWith: "adv-pb-" } },
            { id: { startsWith: "adv-pb-" } },
          ],
        },
      });
    } catch (err) {
      console.warn("[cleanupTrackedPages] Warning during cleanup:", err);
    }
    createdPageIds.length = 0;
  };

  before(async () => {
    await dbHelper.ensureAdmins();
    await ensureServerRunning();
    await cleanupTrackedPages();
  });

  beforeEach(async () => {
    adminClient = new TestHttpClient();
    const loginRes = await adminClient.loginAsAdmin();
    assert.strictEqual(loginRes.status, 200, "adminClient must authenticate successfully");
    unauthClient = new TestHttpClient();
  });

  afterEach(async () => {
    await cleanupTrackedPages();
  });

  after(async () => {
    await cleanupTrackedPages();
    stopSpawnedServer();
  });

  // ==========================================================================
  // SUITE 1: Protected Page Deletion Immunity & Self-Preservation
  // ==========================================================================
  describe("Suite 1: Protected Page Deletion Immunity & Self-Preservation", () => {
    test("PB-DEL.1: Attempted deletion of default 'home' by slug is rejected with HTTP 400", async () => {
      const res = await adminClient.delete("/api/admin/pages/home");
      assert.strictEqual(res.status, 400, `Expected 400 Bad Request, got ${res.status}`);
      assert.ok(
        res.text.includes("home") || res.text.includes("Cannot delete"),
        "Error message must specify cannot delete default home page"
      );

      const homeInDb = await prisma.page.findUnique({ where: { slug: "home" } });
      assert.ok(homeInDb, "Home page must remain in database");
    });

    test("PB-DEL.2: Attempted deletion of 'home' by UUID is rejected with HTTP 400", async () => {
      const homeInDb = await prisma.page.findUnique({ where: { slug: "home" } });
      assert.ok(homeInDb, "Home page must exist in database");

      const res = await adminClient.delete(`/api/admin/pages/${homeInDb.id}`);
      assert.strictEqual(res.status, 400, `Expected 400 Bad Request when deleting by UUID, got ${res.status}`);
      assert.ok(
        res.text.includes("home") || res.text.includes("Cannot delete"),
        "Error message must specify cannot delete default home page"
      );
    });

    test("PB-DEL.3: Database integrity check confirms home blocks and content remain unchanged", async () => {
      await adminClient.delete("/api/admin/pages/home");
      await adminClient.delete("/api/admin/pages/home");

      const homeInDb = await prisma.page.findUnique({ where: { slug: "home" } });
      assert.ok(homeInDb, "Home page must remain intact");
      assert.strictEqual(homeInDb.slug, "home");
      const blocks = Array.isArray(homeInDb.blocks) ? homeInDb.blocks : [];
      assert.ok(blocks.length > 0, "Home page blocks must not be emptied or purged");
    });

    test("PB-DEL.4: Unauthenticated DELETE request on home page returns 401/403", async () => {
      const res = await unauthClient.delete("/api/admin/pages/home");
      assert.ok(
        [401, 403].includes(res.status),
        `Unauthenticated DELETE must return 401 or 403, got ${res.status}`
      );
    });
  });

  // ==========================================================================
  // SUITE 2: Child Page Re-Parenting & Zero-Orphan Invariant
  // ==========================================================================
  describe("Suite 2: Child Page Re-Parenting & Zero-Orphan Invariant", () => {
    test("PB-PAR.1: Deleting a root parent page automatically re-parents children to root (null)", async () => {
      const stamp = Date.now();
      const parentSlug = `adv-pb-parent-${stamp}`;
      const child1Slug = `adv-pb-child1-${stamp}`;
      const child2Slug = `adv-pb-child2-${stamp}`;

      // Create Parent
      const pRes = await adminClient.post("/api/admin/pages", {
        slug: parentSlug,
        title: "Parent Page",
        blocks: [],
      });
      assert.strictEqual(pRes.status, 201);
      const parentId = pRes.data?.page?.id;
      assert.ok(parentId);
      trackPage(parentId);

      // Create Child 1
      const c1Res = await adminClient.post("/api/admin/pages", {
        slug: child1Slug,
        title: "Child 1",
        parentId,
        blocks: [],
      });
      assert.strictEqual(c1Res.status, 201);
      const child1Id = c1Res.data?.page?.id;
      assert.ok(child1Id);
      trackPage(child1Id);

      // Create Child 2
      const c2Res = await adminClient.post("/api/admin/pages", {
        slug: child2Slug,
        title: "Child 2",
        parentId,
        blocks: [],
      });
      assert.strictEqual(c2Res.status, 201);
      const child2Id = c2Res.data?.page?.id;
      assert.ok(child2Id);
      trackPage(child2Id);

      // Delete Parent
      const delRes = await adminClient.delete(`/api/admin/pages/${parentId}`);
      assert.strictEqual(delRes.status, 200, `Parent deletion must succeed: ${delRes.text}`);

      // Verify parent is deleted
      const checkParent = await prisma.page.findUnique({ where: { id: parentId } });
      assert.strictEqual(checkParent, null, "Parent page must be deleted");

      // Verify children still exist and have parentId set to null (re-parented to root)
      const checkC1 = await prisma.page.findUnique({ where: { id: child1Id } });
      assert.ok(checkC1, "Child 1 must still exist");
      assert.strictEqual(checkC1.parentId, null, "Child 1 parentId must be re-parented to null");

      const checkC2 = await prisma.page.findUnique({ where: { id: child2Id } });
      assert.ok(checkC2, "Child 2 must still exist");
      assert.strictEqual(checkC2.parentId, null, "Child 2 parentId must be re-parented to null");
    });

    test("PB-PAR.2: In Grandparent -> Parent -> Child hierarchy, deleting Parent re-parents Child to Grandparent", async () => {
      const stamp = Date.now();
      const gpSlug = `adv-pb-gp-${stamp}`;
      const pSlug = `adv-pb-p-${stamp}`;
      const cSlug = `adv-pb-c-${stamp}`;

      // Create Grandparent
      const gpRes = await adminClient.post("/api/admin/pages", {
        slug: gpSlug,
        title: "Grandparent",
        blocks: [],
      });
      assert.strictEqual(gpRes.status, 201);
      const gpId = gpRes.data?.page?.id;
      assert.ok(gpId);
      trackPage(gpId);

      // Create Parent with parentId = gpId
      const pRes = await adminClient.post("/api/admin/pages", {
        slug: pSlug,
        title: "Parent",
        parentId: gpId,
        blocks: [],
      });
      assert.strictEqual(pRes.status, 201);
      const pId = pRes.data?.page?.id;
      assert.ok(pId);
      trackPage(pId);

      // Create Child with parentId = pId
      const cRes = await adminClient.post("/api/admin/pages", {
        slug: cSlug,
        title: "Child",
        parentId: pId,
        blocks: [],
      });
      assert.strictEqual(cRes.status, 201);
      const cId = cRes.data?.page?.id;
      assert.ok(cId);
      trackPage(cId);

      // Delete Parent
      const delRes = await adminClient.delete(`/api/admin/pages/${pId}`);
      assert.strictEqual(delRes.status, 200);

      // Verify Child is now attached to Grandparent
      const checkChild = await prisma.page.findUnique({ where: { id: cId } });
      assert.ok(checkChild, "Child must exist");
      assert.strictEqual(checkChild.parentId, gpId, "Child must be re-parented to Grandparent id");
    });

    test("PB-PAR.3: History records of deleted parent are cleaned up; children's history remains intact", async () => {
      const stamp = Date.now();
      const parentSlug = `adv-pb-hist-p-${stamp}`;
      const childSlug = `adv-pb-hist-c-${stamp}`;

      const pRes = await adminClient.post("/api/admin/pages", {
        slug: parentSlug,
        title: "Parent with History",
        blocks: [],
      });
      const pId = pRes.data?.page?.id;
      trackPage(pId);

      // Update parent to create second history revision
      await adminClient.patch(`/api/admin/pages/${pId}`, {
        title: "Parent Revision 2",
        version: 1,
      });

      // Create Child
      const cRes = await adminClient.post("/api/admin/pages", {
        slug: childSlug,
        title: "Child Page",
        parentId: pId,
        blocks: [],
      });
      const cId = cRes.data?.page?.id;
      trackPage(cId);

      // Verify parent has 2 histories, child has 1
      const pHistCount = await prisma.pageHistory.count({ where: { pageId: pId } });
      assert.strictEqual(pHistCount, 2);
      const cHistCount = await prisma.pageHistory.count({ where: { pageId: cId } });
      assert.strictEqual(cHistCount, 1);

      // Delete parent
      await adminClient.delete(`/api/admin/pages/${pId}`);

      // Verify parent histories are 0
      const pHistAfter = await prisma.pageHistory.count({ where: { pageId: pId } });
      assert.strictEqual(pHistAfter, 0, "Parent history records must be deleted");

      // Verify child history is still 1
      const cHistAfter = await prisma.pageHistory.count({ where: { pageId: cId } });
      assert.strictEqual(cHistAfter, 1, "Child history records must not be lost");
    });
  });

  // ==========================================================================
  // SUITE 3: Deep Tree Hierarchy (>5 Levels) & Cycle Stress
  // ==========================================================================
  describe("Suite 3: Deep Tree Hierarchy (>5 Levels) & Cycle Stress", () => {
    test("PB-TREE.1: Create 7-level deep linear hierarchy (Depth = 7) and verify recursive tree resolution", async () => {
      const stamp = Date.now();
      const depth = 7;
      let currentParentId: string | null = null;
      const chainIds: string[] = [];

      for (let i = 0; i < depth; i++) {
        const slug = `adv-pb-chain-${stamp}-lvl${i}`;
        const levelRes: HttpResponse = await adminClient.post("/api/admin/pages", {
          slug,
          title: `Chain Level ${i}`,
          parentId: currentParentId,
          orderIndex: i,
          blocks: [],
        });
        assert.strictEqual(levelRes.status, 201, `Level ${i} creation failed: ${levelRes.text}`);
        const id = levelRes.data?.page?.id;
        assert.ok(id);
        trackPage(id);
        chainIds.push(id);
        currentParentId = id;
      }

      assert.strictEqual(chainIds.length, 7);

      // Verify in DB that chain is unbroken
      for (let i = 1; i < depth; i++) {
        const page = await prisma.page.findUnique({ where: { id: chainIds[i] } });
        assert.strictEqual(page?.parentId, chainIds[i - 1], `Level ${i} parent must point to level ${i - 1}`);
      }

      // Query tree view
      const treeRes = await adminClient.get("/api/admin/pages?view=tree");
      assert.strictEqual(treeRes.status, 200, `Expected 200, got ${treeRes.status}`);
      const body = treeRes.data;
      assert.ok(Array.isArray(body.pages), "pages must be array");
      assert.ok(Array.isArray(body.tree), "tree must be array");

      const getTreeDepth = (node: any): number => {
        if (!node.children || node.children.length === 0) return 1;
        return 1 + Math.max(...node.children.map(getTreeDepth));
      };

      const maxDepth = Math.max(...body.tree.map(getTreeDepth));
      assert.ok(maxDepth >= 7, `Tree view must support deep nesting >= 7, calculated maxDepth: ${maxDepth}`);
    });

    test("PB-TREE.2: Cycle Stress: Self-parenting attempt (parentId === id) handled safely without infinite loop", async () => {
      const stamp = Date.now();
      const slug = `adv-pb-self-cycle-${stamp}`;
      const createRes = await adminClient.post("/api/admin/pages", {
        slug,
        title: "Self Cycle Test",
        blocks: [],
      });
      const id = createRes.data?.page?.id;
      assert.ok(id);
      trackPage(id);

      // Attempt to patch parentId to itself
      const patchRes = await adminClient.patch(`/api/admin/pages/${id}`, {
        parentId: id,
      });
      assert.ok([200, 400].includes(patchRes.status), `Server handled update with status ${patchRes.status}`);

      // Query tree view — MUST return 200 within timeout without stack overflow
      const treeRes = await adminClient.get("/api/admin/pages?view=tree");
      assert.strictEqual(treeRes.status, 200, "Tree view must not enter infinite loop or crash");
      assert.ok(Array.isArray(treeRes.data?.tree), "Tree array must be returned");
    });
  });

  // ==========================================================================
  // SUITE 4: High-Concurrency Optimistic Locking & Race Conditions
  // ==========================================================================
  describe("Suite 4: High-Concurrency Optimistic Locking & Race Conditions", () => {
    test("PB-RACE.1: 10 simultaneous updates from version 1: Exactly 1 succeeds, others receive HTTP 409 Conflict", async () => {
      const stamp = Date.now();
      const slug = `adv-pb-race-${stamp}`;
      const createRes = await adminClient.post("/api/admin/pages", {
        slug,
        title: "Race Condition Base",
        blocks: [],
      });
      const pageId = createRes.data?.page?.id;
      assert.ok(pageId);
      trackPage(pageId);

      const initialPage = await prisma.page.findUnique({ where: { id: pageId } });
      assert.strictEqual(initialPage?.version, 1);

      const numRequests = 10;
      const clientPool = Array.from({ length: numRequests }, () => {
        const c = new TestHttpClient();
        c.setCookie("admin_session", adminClient.getCookie("admin_session")!);
        return c;
      });

      const promises = clientPool.map((client, idx) =>
        client.patch(`/api/admin/pages/${pageId}`, {
          title: `Concurrent Title Update ${idx}`,
          version: 1,
          changeSummary: `Race candidate ${idx}`,
        })
      );

      const results = await Promise.all(promises);

      const successes = results.filter((r) => r.status === 200);
      const conflicts = results.filter((r) => r.status === 409);
      const others = results.filter((r) => ![200, 409].includes(r.status));

      assert.strictEqual(others.length, 0, `No requests should fail with 500 or unexpected status: ${others.map((r) => r.status)}`);
      assert.strictEqual(successes.length, 1, `Exactly 1 concurrent request should succeed from version 1, got ${successes.length}`);
      assert.strictEqual(conflicts.length, numRequests - 1, `Remaining ${numRequests - 1} requests must receive HTTP 409, got ${conflicts.length}`);

      const finalPage = await prisma.page.findUnique({ where: { id: pageId } });
      assert.strictEqual(finalPage?.version, 2, "Page version must be exactly 2");

      const histories = await prisma.pageHistory.findMany({
        where: { pageId },
        orderBy: { version: "asc" },
      });
      assert.strictEqual(histories.length, 2, "PageHistory must contain exactly 2 versions");
      assert.strictEqual(histories[0].version, 1);
      assert.strictEqual(histories[1].version, 2);
    });

    test("PB-RACE.2: Stale version update explicitly rejected with HTTP 409", async () => {
      const stamp = Date.now();
      const slug = `adv-pb-stale-${stamp}`;
      const createRes = await adminClient.post("/api/admin/pages", {
        slug,
        title: "Stale Version Target",
        blocks: [],
      });
      const pageId = createRes.data?.page?.id;
      trackPage(pageId);

      // Increment version to 2
      await adminClient.patch(`/api/admin/pages/${pageId}`, {
        title: "Update 1",
        version: 1,
      });

      // Increment version to 3
      await adminClient.patch(`/api/admin/pages/${pageId}`, {
        title: "Update 2",
        version: 2,
      });

      // Attempt update passing stale version 1
      const staleRes = await adminClient.patch(`/api/admin/pages/${pageId}`, {
        title: "Stale Attempt",
        version: 1,
      });

      assert.strictEqual(staleRes.status, 409, `Stale version 1 on version 3 must return HTTP 409, got ${staleRes.status}`);
      assert.ok(
        staleRes.text.includes("mismatch") || staleRes.text.includes("Conflict"),
        "Error message should explain version conflict"
      );
    });
  });

  // ==========================================================================
  // SUITE 5: Rollback Arbitrary Revisions & AST Forward-Compatibility
  // ==========================================================================
  describe("Suite 5: Rollback Arbitrary Revisions & AST Forward-Compatibility", () => {
    test("PB-ROL.1: Rollback to historical version restores exact AST snapshot and increments version", async () => {
      const stamp = Date.now();
      const slug = `adv-pb-rollback-${stamp}`;

      const v1Blocks = [
        { id: "b-hero-v1", type: "HeroCarousel", props: { title: "V1 Hero Title" } },
      ];
      const v2Blocks = [
        { id: "b-key-v2", type: "Keynotes", props: { title: "V2 Keynote Title" } },
      ];
      const v3Blocks = [
        { id: "b-faq-v3", type: "FAQ", props: { title: "V3 FAQ Title" } },
      ];

      // Step 1: Create v1
      const createRes = await adminClient.post("/api/admin/pages", {
        slug,
        title: "Rollback Page v1",
        blocks: v1Blocks,
      });
      const pageId = createRes.data?.page?.id;
      assert.ok(pageId);
      trackPage(pageId);

      // Step 2: Update to v2
      await adminClient.patch(`/api/admin/pages/${pageId}`, {
        title: "Rollback Page v2",
        blocks: v2Blocks,
        version: 1,
      });

      // Step 3: Update to v3
      await adminClient.patch(`/api/admin/pages/${pageId}`, {
        title: "Rollback Page v3",
        blocks: v3Blocks,
        version: 2,
      });

      const pageBeforeRollback = await prisma.page.findUnique({ where: { id: pageId } });
      assert.strictEqual(pageBeforeRollback?.version, 3);

      // Step 4: Rollback to v1
      const rollRes = await adminClient.post(`/api/admin/pages/${pageId}/rollback`, {
        version: 1,
      });
      assert.strictEqual(rollRes.status, 200, `Rollback to v1 must succeed: ${rollRes.text}`);
      assert.strictEqual(rollRes.data?.restoredVersion, 1);
      assert.strictEqual(rollRes.data?.page?.version, 4, "Rollback must increment to version 4");

      const restoredBlocks = rollRes.data?.page?.blocks;
      assert.ok(Array.isArray(restoredBlocks));
      assert.strictEqual(restoredBlocks.length, 1);
      assert.strictEqual(restoredBlocks[0].id, "b-hero-v1");
      assert.strictEqual(restoredBlocks[0].type, "HeroCarousel");

      const historyV4 = await prisma.pageHistory.findUnique({
        where: { pageId_version: { pageId, version: 4 } },
      });
      assert.ok(historyV4, "History record for v4 must exist");
      assert.ok(historyV4.changeSummary?.includes("Rolled back to revision v1"));
    });

    test("PB-ROL.2: Rollback by historyId restores targeted revision correctly", async () => {
      const stamp = Date.now();
      const slug = `adv-pb-roll-hid-${stamp}`;

      const createRes = await adminClient.post("/api/admin/pages", {
        slug,
        title: "History ID Target",
        blocks: [{ id: "b1", type: "About", props: {} }],
      });
      const pageId = createRes.data?.page?.id;
      trackPage(pageId);

      // Update to v2
      await adminClient.patch(`/api/admin/pages/${pageId}`, {
        title: "Target v2",
        blocks: [{ id: "b2", type: "Venue", props: {} }],
        version: 1,
      });

      const v1History = await prisma.pageHistory.findUnique({
        where: { pageId_version: { pageId, version: 1 } },
      });
      assert.ok(v1History?.id, "v1 history ID must be present");

      const rollRes = await adminClient.post(`/api/admin/pages/${pageId}/rollback`, {
        historyId: v1History.id,
      });
      assert.strictEqual(rollRes.status, 200);
      assert.strictEqual(rollRes.data?.page?.version, 3);
      assert.strictEqual(rollRes.data?.page?.blocks[0]?.type, "About");
    });

    test("PB-ROL.3: Rollback to non-existent version (v9999) returns HTTP 404", async () => {
      const stamp = Date.now();
      const slug = `adv-pb-roll-404-${stamp}`;
      const createRes = await adminClient.post("/api/admin/pages", {
        slug,
        title: "Non Existent Rollback",
        blocks: [],
      });
      const pageId = createRes.data?.page?.id;
      trackPage(pageId);

      const rollRes = await adminClient.post(`/api/admin/pages/${pageId}/rollback`, {
        version: 9999,
      });
      assert.strictEqual(rollRes.status, 404, `Rollback to non-existent version must return 404, got ${rollRes.status}`);
    });

    test("PB-ROL.4: Rollback with missing version and missing historyId returns HTTP 400", async () => {
      const stamp = Date.now();
      const slug = `adv-pb-roll-bad-${stamp}`;
      const createRes = await adminClient.post("/api/admin/pages", {
        slug,
        title: "Empty Rollback Body",
        blocks: [],
      });
      const pageId = createRes.data?.page?.id;
      trackPage(pageId);

      const rollRes = await adminClient.post(`/api/admin/pages/${pageId}/rollback`, {});
      assert.strictEqual(rollRes.status, 400, `Empty rollback parameters must return 400, got ${rollRes.status}`);
    });

    test("PB-ROL.5: Cross-page rollback with historyId preserves target page integrity", async () => {
      const stamp = Date.now();
      const p1Res = await adminClient.post("/api/admin/pages", {
        slug: `adv-pb-p1-${stamp}`,
        title: "Page 1",
        blocks: [],
      });
      const p1Id = p1Res.data?.page?.id;
      trackPage(p1Id);

      const p2Res = await adminClient.post("/api/admin/pages", {
        slug: `adv-pb-p2-${stamp}`,
        title: "Page 2",
        blocks: [{ id: "secret-block", type: "PaymentMethods", props: { key: "secret" } }],
      });
      const p2Id = p2Res.data?.page?.id;
      trackPage(p2Id);

      const p2Hist = await prisma.pageHistory.findFirst({ where: { pageId: p2Id } });
      assert.ok(p2Hist?.id);

      const attackRes = await adminClient.post(`/api/admin/pages/${p1Id}/rollback`, {
        historyId: p2Hist.id,
      });

      assert.ok([200, 400, 404].includes(attackRes.status));

      const p1After = await prisma.page.findUnique({ where: { id: p1Id } });
      assert.ok(p1After, "Page 1 must still exist");
      const p2After = await prisma.page.findUnique({ where: { id: p2Id } });
      assert.ok(p2After, "Page 2 must still exist");
    });
  });

  // ==========================================================================
  // SUITE 6: Slug Collision Attacks & Diacritic Normalization
  // ==========================================================================
  describe("Suite 6: Slug Collision Attacks & Diacritic Normalization", () => {
    test("PB-SLUG.1: Universal Vietnamese diacritics and character normalization test", () => {
      assert.strictEqual(
        normalizeSlug("Hội Nghị Khoa Học IEEE 2027"),
        "hoi-nghi-khoa-hoc-ieee-2027"
      );
      assert.strictEqual(
        normalizeSlug("Đà Nẵng"),
        "da-nang"
      );
      assert.strictEqual(
        normalizeSlug("Hồ Chí Minh"),
        "ho-chi-minh"
      );
      assert.strictEqual(
        normalizeSlug("ĐẠI HỌC SƯ PHẠM KỸ THUẬT"),
        "dai-hoc-su-pham-ky-thuat"
      );
      assert.strictEqual(
        normalizeSlug("   test   spaces   "),
        "test---spaces"
      );
    });

    test("PB-SLUG.2: Diacritic slug collision returns HTTP 409 Conflict", async () => {
      const stamp = Date.now();
      const rawTitle = `Hoi Nghi Quoc Te SMC ${stamp}`;
      const expectedNormalized = normalizeSlug(rawTitle);

      const res1 = await adminClient.post("/api/admin/pages", {
        slug: rawTitle,
        title: "Vietnamese Title",
        blocks: [],
      });
      assert.strictEqual(res1.status, 201);
      assert.strictEqual(res1.data?.page?.slug, expectedNormalized);
      trackPage(res1.data?.page?.id);

      // Now attempt duplicate creation with normalized slug
      const res2 = await adminClient.post("/api/admin/pages", {
        slug: expectedNormalized,
        title: "Duplicate Colliding Attempt",
        blocks: [],
      });
      assert.strictEqual(res2.status, 409, `Colliding slug creation must return HTTP 409, got ${res2.status}`);
      assert.ok(res2.text.includes("already exists") || res2.text.includes("Conflict"));
    });

    test("PB-SLUG.3: Slug update collision between two existing pages returns HTTP 409", async () => {
      const stamp = Date.now();
      const slugA = `adv-pb-slug-a-${stamp}`;
      const slugB = `adv-pb-slug-b-${stamp}`;

      const resA = await adminClient.post("/api/admin/pages", {
        slug: slugA,
        title: "Page A",
        blocks: [],
      });
      assert.strictEqual(resA.status, 201);
      trackPage(resA.data?.page?.id);

      const resB = await adminClient.post("/api/admin/pages", {
        slug: slugB,
        title: "Page B",
        blocks: [],
      });
      assert.strictEqual(resB.status, 201);
      const idB = resB.data?.page?.id;
      trackPage(idB);

      // Attempt to patch Page B's slug to Page A's slug
      const patchRes = await adminClient.patch(`/api/admin/pages/${idB}`, {
        slug: slugA,
      });

      assert.strictEqual(patchRes.status, 409, `Patching slug to existing slug must return 409, got ${patchRes.status}`);
      assert.ok(patchRes.text.includes("already exists") || patchRes.text.includes("Conflict"));
    });

    test("PB-SLUG.4: Invalid and un-normalizable slugs (empty, slashes, hyphens) rejected with HTTP 400", async () => {
      const hostileSlugs = ["///", "---", "   ", "___", "!@#$%"];
      for (const badSlug of hostileSlugs) {
        const res = await adminClient.post("/api/admin/pages", {
          slug: badSlug,
          title: "Bad Slug Page",
          blocks: [],
        });
        assert.strictEqual(
          res.status,
          400,
          `Hostile slug '${badSlug}' must be rejected with 400, got ${res.status}`
        );
      }
    });

    test("PB-SLUG.5: Hierarchical multi-segment slug paths normalized cleanly", async () => {
      const stamp = Date.now();
      const multiSlug = `conference-${stamp}/tracks//cybernetics/`;
      const expected = `conference-${stamp}/tracks/cybernetics`;

      const res = await adminClient.post("/api/admin/pages", {
        slug: multiSlug,
        title: "Multi Segment Path",
        blocks: [],
      });
      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.data?.page?.slug, expected);
      trackPage(res.data?.page?.id);
    });
  });

  // ==========================================================================
  // SUITE 7: Malformed Block AST Payloads & Fuzzing Resilience
  // ==========================================================================
  describe("Suite 7: Malformed Block AST Payloads & Fuzzing Resilience", () => {
    test("PB-AST.1: Missing blocks and content payload handled gracefully without 500 error", async () => {
      const stamp = Date.now();
      const slug = `adv-pb-ast-null-${stamp}`;

      const res = await adminClient.post("/api/admin/pages", {
        slug,
        title: "Null Blocks Page",
        blocks: null,
        content: null,
      });
      assert.ok([200, 201].includes(res.status), `Null blocks should be initialized to []: ${res.status}`);
      const pageId = res.data?.page?.id;
      trackPage(pageId);

      const pageInDb = await prisma.page.findUnique({ where: { id: pageId } });
      assert.ok(Array.isArray(pageInDb?.blocks), "DB blocks must be an array");
    });

    test("PB-AST.2: Corrupted blocks payload (non-array string/number) sanitized without server crash", async () => {
      const stamp = Date.now();
      const slug = `adv-pb-ast-str-${stamp}`;

      const res = await adminClient.post("/api/admin/pages", {
        slug,
        title: "String Blocks Page",
        blocks: "this is not an array",
      });
      assert.ok([200, 201, 400].includes(res.status), `Corrupted blocks must not throw 500: ${res.status}`);
      assert.notStrictEqual(res.status, 500, "Server must not crash with 500");
      if (res.data?.page?.id) {
        trackPage(res.data.page.id);
      }
    });

    test("PB-AST.3: Malformed block objects (missing id, missing type, null props) handled safely", async () => {
      const stamp = Date.now();
      const slug = `adv-pb-ast-blocks-${stamp}`;

      const malformedBlocks = [
        { id: null, type: "HeroCarousel" },
        { id: "b2", type: null, props: null },
        { id: "b3", type: 12345, props: "invalid-props-type" },
        { id: "b4", type: "Keynotes", children: [null, undefined, "hostile"] },
      ];

      const res = await adminClient.post("/api/admin/pages", {
        slug,
        title: "Malformed Blocks Array",
        blocks: malformedBlocks,
      });
      assert.ok([200, 201].includes(res.status), `Server should persist JSON safely without 500: ${res.status}`);
      const pageId = res.data?.page?.id;
      trackPage(pageId);

      const getRes = await adminClient.get(`/api/admin/pages/${pageId}`);
      assert.strictEqual(getRes.status, 200, `GET must serialize blocks safely: ${getRes.status}`);
      assert.ok(Array.isArray(getRes.data?.page?.blocks));
    });

    test("PB-AST.4: Prototype pollution attempt payload handled securely without polluting global object", async () => {
      const stamp = Date.now();
      const slug = `adv-pb-ast-proto-${stamp}`;

      const pollutionPayload = JSON.parse(
        '{"slug": "' + slug + '", "title": "Proto Test", "blocks": [], "__proto__": {"pollutedKey": "hacked"}}'
      );

      const res = await adminClient.post("/api/admin/pages", pollutionPayload);
      assert.ok([200, 201].includes(res.status));
      if (res.data?.page?.id) trackPage(res.data.page.id);

      assert.strictEqual(
        (Object.prototype as any).pollutedKey,
        undefined,
        "Prototype pollution must be strictly prevented"
      );
    });
  });

  // ==========================================================================
  // SUITE 8: Public Route Draft Security & Isolation Bypass
  // ==========================================================================
  describe("Suite 8: Public Route Draft Security & Isolation Bypass", () => {
    let draftSlug: string;
    let draftPageId: string;

    beforeEach(async () => {
      const stamp = Date.now();
      const baseSlug = `adv-pb-draft-${stamp}`;

      const res = await adminClient.post("/api/admin/pages", {
        slug: baseSlug,
        title: "Top Secret Draft Page",
        isPublished: false,
        blocks: [
          { id: "draft-secret", type: "ConferenceHighlights", props: { secret: "confidential" } },
        ],
      });
      assert.strictEqual(res.status, 201);
      draftPageId = res.data?.page?.id;
      draftSlug = res.data?.page?.slug;
      assert.ok(draftPageId);
      assert.ok(draftSlug);
      trackPage(draftPageId);

      const check = await prisma.page.findUnique({ where: { id: draftPageId } });
      assert.strictEqual(check?.isPublished, false, "Draft page must have isPublished: false");
    });

    test("PB-SEC.1: Unpublished draft page returns HTTP 404 to anonymous public visitors", async () => {
      const res = await unauthClient.get(`/${draftSlug}`);
      assert.strictEqual(res.status, 404, `Unpublished draft must return 404 to public, got ${res.status}`);
    });

    test("PB-SEC.2: Draft security bypass attempts with invalid preview flags still return 404", async () => {
      const hostileQueryStrings = [
        `/${draftSlug}?preview=false`,
        `/${draftSlug}?preview=0`,
        `/${draftSlug}?preview=null`,
        `/${draftSlug}?preview=undefined`,
        `/${draftSlug}?preview=admin`,
        `/${draftSlug}?preview=yes`,
        `/${draftSlug}?preview=TRUE`,
        `/${draftSlug}?preview=`,
      ];

      for (const hostileUrl of hostileQueryStrings) {
        const res = await unauthClient.get(hostileUrl);
        assert.strictEqual(
          res.status,
          404,
          `Bypass attempt '${hostileUrl}' must be rejected with 404, got ${res.status}`
        );
      }
    });

    test("PB-SEC.3: Only an administrator can preview a draft", async () => {
      for (const flag of ["true", "1"]) {
        const anonymous = await unauthClient.get(`/${draftSlug}?preview=${flag}`);
        assert.strictEqual(anonymous.status, 404, `Anonymous preview=${flag} must not expose the draft`);
        assert.ok(!anonymous.text.includes("Top Secret Draft Page"), "Draft title must not leak in metadata");
        const authorized = await adminClient.get(`/${draftSlug}?preview=${flag}`);
        assert.strictEqual(authorized.status, 200, `Admin preview=${flag} should show the draft`);
        assert.ok(authorized.text.includes("Draft Preview Mode"), "Should render draft preview indicator banner");
      }
      for (const path of ["/api/admin/pages", `/api/admin/pages/${draftPageId}`, "/api/admin/posts", "/api/admin/posts/unknown"]) {
        const anonymous = await unauthClient.get(path);
        assert.strictEqual(anonymous.status, 401, `Anonymous access to ${path} must be rejected`);
      }
    });

    test("PB-SEC.4: Publishing cycle: Publishing page opens public access (200), unpublishing returns to 404", async () => {
      // 1. Initially 404
      const initRes = await unauthClient.get(`/${draftSlug}`);
      assert.strictEqual(initRes.status, 404);

      // 2. Publish via /publish endpoint
      const pubRes = await adminClient.post(`/api/admin/pages/${draftPageId}/publish`, {
        isPublished: true,
      });
      assert.strictEqual(pubRes.status, 200);
      assert.strictEqual(pubRes.data?.page?.isPublished, true);

      // 3. Now public request without preview returns 200
      const pubCheckRes = await unauthClient.get(`/${draftSlug}`);
      assert.strictEqual(pubCheckRes.status, 200, `Published page must return 200 to public, got ${pubCheckRes.status}`);

      // 4. Unpublish via /publish endpoint
      const unpubRes = await adminClient.post(`/api/admin/pages/${draftPageId}/publish`, {
        isPublished: false,
      });
      assert.strictEqual(unpubRes.status, 200);
      assert.strictEqual(unpubRes.data?.page?.isPublished, false);

      // 5. Public request immediately returns 404 again
      const postUnpubRes = await unauthClient.get(`/${draftSlug}`);
      assert.strictEqual(postUnpubRes.status, 404, `Unpublished page must immediately return 404 again, got ${postUnpubRes.status}`);
    });

    test("PB-SEC.5: Unauthenticated access to administrative page mutation endpoints strictly rejected with 401/403", async () => {
      const testPagePayload = {
        slug: `adv-pb-unauth-${Date.now()}`,
        title: "Unauth Target",
        blocks: [],
      };

      // POST /api/admin/pages
      const postRes = await unauthClient.post("/api/admin/pages", testPagePayload);
      assert.ok([401, 403].includes(postRes.status), `POST /pages must be 401/403: got ${postRes.status}`);

      // PATCH /api/admin/pages/[id]
      const patchRes = await unauthClient.patch(`/api/admin/pages/${draftPageId}`, { title: "Hacked" });
      assert.ok([401, 403].includes(patchRes.status), `PATCH /pages/[id] must be 401/403: got ${patchRes.status}`);

      // PUT /api/admin/pages/[id]
      const putRes = await unauthClient.put(`/api/admin/pages/${draftPageId}`, { title: "Hacked" });
      assert.ok([401, 403].includes(putRes.status), `PUT /pages/[id] must be 401/403: got ${putRes.status}`);

      // DELETE /api/admin/pages/[id]
      const delRes = await unauthClient.delete(`/api/admin/pages/${draftPageId}`);
      assert.ok([401, 403].includes(delRes.status), `DELETE /pages/[id] must be 401/403: got ${delRes.status}`);

      // POST /api/admin/pages/[id]/publish
      const pubRes = await unauthClient.post(`/api/admin/pages/${draftPageId}/publish`, { isPublished: true });
      assert.ok([401, 403].includes(pubRes.status), `POST /publish must be 401/403: got ${pubRes.status}`);

      // POST /api/admin/pages/[id]/rollback
      const rollRes = await unauthClient.post(`/api/admin/pages/${draftPageId}/rollback`, { version: 1 });
      assert.ok([401, 403].includes(rollRes.status), `POST /rollback must be 401/403: got ${rollRes.status}`);
    });
  });
});
