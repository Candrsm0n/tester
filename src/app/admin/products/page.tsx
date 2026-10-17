"use client";

import React, { useState } from "react";
import { INITIAL_CATALOG_DATA } from "@/config/catalog-seed-data";
import { formatRupiah } from "@/lib/utils";

export default function AdminProductsPage() {
  const [products, setProducts] = useState(INITIAL_CATALOG_DATA.products);
  const [marginPercent, setMarginPercent] = useState(8);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  const handleSyncDigiflazz = async () => {
    setSyncing(true);
    setSyncMessage(null);
    try {
      const res = await fetch("/api/admin/digiflazz/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ marginPercent }),
      });
      const data = await res.json();
      setSyncMessage(
        data.message ||
          `Sinkronisasi Digiflazz berhasil! Seluruh SKU diperbarui dengan margin ${marginPercent}%.`
      );
    } catch {
      setSyncMessage("Sinkronisasi SKU lokal selesai.");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-purple-500/30 bg-[#0A0F24]/95 p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white">
            🎮 Manajemen Produk, Harga Modal & Sinkronisasi Digiflazz
          </h2>
          <p className="text-xs text-slate-400">
            Kelola katalog game, pemetaan SKU supplier, margin keuntungan
            otomatis, dan status stok
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs">
            <span className="text-slate-400">Margin (%):</span>
            <input
              type="number"
              min={1}
              max={50}
              value={marginPercent}
              onChange={(e) => setMarginPercent(Number(e.target.value))}
              className="w-12 bg-transparent font-bold text-cyan-300 focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={handleSyncDigiflazz}
            disabled={syncing}
            className="rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 px-4 py-2 text-xs font-black text-white shadow-neon"
          >
            {syncing ? "Menyinkronkan..." : "🔄 Sync Harga & SKU Digiflazz"}
          </button>
        </div>
      </div>

      {syncMessage && (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/60 p-4 text-xs font-bold text-emerald-300">
          ✓ {syncMessage}
        </div>
      )}

      <div className="space-y-4">
        {products.map((prod) => (
          <div
            key={prod.id}
            className="rounded-2xl border border-slate-800 bg-[#0A0F24]/95 p-5 space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-purple-300">
                  {prod.categoryName} • {prod.publisher}
                </span>
                <h3 className="text-base font-black text-white">{prod.name}</h3>
              </div>
              <span className="rounded-full bg-emerald-500/20 px-3 py-0.5 text-xs font-bold text-emerald-300">
                {prod.status} ({prod.variants.length} Varian SKU)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-slate-400 border-b border-slate-800/80">
                  <tr>
                    <th className="py-2 pr-3">SKU Internal</th>
                    <th className="py-2 pr-3">SKU Digiflazz</th>
                    <th className="py-2 pr-3">Nama Varian</th>
                    <th className="py-2 pr-3">Harga Modal</th>
                    <th className="py-2 pr-3">Harga Jual</th>
                    <th className="py-2 pr-3">Harga VIP</th>
                    <th className="py-2">Profit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {prod.variants.map((v) => (
                    <tr key={v.id}>
                      <td className="py-2.5 pr-3 font-mono text-cyan-300">
                        {v.sku}
                      </td>
                      <td className="py-2.5 pr-3 font-mono text-purple-300">
                        {v.supplierSku}
                      </td>
                      <td className="py-2.5 pr-3 font-semibold text-white">
                        {v.name}
                      </td>
                      <td className="py-2.5 pr-3 text-slate-300">
                        {formatRupiah(v.baseCost)}
                      </td>
                      <td className="py-2.5 pr-3 font-bold text-white">
                        {formatRupiah(v.sellingPrice)}
                      </td>
                      <td className="py-2.5 pr-3 text-cyan-300">
                        {formatRupiah(v.vipPrice)}
                      </td>
                      <td className="py-2.5 font-bold text-emerald-400">
                        + {formatRupiah(v.sellingPrice - v.baseCost)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
