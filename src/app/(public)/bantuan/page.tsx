import React from "react";
import Link from "next/link";

export const metadata = {
  title: "Pusat Bantuan Pelanggan 24/7",
};

export default function BantuanPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="rounded-3xl border border-purple-500/30 bg-[#0A0F24]/90 p-8">
        <h1 className="text-3xl font-black text-white">
          🎧 Pusat Bantuan & Layanan Pelanggan 24/7
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Tim Customer Support TOPUPKU siap membantu kendala transaksi, pengecekan
          mutasi QRIS, maupun klaim garansi pengiriman 24 jam nonstop.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-emerald-500/30 bg-[#0A0F24] p-6 space-y-3">
          <span className="text-2xl">💬</span>
          <h2 className="text-base font-bold text-white">WhatsApp Resmi 24 Jam</h2>
          <p className="text-xs text-slate-400">
            Respon cepat kurang dari 3 menit untuk pengecekan nomor invoice.
          </p>
          <a
            href="https://wa.me/6281234567890"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-xl bg-emerald-500 px-4 py-2 text-xs font-black text-slate-950"
          >
            Chat WhatsApp CS
          </a>
        </div>

        <div className="rounded-2xl border border-cyan-500/30 bg-[#0A0F24] p-6 space-y-3">
          <span className="text-2xl">📧</span>
          <h2 className="text-base font-bold text-white">Email Support Resmi</h2>
          <p className="text-xs text-slate-400">
            Untuk kerja sama reseller, korporasi, dan rekonsiliasi pembayaran.
          </p>
          <a
            href="mailto:support@topupku.id"
            className="inline-block rounded-xl border border-cyan-400/40 bg-cyan-500/15 px-4 py-2 text-xs font-bold text-cyan-300"
          >
            support@topupku.id
          </a>
        </div>

        <div className="rounded-2xl border border-purple-500/30 bg-[#0A0F24] p-6 space-y-3">
          <span className="text-2xl">📖</span>
          <h2 className="text-base font-bold text-white">Panduan & FAQ</h2>
          <p className="text-xs text-slate-400">
            Temukan jawaban instan seputar cara top up dan pembayaran QRIS.
          </p>
          <Link
            href="/faq"
            className="inline-block rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white"
          >
            Buka Halaman FAQ
          </Link>
        </div>
      </div>
    </div>
  );
}
