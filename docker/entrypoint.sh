#!/bin/sh
set -e

echo "[IEEE SMC 2027] Starting container in ${APP_ENV:-production} mode..."

if [ "${AUTO_MIGRATE}" = "true" ]; then
  echo "[IEEE SMC 2027] Synchronizing Prisma database schema..."
  prisma db push --skip-generate --accept-data-loss || npx prisma db push --skip-generate --accept-data-loss || true
fi

if [ -f /app/scripts/migrate-cms-blocks.mjs ]; then
  echo "[IEEE SMC 2027] Running idempotent CMS block migration..."
  node /app/scripts/migrate-cms-blocks.mjs || echo "[entrypoint] Warning: block migration skipped"
fi

exec "$@"
