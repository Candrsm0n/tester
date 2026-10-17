import React from "react";
import { runtimeStore } from "@/lib/db/runtime-store";
import { OrderRepository } from "@/repositories";
import { formatJakartaDateTime, formatRupiah } from "@/lib/utils";

export default function AdminPaymentsPage() {
  const orders = OrderRepository.getAllOrders();
  const webhooks = runtimeStore.webhookLogs;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-purple-500/30 bg-[#0A0F24]/95 p-6 space-y-4">
        <h2 className="text-xl font-black text-white">
          💳 Monitoring Pembayaran QRIS Dinamis & Rekonsiliasi Midtrans
        </h2>
        <p className="text-xs text-slate-400">
          Seluruh pembayaran diverifikasi menggunakan SHA-512 Signature Webhook
          dan pengecekan ulang API status Midtrans.
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <span className="text-xs text-slate-400">Metode Utama</span>
            <p className="mt-1 text-base font-black text-cyan-300">
              QRIS Dynamic (Core API v2)
            </p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <span className="text-xs text-slate-400">Proteksi Webhook</span>
            <p className="mt-1 text-base font-black text-emerald-400">
              SHA-512 + Idempotency Lock
            </p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <span className="text-xs text-slate-400">Total Log Webhook</span>
            <p className="mt-1 text-base font-black text-purple-300">
              {webhooks.length} Event Tercatat
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-purple-500/30 bg-[#0A0F24]/95 p-6 space-y-4">
        <h3 className="text-base font-bold text-white">
          Riwayat Rekonsiliasi Pembayaran QRIS
        </h3>
        <div className="space-y-2.5">
          {orders.map((o) => (
            <div
              key={o.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-xs"
            >
              <div>
                <span className="font-mono font-bold text-cyan-300">
                  {o.invoiceNumber}
                </span>
                <p className="text-slate-300">
                  {o.productName} — {o.variantName}
                </p>
              </div>
              <div className="text-right">
                <strong className="text-white block">
                  {formatRupiah(o.totalAmount)}
                </strong>
                <span className="text-[11px] text-emerald-400">
                  {o.paymentStatus} •{" "}
                  {o.paidAt
                    ? formatJakartaDateTime(o.paidAt)
                    : "Menunggu Pembayaran"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
