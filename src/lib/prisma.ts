import { PrismaClient } from "@prisma/client";
import env from "@/config/env";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma && (globalForPrisma.prisma as unknown as Record<string, unknown>).registration
    ? globalForPrisma.prisma
    : new PrismaClient({
        log: env.isDev ? ["warn", "error"] : ["error"],
      });

if (env.isDev) {
  globalForPrisma.prisma = prisma;
}

export default prisma;
