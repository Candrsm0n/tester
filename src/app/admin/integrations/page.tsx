import React from "react";
import { ENV_CONFIG, getAppMode, maskSecret } from "@/config/env";

export default function AdminIntegrationsPage() {
  const mode = getAppMode();

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-purple-500/30 bg-[#0A0F24]/95 p-6 space-y-3">
        <h2 className="text-xl font-black text-white">
          🔌 Pengaturan Integrasi Payment Gateway, Supplier & Notifikasi
        </h2>
        <p className="text-xs text-slate-400">
          Demi keamanan tingkat tinggi, seluruh API Secret dan Server Key
          disimpan di environment server dan ditampilkan dalam format ter-masking
          (tidak pernah dikirim utuh ke browser).
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* Midtrans Card */}
        <div className="rounded-2xl border border-cyan-500/30 bg-[#0A0F24] p-5 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-white">
              1. Midtrans Payment Gateway (QRIS)
            </h3>
            <span className="rounded bg-cyan-500/20 px-2 py-0.5 font-bold text-cyan-300">
              {ENV_CONFIG.midtrans.isProduction ? "PRODUCTION" : "SANDBOX / DEMO"}
            </span>
          </div>
          <div className="space-y-1.5 text-slate-300">
            <p>
              Merchant ID: <strong>{ENV_CONFIG.midtrans.merchantId}</strong>
            </p>
            <p>
              Client Key:{" "}
              <code className="text-cyan-300">
                {maskSecret(ENV_CONFIG.midtrans.clientKey)}
              </code>
            </p>
            <p>
              Server Key (Masked):{" "}
              <code className="text-amber-300">
                {maskSecret(ENV_CONFIG.midtrans.serverKey)}
              </code>
            </p>
            <p>
              Webhook Endpoint:{" "}
              <code className="text-purple-300">
                {ENV_CONFIG.appUrl}/api/webhooks/midtrans
              </code>
            </p>
          </div>
        </div>

        {/* Digiflazz Card */}
        <div className="rounded-2xl border border-purple-500/30 bg-[#0A0F24] p-5 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-white">
              2. Digiflazz H2H Supplier API
            </h3>
            <span className="rounded bg-purple-500/20 px-2 py-0.5 font-bold text-purple-300">
              {mode}
            </span>
          </div>
          <div className="space-y-1.5 text-slate-300">
            <p>
              Username:{" "}
              <strong>
                {ENV_CONFIG.digiflazz.username || "demo_digiflazz"}
              </strong>
            </p>
            <p>
              API Key (Masked):{" "}
              <code className="text-amber-300">
                {maskSecret(ENV_CONFIG.digiflazz.apiKey)}
              </code>
            </p>
            <p>
              Webhook Secret (Masked):{" "}
              <code className="text-amber-300">
                {maskSecret(ENV_CONFIG.digiflazz.webhookSecret)}
              </code>
            </p>
            <p>
              Webhook Endpoint:{" "}
              <code className="text-purple-300">
                {ENV_CONFIG.appUrl}/api/webhooks/digiflazz
              </code>
            </p>
          </div>
        </div>

        {/* WhatsApp API Card */}
        <div className="rounded-2xl border border-emerald-500/30 bg-[#0A0F24] p-5 space-y-3 text-xs">
          <h3 className="text-sm font-black text-white">
            3. WhatsApp Notification Gateway
          </h3>
          <p className="text-slate-300">
            Provider: <strong>{ENV_CONFIG.whatsapp.provider.toUpperCase()}</strong>
          </p>
          <p className="text-slate-300">
            Token API (Masked):{" "}
            <code className="text-amber-300">
              {maskSecret(ENV_CONFIG.whatsapp.apiToken)}
            </code>
          </p>
          <p className="text-slate-400">
            Status: Graceful fallback aktif (sistem tetap berjalan lancar meski
            token belum diisi).
          </p>
        </div>

        {/* SMTP Email Card */}
        <div className="rounded-2xl border border-blue-500/30 bg-[#0A0F24] p-5 space-y-3 text-xs">
          <h3 className="text-sm font-black text-white">
            4. Email SMTP Transaksional
          </h3>
          <p className="text-slate-300">
            Host: <strong>{ENV_CONFIG.smtp.host}:{ENV_CONFIG.smtp.port}</strong>
          </p>
          <p className="text-slate-300">
            Pengirim: <strong>{ENV_CONFIG.smtp.from}</strong>
          </p>
          <p className="text-slate-300">
            Password SMTP (Masked):{" "}
            <code className="text-amber-300">
              {maskSecret(ENV_CONFIG.smtp.pass)}
            </code>
          </p>
        </div>
      </div>
    </div>
  );
}
