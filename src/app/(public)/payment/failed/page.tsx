import React from "react";
import Link from "next/link";

export default function PaymentFailedPage({
  searchParams,
}: {
  searchParams?: { invoice?: string };
}) {
  const invoice = searchParams?.invoice || "";
  return (
    <div className="mx-auto max-w-lg rounded-3xl border border-rose-500/40 bg-[#0A0F24]/95 p-8 text-center space-y-5">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-rose-500/20 text-4xl">
        ⚠️
      </div>
      <h1 className="text-2xl font-black text-white">
        Pembayaran Kedaluwarsa atau Dibatalkan
      </h1>
      <p className="text-sm text-slate-300">
        Pembayaran QRIS untuk transaksi {invoice} belum diselesaikan hingga batas
        waktu berakhir. Silakan buat pesanan baru atau hubungi CS WhatsApp 24/7
        jika saldo Anda terpotong.
      </p>
      <div className="flex justify-center gap-3 pt-2">
        <Link
          href="/games"
          className="rounded-xl bg-purple-600 px-5 py-2.5 text-xs font-bold text-white"
        >
          Buat Pesanan Baru
        </Link>
        <Link
          href="/bantuan"
          className="rounded-xl border border-slate-700 bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white"
        >
          Hubungi Bantuan CS
        </Link>
      </div>
    </div>
  );
}
