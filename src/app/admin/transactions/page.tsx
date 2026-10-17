import React from "react";
import Link from "next/link";
import { OrderRepository } from "@/repositories";
import { formatJakartaDateTime, formatRupiah } from "@/lib/utils";

export default function AdminTransactionsPage() {
  const orders = OrderRepository.getAllOrders();

  return (
    <div className="rounded-2xl border border-purple-500/30 bg-[#0A0F24]/95 p-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white">
            🧾 Manajemen Seluruh Transaksi Pelanggan
          </h2>
          <p className="text-xs text-slate-400">
            Pantau status pembayaran Midtrans, status pengiriman Digiflazz, dan
            cetak laporan
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href="/api/admin/orders/export?format=csv"
            className="rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-3.5 py-2 text-xs font-bold text-emerald-300"
          >
            📥 Download CSV
          </a>
          <a
            href="/api/admin/orders/export?format=excel"
            className="rounded-xl border border-cyan-500/40 bg-cyan-500/15 px-3.5 py-2 text-xs font-bold text-cyan-300"
          >
            📊 Download Excel
          </a>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-800 text-slate-400">
            <tr>
              <th className="py-3 pr-3">Invoice / Mode</th>
              <th className="py-3 pr-3">Produk & SKU</th>
              <th className="py-3 pr-3">User ID Tujuan</th>
              <th className="py-3 pr-3">Total & Profit</th>
              <th className="py-3 pr-3">Status Bayar</th>
              <th className="py-3 pr-3">Supplier</th>
              <th className="py-3">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/70">
            {orders.map((o) => (
              <tr key={o.id}>
                <td className="py-3.5 pr-3">
                  <span className="font-mono font-bold text-cyan-300 block">
                    {o.invoiceNumber}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {o.executionMode} • {formatJakartaDateTime(o.createdAt)}
                  </span>
                </td>
                <td className="py-3.5 pr-3">
                  <strong className="text-white block">{o.productName}</strong>
                  <span className="text-slate-400">
                    {o.variantName} ({o.supplierSku})
                  </span>
                </td>
                <td className="py-3.5 pr-3">
                  <span className="text-white font-semibold block">
                    {o.gameUserId}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    WA: {o.customerWhatsapp}
                  </span>
                </td>
                <td className="py-3.5 pr-3">
                  <strong className="text-white block">
                    {formatRupiah(o.totalAmount)}
                  </strong>
                  <span className="text-emerald-400 text-[11px]">
                    Profit: +{formatRupiah(o.profitAmount)}
                  </span>
                </td>
                <td className="py-3.5 pr-3">
                  <span className="rounded bg-purple-500/20 px-2 py-0.5 text-[10px] font-bold text-purple-200">
                    {o.paymentStatus}
                  </span>
                </td>
                <td className="py-3.5 pr-3">
                  <span className="rounded bg-cyan-500/20 px-2 py-0.5 text-[10px] font-bold text-cyan-200">
                    {o.supplierStatus}
                  </span>
                </td>
                <td className="py-3.5">
                  <div className="flex gap-1.5">
                    <Link
                      href={`/invoice/${o.invoiceNumber}`}
                      className="rounded bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-purple-600"
                    >
                      Detail
                    </Link>
                    <a
                      href={`/api/orders/${o.invoiceNumber}/invoice-pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-cyan-300"
                    >
                      PDF
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
