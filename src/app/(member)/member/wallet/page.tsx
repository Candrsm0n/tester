import React from "react";
import Link from "next/link";
import { formatRupiah } from "@/lib/utils";

export default function MemberWalletPage() {
  const sampleMutations = [
    {
      id: "mut_1",
      ref: "DEP-20261016-9912",
      type: "DEPOSIT",
      amount: 500000,
      balanceAfter: 750000,
      desc: "Deposit Saldo via QRIS Dinamis Midtrans",
      date: "16 Okt 2026, 19:20 WIB",
    },
    {
      id: "mut_2",
      ref: "CB-TPK-ML8821",
      type: "CASHBACK",
      amount: 4500,
      balanceAfter: 250000,
      desc: "Cashback Transaksi Mobile Legends 257 DM",
      date: "15 Okt 2026, 14:10 WIB",
    },
    {
      id: "mut_3",
      ref: "REF-BONUS-088",
      type: "REFERRAL_BONUS",
      amount: 5000,
      balanceAfter: 245500,
      desc: "Komisi Referral Member Baru",
      date: "14 Okt 2026, 10:05 WIB",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-cyan-500/35 bg-gradient-to-r from-[#0A0F24] via-purple-950/60 to-[#0A0F24] p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-cyan-300">
            SALDO DOMPET TOPUPKU
          </span>
          <h1 className="mt-1 text-3xl font-black text-white">
            {formatRupiah(750000)}
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Dapat digunakan untuk pembayaran instan 1 detik seluruh produk game
          </p>
        </div>
        <Link
          href="/member/deposit"
          className="rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 px-5 py-3 text-xs font-black text-white shadow-neon"
        >
          ➕ Isi Saldo Deposit QRIS
        </Link>
      </div>

      <div className="rounded-2xl border border-purple-500/30 bg-[#0A0F24]/95 p-6 space-y-4">
        <h2 className="text-base font-bold text-white">
          Riwayat Mutasi Saldo Akun
        </h2>
        <div className="space-y-3">
          {sampleMutations.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-xs"
            >
              <div>
                <span className="font-mono text-[11px] text-cyan-300">
                  {m.ref} • {m.type}
                </span>
                <p className="mt-0.5 font-bold text-white">{m.desc}</p>
                <span className="text-[11px] text-slate-400">{m.date}</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-black text-emerald-400">
                  + {formatRupiah(m.amount)}
                </span>
                <span className="block text-[10px] text-slate-400">
                  Saldo Akhir: {formatRupiah(m.balanceAfter)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
