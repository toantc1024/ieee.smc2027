#!/bin/sh
set -e

echo "[IEEE SMC 2027] Starting container in ${APP_ENV:-production} mode..."

if [ "${AUTO_MIGRATE}" = "true" ]; then
  echo "[IEEE SMC 2027] Running Prisma database migrations..."
  npx prisma migrate deploy || npx prisma db push --accept-data-loss
fi

exec "$@"
