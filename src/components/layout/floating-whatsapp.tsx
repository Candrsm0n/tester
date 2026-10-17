"use client";

import React from "react";

export function FloatingWhatsApp() {
  const csNumber =
    process.env.NEXT_PUBLIC_WHATSAPP_CS || "6281234567890";
  const message = encodeURIComponent(
    "Halo CS TOPUPKU, saya membutuhkan bantuan terkait transaksi top up game."
  );

  return (
    <a
      href={`https://wa.me/${csNumber}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Hubungi CS WhatsApp TOPUPKU"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3 text-xs font-bold text-slate-950 shadow-lg shadow-emerald-500/30 transition-transform hover:scale-105"
    >
      <span className="text-base">💬</span>
      <span className="hidden sm:inline">CS WhatsApp 24/7</span>
    </a>
  );
}
