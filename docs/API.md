# 📡 Dokumentasi REST API — TOPUPKU

Seluruh endpoint berada di bawah `src/app/api/` dan dilindungi oleh validasi input, rate limiting, serta otorisasi berbasis sesi (`HTTP-Only Cookie`).

## 1. Public & Catalog Endpoints
- `GET /api/health` — Pemeriksaan kesehatan sistem, mode eksekusi (`DEMO`/`PRODUCTION`), dan koneksi database.
- `GET /api/categories` — Daftar seluruh kategori game dan produk digital.
- `GET /api/products?category=&q=&sort=` — Daftar produk dengan filter kategori, pencarian, dan pengurutan.
- `GET /api/products/[slug]` — Detail produk beserta seluruh varian SKU dan harga tier member.
- `GET /api/promos` — Daftar voucher aktif, banner promosi, dan item Flash Sale.
- `POST /api/check-player` — Validasi User ID & Zone ID untuk mengecek nickname akun game.

## 2. Checkout, Order & Payment Endpoints
- `POST /api/vouchers/validate` — Validasi kode promo dan kalkulasi potongan harga di sisi backend.
- `POST /api/orders` — Membuat pesanan baru (dilindungi `idempotencyKey`) dan menghasilkan QRIS Dinamis.
- `GET /api/orders/[invoice]` — Mengambil detail lengkap pesanan dan status pengiriman.
- `GET /api/orders/[invoice]/invoice-pdf` — Menampilkan/mencetak Invoice resmi berformat HTML/PDF siap cetak.
- `GET /api/payments/status?invoice=` — Polling status pembayaran dan kedaluwarsa QRIS secara real-time.
- `POST /api/payments/demo-simulate` — Simulasi penyelesaian pembayaran QRIS (Hanya aktif di `APP_MODE="DEMO"`, diblokir permanen di `PRODUCTION`).

## 3. Webhook Endpoints
- `POST /api/webhooks/midtrans` — Menerima notifikasi pembayaran Midtrans, memverifikasi signature `SHA-512`, mengecek idempotency, memverifikasi ulang status ke API Midtrans, dan memicu pengiriman otomatis ke Digiflazz.
- `POST /api/webhooks/digiflazz` — Menerima pembaruan status pengiriman & Serial Number (SN) dari Digiflazz dengan verifikasi `X-Hub-Signature` (`HMAC-SHA1`).

## 4. Auth, Member & Admin Endpoints
- `POST /api/auth/register` / `POST /api/auth/login` / `POST /api/auth/logout` / `GET /api/auth/me`
- `PATCH /api/member/profile` / `POST /api/member/deposit` / `POST /api/member/wishlist`
- `GET /api/admin/stats` / `GET,POST /api/admin/products` / `GET /api/admin/orders` / `GET /api/admin/orders/export?format=csv|excel` / `POST /api/admin/digiflazz/sync` / `GET /api/admin/integrations` / `GET /api/admin/audit-logs`
