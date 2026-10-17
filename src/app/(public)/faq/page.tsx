import React from "react";

export const metadata = {
  title: "FAQ — Pertanyaan yang Sering Diajukan",
};

export default function FaqPage() {
  const faqs = [
    {
      q: "Berapa lama proses masuknya Diamond atau Token setelah pembayaran QRIS?",
      a: "Sistem TOPUPKU terhubung langsung dengan webhook Midtrans dan API Digiflazz. Begitu pembayaran QRIS Anda terverifikasi (settlement), pesanan dikirim otomatis dalam 1 hingga 5 detik.",
    },
    {
      q: "Apakah QRIS di TOPUPKU mendukung semua aplikasi e-wallet dan m-banking?",
      a: "Ya! QRIS Dinamis kami mendukung GoPay, DANA, OVO, ShopeePay, LinkAja, BCA Mobile, Livin by Mandiri, BRImo, BNI Mobile, Jago, dan SeaBank.",
    },
    {
      q: "Bagaimana jika saya salah memasukkan User ID game?",
      a: "Sistem kami menyediakan fitur Cek Nickname sebelum pembayaran. Pastikan Nickname sesuai sebelum melakukan scan QRIS karena transaksi yang sudah sukses di server game tidak dapat dibatalkan.",
    },
    {
      q: "Apa keuntungan mendaftar menjadi Member VIP / Reseller TOPUPKU?",
      a: "Member mendapatkan harga khusus yang lebih murah di setiap produk, saldo deposit instan tanpa biaya admin, poin loyalitas di setiap transaksi, dan komisi referral Rp 5.000/member.",
    },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="rounded-3xl border border-purple-500/30 bg-[#0A0F24]/90 p-8">
        <h1 className="text-3xl font-black text-white">
          ❓ Pertanyaan yang Sering Diajukan (FAQ)
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Informasi lengkap seputar layanan top up otomatis TOPUPKU
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((item, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-slate-800 bg-[#0A0F24]/90 p-6"
          >
            <h2 className="text-base font-bold text-cyan-300">{item.q}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              {item.a}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
