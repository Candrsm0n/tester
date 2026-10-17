# 🚢 Panduan Deployment Production (Docker, Nginx, PM2 & PostgreSQL)

## Opsi 1: Deployment Menggunakan Docker Compose (Direkomendasikan)

1. Siapkan VPS Ubuntu 22.04 / 24.04 LTS dengan Docker dan Docker Compose terinstal.
2. Salin `.env.example` ke `.env` dan ubah:
   - `APP_MODE="PRODUCTION"`
   - `AUTH_SECRET` dan `CSRF_SECRET` dengan string acak minimal 64 karakter.
   - Kredensial `MIDTRANS_SERVER_KEY`, `DIGIFLAZZ_USERNAME`, dan `DIGIFLAZZ_API_KEY`.
3. Jalankan container:
   ```bash
   docker compose up -d --build
   ```
4. Arsitektur yang berjalan:
   - `topupku_postgres`: PostgreSQL 16 Alpine dengan persistent volume.
   - `topupku_app`: Next.js Production Server di port `3000`.
   - `topupku_nginx`: Reverse proxy di port `80` dengan rate limiting dan security headers.

## Opsi 2: Deployment Menggunakan PM2 + Nginx Native

```bash
npm install
npx prisma generate
npx prisma migrate deploy
npm run db:seed
npm run build
pm2 start ecosystem.config.js --env production
pm2 save
```

## Backup Database PostgreSQL
Jalankan script backup kapan saja atau melalui cronjob harian:
```bash
bash scripts/backup-db.sh
```
