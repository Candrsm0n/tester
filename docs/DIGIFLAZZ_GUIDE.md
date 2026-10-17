# ⚡ Panduan Konfigurasi Digiflazz H2H Supplier

1. Login ke Member Area Digiflazz (`https://member.digiflazz.com`).
2. Buka menu **Atur Koneksi > API**:
   - Salin **Username** dan **Development / Production Key**.
   - Daftarkan IP Publik VPS Anda pada daftar **Whitelist IP**.
   - Atur **Webhook URL** ke `https://domain-anda.com/api/webhooks/digiflazz` beserta **Secret Key**.
3. Masukkan konfigurasi ke file `.env`:
   ```env
   DIGIFLAZZ_USERNAME="username_anda"
   DIGIFLAZZ_API_KEY="prod-xxxx"
   DIGIFLAZZ_WEBHOOK_SECRET="secret_webhook_anda"
   DIGIFLAZZ_DEFAULT_MARGIN_PERCENT="8"
   ```
4. Untuk menyinkronkan harga modal dan menghitung harga jual otomatis, buka **Admin Panel > Manajemen Produk** lalu klik tombol **Sync Harga & SKU Digiflazz**.
