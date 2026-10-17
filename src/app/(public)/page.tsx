import React from "react";
import Link from "next/link";
import { CatalogRepository } from "@/repositories";
import { runtimeStore } from "@/lib/db/runtime-store";
import { ProductCard } from "@/components/product/product-card";
import { formatRupiah } from "@/lib/utils";

export default function HomePage() {
  const categories = CatalogRepository.getAllCategories();
  const allProducts = CatalogRepository.getAllProducts({ sort: "popular" });
  const popularProducts = allProducts.filter((p) => p.isPopular);
  const newestProducts = allProducts.filter((p) => p.isNew);
  const flashSales = CatalogRepository.getFlashSaleVariants();
  const banners = runtimeStore.banners;
  const activeVouchers = runtimeStore.vouchers.filter((v) => v.isActive);

  return (
    <div className="space-y-14">
      {/* 1. HERO BANNER SLIDER SECTION */}
      <section className="relative overflow-hidden rounded-3xl border border-purple-500/30 bg-gradient-to-br from-[#0A0F24] via-[#1B1035] to-[#071A2E] p-6 sm:p-10 shadow-neon">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
          <div className="space-y-5 lg:col-span-7">
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-500/15 px-3.5 py-1 text-xs font-bold text-cyan-300">
              🚀 PLATFORM TOP UP GAME OTOMATIS #1 INDONESIA
            </span>
            <h1 className="text-3xl font-black leading-tight tracking-tight text-white sm:text-5xl">
              Top Up Game & Produk Digital{" "}
              <span className="bg-gradient-to-r from-purple-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
                Detik-an Masuk!
              </span>
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
              Nikmati pengalaman top up Diamond Mobile Legends, Free Fire, PUBG
              Mobile, Honor of Kings, Genshin Impact, Valorant, hingga Token PLN
              dengan pembayaran <strong>QRIS Dinamis Midtrans</strong> dan
              pengiriman otomatis 24 jam nonstop.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/games"
                className="rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 px-6 py-3.5 text-sm font-black text-white shadow-neon hover:opacity-95"
              >
                🎮 Mulai Top Up Sekarang
              </Link>
              <Link
                href="/cek-transaksi"
                className="rounded-xl border border-purple-400/40 bg-slate-900/80 px-6 py-3.5 text-sm font-bold text-slate-100 hover:border-cyan-400"
              >
                🔎 Lacak Pesanan
              </Link>
            </div>
          </div>

          {/* Highlighted Banner Cards */}
          <div className="space-y-3 lg:col-span-5">
            {banners.map((b) => (
              <Link
                key={b.id}
                href={b.ctaUrl}
                className="block rounded-2xl border border-purple-500/30 bg-slate-950/65 p-4 hover:border-cyan-400 transition-all"
              >
                <span className="rounded bg-purple-600/30 border border-purple-400/40 px-2 py-0.5 text-[10px] font-bold text-purple-200">
                  {b.badgeText}
                </span>
                <h2 className="mt-1.5 text-sm font-bold text-white">
                  {b.title}
                </h2>
                <p className="mt-0.5 text-xs text-slate-400 line-clamp-2">
                  {b.subtitle}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 2. STATISTIK TRANSAKSI REAL-TIME */}
      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          {
            label: "Total Transaksi Sukses",
            value: "694.820+",
            sub: "99.94% Rasio Keberhasilan",
          },
          {
            label: "Rata-Rata Kecepatan Kirim",
            value: "1.8 Detik",
            sub: "Otomatis via Digiflazz API",
          },
          {
            label: "Metode Pembayaran",
            value: "QRIS Dinamis",
            sub: "Verifikasi Real-Time Midtrans",
          },
          {
            label: "Layanan Pelanggan",
            value: "24/7 Nonstop",
            sub: "Live WhatsApp & Tiket Bantuan",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-purple-500/20 bg-[#0A0F24]/90 p-5 text-center"
          >
            <p className="text-2xl font-black text-cyan-300 sm:text-3xl">
              {stat.value}
            </p>
            <p className="mt-1 text-xs font-bold text-white">{stat.label}</p>
            <p className="mt-0.5 text-[11px] text-slate-400">{stat.sub}</p>
          </div>
        ))}
      </section>

      {/* 3. FLASH SALE COUNTDOWN SECTION */}
      <section className="rounded-3xl border border-rose-500/30 bg-gradient-to-r from-rose-950/35 via-[#0A0F24] to-purple-950/35 p-6 sm:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-rose-600 px-2.5 py-1 text-xs font-black text-white">
                ⚡ FLASH SALE
              </span>
              <span className="text-xs font-semibold text-rose-300">
                Harga Spesial Kuota Terbatas!
              </span>
            </div>
            <h2 className="mt-2 text-2xl font-black text-white">
              Kejar Diskon Kilat Hari Ini
            </h2>
          </div>
          <Link
            href="/flash-sale"
            className="rounded-xl border border-rose-500/40 bg-rose-500/15 px-4 py-2 text-xs font-bold text-rose-200 hover:bg-rose-500/25"
          >
            Lihat Semua Flash Sale →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {flashSales.map(({ product, variant }) => (
            <Link
              key={variant.id}
              href={`/games/${product.slug}`}
              className="flex flex-col justify-between rounded-2xl border border-rose-500/30 bg-slate-950/75 p-4 hover:border-cyan-400 transition-all"
            >
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-purple-300">
                    {product.name}
                  </span>
                  <span className="rounded bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-300">
                    Sisa {(variant.flashSaleStock || 50) - variant.flashSaleSold}
                  </span>
                </div>
                <h3 className="mt-1 text-base font-black text-white">
                  {variant.name}
                </h3>
                <p className="text-xs text-slate-400">{variant.denomination}</p>
              </div>
              <div className="mt-4 flex items-end justify-between border-t border-slate-800 pt-3">
                <div>
                  <span className="block text-xs text-slate-500 line-through">
                    {formatRupiah(variant.sellingPrice)}
                  </span>
                  <span className="text-lg font-black text-cyan-300">
                    {formatRupiah(variant.flashSalePrice || variant.sellingPrice)}
                  </span>
                </div>
                <span className="rounded-lg bg-gradient-to-r from-purple-600 to-cyan-500 px-3 py-1.5 text-xs font-bold text-white">
                  Beli Kilat
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. KATEGORI GAME & PRODUK DIGITAL */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-white">
              Kategori Game & Produk Digital
            </h2>
            <p className="text-xs text-slate-400">
              Pilih kategori layanan top up sesuai kebutuhan Anda
            </p>
          </div>
          <Link
            href="/games"
            className="text-xs font-bold text-cyan-400 hover:underline"
          >
            Semua Kategori →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/games?category=${cat.slug}`}
              className="rounded-2xl border border-purple-500/25 bg-[#0A0F24]/90 p-4 text-center glass-card-hover"
            >
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600/20 text-sm font-black text-cyan-300">
                {cat.name.slice(0, 2).toUpperCase()}
              </div>
              <h3 className="text-xs font-bold text-white">{cat.name}</h3>
              <p className="mt-0.5 text-[10px] text-slate-400">
                {cat.productCount} Produk Aktif
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. PRODUK POPULER */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-white">
              🔥 Game & Produk Terpopuler
            </h2>
            <p className="text-xs text-slate-400">
              Paling banyak dibeli oleh gamers Indonesia hari ini
            </p>
          </div>
          <Link
            href="/games"
            className="text-xs font-bold text-cyan-400 hover:underline"
          >
            Lihat Semua ({allProducts.length}) →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {popularProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 6. SEMUA KATALOG & PRODUK TERBARU */}
      <section className="space-y-5">
        <div>
          <h2 className="text-2xl font-black text-white">
            ✨ Katalog Lengkap & Produk Terbaru ({ newestProducts.length } Baru)
          </h2>
          <p className="text-xs text-slate-400">
            Seluruh layanan top up game, pulsa, paket data, token PLN, dan voucher resmi
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {allProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 7. PROMO BERJALAN & KODE VOUCHER */}
      <section className="rounded-3xl border border-purple-500/30 bg-[#0A0F24]/90 p-6 sm:p-8 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-black text-white">
              🎁 Promo Berjalan & Voucher Diskon
            </h2>
            <p className="text-xs text-slate-400">
              Salin kode voucher di bawah ini saat checkout untuk potongan langsung
            </p>
          </div>
          <Link
            href="/promo"
            className="text-xs font-bold text-cyan-400 hover:underline"
          >
            Detail Semua Promo →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {activeVouchers.map((v) => (
            <div
              key={v.id}
              className="rounded-2xl border border-dashed border-cyan-500/40 bg-slate-950/70 p-4 flex flex-col justify-between"
            >
              <div>
                <span className="rounded bg-cyan-500/20 px-2 py-0.5 font-mono text-xs font-black text-cyan-300">
                  KODE: {v.code}
                </span>
                <h3 className="mt-2 text-sm font-bold text-white">{v.title}</h3>
                <p className="mt-1 text-xs text-slate-400">{v.description}</p>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-2.5 text-[11px] text-slate-400">
                <span>Min. Belanja: {formatRupiah(v.minTransaction)}</span>
                <span className="text-emerald-400 font-semibold">
                  Sisa {v.usageLimit - v.usedCount} kuota
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
