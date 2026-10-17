import React from "react";
import Link from "next/link";
import { OrderRepository } from "@/repositories";
import { RevenueChart } from "@/components/charts/revenue-chart";
import { formatRupiah } from "@/lib/utils";

export const metadata = {
  title: "Admin Dashboard — Statistik Pendapatan & Transaksi",
};

export default function AdminOverviewPage() {
  const stats = OrderRepository.getAdminDashboardStats();

  const kpiCards = [
    {
      label: "Total Pendapatan Kotor",
      value: formatRupiah(stats.totalRevenue),
      sub: "+18.4% dibanding minggu lalu",
      color: "text-cyan-300",
    },
    {
      label: "Total Keuntungan Bersih (Margin)",
      value: formatRupiah(stats.totalProfit),
      sub: "Margin rata-rata 8.5%",
      color: "text-emerald-400",
    },
    {
      label: "Total Transaksi",
      value: stats.totalTransactions.toLocaleString("id-ID"),
      sub: `${stats.successTransactions} Sukses • ${stats.pendingTransactions} Pending • ${stats.failedTransactions} Gagal`,
      color: "text-white",
    },
    {
      label: "Total Pengguna Terdaftar",
      value: stats.totalUsers.toLocaleString("id-ID"),
      sub: `+${stats.newUsersToday} member baru hari ini`,
      color: "text-purple-300",
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {kpiCards.map((c) => (
          <div
            key={c.label}
            className="rounded-2xl border border-purple-500/25 bg-[#0A0F24]/95 p-5"
          >
            <span className="text-xs text-slate-400">{c.label}</span>
            <p className={`mt-1 text-2xl font-black ${c.color}`}>{c.value}</p>
            <span className="mt-1 block text-[11px] text-slate-400">
              {c.sub}
            </span>
          </div>
        ))}
      </div>

      {/* Revenue & Profit Chart */}
      <RevenueChart data={stats.chartSeries} />

      {/* Best Selling Products Table */}
      <div className="rounded-2xl border border-purple-500/25 bg-[#0A0F24]/95 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white">
            🏆 5 Produk Game Terlaris
          </h3>
          <Link
            href="/admin/products"
            className="text-xs font-bold text-cyan-400 hover:underline"
          >
            Kelola Semua Produk →
          </Link>
        </div>

        <div className="space-y-2.5">
          {stats.bestSellers.map((p, idx) => (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-xs"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-600/30 font-bold text-purple-300">
                  #{idx + 1}
                </span>
                <span className="font-bold text-white">{p.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-amber-400 font-semibold">
                  ★ {p.rating.toFixed(2)}
                </span>
                <span className="font-bold text-cyan-300">
                  {p.totalSold.toLocaleString("id-ID")} Terjual
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
