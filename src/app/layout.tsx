import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { FloatingWhatsApp } from "@/components/layout/floating-whatsapp";

export const metadata: Metadata = {
  title: {
    default: "TOPUPKU — Platform Top Up Game & Produk Digital Instan #1 Indonesia",
    template: "%s | TOPUPKU Official Store",
  },
  description:
    "Top up Diamond Mobile Legends, Free Fire, PUBG Mobile, Honor of Kings, Genshin Impact, Valorant, Roblox, Pulsa, Paket Data & Token PLN otomatis 24 jam via QRIS Dinamis.",
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "TOPUPKU",
    title: "TOPUPKU — Top Up Game & Produk Digital Instan 24 Jam",
    description:
      "Platform top up game profesional dengan pembayaran QRIS Dinamis Midtrans & pengiriman otomatis 1-3 detik via Digiflazz.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="dark">
      <body className="min-h-screen flex flex-col bg-[#050814] text-slate-100 antialiased selection:bg-purple-600 selection:text-white">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
        <Footer />
        <FloatingWhatsApp />
      </body>
    </html>
  );
}
