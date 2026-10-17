import React from "react";
import Link from "next/link";
import { getAppMode } from "@/config/env";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const mode = getAppMode();
  const adminLinks = [
    { href: "/admin", label: "📊 Overview & Statistik" },
    { href: "/admin/products", label: "🎮 Manajemen Produk & SKU" },
    { href: "/admin/transactions", label: "🧾 Manajemen Transaksi & Export" },
    { href: "/admin/users", label: "👥 Manajemen Pengguna & Role" },
    { href: "/admin/payments", label: "💳 Pembayaran QRIS & Webhook" },
    { href: "/admin/website", label: "🌐 Pengaturan Website & Promo" },
    { href: "/admin/integrations", label: "🔌 Integrasi API (Midtrans/Digiflazz)" },
    { href: "/admin/security", label: "🛡️ Keamanan & Audit Logs" },
  ];

  return (
    <div className="space-y-6">
      {/* Top Admin Status Header */}
      <div className="rounded-2xl border border-purple-500/40 bg-gradient-to-r from-[#0A0F24] via-indigo-950/80 to-[#0A0F24] p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="rounded-xl bg-purple-600 px-3 py-1.5 text-xs font-black text-white">
            ADMIN CONTROL CENTER
          </span>
          <div>
            <h1 className="text-sm font-bold text-white">
              TOPUPKU Enterprise Backoffice
            </h1>
            <p className="text-[11px] text-slate-400">
              Mode Eksekusi Server:{" "}
              <strong className="text-cyan-300">{mode}</strong> • PostgreSQL +
              Prisma ORM
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <a
            href="/api/admin/orders/export?format=csv"
            className="rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-3 py-2 text-xs font-bold text-emerald-300 hover:bg-emerald-500/25"
          >
            📥 Export CSV
          </a>
          <a
            href="/api/admin/orders/export?format=excel"
            className="rounded-xl border border-cyan-500/40 bg-cyan-500/15 px-3 py-2 text-xs font-bold text-cyan-300 hover:bg-cyan-500/25"
          >
            📊 Export Excel
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <aside className="lg:col-span-3">
          <nav className="rounded-2xl border border-purple-500/30 bg-[#0A0F24]/95 p-3 space-y-1 sticky top-24">
            {adminLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-300 hover:bg-purple-600/25 hover:text-cyan-300 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <div className="lg:col-span-9 space-y-6">{children}</div>
      </div>
    </div>
  );
}
