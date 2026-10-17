"use client";

import React, { useState } from "react";
import { runtimeStore } from "@/lib/db/runtime-store";

export default function AdminWebsiteSettingsPage() {
  const [siteName, setSiteName] = useState(
    runtimeStore.websiteSettings.SITE_NAME || "TOPUPKU"
  );
  const [seoTitle, setSeoTitle] = useState(
    runtimeStore.websiteSettings.SEO_TITLE || ""
  );
  const [maintenanceMode, setMaintenanceMode] = useState(
    runtimeStore.websiteSettings.MAINTENANCE_MODE === "true"
  );
  const [saved, setSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        SITE_NAME: siteName,
        SEO_TITLE: seoTitle,
        MAINTENANCE_MODE: String(maintenanceMode),
      }),
    });
    setSaved(true);
  };

  return (
    <div className="rounded-2xl border border-purple-500/30 bg-[#0A0F24]/95 p-6 space-y-6">
      <div>
        <h2 className="text-xl font-black text-white">
          🌐 Manajemen Identitas Website, SEO, Banner & Maintenance Mode
        </h2>
        <p className="text-xs text-slate-400">
          Atur metadata SEO, pengumuman promo, dan sakelar mode pemeliharaan
        </p>
      </div>

      {saved && (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/60 p-3.5 text-xs font-bold text-emerald-300">
          ✓ Konfigurasi website berhasil diperbarui dan dicatat di Audit Log!
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-300">
            Nama Resmi Website
          </label>
          <input
            type="text"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-300">
            Judul Utama SEO (Meta Title)
          </label>
          <input
            type="text"
            value={seoTitle}
            onChange={(e) => setSeoTitle(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white"
          />
        </div>
        <div className="flex items-center gap-3 pt-2">
          <input
            id="maint"
            type="checkbox"
            checked={maintenanceMode}
            onChange={(e) => setMaintenanceMode(e.target.checked)}
            className="h-4 w-4 rounded border-slate-700"
          />
          <label htmlFor="maint" className="text-xs font-bold text-amber-300">
            Aktifkan Maintenance Mode (Hanya Admin yang dapat mengakses transaksi)
          </label>
        </div>

        <button
          type="submit"
          className="rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 px-5 py-2.5 text-xs font-black text-white"
        >
          Simpan Pengaturan Website
        </button>
      </form>
    </div>
  );
}
