import React from "react";
import Link from "next/link";

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const menu = [
    { href: "/member/profile", label: "👤 Profil & Keamanan" },
    { href: "/member/transactions", label: "🧾 Riwayat Transaksi" },
    { href: "/member/wallet", label: "💳 Saldo Akun & Poin" },
    { href: "/member/deposit", label: "➕ Deposit Saldo QRIS" },
    { href: "/member/vouchers", label: "🎟️ Voucher Saya" },
    { href: "/member/referral", label: "🤝 Program Referral" },
  ];

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
      <aside className="lg:col-span-1">
        <div className="rounded-2xl border border-purple-500/30 bg-[#0A0F24]/95 p-4 space-y-2 sticky top-24">
          <div className="px-3 py-2 border-b border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
              Member Area
            </span>
            <h2 className="text-sm font-black text-white">Dashboard Akun</h2>
          </div>
          <nav className="space-y-1 pt-2">
            {menu.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-300 hover:bg-purple-600/20 hover:text-cyan-300 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </aside>
      <section className="lg:col-span-3">{children}</section>
    </div>
  );
}
