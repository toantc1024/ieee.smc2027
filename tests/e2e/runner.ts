/**
 * Opaque-Box E2E Master Test Runner for IEEE SMC 2027
 * Orchestrates:
 * 1. Environment & Database admin check
 * 2. Next.js server readiness & auto-spawn on port 3099 if inactive
 * 3. Test execution across 4 tiers:
 *    - Tier 1: Feature Coverage (Page Editor, Analytics, User Management, Build Routes)
 *    - Tier 2: Boundary & Corner Cases (Stress, Invalids, Security Guards)
 *    - Tier 3: Cross-Feature Interactions (Pairwise Module Handshakes)
 *    - Tier 4: Real-World Scenarios (End-to-End Conference Workflows)
 * 4. Tier filtering via CLI: `npx tsx tests/e2e/runner.ts [--tier 1|2|3|4]`
 * 5. Clean teardown and deterministic exit codes
 */

import { spawnSync } from "child_process";
import path from "path";
import { ensureServerRunning, stopSpawnedServer } from "./helpers/server-manager";
import dbHelper from "./helpers/db-helper";

interface TierDefinition {
  id: number;
  name: string;
  files: string[];
}

const ALL_TIERS: TierDefinition[] = [
  {
    id: 1,
    name: "Tier 1: Feature Coverage (Core Happy Paths >=5 per Feature)",
    files: [
      "tests/e2e/tier1-feature-coverage/page-builder.test.ts",
      "tests/e2e/tier1-feature-coverage/user-management.test.ts",
      "tests/e2e/tier1-feature-coverage/build-routes.test.ts",
      "tests/e2e/tier1-feature-coverage/analytics.test.ts",
    ],
  },
  {
    id: 2,
    name: "Tier 2: Boundary & Corner Cases (Invalids, Edge Dates, Security Guards)",
    files: [
      "tests/e2e/tier2-boundary-corner/page-builder-edge.test.ts",
      "tests/e2e/tier2-boundary-corner/user-management-edge.test.ts",
      "tests/e2e/tier2-boundary-corner/build-routes-edge.test.ts",
      "tests/e2e/tier2-boundary-corner/analytics-edge.test.ts",
    ],
  },
  {
    id: 3,
    name: "Tier 3: Cross-Feature Interactions (Pairwise Module Handshakes)",
    files: [
      "tests/e2e/tier3-cross-feature/cross-feature-interactions.test.ts",
    ],
  },
  {
    id: 4,
    name: "Tier 4: Real-World Scenarios (End-to-End Conference Workflows)",
    files: [
      "tests/e2e/tier4-real-world/conference-workflows.test.ts",
    ],
  },
];

async function main() {
  console.log("================================================================================");
  console.log("         IEEE SMC 2027 PORTAL — OPAQUE-BOX E2E TEST RUNNER                      ");
  console.log("================================================================================\n");

  // Parse command line arguments
  const args = process.argv.slice(2);
  let targetTier: number | null = null;
  const tierIndex = args.indexOf("--tier");
  if (tierIndex !== -1 && args[tierIndex + 1]) {
    targetTier = parseInt(args[tierIndex + 1], 10);
    console.log(`[E2E Runner] Target Tier specified: Tier ${targetTier}`);
  }

  // 1. Ensure Database admins and schema readiness
  console.log("[E2E Runner] Verifying database connection and admin credentials...");
  await dbHelper.ensureAdmins();
  console.log("[E2E Runner] Database ready.\n");

  // 2. Ensure Next.js dev server is running
  const server = await ensureServerRunning();
  console.log(`[E2E Runner] Target Base URL: ${server.baseUrl}\n`);

  // Filter tiers to run
  const activeTiers = targetTier
    ? ALL_TIERS.filter((t) => t.id === targetTier)
    : ALL_TIERS;

  if (activeTiers.length === 0) {
    console.error(`[E2E Runner] Invalid tier specified: ${targetTier}. Choose 1, 2, 3, or 4.`);
    if (server.spawned) stopSpawnedServer();
    process.exit(1);
  }

  let totalFailedSuites = 0;
  const results: Array<{ tier: string; file: string; passed: boolean; durationMs: number }> = [];

  for (const tier of activeTiers) {
    console.log(`\n>>> Executing ${tier.name}`);
    console.log("--------------------------------------------------------------------------------");

    for (const file of tier.files) {
      const fullPath = path.resolve(process.cwd(), file);
      console.log(`\n• Running suite: ${file}`);

      const start = Date.now();
      const child = spawnSync("npx", ["tsx", "--test", fullPath], {
        cwd: process.cwd(),
        env: {
          ...process.env,
          E2E_BASE_URL: server.baseUrl,
        },
        stdio: "inherit",
      });
      const durationMs = Date.now() - start;

      const passed = child.status === 0;
      if (!passed) {
        totalFailedSuites++;
      }
      results.push({
        tier: `Tier ${tier.id}`,
        file: path.basename(file),
        passed,
        durationMs,
      });
    }
  }

  // Cleanup server if spawned
  if (server.spawned) {
    stopSpawnedServer();
  }

  // Summary Report
  console.log("\n================================================================================");
  console.log("                           E2E TEST SUMMARY REPORT                              ");
  console.log("================================================================================");
  console.log("| Tier   | Suite File                          | Status   | Duration (ms)      |");
  console.log("|--------|-------------------------------------|----------|--------------------|");
  for (const r of results) {
    const status = r.passed ? "PASS ✔ " : "FAIL ✖ ";
    const paddedTier = r.tier.padEnd(6);
    const paddedFile = r.file.padEnd(35);
    const paddedDuration = `${r.durationMs}ms`.padStart(18);
    console.log(`| ${paddedTier} | ${paddedFile} | ${status}  | ${paddedDuration} |`);
  }
  console.log("================================================================================");

  const totalPassed = results.filter((r) => r.passed).length;
  console.log(`Total Suites: ${results.length} | Passed: ${totalPassed} | Failed: ${totalFailedSuites}\n`);

  if (totalFailedSuites > 0) {
    console.log("[E2E Runner] Some test suites failed or pending milestone implementation.");
    // In dual track development, report failures cleanly
    process.exit(1);
  } else {
    console.log("[E2E Runner] ALL TEST SUITES PASSED CLEANLY (100% SUCCESS)!");
    process.exit(0);
  }
}

main().catch((err) => {
  console.error("[E2E Runner Fatal Error]:", err);
  stopSpawnedServer();
  process.exit(1);
});
