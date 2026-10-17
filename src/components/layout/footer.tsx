import React from "react";
import Link from "next/link";

export function Footer() {
  const popularGames = [
    { href: "/mobile-legends", label: "Mobile Legends: Bang Bang" },
    { href: "/free-fire", label: "Free Fire" },
    { href: "/pubg-mobile", label: "PUBG Mobile" },
    { href: "/honor-of-kings", label: "Honor of Kings" },
    { href: "/genshin-impact", label: "Genshin Impact" },
    { href: "/valorant", label: "Valorant" },
    { href: "/roblox", label: "Roblox" },
  ];

  const digitalProducts = [
    { href: "/pulsa", label: "Pulsa All Operator" },
    { href: "/paket-data", label: "Paket Data Internet" },
    { href: "/token-pln", label: "Token Listrik PLN" },
    { href: "/voucher-digital", label: "Voucher Digital" },
    { href: "/promo", label: "Promo & Kode Voucher" },
    { href: "/flash-sale", label: "Flash Sale 24 Jam" },
  ];

  const memberLinks = [
    { href: "/cek-transaksi", label: "Cek Status Transaksi" },
    { href: "/member/profile", label: "Profil Member" },
    { href: "/member/wallet", label: "Saldo Akun & Mutasi" },
    { href: "/member/deposit", label: "Deposit Saldo QRIS" },
    { href: "/member/vouchers", label: "Voucher Saya" },
    { href: "/member/referral", label: "Program Referral" },
  ];

  const supportLinks = [
    { href: "/bantuan", label: "Pusat Bantuan CS 24/7" },
    { href: "/faq", label: "Tanya Jawab (FAQ)" },
    { href: "/syarat-ketentuan", label: "Syarat & Ketentuan" },
    { href: "/kebijakan-privasi", label: "Kebijakan Privasi" },
  ];

  return (
    <footer className="mt-20 border-t border-purple-500/20 bg-[#050814] text-slate-400">
      <div className="container mx-auto px-4 py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-400 text-white font-black">
                TK
              </div>
              <span className="text-2xl font-black text-white tracking-tight">
                TOPUPKU
              </span>
            </div>
            <p className="text-sm leading-relaxed text-slate-400 max-w-md">
              Platform Top Up Game & Produk Digital Otomatis #1 di Indonesia.
              Terintegrasi langsung dengan QRIS Dinamis Resmi Midtrans dan
              Server Supplier Digiflazz berkecepatan 1–3 detik nonstop 24 jam.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="rounded-lg border border-purple-500/30 bg-purple-950/40 px-3 py-1 text-xs font-semibold text-purple-300">
                ✓ QRIS Dinamis Otomatis
              </span>
              <span className="rounded-lg border border-cyan-500/30 bg-cyan-950/40 px-3 py-1 text-xs font-semibold text-cyan-300">
                ✓ Pengiriman Instan 24 Jam
              </span>
              <span className="rounded-lg border border-emerald-500/30 bg-emerald-950/40 px-3 py-1 text-xs font-semibold text-emerald-300">
                ✓ Garansi 100% Resmi
              </span>
            </div>
          </div>

          {/* Popular Games */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">
              Top Up Game
            </h3>
            <ul className="space-y-2.5 text-sm">
              {popularGames.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="hover:text-cyan-400 transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Digital Products & Member */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">
              Produk & Member
            </h3>
            <ul className="space-y-2.5 text-sm">
              {digitalProducts.concat(memberLinks.slice(0, 3)).map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="hover:text-cyan-400 transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Support */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">
              Informasi & Legal
            </h3>
            <ul className="space-y-2.5 text-sm">
              {supportLinks.concat(memberLinks.slice(3)).map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="hover:text-cyan-400 transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-800/80 pt-8 text-xs text-slate-500 sm:flex-row">
          <p>
            © {new Date().getFullYear()} PT Topupku Digital Nusantara. Seluruh
            hak cipta dilindungi undang-undang.
          </p>
          <p>Timezone Server: Asia/Jakarta (WIB) • Mata Uang: Rupiah (IDR)</p>
        </div>
      </div>
    </footer>
  );
}
