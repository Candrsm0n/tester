import React from "react";
import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center justify-center py-20 text-center space-y-5">
      <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-purple-600/20 border border-purple-500/40 text-4xl font-black text-cyan-300 shadow-neon">
        404
      </div>
      <h1 className="text-3xl font-black text-white">
        Halaman Tidak Ditemukan
      </h1>
      <p className="text-sm text-slate-400">
        Maaf, halaman atau produk game yang Anda cari tidak tersedia atau telah
        dipindahkan. Silakan kembali ke katalog utama TOPUPKU.
      </p>
      <div className="flex gap-3">
        <Link
          href="/"
          className="rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 px-5 py-2.5 text-xs font-bold text-white shadow-neon"
        >
          Kembali ke Beranda
        </Link>
        <Link
          href="/games"
          className="rounded-xl border border-slate-700 bg-slate-900 px-5 py-2.5 text-xs font-semibold text-slate-200"
        >
          Lihat Semua Game
        </Link>
      </div>
    </div>
  );
}
