/**
 * Direct Database Verification & Cleanup Helper for E2E Tests
 * Uses Prisma client directly to verify data assertions and clean up test resources.
 */

import prisma from "@/lib/prisma";
import { ensureDatabaseAdmins } from "@/lib/auth";
import { E2E_CONFIG } from "../config";

export const dbHelper = {
  prisma,

  async ensureAdmins() {
    await ensureDatabaseAdmins();
  },

  async findUser(email: string) {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
  },

  async findPage(slugOrId: string) {
    return prisma.page.findFirst({
      where: {
        OR: [{ id: slugOrId }, { slug: slugOrId }],
      },
    });
  },

  async cleanupTestData() {
    try {
      // Clean up test pages
      await prisma.page.deleteMany({
        where: {
          OR: [
            { id: { startsWith: "e2e-test-" } },
            { id: { startsWith: "__e2e_test_" } },
            { slug: { startsWith: "e2e-test-" } },
            { slug: { startsWith: "__e2e_test_" } },
            { title: { contains: "E2E Test" } },
          ],
        },
      });

      // Clean up test users (never delete seeded admins)
      await prisma.user.deleteMany({
        where: {
          OR: [
            { email: { contains: "@test-smc.org" } },
            { email: { startsWith: "test_e2e_" } },
            { name: { startsWith: "E2E Test User" } },
          ],
          email: {
            notIn: [
              "admin@hcmute.edu.vn",
              "tctoan1024@gmail.com",
              "ieeesmc2027@hcmute.edu.vn",
              "hoavm@hcmute.edu.vn",
              "nguyennv@hcmute.edu.vn",
            ],
          },
        },
      });
    } catch (err) {
      console.error("[dbHelper.cleanupTestData] Error cleaning up test data:", err);
    }
  },
};

export default dbHelper;
