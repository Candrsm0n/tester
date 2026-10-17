"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login gagal.");
        setLoading(false);
        return;
      }
      if (data.user?.role === "ADMIN" || data.user?.role === "SUPERADMIN") {
        router.push("/admin");
      } else {
        router.push("/member/profile");
      }
      router.refresh();
    } catch {
      setError("Gagal menghubungi server autentikasi.");
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md py-8">
      <div className="rounded-3xl border border-purple-500/35 bg-[#0A0F24]/95 p-8 shadow-neon space-y-6">
        <div className="text-center space-y-1">
          <span className="rounded-full bg-purple-500/20 px-3 py-1 text-xs font-bold text-purple-300">
            PORTAL MEMBER & ADMIN
          </span>
          <h1 className="text-2xl font-black text-white pt-2">
            Masuk ke Akun TOPUPKU
          </h1>
          <p className="text-xs text-slate-400">
            Nikmati harga khusus VIP/Reseller dan pantau riwayat transaksi Anda
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-500/40 bg-rose-950/60 p-3.5 text-xs font-semibold text-rose-200">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">
              Email atau Username
            </label>
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="member@topupku.id atau superadmin@topupku.id"
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-300">Password</label>
              <Link
                href="/forgot-password"
                className="text-cyan-400 hover:underline"
              >
                Lupa Password?
              </Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 py-3 text-sm font-black text-white shadow-neon"
          >
            {loading ? "Memverifikasi Kredensial..." : "Masuk Sekarang"}
          </button>
        </form>

        {/* Demo Quick-Fill Helper Box */}
        <div className="rounded-xl border border-cyan-500/30 bg-slate-950/80 p-3.5 text-xs text-slate-300 space-y-2">
          <p className="font-bold text-cyan-300">
            🧪 Akun Demo Siap Uji (Klik untuk Isi Otomatis):
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setIdentifier("member@topupku.id");
                setPassword("TopupkuDemo#2026");
              }}
              className="rounded-lg border border-purple-500/40 bg-purple-600/20 px-2.5 py-1 text-[11px] font-semibold text-purple-200"
            >
              Isi Member VIP
            </button>
            <button
              type="button"
              onClick={() => {
                setIdentifier("admin@topupku.id");
                setPassword("TopupkuDemo#2026");
              }}
              className="rounded-lg border border-cyan-500/40 bg-cyan-600/20 px-2.5 py-1 text-[11px] font-semibold text-cyan-200"
            >
              Isi Admin Ops
            </button>
            <button
              type="button"
              onClick={() => {
                setIdentifier("superadmin@topupku.id");
                setPassword("TopupkuDemo#2026");
              }}
              className="rounded-lg border border-amber-500/40 bg-amber-600/20 px-2.5 py-1 text-[11px] font-semibold text-amber-200"
            >
              Isi Superadmin
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400">
          Belum punya akun member?{" "}
          <Link href="/register" className="font-bold text-cyan-400 hover:underline">
            Daftar Gratis di Sini
          </Link>
        </p>
      </div>
    </div>
  );
}
