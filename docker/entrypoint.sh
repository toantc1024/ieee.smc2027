#!/bin/sh
set -e

echo "[IEEE SMC 2027] Starting container in ${APP_ENV:-production} mode..."

if [ "${AUTO_MIGRATE}" = "true" ]; then
  echo "[IEEE SMC 2027] Synchronizing Prisma database schema..."
  prisma db push --skip-generate --accept-data-loss || npx prisma db push --skip-generate --accept-data-loss || true
fi

exec "$@"
