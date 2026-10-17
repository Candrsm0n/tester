import React from "react";
import { runtimeStore } from "@/lib/db/runtime-store";
import { formatJakartaDateTime } from "@/lib/utils";

export default function AdminSecurityPage() {
  const logs = runtimeStore.auditLogs;

  return (
    <div className="rounded-2xl border border-purple-500/30 bg-[#0A0F24]/95 p-6 space-y-5">
      <div>
        <h2 className="text-xl font-black text-white">
          🛡️ Keamanan Admin, RBAC & Audit Logs
        </h2>
        <p className="text-xs text-slate-400">
          Rekam jejak seluruh perubahan sensitif yang dilakukan oleh Admin dan
          Superadmin
        </p>
      </div>

      <div className="space-y-3">
        {logs.map((log) => (
          <div
            key={log.id}
            className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 text-xs space-y-1"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-cyan-300">
                [{log.module}] {log.action}
              </span>
              <span className="text-slate-400">
                {formatJakartaDateTime(log.createdAt)}
              </span>
            </div>
            <p className="text-slate-300">
              Pelaku: <strong>{log.actorEmail}</strong> ({log.actorRole})
            </p>
            <pre className="mt-2 overflow-x-auto rounded bg-slate-950 p-2 text-[11px] text-slate-400">
              {JSON.stringify(log.details, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}
