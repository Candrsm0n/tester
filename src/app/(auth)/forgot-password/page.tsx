"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setMessage(data.message || data.error);
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-md py-12">
      <div className="rounded-3xl border border-purple-500/35 bg-[#0A0F24]/95 p-8 space-y-5">
        <h1 className="text-2xl font-black text-white">🔑 Lupa Password Akun</h1>
        <p className="text-xs text-slate-400">
          Masukkan alamat email akun TOPUPKU Anda untuk menerima tautan reset
          password.
        </p>

        {message && (
          <div className="rounded-xl border border-cyan-500/40 bg-cyan-950/50 p-3.5 text-xs text-cyan-200">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@domain.com"
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-purple-600 py-3 text-xs font-bold text-white"
          >
            {loading ? "Mengirim..." : "Kirim Tautan Reset Password"}
          </button>
        </form>

        <Link
          href="/login"
          className="block text-center text-xs font-bold text-cyan-400 hover:underline"
        >
          ← Kembali ke Halaman Login
        </Link>
      </div>
    </div>
  );
}
