import React from "react";
import Link from "next/link";

export default function MaintenancePage() {
  return (
    <div className="mx-auto max-w-xl rounded-3xl border border-amber-500/40 bg-[#0A0F24]/95 p-10 text-center space-y-5 my-12">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-500/20 text-4xl">
        🛠️
      </div>
      <h1 className="text-2xl font-black text-white">
        Sistem Sedang Pemeliharaan Terjadwal
      </h1>
      <p className="text-sm text-slate-300">
        Kami sedang meningkatkan kapasitas server dan sinkronisasi jalur supplier
        agar transaksi top up Anda semakin cepat. Layanan akan kembali normal
        dalam beberapa menit.
      </p>
      <Link
        href="/"
        className="inline-block rounded-xl bg-purple-600 px-5 py-2.5 text-xs font-bold text-white"
      >
        Cek Status Kembali
      </Link>
    </div>
  );
}
