#!/usr/bin/env bash
set -euo pipefail

echo "========================================================"
echo "🚀 TOPUPKU - AUTOMATED PROJECT SETUP SCRIPT"
echo "========================================================"

if [ ! -f .env ]; then
  echo "📄 Menyalin .env.example menjadi .env..."
  cp .env.example .env
fi

echo "📦 Menginstal dependencies npm..."
npm install

echo "🧬 Menjalankan Prisma Generate..."
npx prisma generate

echo "🗄️ Menjalankan migrasi database PostgreSQL..."
npx prisma migrate deploy || npx prisma db push

echo "🌱 Menjalankan database seed (Role, Akun Demo Aman, Katalog 11 Produk, Voucher)..."
npm run db:seed

echo "✅ Setup TOPUPKU selesai! Jalankan 'npm run dev' atau 'docker compose up -d --build'."
