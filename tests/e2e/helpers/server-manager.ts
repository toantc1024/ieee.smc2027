/**
 * Server Lifecycle Manager for E2E Tests
 * Ensures a live Next.js instance is available to serve HTTP requests.
 * Automatically spawns dev server if not already running, and terminates cleanly on exit.
 */

import { spawn, ChildProcess } from "child_process";
import { E2E_CONFIG } from "../config";

let spawnedProcess: ChildProcess | null = null;

export async function isServerRunning(baseUrl: string = E2E_CONFIG.baseUrl): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${baseUrl}/api/admin/pages`, {
      signal: controller.signal,
    });
    clearTimeout(timer);
    return res.status < 500;
  } catch {
    return false;
  }
}

export async function ensureServerRunning(): Promise<{ spawned: boolean; baseUrl: string }> {
  const alreadyRunning = await isServerRunning(E2E_CONFIG.baseUrl);
  if (alreadyRunning) {
    return { spawned: false, baseUrl: E2E_CONFIG.baseUrl };
  }

  console.log(`[E2E Server Manager] No active server detected at ${E2E_CONFIG.baseUrl}. Spawning Next.js dev server on port ${E2E_CONFIG.serverPort}...`);

  const proc = spawn(
    "npx",
    ["next", "dev", "--port", String(E2E_CONFIG.serverPort)],
    {
      cwd: process.cwd(),
      env: {
        ...process.env,
        PORT: String(E2E_CONFIG.serverPort),
      },
      stdio: ["ignore", "pipe", "pipe"],
    }
  );

  spawnedProcess = proc;
  proc.unref();

  // Log stderr in case of startup errors
  proc.stderr?.on("data", (chunk) => {
    const msg = chunk.toString();
    if (msg.includes("error") || msg.includes("Error")) {
      console.error(`[E2E Next.js stderr]: ${msg.trim()}`);
    }
  });

  // Clean termination hooks
  const cleanup = () => {
    if (spawnedProcess && !spawnedProcess.killed) {
      try {
        spawnedProcess.kill("SIGTERM");
      } catch {
        // ignore
      }
      spawnedProcess = null;
    }
  };

  process.on("exit", cleanup);
  process.on("SIGINT", () => {
    cleanup();
    process.exit(130);
  });
  process.on("SIGTERM", () => {
    cleanup();
    process.exit(143);
  });

  // Poll for readiness
  const startTime = Date.now();
  while (Date.now() - startTime < E2E_CONFIG.timeouts.serverStartupMs) {
    await new Promise((r) => setTimeout(r, 600));
    const running = await isServerRunning(E2E_CONFIG.baseUrl);
    if (running) {
      console.log(`[E2E Server Manager] Next.js dev server ready at ${E2E_CONFIG.baseUrl} in ${Date.now() - startTime}ms.`);
      return { spawned: true, baseUrl: E2E_CONFIG.baseUrl };
    }
  }

  cleanup();
  throw new Error(`Failed to start Next.js dev server on port ${E2E_CONFIG.serverPort} within ${E2E_CONFIG.timeouts.serverStartupMs}ms`);
}

export function stopSpawnedServer(): void {
  if (spawnedProcess && !spawnedProcess.killed) {
    console.log("[E2E Server Manager] Stopping spawned Next.js dev server...");
    try {
      spawnedProcess.kill("SIGTERM");
    } catch {
      // ignore
    }
    spawnedProcess = null;
  }
}
