#!/usr/bin/env bash
set -euo pipefail
export TZ="Asia/Jakarta"
export NODE_ENV="production"
echo "🏗️ Membangun dan menjalankan TOPUPKU Production..."
npx prisma generate
npx prisma migrate deploy
npm run build
npm start
