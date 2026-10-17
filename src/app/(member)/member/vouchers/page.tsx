import React from "react";
import { runtimeStore } from "@/lib/db/runtime-store";
import { formatRupiah } from "@/lib/utils";

export default function MemberVouchersPage() {
  const vouchers = runtimeStore.vouchers;

  return (
    <div className="rounded-2xl border border-purple-500/30 bg-[#0A0F24]/95 p-6 space-y-5">
      <div>
        <h1 className="text-xl font-black text-white">
          🎟️ Koleksi Voucher Member Saya
        </h1>
        <p className="text-xs text-slate-400">
          Daftar kode voucher aktif yang dapat Anda gunakan saat checkout
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {vouchers.map((v) => (
          <div
            key={v.id}
            className="rounded-xl border border-dashed border-cyan-500/40 bg-slate-900/70 p-4 space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="rounded bg-cyan-500/20 px-2.5 py-0.5 font-mono text-xs font-black text-cyan-300">
                {v.code}
              </span>
              <span className="text-[11px] font-bold text-emerald-400">
                AKTIF
              </span>
            </div>
            <h2 className="text-sm font-bold text-white">{v.title}</h2>
            <p className="text-xs text-slate-400">{v.description}</p>
            <p className="text-[11px] text-slate-500">
              Minimal transaksi: {formatRupiah(v.minTransaction)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
