import React from "react";
import { runtimeStore } from "@/lib/db/runtime-store";
import { formatRupiah } from "@/lib/utils";

export default function AdminUsersPage() {
  const users = Array.from(runtimeStore.users.values());

  return (
    <div className="rounded-2xl border border-purple-500/30 bg-[#0A0F24]/95 p-6 space-y-5">
      <div>
        <h2 className="text-xl font-black text-white">
          👥 Manajemen Pengguna, Level Member & Role RBAC
        </h2>
        <p className="text-xs text-slate-400">
          Daftar akun member, VIP, reseller, administrator, dan superadmin
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-800 text-slate-400">
            <tr>
              <th className="py-3 pr-3">Nama & Username</th>
              <th className="py-3 pr-3">Email & WhatsApp</th>
              <th className="py-3 pr-3">Role Sistem</th>
              <th className="py-3 pr-3">Level Member</th>
              <th className="py-3 pr-3">Saldo Dompet</th>
              <th className="py-3 pr-3">Loyalty Points</th>
              <th className="py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/70">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="py-3.5 pr-3">
                  <strong className="text-white block">{u.fullName}</strong>
                  <span className="text-cyan-400">@{u.username}</span>
                </td>
                <td className="py-3.5 pr-3">
                  <span className="text-slate-200 block">{u.email}</span>
                  <span className="text-slate-400">{u.phone}</span>
                </td>
                <td className="py-3.5 pr-3">
                  <span className="rounded bg-purple-500/20 px-2.5 py-0.5 font-bold text-purple-300">
                    {u.role}
                  </span>
                </td>
                <td className="py-3.5 pr-3 font-bold text-amber-300">
                  {u.memberLevel}
                </td>
                <td className="py-3.5 pr-3 font-bold text-cyan-300">
                  {formatRupiah(u.walletBalance)}
                </td>
                <td className="py-3.5 pr-3 text-slate-300">
                  {u.loyaltyPoints.toLocaleString("id-ID")} Pts
                </td>
                <td className="py-3.5">
                  <span className="rounded bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300">
                    {u.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
