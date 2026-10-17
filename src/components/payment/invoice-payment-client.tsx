"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useCountdown } from "@/hooks/use-countdown";
import { formatJakartaDateTime, formatRupiah } from "@/lib/utils";
import type { OrderDTO } from "@/types";

export function InvoicePaymentClient({
  initialOrder,
}: {
  initialOrder: OrderDTO;
}) {
  const [order, setOrder] = useState<OrderDTO>(initialOrder);
  const [simulating, setSimulating] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const countdown = useCountdown(order.expiredAt);

  // Poll real-time payment & supplier status every 4 seconds while pending/processing
  useEffect(() => {
    if (order.status === "SUCCESS" || order.status === "EXPIRED" || order.status === "FAILED") {
      return;
    }
    const timer = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${order.invoiceNumber}`);
        const data = await res.json();
        if (data?.order) {
          setOrder(data.order);
        }
      } catch {
        // ignore network poll error
      }
    }, 4000);
    return () => clearInterval(timer);
  }, [order.invoiceNumber, order.status]);

  const handleSimulateDemoPayment = async () => {
    setSimulating(true);
    setActionMessage(null);
    try {
      const res = await fetch("/api/payments/demo-simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceNumber: order.invoiceNumber }),
      });
      const data = await res.json();
      if (res.ok && data.order) {
        setOrder(data.order);
        setActionMessage(data.message);
      } else {
        setActionMessage(data.error || "Gagal simulasi pembayaran.");
      }
    } catch {
      setActionMessage("Gagal menghubungkan ke server simulasi.");
    } finally {
      setSimulating(false);
    }
  };

  const statusBadgeColor =
    order.status === "SUCCESS"
      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
      : order.status === "PENDING_PAYMENT"
      ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
      : "bg-rose-500/20 text-rose-300 border-rose-500/40";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Mode Banner if DEMO */}
      {order.executionMode === "DEMO" && (
        <div className="rounded-2xl border border-cyan-500/40 bg-cyan-950/40 p-4 text-xs text-cyan-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <strong className="text-cyan-300">🧪 MODE DEMO TERISOLASI AKTIF:</strong>{" "}
            Transaksi ini berjalan di lingkungan simulasi tanpa memerlukan API key
            eksternal. Anda dapat menguji alur pembayaran QRIS & pengiriman otomatis
            Digiflazz dengan tombol di samping.
          </div>
          {order.paymentStatus === "PENDING" && (
            <button
              type="button"
              onClick={handleSimulateDemoPayment}
              disabled={simulating}
              className="shrink-0 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2.5 text-xs font-black text-slate-950 shadow-neon hover:opacity-95"
            >
              {simulating
                ? "Memverifikasi & Mengirim..."
                : "⚡ Simulasikan Bayar QRIS (DEMO)"}
            </button>
          )}
        </div>
      )}

      {actionMessage && (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/60 p-4 text-xs font-bold text-emerald-200">
          ✓ {actionMessage}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
        {/* Left: Invoice Details (3 cols) */}
        <div className="md:col-span-3 rounded-2xl border border-purple-500/30 bg-[#0A0F24]/90 p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs text-slate-400">Nomor Invoice Resmi</span>
              <h1 className="text-xl font-black text-white">
                {order.invoiceNumber}
              </h1>
            </div>
            <span
              className={`rounded-full border px-3 py-1 text-xs font-bold ${statusBadgeColor}`}
            >
              {order.status}
            </span>
          </div>

          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Waktu Pemesanan</span>
              <span className="font-medium text-white">
                {formatJakartaDateTime(order.createdAt)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Produk Game</span>
              <span className="font-bold text-white">{order.productName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Item Nominal</span>
              <span className="font-bold text-cyan-300">
                {order.variantName} ({order.sku})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">User ID / Tujuan</span>
              <span className="font-semibold text-white">
                {order.gameUserId}{" "}
                {order.gameZoneId ? `(${order.gameZoneId})` : ""}
              </span>
            </div>
            {order.gamePlayerNickname && (
              <div className="flex justify-between">
                <span className="text-slate-400">Nickname Akun</span>
                <span className="font-semibold text-emerald-400">
                  {order.gamePlayerNickname}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-400">Metode Pembayaran</span>
              <span className="font-semibold text-white">
                {order.paymentMethod}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Status Pembayaran</span>
              <span className="font-bold text-cyan-300">
                {order.paymentStatus}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Status Supplier (Digiflazz)</span>
              <span className="font-bold text-purple-300">
                {order.supplierStatus}
              </span>
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Harga Produk</span>
              <span>{formatRupiah(order.subtotalAmount)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Potongan Voucher ({order.voucherCode})</span>
                <span>- {formatRupiah(order.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-400">
              <span>Kode Unik Verifikasi QRIS</span>
              <span>+ {formatRupiah(order.uniqueCode)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-800 pt-2 text-base font-black text-cyan-300">
              <span>Total Pembayaran</span>
              <span>{formatRupiah(order.totalAmount)}</span>
            </div>
          </div>

          {/* Serial Number (SN) Box */}
          <div className="rounded-xl border border-dashed border-purple-500/50 bg-purple-950/20 p-4">
            <span className="block text-xs font-semibold text-purple-300">
              Serial Number (SN) / Kode Bukti Pengiriman Supplier:
            </span>
            <p className="mt-1 font-mono text-sm font-bold text-white break-all">
              {order.serialNumber || "Menunggu penyelesaian pembayaran..."}
            </p>
            {order.supplierMessage && (
              <p className="mt-1 text-xs text-slate-400">
                Catatan: {order.supplierMessage}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <a
              href={`/api/orders/${order.invoiceNumber}/invoice-pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-purple-500/40 bg-purple-600/20 px-4 py-2.5 text-xs font-bold text-white hover:bg-purple-600/35"
            >
              🖨️ Cetak / Download Invoice PDF
            </a>
            <Link
              href={`/games/${order.productSlug}`}
              className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:border-cyan-400"
            >
              Beli Lagi
            </Link>
          </div>
        </div>

        {/* Right: Dynamic QRIS Box (2 cols) */}
        <div className="md:col-span-2 rounded-2xl border border-purple-500/30 bg-[#0A0F24]/90 p-6 flex flex-col items-center justify-between text-center space-y-4">
          <div className="w-full">
            <span className="inline-block rounded-full bg-cyan-500/15 border border-cyan-500/40 px-3 py-1 text-[11px] font-bold text-cyan-300">
              QRIS DINAMIS RESMI MIDTRANS
            </span>
            <h2 className="mt-2 text-lg font-black text-white">
              {formatRupiah(order.totalAmount)}
            </h2>
            {order.paymentStatus === "PENDING" && (
              <p className="mt-1 text-xs text-amber-300 font-semibold">
                ⏳ Batas Waktu Bayar: {countdown.mmss}
              </p>
            )}
          </div>

          {/* Visual Dynamic QR Matrix */}
          <div className="relative flex h-56 w-56 flex-col items-center justify-center rounded-2xl bg-white p-4 shadow-neon">
            <div className="mb-1 flex w-full items-center justify-between text-[10px] font-black text-slate-900">
              <span>QRIS</span>
              <span className="text-purple-700">TOPUPKU</span>
            </div>
            <svg
              viewBox="0 0 120 120"
              className="h-40 w-40 text-slate-950"
              fill="currentColor"
            >
              <rect x="8" y="8" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="6" />
              <rect x="16" y="16" width="16" height="16" />
              <rect x="80" y="8" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="6" />
              <rect x="88" y="16" width="16" height="16" />
              <rect x="8" y="80" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="6" />
              <rect x="16" y="88" width="16" height="16" />
              <rect x="48" y="12" width="8" height="8" />
              <rect x="60" y="20" width="8" height="16" />
              <rect x="48" y="44" width="24" height="8" />
              <rect x="14" y="48" width="16" height="8" />
              <rect x="44" y="56" width="12" height="16" />
              <rect x="64" y="60" width="16" height="8" />
              <rect x="88" y="48" width="16" height="12" />
              <rect x="52" y="84" width="16" height="16" />
              <rect x="76" y="76" width="12" height="24" />
              <rect x="96" y="88" width="14" height="18" />
            </svg>
            <span className="mt-1 text-[9px] font-mono text-slate-600 truncate w-full">
              {order.invoiceNumber}
            </span>

            {order.status === "SUCCESS" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-emerald-950/95 text-white p-4">
                <span className="text-4xl">✅</span>
                <p className="mt-2 text-sm font-black text-emerald-300">
                  PEMBAYARAN LUNAS
                </p>
                <p className="text-[11px] text-slate-300">
                  Produk telah dikirim ke akun tujuan!
                </p>
              </div>
            )}
          </div>

          <div className="w-full space-y-2 text-left text-xs text-slate-400">
            <p className="font-semibold text-white text-center">
              Cara Bayar QRIS Dinamis:
            </p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Buka aplikasi e-wallet atau mobile banking Anda.</li>
              <li>Scan kode QRIS di atas (nominal otomatis terisi).</li>
              <li>Konfirmasi pembayaran & pesanan langsung dikirim otomatis.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
