import React from "react";
import Link from "next/link";
import { runtimeStore } from "@/lib/db/runtime-store";
import { formatRupiah } from "@/lib/utils";

export const metadata = {
  title: "Promo & Kode Voucher Diskon Game",
};

export default function PromoPage() {
  const vouchers = runtimeStore.vouchers;
  const banners = runtimeStore.banners;

  return (
    <div className="space-y-10">
      <div className="rounded-3xl border border-purple-500/30 bg-[#0A0F24]/90 p-8">
        <h1 className="text-3xl font-black text-white">
          🎁 Promo Spesial & Kode Voucher TOPUPKU
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Gunakan kode promo resmi di bawah ini pada langkah ke-4 saat checkout
          untuk mendapatkan diskon persentase, potongan langsung, maupun cashback
          saldo member.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {vouchers.map((v) => (
          <div
            key={v.id}
            className="flex flex-col justify-between rounded-2xl border border-purple-500/30 bg-[#0A0F24]/95 p-6 space-y-4"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-lg bg-cyan-500/20 border border-cyan-400/40 px-3 py-1 font-mono text-sm font-black text-cyan-300">
                  {v.code}
                </span>
                <span className="text-xs font-semibold text-emerald-400">
                  {v.discountType}
                </span>
              </div>
              <h2 className="mt-3 text-lg font-bold text-white">{v.title}</h2>
              <p className="mt-1 text-xs leading-relaxed text-slate-300">
                {v.description}
              </p>
            </div>
            <div className="border-t border-slate-800 pt-3 text-xs text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>Minimal Transaksi:</span>
                <strong className="text-white">
                  {formatRupiah(v.minTransaction)}
                </strong>
              </div>
              <div className="flex justify-between">
                <span>Sisa Kuota Voucher:</span>
                <strong className="text-cyan-300">
                  {v.usageLimit - v.usedCount} / {v.usageLimit}
                </strong>
              </div>
              <Link
                href="/games"
                className="mt-3 block w-full rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 py-2.5 text-center text-xs font-bold text-white"
              >
                Pakai Voucher Sekarang
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {banners.map((b) => (
          <div
            key={b.id}
            className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5"
          >
            <span className="text-[10px] font-bold uppercase text-purple-300">
              {b.badgeText}
            </span>
            <h3 className="mt-1 text-base font-bold text-white">{b.title}</h3>
            <p className="mt-1 text-xs text-slate-400">{b.subtitle}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
