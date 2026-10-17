import React from "react";
import Link from "next/link";
import { CatalogRepository } from "@/repositories";
import { ProductCard } from "@/components/product/product-card";

export default function AllGamesPage({
  searchParams,
}: {
  searchParams?: { category?: string; q?: string; sort?: string };
}) {
  const categories = CatalogRepository.getAllCategories();
  const activeCategory = searchParams?.category || "all";
  const searchQuery = searchParams?.q || "";
  const sort = (searchParams?.sort as any) || "popular";

  const products = CatalogRepository.getAllProducts({
    category: activeCategory,
    search: searchQuery,
    sort,
  });

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-purple-500/30 bg-[#0A0F24]/90 p-6 sm:p-8">
        <h1 className="text-2xl font-black text-white sm:text-3xl">
          Katalog Semua Game & Produk Digital
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Pilih game favorit atau produk digital Anda. Seluruh harga dan stok
          tersinkronisasi langsung dengan database PostgreSQL & Digiflazz.
        </p>

        {/* Category Filter Pills */}
        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            href="/games"
            className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-colors ${
              activeCategory === "all"
                ? "bg-purple-600 text-white shadow-neon"
                : "border border-slate-800 bg-slate-900 text-slate-300 hover:border-cyan-400"
            }`}
          >
            Semua ({CatalogRepository.getAllProducts().length})
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/games?category=${cat.slug}`}
              className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-colors ${
                activeCategory === cat.slug
                  ? "bg-purple-600 text-white shadow-neon"
                  : "border border-slate-800 bg-slate-900 text-slate-300 hover:border-cyan-400"
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>

      {products.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-[#0A0F24] p-12 text-center">
          <p className="text-base font-bold text-white">
            Produk tidak ditemukan untuk pencarian &ldquo;{searchQuery}&rdquo;
          </p>
          <Link
            href="/games"
            className="mt-4 inline-block rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white"
          >
            Reset Filter
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
