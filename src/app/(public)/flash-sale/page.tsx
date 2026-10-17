import React from "react";
import Link from "next/link";
import { CatalogRepository } from "@/repositories";
import { formatRupiah } from "@/lib/utils";

export const metadata = {
  title: "Flash Sale Top Up Game Murah 24 Jam",
};

export default function FlashSalePage() {
  const flashSales = CatalogRepository.getFlashSaleVariants();

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-rose-500/35 bg-gradient-to-r from-rose-950/50 via-[#0A0F24] to-purple-950/50 p-8">
        <span className="rounded-lg bg-rose-600 px-3 py-1 text-xs font-black text-white">
          ⚡ LIVE FLASH SALE
        </span>
        <h1 className="mt-3 text-3xl font-black text-white">
          Flash Sale Top Up Game Hari Ini
        </h1>
        <p className="mt-1 text-sm text-slate-300">
          Dapatkan harga miring untuk item pilihan selama kuota Flash Sale masih
          tersedia. Harga otomatis terpotong di halaman checkout!
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {flashSales.map(({ product, variant }) => {
          const remaining =
            (variant.flashSaleStock || 50) - variant.flashSaleSold;
          return (
            <div
              key={variant.id}
              className="flex flex-col justify-between rounded-2xl border border-rose-500/30 bg-[#0A0F24]/95 p-6"
            >
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-purple-300">
                    {product.name}
                  </span>
                  <span className="rounded bg-rose-500/20 px-2.5 py-0.5 font-bold text-rose-300">
                    Tersisa {remaining} item
                  </span>
                </div>
                <h2 className="mt-2 text-lg font-black text-white">
                  {variant.name}
                </h2>
                <p className="text-xs text-slate-400">{variant.denomination}</p>
              </div>

              <div className="mt-6 border-t border-slate-800 pt-4 flex items-center justify-between">
                <div>
                  <span className="block text-xs text-slate-500 line-through">
                    {formatRupiah(variant.sellingPrice)}
                  </span>
                  <span className="text-xl font-black text-cyan-300">
                    {formatRupiah(variant.flashSalePrice || variant.sellingPrice)}
                  </span>
                </div>
                <Link
                  href={`/games/${product.slug}`}
                  className="rounded-xl bg-gradient-to-r from-rose-600 to-purple-600 px-4 py-2.5 text-xs font-bold text-white shadow-neon"
                >
                  Serbu Sekarang
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
