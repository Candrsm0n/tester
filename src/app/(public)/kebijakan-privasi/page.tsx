import React from "react";

export const metadata = {
  title: "Kebijakan Privasi & Perlindungan Data",
};

export default function KebijakanPrivasiPage() {
  return (
    <div className="mx-auto max-w-4xl rounded-3xl border border-purple-500/30 bg-[#0A0F24]/90 p-8 space-y-5 text-sm leading-relaxed text-slate-300">
      <h1 className="text-2xl font-black text-white">
        🔒 Kebijakan Privasi TOPUPKU
      </h1>
      <p>
        TOPUPKU berkomitmen melindungi privasi dan keamanan data pribadi seluruh
        pelanggan dan member sesuai regulasi Perlindungan Data Pribadi (UU PDP) di
        Indonesia.
      </p>
      <h2 className="text-base font-bold text-cyan-300">
        1. Data yang Kami Kumpulkan
      </h2>
      <p>
        Kami hanya mengumpulkan informasi yang dibutuhkan untuk memproses pesanan
        dan akun Anda: User ID Game, Nomor WhatsApp notifikasi, Alamat Email, dan
        log teknis keamanan transaksi.
      </p>
      <h2 className="text-base font-bold text-cyan-300">
        2. Keamanan Password & Transaksi
      </h2>
      <p>
        Seluruh password akun di-hash menggunakan algoritma kriptografi Scrypt +
        Salt unik. Sesi login diamankan menggunakan HTTP-Only Cookie bertanda
        tangan HMAC-SHA256.
      </p>
    </div>
  );
}
