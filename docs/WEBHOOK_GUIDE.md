# 🔒 Panduan Verifikasi & Idempotency Webhook

## 1. Webhook Midtrans (`POST /api/webhooks/midtrans`)
- **Verifikasi Signature SHA-512**:
  Sistem menghitung `SHA512(order_id + status_code + gross_amount + MIDTRANS_SERVER_KEY)` dan membandingkannya secara *constant-time* (`crypto.timingSafeEqual`) dengan `signature_key` pada payload.
- **Validasi Nominal Pembayaran**:
  Sistem memeriksa bahwa `gross_amount` pada webhook sama persis dengan `totalAmount` pesanan di database.
- **Re-Verifikasi API Server-to-Server**:
  Sebelum mengirim produk ke Digiflazz, backend melakukan panggilan `GET /v2/{order_id}/status` ke server Midtrans untuk memastikan status benar-benar `settlement`.
- **Idempotency & Anti Double-Dispatch**:
  Setiap webhook memiliki `idempotencyHash` unik dan setiap pesanan dilindungi oleh `supplierDispatchLock` sehingga pengiriman ganda ke Digiflazz mustahil terjadi walaupun Midtrans mengirim ulang webhook berkali-kali.

## 2. Webhook Digiflazz (`POST /api/webhooks/digiflazz`)
- Memverifikasi header `X-Hub-Signature` menggunakan algoritma `HMAC-SHA1` dengan `DIGIFLAZZ_WEBHOOK_SECRET`.
- Memperbarui `supplierStatus` (`SUCCESS` / `FAILED`) dan menyimpan `serialNumber` (SN) langsung ke invoice pelanggan.
