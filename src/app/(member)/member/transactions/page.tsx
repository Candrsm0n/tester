import React from "react";
import Link from "next/link";
import { OrderRepository } from "@/repositories";
import { formatJakartaDateTime, formatRupiah } from "@/lib/utils";

export default function MemberTransactionsPage() {
  const orders = OrderRepository.getAllOrders();

  return (
    <div className="rounded-2xl border border-purple-500/30 bg-[#0A0F24]/95 p-6 space-y-5">
      <div>
        <h1 className="text-xl font-black text-white">
          🧾 Riwayat Transaksi Top Up
        </h1>
        <p className="text-xs text-slate-400">
          Daftar seluruh pesanan top up game dan produk digital Anda beserta
          bukti Serial Number (SN)
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-800 text-slate-400">
            <tr>
              <th className="py-3 pr-4">No. Invoice</th>
              <th className="py-3 pr-4">Produk & Nominal</th>
              <th className="py-3 pr-4">Tujuan</th>
              <th className="py-3 pr-4">Total</th>
              <th className="py-3 pr-4">Status</th>
              <th className="py-3 pr-4">Waktu</th>
              <th className="py-3">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/70">
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-slate-900/50">
                <td className="py-3.5 pr-4 font-mono font-bold text-cyan-300">
                  {o.invoiceNumber}
                </td>
                <td className="py-3.5 pr-4">
                  <strong className="block text-white">{o.productName}</strong>
                  <span className="text-slate-400">{o.variantName}</span>
                </td>
                <td className="py-3.5 pr-4 text-slate-200">{o.gameUserId}</td>
                <td className="py-3.5 pr-4 font-bold text-white">
                  {formatRupiah(o.totalAmount)}
                </td>
                <td className="py-3.5 pr-4">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      o.status === "SUCCESS"
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-amber-500/20 text-amber-300"
                    }`}
                  >
                    {o.status}
                  </span>
                </td>
                <td className="py-3.5 pr-4 text-slate-400">
                  {formatJakartaDateTime(o.createdAt)}
                </td>
                <td className="py-3.5">
                  <Link
                    href={`/invoice/${o.invoiceNumber}`}
                    className="rounded-lg bg-purple-600/25 border border-purple-500/40 px-2.5 py-1 text-[11px] font-bold text-purple-200 hover:bg-purple-600/40"
                  >
                    Invoice
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
