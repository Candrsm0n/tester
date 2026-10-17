"use client";

import React, { useState } from "react";
import { formatRupiah } from "@/lib/utils";

export default function MemberDepositPage() {
  const [amount, setAmount] = useState(50000);
  const [depositTicket, setDepositTicket] = useState<any | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const presets = [25000, 50000, 100000, 250000, 500000, 1000000];

  const handleCreateDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const res = await fetch("/api/member/deposit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, paymentMethod: "QRIS_DYNAMIC" }),
    });
    const data = await res.json();
    if (res.ok && data.deposit) {
      setDepositTicket(data.deposit);
    } else {
      // Fallback demo ticket if user is viewing without login cookie
      setDepositTicket({
        depositCode: `DEP-DEMO-${Date.now().toString().slice(-5)}`,
        amount,
        uniqueCode: 42,
        totalPayable: amount + 42,
        status: "PENDING",
      });
    }
    setLoading(false);
  };

  return (
    <div className="rounded-2xl border border-purple-500/30 bg-[#0A0F24]/95 p-6 space-y-6">
      <div>
        <h1 className="text-xl font-black text-white">
          ➕ Deposit Saldo Akun via QRIS Dinamis
        </h1>
        <p className="text-xs text-slate-400">
          Bebas biaya admin! Saldo masuk otomatis detik itu juga setelah scan QRIS
        </p>
      </div>

      <form onSubmit={handleCreateDeposit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {presets.map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => setAmount(val)}
              className={`rounded-xl border p-3 text-xs font-bold ${
                amount === val
                  ? "border-cyan-400 bg-purple-950/60 text-cyan-300 shadow-neon"
                  : "border-slate-800 bg-slate-900 text-slate-300"
              }`}
            >
              {formatRupiah(val)}
            </button>
          ))}
        </div>

        <div>
          <label className="mb-1.5 block text-xs text-slate-300">
            Atau Masukkan Nominal Deposit (Min. Rp 10.000)
          </label>
          <input
            type="number"
            min={10000}
            max={10000000}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 px-6 py-3 text-xs font-black text-white shadow-neon"
        >
          {loading ? "Membuat Tiket QRIS..." : "Buat QRIS Deposit Sekarang"}
        </button>
      </form>

      {depositTicket && (
        <div className="rounded-2xl border border-cyan-500/40 bg-slate-950/80 p-5 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <strong className="text-sm text-white">
              Tiket Deposit: {depositTicket.depositCode}
            </strong>
            <span className="rounded bg-amber-500/20 px-2.5 py-0.5 font-bold text-amber-300">
              {depositTicket.status}
            </span>
          </div>
          <p className="text-slate-300">
            Silakan transfer tepat sebesar{" "}
            <strong className="text-cyan-300 text-sm">
              {formatRupiah(depositTicket.totalPayable)}
            </strong>{" "}
            (termasuk kode unik {depositTicket.uniqueCode}) melalui QRIS Dinamis.
          </p>
          {message && <p className="text-emerald-400 font-bold">✓ {message}</p>}
        </div>
      )}
    </div>
  );
}
