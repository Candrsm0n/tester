import React from "react";
import { formatRupiah } from "@/lib/utils";

export default function MemberReferralPage() {
  return (
    <div className="rounded-2xl border border-purple-500/30 bg-[#0A0F24]/95 p-6 space-y-6">
      <div>
        <h1 className="text-xl font-black text-white">
          🤝 Program Afiliasi & Referral TOPUPKU
        </h1>
        <p className="text-xs text-slate-400">
          Bagikan kode referral Anda dan dapatkan komisi saldo otomatis Rp 5.000
          setiap teman mendaftar & bertransaksi!
        </p>
      </div>

      <div className="rounded-2xl border border-cyan-500/40 bg-slate-950/80 p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs text-slate-400">Kode Referral Resmi Anda:</span>
          <p className="mt-1 font-mono text-2xl font-black text-cyan-300">
            DIMASVIP88
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400">Total Komisi Diterima:</span>
          <p className="mt-1 text-xl font-black text-emerald-400">
            {formatRupiah(125000)} (25 Member)
          </p>
        </div>
      </div>
    </div>
  );
}
