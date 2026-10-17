# 💳 Panduan Konfigurasi Midtrans Dynamic QRIS

1. Masuk ke Dashboard Midtrans (**MAP - Merchant Administration Portal**) di `https://dashboard.midtrans.com`.
2. Pilih environment **Sandbox** (untuk pengujian) atau **Production** (untuk transaksi nyata).
3. Buka menu **Settings > Access Keys** dan salin:
   - `Merchant ID`
   - `Client Key`
   - `Server Key`
4. Masukkan ke dalam file `.env` di server Anda:
   ```env
   MIDTRANS_IS_PRODUCTION="false" # ubah ke "true" saat live
   MIDTRANS_MERCHANT_ID="G123456789"
   MIDTRANS_CLIENT_KEY="SB-Mid-client-xxxx"
   MIDTRANS_SERVER_KEY="SB-Mid-server-xxxx"
   ```
5. Buka menu **Settings > Configuration** di Dashboard Midtrans dan isi **Payment Notification URL**:
   ```
   https://domain-anda.com/api/webhooks/midtrans
   ```
