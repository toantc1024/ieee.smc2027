import { PrismaClient } from "@prisma/client";
import env from "@/config/env";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const client = new PrismaClient({
    log: [
      { emit: "event", level: "error" },
      { emit: "event", level: "warn" },
    ],
  });

  // Filter out benign transient socket close events caused by Neon pooler auto-suspends
  // Prisma engine automatically discards dead idle sockets and reconnects on next query
  client.$on("error", (e) => {
    if (e.message?.includes("Closed") || e.message?.includes("kind: Closed")) {
      return;
    }
    console.error("[Prisma Error]", e.message);
  });

  client.$on("warn", (e) => {
    console.warn("[Prisma Warn]", e.message);
  });

  return client;
}

export const prisma =
  globalForPrisma.prisma && (globalForPrisma.prisma as unknown as Record<string, unknown>).registration
    ? globalForPrisma.prisma
    : createPrismaClient();

if (env.isDev) {
  globalForPrisma.prisma = prisma;
}

export default prisma;
