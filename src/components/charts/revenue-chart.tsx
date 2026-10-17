"use client";

import React from "react";
import { formatRupiah } from "@/lib/utils";

export interface ChartPoint {
  date: string;
  revenue: number;
  profit: number;
  transactions: number;
}

export function RevenueChart({ data }: { data: ChartPoint[] }) {
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);

  return (
    <div className="rounded-2xl border border-purple-500/25 bg-[#0A0F24]/90 p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-white">
            Grafik Pendapatan & Keuntungan Bersih (7 Hari Terakhir)
          </h3>
          <p className="text-xs text-slate-400">
            Data agregasi real-time transaksi QRIS & pengiriman Digiflazz
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5 text-cyan-300">
            <span className="h-2.5 w-2.5 rounded-full bg-cyan-400" /> Pendapatan
          </span>
          <span className="flex items-center gap-1.5 text-purple-300">
            <span className="h-2.5 w-2.5 rounded-full bg-purple-500" /> Profit Margin
          </span>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-3 items-end h-52 pt-6 border-b border-slate-800 pb-3">
        {data.map((pt) => {
          const revHeightPercent = Math.max(
            12,
            Math.round((pt.revenue / maxRevenue) * 100)
          );
          const profHeightPercent = Math.max(
            8,
            Math.round((pt.profit / maxRevenue) * 100 * 4)
          );
          return (
            <div
              key={pt.date}
              className="group flex flex-col items-center justify-end h-full gap-2"
            >
              <div className="hidden group-hover:block rounded bg-slate-900 border border-slate-700 px-2 py-1 text-[10px] text-cyan-300 whitespace-nowrap">
                {formatRupiah(pt.revenue)} ({pt.transactions} trx)
              </div>
              <div className="flex w-full items-end justify-center gap-1.5 h-36">
                <div
                  style={{ height: `${revHeightPercent}%` }}
                  className="w-3 sm:w-5 rounded-t-md bg-gradient-to-t from-blue-600 to-cyan-400 transition-all duration-300"
                  title={`Pendapatan: ${formatRupiah(pt.revenue)}`}
                />
                <div
                  style={{ height: `${Math.min(100, profHeightPercent)}%` }}
                  className="w-3 sm:w-5 rounded-t-md bg-gradient-to-t from-purple-700 to-purple-400 transition-all duration-300"
                  title={`Profit: ${formatRupiah(pt.profit)}`}
                />
              </div>
              <span className="text-[11px] font-medium text-slate-400">
                {pt.date}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
