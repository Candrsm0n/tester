"use client";

import React, { useState } from "react";
import Link from "next/link";
import { formatJakartaDateTime, formatRupiah } from "@/lib/utils";
import type { OrderDTO } from "@/types";

export default function CekTransaksiPage() {
  const [invoiceInput, setInvoiceInput] = useState("TPK-20261017-ML8821");
  const [order, setOrder] = useState<OrderDTO | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceInput.trim()) return;
    setLoading(true);
    setError(null);
    setOrder(null);
    try {
      const res = await fetch(
        `/api/orders?invoice=${encodeURIComponent(invoiceInput.trim())}`
      );
      const data = await res.json();
      if (!res.ok || !data.order) {
        setError(data.error || "Nomor Invoice tidak ditemukan.");
      } else {
        setOrder(data.order);
      }
    } catch {
      setError("Gagal mengecek status transaksi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="rounded-3xl border border-purple-500/30 bg-[#0A0F24]/90 p-8">
        <h1 className="text-2xl font-black text-white sm:text-3xl">
          🔎 Cek Status Transaksi & Invoice Real-Time
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Masukkan Nomor Invoice Anda (contoh:{" "}
          <code className="text-cyan-300">TPK-20261017-ML8821</code> atau{" "}
          <code className="text-cyan-300">TPK-20261017-VAL404</code>) untuk
          memantau status pembayaran QRIS dan kode Serial Number (SN) Digiflazz.
        </p>

        <form onSubmit={handleSearch} className="mt-6 flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={invoiceInput}
            onChange={(e) => setInvoiceInput(e.target.value.toUpperCase())}
            placeholder="Masukkan Nomor Invoice (TPK-...)"
            className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-mono text-white focus:border-cyan-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 px-6 py-3 text-sm font-black text-white shadow-neon"
          >
            {loading ? "Mencari..." : "Lacak Pesanan"}
          </button>
        </form>

        {error && (
          <div className="mt-4 rounded-xl border border-rose-500/40 bg-rose-950/60 p-4 text-xs font-semibold text-rose-200">
            ⚠️ {error}
          </div>
        )}
      </div>

      {order && (
        <div className="rounded-2xl border border-cyan-500/35 bg-[#0A0F24]/95 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs text-slate-400">Hasil Pelacakan Invoice</span>
              <h2 className="text-lg font-black text-white">
                {order.invoiceNumber}
              </h2>
            </div>
            <span className="rounded-full bg-purple-500/20 border border-purple-500/40 px-3 py-1 text-xs font-bold text-cyan-300">
              {order.status}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
            <div>
              <span className="text-slate-400 block">Produk & Nominal</span>
              <strong className="text-white">
                {order.productName} — {order.variantName}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 block">User ID Tujuan</span>
              <strong className="text-white">
                {order.gameUserId} {order.gameZoneId ? `(${order.gameZoneId})` : ""}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 block">Total Pembayaran</span>
              <strong className="text-cyan-300">
                {formatRupiah(order.totalAmount)}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 block">Waktu Transaksi</span>
              <strong className="text-white">
                {formatJakartaDateTime(order.createdAt)}
              </strong>
            </div>
            <div className="sm:col-span-2">
              <span className="text-slate-400 block">Serial Number (SN)</span>
              <strong className="font-mono text-emerald-400">
                {order.serialNumber || "Menunggu Penyelesaian Pembayaran"}
              </strong>
            </div>
          </div>

          <div className="pt-3 flex gap-3">
            <Link
              href={`/invoice/${order.invoiceNumber}`}
              className="rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-bold text-white"
            >
              Buka Halaman Invoice & QRIS Lengkap →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
