# 🚀 TOPUPKU — Platform Top Up Game & Produk Digital Full Stack

**TOPUPKU** adalah aplikasi web full-stack enterprise untuk bisnis top up game dan produk digital otomatis 24 jam. Dibangun menggunakan **Next.js App Router**, **React 18**, **TypeScript Strict Mode**, **Tailwind CSS**, **Prisma ORM**, dan **PostgreSQL**, serta dilengkapi integrasi resmi **Midtrans Dynamic QRIS** dan **Digiflazz H2H API**.

---

## ✨ Fitur Utama

1. **Katalog 11 Game & Produk Digital Dinamis**:
   - Mobile Legends (`/mobile-legends`), Free Fire (`/free-fire`), PUBG Mobile (`/pubg-mobile`), Honor of Kings (`/honor-of-kings`), Genshin Impact (`/genshin-impact`), Valorant (`/valorant`), Roblox (`/roblox`), Pulsa (`/pulsa`), Paket Data (`/paket-data`), Token PLN (`/token-pln`), dan Voucher Digital (`/voucher-digital`).
2. **Alur Checkout 15 Langkah End-to-End**:
   - Cek Nickname Player ID, pilih nominal varian/Flash Sale, pilih metode pembayaran (QRIS Dinamis / Saldo Member), validasi kode promo di backend, generate invoice unik & QRIS Dinamis, countdown timer real-time, verifikasi webhook Midtrans SHA-512, auto-dispatch ke Digiflazz dengan proteksi anti-kirim-ganda (`supplierDispatchLock`), cetak Invoice PDF, serta pengiriman notifikasi multi-saluran (Website, WhatsApp, Email SMTP).
3. **Dua Mode Eksekusi Terisolasi (`DEMO` & `PRODUCTION`)**:
   - **Mode `DEMO`**: Dilengkapi seed katalog lengkap, akun demo, dan tombol simulasi pembayaran QRIS berlabel `DEMO` tanpa memerlukan API key eksternal.
   - **Mode `PRODUCTION`**: Menggunakan API resmi Midtrans & Digiflazz, menolak simulasi pembayaran palsu, dan memblokir pengiriman produk sebelum pembayaran terverifikasi (`SETTLEMENT`).
4. **Sistem Member & Loyalitas Lengkap**:
   - Registrasi, Login (HTTP-Only Signed Cookie + Scrypt Password Hashing), Level Member (`BRONZE`, `SILVER`, `GOLD`, `PLATINUM`, `DIAMOND`), Dompet Saldo, Deposit QRIS, Voucher Saya, dan Program Referral.
5. **Dashboard Admin Premium (`/admin`)**:
   - Grafik Pendapatan & Keuntungan 7 Hari, Manajemen Produk & Sinkronisasi Harga/SKU Digiflazz, Manajemen Transaksi + Export CSV/Excel & Invoice PDF, Manajemen Pengguna RBAC, Monitoring Webhook Midtrans, Pengaturan SEO/Maintenance Mode, dan Audit Log Keamanan.

---

## 🛠️ Perintah Cepat (Quick Start)

### 1. Menjalankan Secara Lokal (Node.js + PostgreSQL)

```bash
# 1. Salin konfigurasi environment
cp .env.example .env

# 2. Install seluruh dependencies
npm install

# 3. Generate Prisma Client, jalankan migrasi & seed database PostgreSQL
npx prisma generate
npx prisma migrate deploy
npm run db:seed

# 4. Jalankan server development
npm run dev

# 5. Atau jalankan build produksi
npm run build
npm start
```

### 2. Menjalankan dengan Docker Compose (PostgreSQL 16 + App + Nginx)

```bash
cp .env.example .env
docker compose up -d --build
```

---

## 🔐 Akun Demo (Dibuat saat Seed)

Saat `npm run db:seed` dijalankan, akun demo berikut tersedia (password default berasal dari variabel `DEMO_SEED_PASSWORD_ENV` di `.env`, default: `TopupkuDemo#2026`):

| Role | Email | Username | Hak Akses |
| :--- | :--- | :--- | :--- |
| **SUPERADMIN** | `superadmin@topupku.id` | `superadmin` | Akses penuh Admin, Integrasi API, & Audit Log |
| **ADMIN** | `admin@topupku.id` | `admin_topupku` | Manajemen Produk, Transaksi, Export, & Promo |
| **VIP MEMBER** | `member@topupku.id` | `dimas_gamer` | Harga VIP, Saldo Rp 750.000, & Loyalty Points |

---

## 📚 Dokumentasi Lengkap

- [Dokumentasi REST API (`docs/API.md`)](./docs/API.md)
- [Panduan Deployment VPS, Docker, Nginx & PM2 (`docs/DEPLOYMENT.md`)](./docs/DEPLOYMENT.md)
- [Panduan Konfigurasi Midtrans QRIS (`docs/MIDTRANS_GUIDE.md`)](./docs/MIDTRANS_GUIDE.md)
- [Panduan Konfigurasi Digiflazz H2H (`docs/DIGIFLAZZ_GUIDE.md`)](./docs/DIGIFLAZZ_GUIDE.md)
- [Panduan Keamanan Webhook (`docs/WEBHOOK_GUIDE.md`)](./docs/WEBHOOK_GUIDE.md)
