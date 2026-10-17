"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { formatRupiah } from "@/lib/utils";
import type { ProductDTO, ProductVariantDTO } from "@/types";

export function GameCheckoutClient({ product }: { product: ProductDTO }) {
  const router = useRouter();
  const [gameUserId, setGameUserId] = useState("");
  const [gameZoneId, setGameZoneId] = useState("");
  const [playerNickname, setPlayerNickname] = useState<string | null>(null);
  const [checkingPlayer, setCheckingPlayer] = useState(false);

  const [selectedVariant, setSelectedVariant] = useState<ProductVariantDTO>(
    product.variants[0]
  );
  const [paymentMethod, setPaymentMethod] = useState<
    "QRIS_DYNAMIC" | "WALLET_BALANCE"
  >("QRIS_DYNAMIC");
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherDiscount, setVoucherDiscount] = useState(0);
  const [voucherCashback, setVoucherCashback] = useState(0);
  const [voucherMessage, setVoucherMessage] = useState<string | null>(null);

  const [customerWhatsapp, setCustomerWhatsapp] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const activeUnitPrice =
    selectedVariant?.isFlashSale && selectedVariant?.flashSalePrice
      ? selectedVariant.flashSalePrice
      : selectedVariant?.sellingPrice || 0;

  const estimatedTotal = Math.max(1000, activeUnitPrice - voucherDiscount);

  const handleCheckPlayerId = async () => {
    if (!gameUserId.trim()) {
      setErrorMessage("Masukkan User ID terlebih dahulu untuk cek nickname.");
      return;
    }
    setCheckingPlayer(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/check-player", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productSlug: product.slug,
          gameUserId,
          gameZoneId,
        }),
      });
      const data = await res.json();
      if (data.valid) {
        setPlayerNickname(data.nickname);
      } else {
        setErrorMessage(data.error || "User ID tidak ditemukan.");
      }
    } catch {
      setErrorMessage("Gagal memverifikasi Player ID.");
    } finally {
      setCheckingPlayer(false);
    }
  };

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim() || !selectedVariant) return;
    setVoucherMessage(null);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/vouchers/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productSlug: product.slug,
          variantId: selectedVariant.id,
          voucherCode: voucherCode.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.valid) {
        setVoucherDiscount(0);
        setVoucherCashback(0);
        setErrorMessage(data.error || "Kode promo tidak valid.");
        return;
      }
      setVoucherDiscount(data.breakdown.discountAmount || 0);
      setVoucherCashback(data.breakdown.cashbackAmount || 0);
      setVoucherMessage(
        data.breakdown.discountAmount > 0
          ? `Voucher diterapkan! Hemat ${formatRupiah(data.breakdown.discountAmount)}`
          : `Voucher Cashback ${formatRupiah(data.breakdown.cashbackAmount)} aktif!`
      );
    } catch {
      setErrorMessage("Gagal memvalidasi kode promo.");
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!gameUserId.trim()) {
      setErrorMessage(`${product.userIdLabel} wajib diisi.`);
      return;
    }
    if (product.requiresZoneId && !gameZoneId.trim()) {
      setErrorMessage(`${product.zoneIdLabel || "Zone ID"} wajib diisi.`);
      return;
    }
    if (!customerWhatsapp.trim() || customerWhatsapp.trim().length < 9) {
      setErrorMessage("Nomor WhatsApp aktif wajib diisi untuk pengiriman bukti & SN.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productSlug: product.slug,
          variantId: selectedVariant.id,
          gameUserId: gameUserId.trim(),
          gameZoneId: gameZoneId.trim() || undefined,
          paymentMethod,
          voucherCode: voucherCode.trim() || undefined,
          customerWhatsapp: customerWhatsapp.trim(),
          customerEmail: customerEmail.trim() || "pelanggan@topupku.id",
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.order) {
        setErrorMessage(data.error || "Gagal membuat pesanan.");
        setSubmitting(false);
        return;
      }
      router.push(`/invoice/${data.order.invoiceNumber}`);
    } catch {
      setErrorMessage("Terjadi kesalahan jaringan. Silakan coba kembali.");
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      {/* Left Info Panel */}
      <div className="space-y-6 lg:col-span-1">
        <div className="rounded-2xl border border-purple-500/30 bg-[#0A0F24]/90 p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-cyan-500 text-2xl font-black text-white shadow-neon">
              {product.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <span className="rounded-md bg-purple-500/20 px-2 py-0.5 text-xs font-semibold text-purple-300">
                {product.publisher}
              </span>
              <h1 className="mt-1 text-xl font-black text-white">
                {product.name}
              </h1>
              <p className="text-xs text-cyan-400">⚡ {product.subtitle}</p>
            </div>
          </div>

          <p className="text-sm leading-relaxed text-slate-300">
            {product.description}
          </p>

          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 text-xs text-slate-300 space-y-1.5">
            <p className="font-bold text-white">📌 Petunjuk Pengisian:</p>
            <p>{product.instructionText}</p>
          </div>
        </div>
      </div>

      {/* Right Interactive 5-Step Checkout Form */}
      <form
        onSubmit={handleCreateOrder}
        className="space-y-6 lg:col-span-2"
      >
        {errorMessage && (
          <div className="rounded-xl border border-rose-500/50 bg-rose-950/60 p-4 text-sm font-medium text-rose-200">
            ⚠️ {errorMessage}
          </div>
        )}

        {/* STEP 1: Masukkan User ID & Zone ID */}
        <section className="rounded-2xl border border-purple-500/25 bg-[#0A0F24]/90 p-6">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-600 text-xs font-black text-white">
              1
            </span>
            <h2 className="text-base font-bold text-white">
              Masukkan Data Akun {product.name}
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                {product.userIdLabel} *
              </label>
              <input
                type="text"
                required
                value={gameUserId}
                onChange={(e) => setGameUserId(e.target.value)}
                placeholder={product.userIdPlaceholder}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none"
              />
            </div>

            {product.requiresZoneId && (
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                  {product.zoneIdLabel || "Zone ID"} *
                </label>
                <input
                  type="text"
                  required
                  value={gameZoneId}
                  onChange={(e) => setGameZoneId(e.target.value)}
                  placeholder={product.zoneIdPlaceholder || "Masukkan Zone ID"}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>
            )}
          </div>

          {product.supportsIdCheck && (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleCheckPlayerId}
                disabled={checkingPlayer}
                className="rounded-xl border border-cyan-500/40 bg-cyan-500/15 px-4 py-2 text-xs font-bold text-cyan-300 hover:bg-cyan-500/25"
              >
                {checkingPlayer ? "Memeriksa ID..." : "🔍 Cek Nickname Akun"}
              </button>
              {playerNickname && (
                <span className="rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-3 py-1.5 text-xs font-bold text-emerald-300">
                  ✓ Nickname Terverifikasi: {playerNickname}
                </span>
              )}
            </div>
          )}
        </section>

        {/* STEP 2: Pilih Nominal Diamond / Item */}
        <section className="rounded-2xl border border-purple-500/25 bg-[#0A0F24]/90 p-6">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-600 text-xs font-black text-white">
              2
            </span>
            <h2 className="text-base font-bold text-white">
              Pilih Nominal Top Up
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
            {product.variants.map((v) => {
              const isSelected = selectedVariant?.id === v.id;
              const price =
                v.isFlashSale && v.flashSalePrice
                  ? v.flashSalePrice
                  : v.sellingPrice;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedVariant(v)}
                  className={`flex flex-col justify-between rounded-xl border p-4 text-left transition-all ${
                    isSelected
                      ? "border-cyan-400 bg-purple-950/60 shadow-neon"
                      : "border-slate-800 bg-slate-900/70 hover:border-purple-500/50"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-white">
                        {v.name}
                      </span>
                      {v.isFlashSale && (
                        <span className="rounded bg-rose-500/20 px-1.5 py-0.5 text-[10px] font-bold text-rose-300">
                          FLASH
                        </span>
                      )}
                    </div>
                    {v.bonusText && (
                      <span className="mt-1 block text-[11px] text-cyan-400">
                        {v.bonusText}
                      </span>
                    )}
                  </div>
                  <div className="mt-3 border-t border-slate-800/80 pt-2">
                    {v.isFlashSale && v.flashSalePrice && (
                      <span className="block text-[10px] text-slate-500 line-through">
                        {formatRupiah(v.sellingPrice)}
                      </span>
                    )}
                    <span className="text-sm font-black text-cyan-300">
                      {formatRupiah(price)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* STEP 3: Pilih Metode Pembayaran */}
        <section className="rounded-2xl border border-purple-500/25 bg-[#0A0F24]/90 p-6">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-600 text-xs font-black text-white">
              3
            </span>
            <h2 className="text-base font-bold text-white">
              Pilih Metode Pembayaran
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setPaymentMethod("QRIS_DYNAMIC")}
              className={`flex items-center justify-between rounded-xl border p-4 text-left ${
                paymentMethod === "QRIS_DYNAMIC"
                  ? "border-cyan-400 bg-purple-950/50 shadow-neon"
                  : "border-slate-800 bg-slate-900/70"
              }`}
            >
              <div>
                <p className="text-sm font-bold text-white">
                  QRIS Dinamis Otomatis (Midtrans)
                </p>
                <p className="text-xs text-slate-400">
                  GoPay, DANA, OVO, ShopeePay, BCA, Mandiri, BRI, BNI
                </p>
              </div>
              <span className="text-sm font-black text-cyan-300">
                {formatRupiah(estimatedTotal)}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod("WALLET_BALANCE")}
              className={`flex items-center justify-between rounded-xl border p-4 text-left ${
                paymentMethod === "WALLET_BALANCE"
                  ? "border-cyan-400 bg-purple-950/50 shadow-neon"
                  : "border-slate-800 bg-slate-900/70"
              }`}
            >
              <div>
                <p className="text-sm font-bold text-white">
                  Saldo Member TOPUPKU
                </p>
                <p className="text-xs text-slate-400">
                  Potong saldo instan tanpa antre (Khusus Member Login)
                </p>
              </div>
              <span className="text-sm font-black text-purple-300">
                {formatRupiah(estimatedTotal)}
              </span>
            </button>
          </div>
        </section>

        {/* STEP 4: Kode Promo / Voucher */}
        <section className="rounded-2xl border border-purple-500/25 bg-[#0A0F24]/90 p-6">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-600 text-xs font-black text-white">
              4
            </span>
            <h2 className="text-base font-bold text-white">
              Kode Promo / Voucher (Opsional)
            </h2>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
              placeholder="Contoh: TOPUPKU10 atau HEMAT5K"
              className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm uppercase text-white focus:border-cyan-400 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleApplyVoucher}
              className="rounded-xl border border-purple-500/50 bg-purple-600/25 px-5 py-2.5 text-xs font-bold text-purple-200 hover:bg-purple-600/40"
            >
              Gunakan
            </button>
          </div>
          {voucherMessage && (
            <p className="mt-2 text-xs font-semibold text-emerald-400">
              ✓ {voucherMessage}
            </p>
          )}
        </section>

        {/* STEP 5: Kontak WhatsApp & Konfirmasi Pesanan */}
        <section className="rounded-2xl border border-purple-500/25 bg-[#0A0F24]/90 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-600 text-xs font-black text-white">
              5
            </span>
            <h2 className="text-base font-bold text-white">
              Kontak Notifikasi & Rincian Pembayaran
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                Nomor WhatsApp Aktif (Wajib) *
              </label>
              <input
                type="tel"
                required
                value={customerWhatsapp}
                onChange={(e) => setCustomerWhatsapp(e.target.value)}
                placeholder="Contoh: 081234567890"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                Email Bukti Transaksi
              </label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="email@domain.com"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Payment Breakdown Box */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Item Dipilih</span>
              <span className="font-semibold text-white">
                {selectedVariant?.name} ({selectedVariant?.sku})
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Harga Produk</span>
              <span>{formatRupiah(activeUnitPrice)}</span>
            </div>
            {voucherDiscount > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Diskon Voucher ({voucherCode})</span>
                <span>- {formatRupiah(voucherDiscount)}</span>
              </div>
            )}
            {voucherCashback > 0 && (
              <div className="flex justify-between text-cyan-400">
                <span>Estimasi Cashback Saldo</span>
                <span>+ {formatRupiah(voucherCashback)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-slate-800 pt-2 text-sm font-black text-cyan-300">
              <span>Estimasi Total Bayar (Belum termasuk Kode Unik QRIS)</span>
              <span>{formatRupiah(estimatedTotal)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 py-4 text-sm font-black uppercase tracking-wider text-white shadow-neon hover:opacity-95 disabled:opacity-50"
          >
            {submitting
              ? "Membuat Pesanan & QRIS Dinamis..."
              : `⚡ Beli Sekarang — ${formatRupiah(estimatedTotal)}`}
          </button>
        </section>
      </form>
    </div>
  );
}
