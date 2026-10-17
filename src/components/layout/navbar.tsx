"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn, formatRupiah } from "@/lib/utils";
import type { SessionUser } from "@/types";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lightMode, setLightMode] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data?.authenticated && data.user) {
          setUser(data.user);
        }
      })
      .catch(() => {});
  }, [pathname]);

  const toggleTheme = () => {
    const next = !lightMode;
    setLightMode(next);
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("light", next);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/games?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/login");
    router.refresh();
  };

  const navLinks = [
    { href: "/", label: "Beranda" },
    { href: "/games", label: "Semua Game" },
    { href: "/flash-sale", label: "⚡ Flash Sale" },
    { href: "/promo", label: "Promo & Voucher" },
    { href: "/cek-transaksi", label: "Cek Transaksi" },
    { href: "/bantuan", label: "Bantuan" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-purple-500/20 bg-[#050814]/85 backdrop-blur-xl">
      {/* Top Promo Ticker Bar */}
      <div className="bg-gradient-to-r from-purple-900/90 via-indigo-900/90 to-cyan-900/90 px-4 py-1.5 text-center text-xs font-medium text-cyan-100">
        <span>
          🔥 <strong>FLASH SALE 24 JAM:</strong> Gunakan kode promo{" "}
          <code className="rounded bg-black/40 px-1.5 py-0.5 font-bold text-cyan-300">
            TOPUPKU10
          </code>{" "}
          untuk diskon 10% semua game! Pembayaran QRIS Dinamis Otomatis 1-3 Detik.
        </span>
      </div>

      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-400 shadow-neon">
            <span className="text-lg font-black tracking-tighter text-white">
              TK
            </span>
          </div>
          <div>
            <span className="bg-gradient-to-r from-white via-purple-200 to-cyan-300 bg-clip-text text-xl font-black tracking-tight text-transparent">
              TOPUPKU
            </span>
            <span className="block text-[10px] font-semibold uppercase tracking-widest text-cyan-400">
              Official Game Store
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-purple-600/25 text-cyan-300 border border-purple-500/40"
                    : "text-slate-300 hover:bg-slate-800/70 hover:text-white"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Global Search Bar */}
        <form
          onSubmit={handleSearch}
          className="hidden md:flex flex-1 max-w-xs items-center rounded-xl border border-slate-700/80 bg-slate-900/90 px-3 py-1.5 focus-within:border-cyan-400"
        >
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari Mobile Legends, HOK, PLN..."
            className="w-full bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none"
          />
          <button
            type="submit"
            className="ml-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300"
          >
            Cari
          </button>
        </form>

        {/* Actions: Theme Toggle & Auth/Member */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle Dark/Light Mode"
            className="rounded-xl border border-slate-700/80 bg-slate-900/80 px-2.5 py-2 text-xs text-slate-200 hover:border-cyan-400"
          >
            {lightMode ? "🌙 Dark" : "☀️ Light"}
          </button>

          {user ? (
            <div className="flex items-center gap-2">
              {(user.role === "ADMIN" || user.role === "SUPERADMIN") && (
                <Link
                  href="/admin"
                  className="rounded-xl border border-amber-500/50 bg-amber-500/15 px-3 py-2 text-xs font-bold text-amber-300 hover:bg-amber-500/25"
                >
                  🛡️ Admin Panel
                </Link>
              )}
              <Link
                href="/member/wallet"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-3 py-2 text-xs font-bold text-cyan-300"
              >
                💳 {formatRupiah(user.walletBalance)}
              </Link>
              <Link
                href="/member/profile"
                className="rounded-xl border border-purple-500/40 bg-purple-600/20 px-3 py-2 text-xs font-semibold text-white hover:bg-purple-600/30"
              >
                👤 {user.username}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-2.5 py-2 text-xs text-rose-300 hover:bg-rose-500/20"
              >
                Keluar
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:border-cyan-400"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-neon hover:opacity-95"
              >
                Daftar
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden rounded-xl border border-slate-700 bg-slate-900 p-2 text-slate-200"
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-[#0A0F24] px-4 py-4 space-y-3">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari game atau produk digital..."
              className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
            />
            <button
              type="submit"
              className="rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white"
            >
              Cari
            </button>
          </form>
          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2.5 text-xs font-semibold text-slate-200 hover:border-purple-500"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
