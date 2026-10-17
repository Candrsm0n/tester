import React from "react";
import Link from "next/link";

export default function PaymentSuccessPage({
  searchParams,
}: {
  searchParams?: { invoice?: string };
}) {
  const invoice = searchParams?.invoice || "TPK-20261017-ML8821";
  return (
    <div className="mx-auto max-w-lg rounded-3xl border border-emerald-500/40 bg-[#0A0F24]/95 p-8 text-center space-y-5">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 text-4xl">
        ✅
      </div>
      <h1 className="text-2xl font-black text-white">
        Pembayaran QRIS Berhasil Diverifikasi!
      </h1>
      <p className="text-sm text-slate-300">
        Terima kasih! Pembayaran Anda untuk invoice{" "}
        <strong className="text-cyan-300">{invoice}</strong> telah dikonfirmasi
        oleh sistem backend Midtrans dan pesanan telah dikirim otomatis ke
        Digiflazz.
      </p>
      <div className="flex justify-center gap-3 pt-2">
        <Link
          href={`/invoice/${invoice}`}
          className="rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 py-2.5 text-xs font-black text-slate-950"
        >
          Lihat Invoice & Serial Number (SN)
        </Link>
        <Link
          href="/games"
          className="rounded-xl border border-slate-700 bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white"
        >
          Top Up Lagi
        </Link>
      </div>
    </div>
  );
}
