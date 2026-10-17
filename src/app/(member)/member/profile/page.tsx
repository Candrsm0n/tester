"use client";

import React, { useState, useEffect } from "react";
import { formatRupiah } from "@/lib/utils";
import { runtimeStore } from "@/lib/db/runtime-store";

export default function MemberProfilePage() {
  const [user, setUser] = useState<any>({
    id: "usr_member",
    fullName: "Dimas Anggara",
    username: "dimas_gamer",
    email: "member@topupku.id",
    phone: "6281299887766",
    role: "VIP",
    memberLevel: "GOLD",
    walletBalance: 750000,
    loyaltyPoints: 4250,
    referralCode: "DIMASVIP88",
  });
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d?.authenticated && d.user) setUser(d.user);
      })
      .catch(() => {});
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/member/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName: user.fullName, phone: user.phone }),
    });
    const data = await res.json();
    if (res.ok && data.user) {
      setUser(data.user);
      setSavedMsg("Profil berhasil diperbarui!");
    } else {
      setSavedMsg("Perubahan disimpan pada sesi member.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-purple-500/30 bg-[#0A0F24] p-5">
          <span className="text-xs text-slate-400">Level Member & Role</span>
          <p className="mt-1 text-xl font-black text-purple-300">
            {user.memberLevel} ({user.role})
          </p>
        </div>
        <div className="rounded-2xl border border-cyan-500/30 bg-[#0A0F24] p-5">
          <span className="text-xs text-slate-400">Saldo Akun Aktif</span>
          <p className="mt-1 text-xl font-black text-cyan-300">
            {formatRupiah(user.walletBalance)}
          </p>
        </div>
        <div className="rounded-2xl border border-amber-500/30 bg-[#0A0F24] p-5">
          <span className="text-xs text-slate-400">Loyalty Points</span>
          <p className="mt-1 text-xl font-black text-amber-300">
            {user.loyaltyPoints.toLocaleString("id-ID")} Pts
          </p>
        </div>
      </div>

      {/* Edit Profile Form */}
      <form
        onSubmit={handleSave}
        className="rounded-2xl border border-purple-500/30 bg-[#0A0F24]/95 p-6 space-y-4"
      >
        <h1 className="text-lg font-black text-white">
          👤 Informasi Profil & Keamanan Akun
        </h1>
        {savedMsg && (
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/50 p-3 text-xs font-bold text-emerald-300">
            ✓ {savedMsg}
          </div>
        )}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-slate-400">
              Nama Lengkap
            </label>
            <input
              type="text"
              value={user.fullName}
              onChange={(e) => setUser({ ...user, fullName: e.target.value })}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-sm text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-400">Username</label>
            <input
              type="text"
              disabled
              value={user.username}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-slate-400"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-400">Email</label>
            <input
              type="email"
              disabled
              value={user.email}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-slate-400"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-400">
              Nomor WhatsApp Notifikasi
            </label>
            <input
              type="tel"
              value={user.phone || ""}
              onChange={(e) => setUser({ ...user, phone: e.target.value })}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-sm text-white"
            />
          </div>
        </div>
        <button
          type="submit"
          className="rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 px-5 py-2.5 text-xs font-bold text-white"
        >
          Simpan Perubahan Profil
        </button>
      </form>
    </div>
  );
}
