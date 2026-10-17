import React from "react";

export const metadata = {
  title: "Syarat & Ketentuan Layanan",
};

export default function SyaratKetentuanPage() {
  return (
    <div className="mx-auto max-w-4xl rounded-3xl border border-purple-500/30 bg-[#0A0F24]/90 p-8 space-y-5 text-sm leading-relaxed text-slate-300">
      <h1 className="text-2xl font-black text-white">
        📜 Syarat dan Ketentuan Layanan TOPUPKU
      </h1>
      <p>
        Selamat datang di platform TOPUPKU. Dengan mengakses dan melakukan
        transaksi di situs ini, Anda menyetujui seluruh ketentuan layanan berikut:
      </p>
      <h2 className="text-base font-bold text-cyan-300">
        1. Akurasi Data User ID & Nomor Tujuan
      </h2>
      <p>
        Pelanggan bertanggung jawab penuh atas kebenaran input User ID, Zone ID,
        maupun Nomor HP/Meter PLN. Kesalahan input oleh pelanggan yang telah
        berstatus Sukses di supplier tidak dapat direfund.
      </p>
      <h2 className="text-base font-bold text-cyan-300">
        2. Pembayaran QRIS Dinamis & Verifikasi
      </h2>
      <p>
        Seluruh pembayaran menggunakan QRIS Dinamis resmi Midtrans dengan nominal
        otomatis. Status pembayaran hanya dianggap sah setelah server kami
        menerima webhook ber-signature SHA-512 valid dan terkonfirmasi melalui API
        Midtrans.
      </p>
      <h2 className="text-base font-bold text-cyan-300">
        3. Garansi Pengembalian Dana (Refund)
      </h2>
      <p>
        Apabila pembayaran Anda telah terverifikasi (Settlement) namun stok
        supplier mengalami gangguan permanen, dana 100% akan dikembalikan ke
        Saldo Akun TOPUPKU atau rekening asal Anda maksimal 1x24 jam.
      </p>
    </div>
  );
}
