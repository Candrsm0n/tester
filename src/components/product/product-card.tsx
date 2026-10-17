import React from "react";
import Link from "next/link";
import { formatRupiah } from "@/lib/utils";
import type { ProductDTO } from "@/types";

export function ProductCard({ product }: { product: ProductDTO }) {
  const lowestVariant = [...product.variants].sort(
    (a, b) =>
      (a.flashSalePrice || a.sellingPrice) -
      (b.flashSalePrice || b.sellingPrice)
  )[0];

  const hasFlashSale = product.variants.some((v) => v.isFlashSale);

  return (
    <Link
      href={`/games/${product.slug}`}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-purple-500/25 bg-[#0A0F24]/90 p-4 glass-card-hover"
    >
      {/* Top Badges */}
      <div className="flex items-center justify-between gap-1 mb-3">
        <span className="rounded-md bg-purple-500/20 border border-purple-500/40 px-2 py-0.5 text-[10px] font-bold text-purple-300">
          {product.publisher}
        </span>
        {hasFlashSale ? (
          <span className="rounded-md bg-rose-500/20 border border-rose-500/40 px-2 py-0.5 text-[10px] font-bold text-rose-300">
            ⚡ FLASH SALE
          </span>
        ) : product.isPopular ? (
          <span className="rounded-md bg-cyan-500/20 border border-cyan-500/40 px-2 py-0.5 text-[10px] font-bold text-cyan-300">
            🔥 POPULER
          </span>
        ) : product.isNew ? (
          <span className="rounded-md bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
            ✨ BARU
          </span>
        ) : null}
      </div>

      {/* Product Icon & Title */}
      <div className="my-2 flex items-center gap-3.5">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600/30 via-indigo-600/30 to-cyan-500/30 border border-purple-400/30 text-xl font-black text-cyan-300 group-hover:scale-105 transition-transform">
          {product.name.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
            {product.name}
          </h3>
          <p className="text-xs text-slate-400 line-clamp-1">
            {product.subtitle || "Proses Otomatis 1-3 Detik"}
          </p>
        </div>
      </div>

      {/* Footer Price & Rating */}
      <div className="mt-4 flex items-center justify-between border-t border-slate-800/80 pt-3 text-xs">
        <div>
          <span className="block text-[10px] text-slate-400">Mulai dari</span>
          <span className="font-bold text-cyan-300">
            {lowestVariant
              ? formatRupiah(
                  lowestVariant.flashSalePrice || lowestVariant.sellingPrice
                )
              : "Rp 10.000"}
          </span>
        </div>
        <div className="text-right">
          <span className="font-semibold text-amber-400">
            ★ {product.rating.toFixed(2)}
          </span>
          <span className="block text-[10px] text-slate-500">
            {(product.totalSold / 1000).toFixed(1)}rb+ terjual
          </span>
        </div>
      </div>
    </Link>
  );
}
