# syntax=docker/dockerfile:1

# ==============================================================================
# 1. BASE IMAGE (Node 22 Alpine + OpenSSL for Prisma + PNPM)
# ==============================================================================
FROM node:22-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl curl wget
RUN corepack enable && corepack prepare pnpm@latest --activate

# ==============================================================================
# 2. DEPENDENCIES STAGE
# ==============================================================================
FROM base AS deps
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY prisma ./prisma/

RUN pnpm install --frozen-lockfile
RUN npx prisma generate

# ==============================================================================
# 3. DEVELOPMENT STAGE (Hot-Reload Container Target)
# ==============================================================================
FROM base AS development
WORKDIR /app

ENV NODE_ENV=development
ENV APP_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

COPY --from=deps /app/node_modules ./node_modules
COPY . .

EXPOSE 3000
CMD ["pnpm", "run", "dev"]

# ==============================================================================
# 4. PRODUCTION BUILDER STAGE
# ==============================================================================
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV APP_ENV=production

RUN npx prisma generate
RUN pnpm run build

# ==============================================================================
# 5. PRODUCTION RUNNER STAGE (Minimal Standalone Image)
# ==============================================================================
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV APP_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

RUN mkdir -p /app/public/uploads && chown -R nextjs:nodejs /app/public/uploads

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/docker/entrypoint.sh ./entrypoint.sh

RUN chmod +x /app/entrypoint.sh

USER nextjs

EXPOSE 3000

ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["node", "server.js"]
